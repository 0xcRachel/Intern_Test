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
     */
    public function run(): void
    {
        // 1. Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // 2. Student User
        User::create([
            'name' => 'Student User',
            'email' => 'student@example.com',
            'password' => Hash::make('password123'),
            'role' => 'student',
        ]);

        // 3. Sample Exam with Questions and Options
        $exam = Exam::create([
            'title' => 'IELTS General Reading Test 1',
            'description' => 'Standard introductory reading comprehension exam.',
            'duration_minutes' => 60,
            'passing_score' => 70,
        ]);

        $q1 = Question::create([
            'exam_id' => $exam->id,
            'question_text' => 'What is the primary objective of Section 1 in IELTS Reading?',
            'type' => 'single_choice',
            'points' => 10,
        ]);

        Option::create(['question_id' => $q1->id, 'option_text' => 'Social survival situations', 'is_correct' => true]);
        Option::create(['question_id' => $q1->id, 'option_text' => 'Academic lecture analysis', 'is_correct' => false]);
        Option::create(['question_id' => $q1->id, 'option_text' => 'Scientific essay analysis', 'is_correct' => false]);
        Option::create(['question_id' => $q1->id, 'option_text' => 'Creative fiction evaluation', 'is_correct' => false]);

        $q2 = Question::create([
            'exam_id' => $exam->id,
            'question_text' => 'How many total sections are in the IELTS Reading exam?',
            'type' => 'single_choice',
            'points' => 10,
        ]);

        Option::create(['question_id' => $q2->id, 'option_text' => '3', 'is_correct' => true]);
        Option::create(['question_id' => $q2->id, 'option_text' => '4', 'is_correct' => false]);
        Option::create(['question_id' => $q2->id, 'option_text' => '5', 'is_correct' => false]);
        Option::create(['question_id' => $q2->id, 'option_text' => '2', 'is_correct' => false]);
    }
}
