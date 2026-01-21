"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

/**
 * Module 3 — Lesson 1 (Definitions + Misconception Challenge)
 * Flow: intro → study → challenge → results
 * UI: matches your Module 8 styling (cards, images, back button, polished feedback)
 */

// -------------------- DATA --------------------

type Definition = {
  id: number;
  term: string;
  subtitle: string;
  definition: string;
  deeper: string;
  example: string;
  takeaway: string;
  image: string;
};

const DEFINITIONS: Definition[] = [
  {
    id: 1,
    term: "Cryptocurrency",
    subtitle: "Digital money secured by cryptography",
    definition:
      "Cryptocurrency is a type of digital asset that can be sent peer-to-peer without a bank. Ownership is tracked on a blockchain, and transfers are verified using cryptography.",
    deeper:
      "Crypto isn’t just “internet money.” It’s a system for moving value where the rules (supply, transfers, verification) are enforced by software + network consensus rather than one central company.",
    example:
      "If you send 0.01 BTC to someone, the network verifies you actually own it and records the transfer so the recipient can prove they received it.",
    takeaway:
      "Crypto is a system for transferring value + proving ownership without relying on a single middleman.",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1200",
  },
  {
    id: 2,
    term: "Blockchain",
    subtitle: "A shared ledger that updates in “blocks”",
    definition:
      "A blockchain is a record (ledger) of transactions that many computers share. Transactions are grouped into blocks, and blocks link together so the history becomes hard to change.",
    deeper:
      "You can think of it like a public spreadsheet that thousands of computers keep in sync. Because everyone has a copy, changing the past is extremely difficult (but not always impossible in every chain).",
    example:
      "On a public chain, anyone can view a transaction hash and see the timestamp, sender/receiver addresses, and amount transferred.",
    takeaway:
      "Blockchains are mainly about transparent record-keeping + shared agreement on what happened.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
  },
  {
    id: 3,
    term: "Wallet",
    subtitle: "A tool that controls access to your crypto",
    definition:
      "A wallet is software or hardware that lets you manage crypto by controlling your private keys. It doesn’t “store coins” like a physical wallet — it stores access.",
    deeper:
      "The blockchain stores balances. Your wallet holds the keys that prove you’re allowed to move funds. Wallets can be custodial (exchange holds keys) or self-custody (you hold keys).",
    example:
      "A hardware wallet keeps your private keys offline. You approve transactions on the device, reducing hack risk compared to leaving everything on an exchange.",
    takeaway:
      "If you don’t control the keys, you don’t fully control the crypto.",
    image: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1200",
  },
  {
    id: 4,
    term: "Private Key & Seed Phrase",
    subtitle: "Your master access (lose it = lose funds)",
    definition:
      "A private key is the secret that authorizes transactions. A seed phrase is a human-readable backup that can recreate your wallet keys.",
    deeper:
      "Anyone with your seed phrase can access your funds. There’s usually no “Forgot password” in self-custody. Security is powerful — but responsibility is real.",
    example:
      "If you store your seed phrase in screenshots or cloud notes, a compromised account can lead to stolen funds.",
    takeaway:
      "Treat your seed phrase like the keys to a safe: protect it, and never share it.",
    image: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=1200",
  },
  {
    id: 5,
    term: "Stablecoin",
    subtitle: "Crypto designed to stay near $1",
    definition:
      "A stablecoin is a token intended to track a stable value (usually USD). It’s used to move dollars quickly on-chain or to reduce volatility without leaving crypto rails.",
    deeper:
      "Not all stablecoins are equally safe. Some are backed by cash-like reserves, some by other assets, and some are algorithmic designs that can fail under stress.",
    example:
      "If you want to keep value stable while waiting to buy BTC later, you might hold a reserve-backed stablecoin instead of holding a volatile asset.",
    takeaway:
      "Stablecoins can reduce price swings — but you still must understand issuer + reserve risk.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200",
  },
  {
    id: 6,
    term: "Market Cap",
    subtitle: "Size = price × supply (context for risk)",
    definition:
      "Market cap is the coin price multiplied by the circulating supply. It helps compare the relative size of crypto assets.",
    deeper:
      "Smaller market cap assets often move more violently because it takes less money to push the price around. Bigger caps usually (not always) mean more liquidity and stability.",
    example:
      "A $50M market cap token can double (or crash) on thin trading. A trillion-dollar asset typically needs more sustained demand to move that much.",
    takeaway:
      "Market cap is a quick risk clue: smaller caps tend to be wilder.",
    image: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1200",
  },
  {
    id: 7,
    term: "Gas Fees",
    subtitle: "Network fees for processing transactions",
    definition:
      "Gas fees are fees paid to the network to include your transaction. Fees rise when the network is busy (higher demand for block space).",
    deeper:
      "Fees vary by chain and time. High fees can make small transactions impractical. Understanding fees helps you choose the right chain, timing, and transaction size.",
    example:
      "If fees are $8 and you’re sending $20, fees are 40% of your transfer — that’s usually not worth it.",
    takeaway:
      "Fees aren’t random — they’re supply/demand for network capacity.",
    image: "https://images.unsplash.com/photo-1518544887873-3c3db7866f0b?q=80&w=1200",
  },
  {
    id: 8,
    term: "Volatility",
    subtitle: "Big swings are normal in crypto",
    definition:
      "Volatility is how much prices move up and down. Crypto can swing dramatically in short periods — even without “news.”",
    deeper:
      "Volatility is not automatically bad, but it’s dangerous if you need money soon or if you panic-sell. A good plan includes position sizing and a timeline that can survive dips.",
    example:
      "A coin dropping 20% overnight is common in crypto. If you invested rent money, you may be forced to sell at the worst time.",
    takeaway:
      "Volatility is manageable when your time horizon and position size match reality.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
  },
];

