import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { slugify } from '@/lib/gallery-config'
import { getDB, saveDB } from '@lib/local-db'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { supabase } from '../../../../src/lib/supabase'

const deleteSupabaseStorageFile = async (url: string) => {
  try {
    const parts = url.split('/storage/v1/object/public/gallery/')
    if (parts.length === 2) {
      const storagePath = parts[1]
      if (storagePath) {
        await supabase.storage.from('gallery').remove([storagePath])
      }
    }
  } catch (e) {
    console.error('Failed to delete storage file:', e)
  }
}

const ENTITY_TABLES = new Set(['categories', 'subcategories', 'albums', 'photos', 'videos', 'messages', 'settings'])

const cleanTags = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  return []
}

const normalizePayload = (entity: string, data: Record<string, any>, userId: string) => {
  if (entity === 'categories') {
    return {
      name: String(data.name ?? '').trim(),
      slug: slugify(String(data.slug || data.name || '')),
      description: data.description || null,
      sort_order: Number(data.sort_order ?? 0),
    }
  }

  if (entity === 'subcategories') {
    return {
      category_id: data.category_id,
      name: String(data.name ?? '').trim(),
      slug: slugify(String(data.slug || data.name || '')),
      description: data.description || null,
      sort_order: Number(data.sort_order ?? 0),
    }
  }

  if (entity === 'albums') {
    return {
      title: String(data.title ?? '').trim(),
      slug: slugify(String(data.slug || data.title || '')),
      description: data.description || null,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id || null,
      cover_photo_id: data.cover_photo_id || null,
      cover_url: data.cover_url || null,
      featured: Boolean(data.featured),
      published: data.published !== false,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      event_date: data.event_date || null,
      parent_id: data.parent_id || null,
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : undefined,
      created_by: userId,
    }
  }

  if (entity === 'photos') {
    return {
      title: String(data.title ?? '').trim(),
      description: data.description || null,
      tags: cleanTags(data.tags),
      alt_text: String(data.alt_text || data.title || 'Gallery image').trim(),
      category_id: data.category_id,
      subcategory_id: data.subcategory_id || null,
      sort_order: Number(data.sort_order ?? 0),
      featured: Boolean(data.featured),
      published: data.published !== false,
      taken_at: data.taken_at || null,
    }
  }

  if (entity === 'videos') {
    return {
      title: String(data.title ?? '').trim(),
      description: data.description || null,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id || null,
      thumbnail_url: data.thumbnail_url || null,
      duration_seconds: data.duration_seconds ? Number(data.duration_seconds) : null,
      sort_order: Number(data.sort_order ?? 0),
      featured: Boolean(data.featured),
      published: data.published !== false,
      captured_at: data.captured_at || null,
      youtube_url: data.youtube_url || null,
      youtube_id: data.youtube_id || null,
      video_type: data.video_type || 'video',
      public_url: data.public_url || null,
    }
  }

  return data
}

