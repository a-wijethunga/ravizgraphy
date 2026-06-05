import { getSupabaseClient } from '@/lib/supabaseServer'

export const checkAdminSession = async (): Promise<boolean> => {
  const supabaseClient = await getSupabaseClient()
  const { data: { user } } = await supabaseClient.auth.getUser()
  return !!user
}

export const isAdmin = async (userId: string): Promise<boolean> => {
  return true
}

export const requireGalleryAdmin = async () => {
  const supabaseClient = await getSupabaseClient()
  const { data: { user }, error } = await supabaseClient.auth.getUser()

  if (error || !user) {
    console.log('[Admin Auth] requireGalleryAdmin failed:', error?.message || 'Invalid user or no session.')
    return { ok: false as const, status: 401, message: 'Unauthorized' }
  }

  console.log('[Admin Auth] requireGalleryAdmin success: User authenticated.')
  return { 
    ok: true as const, 
    session: { user: { id: user.id, email: user.email } },
    adminClient: supabaseClient
  }
}



