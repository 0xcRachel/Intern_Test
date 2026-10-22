<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Exam;
use App\Models\Option;
use App\Models\Package;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    // ── Exam CRUD ────────────────────────────────────────────

    public function test_admin_can_create_exam(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/exams', [
            'title' => 'New Exam',
            'description' => 'Exam description',
            'duration_minutes' => 90,
            'passing_score' => 60,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Exam');

        $this->assertDatabaseHas('exams', ['title' => 'New Exam']);
    }

    public function test_admin_can_list_exams(): void
    {
        Sanctum::actingAs($this->admin);

        Exam::factory()->create(['title' => 'Search Me']);
        Exam::factory()->create(['title' => 'Other Exam']);

        $response = $this->getJson('/api/admin/exams?search=Search');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_admin_can_show_exam(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();

        $response = $this->getJson("/api/admin/exams/{$exam->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $exam->id);
    }

    public function test_admin_can_update_exam(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create(['title' => 'Old Title']);

        $response = $this->putJson("/api/admin/exams/{$exam->id}", [
            'title' => 'Updated Title',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated Title');
    }

    public function test_admin_can_delete_exam(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();

        $response = $this->deleteJson("/api/admin/exams/{$exam->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('exams', ['id' => $exam->id]);
    }

    // ── Question CRUD ────────────────────────────────────────

    public function test_admin_can_create_question_with_options(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();

        $response = $this->postJson('/api/admin/questions', [
            'exam_id' => $exam->id,
            'question_text' => 'What is 2+2?',
            'type' => 'single_choice',
            'points' => 5,
            'options' => [
                ['option_text' => '3', 'is_correct' => false],
                ['option_text' => '4', 'is_correct' => true],
                ['option_text' => '5', 'is_correct' => false],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.question_text', 'What is 2+2?')
            ->assertJsonCount(3, 'data.options');
    }

    public function test_admin_can_update_question(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();
        $question = Question::factory()->create(['exam_id' => $exam->id]);
        Option::factory()->create(['question_id' => $question->id, 'is_correct' => true]);
        Option::factory()->create(['question_id' => $question->id, 'is_correct' => false]);

        $response = $this->putJson("/api/admin/questions/{$question->id}", [
            'question_text' => 'Updated question text',
            'options' => [
                ['option_text' => 'A', 'is_correct' => true],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.question_text', 'Updated question text')
            ->assertJsonCount(2, 'data.options');
    }

    public function test_admin_can_delete_question(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();
        $question = Question::factory()->create(['exam_id' => $exam->id]);

        $response = $this->deleteJson("/api/admin/questions/{$question->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('questions', ['id' => $question->id]);
    }

    // ── Authorization ────────────────────────────────────────

    public function test_student_gets_403_on_exam_create(): void
    {
        Sanctum::actingAs($this->student);

        $response = $this->postJson('/api/admin/exams', [
            'title' => 'Unauthorized Exam',
            'duration_minutes' => 60,
            'passing_score' => 50,
        ]);

        $response->assertStatus(403);
    }

    public function test_student_gets_403_on_question_create(): void
    {
        Sanctum::actingAs($this->student);

        $response = $this->postJson('/api/admin/questions', [
            'exam_id' => 1,
            'question_text' => 'Unauthorized',
            'options' => [
                ['option_text' => 'A', 'is_correct' => true],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ]);

        $response->assertStatus(403);
    }

    // ── Validation ────────────────────────────────────────────

    public function test_exam_creation_fails_with_empty_data(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/exams', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'duration_minutes', 'passing_score']);
    }

    public function test_question_creation_fails_without_correct_option(): void
    {
        Sanctum::actingAs($this->admin);

        $exam = Exam::factory()->create();

        $response = $this->postJson('/api/admin/questions', [
            'exam_id' => $exam->id,
            'question_text' => 'Test question',
            'options' => [
                ['option_text' => 'A', 'is_correct' => false],
                ['option_text' => 'B', 'is_correct' => false],
            ],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['options']);
    }

    public function test_question_creation_fails_with_empty_data(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/questions', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['exam_id', 'question_text', 'options']);
    }

    // ── Package catalogue CRUD ──────────────────────────────

    public function test_admin_can_create_and_update_package(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/packages', [
            'title' => 'IELTS Speaking Fluency Lab',
            'description' => 'A focused speaking course.',
            'level' => 'Intermediate',
            'duration_hours' => 18,
            'rating' => 4.8,
            'students_count' => 120,
            'price' => 29.99,
            'outcomes' => ['Improve fluency', 'Build stronger answers'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'IELTS Speaking Fluency Lab')
            ->assertJsonPath('data.slug', 'ielts-speaking-fluency-lab')
            ->assertJsonPath('data.units_count', 3);

        $package = Package::where('title', 'IELTS Speaking Fluency Lab')->firstOrFail();
        $this->assertSame(7, Document::whereHas('unit', fn ($query) => $query->where('package_id', $package->id))->count());

        $this->putJson("/api/admin/packages/{$package->id}", [
            'title' => 'IELTS Speaking Fluency Lab Plus',
            'price' => 34.99,
        ])->assertOk()
            ->assertJsonPath('data.title', 'IELTS Speaking Fluency Lab Plus')
            ->assertJsonPath('data.price', 34.99);
    }

    public function test_admin_can_list_and_hide_package(): void
    {
        Sanctum::actingAs($this->admin);

        $package = Package::factory()->create(['title' => 'Catalog Package']);

        $this->getJson('/api/admin/packages?search=Catalog')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Catalog Package');

        $this->deleteJson("/api/admin/packages/{$package->id}")
            ->assertOk();

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'is_active' => false,
        ]);
    }

    public function test_student_cannot_manage_package_catalogue(): void
    {
        Sanctum::actingAs($this->student);

        $this->getJson('/api/admin/packages')->assertForbidden();
    }
}
