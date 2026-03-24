/**
 * Client-side HTTP access to `/api/site-settings` (navigation).
 * Keeps URLs and fetch logic in one place for admin + public navbar.
 */

import type { NavItem } from "@/lib/navigation";

export const SITE_SETTINGS_API_PATH = "/api/site-settings" as const;

type GetJson = {
  navigation?: unknown;
  error?: string;
};

export type SaveNavigationResult =
  | { ok: true }
  | { ok: false; error: string; status?: number };

/** GET — public; returns navigation array (may be empty on parse failure). */
export async function fetchSiteNavigation(init?: RequestInit): Promise<NavItem[]> {
  const res = await fetch(SITE_SETTINGS_API_PATH, {
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    throw new Error(`site-settings: ${res.status}`);
  }
  const data = (await res.json()) as GetJson;
  if (!Array.isArray(data.navigation)) {
    return [];
  }
  return data.navigation as NavItem[];
}

/** PUT — admin session cookie; replaces navigation. */
export async function saveSiteNavigation(navigation: NavItem[]): Promise<SaveNavigationResult> {
  try {
    const res = await fetch(SITE_SETTINGS_API_PATH, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ navigation }),
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      return {
        ok: false,
        error: data.error ?? `Save failed (${res.status})`,
        status: res.status,
      };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Save failed",
    };
  }
}
