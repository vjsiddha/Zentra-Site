"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";

// Market cycle definitions
const DEFINITIONS = [
  {
    id: 1,
    term: "Bear Market",
    definition: "A prolonged period where investment prices fall 20% or more from recent highs, typically accompanied by widespread pessimism and negative investor sentiment.",
    analogy: "Like a harsh winter—it feels long and cold, but spring always follows. Markets are cyclical.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200",
    keyTakeaway: "Bear markets are normal. Since 1950, the S&P 500 has had 14 bear markets, each lasting an average of 10 months."
  },
  {
    id: 2,
    term: "Bull Market",
    definition: "A sustained period of rising stock prices, usually defined as a 20% or more increase from recent lows, driven by strong economic fundamentals and investor optimism.",
    analogy: "Like summer—everyone wants to be outside enjoying the sunshine. Confidence is high and money flows freely.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200",
    keyTakeaway: "Bull markets last longer than bear markets. The average bull market runs for 5.8 years with gains of 180%."
  },
  {
    id: 3,
    term: "Market Cycles",
    definition: "The natural rhythm of markets moving through four phases: accumulation (smart money buys), markup (bull market), distribution (smart money sells), and markdown (bear market).",
    analogy: "Like the four seasons—each one follows the other in a predictable pattern, even though we can't control the weather.",
    image: "https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=1200",
    keyTakeaway: "Understanding cycles helps you avoid panic selling at bottoms and euphoric buying at tops."
  },
  {
    id: 4,
    term: "Dollar-Cost Averaging (DCA)",
    definition: "Investing a fixed amount of money at regular intervals, regardless of market conditions. This reduces the impact of volatility and removes emotion from investing.",
    analogy: "Like buying groceries weekly instead of trying to time sales—sometimes you pay more, sometimes less, but it averages out.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200",
    keyTakeaway: "DCA automatically buys more shares when prices are low and fewer when prices are high."
  },
  {
    id: 5,
    term: "Emotional Investing",
    definition: "Making investment decisions based on fear or greed rather than rational analysis. This often leads to buying high (FOMO) and selling low (panic).",
    analogy: "Like eating an entire pizza when stressed—it feels right in the moment, but you regret it later.",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?q=80&w=1200",
    keyTakeaway: "Studies show emotional investors underperform the market by 3-5% annually due to poor timing."
  },
  {
    id: 6,
    term: "Volatility",
    definition: "The degree of price fluctuation in an investment. High volatility means big swings up and down; low volatility means stable, gradual changes.",
    analogy: "Like a roller coaster versus a train—both get you somewhere, but one is way bumpier than the other.",
    image: "https://images.unsplash.com/photo-1620315969580-a62a8ec93e99?q=80&w=1200",
    keyTakeaway: "Volatility is not the same as risk. Short-term volatility is normal; long-term trends matter more."
  },
  {
    id: 7,
    term: "Portfolio Rebalancing",
    definition: "Adjusting your investments back to your target allocation. If stocks rise too much, you sell some and buy bonds. If stocks fall, you buy more stocks.",
    analogy: "Like maintaining a balanced diet—when you eat too much of one thing, you adjust the next meal to stay healthy.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
    keyTakeaway: "Rebalancing forces you to 'buy low, sell high' systematically without emotion."
  },
  {
    id: 8,
    term: "Time in the Market vs. Timing the Market",
    definition: "Staying invested for the long term tends to outperform trying to predict the perfect moments to buy and sell. Missing just a few best days can destroy returns.",
    analogy: "Like planting a tree—you can't rush its growth by digging it up and replanting. You just need to give it time.",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200",
    keyTakeaway: "If you missed the 10 best days in the market over 20 years, your returns would drop by more than 50%."
  }
];

// Quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What officially defines a bear market?",
    options: [
      { id: "a", text: "A 10% drop from recent highs", correct: false },
      { id: "b", text: "A 20% drop from recent highs", correct: true },
      { id: "c", text: "A 30% drop from recent highs", correct: false },
      { id: "d", text: "Any negative return", correct: false },
    ],
    explanation: "A bear market is defined as a 20% or greater decline from recent highs. Drops of 10-20% are called 'corrections.'"
  },
  {
    id: 2,
    question: "Your portfolio drops 25% in a bear market. What does dollar-cost averaging suggest you do?",
    options: [
      { id: "a", text: "Sell everything immediately", correct: false },
      { id: "b", text: "Stop investing until recovery", correct: false },
      { id: "c", text: "Keep investing your regular amount", correct: true },
      { id: "d", text: "Double your investment now", correct: false },
    ],
    explanation: "DCA means continuing your regular investment schedule regardless of market conditions—this buys more shares at lower prices."
  },
  {
    id: 3,
    question: "On average, how long do bear markets typically last?",
    options: [
      { id: "a", text: "3-6 months", correct: false },
      { id: "b", text: "10 months", correct: true },
      { id: "c", text: "3 years", correct: false },
      { id: "d", text: "5 years", correct: false },
    ],
    explanation: "Since 1950, bear markets have lasted an average of 10 months. They're painful but temporary."
  },
  {
    id: 4,
    question: "What typically happens when investors make emotional decisions during market crashes?",
    options: [
      { id: "a", text: "They outperform the market", correct: false },
      { id: "b", text: "They buy low and sell high", correct: false },
      { id: "c", text: "They underperform by 3-5% annually", correct: true },
      { id: "d", text: "They time the market perfectly", correct: false },
    ],
    explanation: "Studies show emotional investors underperform by 3-5% per year due to panic selling and FOMO buying."
  },
  {
    id: 5,
    question: "What is the main benefit of portfolio rebalancing during a bear market?",
    options: [
      { id: "a", text: "It eliminates all risk", correct: false },
      { id: "b", text: "It forces you to buy low automatically", correct: true },
      { id: "c", text: "It guarantees profits", correct: false },
      { id: "d", text: "It stops market declines", correct: false },
    ],
    explanation: "Rebalancing makes you systematically buy assets that have fallen (buy low) and sell assets that have risen (sell high)."
  },
  {
    id: 6,
    question: "If you miss the 10 best trading days over 20 years, what happens to your returns?",
    options: [
      { id: "a", text: "They drop by 10%", correct: false },
      { id: "b", text: "They drop by 25%", correct: false },
      { id: "c", text: "They drop by over 50%", correct: true },
      { id: "d", text: "Nothing changes", correct: false },
    ],
    explanation: "Missing just the 10 best days can cut your returns in half—this is why 'time in market' beats 'timing the market.'"
  },
  {
    id: 7,
    question: "Which phase of the market cycle is characterized by 'smart money' buying while prices are low?",
    options: [
      { id: "a", text: "Markup", correct: false },
      { id: "b", text: "Distribution", correct: false },
      { id: "c", text: "Markdown", correct: false },
      { id: "d", text: "Accumulation", correct: true },
    ],
    explanation: "Accumulation is when savvy investors buy during pessimism, before the next bull market begins."
  },
  {
    id: 8,
    question: "What's the average duration of a bull market compared to a bear market?",
    options: [
      { id: "a", text: "About the same", correct: false },
      { id: "b", text: "Bull markets last 2x longer", correct: false },
      { id: "c", text: "Bull markets last 5-6x longer", correct: true },
      { id: "d", text: "Bear markets last longer", correct: false },
    ],
    explanation: "Bull markets average 5.8 years while bear markets average 10 months—the good times far outweigh the bad."
  },
  {
    id: 9,
    question: "What is volatility in investing?",
    options: [
      { id: "a", text: "Guaranteed losses", correct: false },
      { id: "b", text: "The degree of price fluctuation", correct: true },
      { id: "c", text: "A type of stock", correct: false },
      { id: "d", text: "A measure of company profits", correct: false },
    ],
    explanation: "Volatility measures how much prices swing up and down—it's normal and doesn't mean permanent losses."
  },
  {
    id: 10,
    question: "During a bear market, what emotion drives most retail investors to sell?",
    options: [
      { id: "a", text: "Greed", correct: false },
      { id: "b", text: "Fear", correct: true },
      { id: "c", text: "Excitement", correct: false },
      { id: "d", text: "Indifference", correct: false },
    ],
    explanation: "Fear of further losses drives panic selling at market bottoms—exactly when you should be buying or holding."
  }
];

