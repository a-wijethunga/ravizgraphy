import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

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
  const db: LocalDB = {
    categories: [],
    subcategories: [],
    albums: [],
    photos: [],
    videos: [],
    album_photos: [],
    album_videos: [],
    site_content: [],
    activity_logs: [],
    messages: [],
    settings: []
  }

  try {
    const [
      categories,
      subcategories,
      albums,
      photos,
      videos,
      album_photos,
      album_videos,
      site_content,
      activity_logs,
      messages,
      settings
    ] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('subcategories').select('*'),
      supabase.from('albums').select('*'),
      supabase.from('photos').select('*'),
      supabase.from('videos').select('*'),
      supabase.from('album_photos').select('*'),
      supabase.from('album_videos').select('*'),
      supabase.from('site_content').select('*'),
      supabase.from('activity_logs').select('*'),
      supabase.from('messages').select('*'),
      supabase.from('settings').select('*')
    ])

    db.categories = categories.data || []
    db.subcategories = subcategories.data || []
    db.albums = albums.data || []
    db.photos = photos.data || []
    db.videos = videos.data || []
    db.album_photos = album_photos.data || []
    db.album_videos = album_videos.data || []
    db.site_content = site_content.data || []
    db.activity_logs = activity_logs.data || []
    db.messages = messages.data || []
    db.settings = settings.data || []
  } catch (error) {
    console.error('Error fetching Supabase data:', error)
  }

  return db
}

export async function saveDB(db: LocalDB) {
  try {
    const tables = [
      { name: 'categories', key: 'id' },
      { name: 'subcategories', key: 'id' },
      { name: 'albums', key: 'id' },
      { name: 'photos', key: 'id' },
      { name: 'videos', key: 'id' },
      { name: 'messages', key: 'id' },
      { name: 'settings', key: 'id' },
      { name: 'site_content', key: 'key' },
      { name: 'activity_logs', key: 'id' }
    ]

    await Promise.all(tables.map(async (tableInfo) => {
      const localItems = (db as any)[tableInfo.name] || []
      
      const { data: existing, error: fetchError } = await supabase.from(tableInfo.name).select(tableInfo.key)
      if (fetchError) {
        console.error(`Error fetching keys for ${tableInfo.name}:`, fetchError)
        return
      }

      const existingKeys = new Set((existing || []).map((item: any) => String(item[tableInfo.key])))
      const localKeys = new Set(localItems.map((item: any) => String(item[tableInfo.key])))

      const deleteKeys = [...existingKeys].filter(k => !localKeys.has(k))

      if (deleteKeys.length > 0) {
        const { error: deleteError } = await supabase.from(tableInfo.name).delete().in(tableInfo.key, deleteKeys)
        if (deleteError) {
          console.error(`Error deleting from ${tableInfo.name}:`, deleteError)
        }
      }

      if (localItems.length > 0) {
        const cleanedItems = localItems.map((item: any) => {
          const cleaned: any = {}
          for (const [k, v] of Object.entries(item)) {
            if (v !== undefined) cleaned[k] = v
          }
          return cleaned
        })
        const { error: upsertError } = await supabase.from(tableInfo.name).upsert(cleanedItems)
        if (upsertError) {
          console.error(`Error upserting into ${tableInfo.name}:`, upsertError)
        }
      }
    }))

    const joinTables = [
      { name: 'album_photos', key1: 'album_id', key2: 'photo_id' },
      { name: 'album_videos', key1: 'album_id', key2: 'video_id' }
    ]

    await Promise.all(joinTables.map(async (tableInfo) => {
      const localItems = (db as any)[tableInfo.name] || []
      
      const { data: existing, error: fetchError } = await supabase.from(tableInfo.name).select(`${tableInfo.key1}, ${tableInfo.key2}`)
      if (fetchError) {
        console.error(`Error fetching links for ${tableInfo.name}:`, fetchError)
        return
      }

      const makeKey = (row: any) => `${row[tableInfo.key1]}_${row[tableInfo.key2]}`
      
      const existingKeys = new Set((existing || []).map(makeKey))
      const localKeys = new Set(localItems.map(makeKey))

      const deleteItems = (existing || []).filter((item: any) => !localKeys.has(makeKey(item)))

      for (const item of deleteItems) {
        const { error: deleteError } = await supabase.from(tableInfo.name).delete().match({
          [tableInfo.key1]: (item as any)[tableInfo.key1],
          [tableInfo.key2]: (item as any)[tableInfo.key2]
        })
        if (deleteError) {
          console.error(`Error deleting relationship from ${tableInfo.name}:`, deleteError)
        }
      }

      if (localItems.length > 0) {
        const { error: upsertError } = await supabase.from(tableInfo.name).upsert(localItems)
        if (upsertError) {
          console.error(`Error upserting relationships into ${tableInfo.name}:`, upsertError)
        }
      }
    }))
  } catch (error) {
    console.error('Error in saveDB:', error)
  }
}
