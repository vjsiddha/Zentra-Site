// app/simulator/dss/DSSEngine.ts
// Decision Support System Engine
// Surfaces objective portfolio metrics against financial thresholds.
// IMPORTANT: This system flags rule-of-thumb guideline violations only.
// It does NOT provide personalized investment advice or recommend specific securities.

// ============================================================================
// TYPES
// ============================================================================

export type InsightSeverity = "critical" | "warning" | "info" | "good";

export interface DSSInsight {
  id: string;
  severity: InsightSeverity;
  category: "concentration" | "diversification" | "risk" | "income" | "cash";
  title: string;
  detail: string;
  metric?: string;
  threshold?: string;
}

export interface RebalanceFlag {
  sector: string;
  actualPct: number;
  targetPct: number;
  drift: number;
  severity: InsightSeverity;
}

export interface PreTradeImpact {
  symbol: string;
  sector: string;
  currentSectorPct: number;
  projectedSectorPct: number;
  currentHHI: number;
  projectedHHI: number;
  currentRisk: "Low" | "Medium" | "High";
  projectedRisk: "Low" | "Medium" | "High";
  riskIncreased: boolean;
  concentrationWarning: boolean;
  cashAfterTrade: number;
  cashPct: number;
}

export interface PortfolioScorecard {
  overallGrade: "A" | "B" | "C" | "D" | "F";
  overallScore: number;
  components: {
    diversification: { score: number; grade: string; note: string };
    riskBalance:     { score: number; grade: string; note: string };
    sectorSpread:    { score: number; grade: string; note: string };
    cashUtilization: { score: number; grade: string; note: string };
  };
  topDrag: string;
}

// ============================================================================
// CONSTANTS — Guideline thresholds
// ============================================================================
const SECTOR_MAX_PCT       = 40;
const VOLATILE_MAX_PCT     = 20;
const MIN_SECTORS          = 3;
const CASH_DRAG_MAX_PCT    = 30;
const SINGLE_STOCK_MAX_PCT = 25;
const HHI_LOW              = 1500;
const HHI_HIGH             = 2500;

const VOLATILE_SECTORS = ["Crypto"];
const INCOME_SECTORS   = ["Banking", "ETFs"];

