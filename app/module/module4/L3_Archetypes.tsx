"use client";

import { useState } from "react";

interface L3Props {
  onComplete: (score: number) => void;
}

interface Archetype {
  id: string;
  name: string;
  emoji: string;
  description: string;
  behavior: string;
  outcome: string;
  lesson: string;
  color: string;
  bgColor: string;
}

const ARCHETYPES: Archetype[] = [
  {
    id: "panic_seller",
    name: "The Panic Seller",
    emoji: "😱",
    description: "Sells everything at the first sign of trouble",
    behavior: "At -10%: 'This is it! The crash is here!' Sells entire portfolio. Moves to cash and waits for 'stability.'",
    outcome: "Locks in a 25% loss. Misses the entire recovery. When they finally buy back in 2 years later, prices are 40% higher than their original entry.",
    lesson: "Panic selling crystallizes paper losses into real losses. Most bear market gains happen in the first months of recovery.",
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  {
    id: "ostrich",
    name: "The Ostrich",
    emoji: "🫣",
    description: "Refuses to look at their portfolio",
    behavior: "Stops checking account. 'I can't handle the stress.' Ignores statements. Continues automated investments but never rebalances.",
    outcome: "Portfolio becomes heavily weighted toward bonds/cash by the bottom. Misses buying opportunities. Returns lag the market by 2-3%.",
    lesson: "Ignoring problems doesn't make them go away. Regular rebalancing is crucial—it forces you to buy low automatically.",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  },
  {
    id: "market_timer",
    name: "The Market Timer",
    emoji: "🎰",
    description: "Tries to outsmart the market",
    behavior: "Sells at -15%: 'I'll buy back at the bottom!' Watches market climb from -25% to -18%. Panics and buys back higher than they sold.",
    outcome: "Loses 8% trying to time the bottom. Pays transaction fees. Creates taxable events. Underperforms by 5% annually.",
    lesson: "Even professional investors can't consistently time the market. Missing the 10 best days destroys long-term returns.",
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  {
    id: "bargain_hunter",
    name: "The Bargain Hunter",
    emoji: "🛒",
    description: "Gets greedy and goes all-in too early",
    behavior: "At -10%: 'Fire sale!' Invests all cash. At -25%: Out of cash with no ability to buy more. Watches even better prices pass by.",
    outcome: "Good strategy but poor execution. Should have spread purchases across the decline. Still beats most investors.",
    lesson: "Dollar-cost averaging during downturns beats trying to catch the exact bottom. Save some dry powder for deeper drops.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50"
  },
  {
    id: "disciplined",
    name: "The Disciplined Investor",
    emoji: "🧘",
    description: "Sticks to their plan no matter what",
    behavior: "Continues monthly $500 DCA. Rebalances quarterly back to 70/20/10. Doesn't panic. Doesn't get greedy. Trusts the process.",
    outcome: "Automatically buys more shares at lower prices. Rebalancing sells bonds high and buys stocks low. Outperforms 80% of investors.",
    lesson: "Having a plan and sticking to it beats any attempt to outsmart the market. Boring = winning.",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  },
  {
    id: "opportunist",
    name: "The Strategic Opportunist",
    emoji: "🎯",
    description: "Prepared with cash reserves for opportunities",
    behavior: "Holds 20% cash specifically for market crashes. Gradually deploys cash as market falls: 25% at -10%, 25% at -15%, 25% at -20%, 25% at -25%.",
    outcome: "Buys at progressively better prices. Maintains discipline. Captures maximum upside in recovery. Best risk-adjusted returns.",
    lesson: "The best time to be greedy is when others are fearful. But have a plan BEFORE the crash, not during it.",
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  }
];

const QUIZ_SCENARIOS = [
  {
    id: 1,
    scenario: "The market drops 8% in one week on inflation fears. Your portfolio is down $8,000. What do you do?",
    options: [
      { id: "a", text: "Sell half my stocks to 'protect myself'", archetype: "panic_seller" },
      { id: "b", text: "Stop looking at my portfolio for a month", archetype: "ostrich" },
      { id: "c", text: "Wait for it to drop more, then buy at the bottom", archetype: "market_timer" },
      { id: "d", text: "Stick to my regular monthly investment plan", archetype: "disciplined" },
    ]
  },
  {
    id: 2,
    scenario: "Your tech-heavy portfolio drops 20% while bonds are stable. You normally keep 70/30 stocks/bonds. Now you're at 60/40. What do you do?",
    options: [
      { id: "a", text: "Leave it—stocks are too risky right now", archetype: "ostrich" },
      { id: "b", text: "Sell more stocks and go 50/50 to be safe", archetype: "panic_seller" },
      { id: "c", text: "Rebalance back to 70/30 by selling bonds and buying stocks", archetype: "disciplined" },
      { id: "d", text: "Wait until stocks recover, then rebalance", archetype: "market_timer" },
    ]
  },
  {
    id: 3,
    scenario: "A bear market is confirmed (-20% from highs). Financial news is apocalyptic. Your coworkers are all selling. What's your move?",
    options: [
      { id: "a", text: "Everyone else is selling—I should too!", archetype: "panic_seller" },
      { id: "b", text: "This is my chance! All-in with my emergency fund!", archetype: "bargain_hunter" },
      { id: "c", text: "Gradually increase my monthly investments by 25%", archetype: "opportunist" },
      { id: "d", text: "Nothing changes. I stick to my plan.", archetype: "disciplined" },
    ]
  },
  {
    id: 4,
    scenario: "After a brutal 6-month bear market, stocks suddenly jump 10% in one week. Headlines say 'The bottom is in!' What do you do?",
    options: [
      { id: "a", text: "Rush to buy before I miss the recovery", archetype: "market_timer" },
      { id: "b", text: "Sell to lock in the bounce—it might crash again", archetype: "panic_seller" },
      { id: "c", text: "Continue my regular investing schedule", archetype: "disciplined" },
      { id: "d", text: "Deploy the last of my reserve cash per my plan", archetype: "opportunist" },
    ]
  },
  {
    id: 5,
    scenario: "Your portfolio has recovered to breakeven after 14 months. You lost no money but gained no money. How do you feel?",
    options: [
      { id: "a", text: "Frustrated—I should have sold and bought back lower", archetype: "market_timer" },
      { id: "b", text: "Relieved—at least I didn't lose anything", archetype: "ostrich" },
      { id: "c", text: "Satisfied—my DCA bought cheap shares the whole way", archetype: "disciplined" },
      { id: "d", text: "Excellent—I'm actually up because I bought the dips", archetype: "opportunist" },
    ]
  }
];

export default function L3_Archetypes({ onComplete }: L3Props) {
  const [view, setView] = useState<"intro" | "archetypes" | "quiz" | "results">("intro");
  const [currentArchetypeIdx, setCurrentArchetypeIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleArchetypeNext = () => {
    if (currentArchetypeIdx < ARCHETYPES.length - 1) {
      setCurrentArchetypeIdx(currentArchetypeIdx + 1);
    } else {
      setView("quiz");
    }
  };

  const handleQuizAnswer = () => {
    if (!selectedOption) return;
    
    const newAnswers = [...quizAnswers, selectedOption];
    setQuizAnswers(newAnswers);
    
    if (quizIdx < QUIZ_SCENARIOS.length - 1) {
      setQuizIdx(quizIdx + 1);
      setSelectedOption(null);
    } else {
      setView("results");
    }
  };

  // Calculate which archetype user is most like
  const calculateArchetype = () => {
    const counts: Record<string, number> = {};
    quizAnswers.forEach(answer => {
      const scenario = QUIZ_SCENARIOS.find(s => s.options.some(o => o.id === answer));
      const option = scenario?.options.find(o => o.id === answer);
      if (option?.archetype) {
        counts[option.archetype] = (counts[option.archetype] || 0) + 1;
      }
    });
    
    const maxCount = Math.max(...Object.values(counts));
    const dominantArchetype = Object.keys(counts).find(k => counts[k] === maxCount) || "disciplined";
    return ARCHETYPES.find(a => a.id === dominantArchetype) || ARCHETYPES[4];
  };

  const userArchetype = view === "results" ? calculateArchetype() : null;
  const score = userArchetype?.id === "disciplined" || userArchetype?.id === "opportunist" ? 90 : 
                userArchetype?.id === "bargain_hunter" ? 75 :
                userArchetype?.id === "market_timer" ? 60 :
                userArchetype?.id === "ostrich" ? 50 : 40;

  // INTRO
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-full mb-6">
<span className="text-sm font-bold uppercase tracking-widest">Lesson 3</span>          </div>

          <h1 className="text-[36px] font-bold text-[#0D171C] leading-tight mb-4">
            Which Investor Are You?
          </h1>
          <p className="text-slate-700 text-lg mb-10">
            Everyone reacts differently to market crashes. Understanding these investor archetypes will help you 
            recognize your own patterns and make better decisions in the heat of the moment.
          </p>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-10">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">You'll Learn About:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😱</span>
                <span className="text-slate-700">The Panic Seller who locks in losses</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎰</span>
                <span className="text-slate-700">The Market Timer who tries to outsmart everyone</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🧘</span>
                <span className="text-slate-700">The Disciplined Investor who stays calm</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <span className="text-slate-700">The Strategic Opportunist who has a plan</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setView("archetypes")} 
            className="w-full py-4 bg-violet-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-violet-700 transition-all"
          >
            Meet the Investor Types →
          </button>
        </div>
      </div>
    );
  }

  // ARCHETYPES
  if (view === "archetypes") {
    const archetype = ARCHETYPES[currentArchetypeIdx];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">
              Archetype {currentArchetypeIdx + 1} of {ARCHETYPES.length}
            </p>
            <h2 className="text-4xl font-bold text-slate-900">{archetype.name}</h2>
          </div>

          <div className={`${archetype.bgColor} border-2 border-${archetype.color.replace('text-', '')} rounded-3xl p-8 mb-6 animate-in zoom-in`}>
            <div className="text-center mb-6">
              <div className="text-7xl mb-4">{archetype.emoji}</div>
              <p className="text-lg text-slate-700 font-medium">{archetype.description}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💭</span>
                  Typical Behavior
                </h3>
                <p className="text-slate-700 leading-relaxed">{archetype.behavior}</p>
              </div>

              <div className="bg-white rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Long-Term Outcome
                </h3>
                <p className="text-slate-700 leading-relaxed">{archetype.outcome}</p>
              </div>

              <div className={`${archetype.bgColor} rounded-2xl p-6 border-2 border-${archetype.color.replace('text-', '')}`}>
                <h3 className={`font-bold ${archetype.color} mb-3 flex items-center gap-2`}>
                  <span className="text-xl">💡</span>
                  Key Lesson
                </h3>
                <p className={`${archetype.color} leading-relaxed font-medium`}>{archetype.lesson}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleArchetypeNext}
            className="w-full py-4 bg-violet-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-violet-700 transition-all"
          >
            {currentArchetypeIdx === ARCHETYPES.length - 1 ? "Take the Quiz →" : "Next Archetype →"}
          </button>
        </div>
      </div>
    );
  }

  // QUIZ
  if (view === "quiz") {
    const scenario = QUIZ_SCENARIOS[quizIdx];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">
              Question {quizIdx + 1} of {QUIZ_SCENARIOS.length}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">What Would You Do?</h2>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
            <div className="bg-violet-50 rounded-2xl p-6 mb-6">
              <p className="text-lg text-slate-800 font-medium leading-relaxed">
                {scenario.scenario}
              </p>
            </div>

            <div className="space-y-3">
              {scenario.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${
                    selectedOption === option.id 
                      ? 'border-violet-500 bg-violet-50' 
                      : 'border-slate-200 hover:border-violet-300'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            <button
              onClick={handleQuizAnswer}
              disabled={!selectedOption}
              className="mt-6 w-full py-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              {quizIdx === QUIZ_SCENARIOS.length - 1 ? "See My Results →" : "Next Scenario →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (!userArchetype) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className={`${userArchetype.bgColor} border-2 border-${userArchetype.color.replace('text-', '')} rounded-3xl p-10 mb-6 text-center`}>
          <div className="text-7xl mb-4">{userArchetype.emoji}</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">You are...</h2>
          <h3 className={`text-4xl font-black mb-4 ${userArchetype.color}`}>{userArchetype.name}</h3>
          <p className="text-lg text-slate-700 mb-6">{userArchetype.description}</p>

          <div className="bg-white rounded-2xl p-6 mb-6 text-left">
            <h4 className="font-bold text-slate-900 mb-3">Your Tendencies:</h4>
            <p className="text-slate-700 leading-relaxed mb-4">{userArchetype.behavior}</p>
            
            <h4 className="font-bold text-slate-900 mb-3">Expected Outcome:</h4>
            <p className="text-slate-700 leading-relaxed mb-4">{userArchetype.outcome}</p>

            <div className={`${userArchetype.bgColor} rounded-xl p-4 border-2 border-${userArchetype.color.replace('text-', '')}`}>
              <h4 className={`font-bold ${userArchetype.color} mb-2`}>💡 What This Means:</h4>
              <p className={`${userArchetype.color} font-medium`}>{userArchetype.lesson}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-6 mb-6 text-left">
            <h4 className="font-bold text-slate-900 mb-3">📋 Action Plan for You:</h4>
            {userArchetype.id === "panic_seller" && (
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Write down your investment plan NOW, before the next crash</li>
                <li>• Commit to NOT checking your portfolio daily during downturns</li>
                <li>• Automate investments so emotions can't interfere</li>
                <li>• Remember: Markets have recovered from EVERY crash in history</li>
              </ul>
            )}
            {userArchetype.id === "ostrich" && (
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Set quarterly calendar reminders to rebalance</li>
                <li>• Focus on your allocation, not daily prices</li>
                <li>• Remember: Temporary discomfort leads to long-term success</li>
                <li>• Rebalancing forces you to buy low automatically</li>
              </ul>
            )}
            {userArchetype.id === "market_timer" && (
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Accept that you can't predict the market (no one can!)</li>
                <li>• Focus on time IN the market, not timing THE market</li>
                <li>• Missing the 10 best days cuts returns by 50%+</li>
                <li>• Stick to DCA and rebalancing—boring beats exciting</li>
              </ul>
            )}
            {userArchetype.id === "bargain_hunter" && (
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Your instinct is good, but pace yourself</li>
                <li>• Create a layered buying plan: 25% at -10%, 25% at -15%, etc.</li>
                <li>• Keep some cash for deeper drops</li>
                <li>• Dollar-cost average into positions rather than all-in</li>
              </ul>
            )}
            {(userArchetype.id === "disciplined" || userArchetype.id === "opportunist") && (
              <ul className="text-slate-700 space-y-2 text-sm">
                <li>• Keep doing what you're doing—it's working!</li>
                <li>• Your approach beats 80%+ of investors long-term</li>
                <li>• Document your strategy to stay disciplined during the next crash</li>
                <li>• Consider teaching others your systematic approach</li>
              </ul>
            )}
          </div>
        </div>

        {/* Final Score */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200 text-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Module 4 Complete!</h3>
          <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
            score >= 75 ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            <div className="text-center">
              <p className={`text-4xl font-black ${score >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {score}%
              </p>
              <p className="text-xs text-slate-500">Strategy Score</p>
            </div>
          </div>

          <p className="text-slate-600 mb-6">
            {score >= 75 
              ? "You have the mindset to survive and thrive through market volatility!"
              : "Keep learning and refining your strategy. You're on the right path!"}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onComplete(score)}
            className="w-full py-5 bg-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-violet-700 transition-all"
          >
            Complete Module 4 →
          </button>
          <button
            onClick={() => {
              setView("intro");
              setQuizIdx(0);
              setQuizAnswers([]);
              setSelectedOption(null);
            }}
            className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  );
}