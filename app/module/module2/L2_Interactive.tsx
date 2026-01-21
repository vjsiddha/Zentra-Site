"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type View = "intro" | "scenarios" | "path" | "build" | "results";
type Horizon = "6m" | "2y" | "5y";
type Goal = "save" | "grow" | "learn";
type Stomach = "low" | "med" | "high";

type AssetId =
  | "broad_etf"
  | "bond_etf"
  | "gic_cash"
  | "tech_stock"
  | "energy_stock"
  | "health_stock"
  | "crypto";

type Sector = "broad" | "bonds" | "cash" | "tech" | "energy" | "health" | "crypto";

type Asset = {
  id: AssetId;
  name: string;
  subtitle: string;
  sector: Sector;
  risk: 1 | 2 | 3 | 4 | 5;
  expectedMonthly: number;
  image: string;
  tag: string;
};

type Scenario = {
  id: number;
  title: string;
  image: string;
  description: string;
  options: { id: "A" | "B" | "C"; label: string }[];
  correct: "A" | "B" | "C";
  explanation: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "You need money soon (laptop in 6 months)",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000",
    description:
      "You’re saving for a laptop and you’ll need the money in about 6 months. You still want your money to grow, but you can’t afford a big drop right before you buy it.",
    options: [
      { id: "A", label: "Mostly cash/GIC + a small diversified ETF portion" },
      { id: "B", label: "All-in on a single tech stock for higher returns" },
      { id: "C", label: "Mostly crypto because it can grow fast" },
    ],
    correct: "A",
    explanation:
      "Short horizons need stability. Cash/GIC protects the money you’ll need soon, and a small diversified ETF portion can add some growth without gambling your deadline.",
  },
  {
    id: 2,
    title: "You’re investing for 5+ years (school + first job)",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000",
    description:
      "You won’t touch this money for at least 5 years. You can handle some ups and downs if the long-term plan makes sense.",
    options: [
      { id: "A", label: "A diversified ETF core + some bonds/cash buffer" },
      { id: "B", label: "Only bonds to avoid volatility completely" },
      { id: "C", label: "Only single stocks (pick your favorite companies)" },
    ],
    correct: "A",
    explanation:
      "Over longer horizons, a diversified core usually wins. Bonds/cash can smooth swings, but going only bonds may limit growth, and only single stocks increases concentration risk.",
  },
  {
    id: 3,
    title: "You want to learn, but don’t want to blow up your money",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000",
    description:
      "You’re curious about investing and want hands-on learning. But you still want a smart plan that avoids obvious beginner traps.",
    options: [
      { id: "A", label: "A diversified ETF core + a small ‘learning slice’ (single stocks)" },
      { id: "B", label: "All single stocks so you learn faster" },
      { id: "C", label: "All cash because learning is too risky" },
    ],
    correct: "A",
    explanation:
      "Best of both worlds: a stable diversified core plus a small portion you can experiment with. You learn without risking everything on one bet.",
  },
];

const ASSETS: Asset[] = [
  {
    id: "broad_etf",
    name: "Broad Market ETF",
    subtitle: "Diversified across many companies",
    sector: "broad",
    risk: 3,
    expectedMonthly: 0.55,
    image: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1200",
    tag: "Diversification core",
  },
  {
    id: "bond_etf",
    name: "Bond ETF",
    subtitle: "Lower swings, steadier returns",
    sector: "bonds",
    risk: 2,
    expectedMonthly: 0.25,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200",
    tag: "Stability",
  },
  {
    id: "gic_cash",
    name: "GIC / High-Interest Cash",
    subtitle: "Most stable, limited upside",
    sector: "cash",
    risk: 1,
    expectedMonthly: 0.18,
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200",
    tag: "Capital protection",
  },
  {
    id: "tech_stock",
    name: "Tech Stock (single company)",
    subtitle: "High upside, high swings",
    sector: "tech",
    risk: 5,
    expectedMonthly: 0.9,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200",
    tag: "Concentration risk",
  },
  {
    id: "energy_stock",
    name: "Energy Stock (single company)",
    subtitle: "Cyclical + news-sensitive",
    sector: "energy",
    risk: 4,
    expectedMonthly: 0.75,
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200",
    tag: "Commodity exposure",
  },
  {
    id: "health_stock",
    name: "Healthcare Stock (single company)",
    subtitle: "Defensive-ish, still volatile",
    sector: "health",
    risk: 4,
    expectedMonthly: 0.7,
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1200",
    tag: "Sector bet",
  },
  {
    id: "crypto",
    name: "Crypto",
    subtitle: "Very volatile, unpredictable",
    sector: "crypto",
    risk: 5,
    expectedMonthly: 1.2,
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200",
    tag: "Speculative",
  },
];

