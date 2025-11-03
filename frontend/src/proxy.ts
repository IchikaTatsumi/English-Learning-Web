import { NextResponse, NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  // Logic xử lý Middleware của bạn
  
  // Ví dụ: Kiểm tra đường dẫn và chuyển hướng
  /*
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/alldocuments', request.url));
  }
  */
  
  return NextResponse.next();
}