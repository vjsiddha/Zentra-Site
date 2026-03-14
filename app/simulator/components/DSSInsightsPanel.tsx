// app/simulator/components/DSSInsightsPanel.tsx
"use client";

import React, { useState } from "react";
import {
  DSSInsight,
  RebalanceFlag,
  PortfolioScorecard,
  InsightSeverity,
} from "../dss/DSSEngine";

const COLORS = {
  primary: "#0B5E8E",
  primaryLight: "#EAF4FF",
  cardBorder: "#E8EEF6",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  { bg: string; border: string; text: string; icon: string; label: string }
> = {
  critical: { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", icon: "🔴", label: "Critical" },
  warning:  { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", icon: "🟡", label: "Warning"  },
  info:     { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", icon: "🔵", label: "Info"     },
  good:     { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", icon: "🟢", label: "Healthy"  },
};

const GRADE_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  A: { color: "#166534", bg: "#F0FDF4", ring: "#BBF7D0" },
  B: { color: "#1D4ED8", bg: "#EFF6FF", ring: "#BFDBFE" },
  C: { color: "#92400E", bg: "#FFFBEB", ring: "#FDE68A" },
  D: { color: "#9A3412", bg: "#FFF7ED", ring: "#FED7AA" },
  F: { color: "#991B1B", bg: "#FEF2F2", ring: "#FECACA" },
};

interface DSSInsightsPanelProps {
  insights: DSSInsight[];
  rebalanceFlags: RebalanceFlag[];
  scorecard: PortfolioScorecard;
  hasPositions: boolean;
}

function ScorecardView({ scorecard }: { scorecard: PortfolioScorecard }) {
  const gradeStyle = GRADE_CONFIG[scorecard.overallGrade] ?? GRADE_CONFIG["F"];

  const components = [
    { key: "diversification", label: "Diversification",  icon: "🧩", data: scorecard.components.diversification  },
    { key: "riskBalance",     label: "Risk Balance",      icon: "⚖️", data: scorecard.components.riskBalance      },
    { key: "sectorSpread",    label: "Sector Spread",     icon: "🗂️", data: scorecard.components.sectorSpread     },
    { key: "cashUtilization", label: "Cash Utilization",  icon: "💵", data: scorecard.components.cashUtilization  },
  ];

  return (
    <div className="space-y-5">
      <div
        className="flex items-center gap-5 p-5 rounded-2xl ring-1"
        style={{ backgroundColor: gradeStyle.bg, borderColor: gradeStyle.ring }}
      >
        <div
          className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center ring-2"
          style={{ backgroundColor: gradeStyle.bg, borderColor: gradeStyle.ring, color: gradeStyle.color }}
        >
          <span className="text-5xl font-black">{scorecard.overallGrade}</span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Overall Score</p>
          <p className="text-3xl font-black text-slate-900">
            {scorecard.overallScore}
            <span className="text-lg font-medium text-slate-400">/100</span>
          </p>
          {scorecard.topDrag && (
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              📉 Top drag: {scorecard.topDrag}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {components.map(({ key, label, icon, data }) => {
          const g = GRADE_CONFIG[data.grade] ?? GRADE_CONFIG["F"];
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-slate-700">{icon} {label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full ring-1"
                    style={{ color: g.color, backgroundColor: g.bg, borderColor: g.ring }}
                  >
                    {data.grade}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{data.score}/100</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${data.score}%`,
                    backgroundColor: data.score >= 80 ? COLORS.success : data.score >= 60 ? COLORS.warning : COLORS.danger,
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{data.note}</p>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 italic">
        Scores are computed from general financial literacy guidelines and do not constitute personalized investment advice.
      </p>
    </div>
  );
}

function RebalanceFlagsView({ flags }: { flags: RebalanceFlag[] }) {
  if (flags.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 ring-1 ring-emerald-200">
        <span className="text-2xl">✅</span>
        <div>
          <p className="font-semibold text-emerald-800">No sector drift detected</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            All sector weights are within general guideline thresholds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
        Sectors exceeding guideline thresholds
      </p>
      {flags.map((flag) => {
        const isCritical = flag.severity === "critical";
        return (
          <div
            key={flag.sector}
            className="p-4 rounded-xl ring-1"
            style={{
              backgroundColor: isCritical ? "#FEF2F2" : "#FFFBEB",
              borderColor: isCritical ? "#FECACA" : "#FDE68A",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{flag.sector}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      backgroundColor: isCritical ? "#FEE2E2" : "#FEF3C7",
                      color: isCritical ? "#991B1B" : "#92400E",
                    }}
                  >
                    {isCritical ? "Critical" : "Overweight"}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Current: <span className="font-bold text-slate-900">{flag.actualPct.toFixed(1)}%</span>
                  {" · "}Guideline max: <span className="font-bold">{flag.targetPct}%</span>
                  {" · "}Drift:{" "}
                  <span className="font-bold" style={{ color: isCritical ? COLORS.danger : COLORS.warning }}>
                    +{flag.drift.toFixed(1)}%
                  </span>
                </p>
              </div>
              <div className="text-right flex-shrink-0 w-20">
                <div className="relative h-2 rounded-full bg-slate-200 mt-2">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (flag.actualPct / (flag.targetPct * 2)) * 100)}%`,
                      backgroundColor: isCritical ? COLORS.danger : COLORS.warning,
                    }}
                  />
                  <div className="absolute top-0 h-full w-0.5 bg-slate-500" style={{ left: "50%" }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">vs. limit</p>
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-slate-400 italic">
        Thresholds based on general diversification guidelines. Not personalized financial advice.
      </p>
    </div>
  );
}

export default function DSSInsightsPanel({
  insights,
  rebalanceFlags,
  scorecard,
  hasPositions,
}: DSSInsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<"insights" | "rebalance" | "scorecard">("insights");

  const criticalCount  = insights.filter((i) => i.severity === "critical").length;
  const warningCount   = insights.filter((i) => i.severity === "warning").length;
  const rebalanceCount = rebalanceFlags.length;

  const tabs = [
    {
      id: "insights" as const,
      label: "Insights",
      icon: "💡",
      badge: criticalCount + warningCount || null,
      badgeColor: criticalCount > 0 ? COLORS.danger : COLORS.warning,
    },
    {
      id: "rebalance" as const,
      label: "Drift Flags",
      icon: "⚖️",
      badge: rebalanceCount || null,
      badgeColor: COLORS.warning,
    },
    {
      id: "scorecard" as const,
      label: "Scorecard",
      icon: "🏆",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="bg-white rounded-2xl ring-1 overflow-hidden" style={{ borderColor: COLORS.cardBorder }}>

      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.cardBorder }}
      >
        <h3 className="font-extrabold text-slate-900 text-lg leading-tight">Your Trading Analysis</h3>
        <p className="text-xs text-slate-500 mb-3">Objective portfolio analysis against financial guidelines</p>
        <div className="px-3 py-2 rounded-lg bg-white/60 ring-1 ring-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            ⚠️ <strong>Educational tool only.</strong> This system surfaces objective metrics against
            general financial literacy guidelines. It does not provide personalized investment advice
            or recommend specific securities.
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b" style={{ borderColor: COLORS.cardBorder }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-3 text-sm font-semibold relative transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === tab.id ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span
                className="text-xs text-white rounded-full w-5 h-5 flex items-center justify-center font-bold"
                style={{ backgroundColor: tab.badgeColor }}
              >
                {tab.badge}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLORS.primary }} />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "insights" && (
          <div className="space-y-3">
            {insights.map((insight) => {
              const cfg = SEVERITY_CONFIG[insight.severity];
              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl ring-1"
                  style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: cfg.border, color: cfg.text }}
                        >
                          {cfg.label}
                        </span>
                        {insight.metric && (
                          <span
                            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white/80"
                            style={{ color: cfg.text }}
                          >
                            {insight.metric}
                          </span>
                        )}
                        {insight.threshold && (
                          <span className="text-xs text-slate-500">guideline: {insight.threshold}</span>
                        )}
                      </div>
                      <p className="font-bold text-sm mb-1" style={{ color: cfg.text }}>{insight.title}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{insight.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "rebalance" && <RebalanceFlagsView flags={rebalanceFlags} />}
        {activeTab === "scorecard" && <ScorecardView scorecard={scorecard} />}
      </div>
    </div>
  );
}