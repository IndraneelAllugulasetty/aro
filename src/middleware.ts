import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth =
    pathname.startsWith('/dashboard') || pathname.startsWith('/messages') || pathname.startsWith('/admin');
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get('aro_session')?.value;
  if (token) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/dashboard/:path*', '/messages/:path*', '/messages', '/admin/:path*', '/admin'],
};

