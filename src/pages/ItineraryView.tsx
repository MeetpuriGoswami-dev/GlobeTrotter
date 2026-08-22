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
      <div className="text-center py-20 bg-white rounded-3xl max-w-lg mx-auto my-10 border border-slate-100 shadow-xl shadow-slate-200/40">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Trip not found</h2>
        <p className="text-slate-500 mb-8 px-6 leading-relaxed">This itinerary doesn't exist or you don't have permission to view it.</p>
        <Link to="/trips" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 inline-block">
          Back to Trips
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const today = new Date().toISOString().split('T')[0];
  const status = trip.end_date < today ? 'completed' : trip.start_date <= today ? 'ongoing' : 'upcoming';
  
  // Premium status badges
  const StatusBadge = () => {
    if (status === 'ongoing') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/90 backdrop-blur-md text-white shadow-lg shadow-emerald-500/20 border border-emerald-400">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-widest">Happening Now</span>
        </div>
      );
    }
    if (status === 'upcoming') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/90 backdrop-blur-md text-white shadow-lg shadow-blue-500/20 border border-blue-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-xs font-bold uppercase tracking-widest">Upcoming</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-md text-white shadow-lg border border-slate-700">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        <span className="text-xs font-bold uppercase tracking-widest">Completed</span>
      </div>
    );
  };

  const totalDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)
  ) + 1;

  const totalBudget = trip.budget_amount || stops.reduce((acc, s) => acc + (Number(s.budget) || 0), 0);
  
  const totalActualBudget = stops.reduce((acc, s) => {
    const actT = Number(s.actual_transport_cost) || 0;
    const actS = Number(s.actual_stay_cost) || 0;
    const actA = Number(s.actual_activities_cost) || 0;
    const actM = Number(s.actual_meals_cost) || 0;
    const customActs = (s.location?.custom_costs || []).reduce((sum: number, c: any) => sum + (Number(c.actual_cost) || 0), 0);
    return acc + actT + actS + actA + actM + customActs;
  }, 0);

  const rawImageUrl = trip.image_url === 'null' ? null : trip.image_url;
  const rawCoverPath = trip.cover_path === 'null' ? null : trip.cover_path;
  const fallbackImg = getDestinationImage(trip.name);
  const coverImg = rawImageUrl || rawCoverPath || fallbackImg;

  return (
    <div className="pb-32 min-h-screen animate-in fade-in duration-500">

      {/* Hero Cover - Immersive & Premium */}
      <div className="relative w-full h-[450px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl shadow-slate-200/50 group">
        <img 
          src={coverImg} 
          alt={trip.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-black/10" />

        {/* Status Badge */}
        <div className="absolute top-6 left-6 z-20">
          <StatusBadge />
        </div>

        {/* Actions top-right */}
        <div className="absolute top-6 right-6 flex flex-wrap gap-3 justify-end z-20">
          <button
            onClick={async () => {
              const newStatus = !trip.is_public;
              const { error } = await supabase.from('trips').update({ is_public: newStatus }).eq('id', tripId);
              if (!error) setTrip({ ...trip, is_public: newStatus });
            }}
            className={`group relative overflow-hidden flex items-center gap-2 backdrop-blur-md font-bold text-xs px-5 py-2.5 rounded-full shadow-lg transition-all hover:-translate-y-0.5 border ${trip.is_public ? 'bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400 text-white shadow-indigo-500/30' : 'bg-slate-900/70 hover:bg-slate-800 border-slate-600 text-white shadow-xl'}`}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                {trip.is_public – (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                )}
              </svg>
              {trip.is_public ? 'Public' : 'Private'}
            </span>
          </button>

          {trip.is_public && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/shared/${tripId}`);
                alert('Public link copied to clipboard!');
              }}
              className="group relative overflow-hidden flex items-center gap-2 bg-blue-500/90 backdrop-blur-md hover:bg-blue-400 border border-blue-400 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share
              </span>
            </button>
          )}
          <Link
            to={`/itinerary/${tripId}/budget`}
            className="group relative overflow-hidden flex items-center gap-2 bg-emerald-500/90 backdrop-blur-md hover:bg-emerald-400 border border-emerald-400 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Budget
            </span>
          </Link>
          <button
            onClick={handleDeleteTrip}
            className="group relative overflow-hidden flex items-center gap-2 bg-rose-500/90 backdrop-blur-md hover:bg-rose-400 border border-rose-400 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete
            </span>
          </button>
        </div>

        {/* Trip Title & Meta */}
        <div className="absolute bottom-10 left-10 right-10 z-20">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-xl mb-4 tracking-tight leading-none">{trip.name}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium text-sm md:text-base bg-black/20 backdrop-blur-md inline-flex px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {formatDate(trip.start_date)} <span className="text-white/50 px-1">?</span> {formatDate(trip.end_date)}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {totalDays} Day{totalDays !== 1 ? 's' : ''}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {trip.travelers_count || 1} Traveler{(trip.travelers_count || 1) > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded Floating Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-20 px-6 relative z-30 mb-12">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest">Estimation Budget</p>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">${totalBudget.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest">Total Sections</p>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{stops.length}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest">Total Duration</p>
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{totalDays}<span className="text-xl text-slate-400 ml-1">Days</span></p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest">Total Actual Budget</p>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 tracking-tight">${totalActualBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Trip Notes Box */}
      {trip.description && (
        <div className="px-6 mb-12">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/30">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
              </div>
              Trip Overview & Notes
            </h2>
            <p className="text-slate-600 leading-loose text-lg font-medium pl-14">{trip.description}</p>
          </div>
        </div>
      )}

      {/* Itinerary Sections Timeline */}
      <div className="px-6 max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="w-2 h-10 bg-blue-600 rounded-full inline-block"></span>
            Itinerary Journey
          </h2>
          <Link
            to={`/itinerary/${tripId}/edit`}
            className="group relative overflow-hidden flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add New Section
            </span>
          </Link>
        </div>

        {stops.length === 0 – (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <div className="w-24 h-24 bg-blue-50 border-8 border-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform hover:scale-110 duration-300">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No sections planned yet</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">Your adventure awaits! Start adding destinations, stays, and activities to build the perfect trip.</p>
            <Link
              to={`/itinerary/${tripId}/edit`}
              className="group relative overflow-hidden inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-10 rounded-full shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Start Building
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-[1.65rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[3px] before:bg-gradient-to-b before:from-blue-200 before:via-blue-100 before:to-transparent pt-4">
            {stops.map((stop, index) => (
              <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                
                {/* Timeline dot */}
                <div className="flex items-center justify-center w-14 h-14 rounded-full border-[6px] border-[#F8FAFC] bg-blue-600 text-white shadow-xl shadow-blue-600/30 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-lg transition-transform duration-300 group-hover:scale-110">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                
                {/* Section Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col md:flex-row w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 group-hover:border-blue-100">
                  
                  {/* Image side */}
                  <div className="relative w-full md:w-2/5 h-48 md:h-auto overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={(stop.image_url === 'null' ? null : stop.image_url) || SECTION_IMAGES[index % SECTION_IMAGES.length]}
                      alt={stop.title || `Section ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = SECTION_IMAGES[index % SECTION_IMAGES.length];
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent md:bg-gradient-to-r opacity-60" />
                    <div className="absolute bottom-4 left-4 md:hidden">
                       <span className="text-white font-black text-xl drop-shadow-md">
                         {(index + 1).toString().padStart(2, '0')}
                       </span>
                    </div>
                  </div>

                  {/* Content side */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center relative bg-white">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3 group-hover:text-blue-600 transition-colors">{stop.title || `Section ${index + 1}`}</h3>
                    
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500 mb-6 bg-slate-50 inline-flex px-4 py-2 rounded-xl border border-slate-100 w-fit">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formatDate(stop.arrival_date)} 
                      <span className="text-slate-300">?</span> 
                      {formatDate(stop.departure_date)}
                    </div>

                    {stop.budget && (
                      <div className="absolute top-6 right-6 text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Budget</p>
                        <p className="text-xl font-black text-blue-600">${Number(stop.budget).toLocaleString()}</p>
                      </div>
                    )}

                    {stop.description && (
                      <p className="text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-5 text-sm md:text-base">
                        {stop.description}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      {stops.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-12px_40px_rgba(0,0,0,0.06)] z-50 transform translate-y-0 transition-transform duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex gap-10 items-center">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Estimation Budget</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">${totalBudget.toLocaleString()}</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Actual Budget</p>
                <p className="text-2xl font-black text-blue-600 tracking-tight">${totalActualBudget.toLocaleString()}</p>
              </div>
            </div>
            <Link
              to={`/itinerary/${tripId}/edit`}
              className="group relative overflow-hidden flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-full shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-3 text-lg tracking-tight">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Itinerary
              </span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
