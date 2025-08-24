import Link from "next/link";
import Image from "next/image";

export default function Lesson1Page() {
  return (
    <div className="relative min-h-screen bg-[#F6F8FB] px-6 py-10">
      <main className="mx-auto w-full max-w-5xl">
        <section className="relative bg-white rounded-2xl shadow-sm p-8 md:p-10 pt-14">
          {/* Close button now above the image */}
          <Link
            href="/lesson"
            aria-label="Close and go back to lessons"
            className="
              absolute top-4 right-4
              inline-flex items-center justify-center
              w-9 h-9 rounded-full bg-gray-100 shadow
              text-gray-700 hover:bg-gray-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#04456d]
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>

          {/* Hero image */}
          <div className="relative aspect-[16/9] w-full mt-4 overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop"
              alt="Start your money journey"
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>

          {/* Title and description */}
          <h1 className="mt-8 text-3xl md:text-4xl font-extrabold tracking-tight text-[#0E3350] text-center">
            Start Your Money Journey
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed max-w-3xl mx-auto text-center">
            You’re about to learn how to manage your money through real-life challenges.
            Each scenario is simple, fun, and interactive. No stress—just smart decisions.
          </p>

          {/* Centered CTA */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/lesson/lesson1/step-1"
              className="
                inline-flex items-center justify-center
                px-6 py-3 rounded-full bg-[#0E5B87] text-white font-semibold
                hover:opacity-90 transition
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E5B87]
              "
            >
              Let’s Get Started
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
