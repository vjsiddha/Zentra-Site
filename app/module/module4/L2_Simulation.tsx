"use client";

import { useState } from "react";

interface L2Props {
  onComplete: (score: number) => void;
  onBack?: () => void;
}

interface PortfolioState {
  stocks: number;
  bonds: number;
  cash: number;
}

interface MarketEvent {
  month: number;
  headline: string;
  marketChange: number;
  sentiment: "panic" | "fear" | "uncertainty" | "hope" | "optimism";
  newsDetails: string;
  bestAction: "hold" | "sell" | "buy" | "rebalance";
  bestActionExplanation: string;
  actionExplanations: Record<"hold" | "sell" | "buy" | "rebalance", string>;
}

const MARKET_EVENTS: MarketEvent[] = [
  {
    month: 1,
    headline: "Market Down 10%: Tech Stocks Lead Decline",
    marketChange: -10,
    sentiment: "uncertainty",
    newsDetails: "Rising interest rates trigger selloff. Analysts divided on whether this is a correction or the start of something worse.",
    bestAction: "hold",
    bestActionExplanation: "A 10% drop is a normal market correction — they happen every 1–2 years on average. Selling now locks in losses and risks missing the recovery.",
    actionExplanations: {
      hold: "✅ Best choice. A -10% drop is a routine correction, not a crisis. Staying invested preserves your position for the recovery.",
      sell: "❌ Selling at -10% locks in your losses. Historically, most corrections recover within months — you'd likely miss the bounce.",
      buy: "✅ Good instinct — you're buying shares at a 10% discount. Effective if you have cash available and a long time horizon.",
      rebalance: "✅ Smart move. If stocks have drifted below your target, rebalancing systematically buys more at lower prices."
    }
  },
  {
    month: 2,
    headline: "Bloodbath Continues: Market Down 18% from Peak",
    marketChange: -8,
    sentiment: "fear",
    newsDetails: "Inflation fears mount. Major financial institutions warn of recession. Retail investors flee to cash.",
    bestAction: "buy",
    bestActionExplanation: "Prices are now 18% below peak — a meaningful discount. Fear is highest when prices are lowest, which is exactly when buying with spare cash pays off most.",
    actionExplanations: {
      hold: "✅ Solid. You're not locking in losses and you'll participate in the full recovery. Holding through fear takes discipline.",
      sell: "❌ Selling into fear at -18% is one of the most common and costly investor mistakes. You're selling to people who will profit from your panic.",
      buy: "✅ Best choice here. Markets are 18% cheaper than two months ago. Deploying spare cash now buys more shares per dollar.",
      rebalance: "✅ Good systematic approach. Selling bonds to buy fallen stocks is exactly what rebalancing is designed to do in downturns."
    }
  },
  {
    month: 3,
    headline: "Bear Market Confirmed: Down 25% from Highs",
    marketChange: -7,
    sentiment: "panic",
    newsDetails: "Worst quarter since 2008. Headlines scream 'MARKET CRASH!' Experts predict further declines.",
    bestAction: "buy",
    bestActionExplanation: "Maximum fear = maximum opportunity. Every major bear market in history has eventually recovered. Investors who bought during peak panic saw the best long-term returns.",
    actionExplanations: {
      hold: "✅ Holding through maximum fear is genuinely hard — and genuinely rewarding. You'll own your shares at bear market prices when the recovery comes.",
      sell: "❌ Selling at the point of maximum panic is the classic investor mistake. Markets are statistically closest to a bottom when fear is highest.",
      buy: "✅ Best choice. History shows that buying during peak panic — when everyone else is fleeing — produces the strongest long-term returns.",
      rebalance: "✅ Mechanically buying stocks when they're down 25% and selling stable bonds is a disciplined, proven strategy."
    }
  },
  {
    month: 4,
    headline: "Is This The Bottom? Volatility Remains High",
    marketChange: 3,
    sentiment: "uncertainty",
    newsDetails: "Small bounce gives hope, but trading remains choppy. Many investors still selling on any rally.",
    bestAction: "hold",
    bestActionExplanation: "Early recovery signals are fragile. Trying to trade in and out during volatile bounces creates transaction costs and tax events — and you risk missing the real recovery.",
    actionExplanations: {
      hold: "✅ Best choice. Early recovery signals are unreliable. Staying invested means you catch the full upside when it comes, without timing risk.",
      sell: "❌ Selling into a small bounce after a -25% decline means locking in most of your losses just before the potential recovery.",
      buy: "✅ Reasonable if you still have spare cash. A small bounce doesn't mean prices are no longer attractive.",
      rebalance: "✅ If stocks have drifted far below your target allocation, rebalancing now keeps your strategy on track."
    }
  },
  {
    month: 5,
    headline: "Signs of Stabilization: Market Finds Support",
    marketChange: 5,
    sentiment: "hope",
    newsDetails: "Economic data shows resilience. Some brave investors start buying. 'The worst may be behind us,' says one analyst.",
    bestAction: "hold",
    bestActionExplanation: "The recovery is building momentum. This is the wrong time to sell (you'd miss the gains) and aggressive buying now is less advantageous than it was at the bottom.",
    actionExplanations: {
      hold: "✅ Best choice. You've survived the hardest part. Staying invested lets you benefit from the full recovery that's gaining momentum.",
      sell: "❌ Selling as recovery begins means you've endured all the pain of the bear market and won't capture the reward.",
      buy: "🔶 Prices are recovering so buying is less impactful than it was at -25%. Still reasonable if you have idle cash.",
      rebalance: "✅ If your allocation has drifted, rebalancing now keeps your risk level where you want it as the market recovers."
    }
  },
  {
    month: 6,
    headline: "Recovery Gains Momentum: Up 15% from Lows",
    marketChange: 7,
    sentiment: "optimism",
    newsDetails: "Those who held through the storm are seeing gains. DCA investors smile as their strategy pays off.",
    bestAction: "rebalance",
    bestActionExplanation: "Stocks have rallied sharply. If they now exceed your target allocation, rebalancing locks in some gains and resets your risk level — the disciplined 'sell high' half of the cycle.",
    actionExplanations: {
      hold: "✅ Totally fine. You've successfully navigated the bear market and are now participating in the recovery.",
      sell: "🔶 Taking some profit now isn't panic — but make sure it fits your plan, not just excitement about the rally.",
      buy: "🔶 Less compelling now that prices have recovered 15% from the lows. Better opportunities existed during the panic.",
      rebalance: "✅ Best choice. Stocks have surged — if they're now above your target weight, rebalancing sells some at highs and resets your allocation. This is the 'sell high' half of 'buy low, sell high.'"
    }
  },
];

