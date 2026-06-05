import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { getCachedCategories, getCachedSubcategories } from '@lib/local-db'

const ALBUM_COLS = 'id, title, slug, description, category_id, subcategory_id, cover_photo_id, cover_url, featured, published, event_date, parent_id, sort_order, created_by, created_at, updated_at'
const PHOTO_COLS = 'id, title, description, tags, alt_text, category_id, subcategory_id, storage_bucket, storage_path, public_url, width, height, file_size, sort_order, featured, published, taken_at, created_by, created_at, updated_at'
const VIDEO_COLS = 'id, title, description, category_id, subcategory_id, storage_bucket, storage_path, public_url, thumbnail_url, duration_seconds, file_size, sort_order, featured, published, captured_at, youtube_url, youtube_id, video_type, created_by, created_at, updated_at'

export async function GET(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }
  const supabase = auth.adminClient

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim()
  const filter = url.searchParams.get('filter')?.trim()

  try {
    // 1. Fetch categories and subcategories from cache
    const [categories, subcategories] = await Promise.all([
      getCachedCategories().catch(() => []),
      getCachedSubcategories().catch(() => [])
    ])

    // 2. Build direct database queries
    let albumsQuery = supabase.from('albums').select(ALBUM_COLS).order('sort_order', { ascending: true })
    let photosQuery = supabase.from('photos').select(PHOTO_COLS).order('sort_order', { ascending: true })
    let videosQuery = supabase.from('videos').select(VIDEO_COLS).order('sort_order', { ascending: true })

    // Apply search filter if requested (database-level query optimization)
    if (search) {
      albumsQuery = albumsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`)
      photosQuery = photosQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,alt_text.ilike.%${search}%`)
      videosQuery = videosQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply general status filters
    if (filter === 'featured') {
      albumsQuery = albumsQuery.eq('featured', true)
      photosQuery = photosQuery.eq('featured', true)
      videosQuery = videosQuery.eq('featured', true)
    } else if (filter === 'published') {
      albumsQuery = albumsQuery.eq('published', true)
      photosQuery = photosQuery.eq('published', true)
      videosQuery = videosQuery.eq('published', true)
    } else if (filter === 'drafts') {
      albumsQuery = albumsQuery.eq('published', false)
      photosQuery = photosQuery.eq('published', false)
      videosQuery = videosQuery.eq('published', false)
    }

    // Limit photos and videos to prevent massive transfers on first render
    photosQuery = photosQuery.range(0, 119)
    videosQuery = videosQuery.range(0, 79)

    // Execute queries in parallel
    const [
      { data: albums = [] },
      { data: photos = [] },
      { data: videos = [] },
      { data: albumPhotos = [] },
      { data: albumVideos = [] },
      { count: totalPhotosCount },
      { count: totalVideosCount }
    ] = await Promise.all([
      albumsQuery,
      photosQuery,
      videosQuery,
      supabase.from('album_photos').select('album_id, photo_id, sort_order, created_at'),
      supabase.from('album_videos').select('album_id, video_id, sort_order, created_at'),
      supabase.from('photos').select('*', { count: 'exact', head: true }),
      supabase.from('videos').select('*', { count: 'exact', head: true })
    ])

    // Sort in memory by created_at desc for timeline
    const sortDesc = (a: any, b: any) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()

    const sortedAlbums = [...(albums || [])].sort(sortDesc)
    const sortedPhotos = [...(photos || [])].sort(sortDesc)
    const sortedVideos = [...(videos || [])].sort(sortDesc)

    // Helper to hydrate category/subcategory
    const hydrateRelations = (items: any[]) => {
      return items.map((item) => {
        const category = categories.find((c) => String(c.id) === String(item.category_id))
        const subcategory = subcategories.find((sc) => String(sc.id) === String(item.subcategory_id))
        return {
          ...item,
          category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
          subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
        }
      })
    }

    // Compute album counts
    const albumIds = sortedAlbums.map((a) => String(a.id))
    const photoCounts = new Map<string, number>()
    const videoCounts = new Map<string, number>()

    for (const link of albumPhotos || []) {
      const aid = String(link.album_id)
      if (albumIds.includes(aid)) {
        photoCounts.set(aid, (photoCounts.get(aid) ?? 0) + 1)
      }
    }

    for (const link of albumVideos || []) {
      const aid = String(link.album_id)
      if (albumIds.includes(aid)) {
        videoCounts.set(aid, (videoCounts.get(aid) ?? 0) + 1)
      }
    }

    // Hydrate albums with counts and category definitions
    const hydratedAlbums = hydrateRelations(sortedAlbums).map((album) => ({
      ...album,
      photo_count: photoCounts.get(String(album.id)) ?? 0,
      video_count: videoCounts.get(String(album.id)) ?? 0,
    }))

    const hydratedPhotos = hydrateRelations(sortedPhotos)
    const hydratedVideos = hydrateRelations(sortedVideos)

    return NextResponse.json({
      categories: categories || [],
      subcategories: subcategories || [],
      albums: hydratedAlbums,
      photos: hydratedPhotos,
      videos: hydratedVideos,
      album_photos: albumPhotos || [],
      album_videos: albumVideos || [],
      stats: {
        albums: hydratedAlbums.length,
        photos: totalPhotosCount || (photos || []).length,
        videos: totalVideosCount || (videos || []).length,
        categories: categories?.length ?? 0,
        featured: hydratedAlbums.filter((a) => a.featured).length,
        published: hydratedAlbums.filter((a) => a.published).length,
      },
    })
  } catch (err: any) {
    console.error('[Gallery Overview API Error]:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
