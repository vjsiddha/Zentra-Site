"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ButtonGroup from "@/components/ButtonGroup";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "You received your first paycheck of $1,800. What term describes this actual 'take-home' amount after taxes?",
    options: [
      { id: "a", text: "Gross Income", correct: false },
      { id: "b", text: "Net Pay", correct: true },
      { id: "c", text: "Net Worth", correct: false },
      { id: "d", text: "Liquidity", correct: false },
    ],
    explanation: "Net pay is what actually lands in your bank account to be spent or saved."
  },
  {
    id: 2,
    question: "Following the 50/30/20 rule, how much of your $1,800 should go toward 'Needs' (Rent/Groceries)?",
    options: [
      { id: "a", text: "$540 (30%)", correct: false },
      { id: "b", text: "$900 (50%)", correct: true },
      { id: "c", text: "$360 (20%)", correct: false },
      { id: "d", text: "$1,000 (Fixed)", correct: false },
    ],
    explanation: "50% of $1,800 is $900. This keeps your essential costs balanced."
  },
  {
    id: 3,
    question: "If your grocery bill rises from $200 to $220 for the same items next year, you are experiencing:",
    options: [
      { id: "a", text: "Compound Interest", correct: false },
      { id: "b", text: "Inflation", correct: true },
      { id: "c", text: "Cash Flow", correct: false },
      { id: "d", text: "Liquidity", correct: false },
    ],
    explanation: "Inflation is the rising cost of goods that reduces your dollar's buying power."
  },
  {
    id: 4,
    question: "Which of these is a 'Fixed Expense' in your new budget?",
    options: [
      { id: "a", text: "Monthly Rent", correct: true },
      { id: "b", text: "Dining Out", correct: false },
      { id: "c", text: "Movie Tickets", correct: false },
      { id: "d", text: "Grocery Snacks", correct: false },
    ],
    explanation: "Fixed expenses stay the same every month, making them predictable to budget."
  },
  {
    id: 5,
    question: "You have $1,000 in savings and a $5,000 car, but owe $2,000 on a card. What is your Net Worth?",
    options: [
      { id: "a", text: "$6,000", correct: false },
      { id: "b", text: "$4,000", correct: true },
      { id: "c", text: "$3,000", correct: false },
      { id: "d", text: "$7,000", correct: false },
    ],
    explanation: "Net Worth = Total Assets ($6,000) minus Total Liabilities ($2,000)."
  },
  {
    id: 6,
    question: "Why is an Emergency Fund like a 'financial umbrella'?",
    options: [
      { id: "a", text: "It grows wealth fast", correct: false },
      { id: "b", text: "It protects against 'rainy day' surprises", correct: true },
      { id: "c", text: "It is for vacation fun", correct: false },
      { id: "d", text: "It reduces taxes", correct: false },
    ],
    explanation: "Emergency funds are for unexpected crises like car repairs or medical bills."
  },
  {
    id: 7,
    question: "What does it mean if your 'Cash Flow Balance' is negative?",
    options: [
      { id: "a", text: "You are saving well", correct: false },
      { id: "b", text: "You are spending more than you earn", correct: true },
      { id: "c", text: "Your net worth is rising", correct: false },
      { id: "d", text: "You are budget stable", correct: false },
    ],
    explanation: "Negative cash flow means money is leaving your account faster than it's coming in."
  },
  {
    id: 8,
    question: "What is the main difference between Savings and Investing?",
    options: [
      { id: "a", text: "No difference", correct: false },
      { id: "b", text: "Savings is safer/liquid; Investing is for growth/risk", correct: true },
      { id: "c", text: "Investing is safer than savings", correct: false },
      { id: "d", text: "Savings is only for the rich", correct: false },
    ],
    explanation: "Savings protect you today; investing builds wealth for the future."
  },
  {
    id: 9,
    question: "What is the trade-off for a Certificate of Deposit (CD)?",
    options: [
      { id: "a", text: "Higher interest for lower liquidity", correct: true },
      { id: "b", text: "Lower interest for higher risk", correct: false },
      { id: "c", text: "Higher risk for no return", correct: false },
      { id: "d", text: "Instant access to cash", correct: false },
    ],
    explanation: "You agree to leave money 'parked' in exchange for a better interest rate."
  },
  {
    id: 10,
    question: "What is the most 'stable' way to manage your $1,800 paycheck?",
    options: [
      { id: "a", text: "Spend it all first", correct: false },
      { id: "b", text: "Pay yourself first (Savings/Needs then Wants)", correct: true },
      { id: "c", text: "Use credit for everything", correct: false },
      { id: "d", text: "Invest before paying rent", correct: false },
    ],
    explanation: "Prioritizing obligations and savings creates a stable financial foundation."
  }
];

export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const question = QUIZ_QUESTIONS[currentQ];
  const isCorrect = question.options.find(o => o.id === selectedOption)?.correct;
  const isFinished = isSubmitted && currentQ === QUIZ_QUESTIONS.length - 1;

  const handleNextQuestion = () => {
    if (isCorrect) setScore(prev => prev + 1);
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    }
  };

  const finalScorePercent = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  return (
    <main className="min-h-screen bg-[#F7FAFC] py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900">Module 1 Quiz</h1>
          <p className="text-slate-500 mt-2">Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</p>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full mt-6">
            <div 
              className="h-full bg-sky-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{question.question}</h2>

          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedOption === option.id;
              let colors = "border-slate-200 hover:border-sky-300";

              if (isSubmitted) {
                if (option.correct) colors = "border-green-500 bg-green-50 text-green-700";
                else if (isSelected) colors = "border-red-500 bg-red-50 text-red-700";
                else colors = "opacity-50 border-slate-200";
              } else if (isSelected) {
                colors = "border-sky-500 bg-sky-50 ring-2 ring-sky-100";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => !isSubmitted && setSelectedOption(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${colors}`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className={`mt-6 p-4 rounded-xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <p className="font-bold">{isCorrect ? "Correct!" : "Incorrect"}</p>
              <p className="text-sm mt-1">{question.explanation}</p>
            </div>
          )}

          <div className="mt-8">
            {!isSubmitted ? (
              <button
                onClick={() => selectedOption && setIsSubmitted(true)}
                disabled={!selectedOption}
                className="w-full py-4 rounded-xl bg-sky-700 text-white font-bold disabled:bg-slate-200"
              >
                Confirm Answer
              </button>
            ) : !isFinished ? (
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold"
              >
                Next Question →
              </button>
            ) : (
              <div className="text-center p-6 bg-sky-50 rounded-xl border border-sky-100">
                <h3 className="text-2xl font-bold text-sky-900">Quiz Complete!</h3>
                <p className="text-sky-700 font-medium mt-1">Final Score: {finalScorePercent}%</p>
              </div>
            )}
          </div>
        </div>

        {isFinished && (
          <div className="mt-10 flex justify-center">
            <ButtonGroup
            primaryHref="/lesson/lesson1/lesson2.1"
              primaryLabel="Start Interactive Simulation"
              secondaryHref="/lesson/lesson1/lesson1.2"
              secondaryLabel="Review Terms"
              align="center"
            />
          </div>
        )}
      </div>
    </main>
  );
}