export default function L2_Simulation({ onComplete, onBack }: L2Props) {
  const [view, setView] = useState<"intro" | "setup" | "simulation" | "results">("intro");
  const [currentMonth, setCurrentMonth] = useState(0);

  const [portfolio, setPortfolio] = useState<PortfolioState>({
    stocks: 70000,
    bonds: 20000,
    cash: 10000
  });

  const originalPortfolio: PortfolioState = { stocks: 70000, bonds: 20000, cash: 10000 };
  const initialInvestment = 100000;

  const [marketValue, setMarketValue] = useState(100);
  const [decisions, setDecisions] = useState<{ month: number; action: string; label: string; isCorrect: boolean }[]>([]);
  const [pendingAction, setPendingAction] = useState<"hold" | "sell" | "buy" | "rebalance" | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);

  const currentStockValue = (portfolio.stocks / originalPortfolio.stocks) * (marketValue / 100) * originalPortfolio.stocks;
  const totalValue = currentStockValue + portfolio.bonds + portfolio.cash;
  const totalReturn = ((totalValue - initialInvestment) / initialInvestment) * 100;

  const currentEvent = MARKET_EVENTS[currentMonth];

  const ACTION_LABELS: Record<string, string> = {
    hold: "✊ Hold Steady",
    sell: "💸 Sell 50%",
    buy: "💰 Buy More",
    rebalance: "⚖️ Rebalance"
  };

  const handleSelectAction = (action: "hold" | "sell" | "buy" | "rebalance") => {
    if (isLocked) return;
    setPendingAction(action);
  };

  const handleConfirmAction = () => {
    if (!pendingAction || isLocked) return;
    setIsLocked(true);

    const isCorrect = pendingAction === currentEvent.bestAction;
    const pointsEarned = isCorrect ? 25 : pendingAction === "hold" || pendingAction === "rebalance" ? 15 : 5;

    // Apply portfolio effects
    if (pendingAction === "sell") {
      const sellAmount = currentStockValue * 0.5;
      setPortfolio(prev => ({ ...prev, stocks: prev.stocks * 0.5, cash: prev.cash + sellAmount }));
    } else if (pendingAction === "buy") {
      const buyAmount = Math.min(portfolio.cash * 0.5, portfolio.cash);
      if (buyAmount > 0) {
        const additionalShares = buyAmount / (marketValue / 100);
        setPortfolio(prev => ({ ...prev, stocks: prev.stocks + additionalShares, cash: prev.cash - buyAmount }));
      }
    } else if (pendingAction === "rebalance") {
      const targetStocks = totalValue * 0.7;
      const targetBonds = totalValue * 0.2;
      const targetCash = totalValue * 0.1;
      setPortfolio({ stocks: (targetStocks / currentStockValue) * portfolio.stocks, bonds: targetBonds, cash: targetCash });
    }

    setDecisions(prev => [...prev, {
      month: currentMonth + 1,
      action: pendingAction,
      label: ACTION_LABELS[pendingAction],
      isCorrect
    }]);
    setScore(prev => prev + pointsEarned);
  };

  const handleNext = () => {
    // Apply market change
    const newMarketValue = marketValue * (1 + currentEvent.marketChange / 100);
    setMarketValue(newMarketValue);

    if (currentMonth < MARKET_EVENTS.length - 1) {
      setCurrentMonth(prev => prev + 1);
      setPendingAction(null);
      setIsLocked(false);
    } else {
      setView("results");
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "panic": return "bg-red-600 text-white";
      case "fear": return "bg-orange-500 text-white";
      case "uncertainty": return "bg-amber-500 text-white";
      case "hope": return "bg-blue-500 text-white";
      case "optimism": return "bg-emerald-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "setup") setView("intro");
        else if (view === "intro" && onBack) onBack();
      }}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 font-bold transition-all hover:bg-rose-50 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  // INTRO
  if (view === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <BackButton />
        <div className="flex flex-col items-center justify-center max-w-[1000px] mx-auto px-6 py-16">
          <div className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-full mb-6">
            <span className="text-sm font-bold uppercase tracking-widest">Lesson 2</span>
          </div>

          <h1 className="text-[36px] font-bold text-[#0D171C] leading-tight text-center mb-4">
            Survive the Market Crash
          </h1>
          <p className="text-center mb-10 max-w-2xl text-slate-700 text-lg">
            Your portfolio is about to face a 25% decline over 3 months. Will you panic sell, double down,
            or stay the course? Each month you'll choose a strategy — then see immediately whether it was
            the right call and why.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-sm font-bold mb-1">Start with $100K</h3>
              <p className="text-xs text-slate-600">Typical balanced portfolio</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">📉</div>
              <h3 className="text-sm font-bold mb-1">Face 6 Months</h3>
              <p className="text-xs text-slate-600">Real market headlines</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-sm font-bold mb-1">Decide & Learn</h3>
              <p className="text-xs text-slate-600">Instant feedback on every choice</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-sm font-bold mb-1">See Outcomes</h3>
              <p className="text-xs text-slate-600">Compare your result vs ideal</p>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-10 max-w-2xl w-full">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Remember Your Training
            </h3>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• <strong>Time in the market</strong> beats timing the market</li>
              <li>• <strong>DCA investors</strong> buy more shares when prices drop</li>
              <li>• <strong>Emotional decisions</strong> destroy 3–5% of returns annually</li>
              <li>• <strong>Bear markets</strong> last an average of 10 months</li>
            </ul>
          </div>

          <button
            onClick={() => setView("setup")}
            className="px-10 py-4 bg-rose-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-rose-700 transition-all"
          >
            Let's Begin →
          </button>
        </div>
      </div>
    );
  }

  // SETUP
  if (view === "setup") {
    const stocksPercent = Math.round((portfolio.stocks / initialInvestment) * 100);
    const bondsPercent = Math.round((portfolio.bonds / initialInvestment) * 100);
    const cashPercent = Math.round((portfolio.cash / initialInvestment) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <BackButton />
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Your Starting Portfolio</h2>
            <p className="text-slate-600 text-center mb-8">
              A classic balanced portfolio — 70% stocks for growth, 20% bonds for stability, 10% cash for opportunities.
            </p>

            <div className="mb-8">
              <div className="h-12 rounded-full overflow-hidden flex mb-4">
                <div className="bg-blue-500 transition-all" style={{ width: `${stocksPercent}%` }} />
                <div className="bg-emerald-500 transition-all" style={{ width: `${bondsPercent}%` }} />
                <div className="bg-amber-500 transition-all" style={{ width: `${cashPercent}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-blue-600 font-medium mb-1">Stocks</div>
                  <div className="text-2xl font-bold text-blue-700">{stocksPercent}%</div>
                  <div className="text-xs text-slate-600 mt-1">${portfolio.stocks.toLocaleString()}</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-emerald-600 font-medium mb-1">Bonds</div>
                  <div className="text-2xl font-bold text-emerald-700">{bondsPercent}%</div>
                  <div className="text-xs text-slate-600 mt-1">${portfolio.bonds.toLocaleString()}</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-amber-600 font-medium mb-1">Cash</div>
                  <div className="text-2xl font-bold text-amber-700">{cashPercent}%</div>
                  <div className="text-xs text-slate-600 mt-1">${portfolio.cash.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-slate-900 mb-3">How to choose each month:</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex gap-2"><span className="font-bold text-blue-700 w-24 flex-shrink-0">✊ Hold</span><span>Stay the course — keep your current allocation unchanged.</span></div>
                <div className="flex gap-2"><span className="font-bold text-red-700 w-24 flex-shrink-0">💸 Sell 50%</span><span>Sell half your stocks and move the proceeds to cash.</span></div>
                <div className="flex gap-2"><span className="font-bold text-emerald-700 w-24 flex-shrink-0">💰 Buy More</span><span>Use 50% of your cash to buy additional stocks at current prices.</span></div>
                <div className="flex gap-2"><span className="font-bold text-purple-700 w-24 flex-shrink-0">⚖️ Rebalance</span><span>Reset back to the original 70/20/10 split.</span></div>
              </div>
              <p className="text-xs text-slate-500 mt-3">After each choice you'll see instant feedback: whether it was the recommended move and why.</p>
            </div>

            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 mb-8">
              <p className="text-rose-800 text-sm font-medium">
                <strong>Scenario:</strong> A bear market is beginning. Over the next 6 months you'll face real headlines and make key decisions. The market will move whether you act or not.
              </p>
            </div>

            <button
              onClick={() => setView("simulation")}
              className="w-full py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 transition-all shadow-lg"
            >
              Start Simulation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SIMULATION
  if (view === "simulation") {
    const chosenExplanation = pendingAction && isLocked
      ? currentEvent.actionExplanations[pendingAction]
      : null;

    const isCorrectChoice = pendingAction === currentEvent.bestAction;

    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-slate-700">Month {currentMonth + 1} of 6</span>
              <span className="text-slate-500">Market: {marketValue > 100 ? '+' : ''}{(marketValue - 100).toFixed(1)}% from start</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500"
                style={{ width: `${((currentMonth + 1) / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Portfolio</p>
              <p className="text-xl font-black text-slate-900">${Math.round(totalValue).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Return</p>
              <p className={`text-xl font-black ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cash</p>
              <p className="text-xl font-black text-amber-600">${Math.round(portfolio.cash).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Score</p>
              <p className="text-xl font-black text-blue-600">{score} pts</p>
            </div>
          </div>

          {/* Main Event Card */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${getSentimentColor(currentEvent.sentiment)}`}>
              {currentEvent.sentiment}
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-3">{currentEvent.headline}</h2>
            <p className="text-slate-600 mb-6">{currentEvent.newsDetails}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`p-4 rounded-xl ${currentEvent.marketChange < 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                <p className="text-sm font-medium text-slate-600">This Month's Market Move</p>
                <p className={`text-3xl font-black ${currentEvent.marketChange < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {currentEvent.marketChange >= 0 ? '+' : ''}{currentEvent.marketChange}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50">
                <p className="text-sm font-medium text-slate-600">Your Stocks After Move</p>
                <p className="text-3xl font-black text-blue-700">
                  ${Math.round(currentStockValue * (1 + currentEvent.marketChange / 100)).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <p className="text-base font-bold text-slate-900 mb-3">What will you do?</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(["hold", "sell", "buy", "rebalance"] as const).map(action => {
                const labels: Record<string, { icon: string; title: string; sub: string; border: string; bg: string; selectedBorder: string; selectedBg: string }> = {
                  hold: { icon: "✊", title: "Hold Steady", sub: "Stay the course. Trust your strategy.", border: "border-blue-200", bg: "bg-blue-50", selectedBorder: "border-blue-500", selectedBg: "bg-blue-100" },
                  sell: { icon: "💸", title: "Sell 50%", sub: "Cut losses. Move to cash.", border: "border-red-200", bg: "bg-red-50", selectedBorder: "border-red-500", selectedBg: "bg-red-100" },
                  buy: { icon: "💰", title: "Buy More", sub: "Stocks are on sale. Buy the dip!", border: "border-emerald-200", bg: "bg-emerald-50", selectedBorder: "border-emerald-500", selectedBg: "bg-emerald-100" },
                  rebalance: { icon: "⚖️", title: "Rebalance", sub: "Return to 70/20/10 allocation.", border: "border-purple-200", bg: "bg-purple-50", selectedBorder: "border-purple-500", selectedBg: "bg-purple-100" },
                };
                const l = labels[action];
                const isSelected = pendingAction === action;
                const isRecommended = isLocked && action === currentEvent.bestAction;

                return (
                  <button
                    key={action}
                    onClick={() => handleSelectAction(action)}
                    disabled={isLocked}
                    className={[
                      "p-4 rounded-xl border-2 text-left transition-all relative",
                      isLocked ? "cursor-default" : "hover:scale-[1.02]",
                      isSelected ? `${l.selectedBorder} ${l.selectedBg}` : `${l.border} ${l.bg}`,
                    ].join(" ")}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ Best
                      </span>
                    )}
                    <div className="font-bold text-slate-900 mb-1">{l.icon} {l.title}</div>
                    <p className="text-xs text-slate-600">{l.sub}</p>
                  </button>
                );
              })}
            </div>

            {/* Lock In button */}
            {!isLocked && (
              <button
                onClick={handleConfirmAction}
                disabled={!pendingAction}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {pendingAction ? `Lock In: ${ACTION_LABELS[pendingAction]}` : "Select an action above"}
              </button>
            )}

            {/* Feedback Panel — shown after locking */}
            {isLocked && chosenExplanation && (
              <div className={`mt-4 p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
                isCorrectChoice ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{isCorrectChoice ? "✅" : "💡"}</span>
                  <span className={`font-bold uppercase tracking-wider text-sm ${isCorrectChoice ? "text-emerald-700" : "text-amber-700"}`}>
                    {isCorrectChoice ? "Optimal choice!" : `Good to know — best move: ${ACTION_LABELS[currentEvent.bestAction]}`}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-3">{chosenExplanation}</p>
                {!isCorrectChoice && (
                  <div className="bg-white/80 rounded-xl p-3 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Why the best answer works:</p>
                    <p className="text-sm text-slate-700">{currentEvent.bestActionExplanation}</p>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  className="mt-4 w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all"
                >
                  {currentMonth < MARKET_EVENTS.length - 1 ? "Next Month →" : "See Final Results →"}
                </button>
              </div>
            )}
          </div>

          {/* Decision History */}
          {decisions.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3 text-sm">Your decisions so far:</h3>
              <div className="flex flex-wrap gap-2">
                {decisions.map((d) => (
                  <div key={d.month} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    d.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    <span>{d.isCorrect ? "✓" : "~"}</span>
                    <span>M{d.month}: {d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULTS — compact, fits one screen
  const correctCount = decisions.filter(d => d.isCorrect).length;
  const pctScore = Math.round((score / (MARKET_EVENTS.length * 25)) * 100);

  const resultTier = pctScore >= 80
    ? { emoji: "🏆", title: "Market Master!", msg: "You made disciplined, well-timed decisions throughout the cycle.", color: "text-emerald-600" }
    : pctScore >= 60
    ? { emoji: "💪", title: "Solid Survivor!", msg: "You weathered the storm — a few tweaks and you'll nail it next time.", color: "text-blue-600" }
    : { emoji: "📚", title: "Lesson Learned", msg: "Emotional decisions cost returns. Review the feedback and try again.", color: "text-amber-600" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-xl border border-slate-200 p-8 text-center">
        <div className="text-5xl mb-3">{resultTier.emoji}</div>
        <h2 className={`text-3xl font-black mb-1 ${resultTier.color}`}>{resultTier.title}</h2>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-md mx-auto">{resultTier.msg}</p>

        {/* Score row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase font-bold">Final Value</p>
            <p className="text-xl font-black text-slate-900">${Math.round(totalValue).toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase font-bold">Score</p>
            <p className={`text-xl font-black ${pctScore >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{pctScore}%</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase font-bold">Correct</p>
            <p className="text-xl font-black text-blue-600">{correctCount}/{MARKET_EVENTS.length}</p>
          </div>
        </div>

        {/* Decision summary — compact pills */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Your Journey</p>
          <div className="flex flex-wrap gap-2">
            {decisions.map((d) => (
              <div key={d.month} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                d.isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                <span>{d.isCorrect ? "✓" : "~"}</span>
                <span>M{d.month}: {d.label.replace(/^[^\s]+\s/, "")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onComplete(pctScore)}
            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-700 transition-all"
          >
            Continue to Lesson 3 →
          </button>
          <button
            onClick={() => {
              setView("setup");
              setCurrentMonth(0);
              setMarketValue(100);
              setDecisions([]);
              setScore(0);
              setPendingAction(null);
              setIsLocked(false);
              setPortfolio({ stocks: 70000, bonds: 20000, cash: 10000 });
            }}
            className="w-full py-3 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
          >
            Try Different Strategy
          </button>
        </div>
      </div>
    </div>
  );
}