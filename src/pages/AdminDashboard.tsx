import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    publicTrips: 0,
    totalStops: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: tripsCount } = await supabase.from('trips').select('*', { count: 'exact', head: true });
        const { count: publicTripsCount } = await supabase.from('trips').select('*', { count: 'exact', head: true }).eq('is_public', true);
        const { count: stopsCount } = await supabase.from('trip_stops').select('*', { count: 'exact', head: true });

        setStats({
          totalUsers: usersCount || 0,
          totalTrips: tripsCount || 0,
          publicTrips: publicTripsCount || 0,
          totalStops: stopsCount || 0,
        });

        const { data: latestUsers } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
        if (latestUsers) setUsers(latestUsers);

        const { data: latestTrips } = await supabase.from('trips').select('*, profiles(name)').order('created_at', { ascending: false }).limit(5);
        if (latestTrips) setTrips(latestTrips);

      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Admin / Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Users</h3>
            <p className="text-4xl font-extrabold text-blue-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Trips</h3>
            <p className="text-4xl font-extrabold text-green-600">{stats.totalTrips}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Public Trips</h3>
            <p className="text-4xl font-extrabold text-purple-600">{stats.publicTrips}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Stops</h3>
            <p className="text-4xl font-extrabold text-amber-600">{stats.totalStops}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Latest Users */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recently Registered Users</h3>
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name || 'Anonymous'}</p>
                      <p className="text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Trips */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recently Created Trips</h3>
            <div className="divide-y divide-gray-100">
              {trips.map((trip) => (
                <div key={trip.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{trip.name}</p>
                    <p className="text-sm text-gray-500">By {trip.profiles?.name || 'Unknown'} • {trip.is_public ? 'Public' : 'Private'}</p>
                  </div>
                  <Link to={`/itinerary/${trip.id}`} className="text-sm font-bold text-blue-600 hover:underline">View</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
