<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionRequest;
use App\Http\Requests\UpdateQuestionRequest;
use App\Http\Resources\QuestionResource;
use App\Models\Question;
use App\Services\QuestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuestionController extends Controller
{
    public function __construct(
        private readonly QuestionService $questionService,
    ) {}

    public function index(int $examId): AnonymousResourceCollection
    {
        $questions = $this->questionService->listByExam($examId);

        return QuestionResource::collection($questions);
    }

    public function store(StoreQuestionRequest $request): JsonResponse
    {
        $question = $this->questionService->create($request->validated());

        return (new QuestionResource($question))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Question $question): QuestionResource
    {
        return new QuestionResource($this->questionService->find($question->id));
    }

    public function update(UpdateQuestionRequest $request, Question $question): QuestionResource
    {
        $updated = $this->questionService->update($question, $request->validated());

        return new QuestionResource($updated);
    }

    public function destroy(Question $question): JsonResponse
    {
        $this->questionService->delete($question);

        return response()->json(['message' => 'Question deleted successfully.'], 200);
    }
}
