-- In the Neighbourhood: store nearby places per provider (Google Places Nearby Search).
-- Run once in Supabase SQL editor if the column does not exist.
ALTER TABLE public.providers
ADD COLUMN IF NOT EXISTS nearby_places jsonb;

COMMENT ON COLUMN public.providers.nearby_places IS 'Nearby F&B, cafes, groceries, parking, transit per docs/NEIGHBOURHOOD_ENGINE.md';
