import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { slugify } from '@/lib/gallery-config'
import crypto from 'crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { getExistingColumns, hasColumn } from '@lib/supabase-schema'

const deleteSupabaseStorageFile = async (supabaseClient: any, url: string) => {
  try {
    const parts = url.split('/storage/v1/object/public/gallery/')
    if (parts.length === 2) {
      const storagePath = parts[1]
      if (storagePath) {
        await supabaseClient.storage.from('gallery').remove([storagePath])
      }
    }
  } catch (e) {
    console.error('Failed to delete storage file:', e)
  }
}

const ENTITY_TABLES = new Set([
  'categories',
  'subcategories',
  'albums',
  'photos',
  'videos',
  'messages',
  'settings',
  'activity_logs'
])

const TABLE_COLUMNS: Record<string, string> = {
  categories: 'id, name, slug, description, sort_order, created_at, updated_at',
  subcategories: 'id, category_id, name, slug, description, sort_order, created_at, updated_at',
  albums: 'id, title, slug, description, category_id, subcategory_id, cover_photo_id, cover_url, featured, published, seo_title, seo_description, event_date, parent_id, sort_order, created_by, created_at, updated_at',
  photos: 'id, title, description, tags, alt_text, category_id, subcategory_id, storage_bucket, storage_path, public_url, width, height, file_size, sort_order, featured, published, taken_at, created_by, created_at, updated_at',
  videos: 'id, title, description, category_id, subcategory_id, storage_bucket, storage_path, public_url, thumbnail_url, duration_seconds, file_size, sort_order, featured, published, captured_at, youtube_url, youtube_id, video_type, created_by, created_at, updated_at',
  messages: 'id, name, email, phone, subject, message, status, created_at',
  settings: 'id, website_name, logo_text, hero_title, hero_subtitle, contact_phone, contact_email, contact_address, instagram_url, facebook_url, whatsapp_url, seo_title, seo_description, google_analytics_id, created_at, updated_at',
  activity_logs: 'id, actor_id, action, entity_type, entity_id, metadata, created_at',
  site_content: 'key, value, created_at, updated_at',
  album_photos: 'album_id, photo_id, sort_order, created_at',
  album_videos: 'album_id, video_id, sort_order, created_at',
  admins: 'id, user_id, created_at'
}

const cleanTags = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  return []
}

const normalizePayload = (entity: string, data: Record<string, any>, userId: string): Record<string, any> => {
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

  if (entity === 'messages') {
    return {
      name: String(data.name ?? '').trim(),
      email: String(data.email ?? '').trim(),
      phone: data.phone || null,
      subject: data.subject || null,
      message: String(data.message ?? '').trim(),
      status: data.status || 'unread',
    }
  }

  if (entity === 'settings') {
    return {
      website_name: data.website_name || null,
      logo_text: data.logo_text || null,
      hero_title: data.hero_title || null,
      hero_subtitle: data.hero_subtitle || null,
      contact_phone: data.contact_phone || null,
      contact_email: data.contact_email || null,
      contact_address: data.contact_address || null,
      instagram_url: data.instagram_url || null,
      facebook_url: data.facebook_url || null,
      whatsapp_url: data.whatsapp_url || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      google_analytics_id: data.google_analytics_id || null,
    }
  }

  return data
}

