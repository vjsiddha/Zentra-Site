"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";

/* =========================
   DEFINITIONS (ESG)
========================= */

const DEFINITIONS = [
  {
    id: 1,
    term: "Responsible Investing (ESG)",
    definition:
      "An investment approach that considers environmental, social, and governance (ESG) factors alongside financial returns when making decisions.",
    analogy:
      "It’s like choosing a company not just for profit, but for how it treats people and the planet.",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200",
  },
  {
    id: 2,
    term: "Environmental (E)",
    definition:
      "Focuses on how a company impacts the environment, including carbon emissions, pollution, and sustainability practices.",
    analogy:
      "Like judging how clean and eco-friendly someone keeps their space.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200",
  },
  {
    id: 3,
    term: "Social (S)",
    definition:
      "Looks at how a company treats employees, customers, and communities, including labor rights and diversity.",
    analogy:
      "Like working for a company that respects you versus one that exploits workers.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200",
  },
  {
    id: 4,
    term: "Governance (G)",
    definition:
      "Evaluates leadership, transparency, and ethical management practices within a company.",
    analogy:
      "Like trusting a team leader who is honest and accountable.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200",
  },
  {
    id: 5,
    term: "Sustainable Investing",
    definition:
      "Investing in companies that aim for long-term environmental and social sustainability while still generating returns.",
    analogy:
      "Like planting trees—you benefit later while helping now.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
  },
  {
    id: 6,
    term: "Ethical Investing",
    definition:
      "Avoiding companies that conflict with personal values, such as those involved in harmful industries.",
    analogy:
      "Like refusing to support a brand you don’t agree with.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200",
  },
  {
    id: 7,
    term: "Impact Investing",
    definition:
      "Investing to create measurable positive environmental or social impact alongside profit.",
    analogy:
      "Like donating money—but also earning returns while doing good.",
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200",
  },
  {
    id: 8,
    term: "Greenwashing",
    definition:
      "When companies falsely market themselves as environmentally friendly without real action.",
    analogy:
      "Like labeling junk food as ‘healthy’ to trick people.",
    image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1200",
  },
];

/* =========================
   QUIZ (ESG)
========================= */

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is responsible investing?",
    options: [
      { id: "a", text: "Only focusing on profit", correct: false },
      { id: "b", text: "Considering ESG factors along with returns", correct: true },
      { id: "c", text: "Only investing in tech companies", correct: false },
      { id: "d", text: "Avoiding all risk", correct: false },
    ],
    explanation:
      "Responsible investing includes environmental, social, and governance factors alongside financial returns.",
  },
  {
    id: 2,
    question: "What does the 'E' in ESG stand for?",
    options: [
      { id: "a", text: "Economics", correct: false },
      { id: "b", text: "Energy", correct: false },
      { id: "c", text: "Environmental", correct: true },
      { id: "d", text: "Equity", correct: false },
    ],
    explanation:
      "Environmental refers to how companies impact the planet.",
  },
  {
    id: 3,
    question: "Which of the following is a social factor?",
    options: [
      { id: "a", text: "Carbon emissions", correct: false },
      { id: "b", text: "Employee working conditions", correct: true },
      { id: "c", text: "CEO salary", correct: false },
      { id: "d", text: "Stock price", correct: false },
    ],
    explanation:
      "Social factors focus on how companies treat people.",
  },
  {
    id: 4,
    question: "What is governance?",
    options: [
      { id: "a", text: "Company leadership and ethics", correct: true },
      { id: "b", text: "Pollution levels", correct: false },
      { id: "c", text: "Market returns", correct: false },
      { id: "d", text: "Employee benefits", correct: false },
    ],
    explanation:
      "Governance relates to leadership, transparency, and ethics.",
  },
  {
    id: 5,
    question: "What is greenwashing?",
    options: [
      { id: "a", text: "Actually being eco-friendly", correct: false },
      { id: "b", text: "Fake environmental marketing", correct: true },
      { id: "c", text: "Investing in renewable energy", correct: false },
      { id: "d", text: "Reducing emissions", correct: false },
    ],
    explanation:
      "Greenwashing is when companies pretend to be sustainable without real action.",
  },
  {
    id: 6,
    question: "What is impact investing?",
    options: [
      { id: "a", text: "Only focusing on profit", correct: false },
      { id: "b", text: "Creating social/environmental impact + returns", correct: true },
      { id: "c", text: "Avoiding all risk", correct: false },
      { id: "d", text: "Short-term trading", correct: false },
    ],
    explanation:
      "Impact investing aims to generate positive change alongside returns.",
  },
];

/* =========================
   COMPONENT (UNCHANGED)
========================= */

export default function L1_Definitions({ onComplete, onBack }) {
  const { user } = useAuth();

  const [view, setView] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentDef = useMemo(() => DEFINITIONS[currentIndex], [currentIndex]);

  const handleNextDefinition = () => {
    if (currentIndex < DEFINITIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setView("quiz");
    }
  };

  const handleNextQuestion = () => {
    const isCorrect =
      QUIZ_QUESTIONS[quizIdx].options.find(
        (o) => o.id === selectedOption
      )?.correct;

    if (isCorrect) setScore(score + 10);

    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setView("results");
    }
  };

  /* =========================
     VIEWS
  ========================= */

  if (view === "intro") {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold">Responsible Investing</h1>
        <p className="mt-4">Learn ESG investing concepts</p>
        <button
          onClick={() => setView("study")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded"
        >
          Start
        </button>
      </div>
    );
  }

  if (view === "study") {
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold">{currentDef.term}</h2>
        <Image src={currentDef.image} alt="" width={600} height={300} />
        <p className="mt-4">{currentDef.definition}</p>
        <p className="italic mt-2">{currentDef.analogy}</p>

        <button
          onClick={handleNextDefinition}
          className="mt-6 px-6 py-3 bg-black text-white rounded"
        >
          Next
        </button>
      </div>
    );
  }

  if (view === "quiz") {
    const q = QUIZ_QUESTIONS[quizIdx];

    return (
      <div className="p-10 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold">{q.question}</h2>

        {q.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedOption(opt.id)}
            className="block border p-3 mt-3 w-full"
          >
            {opt.text}
          </button>
        ))}

        <button
          onClick={() =>
            isSubmitted ? handleNextQuestion() : setIsSubmitted(true)
          }
          className="mt-6 px-6 py-3 bg-blue-600 text-white"
        >
          {isSubmitted ? "Next" : "Check"}
        </button>

        {isSubmitted && <p className="mt-4">{q.explanation}</p>}
      </div>
    );
  }

  return (
    <div className="text-center p-10">
      <h2 className="text-2xl font-bold">Score: {score}</h2>
      <button
        onClick={() => onComplete(score)}
        className="mt-6 px-6 py-3 bg-green-600 text-white"
      >
        Complete
      </button>
    </div>
  );
}
