import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { slugify } from '@/lib/gallery-config'
import path from 'path'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm']
const MAX_IMAGE_SIZE = 25 * 1024 * 1024
const MAX_VIDEO_SIZE = 500 * 1024 * 1024

const parseTags = (value: FormDataEntryValue | null) =>
  String(value ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

// Supabase Storage upload helper
const saveSupabaseFile = async (
  supabaseClient: any,
  entityType: string,
  categoryId: string,
  file: File
): Promise<string> => {
  const ext = path.extname(file.name)
  const base = path.basename(file.name, ext)
  // Ensure a unique safe filename to prevent collisions
  const safeName = `${slugify(base)}-${Date.now()}${ext}`

  const storagePath = `${entityType}/${categoryId}/${safeName}`
  const buffer = Buffer.from(await file.arrayBuffer())

  // Upload to Supabase Storage
  const { error } = await supabaseClient.storage
    .from('gallery')
    .upload(storagePath, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`)
  }

  // Get and return the public URL
  const { data: { publicUrl } } = supabaseClient.storage
    .from('gallery')
    .getPublicUrl(storagePath)

  return publicUrl
}

export async function POST(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const formData = await req.formData()
  const kind = String(formData.get('kind') ?? 'photo')
  const files = formData.getAll('files').filter((item) => item instanceof File) as File[]
  const thumbnail = formData.get('thumbnail') instanceof File ? (formData.get('thumbnail') as File) : null
  const albumId = String(formData.get('album_id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  const subcategoryId = String(formData.get('subcategory_id') ?? '') || null
  const altText = String(formData.get('alt_text') ?? title ?? '').trim()
  const tags = parseTags(formData.get('tags'))
  const featured = String(formData.get('featured') ?? 'false') === 'true'
  const published = String(formData.get('published') ?? 'true') !== 'false'

  if (!files.length) return NextResponse.json({ message: 'No files uploaded' }, { status: 400 })
  if (!title) return NextResponse.json({ message: 'Title is required' }, { status: 400 })
  if (!categoryId) return NextResponse.json({ message: 'Category is required' }, { status: 400 })

  try {
    const uploaded: any[] = []

    for (const [index, file] of files.entries()) {
      const fileTitle = files.length > 1 ? `${title} ${index + 1}` : title

      if (kind === 'video') {
        if (!VIDEO_TYPES.includes(file.type)) {
          return NextResponse.json({ message: 'Only MP4, MOV, and WEBM videos are accepted.' }, { status: 400 })
        }
        if (file.size > MAX_VIDEO_SIZE) {
          return NextResponse.json({ message: 'Videos must be smaller than 500MB.' }, { status: 400 })
        }

        const publicUrl = await saveSupabaseFile(supabase, 'videos', categoryId, file)
        let thumbnailUrl: string | null = null

        if (thumbnail && IMAGE_TYPES.includes(thumbnail.type) && thumbnail.size <= MAX_IMAGE_SIZE) {
          thumbnailUrl = await saveSupabaseFile(supabase, 'video-thumbnails', categoryId, thumbnail)
        }

        const newVideo = {
          id: crypto.randomUUID(),
          title: fileTitle,
          description: description || null,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          storage_bucket: 'gallery',
          storage_path: publicUrl,
          public_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          file_size: file.size,
          featured,
          published,
          created_by: auth.session.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { error: insertErr } = await supabase
          .from('videos')
          .insert(newVideo)
        if (insertErr) {
          console.error('Failed to insert video into Supabase:', insertErr.message)
          return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 })
        }

        if (albumId) {
          const { error: linkErr } = await supabase
            .from('album_videos')
            .insert({
              album_id: albumId,
              video_id: newVideo.id,
              sort_order: index,
            })
          if (linkErr) {
            console.error('Failed to link video to album in Supabase:', linkErr.message)
            return NextResponse.json({ success: false, error: linkErr.message }, { status: 500 })
          }
        }

        uploaded.push(newVideo)
        continue
      }

      if (!IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ message: 'Only JPG, PNG, WEBP, and AVIF images are accepted.' }, { status: 400 })
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ message: 'Images must be smaller than 25MB.' }, { status: 400 })
      }

      const entityFolder = kind === 'cover' ? 'covers' : 'photos'
      const publicUrl = await saveSupabaseFile(supabase, entityFolder, categoryId, file)

      if (kind === 'cover') {
        if (!albumId) return NextResponse.json({ message: 'Album id is required for cover uploads.' }, { status: 400 })
        
        const { data: updatedAlbum, error: updateErr } = await supabase
          .from('albums')
          .update({
            cover_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', albumId)
          .select()
          .single()

        if (updateErr) {
          console.error('Failed to update album cover in Supabase:', updateErr.message)
          return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 })
        }
        
        uploaded.push(updatedAlbum)
        continue
      }

      const newPhoto = {
        id: crypto.randomUUID(),
        title: fileTitle,
        description: description || null,
        tags,
        alt_text: altText || fileTitle,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        storage_bucket: 'gallery',
        storage_path: publicUrl,
        public_url: publicUrl,
        file_size: file.size,
        sort_order: index,
        featured,
        published,
        created_by: auth.session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: insertErr } = await supabase
        .from('photos')
        .insert(newPhoto)
      if (insertErr) {
        console.error('Failed to insert photo into Supabase:', insertErr.message)
        return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 })
      }

      if (albumId) {
        const { error: linkErr } = await supabase
          .from('album_photos')
          .insert({
            album_id: albumId,
            photo_id: newPhoto.id,
            sort_order: index,
          })
        if (linkErr) {
          console.error('Failed to link photo to album in Supabase:', linkErr.message)
          return NextResponse.json({ success: false, error: linkErr.message }, { status: 500 })
        }
      }

      uploaded.push(newPhoto)
    }

    // Save upload activity
    await supabase.from('activity_logs').insert({
      actor_id: auth.session.user.id,
      action: `upload-${kind}`,
      entity_type: kind === 'video' ? 'videos' : 'photos',
      metadata: { count: uploaded.length, album_id: albumId || null }
    })

    revalidatePath('/admin')
    revalidatePath('/gallery')
    revalidatePath('/')
    return NextResponse.json({ success: true, uploaded })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ message: error?.message || 'Upload failed' }, { status: 500 })
  }
}
