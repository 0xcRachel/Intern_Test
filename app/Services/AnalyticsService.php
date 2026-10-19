<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\Exam;
use App\Models\User;

class AnalyticsService
{
    public function getExamStatistics(int $examId): array
    {
        $exam = Exam::findOrFail($examId);

        if (extension_loaded('mongodb') && config('database.default') !== 'sqlite') {
            return $this->aggregateMongo($exam);
        }

        return $this->aggregateSqlFallback($exam);
    }

    protected function aggregateMongo(Exam $exam): array
    {
        $examId = $exam->id;

        // 1. Avg score, highest, lowest, total attempts
        $scoreStats = Attempt::raw(function ($collection) use ($examId) {
            return $collection->aggregate([
                ['$match' => ['exam_id' => (int) $examId, 'status' => 'completed']],
                ['$group' => [
                    '_id' => null,
                    'average_score' => ['$avg' => '$score'],
                    'highest_score' => ['$max' => '$score'],
                    'lowest_score' => ['$min' => '$score'],
                    'total_completed_attempts' => ['$sum' => 1],
                ]],
            ]);
        })->toArray();

        $firstStat = $scoreStats[0] ?? null;
        $averageScore = $firstStat ? round((float) $firstStat['average_score'], 2) : 0.0;
        $totalAttempts = $firstStat ? (int) $firstStat['total_completed_attempts'] : 0;
        $highestScore = $firstStat ? (float) $firstStat['highest_score'] : 0.0;
        $lowestScore = $firstStat ? (float) $firstStat['lowest_score'] : 0.0;

        // 2. Top 10 students
        $topStudentsMongo = Attempt::raw(function ($collection) use ($examId) {
            return $collection->aggregate([
                ['$match' => ['exam_id' => (int) $examId, 'status' => 'completed']],
                ['$group' => [
                    '_id' => '$user_id',
                    'highest_score' => ['$max' => '$score'],
                    'avg_score' => ['$avg' => '$score'],
                    'attempts_count' => ['$sum' => 1],
                ]],
                ['$sort' => ['highest_score' => -1]],
                ['$limit' => 10],
            ]);
        })->toArray();

        $userIds = array_map(fn ($item) => (int) $item['_id'], $topStudentsMongo);
        $users = User::whereIn('id', $userIds)->pluck('name', 'id');

        $topStudents = array_map(function ($item) use ($users) {
            $userId = (int) $item['_id'];
            return [
                'user_id' => $userId,
                'user_name' => $users[$userId] ?? 'Unknown',
                'highest_score' => (float) $item['highest_score'],
                'avg_score' => round((float) $item['avg_score'], 2),
                'attempts_count' => (int) $item['attempts_count'],
            ];
        }, $topStudentsMongo);

        // 3. Most incorrectly answered questions
        $mostIncorrect = Attempt::raw(function ($collection) use ($examId) {
            return $collection->aggregate([
                ['$match' => ['exam_id' => (int) $examId, 'status' => 'completed']],
                ['$unwind' => '$wrong_questions'],
                ['$group' => [
                    '_id' => '$wrong_questions.question_id',
                    'question_text' => ['$first' => '$wrong_questions.question_text'],
                    'incorrect_count' => ['$sum' => 1],
                ]],
                ['$sort' => ['incorrect_count' => -1]],
                ['$limit' => 10],
            ]);
        })->toArray();

        $formattedIncorrect = array_map(function ($item) {
            return [
                'question_id' => (int) $item['_id'],
                'question_text' => $item['question_text'] ?? null,
                'incorrect_count' => (int) $item['incorrect_count'],
            ];
        }, $mostIncorrect);

        return [
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'total_completed_attempts' => $totalAttempts,
            'average_score' => $averageScore,
            'highest_score' => $highestScore,
            'lowest_score' => $lowestScore,
            'top_students' => $topStudents,
            'most_incorrect_questions' => $formattedIncorrect,
        ];
    }

    protected function aggregateSqlFallback(Exam $exam): array
    {
        $attempts = Attempt::where('exam_id', $exam->id)
            ->where('status', 'completed')
            ->get();

        $totalAttempts = $attempts->count();
        $averageScore = $totalAttempts > 0 ? round((float) $attempts->avg('score'), 2) : 0.0;
        $highestScore = $totalAttempts > 0 ? (float) $attempts->max('score') : 0.0;
        $lowestScore = $totalAttempts > 0 ? (float) $attempts->min('score') : 0.0;

        // Top 10 students
        $topStudentsRaw = $attempts->groupBy('user_id')->map(function ($userAttempts, $userId) {
            return [
                'user_id' => (int) $userId,
                'highest_score' => (float) $userAttempts->max('score'),
                'avg_score' => round((float) $userAttempts->avg('score'), 2),
                'attempts_count' => $userAttempts->count(),
            ];
        })->sortByDesc('highest_score')->take(10)->values();

        $userIds = $topStudentsRaw->pluck('user_id')->toArray();
        $users = User::whereIn('id', $userIds)->pluck('name', 'id');

        $topStudents = $topStudentsRaw->map(function ($item) use ($users) {
            $item['user_name'] = $users[$item['user_id']] ?? 'Unknown';
            return $item;
        })->toArray();

        // Most incorrectly answered questions
        $wrongMap = [];
        foreach ($attempts as $attempt) {
            $wrongQuestions = $attempt->wrong_questions ?? [];
            foreach ($wrongQuestions as $wq) {
                $qId = (int) ($wq['question_id'] ?? 0);
                if ($qId === 0) continue;

                if (! isset($wrongMap[$qId])) {
                    $wrongMap[$qId] = [
                        'question_id' => $qId,
                        'question_text' => $wq['question_text'] ?? null,
                        'incorrect_count' => 0,
                    ];
                }
                $wrongMap[$qId]['incorrect_count']++;
            }
        }

        uasort($wrongMap, fn ($a, $b) => $b['incorrect_count'] <=> $a['incorrect_count']);
        $mostIncorrect = array_values(array_slice($wrongMap, 0, 10));

        return [
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'total_completed_attempts' => $totalAttempts,
            'average_score' => $averageScore,
            'highest_score' => $highestScore,
            'lowest_score' => $lowestScore,
            'top_students' => $topStudents,
            'most_incorrect_questions' => $mostIncorrect,
        ];
    }
}
