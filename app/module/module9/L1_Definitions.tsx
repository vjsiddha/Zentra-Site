"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { saveToDictionary, removeFromDictionary } from "@/lib/dictionary";

type QA = {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const DEFINITIONS = [
  {
    id: 1,
    title: "Inflation",
    icon: "📈",
    text:
      "Inflation measures how quickly prices increase across the economy over time.",
    why:
      "High inflation reduces purchasing power and often leads central banks to raise interest rates.",
  },
  {
    id: 2,
    title: "Interest Rates",
    icon: "🏦",
    text:
      "Interest rates represent the cost of borrowing money and are controlled by central banks.",
    why:
      "Higher rates increase borrowing costs and can slow economic growth.",
  },
  {
    id: 3,
    title: "GDP",
    icon: "🌍",
    text:
      "Gross Domestic Product measures the total value of goods and services produced in an economy.",
    why:
      "GDP growth signals a strong economy and expanding business activity.",
  },
  {
    id: 4,
    title: "Unemployment",
    icon: "👥",
    text:
      "The unemployment rate measures the percentage of people looking for work but unable to find jobs.",
    why:
      "Rising unemployment can indicate economic slowdown and lower consumer spending.",
  },
  {
    id: 5,
    title: "Economic Indicators",
    icon: "📊",
    text:
      "Economic indicators are statistics like inflation, GDP, and unemployment used to understand economic health.",
    why:
      "Markets react strongly when these indicators differ from expectations.",
  },
];

const MYTHS = [
  {
    myth: "\u201cInflation is always bad for stocks.\u201d",
    fact:
      "Moderate inflation often happens during strong economic growth.",
    takeaway: "Context matters more than the number alone.",
    icon: "🔥",
  },
  {
    myth: "\u201cGDP growth always means markets will rise.\u201d",
    fact:
      "Markets react to expectations, not just the data itself.",
    takeaway: "Surprises move markets more than predictions.",
    icon: "📊",
  },
  {
    myth: "\u201cInterest rates only affect banks.\u201d",
    fact:
      "Interest rates influence mortgages, business loans, and consumer borrowing.",
    takeaway: "Rate changes affect the entire economy.",
    icon: "💡",
  },
];

const QUIZ: QA[] = [
  {
    id: 1,
    prompt: "Inflation measures:",
    options: [
      "Population growth",
      "Price increases across the economy",
      "Corporate profits",
      "Government spending",
    ],
    correctIndex: 1,
    explanation:
      "Inflation measures how quickly prices rise and purchasing power changes.",
  },
  {
    id: 2,
    prompt: "GDP represents:",
    options: [
      "Total economic output",
      "Total stock market value",
      "Government tax revenue",
      "Average income",
    ],
    correctIndex: 0,
    explanation:
      "GDP measures the total value of goods and services produced in an economy.",
  },
  {
    id: 3,
    prompt: "When interest rates rise:",
    options: [
      "Borrowing becomes cheaper",
      "Borrowing becomes more expensive",
      "Consumers automatically spend more",
      "Stock prices always rise",
    ],
    correctIndex: 1,
    explanation:
      "Higher interest rates increase borrowing costs and slow spending.",
  },
  {
    id: 4,
    prompt: "Why do investors follow unemployment data?",
    options: [
      "It predicts stock prices exactly",
      "It reflects labor market strength",
      "It determines inflation",
      "It controls GDP",
    ],
    correctIndex: 1,
    explanation:
      "Employment data reflects economic strength and consumer demand.",
  },
  {
    id: 5,
    prompt: "Economic indicators matter to investors because:",
    options: [
      "They reveal economic trends",
      "They guarantee returns",
      "They determine company profits",
      "They control stock prices",
    ],
    correctIndex: 0,
    explanation:
      "Economic indicators help investors understand where the economy may be heading.",
  },
  {
    id: 6,
    prompt: "If inflation rises faster than expected, markets often:",
    options: [
      "React quickly to the news",
      "Ignore the data",
      "Stop trading",
      "Automatically rise",
    ],
    correctIndex: 0,
    explanation:
      "Markets react strongly when economic data surprises investors.",
  },
];

export default function L1_Definitions({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<
    "intro" | "learn" | "myths" | "quiz" | "results"
  >("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const { user } = useAuth();
  const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const score = useMemo(() => {
    let correct = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / QUIZ.length) * 100);
  }, [answers]);

  const toggleSave = async (termId: number, term: string, definition: string) => {
    if (!user || saving) return;
    setSaving(true);
    try {
      if (savedMap[termId]) {
        await removeFromDictionary(user.uid, String(termId));
        setSavedMap((prev) => ({ ...prev, [termId]: false }));
      } else {
        await saveToDictionary(user.uid, {
          id: String(termId),
          term,
          definition,
          category: "ECONOMICS",
          moduleId: "module9",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [termId]: true }));
      }
    } finally {
      setSaving(false);
    }
  };

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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path
          d="M19 12H5M12 19l-7-7 7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back
    </button>
  );

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">
            Module 9 • Lesson 1
          </p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">
            Economic Indicators & Market Signals
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Inflation, interest rates, GDP, and unemployment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Understand Economic Signals
            </h3>
            <p className="text-sm text-[#4F7D96]">
              Learn how investors interpret economic data like inflation, GDP,
              and employment reports.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Avoid Misinterpretations
            </h3>
            <p className="text-sm text-[#4F7D96]">
              Understand common myths about economic indicators and market
              reactions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Connect Data to Markets
            </h3>
            <p className="text-sm text-[#4F7D96]">
              See how economic reports influence market trends and investor
              expectations.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-2xl border border-sky-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">
            🎯 By the end of Module 9, you'll be able to:
          </h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Understand the major economic indicators investors track</li>
            <li>• Explain how inflation and interest rates influence markets</li>
            <li>
              • Interpret economic news and connect it to market reactions
            </li>
          </ul>
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
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">
              Learn
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Key Definitions
            </h2>
            <p className="text-slate-500 mt-1">
              Short, practical, and focused on "why it matters."
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFINITIONS.map((d) => (
              <div
                key={d.title}
                className="bg-white rounded-3xl p-7 shadow-md border border-slate-100"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                    {d.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900">
                      {d.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {d.text}
                    </p>
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Why it matters
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {d.why}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSave(d.id, d.title, d.text)}
                      disabled={!user || saving}
                      className={`mt-4 w-full py-3 rounded-xl font-bold border-2 transition-all ${
                        savedMap[d.id]
                          ? "bg-white border-slate-200 text-slate-700"
                          : "bg-[#0B5E8E] border-[#0B5E8E] text-white hover:bg-[#094a72]"
                      }`}
                    >
                      {savedMap[d.id]
                        ? "✓ Saved to Dictionary (Click to Remove)"
                        : "＋ Add to My Dictionary"}
                    </button>
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
            <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">
              Misconception Check
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Myth vs Fact
            </h2>
            <p className="text-slate-500 mt-1">
              Fix the most common "economic signals" mistakes.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {MYTHS.map((m, idx) => (
              <div
                key={idx}
                className="rounded-3xl overflow-hidden border border-slate-100 shadow-md bg-white"
              >
                <div className="p-6 bg-gradient-to-r from-rose-50 to-amber-50 border-b border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-rose-700 mb-2 flex items-center gap-2">
                    <span>{m.icon}</span> Myth
                  </p>
                  <p className="font-bold text-slate-900 leading-relaxed">
                    {m.myth}
                  </p>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">
                    Fact
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {m.fact}
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Takeaway
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {m.takeaway}
                    </p>
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
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">
              Knowledge Check
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Quick Quiz
            </h2>
            <p className="text-slate-500 mt-1">
              Answer all {QUIZ.length} to continue.
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(totalAnswered / QUIZ.length) * 100}%` }}
            />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
            <div className="space-y-7">
              {QUIZ.map((q) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="border-b border-slate-100 pb-7 last:border-b-0 last:pb-0"
                  >
                    <p className="font-black text-slate-900 mb-4">
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
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                            }
                            className={[
                              "text-left p-4 rounded-2xl border transition-all",
                              picked
                                ? "border-[#0B5E8E] bg-sky-50"
                                : "border-slate-200 bg-white hover:bg-slate-50",
                              submitted ? "cursor-default" : "cursor-pointer",
                              showRight
                                ? "border-emerald-400 bg-emerald-50"
                                : "",
                              showWrong
                                ? "border-rose-400 bg-rose-50"
                                : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={[
                                  "w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                                  picked
                                    ? "bg-[#0B5E8E] text-white"
                                    : "bg-slate-100 text-slate-700",
                                  showRight
                                    ? "bg-emerald-500 text-white"
                                    : "",
                                  showWrong ? "bg-rose-500 text-white" : "",
                                ].join(" ")}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="text-sm text-slate-800 leading-relaxed">
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
                          "mt-4 p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300",
                          isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-amber-50 border-amber-200",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {isCorrect ? "✅" : "💡"}
                          </span>
                          <span
                            className={`font-bold uppercase tracking-wider text-sm ${
                              isCorrect ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Review"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 space-y-3">
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
    <div className="relative max-w-3xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">
              {score >= 75 ? "🏆" : score >= 50 ? "👍" : "📚"}
            </span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">
            Lesson 1 Complete
          </h2>
          <p className="text-slate-500 mb-6">
            Your score: <span className="font-black">{score}%</span>
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">You're ready to:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Interpret major economic indicators</li>
              <li>
                • Understand how inflation and interest rates affect markets
              </li>
              <li>• Connect economic news to market behavior</li>
            </ul>
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