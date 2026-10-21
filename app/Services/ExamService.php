<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\Exam;
use App\Models\Question;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class ExamService
{
    public function list(?string $search = null, int $perPage = 15, bool $withQuestions = false): LengthAwarePaginator
    {
        return Exam::query()
            ->withCount('questions')
            ->when($withQuestions, fn ($query) => $query->with('questions.options'))
            ->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Invalidate cached exam lists without flushing unrelated cache entries.
     * Question/option mutations also call this because the admin list embeds
     * questions and counts.
     */
    public function bumpListCacheVersion(): void
    {
        Cache::forever('exams_cache_version', (int) Cache::get('exams_cache_version', 1) + 1);
    }

    public function create(array $data): Exam
    {
        return Exam::create($data);
    }

    public function find(int $id): Exam
    {
        return Exam::with('questions.options')->findOrFail($id);
    }

    public function update(Exam $exam, array $data): Exam
    {
        $exam->update($data);

        return $exam->fresh();
    }

    public function delete(Exam $exam): void
    {
        $exam->delete();
    }

    /**
     * Start a new attempt for a student, snapshotting shuffled questions without answers.
     *
     * Each student may only have ONE in-progress attempt per exam. If an
     * existing active attempt is found, it is returned instead of creating a
     * duplicate. Attempts whose time has already expired are auto-completed
     * before the check so they do not block a fresh start.
     */
    public function startAttempt(Exam $exam, int $userId): Attempt
    {
        $exam->loadMissing(['questions.options']);

        // Check for an existing in-progress attempt and return it if still valid
        $existing = Attempt::where('user_id', $userId)
            ->where('exam_id', $exam->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existing) {
            // Auto-expire if time ran out while the student was away
            $rawStart = $existing->start_time ?? $existing->started_at ?? Carbon::now();
            $startTime = $rawStart instanceof Carbon ? $rawStart : Carbon::parse($rawStart);
            $deadline = $startTime->copy()->addMinutes($exam->duration_minutes);

            if (Carbon::now()->greaterThan($deadline)) {
                $existing->update([
                    'status' => 'completed',
                    'end_time' => $deadline,
                    'submitted_at' => $deadline,
                ]);
                // Fall through to create a new attempt
            } else {
                return $existing;
            }
        }

        // Shuffle questions
        $shuffledQuestions = $exam->questions->shuffle()->values();

        $questionsSnapshot = $shuffledQuestions->map(function (Question $question) {
            // Shuffle options and remove correct answer flag
            $shuffledOptions = $question->options->shuffle()->values();

            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'type' => $question->type,
                'points' => $question->points,
                'options' => $shuffledOptions->map(fn ($option) => [
                    'id' => $option->id,
                    'option_text' => $option->option_text,
                ])->toArray(),
            ];
        })->toArray();

        $now = Carbon::now();

        return Attempt::create([
            'user_id' => $userId,
            'exam_id' => $exam->id,
            'questions' => $questionsSnapshot,
            'submitted_answers' => [],
            'answers' => [],
            'score' => 0,
            'total_points' => (float) $exam->questions->sum('points'),
            'percentage' => 0,
            'is_passed' => false,
            'status' => 'in_progress',
            'start_time' => $now,
            'started_at' => $now,
        ]);
    }

    /**
     * Grade attempt server-side and verify timeout limit.
     */
    public function gradeAttempt(Attempt $attempt, array $submittedAnswers): array
    {
        $exam = Exam::with(['questions.options'])->findOrFail($attempt->exam_id);

        $now = Carbon::now();
        $rawStart = $attempt->start_time ?? $attempt->started_at ?? $now;
        $startTime = $rawStart instanceof Carbon ? $rawStart : Carbon::parse($rawStart);
        $deadline = $startTime->copy()->addMinutes($exam->duration_minutes)->addSeconds(10); // 10s grace period

        if ($now->greaterThan($deadline)) {
            throw ValidationException::withMessages([
                'time_limit' => ['Exam submission time limit exceeded. Attempt rejected.'],
            ]);
        }

        // Normalize submitted answers: supports key-value [qId => optId] or array of objects [['question_id' => ..., 'option_id' => ...]]
        $normalizedAnswers = [];
        foreach ($submittedAnswers as $key => $val) {
            if (is_array($val) && isset($val['question_id'])) {
                $normalizedAnswers[$val['question_id']] = $val['option_id'] ?? $val['selected_option_id'] ?? null;
            } else {
                $normalizedAnswers[$key] = $val;
            }
        }

        $questions = $exam->questions->keyBy('id');
        $totalPoints = (float) $questions->sum('points');
        $score = 0.0;
        $wrongQuestions = [];
        $correctAnswers = [];

        foreach ($questions as $questionId => $question) {
            $correctOption = $question->options->firstWhere('is_correct', true);
            $correctOptionId = $correctOption ? $correctOption->id : null;
            $correctAnswers[$questionId] = $correctOptionId;

            $selectedOptionId = $normalizedAnswers[$questionId] ?? null;

            if ($selectedOptionId !== null && (int) $selectedOptionId === (int) $correctOptionId) {
                $score += (float) $question->points;
            } else {
                $wrongQuestions[] = [
                    'question_id' => $questionId,
                    'question_text' => $question->question_text,
                    'selected_option_id' => $selectedOptionId,
                    'correct_option_id' => $correctOptionId,
                ];
            }
        }

        $percentage = $totalPoints > 0 ? ($score / $totalPoints) * 100 : 0;
        $isPassed = $percentage >= $exam->passing_score;

        $attempt->update([
            'score' => $score,
            'total_points' => $totalPoints,
            'percentage' => round($percentage, 2),
            'is_passed' => $isPassed,
            'submitted_answers' => $submittedAnswers,
            'answers' => $submittedAnswers,
            'wrong_questions' => $wrongQuestions,
            'end_time' => $now,
            'submitted_at' => $now,
            'status' => 'completed',
        ]);

        return [
            'attempt_id' => $attempt->id,
            'score' => $score,
            'total_points' => $totalPoints,
            'percentage' => round($percentage, 2),
            'is_passed' => $isPassed,
            'wrong_questions' => $wrongQuestions,
            'correct_answers' => $correctAnswers,
            'status' => 'completed',
        ];
    }

    /**
     * Get attempt results with wrong questions and correct answers.
     */
    public function getAttemptResult(Attempt $attempt): array
    {
        $exam = Exam::with(['questions.options'])->findOrFail($attempt->exam_id);
        $questions = $exam->questions->keyBy('id');

        $normalizedAnswers = [];
        $rawAnswers = $attempt->submitted_answers ?? $attempt->answers ?? [];
        foreach ($rawAnswers as $key => $val) {
            if (is_array($val) && isset($val['question_id'])) {
                $normalizedAnswers[$val['question_id']] = $val['option_id'] ?? $val['selected_option_id'] ?? null;
            } else {
                $normalizedAnswers[$key] = $val;
            }
        }

        $wrongQuestions = [];
        $correctAnswers = [];

        foreach ($questions as $questionId => $question) {
            $correctOption = $question->options->firstWhere('is_correct', true);
            $correctOptionId = $correctOption ? $correctOption->id : null;
            $correctAnswers[$questionId] = $correctOptionId;

            $selectedOptionId = $normalizedAnswers[$questionId] ?? null;

            if ($selectedOptionId === null || (int) $selectedOptionId !== (int) $correctOptionId) {
                $wrongQuestions[] = [
                    'question_id' => $questionId,
                    'question_text' => $question->question_text,
                    'selected_option_id' => $selectedOptionId,
                    'correct_option_id' => $correctOptionId,
                ];
            }
        }

        return [
            'attempt_id' => $attempt->id,
            'exam_id' => $attempt->exam_id,
            'score' => $attempt->score,
            'total_points' => $attempt->total_points,
            'percentage' => $attempt->percentage,
            'is_passed' => $attempt->is_passed,
            'status' => $attempt->status,
            'start_time' => $attempt->start_time ?? $attempt->started_at,
            'end_time' => $attempt->end_time ?? $attempt->submitted_at,
            'wrong_questions' => $wrongQuestions,
            'correct_answers' => $correctAnswers,
        ];
    }
}
