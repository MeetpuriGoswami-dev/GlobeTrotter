import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import TripCard from '@/components/TripCard';

// Dummy data for top regional selections
const TOP_REGIONS = [
  { id: '1', name: 'Europe', destinationsCount: '50+', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=800&auto=format&fit=crop' },
  { id: '2', name: 'Asia', destinationsCount: '80+', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', bg: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop' },
  { id: '3', name: 'North America', destinationsCount: '60+', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', bg: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop' },
  { id: '4', name: 'Middle East', destinationsCount: '30+', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', bg: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=800&auto=format&fit=crop' },
  { id: '5', name: 'South America', destinationsCount: '40+', icon: 'M5 15l7-7 7 7', bg: 'https://images.unsplash.com/photo-1518182170546-076616fdcbca?q=80&w=800&auto=format&fit=crop' },
];

export default function Dashboard() {
  const [previousTrips, setPreviousTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        // Fetch completed trips (end_date < today)
        const today = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('owner_id', user.id)
          .lt('end_date', today)
          .order('end_date', { ascending: false })
          .limit(3);

        if (!error && data) {
          setPreviousTrips(data);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrips();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative w-full h-[320px] rounded-3xl overflow-hidden shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1682687982501-1e5898cb8e4b?q=80&w=1200&auto=format&fit=crop" 
          alt="Explore the World" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a6b]/80 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Explore the World, <br/>
            <span className="text-blue-200">Your Way</span>
          </h1>
          <p className="text-white/90 text-lg max-w-md mt-4">
            Plan unforgettable trips, discover amazing places, and create memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search for destinations, cities, activities..." 
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

      {/* Top Regional Selections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#3b82f6] rounded-full"></span>
            Top Regional Selections
          </h2>
          <button className="text-[#3b82f6] font-semibold text-sm hover:underline flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOP_REGIONS.map((region) => (
            <div key={region.id} className="relative h-32 rounded-xl overflow-hidden group cursor-pointer shadow-sm">
              <img src={region.bg} alt={region.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
              <div className="absolute inset-0 p-3 flex flex-col justify-between text-white">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={region.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-sm">{region.name}</h3>
                  <p className="text-xs text-white/80">{region.destinationsCount} Destinations</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#3b82f6] rounded-full"></span>
            Previous Trips
          </h2>
          <button className="text-[#3b82f6] font-semibold text-sm hover:underline flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>)}
          </div>
        ) : previousTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previousTrips.map(trip => (
              <TripCard 
                key={trip.id}
                id={trip.id}
                name={trip.name}
                startDate={new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                endDate={new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                destinationsCount={1} // Placeholder
                coverPath={trip.cover_path}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-300">
            <h3 className="text-gray-900 font-bold mb-2">No previous trips found</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't completed any trips yet.</p>
          </div>
        )}
      </div>

      {/* Plan a trip CTA */}
      <div className="fixed bottom-8 right-8 z-40">
        <a 
          href="/trips/new" 
          className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Plan a trip
        </a>
      </div>
    </div>
  );
}
