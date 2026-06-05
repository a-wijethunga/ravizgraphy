import 'server-only'
import { getSupabaseClient } from '@/lib/supabaseServer'

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

  try {
    const [
      { data: categories = [], error: catErr },
      { data: subcategories = [], error: subErr },
      { data: albums = [], error: albErr },
      { data: photos = [], error: photoErr },
      { data: videos = [], error: vidErr },
      { data: album_photos = [], error: albPhotoErr },
      { data: album_videos = [], error: albVidErr },
      { data: site_content = [], error: contentErr },
      { data: activity_logs = [], error: logErr },
      { data: messages = [], error: msgErr },
      { data: settings = [], error: settingErr }
    ] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('subcategories').select('*').order('sort_order', { ascending: true }),
      supabase.from('albums').select('*').order('sort_order', { ascending: true }),
      supabase.from('photos').select('*').order('sort_order', { ascending: true }),
      supabase.from('videos').select('*').order('sort_order', { ascending: true }),
      supabase.from('album_photos').select('*').order('sort_order', { ascending: true }),
      supabase.from('album_videos').select('*').order('sort_order', { ascending: true }),
      supabase.from('site_content').select('*'),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('messages').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*')
    ])

    if (catErr) console.error('Error fetching categories:', catErr.message)
    if (subErr) console.error('Error fetching subcategories:', subErr.message)
    if (albErr) console.error('Error fetching albums:', albErr.message)
    if (photoErr) console.error('Error fetching photos:', photoErr.message)
    if (vidErr) console.error('Error fetching videos:', vidErr.message)
    if (albPhotoErr) console.error('Error fetching album_photos:', albPhotoErr.message)
    if (albVidErr) console.error('Error fetching album_videos:', albVidErr.message)
    if (contentErr) console.error('Error fetching site_content:', contentErr.message)
    if (logErr) console.error('Error fetching activity_logs:', logErr.message)
    if (msgErr) console.error('Error fetching messages:', msgErr.message)
    if (settingErr) console.error('Error fetching settings:', settingErr.message)

    return {
      categories: categories || [],
      subcategories: subcategories || [],
      albums: albums || [],
      photos: photos || [],
      videos: videos || [],
      album_photos: album_photos || [],
      album_videos: album_videos || [],
      site_content: site_content || [],
      activity_logs: activity_logs || [],
      messages: messages || [],
      settings: settings || []
    }
  } catch (error) {
    console.error('Error in getDB():', error)
    return {
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
  }
}

// saveDB is deprecated, direct mutations are executed by route handlers.
export async function saveDB(db: LocalDB) {
  console.warn('saveDB() is deprecated. Use direct Supabase mutations instead.')
}
