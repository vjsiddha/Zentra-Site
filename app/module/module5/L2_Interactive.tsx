"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface L2Props {
  onComplete: (score: number) => void;
  onBack?: () => void;
}

/* ================= TYPES ================= */

type View = "intro" | "scenario" | "tradeoff" | "match" | "results";

type ScenarioChoice = "A" | "B" | "C";

type Scenario = {
  id: number;
  title: string;
  description: string;
  options: { id: ScenarioChoice; label: string }[];
  correct: ScenarioChoice;
  explanation: string;
};

type MatchItem = {
  id: string;
  label: string;
  correct: "HISA" | "GIC" | "TFSA";
};

/* ================= DATA ================= */

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "Emergency fund (need money anytime)",
    description:
      "You want to earn interest but need instant access in case something unexpected happens.",
    options: [
      { id: "A", label: "High-interest savings account" },
      { id: "B", label: "3-year locked GIC" },
      { id: "C", label: "Do nothing, hold cash" },
    ],
    correct: "A",
    explanation:
      "Emergency funds must be liquid. A HISA keeps money accessible while earning interest.",
  },
  {
    id: 2,
    title: "Known expense in 1 year",
    description:
      "You know exactly when you’ll need the money and don’t want surprises.",
    options: [
      { id: "A", label: "1-year GIC" },
      { id: "B", label: "Keep everything in savings" },
      { id: "C", label: "Lock into a 3-year GIC" },
    ],
    correct: "A",
    explanation:
      "Matching the lock-in period to the timeline maximizes yield without liquidity risk.",
  },
];

const MATCH_ITEMS: MatchItem[] = [
  { id: "m1", label: "Emergency fund", correct: "HISA" },
  { id: "m2", label: "Money needed next year", correct: "GIC" },
  { id: "m3", label: "Long-term cash savings", correct: "TFSA" },
];

/* ================= COMPONENT ================= */

