import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FooterLinksEditorClient } from "@/components/admin/FooterLinksEditorClient";
import { buttonVariants } from "@/components/ui/button-variants";
import { getSiteSettings } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SiteFooterLinksAdminPage() {
  const settings = await getSiteSettings();
  const footerColumns = settings?.footerColumns ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Footer links"
        description="Column headings, link labels, URLs, order, and optional ties to homepage section visibility."
      >
        <Link
          href="/admin/site-settings"
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          Back to Site Settings
        </Link>
      </AdminPageHeader>
      <FooterLinksEditorClient initialFooterColumns={footerColumns} />
    </div>
  );
}
