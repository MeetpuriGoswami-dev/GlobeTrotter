import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DetailedTripCard from "@/components/DetailedTripCard";
import { Link } from "react-router-dom";

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("owner_id", user.id)
          .order("start_date", { ascending: true });
        if (!error && data) setTrips(data);
      } catch (err) {
        console.error("Error fetching trips:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const filtered = trips.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.destination || "").toLowerCase().includes(search.toLowerCase())
  );

  const ongoingTrips   = filtered.filter((t) => t.start_date <= today && t.end_date >= today);
  const upcomingTrips  = filtered.filter((t) => t.start_date > today);
  const completedTrips = filtered.filter((t) => t.end_date < today);

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getProgress = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end   = new Date(endStr).getTime();
    const now   = new Date().getTime();
    const total = end - start;
    const elapsed = now - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // -- Section heading component ----------------------------------------------
  const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">{count}</span>
      </div>
    </div>
  );

  // -- Empty state -------------------------------------------------------------
  const EmptyState = () => (
    <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 flex flex-col items-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No trips planned yet</h2>
      <p className="text-slate-500 mb-8 max-w-sm">Ready to explore? Create your first itinerary and start planning your next great adventure.</p>
      <Link to="/trips/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Plan a trip
      </Link>
    </div>
  );

  return (
    <div className="space-y-10 pb-24">

      {/* -- Page Title ------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Trips</h1>
          <p className="text-sm text-slate-500 mt-1">
            {trips.length > 0 ? `${trips.length} trip${trips.length > 1 ? "s" : ""} in total` : "Start planning your first adventure"}
          </p>
        </div>
        <Link
          to="/trips/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm shadow-blue-500/20 transition-colors text-sm self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Trip
        </Link>
      </div>

      {/* -- Search + Filter Bar ----------------------------------------------- */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search trips, destinations..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {["Group by", "Filter", "Sort by"].map((label) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
            >
              {label}
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* -- Stats Row --------------------------------------------------------- */}
      {trips.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ongoing", value: ongoingTrips.length, color: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
            { label: "Upcoming", value: upcomingTrips.length, color: "bg-orange-50 border-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
            { label: "Completed", value: completedTrips.length, color: "bg-blue-50 border-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className={"rounded-2xl p-5 border shadow-sm flex items-center gap-4 " + stat.color}>
              <span className={"w-3 h-3 rounded-full flex-shrink-0 " + stat.dot} />
              <div>
                <p className={"text-2xl font-extrabold " + stat.text}>{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* -- Content ----------------------------------------------------------- */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-12">

          {/* Ongoing */}
          {ongoingTrips.length > 0 && (
            <section>
              <SectionHeader title="Ongoing Trips" count={ongoingTrips.length} />
              <div className="space-y-4">
                {ongoingTrips.map((trip) => (
                  <DetailedTripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={formatDate(trip.start_date)}
                    endDate={formatDate(trip.end_date)}
                    location={trip.destination || "Multi-city"}
                    destinationsCount={1}
                    destinationsSample={trip.destination || "Multiple destinations"}
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

          {/* Upcoming */}
          {upcomingTrips.length > 0 && (
            <section>
              <SectionHeader title="Upcoming Trips" count={upcomingTrips.length} />
              <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                  <DetailedTripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={formatDate(trip.start_date)}
                    endDate={formatDate(trip.end_date)}
                    location={trip.destination || "Location TBA"}
                    destinationsCount={1}
                    destinationsSample={trip.destination || "Multiple destinations"}
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

          {/* Completed */}
          {completedTrips.length > 0 && (
            <section>
              <SectionHeader title="Completed Trips" count={completedTrips.length} />
              <div className="space-y-4">
                {completedTrips.map((trip) => (
                  <DetailedTripCard
                    key={trip.id}
                    id={trip.id}
                    name={trip.name}
                    startDate={formatDate(trip.start_date)}
                    endDate={formatDate(trip.end_date)}
                    location={trip.destination || "Location TBA"}
                    destinationsCount={1}
                    destinationsSample={trip.destination || "Multiple destinations"}
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

          {/* No search results */}
          {filtered.length === 0 && search && (
            <div className="text-center py-16 text-slate-500">
              <p className="font-semibold text-lg">No trips match "{search}"</p>
              <p className="text-sm mt-1">Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {/* -- Floating Action Button --------------------------------------------- */}
      {trips.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <Link
            to="/trips/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Trip
          </Link>
        </div>
      )}
    </div>
  );
}
