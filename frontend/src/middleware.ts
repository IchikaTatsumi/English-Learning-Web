// frontend/src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Giả sử bạn lưu token trong cookie
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup';

  // Nếu đã có token mà cố vào trang login -> đẩy sang home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/main/home', request.url));
  }

  return NextResponse.next();
}

// Giới hạn middleware chạy ở đâu
export const config = {
  matcher: ['/login', '/signup', '/dashboard/:path*', '/main/:path*'],
};