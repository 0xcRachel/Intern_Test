<?php

namespace Tests\Feature;

use App\Models\Exam;
use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExamListCacheTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;
    private Exam $exam;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);

        $this->exam = Exam::factory()->create(['title' => 'Cached Exam']);

        $question = Question::factory()->create(['exam_id' => $this->exam->id]);
        Option::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'Correct answer',
            'is_correct' => true,
        ]);
        Option::factory()->create([
            'question_id' => $question->id,
            'option_text' => 'Wrong answer',
            'is_correct' => false,
        ]);
    }

    public function test_student_exam_list_is_cached_and_hides_questions_and_answers(): void
    {
        Sanctum::actingAs($this->student);

        $first = $this->getJson('/api/exams');

        $first->assertStatus(200)
            ->assertHeader('X-Cache', 'MISS')
            ->assertJsonPath('data.0.title', 'Cached Exam')
            ->assertJsonPath('data.0.questions_count', 1)
            ->assertJsonMissingPath('data.0.questions');

        $second = $this->getJson('/api/exams');

        $second->assertHeader('X-Cache', 'HIT');
        $this->assertStringNotContainsString('"is_correct"', $second->getContent());
    }

    public function test_admin_exam_list_includes_questions_and_correct_flags(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/exams');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.questions_count', 1)
            ->assertJsonCount(2, 'data.0.questions.0.options');

        $options = collect($response->json('data.0.questions.0.options'));

        $this->assertNotNull($options->firstWhere('is_correct', true));
        $this->assertNotNull($options->firstWhere('is_correct', false));
    }

    public function test_creating_a_question_invalidates_the_exam_list_cache(): void
    {
        Sanctum::actingAs($this->admin);

        $this->getJson('/api/admin/exams')->assertHeader('X-Cache', 'MISS');
        $this->getJson('/api/admin/exams')->assertHeader('X-Cache', 'HIT');

        $this->postJson('/api/admin/questions', [
            'exam_id' => $this->exam->id,
            'question_text' => 'Second question?',
            'type' => 'single_choice',
            'points' => 1,
            'options' => [
                ['option_text' => 'A', 'is_correct' => true],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ])->assertStatus(201);

        $this->getJson('/api/admin/exams')
            ->assertHeader('X-Cache', 'MISS')
            ->assertJsonPath('data.0.questions_count', 2);
    }

    public function test_updating_an_exam_invalidates_the_cache_version(): void
    {
        Sanctum::actingAs($this->admin);

        $this->getJson('/api/admin/exams')->assertHeader('X-Cache', 'MISS');
        $this->getJson('/api/admin/exams')->assertHeader('X-Cache', 'HIT');

        $this->putJson("/api/admin/exams/{$this->exam->id}", [
            'title' => 'Updated Cached Exam',
        ])->assertStatus(200);

        $this->getJson('/api/admin/exams')
            ->assertHeader('X-Cache', 'MISS')
            ->assertJsonPath('data.0.title', 'Updated Cached Exam');
    }

    public function test_admin_cache_is_not_served_to_students(): void
    {
        Sanctum::actingAs($this->admin);
        $this->getJson('/api/admin/exams')->assertHeader('X-Cache', 'MISS');

        Sanctum::actingAs($this->student);
        $response = $this->getJson('/api/exams');

        $response->assertHeader('X-Cache', 'MISS')
            ->assertJsonMissingPath('data.0.questions');

        $this->assertStringNotContainsString('"is_correct"', $response->getContent());
    }
}
