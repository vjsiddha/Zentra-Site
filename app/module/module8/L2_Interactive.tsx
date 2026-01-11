"use client";

import { useState } from "react";
import Image from "next/image";

// Scenario data
const SCENARIOS = [
  {
    id: 1,
    name: "Emma",
    age: 16,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
    description: "Recently started her first part-time job. She earns a steady but limited income and wants to begin saving early so she can help pay for college or other future expenses. She has little experience with investing and is just getting started.",
    timeAvailable: "About 30 minutes per week — Emma can occasionally check her account but doesn't have time for frequent research or trading.",
    goal: "Long-term growth (5+ years) — Emma wants her money to grow steadily over time, even if results aren't immediate.",
    riskComfort: "Moderate — Emma understands that markets go up and down and is willing to accept short-term fluctuations in exchange for long-term growth.",
    correctAnswer: "passive",
    explanation: "Passive investing is perfect for Emma! With limited time, little experience, and a long-term goal, low-cost index funds will grow her money steadily without requiring constant attention. The lower fees mean more of her hard-earned money stays invested."
  },
  {
    id: 2,
    name: "Marcus",
    age: 18,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    description: "Marcus is curious about how companies grow and enjoys learning about different industries. He wants to be more involved in managing his money but isn't sure how much effort investing should realistically require.",
    timeAvailable: "A few hours per week, depending on his school workload. Some weeks he has more time to research, while other weeks he prefers a simpler approach.",
    goal: "Grow his money while learning more about investing. Marcus would like to understand how investing works and hopes to earn solid returns over time, but he also wants an approach that won't feel overwhelming or stressful.",
    riskComfort: "Moderate — Marcus is okay with some ups and downs but would be discouraged by large losses early on.",
    correctAnswer: "passive",
    explanation: "While Marcus is curious about investing, passive investing is still the better choice. He can learn about markets while his index funds grow, without the stress of picking individual stocks. As he gains experience, he can always add some active investments later with money he can afford to lose."
  },
  {
    id: 3,
    name: "Sarah",
    age: 17,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
    description: "Sarah received a $1,000 gift from her grandparents and wants to use it wisely for future expenses like her first car or college. She's curious about how money grows and has recently started paying attention to different companies and industries she's interested in.",
    timeAvailable: "Limited on most school days, but she has dedicated blocks of time on weekends.",
    goal: "Grow her money while learning how investing works. Sarah is interested in understanding how individual companies perform and wants to feel more involved in the decisions she makes with her money.",
    riskComfort: "High — Sarah understands her investment value may fluctuate in the short term and is willing to take some risk to potentially grow her $1,000 faster.",
    correctAnswer: "passive",
    explanation: "Even with higher risk tolerance and interest in companies, passive investing is smarter for Sarah's $1,000. With such a small amount, active trading fees would eat into her returns significantly. She should invest most in index funds and perhaps use a small portion (10-20%) to experiment with individual stocks if she wants hands-on learning."
  },
  {
    id: 4,
    name: "James",
    age: 45,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
    description: "James is a financial analyst with 20 years of experience. He spends 40+ hours per week analyzing markets professionally and has access to advanced research tools and real-time data through his job.",
    timeAvailable: "Extensive — James analyzes markets as his full-time job and can dedicate significant time to managing his personal portfolio.",
    goal: "Beat the market returns by leveraging his professional expertise and access to information that average investors don't have.",
    riskComfort: "High — James has a large emergency fund and stable income, allowing him to take calculated risks with a portion of his portfolio.",
    correctAnswer: "active",
    explanation: "James is one of the rare cases where active investing might make sense. With professional expertise, extensive time, advanced tools, and high risk tolerance backed by financial stability, he has the best chance of beating the market. However, even most professionals recommend keeping a core passive portfolio!"
  },
  {
    id: 5,
    name: "Priya",
    age: 28,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
    description: "Priya is a busy software engineer working 50+ hours per week. She has a good salary and wants her money to work for her, but she has no interest in spending her free time researching stocks.",
    timeAvailable: "Minimal — Priya values her limited free time for hobbies and family, not financial research.",
    goal: "Build wealth for retirement (30+ years away) with minimal effort required.",
    riskComfort: "Moderate — She's okay with market fluctuations since she won't need the money for decades.",
    correctAnswer: "passive",
    explanation: "Passive investing is ideal for Priya. With a long time horizon, no interest in active management, and limited time, low-cost index funds will build her wealth automatically. She can set up automatic contributions and barely think about it while her money compounds over 30+ years."
  },
  {
    id: 6,
    name: "David",
    age: 62,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
    description: "David is 3 years from retirement with $800,000 saved. He's worried about market crashes affecting his retirement plans and wants to protect what he's built while still earning some returns.",
    timeAvailable: "Moderate — David has time to monitor his investments but doesn't want the stress of constant trading.",
    goal: "Preserve capital while generating modest growth. He needs this money to last 25+ years in retirement.",
    riskComfort: "Low — David cannot afford significant losses this close to retirement.",
    correctAnswer: "passive",
    explanation: "Passive investing with a conservative allocation is best for David. He should shift toward bond index funds and dividend-focused stock index funds. Active management fees would unnecessarily eat into his retirement savings, and the added risk of stock picking could devastate his retirement plans."
  },
  {
    id: 7,
    name: "Alex",
    age: 22,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400",
    description: "Alex just graduated college and landed their first job. They have $15,000 in student loans at 5% interest and want to start investing the $500/month they can save after expenses.",
    timeAvailable: "Limited — Alex is focused on building their career and doesn't have much time for investment research.",
    goal: "Build wealth while also paying down debt responsibly.",
    riskComfort: "Moderate — Alex understands they have time to recover from market downturns but doesn't want unnecessary risk.",
    correctAnswer: "passive",
    explanation: "Passive investing makes the most sense for Alex, but they should also consider paying extra on their student loans. A balanced approach: put money in a low-cost index fund while paying more than the minimum on loans. The simplicity of passive investing lets Alex focus on their career without money stress."
  },
  {
    id: 8,
    name: "Michelle",
    age: 35,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
    description: "Michelle runs a successful small business and has $200,000 to invest. She's entrepreneurial and likes being hands-on with financial decisions, but her business already demands most of her attention.",
    timeAvailable: "Very limited — Her business requires 60+ hours per week, leaving almost no time for investment research.",
    goal: "Grow wealth significantly over the next 20 years to potentially sell her business and retire early.",
    riskComfort: "High — Michelle is comfortable with risk, having built a business from scratch.",
    correctAnswer: "passive",
    explanation: "Despite her high risk tolerance and entrepreneurial spirit, passive investing is the clear winner for Michelle. Her time is better spent growing her business (where she has control and expertise) than trying to beat the market. Low-cost index funds will compound her $200,000 while she focuses on what she does best."
  }
];

