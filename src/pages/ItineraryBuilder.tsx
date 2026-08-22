import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Section {
  id?: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: string; // Keep as fallback/total if needed
  transport_cost?: string;
  stay_cost?: string;
  activities_cost?: string;
  meals_cost?: string;
  actual_transport_cost?: string;
  actual_stay_cost?: string;
  actual_activities_cost?: string;
  actual_meals_cost?: string;
  custom_costs?: { name: string; planned_cost: string; actual_cost: string }[];
  location?: any;
  position: number;
}

export default function ItineraryBuilder() {
  const navigate = useNavigate();
  const { id: tripId } = useParams<{ id: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  useEffect(() => {
    async function fetchTripStops() {
      if (!tripId) return;
      try {
        const { data, error } = await supabase
          .from('trip_stops')
          .select('*')
          .eq('trip_id', tripId)
          .order('position', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSections(data.map(stop => ({
            id: stop.id,
            title: stop.title || `Section ${stop.position + 1}`,
            description: stop.description || '',
            start_date: stop.arrival_date,
            end_date: stop.departure_date,
            budget: stop.budget – stop.budget.toString() : '',
            transport_cost: stop.transport_cost – stop.transport_cost.toString() : '',
            stay_cost: stop.stay_cost – stop.stay_cost.toString() : '',
            activities_cost: stop.activities_cost – stop.activities_cost.toString() : '',
            meals_cost: stop.meals_cost – stop.meals_cost.toString() : '',
            actual_transport_cost: stop.actual_transport_cost – stop.actual_transport_cost.toString() : '',
            actual_stay_cost: stop.actual_stay_cost – stop.actual_stay_cost.toString() : '',
            actual_activities_cost: stop.actual_activities_cost – stop.actual_activities_cost.toString() : '',
            actual_meals_cost: stop.actual_meals_cost – stop.actual_meals_cost.toString() : '',
            custom_costs: stop.location?.custom_costs || [],
            location: stop.location || null,
            position: stop.position
          })));
        } else {
          // Default empty state with one section
          setSections([{
            title: 'Section 1',
            description: 'All the necessary information about this section.',
            start_date: '',
            end_date: '',
            budget: '',
            transport_cost: '',
            stay_cost: '',
            activities_cost: '',
            meals_cost: '',
            actual_transport_cost: '',
            actual_stay_cost: '',
            actual_activities_cost: '',
            actual_meals_cost: '',
            custom_costs: [],
            position: 0
          }]);
        }
      } catch (err) {
        console.error('Error fetching trip stops:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTripStops();
  }, [tripId]);

  const addSection = () => {
    const newSection: Section = {
      title: `Section ${sections.length + 1}`,
      description: '',
      start_date: '',
      end_date: '',
      budget: '',
      transport_cost: '',
      stay_cost: '',
      activities_cost: '',
      meals_cost: '',
      actual_transport_cost: '',
      actual_stay_cost: '',
      actual_activities_cost: '',
      actual_meals_cost: '',
      custom_costs: [],
      position: sections.length
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const addCustomCost = (index: number) => {
    const updated = [...sections];
    updated[index].custom_costs = [
      ...(updated[index].custom_costs || []),
      { name: '', planned_cost: '', actual_cost: '' }
    ];
    setSections(updated);
  };

  const updateCustomCost = (secIdx: number, costIdx: number, field: 'name' | 'planned_cost' | 'actual_cost', value: string) => {
    const updated = [...sections];
    const customCosts = [...(updated[secIdx].custom_costs || [])];
    customCosts[costIdx] = { ...customCosts[costIdx], [field]: value };
    updated[secIdx].custom_costs = customCosts;
    setSections(updated);
  };

  const removeCustomCost = (secIdx: number, costIdx: number) => {
    const updated = [...sections];
    const customCosts = [...(updated[secIdx].custom_costs || [])];
    customCosts.splice(costIdx, 1);
    updated[secIdx].custom_costs = customCosts;
    setSections(updated);
  };

  const handleSave = async () => {
    if (!tripId) return;
    setIsSaving(true);
    setSaveError('');
    
    try {
      // 1. Get existing stops to delete the ones that were removed
      const { data: existingStops } = await supabase
        .from('trip_stops')
        .select('id')
        .eq('trip_id', tripId);
        
      const currentIds = sections.map(s => s.id).filter(Boolean);
      const toDelete = existingStops?.filter(s => !currentIds.includes(s.id)).map(s => s.id) || [];
      
      if (toDelete.length > 0) {
        const { error: delErr } = await supabase.from('trip_stops').delete().in('id', toDelete);
        if (delErr) throw delErr;
      }
      
      // 2. Upsert sections
      let savedCount = 0;
      let tripTotalBudget = 0;
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        
        // Skip completely empty sections
        if (!sec.start_date || !sec.end_date) continue;
        
        // Calculate dynamic budget for this section based on inputs
        const secTransport = sec.transport_cost – parseFloat(sec.transport_cost) : 0;
        const secStay = sec.stay_cost – parseFloat(sec.stay_cost) : 0;
        const secActivities = sec.activities_cost – parseFloat(sec.activities_cost) : 0;
        const secMeals = sec.meals_cost – parseFloat(sec.meals_cost) : 0;
        const customPlanned = (sec.custom_costs || []).reduce((sum, cc) => sum + (parseFloat(cc.planned_cost) || 0), 0);
        const calcBudget = secTransport + secStay + secActivities + secMeals + customPlanned;
        const finalBudget = calcBudget > 0 – calcBudget : (sec.budget – parseFloat(sec.budget) : null);
        
        tripTotalBudget += finalBudget || 0;
        
        const payload: any = {
          trip_id: tripId,
          arrival_date: sec.start_date,
          departure_date: sec.end_date,
          position: i,
          title: sec.title || `Section ${i + 1}`,
          description: sec.description || '',
          budget: finalBudget,
          transport_cost: secTransport,
          stay_cost: secStay,
          activities_cost: secActivities,
          meals_cost: secMeals,
          actual_transport_cost: sec.actual_transport_cost – parseFloat(sec.actual_transport_cost) : 0,
          actual_stay_cost: sec.actual_stay_cost – parseFloat(sec.actual_stay_cost) : 0,
          actual_activities_cost: sec.actual_activities_cost – parseFloat(sec.actual_activities_cost) : 0,
          actual_meals_cost: sec.actual_meals_cost – parseFloat(sec.actual_meals_cost) : 0,
          location: {
            ...(sec.location || {}),
            custom_costs: sec.custom_costs || []
          },
        };

        if (sec.id) {
          const { error: upErr } = await supabase.from('trip_stops').update(payload).eq('id', sec.id);
          if (upErr) throw upErr;
        } else {
          const { error: insErr } = await supabase.from('trip_stops').insert(payload);
          if (insErr) throw insErr;
        }
        savedCount++;
      }
      
      // Update trip budget with the sum of all sections
      if (tripId) {
        await supabase.from('trips').update({ budget_amount: tripTotalBudget }).eq('id', tripId);
      }
      
      if (savedCount === 0 && sections.some(s => !s.start_date || !s.end_date)) {
        setSaveError('Please fill in the start and end dates for all sections before saving.');
        setIsSaving(false);
        return;
      }
      
      // Navigate to Itinerary View
      navigate(`/itinerary/${tripId}`);
    } catch (err: any) {
      console.error('Error saving sections:', err);
      const msg = err?.message || 'Unknown error';
      if (msg.includes('city_id') || msg.includes('null value') || msg.includes('violates not-null') || msg.includes('column "transport_cost"') || msg.includes('column "actual_activities_cost"')) {
        setSaveError('⚠️ Database setup needed! Please run this SQL in your Supabase dashboard (supabase.com → SQL Editor):\n\nALTER TABLE trip_stops ALTER COLUMN city_id DROP NOT NULL;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS title text;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS description text;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS budget numeric(10,2);\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS transport_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS stay_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS activities_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS meals_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS actual_transport_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS actual_stay_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS actual_activities_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS actual_meals_cost numeric(10,2) DEFAULT 0;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS location JSONB;\nALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS image_url text;\nALTER TABLE trips ADD COLUMN IF NOT EXISTS image_url text;\nALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;\nNOTIFY pgrst, \'reload schema\';');
      } else {
        setSaveError('Error: ' + msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex items-center gap-6 mb-10">
          <button 
            onClick={() => navigate(`/itinerary/${tripId}`)}
            className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Build Your Itinerary</h1>
            <p className="text-gray-500 font-medium mt-1">Add sections to plan your trip in detail</p>
          </div>
        </div>

        {/* Sections List */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 relative group/card">
              
              {/* Actions (Top Right) */}
              <div className="absolute top-6 right-6 flex gap-2">
                <button 
                  onClick={() => removeSection(index)}
                  className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              {/* Title & Description */}
              <div className="flex gap-4 pr-32 mb-8">
                {/* Badge */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_4px_10px_rgba(37,99,235,0.3)] text-white font-extrabold text-xl flex items-center justify-center flex-shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="flex-1 space-y-2">
                  <input 
                    type="text" 
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    className="text-xl font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none w-full"
                    placeholder="Section Title"
                  />
                  <textarea 
                    value={section.description}
                    onChange={(e) => updateSection(index, 'description', e.target.value)}
                    className="text-gray-500 font-medium text-sm leading-relaxed w-full bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="All the necessary information about this section..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Inputs */}
              <div className="ml-0 md:ml-[72px] space-y-6">
                
                {/* City / Location — Smart Combo-box */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">City / Location</label>

                  {/* Preset quick-select pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['Paris, France','Tokyo, Japan','New York, USA','Rome, Italy','Bali, Indonesia',
                      'London, UK','Barcelona, Spain','Dubai, UAE','Sydney, Australia','Bangkok, Thailand'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => updateSection(index, 'location', { ...section.location, city })}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          section.location?.city === city
                            – 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>

                  {/* Free-text custom input */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      value={section.location?.city || ''}
                      onChange={(e) => updateSection(index, 'location', { ...section.location, city: e.target.value })}
                      placeholder="Or type any custom city / place..."
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-medium text-gray-700"
                    />
                    {section.location?.city && (
                      <button
                        type="button"
                        onClick={() => updateSection(index, 'location', { ...section.location, city: '' })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {section.location?.city && (
                    <p className="text-xs text-blue-600 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Selected: <span className="font-bold">{section.location.city}</span>
                    </p>
                  )}
                </div>

                {/* Dates & Overall Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Date Range</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="date" 
                        value={section.start_date}
                        onChange={(e) => updateSection(index, 'start_date', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-medium text-gray-600"
                      />
                      <span className="text-gray-400 font-bold">—</span>
                      <input 
                        type="date" 
                        value={section.end_date}
                        onChange={(e) => updateSection(index, 'end_date', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-medium text-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Total Budget (Auto-calculated)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">$</span>
                      <input 
                        type="number" 
                        value={(Number(section.transport_cost || 0) + Number(section.stay_cost || 0) + Number(section.activities_cost || 0) + Number(section.meals_cost || 0)) || section.budget}
                        disabled
                        className="w-full pl-8 pr-16 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-bold"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-md">USD</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Budget Breakdown */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Cost Breakdown (Planned vs Actual)</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* Transport */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="block text-xs font-bold text-gray-700 mb-2">Transport</span>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Plan $</span>
                          <input type="number" value={section.transport_cost || ''} onChange={(e) => updateSection(index, 'transport_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-semibold">Actl $</span>
                          <input type="number" value={section.actual_transport_cost || ''} onChange={(e) => updateSection(index, 'actual_transport_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-rose-50 border border-rose-100 rounded text-sm focus:ring-2 focus:ring-rose-400 outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Stay */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="block text-xs font-bold text-gray-700 mb-2">Stay</span>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Plan $</span>
                          <input type="number" value={section.stay_cost || ''} onChange={(e) => updateSection(index, 'stay_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-semibold">Actl $</span>
                          <input type="number" value={section.actual_stay_cost || ''} onChange={(e) => updateSection(index, 'actual_stay_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-rose-50 border border-rose-100 rounded text-sm focus:ring-2 focus:ring-rose-400 outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="block text-xs font-bold text-gray-700 mb-2">Activities</span>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Plan $</span>
                          <input type="number" value={section.activities_cost || ''} onChange={(e) => updateSection(index, 'activities_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-semibold">Actl $</span>
                          <input type="number" value={section.actual_activities_cost || ''} onChange={(e) => updateSection(index, 'actual_activities_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-rose-50 border border-rose-100 rounded text-sm focus:ring-2 focus:ring-rose-400 outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="block text-xs font-bold text-gray-700 mb-2">Meals</span>
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Plan $</span>
                          <input type="number" value={section.meals_cost || ''} onChange={(e) => updateSection(index, 'meals_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-semibold">Actl $</span>
                          <input type="number" value={section.actual_meals_cost || ''} onChange={(e) => updateSection(index, 'actual_meals_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-rose-50 border border-rose-100 rounded text-sm focus:ring-2 focus:ring-rose-400 outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Custom Costs */}
                    {(section.custom_costs || []).map((custom: any, cIdx: number) => (
                      <div key={cIdx} className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 relative group/custom">
                        <div className="flex items-center justify-between mb-2">
                           <input type="text" value={custom.name || ''} onChange={(e) => updateCustomCost(index, cIdx, 'name', e.target.value)} placeholder="Custom expense name..." className="bg-transparent font-bold text-xs text-indigo-700 outline-none w-full placeholder:text-indigo-300" />
                           <button onClick={() => removeCustomCost(index, cIdx)} className="text-indigo-400 hover:text-indigo-600 opacity-0 group-hover/custom:opacity-100 transition-opacity">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                        <div className="space-y-2">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Plan $</span>
                            <input type="number" value={custom.planned_cost || ''} onChange={(e) => updateCustomCost(index, cIdx, 'planned_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-white border border-indigo-200 rounded text-sm focus:ring-2 focus:ring-indigo-400 outline-none" />
                          </div>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-rose-400 text-xs font-semibold">Actl $</span>
                            <input type="number" value={custom.actual_cost || ''} onChange={(e) => updateCustomCost(index, cIdx, 'actual_cost', e.target.value)} placeholder="0" className="w-full pl-10 pr-2 py-1.5 bg-rose-50 border border-rose-100 rounded text-sm focus:ring-2 focus:ring-rose-400 outline-none" />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button onClick={() => addCustomCost(index)} className="flex items-center justify-center gap-1 p-3 rounded-xl border border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors w-full group/add">
                      <svg className="w-4 h-4 transition-transform group-hover/add:rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      <span className="text-xs font-bold uppercase tracking-wider">Add Custom Expense</span>
                    </button>

                  </div>
                </div>

              </div>

            </div>
          ))}

          {/* Add another Section Button */}
          <button 
            onClick={addSection}
            className="group relative w-full bg-[#f8fafc] hover:bg-white border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-3xl p-10 flex flex-col items-center justify-center transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative w-16 h-16 bg-white group-hover:bg-blue-600 border-2 border-blue-100 group-hover:border-blue-600 rounded-full flex items-center justify-center text-blue-600 group-hover:text-white mb-5 transition-all shadow-sm group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 className="relative text-2xl font-extrabold text-slate-400 group-hover:text-blue-700 mb-1.5 transition-colors duration-300 tracking-tight">Add another Section</h3>
            <p className="relative text-slate-500 font-medium transition-colors group-hover:text-blue-600/80">Add more sections to complete your itinerary</p>
          </button>

          {/* Save Action */}
          <div className="mt-8 space-y-4">
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium whitespace-pre-wrap">
                ❌ {saveError}
              </div>
            )}
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="group relative flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-extrabold py-3.5 px-8 rounded-full shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_24px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center gap-2">
                  {isSaving – (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Save Itinerary
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
