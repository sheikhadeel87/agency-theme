import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { getSiteSettings, getSiteSettingsSections } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const [settings, sections] = await Promise.all([
    getSiteSettings(),
    Promise.resolve(getSiteSettingsSections()),
  ]);

  const s = settings;
  const brandingSummary =
    s && (s.siteName || s.logoText)
      ? [s.siteName || null, s.logoText || null].filter(Boolean).join(" · ") || "Not set"
      : "Not set";
  const contactSummary =
    s && (s.contactEmail || s.phone)
      ? [s.contactEmail || null, s.phone || null].filter(Boolean).join(" · ") || "Not set"
      : "Not set";
  const socialSummary =
    s?.socialLinks &&
    Object.values(s.socialLinks).some((v) => v?.trim())
      ? Object.entries(s.socialLinks)
          .filter(([, v]) => v?.trim())
          .map(([k]) => k)
          .join(", ") || "Not set"
      : "Not set";
  const footerSummary =
    s && (s.footerText || s.privacyPolicyUrl || s.termsUrl)
      ? [s.footerText ? "Footer set" : null, s.privacyPolicyUrl ? "Privacy" : null, s.termsUrl ? "Terms" : null]
          .filter(Boolean)
          .join(" · ") || "Not set"
      : "Not set";

  const navCount = s?.navigation?.length ?? 0;
  const navEnabled = s?.navigation?.filter((i) => i.isEnabled).length ?? 0;
  const navigationSummary =
    navCount > 0
      ? `${navEnabled} visible / ${navCount} items`
      : "Default menu (not saved yet)";

  const summaries = [brandingSummary, contactSummary, socialSummary, footerSummary, navigationSummary];

  const sectionValues = sections.map((sec, i) => ({
    title: sec.title,
    description: sec.description,
    summary: summaries[i] ?? "—",
    actionHref: sec.actionHref,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings"
        description="Manage logo, favicon, contact info, and social links."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sectionValues.map(({ title, description, summary, actionHref }) => (
          <AdminCard
            key={title}
            title={title}
            description={description}
            actionHref={actionHref}
            actionLabel="Configure"
          >
            <p className="text-sm text-muted-foreground">{summary}</p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
