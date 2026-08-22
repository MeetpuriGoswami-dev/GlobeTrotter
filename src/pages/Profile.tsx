import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tripStats, setTripStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [formData, setFormData] = useState({ name: '', photo_path: '' });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) { setFormData({ name: profile.name || '', photo_path: profile.photo_path || '' }); }
        const today = new Date().toISOString().split('T')[0];
        const { data: trips } = await supabase.from('trips').select('id, start_date, end_date').eq('owner_id', user.id);
        if (trips) { setTripStats({ total: trips.length, upcoming: trips.filter((t: any) => t.start_date > today).length, completed: trips.filter((t: any) => t.end_date < today).length }); }
      } catch (err) { console.error(err); } finally { setIsLoading(false); }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, name: formData.name, photo_path: formData.photo_path }, { onConflict: 'id' });
      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) { alert('Failed to save: ' + err.message); } finally { setIsSaving(false); }
  };

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  if (isLoading) return (<div className='min-h-screen flex items-center justify-center'><div className='w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin' /></div>);

  const initials = formData.name ? formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : (user?.email?.[0].toUpperCase() || 'U');
  const COVER = 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80' + '&w=2000&auto=format&fit=crop';

  const statList = [
    { label: 'Total Trips', value: tripStats.total, color: 'text-slate-900', bg: 'bg-blue-50', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', ic: 'text-blue-500' },
    { label: 'Upcoming', value: tripStats.upcoming, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', ic: 'text-emerald-500' },
    { label: 'Completed', value: tripStats.completed, color: 'text-indigo-600', bg: 'bg-indigo-50', icon: 'M5 13l4 4L19 7', ic: 'text-indigo-500' },
  ];

  return (
    <div className='pb-24 min-h-screen'>
      <div className='relative w-full h-[300px] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group'>
        <img src={COVER} alt='Cover' className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000' />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-black/10' />
        <h1 className='absolute top-8 left-8 text-white font-black text-4xl tracking-tight z-10'>My Profile</h1>
      </div>

      <div className='max-w-5xl mx-auto px-4 sm:px-6 relative -mt-36 z-10 flex flex-col md:flex-row gap-8'>
        <div className='w-full md:w-[320px] flex-shrink-0 space-y-5'>
          <div className='bg-white/95 backdrop-blur-2xl rounded-[2rem] p-8 border border-white/60 shadow-2xl flex flex-col items-center text-center'>
            <div className='relative mb-5'>
              <div className='absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-md opacity-40' />
              <div className='relative w-28 h-28 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden'>
                {formData.photo_path ? (<img src={formData.photo_path} alt='Profile' className='w-full h-full object-cover' onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />) : (<span className='text-3xl font-black text-white'>{initials}</span>)}
              </div>
            </div>
            <h2 className='text-xl font-black text-slate-900'>{formData.name || 'Anonymous Traveler'}</h2>
            <p className='text-slate-400 text-sm mt-1 mb-4 font-medium'>{user?.email}</p>
            <div className='inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 font-black text-[10px] px-4 py-2 rounded-full uppercase tracking-widest border border-blue-100'>
              <svg className='w-3.5 h-3.5' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' /></svg>
              Verified Traveler
            </div>
          </div>

          {statList.map(stat => (
            <div key={stat.label} className='bg-white rounded-[1.75rem] p-5 border border-slate-100 shadow-lg flex items-center justify-between group hover:border-blue-100 transition-all'>
              <div>
                <p className='text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5'>{stat.label}</p>
                <p className={'text-3xl font-black tracking-tight ' + stat.color}>{stat.value}</p>
              </div>
              <div className={'w-12 h-12 rounded-2xl ' + stat.bg + ' flex items-center justify-center group-hover:scale-110 transition-transform'}>
                <svg className={'w-6 h-6 ' + stat.ic} fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d={stat.icon} /></svg>
              </div>
            </div>
          ))}
        </div>

        <div className='flex-1 space-y-6 min-w-0 mt-4 md:mt-0'>
          <div className='bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-10 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none' />
            <h3 className='text-2xl font-black text-slate-900 mb-8 flex items-center gap-4 relative z-10'>
              <div className='w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' /></svg>
              </div>
              Edit Personal Info
            </h3>
            <div className='space-y-5 relative z-10'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1'>Display Name</label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <svg className='w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /></svg>
                    </div>
                    <input type='text' value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} placeholder='Your full name' className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1'>Email Address</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                      <svg className='w-5 h-5 text-slate-300' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                    </div>
                    <input type='email' value={user?.email || ''} disabled className='w-full pl-12 pr-4 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-400 font-bold cursor-not-allowed' />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1'>Profile Photo URL</label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg className='w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>
                  </div>
                  <input type='text' value={formData.photo_path} onChange={e => setFormData(d => ({ ...d, photo_path: e.target.value }))} placeholder='Paste a direct image link here...' className='w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900' />
                </div>
                {formData.photo_path && (
                  <div className='flex items-center gap-3 mt-2 pl-1'>
                    <img src={formData.photo_path} alt='Preview' className='w-10 h-10 rounded-full object-cover border-2 border-slate-200' onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    <p className='text-xs text-slate-400 font-semibold'>Photo preview</p>
                  </div>
                )}
              </div>
              <div className='pt-4 flex justify-end'>
                <button onClick={handleSave} disabled={isSaving} className={(saveSuccess ? 'bg-emerald-500 shadow-emerald-500/30 ' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 disabled:opacity-60 ') + 'group relative overflow-hidden inline-flex items-center justify-center gap-2 font-black py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-sm tracking-widest text-white'}>
                  <div className='absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full' />
                  <span className='relative flex items-center gap-2'>
                    {saveSuccess ? (<><svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='3' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' /></svg>SAVED!</>) : isSaving ? (<><svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'><circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' /><path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' /></svg>SAVING...</>) : (<><svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' /></svg>SAVE CHANGES</>)}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-10 relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl opacity-40 translate-y-1/2 translate-x-1/3 pointer-events-none' />
            <h3 className='text-lg font-black text-slate-900 mb-5 relative z-10'>Account Management</h3>
            <div className='relative z-10'>
              <button onClick={handleSignOut} className='w-full flex items-center justify-between p-5 rounded-2xl border-2 border-rose-100 text-rose-600 font-black hover:bg-rose-50 hover:border-rose-200 transition-all group'>
                <span className='flex items-center gap-3'>
                  <div className='w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' /></svg>
                  </div>
                  <span className='text-sm'>Sign out of GlobeTrotter</span>
                </span>
                <svg className='w-5 h-5 opacity-40' fill='none' stroke='currentColor' strokeWidth='2.5' viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}