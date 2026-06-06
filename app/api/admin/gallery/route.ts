import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { getCachedCategories, getCachedSubcategories } from '@lib/local-db'
import { getExistingColumns } from '@lib/supabase-schema'

const ALBUM_COLS_EXPECTED = 'id, title, slug, description, category_id, subcategory_id, cover_photo_id, cover_url, featured, published, event_date, parent_id, sort_order, created_by, created_at, updated_at'
const PHOTO_COLS_EXPECTED = 'id, title, description, tags, alt_text, category_id, subcategory_id, storage_bucket, storage_path, public_url, width, height, file_size, sort_order, featured, published, taken_at, created_by, created_at, updated_at'
const VIDEO_COLS_EXPECTED = 'id, title, description, category_id, subcategory_id, storage_bucket, storage_path, public_url, thumbnail_url, duration_seconds, file_size, sort_order, featured, published, captured_at, youtube_url, youtube_id, video_type, created_by, created_at, updated_at'

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

    // 2. Resolve columns dynamically
    const albumCols = await getExistingColumns(supabase, 'albums', ALBUM_COLS_EXPECTED.split(',').map((s) => s.trim()))
    const photoCols = await getExistingColumns(supabase, 'photos', PHOTO_COLS_EXPECTED.split(',').map((s) => s.trim()))
    const videoCols = await getExistingColumns(supabase, 'videos', VIDEO_COLS_EXPECTED.split(',').map((s) => s.trim()))
    const albumPhotoCols = await getExistingColumns(supabase, 'album_photos', ['album_id', 'photo_id', 'sort_order', 'created_at'])
    const albumVideoCols = await getExistingColumns(supabase, 'album_videos', ['album_id', 'video_id', 'sort_order', 'created_at'])

    // 3. Build queries
    let albumsQuery = supabase.from('albums').select(albumCols.join(', ')).order('sort_order', { ascending: true })
    let photosQuery = supabase.from('photos').select(photoCols.join(', ')).order('sort_order', { ascending: true })
    let videosQuery = supabase.from('videos').select(videoCols.join(', ')).order('sort_order', { ascending: true })

    // Apply search filter if requested (database-level query optimization)
    if (search) {
      albumsQuery = albumsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`)
      photosQuery = photosQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,alt_text.ilike.%${search}%`)
      videosQuery = videosQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply general status filters
    if (filter === 'featured') {
      if (albumCols.includes('featured')) albumsQuery = albumsQuery.eq('featured', true)
      if (photoCols.includes('featured')) photosQuery = photosQuery.eq('featured', true)
      if (videoCols.includes('featured')) videosQuery = videosQuery.eq('featured', true)
    } else if (filter === 'published') {
      if (albumCols.includes('published')) albumsQuery = albumsQuery.eq('published', true)
      if (photoCols.includes('published')) photosQuery = photosQuery.eq('published', true)
      if (videoCols.includes('published')) videosQuery = videosQuery.eq('published', true)
    } else if (filter === 'drafts') {
      if (albumCols.includes('published')) albumsQuery = albumsQuery.eq('published', false)
      if (photoCols.includes('published')) photosQuery = photosQuery.eq('published', false)
      if (videoCols.includes('published')) videosQuery = videosQuery.eq('published', false)
    }

    // Limit photos and videos to prevent massive transfers on first render
    photosQuery = photosQuery.range(0, 119)
    videosQuery = videosQuery.range(0, 79)

    let albumPhotosQuery = supabase.from('album_photos').select(albumPhotoCols.join(', '))
    if (albumPhotoCols.includes('sort_order')) {
      albumPhotosQuery = albumPhotosQuery.order('sort_order', { ascending: true })
    }

    let albumVideosQuery = supabase.from('album_videos').select(albumVideoCols.join(', '))
    if (albumVideoCols.includes('sort_order')) {
      albumVideosQuery = albumVideosQuery.order('sort_order', { ascending: true })
    }

    // Execute queries in parallel
    const [
      albumsRes,
      photosRes,
      videosRes,
      albumPhotosRes,
      albumVideosRes,
      totalPhotosRes,
      totalVideosRes
    ] = await Promise.all([
      albumsQuery,
      photosQuery,
      videosQuery,
      albumPhotosQuery,
      albumVideosQuery,
      supabase.from('photos').select('*', { count: 'exact', head: true }),
      supabase.from('videos').select('*', { count: 'exact', head: true })
    ])

    const albums = (albumsRes.data || []) as any[]
    const photos = (photosRes.data || []) as any[]
    const videos = (videosRes.data || []) as any[]
    const albumPhotos = (albumPhotosRes.data || []) as any[]
    const albumVideos = (albumVideosRes.data || []) as any[]
    const totalPhotosCount = totalPhotosRes.count
    const totalVideosCount = totalVideosRes.count

    // Fallbacks for videos
    const fallbackVideos = (videos || []).map((v: any) => ({
      ...v,
      category_id: v.category_id || null,
      subcategory_id: v.subcategory_id || null,
      storage_bucket: v.storage_bucket || 'gallery',
      storage_path: v.storage_path || v.public_url || '',
      duration_seconds: v.duration_seconds || null,
      file_size: v.file_size || null,
      featured: v.featured ?? false,
      published: v.published ?? true,
      captured_at: v.captured_at || null,
      youtube_url: v.youtube_url || null,
      youtube_id: v.youtube_id || null,
      video_type: v.video_type || 'video',
      created_by: v.created_by || null,
      created_at: v.created_at || new Date().toISOString(),
      updated_at: v.updated_at || new Date().toISOString()
    }))

    // Sort in memory by created_at desc for timeline
    const sortDesc = (a: any, b: any) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()

    const sortedAlbums = [...(albums || [])].sort(sortDesc)
    const sortedPhotos = [...(photos || [])].sort(sortDesc)
    const sortedVideos = [...fallbackVideos].sort(sortDesc)

    // Helper to hydrate category/subcategory
    const hydrateRelations = (items: any[]) => {
      const cats = categories as any[]
      const subcats = subcategories as any[]
      return items.map((item) => {
        const category = item.category_id ? cats.find((c) => String(c.id) === String(item.category_id)) : null
        const subcategory = item.subcategory_id ? subcats.find((sc) => String(sc.id) === String(item.subcategory_id)) : null
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
