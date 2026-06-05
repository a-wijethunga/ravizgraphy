import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDB } from '@lib/local-db'
import AdminDashboardClient from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

  if (!isAuthenticated) {
    console.log('[Admin Dashboard] Verification failed: No authenticated cookie. Redirecting to login.');
    redirect('/admin/login')
  }

  const db = await getDB()

  const stats = {
    albums: db.albums.length,
    photos: db.photos.length,
    videos: db.videos.length,
    admins: 1,
  }

  return <AdminDashboardClient stats={stats} />
}



