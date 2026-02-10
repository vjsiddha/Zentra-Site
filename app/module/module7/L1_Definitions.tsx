"use client";

import { useState } from "react";
import Image from "next/image";

// Data arrays outside the component
const DEFINITIONS = [
  {
    id: 1,
    term: "The \"Best Days\" Gap",
    definition: "The statistical phenomenon where a significant portion of long-term stock market returns occurs on just a handful of trading days. If an investor is \"waiting on the sidelines\" to time the market and misses the 10 best days of a decade, their total wealth could be up to 50% lower than someone who stayed invested.",
    analogy: "It's like skipping random school days thinking they won't matter—but those days happened to be when the teacher gave out free A's. You can't predict which days will be the winners, so you have to show up every day.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200"
  },
  {
    id: 2,
    term: "The Two-Decision Requirement",
    definition: "The mathematical trap of market timing. To successfully time the market, an investor must be right twice: once when they sell at the \"top\" and once when they buy back in at the \"bottom.\" Statistically, the odds of being right twice in a row are significantly lower than the odds of the market simply going up over time.",
    analogy: "It's like trying to perfectly time both exits in a revolving door—you need to jump out at exactly the right moment AND jump back in at exactly the right moment. Miss either one and you're stuck outside or spinning in circles.",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1200"
  },
  {
    id: 3,
    term: "Volatility vs. Permanent Loss",
    definition: "Volatility is the temporary \"bumpy ride\" of prices moving up and down. Permanent Loss is what happens when you panic-sell during a dip. Time in the market transforms volatility into a distraction, while timing the market often turns volatility into a permanent loss.",
    analogy: "Volatility is like a roller coaster—scary drops, but you always return to the station safely if you stay in your seat. Jumping out mid-ride (panic selling) is when temporary fear becomes permanent injury.",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200"
  },
  {
    id: 4,
    term: "The Cost of Hesitation",
    definition: "The specific amount of potential growth lost for every year a student waits to start. Because compounding is \"back-loaded\" (most growth happens in the final years), the \"cost\" of waiting from age 18 to 28 is much higher than the cost of waiting from age 48 to 58.",
    analogy: "It's like compound interest is a rocket launch—the early years are building the fuel tanks. Wait too long to start, and you're trying to reach orbit with half the fuel you needed.",
    image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=1200"
  },
  {
    id: 5,
    term: "Market Cycle Neutrality",
    definition: "A mindset where an investor ignores whether the economy is in a \"Bull Market\" (rising) or a \"Bear Market\" (falling), based on the historical fact that every market downturn in history has been followed by an eventual recovery to new all-time highs.",
    analogy: "It's like knowing the ocean has tides—sometimes high, sometimes low, but the water always comes back. Fighting the tide exhausts you; riding it out gets you home safely.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200"
  },
  {
    id: 6,
    term: "Buy and Hold Strategy",
    definition: "The proven investment approach of purchasing quality investments and holding them through all market conditions—bull markets, bear markets, crashes, and recoveries. This strategy removes the need to predict market movements and allows compound growth to work uninterrupted.",
    analogy: "It's like planting an oak tree and leaving it alone. You don't dig it up every fall to check the roots, or move it when a storm comes. You plant it once and let time do the work.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200"
  },
  {
    id: 7,
    term: "Dollar-Cost Averaging",
    definition: "Investing a fixed amount of money at regular intervals (like monthly) regardless of whether the market is up, down, or sideways. This ensures you're always in the market and removes the temptation to time your investments based on market predictions.",
    analogy: "It's like buying groceries every week at whatever the price is, rather than trying to predict when bananas will be cheapest. Sometimes you pay more, sometimes less, but you never go hungry waiting for the \"perfect\" price.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200"
  },
  {
    id: 8,
    term: "Recovery Pattern",
    definition: "The historical fact that every bear market, crash, and financial crisis in stock market history has eventually been followed by a recovery to new all-time highs. Investors who stayed invested through downturns captured these recoveries; those who sold and waited missed them.",
    analogy: "It's like the sun after a storm. No matter how dark the clouds get or how long the rain lasts, the sun has always come back out. The only people who stay wet are those who gave up and went inside.",
    image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1200"
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What happens if you miss the 10 best market days over a decade while trying to time the market?",
    options: [
      { id: "a", text: "Your returns are slightly lower", correct: false },
      { id: "b", text: "Your wealth could be up to 50% lower than staying invested", correct: true },
      { id: "c", text: "It doesn't really matter over the long term", correct: false },
      { id: "d", text: "You avoid losses by being out of the market", correct: false },
    ],
    explanation: "Missing just the 10 best days can cut your returns nearly in half. Since you can't predict when these days will occur, staying invested is crucial."
  },
  {
    id: 2,
    question: "Why is market timing so difficult according to the Two-Decision Requirement?",
    options: [
      { id: "a", text: "You only need to predict one price movement", correct: false },
      { id: "b", text: "You must be right twice: when to sell AND when to buy back", correct: true },
      { id: "c", text: "Markets always go down after you sell", correct: false },
      { id: "d", text: "It requires expensive software", correct: false },
    ],
    explanation: "To time the market successfully, you must correctly predict BOTH the top (when to sell) AND the bottom (when to buy back). Being right twice in a row is statistically very unlikely."
  },
  {
    id: 3,
    question: "What's the difference between volatility and permanent loss?",
    options: [
      { id: "a", text: "They're the same thing", correct: false },
      { id: "b", text: "Volatility is temporary price swings; permanent loss happens when you panic-sell", correct: true },
      { id: "c", text: "Volatility causes permanent loss automatically", correct: false },
      { id: "d", text: "Permanent loss is less serious than volatility", correct: false },
    ],
    explanation: "Volatility is just the market's temporary ups and downs. You only lock in a permanent loss when you sell during a downturn out of fear."
  },
  {
    id: 4,
    question: "Why is waiting from age 18 to 28 MORE costly than waiting from age 48 to 58?",
    options: [
      { id: "a", text: "Older people have more money", correct: false },
      { id: "b", text: "Compound growth is 'back-loaded'—most growth happens in final years", correct: true },
      { id: "c", text: "Young people make worse investment choices", correct: false },
      { id: "d", text: "It's actually the same cost", correct: false },
    ],
    explanation: "Because compounding accelerates over time, missing the early years means you miss the foundation that would have created exponential growth in later decades."
  },
  {
    id: 5,
    question: "What is Market Cycle Neutrality?",
    options: [
      { id: "a", text: "Trying to predict bull and bear markets", correct: false },
      { id: "b", text: "Ignoring market cycles because downturns always recover to new highs", correct: true },
      { id: "c", text: "Only investing when markets are rising", correct: false },
      { id: "d", text: "Selling during bear markets to protect gains", correct: false },
    ],
    explanation: "Market Cycle Neutrality means staying invested through both bull and bear markets, knowing that historically every downturn has been followed by recovery to new all-time highs."
  },
  {
    id: 6,
    question: "What is the Buy and Hold strategy?",
    options: [
      { id: "a", text: "Buying stocks and selling when they drop 10%", correct: false },
      { id: "b", text: "Purchasing investments and holding through all market conditions", correct: true },
      { id: "c", text: "Only holding investments during bull markets", correct: false },
      { id: "d", text: "Buying and selling frequently to maximize gains", correct: false },
    ],
    explanation: "Buy and Hold means staying invested through bull markets, bear markets, crashes, and recoveries—letting compound growth work uninterrupted over decades."
  },
  {
    id: 7,
    question: "What's the main benefit of Dollar-Cost Averaging?",
    options: [
      { id: "a", text: "It guarantees you buy at the lowest prices", correct: false },
      { id: "b", text: "You're always in the market regardless of ups and downs", correct: true },
      { id: "c", text: "You can avoid bear markets completely", correct: false },
      { id: "d", text: "It requires predicting market movements", correct: false },
    ],
    explanation: "Dollar-cost averaging keeps you consistently invested through all market conditions, removing the temptation and impossibility of timing the market."
  },
  {
    id: 8,
    question: "According to the Recovery Pattern, what has happened after EVERY bear market in history?",
    options: [
      { id: "a", text: "Markets took decades to recover", correct: false },
      { id: "b", text: "Markets eventually recovered to new all-time highs", correct: true },
      { id: "c", text: "Markets stayed down permanently", correct: false },
      { id: "d", text: "Only certain stocks recovered", correct: false },
    ],
    explanation: "Every single bear market, crash, and crisis in stock market history has eventually been followed by a recovery to new all-time highs. Patient investors captured these gains."
  },
  {
    id: 9,
    question: "If you panic-sell during a market downturn, what have you done?",
    options: [
      { id: "a", text: "Protected yourself from further losses", correct: false },
      { id: "b", text: "Turned temporary volatility into permanent loss", correct: true },
      { id: "c", text: "Successfully timed the market", correct: false },
      { id: "d", text: "Made a smart tactical decision", correct: false },
    ],
    explanation: "When you sell during a downturn, you lock in your losses permanently and miss the recovery. You've transformed temporary price swings into actual realized losses."
  },
  {
    id: 10,
    question: "Based on what you've learned, which statement is TRUE?",
    options: [
      { id: "a", text: "Professional investors can consistently time the market", correct: false },
      { id: "b", text: "Staying invested beats trying to time the market", correct: true },
      { id: "c", text: "You should sell when markets drop to avoid losses", correct: false },
      { id: "d", text: "Market timing requires being right only once", correct: false },
    ],
    explanation: "The evidence is overwhelming: staying invested through all market conditions (time IN the market) beats trying to predict when to get in and out (TIMING the market)."
  }
];