const HEADLINES = [
  {
    id: "rate_hike",
    title: "Breaking: Interest rates rise faster than expected 📈",
    impact: (asset: Asset) => {
      if (asset.sector === "bonds") return -0.9;
      if (asset.sector === "tech") return -1.2;
      if (asset.sector === "broad") return -0.6;
      if (asset.sector === "cash") return +0.1;
      return -0.3;
    },
  },
  {
    id: "oil_spike",
    title: "Breaking: Oil prices spike after global supply news 🛢️",
    impact: (asset: Asset) => {
      if (asset.sector === "energy") return +1.4;
      if (asset.sector === "broad") return +0.2;
      if (asset.sector === "tech") return -0.4;
      return 0;
    },
  },
  {
    id: "tech_selloff",
    title: "Breaking: Big tech earnings disappoint—market selloff 💻",
    impact: (asset: Asset) => {
      if (asset.sector === "tech") return -2.0;
      if (asset.sector === "crypto") return -1.4;
      if (asset.sector === "broad") return -0.8;
      if (asset.sector === "bonds") return +0.2;
      return -0.2;
    },
  },
  {
    id: "health_breakthrough",
    title: "Breaking: Major healthcare breakthrough announced 🧬",
    impact: (asset: Asset) => {
      if (asset.sector === "health") return +1.6;
      if (asset.sector === "broad") return +0.3;
      return 0;
    },
  },
];

const SLOTS = 5;
const SLOT_WEIGHT = 100 / SLOTS;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function horizonLabel(h: Horizon) {
  if (h === "6m") return "6 months";
  if (h === "2y") return "2 years";
  return "5+ years";
}

function riskLabel(s: Stomach) {
  if (s === "low") return "Low";
  if (s === "med") return "Medium";
  return "High";
}

function goalLabel(g: Goal) {
  if (g === "save") return "Protect money";
  if (g === "grow") return "Grow money";
  return "Learn by doing";
}

function recommendedMaxSpeculative(horizon: Horizon, stomach: Stomach) {
  if (horizon === "6m") return 5;
  if (horizon === "2y") return stomach === "high" ? 10 : 5;
  return stomach === "low" ? 10 : stomach === "med" ? 15 : 20;
}

function recommendedMinDiversified(horizon: Horizon) {
  return horizon === "6m" ? 60 : horizon === "2y" ? 50 : 40;
}

function recommendedMinStability(horizon: Horizon) {
  return horizon === "6m" ? 40 : horizon === "2y" ? 25 : 10;
}

