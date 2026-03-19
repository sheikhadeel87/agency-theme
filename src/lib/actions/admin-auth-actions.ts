"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  validateAdminCredentials,
} from "@/lib/admin-session";

export type AdminLoginState = { error: string } | null;

export async function adminLogin(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!validateAdminCredentials(username, password)) {
    return { error: "Invalid username or password." };
  }

  const token = await createAdminSessionToken();
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
