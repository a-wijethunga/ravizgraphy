import { NextResponse } from 'next/server'
import { getDB } from '@lib/local-db'

export async function GET() {
  try {
    const db = await getDB()
    const allVideos = db.videos || []
    
    // Filter published videos and shorts
    const videos = allVideos.filter((v: any) => v.published && v.video_type !== 'short')
    const shorts = allVideos.filter((v: any) => v.published && v.video_type === 'short')
    
    // Sort logic: by sort_order ascending, then created_at descending as fallback
    const sortByOrder = (a: any, b: any) => {
      const orderA = a.sort_order ?? 0
      const orderB = b.sort_order ?? 0
      if (orderA !== orderB) return orderA - orderB
      
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    }
    
    videos.sort(sortByOrder)
    shorts.sort(sortByOrder)
    
    // Hydrate categories
    const categoriesMap = new Map(db.categories.map((c) => [c.id, c]))
    const hydrate = (v: any) => {
      const category = categoriesMap.get(v.category_id)
      return {
        ...v,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
      }
    }
    
    return NextResponse.json({
      videos: videos.map(hydrate),
      shorts: shorts.map(hydrate),
    })
  } catch (error: any) {
    console.error('[Gallery Videos API Error]:', error)
    return NextResponse.json(
      { message: error?.message || 'Unexpected gallery videos API error' },
      { status: 500 }
    )
  }
}
