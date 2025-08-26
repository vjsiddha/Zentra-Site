// app/lesson/lesson1/lesson1.3/page.tsx
import Image from "next/image";
import Link from "next/link";

const IMG_URL =
  "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1600&q=80"; // debit card + POS

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
              alt="Paying with a debit card — everyday checking account spending"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 520px, 100vw"
              priority
              unoptimized   // <-- serve image directly to avoid optimizer hiccups
            />
          </div>

          {/* Right (text) */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold text-slate-900 font-manrope">
              Checking Account
            </h2>
            <p className="mt-3 text-slate-700 leading-7 font-manrope">
              A checking account is designed for everyday spending and transactions. It's where you keep money
              that you need to access frequently—whether you're paying bills, buying groceries, or getting cash
              from an ATM. You can use a debit card, write checks, or make electronic transfers. Unlike savings
              accounts, checking accounts typically earn little to no interest because they're meant for active
              use rather than long-term saving.
            </p>
            <p className="mt-5 font-medium text-slate-700 font-manrope">
              Think of it as your daily spending wallet that lives at the bank.
            </p>
          </div>
        </div>

        {/* CTAs (centered) */}
        <div className="mt-12 flex justify-center">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href="/lesson/lesson1/lesson1.2"
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold bg-sky-700 text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors font-manrope"
            >
              Back to Definitions
            </Link>
            <Link
              href="/lesson"
              className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors font-manrope"
            >
              Back to Modules
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