type ChallengeChoice = "true" | "false" | "depends";

type Challenge = {
  id: number;
  statement: string;
  correct: ChallengeChoice;
  nuanceTitle: string;
  nuance: string;
  whyItMatters: string;
};

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    statement: "“If a coin is on a big exchange, it must be safe.”",
    correct: "false",
    nuanceTitle: "Listings reduce friction — not risk.",
    nuance:
      "Exchanges list assets for many reasons (demand, fees, competition). A listed coin can still be highly speculative, illiquid, or vulnerable to hype cycles.",
    whyItMatters:
      "Safety comes from fundamentals + risk management — not the platform logo next to the ticker.",
  },
  {
    id: 2,
    statement: "“Stablecoins are risk-free because they’re always $1.”",
    correct: "false",
    nuanceTitle: "They reduce volatility, but introduce other risks.",
    nuance:
      "Reserve quality, issuer solvency, depegs, and regulatory issues can all matter. ‘Stable’ refers to price target — not guaranteed safety.",
    whyItMatters:
      "Understanding *what backs* the stablecoin helps you avoid surprises during market stress.",
  },
  {
    id: 3,
    statement: "“If I lose my seed phrase, I can reset it like a password.”",
    correct: "false",
    nuanceTitle: "Self-custody has no password reset.",
    nuance:
      "With self-custody wallets, the seed phrase is the backup. If it’s lost and you lose device access too, the funds are typically unrecoverable.",
    whyItMatters:
      "Crypto rewards responsibility — but mistakes can be permanent. Backup strategy is essential.",
  },
  {
    id: 4,
    statement: "“Crypto is anonymous.”",
    correct: "depends",
    nuanceTitle: "Most public chains are *pseudonymous*.",
    nuance:
      "Addresses don’t show your name, but transactions are public. If an address becomes linked to you (exchange KYC, leaks, re-use, analysis), your history can be traced.",
    whyItMatters:
      "Privacy assumptions affect safety. Learn basic opsec: address reuse, public data, and custody choices.",
  },
];

// -------------------- COMPONENT --------------------

