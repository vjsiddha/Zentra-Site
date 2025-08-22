interface LessonCardProps {
  title: string
  category: string
  imageUrl: string
  progress: number // 0-100
}

export default function LessonCard({ title, category, imageUrl, progress }: LessonCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all">
      {/* Image Section */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Category Tag */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-full text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {category}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-900 leading-relaxed mb-4">
          {title}
        </h3>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-200 rounded-full relative">
          <div 
            className="absolute top-0 left-0 h-full bg-[#0E5B87] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
