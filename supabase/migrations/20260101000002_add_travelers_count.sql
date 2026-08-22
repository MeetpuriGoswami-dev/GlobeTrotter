-- Add travelers_count to trips table
ALTER TABLE trips ADD COLUMN travelers_count integer DEFAULT 1 CHECK (travelers_count >= 1);
