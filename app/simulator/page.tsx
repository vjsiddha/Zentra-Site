"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import AssetDashboard from "./components/AssetDashboard";
import DSSInsightsPanel from "./components/DSSInsightsPanel";
import PreTradeWarning from "./components/PreTradeWarning";
import MarketEventBanner from "./components/MarketEventBanner";
import {
  computeInsights,
  computeRebalanceFlags,
  computeScorecard,
  computePreTradeImpact,
  computeSectorWeights,
  computeHHI,
  PreTradeImpact,
} from "./dss/DSSEngine";
import { useAuth } from "@/components/providers/AuthProvider";
import { mockInvestorApi } from "@/lib/api";

const COLORS = {
  primary: "#0B5E8E",
  primaryLight: "#EAF4FF",
  primaryRing: "#D6E6F7",
  background: "#F7FAFC",
  cardBorder: "#E8EEF6",
  success: "#10b981",
  successLight: "#d1fae5",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
};

const MARKET_DATA_API = (
  process.env.NEXT_PUBLIC_MARKET_API || "http://localhost:8001"
).replace(/\/+$/, "");

async function marketDataCall<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${MARKET_DATA_API}${endpoint}`);
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "API Error");
  return result.data;
}

async function searchSymbols(query: string) {
  return marketDataCall<any[]>(`/search?q=${encodeURIComponent(query)}`);
}

const SECTORS: Record<
  string,
  { symbols: string[]; icon: string; description: string; color: string }
> = {
  Tech: {
    symbols: ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"],
    icon: "🧠",
    description: "Fast-growing tech companies.",
    color: "#0B5E8E",
  },
  ETFs: {
    symbols: ["SPY", "QQQ", "VTI", "VOO"],
    icon: "💼",
    description: "Diversified funds — safer for beginners.",
    color: "#10b981",
  },
  Banking: {
    symbols: ["JPM", "BAC", "WFC", "GS"],
    icon: "🏦",
    description: "Major banks with stable dividends.",
    color: "#f59e0b",
  },
  "Green Energy": {
    symbols: ["ENPH", "NEE"],
    icon: "🌱",
    description: "Clean energy companies.",
    color: "#ef4444",
  },
  Crypto: {
    symbols: ["BTC-USD", "ETH-USD"],
    icon: "💎",
    description: "Digital currencies (high risk).",
    color: "#8b5cf6",
  },
};

const TIPS = [
  "💡 Diversify across sectors to reduce risk.",
  "📉 Don't panic when markets drop — stay the course!",
  "🏆 Long-term investing beats short-term trading.",
];

function getSectorForSymbol(symbol: string): string {
  for (const [name, data] of Object.entries(SECTORS)) {
    if (data.symbols.includes(symbol)) return name;
  }
  return "Other";
}

function PortfolioValueChart({ portfolio }: { portfolio: any }) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"ALL" | "1y" | "3m" | "1m">("ALL");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const p = period === "ALL" ? "1y" : period;
        const data = await mockInvestorApi.getEquityCurve(p, "1d");
        if (!data || data.length === 0) {
          setChartData([
            { time: new Date().toLocaleDateString(), value: portfolio?.cash || 100000 },
          ]);
        } else {
          let fd = data;
          if (period !== "ALL") {
            const cut = new Date();
            if (period === "1m") cut.setMonth(cut.getMonth() - 1);
            if (period === "3m") cut.setMonth(cut.getMonth() - 3);
            if (period === "1y") cut.setFullYear(cut.getFullYear() - 1);
            fd = data.filter((x: any) => new Date(x.ts) >= cut);
          }
          setChartData(
            fd.map((x: any) => ({
              time: new Date(x.ts).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              value: x.equity,
            }))
          );
        }
      } catch {
        setChartData([
          { time: new Date().toLocaleDateString(), value: portfolio?.cash || 100000 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [period, portfolio]);

  if (loading)
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl">
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-2"
            style={{ borderColor: COLORS.primary, borderTopColor: "transparent" }}
          />
          <p className="text-slate-600">Loading portfolio history...</p>
        </div>
      </div>
    );

  if (!chartData.length)
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <div className="text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-slate-700">No data yet</p>
        </div>
      </div>
    );

  const sv = chartData[0].value || 100000;
  const cv = chartData[chartData.length - 1].value || 100000;
  const g = cv - sv;
  const gp = ((g / sv) * 100).toFixed(2);
  const pos = g >= 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { id: "ALL", label: "All Time" },
          { id: "1m", label: "1 Month" },
          { id: "3m", label: "3 Months" },
          { id: "1y", label: "1 Year" },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p.id
                ? "text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            style={period === p.id ? { backgroundColor: COLORS.primary } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">Starting Value</p>
          <p className="text-lg font-bold text-slate-900">${sv.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <p className="text-xs text-slate-500 mb-1">Current Value</p>
          <p className="text-lg font-bold text-slate-900">${cv.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl ${pos ? "bg-emerald-50" : "bg-red-50"}`}>
          <p className="text-xs text-slate-500 mb-1">Total Gain</p>
          <p className={`text-lg font-bold ${pos ? "text-emerald-700" : "text-red-700"}`}>
            {pos ? "+" : ""} ${g.toLocaleString()} ({pos ? "+" : ""}
            {gp}%)
          </p>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B5E8E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0B5E8E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(v: any): [string, string] => [
                `$${(isFinite(Number(v)) ? Number(v) : 0).toLocaleString()}`,
                "Portfolio Value",
              ]}
              labelFormatter={(l) => `Date: ${l}`}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0B5E8E"
              fillOpacity={1}
              fill="url(#cv)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 text-center">
        📊 Total equity (cash + market value) from your first trade to today •{" "}
        {chartData.length} data points
      </p>
    </div>
  );
}

