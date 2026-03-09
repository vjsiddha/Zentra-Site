"use client";

import { useState, useMemo } from "react";

// Helper to calculate returns with missed best days
const calculateWithMissedDays = (initial: number, monthly: number, years: number, daysMissed: number) => {
  // Base return is 10% (historical S&P 500 average)
  // Missing best days reduces annualized returns significantly
  const returnReductions: { [key: number]: number } = {
    0: 0,      // Fully invested
    10: 3.5,   // Missing 10 best days
    20: 5.5,   // Missing 20 best days
    30: 7.5,   // Missing 30 best days
  };
  
  const effectiveReturn = (10 - (returnReductions[daysMissed] || 0)) / 100 / 12;
  let balance = initial;
  
  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + effectiveReturn) + monthly;
  }
  
  return Math.round(balance);
};

// Calculate buy-and-hold vs market timing
const calculateTimingComparison = (initial: number, monthly: number, years: number) => {
  const fullyInvested = calculateWithMissedDays(initial, monthly, years, 0);
  const missed10 = calculateWithMissedDays(initial, monthly, years, 10);
  const missed20 = calculateWithMissedDays(initial, monthly, years, 20);
  
  return {
    fullyInvested,
    missed10,
    missed20,
    loss10: fullyInvested - missed10,
    loss20: fullyInvested - missed20,
  };
};

