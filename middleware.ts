import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isAuthenticated = req.cookies.get('admin_authenticated')?.value === 'true'

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

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}



