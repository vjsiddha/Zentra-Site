// app/lesson/lesson1/lesson1.7/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Choice = "rent" | "buy" | "transit" | "car" | "noedu" | "edu";

export default function Lesson1_7_Page() {
  // Income (annual) — editable fields
  const [primaryIncome, setPrimaryIncome] = useState<number>(75000);
  const [additionalIncome, setAdditionalIncome] = useState<number>(5000);

  // Decisions
  const [housing, setHousing] = useState<Choice>("rent");
  const [mortgageYears, setMortgageYears] = useState<number>(15);
  const [transport, setTransport] = useState<Choice>("transit");
  const [education, setEducation] = useState<Choice>("noedu");

  // Monthly costs (defaults based on your spec)
  const housingMonthly = housing === "rent" ? 1500 : 2000;
  const transportMonthly = transport === "transit" ? 100 : 500;
  const educationMonthly = education === "noedu" ? 0 : 1000;

  // Optional “base living” so defaults sum to 4100 like the mock
  const baseLivingMonthly = 2500;

  const totalSelectedMonthly = housingMonthly + transportMonthly + educationMonthly;
  const totalMonthlySpending = baseLivingMonthly + totalSelectedMonthly;

  const monthlyIncome = useMemo(
    () => (primaryIncome + additionalIncome) / 12,
    [primaryIncome, additionalIncome]
  );

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-14 pb-24">
        {/* Header */}
        <header>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Make Sure Jack Doesn’t Go Broke!
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Simulate Jack’s budget and expenses with scenario-based prompts.
          </p>
        </header>

        {/* Income */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Income</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <CurrencyField
              label="Primary Income (annual)"
              value={primaryIncome}
              onChange={setPrimaryIncome}
            />
            <CurrencyField
              label="Additional Income (annual)"
              value={additionalIncome}
              onChange={setAdditionalIncome}
            />
          </div>
        </section>

        {/* Scenario decisions */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Scenario-Specific Decisions</h2>

          {/* Housing */}
          <Group title="Housing">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                title="Rent an Apartment"
                subtitle="Lower initial costs, more flexibility"
                detail="Monthly cost: $1,500"
                active={housing === "rent"}
                onClick={() => setHousing("rent")}
              />
              <OptionCard
                title="Buy a Home"
                subtitle="Higher initial costs, long-term investment"
                detail="Monthly cost: $2,000"
                active={housing === "buy"}
                onClick={() => setHousing("buy")}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mortgage Term (Years): <span className="font-semibold">{mortgageYears}</span>
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={mortgageYears}
                onChange={(e) => setMortgageYears(Number(e.target.value))}
                className="w-full accent-sky-700"
                disabled={housing !== "buy"}
                aria-disabled={housing !== "buy"}
              />
            </div>

            <Helper>
              Choosing to rent an apartment saves you <strong>$500</strong> monthly compared to
              buying a home. Buying builds equity over time, potentially increasing net worth in the
              long run.
            </Helper>
          </Group>

          {/* Transportation */}
          <Group title="Transportation">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                title="Use Public Transportation"
                subtitle="Cost-effective, environmentally friendly"
                detail="Monthly cost: $100"
                active={transport === "transit"}
                onClick={() => setTransport("transit")}
              />
              <OptionCard
                title="Own a Car"
                subtitle="Convenient, but expensive"
                detail="Monthly cost: $500"
                active={transport === "car"}
                onClick={() => setTransport("car")}
              />
            </div>
            <Helper>
              <strong>Smart Tip:</strong> If you own a car, explore ways to reduce costs such as
              carpooling or choosing a fuel-efficient vehicle.
            </Helper>
          </Group>

          {/* Education */}
          <Group title="Education">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                title="No Further Education"
                subtitle="Maintain current income level; no added cost"
                detail="Monthly cost: $0"
                active={education === "noedu"}
                onClick={() => setEducation("noedu")}
              />
              <OptionCard
                title="Invest in Further Education"
                subtitle="Potential for higher income in the future"
                detail="Monthly cost: $1,000"
                active={education === "edu"}
                onClick={() => setEducation("edu")}
              />
            </div>
          </Group>
        </section>

        {/* Spending overview */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-900">Spending Overview</h2>

          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            <SummaryCard
              label="Monthly Income"
              value={formatCurrency(monthlyIncome)}
              tone="positive"
            />
            <SummaryCard
              label="Selected Monthly Costs"
              value={formatCurrency(totalSelectedMonthly)}
            />
            <SummaryCard label="Total Monthly Spending" value={formatCurrency(totalMonthlySpending)} />
          </div>

          <ul className="mt-6 space-y-3">
            <BreakdownRow label="Base Living" value={baseLivingMonthly} />
            <BreakdownRow label="Housing" value={housingMonthly} />
            <BreakdownRow label="Transportation" value={transportMonthly} />
            <BreakdownRow label="Education" value={educationMonthly} />
          </ul>
        </section>

        {/* CTA */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/lesson/lesson1/lesson1.8"
            className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-3 text-white font-semibold shadow hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Next
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ---------- UI helpers ---------- */

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-sm text-slate-600">
      {children}
    </p>
  );
}

function OptionCard(props: {
  title: string;
  subtitle: string;
  detail: string;
  active: boolean;
  onClick: () => void;
}) {
  const { title, subtitle, detail, active, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "w-full rounded-xl border p-4 text-left transition",
        active
          ? "border-sky-400 bg-sky-50 shadow-sm"
          : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600">{subtitle}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{detail}</div>
    </button>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
          $
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-7 pr-3 text-slate-900 shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
          min={0}
          step={100}
        />
      </div>
    </label>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const ring = tone === "positive" ? "ring-emerald-200" : tone === "negative" ? "ring-rose-200" : "ring-slate-200";
  const bg = tone === "positive" ? "bg-emerald-50" : tone === "negative" ? "bg-rose-50" : "bg-white";
  return (
    <div className={`rounded-2xl p-4 ring-1 ${bg} ${ring}`}>
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="font-medium text-slate-800">{label}</span>
      <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>
    </li>
  );
}

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