export default function L3_Applying({ onComplete, onBack }: { onComplete: () => void; onBack?: () => void }) {
  const [view, setView] = useState<"intro" | "timing-cost" | "psychology" | "reflection" | "complete">("intro");
  
  // Timing cost calculator state
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [monthlyAmount, setMonthlyAmount] = useState(500);
  const [timeHorizon, setTimeHorizon] = useState(30);
  
  // Reflection state
  const [reflection1, setReflection1] = useState("");
  const [reflection2, setReflection2] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  // Calculate timing cost results
  const timingResults = useMemo(() => {
    return calculateTimingComparison(investmentAmount, monthlyAmount, timeHorizon);
  }, [investmentAmount, monthlyAmount, timeHorizon]);

  const totalContributed = investmentAmount + (monthlyAmount * 12 * timeHorizon);

  // Back navigation
  const handleBack = () => {
    if (view === "intro") {
      onBack?.();
    } else if (view === "timing-cost") {
      setView("intro");
    } else if (view === "psychology") {
      setView("timing-cost");
    } else if (view === "reflection") {
      setView("psychology");
    }
  };

  const showBackButton = view !== "complete";

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
        <div className="w-full text-center mb-8">
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 3: Reflect</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Reflect & Apply</h1>
          <p className="text-[#4F7D96] mt-2">See the real cost of trying to time the market</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">💸</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">The Real Cost of Market Timing</h3>
            <p className="text-sm text-[#4F7D96]">
              Use our calculator to see exactly how much wealth you'd lose by missing the best market days while sitting on the sidelines.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Understanding Market Psychology</h3>
            <p className="text-sm text-[#4F7D96]">
              Explore why even smart investors fall into the timing trap and how to overcome emotional decision-making.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-rose-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 Module 7 Key Questions:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• What's the cost of missing the best days?</li>
            <li>• Why is staying invested better than perfect timing?</li>
            <li>• How can you avoid emotional investing mistakes?</li>
          </ul>
        </div>

        <button 
          onClick={() => setView("timing-cost")} 
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Exploring
        </button>
      </div>
    );
  }

  // VIEW 2: TIMING COST CALCULATOR
  if (view === "timing-cost") {
    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">The Cost of Trying to Time the Market</h2>
            <p className="text-slate-500 mt-1">Interactive Impact Calculator</p>
          </header>

          <div className="bg-[#1a2b3c] rounded-3xl p-8 text-white">
            <p className="text-slate-300 mb-6">
              When you try to time the market, you risk missing the best days. Let's see the real impact:
            </p>

            {/* Input controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Starting Investment</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                    className="w-full bg-[#2a3b4c] border-0 rounded-xl py-4 pl-8 pr-4 text-white text-lg font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Monthly Contribution</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value) || 0)}
                    className="w-full bg-[#2a3b4c] border-0 rounded-xl py-4 pl-8 pr-4 text-white text-lg font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Time Horizon</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(Number(e.target.value) || 1)}
                    className="w-full bg-[#2a3b4c] border-0 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>
            </div>

            {/* Results comparison */}
            <div className="space-y-4 mb-6">
              <div className="bg-[#2a3d3d] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <p className="text-emerald-300 text-sm font-medium">Stayed Fully Invested</p>
                </div>
                <p className="text-3xl font-black text-white">${timingResults.fullyInvested.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-1">Never tried to time the market</p>
              </div>

              <div className="bg-[#3d2d2a] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-orange-300 text-sm font-medium">Missed 10 Best Days</p>
                </div>
                <p className="text-3xl font-black text-white">${timingResults.missed10.toLocaleString()}</p>
                <p className="text-orange-400 text-sm mt-1">Lost: ${timingResults.loss10.toLocaleString()} ({Math.round((timingResults.loss10 / timingResults.fullyInvested) * 100)}% of potential)</p>
              </div>
              
              <div className="bg-[#3d2a2a] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">❌</span>
                  <p className="text-red-300 text-sm font-medium">Missed 20 Best Days</p>
                </div>
                <p className="text-3xl font-black text-white">${timingResults.missed20.toLocaleString()}</p>
                <p className="text-red-400 text-sm mt-1">Lost: ${timingResults.loss20.toLocaleString()} ({Math.round((timingResults.loss20 / timingResults.fullyInvested) * 100)}% of potential)</p>
              </div>
            </div>

            {/* Why this matters */}
            <div className="bg-[#2a3b4c] rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Why this matters</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  The best market days are impossible to predict and often happen during volatile periods. By trying to time the market, you risk missing these crucial days and losing <span className="text-amber-400 font-bold">${timingResults.loss10.toLocaleString()}</span> to <span className="text-red-400 font-bold">${timingResults.loss20.toLocaleString()}</span> in wealth! 💰
                </p>
              </div>
            </div>

            <div className="mt-6 bg-slate-700/30 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Your Total Contributions</p>
              <p className="text-2xl font-bold text-white">${totalContributed.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Over {timeHorizon} years</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("psychology")}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              Continue: Market Psychology
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: PSYCHOLOGY & BEHAVIOR
  if (view === "psychology") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Understanding Market Psychology</h2>
            <p className="text-slate-500 mt-1">Why smart people make emotional investing mistakes</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Common mistakes */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-lg">😰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Fear of Loss</h3>
                    <p className="text-sm text-slate-600">
                      When markets drop, panic takes over. Your brain screams "sell before it gets worse!" But this turns temporary volatility into permanent loss.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-lg">🎢</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">FOMO (Fear of Missing Out)</h3>
                    <p className="text-sm text-slate-600">
                      Markets rally and suddenly everyone's getting rich. You jump in at the peak, only to watch it crash. Chasing returns rarely works.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Overconfidence Bias</h3>
                    <p className="text-sm text-slate-600">
                      You timed one market move correctly and think you're a genius. But even professionals can't consistently predict markets. One success doesn't mean you've cracked the code.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-lg">📰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Media Influence</h3>
                    <p className="text-sm text-slate-600">
                      Financial news thrives on fear and excitement. "Market crash coming!" or "Bull market forever!" Headlines drive emotional decisions, not rational ones.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Solutions */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200">
                <h3 className="text-xl font-bold text-emerald-900 mb-4">✅ How to Stay Rational</h3>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 mb-2">1. Automate Everything</h4>
                    <p className="text-sm text-slate-600">
                      Set up automatic monthly contributions. When investing is automatic, emotions can't interfere. You invest in bull markets AND bear markets without thinking.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 mb-2">2. Ignore Daily News</h4>
                    <p className="text-sm text-slate-600">
                      Financial news is designed to grab attention, not help you invest. Check your portfolio quarterly at most. Daily checking leads to emotional decisions.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 mb-2">3. Remember History</h4>
                    <p className="text-sm text-slate-600">
                      Every crash in history has been followed by recovery to new highs. The 2008 crisis, the dot-com bubble, the pandemic crash—all recovered. This time isn't different.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4">
                    <h4 className="font-bold text-slate-900 mb-2">4. Have a Plan</h4>
                    <p className="text-sm text-slate-600">
                      Write down your strategy when markets are calm. "I will invest $X monthly regardless of market conditions." When panic hits, follow your plan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key insight */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>🎯 Key Insight:</strong> The investor who does nothing (stays invested) almost always beats the investor who tries to be clever. Boring wins in investing.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("reflection")}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              Continue to Reflection
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 4: REFLECTION
  if (view === "reflection") {
    return (
      <div className="relative max-w-3xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Final Reflection</p>
            <h2 className="text-2xl font-bold text-slate-900">What Did You Learn?</h2>
            <p className="text-slate-500 mt-1">Reflect on your biggest takeaways</p>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6">
            {/* Summary stats */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 mb-3">📊 What You Discovered</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Cost of missing 10 best days</p>
                  <p className="font-bold text-orange-600">${timingResults.loss10.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cost of missing 20 best days</p>
                  <p className="font-bold text-red-600">${timingResults.loss20.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Reflection questions */}
            <div>
              <label className="block font-bold text-slate-900 mb-2">
                1. Think about a time when you (or someone you know) made an emotional financial decision. What would you do differently now?
              </label>
              <textarea
                value={reflection1}
                onChange={(e) => setReflection1(e.target.value)}
                placeholder="Consider: panic-selling during a downturn, waiting for the 'perfect time' to invest, chasing hot stocks..."
                className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-2">
                2. What's ONE specific action you'll take to stay invested during the next market downturn?
              </label>
              <textarea
                value={reflection2}
                onChange={(e) => setReflection2(e.target.value)}
                placeholder="Consider: automating contributions, avoiding daily news, writing down your plan, remembering history..."
                className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent resize-none text-sm"
              />
            </div>

            {(reflection1.length > 20 && reflection2.length > 20) && !showInsights && (
              <button
                onClick={() => setShowInsights(true)}
                className="w-full py-3 bg-violet-100 text-violet-700 rounded-xl font-bold hover:bg-violet-200 transition-all"
              >
                See Key Takeaways
              </button>
            )}

            {showInsights && (
              <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-2xl p-5 border border-violet-200 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-bold text-slate-900 mb-3">🎓 Module 7 Key Takeaways</h4>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Missing the best days destroys returns.</strong> You can't predict when they'll happen, so stay invested through everything.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Market timing requires being right twice.</strong> You need to know when to sell AND when to buy back. The odds are against you.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Volatility ≠ Permanent Loss.</strong> Markets go up and down. Only panic-selling turns temporary swings into actual losses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>History always recovers.</strong> Every crash, bear market, and crisis has been followed by recovery to new all-time highs. Stay patient.</span>
                  </li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setView("complete")}
              disabled={reflection1.length < 10 || reflection2.length < 10}
              className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              Complete Module 7
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 5: COMPLETE
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-2">You Did It!</h2>
          <p className="text-slate-500 mb-6">Module 7: Time IN the Market Complete</p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">🏆 You've Mastered:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Why staying invested beats timing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                The cost of missing best days
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                How to overcome emotional investing
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Market Cycle Neutrality mindset
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>💡 Remember:</strong> The stock market is the only place where things go on sale and people run away scared. When markets drop, you're getting stocks at a discount. Stay invested!
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => onComplete()} 
              className="w-full py-5 bg-gradient-to-r from-violet-600 to-sky-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              Finish Module 7
            </button>
            <button 
              onClick={() => {
                setView("intro");
                setReflection1("");
                setReflection2("");
                setShowInsights(false);
              }} 
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Review Again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}