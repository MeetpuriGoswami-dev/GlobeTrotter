import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const SECTION_IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=800&auto=format&fit=crop',
];

export default function SharedItinerary() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [owner, setOwner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!tripId) return;
      try {
        const { data: tripData } = await supabase
          .from('trips')
          .select('*')
          .eq('id', tripId)
          .eq('is_public', true)
          .single();

        if (tripData) {
          setTrip(tripData);
          
          // Try to get owner info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, photo_path')
            .eq('id', tripData.owner_id)
            .single();
          if (profileData) setOwner(profileData);

          const { data: stopsData } = await supabase
            .from('trip_stops')
            .select('*')
            .eq('trip_id', tripId)
            .order('position', { ascending: true });

          if (stopsData) setStops(stopsData);
        }
      } catch (err) {
        console.error('Error fetching public itinerary:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold text-gray-500">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found or Private</h1>
        <p className="text-gray-500 text-center max-w-sm mb-8">This itinerary doesn't exist or hasn't been made public by the owner.</p>
        <Link to="/login" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors">Go to GlobeTrotter</Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const totalDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)
  ) + 1;
  const coverImg = trip.cover_path || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Navbar Minimal */}
      <nav className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="18" stroke="#1a3a6b" strokeWidth="2.5" fill="none"/>
            <path d="M30 10 L36 6 L34 12 L30 10Z" fill="#1a3a6b"/>
          </svg>
          <span className="font-extrabold text-[#1a3a6b] text-xl tracking-tight hidden sm:block">GlobeTrotter</span>
        </div>
        <div className="flex gap-3">
          <Link to="/register" className="text-blue-600 font-bold hover:underline text-sm sm:text-base hidden sm:inline-block">Sign Up</Link>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-sm text-sm sm:text-base">Plan your own trip</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Cover */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-[32px] overflow-hidden mb-10 shadow-lg">
          <img src={coverImg} alt={trip.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8">
            {owner && (
              <div className="flex items-center gap-3 mb-4">
                {owner.photo_path – (
                  <img src={owner.photo_path} alt={owner.name} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-md" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white font-bold shadow-md">
                    {owner.name?.charAt(0) || 'T'}
                  </div>
                )}
                <span className="text-white font-medium text-sm drop-shadow-md">Curated by {owner.name || 'Traveler'}</span>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">{trip.name}</h1>
            <div className="flex items-center gap-4 text-white/90 text-sm font-medium flex-wrap">
              <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {totalDays} Days
              </span>
            </div>
          </div>
        </div>

        {trip.description && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About this trip</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{trip.description}</p>
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <span className="w-2 h-8 bg-blue-600 rounded-full inline-block"></span>
          Itinerary Schedule
        </h2>

        {stops.length === 0 – (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg">No stops have been added to this itinerary yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-200 ml-6 md:ml-10 space-y-12 pb-10">
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-white border-4 border-blue-600 flex items-center justify-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="h-40 relative">
                    <img src={SECTION_IMAGES[index % SECTION_IMAGES.length]} alt={stop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <p className="text-white/80 font-bold text-xs uppercase tracking-wider mb-1">
                        {formatDate(stop.arrival_date)} {stop.arrival_date !== stop.departure_date ? `- ${formatDate(stop.departure_date)}` : ''}
                      </p>
                      <h3 className="text-2xl font-extrabold text-white">{stop.title || `Stop ${index + 1}`}</h3>
                    </div>
                  </div>
                  
                  {(stop.description || stop.location?.city) && (
                    <div className="p-6">
                      {stop.location?.city && (
                        <div className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-sm font-semibold text-gray-700 mb-4">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {stop.location.city}
                        </div>
                      )}
                      {stop.description && (
                        <p className="text-gray-600 leading-relaxed">{stop.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
