"use client";

import { useMemo, useState } from "react";

type RuleOption = {
  label: string;
  isCorrect: boolean;
  feedback: string;
};

type MindsetScenario = {
  id: number;
  title: string;
  situation: string;
  category: "Fear" | "Discipline" | "Hype" | "Patience" | "Process";
  options: RuleOption[];
  principle: string;
};

const SCENARIOS: MindsetScenario[] = [
  {
    id: 1,
    title: "Market Drop Panic",
    category: "Fear",
    situation:
      "Your portfolio falls 9% in a week. You feel nervous and want to make a move immediately so things do not get worse.",
    options: [
      {
        label: "Sell first, think later, and buy back when the market feels better.",
        isCorrect: false,
        feedback:
          "This turns fear into action too quickly. Emotional urgency often locks in losses.",
      },
      {
        label: "Pause, review your plan, and ask whether anything important changed besides price.",
        isCorrect: true,
        feedback:
          "Exactly — disciplined investors separate price movement from actual changes in long-term fundamentals.",
      },
      {
        label: "Check social media to see what everyone else is doing before deciding.",
        isCorrect: false,
        feedback:
          "Crowd behavior may amplify fear rather than improve reasoning.",
      },
    ],
    principle:
      "When markets get emotional, slow down. A pause is often the first intelligent decision.",
  },
  {
    id: 2,
    title: "The Hot Stock Everyone Loves",
    category: "Hype",
    situation:
      "A stock is trending everywhere. Friends are buying it, creators are hyping it, and you feel like you might miss a huge opportunity.",
    options: [
      {
        label: "Buy now before it runs even more — opportunities like this do not wait.",
        isCorrect: false,
        feedback:
          "That is FOMO talking. Urgency created by hype is not the same as a good opportunity.",
      },
      {
        label: "Ask whether the investment fits your goals, risk level, and evidence before acting.",
        isCorrect: true,
        feedback:
          "Correct — a strong investor mindset filters excitement through process.",
      },
      {
        label: "Match the amount your most confident friend invested.",
        isCorrect: false,
        feedback:
          "Other people’s confidence is not a substitute for your own decision framework.",
      },
    ],
    principle:
      "Attention is not evidence. Popular ideas still need rational filters.",
  },
  {
    id: 3,
    title: "After a Winning Streak",
    category: "Process",
    situation:
      "You made several good investment calls in a row. Now you feel much more confident and are tempted to increase risk because you think you are reading the market better than usual.",
    options: [
      {
        label: "Increase your position sizes because success proves your edge is real.",
        isCorrect: false,
        feedback:
          "Recent wins can create false certainty. Confidence grows faster than proof.",
      },
      {
        label: "Stick to your position sizing rules and treat success the same way you treat mistakes: with discipline.",
        isCorrect: true,
        feedback:
          "Exactly — good process stays stable whether you feel brilliant or frustrated.",
      },
      {
        label: "Switch fully into active trading while momentum is on your side.",
        isCorrect: false,
        feedback:
          "That is overconfidence disguised as strategy.",
      },
    ],
    principle:
      "A strong process protects you from both panic and ego.",
  },
  {
    id: 4,
    title: "The Investment That Is Down Big",
    category: "Discipline",
    situation:
      "One of your holdings is down a lot. You keep telling yourself you will sell later, but really you just do not want to admit it was a bad decision.",
    options: [
      {
        label: "Keep holding because selling would make the mistake feel real.",
        isCorrect: false,
        feedback:
          "That makes the decision about emotion and pride, not future expected value.",
      },
      {
        label: "Re-evaluate the investment using today’s facts, not your original purchase price.",
        isCorrect: true,
        feedback:
          "Correct — good investors reassess based on current evidence, not attachment to past decisions.",
      },
      {
        label: "Buy much more immediately so you can recover faster if it rebounds.",
        isCorrect: false,
        feedback:
          "Doubling down without new evidence can turn one mistake into a larger one.",
      },
    ],
    principle:
      "Your past decision should not control your current judgment.",
  },
  {
    id: 5,
    title: "Too Many Opinions",
    category: "Patience",
    situation:
      "Every week you hear a new investing opinion: buy more, buy less, switch strategy, try something new. You feel pulled in different directions.",
    options: [
      {
        label: "Keep adjusting your strategy so you never fall behind the latest idea.",
        isCorrect: false,
        feedback:
          "Constant switching creates noise, not mastery.",
      },
      {
        label: "Build a simple personal framework and judge new information against it before making changes.",
        isCorrect: true,
        feedback:
          "Exactly — learning matters, but strong investors do not rebuild their strategy every week.",
      },
      {
        label: "Ignore all financial information forever.",
        isCorrect: false,
        feedback:
          "The answer is not zero information. It is structured decision-making.",
      },
    ],
    principle:
      "Patience is not doing nothing — it is refusing to let noise control your plan.",
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
  const [view, setView] = useState<"intro" | "lab" | "results" | "complete">("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<
    { scenarioId: number; correct: boolean; selected: number }[]
  >([]);

  const currentScenario = SCENARIOS[scenarioIndex];

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "lab") {
      if (!showFeedback) {
        if (scenarioIndex === 0) setView("intro");
        else {
          setScenarioIndex((prev) => prev - 1);
          setSelectedIdx(null);
          setShowFeedback(false);
        }
      }
    } else if (view === "results") setView("lab");
    else if (view === "complete") setView("results");
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

  const progressPct = ((scenarioIndex + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 100;

  const mindsetScore = useMemo(() => {
    if (answers.length === 0) return 0;
    const correct = answers.filter((a) => a.correct).length;
    return Math.round((correct / SCENARIOS.length) * 100);
  }, [answers]);

  const categoryStrengths = useMemo(() => {
    const results: Record<string, number> = {};
    SCENARIOS.forEach((scenario) => {
      const found = answers.find((a) => a.scenarioId === scenario.id);
      if (!results[scenario.category]) results[scenario.category] = 0;
      if (found?.correct) results[scenario.category] += 1;
    });
    return results;
  }, [answers]);

  const submitScenario = () => {
    if (selectedIdx == null) return;
    setShowFeedback(true);

    const isCorrect = currentScenario.options[selectedIdx].isCorrect;

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.scenarioId !== currentScenario.id);
      return [
        ...filtered,
        {
          scenarioId: currentScenario.id,
          correct: isCorrect,
          selected: selectedIdx,
        },
      ];
    });
  };

  const nextScenario = () => {
    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex((prev) => prev + 1);
      setSelectedIdx(null);
      setShowFeedback(false);
    } else {
      setView("results");
    }
  };

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[980px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-violet-600 font-bold uppercase tracking-widest text-xs mb-2">
            Lesson 3: Master
          </p>
          <h1 className="text-[30px] font-bold text-[#0D171C] leading-[38px]">
            Think Like a Long-Term Investor
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Build a stronger decision framework for fear, hype, discipline, and patience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧭</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Decision Framework</h3>
            <p className="text-sm text-[#4F7D96]">
              Practice how disciplined investors think before they act.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Emotion vs Process</h3>
            <p className="text-sm text-[#4F7D96]">
              Learn to separate urgency, excitement, and ego from rational decision-making.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Long-Term Thinking</h3>
            <p className="text-sm text-[#4F7D96]">
              Finish the module by choosing the mindset habits that support consistency.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-50 to-sky-50 p-6 rounded-2xl border border-violet-100 mb-8 w-full max-w-3xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 In this final lesson, you’ll prove that you can:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Stay rational when markets feel emotional</li>
            <li>• Choose process over impulse</li>
            <li>• Think like a calmer, more disciplined long-term investor</li>
          </ul>
        </div>

        <button
          onClick={() => setView("lab")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Decision Lab
        </button>
      </div>
    );
  }

  if (view === "lab") {
    const selectedOption = selectedIdx !== null ? currentScenario.options[selectedIdx] : null;

    return (
      <div className="relative max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-violet-600 font-bold uppercase tracking-widest text-xs">
              Decision Lab
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </h2>
            <p className="text-slate-500 mt-1">
              Pick the response that reflects a stronger investor mindset
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
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                    {currentScenario.category}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-3">
                    {currentScenario.title}
                  </h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">
                  🧠
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mb-6">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {currentScenario.situation}
                </p>
              </div>

              <p className="font-black text-slate-900 mb-4 text-lg">
                What is the strongest response?
              </p>

              <div className="space-y-3">
                {currentScenario.options.map((option, idx) => {
                  const selected = selectedIdx === idx;
                  const showCorrect = showFeedback && option.isCorrect;
                  const showWrong = showFeedback && selected && !option.isCorrect;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      disabled={showFeedback}
                      className={[
                        "w-full text-left p-5 rounded-2xl border transition-all",
                        selected
                          ? "border-[#0B5E8E] bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50",
                        showCorrect ? "border-emerald-400 bg-emerald-50" : "",
                        showWrong ? "border-rose-400 bg-rose-50" : "",
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5",
                            selected ? "bg-[#0B5E8E] text-white" : "bg-slate-100 text-slate-600",
                            showCorrect ? "bg-emerald-500 text-white" : "",
                            showWrong ? "bg-rose-500 text-white" : "",
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
                  onClick={submitScenario}
                  disabled={selectedIdx == null}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Check My Thinking
                </button>
              ) : (
                <button
                  onClick={nextScenario}
                  className="w-full mt-6 py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                >
                  {scenarioIndex < SCENARIOS.length - 1 ? "Next Scenario" : "See My Mindset Results"}
                </button>
              )}

              {showFeedback && selectedOption && (
                <div
                  className={`mt-6 p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    selectedOption.isCorrect
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{selectedOption.isCorrect ? "✅" : "💡"}</span>
                    <span
                      className={`font-black uppercase tracking-wider text-sm ${
                        selectedOption.isCorrect ? "text-emerald-700" : "text-amber-800"
                      }`}
                    >
                      {selectedOption.isCorrect ? "Strong choice" : "Coaching point"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">
                    {selectedOption.feedback}
                  </p>

                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                      Core principle
                    </p>
                    <p className="text-sm text-slate-700">{currentScenario.principle}</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Mindset Tracker</h3>
              <p className="text-sm text-slate-500 mt-1">
                Your progress through the final decision lab
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
                  <p className="text-xs font-black uppercase text-violet-700">Completed</p>
                  <p className="text-xl font-black text-violet-900">{answers.length}/{SCENARIOS.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Correct</p>
                  <p className="text-xl font-black text-emerald-900">
                    {answers.filter((a) => a.correct).length}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Scenario categories
                </p>
                <div className="space-y-2 text-sm text-slate-700">
                  {SCENARIOS.map((scenario) => {
                    const found = answers.find((a) => a.scenarioId === scenario.id);
                    return (
                      <div key={scenario.id} className="flex items-center justify-between">
                        <span>{scenario.category}</span>
                        <span className="font-black">
                          {found ? (found.correct ? "✓" : "—") : "•"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Best mindset reminder
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Great investors do not remove emotion — they build systems that stop emotion from taking control.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  if (view === "results") {
    const badge =
      mindsetScore >= 80 ? "🏆" : mindsetScore >= 60 ? "👍" : "🌱";

    const headline =
      mindsetScore >= 80
        ? "Strong Long-Term Mindset"
        : mindsetScore >= 60
        ? "Good Foundation — Keep Refining"
        : "You’re Building Better Habits";

    const summary =
      mindsetScore >= 80
        ? "You consistently chose disciplined, process-driven responses over emotional ones."
        : mindsetScore >= 60
        ? "You’re seeing the right patterns. The next step is making those responses feel automatic under pressure."
        : "This is exactly why mindset practice matters — good investing often means avoiding the wrong move at the wrong moment.";

    return (
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in zoom-in duration-500 max-w-3xl mx-auto text-center pt-12">
          <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center">
              <span className="text-5xl">{badge}</span>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
            <p className="text-slate-500 mb-6">Module 10 • Lesson 3 Results</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                <p className="text-xs font-black uppercase text-sky-700">Mindset score</p>
                <p className="text-xl font-black text-sky-900">{mindsetScore}%</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                <p className="text-xs font-black uppercase text-emerald-700">Correct choices</p>
                <p className="text-xl font-black text-emerald-900">
                  {answers.filter((a) => a.correct).length}/{SCENARIOS.length}
                </p>
              </div>
              <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
                <p className="text-xs font-black uppercase text-violet-700">Badge</p>
                <p className="text-xl font-black text-violet-900">{badge}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
              <h3 className="font-bold text-slate-900 mb-3">Your strongest mindset themes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                {Object.entries(categoryStrengths).map(([category, count]) => (
                  <div key={category} className="bg-white rounded-xl p-4 border border-slate-200">
                    <p className="font-bold text-slate-900">{category}</p>
                    <p className="text-slate-600 mt-1">
                      {count > 0
                        ? `You handled ${count} ${category.toLowerCase()}-based decision${count > 1 ? "s" : ""} well.`
                        : `This is an area to keep practicing.`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Coach summary:</strong> {summary}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setView("complete")}
                className="w-full py-5 bg-violet-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-violet-700 transition-all"
              >
                Finish Lesson 3
              </button>
              <button
                onClick={() => {
                  setView("intro");
                  setScenarioIndex(0);
                  setSelectedIdx(null);
                  setShowFeedback(false);
                  setAnswers([]);
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

  const badge =
    mindsetScore >= 80 ? "🧠" : mindsetScore >= 60 ? "🌱" : "📚";

  const headline =
    mindsetScore >= 80
      ? "Investor Mindset Built!"
      : mindsetScore >= 60
      ? "Mindset Foundation Built"
      : "Keep Strengthening Your Process";

  const summary =
    mindsetScore >= 80
      ? "You finished the module with a strong understanding of how disciplined investors respond to fear, hype, losses, and uncertainty."
      : mindsetScore >= 60
      ? "You built a solid decision-making foundation. The next step is making these responses feel natural under real pressure."
      : "You now have the building blocks of a stronger investor mindset — and that framework becomes more powerful with practice.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
            <span className="text-5xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Module 10 • Lesson 3 Complete</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Decision lab</p>
              <p className="text-xl font-black text-sky-900">{mindsetScore}%</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Correct</p>
              <p className="text-xl font-black text-emerald-900">
                {answers.filter((a) => a.correct).length}/{SCENARIOS.length}
              </p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-xs font-black uppercase text-violet-700">Mindset badge</p>
              <p className="text-xl font-black text-violet-900">{badge}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-2">What you proved</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• You can distinguish emotional reactions from disciplined investing choices</li>
              <li>• You can recognize when fear, hype, ego, or noise are shaping a decision</li>
              <li>• You can apply a stronger long-term mindset instead of reacting impulsively</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Final takeaway:</strong> {summary}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(mindsetScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Complete Module 10
            </button>
            <button
              onClick={() => {
                setView("intro");
                setScenarioIndex(0);
                setSelectedIdx(null);
                setShowFeedback(false);
                setAnswers([]);
              }}
              className="w-full py-4 bg-transparent border-2 border-slate-200 text-slate-600 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Review Again
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}