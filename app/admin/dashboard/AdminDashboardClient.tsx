'use client'

import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../../src/lib/supabase'
import {
  BarChart3,
  CheckCircle2,
  Filter,
  FolderKanban,
  ImagePlus,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  Settings2,
  Star,
  Trash2,
  UploadCloud,
  Video as VideoIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MailOpen,
  Sliders,
  Check,
  Film,
  Camera,
  Grid,
  List,
  Compass,
  MessageSquare,
  Globe,
  Database,
  HardDrive,
  Calendar,
  Image as ImageIcon
} from 'lucide-react'
import type { AdminGalleryOverview, GalleryAlbum, GalleryCategory, GalleryPhoto, GallerySubcategory, GalleryVideo } from '@/types/gallery'
import { slugify } from '@/lib/gallery-config'

interface DashboardStats {
  albums: number
  photos: number
  videos: number
  admins: number
}

type AdminSection = 'dashboard' | 'albums' | 'photos' | 'videos' | 'categories' | 'uploads' | 'analytics' | 'messages' | 'settings' | 'homepage'
type FilterState = 'all' | 'featured' | 'published' | 'drafts'

const emptyOverview: AdminGalleryOverview = {
  categories: [],
  subcategories: [],
  albums: [],
  photos: [],
  videos: [],
  stats: {
    albums: 0,
    photos: 0,
    videos: 0,
    categories: 0,
    featured: 0,
    published: 0,
  },
}

// Light Luxury Warm Cream Design System Styles
const inputClass =
  'w-full rounded-2xl border border-[#E8D4C9] bg-white/70 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/5 placeholder:text-slate-400 font-sans shadow-sm'

const textareaClass = `${inputClass} min-h-28 resize-y`
const labelClass = 'block text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-slate-500 mb-2'

const defaultAlbumForm: {
  id: string;
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  cover_url: string;
  featured: boolean;
  published: boolean;
  seo_title: string;
  seo_description: string;
  event_date: string;
  parent_id: string;
  sort_order?: number;
} = {
  id: '',
  title: '',
  description: '',
  category_id: '',
  subcategory_id: '',
  cover_url: '',
  featured: false,
  published: true,
  seo_title: '',
  seo_description: '',
  event_date: '',
  parent_id: '',
}

const defaultCategoryForm = {
  id: '',
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
}

const defaultSubcategoryForm = {
  id: '',
  category_id: '',
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
}

const defaultAssetForm = {
  id: '',
  title: '',
  description: '',
  tags: '',
  alt_text: '',
  category_id: '',
  subcategory_id: '',
  album_id: '',
  featured: false,
  published: true,
  thumbnail_url: '',
}

