// components/ButtonGroup.tsx
import Link from "next/link";

type ButtonGroupProps = {
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** Extra classes for the wrapper (e.g., mt-8) */
  className?: string;
  /** Layout: center (default) or left/right if you ever need it later */
  align?: "center" | "left" | "right";
};

export default function ButtonGroup({
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className = "mt-8",
  align = "center",
}: ButtonGroupProps) {
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <div className={`w-full flex flex-wrap items-center ${justify} gap-3 ${className}`}>
      <Link
        href={primaryHref}
        className="inline-flex items-center rounded-full px-6 py-3 font-semibold bg-sky-700 text-white hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        {primaryLabel}
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
  );
}
