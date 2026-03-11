"use client";

import { useMemo, useState } from "react";

type Scenario = {
  id: number;
  title: string;
  situation: string;
  emotionHint: string;
  mistakeOptions: {
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  biasOptions: {
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  responseOptions: {
    label: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  lesson: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "The Panic Seller",
    situation:
      "Maya checks her portfolio after a rough market week and sees it is down 11%. She feels sick, decides this proves the market is too dangerous, and wants to sell everything immediately.",
    emotionHint: "Fear is driving urgency.",
    mistakeOptions: [
      {
        label: "Panic selling after a short-term drop",
        isCorrect: true,
        feedback:
          "Correct — she is reacting emotionally to short-term volatility instead of following a plan.",
      },
      {
        label: "Being too diversified",
        isCorrect: false,
        feedback:
          "Diversification is not the issue here. The real problem is the emotional urge to sell after fear spikes.",
      },
      {
        label: "Taking too little risk",
        isCorrect: false,
        feedback:
          "The scenario is really about emotional overreaction, not about her portfolio being too conservative.",
      },
    ],
    biasOptions: [
      {
        label: "Loss aversion",
        isCorrect: true,
        feedback:
          "Yes — loss aversion makes the pain of losses feel especially intense, which often triggers emotional selling.",
      },
      {
        label: "Overconfidence",
        isCorrect: false,
        feedback:
          "Overconfidence is usually about excessive certainty. This case is more about fear of losses.",
      },
      {
        label: "Herd mentality",
        isCorrect: false,
        feedback:
          "Herd mentality can matter during selloffs, but the clearest driver here is fear of losing more money.",
      },
    ],
    responseOptions: [
      {
        label: "Review her long-term plan before taking action",
        isCorrect: true,
        feedback:
          "Exactly — the smarter move is to reconnect decisions to goals and process instead of reacting to one bad week.",
      },
      {
        label: "Sell everything and wait until markets feel safer",
        isCorrect: false,
        feedback:
          "That usually locks in losses and replaces a plan with emotion.",
      },
      {
        label: "Double down immediately on the riskiest positions",
        isCorrect: false,
        feedback:
          "Swinging to the opposite extreme is not discipline either. The first step is to pause and assess rationally.",
      },
    ],
    lesson:
      "Short-term pain feels urgent, but urgency is not the same as wisdom. Good investors pause before reacting.",
  },
  {
    id: 2,
    title: "The Hype Chaser",
    situation:
      "Daniel sees the same stock all over social media. Friends are talking about it, influencers are calling it a once-in-a-generation opportunity, and he feels like he is being left behind.",
    emotionHint: "Excitement and FOMO are building fast.",
    mistakeOptions: [
      {
        label: "Buying because something is popular, not because it fits a plan",
        isCorrect: true,
        feedback:
          "Correct — this is hype-chasing. Attention is replacing analysis.",
      },
      {
        label: "Holding too much cash for emergencies",
        isCorrect: false,
        feedback:
          "Emergency savings are not the issue here. The issue is being pulled in by excitement and social proof.",
      },
      {
        label: "Ignoring diversification completely",
        isCorrect: false,
        feedback:
          "That may happen later, but the first mistake here is following hype instead of using independent judgment.",
      },
    ],
    biasOptions: [
      {
        label: "Herd mentality",
        isCorrect: true,
        feedback:
          "Yes — he is being influenced by the crowd and the fear of missing out.",
      },
      {
        label: "Loss aversion",
        isCorrect: false,
        feedback:
          "Loss aversion is more about fear of losing money than chasing a popular idea.",
      },
      {
        label: "Recency bias is the only issue",
        isCorrect: false,
        feedback:
          "Recent excitement can contribute, but herd mentality is the strongest match here.",
      },
    ],
    responseOptions: [
      {
        label: "Ask whether the idea fits his goals, risk level, and evidence",
        isCorrect: true,
        feedback:
          "Exactly — smart investing starts with fit, process, and evidence, not crowd excitement.",
      },
      {
        label: "Buy immediately before it goes even higher",
        isCorrect: false,
        feedback:
          "That is the emotional response FOMO creates — not a disciplined one.",
      },
      {
        label: "Copy the amount his friends are investing",
        isCorrect: false,
        feedback:
          "Other people’s confidence is not a substitute for personal reasoning.",
      },
    ],
    lesson:
      "Popularity can feel like proof, but markets often punish people who confuse attention with quality.",
  },
  {
    id: 3,
    title: "The Overconfident Trader",
    situation:
      "After making two profitable trades in a row, Sofia starts believing she has a talent for timing the market. She begins trading more often and taking bigger positions with less research.",
    emotionHint: "Confidence is turning into certainty.",
    mistakeOptions: [
      {
        label: "Mistaking a short winning streak for skill",
        isCorrect: true,
        feedback:
          "Correct — a couple of wins can create false confidence and lead to bigger mistakes.",
      },
      {
        label: "Being too patient with her investments",
        isCorrect: false,
        feedback:
          "Patience is not the issue. The issue is increasing risk because recent success feels like proof of special skill.",
      },
      {
        label: "Avoiding all risk entirely",
        isCorrect: false,
        feedback:
          "She is doing the opposite — she is taking more risk because she feels unusually confident.",
      },
    ],
    biasOptions: [
      {
        label: "Overconfidence",
        isCorrect: true,
        feedback:
          "Yes — overconfidence often grows after short-term success and can lead to excessive trading or underestimating risk.",
      },
      {
        label: "Loss aversion",
        isCorrect: false,
        feedback:
          "Loss aversion is about fearing losses too strongly. This case is about inflated confidence.",
      },
      {
        label: "Herd mentality",
        isCorrect: false,
        feedback:
          "The crowd is not really the issue here. Her own confidence is.",
      },
    ],
    responseOptions: [
      {
        label: "Reduce impulsive trading and return to a consistent decision process",
        isCorrect: true,
        feedback:
          "Exactly — good investing relies on discipline, not on assuming a recent streak will continue.",
      },
      {
        label: "Increase position sizes even more while momentum lasts",
        isCorrect: false,
        feedback:
          "That usually magnifies mistakes if the confidence turns out to be unjustified.",
      },
      {
        label: "Switch all holdings into a single best idea",
        isCorrect: false,
        feedback:
          "That is concentration driven by confidence, not a balanced response.",
      },
    ],
    lesson:
      "Feeling skilled is not the same as being skilled. Process matters more than a short streak of wins.",
  },
  {
    id: 4,
    title: "The Refusal to Let Go",
    situation:
      "Ethan bought a stock that is now down 35%. He says he refuses to sell because then the loss would become ‘real,’ so he keeps holding it even though his original reason for buying no longer makes sense.",
    emotionHint: "Pride and pain are keeping him stuck.",
    mistakeOptions: [
      {
        label: "Holding an investment just to avoid admitting a mistake",
        isCorrect: true,
        feedback:
          "Correct — he is letting emotion and ego override the actual investment case.",
      },
      {
        label: "Rebalancing too often",
        isCorrect: false,
        feedback:
          "Rebalancing is not what’s happening here. He is avoiding a rational reassessment.",
      },
      {
        label: "Being too diversified",
        isCorrect: false,
        feedback:
          "Diversification is unrelated to the core issue here.",
      },
    ],
    biasOptions: [
      {
        label: "Loss aversion",
        isCorrect: true,
        feedback:
          "Yes — he wants to avoid realizing the pain of the loss, even if holding no longer makes sense.",
      },
      {
        label: "Overconfidence",
        isCorrect: false,
        feedback:
          "Overconfidence may have contributed earlier, but the dominant bias now is unwillingness to realize a loss.",
      },
      {
        label: "Herd mentality",
        isCorrect: false,
        feedback:
          "The crowd is not the main issue here. This is about emotional attachment to avoiding loss.",
      },
    ],
    responseOptions: [
      {
        label: "Re-evaluate the investment based on today’s facts, not the purchase price",
        isCorrect: true,
        feedback:
          "Exactly — the smarter question is whether it still deserves a place in the portfolio today.",
      },
      {
        label: "Hold forever because selling confirms failure",
        isCorrect: false,
        feedback:
          "That makes the decision about ego, not evidence.",
      },
      {
        label: "Buy much more immediately to prove the original decision was right",
        isCorrect: false,
        feedback:
          "That can make an already weak decision even riskier.",
      },
    ],
    lesson:
      "A purchase price is history, not a reason. Strong investors reassess based on current evidence.",
  },
  {
    id: 5,
    title: "The Strategy Switcher",
    situation:
      "Leila starts with index funds, then reads about stock picking, then tries momentum trading, then shifts back again after hearing a podcast. Every few weeks, she changes direction.",
    emotionHint: "Noise is replacing discipline.",
    mistakeOptions: [
      {
        label: "Constantly switching strategies without giving one process time to work",
        isCorrect: true,
        feedback:
          "Correct — she is reacting to every new opinion instead of following a consistent framework.",
      },
      {
        label: "Being too committed to one long-term plan",
        isCorrect: false,
        feedback:
          "The opposite is happening — she lacks consistency.",
      },
      {
        label: "Ignoring market information completely",
        isCorrect: false,
        feedback:
          "She is not ignoring information. She is actually reacting to too much of it.",
      },
    ],
    biasOptions: [
      {
        label: "Recency and noise chasing",
        isCorrect: true,
        feedback:
          "Yes — she is overreacting to the newest idea instead of applying stable principles.",
      },
      {
        label: "Loss aversion only",
        isCorrect: false,
        feedback:
          "Fear may play a role, but the bigger issue is instability and chasing whatever sounds convincing most recently.",
      },
      {
        label: "Herd mentality only",
        isCorrect: false,
        feedback:
          "Crowd influence can contribute, but the strongest issue is reacting to every fresh input without discipline.",
      },
    ],
    responseOptions: [
      {
        label: "Create a clear investing framework and judge ideas against it",
        isCorrect: true,
        feedback:
          "Exactly — a framework helps separate useful information from distracting noise.",
      },
      {
        label: "Keep changing often so she never misses the latest strategy",
        isCorrect: false,
        feedback:
          "That creates randomness, not skill.",
      },
      {
        label: "Avoid learning new things entirely",
        isCorrect: false,
        feedback:
          "Learning is good — the key is not letting every new idea completely reset your plan.",
      },
    ],
    lesson:
      "Good investors stay open-minded, but they do not rebuild their strategy every time a new opinion appears.",
  },
];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function L2_Interactive({
  onComplete,
  onBack,
}: {
  onComplete: (score: number) => void;
  onBack?: () => void;
}) {
  const [view, setView] = useState<"intro" | "scenario" | "results">("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const [mistakeChoice, setMistakeChoice] = useState<number | null>(null);
  const [biasChoice, setBiasChoice] = useState<number | null>(null);
  const [responseChoice, setResponseChoice] = useState<number | null>(null);

  const [showFeedback, setShowFeedback] = useState(false);

  const [history, setHistory] = useState<
    {
      scenarioId: number;
      title: string;
      score: number;
    }[]
  >([]);

  const currentScenario = SCENARIOS[scenarioIndex];

  const resetSelections = () => {
    setMistakeChoice(null);
    setBiasChoice(null);
    setResponseChoice(null);
    setShowFeedback(false);
  };

  const handleBack = () => {
    if (view === "intro") {
      onBack?.();
    } else if (view === "scenario") {
      if (!showFeedback) {
        if (scenarioIndex === 0) {
          setView("intro");
        } else {
          setScenarioIndex((prev) => prev - 1);
          resetSelections();
        }
      }
    } else if (view === "results") {
      setView("scenario");
      setScenarioIndex(SCENARIOS.length - 1);
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

  const canSubmit =
    mistakeChoice !== null && biasChoice !== null && responseChoice !== null;

  const currentScore = useMemo(() => {
    let score = 0;
    if (
      mistakeChoice !== null &&
      currentScenario.mistakeOptions[mistakeChoice]?.isCorrect
    )
      score += 34;
    if (
      biasChoice !== null &&
      currentScenario.biasOptions[biasChoice]?.isCorrect
    )
      score += 33;
    if (
      responseChoice !== null &&
      currentScenario.responseOptions[responseChoice]?.isCorrect
    )
      score += 33;
    return score;
  }, [mistakeChoice, biasChoice, responseChoice, currentScenario]);

  const finalScore = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.round(
      history.reduce((sum, item) => sum + item.score, 0) / history.length
    );
  }, [history]);

  if (view === "intro") {
    return (
      <div className="relative flex flex-col items-center justify-center max-w-[980px] mx-auto px-6 pt-16 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-full text-center mb-8">
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-2">
            Lesson 2: Practice
          </p>
          <h1 className="text-[30px] font-bold text-[#0D171C] leading-[38px]">
            Avoid Common Mistakes
          </h1>
          <p className="text-[#4F7D96] mt-2">
            Read investor scenarios, spot the bias, and choose the smarter move
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Spot the Mistake</h3>
            <p className="text-sm text-[#4F7D96]">
              Figure out what the investor is doing wrong before the mistake becomes expensive.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Name the Bias</h3>
            <p className="text-sm text-[#4F7D96]">
              Connect each mistake to the emotional or psychological bias driving it.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Choose the Better Move</h3>
            <p className="text-sm text-[#4F7D96]">
              Practice how a disciplined investor would respond instead.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-sky-50 p-6 rounded-2xl border border-emerald-100 mb-8 w-full max-w-3xl">
          <h3 className="font-bold text-slate-900 mb-2">🎯 In this challenge, you’ll practice:</h3>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>• Catching panic, hype, and overconfidence in action</li>
            <li>• Distinguishing emotional reactions from disciplined investing</li>
            <li>• Building stronger decision habits through repeated scenarios</li>
          </ul>
        </div>

        <button
          onClick={() => setView("scenario")}
          className="px-10 py-4 bg-[#0B5E8E] text-white rounded-full font-bold hover:bg-[#094a72] transition-all"
        >
          Start Mistake Detector
        </button>
      </div>
    );
  }

  if (view === "scenario") {
    const progressPct =
      ((scenarioIndex + (showFeedback ? 1 : 0)) / SCENARIOS.length) * 100;

    return (
      <div className="relative max-w-6xl mx-auto px-4 pb-12">
        <BackButton />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pt-16">
          <header className="text-center mb-6">
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">
              Mistake Detector
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Scenario {scenarioIndex + 1} of {SCENARIOS.length}
            </h2>
            <p className="text-slate-500 mt-1">
              Diagnose the mistake, identify the bias, and choose the smarter response
            </p>
          </header>

          <div className="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-600 mb-2">
                      {currentScenario.title}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900">
                      Investor Scenario
                    </h3>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
                    🧩
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mb-4">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {currentScenario.situation}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Emotion hint:</strong> {currentScenario.emotionHint}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 space-y-8">
                <div>
                  <p className="font-black text-slate-900 mb-3 text-lg">
                    1) What is the main mistake here?
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentScenario.mistakeOptions.map((option, idx) => {
                      const selected = mistakeChoice === idx;
                      const showCorrect = showFeedback && option.isCorrect;
                      const showWrong = showFeedback && selected && !option.isCorrect;

                      return (
                        <button
                          key={idx}
                          onClick={() => setMistakeChoice(idx)}
                          disabled={showFeedback}
                          className={[
                            "text-left p-5 rounded-2xl border transition-all",
                            selected
                              ? "border-[#0B5E8E] bg-sky-50"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                            showCorrect ? "border-emerald-400 bg-emerald-50" : "",
                            showWrong ? "border-rose-400 bg-rose-50" : "",
                          ].join(" ")}
                        >
                          <p className="font-bold text-slate-900">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-black text-slate-900 mb-3 text-lg">
                    2) Which bias is most likely driving it?
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentScenario.biasOptions.map((option, idx) => {
                      const selected = biasChoice === idx;
                      const showCorrect = showFeedback && option.isCorrect;
                      const showWrong = showFeedback && selected && !option.isCorrect;

                      return (
                        <button
                          key={idx}
                          onClick={() => setBiasChoice(idx)}
                          disabled={showFeedback}
                          className={[
                            "text-left p-5 rounded-2xl border transition-all",
                            selected
                              ? "border-[#0B5E8E] bg-sky-50"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                            showCorrect ? "border-emerald-400 bg-emerald-50" : "",
                            showWrong ? "border-rose-400 bg-rose-50" : "",
                          ].join(" ")}
                        >
                          <p className="font-bold text-slate-900">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="font-black text-slate-900 mb-3 text-lg">
                    3) What is the smarter response?
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentScenario.responseOptions.map((option, idx) => {
                      const selected = responseChoice === idx;
                      const showCorrect = showFeedback && option.isCorrect;
                      const showWrong = showFeedback && selected && !option.isCorrect;

                      return (
                        <button
                          key={idx}
                          onClick={() => setResponseChoice(idx)}
                          disabled={showFeedback}
                          className={[
                            "text-left p-5 rounded-2xl border transition-all",
                            selected
                              ? "border-[#0B5E8E] bg-sky-50"
                              : "border-slate-200 bg-white hover:bg-slate-50",
                            showCorrect ? "border-emerald-400 bg-emerald-50" : "",
                            showWrong ? "border-rose-400 bg-rose-50" : "",
                          ].join(" ")}
                        >
                          <p className="font-bold text-slate-900">{option.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!showFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    disabled={!canSubmit}
                    className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all disabled:bg-slate-200 disabled:cursor-not-allowed"
                  >
                    Grade This Scenario
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const updatedHistory = [
                        ...history.filter((item) => item.scenarioId !== currentScenario.id),
                        {
                          scenarioId: currentScenario.id,
                          title: currentScenario.title,
                          score: currentScore,
                        },
                      ];
                      setHistory(updatedHistory);

                      if (scenarioIndex < SCENARIOS.length - 1) {
                        setScenarioIndex((prev) => prev + 1);
                        resetSelections();
                      } else {
                        setView("results");
                      }
                    }}
                    className="w-full py-4 bg-[#0B5E8E] text-white rounded-xl font-bold shadow-md hover:bg-[#094a72] transition-all"
                  >
                    {scenarioIndex < SCENARIOS.length - 1
                      ? "Next Scenario"
                      : "See Final Results"}
                  </button>
                )}

                {showFeedback && (
                  <div className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl p-6 border border-emerald-200 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h4 className="font-black text-slate-900 text-lg">Coaching Feedback</h4>
                      <div className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-black text-slate-900">
                        Score: {currentScore}/100
                      </div>
                    </div>

                    <div className="space-y-4">
                      {mistakeChoice !== null && (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200">
                          <p className="font-black text-slate-900 mb-1">Mistake review</p>
                          <p className="text-sm text-slate-700">
                            {currentScenario.mistakeOptions[mistakeChoice].feedback}
                          </p>
                        </div>
                      )}

                      {biasChoice !== null && (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200">
                          <p className="font-black text-slate-900 mb-1">Bias review</p>
                          <p className="text-sm text-slate-700">
                            {currentScenario.biasOptions[biasChoice].feedback}
                          </p>
                        </div>
                      )}

                      {responseChoice !== null && (
                        <div className="bg-white rounded-2xl p-4 border border-slate-200">
                          <p className="font-black text-slate-900 mb-1">Response review</p>
                          <p className="text-sm text-slate-700">
                            {currentScenario.responseOptions[responseChoice].feedback}
                          </p>
                        </div>
                      )}

                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <strong>Big lesson:</strong> {currentScenario.lesson}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md h-fit sticky top-20">
              <h3 className="font-black text-slate-900">Practice HUD</h3>
              <p className="text-sm text-slate-500 mt-1">
                Track how well you catch behavioral mistakes
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
                  <p className="text-xs font-black uppercase text-sky-700">Completed</p>
                  <p className="text-xl font-black text-sky-900">{history.length}/{SCENARIOS.length}</p>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-xs font-black uppercase text-emerald-700">Average</p>
                  <p className="text-xl font-black text-emerald-900">
                    {history.length > 0
                      ? Math.round(
                          history.reduce((sum, item) => sum + item.score, 0) /
                            history.length
                        )
                      : 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Scoring breakdown
                </p>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Mistake spotted</span>
                    <span className="font-black">34 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bias identified</span>
                    <span className="font-black">33 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Smarter response</span>
                    <span className="font-black">33 pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Scenario log
                </p>
                <div className="space-y-2">
                  {SCENARIOS.map((scenario) => {
                    const found = history.find((item) => item.scenarioId === scenario.id);
                    return (
                      <div
                        key={scenario.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <p className="text-xs font-bold text-slate-700">{scenario.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-500">
                            {found ? "Completed" : "Not completed"}
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {found ? `${found.score}/100` : "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    );
  }

  const badge =
    finalScore >= 80 ? "🧠" : finalScore >= 60 ? "👍" : "🌱";

  const headline =
    finalScore >= 80
      ? "Strong Bias Detector!"
      : finalScore >= 60
      ? "Good Progress — Keep Sharpening"
      : "You’re Building the Habit";

  const summary =
    finalScore >= 80
      ? "You did a strong job spotting emotional mistakes, identifying the bias behind them, and choosing more disciplined responses."
      : finalScore >= 60
      ? "You’re seeing the patterns well. The next step is becoming faster and more consistent at catching emotional decision traps."
      : "This practice matters because great investing is often less about finding brilliance and more about avoiding preventable mistakes.";

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <section className="animate-in zoom-in duration-500 max-w-xl mx-auto text-center pt-12">
        <div className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-4xl">{badge}</span>
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2">{headline}</h2>
          <p className="text-slate-500 mb-6">Module 10 • Lesson 2 Complete</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
              <p className="text-xs font-black uppercase text-sky-700">Scenarios</p>
              <p className="text-xl font-black text-sky-900">{history.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <p className="text-xs font-black uppercase text-emerald-700">Final score</p>
              <p className="text-xl font-black text-emerald-900">{finalScore}</p>
            </div>
            <div className="bg-violet-50 rounded-2xl p-4 border border-violet-200">
              <p className="text-xs font-black uppercase text-violet-700">Mindset</p>
              <p className="text-xl font-black text-violet-900">{badge}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-2">What you practiced</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Recognizing panic, hype, ego, and noise in investor decisions</li>
              <li>• Connecting mistakes to the bias underneath them</li>
              <li>• Replacing emotional reactions with smarter investing responses</li>
            </ul>
          </div>

          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Coach summary:</strong> {summary}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => onComplete(finalScore)}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all"
            >
              Continue to Lesson 3
            </button>
            <button
              onClick={() => {
                setView("intro");
                setScenarioIndex(0);
                setMistakeChoice(null);
                setBiasChoice(null);
                setResponseChoice(null);
                setShowFeedback(false);
                setHistory([]);
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