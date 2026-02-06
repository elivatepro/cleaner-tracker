-- Adds geofence toggle to app_settings and default true
ALTER TABLE IF EXISTS public.app_settings
  ADD COLUMN IF NOT EXISTS geofence_enabled boolean NOT NULL DEFAULT true;
