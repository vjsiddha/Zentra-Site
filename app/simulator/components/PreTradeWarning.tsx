// app/simulator/components/PreTradeWarning.tsx
"use client";

import React from "react";
import { PreTradeImpact } from "../dss/DSSEngine";

const COLORS = {
  primary: "#0B5E8E",
  primaryLight: "#EAF4FF",
  cardBorder: "#E8EEF6",
  success: "#10b981",
  successLight: "#d1fae5",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  warning: "#f59e0b",
  warningLight: "#fef3c7",
};

const RISK_COLOR: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#ef4444",
};

const RISK_BG: Record<string, string> = {
  Low: "#d1fae5",
  Medium: "#fef3c7",
  High: "#fee2e2",
};

interface PreTradeWarningProps {
  impact: PreTradeImpact | null;
  qty: number;
  price: number | null;
}

export default function PreTradeWarning({
  impact,
  qty,
  price,
}: PreTradeWarningProps) {
  if (!impact || !price || qty <= 0) return null;

  const hasWarnings = impact.riskIncreased || impact.concentrationWarning;
  const isNeutral = !hasWarnings;

  const bgColor = impact.concentrationWarning
    ? "#FEF2F2"
    : impact.riskIncreased
    ? "#FFFBEB"
    : "#F0FDF4";
  const borderColor = impact.concentrationWarning
    ? "#FECACA"
    : impact.riskIncreased
    ? "#FDE68A"
    : "#BBF7D0";
  const headerColor = impact.concentrationWarning
    ? "#991B1B"
    : impact.riskIncreased
    ? "#92400E"
    : "#166534";

  const headerIcon = impact.concentrationWarning
    ? "⚠️"
    : impact.riskIncreased
    ? "📊"
    : "✅";

  const headerText = impact.concentrationWarning
    ? "Concentration Warning"
    : impact.riskIncreased
    ? "Risk Level Change Detected"
    : "Trade Impact Analysis";

  return (
    <div
      className="rounded-xl ring-1 overflow-hidden"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ backgroundColor: borderColor }}
      >
        <span>{headerIcon}</span>
        <span className="text-sm font-bold" style={{ color: headerColor }}>
          {headerText}
        </span>
        <span className="text-xs text-slate-500 ml-auto font-medium">
          DSS Pre-Trade Analysis
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Sector exposure change */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            {impact.sector} Sector Exposure
          </p>
          <div className="flex items-center gap-3">
            {/* Current */}
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500 mb-1">Before</p>
              <p className="text-2xl font-black text-slate-700">
                {impact.currentSectorPct.toFixed(1)}%
              </p>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center">
              <div
                className="text-2xl font-bold"
                style={{
                  color: impact.concentrationWarning
                    ? COLORS.danger
                    : impact.riskIncreased
                    ? COLORS.warning
                    : COLORS.success,
                }}
              >
                →
              </div>
              <p className="text-xs font-bold"
                style={{
                  color: impact.concentrationWarning
                    ? COLORS.danger
                    : impact.riskIncreased
                    ? COLORS.warning
                    : COLORS.success,
                }}>
                {impact.projectedSectorPct > impact.currentSectorPct ? "+" : ""}
                {(impact.projectedSectorPct - impact.currentSectorPct).toFixed(1)}%
              </p>
            </div>

            {/* Projected */}
            <div className="flex-1 text-center">
              <p className="text-xs text-slate-500 mb-1">After</p>
              <p
                className="text-2xl font-black"
                style={{
                  color: impact.concentrationWarning
                    ? COLORS.danger
                    : impact.riskIncreased
                    ? COLORS.warning
                    : COLORS.success,
                }}
              >
                {impact.projectedSectorPct.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Bar visualization */}
          <div className="mt-2 relative h-2 rounded-full bg-slate-200">
            {/* Current bar */}
            <div
              className="absolute left-0 top-0 h-full rounded-full opacity-40"
              style={{
                width: `${Math.min(100, impact.currentSectorPct)}%`,
                backgroundColor: COLORS.primary,
              }}
            />
            {/* Projected bar */}
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{
                width: `${Math.min(100, impact.projectedSectorPct)}%`,
                backgroundColor: impact.concentrationWarning
                  ? COLORS.danger
                  : impact.riskIncreased
                  ? COLORS.warning
                  : COLORS.success,
              }}
            />
            {/* 40% guideline marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-slate-600"
              style={{ left: "40%" }}
              title="40% guideline"
            />
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-xs text-slate-400">▲ 40% guideline</span>
          </div>
        </div>

        {/* Risk level change */}
        {impact.riskIncreased && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
            <span className="text-xs font-semibold text-slate-600">Portfolio Risk:</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                color: RISK_COLOR[impact.currentRisk],
                backgroundColor: RISK_BG[impact.currentRisk],
              }}
            >
              {impact.currentRisk}
            </span>
            <span className="text-slate-400 text-xs">→</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                color: RISK_COLOR[impact.projectedRisk],
                backgroundColor: RISK_BG[impact.projectedRisk],
              }}
            >
              {impact.projectedRisk}
            </span>
            <span className="text-xs text-slate-500 ml-1">
              (HHI {Math.round(impact.currentHHI)} → {Math.round(impact.projectedHHI)})
            </span>
          </div>
        )}

        {/* Concentration warning text */}
        {impact.concentrationWarning && (
          <div className="p-3 rounded-lg bg-red-50 ring-1 ring-red-200">
            <p className="text-xs font-semibold text-red-800">
              This trade would bring {impact.sector} exposure to{" "}
              {impact.projectedSectorPct.toFixed(1)}% — exceeding the general
              40% single-sector guideline. High concentration increases exposure
              to sector-specific downturns.
            </p>
          </div>
        )}

        {/* Cash remaining */}
        {impact.cashAfterTrade < 5000 && (
          <div className="p-3 rounded-lg bg-amber-50 ring-1 ring-amber-200">
            <p className="text-xs font-semibold text-amber-800">
              ⚠️ Cash after trade: ${impact.cashAfterTrade.toLocaleString()} —
              leaving little reserve for future opportunities.
            </p>
          </div>
        )}

        {/* All clear */}
        {isNeutral && (
          <p className="text-xs text-emerald-700 font-medium">
            This trade does not trigger any concentration or risk guideline flags.
          </p>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-slate-400 italic border-t pt-3" style={{ borderColor }}>
          This analysis is educational. It does not constitute investment advice
          or a recommendation to proceed or cancel this trade.
        </p>
      </div>
    </div>
  );
}