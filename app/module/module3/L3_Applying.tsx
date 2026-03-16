"use client";

import React, { useMemo, useState } from "react";
import { awardXP, XP_REWARDS } from "@/lib/progress";
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
  options: {
    id: "A" | "B" | "C";
    label: string;
    scoreDelta: number;
    why: string;
  }[];
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
        label:
          "Pause, research it, and only use a tiny amount if you still want to learn",
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
        label:
          "Check whether your crypto size still matches your plan and do nothing today",
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
        label:
          "Block or report the message and only use official support channels you find yourself",
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
        label:
          "Wait for a cheaper time or use a cheaper network if it is appropriate",
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
        label:
          "Tell them never to invest money they need soon and to start small if they want to learn",
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
        label:
          "Stick to your plan and do not change your sizing because of one good week",
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
    <div
      className={`bg-white border border-slate-100 shadow-md rounded-3xl p-4 md:p-5 ${className}`}
    >
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
        "w-full rounded-2xl border-2 p-3 text-left transition-all",
        active
          ? "border-sky-400 bg-sky-50"
          : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
          {icon}
        </div>
        <div>
          <div className="font-bold text-sm md:text-base text-slate-900">
            {title}
          </div>
          <div className="text-xs md:text-sm text-slate-600 mt-0.5 leading-snug">
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
}

