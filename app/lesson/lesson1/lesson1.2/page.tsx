import Link from 'next/link';
import Image from 'next/image';

export default function DefinitionsPage() {
  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
        
        {/* Close button - top right */}
        <Link 
          href="/lesson"
          className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#04456d] focus:ring-offset-2"
          aria-label="Close"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path 
              d="M12 4L4 12M4 4L12 12" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* Heading block at top, left-aligned */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-manrope mb-4">
            Let's start with some definitions...
          </h1>
          <p className="text-slate-500 font-manrope">
            Explore key saving terms with interactive flashcards. Tap or swipe to reveal definitions and filter by category to focus your learning.
          </p>
        </div>

        {/* Two-column grid with fixed left width */}
        <div className="grid grid-cols-[420px,1fr] gap-10 mt-8">
          
          {/* Left column (image + button) */}
          <div className="flex flex-col">
            {/* Image frame */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-sm mb-6">
              <img
                src="https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&auto=format&fit=crop"
                alt="Pink piggy bank with coins representing savings"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Next Card button */}
            <Link
              href="/lesson/lesson1/lesson1.3"
              className="inline-flex items-center rounded-full px-5 py-2 font-semibold bg-sky-700 text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors font-manrope w-fit"
            >
              Next Card
            </Link>
          </div>

          {/* Right column (definition text) */}
          <div className="flex flex-col justify-center">
            {/* Title */}
            <h2 className="text-2xl font-semibold text-slate-900 mb-2 font-manrope">
              Savings Account
            </h2>
            
            {/* Definition paragraph */}
            <p className="text-slate-700 font-manrope leading-6 mb-4">
              A savings account is a safe place to keep your money at a bank or credit union. When you put money into a savings account, the bank pays you a small amount of extra money called interest just for keeping your money there. You can take your money out when you need it, but it's mainly meant for saving rather than spending.
            </p>
            
            {/* Analogy line */}
            <p className="text-slate-700 font-medium mt-4 font-manrope">
              Think of it like a piggy bank that pays you back a little bit for using it.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}
