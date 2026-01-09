// app/lesson/lesson1/lesson1.3/page.tsx
import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";
import Link from "next/link";

const COINS_STACK =
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1600&q=80";
const IMG_URL = COINS_STACK;

export default function Lesson1_3Page() {
  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20">
        {/* Header (centered like WYBD) */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-manrope">
            Let's continue with some definitions...
          </h1>
          <p className="mt-3 mx-auto max-w-3xl text-slate-500 font-manrope">
            Here's the next card in our financial definitions series to help build your money vocabulary.
          </p>
        </div>

        {/* Content layout: two columns with generous gap */}
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {/* Left (image) */}
          <div className="relative w-full max-w-[520px] aspect-[4/3] overflow-hidden rounded-2xl shadow-sm">
            <Image
              src={IMG_URL}
              alt="Illustration representing budgeting and saving"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 520px, 100vw"
              priority
              unoptimized
            />
          </div>

          {/* Right (text) */}
          <div className="flex flex-col justify-center max-w-[620px]">
            <h2 className="text-2xl font-semibold text-slate-900 font-manrope">
              Budget
            </h2>
            <p className="mt-3 text-slate-700 leading-7 font-manrope">
              A budget is a plan for how you will use your money. It helps you keep track of how
              much money is coming in (like from a job, allowance, or gifts) and how much is going
              out (like for food, clothes, fun, or savings). By making a budget, you can make sure
              you don't spend more than you have and can save for things you want in the future.
            </p>
            <p className="mt-5 font-medium text-slate-700 font-manrope">
              A budget = telling your money where to go instead of wondering where it went.
            </p>
          </div>
        </div>

        {/* Completion message */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 border-2 border-green-200 rounded-xl">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-semibold font-manrope">
              Lesson 1 Complete!
            </span>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Redo Lesson Button */}
          <Link 
            href="/lesson/lesson1/lesson1.1"
            className="inline-flex items-center px-6 py-3 border-2 border-[#1B6BA6] text-[#1B6BA6] font-semibold rounded-xl hover:bg-[#1B6BA6] hover:text-white transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Redo Lesson 1
          </Link>

          {/* Main buttons */}
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson2.1"
            primaryLabel="Continue to Lesson 2"
            secondaryHref="/lesson"
            secondaryLabel="Back to Modules"
            align="center"
          />
        </div>
      </section>
    </main>
  );
}