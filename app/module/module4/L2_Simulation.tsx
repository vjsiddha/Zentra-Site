"use client";

import { useState, useEffect } from "react";

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
  marketChange: number; // percentage change
  sentiment: "panic" | "fear" | "uncertainty" | "hope" | "optimism";
  newsDetails: string;
}

const MARKET_EVENTS: MarketEvent[] = [
  {
    month: 1,
    headline: "Market Down 10%: Tech Stocks Lead Decline",
    marketChange: -10,
    sentiment: "uncertainty",
    newsDetails: "Rising interest rates trigger selloff. Analysts divided on whether this is a correction or the start of something worse."
  },
  {
    month: 2,
    headline: "Bloodbath Continues: Market Down 18% from Peak",
    marketChange: -8,
    sentiment: "fear",
    newsDetails: "Inflation fears mount. Major financial institutions warn of recession. Retail investors flee to cash."
  },
  {
    month: 3,
    headline: "Bear Market Confirmed: Down 25% from Highs",
    marketChange: -7,
    sentiment: "panic",
    newsDetails: "Worst quarter since 2008. Headlines scream 'MARKET CRASH!' Experts predict further declines."
  },
  {
    month: 4,
    headline: "Is This The Bottom? Volatility Remains High",
    marketChange: 3,
    sentiment: "uncertainty",
    newsDetails: "Small bounce gives hope, but trading remains choppy. Many investors still selling on any rally."
  },
  {
    month: 5,
    headline: "Signs of Stabilization: Market Finds Support",
    marketChange: 5,
    sentiment: "hope",
    newsDetails: "Economic data shows resilience. Some brave investors start buying. 'The worst may be behind us,' says one analyst."
  },
  {
    month: 6,
    headline: "Recovery Gains Momentum: Up 15% from Lows",
    marketChange: 7,
    sentiment: "optimism",
    newsDetails: "Those who held through the storm are seeing gains. DCA investors smile as their strategy pays off."
  },
];

export default function L2_Simulation({ onComplete, onBack }: L2Props) {
  const [view, setView] = useState<"intro" | "setup" | "simulation" | "decision" | "results">("intro");
  const [currentMonth, setCurrentMonth] = useState(0);
  const [initialInvestment, setInitialInvestment] = useState(100000);
  
  const [portfolio, setPortfolio] = useState<PortfolioState>({
    stocks: 70000,
    bonds: 20000,
    cash: 10000
  });

  const [originalPortfolio] = useState<PortfolioState>({
    stocks: 70000,
    bonds: 20000,
    cash: 10000
  });

  const [marketValue, setMarketValue] = useState(100);
  const [decisions, setDecisions] = useState<string[]>([]);
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  // Calculate current portfolio value
  const currentStockValue = (portfolio.stocks / originalPortfolio.stocks) * (marketValue / 100) * originalPortfolio.stocks;
  const totalValue = currentStockValue + portfolio.bonds + portfolio.cash;
  const totalReturn = ((totalValue - initialInvestment) / initialInvestment) * 100;

  const currentEvent = MARKET_EVENTS[currentMonth];

  const handleDecision = (action: "hold" | "sell" | "buy" | "rebalance") => {
    let actionDescription = "";
    let pointsEarned = 0;

    if (action === "hold") {
      actionDescription = "Held steady through volatility";
      pointsEarned = currentEvent.sentiment === "panic" ? 25 : 20;
    } else if (action === "sell") {
      // Selling locks in losses
      const sellAmount = currentStockValue * 0.5;
      setPortfolio(prev => ({
        ...prev,
        stocks: prev.stocks * 0.5,
        cash: prev.cash + sellAmount
      }));
      actionDescription = "Sold 50% of stocks (locked in losses)";
      pointsEarned = currentEvent.sentiment === "optimism" ? 5 : -10;
    } else if (action === "buy") {
      // Buying more with cash
      const buyAmount = Math.min(portfolio.cash * 0.5, portfolio.cash);
      if (buyAmount > 0) {
        const additionalShares = buyAmount / (marketValue / 100);
        setPortfolio(prev => ({
          ...prev,
          stocks: prev.stocks + additionalShares,
          cash: prev.cash - buyAmount
        }));
        actionDescription = "Bought more stocks on the dip";
        pointsEarned = currentEvent.sentiment === "panic" ? 30 : currentEvent.sentiment === "fear" ? 25 : 15;
      }
    } else if (action === "rebalance") {
      // Rebalance to original 70/20/10
      const targetStocks = totalValue * 0.7;
      const targetBonds = totalValue * 0.2;
      const targetCash = totalValue * 0.1;
      
      setPortfolio({
        stocks: (targetStocks / currentStockValue) * portfolio.stocks,
        bonds: targetBonds,
        cash: targetCash
      });
      actionDescription = "Rebalanced to target allocation";
      pointsEarned = 20;
    }

    setDecisions(prev => [...prev, actionDescription]);
    setActionTaken(action);
    setScore(prev => prev + Math.max(pointsEarned, 0));

    // Apply market change
    setTimeout(() => {
      const newMarketValue = marketValue * (1 + currentEvent.marketChange / 100);
      setMarketValue(newMarketValue);
      
      if (currentMonth < MARKET_EVENTS.length - 1) {
        setCurrentMonth(prev => prev + 1);
        setActionTaken(null);
      } else {
        setView("results");
      }
    }, 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case "panic": return "bg-red-600 text-white";
      case "fear": return "bg-orange-500 text-white";
      case "uncertainty": return "bg-amber-500 text-white";
      case "hope": return "bg-blue-500 text-white";
      case "optimism": return "bg-emerald-500 text-white";
      default: return "bg-slate-500 text-white";
    }
  };

  const getPerformanceFeedback = () => {
    if (totalReturn >= 5) return {
      emoji: "🏆",
      title: "Market Master!",
      msg: "You stayed disciplined and came out ahead. Your strategy worked!",
      color: "text-emerald-600"
    };
    if (totalReturn >= -5) return {
      emoji: "💪",
      title: "Survivor!",
      msg: "You weathered the storm and protected your capital. Well done!",
      color: "text-blue-600"
    };
    if (totalReturn >= -15) return {
      emoji: "📚",
      title: "Learning Experience",
      msg: "You took some losses but gained valuable experience.",
      color: "text-amber-600"
    };
    return {
      emoji: "📉",
      title: "Emotional Investing",
      msg: "Panic selling destroyed your returns. Next time, stick to your strategy!",
      color: "text-red-600"
    };
  };

  const feedback = getPerformanceFeedback();

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "setup") setView("intro");
        else if (view === "simulation" && onBack) onBack();
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
        <div className="flex flex-col items-center justify-center max-w-[1000px] mx-auto px-6 py-16">
          <div className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-700 rounded-full mb-6">
