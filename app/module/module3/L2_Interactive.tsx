"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type View = "intro" | "wallet" | "trading" | "security" | "results";

type WalletChoice = "custodial" | "self" | "hybrid";
type TradingChoice = "buy" | "wait" | "research";
type SecurityChoice = "report" | "click" | "ignore";

type WalletScenario = {
  id: number;
  title: string;
  image: string;
  prompt: string;
  options: { id: WalletChoice; label: string; hint: string }[];
  correct: WalletChoice;
  explain: string;
};

type TradingScenario = {
  id: number;
  title: string;
  image: string;
  prompt: string;
  currentPrice: number;
  marketCap: string;
  options: { id: TradingChoice; label: string; hint: string }[];
  correct: TradingChoice;
  explain: string;
};

type SecurityCard = {
  id: number;
  title: string;
  image: string;
  message: string;
  redFlags: string[];
  correct: SecurityChoice;
  explain: string;
};

const WALLET_SCENARIOS: WalletScenario[] = [
  {
    id: 1,
    title: "You're brand new — small amount to learn",
    image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1200",
    prompt:
      "You just bought $50 of crypto to learn. You want it to be easy, but you also want to be safe.",
    options: [
      { id: "custodial", label: "Custodial wallet (exchange app)", hint: "Easy to start, but the exchange holds keys." },
      { id: "self", label: "Self-custody wallet (you hold keys)", hint: "More control, but you must protect seed phrase." },
      { id: "hybrid", label: "Hybrid: small on exchange + rest self-custody", hint: "Best of both worlds for learning." },
    ],
    correct: "hybrid",
    explain:
      "For beginners, a hybrid approach is usually smartest: keep a small learning balance on an exchange for simplicity, and move anything meaningful to self-custody once you understand seed phrase safety.",
  },
  {
    id: 2,
    title: "Long-term savings (you won't touch it for years)",
    image: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=1200",
    prompt:
      "You want to hold a long time. Convenience matters, but you don't want one company's failure to wipe you out.",
    options: [
      { id: "custodial", label: "Leave it all on an exchange forever", hint: "Convenient, but adds platform risk." },
      { id: "self", label: "Self-custody for long-term holdings", hint: "You control keys, but must secure seed phrase." },
      { id: "hybrid", label: "Hybrid, but mostly exchange", hint: "Still heavy platform risk." },
    ],
    correct: "self",
    explain:
      "For long-term holding, self-custody is often the safer default because it removes exchange/platform risk. The trade-off is responsibility: seed phrase safety is everything.",
  },
];

const TRADING_SCENARIOS: TradingScenario[] = [
  {
    id: 1,
    title: "New Meme Coin Going Viral",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200",
    prompt: "Everyone's talking about a new meme coin. It's up 300% this week. Your friend just made $2,000. Should you buy?",
    currentPrice: 0.00045,
    marketCap: "$12M",
    options: [
      { id: "buy", label: "Buy now — don't miss out!", hint: "FOMO can lead to buying at the peak." },
      { id: "research", label: "Research first, then decide with small amount", hint: "Smart approach: understand before investing." },
      { id: "wait", label: "Wait for a dip", hint: "Chasing pumps rarely works." },
    ],
    correct: "research",
    explain:
      "Viral coins often crash as fast as they rise. Research first, understand the risks, and only invest what you can afford to lose. Small market cap means extreme volatility.",
  },
  {
    id: 2,
    title: "Bitcoin During Market Crash",
    image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=1200",
    prompt: "Bitcoin dropped 25% overnight. The news is calling it a 'crypto winter.' You have some savings. What do you do?",
    currentPrice: 42000,
    marketCap: "$820B",
    options: [
      { id: "buy", label: "Buy the dip with a small portion", hint: "Dollar-cost averaging during dips can work long-term." },
      { id: "wait", label: "Wait for signs of recovery", hint: "Patience can prevent catching a falling knife." },
      { id: "research", label: "Research why it crashed first", hint: "Understanding the cause is crucial." },
    ],
    correct: "research",
    explain:
      "Never invest during panic without understanding why the crash happened. Research the cause, check if fundamentals changed, then decide with a clear head and proper position sizing.",
  },
];

