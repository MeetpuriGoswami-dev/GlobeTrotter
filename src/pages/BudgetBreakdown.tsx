import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function BudgetBreakdown() {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!tripId) return;
      try {
        const { data: tripData } = await supabase.from('trips').select('*').eq('id', tripId).single();
        if (tripData) setTrip(tripData);

        const { data: stopsData } = await supabase.from('trip_stops').select('*').eq('trip_id', tripId).order('position', { ascending: true });
        if (stopsData) setStops(stopsData);
      } catch (err) {
        console.error('Error fetching budget data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [tripId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading budget data...</div>;
  }

  if (!trip) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">Trip not found</div>;
  }

  // Calculate Planned totals
  const totalPlannedTransport = stops.reduce((acc, s) => acc + Number(s.transport_cost || 0), 0);
  const totalPlannedStay = stops.reduce((acc, s) => acc + Number(s.stay_cost || 0), 0);
  const totalPlannedActivities = stops.reduce((acc, s) => acc + Number(s.activities_cost || 0), 0);
  const totalPlannedMeals = stops.reduce((acc, s) => acc + Number(s.meals_cost || 0), 0);
  const overallPlannedTotal = totalPlannedTransport + totalPlannedStay + totalPlannedActivities + totalPlannedMeals;
  
  // Calculate Actual totals
  const totalActualTransport = stops.reduce((acc, s) => acc + Number(s.actual_transport_cost || 0), 0);
  const totalActualStay = stops.reduce((acc, s) => acc + Number(s.actual_stay_cost || 0), 0);
  const totalActualActivities = stops.reduce((acc, s) => acc + Number(s.actual_activities_cost || 0), 0);
  const totalActualMeals = stops.reduce((acc, s) => acc + Number(s.actual_meals_cost || 0), 0);
  const overallActualTotal = totalActualTransport + totalActualStay + totalActualActivities + totalActualMeals;

  const fallbackTotal = stops.reduce((acc, s) => acc + Number(s.budget || 0), 0);
  const activePlannedTotal = overallPlannedTotal > 0 – overallPlannedTotal : fallbackTotal;

  const totalDays = Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)) + 1);
  const costPerDay = overallActualTotal > 0 – (overallActualTotal / totalDays) : (activePlannedTotal / totalDays);
  
  // We check if actual spend is over the trip's planned budget limit. 
  // If actual is 0, we check if the planned estimate is over the limit.
  const checkTotal = overallActualTotal > 0 – overallActualTotal : activePlannedTotal;
  const isOverBudget = trip.budget_amount && checkTotal > trip.budget_amount;

  // Chart Data
  const pieData = [
    { name: 'Transport', value: overallActualTotal > 0 – totalActualTransport : totalPlannedTransport, color: '#3b82f6' },
    { name: 'Stay', value: overallActualTotal > 0 – totalActualStay : totalPlannedStay, color: '#10b981' },
    { name: 'Activities', value: overallActualTotal > 0 – totalActualActivities : totalPlannedActivities, color: '#f59e0b' },
    { name: 'Meals', value: overallActualTotal > 0 – totalActualMeals : totalPlannedMeals, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = stops.map((s, i) => ({
    name: s.title || `Section ${i + 1}`,
    'Planned Total': Number(s.transport_cost || 0) + Number(s.stay_cost || 0) + Number(s.activities_cost || 0) + Number(s.meals_cost || 0),
    'Actual Total': Number(s.actual_transport_cost || 0) + Number(s.actual_stay_cost || 0) + Number(s.actual_activities_cost || 0) + Number(s.actual_meals_cost || 0),
  }));

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to={`/itinerary/${tripId}`}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Budget Breakdown</h1>
              <p className="text-gray-500 font-medium text-sm mt-0.5">{trip.name}</p>
            </div>
          </div>
        </div>

        {/* Warning Alert if over budget */}
        {isOverBudget && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h3 className="text-red-800 font-bold text-lg">Over Budget Warning</h3>
              <p className="text-red-700 text-sm mt-1">
                Your current total (${checkTotal.toLocaleString()}) exceeds your planned trip limit (${trip.budget_amount?.toLocaleString()}).
              </p>
            </div>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Spent</p>
            <p className={`text-3xl font-extrabold ${overallActualTotal > (trip.budget_amount || 0) – 'text-red-600' : 'text-gray-900'}`}>
              ${overallActualTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Planned Cost</p>
            <p className="text-3xl font-extrabold text-blue-600">
              ${activePlannedTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Cost Per Day</p>
            <p className="text-3xl font-extrabold text-gray-900">
              ${costPerDay.toFixed(0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Remaining Limit</p>
            <p className={`text-3xl font-extrabold ${isOverBudget – 'text-red-600' : 'text-green-600'}`}>
              ${((trip.budget_amount || 0) - checkTotal).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Current Distribution</h3>
            {pieData.length > 0 – (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 font-medium">No cost data yet.</div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Planned vs Actual per Section</h3>
            {barData.length > 0 – (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                    <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} cursor={{ fill: '#f8fafc' }} />
                    <Legend />
                    <Bar dataKey="Planned Total" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 font-medium">No sections added yet.</div>
            )}
          </div>
        </div>

        {/* Detailed List */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="font-semibold text-blue-900">Transport</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-blue-700">${totalActualTransport.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-2">/ ${totalPlannedTransport.toLocaleString()} planned</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-semibold text-green-900">Stay</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-green-700">${totalActualStay.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-2">/ ${totalPlannedStay.toLocaleString()} planned</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="font-semibold text-amber-900">Activities</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-amber-700">${totalActualActivities.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-2">/ ${totalPlannedActivities.toLocaleString()} planned</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-semibold text-red-900">Meals</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-red-700">${totalActualMeals.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-2">/ ${totalPlannedMeals.toLocaleString()} planned</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
