import { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, MoreHorizontal, Heart, MessageCircle, Bookmark, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

export default function Community() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicTrips() {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*, profiles(name, photo_path)')
          .eq('is_public', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setTrips(data || []);
      } catch (err) {
        console.error('Error fetching public trips:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPublicTrips();
  }, []);

  const getTagColor = (index: number) => {
    const colors = ['bg-blue-50 text-blue-600', 'bg-emerald-50 text-emerald-600', 'bg-rose-50 text-rose-600', 'bg-orange-50 text-orange-600', 'bg-purple-50 text-purple-600'];
    return colors[index % colors.length];
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours || 1}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Left Main Content */}
      <div className="flex-1 min-w-0">
        
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
              placeholder="Search for trips, places, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Group by
              <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              Sort by
              <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>

        {/* Feed Header */}
        <h2 className="text-2xl font-extrabold text-[#1a3a6b] mb-6">Community Tab</h2>

        {/* Posts Feed */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500 font-bold">Loading community trips...</div>
          ) : trips.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-bold">No public trips found yet!</div>
          ) : trips.map((trip, idx) => (
            <div key={trip.id} className="p-6 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <img src={trip.profiles?.photo_path || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop'} alt={trip.profiles?.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{trip.profiles?.name || 'Anonymous Explorer'}</span>
                      <span className="text-sm font-medium text-gray-400">{getTimeAgo(trip.created_at)}</span>
                    </div>
                    <Link to={`/shared/${trip.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors">
                      View Itinerary
                    </Link>
                  </div>
                  
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{trip.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{trip.description || 'Check out this amazing trip itinerary!'}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getTagColor(idx)}`}>
                      Trip
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${getTagColor(idx + 1)}`}>
                      {trip.currency} {trip.budget_amount?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-rose-500 font-semibold text-sm transition-colors group">
                      <Heart className="w-4 h-4 group-hover:fill-rose-500" />
                      {Math.floor(Math.random() * 50) + 1}
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 font-semibold text-sm transition-colors group">
                      <MessageCircle className="w-4 h-4 group-hover:fill-blue-500" />
                      {Math.floor(Math.random() * 20)}
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-sm transition-colors ml-2">
                      <Bookmark className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar Info */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-extrabold text-[#1a3a6b] mb-4">Community</h3>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-6 text-left">
            Community section where all the users can share their experience about a certain trip or activity.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed text-left">
            Using the search, grouping, filter and sorting option, the user can narrow down the results that he is looking for.
          </p>
        </div>
      </div>
      
    </div>
  );
}
