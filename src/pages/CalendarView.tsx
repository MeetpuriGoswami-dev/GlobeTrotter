import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Trip {
  id: string;
  name: string;
  destination?: string;
  description?: string;
  start_date: string;
  end_date: string;
  image_url?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateOnly(dateStr: string) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

function parseLocalDate(dateStr: string) {
  if (!dateStr) return new Date();
  const dOnly = toDateOnly(dateStr);
  const [y, m, d] = dOnly.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function getTripColor(trip: Trip, todayStr: string) {
  const end = toDateOnly(trip.end_date);
  const start = toDateOnly(trip.start_date);
  if (end < todayStr) return { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Completed' };
  if (start > todayStr) return { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Upcoming' };
  return { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500', label: 'Ongoing' };
}

export default function CalendarView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const todayStr = toDateOnly(now.toISOString());

  useEffect(() => {
    if (!user) return;

    const fetchTrips = async () => {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('id, name, description, start_date, end_date, image_url')
          .eq('owner_id', user.id)
          .order('start_date', { ascending: true });
        if (!error && data) {
          setTrips(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();

    const channel = supabase
      .channel('calendar-trips-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips', filter: `owner_id=eq.${user.id}` },
        () => { fetchTrips(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const getTripsForDay = (day: number) => {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return trips.filter(t => {
      const s = toDateOnly(t.start_date);
      const e = toDateOnly(t.end_date);
      return s <= dayStr && e >= dayStr;
    });
  };

  const tripsThisMonth = trips.filter(t => {
    const start = parseLocalDate(t.start_date);
    const end = parseLocalDate(t.end_date);
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  const selectedDayTrips = selectedDay ? getTripsForDay(selectedDay) : [];
  const upcomingTrips = trips.filter(t => toDateOnly(t.start_date) > todayStr).slice(0, 5);
  const ongoingTrips = trips.filter(t => toDateOnly(t.start_date) <= todayStr && toDateOnly(t.end_date) >= todayStr);

  return (
    <div className="pb-12 min-h-screen animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendar View</h1>
          <p className="text-slate-500 font-medium mt-1">All your planned and completed trips on a timeline</p>
        </div>
        <button
          onClick={() => navigate('/trips/new')}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Plan a Trip
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex items-center gap-6 mb-6">
        {[
          { dot: 'bg-violet-500', label: 'Ongoing' },
          { dot: 'bg-blue-500', label: 'Upcoming' },
          { dot: 'bg-emerald-500', label: 'Completed' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${item.dot}`} />
            <span className="text-sm font-semibold text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        {/* Calendar Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
            <button
              onClick={goToPrevMonth}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900">{MONTHS[currentMonth]} {currentYear}</h2>
            </div>
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 px-6 pt-4">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-widest py-3">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 px-6 pb-6 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 rounded-xl" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTrips = getTripsForDay(day);
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-24 rounded-2xl p-2 cursor-pointer relative transition-all duration-200 border-2 group flex flex-col justify-between
                    ${isSelected ? 'border-blue-500 bg-blue-50/60 shadow-md' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80'}
                    ${isToday && !isSelected ? 'bg-blue-600/5 border-blue-400' : ''}
                  `}
                >
                  <div className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors
                    ${isToday ? 'bg-blue-600 text-white shadow-md shadow-blue-400/30' : 'text-slate-700 group-hover:bg-slate-200/60'}
                    ${isSelected && !isToday ? 'bg-blue-200 text-blue-800' : ''}
                  `}>
                    {day}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayTrips.slice(0, 2).map(trip => {
                      const colors = getTripColor(trip, todayStr);
                      const displayName = trip.name || trip.destination || 'Trip';
                      return (
                        <div key={trip.id} className={`text-[10px] font-black px-2 py-0.5 rounded-md truncate border ${colors.light} ${colors.text} ${colors.border}`}>
                          {displayName}
                        </div>
                      );
                    })}
                    {dayTrips.length > 2 && (
                      <div className="text-[9px] font-extrabold text-slate-400 pl-1">+{dayTrips.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Details */}
          {selectedDay && (
            <div className="border-t border-slate-100 px-8 py-6 bg-slate-50/50">
              <h3 className="font-black text-slate-900 mb-4">
                {MONTHS[currentMonth]} {selectedDay}, {currentYear}
                <span className="ml-2 text-slate-400 font-semibold text-sm">
                  {selectedDayTrips.length === 0 ? '— No trips' : `— ${selectedDayTrips.length} trip${selectedDayTrips.length > 1 ? 's' : ''}`}
                </span>
              </h3>
              {selectedDayTrips.length === 0 ? (
                <p className="text-slate-400 font-medium text-sm">No trips scheduled for this day.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {selectedDayTrips.map(trip => {
                    const colors = getTripColor(trip, todayStr);
                    const displayName = trip.name || trip.destination || 'Trip';
                    return (
                      <button
                        key={trip.id}
                        onClick={() => navigate(`/itinerary/${trip.id}`)}
                        className={`flex items-center gap-3 px-4 py-3 ${colors.light} ${colors.border} border rounded-2xl hover:shadow-md transition-all text-left`}
                      >
                        <div className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0`} />
                        <div>
                          <p className={`font-black text-sm ${colors.text}`}>{displayName}</p>
                          <p className="text-slate-400 text-xs font-semibold">{toDateOnly(trip.start_date)} → {toDateOnly(trip.end_date)}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          {ongoingTrips.length > 0 && (
            <div className="bg-white rounded-[2rem] border border-violet-100 shadow-xl shadow-violet-100/40 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Happening Now</h3>
              </div>
              <div className="space-y-3">
                {ongoingTrips.map(trip => (
                  <button
                    key={trip.id}
                    onClick={() => navigate(`/itinerary/${trip.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-violet-50 hover:bg-violet-100/80 border border-violet-100 transition-all group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-200 flex-shrink-0 overflow-hidden">
                      {trip.image_url ? (
                        <img src={trip.image_url} className="w-full h-full object-cover" alt={trip.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-600 text-lg">✈️</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-slate-900 text-sm truncate">{trip.name || trip.destination}</p>
                      <p className="text-violet-600 text-xs font-bold">{toDateOnly(trip.start_date)} → {toDateOnly(trip.end_date)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4">This Month</h3>
            {isLoading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
            ) : tripsThisMonth.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🗓️</div>
                <p className="text-slate-400 font-semibold text-sm">No trips this month</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tripsThisMonth.map(trip => {
                  const colors = getTripColor(trip, todayStr);
                  return (
                    <button
                      key={trip.id}
                      onClick={() => navigate(`/itinerary/${trip.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all text-left"
                    >
                      <div className={`w-1.5 h-10 rounded-full ${colors.bg} flex-shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-900 text-sm truncate">{trip.name || trip.destination}</p>
                        <p className={`text-xs font-bold ${colors.text}`}>{colors.label} · {toDateOnly(trip.start_date)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-500/25">
            <h3 className="font-black text-white/80 text-xs uppercase tracking-wider mb-4">Trip Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-black">{trips.length}</p>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-wide mt-1">Total</p>
              </div>
              <div className="text-center border-x border-white/10">
                <p className="text-3xl font-black text-emerald-300">{trips.filter(t => toDateOnly(t.end_date) < todayStr).length}</p>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-wide mt-1">Done</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-blue-200">{trips.filter(t => toDateOnly(t.start_date) > todayStr).length}</p>
                <p className="text-white/60 text-[11px] font-bold uppercase tracking-wide mt-1">Ahead</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
