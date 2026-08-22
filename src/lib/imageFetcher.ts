export async function fetchDestinationImage(query: string): Promise<string | null> {
  if (!query) return null;
  
  try {
    // We use the Wikipedia API as a highly reliable, free, no-API-key fallback
    // It grabs the main image from the Wikipedia article of the searched city/destination
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}&origin=*`);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const pages = data?.query?.pages;
    
    if (pages) {
      // Get the first page's original image
      const pageId = Object.keys(pages)[0];
      const imageUrl = pages[pageId]?.original?.source;
      
      if (imageUrl) {
        return imageUrl;
      }
    }

    // Fallback if Wikipedia fails to find an image for the specific query
    return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80`;
  } catch (err) {
    console.error('Error fetching image:', err);
    return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80`;
  }
}