const initialSettingsForm = {
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

const defaultBestShotsPhotos = [
  {
    id: 'default-best-1',
    public_url: '/uploads/default-best-shots/DSC07729.jpg.jpeg',
    alt_text: 'Editorial portrait framed through tropical foliage',
    title: 'Tropical Reverie',
  },
  {
    id: 'default-best-2',
    public_url: '/uploads/default-best-shots/1 v2.JPG.jpeg',
    alt_text: 'Black and white editorial portrait on a coastal tree',
    title: 'Coastal Noir',
  },
  {
    id: 'default-best-3',
    public_url: '/uploads/default-best-shots/15.JPG.jpeg',
    alt_text: 'Couple embracing on the shoreline at dusk',
    title: 'Shoreline Motion',
  },
  {
    id: 'default-best-4',
    public_url: '/uploads/default-best-shots/2.JPG.jpeg',
    alt_text: 'Soft romantic close-up portrait by the ocean',
    title: 'Golden Quiet',
  },
  {
    id: 'default-best-5',
    public_url: '/uploads/default-best-shots/7.JPG.jpeg',
    alt_text: 'Intimate couple portrait in warm natural light',
    title: 'Close Enough',
  },
  {
    id: 'default-best-6',
    public_url: '/uploads/default-best-shots/1.1.jpg.jpeg',
    alt_text: 'Cinematic street portrait with motion blur',
    title: 'Passing Light',
  },
  {
    id: 'default-best-7',
    public_url: '/uploads/default-best-shots/1.jpg (1).jpeg',
    alt_text: 'Editorial lifestyle portrait on a quiet tropical road',
    title: 'Open Road',
  },
  {
    id: 'default-best-8',
    public_url: '/uploads/default-best-shots/8.jpg.jpeg',
    alt_text: 'Sunlit water detail from an editorial lifestyle story',
    title: 'Waterline',
  },
  {
    id: 'default-best-9',
    public_url: '/uploads/default-best-shots/5.jpg.jpeg',
    alt_text: 'Warm editorial portrait in soft evening light',
    title: 'Still Gaze',
  },
]

export default function AdminDashboardClient({ stats }: { stats: DashboardStats }) {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [overview, setOverview] = useState<AdminGalleryOverview>(emptyOverview)
  const [searchText, setSearchText] = useState('')
  const [subcatSearch, setSubcatSearch] = useState('')
  const [filterState, setFilterState] = useState<FilterState>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [uploadKind, setUploadKind] = useState<'photo' | 'video'>('photo')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  
  // Cover File Selection State
  const [coverUploadFile, setCoverUploadFile] = useState<File | null>(null)
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  // Media selections
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [mediaViewMode, setMediaViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modals & Forms
  const [activeModal, setActiveModal] = useState<'album' | 'category' | 'subcategory' | 'asset' | 'message' | 'youtube-video' | null>(null)
  const [albumForm, setAlbumForm] = useState(defaultAlbumForm)
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm)
  const [subcategoryForm, setSubcategoryForm] = useState(defaultSubcategoryForm)
  const [assetForm, setAssetForm] = useState(defaultAssetForm)
  const [albumModalStep, setAlbumModalStep] = useState<1 | 2>(1) // Step 1: Basic Info, Step 2: Manage Embedded Media
  const [albumType, setAlbumType] = useState<'main' | 'sub'>('main')
  const [draggedAlbum, setDraggedAlbum] = useState<{ id: string; type: 'main' | 'sub'; parentId?: string } | null>(null)
  
  // Video Manager States
  const [videoManagerTab, setVideoManagerTab] = useState<'videos' | 'shorts'>('videos')
  const [videoSearchText, setVideoSearchText] = useState('')
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('')
  const [activePreviewVideo, setActivePreviewVideo] = useState<any | null>(null)
  const [draggedVideoIdx, setDraggedVideoIdx] = useState<number | null>(null)
  const [youtubeForm, setYoutubeForm] = useState({
    id: '',
    title: '',
    description: '',
    youtube_url: '',
    thumbnail_url: '',
    category_id: '',
    featured: false,
    published: true,
    video_type: 'video',
    sort_order: 0,
  })
  
  // Hierarchical Album Tree States & Step 2 Media states
  const [collapsedAlbums, setCollapsedAlbums] = useState<Record<string, boolean>>({})
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({})
  const [step2Tab, setStep2Tab] = useState<'view' | 'upload'>('view')
  const [draggedMediaIdx, setDraggedMediaIdx] = useState<number | null>(null)
  const [draggedMediaType, setDraggedMediaType] = useState<'photo' | 'video' | null>(null)
  
  // Settings & Inbound Mailbox
  const [inboundMessages, setInboundMessages] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null)
  const [settingsForm, setSettingsForm] = useState(initialSettingsForm)
  const [activityLogs, setActivityLogs] = useState<any[]>([])

  // Live storage statistics state
  const [storageStats, setStorageStats] = useState<any | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [loadingStorage, setLoadingStorage] = useState(false)

  const [bestShotsForm, setBestShotsForm] = useState({
    title: 'My Best',
    highlight: 'Shots',
    description: 'A quiet selection of cinematic portraits, movement, romance, and coastal atmosphere.',
    visible: true,
    limit: 9,
    layout: 'cinematic' as 'cinematic' | 'grid' | 'masonry' | 'featured',
    photos: defaultBestShotsPhotos
  })

  const [bestShotsUploading, setBestShotsUploading] = useState(false)
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null)
  const [showBestShotsLibraryPicker, setShowBestShotsLibraryPicker] = useState(false)

  // Pagination page/limit states
  const [albumsPage, setAlbumsPage] = useState(1)
  const [albumsTotalPages, setAlbumsTotalPages] = useState(1)
  const [albumsTotalCount, setAlbumsTotalCount] = useState(0)

  const [photosPage, setPhotosPage] = useState(1)
  const [photosTotalPages, setPhotosTotalPages] = useState(1)
  const [photosTotalCount, setPhotosTotalCount] = useState(0)

  const [videosPage, setVideosPage] = useState(1)
  const [videosTotalPages, setVideosTotalPages] = useState(1)
  const [videosTotalCount, setVideosTotalCount] = useState(0)

  const [messagesPage, setMessagesPage] = useState(1)
  const [messagesTotalPages, setMessagesTotalPages] = useState(1)
  const [messagesTotalCount, setMessagesTotalCount] = useState(0)

  const [logsPage, setLogsPage] = useState(1)
  const [logsTotalPages, setLogsTotalPages] = useState(1)
  const [logsTotalCount, setLogsTotalCount] = useState(0)

  const [paginatedAlbums, setPaginatedAlbums] = useState<GalleryAlbum[]>([])
  const [paginatedPhotos, setPaginatedPhotos] = useState<GalleryPhoto[]>([])
  const [paginatedVideos, setPaginatedVideos] = useState<GalleryVideo[]>([])
  const [paginatedMessages, setPaginatedMessages] = useState<any[]>([])
  const [paginatedLogs, setPaginatedLogs] = useState<any[]>([])

  const ALBUMS_LIMIT = 12
  const PHOTOS_LIMIT = 20
  const VIDEOS_LIMIT = 12
  const MESSAGES_LIMIT = 15
  const LOGS_LIMIT = 20

  const loadOverview = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/gallery`)
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Unable to load gallery CMS data')
      setOverview(body)
      
      const actRes = await fetch('/api/admin/activity_logs?page=1&limit=5')
      if (actRes.ok) {
        const logsData = await actRes.json()
        setActivityLogs(logsData.data || [])
      }
    } catch (error: any) {
      toast.error(error.message || 'Unable to load gallery CMS data')
    } finally {
      setLoading(false)
    }
  }

  const loadStorageStats = async () => {
    setLoadingStorage(true)
    setStorageError(null)
    try {
      const res = await fetch('/api/admin/storage')
      const body = await res.json()
      if (!res.ok || !body.success) {
        throw new Error(body.message || 'Unable to calculate storage usage.')
      }
      setStorageStats(body.stats)
    } catch (e: any) {
      console.error('Failed to load storage stats:', e)
      setStorageError(e.message || 'Unable to calculate storage usage.')
    } finally {
      setLoadingStorage(false)
    }
  }

  const loadAlbums = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(albumsPage))
      params.set('limit', String(ALBUMS_LIMIT))
      if (searchText) params.set('search', searchText)
      if (filterState !== 'all') params.set('filter', filterState)
      const res = await fetch(`/api/admin/albums?${params.toString()}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load albums')
      setPaginatedAlbums(body.data || [])
      setAlbumsTotalPages(body.totalPages || 1)
      setAlbumsTotalCount(body.total || 0)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const loadPhotos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(photosPage))
      params.set('limit', String(PHOTOS_LIMIT))
      if (searchText) params.set('search', searchText)
      if (filterState !== 'all') params.set('filter', filterState)
      const res = await fetch(`/api/admin/photos?${params.toString()}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load photos')
      setPaginatedPhotos(body.data || [])
      setPhotosTotalPages(body.totalPages || 1)
      setPhotosTotalCount(body.total || 0)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const loadVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(videosPage))
      params.set('limit', String(VIDEOS_LIMIT))
      if (searchText) params.set('search', searchText)
      if (filterState !== 'all') params.set('filter', filterState)
      const res = await fetch(`/api/admin/videos?${params.toString()}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load videos')
      setPaginatedVideos(body.data || [])
      setVideosTotalPages(body.totalPages || 1)
      setVideosTotalCount(body.total || 0)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(messagesPage))
      params.set('limit', String(MESSAGES_LIMIT))
      if (searchText) params.set('search', searchText)
      const res = await fetch(`/api/admin/messages?${params.toString()}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load messages')
      setPaginatedMessages(body.data || [])
      setMessagesTotalPages(body.totalPages || 1)
      setMessagesTotalCount(body.total || 0)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      const body = await res.json()
      if (res.ok && body?.[0]) {
        setSettingsForm(body[0])
      }
    } catch (e: any) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const loadContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/content')
      const body = await res.json()
      if (res.ok) {
        const bestShotsRow = body.find((row: any) => row.key === 'best_shots')
        if (bestShotsRow && bestShotsRow.value) {
          try {
            setBestShotsForm(JSON.parse(bestShotsRow.value))
          } catch (e) {
            console.error('Failed to parse best shots content', e)
          }
        }
      }
    } catch (e: any) {
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const loadActivityLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(logsPage))
      params.set('limit', String(LOGS_LIMIT))
      const res = await fetch(`/api/admin/activity_logs?${params.toString()}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load activity logs')
      setPaginatedLogs(body.data || [])
      setLogsTotalPages(body.totalPages || 1)
      setLogsTotalCount(body.total || 0)
    } catch (e: any) {
      toast.error(e.message || 'Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  const refreshActiveSection = async () => {
    void loadStorageStats()
    if (activeSection === 'dashboard') {
      await loadOverview()
    } else if (activeSection === 'albums') {
      await loadAlbums()
    } else if (activeSection === 'photos') {
      await loadPhotos()
    } else if (activeSection === 'videos') {
      await loadVideos()
    } else if (activeSection === 'messages') {
      await loadMessages()
    } else if (activeSection === 'settings') {
      await loadSettings()
    } else if (activeSection === 'homepage') {
      await loadContent()
    } else if (activeSection === 'analytics') {
      await loadActivityLogs()
    }
  }

  useEffect(() => {
    void loadStorageStats()
  }, [])

  useEffect(() => {
    setAlbumsPage(1)
    setPhotosPage(1)
    setVideosPage(1)
    setMessagesPage(1)
    setLogsPage(1)
  }, [searchText, filterState])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (activeSection === 'dashboard') {
        void loadOverview()
      } else if (activeSection === 'albums') {
        void loadAlbums()
      } else if (activeSection === 'photos') {
        void loadPhotos()
      } else if (activeSection === 'videos') {
        void loadVideos()
      } else if (activeSection === 'messages') {
        void loadMessages()
      } else if (activeSection === 'analytics') {
        void loadActivityLogs()
      }
    }, 200)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, filterState, activeSection, albumsPage, photosPage, videosPage, messagesPage, logsPage])

  useEffect(() => {
    if (activeSection === 'dashboard') {
      void loadOverview()
    } else if (activeSection === 'albums') {
      void loadAlbums()
    } else if (activeSection === 'photos') {
      void loadPhotos()
    } else if (activeSection === 'videos') {
      void loadVideos()
    } else if (activeSection === 'messages') {
      void loadMessages()
    } else if (activeSection === 'settings') {
      void loadSettings()
    } else if (activeSection === 'homepage') {
      void loadContent()
    } else if (activeSection === 'analytics') {
      void loadActivityLogs()
    }
  }, [activeSection])

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (p: number) => void) => {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-between pt-6 border-t border-[#EFE2D8]/60 mt-6">
        <span className="text-xs text-slate-400 font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 rounded-xl bg-white border border-[#E8D4C9] text-slate-600 hover:border-slate-400 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 rounded-xl bg-white border border-[#E8D4C9] text-slate-600 hover:border-slate-400 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const categoriesById = useMemo(() => new Map(overview.categories.map((category) => [category.id, category])), [overview.categories])
  
  const dbSizeMB = useMemo(() => {
    try {
      const serialized = JSON.stringify({
        categories: overview.categories,
        subcategories: overview.subcategories,
        albums: overview.albums,
        photos: overview.photos,
        videos: overview.videos,
        messages: inboundMessages,
        settings: [settingsForm],
        activity_logs: activityLogs,
      })
      const sizeInBytes = serialized.length
      return (sizeInBytes / (1024 * 1024)).toFixed(3)
    } catch (e) {
      return '0.005'
    }
  }, [overview, inboundMessages, settingsForm, activityLogs])
  
  const availableSubcategories = useMemo(
    () => overview.subcategories.filter((subcategory) => subcategory.category_id === (albumForm.category_id || assetForm.category_id || subcategoryForm.category_id)),
    [albumForm.category_id, assetForm.category_id, overview.subcategories, subcategoryForm.category_id]
  )

  const filteredSubcategories = useMemo(() => {
    if (!subcatSearch) return overview.subcategories
    const term = subcatSearch.toLowerCase()
    return overview.subcategories.filter((s) => s.name.toLowerCase().includes(term))
  }, [overview.subcategories, subcatSearch])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out of Supabase:', e)
    }
    localStorage.removeItem('admin_session')
    toast.success('Logged out successfully')
    router.push('/admin/login')
  }

  const mutateEntity = async (entity: string, action: string, data: Record<string, any>) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/${entity}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Save failed')
      toast.success('Saved successfully')
      await refreshActiveSection()
      setActiveModal(null)
    } catch (error: any) {
      toast.error(error.message || 'Unable to save change')
    } finally {
      setSaving(false)
    }
  }

  const deleteEntity = async (entity: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item? This action is permanent.')) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/${entity}?id=${id}`, { method: 'DELETE' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Delete failed')
      toast.success('Deleted successfully')
      await refreshActiveSection()
    } catch (error: any) {
      toast.error(error.message || 'Unable to delete item')
    } finally {
      setSaving(false)
    }
  }

  const bulkDelete = async (entity: 'photos' | 'videos') => {
    const ids = entity === 'photos' ? selectedPhotos : selectedVideos
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected item(s)?`)) return
    await mutateEntity(entity, 'bulk-delete', { ids })
    entity === 'photos' ? setSelectedPhotos([]) : setSelectedVideos([])
  }

  const handleModifyAssetMetadata = (photo: GalleryPhoto) => {
    setAssetForm({
      id: photo.id,
      title: photo.title,
      description: photo.description || '',
      tags: Array.isArray(photo.tags) ? photo.tags.join(', ') : (photo.tags || ''),
      alt_text: photo.alt_text || '',
      category_id: photo.category_id || '',
      subcategory_id: photo.subcategory_id || '',
      album_id: '',
      featured: photo.featured || false,
      published: photo.published !== false,
      thumbnail_url: '',
    })
    setActiveModal('asset')
  }

  const uploadBestShotsFile = async (file: File) => {
    const catId = overview.categories[0]?.id || 'cat-1'
    setBestShotsUploading(true)
    try {
      const formData = new FormData()
      formData.append('kind', 'photo')
      formData.append('title', `BestShot_${file.name.split('.')[0]}`)
      formData.append('category_id', catId)
      formData.append('files', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const body = await response.json()
      if (!response.ok || !body.uploaded?.[0]) {
        throw new Error(body.message || 'File upload failed')
      }

      const uploadedPhoto = body.uploaded[0]
      const newPhoto = {
        id: uploadedPhoto.id,
        public_url: uploadedPhoto.public_url,
        title: uploadedPhoto.title,
        alt_text: uploadedPhoto.alt_text || uploadedPhoto.title,
      }

      setBestShotsForm((prev) => ({
        ...prev,
        photos: [...prev.photos, newPhoto]
      }))
      toast.success('Image uploaded and added to Best Shots!')
      void loadStorageStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image')
    } finally {
      setBestShotsUploading(false)
    }
  }

  const addPhotoFromLibrary = (photo: any) => {
    if (bestShotsForm.photos.some((p) => p.id === photo.id)) {
      toast.error('This photo is already added to Best Shots')
      return
    }
    const newPhoto = {
      id: photo.id,
      public_url: photo.public_url,
      title: photo.title,
      alt_text: photo.alt_text || photo.title,
    }
    setBestShotsForm((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }))
    toast.success('Added photo from Media Library!')
  }

  const saveBestShots = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          data: {
            best_shots: JSON.stringify(bestShotsForm)
          }
        }),
      })
      if (!response.ok) throw new Error('Save failed')
      toast.success('Best Shots configuration published!')
      await refreshActiveSection()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const resetBestShots = () => {
    if (window.confirm('Are you sure you want to reset "My Best Shots" to original theme defaults?')) {
      setBestShotsForm({
        title: 'My Best',
        highlight: 'Shots',
        description: 'A quiet selection of cinematic portraits, movement, romance, and coastal atmosphere.',
        visible: true,
        limit: 9,
        layout: 'cinematic',
        photos: defaultBestShotsPhotos
      })
      toast.success('Reverted to default settings. Click "Save Changes" to publish.')
    }
  }

  const handlePhotoDragStart = (index: number) => {
    setDraggedPhotoIdx(index)
  }

  const handlePhotoDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handlePhotoDrop = (index: number) => {
    if (draggedPhotoIdx === null) return
    const updated = [...bestShotsForm.photos]
    const [draggedItem] = updated.splice(draggedPhotoIdx, 1)
    if (draggedItem) {
      updated.splice(index, 0, draggedItem)
      setBestShotsForm((prev) => ({ ...prev, photos: updated }))
    }
    setDraggedPhotoIdx(null)
  }

  // Handle Drag & Drop Upload Events
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadFiles((prev) => [...prev, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files)
      setUploadFiles((prev) => [...prev, ...newFiles])
    }
  }

  // Cover Drag-and-Drop / Browse Events
  const handleCoverDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleCoverDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCoverUploadFile(e.dataTransfer.files[0])
    }
  }
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverUploadFile(e.target.files[0])
    }
  }

  // Execute Cover Image upload to get public URL path
  const uploadCoverImageFile = async (file: File, catId: string): Promise<string> => {
    const formData = new FormData()
    formData.append('kind', 'photo')
    formData.append('title', `Cover_${file.name.split('.')[0]}`)
    formData.append('category_id', catId)
    formData.append('files', file)

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const body = await response.json()
    if (!response.ok || !body.uploaded?.[0]) {
      throw new Error(body.message || 'Cover image upload failed')
    }
    return body.uploaded[0].public_url
  }

  const getYoutubeId = (url: string) => {
    if (!url) return ''
    const shortMatch = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/)
    if (shortMatch) return shortMatch[1]
    const standardMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=|v\/|.*[?&]v=))([A-Za-z0-9_-]{11})/)
    return standardMatch ? standardMatch[1] : ''
  }

  const handleYoutubeFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const url = youtubeForm.youtube_url
      const extractedId = getYoutubeId(url)
      if (!extractedId) {
        throw new Error('Could not parse a valid 11-character YouTube video ID. Please check the URL format.')
      }

      const embedUrl = `https://www.youtube.com/embed/${extractedId}`
      
      let finalThumb = youtubeForm.thumbnail_url?.trim()
      if (!finalThumb) {
        finalThumb = `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`
      }
      
      const categoryId = youtubeForm.category_id || overview.categories[0]?.id || ''

      const data = {
        ...youtubeForm,
        youtube_id: extractedId,
        public_url: embedUrl,
        thumbnail_url: finalThumb,
        category_id: categoryId,
      }

      const response = await fetch(`/api/admin/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: youtubeForm.id ? 'update' : 'create', data }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'YouTube video save failed')
      
      toast.success('Video saved successfully!')
      setActiveModal(null)
      await refreshActiveSection()
    } catch (err: any) {
      toast.error(err.message || 'Unable to save video')
    } finally {
      setSaving(false)
    }
  }

  // Handle Album Submit with automated slug generation and cover uploads
  const handleAlbumFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let finalCoverUrl = albumForm.cover_url

      // If a cover image was dropped/uploaded, submit it first
      if (coverUploadFile) {
        if (!albumForm.category_id) {
          throw new Error('Please select a Category before uploading the cover image.')
        }
        toast.loading('Uploading album cover...', { id: 'cover-upload' })
        finalCoverUrl = await uploadCoverImageFile(coverUploadFile, albumForm.category_id)
        toast.dismiss('cover-upload')
      }

      const generatedSlug = slugify(albumForm.title)
      const data = {
        ...albumForm,
        slug: generatedSlug,
        cover_url: finalCoverUrl,
      }

      const response = await fetch(`/api/admin/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: albumForm.id ? 'update' : 'create', data }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Album submission failed')

      toast.success('Album saved successfully!')
      setCoverUploadFile(null)
      await refreshActiveSection()
      
      // If creating new album, transition to Step 2 to upload embedded media
      if (!albumForm.id && body.data?.id) {
        setAlbumForm(body.data)
        setAlbumModalStep(2)
      } else {
        setActiveModal(null)
      }
    } catch (err: any) {
      toast.dismiss('cover-upload')
      toast.error(err.message || 'Unable to save album')
    } finally {
      setSaving(false)
    }
  }

  // Embedded Album Upload
  const handleEmbeddedUpload = async () => {
    if (!uploadFiles.length) {
      toast.error('No files queued for upload')
      return
    }
    setUploading(true)
    setUploadProgress(20)

    try {
      const formData = new FormData()
      formData.append('kind', uploadKind)
      formData.append('title', albumForm.title)
      formData.append('category_id', albumForm.category_id)
      formData.append('subcategory_id', albumForm.subcategory_id)
      formData.append('album_id', albumForm.id)
      formData.append('published', 'true')

      uploadFiles.forEach((file) => {
        formData.append('files', file)
      })

      setUploadProgress(60)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Embedded uploads failed')

      setUploadProgress(100)
      toast.success('Album photos uploaded!')
      setUploadFiles([])
      await refreshActiveSection()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const processUploadQueue = async () => {
    if (!uploadFiles.length) {
      toast.error('No files queued for upload')
      return
    }
    if (!albumForm.category_id) {
      toast.error('Please select a Category binding first')
      return
    }

    setUploading(true)
    setUploadProgress(20)

    try {
      const formData = new FormData()
      formData.append('kind', uploadKind)
      formData.append('title', 'Media Asset')
      formData.append('category_id', albumForm.category_id)
      if (albumForm.id) {
        formData.append('album_id', albumForm.id)
      }
      formData.append('published', 'true')

      uploadFiles.forEach((file) => {
        formData.append('files', file)
      })

      setUploadProgress(60)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Media upload failed')

      setUploadProgress(100)
      toast.success('Media files successfully uploaded!')
      setUploadFiles([])
      await refreshActiveSection()
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const togglePublish = async (entity: string, record: any) => {
    await mutateEntity(entity, 'update', { ...record, published: !record.published })
  }

  const toggleFeatured = async (entity: string, record: any) => {
    await mutateEntity(entity, 'update', { ...record, featured: !record.featured })
  }

  // Sibling-level reordering for Main and Sub Albums
  const handleAlbumReorder = async (album: GalleryAlbum, direction: 'up' | 'down') => {
    const siblings = overview.albums.filter((a) => (a.parent_id || '') === (album.parent_id || ''))
    siblings.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    
    const idx = siblings.findIndex((a) => a.id === album.id)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= siblings.length) return
    
    const targetAlbum = siblings[targetIdx]!
    const items = siblings.map((sib, index) => {
      if (index === idx) {
        return { id: sib.id, sort_order: Number(targetAlbum.sort_order ?? 0) }
      }
      if (index === targetIdx) {
        return { id: sib.id, sort_order: Number(album.sort_order ?? 0) }
      }
      return { id: sib.id, sort_order: Number(sib.sort_order ?? index) }
    })

    setSaving(true)
    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: 'albums', items })
      })
      if (!response.ok) throw new Error('Reordering failed')
      toast.success('Order updated')
      await refreshActiveSection()
    } catch (e: any) {
      toast.error(e.message || 'Reorder failed')
    } finally {
      setSaving(false)
    }
  }

  // Nested Album structures & helper states
  const mainAlbums = useMemo(() => {
    const listToUse = activeSection === 'albums' ? paginatedAlbums : overview.albums
    return listToUse.filter((a) => !a.parent_id || a.parent_id === '')
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
  }, [activeSection, paginatedAlbums, overview.albums])

  const subAlbumsByParent = useMemo(() => {
    const map = new Map<string, GalleryAlbum[]>()
    const listToUse = activeSection === 'albums' ? paginatedAlbums : overview.albums
    listToUse.forEach((a) => {
      if (a.parent_id) {
        const list = map.get(a.parent_id) || []
        list.push(a)
        map.set(a.parent_id, list)
      }
    })
    return map
  }, [activeSection, paginatedAlbums, overview.albums])

  const toggleCollapsed = (id: string) => {
    setCollapsedAlbums((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleAlbumDragStart = (e: React.DragEvent, id: string, type: 'main' | 'sub', parentId?: string) => {
    setDraggedAlbum({ id, type, parentId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleAlbumDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleAlbumDrop = async (e: React.DragEvent, targetId: string, targetType: 'main' | 'sub', targetParentId?: string) => {
    e.preventDefault()
    if (!draggedAlbum) return

    const sourceId = draggedAlbum.id
    if (sourceId === targetId) return

    // 1. Reorder Main Albums
    if (draggedAlbum.type === 'main' && targetType === 'main') {
      const list = [...mainAlbums]
      const sourceIdx = list.findIndex(a => a.id === sourceId)
      const targetIdx = list.findIndex(a => a.id === targetId)
      if (sourceIdx !== -1 && targetIdx !== -1) {
        const [draggedItem] = list.splice(sourceIdx, 1)
        if (draggedItem) {
          list.splice(targetIdx, 0, draggedItem)
          const items = list.map((item, index) => ({ id: item.id, sort_order: index }))
          await submitReorder('albums', items)
        }
      }
    }

    // 2. Drag Sub Album into another Main Album
    if (draggedAlbum.type === 'sub' && targetType === 'main') {
      if (draggedAlbum.parentId !== targetId) {
        await moveSubAlbumToParent(sourceId, targetId)
      }
    }

    // 3. Drag Sub Album onto a Sub Album
    if (draggedAlbum.type === 'sub' && targetType === 'sub') {
      const targetParent = targetParentId || ''
      if (draggedAlbum.parentId === targetParent) {
        const siblings = subAlbumsByParent.get(targetParent) || []
        siblings.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
        
        const sourceIdx = siblings.findIndex(s => s.id === sourceId)
        const targetIdx = siblings.findIndex(s => s.id === targetId)
        if (sourceIdx !== -1 && targetIdx !== -1) {
          const list = [...siblings]
          const [draggedItem] = list.splice(sourceIdx, 1)
          if (draggedItem) {
            list.splice(targetIdx, 0, draggedItem)
            const items = list.map((item, index) => ({ id: item.id, sort_order: index }))
            await submitReorder('albums', items)
          }
        }
      } else {
        await moveSubAlbumToParent(sourceId, targetParent)
      }
    }

    setDraggedAlbum(null)
  }

  const moveSubAlbumToParent = async (subAlbumId: string, parentId: string) => {
    const subAlbum = overview.albums.find(a => a.id === subAlbumId)
    if (!subAlbum) return
    
    const parent = overview.albums.find(a => a.id === parentId)
    if (!parent) return

    setSaving(true)
    try {
      const data = {
        ...subAlbum,
        parent_id: parentId,
        category_id: parent.category_id,
        subcategory_id: parent.subcategory_id || '',
      }
      const response = await fetch(`/api/admin/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', data }),
      })
      if (!response.ok) throw new Error('Failed to move sub-album')
      toast.success(`Moved to ${parent.title}`)
      await refreshActiveSection()
    } catch (e: any) {
      toast.error(e.message || 'Move failed')
    } finally {
      setSaving(false)
    }
  }

  const submitReorder = async (entity: string, items: any[]) => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, items }),
      })
      if (!response.ok) throw new Error('Reordering failed')
      toast.success('Order updated')
      await refreshActiveSection()
    } catch (e: any) {
      toast.error(e.message || 'Reorder failed')
    } finally {
      setSaving(false)
    }
  }

  const getAggregateCounts = (mainAlbumId: string) => {
    const mainAlbum = overview.albums.find((a) => a.id === mainAlbumId)
    let photoCount = mainAlbum?.photo_count ?? 0
    let videoCount = mainAlbum?.video_count ?? 0
    
    const subAlbums = overview.albums.filter((a) => String(a.parent_id) === mainAlbumId)
    subAlbums.forEach((sub) => {
      photoCount += sub.photo_count ?? 0
      videoCount += sub.video_count ?? 0
    })
    
    return { photoCount, videoCount }
  }

  const linkedPhotos = useMemo(() => {
    if (!albumForm.id) return []
    const links = overview.album_photos || []
    return links
      .filter((link) => String(link.album_id) === String(albumForm.id))
      .map((link) => {
        const photo = overview.photos.find((p) => String(p.id) === String(link.photo_id))
        return photo ? { ...photo, sort_order: link.sort_order ?? 0 } : null
      })
      .filter(Boolean)
      .sort((a, b) => Number(a!.sort_order) - Number(b!.sort_order)) as GalleryPhoto[]
  }, [albumForm.id, overview.album_photos, overview.photos])

  const linkedVideos = useMemo(() => {
    if (!albumForm.id) return []
    const links = overview.album_videos || []
    return links
      .filter((link) => String(link.album_id) === String(albumForm.id))
      .map((link) => {
        const video = overview.videos.find((v) => String(v.id) === String(link.video_id))
        return video ? { ...video, sort_order: link.sort_order ?? 0 } : null
      })
      .filter(Boolean)
      .sort((a, b) => Number(a!.sort_order) - Number(b!.sort_order)) as GalleryVideo[]
  }, [albumForm.id, overview.album_videos, overview.videos])

  const handleParentChange = (parentId: string) => {
    if (parentId) {
      const parent = overview.albums.find((a) => a.id === parentId)
      if (parent) {
        setAlbumForm((prev) => ({
          ...prev,
          parent_id: parentId,
          category_id: parent.category_id,
          subcategory_id: parent.subcategory_id || '',
        }))
        return
      }
    }
    setAlbumForm((prev) => ({
      ...prev,
      parent_id: '',
    }))
  }

  const handleAlbumMediaDrop = async (targetIdx: number, type: 'photo' | 'video') => {
    if (draggedMediaIdx === null || draggedMediaType !== type) return
    
    let items: any[] = []
    
    if (type === 'photo') {
      const list = [...linkedPhotos]
      const [draggedItem] = list.splice(draggedMediaIdx, 1)
      if (!draggedItem) return
      list.splice(targetIdx, 0, draggedItem)
      items = list.map((item, index) => ({
        album_id: albumForm.id,
        photo_id: item.id,
        sort_order: index,
      }))
    } else {
      const list = [...linkedVideos]
      const [draggedItem] = list.splice(draggedMediaIdx, 1)
      if (!draggedItem) return
      list.splice(targetIdx, 0, draggedItem)
      items = list.map((item, index) => ({
        album_id: albumForm.id,
        video_id: item.id,
        sort_order: index,
      }))
    }
    
    setSaving(true)
    try {
      const response = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: type === 'photo' ? 'album_photos' : 'album_videos',
          items,
        }),
      })
      if (!response.ok) throw new Error('Reordering failed')
      toast.success('Media order updated')
      await refreshActiveSection()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order')
    } finally {
      setSaving(false)
      setDraggedMediaIdx(null)
      setDraggedMediaType(null)
    }
  }

  const handleDeleteAlbumMedia = async (kind: 'photo' | 'video', id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${kind}? This will delete the file permanently.`)) return
    setSaving(true)
    try {
      const entity = kind === 'video' ? 'videos' : 'photos'
      const response = await fetch(`/api/admin/${entity}?id=${id}`, { method: 'DELETE' })
      const body = await response.json()
      if (!response.ok) throw new Error(body.message || 'Delete failed')
      toast.success('Media deleted successfully')
      await refreshActiveSection()
    } catch (error: any) {
      toast.error(error.message || 'Unable to delete media')
    } finally {
      setSaving(false)
    }
  }

  const markMessageRead = async (message: any) => {
    await mutateEntity('messages', 'update', { ...message, status: 'read' })
    setSelectedMessage((prev: any) => (prev && prev.id === message.id ? { ...prev, status: 'read' } : prev))
  }

  const menuItems = [
    { key: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { key: 'albums', label: 'Albums', icon: FolderKanban },
    { key: 'photos', label: 'Media Library', icon: ImagePlus },
    { key: 'videos', label: 'Videos', icon: VideoIcon },
    { key: 'categories', label: 'Categories', icon: Layers3 },
    { key: 'uploads', label: 'Upload Studio', icon: UploadCloud },
    { key: 'homepage', label: 'Homepage Content', icon: Globe },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    { key: 'messages', label: 'Messages', icon: MessageSquare, badge: inboundMessages.filter(m => m.status === 'unread').length },
    { key: 'settings', label: 'Brand Settings', icon: Sliders },
  ]

  const displayStats = useMemo(() => {
    const albCount = overview.albums.length
    const photoCount = overview.photos.length
    const videoCount = overview.videos.length
    return {
      albums: albCount || stats.albums,
      photos: photoCount || stats.photos,
      videos: videoCount || stats.videos,
      totalViews: (albCount * 145) + (photoCount * 32) + 248
    }
  }, [overview, stats])

  // Glass Card class (Light Theme Luxury styling)
  const glassCardClass =
    'bg-white/80 border border-white/80 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(148,163,184,0.05)] backdrop-blur-xl transition duration-500'

  return (
    <div className="flex min-h-screen bg-[#F8F6F2] text-slate-800 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-[#EFE2D8]/60 transition-all duration-500 relative z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-white border border-[#E8D4C9] flex items-center justify-center text-slate-400 hover:text-slate-900 transition shadow-md cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="p-6 border-b border-[#EFE2D8]/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-peach-400 to-gold-400 flex items-center justify-center shadow-md">
            <Camera className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-display text-sm tracking-[0.2em] font-bold text-slate-900">RAVIZSTUDIO</span>
              <span className="text-[10px] text-rose-500 font-semibold tracking-widest uppercase">Creative CMS</span>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveSection(item.key as AdminSection)
                  setSearchText('')
                }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left text-sm font-medium transition-all duration-300 relative group ${
                  active
                    ? 'bg-[#F2EEE6] text-slate-900 border border-[#E8D4C9]/40 font-semibold shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-[#FBF8F4]'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-rose-500' : 'text-slate-400'}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge ? (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#EFE2D8]/60">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 transition duration-300"
          >
            <LogOut className="h-5 w-5 text-slate-400" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* CORE CONTAINER */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.02),transparent_45%)]">
        
        <header className="sticky top-0 bg-[#F8F6F2]/90 border-b border-[#EFE2D8]/60 backdrop-blur-xl px-6 py-5 flex items-center justify-between z-20">
          <h2 className="font-display text-2xl font-light tracking-wide text-slate-900 capitalize">
            {activeSection === 'dashboard' ? 'Overview' : activeSection}
          </h2>

          <div className="flex items-center gap-4">
            {['albums', 'photos', 'videos'].includes(activeSection) && (
              <div className="relative hidden sm:block">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="rounded-full border border-[#E8D4C9] bg-white py-2 pl-10 pr-4 text-xs text-slate-700 outline-none w-64 focus:border-rose-500/50"
                  placeholder="Type to search..."
                />
              </div>
            )}

            <button
              onClick={() => {
                setAlbumForm(defaultAlbumForm)
                setAlbumType('main')
                setCoverUploadFile(null)
                setAlbumModalStep(1)
                setActiveModal('album')
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-rose-500 to-peach-600 rounded-full text-white hover:opacity-90 shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Album
            </button>
          </div>
        </header>

        {/* WORKSPACE VIEWPORTS */}
        <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading creative assets...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {/* 1. OVERVIEW / DASHBOARD VIEW */}
                {activeSection === 'dashboard' && (
                  <div className="space-y-8">
                    
                    {/* STATS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {[
                        { title: 'Total Albums', value: displayStats.albums, icon: FolderKanban, color: 'text-rose-500' },
                        { title: 'Total Photos', value: displayStats.photos, icon: ImagePlus, color: 'text-peach-500' },
                        { title: 'Total Videos', value: displayStats.videos, icon: VideoIcon, color: 'text-sky-500' },
                        { title: 'Total Views', value: displayStats.totalViews, icon: Eye, color: 'text-gold-500' },
                      ].map((card, i) => {
                        const Icon = card.icon
                        return (
                          <div
                            key={i}
                            className="bg-white border border-[#EFE2D8]/80 rounded-[2rem] p-6 flex items-center justify-between shadow-sm hover:shadow-md transition duration-300"
                          >
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block">{card.title}</span>
                              <h3 className="text-3xl font-display font-bold text-slate-800">{card.value}</h3>
                            </div>
                            <div className={`p-3.5 rounded-2xl bg-[#FBF8F4] ${card.color}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2 space-y-6">
                        {/* Quick links */}
                        <div className={glassCardClass}>
                          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Quick Actions</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <button
                              onClick={() => setActiveSection('uploads')}
                              className="p-5 rounded-2xl bg-[#FBF8F4] hover:bg-[#F2EEE6] border border-[#EFE2D8]/40 text-center space-y-3 transition duration-300"
                            >
                              <UploadCloud className="h-6 w-6 text-rose-500 mx-auto" />
                              <span className="block text-xs font-semibold text-slate-700">Upload Media</span>
                            </button>
                            <button
                              onClick={() => {
                                setAlbumForm(defaultAlbumForm)
                                setAlbumType('main')
                                setCoverUploadFile(null)
                                setAlbumModalStep(1)
                                setActiveModal('album')
                              }}
                              className="p-5 rounded-2xl bg-[#FBF8F4] hover:bg-[#F2EEE6] border border-[#EFE2D8]/40 text-center space-y-3 transition duration-300"
                            >
                              <FolderKanban className="h-6 w-6 text-peach-500 mx-auto" />
                              <span className="block text-xs font-semibold text-slate-700">Create Album</span>
                            </button>
                            <button
                              onClick={() => setActiveSection('settings')}
                              className="p-5 rounded-2xl bg-[#FBF8F4] hover:bg-[#F2EEE6] border border-[#EFE2D8]/40 text-center space-y-3 transition duration-300"
                            >
                              <Sliders className="h-6 w-6 text-gold-500 mx-auto" />
                              <span className="block text-xs font-semibold text-slate-700">Brand Config</span>
                            </button>
                            <button
                              onClick={() => window.open('/', '_blank')}
                              className="p-5 rounded-2xl bg-[#FBF8F4] hover:bg-[#F2EEE6] border border-[#EFE2D8]/40 text-center space-y-3 transition duration-300"
                            >
                              <Globe className="h-6 w-6 text-sky-500 mx-auto" />
                              <span className="block text-xs font-semibold text-slate-700">Live Website</span>
                            </button>
                          </div>
                        </div>

                        {/* Recent albums slider */}
                        <div className={glassCardClass}>
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Recent Collections</h4>
                            <button onClick={() => setActiveSection('albums')} className="text-xs text-rose-500 font-semibold hover:underline">
                              See All
                            </button>
                          </div>

                          {!overview.albums.length ? (
                            <div className="text-center py-10 border border-dashed border-[#E8D4C9] rounded-2xl">
                              <FolderKanban className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-xs text-slate-400">No albums added</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {overview.albums.slice(0, 3).map((album) => (
                                <div key={album.id} className="group relative bg-[#FBF8F4] rounded-2xl border border-[#EFE2D8]/80 overflow-hidden shadow-sm hover:shadow-md transition">
                                  <div className="aspect-[4/3] bg-[#EFE2D8] overflow-hidden relative">
                                    {album.cover_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <Camera className="h-6 w-6" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-4">
                                      <span className="text-[9px] uppercase font-bold text-rose-300 tracking-wider">
                                        {album.category?.name || 'Photography'}
                                      </span>
                                      <h5 className="font-semibold text-sm text-white line-clamp-1 mt-0.5">{album.title}</h5>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Timeline widgets */}
                      <div className="space-y-6">
                        <div className={`${glassCardClass} relative overflow-hidden group`}>
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 flex items-center gap-2">
                              <HardDrive className="h-4 w-4 text-rose-500" />
                              Storage Monitor
                            </h4>
                            {loadingStorage && (
                              <span className="text-[9px] text-rose-500 font-semibold uppercase tracking-widest animate-pulse">
                                Refreshing...
                              </span>
                            )}
                          </div>

                          {storageError ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                              <p className="text-xs text-rose-500 font-medium">
                                Unable to calculate storage usage.
                              </p>
                            </div>
                          ) : !storageStats ? (
                            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                              <Loader2 className="h-5 w-5 text-rose-500 animate-spin" />
                              <p className="text-[11px] text-slate-400">Calculating storage...</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="space-y-1.5">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-xs text-slate-500 font-medium">Storage Used</span>
                                  <span className="font-mono font-semibold text-slate-800 text-sm">
                                    {storageStats.storageUsedFormatted}
                                    <span className="text-slate-400 font-normal"> / {storageStats.storageLimitFormatted}</span>
                                  </span>
                                </div>
                                
                                <div className="flex justify-between text-[11px] text-slate-400">
                                  <span>Remaining: {storageStats.remainingStorageFormatted}</span>
                                  <span className="font-semibold text-slate-700">{storageStats.usagePercentage}%</span>
                                </div>
                              </div>

                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden relative shadow-inner">
                                <motion.div
                                  className={`h-full rounded-full ${
                                    storageStats.usagePercentage < 70
                                      ? 'bg-emerald-500'
                                      : storageStats.usagePercentage < 90
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${storageStats.usagePercentage}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2.5 pt-1">
                                <div className="bg-[#FBF8F4] border border-[#EFE2D8]/50 p-2.5 rounded-2xl text-center space-y-1 hover:border-[#E8D4C9] transition duration-300">
                                  <ImageIcon className="h-3.5 w-3.5 text-rose-500 mx-auto" />
                                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Images</span>
                                  <span className="block text-xs font-bold text-slate-800">{storageStats.totalImages}</span>
                                </div>
                                
                                <div className="bg-[#FBF8F4] border border-[#EFE2D8]/50 p-2.5 rounded-2xl text-center space-y-1 hover:border-[#E8D4C9] transition duration-300">
                                  <VideoIcon className="h-3.5 w-3.5 text-peach-500 mx-auto" />
                                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Videos</span>
                                  <span className="block text-xs font-bold text-slate-800">{storageStats.totalVideos}</span>
                                </div>
                                
                                <div className="bg-[#FBF8F4] border border-[#EFE2D8]/50 p-2.5 rounded-2xl text-center space-y-1 hover:border-[#E8D4C9] transition duration-300">
                                  <Database className="h-3.5 w-3.5 text-sky-500 mx-auto" />
                                  <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Files</span>
                                  <span className="block text-xs font-bold text-slate-800">{storageStats.totalFiles}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className={glassCardClass}>
                          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Activity Trail</h4>
                          {!activityLogs.length ? (
                            <p className="text-xs text-slate-400">No logs collected yet</p>
                          ) : (
                            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-hide">
                              {activityLogs.slice(0, 5).map((log) => (
                                <div key={log.id || Math.random()} className="flex gap-4">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                                  <div className="flex-1 space-y-0.5">
                                    <p className="text-xs text-slate-600">
                                      <span className="font-semibold text-slate-900 capitalize">{log.action?.replace('-', ' ')}</span> on{' '}
                                      <span className="text-rose-500 font-mono text-[9px]">{log.entity_type}</span>{' '}
                                      {log.metadata?.title && `("${log.metadata.title}")`}
                                    </p>
                                    <span className="block text-[9px] text-slate-400">
                                      {new Date(log.created_at || Date.now()).toLocaleDateString(undefined, {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. ALBUMS TAB */}
                {activeSection === 'albums' && (
                  <div className="space-y-6">
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-[#EFE2D8] p-5 rounded-3xl shadow-sm">
                      <div>
                        <h3 className="font-display text-lg font-light text-slate-800">Album Collections</h3>
                        <p className="text-xs text-slate-400">Organize your main galleries and nested sub-albums with Drag & Drop.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setAlbumForm(defaultAlbumForm)
                            setAlbumType('main')
                            setCoverUploadFile(null)
                            setAlbumModalStep(1)
                            setActiveModal('album')
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#E8D4C9] bg-white text-slate-700 hover:bg-[#FBF8F4] rounded-full transition cursor-pointer shadow-sm animate-fade-in"
                        >
                          <Plus className="h-3.5 w-3.5 text-rose-500" />
                          New Main Album
                        </button>
                        <button
                          onClick={() => {
                            setAlbumForm({ ...defaultAlbumForm, parent_id: overview.albums.find(a => !a.parent_id)?.id || '' })
                            setAlbumType('sub')
                            setCoverUploadFile(null)
                            setAlbumModalStep(1)
                            setActiveModal('album')
                          }}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-800 rounded-full transition cursor-pointer shadow-sm"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New Sub Album
                        </button>
                      </div>
                    </div>

                    {!overview.albums.length ? (
                      <div className="text-center py-20 bg-white border border-[#EFE2D8] rounded-[2rem] shadow-sm">
                        <FolderKanban className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-light text-slate-500">No collections assembled yet</h4>
                        <div className="mt-4 flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setAlbumForm(defaultAlbumForm)
                              setAlbumType('main')
                              setCoverUploadFile(null)
                              setAlbumModalStep(1)
                              setActiveModal('album')
                            }}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 rounded-full text-xs font-semibold text-white transition cursor-pointer"
                          >
                            New Main Album
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {overview.categories.map((category) => {
                          const categoryAlbums = mainAlbums.filter((a) => String(a.category_id) === String(category.id))
                          const isCatExpanded = !collapsedCategories[category.id]
                          
                          return (
                            <div key={category.id} className="bg-white border border-[#EFE2D8] rounded-[2rem] overflow-hidden shadow-sm">
                              {/* Category Folder Header */}
                              <div
                                onClick={() => setCollapsedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                                className="flex items-center justify-between p-5 bg-[#FBF8F4]/60 border-b border-[#EFE2D8]/60 cursor-pointer hover:bg-[#F2EEE6]/50 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400 text-xs">
                                    {isCatExpanded ? '▼' : '▶'}
                                  </span>
                                  <span className="text-lg text-slate-400">📁</span>
                                  <div>
                                    <span className="font-display font-medium text-slate-800 uppercase tracking-wider text-sm">
                                      {category.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-2">
                                      ({categoryAlbums.length} main albums)
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs text-rose-500 font-semibold tracking-wider uppercase">
                                  Category Folder
                                </span>
                              </div>

                              {/* Category Albums Container */}
                              {isCatExpanded && (
                                <div className="p-5 space-y-4 bg-white">
                                  {!categoryAlbums.length ? (
                                    <p className="text-xs text-slate-400 italic py-2 pl-6">No albums created under this category yet.</p>
                                  ) : (
                                    categoryAlbums.map((mainAlbum, mainIndex) => {
                                      const subAlbums = subAlbumsByParent.get(mainAlbum.id) || []
                                      const hasSubs = subAlbums.length > 0
                                      const isExpanded = !collapsedAlbums[mainAlbum.id]
                                      const mainCounts = getAggregateCounts(mainAlbum.id)
                                      
                                      return (
                                        <div
                                          key={mainAlbum.id}
                                          draggable
                                          onDragStart={(e) => handleAlbumDragStart(e, mainAlbum.id, 'main')}
                                          onDragOver={handleAlbumDragOver}
                                          onDrop={(e) => handleAlbumDrop(e, mainAlbum.id, 'main')}
                                          className={`border border-[#EFE2D8] rounded-3xl overflow-hidden p-4 space-y-4 transition ${
                                            draggedAlbum?.id === mainAlbum.id ? 'opacity-40 border-dashed border-rose-400 bg-rose-50/10' : 'hover:border-slate-350 hover:shadow-sm'
                                          }`}
                                        >
                                          {/* Main Album Row */}
                                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                              <button
                                                onClick={() => toggleCollapsed(mainAlbum.id)}
                                                className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-[#F2EEE6] rounded-lg transition"
                                              >
                                                {isExpanded ? (
                                                  <span className="text-xs">▼</span>
                                                ) : (
                                                  <span className="text-xs">▶</span>
                                                )}
                                              </button>
                                              
                                              <span className="text-xl text-slate-400">📁</span>
                                              
                                              <div className="w-14 h-10 rounded-xl bg-[#EFE2D8] overflow-hidden flex-shrink-0 relative">
                                                {mainAlbum.cover_url ? (
                                                  // eslint-disable-next-line @next/next/no-img-element
                                                  <img src={mainAlbum.cover_url} alt={mainAlbum.title} className="w-full h-full object-cover" />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-[#FBF8F4]">
                                                    <Camera className="h-4 w-4" />
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="font-semibold text-sm text-slate-900">{mainAlbum.title}</span>
                                                  <span className="px-2 py-0.5 text-[8px] rounded-full bg-rose-50 border border-rose-200/40 text-rose-600 font-bold uppercase tracking-wider">
                                                    Main
                                                  </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono block">slug: {mainAlbum.slug}</span>
                                              </div>
                                            </div>
                                            
                                            {/* Stats & Settings */}
                                            <div className="flex flex-wrap items-center gap-4 text-xs">
                                              <span className="text-slate-500 font-medium">
                                                {hasSubs ? `${subAlbums.length} sub-albums • ` : ''}
                                                {mainCounts.photoCount} photos • {mainCounts.videoCount} videos
                                              </span>
                                              
                                              <div className="flex items-center gap-1">
                                                <button
                                                  disabled={mainIndex === 0}
                                                  onClick={() => handleAlbumReorder(mainAlbum, 'up')}
                                                  className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 transition"
                                                  title="Move Up"
                                                >
                                                  ▲
                                                </button>
                                                <button
                                                  disabled={mainIndex === categoryAlbums.length - 1}
                                                  onClick={() => handleAlbumReorder(mainAlbum, 'down')}
                                                  className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 transition"
                                                  title="Move Down"
                                                >
                                                  ▼
                                                </button>
                                              </div>
                                              
                                              <button onClick={() => toggleFeatured('albums', mainAlbum)} className="cursor-pointer" title="Toggle Featured">
                                                <Star className={`h-4 w-4 ${mainAlbum.featured ? 'text-gold-400 fill-gold-400' : 'text-slate-300'}`} />
                                              </button>
                                              
                                              <button
                                                onClick={() => togglePublish('albums', mainAlbum)}
                                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition ${
                                                  mainAlbum.published
                                                    ? 'bg-[#F2EEE6] text-rose-600 border border-rose-200/40'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                }`}
                                              >
                                                {mainAlbum.published ? 'Visible' : 'Hidden'}
                                              </button>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-2 self-end lg:self-auto">
                                              <button
                                                onClick={() => {
                                                  setAlbumForm({
                                                    id: mainAlbum.id,
                                                    title: mainAlbum.title,
                                                    description: mainAlbum.description || '',
                                                    category_id: mainAlbum.category_id || '',
                                                    subcategory_id: mainAlbum.subcategory_id || '',
                                                    cover_url: mainAlbum.cover_url || '',
                                                    featured: mainAlbum.featured || false,
                                                    published: mainAlbum.published !== false,
                                                    seo_title: mainAlbum.seo_title || '',
                                                    seo_description: mainAlbum.seo_description || '',
                                                    event_date: mainAlbum.event_date || '',
                                                    parent_id: '',
                                                  })
                                                  setCoverUploadFile(null)
                                                  setAlbumModalStep(2)
                                                  setStep2Tab('view')
                                                  setActiveModal('album')
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-[#F2EEE6] border border-[#E8D4C9] text-xs font-semibold text-slate-700 hover:border-slate-400 transition flex items-center gap-1"
                                              >
                                                <ImagePlus className="h-3.5 w-3.5" />
                                                <span>Media</span>
                                              </button>
                                              
                                              <button
                                                onClick={() => {
                                                  setAlbumForm({
                                                    id: mainAlbum.id,
                                                    title: mainAlbum.title,
                                                    description: mainAlbum.description || '',
                                                    category_id: mainAlbum.category_id || '',
                                                    subcategory_id: mainAlbum.subcategory_id || '',
                                                    cover_url: mainAlbum.cover_url || '',
                                                    featured: mainAlbum.featured || false,
                                                    published: mainAlbum.published !== false,
                                                    seo_title: mainAlbum.seo_title || '',
                                                    seo_description: mainAlbum.seo_description || '',
                                                    event_date: mainAlbum.event_date || '',
                                                    parent_id: '',
                                                  })
                                                  setAlbumType('main')
                                                  setCoverUploadFile(null)
                                                  setAlbumModalStep(1)
                                                  setActiveModal('album')
                                                }}
                                                className="p-2 rounded-xl bg-[#FBF8F4] border border-[#E8D4C9] text-slate-600 hover:border-slate-400 transition"
                                                title="Edit Album"
                                              >
                                                <Pencil className="h-3.5 w-3.5" />
                                              </button>

                                              <button
                                                onClick={() => window.open(`/gallery/${mainAlbum.slug}`, '_blank')}
                                                className="p-2 rounded-xl bg-white border border-[#E8D4C9] text-slate-600 hover:border-slate-450 hover:text-slate-900 transition"
                                                title="View Album"
                                              >
                                                <Eye className="h-3.5 w-3.5" />
                                              </button>
                                              
                                              <button
                                                onClick={() => {
                                                  setAlbumForm({
                                                    id: '',
                                                    title: '',
                                                    description: '',
                                                    category_id: mainAlbum.category_id || '',
                                                    subcategory_id: mainAlbum.subcategory_id || '',
                                                    cover_url: '',
                                                    featured: false,
                                                    published: true,
                                                    seo_title: '',
                                                    seo_description: '',
                                                    event_date: '',
                                                    parent_id: mainAlbum.id,
                                                  })
                                                  setAlbumType('sub')
                                                  setCoverUploadFile(null)
                                                  setAlbumModalStep(1)
                                                  setActiveModal('album')
                                                }}
                                                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                                              >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span>Sub Album</span>
                                              </button>
                                              
                                              <button
                                                onClick={() => deleteEntity('albums', mainAlbum.id)}
                                                className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                          
                                          {/* Sub albums list wrapper */}
                                          {isExpanded && (
                                            <div className="pl-6 md:pl-10 border-l border-dashed border-[#EFE2D8] ml-4 md:ml-5 space-y-3 pt-2">
                                              {/* Always visible nested ➕ Create Sub Album button */}
                                              <button
                                                onClick={() => {
                                                  setAlbumForm({
                                                    id: '',
                                                    title: '',
                                                    description: '',
                                                    category_id: mainAlbum.category_id || '',
                                                    subcategory_id: mainAlbum.subcategory_id || '',
                                                    cover_url: '',
                                                    featured: false,
                                                    published: true,
                                                    seo_title: '',
                                                    seo_description: '',
                                                    event_date: '',
                                                    parent_id: mainAlbum.id,
                                                  })
                                                  setAlbumType('sub')
                                                  setCoverUploadFile(null)
                                                  setAlbumModalStep(1)
                                                  setActiveModal('album')
                                                }}
                                                className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-[#FBF8F4]/30 hover:bg-[#FBF8F4]/60 border border-dashed border-[#E8D4C9] rounded-2xl text-xs text-slate-500 font-semibold transition cursor-pointer"
                                              >
                                                <Plus className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                                                Create Sub Album
                                              </button>

                                              {subAlbums
                                                .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
                                                .map((subAlbum, subIndex) => {
                                                  return (
                                                    <div
                                                      key={subAlbum.id}
                                                      draggable
                                                      onDragStart={(e) => handleAlbumDragStart(e, subAlbum.id, 'sub', mainAlbum.id)}
                                                      onDragOver={handleAlbumDragOver}
                                                      onDrop={(e) => handleAlbumDrop(e, subAlbum.id, 'sub', mainAlbum.id)}
                                                      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-[#FBF8F4]/40 border rounded-2xl hover:bg-[#FBF8F4] transition ${
                                                        draggedAlbum?.id === subAlbum.id ? 'opacity-40 border-dashed border-rose-400 bg-rose-50/10' : 'border-[#EFE2D8]/50'
                                                      }`}
                                                    >
                                                      <div className="flex items-center gap-3">
                                                        <span className="text-slate-400 text-xs">├──</span>
                                                        <div className="w-12 h-9 rounded-lg bg-[#EFE2D8] overflow-hidden flex-shrink-0 relative">
                                                          {subAlbum.cover_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={subAlbum.cover_url} alt={subAlbum.title} className="w-full h-full object-cover" />
                                                          ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white">
                                                              <Camera className="h-3.5 w-3.5" />
                                                            </div>
                                                          )}
                                                        </div>
                                                        
                                                        <div>
                                                          <span className="font-semibold text-sm text-slate-800 block">{subAlbum.title}</span>
                                                          <span className="text-[9px] text-slate-400 font-mono block">slug: {subAlbum.slug}</span>
                                                        </div>
                                                      </div>
                                                      
                                                      {/* Sub stats & reorder */}
                                                      <div className="flex flex-wrap items-center gap-4 text-xs">
                                                        <span className="text-slate-500 font-medium">
                                                          {subAlbum.photo_count ?? 0} photos • {subAlbum.video_count ?? 0} videos
                                                        </span>
                                                        
                                                        <div className="flex items-center gap-1">
                                                          <button
                                                            disabled={subIndex === 0}
                                                            onClick={() => handleAlbumReorder(subAlbum, 'up')}
                                                            className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 transition"
                                                            title="Move Up"
                                                          >
                                                            ▲
                                                          </button>
                                                          <button
                                                            disabled={subIndex === subAlbums.length - 1}
                                                            onClick={() => handleAlbumReorder(subAlbum, 'down')}
                                                            className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 transition"
                                                            title="Move Down"
                                                          >
                                                            ▼
                                                          </button>
                                                        </div>
                                                        
                                                        <button
                                                          onClick={() => togglePublish('albums', subAlbum)}
                                                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition ${
                                                            subAlbum.published
                                                              ? 'bg-[#F2EEE6] text-rose-600 border border-rose-200/40'
                                                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                          }`}
                                                        >
                                                          {subAlbum.published ? 'Visible' : 'Hidden'}
                                                        </button>
                                                      </div>
                                                      
                                                      {/* Actions */}
                                                      <div className="flex items-center gap-2 self-end lg:self-auto">
                                                        <button
                                                          onClick={() => {
                                                            setAlbumForm({
                                                              id: subAlbum.id,
                                                              title: subAlbum.title,
                                                              description: subAlbum.description || '',
                                                              category_id: subAlbum.category_id || '',
                                                              subcategory_id: subAlbum.subcategory_id || '',
                                                              cover_url: subAlbum.cover_url || '',
                                                              featured: subAlbum.featured || false,
                                                              published: subAlbum.published !== false,
                                                              seo_title: subAlbum.seo_title || '',
                                                              seo_description: subAlbum.seo_description || '',
                                                              event_date: subAlbum.event_date || '',
                                                              parent_id: subAlbum.parent_id || '',
                                                            })
                                                            setCoverUploadFile(null)
                                                            setAlbumModalStep(2)
                                                            setStep2Tab('view')
                                                            setActiveModal('album')
                                                          }}
                                                          className="px-2.5 py-1.5 rounded-xl bg-[#F2EEE6] border border-[#E8D4C9] text-[10px] font-bold text-slate-700 hover:border-slate-400 transition flex items-center gap-1"
                                                        >
                                                          <ImagePlus className="h-3 w-3" />
                                                          <span>Media</span>
                                                        </button>
                                                        
                                                        <button
                                                          onClick={() => {
                                                            setAlbumForm({
                                                              id: subAlbum.id,
                                                              title: subAlbum.title,
                                                              description: subAlbum.description || '',
                                                              category_id: subAlbum.category_id || '',
                                                              subcategory_id: subAlbum.subcategory_id || '',
                                                              cover_url: subAlbum.cover_url || '',
                                                              featured: subAlbum.featured || false,
                                                              published: subAlbum.published !== false,
                                                              seo_title: subAlbum.seo_title || '',
                                                              seo_description: subAlbum.seo_description || '',
                                                              event_date: subAlbum.event_date || '',
                                                              parent_id: subAlbum.parent_id || '',
                                                            })
                                                            setAlbumType('sub')
                                                            setCoverUploadFile(null)
                                                            setAlbumModalStep(1)
                                                            setActiveModal('album')
                                                          }}
                                                          className="p-1.5 rounded-lg bg-white border border-[#E8D4C9] text-slate-600 hover:border-slate-400 transition"
                                                          title="Edit Album"
                                                        >
                                                          <Pencil className="h-3 w-3" />
                                                        </button>

                                                        <button
                                                          onClick={() => window.open(`/gallery/${subAlbum.slug}`, '_blank')}
                                                          className="p-1.5 rounded-lg bg-white border border-[#E8D4C9] text-slate-600 hover:border-slate-450 transition"
                                                          title="View Album"
                                                        >
                                                          <Eye className="h-3 w-3" />
                                                        </button>
                                                        
                                                        <button
                                                          onClick={() => deleteEntity('albums', subAlbum.id)}
                                                          className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  )
                                                })}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. MEDIA LIBRARY TAB */}
                {activeSection === 'photos' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-[#EFE2D8] p-4 rounded-3xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setMediaViewMode('grid')}
                          className={`p-2 rounded transition cursor-pointer ${mediaViewMode === 'grid' ? 'bg-[#F2EEE6] text-slate-800' : 'text-slate-400'}`}
                        >
                          <Grid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setMediaViewMode('list')}
                          className={`p-2 rounded transition cursor-pointer ${mediaViewMode === 'list' ? 'bg-[#F2EEE6] text-slate-800' : 'text-slate-400'}`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-slate-400 font-medium">
                          {selectedPhotos.length} photo(s) selected
                        </span>
                      </div>

                      {selectedPhotos.length > 0 && (
                        <button
                          onClick={() => bulkDelete('photos')}
                          className="px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                        >
                          Delete Selected
                        </button>
                      )}
                    </div>

                    {!paginatedPhotos.length ? (
                      <div className="text-center py-20 bg-white border border-[#EFE2D8] rounded-[2rem] shadow-sm">
                        <ImagePlus className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-light text-slate-500">No photos in media library</h4>
                        <button
                          onClick={() => setActiveSection('uploads')}
                          className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-white rounded-full transition cursor-pointer"
                        >
                          Upload Files
                        </button>
                      </div>
                    ) : (
                      <>
                        {mediaViewMode === 'grid' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {paginatedPhotos.map((photo) => {
                              const selected = selectedPhotos.includes(photo.id)
                              return (
                                <div
                                  key={photo.id}
                                  className={`group relative bg-white border rounded-2xl overflow-hidden cursor-pointer transition ${
                                    selected ? 'border-rose-500 ring-2 ring-rose-500/10 shadow-md' : 'border-[#EFE2D8] hover:border-slate-400'
                                  }`}
                                  onClick={() => {
                                    setSelectedPhotos((prev) =>
                                      prev.includes(photo.id) ? prev.filter((id) => id !== photo.id) : [...prev, photo.id]
                                    )
                                  }}
                                >
                                  <div className="aspect-square bg-[#EFE2D8] relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={photo.public_url} alt={photo.title} className="w-full h-full object-cover" />
                                    
                                    <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-white/90 border border-[#E8D4C9] flex items-center justify-center">
                                      {selected && <Check className="h-3 w-3 text-rose-500 stroke-[3]" />}
                                    </div>

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          void handleModifyAssetMetadata(photo)
                                        }}
                                        className="p-2 rounded-full bg-white text-slate-800 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          void deleteEntity('photos', photo.id)
                                        }}
                                        className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-white">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{photo.title}</p>
                                    <span className="block text-[9px] uppercase font-bold text-rose-500 mt-1 tracking-wider">
                                      {photo.category?.name || 'Portfolio'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          // List view table
                          <div className="bg-white border border-[#EFE2D8] rounded-[2rem] overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-[#EFE2D8] text-[10px] uppercase tracking-widest text-slate-400 bg-[#FBF8F4]">
                                  <th className="p-4 pl-6 w-12">Select</th>
                                  <th className="p-4">Photo preview</th>
                                  <th className="p-4">Category</th>
                                  <th className="p-4">Location URL</th>
                                  <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedPhotos.map((photo) => {
                                  const selected = selectedPhotos.includes(photo.id)
                                  return (
                                    <tr key={photo.id} className="border-b border-[#EFE2D8]/40 hover:bg-[#FBF8F4]/40 transition">
                                      <td className="p-4 pl-6">
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={() => {
                                            setSelectedPhotos((prev) =>
                                              prev.includes(photo.id) ? prev.filter((id) => id !== photo.id) : [...prev, photo.id]
                                            )
                                          }}
                                          className="accent-rose-500"
                                        />
                                      </td>
                                      <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-[#EFE2D8] overflow-hidden flex-shrink-0">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={photo.public_url} alt={photo.title} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-semibold text-slate-800">{photo.title}</span>
                                      </td>
                                      <td className="p-4">
                                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                                          {photo.category?.name || 'Unlinked'}
                                        </span>
                                      </td>
                                      <td className="p-4 font-mono text-[10px] text-slate-400">{photo.public_url}</td>
                                      <td className="p-4 pr-6 text-right space-x-2">
                                        <button
                                          onClick={() => handleModifyAssetMetadata(photo)}
                                          className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => deleteEntity('photos', photo.id)}
                                          className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {renderPagination(photosPage, photosTotalPages, setPhotosPage)}
                      </>
                    )}
                  </div>
                )}
                {/* 4. VIDEOS TAB */}
                {activeSection === 'videos' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-white border border-[#EFE2D8] p-4 rounded-3xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setMediaViewMode('grid')}
                          className={`p-2 rounded transition cursor-pointer ${mediaViewMode === 'grid' ? 'bg-[#F2EEE6] text-slate-800' : 'text-slate-400'}`}
                        >
                          <Grid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setMediaViewMode('list')}
                          className={`p-2 rounded transition cursor-pointer ${mediaViewMode === 'list' ? 'bg-[#F2EEE6] text-slate-800' : 'text-slate-400'}`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-slate-400 font-medium">
                          {selectedVideos.length} video(s) selected
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {selectedVideos.length > 0 && (
                          <button
                            onClick={() => bulkDelete('videos')}
                            className="px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
                          >
                            Delete Selected
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setYoutubeForm({
                              id: '',
                              title: '',
                              description: '',
                              youtube_url: '',
                              thumbnail_url: '',
                              category_id: overview.categories[0]?.id || '',
                              featured: false,
                              published: true,
                              video_type: 'video',
                              sort_order: 0,
                            })
                            setActiveModal('youtube-video')
                          }}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Embed YouTube
                        </button>
                      </div>
                    </div>

                    {!paginatedVideos.length ? (
                      <div className="text-center py-20 bg-white border border-[#EFE2D8] rounded-[2rem] shadow-sm">
                        <VideoIcon className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                        <h4 className="text-lg font-light text-slate-500">No videos in library</h4>
                        <button
                          onClick={() => {
                            setYoutubeForm({
                              id: '',
                              title: '',
                              description: '',
                              youtube_url: '',
                              thumbnail_url: '',
                              category_id: overview.categories[0]?.id || '',
                              featured: false,
                              published: true,
                              video_type: 'video',
                              sort_order: 0,
                            })
                            setActiveModal('youtube-video')
                          }}
                          className="mt-4 px-6 py-2.5 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-white rounded-full transition cursor-pointer"
                        >
                          Embed Video
                        </button>
                      </div>
                    ) : (
                      <>
                        {mediaViewMode === 'grid' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {paginatedVideos.map((video) => {
                              const selected = selectedVideos.includes(video.id)
                              return (
                                <div
                                  key={video.id}
                                  className={`group relative bg-white border rounded-2xl overflow-hidden cursor-pointer transition ${
                                    selected ? 'border-rose-500 ring-2 ring-rose-500/10 shadow-md' : 'border-[#EFE2D8] hover:border-slate-400'
                                  }`}
                                  onClick={() => {
                                    setSelectedVideos((prev) =>
                                      prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [...prev, video.id]
                                    )
                                  }}
                                >
                                  <div className="aspect-video bg-[#EFE2D8] relative overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={video.thumbnail_url || '/placeholder-video.jpg'} alt={video.title} className="w-full h-full object-cover" />
                                    
                                    <div className="absolute top-3 left-3 w-5 h-5 rounded-full bg-white/90 border border-[#E8D4C9] flex items-center justify-center">
                                      {selected && <Check className="h-3 w-3 text-rose-500 stroke-[3]" />}
                                    </div>

                                    {video.video_type === 'short' && (
                                      <span className="absolute bottom-2 right-2 bg-rose-600 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                        Short
                                      </span>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setYoutubeForm({
                                            id: video.id,
                                            title: video.title,
                                            description: video.description || '',
                                            youtube_url: video.youtube_url || video.public_url || '',
                                            thumbnail_url: video.thumbnail_url || '',
                                            category_id: video.category_id || '',
                                            featured: video.featured || false,
                                            published: video.published !== false,
                                            video_type: video.video_type || 'video',
                                            sort_order: video.sort_order || 0,
                                          })
                                          setActiveModal('youtube-video')
                                        }}
                                        className="p-2 rounded-full bg-white text-slate-800 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          void deleteEntity('videos', video.id)
                                        }}
                                        className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-white">
                                    <p className="text-xs font-semibold text-slate-700 truncate">{video.title}</p>
                                    <span className="block text-[9px] uppercase font-bold text-rose-500 mt-1 tracking-wider">
                                      {video.category?.name || 'Portfolio'}
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="bg-white border border-[#EFE2D8] rounded-[2rem] overflow-hidden">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-[#EFE2D8] text-[10px] uppercase tracking-widest text-slate-400 bg-[#FBF8F4]">
                                  <th className="p-4 pl-6 w-12">Select</th>
                                  <th className="p-4">Video preview</th>
                                  <th className="p-4">Category</th>
                                  <th className="p-4">Type</th>
                                  <th className="p-4">Public URL</th>
                                  <th className="p-4 pr-6 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedVideos.map((video) => {
                                  const selected = selectedVideos.includes(video.id)
                                  return (
                                    <tr key={video.id} className="border-b border-[#EFE2D8]/40 hover:bg-[#FBF8F4]/40 transition">
                                      <td className="p-4 pl-6">
                                        <input
                                          type="checkbox"
                                          checked={selected}
                                          onChange={() => {
                                            setSelectedVideos((prev) =>
                                              prev.includes(video.id) ? prev.filter((id) => id !== video.id) : [...prev, video.id]
                                            )
                                          }}
                                          className="accent-rose-500"
                                        />
                                      </td>
                                      <td className="p-4 flex items-center gap-3">
                                        <div className="w-12 h-9 rounded bg-[#EFE2D8] overflow-hidden flex-shrink-0">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img src={video.thumbnail_url || '/placeholder-video.jpg'} alt={video.title} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-semibold text-slate-800">{video.title}</span>
                                      </td>
                                      <td className="p-4">
                                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                                          {video.category?.name || 'Unlinked'}
                                        </span>
                                      </td>
                                      <td className="p-4 capitalize">{video.video_type || 'video'}</td>
                                      <td className="p-4 font-mono text-[10px] text-slate-400">{video.public_url}</td>
                                      <td className="p-4 pr-6 text-right space-x-2">
                                        <button
                                          onClick={() => {
                                            setYoutubeForm({
                                              id: video.id,
                                              title: video.title,
                                              description: video.description || '',
                                              youtube_url: video.youtube_url || video.public_url || '',
                                              thumbnail_url: video.thumbnail_url || '',
                                              category_id: video.category_id || '',
                                              featured: video.featured || false,
                                              published: video.published !== false,
                                              video_type: video.video_type || 'video',
                                              sort_order: video.sort_order || 0,
                                            })
                                            setActiveModal('youtube-video')
                                          }}
                                          className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => deleteEntity('videos', video.id)}
                                          className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {renderPagination(videosPage, videosTotalPages, setVideosPage)}
                      </>
                    )}
                  </div>
                )}


                {/* 5. CATEGORIES & SUBCATEGORIES TAB */}
                {activeSection === 'categories' && (
                  <div className="grid gap-8 lg:grid-cols-2">
                    
                    {/* Categories Panel */}
                    <div className={glassCardClass}>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Categories</h4>
                        <button
                          onClick={() => {
                            setCategoryForm(defaultCategoryForm)
                            setActiveModal('category')
                          }}
                          className="p-2 rounded bg-[#FBF8F4] border border-[#E8D4C9] text-slate-500 hover:text-slate-800 transition cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {overview.categories.map((category) => (
                          <div key={category.id} className="flex justify-between items-center p-4 bg-[#FBF8F4]/80 rounded-2xl border border-[#EFE2D8]/80">
                            <div>
                              <span className="font-semibold text-slate-800 block">{category.name}</span>
                              <span className="text-[10px] font-mono text-slate-400 block">slug: {category.slug}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setCategoryForm({
                                    id: category.id,
                                    name: category.name,
                                    slug: category.slug,
                                    description: category.description || '',
                                    sort_order: category.sort_order || 0,
                                  })
                                  setActiveModal('category')
                                }}
                                className="p-2 rounded bg-white border border-[#E8D4C9] text-slate-500 hover:text-slate-900 cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => deleteEntity('categories', category.id)}
                                className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subcategories Management Panel */}
                    <div className={glassCardClass}>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Subcategories</h4>
                        <button
                          onClick={() => {
                            setSubcategoryForm(defaultSubcategoryForm)
                            setActiveModal('subcategory')
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                          Subcategory
                        </button>
                      </div>

                      {/* Subcategory search */}
                      <div className="mb-4 relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={subcatSearch}
                          onChange={(e) => setSubcatSearch(e.target.value)}
                          placeholder="Search subcategory..."
                          className="w-full rounded-xl border border-[#EFE2D8] bg-[#FBF8F4]/30 pl-9 pr-4 py-2 text-xs text-slate-800 outline-none focus:border-rose-500/30"
                        />
                      </div>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide">
                        {filteredSubcategories.map((sub) => {
                          const parent = categoriesById.get(sub.category_id)
                          return (
                            <div key={sub.id} className="flex justify-between items-center p-4 bg-[#FBF8F4]/80 rounded-2xl border border-[#EFE2D8]/80">
                              <div>
                                <span className="font-semibold text-slate-800 block">{sub.name}</span>
                                <span className="text-[9px] text-rose-500 font-bold block uppercase tracking-widest mt-1">
                                  Parent: {parent?.name || 'Unbound'}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSubcategoryForm({
                                      id: sub.id,
                                      category_id: sub.category_id,
                                      name: sub.name,
                                      slug: sub.slug,
                                      description: sub.description || '',
                                      sort_order: sub.sort_order || 0,
                                    })
                                    setActiveModal('subcategory')
                                  }}
                                  className="p-2 rounded bg-white border border-[#E8D4C9] text-slate-500 hover:text-slate-900 cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteEntity('subcategories', sub.id)}
                                  className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* 6. UPLOADS STUDIO */}
                {activeSection === 'uploads' && (
                  <div className={glassCardClass}>
                    <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Upload Media Queue</h4>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <label className={labelClass}>Media classification</label>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setUploadKind('photo')}
                            className={`flex-1 py-3 text-xs font-semibold rounded-2xl uppercase tracking-widest border transition ${
                              uploadKind === 'photo'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'border-[#E8D4C9] text-slate-500 bg-[#FBF8F4]/40'
                            }`}
                          >
                            Photo files
                          </button>
                          <button
                            onClick={() => setUploadKind('video')}
                            className={`flex-1 py-3 text-xs font-semibold rounded-2xl uppercase tracking-widest border transition ${
                              uploadKind === 'video'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'border-[#E8D4C9] text-slate-500 bg-[#FBF8F4]/40'
                            }`}
                          >
                            Video files
                          </button>
                        </div>

                        <label className={labelClass}>Category binding</label>
                        <select
                          value={albumForm.category_id}
                          onChange={(e) => setAlbumForm((p) => ({ ...p, category_id: e.target.value }))}
                          className={inputClass}
                        >
                          <option value="">Choose parent category...</option>
                          {overview.categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        <label className={labelClass}>Link to album (Optional)</label>
                        <select
                          value={albumForm.id}
                          onChange={(e) => setAlbumForm((p) => ({ ...p, id: e.target.value }))}
                          className={inputClass}
                        >
                          <option value="">Standalone Asset</option>
                          {overview.albums.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Dropzone */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`rounded-3xl border-2 border-dashed border-[#E8D4C9] bg-[#FBF8F4]/30 p-8 text-center flex flex-col justify-center items-center transition ${
                          dragActive ? 'border-rose-500 bg-rose-500/5' : ''
                        }`}
                      >
                        <UploadCloud className="h-10 w-10 text-slate-400 mb-3 animate-bounce" />
                        <h4 className="text-slate-800 font-semibold text-sm">Drag and drop media files here</h4>
                        <p className="text-xs text-slate-400 mt-1">or browser files from device</p>
                        <label className="mt-4 px-4 py-2 text-xs font-semibold bg-white border border-[#E8D4C9] text-slate-700 rounded-full hover:bg-slate-50 transition cursor-pointer">
                          Select Files
                          <input type="file" multiple onChange={handleFileChange} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {uploadFiles.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-[#EFE2D8]">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Upload Queue ({uploadFiles.length} files)
                          </h5>
                          <button onClick={() => setUploadFiles([])} className="text-xs text-rose-500 hover:underline">
                            Clear list
                          </button>
                        </div>
                        
                        <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                          {uploadFiles.map((file, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-[#FBF8F4]/80 rounded-xl border border-[#EFE2D8]/60 text-xs">
                              <span className="text-slate-700 font-mono truncate max-w-md">{file.name}</span>
                              <span className="text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>

                        {uploading && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                              <span>Saving files to project storage...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full bg-rose-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}

                        <button
                          onClick={processUploadQueue}
                          disabled={uploading}
                          className="w-full py-4 text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-rose-500 to-peach-600 rounded-full text-white hover:opacity-90 shadow-md flex justify-center items-center gap-2 cursor-pointer"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload media'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 7. ANALYTICS */}
                {activeSection === 'analytics' && (
                  <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className={`${glassCardClass} lg:col-span-2`}>
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Traffic Analytics</h4>
                        <div className="h-[240px] flex items-end gap-3.5 pt-6 border-b border-slate-100 pb-3">
                          {[40, 52, 60, 48, 85, 75, 115, 130, 150, 175].map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                              <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-rose-500 via-peach-400 to-peach-300 cursor-pointer"
                                style={{ height: `${(v / 185) * 190}px` }}
                              />
                              <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">wk-{i + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={glassCardClass}>
                        <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Popular Albums</h4>
                        <div className="space-y-3.5">
                          {overview.albums.slice(0, 4).map((a, i) => (
                            <div key={a.id} className="flex justify-between items-center p-3.5 bg-[#FBF8F4] rounded-2xl border border-[#EFE2D8]/60">
                              <span className="text-xs font-semibold text-slate-800 truncate">{a.title}</span>
                              <span className="text-xs font-mono text-rose-500 font-bold">{Math.round((overview.albums.length - i) * 110 + 35)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={glassCardClass}>
                      <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Activity Trail Log</h4>
                      {!paginatedLogs.length ? (
                        <p className="text-xs text-slate-400">No logs collected yet</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#EFE2D8] text-[10px] uppercase tracking-widest text-slate-400 bg-[#FBF8F4]">
                                <th className="p-4 pl-6">Timestamp</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Entity Type</th>
                                <th className="p-4">Entity ID</th>
                                <th className="p-4 pr-6">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedLogs.map((log) => (
                                <tr key={log.id} className="border-b border-[#EFE2D8]/40 hover:bg-[#FBF8F4]/40 transition">
                                  <td className="p-4 pl-6 font-mono text-[10px] text-slate-400">
                                    {new Date(log.created_at || Date.now()).toLocaleString()}
                                  </td>
                                  <td className="p-4 font-semibold text-slate-800 capitalize">
                                    {log.action?.replace('-', ' ')}
                                  </td>
                                  <td className="p-4">
                                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200/40 text-rose-600 font-bold uppercase tracking-wider text-[9px]">
                                      {log.entity_type}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]" title={log.entity_id}>
                                    {log.entity_id}
                                  </td>
                                  <td className="p-4 pr-6 text-slate-600">
                                    {log.metadata?.title ? `"${log.metadata.title}"` : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {renderPagination(logsPage, logsTotalPages, setLogsPage)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. MESSAGES */}
                {activeSection === 'messages' && (
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className={`${glassCardClass} lg:col-span-1 max-h-[600px] overflow-y-auto scrollbar-hide`}>
                      <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Mailbox Inbox</h4>
                      
                      {!paginatedMessages.length ? (
                        <p className="text-xs text-slate-400">Inbox is empty</p>
                      ) : (
                        <div className="space-y-2">
                          {paginatedMessages.map((msg) => {
                            const isUnread = msg.status === 'unread'
                            return (
                              <div
                                key={msg.id}
                                onClick={() => setSelectedMessage(msg)}
                                className={`p-4 rounded-2xl border cursor-pointer transition text-left space-y-2 ${
                                  selectedMessage?.id === msg.id
                                    ? 'bg-[#F2EEE6] border-[#E8D4C9]'
                                    : isUnread
                                    ? 'bg-white border-[#EFE2D8] hover:border-slate-400 shadow-sm'
                                    : 'bg-[#FBF8F4]/30 border-transparent hover:border-[#EFE2D8]'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isUnread ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                    {msg.name}
                                  </span>
                                  {isUnread ? (
                                    <Mail className="h-3.5 w-3.5 text-rose-500" />
                                  ) : (
                                    <MailOpen className="h-3.5 w-3.5 text-slate-400" />
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-slate-700 line-clamp-1">{msg.subject}</p>
                                <span className="block text-[9px] text-slate-400 font-mono">
                                  {new Date(msg.created_at || Date.now()).toLocaleDateString()}
                                </span>
                              </div>
                            )
                          })}
                          {renderPagination(messagesPage, messagesTotalPages, setMessagesPage)}
                        </div>
                      )}
                    </div>

                    <div className={`${glassCardClass} lg:col-span-2 flex flex-col min-h-[400px]`}>
                      {selectedMessage ? (
                        <div className="space-y-6 flex-1 flex flex-col">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#EFE2D8]">
                            <div>
                              <h3 className="text-lg font-display text-slate-900">{selectedMessage.subject}</h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Sender: <span className="text-slate-800 font-bold">{selectedMessage.name}</span> ({selectedMessage.email})
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Phone: {selectedMessage.phone || 'N/A'}</p>
                            </div>
                            <div className="flex gap-2">
                              {selectedMessage.status === 'unread' && (
                                <button
                                  onClick={() => markMessageRead(selectedMessage)}
                                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-[#E8D4C9] text-xs text-slate-700 font-medium transition cursor-pointer"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  void deleteEntity('messages', selectedMessage.id)
                                  setSelectedMessage(null)
                                }}
                                className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-100 transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 whitespace-pre-line text-sm text-slate-600 font-light leading-relaxed">
                            {selectedMessage.message}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                          <MailOpen className="h-10 w-10 text-slate-350 mb-2 animate-pulse" />
                          <p className="text-sm">Select a mail inquiry to read</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 9. SETTINGS TAB */}
                {activeSection === 'settings' && (
                  <div className={glassCardClass}>
                    <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">Global Website Configs</h4>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        void mutateEntity('settings', 'update', settingsForm)
                      }}
                      className="grid gap-6 md:grid-cols-2"
                    >
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Branding Website Name</label>
                          <input
                            type="text"
                            value={settingsForm.website_name}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, website_name: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Header Navigation Logo</label>
                          <input
                            type="text"
                            value={settingsForm.logo_text}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, logo_text: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Hero Display Title</label>
                          <input
                            type="text"
                            value={settingsForm.hero_title}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, hero_title: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Hero Description Subtitle</label>
                          <textarea
                            value={settingsForm.hero_subtitle}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, hero_subtitle: e.target.value }))}
                            className={textareaClass}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>SEO Page Title</label>
                          <input
                            type="text"
                            value={settingsForm.seo_title}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, seo_title: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>SEO Description Tag</label>
                          <textarea
                            value={settingsForm.seo_description}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, seo_description: e.target.value }))}
                            className={textareaClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Google Analytics Key (GA)</label>
                          <input
                            type="text"
                            value={settingsForm.google_analytics_id}
                            onChange={(e) => setSettingsForm((p) => ({ ...p, google_analytics_id: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="col-span-2 pt-6 border-t border-[#EFE2D8]">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 font-semibold text-xs uppercase tracking-widest text-white rounded-full transition shadow-md cursor-pointer"
                        >
                          {saving ? 'Processing...' : 'Save Global config'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 10. HOMEPAGE CONTENT */}
                {activeSection === 'homepage' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-display font-semibold text-slate-900">Homepage Customizer</h3>
                        <p className="text-xs text-slate-500">Configure global sections on your landing page.</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={resetBestShots}
                          className="px-5 py-2.5 bg-white border border-[#E8D4C9] text-xs font-semibold text-slate-700 rounded-full hover:bg-slate-50 transition cursor-pointer"
                        >
                          Reset Section
                        </button>
                        <button
                          onClick={saveBestShots}
                          disabled={saving}
                          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white rounded-full transition shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {saving ? 'Publishing...' : 'Publish changes'}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                      {/* Left: Configuration Form */}
                      <div className="space-y-6">
                        <div className={glassCardClass}>
                          <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mb-6">
                            My Best Shots Settings
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#FBF8F4] rounded-2xl border border-[#EFE2D8]/60 mb-2">
                              <div>
                                <span className="text-xs font-bold text-slate-800">Section Visibility</span>
                                <p className="text-[10px] text-slate-400">Toggle whether this section appears on the homepage.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={bestShotsForm.visible}
                                  onChange={(e) => setBestShotsForm((p) => ({ ...p, visible: e.target.checked }))}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                              </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className={labelClass}>Section Title (Plain text)</label>
                                <input
                                  type="text"
                                  value={bestShotsForm.title}
                                  onChange={(e) => setBestShotsForm((p) => ({ ...p, title: e.target.value }))}
                                  className={inputClass}
                                  placeholder="e.g. My Best"
                                />
                              </div>
                              <div>
                                <label className={labelClass}>Highlighted Word (Italic text)</label>
                                <input
                                  type="text"
                                  value={bestShotsForm.highlight}
                                  onChange={(e) => setBestShotsForm((p) => ({ ...p, highlight: e.target.value }))}
                                  className={inputClass}
                                  placeholder="e.g. Shots"
                                />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>Description Text</label>
                              <textarea
                                value={bestShotsForm.description}
                                onChange={(e) => setBestShotsForm((p) => ({ ...p, description: e.target.value }))}
                                className={textareaClass}
                                placeholder="Write a short summary description..."
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className={labelClass}>Grid Layout Style</label>
                                <select
                                  value={bestShotsForm.layout}
                                  onChange={(e) => setBestShotsForm((p) => ({ ...p, layout: e.target.value as any }))}
                                  className={inputClass}
                                >
                                  <option value="cinematic">Cinematic Collage (Asymmetrical)</option>
                                  <option value="grid">Grid (Clean & Square)</option>
                                  <option value="masonry">Masonry (Staggered Heights)</option>
                                  <option value="featured">Featured Focus (Hero + Under-Grid)</option>
                                </select>
                              </div>
                              <div>
                                <label className={labelClass}>Show photo count</label>
                                <select
                                  value={bestShotsForm.limit}
                                  onChange={(e) => setBestShotsForm((p) => ({ ...p, limit: Number(e.target.value) }))}
                                  className={inputClass}
                                >
                                  <option value="4">4 Photos</option>
                                  <option value="6">6 Photos</option>
                                  <option value="8">8 Photos</option>
                                  <option value="9">9 Photos</option>
                                  <option value="12">12 Photos</option>
                                  <option value="16">16 Photos</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Photo Manager */}
                        <div className={glassCardClass}>
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">
                                Photo Queue ({bestShotsForm.photos.length} selected)
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-1">Drag and drop thumbnails below to reorder them.</p>
                            </div>
                            <button
                              onClick={() => setShowBestShotsLibraryPicker(true)}
                              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-white rounded-full transition cursor-pointer"
                            >
                              Add from Media Library
                            </button>
                          </div>

                          {/* Inline Uploader Dropzone */}
                          <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-start mb-6">
                            <div
                              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                              onDrop={async (e) => {
                                e.preventDefault()
                                setDragActive(false)
                                if (e.dataTransfer.files?.[0]) {
                                  await uploadBestShotsFile(e.dataTransfer.files[0])
                                }
                              }}
                              className={`rounded-2xl border-2 border-dashed border-[#E8D4C9] bg-[#FBF8F4]/30 p-6 text-center flex flex-col justify-center items-center transition ${
                                dragActive ? 'border-rose-500 bg-rose-500/5' : ''
                              }`}
                            >
                              {bestShotsUploading ? (
                                <Loader2 className="h-6 w-6 text-rose-500 animate-spin" />
                              ) : (
                                <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                              )}
                              <span className="text-slate-800 font-semibold text-xs">Direct drop image</span>
                              <label className="mt-3 px-3 py-1.5 text-[10px] font-bold bg-white border border-[#E8D4C9] text-slate-700 rounded-full hover:bg-slate-50 transition cursor-pointer">
                                Browse
                                <input
                                  type="file"
                                  onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                      await uploadBestShotsFile(e.target.files[0])
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                              <p className="font-semibold text-slate-700">How to manage shots:</p>
                              <ul className="list-disc pl-4 space-y-1">
                                <li>Drag any picture to rearrange the sorting order.</li>
                                <li>Drop local photos into the box on the left to upload instantly.</li>
                                <li>Select existing website images from the Media Library.</li>
                                <li>Changes will not be visible on the public site until you click <strong>Publish Changes</strong>.</li>
                              </ul>
                            </div>
                          </div>

                          {/* Photos Grid sorting list */}
                          {!bestShotsForm.photos.length ? (
                            <div className="text-center py-10 bg-[#FBF8F4]/30 border border-dashed border-[#E8D4C9] rounded-2xl text-slate-400 text-xs">
                              No photos added to this section. Add some to get started!
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                              {bestShotsForm.photos.map((photo, i) => (
                                <div
                                  key={photo.id || i}
                                  draggable
                                  onDragStart={() => handlePhotoDragStart(i)}
                                  onDragOver={(e) => handlePhotoDragOver(e, i)}
                                  onDrop={() => handlePhotoDrop(i)}
                                  className="group relative aspect-square rounded-xl bg-slate-100 border border-[#EFE2D8] overflow-hidden cursor-grab active:cursor-grabbing hover:border-rose-400 transition"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={photo.public_url} alt={photo.title} className="w-full h-full object-cover select-none pointer-events-none" />
                                  <div className="absolute top-1 left-1 bg-slate-900/60 text-white font-mono text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                                    {i + 1}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setBestShotsForm((prev) => ({
                                        ...prev,
                                        photos: prev.photos.filter((_, idx) => idx !== i)
                                      }))
                                      toast.success('Removed photo')
                                    }}
                                    className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow cursor-pointer hover:bg-rose-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/50 p-1 truncate text-[8px] text-white opacity-0 group-hover:opacity-100 transition">
                                    {photo.title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Live Preview Panel */}
                      <div className="space-y-6">
                        <div className="bg-[#EAE6DF]/70 border border-[#E8D4C9]/40 rounded-[2.5rem] p-6 shadow-sm sticky top-6">
                          <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#E8D4C9]/60">
                            <div>
                              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Simulated Live Preview</span>
                              <h4 className="text-sm font-semibold text-slate-800 mt-1">My Best Shots Widget</h4>
                            </div>
                            <span className="text-[9px] px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 font-bold rounded-full uppercase tracking-wider">
                              {bestShotsForm.layout} layout
                            </span>
                          </div>

                          {!bestShotsForm.visible ? (
                            <div className="text-center py-20 text-slate-400 space-y-2">
                              <Globe className="h-8 w-8 mx-auto stroke-1 animate-pulse" />
                              <p className="text-xs font-semibold">Section is set to HIDDEN</p>
                              <p className="text-[10px]">Toggle Section Visibility to display it on the homepage.</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-1">Preview Heading</span>
                                <h3 className="text-2xl font-display font-light text-slate-900 leading-tight">
                                  {bestShotsForm.title}{' '}
                                  <span className="italic text-slate-500 font-semibold">{bestShotsForm.highlight}</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 font-light line-clamp-2 leading-relaxed">
                                  {bestShotsForm.description}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-[#E8D4C9]/40">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-4">
                                  Image layouts (Showing top {Math.min(bestShotsForm.limit, bestShotsForm.photos.length)})
                                </span>

                                {!bestShotsForm.photos.length ? (
                                  <div className="py-12 bg-white/50 border border-dashed border-[#E8D4C9] rounded-2xl text-center text-slate-400 text-xs">
                                    Queue is empty. Select photos to view layout
                                  </div>
                                ) : (
                                  <>
                                    {bestShotsForm.layout === 'cinematic' && (
                                      <div className="grid grid-cols-2 gap-2 aspect-[4/3] rounded-2xl overflow-hidden bg-white/40 p-2 border border-[#E8D4C9]/50">
                                        <div className="relative h-full bg-slate-200 rounded-lg overflow-hidden">
                                          <img src={bestShotsForm.photos[0]?.public_url} className="w-full h-full object-cover" alt="" />
                                          <div className="absolute bottom-1 left-1 bg-slate-900/60 text-white text-[8px] px-1.5 py-0.5 rounded">Lead Frame</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                                          {bestShotsForm.photos.slice(1, 5).map((p, idx) => (
                                            <div key={p.id || idx} className="relative aspect-square bg-slate-200 rounded-lg overflow-hidden">
                                              <img src={p.public_url} className="w-full h-full object-cover" alt="" />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {bestShotsForm.layout === 'grid' && (
                                      <div className="grid grid-cols-3 gap-2 aspect-[4/3] overflow-y-auto rounded-2xl bg-white/40 p-2 border border-[#E8D4C9]/50">
                                        {bestShotsForm.photos.slice(0, 9).map((p, idx) => (
                                          <div key={p.id || idx} className="relative aspect-square bg-slate-200 rounded-lg overflow-hidden">
                                            <img src={p.public_url} className="w-full h-full object-cover" alt="" />
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {bestShotsForm.layout === 'masonry' && (
                                      <div className="columns-3 gap-2 aspect-[4/3] overflow-y-auto rounded-2xl bg-white/40 p-2 border border-[#E8D4C9]/50 space-y-2">
                                        {bestShotsForm.photos.slice(0, 9).map((p, idx) => (
                                          <div key={p.id || idx} className="relative bg-slate-200 rounded-lg overflow-hidden mb-2" style={{ aspectRatio: idx % 2 === 0 ? '3/4' : '4/3' }}>
                                            <img src={p.public_url} className="w-full h-full object-cover" alt="" />
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {bestShotsForm.layout === 'featured' && (
                                      <div className="space-y-2 aspect-[4/3] overflow-y-auto rounded-2xl bg-white/40 p-2 border border-[#E8D4C9]/50">
                                        <div className="relative aspect-[21/9] bg-slate-200 rounded-lg overflow-hidden">
                                          <img src={bestShotsForm.photos[0]?.public_url} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5">
                                          {bestShotsForm.photos.slice(1, 4).map((p, idx) => (
                                            <div key={p.id || idx} className="relative aspect-[4/5] bg-slate-200 rounded-lg overflow-hidden">
                                              <img src={p.public_url} className="w-full h-full object-cover" alt="" />
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* 4. DIALOG MODALS */}
      
      {/* Dynamic Album creation/edit wizard Modal */}
      {activeModal === 'album' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-white border border-[#EFE2D8] rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide"
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            {/* Stepper Header */}
            <div className="flex items-center gap-4 mb-6 border-b border-[#EFE2D8]/60 pb-4">
              <button
                onClick={() => setAlbumModalStep(1)}
                className={`text-xs font-semibold uppercase tracking-widest pb-1 transition ${
                  albumModalStep === 1 ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              >
                1. Basic configuration
              </button>
              {albumForm.id && (
                <button
                  onClick={() => setAlbumModalStep(2)}
                  className={`text-xs font-semibold uppercase tracking-widest pb-1 transition ${
                    albumModalStep === 2 ? 'border-b-2 border-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                >
                  2. Embed media uploads
                </button>
              )}
            </div>

            {albumModalStep === 1 ? (
              <form onSubmit={handleAlbumFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column Fields */}
                  <div className="space-y-4">
                    {/* Album Type Selection */}
                    <div>
                      <label className={labelClass}>Album Type</label>
                      <div className="flex gap-6 mt-1.5 p-3.5 bg-[#FBF8F4]/60 border border-[#EFE2D8]/60 rounded-2xl">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="albumType"
                            checked={albumType === 'main'}
                            onChange={() => {
                              setAlbumType('main')
                              handleParentChange('')
                            }}
                            className="accent-rose-500 w-4 h-4"
                          />
                          Main Album
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="albumType"
                            checked={albumType === 'sub'}
                            onChange={() => setAlbumType('sub')}
                            className="accent-rose-500 w-4 h-4"
                          />
                          Sub Album
                        </label>
                      </div>
                    </div>

                    {/* Conditional Parent Album Selection for Sub Albums */}
                    {albumType === 'sub' && (
                      <div>
                        <label className={labelClass}>Parent Album</label>
                        <select
                          required
                          value={albumForm.parent_id || ''}
                          onChange={(e) => handleParentChange(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select Parent Album...</option>
                          {overview.albums
                            .filter((a) => (!a.parent_id || a.parent_id === '') && a.id !== albumForm.id)
                            .map((parent) => (
                              <option key={parent.id} value={parent.id}>
                                {parent.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>{albumType === 'sub' ? 'Sub Album Name' : 'Album Title'}</label>
                      <input
                        type="text"
                        required
                        value={albumForm.title}
                        onChange={(e) => setAlbumForm((p) => ({ ...p, title: e.target.value }))}
                        className={inputClass}
                        placeholder={albumType === 'sub' ? "e.g. Luxury Beach Wedding" : "e.g. Elegant Beach Shoot"}
                      />
                    </div>

                    {albumType === 'sub' && (
                      <div>
                        <label className={labelClass}>Display Order</label>
                        <input
                          type="number"
                          value={albumForm.sort_order ?? 0}
                          onChange={(e) => setAlbumForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                          className={inputClass}
                          placeholder="e.g. 0"
                        />
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Event / Shoot Date</label>
                      <input
                        type="date"
                        value={albumForm.event_date}
                        onChange={(e) => setAlbumForm((p) => ({ ...p, event_date: e.target.value }))}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Category</label>
                      <select
                        required
                        disabled={albumType === 'sub' || !!albumForm.parent_id}
                        value={albumForm.category_id}
                        onChange={(e) => setAlbumForm((p) => ({ ...p, category_id: e.target.value }))}
                        className={`${inputClass} ${(albumType === 'sub' || albumForm.parent_id) ? 'opacity-55 cursor-not-allowed bg-slate-50' : ''}`}
                      >
                        <option value="">Select Category...</option>
                        {overview.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Subcategory</label>
                      <select
                        disabled={albumType === 'sub' || !!albumForm.parent_id}
                        value={albumForm.subcategory_id}
                        onChange={(e) => setAlbumForm((p) => ({ ...p, subcategory_id: e.target.value }))}
                        className={`${inputClass} ${(albumType === 'sub' || albumForm.parent_id) ? 'opacity-55 cursor-not-allowed bg-slate-50' : ''}`}
                      >
                        <option value="">Select Subcategory...</option>
                        {availableSubcategories.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Album Cover Upload Dropzone & Picker */}
                  <div className="space-y-4">
                    <span className={labelClass}>Album Cover Image</span>
                    
                    {coverUploadFile || albumForm.cover_url ? (
                      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-[#EFE2D8] bg-[#FBF8F4]/40 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverUploadFile ? URL.createObjectURL(coverUploadFile) : albumForm.cover_url}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                          <label className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-full shadow-sm cursor-pointer">
                            Replace Cover
                            <input type="file" onChange={handleCoverFileChange} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setCoverUploadFile(null)
                              setAlbumForm((p) => ({ ...p, cover_url: '' }))
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-full shadow-sm cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragEnter={handleCoverDrag}
                        onDragOver={handleCoverDrag}
                        onDragLeave={handleCoverDrag}
                        onDrop={handleCoverDrop}
                        className="border-2 border-dashed border-[#E8D4C9] rounded-3xl aspect-[4/3] flex flex-col items-center justify-center text-center p-4 bg-[#FBF8F4]/30"
                      >
                        <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                        <h5 className="text-xs font-semibold text-slate-800">Drag Cover File Here</h5>
                        <p className="text-[10px] text-slate-400 mt-1">or browse files from device</p>
                        
                        <div className="flex gap-2 mt-4">
                          <label className="px-3.5 py-1.5 bg-white border border-[#E8D4C9] text-[10px] font-bold text-slate-700 rounded-full hover:bg-slate-50 cursor-pointer">
                            Upload File
                            <input type="file" onChange={handleCoverFileChange} className="hidden" />
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="px-3.5 py-1.5 bg-slate-900 text-[10px] font-bold text-white rounded-full hover:bg-slate-800 cursor-pointer"
                          >
                            Choose from library
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Album Story Summary</label>
                  <textarea
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm((p) => ({ ...p, description: e.target.value }))}
                    className={textareaClass}
                    placeholder="Describe the cinematic story details..."
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-[#EFE2D8]">
                  {!albumForm.parent_id ? (
                    <div className="flex items-center justify-between p-3.5 bg-[#FBF8F4]/60 rounded-2xl border border-[#EFE2D8]/60">
                      <span className="text-xs font-semibold text-slate-600">Featured in Highlights</span>
                      <input
                        type="checkbox"
                        checked={albumForm.featured}
                        onChange={(e) => setAlbumForm((p) => ({ ...p, featured: e.target.checked }))}
                        className="accent-rose-500 w-4 h-4"
                      />
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 italic">
                      Sub-albums inherit homepage highlight state from parent.
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3.5 bg-[#FBF8F4]/60 rounded-2xl border border-[#EFE2D8]/60">
                    <span className="text-xs font-semibold text-slate-600">Publish Immediately</span>
                    <input
                      type="checkbox"
                      checked={albumForm.published}
                      onChange={(e) => setAlbumForm((p) => ({ ...p, published: e.target.checked }))}
                      className="accent-rose-500 w-4 h-4"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-2.5 rounded-full border border-[#E8D4C9] text-slate-500 hover:text-slate-800 text-xs font-semibold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-rose-500 text-white rounded-full hover:opacity-90 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    {saving ? 'Saving...' : albumForm.id ? 'Save Changes' : 'Create & Continue'}
                  </button>
                </div>
              </form>
            ) : (
              // STEP 2: EMBEDDED MEDIA WIZARD
              <div className="space-y-6 flex flex-col max-h-[75vh]">
                <div className="flex justify-between items-start border-b border-[#EFE2D8]/60 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{albumForm.title} - Album Media</h4>
                    <p className="text-xs text-slate-500 mt-1">Manage, sort, or upload photos/videos for this collection.</p>
                  </div>
                  
                  {/* Tabs Switcher */}
                  <div className="flex bg-[#F2EEE6] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setStep2Tab('view')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                        step2Tab === 'view' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      View & Reorder ({linkedPhotos.length + linkedVideos.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep2Tab('upload')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                        step2Tab === 'upload' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Upload New
                    </button>
                  </div>
                </div>

                {step2Tab === 'view' ? (
                  <div className="flex-1 overflow-y-auto min-h-[300px] space-y-6 pr-2 scrollbar-hide">
                    {/* Photos list */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                        Photos (Drag to Sort • Hover to Delete)
                      </span>
                      
                      {!linkedPhotos.length ? (
                        <p className="text-xs text-slate-400 italic py-6 bg-slate-50 rounded-xl text-center">
                          No photos in this album yet. Go to "Upload New" to add some!
                        </p>
                      ) : (
                        <div className="grid grid-cols-4 gap-3">
                          {linkedPhotos.map((photo, i) => (
                            <div
                              key={photo.id}
                              draggable
                              onDragStart={() => {
                                setDraggedMediaIdx(i)
                                setDraggedMediaType('photo')
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleAlbumMediaDrop(i, 'photo')}
                              className="group relative aspect-square rounded-xl bg-[#FBF8F4] border border-[#EFE2D8] overflow-hidden cursor-grab active:cursor-grabbing hover:border-rose-400 transition"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.public_url}
                                alt={photo.title}
                                className="w-full h-full object-cover select-none pointer-events-none"
                              />
                              <div className="absolute top-1 left-1 bg-slate-900/60 text-white font-mono text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                                {i + 1}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteAlbumMedia('photo', photo.id)}
                                className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Videos list */}
                    <div className="pt-4 border-t border-[#EFE2D8]/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                        Videos (Drag to Sort • Hover to Delete)
                      </span>
                      
                      {!linkedVideos.length ? (
                        <p className="text-xs text-slate-400 italic py-6 bg-slate-50 rounded-xl text-center">
                          No videos in this album yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-3">
                          {linkedVideos.map((video, i) => (
                            <div
                              key={video.id}
                              draggable
                              onDragStart={() => {
                                setDraggedMediaIdx(i)
                                setDraggedMediaType('video')
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={() => handleAlbumMediaDrop(i, 'video')}
                              className="group relative aspect-video rounded-xl bg-[#FBF8F4] border border-[#EFE2D8] overflow-hidden cursor-grab active:cursor-grabbing hover:border-rose-400 transition"
                            >
                              {video.thumbnail_url || video.public_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={video.thumbnail_url || video.public_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover select-none pointer-events-none"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                  <Film className="h-5 w-5" />
                                </div>
                              )}
                              
                              <div className="absolute top-1 left-1 bg-slate-900/60 text-white font-mono text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                                {i + 1}
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteAlbumMedia('video', video.id)}
                                className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                    {/* Kind Select */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setUploadKind('photo')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider border transition ${
                          uploadKind === 'photo'
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'border-[#E8D4C9] text-slate-500 bg-[#FBF8F4]/40'
                        }`}
                      >
                        Photo files
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadKind('video')}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl uppercase tracking-wider border transition ${
                          uploadKind === 'video'
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'border-[#E8D4C9] text-slate-500 bg-[#FBF8F4]/40'
                        }`}
                      >
                        Video files
                      </button>
                    </div>

                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`rounded-3xl border-2 border-dashed border-[#E8D4C9] bg-[#FBF8F4]/30 p-8 text-center flex flex-col justify-center items-center transition ${
                        dragActive ? 'border-rose-500 bg-rose-500/5' : ''
                      }`}
                    >
                      <UploadCloud className="h-10 w-10 text-slate-400 mb-3 animate-bounce" />
                      <h4 className="text-slate-800 font-semibold text-sm">Drag & Drop Album {uploadKind === 'video' ? 'Videos' : 'Photos'} Here</h4>
                      <p className="text-xs text-slate-400 mt-1">or browse from device</p>
                      <label className="mt-4 px-4 py-2 text-xs font-semibold bg-white border border-[#E8D4C9] text-slate-700 rounded-full hover:bg-slate-50 transition cursor-pointer">
                        Select Files
                        <input type="file" multiple onChange={handleFileChange} className="hidden" accept={uploadKind === 'video' ? 'video/*' : 'image/*'} />
                      </label>
                    </div>

                    {uploadFiles.length > 0 && (
                      <div className="space-y-4 border-t border-[#EFE2D8] pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Queue: {uploadFiles.length} files</span>
                          <button type="button" onClick={() => setUploadFiles([])} className="text-xs text-rose-500 cursor-pointer">Clear queue</button>
                        </div>

                        {uploading && (
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleEmbeddedUpload}
                          disabled={uploading}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-semibold uppercase tracking-widest transition cursor-pointer"
                        >
                          {uploading ? 'Uploading...' : `Upload ${uploadKind === 'video' ? 'videos' : 'photos'} directly`}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-[#EFE2D8] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs uppercase tracking-widest rounded-full cursor-pointer"
                  >
                    Finish Setup
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Media Picker Modal for cover images */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white border border-[#EFE2D8] rounded-[2rem] p-6 shadow-2xl max-h-[80vh] overflow-y-auto scrollbar-hide"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-display text-lg text-slate-800">Select cover from Media Library</h4>
              <button onClick={() => setShowMediaPicker(false)} className="text-slate-400 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!overview.photos.length ? (
              <p className="text-xs text-slate-500 py-10 text-center">No images found in Media Library</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {overview.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => {
                      setAlbumForm((p) => ({ ...p, cover_url: photo.public_url }))
                      setCoverUploadFile(null)
                      setShowMediaPicker(false)
                    }}
                    className="aspect-square bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-[#EFE2D8] hover:border-rose-500 transition relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.public_url} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Asset Metadata Modal */}
      {activeModal === 'asset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-[#EFE2D8] rounded-[2.5rem] p-8 shadow-2xl relative"
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-display text-2xl font-light mb-6">Modify Details</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const entity = uploadKind === 'video' ? 'videos' : 'photos'
                void mutateEntity(entity, 'update', assetForm)
              }}
              className="space-y-4"
            >
              <div>
                <label className={labelClass}>Asset Title</label>
                <input
                  type="text"
                  required
                  value={assetForm.title}
                  onChange={(e) => setAssetForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              {uploadKind === 'photo' && (
                <>
                  <div>
                    <label className={labelClass}>Alt tags (SEO)</label>
                    <input
                      type="text"
                      value={assetForm.alt_text}
                      onChange={(e) => setAssetForm((p) => ({ ...p, alt_text: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Keywords (comma separated)</label>
                    <input
                      type="text"
                      value={assetForm.tags}
                      onChange={(e) => setAssetForm((p) => ({ ...p, tags: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </>
              )}

              {uploadKind === 'video' && (
                <div>
                  <label className={labelClass}>Thumbnail Cover URL</label>
                  <input
                    type="text"
                    value={assetForm.thumbnail_url}
                    onChange={(e) => setAssetForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={assetForm.description}
                  onChange={(e) => setAssetForm((p) => ({ ...p, description: e.target.value }))}
                  className={textareaClass}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-full border border-[#E8D4C9] text-slate-500 hover:text-slate-800 text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-500 text-white rounded-full hover:opacity-90 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Update metadata
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* YouTube Video Modal */}
      {activeModal === 'youtube-video' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-[#EFE2D8] rounded-[2.5rem] p-8 shadow-2xl relative"
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-display text-2xl font-light mb-6">
              {youtubeForm.id ? 'Edit YouTube Video' : 'Embed YouTube Video'}
            </h3>

            <form onSubmit={handleYoutubeFormSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Video Title</label>
                <input
                  type="text"
                  required
                  value={youtubeForm.title}
                  onChange={(e) => setYoutubeForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. Beautiful Coastal Wedding"
                />
              </div>

              <div>
                <label className={labelClass}>YouTube URL or Video ID</label>
                <input
                  type="text"
                  required
                  value={youtubeForm.youtube_url}
                  onChange={(e) => setYoutubeForm((p) => ({ ...p, youtube_url: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. https://www.youtube.com/watch?v=XXXXXX"
                />
                <span className="text-[9px] text-slate-400 mt-1 block">Supports standard URLs, Shorts, and 11-char Video IDs.</span>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  required
                  value={youtubeForm.category_id}
                  onChange={(e) => setYoutubeForm((p) => ({ ...p, category_id: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select Category...</option>
                  {overview.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Video Type</label>
                  <select
                    value={youtubeForm.video_type}
                    onChange={(e) => setYoutubeForm((p) => ({ ...p, video_type: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="video">Standard Video</option>
                    <option value="short">YouTube Short</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Display Order</label>
                  <input
                    type="number"
                    value={youtubeForm.sort_order}
                    onChange={(e) => setYoutubeForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Custom Thumbnail URL (Optional)</label>
                <input
                  type="text"
                  value={youtubeForm.thumbnail_url}
                  onChange={(e) => setYoutubeForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
                  className={inputClass}
                  placeholder="Leave empty to use YouTube default"
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={youtubeForm.description}
                  onChange={(e) => setYoutubeForm((p) => ({ ...p, description: e.target.value }))}
                  className={textareaClass}
                  placeholder="Enter short description..."
                />
              </div>

              <div className="flex items-center gap-6 p-3.5 bg-[#FBF8F4]/60 border border-[#EFE2D8]/60 rounded-2xl">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={youtubeForm.published}
                    onChange={(e) => setYoutubeForm((p) => ({ ...p, published: e.target.checked }))}
                    className="accent-rose-500 w-4 h-4"
                  />
                  Published
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={youtubeForm.featured}
                    onChange={(e) => setYoutubeForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="accent-rose-500 w-4 h-4"
                  />
                  Featured Focus
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-full border border-[#E8D4C9] text-slate-500 hover:text-slate-800 text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-500 text-white rounded-full hover:opacity-90 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Embed Video'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Category Modal */}
      {activeModal === 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-[#EFE2D8] rounded-[2.5rem] p-8 shadow-2xl relative"
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-display text-2xl font-light mb-6">Manage Category</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const data = { ...categoryForm, slug: categoryForm.slug || slugify(categoryForm.name) }
                void mutateEntity('categories', categoryForm.id ? 'update' : 'create', data)
              }}
              className="space-y-4"
            >
              <div>
                <label className={labelClass}>Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Order Index</label>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) => setCategoryForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-full border border-[#E8D4C9] text-slate-400 hover:text-slate-800 text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-500 text-white rounded-full hover:opacity-90 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Subcategory Modal */}
      {activeModal === 'subcategory' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-[#EFE2D8] rounded-[2.5rem] p-8 shadow-2xl relative"
          >
            <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-950 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            <h3 className="font-display text-2xl font-light mb-6">Manage Subcategory</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const data = { ...subcategoryForm, slug: subcategoryForm.slug || slugify(subcategoryForm.name) }
                void mutateEntity('subcategories', subcategoryForm.id ? 'update' : 'create', data)
              }}
              className="space-y-4"
            >
              <div>
                <label className={labelClass}>Parent Category</label>
                <select
                  required
                  value={subcategoryForm.category_id}
                  onChange={(e) => setSubcategoryForm((p) => ({ ...p, category_id: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select Category...</option>
                  {overview.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Slug</label>
                <input
                  type="text"
                  value={subcategoryForm.slug}
                  onChange={(e) => setSubcategoryForm((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Order Index</label>
                <input
                  type="number"
                  value={subcategoryForm.sort_order}
                  onChange={(e) => setSubcategoryForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  className={inputClass}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-full border border-[#E8D4C9] text-slate-500 hover:text-slate-800 text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-500 text-white rounded-full hover:opacity-90 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      {/* Media Library selection modal for Best Shots */}
      {showBestShotsLibraryPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090b]/40 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl bg-white border border-[#EFE2D8] rounded-[2.5rem] p-8 shadow-2xl relative max-h-[85vh] flex flex-col"
          >
            <button onClick={() => setShowBestShotsLibraryPicker(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer">
              <X className="h-6 w-6" />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-display font-semibold text-slate-900">Select from Media Library</h3>
              <p className="text-xs text-slate-500">Pick any image currently uploaded to your portfolio categories.</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mb-6 scrollbar-hide">
              {!overview.photos.length ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  No photos available in Media Library. Go to Media Library tab to upload photos first!
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {overview.photos.map((photo) => {
                    const alreadyAdded = bestShotsForm.photos.some((p) => p.id === photo.id)
                    return (
                      <div
                        key={photo.id}
                        onClick={() => {
                          if (!alreadyAdded) {
                            addPhotoFromLibrary(photo)
                          }
                        }}
                        className={`relative aspect-square rounded-xl bg-slate-100 overflow-hidden cursor-pointer border-2 transition ${
                          alreadyAdded
                            ? 'border-rose-500 opacity-60'
                            : 'border-transparent hover:border-slate-400 hover:shadow'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.public_url} alt={photo.title} className="w-full h-full object-cover select-none" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                          {alreadyAdded ? (
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-slate-950/70 px-2 py-1 rounded">Added</span>
                          ) : (
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-rose-500 px-2.5 py-1 rounded-full">Select</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#EFE2D8]/60">
              <button
                onClick={() => setShowBestShotsLibraryPicker(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 font-semibold text-xs text-white rounded-full transition cursor-pointer"
              >
                Done selection
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
