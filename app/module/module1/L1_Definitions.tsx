"use client";

import { useState } from "react";
import Image from "next/image";

// Data arrays outside the component
const DEFINITIONS = [
  {
    id: 1,
    term: "Net Pay (The $1,800)",
    definition: "This is your 'take-home pay'—the money that actually hits your bank account after taxes have been taken out.",
    analogy: "If your salary is a whole pizza, Net Pay is the number of slices you actually get to eat.",
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=1200"
  },
  {
    id: 2,
    term: "Fixed Expenses (Rent)",
    definition: "Costs that stay the same every single month. These are the easiest to budget for because they are predictable.",
    analogy: "Like a Netflix subscription—you know exactly what's coming out of your pocket every month.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200"
  },
  {
    id: 3,
    term: "Variable Expenses (Groceries & Fun)",
    definition: "Costs that change based on your behavior. You have more control over these, but they are the most common places where people overspend.",
    analogy: "Like the volume on your phone—you can turn it up or down depending on how much 'noise' you can afford that week.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200"
  },
  {
    id: 4,
    term: "Savings vs. Investing",
    definition: "Savings is money set aside for emergencies or short-term goals (safe but slow). Investing is putting money into assets like stocks to grow wealth over time.",
    analogy: "Savings is a shield to protect you today; Investing is a seed to grow a tree for tomorrow.",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1200"
  },
  {
    id: 5,
    term: "Emergency Fund",
    definition: "A 'safety net' specifically for unexpected events like car repairs. Aiming for $1,000 is a great first step.",
    analogy: "It's your financial umbrella. You hope you don't need it, but you're glad you have it when it starts raining bills.",
    image: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=1200"
  },
  {
    id: 6,
    term: "Cash Flow Balance",
    definition: "The difference between money coming in and money going out. Positive means you have money left over.",
    analogy: "Think of a bathtub. If the water draining is faster than the water coming in, you'll eventually run dry.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200"
  },
  {
    id: 7,
    term: "Budget Stability",
    definition: "A measure of how sustainable your spending is without relying on credit cards to survive the month.",
    analogy: "It's like building a house on a concrete slab instead of sand. When a storm hits, the house doesn't move.",
    image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1200"
  },
  {
    id: 8,
    term: "The 50/30/20 Rule",
    definition: "A simple plan: 50% on Needs ($900), 30% on Wants ($540), and 20% on Savings/Debt ($360).",
    analogy: "It's like a balanced diet for your paycheck—it keeps your financial body lean and healthy.",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200"
  }
];

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

