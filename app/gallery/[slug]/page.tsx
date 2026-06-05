import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDB } from '@lib/local-db'
import GalleryAlbumClient from '@/components/GalleryAlbumClient'
import type { GalleryAlbumDetail } from '@/types/gallery'

const getAlbum = async (slug: string): Promise<GalleryAlbumDetail | null> => {
  const db = getDB()
  
  // Find the published album by slug
  const album = (db.albums || []).find(
    (a) => String(a.slug) === slug && a.published
  )

  if (!album) return null

  // Hydrate category/subcategory
  const category = db.categories.find((c) => String(c.id) === String(album.category_id))
  const subcategory = db.subcategories.find((sc) => String(sc.id) === String(album.subcategory_id))

  const albumPhotos = db.album_photos || []
  const albumVideos = db.album_videos || []
  const photosTable = db.photos || []
  const videosTable = db.videos || []

  // Get matching photos
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

  // Sort photos
  photos.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

  // Get matching videos
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

  // Sort videos
  videos.sort((a, b) => Number(a.sort_order) - Number(b.sort_order))

  // Find sub-albums
  const subAlbums = (db.albums || [])
    .filter((a) => String(a.parent_id) === String(album.id) && a.published)
    .map((sub) => {
      const subPhotoCount = (db.album_photos || []).filter((link) => String(link.album_id) === String(sub.id)).length
      const subVideoCount = (db.album_videos || []).filter((link) => String(link.album_id) === String(sub.id)).length
      const subCat = db.categories.find((c) => String(c.id) === String(sub.category_id))
      return {
        ...sub,
        category: subCat ? { id: subCat.id, name: subCat.name, slug: subCat.slug } : null,
        photo_count: subPhotoCount,
        video_count: subVideoCount,
      }
    })

  return {
    ...album,
    category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
    subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
    photos,
    videos,
    sub_albums: subAlbums,
  } as any
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const album = await getAlbum(slug)
  if (!album) return {}

  return {
    title: album.seo_title || `${album.title} | RavizGraphy`,
    description: album.seo_description || album.description || 'Luxury photography gallery by RavizGraphy.',
    openGraph: {
      title: album.seo_title || album.title,
      description: album.seo_description || album.description || undefined,
      images: album.cover_url ? [{ url: album.cover_url }] : undefined,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function GalleryAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const album = await getAlbum(slug)

  if (!album) notFound()

  return <GalleryAlbumClient album={album} />
}
