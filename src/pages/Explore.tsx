import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ActivityCard from '@/components/ActivityCard';

// Detailed mock data perfectly matching the mockup for Phase 4
const MOCK_ACTIVITIES = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop', // Eiffel tower
    imageCount: 12,
    tag: 'Sightseeing',
    title: 'Eiffel Tower Guided Tour',
    location: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
    description: "Skip-the-line access with an expert guide. Enjoy breathtaking views from the top of Paris's iconic landmark.",
    duration: '2-3 hours',
    difficulty: 'Easy' as const,
    price: 45
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop', // Louvre
    imageCount: 18,
    tag: 'Museum',
    title: 'Louvre Museum Skip-the-Line',
    location: 'Rue de Rivoli, 75001 Paris',
    description: 'Explore thousands of artworks including the Mona Lisa and Venus de Milo. Guided or audio guide options available.',
    duration: '2-4 hours',
    difficulty: 'Easy' as const,
    price: 32
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop', // Seine river
    imageCount: 15,
    tag: 'Cruise',
    title: 'Seine River Evening Cruise',
    location: 'Port de la Bourdonnais, 75007 Paris',
    description: 'Relax on a scenic river cruise and admire illuminated landmarks along the Seine.',
    duration: '1-1.5 hours',
    difficulty: 'Easy' as const,
    price: 25
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1543884877-e6f660dc7d87?q=80&w=800&auto=format&fit=crop', // Montmartre
    imageCount: 10,
    tag: 'Walking Tour',
    title: 'Montmartre Walking Tour',
    location: 'Montmartre, 75018 Paris',
    description: 'Stroll through charming streets, local art spots, and historic sites with a passionate local guide.',
    duration: '2 hours',
    difficulty: 'Moderate' as const,
    price: 18
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1509482560494-4126f8225994?q=80&w=800&auto=format&fit=crop', // Food / Pastries
    imageCount: 14,
    tag: 'Food & Drink',
    title: 'Paris Food Tasting Experience',
    location: 'Le Marais, 75003 Paris',
    description: 'Taste authentic French delicacies and pastries while discovering hidden gems in the Marais district.',
    duration: '3 hours',
    difficulty: 'Easy' as const,
    price: 55
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1563604112-252f82ba1c43?q=80&w=800&auto=format&fit=crop', // Versailles
    imageCount: 16,
    tag: 'Day Trip',
    title: 'Versailles Palace Day Trip',
    location: 'Place d\'Armes, 78000 Versailles',
    description: 'Visit the magnificent Palace of Versailles with round-trip transport from Paris.',
    duration: '5-6 hours',
    difficulty: 'Moderate' as const,
    price: 68
  }
];

export default function Explore() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('Paris, France');

  useEffect(() => {
    async function fetchActivities() {
      try {
        const { data, error } = await supabase.from('activities').select('*').limit(10);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // If we actually have seeded DB data, use it
          // Need to map DB fields to the card props
          setActivities(data.map(item => ({
            id: item.id,
            image: item.image_path || 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop',
            imageCount: Math.floor(Math.random() * 20) + 1, // Mock count since not in schema
            tag: item.type || 'Activity',
            title: item.name,
            location: 'Location details TBA', // We'd need to join cities table for actual location string
            description: item.description || 'No description available.',
            duration: item.duration ? `${Math.round(item.duration/60)} hours` : 'Flexible',
            difficulty: 'Moderate' as const,
            price: item.estimated_cost || 0
          })));
        } else {
          // Fallback to mockup data
          setActivities(MOCK_ACTIVITIES);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        // Fallback to mockup data on error
        setActivities(MOCK_ACTIVITIES);
      } finally {
        setIsLoading(false);
      }
    }

    fetchActivities();
  }, []);

  return (
    <div className="pb-12 bg-white min-h-screen">
      
      {/* Search and Filters Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          
          {/* Main Search Input */}
          <div className="relative flex-1 w-full max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Where to?" 
              className="w-full pl-12 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-medium text-gray-900"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          {/* Filters/Sort */}
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Group by
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            
            <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
              </div>
            </button>
            
            <button className="flex-1 md:flex-none flex items-center justify-between gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                Sort by
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Results</h2>
          <p className="text-gray-500 text-sm font-medium mt-1">Showing {activities.length > 0 ? 42 : 0} activities in {searchQuery || 'your destination'}</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse w-full max-w-6xl mx-auto"></div>
            ))}
          </div>
        )}

        {/* List of Activities */}
        {!isLoading && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <ActivityCard
                key={activity.id || index}
                id={activity.id}
                image={activity.image}
                imageCount={activity.imageCount}
                tag={activity.tag}
                title={activity.title}
                location={activity.location}
                description={activity.description}
                duration={activity.duration}
                difficulty={activity.difficulty}
                price={activity.price}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && activities.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