export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const table = entity === 'content' ? 'site_content' : entity

  if (!ENTITY_TABLES.has(entity) && entity !== 'content') {
    return NextResponse.json({ message: 'Unsupported entity' }, { status: 400 })
  }

  try {
    const url = new URL(req.url)
    const search = url.searchParams.get('search')?.trim()
    const filter = url.searchParams.get('filter')?.trim()

    // Parse pagination params
    const page = url.searchParams.has('page') ? Number(url.searchParams.get('page') ?? 1) : null
    const limit = url.searchParams.has('limit') ? Number(url.searchParams.get('limit') ?? 20) : null

    // Determine existing columns to select
    const expected = (TABLE_COLUMNS[table] || '*').split(',').map((c) => c.trim()).filter(Boolean)
    const existingCols = await getExistingColumns(supabase, table, expected)

    let query = supabase.from(table).select(existingCols.join(', '), { count: 'exact' })

    // Apply search filtering in PostgreSQL (defensively avoiding missing fields)
    if (search) {
      if (table === 'photos') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,alt_text.ilike.%${search}%`)
      } else if (table === 'videos') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      } else if (table === 'albums') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      } else if (table === 'messages') {
        const hasSubject = existingCols.includes('subject')
        if (hasSubject) {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`)
        } else {
          query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`)
        }
      }
    }

    // Apply filters in PostgreSQL
    if (filter) {
      if (filter === 'featured' && ['albums', 'photos', 'videos'].includes(table) && existingCols.includes('featured')) {
        query = query.eq('featured', true)
      } else if (filter === 'published' && ['albums', 'photos', 'videos'].includes(table) && existingCols.includes('published')) {
        query = query.eq('published', true)
      } else if (filter === 'drafts' && ['albums', 'photos', 'videos'].includes(table) && existingCols.includes('published')) {
        query = query.eq('published', false)
      }
    }

    // Sort: ordering is ascending for ordering columns, descending for timeline rows
    if (['albums', 'photos', 'videos', 'categories', 'subcategories'].includes(table) && existingCols.includes('sort_order')) {
      query = query.order('sort_order', { ascending: true })
    } else {
      const hasCreatedAt = existingCols.includes('created_at')
      if (hasCreatedAt) {
        query = query.order('created_at', { ascending: false })
      } else if (table === 'site_content') {
        query = query.order('key', { ascending: true })
      }
    }

    // Apply pagination range if requested
    if (page && limit) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
    }

    const { data: items, error, count } = await query
    if (error) {
      console.error(`Error querying ${table} from Supabase:`, error.message)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    let resultData = items || []

    // Fallbacks for settings, messages, videos
    if (table === 'settings') {
      resultData = resultData.map((s: any) => ({
        ...s,
        website_name: s.website_name || 'RavizGraphy',
        logo_text: s.logo_text || s.website_name || 'RAVIZGRAPHY',
        hero_title: s.hero_title || 'Stories Told Through Light & Shadow',
        hero_subtitle: s.hero_subtitle || 'Luxury Wedding, Event & Portrait Photography in Sri Lanka',
        contact_phone: s.contact_phone || '+94 76 305 6168',
        contact_email: s.contact_email || 'ravizthecrash@gmail.com',
        contact_address: s.contact_address || 'Akuressa, Sri Lanka',
        instagram_url: s.instagram_url || 'https://instagram.com/ravizgraphy',
        facebook_url: s.facebook_url || 'https://facebook.com/ravizgraphy',
        whatsapp_url: s.whatsapp_url || 'https://wa.me/94763056168',
        seo_title: s.seo_title || 'RavizGraphy | Luxury Photography & Films',
        seo_description: s.seo_description || 'Elegant wedding stories, event photography, and premium cinema services by Raviz in Sri Lanka.',
        google_analytics_id: s.google_analytics_id || 'G-XXXXXXXXXX',
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.updated_at || new Date().toISOString()
      }))
    } else if (table === 'messages') {
      resultData = resultData.map((m: any) => ({
        ...m,
        subject: m.subject || 'No Subject',
        status: m.status || 'unread',
        created_at: m.created_at || new Date().toISOString()
      }))
    } else if (table === 'videos') {
      resultData = resultData.map((v: any) => ({
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
    }

    // Hydrate category / subcategory links if applicable
    if (['albums', 'photos', 'videos'].includes(entity) && resultData.length > 0) {
      const catCols = await getExistingColumns(supabase, 'categories', (TABLE_COLUMNS.categories || '').split(',').map((s) => s.trim()))
      const subcatCols = await getExistingColumns(supabase, 'subcategories', (TABLE_COLUMNS.subcategories || '').split(',').map((s) => s.trim()))
      const { data: categories } = await supabase.from('categories').select(catCols.join(', ')) as { data: any[] | null }
      const { data: subcategories } = await supabase.from('subcategories').select(subcatCols.join(', ')) as { data: any[] | null }
      
      resultData = resultData.map((item: any) => {
        const category = categories?.find((c) => String(c.id) === String(item.category_id))
        const subcategory = subcategories?.find((sc) => String(sc.id) === String(item.subcategory_id))
        return {
          ...item,
          category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
          subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
        }
      })
    }

    if (page && limit) {
      return NextResponse.json({
        data: resultData,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      })
    }

    return NextResponse.json(resultData)
  } catch (error: any) {
    console.error(`GET handler error for ${table}:`, error)
    return NextResponse.json({ success: false, error: error?.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 })
  }

  const { action = 'create', data = body } = body as { action?: string; data?: any }
  const table = entity === 'content' ? 'site_content' : entity

  try {
    if (entity === 'content' && action === 'update') {
      const updates = Object.entries(data as Record<string, string>).map(([key, value]) => ({ key, value }))
      
      const siteContentCols = await getExistingColumns(supabase, 'site_content', ['key', 'value', 'created_at', 'updated_at'])

      for (const row of updates) {
        // Sanitize update columns
        const sanitizedRow: Record<string, any> = {}
        for (const col of siteContentCols) {
          if (col in row) {
            sanitizedRow[col] = (row as any)[col]
          }
        }

        const { error } = await supabase
          .from('site_content')
          .upsert(sanitizedRow)
        if (error) {
          console.error('Failed to upsert site_content in Supabase:', error.message)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
      }

      // Query and return the updated site content immediately
      const { data: updatedContent, error: fetchErr } = await supabase
        .from('site_content')
        .select(siteContentCols.join(', '))
      if (fetchErr) {
        console.error('Failed to fetch updated site content:', fetchErr.message)
        return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 })
      }

      revalidatePath('/admin')
      revalidatePath('/gallery')
      revalidatePath('/')
      return NextResponse.json({ success: true, data: updatedContent })
    }

    if (!ENTITY_TABLES.has(entity)) {
      return NextResponse.json({ message: 'Unsupported entity' }, { status: 400 })
    }

    if (entity === 'categories' || entity === 'subcategories') {
      revalidateTag(entity)
    }

    if (action === 'bulk-delete') {
      const ids = Array.isArray(data.ids) ? data.ids.map(String) : []
      if (!ids.length) return NextResponse.json({ message: 'No ids provided' }, { status: 400 })
      
      const { error } = await supabase.from(table).delete().in('id', ids)
      if (error) {
        console.error(`Failed bulk delete from ${table}:`, error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      revalidatePath('/admin')
      revalidatePath('/gallery')
      revalidatePath('/')
      return NextResponse.json({ success: true })
    }

    if (action === 'bulk-update') {
      const ids = Array.isArray(data.ids) ? data.ids.map(String) : []
      const rawPayload = normalizePayload(entity, data.values ?? {}, auth.session.user.id)
      if (!ids.length) return NextResponse.json({ message: 'No ids provided' }, { status: 400 })

      // Sanitize payload
      const validCols = await getExistingColumns(supabase, table, Object.keys(rawPayload))
      const sanitizedPayload: Record<string, any> = {}
      for (const col of validCols) {
        if (col in rawPayload) {
          sanitizedPayload[col] = rawPayload[col]
        }
      }

      const { error } = await supabase.from(table).update(sanitizedPayload).in('id', ids)
      if (error) {
        console.error(`Failed bulk update on ${table}:`, error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      revalidatePath('/admin')
      revalidatePath('/gallery')
      revalidatePath('/')
      return NextResponse.json({ success: true })
    }

    if (action === 'link-assets' && entity === 'albums') {
      const albumId = String(data.album_id)
      const photoIds = Array.isArray(data.photo_ids) ? data.photo_ids.map(String) : []
      const videoIds = Array.isArray(data.video_ids) ? data.video_ids.map(String) : []

      await supabase.from('album_photos').delete().eq('album_id', albumId)
      await supabase.from('album_videos').delete().eq('album_id', albumId)

      if (photoIds.length > 0) {
        const { error: photoErr } = await supabase
          .from('album_photos')
          .insert(photoIds.map((photo_id: string, sort_order: number) => ({ album_id: albumId, photo_id, sort_order })))
        if (photoErr) {
          console.error('Failed to link album photos in Supabase:', photoErr.message)
          return NextResponse.json({ success: false, error: photoErr.message }, { status: 500 })
        }
      }

      if (videoIds.length > 0) {
        const { error: videoErr } = await supabase
          .from('album_videos')
          .insert(videoIds.map((video_id: string, sort_order: number) => ({ album_id: albumId, video_id, sort_order })))
        if (videoErr) {
          console.error('Failed to link album videos in Supabase:', videoErr.message)
          return NextResponse.json({ success: false, error: videoErr.message }, { status: 500 })
        }
      }

      revalidatePath('/admin')
      revalidatePath('/gallery')
      revalidatePath('/')
      return NextResponse.json({ success: true })
    }

    const payload = normalizePayload(entity, data, auth.session.user.id)
    if ('title' in payload && !payload.title) return NextResponse.json({ message: 'Title is required' }, { status: 400 })
    if ('name' in payload && !payload.name) return NextResponse.json({ message: 'Name is required' }, { status: 400 })
    if ('slug' in payload && !payload.slug) return NextResponse.json({ message: 'Slug is required' }, { status: 400 })

    if (entity === 'photos' || entity === 'videos') {
      if (data.public_url) payload.public_url = data.public_url
      if (data.storage_path) payload.storage_path = data.storage_path
      if (data.storage_bucket) payload.storage_bucket = data.storage_bucket
    }

    // Sanitize payload columns
    const expectedPayloadCols = Object.keys(payload)
    const validPayloadCols = await getExistingColumns(supabase, table, expectedPayloadCols)
    const sanitizedPayload: Record<string, any> = {}
    for (const col of validPayloadCols) {
      if (col in payload) {
        sanitizedPayload[col] = payload[col]
      }
    }

    // Determine select columns
    const selectExpected = (TABLE_COLUMNS[table] || '*').split(',').map((c) => c.trim()).filter(Boolean)
    const selectCols = await getExistingColumns(supabase, table, selectExpected)

    let savedRecord: any = null

    if (action === 'update' && data.id) {
      const { data: updated, error } = await supabase
        .from(table)
        .update(sanitizedPayload)
        .eq('id', data.id)
        .select(selectCols.join(', '))
        .single()
      if (error) {
        console.error(`Failed to update ${table} in Supabase:`, error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      savedRecord = updated
    } else {
      // Create new record
      const insertPayload = {
        ...sanitizedPayload,
        id: data.id || crypto.randomUUID()
      }
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(insertPayload)
        .select(selectCols.join(', '))
        .single()
      if (error) {
        console.error(`Failed to insert ${table} in Supabase:`, error.message)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      savedRecord = inserted
    }

    // Save to activity log
    await supabase.from('activity_logs').insert({
      actor_id: auth.session.user.id,
      action,
      entity_type: entity,
      entity_id: savedRecord.id,
      metadata: { title: savedRecord.title ?? savedRecord.name ?? null }
    })

    // Hydrate category/subcategory for response
    let category = null
    let subcategory = null
    if (savedRecord.category_id) {
      const catCols = await getExistingColumns(supabase, 'categories', (TABLE_COLUMNS.categories || '').split(',').map((s) => s.trim()))
      const { data: cat } = await supabase.from('categories').select(catCols.join(', ')).eq('id', savedRecord.category_id).maybeSingle() as any
      category = cat
    }
    if (savedRecord.subcategory_id) {
      const subcatCols = await getExistingColumns(supabase, 'subcategories', (TABLE_COLUMNS.subcategories || '').split(',').map((s) => s.trim()))
      const { data: subcat } = await supabase.from('subcategories').select(subcatCols.join(', ')).eq('id', savedRecord.subcategory_id).maybeSingle() as any
      subcategory = subcat
    }

    const responseRecord = {
      ...savedRecord,
      category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      subcategory: subcategory ? { id: subcategory.id, name: subcategory.name, slug: subcategory.slug } : null,
    }

    revalidatePath('/admin')
    revalidatePath('/gallery')
    revalidatePath('/')
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
  const supabase = auth.adminClient

  if (!ENTITY_TABLES.has(entity)) {
    return NextResponse.json({ message: 'Unsupported entity' }, { status: 400 })
  }

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ message: 'Missing id parameter' }, { status: 400 })

  const table = entity

  if (entity === 'categories' || entity === 'subcategories') {
    revalidateTag(entity)
  }

  try {
    const expected = (TABLE_COLUMNS[table] || '*').split(',').map((c) => c.trim()).filter(Boolean)
    const selectCols = await getExistingColumns(supabase, table, expected)

    const { data: item, error: fetchErr } = await supabase
      .from(table)
      .select(selectCols.join(', '))
      .eq('id', id)
      .maybeSingle() as any
    
    if (fetchErr || !item) {
      console.error(`Item not found for delete from ${table}:`, fetchErr?.message || 'Item empty')
      return NextResponse.json({ message: 'Record not found' }, { status: 404 })
    }

    // Delete associated files if photo/video
    if (entity === 'photos' || entity === 'videos') {
      const url = item.public_url || item.cover_url
      if (url && url.includes('/storage/v1/object/public/gallery/')) {
        await deleteSupabaseStorageFile(supabase, url)
      }
      
      if (entity === 'videos' && item.thumbnail_url && item.thumbnail_url.includes('/storage/v1/object/public/gallery/')) {
        await deleteSupabaseStorageFile(supabase, item.thumbnail_url)
      }
    }

    const { error: deleteErr } = await supabase.from(table).delete().eq('id', id)
    if (deleteErr) {
      console.error(`Failed to delete item from ${table}:`, deleteErr.message)
      return NextResponse.json({ success: false, error: deleteErr.message }, { status: 500 })
    }

    revalidatePath('/admin')
    revalidatePath('/gallery')
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ message: error?.message || 'Delete failed' }, { status: 500 })
  }
}
