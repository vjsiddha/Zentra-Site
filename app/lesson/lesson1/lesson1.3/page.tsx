// app/lesson/lesson1/lesson1.3/page.tsx
import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";

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
              you don’t spend more than you have and can save for things you want in the future.
            </p>
            <p className="mt-5 font-medium text-slate-700 font-manrope">
              A budget = telling your money where to go instead of wondering where it went.
            </p>
          </div>
        </div>

        {/* Centered pill CTAs to match lesson1.2 */}
        <div className="mt-12 flex justify-center">
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson1.4"
            primaryLabel="Next Definition"
            secondaryHref="/lesson"
            secondaryLabel="Back to Modules"
            align="center"
          />
        </div>
      </section>
    </main>
  );
}
