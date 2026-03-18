import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HeroForm } from "@/components/admin/HeroForm";
import { getHeroData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EditHeroPage() {
  const hero = await getHeroData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Hero"
        description="Update the homepage hero heading, description, CTA, and phone text."
      >
        <Link
          href="/admin/homepage"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" />
          Back to Homepage
        </Link>
      </AdminPageHeader>
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <HeroForm initialData={hero} />
      </div>
    </div>
  );
}
