-- Migration: Add missing columns if they do not exist in the target schema

-- 1. Table: site_content
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2. Table: messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS subject text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read'));

-- 3. Table: settings
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_text text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_title text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_subtitle text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS contact_address text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp_url text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS google_analytics_id text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 4. Table: videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE RESTRICT;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS subcategory_id uuid REFERENCES public.subcategories(id) ON DELETE SET NULL;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS storage_bucket text NOT NULL DEFAULT 'gallery';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS storage_path text NOT NULL DEFAULT '';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS duration_seconds integer;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS file_size bigint;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS captured_at date;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS youtube_id text;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS video_type text NOT NULL DEFAULT 'video' CHECK (video_type IN ('video', 'short'));
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
