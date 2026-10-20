<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Package;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class IeltsPackageSeeder extends Seeder
{
    public function run(): void
    {
        $package = Package::firstOrCreate(
            ['title' => 'IELTS Comprehensive Band 8.0+ Prep'],
            [
                'description' => 'Master all 4 IELTS modules with authentic Cambridge practice tests, audio tracks, and strategies.',
                'price' => 49.99,
                'is_active' => true,
            ]
        );

        $package->update([
            'slug' => 'ielts-comprehensive-band-8',
            'level' => 'Advanced',
            'duration_hours' => 42,
            'rating' => 4.90,
            'students_count' => 1280,
            'is_featured' => true,
            'outcomes' => [
                'Nắm chiến lược làm bài cho cả 4 kỹ năng.',
                'Xử lý True/False/Not Given và matching headings.',
                'Luyện đề có thời gian và xem lại đáp án chi tiết.',
                'Mở lại tài liệu đã mua trong thư viện cá nhân.',
            ],
        ]);

        $unit1 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 1: Academic & General Reading Mastery'],
            ['description' => 'Skimming, scanning, True/False/Not Given, and summary completion mastery.', 'order' => 1]
        );

        $this->ensurePlaceholder(
            'documents/reading_handbook.pdf',
            "%PDF-1.4\n% IELTS placeholder document\n%%EOF\n"
        );

        Document::updateOrCreate(
            ['unit_id' => $unit1->id, 'title' => 'Academic Reading Official Handbook.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/reading_handbook.pdf',
                'total_pages' => 36,
                'preview_pages' => 5,
                'preview_content' => [
                    [
                        'heading' => 'Reading Passage 1 · The Return of the Urban Bee',
                        'body' => "In the past decade, city planners across Europe have quietly become beekeepers. Rooftops, railway embankments and disused churchyards are now home to thousands of hives, and the honey they produce has become a symbol of urban renewal.\n\nThe trend began in Paris, where a pilot project placed twelve hives on the roof of a national opera house. Researchers expected the colonies to struggle with air pollution. Instead, the bees thrived, feeding on the city's surprising variety of flowering trees, balcony gardens and roadside wildflowers.\n\nUrban beekeeping is not without critics. Some ecologists warn that too many hives can crowd out wild pollinators, which are often more effective at pollinating native plants. The debate has pushed several cities to introduce hive limits and to fund wildflower corridors instead of simply adding more colonies.",
                    ],
                    [
                        'heading' => 'Questions 1–7 · True / False / Not Given',
                        'body' => "Do the following statements agree with the information in Reading Passage 1?\n\nWrite TRUE if the statement agrees with the information, FALSE if it contradicts it, and NOT GIVEN if there is no information on this.\n\n1. The first Paris hives were placed on the roof of an opera house.\n2. Researchers were initially worried that pollution would harm the bees.\n3. Urban honey is now more expensive than rural honey.\n4. Some scientists believe wild pollinators are better at pollinating native plants.\n5. Every European city has introduced a limit on the number of hives.\n6. Wildflower corridors are one alternative to adding more hives.\n7. The writer believes urban beekeeping should be banned.",
                    ],
                    [
                        'heading' => 'Reading Passage 2 · Biomimicry in Architecture',
                        'body' => "Architects have long borrowed from nature, but the emerging field of biomimicry goes further than copying a shape. It studies how natural systems solve problems and then translates those strategies into buildings.\n\nOne example is the Eastgate Centre in Harare, Zimbabwe, which was modelled on the ventilation systems of termite mounds. Instead of relying on conventional air conditioning, the building draws cool air through openings at its base and releases warm air through chimneys at the top. The design uses far less energy than a comparable conventional building.\n\nA second example comes from the lotus leaf, whose microscopic surface texture repels water and dirt. Coatings inspired by the leaf are now used on glass facades, reducing the need for cleaning and cutting maintenance costs. Both cases show that biomimicry is most powerful when it asks how a system works, not merely what it looks like.",
                    ],
                    [
                        'heading' => 'Questions 14–19 · Matching Headings',
                        'body' => "Choose the correct heading for each paragraph of Reading Passage 2.\n\nList of Headings\nA. A technology that failed commercially\nB. Learning from termite ventilation\nC. The cost of cleaning glass towers\nD. Self-cleaning surfaces inspired by plants\nE. A definition of biomimicry\nF. Why architects avoid natural materials\n\n14. Paragraph 1\n15. Paragraph 2\n16. Paragraph 3\n17. What is the main purpose of the passage?\n18. Which building is used as an example of natural ventilation?\n19. The word 'translate' in paragraph 1 is closest in meaning to…",
                    ],
                    [
                        'heading' => 'Strategy clinic · Skimming a dense passage',
                        'body' => "Before reading every word, spend 60 seconds on the title, the first sentence of each paragraph and any names, dates or numbers. This gives you a map of the passage.\n\nWhen a question asks about the writer's opinion, look for evaluative language such as 'surprisingly', 'worryingly' or 'inevitably'. These words carry the writer's attitude even when the facts are neutral.\n\nIf a statement contains an absolute word such as 'all', 'every' or 'never', check the passage carefully. Absolute statements are often contradicted by a more limited claim. Keep your answers tied to the text, not to your general knowledge.",
                    ],
                ],
            ]
        );

        $unit2 = Unit::firstOrCreate(
            ['package_id' => $package->id, 'title' => 'Unit 2: Listening Section 1-4 Immersion'],
            ['description' => 'Accents, note-taking, map labeling, and fast-speech comprehension.', 'order' => 2]
        );

        $this->ensurePlaceholder(
            'documents/listening_test1.mp3',
            "ID3\x04\x00\x00\x00\x00\x00\x00\xff\xfb\x90\x64\x00\x00\x00\x00"
        );

        Document::updateOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Listening Practice Test 1 - Audio Track.mp3'],
            [
                'type' => 'audio',
                'file_path' => 'documents/listening_test1.mp3',
                'total_pages' => 1,
                'preview_pages' => 1,
                'preview_content' => [
                    [
                        'heading' => 'Section 1 · Booking a community sports hall',
                        'body' => "Narrator: You will hear a conversation between a student and the receptionist of a community sports centre.\n\nReceptionist: Good morning, Riverside Sports Centre. How can I help?\n\nStudent: Hi, I'd like to book a badminton court for Saturday morning. I'm part of a group of six.\n\nReceptionist: Let me check. We have courts available from nine until eleven. Would that work for you?\n\nStudent: Nine is perfect. Is there somewhere we can leave our bags?\n\nReceptionist: Yes, there are lockers beside the changing rooms. You'll need a one-pound coin, which is returned when you collect your things.\n\nStudent: Great. And do we need to bring our own rackets?\n\nReceptionist: You can hire them at the front desk for two pounds each. I'd recommend booking them in advance, as we only have eight sets.",
                    ],
                ],
            ]
        );

        $this->ensurePlaceholder(
            'documents/transcripts.pdf',
            "%PDF-1.4\n% IELTS placeholder transcripts\n%%EOF\n"
        );

        Document::updateOrCreate(
            ['unit_id' => $unit2->id, 'title' => 'Listening Transcripts & Answer Keys.pdf'],
            [
                'type' => 'pdf',
                'file_path' => 'documents/transcripts.pdf',
                'total_pages' => 18,
                'preview_pages' => 3,
                'preview_content' => [
                    [
                        'heading' => 'Listening Test 1 · Section 1 transcript',
                        'body' => "Receptionist: Good morning, Riverside Sports Centre. How can I help?\n\nStudent: Hi, I'd like to book a badminton court for Saturday morning. I'm part of a group of six.\n\nReceptionist: Let me check. We have courts available from nine until eleven. Would that work for you?\n\nStudent: Nine is perfect. How much is it for a group?\n\nReceptionist: It's eight pounds per hour for the whole court, not per person.",
                    ],
                    [
                        'heading' => 'Listening Test 1 · Section 2 transcript',
                        'body' => "Volunteer coordinator: Welcome to the city farm. Before you start, I want to explain the three areas where we need help this weekend.\n\nThe first is the vegetable garden, where we're preparing the beds for winter. The second is the animal enclosure, which needs fresh straw. The third is the visitor centre, where we're setting up an exhibition about bees.\n\nPlease sign in at the visitor centre before you collect your tools. Gloves are provided, but you'll need to bring your own boots.",
                    ],
                    [
                        'heading' => 'Answer key · Sections 1–2',
                        'body' => "Section 1\n1. badminton\n2. Saturday\n3. nine / 9\n4. lockers\n5. one pound / £1\n6. rackets\n\nSection 2\n11. vegetable garden\n12. animal enclosure\n13. visitor centre\n14. straw\n15. boots\n16. gloves\n\nAnswers are shown for the first two sections only in this preview.",
                    ],
                ],
            ]
        );
    }

    private function ensurePlaceholder(string $path, string $contents): void
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($path)) {
            $disk->put($path, $contents);
        }
    }
}
