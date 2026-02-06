-- Adds per-location geofence toggle with default true
ALTER TABLE IF EXISTS public.locations
  ADD COLUMN IF NOT EXISTS geofence_enabled boolean NOT NULL DEFAULT true;
