import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export async function isAdminSessionValid(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function requireAdminSession(): Promise<void> {
  const ok = await isAdminSessionValid();
  if (!ok) {
    throw new Error("Unauthorized");
  }
}
