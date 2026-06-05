-- Create admins table if not exists with BIGSERIAL primary key
CREATE TABLE IF NOT EXISTS public.admins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Admins manage admins" ON public.admins;

-- Policy to allow admins to manage the admins table
CREATE POLICY "Admins manage admins" ON public.admins 
  FOR ALL 
  USING (public.is_admin()) 
  WITH CHECK (public.is_admin());
