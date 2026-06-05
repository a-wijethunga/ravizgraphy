# RavizGraphy Gallery CMS

## Folder Structure

```txt
app/
  admin/
    dashboard/
      AdminDashboardClient.tsx
      page.tsx
    login/page.tsx
  api/
    admin/
      [entity]/route.ts
      gallery/route.ts
      reorder/route.ts
      upload/route.ts
    gallery/
      albums/route.ts
      albums/[slug]/route.ts
  gallery/[slug]/page.tsx
src/
  components/
    FeaturedWork.tsx
    Gallery.tsx
    GalleryAlbumClient.tsx
  lib/gallery-config.ts
  types/gallery.ts
lib/
  admin-auth.ts
  supabase-server.ts
supabase/
  migrations/202606040001_gallery_cms.sql
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/202606040001_gallery_cms.sql` in the Supabase SQL editor or through the Supabase CLI.
3. Create an auth user in Supabase Auth.
4. Add that user to `public.admins`:

```sql
insert into public.admins (user_id)
values ('YOUR_AUTH_USER_UUID')
on conflict (user_id) do nothing;
```

The migration creates:

- `users`
- `admins`
- `categories`
- `subcategories`
- `albums`
- `photos`
- `videos`
- `album_photos`
- `album_videos`
- `activity_logs`

It also creates these public Supabase Storage buckets:

- `gallery-images`
- `gallery-videos`
- `album-covers`

## RLS Policy Model

Public visitors can read:

- Categories
- Subcategories
- Published albums
- Published photos
- Published videos
- Published album media links
- Public storage objects from gallery buckets

Admins can:

- Create, update, delete all CMS entities
- Upload, update, and delete gallery storage objects
- View and write activity logs

Admin access is determined by `public.admins.user_id = auth.uid()`.

## Vercel Environment Variables

Set these in Vercel Project Settings:

```txt
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The service role key is only used in server routes and must never be exposed to client components.

## Deployment

This project is Vercel compatible as-is:

```txt
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

No filesystem uploads are used. All gallery media is stored in Supabase Storage and all metadata is stored in PostgreSQL.

## Admin Workflow

1. Sign in at `/admin/login`.
2. Open `/admin/dashboard`.
3. Create categories and subcategories if needed.
4. Create albums with SEO and publishing details.
5. Upload photos or videos through the Photos or Videos dashboard sections.
6. Optionally link uploads to albums during upload.
7. Use bulk tools to move, publish, feature, or delete selected media.

## Public Gallery Workflow

- Homepage order is `Hero` -> `My Best Shots` -> `Gallery`.
- Gallery cards load from `/api/gallery/albums`.
- Album cards link to `/gallery/[slug]`.
- Album pages support masonry viewing, fullscreen lightbox, keyboard navigation, and touch gestures.
