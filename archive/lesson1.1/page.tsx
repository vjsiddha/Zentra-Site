import ButtonGroup from "@/components/ButtonGroup";

export default function Lesson1Page() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
      <div className="relative w-full max-w-[1280px] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center max-w-[960px] mx-auto px-6 md:px-16">
          {/* Header */}
          <div className="w-full text-center mb-6">
            <h1 className="text-[28px] font-bold text-[#0D171C] leading-[35px] font-manrope">
              What You'll Be Doing
            </h1>
          </div>

          {/* Three Cards */}
          <div className="w-full mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* Learn */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/b42a595cd8175c529add2926598dc243377fd3b5?width=602"
                    alt="Brain illustration representing learning"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-manrope mb-1">Learn</h3>
                  <p className="text-sm text-[#4F7D96] font-manrope leading-[21px]">
                    Short real-world scenarios
                  </p>
                </div>
              </div>

              {/* Play */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/7b863fc5eb989f68940df15cc6534d68b5661112?width=602"
                    alt="Game controller representing interactive play"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-manrope mb-1">Play</h3>
                  <p className="text-sm text-[#4F7D96] font-manrope leading-[21px]">
                    Use interactive sliders and tools
                  </p>
                </div>
              </div>

              {/* Grow */}
              <div className="flex flex-col items-start">
                <div className="w-full h-[200px] md:h-[250px] lg:h-[301px] mb-3 rounded-xl overflow-hidden">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/38db942b02ece7acd293202635cd4b190bd84b22?width=602"
                    alt="Growth chart representing financial progress"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="w-full">
                  <h3 className="text-base font-medium text-[#0D171C] font-manrope mb-1">Grow</h3>
                  <p className="text-sm text-[#4F7D96] font-manrope leading-[21px]">
                    Track your financial progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="w-full text-center mb-8">
            <p className="text-base text-[#0D171C] font-manrope leading-6 max-w-4xl mx-auto">
              Each module is a real-world story—like getting your first paycheck or saving for
              school. Make decisions, get instant feedback, and earn Finance XP to unlock the next
              challenge.
            </p>
          </div>

          {/* Reusable buttons */}
          <ButtonGroup
            primaryHref="/lesson/lesson1/lesson1.2"
            primaryLabel="Show Me the First Scenario"
            secondaryHref="/lesson"
            secondaryLabel="Back to Modules"
          />
        </div>
      </div>
    </div>
  );
}
