"use client";

import { useMemo, useState } from "react";

type RiskProfile = "conservative" | "balanced" | "aggressive";

type AllocationKey = "stocks" | "etfs" | "gics" | "cash";

type Portfolio = Record<AllocationKey, number>;

const TOTAL_TO_INVEST = 2000;

const ASSETS: {
  key: AllocationKey;
  name: string;
  blurb: string;
  riskTag: "Low" | "Medium" | "High";
  feeHint: string;
}[] = [
  {
    key: "stocks",
    name: "Stocks",
    blurb: "High upside, high volatility. You're buying ownership in a company.",
    riskTag: "High",
    feeHint: "Typically no MER, but you may pay trading fees/spreads.",
  },
  {
    key: "etfs",
    name: "ETFs",
    blurb: "A basket of assets (often diversified). Trades like a stock.",
    riskTag: "Medium",
    feeHint: "Low MER is common (e.g., 0.05%–0.30%).",
  },
  {
    key: "gics",
    name: "GICs",
    blurb: "Locked-in savings. Predictable returns, limited growth potential.",
    riskTag: "Low",
    feeHint: "No MER; your return is the interest rate.",
  },
  {
    key: "cash",
    name: "Cash",
    blurb: "Safest short-term, but inflation can quietly shrink buying power.",
    riskTag: "Low",
    feeHint: "No MER; opportunity cost is the risk.",
  },
];

// --- Mock monthly return sets (6 months) ---
// These are intentionally NOT “too perfect”: realistic-ish bumps, not always up.
const RETURNS_BY_PROFILE: Record<
  RiskProfile,
  Record<AllocationKey, number[]>
> = {
  conservative: {
    stocks: [0.6, -1.2, 0.9, 0.2, -0.4, 0.7],
    etfs: [0.4, -0.7, 0.6, 0.3, -0.2, 0.5],
    gics: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
    cash: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  },
  balanced: {
    stocks: [1.2, -2.4, 1.8, 0.6, -0.9, 1.1],
    etfs: [0.8, -1.3, 1.0, 0.5, -0.6, 0.9],
    gics: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
    cash: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  },
  aggressive: {
    stocks: [2.1, -4.6, 2.9, 1.0, -2.0, 1.8],
    etfs: [1.3, -2.8, 1.7, 0.8, -1.2, 1.2],
    gics: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25],
    cash: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  },
};

