import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function verifySupabaseToken(token: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url || !anonKey) return false
  
  let baseUrl = url
  if (baseUrl.endsWith('/rest/v1/')) {
    baseUrl = baseUrl.slice(0, -9)
  } else if (baseUrl.endsWith('/rest/v1')) {
    baseUrl = baseUrl.slice(0, -8)
  }

  try {
    const res = await fetch(`${baseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${token}`
      }
    })
    return res.status === 200
  } catch (e) {
    console.error('Error verifying token in middleware:', e)
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('sb-access-token')?.value

  let isAuthenticated = false
  if (token) {
    isAuthenticated = await verifySupabaseToken(token)
  }

  if (pathname === '/admin') {
    return NextResponse.redirect(
      new URL(isAuthenticated ? '/admin/dashboard' : '/admin/login', req.url)
    )
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  if (pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}



