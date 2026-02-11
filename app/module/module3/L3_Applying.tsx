"use client";

import React, { useMemo, useState } from "react";

/**
 * LESSON 3 (APPLYING) — Crypto Plan Builder + 7-Day Scenario Run
 * Upgraded UI (more game-like) with the same core flow:
 * intro -> plan -> week -> reflection -> complete
 *
 * Props:
 *  - onComplete(score: number)
 *  - onBack?(): optional top-left back behavior
 */

type View = "intro" | "plan" | "week" | "reflection" | "complete";

type Horizon = "1m" | "1y" | "5y";
type Goal = "learn" | "save" | "grow";
type Custody = "exchange" | "self" | "hybrid";

type Plan = {
  horizon: Horizon | null;
  goal: Goal | null;
  custody: Custody | null;
  emergencyCashPct: number;
  cryptoPct: number;
  rule: string;
};

type DayEvent = {
  id: number;
  title: string;
  situation: string;
  options: { id: "A" | "B" | "C"; label: string; scoreDelta: number; why: string }[];
  tip: string;
  badge: "Security" | "Fees" | "Mindset" | "Planning";
};

const EVENTS: DayEvent[] = [
  {
    id: 1,
    badge: "Mindset",
    title: "Day 1: The Trending Coin Trap",
    situation:
      "Your feed is full of '🚀 10x soon' posts. Everyone's talking about one coin. You feel FOMO.",
    tip: "Hype is not research. Slow down and size risk small.",
    options: [
      {
        id: "A",
        label: "Buy immediately — if everyone says it's a 10x, it must be true",
        scoreDelta: -10,
        why: "That's a classic FOMO buy. Beginners get trapped chasing hype.",
      },
      {
        id: "B",
        label: "Pause. Research basics first + keep it tiny if you still want to learn",
        scoreDelta: +10,
        why: "Research-first + small size turns curiosity into learning (not disaster).",
      },
      {
        id: "C",
        label: "Ignore crypto forever — too risky",
        scoreDelta: +2,
        why: "It avoids mistakes, but you miss a chance to learn safe basics.",
      },
    ],
  },
  {
    id: 2,
    badge: "Mindset",
    title: "Day 2: Down 18% Overnight",
    situation:
      "You wake up and your crypto is down hard. Your stomach drops. Your brain screams: 'Get out!'",
    tip: "A plan exists so you don't decide when emotions are loud.",
    options: [
      {
        id: "A",
        label: "Panic sell everything right now",
        scoreDelta: -12,
        why: "Emotional selling locks in losses and builds bad habits.",
      },
      {
        id: "B",
        label: "Check if your crypto % matches your time horizon. Do nothing today",
        scoreDelta: +10,
        why: "Correct: verify sizing vs horizon, avoid emotional clicks.",
      },
      {
        id: "C",
        label: "Double your riskiest coin to 'make it back'",
        scoreDelta: -15,
        why: "Revenge trading is how accounts blow up.",
      },
    ],
  },
  {
    id: 3,
    badge: "Security",
    title: "Day 3: Fake Support DM",
    situation:
      "A message says your wallet is compromised and asks you to verify your seed phrase immediately.",
    tip: "Seed phrase = master key. If someone gets it, they own your funds.",
    options: [
      {
        id: "A",
        label: "Send seed phrase so they can 'secure' funds",
        scoreDelta: -20,
        why: "Instant loss. Never share seed phrases.",
      },
      {
        id: "B",
        label: "Block/report. Only trust official channels you navigate to yourself",
        scoreDelta: +12,
        why: "Perfect security habit.",
      },
      {
        id: "C",
        label: "Reply asking if they're legit",
        scoreDelta: -6,
        why: "Engaging increases risk. Block/report is safer.",
      },
    ],
  },
  {
    id: 4,
    badge: "Fees",
    title: "Day 4: Gas Fees Spike",
    situation:
      "You want to move a small amount, but the network is busy and fees are huge today.",
    tip: "Small transfers + big fees = a trap. Timing and cheaper networks exist for a reason.",
    options: [
      {
        id: "A",
        label: "Send anyway — fees don't matter",
        scoreDelta: -8,
        why: "Fees can eat small transfers. Better options exist.",
      },
      {
        id: "B",
        label: "Wait for cheaper time or use a cheaper network (Layer 2) if possible",
        scoreDelta: +8,
        why: "Smart: chain choice + timing saves money.",
      },
      {
        id: "C",
        label: "Click random 'bridge' links to save fees fast",
        scoreDelta: -10,
        why: "Random links are phishing bait. Don't.",
      },
    ],
  },
  {
    id: 5,
    badge: "Planning",
    title: "Day 5: You Decide to Hold Long-Term",
    situation:
      "You realize you might keep some crypto for years. Where should it live?",
    tip: "Convenience vs control: exchanges are easy; self-custody is control (with responsibility).",
    options: [
      {
        id: "A",
        label: "Keep everything on an exchange forever",
        scoreDelta: -6,
        why: "Convenient but adds platform risk.",
      },
      {
        id: "B",
        label: "Move meaningful long-term holdings to self-custody safely",
        scoreDelta: +10,
        why: "Reduces platform risk if you secure the seed phrase.",
      },
      {
        id: "C",
        label: "Save seed phrase in a Notes app screenshot",
        scoreDelta: -12,
        why: "Cloud/screenshot storage is a common hack path.",
      },
    ],
  },
  {
    id: 6,
    badge: "Mindset",
    title: "Day 6: Friend Wants to Invest Rent Money",
    situation:
      "A friend asks if they should put rent money into meme coins because 'it's quick money'.",
    tip: "Real advice protects people: money needed soon should not face big volatility.",
    options: [
      {
        id: "A",
        label: "Tell them memes are guaranteed profit",
        scoreDelta: -12,
        why: "Bad advice. No guarantees.",
      },
      {
        id: "B",
        label: "Tell them: never invest money you need soon; start small + learn basics",
        scoreDelta: +12,
        why: "Responsible, realistic advice.",
      },
      {
        id: "C",
        label: "Tell them to borrow money to invest",
        scoreDelta: -20,
        why: "High risk, worst habit.",
      },
    ],
  },
  {
    id: 7,
    badge: "Mindset",
    title: "Day 7: Up 12% — Confidence Spike",
    situation:
      "You're up 12% quickly and feel unstoppable. You want to increase risk.",
    tip: "One good week doesn't make a strategy. Discipline beats mood-based changes.",
    options: [
      {
        id: "A",
        label: "Stick to plan rules. Don't change sizing because of one good week",
        scoreDelta: +10,
        why: "Best: discipline and consistency.",
      },
      {
        id: "B",
        label: "Go all-in because you're 'on a streak'",
        scoreDelta: -15,
        why: "Streak thinking is dangerous.",
      },
      {
        id: "C",
        label: "Take some profit and keep learning with small size",
        scoreDelta: +6,
        why: "Reasonable: reduces risk while continuing learning.",
      },
    ],
  },
];

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function horizonText(h: Horizon) {
  if (h === "1m") return "1 month";
  if (h === "1y") return "1 year";
  return "5+ years";
}
function goalText(g: Goal) {
  if (g === "learn") return "Learn safely";
  if (g === "save") return "Protect money";
  return "Grow long-term";
}
function custodyText(c: Custody) {
  if (c === "exchange") return "Exchange (custodial)";
  if (c === "self") return "Self-custody";
  return "Hybrid";
}

