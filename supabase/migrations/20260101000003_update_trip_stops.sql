-- Add UI fields to trip_stops table
ALTER TABLE trip_stops ADD COLUMN title text;
ALTER TABLE trip_stops ADD COLUMN description text;
ALTER TABLE trip_stops ADD COLUMN budget numeric(10,2) CHECK (budget >= 0);

-- Also, make city_id nullable because the generic "Section" might not have a specific city initially
ALTER TABLE trip_stops ALTER COLUMN city_id DROP NOT NULL;

-- Reload schema
NOTIFY pgrst, 'reload schema';
