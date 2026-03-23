"use client";

import { useMemo, useState } from "react";

type Sector = {
  id: string;
  name: string;
  emoji: string;
  vibe: "cyclical" | "defensive" | "theme";
  description: string;
  typicalDrivers: string[];
};

type EventImpact = {
  [sectorId: string]: number;
};

type NewsEvent = {
  id: number;
  title: string;
  tag: "Rates" | "Inflation" | "Recession" | "Tech" | "Energy" | "Health" | "Policy" | "Sentiment";
  blurb: string;
  prompt: string;
  optimalIndex: number; // index of the correct/best option
  options: {
    label: string;
    explanation: string;
    impacts: EventImpact;
  }[];
};

const SECTORS: Sector[] = [
  {
    id: "tech",
    name: "Technology",
    emoji: "💻",
    vibe: "cyclical",
    description:
      "Growth-focused companies. Often benefits when rates are low and the economy is expanding — can get hit hard when rates rise.",
    typicalDrivers: ["interest rates", "innovation cycles", "risk appetite"],
  },
  {
    id: "health",
    name: "Healthcare",
    emoji: "🩺",
    vibe: "defensive",
    description:
      "Steadier demand even in downturns. Can be sensitive to policy/regulation and drug pipeline news.",
    typicalDrivers: ["defensive demand", "policy", "demographics"],
  },
  {
    id: "staples",
    name: "Consumer Staples",
    emoji: "🛒",
    vibe: "defensive",
    description:
      "Essentials people buy regardless of the economy. Usually more resilient in recessions, but not immune.",
    typicalDrivers: ["consumer demand stability", "pricing power", "inflation"],
  },
  {
    id: "energy",
    name: "Energy",
    emoji: "⛽️",
    vibe: "cyclical",
    description:
      "Tied to oil/gas prices and global growth. Can spike on supply shocks, but also drop fast when demand slows.",
    typicalDrivers: ["commodity prices", "geopolitics", "global demand"],
  },
  {
    id: "industrials",
    name: "Industrials",
    emoji: "🏗️",
    vibe: "cyclical",
    description:
      "Infrastructure, manufacturing, logistics. Often benefits from expansion and government spending.",
    typicalDrivers: ["economic growth", "capex", "public investment"],
  },
  {
    id: "utilities",
    name: "Utilities",
    emoji: "💡",
    vibe: "defensive",
    description:
      "Stable cash flows, but can be rate-sensitive (higher rates make dividends less attractive).",
    typicalDrivers: ["interest rates", "regulation", "yield demand"],
  },
  {
    id: "ai_theme",
    name: "AI Theme",
    emoji: "🤖",
    vibe: "theme",
    description:
      "A trend-based basket. Can run up fast on hype, but can also swing wildly if expectations shift.",
    typicalDrivers: ["hype vs reality", "earnings surprises", "rate sensitivity"],
  },
  {
    id: "clean_energy",
    name: "Clean Energy Theme",
    emoji: "🌱",
    vibe: "theme",
    description:
      "A policy-and-innovation-driven theme. Sensitive to subsidies, rates, and commodity supply chains.",
    typicalDrivers: ["policy support", "rates", "cost curves"],
  },
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const EVENTS: NewsEvent[] = [
  {
    id: 1,
    title: "Central Bank Surprise: Rates Up +0.50%",
    tag: "Rates",
    blurb:
      "The central bank hikes rates more than expected. Borrowing costs rise and investors re-price risk.",
    prompt: "What's the most likely immediate market reaction?",
    optimalIndex: 0,
    options: [
      {
        label: "Growth gets hit; defensives hold up better",
        explanation:
          "Higher rates often pressure long-duration growth (like Tech). Defensives may drop less due to steadier demand.",
        impacts: {
          tech: -3.2,
          ai_theme: -3.8,
          clean_energy: -2.8,
          utilities: -1.8,
          staples: -0.9,
          health: -0.7,
          energy: -1.2,
          industrials: -2.1,
        },
      },
      {
        label: "Everything drops equally across the board",
        explanation:
          "Broad selloffs happen, but sectors usually react differently based on sensitivity to rates and the cycle.",
        impacts: {
          tech: -2.2,
          ai_theme: -2.2,
          clean_energy: -2.2,
          utilities: -2.2,
          staples: -2.2,
          health: -2.2,
          energy: -2.2,
          industrials: -2.2,
        },
      },
    ],
  },
  {
    id: 2,
    title: "Inflation Cools Faster Than Forecast",
    tag: "Inflation",
    blurb:
      "CPI comes in below expectations. Investors think rate cuts may arrive sooner.",
    prompt: "Which sectors usually benefit most from cooling inflation expectations?",
    optimalIndex: 0,
    options: [
      {
        label: "Rate-sensitive growth & themes rebound",
        explanation:
          "Lower expected rates can boost growth and theme valuations. Cyclicals can also improve on a softer landing narrative.",
        impacts: {
          tech: +2.6,
          ai_theme: +3.1,
          clean_energy: +2.1,
          industrials: +1.2,
          energy: +0.6,
          staples: +0.3,
          health: +0.4,
          utilities: +0.2,
        },
      },
      {
        label: "Only defensives go up; growth stays flat",
        explanation:
          "Defensives can rise, but cooling inflation often helps growth the most due to rate expectations.",
        impacts: {
          tech: +0.5,
          ai_theme: +0.6,
          clean_energy: +0.4,
          industrials: +0.4,
          energy: +0.2,
          staples: +0.8,
          health: +0.9,
          utilities: +0.7,
        },
      },
    ],
  },
  {
    id: 3,
    title: "Earnings Season: Big Tech Beats Expectations",
    tag: "Tech",
    blurb:
      "Large tech firms report strong earnings and raise guidance. Markets cheer AI-driven productivity gains.",
    prompt: "What's the most likely sector impact?",
    optimalIndex: 0,
    options: [
      {
        label: "Tech and AI theme surge; rest follows modestly",
        explanation:
          "Sector-specific catalysts often concentrate returns. Spillover can lift risk sentiment, but not equally.",
        impacts: {
          tech: +3.8,
          ai_theme: +4.6,
          clean_energy: +0.6,
          industrials: +0.8,
          energy: +0.2,
          staples: +0.1,
          health: +0.2,
          utilities: +0.0,
        },
      },
      {
        label: "All sectors rally the same amount",
        explanation:
          "A risk-on day can lift markets broadly, but earnings beats usually benefit the relevant sector most.",
        impacts: {
          tech: +2.0,
          ai_theme: +2.0,
          clean_energy: +2.0,
          industrials: +2.0,
          energy: +2.0,
          staples: +2.0,
          health: +2.0,
          utilities: +2.0,
        },
      },
    ],
  },
  {
    id: 4,
    title: "Oil Supply Disruption: Crude Jumps 8%",
    tag: "Energy",
    blurb:
      "A geopolitical disruption reduces supply. Oil prices spike sharply in a single week.",
    prompt: "Which statement fits typical sector behavior?",
    optimalIndex: 0,
    options: [
      {
        label: "Energy tends to pop; some cyclicals may wobble on cost pressure",
        explanation:
          "Energy can rise with oil, while higher input costs can pressure other sectors (especially cyclicals).",
        impacts: {
          energy: +4.2,
          industrials: -0.8,
          tech: -0.6,
          ai_theme: -0.5,
          clean_energy: +0.4,
          staples: -0.3,
          health: +0.1,
          utilities: +0.2,
        },
      },
      {
        label: "Energy drops because oil is volatile",
        explanation:
          "Oil is volatile, but a supply shock that raises prices often boosts Energy sector earnings expectations (short term).",
        impacts: {
          energy: -1.5,
          industrials: +0.4,
          tech: +0.3,
          ai_theme: +0.2,
          clean_energy: +0.6,
          staples: +0.2,
          health: +0.2,
          utilities: +0.1,
        },
      },
    ],
  },
  {
    id: 5,
    title: "Recession Warning: Leading Indicators Roll Over",
    tag: "Recession",
    blurb:
      "Multiple indicators point to slowing demand. Investors debate whether a recession is coming.",
    prompt: "If recession risk rises, what often happens to cyclicals vs defensives?",
    optimalIndex: 0,
    options: [
      {
        label: "Defensives usually hold up better; cyclicals get hit harder",
        explanation:
          "In downturns, essentials are steadier while discretionary spending and industrial activity can drop.",
        impacts: {
          staples: +0.6,
          health: +0.7,
          utilities: +0.4,
          tech: -2.4,
          industrials: -2.8,
          energy: -1.9,
          ai_theme: -2.2,
          clean_energy: -1.2,
        },
      },
      {
        label: "Cyclicals rally because prices are "cheap"",
        explanation:
          "Sometimes markets look ahead, but rising recession risk more commonly pressures cyclicals first.",
        impacts: {
          staples: -0.5,
          health: -0.4,
          utilities: -0.6,
          tech: +1.6,
          industrials: +1.8,
          energy: +1.2,
          ai_theme: +1.4,
          clean_energy: +1.1,
        },
      },
    ],
  },
  {
    id: 6,
    title: "Government Announces Clean Tech Subsidy Package",
    tag: "Policy",
    blurb:
      "A new policy package boosts incentives for renewables, grid upgrades, and EV supply chains.",
    prompt: "What's the most realistic impact profile?",
    optimalIndex: 0,
    options: [
      {
        label: "Clean energy theme benefits most; some spillover to Industrials/Utilities",
        explanation:
          "Direct beneficiaries often move the most; suppliers and infrastructure sectors can also see lift.",
        impacts: {
          clean_energy: +3.6,
          industrials: +1.1,
          utilities: +0.8,
          tech: +0.4,
          ai_theme: +0.3,
          energy: -0.6,
          staples: +0.1,
          health: +0.1,
        },
      },
      {
        label: "Nothing changes because policy takes years",
        explanation:
          "Implementation takes time, but markets often reprice expectations quickly when policy shifts are credible.",
        impacts: {
          clean_energy: +0.8,
          industrials: +0.2,
          utilities: +0.1,
          tech: +0.1,
          ai_theme: +0.1,
          energy: -0.1,
          staples: 0.0,
          health: 0.0,
        },
      },
    ],
  },
];

const formatPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

function computeDiversificationScore(picks: string[], weights: Record<string, number>) {
  const sum = picks.reduce((acc, id) => acc + (weights[id] ?? 0), 0);
  const validSum = Math.abs(sum - 100) < 0.0001;

  const maxW = Math.max(...picks.map((id) => weights[id] ?? 0));
  const notCrazyConcentrated = maxW <= 60;

  const vibes = new Set(picks.map((id) => SECTORS.find((s) => s.id === id)?.vibe).filter(Boolean));
  const hasMix = vibes.size >= 2;

  const score =
    (validSum ? 40 : 0) +
    (notCrazyConcentrated ? 30 : 10) +
    (hasMix ? 30 : 10);

  return clamp(score, 0, 100);
}

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "build" | "events" | "results">("intro");

  const [picks, setPicks] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const [eventIndex, setEventIndex] = useState(0);
  const [chosenOptionIndex, setChosenOptionIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [history, setHistory] = useState<
    {
      eventId: number;
      title: string;
      optionLabel: string;
      optimalLabel: string;
      wasOptimal: boolean;
      portfolioReturn: number;
      valueAfter: number;
    }[]
  >([]);

  const picksSum = useMemo(() => picks.reduce((acc, id) => acc + (weights[id] ?? 0), 0), [picks, weights]);

  const diversificationScore = useMemo(() => {
    if (picks.length !== 3) return 0;
    return computeDiversificationScore(picks, weights);
  }, [picks, weights]);

  const canContinueBuild =
    picks.length === 3 &&
    Math.abs(picksSum - 100) < 0.0001 &&
    picks.every((id) => (weights[id] ?? 0) >= 0);

  const currentEvent = EVENTS[eventIndex];

  const selectedOption = useMemo(() => {
    if (view !== "events") return null;
    if (chosenOptionIndex == null) return null;
    return currentEvent.options[chosenOptionIndex] ?? null;
  }, [view, chosenOptionIndex, currentEvent]);

  const breakdown = useMemo(() => {
    if (!selectedOption) return [];
    return picks.map((id) => {
      const s = SECTORS.find((x) => x.id === id)!;
      const w = (weights[id] ?? 0) / 100;
      const r = selectedOption.impacts[id] ?? 0;
      return {
        id,
        name: s.name,
        emoji: s.emoji,
        weightPct: weights[id] ?? 0,
        eventReturn: r,
        contribution: w * r,
      };
    });
  }, [selectedOption, picks, weights]);

  const portfolioRetPreview = useMemo(() => {
    if (!selectedOption) return 0;
    return breakdown.reduce((acc, b) => acc + b.contribution, 0);
  }, [selectedOption, breakdown]);

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") onBack?.();
        else if (view === "build") setView("intro");
        else if (view === "events") {
          if (!showFeedback) {
            if (eventIndex === 0) setView("build");
            else {
              const prev = history.slice(0, -1);
              const lastValue = prev.length ? prev[prev.length - 1].valueAfter : 10000;
              setHistory(prev);
              setPortfolioValue(lastValue);
              setEventIndex((i) => Math.max(0, i - 1));
              setChosenOptionIndex(null);
              setShowFeedback(false);
            }
          }
        } else if (view === "results") {
          setView("events");
        }
      }}
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

  const setWeight = (id: string, value: number) => {
    setWeights((prev) => ({ ...prev, [id]: value }));
  };

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

  const startSim = () => {
    setView("events");
    setEventIndex(0);
    setChosenOptionIndex(null);
    setShowFeedback(false);
    setPortfolioValue(10000);
    setHistory([]);
  };

  const computePortfolioReturn = (impacts: EventImpact) => {
    return picks.reduce((acc, id) => {
      const w = (weights[id] ?? 0) / 100;
      const r = impacts[id] ?? 0;
      return acc + w * r;
    }, 0);
  };

  const submitEventAnswer = () => {
    if (chosenOptionIndex == null) return;
    setShowFeedback(true);

    const impacts = currentEvent.options[chosenOptionIndex].impacts;
    const portfolioRet = computePortfolioReturn(impacts);
    const nextValue = Math.round(portfolioValue * (1 + portfolioRet / 100));
    const wasOptimal = chosenOptionIndex === currentEvent.optimalIndex;
    const optimalLabel = currentEvent.options[currentEvent.optimalIndex].label;

    setPortfolioValue(nextValue);
    setHistory((prev) => [
      ...prev,
      {
        eventId: currentEvent.id,
        title: currentEvent.title,
        optionLabel: currentEvent.options[chosenOptionIndex].label,
        optimalLabel,
        wasOptimal,
        portfolioReturn: portfolioRet,
        valueAfter: nextValue,
      },
    ]);
  };

  const nextEvent = () => {
    if (eventIndex < EVENTS.length - 1) {
      setEventIndex((i) => i + 1);
      setChosenOptionIndex(null);
      setShowFeedback(false);
    } else {
      setView("results");
    }
  };

  const finalReturnPct = useMemo(() => {
    return ((portfolioValue - 10000) / 10000) * 100;
  }, [portfolioValue]);

  const optimalCount = useMemo(() => history.filter((h) => h.wasOptimal).length, [history]);

  const performanceScore = useMemo(() => {
    if (history.length === 0) return 0;
    const worst = Math.min(...history.map((h) => h.portfolioReturn));
    const stability = clamp(100 - Math.max(0, Math.abs(Math.min(0, worst)) - 2) * 12.5, 0, 100);
    return Math.round(0.6 * diversificationScore + 0.4 * stability);
  }, [diversificationScore, history]);

  // INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 2: Apply</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Build a 3-Sector Portfolio</h1>
          <p className="text-[#4F7D96] mt-2">Then stress-test it with economic news and surprises</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧱</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Choose Your Exposure</h3>
            <p className="text-sm text-[#4F7D96]">
              Pick 3 sectors/themes and allocate weights that sum to 100%. You're building your own mini ETF.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📰</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">News Event Simulator</h3>
            <p className="text-sm text-[#4F7D96]">
              Six rounds of economic news. Predict reactions, then see how your portfolio responds — plus the optimal answer for each.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-2xl border border-sky-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 Your goal:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Build a portfolio that isn't overly concentrated</li>
            <li>• Survive shocks (rates, recession risk, policy changes)</li>
            <li>• Learn the optimal reaction to each news event</li>
          </ul>
        </div>

        <button
          onClick={() => setView("build")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Build My Portfolio
        </button>
      </div>
    );
  }

  // BUILD PORTFOLIO
  if (view === "build") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Step 1</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Pick 3 Sectors (or Themes)</h2>
            <p className="text-slate-500 mt-1">Then allocate weights so the total equals 100%</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTORS.map((s) => {
                  const active = picks.includes(s.id);
                  const vibeColor =
                    s.vibe === "defensive" ? "bg-emerald-50 border-emerald-200" :
                    s.vibe === "cyclical" ? "bg-amber-50 border-amber-200" :
                    "bg-violet-50 border-violet-200";

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
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold mt-2 border ${vibeColor}`}>
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
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">{s.description}</p>
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Typical drivers</p>
                        <div className="flex flex-wrap gap-2">
                          {s.typicalDrivers.map((d) => (
                            <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Your Portfolio Builder</h3>
              <p className="text-sm text-slate-500 mt-1">Pick exactly 3, then set weights.</p>

              <div className="mt-4 space-y-3">
                {picks.length === 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                    Select 3 sectors to begin.
                  </div>
                )}
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
                        <span className="text-xs font-bold text-slate-500">{s.vibe.toUpperCase()}</span>
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
                  <p className={`text-sm font-black ${Math.abs(picksSum - 100) < 0.0001 ? "text-emerald-600" : "text-rose-600"}`}>
                    {picksSum}%
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-1">Must equal <span className="font-bold">100%</span> to start.</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={autoBalance}
                    disabled={picks.length !== 3}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Auto-Balance
                  </button>
                  <button
                    onClick={() => { setPicks([]); setWeights({}); }}
                    className="py-2.5 px-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={startSim}
                  disabled={!canContinueBuild}
                  className="w-full py-4 bg-[#0B5E8E] text-white rounded-2xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Start News Simulation
                </button>
                {!canContinueBuild && (
                  <p className="text-xs text-slate-500 mt-2">
                    Tip: pick 3 sectors and set weights to 100%.
                  </p>
                )}
              </div>

              {picks.length === 3 && (
                <div className="mt-4 rounded-2xl p-4 border border-sky-200 bg-sky-50">
                  <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">Diversification score</p>
                  <p className="text-2xl font-black text-sky-900">{diversificationScore}/100</p>
                  <p className="text-xs text-sky-700 mt-1">
                    Higher score = less concentration + more exposure balance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // EVENTS
  if (view === "events") {
    const progressPct = ((eventIndex + (showFeedback ? 1 : 0)) / EVENTS.length) * 100;
    const option = selectedOption;
    const isOptimal = chosenOptionIndex === currentEvent.optimalIndex;

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">News Simulation</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Economic Event {eventIndex + 1} of {EVENTS.length}</h2>
            <p className="text-slate-500 mt-1">Choose the most realistic reaction — then see how your portfolio responds</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                    {currentEvent.tag}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-3">{currentEvent.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{currentEvent.blurb}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                  🗞️
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-black text-slate-900">{currentEvent.prompt}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your answer doesn't need to be "perfect." The goal is to learn patterns.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                {currentEvent.options.map((o, idx) => {
                  const picked = chosenOptionIndex === idx;
                  const isOptimalOption = idx === currentEvent.optimalIndex;

                  return (
                    <button
                      key={idx}
                      onClick={() => setChosenOptionIndex(idx)}
                      disabled={showFeedback}
                      className={[
                        "text-left p-5 rounded-2xl border transition-all relative",
                        picked ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                        showFeedback ? "cursor-default" : "cursor-pointer",
                      ].join(" ")}
                    >
                      {/* Show optimal badge after submission */}
                      {showFeedback && isOptimalOption && (
                        <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          ✓ Best Answer
                        </span>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={[
                          "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                          picked ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-600",
                          showFeedback && isOptimalOption ? "bg-emerald-500 text-white" : "",
                        ].join(" ")}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{o.label}</p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{o.explanation}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!showFeedback ? (
                <button
                  onClick={submitEventAnswer}
                  disabled={chosenOptionIndex == null}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Apply This News Event
                </button>
              ) : (
                <button
                  onClick={nextEvent}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                >
                  {eventIndex < EVENTS.length - 1 ? "Next Event" : "See Final Results"}
                </button>
              )}

              {/* Feedback panel */}
              {showFeedback && option && (
                <div className={`mt-6 p-6 rounded-3xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
                  isOptimal ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{isOptimal ? "✅" : "💡"}</span>
                    <span className={`font-black uppercase tracking-wider text-sm ${isOptimal ? "text-emerald-700" : "text-amber-800"}`}>
                      {isOptimal ? "Optimal choice!" : `Better answer: Option A`}
                    </span>
                  </div>

                  {!isOptimal && (
                    <div className="mb-4 p-4 bg-white rounded-2xl border border-emerald-200">
                      <p className="text-xs font-bold text-emerald-700 uppercase mb-1">✓ Best Answer</p>
                      <p className="text-sm font-bold text-slate-900">{currentEvent.options[currentEvent.optimalIndex].label}</p>
                      <p className="text-sm text-slate-700 mt-1">{currentEvent.options[currentEvent.optimalIndex].explanation}</p>
                    </div>
                  )}

                  <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    Your portfolio moved{" "}
                    <span className={`font-black ${portfolioRetPreview >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatPct(portfolioRetPreview)}
                    </span>
                    {" "}— here's the breakdown by holding:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {breakdown.map((b) => (
                      <div key={b.id} className="bg-white rounded-2xl p-4 border border-amber-200">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-sm">{b.emoji} {b.name}</p>
                          <p className="text-xs font-black text-slate-500">{b.weightPct}%</p>
                        </div>
                        <p className={`mt-2 text-lg font-black ${b.eventReturn >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {formatPct(b.eventReturn)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Contribution: <span className="font-bold text-slate-700">{formatPct(b.contribution)}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar HUD */}
            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Portfolio HUD</h3>
              <p className="text-sm text-slate-500 mt-1">Starting at $10,000</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Value</p>
                  <p className="text-xl font-black text-emerald-900">${portfolioValue.toLocaleString()}</p>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                  <p className="text-xs font-black uppercase text-sky-700">Diversification</p>
                  <p className="text-xl font-black text-sky-900">{diversificationScore}/100</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Your allocation</p>
                <div className="space-y-2">
                  {picks.map((id) => {
                    const s = SECTORS.find((x) => x.id === id)!;
                    const w = weights[id] ?? 0;
                    return (
                      <div key={id}>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span className="font-bold">{s.emoji} {s.name}</span>
                          <span className="font-black">{w}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0B5E8E]" style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event log with optimal answer column */}
              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Event log</p>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">No events applied yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[320px] overflow-auto pr-1">
                    {history.slice().reverse().map((h) => (
                      <div key={h.eventId} className={`p-3 rounded-xl border ${
                        h.wasOptimal ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                      }`}>
                        <p className="text-xs font-bold text-slate-700">{h.title}</p>

                        {/* What they picked */}
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <span className="text-[10px] font-black text-slate-500 uppercase mt-0.5 flex-shrink-0">You:</span>
                          <p className="text-xs text-slate-700 leading-snug">{h.optionLabel}</p>
                        </div>

                        {/* Optimal answer — always shown */}
                        <div className="mt-1 flex items-start gap-1.5">
                          <span className="text-[10px] font-black text-emerald-600 uppercase mt-0.5 flex-shrink-0">Best:</span>
                          <p className={`text-xs leading-snug ${h.wasOptimal ? "text-emerald-700 font-bold" : "text-slate-600"}`}>
                            {h.wasOptimal ? "✓ Same as your choice" : h.optimalLabel}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                          <span className={`text-xs font-black ${h.portfolioReturn >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {formatPct(h.portfolioReturn)}
                          </span>
                          <span className="text-xs font-bold text-slate-700">${h.valueAfter.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  // RESULTS
  const badge = performanceScore >= 80 ? "🏆" : performanceScore >= 60 ? "👍" : "🧭";
  const headline =
    performanceScore >= 80 ? "Strong Portfolio Design!" :
    performanceScore >= 60 ? "Solid — With Some Risks" :
    "Learning in Progress";

  const suggestion =
    performanceScore >= 80
      ? "You balanced exposures and avoided extreme concentration. This is how sector investing stays survivable."
      : performanceScore >= 60
        ? "You have a workable mix, but watch concentration and theme sizing — those can amplify drawdowns."
        : "Try adding a defensive anchor or reducing the biggest weight. Concentration makes news shocks hurt more.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Lesson 2: Sector allocation + news simulation</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Final value</p>
              <p className="text-2xl font-black text-sky-900">${portfolioValue.toLocaleString()}</p>
              <p className={`text-sm font-bold mt-1 ${finalReturnPct >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {formatPct(finalReturnPct)} total
              </p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Portfolio score</p>
              <p className="text-2xl font-black text-emerald-900">{performanceScore}/100</p>
              <p className="text-sm text-emerald-800 mt-1">Diversification + shock resilience</p>
            </div>
          </div>

          {/* Journey with optimal answers */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900">Your Journey</h3>
              <span className="text-sm font-bold text-slate-600">
                {optimalCount}/{EVENTS.length} optimal
              </span>
            </div>
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.eventId} className={`p-3 rounded-xl border ${
                  h.wasOptimal ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-700 flex-1">{h.title}</p>
                    <span className={`text-xs font-black flex-shrink-0 ${h.portfolioReturn >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatPct(h.portfolioReturn)}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-start gap-1.5">
                    <span className="text-[10px] font-black text-slate-500 uppercase mt-0.5 flex-shrink-0">You:</span>
                    <p className="text-xs text-slate-700 leading-snug">{h.optionLabel}</p>
                  </div>

                  {!h.wasOptimal && (
                    <div className="mt-1 flex items-start gap-1.5">
                      <span className="text-[10px] font-black text-emerald-600 uppercase mt-0.5 flex-shrink-0">Best:</span>
                      <p className="text-xs text-slate-600 leading-snug">{h.optimalLabel}</p>
                    </div>
                  )}
                  {h.wasOptimal && (
                    <p className="text-xs text-emerald-600 font-bold mt-1">✓ Optimal choice</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">What this taught you</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Different news hits different sectors — "market up/down" is too simple.</li>
              <li>• Concentration makes volatility louder (especially with themes).</li>
              <li>• Defensives can act like shock absorbers, not shields.</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Coach note:</strong> {suggestion}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(performanceScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue to Lesson 3
            </button>
            <button
              onClick={() => {
                setView("intro");
                setPicks([]);
                setWeights({});
                setEventIndex(0);
                setChosenOptionIndex(null);
                setShowFeedback(false);
                setPortfolioValue(10000);
                setHistory([]);
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