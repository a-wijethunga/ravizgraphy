import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { slugify } from '@/lib/gallery-config'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import { getExistingColumns } from '@lib/supabase-schema'

const ALBUM_SELECT_COLUMNS_EXPECTED = 'id, title, slug, description, category_id, subcategory_id, cover_photo_id, cover_url, featured, published, seo_title, seo_description, event_date, parent_id, sort_order, created_by, created_at, updated_at'

export async function GET(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim()
  const filter = url.searchParams.get('filter')?.trim()
  const page = url.searchParams.has('page') ? Number(url.searchParams.get('page') ?? 1) : null
  const limit = url.searchParams.has('limit') ? Number(url.searchParams.get('limit') ?? 12) : null

  try {
    const selectCols = await getExistingColumns(supabase, 'albums', ALBUM_SELECT_COLUMNS_EXPECTED.split(',').map((s) => s.trim()))

    let query = supabase
      .from('albums')
      .select(selectCols.join(', '), { count: 'exact' })

    if (selectCols.includes('sort_order')) {
      query = query.order('sort_order', { ascending: true })
    }

    // Apply search in database
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    // Apply filter in database
    if (filter) {
      if (filter === 'featured' && selectCols.includes('featured')) {
        query = query.eq('featured', true)
      } else if (filter === 'published' && selectCols.includes('published')) {
        query = query.eq('published', true)
      } else if (filter === 'drafts' && selectCols.includes('published')) {
        query = query.eq('published', false)
      }
    }

    // Apply pagination range if requested
    if (page && limit) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
    }

    const { data: albums, error, count } = await query

    if (error) {
      console.error('Failed to get albums from Supabase:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (page && limit) {
      return NextResponse.json({
        data: albums || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      })
    }

    return NextResponse.json(albums || [])
  } catch (err: any) {
    console.error('Albums GET error:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const { action = 'create', data = body } = body as { action?: string; data?: any }

  try {
    const id = data.id || crypto.randomUUID()
    const now = new Date().toISOString()

    const payload = {
      title: String(data.title ?? '').trim(),
      slug: slugify(String(data.slug || data.title || '')),
      description: data.description || null,
      category_id: data.category_id || null,
      subcategory_id: data.subcategory_id || null,
      cover_url: data.cover_url || null,
      cover_photo_id: data.cover_photo_id || null,
      featured: Boolean(data.featured),
      published: data.published !== false,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      event_date: data.event_date || null,
      parent_id: data.parent_id || null,
      sort_order: data.sort_order !== undefined ? Number(data.sort_order) : 0,
      created_by: auth.session.user.id,
      updated_at: now
    }

    const selectCols = await getExistingColumns(supabase, 'albums', ALBUM_SELECT_COLUMNS_EXPECTED.split(',').map((s) => s.trim()))

    // Sanitize payload columns
    const sanitizedPayload: Record<string, any> = {}
    for (const col of selectCols) {
      if (col in payload) {
        sanitizedPayload[col] = (payload as any)[col]
      }
    }

    if (action === 'update' || data.id) {
      const { data: updated, error } = await supabase
        .from('albums')
        .update(sanitizedPayload)
        .eq('id', id)
        .select(selectCols.join(', '))
        .single()
      if (error) {
        console.error('Failed to update album in Supabase:', error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      revalidatePath('/admin')
      revalidatePath('/gallery')
      revalidatePath('/')
      return NextResponse.json({ success: true, data: updated })
    } else {
      const insertPayload: Record<string, any> = {
        ...sanitizedPayload,
        id,
      }
      if (selectCols.includes('created_at')) {
        insertPayload.created_at = data.created_at || now
      }

      const { data: inserted, error } = await supabase
        .from('albums')
        .insert(insertPayload)
        .select(selectCols.join(', '))
        .single()
      if (error) {
        console.error('Failed to insert album in Supabase:', error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      revalidatePath('/admin')
      revalidatePath('/gallery')
      revalidatePath('/')
      return NextResponse.json({ success: true, data: inserted })
    }
  } catch (error: any) {
    console.error('Albums mutation error:', error)
    return NextResponse.json({ message: error?.message || 'Mutation failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 })

  try {
    const { error } = await supabase.from('albums').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete album from Supabase:', error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    revalidatePath('/admin')
    revalidatePath('/gallery')
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Album delete error:', error)
    return NextResponse.json({ message: error?.message || 'Delete failed' }, { status: 500 })
  }
}
