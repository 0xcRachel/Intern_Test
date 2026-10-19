<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Exam;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student1;
    private User $student2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['name' => 'Admin User', 'role' => 'admin']);
        $this->student1 = User::factory()->create(['name' => 'Alice Johnson', 'role' => 'student']);
        $this->student2 = User::factory()->create(['name' => 'Bob Smith', 'role' => 'student']);
    }

    public function test_admin_can_view_exam_statistics_with_correct_aggregations(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create(['title' => 'Advanced Physics']);

        // Student 1: Attempt 1 (Score 80, Wrong: Q1)
        Attempt::create([
            'user_id' => $this->student1->id,
            'exam_id' => $exam->id,
            'score' => 80,
            'total_points' => 100,
            'percentage' => 80,
            'is_passed' => true,
            'status' => 'completed',
            'start_time' => Carbon::now()->subMinutes(30),
            'end_time' => Carbon::now(),
            'wrong_questions' => [
                ['question_id' => 1, 'question_text' => 'What is velocity?'],
            ],
        ]);

        // Student 1: Attempt 2 (Score 100, Wrong: None)
        Attempt::create([
            'user_id' => $this->student1->id,
            'exam_id' => $exam->id,
            'score' => 100,
            'total_points' => 100,
            'percentage' => 100,
            'is_passed' => true,
            'status' => 'completed',
            'start_time' => Carbon::now()->subMinutes(20),
            'end_time' => Carbon::now(),
            'wrong_questions' => [],
        ]);

        // Student 2: Attempt 1 (Score 60, Wrong: Q1, Q2)
        Attempt::create([
            'user_id' => $this->student2->id,
            'exam_id' => $exam->id,
            'score' => 60,
            'total_points' => 100,
            'percentage' => 60,
            'is_passed' => true,
            'status' => 'completed',
            'start_time' => Carbon::now()->subMinutes(15),
            'end_time' => Carbon::now(),
            'wrong_questions' => [
                ['question_id' => 1, 'question_text' => 'What is velocity?'],
                ['question_id' => 2, 'question_text' => 'What is mass?'],
            ],
        ]);

        // Incomplete attempt (should NOT be included in statistics)
        Attempt::create([
            'user_id' => $this->student2->id,
            'exam_id' => $exam->id,
            'score' => 0,
            'status' => 'in_progress',
        ]);

        $response = $this->getJson("/api/admin/exams/{$exam->id}/statistics");

        $response->assertStatus(200)
            ->assertJsonPath('exam_id', $exam->id)
            ->assertJsonPath('exam_title', 'Advanced Physics')
            ->assertJsonPath('total_completed_attempts', 3)
            ->assertJsonPath('average_score', 80)
            ->assertJsonPath('highest_score', 100)
            ->assertJsonPath('lowest_score', 60);

        // Verify top students rankings and names
        $topStudents = $response->json('top_students');
        $this->assertCount(2, $topStudents);
        $this->assertEquals($this->student1->id, $topStudents[0]['user_id']);
        $this->assertEquals('Alice Johnson', $topStudents[0]['user_name']);
        $this->assertEquals(100, $topStudents[0]['highest_score']);
        $this->assertEquals(90, $topStudents[0]['avg_score']);
        $this->assertEquals(2, $topStudents[0]['attempts_count']);

        $this->assertEquals($this->student2->id, $topStudents[1]['user_id']);
        $this->assertEquals('Bob Smith', $topStudents[1]['user_name']);
        $this->assertEquals(60, $topStudents[1]['highest_score']);

        // Verify most incorrect questions aggregation
        $mostIncorrect = $response->json('most_incorrect_questions');
        $this->assertCount(2, $mostIncorrect);
        $this->assertEquals(1, $mostIncorrect[0]['question_id']);
        $this->assertEquals(2, $mostIncorrect[0]['incorrect_count']);
        $this->assertEquals(2, $mostIncorrect[1]['question_id']);
        $this->assertEquals(1, $mostIncorrect[1]['incorrect_count']);
    }

    public function test_student_gets_403_on_statistics_route(): void
    {
        Sanctum::actingAs($this->student1);

        $exam = Exam::factory()->create();

        $response = $this->getJson("/api/admin/exams/{$exam->id}/statistics");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_gets_401(): void
    {
        $exam = Exam::factory()->create();

        $response = $this->getJson("/api/admin/exams/{$exam->id}/statistics");

        $response->assertStatus(401);
    }
}
