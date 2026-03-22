"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import {
  saveToDictionary,
  removeFromDictionary,
  isInDictionary,
} from "@/lib/dictionary";
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
    title: "Sector ETF",
    icon: "🧩",
    text:
      "A sector ETF holds many companies from ONE part of the economy (like Technology, Healthcare, or Energy). " +
      "It diversifies within that sector — but your performance still depends heavily on that sector’s success.",
    why:
      "If a whole sector gets hit (regulation, recession, rate changes), most holdings can drop together.",
  },
  {
    title: "Thematic Investing",
    icon: "🚀",
    text:
      "Investing based on a “theme” or trend (AI, clean energy, robotics). Themes can span multiple sectors, " +
      "and can move fast because expectations change quickly.",
    why:
      "A theme can be real AND still be a bad investment if the hype is already priced in.",
  },
  {
    title: "Cyclical Sectors",
    icon: "🌦️",
    text:
      "Cyclicals usually do better when the economy is strong and consumers/businesses spend more. " +
      "Examples: Consumer Discretionary, Industrials, parts of Technology.",
    why:
      "Cyclicals often fall harder during slowdowns because spending gets cut first.",
  },
  {
    title: "Defensive Sectors",
    icon: "🛡️",
    text:
      "Defensives tend to have steadier demand even in weak economies. " +
      "Examples: Consumer Staples, Utilities, Healthcare.",
    why:
      "They often fall less in downturns — but they can still fall.",
  },
  {
    title: "Sector Rotation",
    icon: "🔄",
    text:
      "Shifting investments across sectors based on where you think the economy is headed " +
      "(e.g., rotating toward defensives when recession risk rises).",
    why:
      "Rotation is hard to time — the lesson is to understand exposures, not to “predict perfectly.”",
  },
];

const MYTHS = [
  {
    myth: "“Sector ETFs are diversified, so they’re low-risk.”",
    fact:
      "They’re diversified inside one sector, but still concentrated. A sector shock can hit most holdings at once.",
    takeaway: "Diversified ≠ diversified across the whole economy.",
    icon: "⚠️",
  },
  {
    myth: "“If a theme is popular, it’s automatically a good investment.”",
    fact:
      "Popularity often means expectations are already priced in. If reality disappoints, returns can drop fast.",
    takeaway: "Great story ≠ great entry price.",
    icon: "🔥",
  },
  {
    myth: "“Defensive sectors always go up during recessions.”",
    fact:
      "They can fall too — they just tend to fall less on average because demand is steadier.",
    takeaway: "Defensive = more resilient, not invincible.",
    icon: "🧯",
  },
];

const QUIZ: QA[] = [
  {
    id: 1,
    prompt: "A sector ETF is best described as:",
    options: [
      "A fund that holds every sector equally",
      "A fund that holds many companies in one sector",
      "A fund that only holds government bonds",
      "A fund that guarantees fixed returns",
    ],
    correctIndex: 1,
    explanation:
      "Sector ETFs diversify across many companies, but within a single sector — so you still have concentration risk.",
  },
  {
    id: 2,
    prompt: "Which option is generally considered a cyclical sector?",
    options: ["Utilities", "Consumer Staples", "Consumer Discretionary", "Healthcare"],
    correctIndex: 2,
    explanation:
      "Consumer Discretionary tends to rise/fall with the economy because it’s based on non-essential spending.",
  },
  {
    id: 3,
    prompt: "The biggest risk with thematic investing is usually:",
    options: [
      "Themes can’t be real",
      "Themes are always scams",
      "You may overpay because hype gets priced in",
      "Themes can only be bought by professionals",
    ],
    correctIndex: 2,
    explanation:
      "A theme can be real, but returns depend on expectations vs reality. If expectations are too high, the price can drop even when the theme is true.",
  },
  {
    id: 4,
    prompt: "Defensive sectors are called defensive because:",
    options: [
      "They always rise when markets fall",
      "Their products/services are needed even in bad times",
      "They avoid all risk by holding cash",
      "They guarantee profits every year",
    ],
    correctIndex: 1,
    explanation:
      "Demand is steadier for essentials like staples, basic utilities, and many healthcare services, so these sectors often swing less.",
  },
];

