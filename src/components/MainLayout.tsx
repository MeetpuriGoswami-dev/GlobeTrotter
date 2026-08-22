import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, Search, Bell } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  // GlobeTrotter specific links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Trips', path: '/trips', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Calendar', path: '/calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Explore', path: '/explore', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { name: 'Community', path: '/community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 relative z-20 hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">GlobeTrotter</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path) || (link.name === 'Dashboard' && location.pathname === '/');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 " + (isActive ? 'text-blue-700 bg-blue-50/80 shadow-sm border border-blue-100/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')}
              >
                <svg 
                  className={"w-5 h-5 " + (isActive ? 'text-blue-600' : 'text-slate-400')} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
                </svg>
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Time to travel widget */}
        <div className="p-4 mt-auto">
          <div className="bg-blue-50 rounded-2xl p-5 text-center relative overflow-hidden border border-blue-100/50">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3 text-2xl shadow-inner">
              ✈️
            </div>
            <h4 className="font-bold text-slate-900 mb-1">Time to travel!</h4>
            <p className="text-xs text-slate-500 mb-4 px-1 leading-relaxed">
              Discover amazing places and make unforgettable memories.
            </p>
            <button className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              Explore Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content & Top Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0 relative z-50">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for trips, destinations, activities..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-8">
            <Link 
              to="/trips/new" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Plan a Trip
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative ml-2">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-200 shadow-sm">
                  {profile?.photo_path ? (
                    <img src={profile.photo_path} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                      <UserIcon size={18} />
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-700 leading-tight">
                    {profile?.name ? profile.name.split(' ')[0] : 'User'}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden py-2 animate-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-sm font-bold text-slate-900 truncate">{profile?.name || 'User'}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon size={16} className="text-slate-400" />
                        Profile Settings
                      </Link>
                      {profile?.is_admin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="py-1 border-t border-slate-50">
                      <button 
                        onClick={() => {
                          setShowMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={16} className="text-red-500" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-8">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