const SECURITY_CARDS: SecurityCard[] = [
  {
    id: 1,
    title: "Giveaway Trap",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200",
    message:
      "🔥 Congrats! You won 0.5 BTC. Click this link and enter your seed phrase to claim in 5 minutes.",
    redFlags: ["Urgency pressure", "Asks for seed phrase", "Too good to be true", "Random link"],
    correct: "report",
    explain:
      "Seed phrases are NEVER used to claim prizes. This is a classic scam. The only winning move is to report/block it.",
  },
  {
    id: 2,
    title: "Fake Support DM",
    image: "https://images.unsplash.com/photo-1520975958225-915b0a7f2a68?q=80&w=1200",
    message:
      "Hi, I'm Support. Your wallet is at risk. Reply with your seed phrase so I can secure it for you.",
    redFlags: ["Unsolicited support", "Fear tactic", "Asks for seed phrase"],
    correct: "report",
    explain:
      "Real support will never ask for a seed phrase. If you share it, they can drain your wallet.",
  },
  {
    id: 3,
    title: "Suspicious Airdrop",
    image: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1200",
    message:
      "You received free tokens! Connect wallet + approve unlimited spending to 'unlock' them.",
    redFlags: ["Unlimited approval", "Random token", "Connect + approve trap"],
    correct: "ignore",
    explain:
      "Some airdrops are real, but random tokens + unlimited approvals are a common way to steal funds. Ignoring is often safest unless you verify from official sources.",
  },
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<View>("intro");

  // Wallet quiz
  const [walletIdx, setWalletIdx] = useState(0);
  const [walletPick, setWalletPick] = useState<WalletChoice | null>(null);
  const [walletLocked, setWalletLocked] = useState(false);
  const [walletScore, setWalletScore] = useState(0);

  // Trading scenarios
  const [tradingIdx, setTradingIdx] = useState(0);
  const [tradingPick, setTradingPick] = useState<TradingChoice | null>(null);
  const [tradingLocked, setTradingLocked] = useState(false);
  const [tradingScore, setTradingScore] = useState(0);

  // Security game
  const [securityIdx, setSecurityIdx] = useState(0);
  const [securityPick, setSecurityPick] = useState<SecurityChoice | null>(null);
  const [securityLocked, setSecurityLocked] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") return onBack?.();
        if (view === "wallet") {
          if (!walletLocked && walletIdx > 0) return setWalletIdx((v) => v - 1);
          return setView("intro");
        }
        if (view === "trading") {
          if (!tradingLocked && tradingIdx > 0) return setTradingIdx((v) => v - 1);
          return setView("wallet");
        }
        if (view === "security") {
          if (!securityLocked && securityIdx > 0) return setSecurityIdx((v) => v - 1);
          return setView("trading");
        }
        return setView("security");
      }}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  const wallet = WALLET_SCENARIOS[walletIdx];
  const trading = TRADING_SCENARIOS[tradingIdx];
  const security = SECURITY_CARDS[securityIdx];

  const totalQuestions = WALLET_SCENARIOS.length + TRADING_SCENARIOS.length + SECURITY_CARDS.length;

  const finalPercent = useMemo(() => {
    const correct = walletScore + tradingScore + securityScore;
    return Math.round((correct / totalQuestions) * 100);
  }, [walletScore, tradingScore, securityScore, totalQuestions]);

  const progress = useMemo(() => {
    if (view === "wallet") return ((walletIdx + (walletLocked ? 1 : 0)) / WALLET_SCENARIOS.length) * 33;
    if (view === "trading") return 33 + ((tradingIdx + (tradingLocked ? 1 : 0)) / TRADING_SCENARIOS.length) * 33;
    if (view === "security") return 66 + ((securityIdx + (securityLocked ? 1 : 0)) / SECURITY_CARDS.length) * 34;
    if (view === "results") return 100;
    return 0;
  }, [view, walletIdx, tradingIdx, securityIdx, walletLocked, tradingLocked, securityLocked]);

  // ---------------- INTRO ----------------
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <BackButton />
        <div className="w-full text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-700 rounded-full mb-4">
            <span className="text-sm font-bold uppercase tracking-widest">Lesson 2: Interactive</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Make Real Crypto Decisions</h1>
          <p className="text-[#4F7D96] mt-2">
            Choose wallets → evaluate trades → spot scams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">👛</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Wallet Decisions</h3>
            <p className="text-sm text-[#4F7D96]">Custodial vs self-custody choices.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Trading Scenarios</h3>
            <p className="text-sm text-[#4F7D96]">When to buy, wait, or research.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scam Detector</h3>
            <p className="text-sm text-[#4F7D96]">Identify phishing and fraud.</p>
          </div>
        </div>

        <button
          onClick={() => setView("wallet")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Lesson
        </button>
      </div>
    );
  }

  const ProgressBar = () => (
    <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
      <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${clamp(progress, 0, 100)}%` }} />
    </div>
  );

  // ---------------- WALLET ----------------
  if (view === "wallet") {
    const isCorrect = walletPick && walletPick === wallet.correct;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Wallet Decisions</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{wallet.title}</h2>
            <p className="text-slate-400 text-sm mt-2">Scenario {walletIdx + 1} of {WALLET_SCENARIOS.length}</p>
          </header>

          <ProgressBar />

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={wallet.image} alt={wallet.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>

            <p className="text-slate-700 leading-relaxed mb-6">{wallet.prompt}</p>

            <div className="space-y-3 mb-6">
              {wallet.options.map((opt) => {
                const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
                const selected = walletPick === opt.id;

                let styles = "border-slate-100 hover:bg-slate-50";
                if (!walletLocked && selected) styles = "border-[#0B5E8E] bg-sky-50";
                if (walletLocked && selected && opt.id === wallet.correct) styles = "border-green-300 bg-green-50";
                if (walletLocked && selected && opt.id !== wallet.correct) styles = "border-red-300 bg-red-50";
                if (walletLocked && !selected && opt.id === wallet.correct) styles = "border-green-200 bg-green-50/50";

                return (
                  <button
                    key={opt.id}
                    onClick={() => setWalletPick(opt.id)}
                    disabled={walletLocked}
                    className={`${base} ${styles}`}
                  >
                    <div className="font-bold text-slate-900 mb-1">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.hint}</div>
                  </button>
                );
              })}
            </div>

            {walletLocked && (
              <div
                className={`p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                  isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="font-black text-slate-900 mb-2">
                  {isCorrect ? "✅ Correct" : "💡 Better choice"} — why
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{wallet.explain}</p>
              </div>
            )}

            {!walletLocked ? (
              <button
                onClick={() => {
                  if (!walletPick) return;
                  setWalletLocked(true);
                  if (walletPick === wallet.correct) setWalletScore((s) => s + 1);
                }}
                disabled={!walletPick}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
              >
                Lock Answer
              </button>
            ) : (
              <button
                onClick={() => {
                  setWalletPick(null);
                  setWalletLocked(false);
                  if (walletIdx < WALLET_SCENARIOS.length - 1) setWalletIdx((v) => v + 1);
                  else setView("trading");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {walletIdx < WALLET_SCENARIOS.length - 1 ? "Next Scenario" : "Continue to Trading"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- TRADING ----------------
  if (view === "trading") {
    const isCorrect = tradingPick && tradingPick === trading.correct;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">Trading Scenarios</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{trading.title}</h2>
            <p className="text-slate-400 text-sm mt-2">Decision {tradingIdx + 1} of {TRADING_SCENARIOS.length}</p>
          </header>

          <ProgressBar />

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={trading.image} alt={trading.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Current Price</div>
                <div className="text-2xl font-black text-slate-900 mt-2">${trading.currentPrice.toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Market Cap</div>
                <div className="text-2xl font-black text-slate-900 mt-2">{trading.marketCap}</div>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed mb-6">{trading.prompt}</p>

            <div className="space-y-3 mb-6">
              {trading.options.map((opt) => {
                const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
                const selected = tradingPick === opt.id;

                let styles = "border-slate-100 hover:bg-slate-50";
                if (!tradingLocked && selected) styles = "border-[#0B5E8E] bg-sky-50";
                if (tradingLocked && selected && opt.id === trading.correct) styles = "border-green-300 bg-green-50";
                if (tradingLocked && selected && opt.id !== trading.correct) styles = "border-red-300 bg-red-50";
                if (tradingLocked && !selected && opt.id === trading.correct) styles = "border-green-200 bg-green-50/50";

                return (
                  <button
                    key={opt.id}
                    onClick={() => setTradingPick(opt.id)}
                    disabled={tradingLocked}
                    className={`${base} ${styles}`}
                  >
                    <div className="font-bold text-slate-900 mb-1">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.hint}</div>
                  </button>
                );
              })}
            </div>

            {tradingLocked && (
              <div
                className={`p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                  isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="font-black text-slate-900 mb-2">{isCorrect ? "✅ Smart move" : "💡 Better approach"}</div>
                <p className="text-slate-700 text-sm leading-relaxed">{trading.explain}</p>
              </div>
            )}

            {!tradingLocked ? (
              <button
                onClick={() => {
                  if (!tradingPick) return;
                  setTradingLocked(true);
                  if (tradingPick === trading.correct) setTradingScore((s) => s + 1);
                }}
                disabled={!tradingPick}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
              >
                Lock Decision
              </button>
            ) : (
              <button
                onClick={() => {
                  setTradingPick(null);
                  setTradingLocked(false);
                  if (tradingIdx < TRADING_SCENARIOS.length - 1) setTradingIdx((v) => v + 1);
                  else setView("security");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {tradingIdx < TRADING_SCENARIOS.length - 1 ? "Next Decision" : "Continue to Security"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- SECURITY ----------------
  if (view === "security") {
    const isCorrect = securityPick && securityPick === security.correct;

    const chooseBtn = (id: SecurityChoice, label: string) => {
      const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
      const selected = securityPick === id;

      let styles = "border-slate-100 hover:bg-slate-50";
      if (!securityLocked && selected) styles = "border-[#0B5E8E] bg-sky-50";
      if (securityLocked && selected && id === security.correct) styles = "border-green-300 bg-green-50";
      if (securityLocked && selected && id !== security.correct) styles = "border-red-300 bg-red-50";
      if (securityLocked && !selected && id === security.correct) styles = "border-green-200 bg-green-50/50";

      return (
        <button key={id} onClick={() => setSecurityPick(id)} disabled={securityLocked} className={`${base} ${styles}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{label}</span>
            <span className="text-xs text-slate-500">{id.toUpperCase()}</span>
          </div>
        </button>
      );
    };

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-rose-600 font-bold uppercase tracking-widest text-xs">Scam Detector</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{security.title}</h2>
            <p className="text-slate-400 text-sm mt-2">Message {securityIdx + 1} of {SECURITY_CARDS.length}</p>
          </header>

          <ProgressBar />

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={security.image} alt={security.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6">
              <div className="text-xs uppercase tracking-widest text-white/70 font-black mb-2">Incoming Message</div>
              <div className="text-lg font-black leading-snug">{security.message}</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="font-bold text-amber-900 mb-2">Red flags you should notice</div>
              <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
                {security.redFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 mb-6">
              {chooseBtn("report", "Report / Block")}
              {chooseBtn("ignore", "Ignore")}
              {chooseBtn("click", "Click the link")}
            </div>

            {securityLocked && (
              <div
                className={`p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                  isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="font-black text-slate-900 mb-2">{isCorrect ? "✅ Correct" : "💡 Not safe"}</div>
                <p className="text-slate-700 text-sm leading-relaxed">{security.explain}</p>
              </div>
            )}

            {!securityLocked ? (
              <button
                onClick={() => {
                  if (!securityPick) return;
                  setSecurityLocked(true);
                  if (securityPick === security.correct) setSecurityScore((s) => s + 1);
                }}
                disabled={!securityPick}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
              >
                Lock Choice
              </button>
            ) : (
              <button
                onClick={() => {
                  setSecurityPick(null);
                  setSecurityLocked(false);
                  if (securityIdx < SECURITY_CARDS.length - 1) setSecurityIdx((v) => v + 1);
                  else setView("results");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {securityIdx < SECURITY_CARDS.length - 1 ? "Next Message" : "See Results"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- RESULTS ----------------
  const resultMsg = (() => {
    if (finalPercent >= 85) return { e: "🚀", t: "Crypto-ready habits unlocked", d: "You made strong wallet, trading, and security decisions." };
    if (finalPercent >= 70) return { e: "🧠", t: "Strong foundation", d: "Good instincts. Keep practicing security and decision-making." };
    if (finalPercent >= 55) return { e: "📚", t: "Learning fast", d: "Review wallet custody and scam detection and retry." };
    return { e: "🔁", t: "Reset and try again", d: "Crypto punishes mistakes — the lesson is to build habits, not hype." };
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <BackButton />
      <section className="animate-in zoom-in duration-500 max-w-2xl mx-auto text-center pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <h2 className="text-4xl font-black mb-2 text-slate-900">
            {resultMsg.e} {resultMsg.t}
          </h2>
          <div className="text-6xl font-black text-slate-900 mb-4">{finalPercent}%</div>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">{resultMsg.d}</p>

          <div className="text-left bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-black mb-4">What you practiced</div>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>When to use custodial vs self-custody wallets</li>
              <li>How to evaluate trading opportunities (research vs FOMO)</li>
              <li>How scams try to steal seed phrases and access</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalPercent)}
              className="w-full py-5 bg-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-violet-700 transition-all"
            >
              Continue to Lesson 3
            </button>

            <button
              onClick={() => {
                setView("intro");
                setWalletIdx(0);
                setWalletPick(null);
                setWalletLocked(false);
                setWalletScore(0);

                setTradingIdx(0);
                setTradingPick(null);
                setTradingLocked(false);
                setTradingScore(0);

                setSecurityIdx(0);
                setSecurityPick(null);
                setSecurityLocked(false);
                setSecurityScore(0);
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Redo Lesson
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}