"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type View = "intro" | "wallet" | "scams" | "fees" | "results";

type WalletChoice = "custodial" | "self" | "hybrid";
type ScamChoice = "report" | "click" | "ignore";
type FeeChoice = "now" | "later" | "layer2";

type WalletScenario = {
  id: number;
  title: string;
  image: string;
  prompt: string;
  options: { id: WalletChoice; label: string; hint: string }[];
  correct: WalletChoice;
  explain: string;
};

type ScamCard = {
  id: number;
  title: string;
  image: string;
  message: string;
  redFlags: string[];
  correct: ScamChoice;
  explain: string;
};

type FeeScenario = {
  id: number;
  title: string;
  image: string;
  prompt: string;
  gasNow: number;
  gasLater: number;
  options: { id: FeeChoice; label: string; hint: string }[];
  correct: FeeChoice;
  explain: string;
};

const WALLET_SCENARIOS: WalletScenario[] = [
  {
    id: 1,
    title: "You’re brand new — small amount to learn",
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
    title: "Long-term savings (you won’t touch it for years)",
    image: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?q=80&w=1200",
    prompt:
      "You want to hold a long time. Convenience matters, but you don’t want one company’s failure to wipe you out.",
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

const SCAM_CARDS: ScamCard[] = [
  {
    id: 1,
    title: "“Giveaway” Trap",
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
      "Hi, I’m Support. Your wallet is “at risk.” Reply with your seed phrase so I can secure it for you.",
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
      "You received free tokens! Connect wallet + approve unlimited spending to ‘unlock’ them.",
    redFlags: ["Unlimited approval", "Random token", "Connect + approve trap"],
    correct: "ignore",
    explain:
      "Some airdrops are real, but random tokens + unlimited approvals are a common way to steal funds. Ignoring is often safest unless you verify from official sources.",
  },
];

const FEE_SCENARIOS: FeeScenario[] = [
  {
    id: 1,
    title: "Gas Fee Choice",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
    prompt:
      "You want to send $20 to a friend on a busy network. Fees are high right now. What’s smartest?",
    gasNow: 9,
    gasLater: 2,
    options: [
      { id: "now", label: "Send now (fast)", hint: "You’ll pay the high fee." },
      { id: "later", label: "Send later (wait for cheaper gas)", hint: "Often cheaper when network is quiet." },
      { id: "layer2", label: "Use a cheaper network / Layer 2", hint: "Good option if both users can receive there." },
    ],
    correct: "layer2",
    explain:
      "If both sides can use a cheaper network (Layer 2 / alternative chain), it’s usually best. Otherwise, waiting for lower gas can also be smart.",
  },
  {
    id: 2,
    title: "Tiny Transaction Problem",
    image: "https://images.unsplash.com/photo-1518544887873-3c3db7866f0b?q=80&w=1200",
    prompt:
      "You want to move $10. Fees are $6 right now. What’s the best move?",
    gasNow: 6,
    gasLater: 1,
    options: [
      { id: "now", label: "Do it anyway", hint: "Fee is most of the amount." },
      { id: "later", label: "Wait for lower fees", hint: "Makes small transfers reasonable." },
      { id: "layer2", label: "Use Layer 2 / cheaper chain", hint: "Often the best for small transfers." },
    ],
    correct: "layer2",
    explain:
      "Small transfers + big gas is a trap. Layer 2 / cheaper networks exist specifically to make small transfers practical.",
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

  // Scam game
  const [scamIdx, setScamIdx] = useState(0);
  const [scamPick, setScamPick] = useState<ScamChoice | null>(null);
  const [scamLocked, setScamLocked] = useState(false);
  const [scamScore, setScamScore] = useState(0);

  // Fee game
  const [feeIdx, setFeeIdx] = useState(0);
  const [feePick, setFeePick] = useState<FeeChoice | null>(null);
  const [feeLocked, setFeeLocked] = useState(false);
  const [feeScore, setFeeScore] = useState(0);

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") return onBack?.();
        if (view === "wallet") {
          if (!walletLocked && walletIdx > 0) return setWalletIdx((v) => v - 1);
          return setView("intro");
        }
        if (view === "scams") {
          if (!scamLocked && scamIdx > 0) return setScamIdx((v) => v - 1);
          return setView("wallet");
        }
        if (view === "fees") {
          if (!feeLocked && feeIdx > 0) return setFeeIdx((v) => v - 1);
          return setView("scams");
        }
        // results
        return setView("fees");
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
  const scam = SCAM_CARDS[scamIdx];
  const fee = FEE_SCENARIOS[feeIdx];

  const totalQuestions = WALLET_SCENARIOS.length + SCAM_CARDS.length + FEE_SCENARIOS.length;

  const finalPercent = useMemo(() => {
    const correct = walletScore + scamScore + feeScore;
    return Math.round((correct / totalQuestions) * 100);
  }, [walletScore, scamScore, feeScore, totalQuestions]);

  const progress = useMemo(() => {
    if (view === "wallet") return ((walletIdx + (walletLocked ? 1 : 0)) / WALLET_SCENARIOS.length) * 33;
    if (view === "scams") return 33 + ((scamIdx + (scamLocked ? 1 : 0)) / SCAM_CARDS.length) * 33;
    if (view === "fees") return 66 + ((feeIdx + (feeLocked ? 1 : 0)) / FEE_SCENARIOS.length) * 34;
    if (view === "results") return 100;
    return 0;
  }, [view, walletIdx, scamIdx, feeIdx, walletLocked, scamLocked, feeLocked]);

  // ---------------- INTRO ----------------
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <BackButton />
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">Lesson 2: Interactive</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Security + Fees = Real Crypto Skills</h1>
          <p className="text-[#4F7D96] mt-2">
            Choose the right wallet → spot scams → make smart gas fee decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">👛</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Wallet Quest</h3>
            <p className="text-sm text-[#4F7D96]">Pick custody based on the situation.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Scam Detector</h3>
            <p className="text-sm text-[#4F7D96]">Red flags, seed phrases, fake support.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⛽</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gas Fee Game</h3>
            <p className="text-sm text-[#4F7D96]">Timing + chains matter.</p>
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

  // Shared progress bar
  const ProgressBar = () => (
    <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${clamp(progress, 0, 100)}%` }} />
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
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Wallet Quest</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{wallet.title}</h2>
            <p className="text-slate-400 text-sm mt-2">Challenge {walletIdx + 1} of {WALLET_SCENARIOS.length}</p>
          </header>

          <ProgressBar />

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={wallet.image} alt={wallet.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white text-xl font-black drop-shadow">{wallet.title}</div>
              </div>
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
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{opt.label}</span>
                      <span className="text-xs text-slate-500">{opt.hint}</span>
                    </div>
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
                  {isCorrect ? "✅ Correct" : "💡 Close"} — why
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
                  else setView("scams");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {walletIdx < WALLET_SCENARIOS.length - 1 ? "Next Wallet Challenge" : "Continue to Scam Detector"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- SCAMS ----------------
  if (view === "scams") {
    const isCorrect = scamPick && scamPick === scam.correct;

    const chooseBtn = (id: ScamChoice, label: string) => {
      const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
      const selected = scamPick === id;

      let styles = "border-slate-100 hover:bg-slate-50";
      if (!scamLocked && selected) styles = "border-[#0B5E8E] bg-sky-50";
      if (scamLocked && selected && id === scam.correct) styles = "border-green-300 bg-green-50";
      if (scamLocked && selected && id !== scam.correct) styles = "border-red-300 bg-red-50";
      if (scamLocked && !selected && id === scam.correct) styles = "border-green-200 bg-green-50/50";

      return (
        <button key={id} onClick={() => setScamPick(id)} disabled={scamLocked} className={`${base} ${styles}`}>
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
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Scam Detector</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{scam.title}</h2>
            <p className="text-slate-400 text-sm mt-2">Message {scamIdx + 1} of {SCAM_CARDS.length}</p>
          </header>

          <ProgressBar />

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={scam.image} alt={scam.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white text-xl font-black drop-shadow">{scam.title}</div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6">
              <div className="text-xs uppercase tracking-widest text-white/70 font-black mb-2">Incoming DM</div>
              <div className="text-lg font-black leading-snug">{scam.message}</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="font-bold text-amber-900 mb-2">Red flags you should notice</div>
              <ul className="list-disc pl-5 text-sm text-amber-900 space-y-1">
                {scam.redFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 mb-6">
              {chooseBtn("report", "Report / Block")}
              {chooseBtn("ignore", "Ignore")}
              {chooseBtn("click", "Click the link")}
            </div>

            {scamLocked && (
              <div
                className={`p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                  isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="font-black text-slate-900 mb-2">{isCorrect ? "✅ Correct" : "💡 Not safe"}</div>
                <p className="text-slate-700 text-sm leading-relaxed">{scam.explain}</p>
              </div>
            )}

            {!scamLocked ? (
              <button
                onClick={() => {
                  if (!scamPick) return;
                  setScamLocked(true);
                  if (scamPick === scam.correct) setScamScore((s) => s + 1);
                }}
                disabled={!scamPick}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
              >
                Lock Choice
              </button>
            ) : (
              <button
                onClick={() => {
                  setScamPick(null);
                  setScamLocked(false);
                  if (scamIdx < SCAM_CARDS.length - 1) setScamIdx((v) => v + 1);
                  else setView("fees");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {scamIdx < SCAM_CARDS.length - 1 ? "Next Message" : "Continue to Gas Fee Game"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- FEES ----------------
  if (view === "fees") {
    const isCorrect = feePick && feePick === fee.correct;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Gas Fee Game</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{fee.title}</h2>
            <p className="text-slate-400 text-sm mt-2">Decision {feeIdx + 1} of {FEE_SCENARIOS.length}</p>
          </header>

          <ProgressBar />

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
              <Image src={fee.image} alt={fee.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-white text-xl font-black drop-shadow">{fee.title}</div>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed mb-6">{fee.prompt}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Fee if you send now</div>
                <div className="text-2xl font-black text-slate-900 mt-2">${fee.gasNow}</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Fee if you wait</div>
                <div className="text-2xl font-black text-slate-900 mt-2">${fee.gasLater}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {fee.options.map((opt) => {
                const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
                const selected = feePick === opt.id;

                let styles = "border-slate-100 hover:bg-slate-50";
                if (!feeLocked && selected) styles = "border-[#0B5E8E] bg-sky-50";
                if (feeLocked && selected && opt.id === fee.correct) styles = "border-green-300 bg-green-50";
                if (feeLocked && selected && opt.id !== fee.correct) styles = "border-red-300 bg-red-50";
                if (feeLocked && !selected && opt.id === fee.correct) styles = "border-green-200 bg-green-50/50";

                return (
                  <button
                    key={opt.id}
                    onClick={() => setFeePick(opt.id)}
                    disabled={feeLocked}
                    className={`${base} ${styles}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{opt.label}</span>
                      <span className="text-xs text-slate-500">{opt.hint}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {feeLocked && (
              <div
                className={`p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ${
                  isCorrect ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="font-black text-slate-900 mb-2">{isCorrect ? "✅ Correct" : "💡 Better option"}</div>
                <p className="text-slate-700 text-sm leading-relaxed">{fee.explain}</p>
              </div>
            )}

            {!feeLocked ? (
              <button
                onClick={() => {
                  if (!feePick) return;
                  setFeeLocked(true);
                  if (feePick === fee.correct) setFeeScore((s) => s + 1);
                }}
                disabled={!feePick}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200"
              >
                Lock Decision
              </button>
            ) : (
              <button
                onClick={() => {
                  setFeePick(null);
                  setFeeLocked(false);
                  if (feeIdx < FEE_SCENARIOS.length - 1) setFeeIdx((v) => v + 1);
                  else setView("results");
                }}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                {feeIdx < FEE_SCENARIOS.length - 1 ? "Next Fee Decision" : "See Results"}
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  // ---------------- RESULTS ----------------
  const resultMsg = (() => {
    if (finalPercent >= 85) return { e: "🚀", t: "Crypto-safe habits unlocked", d: "You made strong custody, scam, and fee decisions." };
    if (finalPercent >= 70) return { e: "🧠", t: "Strong foundation", d: "Good instincts. Keep practicing security + fees." };
    if (finalPercent >= 55) return { e: "📚", t: "Learning fast", d: "Review seed phrase safety + gas fee strategies and retry." };
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
              <li>When to use custodial vs self-custody</li>
              <li>How scams try to steal seed phrases / approvals</li>
              <li>How gas fees change — and how to avoid fee traps</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalPercent)}
              className="w-full py-5 bg-sky-700 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-sky-800 transition-all"
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

                setScamIdx(0);
                setScamPick(null);
                setScamLocked(false);
                setScamScore(0);

                setFeeIdx(0);
                setFeePick(null);
                setFeeLocked(false);
                setFeeScore(0);
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
