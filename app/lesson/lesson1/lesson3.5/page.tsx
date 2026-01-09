// app/lesson/lesson1/lesson1.10/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/* ------------------------------- Page ------------------------------- */

export default function Lesson1_10_Page() {
  /* Budget calculator */
  const [budgetIncome, setBudgetIncome] = useState<number | "">("");
  const [budgetExpenses, setBudgetExpenses] = useState<number | "">("");
  const budgetNet =
    (Number(budgetIncome || 0) - Number(budgetExpenses || 0));

  /* Expense tracker */
  const [expCat, setExpCat] = useState("");
  const [expAmt, setExpAmt] = useState<number | "">("");
  const [expenses, setExpenses] = useState<{ cat: string; amt: number }[]>(
    []
  );
  const totalTracked = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amt, 0),
    [expenses]
  );

  function addExpense() {
    const amt = Number(expAmt);
    if (!expCat || !Number.isFinite(amt)) return;
    setExpenses((arr) => [...arr, { cat: expCat, amt }]);
    setExpCat("");
    setExpAmt("");
  }

  /* Goal setting */
  const [goalName, setGoalName] = useState("");
  const [goalAmt, setGoalAmt] = useState<number | "">("");
  const [goalDate, setGoalDate] = useState("");
  const [goals, setGoals] = useState<{ name: string; amt: number; date: string }[]>([]);

  function addGoal() {
    const amt = Number(goalAmt);
    if (!goalName || !Number.isFinite(amt) || !goalDate) return;
    setGoals((arr) => [...arr, { name: goalName, amt, date: goalDate }]);
    setGoalName("");
    setGoalAmt("");
    setGoalDate("");
  }

  /* RRSP planner (simple, illustrative) */
  const [annualIncome, setAnnualIncome] = useState<number | "">("");
  const [contribPct, setContribPct] = useState<number | "">(""); // % of income
  const [yearsToRetire, setYearsToRetire] = useState<number | "">("");

  const rrsp = useMemo(() => {
    const income = Number(annualIncome || 0);
    const pct = Number(contribPct || 0) / 100;
    const years = Number(yearsToRetire || 0);
    const annualContrib = income * pct;

    // naive tax savings ~ 25% of contributions
    const estTaxSavings = annualContrib * 0.25;

    // FV of series: A * [((1+r)^n - 1)/r]
    const r = 0.06; // 6% annual growth (illustrative)
    const fv = annualContrib * (((1 + r) ** years - 1) / r);

    return {
      annualContrib,
      estTaxSavings,
      projectedRetIncome: Math.round(fv / 25_000) * 1_000 + 40_000, // playful mapping to a yearly income
      projectedBalance: fv,
    };
  }, [annualIncome, contribPct, yearsToRetire]);

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-12">
        <header className="mb-8">
          <div className="text-xs uppercase tracking-wide text-slate-500">Calculate on your own</div>
          <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Try it On Your Own!
          </h1>
        </header>

        {/* Budget Calculator */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Budget Calculator</h2>
          <p className="text-sm text-slate-600">
            Estimate your budget based on income and expenses. Enter your details to calculate your budget.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Monthly Income"
              placeholder="Enter your monthly income"
              type="number"
              value={budgetIncome}
              onChange={(v) => setBudgetIncome(numOrEmpty(v))}
              prefix="$"
            />
            <Input
              label="Total Monthly Expenses"
              placeholder="Enter your total monthly expenses"
              type="number"
              value={budgetExpenses}
              onChange={(v) => setBudgetExpenses(numOrEmpty(v))}
              prefix="$"
            />
          </div>

          <div className="mt-4">
            <button
              className="rounded-full bg-sky-700 px-5 py-2.5 text-white font-semibold shadow hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              onClick={() => {}}
            >
              Calculate Budget
            </button>
          </div>

          <div className="mt-4 text-slate-800">
            Net Monthly:{" "}
            <span className={`font-bold ${budgetNet >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
              {formatCurrency(budgetNet)}
            </span>
            {budgetNet < 0 && (
              <span className="ml-2 text-sm text-rose-700/80">
                (You’re spending more than you earn — trim costs or raise income.)
              </span>
            )}
          </div>
        </Card>

        {/* Expense Tracker */}
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Expense Tracker</h2>
          <p className="text-sm text-slate-600">
            Monitor your spending by tracking your expenses. Add your expenses to see where your money is going.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input
              label="Expense Category"
              placeholder="e.g., Groceries, Rent"
              value={expCat}
              onChange={setExpCat}
            />
            <Input
              label="Amount"
              placeholder="Enter amount"
              type="number"
              value={expAmt}
              onChange={(v) => setExpAmt(numOrEmpty(v))}
              prefix="$"
            />
          </div>

          <div className="mt-3">
            <button
              className="rounded-full bg-slate-800 px-5 py-2.5 text-white font-semibold shadow hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              onClick={addExpense}
            >
              Add Expense
            </button>
          </div>

          {expenses.length > 0 && (
            <>
              <ul className="mt-4 divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
                {expenses.map((e, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-slate-800">{e.cat}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(e.amt)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-right text-sm text-slate-700">
                Total tracked: <span className="font-semibold">{formatCurrency(totalTracked)}</span>
              </div>
            </>
          )}
        </Card>

        {/* Goal-Setting Worksheet */}
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Goal-Setting Worksheet</h2>
          <p className="text-sm text-slate-600">
            Plan your financial objectives. Set your goals and track your progress.
          </p>

          <div className="mt-4 grid gap-4">
            <Input
              label="Goal Name"
              placeholder="e.g., Save for a Car, Pay off Debt"
              value={goalName}
              onChange={setGoalName}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Target Amount"
                placeholder="Enter target amount"
                type="number"
                value={goalAmt}
                onChange={(v) => setGoalAmt(numOrEmpty(v))}
                prefix="$"
              />
              <Input
                label="Target Date"
                placeholder="MM/DD/YYYY"
                type="date"
                value={goalDate}
                onChange={setGoalDate}
              />
            </div>
          </div>

          <div className="mt-3">
            <button
              className="rounded-full bg-slate-800 px-5 py-2.5 text-white font-semibold shadow hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              onClick={addGoal}
            >
              Set Goal
            </button>
          </div>

          {goals.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
              {goals.map((g, i) => (
                <li key={i} className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{g.name}</div>
                  <div className="text-sm text-slate-600">
                    Target: {formatCurrency(g.amt)} by {formatDate(g.date)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* RRSP Planning */}
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">RRSP Planning</h2>
          <p className="text-sm text-slate-600">
            Calculate potential contributions, estimate tax savings, and project retirement balance.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Input
              label="Annual Income"
              placeholder="Enter your annual income"
              type="number"
              value={annualIncome}
              onChange={(v) => setAnnualIncome(numOrEmpty(v))}
              prefix="$"
            />
            <Input
              label="Contribution Percentage"
              placeholder="e.g., 5 for 5%"
              type="number"
              value={contribPct}
              onChange={(v) => setContribPct(numOrEmpty(v))}
              suffix="%"
            />
            <Input
              label="Years to Retirement"
              placeholder="Enter years until retirement"
              type="number"
              value={yearsToRetire}
              onChange={(v) => setYearsToRetire(numOrEmpty(v))}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Metric label="Annual Contribution" value={formatCurrency(rrsp.annualContrib)} />
            <Metric label="Estimated Tax Savings (yr)" value={formatCurrency(rrsp.estTaxSavings)} />
            <Metric label="Projected Balance" value={formatCurrency(rrsp.projectedBalance)} />
          </div>

          <div className="mt-1 text-sm text-slate-600">
            Projected retirement income (illustrative):{" "}
            <span className="font-semibold text-slate-900">
              {formatCurrency(rrsp.projectedRetIncome)} / year
            </span>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <Link
              href="/lesson/lesson1/lesson1.11"
              className="rounded-full bg-sky-700 px-6 py-3 text-white font-semibold shadow hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Check Priority
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}

/* ---------------------------- UI helpers ---------------------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-2xl bg-white p-5 ring-1 ring-slate-200 ${className}`}
    >
      {children}
    </section>
  );
}

function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "date";
  value: string | number | "";
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
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
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-slate-300 bg-white py-2 text-slate-900 shadow-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${
            prefix ? "pl-7 pr-3" : suffix ? "pl-3 pr-7" : "px-3"
          }`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

/* ------------------------------ utils ------------------------------ */

function formatCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function numOrEmpty(v: string): number | "" {
  if (v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? n : "";
}

function formatDate(iso: string) {
  // ISO from <input type="date">
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
