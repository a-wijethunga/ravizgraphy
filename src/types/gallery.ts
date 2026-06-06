export type GallerySort = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

export type GalleryAssetType = 'photo' | 'video'

export interface GalleryCategory {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_at: string
  subcategories?: GallerySubcategory[]
}

export interface GallerySubcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description: string | null
  category_id: string
  subcategory_id: string | null
  cover_photo_id: string | null
  cover_url: string | null
  featured: boolean
  published: boolean
  seo_title: string | null
  seo_description: string | null
  event_date: string | null
  parent_id?: string | null
  sort_order?: number
  created_at: string
  updated_at: string
  category?: Pick<GalleryCategory, 'id' | 'name' | 'slug'>
  subcategory?: Pick<GallerySubcategory, 'id' | 'name' | 'slug'> | null
  photo_count?: number
  video_count?: number
}

export interface GalleryPhoto {
  id: string
  title: string
  description: string | null
  tags: string[]
  alt_text: string
  category_id: string
  subcategory_id: string | null
  storage_bucket: string
  storage_path: string
  public_url: string
  width: number | null
  height: number | null
  file_size: number | null
  sort_order: number
  featured: boolean
  published: boolean
  taken_at: string | null
  created_at: string
  updated_at: string
  category?: Pick<GalleryCategory, 'id' | 'name' | 'slug'>
  subcategory?: Pick<GallerySubcategory, 'id' | 'name' | 'slug'> | null
}

export interface GalleryVideo {
  id: string
  title: string
  description: string | null
  category_id?: string | null
  subcategory_id?: string | null
  storage_bucket?: string
  storage_path?: string
  public_url: string
  thumbnail_url: string | null
  duration_seconds?: number | null
  file_size?: number | null
  sort_order: number
  featured?: boolean
  published?: boolean
  captured_at?: string | null
  created_at: string
  updated_at?: string
  category?: Pick<GalleryCategory, 'id' | 'name' | 'slug'>
  subcategory?: Pick<GallerySubcategory, 'id' | 'name' | 'slug'> | null
  youtube_url?: string | null
  youtube_id?: string | null
  video_type?: string | null
}

export interface GalleryAlbumDetail extends GalleryAlbum {
  photos: GalleryPhoto[]
  videos: GalleryVideo[]
  sub_albums?: GalleryAlbum[]
}

export interface GalleryAlbumListResponse {
  albums: GalleryAlbum[]
  categories: GalleryCategory[]
  total: number
  nextPage: number | null
}

export interface AdminGalleryOverview {
  categories: GalleryCategory[]
  subcategories: GallerySubcategory[]
  albums: GalleryAlbum[]
  photos: GalleryPhoto[]
  videos: GalleryVideo[]
  album_photos?: Array<{ album_id: string; photo_id: string; sort_order: number }>
  album_videos?: Array<{ album_id: string; video_id: string; sort_order: number }>
  stats: {
    albums: number
    photos: number
    videos: number
    categories: number
    featured: number
    published: number
  }
}
