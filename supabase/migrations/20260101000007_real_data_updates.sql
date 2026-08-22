-- Add admin role to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add actual spent columns for real-time tracking
ALTER TABLE trip_stops
  ADD COLUMN IF NOT EXISTS actual_transport_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_stay_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_activities_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_meals_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url text;

-- Add image URL to trips
ALTER TABLE trips
  ADD COLUMN IF NOT EXISTS image_url text;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
