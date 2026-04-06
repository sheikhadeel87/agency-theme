/**
 * Signed cookie session for /admin (Web Crypto HMAC; works in Edge middleware + Node).
 * Payload is `<expMs>` or `<expMs>|<mongoActorId>` when logged in via DB admin.
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

/** Create cookie value: `<payload>.<hexSig>` where payload is `exp` or `exp|actorObjectId`. */
export async function createAdminSessionToken(actorId?: string | null): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const id = actorId?.trim();
  const payload =
    id && /^[a-fA-F0-9]{24}$/.test(id) ? `${exp}|${id}` : String(exp);
  const sig = await hmacSha256Hex(payload, getSessionSecret());
  return `${payload}.${sig}`;
}

function decodeSessionPayloadSegment(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token || !token.includes(".")) return false;
  const dot = token.lastIndexOf(".");
  const payload = decodeSessionPayloadSegment(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!/^[0-9a-f]+$/i.test(sig)) return false;

  let expMs: string;
  if (payload.includes("|")) {
    const pipe = payload.indexOf("|");
    expMs = payload.slice(0, pipe);
    const oid = payload.slice(pipe + 1);
    if (!/^\d+$/.test(expMs) || !/^[a-fA-F0-9]{24}$/.test(oid)) return false;
  } else {
    if (!/^\d+$/.test(payload)) return false;
    expMs = payload;
  }

  const expected = await hmacSha256Hex(payload, getSessionSecret());
  if (!timingSafeEqualHex(expected.toLowerCase(), sig.toLowerCase()))
    return false;
  if (Number(expMs) < Date.now()) return false;
  return true;
}

/** Mongo ObjectId from session when token was issued for a DB admin; otherwise null (env-only login). */
export async function getAdminActorIdFromToken(
  token: string | undefined
): Promise<string | null> {
  if (!token || !(await verifyAdminSessionToken(token))) return null;

  const dot = token.lastIndexOf(".");
  const payload = decodeSessionPayloadSegment(token.slice(0, dot));

  const pipe = payload.indexOf("|");
  if (pipe === -1) return null;

  const id = payload.slice(pipe + 1);

  return /^[a-fA-F0-9]{24}$/.test(id) ? id : null;
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SEC,
};
