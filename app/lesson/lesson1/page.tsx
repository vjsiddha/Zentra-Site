import Link from 'next/link';

export default function Lesson1Page() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
      {/* Full-width container with max-width constraint matching original lesson 1 layout */}
      <div className="relative w-full max-w-[1280px] h-[800px] flex items-center justify-center">
        
        {/* Close button - top right, matching original lesson page position */}
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

        {/* Main content container with max-width of 960px as shown in Figma */}
        <div className="flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 md:px-16">
          
          {/* Header Section */}
          <div className="w-full text-center mb-6">
            <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px] font-[Manrope]">
              What You'll Be Doing
            </h1>
          </div>

          {/* Three Cards Section */}
          <div className="w-full mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Learn Card */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/b42a595cd8175c529add2926598dc243377fd3b5?width=602"
                    alt="Brain illustration representing learning"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-[Manrope] mb-1">
                    Learn
                  </h3>
                  <p className="text-sm text-[#4F7D96] font-[Manrope] leading-[21px]">
                    Short real-world scenarios
                  </p>
                </div>
              </div>

              {/* Play Card */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/7b863fc5eb989f68940df15cc6534d68b5661112?width=602"
                    alt="Game controller representing interactive play"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-[Manrope] mb-1">
                    Play
                  </h3>
                  <p className="text-sm text-[#4F7D96] font-[Manrope] leading-[21px]">
                    Use interactive sliders and tools
                  </p>
                </div>
              </div>

              {/* Grow Card */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/38db942b02ece7acd293202635cd4b190bd84b22?width=602"
                    alt="Growth chart representing financial progress"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-[Manrope] mb-1">
                    Grow
                  </h3>
                  <p className="text-sm text-[#4F7D96] font-[Manrope] leading-[21px]">
                    Track your financial progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Paragraph */}
          <div className="w-full text-center mb-8">
            <p className="text-base text-[#0D171C] font-[Manrope] leading-6 max-w-4xl mx-auto">
              Each module is a real-world story—like getting your first paycheck or saving for school. Make decisions, get instant feedback, and earn Finance XP to unlock the next challenge.
            </p>
          </div>

          {/* CTA Button - Centered horizontally as requested */}
          <div className="w-full flex justify-center">
            <Link 
              href="/lesson/1/scenario"
              className="inline-flex items-center justify-center h-10 px-4 bg-[#04456D] text-white font-bold text-sm rounded-[20px] hover:bg-[#03374f] transition-colors focus:outline-none focus:ring-2 focus:ring-[#04456d] focus:ring-offset-2 font-[Manrope]"
            >
              Show Me the First Scenario
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
