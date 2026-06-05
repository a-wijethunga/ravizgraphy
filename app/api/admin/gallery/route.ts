import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { getDB } from '@lib/local-db'

export async function GET(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim().toLowerCase()
  const filter = url.searchParams.get('filter')?.trim()

  const db = await getDB()

  // Get raw items
  let albums = [...(db.albums || [])]
  let photos = [...(db.photos || [])]
  let videos = [...(db.videos || [])]

  // Apply search
  if (search) {
    albums = albums.filter(
      (a) =>
        String(a.title ?? '').toLowerCase().includes(search) ||
        String(a.description ?? '').toLowerCase().includes(search) ||
        String(a.slug ?? '').toLowerCase().includes(search)
    )
    photos = photos.filter(
      (p) =>
        String(p.title ?? '').toLowerCase().includes(search) ||
        String(p.description ?? '').toLowerCase().includes(search) ||
        String(p.alt_text ?? '').toLowerCase().includes(search)
    )
    videos = videos.filter(
      (v) =>
        String(v.title ?? '').toLowerCase().includes(search) ||
        String(v.description ?? '').toLowerCase().includes(search)
    )
  }

  // Apply filters
  if (filter === 'featured') {
    albums = albums.filter((a) => a.featured)
    photos = photos.filter((p) => p.featured)
    videos = videos.filter((v) => v.featured)
  } else if (filter === 'published') {
    albums = albums.filter((a) => a.published)
    photos = photos.filter((p) => p.published)
    videos = videos.filter((v) => v.published)
  } else if (filter === 'drafts') {
    albums = albums.filter((a) => !a.published)
    photos = photos.filter((p) => !p.published)
    videos = videos.filter((v) => !v.published)
  }

  // Helper to hydrate category/subcategory
  const hydrateRelations = (items: any[]) => {
    return items.map((item) => {
      const category = db.categories.find((c) => String(c.id) === String(item.category_id))
      const subcategory = db.subcategories.find((sc) => String(sc.id) === String(item.subcategory_id))
      return {
        ...item,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
        subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
      }
    })
  }

  // Sort by created_at desc
  const sortDesc = (a: any, b: any) =>
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()

  albums.sort(sortDesc)
  photos.sort(sortDesc)
  videos.sort(sortDesc)

  // Apply limits
  const limitedPhotos = photos.slice(0, 120)
  const limitedVideos = videos.slice(0, 80)

  // Compute album counts
  const albumIds = albums.map((a) => String(a.id))
  const photoCounts = new Map<string, number>()
  const videoCounts = new Map<string, number>()

  const albumPhotos = db.album_photos || []
  const albumVideos = db.album_videos || []

  for (const link of albumPhotos) {
    const aid = String(link.album_id)
    if (albumIds.includes(aid)) {
      photoCounts.set(aid, (photoCounts.get(aid) ?? 0) + 1)
    }
  }

  for (const link of albumVideos) {
    const aid = String(link.album_id)
    if (albumIds.includes(aid)) {
      videoCounts.set(aid, (videoCounts.get(aid) ?? 0) + 1)
    }
  }

  // Hydrate albums with counts and category definitions
  const hydratedAlbums = hydrateRelations(albums).map((album) => ({
    ...album,
    photo_count: photoCounts.get(String(album.id)) ?? 0,
    video_count: videoCounts.get(String(album.id)) ?? 0,
  }))

  const hydratedPhotos = hydrateRelations(limitedPhotos)
  const hydratedVideos = hydrateRelations(limitedVideos)

  return NextResponse.json({
    categories: db.categories || [],
    subcategories: db.subcategories || [],
    albums: hydratedAlbums,
    photos: hydratedPhotos,
    videos: hydratedVideos,
    album_photos: db.album_photos || [],
    album_videos: db.album_videos || [],
    stats: {
      albums: hydratedAlbums.length,
      photos: photos.length,
      videos: videos.length,
      categories: db.categories?.length ?? 0,
      featured: hydratedAlbums.filter((a) => a.featured).length,
      published: hydratedAlbums.filter((a) => a.published).length,
    },
  })
}
