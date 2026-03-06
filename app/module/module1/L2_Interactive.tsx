"use client";

import { useState, useEffect } from "react";
import Lottie from "lottie-react";

import walletAnim from "@/public/lottie/wallet.json";
import chartAnim from "@/public/lottie/chart.json";
import lightningAnim from "@/public/lottie/lightning.json";
import targetAnim from "@/public/lottie/target.json";
import lightbulbAnim from "@/public/lottie/lightbulb.json";

interface L2Props {
  onComplete: (score: number) => void;
  onBack?: () => void;
}

// Smart suggestions based on budget choices
const getSmartNudges = (budget: BudgetState): string[] => {
  const nudges: string[] = [];
  const totalIncome = 1800;
  const savingsRate = ((budget.savings + budget.investing) / totalIncome) * 100;

  if (budget.rent > 600) {
    nudges.push("💡 Your rent is over 33% of income. Consider a roommate or cheaper area to boost savings!");
  }
  if (budget.savings < 180) {
    nudges.push("⚠️ Aim for at least 10% savings ($180) to build your emergency fund faster.");
  }
  if (budget.investing === 0) {
    nudges.push("📈 Even $50/month invested now could grow to $15,000+ in 10 years!");
  }
  if (budget.fun > 300) {
    nudges.push("🎮 Fun money over $300? You might regret this when emergencies hit!");
  }
  if (savingsRate >= 20) {
    nudges.push("🌟 Great job! You're saving 20%+ of your income - that's financial freedom territory!");
  }
  if (budget.groceries < 150) {
    nudges.push("🍎 $150 or less for groceries is tight. Make sure you're eating healthy!");
  }

  return nudges.slice(0, 3);
};

// Calculate scores
const calculateScores = (budget: BudgetState, stressTestResults: StressTestResults) => {
  const totalIncome = 1800;
  const totalAllocated = budget.rent + budget.groceries + budget.fun + budget.savings + budget.investing;
  const savingsTotal = budget.savings + budget.investing;
  
  const needsPercent = ((budget.rent + budget.groceries) / totalIncome) * 100;
  const wantsPercent = (budget.fun / totalIncome) * 100;
  const savingsPercent = (savingsTotal / totalIncome) * 100;
  
  // Budget Stability Score
  let stabilityScore = 100;
  if (needsPercent > 50) stabilityScore -= (needsPercent - 50) * 2;
  if (wantsPercent > 30) stabilityScore -= (wantsPercent - 30) * 2;
  if (budget.rent > 600) stabilityScore -= 10;
  if (totalAllocated !== totalIncome) stabilityScore -= 20;
  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  // Savings Rate Score
  const savingsRateScore = Math.min(100, savingsPercent * 5);
  
  // Cash Flow Score
  const cashFlowScore = totalAllocated === totalIncome ? 100 : Math.max(0, 100 - Math.abs(totalIncome - totalAllocated));

  // Stress Test Score (how well they handled emergencies)
  let stressScore = 100;
  stressScore -= stressTestResults.creditCardUsed * 15; // Penalty for using credit
  stressScore -= stressTestResults.skippedEvents * 5; // Small penalty for skipping
  stressScore += stressTestResults.savingsUsed * 5; // Reward for using savings properly
  stressScore = Math.max(0, Math.min(100, stressScore));

  const overallScore = Math.round((stabilityScore * 0.25) + (savingsRateScore * 0.25) + (cashFlowScore * 0.2) + (stressScore * 0.3));

  return {
    stability: Math.round(stabilityScore),
    savingsRate: Math.round(savingsRateScore),
    cashFlow: Math.round(cashFlowScore),
    stressTest: Math.round(stressScore),
    overall: overallScore,
    passed: overallScore >= 60
  };
};

interface BudgetState {
  rent: number;
  groceries: number;
  fun: number;
  savings: number;
  investing: number;
}

interface StressTestResults {
  savingsUsed: number;
  funCut: number;
  creditCardUsed: number;
  skippedEvents: number;
  totalDebt: number;
  remainingSavings: number;
  remainingFun: number;
}

