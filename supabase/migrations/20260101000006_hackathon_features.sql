-- Fix earlier schema issues with trip_stops
ALTER TABLE trip_stops 
  ALTER COLUMN city_id DROP NOT NULL;

ALTER TABLE trip_stops 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS budget numeric(10,2);

-- Add detailed cost breakdowns for trip stops
ALTER TABLE trip_stops 
  ADD COLUMN IF NOT EXISTS transport_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stay_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activities_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meals_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS location JSONB;

-- Add public sharing flag to trips
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Allow anonymous read access to public trips and their stops
DROP POLICY IF EXISTS "Public trips are viewable by everyone" ON trips;
CREATE POLICY "Public trips are viewable by everyone"
  ON trips FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Trip stops of public trips are viewable by everyone" ON trip_stops;
CREATE POLICY "Trip stops of public trips are viewable by everyone"
  ON trip_stops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trips 
      WHERE trips.id = trip_stops.trip_id 
      AND trips.is_public = true
    )
  );

-- Reload postgrest schema
NOTIFY pgrst, 'reload schema';
