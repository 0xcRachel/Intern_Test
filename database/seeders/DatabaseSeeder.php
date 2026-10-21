<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\Option;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * The seeder is idempotent so it can also run from the Docker entrypoint
     * on every container start without creating duplicate rows.
     */
    public function run(): void
    {
        // 1. Admin User
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Quản trị viên ExamPlatform',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'target_band' => '8.5',
                'bio' => 'Quản trị nội dung và theo dõi hoạt động của trung tâm.',
            ]
        );

        // 2. Student User
        User::updateOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Ngọc Anh',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'target_band' => '7.5',
                'bio' => 'Đang luyện IELTS Academic, mục tiêu Band 7.5 trong 8 tuần.',
            ]
        );

        // 3. Sample Exam with Questions and Options
        $exam = Exam::firstOrCreate(
            ['title' => 'IELTS General Reading Test 1'],
            [
                'description' => 'Standard introductory reading comprehension exam.',
                'duration_minutes' => 60,
                'passing_score' => 70,
            ]
        );

        $q1 = Question::firstOrCreate(
            [
                'exam_id' => $exam->id,
                'question_text' => 'What is the primary objective of Section 1 in IELTS Reading?',
            ],
            [
                'type' => 'single_choice',
                'points' => 10,
            ]
        );

        Option::updateOrCreate(
            ['question_id' => $q1->id, 'option_text' => 'Social survival situations'],
            ['is_correct' => true]
        );
        Option::updateOrCreate(
            ['question_id' => $q1->id, 'option_text' => 'Academic lecture analysis'],
            ['is_correct' => false]
        );
        Option::updateOrCreate(
            ['question_id' => $q1->id, 'option_text' => 'Scientific essay analysis'],
            ['is_correct' => false]
        );
        Option::updateOrCreate(
            ['question_id' => $q1->id, 'option_text' => 'Creative fiction evaluation'],
            ['is_correct' => false]
        );

        $q2 = Question::firstOrCreate(
            [
                'exam_id' => $exam->id,
                'question_text' => 'How many total sections are in the IELTS Reading exam?',
            ],
            [
                'type' => 'single_choice',
                'points' => 10,
            ]
        );

        Option::updateOrCreate(
            ['question_id' => $q2->id, 'option_text' => '3'],
            ['is_correct' => true]
        );
        Option::updateOrCreate(
            ['question_id' => $q2->id, 'option_text' => '4'],
            ['is_correct' => false]
        );
        Option::updateOrCreate(
            ['question_id' => $q2->id, 'option_text' => '5'],
            ['is_correct' => false]
        );
        Option::updateOrCreate(
            ['question_id' => $q2->id, 'option_text' => '2'],
            ['is_correct' => false]
        );

        // 4. Sample IELTS Package with Units & Documents
        $this->call(IeltsPackageSeeder::class);

        // 5. Original, non-scanned Mindset for IELTS catalogue fixtures.
        $this->call(MindsetForIeltsSeeder::class);

        // 6. Factory-generated demo packages and exams (idempotent by title)
        $this->call(DemoContentSeeder::class);

        // 7. Storefront demo: coupons, a paid order and course enrollments
        $this->call(CommerceDemoSeeder::class);
    }
}
