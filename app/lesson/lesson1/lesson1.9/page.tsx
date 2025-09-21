// app/lesson/lesson1/lesson1.9/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Goal = "Emergency Fund" | "Travel" | "Down Payment" | "Retirement" | "Education";

const ALL_GOALS: Goal[] = [
  "Emergency Fund",
  "Travel",
  "Down Payment",
  "Retirement",
  "Education",
];

// “Ideal” order for scoring (you can tweak this)
const IDEAL_ORDER: Goal[] = [
  "Emergency Fund",
  "Down Payment",
  "Retirement",
  "Education",
  "Travel",
];

export default function Lesson1_9_Page() {
  const [available, setAvailable] = useState<Goal[]>(ALL_GOALS);
  const [ranked, setRanked] = useState<Goal[]>([]);
  const [dragged, setDragged] = useState<Goal | null>(null);

  // Timer (1:30)
  const [secondsLeft, setSecondsLeft] = useState(90);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // start countdown
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  // Scoring
  const [result, setResult] = useState<"ideal" | "good" | "adjust" | null>(null);
  const score = useMemo(() => {
    // simple Kendall-ish score: +1 for each item in the ideal position
    let s = 0;
    IDEAL_ORDER.forEach((goal, idx) => {
      if (ranked[idx] === goal) s += 1;
    });
    return s; // 0..5
  }, [ranked]);

  function checkPriority() {
    if (ranked.length < 5) {
      setResult("adjust");
      return;
    }
    if (score >= 4) setResult("ideal");
    else if (score >= 2) setResult("good");
    else setResult("adjust");
  }

  // Drag helpers
  function onDragStart(g: Goal) {
    setDragged(g);
  }
  function onDragEnd() {
    setDragged(null);
  }
  function onDropToRanked() {
    if (!dragged) return;
    // If dragged from available, append to ranked
    if (available.includes(dragged) && !ranked.includes(dragged)) {
      setAvailable((arr) => arr.filter((x) => x !== dragged));
      setRanked((arr) => [...arr, dragged]);
    }
    // If dragged from ranked to ranked do nothing (simple version)
    setDragged(null);
  }
  function onDropToAvailable() {
    if (!dragged) return;
    // Move back to available if it was in ranked
    if (ranked.includes(dragged)) {
      setRanked((arr) => arr.filter((x) => x !== dragged));
      setAvailable((arr) => {
        const next = [...arr, dragged];
        // keep original “ALL_GOALS” visual ordering
        return ALL_GOALS.filter((g) => next.includes(g));
      });
    }
    setDragged(null);
  }

  // remove from ranked by clicking
  function removeFromRanked(g: Goal) {
    setRanked((arr) => arr.filter((x) => x !== g));
    setAvailable((arr) => {
      const next = [...arr, g];
      return ALL_GOALS.filter((x) => next.includes(x));
    });
  }

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pt-10 pb-24">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">Lesson Progress</div>
          <div className="text-sm font-medium text-slate-500">20%</div>
        </div>
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 w-[20%] rounded-full bg-sky-500" />
        </div>

        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Prioritize Your Savings Goals
          </h1>
          <p className="mt-2 text-slate-600">
            Drag and drop the words to rank your financial objectives from most to least important.
          </p>
        </header>

        {/* Available chips */}
        <div
          className="mb-4 flex flex-wrap gap-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropToAvailable}
        >
          {available.map((g) => (
            <Chip
              key={g}
              label={g}
              draggable
              onDragStart={() => onDragStart(g)}
              onDragEnd={onDragEnd}
            />
          ))}
        </div>

        {/* Drop zone */}
        <div
          className="rounded-xl border border-slate-300 bg-white/70 p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropToRanked}
        >
          {ranked.length === 0 ? (
            <span className="text-slate-400">Drag&nbsp;&nbsp;<span className="italic">goals here</span></span>
          ) : (
            <ol className="flex flex-wrap gap-2">
              {ranked.map((g, i) => (
                <Chip
                  key={g}
                  label={`${(i + 1).toString().padStart(2, "0")}. ${g}`}
                  removable
                  onRemove={() => removeFromRanked(g)}
                  draggable
                  onDragStart={() => onDragStart(g)}
                  onDragEnd={onDragEnd}
                />
              ))}
            </ol>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <LegendItem tone="ideal" active={result === "ideal"}>
            Ideal
          </LegendItem>
          <LegendItem tone="good" active={result === "good"}>
            Good
          </LegendItem>
          <LegendItem tone="adjust" active={result === "adjust"}>
            Needs Adjustment
          </LegendItem>
        </div>

        {/* Timer */}
        <div className="mt-8 grid grid-cols-2 gap-6 max-w-2xl">
          <TimeBox label="Minutes" value={minutes} />
          <TimeBox label="Seconds" value={seconds} />
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setAvailable(ALL_GOALS);
              setRanked([]);
              setResult(null);
            }}
            className="inline-flex items-center rounded-full px-5 py-2.5 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-white"
          >
            Reset
          </button>
          <button
            onClick={checkPriority}
            className="inline-flex items-center rounded-full bg-sky-700 px-6 py-3 text-white font-semibold shadow hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Check Priority
          </button>
        </div>

        {/* Next CTA (optional; enable once this step is complete) */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/lesson/lesson1/lesson1.10"
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-white"
          >
            Next
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ----------------------------- tiny components ---------------------------- */

function Chip({
  label,
  removable,
  onRemove,
  draggable,
  onDragStart,
  onDragEnd,
}: {
  label: string;
  removable?: boolean;
  onRemove?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
    >
      {label}
      {removable && (
        <button
          aria-label="Remove"
          onClick={onRemove}
          className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          ×
        </button>
      )}
    </div>
  );
}

function LegendItem({
  tone,
  active,
  children,
}: {
  tone: "ideal" | "good" | "adjust";
  active?: boolean;
  children: React.ReactNode;
}) {
  const map = {
    ideal: { icon: "😊", color: active ? "text-emerald-700" : "text-emerald-600" },
    good: { icon: "🙂", color: active ? "text-sky-700" : "text-sky-600" },
    adjust: { icon: "😐", color: active ? "text-amber-700" : "text-amber-600" },
  }[tone];
  return (
    <div className={`inline-flex items-center gap-2 ${map.color}`}>
      <span aria-hidden>{map.icon}</span>
      <span className="text-slate-700">{children}</span>
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="rounded-2xl bg-slate-200 py-6 text-2xl font-extrabold text-slate-900 tracking-widest">
        {value}
      </div>
      <div className="mt-2 text-sm text-slate-600">{label}</div>
    </div>
  );
}
