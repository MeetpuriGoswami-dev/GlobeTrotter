interface ActivityCardProps {
  id: string;
  image: string;
  imageCount: number;
  tag: string;
  title: string;
  location: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  price: number;
  onAdd?: () => void;
  isAdding?: boolean;
}

export default function ActivityCard({
  image, imageCount, tag, title, location, description, duration, difficulty, price, onAdd, isAdding
}: ActivityCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row group w-full max-w-6xl mx-auto h-auto md:h-52">
      
      {/* Left side: Image */}
      <div className="relative w-full md:w-[340px] h-48 md:h-full flex-shrink-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {imageCount}
        </div>
      </div>

      {/* Middle side: Details */}
      <div className="p-5 flex flex-col flex-grow min-w-0">
        <div className="mb-2">
          <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
            {tag}
          </span>
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 truncate">{title}</h3>
          <div className="flex items-center text-sm text-gray-600 font-medium">
            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="truncate">{location}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-auto pr-4">
          {description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 font-medium mt-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {duration}
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
            {difficulty}
          </div>
        </div>
      </div>

      {/* Right side: Price & Action */}
      <div className="p-5 flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 min-w-[200px] flex-shrink-0">
        <div className="text-left md:text-right">
          <div className="text-2xl font-extrabold text-gray-900">${price}</div>
          <div className="text-xs text-gray-500 font-medium">per person</div>
        </div>
        
        <div className="flex gap-2 w-full justify-end mt-4 md:mt-0">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          <button 
            onClick={onAdd}
            disabled={isAdding}
            className="flex-1 md:flex-none px-6 h-10 bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isAdding – (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Adding...
              </>
            ) : (
              'Add to Trip'
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
