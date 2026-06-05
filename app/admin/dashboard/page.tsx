import { redirect } from 'next/navigation'
import AdminDashboardClient from './AdminDashboardClient'
import { checkAdminSession } from '@lib/admin-auth'
import { getSupabaseClient } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const isAuthenticated = await checkAdminSession()

  if (!isAuthenticated) {
    console.log('[Admin Dashboard] Verification failed: No authenticated session. Redirecting to login.');
    redirect('/admin/login')
  }

  const supabase = await getSupabaseClient()
  
  // Fast lightweight head count selects without downloading rows
  const [
    { count: albumsCount },
    { count: photosCount },
    { count: videosCount }
  ] = await Promise.all([
    supabase.from('albums').select('*', { count: 'exact', head: true }),
    supabase.from('photos').select('*', { count: 'exact', head: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true })
  ])

  const stats = {
    albums: albumsCount || 0,
    photos: photosCount || 0,
    videos: videosCount || 0,
    admins: 1,
  }

  return <AdminDashboardClient stats={stats} />
}