function baseMonths(horizon: Horizon) {
  if (horizon === "6m") return 6;
  if (horizon === "2y") return 24;
  return 60;
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<View>("intro");

  // Scenario part (UNCHANGED style)
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selected, setSelected] = useState<"A" | "B" | "C" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scenarioScore, setScenarioScore] = useState(0);
  const [scenarioCorrect, setScenarioCorrect] = useState<boolean[]>([]);

  // Second part (NEW) path + portfolio build
  const [horizon, setHorizon] = useState<Horizon | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [stomach, setStomach] = useState<Stomach | null>(null);

  const [slots, setSlots] = useState<(AssetId | null)[]>(Array.from({ length: SLOTS }, () => null));
  const [dragging, setDragging] = useState<AssetId | null>(null);
  const [headlineId, setHeadlineId] = useState<string | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  const [finalScore, setFinalScore] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<{ label: string; value: number; color: string }[]>([]);

  const scenario = SCENARIOS[currentScenario];

  const selectedAssets = useMemo(() => slots.filter(Boolean) as AssetId[], [slots]);

  const weightsBySector = useMemo(() => {
    const map = new Map<Sector, number>();
    for (const id of selectedAssets) {
      const a = ASSETS.find((x) => x.id === id)!;
      map.set(a.sector, (map.get(a.sector) ?? 0) + SLOT_WEIGHT);
    }
    return map;
  }, [selectedAssets]);

  const speculativePct = weightsBySector.get("crypto") ?? 0;
  const stabilityPct = (weightsBySector.get("cash") ?? 0) + (weightsBySector.get("bonds") ?? 0);
  const diversifiedPct = (weightsBySector.get("broad") ?? 0) + (weightsBySector.get("bonds") ?? 0);

  const diversificationScore = useMemo(() => {
    if (selectedAssets.length === 0) return 0;
    const sectors = Array.from(new Set(selectedAssets.map((id) => ASSETS.find((a) => a.id === id)!.sector)));
    const distinct = sectors.length;
    const maxSector = Math.max(...Array.from(weightsBySector.values()), 0);

    const distinctPts = clamp((distinct / 5) * 55, 10, 55);
    const concentrationPenalty = clamp(((maxSector - 40) / 60) * 35, 0, 35);
    const filledBonus = clamp((selectedAssets.length / SLOTS) * 10, 0, 10);

    return clamp(distinctPts + filledBonus - concentrationPenalty, 0, 70);
  }, [selectedAssets, weightsBySector]);

  const canProceedFromPath = Boolean(horizon && goal && stomach);
  const canProceedFromBuild = selectedAssets.length === SLOTS;

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") return onBack?.();
        if (view === "scenarios") {
          if (currentScenario > 0 && !showFeedback) {
            setCurrentScenario((v) => v - 1);
            setSelected(null);
            setShowFeedback(false);
            return;
          }
          setView("intro");
          return;
        }
        if (view === "path") {
          setView("scenarios");
          setCurrentScenario(SCENARIOS.length - 1);
          setSelected(null);
          setShowFeedback(false);
          return;
        }
        if (view === "build") {
          if (hasRevealed) {
            setHasRevealed(false);
            setHeadlineId(null);
            return;
          }
          setView("path");
          return;
        }
        // results
        setView("build");
      }}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  function resetBuild() {
    setSlots(Array.from({ length: SLOTS }, () => null));
    setDragging(null);
    setHeadlineId(null);
    setHasRevealed(false);
  }

  function handleDropToSlot(slotIdx: number, assetId: AssetId) {
    setSlots((prev) => {
      const next = [...prev];
      const existingIdx = next.findIndex((x) => x === assetId);
      if (existingIdx >= 0) next[existingIdx] = null;
      next[slotIdx] = assetId;
      return next;
    });
  }

  function removeFromSlot(slotIdx: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  }

  function evaluatePortfolio() {
    if (!horizon || !stomach) return;

    const maxSpec = recommendedMaxSpeculative(horizon, stomach);
    const minDiv = recommendedMinDiversified(horizon);
    const minStable = recommendedMinStability(horizon);

    const divPts = clamp((diversificationScore / 70) * 45, 0, 45);
    const diversifiedPts = diversifiedPct >= minDiv ? 20 : clamp((diversifiedPct / minDiv) * 20, 0, 20);
    const stablePts = stabilityPct >= minStable ? 20 : clamp((stabilityPct / minStable) * 20, 0, 20);

    const specPenalty = speculativePct > maxSpec ? clamp(((speculativePct - maxSpec) / 40) * 25, 0, 25) : 0;
    const maxSector = Math.max(...Array.from(weightsBySector.values()), 0);
    const concentrationPenalty = maxSector >= 80 ? 20 : maxSector >= 60 ? 10 : 0;

    const raw = divPts + diversifiedPts + stablePts - specPenalty - concentrationPenalty;
    const portfolioScore = clamp(Math.round(raw), 0, 100);

    // Blend with scenario score (scenarios matter, but portfolio build matters too)
    const scenarioPercent = Math.round((scenarioScore / SCENARIOS.length) * 100);
    const blended = Math.round(scenarioPercent * 0.55 + portfolioScore * 0.45);

    setFinalScore(blended);

    const breakdown = [
      { label: "Scenario decisions", value: Math.round(scenarioPercent * 0.55), color: "bg-emerald-500" },
      { label: "Portfolio structure", value: Math.round(portfolioScore * 0.45), color: "bg-sky-500" },
      { label: "Diversification skill", value: Math.round(divPts), color: "bg-violet-500" },
    ];

    if (specPenalty > 0) breakdown.push({ label: "Speculative overload (penalty)", value: -Math.round(specPenalty), color: "bg-red-400" });
    if (concentrationPenalty > 0) breakdown.push({ label: "Concentration (penalty)", value: -Math.round(concentrationPenalty), color: "bg-amber-400" });

    setScoreBreakdown(breakdown);
  }

  function pickHeadline() {
    const h = HEADLINES[Math.floor(Math.random() * HEADLINES.length)];
    setHeadlineId(h.id);
    return h;
  }

  // ============ VIEW: INTRO ============
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <BackButton />

        <div className="w-full text-center mb-8">
        <span className="text-sm font-bold uppercase tracking-widest">Lesson 2</span>          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Make Smart Investing Decisions</h1>
          <p className="text-[#4F7D96] mt-2">Answer scenarios → then build a portfolio that matches your timeline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scenario Challenge</h3>
            <p className="text-sm text-[#4F7D96]">Pick the safest “smart” choice based on time horizon and risk.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧺</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Build a Portfolio + Headline Test</h3>
            <p className="text-sm text-[#4F7D96]">Drag assets into a portfolio, then face a surprise news headline.</p>
          </div>
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

  // ============ VIEW: SCENARIOS (keeps the vibe of Module 8) ============
  if (view === "scenarios") {
    const progress = ((currentScenario + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 50; // first half = 0..50

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Scenario Challenge</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              What’s the smartest move?
            </h2>
            <p className="text-slate-400 text-sm mt-2">Scenario {currentScenario + 1} of {SCENARIOS.length}</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={scenario.image} alt={scenario.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="text-white text-xl font-black">{scenario.title}</h3>
              </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed mb-6">{scenario.description}</p>

            <div className="space-y-3 mb-6">
              {scenario.options.map((opt) => {
                const isSelected = selected === opt.id;
                const isCorrect = opt.id === scenario.correct;

                const base =
                  "w-full text-left p-4 rounded-2xl border-2 transition-all font-bold";

                let styles = "border-slate-100 hover:bg-slate-50";
                if (isSelected && !showFeedback) styles = "border-[#0B5E8E] bg-sky-50";
                if (showFeedback && isSelected && isCorrect) styles = "border-green-300 bg-green-50 text-green-800";
                if (showFeedback && isSelected && !isCorrect) styles = "border-red-300 bg-red-50 text-red-800";
                if (showFeedback && !isSelected && isCorrect) styles = "border-green-200 bg-green-50/50";

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    disabled={showFeedback}
                    className={`${base} ${styles}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      <span className="text-xs opacity-60">Option {opt.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div
                className={`p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                  selected === scenario.correct
                    ? "bg-green-50 border-2 border-green-200"
                    : "bg-amber-50 border-2 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{selected === scenario.correct ? "✅" : "💡"}</span>
                  <span
                    className={`font-bold uppercase tracking-wider text-sm ${
                      selected === scenario.correct ? "text-green-700" : "text-amber-700"
                    }`}
                  >
                    {selected === scenario.correct ? "Correct!" : "Close, but…"}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{scenario.explanation}</p>
              </div>
            )}

            {!showFeedback ? (
              <button
                onClick={() => {
                  if (!selected) return;
                  const correct = selected === scenario.correct;
                  setScenarioCorrect((prev) => [...prev, correct]);
                  if (correct) setScenarioScore((s) => s + 1);
                  setShowFeedback(true);
                }}
                disabled={!selected}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={() => {
                  if (currentScenario < SCENARIOS.length - 1) {
                    setCurrentScenario((v) => v + 1);
                    setSelected(null);
                    setShowFeedback(false);
                  } else {
                    setView("path");
                  }
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {currentScenario < SCENARIOS.length - 1 ? "Next Scenario" : "Continue to Portfolio Build"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ============ VIEW: PATH ============
  if (view === "path") {
    const progress = 50 + 10; // entering part 2

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Portfolio Build</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Pick your investing path</h2>
            <p className="text-slate-500 mt-1">These choices set the rules for your portfolio.</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">1) Time horizon</h3>
              <div className="space-y-2">
                {(["6m", "2y", "5y"] as Horizon[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHorizon(h)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      horizon === h ? "border-sky-500 bg-sky-50" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-slate-900">{horizonLabel(h)}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {h === "6m" ? "Short-term: protect downside." : h === "2y" ? "Balance stability + growth." : "Long-term: volatility is survivable."}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">2) Main goal</h3>
              <div className="space-y-2">
                {(["save", "grow", "learn"] as Goal[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      goal === g ? "border-emerald-500 bg-emerald-50" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-slate-900">{goalLabel(g)}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {g === "save" ? "Avoid painful losses." : g === "grow" ? "Maximize long-run growth." : "Learn safely with constraints."}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">3) Volatility tolerance</h3>
              <div className="space-y-2">
                {(["low", "med", "high"] as Stomach[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStomach(s)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      stomach === s ? "border-violet-500 bg-violet-50" : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-bold text-slate-900">{riskLabel(s)}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      {s === "low" ? "Drops stress me out." : s === "med" ? "I can handle some swings." : "I stay calm in big swings."}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <h4 className="font-bold text-amber-900 mb-2">Your constraints</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-900">
              <div className="bg-white/60 rounded-2xl p-4 border border-amber-100">
                <div className="font-bold">Max speculative</div>
                <div className="text-amber-800 mt-1">
                  {horizon && stomach ? `${recommendedMaxSpeculative(horizon, stomach)}%` : "—"}
                </div>
              </div>
              <div className="bg-white/60 rounded-2xl p-4 border border-amber-100">
                <div className="font-bold">Min diversified core</div>
                <div className="text-amber-800 mt-1">{horizon ? `${recommendedMinDiversified(horizon)}%` : "—"}</div>
              </div>
              <div className="bg-white/60 rounded-2xl p-4 border border-amber-100">
                <div className="font-bold">Min stability buffer</div>
                <div className="text-amber-800 mt-1">{horizon ? `${recommendedMinStability(horizon)}%` : "—"}</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              disabled={!canProceedFromPath}
              onClick={() => {
                resetBuild();
                setView("build");
              }}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:text-slate-500"
            >
              Continue to Drag & Drop
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ============ VIEW: BUILD ============
  if (view === "build") {
    const headline = headlineId ? HEADLINES.find((h) => h.id === headlineId)! : null;

    const maxSpec = horizon && stomach ? recommendedMaxSpeculative(horizon, stomach) : 10;
    const minDiv = horizon ? recommendedMinDiversified(horizon) : 50;
    const minStable = horizon ? recommendedMinStability(horizon) : 25;

    const constraints = [
      { label: `Speculative ≤ ${maxSpec}%`, ok: speculativePct <= maxSpec },
      { label: `Diversified core ≥ ${minDiv}%`, ok: diversifiedPct >= minDiv },
      { label: `Stability buffer ≥ ${minStable}%`, ok: stabilityPct >= minStable },
    ];

    const progress = hasRevealed ? 95 : 80;

    return (
      <div className="relative max-w-6xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Drag & Drop</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Build your portfolio (5 slots = 100%)</h2>
            <p className="text-slate-500 mt-1">Then we hit you with a surprise headline.</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
            <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Asset tray</h3>
                <button onClick={resetBuild} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition" type="button">
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ASSETS.map((a) => {
                  const used = selectedAssets.includes(a.id);
                  return (
                    <div
                      key={a.id}
                      draggable={!used}
                      onDragStart={() => setDragging(a.id)}
                      onDragEnd={() => setDragging(null)}
                      className={[
                        "rounded-2xl border overflow-hidden bg-white transition-all",
                        used ? "opacity-40 border-slate-100" : "border-slate-200 hover:shadow-md cursor-grab",
                        dragging === a.id ? "ring-2 ring-sky-400" : "",
                      ].join(" ")}
                    >
                      <div className="relative h-24">
                        <Image src={a.image} alt={a.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                          <span className="text-white text-xs font-bold uppercase tracking-wider">{a.tag}</span>
                          <span className="text-white/90 text-xs font-bold">Risk {a.risk}/5</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-bold text-slate-900">{a.name}</div>
                        <div className="text-sm text-slate-600 mt-1">{a.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
                <h3 className="font-bold text-slate-900 mb-2">Your portfolio</h3>
                <p className="text-sm text-slate-500 mb-4">Each slot is {SLOT_WEIGHT}%. No duplicates.</p>

                <div className="space-y-3">
                  {slots.map((assetId, idx) => {
                    const asset = assetId ? ASSETS.find((a) => a.id === assetId)! : null;
                    return (
                      <div
                        key={idx}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (!dragging) return;
                          handleDropToSlot(idx, dragging);
                        }}
                        className={`rounded-2xl border-2 p-4 transition-all ${
                          asset ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{asset ? asset.name : "Drop an asset here"}</div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {asset ? `${asset.tag} • Risk ${asset.risk}/5 • ${SLOT_WEIGHT}%` : "Tip: mix types + sectors"}
                              </div>
                            </div>
                          </div>

                          {asset && (
                            <button
                              type="button"
                              onClick={() => removeFromSlot(idx)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700">Filled</span>
                    <span className="text-slate-500">{selectedAssets.length}/{SLOTS}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${(selectedAssets.length / SLOTS) * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6">
                <h4 className="font-bold text-amber-900 mb-2">Constraints</h4>
                <div className="space-y-2">
                  {constraints.map((c) => (
                    <div key={c.label} className="flex items-center justify-between bg-white/60 border border-amber-100 rounded-2xl px-4 py-3">
                      <span className="text-sm font-medium text-amber-900">{c.label}</span>
                      <span className={`text-sm font-black ${c.ok ? "text-emerald-700" : "text-red-700"}`}>{c.ok ? "OK" : "Fix"}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-6">
                <h4 className="font-bold text-slate-900 mb-2">Reality check: surprise headline</h4>
                <p className="text-sm text-slate-500 mb-4">One headline can crush a sector. Diversification helps.</p>

                {!hasRevealed ? (
                  <button
                    disabled={!canProceedFromBuild}
                    onClick={() => {
                      const h = pickHeadline();
                      setHasRevealed(true);
                      setHeadlineId(h.id);
                      evaluatePortfolio();
                    }}
                    className="w-full py-4 bg-[#0B5E8E] text-white rounded-2xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    Reveal Headline + Run Test
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                      <div className="text-sm font-black text-slate-900">{headline?.title}</div>
                      <div className="text-xs text-slate-600 mt-1">Shock happens in month 1. Timeline uses your horizon.</div>
                    </div>

                    {headline && horizon && (
                      <HeadlineOutcome headline={headline} horizon={horizon} slots={slots} />
                    )}

                    <button
                      onClick={() => setView("results")}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-md hover:bg-emerald-700 transition-all"
                    >
                      See My Results
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ============ VIEW: RESULTS ============
  const emoji = finalScore >= 80 ? "🏆" : finalScore >= 60 ? "👍" : "📚";
  const title = finalScore >= 80 ? "Strong Investor Mindset!" : finalScore >= 60 ? "Good Progress!" : "Keep Practicing!";
  const blurb =
    finalScore >= 80
      ? "You’re matching time horizon + diversification really well. That’s the core skill most beginners skip."
      : finalScore >= 60
      ? "You’re getting it. The biggest upgrade now is reducing concentration risk and aligning risk with timeline."
      : "The key takeaway: your timeline sets the rules. If you need money soon, avoid big swings and concentrate less.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-6">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{emoji}</span>
          </div>

          <h2 className="text-3xl font-black mb-2 text-slate-900">{title}</h2>
          <div className="text-6xl font-black text-slate-900 mb-2">{finalScore}%</div>
          <p className="text-slate-600 text-lg mb-6 leading-relaxed">{blurb}</p>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left mb-6">
            <h3 className="font-bold text-slate-900 mb-3">Score breakdown</h3>
            <div className="space-y-3">
              {scoreBreakdown.map((b, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{b.label}</span>
                    <span className={`font-black ${b.value < 0 ? "text-red-600" : "text-slate-900"}`}>
                      {b.value > 0 ? `+${b.value}` : `${b.value}`}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${b.color}`} style={{ width: `${clamp(Math.abs(b.value), 0, 45) * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue to Lesson 3
            </button>

            <button
              onClick={() => {
                setView("intro");
                setCurrentScenario(0);
                setSelected(null);
                setShowFeedback(false);
                setScenarioScore(0);
                setScenarioCorrect([]);
                setHorizon(null);
                setGoal(null);
                setStomach(null);
                resetBuild();
                setFinalScore(0);
                setScoreBreakdown([]);
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

function HeadlineOutcome({
  headline,
  horizon,
  slots,
}: {
  headline: (typeof HEADLINES)[number];
  horizon: Horizon;
  slots: (AssetId | null)[];
}) {
  const months = baseMonths(horizon);
  const selectedAssets = (slots.filter(Boolean) as AssetId[]).map((id) => ASSETS.find((a) => a.id === id)!);

  const baselineMonthly = selectedAssets.reduce((sum, a) => sum + a.expectedMonthly, 0) / selectedAssets.length;
  const shockMonthly = selectedAssets.reduce((sum, a) => sum + headline.impact(a), 0) / selectedAssets.length;

  const start = 2000;

  const final = useMemo(() => {
    let value = start;
    value *= 1 + (baselineMonthly + shockMonthly) / 100;
    for (let m = 2; m <= months; m++) value *= 1 + baselineMonthly / 100;
    return Math.round(value);
  }, [baselineMonthly, shockMonthly, months]);

  const gain = final - start;

  const impacts = selectedAssets.map((a) => ({ name: a.name, impact: headline.impact(a) }));
  const worst = [...impacts].sort((a, b) => a.impact - b.impact)[0];
  const best = [...impacts].sort((a, b) => b.impact - a.impact)[0];

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-sky-700">Outcome</div>
          <div className="text-3xl font-black text-slate-900 mt-1">{money(final)}</div>
          <div className={`text-sm font-bold mt-1 ${gain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {gain >= 0 ? `+${money(gain)}` : `${money(gain)}`} over {months} months
          </div>
        </div>
        <div className="bg-white/70 border border-sky-100 rounded-2xl px-4 py-3 text-sm text-slate-700">
          <div>
            <strong>Baseline:</strong> {baselineMonthly.toFixed(2)}% / month
          </div>
          <div>
            <strong>Shock:</strong> {shockMonthly.toFixed(2)}% (month 1)
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white/70 border border-sky-100 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase text-slate-600">Most hurt</div>
          <div className="font-black text-slate-900 mt-1">{worst.name}</div>
          <div className="text-sm text-red-700 font-bold mt-1">{worst.impact.toFixed(2)}% shock</div>
        </div>
        <div className="bg-white/70 border border-sky-100 rounded-2xl p-4">
          <div className="text-xs font-bold uppercase text-slate-600">Most helped</div>
          <div className="font-black text-slate-900 mt-1">{best.name}</div>
          <div className={`text-sm font-bold mt-1 ${best.impact >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
            {best.impact.toFixed(2)}% shock
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-700 mt-4">
        <strong>Why this matters:</strong> diversification doesn’t stop losses — it reduces the chance one sector dominates your outcome.
      </p>
    </div>
  );
}
