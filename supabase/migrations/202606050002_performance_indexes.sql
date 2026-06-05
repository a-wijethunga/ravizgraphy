-- Migration: Add performance indexes for created_at, category_id, subcategory_id, and slug

-- created_at indexes (descending for sorting newest first)
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON public.albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_created_at ON public.categories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subcategories_created_at ON public.subcategories(created_at DESC);

-- category_id indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_albums_category_id ON public.albums(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_category_id ON public.photos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_category_id ON public.videos(category_id);

-- subcategory_id indexes
CREATE INDEX IF NOT EXISTS idx_albums_subcategory_id ON public.albums(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_photos_subcategory_id ON public.photos(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_videos_subcategory_id ON public.videos(subcategory_id);

-- slug indexes (for lookup operations, unique columns already have implicit indexes but adding search-specific indices is robust)
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_albums_slug ON public.albums(slug);
