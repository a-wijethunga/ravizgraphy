import { cookies } from 'next/headers'

export const checkAdminSession = async (): Promise<boolean> => {
  const cookieStore = await cookies()
  return cookieStore.get('admin_authenticated')?.value === 'true'
}

export const isAdmin = async (userId: string): Promise<boolean> => {
  return userId === 'admin-id'
}

export const requireGalleryAdmin = async () => {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true'

  if (!isAuthenticated) {
    console.log('[Admin Auth] requireGalleryAdmin failed: User not authenticated.');
    return { ok: false as const, status: 401, message: 'Unauthorized' }
  }

  console.log('[Admin Auth] requireGalleryAdmin success: User authenticated.');
  return { 
    ok: true as const, 
    session: { user: { id: 'admin-id', email: 'admin@localhost.com' } },
    adminClient: null as any // Pass dummy client
  }
}



