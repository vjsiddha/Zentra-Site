// app/lesson/lesson1/lesson2.1/page.tsx
"use client";

import { useState, useEffect } from "react";
import ButtonGroup from "@/components/ButtonGroup";

export default function Lesson2_1Page() {
  // Scenario: $1,800/month
  const MONTHLY_INCOME = 1800;

  // Budget States
  const [rent, setRent] = useState(800);
  const [groceries, setGroceries] = useState(200);
  const [fun, setFun] = useState(150);
  const [savings, setSavings] = useState(250);
  const [investing, setInvesting] = useState(100);

  const totalExpenses = rent + groceries + fun + savings + investing;
  const remaining = MONTHLY_INCOME - totalExpenses;
  
  // Scoring Logic
  const savingsRate = ((savings + investing) / MONTHLY_INCOME) * 100;
  const isBalanced = remaining >= 0;

  return (
    <main className="min-h-screen bg-[#F7FAFC] py-14">
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Progress Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded-full shadow-md">
            <span className="text-sm font-bold uppercase tracking-widest">
              Level 1: The Simulation
            </span>
          </div>
        </div>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900">
            Build Your First Budget
          </h1>
          <p className="mt-3 text-slate-500 text-lg">
            Scenario: You earn <strong>$1,800/month</strong>. Use the sliders to allocate your cash.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-2">
          
          {/* LEFT: Sliders (The "Play" Area) */}
          <div className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-slate-700">Rent (Fixed)</label>
                <span className="text-sky-600 font-mono font-bold">${rent}</span>
              </div>
              <input 
                type="range" min="400" max="1200" step="50" value={rent} 
                onChange={(e) => setRent(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
              {rent > 900 && <p className="text-xs text-orange-500 mt-1">⚠️ High rent makes saving difficult!</p>}
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-slate-700">Groceries (Variable)</label>
                <span className="text-sky-600 font-mono font-bold">${groceries}</span>
              </div>
              <input 
                type="range" min="100" max="500" step="25" value={groceries} 
                onChange={(e) => setGroceries(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-bold text-slate-700">Fun & Entertainment</label>
                <span className="text-sky-600 font-mono font-bold">${fun}</span>
              </div>
              <input 
                type="range" min="0" max="400" step="10" value={fun} 
                onChange={(e) => setFun(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between mb-2">
                <label className="font-bold text-green-700">Savings & Investing</label>
                <span className="text-green-600 font-mono font-bold">${savings + investing}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 italic">Allocating here builds your future net worth.</p>
              <div className="flex gap-4">
                <input 
                  type="number" value={savings} onChange={(e) => setSavings(Number(e.target.value))}
                  className="w-1/2 p-2 border border-slate-200 rounded-lg" placeholder="Savings"
                />
                <input 
                  type="number" value={investing} onChange={(e) => setInvesting(Number(e.target.value))}
                  className="w-1/2 p-2 border border-slate-200 rounded-lg" placeholder="Investing"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Real-Time Impact Dashboard */}
          <div className="flex flex-col gap-6">
            <div className={`p-8 rounded-3xl border-2 transition-all ${isBalanced ? 'bg-white border-sky-100' : 'bg-red-50 border-red-200'}`}>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Cash Flow Dashboard</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 text-lg">Leftover Cash</span>
                  <span className={`text-2xl font-black ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${remaining}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isBalanced ? 'bg-sky-500' : 'bg-red-500'}`}
                    style={{ width: `${(totalExpenses / MONTHLY_INCOME) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Savings Rate</p>
                    <p className="text-xl font-bold text-slate-800">{savingsRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Emergency Fund</p>
                    <p className="text-xl font-bold text-slate-800">{savings > 0 ? "Building" : "Zero"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Nudge */}
            {remaining < 0 && (
              <div className="p-6 bg-orange-50 border border-orange-200 rounded-2xl animate-pulse">
                <p className="text-orange-800 font-medium">
                  <strong>Smart Nudge:</strong> You are spending more than you earn! Try lowering your "Fun" budget or find a cheaper rent option to balance your flow.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-16 flex justify-center">
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson3.1"
            primaryLabel="Finalize & Score Budget"
            secondaryHref="/lesson/lesson1/lesson1.3"
            secondaryLabel="Back to Quiz"
            align="center"
            disabled={!isBalanced}
          />
        </div>
        {!isBalanced && <p className="text-center text-red-500 text-sm mt-2 font-medium">You must have a positive cash flow to continue.</p>}
      </section>
    </main>
  );
}