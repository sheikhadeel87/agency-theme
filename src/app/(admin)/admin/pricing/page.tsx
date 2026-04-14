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
import { formatPlanPriceForDisplay } from "@/lib/pricing-display";

export const dynamic = "force-dynamic";

export default async function PricingAdminPage() {
  const [settings, plans] = await Promise.all([
    getPricingSettings(),
    getPricingPlans(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Pricing"
        description="Section heading, SEO, and pricing plans."
      />

      {/* lg: 8 (plans) | 4 (live site, section, SEO stacked) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-6 lg:z-10 lg:col-span-8 lg:self-start">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan._id}
                  className="flex flex-col justify-between p-4 transition-all hover:border-border hover:shadow-md"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{plan.name || "Unnamed plan"}</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.featured && <Badge variant="secondary">Featured</Badge>}
                        {plan.featuredOnHomepage && (
                          <Badge variant="outline">Homepage</Badge>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ${formatPlanPriceForDisplay(plan.priceMonthly)}
                      {plan.periodLabel?.trim() ? (
                        <span className="text-muted-foreground/80"> · {plan.periodLabel.trim()}</span>
                      ) : null}
                      {plan.priceAnnual > 0 && (
                        <span className="ml-1">
                          {" "}
                          · ${formatPlanPriceForDisplay(plan.priceAnnual)}/yr
                        </span>
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
          {plans.length > 0 && (
            <p className="text-xs text-muted-foreground">
              The homepage shows up to 3 plans: “Show on homepage” first (by order), then other plans by order.
            </p>
          )}
        </div>

        <div className="lg:col-span-4">
          <PricingSectionForm initialData={settings} />
        </div>
      </section>
    </div>
  );
}
