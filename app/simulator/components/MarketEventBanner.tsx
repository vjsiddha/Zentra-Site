"use client";

import React, { useEffect, useState } from "react";
import { mockInvestorApi } from "@/lib/api";

const SECTOR_ICONS: Record<string, string> = {
  Tech: "🧠",
  ETFs: "💼",
  Banking: "🏦",
  "Green Energy": "🌱",
  Crypto: "💎",
  Other: "📦",
};

interface SectorImpact {
  multiplier: number;
  pct_change: number;
  direction: "up" | "down";
}

interface MarketEvent {
  id: string;
  name: string;
  description: string;
  phase: "crash" | "recovery";
  progress: number;
  sector_impacts: Record<string, SectorImpact>;
}

interface MarketStatus {
  active: boolean;
  event: MarketEvent | null;
  simulation_active: boolean;
  trades_until_sim: number;
}

export default function MarketEventBanner() {
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const data = await mockInvestorApi.getMarketStatus();
        if (!cancelled) setStatus(data);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch market status:", err);
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!status) return null;

  if (!status.simulation_active && status.trades_until_sim > 0) {
    return (
      <div className="mb-4 px-4 py-2.5 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center gap-2">
        <span className="text-base">📊</span>
        <p className="text-xs text-slate-500">
          Place{" "}
          <strong>
            {status.trades_until_sim} more trade
            {status.trades_until_sim === 1 ? "" : "s"}
          </strong>{" "}
          to unlock the market simulation experience.
        </p>
      </div>
    );
  }

  if (!status.active || !status.event) return null;

  const event = status.event;
  const isCrash = event.phase === "crash";
  const isRecovery = event.phase === "recovery";
  const impacts = Object.entries(event.sector_impacts);

  const bannerBg = isCrash ? "#FEF2F2" : isRecovery ? "#FFFBEB" : "#F0FDF4";
  const bannerBorder = isCrash ? "#FECACA" : isRecovery ? "#FDE68A" : "#BBF7D0";
  const bannerText = isCrash ? "#991B1B" : isRecovery ? "#92400E" : "#166534";
  const phaseIcon = isCrash ? "📉" : isRecovery ? "📈" : "✅";
  const phaseLabel = isCrash
    ? "MARKET CRASH IN PROGRESS"
    : isRecovery
      ? "MARKET RECOVERING"
      : "MARKET NORMALISED";

  return (
    <div
      className="rounded-2xl ring-1 overflow-hidden mb-4"
      style={{ backgroundColor: bannerBg, borderColor: bannerBorder }}
    >
      <div className="px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{phaseIcon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ backgroundColor: bannerBorder, color: bannerText }}
              >
                {phaseLabel}
              </span>
              <span className="font-bold text-slate-900 text-sm">{event.name}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 truncate">{event.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {isRecovery && (
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Recovery</p>
              <div className="w-24 h-1.5 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${event.progress * 100}%`,
                    backgroundColor: "#f59e0b",
                  }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {(event.progress * 100).toFixed(0)}%
              </p>
            </div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: bannerBorder, color: bannerText }}
          >
            {expanded ? "Hide ↑" : "See impact ↓"}
          </button>
        </div>
      </div>

      <div
        className="px-5 py-2 text-xs font-medium flex items-center gap-2"
        style={{ backgroundColor: bannerBorder, color: bannerText }}
      >
        <span>⚠️</span>
        <span>
          <strong>Simulated prices active.</strong> Stock prices are multiplied by a shock
          factor for educational purposes. Prices will gradually return to real market
          values as the event resolves.
        </span>
      </div>

      {expanded && (
        <div className="px-5 py-4 border-t" style={{ borderColor: bannerBorder }}>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Sector Impact Breakdown
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {impacts.map(([sector, impact]) => {
              const isUp = impact.direction === "up";
              const pct = Math.abs(impact.pct_change);
              const color = isUp ? "#10b981" : "#ef4444";
              const bg = isUp ? "#F0FDF4" : "#FEF2F2";
              const border = isUp ? "#BBF7D0" : "#FECACA";

              return (
                <div
                  key={sector}
                  className="flex items-center justify-between p-3 rounded-xl ring-1"
                  style={{ backgroundColor: bg, borderColor: border }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{SECTOR_ICONS[sector] ?? "📦"}</span>
                    <span className="text-sm font-semibold text-slate-800">{sector}</span>
                  </div>
                  <span className="text-sm font-black" style={{ color }}>
                    {isUp ? "+" : "-"}
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-white/60 ring-1 ring-slate-200">
            <p className="text-xs text-slate-600 leading-relaxed">
              📚 <strong>What this means for you:</strong>{" "}
              {isCrash
                ? "During a market crash, diversified portfolios tend to lose less than concentrated ones. Check the DSS Insights tab to see how this event affects your portfolio score."
                : "During recovery, sectors that fell the most often recover fastest — but not always. This is why timing the market is difficult."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}