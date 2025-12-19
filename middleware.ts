import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  // Public pages that don't require authentication
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.some(page => request.nextUrl.pathname.startsWith(page));

  // If user is authenticated and tries to access login/register, redirect to home
  if (userId && isPublicPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and tries to access protected pages, redirect to login
  if (!userId && !isPublicPage && request.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Root page - redirect to login if not authenticated
  if (!userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
