'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server action to set auth cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Server action to remove auth cookie
 */
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
}

/**
 * Server action to get auth cookie
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  return token?.value || null;
}

/**
 * Server action to check if user is authenticated
 */
export async function checkAuth(): Promise<boolean> {
  const token = await getAuthCookie();
  return !!token;
}

/**
 * Server action to logout and redirect
 */
export async function logoutAction() {
  await removeAuthCookie();
  redirect('/login');
}

/**
 * Server action to require authentication
 */
export async function requireAuth() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    redirect('/login');
  }
}

/**
 * Server action to require admin role
 */
export async function requireAdmin() {
  const token = await getAuthCookie();
  
  if (!token) {
    redirect('/login');
  }
  
  // TODO: Decode JWT and check role
  // Install: npm install jsonwebtoken @types/jsonwebtoken
  // import jwt from 'jsonwebtoken';
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // if (decoded.role !== 'Admin') redirect('/dashboard');
}