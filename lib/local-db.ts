import 'server-only'
import { getSupabaseClient } from '@/lib/supabaseServer'
import fs from 'fs'
import path from 'path'
import { slugify } from '@/lib/gallery-config'

const dbFilePath = path.join(process.cwd(), 'local-db.json')

function readLocalJSON(): any {
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8')
      return JSON.parse(content)
    } catch (e) {
      console.error('Failed to parse local-db.json:', e)
    }
  }
  return {}
}

function writeLocalJSON(data: any) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8')
  } catch (e) {
    console.error('Failed to write local-db.json:', e)
  }
}

export interface LocalDB {
  categories: any[]
  subcategories: any[]
  albums: any[]
  photos: any[]
  videos: any[]
  album_photos: any[]
  album_videos: any[]
  site_content: any[]
  activity_logs: any[]
  messages: any[]
  settings: any[]
}

export async function getDB(): Promise<LocalDB> {
  const supabase = await getSupabaseClient()
  const localData = readLocalJSON()
  const db: LocalDB = {
    categories: localData.categories || [],
    subcategories: localData.subcategories || [],
    albums: [],
    photos: [],
    videos: localData.videos || [],
    album_photos: [],
    album_videos: localData.album_videos || [],
    site_content: localData.site_content || [],
    activity_logs: localData.activity_logs || [],
    messages: localData.messages || [],
    settings: localData.settings || []
  }

  try {
    // 1. Query albums from Supabase
    const { data: supabaseAlbums, error: albumsError } = await supabase
      .from('albums')
      .select('*')

    if (albumsError) {
      console.error('Error fetching Supabase albums:', albumsError)
      db.albums = localData.albums || []
    } else {
      const localAlbums = localData.albums || []
      db.albums = (supabaseAlbums || []).map((sbAlbum: any) => {
        const localAlbum = localAlbums.find((la: any) => String(la.id) === String(sbAlbum.id))
        return {
          id: sbAlbum.id,
          title: sbAlbum.title,
          description: sbAlbum.description || localAlbum?.description || null,
          cover_url: sbAlbum.cover_image || localAlbum?.cover_url || null,
          slug: localAlbum?.slug || sbAlbum.slug || slugify(sbAlbum.title),
          category_id: sbAlbum.category_id || localAlbum?.category_id || 'cat-4',
          subcategory_id: sbAlbum.subcategory_id || localAlbum?.subcategory_id || null,
          cover_photo_id: sbAlbum.cover_photo_id || localAlbum?.cover_photo_id || null,
          featured: sbAlbum.featured !== undefined ? sbAlbum.featured : (localAlbum?.featured ?? false),
          published: sbAlbum.published !== undefined ? sbAlbum.published : (localAlbum?.published ?? true),
          seo_title: sbAlbum.seo_title || localAlbum?.seo_title || null,
          seo_description: sbAlbum.seo_description || localAlbum?.seo_description || null,
          event_date: sbAlbum.event_date || localAlbum?.event_date || null,
          parent_id: sbAlbum.parent_id || localAlbum?.parent_id || null,
          sort_order: sbAlbum.sort_order !== undefined ? sbAlbum.sort_order : (localAlbum?.sort_order ?? 0),
          created_by: sbAlbum.created_by || localAlbum?.created_by || 'admin-id',
          created_at: sbAlbum.created_at,
          updated_at: sbAlbum.updated_at || sbAlbum.created_at
        }
      })
    }

    // 2. Query media from Supabase
    const { data: supabaseMedia, error: mediaError } = await supabase
      .from('media')
      .select('*')

    if (mediaError) {
      console.error('Error fetching Supabase media:', mediaError)
      db.photos = localData.photos || []
      db.album_photos = localData.album_photos || []
    } else {
      const localPhotos = localData.photos || []
      db.photos = (supabaseMedia || []).map((m: any) => {
        const localPhoto = localPhotos.find((lp: any) => String(lp.id) === String(m.id))
        
        const parentAlbum = db.albums.find(a => String(a.id) === String(m.album_id))
        const categoryId = parentAlbum?.category_id || localPhoto?.category_id || 'cat-4'
        const subcategoryId = parentAlbum?.subcategory_id || localPhoto?.subcategory_id || null

        return {
          id: m.id,
          title: localPhoto?.title || (m.image_url ? m.image_url.split('/').pop() : 'Photo'),
          description: localPhoto?.description || null,
          tags: localPhoto?.tags || [],
          alt_text: localPhoto?.alt_text || 'Gallery image',
          category_id: categoryId,
          subcategory_id: subcategoryId,
          storage_bucket: 'gallery',
          storage_path: m.image_url || '',
          public_url: m.image_url || '',
          file_size: localPhoto?.file_size || null,
          sort_order: localPhoto?.sort_order ?? 0,
          featured: localPhoto?.featured ?? false,
          published: localPhoto?.published ?? true,
          taken_at: localPhoto?.taken_at || null,
          created_by: localPhoto?.created_by || 'admin-id',
          created_at: m.created_at,
          updated_at: m.created_at
        }
      })

      // Construct album_photos junction
      db.album_photos = (supabaseMedia || [])
        .filter((m: any) => m.album_id)
        .map((m: any, idx: number) => ({
          album_id: m.album_id,
          photo_id: m.id,
          sort_order: idx
        }))
    }
  } catch (error) {
    console.error('Error in getDB():', error)
    db.albums = localData.albums || []
    db.photos = localData.photos || []
    db.album_photos = localData.album_photos || []
  }

  return db
}

