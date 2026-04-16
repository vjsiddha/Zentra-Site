"use client";

import { useMemo, useState } from "react";

/* =========================
   TYPES
========================= */

type ESGFactor = {
  id: string;
  name: string;
  emoji: string;
  vibe: "core" | "risk" | "theme";
  description: string;
  drivers: string[];
};

type ESGImpact = {
  [factorId: string]: number;
};

type ResponsibleEvent = {
  id: number;
  title: string;
  tag: "Environment" | "Social" | "Governance" | "Policy" | "Ethics";
  blurb: string;
  prompt: string;
  optimalIndex: number;
  options: {
    label: string;
    explanation: string;
    impacts: ESGImpact;
  }[];
};

/* =========================
   ESG FACTORS (like sectors)
========================= */

const ESG_FACTORS: ESGFactor[] = [
  {
    id: "environment",
    name: "Environmental",
    emoji: "🌱",
    vibe: "core",
    description:
      "Focuses on climate impact, emissions, and sustainability practices.",
    drivers: ["carbon emissions", "renewables", "pollution"],
  },
  {
    id: "social",
    name: "Social",
    emoji: "🤝",
    vibe: "core",
    description:
      "How companies treat employees, customers, and communities.",
    drivers: ["labor rights", "diversity", "consumer trust"],
  },
  {
    id: "governance",
    name: "Governance",
    emoji: "🏛️",
    vibe: "core",
    description:
      "Leadership, transparency, and corporate ethics.",
    drivers: ["leadership", "transparency", "accountability"],
  },
  {
    id: "clean_energy",
    name: "Clean Energy Theme",
    emoji: "⚡",
    vibe: "theme",
    description:
      "Renewable energy and sustainability-focused innovation.",
    drivers: ["policy support", "innovation", "energy demand"],
  },
  {
    id: "ethical_business",
    name: "Ethical Business",
    emoji: "📜",
    vibe: "theme",
    description:
      "Companies with strong ethical standards and fair practices.",
    drivers: ["transparency", "fair trade", "compliance"],
  },
];

/* =========================
   EVENTS (ESG SCENARIOS)
========================= */

const EVENTS: ResponsibleEvent[] = [
  {
    id: 1,
    title: "Major Oil Spill Reported",
    tag: "Environment",
    blurb: "A major environmental disaster damages ecosystems.",
    prompt: "What is the best responsible investing reaction?",
    optimalIndex: 0,
    options: [
      {
        label: "Shift toward clean energy investments",
        explanation:
          "Environmental risks increase demand for sustainable alternatives.",
        impacts: {
          environment: +3,
          clean_energy: +4,
          governance: +1,
          social: +0.5,
        },
      },
      {
        label: "Ignore and focus on profits",
        explanation:
          "Ignoring ESG risks can lead to long-term losses.",
        impacts: {
          environment: -2,
          clean_energy: -1,
          governance: -1,
        },
      },
    ],
  },

  {
    id: 2,
    title: "Labor Rights Scandal",
    tag: "Social",
    blurb: "A company is exposed for unsafe working conditions.",
    prompt: "What is the responsible response?",
    optimalIndex: 0,
    options: [
      {
        label: "Invest in ethical companies",
        explanation:
          "Social issues affect reputation and long-term returns.",
        impacts: {
          social: +3,
          ethical_business: +2,
        },
      },
      {
        label: "Stay for profits",
        explanation:
          "Short-term gains ignore long-term ESG risks.",
        impacts: {
          social: -2,
          ethical_business: -1,
        },
      },
    ],
  },

  {
    id: 3,
    title: "CEO Corruption Scandal",
    tag: "Governance",
    blurb: "Leadership is under investigation.",
    prompt: "What happens?",
    optimalIndex: 0,
    options: [
      {
        label: "Governance becomes more important",
        explanation:
          "Strong governance reduces long-term risk.",
        impacts: {
          governance: +3,
          ethical_business: +2,
        },
      },
      {
        label: "No impact",
        explanation:
          "Governance failures usually hurt companies.",
        impacts: {
          governance: -2,
        },
      },
    ],
  },

  {
    id: 4,
    title: "Government Supports Renewables",
    tag: "Policy",
    blurb: "New subsidies boost clean energy.",
    prompt: "What is the impact?",
    optimalIndex: 0,
    options: [
      {
        label: "Clean energy grows",
        explanation:
          "Policy directly boosts ESG sectors.",
        impacts: {
          clean_energy: +4,
          environment: +2,
        },
      },
      {
        label: "No change",
        explanation:
          "Markets react quickly to policy.",
        impacts: {
          clean_energy: +1,
        },
      },
    ],
  },

  {
    id: 5,
    title: "Transparency Report Released",
    tag: "Ethics",
    blurb: "Company improves ESG disclosures.",
    prompt: "What happens?",
    optimalIndex: 0,
    options: [
      {
        label: "Trust increases",
        explanation:
          "Transparency builds investor confidence.",
        impacts: {
          ethical_business: +3,
          governance: +2,
        },
      },
      {
        label: "No effect",
        explanation:
          "ESG transparency matters to investors.",
        impacts: {
          ethical_business: -1,
        },
      },
    ],
  },
];

