import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  if (!request.cookies.has('itda_session')) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/home/:path*', '/found/new/:path*', '/my/:path*', '/profile/:path*'],
}