export default function L1_Definitions({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const { user } = useAuth();

  const [view, setView] = useState<"intro" | "learn" | "myths" | "quiz" | "results">("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Dictionary saved state per definition title (used as ID)
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const toggleSave = async (def: typeof DEFINITIONS[0]) => {
    const key = def.title;
    if (!user || savingMap[key]) return;
    setSavingMap((prev) => ({ ...prev, [key]: true }));
    try {
      if (savedMap[key]) {
        await removeFromDictionary(user.uid, key);
        setSavedMap((prev) => ({ ...prev, [key]: false }));
      } else {
        await saveToDictionary(user.uid, {
          id: key,
          term: def.title,
          definition: def.text,
          analogy: def.why,
          category: "SECTORS",
          moduleId: "module6",
          lessonId: "L1_Definitions",
          savedAt: Date.now(),
        });
        setSavedMap((prev) => ({ ...prev, [key]: true }));
      }
    } finally {
      setSavingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const score = useMemo(() => {
    let correct = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / QUIZ.length) * 100);
  }, [answers]);

  const passedLesson = score >= 50;

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

  // INTRO
  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-sky-600 font-bold uppercase tracking-widest text-xs mb-2">Module 6 • Lesson 1</p>
          <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px]">Sector Investing & Trends</h1>
          <p className="text-[#4F7D96] mt-2">Sector ETFs, thematic investing, and cyclicals vs defensives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Learn the Language</h3>
            <p className="text-sm text-[#4F7D96]">
              Understand the key terms so you can spot what a fund is *actually* exposed to.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Avoid the Hype Traps</h3>
            <p className="text-sm text-[#4F7D96]">
              Myth vs fact cards to stop you from confusing “popular” with “profitable.”
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Knowledge Check</h3>
            <p className="text-sm text-[#4F7D96]">
              Quick quiz to unlock Lesson 2.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-2xl border border-sky-100 mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 By the end of Module 6, you’ll be able to:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Explain the difference between sector vs thematic exposure</li>
            <li>• Identify cyclicals vs defensives (and why they behave differently)</li>
            <li>• Build a 3-sector allocation and stress test it with economic news</li>
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

  // LEARN
  if (view === "learn") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-sky-600 font-bold uppercase tracking-widest text-xs">Learn</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Key Definitions</h2>
            <p className="text-slate-500 mt-1">Short, practical, and focused on “why it matters.”</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEFINITIONS.map((d) => (
              <div key={d.title} className="bg-white rounded-3xl p-7 shadow-md border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                    {d.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-slate-900">{d.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{d.text}</p>
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Why it matters</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{d.why}</p>
                    </div>
                    <button
                      onClick={() => toggleSave(d)}
                      disabled={!user || savingMap[d.title]}
                      className={[
                        "mt-4 w-full py-2.5 rounded-xl font-bold transition-all border-2 text-sm",
                        savedMap[d.title]
                          ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          : "bg-[#0B5E8E] border-[#0B5E8E] text-white hover:bg-[#094a72]",
                        (!user || savingMap[d.title]) ? "opacity-60 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      {savedMap[d.title] ? "✓ Saved to Dictionary (Click to Remove)" : "＋ Add to My Dictionary"}
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

  // MYTHS
  if (view === "myths") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">Misconception Check</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Myth vs Fact</h2>
            <p className="text-slate-500 mt-1">Fix the most common “sector & trends” mistakes.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

  // QUIZ
  if (view === "quiz") {
    const totalAnswered = Object.keys(answers).length;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Knowledge Check</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Quick Quiz</h2>
            <p className="text-slate-500 mt-1">Answer all {QUIZ.length} to continue.</p>
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
                  <div key={q.id} className="border-b border-slate-100 pb-7 last:border-b-0 last:pb-0">
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
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                            className={[
                              "text-left p-4 rounded-2xl border transition-all",
                              picked ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                              submitted ? "cursor-default" : "cursor-pointer",
                              showRight ? "border-emerald-400 bg-emerald-50" : "",
                              showWrong ? "border-rose-400 bg-rose-50" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={[
                                  "w-7 h-7 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                                  picked ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-700",
                                  showRight ? "bg-emerald-500 text-white" : "",
                                  showWrong ? "bg-rose-500 text-white" : "",
                                ].join(" ")}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="text-sm text-slate-800 leading-relaxed">{opt}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div
                        className={[
                          "mt-4 p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300",
                          isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{isCorrect ? "✅" : "💡"}</span>
                          <span className={`font-bold uppercase tracking-wider text-sm ${isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
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

  // RESULTS
  return (
    <div className="relative max-w-3xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{score >= 75 ? "🏆" : score >= 50 ? "👍" : "📚"}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">Lesson 1 Complete</h2>
          <p className="text-slate-500 mb-6">
            Your score: <span className="font-black">{score}%</span>
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">You’re ready to:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Pick sectors based on exposure (not just vibes)</li>
              <li>• Explain how the cycle changes sector winners</li>
              <li>• Spot when a theme might already be priced in</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                if (passedLesson) onComplete(score);
              }}
              disabled={!passedLesson}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                passedLesson
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              {passedLesson ? "Continue to Lesson 2" : "Score 50% to Unlock Lesson 2"}
            </button>

            {!passedLesson && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
                <p className="text-sm text-amber-800">
                  <strong>Keep going:</strong> You need at least <strong>50%</strong> on the Lesson 1 quiz before moving to Lesson 2.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}