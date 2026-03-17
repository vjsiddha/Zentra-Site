"use client";

import { useMemo, useState } from "react";

type PathType = "passive" | "active" | "blend";

type PathQuestion = {
  id: number;
  title: string;
  prompt: string;
  options: {
    label: string;
    path: PathType;
    feedback: string;
  }[];
};

const QUESTIONS: PathQuestion[] = [
  {
    id: 1,
    title: "How involved do you want to be?",
    prompt:
      "What sounds most like you when it comes to managing investments over time?",
    options: [
      {
        label: "I want something simple that I do not have to constantly monitor.",
        path: "passive",
        feedback:
          "That leans passive — simplicity and consistency are major strengths of passive investing.",
      },
      {
        label: "I like researching and want a manager or strategy that tries to beat the market.",
        path: "active",
        feedback:
          "That leans active — you are comfortable with more judgment, more complexity, and higher expectations.",
      },
      {
        label: "I want a simple core, but I still want some room for specific ideas.",
        path: "blend",
        feedback:
          "That leans blended — a core-satellite style can give you both discipline and flexibility.",
      },
    ],
  },
  {
    id: 2,
    title: "How much do fees matter to you?",
    prompt:
      "Which statement best reflects your view on fund fees and long-term costs?",
    options: [
      {
        label: "Keeping costs low is one of my biggest priorities.",
        path: "passive",
        feedback:
          "That strongly supports passive-first thinking, since low fees are one of its biggest long-term advantages.",
      },
      {
        label: "I’m willing to pay higher fees if I believe the strategy can justify them.",
        path: "active",
        feedback:
          "That leans active — but it also means you must be thoughtful about whether outperformance is realistic after fees.",
      },
      {
        label: "I want most of my money in low-cost funds, but I might pay more for a smaller portion.",
        path: "blend",
        feedback:
          "That is a blended mindset — protect most of the portfolio from high fees, but allow a limited active sleeve.",
      },
    ],
  },
  {
    id: 3,
    title: "How do you think about market beating?",
    prompt:
      "When you think about returns, which statement sounds most like your approach?",
    options: [
      {
        label: "Matching the market consistently is good enough for me.",
        path: "passive",
        feedback:
          "That is classic passive thinking — broad exposure and consistency over chasing outperformance.",
      },
      {
        label: "I believe there are real opportunities to outperform with the right decisions.",
        path: "active",
        feedback:
          "That aligns with active investing — but it also means accepting more uncertainty and needing more evidence.",
      },
      {
        label: "I’m okay matching the market with most of my money, but I want a small part for conviction ideas.",
        path: "blend",
        feedback:
          "That is a core-satellite style — passive for the base, active for selective opportunities.",
      },
    ],
  },
  {
    id: 4,
    title: "What fits your lifestyle best?",
    prompt:
      "Which investing setup is most realistic for your actual time, habits, and consistency?",
    options: [
      {
        label: "I want an approach I can stick with even when life gets busy.",
        path: "passive",
        feedback:
          "That fits passive-first very well, because low-maintenance strategies are often easier to sustain.",
      },
      {
        label: "I’m willing to spend real time reviewing funds, managers, or opportunities.",
        path: "active",
        feedback:
          "That supports active investing, where ongoing evaluation matters much more.",
      },
      {
        label: "I want the base of my portfolio to run quietly, with only a smaller portion needing attention.",
        path: "blend",
        feedback:
          "That is a strong case for a blended path — stable core, more flexible side allocation.",
      },
    ],
  },
  {
    id: 5,
    title: "How do you want to handle uncertainty?",
    prompt:
      "When markets are unpredictable, what investing style feels most comfortable to you?",
    options: [
      {
        label: "I’d rather trust diversification and stay the course.",
        path: "passive",
        feedback:
          "That leans passive — broad diversification helps reduce the pressure to constantly react.",
      },
      {
        label: "I’d rather trust skill, judgment, or selective positioning.",
        path: "active",
        feedback:
          "That leans active — but it depends on whether that skill is actually reliable enough to justify the tradeoff.",
      },
      {
        label: "I want diversification overall, but also some flexibility to act on selective views.",
        path: "blend",
        feedback:
          "That points toward a blended path — structure plus optionality.",
      },
    ],
  },
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function L3_Applying({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "quiz" | "reflection" | "complete">("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<
    { questionId: number; path: PathType; selected: number }[]
  >([]);

  const [conviction, setConviction] = useState<"low" | "medium" | "high" | null>(null);
  const [feeTolerance, setFeeTolerance] = useState<"low" | "medium" | "high" | null>(null);
  const [effortLevel, setEffortLevel] = useState<"low" | "medium" | "high" | null>(null);
  const [showReflectionFeedback, setShowReflectionFeedback] = useState(false);

  const currentQ = QUESTIONS[qIndex];

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "quiz") {
      if (!showFeedback) {
        if (qIndex === 0) setView("intro");
        else {
          setQIndex((prev) => prev - 1);
          setSelectedIdx(null);
          setShowFeedback(false);
        }
      }
    } else if (view === "reflection") {
      setView("quiz");
    } else if (view === "complete") {
      setView("reflection");
    }
  };

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

  const progressPct =
    ((qIndex + (showFeedback ? 1 : 0)) / QUESTIONS.length) * 100;

  const pathCounts = useMemo(() => {
    const counts = { passive: 0, active: 0, blend: 0 };
    answers.forEach((a) => {
      counts[a.path] += 1;
    });
    return counts;
  }, [answers]);

  const dominantPath = useMemo<PathType>(() => {
    const { passive, active, blend } = pathCounts;
    if (passive >= active && passive >= blend) return "passive";
    if (active >= passive && active >= blend) return "active";
    return "blend";
  }, [pathCounts]);

  const quizScore = useMemo(() => {
    const total = answers.length;
    if (total === 0) return 0;
    const maxCount = Math.max(pathCounts.passive, pathCounts.active, pathCounts.blend);
    return Math.round((maxCount / QUESTIONS.length) * 100);
  }, [answers, pathCounts]);

  const reflectionScore = useMemo(() => {
    let score = 0;

    if (dominantPath === "passive") {
      if (conviction === "low" || conviction === "medium") score += 35;
      if (feeTolerance === "low") score += 35;
      if (effortLevel === "low" || effortLevel === "medium") score += 30;
    } else if (dominantPath === "active") {
      if (conviction === "high") score += 35;
      if (feeTolerance === "medium" || feeTolerance === "high") score += 35;
      if (effortLevel === "high") score += 30;
    } else {
      if (conviction === "medium") score += 35;
      if (feeTolerance === "low" || feeTolerance === "medium") score += 35;
      if (effortLevel === "medium") score += 30;
    }

    return clamp(score, 0, 100);
  }, [dominantPath, conviction, feeTolerance, effortLevel]);

  const finalLessonScore = useMemo(() => {
    return Math.round(0.65 * quizScore + 0.35 * reflectionScore);
  }, [quizScore, reflectionScore]);

  const currentSelectedOption =
    selectedIdx !== null ? currentQ.options[selectedIdx] : null;

  const submitAnswer = () => {
    if (selectedIdx == null) return;
    setShowFeedback(true);

    const chosen = currentQ.options[selectedIdx];

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQ.id);
      return [
        ...filtered,
        {
          questionId: currentQ.id,
          path: chosen.path,
          selected: selectedIdx,
        },
      ];
    });
  };

  const nextQuestion = () => {
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex((prev) => prev + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
    } else {
      setView("reflection");
    }
  };

  const resultTitle =
    dominantPath === "passive"
      ? "Passive-First Investor"
      : dominantPath === "active"
      ? "Active-With-Purpose Investor"
      : "Core-Satellite Investor";

  const resultSummary =
    dominantPath === "passive"
      ? "You value simplicity, low fees, diversification, and a strategy that is easy to stick with consistently."
      : dominantPath === "active"
      ? "You are more willing to accept complexity, research, and higher fees in exchange for the chance to outperform."
      : "You want a strong low-cost foundation, but you also like leaving room for selective active decisions.";

  const coachAdvice =
    dominantPath === "passive"
      ? "Your biggest advantage is discipline. Passive investing works best when you stay consistent and let low costs compound in your favor."
      : dominantPath === "active"
      ? "Your biggest challenge is proving that skill and conviction are strong enough to justify higher fees and more complexity."
      : "Your biggest advantage is balance. A blended strategy works best when the passive core stays dominant and the active sleeve stays intentional.";

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[980px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">
            Lesson 3: Master
          </p>
          <h1 className="text-[30px] font-bold text-[#0D171C] leading-[38px]">
            Choose Your Path
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Decide which investing approach fits your goals, habits, and tradeoffs best
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧭</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Know Your Style</h3>
            <p className="text-sm text-[#4F7D96]">
              Answer strategy questions to see whether passive, active, or blended investing fits you best.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Weigh the Tradeoffs</h3>
            <p className="text-sm text-[#4F7D96]">
              Think through simplicity vs complexity, low fees vs higher fees, and consistency vs conviction.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Build Your Strategy</h3>
            <p className="text-sm text-[#4F7D96]">
              Finish the module with a clearer idea of what kind of investor path actually suits you.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-sky-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-3xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 In this final lesson, you’ll decide:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Whether you prioritize simplicity, conviction, or a mix of both</li>
            <li>• How much fees and effort matter in your investing approach</li>
            <li>• Which long-term path fits your mindset best</li>
          </ul>
        </div>

        <button
          onClick={() => setView("quiz")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Lesson 3
        </button>
      </div>
    );
  }

  if (view === "quiz") {
    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs">
              Strategy Path Quiz
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Question {qIndex + 1} of {QUESTIONS.length}
            </h2>
            <p className="text-slate-500 mt-1">
              Choose the answer that feels most like your real investing style
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-violet-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
              <div className="mb-5">
                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                  {currentQ.title}
                </div>
                <p className="mt-4 text-lg font-black text-slate-900">{currentQ.prompt}</p>
              </div>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const selected = selectedIdx === idx;
                  const saved = answers.find((a) => a.questionId === currentQ.id)?.selected === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      disabled={showFeedback}
                      className={[
                        "w-full text-left p-5 rounded-2xl border transition-all",
                        selected || saved
                          ? "border-[#0B5E8E] bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0",
                            selected || saved
                              ? "bg-[#0B5E8E] text-white"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <p className="font-medium text-slate-800 leading-relaxed">{option.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {!showFeedback ? (
                <button
                  onClick={submitAnswer}
                  disabled={selectedIdx == null}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Check My Choice
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                >
                  {qIndex < QUESTIONS.length - 1 ? "Next Question" : "Continue to Reflection"}
                </button>
              )}

              {showFeedback && currentSelectedOption && (
                <div className="mt-6 p-5 rounded-2xl border bg-violet-50 border-violet-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧠</span>
                    <span className="font-black uppercase tracking-wider text-sm text-violet-700">
                      Strategy signal
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {currentSelectedOption.feedback}
                  </p>
                </div>
              )}
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Path Tracker</h3>
              <p className="text-sm text-slate-500 mt-1">
                See which investing style your answers are leaning toward
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Passive-first</p>
                  <p className="text-xl font-black text-emerald-900">{pathCounts.passive}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-xs font-black uppercase text-amber-700">Active</p>
                  <p className="text-xl font-black text-amber-900">{pathCounts.active}</p>
                </div>
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                  <p className="text-xs font-black uppercase text-sky-700">Blend both</p>
                  <p className="text-xl font-black text-sky-900">{pathCounts.blend}</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Best reminder
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  The right investing strategy is the one you understand, can stick with, and can justify over time.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  if (view === "reflection") {
    const lockEnabled = conviction && feeTolerance && effortLevel;

    return (
      <div className="relative max-w-4xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-8">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">
              Reflection
            </p>
            <h2 className="text-2xl font-bold text-slate-900">Pressure-Test Your Fit</h2>
            <p className="text-slate-500 mt-1">
              Answer three final questions to see whether your preferences match your likely strategy path
            </p>
          </header>

          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Your current path
                  </p>
                  <p className="text-lg font-black text-slate-900 mt-2">
                    Best fit so far: <span className="text-[#0B5E8E]">{resultTitle}</span>
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{resultSummary}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200">
                  <p className="text-xs font-black text-slate-500 uppercase">Quiz score</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{quizScore}%</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-black text-slate-900 mb-3">
                1) How strong is your conviction that you or a manager can make better-than-market decisions consistently?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: "low", label: "Low conviction", desc: "I’d rather trust diversification than prediction." },
                  { key: "medium", label: "Moderate conviction", desc: "I see some opportunities, but not enough to bet everything on it." },
                  { key: "high", label: "High conviction", desc: "I strongly believe skill or selection can add value." },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setConviction(item.key as "low" | "medium" | "high")}
                    className={[
                      "text-left p-5 rounded-2xl border transition-all",
                      conviction === item.key
                        ? "border-[#0B5E8E] bg-sky-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-black text-slate-900 mb-3">
                2) How much ongoing fund cost are you realistically comfortable paying?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: "low", label: "Low fee tolerance", desc: "I care a lot about keeping fees minimal." },
                  { key: "medium", label: "Moderate fee tolerance", desc: "I’ll pay more if the case is reasonable." },
                  { key: "high", label: "High fee tolerance", desc: "I’m okay paying much more for a strategy I believe in." },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFeeTolerance(item.key as "low" | "medium" | "high")}
                    className={[
                      "text-left p-5 rounded-2xl border transition-all",
                      feeTolerance === item.key
                        ? "border-[#0B5E8E] bg-sky-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-black text-slate-900 mb-3">
                3) How much effort are you realistically willing to put into monitoring and evaluating investments?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { key: "low", label: "Low effort", desc: "I want something mostly hands-off." },
                  { key: "medium", label: "Moderate effort", desc: "I can review some things, but I don’t want full complexity." },
                  { key: "high", label: "High effort", desc: "I’m willing to monitor managers, ideas, and performance closely." },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setEffortLevel(item.key as "low" | "medium" | "high")}
                    className={[
                      "text-left p-5 rounded-2xl border transition-all",
                      effortLevel === item.key
                        ? "border-[#0B5E8E] bg-sky-50"
                        : "border-slate-200 bg-white hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <p className="font-bold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {!showReflectionFeedback ? (
              <button
                onClick={() => setShowReflectionFeedback(true)}
                disabled={!lockEnabled}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                Grade My Fit
              </button>
            ) : (
              <button
                onClick={() => setView("complete")}
                className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
              >
                Finish Lesson 3
              </button>
            )}

            {showReflectionFeedback && (
              <div className="bg-gradient-to-r from-violet-50 to-sky-50 rounded-2xl p-5 border border-violet-200 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="font-black text-slate-900 mb-2">Your Strategy Fit</h4>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase text-slate-500">Path</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{resultTitle}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase text-slate-500">Reflection</p>
                    <p className="text-xl font-black text-slate-900">{reflectionScore}/100</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase text-slate-500">Final fit</p>
                    <p className="text-xl font-black text-slate-900">{finalLessonScore}%</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Coach note:</strong> {coachAdvice}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  const badge =
    dominantPath === "passive"
      ? "🧺"
      : dominantPath === "active"
      ? "🎯"
      : "⚖️";

  const headline =
    dominantPath === "passive"
      ? "Passive-First Path Unlocked!"
      : dominantPath === "active"
      ? "Active-With-Purpose Path Unlocked!"
      : "Core-Satellite Path Unlocked!";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center">
            <span className="text-5xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Module 5 • Lesson 3 Complete</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Quiz</p>
              <p className="text-xl font-black text-sky-900">{quizScore}%</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Reflection</p>
              <p className="text-xl font-black text-emerald-900">{reflectionScore}</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-xs font-black uppercase text-violet-700">Final fit</p>
              <p className="text-xl font-black text-violet-900">{finalLessonScore}%</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-2">Your investing path</h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              <strong>{resultTitle}:</strong> {resultSummary}
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Your preferences around fees, effort, and conviction shaped this result</li>
              <li>• There is no universally “best” path — only a best fit for the investor</li>
              <li>• The strongest strategy is one you can understand and stick with consistently</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Final takeaway:</strong> Module 5 is not really about choosing a trendy label. It is about understanding the tradeoff between simplicity, cost, complexity, and conviction — and then choosing the path that matches how you actually invest.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalLessonScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Complete Module 5
            </button>
            <button
              onClick={() => {
                setView("intro");
                setQIndex(0);
                setSelectedIdx(null);
                setShowFeedback(false);
                setAnswers([]);
                setConviction(null);
                setFeeTolerance(null);
                setEffortLevel(null);
                setShowReflectionFeedback(false);
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}