export default function HeroCard() {
  return (
    <div className="w-full rounded-3xl p-10 bg-gradient-to-r from-[#0E5B87] to-[#0F6CAB] flex items-center justify-between text-white">
      {/* Left Content */}
      <div className="flex flex-col gap-6 flex-1">
        <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
          Hi Ibnat, Keep it up! You're<br />doing great!
        </h1>
        <button className="flex items-center gap-3 px-5 py-3 bg-white/20 border border-white/30 rounded-full text-white font-medium text-sm hover:opacity-80 transition-all backdrop-blur-sm w-fit">
          <span>Continue your lesson</span>
          <i className="ti ti-arrow-right"></i>
        </button>
      </div>
      
      {/* Right Avatar Badge */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative">
          {/* Main Avatar Circle */}
          <div className="w-[120px] h-[120px] bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-white">
                  <path d="M20 4C21.1 4 22 4.9 22 6V8C22 9.1 21.1 10 20 10S18 9.1 18 8V6C18 4.9 18.9 4 20 4ZM32 18C33.1 18 34 18.9 34 20S33.1 22 32 22H30C28.9 22 28 21.1 28 20S28.9 18 30 18H32ZM12 20C12 18.9 11.1 18 10 18H8C6.9 18 6 18.9 6 20S6.9 22 8 22H10C11.1 22 12 21.1 12 20ZM20 28C21.1 28 22 28.9 22 30V32C22 33.1 21.1 34 20 34S18 33.1 18 32V30C18 28.9 18.9 28 20 28Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Level Info */}
        <div className="text-center">
          <div className="font-bold text-lg mb-1">Level 9</div>
          <div className="text-xs text-white/80 max-w-[140px] leading-relaxed">
            Complete Two More Modules And Unlock Equity Elephant
          </div>
        </div>
      </div>
    </div>
  )
}
