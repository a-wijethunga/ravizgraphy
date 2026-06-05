import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })
  const supabase = auth.adminClient

  const body = await req.json().catch(() => null)
  const entity = body?.entity
  const items = Array.isArray(body?.items) ? body.items : []

  if (!['albums', 'photos', 'videos', 'album_photos', 'album_videos', 'categories', 'subcategories'].includes(entity)) {
    return NextResponse.json({ message: 'Unsupported reorder entity' }, { status: 400 })
  }
  if (!items.length) {
    return NextResponse.json({ message: 'No reorder items supplied' }, { status: 400 })
  }

  try {
    if (entity === 'album_photos') {
      for (const item of items) {
        const { error } = await supabase
          .from('album_photos')
          .update({ sort_order: Number(item.sort_order) })
          .eq('album_id', item.album_id)
          .eq('photo_id', item.photo_id)
        if (error) {
          console.error('Error reordering album_photo:', error.message)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
      }
    } else if (entity === 'album_videos') {
      for (const item of items) {
        const { error } = await supabase
          .from('album_videos')
          .update({ sort_order: Number(item.sort_order) })
          .eq('album_id', item.album_id)
          .eq('video_id', item.video_id)
        if (error) {
          console.error('Error reordering album_video:', error.message)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
      }
    } else {
      for (const item of items) {
        const { error } = await supabase
          .from(entity)
          .update({ sort_order: Number(item.sort_order) })
          .eq('id', item.id)
        if (error) {
          console.error(`Error reordering ${entity}:`, error.message)
          return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }
      }
    }

    revalidatePath('/admin')
    revalidatePath('/gallery')
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reorder error:', error)
    return NextResponse.json({ message: error?.message || 'Unable to reorder assets' }, { status: 500 })
  }
}
