-- Create a security definer function to bypass RLS when checking trip ownership
CREATE OR REPLACE FUNCTION get_trip_owner(trip_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT owner_id FROM trips WHERE id = trip_id;
$$;

-- Drop the recursive policy on trip_shares
DROP POLICY IF EXISTS "Users can CRUD trip shares for their trips" ON trip_shares;

-- Create non-recursive policies for trip_shares
CREATE POLICY "Users can view shares they are part of" ON trip_shares
  FOR SELECT USING (shared_with_user_id = auth.uid());

CREATE POLICY "Trip owners can manage shares" ON trip_shares
  FOR ALL USING (get_trip_owner(trip_id) = auth.uid());

-- Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
