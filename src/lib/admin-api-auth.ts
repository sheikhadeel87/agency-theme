import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

/** Cookie or `Authorization: Bearer` with the same session token (e.g. API tools). */
export async function verifyAdminApiAuth(request: Request): Promise<boolean> {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t) return verifyAdminSessionToken(t);
    return false;
  }
  return verifyAdminSessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
}
