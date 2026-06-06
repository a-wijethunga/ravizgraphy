import { NextResponse } from 'next/server'
import { requireGalleryAdmin } from '@lib/admin-auth'
import path from 'path'

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.heic', '.heif', '.svg']
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.ogg']
const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024 // 10 GB

function isImage(filePath: string, mimeType?: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) return true
  const ext = path.extname(filePath).toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

function isVideo(filePath: string, mimeType?: string): boolean {
  if (mimeType && mimeType.startsWith('video/')) return true
  const ext = path.extname(filePath).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

async function listAllFiles(supabase: any, bucket: string, folderPath = ''): Promise<any[]> {
  let allFiles: any[] = []
  let offset = 0
  const limit = 100

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(folderPath, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' }
    })

    if (error) {
      console.error(`Error listing files in bucket "${bucket}" at path "${folderPath}":`, error)
      throw error
    }

    if (!data || data.length === 0) {
      break
    }

    for (const item of data) {
      const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name
      if (!item.id) {
        // It's a folder, list recursively
        const subFiles = await listAllFiles(supabase, bucket, fullPath)
        allFiles = allFiles.concat(subFiles)
      } else {
        // It's a file
        allFiles.push({
          name: fullPath,
          size: item.metadata?.size || 0,
          mimeType: item.metadata?.mimetype || ''
        })
      }
    }

    if (data.length < limit) {
      break
    }
    offset += limit
  }

  return allFiles
}

export async function GET() {
  const auth = await requireGalleryAdmin()
  if (!auth.ok) {
    return NextResponse.json({ message: auth.message }, { status: auth.status })
  }
  const supabase = auth.adminClient

  try {
    const files = await listAllFiles(supabase, 'gallery')
    
    let totalImages = 0
    let totalVideos = 0
    let storageUsedBytes = 0

    for (const file of files) {
      storageUsedBytes += file.size
      if (isImage(file.name, file.mimeType)) {
        totalImages++
      } else if (isVideo(file.name, file.mimeType)) {
        totalVideos++
      }
    }

    const totalFiles = files.length
    const remainingStorageBytes = Math.max(0, STORAGE_LIMIT_BYTES - storageUsedBytes)
    const usagePercentage = Math.min(100, Math.round((storageUsedBytes / STORAGE_LIMIT_BYTES) * 100 * 10) / 10)

    return NextResponse.json({
      success: true,
      stats: {
        totalImages,
        totalVideos,
        totalFiles,
        storageUsedBytes,
        storageLimitBytes: STORAGE_LIMIT_BYTES,
        remainingStorageBytes,
        storageUsedFormatted: formatBytes(storageUsedBytes),
        storageLimitFormatted: formatBytes(STORAGE_LIMIT_BYTES),
        remainingStorageFormatted: formatBytes(remainingStorageBytes),
        usagePercentage
      }
    })
  } catch (error: any) {
    console.error('[Storage API Error]:', error)
    return NextResponse.json(
      { success: false, message: error?.message || 'Unable to calculate storage usage.' },
      { status: 500 }
    )
  }
}
