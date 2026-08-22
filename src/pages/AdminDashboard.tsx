import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalSpent: 0,
    publicTrips: 0,
  });

  const [popularCities, setPopularCities] = useState<{city: string, count: number}[]>([]);
  const [popularActivities, setPopularActivities] = useState<{category: string, count: number}[]>([]);
  
  const [users, setUsers] = useState<any[]>([]);
  const [userTrips, setUserTrips] = useState<Record<string, any[]>>({});
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setIsLoading(true);

        // Fetch Users
        const { data: usersData, error: usersErr } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (usersErr) throw usersErr;
        setUsers(usersData || []);

        // Fetch Trips
        const { data: tripsData, error: tripsErr } = await supabase.from('trips').select('*, profiles(name)');
        if (tripsErr) throw tripsErr;
        const allTrips = tripsData || [];

        // Fetch Stops
        const { data: stopsData, error: stopsErr } = await supabase.from('trip_stops').select('*');
        if (stopsErr) throw stopsErr;
        const allStops = stopsData || [];

        // Compute KPIs
        const totalBudget = allTrips.reduce((acc, trip) => acc + (Number(trip.budget_amount) || 0), 0);
        const publicTripsCount = allTrips.filter(t => t.is_public).length;
        
        setStats({
          totalUsers: usersData?.length || 0,
          totalTrips: allTrips.length,
          totalSpent: totalBudget,
          publicTrips: publicTripsCount,
        });

        // Compute Popular Cities (by Trip Destination)
        const cityCounts: Record<string, number> = {};
        allTrips.forEach(trip => {
          if (trip.destination) {
            const city = trip.destination.split(',')[0].trim(); // Just take the city part
            cityCounts[city] = (cityCounts[city] || 0) + 1;
          }
        });
        const sortedCities = Object.entries(cityCounts)
          .map(([city, count]) => ({ city, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setPopularCities(sortedCities);

        // Compute Popular Activities (by Stop Category)
        const categoryCounts: Record<string, number> = {};
        allStops.forEach(stop => {
          if (stop.category) {
            const cat = stop.category.charAt(0).toUpperCase() + stop.category.slice(1);
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          }
        });
        const sortedActivities = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setPopularActivities(sortedActivities);

        // Group trips by user for the Manage Users section
        const tripsByUser: Record<string, any[]> = {};
        allTrips.forEach(trip => {
          if (!tripsByUser[trip.user_id]) tripsByUser[trip.user_id] = [];
          tripsByUser[trip.user_id].push(trip);
        });
        setUserTrips(tripsByUser);

      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. KPIs Section */}
      <section>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium mb-1">Total Users</p>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium mb-1">Total Trips Planned</p>
            <p className="text-3xl font-extrabold text-blue-600">{stats.totalTrips}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium mb-1">Total Budget Planned</p>
            <p className="text-3xl font-extrabold text-green-600">${stats.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <p className="text-slate-500 font-medium mb-1">Public Trips</p>
            <p className="text-3xl font-extrabold text-purple-600">{stats.publicTrips}</p>
          </div>
        </div>
      </section>

      {/* 2. User Trend Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Trending Cities</h3>
          </div>
          {popularCities.length > 0 ? (
            <div className="space-y-4">
              {popularCities.map((city, idx) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold w-4">{idx + 1}.</span>
                    <span className="font-semibold text-slate-700">{city.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{city.count} trips</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${(city.count / stats.totalTrips) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic text-sm">No destination data available yet.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Popular Activities</h3>
          </div>
          {popularActivities.length > 0 ? (
            <div className="space-y-4">
              {popularActivities.map((activity, idx) => (
                <div key={activity.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-bold w-4">{idx + 1}.</span>
                    <span className="font-semibold text-slate-700">{activity.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{activity.count} stops</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic text-sm">No activity data available yet.</p>
          )}
        </section>
      </div>

      {/* 3. Manage Users Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Manage Users</h3>
          <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wide">
            {users.length} Total Registered
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {users.map(user => {
            const trips = userTrips[user.id] || [];
            const isExpanded = expandedUser === user.id;

            return (
              <div key={user.id} className="group">
                <div 
                  onClick={() => toggleUserExpansion(user.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.is_admin ? 'bg-red-500' : 'bg-blue-500'}`}>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 flex items-center gap-2">
                        {user.name || 'Anonymous User'}
                        {user.is_admin && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Admin</span>}
                      </p>
                      <p className="text-xs text-slate-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{trips.length} Trips</p>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Trips View */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-600 mb-3 ml-14">User's Trips ({trips.length})</h4>
                    {trips.length > 0 ? (
                      <div className="ml-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trips.map(trip => (
                          <div key={trip.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-slate-900 truncate" title={trip.name}>{trip.name}</h5>
                                {trip.is_public && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Public</span>}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{trip.destination}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                              <span className="text-xs font-medium text-slate-600">${trip.budget_amount} Budget</span>
                              <Link 
                                to={`/itinerary/${trip.id}`} 
                                className="text-xs font-bold text-blue-600 hover:underline"
                                target="_blank"
                              >
                                View ↗
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic ml-14">This user hasn't created any trips yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