/* =========================
   HELPERS
========================= */

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

function computeScore(picks: string[], weights: Record<string, number>) {
  const total = picks.reduce((a, id) => a + (weights[id] || 0), 0);
  const valid = Math.abs(total - 100) < 0.01;

  const maxWeight = Math.max(...picks.map((id) => weights[id] || 0));
  const balanced = maxWeight <= 60;

  const diversity = new Set(picks).size >= 2;

  return (
    (valid ? 40 : 0) +
    (balanced ? 30 : 10) +
    (diversity ? 30 : 10)
  );
}

/* =========================
   COMPONENT
========================= */

export default function ResponsibleInvestingLesson() {
  const [picks, setPicks] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [eventIndex, setEventIndex] = useState(0);
  const [value, setValue] = useState(10000);

  const currentEvent = EVENTS[eventIndex];

  const totalWeight = useMemo(
    () => picks.reduce((a, id) => a + (weights[id] || 0), 0),
    [picks, weights]
  );

  const score = useMemo(
    () => computeScore(picks, weights),
    [picks, weights]
  );

  const applyEvent = (optionIndex: number) => {
    const impacts = currentEvent.options[optionIndex].impacts;

    const ret = picks.reduce((acc, id) => {
      const w = (weights[id] || 0) / 100;
      const r = impacts[id] || 0;
      return acc + w * r;
    }, 0);

    setValue(Math.round(value * (1 + ret / 100)));
    setEventIndex((i) => i + 1);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">
        Responsible Investing Simulator
      </h1>

      <p className="mb-6 text-gray-600">
        Build an ESG portfolio and test it against real-world ethical events.
      </p>

      {/* PICKS */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {ESG_FACTORS.map((f) => (
          <button
            key={f.id}
            onClick={() =>
              setPicks((prev) =>
                prev.includes(f.id)
                  ? prev.filter((x) => x !== f.id)
                  : prev.length < 3
                  ? [...prev, f.id]
                  : prev
              )
            }
            className="border p-4 rounded-lg"
          >
            {f.emoji} {f.name}
          </button>
        ))}
      </div>

      {/* WEIGHTS */}
      {picks.map((id) => (
        <div key={id} className="mb-3">
          <label>{id} ({weights[id] || 0}%)</label>
          <input
            type="range"
            min={0}
            max={100}
            value={weights[id] || 0}
            onChange={(e) =>
              setWeights({ ...weights, [id]: Number(e.target.value) })
            }
          />
        </div>
      ))}

      <p>Total: {totalWeight}%</p>

      <p className="mt-2 font-bold">Score: {score}/100</p>

      {/* EVENTS */}
      {eventIndex < EVENTS.length && (
        <div className="mt-8 border p-4 rounded-lg">
          <h2 className="font-bold">{currentEvent.title}</h2>
          <p>{currentEvent.blurb}</p>
          <p className="mt-2">{currentEvent.prompt}</p>

          <div className="mt-4 space-y-2">
            {currentEvent.options.map((o, i) => (
              <button
                key={i}
                onClick={() => applyEvent(i)}
                className="block w-full border p-3 rounded-lg"
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FINAL */}
      {eventIndex >= EVENTS.length && (
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="font-bold">Final Portfolio Value</h2>
          <p className="text-xl">${value}</p>
        </div>
      )}
    </div>
  );
}
