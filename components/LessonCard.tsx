import Link from "next/link";

interface LessonCardProps {
  title: string;
  category: string;
  imageUrl: string;
  progress: number;
  href?: string; // NEW
}

export default function LessonCard({
  title,
  category,
  imageUrl,
  progress,
  href, // NEW
}: LessonCardProps) {
  const card = (
    <div className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-all relative">
      {/* image */}
      <img src={imageUrl} alt={title} className="w-full h-[160px] object-cover" />

      {/* category pill */}
      <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-full text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {category}
      </span>

      {/* content */}
      <div className="p-4">
        <div className="font-medium text-gray-900">{title}</div>
        {/* progress */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full relative">
          <div
            className="absolute left-0 top-0 h-2 bg-[#04456d] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );

  // If href is provided, make the whole card a link
  return href ? (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[#04456d] rounded-2xl">
      {card}
    </Link>
  ) : (
    card
  );
}
