"use client";

import { useState } from "react";
import Image from "next/image";

// Scenario data
const SCENARIOS = [
  {
    id: 1,
    name: "Maya",
    age: 24,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
    description: "Maya started investing 2 years ago. She's been watching the news and feels anxious because markets have been volatile lately. She's thinking about selling everything and waiting until things 'calm down' before buying back in.",
    situation: "The market is down 15% from its peak, and financial news outlets are predicting more losses.",
    question: "What should Maya do?",
    options: [
      { id: "stay", text: "Stay Invested - Keep her money in the market", label: "STAY INVESTED" },
      { id: "time", text: "Time the Market - Sell now and buy back when it's 'safe'", label: "TIME THE MARKET" }
    ],
    correctAnswer: "stay",
    explanation: "Maya should stay invested! This is exactly when investors make costly mistakes. She has no way of knowing when the market will bottom or when it will recover. History shows every downturn has been followed by recovery to new highs. By selling, she'd lock in losses and likely miss the recovery."
  },
  {
    id: 2,
    name: "Carlos",
    age: 19,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    description: "Carlos just saved $2,000 from his summer job. He wants to invest it, but he keeps hearing that 'a market crash is coming.' Before deciding, Carlos did his own research: he identified a broad-market index fund that has historically recovered from every crash, and he confirmed the companies inside it are fundamentally strong — many are expanding into new markets with high growth probability. His plan is clear: invest the $2,000 now and never touch it for 10+ years.",
    situation: "Markets are currently near all-time highs, and many experts are warning about overvaluation. But Carlos has done his homework — his chosen index fund is well-diversified, and he's investing with a long time horizon, not looking for quick gains.",
    question: "What should Carlos do?",
    options: [
      { id: "stay", text: "Invest Now - Put the money in the market today based on his research", label: "INVEST NOW" },
      { id: "time", text: "Wait for a Crash - Keep cash until markets drop", label: "WAIT FOR CRASH" }
    ],
    correctAnswer: "stay",
    explanation: "Carlos should invest now! He's already done what a smart investor does: research, identify fundamentally sound investments, and commit to a long time horizon. His index fund holds companies with real growth potential breaking into new markets — waiting doesn't make those fundamentals stronger, it just delays compounding. Nobody can predict exactly when crashes happen, and markets can stay 'overvalued' for years while continuing to rise. Even if a correction happens next month, Carlos's 10+ year horizon means he'd recover and come out ahead of those who waited. His research is his edge — now he needs time to be his engine."
  },
  {
    id: 3,
    name: "Jessica",
    age: 32,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
    description: "Jessica has been investing consistently for 6 years. Recently, her portfolio dropped 20% in value during a market correction. She's panicking and considering selling to 'protect what's left.'",
    situation: "A sudden market correction has wiped out 2 years of gains. Financial advisors on TV are debating whether this is the start of a bear market.",
    question: "What should Jessica do?",
    options: [
      { id: "stay", text: "Stay Invested - Hold her investments through the downturn", label: "STAY INVESTED" },
      { id: "time", text: "Sell Now - Get out before it gets worse", label: "SELL NOW" }
    ],
    correctAnswer: "stay",
    explanation: "Jessica should absolutely stay invested! This is volatility, not permanent loss. The moment she sells, temporary losses become permanent. She'd need to make TWO correct predictions (when to sell AND when to buy back) to come out ahead. History shows that every market correction has recovered. Panic selling turns volatility into actual loss."
  },
  {
    id: 4,
    name: "David",
    age: 28,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    description: "David has been dollar-cost averaging for 3 years, investing $300 every month regardless of market conditions. Recently the market has been climbing rapidly, and he's wondering if he should stop investing temporarily since 'prices are too high' and wait for a dip.",
    situation: "Markets have been on a 6-month winning streak. David thinks prices are inflated and wants to pause his monthly contributions until there's a pullback.",
    question: "What should David do?",
    options: [
      { id: "stay", text: "Keep Investing - Continue his $300 monthly regardless of prices", label: "KEEP INVESTING" },
      { id: "time", text: "Pause and Wait - Stop contributions until prices drop", label: "PAUSE & WAIT" }
    ],
    correctAnswer: "stay",
    explanation: "David should keep investing! Dollar-cost averaging works precisely because you DON'T try to time the market. Markets can stay 'overvalued' for years while continuing to rise. If he pauses, he misses out on compound growth and the best market days often happen during these upward trends. The entire point of DCA is market cycle neutrality."
  },
  {
    id: 5,
    name: "Aisha",
    age: 35,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
    description: "Aisha has $50,000 invested and has been reading about an upcoming recession. She's considering selling half her investments now, and if the recession happens, she'll buy back at lower prices. If it doesn't happen, she'll still have half invested.",
    situation: "Economic indicators are mixed. Some experts predict a recession within 12 months, while others say the economy will stay strong.",
    question: "What should Aisha do?",
    options: [
      { id: "stay", text: "Stay Fully Invested - Keep all $50,000 in the market", label: "STAY INVESTED" },
      { id: "time", text: "Sell Half - Reduce exposure and try to buy back lower", label: "SELL HALF" }
    ],
    correctAnswer: "stay",
    explanation: "Aisha should stay fully invested! Her 'hedged bet' strategy sounds smart but faces the Two-Decision Requirement trap. Even if a recession comes, she needs to correctly time when to buy back in—most people wait too long and miss the recovery. If no recession happens, she'll have missed gains on $25,000 for nothing. Market Cycle Neutrality means staying invested regardless."
  },
  {
    id: 6,
    name: "James",
    age: 42,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
    description: "James is an experienced investor who successfully timed one market crash 5 years ago—he sold before it dropped 30% and bought back near the bottom. He's convinced he can do it again and actively watches for signals to jump in and out.",
    situation: "James spends 10+ hours per week analyzing market indicators, reading analyst reports, and trying to predict the next big move.",
    question: "Should James keep trying to time the market?",
    options: [
      { id: "stay", text: "Switch to Buy-and-Hold - Stop timing and stay invested", label: "BUY-AND-HOLD" },
      { id: "time", text: "Keep Timing - Continue trying to predict market moves", label: "KEEP TIMING" }
    ],
    correctAnswer: "stay",
    explanation: "Even James should switch to buy-and-hold! His one success doesn't mean he can repeat it. Studies show that missing just the 10 best market days over a decade can cut returns in half. His 10+ hours per week would be better spent elsewhere, and statistics prove that staying invested beats timing for 92% of professional investors, let alone amateurs. Past success is often just luck."
  },
  {
    id: 7,
    name: "Emma",
    age: 26,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
    description: "Emma has been investing for 1 year and just experienced her first bull market run—her portfolio is up 25%! She's thinking about 'locking in gains' by selling and then reinvesting later when there's a correction.",
    situation: "Emma's portfolio has grown from $5,000 to $6,250. She wants to sell now, keep the profit safe, and buy back in if prices drop.",
    question: "What should Emma do?",
    options: [
      { id: "stay", text: "Stay Invested - Let the gains keep compounding", label: "STAY INVESTED" },
      { id: "time", text: "Lock in Gains - Sell now and wait for a dip", label: "LOCK IN GAINS" }
    ],
    correctAnswer: "stay",
    explanation: "Emma should stay invested! 'Locking in gains' sounds smart but creates two problems: (1) she'll owe taxes on the gains, and (2) she faces the Two-Decision Requirement—when does she buy back in? Markets can continue rising for years. The best strategy is to let winners keep running. Her gains aren't 'safe' in cash—they're losing value to inflation."
  },
  {
    id: 8,
    name: "Robert",
    age: 55,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400",
    description: "Robert is 10 years from retirement with $400,000 saved. He's worried about a market crash destroying his retirement plans, so he's considering moving everything to cash 'just to be safe' for the next decade.",
    situation: "Robert has 10 years until retirement and is risk-averse after watching friends lose money in past crashes.",
    question: "What should Robert do?",
    options: [
      { id: "stay", text: "Stay Invested - Keep money in a balanced portfolio", label: "STAY INVESTED" },
      { id: "time", text: "Move to Cash - Avoid all market risk", label: "MOVE TO CASH" }
    ],
    correctAnswer: "stay",
    explanation: "Robert should stay invested, but with a more conservative allocation! Moving entirely to cash for 10 years would be devastating—he'd lose $400,000 worth of growth to inflation. With 10 years to retirement, he should shift to a balanced portfolio (maybe 60% stocks, 40% bonds) that reduces risk while still allowing growth. The Recovery Pattern shows that even if a crash happens, 10 years is enough time to recover and grow."
  }
];

