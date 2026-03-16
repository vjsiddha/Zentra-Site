"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { awardXP, XP_REWARDS } from "@/lib/progress";
import {
  ChevronLeft,
  Wallet,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

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
    title: "You're brand new to crypto",
    image:
      "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1200",
    prompt:
      "You just bought $50 of crypto to learn. You want something simple, but you also want to stay safe.",
    options: [
      {
        id: "custodial",
        label: "Custodial wallet",
        hint: "Easy to use, but the exchange controls the keys.",
      },
      {
        id: "self",
        label: "Self-custody wallet",
        hint: "You control the keys, but you must protect your seed phrase.",
      },
      {
        id: "hybrid",
        label: "Hybrid approach",
        hint: "Keep a little on the exchange and move more serious money to self-custody later.",
      },
    ],
    correct: "hybrid",
    explain:
      "For beginners, a hybrid approach is often the smartest. It lets you learn with a small amount while reducing risk once you are more confident.",
  },
  {
    id: 2,
    title: "You want to hold for years",
    image:
      "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=1200",
    prompt:
      "You plan to hold your crypto for a long time. You want strong protection and do not want one company's failure to wipe you out.",
    options: [
      {
        id: "custodial",
        label: "Leave everything on the exchange",
        hint: "Convenient, but it adds platform risk.",
      },
      {
        id: "self",
        label: "Move long-term holdings to self-custody",
        hint: "More responsibility, but more control.",
      },
      {
        id: "hybrid",
        label: "Keep most of it on the exchange",
        hint: "Still leaves you exposed to exchange problems.",
      },
    ],
    correct: "self",
    explain:
      "For long-term holdings, self-custody is usually safer because you control the keys. The trade-off is that you must protect your seed phrase carefully.",
  },
];

const TRADING_SCENARIOS: TradingScenario[] = [
  {
    id: 1,
    title: "A meme coin is going viral",
    image:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200",
    prompt:
      "A new meme coin is up 300% this week. Your friend says they made money fast. What is the smartest move?",
    currentPrice: 0.00045,
    marketCap: "$12M",
    options: [
      {
        id: "buy",
        label: "Buy now before it goes higher",
        hint: "This is usually driven by FOMO.",
      },
      {
        id: "research",
        label: "Research first, then decide carefully",
        hint: "Understand the project before risking money.",
      },
      {
        id: "wait",
        label: "Just wait for a dip",
        hint: "Better than chasing, but still not enough without research.",
      },
    ],
    correct: "research",
    explain:
      "When a coin goes viral, price can rise and crash very quickly. Research first, understand the risk, and only use money you can afford to lose.",
  },
  {
    id: 2,
    title: "Bitcoin crashes overnight",
    image:
      "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=1200",
    prompt:
      "Bitcoin falls 25% overnight and people online are panicking. You have savings ready. What should you do first?",
    currentPrice: 42000,
    marketCap: "$820B",
    options: [
      {
        id: "buy",
        label: "Buy the dip right now",
        hint: "It may recover, but rushing in blindly is risky.",
      },
      {
        id: "wait",
        label: "Wait for recovery signs",
        hint: "This can help, but you should still understand why it crashed.",
      },
      {
        id: "research",
        label: "Research the cause of the crash first",
        hint: "Always understand the situation before investing.",
      },
    ],
    correct: "research",
    explain:
      "Never invest during panic without understanding what caused the crash. First learn what happened, then decide calmly with proper risk management.",
  },
];

