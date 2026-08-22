import React from 'react';

const LANDSCAPE_URL = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop';

// GlobeTrotter SVG logo mark
function LogoMark() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="18" stroke="#1a3a6b" strokeWidth="2.5" fill="none"/>
      <ellipse cx="22" cy="22" rx="8" ry="18" stroke="#1a3a6b" strokeWidth="2" fill="none"/>
      <line x1="4" y1="22" x2="40" y2="22" stroke="#1a3a6b" strokeWidth="2"/>
      <line x1="7" y1="13" x2="37" y2="13" stroke="#1a3a6b" strokeWidth="1.5"/>
      <line x1="7" y1="31" x2="37" y2="31" stroke="#1a3a6b" strokeWidth="1.5"/>
      {/* Airplane */}
      <path d="M30 10 L36 6 L34 12 L30 10Z" fill="#1a3a6b"/>
    </svg>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — landscape photo */}
      <div
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-10 overflow-hidden"
        style={{
          backgroundImage: `url(${LANDSCAPE_URL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <LogoMark />
          <div>
            <span className="text-white text-xl font-bold tracking-tight">GlobeTrotter</span>
            <p className="text-white/80 text-xs">Plan. Explore. Experience.</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-extrabold leading-tight mb-4">
            Your Journey,<br />Designed by You.
          </h1>
          <p className="text-white/85 text-base leading-relaxed max-w-sm">
            Plan multi-city trips, discover amazing destinations, and create memories that last a lifetime.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6 relative overflow-y-auto">
        {/* Decorative faint travel icons */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-8 right-8 text-[120px]">✈</div>
          <div className="absolute bottom-8 left-8 text-[80px]">🌍</div>
          <div className="absolute top-1/2 right-4 text-[60px]">🗺</div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
