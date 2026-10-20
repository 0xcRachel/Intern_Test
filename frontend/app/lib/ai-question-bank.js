const QUESTION_BANK = [
  {
    skill: "Reading",
    difficulty: "Intermediate",
    question_text:
      "According to the passage, why did the researchers choose to monitor the birds at dawn?",
    options: [
      "Because the birds are most active and vocal at that time.",
      "Because the equipment is cheaper to operate in daylight.",
      "Because the local community requested early observations.",
      "Because the birds migrate to warmer areas by noon.",
    ],
    correct: 0,
  },
  {
    skill: "Reading",
    difficulty: "Advanced",
    question_text:
      "The word “scarce” in paragraph 3 is closest in meaning to:",
    options: ["Plentiful", "Difficult to find", "Carefully measured", "Widely accepted"],
    correct: 1,
  },
  {
    skill: "Listening",
    difficulty: "Beginner",
    question_text:
      "What time does the orientation session begin?",
    options: ["At 8:30 a.m.", "At 9:00 a.m.", "At 9:30 a.m.", "At 10:00 a.m."],
    correct: 2,
  },
  {
    skill: "Listening",
    difficulty: "Intermediate",
    question_text:
      "What does the speaker suggest students do before the field trip?",
    options: [
      "Bring a packed lunch from home.",
      "Complete the online safety form.",
      "Meet at the library entrance.",
      "Collect a printed map from reception.",
    ],
    correct: 1,
  },
  {
    skill: "Grammar",
    difficulty: "Intermediate",
    question_text:
      "Choose the correct option: By the time we arrived, the lecture ______.",
    options: ["already started", "has already started", "had already started", "was already starting"],
    correct: 2,
  },
  {
    skill: "Grammar",
    difficulty: "Advanced",
    question_text:
      "Choose the best completion: The proposal, ______ by the research team, was approved last week.",
    options: ["submitting", "submitted", "which submits", "to submit"],
    correct: 1,
  },
  {
    skill: "Vocabulary",
    difficulty: "Intermediate",
    question_text:
      "Which word best completes the sentence? The new policy had a ______ effect on air quality in the city.",
    options: ["beneficial", "benefit", "beneficially", "beneficiary"],
    correct: 0,
  },
  {
    skill: "Vocabulary",
    difficulty: "Advanced",
    question_text:
      "Choose the phrase closest in meaning to “to take something for granted”.",
    options: [
      "To assume something is true without checking.",
      "To refuse an offer politely.",
      "To complete a task ahead of schedule.",
      "To express strong disagreement.",
    ],
    correct: 0,
  },
  {
    skill: "Reading",
    difficulty: "Advanced",
    question_text:
      "Which statement best summarises the writer’s view in the final paragraph?",
    options: [
      "Urban farming is unlikely to replace conventional agriculture.",
      "Urban farming should be banned in densely populated areas.",
      "Consumers are unwilling to pay more for local produce.",
      "Governments have already solved food distribution problems.",
    ],
    correct: 0,
  },
  {
    skill: "Listening",
    difficulty: "Advanced",
    question_text:
      "According to the lecturer, what is the main limitation of the current study?",
    options: [
      "The sample size was too small to be reliable.",
      "The data was collected over a very short period.",
      "The participants were not representative of the population.",
      "The equipment failed during the final stage.",
    ],
    correct: 2,
  },
  {
    skill: "Grammar",
    difficulty: "Beginner",
    question_text:
      "Choose the correct option: She ______ to the library every Saturday morning.",
    options: ["go", "goes", "going", "gone"],
    correct: 1,
  },
  {
    skill: "Vocabulary",
    difficulty: "Beginner",
    question_text:
      "Which word is opposite in meaning to “expand” in the context of a business?",
    options: ["Grow", "Increase", "Contract", "Develop"],
    correct: 2,
  },
];

const SKILLS = ["All", "Reading", "Listening", "Grammar", "Vocabulary"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function buildQuestionDrafts({ skill = "All", difficulty = "Intermediate", count = 3 }) {
  const filtered = QUESTION_BANK.filter((item) => {
    const skillMatch = skill === "All" || item.skill === skill;
    const difficultyMatch = item.difficulty === difficulty;
    return skillMatch && difficultyMatch;
  });

  const fallback = QUESTION_BANK.filter(
    (item) => skill === "All" || item.skill === skill,
  );
  const pool = filtered.length >= count ? filtered : fallback.length ? fallback : QUESTION_BANK;

  return shuffle(pool)
    .slice(0, Math.max(1, count))
    .map((item, index) => {
      const optionItems = item.options.map((text, optionIndex) => ({
        option_text: text,
        is_correct: optionIndex === item.correct,
      }));
      const shuffledOptions = shuffle(optionItems);
      return {
        tempId: `${Date.now()}-${index}-${item.correct}`,
        skill: item.skill,
        difficulty: item.difficulty,
        question_text: item.question_text,
        type: "single_choice",
        points: 1,
        options: shuffledOptions,
        correct_text: optionItems.find((option) => option.is_correct)?.option_text,
      };
    });
}

export { SKILLS, DIFFICULTIES };
