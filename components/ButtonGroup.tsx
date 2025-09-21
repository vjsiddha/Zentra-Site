// components/ButtonGroup.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

type Stage = { label: string; href: string };

type ButtonGroupProps = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Extra classes for the wrapper (e.g., mt-8) */
  className?: string;
  /** Layout: center (default) or left/right if you ever need it later */
  align?: "center" | "left" | "right";
  /** Optional: provide life stages to render chip buttons and drive the primary CTA */
  stages?: Stage[];
  /** Optional: show arrow icon in the primary CTA (useful for stages UX) */
  showArrow?: boolean;
};

export default function ButtonGroup({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className = "mt-8",
  align = "center",
  stages,
  showArrow = false,
}: ButtonGroupProps) {
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  const [selected, setSelected] = useState<Stage | null>(stages?.[0] ?? null);

  // Determine what the primary button should do
  const resolvedHref = selected?.href ?? primaryHref;
  const resolvedLabel = selected?.label ?? primaryLabel;

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Optional stage pills */}
      {stages?.length ? (
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {stages.map((s) => {
            const active = s.label === selected?.label;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => setSelected(s)}
                aria-pressed={active}
                className={[
                  "inline-flex items-center rounded-full border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-sky-400 bg-sky-50 text-sky-800 shadow-sm"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Buttons row */}
      <div className={`w-full flex flex-wrap items-center ${justify} gap-3`}>
        <Link
          href={resolvedHref}
          aria-label={stages?.length ? `Continue to ${resolvedLabel}` : undefined}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold bg-sky-700 text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {resolvedLabel}
          {showArrow && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="-mr-1"
            >
              <path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </Link>

        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center rounded-full px-6 py-3 font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-white"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
