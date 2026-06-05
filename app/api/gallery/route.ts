import { NextResponse } from 'next/server'
import { getDB } from '@lib/local-db'

export async function GET() {
  try {
    const db = getDB()
    const photos = db.photos || []
    
    // Map to the expected structure
    const data = photos
      .filter((p) => p.published)
      .map((p) => {
        const category = db.categories.find((c) => String(c.id) === String(p.category_id))
        return {
          id: p.id,
          title: p.title,
          image_url: p.public_url,
          public_id: p.id,
          category: category ? category.slug : (p.category_id || ''),
          created_at: p.created_at,
        }
      })

    // Sort by created_at desc
    data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Gallery API Unexpected Error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected gallery API error' },
      { status: 500 }
    )
  }
}
