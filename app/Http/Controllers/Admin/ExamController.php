<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExamController extends Controller
{
    public function __construct(
        private readonly ExamService $examService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $exams = $this->examService->list(
            search: $request->query('search'),
            perPage: (int) $request->query('per_page', 15),
        );

        return ExamResource::collection($exams);
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $exam = $this->examService->create($request->validated());

        return (new ExamResource($exam))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Exam $exam): ExamResource
    {
        return new ExamResource($this->examService->find($exam->id));
    }

    public function update(UpdateExamRequest $request, Exam $exam): ExamResource
    {
        $updated = $this->examService->update($exam, $request->validated());

        return new ExamResource($updated);
    }

    public function destroy(Exam $exam): JsonResponse
    {
        $this->examService->delete($exam);

        return response()->json(['message' => 'Exam deleted successfully.'], 200);
    }
}
