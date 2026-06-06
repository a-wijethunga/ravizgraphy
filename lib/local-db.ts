import 'server-only'
import { getSupabaseClient } from '@/lib/supabaseServer'
import { unstable_cache } from 'next/cache'
import { getExistingColumns } from './supabase-schema'

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

// Cache categories for 5 minutes
export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = await getSupabaseClient()
    const expected = ['id', 'name', 'slug', 'description', 'sort_order', 'created_at', 'updated_at']
    const cols = await getExistingColumns(supabase, 'categories', expected)
    const { data, error } = await supabase
      .from('categories')
      .select(cols.join(', '))
      .order('sort_order', { ascending: true })
    if (error) {
      console.error('Error fetching cached categories:', error.message)
      throw error
    }
    return data || []
  },
  ['categories-list'],
  { revalidate: 300, tags: ['categories'] }
)

// Cache subcategories for 5 minutes
export const getCachedSubcategories = unstable_cache(
  async () => {
    const supabase = await getSupabaseClient()
    const expected = ['id', 'category_id', 'name', 'slug', 'description', 'sort_order', 'created_at', 'updated_at']
    const cols = await getExistingColumns(supabase, 'subcategories', expected)
    const { data, error } = await supabase
      .from('subcategories')
      .select(cols.join(', '))
      .order('sort_order', { ascending: true })
    if (error) {
      console.error('Error fetching cached subcategories:', error.message)
      throw error
    }
    return data || []
  },
  ['subcategories-list'],
  { revalidate: 300, tags: ['subcategories'] }
)

export async function getDB(): Promise<LocalDB> {
  const supabase = await getSupabaseClient()

  try {
    const albumCols = await getExistingColumns(supabase, 'albums', ['id', 'title', 'slug', 'description', 'category_id', 'subcategory_id', 'cover_photo_id', 'cover_url', 'featured', 'published', 'seo_title', 'seo_description', 'event_date', 'parent_id', 'sort_order', 'created_by', 'created_at', 'updated_at'])
    const photoCols = await getExistingColumns(supabase, 'photos', ['id', 'title', 'description', 'tags', 'alt_text', 'category_id', 'subcategory_id', 'storage_bucket', 'storage_path', 'public_url', 'width', 'height', 'file_size', 'sort_order', 'featured', 'published', 'taken_at', 'created_by', 'created_at', 'updated_at'])
    const videoCols = await getExistingColumns(supabase, 'videos', ['id', 'title', 'description', 'category_id', 'subcategory_id', 'storage_bucket', 'storage_path', 'public_url', 'thumbnail_url', 'duration_seconds', 'file_size', 'sort_order', 'featured', 'published', 'captured_at', 'youtube_url', 'youtube_id', 'video_type', 'created_by', 'created_at', 'updated_at'])
    const albumPhotoCols = await getExistingColumns(supabase, 'album_photos', ['album_id', 'photo_id', 'sort_order', 'created_at'])
    const albumVideoCols = await getExistingColumns(supabase, 'album_videos', ['album_id', 'video_id', 'sort_order', 'created_at'])
    const siteContentCols = await getExistingColumns(supabase, 'site_content', ['key', 'value', 'created_at', 'updated_at'])
    const activityLogCols = await getExistingColumns(supabase, 'activity_logs', ['id', 'actor_id', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at'])
    const messageCols = await getExistingColumns(supabase, 'messages', ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'created_at'])
    const settingsCols = await getExistingColumns(supabase, 'settings', ['id', 'website_name', 'logo_text', 'hero_title', 'hero_subtitle', 'contact_phone', 'contact_email', 'contact_address', 'instagram_url', 'facebook_url', 'whatsapp_url', 'seo_title', 'seo_description', 'google_analytics_id', 'created_at', 'updated_at'])

    let albumPhotoQuery = supabase.from('album_photos').select(albumPhotoCols.join(', '))
    if (albumPhotoCols.includes('sort_order')) {
      albumPhotoQuery = albumPhotoQuery.order('sort_order', { ascending: true })
    }

    let albumVideoQuery = supabase.from('album_videos').select(albumVideoCols.join(', '))
    if (albumVideoCols.includes('sort_order')) {
      albumVideoQuery = albumVideoQuery.order('sort_order', { ascending: true })
    }

    let activityLogsQuery = supabase.from('activity_logs').select(activityLogCols.join(', '))
    if (activityLogCols.includes('created_at')) {
      activityLogsQuery = activityLogsQuery.order('created_at', { ascending: false })
    }

    let messagesQuery = supabase.from('messages').select(messageCols.join(', '))
    if (messageCols.includes('created_at')) {
      messagesQuery = messagesQuery.order('created_at', { ascending: false })
    }

    const [
      categories = [],
      subcategories = [],
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
      getCachedCategories().catch(() => []),
      getCachedSubcategories().catch(() => []),
      supabase.from('albums').select(albumCols.join(', ')).order('sort_order', { ascending: true }),
      supabase.from('photos').select(photoCols.join(', ')).order('sort_order', { ascending: true }),
      supabase.from('videos').select(videoCols.join(', ')).order('sort_order', { ascending: true }),
      albumPhotoQuery,
      albumVideoQuery,
      supabase.from('site_content').select(siteContentCols.join(', ')),
      activityLogsQuery,
      messagesQuery,
      supabase.from('settings').select(settingsCols.join(', '))
    ])

    if (albErr) console.error('Error fetching albums:', albErr.message)
    if (photoErr) console.error('Error fetching photos:', photoErr.message)
    if (vidErr) console.error('Error fetching videos:', vidErr.message)
    if (albPhotoErr) console.error('Error fetching album_photos:', albPhotoErr.message)
    if (albVidErr) console.error('Error fetching album_videos:', albVidErr.message)
    if (contentErr) console.error('Error fetching site_content:', contentErr.message)
    if (logErr) console.error('Error fetching activity_logs:', logErr.message)
    if (msgErr) console.error('Error fetching messages:', msgErr.message)
    if (settingErr) console.error('Error fetching settings:', settingErr.message)

    // Fallbacks for missing columns
    const fallbackSettings = (settings || []).map((s: any) => ({
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

    const fallbackVideos = (videos || []).map((v: any) => ({
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

    const fallbackMessages = (messages || []).map((m: any) => ({
      ...m,
      subject: m.subject || 'No Subject',
      status: m.status || 'unread',
      created_at: m.created_at || new Date().toISOString()
    }))

    const fallbackSiteContent = (site_content || []).map((sc: any) => ({
      ...sc,
      created_at: sc.created_at || new Date().toISOString(),
      updated_at: sc.updated_at || new Date().toISOString()
    }))

    return {
      categories: categories || [],
      subcategories: subcategories || [],
      albums: albums || [],
      photos: photos || [],
      videos: fallbackVideos,
      album_photos: album_photos || [],
      album_videos: album_videos || [],
      site_content: fallbackSiteContent,
      activity_logs: activity_logs || [],
      messages: fallbackMessages,
      settings: fallbackSettings
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
