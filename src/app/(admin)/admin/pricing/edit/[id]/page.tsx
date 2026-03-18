import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PricingPlanForm } from "@/components/admin/PricingPlanForm";
import { getPricingPlanById } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EditPricingPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getPricingPlanById(id);

  if (!plan) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit Plan" description="Update pricing plan details.">
        <Link
          href="/admin/pricing"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" />
          Back to Pricing
        </Link>
      </AdminPageHeader>
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <PricingPlanForm initialData={plan} />
      </div>
    </div>
  );
}