// Simulator presets
const SIMULATOR_PRESETS = [
  { name: "Young Investor (30 years)", years: 30, initial: 10000, monthly: 300 },
  { name: "Mid-Career (20 years)", years: 20, initial: 50000, monthly: 1000 },
  { name: "Pre-Retirement (10 years)", years: 10, initial: 200000, monthly: 2000 },
];

export default function L2_Interactive({ onComplete, onBack }: { onComplete: () => void; onBack?: () => void }) {
  const [view, setView] = useState<"intro" | "scenarios" | "simulator" | "results">("intro");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"stay" | "time" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  // Simulator state
  const [investmentYears, setInvestmentYears] = useState(30);
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [hasUsedSimulator, setHasUsedSimulator] = useState(false);

  const calculateFullyInvested = (initial: number, monthly: number, years: number, returnRate: number) => {
    const monthlyRate = returnRate / 100 / 12;
    let balance = initial;
    for (let month = 1; month <= years * 12; month++) {
      balance = balance * (1 + monthlyRate) + monthly;
    }
    return Math.round(balance);
  };

  const calculateMissingBestDays = (initial: number, monthly: number, years: number, baseReturn: number, daysMissed: number) => {
    const returnReduction = daysMissed === 10 ? 3.5 : daysMissed === 20 ? 5.5 : 7.5;
    const reducedReturn = baseReturn - returnReduction;
    return calculateFullyInvested(initial, monthly, years, reducedReturn);
  };

  const fullyInvestedResult = calculateFullyInvested(initialInvestment, monthlyContribution, investmentYears, 10);
  const missing10Days = calculateMissingBestDays(initialInvestment, monthlyContribution, investmentYears, 10, 10);
  const missing20Days = calculateMissingBestDays(initialInvestment, monthlyContribution, investmentYears, 10, 20);
  const missing30Days = calculateMissingBestDays(initialInvestment, monthlyContribution, investmentYears, 10, 30);

  const totalContributed = initialInvestment + (monthlyContribution * 12 * investmentYears);
  const loss10Days = fullyInvestedResult - missing10Days;
  const loss20Days = fullyInvestedResult - missing20Days;
  const loss30Days = fullyInvestedResult - missing30Days;

  const handleBack = () => {
    if (view === "intro") {
      onBack?.();
    } else if (view === "scenarios") {
      if (currentScenario > 0 && !showFeedback) {
        setCurrentScenario(currentScenario - 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else if (currentScenario === 0) {
        setView("intro");
      }
    } else if (view === "simulator") {
      setView("scenarios");
      setCurrentScenario(SCENARIOS.length - 1);
    }
  };

  const handleSelectAnswer = (answer: "stay" | "time") => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = selectedAnswer === SCENARIOS[currentScenario].correctAnswer;
    if (isCorrect) setScore(score + 1);
    setAnswers([...answers, isCorrect]);
    setShowFeedback(true);
  };

  const handleNextScenario = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario(currentScenario + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setView("simulator");
    }
  };

  const handleFinishSimulator = () => {
    setHasUsedSimulator(true);
    setView("results");
  };

  const percentage = Math.round((score / SCENARIOS.length) * 100);
  const showBackButton = view === "intro" || (view === "scenarios" && !showFeedback) || view === "simulator";

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

  // VIEW 1: INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 2: Apply</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Apply Your Knowledge</h1>
          <p className="text-[#4F7D96] mt-2">Put what you learned into practice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real-World Scenarios</h3>
            <p className="text-sm text-[#4F7D96]">
              Read about 8 different investors facing tough decisions. Should they stay invested or try to time the market? Apply what you learned about market psychology.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Best Days Simulator</h3>
            <p className="text-sm text-[#4F7D96]">
              See exactly how much wealth you'd lose by missing the best market days while trying to time the market. The numbers might shock you.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-2xl border border-sky-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">💡 Remember from Lesson 1:</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Missing just <strong>10 best days</strong> can cut your returns by 50%</li>
            <li>• Market timing requires being <strong>right twice</strong> (sell AND buy back)</li>
            <li>• Volatility is temporary; panic-selling makes it <strong>permanent loss</strong></li>
            <li>• Every market crash in history has been followed by <strong>recovery</strong> to new highs</li>
          </ul>
        </div>

        <button
          onClick={() => setView("scenarios")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start the Challenge
        </button>
      </div>
    );
  }

  // VIEW 2: SCENARIOS
  if (view === "scenarios") {
    const scenario = SCENARIOS[currentScenario];

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Apply Your Knowledge</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Read each scenario and decide: Stay Invested or Time the Market?
            </h2>
            <p className="text-slate-400 text-sm mt-2">Scenario {currentScenario + 1} of {SCENARIOS.length}</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${((currentScenario + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 100}%` }}
            />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            {/* Person header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image src={scenario.image} alt={scenario.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{scenario.name}, {scenario.age}</h3>
                <p className="text-slate-600 text-sm mt-1">{scenario.description}</p>
              </div>
            </div>

            {/* Situation */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl mb-6">
              <h4 className="font-bold text-amber-900 text-sm mb-1">Current Situation:</h4>
              <p className="text-slate-700 text-sm">{scenario.situation}</p>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h4 className="font-bold text-[#0B5E8E] text-lg mb-4">{scenario.question}</h4>

              <div className="space-y-3">
                {scenario.options.map((option) => {
                  const isSelected = selectedAnswer === option.id;
                  const isCorrect = option.id === scenario.correctAnswer;

                  let buttonStyle = "border-slate-200 bg-white hover:bg-slate-50";
                  if (isSelected && !showFeedback) buttonStyle = "border-[#0B5E8E] bg-sky-50";
                  if (showFeedback && isCorrect) buttonStyle = "border-green-500 bg-green-50";
                  if (showFeedback && isSelected && !isCorrect) buttonStyle = "border-red-500 bg-red-50";

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id as "stay" | "time")}
                      disabled={showFeedback}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${buttonStyle} ${
                        showFeedback ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#0B5E8E] text-xs mb-1">{option.label}</div>
                          <div className="text-slate-700 text-sm">{option.text}</div>
                        </div>
                        {showFeedback && isCorrect && <span className="text-green-600 font-bold text-xl">✓</span>}
                        {showFeedback && isSelected && !isCorrect && <span className="text-red-600 font-bold text-xl">✕</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 mb-6 border-2 ${
                selectedAnswer === scenario.correctAnswer
                  ? "bg-green-50 border-green-200"
                  : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selectedAnswer === scenario.correctAnswer ? "✅" : "💡"}</span>
                  <span className={`font-bold uppercase tracking-wider text-sm ${
                    selectedAnswer === scenario.correctAnswer ? "text-green-700" : "text-amber-700"
                  }`}>
                    {selectedAnswer === scenario.correctAnswer ? "Correct!" : "Not quite!"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {scenario.explanation}
                </p>
              </div>
            )}

            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextScenario}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : "Continue to Best Days Simulator"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: SIMULATOR
  if (view === "simulator") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Best Days Impact Simulator</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">The Cost of Missing the Best Days</h2>
            <p className="text-slate-500 mt-1">See how trying to time the market can devastate your wealth</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Your Investment Scenario</h3>

              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Quick scenarios:</p>
                <div className="flex flex-wrap gap-2">
                  {SIMULATOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setInvestmentYears(preset.years);
                        setInitialInvestment(preset.initial);
                        setMonthlyContribution(preset.monthly);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-all"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Starting Amount</label>
                  <input
                    type="range"
                    min="1000"
                    max="200000"
                    step="1000"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5E8E]"
                  />
                  <p className="text-2xl font-bold text-[#0B5E8E] mt-2">${initialInvestment.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Contribution</label>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5E8E]"
                  />
                  <p className="text-2xl font-bold text-[#0B5E8E] mt-2">${monthlyContribution.toLocaleString()}/month</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Investment Timeline</label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={investmentYears}
                    onChange={(e) => setInvestmentYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5E8E]"
                  />
                  <p className="text-2xl font-bold text-[#0B5E8E] mt-2">{investmentYears} years</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500">Assumed annual return</p>
                  <p className="font-bold text-slate-900">10% (historical S&P 500 average)</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <h3 className="font-bold text-green-900">Stayed Fully Invested</h3>
                </div>
                <p className="text-4xl font-black text-green-700 mb-1">${fullyInvestedResult.toLocaleString()}</p>
                <p className="text-sm text-green-600">Never tried to time the market</p>
              </div>

              <div className="space-y-3">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-orange-700">Missed 10 Best Days</p>
                    <p className="text-xl font-black text-orange-700">${missing10Days.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-orange-600">
                    Lost: <strong>${loss10Days.toLocaleString()}</strong> ({Math.round((loss10Days / fullyInvestedResult) * 100)}% of potential)
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-red-700">Missed 20 Best Days</p>
                    <p className="text-xl font-black text-red-700">${missing20Days.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-red-600">
                    Lost: <strong>${loss20Days.toLocaleString()}</strong> ({Math.round((loss20Days / fullyInvestedResult) * 100)}% of potential)
                  </p>
                </div>

                <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-rose-700">Missed 30 Best Days</p>
                    <p className="text-xl font-black text-rose-700">${missing30Days.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-rose-600">
                    Lost: <strong>${loss30Days.toLocaleString()}</strong> ({Math.round((loss30Days / fullyInvestedResult) * 100)}% of potential)
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4 text-sm">Visual Impact</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-600 font-medium">Fully Invested</span>
                      <span className="text-green-700 font-bold">${fullyInvestedResult.toLocaleString()}</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-orange-600 font-medium">Missed 10 Days</span>
                      <span className="text-orange-700 font-bold">${missing10Days.toLocaleString()}</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full transition-all duration-500"
                        style={{ width: `${(missing10Days / fullyInvestedResult) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-600 font-medium">Missed 20 Days</span>
                      <span className="text-red-700 font-bold">${missing20Days.toLocaleString()}</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full transition-all duration-500"
                        style={{ width: `${(missing20Days / fullyInvestedResult) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>💡 Key Insight:</strong> The best market days are impossible to predict and often happen during volatile periods. By trying to time the market, you risk missing these crucial days and losing hundreds of thousands in potential wealth.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">Your Total Contributions</p>
                <p className="text-2xl font-bold text-slate-700">${totalContributed.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Over {investmentYears} years</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={handleFinishSimulator}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              See My Results
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
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{percentage >= 75 ? "🎯" : percentage >= 50 ? "📈" : "⏰"}</span>
          </div>

          <h2 className={`text-3xl font-black mb-2 ${
            percentage >= 75 ? "text-emerald-600" : percentage >= 50 ? "text-sky-600" : "text-amber-600"
          }`}>
            {percentage >= 75 ? "Market Veteran!" : percentage >= 50 ? "Getting There!" : "Keep Practicing!"}
          </h2>

          <div className="text-6xl font-black text-slate-900 mb-2">{score}/{SCENARIOS.length}</div>
          <p className="text-slate-500 mb-6">scenarios answered correctly</p>

          <div className="grid grid-cols-4 gap-2 mb-6">
            {answers.map((correct, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full ${correct ? "bg-emerald-500" : "bg-red-400"}`}
              />
            ))}
          </div>

          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            {percentage >= 75
              ? "Excellent! You understand why staying invested beats trying to time the market. You'll avoid the costly mistakes most investors make!"
              : percentage >= 50
                ? "Good progress! Remember: even professionals can't consistently time the market. Stay invested through the ups and downs."
                : "Keep learning! The key lesson: market timing sounds smart but almost always underperforms buy-and-hold investing."
            }
          </p>

          {hasUsedSimulator && (
            <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                <strong>💡 From the simulator:</strong> You saw how missing just 10–30 best market days can cost you tens or hundreds of thousands. Since you can't predict when those days will happen, stay invested!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => onComplete()}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue to Lesson 3
            </button>
            <button
              onClick={() => {
                setView("intro");
                setCurrentScenario(0);
                setSelectedAnswer(null);
                setShowFeedback(false);
                setScore(0);
                setAnswers([]);
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}