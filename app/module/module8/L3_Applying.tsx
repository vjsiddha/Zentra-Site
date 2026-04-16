"use client";

import { useState } from "react";

/* =========================
   ESG EVENTS (DETAILED)
========================= */

const EVENTS = [
  {
    id: 1,
    title: "🌊 Oil Spill Disaster",
    tag: "Environmental",
    description:
      "A major oil company causes an environmental disaster, damaging marine ecosystems and facing public backlash.",
    prompt: "What is the most responsible investing decision?",
    options: [
      {
        id: "a",
        text: "Shift investments into renewable energy companies",
        impact: +15,
        explanation:
          "Strong ESG decision. Environmental disasters increase demand for sustainable alternatives.",
      },
      {
        id: "b",
        text: "Stay invested for short-term profits",
        impact: -10,
        explanation:
          "Ignoring environmental risks may lead to long-term losses and reputational damage.",
      },
    ],
  },
  {
    id: 2,
    title: "👷 Labor Rights Scandal",
    tag: "Social",
    description:
      "A global clothing brand is exposed for poor working conditions in factories.",
    prompt: "What would a responsible investor do?",
    options: [
      {
        id: "a",
        text: "Reinvest in companies with strong labor practices",
        impact: +12,
        explanation:
          "Social responsibility improves long-term brand trust and sustainability.",
      },
      {
        id: "b",
        text: "Ignore the issue if profits are strong",
        impact: -8,
        explanation:
          "Short-term profits can hide long-term social and legal risks.",
      },
    ],
  },
  {
    id: 3,
    title: "📜 Governance Scandal",
    tag: "Governance",
    description:
      "A CEO is involved in fraud, raising concerns about leadership integrity.",
    prompt: "What is the best action?",
    options: [
      {
        id: "a",
        text: "Invest in companies with strong governance",
        impact: +14,
        explanation:
          "Good governance reduces risk and builds long-term stability.",
      },
      {
        id: "b",
        text: "Stay invested if stock price is rising",
        impact: -9,
        explanation:
          "Governance failures often lead to sudden crashes.",
      },
    ],
  },
  {
    id: 4,
    title: "🌱 Greenwashing Exposed",
    tag: "Ethics",
    description:
      "A company falsely markets itself as eco-friendly but makes no real changes.",
    prompt: "How should you respond?",
    options: [
      {
        id: "a",
        text: "Sell and invest in verified ESG companies",
        impact: +13,
        explanation:
          "Avoiding greenwashing protects your investments and supports real impact.",
      },
      {
        id: "b",
        text: "Ignore it and stay invested",
        impact: -11,
        explanation:
          "Greenwashing damages credibility and long-term value.",
      },
    ],
  },
];

/* =========================
   COMPONENT
========================= */

export default function L3_Applying({ onComplete, onBack }) {
  const [view, setView] = useState("intro");
  const [eventIndex, setEventIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const currentEvent = EVENTS[eventIndex];

  /* =========================
     HANDLERS
  ========================= */

  const handleSubmit = () => {
    const choice = currentEvent.options.find((o) => o.id === selected);
    if (!choice) return;

    setScore(score + choice.impact);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (eventIndex < EVENTS.length - 1) {
      setEventIndex(eventIndex + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setView("reflection");
    }
  };

  const handleBack = () => {
    if (view === "intro") onBack?.();
    else if (view === "simulation" && eventIndex === 0) setView("intro");
    else if (view === "simulation") {
      setEventIndex(eventIndex - 1);
      setSubmitted(false);
      setSelected(null);
    }
  };

  const BackButton = () => (
    <button
      onClick={handleBack}
      className="fixed top-4 left-6 px-4 py-2 font-bold text-blue-600"
    >
      ← Back
    </button>
  );

  /* =========================
     INTRO
  ========================= */

  if (view === "intro") {
    return (
      <div className="text-center p-10">
        <BackButton />
        <h1 className="text-3xl font-bold">Apply Responsible Investing</h1>
        <p className="mt-4 text-gray-600">
          Make real-world ESG decisions and see how they impact your portfolio.
        </p>

        <button
          onClick={() => setView("simulation")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded"
        >
          Start Simulation
        </button>
      </div>
    );
  }

  /* =========================
     SIMULATION
  ========================= */

  if (view === "simulation") {
    return (
      <div className="p-10 max-w-3xl mx-auto">
        <BackButton />

        <h2 className="text-xl font-bold">{currentEvent.title}</h2>
        <p className="text-sm text-gray-500">{currentEvent.tag}</p>
        <p className="mt-2 text-gray-700">{currentEvent.description}</p>

        <p className="mt-4 font-semibold">{currentEvent.prompt}</p>

        <div className="mt-4 space-y-3">
          {currentEvent.options.map((opt) => (
            <button
              key={opt.id}
              disabled={submitted}
              onClick={() => setSelected(opt.id)}
              className={`block w-full border p-4 rounded ${
                selected === opt.id ? "bg-blue-100 border-blue-500" : ""
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        {/* FEEDBACK */}
        {submitted && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <p>
              {
                currentEvent.options.find((o) => o.id === selected)
                  ?.explanation
              }
            </p>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={() => (submitted ? handleNext() : handleSubmit())}
          disabled={!selected}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          {submitted ? "Next Scenario" : "Submit Choice"}
        </button>

        <p className="mt-6 font-bold">Portfolio Score: {score}</p>
      </div>
    );
  }

  /* =========================
     REFLECTION
  ========================= */

  if (view === "reflection") {
    let feedback;
    if (score > 40)
      feedback = "Excellent! You made strong ESG-driven investment decisions.";
    else if (score > 10)
      feedback = "Good start! You're learning to balance ethics and returns.";
    else
      feedback =
        "You focused too much on short-term gains. ESG decisions matter long-term.";

    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold">Your ESG Performance</h2>
        <p className="mt-4 text-lg">Score: {score}</p>
        <p className="mt-4">{feedback}</p>

        <button
          onClick={() => setView("complete")}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded"
        >
          Continue
        </button>
      </div>
    );
  }

  /* =========================
     COMPLETE
  ========================= */

  return (
    <div className="text-center p-10">
      <h2 className="text-3xl font-bold">🎉 Lesson Complete</h2>
      <p className="mt-4">You’ve applied responsible investing in real scenarios.</p>

      <button
        onClick={() => onComplete(score)}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded"
      >
        Finish
      </button>
    </div>
  );
}
