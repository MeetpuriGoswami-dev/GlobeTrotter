import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Dummy suggestions based on mockup
const SUGGESTIONS = [
  { id: '1', name: 'Banff National Park', desc: 'Stunning alpine views and turquoise lakes.', tag: 'Nature', img: 'https://images.unsplash.com/photo-1544605652-9b2f6ef866eb?q=80&w=600&auto=format&fit=crop' },
  { id: '2', name: 'Ubud, Bali', desc: 'Cultural hub with art, rice terraces, and wellness.', tag: 'Culture', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop' },
  { id: '3', name: 'Santorini, Greece', desc: 'Iconic sunsets and breathtaking views.', tag: 'Beach', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop' },
  { id: '4', name: 'Maasai Mara, Kenya', desc: 'Experience wildlife like never before.', tag: 'Adventure', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600&auto=format&fit=crop' },
  { id: '5', name: 'Iceland', desc: 'Chase the Northern Lights and explore glaciers.', tag: 'Nature', img: 'https://images.unsplash.com/photo-1520638023432-6831d102e3dc?q=80&w=600&auto=format&fit=crop' },
];

export default function NewTrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    customDestination: '',
    startDate: '',
    endDate: '',
    travelers: '1',
    description: '',
    budget: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    setError('');

    const finalDestination = formData.destination === 'Other' – formData.customDestination : formData.destination;

    if (!finalDestination.trim()) {
      setError('Please provide a destination.');
      setIsLoading(false);
      return;
    }

    try {
      // 0. Ensure the profile row exists (upsert is safe and idempotent)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id }, { onConflict: 'id' });
      
      if (profileError) throw profileError;

      // 1. Create the trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          start_date: formData.startDate,
          end_date: formData.endDate,
          travelers_count: parseInt(formData.travelers) || 1,
          visibility: 'private',
          budget_amount: parseFloat(formData.budget) || 0,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // Navigate to the new trip's itinerary
      navigate(`/itinerary/${tripData.id}`);
    } catch (err: any) {
      console.error('Error creating trip:', err);
      setError(err.message || 'Failed to create trip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative w-full h-[240px] rounded-3xl overflow-hidden shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop" 
          alt="Plan a New Trip" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Plan a New Trip</h1>
          <p className="text-white/90 text-lg">Let's start planning your next adventure.</p>
        </div>
      </div>

      {/* Trip Details Form */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Trip Details</h2>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter a name for your trip" 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Destination</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <select 
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700"
                  >
                    <option value="" disabled>Select a popular destination...</option>
                    <option value="Paris, France">Paris, France</option>
                    <option value="Tokyo, Japan">Tokyo, Japan</option>
                    <option value="New York, USA">New York, USA</option>
                    <option value="Rome, Italy">Rome, Italy</option>
                    <option value="Bali, Indonesia">Bali, Indonesia</option>
                    <option value="London, UK">London, UK</option>
                    <option value="Dubai, UAE">Dubai, UAE</option>
                    <option value="Sydney, Australia">Sydney, Australia</option>
                    <option value="Kyoto, Japan">Kyoto, Japan</option>
                    <option value="Santorini, Greece">Santorini, Greece</option>
                    <option value="Other" className="font-bold text-blue-600">Other (Type your own)</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </div>
              </div>

              {formData.destination === 'Other' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Destination</label>
                  <input 
                    type="text"
                    name="customDestination"
                    value={formData.customDestination}
                    onChange={handleChange}
                    required={formData.destination === 'Other'}
                    placeholder="Enter your custom location..."
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input 
                type="date" 
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input 
                type="date" 
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                min={formData.startDate}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Travelers</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </span>
                <select 
                  name="travelers"
                  value={formData.travelers}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700"
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} {num === 1 – 'Person' : 'People'}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Description (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-4 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
              </span>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your trip, plans, or anything important..."
                rows={4}
                maxLength={500}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              ></textarea>
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                {formData.description.length}/500
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading – 'Creating...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>

      {/* Suggestions Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Suggestions for Places to Visit / Activities to Perform</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {SUGGESTIONS.map(suggestion => (
            <div key={suggestion.id} className="border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-shadow bg-white flex flex-col h-full cursor-pointer">
              <div className="relative h-32 overflow-hidden">
                <img src={suggestion.img} alt={suggestion.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{suggestion.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 flex-grow">{suggestion.desc}</p>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase tracking-wide">
                    {suggestion.tag}
                  </span>
                  <button className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
