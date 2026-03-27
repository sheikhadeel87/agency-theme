/** Funnel event `name` values (Mongo `AnalyticsEvent`). */
export const FUNNEL_EVENTS = {
  visitHomepage: "visit_homepage",
  clickContact: "click_contact",
  contactSubmit: "contact_submit",
} as const;

/** Fire-and-forget client event. Skips `/admin`. */
export function trackEvent(event: string): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;
  const name = event.trim().slice(0, 64);
  if (!name) return;
  void fetch("/api/track-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: name }),
    keepalive: true,
  }).catch(() => {});
}
