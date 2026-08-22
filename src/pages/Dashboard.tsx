import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";

const TOP_REGIONS = [
  {
    name: "Europe",
    destinations: "50+ Destinations",
    img: "https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=800&auto=format&fit=crop",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    name: "Asia",
    destinations: "80+ Destinations",
    img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop",
    icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    name: "North America",
    destinations: "60+ Destinations",
    img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  {
    name: "Middle East",
    destinations: "30+ Destinations",
    img: "https://images.unsplash.com/photo-1531761535209-180857e963b9?q=80&w=800&auto=format&fit=crop",
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    name: "South America",
    destinations: "40+ Destinations",
    img: "https://images.unsplash.com/photo-1518182170546-076616fdcbca?q=80&w=800&auto=format&fit=crop",
    icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5",
  },
];

const TRIP_IMAGES: Record<string, string> = {
  default_0: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop",
  default_1: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop",
  default_2: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop",
};

export default function Dashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .eq("owner_id", user.id)
          .order("start_date", { ascending: false });
        if (!error && data) setTrips(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const previousTrips = trips.filter((t) => t.end_date < today);
  const upcomingTrips = trips.filter((t) => t.start_date > today);
  const ongoingTrips = trips.filter((t) => t.start_date <= today && t.end_date >= today);
  const allDisplayTrips = [...ongoingTrips, ...upcomingTrips, ...previousTrips];

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
  };

  return (
    <div className="pb-24">

      {/* -- HERO BANNER -- */}
      <div className="relative w-full h-[280px] rounded-2xl overflow-hidden mb-8 shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1400&auto=format&fit=crop"
          alt="Explore the World"
          className="w-full h-full object-cover"
        />
        {/* Very light overlay so the image stays vivid */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 drop-shadow-sm leading-tight">
            Explore the World,
          </h1>
          <p
            className="text-4xl md:text-5xl font-bold text-blue-700 drop-shadow-sm mt-1 italic"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Your Way&nbsp;?
          </p>
          <p className="mt-4 text-sm md:text-base text-slate-700 max-w-md drop-shadow-sm">
            Plan unforgettable trips, discover amazing places,<br />
            and create memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* -- SEARCH + FILTER BAR -- */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-10">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search for destinations, cities, activities..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-2 flex-shrink-0">
          {[
            { label: "Group by", chevron: true },
            { label: "Filter", chevron: false },
            { label: "Sort by", chevron: true },
          ].map((btn) => (
            <button
              key={btn.label}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors"
            >
              {btn.label}
              {btn.chevron && (
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* -- TOP REGIONAL SELECTIONS -- */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
            Top Regional Selections
          </h2>
          <Link to="/explore" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOP_REGIONS.map((region) => (
            <div
              key={region.name}
              className="relative h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={region.img}
                alt={region.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              {/* Icon badge */}
              <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={region.icon} />
                </svg>
              </div>

              {/* Label */}
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-bold text-sm leading-tight">{region.name}</p>
                <p className="text-xs text-white/80 mt-0.5">{region.destinations}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -- PREVIOUS / ALL TRIPS -- */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full inline-block" />
            Previous Trips
          </h2>
          <Link to="/trips" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        ) : allDisplayTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allDisplayTrips.slice(0, 6).map((trip, idx) => {
              const imgSrc = trip.image_url || trip.cover_path || TRIP_IMAGES[`default_${idx % 3}`];
              const isOngoing = trip.start_date <= today && trip.end_date >= today;
              const isUpcoming = trip.start_date > today;
              return (
                <div
                  key={trip.id}
                  className="relative h-56 rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img
                    src={imgSrc}
                    alt={trip.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top row: date + kebab */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateRange(trip.start_date, trip.end_date)}
                    </div>
                    <button className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Status badge for ongoing/upcoming */}
                  {(isOngoing || isUpcoming) && (
                    <div className="absolute top-12 left-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOngoing ? "bg-emerald-400 text-white" : "bg-orange-400 text-white"}`}>
                        {isOngoing ? "ONGOING" : "UPCOMING"}
                      </span>
                    </div>
                  )}

                  {/* Bottom: title + cities + view button */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div className="text-white">
                      <h4 className="font-bold text-base leading-tight drop-shadow">{trip.name}</h4>
                      <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {trip.destination || "Multiple Cities"}
                      </p>
                    </div>
                    <Link
                      to={`/itinerary/${trip.id}`}
                      className="bg-white text-slate-900 text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors shadow flex-shrink-0 ml-2"
                    >
                      View Trip
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 mb-2">No trips yet</h3>
            <p className="text-sm text-slate-500 mb-6">Start planning your first adventure!</p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Plan a Trip
            </Link>
          </div>
        )}
      </div>

      {/* -- FLOATING PLAN A TRIP BUTTON -- */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link
          to="/trips/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-xl shadow-blue-500/30 transition-all hover:scale-105"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Plan a trip
        </Link>
      </div>

    </div>
  );
}
