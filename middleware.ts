import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Handle dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for authentication token
    const token = request.cookies.get('next-auth.session-token')?.value
    
    if (!token) {
      // Redirect to sign-in if not authenticated
      return NextResponse.redirect(new URL('/signin', request.url))
    }
    
    // Add headers to prevent RSC payload caching issues
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
}