function badgeStyle(b: DayEvent["badge"]) {
  switch (b) {
    case "Security":
      return "bg-rose-50 border-rose-200 text-rose-700";
    case "Fees":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "Planning":
      return "bg-emerald-50 border-emerald-200 text-emerald-700";
    default:
      return "bg-sky-50 border-sky-200 text-sky-700";
  }
}

function gradeLabel(score: number) {
  if (score >= 85) return { emoji: "🚀", title: "Crypto-ready instincts", desc: "You stayed calm, avoided traps, and followed a plan." };
  if (score >= 70) return { emoji: "🧠", title: "Strong foundation", desc: "A few tweaks and you'll be very solid." };
  if (score >= 55) return { emoji: "📚", title: "Learning fast", desc: "Good start — review security + sizing and try again." };
  return { emoji: "🔁", title: "Reset and rebuild", desc: "Crypto punishes mistakes. The goal is habits, not hype." };
}

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-700";
  if (score >= 70) return "text-sky-700";
  if (score >= 55) return "text-amber-700";
  return "text-rose-700";
}

export default function L3_Applying({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<View>("intro");

  // Plan builder
  const [plan, setPlan] = useState<Plan>({
    horizon: null,
    goal: null,
    custody: null,
    emergencyCashPct: 70,
    cryptoPct: 30,
    rule: "",
  });

  // Week run
  const [dayIdx, setDayIdx] = useState(0);
  const [picked, setPicked] = useState<"A" | "B" | "C" | null>(null);
  const [locked, setLocked] = useState(false);
  const [weekScore, setWeekScore] = useState(50);
  const [choiceLog, setChoiceLog] = useState<
    { day: number; badge: DayEvent["badge"]; title: string; pick: "A" | "B" | "C"; delta: number }[]
  >([]);
  const [notes, setNotes] = useState("");

  const day = EVENTS[dayIdx];

  const ready =
    Boolean(plan.horizon) &&
    Boolean(plan.goal) &&
    Boolean(plan.custody) &&
    Boolean(plan.rule) &&
    plan.cryptoPct + plan.emergencyCashPct === 100;

  // Plan score: small but meaningful
  const planScore = useMemo(() => {
    let s = 0;
    if (plan.horizon) s += 10;
    if (plan.goal) s += 10;
    if (plan.custody) s += 10;

    if (plan.horizon === "1m") {
      if (plan.cryptoPct <= 10) s += 20;
      else if (plan.cryptoPct <= 20) s += 12;
      else s += 2;
    } else if (plan.horizon === "1y") {
      if (plan.cryptoPct <= 20) s += 20;
      else if (plan.cryptoPct <= 35) s += 12;
      else s += 4;
    } else if (plan.horizon === "5y") {
      if (plan.cryptoPct <= 35) s += 18;
      else if (plan.cryptoPct <= 50) s += 12;
      else s += 6;
    }

    if (plan.horizon === "5y" && (plan.custody === "self" || plan.custody === "hybrid")) s += 8;

    if (plan.rule) s += 20;

    return clamp(s, 0, 100);
  }, [plan]);

  const finalScore = useMemo(() => {
    return clamp(Math.round(weekScore * 0.75 + planScore * 0.25), 0, 100);
  }, [weekScore, planScore]);

  const progress = useMemo(() => {
    if (view === "intro") return 0;
    if (view === "plan") return 25;
    if (view === "week") return 25 + ((dayIdx + (locked ? 1 : 0)) / EVENTS.length) * 55;
    if (view === "reflection") return 90;
    return 100;
  }, [view, dayIdx, locked]);

  const stepIndex = useMemo(() => {
    if (view === "intro") return 0;
    if (view === "plan") return 1;
    if (view === "week") return 2;
    if (view === "reflection") return 3;
    return 4;
  }, [view]);

  const CardShell = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white border border-slate-100 shadow-md rounded-[28px] p-6 md:p-8">
      {children}
    </div>
  );

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") return onBack?.();
        if (view === "plan") return setView("intro");
        if (view === "week") {
          if (!locked && dayIdx > 0) {
            setDayIdx((d) => d - 1);
            setPicked(null);
            return;
          }
          return setView("plan");
        }
        if (view === "reflection") return setView("week");
        if (view === "complete") return setView("reflection");
      }}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
      aria-label="Back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  const Stepper = () => {
    const steps = ["Intro", "Build Plan", "7-Day Run", "Reflect", "Finish"];
    return (
      <div className="w-full max-w-5xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <div key={s} className="flex-1">
                <div
                  className={[
                    "rounded-2xl border px-3 py-2 text-center text-xs font-bold tracking-wide",
                    done
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : active
                      ? "bg-sky-50 border-sky-200 text-sky-700"
                      : "bg-white border-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {done ? "✅ " : active ? "🎮 " : ""}
                  {s}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0B5E8E] transition-all duration-500" style={{ width: `${clamp(progress, 0, 100)}%` }} />
        </div>
      </div>
    );
  };

  const Pill = ({
    active,
    onClick,
    title,
    subtitle,
    icon,
  }: {
    active: boolean;
    onClick: () => void;
    title: string;
    subtitle: string;
    icon: string;
  }) => (
    <button
      onClick={onClick}
      className={[
        "w-full text-left p-4 rounded-2xl border-2 transition-all",
        active ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="font-black text-slate-900">{title}</div>
          <div className="text-xs text-slate-600 mt-1">{subtitle}</div>
        </div>
      </div>
    </button>
  );

  const ChoiceCard = ({
    id,
    label,
    selected,
    disabled,
    onClick,
    delta,
  }: {
    id: "A" | "B" | "C";
    label: string;
    selected: boolean;
    disabled: boolean;
    onClick: () => void;
    delta: number;
  }) => {
    const isGood = delta > 0;
    const isBad = delta < 0;

    const base = "w-full text-left p-4 rounded-2xl border-2 transition-all";
    let styles = "border-slate-200 bg-white hover:bg-slate-50";

    if (selected && !disabled) styles = "border-[#0B5E8E] bg-sky-50";
    if (disabled && selected) {
      styles = isGood ? "border-green-300 bg-green-50" : isBad ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50";
    }

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${styles}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
              {id}
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-snug">{label}</div>
              <div className="text-xs text-slate-500 mt-1">
                Impact:{" "}
                <span className={isGood ? "text-emerald-700 font-bold" : isBad ? "text-rose-700 font-bold" : "text-slate-600 font-bold"}>
                  {delta > 0 ? `+${delta}` : delta}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xl">
            {selected ? (disabled ? (isGood ? "✅" : isBad ? "⚠️" : "ℹ️") : "🎯") : " "}
          </div>
        </div>
      </button>
    );
  };

  // ---------------- INTRO ----------------
  if (view === "intro") {
    return (
      <div className="min-h-[70vh]">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
            <CardShell>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Build your first crypto plan — then survive a crypto week 🧩
              </h1>

              <p className="text-slate-600 mt-3 leading-relaxed">
                You'll create a simple plan (goal, time horizon, custody, sizing), then make choices across a 7-day crypto storyline.
                Your score rewards <span className="font-bold">habits</span>: security, fees, sizing, and calm decision-making.
              </p>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="text-2xl">🧠</div>
                  <div className="font-black text-slate-900 mt-2">Mindset</div>
                  <div className="text-xs text-slate-600 mt-1">Avoid FOMO + panic</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="text-2xl">🔐</div>
                  <div className="font-black text-slate-900 mt-2">Security</div>
                  <div className="text-xs text-slate-600 mt-1">Seed phrase rules</div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="text-2xl">⛽</div>
                  <div className="font-black text-slate-900 mt-2">Fees</div>
                  <div className="text-xs text-slate-600 mt-1">Gas + Layer 2</div>
                </div>
              </div>

              <button
                onClick={() => setView("plan")}
                className="mt-7 w-full py-4 bg-[#0B5E8E] text-white rounded-2xl font-black text-lg hover:bg-[#094a72] transition-all shadow-lg"
              >
                Start: Build My Plan
              </button>
            </CardShell>

            <div className="space-y-6">
              <CardShell>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">How scoring works</div>
                    <div className="text-lg font-black text-slate-900 mt-2">Plan + Decisions</div>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    <span className="font-bold">Plan quality</span>
                    <span className="text-slate-500">25%</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    <span className="font-bold">7-Day choices</span>
                    <span className="text-slate-500">75%</span>
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500 leading-relaxed">
                  This is for learning — not financial advice. We're building safe habits: sizing, time horizon, and avoiding scams.
                </div>
              </CardShell>

              <CardShell>
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900">Quick Tip</div>
                  <div className="text-2xl">💡</div>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  A good beginner plan keeps crypto <span className="font-bold">small</span> and protects emergency cash.
                  Crypto is volatile — your plan should survive a bad week.
                </p>
              </CardShell>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- PLAN ----------------
  if (view === "plan") {
    return (
      <div className="min-h-[70vh]">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="grid lg:grid-cols-[1fr_0.55fr] gap-6">
            <CardShell>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Step 1</div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">Build Your Crypto Plan</h2>
                  <p className="text-slate-600 mt-2">
                    Your goal + time horizon should control your risk size.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Plan Score</div>
                  <div className={`text-3xl font-black mt-1 ${scoreColor(planScore)}`}>{planScore}%</div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div>
                  <div className="font-black text-slate-900 mb-2">Goal</div>
                  <div className="space-y-2">
                    <Pill
                      icon="🎓"
                      active={plan.goal === "learn"}
                      onClick={() => setPlan((p) => ({ ...p, goal: "learn" }))}
                      title="Learn safely"
                      subtitle="Small amount, focus on habits"
                    />
                    <Pill
                      icon="🛡️"
                      active={plan.goal === "save"}
                      onClick={() => setPlan((p) => ({ ...p, goal: "save" }))}
                      title="Protect money"
                      subtitle="Keep risk low + controlled"
                    />
                    <Pill
                      icon="🌱"
                      active={plan.goal === "grow"}
                      onClick={() => setPlan((p) => ({ ...p, goal: "grow" }))}
                      title="Grow long-term"
                      subtitle="Patience + discipline"
                    />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 mb-2">Time Horizon</div>
                  <div className="space-y-2">
                    <Pill
                      icon="⏱️"
                      active={plan.horizon === "1m"}
                      onClick={() => setPlan((p) => ({ ...p, horizon: "1m" }))}
                      title="1 month"
                      subtitle="Very short → keep crypto tiny"
                    />
                    <Pill
                      icon="🗓️"
                      active={plan.horizon === "1y"}
                      onClick={() => setPlan((p) => ({ ...p, horizon: "1y" }))}
                      title="1 year"
                      subtitle="Medium → still cautious"
                    />
                    <Pill
                      icon="🏔️"
                      active={plan.horizon === "5y"}
                      onClick={() => setPlan((p) => ({ ...p, horizon: "5y" }))}
                      title="5+ years"
                      subtitle="Long → focus on safety + patience"
                    />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 mb-2">Custody</div>
                  <div className="space-y-2">
                    <Pill
                      icon="🏦"
                      active={plan.custody === "exchange"}
                      onClick={() => setPlan((p) => ({ ...p, custody: "exchange" }))}
                      title="Exchange (custodial)"
                      subtitle="Easy start, but platform risk"
                    />
                    <Pill
                      icon="🔑"
                      active={plan.custody === "self"}
                      onClick={() => setPlan((p) => ({ ...p, custody: "self" }))}
                      title="Self-custody"
                      subtitle="You control keys (more responsibility)"
                    />
                    <Pill
                      icon="⚖️"
                      active={plan.custody === "hybrid"}
                      onClick={() => setPlan((p) => ({ ...p, custody: "hybrid" }))}
                      title="Hybrid"
                      subtitle="Small on exchange + rest self"
                    />
                  </div>
                </div>
              </div>

              {/* Allocation sliders */}
              <div className="mt-7 grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Emergency Cash</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{plan.emergencyCashPct}%</div>
                    </div>
                    <div className="text-2xl">🧯</div>
                  </div>
                  <input
                    className="mt-4 w-full"
                    type="range"
                    min={0}
                    max={100}
                    value={plan.emergencyCashPct}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPlan((p) => ({ ...p, emergencyCashPct: v, cryptoPct: 100 - v }));
                    }}
                  />
                  <div className="text-xs text-slate-600 mt-2">Your safety net outside crypto.</div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Crypto Portion</div>
                      <div className="text-2xl font-black text-slate-900 mt-1">{plan.cryptoPct}%</div>
                    </div>
                    <div className="text-2xl">🪙</div>
                  </div>
                  <input
                    className="mt-4 w-full"
                    type="range"
                    min={0}
                    max={100}
                    value={plan.cryptoPct}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPlan((p) => ({ ...p, cryptoPct: v, emergencyCashPct: 100 - v }));
                    }}
                  />
                  <div className="text-xs text-slate-600 mt-2">Beginner tip: small size protects learning.</div>
                </div>
              </div>

              {/* Rule - DROPDOWN VERSION */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-black text-slate-900">Your "Volatility Rule"</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Choose your strategy when crypto prices swing wildly
                    </div>
                  </div>
                  <div className="text-2xl">📜</div>
                </div>
                
                <select
                  value={plan.rule}
                  onChange={(e) => setPlan((p) => ({ ...p, rule: e.target.value }))}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
                >
                  <option value="">-- Select a rule --</option>
                  <option value="If crypto drops 20%, I wait 24 hours before deciding anything">
                    Wait 24 hours during drops
                  </option>
                  <option value="I never invest money I need within 6 months">
                    Never invest short-term money
                  </option>
                  <option value="If I feel FOMO, I wait 48 hours and research first">
                    Research during FOMO moments
                  </option>
                  <option value="I check prices max once per day to avoid emotional trading">
                    Limit price checking
                  </option>
                  <option value="My crypto position never exceeds 10% of savings">
                    Keep crypto under 10%
                  </option>
                </select>
                
                <div className="text-xs text-slate-500 mt-2">
                  This rule helps you stay calm when emotions run high
                </div>
              </div>

              <button
                disabled={!ready}
                onClick={() => {
                  setView("week");
                  setDayIdx(0);
                  setPicked(null);
                  setLocked(false);
                  setWeekScore(50);
                  setChoiceLog([]);
                }}
                className="mt-6 w-full py-4 bg-[#0B5E8E] text-white rounded-2xl font-black text-lg hover:bg-[#094a72] transition-all shadow-lg disabled:bg-slate-200 disabled:text-slate-500"
              >
                Start the 7-Day Crypto Run 🎮
              </button>

              {!ready && (
                <div className="mt-3 text-xs text-slate-500">
                  Pick Goal + Horizon + Custody + Rule to continue.
                </div>
              )}
            </CardShell>

            {/* Summary */}
            <div className="space-y-6">
              <CardShell>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Your Plan Summary</div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Goal</div>
                    <div className="font-black text-slate-900 mt-1">{plan.goal ? goalText(plan.goal) : "—"}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Time Horizon</div>
                    <div className="font-black text-slate-900 mt-1">{plan.horizon ? horizonText(plan.horizon) : "—"}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Custody</div>
                    <div className="font-black text-slate-900 mt-1">{plan.custody ? custodyText(plan.custody) : "—"}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Sizing</div>
                    <div className="font-black text-slate-900 mt-1">
                      {plan.cryptoPct}% crypto / {plan.emergencyCashPct}% cash
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-xs text-slate-500 leading-relaxed">
                  Safer plans make the 7-day run easier.
                </div>
              </CardShell>

              <CardShell>
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900">Safety Reminders</div>
                  <div className="text-2xl">🧷</div>
                </div>
                <ul className="mt-3 text-sm text-slate-700 space-y-2 list-disc pl-5">
                  <li>Never share seed phrases or private keys.</li>
                  <li>Don't click random "support" DMs.</li>
                  <li>Small size + time horizon prevents panic.</li>
                  <li>Fees matter: use Layer 2 / timing when possible.</li>
                </ul>
              </CardShell>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- WEEK ----------------
  if (view === "week") {
    const pickedObj = picked ? day.options.find((o) => o.id === picked) : null;

    return (
      <div className="min-h-[70vh]">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="grid lg:grid-cols-[1fr_0.55fr] gap-6">
            <CardShell>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className={[
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black tracking-widest uppercase mb-3",
                      badgeStyle(day.badge),
                    ].join(" ")}
                  >
                    {day.badge}
                  </div>

                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">7-Day Run</div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                    {day.title}
                  </h2>
                  <div className="text-sm text-slate-500 mt-1">
                    Day {dayIdx + 1} of {EVENTS.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Week Score</div>
                  <div className={`text-3xl font-black mt-1 ${scoreColor(weekScore)}`}>{weekScore}</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Situation</div>
                <p className="text-slate-800 mt-2 leading-relaxed">{day.situation}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Coach Tip</div>
                <p className="text-slate-700 mt-2 leading-relaxed">{day.tip}</p>
              </div>

              <div className="mt-6 space-y-3">
                {day.options.map((o) => (
                  <ChoiceCard
                    key={o.id}
                    id={o.id}
                    label={o.label}
                    delta={o.scoreDelta}
                    selected={picked === o.id}
                    disabled={locked}
                    onClick={() => setPicked(o.id)}
                  />
                ))}
              </div>

              {/* feedback panel */}
              {locked && pickedObj && (
                <div
                  className={[
                    "mt-6 p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300",
                    pickedObj.scoreDelta >= 8
                      ? "bg-emerald-50 border-emerald-200"
                      : pickedObj.scoreDelta > 0
                      ? "bg-sky-50 border-sky-200"
                      : "bg-amber-50 border-amber-200",
                  ].join(" ")}
                >
                  <div className="font-black text-slate-900 mb-2">
                    {pickedObj.scoreDelta > 0 ? "✅ Good call" : "💡 Better habit"} — why
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">{pickedObj.why}</p>
                </div>
              )}

              {/* action buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {!locked ? (
                  <button
                    onClick={() => {
                      if (!picked) return;
                      const opt = day.options.find((o) => o.id === picked)!;
                      setLocked(true);
                      setWeekScore((s) => clamp(s + opt.scoreDelta, 0, 100));
                      setChoiceLog((log) => [
                        ...log,
                        { day: day.id, badge: day.badge, title: day.title, pick: picked, delta: opt.scoreDelta },
                      ]);
                    }}
                    disabled={!picked}
                    className="flex-1 py-4 bg-[#0B5E8E] text-white rounded-2xl font-black hover:bg-[#094a72] transition-all shadow-lg disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    Lock Choice
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLocked(false);
                      setPicked(null);

                      if (dayIdx < EVENTS.length - 1) {
                        setDayIdx((d) => d + 1);
                      } else {
                        setView("reflection");
                      }
                    }}
                    className="flex-1 py-4 bg-[#0B5E8E] text-white rounded-2xl font-black hover:bg-[#094a72] transition-all shadow-lg"
                  >
                    {dayIdx < EVENTS.length - 1 ? "Next Day" : "Go to Reflection"}
                  </button>
                )}

                <button
                  onClick={() => {
                    // reset the entire run, keep plan
                    setView("week");
                    setDayIdx(0);
                    setPicked(null);
                    setLocked(false);
                    setWeekScore(50);
                    setChoiceLog([]);
                  }}
                  className="sm:w-[220px] py-4 bg-transparent border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all"
                >
                  Restart Week
                </button>
              </div>
            </CardShell>

            {/* right rail */}
            <div className="space-y-6">
              <CardShell>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Your Plan</div>
                    <div className="font-black text-slate-900 mt-1">Stay consistent</div>
                  </div>
                  <div className="text-2xl">🧩</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Horizon</div>
                    <div className="font-black text-slate-900 mt-1">{plan.horizon ? horizonText(plan.horizon) : "—"}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Goal</div>
                    <div className="font-black text-slate-900 mt-1">{plan.goal ? goalText(plan.goal) : "—"}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Custody</div>
                    <div className="font-black text-slate-900 mt-1">{plan.custody ? custodyText(plan.custody) : "—"}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Sizing</div>
                    <div className="font-black text-slate-900 mt-1">{plan.cryptoPct}%</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Your Rule</div>
                  <div className="text-sm text-slate-800 font-semibold mt-2 leading-relaxed">
                    "{plan.rule || "—"}"
                  </div>
                </div>
              </CardShell>

              <CardShell>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Run History</div>
                <div className="mt-4 space-y-2">
                  {choiceLog.length === 0 ? (
                    <div className="text-sm text-slate-600">No locked choices yet.</div>
                  ) : (
                    choiceLog.slice(-5).reverse().map((c) => (
                      <div key={`${c.day}-${c.pick}-${c.delta}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black text-slate-900">Day {c.day}: {c.pick}</div>
                          <div className={`text-xs font-black ${c.delta >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                            {c.delta >= 0 ? `+${c.delta}` : c.delta}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{c.badge}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardShell>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- REFLECTION ----------------
  if (view === "reflection") {
    const topMistakes = [...choiceLog]
      .filter((c) => c.delta < 0)
      .sort((a, b) => a.delta - b.delta)
      .slice(0, 2);

    const topWins = [...choiceLog]
      .filter((c) => c.delta > 0)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 2);

    return (
      <div className="min-h-[70vh]">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="grid lg:grid-cols-[1fr_0.55fr] gap-6">
            <CardShell>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Step 4</div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                    Reflect: What habits did you build?
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Your score is just feedback. The real win is your rules + your decision habits.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Final Score</div>
                  <div className={`text-3xl font-black mt-1 ${scoreColor(finalScore)}`}>{finalScore}</div>
                </div>
              </div>

              {/* highlights */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-slate-900">Top Wins</div>
                    <div className="text-2xl">✅</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {topWins.length === 0 ? (
                      <div className="text-sm text-slate-700">No positive picks yet — try the week again!</div>
                    ) : (
                      topWins.map((w) => (
                        <div key={`${w.day}-${w.pick}`} className="rounded-2xl bg-white border border-emerald-100 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-black text-slate-900">Day {w.day}: {w.pick}</div>
                            <div className="text-sm font-black text-emerald-700">+{w.delta}</div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{w.badge}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-slate-900">Biggest Traps</div>
                    <div className="text-2xl">⚠️</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {topMistakes.length === 0 ? (
                      <div className="text-sm text-slate-700">Nice — you avoided the major traps.</div>
                    ) : (
                      topMistakes.map((m) => (
                        <div key={`${m.day}-${m.pick}`} className="rounded-2xl bg-white border border-amber-100 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-black text-slate-900">Day {m.day}: {m.pick}</div>
                            <div className="text-sm font-black text-rose-700">{m.delta}</div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{m.badge}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* reflection prompts */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-black text-slate-900">Optional: Write a quick reflection</div>
                    <div className="text-sm text-slate-600 mt-1">
                      2–4 sentences is enough. What will you do differently next time?
                    </div>
                  </div>
                  <div className="text-2xl">📝</div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Prompt 1</div>
                    <div className="font-semibold text-slate-800 mt-2">
                      What rule helped you stay calm when emotions spiked?
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Prompt 2</div>
                    <div className="font-semibold text-slate-800 mt-2">
                      What's one security habit you'll never break?
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional: Write your reflection here..."
                  className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
                />

                <div className="mt-3 text-xs text-slate-500">
                  Pro tip: copy this into your notes app. Good rules become habits.
                </div>
              </div>

              {/* actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setView("complete")}
                  className="flex-1 py-4 bg-[#0B5E8E] text-white rounded-2xl font-black hover:bg-[#094a72] transition-all shadow-lg"
                >
                  Finish Lesson ✅
                </button>
                <button
                  onClick={() => {
                    setView("week");
                    setDayIdx(0);
                    setPicked(null);
                    setLocked(false);
                    setWeekScore(50);
                    setChoiceLog([]);
                  }}
                  className="sm:w-[240px] py-4 bg-transparent border-2 border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-50 transition-all"
                >
                  Redo 7-Day Run
                </button>
              </div>
            </CardShell>

            {/* right rail: plan recap */}
            <div className="space-y-6">
              <CardShell>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Your Plan</div>
                    <div className="font-black text-slate-900 mt-1">Snapshot</div>
                  </div>
                  <div className="text-2xl">🧩</div>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Goal</div>
                    <div className="font-black text-slate-900 mt-1">{plan.goal ? goalText(plan.goal) : "—"}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Horizon</div>
                    <div className="font-black text-slate-900 mt-1">{plan.horizon ? horizonText(plan.horizon) : "—"}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Custody</div>
                    <div className="font-black text-slate-900 mt-1">{plan.custody ? custodyText(plan.custody) : "—"}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="text-xs text-slate-500 font-black uppercase tracking-widest">Sizing</div>
                    <div className="font-black text-slate-900 mt-1">
                      {plan.cryptoPct}% crypto / {plan.emergencyCashPct}% cash
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Volatility Rule</div>
                  <div className="text-sm text-slate-800 font-semibold mt-2 leading-relaxed">
                    "{plan.rule || "—"}"
                  </div>
                </div>
              </CardShell>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- COMPLETE ----------------
  if (view === "complete") {
    const g = gradeLabel(finalScore);

    return (
      <div className="min-h-[70vh]">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          <div className="grid md:grid-cols-[1fr_0.65fr] gap-6 items-stretch">
            <CardShell>
              <div className="text-center">
                <div className="text-5xl">{g.emoji}</div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-4">Lesson 3 Complete!</h2>
                <p className="text-slate-600 mt-2">{g.desc}</p>

                <div className="mt-6 flex items-center justify-center">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">Your Score</div>
                    <div className={`text-5xl font-black mt-2 ${scoreColor(finalScore)}`}>{finalScore}%</div>
                    <div className="text-sm font-black text-slate-900 mt-2">{g.title}</div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => onComplete(finalScore)}
                    className="w-full py-5 bg-[#0D171C] text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-lg"
                  >
                    Back to Module Overview
                  </button>

                  <button
                    onClick={() => {
                      // redo from week (keep plan)
                      setView("week");
                      setDayIdx(0);
                      setPicked(null);
                      setLocked(false);
                      setWeekScore(50);
                      setChoiceLog([]);
                    }}
                    className="w-full py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
                  >
                    Redo Lesson 3
                  </button>
                </div>
              </div>
            </CardShell>

            <div className="space-y-6">
              <CardShell>
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900">What you practiced</div>
                  <div className="text-2xl">🏁</div>
                </div>
                <ul className="mt-3 text-sm text-slate-700 space-y-2 list-disc pl-5">
                  <li>Building a plan (goal + horizon + custody + sizing)</li>
                  <li>Handling FOMO and panic without impulsive clicks</li>
                  <li>Seed phrase safety + phishing resistance</li>
                  <li>Understanding fees and timing (gas / Layer 2)</li>
                </ul>
              </CardShell>

              <CardShell>
                <div className="flex items-center justify-between">
                  <div className="font-black text-slate-900">Your reflection</div>
                  <div className="text-2xl">📝</div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 leading-relaxed">
                  {notes.trim().length ? notes : "No reflection saved. (Optional — but helpful!)"}
                </div>
              </CardShell>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}