export const SECTOR_MAP: Record<string, string[]> = {
  Tech:          ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"],
  ETFs:          ["SPY", "QQQ", "VTI", "VOO"],
  Banking:       ["JPM", "BAC", "WFC", "GS"],
  "Green Energy":["ENPH", "NEE"],
  Crypto:        ["BTC-USD", "ETH-USD"],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getSector(symbol: string): string {
  for (const [sector, symbols] of Object.entries(SECTOR_MAP)) {
    if (symbols.includes(symbol)) return sector;
  }
  return "Other";
}

export function computeSectorWeights(
  positions: Record<string, { qty: number; avg_cost: number }>,
  liveValues?: Record<string, number>
): Record<string, number> {
  const sectorValues: Record<string, number> = {};
  let total = 0;

  for (const [symbol, pos] of Object.entries(positions)) {
    const value  = liveValues?.[symbol] ?? pos.qty * pos.avg_cost;
    const sector = getSector(symbol);
    sectorValues[sector] = (sectorValues[sector] ?? 0) + value;
    total += value;
  }

  if (total === 0) return {};

  const weights: Record<string, number> = {};
  for (const [sector, val] of Object.entries(sectorValues)) {
    weights[sector] = (val / total) * 100;
  }
  return weights;
}

export function computeHHI(sectorWeights: Record<string, number>): number {
  return Object.values(sectorWeights).reduce((sum, pct) => sum + pct * pct, 0);
}

function hhiToRisk(hhi: number): "Low" | "Medium" | "High" {
  if (hhi < HHI_LOW)  return "Low";
  if (hhi < HHI_HIGH) return "Medium";
  return "High";
}

function scoreToGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// ============================================================================
// 1. DSS INSIGHTS
// ============================================================================

export function computeInsights(
  positions: Record<string, { qty: number; avg_cost: number }>,
  cash: number,
  monthlyDividends: number,
  liveValues?: Record<string, number>
): DSSInsight[] {
  const insights: DSSInsight[] = [];
  const posSymbols = Object.keys(positions);

  if (posSymbols.length === 0) {
    insights.push({
      id: "empty-portfolio",
      severity: "info",
      category: "diversification",
      title: "Your portfolio is empty",
      detail: "You haven't made any trades yet. Start investing to see your portfolio analysis here.",
    });
    return insights;
  }

  const sectorWeights = computeSectorWeights(positions, liveValues);
  const numSectors    = Object.keys(sectorWeights).length;

  const investedValue = posSymbols.reduce((sum, sym) => {
    return sum + (liveValues?.[sym] ?? positions[sym].qty * positions[sym].avg_cost);
  }, 0);
  const totalPortfolioValue = investedValue + cash;

  // ── 1. Sector concentration ──────────────────────────────────────────────
  for (const [sector, pct] of Object.entries(sectorWeights)) {
    const isVolatile   = VOLATILE_SECTORS.includes(sector);
    const effectiveMax = isVolatile ? VOLATILE_MAX_PCT : SECTOR_MAX_PCT;

    if (pct > effectiveMax) {
      const overBy = (pct - effectiveMax).toFixed(1);
      insights.push({
        id: `sector-concentration-${sector}`,
        severity: pct > 60 ? "critical" : "warning",
        category: "concentration",
        title: `Too much invested in ${sector}`,
        detail: `${pct.toFixed(1)}% of your invested money is in ${sector} — that's ${overBy}% above the recommended ${effectiveMax}% limit for a single sector. If ${sector} drops sharply, a large portion of your portfolio would be affected. To improve this, try investing in other sectors like Banking or ETFs to bring ${sector}'s share down over time.`,
        metric: `${pct.toFixed(1)}% in ${sector}`,
        threshold: `Recommended: ≤${effectiveMax}%`,
      });
    }
  }

  // ── 2. Single stock dominance ─────────────────────────────────────────────
  if (investedValue > 0) {
    for (const sym of posSymbols) {
      const stockValue = liveValues?.[sym] ?? positions[sym].qty * positions[sym].avg_cost;
      const stockPct   = (stockValue / investedValue) * 100;

      if (stockPct > SINGLE_STOCK_MAX_PCT) {
        const overBy = (stockPct - SINGLE_STOCK_MAX_PCT).toFixed(1);
        insights.push({
          id: `single-stock-${sym}`,
          severity: stockPct > 50 ? "critical" : "warning",
          category: "concentration",
          title: `${sym} makes up ${stockPct.toFixed(1)}% of your portfolio`,
          detail: `${sym} represents ${stockPct.toFixed(1)}% of your invested assets — ${overBy}% above the recommended 25% limit for a single stock. If this one company reports bad earnings or faces a scandal, a large chunk of your portfolio is at risk. To reduce this, consider spreading future investments across other stocks rather than adding more ${sym}.`,
          metric: `${stockPct.toFixed(1)}% in ${sym}`,
          threshold: `Recommended: ≤${SINGLE_STOCK_MAX_PCT}% per stock`,
        });
      }
    }
  }

  // ── 3. Volatile asset check ───────────────────────────────────────────────
  const volatileWeight = VOLATILE_SECTORS.reduce(
    (sum, s) => sum + (sectorWeights[s] ?? 0), 0
  );
  if (volatileWeight > VOLATILE_MAX_PCT) {
    insights.push({
      id: "volatile-overweight",
      severity: volatileWeight > 40 ? "critical" : "warning",
      category: "risk",
      title: "High-risk assets make up a large portion of your portfolio",
      detail: `Crypto and other high-volatility assets represent ${volatileWeight.toFixed(1)}% of your invested portfolio. These assets can lose significant value very quickly. Most guidelines suggest keeping high-risk assets below ${VOLATILE_MAX_PCT}%. To rebalance, consider selling some crypto and reinvesting into more stable assets like ETFs or dividend-paying stocks.`,
      metric: `${volatileWeight.toFixed(1)}% in high-risk assets`,
      threshold: `Recommended: ≤${VOLATILE_MAX_PCT}%`,
    });
  }

  // ── 4. Diversification check ──────────────────────────────────────────────
  if (numSectors < MIN_SECTORS) {
    insights.push({
      id: "low-diversification",
      severity: numSectors === 1 ? "critical" : "warning",
      category: "diversification",
      title: `Invested in only ${numSectors} sector${numSectors === 1 ? "" : "s"}`,
      detail: `Your portfolio only covers ${numSectors} sector${numSectors === 1 ? "" : "s"}. Spreading your money across at least ${MIN_SECTORS} different sectors reduces the impact if one industry has a bad period — this is the core idea behind diversification. Try browsing the Banking, ETFs, or Green Energy sectors in the sidebar to add variety.`,
      metric: `${numSectors} sector${numSectors === 1 ? "" : "s"}`,
      threshold: `Recommended: ${MIN_SECTORS}+ sectors`,
    });
  }

  // ── 5. No ETF exposure ────────────────────────────────────────────────────
  const hasETF = posSymbols.some((s) => SECTOR_MAP["ETFs"].includes(s));
  if (!hasETF && numSectors < 3) {
    insights.push({
      id: "no-etf",
      severity: "info",
      category: "diversification",
      title: "No index funds (ETFs) in your portfolio",
      detail: "Index funds (ETFs) automatically spread your money across hundreds of companies at once. They're one of the most popular ways to diversify without having to pick individual stocks. Try looking at SPY, VOO, or VTI in the ETFs sector — these track the entire US stock market.",
    });
  }

  // ── 6. No dividend-paying assets ─────────────────────────────────────────
  const hasDividendSector = posSymbols.some((s) =>
    INCOME_SECTORS.some((sec) => SECTOR_MAP[sec]?.includes(s))
  );
  if (!hasDividendSector && investedValue > 5000) {
    insights.push({
      id: "no-income",
      severity: "info",
      category: "income",
      title: "No dividend-paying assets in your portfolio",
      detail: "Dividend-paying stocks send you a small cash payment regularly just for holding them. None of your current holdings are in sectors commonly known for dividends. To add dividend income, consider exploring the Banking sector (JPM, BAC) or ETFs (SPY, VOO) which regularly pay dividends to shareholders.",
    });
  }

  // ── 7. Cash drag ──────────────────────────────────────────────────────────
  const cashPct = (cash / totalPortfolioValue) * 100;
  if (cashPct > CASH_DRAG_MAX_PCT && totalPortfolioValue > 10000) {
    insights.push({
      id: "cash-drag",
      severity: "info",
      category: "cash",
      title: "A lot of your money is sitting as uninvested cash",
      detail: `${cashPct.toFixed(1)}% of your total portfolio ($${cash.toLocaleString()}) is still cash. While it's smart to keep some cash available, holding too much means your money isn't working for you. Investors call this "cash drag." Consider putting some of that cash to work — even a broad ETF like SPY gives your money a chance to grow.`,
      metric: `${cashPct.toFixed(1)}% cash`,
      threshold: `Recommended: ≤${CASH_DRAG_MAX_PCT}%`,
    });
  }

  // ── 8. All good ───────────────────────────────────────────────────────────
  if (insights.filter((i) => i.severity === "critical" || i.severity === "warning").length === 0) {
    insights.push({
      id: "healthy",
      severity: "good",
      category: "diversification",
      title: "Your portfolio looks well-balanced",
      detail: "No major concentration or risk flags detected. Keep monitoring your sector weights as your portfolio grows — things can shift after a few trades.",
    });
  }

  const order: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2, good: 3 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}

// ============================================================================
// 2. REBALANCING / DRIFT FLAGS
// ============================================================================

export function computeRebalanceFlags(
  positions: Record<string, { qty: number; avg_cost: number }>,
  liveValues?: Record<string, number>
): RebalanceFlag[] {
  const sectorWeights = computeSectorWeights(positions, liveValues);
  const flags: RebalanceFlag[] = [];

  for (const [sector, actualPct] of Object.entries(sectorWeights)) {
    const targetPct = VOLATILE_SECTORS.includes(sector) ? VOLATILE_MAX_PCT : SECTOR_MAX_PCT;
    const drift     = actualPct - targetPct;
    if (drift > 5) {
      flags.push({
        sector,
        actualPct,
        targetPct,
        drift,
        severity: drift > 20 ? "critical" : "warning",
      });
    }
  }

  return flags.sort((a, b) => b.drift - a.drift);
}

// ============================================================================
// 3. PRE-TRADE IMPACT
// ============================================================================

export function computePreTradeImpact(
  symbol: string,
  qty: number,
  price: number,
  positions: Record<string, { qty: number; avg_cost: number }>,
  cash: number,
  liveValues?: Record<string, number>
): PreTradeImpact {
  const tradeCost = qty * price;
  const sector    = getSector(symbol);

  const currentWeights = computeSectorWeights(positions, liveValues);
  const currentHHI     = computeHHI(currentWeights);
  const currentRisk    = hhiToRisk(currentHHI);

  const projectedPositions = { ...positions };
  if (projectedPositions[symbol]) {
    const existing   = projectedPositions[symbol];
    const newQty     = existing.qty + qty;
    const newAvgCost = (existing.qty * existing.avg_cost + qty * price) / newQty;
    projectedPositions[symbol] = { qty: newQty, avg_cost: newAvgCost };
  } else {
    projectedPositions[symbol] = { qty, avg_cost: price };
  }

  const projectedLiveValues = { ...(liveValues ?? {}) };
  projectedLiveValues[symbol] = (projectedLiveValues[symbol] ?? 0) + tradeCost;

  const projectedWeights   = computeSectorWeights(projectedPositions, projectedLiveValues);
  const projectedHHI       = computeHHI(projectedWeights);
  const projectedRisk      = hhiToRisk(projectedHHI);

  const currentSectorPct   = currentWeights[sector]   ?? 0;
  const projectedSectorPct = projectedWeights[sector] ?? 0;

  const cashAfterTrade = cash - tradeCost;
  const totalAfter     = Object.values(projectedLiveValues).reduce((s, v) => s + v, 0) + cashAfterTrade;
  const cashPct        = totalAfter > 0 ? (cashAfterTrade / totalAfter) * 100 : 0;

  return {
    symbol,
    sector,
    currentSectorPct,
    projectedSectorPct,
    currentHHI,
    projectedHHI,
    currentRisk,
    projectedRisk,
    riskIncreased:
      ["Low", "Medium", "High"].indexOf(projectedRisk) >
      ["Low", "Medium", "High"].indexOf(currentRisk),
    concentrationWarning: projectedSectorPct > SECTOR_MAX_PCT,
    cashAfterTrade,
    cashPct,
  };
}

// ============================================================================
// 4. PORTFOLIO SCORECARD
// ============================================================================

export function computeScorecard(
  positions: Record<string, { qty: number; avg_cost: number }>,
  cash: number,
  monthlyDividends: number,
  liveValues?: Record<string, number>
): PortfolioScorecard {
  const posSymbols = Object.keys(positions);

  if (posSymbols.length === 0) {
    return {
      overallGrade: "F",
      overallScore: 0,
      components: {
        diversification: { score: 0,  grade: "F", note: "No positions held" },
        riskBalance:     { score: 0,  grade: "F", note: "No positions held" },
        sectorSpread:    { score: 0,  grade: "F", note: "No positions held" },
        cashUtilization: { score: 50, grade: "C", note: "Fully in cash"     },
      },
      topDrag: "No investments have been made yet",
    };
  }

  const sectorWeights  = computeSectorWeights(positions, liveValues);
  const hhi            = computeHHI(sectorWeights);
  const numSectors     = Object.keys(sectorWeights).length;
  const investedValue  = posSymbols.reduce(
    (sum, sym) => sum + (liveValues?.[sym] ?? positions[sym].qty * positions[sym].avg_cost), 0
  );
  const totalValue     = investedValue + cash;
  const cashPct        = totalValue > 0 ? (cash / totalValue) * 100 : 100;
  const volatileWeight = VOLATILE_SECTORS.reduce((sum, s) => sum + (sectorWeights[s] ?? 0), 0);
  const maxSector      = Math.max(...Object.values(sectorWeights));

  // Diversification score
  let diversScore = Math.min(100, (numSectors / 5) * 100);
  if (maxSector > 60) diversScore -= 30;
  else if (maxSector > 40) diversScore -= 15;
  diversScore = Math.max(0, diversScore);

  // Risk balance score (HHI-backed)
  let riskScore = Math.max(0, Math.min(100, ((10000 - hhi) / 9500) * 100));
  if (volatileWeight > VOLATILE_MAX_PCT) riskScore -= (volatileWeight - VOLATILE_MAX_PCT) * 1.5;
  riskScore = Math.max(0, riskScore);

  // Sector spread score
  const hasETF    = posSymbols.some((s) => SECTOR_MAP["ETFs"].includes(s));
  const hasIncome = posSymbols.some((s) => INCOME_SECTORS.some((sec) => SECTOR_MAP[sec]?.includes(s)));
  let spreadScore = Math.min(100, numSectors * 20);
  if (hasETF)    spreadScore = Math.min(100, spreadScore + 10);
  if (hasIncome) spreadScore = Math.min(100, spreadScore + 10);

  // Cash utilization score
  let cashScore: number;
  if      (cashPct > 80) cashScore = 20;
  else if (cashPct > 50) cashScore = 40;
  else if (cashPct > 30) cashScore = 60;
  else if (cashPct > 5)  cashScore = 90;
  else                   cashScore = 75;

  const scores = {
    diversification: Math.round(diversScore),
    riskBalance:     Math.round(riskScore),
    sectorSpread:    Math.round(spreadScore),
    cashUtilization: Math.round(cashScore),
  };

  const overallScore = Math.round(
    scores.diversification * 0.30 +
    scores.riskBalance     * 0.30 +
    scores.sectorSpread    * 0.25 +
    scores.cashUtilization * 0.15
  );

  const notes = {
    diversification:
      diversScore < 50
        ? `Only ${numSectors} sector${numSectors === 1 ? "" : "s"} — largest at ${maxSector.toFixed(0)}%`
        : `${numSectors} sectors, largest at ${maxSector.toFixed(0)}%`,
    riskBalance:
      riskScore < 50
        ? "Most money in 1–2 sectors — high concentration"
        : `Spread across multiple sectors — ${hhiToRisk(hhi).toLowerCase()} concentration`,
    sectorSpread:
      spreadScore < 60
        ? `Limited variety — ${hasETF ? "has ETFs" : "no ETFs"}, ${hasIncome ? "has dividend assets" : "no dividend assets"}`
        : `Good variety — ${hasETF ? "includes ETFs" : ""} ${hasIncome ? "includes dividend assets" : ""}`.trim(),
    cashUtilization:
      cashPct > 30
        ? `${cashPct.toFixed(0)}% in cash — money not fully working for you`
        : `${cashPct.toFixed(0)}% cash — reasonable balance`,
  };

  const componentScores: [string, number][] = [
    ["Diversification",  scores.diversification],
    ["Risk Balance",     scores.riskBalance],
    ["Sector Spread",    scores.sectorSpread],
    ["Cash Utilization", scores.cashUtilization],
  ];
  const topDragComponent = [...componentScores].sort((a, b) => a[1] - b[1])[0];
  const topDrag = `${topDragComponent[0]} (${topDragComponent[1]}/100) — ${
    topDragComponent[0] === "Diversification"  ? notes.diversification  :
    topDragComponent[0] === "Risk Balance"     ? notes.riskBalance      :
    topDragComponent[0] === "Sector Spread"    ? notes.sectorSpread     :
    notes.cashUtilization
  }`;

  return {
    overallGrade: scoreToGrade(overallScore) as any,
    overallScore,
    components: {
      diversification: { score: scores.diversification, grade: scoreToGrade(scores.diversification), note: notes.diversification },
      riskBalance:     { score: scores.riskBalance,     grade: scoreToGrade(scores.riskBalance),     note: notes.riskBalance     },
      sectorSpread:    { score: scores.sectorSpread,    grade: scoreToGrade(scores.sectorSpread),    note: notes.sectorSpread    },
      cashUtilization: { score: scores.cashUtilization, grade: scoreToGrade(scores.cashUtilization), note: notes.cashUtilization },
    },
    topDrag,
  };
}