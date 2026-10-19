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

class StudentExamTest extends TestCase
{
    use RefreshDatabase;

    private User $student;
    private User $student2;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create(['role' => 'student']);
        $this->student2 = User::factory()->create(['role' => 'student']);
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_student_can_start_exam_and_creates_attempt_with_shuffled_questions(): void
    {
        Sanctum::actingAs($this->student);

        $exam = Exam::factory()->create([
            'title' => 'Biology 101',
            'duration_minutes' => 45,
            'passing_score' => 70,
        ]);

        for ($i = 1; $i <= 3; $i++) {
            $question = Question::factory()->create([
                'exam_id' => $exam->id,
                'question_text' => "Question {$i}",
                'points' => 2,
            ]);

            Option::factory()->create(['question_id' => $question->id, 'option_text' => "Opt {$i}A", 'is_correct' => true]);
            Option::factory()->create(['question_id' => $question->id, 'option_text' => "Opt {$i}B", 'is_correct' => false]);
            Option::factory()->create(['question_id' => $question->id, 'option_text' => "Opt {$i}C", 'is_correct' => false]);
        }

        $response = $this->postJson("/api/exams/{$exam->id}/attempts");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'attempt_id',
                'id',
                'exam_id',
                'exam_title',
                'duration_minutes',
                'start_time',
                'questions' => [
                    '*' => [
                        'id',
                        'question_text',
                        'type',
                        'points',
                        'options' => [
                            '*' => ['id', 'option_text'],
                        ],
                    ],
                ],
            ]);

        // Verify correct answers are NOT leaked to the client
        $questions = $response->json('questions');
        $this->assertCount(3, $questions);
        $this->assertArrayNotHasKey('is_correct', $questions[0]['options'][0]);

        // Verify document created in database
        $attempt = Attempt::find($response->json('id'));
        $this->assertNotNull($attempt);
        $this->assertEquals($this->student->id, $attempt->user_id);
        $this->assertEquals($exam->id, $attempt->exam_id);
        $this->assertEquals('in_progress', $attempt->status);
        $this->assertCount(3, $attempt->questions);
    }

    public function test_grading_calculates_exact_score(): void
    {
        Sanctum::actingAs($this->student);

        $exam = Exam::factory()->create([
            'duration_minutes' => 60,
            'passing_score' => 50,
        ]);

        $q1 = Question::factory()->create(['exam_id' => $exam->id, 'points' => 10]);
        $opt1Correct = Option::factory()->create(['question_id' => $q1->id, 'is_correct' => true]);
        $opt1Wrong = Option::factory()->create(['question_id' => $q1->id, 'is_correct' => false]);

        $q2 = Question::factory()->create(['exam_id' => $exam->id, 'points' => 10]);
        $opt2Correct = Option::factory()->create(['question_id' => $q2->id, 'is_correct' => true]);
        $opt2Wrong = Option::factory()->create(['question_id' => $q2->id, 'is_correct' => false]);

        $startRes = $this->postJson("/api/exams/{$exam->id}/attempts");
        $attemptId = $startRes->json('id');

        // Submit: Q1 correct, Q2 wrong
        $submitRes = $this->postJson("/api/attempts/{$attemptId}/submit", [
            'answers' => [
                $q1->id => $opt1Correct->id,
                $q2->id => $opt1Wrong->id,
            ],
        ]);

        $submitRes->assertStatus(200)
            ->assertJsonPath('score', 10)
            ->assertJsonPath('total_points', 20)
            ->assertJsonPath('percentage', 50)
            ->assertJsonPath('is_passed', true)
            ->assertJsonPath('status', 'completed');

        // Check updated attempt in database
        $attempt = Attempt::find($attemptId);
        $this->assertEquals(10, $attempt->score);
        $this->assertEquals('completed', $attempt->status);
        $this->assertNotNull($attempt->end_time ?? $attempt->submitted_at);
    }

    public function test_completed_attempt_cannot_be_submitted_twice(): void
    {
        Sanctum::actingAs($this->student);

        $exam = Exam::factory()->create(['duration_minutes' => 60]);
        $question = Question::factory()->create(['exam_id' => $exam->id, 'points' => 5]);
        $correct = Option::factory()->create(['question_id' => $question->id, 'is_correct' => true]);

        $attemptId = $this->postJson("/api/exams/{$exam->id}/attempts")
            ->assertStatus(201)
            ->json('id');

        $this->postJson("/api/attempts/{$attemptId}/submit", [
            'answers' => [$question->id => $correct->id],
        ])->assertStatus(200);

        // A completed attempt is immutable; a second submit must not change the score.
        $this->postJson("/api/attempts/{$attemptId}/submit", [
            'answers' => [$question->id => $correct->id],
        ])->assertStatus(422);
    }

    public function test_submitting_past_time_limit_triggers_rejection(): void
    {
        Sanctum::actingAs($this->student);

        $exam = Exam::factory()->create([
            'duration_minutes' => 30,
        ]);

        $question = Question::factory()->create(['exam_id' => $exam->id]);
        $option = Option::factory()->create(['question_id' => $question->id, 'is_correct' => true]);

        // Create attempt started 35 minutes ago (30 min duration + 10s grace period exceeded)
        $pastTime = Carbon::now()->subMinutes(35);
        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $exam->id,
            'questions' => [],
            'start_time' => $pastTime,
            'started_at' => $pastTime,
            'status' => 'in_progress',
        ]);

        $response = $this->postJson("/api/attempts/{$attempt->id}/submit", [
            'answers' => [
                $question->id => $option->id,
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['time_limit']);
    }

    public function test_security_student_cannot_submit_or_view_another_students_attempt(): void
    {
        $exam = Exam::factory()->create();
        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $exam->id,
            'questions' => [],
            'start_time' => Carbon::now(),
            'started_at' => Carbon::now(),
            'status' => 'in_progress',
        ]);

        // Acting as student2
        Sanctum::actingAs($this->student2);

        $submitResponse = $this->postJson("/api/attempts/{$attempt->id}/submit", [
            'answers' => [],
        ]);
        $submitResponse->assertStatus(403);

        $showResponse = $this->getJson("/api/attempts/{$attempt->id}");
        $showResponse->assertStatus(403);
    }

    public function test_student_can_view_own_attempt_result(): void
    {
        Sanctum::actingAs($this->student);

        $exam = Exam::factory()->create([
            'duration_minutes' => 60,
            'passing_score' => 60,
        ]);

        $q = Question::factory()->create(['exam_id' => $exam->id, 'points' => 5]);
        $correctOpt = Option::factory()->create(['question_id' => $q->id, 'is_correct' => true]);
        $wrongOpt = Option::factory()->create(['question_id' => $q->id, 'is_correct' => false]);

        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'exam_id' => $exam->id,
            'questions' => [],
            'submitted_answers' => [$q->id => $wrongOpt->id],
            'answers' => [$q->id => $wrongOpt->id],
            'score' => 0,
            'total_points' => 5,
            'percentage' => 0,
            'is_passed' => false,
            'status' => 'completed',
            'start_time' => Carbon::now()->subMinutes(10),
            'end_time' => Carbon::now(),
        ]);

        $response = $this->getJson("/api/attempts/{$attempt->id}");

        $response->assertStatus(200)
            ->assertJsonPath('attempt_id', $attempt->id)
            ->assertJsonPath('score', 0)
            ->assertJsonPath('total_points', 5)
            ->assertJsonPath('is_passed', false)
            ->assertJsonCount(1, 'wrong_questions')
            ->assertJsonPath('correct_answers.' . $q->id, $correctOpt->id);
    }

    public function test_admin_gets_403_on_student_attempt_routes(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();

        $response = $this->postJson("/api/exams/{$exam->id}/attempts");

        $response->assertStatus(403);
    }
}
