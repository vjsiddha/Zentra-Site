export default function SidebarNav() {
  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-sm p-8 flex flex-col justify-between">
      {/* --- Top: Logo + Overview --- */}
      <div className="flex flex-col gap-8">
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
      </div>

      {/* --- Bottom: Settings + Logout --- */}
      <div className="pt-4 border-t border-gray-100">
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
  )
}
