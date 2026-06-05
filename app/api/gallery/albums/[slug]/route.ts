import { NextResponse } from 'next/server'
import { getDB } from '@lib/local-db'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = getDB()

  // Find the published album by slug
  const album = (db.albums || []).find(
    (a) => String(a.slug) === slug && a.published
  )

  if (!album) {
    return NextResponse.json({ message: 'Album not found' }, { status: 404 })
  }

  // Hydrate category/subcategory
  const category = db.categories.find((c) => String(c.id) === String(album.category_id))
  const subcategory = db.subcategories.find((sc) => String(sc.id) === String(album.subcategory_id))

  const albumPhotos = db.album_photos || []
  const albumVideos = db.album_videos || []
  const photosTable = db.photos || []
  const videosTable = db.videos || []

  // Get matching photos (that are published)
  const photos = albumPhotos
    .filter((link) => String(link.album_id) === String(album.id))
    .map((link) => {
      const photo = photosTable.find((p) => String(p.id) === String(link.photo_id) && p.published)
      if (!photo) return null
      return {
        ...photo,
        sort_order: link.sort_order ?? photo.sort_order ?? 0,
      }
    })
    .filter(Boolean) as any[]

  // Sort photos by link's sort_order
  photos.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

  // Get matching videos (that are published)
  const videos = albumVideos
    .filter((link) => String(link.album_id) === String(album.id))
    .map((link) => {
      const video = videosTable.find((v) => String(v.id) === String(link.video_id) && v.published)
      if (!video) return null
      return {
        ...video,
        sort_order: link.sort_order ?? video.sort_order ?? 0,
      }
    })
    .filter(Boolean) as any[]

  // Sort videos by link's sort_order
  videos.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

  // Fetch nested sub-albums (if this is a main album)
  const sub_albums = (db.albums || [])
    .filter((a) => String(a.parent_id) === String(album.id) && a.published)
    .map((sub) => {
      const cat = db.categories.find((c) => String(c.id) === String(sub.category_id))
      const subPhotoCount = albumPhotos.filter((link) => {
        if (String(link.album_id) !== String(sub.id)) return false
        const photo = photosTable.find((p) => String(p.id) === String(link.photo_id))
        return photo ? photo.published : false
      }).length
      const subVideoCount = albumVideos.filter((link) => {
        if (String(link.album_id) !== String(sub.id)) return false
        const video = videosTable.find((v) => String(v.id) === String(link.video_id))
        return video ? video.published : false
      }).length
      return {
        ...sub,
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
        photo_count: subPhotoCount,
        video_count: subVideoCount,
      }
    })
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))

  return NextResponse.json({
    ...album,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
    photos,
    videos,
    sub_albums,
  })
}
