import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NavigationEditorClient } from "@/components/admin/NavigationEditorClient";
import { getSiteSettings } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function SiteNavigationAdminPage() {
  const settings = await getSiteSettings();
  const navigation = settings?.navigation ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Navigation"
        description="Reorder menu items, edit labels and URLs, and build dropdowns. Changes apply to the public header."
      >
        <Link
          href="/admin/site-settings"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" />
          Back to Site Settings
        </Link>
      </AdminPageHeader>
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <NavigationEditorClient initialNavigation={navigation} />
      </div>
    </div>
  );
}
