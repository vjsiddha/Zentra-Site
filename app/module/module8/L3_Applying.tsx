"use client";

import { useState, useMemo } from "react";

// Helper to calculate compound growth
const calculateGrowth = (initial: number, monthly: number, years: number, annualReturn: number, fee: number) => {
  const effectiveReturn = (annualReturn - fee) / 100 / 12;
  let balance = initial;
  const yearlyData: { year: number; balance: number }[] = [{ year: 0, balance: initial }];
  
  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + effectiveReturn) + monthly;
    if (month % 12 === 0) {
      yearlyData.push({ year: month / 12, balance: Math.round(balance) });
    }
  }
  
  return { finalBalance: Math.round(balance), yearlyData };
};

// Calculate early vs late start comparison
const calculateEarlyVsLate = (monthlyAmount: number, earlyStartAge: number, lateStartAge: number, retirementAge: number, annualReturn: number) => {
  const earlyYears = retirementAge - earlyStartAge;
  const lateYears = retirementAge - lateStartAge;
  
  const earlyResult = calculateGrowth(0, monthlyAmount, earlyYears, annualReturn, 0.05);
  const lateResult = calculateGrowth(0, monthlyAmount, lateYears, annualReturn, 0.05);
  
  const earlyContributed = monthlyAmount * 12 * earlyYears;
  const lateContributed = monthlyAmount * 12 * lateYears;
  
  return {
    early: {
      startAge: earlyStartAge,
      years: earlyYears,
      contributed: earlyContributed,
      finalBalance: earlyResult.finalBalance,
      earnings: earlyResult.finalBalance - earlyContributed,
      yearlyData: earlyResult.yearlyData
    },
    late: {
      startAge: lateStartAge,
      years: lateYears,
      contributed: lateContributed,
      finalBalance: lateResult.finalBalance,
      earnings: lateResult.finalBalance - lateContributed,
      yearlyData: lateResult.yearlyData
    }
  };
};

