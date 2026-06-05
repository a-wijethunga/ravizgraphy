-- Drop old empty tables if they exist
drop table if exists public.album_photos cascade;
drop table if exists public.album_videos cascade;
drop table if exists public.photos cascade;
drop table if exists public.videos cascade;
drop table if exists public.albums cascade;
drop table if exists public.subcategories cascade;
drop table if exists public.categories cascade;
drop table if exists public.messages cascade;
drop table if exists public.settings cascade;
drop table if exists public.site_content cascade;
drop table if exists public.activity_logs cascade;
drop table if exists public.media cascade;
drop table if exists public.admins cascade;

create table if not exists public.admins (
  id bigserial primary key,
  user_id uuid unique not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug),
  constraint subcategories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  cover_photo_id uuid,
  cover_url text,
  featured boolean not null default false,
  published boolean not null default true,
  seo_title text,
  seo_description text,
  event_date date,
  parent_id uuid references public.albums(id) on delete set null,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint albums_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] not null default '{}',
  alt_text text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  storage_bucket text not null default 'gallery',
  storage_path text not null,
  public_url text not null,
  width integer,
  height integer,
  file_size bigint,
  sort_order integer not null default 0,
  featured boolean not null default false,
  published boolean not null default true,
  taken_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid not null references public.categories(id) on delete restrict,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  storage_bucket text not null default 'gallery',
  storage_path text not null,
  public_url text not null,
  thumbnail_url text,
  duration_seconds integer,
  file_size bigint,
  sort_order integer not null default 0,
  featured boolean not null default false,
  published boolean not null default true,
  captured_at date,
  youtube_url text,
  youtube_id text,
  video_type text not null default 'video' check (video_type in ('video', 'short')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table if not exists public.album_photos (
  album_id uuid not null references public.albums(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (album_id, photo_id)
);

create table if not exists public.album_videos (
  album_id uuid not null references public.albums(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (album_id, video_id)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read')),
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id text primary key default 'global',
  website_name text,
  logo_text text,
  hero_title text,
  hero_subtitle text,
  contact_phone text,
  contact_email text,
  contact_address text,
  instagram_url text,
  facebook_url text,
  whatsapp_url text,
  seo_title text,
  seo_description text,
  google_analytics_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  key text primary key,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS for all tables
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.videos enable row level security;
alter table public.album_photos enable row level security;
alter table public.album_videos enable row level security;
alter table public.activity_logs enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;
alter table public.site_content enable row level security;

-- Admin check function
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

-- RLS Select policies for Public
create policy "Public can view categories" on public.categories for select using (true);
create policy "Public can view subcategories" on public.subcategories for select using (true);
create policy "Public can view published albums" on public.albums for select using (published = true);
create policy "Public can view published photos" on public.photos for select using (published = true);
create policy "Public can view published videos" on public.videos for select using (published = true);
create policy "Public can view album photos for published content" on public.album_photos for select using (
  exists(select 1 from public.albums a where a.id = album_id and a.published = true)
  and exists(select 1 from public.photos p where p.id = photo_id and p.published = true)
);
create policy "Public can view album videos for published content" on public.album_videos for select using (
  exists(select 1 from public.albums a where a.id = album_id and a.published = true)
  and exists(select 1 from public.videos v where v.id = video_id and v.published = true)
);
create policy "Public can view settings" on public.settings for select using (true);
create policy "Public can view site_content" on public.site_content for select using (true);
create policy "Public can insert messages" on public.messages for insert with check (true);

-- RLS policies for Admins (manage everything)
create policy "Admins manage admins" on public.admins for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage subcategories" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage albums" on public.albums for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage photos" on public.photos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage videos" on public.videos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage album photos" on public.album_photos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage album videos" on public.album_videos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins view activity logs" on public.activity_logs for select using (public.is_admin());
create policy "Admins insert activity logs" on public.activity_logs for insert with check (public.is_admin());
create policy "Admins manage messages" on public.messages for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage site_content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- Storage policies
insert into storage.buckets (id, name, public, file_size_limit)
values ('gallery', 'gallery', true, 524288000)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

create policy "Public read gallery storage" on storage.objects for select using (bucket_id = 'gallery');
create policy "Admins upload gallery storage" on storage.objects for insert with check (bucket_id = 'gallery' and public.is_admin());
create policy "Admins update gallery storage" on storage.objects for update using (bucket_id = 'gallery' and public.is_admin()) with check (bucket_id = 'gallery' and public.is_admin());
create policy "Admins delete gallery storage" on storage.objects for delete using (bucket_id = 'gallery' and public.is_admin());

-- Triggers for touch_updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_categories_updated_at before update on public.categories for each row execute function public.touch_updated_at();
create trigger touch_subcategories_updated_at before update on public.subcategories for each row execute function public.touch_updated_at();
create trigger touch_albums_updated_at before update on public.albums for each row execute function public.touch_updated_at();
create trigger touch_photos_updated_at before update on public.photos for each row execute function public.touch_updated_at();
create trigger touch_videos_updated_at before update on public.videos for each row execute function public.touch_updated_at();
create trigger touch_settings_updated_at before update on public.settings for each row execute function public.touch_updated_at();
create trigger touch_site_content_updated_at before update on public.site_content for each row execute function public.touch_updated_at();

-- Seeds
insert into public.categories (name, slug, description, sort_order) values
  ('Engagement', 'engagement', 'Pre-wedding, proposal, and couple stories with an editorial finish.', 5),
  ('Weddings', 'weddings', 'Elegant wedding stories, from pre-shoots to the final dance.', 10),
  ('Events', 'events', 'Corporate gatherings, private parties, and cultural festivals.', 20),
  ('Portraits', 'portraits', 'Studio, outdoor, and fashion portrait sessions.', 30),
  ('Family & Kids', 'family-kids', 'Warm family sessions, birthdays, and childhood milestones.', 35),
  ('Fashion', 'fashion', 'Editorial, product, and personal brand fashion stories.', 40),
  ('Yoga', 'yoga', 'Mindful movement, wellness, and retreat visual stories.', 45),
  ('Life Style', 'life-style', 'Lifestyle, wellness, personal projects, and brand narratives.', 50),
  ('Travel', 'travel', 'Travel stories from Sri Lanka, Bali, and international commissions.', 60)
on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.subcategories (category_id, name, slug, sort_order)
select c.id, s.name, s.slug, s.sort_order
from public.categories c
join (values
  ('weddings', 'Pre Shoot', 'pre-shoot', 10),
  ('weddings', 'Engagement', 'engagement', 20),
  ('weddings', 'Wedding Day', 'wedding-day', 30),
  ('engagement', 'Pre Shoot', 'pre-shoot', 10),
  ('engagement', 'Couples', 'couples', 20),
  ('engagement', 'Bachelor Shoot', 'bachelor-shoot', 30),
  ('events', 'Corporate', 'corporate', 10),
  ('events', 'Parties', 'parties', 20),
  ('events', 'Festivals', 'festivals', 30),
  ('portraits', 'Studio', 'studio', 10),
  ('portraits', 'Outdoor', 'outdoor', 20),
  ('portraits', 'Fashion', 'fashion', 30),
  ('family-kids', 'Family Shoot', 'family-shoot', 10),
  ('family-kids', 'Birthday Shoot', 'birthday-shoot', 20),
  ('family-kids', 'Kids', 'kids', 30),
  ('fashion', 'Editorial', 'editorial', 10),
  ('fashion', 'Product', 'product', 20),
  ('fashion', 'Outdoor', 'outdoor', 30),
  ('yoga', 'Retreats', 'retreats', 10),
  ('yoga', 'Classes', 'classes', 20),
  ('yoga', 'Lifestyle', 'lifestyle', 30),
  ('life-style', 'Brand Story', 'brand-story', 10),
  ('life-style', 'Personal', 'personal', 20),
  ('life-style', 'Editorial', 'editorial', 30),
  ('travel', 'Sri Lanka', 'sri-lanka', 10),
  ('travel', 'Bali', 'bali', 20),
  ('travel', 'International', 'international', 30)
) as s(category_slug, name, slug, sort_order) on s.category_slug = c.slug
on conflict (category_id, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.settings (
  id, website_name, logo_text, hero_title, hero_subtitle,
  contact_phone, contact_email, contact_address,
  instagram_url, facebook_url, whatsapp_url,
  seo_title, seo_description, google_analytics_id
) values (
  'global', 'RavizGraphy', 'RAVIZGRAPHY',
  'Stories Told Through Light & Shadow', 'Luxury Wedding, Event & Portrait Photography in Sri Lanka',
  '+94 76 305 6168', 'ravizthecrash@gmail.com', 'Chamika Stores, Yahalawatta, Maliduwa, Akuressa',
  'https://instagram.com/ravizgraphy', 'https://facebook.com/ravizgraphy', 'https://wa.me/94763056168',
  'RavizGraphy | Luxury Photography & Films', 'Elegant wedding stories, event photography, and premium cinema services by Raviz in Sri Lanka.',
  'G-XXXXXXXXXX'
) on conflict (id) do nothing;

insert into public.site_content (key, value) values (
  'best_shots',
  '{"title":"My Best","highlight":"Shots","description":"A quiet selection of cinematic portraits, movement, romance, and coastal atmosphere.","visible":true,"limit":9,"layout":"featured","photos":[{"id":"default-best-1","public_url":"/uploads/default-best-shots/DSC07729.jpg.jpeg","alt_text":"Editorial portrait framed through tropical foliage","title":"Tropical Reverie"},{"id":"default-best-2","public_url":"/uploads/default-best-shots/1 v2.JPG.jpeg","alt_text":"Black and white editorial portrait on a coastal tree","title":"Coastal Noir"},{"id":"default-best-3","public_url":"/uploads/default-best-shots/15.JPG.jpeg","alt_text":"Couple embracing on the shoreline at dusk","title":"Shoreline Motion"},{"id":"default-best-4","public_url":"/uploads/default-best-shots/2.JPG.jpeg","alt_text":"Soft romantic close-up portrait by the ocean","title":"Golden Quiet"},{"id":"default-best-5","public_url":"/uploads/default-best-shots/7.JPG.jpeg","alt_text":"Intimate couple portrait in warm natural light","title":"Close Enough"},{"id":"default-best-6","public_url":"/uploads/default-best-shots/1.1.jpg.jpeg","alt_text":"Cinematic street portrait with motion blur","title":"Passing Light"},{"id":"default-best-7","public_url":"/uploads/default-best-shots/1.jpg (1).jpeg","alt_text":"Editorial lifestyle portrait on a quiet tropical road","title":"Open Road"},{"id":"default-best-8","public_url":"/uploads/default-best-shots/8.jpg.jpeg","alt_text":"Sunlit water detail from an editorial lifestyle story","title":"Waterline"},{"id":"default-best-9","public_url":"/uploads/default-best-shots/5.jpg.jpeg","alt_text":"Warm editorial portrait in soft evening light","title":"Still Gaze"}]}'
) on conflict (key) do nothing;
