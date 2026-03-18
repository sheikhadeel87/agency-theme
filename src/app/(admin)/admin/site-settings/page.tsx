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

  const sectionValues = [
    { title: sections[0].title, description: sections[0].description, summary: brandingSummary },
    { title: sections[1].title, description: sections[1].description, summary: contactSummary },
    { title: sections[2].title, description: sections[2].description, summary: socialSummary },
    { title: sections[3].title, description: sections[3].description, summary: footerSummary },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Site Settings"
        description="Manage logo, favicon, contact info, and social links."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sectionValues.map(({ title, description, summary }) => (
          <AdminCard
            key={title}
            title={title}
            description={description}
            actionHref="/admin/site-settings/edit"
            actionLabel="Configure"
          >
            <p className="text-sm text-muted-foreground">{summary}</p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