export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  const db = await getDB()

  if (!ENTITY_TABLES.has(entity) && entity !== 'content') {
    return NextResponse.json({ message: 'Unsupported entity' }, { status: 400 })
  }

  if (entity === 'content') {
    return NextResponse.json(db.site_content || [])
  }

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim().toLowerCase()

  let items = (db as any)[entity] || []

  // Apply search filtering
  if (search && ['albums', 'photos', 'videos'].includes(entity)) {
    items = items.filter((item: any) => {
      const titleMatch = String(item.title ?? '').toLowerCase().includes(search)
      const descMatch = String(item.description ?? '').toLowerCase().includes(search)
      return titleMatch || descMatch
    })
  }

  // Hydrate category / subcategory links
  items = items.map((item: any) => {
    const category = db.categories.find((c) => String(c.id) === String(item.category_id))
    const subcategory = db.subcategories.find((sc) => String(sc.id) === String(item.subcategory_id))
    return {
      ...item,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
    }
  })

  // Sort by created_at descending by default (or id if missing created_at)
  items.sort((a: any, b: any) => {
    const timeA = new Date(a.created_at || 0).getTime()
    const timeB = new Date(b.created_at || 0).getTime()
    return timeB - timeA
  })

  return NextResponse.json(items)
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const { action = 'create', data = body } = body as { action?: string; data?: any }

  const db = await getDB()

  try {
    if (entity === 'content' && action === 'update') {
      const updates = Object.entries(data as Record<string, string>).map(([key, value]) => ({ key, value }))
      
      if (!db.site_content) db.site_content = []
      
      for (const row of updates) {
        const existingIdx = db.site_content.findIndex((item) => item.key === row.key)
        if (existingIdx > -1) {
          db.site_content[existingIdx] = row
        } else {
          db.site_content.push(row)
        }
      }
      await saveDB(db)
      return NextResponse.json({ success: true })
    }

    if (!ENTITY_TABLES.has(entity)) {
      return NextResponse.json({ message: 'Unsupported entity' }, { status: 400 })
    }

    if (action === 'bulk-delete') {
      const ids = Array.isArray(data.ids) ? data.ids.map(String) : []
      if (!ids.length) return NextResponse.json({ message: 'No ids provided' }, { status: 400 })
      
      // Delete items
      const table = (db as any)[entity] || []
      const filtered = table.filter((item: any) => !ids.includes(String(item.id)))
      ;(db as any)[entity] = filtered

      // Clean relationship mappings
      if (entity === 'albums') {
        db.album_photos = db.album_photos.filter((p) => !ids.includes(String(p.album_id)))
        db.album_videos = db.album_videos.filter((v) => !ids.includes(String(v.album_id)))
      } else if (entity === 'photos') {
        db.album_photos = db.album_photos.filter((p) => !ids.includes(String(p.photo_id)))
      } else if (entity === 'videos') {
        db.album_videos = db.album_videos.filter((v) => !ids.includes(String(v.video_id)))
      }

      await saveDB(db)
      return NextResponse.json({ success: true })
    }

    if (action === 'bulk-update') {
      const ids = Array.isArray(data.ids) ? data.ids.map(String) : []
      const values = normalizePayload(entity, data.values ?? {}, auth.session.user.id)
      if (!ids.length) return NextResponse.json({ message: 'No ids provided' }, { status: 400 })

      const table = (db as any)[entity] || []
      for (const item of table) {
        if (ids.includes(String(item.id))) {
          Object.assign(item, values, { updated_at: new Date().toISOString() })
        }
      }

      await saveDB(db)
      return NextResponse.json({ success: true })
    }

    if (action === 'link-assets' && entity === 'albums') {
      const albumId = String(data.album_id)
      const photoIds = Array.isArray(data.photo_ids) ? data.photo_ids.map(String) : []
      const videoIds = Array.isArray(data.video_ids) ? data.video_ids.map(String) : []

      if (!db.album_photos) db.album_photos = []
      if (!db.album_videos) db.album_videos = []

      // Keep only other albums' mappings, and replace this album's mappings
      db.album_photos = db.album_photos.filter((p) => String(p.album_id) !== albumId)
      db.album_videos = db.album_videos.filter((v) => String(v.album_id) !== albumId)

      photoIds.forEach((photo_id: string, index: number) => {
        db.album_photos.push({ album_id: albumId, photo_id, sort_order: index })
      })

      videoIds.forEach((video_id: string, index: number) => {
        db.album_videos.push({ album_id: albumId, video_id, sort_order: index })
      })

      await saveDB(db)
      return NextResponse.json({ success: true })
    }

    const payload = normalizePayload(entity, data, auth.session.user.id)
    if ('title' in payload && !payload.title) return NextResponse.json({ message: 'Title is required' }, { status: 400 })
    if ('name' in payload && !payload.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 })
    if ('slug' in payload && !payload.slug) return NextResponse.json({ message: 'Slug is required' }, { status: 400 })

    let savedRecord: any = null
    const table = (db as any)[entity] || []

    if (action === 'update' && data.id) {
      const existingIdx = table.findIndex((item: any) => String(item.id) === String(data.id))
      if (existingIdx === -1) {
        return NextResponse.json({ message: 'Record not found' }, { status: 404 })
      }
      const existing = table[existingIdx]
      savedRecord = {
        ...existing,
        ...payload,
        id: data.id,
        updated_at: new Date().toISOString(),
      }
      table[existingIdx] = savedRecord
    } else {
      // Create new record
      savedRecord = {
        ...payload,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      table.push(savedRecord)
    }

    // Hydrate for response (category/subcategory)
    const category = db.categories.find((c) => String(c.id) === String(savedRecord.category_id))
    const subcategory = db.subcategories.find((sc) => String(sc.id) === String(savedRecord.subcategory_id))
    const responseRecord = {
      ...savedRecord,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
    }

    // Save to activity log
    if (!db.activity_logs) db.activity_logs = []
    db.activity_logs.push({
      id: crypto.randomUUID(),
      actor_id: auth.session.user.id,
      action,
      entity_type: entity,
      entity_id: savedRecord.id,
      metadata: { title: savedRecord.title ?? savedRecord.name ?? null },
      created_at: new Date().toISOString(),
    })

    await saveDB(db)
    return NextResponse.json({ success: true, data: responseRecord })
  } catch (error: any) {
    console.error('Mutation error:', error)
    return NextResponse.json({ message: error?.message || 'Mutation failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  if (!ENTITY_TABLES.has(entity)) {
    return NextResponse.json({ message: 'Unsupported entity' }, { status: 400 })
  }

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 })

  const db = await getDB()

  try {
    const table = (db as any)[entity] || []
    const existingIdx = table.findIndex((item: any) => String(item.id) === String(id))
    if (existingIdx === -1) {
      return NextResponse.json({ message: 'Record not found' }, { status: 404 })
    }

    const item = table[existingIdx]

    // If there is an associated file, delete it from storage/local filesystem
    if (entity === 'photos' || entity === 'videos') {
      const url = item.public_url || item.cover_url
      if (url) {
        if (url.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', url)
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath)
            } catch (e) {
              console.error('Failed to delete physical file:', e)
            }
          }
        } else if (url.includes('/storage/v1/object/public/gallery/')) {
          await deleteSupabaseStorageFile(url)
        }
      }
      
      // Also delete video thumbnail if exists
      if (entity === 'videos' && item.thumbnail_url) {
        const thumbUrl = item.thumbnail_url
        if (thumbUrl.startsWith('/uploads/')) {
          const thumbPath = path.join(process.cwd(), 'public', thumbUrl)
          if (fs.existsSync(thumbPath)) {
            try {
              fs.unlinkSync(thumbPath)
            } catch (e) {
              console.error('Failed to delete video thumbnail file:', e)
            }
          }
        } else if (thumbUrl.includes('/storage/v1/object/public/gallery/')) {
          await deleteSupabaseStorageFile(thumbUrl)
        }
      }
    }

    // Remove from main table
    table.splice(existingIdx, 1)

    // Remove from linking tables
    if (entity === 'albums') {
      db.album_photos = db.album_photos.filter((p) => String(p.album_id) !== String(id))
      db.album_videos = db.album_videos.filter((v) => String(v.album_id) !== String(id))
    } else if (entity === 'photos') {
      db.album_photos = db.album_photos.filter((p) => String(p.photo_id) !== String(id))
    } else if (entity === 'videos') {
      db.album_videos = db.album_videos.filter((v) => String(v.video_id) !== String(id))
    }

    await saveDB(db)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ message: error?.message || 'Delete failed' }, { status: 500 })
  }
}
