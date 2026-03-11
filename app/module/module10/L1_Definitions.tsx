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
    title: "Behavioral Bias",
    icon: "🧠",
    text:
      "A behavioral bias is a mental shortcut or emotional tendency that can lead investors to make irrational decisions.",
    why:
      "Even smart investors can make bad choices when fear, greed, overconfidence, or habits take over.",
  },
  {
    id: 2,
    title: "Loss Aversion",
    icon: "📉",
    text:
      "Loss aversion means people usually feel the pain of losing money more strongly than the pleasure of gaining the same amount.",
    why:
      "This can cause investors to panic sell during downturns or hold onto bad investments just to avoid admitting a loss.",
  },
  {
    id: 3,
    title: "Overconfidence",
    icon: "🎯",
    text:
      "Overconfidence happens when investors believe they know more than they actually do or think they can consistently beat the market.",
    why:
      "It often leads to excessive trading, larger mistakes, and taking risks without enough evidence.",
  },
  {
    id: 4,
    title: "Herd Mentality",
    icon: "🐑",
    text:
      "Herd mentality is the tendency to follow what everyone else is doing instead of thinking independently.",
    why:
      "This can drive people to buy at market highs out of hype or sell at lows out of fear.",
  },
  {
    id: 5,
    title: "Long-Term Mindset",
    icon: "🌱",
    text:
      "A long-term mindset means making decisions based on goals, discipline, and patience rather than short-term market noise.",
    why:
      "Investors with a strong long-term mindset are usually better at staying calm, consistent, and rational.",
  },
];

const MYTHS = [
  {
    myth: "\u201cGood investors never feel fear.\u201d",
    fact:
      "Even experienced investors feel fear. The difference is that strong investors follow a process instead of reacting emotionally.",
    takeaway: "The goal is not zero emotion — it's emotional control.",
    icon: "⚠️",
  },
  {
    myth: "\u201cIf everyone is buying it, it must be a good investment.\u201d",
    fact:
      "Popularity can reflect hype, not value. By the time everyone is excited, expectations may already be priced in.",
    takeaway: "Crowds can be loud, but they are not always right.",
    icon: "🔥",
  },
  {
    myth: "\u201cSelling after a drop protects you from losses.\u201d",
    fact:
      "Selling after panic often locks in losses instead of giving investments time to recover.",
    takeaway: "A drop feels urgent, but urgency is not always wisdom.",
    icon: "🧯",
  },
  {
    myth: "\u201cConfidence means your investment idea is probably correct.\u201d",
    fact:
      "Confidence and correctness are not the same thing. People can feel extremely certain and still be wrong.",
    takeaway: "Strong process beats strong opinions.",
    icon: "🎲",
  },
];

