// frontend/src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

/**
 * ✅ MIDDLEWARE - Simplified Authentication Check
 * 
 * Purpose:
 * - Prevent access to auth pages (login/signup) when already logged in
 * - Redirect unauthenticated users trying to access protected routes
 * - Let Authenticated component handle detailed permission checks
 * 
 * Flow:
 * 1. Check if user has accessToken cookie
 * 2. Public routes: redirect to home if logged in
 * 3. Protected routes: redirect to login if not logged in
 * 4. Otherwise: allow request to continue
 */
export default function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const pathname = request.nextUrl.pathname;
  
  // ============================================
  // Define Route Categories
  // ============================================
  
  // Public routes (login, signup, reset-password)
  const publicRoutes = ['/login', '/signup', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes (dashboard for admin, main for users)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/main');

  // Root route
  const isRootRoute = pathname === '/';

  // ============================================
  // Middleware Logic
  // ============================================

  // Case 1: Root route "/" 
  // → Always redirect to login (login page will handle logged-in users)
  if (isRootRoute) {
    console.log('🔀 [Middleware] Root route, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Case 2: Public route + has token
  // → Redirect to home (user is already logged in)
  if (token && isPublicRoute) {
    console.log('🔀 [Middleware] Logged in user accessing public route, redirecting to home');
    return NextResponse.redirect(new URL('/main/home', request.url));
  }

  // Case 3: Protected route + no token
  // → Redirect to login with returnUrl
  if (!token && isProtectedRoute) {
    console.log('🔀 [Middleware] Unauthenticated user accessing protected route, redirecting to login');
    const returnUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
  }

  // Case 4: All other cases
  // → Allow request to continue
  console.log('✅ [Middleware] Request allowed:', pathname);
  return NextResponse.next();
}

/**
 * Middleware Configuration
 * 
 * Matcher: Specify which routes should trigger the middleware
 * - Includes: All auth routes and protected routes
 * - Excludes: API routes, static files, _next internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};