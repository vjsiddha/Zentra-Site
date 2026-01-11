"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";

const DEFINITIONS = [
  {
    id: 1,
    term: "Net Pay (The $1,800)",
    definition: "This is your 'take-home pay'—the money that actually hits your bank account after taxes have been taken out. This is the real number you use for your budget.",
    analogy: "If your salary is a whole pizza, Net Pay is the number of slices you actually get to eat after the government takes their bite.",
    image: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    term: "Fixed Expenses (Rent)",
    definition: "Costs that stay the same every single month. These are usually non-negotiable and are the first things you should account for in a budget.",
    analogy: "Like a Netflix subscription—you know exactly what's coming out of your pocket every month without surprises.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    term: "Variable Expenses (Groceries & Fun)",
    definition: "Costs that change based on your behavior. You have more control over these, but they are the most common places where people overspend.",
    analogy: "Like the volume on your phone—you can turn it up or down depending on how much 'noise' you can afford that week.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    term: "Savings vs. Investing",
    definition: "Savings is money set aside for emergencies or short-term goals (safe but slow). Investing is putting money into assets like stocks to grow wealth over time (higher risk, higher reward).",
    analogy: "Savings is a shield to protect you today; Investing is a seed to grow a tree for tomorrow.",
    image: "https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    term: "Emergency Fund",
    definition: "A 'safety net' of cash specifically for unexpected events like car repairs or job loss. Aiming for $1,000 is a great first step for your first job.",
    analogy: "It’s your financial umbrella. You hope you don't need it, but you're glad you have it when it starts raining bills.",
    image: "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    term: "Cash Flow Balance",
    definition: "The difference between the money coming in and the money going out. Positive cash flow means you have money left over; negative means you are overspending.",
    analogy: "Think of a bathtub. If the water draining out is faster than the water coming in, you're eventually going to run dry.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 7,
    term: "Budget Stability",
    definition: "A measure of how sustainable your spending is. A stable budget covers all needs and savings without relying on credit cards to survive the month.",
    analogy: "It’s like building a house on a concrete slab instead of sand. When a storm (unexpected bill) hits, the house doesn't move.",
    image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 8,
    term: "The 50/30/20 Rule",
    definition: "A simple plan for your $1,800: Spend 50% on Needs ($900), 30% on Wants ($540), and 20% on Savings/Debt ($360).",
    analogy: "It’s like a balanced diet for your paycheck—it keeps your financial body lean and healthy.",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop",
  }
];

export default function DefinitionsPage() {
  const searchParams = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");
  const currentIndex = step - 1;
  const currentItem = DEFINITIONS[currentIndex] || DEFINITIONS[0];

  const progress = (step / DEFINITIONS.length) * 100;
  const isLastItem = step === DEFINITIONS.length;

  // Paths for navigation
  const nextStepHref = isLastItem 
    ? "/lesson/lesson1/lesson1.3" 
    : `?step=${step + 1}`;
  
  const prevStepHref = step > 1 
    ? `?step=${step - 1}` 
    : "/lesson";

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 sticky top-0 z-50">
        <div 
          className="h-full bg-sky-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Let’s start with some definitions…
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-sky-600">
            Term {step} of {DEFINITIONS.length}
          </p>
        </header>

        <div className="mt-12 grid gap-10 md:grid-cols-2 items-center">
          {/* Image */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-full max-w-[520px] aspect-[4/3] overflow-hidden rounded-2xl shadow-lg bg-slate-200">
              <Image
                key={currentItem.image}
                src={currentItem.image}
                alt={currentItem.term}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 520px, 100vw"
                priority
              />
            </div>
          </div>

          {/* Text */}
          <article className="max-w-[620px] mx-auto md:mx-0">
            <h2 className="text-3xl font-bold text-slate-900">{currentItem.term}</h2>
            <p className="mt-4 text-slate-700 text-lg leading-7">
              {currentItem.definition}
            </p>
            
            <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 block mb-2">
                The Simple Way to Think About It:
              </span>
              <p className="text-slate-600 italic text-lg leading-relaxed">
                "{currentItem.analogy}"
              </p>
            </div>
          </article>
        </div>

        {/* Navigation - Using your ButtonGroup Component */}
        <div className="mt-16">
          <ButtonGroup
            primaryHref={nextStepHref}
            primaryLabel={isLastItem ? "Finish Definitions" : "Next Definition"}
            secondaryHref={prevStepHref}
            secondaryLabel={step > 1 ? "Previous Definition" : "Back to Modules"}
            align="center"
            showArrow={!isLastItem}
          />
        </div>
      </section>
    </main>
  );
}