export async function saveDB(db: LocalDB) {
  const supabase = await getSupabaseClient()
  const localData = {
    categories: db.categories || [],
    subcategories: db.subcategories || [],
    albums: db.albums || [],
    photos: db.photos || [],
    videos: db.videos || [],
    album_photos: db.album_photos || [],
    album_videos: db.album_videos || [],
    site_content: db.site_content || [],
    activity_logs: db.activity_logs || [],
    messages: db.messages || [],
    settings: db.settings || []
  }
  writeLocalJSON(localData)

  // 2. Sync albums live to Supabase
  try {
    const localAlbums = db.albums || []
    const { data: existingAlbums, error: fetchError } = await supabase
      .from('albums')
      .select('id')

    if (fetchError) {
      console.error('Error fetching Supabase albums for sync:', fetchError)
    } else {
      const existingIds = new Set((existingAlbums || []).map((item: any) => String(item.id)))
      const localIds = new Set(localAlbums.map((item: any) => String(item.id)))

      const deleteIds = [...existingIds].filter(id => !localIds.has(id))
      if (deleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('albums')
          .delete()
          .in('id', deleteIds)
        if (deleteError) console.error('Error deleting albums from Supabase:', deleteError)
      }

      if (localAlbums.length > 0) {
        const sbAlbumsToUpsert = localAlbums.map((album: any) => ({
          id: album.id,
          title: album.title,
          description: album.description || null,
          cover_image: album.cover_url || null,
          created_at: album.created_at || new Date().toISOString()
        }))

        const { error: upsertError } = await supabase
          .from('albums')
          .upsert(sbAlbumsToUpsert)
        if (upsertError) console.error('Error upserting albums to Supabase:', upsertError)
      }
    }
  } catch (e) {
    console.error('Failed to sync albums to Supabase:', e)
  }

  // 3. Sync media live to Supabase
  try {
    const localPhotos = db.photos || []
    const albumPhotos = db.album_photos || []

    const { data: existingMedia, error: fetchError } = await supabase
      .from('media')
      .select('id')

    if (fetchError) {
      console.error('Error fetching Supabase media for sync:', fetchError)
    } else {
      const existingIds = new Set((existingMedia || []).map((item: any) => String(item.id)))
      const localIds = new Set(localPhotos.map((item: any) => String(item.id)))

      const deleteIds = [...existingIds].filter(id => !localIds.has(id))
      if (deleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('media')
          .delete()
          .in('id', deleteIds)
        if (deleteError) console.error('Error deleting media from Supabase:', deleteError)
      }

      if (localPhotos.length > 0) {
        const sbMediaToUpsert = localPhotos.map((photo: any) => {
          const link = albumPhotos.find((ap: any) => String(ap.photo_id) === String(photo.id))
          return {
            id: photo.id,
            album_id: link?.album_id || photo.album_id || null,
            image_url: photo.public_url || photo.storage_path || '',
            created_at: photo.created_at || new Date().toISOString()
          }
        }).filter(m => m.album_id)

        if (sbMediaToUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from('media')
            .upsert(sbMediaToUpsert)
          if (upsertError) console.error('Error upserting media to Supabase:', upsertError)
        }
      }
    }
  } catch (e) {
    console.error('Failed to sync media to Supabase:', e)
  }
}
