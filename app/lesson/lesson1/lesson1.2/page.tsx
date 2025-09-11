import Image from "next/image";
import ButtonGroup from "@/components/ButtonGroup";

export default function DefinitionsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      {/* same shell spacing as the WYBD page */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-20">
        {/* centered heading + subcopy to match WYBD */}
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Let’s start with some definitions…
          </h1>
          <p className="mt-3 mx-auto max-w-3xl text-slate-500">
            Explore key saving terms with interactive flashcards. Tap or swipe to reveal
            definitions and filter by category to focus your learning.
          </p>
        </header>

        {/* two-column content with generous gap like WYBD */}
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {/* image column with the same rounded/soft look */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-full max-w-[520px] aspect-[4/3] overflow-hidden rounded-2xl shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop"
                alt="Pink piggy bank with coins representing savings"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 520px, 100vw"
                priority
              />
            </div>
          </div>

          {/* text column */}
          <article className="max-w-[620px] mx-auto md:mx-0">
            <h2 className="text-2xl font-semibold text-slate-900">Savings Account</h2>
            <p className="mt-3 text-slate-700 leading-7">
              A savings account is a safe place to keep your money at a bank or credit union.
              When you put money into a savings account, the bank pays you a small amount of extra
              money called interest just for keeping your money there. You can take your money out
              when you need it, but it’s mainly meant for saving rather than spending.
            </p>
            <p className="mt-5 font-medium text-slate-700">
              Think of it like a piggy bank that pays you back a little bit for using it.
            </p>
          </article>
        </div>

        {/* centered pill CTAs to match WYBD */}
        <div className="mt-12 flex justify-center">
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson1.3"
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