interface UnexpectedEvent {
  id: string;
  title: string;
  description: string;
  cost: number;
  emoji: string;
  category: "urgent" | "important" | "optional";
  skipConsequence?: string;
}

const UNEXPECTED_EVENTS: UnexpectedEvent[] = [
  {
    id: "car_breakdown",
    title: "Car Breakdown! 🚗",
    description: "Your car won't start. The mechanic says it needs a new alternator.",
    cost: 450,
    emoji: "🚗",
    category: "urgent",
    skipConsequence: "You can't get to work without your car!"
  },
  {
    id: "medical",
    title: "Urgent Care Visit 🏥",
    description: "You woke up with severe flu symptoms and need to see a doctor.",
    cost: 250,
    emoji: "🏥",
    category: "urgent",
    skipConsequence: "Skipping medical care could make things worse..."
  },
  {
    id: "phone_broken",
    title: "Phone Screen Cracked 📱",
    description: "You dropped your phone and the screen is completely shattered.",
    cost: 350,
    emoji: "📱",
    category: "important",
    skipConsequence: "You can manage with a cracked screen for now."
  },
  {
    id: "appliance",
    title: "Refrigerator Died 🧊",
    description: "Your fridge stopped working. All your food is spoiling!",
    cost: 500,
    emoji: "🧊",
    category: "urgent",
    skipConsequence: "You need a working fridge to store food!"
  },
  {
    id: "wedding",
    title: "Best Friend's Wedding 💒",
    description: "Your best friend just announced their wedding. You need a gift and outfit!",
    cost: 200,
    emoji: "💒",
    category: "optional",
    skipConsequence: "They'll understand if you can't spend much."
  },
  {
    id: "pet_emergency",
    title: "Pet Emergency 🐕",
    description: "Your dog ate something bad and needs to see the vet immediately.",
    cost: 400,
    emoji: "🐕",
    category: "urgent",
    skipConsequence: "Your furry friend needs help!"
  },
  {
    id: "parking_ticket",
    title: "Parking Tickets 🎫",
    description: "You found 2 parking tickets on your car. They're due this week!",
    cost: 150,
    emoji: "🎫",
    category: "important",
    skipConsequence: "Unpaid tickets double after 30 days!"
  },
  {
    id: "laptop",
    title: "Laptop Crashed 💻",
    description: "Your laptop died and you need it for work. Time for repairs or replacement.",
    cost: 300,
    emoji: "💻",
    category: "important",
    skipConsequence: "You might be able to use your phone temporarily..."
  },
];

