import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { PricingSectionForm } from "@/components/admin/PricingSectionForm";
import { DeletePricingPlanButton } from "@/components/admin/DeletePricingPlanButton";
import { getPricingSettings, getPricingPlans } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function PricingAdminPage() {
  const [settings, plans] = await Promise.all([
    getPricingSettings(),
    getPricingPlans(),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Pricing"
        description="Section heading, SEO, and pricing plans."
      >
        <Link href="/admin/pricing/new">
          <Button>
            <Plus className="size-4" />
            Add Plan
          </Button>
        </Link>
      </AdminPageHeader>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Section & SEO</h2>
        <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
          <PricingSectionForm initialData={settings} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Plans</h2>
          <Link href="/admin/pricing/new">
            <Button>
              <Plus className="size-4" />
              Add Plan
            </Button>
          </Link>
        </div>
        {plans.length === 0 ? (
          <AdminEmptyState
            title="No plans yet"
            description="Add pricing plans to display on the Pricing section."
            action={
              <Link href="/admin/pricing/new">
                <Button>
                  <Plus className="size-4" />
                  Add Plan
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan._id} className="flex flex-col justify-between p-4 transition-all hover:shadow-md hover:border-border">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{plan.name || "Unnamed plan"}</p>
                    {plan.featured && <Badge variant="secondary">Featured</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ${plan.priceMonthly} / {plan.periodLabel}
                    {plan.priceAnnual > 0 && (
                      <span className="ml-1"> · ${plan.priceAnnual}/yr</span>
                    )}
                  </p>
                </div>
                <span className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/admin/pricing/edit/${plan._id}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeletePricingPlanButton planId={plan._id} planName={plan.name || "this plan"} />
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
