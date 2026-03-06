"use client";

import Link from "next/link";
import { addFavorite, removeFavorite } from "@/lib/favorites";
import { useState } from "react";

interface LessonCardProps {
  lessonId: string;
  uid?: string | null;
  isFavorited?: boolean;

  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  href?: string;
}

export default function LessonCard({
  lessonId,
  uid,
  isFavorited = false,
  title,
  category,
  imageUrl,
  progress,
  href,
}: LessonCardProps) {
  const [saving, setSaving] = useState(false);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault(); // prevents link navigation
    e.stopPropagation();

    if (!uid || saving) return;

    setSaving(true);

    try {
      if (isFavorited) {
        await removeFavorite(uid, lessonId);
      } else {
        await addFavorite(uid, lessonId);
      }
    } finally {
      setSaving(false);
    }
  }

  const Star = (
    <button
      onClick={toggleFavorite}
      disabled={!uid}
      className="
        absolute top-3 right-3
        w-9 h-9
        flex items-center justify-center
        rounded-full
        bg-white/90
        hover:bg-white
        transition
      "
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={isFavorited ? "#facc15" : "none"}
        stroke="#111827"
        strokeWidth="2"
      >
        <path d="M12 17.3l-6.2 3.7 1.7-7.1L2 9.2l7.3-.6L12 2l2.7 6.6 7.3.6-5.5 4.7 1.7 7.1z" />
      </svg>
    </button>
  );

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

        {/* ⭐ Favorite button */}
        {Star}
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