export default function RiskFreeGame({ onComplete, onBack }: L2Props) {
  const [view, setView] = useState<View>("intro");

  // Scenario game
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selected, setSelected] = useState<ScenarioChoice | null>(null);
  const [scenarioScore, setScenarioScore] = useState(0);
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false);

  // Tradeoff slider
  const [liquidityBias, setLiquidityBias] = useState(50);

  // Match game
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [matchScore, setMatchScore] = useState(0);

  const scenario = SCENARIOS[scenarioIdx];

  /* ================= SCORING ================= */

  const finalScore = useMemo(() => {
    let score = 0;
    score += scenarioScore * 30;
    score += liquidityBias >= 40 && liquidityBias <= 60 ? 20 : 10;
    score += matchScore * 20;
    return Math.min(score, 100);
  }, [scenarioScore, liquidityBias, matchScore]);

  /* ================= VIEWS ================= */

  // ---------- INTRO ----------
  if (view === "intro") {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-20 text-center">
        <h1 className="text-3xl font-black mb-4">
          Risk-Free Investing Game
        </h1>
        <p className="text-slate-600 mb-8">
          Learn how to protect your money using HISAs, GICs, and TFSAs — without market risk.
        </p>

        <button
          onClick={() => setView("scenario")}
          className="px-10 py-4 bg-emerald-600 text-white rounded-full font-bold"
        >
          Start Game
        </button>
      </div>
    );
  }

  // ---------- SCENARIO ----------
  if (view === "scenario") {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-20">
        <h2 className="text-2xl font-bold mb-4">{scenario.title}</h2>
        <p className="text-slate-600 mb-6">{scenario.description}</p>

        <div className="space-y-3 mb-6">
          {scenario.options.map((o) => (
            <button
              key={o.id}
              disabled={showScenarioFeedback}
              onClick={() => setSelected(o.id)}
              className={`w-full p-4 rounded-xl border-2 text-left ${
                selected === o.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {showScenarioFeedback && (
          <div className="bg-slate-50 border p-4 rounded-xl mb-4">
            {selected === scenario.correct ? "✅ Correct. " : "💡 Not ideal. "}
            {scenario.explanation}
          </div>
        )}

        {!showScenarioFeedback ? (
          <button
            disabled={!selected}
            onClick={() => {
              if (selected === scenario.correct) setScenarioScore((s) => s + 1);
              setShowScenarioFeedback(true);
            }}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={() => {
              if (scenarioIdx < SCENARIOS.length - 1) {
                setScenarioIdx((i) => i + 1);
                setSelected(null);
                setShowScenarioFeedback(false);
              } else {
                setView("tradeoff");
              }
            }}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
          >
            Continue
          </button>
        )}
      </div>
    );
  }

  // ---------- LIQUIDITY VS YIELD ----------
  if (view === "tradeoff") {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-20">
        <h2 className="text-2xl font-bold mb-4">
          Liquidity vs Yield
        </h2>
        <p className="text-slate-600 mb-6">
          Move the slider to balance access vs return.
        </p>

        <input
          type="range"
          min={0}
          max={100}
          value={liquidityBias}
          onChange={(e) => setLiquidityBias(Number(e.target.value))}
          className="w-full mb-4"
        />

        <div className="flex justify-between text-sm mb-6">
          <span>Liquidity</span>
          <span>Yield</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl mb-6">
          {liquidityBias < 40 && "You’re prioritizing yield — good for known timelines."}
          {liquidityBias >= 40 && liquidityBias <= 60 && "Balanced — flexible and efficient."}
          {liquidityBias > 60 && "You’re prioritizing liquidity — good for emergencies."}
        </div>

        <button
          onClick={() => setView("match")}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
        >
          Continue
        </button>
      </div>
    );
  }

  // ---------- MATCH GAME ----------
  if (view === "match") {
    return (
      <div className="max-w-3xl mx-auto px-6 pt-20">
        <h2 className="text-2xl font-bold mb-6">
          Match the Goal to the Best Tool
        </h2>

        <div className="space-y-4 mb-6">
          {MATCH_ITEMS.map((m) => (
            <div key={m.id} className="flex items-center gap-4">
              <div className="w-48 font-bold">{m.label}</div>
              {["HISA", "GIC", "TFSA"].map((opt) => (
                <button
                  key={opt}
                  onClick={() =>
                    setMatches((prev) => ({ ...prev, [m.id]: opt }))
                  }
                  className={`px-4 py-2 rounded-lg border ${
                    matches[m.id] === opt
                      ? "bg-emerald-100 border-emerald-500"
                      : "border-slate-300"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            let score = 0;
            MATCH_ITEMS.forEach((m) => {
              if (matches[m.id] === m.correct) score += 1;
            });
            setMatchScore(score);
            setView("results");
          }}
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
        >
          See Results
        </button>
      </div>
    );
  }

  // ---------- RESULTS ----------
  return (
    <div className="max-w-3xl mx-auto px-6 pt-20 text-center">
      <h2 className="text-3xl font-black mb-4">
        {finalScore >= 80 ? "🏆 Smart Saver!" : finalScore >= 60 ? "👍 Good Progress!" : "📘 Keep Learning"}
      </h2>

      <div className="text-6xl font-black mb-4">{finalScore}%</div>

      <p className="text-slate-600 mb-8">
        Risk-free investing is about timelines, access, and tax efficiency — not chasing returns.
      </p>
      <button
  onClick={() => onComplete(finalScore)}
  className="w-full mb-3 px-10 py-4 bg-emerald-600 text-white rounded-full font-bold"
>
  Continue to Lesson 3
</button>

      <button
        onClick={() => {
          setView("intro");
          setScenarioIdx(0);
          setScenarioScore(0);
          setSelected(null);
          setShowScenarioFeedback(false);
          setLiquidityBias(50);
          setMatches({});
          setMatchScore(0);
        }}
        className="px-10 py-4 bg-emerald-600 text-white rounded-full font-bold"
      >
        Play Again
      </button>
    </div>
  );
}