export default function L1_Definitions({ onComplete }: { onComplete: (score: number) => void }) {
  const { user } = useAuth();

  const [view, setView] = useState<"intro" | "study" | "quiz" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Dictionary saved state per definition.id
  const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const currentDef = useMemo(() => DEFINITIONS[currentIndex], [currentIndex]);
  const currentTermId = useMemo(() => String(currentDef.id), [currentDef.id]);
  const isSaved = Boolean(savedMap[currentDef.id]);

  useEffect(() => {
    let cancelled = false;
    async function checkSaved() {
      if (!user) return;
      try {
        const exists = await isInDictionary(user.uid, currentTermId);
        if (!cancelled) setSavedMap((prev) => ({ ...prev, [currentDef.id]: exists }));
      } catch {}
    }
    if (view === "study" && user) checkSaved();
    return () => { cancelled = true; };
  }, [user, view, currentDef.id, currentTermId]);

  const toggleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await removeFromDictionary(user.uid, currentTermId);
        setSavedMap((prev) => ({ ...prev, [currentDef.id]: false }));
      } else {
        await saveToDictionary(user.uid, {
          id: currentTermId,
          term: currentDef.term,
          definition: currentDef.definition,
          analogy: currentDef.analogy,
          category: "MARKET_CYCLES",
          moduleId: "module4",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [currentDef.id]: true }));
      }
    } finally {
      setSaving(false);
    }
  };

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

  const handleRedoLesson = () => {
    setView("intro");
    setCurrentIndex(0);
    setQuizIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
  };

  const showBackButton = (view === "study") || (view === "quiz" && !isSubmitted);

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

  const getFeedback = () => {
    if (percentage >= 80) return {
      emoji: "📈",
      title: "Market Survivor!",
      msg: "You understand market cycles and how to stay calm during volatility. You're ready for the real test!",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    };
    if (percentage >= 50) return {
      emoji: "📊",
      title: "Getting There!",
      msg: "You're grasping the concepts, but review the material to build stronger confidence for bear markets.",
      color: "text-blue-600",
      bg: "bg-blue-50"
    };
    return {
      emoji: "📉",
      title: "More Practice Needed",
      msg: "Bear markets are tough—make sure you understand the fundamentals before facing the storm.",
      color: "text-amber-600",
      bg: "bg-amber-50"
    };
  };

  const feedback = getFeedback();

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 font-bold transition-all hover:bg-rose-50 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  // INTRO VIEW
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-full mb-6">
<span className="text-sm font-bold uppercase tracking-widest">Lesson 1</span>        </div>
        
        <h1 className="text-[32px] font-bold text-[#0D171C] leading-[40px] text-center mb-4">
          Understanding Market Cycles
        </h1>
        <p className="text-center mb-10 max-w-2xl text-slate-600 text-lg">
          Before you can survive a bear market, you need to understand how markets work. 
          Let's explore the cycles, psychology, and strategies that separate successful investors from the rest.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-base font-bold mb-2">Learn Core Concepts</h3>
            <p className="text-sm text-slate-600">Master the fundamentals of market cycles and investor psychology</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-base font-bold mb-2">Beat Emotions</h3>
            <p className="text-sm text-slate-600">Understand why fear and greed destroy returns</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-base font-bold mb-2">Build Resilience</h3>
            <p className="text-sm text-slate-600">Prepare mentally for the inevitable downturns</p>
          </div>
        </div>

        <button 
          onClick={() => setView("study")} 
          className="px-10 py-4 bg-rose-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-rose-700 transition-all"
        >
          Start Learning →
        </button>
      </div>
    );
  }

  // STUDY VIEW
  if (view === "study") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-12">
          <header className="text-center mb-10">
            <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">Market Fundamentals</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{DEFINITIONS[currentIndex].term}</h2>
            <p className="text-slate-400 text-sm mt-2">Concept {currentIndex + 1} of {DEFINITIONS.length}</p>
          </header>

          <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <Image src={DEFINITIONS[currentIndex].image} alt="Concept illustration" fill className="object-cover" />
            </div>
            
            <div>
              <p className="text-lg text-slate-700 leading-relaxed font-medium mb-4">
                {DEFINITIONS[currentIndex].definition}
              </p>
              
              <div className="mb-6 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-xs font-bold text-rose-600 uppercase block mb-2">Simple Analogy:</span>
                <p className="italic text-slate-700">"{DEFINITIONS[currentIndex].analogy}"</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs font-bold text-blue-600 uppercase block mb-1">💡 Key Takeaway:</span>
                <p className="text-sm text-slate-700">{DEFINITIONS[currentIndex].keyTakeaway}</p>
              </div>

              {/* Dictionary Save Button */}
              <button
                onClick={toggleSave}
                disabled={!user || saving}
                className={[
                  "mt-5 w-full py-3 rounded-xl font-bold transition-all border-2",
                  isSaved
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    : "bg-[#0B5E8E] border-[#0B5E8E] text-white hover:bg-[#094a72]",
                  (!user || saving) ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {isSaved ? "✓ Saved to Dictionary (Click to Remove)" : "＋ Add to My Dictionary"}
              </button>

              <button 
                onClick={handleNextDefinition} 
                className="mt-3 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all"
              >
                {currentIndex === DEFINITIONS.length - 1 ? "Start Knowledge Check →" : "Next Concept →"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // QUIZ VIEW
  if (view === "quiz") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        <section className="animate-in zoom-in duration-300 max-w-2xl mx-auto pt-12">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Knowledge Check</h2>
            <p className="text-slate-500">Question {quizIdx + 1} of {QUIZ_QUESTIONS.length}</p>
          </header>
          
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
            <p className="text-xl font-bold text-slate-800 mb-6">
              {QUIZ_QUESTIONS[quizIdx].question}
            </p>

            <div className="space-y-3">
              {QUIZ_QUESTIONS[quizIdx].options.map(opt => {
                const isCorrect = opt.correct;
                const isSelected = selectedOption === opt.id;
                
                let btnStyle = "border-slate-200 hover:border-rose-300";
                if (isSelected && !isSubmitted) btnStyle = "border-rose-500 bg-rose-50";
                if (isSubmitted && isCorrect) btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-700";
                if (isSubmitted && isSelected && !isCorrect) btnStyle = "border-red-500 bg-red-50 text-red-700";

                return (
                  <button
                    key={opt.id}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${btnStyle} flex justify-between items-center`}
                  >
                    <span>{opt.text}</span>
                    {isSubmitted && isCorrect && <span className="text-emerald-600 font-bold">✓</span>}
                    {isSubmitted && isSelected && !isCorrect && <span className="text-red-600 font-bold">✕</span>}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div className={`mt-6 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 border-2 ${
                QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct ? "✅" : "❌"}
                  </span>
                  <span className={`font-bold uppercase tracking-wider text-sm ${
                    QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct 
                      ? "text-emerald-700" 
                      : "text-red-700"
                  }`}>
                    {QUIZ_QUESTIONS[quizIdx].options.find(o => o.id === selectedOption)?.correct ? "Correct!" : "Not quite!"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {QUIZ_QUESTIONS[quizIdx].explanation}
                </p>
              </div>
            )}
            
            <button
              disabled={!selectedOption}
              onClick={() => isSubmitted ? handleNextQuestion() : setIsSubmitted(true)}
              className="mt-8 w-full py-4 bg-rose-600 text-white rounded-xl font-bold shadow-md hover:bg-rose-700 transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              {isSubmitted ? (quizIdx === QUIZ_QUESTIONS.length - 1 ? "See Results →" : "Next Question →") : "Check Answer"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // RESULTS VIEW
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-6">
        <div className={`${feedback.bg} p-10 rounded-[40px] shadow-xl border border-slate-200`}>
          <div className="text-6xl mb-4">{feedback.emoji}</div>
          <h2 className={`text-4xl font-black mb-2 ${feedback.color}`}>{feedback.title}</h2>
          <div className="text-6xl font-black text-slate-900 mb-4">{percentage}%</div>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">{feedback.msg}</p>
          
          <div className="space-y-3">
            <button 
              onClick={() => onComplete(score)} 
              className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-700 transition-all"
            >
              Continue to Lesson 2 →
            </button>
            <button 
              onClick={handleRedoLesson} 
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Review Lesson 1
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}