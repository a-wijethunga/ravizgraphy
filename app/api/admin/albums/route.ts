import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { getDB, saveDB } from '@lib/local-db'
import { slugify } from '@/lib/gallery-config'
import crypto from 'crypto'

export async function GET(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  const db = await getDB()
  return NextResponse.json(db.albums || [])
}

export async function POST(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const { action = 'create', data = body } = body as { action?: string; data?: any }
  const db = await getDB()

  try {
    const id = data.id || crypto.randomUUID()
    const now = new Date().toISOString()

    const payload = {
      id,
      title: String(data.title ?? '').trim(),
      slug: slugify(String(data.slug || data.title || '')),
      description: data.description || null,
      category_id: data.category_id || 'cat-4',
      subcategory_id: data.subcategory_id || null,
      cover_url: data.cover_url || null,
      featured: Boolean(data.featured),
      published: data.published !== false,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      event_date: data.event_date || null,
      parent_id: data.parent_id || null,
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : 0,
      created_by: auth.session.user.id,
      created_at: data.created_at || now,
      updated_at: now
    }

    if (action === 'update' || data.id) {
      const existingIdx = db.albums.findIndex((a) => String(a.id) === String(id))
      if (existingIdx === -1) {
        return NextResponse.json({ message: 'Album not found' }, { status: 404 })
      }
      db.albums[existingIdx] = {
        ...db.albums[existingIdx],
        ...payload
      }
    } else {
      db.albums.push(payload)
    }

    await saveDB(db)
    return NextResponse.json({ success: true, data: payload })
  } catch (error: any) {
    console.error('Albums mutation error:', error)
    return NextResponse.json({ message: error?.message || 'Mutation failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 })

  const db = await getDB()

  try {
    const existingIdx = db.albums.findIndex((a) => String(a.id) === String(id))
    if (existingIdx === -1) {
      return NextResponse.json({ message: 'Album not found' }, { status: 404 })
    }

    db.albums.splice(existingIdx, 1)

    // Remove relationships
    db.album_photos = db.album_photos.filter((p) => String(p.album_id) !== String(id))
    db.album_videos = db.album_videos.filter((v) => String(v.album_id) !== String(id))

    await saveDB(db)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Album delete error:', error)
    return NextResponse.json({ message: error?.message || 'Delete failed' }, { status: 500 })
  }
}