function FutureProjectionsChart({
  investedValue,
  cashBalance,
}: {
  investedValue: number;
  cashBalance: number;
}) {
  const [th, setTh] = useState<1 | 5 | 10 | 20>(10);
  const fv = (r: number, y: number) => investedValue * Math.pow(1 + r, y);
  const pts = Math.min(th, 20);
  const data = Array.from({ length: pts + 1 }, (_, i) => {
    const y = (th / pts) * i;
    return {
      year: y === 0 ? "Now" : `${Math.round(y)}y`,
      conservative: fv(0.05, y),
      moderate: fv(0.08, y),
      aggressive: fv(0.1, y),
      cash: cashBalance,
    };
  });

  for (const txn of sorted) {
    const side  = txn.type || txn.side;
    const qty   = Number(txn.qty);
    const price = Number(txn.price);
    const sym   = txn.ticker;

    if (side === 'BUY') {
      cash -= qty * price;
      if (!holdings[sym]) holdings[sym] = { qty: 0, avgCost: price };
      const prev   = holdings[sym];
      const newQty = prev.qty + qty;
      holdings[sym] = { qty: newQty, avgCost: (prev.qty * prev.avgCost + qty * price) / newQty };
    } else if (side === 'SELL') {
      cash += qty * price;
      if (holdings[sym]) {
        holdings[sym].qty -= qty;
        if (holdings[sym].qty <= 0) delete holdings[sym];
      }
    }

    const holdingsValue = Object.values(holdings).reduce((s, h) => s + h.qty * h.avgCost, 0);
    points.push({
      time:  new Date(txn.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: cash + holdingsValue,
    });
  }

  // Replace last point with live equity for accuracy
  const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  points[points.length - 1] = { time: todayLabel, value: currentCash + currentMarketValue };

  // Deduplicate same-day points — keep last value per day
  return points.reduce((acc: typeof points, pt) => {
    if (acc.length > 0 && acc[acc.length - 1].time === pt.time) {
      acc[acc.length - 1] = pt;
    } else {
      acc.push(pt);
    }
    return acc;
  }, []);
}

// ── Unified Portfolio Chart: history + optional projections ──────────────────
function PortfolioValueChart({
  portfolio,
  currentMarketValue,
  startingEquity,
}: {
  portfolio: any;
  currentMarketValue: number;
  startingEquity: number;
}) {
  const [showProjections,  setShowProjections]  = useState(false);
  const [projectionYears,  setProjectionYears]  = useState<1 | 5 | 10 | 20>(10);

  const history     = portfolio?.history ?? [];
  const currentCash = portfolio?.cash ?? startingEquity;
  const investedVal = currentMarketValue;
  const totalEquity = currentCash + investedVal;

  const historicalPoints = buildEquityCurveFromHistory(history, startingEquity, currentMarketValue, currentCash);
  const hasHistory = historicalPoints.length >= 2;

  // Projection points extending from today's invested value
  const projectionPoints = showProjections && investedVal > 0
    ? Array.from({ length: projectionYears + 1 }, (_, i) => ({
        time:         i === 0 ? 'Today' : `+${i}y`,
        conservative: investedVal * Math.pow(1.05, i),
        moderate:     investedVal * Math.pow(1.08, i),
        aggressive:   investedVal * Math.pow(1.10, i),
      }))
    : [];

  const sv  = hasHistory ? historicalPoints[0].value : startingEquity;
  const g   = totalEquity - sv;
  const gp  = sv > 0 ? ((g / sv) * 100).toFixed(2) : '0.00';
  const pos = g >= 0;

  if (!hasHistory) return (
    <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
      <div className="text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-semibold text-slate-700">No trade history yet</p>
        <p className="text-sm text-slate-500 mt-1">Make your first trade to start tracking</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 ring-1" style={{ borderColor: COLORS.cardBorder }}>
          <p className="text-xs text-slate-500 mb-1">📈 Invested (being projected)</p>
          <p className="text-lg font-bold" style={{ color: COLORS.primary }}>
            ${investedValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 ring-1" style={{ borderColor: COLORS.cardBorder }}>
          <p className="text-xs text-slate-500 mb-1">💵 Cash (not projected)</p>
          <p className="text-lg font-bold text-slate-400">
            ${cashBalance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {cashBalance > investedValue * 0.3 && (
        <div className="p-3 rounded-xl bg-amber-50 ring-1 ring-amber-200">
          <p className="text-xs text-amber-800">
            ⚠️{" "}
            <strong>
              {((cashBalance / (cashBalance + investedValue)) * 100).toFixed(0)}% of your
              portfolio is uninvested cash
            </strong>{" "}
            — it earns no returns and is shown as a flat line. Investing more of your
            cash could significantly improve your long-term outcome.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {[
          { y: 1, l: "1 Year" },
          { y: 5, l: "5 Years" },
          { y: 10, l: "10 Years" },
          { y: 20, l: "20 Years" },
        ].map((o) => (
          <button
            key={o.y}
            onClick={() => setTh(o.y as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              th === o.y
                ? "text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            style={th === o.y ? { backgroundColor: COLORS.primary } : {}}
          >
            {o.l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            l: "Conservative (5%/year)",
            v: fv(0.05, th),
            bg: "bg-blue-50",
            t: "text-blue-700",
          },
          {
            l: "Moderate (8%/year)",
            v: fv(0.08, th),
            bg: "bg-emerald-50",
            t: "text-emerald-700",
          },
          {
            l: "Aggressive (10%/year)",
            v: fv(0.1, th),
            bg: "bg-purple-50",
            t: "text-purple-700",
          },
        ].map((s) => (
          <div key={s.l} className={`p-4 rounded-xl ${s.bg}`}>
            <p className="text-xs text-slate-600 mb-1">{s.l}</p>
            <p className={`text-xl font-bold ${s.t}`}>
              ${s.v.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              +$
              {(s.v - investedValue).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              gain
            </p>
          </div>
        ))}
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={historicalPoints} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              {[
                ["cc", "#3b82f6"],
                ["cm", "#10b981"],
                ["ca", "#8b5cf6"],
              ].map(([id, c]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
  formatter={(v: any, name: any): [string, string] => {
    const n = isFinite(Number(v)) ? Number(v) : 0;
    const key = String(name ?? "");
    const label =
      key === "conservative"
        ? "Conservative (5%)"
        : key === "moderate"
          ? "Moderate (8%)"
          : key === "aggressive"
            ? "Aggressive (10%)"
            : "Uninvested Cash";

    return [
      `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      label,
    ];
  }}
  labelFormatter={(l) => `Time: ${l}`}
  contentStyle={{
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
/>
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              formatter={(v) =>
                v === "conservative"
                  ? "Conservative (5%)"
                  : v === "moderate"
                    ? "Moderate (8%)"
                    : v === "aggressive"
                      ? "Aggressive (10%)"
                      : "Uninvested Cash"
              }
            />
            <Area
              type="monotone"
              dataKey="conservative"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#cc)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="moderate"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#cm)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="aggressive"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#ca)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="cash"
              stroke="#94a3b8"
              strokeDasharray="5 5"
              fill="none"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 text-center">
        📚 Projections apply only to your{" "}
        <strong>
          ${investedValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </strong>{" "}
        in invested assets • Cash shown as flat line • Based on historical S&P 500
        average returns
      </p>

      {/* Projections section */}
      <div className="border-t pt-4" style={{ borderColor: COLORS.cardBorder }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-semibold text-slate-800">🔮 Future Projections</p>
            <p className="text-xs text-slate-500">
              Projecting your ${investedVal.toLocaleString('en-US', { maximumFractionDigits: 0 })} in invested assets
            </p>
          </div>
          <button
            onClick={() => setShowProjections(!showProjections)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${showProjections ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            style={showProjections ? { backgroundColor: COLORS.primary } : {}}
          >
            {showProjections ? 'Hide' : 'Show Projections'}
          </button>
        </div>

        {showProjections && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800">
                ⚠️ <strong>Educational only.</strong> Based on historical S&P 500 averages (5–10%/yr). Past performance does not guarantee future results.
                {currentCash > investedVal * 0.3 && (
                  <span className="block mt-1">
                    💡 <strong>{((currentCash / (currentCash + investedVal)) * 100).toFixed(0)}% of your portfolio is uninvested cash</strong> — only your ${investedVal.toLocaleString('en-US', { maximumFractionDigits: 0 })} in stocks is being projected.
                  </span>
                )}
              </p>
            </div>

            {/* Horizon buttons */}
            <div className="flex gap-2">
              {[{ y: 1, l: '1 Year' }, { y: 5, l: '5 Years' }, { y: 10, l: '10 Years' }, { y: 20, l: '20 Years' }].map(o => (
                <button key={o.y} onClick={() => setProjectionYears(o.y as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${projectionYears === o.y ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  style={projectionYears === o.y ? { backgroundColor: COLORS.primary } : {}}>
                  {o.l}
                </button>
              ))}
            </div>

            {/* Outcome cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Conservative (5%/yr)', v: investedVal * Math.pow(1.05, projectionYears), bg: 'bg-blue-50',    t: 'text-blue-700'   },
                { l: 'Moderate (8%/yr)',      v: investedVal * Math.pow(1.08, projectionYears), bg: 'bg-emerald-50', t: 'text-emerald-700' },
                { l: 'Aggressive (10%/yr)',   v: investedVal * Math.pow(1.10, projectionYears), bg: 'bg-purple-50',  t: 'text-purple-700'  },
              ].map(s => (
                <div key={s.l} className={`p-3 rounded-xl ${s.bg}`}>
                  <p className="text-xs text-slate-600 mb-1">{s.l}</p>
                  <p className={`text-lg font-bold ${s.t}`}>${s.v.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-slate-500">+${(s.v - investedVal).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                </div>
              ))}
            </div>

            {/* Projection chart */}
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionPoints} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    {[['pc', '#3b82f6'], ['pm', '#10b981'], ['pa', '#8b5cf6']].map(([id, c]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={c} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(v: any, name: string) => {
                      const n = isFinite(Number(v)) ? Number(v) : 0;
                      const label = name === 'conservative' ? 'Conservative (5%)' : name === 'moderate' ? 'Moderate (8%)' : 'Aggressive (10%)';
                      return [`$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, label];
                    }}
                    labelFormatter={l => `Time: ${l}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <ReferenceLine x="Today" stroke="#94a3b8" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="conservative" stroke="#3b82f6" fillOpacity={1} fill="url(#pc)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="moderate"     stroke="#10b981" fillOpacity={1} fill="url(#pm)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="aggressive"   stroke="#8b5cf6" fillOpacity={1} fill="url(#pa)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioAllocationChart({ positions }: { positions: any }) {
  const syms = Object.keys(positions);
  if (!syms.length)
    return (
      <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        <div className="text-center">
          <p className="text-4xl mb-3">🥧</p>
          <p className="font-semibold text-slate-700">No positions yet</p>
        </div>
      </div>
    );

  const sb: Record<string, number> = {};
  syms.forEach((s) => {
    const sec = getSectorForSymbol(s);
    sb[sec] = (sb[sec] || 0) + positions[s].qty * positions[s].avg_cost;
  });
  const cd = Object.entries(sb).map(([n, v]) => ({
    name: n,
    value: v,
    color: SECTORS[n]?.color || "#94a3b8",
  }));
  const tot = cd.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={cd}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              dataKey="value"
            >
              {cd.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: any): [string, string] => [
                `$${Number(v ?? 0).toLocaleString()}`,
                "Value",
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {cd.map((s) => (
          <div
            key={s.name}
            className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="font-medium text-slate-700">{s.name}</span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">${s.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{((s.value / tot) * 100).toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  const { user, loading: authLoading } = useAuth();

  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMarketValue, setCurrentMarketValue] = useState<number>(0);
  const [marketValueLoading, setMarketValueLoading] = useState(false);
  const [monthlyDividends, setMonthlyDividends] = useState<number>(0);
  const [activeTab, setActiveTab] = useState("trade");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [buyQty, setBuyQty] = useState<number>(0);
  const [sellSymbol, setSellSymbol] = useState("");
  const [sellPrice, setSellPrice] = useState<number | null>(null);
  const [sellQty, setSellQty] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<string | null>(null);
  const [dssNudge, setDssNudge] = useState<string | null>(null);
  const [showAllHoldings, setShowAllHoldings] = useState(false);

  const fetchMarketValue = useCallback(async () => {
    if (!portfolio || !Object.keys(portfolio.positions || {}).length) {
      setCurrentMarketValue(0);
      setMonthlyDividends(0);
      return;
    }

    try {
      setMarketValueLoading(true);
      const mtm = await mockInvestorApi.getMarkToMarket();
      setCurrentMarketValue(mtm.market_value || 0);

      let ann = 0;
      for (const sym of Object.keys(portfolio.positions || {})) {
        try {
          const r = await fetch(`${MARKET_DATA_API}/company-info/${sym}`);
          const d = await r.json();
          if (d.ok && d.data.dividend_yield) {
            ann +=
              portfolio.positions[sym].qty *
              (mtm.prices?.[sym] || portfolio.positions[sym].avg_cost) *
              (d.data.dividend_yield / 100);
          }
        } catch {}
      }
      setMonthlyDividends(ann / 12);
    } catch {
      const fb = Object.values(portfolio.positions || {}).reduce(
        (s: number, p: any) => s + p.qty * p.avg_cost,
        0
      );
      setCurrentMarketValue(fb as number);
      setMonthlyDividends(0);
    } finally {
      setMarketValueLoading(false);
    }
  }, [portfolio]);

  useEffect(() => {
    fetchMarketValue();
    const t = setInterval(fetchMarketValue, 30000);
    return () => clearInterval(t);
  }, [fetchMarketValue]);

  const loadPortfolioData = useCallback(async () => {
    if (authLoading || !user) return;

    try {
      setLoading(true);
      setPortfolio(await mockInvestorApi.getPortfolio());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        setSearchResults(await searchSymbols(searchQuery));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedSymbol) {
      setCurrentPrice(null);
      return;
    }

    const run = async () => {
      setPriceLoading(true);
      try {
        setCurrentPrice((await mockInvestorApi.getShockedQuote(selectedSymbol)).last);
      } catch {
        setCurrentPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    run();
    const t = setInterval(run, 30000);
    return () => clearInterval(t);
  }, [selectedSymbol]);

  useEffect(() => {
    if (!sellSymbol) {
      setSellPrice(null);
      return;
    }

    mockInvestorApi
      .getShockedQuote(sellSymbol)
      .then((q: any) => setSellPrice(q.last))
      .catch(() => setSellPrice(null));
  }, [sellSymbol]);

  const handleSelectStock = (sym: string) => {
    setSelectedSymbol(sym);
    setSearchQuery("");
    setSearchResults([]);
    setActiveTab("trade");
  };

  const handleBuy = async () => {
    if (!selectedSymbol || buyQty <= 0 || !currentPrice) {
      setTradeError("Please select a stock and enter quantity");
      return;
    }

    setTradeLoading(true);
    setTradeError(null);
    setTradeSuccess(null);

    try {
      await mockInvestorApi.buy(selectedSymbol, buyQty, currentPrice);
      const sym = selectedSymbol;
      setTradeSuccess(`Bought ${buyQty} shares of ${sym} at $${currentPrice.toFixed(2)}`);
      setBuyQty(0);
      await loadPortfolioData();
      setTimeout(fetchMarketValue, 500);

      if (preTradImpact?.concentrationWarning) {
        setDssNudge(
          `⚠️ This trade brought ${preTradImpact.sector} to ${preTradImpact.projectedSectorPct.toFixed(
            1
          )}% of your portfolio — exceeding the 40% guideline. Check DSS Insights for details.`
        );
      } else if (preTradImpact?.riskIncreased) {
        setDssNudge(
          `📊 This trade increased your portfolio risk level from ${preTradImpact.currentRisk} to ${preTradImpact.projectedRisk}. Check DSS Insights for details.`
        );
      }

      setTimeout(() => setSelectedAsset(sym), 1000);
    } catch (e) {
      setTradeError(e instanceof Error ? e.message : "Trade failed");
    } finally {
      setTradeLoading(false);
    }
  };

  const handleSell = async () => {
    if (!sellSymbol || sellQty <= 0 || !sellPrice) {
      setTradeError("Please select a position and enter quantity");
      return;
    }

    setTradeLoading(true);
    setTradeError(null);
    setTradeSuccess(null);

    try {
      await mockInvestorApi.sell(sellSymbol, sellQty, sellPrice ?? undefined);
      setTradeSuccess(`Sold ${sellQty} shares of ${sellSymbol} at $${sellPrice.toFixed(2)}`);
      setSellQty(0);
      setSellSymbol("");
      await loadPortfolioData();
      setTimeout(fetchMarketValue, 500);
    } catch (e) {
      setTradeError(e instanceof Error ? e.message : "Trade failed");
    } finally {
      setTradeLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset portfolio to $100,000? All positions will be closed.")) return;

    try {
      await mockInvestorApi.resetPortfolio(100000);
      await loadPortfolioData();
      setTradeSuccess("Portfolio reset to $100,000");
      setCurrentMarketValue(0);
    } catch {
      setTradeError("Failed to reset portfolio");
    }
  };

  const cashBalance = portfolio?.cash ?? 100000;
  const positions = portfolio?.positions ?? {};
  const positionSymbols = Object.keys(positions);
  const totalEquity = cashBalance + currentMarketValue;
  const totalGain = totalEquity - 100000;
  const percentageGain = (totalGain / 100000) * 100;
  const isPositive = percentageGain >= 0;
  const buyTotal = buyQty * (currentPrice || 0);
  const canBuy = !!selectedSymbol && buyQty > 0 && !!currentPrice && buyTotal <= cashBalance;
  const maxSellQty = sellSymbol ? positions[sellSymbol]?.qty || 0 : 0;
  const canSell = !!sellSymbol && sellQty > 0 && sellQty <= maxSellQty && !!sellPrice;
  const currentTip = TIPS[Math.floor(Date.now() / 60000) % TIPS.length];

  const dssInsights = computeInsights(positions, cashBalance, monthlyDividends);
  const dssRebalanceFlags = computeRebalanceFlags(positions);
  const dssScorecard = computeScorecard(positions, cashBalance, monthlyDividends);
  const preTradImpact: PreTradeImpact | null =
    selectedSymbol && buyQty > 0 && currentPrice
      ? computePreTradeImpact(selectedSymbol, buyQty, currentPrice, positions, cashBalance)
      : null;

  const sectorWeights = computeSectorWeights(positions);
  const hhi = computeHHI(sectorWeights);
  const riskLabel = hhi >= 2500 ? "High Risk" : hhi >= 1500 ? "Medium Risk" : "Low Risk";
  const riskColor =
    hhi >= 2500 ? COLORS.danger : hhi >= 1500 ? COLORS.warning : COLORS.success;

  const COLLAPSED_LIMIT = 5;
  const visibleHoldings = showAllHoldings
    ? positionSymbols
    : positionSymbols.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = positionSymbols.length - COLLAPSED_LIMIT;

  if (authLoading || loading)
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center">
          <div
            className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: COLORS.primary, borderTopColor: "transparent" }}
          />
          <p className="text-slate-600">{authLoading ? "Loading..." : "Loading simulator..."}</p>
        </div>
      </main>
    );

  if (error)
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="text-center max-w-md p-6">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadPortfolioData}
            className="px-6 py-2 rounded-full text-white font-semibold"
            style={{ backgroundColor: COLORS.primary }}
          >
            Retry
          </button>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <div className="flex">
        <aside
          className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden bg-white border-r`}
          style={{ borderColor: COLORS.cardBorder }}
        >
          <div className="h-screen overflow-y-auto p-5">
            <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
              ← Back to Home
            </Link>

            {positionSymbols.length > 0 && (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-slate-900">📦 Your Holdings</h2>
                    <span className="text-xs text-slate-400 font-medium">
                      {positionSymbols.length} total
                    </span>
                  </div>
                  <div className="space-y-2">
                    {visibleHoldings.map((sym) => {
                      const pos = positions[sym];
                      const livePrice = marketPrices[sym] ?? pos.avg_cost;
                      const liveValue = pos.qty * livePrice;
                      const gain = liveValue - pos.qty * pos.avg_cost;
                      return (
                        <button
                          key={sym}
                          onClick={() => setSelectedAsset(sym)}
                          className="w-full flex items-center justify-between p-3 rounded-xl ring-1 hover:bg-slate-50 transition-colors"
                          style={{ borderColor: COLORS.cardBorder }}
                        >
                          <div className="text-left">
                            <p className="font-semibold" style={{ color: COLORS.primary }}>
                              {sym}
                            </p>
                            <p className="text-xs text-slate-500">{pos.qty} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              ${(pos.qty * pos.avg_cost).toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">View →</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {positionSymbols.length > COLLAPSED_LIMIT && (
                    <button onClick={() => setShowAllHoldings(!showAllHoldings)}
                      className="w-full mt-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-slate-100"
                      style={{ color: COLORS.primary, backgroundColor: COLORS.primaryLight }}
                    >
                      {showAllHoldings
                        ? "↑ Show less"
                        : `↓ Show ${hiddenCount} more holding${hiddenCount === 1 ? "" : "s"}`}
                    </button>
                  )}
                </div>
                <Divider />
              </>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 mb-3">🗂️ Browse Sectors</h2>
              {Object.entries(SECTORS).map(([name, sector]) => (
                <div key={name} className="mb-2">
                  <button
                    onClick={() => setExpandedSector(expandedSector === name ? null : name)}
                    className="w-full flex items-center justify-between p-3 rounded-xl ring-1 hover:bg-slate-50"
                    style={{ borderColor: COLORS.cardBorder }}
                  >
                    <span className="font-medium text-slate-800">
                      {sector.icon} {name}
                    </span>
                    <span className="text-slate-400">{expandedSector === name ? "−" : "+"}</span>
                  </button>
                  {expandedSector === name && (
                    <div className="mt-2 p-3 rounded-xl text-sm" style={{ backgroundColor: COLORS.primaryLight }}>
                      <p className="text-slate-600 mb-2">{sector.description}</p>
                      <div className="space-y-1">
                        {sector.symbols.map((sym) => (
                          <button
                            key={sym}
                            onClick={() => handleSelectStock(sym)}
                            className="w-full text-left px-3 py-2 rounded-lg bg-white hover:ring-1"
                          >
                            <span className="font-semibold" style={{ color: COLORS.primary }}>
                              {sym}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4" style={{ borderColor: COLORS.cardBorder }}>
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900">Stock Simulator</h1>
                  <p className="text-slate-500 text-sm">Practice with $100,000 • Track Your Performance</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Cash</p>
                  <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                    ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Equity</p>
                  <p className="text-xl font-bold text-slate-900">
                    {marketValueLoading ? (
                      <span className="text-slate-400">Loading...</span>
                    ) : (
                      `$${totalEquity.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    )}
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {percentageGain.toFixed(2)}%
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Total Gain</p>
                  <p className={`text-sm font-bold ${isPositive ? "text-emerald-700" : "text-red-700"}`}>
                    {isPositive ? "+" : ""}$
                    {totalGain.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <nav className="bg-white border-b px-6" style={{ borderColor: COLORS.cardBorder }}>
            <div className="max-w-6xl mx-auto flex gap-1">
              {[
                { id: "trade", label: "Trade", icon: "📈" },
                { id: "portfolio", label: "Portfolio", icon: "📊" },
                { id: "dss", label: "Insights", icon: "🧠" },
                { id: "history", label: "History", icon: "📋" },
              ].map((tab) => {
                const criticalCount =
                  tab.id === "dss"
                    ? dssInsights.filter(
                        (i) => i.severity === "critical" || i.severity === "warning"
                      ).length
                    : 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 font-medium relative flex items-center gap-1.5 ${
                      activeTab === tab.id ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {criticalCount > 0 && activeTab !== "dss" && (
                      <span
                        className="text-xs text-white rounded-full w-5 h-5 flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: dssInsights.some((i) => i.severity === "critical")
                            ? COLORS.danger
                            : COLORS.warning,
                        }}
                      >
                        {criticalCount}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: COLORS.primary }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <MarketEventBanner />

              {dssNudge && (
                <div
                  className="mb-4 p-4 rounded-xl ring-1 flex justify-between items-start gap-3"
                  style={{ backgroundColor: COLORS.warningLight, borderColor: "#FDE68A" }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">{dssNudge}</p>
                    <button
                      onClick={() => {
                        setActiveTab("dss");
                        setDssNudge(null);
                      }}
                      className="text-xs font-bold mt-1 hover:underline"
                      style={{ color: COLORS.primary }}
                    >
                      View DSS Insights →
                    </button>
                  </div>
                  <button
                    onClick={() => setDssNudge(null)}
                    className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              )}

              {tradeError && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200 flex justify-between">
                  <span>⚠️ {tradeError}</span>
                  <button onClick={() => setTradeError(null)}>✕</button>
                </div>
              )}

              {tradeSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 flex justify-between">
                  <span>✅ {tradeSuccess}</span>
                  <button onClick={() => setTradeSuccess(null)}>✕</button>
                </div>
              )}

              {activeTab === "trade" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Buy Stocks" icon="📈" iconBg={COLORS.successLight} iconColor={COLORS.success}>
                    {!selectedSymbol ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Search for a stock
                          </label>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by symbol or name (e.g. AAPL, Tesla)..."
                            className="w-full px-4 py-3 rounded-xl ring-1 text-sm"
                            style={{ borderColor: COLORS.cardBorder }}
                          />
                          {searchLoading && <p className="text-xs text-slate-500 mt-2">Searching...</p>}
                          {searchResults.length > 0 && (
                            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl ring-1" style={{ borderColor: COLORS.cardBorder }}>
                              {searchResults.map((s) => (
                                <button
                                  key={s.symbol}
                                  onClick={() => handleSelectStock(s.symbol)}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 text-sm"
                                  style={{ borderColor: COLORS.cardBorder }}
                                >
                                  <span className="font-bold" style={{ color: COLORS.primary }}>
                                    {s.symbol}
                                  </span>
                                  <span className="text-slate-500 ml-2">{s.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div
                          className="p-4 rounded-xl bg-slate-50 border border-dashed text-center"
                          style={{ borderColor: COLORS.cardBorder }}
                        >
                          <p className="text-sm text-slate-500">Or browse sectors in the left sidebar</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-600">Selected Stock</p>
                              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                                {selectedSymbol}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedSymbol("")}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.successLight }}>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Current Price</span>
                            <div className="text-right">
                              {priceLoading ? (
                                <span className="text-slate-400">Loading...</span>
                              ) : currentPrice ? (
                                <span className="text-2xl font-bold" style={{ color: COLORS.success }}>
                                  ${currentPrice.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-red-500">Failed to load</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={buyQty || ""}
                            onChange={(e) => setBuyQty(parseFloat(e.target.value) || 0)}
                            min="0"
                            step="1"
                            placeholder="Enter number of shares"
                            className="w-full px-4 py-3 rounded-xl ring-1"
                            style={{ borderColor: COLORS.cardBorder }}
                          />
                          {currentPrice && buyQty > 0 && (
                            <p className="text-sm text-slate-500 mt-2">
                              Total:{" "}
                              <span className="font-semibold text-slate-900">${buyTotal.toFixed(2)}</span>
                              {buyTotal > cashBalance && (
                                <span className="text-red-500 ml-2">(Insufficient funds)</span>
                              )}
                            </p>
                          )}
                        </div>
                        <PreTradeWarning impact={preTradImpact} qty={buyQty} price={currentPrice} />
                        <button
                          onClick={handleBuy}
                          disabled={tradeLoading || !canBuy}
                          className="w-full py-3 rounded-full text-white font-semibold disabled:opacity-50"
                          style={{ backgroundColor: COLORS.success }}
                        >
                          {tradeLoading ? "Processing..." : `Buy ${selectedSymbol}`}
                        </button>
                      </div>
                    )}
                  </Card>

                  <Card title="Sell Stocks" icon="📉" iconBg={COLORS.dangerLight} iconColor={COLORS.danger}>
                    {positionSymbols.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-4xl mb-3">📭</p>
                        <p className="font-semibold text-slate-700">No positions</p>
                        <p className="text-sm text-slate-500 mt-1">Buy some stocks first!</p>
                      </div>
                    ) : !sellSymbol ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <p className="text-sm text-slate-600 mb-3">Select Position</p>
                          <select
                            value={sellSymbol}
                            onChange={(e) => {
                              setSellSymbol(e.target.value);
                              setSellQty(0);
                            }}
                            className="w-full px-4 py-2.5 rounded-lg bg-white ring-1 font-medium cursor-pointer"
                            style={{ borderColor: COLORS.cardBorder, color: COLORS.primary }}
                          >
                            <option value="">Select a position...</option>
                            {positionSymbols.map((sym) => (
                              <option key={sym} value={sym}>
                                {sym} — {positions[sym].qty} shares @ $
                                {positions[sym].avg_cost.toFixed(2)} avg
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-dashed" style={{ borderColor: COLORS.cardBorder }}>
                          <p className="text-center text-slate-500 text-sm">
                            Choose a position above to start selling
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-600">Selected Position</p>
                              <p className="text-xl font-bold" style={{ color: COLORS.primary }}>
                                {sellSymbol}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                You own {maxSellQty} shares @ ${positions[sellSymbol].avg_cost.toFixed(2)} avg
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSellSymbol("");
                                setSellQty(0);
                              }}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.dangerLight }}>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Current Price</span>
                            <span className="text-2xl font-bold" style={{ color: COLORS.danger }}>
                              {sellPrice ? `$${sellPrice.toFixed(2)}` : "Loading..."}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Quantity to Sell
                          </label>
                          <input
                            type="number"
                            value={sellQty || ""}
                            onChange={(e) => setSellQty(parseFloat(e.target.value) || 0)}
                            min="0"
                            max={maxSellQty}
                            step="1"
                            placeholder="Enter number of shares"
                            className="w-full px-4 py-3 rounded-xl ring-1"
                            style={{ borderColor: COLORS.cardBorder }}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <button
                              onClick={() => setSellQty(maxSellQty)}
                              className="text-xs font-medium hover:underline"
                              style={{ color: COLORS.primary }}
                            >
                              Sell all ({maxSellQty})
                            </button>
                            {sellPrice && sellQty > 0 && (
                              <p className="text-sm text-slate-500">
                                Total:{" "}
                                <span className="font-semibold text-slate-900">
                                  ${(sellQty * sellPrice).toFixed(2)}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={handleSell}
                          disabled={tradeLoading || !canSell}
                          className="w-full py-3 rounded-full text-white font-semibold disabled:opacity-50"
                          style={{ backgroundColor: COLORS.danger }}
                        >
                          {tradeLoading ? "Processing..." : `Sell ${sellSymbol}`}
                        </button>
                      </div>
                    )}
                  </Card>

                  <div className="lg:col-span-2">
                    <Card>
                      <div className="flex justify-between mb-3">
                        <span className="font-semibold text-slate-900">💵 Available Cash</span>
                        <span className="font-bold" style={{ color: COLORS.primary }}>
                          ${cashBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((cashBalance / 100000) * 100, 100)}%`,
                            backgroundColor: COLORS.primary,
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-slate-500">
                          {((cashBalance / 100000) * 100).toFixed(1)}% remaining
                        </p>
                        <button onClick={handleReset} className="text-xs text-slate-400 hover:text-red-500">
                          Reset Portfolio
                        </button>
                      </div>
                    </Card>
                  </div>

                  <div className="lg:col-span-2 p-4 rounded-2xl" style={{ backgroundColor: COLORS.warningLight }}>
                    <p className="text-slate-700">{currentTip}</p>
                  </div>
                </div>
              )}

              {activeTab === "portfolio" && (
                <div className="space-y-6">
                  <Card title="Portfolio Value Over Time" icon="📈">
                    <PortfolioValueChart portfolio={portfolio} />
                  </Card>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Portfolio Allocation" icon="🥧">
                      <PortfolioAllocationChart positions={positions} />
                    </Card>
                    <div className="space-y-6">
                      <Card title="Your Positions" icon="📦">
                        {positionSymbols.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="font-semibold text-slate-700">No positions yet</p>
                            <p className="text-sm text-slate-500 mt-1">Start trading!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {positionSymbols.map((sym) => {
                              const pos = positions[sym];
                              return (
                                <div
                                  key={sym}
                                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50"
                                >
                                  <div>
                                    <button
                                      onClick={() => setSelectedAsset(sym)}
                                      className="font-semibold hover:underline cursor-pointer"
                                      style={{ color: COLORS.primary }}
                                    >
                                      {sym}
                                    </button>
                                    <p className="text-xs text-slate-500">
                                      {pos.qty} shares @ ${pos.avg_cost.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="font-bold text-slate-900">
                                    ${(pos.qty * pos.avg_cost).toFixed(2)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </Card>

                      <Card title="Portfolio Analysis" icon="🧠">
                        <div
                          className="flex items-center gap-4 p-4 rounded-xl ring-1 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setActiveTab("dss")}
                          style={{
                            backgroundColor:
                              dssScorecard.overallGrade === "A" || dssScorecard.overallGrade === "B"
                                ? "#F0FDF4"
                                : dssScorecard.overallGrade === "C"
                                  ? "#FFFBEB"
                                  : "#FEF2F2",
                            borderColor:
                              dssScorecard.overallGrade === "A" || dssScorecard.overallGrade === "B"
                                ? "#BBF7D0"
                                : dssScorecard.overallGrade === "C"
                                  ? "#FDE68A"
                                  : "#FECACA",
                          }}
                        >
                          <div
                            className="text-5xl font-black"
                            style={{
                              color:
                                dssScorecard.overallGrade === "A"
                                  ? "#166534"
                                  : dssScorecard.overallGrade === "B"
                                    ? "#1D4ED8"
                                    : dssScorecard.overallGrade === "C"
                                      ? "#92400E"
                                      : "#991B1B",
                            }}
                          >
                            {dssScorecard.overallGrade}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-800">
                              {dssScorecard.overallScore}/100 overall score
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: riskColor }}
                              />
                              <p className="text-xs text-slate-600">
                                {riskLabel} · {dssScorecard.components.riskBalance.note}
                              </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{dssScorecard.topDrag}</p>
                            <p className="text-xs font-semibold mt-2" style={{ color: COLORS.primary }}>
                              View full analysis →
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card title="Estimated Monthly Dividends" icon="💰">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.primaryLight }}>
                          <p className="text-sm text-slate-600 mb-1">Estimated Monthly Dividends</p>
                          <p className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                            ${monthlyDividends.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {monthlyDividends > 0
                              ? `$${(monthlyDividends * 12).toFixed(2)} annually from dividend-paying stocks`
                              : "None of your holdings pay dividends"}
                          </p>
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <Card title="Future Portfolio Projections" icon="🔮">
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="font-semibold text-amber-900 mb-1">
                            Educational Projections Only
                          </p>
                          <p className="text-sm text-amber-800">
                            These projections are based on historical market averages
                            (5–10% annual returns). <strong>Past performance does not guarantee future results.</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                    <FutureProjectionsChart investedValue={currentMarketValue} cashBalance={cashBalance} />
                  </Card>

                  <Card title="Transaction History" icon="📋">
                    {!portfolio?.history || portfolio.history.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="font-semibold text-slate-700">No transactions yet</p>
                        <p className="text-sm text-slate-500 mt-1">Start trading to see your history!</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr
                              className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b"
                              style={{ borderColor: COLORS.cardBorder }}
                            >
                              <th className="pb-4">Date</th>
                              <th className="pb-4">Side</th>
                              <th className="pb-4">Symbol</th>
                              <th className="pb-4 text-center">Qty</th>
                              <th className="pb-4 text-right">Total Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {[...portfolio.history].reverse().map((txn: any, idx: number) => {
                              const side = txn.type || txn.side;
                              const isBuy = side === "BUY";
                              return (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-4 text-xs text-slate-500 font-medium">
                                    {new Date(txn.ts).toLocaleString([], {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                                  </td>
                                  <td className="py-4">
                                    <span
                                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                        isBuy
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-rose-100 text-rose-700"
                                      }`}
                                    >
                                      {side}
                                    </span>
                                  </td>
                                  <td className="py-4">
                                    <button
                                      onClick={() => setSelectedAsset(txn.ticker)}
                                      className="font-black hover:underline cursor-pointer"
                                      style={{ color: COLORS.primary }}
                                    >
                                      {txn.ticker || "CASH"}
                                    </button>
                                  </td>
                                  <td
                                    className={`py-4 text-center font-bold ${
                                      isBuy ? "text-slate-700" : "text-rose-600"
                                    }`}
                                  >
                                    {isBuy ? `+${txn.qty}` : `-${txn.qty}`}
                                  </td>
                                  <td className="py-4 text-right font-black text-slate-900">
                                    $
                                    {(txn.qty * txn.price).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {activeTab === "dss" && (
                <div className="space-y-6">
                  <DSSInsightsPanel
                    insights={dssInsights}
                    rebalanceFlags={dssRebalanceFlags}
                    scorecard={dssScorecard}
                    hasPositions={positionSymbols.length > 0}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAsset && (
        <AssetDashboard
          symbol={selectedAsset}
          portfolio={portfolio}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </main>
  );
}

function Card({
  title,
  icon,
  iconBg = COLORS.primaryLight,
  iconColor = COLORS.primary,
  children,
}: {
  title?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 ring-1" style={{ borderColor: COLORS.cardBorder }}>
      {title && (
        <div className="flex items-center gap-3 mb-5">
          {icon && (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sm"
              style={{ backgroundColor: iconBg, color: iconColor }}
            >
              {icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full my-6" style={{ backgroundColor: COLORS.cardBorder }} />;
}