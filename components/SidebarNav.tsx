"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  onProfileClick?: () => void;
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string; // tabler icon class, e.g. "ti ti-home"
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 px-4 py-3 rounded-lg transition",
        active
          ? "bg-gray-50 text-[#04456d] font-semibold"
          : "hover:bg-gray-50 text-gray-700",
      ].join(" ")}
    >
      <i
        className={`ti ${icon} text-lg ${
          active ? "text-[#04456d]" : "text-gray-500"
        }`}
      />
      <span className="text-sm">{label}</span>
    </Link>
  );
}

export default function SidebarNav({ onProfileClick }: SidebarNavProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-8 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#04456d] rounded-md flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <span className="font-bold text-lg text-[#04456d]">ZENTRA</span>
      </div>

      {/* Overview */}
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          OVERVIEW
        </div>

        <div className="space-y-1">
          <NavItem href="/" icon="ti-home" label="Dashboard" />
          <NavItem href="/module" icon="ti-book" label="Lesson" />
          <NavItem href="/simulator" icon="ti-device-desktop" label="Simulator" />
        </div>
      </div>

      {/* Settings pinned to bottom */}
      <div className="mt-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          SETTINGS
        </div>

        <div className="space-y-1">
          {/* Profile button */}
          <button
            type="button"
            onClick={onProfileClick}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-700 transition hover:bg-gray-50"
          >
            <i className="ti ti-user text-lg text-gray-500" />
            <span className="text-sm">Profile</span>
          </button>

          <NavItem href="/settings" icon="ti-settings" label="Settings" />

          {/* Logout placeholder */}
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-red-500 transition cursor-pointer">
            <i className="ti ti-logout text-lg text-red-500" />
            <span className="text-sm">Logout</span>
          </a>
        </div>
      </div>
    </div>
  );
}
