import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { slugify } from '@/lib/gallery-config'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

export async function GET(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const { data: albums, error } = await supabase
    .from('albums')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to get albums from Supabase:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json(albums || [])
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

    if (action === 'update' || data.id) {
      const { data: updated, error } = await supabase
        .from('albums')
        .update(payload)
        .eq('id', id)
        .select()
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
      const { data: inserted, error } = await supabase
        .from('albums')
        .insert({
          ...payload,
          id,
          created_at: data.created_at || now
        })
        .select()
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
