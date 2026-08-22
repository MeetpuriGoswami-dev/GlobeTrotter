import { Link } from 'react-router-dom';

interface TripCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destinationsCount: number;
  coverPath?: string;
}

export default function TripCard({ id, name, startDate, endDate, destinationsCount, coverPath }: TripCardProps) {
  // Mock image if coverPath is not provided
  const imgUrl = coverPath || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop`;
  
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-64">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imgUrl} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>

      {/* Top section: Dates and Options */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {startDate} - {endDate}
        </div>
        
        <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="flex-grow"></div>

      {/* Bottom section: Info and Action */}
      <div className="relative z-10 p-4 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
          <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {destinationsCount} {destinationsCount === 1 ? 'City' : 'Cities'}
          </div>
        </div>
        
        <Link 
          to={`/trips/${id}`} 
          className="px-4 py-2 rounded-lg border border-white/40 text-white font-medium text-sm hover:bg-white hover:text-gray-900 transition-colors backdrop-blur-sm"
        >
          View Trip
        </Link>
      </div>
    </div>
  );
}
