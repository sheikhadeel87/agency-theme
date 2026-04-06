import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  getAdminActorIdFromToken,
} from "@/lib/admin-session";

export async function getAdminActorIdFromSession(): Promise<string | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return getAdminActorIdFromToken(token);
}

/** App Router route handlers: Bearer session token or admin cookie. */
export async function getAdminActorIdFromRequest(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t) return getAdminActorIdFromToken(t);
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return getAdminActorIdFromToken(token);
}
