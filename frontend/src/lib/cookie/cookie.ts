export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null; // SSR
  const match = document.cookie.match(new RegExp('(^| )access_token=([^;]+)'));
  return match ? match[2] : null;
}

export function setAuthToken(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `access_token=${token}; path=/;`;
}

export function removeAuthToken() {
  if (typeof document === 'undefined') return;
  document.cookie = 'access_token=; Max-Age=0; path=/;';
}