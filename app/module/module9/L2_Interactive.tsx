"use client";

import { useMemo, useState } from "react";

type MarketBucket = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

type MarketImpact = {
  [bucketId: string]: number; // % move
};

type ReleaseScenario = {
  id: number;
  title: string;
  tag: "Inflation" | "Rates" | "GDP" | "Jobs" | "Consumer" | "Policy";
  blurb: string;
  prompt: string;
  options: {
    label: string;
    explanation: string;
    impacts: MarketImpact;
    isBest: boolean;
  }[];
};

const BUCKETS: MarketBucket[] = [
  {
    id: "growth_stocks",
    name: "Growth Stocks",
    emoji: "📈",
    description: "Rate-sensitive companies whose valuations depend heavily on future earnings.",
  },
  {
    id: "defensive_stocks",
    name: "Defensive Stocks",
    emoji: "🛡️",
    description: "More stable businesses like staples and healthcare that usually swing less.",
  },
  {
    id: "bonds",
    name: "Bonds",
    emoji: "🏦",
    description: "Fixed-income assets that often react strongly to interest-rate expectations.",
  },
  {
    id: "commodities",
    name: "Commodities",
    emoji: "⛽",
    description: "Assets like oil and raw materials that respond to inflation and growth expectations.",
  },
];

const SCENARIOS: ReleaseScenario[] = [
  {
    id: 1,
    title: "CPI Report: Inflation Comes in Higher Than Expected",
    tag: "Inflation",
    blurb:
      "The monthly inflation report shows prices are still rising faster than economists forecast.",
    prompt:
      "What is the most likely immediate market reaction?",
    options: [
      {
        label: "Growth stocks and bonds fall as investors expect higher-for-longer interest rates",
        explanation:
          "Hot inflation usually pushes investors to expect tighter monetary policy. That often hurts both bonds and rate-sensitive growth stocks.",
        isBest: true,
        impacts: {
          growth_stocks: -2.8,
          defensive_stocks: -0.9,
          bonds: -2.1,
          commodities: +1.3,
        },
      },
      {
        label: "Everything rallies because inflation means companies can charge more",
        explanation:
          "Some firms can pass through price increases, but hotter inflation usually raises concern about interest rates and valuation pressure.",
        isBest: false,
        impacts: {
          growth_stocks: +1.2,
          defensive_stocks: +0.8,
          bonds: +0.6,
          commodities: +0.2,
        },
      },
      {
        label: "Only bonds move while stocks ignore the report",
        explanation:
          "Inflation surprises often affect both fixed income and equities because they shift expectations for rates and growth.",
        isBest: false,
        impacts: {
          growth_stocks: -0.2,
          defensive_stocks: 0.0,
          bonds: -1.4,
          commodities: +0.2,
        },
      },
    ],
  },
  {
    id: 2,
    title: "Central Bank Cuts Rates Earlier Than Expected",
    tag: "Rates",
    blurb:
      "The central bank unexpectedly lowers interest rates, signaling concern about slowing growth but also easier borrowing conditions.",
    prompt:
      "Which reaction is most realistic right away?",
    options: [
      {
        label: "Growth stocks and bonds rise because lower rates boost valuations",
        explanation:
          "Lower rates often help both bonds and growth stocks by reducing discount rates and easing financial conditions.",
        isBest: true,
        impacts: {
          growth_stocks: +3.0,
          defensive_stocks: +1.0,
          bonds: +2.3,
          commodities: +0.6,
        },
      },
      {
        label: "Defensive stocks fall sharply because lower rates make them irrelevant",
        explanation:
          "Defensives do not become irrelevant. They may lag a rally, but a sharp collapse is not the typical immediate response.",
        isBest: false,
        impacts: {
          growth_stocks: +0.8,
          defensive_stocks: -2.5,
          bonds: +0.4,
          commodities: +0.2,
        },
      },
      {
        label: "Markets crash because lower rates always signal panic",
        explanation:
          "Cuts can sometimes reflect weakness, but the immediate reaction often depends on whether easier policy outweighs recession fears.",
        isBest: false,
        impacts: {
          growth_stocks: -2.1,
          defensive_stocks: -1.2,
          bonds: -0.8,
          commodities: -1.0,
        },
      },
    ],
  },
  {
    id: 3,
    title: "GDP Growth Beats Expectations",
    tag: "GDP",
    blurb:
      "Quarterly GDP growth comes in stronger than expected, suggesting economic activity is accelerating.",
    prompt:
      "What is the most likely market interpretation?",
    options: [
      {
        label: "Cyclically sensitive assets benefit, while bonds may weaken on stronger-growth expectations",
        explanation:
          "Stronger GDP often helps equities tied to growth, but can pressure bonds if markets expect fewer rate cuts.",
        isBest: true,
        impacts: {
          growth_stocks: +1.7,
          defensive_stocks: +0.6,
          bonds: -1.0,
          commodities: +1.5,
        },
      },
      {
        label: "All assets rise equally because good economic news helps everything",
        explanation:
          "Markets rarely move equally. Strong growth can help stocks and commodities while hurting bonds.",
        isBest: false,
        impacts: {
          growth_stocks: +1.0,
          defensive_stocks: +1.0,
          bonds: +1.0,
          commodities: +1.0,
        },
      },
      {
        label: "Defensive stocks surge most because investors want safety",
        explanation:
          "When growth surprises on the upside, more economically sensitive assets usually benefit more than defensives.",
        isBest: false,
        impacts: {
          growth_stocks: +0.3,
          defensive_stocks: +2.0,
          bonds: +0.2,
          commodities: +0.1,
        },
      },
    ],
  },
  {
    id: 4,
    title: "Jobs Report: Unemployment Rises Unexpectedly",
    tag: "Jobs",
    blurb:
      "The labor market weakens more than expected. Unemployment rises and payroll growth slows.",
    prompt:
      "Which market reaction is most plausible?",
    options: [
      {
        label: "Defensives and bonds hold up better, while growth-sensitive assets may weaken",
        explanation:
          "A softer labor market often increases recession concerns. Bonds may benefit if investors expect lower rates later.",
        isBest: true,
        impacts: {
          growth_stocks: -1.9,
          defensive_stocks: +0.4,
          bonds: +1.6,
          commodities: -1.1,
        },
      },
      {
        label: "Commodities rally because unemployment is good for raw materials",
        explanation:
          "Weaker jobs data usually points to slower demand, which is not typically supportive for commodities right away.",
        isBest: false,
        impacts: {
          growth_stocks: -0.2,
          defensive_stocks: 0.0,
          bonds: -0.3,
          commodities: +2.0,
        },
      },
      {
        label: "All stocks rally because weaker jobs guarantees a perfect soft landing",
        explanation:
          "Sometimes weak data can help if it reduces rate pressure, but rising unemployment often raises growth concerns too.",
        isBest: false,
        impacts: {
          growth_stocks: +1.4,
          defensive_stocks: +1.2,
          bonds: -0.5,
          commodities: +0.8,
        },
      },
    ],
  },
  {
    id: 5,
    title: "Retail Sales Miss Expectations",
    tag: "Consumer",
    blurb:
      "Consumer spending slows materially, suggesting households are becoming more cautious.",
    prompt:
      "How do markets often interpret this kind of miss?",
    options: [
      {
        label: "It raises concern about weaker growth, which can help bonds but pressure risk assets",
        explanation:
          "Consumer spending is a major growth driver. Weak retail sales often weigh on risk sentiment and support bonds.",
        isBest: true,
        impacts: {
          growth_stocks: -1.4,
          defensive_stocks: -0.3,
          bonds: +1.1,
          commodities: -0.8,
        },
      },
      {
        label: "It is automatically bullish because consumers will save more money",
        explanation:
          "Markets usually view weaker spending as a sign of softer growth, not immediate strength.",
        isBest: false,
        impacts: {
          growth_stocks: +1.3,
          defensive_stocks: +0.8,
          bonds: -0.7,
          commodities: +0.9,
        },
      },
      {
        label: "Only defensive stocks fall because they depend on consumer demand",
        explanation:
          "Defensives often hold up relatively better because much of their demand is more stable.",
        isBest: false,
        impacts: {
          growth_stocks: -0.1,
          defensive_stocks: -1.8,
          bonds: +0.2,
          commodities: -0.2,
        },
      },
    ],
  },
  {
    id: 6,
    title: "Central Bank Signals Rates Likely Stay High for Longer",
    tag: "Policy",
    blurb:
      "Officials say inflation progress is uneven and further patience is needed before rate cuts.",
    prompt:
      "What is the most realistic near-term reaction?",
    options: [
      {
        label: "Rate-sensitive assets struggle, while defensives may be relatively more resilient",
        explanation:
          "Higher-for-longer policy usually weighs on growth stocks and bonds, while defensives may decline less.",
        isBest: true,
        impacts: {
          growth_stocks: -2.5,
          defensive_stocks: -0.8,
          bonds: -1.7,
          commodities: +0.3,
        },
      },
      {
        label: "Everything rallies because certainty is always bullish",
        explanation:
          "Certainty can help, but higher-for-longer policy usually tightens financial conditions and pressures valuations.",
        isBest: false,
        impacts: {
          growth_stocks: +1.8,
          defensive_stocks: +1.5,
          bonds: +1.2,
          commodities: +0.4,
        },
      },
      {
        label: "Only commodities fall while stocks and bonds stay unchanged",
        explanation:
          "Policy guidance shifts expectations across many asset classes, not just one.",
        isBest: false,
        impacts: {
          growth_stocks: 0.0,
          defensive_stocks: 0.0,
          bonds: 0.0,
          commodities: -1.1,
        },
      },
    ],
  },
];

const formatPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "allocator" | "scenarios" | "results">("intro");

  const [weights, setWeights] = useState<Record<string, number>>({
    growth_stocks: 25,
    defensive_stocks: 25,
    bonds: 25,
    commodities: 25,
  });

  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [portfolioValue, setPortfolioValue] = useState(10000);
  const [history, setHistory] = useState<
    { id: number; title: string; option: string; portfolioReturn: number; valueAfter: number; correct: boolean }[]
  >([]);

  const totalWeight = useMemo(
    () => Object.values(weights).reduce((sum, val) => sum + val, 0),
    [weights]
  );

  const canStart = totalWeight === 100;

  const currentScenario = SCENARIOS[scenarioIndex];

  const selectedScenarioOption =
    selectedOption != null ? currentScenario.options[selectedOption] : null;

  const breakdown = useMemo(() => {
    if (!selectedScenarioOption) return [];
    return BUCKETS.map((bucket) => {
      const weightPct = weights[bucket.id] ?? 0;
      const move = selectedScenarioOption.impacts[bucket.id] ?? 0;
      return {
        ...bucket,
        weightPct,
        move,
        contribution: (weightPct / 100) * move,
      };
    });
  }, [selectedScenarioOption, weights]);

  const previewReturn = useMemo(() => {
    return breakdown.reduce((sum, item) => sum + item.contribution, 0);
  }, [breakdown]);

  const scorePct = useMemo(() => {
    if (history.length === 0) return 0;
    const correct = history.filter((h) => h.correct).length;
    return Math.round((correct / SCENARIOS.length) * 100);
  }, [history]);

  const diversificationScore = useMemo(() => {
    const vals = Object.values(weights);
    const maxWeight = Math.max(...vals);
    const minWeight = Math.min(...vals);
    const spreadBonus = maxWeight <= 40 ? 100 : maxWeight <= 50 ? 80 : 60;
    const balanceBonus = minWeight >= 10 ? 100 : minWeight >= 5 ? 80 : 60;
    return Math.round((spreadBonus + balanceBonus) / 2);
  }, [weights]);

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") onBack?.();
        else if (view === "allocator") setView("intro");
        else if (view === "scenarios") {
          if (!showFeedback) {
            if (scenarioIndex === 0) {
              setView("allocator");
            } else {
              const prevHistory = history.slice(0, -1);
              const previousValue = prevHistory.length
                ? prevHistory[prevHistory.length - 1].valueAfter
                : 10000;
              setHistory(prevHistory);
              setPortfolioValue(previousValue);
              setScenarioIndex((s) => Math.max(0, s - 1));
              setSelectedOption(null);
              setShowFeedback(false);
            }
          }
        } else if (view === "results") {
          setView("scenarios");
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

  const applyPreset = (preset: "balanced" | "risk_on" | "defensive" | "inflation_hedge") => {
    if (preset === "balanced") {
      setWeights({
        growth_stocks: 30,
        defensive_stocks: 25,
        bonds: 30,
        commodities: 15,
      });
    }
    if (preset === "risk_on") {
      setWeights({
        growth_stocks: 50,
        defensive_stocks: 15,
        bonds: 15,
        commodities: 20,
      });
    }
    if (preset === "defensive") {
      setWeights({
        growth_stocks: 15,
        defensive_stocks: 35,
        bonds: 40,
        commodities: 10,
      });
    }
    if (preset === "inflation_hedge") {
      setWeights({
        growth_stocks: 20,
        defensive_stocks: 20,
        bonds: 20,
        commodities: 40,
      });
    }
  };

  const setWeight = (id: string, value: number) => {
    setWeights((prev) => ({ ...prev, [id]: value }));
  };

  const startSimulation = () => {
    setPortfolioValue(10000);
    setHistory([]);
    setScenarioIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setView("scenarios");
  };

  const computePortfolioReturn = (impacts: MarketImpact) => {
    return BUCKETS.reduce((sum, bucket) => {
      const weight = (weights[bucket.id] ?? 0) / 100;
      const move = impacts[bucket.id] ?? 0;
      return sum + weight * move;
    }, 0);
  };

  const submitAnswer = () => {
    if (selectedOption == null) return;

    const chosen = currentScenario.options[selectedOption];
    const portfolioReturn = computePortfolioReturn(chosen.impacts);
    const nextValue = Math.round(portfolioValue * (1 + portfolioReturn / 100));

    setPortfolioValue(nextValue);
    setHistory((prev) => [
      ...prev,
      {
        id: currentScenario.id,
        title: currentScenario.title,
        option: chosen.label,
        portfolioReturn,
        valueAfter: nextValue,
        correct: chosen.isBest,
      },
    ]);
    setShowFeedback(true);
  };

  const goNext = () => {
    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex((s) => s + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setView("results");
    }
  };

  const finalReturn = ((portfolioValue - 10000) / 10000) * 100;

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            Lesson 2: Apply
          </p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">
            Build a Market-Ready Mix
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Allocate across asset buckets, then react to real-world economic releases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Build Your Allocation</h3>
            <p className="text-sm text-[#4F7D96]">
              Decide how much to place in growth stocks, defensives, bonds, and commodities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📰</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interpret Economic Releases</h3>
            <p className="text-sm text-[#4F7D96]">
              Read market-moving headlines and choose the most realistic reaction before seeing what happens.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-2xl border border-sky-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 Your challenge:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Build an allocation that can handle different macro environments</li>
            <li>• Interpret inflation, rate, GDP, and labor data correctly</li>
            <li>• See how your economic reasoning affects portfolio outcomes</li>
          </ul>
        </div>

        <button
          onClick={() => setView("allocator")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start the Simulation
        </button>
      </div>
    );
  }

  if (view === "allocator") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Step 1</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Build Your Market Allocation</h2>
            <p className="text-slate-500 mt-1">Set weights that add up to 100%</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BUCKETS.map((bucket) => (
                <div
                  key={bucket.id}
                  className="rounded-3xl p-6 border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                      {bucket.emoji}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{bucket.name}</p>
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        {bucket.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Weight</span>
                      <span className="font-black text-slate-800">{weights[bucket.id]}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={weights[bucket.id]}
                      onChange={(e) => setWeight(bucket.id, Number(e.target.value))}
                      className="w-full accent-[#0B5E8E]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Your Allocation</h3>
              <p className="text-sm text-slate-500 mt-1">Make your weights sum to 100%.</p>

              <div className="mt-4 space-y-3">
                {BUCKETS.map((bucket) => (
                  <div key={bucket.id}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span className="font-bold">
                        {bucket.emoji} {bucket.name}
                      </span>
                      <span className="font-black">{weights[bucket.id]}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0B5E8E]"
                        style={{ width: `${weights[bucket.id]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className={`font-black ${totalWeight === 100 ? "text-emerald-600" : "text-rose-600"}`}>
                    {totalWeight}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  You need exactly 100% to continue.
                </p>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Quick presets
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyPreset("balanced")}
                    className="py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200"
                  >
                    Balanced
                  </button>
                  <button
                    onClick={() => applyPreset("risk_on")}
                    className="py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200"
                  >
                    Risk-On
                  </button>
                  <button
                    onClick={() => applyPreset("defensive")}
                    className="py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200"
                  >
                    Defensive
                  </button>
                  <button
                    onClick={() => applyPreset("inflation_hedge")}
                    className="py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200"
                  >
                    Inflation
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl p-4 border border-sky-200 bg-sky-50">
                <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
                  Balance score
                </p>
                <p className="text-2xl font-black text-sky-900">{diversificationScore}/100</p>
                <p className="text-xs text-sky-700 mt-1">
                  Higher score = more balanced and less concentrated.
                </p>
              </div>

              <button
                onClick={startSimulation}
                disabled={!canStart}
                className="w-full mt-5 py-4 bg-[#0B5E8E] text-white rounded-2xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Start Economic Releases
              </button>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  if (view === "scenarios") {
    const progressPct = ((scenarioIndex + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 100;

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Economic Release Simulator</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </h2>
            <p className="text-slate-500 mt-1">
              Pick the most realistic market reaction, then see how your allocation performs
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                    {currentScenario.tag}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-3">{currentScenario.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{currentScenario.blurb}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                  🗞️
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-black text-slate-900">{currentScenario.prompt}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Think like an investor: what changes in expectations?
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                {currentScenario.options.map((option, idx) => {
                  const picked = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      disabled={showFeedback}
                      className={[
                        "text-left p-5 rounded-2xl border transition-all",
                        picked ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                        showFeedback ? "cursor-default" : "cursor-pointer",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                            picked ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{option.label}</p>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {option.explanation}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!showFeedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedOption == null}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Lock In My Answer
                </button>
              ) : (
                <button
                  onClick={goNext}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                >
                  {scenarioIndex < SCENARIOS.length - 1 ? "Next Release" : "See Final Results"}
                </button>
              )}

              {showFeedback && selectedScenarioOption && (
                <div className="mt-6 p-6 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                      {selectedScenarioOption.isBest ? "✅" : "💡"}
                    </span>
                    <span className="font-black uppercase tracking-wider text-sm text-amber-800">
                      {selectedScenarioOption.isBest ? "Best interpretation" : "Review the logic"}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    Your portfolio moved{" "}
                    <span className={`font-black ${previewReturn >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatPct(previewReturn)}
                    </span>
                    . That reflects how your chosen allocation interacts with this economic surprise.
                  </p>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {breakdown.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl p-4 border border-amber-200">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-sm">
                            {item.emoji} {item.name}
                          </p>
                          <p className="text-xs font-black text-slate-500">{item.weightPct}%</p>
                        </div>
                        <p className={`mt-2 text-lg font-black ${item.move >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                          {formatPct(item.move)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Contribution: <span className="font-bold text-slate-700">{formatPct(item.contribution)}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Market Dashboard</h3>
              <p className="text-sm text-slate-500 mt-1">Starting portfolio: $10,000</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Value</p>
                  <p className="text-xl font-black text-emerald-900">${portfolioValue.toLocaleString()}</p>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                  <p className="text-xs font-black uppercase text-sky-700">Accuracy</p>
                  <p className="text-xl font-black text-sky-900">{scorePct}%</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Your allocation
                </p>
                <div className="space-y-2">
                  {BUCKETS.map((bucket) => {
                    const w = weights[bucket.id];
                    return (
                      <div key={bucket.id}>
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span className="font-bold">{bucket.emoji} {bucket.name}</span>
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

              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Release log</p>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">No releases applied yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[280px] overflow-auto pr-1">
                    {history
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <div key={entry.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="text-xs font-bold text-slate-700">{entry.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{entry.option}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs font-black ${entry.portfolioReturn >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                              {formatPct(entry.portfolioReturn)}
                            </span>
                            <span className="text-xs font-bold text-slate-700">${entry.valueAfter.toLocaleString()}</span>
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

  const badge = scorePct >= 80 ? "🏆" : scorePct >= 60 ? "👍" : "📚";
  const headline =
    scorePct >= 80 ? "Market Interpreter!" :
    scorePct >= 60 ? "Solid Economic Reasoning" :
    "Keep Practicing";

  const coachSummary =
    scorePct >= 80
      ? "You’re doing a strong job connecting economic releases to likely market moves."
      : scorePct >= 60
      ? "You understand the basics well — keep sharpening how expectations affect different asset buckets."
      : "Review how inflation, rates, and growth shift expectations across stocks, bonds, and commodities.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Lesson 2: Economic releases + market reactions</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-sky-50 rounded-2xl p-5 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Final value</p>
              <p className="text-2xl font-black text-sky-900">${portfolioValue.toLocaleString()}</p>
              <p className={`text-sm font-bold mt-1 ${finalReturn >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {formatPct(finalReturn)} total
              </p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Interpretation score</p>
              <p className="text-2xl font-black text-emerald-900">{scorePct}%</p>
              <p className="text-sm text-emerald-800 mt-1">Correct market logic</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">What this taught you</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Markets react to surprises, not just headlines</li>
              <li>• Higher rates usually pressure bonds and growth assets</li>
              <li>• Weak growth data can help bonds but hurt risk-sensitive assets</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Coach note:</strong> {coachSummary}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(scorePct)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue to Lesson 3
            </button>
            <button
              onClick={() => {
                setView("intro");
                setWeights({
                  growth_stocks: 25,
                  defensive_stocks: 25,
                  bonds: 25,
                  commodities: 25,
                });
                setScenarioIndex(0);
                setSelectedOption(null);
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