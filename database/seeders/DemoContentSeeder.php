<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Exam;
use App\Models\Option;
use App\Models\Package;
use App\Models\Question;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class DemoContentSeeder extends Seeder
{
    /**
     * Extra demo content generated through factories.
     *
     * Every block is guarded by its title so `docker compose` restarts can run
     * the seeder repeatedly without duplicating rows. Documents only ever store
     * their preview pages; the full course content is not part of the payload.
     */
    public function run(): void
    {
        $this->seedPackage(
            'IELTS Listening Intensive Band 7.5+',
            [
                'description' => 'Map labelling, note-taking and Section 4 lectures with guided practice.',
                'price' => 39.99,
                'is_active' => true,
                'level' => 'Beginner',
                'outcomes' => [
                    'Nhận diện và xử lý map labelling, form completion.',
                    'Ghi chú hiệu quả khi nghe Section 4.',
                    'Luyện với transcript và đáp án chi tiết.',
                    'Mở lại tài liệu đã mua bất cứ lúc nào.',
                ],
            ],
            [
                [
                    'title' => 'Unit 1: Map & Plan Labelling',
                    'description' => 'Follow directions, identify landmarks and avoid common distractor traps.',
                    'order' => 1,
                    'documents' => [
                        [
                            'title' => 'Map Labelling Workbook.pdf',
                            'type' => 'pdf',
                            'total_pages' => 24,
                            'preview_pages' => 4,
                            'preview_content' => [
                                [
                                    'heading' => 'Map labelling · The language of location',
                                    'body' => "Map labelling questions test whether you can follow a route while matching labels to a plan. The recording usually moves from one landmark to another, and each landmark is described with a mix of direction and position language.\n\nLearn the difference between 'opposite', 'across from' and 'next to'. A building can be opposite the station while still being across the road from it, and examiners often use both descriptions in the same sentence.",
                                ],
                                [
                                    'heading' => 'Practice set A · Questions 1–5',
                                    'body' => "Label the map below. Write the correct letter, A–H, next to Questions 1–5.\n\n1. The café\n2. The bicycle racks\n3. The information desk\n4. The children's play area\n5. The car park entrance\n\nYou will hear a guide describing the layout of a community garden. The map shows the main paths, the greenhouse and the river.",
                                ],
                                [
                                    'heading' => 'Answer walkthrough',
                                    'body' => "For Question 1, the speaker says the café is 'just past the greenhouse, on your left'. That places it at label C, not at the greenhouse itself. The word 'past' is the key: it tells you the café comes after the greenhouse on the route.\n\nFor Question 2, the bicycle racks are described as 'beside the north gate'. Two labels sit near the gate, but only one is on the north side. Always check the compass or the gate name before choosing.",
                                ],
                                [
                                    'heading' => 'Common traps · Direction changes',
                                    'body' => "Speakers often correct themselves mid-sentence. Listen for phrases such as 'actually', 'sorry' and 'I mean'. The corrected information is the answer; the first version is a distractor.\n\nAnother trap is a landmark mentioned only to orient the listener. If the speaker says 'you'll pass the library', the library may not be one of the answers. Read the question labels before the audio starts so you know exactly what to listen for.",
                                ],
                            ],
                        ],
                    ],
                ],
                [
                    'title' => 'Unit 2: Section 4 Lecture Notes',
                    'description' => 'Capture signposted ideas in a monologue without losing the thread.',
                    'order' => 2,
                    'documents' => [
                        [
                            'title' => 'Lecture Note-taking Audio.mp3',
                            'type' => 'audio',
                            'total_pages' => 1,
                            'preview_pages' => 1,
                            'preview_content' => [
                                [
                                    'heading' => 'Section 4 · The secret life of city trees',
                                    'body' => "Lecturer: Today I want to challenge the assumption that a city tree is simply decoration. A mature tree does far more than provide shade. It intercepts rainfall, filters particulates from the air and creates a small pocket of cooler air beneath its canopy.\n\nRecent measurements in Melbourne found that a single large street tree can lower the surface temperature of the pavement beneath it by several degrees. The effect is strongest when trees are planted in connected groups rather than as isolated specimens.\n\nThe practical lesson is that urban forestry is a matter of networks, not individual trees. A row of young trees with shared root space will outperform a single large tree in a paved square.",
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->seedPackage(
            'IELTS Writing Task 2 Clinic',
            [
                'description' => 'Plan, structure and refine a Band 7+ argument without memorised templates.',
                'price' => 29.99,
                'is_active' => true,
                'level' => 'Intermediate',
                'outcomes' => [
                    'Xây dựng lập luận rõ ràng cho Task 2.',
                    'Viết mở bài, thân bài và kết bài đúng trọng tâm.',
                    'Đọc model essay và dùng checklist tự chỉnh sửa.',
                    'Mở lại tài liệu đã mua bất cứ lúc nào.',
                ],
            ],
            [
                [
                    'title' => 'Unit 1: Argument & Cohesion',
                    'description' => 'Build a clear position, support it with evidence and link ideas naturally.',
                    'order' => 1,
                    'documents' => [
                        [
                            'title' => 'Task 2 Model Essays.pdf',
                            'type' => 'pdf',
                            'total_pages' => 28,
                            'preview_pages' => 4,
                            'preview_content' => [
                                [
                                    'heading' => 'Model essay · Public transport',
                                    'body' => "Some people believe that cities should make public transport free in order to reduce congestion. Others argue that better services matter more than lower fares. Discuss both views and give your own opinion.\n\nThe essay below is a Band 8 model. Read it once for the overall position, then again to notice how each paragraph returns to the central claim.",
                                ],
                                [
                                    'heading' => 'Model essay · Full response',
                                    'body' => "Congestion is often framed as a pricing problem, but the evidence suggests it is just as much a question of reliability. Making buses and trains free may attract some drivers, yet it is unlikely to persuade commuters who already own a car if those services remain slow and unpredictable.\n\nThose who support free fares point to the immediate relief it offers to low-income households. A fare-free network removes a daily cost and can make short journeys more attractive than driving. However, the policy is expensive to sustain, and without extra capacity it may simply move crowds from one crowded service to another.\n\nIn my view, affordability and quality are not opposites. Cities should begin with a reliable, frequent network and then remove fares on the routes where they will change behaviour. A targeted approach is more likely to reduce congestion than a universal subsidy.",
                                ],
                                [
                                    'heading' => 'Cohesion clinic · Linking without templates',
                                    'body' => "Strong cohesion is rarely created by adding 'Moreover' to the start of every sentence. It comes from repeating key nouns, using pronouns carefully and ordering information so the reader can predict what comes next.\n\nNotice how the model returns to 'the network', 'the policy' and 'a targeted approach'. These repeated ideas create a chain. A linking word helps only when the logical relationship is already clear.",
                                ],
                                [
                                    'heading' => 'Editing checklist',
                                    'body' => "Before you submit, check four things: does every paragraph have one main job; does each claim have a reason or example; are the linking words accurate rather than decorative; and does the conclusion answer the exact question asked?\n\nRead the introduction and conclusion side by side. If they could belong to two different essays, your position has drifted. Fix the argument before polishing the vocabulary.",
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->seedPackage(
            'IELTS Reading Speed Lab',
            [
                'description' => 'Timed skimming and scanning drills for dense academic passages.',
                'price' => 34.99,
                'is_active' => true,
                'level' => 'Advanced',
                'outcomes' => [
                    'Đọc nhanh, quét thông tin và quản lý thời gian.',
                    'Xử lý True/False/Not Given và matching headings.',
                    'Luyện drill theo từng dạng câu hỏi.',
                    'Mở lại tài liệu đã mua bất cứ lúc nào.',
                ],
            ],
            [
                [
                    'title' => 'Unit 1: Skimming & Scanning Drills',
                    'description' => 'Build a repeatable routine for the first 60 seconds of any passage.',
                    'order' => 1,
                    'documents' => [
                        [
                            'title' => 'Speed Reading Drills.pdf',
                            'type' => 'pdf',
                            'total_pages' => 32,
                            'preview_pages' => 4,
                            'preview_content' => [
                                [
                                    'heading' => 'Drill 1 · The 60-second map',
                                    'body' => "Read the title, the first sentence of every paragraph and the final sentence of the passage. Then write three words in the margin that summarise what each paragraph does: defines, compares, criticises, gives an example.\n\nThis routine is not about reading faster. It is about deciding where to read slowly. Most questions point to one or two paragraphs, and a map prevents you from rereading the whole page.",
                                ],
                                [
                                    'heading' => 'Drill 2 · Scanning for names and numbers',
                                    'body' => "When a question contains a date, a name or a technical term, scan for its shape rather than its meaning. Capital letters and digits stand out on the page even before you process the sentence.\n\nOnce you find the term, read the sentence before it and the sentence after it. The answer is usually in the relationship between those sentences, not in the line itself.",
                                ],
                                [
                                    'heading' => 'Drill 3 · True / False / Not Given',
                                    'body' => "Treat this question type as a comparison exercise. Underline the part of the statement that makes a claim, then find the exact place in the passage where that claim is addressed.\n\nIf the passage says the opposite, the answer is False. If the passage is silent on the specific claim, the answer is Not Given. Do not use your own knowledge to fill the gap, even when the statement is factually true.",
                                ],
                                [
                                    'heading' => 'Drill 4 · Time audit',
                                    'body' => "Spend no more than 18 minutes on each reading passage. If a question takes longer than 90 seconds, mark your best answer and move on. A blank answer earns nothing, and the next passage may contain easier marks.\n\nAt the end of the test, return only to the questions you flagged. Resist the urge to reread entire passages; use your paragraph map to jump straight back to the relevant lines.",
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        );

        $this->seedExam(
            'IELTS Listening Practice Test 2',
            [
                'description' => 'A 40-minute listening set covering form completion, maps and a Section 4 lecture.',
                'duration_minutes' => 40,
                'passing_score' => 65,
            ],
            [
                [
                    'question_text' => 'How much does it cost to hire a racket at the sports centre?',
                    'points' => 10,
                    'options' => [
                        ['£1', false],
                        ['£2', true],
                        ['£4', false],
                        ['Free of charge', false],
                    ],
                ],
                [
                    'question_text' => 'Where should visitors leave their bags?',
                    'points' => 10,
                    'options' => [
                        ['In the café', false],
                        ['At reception', false],
                        ['In the lockers', true],
                        ['On the courts', false],
                    ],
                ],
                [
                    'question_text' => 'What does the receptionist recommend booking in advance?',
                    'points' => 10,
                    'options' => [
                        ['Rackets', true],
                        ['Shuttlecocks', false],
                        ['Changing rooms', false],
                        ['Parking spaces', false],
                    ],
                ],
            ]
        );

        $this->seedExam(
            'IELTS Academic Reading Mock Test 2',
            [
                'description' => 'Three reading passages with True/False/Not Given, matching headings and detail questions.',
                'duration_minutes' => 60,
                'passing_score' => 70,
            ],
            [
                [
                    'question_text' => 'What did researchers initially expect about the Paris hives?',
                    'points' => 10,
                    'options' => [
                        ['They would struggle with air pollution', true],
                        ['They would produce more honey than rural hives', false],
                        ['They would attract too many wild pollinators', false],
                        ['They would be banned by city planners', false],
                    ],
                ],
                [
                    'question_text' => 'According to critics, what is a risk of having too many urban hives?',
                    'points' => 10,
                    'options' => [
                        ['Honey prices will fall', false],
                        ['Wild pollinators may be crowded out', true],
                        ['Rooftops will become too heavy', false],
                        ['Trees will produce fewer flowers', false],
                    ],
                ],
                [
                    'question_text' => 'What natural system inspired the ventilation of the Eastgate Centre?',
                    'points' => 10,
                    'options' => [
                        ['Lotus leaves', false],
                        ['Termite mounds', true],
                        ['Bee hives', false],
                        ['River deltas', false],
                    ],
                ],
            ]
        );
    }

    private function seedPackage(string $title, array $attributes, array $units): void
    {
        if ($existing = Package::where('title', $title)->first()) {
            $existing->update(array_filter([
                'level' => $attributes['level'] ?? null,
                'outcomes' => $attributes['outcomes'] ?? null,
            ], fn ($value) => $value !== null));

            return;
        }

        $package = Package::factory()->create(['title' => $title] + $attributes);

        foreach ($units as $unitData) {
            $documents = $unitData['documents'] ?? [];
            unset($unitData['documents']);

            $unit = Unit::factory()->create(
                ['package_id' => $package->id] + $unitData
            );

            foreach ($documents as $documentData) {
                Document::factory()->create(
                    ['unit_id' => $unit->id] + $documentData
                );
            }
        }
    }

    private function seedExam(string $title, array $attributes, array $questions): void
    {
        if (Exam::where('title', $title)->exists()) {
            return;
        }

        $exam = Exam::factory()->create(['title' => $title] + $attributes);

        foreach ($questions as $questionData) {
            $options = $questionData['options'] ?? [];
            unset($questionData['options']);

            $question = Question::factory()->create([
                'exam_id' => $exam->id,
                'type' => 'single_choice',
            ] + $questionData);

            foreach ($options as [$text, $isCorrect]) {
                Option::factory()->create([
                    'question_id' => $question->id,
                    'option_text' => $text,
                    'is_correct' => $isCorrect,
                ]);
            }
        }
    }
}
