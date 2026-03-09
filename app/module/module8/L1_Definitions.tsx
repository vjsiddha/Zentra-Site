"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";

// Data arrays outside the component
const DEFINITIONS = [
  {
    id: 1,
    term: "Passive Investing",
    definition: "An investment strategy where you buy and hold a diversified portfolio (like index funds) that tracks the overall market. You're not trying to pick winners—you're owning a piece of everything.",
    analogy: "It's like buying a sampler platter at a restaurant instead of gambling on one dish you've never tried.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200"
  },
  {
    id: 2,
    term: "Active Investing",
    definition: "An investment strategy where you (or a fund manager) actively research and pick specific stocks, trying to 'beat the market' by finding undervalued companies or timing trades.",
    analogy: "It's like being a talent scout trying to discover the next big star before everyone else does.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200"
  },
  {
    id: 3,
    term: "Index Fund",
    definition: "A type of investment fund that automatically holds all the stocks in a market index (like the S&P 500). It gives you instant diversification with minimal effort.",
    analogy: "Instead of betting on one horse, you're betting on the entire race—if horse racing overall does well, you win.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200"
  },
  {
    id: 4,
    term: "Mutual Fund",
    definition: "A pool of money from many investors that's actively managed by professionals who pick stocks they believe will outperform. They charge fees for this expertise.",
    analogy: "It's like hiring a personal chef who promises to cook better meals than you could—but charges a premium whether the food is great or not.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200"
  },
  {
    id: 5,
    term: "MER (Management Expense Ratio)",
    definition: "The annual fee charged by a fund, expressed as a percentage of your investment. It's automatically deducted from your returns—you never see a bill, but it's always being paid.",
    analogy: "It's like a slow leak in your tire. You might not notice it day-to-day, but over a long road trip, it makes a huge difference.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200"
  },
  {
    id: 6,
    term: "Beating the Market",
    definition: "Earning returns higher than a benchmark index (like the S&P 500). This is what active managers promise, but historically 92% fail to do consistently over 15+ years.",
    analogy: "It's like claiming you can consistently win at poker against professional players—possible, but the odds are heavily against you.",
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=1200"
  },
  {
    id: 7,
    term: "Compound Effect of Fees",
    definition: "How small fee differences grow into massive dollar differences over time. A 2% fee vs 0.05% fee can cost you hundreds of thousands over a 30-year career.",
    analogy: "Imagine two identical snowballs rolling downhill, but one has a small stick dragging behind it. Over miles, that tiny drag creates a huge size difference.",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1200"
  },
  {
    id: 8,
    term: "Diversification",
    definition: "Spreading your investments across many different assets to reduce risk. If one company fails, you don't lose everything because you own pieces of hundreds of others.",
    analogy: "Don't put all your eggs in one basket. If you trip, you want some eggs in other baskets to survive.",
    image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1200"
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the main difference between passive and active investing?",
    options: [
      { id: "a", text: "Passive costs more in fees", correct: false },
      { id: "b", text: "Passive tracks the market; Active tries to beat it", correct: true },
      { id: "c", text: "Active is safer than passive", correct: false },
      { id: "d", text: "There is no real difference", correct: false },
    ],
    explanation: "Passive investing tracks market indexes, while active investing tries to outperform through stock picking and market timing."
  },
  {
    id: 2,
    question: "What does MER stand for and why does it matter?",
    options: [
      { id: "a", text: "Market Exchange Rate - affects currency", correct: false },
      { id: "b", text: "Management Expense Ratio - the fee that reduces your returns", correct: true },
      { id: "c", text: "Mutual Earnings Report - shows fund performance", correct: false },
      { id: "d", text: "Money Equity Ratio - measures fund size", correct: false },
    ],
    explanation: "MER is the annual fee charged by funds. Even small differences compound into huge amounts over decades."
  },
  {
    id: 3,
    question: "A typical index fund has an MER of about 0.05%. What's typical for an actively managed mutual fund?",
    options: [
      { id: "a", text: "0.01% - even lower than index funds", correct: false },
      { id: "b", text: "0.05% - about the same", correct: false },
      { id: "c", text: "1-2% - much higher", correct: true },
      { id: "d", text: "10% - extremely high", correct: false },
    ],
    explanation: "Active funds typically charge 1-2% MER, which is 20-40x more than low-cost index funds."
  },
  {
    id: 4,
    question: "Over a 15-year period, what percentage of actively managed funds FAIL to beat their benchmark index?",
    options: [
      { id: "a", text: "About 25%", correct: false },
      { id: "b", text: "About 50%", correct: false },
      { id: "c", text: "About 75%", correct: false },
      { id: "d", text: "About 92%", correct: true },
    ],
    explanation: "According to the S&P SPIVA report, 92% of active funds underperform their benchmark over 15 years."
  },
  {
    id: 5,
    question: "If you invest $10,000 with $500/month for 30 years at 7% return, how much more would you have with a 0.05% MER vs a 2% MER?",
    options: [
      { id: "a", text: "About $5,000 more", correct: false },
      { id: "b", text: "About $50,000 more", correct: false },
      { id: "c", text: "About $200,000+ more", correct: true },
      { id: "d", text: "About the same amount", correct: false },
    ],
    explanation: "The compound effect of fees is massive! A 1.95% fee difference over 30 years can cost you over $200,000."
  },
  {
    id: 6,
    question: "What is an index fund?",
    options: [
      { id: "a", text: "A fund where managers pick the best stocks", correct: false },
      { id: "b", text: "A fund that automatically tracks a market index like the S&P 500", correct: true },
      { id: "c", text: "A savings account with higher interest", correct: false },
      { id: "d", text: "A type of bond investment", correct: false },
    ],
    explanation: "Index funds passively track market indexes, giving you broad diversification with very low fees."
  },
  {
    id: 7,
    question: "Why do most financial experts recommend passive investing for beginners?",
    options: [
      { id: "a", text: "It's more exciting and hands-on", correct: false },
      { id: "b", text: "Lower fees, automatic diversification, and historically better long-term results", correct: true },
      { id: "c", text: "It guarantees you'll beat the market", correct: false },
      { id: "d", text: "It requires more research and expertise", correct: false },
    ],
    explanation: "Passive investing offers lower fees, instant diversification, and historically outperforms most active strategies."
  },
  {
    id: 8,
    question: "What would an active fund need to do to justify its 2% MER over an index fund's 0.05% MER?",
    options: [
      { id: "a", text: "Match the market's performance", correct: false },
      { id: "b", text: "Beat the market by at least ~2% consistently every year", correct: true },
      { id: "c", text: "Beat the market once every few years", correct: false },
      { id: "d", text: "Nothing - fees don't affect returns", correct: false },
    ],
    explanation: "To overcome the fee difference, active funds must beat the market by roughly the fee gap—which 92% fail to do."
  },
  {
    id: 9,
    question: "What is diversification?",
    options: [
      { id: "a", text: "Putting all your money in one promising stock", correct: false },
      { id: "b", text: "Spreading investments across many assets to reduce risk", correct: true },
      { id: "c", text: "Switching between stocks frequently", correct: false },
      { id: "d", text: "Only investing in bonds", correct: false },
    ],
    explanation: "Diversification means spreading your investments so that if one fails, you don't lose everything."
  },
  {
    id: 10,
    question: "Based on what you've learned, which statement is TRUE?",
    options: [
      { id: "a", text: "Higher fees usually mean better returns", correct: false },
      { id: "b", text: "Most people are better off with low-cost index funds", correct: true },
      { id: "c", text: "Active investing is always better if you're patient", correct: false },
      { id: "d", text: "Fees don't matter for long-term investing", correct: false },
    ],
    explanation: "Research consistently shows that low-cost index funds outperform most active strategies over the long term."
  }
];

