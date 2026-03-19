/**
 * Simple signed cookie session for /admin (no DB users).
 * Uses Web Crypto HMAC so verification works in Edge middleware and Node server actions.
 */

export const ADMIN_SESSION_COOKIE = "admin_session";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  // Dev fallback only — set ADMIN_SESSION_SECRET in production
  return "agency-theme-admin-dev-secret-change-me";
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || "adeel";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() || "adeel123";
}

export function validateAdminCredentials(
  username: string,
  password: string
): boolean {
  const u = username.trim();
  const p = password;
  return u === getAdminUsername() && p === getAdminPassword();
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/** Create cookie value: `<expMs>.<hexSig>` */
export async function createAdminSessionToken(): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = String(exp);
  const sig = await hmacSha256Hex(payload, getSessionSecret());
  return `${payload}.${sig}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const dot = token.lastIndexOf(".");
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(payload) || !/^[0-9a-f]+$/i.test(sig)) return false;
  const expected = await hmacSha256Hex(payload, getSessionSecret());
  if (!timingSafeEqualHex(expected.toLowerCase(), sig.toLowerCase()))
    return false;
  if (Number(payload) < Date.now()) return false;
  return true;
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SEC,
};
