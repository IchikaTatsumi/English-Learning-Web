"use server";
import { cookies } from "next/headers";

export async function getAuthTokenServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  return accessToken?.value || null;
}

export async function setAuthTokenServer(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function removeAuthTokenServer() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
}
