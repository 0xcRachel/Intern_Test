<?php

namespace App\Services;

use App\Models\Question;
use Illuminate\Database\Eloquent\Collection;

class QuestionService
{
    public function listByExam(int $examId): Collection
    {
        return Question::with('options')
            ->where('exam_id', $examId)
            ->get();
    }

    public function create(array $data): Question
    {
        $question = Question::create([
            'exam_id' => $data['exam_id'],
            'question_text' => $data['question_text'],
            'type' => $data['type'] ?? 'single_choice',
            'points' => $data['points'] ?? 1,
        ]);

        if (! empty($data['options'])) {
            foreach ($data['options'] as $option) {
                $question->options()->create([
                    'option_text' => $option['option_text'],
                    'is_correct' => $option['is_correct'] ?? false,
                ]);
            }
        }

        return $question->load('options');
    }

    public function find(int $id): Question
    {
        return Question::with('options')->findOrFail($id);
    }

    public function update(Question $question, array $data): Question
    {
        $question->update(array_filter([
            'question_text' => $data['question_text'] ?? null,
            'type' => $data['type'] ?? null,
            'points' => $data['points'] ?? null,
        ], fn ($v) => ! is_null($v)));

        if (isset($data['options'])) {
            $question->options()->delete();
            foreach ($data['options'] as $option) {
                $question->options()->create([
                    'option_text' => $option['option_text'],
                    'is_correct' => $option['is_correct'] ?? false,
                ]);
            }
        }

        return $question->fresh('options');
    }

    public function delete(Question $question): void
    {
        $question->delete();
    }
}
