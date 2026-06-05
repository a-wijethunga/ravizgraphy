import { redirect } from 'next/navigation'
import { getDB } from '@lib/local-db'
import AdminDashboardClient from './AdminDashboardClient'
import { checkAdminSession } from '@lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const isAuthenticated = await checkAdminSession()

  if (!isAuthenticated) {
    console.log('[Admin Dashboard] Verification failed: No authenticated session. Redirecting to login.');
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



