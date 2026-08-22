import { Link } from "react-router-dom";
import { getDestinationImage } from "@/lib/imageFetcher";

interface DetailedTripCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  destinationsCount: number;
  destinationsSample: string;
  budget?: number;
  travelersCount: number;
  progress?: number;
  startsInDays?: number;
  completedOn?: string;
  status: "ongoing" | "upcoming" | "completed";
  coverPath?: string;
}

const STATUS_CONFIG = {
  ongoing:   { label: "Ongoing",   bg: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  upcoming:  { label: "Upcoming",  bg: "bg-orange-500",  pill: "bg-orange-50 text-orange-700 border-orange-200"   },
  completed: { label: "Completed", bg: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 border-blue-200"         },
};

export default function DetailedTripCard({
  id, name, startDate, endDate, location,
  destinationsCount, destinationsSample, budget,
  travelersCount, progress, startsInDays, completedOn, status, coverPath,
}: DetailedTripCardProps) {
  const rawCoverPath = coverPath === "null" ? null : coverPath;
  const imgUrl = rawCoverPath || getDestinationImage(name);
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col md:flex-row">

      {/* -- Left: Image Panel ------------------------------------------- */}
      <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0 overflow-hidden">
        <img
          src={imgUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status pill */}
        <div className="absolute top-3 left-3">
          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase tracking-wider border " + cfg.pill}>
            <span className={"w-1.5 h-1.5 rounded-full " + cfg.bg} />
            {cfg.label}
          </span>
        </div>

        {/* Kebab */}
        <div className="absolute top-3 right-3">
          <button className="w-7 h-7 rounded-lg bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Trip name + dates over image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-extrabold text-white drop-shadow leading-tight truncate">{name}</h3>
          <p className="text-[11px] text-white/80 mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {startDate} – {endDate}
          </p>
          <p className="text-[11px] text-white/70 flex items-center gap-1 mt-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </p>
        </div>
      </div>

      {/* -- Right: Details Panel ----------------------------------------- */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        {/* Info columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

          {/* Destinations */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Destinations</p>
              <p className="text-sm font-extrabold text-slate-900">{destinationsCount}</p>
              <p className="text-[10px] text-slate-400 truncate">{destinationsSample}</p>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-0.5">{status === "completed" ? "Total Spent" : "Budget"}</p>
              <p className="text-sm font-extrabold text-slate-900">${budget?.toLocaleString() || "N/A"}</p>
              <p className="text-[10px] text-slate-400">Total</p>
            </div>
          </div>

          {/* Travelers */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Travelers</p>
              <p className="text-sm font-extrabold text-slate-900">{travelersCount}</p>
              <p className="text-[10px] text-slate-400">{travelersCount === 1 ? "Person" : "People"}</p>
            </div>
          </div>

          {/* Dynamic Status Column */}
          <div className="flex items-start gap-3">
            {status === "ongoing" && (
              <>
                <div className="w-9 h-9 flex-shrink-0 relative">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                      strokeDasharray={`${progress} ${100 - (progress || 0)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-emerald-700">{progress}%</span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">Progress</p>
                  <p className="text-sm font-extrabold text-slate-900">{progress}%</p>
                  <p className="text-[10px] text-slate-400">Completed</p>
                </div>
              </>
            )}
            {status === "upcoming" && (
              <>
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">Starts in</p>
                  <p className="text-sm font-extrabold text-slate-900">{startsInDays}</p>
                  <p className="text-[10px] text-slate-400">Days</p>
                </div>
              </>
            )}
            {status === "completed" && (
              <>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">Completed on</p>
                  <p className="text-sm font-extrabold text-slate-900 truncate">{completedOn}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Divider + Action Row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {/* Budget progress bar */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {status === "completed" ? "Trip archived" : "Itinerary available"}
          </div>
          <Link
            to={`/itinerary/${id}`}
            className={"px-5 py-2 rounded-xl text-sm font-bold transition-all " + (status === "ongoing" ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20" : "border border-blue-200 text-blue-600 hover:bg-blue-50")}
          >
            View Trip ?
          </Link>
        </div>
      </div>
    </div>
  );
}
