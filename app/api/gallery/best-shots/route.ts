import { NextResponse } from 'next/server'
import { getDB } from '@lib/local-db'

const defaultPhotos = [
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

export async function GET() {
  try {
    const db = getDB()
    const bestShotsRow = (db.site_content || []).find((row: any) => row.key === 'best_shots')

    if (bestShotsRow && bestShotsRow.value) {
      try {
        const parsed = JSON.parse(bestShotsRow.value)
        return NextResponse.json(parsed)
      } catch (e) {
        console.error('Failed to parse site content for best_shots:', e)
      }
    }

    // Default configuration if not customized
    const defaultConfig = {
      title: 'My Best',
      highlight: 'Shots',
      description: 'A quiet selection of cinematic portraits, movement, romance, and coastal atmosphere.',
      visible: true,
      limit: 9,
      layout: 'cinematic',
      photos: defaultPhotos,
    }

    return NextResponse.json(defaultConfig)
  } catch (error: any) {
    console.error('Best Shots API Unexpected Error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unexpected best-shots API error' },
      { status: 500 }
    )
  }
}
