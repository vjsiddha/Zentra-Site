export default function Dashboard() {
  return (
    <div className="min-h-screen bg-white font-inter flex">
      {/* Sidebar */}
      <div className="w-[200px] lg:w-[200px] md:w-[180px] sm:hidden h-screen fixed left-0 top-0 bg-white p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 z-10 border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#04456d] rounded-md flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <span className="font-bold text-lg text-[#04456d]">ZENTRA</span>
        </div>

        {/* Overview Section */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            OVERVIEW
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 text-[#04456d] font-semibold cursor-pointer">
              <i className="ti ti-home text-lg"></i>
              <span className="text-sm">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer transition-all">
              <i className="ti ti-book text-lg text-gray-500"></i>
              <span className="text-sm font-medium">Lesson</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer transition-all">
              <i className="ti ti-library text-lg text-gray-500"></i>
              <span className="text-sm font-medium">Library</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer transition-all">
              <i className="ti ti-device-desktop text-lg text-gray-500"></i>
              <span className="text-sm font-medium">Simulator</span>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="mt-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            SETTINGS
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer transition-all">
              <i className="ti ti-settings text-lg text-gray-500"></i>
              <span className="text-sm font-medium">Settings</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-red-500 cursor-pointer transition-all">
              <i className="ti ti-logout text-lg text-red-500"></i>
              <span className="text-sm font-medium">Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#04456d] rounded flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          <span className="font-bold text-lg text-[#04456d]">ZENTRA</span>
        </div>
        <button className="p-2">
          <i className="ti ti-menu-2 text-gray-600 text-xl"></i>
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-0 sm:ml-[180px] lg:ml-[200px] flex-1 p-4 lg:p-8 pt-20 sm:pt-8">
        <div className="max-w-none lg:max-w-[888px]">
          {/* Hero Section */}
          <div className="w-full h-auto lg:h-40 p-4 lg:p-8 mb-6 lg:mb-8 rounded-[20px] bg-gradient-to-br from-[#04456d] to-[#0369a1] flex flex-col lg:flex-row items-center lg:justify-between relative overflow-hidden gap-4 lg:gap-0">
            <div className="flex flex-col gap-4 lg:gap-6 flex-1 text-center lg:text-left">
              <h1 className="font-bold text-xl lg:text-2xl text-white leading-tight">
                Hi Ibnat, Keep it up! You're doing great!
              </h1>
              <button className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-white/20 border border-white/30 rounded-xl text-white font-medium text-sm hover:bg-white/30 transition-all backdrop-blur-sm w-fit mx-auto lg:mx-0">
                <span>Continue your lesson</span>
                <i className="ti ti-arrow-right"></i>
              </button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 lg:w-[117px] h-20 lg:h-[119px] bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-12 lg:w-16 h-12 lg:h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ti ti-user text-white text-xl lg:text-2xl"></i>
                </div>
              </div>
              <div className="font-bold text-base lg:text-lg text-white">Level 9</div>
              <div className="text-xs text-white/80 text-center max-w-[140px] leading-relaxed">
                Complete Two More Modules And Unlock Equity Elephant
              </div>
            </div>
          </div>

          {/* Unlocked Avatars */}
          <div className="mb-8">
            <h2 className="font-bold text-base text-[#202020] mb-4">Unlocked Avatars</h2>
            <div className="flex gap-4 items-center">
              <div className="w-[74px] h-[74px] rounded-full bg-gray-100 flex items-center justify-center">
                <i className="ti ti-user text-gray-400 text-2xl"></i>
              </div>
              <div className="w-[74px] h-[74px] rounded-full bg-gray-100 flex items-center justify-center">
                <i className="ti ti-user text-gray-400 text-2xl"></i>
              </div>
              <div className="w-[74px] h-[74px] rounded-full bg-gray-100 flex items-center justify-center">
                <i className="ti ti-user text-gray-400 text-2xl"></i>
              </div>
              <div className="w-[74px] h-[74px] rounded-full bg-gray-100 flex items-center justify-center">
                <i className="ti ti-user text-gray-400 text-2xl"></i>
              </div>
            </div>
          </div>

          {/* Go Back To Your Favourites */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-[#202020] uppercase tracking-wider">
                Go Back To Your Favourites
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                  <i className="ti ti-chevron-left text-gray-500"></i>
                </button>
                <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                  <i className="ti ti-chevron-right text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all">
                <div className="h-40 bg-gray-100 relative">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SAVINGS
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#202020] leading-relaxed">
                    Lesson 1: Your Savings Matter
                  </h3>
                </div>
                <div className="h-1 bg-gray-200 mx-4 mb-4 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-3/4 bg-[#04456d] rounded-full"></div>
                </div>
              </div>
              
              <div className="w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all">
                <div className="h-40 bg-gray-100 relative">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SAVINGS
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#202020] leading-relaxed">
                    Lesson 7: Count Your Pennies
                  </h3>
                </div>
                <div className="h-1 bg-gray-200 mx-4 mb-4 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-1/2 bg-[#04456d] rounded-full"></div>
                </div>
              </div>

              <div className="w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all">
                <div className="h-40 bg-gray-100 relative">
                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    STOCKS
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#202020] leading-relaxed">
                    Lesson 4: Meme Or Money-Maker?
                  </h3>
                </div>
                <div className="h-1 bg-gray-200 mx-4 mb-4 rounded-full relative">
                  <div className="absolute top-0 left-0 h-full w-2/3 bg-[#04456d] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex gap-8 h-[400px]">
            {/* Chat Section */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="w-[267px] h-10 rounded-[22px] bg-[#04456d]/30 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#04456d]/40 transition-all">
                Have a question? Ask Benny!
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-3 justify-end">
                  <div className="bg-gray-100 rounded-l-2xl rounded-tr-2xl rounded-br-2xl px-4 py-3 max-w-[246px] text-black font-medium">
                    Hey! What does the term equity mean?
                  </div>
                </div>
                <div className="flex gap-3 items-end">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <i className="ti ti-robot text-blue-600"></i>
                  </div>
                  <div className="bg-blue-50 rounded-r-2xl rounded-tl-2xl rounded-bl-2xl px-4 py-3 max-w-[246px] text-black font-medium">
                    Hey Ibnat! Great question! Equity means....
                  </div>
                </div>
              </div>
              <button className="px-6 py-3 bg-[#04456d] text-white rounded-xl font-semibold text-sm hover:bg-[#04456d]/90 transition-all self-start">
                Ask Benny
              </button>
            </div>

            {/* Simulator Section */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="w-[267px] h-10 rounded-[22px] bg-[#04456d]/30 flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#04456d]/40 transition-all">
                Try the Simulator
              </div>
              <div className="w-[346px] h-[202px] rounded-[22px] bg-[#d0e9ff] p-6 flex flex-col justify-center items-center relative">
                <div className="text-center">
                  <div className="font-semibold text-base text-black mb-2">Portfolio Value</div>
                  <div className="font-medium text-2xl text-[#04456d] mb-2">$ 11,353.31</div>
                  <div className="absolute top-16 right-20 font-medium text-xs text-[#230503]">+ 6.33%</div>
                  <div className="absolute bottom-6 font-medium text-xs text-gray-400">Withdraw</div>
                </div>
              </div>
              <div className="flex w-[169px] h-[45px] px-3 py-2 items-center gap-3 rounded-[40px] bg-[#04456d] cursor-pointer hover:bg-[#04456d]/90 transition-all">
                <div className="text-white font-medium text-xs">Join Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Vocabulary */}
      <div className="fixed right-8 top-[73px] w-[216px] h-[434px] rounded-[40px] bg-[#73acdf]/27 p-6 z-10">
        <h2 className="font-bold text-base text-[#202020] text-center mb-6">Your Vocab</h2>
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex w-[140px] h-11 justify-center items-center rounded-lg bg-white shadow-sm mx-auto font-semibold text-xs text-[#202020]">
            Equity
          </div>
          <div className="flex w-[140px] h-11 justify-center items-center rounded-lg bg-white shadow-sm mx-auto font-semibold text-xs text-[#202020]">
            Stocks
          </div>
          <div className="flex w-[140px] h-11 justify-center items-center rounded-lg bg-white shadow-sm mx-auto font-semibold text-xs text-[#202020]">
            Wealth
          </div>
          <div className="flex w-[140px] h-11 justify-center items-center rounded-lg bg-white shadow-sm mx-auto font-semibold text-xs text-[#202020]">
            Wealth
          </div>
          <div className="flex w-[140px] h-11 justify-center items-center rounded-lg bg-white shadow-sm mx-auto font-semibold text-xs text-[#202020]">
            Wealth
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex w-[169px] h-[45px] px-3 py-2 items-center gap-3 rounded-[40px] bg-[#04456d] cursor-pointer hover:bg-[#04456d]/90 transition-all">
            <div className="text-white font-medium text-xs">Open Dictionary</div>
            <div className="w-5 h-5 flex-shrink-0">
              <svg viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path fillRule="evenodd" clipRule="evenodd" d="M11.8089 4.85276C12.1316 4.49472 12.6547 4.49472 12.9774 4.85276L17.9347 10.3537C18.2573 10.7117 18.2573 11.2922 17.9347 11.6503L12.9774 17.1512C12.6547 17.5093 12.1316 17.5093 11.8089 17.1512C11.4863 16.7932 11.4863 16.2127 11.8089 15.8547L15.3558 11.9188H2.47856C2.02225 11.9188 1.65234 11.5083 1.65234 11.002C1.65234 10.4957 2.02225 10.0852 2.47856 10.0852H15.3558L11.8089 6.14935C11.4863 5.7913 11.4863 5.2108 11.8089 4.85276Z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
