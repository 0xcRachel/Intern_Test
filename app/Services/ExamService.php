<?php

namespace App\Services;

use App\Models\Exam;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExamService
{
    public function list(?string $search = null, int $perPage = 15): LengthAwarePaginator
    {
        return Exam::query()
            ->with('questions.options')
            ->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->latest()
            ->paginate($perPage);
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
}
