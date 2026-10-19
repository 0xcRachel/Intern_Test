<?php

namespace Tests\Feature;

use App\Events\AttemptSubmitted;
use App\Events\ExamCreated;
use App\Models\ActivityLog;
use App\Models\Attempt;
use App\Models\Exam;
use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ActivityLogTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['name' => 'Admin Boss', 'role' => 'admin']);
        $this->student = User::factory()->create(['name' => 'Jane Student', 'role' => 'student']);
    }

    public function test_activity_log_is_created_automatically_when_exam_is_created_via_api(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/exams', [
            'title' => 'Biology Final',
            'duration_minutes' => 60,
            'passing_score' => 50,
        ]);

        $response->assertStatus(201);
        $examId = $response->json('data.id');

        // Verify activity log was created via Observer / Event
        $log = ActivityLog::where('action', 'exam_created')
            ->where('metadata->exam_id', $examId)
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals($this->admin->id, $log->user_id);
        $this->assertEquals('Admin Boss', $log->user_name);
        $this->assertStringContainsString('Biology Final', $log->description);
        $this->assertNotNull($log->created_at);
    }

    public function test_activity_log_is_created_automatically_when_attempt_is_submitted(): void
    {
        Sanctum::actingAs($this->student);

        $exam = Exam::factory()->create(['duration_minutes' => 60]);
        $q = Question::factory()->create(['exam_id' => $exam->id, 'points' => 10]);
        $opt = Option::factory()->create(['question_id' => $q->id, 'is_correct' => true]);

        // Start attempt
        $startRes = $this->postJson("/api/exams/{$exam->id}/attempts");
        $attemptId = $startRes->json('id');

        // Submit attempt
        $submitRes = $this->postJson("/api/attempts/{$attemptId}/submit", [
            'answers' => [
                $q->id => $opt->id,
            ],
        ]);

        $submitRes->assertStatus(200);

        // Verify activity log was created via Observer / Event
        $log = ActivityLog::where('action', 'attempt_submitted')
            ->where('metadata->attempt_id', $attemptId)
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals($this->student->id, $log->user_id);
        $this->assertEquals('Jane Student', $log->user_name);
        $this->assertEquals(10, $log->metadata['score']);
        $this->assertNotNull($log->created_at);
    }

    public function test_direct_event_dispatching_creates_activity_logs(): void
    {
        $exam = Exam::factory()->create(['title' => 'Chemistry 101']);
        event(new ExamCreated($exam));

        $this->assertTrue(
            ActivityLog::where('action', 'exam_created')->where('metadata->title', 'Chemistry 101')->exists()
        );

        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $exam->id,
            'score' => 95,
            'total_points' => 100,
            'percentage' => 95,
            'is_passed' => true,
            'status' => 'completed',
            'start_time' => Carbon::now()->subMinutes(10),
            'end_time' => Carbon::now(),
        ]);

        event(new AttemptSubmitted($attempt));

        $this->assertTrue(
            ActivityLog::where('action', 'attempt_submitted')->where('metadata->score', 95)->exists()
        );
    }
}
