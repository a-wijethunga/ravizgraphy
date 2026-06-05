import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export const checkAdminSession = async (): Promise<boolean> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return false
  const { data: { user } } = await supabase.auth.getUser(token)
  return !!user
}

export const isAdmin = async (userId: string): Promise<boolean> => {
  return true
}

export const requireGalleryAdmin = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value

  if (!token) {
    console.log('[Admin Auth] requireGalleryAdmin failed: User not authenticated (no token cookie).')
    return { ok: false as const, status: 401, message: 'Unauthorized' }
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.log('[Admin Auth] requireGalleryAdmin failed:', error?.message || 'Invalid user.')
    return { ok: false as const, status: 401, message: 'Unauthorized' }
  }

  await supabase.auth.setSession({ access_token: token, refresh_token: '' })

  console.log('[Admin Auth] requireGalleryAdmin success: User authenticated.')
  return { 
    ok: true as const, 
    session: { user: { id: user.id, email: user.email } },
    adminClient: supabase
  }
}



