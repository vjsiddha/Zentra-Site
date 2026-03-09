"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Clock3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  NotebookPen,
  Target,
} from "lucide-react";

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
      "Your feed is full of '10x soon' posts. One coin is everywhere and you feel pressure to buy before it is too late.",
    tip: "Hype is not research. Curiosity is fine, but rushing is dangerous.",
    options: [
      {
        id: "A",
        label: "Buy right now because everyone else is buying",
        scoreDelta: -10,
        why: "That is a classic FOMO decision. Buying because others are excited is not a strategy.",
      },
      {
        id: "B",
        label: "Pause, research it, and only use a tiny amount if you still want to learn",
        scoreDelta: 10,
        why: "This is the healthiest approach. It turns emotion into a learning decision.",
      },
      {
        id: "C",
        label: "Ignore crypto forever because it feels risky",
        scoreDelta: 2,
        why: "You avoid mistakes, but you also avoid building any knowledge.",
      },
    ],
  },
  {
    id: 2,
    badge: "Mindset",
    title: "Day 2: Down 18% Overnight",
    situation:
      "You wake up and your crypto is down sharply. You feel nervous and want to do something immediately.",
    tip: "A good plan protects you from making emotional decisions on bad days.",
    options: [
      {
        id: "A",
        label: "Sell everything immediately",
        scoreDelta: -12,
        why: "Panic selling is emotional and often locks in losses without a clear reason.",
      },
      {
        id: "B",
        label: "Check whether your crypto size still matches your plan and do nothing today",
        scoreDelta: 10,
        why: "This is disciplined. You are following your rules instead of your emotions.",
      },
      {
        id: "C",
        label: "Double your riskiest coin to win it back faster",
        scoreDelta: -15,
        why: "This is revenge trading. It increases risk at exactly the wrong time.",
      },
    ],
  },
  {
    id: 3,
    badge: "Security",
    title: "Day 3: Fake Support DM",
    situation:
      "Someone messages you saying your wallet is compromised and asks you to verify your seed phrase immediately.",
    tip: "Your seed phrase is the master key to your wallet. No real support team will ever ask for it.",
    options: [
      {
        id: "A",
        label: "Send the seed phrase so they can secure your funds",
        scoreDelta: -20,
        why: "This would give them full access. It is one of the most dangerous mistakes in crypto.",
      },
      {
        id: "B",
        label: "Block or report the message and only use official support channels you find yourself",
        scoreDelta: 12,
        why: "Perfect security instinct. You are protecting your wallet correctly.",
      },
      {
        id: "C",
        label: "Reply and ask them to prove they are real",
        scoreDelta: -6,
        why: "Even engaging with the message creates more risk. Blocking is safer.",
      },
    ],
  },
  {
    id: 4,
    badge: "Fees",
    title: "Day 4: Gas Fees Spike",
    situation:
      "You want to move a small amount of crypto today, but network fees are unusually high.",
    tip: "Small transfers can get eaten by fees. Timing and chain choice matter.",
    options: [
      {
        id: "A",
        label: "Send it anyway because fees are not a big deal",
        scoreDelta: -8,
        why: "For small transfers, high fees can wipe out a lot of value.",
      },
      {
        id: "B",
        label: "Wait for a cheaper time or use a cheaper network if it is appropriate",
        scoreDelta: 8,
        why: "That is smart. You are managing costs instead of clicking impulsively.",
      },
      {
        id: "C",
        label: "Use a random link that promises cheaper bridging",
        scoreDelta: -10,
        why: "Random links are a common phishing trap. Never rush into unknown tools.",
      },
    ],
  },
  {
    id: 5,
    badge: "Planning",
    title: "Day 5: Long-Term Holding",
    situation:
      "You realize you may want to keep part of your crypto for years. You now need to think about where it should live.",
    tip: "Convenience is useful, but control matters more for serious long-term holdings.",
    options: [
      {
        id: "A",
        label: "Leave everything on an exchange forever",
        scoreDelta: -6,
        why: "It is convenient, but it leaves you exposed to platform risk.",
      },
      {
        id: "B",
        label: "Move meaningful long-term holdings to self-custody carefully",
        scoreDelta: 10,
        why: "That reduces platform risk, as long as you secure your seed phrase properly.",
      },
      {
        id: "C",
        label: "Save your seed phrase in a phone note or screenshot",
        scoreDelta: -12,
        why: "That creates an easy path for hacks or accidental exposure.",
      },
    ],
  },
  {
    id: 6,
    badge: "Mindset",
    title: "Day 6: Your Friend Wants Fast Money",
    situation:
      "A friend asks whether they should put rent money into meme coins because they think it will grow quickly.",
    tip: "Responsible advice protects people from short-term volatility.",
    options: [
      {
        id: "A",
        label: "Tell them meme coins are easy profit",
        scoreDelta: -12,
        why: "That is irresponsible. Nothing in crypto is guaranteed.",
      },
      {
        id: "B",
        label: "Tell them never to invest money they need soon and to start small if they want to learn",
        scoreDelta: 12,
        why: "This is realistic, safe, and responsible.",
      },
      {
        id: "C",
        label: "Tell them to borrow money so they can invest more",
        scoreDelta: -20,
        why: "Borrowing to invest in volatile assets is one of the worst habits possible.",
      },
    ],
  },
  {
    id: 7,
    badge: "Mindset",
    title: "Day 7: Confidence Spike",
    situation:
      "You are up 12% in a short time and suddenly feel very confident. You want to take much more risk.",
    tip: "A short winning streak is not the same as having a strong long-term strategy.",
    options: [
      {
        id: "A",
        label: "Stick to your plan and do not change your sizing because of one good week",
        scoreDelta: 10,
        why: "This is disciplined. Good plans should not change based on mood.",
      },
      {
        id: "B",
        label: "Go all-in because you feel like you are on a streak",
        scoreDelta: -15,
        why: "That is emotional overconfidence, not good decision-making.",
      },
      {
        id: "C",
        label: "Take some profit and keep learning with a small position",
        scoreDelta: 6,
        why: "This is reasonable because it lowers risk while keeping you engaged.",
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
  if (c === "exchange") return "Exchange wallet";
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
  if (score >= 85) {
    return {
      title: "Crypto-ready instincts",
      desc: "You stayed calm, avoided traps, and followed a strong plan.",
    };
  }
  if (score >= 70) {
    return {
      title: "Strong foundation",
      desc: "You made many good choices. A little more consistency will make you even stronger.",
    };
  }
  if (score >= 55) {
    return {
      title: "Learning fast",
      desc: "You are building the right habits. Review security and position sizing, then try again.",
    };
  }
  return {
    title: "Reset and rebuild",
    desc: "Crypto can punish rushed decisions. The real goal is discipline, not hype.",
  };
}

function scoreColor(score: number) {
  if (score >= 85) return "text-emerald-700";
  if (score >= 70) return "text-sky-700";
  if (score >= 55) return "text-amber-700";
  return "text-rose-700";
}

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-slate-100 shadow-lg rounded-[28px] p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

function OptionPill({
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
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full rounded-2xl border-2 p-4 text-left transition-all",
        active
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="font-black text-slate-900">{title}</div>
          <div className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500 font-black">{label}</div>
          <div className="font-black text-slate-900 mt-2 text-lg">{value}</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChoiceCard({
  id,
  label,
  selected,
  disabled,
  onClick,
}: {
  id: "A" | "B" | "C";
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full rounded-2xl border-2 p-4 text-left transition-all",
        selected && !disabled
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
        disabled ? "cursor-default" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black flex-shrink-0">
          {id}
        </div>
        <div className="font-semibold text-slate-900 leading-relaxed">{label}</div>
      </div>
    </button>
  );
}

export default function L3_Applying({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<View>("intro");

  const [plan, setPlan] = useState<Plan>({
    horizon: null,
    goal: null,
    custody: null,
    emergencyCashPct: 70,
    cryptoPct: 30,
    rule: "",
  });

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

    if (plan.horizon === "5y" && (plan.custody === "self" || plan.custody === "hybrid")) {
      s += 8;
    }

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
      className="fixed top-4 left-4 sm:left-6 z-50 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-bold transition-all hover:bg-white rounded-xl shadow-sm border border-slate-200"
      aria-label="Back"
    >
      <ChevronLeft className="w-5 h-5" />
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
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {s}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 h-3 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
            style={{ width: `${clamp(progress, 0, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  if (view === "intro") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <BackButton />
      <Stepper />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14">
        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          {/* Left main hero card */}
          <SectionCard className="p-8 md:p-10">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-lg mb-6">
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.05] max-w-3xl">
              Build your first crypto plan, then survive a 7-day crypto week
            </h1>

            <p className="text-slate-600 text-lg leading-8 mt-5 max-w-2xl">
              First, you will build a simple crypto plan. Then you will go through a week of realistic choices involving hype, fear, scams, fees, and risk.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">
                  Mindset
                </div>
                <div className="font-black text-slate-900 text-2xl leading-tight">
                  Avoid panic and FOMO
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">
                  Security
                </div>
                <div className="font-black text-slate-900 text-2xl leading-tight">
                  Protect your wallet
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
                  <NotebookPen className="w-5 h-5" />
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">
                  Planning
                </div>
                <div className="font-black text-slate-900 text-2xl leading-tight">
                  Stick to your rules
                </div>
              </div>
            </div>

            <button
              onClick={() => setView("plan")}
              className="mt-8 w-full sm:w-auto min-w-[280px] px-10 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-black text-xl hover:opacity-95 transition-all shadow-lg"
            >
              Start Building My Plan
            </button>
          </SectionCard>

          {/* Right info column */}
          <div className="space-y-5">
            <SectionCard className="p-6 md:p-7">
              <div className="text-xs uppercase tracking-widest text-slate-500 font-black mb-4">
                How this lesson works
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-lg">Plan quality</span>
                  <span className="font-black text-slate-900 text-lg">25%</span>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-lg">7-day choices</span>
                  <span className="font-black text-slate-900 text-lg">75%</span>
                </div>
              </div>

              <p className="text-slate-500 leading-8 text-base mt-5">
                This is a learning activity, not financial advice. You are practicing habits that help beginners stay safer and think more clearly.
              </p>
            </SectionCard>

            <SectionCard className="p-6 md:p-7">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="font-black text-slate-900 text-2xl leading-tight">
                    Quick tip
                  </div>
                  <p className="text-slate-600 text-lg leading-8 mt-2">
                    Good beginner plans keep crypto small and emergency cash protected.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (view === "plan") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="grid xl:grid-cols-[1fr_0.42fr] gap-6">
            <SectionCard>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Step 1
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                    Build Your Crypto Plan
                  </h2>
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    Your goal and time horizon should shape your risk. Shorter timelines usually mean smaller crypto exposure.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 w-fit">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Plan Score
                  </div>
                  <div className={`text-3xl font-black mt-1 ${scoreColor(planScore)}`}>
                    {planScore}%
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-7">
                <div>
                  <div className="font-black text-slate-900 mb-3 text-lg">1. What is your main goal?</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <OptionPill
                      active={plan.goal === "learn"}
                      onClick={() => setPlan((p) => ({ ...p, goal: "learn" }))}
                      title="Learn safely"
                      subtitle="Start small and focus on understanding"
                      icon={<Sparkles className="w-5 h-5" />}
                    />
                    <OptionPill
                      active={plan.goal === "save"}
                      onClick={() => setPlan((p) => ({ ...p, goal: "save" }))}
                      title="Protect money"
                      subtitle="Keep risk low and avoid big swings"
                      icon={<ShieldCheck className="w-5 h-5" />}
                    />
                    <OptionPill
                      active={plan.goal === "grow"}
                      onClick={() => setPlan((p) => ({ ...p, goal: "grow" }))}
                      title="Grow long-term"
                      subtitle="Think patiently, not emotionally"
                      icon={<TrendingUp className="w-5 h-5" />}
                    />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 mb-3 text-lg">2. What is your time horizon?</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <OptionPill
                      active={plan.horizon === "1m"}
                      onClick={() => setPlan((p) => ({ ...p, horizon: "1m" }))}
                      title="1 month"
                      subtitle="Very short term, so risk should stay very low"
                      icon={<Clock3 className="w-5 h-5" />}
                    />
                    <OptionPill
                      active={plan.horizon === "1y"}
                      onClick={() => setPlan((p) => ({ ...p, horizon: "1y" }))}
                      title="1 year"
                      subtitle="Medium term, still cautious"
                      icon={<Clock3 className="w-5 h-5" />}
                    />
                    <OptionPill
                      active={plan.horizon === "5y"}
                      onClick={() => setPlan((p) => ({ ...p, horizon: "5y" }))}
                      title="5+ years"
                      subtitle="Longer term, but still needs discipline"
                      icon={<Clock3 className="w-5 h-5" />}
                    />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 mb-3 text-lg">3. Where will your crypto live?</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <OptionPill
                      active={plan.custody === "exchange"}
                      onClick={() => setPlan((p) => ({ ...p, custody: "exchange" }))}
                      title="Exchange wallet"
                      subtitle="Convenient, but has platform risk"
                      icon={<Wallet className="w-5 h-5" />}
                    />
                    <OptionPill
                      active={plan.custody === "self"}
                      onClick={() => setPlan((p) => ({ ...p, custody: "self" }))}
                      title="Self-custody"
                      subtitle="More control, more responsibility"
                      icon={<ShieldCheck className="w-5 h-5" />}
                    />
                    <OptionPill
                      active={plan.custody === "hybrid"}
                      onClick={() => setPlan((p) => ({ ...p, custody: "hybrid" }))}
                      title="Hybrid"
                      subtitle="A mix of convenience and control"
                      icon={<Target className="w-5 h-5" />}
                    />
                  </div>
                </div>

                <div>
                  <div className="font-black text-slate-900 mb-3 text-lg">4. Set your sizing</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                            Emergency Cash
                          </div>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {plan.emergencyCashPct}%
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                          🧯
                        </div>
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

                      <div className="text-sm text-slate-500 mt-2">
                        Your safety money outside crypto.
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                            Crypto Portion
                          </div>
                          <div className="text-2xl font-black text-slate-900 mt-1">
                            {plan.cryptoPct}%
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200">
                          🪙
                        </div>
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

                      <div className="text-sm text-slate-500 mt-2">
                        Beginner rule: small size protects learning.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="font-black text-slate-900 text-lg">5. Pick one rule for volatile days</div>
                  <p className="text-sm text-slate-600 mt-1">
                    This is your personal rule for staying calm when markets get emotional.
                  </p>

                  <select
                    value={plan.rule}
                    onChange={(e) => setPlan((p) => ({ ...p, rule: e.target.value }))}
                    className="mt-4 w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  >
                    <option value="">Select a rule</option>
                    <option value="If crypto drops 20%, I wait 24 hours before deciding anything">
                      Wait 24 hours during big drops
                    </option>
                    <option value="I never invest money I need within 6 months">
                      Never invest money I need soon
                    </option>
                    <option value="If I feel FOMO, I wait 48 hours and research first">
                      Slow down during FOMO
                    </option>
                    <option value="I check prices at most once per day">
                      Limit price checking
                    </option>
                    <option value="My crypto position never exceeds 10% of my savings">
                      Keep crypto under 10%
                    </option>
                  </select>
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
                className="mt-7 w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-black text-lg hover:opacity-95 transition-all shadow-lg disabled:bg-slate-200 disabled:text-slate-500"
              >
                Start the 7-Day Crypto Run
              </button>

              {!ready && (
                <div className="mt-3 text-sm text-slate-500">
                  Choose your goal, horizon, custody, and rule before starting.
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard>
                <div className="font-black text-slate-900 text-lg">Your Plan Snapshot</div>
                <div className="grid gap-3 mt-4">
                  <StatCard
                    label="Goal"
                    value={plan.goal ? goalText(plan.goal) : "—"}
                    icon={<Target className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Horizon"
                    value={plan.horizon ? horizonText(plan.horizon) : "—"}
                    icon={<Clock3 className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Custody"
                    value={plan.custody ? custodyText(plan.custody) : "—"}
                    icon={<Wallet className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Sizing"
                    value={`${plan.cryptoPct}% crypto / ${plan.emergencyCashPct}% cash`}
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                </div>
              </SectionCard>

              <SectionCard>
                <div className="font-black text-slate-900 text-lg">Safety reminders</div>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    Never share seed phrases or private keys.
                  </li>
                  <li className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    Do not click random support links or DMs.
                  </li>
                  <li className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    Keep crypto small if your horizon is short.
                  </li>
                  <li className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
                    Fees matter, especially for small transfers.
                  </li>
                </ul>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "week") {
    const pickedObj = picked ? day.options.find((o) => o.id === picked) : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="grid xl:grid-cols-[1fr_0.4fr] gap-6">
            <SectionCard>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div
                    className={[
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black tracking-widest uppercase mb-3",
                      badgeStyle(day.badge),
                    ].join(" ")}
                  >
                    {day.badge}
                  </div>

                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    7-Day Run
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                    {day.title}
                  </h2>
                  <div className="text-sm text-slate-500 mt-1">
                    Day {dayIdx + 1} of {EVENTS.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 w-fit">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Week Score
                  </div>
                  <div className={`text-3xl font-black mt-1 ${scoreColor(weekScore)}`}>
                    {weekScore}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <div className="font-black text-slate-900 mb-2">Situation</div>
                <p className="text-slate-700 leading-relaxed">{day.situation}</p>
              </div>

              <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-200 p-5">
                <div className="font-black text-blue-900 mb-2">Tip</div>
                <p className="text-blue-900/90 leading-relaxed">{day.tip}</p>
              </div>

              <div className="mt-6 space-y-3">
                {day.options.map((o) => (
                  <ChoiceCard
                    key={o.id}
                    id={o.id}
                    label={o.label}
                    selected={picked === o.id}
                    disabled={locked}
                    onClick={() => setPicked(o.id)}
                  />
                ))}
              </div>

              {locked && pickedObj && (
                <div
                  className={[
                    "mt-6 p-5 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2",
                    pickedObj.scoreDelta >= 8
                      ? "bg-emerald-50 border-emerald-200"
                      : pickedObj.scoreDelta > 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-amber-50 border-amber-200",
                  ].join(" ")}
                >
                  <div className="font-black text-slate-900 mb-2 flex items-center gap-2">
                    {pickedObj.scoreDelta > 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    {pickedObj.scoreDelta > 0 ? "Good call" : "Better habit"}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{pickedObj.why}</p>
                </div>
              )}

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
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-black hover:opacity-95 transition-all shadow-lg disabled:bg-slate-200 disabled:text-slate-500"
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
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-black hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {dayIdx < EVENTS.length - 1 ? "Next Day" : "Go to Reflection"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setView("week");
                    setDayIdx(0);
                    setPicked(null);
                    setLocked(false);
                    setWeekScore(50);
                    setChoiceLog([]);
                  }}
                  className="sm:w-[220px] py-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart Week
                </button>
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard>
                <div className="font-black text-slate-900 text-lg">Your Plan</div>
                <div className="grid gap-3 mt-4">
                  <StatCard
                    label="Horizon"
                    value={plan.horizon ? horizonText(plan.horizon) : "—"}
                    icon={<Clock3 className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Goal"
                    value={plan.goal ? goalText(plan.goal) : "—"}
                    icon={<Target className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Custody"
                    value={plan.custody ? custodyText(plan.custody) : "—"}
                    icon={<Wallet className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Crypto Size"
                    value={`${plan.cryptoPct}%`}
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Your Rule
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mt-2 leading-relaxed">
                    {plan.rule || "—"}
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <div className="font-black text-slate-900 text-lg">Recent choices</div>
                <div className="mt-4 space-y-2">
                  {choiceLog.length === 0 ? (
                    <div className="text-sm text-slate-500">No locked choices yet.</div>
                  ) : (
                    choiceLog.slice(-4).reverse().map((c) => (
                      <div
                        key={`${c.day}-${c.pick}-${c.delta}`}
                        className="rounded-2xl bg-slate-50 border border-slate-200 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900 text-sm">
                            Day {c.day}: {c.pick}
                          </div>
                          <div
                            className={`text-sm font-black ${
                              c.delta >= 0 ? "text-emerald-700" : "text-rose-700"
                            }`}
                          >
                            {c.delta >= 0 ? `+${c.delta}` : c.delta}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{c.badge}</div>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-8 pb-12">
          <div className="grid xl:grid-cols-[1fr_0.42fr] gap-6">
            <SectionCard>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Step 4
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
                    Reflect on your habits
                  </h2>
                  <p className="text-slate-600 mt-2 leading-relaxed">
                    Your score matters less than the decision habits you are building.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 w-fit">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Final Score
                  </div>
                  <div className={`text-3xl font-black mt-1 ${scoreColor(finalScore)}`}>
                    {finalScore}%
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="font-black text-slate-900 mb-3">Top wins</div>
                  <div className="space-y-2">
                    {topWins.length === 0 ? (
                      <div className="text-sm text-slate-700">No positive picks yet.</div>
                    ) : (
                      topWins.map((w) => (
                        <div key={`${w.day}-${w.pick}`} className="rounded-2xl bg-white border border-emerald-100 p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-900 text-sm">
                              Day {w.day}: {w.pick}
                            </div>
                            <div className="font-black text-emerald-700 text-sm">+{w.delta}</div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{w.badge}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="font-black text-slate-900 mb-3">Biggest traps</div>
                  <div className="space-y-2">
                    {topMistakes.length === 0 ? (
                      <div className="text-sm text-slate-700">Nice. You avoided the biggest traps.</div>
                    ) : (
                      topMistakes.map((m) => (
                        <div key={`${m.day}-${m.pick}`} className="rounded-2xl bg-white border border-amber-100 p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-slate-900 text-sm">
                              Day {m.day}: {m.pick}
                            </div>
                            <div className="font-black text-rose-700 text-sm">{m.delta}</div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{m.badge}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="font-black text-slate-900 text-lg">Optional reflection</div>
                <p className="text-sm text-slate-600 mt-1">
                  Write 2 to 4 sentences about what you learned.
                </p>

                <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
                  <div className="rounded-2xl bg-white border border-slate-200 p-4">
                    What rule helped you stay calm?
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 p-4">
                    What security habit will you never break?
                  </div>
                </div>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your reflection here..."
                  className="mt-4 w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-blue-200"
                />

                <div className="text-xs text-slate-500 mt-2">
                  Good rules become strong habits.
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setView("complete")}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-2xl font-black hover:opacity-95 transition-all shadow-lg"
                >
                  Finish Lesson
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
                  className="sm:w-[230px] py-4 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  Redo 7-Day Run
                </button>
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard>
                <div className="font-black text-slate-900 text-lg">Your plan snapshot</div>
                <div className="grid gap-3 mt-4">
                  <StatCard
                    label="Goal"
                    value={plan.goal ? goalText(plan.goal) : "—"}
                    icon={<Target className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Horizon"
                    value={plan.horizon ? horizonText(plan.horizon) : "—"}
                    icon={<Clock3 className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Custody"
                    value={plan.custody ? custodyText(plan.custody) : "—"}
                    icon={<Wallet className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Sizing"
                    value={`${plan.cryptoPct}% crypto / ${plan.emergencyCashPct}% cash`}
                    icon={<TrendingUp className="w-5 h-5" />}
                  />
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Volatility rule
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mt-2 leading-relaxed">
                    {plan.rule || "—"}
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "complete") {
    const g = gradeLabel(finalScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 pt-10 pb-12">
          <div className="grid lg:grid-cols-[1fr_0.5fr] gap-6">
            <SectionCard>
              <div className="text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white mx-auto mb-5 shadow-lg">
                  <Sparkles className="w-10 h-10" />
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                  Lesson 3 Complete
                </h2>
                <p className="text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
                  {g.desc}
                </p>

                <div className="mt-6 inline-flex rounded-3xl border border-slate-200 bg-slate-50 px-8 py-6">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-500 font-black">
                      Your Score
                    </div>
                    <div className={`text-5xl font-black mt-2 ${scoreColor(finalScore)}`}>
                      {finalScore}%
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-2">{g.title}</div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => onComplete(finalScore)}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:opacity-90 transition-all shadow-lg"
                  >
                    Back to Module Overview
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
                    className="w-full py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
                  >
                    Redo Lesson 3
                  </button>
                </div>
              </div>
            </SectionCard>

            <div className="space-y-6">
              <SectionCard>
                <div className="font-black text-slate-900 text-lg">What you practiced</div>
                <div className="grid gap-3 mt-4">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Building a plan with a goal, horizon, custody choice, and sizing
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Handling hype, fear, and confidence without impulsive decisions
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Protecting your wallet from scams and seed phrase traps
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    Thinking about fees, timing, and safer habits
                  </div>
                </div>
              </SectionCard>

              <SectionCard>
                <div className="font-black text-slate-900 text-lg">Your reflection</div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 leading-relaxed min-h-[100px]">
                  {notes.trim().length ? notes : "No reflection saved yet."}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}