CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'cleaner' CHECK (role IN ('admin', 'cleaner')),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cleaner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  geofence_radius INTEGER NOT NULL DEFAULT 200, -- meters
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cleaner_id, location_id)
);

CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaner_id UUID NOT NULL REFERENCES public.profiles(id),
  location_id UUID NOT NULL REFERENCES public.locations(id),
  checkin_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  checkin_lat DOUBLE PRECISION NOT NULL,
  checkin_lng DOUBLE PRECISION NOT NULL,
  checkin_within_geofence BOOLEAN NOT NULL DEFAULT true,
  checkout_time TIMESTAMPTZ,
  checkout_lat DOUBLE PRECISION,
  checkout_lng DOUBLE PRECISION,
  checkout_within_geofence BOOLEAN,
  remarks TEXT,
  status TEXT NOT NULL DEFAULT 'checked_in' CHECK (status IN ('checked_in', 'checked_out')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_checkins_cleaner ON public.checkins(cleaner_id, checkin_time DESC);
CREATE INDEX idx_checkins_location ON public.checkins(location_id, checkin_time DESC);
CREATE INDEX idx_checkins_status ON public.checkins(status) WHERE status = 'checked_in';

CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Default items have no location_id, custom items have one
  CONSTRAINT chk_default_or_location CHECK (
    (is_default = true AND location_id IS NULL) OR
    (is_default = false AND location_id IS NOT NULL)
  )
);

CREATE TABLE public.checkout_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES public.checkins(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.checklist_items(id),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(checkin_id, checklist_item_id)
);

CREATE TABLE public.checkout_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id UUID NOT NULL REFERENCES public.checkins(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES public.profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '72 hours'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invitations_token ON public.invitations(token) WHERE accepted_at IS NULL;

CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Elivate',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#000000',
  secondary_color TEXT NOT NULL DEFAULT '#FFFFFF',
  default_geofence_radius INTEGER NOT NULL DEFAULT 200,
  notify_on_checkin BOOLEAN NOT NULL DEFAULT true,
  notify_on_checkout BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial settings (single row, always id = 1 pattern)
INSERT INTO public.app_settings (company_name) VALUES ('Elivate');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- LOCATIONS
CREATE POLICY "Anyone can view active locations" ON public.locations
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON public.locations
  FOR ALL USING (public.get_user_role() = 'admin');

-- ASSIGNMENTS
CREATE POLICY "Cleaners see own assignments" ON public.assignments
  FOR SELECT USING (cleaner_id = auth.uid() OR public.get_user_role() = 'admin');
CREATE POLICY "Admins manage assignments" ON public.assignments
  FOR ALL USING (public.get_user_role() = 'admin');

-- CHECKINS
CREATE POLICY "Cleaners see own checkins" ON public.checkins
  FOR SELECT USING (cleaner_id = auth.uid() OR public.get_user_role() = 'admin');
CREATE POLICY "Cleaners can create own checkins" ON public.checkins
  FOR INSERT WITH CHECK (cleaner_id = auth.uid());
CREATE POLICY "Cleaners can update own checkins" ON public.checkins
  FOR UPDATE USING (cleaner_id = auth.uid());
CREATE POLICY "Admins can view all checkins" ON public.checkins
  FOR SELECT USING (public.get_user_role() = 'admin');

-- CHECKLIST_ITEMS
CREATE POLICY "Anyone can view checklist items" ON public.checklist_items
  FOR SELECT USING (true);
CREATE POLICY "Admins manage checklist items" ON public.checklist_items
  FOR ALL USING (public.get_user_role() = 'admin');

-- CHECKOUT_TASKS
CREATE POLICY "Cleaners manage own checkout tasks" ON public.checkout_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE id = checkin_id AND cleaner_id = auth.uid())
    OR public.get_user_role() = 'admin'
  );

-- CHECKOUT_PHOTOS
CREATE POLICY "Cleaners manage own photos" ON public.checkout_photos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.checkins WHERE id = checkin_id AND cleaner_id = auth.uid())
    OR public.get_user_role() = 'admin'
  );

-- INVITATIONS
CREATE POLICY "Admins manage invitations" ON public.invitations
  FOR ALL USING (public.get_user_role() = 'admin');
CREATE POLICY "Anyone can read invite by token" ON public.invitations
  FOR SELECT USING (true); -- Token lookup needed during signup

-- APP_SETTINGS
CREATE POLICY "Anyone can view settings" ON public.app_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE USING (public.get_user_role() = 'admin');
