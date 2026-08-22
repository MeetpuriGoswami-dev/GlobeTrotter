import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tripStats, setTripStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [formData, setFormData] = useState({
    name: '',
    language: 'en',
    photo_path: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData({
            name: profile.name || '',
            language: profile.language || 'en',
            photo_path: profile.photo_path || '',
          });
        }

        // Fetch trip stats
        const today = new Date().toISOString().split('T')[0];
        const { data: trips } = await supabase
          .from('trips')
          .select('id, start_date, end_date')
          .eq('owner_id', user.id);

        if (trips) {
          const total = trips.length;
          const upcoming = trips.filter(t => t.start_date > today).length;
          const completed = trips.filter(t => t.end_date < today).length;
          setTripStats({ total, upcoming, completed });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          language: formData.language,
          photo_path: formData.photo_path,
        }, { onConflict: 'id' });

      if (error) throw error;
      alert('Profile saved successfully!');
    } catch (err: any) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = formData.name
    ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="pb-12 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">My Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center overflow-hidden">
              {formData.photo_path ? (
                <img src={formData.photo_path} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-white">{initials}</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-14 pb-6 px-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">{formData.name || 'Anonymous Traveler'}</h2>
              <p className="text-gray-500 font-medium text-sm mt-0.5">{user?.email}</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full uppercase tracking-wide">Traveler</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-gray-900">{tripStats.total}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Total Trips</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-3xl font-extrabold text-amber-500">{tripStats.upcoming}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-green-600">{tripStats.completed}</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h3 className="text-lg font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Edit Profile
        </h3>

        <div className="space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 font-medium cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed from here.</p>
          </div>

          {/* Profile Photo URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo URL</label>
            <input
              type="text"
              value={formData.photo_path}
              onChange={e => setFormData(d => ({ ...d, photo_path: e.target.value }))}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900"
            />
            {formData.photo_path && (
              <div className="mt-3 flex items-center gap-3">
                <img src={formData.photo_path} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={e => (e.currentTarget.style.display = 'none')} />
                <p className="text-xs text-gray-500">Photo preview</p>
              </div>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Language</label>
            <select
              value={formData.language}
              onChange={e => setFormData(d => ({ ...d, language: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900 appearance-none bg-white"
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
              <option value="de">🇩🇪 German</option>
              <option value="ja">🇯🇵 Japanese</option>
              <option value="hi">🇮🇳 Hindi</option>
            </select>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 px-8 rounded-xl transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">Account</h3>
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out of GlobeTrotter
          </button>
        </div>
      </div>
    </div>
  );
}