const SECURITY_CARDS: SecurityCard[] = [
  {
    id: 1,
    title: "Giveaway trap",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200",
    message:
      "Congrats! You won 0.5 BTC. Click this link and enter your seed phrase to claim it in 5 minutes.",
    redFlags: [
      "Creates urgency",
      "Asks for seed phrase",
      "Too good to be true",
      "Unknown link",
    ],
    correct: "report",
    explain:
      "A seed phrase should never be shared to claim a prize. This is a scam. The safest move is to report or block it.",
  },
  {
    id: 2,
    title: "Fake support message",
    image:
      "https://images.unsplash.com/photo-1520975958225-915b0a7f2a68?q=80&w=1200",
    message:
      "Hi, I'm support. Your wallet is at risk. Send me your seed phrase so I can secure it for you.",
    redFlags: [
      "Unsolicited message",
      "Fear tactic",
      "Requests seed phrase",
    ],
    correct: "report",
    explain:
      "Real support will never ask for your seed phrase. If you share it, they can steal everything in your wallet.",
  },
  {
    id: 3,
    title: "Suspicious airdrop",
    image:
      "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1200",
    message:
      "You received free tokens. Connect your wallet and approve unlimited spending to unlock them.",
    redFlags: [
      "Random token",
      "Unlimited approval request",
      "Wallet connection trap",
    ],
    correct: "ignore",
    explain:
      "Some airdrops are real, but random tokens plus unlimited approvals are a common scam pattern. Ignoring it is usually safest unless you verify it from official sources.",
  },
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function Pill({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "amber" | "rose" | "green";
}) {
  const styles =
    tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : tone === "rose"
      ? "bg-rose-50 text-rose-700 border-rose-100"
      : "bg-green-50 text-green-700 border-green-100";

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-bold ${styles}`}
    >
      {children}
    </div>
  );
}

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<View>("intro");

  const [walletIdx, setWalletIdx] = useState(0);
  const [walletPick, setWalletPick] = useState<WalletChoice | null>(null);
  const [walletLocked, setWalletLocked] = useState(false);
  const [walletScore, setWalletScore] = useState(0);

  const [tradingIdx, setTradingIdx] = useState(0);
  const [tradingPick, setTradingPick] = useState<TradingChoice | null>(null);
  const [tradingLocked, setTradingLocked] = useState(false);
  const [tradingScore, setTradingScore] = useState(0);

  const [securityIdx, setSecurityIdx] = useState(0);
  const [securityPick, setSecurityPick] = useState<SecurityChoice | null>(
    null
  );
  const [securityLocked, setSecurityLocked] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);

  const wallet = WALLET_SCENARIOS[walletIdx];
  const trading = TRADING_SCENARIOS[tradingIdx];
  const security = SECURITY_CARDS[securityIdx];

  const totalQuestions =
    WALLET_SCENARIOS.length + TRADING_SCENARIOS.length + SECURITY_CARDS.length;

  const finalPercent = useMemo(() => {
    const correct = walletScore + tradingScore + securityScore;
    return Math.round((correct / totalQuestions) * 100);
  }, [walletScore, tradingScore, securityScore, totalQuestions]);

  const progress = useMemo(() => {
    if (view === "wallet") {
      return (
        ((walletIdx + (walletLocked ? 1 : 0)) / WALLET_SCENARIOS.length) * 33
      );
    }
    if (view === "trading") {
      return (
        33 +
        ((tradingIdx + (tradingLocked ? 1 : 0)) / TRADING_SCENARIOS.length) *
          33
      );
    }
    if (view === "security") {
      return (
        66 +
        ((securityIdx + (securityLocked ? 1 : 0)) / SECURITY_CARDS.length) * 34
      );
    }
    if (view === "results") return 100;
    return 0;
  }, [
    view,
    walletIdx,
    walletLocked,
    tradingIdx,
    tradingLocked,
    securityIdx,
    securityLocked,
  ]);

  const resetLesson = () => {
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
  };

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") return onBack?.();
        if (view === "wallet") {
          if (!walletLocked && walletIdx > 0) return setWalletIdx((v) => v - 1);
          return setView("intro");
        }
        if (view === "trading") {
          if (!tradingLocked && tradingIdx > 0)
            return setTradingIdx((v) => v - 1);
          return setView("wallet");
        }
        if (view === "security") {
          if (!securityLocked && securityIdx > 0)
            return setSecurityIdx((v) => v - 1);
          return setView("trading");
        }
        return setView("security");
      }}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <ChevronLeft className="w-5 h-5" />
      Back
    </button>
  );

  const ProgressBar = () => (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
        <span>Progress</span>
        <span>{Math.round(clamp(progress, 0, 100))}%</span>
      </div>
      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
          style={{ width: `${clamp(progress, 0, 100)}%` }}
        />
      </div>
    </div>
  );

  const CardShell = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-8">
      {children}
    </div>
  );

  const OptionCard = ({
    title,
    hint,
    selected,
    locked,
    correct,
    onClick,
  }: {
    title: string;
    hint: string;
    selected: boolean;
    locked: boolean;
    correct: boolean;
    onClick: () => void;
  }) => {
    let styles = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
    if (!locked && selected) styles = "border-blue-500 bg-blue-50";
    if (locked && selected && correct)
      styles = "border-green-400 bg-green-50";
    if (locked && selected && !correct) styles = "border-red-400 bg-red-50";
    if (locked && !selected && correct)
      styles = "border-green-300 bg-green-50/70";

    return (
      <button
        onClick={onClick}
        disabled={locked}
        className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${styles}`}
      >
        <div className="font-bold text-slate-900 mb-1">{title}</div>
        <div className="text-sm text-slate-500 leading-relaxed">{hint}</div>
      </button>
    );
  };

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-[#F7FAFC] px-6 pt-16 pb-12">
        <div className="max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-5 py-2.5 bg-sky-100 text-sky-700 rounded-full mb-6">
              <span className="text-sm font-bold uppercase tracking-widest">
                Lesson 2: Interactive
              </span>
            </div>
            <h1 className="text-[36px] font-bold text-slate-900 mb-4">
              Make Real Crypto Decisions
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Practice choosing wallets, thinking through trades, and spotting
              scams. This lesson is designed to help you learn by deciding, not
              just reading.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Wallet Decisions
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Learn when exchange wallets are useful and when self-custody
                makes more sense.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Trading Scenarios
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Practice slowing down, avoiding FOMO, and making smarter
                investing decisions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-rose-100 flex items-center justify-center mb-4">
                <ShieldAlert className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Scam Detector
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Spot common tricks scammers use to steal seed phrases and wallet
                access.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-3xl p-8 text-white text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Ready to test your instincts?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-6 leading-relaxed">
              There are {totalQuestions} decisions in this lesson. Read each
              situation carefully and choose what you think is safest or
              smartest.
            </p>
            <button
              onClick={() => setView("wallet")}
              className="px-10 py-4 bg-white text-slate-900 rounded-full font-bold hover:scale-105 transition-transform shadow-md"
            >
              Start Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "wallet") {
    const isCorrect = walletPick && walletPick === wallet.correct;

    return (
      <div className="min-h-screen bg-[#F7FAFC] px-6 pt-16 pb-12">
        <BackButton />

        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-6">
            <Pill tone="blue">Wallet Decisions</Pill>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">
              {wallet.title}
            </h2>
            <p className="text-slate-500 mt-2">
              Scenario {walletIdx + 1} of {WALLET_SCENARIOS.length}
            </p>
          </div>

          <ProgressBar />

          <CardShell>
            <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
              <Image
                src={wallet.image}
                alt={wallet.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-bold">
                <Wallet className="w-5 h-5" />
                Scenario
              </div>
              <p className="text-slate-700 leading-relaxed">{wallet.prompt}</p>
            </div>

            <div className="space-y-3 mb-6">
              {wallet.options.map((opt) => (
                <OptionCard
                  key={opt.id}
                  title={opt.label}
                  hint={opt.hint}
                  selected={walletPick === opt.id}
                  locked={walletLocked}
                  correct={opt.id === wallet.correct}
                  onClick={() => setWalletPick(opt.id)}
                />
              ))}
            </div>

            {walletLocked && (
              <div
                className={`rounded-2xl border-2 p-5 mb-6 animate-in fade-in slide-in-from-top-2 ${
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  {isCorrect ? "Correct choice" : "Better choice"}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {wallet.explain}
                </p>
              </div>
            )}

            {!walletLocked ? (
              <button
                onClick={() => {
                  if (!walletPick) return;
                  setWalletLocked(true);
                  if (walletPick === wallet.correct)
                    setWalletScore((s) => s + 1);
                }}
                disabled={!walletPick}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition disabled:bg-slate-200 disabled:text-slate-500"
              >
                Lock Answer
              </button>
            ) : (
              <button
                onClick={async () => {
                  await awardXP(20);
                  setWalletPick(null);
                  setWalletLocked(false);
                  if (walletIdx < WALLET_SCENARIOS.length - 1) {
                    setWalletIdx((v) => v + 1);
                  } else {
                    setView("trading");
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {walletIdx < WALLET_SCENARIOS.length - 1
                  ? "Next Scenario"
                  : "Continue to Trading"}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </CardShell>
        </div>
      </div>
    );
  }

  if (view === "trading") {
    const isCorrect = tradingPick && tradingPick === trading.correct;

    return (
      <div className="min-h-screen bg-[#F7FAFC] px-6 pt-16 pb-12">
        <BackButton />

        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-6">
            <Pill tone="amber">Trading Scenarios</Pill>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">
              {trading.title}
            </h2>
            <p className="text-slate-500 mt-2">
              Decision {tradingIdx + 1} of {TRADING_SCENARIOS.length}
            </p>
          </div>

          <ProgressBar />

          <CardShell>
            <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
              <Image
                src={trading.image}
                alt={trading.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Current Price
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  ${trading.currentPrice.toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-widest font-bold mb-2">
                  <Sparkles className="w-4 h-4" />
                  Market Cap
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {trading.marketCap}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold">
                <TrendingUp className="w-5 h-5" />
                Situation
              </div>
              <p className="text-slate-700 leading-relaxed">
                {trading.prompt}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {trading.options.map((opt) => (
                <OptionCard
                  key={opt.id}
                  title={opt.label}
                  hint={opt.hint}
                  selected={tradingPick === opt.id}
                  locked={tradingLocked}
                  correct={opt.id === trading.correct}
                  onClick={() => setTradingPick(opt.id)}
                />
              ))}
            </div>

            {tradingLocked && (
              <div
                className={`rounded-2xl border-2 p-5 mb-6 animate-in fade-in slide-in-from-top-2 ${
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  {isCorrect ? "Smart move" : "Better approach"}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {trading.explain}
                </p>
              </div>
            )}

            {!tradingLocked ? (
              <button
                onClick={() => {
                  if (!tradingPick) return;
                  setTradingLocked(true);
                  if (tradingPick === trading.correct)
                    setTradingScore((s) => s + 1);
                }}
                disabled={!tradingPick}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition disabled:bg-slate-200 disabled:text-slate-500"
              >
                Lock Decision
              </button>
            ) : (
              <button
                onClick={async () => {
                  await awardXP(20);
                  setTradingPick(null);
                  setTradingLocked(false);
                  if (tradingIdx < TRADING_SCENARIOS.length - 1) {
                    setTradingIdx((v) => v + 1);
                  } else {
                    setView("security");
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {tradingIdx < TRADING_SCENARIOS.length - 1
                  ? "Next Decision"
                  : "Continue to Security"}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </CardShell>
        </div>
      </div>
    );
  }

  if (view === "security") {
    const isCorrect = securityPick && securityPick === security.correct;

    const securityOption = (
      id: SecurityChoice,
      label: string,
      icon: React.ReactNode
    ) => {
      const selected = securityPick === id;
      let styles = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
      if (!securityLocked && selected) styles = "border-blue-500 bg-blue-50";
      if (securityLocked && selected && id === security.correct)
        styles = "border-green-400 bg-green-50";
      if (securityLocked && selected && id !== security.correct)
        styles = "border-red-400 bg-red-50";
      if (securityLocked && !selected && id === security.correct)
        styles = "border-green-300 bg-green-50/70";

      return (
        <button
          key={id}
          onClick={() => setSecurityPick(id)}
          disabled={securityLocked}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${styles}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {icon}
              <span className="font-bold text-slate-900">{label}</span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              {id}
            </span>
          </div>
        </button>
      );
    };

    return (
      <div className="min-h-screen bg-[#F7FAFC] px-6 pt-16 pb-12">
        <BackButton />

        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center mb-6">
            <Pill tone="rose">Scam Detector</Pill>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">
              {security.title}
            </h2>
            <p className="text-slate-500 mt-2">
              Message {securityIdx + 1} of {SECURITY_CARDS.length}
            </p>
          </div>

          <ProgressBar />

          <CardShell>
            <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
              <Image
                src={security.image}
                alt={security.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6">
              <div className="text-xs uppercase tracking-widest text-white/70 font-bold mb-2">
                Incoming Message
              </div>
              <p className="text-lg font-bold leading-relaxed">
                {security.message}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 text-amber-900 font-bold mb-3">
                <AlertTriangle className="w-5 h-5" />
                Red flags to notice
              </div>
              <div className="grid grid-cols-2 gap-3">
                {security.redFlags.map((flag) => (
                  <div
                    key={flag}
                    className="bg-white/80 rounded-xl px-4 py-3 text-sm font-semibold text-amber-900 border border-amber-100"
                  >
                    {flag}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {securityOption(
                "report",
                "Report or block it",
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              )}
              {securityOption(
                "ignore",
                "Ignore it",
                <Clock3 className="w-5 h-5 text-slate-600" />
              )}
              {securityOption(
                "click",
                "Click the link",
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            {securityLocked && (
              <div
                className={`rounded-2xl border-2 p-5 mb-6 animate-in fade-in slide-in-from-top-2 ${
                  isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  {isCorrect ? "Correct" : "Not safe"}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {security.explain}
                </p>
              </div>
            )}

            {!securityLocked ? (
              <button
                onClick={() => {
                  if (!securityPick) return;
                  setSecurityLocked(true);
                  if (securityPick === security.correct)
                    setSecurityScore((s) => s + 1);
                }}
                disabled={!securityPick}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition disabled:bg-slate-200 disabled:text-slate-500"
              >
                Lock Choice
              </button>
            ) : (
              <button
                onClick={async () => {
                  await awardXP(20);
                  setSecurityPick(null);
                  setSecurityLocked(false);
                  if (securityIdx < SECURITY_CARDS.length - 1) {
                    setSecurityIdx((v) => v + 1);
                  } else {
                    setView("results");
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {securityIdx < SECURITY_CARDS.length - 1
                  ? "Next Message"
                  : "See Results"}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </CardShell>
        </div>
      </div>
    );
  }

  const resultMsg = (() => {
    if (finalPercent >= 85) {
      return {
        title: "Crypto-ready habits unlocked",
        desc: "You made strong wallet, trading, and security decisions.",
        tone: "blue" as const,
      };
    }
    if (finalPercent >= 70) {
      return {
        title: "Strong foundation",
        desc: "Good instincts. Keep practicing and sharpening your decision-making.",
        tone: "green" as const,
      };
    }
    if (finalPercent >= 55) {
      return {
        title: "You are learning fast",
        desc: "Review wallet custody and scam detection, then try again.",
        tone: "amber" as const,
      };
    }
    return {
      title: "Reset and try again",
      desc: "Crypto rewards careful habits. The goal is not hype. It is smart decisions.",
      tone: "rose" as const,
    };
  })();

  return (
    <div className="min-h-screen bg-[#F7FAFC] px-6 pt-16 pb-12">
      <div className="max-w-3xl mx-auto animate-in zoom-in">
        <div className="bg-white rounded-[36px] p-10 shadow-2xl border border-slate-100 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <Pill tone={resultMsg.tone}>Lesson Complete</Pill>

          <h2 className="text-4xl font-bold text-slate-900 mt-5 mb-3">
            {resultMsg.title}
          </h2>

          <div className="text-7xl font-black text-slate-900 mb-4">
            {finalPercent}%
          </div>

          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            {resultMsg.desc}
          </p>

          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 mb-8 border border-blue-100 shadow-inner text-left">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                What you practiced
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                These are the skills this lesson helped you build.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-white px-4 py-4 border border-slate-100 shadow-sm">
                <div className="font-bold text-slate-900 mb-1">
                  Wallet choices
                </div>
                <div className="text-sm text-slate-600">
                  When custodial wallets help and when self-custody is safer.
                </div>
              </div>

              <div className="rounded-2xl bg-white px-4 py-4 border border-slate-100 shadow-sm">
                <div className="font-bold text-slate-900 mb-1">
                  Trading decisions
                </div>
                <div className="text-sm text-slate-600">
                  Why research beats panic and FOMO.
                </div>
              </div>

              <div className="rounded-2xl bg-white px-4 py-4 border border-slate-100 shadow-sm">
                <div className="font-bold text-slate-900 mb-1">
                  Scam spotting
                </div>
                <div className="text-sm text-slate-600">
                  How scammers try to steal seed phrases and wallet access.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={async () => {
                await awardXP(XP_REWARDS.COMPLETE_STEP + XP_REWARDS.COMPLETE_MODULE);
                onComplete(finalPercent);
              }}
              className="w-full py-6 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:opacity-95 transition"
            >
              Continue to Lesson 3
            </button>

            <button
              onClick={resetLesson}
              className="w-full py-5 bg-slate-100 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-200 transition"
            >
              Redo Lesson 2
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}