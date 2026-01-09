// app/lesson/lesson1/lesson1.8/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

/* --------------------------------- UI atoms -------------------------------- */

function Pill({
  children,
  active,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!active}
      className={[
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition",
        active
          ? "border-sky-400 bg-sky-50 text-sky-800 shadow-sm"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 align-top text-slate-700 ${className}`}>{children}</td>;
}

function LabeledNumber({
  label,
  value,
  onChange,
  prefix,
  min,
  step,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  min?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1 relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
            {prefix}
          </span>
        ) : null}
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          step={step}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-slate-300 bg-white py-2 ${
            prefix ? "pl-7 pr-3" : "px-3"
          } text-slate-900 shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200`}
        />
      </div>
    </label>
  );
}

/* ------------------------------- Quiz widget ------------------------------- */

type QuizAnswer = "GICs" | "Savings" | "Savings Accounts";

type QuizProps = {
  n: number;
  question: string;
  left: QuizAnswer;
  right: QuizAnswer;
  value: QuizAnswer | null;
  onChange: (v: QuizAnswer) => void;
  explainLeft: string;
  explainRight: string;
};

function Quiz({
  n,
  question,
  left,
  right,
  value,
  onChange,
  explainLeft,
  explainRight,
}: QuizProps) {
  const isLeft = value === left;
  const isRight = value === right;

  return (
    <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="text-sm font-semibold text-slate-700">Question {n}</div>
      <p className="mt-1 text-slate-800">{question}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Pill active={isLeft} onClick={() => onChange(left)}>
          {left}
        </Pill>
        <Pill active={isRight} onClick={() => onChange(right)}>
          {right}
        </Pill>
      </div>

      {value && (
        <p className="mt-3 text-sm text-slate-600">
          {isLeft ? (
            <>Explanation: {explainLeft}</>
          ) : (
            <>Explanation: {explainRight}</>
          )}
        </p>
      )}
    </div>
  );
}

/* ------------------------------- Main page -------------------------------- */