const QUIZ: QA[] = [
  {
    id: 1,
    prompt: "Loss aversion means investors tend to:",
    options: [
      "Enjoy gains more than they fear losses",
      "Feel losses more strongly than equal gains",
      "Ignore portfolio declines",
      "Prefer risky assets at all times",
    ],
    correctIndex: 1,
    explanation:
      "Loss aversion means the pain of losing is usually felt more strongly than the pleasure of gaining the same amount.",
  },
  {
    id: 2,
    prompt: "Herd mentality is best described as:",
    options: [
      "Making decisions based only on financial statements",
      "Following the crowd instead of independent reasoning",
      "Investing in agriculture companies",
      "Avoiding all market news",
    ],
    correctIndex: 1,
    explanation:
      "Herd mentality happens when investors copy what everyone else is doing instead of thinking critically for themselves.",
  },
  {
    id: 3,
    prompt: "Overconfidence can lead investors to:",
    options: [
      "Trade too often and underestimate risk",
      "Avoid all investment decisions",
      "Always diversify correctly",
      "Prefer only government bonds",
    ],
    correctIndex: 0,
    explanation:
      "Overconfidence often makes investors believe they can outsmart the market, which can lead to too much trading and poor risk decisions.",
  },
  {
    id: 4,
    prompt: "A long-term investor mindset usually focuses on:",
    options: [
      "Daily market swings and short-term hype",
      "Patience, goals, and disciplined decisions",
      "Copying whatever is trending online",
      "Changing strategy every week",
    ],
    correctIndex: 1,
    explanation:
      "A long-term mindset is built on patience, consistency, and decisions tied to goals rather than short-term noise.",
  },
  {
    id: 5,
    prompt: "Why is panic selling often harmful?",
    options: [
      "It guarantees a lower tax bill",
      "It locks in losses after emotional decisions",
      "It always improves diversification",
      "It increases long-term returns automatically",
    ],
    correctIndex: 1,
    explanation:
      "Panic selling often turns temporary declines into permanent losses because the investor reacts emotionally instead of strategically.",
  },
  {
    id: 6,
    prompt: "Which statement best reflects a strong investor mindset?",
    options: [
      "If I feel certain, I'm probably right",
      "The crowd usually knows best",
      "A good process matters more than emotional reactions",
      "The best strategy changes every week",
    ],
    correctIndex: 2,
    explanation:
      "A strong investor mindset relies on discipline, process, and consistency — not emotional certainty or crowd behavior.",
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
          moduleId: "module10",
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
          <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">Module 10 • Lesson 1</p>
          <h1 className="text-[30px] font-bold text-[#0D171C] leading-[38px]">Behavioral Biases</h1>
          <p className="text-[#4F7D96] mt-2">
            Learn how emotions, habits, and mental shortcuts can quietly damage investment decisions
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 p-7 rounded-3xl border border-pink-100 mb-8 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-pink-600 mb-3">
                Why this matters
              </p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-3">
                Investing is not just numbers — it is also psychology
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                Many bad investment decisions do not happen because people cannot do math. They happen because fear,
                greed, overconfidence, and social pressure distort judgment at the worst possible moments.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                In this lesson, you'll learn to spot:
              </p>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📉</span>
                  <span><strong>Loss aversion</strong> — when fear of losing drives decisions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <span><strong>Overconfidence</strong> — when certainty exceeds actual evidence</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🐑</span>
                  <span><strong>Herd mentality</strong> — when crowd behavior replaces reasoning</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🌱</span>
                  <span><strong>Long-term discipline</strong> — the mindset that helps investors stay rational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Learn the Biases</h3>
            <p className="text-sm text-[#4F7D96]">
              Understand the common psychological traps that affect investor decisions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Challenge the Myths</h3>
            <p className="text-sm text-[#4F7D96]">
              Separate smart investing from emotional stories and common misconceptions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Test Your Thinking</h3>
            <p className="text-sm text-[#4F7D96]">
              Complete a knowledge check before moving into practice scenarios.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8 w-full max-w-3xl shadow-sm">
          <h3 className="font-bold text-slate-900 mb-3">🎯 By the end of Module 10, you'll be able to:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Recognize the emotional biases that lead investors into avoidable mistakes</li>
            <li>• Explain why confidence, hype, and panic are unreliable decision tools</li>
            <li>• Build the mindset needed to think more rationally and act more consistently</li>
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
            <p className="text-pink-600 font-bold uppercase tracking-widest text-xs">Learn</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Key Definitions</h2>
            <p className="text-slate-500 mt-1">Short, practical explanations of the biases that shape investor behavior.</p>
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
            <p className="text-amber-600 font-bold uppercase tracking-widest text-xs">Misconception Check</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Myth vs Fact</h2>
            <p className="text-slate-500 mt-1">Spot the difference between emotional investing stories and rational thinking.</p>
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
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">Knowledge Check</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Behavioral Bias Quiz</h2>
            <p className="text-slate-500 mt-1">Answer all {QUIZ.length} questions to continue.</p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(totalAnswered / QUIZ.length) * 100}%` }}
            />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
            <div className="space-y-8">
              {QUIZ.map((q) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correctIndex;

                return (
                  <div key={q.id} className="border-b border-slate-100 pb-8 last:border-b-0 last:pb-0">
                    <p className="font-black text-slate-900 mb-5 text-[28px] leading-tight sm:text-[20px]">
                      {q.id}. {q.prompt}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              "text-left p-5 rounded-[24px] border transition-all min-h-[92px]",
                              picked ? "border-[#0B5E8E] bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50",
                              submitted ? "cursor-default" : "cursor-pointer",
                              showRight ? "border-emerald-400 bg-emerald-50" : "",
                              showWrong ? "border-rose-400 bg-rose-50" : "",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={[
                                  "w-10 h-10 rounded-full flex items-center justify-center font-black text-base flex-shrink-0 mt-0.5",
                                  picked ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-700",
                                  showRight ? "bg-emerald-500 text-white" : "",
                                  showWrong ? "bg-rose-500 text-white" : "",
                                ].join(" ")}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <p className="text-[17px] text-slate-800 leading-relaxed font-medium">{opt}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <div
                        className={[
                          "mt-5 p-5 rounded-[24px] border animate-in fade-in slide-in-from-top-2 duration-300",
                          isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{isCorrect ? "✅" : "💡"}</span>
                          <span
                            className={`font-bold uppercase tracking-wider text-sm ${
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
    <div className="relative max-w-4xl mx-auto px-4 pb-12">
      <BackButton />

      <section className="animate-in zoom-in duration-500 pt-16">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <span className="text-5xl">{score >= 75 ? "🧠" : score >= 50 ? "🌱" : "📚"}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">Lesson 1 Complete</h2>
          <p className="text-slate-500 mb-6">
            Your score: <span className="font-black">{score}%</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-left">
            <div className="bg-pink-50 rounded-2xl p-4 border border-pink-200">
              <p className="text-xs font-black uppercase text-pink-700">Mindset skill</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Spot emotional traps</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <p className="text-xs font-black uppercase text-amber-700">Investor growth</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Recognize irrational patterns</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Next step</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Apply better decision habits</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-3">You're ready to:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Identify the biases that cause investors to buy high, sell low, or overreact</li>
              <li>• Explain why emotional certainty is not the same as good reasoning</li>
              <li>• Use a calmer, more disciplined mindset in future investing decisions</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-5 mb-6 border border-pink-200 text-left">
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Big idea:</strong> Advanced investing is not just about knowing more facts.
              It is also about learning how to think clearly when markets become emotional.
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