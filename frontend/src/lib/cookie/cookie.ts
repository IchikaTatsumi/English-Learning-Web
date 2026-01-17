export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  // ✅ FIX: Đổi tên key thành 'accessToken' để khớp với Middleware
  const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
  return match ? match[2] : null;
}

export function setAuthToken(token: string) {
  if (typeof document === 'undefined') return;
  // ✅ FIX: Set cookie tên là 'accessToken', hạn 1 ngày
  document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function removeAuthToken() {
  if (typeof document === 'undefined') return;
  // ✅ FIX: Xóa đúng key 'accessToken'
  document.cookie = 'accessToken=; Max-Age=0; path=/;';
}