// Fee comparison simulation data
const FEE_PRESETS = [
  { name: "College Student", initial: 1000, monthly: 100, years: 10 },
  { name: "Young Professional", initial: 10000, monthly: 500, years: 30 },
  { name: "Mid-Career", initial: 50000, monthly: 1000, years: 20 },
  { name: "Pre-Retirement", initial: 200000, monthly: 2000, years: 10 },
];

export default function L2_Interactive({ onComplete, onBack }: { onComplete: (score: number) => void; onBack?: () => void }) {
  const [view, setView] = useState<"intro" | "scenarios" | "simulator" | "results">("intro");
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<"active" | "passive" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  
  // Simulator state
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [investmentYears, setInvestmentYears] = useState(30);
  const [hasUsedSimulator, setHasUsedSimulator] = useState(false);

  // Calculate returns for simulator
  const calculateReturns = (initial: number, monthly: number, years: number, returnRate: number, mer: number) => {
    const effectiveReturn = (returnRate - mer) / 100 / 12;
    let balance = initial;
    
    for (let month = 1; month <= years * 12; month++) {
      balance = balance * (1 + effectiveReturn) + monthly;
    }
    
    return Math.round(balance);
  };

  const passiveResult = calculateReturns(initialInvestment, monthlyContribution, investmentYears, 7, 0.05);
  const activeResult = calculateReturns(initialInvestment, monthlyContribution, investmentYears, 7, 2.0);
  const feeDifference = passiveResult - activeResult;
  const totalContributed = initialInvestment + (monthlyContribution * 12 * investmentYears);

  // Back navigation
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

  const handleSelectAnswer = (answer: "active" | "passive") => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const isCorrect = selectedAnswer === SCENARIOS[currentScenario].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }
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

  // VIEW 1: INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        {showBackButton && <BackButton />}
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
              Read about 8 different people and decide: should they choose Active or Passive investing? Consider their time, goals, and risk tolerance.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Fee Impact Simulator</h3>
            <p className="text-sm text-[#4F7D96]">
              See exactly how much money you'd lose to fees over time. Compare 0.05% MER vs 2% MER and watch the difference compound.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-2xl border border-sky-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">💡 Remember from Lesson 1:</h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• <strong>92%</strong> of active funds fail to beat the market over 15 years</li>
            <li>• Passive investing = low fees, automatic diversification, less time required</li>
            <li>• Active investing = higher fees, more research, trying to beat the market</li>
            <li>• The MER difference (0.05% vs 2%) compounds into huge amounts over time</li>
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
              Read each scenario and decide what the best option is: Active or Passive investing?
            </h2>
            <p className="text-slate-400 text-sm mt-2">Scenario {currentScenario + 1} of {SCENARIOS.length}</p>
          </header>

          {/* Progress bar */}
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
                <h3 className="text-xl font-bold text-slate-900">{scenario.name} - {scenario.age} Years old</h3>
                <p className="text-slate-600 text-sm mt-1">{scenario.description}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-bold text-[#0B5E8E] text-sm">Time Available:</h4>
                <p className="text-slate-700 text-sm">{scenario.timeAvailable}</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0B5E8E] text-sm">Goal:</h4>
                <p className="text-slate-700 text-sm">{scenario.goal}</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0B5E8E] text-sm">Risk Comfort:</h4>
                <p className="text-slate-700 text-sm">{scenario.riskComfort}</p>
              </div>
            </div>

            {/* Answer buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => handleSelectAnswer("active")}
                disabled={showFeedback}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  selectedAnswer === "active"
                    ? showFeedback
                      ? scenario.correctAnswer === "active"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-[#0B5E8E] text-white"
                    : showFeedback && scenario.correctAnswer === "active"
                      ? "bg-green-100 text-green-700 border-2 border-green-500"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
              >
                Active Investing
              </button>
              <button
                onClick={() => handleSelectAnswer("passive")}
                disabled={showFeedback}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  selectedAnswer === "passive"
                    ? showFeedback
                      ? scenario.correctAnswer === "passive"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-[#0B5E8E] text-white"
                    : showFeedback && scenario.correctAnswer === "passive"
                      ? "bg-green-100 text-green-700 border-2 border-green-500"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
              >
                Passive Investing
              </button>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                selectedAnswer === scenario.correctAnswer
                  ? "bg-green-50 border-2 border-green-200"
                  : "bg-amber-50 border-2 border-amber-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selectedAnswer === scenario.correctAnswer ? "✅" : "💡"}</span>
                  <span className={`font-bold uppercase tracking-wider text-sm ${
                    selectedAnswer === scenario.correctAnswer ? "text-green-700" : "text-amber-700"
                  }`}>
                    {selectedAnswer === scenario.correctAnswer ? "Correct!" : "Good thinking, but..."}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {scenario.explanation}
                </p>
              </div>
            )}

            {/* Action button */}
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
                {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : "Continue to Fee Simulator"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: FEE SIMULATOR
  if (view === "simulator") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Fee Impact Simulator</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">See How Much Fees Really Cost You</h2>
            <p className="text-slate-500 mt-1">Adjust the sliders to see the impact on YOUR money</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-6">Your Investment Plan</h3>
              
              {/* Presets */}
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-2">Quick presets:</p>
                <div className="flex flex-wrap gap-2">
                  {FEE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setInitialInvestment(preset.initial);
                        setMonthlyContribution(preset.monthly);
                        setInvestmentYears(preset.years);
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Starting Amount
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="200000"
                    step="1000"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5E8E]"
                  />
                  <p className="text-2xl font-bold text-[#0B5E8E] mt-2">
                    ${initialInvestment.toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Monthly Contribution
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3000"
                    step="50"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5E8E]"
                  />
                  <p className="text-2xl font-bold text-[#0B5E8E] mt-2">
                    ${monthlyContribution.toLocaleString()}/month
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Investment Timeline
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={investmentYears}
                    onChange={(e) => setInvestmentYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B5E8E]"
                  />
                  <p className="text-2xl font-bold text-[#0B5E8E] mt-2">
                    {investmentYears} years
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500">Assumed annual return</p>
                  <p className="font-bold text-slate-900">7% (before fees)</p>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Comparison cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                  <p className="text-xs text-green-600 font-bold uppercase mb-1">Passive (0.05% MER)</p>
                  <p className="text-3xl font-black text-green-700">
                    ${passiveResult.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Index Fund</p>
                </div>
                <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                  <p className="text-xs text-red-600 font-bold uppercase mb-1">Active (2.00% MER)</p>
                  <p className="text-3xl font-black text-red-700">
                    ${activeResult.toLocaleString()}
                  </p>
                  <p className="text-sm text-red-600 mt-1">Mutual Fund</p>
                </div>
              </div>

              {/* The difference */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2">💸 Money Lost to Higher Fees</h3>
                <p className="text-4xl font-black text-amber-700">
                  ${feeDifference.toLocaleString()}
                </p>
                <p className="text-sm text-amber-600 mt-2">
                  That's <strong>{Math.round((feeDifference / totalContributed) * 100)}%</strong> of your total contributions (${totalContributed.toLocaleString()}) lost to the fee difference!
                </p>
              </div>

              {/* Visual comparison */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-4">Visual Comparison</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600 font-medium">Passive</span>
                      <span className="text-green-700 font-bold">${passiveResult.toLocaleString()}</span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600 font-medium">Active</span>
                      <span className="text-red-700 font-bold">${activeResult.toLocaleString()}</span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-400 rounded-full transition-all duration-500" 
                        style={{ width: `${(activeResult / passiveResult) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key insight */}
              <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
                <p className="text-sm text-sky-800">
                  <strong>Key Insight:</strong> The 1.95% fee difference doesn't sound like much, but over {investmentYears} years it costs you <strong>${feeDifference.toLocaleString()}</strong>. This is money that could have been compounding for YOUR future, not paying fund managers.
                </p>
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
            <span className="text-4xl">{percentage >= 75 ? "🏆" : percentage >= 50 ? "👍" : "📚"}</span>
          </div>
          
          <h2 className={`text-3xl font-black mb-2 ${
            percentage >= 75 ? "text-emerald-600" : percentage >= 50 ? "text-sky-600" : "text-amber-600"
          }`}>
            {percentage >= 75 ? "Investment Expert!" : percentage >= 50 ? "Good Progress!" : "Keep Learning!"}
          </h2>
          
          <div className="text-6xl font-black text-slate-900 mb-2">{score}/{SCENARIOS.length}</div>
          <p className="text-slate-500 mb-6">scenarios answered correctly</p>

          {/* Score breakdown */}
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
              ? "Excellent! You really understand when passive vs active investing makes sense. You're ready to make smart investment decisions!" 
              : percentage >= 50 
                ? "Good work! You're getting the hang of it. Remember: for most people, most of the time, passive investing wins."
                : "Keep practicing! The key takeaway: unless you have professional expertise and lots of time, passive investing is usually the better choice."
            }
          </p>

          {hasUsedSimulator && (
            <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                <strong>💡 From the simulator:</strong> You saw how a 1.95% fee difference can cost hundreds of thousands over time. Always check the MER before investing!
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button 
              onClick={() => onComplete(percentage)} 
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