export default function L2_Interactive({ onComplete, onBack }: L2Props) {
  const [view, setView] = useState<"intro" | "payday" | "allocate" | "review" | "stress_intro" | "stress_test" | "stress_results" | "results">("intro");
  const [bankBalance, setBankBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [budget, setBudget] = useState<BudgetState>({
    rent: 800,
    groceries: 200,
    fun: 150,
    savings: 250,
    investing: 100
  });

  // Stress Test State
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [stressEvents, setStressEvents] = useState<UnexpectedEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [remainingSavings, setRemainingSavings] = useState(0);
  const [remainingFun, setRemainingFun] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [stressTestResults, setStressTestResults] = useState<StressTestResults>({
    savingsUsed: 0,
    funCut: 0,
    creditCardUsed: 0,
    skippedEvents: 0,
    totalDebt: 0,
    remainingSavings: 0,
    remainingFun: 0
  });
  const [eventHistory, setEventHistory] = useState<{event: UnexpectedEvent, choice: string}[]>([]);
  const [showConsequence, setShowConsequence] = useState(false);
  const [lastChoice, setLastChoice] = useState<string | null>(null);

  const totalAllocated = budget.rent + budget.groceries + budget.fun + budget.savings + budget.investing;
  const remaining = 1800 - totalAllocated;
  const isBalanced = remaining === 0;

  const emergencyFundMonths = budget.savings > 0 ? ((budget.savings * 6) / (budget.rent + budget.groceries)).toFixed(1) : "0";
  const sixMonthSavings = (budget.savings + budget.investing) * 6;
  const yearProjection = (budget.investing * 12 * 1.07).toFixed(0);

  const nudges = getSmartNudges(budget);
  const scores = calculateScores(budget, stressTestResults);

  // Initialize stress test
  const initializeStressTest = () => {
    // Pick 4 random events
    const shuffled = [...UNEXPECTED_EVENTS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    setStressEvents(selected);
    setCurrentEventIndex(0);
    setCurrentMonth(1);
    setRemainingSavings(budget.savings);
    setRemainingFun(budget.fun);
    setTotalDebt(0);
    setEventHistory([]);
    setStressTestResults({
      savingsUsed: 0,
      funCut: 0,
      creditCardUsed: 0,
      skippedEvents: 0,
      totalDebt: 0,
      remainingSavings: budget.savings,
      remainingFun: budget.fun
    });
    setView("stress_intro");
  };

  // Handle stress test choice
  const handleStressChoice = (choice: "savings" | "fun" | "credit" | "skip") => {
    const event = stressEvents[currentEventIndex];
    setLastChoice(choice);
    
    let newResults = { ...stressTestResults };
    
    if (choice === "savings") {
      const newSavings = Math.max(0, remainingSavings - event.cost);
      setRemainingSavings(newSavings);
      newResults.savingsUsed += 1;
      newResults.remainingSavings = newSavings;
    } else if (choice === "fun") {
      const newFun = Math.max(0, remainingFun - event.cost);
      setRemainingFun(newFun);
      newResults.funCut += 1;
      newResults.remainingFun = newFun;
    } else if (choice === "credit") {
      const newDebt = totalDebt + event.cost + (event.cost * 0.20); // 20% interest
      setTotalDebt(newDebt);
      newResults.creditCardUsed += 1;
      newResults.totalDebt = newDebt;
    } else if (choice === "skip") {
      newResults.skippedEvents += 1;
    }

    setStressTestResults(newResults);
    setEventHistory([...eventHistory, { event, choice }]);
    setShowConsequence(true);
  };

  // Move to next event
  const nextEvent = () => {
    setShowConsequence(false);
    setLastChoice(null);
    
    if (currentEventIndex < stressEvents.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1);
      setCurrentMonth(currentMonth + 1);
    } else {
      // Stress test complete
      setView("stress_results");
    }
  };

  // Back navigation handler
  const handleBack = () => {
    if (view === "payday") setView("intro");
    else if (view === "allocate") setView("payday");
    else if (view === "review") setView("allocate");
    else if (view === "stress_intro") setView("review");
    else if (view === "stress_test") setView("stress_intro");
    else if (view === "intro" && onBack) onBack();
  };

  const showBackButton = !["results", "stress_results"].includes(view);

  const handlePayday = () => {
    setIsAnimating(true);
    let current = 0;
    const target = 1800;
    const increment = 50;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(interval);
        setTimeout(() => {
          setIsAnimating(false);
          setView("allocate");
        }, 500);
      }
      setBankBalance(current);
    }, 30);
  };

  const updateBudget = (key: keyof BudgetState, value: number) => {
    setBudget(prev => ({ ...prev, [key]: value }));
  };

  const handleRedo = () => {
    setView("intro");
    setBankBalance(0);
    setBudget({
      rent: 800,
      groceries: 200,
      fun: 150,
      savings: 250,
      investing: 100
    });
    setStressTestResults({
      savingsUsed: 0,
      funCut: 0,
      creditCardUsed: 0,
      skippedEvents: 0,
      totalDebt: 0,
      remainingSavings: 0,
      remainingFun: 0
    });
  };

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
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-full text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-full mb-4">
              <span className="text-sm font-bold uppercase tracking-widest">Lesson 2</span>
            </div>
            <h1 className="text-[32px] font-bold text-[#0D171C] leading-tight">Build Your First Budget</h1>
            <p className="mt-3 text-[#4F7D96] text-lg max-w-2xl mx-auto">
              Time to put your knowledge into practice! You'll build a budget and then 
              face the <strong>Budget Stress Test</strong> to see if it survives real life!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 w-full">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="mb-3 w-12 h-12 mx-auto">
              <Lottie animationData={walletAnim} loop />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Get Paid</h3>
              <p className="text-xs text-[#4F7D96] mt-1">$1,800 paycheck</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="mb-3 w-12 h-12 mx-auto">
              <Lottie animationData={chartAnim} loop />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Allocate</h3>
              <p className="text-xs text-[#4F7D96] mt-1">Budget your money</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="mb-3 w-12 h-12 mx-auto">
              <Lottie animationData={lightningAnim} loop />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Stress Test</h3>
              <p className="text-xs text-[#4F7D96] mt-1">Face the unexpected</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 text-center">
              <div className="mb-3 w-12 h-12 mx-auto">
              <Lottie animationData={targetAnim} loop />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Score</h3>
              <p className="text-xs text-[#4F7D96] mt-1">60%+ to pass</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 max-w-2xl w-full">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8">
              <Lottie animationData={lightbulbAnim} loop />
            </div>
            <h3 className="font-bold text-amber-800">
              Remember the 50/30/20 Rule!
            </h3>
          </div>
            <ul className="text-amber-700 text-sm space-y-1">
              <li>• <strong>50%</strong> for Needs (rent, groceries) = $900</li>
              <li>• <strong>30%</strong> for Wants (fun, entertainment) = $540</li>
              <li>• <strong>20%</strong> for Savings & Investing = $360</li>
            </ul>
          </div>

          <button 
            onClick={() => setView("payday")} 
            className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold text-lg shadow-lg hover:bg-[#094a72] transition-all"
          >
            Let's Get Started →
          </button>
        </div>
      </div>
    );
  }

  // VIEW 2: PAYDAY ANIMATION
  if (view === "payday") {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <div className="max-w-2xl mx-auto px-4 py-16 animate-in zoom-in">
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 text-center">
            <div className="text-6xl mb-6">{isAnimating ? "💸" : "🏦"}</div>
            <h2 className="text-2xl font-black text-[#0D171C] mb-2">Your Bank Account</h2>
            <p className="text-slate-500 mb-8">Watch your first paycheck come in!</p>
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-8 mb-8 text-white">
              <p className="text-sm opacity-70 mb-2">Available Balance</p>
              <p className={`text-5xl font-black transition-all ${isAnimating ? 'text-emerald-400 scale-110' : ''}`}>
                ${bankBalance.toLocaleString()}
              </p>
              {bankBalance === 1800 && (
                <p className="text-emerald-400 mt-4 animate-in fade-in">✓ Paycheck deposited!</p>
              )}
            </div>

            {bankBalance === 0 ? (
              <button
                onClick={handlePayday}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all animate-pulse"
              >
                💰 Deposit Paycheck
              </button>
            ) : bankBalance === 1800 && !isAnimating ? (
              <button
                onClick={() => setView("allocate")}
                className="w-full py-5 bg-[#0B5E8E] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#094a72] transition-all"
              >
                Now Let's Budget! →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // VIEW 3: BUDGET ALLOCATION
  if (view === "allocate") {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <div className="max-w-5xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-[#0D171C]">Allocate Your $1,800</h2>
            <p className="text-[#4F7D96] mt-2">Drag the sliders to build your monthly budget</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT: Budget Sliders */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-lg border border-slate-100">
              {/* Balance Tracker */}
              <div className={`flex justify-between items-center mb-6 p-4 rounded-xl ${
                remaining === 0 ? 'bg-emerald-50 border border-emerald-200' : 
                remaining < 0 ? 'bg-red-50 border border-red-200' : 
                'bg-amber-50 border border-amber-200'
              }`}>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Remaining</p>
                  <p className={`text-2xl font-black ${
                    remaining === 0 ? 'text-emerald-600' : 
                    remaining < 0 ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    ${remaining}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
                  <p className={`font-bold ${
                    remaining === 0 ? 'text-emerald-600' : 
                    remaining < 0 ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {remaining === 0 ? "✓ Balanced!" : remaining < 0 ? "Over budget!" : "Allocate more"}
                  </p>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-5">
                {[
                  { key: "rent" as keyof BudgetState, label: "🏠 Rent", recommended: "$600-800" },
                  { key: "groceries" as keyof BudgetState, label: "🛒 Groceries", recommended: "$150-250" },
                  { key: "fun" as keyof BudgetState, label: "🎮 Fun & Entertainment", recommended: "$100-200" },
                  { key: "savings" as keyof BudgetState, label: "🐷 Emergency Savings", recommended: "$180-360", highlight: true },
                  { key: "investing" as keyof BudgetState, label: "📈 Investing", recommended: "$50-200" },
                ].map((item) => (
                  <div key={item.key} className={item.highlight ? "p-3 bg-emerald-50 rounded-xl border border-emerald-100" : ""}>
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-slate-700">{item.label}</span>
                      <span className="font-black text-slate-900 text-lg">${budget[item.key]}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1200" 
                      step="10"
                      value={budget[item.key]} 
                      onChange={(e) => updateBudget(item.key, parseInt(e.target.value))}
                      className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-[10px] text-slate-400">Recommended: {item.recommended}</p>
                      <p className="text-[10px] text-slate-400">{((budget[item.key] / 1800) * 100).toFixed(0)}% of income</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                disabled={!isBalanced}
                onClick={() => setView("review")}
                className="w-full mt-6 py-4 bg-[#0D171C] text-white rounded-xl font-bold text-lg disabled:opacity-30 transition-all hover:scale-[1.01] active:scale-95"
              >
                {isBalanced ? "Review My Budget →" : `Allocate $${Math.abs(remaining)} more`}
              </button>
            </div>

            {/* RIGHT: Impact Dashboard */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-[20px] shadow-lg border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  📊 Impact Dashboard
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-600 uppercase">Emergency Fund Coverage</p>
                    <p className="text-2xl font-black text-emerald-700">{emergencyFundMonths} months</p>
                    <p className="text-xs text-emerald-600 mt-1">After 6 months of saving</p>
                  </div>

                  <div className="bg-sky-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-sky-600 uppercase">6-Month Savings</p>
                    <p className="text-2xl font-black text-sky-700">${sixMonthSavings.toLocaleString()}</p>
                    <p className="text-xs text-sky-600 mt-1">Combined savings + investing</p>
                  </div>

                  <div className="bg-violet-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-violet-600 uppercase">1-Year Investment Growth</p>
                    <p className="text-2xl font-black text-violet-700">${yearProjection}</p>
                    <p className="text-xs text-violet-600 mt-1">Estimated at 7% return</p>
                  </div>
                </div>
              </div>

              {nudges.length > 0 && (
                <div className="bg-amber-50 p-5 rounded-[20px] border border-amber-100">
                  <h3 className="font-bold text-amber-800 mb-3">💡 Smart Suggestions</h3>
                  <div className="space-y-2">
                    {nudges.map((nudge, i) => (
                      <p key={i} className="text-sm text-amber-700 leading-relaxed">{nudge}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning about stress test */}
              <div className="bg-red-50 p-5 rounded-[20px] border border-red-100">
                <h3 className="font-bold text-red-800 mb-2">⚡ Stress Test Coming!</h3>
                <p className="text-sm text-red-700">Your emergency savings will be tested. Make sure you've budgeted enough!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 4: REVIEW
  if (view === "review") {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <div className="max-w-3xl mx-auto px-4 py-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-[#0D171C]">Your Budget Summary</h2>
              <p className="text-[#4F7D96] mt-2">Review before the Stress Test!</p>
            </div>

            {/* Budget Breakdown Visual */}
            <div className="mb-8">
              <div className="h-8 rounded-full overflow-hidden flex">
                <div className="bg-sky-500 h-full transition-all" style={{ width: `${(budget.rent / 1800) * 100}%` }} />
                <div className="bg-orange-500 h-full transition-all" style={{ width: `${(budget.groceries / 1800) * 100}%` }} />
                <div className="bg-pink-500 h-full transition-all" style={{ width: `${(budget.fun / 1800) * 100}%` }} />
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(budget.savings / 1800) * 100}%` }} />
                <div className="bg-violet-500 h-full transition-all" style={{ width: `${(budget.investing / 1800) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>$0</span>
                <span>$1,800</span>
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-5 gap-3 mb-8">
              {[
                { label: "Rent", value: budget.rent, color: "bg-sky-50", icon: "🏠" },
                { label: "Groceries", value: budget.groceries, color: "bg-orange-50", icon: "🛒" },
                { label: "Fun", value: budget.fun, color: "bg-pink-50", icon: "🎮" },
                { label: "Savings", value: budget.savings, color: "bg-emerald-50", icon: "🐷" },
                { label: "Investing", value: budget.investing, color: "bg-violet-50", icon: "📈" },
              ].map((item) => (
                <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="font-black text-slate-800">${item.value}</p>
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Emergency Fund Warning */}
            <div className={`p-4 rounded-xl mb-6 ${budget.savings >= 300 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`font-semibold ${budget.savings >= 300 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {budget.savings >= 300 
                  ? `✓ Good! Your $${budget.savings} emergency fund should help with surprises.`
                  : `⚠️ Warning: Only $${budget.savings} in savings. You might struggle in the stress test!`
                }
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setView("allocate")}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                ← Adjust Budget
              </button>
              <button
                onClick={initializeStressTest}
                className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                ⚡ Start Stress Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 5: STRESS TEST INTRO
  if (view === "stress_intro") {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <BackButton />
        <div className="max-w-2xl mx-auto px-4 py-16 animate-in zoom-in">
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-slate-100 text-center">
            <div className="text-6xl mb-6">⚡</div>
            <h2 className="text-3xl font-black text-[#0D171C] mb-4">Budget Stress Test</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Life is full of surprises! Over the next 4 months, you'll face unexpected expenses.
              How will you handle them with your current budget?
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 uppercase font-bold">Your Emergency Fund</p>
                <p className="text-2xl font-black text-emerald-700">${budget.savings}</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <p className="text-xs text-pink-600 uppercase font-bold">Your Fun Budget</p>
                <p className="text-2xl font-black text-pink-700">${budget.fun}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left">
              <p className="font-bold text-slate-800 mb-2">For each surprise, you can:</p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>🐷 <strong>Use Savings</strong> - That's what it's for!</li>
                <li>🎮 <strong>Cut from Fun</strong> - Sacrifice entertainment</li>
                <li>💳 <strong>Credit Card</strong> - Adds 20% interest debt!</li>
                <li>⏭️ <strong>Skip/Delay</strong> - May have consequences</li>
              </ul>
            </div>

            <button
              onClick={() => setView("stress_test")}
              className="w-full py-5 bg-red-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-red-600 transition-all"
            >
              Begin the Test! →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 6: STRESS TEST GAME
  if (view === "stress_test" && stressEvents.length > 0) {
    const currentEvent = stressEvents[currentEventIndex];
    const canUseSavings = remainingSavings >= currentEvent.cost;
    const canUseFun = remainingFun >= currentEvent.cost;

    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="max-w-2xl mx-auto px-4 py-10">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-slate-700">Month {currentMonth} of 4</span>
              <span className="text-slate-500">{currentEventIndex + 1}/{stressEvents.length} events</span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 transition-all duration-500" 
                style={{ width: `${((currentEventIndex + 1) / stressEvents.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-emerald-600 uppercase font-bold">Savings Left</p>
              <p className="text-xl font-black text-emerald-700">${remainingSavings}</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-pink-600 uppercase font-bold">Fun Left</p>
              <p className="text-xl font-black text-pink-700">${remainingFun}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-red-600 uppercase font-bold">Debt</p>
              <p className="text-xl font-black text-red-700">${Math.round(totalDebt)}</p>
            </div>
          </div>

          {/* Event Card */}
          <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100 animate-in zoom-in">
            {!showConsequence ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{currentEvent.emoji}</div>
                  <h2 className="text-2xl font-black text-slate-900">{currentEvent.title}</h2>
                  <p className="text-slate-600 mt-2">{currentEvent.description}</p>
                  <div className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full">
                    <span className="font-black text-xl">${currentEvent.cost}</span>
                  </div>
                </div>

                {/* Choice Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleStressChoice("savings")}
                    disabled={!canUseSavings}
                    className={`w-full py-4 rounded-xl font-bold text-left px-4 flex justify-between items-center transition-all ${
                      canUseSavings 
                        ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:border-emerald-400' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>🐷 Use Emergency Savings</span>
                    <span className="text-sm">{canUseSavings ? `-$${currentEvent.cost}` : 'Not enough!'}</span>
                  </button>

                  <button
                    onClick={() => handleStressChoice("fun")}
                    disabled={!canUseFun}
                    className={`w-full py-4 rounded-xl font-bold text-left px-4 flex justify-between items-center transition-all ${
                      canUseFun 
                        ? 'bg-pink-50 border-2 border-pink-200 text-pink-700 hover:border-pink-400' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>🎮 Cut from Fun Budget</span>
                    <span className="text-sm">{canUseFun ? `-$${currentEvent.cost}` : 'Not enough!'}</span>
                  </button>

                  <button
                    onClick={() => handleStressChoice("credit")}
                    className="w-full py-4 rounded-xl font-bold text-left px-4 flex justify-between items-center bg-red-50 border-2 border-red-200 text-red-700 hover:border-red-400 transition-all"
                  >
                    <span>💳 Put on Credit Card</span>
                    <span className="text-sm text-red-500">+${Math.round(currentEvent.cost * 1.2)} with interest!</span>
                  </button>

                  {currentEvent.category !== "urgent" && (
                    <button
                      onClick={() => handleStressChoice("skip")}
                      className="w-full py-4 rounded-xl font-bold text-left px-4 flex justify-between items-center bg-slate-50 border-2 border-slate-200 text-slate-600 hover:border-slate-400 transition-all"
                    >
                      <span>⏭️ Skip / Delay</span>
                      <span className="text-sm">Deal with it later</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              // Consequence View
              <div className="text-center animate-in fade-in">
                <div className="text-5xl mb-4">
                  {lastChoice === "savings" && "✅"}
                  {lastChoice === "fun" && "😔"}
                  {lastChoice === "credit" && "⚠️"}
                  {lastChoice === "skip" && "🤷"}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {lastChoice === "savings" && "Smart Choice!"}
                  {lastChoice === "fun" && "Sacrifice Made"}
                  {lastChoice === "credit" && "Debt Added!"}
                  {lastChoice === "skip" && "Skipped"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {lastChoice === "savings" && "That's exactly what emergency savings are for. Good job being prepared!"}
                  {lastChoice === "fun" && "No fun this month, but at least you avoided debt!"}
                  {lastChoice === "credit" && `You now owe $${Math.round(currentEvent.cost * 1.2)} including 20% interest. Debt can snowball fast!`}
                  {lastChoice === "skip" && (currentEvent.skipConsequence || "You decided to deal with this later.")}
                </p>

                <button
                  onClick={nextEvent}
                  className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold hover:bg-[#094a72] transition-all"
                >
                  {currentEventIndex < stressEvents.length - 1 ? "Next Month →" : "See Results →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // VIEW 7: STRESS TEST RESULTS
  if (view === "stress_results") {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="max-w-2xl mx-auto px-4 py-10 animate-in zoom-in">
          <div className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {stressTestResults.creditCardUsed === 0 ? "🏆" : stressTestResults.creditCardUsed <= 1 ? "👍" : "😰"}
              </div>
              <h2 className="text-3xl font-black text-slate-900">Stress Test Complete!</h2>
              <p className="text-slate-600 mt-2">Here's how your budget handled real life:</p>
            </div>

            {/* Results Summary */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl">
                <span className="font-medium text-emerald-700">🐷 Times you used savings</span>
                <span className="font-bold text-emerald-800">{stressTestResults.savingsUsed}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-pink-50 rounded-xl">
                <span className="font-medium text-pink-700">🎮 Times you cut fun</span>
                <span className="font-bold text-pink-800">{stressTestResults.funCut}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                <span className="font-medium text-red-700">💳 Times you used credit</span>
                <span className="font-bold text-red-800">{stressTestResults.creditCardUsed}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                <span className="font-medium text-slate-700">⏭️ Things you skipped</span>
                <span className="font-bold text-slate-800">{stressTestResults.skippedEvents}</span>
              </div>
            </div>

            {/* Final State */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-emerald-100 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 uppercase font-bold">Savings Left</p>
                <p className="text-2xl font-black text-emerald-700">${remainingSavings}</p>
              </div>
              <div className="bg-pink-100 rounded-xl p-4 text-center">
                <p className="text-xs text-pink-600 uppercase font-bold">Fun Left</p>
                <p className="text-2xl font-black text-pink-700">${remainingFun}</p>
              </div>
              <div className="bg-red-100 rounded-xl p-4 text-center">
                <p className="text-xs text-red-600 uppercase font-bold">Total Debt</p>
                <p className="text-2xl font-black text-red-700">${Math.round(totalDebt)}</p>
              </div>
            </div>

            {/* Lesson Learned */}
            <div className={`p-4 rounded-xl mb-6 ${totalDebt === 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className={`font-semibold ${totalDebt === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {totalDebt === 0 
                  ? "🎉 Amazing! You handled all emergencies without going into debt!"
                  : `💡 Lesson learned: With $${Math.round(totalDebt)} in debt at 20% interest, you'll pay even more over time. Emergency funds prevent this!`
                }
              </p>
            </div>

            <button
              onClick={() => setView("results")}
              className="w-full py-5 bg-[#0B5E8E] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#094a72] transition-all"
            >
              See Final Score →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 8: FINAL RESULTS
  return (
    <div className="min-h-screen bg-[#F7FAFC] py-10">
      <div className="max-w-2xl mx-auto px-4 animate-in zoom-in">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="text-6xl mb-4">{scores.passed ? "🎉" : "📚"}</div>
          <h2 className="text-3xl font-black text-[#0D171C] mb-2">
            {scores.passed ? "Lesson 2 Complete!" : "Keep Learning!"}
          </h2>
          <p className="text-[#4F7D96] mb-8">
            {scores.passed 
              ? "You've proven you can budget AND handle life's surprises!" 
              : "You need 60% to unlock Lesson 3. Try building a bigger emergency fund!"}
          </p>

          {/* Overall Score */}
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 ${
            scores.passed ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            <div className="text-center">
              <p className={`text-4xl font-black ${scores.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {scores.overall}%
              </p>
              <p className="text-xs text-slate-500">Overall</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Budget Stability</p>
              <p className="text-2xl font-black text-slate-800">{scores.stability}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Savings Rate</p>
              <p className="text-2xl font-black text-slate-800">{scores.savingsRate}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Cash Flow</p>
              <p className="text-2xl font-black text-slate-800">{scores.cashFlow}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Stress Test</p>
              <p className="text-2xl font-black text-slate-800">{scores.stressTest}%</p>
            </div>
          </div>

          {/* Finance XP Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-slate-700">Finance XP</span>
              <span className="text-slate-500">{scores.overall}/100</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${scores.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${scores.overall}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {scores.passed ? "✓ Lesson 3 Unlocked!" : "Need 60% to unlock Lesson 3"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {scores.passed ? (
              <button
                onClick={() => onComplete(scores.overall)}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
              >
                Continue to Lesson 3 →
              </button>
            ) : (
              <button
                onClick={() => setView("allocate")}
                className="w-full py-5 bg-[#0B5E8E] text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-[#094a72] transition-all"
              >
                Try Again →
              </button>
            )}
            <button
              onClick={handleRedo}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Redo Lesson 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}