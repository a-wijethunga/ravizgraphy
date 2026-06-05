import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'local-db.json')

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

const defaultDB: LocalDB = {
  categories: [
    { id: 'cat-1', name: 'Engagement', slug: 'engagement', description: 'Pre-wedding, proposal, and couple stories.', sort_order: 5 },
    { id: 'cat-2', name: 'Weddings', slug: 'weddings', description: 'Elegant wedding stories.', sort_order: 10 },
    { id: 'cat-3', name: 'Events', slug: 'events', description: 'Corporate gatherings and cultural festivals.', sort_order: 20 },
    { id: 'cat-4', name: 'Portraits', slug: 'portraits', description: 'Studio and outdoor portrait sessions.', sort_order: 30 },
  ],
  subcategories: [
    { id: 'sub-1', category_id: 'cat-1', name: 'Pre Shoot', slug: 'pre-shoot', sort_order: 10 },
    { id: 'sub-2', category_id: 'cat-2', name: 'Wedding Day', slug: 'wedding-day', sort_order: 20 },
  ],
  albums: [],
  photos: [],
  videos: [],
  album_photos: [],
  album_videos: [],
  site_content: [],
  activity_logs: [],
  messages: [
    {
      id: 'msg-1',
      name: 'Suresh Perera',
      email: 'suresh.perera@example.com',
      phone: '+94 77 123 4567',
      subject: 'Wedding Photography Inquiry',
      message: 'Hello Raviz, we love your cinematic style. Are you available for a wedding shoot in Colombo on November 15th?',
      status: 'unread',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'msg-2',
      name: 'Anjali Silva',
      email: 'anjali@example.com',
      phone: '+94 71 987 6543',
      subject: 'Portrait Session Inquiry',
      message: 'Hi! I would like to book a luxury portrait session in Galle. Could you send me your pricing options?',
      status: 'read',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    }
  ],
  settings: [
    {
      id: 'global',
      website_name: 'RavizGraphy',
      logo_text: 'RAVIZGRAPHY',
      hero_title: 'Stories Told Through Light & Shadow',
      hero_subtitle: 'Luxury Wedding, Event & Portrait Photography in Sri Lanka',
      contact_phone: '+94 76 305 6168',
      contact_email: 'ravizthecrash@gmail.com',
      contact_address: 'Chamika Stores, Yahalawatta, Maliduwa, Akuressa',
      instagram_url: 'https://instagram.com/ravizgraphy',
      facebook_url: 'https://facebook.com/ravizgraphy',
      whatsapp_url: 'https://wa.me/94763056168',
      seo_title: 'RavizGraphy | Luxury Photography & Films',
      seo_description: 'Elegant wedding stories, event photography, and premium cinema services by Raviz in Sri Lanka.',
      google_analytics_id: 'G-XXXXXXXXXX',
    }
  ]
}

export function getDB(): LocalDB {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2), 'utf8')
      return defaultDB
    }
    const content = fs.readFileSync(DB_PATH, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading local DB:', error)
    return defaultDB
  }
}

export function saveDB(db: LocalDB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8')
  } catch (error) {
    console.error('Error writing local DB:', error)
  }
}
