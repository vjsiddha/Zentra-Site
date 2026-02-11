"use client";

import { useMemo, useState } from "react";

type Sector = {
  id: string;
  name: string;
  emoji: string;
  vibe: "cyclical" | "defensive" | "theme";
  short: string;
};

const SECTORS: Sector[] = [
  { id: "tech", name: "Technology", emoji: "💻", vibe: "cyclical", short: "Rate-sensitive growth." },
  { id: "health", name: "Healthcare", emoji: "🩺", vibe: "defensive", short: "Steadier demand, policy risk." },
  { id: "staples", name: "Consumer Staples", emoji: "🛒", vibe: "defensive", short: "Essentials; resilient in slowdowns." },
  { id: "energy", name: "Energy", emoji: "⛽️", vibe: "cyclical", short: "Commodity/geopolitics driven." },
  { id: "industrials", name: "Industrials", emoji: "🏗️", vibe: "cyclical", short: "Tied to growth & capex." },
  { id: "utilities", name: "Utilities", emoji: "💡", vibe: "defensive", short: "Stable cashflows; rate-sensitive." },
  { id: "ai_theme", name: "AI Theme", emoji: "🤖", vibe: "theme", short: "High upside, high volatility." },
  { id: "clean_energy", name: "Clean Energy Theme", emoji: "🌱", vibe: "theme", short: "Policy + rates sensitive." },
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const formatPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

type MiniQuizQ = {
  id: number;
  title: string;
  prompt: string;
  options: { label: string; isCorrect: boolean; feedback: string }[];
  skill: "Cyclicals vs Defensives" | "Themes" | "Diversification";
};

const QUIZ: MiniQuizQ[] = [
  {
    id: 1,
    title: "Recession Risk Spikes",
    prompt:
      "A recession warning hits. Which statement is most accurate for sector behavior?",
    skill: "Cyclicals vs Defensives",
    options: [
      {
        label: "Defensives often hold up better than cyclicals when recession risk rises.",
        isCorrect: true,
        feedback:
          "Yes — defensives (staples/health/utilities) tend to be more resilient because demand is steadier.",
      },
      {
        label: "Cyclicals rally first because they are cheaper.",
        isCorrect: false,
        feedback:
          "Sometimes markets look ahead, but typically cyclicals get hit early when recession odds rise.",
      },
      {
        label: "All sectors behave the same in recessions.",
        isCorrect: false,
        feedback:
          "Sector sensitivity differs — that’s the whole reason sector diversification matters.",
      },
    ],
  },
  {
    id: 2,
    title: "Rates Jump Unexpectedly",
    prompt:
      "The central bank hikes rates more than expected. What usually happens *first*?",
    skill: "Cyclicals vs Defensives",
    options: [
      {
        label: "Rate-sensitive growth (often Tech/themes) can fall more than defensives in the short run.",
        isCorrect: true,
        feedback:
          "Correct — higher rates can compress valuations for growth and rate-sensitive themes.",
      },
      {
        label: "Utilities always rally strongly when rates go up.",
        isCorrect: false,
        feedback:
          "Utilities can be rate-sensitive too (dividend alternatives). They might not rally on a hike.",
      },
      {
        label: "Nothing changes; rates don’t affect sectors.",
        isCorrect: false,
        feedback:
          "Rates influence discount rates, borrowing costs, and investor risk appetite — sectors react differently.",
      },
    ],
  },
  {
    id: 3,
    title: "Thematic Investing Reality Check",
    prompt:
      "Which is the best description of a thematic ETF (AI, clean energy)?",
    skill: "Themes",
    options: [
      {
        label: "A concentrated bet on a narrative; it can amplify gains *and* losses versus broad markets.",
        isCorrect: true,
        feedback:
          "Exactly — themes can be powerful but are usually more volatile and expectation-driven.",
      },
      {
        label: "A theme is automatically diversified because it holds many stocks.",
        isCorrect: false,
        feedback:
          "Holding many stocks doesn’t guarantee diversification if they share the same driver (e.g., rates/hype).",
      },
      {
        label: "Themes are safer than defensive sectors because they are ‘the future.’",
        isCorrect: false,
        feedback:
          "Future potential doesn’t eliminate volatility. Themes often swing harder when expectations change.",
      },
    ],
  },
  {
    id: 4,
    title: "Diversification Rule of Thumb",
    prompt:
      "Which allocation choice is *most* diversified in spirit?",
    skill: "Diversification",
    options: [
      {
        label: "60% AI Theme, 30% Tech, 10% Clean Energy Theme",
        isCorrect: false,
        feedback:
          "That’s very concentrated and theme-heavy. One narrative shift could hit most of the portfolio.",
      },
      {
        label: "40% Industrials, 40% Energy, 20% Tech",
        isCorrect: false,
        feedback:
          "Still cyclical-heavy. A slowdown could hit all three at once.",
      },
      {
        label: "40% Healthcare, 35% Industrials, 25% Technology",
        isCorrect: true,
        feedback:
          "Better balance: defensive anchor + cyclical + growth. Not perfect, but meaningfully less correlated.",
      },
    ],
  },
];

function computePortfolioStats(picks: string[], weights: Record<string, number>) {
  const total = picks.reduce((acc, id) => acc + (weights[id] ?? 0), 0);
  const maxW = picks.length ? Math.max(...picks.map((id) => weights[id] ?? 0)) : 0;

  const vibeTotals = picks.reduce(
    (acc, id) => {
      const v = SECTORS.find((s) => s.id === id)?.vibe;
      const w = weights[id] ?? 0;
      if (!v) return acc;
      acc[v] += w;
      return acc;
    },
    { cyclical: 0, defensive: 0, theme: 0 } as Record<"cyclical" | "defensive" | "theme", number>
  );

  const vibeCount = Object.values(vibeTotals).filter((w) => w > 0).length;

  // Concentration index: sum of squared weights (normalized 0..1-ish). Higher = more concentrated.
  const hhi = picks.reduce((acc, id) => {
    const p = (weights[id] ?? 0) / 100;
    return acc + p * p;
  }, 0);

  // Simple rubric-based score (0-100):
  // - Valid 100% total: 35 pts
  // - Not too concentrated: 35 pts (maxW <= 60 and hhi not huge)
  // - Vibe mix: 30 pts (>=2 vibes)
  const valid = Math.abs(total - 100) < 0.0001;
  const concentration = clamp(100 - (maxW - 40) * 2.2 - (hhi - 0.34) * 120, 0, 100); // heuristic
  const score =
    (valid ? 35 : 0) +
    clamp((concentration / 100) * 35, 0, 35) +
    (vibeCount >= 2 ? 30 : 10);

  // "Go all-in" detection (for reflection quiz)
  const isAllIn = maxW >= 70 || hhi >= 0.55;

  return {
    total,
    maxW,
    vibeTotals,
    vibeCount,
    hhi,
    diversificationScore: Math.round(clamp(score, 0, 100)),
    isAllIn,
    concentrationScore: Math.round(concentration),
    valid,
  };
}

export default function L3_Applying({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "heat-check" | "quiz" | "reflection" | "complete">("intro");

  // For this lesson, user “rebuilds” a mini portfolio (separate from L2 state).
  // You can later connect L2 state via props if you want.
  const [picks, setPicks] = useState<string[]>(["health", "industrials", "tech"]);
  const [weights, setWeights] = useState<Record<string, number>>({ health: 40, industrials: 35, tech: 25 });

  // Quiz state
  const [qIndex, setQIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showQFeedback, setShowQFeedback] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState<boolean[]>([]);

  // Reflection quiz state
  const [reflectChoice, setReflectChoice] = useState<"diversified" | "mixed" | "allin" | null>(null);
  const [reflectReason, setReflectReason] = useState<"volatility" | "conviction" | "uncertain" | "noidea" | null>(null);
  const [reflectPlan, setReflectPlan] = useState<"rebalance" | "addDefensive" | "addThemeSmall" | "leaveIt" | null>(null);
  const [showReflectFeedback, setShowReflectFeedback] = useState(false);

  const stats = useMemo(() => computePortfolioStats(picks, weights), [picks, weights]);

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "heat-check") setView("intro");
    else if (view === "quiz") setView("heat-check");
    else if (view === "reflection") setView("quiz");
    else if (view === "complete") setView("reflection");
  };

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

  const togglePick = (id: string) => {
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
    setWeights((prev) => {
      if (prev[id] != null) return prev;
      return { ...prev, [id]: 0 };
    });
  };

  const setWeight = (id: string, w: number) => setWeights((prev) => ({ ...prev, [id]: w }));

  const autoBalance = () => {
    if (picks.length !== 3) return;
    const hasTheme = picks.some((id) => SECTORS.find((s) => s.id === id)?.vibe === "theme");
    const next: Record<string, number> = { ...weights };

    if (hasTheme) {
      const themeId = picks.find((id) => SECTORS.find((s) => s.id === id)?.vibe === "theme")!;
      const others = picks.filter((id) => id !== themeId);
      next[themeId] = 20;
      next[others[0]] = 40;
      next[others[1]] = 40;
    } else {
      next[picks[0]] = 34;
      next[picks[1]] = 33;
      next[picks[2]] = 33;
    }
    setWeights(next);
  };

  // Quiz handlers
  const currentQ = QUIZ[qIndex];

  const submitQuiz = () => {
    if (selectedIdx == null) return;
    setShowQFeedback(true);
    const correct = currentQ.options[selectedIdx].isCorrect;
    setQuizCorrect((prev) => [...prev, correct]);
  };

  const nextQuiz = () => {
    if (qIndex < QUIZ.length - 1) {
      setQIndex((i) => i + 1);
      setSelectedIdx(null);
      setShowQFeedback(false);
    } else {
      setView("reflection");
    }
  };

  const quizScorePct = useMemo(() => {
    const correctCount = quizCorrect.filter(Boolean).length;
    // If they are on final feedback, quizCorrect length = answered questions so far.
    // When complete, it will be 4.
    return Math.round((correctCount / QUIZ.length) * 100);
  }, [quizCorrect]);

  // Reflection grading
  const reflectionScore = useMemo(() => {
    // base: classification matches portfolio reality
    const truth =
      stats.isAllIn ? "allin" : stats.diversificationScore >= 75 ? "diversified" : "mixed";

    const classificationPts = reflectChoice ? (reflectChoice === truth ? 45 : 20) : 0;

    // reasoning: pick a plausible reason
    const reasonPts = reflectReason ? (reflectReason === "volatility" || reflectReason === "conviction" || reflectReason === "uncertain" ? 25 : 10) : 0;

    // plan: pick a sensible next action
    const planPts = reflectPlan
      ? reflectPlan === "rebalance" || reflectPlan === "addDefensive" || reflectPlan === "addThemeSmall"
        ? 30
        : 15
      : 0;

    return clamp(classificationPts + reasonPts + planPts, 0, 100);
  }, [reflectChoice, reflectReason, reflectPlan, stats]);

  const finalLessonScore = useMemo(() => {
    // Weighted:
    // - heat-check diversification: 45%
    // - shock-response quiz: 35%
    // - reflection quiz: 20%
    const heat = stats.diversificationScore;
    const quiz = quizScorePct;
    const refl = reflectionScore;
    return Math.round(0.45 * heat + 0.35 * quiz + 0.2 * refl);
  }, [stats.diversificationScore, quizScorePct, reflectionScore]);

  // INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <BackButton />
        <div className="w-full text-center mb-8">
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 3: Apply</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Stress-Test Your Sector Strategy</h1>
          <p className="text-[#4F7D96] mt-2">Make a plan, test your logic, and commit to a next step</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🌡️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Diversification Heat Check</h3>
            <p className="text-sm text-[#4F7D96]">
              Build a 3-sector portfolio and see whether you’re diversified or concentrated.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Shock-Response Quiz</h3>
            <p className="text-sm text-[#4F7D96]">
              Quick MCQs about how sectors react to rates, recession risk, and themes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Diversify or Go All-In?</h3>
            <p className="text-sm text-[#4F7D96]">
              A graded reflection quiz that turns your strategy into a concrete decision.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-sky-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 What you’ll prove:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• You understand cyclicals vs defensives</li>
            <li>• You can size themes without blowing up risk</li>
            <li>• You can explain whether you diversified or went all-in</li>
          </ul>
        </div>

        <button
          onClick={() => setView("heat-check")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Lesson 3
        </button>
      </div>
    );
  }

  // HEAT CHECK
  if (view === "heat-check") {
    const total = picks.reduce((acc, id) => acc + (weights[id] ?? 0), 0);
    const validTotal = Math.abs(total - 100) < 0.0001 && picks.length === 3;

    const status =
      !validTotal ? { label: "Needs work", color: "text-rose-700", bg: "bg-rose-50 border-rose-200", icon: "⚠️" } :
      stats.isAllIn ? { label: "Very concentrated", color: "text-amber-800", bg: "bg-amber-50 border-amber-200", icon: "🔥" } :
      stats.diversificationScore >= 75 ? { label: "Well balanced", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "✅" } :
      { label: "Some concentration", color: "text-sky-800", bg: "bg-sky-50 border-sky-200", icon: "🧩" };

    const vibeLabel = (v: "cyclical" | "defensive" | "theme") =>
      v === "cyclical" ? "Cyclicals" : v === "defensive" ? "Defensives" : "Themes";

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs">Step 1</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Diversification Heat Check</h2>
            <p className="text-slate-500 mt-1">Pick 3 sectors and set weights that sum to 100%</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Left: pick cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECTORS.map((s) => {
                const active = picks.includes(s.id);
                const vibeTag =
                  s.vibe === "defensive" ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                  s.vibe === "cyclical" ? "bg-amber-50 border-amber-200 text-amber-800" :
                  "bg-violet-50 border-violet-200 text-violet-700";

                return (
                  <button
                    key={s.id}
                    onClick={() => togglePick(s.id)}
                    className={[
                      "text-left rounded-3xl p-6 border shadow-sm transition-all",
                      active ? "border-[#0B5E8E] bg-sky-50 shadow-md" : "bg-white border-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                          {s.emoji}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{s.name}</p>
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black mt-2 border ${vibeTag}`}>
                            {s.vibe === "theme" ? "THEME" : s.vibe.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        active ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {active ? "✓" : "+"}
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mt-3 leading-relaxed">{s.short}</p>
                  </button>
                );
              })}
            </div>

            {/* Right: builder */}
            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Your 3-Sector Plan</h3>
              <p className="text-sm text-slate-500 mt-1">This is your strategy for the rest of Lesson 3.</p>

              <div className="mt-4 space-y-3">
                {picks.map((id) => {
                  const s = SECTORS.find((x) => x.id === id)!;
                  const w = weights[id] ?? 0;

                  return (
                    <div key={id} className="p-4 rounded-2xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{s.emoji}</span>
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-500">{s.vibe.toUpperCase()}</span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Weight</span>
                          <span className="font-black text-slate-800">{w}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={w}
                          onChange={(e) => setWeight(id, Number(e.target.value))}
                          className="w-full accent-[#0B5E8E]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">Total</p>
                  <p className={`text-sm font-black ${validTotal ? "text-emerald-600" : "text-rose-600"}`}>
                    {total}%
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={autoBalance}
                    disabled={picks.length !== 3}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Auto-Balance
                  </button>
                  <button
                    onClick={() => {
                      setPicks(["health", "industrials", "tech"]);
                      setWeights({ health: 40, industrials: 35, tech: 25 });
                    }}
                    className="py-2.5 px-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Heat result */}
              <div className={`mt-4 p-4 rounded-2xl border ${status.bg}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-black ${status.color}`}>{status.icon} {status.label}</p>
                  <p className="text-sm font-black text-slate-900">{stats.diversificationScore}/100</p>
                </div>
                <p className="text-xs text-slate-700 mt-2">
                  Max position: <span className="font-bold">{stats.maxW}%</span> • Theme exposure:{" "}
                  <span className="font-bold">{stats.vibeTotals.theme}%</span>
                </p>

                <div className="mt-3 space-y-2">
                  {(["defensive", "cyclical", "theme"] as const).map((v) => (
                    <div key={v}>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span className="font-bold">{vibeLabel(v)}</span>
                        <span className="font-black">{stats.vibeTotals[v]}%</span>
                      </div>
                      <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-slate-200">
                        <div className="h-full bg-[#0B5E8E]" style={{ width: `${stats.vibeTotals[v]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setView("quiz")}
                disabled={!validTotal}
                className="w-full mt-4 py-4 bg-[#0B5E8E] text-white rounded-2xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Continue to Shock-Response Quiz
              </button>
              {!validTotal && (
                <p className="text-xs text-slate-500 mt-2">
                  Pick 3 sectors and make weights sum to 100% to continue.
                </p>
              )}
            </aside>
          </div>
        </section>
      </div>
    );
  }

  // QUIZ
  if (view === "quiz") {
    const progressPct = ((qIndex + (showQFeedback ? 1 : 0)) / QUIZ.length) * 100;

    const chosen = selectedIdx != null ? currentQ.options[selectedIdx] : null;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Step 2</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Shock-Response Quiz</h2>
            <p className="text-slate-500 mt-1">Question {qIndex + 1} of {QUIZ.length} • Skill: {currentQ.skill}</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
            <div className="mb-5">
              <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                {currentQ.title}
              </div>
              <p className="mt-4 text-lg font-black text-slate-900">{currentQ.prompt}</p>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((o, idx) => {
                const picked = selectedIdx === idx;

                const style =
                  !showQFeedback
                    ? picked
                      ? "border-[#0B5E8E] bg-sky-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                    : o.isCorrect
                      ? "border-emerald-400 bg-emerald-50"
                      : picked
                        ? "border-rose-400 bg-rose-50"
                        : "border-slate-200 bg-white opacity-80";

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    disabled={showQFeedback}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${style}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 ${
                        picked ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{o.label}</p>
                        {showQFeedback && picked && (
                          <p className="text-sm text-slate-700 mt-2">{o.feedback}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {!showQFeedback ? (
              <button
                onClick={submitQuiz}
                disabled={selectedIdx == null}
                className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuiz}
                className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {qIndex < QUIZ.length - 1 ? "Next Question" : "Continue to Reflection Quiz"}
              </button>
            )}

            {showQFeedback && chosen && (
              <div className={`mt-6 p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
                chosen.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{chosen.isCorrect ? "✅" : "💡"}</span>
                  <span className={`font-black uppercase tracking-wider text-sm ${
                    chosen.isCorrect ? "text-emerald-700" : "text-amber-800"
                  }`}>
                    {chosen.isCorrect ? "Correct" : "Close — here’s the pattern"}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{chosen.feedback}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // REFLECTION QUIZ (graded, NOT free text)
  if (view === "reflection") {
    const truth =
      stats.isAllIn ? "allin" : stats.diversificationScore >= 75 ? "diversified" : "mixed";

    const truthLabel =
      truth === "diversified" ? "Diversified" : truth === "mixed" ? "Somewhat diversified" : "All-in / concentrated";

    const truthCoach =
      truth === "diversified"
        ? "You spread exposure and reduced the chance that one story dominates your returns."
        : truth === "mixed"
          ? "You have some balance, but one driver could still dominate (check your largest weight and vibe mix)."
          : "Your portfolio is vulnerable to one narrative. If that driver breaks, the whole portfolio can drop together.";

    const lockEnabled = reflectChoice && reflectReason && reflectPlan;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Step 3</p>
            <h2 className="text-2xl font-bold text-slate-900">Did You Diversify or Go All-In?</h2>
            <p className="text-slate-500 mt-1">Answer 3 quick questions — we’ll grade the reasoning</p>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6">
            {/* Snapshot */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600">Your portfolio snapshot</p>
                  <p className="text-lg font-black text-slate-900 mt-2">
                    Diversification Score: <span className="text-[#0B5E8E]">{stats.diversificationScore}/100</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Max position: {stats.maxW}% • Theme exposure: {stats.vibeTotals.theme}%</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <p className="text-xs font-black text-slate-500 uppercase">Coach truth</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{truthLabel}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {picks.map((id) => {
                  const s = SECTORS.find((x) => x.id === id)!;
                  const w = weights[id] ?? 0;
                  return (
                    <div key={id} className="bg-white rounded-2xl p-4 border border-slate-200">
                      <p className="font-bold text-slate-900 text-sm">{s.emoji} {s.name}</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{w}%</p>
                      <p className="text-xs text-slate-500 mt-1">{s.vibe.toUpperCase()}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Q1 */}
            <div>
              <p className="font-black text-slate-900 mb-3">
                1) If you had to label your strategy, what is it?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: "diversified", label: "Diversified", desc: "Balanced exposures, no single driver dominates." },
                  { key: "mixed", label: "Somewhat diversified", desc: "Some balance, but one driver still matters a lot." },
                  { key: "allin", label: "All-in", desc: "A concentrated bet on one sector/theme/story." },
                ].map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setReflectChoice(c.key as any)}
                    className={[
                      "text-left p-5 rounded-2xl border transition-all",
                      reflectChoice === c.key ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900">{c.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div>
              <p className="font-black text-slate-900 mb-3">
                2) Why did you choose that approach?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "volatility", label: "To reduce volatility / avoid one shock hurting everything" },
                  { key: "conviction", label: "I have strong conviction in one sector/theme" },
                  { key: "uncertain", label: "I’m uncertain, so I spread bets to learn safely" },
                  { key: "noidea", label: "Honestly… I didn’t think about it" },
                ].map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setReflectReason(r.key as any)}
                    className={[
                      "text-left p-5 rounded-2xl border transition-all",
                      reflectReason === r.key ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900">{r.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div>
              <p className="font-black text-slate-900 mb-3">
                3) What’s the best next step for your strategy?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { key: "rebalance", label: "Rebalance so no position is too big" },
                  { key: "addDefensive", label: "Add a defensive anchor (staples/health/utilities)" },
                  { key: "addThemeSmall", label: "If using themes, size them small (10–20%)" },
                  { key: "leaveIt", label: "Leave it as-is and accept volatility" },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setReflectPlan(p.key as any)}
                    className={[
                      "text-left p-5 rounded-2xl border transition-all",
                      reflectPlan === p.key ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900">{p.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {!showReflectFeedback ? (
              <button
                onClick={() => setShowReflectFeedback(true)}
                disabled={!lockEnabled}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Grade My Strategy
              </button>
            ) : (
              <button
                onClick={() => setView("complete")}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                Finish Lesson 3
              </button>
            )}

            {showReflectFeedback && (
              <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-2xl p-5 border border-violet-200 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-black text-slate-900 mb-2">Your Strategy Grade</h4>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase text-slate-500">Reflection</p>
                    <p className="text-xl font-black text-slate-900">{reflectionScore}/100</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase text-slate-500">Truth label</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{truthLabel}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase text-slate-500">Coach note</p>
                    <p className="text-xs text-slate-700 mt-1">{truthCoach}</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Key takeaway:</strong>{" "}
                    Sector investing isn’t about guessing the “best” sector — it’s about sizing exposures so that
                    different news doesn’t break your whole portfolio.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // COMPLETE
  const heat = stats.diversificationScore;
  const quiz = quizScorePct;
  const refl = reflectionScore;

  const badge = finalLessonScore >= 80 ? "🏆" : finalLessonScore >= 60 ? "👍" : "📚";
  const headline =
    finalLessonScore >= 80 ? "Sector Strategy Ready!" :
    finalLessonScore >= 60 ? "Good Strategy — Keep Refining" :
    "Keep Practicing";

  const summary =
    finalLessonScore >= 80
      ? "You balanced exposure, understood sector behavior, and made a strong plan."
      : finalLessonScore >= 60
        ? "You understand the basics — your next level is better sizing and avoiding concentration."
        : "Focus on cyclicals vs defensives patterns, then try balancing your weights.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Module 6 • Lesson 3 Complete</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Heat check</p>
              <p className="text-xl font-black text-sky-900">{heat}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Quiz</p>
              <p className="text-xl font-black text-emerald-900">{quiz}%</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-xs font-black uppercase text-violet-700">Reflection</p>
              <p className="text-xl font-black text-violet-900">{refl}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-2">What you proved</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• You can distinguish cyclicals vs defensives vs themes</li>
              <li>• You can size a sector portfolio without going “one-story”</li>
              <li>• You can explain your strategy and choose a next action</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Coach summary:</strong> {summary}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalLessonScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue
            </button>
            <button
              onClick={() => {
                setView("intro");
                setPicks(["health", "industrials", "tech"]);
                setWeights({ health: 40, industrials: 35, tech: 25 });
                setQIndex(0);
                setSelectedIdx(null);
                setShowQFeedback(false);
                setQuizCorrect([]);
                setReflectChoice(null);
                setReflectReason(null);
                setReflectPlan(null);
                setShowReflectFeedback(false);
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
