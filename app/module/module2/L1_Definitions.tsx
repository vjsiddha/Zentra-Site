"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

/**
 * Module 2 — Lesson 1 (Definitions + Misconception Challenge)
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
    term: "Portfolio",
    subtitle: "Your investments + the weights (percentages)",
    definition:
      "A portfolio is the collection of assets you own and how your money is split between them. The split (weights) matters as much as the assets themselves.",
    deeper:
      "Portfolios are about tradeoffs: more growth potential usually means more short-term swings. The goal isn’t “max return,” it’s “best return for the risk + time horizon you can tolerate.”",
    example:
      "Example: $2,000 total. Portfolio A = 100% single stock. Portfolio B = 80% broad ETF + 20% cash. Even if both contain stocks, the experience (stress + volatility) is completely different.",
    takeaway:
      "Two people can own the same assets and still have different risk depending on their weights.",
    image: "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=1200",
  },
  {
    id: 2,
    term: "Stock",
    subtitle: "Ownership in one company (high concentration risk)",
    definition:
      "A stock is a share of ownership in a single company. Your return depends heavily on that company’s future (earnings, competition, regulation, hype).",
    deeper:
      "Stocks can be excellent long-term assets — but they’re concentrated. One company can underperform for years, even if the market overall does well.",
    example:
      "If you put 60% of your portfolio into one company, one piece of news can move your whole portfolio. That’s concentration risk.",
    takeaway:
      "Stocks aren’t “bad” — they’re just more sensitive to company-specific outcomes.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200",
  },
  {
    id: 3,
    term: "ETF",
    subtitle: "A basket you can trade like a stock",
    definition:
      "An ETF bundles many investments into one product. Many ETFs track an index (like a market benchmark), giving you diversification in one purchase.",
    deeper:
      "Not all ETFs are diversified: a ‘tech ETF’ or ‘crypto ETF’ can still be concentrated. Always ask: what does it hold, and how concentrated is it?",
    example:
      "Broad market ETF: hundreds of companies across sectors. Sector ETF: concentrated in one area (higher correlation among holdings).",
    takeaway:
      "ETFs reduce single-company risk — but can still be risky depending on what’s inside.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200",
  },
  {
    id: 4,
    term: "Mutual Fund",
    subtitle: "Often actively managed (fees must be earned back)",
    definition:
      "A mutual fund pools money from many investors. Many mutual funds are actively managed: professionals choose what to buy/sell aiming to outperform a benchmark.",
    deeper:
      "Active management isn’t automatically wrong — but fees create a hurdle. If a fund charges ~2% per year, it needs to outperform by ~2% per year just to match a low-fee alternative.",
    example:
      "If the market returns 7%, and a fund returns 7% before fees but charges 2%, you keep ~5%. That gap compounds over time.",
    takeaway:
      "With active funds, the question is: is the extra fee worth the extra performance after fees?",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200",
  },
  {
    id: 5,
    term: "Risk vs Return",
    subtitle: "Risk = uncertainty + volatility (range of outcomes)",
    definition:
      "Risk isn’t just “losing money.” In investing it usually means uncertainty: how wide the range of possible outcomes is, and how much returns can swing.",
    deeper:
      "Higher expected return usually comes with higher volatility. The problem is: volatility hurts more when your time horizon is short or when you panic sell.",
    example:
      "Two investments could both average +6% annually over decades, but one might swing -20% in a single year while the other swings -5%. Same average, different experience.",
    takeaway:
      "Risk is partly about the asset and partly about your timeline + behavior.",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200",
  },
  {
    id: 6,
    term: "Time Horizon",
    subtitle: "How long until you need the money",
    definition:
      "Time horizon is the time until you’ll need to use the money. It’s one of the biggest factors in choosing the right asset mix.",
    deeper:
      "Short horizons make volatility dangerous — you might be forced to sell during a drop. Longer horizons increase the chance you can recover from downturns (but don’t eliminate risk).",
    example:
      "Laptop in 6 months → stability matters. University in 4 years → mix matters. Retirement decades away → volatility is easier to tolerate (if you stay disciplined).",
    takeaway:
      "Same asset can be ‘too risky’ or ‘fine’ depending on when you need the money.",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200",
  },
  {
    id: 7,
    term: "Diversification",
    subtitle: "Not just “many holdings” — different exposures",
    definition:
      "Diversification means spreading money across different assets so one outcome doesn’t dominate your results.",
    deeper:
      "Real diversification is about correlation: if your assets tend to fall together, you’re less protected. Diversifying across sectors/regions/asset types helps reduce this.",
    example:
      "Owning 20 tech stocks is still mostly one bet. Owning a broad market ETF plus some bonds/cash is more diversified.",
    takeaway:
      "Diversification reduces the chance one mistake wipes you out.",
    image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1200",
  },
  {
    id: 8,
    term: "Fees (MER) + Fee Drag",
    subtitle: "A quiet cost that compounds against you",
    definition:
      "MER is the annual fee charged by funds. You don’t pay it like a bill — it’s deducted inside the fund, lowering what you keep.",
    deeper:
      "Fees don’t just reduce returns once — they reduce the amount that can compound. Over decades, a 1–2% fee gap can become a huge difference in final wealth.",
    example:
      "Two funds earn the same before-fee return. The lower-fee investor keeps more every year, so their money compounds faster.",
    takeaway:
      "A ‘small’ percentage fee becomes a big dollar difference over time.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200",
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
    statement: "“ETFs are automatically safer than stocks.”",
    correct: "depends",
    nuanceTitle: "It depends on what the ETF holds.",
    nuance:
      "A broad-market ETF can reduce single-company risk, but a sector ETF (like only tech) can still be risky. “ETF” describes the container, not the risk level.",
    whyItMatters:
      "You’re not buying the label — you’re buying the underlying holdings and concentration.",
  },
  {
    id: 2,
    statement: "“Higher fees usually mean better performance.”",
    correct: "false",
    nuanceTitle: "Fees are guaranteed; outperformance isn’t.",
    nuance:
      "A higher MER is certain, but beating the market consistently is hard. Fees create a performance hurdle that many funds don’t clear after costs.",
    whyItMatters:
      "Two investors can buy similar exposure — the lower-fee investor starts ahead every single year.",
  },
  {
    id: 3,
    statement: "“Stocks are a bad choice for short-term goals.”",
    correct: "true",
    nuanceTitle: "Short horizons can’t wait out big drops.",
    nuance:
      "Stocks can fall sharply in months. If you need the money soon, volatility can force you to sell at the wrong time.",
    whyItMatters:
      "Time horizon is a risk filter: the shorter it is, the more stability matters.",
  },
  {
    id: 4,
    statement: "“Diversification reduces risk, but can reduce extreme gains.”",
    correct: "true",
    nuanceTitle: "You trade ‘lottery outcomes’ for reliability.",
    nuance:
      "Diversification helps protect you from one disaster, but also means you won’t fully capture the upside of the single best performer.",
    whyItMatters:
      "Most long-term investors prefer consistent progress over one perfect pick — especially beginners.",
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
      // allow going back only before locking an answer
      if (!lockedChoice) {
        if (challengeIdx > 0) setChallengeIdx((v) => v - 1);
        else {
          setView("study");
          setCurrentIndex(DEFINITIONS.length - 1);
        }
      }
      return;
    }
  };

  const handleRedoLesson = () => {
    setView("intro");
    setCurrentIndex(0);
    setChallengeIdx(0);
    setLockedChoice(null);
    setScore(0);
  };

  const percentage = useMemo(() => {
    // each challenge worth 25 points
    const max = CHALLENGES.length * 25;
    return Math.round((score / max) * 100);
  }, [score]);

  const feedback = useMemo(() => {
    if (percentage >= 85) {
      return {
        emoji: "🧠",
        title: "Portfolio Brain!",
        msg:
          "You’re thinking like an investor: labels aren’t enough, fees matter, and time horizon changes what “risky” means. That’s a strong foundation.",
        color: "text-green-600",
        img: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=400",
      };
    }
    if (percentage >= 60) {
      return {
        emoji: "🦉",
        title: "Smart & Improving!",
        msg:
          "Good instincts. Review ETF concentration and the difference between short-term vs long-term risk — then you’re set for simulations.",
        color: "text-sky-600",
        img: "https://images.unsplash.com/photo-1543832923-44667a44c804?q=80&w=400",
      };
    }
    return {
      emoji: "🧩",
      title: "Foundation Loading…",
      msg:
        "Totally normal at the start. Re-run definitions and pay attention to time horizon + fee drag — those concepts unlock the rest of the module.",
      color: "text-red-600",
      img: "https://images.unsplash.com/photo-1516632664305-eda5d0bb39b5?q=80&w=400",
      };
  }, [percentage]);

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  // -------------------- VIEW: INTRO --------------------
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        {showBackButton && <BackButton />}

        <div className="w-full text-center mb-6">
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">Module 2</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Introduction to Investing</h1>
          <p className="text-slate-500 text-sm mt-2">Lesson 1: Definitions + real-world misconceptions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col items-start">
            <img
              src="https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?q=80&w=600"
              className="w-full h-[250px] object-cover rounded-xl mb-3"
              alt="Learn"
            />
            <h3 className="text-base font-medium">Learn</h3>
            <p className="text-sm text-[#4F7D96]">Portfolio, assets, risk, diversification, fees</p>
          </div>
          <div className="flex flex-col items-start">
            <img
              src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600"
              className="w-full h-[250px] object-cover rounded-xl mb-3"
              alt="Think"
            />
            <h3 className="text-base font-medium">Think</h3>
            <p className="text-sm text-[#4F7D96]">Why the “obvious” answer is sometimes wrong</p>
          </div>
          <div className="flex flex-col items-start">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600"
              className="w-full h-[250px] object-cover rounded-xl mb-3"
              alt="Challenge"
            />
            <h3 className="text-base font-medium">Challenge</h3>
            <p className="text-sm text-[#4F7D96]">True / False / It Depends — with real explanations</p>
          </div>
        </div>

        <p className="text-center mb-10 max-w-2xl text-[#0D171C]">
          This lesson gives you the vocabulary <span className="font-semibold">and</span> the mental models:
          weights, time horizon, concentration vs diversification, and why fees quietly matter.
        </p>

        <button onClick={() => setView("study")} className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold">
          Start Learning
        </button>
      </div>
    );
  }

  // -------------------- VIEW: STUDY --------------------
  if (view === "study") {
    const d = DEFINITIONS[currentIndex];

    const handleNext = () => {
      if (currentIndex < DEFINITIONS.length - 1) setCurrentIndex((v) => v + 1);
      else {
        setView("challenge");
        setChallengeIdx(0);
        setLockedChoice(null);
      }
    };

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-10">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Learn: Key Concepts</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">{d.term}</h2>
            <p className="text-slate-400 text-sm mt-2">
              Concept {currentIndex + 1} of {DEFINITIONS.length} • <span className="text-slate-500">{d.subtitle}</span>
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-10 items-center bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <Image src={d.image} alt={`${d.term} illustration`} fill className="object-cover" />
            </div>

            <div>
              <p className="text-lg text-slate-800 leading-relaxed font-semibold mb-3">{d.definition}</p>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Deeper insight</p>
                <p className="text-slate-700 leading-relaxed">{d.deeper}</p>
              </div>

              <div className="mt-4 p-6 bg-sky-50 rounded-2xl border border-sky-100">
                <p className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">Example</p>
                <p className="text-slate-700 leading-relaxed">{d.example}</p>
              </div>

              <div className="mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Key takeaway</p>
                <p className="text-slate-800 font-medium">{d.takeaway}</p>
              </div>

              <button
                onClick={handleNext}
                className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg"
              >
                {currentIndex === DEFINITIONS.length - 1 ? "Start Misconception Challenge" : "Next Concept"}
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // -------------------- VIEW: CHALLENGE --------------------
  if (view === "challenge") {
    const c = CHALLENGES[challengeIdx];

    const progressPct = Math.round(((challengeIdx + 1) / CHALLENGES.length) * 100);

    const pick = (choice: ChallengeChoice) => {
      if (lockedChoice) return;
      setLockedChoice(choice);
      if (choice === c.correct) setScore((s) => s + 25);
    };

    const next = () => {
      if (challengeIdx < CHALLENGES.length - 1) {
        setChallengeIdx((v) => v + 1);
        setLockedChoice(null);
      } else {
        setView("results");
      }
    };

    const ChoiceButton = ({
      value,
      label,
      sub,
    }: {
      value: ChallengeChoice;
      label: string;
      sub: string;
    }) => {
      const isChosen = lockedChoice === value;
      const isCorrect = lockedChoice && value === c.correct;

      let style = "border-slate-200 hover:bg-slate-50";
      if (lockedChoice) style = "border-slate-200 opacity-90";
      if (isChosen) style = "border-sky-500 bg-sky-50";
      if (lockedChoice && isCorrect) style = "border-green-500 bg-green-50 text-green-800";
      if (lockedChoice && isChosen && value !== c.correct) style = "border-red-500 bg-red-50 text-red-800";

      return (
        <button
          onClick={() => pick(value)}
          disabled={Boolean(lockedChoice)}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${style}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold tracking-wide">{label}</span>
            {lockedChoice && isCorrect && <span className="font-black text-green-700">✓</span>}
            {lockedChoice && isChosen && value !== c.correct && <span className="font-black text-red-700">✕</span>}
          </div>
          <p className="text-sm mt-1 text-slate-600">{sub}</p>
        </button>
      );
    };

    const correctnessTag =
      lockedChoice === null
        ? null
        : lockedChoice === c.correct
        ? { icon: "✅", text: "Correct", cls: "bg-green-50 border-green-200 text-green-700" }
        : { icon: "❌", text: "Not quite", cls: "bg-red-50 border-red-200 text-red-700" };

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        {showBackButton && <BackButton />}

        <section className="animate-in zoom-in duration-300 max-w-3xl mx-auto pt-16">
          <header className="text-center mb-8">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Challenge</p>
            <h2 className="text-2xl font-bold text-slate-900">Misconception Check</h2>
            <p className="text-slate-500 mt-2">
              Statement {challengeIdx + 1} of {CHALLENGES.length}
            </p>

            <div className="max-w-xl mx-auto mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </header>

          <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-100">
            <div className="p-6 rounded-2xl bg-slate-900 text-white mb-6">
              <p className="text-xs uppercase tracking-widest text-slate-200 font-bold mb-2">Statement</p>
              <p className="text-xl font-black leading-relaxed">{c.statement}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <ChoiceButton value="true" label="TRUE" sub="Always correct." />
              <ChoiceButton value="false" label="FALSE" sub="Always wrong." />
              <ChoiceButton value="depends" label="IT DEPENDS" sub="Context matters." />
            </div>

            {lockedChoice && (
              <div className={`mt-6 p-6 rounded-2xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${correctnessTag?.cls}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{correctnessTag?.icon}</span>
                    <span className="font-black uppercase tracking-wider text-sm">{correctnessTag?.text}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-600">
                    Correct answer: <span className="text-slate-900">{c.correct.toUpperCase()}</span>
                  </div>
                </div>

                <div className="bg-white/70 rounded-xl p-4 border border-black/5">
                  <p className="text-sm font-extrabold text-slate-900 mb-1">{c.nuanceTitle}</p>
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
