import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

import { useAuth } from '@/contexts/AuthContext';
import { fetchDestinationImage, getDestinationImage } from '@/lib/imageFetcher';

const SECTION_IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?q=80&w=800&auto=format&fit=crop',
];

export default function ItineraryView() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const fetchData = async () => {
    if (!tripId) return;
    try {
      setIsLoading(true);
      const { data: tripData, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (tripErr) throw tripErr;
      
      let currentTrip = tripData;
      // Re-fetch if no image or if cached image is from Wikipedia (often returns maps/flags)
      if (!currentTrip.image_url || currentTrip.image_url.includes('wikipedia.org') || currentTrip.image_url.includes('wikimedia.org')) {
        const fetchedUrl = await fetchDestinationImage(currentTrip.name);
        if (fetchedUrl) {
          await supabase.from('trips').update({ image_url: fetchedUrl }).eq('id', tripId);
          currentTrip = { ...currentTrip, image_url: fetchedUrl };
        }
      }
      setTrip(currentTrip);

      const { data: stopsData, error: stopsErr } = await supabase
        .from('trip_stops')
        .select('*')
        .eq('trip_id', tripId)
        .order('position', { ascending: true });

      if (stopsErr) throw stopsErr;
      
      let currentStops = stopsData || [];
      const updatedStops = await Promise.all(currentStops.map(async (stop) => {
        // Re-fetch if no image, or if cached is from Wikipedia
        if (!stop.image_url || stop.image_url.includes('wikipedia.org') || stop.image_url.includes('wikimedia.org')) {
          const searchQuery = stop.location?.city || stop.title;
          if (searchQuery) {
            const img = await fetchDestinationImage(searchQuery);
            if (img) {
              await supabase.from('trip_stops').update({ image_url: img }).eq('id', stop.id);
              return { ...stop, image_url: img };
            }
          }
        }
        return stop;
      }));
      setStops(updatedStops);
    } catch (err) {
      console.error('Error fetching itinerary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tripId]);

  const handleDeleteTrip = async () => {
    if (!confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;
    const { error } = await supabase.from('trips').delete().eq('id', tripId);
    if (!error) navigate('/trips');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-2xl max-w-lg mx-auto my-10 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Trip not found</h2>
        <p className="text-gray-500 mb-6">This itinerary doesn't exist or you don't have permission to view it.</p>
        <Link to="/trips" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          Back to Trips
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const today = new Date().toISOString().split('T')[0];
  const status = trip.end_date < today ? 'completed' : trip.start_date <= today ? 'ongoing' : 'upcoming';
  const statusColors: Record<string, string> = {
    upcoming: 'bg-amber-100 text-amber-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  const totalDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)
  ) + 1;

  const totalBudget = stops.reduce((acc, s) => acc + (Number(s.budget) || 0), 0);
  const rawImageUrl = trip.image_url === 'null' ? null : trip.image_url;
  const rawCoverPath = trip.cover_path === 'null' ? null : trip.cover_path;
  const fallbackImg = getDestinationImage(trip.name);
  const coverImg = rawImageUrl || rawCoverPath || fallbackImg;

  return (
    <div className="pb-32 min-h-screen">

      {/* Hero Cover */}
      <div className="relative w-full h-64 rounded-3xl overflow-hidden mb-8 shadow-sm bg-gray-100">
        <img 
          src={coverImg} 
          alt={trip.name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        {/* Actions top-right */}
        <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
          <button
            onClick={async () => {
              const newStatus = !trip.is_public;
              const { error } = await supabase.from('trips').update({ is_public: newStatus }).eq('id', tripId);
              if (!error) setTrip({ ...trip, is_public: newStatus });
            }}
            className={`flex items-center gap-1.5 backdrop-blur-sm font-bold text-sm px-4 py-2 rounded-xl shadow transition-colors ${trip.is_public ? 'bg-indigo-500/90 hover:bg-indigo-600 text-white' : 'bg-gray-800/80 hover:bg-gray-900 text-gray-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {trip.is_public ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              )}
            </svg>
            {trip.is_public ? 'Public' : 'Private'}
          </button>

          {trip.is_public && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/shared/${tripId}`);
                alert('Public link copied to clipboard!');
              }}
              className="flex items-center gap-1.5 bg-blue-500/90 backdrop-blur-sm hover:bg-blue-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
          <Link
            to={`/itinerary/${tripId}/budget`}
            className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm hover:bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Budget
          </Link>
          <Link
            to={`/itinerary/${tripId}/edit`}
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-xl shadow transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Sections
          </Link>
          <button
            onClick={handleDeleteTrip}
            className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-xl shadow transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Trip
          </button>
        </div>

        {/* Trip Title */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl font-extrabold text-white drop-shadow-md mb-1">{trip.name}</h1>
          <div className="flex items-center gap-3 text-white/90 text-sm font-medium flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
            <span>•</span>
            <span>{totalDays} Day{totalDays !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {trip.travelers_count || 1} Traveler{(trip.travelers_count || 1) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Budget</p>
          <p className="text-2xl font-extrabold text-gray-900">${trip.budget_amount?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Sections</p>
          <p className="text-2xl font-extrabold text-gray-900">{stops.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Duration</p>
          <p className="text-2xl font-extrabold text-gray-900">{totalDays}D</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Est. Section Cost</p>
          <p className="text-2xl font-extrabold text-gray-900">${totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Trip Description */}
      {trip.description && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Trip Notes
          </h2>
          <p className="text-gray-600 leading-relaxed">{trip.description}</p>
        </div>
      )}

      {/* Itinerary Sections */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
          Itinerary Sections
        </h2>
        <Link
          to={`/itinerary/${tripId}/edit`}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Section
        </Link>
      </div>

      {stops.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No sections added yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start building your itinerary by adding sections — each section represents a stop or activity in your trip.</p>
          <Link
            to={`/itinerary/${tripId}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Build Itinerary
          </Link>
        </div>
      ) : (
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                {index + 1}
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow">
                {/* Section Image */}
                <div className="relative w-full h-40 flex-shrink-0 bg-gray-100">
                  <img
                    src={(stop.image_url === 'null' ? null : stop.image_url) || SECTION_IMAGES[index % SECTION_IMAGES.length]}
                    alt={stop.title || `Section ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SECTION_IMAGES[index % SECTION_IMAGES.length];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-gradient-to-r" />
                  <div className="absolute bottom-3 left-3 md:hidden">
                    <span className="text-white font-extrabold text-lg">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>


              {/* Section Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex w-10 h-10 rounded-full bg-blue-600 text-white font-extrabold text-lg items-center justify-center flex-shrink-0">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{stop.title || `Section ${index + 1}`}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(stop.arrival_date)}
                        </span>
                        <span>→</span>
                        <span>{formatDate(stop.departure_date)}</span>
                      </div>
                    </div>
                  </div>
                  {stop.budget && (
                    <div className="bg-blue-50 rounded-xl px-4 py-2 text-right flex-shrink-0">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Budget</p>
                      <p className="text-xl font-extrabold text-blue-700">${Number(stop.budget).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {stop.description && (
                  <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-3 mt-3">
                    {stop.description}
                  </p>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Summary Bar when sections exist */}
      {stops.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Trip Budget</p>
                <p className="text-xl font-extrabold text-gray-900">${trip.budget_amount?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Section Costs</p>
                <p className="text-xl font-extrabold text-blue-600">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
            <Link
              to={`/itinerary/${tripId}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors"
            >
              Edit Itinerary
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