<span className="text-sm font-bold uppercase tracking-widest">Lesson 2</span>          </div>

          <h1 className="text-[36px] font-bold text-[#0D171C] leading-tight text-center mb-4">
            Survive the Market Crash
          </h1>
          <p className="text-center mb-10 max-w-2xl text-slate-700 text-lg">
            Your portfolio is about to face a 25% decline over 3 months. Will you panic sell, double down, 
            or stay the course? Your decisions will determine your outcome.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-sm font-bold mb-1">Start with $100K</h3>
              <p className="text-xs text-slate-600">Typical retirement portfolio</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">📉</div>
              <h3 className="text-sm font-bold mb-1">Face 6 Months</h3>
              <p className="text-xs text-slate-600">Real market events</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-sm font-bold mb-1">Make Decisions</h3>
              <p className="text-xs text-slate-600">Hold, sell, buy, or rebalance</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-rose-100 text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-sm font-bold mb-1">See Outcomes</h3>
              <p className="text-xs text-slate-600">Compare strategies</p>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-10 max-w-2xl">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Remember Your Training
            </h3>
            <ul className="text-amber-800 text-sm space-y-2">
              <li>• <strong>Time in the market</strong> beats timing the market</li>
              <li>• <strong>DCA investors</strong> buy more shares when prices drop</li>
              <li>• <strong>Emotional decisions</strong> destroy 3-5% of returns annually</li>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">Your Portfolio</h2>
            <p className="text-slate-600 text-center mb-8">
              This is a typical balanced portfolio for someone in their 30s-40s
            </p>

            {/* Portfolio Visualization */}
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
              <h3 className="font-bold text-slate-900 mb-3">What This Means:</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• <strong>70% stocks</strong> - Growth potential but volatile</li>
                <li>• <strong>20% bonds</strong> - Stability and income</li>
                <li>• <strong>10% cash</strong> - Emergency funds & opportunities</li>
              </ul>
            </div>

            <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 mb-8">
              <p className="text-rose-800 text-sm font-medium">
                <span className="font-bold">Scenario:</span> A bear market is beginning. 
                Over the next 6 months, you'll face market volatility and make key decisions.
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-slate-700">Month {currentMonth + 1} of 6</span>
              <span className="text-slate-500">Market Performance: {marketValue > 100 ? '+' : ''}{(marketValue - 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500" 
                style={{ width: `${((currentMonth + 1) / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Portfolio Value</p>
              <p className="text-xl font-black text-slate-900">${Math.round(totalValue).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Return</p>
              <p className={`text-xl font-black ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Cash Available</p>
              <p className="text-xl font-black text-amber-600">${Math.round(portfolio.cash).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Strategy Score</p>
              <p className="text-xl font-black text-blue-600">{score} pts</p>
            </div>
          </div>

          {/* News Event */}
          {!actionTaken && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 mb-6 animate-in zoom-in">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${getSentimentColor(currentEvent.sentiment)}`}>
                {currentEvent.sentiment}
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-3">{currentEvent.headline}</h2>
              <p className="text-slate-600 mb-6">{currentEvent.newsDetails}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className={`p-4 rounded-xl ${currentEvent.marketChange < 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <p className="text-sm font-medium text-slate-600">Market Movement</p>
                  <p className={`text-3xl font-black ${currentEvent.marketChange < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {currentEvent.marketChange >= 0 ? '+' : ''}{currentEvent.marketChange}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50">
                  <p className="text-sm font-medium text-slate-600">Your Stocks Will Be Worth</p>
                  <p className="text-3xl font-black text-blue-700">
                    ${Math.round(currentStockValue * (1 + currentEvent.marketChange / 100)).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-lg font-bold text-slate-900 mb-4">What will you do?</p>

              {/* Decision Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDecision("hold")}
                  className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50 text-left hover:border-blue-400 transition-all"
                >
                  <div className="font-bold text-blue-900 mb-1">✊ Hold Steady</div>
                  <p className="text-xs text-blue-700">Stay the course. Trust your strategy.</p>
                </button>

                <button
                  onClick={() => handleDecision("sell")}
                  className="p-4 rounded-xl border-2 border-red-200 bg-red-50 text-left hover:border-red-400 transition-all"
                >
                  <div className="font-bold text-red-900 mb-1">💸 Sell 50%</div>
                  <p className="text-xs text-red-700">Cut losses. Move to cash.</p>
                </button>

                <button
                  onClick={() => handleDecision("buy")}
                  disabled={portfolio.cash < 1000}
                  className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-left hover:border-emerald-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="font-bold text-emerald-900 mb-1">💰 Buy More</div>
                  <p className="text-xs text-emerald-700">Stocks are on sale. Buy the dip!</p>
                </button>

                <button
                  onClick={() => handleDecision("rebalance")}
                  className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50 text-left hover:border-purple-400 transition-all"
                >
                  <div className="font-bold text-purple-900 mb-1">⚖️ Rebalance</div>
                  <p className="text-xs text-purple-700">Return to 70/20/10 allocation.</p>
                </button>
              </div>
            </div>
          )}

          {/* Action Feedback */}
          {actionTaken && (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 animate-in fade-in">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Processing Your Decision...</h3>
              <p className="text-slate-600 mb-4">
                You chose to <strong>{decisions[decisions.length - 1]}</strong>
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500">Applying market changes...</p>
              </div>
            </div>
          )}

          {/* Decision History */}
          {decisions.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">Your Decisions:</h3>
              <div className="space-y-2">
                {decisions.map((decision, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="text-rose-600 font-bold">Month {idx + 1}:</span>
                    <span>{decision}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULTS
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-200 text-center">
          <div className="text-6xl mb-4">{feedback.emoji}</div>
          <h2 className={`text-3xl font-black mb-2 ${feedback.color}`}>{feedback.title}</h2>
          <p className="text-slate-600 mb-8">{feedback.msg}</p>

          {/* Final Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Final Value</p>
              <p className="text-3xl font-black text-slate-900">${Math.round(totalValue).toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Total Return</p>
              <p className={`text-3xl font-black ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Strategy Score</p>
              <p className="text-3xl font-black text-blue-600">{score}/180</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 uppercase font-bold">Grade</p>
              <p className="text-3xl font-black text-violet-600">
                {score >= 150 ? 'A' : score >= 120 ? 'B' : score >= 90 ? 'C' : 'D'}
              </p>
            </div>
          </div>

          {/* Your Decisions */}
          <div className="text-left bg-slate-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-3">Your Journey:</h3>
            <div className="space-y-2">
              {decisions.map((decision, idx) => (
                <div key={idx} className="text-sm text-slate-700">
                  <span className="font-bold text-rose-600">Month {idx + 1}:</span> {decision}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(Math.round((score / 180) * 100))}
              className="w-full py-5 bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-rose-700 transition-all"
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
                setPortfolio({
                  stocks: 70000,
                  bonds: 20000,
                  cash: 10000
                });
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Try Different Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}