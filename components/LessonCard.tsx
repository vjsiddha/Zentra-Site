"use client";

import Link from "next/link";

interface LessonCardProps {
  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  href?: string;
}

export default function LessonCard({
  title,
  category,
  imageUrl,
  progress,
  href,
}: LessonCardProps) {
  const CardContent = (
    <div
      className="
        bg-white rounded-2xl shadow overflow-hidden
        transition-all hover:shadow-md
        cursor-pointer
        h-full
      "
    >
      {/* Image */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          draggable={false}
          className="w-full h-[160px] object-cover select-none"
        />

        {/* Category pill */}
        <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-full text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="font-medium text-gray-900">{title}</div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#04456d] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  // If href is provided → wrap entire card in Link
  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#04456d]"
        aria-label={`Open ${title}`}
      >
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}
