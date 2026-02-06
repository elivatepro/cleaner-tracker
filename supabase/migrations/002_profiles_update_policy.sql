-- Allow authenticated users to update only their own profile (full_name, phone, avatar_url, etc.)
-- Safe-guarded to avoid duplicate policy creation.

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'update_own_profile'
      AND tablename = 'profiles'
      AND schemaname = 'public'
  ) THEN
    CREATE POLICY update_own_profile ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END$$;