const PRESETS: { name: string; profile: RiskProfile; portfolio: Portfolio }[] = [
  {
    name: "Conservative",
    profile: "conservative",
    portfolio: { stocks: 200, etfs: 600, gics: 1000, cash: 200 },
  },
  {
    name: "Balanced",
    profile: "balanced",
    portfolio: { stocks: 600, etfs: 900, gics: 400, cash: 100 },
  },
  {
    name: "Aggressive",
    profile: "aggressive",
    portfolio: { stocks: 1200, etfs: 700, gics: 50, cash: 50 },
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function sumPortfolio(p: Portfolio) {
  return p.stocks + p.etfs + p.gics + p.cash;
}

function normalizeToTotal(p: Portfolio, total: number): Portfolio {
  const s = sumPortfolio(p);
  if (s === 0) return { stocks: 0, etfs: 0, gics: 0, cash: total };

  // Scale, then fix rounding drift on cash.
  const scaled: Portfolio = {
    stocks: Math.round((p.stocks / s) * total),
    etfs: Math.round((p.etfs / s) * total),
    gics: Math.round((p.gics / s) * total),
    cash: Math.round((p.cash / s) * total),
  };
  const drift = total - sumPortfolio(scaled);
  return { ...scaled, cash: scaled.cash + drift };
}

function diversificationScore(p: Portfolio) {
  // Herfindahl-Hirschman Index-ish -> convert to 0-100.
  const total = sumPortfolio(p) || 1;
  const w = (k: AllocationKey) => p[k] / total;
  const hhi = w("stocks") ** 2 + w("etfs") ** 2 + w("gics") ** 2 + w("cash") ** 2; // 0.25..1
  const score = (1 - (hhi - 0.25) / 0.75) * 100;
  return clamp(Math.round(score), 0, 100);
}

function riskMeter(p: Portfolio) {
  // Weighted risk: stocks=1.0, etfs=0.65, gics=0.15, cash=0.05
  const total = sumPortfolio(p) || 1;
  const r =
    (p.stocks / total) * 1.0 +
    (p.etfs / total) * 0.65 +
    (p.gics / total) * 0.15 +
    (p.cash / total) * 0.05;

  const score = clamp(Math.round(r * 100), 0, 100);
  let label: "Low" | "Medium" | "High" = "Medium";
  if (score < 35) label = "Low";
  if (score > 70) label = "High";
  return { score, label };
}

function simulateSixMonths(portfolio: Portfolio, profile: RiskProfile) {
  const months = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"];
  const returns = RETURNS_BY_PROFILE[profile];

  let valueByAsset: Record<AllocationKey, number> = { ...portfolio };
  const timeline: {
    month: string;
    totalValue: number;
    monthReturnPct: number;
    breakdown: Record<AllocationKey, number>;
  }[] = [];

  let prevTotal = sumPortfolio(portfolio);

  for (let i = 0; i < 6; i++) {
    (Object.keys(valueByAsset) as AllocationKey[]).forEach((k) => {
      const r = returns[k][i] / 100;
      valueByAsset[k] = valueByAsset[k] * (1 + r);
    });

    const totalValue =
      valueByAsset.stocks + valueByAsset.etfs + valueByAsset.gics + valueByAsset.cash;

    const monthReturnPct = ((totalValue - prevTotal) / prevTotal) * 100;
    prevTotal = totalValue;

    timeline.push({
      month: months[i],
      totalValue: Math.round(totalValue),
      monthReturnPct: Number(monthReturnPct.toFixed(2)),
      breakdown: {
        stocks: Math.round(valueByAsset.stocks),
        etfs: Math.round(valueByAsset.etfs),
        gics: Math.round(valueByAsset.gics),
        cash: Math.round(valueByAsset.cash),
      },
    });
  }

  const start = sumPortfolio(portfolio);
  const end = timeline[timeline.length - 1]?.totalValue ?? start;
  const net = end - start;
  const netPct = (net / start) * 100;

  return {
    start,
    end,
    net,
    netPct: Number(netPct.toFixed(2)),
    timeline,
  };
}

export default function L3_Applying({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<
    "intro" | "build" | "simulate" | "compare" | "reflection" | "complete"
  >("intro");

  const [selectedProfile, setSelectedProfile] = useState<RiskProfile>("balanced");
  const [portfolio, setPortfolio] = useState<Portfolio>({
    stocks: 500,
    etfs: 900,
    gics: 450,
    cash: 150,
  });

  const [monthIndex, setMonthIndex] = useState(0);

  const [reflection1, setReflection1] = useState("");
  const [reflection2, setReflection2] = useState("");
  const [showInsights, setShowInsights] = useState(false);

  // Keep portfolio always exactly $2000.
  const safePortfolio = useMemo(
    () => normalizeToTotal(portfolio, TOTAL_TO_INVEST),
    [portfolio]
  );

  const risk = useMemo(() => riskMeter(safePortfolio), [safePortfolio]);
  const divScore = useMemo(() => diversificationScore(safePortfolio), [safePortfolio]);

  const sim = useMemo(
    () => simulateSixMonths(safePortfolio, selectedProfile),
    [safePortfolio, selectedProfile]
  );

  const presetResults = useMemo(() => {
    return PRESETS.map((p) => {
      const normalized = normalizeToTotal(p.portfolio, TOTAL_TO_INVEST);
      const res = simulateSixMonths(normalized, p.profile);
      return { ...p, normalized, res };
    });
  }, []);

  // --- Back nav ---
  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "build") setView("intro");
    else if (view === "simulate") setView("build");
    else if (view === "compare") setView("simulate");
    else if (view === "reflection") setView("compare");
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

  const showBackButton = view !== "complete";

  // --- Helpers for allocation UI ---
  const setAsset = (key: AllocationKey, value: number) => {
    const v = clamp(Math.round(value), 0, TOTAL_TO_INVEST);
    setPortfolio((prev) => normalizeToTotal({ ...prev, [key]: v }, TOTAL_TO_INVEST));
  };

  // VIEW 1: INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        {showBackButton && <BackButton />}

        <div className="w-full text-center mb-8">
      <span className="text-sm font-bold uppercase tracking-widest">Lesson 3</span>          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Simulate Investing $2,000</h1>
          <p className="text-[#4F7D96] mt-2">
            Build a portfolio, run a 6-month mock market, then reflect on whether your choices fit your archetype.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Build a Portfolio</h3>
            <p className="text-sm text-[#4F7D96]">
              Allocate $2,000 across Stocks, ETFs, GICs, and Cash. You’ll see a risk meter + diversification score update live.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Watch 6 Months of Returns</h3>
            <p className="text-sm text-[#4F7D96]">
              Use mock market data and track gains/losses month-by-month. Then compare your result to conservative, balanced, and aggressive strategies.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-sky-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 What you’re practicing (not “basic”):</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• The tradeoff between <strong>expected return</strong> and <strong>volatility</strong></li>
            <li>• Why <strong>diversification</strong> reduces *single-asset* risk (but not all risk)</li>
            <li>• How <strong>time horizon</strong> changes what “good risk” looks like</li>
            <li>• How strategy performance can differ across short periods (6 months ≠ forever)</li>
          </ul>
        </div>

        <button
          onClick={() => setView("build")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Building
        </button>
      </div>
    );
  }

  // VIEW 2: BUILD
  if (view === "build") {
    const total = sumPortfolio(safePortfolio);

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs">Build</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Create Your $2,000 Portfolio</h2>
            <p className="text-slate-500 mt-1">Adjust amounts. The total always stays at ${TOTAL_TO_INVEST.toLocaleString()}.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Controls */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-md border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900">Allocations</h3>
                  <p className="text-sm text-slate-500">Think: risk vs return + time horizon.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Market mood:</span>
                  <select
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value as RiskProfile)}
                    className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent"
                  >
                    <option value="conservative">Lower volatility</option>
                    <option value="balanced">Mixed volatility</option>
                    <option value="aggressive">Higher volatility</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {ASSETS.map((a) => (
                  <div key={a.key} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{a.name}</h4>
                          <span
                            className={[
                              "text-[11px] px-2 py-0.5 rounded-full border",
                              a.riskTag === "High"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : a.riskTag === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200",
                            ].join(" ")}
                          >
                            {a.riskTag} risk
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{a.blurb}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          <strong className="text-slate-600">Fee note:</strong> {a.feeHint}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-2xl font-black text-[#0B5E8E]">${safePortfolio[a.key].toLocaleString()}</p>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={TOTAL_TO_INVEST}
                      step={50}
                      value={safePortfolio[a.key]}
                      onChange={(e) => setAsset(a.key, Number(e.target.value))}
                      className="w-full mt-4 accent-[#0B5E8E]"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between bg-white rounded-2xl p-5 border border-slate-200">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-xl font-black text-slate-900">${total.toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setSelectedProfile(p.profile);
                        setPortfolio(normalizeToTotal(p.portfolio, TOTAL_TO_INVEST));
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Metrics */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-3">Portfolio Metrics</h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700">Risk meter</span>
                    <span className="text-slate-500">{risk.label}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all"
                      style={{ width: `${risk.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    This is a simplified estimate based on what you hold—not a guarantee.
                  </p>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-slate-700">Diversification</span>
                    <span className="text-slate-500">{divScore}/100</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all"
                      style={{ width: `${divScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Higher isn’t always “better” — it depends on goals and time horizon.
                  </p>
                </div>
              </div>

              <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
                <h3 className="font-bold text-slate-900 mb-2">Before you simulate…</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• A 6-month result can be misleading (short-term noise).</li>
                  <li>• Volatility ≠ “bad” if your horizon is long enough.</li>
                  <li>• The point is to understand tradeoffs, not to “win”.</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setMonthIndex(0);
                  setView("simulate");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-2xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                Run 6-Month Simulation
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 3: SIMULATE
  if (view === "simulate") {
    const row = sim.timeline[monthIndex];
    const isLast = monthIndex === sim.timeline.length - 1;

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs">Simulation</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Portfolio Dashboard</h2>
            <p className="text-slate-500 mt-1">
              Mock market data • Profile:{" "}
              <span className="font-bold text-slate-700">
                {selectedProfile === "conservative"
                  ? "Lower volatility"
                  : selectedProfile === "balanced"
                  ? "Mixed volatility"
                  : "Higher volatility"}
              </span>
            </p>
          </header>

          {/* Progress */}
          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${((monthIndex + 1) / 6) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main card */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-md border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-500">{row.month}</p>
                  <h3 className="text-3xl font-black text-slate-900">
                    ${row.totalValue.toLocaleString()}
                  </h3>
                  <p className="text-sm mt-1">
                    Month return:{" "}
                    <span className={row.monthReturnPct >= 0 ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                      {row.monthReturnPct >= 0 ? "+" : ""}
                      {row.monthReturnPct}%
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Net after 6 months (so far)</p>
                  <p className={sim.net >= 0 ? "text-emerald-700 text-xl font-black" : "text-rose-700 text-xl font-black"}>
                    {sim.net >= 0 ? "+" : ""}${(row.totalValue - sim.start).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(row.breakdown) as AllocationKey[]).map((k) => (
                  <div key={k} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-500">{ASSETS.find(a => a.key === k)?.name}</p>
                    <p className="text-lg font-black text-slate-900">${row.breakdown[k].toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Month list */}
              <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-3">6-Month timeline</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sim.timeline.map((m, idx) => (
                    <button
                      key={m.month}
                      onClick={() => setMonthIndex(idx)}
                      className={[
                        "text-left rounded-xl p-3 border transition-all",
                        idx === monthIndex
                          ? "bg-white border-violet-200 shadow-sm"
                          : "bg-transparent border-transparent hover:bg-white hover:border-slate-200",
                      ].join(" ")}
                    >
                      <p className="text-xs text-slate-500">{m.month}</p>
                      <p className="text-sm font-bold text-slate-900">${m.totalValue.toLocaleString()}</p>
                      <p className={m.monthReturnPct >= 0 ? "text-xs text-emerald-700" : "text-xs text-rose-700"}>
                        {m.monthReturnPct >= 0 ? "+" : ""}
                        {m.monthReturnPct}%
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setMonthIndex((v) => clamp(v - 1, 0, 5))}
                  disabled={monthIndex === 0}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (!isLast) setMonthIndex((v) => clamp(v + 1, 0, 5));
                    else setView("compare");
                  }}
                  className="flex-1 py-3 bg-[#0B5E8E] text-white rounded-xl font-bold hover:bg-[#094a72] transition-all"
                >
                  {!isLast ? "Next month" : "Compare Strategies"}
                </button>
              </div>
            </div>

            {/* Side insights */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">What to notice</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• Your result is a mix of asset behavior (some stable, some volatile).</li>
                  <li>• A “good” portfolio is one you can stick with emotionally.</li>
                  <li>• Risk isn’t just losing money—it's panic-selling at the worst time.</li>
                </ul>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-2">Reality check</h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Short periods can flatter or punish a strategy. The goal here is to learn how
                  allocation changes outcomes—not to conclude “stocks always win” or “risk is bad.”
                </p>
              </div>

              <button
                onClick={() => setView("compare")}
                className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-md hover:opacity-90 transition-all"
              >
                Jump to Strategy Comparison
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 4: COMPARE
  if (view === "compare") {
    const yours = sim.end;
    const sorted = [...presetResults].sort((a, b) => b.res.end - a.res.end);

    const labelFor = (name: string) => {
      if (name === "Conservative") return "Lower swings, steadier path";
      if (name === "Balanced") return "Middle-ground volatility";
      return "Higher swings, bigger moves";
    };

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Compare</p>
            <h2 className="text-2xl font-bold text-slate-900">How Did Your Strategy Stack Up?</h2>
            <p className="text-slate-500 mt-1">
              6-month outcomes using the same mock market profile logic.
            </p>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Your portfolio ending value</p>
                <p className="text-4xl font-black text-slate-900">${yours.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Net:{" "}
                  <span className={sim.net >= 0 ? "font-bold text-emerald-700" : "font-bold text-rose-700"}>
                    {sim.net >= 0 ? "+" : ""}${sim.net.toLocaleString()} ({sim.netPct >= 0 ? "+" : ""}{sim.netPct}%)
                  </span>
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">Your build metrics</p>
                <p className="text-sm font-bold text-slate-900 mt-1">Risk: {risk.label} ({risk.score}/100)</p>
                <p className="text-sm font-bold text-slate-900">Diversification: {divScore}/100</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sorted.map((p) => {
              const delta = p.res.end - yours;
              const better = p.res.end >= yours;

              return (
                <div key={p.name} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{p.name}</p>
                  <p className="text-3xl font-black text-slate-900">${p.res.end.toLocaleString()}</p>
                  <p className="text-sm text-slate-600 mt-1">{labelFor(p.name)}</p>

                  <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-500">Vs your portfolio</p>
                    <p className={better ? "text-emerald-700 font-black" : "text-rose-700 font-black"}>
                      {delta === 0 ? "Same result" : `${better ? "+" : ""}$${delta.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-2xl p-6 border border-violet-100 mb-8">
            <h3 className="font-bold text-slate-900 mb-2">💡 Interpretation (high school level, not childish)</h3>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>• A strategy can “win” in 6 months and still be a poor match for your time horizon.</li>
              <li>• Higher risk often means wider outcomes (bigger upside *and* bigger drops).</li>
              <li>• The best portfolio is one you can hold through boring months and scary months.</li>
            </ul>
          </div>

          <div className="text-center">
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

  // VIEW 5: REFLECTION
  if (view === "reflection") {
    const ready = reflection1.trim().length >= 25 && reflection2.trim().length >= 25;

    return (
      <div className="relative max-w-3xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">Reflect</p>
            <h2 className="text-2xl font-bold text-slate-900">Did Your Choices Match Your Archetype?</h2>
            <p className="text-slate-500 mt-1">This is where the learning “locks in.”</p>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">📊 Your outcome summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Ending value</p>
                  <p className="font-black text-slate-900">${sim.end.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Net gain/loss</p>
                  <p className={sim.net >= 0 ? "font-black text-emerald-700" : "font-black text-rose-700"}>
                    {sim.net >= 0 ? "+" : ""}${sim.net.toLocaleString()} ({sim.netPct >= 0 ? "+" : ""}{sim.netPct}%)
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-2">
                1) If the portfolio dropped 8% next month, what would your *archetype* do—and what would *you* do?
              </label>
              <textarea
                value={reflection1}
                onChange={(e) => setReflection1(e.target.value)}
                placeholder="Be specific. Would you sell, hold, rebalance, or change contributions? Why?"
                className="w-full h-28 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent resize-none text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-2">
                2) What’s one rule you’ll follow when investing (risk, fees, diversification, or time horizon)?
              </label>
              <textarea
                value={reflection2}
                onChange={(e) => setReflection2(e.target.value)}
                placeholder='Example: “I’ll match my risk to my time horizon” or “I’ll diversify before I chase returns.”'
                className="w-full h-28 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B5E8E] focus:border-transparent resize-none text-sm"
              />
            </div>

            {ready && !showInsights && (
              <button
                onClick={() => setShowInsights(true)}
                className="w-full py-3 bg-violet-100 text-violet-700 rounded-xl font-bold hover:bg-violet-200 transition-all"
              >
                Show Key Takeaways
              </button>
            )}

            {showInsights && (
              <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-2xl p-5 border border-violet-200 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-bold text-slate-900 mb-3">🎓 Module 2 Key Takeaways</h4>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>
                      <strong>Portfolios are decision systems.</strong> Your allocation is a tradeoff between volatility and growth potential.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>
                      <strong>Diversification reduces single-asset risk</strong> but doesn’t erase market-wide risk.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>
                      <strong>Time horizon changes the “right” risk.</strong> The shorter your horizon, the more volatility can hurt you.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>
                      <strong>Short-term performance is noisy.</strong> 6 months is a snapshot—not a lifelong verdict.
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <button
              onClick={() => setView("complete")}
              disabled={!ready}
              className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
            >
              Complete Module 2
            </button>
          </div>
        </section>
      </div>
    );
  }

  // VIEW 6: COMPLETE
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center">
            <span className="text-5xl">🎉</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">Nice work!</h2>
          <p className="text-slate-500 mb-6">Module 2 • Lesson 3 Complete</p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">🏆 You practiced:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Building a portfolio under constraints ($2,000 total)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Risk vs return thinking (volatility and behavior)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                Comparing strategies without over-trusting short-term results
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>💡 Remember:</strong> A “good” investing plan is one you can follow consistently—especially when markets feel scary.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(100)}
              className="w-full py-5 bg-gradient-to-r from-violet-600 to-sky-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-90 transition-all"
            >
              Finish Lesson 3
            </button>

            <button
              onClick={() => {
                setView("intro");
                setMonthIndex(0);
                setShowInsights(false);
                setReflection1("");
                setReflection2("");
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
