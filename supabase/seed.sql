-- supabase/seed.sql

-- Insert Paris, France into cities
INSERT INTO cities (id, name, country, region, popularity, image_path)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Paris',
  'France',
  'Europe',
  100,
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop'
) ON CONFLICT DO NOTHING;

-- Insert the 6 Paris activities exactly as shown in the mockup
INSERT INTO activities (city_id, name, type, description, duration, estimated_cost, image_path)
VALUES 
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Eiffel Tower Guided Tour',
  'Sightseeing',
  'Skip-the-line access with an expert guide. Enjoy breathtaking views from the top of Paris''s iconic landmark.',
  180, -- 3 hours
  45,
  'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=800&auto=format&fit=crop'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Louvre Museum Skip-the-Line',
  'Museum',
  'Explore thousands of artworks including the Mona Lisa and Venus de Milo. Guided or audio guide options available.',
  240, -- 4 hours
  32,
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=800&auto=format&fit=crop'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Seine River Evening Cruise',
  'Cruise',
  'Relax on a scenic river cruise and admire illuminated landmarks along the Seine.',
  90, -- 1.5 hours
  25,
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Montmartre Walking Tour',
  'Walking Tour',
  'Stroll through charming streets, local art spots, and historic sites with a passionate local guide.',
  120, -- 2 hours
  18,
  'https://images.unsplash.com/photo-1543884877-e6f660dc7d87?q=80&w=800&auto=format&fit=crop'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Paris Food Tasting Experience',
  'Food & Drink',
  'Taste authentic French delicacies and pastries while discovering hidden gems in the Marais district.',
  180, -- 3 hours
  55,
  'https://images.unsplash.com/photo-1509482560494-4126f8225994?q=80&w=800&auto=format&fit=crop'
),
(
  '123e4567-e89b-12d3-a456-426614174000',
  'Versailles Palace Day Trip',
  'Day Trip',
  'Visit the magnificent Palace of Versailles with round-trip transport from Paris.',
  360, -- 6 hours
  68,
  'https://images.unsplash.com/photo-1563604112-252f82ba1c43?q=80&w=800&auto=format&fit=crop'
);

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