export default function L3_Applying({ onComplete, onBack }: { onComplete: (score: number) => void; onBack?: () => void }) {
  const [view, setView] = useState<"intro" | "fee-calculator" | "time-matters" | "reflection" | "complete">("intro");
  
  // Fee calculator state
  const [initialInvestment, setInitialInvestment] = useState(15000);
  const [yearsInvested, setYearsInvested] = useState(30);
  const [activeFee, setActiveFee] = useState(1.5);
  const [passiveFee, setPassiveFee] = useState(0.15);
  
  // Time matters state
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [earlyStartAge, setEarlyStartAge] = useState(20);
  const [lateStartAge, setLateStartAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  
  // Reflection state
  const [reflection1, setReflection1] = useState("");
  const [reflection2, setReflection2] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  // Calculate fee comparison results
  const feeComparison = useMemo(() => {
    const activeResult = calculateGrowth(initialInvestment, 0, yearsInvested, 7, activeFee);
    const passiveResult = calculateGrowth(initialInvestment, 0, yearsInvested, 7, passiveFee);
    return {
      active: activeResult.finalBalance,
      passive: passiveResult.finalBalance,
      difference: passiveResult.finalBalance - activeResult.finalBalance,
      feeDifferencePercent: (activeFee - passiveFee).toFixed(2)
    };
  }, [initialInvestment, yearsInvested, activeFee, passiveFee]);

  // Calculate time comparison results
  const timeComparison = useMemo(() => {
    return calculateEarlyVsLate(monthlyContribution, earlyStartAge, lateStartAge, retirementAge, 7);
  }, [monthlyContribution, earlyStartAge, lateStartAge, retirementAge]);

  // Back navigation
  const handleBack = () => {
    if (view === "intro") {
      onBack?.();
    } else if (view === "fee-calculator") {
      setView("intro");
    } else if (view === "time-matters") {
      setView("fee-calculator");
    } else if (view === "reflection") {
      setView("time-matters");
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

  // Simple line chart component
  const GrowthChart = ({ earlyData, lateData, maxYears }: { earlyData: { year: number; balance: number }[]; lateData: { year: number; balance: number }[]; maxYears: number }) => {
    const maxBalance = Math.max(
      ...earlyData.map(d => d.balance),
      ...lateData.map(d => d.balance)
    );
    
    const chartHeight = 200;
    const chartWidth = 400;
    const padding = 40;
    
    const scaleX = (year: number) => padding + (year / maxYears) * (chartWidth - padding * 2);
    const scaleY = (balance: number) => chartHeight - padding - (balance / maxBalance) * (chartHeight - padding * 2);
    
    const earlyPath = earlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.year)} ${scaleY(d.balance)}`).join(' ');
    const latePath = lateData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(d.year + (earlyData[0]?.year || 0) + (lateStartAge - earlyStartAge))} ${scaleY(d.balance)}`).join(' ');
    
    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={padding}
            y1={chartHeight - padding - pct * (chartHeight - padding * 2)}
            x2={chartWidth - padding}
            y2={chartHeight - padding - pct * (chartHeight - padding * 2)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Early start line */}
        <path d={earlyPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        
        {/* Late start line */}
        <path d={latePath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5" />
        
        {/* Legend */}
        <circle cx={chartWidth - 120} cy={20} r={5} fill="#10b981" />
        <text x={chartWidth - 110} y={24} fontSize="10" fill="#374151">Early Start</text>
        
        <circle cx={chartWidth - 120} cy={38} r={5} fill="#6366f1" />
        <text x={chartWidth - 110} y={42} fontSize="10" fill="#374151">Late Start</text>
        
        {/* Axis labels */}
        <text x={chartWidth / 2} y={chartHeight - 5} fontSize="10" fill="#6b7280" textAnchor="middle">Years</text>
        <text x={10} y={chartHeight / 2} fontSize="10" fill="#6b7280" transform={`rotate(-90, 10, ${chartHeight / 2})`} textAnchor="middle">Balance</text>
      </svg>
    );
  };

  // VIEW 1: INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        {showBackButton && <BackButton />}
        <div className="w-full text-center mb-8">
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 3: Reflect</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Reflect & Apply</h1>
          <p className="text-[#4F7D96] mt-2">See the long-term impact of your investment choices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">💸</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Small Percentages, Big Consequences</h3>
            <p className="text-sm text-[#4F7D96]">
              Use our interactive calculator to see how "small" fee differences compound into massive dollar amounts over your investing lifetime.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Why Time Matters as Much as Strategy</h3>
            <p className="text-sm text-[#4F7D96]">
              Discover why starting early can be more powerful than any investment strategy. Compare early vs late starters side by side.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-rose-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 Module 8 Key Questions:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Was paying for active management worth it?</li>
            <li>• How much do fees really cost over a lifetime?</li>
            <li>• What's more important: the perfect strategy or starting early?</li>
          </ul>
        </div>

        <button 
          onClick={() => setView("fee-calculator")} 
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Exploring
        </button>
      </div>
    );
  }

  // VIEW 2: FEE CALCULATOR
  if (view === "fee-calculator") {
    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Small percentages. Big Consequences</h2>
            <p className="text-slate-500 mt-1">Interactive Fee Calculator</p>
          </header>

          <div className="bg-[#1a2b3c] rounded-3xl p-8 text-white">
            <p className="text-slate-300 mb-6">
              Fees might seem small, but they compound just like your returns. Let's see the real impact:
            </p>

            {/* Input controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Initial Investment</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
                    className="w-full bg-[#2a3b4c] border-0 rounded-xl py-4 pl-8 pr-4 text-white text-lg font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Years Invested</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    value={yearsInvested}
                    onChange={(e) => setYearsInvested(Number(e.target.value) || 1)}
                    className="w-full bg-[#2a3b4c] border-0 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-semibold focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={yearsInvested}
                  onChange={(e) => setYearsInvested(Number(e.target.value))}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>
            </div>

            {/* Results comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#3d2a2a] rounded-2xl p-5">
                <p className="text-rose-300 text-sm font-medium mb-1">Active Fund ({activeFee}% fee)</p>
                <p className="text-3xl font-black text-white">${feeComparison.active.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-1">Final balance after {yearsInvested} years</p>
              </div>
              
              <div className="bg-[#2a3d3d] rounded-2xl p-5">
                <p className="text-emerald-300 text-sm font-medium mb-1">Passive Fund ({passiveFee}% fee)</p>
                <p className="text-3xl font-black text-white">${feeComparison.passive.toLocaleString()}</p>
                <p className="text-slate-400 text-sm mt-1">Final balance after {yearsInvested} years</p>
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
                  Fees compound over time. That extra {feeComparison.feeDifferencePercent}% you're paying means less money growing for YOU. Over {yearsInvested} years, this can cost you <span className="text-amber-400 font-bold">${feeComparison.difference.toLocaleString()}</span> - money that could've been yours! 💰
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("time-matters")}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              Continue: Why Time Matters
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: TIME MATTERS
  if (view === "time-matters") {
    const advantageAmount = timeComparison.early.finalBalance - timeComparison.late.finalBalance;
    const extraYears = lateStartAge - earlyStartAge;
    
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}
        
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Why Time Matters as much than Strategy</h2>
            <p className="text-slate-500 mt-1">Successful investing relies on giving it enough duration to grow.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Key concepts */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 text-lg">🌱</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Start Early</h3>
                    <p className="text-sm text-slate-600">
                      The cost of waiting is higher than you think. Starting at {earlyStartAge} vs {lateStartAge} can result in <span className="font-bold text-emerald-600">${advantageAmount.toLocaleString()}</span> more wealth with less effort.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-rose-600 text-lg">📈</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Compounding</h3>
                    <p className="text-sm text-slate-600">
                      Earnings on your earnings. This mathematical snowball effect creates exponential growth over decades. The early starter's money has {extraYears} extra years to compound!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 text-lg">🔄</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Consistency</h3>
                    <p className="text-sm text-slate-600">
                      Small, automated contributions often outperform larger, irregular "timing of the market" attempts. ${monthlyContribution}/month adds up!
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-slate-50 rounded-2xl p-5">
                <h4 className="font-bold text-slate-900 mb-4">Adjust the comparison:</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-600">Monthly contribution: ${monthlyContribution}</label>
                    <input
                      type="range"
                      min="100"
                      max="2000"
                      step="50"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      className="w-full accent-[#0B5E8E]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-600">Early start age: {earlyStartAge}</label>
                      <input
                        type="range"
                        min="18"
                        max="30"
                        value={earlyStartAge}
                        onChange={(e) => setEarlyStartAge(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Late start age: {lateStartAge}</label>
                      <input
                        type="range"
                        min="25"
                        max="45"
                        value={lateStartAge}
                        onChange={(e) => setLateStartAge(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Chart and comparison */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4">Growth Comparison Case Study</h3>
                <p className="text-xs text-slate-500 mb-4">Analysis of ${monthlyContribution}/month investment starting at different ages (7% annual return)</p>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <GrowthChart 
                    earlyData={timeComparison.early.yearlyData} 
                    lateData={timeComparison.late.yearlyData}
                    maxYears={retirementAge - earlyStartAge}
                  />
                </div>

                {/* Comparison cards */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-xs font-bold text-emerald-700">Subject A: Early Start</span>
                    </div>
                    <p className="text-xs text-slate-600">Age {earlyStartAge}-{retirementAge} • ${timeComparison.early.contributed.toLocaleString()} contributed</p>
                    <p className="text-lg font-black text-emerald-700 mt-1">${timeComparison.early.finalBalance.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600">Benefit of {retirementAge - earlyStartAge} years of compound interest</p>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="text-xs font-bold text-indigo-700">Subject B: Delayed Start</span>
                    </div>
                    <p className="text-xs text-slate-600">Age {lateStartAge}-{retirementAge} • ${timeComparison.late.contributed.toLocaleString()} contributed</p>
                    <p className="text-lg font-black text-indigo-700 mt-1">${timeComparison.late.finalBalance.toLocaleString()}</p>
                    <p className="text-xs text-indigo-600">Lost start reduced growth by ${advantageAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Key insight */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>🎯 Key Insight:</strong> The early starter contributed only ${(timeComparison.early.contributed - timeComparison.late.contributed).toLocaleString()} more, but ended up with <strong>${advantageAmount.toLocaleString()}</strong> more! That's the magic of compound interest over time.
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
            <h2 className="text-2xl font-bold text-slate-900">Was Paying for Active Worth It?</h2>
            <p className="text-slate-500 mt-1">Let's think about what you've learned</p>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6">
            {/* Summary stats */}
            <div className="bg-slate-50 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 mb-3">📊 What You Discovered</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Fee difference cost</p>
                  <p className="font-bold text-rose-600">${feeComparison.difference.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Early start advantage</p>
                  <p className="font-bold text-emerald-600">${(timeComparison.early.finalBalance - timeComparison.late.finalBalance).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Reflection questions */}
            <div>
              <label className="block font-bold text-slate-900 mb-2">
                1. Based on what you've seen, when would paying higher fees for active management be worth it?
              </label>
              <textarea
                value={reflection1}
                onChange={(e) => setReflection1(e.target.value)}
                placeholder="Think about the scenarios from Lesson 2... What would an active fund need to achieve?"
                className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-2">
                2. What's ONE thing you'll do differently with your money after this module?
              </label>
              <textarea
                value={reflection2}
                onChange={(e) => setReflection2(e.target.value)}
                placeholder="Consider: starting earlier, checking MER fees, choosing index funds..."
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
                <h4 className="font-bold text-slate-900 mb-3">🎓 Module 8 Key Takeaways</h4>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>92% of active funds underperform</strong> their benchmark over 15 years. The odds are against active management.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Fees compound against you.</strong> A "small" 1.5% difference can cost hundreds of thousands over your lifetime.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Time beats timing.</strong> Starting 10 years earlier often matters more than finding the "perfect" investment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span><strong>Keep it simple.</strong> Low-cost index funds + early start + consistency = wealth building formula.</span>
                  </li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setView("complete")}
              disabled={reflection1.length < 10 || reflection2.length < 10}
              className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              Complete Module 8
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
          <p className="text-slate-500 mb-6">Module 8: Passive vs Active Investing Complete</p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">🏆 You've Mastered:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Index Funds vs Mutual Funds
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                MER and Fee Impact
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                When to Use Active vs Passive
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                The Power of Time & Compounding
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>💡 Remember:</strong> The best time to start investing was yesterday. The second best time is today. Keep your fees low, stay consistent, and let time do the heavy lifting!
            </p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={() => onComplete(100)} 
              className="w-full py-5 bg-gradient-to-r from-violet-600 to-sky-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              Finish Module 8
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