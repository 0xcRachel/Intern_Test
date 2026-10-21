<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attempt;
use App\Models\Exam;
use App\Services\ExamService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttemptController extends Controller
{
    public function __construct(
        protected ExamService $examService
    ) {}

    /**
     * Start Exam API (POST /api/exams/{id}/attempts)
     */
    public function start(Request $request, int $id): JsonResponse
    {
        $exam = Exam::with(['questions.options'])->findOrFail($id);

        $attempt = $this->examService->startAttempt($exam, $request->user()->id);
        $deadline = Carbon::parse($attempt->start_time ?? now())->addMinutes((int) $exam->duration_minutes);

        return response()->json([
            'attempt_id' => $attempt->id,
            'id' => $attempt->id,
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'duration_minutes' => $exam->duration_minutes,
            'start_time' => $attempt->start_time,
            'remaining_seconds' => max(0, now()->diffInSeconds($deadline)),
            'questions' => $attempt->questions,
        ], $attempt->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Submit Exam API (POST /api/attempts/{id}/submit)
     */
    public function submit(Request $request, int|string $id): JsonResponse
    {
        $attempt = Attempt::findOrFail($id);

        abort_if(
            (int) $attempt->user_id !== (int) $request->user()->id,
            403,
            'Unauthorized. You can only submit your own attempt.'
        );

        abort_if(
            $attempt->status === 'completed',
            422,
            'This attempt has already been submitted.'
        );

        $validated = $request->validate([
            'answers' => ['sometimes', 'array'],
        ]);

        $answers = $validated['answers'] ?? [];

        $result = $this->examService->gradeAttempt($attempt, $answers);

        return response()->json($result);
    }

    /**
     * Result API (GET /api/attempts/{id})
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $attempt = Attempt::findOrFail($id);

        abort_if(
            (int) $attempt->user_id !== (int) $request->user()->id,
            403,
            'Unauthorized. You can only view your own attempt.'
        );

        $result = $this->examService->getAttemptResult($attempt);

        return response()->json($result);
    }

    /**
     * Autosave in-progress answers to Mongo instantly
     */
    public function autosave(Request $request, int|string $id): JsonResponse
    {
        $attempt = Attempt::findOrFail($id);

        abort_if(
            (int) $attempt->user_id !== (int) $request->user()->id,
            403,
            'Unauthorized. You can only save your own attempt.'
        );

        abort_if(
            $attempt->status === 'completed',
            422,
            'Cannot autosave on a completed attempt.'
        );

        $validated = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        $exam = Exam::findOrFail($attempt->exam_id);
        $startedAt = Carbon::parse($attempt->start_time ?? $attempt->started_at ?? now());
        $deadline = $startedAt->copy()->addMinutes((int) $exam->duration_minutes);
        abort_if(now()->greaterThanOrEqualTo($deadline), 422, 'This attempt has expired.');

        $allowedQuestionIds = collect($attempt->questions ?? [])->pluck('id')->map(fn ($id) => (string) $id)->flip();
        $incoming = collect($validated['answers'])->mapWithKeys(function ($answer, $key) {
            if (is_array($answer) && array_key_exists('question_id', $answer)) {
                return [(string) $answer['question_id'] => $answer['option_id'] ?? $answer['selected_option_id'] ?? null];
            }

            return [(string) $key => $answer];
        })->filter(fn ($option, $questionId) => $option !== null && $allowedQuestionIds->has((string) $questionId));
        $existing = collect($attempt->submitted_answers ?? $attempt->answers ?? [])->mapWithKeys(function ($answer, $key) {
            if (is_array($answer) && array_key_exists('question_id', $answer)) {
                return [(string) $answer['question_id'] => $answer['option_id'] ?? $answer['selected_option_id'] ?? null];
            }

            return [(string) $key => $answer];
        });
        foreach ($incoming as $questionId => $option) {
            $existing->put((string) $questionId, $option);
        }

        $answers = $existing
            ->map(fn ($option, $questionId) => [
                'question_id' => (int) $questionId,
                'option_id' => $option,
            ])
            ->values()
            ->all();

        $attempt->update(['submitted_answers' => $answers, 'answers' => $answers]);

        return response()->json([
            'message' => 'Answers autosaved successfully.',
            'attempt_id' => $attempt->id,
            'saved_at' => now(),
            'answers' => $answers,
        ]);
    }

    /**
     * Resume an in-progress attempt, returning questions, saved answers, and remaining time.
     *
     * If the server detects that the exam duration has elapsed since the
     * attempt started, the attempt is silently marked as completed so the
     * student cannot keep working past the deadline.
     */
    public function resume(Request $request, int|string $id): JsonResponse
    {
        $attempt = Attempt::findOrFail($id);

        abort_if(
            (int) $attempt->user_id !== (int) $request->user()->id,
            403,
            'Unauthorized. You can only view your own attempt.'
        );

        $exam = Exam::findOrFail($attempt->exam_id);
        $rawStart = $attempt->start_time ?? $attempt->started_at ?? now();
        $startTime = $rawStart instanceof Carbon ? $rawStart : Carbon::parse($rawStart);
        $deadline = $startTime->copy()->addMinutes($exam->duration_minutes);

        // Auto-expire if duration has passed while the student was offline
        if ($attempt->status === 'in_progress' && now()->greaterThan($deadline)) {
            $attempt->update([
                'status' => 'completed',
                'end_time' => $deadline,
                'submitted_at' => $deadline,
            ]);
            $attempt->refresh();
        }

        $remainingSeconds = now()->lt($deadline) ? (int) now()->diffInSeconds($deadline) : 0;

        return response()->json([
            'attempt_id' => $attempt->id,
            'exam_id' => $attempt->exam_id,
            'exam_title' => $exam->title,
            'status' => $attempt->status,
            'duration_minutes' => $exam->duration_minutes,
            'remaining_seconds' => $remainingSeconds,
            'questions' => $attempt->questions,
            'saved_answers' => $attempt->submitted_answers ?? $attempt->answers ?? [],
        ]);
    }
}
