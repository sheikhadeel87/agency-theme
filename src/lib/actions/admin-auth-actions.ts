"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateAdminDbLogin } from "@/lib/admin-db-auth";
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

  let dbUser: Awaited<ReturnType<typeof validateAdminDbLogin>> = null;
  try {
    dbUser = await validateAdminDbLogin(username, password);
  } catch {
    dbUser = null;
  }
  const envOk = validateAdminCredentials(username, password);
  if (!dbUser && !envOk) {
    return { error: "Invalid username or password." };
  }

  const token = await createAdminSessionToken(dbUser?.id ?? null);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}
