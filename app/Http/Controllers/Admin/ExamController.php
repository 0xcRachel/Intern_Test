<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
use App\Services\AnalyticsService;
use App\Services\ExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ExamController extends Controller
{
    public function __construct(
        private readonly ExamService $examService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $perPage = (int) $request->query('per_page', 15);
        $page = (int) $request->query('page', 1);

        $cacheKey = "exams_list_" . md5("{$search}_{$perPage}_{$page}");
        $isHit = Cache::has($cacheKey);

        $exams = Cache::remember($cacheKey, 60, function () use ($search, $perPage) {
            return $this->examService->list(
                search: $search,
                perPage: $perPage,
            );
        });

        $data = ExamResource::collection($exams)->response()->getData(true);
        $data['cache_status'] = $isHit ? 'HIT' : 'MISS';

        return response()->json($data, 200)
            ->header('X-Cache', $isHit ? 'HIT' : 'MISS');
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

    public function statistics(int $id, AnalyticsService $analyticsService): JsonResponse
    {
        $stats = $analyticsService->getExamStatistics($id);

        return response()->json($stats);
    }
}
