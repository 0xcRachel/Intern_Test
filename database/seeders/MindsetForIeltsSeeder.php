<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Package;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class MindsetForIeltsSeeder extends Seeder
{
    /**
     * Seed Mindset for IELTS Level 1 / 2 / 3 packages.
     *
     * All PDF/audio files are self-created placeholders — no copyrighted scans.
     * Preview content is original IELTS-style practice material.
     */
    public function run(): void
    {
        $this->seedLevel1();
        $this->seedLevel2();
        $this->seedLevel3();
    }

    // ──────────────────────────────────────────────
    // Level 1 — Beginner (Foundation)
    // ──────────────────────────────────────────────
    private function seedLevel1(): void
    {
        $package = Package::firstOrCreate(
            ['title' => 'Mindset for IELTS — Level 1 (Foundation)'],
            [
                'slug' => 'mindset-ielts-level-1',
                'description' => 'Build essential skills across all four IELTS modules. Designed for learners targeting Band 4.0–5.5 with structured practice and guided audio.',
                'price' => 24.99,
                'is_active' => true,
                'level' => 'Beginner',
                'duration_hours' => 20,
                'rating' => 4.75,
                'students_count' => 860,
                'is_featured' => false,
                'outcomes' => [
                    'Xây dựng từ vựng nền tảng cho 4 kỹ năng.',
                    'Hiểu cấu trúc bài thi và cách phân bổ thời gian.',
                    'Luyện nghe với tốc độ chậm và rõ ràng.',
                    'Viết câu đơn giản đúng ngữ pháp cho Task 1 và Task 2.',
                ],
            ]
        );

        $unit1 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 1: Introduction to IELTS'],
            ['description' => 'Overview of all four modules, question types, and scoring criteria.', 'order' => 1]
        );

        $this->ensurePlaceholder('documents/mindset_l1_intro.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit1->id, 'title' => 'IELTS Overview & Format Guide.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l1_intro.pdf',
                'total_pages' => 20,
                'preview_pages' => 3,
                'preview_content' => [
                    [
                        'heading' => 'What is the IELTS test?',
                        'body' => "The International English Language Testing System (IELTS) measures your ability to communicate in English across four skills: Listening, Reading, Writing and Speaking. It is accepted by over 11,000 organisations worldwide.\n\nThere are two versions: Academic (for university admission) and General Training (for migration and work). Both share the same Listening and Speaking tests, but Reading and Writing differ in topic and difficulty.",
                    ],
                    [
                        'heading' => 'Test format and timing',
                        'body' => "Listening: 30 minutes + 10 minutes transfer time (paper) or 2 minutes (computer). Four sections, 40 questions.\n\nReading: 60 minutes. Three passages, 40 questions.\n\nWriting: 60 minutes. Task 1 (150 words minimum) and Task 2 (250 words minimum).\n\nSpeaking: 11–14 minutes. Three parts: introduction, long turn, and discussion.",
                    ],
                    [
                        'heading' => 'How IELTS is scored',
                        'body' => "Each module receives a band score from 0 to 9 in half-band increments (e.g. 5.5, 6.0, 6.5). The Overall Band Score is the average of the four module scores, rounded to the nearest half band.\n\nListening and Reading are marked by counting correct answers. Writing and Speaking are assessed against four criteria each by trained examiners.",
                    ],
                ],
            ]
        );

        $unit2 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 2: Everyday Listening'],
            ['description' => 'Practice with slow, clear audio covering daily situations.', 'order' => 2]
        );

        $this->ensurePlaceholder('documents/mindset_l1_listening.mp3', true);

        Document::updateOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Foundation Listening Practice.mp3'],
            [
                'type' => 'audio',
                'file_path' => 'documents/mindset_l1_listening.mp3',
                'total_pages' => 1,
                'preview_pages' => 1,
                'preview_content' => [
                    [
                        'heading' => 'Section 1 · Enrolling at a language school',
                        'body' => "Receptionist: Good morning, Oakwood Language Centre. How can I help?\n\nStudent: Hi, I'd like to sign up for the intermediate English class. When does it start?\n\nReceptionist: The next term begins on the second of March. Classes run Monday to Thursday, from nine thirty until twelve.\n\nStudent: Is there a placement test?\n\nReceptionist: Yes, we ask all new students to take a short online test before the first class. It takes about twenty minutes and covers grammar and vocabulary.\n\nStudent: And how much does the course cost?\n\nReceptionist: It's four hundred and fifty pounds for the ten-week term. That includes course materials but not the textbook, which is twenty-five pounds.",
                    ],
                ],
            ]
        );

        $unit3 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 3: Simple Writing'],
            ['description' => 'Learn to write clear sentences and short paragraphs for Tasks 1 and 2.', 'order' => 3]
        );

        $this->ensurePlaceholder('documents/mindset_l1_writing.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit3->id, 'title' => 'Writing Foundations Workbook.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l1_writing.pdf',
                'total_pages' => 22,
                'preview_pages' => 3,
                'preview_content' => [
                    [
                        'heading' => 'Lesson 1 · Writing a complete sentence',
                        'body' => "Every sentence in IELTS Writing must have a subject, a verb and a complete idea. Compare:\n\n✗ Because the weather was bad. (fragment)\n✓ The event was cancelled because the weather was bad.\n\nBegin by checking that each sentence can stand on its own. If it starts with 'because', 'although' or 'while', it needs a main clause to complete the thought.",
                    ],
                    [
                        'heading' => 'Lesson 2 · Describing a bar chart (Task 1)',
                        'body' => "A bar chart shows quantities for different categories. Your overview should identify the highest and lowest bars, and any obvious pattern.\n\nUseful language:\n• 'The chart compares…'\n• 'The highest figure was recorded in…'\n• 'Overall, X had the largest share, while Y had the smallest.'\n\nAvoid listing every bar. Select the most significant data points and describe them with comparisons.",
                    ],
                    [
                        'heading' => 'Lesson 3 · Linking ideas in Task 2',
                        'body' => "Simple linking words are enough at this level. Use 'and' to add, 'but' to contrast, 'so' to show result, and 'because' to give a reason.\n\nExample: Many people drive to work because public transport is unreliable. However, cycling is becoming more popular in some cities.\n\nAvoid starting every sentence with 'Moreover' or 'Furthermore'. Natural linking often comes from repeating key nouns rather than stacking connectors.",
                    ],
                ],
            ]
        );
    }

    // ──────────────────────────────────────────────
    // Level 2 — Intermediate (Targeting Band 5.5–6.5)
    // ──────────────────────────────────────────────
    private function seedLevel2(): void
    {
        $package = Package::firstOrCreate(
            ['title' => 'Mindset for IELTS — Level 2 (Intermediate)'],
            [
                'slug' => 'mindset-ielts-level-2',
                'description' => 'Strengthen academic reading speed, expand essay structures and handle faster audio. Aimed at learners working toward Band 5.5–6.5.',
                'price' => 34.99,
                'is_active' => true,
                'level' => 'Intermediate',
                'duration_hours' => 30,
                'rating' => 4.82,
                'students_count' => 1120,
                'is_featured' => true,
                'outcomes' => [
                    'Đọc nhanh hơn với kỹ thuật skimming và scanning.',
                    'Viết bài luận Task 2 có cấu trúc rõ ràng.',
                    'Xử lý Sections 2 và 3 trong Listening.',
                    'Dùng paraphrase tự nhiên trong Speaking Part 2.',
                ],
            ]
        );

        $unit1 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 1: Reading Strategies'],
            ['description' => 'Skimming, scanning, and paragraph-matching for academic passages.', 'order' => 1]
        );

        $this->ensurePlaceholder('documents/mindset_l2_reading.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit1->id, 'title' => 'Academic Reading Strategies.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l2_reading.pdf',
                'total_pages' => 28,
                'preview_pages' => 4,
                'preview_content' => [
                    [
                        'heading' => 'Strategy 1 · Skimming for gist',
                        'body' => "Skimming means reading the title, the first sentence of each paragraph, and the final sentence of the passage. The goal is to build a mental map in about 90 seconds before looking at the questions.\n\nWhy it works: most IELTS questions point to one or two paragraphs. If you know what each paragraph does (defines, compares, gives examples), you can jump straight to the right section.",
                    ],
                    [
                        'heading' => 'Strategy 2 · Scanning for detail',
                        'body' => "Scanning is searching for a specific piece of information — a name, a date, or a number. Move your eyes quickly down the page and look for the shape of the word rather than reading every line.\n\nOnce you locate the keyword, read the full sentence and the sentence after it. The answer usually sits in the relationship between those two sentences.",
                    ],
                    [
                        'heading' => 'Practice passage · Coral reef decline',
                        'body' => "Coral reefs cover less than one per cent of the ocean floor but support roughly a quarter of all marine species. Over the past forty years, rising sea temperatures have triggered repeated mass bleaching events, during which corals expel the algae that give them colour and energy.\n\nThe most severe episode on record occurred in 2016, when an estimated 30 per cent of coral on Australia's Great Barrier Reef died. Scientists have since identified heat-resistant strains that may help reefs recover, but the window for intervention is narrow.",
                    ],
                    [
                        'heading' => 'Questions 1–5 · True / False / Not Given',
                        'body' => "1. Coral reefs occupy more than five per cent of the ocean floor.\n2. Bleaching occurs when corals lose their algae.\n3. The worst bleaching event recorded happened in 2016.\n4. All scientists agree that reefs will fully recover within a decade.\n5. Some coral strains are naturally more resistant to heat.\n\nWrite TRUE, FALSE, or NOT GIVEN for each statement.",
                    ],
                ],
            ]
        );

        $unit2 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 2: Essay Structure'],
            ['description' => 'Plan, write and revise a four-paragraph Task 2 essay.', 'order' => 2]
        );

        $this->ensurePlaceholder('documents/mindset_l2_writing.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Task 2 Essay Builder.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l2_writing.pdf',
                'total_pages' => 24,
                'preview_pages' => 3,
                'preview_content' => [
                    [
                        'heading' => 'Step 1 · Analyse the question',
                        'body' => "Read the question twice. Underline the topic (what the essay is about), the focus (the specific angle you must address), and the instruction (discuss, agree/disagree, or evaluate).\n\nExample: 'Some people believe that universities should focus only on academic subjects, while others think practical skills should also be taught. Discuss both views and give your opinion.'\n\nTopic: university education. Focus: academic vs practical. Instruction: discuss + opinion.",
                    ],
                    [
                        'heading' => 'Step 2 · Plan in 5 minutes',
                        'body' => "Write four bullet points — one per paragraph.\n\n1. Introduction: paraphrase the question and state your position.\n2. Body 1: the first view + reasons + example.\n3. Body 2: the second view + reasons + example.\n4. Conclusion: your opinion + one-sentence justification.\n\nDo not start writing until you have four clear ideas. A plan prevents the essay from drifting off topic.",
                    ],
                    [
                        'heading' => 'Step 3 · Write naturally',
                        'body' => "Avoid memorised phrases like 'In today's modern world' or 'It is a widely debated topic'. Examiners recognise templates and they lower your Lexical Resource score.\n\nInstead, start with the subject: 'Universities exist primarily to…' or 'Practical skills are…'. Let the content drive the language, not the other way round.",
                    ],
                ],
            ]
        );

        $unit3 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 3: Listening Sections 2–3'],
            ['description' => 'Handle group discussions, multiple speakers, and faster speech.', 'order' => 3]
        );

        $this->ensurePlaceholder('documents/mindset_l2_listening.mp3', true);

        Document::updateOrCreate(
            ['unit_id' => $unit3->id, 'title' => 'Intermediate Listening Drill.mp3'],
            [
                'type' => 'audio',
                'file_path' => 'documents/mindset_l2_listening.mp3',
                'total_pages' => 1,
                'preview_pages' => 1,
                'preview_content' => [
                    [
                        'heading' => 'Section 2 · Guided tour of a museum',
                        'body' => "Guide: Welcome to the City Science Museum. Before we start, let me give you a quick layout of the building. We're standing in the main lobby. Directly ahead is the Earth Gallery, which covers geology and climate change. To the left you'll find the Innovation Lab — that's the interactive area where you can try the experiments.\n\nThe café is on the second floor, next to the temporary exhibition space. This month's exhibition is about space exploration, and it closes at the end of next week, so I'd recommend visiting it today if you can.\n\nToilets are on every floor, beside the lifts. If you need the gift shop, it's behind us, just past the ticket desk.",
                    ],
                ],
            ]
        );
    }

    // ──────────────────────────────────────────────
    // Level 3 — Advanced (Targeting Band 6.5–8.0+)
    // ──────────────────────────────────────────────
    private function seedLevel3(): void
    {
        $package = Package::firstOrCreate(
            ['title' => 'Mindset for IELTS — Level 3 (Advanced)'],
            [
                'slug' => 'mindset-ielts-level-3',
                'description' => 'Polish exam technique for Band 6.5–8.0+. Dense academic passages, Section 4 lectures, and nuanced essay arguments.',
                'price' => 44.99,
                'is_active' => true,
                'level' => 'Advanced',
                'duration_hours' => 36,
                'rating' => 4.91,
                'students_count' => 740,
                'is_featured' => false,
                'outcomes' => [
                    'Xử lý đoạn văn academic dài và phức tạp.',
                    'Viết bài luận Band 7+ với lập luận sắc bén.',
                    'Nghe Section 4 lecture không bỏ sót chi tiết.',
                    'Paraphrase ở cấp độ câu cho Speaking Part 3.',
                ],
            ]
        );

        $unit1 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 1: Dense Academic Reading'],
            ['description' => 'Tackle long, complex passages with multiple question types.', 'order' => 1]
        );

        $this->ensurePlaceholder('documents/mindset_l3_reading.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit1->id, 'title' => 'Advanced Reading Practice Set.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l3_reading.pdf',
                'total_pages' => 40,
                'preview_pages' => 4,
                'preview_content' => [
                    [
                        'heading' => 'Passage 1 · The economics of attention',
                        'body' => "In a world where information is abundant, attention has become the scarce resource. Herbert Simon predicted this shift in 1971, writing that 'a wealth of information creates a poverty of attention'. Fifty years later, the prediction has proved remarkably accurate.\n\nDigital platforms compete for minutes of user engagement. The design of notifications, infinite scroll and autoplay video all exploit cognitive biases — the tendency to check for novelty, the discomfort of an unresolved prompt. Critics argue that these techniques are not neutral features but deliberate instruments of capture.",
                    ],
                    [
                        'heading' => 'Passage 1 (cont.) · Measuring the cost',
                        'body' => "Researchers at the University of California, Irvine found that after an interruption it takes an average of 23 minutes to return to the original task with the same depth of focus. In a typical knowledge-work day, an employee may experience 50 or more such interruptions.\n\nThe aggregate cost is difficult to quantify, but estimates from the American Psychological Association place the productivity loss at around 40 per cent of an individual's effective working time. The paradox is that the tools designed to improve communication are themselves the primary source of distraction.",
                    ],
                    [
                        'heading' => 'Questions 1–6 · Summary completion',
                        'body' => "Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.\n\nHerbert Simon observed that abundant information leads to a scarcity of (1) ______ . Digital platforms use design patterns that exploit users' (2) ______ . After an interruption, returning to deep focus takes approximately (3) ______ minutes. The APA estimates that productivity loss can reach (4) ______ per cent. The tools built for better (5) ______ are ironically the main cause of (6) ______ .",
                    ],
                    [
                        'heading' => 'Strategy clinic · Handling multi-type question sets',
                        'body' => "At Band 7+, reading passages often combine three or four question types: summary completion, matching headings, True/False/Not Given, and detail questions. Process them in the order they appear in the question paper — this usually follows the passage order.\n\nDo matching headings last. They require an overview of each paragraph, which you build naturally while answering the detail questions first. Reading the passage twice wastes time; reading it once while answering sequentially does not.",
                    ],
                ],
            ]
        );

        $unit2 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 2: Band 7+ Writing'],
            ['description' => 'Craft persuasive essays with nuanced arguments and varied sentence structures.', 'order' => 2]
        );

        $this->ensurePlaceholder('documents/mindset_l3_writing.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Advanced Essay Clinic.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l3_writing.pdf',
                'total_pages' => 30,
                'preview_pages' => 4,
                'preview_content' => [
                    [
                        'heading' => 'Clinic 1 · The difference between Band 6.5 and Band 7',
                        'body' => "At Band 6.5, the essay addresses the question and has a clear structure, but ideas may be under-developed or the argument may drift. At Band 7, every paragraph directly serves the thesis, examples are specific (not generic), and the writer demonstrates clear progression of ideas.\n\nThe most common upgrade path: replace general statements with concrete evidence. Instead of 'Many people think education is important', write 'A 2019 OECD study found that each additional year of schooling raises lifetime earnings by 8–13 per cent'.",
                    ],
                    [
                        'heading' => 'Clinic 2 · Complex sentences without errors',
                        'body' => "Examiners look for a range of structures: relative clauses, conditionals, passive voice, and participle phrases. However, a complex sentence with a grammatical error scores lower than a simple sentence without one.\n\nPractice rule: write the sentence simply first, then upgrade it. If the upgrade introduces an error, keep the simple version.\n\nSimple: Cities are growing. This creates pressure on housing.\nUpgraded: As cities grow, the resulting pressure on housing is forcing planners to reconsider zoning regulations.",
                    ],
                    [
                        'heading' => 'Model essay · Technology and social isolation',
                        'body' => "Question: Some argue that modern technology has made people more isolated. To what extent do you agree or disagree?\n\nIt is often claimed that smartphones and social media have replaced genuine human interaction. While there is evidence that screen time correlates with feelings of loneliness among adolescents, the relationship between technology and isolation is more nuanced than this claim suggests.\n\nTechnology has expanded the range of social connection. Video calls allow families separated by continents to maintain daily contact. Online communities provide support for people with rare conditions who would otherwise have no local peers. These connections are not inferior simply because they occur through a screen.",
                    ],
                    [
                        'heading' => 'Self-editing checklist',
                        'body' => "1. Does the introduction answer the question directly? Remove any generic opening.\n2. Does each body paragraph begin with a clear topic sentence?\n3. Is every claim supported by a reason, an example, or a concession?\n4. Does the conclusion add value, or merely repeat the introduction?\n5. Check articles (a/an/the): these account for roughly 30% of grammatical errors at Band 6–7.\n6. Check subject-verb agreement in long sentences where the subject and verb are far apart.",
                    ],
                ],
            ]
        );

        $unit3 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 3: Section 4 Mastery'],
            ['description' => 'Handle fast-paced academic lectures with note completion and multiple choice.', 'order' => 3]
        );

        $this->ensurePlaceholder('documents/mindset_l3_lecture.mp3', true);

        Document::updateOrCreate(
            ['unit_id' => $unit3->id, 'title' => 'Section 4 Lecture Practice.mp3'],
            [
                'type' => 'audio',
                'file_path' => 'documents/mindset_l3_lecture.mp3',
                'total_pages' => 1,
                'preview_pages' => 1,
                'preview_content' => [
                    [
                        'heading' => 'Section 4 · Behavioural economics and public policy',
                        'body' => "Lecturer: Today I want to examine how governments have begun applying insights from behavioural economics to public policy — an approach often called 'nudging'.\n\nThe term was popularised by Thaler and Sunstein in 2008. A nudge is any change in the way choices are presented that alters behaviour without restricting options. The classic example is placing fruit at eye level in a school cafeteria, which increases consumption without banning less healthy alternatives.\n\nThe UK government established a Behavioural Insights Team in 2010. One of their early projects involved tax collection. By adding a single sentence to reminder letters — 'Most people in your area have already paid their tax' — the team increased on-time payment by over five percentage points. The intervention cost almost nothing to implement, yet it recovered millions in overdue revenue.\n\nCritics raise two concerns. First, that nudges can be manipulative if citizens are not aware they are being influenced. Second, that nudges address symptoms rather than structural causes. A sugar tax, for instance, changes the economic incentive directly, whereas a nudge merely rearranges the display.",
                    ],
                ],
            ]
        );

        $this->ensurePlaceholder('documents/mindset_l3_transcripts.pdf');

        Document::updateOrCreate(
            ['unit_id' => $unit3->id, 'title' => 'Lecture Transcripts & Answer Key.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/mindset_l3_transcripts.pdf',
                'total_pages' => 16,
                'preview_pages' => 2,
                'preview_content' => [
                    [
                        'heading' => 'Section 4 transcript — Behavioural economics',
                        'body' => "Lecturer: Today I want to examine how governments have begun applying insights from behavioural economics to public policy — an approach often called 'nudging'.\n\n[Full transcript of the lecture audio, including signpost language and pauses indicated by ellipses.]\n\nNote: This preview shows the first section only. The complete transcript covers three practice lectures with answer keys.",
                    ],
                    [
                        'heading' => 'Answer key — Lecture 1',
                        'body' => "31. nudging / nudge\n32. Thaler and Sunstein / 2008\n33. fruit\n34. eye level\n35. Behavioural Insights Team / 2010\n36. tax collection\n37. five percentage points / 5%\n38. manipulative\n39. structural causes\n40. sugar tax",
                    ],
                ],
            ]
        );
    }

    private function ensurePlaceholder(string $path, bool $isAudio = false): void
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            $disk->put($path, $isAudio
                ? $this->wavFixture()
                : $this->pdfFixture()
            );
        }
    }

    private function pdfFixture(): string
    {
        $stream = 'BT /F1 18 Tf 72 720 Td (Mindset for IELTS practice preview) Tj ET';
        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream",
        ];
        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objects as $number => $object) {
            $offsets[$number + 1] = strlen($pdf);
            $pdf .= ($number + 1)." 0 obj\n{$object}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        for ($i = 1; $i <= count($objects); $i++) {
            $pdf .= sprintf('%010d 00000 n %s', $offsets[$i], "\n");
        }
        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF\n";

        return $pdf;
    }

    private function wavFixture(): string
    {
        $sampleRate = 8000;
        $samples = str_repeat("\x00\x00", $sampleRate * 2);

        return 'RIFF'.pack('V', 36 + strlen($samples)).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, $sampleRate, $sampleRate * 2, 2, 16).'data'.pack('V', strlen($samples)).$samples;
    }
}
