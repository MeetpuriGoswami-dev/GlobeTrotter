interface TimelineEventProps {
  image: string;
  title: string;
  tag: string;
  tagColor?: string;
  tagBg?: string;
  location: string;
  time: string;
  price: number;
  isLast?: boolean;
}

export default function TimelineEvent({
  image,
  title,
  tag,
  tagColor = "text-blue-600",
  tagBg = "bg-blue-50",
  location,
  time,
  price,
  isLast = false
}: TimelineEventProps) {
  return (
    <div className="flex w-full mb-6 group">
      
      {/* Timeline Node & Line */}
      <div className="relative flex flex-col items-center mr-6">
        {/* The Circle */}
        <div className="w-4 h-4 rounded-full border-2 border-blue-600 bg-white z-10 flex-shrink-0 mt-8"></div>
        {/* The Line (don't show if it's the last item in a day, or handle it via parent) */}
        {!isLast && (
          <div className="w-[1px] bg-gray-200 flex-grow absolute top-12 bottom-[-24px]"></div>
        )}
        {/* Arrow (just below the card) */}
        {!isLast && (
           <div className="absolute -bottom-[12px] text-gray-400 z-10">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
           </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Event Card */}
        <div className="flex-1 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-4 flex gap-5">
          <div className="w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tagBg} ${tagColor}`}>
                {tag}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 font-medium mb-1.5">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {location}
            </div>
            <div className="flex items-center text-sm text-gray-500 font-medium">
              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {time}
            </div>
          </div>
        </div>

        {/* Price Card */}
        <div className="w-full md:w-48 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center p-6 flex-shrink-0">
          <div className="text-2xl font-extrabold text-gray-900">
            ${price}
          </div>
        </div>
      </div>

    </div>
  );
}