export default function L1_Definitions({ onComplete, onBack }: { onComplete: () => void; onBack?: () => void }) {
  const [view, setView] = useState<"intro" | "study" | "quiz" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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
      emoji: "🎯",
      title: "Market Veteran!",
      msg: "You understand why staying invested beats trying to time the market! You'll avoid the costly mistake of panic-selling or waiting on the sidelines.",
      color: "text-green-600",
      img: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=400"
    };
    if (percentage >= 50) return {
      emoji: "📈",
      title: "Getting There!",
      msg: "You're grasping the core concepts of time in the market. A quick review will help cement why staying invested is the winning strategy.",
      color: "text-sky-600",
      img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=400"
    };
    return {
      emoji: "⏰",
      title: "Time for Review...",
      msg: "These concepts are crucial for avoiding costly mistakes like panic-selling or trying to time the market. Review the lesson to master them!",
      color: "text-red-600",
      img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400"
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
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">Module 7</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Time IN the Market Beats TIMING the Market</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <img src="https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=600" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Learn" />
            <h3 className="text-base font-medium">Learn</h3>
            <p className="text-sm text-[#4F7D96]">Why staying invested beats trying to time the market</p>
          </div>
          <div className="flex flex-col items-start">
            <img src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=600" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Apply" />
            <h3 className="text-base font-medium">Apply</h3>
            <p className="text-sm text-[#4F7D96]">Compare buy-and-hold vs market timing strategies</p>
          </div>
          <div className="flex flex-col items-start">
            <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600" className="w-full h-[250px] object-cover rounded-xl mb-3" alt="Reflect" />
            <h3 className="text-base font-medium">Reflect</h3>
            <p className="text-sm text-[#4F7D96]">"What's the cost of missing the best days?"</p>
          </div>
        </div>
        <p className="text-center mb-10 max-w-2xl text-[#0D171C]">
          Discover why trying to predict market highs and lows is a losing game. Learn how staying invested through all market conditions—bull markets, bear markets, and crashes—is the proven path to long-term wealth.
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
            <p className="text-slate-400 text-sm mt-2">Concept {currentIndex + 1} of {DEFINITIONS.length}</p>
          </header>
          <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <Image src={DEFINITIONS[currentIndex].image} alt="Concept illustration" fill className="object-cover" />
            </div>
            <div>
              <p className="text-lg text-slate-700 leading-relaxed font-medium">{DEFINITIONS[currentIndex].definition}</p>
              <div className="mt-6 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                <span className="text-xs font-bold text-sky-600 uppercase block mb-1">Simple Analogy:</span>
                <p className="italic text-slate-600">"{DEFINITIONS[currentIndex].analogy}"</p>
              </div>
              <button onClick={handleNextDefinition} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg">
                {currentIndex === DEFINITIONS.length - 1 ? "Start Knowledge Check" : "Next Concept"}
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
          
          {/* Two buttons: Continue and Redo */}
          <div className="space-y-3">
            <button 
              onClick={() => onComplete()} 
              className="w-full py-5 bg-sky-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-sky-800 transition-all"
            >
              Continue to Interactive Lesson
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