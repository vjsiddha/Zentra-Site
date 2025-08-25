import Link from 'next/link';

export default function Lesson1_3Page() {
  return (
    <main className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4 font-manrope">
          Next Definition Card
        </h1>
        <p className="text-slate-600 mb-8 font-manrope">
          This is a placeholder for the next definition card.
        </p>
        <Link
          href="/lesson/lesson1/lesson1.2"
          className="inline-flex items-center rounded-full px-5 py-2 font-semibold bg-sky-700 text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors font-manrope"
        >
          Back to Definitions
        </Link>
      </div>
    </main>
  );
}
