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

  // Calculate totals
  const totalTransport = stops.reduce((acc, s) => acc + Number(s.transport_cost || 0), 0);
  const totalStay = stops.reduce((acc, s) => acc + Number(s.stay_cost || 0), 0);
  const totalActivities = stops.reduce((acc, s) => acc + Number(s.activities_cost || 0), 0);
  const totalMeals = stops.reduce((acc, s) => acc + Number(s.meals_cost || 0), 0);
  const overallTotal = totalTransport + totalStay + totalActivities + totalMeals;
  
  // Fallback to budget if detailed costs aren't filled
  const fallbackTotal = stops.reduce((acc, s) => acc + Number(s.budget || 0), 0);
  const actualTotal = overallTotal > 0 ? overallTotal : fallbackTotal;

  const totalDays = Math.max(1, Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 3600 * 24)) + 1);
  const costPerDay = actualTotal / totalDays;
  const isOverBudget = trip.budget_amount && actualTotal > trip.budget_amount;

  // Chart Data
  const pieData = [
    { name: 'Transport', value: totalTransport, color: '#3b82f6' },
    { name: 'Stay', value: totalStay, color: '#10b981' },
    { name: 'Activities', value: totalActivities, color: '#f59e0b' },
    { name: 'Meals', value: totalMeals, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const barData = stops.map((s, i) => ({
    name: s.title || `Section ${i + 1}`,
    Transport: Number(s.transport_cost || 0),
    Stay: Number(s.stay_cost || 0),
    Activities: Number(s.activities_cost || 0),
    Meals: Number(s.meals_cost || 0),
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
                Your estimated costs (${actualTotal.toLocaleString()}) exceed your planned trip budget (${trip.budget_amount?.toLocaleString()}). Consider revising your sections to stay within budget.
              </p>
            </div>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Estimated</p>
            <p className={`text-3xl font-extrabold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              ${actualTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Planned Budget</p>
            <p className="text-3xl font-extrabold text-blue-600">
              ${trip.budget_amount?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Cost Per Day</p>
            <p className="text-3xl font-extrabold text-gray-900">
              ${costPerDay.toFixed(0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Remaining</p>
            <p className={`text-3xl font-extrabold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${((trip.budget_amount || 0) - actualTotal).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Cost Distribution</h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 font-medium">
                No detailed cost data available. Fill in section budgets!
              </div>
            )}
          </div>

          {/* Detailed List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Category Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-semibold text-blue-900">Transport</span>
                </div>
                <span className="font-extrabold text-blue-700">${totalTransport.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-semibold text-green-900">Stay</span>
                </div>
                <span className="font-extrabold text-green-700">${totalStay.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="font-semibold text-amber-900">Activities</span>
                </div>
                <span className="font-extrabold text-amber-700">${totalActivities.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-semibold text-red-900">Meals</span>
                </div>
                <span className="font-extrabold text-red-700">${totalMeals.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart by Stop */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Costs per Section</h3>
          {stops.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <RechartsTooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} cursor={{fill: '#f8fafc'}} />
                  <Legend />
                  <Bar dataKey="Transport" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Stay" stackId="a" fill="#10b981" />
                  <Bar dataKey="Activities" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Meals" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-gray-400 font-medium text-center py-10">No sections added to this itinerary yet.</div>
          )}
        </div>

      </div>
    </div>
  );
}
