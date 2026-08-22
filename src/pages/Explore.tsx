import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const TOURIST_PLACES = [
  { id: '1', name: 'Eiffel Tower', location: 'Paris, France', category: 'Landmark', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop', description: 'The iconic iron lattice tower on the Champ de Mars, symbol of France.', rating: 4.8 },
  { id: '2', name: 'Santorini', location: 'Greece', category: 'Beach', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop', description: 'Stunning white-washed buildings and breathtaking sunsets over the Aegean Sea.', rating: 4.9 },
  { id: '3', name: 'Machu Picchu', location: 'Cusco, Peru', category: 'Heritage', image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=800&auto=format&fit=crop', description: 'The legendary Incan citadel set high in the Andes mountains.', rating: 4.9 },
  { id: '4', name: 'Taj Mahal', location: 'Agra, India', category: 'Heritage', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop', description: 'A magnificent white marble mausoleum, a UNESCO World Heritage Site.', rating: 4.8 },
  { id: '5', name: 'Colosseum', location: 'Rome, Italy', category: 'Heritage', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop', description: 'Ancient amphitheater in the heart of Rome, built in 70 AD.', rating: 4.7 },
  { id: '6', name: 'Great Wall of China', location: 'Beijing, China', category: 'Heritage', image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800&auto=format&fit=crop', description: 'A series of fortifications stretching across northern China.', rating: 4.8 },
  { id: '7', name: 'Bali Temples', location: 'Bali, Indonesia', category: 'Culture', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', description: 'Stunning Hindu temples nestled in tropical rice terraces.', rating: 4.7 },
  { id: '8', name: 'Northern Lights', location: 'Tromsø, Norway', category: 'Nature', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop', description: 'The magical aurora borealis dancing across the Arctic sky.', rating: 5.0 },
  { id: '9', name: 'Banff National Park', location: 'Alberta, Canada', category: 'Nature', image: 'https://images.unsplash.com/photo-1561134643-668f9057cce4?q=80&w=800&auto=format&fit=crop', description: 'Stunning alpine scenery with turquoise lakes and rugged peaks.', rating: 4.9 },
  { id: '10', name: 'Safari in Masai Mara', location: 'Kenya', category: 'Adventure', image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop', description: 'Witness the great wildebeest migration on the African savanna.', rating: 4.9 },
  { id: '11', name: 'Angkor Wat', location: 'Siem Reap, Cambodia', category: 'Heritage', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=800&auto=format&fit=crop', description: "The world's largest religious monument from the Khmer Empire.", rating: 4.8 },
  { id: '12', name: 'Amalfi Coast', location: 'Italy', category: 'Beach', image: 'https://images.unsplash.com/photo-1612698093158-e07ac200d44e?q=80&w=800&auto=format&fit=crop', description: 'Dramatic cliffs and colorful villages perched above the turquoise sea.', rating: 4.8 },
  { id: '13', name: 'Petra', location: 'Jordan', category: 'Heritage', image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?q=80&w=800&auto=format&fit=crop', description: 'The Rose City carved directly into rose-red cliffs over 2000 years ago.', rating: 4.8 },
  { id: '14', name: 'Grand Canyon', location: 'Arizona, USA', category: 'Nature', image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?q=80&w=800&auto=format&fit=crop', description: "One of the world's most spectacular natural wonders.", rating: 4.8 },
  { id: '15', name: 'Maldives', location: 'South Asia', category: 'Beach', image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=800&auto=format&fit=crop', description: 'Crystal-clear turquoise waters and overwater bungalows in paradise.', rating: 4.9 },
  { id: '16', name: 'Kyoto', location: 'Japan', category: 'Culture', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', description: 'Ancient temples, geisha districts, and stunning bamboo groves.', rating: 4.8 },
  { id: '17', name: 'Iguazu Falls', location: 'Brazil/Argentina', category: 'Nature', image: 'https://images.unsplash.com/photo-1609208960733-b1a5e741f0ea?q=80&w=800&auto=format&fit=crop', description: "The world's largest waterfall system, spanning two countries.", rating: 4.9 },
  { id: '18', name: 'Dubrovnik Old Town', location: 'Croatia', category: 'Heritage', image: 'https://images.unsplash.com/photo-1555990793-da11153b2473?q=80&w=800&auto=format&fit=crop', description: 'Pearl of the Adriatic with medieval walls and crystal-blue sea.', rating: 4.7 },
  { id: '19', name: 'Pyramids of Giza', location: 'Cairo, Egypt', category: 'Heritage', image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?q=80&w=800&auto=format&fit=crop', description: 'The last of the Seven Wonders of the Ancient World still standing.', rating: 4.8 },
  { id: '20', name: 'Rio de Janeiro', location: 'Brazil', category: 'Culture', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=800&auto=format&fit=crop', description: 'Christ the Redeemer, Carnival, and spectacular beach culture.', rating: 4.7 },
  { id: '21', name: 'New Zealand Fjords', location: 'Milford Sound, NZ', category: 'Nature', image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?q=80&w=800&auto=format&fit=crop', description: 'Dramatic fjords with cascading waterfalls and untouched wilderness.', rating: 4.9 },
  { id: '22', name: 'Phuket', location: 'Thailand', category: 'Beach', image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?q=80&w=800&auto=format&fit=crop', description: "Thailand's largest island with white-sand beaches and vibrant nightlife.", rating: 4.6 },
  { id: '23', name: 'Barcelona', location: 'Spain', category: 'Culture', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=800&auto=format&fit=crop', description: "Gaudí's masterpieces, tapas culture, and sun-drenched beaches.", rating: 4.7 },
  { id: '24', name: 'Sahara Desert', location: 'Morocco', category: 'Adventure', image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop', description: 'Experience the vast golden dunes and starry nights of the world\'s largest desert.', rating: 4.8 },
  { id: '25', name: 'Venice', location: 'Italy', category: 'Culture', image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop', description: 'The floating city — iconic gondolas, canals, and Renaissance palaces.', rating: 4.7 },
  { id: '26', name: 'Galápagos Islands', location: 'Ecuador', category: 'Nature', image: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?q=80&w=800&auto=format&fit=crop', description: 'A living laboratory of evolution with unique wildlife found nowhere else.', rating: 4.9 },
  { id: '27', name: 'Istanbul', location: 'Turkey', category: 'Culture', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop', description: 'Where East meets West — minarets, bazaars and the Bosphorus Strait.', rating: 4.7 },
  { id: '28', name: 'Cape Town', location: 'South Africa', category: 'Adventure', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?q=80&w=800&auto=format&fit=crop', description: 'Table Mountain, scenic drives and the meeting point of two oceans.', rating: 4.8 },
  { id: '29', name: 'Patagonia', location: 'Chile/Argentina', category: 'Adventure', image: 'https://images.unsplash.com/photo-1564419229766-f44f8fb7a681?q=80&w=800&auto=format&fit=crop', description: 'Dramatic glaciers, jagged peaks and untamed wilderness at the end of the earth.', rating: 4.9 },
  { id: '30', name: 'Yellowstone', location: 'Wyoming, USA', category: 'Nature', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', description: "America's first national park with geysers, hot springs and wildlife.", rating: 4.8 },
  { id: '31', name: 'Havana', location: 'Cuba', category: 'Culture', image: 'https://images.unsplash.com/photo-1500759285222-a95626bf934d?q=80&w=800&auto=format&fit=crop', description: 'Colorful colonial architecture, vintage cars, salsa music and Cuban cigars.', rating: 4.6 },
  { id: '32', name: 'Cinque Terre', location: 'Liguria, Italy', category: 'Heritage', image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?q=80&w=800&auto=format&fit=crop', description: 'Five colorful villages clinging dramatically to rugged Italian coastline.', rating: 4.8 },
  { id: '33', name: 'Ha Long Bay', location: 'Vietnam', category: 'Nature', image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop', description: 'Thousands of limestone islands rising from emerald-green waters.', rating: 4.8 },
  { id: '34', name: 'Serengeti', location: 'Tanzania', category: 'Adventure', image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?q=80&w=800&auto=format&fit=crop', description: 'Endless plains teeming with lions, elephants and the great migration.', rating: 4.9 },
  { id: '35', name: 'Prague', location: 'Czech Republic', category: 'Heritage', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=800&auto=format&fit=crop', description: "The City of a Hundred Spires — fairy-tale Old Town and medieval castle.", rating: 4.7 },
  { id: '36', name: 'Bora Bora', location: 'French Polynesia', category: 'Beach', image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?q=80&w=800&auto=format&fit=crop', description: 'Overwater bungalows in a jewel-like lagoon ringed by coral reefs.', rating: 4.9 },
  { id: '37', name: 'Cappadocia', location: 'Turkey', category: 'Adventure', image: 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?q=80&w=800&auto=format&fit=crop', description: 'Surreal rock formations and hot air balloon rides over fairy chimneys.', rating: 4.9 },
  { id: '38', name: 'Mozambique', location: 'East Africa', category: 'Beach', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop', description: 'Untouched Indian Ocean beaches and spectacular coral reefs.', rating: 4.7 },
  { id: '39', name: 'Swiss Alps', location: 'Switzerland', category: 'Adventure', image: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?q=80&w=800&auto=format&fit=crop', description: 'Iconic snow-capped peaks, luxury chalets and world-class skiing.', rating: 4.9 },
  { id: '40', name: 'Plitvice Lakes', location: 'Croatia', category: 'Nature', image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=800&auto=format&fit=crop', description: 'A cascade of 16 terraced lakes connected by stunning waterfalls.', rating: 4.9 },
];

const CATEGORIES = ['All', 'Nature', 'Heritage', 'Beach', 'Culture', 'Adventure'];

const CATEGORY_COLORS: Record<string, string> = {
  Nature: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Heritage: 'bg-amber-50 text-amber-700 border-amber-200',
  Beach: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Culture: 'bg-violet-50 text-violet-700 border-violet-200',
  Adventure: 'bg-rose-50 text-rose-700 border-rose-200',
  Landmark: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function Explore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; tripId?: string } | null>(null);

  const filtered = TOURIST_PLACES.filter(place => {
    const matchesSearch = !searchQuery ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || place.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const showToast = (message: string, tripId?: string) => {
    setToast({ message, tripId });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddToTrip = async (place: typeof TOURIST_PLACES[0]) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAddingId(place.id);

    try {
      // Ensure profile exists
      await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });

      const today = new Date();
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: tripData, error } = await supabase
        .from('trips')
        .insert({
          owner_id: user.id,
          name: place.name,
          description: `${place.location} — ${place.description}`,
          start_date: startDate,
          end_date: endDate,
          travelers_count: 1,
          visibility: 'private',
          budget_amount: 0,
          image_url: place.image,
        })
        .select()
        .single();

      if (error) throw error;

      // Create an initial stop for the place as well
      await supabase.from('trip_stops').insert({
        trip_id: tripData.id,
        title: place.name,
        description: place.description,
        arrival_date: startDate,
        departure_date: endDate,
        position: 0,
        location: { name: place.name, address: place.location },
      }).catch(e => console.warn('Stop creation warning:', e));

      setAddedIds(prev => new Set([...prev, place.id]));
      showToast(`"${place.name}" added to your trips!`, tripData.id);
    } catch (err: any) {
      console.error('Error adding trip:', err);
      const errMsg = err?.message || 'Failed to add trip';
      showToast(`Error: ${errMsg}`);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="pb-12 min-h-screen animate-in fade-in duration-300">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl max-w-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{toast.message}</p>
            </div>
            {toast.tripId && (
              <button
                onClick={() => navigate(`/itinerary/${toast.tripId}`)}
                className="text-blue-400 hover:text-blue-300 font-bold text-xs whitespace-nowrap ml-2"
              >
                View Trip →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative w-full h-52 rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl shadow-blue-900/10">
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=2000&auto=format&fit=crop"
          alt="Explore the World"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-10">
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Explore the World</h1>
          <p className="text-white/80 font-semibold mt-2">40 incredible destinations, one click away from your next trip</p>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative group max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations, countries..."
            className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-slate-900 shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-bold text-sm border transition-all duration-200 ${
                activeCategory === cat
                  – 'bg-slate-900 text-white border-slate-900 shadow-lg'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 font-semibold text-sm">
          Showing <span className="text-slate-900 font-black">{filtered.length}</span> destinations
        </p>
      </div>

      {/* Grid of Places */}
      {filtered.length === 0 – (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <div className="text-6xl mb-4">🌍</div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No destinations found</h3>
          <p className="text-slate-500 font-medium">Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((place) => {
            const isAdding = addingId === place.id;
            const isAdded = addedIds.has(place.id);
            const catColor = CATEGORY_COLORS[place.category] || 'bg-slate-50 text-slate-600 border-slate-200';

            return (
              <div
                key={place.id}
                className="group bg-white rounded-[1.75rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Category Badge */}
                  <div className={`absolute top-3 left-3 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border backdrop-blur-sm ${catColor}`}>
                    {place.category}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-sm">
                    <svg className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <span className="text-xs font-black text-slate-700">{place.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-base leading-tight mb-1 group-hover:text-blue-700 transition-colors">{place.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-3">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {place.location}
                    </div>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 mb-4">{place.description}</p>
                  </div>

                  {/* Add to Trip Button */}
                  <button
                    onClick={() => handleAddToTrip(place)}
                    disabled={isAdding || isAdded}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                      isAdded
                        – 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-default'
                        : isAdding
                        – 'bg-blue-50 text-blue-500 border-2 border-blue-200 cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {isAdded – (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Added to Trips
                      </>
                    ) : isAdding ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add to Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
