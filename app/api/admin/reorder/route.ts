import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import { getDB, saveDB } from '@lib/local-db'

export async function POST(req: Request) {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status })

  const body = await req.json().catch(() => null)
  const entity = body?.entity
  const items = Array.isArray(body?.items) ? body.items : []

  if (!['albums', 'photos', 'videos', 'album_photos', 'album_videos'].includes(entity)) {
    return NextResponse.json({ message: 'Unsupported reorder entity' }, { status: 400 })
  }
  if (!items.length) {
    return NextResponse.json({ message: 'No reorder items supplied' }, { status: 400 })
  }

  const db = await getDB()

  try {
    if (entity === 'album_photos') {
      if (!db.album_photos) db.album_photos = []
      for (const item of items) {
        const match = db.album_photos.find(
          (ap) => String(ap.album_id) === String(item.album_id) && String(ap.photo_id) === String(item.photo_id)
        )
        if (match) {
          match.sort_order = Number(item.sort_order)
        }
      }
    } else if (entity === 'album_videos') {
      if (!db.album_videos) db.album_videos = []
      for (const item of items) {
        const match = db.album_videos.find(
          (av) => String(av.album_id) === String(item.album_id) && String(av.video_id) === String(item.video_id)
        )
        if (match) {
          match.sort_order = Number(item.sort_order)
        }
      }
    } else {
      const table = (db as any)[entity] || []
      for (const item of items) {
        const match = table.find((x: any) => String(x.id) === String(item.id))
        if (match) {
          match.sort_order = Number(item.sort_order)
        }
      }
    }

    await saveDB(db)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reorder error:', error)
    return NextResponse.json({ message: error?.message || 'Unable to reorder assets' }, { status: 500 })
  }
}
