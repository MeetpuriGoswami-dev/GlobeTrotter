import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import DetailedTripCard from '@/components/DetailedTripCard';

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('owner_id', user.id)
          .order('start_date', { ascending: true });

        if (!error && data) {
          setTrips(data);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrips();
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const ongoingTrips = trips.filter(t => t.start_date <= today && t.end_date >= today);
  const upcomingTrips = trips.filter(t => t.start_date > today);
  const completedTrips = trips.filter(t => t.end_date < today);

  // Helper to calculate days until start
  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  // Helper to calculate progress percentage for ongoing trips
  const getProgress = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-10 pb-10">
      
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search for trips, destinations, activities..." 
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto px-2">
          <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Group by
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            Sort by
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No trips planned yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Ready to explore? Create your first itinerary and start planning your next great adventure.
          </p>
          <a href="/trips/new" className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
            Plan a trip
          </a>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Ongoing Section */}
          {ongoingTrips.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#3b82f6] rounded-full"></span>
                  Ongoing
                </h2>
                <button className="text-[#3b82f6] font-semibold text-sm hover:underline flex items-center gap-1">
                  View all <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                {ongoingTrips.map(trip => (
                  <DetailedTripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={formatDate(trip.start_date)}
                    endDate={formatDate(trip.end_date)}
                    location="Multi-city" // Normally derived from trip_stops
                    destinationsCount={1}
                    destinationsSample="Interlaken, Zermatt, Lucerne..."
                    budget={trip.budget_amount}
                    travelersCount={trip.travelers_count || 1}
                    progress={getProgress(trip.start_date, trip.end_date)}
                    status="ongoing"
                    coverPath={trip.image_url || trip.cover_path}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Section */}
          {upcomingTrips.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#3b82f6] rounded-full"></span>
                  Upcoming
                </h2>
                <button className="text-[#3b82f6] font-semibold text-sm hover:underline flex items-center gap-1">
                  View all <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                {upcomingTrips.map(trip => (
                  <DetailedTripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={formatDate(trip.start_date)}
                    endDate={formatDate(trip.end_date)}
                    location="Location TBA"
                    destinationsCount={1}
                    destinationsSample="Athens, Santorini, Mykonos..."
                    budget={trip.budget_amount}
                    travelersCount={trip.travelers_count || 1}
                    startsInDays={getDaysUntil(trip.start_date)}
                    status="upcoming"
                    coverPath={trip.image_url || trip.cover_path}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Completed Section */}
          {completedTrips.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#3b82f6] rounded-full"></span>
                  Completed
                </h2>
                <button className="text-[#3b82f6] font-semibold text-sm hover:underline flex items-center gap-1">
                  View all <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                {completedTrips.map(trip => (
                  <DetailedTripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={formatDate(trip.start_date)}
                    endDate={formatDate(trip.end_date)}
                    location="Location TBA"
                    destinationsCount={1}
                    destinationsSample="Tokyo, Kyoto, Osaka..."
                    budget={trip.budget_amount}
                    travelersCount={trip.travelers_count || 1}
                    completedOn={formatDate(trip.end_date)}
                    status="completed"
                    coverPath={trip.image_url || trip.cover_path}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      
      {/* Floating Action Button (if not empty state) */}
      {trips.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40">
          <a 
            href="/trips/new" 
            className="bg-[#3b82f6] hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
            title="Create New Trip"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
