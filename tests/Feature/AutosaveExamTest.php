<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Exam;
use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AutosaveExamTest extends TestCase
{
    use RefreshDatabase;

    private User $student;
    private User $otherStudent;
    private Exam $exam;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => 'student']);
        $this->otherStudent = User::factory()->create(['role' => 'student']);

        $this->exam = Exam::factory()->create([
            'duration_minutes' => 60,
        ]);

        $q = Question::factory()->create(['exam_id' => $this->exam->id]);
        Option::factory()->create(['question_id' => $q->id, 'is_correct' => true]);
    }

    public function test_student_can_autosave_answers_instantly(): void
    {
        Sanctum::actingAs($this->student);

        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $this->exam->id,
            'questions' => [['id' => 1, 'question_text' => 'Sample']],
            'submitted_answers' => [],
            'status' => 'in_progress',
            'start_time' => Carbon::now(),
        ]);

        $response = $this->postJson("/api/attempts/{$attempt->id}/save", [
            'answers' => [
                ['question_id' => 1, 'option_id' => 2],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Answers autosaved successfully.')
            ->assertJsonPath('attempt_id', $attempt->id);

        $attempt->refresh();
        $this->assertEquals([['question_id' => 1, 'option_id' => 2]], $attempt->submitted_answers);
    }

    public function test_student_can_resume_attempt_with_state_and_remaining_time(): void
    {
        Sanctum::actingAs($this->student);

        $startTime = Carbon::now()->subMinutes(15);
        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $this->exam->id,
            'questions' => [['id' => 1, 'question_text' => 'Sample']],
            'submitted_answers' => [1 => 2],
            'status' => 'in_progress',
            'start_time' => $startTime,
            'started_at' => $startTime,
        ]);

        $response = $this->getJson("/api/attempts/{$attempt->id}/resume");

        $response->assertStatus(200)
            ->assertJsonPath('attempt_id', $attempt->id)
            ->assertJsonPath('status', 'in_progress')
            ->assertJsonPath('saved_answers.1', 2);

        $remainingSeconds = $response->json('remaining_seconds');
        // Total duration is 60 min (3600s), 15 min elapsed (900s), ~2700s remaining
        $this->assertGreaterThan(2600, $remainingSeconds);
        $this->assertLessThanOrEqual(2700, $remainingSeconds);
    }

    public function test_cannot_autosave_on_completed_attempt(): void
    {
        Sanctum::actingAs($this->student);

        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $this->exam->id,
            'status' => 'completed',
        ]);

        $response = $this->postJson("/api/attempts/{$attempt->id}/save", [
            'answers' => [1 => 2],
        ]);

        $response->assertStatus(422);
    }

    public function test_security_cannot_autosave_another_students_attempt(): void
    {
        Sanctum::actingAs($this->otherStudent);

        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $this->exam->id,
            'status' => 'in_progress',
        ]);

        $response = $this->postJson("/api/attempts/{$attempt->id}/save", [
            'answers' => [1 => 2],
        ]);

        $response->assertStatus(403);
    }
}
