import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LegalPageEditorForm } from "@/components/admin/LegalPageEditorForm";
import { getLegalPageContent } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EditPrivacyPolicyPage() {
  const legal = await getLegalPageContent();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Privacy Policy"
        description="Edit the public privacy policy page and SEO metadata."
      >
        <Link
          href="/admin/legal"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" />
          Back to Legal
        </Link>
      </AdminPageHeader>
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <LegalPageEditorForm
          key={`privacy-${legal.updatedAtIso}`}
          kind="privacy"
          pageTitle="Privacy Policy"
          initialContent={legal.privacyPolicyHtml}
          initialLastUpdated={legal.privacyLastUpdated}
          initialMetaTitle={legal.privacyMetaTitle}
          initialMetaDescription={legal.privacyMetaDescription}
          initialMetaKeywords={legal.privacyMetaKeywords}
          publicPath="/privacy-policy"
        />
      </div>
    </div>
  );
}
