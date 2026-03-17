"use client";

import { useMemo, useState } from "react";

type QA = {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const DEFINITIONS = [
  {
    title: "Passive Investing",
    icon: "🧺",
    text:
      "Passive investing means trying to match the market instead of beat it. Investors usually do this through index funds or ETFs that track a benchmark like the S&P 500.",
    why:
      "Passive investing is usually lower-cost, simpler to manage, and often performs well over long periods because fees stay low.",
  },
  {
    title: "Active Investing",
    icon: "🎯",
    text:
      "Active investing means a manager or investor is trying to outperform the market by choosing specific investments, timing trades, or shifting strategy.",
    why:
      "Active investing can outperform in some cases, but it is harder to do consistently and usually comes with higher fees.",
  },
  {
    title: "Index Fund",
    icon: "📊",
    text:
      "An index fund is a passive fund built to copy the performance of a market index instead of making individual investment bets.",
    why:
      "Index funds are popular because they offer broad diversification, low fees, and a simple long-term approach.",
  },
  {
    title: "Mutual Fund",
    icon: "💼",
    text:
      "A mutual fund pools money from many investors. Some mutual funds are actively managed, while others can be passive, but many active mutual funds charge higher management fees.",
    why:
      "When comparing funds, you cannot just look at the label — you have to understand whether it is active or passive and what it costs.",
  },
  {
    title: "MER (Management Expense Ratio)",
    icon: "💸",
    text:
      "MER is the annual fee charged by a fund, expressed as a percentage of your investment.",
    why:
      "Fees seem small, but over time they reduce how much of your money stays invested and compounding for you.",
  },
];

const MYTHS = [
  {
    myth: "“Higher fees mean better performance.”",
    fact:
      "Higher fees do not guarantee better returns. In many cases, they simply reduce how much of the return the investor keeps.",
    takeaway: "Cost matters because every extra fee compounds against you.",
    icon: "⚠️",
  },
  {
    myth: "“Passive investing is lazy investing.”",
    fact:
      "Passive investing is not lazy — it is a deliberate strategy based on broad diversification, low cost, and long-term discipline.",
    takeaway: "Simple does not mean weak. Simple can be very effective.",
    icon: "🧠",
  },
  {
    myth: "“Active managers always beat the market in bad times.”",
    fact:
      "Some active managers may outperform in certain periods, but beating the market consistently over time is difficult.",
    takeaway: "The key question is not whether active can win once — it is whether it can win often enough after fees.",
    icon: "📉",
  },
  {
    myth: "“Index funds have no risk because they are diversified.”",
    fact:
      "Index funds reduce company-specific risk, but they still rise and fall with the market.",
    takeaway: "Diversified does not mean risk-free. It means risk is spread more broadly.",
    icon: "🛡️",
  },
];

const QUIZ: QA[] = [
  {
    id: 1,
    prompt: "Passive investing is mainly about:",
    options: [
      "Trying to beat the market through frequent trades",
      "Matching the market with low-cost diversified funds",
      "Avoiding all investment risk",
      "Buying only individual stocks",
    ],
    correctIndex: 1,
    explanation:
      "Passive investing usually focuses on matching market performance using broad, low-cost funds like index funds or ETFs.",
  },
  {
    id: 2,
    prompt: "Active investing usually involves:",
    options: [
      "Following a benchmark exactly",
      "Letting a manager or investor try to outperform the market",
      "Paying no management fees",
      "Holding only government bonds",
    ],
    correctIndex: 1,
    explanation:
      "Active investing tries to beat the market through fund selection, stock picking, market timing, or manager judgment.",
  },
  {
    id: 3,
    prompt: "MER matters because:",
    options: [
      "It tells you how risky the market is",
      "It guarantees better returns",
      "It reduces the amount of return you keep",
      "It only matters for short-term investing",
    ],
    correctIndex: 2,
    explanation:
      "MER is a fee charged on your investment. Higher fees reduce how much of your money stays invested and compounding.",
  },
  {
    id: 4,
    prompt: "An index fund is best described as:",
    options: [
      "A fund that tries to outperform by stock picking",
      "A fund that tracks a market benchmark",
      "A guaranteed-return investment",
      "A savings account alternative",
    ],
    correctIndex: 1,
    explanation:
      "Index funds are designed to follow a benchmark, not beat it. That is why they are considered passive investments.",
  },
  {
    id: 5,
    prompt: "Which statement is most accurate?",
    options: [
      "Higher fees automatically mean better fund quality",
      "Active investing always wins after fees",
      "Passive investing can be effective because it keeps costs low",
      "Mutual funds are always passive",
    ],
    correctIndex: 2,
    explanation:
      "Keeping costs low is one of passive investing’s biggest strengths, especially over long time horizons.",
  },
  {
    id: 6,
    prompt: "Diversification in an index fund means:",
    options: [
      "There is no chance of loss",
      "Risk is spread across many holdings",
      "The fund will always outperform active managers",
      "The investor pays no fees",
    ],
    correctIndex: 1,
    explanation:
      "Diversification helps spread risk across many companies, but it does not eliminate market risk.",
  },
];

export default function L1_Definitions({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "learn" | "myths" | "quiz" | "results">("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let correct = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / QUIZ.length) * 100);
  }, [answers]);

  const BackButton = () => (
    <button
      onClick={() => {
        if (view === "intro") onBack?.();
        else if (view === "learn") setView("intro");
        else if (view === "myths") setView("learn");
        else if (view === "quiz") setView("myths");
        else if (view === "results") setView("quiz");
      }}
      className="fixed top-4 left-6 z-50 flex items-center gap-2 px-4 py-2 text-[#4F7D96] hover:text-[#0B5E8E] font-bold transition-all hover:bg-slate-100 rounded-lg"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[1000px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            Module 5 • Lesson 1
          </p>
          <h1 className="text-[30px] font-bold text-[#0D171C] leading-[38px]">
            Passive vs Active Investing
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Learn the difference between low-cost market matching and manager-led market beating
          </p>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 p-7 rounded-3xl border border-emerald-100 mb-8 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3">
                Why this matters
              </p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
                Choosing a fund is not just about returns — it is also about cost, consistency, and strategy
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Two investments can look similar on the surface, but the fees, structure, and decision-making style behind them can lead to very different long-term outcomes.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-100 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                In this lesson, you’ll learn to spot:
              </p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🧺</span>
                  <span><strong>Passive investing</strong> — tracking the market with low-cost funds</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <span><strong>Active investing</strong> — trying to outperform through manager decisions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📊</span>
                  <span><strong>Index funds</strong> — benchmark-following passive investments</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">💸</span>
                  <span><strong>MER fees</strong> — costs that quietly reduce what you keep</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Learn the Basics</h3>
            <p className="text-sm text-[#4F7D96]">
              Understand what passive and active investing actually mean before comparing them.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Challenge the Myths</h3>
            <p className="text-sm text-[#4F7D96]">
              Separate common investing assumptions from what actually matters in practice.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Check Your Understanding</h3>
            <p className="text-sm text-[#4F7D96]">
              Complete a quick knowledge check before moving into strategy comparisons.
            </p>
          </div>
        </div>

        <button
          onClick={() => setView("learn")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Lesson 1
        </button>
      </div>
    );
  }

  if (view === "learn") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Learn</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Key Definitions</h2>
            <p className="text-slate-500 mt-1">
              Understand the language before comparing which strategy fits best.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFINITIONS.map((d) => (
              <div key={d.title} className="bg-white rounded-3xl p-7 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                    {d.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{d.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{d.text}</p>
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Why it matters
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">{d.why}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("myths")}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              Continue: Myth vs Fact
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (view === "myths") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">Misconception Check</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Myth vs Fact</h2>
            <p className="text-slate-500 mt-1">
              Fix the most common beginner misunderstandings about passive and active investing.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {MYTHS.map((m, idx) => (
              <div key={idx} className="rounded-3xl overflow-hidden border border-slate-100 shadow-md bg-white">
                <div className="p-6 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2 flex items-center gap-2">
                    <span>{m.icon}</span> Myth
                  </p>
                  <p className="font-bold text-slate-900 leading-relaxed">{m.myth}</p>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Fact</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{m.fact}</p>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Takeaway</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{m.takeaway}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setView("quiz")}
              className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
            >
              Take the Quiz
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (view === "quiz") {
    const totalAnswered = Object.keys(answers).length;

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-5">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Knowledge Check</p>
            <h2 className="text-[32px] font-bold text-slate-900 mt-2 leading-tight">
              Passive vs Active Quiz
            </h2>
            <p className="text-slate-500 mt-1 text-base">
              Answer all {QUIZ.length} questions to continue.
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(totalAnswered / QUIZ.length) * 100}%` }}
            />
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
            <div className="space-y-6">
              {QUIZ.map((q) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctIndex;

                return (
                  <div key={q.id} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                    <p className="font-black text-slate-900 mb-4 text-[18px] leading-snug">
                      {q.id}. {q.prompt}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt, idx) => {
                        const picked = selected === idx;
                        const showRight = submitted && idx === q.correctIndex;
                        const showWrong = submitted && picked && !isCorrect;

                        return (
                          <button
                            key={idx}
                            disabled={submitted}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                            className={[
                              "text-left p-4 rounded-[20px] border transition-all min-h-[76px]",
                              picked ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                              submitted ? "cursor-default" : "cursor-pointer",
                              showRight ? "border-emerald-400 bg-emerald-50" : "",
                              showWrong ? "border-rose-400 bg-rose-50" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={[
                                  "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5",
                                  picked ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-700",
                                  showRight ? "bg-emerald-500 text-white" : "",
                                  showWrong ? "bg-rose-500 text-white" : "",
                                ].join(" ")}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="text-[15px] text-slate-800 leading-relaxed font-medium">
                                {opt}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div
                        className={[
                          "mt-4 p-4 rounded-[20px] border animate-in fade-in slide-in-from-top-2 duration-300",
                          isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">{isCorrect ? "✅" : "💡"}</span>
                          <span
                            className={`font-bold uppercase tracking-wider text-xs ${
                              isCorrect ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Review"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-7 space-y-3">
              {!submitted ? (
                <button
                  onClick={() => setSubmitted(true)}
                  disabled={Object.keys(answers).length < QUIZ.length}
                  className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setView("results")}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all"
                >
                  See Results
                </button>
              )}

              {submitted && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                  }}
                  className="w-full py-3 bg-transparent border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Reset Quiz
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center">
            <span className="text-5xl">{score >= 75 ? "📈" : score >= 50 ? "🌱" : "📚"}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">Lesson 1 Complete</h2>
          <p className="text-slate-500 mb-6">
            Your score: <span className="font-black">{score}%</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Core concept</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Passive vs active structure</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <p className="text-xs font-black uppercase text-amber-700">Investor skill</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Spot fee and strategy tradeoffs</p>
            </div>
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Next step</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Compare real strategy choices</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">You’re ready to:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Explain the difference between passive and active investing clearly</li>
              <li>• Understand why costs matter when comparing funds</li>
              <li>• Recognize that simplicity, fees, and consistency all shape long-term outcomes</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl p-5 mb-6 border border-emerald-200 text-left">
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Big idea:</strong> Passive vs active is not just a label comparison.
              It is really a question of cost, confidence, complexity, and whether trying to beat the market is worth the tradeoff.
            </p>
          </div>

          <button
            onClick={() => onComplete(score)}
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
          >
            Continue to Lesson 2
          </button>
        </div>
      </section>
    </div>
  );
}