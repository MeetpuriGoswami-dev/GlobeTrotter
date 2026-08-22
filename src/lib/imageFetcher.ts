// Use an array of stunning Unsplash photos for destinations
// Since Unsplash Source (source.unsplash.com) is deprecated and Wikipedia often returns maps,
// we use a deterministic hash of the query to pick a high-quality travel image.

const DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80', // Paris/Europe
  'https://images.unsplash.com/photo-1542314831-c6a420325142?auto=format&fit=crop&w=1200&q=80', // Kyoto/Asia
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80', // Nature/Mountains
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', // Beach/Tropical
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80', // New York/City
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80', // Road trip/Adventure
  'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=1200&q=80', // Italy/Tuscany
  'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80', // London/Europe
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80', // Greece/Santorini
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', // Dubai/City
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80', // Sydney/Coast
  'https://images.unsplash.com/photo-1582711012113-41aa50352dd8?auto=format&fit=crop&w=1200&q=80', // Bali/Tropical
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80', // San Francisco
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80', // Alps/Mountains
  'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', // Taj Mahal/India
  'https://images.unsplash.com/photo-1525625299384-f5f242cc3d25?auto=format&fit=crop&w=1200&q=80', // Forest/Cabin
  'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80', // Amsterdam
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80', // Paris night
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80', // Tokyo night
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80'  // Bali temple
];

// Helper to hash a string to an index
function hashStringToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
}

export function getDestinationImage(query: string): string {
  if (!query) return DESTINATION_IMAGES[0];
  
  const lower = query.toLowerCase().trim();
  
  // Check for some common exact keywords to force specific images
  if (lower.includes('paris') || lower.includes('france')) return DESTINATION_IMAGES[0];
  if (lower.includes('tokyo') || lower.includes('japan')) return DESTINATION_IMAGES[1];
  if (lower.includes('beach') || lower.includes('island') || lower.includes('tropical') || lower.includes('maldives') || lower.includes('hawaii')) return DESTINATION_IMAGES[3];
  if (lower.includes('new york') || lower.includes('nyc')) return DESTINATION_IMAGES[4];
  if (lower.includes('italy') || lower.includes('rome')) return DESTINATION_IMAGES[6];
  if (lower.includes('london') || lower.includes('uk') || lower.includes('england')) return DESTINATION_IMAGES[7];
  if (lower.includes('greece') || lower.includes('santorini')) return DESTINATION_IMAGES[8];
  if (lower.includes('dubai') || lower.includes('uae')) return DESTINATION_IMAGES[9];
  if (lower.includes('sydney') || lower.includes('australia')) return DESTINATION_IMAGES[10];
  if (lower.includes('bali') || lower.includes('indonesia')) return DESTINATION_IMAGES[11];
  if (lower.includes('mountain') || lower.includes('alps') || lower.includes('swiss') || lower.includes('hike')) return DESTINATION_IMAGES[13];
  if (lower.includes('india') || lower.includes('taj')) return DESTINATION_IMAGES[14];
  if (lower.includes('amsterdam') || lower.includes('netherlands')) return DESTINATION_IMAGES[16];

  // For any other destination, deterministically pick an image based on the name
  const index = hashStringToIndex(lower, DESTINATION_IMAGES.length);
  return DESTINATION_IMAGES[index];
}

export async function fetchDestinationImage(query: string): Promise<string | null> {
  try {
    return getDestinationImage(query);
  } catch (err) {
    console.error('Error selecting image URL:', err);
    return DESTINATION_IMAGES[0]; // Absolute fallback
  }
}