export default function L1_Definitions({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "study" | "challenge" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [lockedChoice, setLockedChoice] = useState<ChallengeChoice | null>(null);
  const [score, setScore] = useState(0);

  const showBackButton = view === "intro" || view === "study" || (view === "challenge" && !lockedChoice);

  const handleBack = () => {
    if (view === "intro") {
      onBack?.();
      return;
    }
    if (view === "study") {
      if (currentIndex > 0) setCurrentIndex((v) => v - 1);
      else setView("intro");
      return;
    }
    if (view === "challenge") {
      if (challengeIdx > 0 && !lockedChoice) setChallengeIdx((v) => v - 1);
      else setView("study");
      return;
    }
    if (view === "results") setView("challenge");
  };

  const definition = DEFINITIONS[currentIndex];

  const progress = useMemo(() => {
    if (view === "study") return ((currentIndex + 1) / DEFINITIONS.length) * 50;
    if (view === "challenge") return 50 + ((challengeIdx + 1) / CHALLENGES.length) * 50;
    if (view === "results") return 100;
    return 0;
  }, [view, currentIndex, challengeIdx]);

  const feedback = useMemo(() => {
    const percentage = Math.round((score / CHALLENGES.length) * 100);

    if (percentage >= 90) {
      return {
        title: "Crypto-Ready!",
        msg: "You’re thinking like someone who understands both the upside *and* the risks.",
        emoji: "🚀",
        color: "text-emerald-600",
        img: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1200",
      };
    }
    if (percentage >= 70) {
      return {
        title: "Solid Base",
        msg: "You’ve got the fundamentals. Tighten security + risk habits and you’ll level up fast.",
        emoji: "🧠",
        color: "text-sky-600",
        img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200",
      };
    }
    if (percentage >= 50) {
      return {
        title: "Good Start",
        msg: "You’re learning — revisit a few concepts (wallets, stablecoins, safety) and try again.",
        emoji: "📚",
        color: "text-amber-600",
        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200",
      };
    }
    return {
      title: "Let’s Reset",
      msg: "Crypto moves fast. Re-run the definitions, then come back — you’ll improve quickly.",
      emoji: "🔁",
      color: "text-rose-600",
      img: "https://images.unsplash.com/photo-1520975958225-915b0a7f2a68?q=80&w=1200",
    };
  }, [score]);

  const percentage = useMemo(() => Math.round((score / CHALLENGES.length) * 100), [score]);

  function handleStart() {
    setView("study");
    setCurrentIndex(0);
    setChallengeIdx(0);
    setLockedChoice(null);
    setScore(0);
  }

  function handleNextDefinition() {
    if (currentIndex < DEFINITIONS.length - 1) setCurrentIndex((v) => v + 1);
    else setView("challenge");
  }

  function handleRedoLesson() {
    setView("intro");
    setCurrentIndex(0);
    setChallengeIdx(0);
    setLockedChoice(null);
    setScore(0);
  }

  function choose(choice: ChallengeChoice) {
    setLockedChoice(choice);
    const c = CHALLENGES[challengeIdx];
    const correct = choice === c.correct;
    if (correct) setScore((s) => s + 1);
  }

  function next() {
    setLockedChoice(null);
    if (challengeIdx < CHALLENGES.length - 1) setChallengeIdx((v) => v + 1);
    else setView("results");
  }

  const BackButton = () =>
    showBackButton ? (
      <button
        onClick={handleBack}
        className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>
    ) : null;

  // -------------------- VIEW: INTRO --------------------
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <BackButton />

        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 1: Definitions</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Crypto Basics (Without the Hype)</h1>
          <p className="text-[#4F7D96] mt-2">
            Learn the essentials → then test yourself on common crypto misconceptions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Understand the Core Concepts</h3>
            <p className="text-sm text-[#4F7D96]">
              Wallets, keys, stablecoins, fees — the stuff that actually prevents beginner mistakes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Challenge Your Assumptions</h3>
            <p className="text-sm text-[#4F7D96]">
              See what’s true, false, or “it depends” — like a real investor.
            </p>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Lesson
        </button>
      </div>
    );
  }

  // -------------------- VIEW: STUDY --------------------
  if (view === "study") {
    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Definitions</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{definition.term}</h2>
            <p className="text-slate-500 mt-1">{definition.subtitle}</p>
            <p className="text-slate-400 text-sm mt-2">
              Card {currentIndex + 1} of {DEFINITIONS.length}
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-52 rounded-2xl overflow-hidden mb-6">
              <Image src={definition.image} alt={definition.term} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white text-xl font-black drop-shadow">{definition.term}</div>
                <div className="text-white/90 text-sm mt-1 drop-shadow">{definition.subtitle}</div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Simple definition</p>
                <p className="text-slate-700 leading-relaxed">{definition.definition}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-100">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Deeper insight</p>
                <p className="text-slate-700 leading-relaxed">{definition.deeper}</p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <p className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">Example</p>
                <p className="text-emerald-900 leading-relaxed">{definition.example}</p>
              </div>

              <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
                <p className="text-xs font-black text-sky-900 uppercase tracking-wider mb-1">Takeaway</p>
                <p className="text-sky-900 leading-relaxed">{definition.takeaway}</p>
              </div>
            </div>

            <button
              onClick={handleNextDefinition}
              className="mt-8 w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
            >
              {currentIndex === DEFINITIONS.length - 1 ? "Start Challenge" : "Next Card"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // -------------------- VIEW: CHALLENGE --------------------
  if (view === "challenge") {
    const c = CHALLENGES[challengeIdx];
    const isCorrect = lockedChoice === c.correct;

    const choiceBtn = (id: ChallengeChoice, label: string) => {
      const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
      const isSelected = lockedChoice === id;

      let styles = "border-slate-100 hover:bg-slate-50";
      if (isSelected && lockedChoice) styles = isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50";
      if (!lockedChoice && isSelected) styles = "border-[#0B5E8E] bg-sky-50";

      return (
        <button key={id} onClick={() => choose(id)} disabled={Boolean(lockedChoice)} className={`${base} ${styles}`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{label}</span>
            <span className="text-xs opacity-60">{id.toUpperCase()}</span>
          </div>
        </button>
      );
    };

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Misconception Challenge</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">True, False, or Depends?</h2>
            <p className="text-slate-400 text-sm mt-2">
              Statement {challengeIdx + 1} of {CHALLENGES.length}
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
              <div className="text-xs font-black text-slate-600 uppercase tracking-wider mb-2">Statement</div>
              <div className="text-xl font-bold text-slate-900 leading-snug">{c.statement}</div>
            </div>

            <div className="space-y-3 mb-6">
              {choiceBtn("true", "True")}
              {choiceBtn("false", "False")}
              {choiceBtn("depends", "It depends")}
            </div>

            {lockedChoice && (
              <div
                className={`p-6 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{isCorrect ? "✅" : "💡"}</span>
                  <span className={`font-bold uppercase tracking-wider text-sm ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
                    {isCorrect ? "Correct!" : "Not quite — here’s the nuance"}
                  </span>
                </div>

                <div className="text-slate-900 font-black text-lg">{c.nuanceTitle}</div>

                <div className="mt-3 bg-white/70 rounded-xl p-4 border border-black/5">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Explanation</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{c.nuance}</p>
                </div>

                <div className="mt-3 bg-white/70 rounded-xl p-4 border border-black/5">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1">Why this matters</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{c.whyItMatters}</p>
                </div>
              </div>
            )}

            <button
              disabled={!lockedChoice}
              onClick={next}
              className="mt-8 w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
            >
              {challengeIdx === CHALLENGES.length - 1 ? "Finish Lesson" : "Next Statement"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // -------------------- VIEW: RESULTS --------------------
  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-6">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="relative w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
            <Image src={feedback.img} alt="result" fill className="object-cover" />
          </div>

          <h2 className={`text-4xl font-black mb-2 ${feedback.color}`}>
            {feedback.emoji} {feedback.title}
          </h2>

          <div className="text-6xl font-black text-slate-900 mb-4">{percentage}%</div>
          <p className="text-slate-600 text-lg mb-10 leading-relaxed">{feedback.msg}</p>

          <div className="space-y-3">
            {/* IMPORTANT: your module page expects % */}
            <button
              onClick={() => onComplete(percentage)}
              className="w-full py-5 bg-sky-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-sky-800 transition-all"
            >
              Continue to Lesson 2
            </button>

            <button
              onClick={handleRedoLesson}
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
