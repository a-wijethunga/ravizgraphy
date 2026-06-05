create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
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
  storage_bucket text not null default 'gallery-images',
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
  storage_bucket text not null default 'gallery-videos',
  storage_path text not null,
  public_url text not null,
  thumbnail_url text,
  duration_seconds integer,
  file_size bigint,
  sort_order integer not null default 0,
  featured boolean not null default false,
  published boolean not null default true,
  captured_at date,
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

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'albums_cover_photo_fk'
      and conrelid = 'public.albums'::regclass
  ) then
    alter table public.albums
      add constraint albums_cover_photo_fk
      foreign key (cover_photo_id) references public.photos(id) on delete set null
      not valid;
  end if;
end;
$$;

create index if not exists idx_categories_sort on public.categories(sort_order, name);
create index if not exists idx_subcategories_category on public.subcategories(category_id, sort_order);
create index if not exists idx_albums_public on public.albums(published, featured, event_date desc, created_at desc);
create index if not exists idx_albums_category on public.albums(category_id, subcategory_id);
create index if not exists idx_albums_search on public.albums using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(seo_title, '')));
create index if not exists idx_photos_public on public.photos(published, featured, created_at desc);
create index if not exists idx_photos_category on public.photos(category_id, subcategory_id);
create index if not exists idx_photos_search on public.photos using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(alt_text, '') || ' ' || array_to_string(tags, ' ')));
create index if not exists idx_videos_public on public.videos(published, featured, created_at desc);
create index if not exists idx_videos_category on public.videos(category_id, subcategory_id);
create index if not exists idx_album_photos_order on public.album_photos(album_id, sort_order);
create index if not exists idx_album_videos_order on public.album_videos(album_id, sort_order);
create index if not exists idx_activity_logs_created on public.activity_logs(created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_users_updated_at on public.users;
create trigger touch_users_updated_at before update on public.users for each row execute function public.touch_updated_at();
drop trigger if exists touch_categories_updated_at on public.categories;
create trigger touch_categories_updated_at before update on public.categories for each row execute function public.touch_updated_at();
drop trigger if exists touch_subcategories_updated_at on public.subcategories;
create trigger touch_subcategories_updated_at before update on public.subcategories for each row execute function public.touch_updated_at();
drop trigger if exists touch_albums_updated_at on public.albums;
create trigger touch_albums_updated_at before update on public.albums for each row execute function public.touch_updated_at();
drop trigger if exists touch_photos_updated_at on public.photos;
create trigger touch_photos_updated_at before update on public.photos for each row execute function public.touch_updated_at();
drop trigger if exists touch_videos_updated_at on public.videos;
create trigger touch_videos_updated_at before update on public.videos for each row execute function public.touch_updated_at();

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery-images', 'gallery-images', true, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('gallery-videos', 'gallery-videos', true, 524288000, array['video/mp4', 'video/quicktime', 'video/webm']),
  ('album-covers', 'album-covers', true, 26214400, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.users enable row level security;
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.videos enable row level security;
alter table public.album_photos enable row level security;
alter table public.album_videos enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories" on public.categories for select using (true);
drop policy if exists "Public can view subcategories" on public.subcategories;
create policy "Public can view subcategories" on public.subcategories for select using (true);
drop policy if exists "Public can view published albums" on public.albums;
create policy "Public can view published albums" on public.albums for select using (published = true);
drop policy if exists "Public can view published photos" on public.photos;
create policy "Public can view published photos" on public.photos for select using (published = true);
drop policy if exists "Public can view published videos" on public.videos;
create policy "Public can view published videos" on public.videos for select using (published = true);
drop policy if exists "Public can view album photos for published content" on public.album_photos;
create policy "Public can view album photos for published content" on public.album_photos for select using (
  exists(select 1 from public.albums a where a.id = album_id and a.published = true)
  and exists(select 1 from public.photos p where p.id = photo_id and p.published = true)
);
drop policy if exists "Public can view album videos for published content" on public.album_videos;
create policy "Public can view album videos for published content" on public.album_videos for select using (
  exists(select 1 from public.albums a where a.id = album_id and a.published = true)
  and exists(select 1 from public.videos v where v.id = video_id and v.published = true)
);

drop policy if exists "Admins manage users" on public.users;
create policy "Admins manage users" on public.users for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage admins" on public.admins;
create policy "Admins manage admins" on public.admins for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage subcategories" on public.subcategories;
create policy "Admins manage subcategories" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage albums" on public.albums;
create policy "Admins manage albums" on public.albums for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage photos" on public.photos;
create policy "Admins manage photos" on public.photos for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage videos" on public.videos;
create policy "Admins manage videos" on public.videos for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage album photos" on public.album_photos;
create policy "Admins manage album photos" on public.album_photos for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage album videos" on public.album_videos;
create policy "Admins manage album videos" on public.album_videos for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins view activity logs" on public.activity_logs;
create policy "Admins view activity logs" on public.activity_logs for select using (public.is_admin());
drop policy if exists "Admins insert activity logs" on public.activity_logs;
create policy "Admins insert activity logs" on public.activity_logs for insert with check (public.is_admin());

drop policy if exists "Public read gallery images storage" on storage.objects;
create policy "Public read gallery images storage" on storage.objects for select using (bucket_id in ('gallery-images', 'gallery-videos', 'album-covers'));
drop policy if exists "Admins upload gallery storage" on storage.objects;
create policy "Admins upload gallery storage" on storage.objects for insert with check (bucket_id in ('gallery-images', 'gallery-videos', 'album-covers') and public.is_admin());
drop policy if exists "Admins update gallery storage" on storage.objects;
create policy "Admins update gallery storage" on storage.objects for update using (bucket_id in ('gallery-images', 'gallery-videos', 'album-covers') and public.is_admin()) with check (bucket_id in ('gallery-images', 'gallery-videos', 'album-covers') and public.is_admin());
drop policy if exists "Admins delete gallery storage" on storage.objects;
create policy "Admins delete gallery storage" on storage.objects for delete using (bucket_id in ('gallery-images', 'gallery-videos', 'album-covers') and public.is_admin());
