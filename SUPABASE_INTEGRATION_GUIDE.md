# Supabase Setup Guide for RavizGraphy

Follow these instructions to set up the Supabase database and storage bucket for the CMS.

---

## 1. Database Schema

Run the following SQL in the **SQL Editor** of your Supabase dashboard to create all 11 required tables, indexes, triggers, and relation columns.

```sql
-- Enable pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 1. Users Table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Admins Role Mapping Table
create table if not exists public.admins (
  id bigserial primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Subcategories Table
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, slug)
);

-- 5. Albums Table
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
  updated_at timestamptz not null default now()
);

-- 6. Photos Table
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

-- 7. Videos Table
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
  video_type text not null default 'video',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

-- 8. Album-Photos Junction Table
create table if not exists public.album_photos (
  album_id uuid not null references public.albums(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (album_id, photo_id)
);

-- 9. Album-Videos Junction Table
create table if not exists public.album_videos (
  album_id uuid not null references public.albums(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (album_id, video_id)
);

-- 10. Site Content Key-Value Settings Table
create table if not exists public.site_content (
  key text primary key,
  value text not null
);

-- 11. Activity Logs Table
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 12. Settings Table
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
  updated_at timestamptz not null default now()
);

-- 13. Messages Contact Inquiry Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default now()
);

-- Add albums photo foreign key relation (optional circular check)
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

-- Create Indexes for speed
create index if not exists idx_categories_sort on public.categories(sort_order, name);
create index if not exists idx_subcategories_category on public.subcategories(category_id, sort_order);
create index if not exists idx_albums_public on public.albums(published, featured, event_date desc, created_at desc);
create index if not exists idx_photos_public on public.photos(published, featured, created_at desc);
create index if not exists idx_videos_public on public.videos(published, featured, created_at desc);
```

---

## 2. Row-Level Security (RLS) Policies

Enable RLS on tables and grant appropriate SELECT permissions to the public and full admin controls.

```sql
-- Enable RLS
alter table public.users enable row level security;
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.videos enable row level security;
alter table public.album_photos enable row level security;
alter table public.album_videos enable row level security;
alter table public.site_content enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;
alter table public.messages enable row level security;

-- Admin role helper
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admins where user_id = auth.uid());
$$;

-- RLS Select Policies (Public read)
create policy "Public can view categories" on public.categories for select using (true);
create policy "Public can view subcategories" on public.subcategories for select using (true);
create policy "Public can view albums" on public.albums for select using (true);
create policy "Public can view photos" on public.photos for select using (true);
create policy "Public can view videos" on public.videos for select using (true);
create policy "Public can view album_photos" on public.album_photos for select using (true);
create policy "Public can view album_videos" on public.album_videos for select using (true);
create policy "Public can view site_content" on public.site_content for select using (true);
create policy "Public can view settings" on public.settings for select using (true);

-- Admin CRUD Policies
create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage subcategories" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage albums" on public.albums for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage photos" on public.photos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage videos" on public.videos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage album_photos" on public.album_photos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage album_videos" on public.album_videos for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage site_content" on public.site_content for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage activity_logs" on public.activity_logs for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage messages" on public.messages for all using (public.is_admin()) with check (public.is_admin());

-- Public can submit messages (insert contact inquiries)
create policy "Public can submit messages" on public.messages for insert with check (true);
```

---

## 3. Storage Bucket & Policies

1. Go to **Storage** in the Supabase Dashboard.
2. Click **New bucket** and name it `gallery`. Ensure **Public bucket** is checked.
3. Add the following SQL policies for objects in the `gallery` bucket:

```sql
-- Allow anyone to read items in the gallery bucket
create policy "Public read gallery storage" on storage.objects for select using (bucket_id = 'gallery');

-- Allow authenticated admin users to manage (upload, update, delete) items
create policy "Admins upload storage" on storage.objects for insert with check (bucket_id = 'gallery' and public.is_admin());
create policy "Admins update storage" on storage.objects for update using (bucket_id = 'gallery' and public.is_admin());
create policy "Admins delete storage" on storage.objects for delete using (bucket_id = 'gallery' and public.is_admin());
```

---

## 4. Admin User Setup

To log in to the admin panel:
1. Go to **Authentication** in the Supabase Dashboard, click **Add User** -> **Create User**, and input an email and password.
2. Copy the **User ID (UUID)** of the newly created user.
3. Open the **SQL Editor** and run the following command to link this user as an Admin:

```sql
insert into public.admins (user_id) values ('PASTE_YOUR_USER_UUID_HERE');
```
Now, you can sign in at `/admin/login` using this email and password.
