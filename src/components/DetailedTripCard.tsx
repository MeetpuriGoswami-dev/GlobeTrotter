import { Link } from 'react-router-dom';

interface DetailedTripCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  destinationsCount: number;
  destinationsSample: string;
  budget?: number;
  travelersCount: number;
  progress?: number; // for ongoing
  startsInDays?: number; // for upcoming
  completedOn?: string; // for completed
  status: 'ongoing' | 'upcoming' | 'completed';
  coverPath?: string;
}

export default function DetailedTripCard({
  id, name, startDate, endDate, location, 
  destinationsCount, destinationsSample, budget, 
  travelersCount, progress, startsInDays, completedOn, status, coverPath
}: DetailedTripCardProps) {
  const imgUrl = coverPath || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group">
      {/* Top Banner Area (Image) */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={imgUrl} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider
            ${status === 'ongoing' ? 'bg-[#10b981] text-white' : 
              status === 'upcoming' ? 'bg-[#f59e0b] text-white' : 
              'bg-white/90 text-[#10b981]'}`}
          >
            {status}
          </span>
        </div>

        <div className="absolute top-4 right-4">
          <button className="w-8 h-8 rounded-full bg-white text-gray-700 flex items-center justify-center hover:bg-gray-100 shadow-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <div className="absolute bottom-4 left-4">
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{name}</h3>
          <div className="flex items-center gap-4 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {startDate} - {endDate}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Details Area */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Destinations */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{destinationsCount} Destinations</p>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">{destinationsSample}</p>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{status === 'completed' ? 'Total Spent' : 'Budget'}</p>
            <p className="text-sm text-gray-600">${budget?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>

        {/* Travelers */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Travelers</p>
            <p className="text-sm text-gray-600">{travelersCount} {travelersCount === 1 ? 'Person' : 'People'}</p>
          </div>
        </div>

        {/* Dynamic Status / Actions */}
        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 mt-2 md:mt-0">
          <div className="flex items-center gap-3">
            {status === 'ongoing' && (
              <>
                <div className="w-10 h-10 rounded-full border-4 border-[#10b981]/20 flex items-center justify-center border-t-[#10b981]"></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Progress</p>
                  <p className="text-sm text-gray-600">{progress}%</p>
                </div>
              </>
            )}
            {status === 'upcoming' && (
              <>
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Starts in</p>
                  <p className="text-sm text-gray-600">{startsInDays} Days</p>
                </div>
              </>
            )}
            {status === 'completed' && (
              <>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-[#10b981]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Completed on</p>
                  <p className="text-sm text-gray-600">{completedOn}</p>
                </div>
              </>
            )}
          </div>
          
          <Link 
            to={`/itinerary/${id}`} 
            className="px-6 py-2.5 rounded-lg border border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
          >
            View Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