export default function L1_Definitions({ onComplete }: { onComplete: (score: number) => void }) {
  const [view, setView] = useState<"intro" | "study" | "quiz" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Back navigation handler
  const handleBack = () => {
    if (view === "study") {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else {
        setView("intro");
      }
    } else if (view === "quiz") {
      if (quizIdx > 0 && !isSubmitted) {
        setQuizIdx(quizIdx - 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else if (quizIdx === 0 && !isSubmitted) {
        setView("study");
        setCurrentIndex(DEFINITIONS.length - 1);
      }
    }
  };

  // Reset lesson to start over
  const handleRedoLesson = () => {
    setView("intro");
    setCurrentIndex(0);
    setQuizIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
  };

  // Check if back button should be visible
  const showBackButton = 
    (view === "study") || 
    (view === "quiz" && !isSubmitted);

  // Handler for navigating definitions
  const handleNextDefinition = () => {
    if (currentIndex < DEFINITIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setView("quiz");
    }
  };

  const handleNextQuestion = () => {
    const isCorrect = QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct;
    const newScore = isCorrect ? score + 10 : score;
    setScore(newScore);

    if (quizIdx < QUIZ_QUESTIONS.length - 1) {
      setQuizIdx(quizIdx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setView("results");
    }
  };

  const percentage = (score / (QUIZ_QUESTIONS.length * 10)) * 100;

  const getAnimalFeedback = () => {
    if (percentage >= 80) return {
      emoji: "🦁",
      title: "Financial Lion!",
      msg: "You're a king of the financial jungle! You've mastered the basics.",
      color: "text-green-600",
      img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=400"
    };
    if (percentage >= 50) return {
      emoji: "🦊",
      title: "Clever Fox!",
      msg: "Great start! You're getting the hang of this, but a quick review might help.",
      color: "text-sky-600",
      img: "https://images.unsplash.com/photo-1474511320723-9a5361ad3328?q=80&w=400"
    };
    return {
      emoji: "🐻",
      title: "Hibernating Bear...",
      msg: "Looks like you're still a bit sleepy on these terms.",
      color: "text-red-600",
      img: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=400"
    };
  };

  const feedback = getAnimalFeedback();

  // Back Button Component
  const BackButton = () => (
  <button
    onClick={handleBack}
    className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    Back
  </button>
);

  // VIEW 1: WHAT YOU'LL BE DOING (INTRO)
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-6">
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">What You'll Be Doing</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/b42a595cd8175c529add2926598dc243377fd3b5?width=602" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Learn" />
            <h3 className="text-base font-medium">Learn</h3>
            <p className="text-sm text-[#4F7D96]">Short real-world scenarios</p>
          </div>
          <div className="flex flex-col items-start">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/7b863fc5eb989f68940df15cc6534d68b5661112?width=602" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Play" />
            <h3 className="text-base font-medium">Play</h3>
            <p className="text-sm text-[#4F7D96]">Use interactive sliders</p>
          </div>
          <div className="flex flex-col items-start">
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/38db942b02ece7acd293202635cd4b190bd84b22?width=602" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Grow" />
            <h3 className="text-base font-medium">Grow</h3>
            <p className="text-sm text-[#4F7D96]">Track your financial progress</p>
          </div>
        </div>
        <p className="text-center mb-10 max-w-2xl text-[#0D171C]">
          Each module is a real-world story. Make decisions, get feedback, and earn Finance XP to unlock the next challenge.
        </p>
        <button onClick={() => setView("study")} className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold">
          Show Me the First Scenario
        </button>
      </div>
    );
  }

  // VIEW 2: STUDY (DEFINITIONS)
  if (view === "study") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-12">
          <header className="text-center mb-10">
            <span className="text-sm font-bold uppercase tracking-widest">Lesson 1</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{DEFINITIONS[currentIndex].term}</h2>
            <p className="text-slate-400 text-sm mt-2">Definition {currentIndex + 1} of {DEFINITIONS.length}</p>
          </header>
          <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <Image src={DEFINITIONS[currentIndex].image} alt="Definition illustration" fill className="object-cover" />
            </div>
            <div>
              <p className="text-lg text-slate-700 leading-relaxed font-medium">{DEFINITIONS[currentIndex].definition}</p>
              <div className="mt-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                <span className="text-xs font-bold text-sky-600 uppercase block mb-1">Simple Analogy:</span>
                <p className="italic text-slate-600">"{DEFINITIONS[currentIndex].analogy}"</p>
              </div>
              <button onClick={handleNextDefinition} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg">
                {currentIndex === DEFINITIONS.length - 1 ? "Start Knowledge Check" : "Next Definition"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: QUIZ
  if (view === "quiz") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        <section className="animate-in zoom-in duration-300 max-w-2xl mx-auto pt-12">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Knowledge Check</h2>
            <p className="text-slate-500">Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}</p>
          </header>
          
          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <p className="text-xl font-bold text-slate-800 mb-6">
              {QUIZ_QUESTIONS[quizIdx].question}
            </p>

            <div className="space-y-3">
              {QUIZ_QUESTIONS[quizIdx].options.map(opt => {
                const isCorrect = opt.correct;
                const isSelected = selectedOption === opt.id;
                
                let btnStyle = "border-slate-100";
                if (isSelected) btnStyle = "border-sky-500 bg-sky-50";
                if (isSubmitted && isCorrect) btnStyle = "border-green-500 bg-green-50 text-green-700";
                if (isSubmitted && isSelected && !isCorrect) btnStyle = "border-red-500 bg-red-50 text-red-700";

                return (
                  <button
                    key={opt.id}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${btnStyle} flex justify-between items-center`}
                  >
                    <span>{opt.text}</span>
                    {isSubmitted && isCorrect && <span className="text-green-600 font-bold">✓</span>}
                    {isSubmitted && isSelected && !isCorrect && <span className="text-red-600 font-bold">✕</span>}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div className={`mt-6 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 ${
                QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct ? "✅" : "❌"}
                  </span>
                  <span className={`font-bold uppercase tracking-wider text-sm ${
                    QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct ? "text-green-700" : "text-red-700"
                  }`}>
                    {QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct ? "Correct!" : "Not quite!"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  {QUIZ_QUESTIONS[quizIdx].explanation}
                </p>
              </div>
            )}
            
            <button
              disabled={!selectedOption}
              onClick={() => isSubmitted ? handleNextQuestion() : setIsSubmitted(true)}
              className="mt-8 w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
            >
              {isSubmitted ? (quizIdx === QUIZ_QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question") : "Check Answer"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 4: RESULTS
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-6">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <Image src={feedback.img} alt="result" fill className="object-cover" />
          </div>
          <h2 className={`text-4xl font-black mb-2 ${feedback.color}`}>{feedback.emoji} {feedback.title}</h2>
          <div className="text-6xl font-black text-slate-900 mb-4">{percentage}%</div>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">{feedback.msg}</p>
          
          {/* Two buttons: Redo and Continue */}
          <div className="space-y-3">
            <button 
              onClick={() => onComplete(score)} 
              className="w-full py-5 bg-sky-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-sky-800 transition-all"
            >
              Move on to Lesson 2
            </button>
            <button 
              onClick={handleRedoLesson} 
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Redo Lesson 1
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}