<?php

namespace Database\Seeders;

use App\Models\Package;
use App\Services\PackageContentService;
use Illuminate\Database\Seeder;

class RealisticPackageSeeder extends Seeder
{
    public function __construct(private readonly PackageContentService $packageContent) {}

    /**
     * Seed a small, stable course catalogue for the storefront demo.
     *
     * The slug is the idempotency key so this seeder is safe to run again.
     */
    public function run(): void
    {
        $courses = [
            [
                'title' => 'IELTS Academic Foundation Band 5.5',
                'slug' => 'ielts-academic-foundation-band-5-5',
                'description' => 'Xây nền tảng từ vựng, ngữ pháp và kỹ năng làm bài cho người mới bắt đầu luyện IELTS Academic.',
                'level' => 'Beginner',
                'duration_hours' => 18,
                'rating' => 4.70,
                'students_count' => 1840,
                'is_featured' => false,
                'price' => 24.99,
                'outcomes' => ['Nắm cấu trúc bài thi Academic.', 'Xây vốn từ vựng theo chủ đề.', 'Hoàn thành bài luyện nền tảng cho 4 kỹ năng.'],
            ],
            [
                'title' => 'IELTS Grammar Reset for Band 6.5',
                'slug' => 'ielts-grammar-reset-band-6-5',
                'description' => 'Ôn lại các điểm ngữ pháp thường mất điểm và áp dụng trực tiếp vào Speaking, Writing.',
                'level' => 'Beginner',
                'duration_hours' => 14,
                'rating' => 4.80,
                'students_count' => 1260,
                'is_featured' => false,
                'price' => 19.99,
                'outcomes' => ['Sửa lỗi thì và cấu trúc câu.', 'Dùng mệnh đề quan hệ chính xác.', 'Viết câu phức tự nhiên hơn.'],
            ],
            [
                'title' => 'IELTS Vocabulary Builder: 30 Essential Topics',
                'slug' => 'ielts-vocabulary-builder-30-topics',
                'description' => 'Mở rộng từ vựng theo 30 chủ đề phổ biến với collocations, word families và bài kiểm tra ngắn.',
                'level' => 'Beginner',
                'duration_hours' => 20,
                'rating' => 4.60,
                'students_count' => 2310,
                'is_featured' => true,
                'price' => 22.99,
                'outcomes' => ['Ghi nhớ từ theo ngữ cảnh.', 'Dùng collocation đúng cách.', 'Tăng độ chính xác khi diễn đạt ý tưởng.'],
            ],
            [
                'title' => 'IELTS Listening Essentials: Sections 1–2',
                'slug' => 'ielts-listening-essentials-sections-1-2',
                'description' => 'Luyện form completion, table completion và hội thoại đời sống với transcript và audio tốc độ vừa.',
                'level' => 'Beginner',
                'duration_hours' => 12,
                'rating' => 4.70,
                'students_count' => 980,
                'is_featured' => false,
                'price' => 18.99,
                'outcomes' => ['Dự đoán đáp án trước khi nghe.', 'Nhận diện spelling và số liệu.', 'Tránh bẫy sửa thông tin trong audio.'],
            ],
            [
                'title' => 'IELTS Speaking Confidence Lab',
                'slug' => 'ielts-speaking-confidence-lab',
                'description' => 'Luyện phản xạ Speaking Part 1–3, phát triển ý tưởng và nói mạch lạc trong thời gian giới hạn.',
                'level' => 'Beginner',
                'duration_hours' => 16,
                'rating' => 4.80,
                'students_count' => 1650,
                'is_featured' => false,
                'price' => 27.99,
                'outcomes' => ['Trả lời Part 1 tự nhiên.', 'Kể chuyện có cấu trúc ở Part 2.', 'Phát triển quan điểm ở Part 3.'],
            ],
            [
                'title' => 'IELTS Reading Core Skills',
                'slug' => 'ielts-reading-core-skills',
                'description' => 'Rèn skimming, scanning, tìm keyword và định vị thông tin trong các bài đọc học thuật.',
                'level' => 'Beginner',
                'duration_hours' => 18,
                'rating' => 4.60,
                'students_count' => 1420,
                'is_featured' => false,
                'price' => 25.99,
                'outcomes' => ['Đọc nhanh để lập bản đồ đoạn văn.', 'Tìm bằng chứng cho từng câu hỏi.', 'Quản lý 60 phút hiệu quả.'],
            ],
            [
                'title' => 'IELTS Writing Task 1 Academic',
                'slug' => 'ielts-writing-task-1-academic',
                'description' => 'Làm chủ line graph, bar chart, table, process và map với cấu trúc bài rõ ràng.',
                'level' => 'Intermediate',
                'duration_hours' => 20,
                'rating' => 4.90,
                'students_count' => 2070,
                'is_featured' => true,
                'price' => 31.99,
                'outcomes' => ['Viết overview đúng trọng tâm.', 'Nhóm và so sánh số liệu.', 'Mô tả process/map theo trình tự logic.'],
            ],
            [
                'title' => 'IELTS Writing Task 2 Argument Clinic',
                'slug' => 'ielts-writing-task-2-argument-clinic',
                'description' => 'Xây dựng thesis, lập luận và ví dụ cho opinion, discussion, problem-solution và advantage-disadvantage essays.',
                'level' => 'Intermediate',
                'duration_hours' => 24,
                'rating' => 4.90,
                'students_count' => 2580,
                'is_featured' => true,
                'price' => 34.99,
                'outcomes' => ['Lập dàn ý trong 5 phút.', 'Phát triển luận điểm có ví dụ.', 'Tự sửa coherence và grammar.'],
            ],
            [
                'title' => 'IELTS Listening Sections 3–4 Mastery',
                'slug' => 'ielts-listening-sections-3-4-mastery',
                'description' => 'Tập trung vào thảo luận học thuật, bài giảng dài, multiple choice và note completion.',
                'level' => 'Intermediate',
                'duration_hours' => 22,
                'rating' => 4.70,
                'students_count' => 1130,
                'is_featured' => false,
                'price' => 29.99,
                'outcomes' => ['Theo dõi nhiều người nói.', 'Nhận diện signposting trong lecture.', 'Ghi chú nhanh mà không bỏ lỡ đáp án.'],
            ],
            [
                'title' => 'IELTS Reading Question Types Workshop',
                'slug' => 'ielts-reading-question-types-workshop',
                'description' => 'Workshop chuyên sâu cho True/False/Not Given, matching headings, matching information và sentence completion.',
                'level' => 'Intermediate',
                'duration_hours' => 26,
                'rating' => 4.80,
                'students_count' => 1740,
                'is_featured' => false,
                'price' => 32.99,
                'outcomes' => ['Phân biệt False và Not Given.', 'Chọn heading theo ý chính.', 'Kiểm tra đáp án bằng bằng chứng trong bài.'],
            ],
            [
                'title' => 'IELTS Speaking Part 2 Storytelling',
                'slug' => 'ielts-speaking-part-2-storytelling',
                'description' => 'Biến cue card thành câu chuyện có mở đầu, chi tiết và cảm nhận mà không học thuộc bài mẫu.',
                'level' => 'Intermediate',
                'duration_hours' => 15,
                'rating' => 4.70,
                'students_count' => 1320,
                'is_featured' => false,
                'price' => 23.99,
                'outcomes' => ['Lên ý tưởng trong 60 giây.', 'Dùng linking phrases tự nhiên.', 'Kéo dài câu trả lời đủ 2 phút.'],
            ],
            [
                'title' => 'IELTS Pronunciation and Fluency Studio',
                'slug' => 'ielts-pronunciation-fluency-studio',
                'description' => 'Cải thiện trọng âm, nối âm, ngữ điệu và độ trôi chảy qua các bài luyện nói ngắn.',
                'level' => 'Intermediate',
                'duration_hours' => 17,
                'rating' => 4.60,
                'students_count' => 890,
                'is_featured' => false,
                'price' => 26.99,
                'outcomes' => ['Nói rõ trọng âm từ và câu.', 'Giảm ngắt quãng không cần thiết.', 'Điều chỉnh ngữ điệu theo ý nghĩa.'],
            ],
            [
                'title' => 'IELTS Band 7 Grammar Upgrade',
                'slug' => 'ielts-band-7-grammar-upgrade',
                'description' => 'Nâng độ đa dạng và chính xác ngữ pháp để chuyển từ Band 6 lên Band 7 trong Writing và Speaking.',
                'level' => 'Intermediate',
                'duration_hours' => 21,
                'rating' => 4.80,
                'students_count' => 1510,
                'is_featured' => false,
                'price' => 28.99,
                'outcomes' => ['Dùng câu phức chính xác.', 'Kiểm soát articles và prepositions.', 'Tránh lỗi ngữ pháp lặp lại.'],
            ],
            [
                'title' => 'IELTS Academic Mock Tests: Band 7 Target',
                'slug' => 'ielts-academic-mock-tests-band-7',
                'description' => 'Bộ đề mô phỏng đủ 4 kỹ năng, có timer, đáp án và checklist tự đánh giá sau mỗi test.',
                'level' => 'Intermediate',
                'duration_hours' => 30,
                'rating' => 4.90,
                'students_count' => 2940,
                'is_featured' => true,
                'price' => 39.99,
                'outcomes' => ['Làm bài theo đúng áp lực thời gian.', 'Xác định kỹ năng yếu nhất.', 'Theo dõi điểm qua nhiều lần làm.'],
            ],
            [
                'title' => 'IELTS Reading Speed and Accuracy Lab',
                'slug' => 'ielts-reading-speed-accuracy-lab',
                'description' => 'Tối ưu tốc độ đọc và độ chính xác bằng drills theo thời gian, passage map và error log.',
                'level' => 'Advanced',
                'duration_hours' => 24,
                'rating' => 4.80,
                'students_count' => 1180,
                'is_featured' => false,
                'price' => 36.99,
                'outcomes' => ['Giữ tốc độ ổn định qua 3 passage.', 'Xử lý câu hỏi khó có chiến lược.', 'Phân tích lỗi để không lặp lại.'],
            ],
            [
                'title' => 'IELTS Writing Band 8 Precision',
                'slug' => 'ielts-writing-band-8-precision',
                'description' => 'Khóa chuyên sâu về lập luận, từ vựng học thuật và chỉnh sửa bài viết theo tiêu chí chấm Band 8.',
                'level' => 'Advanced',
                'duration_hours' => 32,
                'rating' => 4.90,
                'students_count' => 760,
                'is_featured' => true,
                'price' => 49.99,
                'outcomes' => ['Viết lập luận sắc nét hơn.', 'Dùng từ vựng chính xác theo ngữ cảnh.', 'Tự review bài theo 4 tiêu chí IELTS.'],
            ],
            [
                'title' => 'IELTS Speaking Part 3 Critical Thinking',
                'slug' => 'ielts-speaking-part-3-critical-thinking',
                'description' => 'Phát triển câu trả lời Part 3 có chiều sâu với nguyên nhân, hệ quả, so sánh và dự đoán.',
                'level' => 'Advanced',
                'duration_hours' => 18,
                'rating' => 4.70,
                'students_count' => 680,
                'is_featured' => false,
                'price' => 33.99,
                'outcomes' => ['Mở rộng câu trả lời trừu tượng.', 'Đưa ra quan điểm có điều kiện.', 'Phản hồi linh hoạt trước câu hỏi phụ.'],
            ],
            [
                'title' => 'IELTS Listening Accent Challenge',
                'slug' => 'ielts-listening-accent-challenge',
                'description' => 'Làm quen với accent Anh, Úc, Canada và New Zealand qua audio tốc độ thật và transcript chú giải.',
                'level' => 'Advanced',
                'duration_hours' => 20,
                'rating' => 4.60,
                'students_count' => 540,
                'is_featured' => false,
                'price' => 30.99,
                'outcomes' => ['Nhận diện cách phát âm khác nhau.', 'Theo dõi speech tốc độ tự nhiên.', 'Dự đoán paraphrase trong đáp án.'],
            ],
            [
                'title' => 'IELTS General Training Complete Pathway',
                'slug' => 'ielts-general-training-complete-pathway',
                'description' => 'Lộ trình trọn gói cho IELTS General Training, tập trung vào Reading, Writing và tình huống đời sống.',
                'level' => 'Intermediate',
                'duration_hours' => 36,
                'rating' => 4.80,
                'students_count' => 1090,
                'is_featured' => false,
                'price' => 44.99,
                'outcomes' => ['Hiểu khác biệt Academic và General.', 'Viết thư theo đúng mục đích.', 'Luyện đề đủ kỹ năng theo tuần.'],
            ],
            [
                'title' => 'IELTS One-Month Intensive Bootcamp',
                'slug' => 'ielts-one-month-intensive-bootcamp',
                'description' => 'Bootcamp 4 tuần với lịch học rõ ràng, bài kiểm tra hàng tuần và checklist tiến bộ cho người cần tăng tốc.',
                'level' => 'Advanced',
                'duration_hours' => 40,
                'rating' => 4.90,
                'students_count' => 2140,
                'is_featured' => true,
                'price' => 59.99,
                'outcomes' => ['Có lịch luyện tập 4 tuần cụ thể.', 'Kết hợp chiến lược của cả 4 kỹ năng.', 'Đo tiến bộ bằng mock test hàng tuần.'],
            ],
        ];

        foreach ($courses as $course) {
            $existing = Package::query()->where('slug', $course['slug'])->first();

            if ($existing) {
                $existing->update($course);
                $package = $existing->fresh();
            } else {
                $package = Package::factory()->realistic($course)->create();
            }

            $this->packageContent->ensureStarterContent($package);
        }
    }
}