export default function L1_Definitions({ onComplete, onBack }: { onComplete: (score: number) => void; onBack?: () => void }) {
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
          category: "INVESTING",
          moduleId: "module8",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [currentDef.id]: true }));
      }
    } finally {
      setSaving(false);
    }
  };

  // Back navigation handler
  const handleBack = () => {
    if (view === "intro") {
      onBack?.();
    } else if (view === "study") {
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
    (view === "intro") ||
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
      title: "Investment Lion!",
      msg: "You're a king of the investment jungle! You understand the power of low fees and passive investing.",
      color: "text-green-600",
      img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=400"
    };
    if (percentage >= 50) return {
      emoji: "🦊",
      title: "Clever Fox!",
      msg: "Great start! You're getting the hang of passive vs active investing. A quick review might help solidify the concepts.",
      color: "text-sky-600",
      img: "https://images.unsplash.com/photo-1474511320723-9a5361ad3328?q=80&w=400"
    };
    return {
      emoji: "🐻",
      title: "Hibernating Bear...",
      msg: "Looks like these investing concepts need another look. Don't worry—even Warren Buffett started somewhere!",
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
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        {showBackButton && <BackButton />}
        <div className="w-full text-center mb-6">
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">Module 8</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Passive vs Active Investing</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=600" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Learn" />
            <h3 className="text-base font-medium">Learn</h3>
            <p className="text-sm text-[#4F7D96]">Index funds vs mutual funds & fees</p>
          </div>
          <div className="flex flex-col items-start">
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Apply" />
            <h3 className="text-base font-medium">Apply</h3>
            <p className="text-sm text-[#4F7D96]">Simulate returns with MER impact</p>
          </div>
          <div className="flex flex-col items-start">
            <img src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=600" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Reflect" />
            <h3 className="text-base font-medium">Reflect</h3>
            <p className="text-sm text-[#4F7D96]">"Was paying for active worth it?"</p>
          </div>
        </div>
        <p className="text-center mb-10 max-w-2xl text-[#0D171C]">
          Discover the difference between passive and active investing strategies. Learn how fees impact your wealth over time and why most experts recommend index funds.
        </p>
        <button onClick={() => setView("study")} className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold">
          Start Learning
        </button>
      </div>
    );
  }

  // VIEW 2: STUDY (DEFINITIONS)
  if (view === "study") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-10">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Learn: Key Concepts</p>
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

              <button onClick={handleNextDefinition} className="mt-3 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg">
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
        <section className="animate-in zoom-in duration-300 max-w-2xl mx-auto pt-16">
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
              Complete Module 8
            </button>
            <button 
              onClick={handleRedoLesson} 
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Redo Lesson
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}