export default function Lesson1_8_Page() {
  const [strategy, setStrategy] = useState<"GICs" | "Savings" | "RRSPs">("GICs");

  // Quiz selections
  const [q1, setQ1] = useState<QuizAnswer | null>(null);
  const [q2, setQ2] = useState<QuizAnswer | null>(null);
  const [q3, setQ3] = useState<QuizAnswer | null>(null);

  // Inputs
  const [estAmount, setEstAmount] = useState<number>(5000);
  const [rrspContribution, setRrspContribution] = useState<number>(10000);
  const [risk, setRisk] = useState<"High" | "Medium" | "Low">("Medium");

  // Computed values (illustrative)
  const estEarningsRange = useMemo(() => {
    // GIC 1%–3% annually for one year
    const low = estAmount * 0.01;
    const high = estAmount * 0.03;
    return { low, high };
  }, [estAmount]);

  const estTaxSavings = useMemo(() => {
    // Approximate RRSP tax savings
    return Math.min(rrspContribution * 0.125, 1250);
  }, [rrspContribution]);

  const projectedRetIncome = useMemo(() => {
    // Placeholder annual income impacted by contribution & risk
    const riskBump = risk === "High" ? 1.12 : risk === "Medium" ? 1.1 : 1.07;
    const base = 40000;
    return Math.round(base + rrspContribution * 0.5 * (riskBump - 1));
  }, [rrspContribution, risk]);

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-24">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Jack&apos;s Personalized Investment Plan
          </h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Explore tailored financial strategies for Jack, a 25-year-old software engineer with a
            $75k salary and $5k side hustle income. Jack is saving for a condo, managing a car loan,
            and enjoys weekend trips. Let’s optimize his financial decisions.
          </p>
        </header>

        {/* Strategy chips */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Investment Strategy</h2>
          <p className="text-slate-600">
            Select your investment mix between GICs, savings accounts, and RRSPs:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill active={strategy === "GICs"} onClick={() => setStrategy("GICs")}>
              GICs
            </Pill>
            <Pill active={strategy === "Savings"} onClick={() => setStrategy("Savings")}>
              Savings Accounts
            </Pill>
            <Pill active={strategy === "RRSPs"} onClick={() => setStrategy("RRSPs")}>
              RRSPs
            </Pill>
          </div>
        </section>

        {/* Investment details table */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Investment Details</h2>
          <p className="text-slate-600">Here’s a breakdown of your investment options:</p>

          <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <Th>Investment Type</Th>
                  <Th>Description</Th>
                  <Th>Potential Returns</Th>
                  <Th>Term</Th>
                  <Th>Fees</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <Td className="font-semibold">GICs</Td>
                  <Td>
                    Guaranteed Investment Certificates (GICs) are low-risk investments with a fixed
                    interest rate over a set period. Ideal for short-term savings like a condo down payment.
                  </Td>
                  <Td>1–3% annually</Td>
                  <Td>1–5 years</Td>
                  <Td>None</Td>
                </tr>
                <tr>
                  <Td className="font-semibold">Savings Accounts</Td>
                  <Td>
                    Savings accounts offer easy access to your money and earn interest. Suitable for
                    emergency funds or short-term saving, but typically lower returns than GICs.
                  </Td>
                  <Td>0.5–1.5% annually</Td>
                  <Td>Flexible</Td>
                  <Td>Minimal</Td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Quiz */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Investment Details – Quiz</h2>
          <p className="text-slate-600">
            Test your knowledge with these questions about GICs and savings accounts:
          </p>

          <Quiz
            n={1}
            question="If Jack anticipates needing access to his funds within a year, which investment option is most suitable?"
            left="GICs"
            right="Savings Accounts"
            value={q1}
            onChange={setQ1}
            explainLeft="GICs lock funds for a fixed term — not ideal for under a year."
            explainRight="Correct. Savings accounts offer flexible access, making them better for short-term needs."
          />

          <Quiz
            n={2}
            question="Considering Jack’s aversion to risk, which investment offers the most security?"
            left="GICs"
            right="Savings Accounts"
            value={q2}
            onChange={setQ2}
            explainLeft="Correct. GICs guarantee a fixed rate for a set period, providing higher security."
            explainRight="Savings are liquid but their rate can vary and is usually lower."
          />

          <Quiz
            n={3}
            question="Which investment type typically offers higher returns?"
            left="GICs"
            right="Savings Accounts"
            value={q3}
            onChange={setQ3}
            explainLeft="Often higher due to fixed terms and lower liquidity."
            explainRight="Typically lower returns compared to GICs."
          />

          {/* Estimated earnings + contribution */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <LabeledNumber
              label="Estimated Earnings (GIC 1 year investment)"
              value={estAmount}
              onChange={setEstAmount}
              prefix="$"
              step={100}
              min={0}
              placeholder="Enter amount"
            />
            <LabeledNumber
              label="RRSP Contribution Amount"
              value={rrspContribution}
              onChange={setRrspContribution}
              prefix="$"
              step={500}
              min={0}
              placeholder="Contribution amount"
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Based on 1–3% annually, a ${estAmount.toLocaleString()} GIC could earn between{" "}
            <strong>${Math.round(estEarningsRange.low).toLocaleString()}</strong> and{" "}
            <strong>${Math.round(estEarningsRange.high).toLocaleString()}</strong> in one year.
          </p>
        </section>

        {/* Scenario-specific questions */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Scenario-Specific Questions</h2>

          <div className="mt-3 space-y-6">
            <div>
              <p className="text-slate-800">
                Given your short-term goal of buying a condo, how should you allocate between a
                high-interest savings account and an RRSP?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>Savings Account</Pill>
                <Pill>RRSP</Pill>
                <Pill>Both</Pill>
              </div>
            </div>

            <div>
              <p className="text-slate-800">
                Considering current expenses and weekend trips, what is a sustainable RRSP
                contribution that maximizes tax benefits without compromising lifestyle?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill onClick={() => setRrspContribution(5000)}>$5,000</Pill>
                <Pill onClick={() => setRrspContribution(10000)}>$10,000</Pill>
                <Pill onClick={() => setRrspContribution(15000)}>$15,000</Pill>
              </div>
            </div>

            <div>
              <p className="text-slate-800">
                To balance risk and returns, how would you distribute investments between GICs
                (stable) and savings (liquidity)?
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["High", "Medium", "Low"] as const).map((r) => (
                  <Pill key={r} active={r === risk} onClick={() => setRisk(r)}>
                    {r}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                className="inline-flex items-center rounded-full bg-sky-700 px-5 py-2.5 text-white font-semibold shadow hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                onClick={() =>
                  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
                }
              >
                Calculate and View Insights
              </button>
            </div>
          </div>
        </section>

        {/* Insights */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Estimated Tax Savings</h2>
          <p className="mt-1 text-slate-700">
            Based on your RRSP contribution, you could save approximately{" "}
            <strong>${Math.round(estTaxSavings).toLocaleString()}</strong> in taxes this year.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Projected Retirement Income</h2>
          <p className="text-slate-700">
            With consistent contributions, your estimated retirement income could be{" "}
            <strong>${projectedRetIncome.toLocaleString()}</strong> per year.
          </p>

          {/* Simple sparkline */}
          <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <svg viewBox="0 0 600 140" className="w-full h-[140px]">
              <path
                d="M0 110 Q 60 80, 120 100 T 240 90 T 360 105 T 480 80 T 600 95"
                stroke="currentColor"
                className="text-sky-700"
                strokeWidth="3"
                fill="none"
              />
              {[0, 120, 240, 360, 480, 600].map((x, i) => (
                <text
                  key={x}
                  x={x}
                  y={130}
                  fontSize="12"
                  textAnchor={i === 0 ? "start" : i === 5 ? "end" : "middle"}
                  className="fill-slate-500"
                >
                  {2024 + i * 2}
                </text>
              ))}
            </svg>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900">Risk Assessment Tool</h2>
          <p className="text-slate-700">
            Understand the risk profiles of your investment choices. Adjust your strategy to optimize
            your risk–reward balance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">Investment Tips</h2>
          <p className="text-slate-700 mt-2">
            Explore GICs, savings accounts, and RRSPs. Consider allocating side-hustle income to a
            high-interest savings account for the condo down payment while maximizing RRSP
            contributions to reduce taxable income and boost retirement savings.
          </p>
        </section>

        {/* Footer CTAs */}
        <div className="mt-10 flex items-center justify-between">
          <Link
            href="#"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Learn More About Investment Options
          </Link>

          <Link
            href="/lesson/lesson1/lesson1.9"
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

/* --------------------------------- utils ---------------------------------- */

function formatCurrency(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
