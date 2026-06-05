import { NextResponse } from 'next/server'
import { getDB } from '@lib/local-db'
import type { GallerySort } from '@/types/gallery'

const PAGE_SIZE = 9

const sortAlbums = (albums: any[], sort: GallerySort | null) => {
  return albums.sort((a, b) => {
    if (sort === 'oldest') {
      const dateA = a.event_date ? new Date(a.event_date).getTime() : 0
      const dateB = b.event_date ? new Date(b.event_date).getTime() : 0
      return dateA - dateB
    }
    if (sort === 'title-asc') {
      return String(a.title ?? '').localeCompare(String(b.title ?? ''))
    }
    if (sort === 'title-desc') {
      return String(b.title ?? '').localeCompare(String(a.title ?? ''))
    }
    // default/newest: event_date desc
    const dateA = a.event_date ? new Date(a.event_date).getTime() : 0
    const dateB = b.event_date ? new Date(b.event_date).getTime() : 0
    if (dateA !== dateB) return dateB - dateA
    // fallback to created_at
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0
    return createdB - createdA
  })
}

export async function GET(req: Request) {
  const db = await getDB()

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim().toLowerCase()
  const category = url.searchParams.get('category')?.trim()
  const subcategory = url.searchParams.get('subcategory')?.trim()
  const featured = url.searchParams.get('featured')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const page = Math.max(Number(url.searchParams.get('page') ?? 1), 1)
  const limit = Math.min(Number(url.searchParams.get('limit') ?? PAGE_SIZE), 24)
  const sort = url.searchParams.get('sort') as GallerySort | null

  // Prep categories with inline subcategories
  const categories = (db.categories || [])
    .map((cat) => {
      const subcats = (db.subcategories || [])
        .filter((sub) => String(sub.category_id) === String(cat.id))
        .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      return {
        ...cat,
        subcategories: subcats,
      }
    })
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))

  let categoryId: string | null = null
  let subcategoryId: string | null = null

  if (category && category !== 'all') {
    const catObj = db.categories.find((c) => c.slug === category)
    if (!catObj) {
      return NextResponse.json({ albums: [], categories, total: 0, nextPage: null })
    }
    categoryId = catObj.id
  }

  if (subcategory && subcategory !== 'all') {
    const subcatObj = db.subcategories.find((sc) => sc.slug === subcategory)
    if (!subcatObj) {
      return NextResponse.json({ albums: [], categories, total: 0, nextPage: null })
    }
    subcategoryId = subcatObj.id
  }

  // Filter published albums (Main Albums only - no sub-albums)
  let filteredAlbums = (db.albums || []).filter((a) => a.published && (!a.parent_id || a.parent_id === ''))

  if (search) {
    filteredAlbums = filteredAlbums.filter(
      (a) =>
        String(a.title ?? '').toLowerCase().includes(search) ||
        String(a.description ?? '').toLowerCase().includes(search) ||
        String(a.seo_title ?? '').toLowerCase().includes(search)
    )
  }

  if (categoryId) {
    filteredAlbums = filteredAlbums.filter((a) => String(a.category_id) === String(categoryId))
  }

  if (subcategoryId) {
    filteredAlbums = filteredAlbums.filter((a) => String(a.subcategory_id) === String(subcategoryId))
  }

  if (featured === 'true') {
    filteredAlbums = filteredAlbums.filter((a) => a.featured)
  }

  if (from) {
    filteredAlbums = filteredAlbums.filter((a) => a.event_date && a.event_date >= from)
  }

  if (to) {
    filteredAlbums = filteredAlbums.filter((a) => a.event_date && a.event_date <= to)
  }

  // Sort
  sortAlbums(filteredAlbums, sort)

  const total = filteredAlbums.length
  const rangeFrom = (page - 1) * limit
  const rangeTo = rangeFrom + limit
  const paginatedAlbums = filteredAlbums.slice(rangeFrom, rangeTo)

  // Hydrate albums with category and count details
  const albumIds = paginatedAlbums.map((a) => String(a.id))
  
  const albumPhotos = db.album_photos || []
  const albumVideos = db.album_videos || []
  const photosTable = db.photos || []
  const videosTable = db.videos || []

  const hydratedAlbums = paginatedAlbums.map((album) => {
    const cat = db.categories.find((c) => String(c.id) === String(album.category_id))
    const sub = db.subcategories.find((s) => String(s.id) === String(album.subcategory_id))

    // Count published photos linked to this album
    const photoCount = albumPhotos.filter((link) => {
      if (String(link.album_id) !== String(album.id)) return false
      const photo = photosTable.find((p) => String(p.id) === String(link.photo_id))
      return photo ? photo.published : false
    }).length

    // Count published videos linked to this album
    const videoCount = albumVideos.filter((link) => {
      if (String(link.album_id) !== String(album.id)) return false
      const video = videosTable.find((v) => String(v.id) === String(link.video_id))
      return video ? video.published : false
    }).length

    return {
      ...album,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      subcategory: sub ? { id: sub.id, name: sub.name, slug: sub.slug } : null,
      photo_count: photoCount,
      video_count: videoCount,
    }
  })

  const nextPage = rangeTo < total ? page + 1 : null

  return NextResponse.json({
    albums: hydratedAlbums,
    categories,
    total,
    nextPage,
  })
}