function ChoiceCard({
  id,
  label,
  selected,
  disabled,
  onClick,
  scoreDelta,
}: {
  id: "A" | "B" | "C";
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  scoreDelta?: number;
}) {
  let borderColor = "border-slate-200";
  let bgColor = "bg-white";

  if (selected && !disabled && scoreDelta !== undefined) {
    if (scoreDelta > 0) {
      borderColor = "border-emerald-400";
      bgColor = "bg-emerald-50";
    } else if (scoreDelta < 0) {
      borderColor = "border-rose-400";
      bgColor = "bg-rose-50";
    } else {
      borderColor = "border-amber-400";
      bgColor = "bg-amber-50";
    }
  } else if (selected && !disabled) {
    borderColor = "border-sky-500";
    bgColor = "bg-sky-50";
  }

  if (!selected && !disabled) {
    borderColor = "border-slate-200 hover:border-slate-300";
    bgColor = "bg-white hover:bg-slate-50";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl border-2 p-3 text-left transition-all ${borderColor} ${bgColor} ${
        disabled ? "cursor-default" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
          {id}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm md:text-base text-slate-900 leading-snug">
            {label}
          </div>
          {selected && !disabled && scoreDelta !== undefined && (
            <div className="mt-1.5 text-[11px] font-bold">
              {scoreDelta > 0 ? (
                <span className="text-emerald-600">
                  ✓ Good choice (+{scoreDelta} points)
                </span>
              ) : scoreDelta < 0 ? (
                <span className="text-rose-600">
                  ✕ Risky choice ({scoreDelta} points)
                </span>
              ) : (
                <span className="text-amber-600">~ Neutral choice</span>
              )}
            </div>
          )}
        </div>
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
    {
      day: number;
      badge: DayEvent["badge"];
      title: string;
      pick: "A" | "B" | "C";
      delta: number;
    }[]
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

    if (
      plan.horizon === "5y" &&
      (plan.custody === "self" || plan.custody === "hybrid")
    ) {
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
    if (view === "week")
      return 25 + ((dayIdx + (locked ? 1 : 0)) / EVENTS.length) * 55;
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
      className="fixed top-3 left-4 z-50 flex items-center gap-2 px-3 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
      aria-label="Back"
    >
      <ChevronLeft className="w-4 h-4" />
      Back
    </button>
  );

  const Stepper = () => {
    const steps = ["Intro", "Build Plan", "7-Day Run", "Reflect", "Finish"];
    return (
      <div className="w-full max-w-5xl mx-auto px-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;

            return (
              <div key={s} className="flex-1">
                <div
                  className={[
                    "rounded-xl border px-2 py-1.5 text-center text-[11px] font-bold tracking-wide",
                    done
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : active
                      ? "bg-sky-50 border-sky-200 text-sky-700"
                      : "bg-white border-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {s}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-500"
            style={{ width: `${clamp(progress, 0, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  if (view === "intro") {
    return (
      <div className="min-h-screen bg-[#F7FAFC] [@media(max-height:850px)]:scale-[0.94] [@media(max-height:850px)]:origin-top">
        <BackButton />
        <Stepper />

        <div className="max-w-[1000px] mx-auto px-4 sm:px-5 pt-4 pb-4">
          <div className="text-center mb-5">
            <div className="inline-flex items-center px-4 py-2 bg-violet-100 text-violet-700 rounded-full mb-4">
              <span className="text-xs font-bold uppercase tracking-widest">
                Lesson 3: Apply
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Build Your Crypto Plan & Survive the Week
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              First, you'll build a simple crypto plan. Then you'll go through a
              week of realistic choices involving hype, fear, scams, fees, and
              risk.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-3">
                <Target className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Mindset
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Avoid panic and FOMO
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Security
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Protect your wallet
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                <NotebookPen className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                Planning
              </h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                Stick to your rules
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-600 to-violet-600 rounded-3xl p-5 md:p-6 text-white text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Ready to test your instincts?
            </h2>
            <p className="text-sky-100 text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed">
              Build your plan (25% of score) and survive 7 days of crypto
              decisions (75% of score).
            </p>
            <button
              onClick={() => setView("plan")}
              className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:scale-105 transition-transform shadow-md text-sm md:text-base"
            >
              Start Building My Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "plan") {
    return (
      <div className="min-h-screen bg-[#F7FAFC] [@media(max-height:850px)]:scale-[0.94] [@media(max-height:850px)]:origin-top">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 sm:px-5 pt-4 pb-4">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Build Your Crypto Plan
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Your goal and time horizon should shape your risk
            </p>
          </div>

          <SectionCard>
            <div className="space-y-5">
              <div>
                <div className="font-bold text-slate-900 mb-2 text-base md:text-lg">
                  1. What is your main goal?
                </div>
                <div className="grid md:grid-cols-3 gap-2.5">
                  <OptionPill
                    active={plan.goal === "learn"}
                    onClick={() => setPlan((p) => ({ ...p, goal: "learn" }))}
                    title="Learn safely"
                    subtitle="Start small and focus on understanding"
                    icon={<Sparkles className="w-4 h-4" />}
                  />
                  <OptionPill
                    active={plan.goal === "save"}
                    onClick={() => setPlan((p) => ({ ...p, goal: "save" }))}
                    title="Protect money"
                    subtitle="Keep risk low and avoid big swings"
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />
                  <OptionPill
                    active={plan.goal === "grow"}
                    onClick={() => setPlan((p) => ({ ...p, goal: "grow" }))}
                    title="Grow long-term"
                    subtitle="Think patiently, not emotionally"
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-2 text-base md:text-lg">
                  2. What is your time horizon?
                </div>
                <div className="grid md:grid-cols-3 gap-2.5">
                  <OptionPill
                    active={plan.horizon === "1m"}
                    onClick={() => setPlan((p) => ({ ...p, horizon: "1m" }))}
                    title="1 month"
                    subtitle="Very short term, so risk should stay very low"
                    icon={<Clock3 className="w-4 h-4" />}
                  />
                  <OptionPill
                    active={plan.horizon === "1y"}
                    onClick={() => setPlan((p) => ({ ...p, horizon: "1y" }))}
                    title="1 year"
                    subtitle="Medium term, still cautious"
                    icon={<Clock3 className="w-4 h-4" />}
                  />
                  <OptionPill
                    active={plan.horizon === "5y"}
                    onClick={() => setPlan((p) => ({ ...p, horizon: "5y" }))}
                    title="5+ years"
                    subtitle="Longer term, but still needs discipline"
                    icon={<Clock3 className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-2 text-base md:text-lg">
                  3. Where will your crypto live?
                </div>
                <div className="grid md:grid-cols-3 gap-2.5">
                  <OptionPill
                    active={plan.custody === "exchange"}
                    onClick={() =>
                      setPlan((p) => ({ ...p, custody: "exchange" }))
                    }
                    title="Exchange wallet"
                    subtitle="Convenient, but has platform risk"
                    icon={<Wallet className="w-4 h-4" />}
                  />
                  <OptionPill
                    active={plan.custody === "self"}
                    onClick={() => setPlan((p) => ({ ...p, custody: "self" }))}
                    title="Self-custody"
                    subtitle="More control, more responsibility"
                    icon={<ShieldCheck className="w-4 h-4" />}
                  />
                  <OptionPill
                    active={plan.custody === "hybrid"}
                    onClick={() =>
                      setPlan((p) => ({ ...p, custody: "hybrid" }))
                    }
                    title="Hybrid"
                    subtitle="A mix of convenience and control"
                    icon={<Target className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-900 mb-2 text-base md:text-lg">
                  4. Set your sizing
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                          Emergency Cash
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                          {plan.emergencyCashPct}%
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-sm">
                        🧯
                      </div>
                    </div>

                    <input
                      className="mt-3 w-full"
                      type="range"
                      min={0}
                      max={100}
                      value={plan.emergencyCashPct}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setPlan((p) => ({
                          ...p,
                          emergencyCashPct: v,
                          cryptoPct: 100 - v,
                        }));
                      }}
                    />

                    <div className="text-xs md:text-sm text-slate-500 mt-1.5">
                      Your safety money outside crypto.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                          Crypto Portion
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-slate-900 mt-1">
                          {plan.cryptoPct}%
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-200 text-sm">
                        🪙
                      </div>
                    </div>

                    <input
                      className="mt-3 w-full"
                      type="range"
                      min={0}
                      max={100}
                      value={plan.cryptoPct}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setPlan((p) => ({
                          ...p,
                          cryptoPct: v,
                          emergencyCashPct: 100 - v,
                        }));
                      }}
                    />

                    <div className="text-xs md:text-sm text-slate-500 mt-1.5">
                      Beginner rule: small size protects learning.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="font-bold text-slate-900 text-base md:text-lg">
                  5. Pick one rule for volatile days
                </div>
                <p className="text-xs md:text-sm text-slate-600 mt-1">
                  This is your personal rule for staying calm when markets get
                  emotional.
                </p>

                <select
                  value={plan.rule}
                  onChange={(e) =>
                    setPlan((p) => ({ ...p, rule: e.target.value }))
                  }
                  className="mt-3 w-full rounded-2xl border-2 border-slate-200 bg-white p-3 text-sm text-slate-800 font-medium outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400"
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
              onClick={async () => {
                await awardXP(20);
                setView("week");
                setDayIdx(0);
                setPicked(null);
                setLocked(false);
                setWeekScore(50);
                setChoiceLog([]);
              }}
              className="mt-5 w-full py-3.5 bg-gradient-to-r from-sky-600 to-violet-600 text-white rounded-2xl font-bold text-base hover:opacity-95 transition-all shadow-lg disabled:bg-slate-200 disabled:text-slate-500"
            >
              Start the 7-Day Crypto Run
            </button>

            {!ready && (
              <div className="mt-2 text-xs md:text-sm text-slate-500 text-center">
                Choose your goal, horizon, custody, and rule before starting.
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    );
  }

  if (view === "week") {
    const pickedObj = picked ? day.options.find((o) => o.id === picked) : null;

    return (
      <div className="min-h-screen bg-[#F7FAFC] [@media(max-height:850px)]:scale-[0.94] [@media(max-height:850px)]:origin-top">
        <BackButton />
        <Stepper />

        <div className="max-w-4xl mx-auto px-4 sm:px-5 pt-4 pb-4">
          <div className="text-center mb-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs md:text-sm font-bold mb-2 ${badgeStyle(
                day.badge
              )}`}
            >
              {day.badge}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {day.title}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Day {dayIdx + 1} of {EVENTS.length}
            </p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs md:text-sm mb-1.5">
              <span className="font-bold text-slate-700">Week Progress</span>
              <span className="text-slate-500">
                {dayIdx + 1}/{EVENTS.length}
              </span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-500"
                style={{
                  width: `${((dayIdx + 1) / EVENTS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <SectionCard>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
              <div className="font-bold text-slate-900 mb-1.5 text-sm md:text-base">
                Situation
              </div>
              <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                {day.situation}
              </p>
            </div>

            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 mb-4">
              <div className="font-bold text-sky-900 mb-1.5 text-sm md:text-base">
                Tip
              </div>
              <p className="text-sm md:text-base text-sky-900/90 leading-relaxed">
                {day.tip}
              </p>
            </div>

            <div className="space-y-2.5 mb-4">
              {day.options.map((o) => (
                <ChoiceCard
                  key={o.id}
                  id={o.id}
                  label={o.label}
                  selected={picked === o.id}
                  disabled={locked}
                  onClick={() => !locked && setPicked(o.id)}
                  scoreDelta={o.scoreDelta}
                />
              ))}
            </div>

            {locked && pickedObj && (
              <div
                className={`p-4 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 mb-4 ${
                  pickedObj.scoreDelta >= 8
                    ? "bg-emerald-50 border-emerald-200"
                    : pickedObj.scoreDelta > 0
                    ? "bg-sky-50 border-sky-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-2 text-sm md:text-base">
                  {pickedObj.scoreDelta > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  {pickedObj.scoreDelta > 0 ? "Good call" : "Better habit"}
                </div>
                <p className="text-sm md:text-base text-slate-700 leading-relaxed">
                  {pickedObj.why}
                </p>
              </div>
            )}

            {!locked ? (
              <button
                onClick={() => {
                  if (!picked) return;
                  const opt = day.options.find((o) => o.id === picked)!;
                  setLocked(true);
                  setWeekScore((s) => clamp(s + opt.scoreDelta, 0, 100));
                  setChoiceLog((log) => [
                    ...log,
                    {
                      day: day.id,
                      badge: day.badge,
                      title: day.title,
                      pick: picked,
                      delta: opt.scoreDelta,
                    },
                  ]);
                }}
                disabled={!picked}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg disabled:bg-slate-200 disabled:text-slate-500"
              >
                Lock Choice
              </button>
            ) : (
              <button
                onClick={async () => {
                  await awardXP(20);
                  setLocked(false);
                  setPicked(null);
                  if (dayIdx < EVENTS.length - 1) {
                    setDayIdx((d) => d + 1);
                  } else {
                    setView("reflection");
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {dayIdx < EVENTS.length - 1 ? "Next Day" : "Go to Reflection"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </SectionCard>
        </div>
      </div>
    );
  }

  if (view === "reflection") {
    const goodChoices = [...choiceLog]
      .filter((c) => c.delta > 0)
      .sort((a, b) => b.delta - a.delta);

    const badChoices = [...choiceLog]
      .filter((c) => c.delta < 0)
      .sort((a, b) => a.delta - b.delta);

    return (
      <div className="min-h-screen bg-[#F7FAFC] [@media(max-height:850px)]:scale-[0.94] [@media(max-height:850px)]:origin-top">
        <BackButton />
        <Stepper />

        <div className="max-w-5xl mx-auto px-4 sm:px-5 pt-4 pb-4">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Reflect on Your Habits
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Review your decisions and learn from the experience
            </p>
          </div>

          <SectionCard>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="font-bold text-slate-900 mb-1.5 text-base md:text-lg">
                  ✓ What went well
                </div>
                <p className="text-[11px] md:text-xs text-emerald-700 mb-2.5">
                  These choices helped your crypto journey
                </p>
                <div className="space-y-2.5">
                  {goodChoices.length === 0 ? (
                    <div className="text-sm text-slate-700 italic">
                      No positive decisions this round. Try making choices that
                      prioritize research and safety!
                    </div>
                  ) : (
                    goodChoices.map((w) => {
                      const eventData = EVENTS.find((e) => e.id === w.day);
                      const choiceData = eventData?.options.find(
                        (o) => o.id === w.pick
                      );
                      return (
                        <div
                          key={`${w.day}-${w.pick}`}
                          className="rounded-2xl bg-white border border-emerald-200 p-3"
                        >
                          <div className="flex items-start justify-between mb-1.5 gap-3">
                            <div className="font-bold text-sm md:text-base text-slate-900">
                              {w.title}
                            </div>
                            <div className="font-bold text-emerald-700 text-xs bg-emerald-100 px-2 py-1 rounded-lg whitespace-nowrap">
                              +{w.delta}
                            </div>
                          </div>
                          <div className="text-xs md:text-sm text-slate-600 mb-1.5">
                            You chose: {choiceData?.label}
                          </div>
                          <div className="text-[11px] md:text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                            {choiceData?.why}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="font-bold text-slate-900 mb-1.5 text-base md:text-lg">
                  ✕ What didn't go well
                </div>
                <p className="text-[11px] md:text-xs text-rose-700 mb-2.5">
                  Learn from these to make better choices next time
                </p>
                <div className="space-y-2.5">
                  {badChoices.length === 0 ? (
                    <div className="text-sm text-slate-700 italic">
                      Great! You avoided all the traps and made smart decisions
                      throughout.
                    </div>
                  ) : (
                    badChoices.map((m) => {
                      const eventData = EVENTS.find((e) => e.id === m.day);
                      const choiceData = eventData?.options.find(
                        (o) => o.id === m.pick
                      );
                      return (
                        <div
                          key={`${m.day}-${m.pick}`}
                          className="rounded-2xl bg-white border border-rose-200 p-3"
                        >
                          <div className="flex items-start justify-between mb-1.5 gap-3">
                            <div className="font-bold text-sm md:text-base text-slate-900">
                              {m.title}
                            </div>
                            <div className="font-bold text-rose-700 text-xs bg-rose-100 px-2 py-1 rounded-lg whitespace-nowrap">
                              {m.delta}
                            </div>
                          </div>
                          <div className="text-xs md:text-sm text-slate-600 mb-1.5">
                            You chose: {choiceData?.label}
                          </div>
                          <div className="text-[11px] md:text-xs text-rose-700 bg-rose-50 p-2 rounded-lg">
                            {choiceData?.why}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-4">
              <div className="font-bold text-slate-900 text-base md:text-lg">
                Optional reflection
              </div>
              <p className="text-xs md:text-sm text-slate-600 mt-1">
                Write 2 to 4 sentences about what you learned.
              </p>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your reflection here..."
                className="mt-3 w-full min-h-[90px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <button
              onClick={async () => {
                await awardXP(
                  XP_REWARDS.COMPLETE_STEP + XP_REWARDS.COMPLETE_MODULE
                );
                setView("complete");
              }}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-violet-600 text-white rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg"
            >
              See Final Results
            </button>
          </SectionCard>
        </div>
      </div>
    );
  }

  if (view === "complete") {
    const g = gradeLabel(finalScore);

    return (
      <div className="min-h-screen bg-[#F7FAFC] px-4 sm:px-5 pt-5 pb-4 [@media(max-height:850px)]:scale-[0.94] [@media(max-height:850px)]:origin-top">
        <div className="max-w-2xl mx-auto animate-in zoom-in">
          <div className="bg-white rounded-[32px] p-6 md:p-7 shadow-2xl border border-slate-100 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>

            <div className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full mb-3">
              <span className="text-xs md:text-sm font-bold">
                Lesson Complete
              </span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {g.title}
            </h2>

            <div
              className={`text-5xl md:text-6xl font-black mb-3 ${scoreColor(
                finalScore
              )}`}
            >
              {finalScore}%
            </div>

            <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-5">
              {g.desc}
            </p>

            <div className="bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 rounded-3xl p-5 mb-5 border border-sky-100 shadow-inner text-left">
              <div className="text-center mb-4">
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                  What you practiced
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  These are the skills this lesson helped you build.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-sm text-sm md:text-base">
                  Building a plan with a goal, horizon, custody choice, and
                  sizing
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-sm text-sm md:text-base">
                  Handling hype, fear, and confidence without impulsive
                  decisions
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-sm text-sm md:text-base">
                  Protecting your wallet from scams and seed phrase traps
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-slate-100 shadow-sm text-sm md:text-base">
                  Thinking about fees, timing, and safer habits
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onComplete(finalScore)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base md:text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Complete Module 3
              </button>

              <button
                onClick={() => {
                  setView("intro");
                  setPlan({
                    horizon: null,
                    goal: null,
                    custody: null,
                    emergencyCashPct: 70,
                    cryptoPct: 30,
                    rule: "",
                  });
                  setDayIdx(0);
                  setPicked(null);
                  setLocked(false);
                  setWeekScore(50);
                  setChoiceLog([]);
                  setNotes("");
                }}
                className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
              >
                Redo Lesson 3
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}