import Link from 'next/link';

export default function Lesson1Page() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
      {/* Full-width container with max-width constraint */}
      <div className="relative w-full max-w-[1280px] h-[800px] flex items-center justify-center">
        
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

        {/* Main content container */}
        <div className="flex flex-col items-center justify-center max-w-[960px] mx-auto px-4">
          
          {/* Illustration */}
          <div className="w-full mb-8">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/9fc8555f0a6595697d3d67dbf3f13d045b0dba8e?width=1856"
              alt="Money journey illustration"
              className="w-full h-80 object-cover rounded-xl shadow-sm"
            />
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-bold text-[#0D171C] text-center mb-4 leading-[35px]">
            Start Your Money Journey
          </h2>

          {/* Supporting paragraph */}
          <p className="text-base text-[#0D171C] text-center mb-8 max-w-2xl leading-6">
            You're about to learn how to manage your money through real-life challenges. Each scenario is simple, fun, and interactive. No stress—just smart decisions.
          </p>

          {/* CTA Button */}
          <Link 
            href="/lesson/1/start"
            className="inline-flex items-center justify-center h-12 px-5 bg-[#04456D] text-white font-bold text-base rounded-3xl hover:bg-[#03374f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#04456d] focus:ring-offset-2"
          >
            Let's Get Started
          </Link>

        </div>
      </div>
    </div>
  );
}
