// app/lesson/lesson1/lesson1.4/page.tsx
import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";

const IMG_URL =
  "/images/rrsp-stacking-coins.jpg"; 

export default function Lesson1_4Page() {
  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20">
        {/* Header (centered, same shell as 1.2/1.3) */}
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Let’s start with some definitions…
          </h1>
          <p className="mt-3 mx-auto max-w-3xl text-slate-500">
            Explore key saving terms with interactive flashcards. Tap or swipe to
            reveal definitions and filter by category to focus your learning.
          </p>
        </header>

        {/* Two-column content */}
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {/* Left (image) */}
          <div className="relative w-full max-w-[520px] aspect-[4/3] overflow-hidden rounded-2xl shadow-sm">
            <Image
              src={IMG_URL}
              alt="Person stacking coins on a table — retirement savings (RRSP)"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 520px, 100vw"
              priority
            />
          </div>

          {/* Right (text) */}
          <article className="max-w-[620px] mx-auto md:mx-0">
            <h2 className="text-2xl font-semibold text-slate-900">
              Registered Retirement Savings Plan (RRSP)
            </h2>

            <p className="mt-3 text-slate-700 leading-7">
              An RRSP (Registered Retirement Savings Plan) is a special type of
              savings account in Canada that helps people set money aside for
              retirement. The money you put into an RRSP is taxed later, which
              means you can save more while you’re working. Your investments
              inside the plan can grow over time through things like stocks or
              bonds, and you’ll pay taxes when you take it out, usually after you
              retire (when your income may be lower).
            </p>

            <p className="mt-5 font-medium text-slate-700">
              <span className="font-semibold">Key Idea:</span> An RRSP is a
              government-approved savings plan that lets your money grow
              tax-deferred until you need it in the future.
            </p>
          </article>
        </div>

        {/* CTAs (centered, shared ButtonGroup) */}
        <div className="mt-12 flex justify-center">
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson1.5"
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
