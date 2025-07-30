import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'session';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);

  // If the user is trying to access an admin page and has no session cookie, redirect to login
  if (request.nextUrl.pathname.startsWith('/admin') && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is on the login page and already has a session cookie, redirect to admin
  if (request.nextUrl.pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher to specify which routes the middleware should run on.
  matcher: ['/admin/:path*', '/login'],
};
