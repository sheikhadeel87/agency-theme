"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { savePricingPlan } from "@/lib/actions/pricing-actions";
import type { PricingPlanItem } from "@/lib/admin-data";
import { isFormCheckboxChecked, openAdminPreview } from "@/lib/admin-preview";
import { ArrowLeft, Eye, Send, Star } from "lucide-react";
import { toast } from "sonner";

type Props = {
  initialData?: PricingPlanItem | null;
};

function blockNonNumericNumberKeys(e: KeyboardEvent<HTMLInputElement>) {
  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
}

const defaultPlan: Omit<PricingPlanItem, "_id"> = {
  name: "",
  priceMonthly: 0,
  priceAnnual: 0,
  periodLabel: "month",
  subtext: "No credit card required",
  ctaText: "Try for free",
  ctaLink: "",
  features: [],
  footnote: "7-day free trial",
  featured: false,
  featuredOnHomepage: false,
  order: 0,
};

export function PricingPlanForm({ initialData }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const data = initialData ?? { ...defaultPlan, _id: "" };
  const featuresText = (data.features && data.features.length > 0)
    ? data.features.join("\n")
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await savePricingPlan(formData);
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    toast.success("Pricing plan saved.");
    router.push("/admin/pricing");
    router.refresh();
  }

  function handlePreview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const featuresRaw = String(fd.get("features") ?? "");
    const features = featuresRaw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const pm = parseFloat(String(fd.get("priceMonthly") ?? ""));
    const pa = parseFloat(String(fd.get("priceAnnual") ?? ""));
    const plan: PricingPlanItem = {
      _id: "preview",
      name: String(fd.get("name") ?? ""),
      priceMonthly: Number.isFinite(pm) ? pm : 0,
      priceAnnual: Number.isFinite(pa) ? pa : 0,
      periodLabel: String(fd.get("periodLabel") ?? "per month"),
      subtext: String(fd.get("subtext") ?? ""),
      ctaText: String(fd.get("ctaText") ?? ""),
      ctaLink: String(fd.get("ctaLink") ?? ""),
      features,
      footnote: String(fd.get("footnote") ?? ""),
      featured: isFormCheckboxChecked(form, "featured"),
      featuredOnHomepage: isFormCheckboxChecked(form, "featuredOnHomepage"),
      order: parseInt(String(fd.get("order") ?? "0"), 10) || 0,
    };
    openAdminPreview("pricing-plan", { plan, settings: {} });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {data._id && <input type="hidden" name="_id" value={data._id} readOnly />}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Plan
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                  Plan name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Starter, Growth Plan"
                  defaultValue={data.name}
                  className="h-11 text-base"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="priceMonthly" className="mb-1.5 block text-sm font-medium text-foreground">
                    Price (monthly)
                  </label>
                  <Input
                    id="priceMonthly"
                    name="priceMonthly"
                    type="number"
                    min={0}
                    max={1_000_000}
                    step="0.01"
                    placeholder="29"
                    defaultValue={data.priceMonthly || undefined}
                    className="h-10"
                    onKeyDown={blockNonNumericNumberKeys}
                  />
                </div>
                <div>
                  <label htmlFor="priceAnnual" className="mb-1.5 block text-sm font-medium text-foreground">
                    Price (annual)
                  </label>
                  <Input
                    id="priceAnnual"
                    name="priceAnnual"
                    type="number"
                    min={0}
                    max={1_000_000}
                    step="0.01"
                    placeholder="290"
                    defaultValue={data.priceAnnual || undefined}
                    className="h-10"
                    onKeyDown={blockNonNumericNumberKeys}
                  />
                </div>
              </div>
              {/* <div>
                <label htmlFor="periodLabel" className="mb-1.5 block text-sm font-medium text-foreground">
                  Period label
                </label>
                <Input
                  id="periodLabel"
                  name="periodLabel"
                  placeholder="month"
                  defaultValue={data.periodLabel}
                  className="h-10"
                />
              </div> */}
              <div>
                <label htmlFor="subtext" className="mb-1.5 block text-sm font-medium text-foreground">
                  Subtext below price
                </label>
                <Input
                  id="subtext"
                  name="subtext"
                  placeholder="No credit card required"
                  defaultValue={data.subtext}
                  className="h-10"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="ctaText" className="mb-1.5 block text-sm font-medium text-foreground">
                    Button text
                  </label>
                  <Input
                    id="ctaText"
                    name="ctaText"
                    placeholder="Try for free"
                    defaultValue={data.ctaText}
                    className="h-10"
                  />
                </div>
                <div>
                  <label htmlFor="ctaLink" className="mb-1.5 block text-sm font-medium text-foreground">
                    Button link
                  </label>
                  <Input
                    id="ctaLink"
                    name="ctaLink"
                    type="url"
                    placeholder="https://..."
                    defaultValue={data.ctaLink}
                    className="h-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="features" className="mb-1.5 block text-sm font-medium text-foreground">
                  Features (one per line)
                </label>
                <textarea
                  id="features"
                  name="features"
                  placeholder="400 GB Storage&#10;Unlimited Photos & Videos&#10;Exclusive Support"
                  defaultValue={featuresText}
                  rows={5}
                  className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div>
                <label htmlFor="footnote" className="mb-1.5 block text-sm font-medium text-foreground">
                  Footnote
                </label>
                <Input
                  id="footnote"
                  name="footnote"
                  placeholder="7-day free trial"
                  defaultValue={data.footnote}
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Star className="size-4" />
              Display
            </h3>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={data.featured}
                  className="size-4 rounded border-input"
                />
                <span className="text-sm font-medium">Featured plan (blue border & button)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted/50">
                <input
                  type="checkbox"
                  name="featuredOnHomepage"
                  defaultChecked={data.featuredOnHomepage}
                  className="size-4 rounded border-input"
                />
                <span className="text-sm font-medium">Show on homepage</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Homepage shows up to 3 plans: checked first (by order), then others by order.
              </p>
              <div>
                <label htmlFor="order" className="mb-1 block text-xs font-medium text-foreground">
                  Order
                </label>
                <Input
                  id="order"
                  name="order"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="0"
                  defaultValue={data.order}
                  className="h-9 text-sm"
                  onKeyDown={blockNonNumericNumberKeys}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="submit" className="gap-2">
          <Send className="size-4" />
          Save plan
        </Button>
        <Link
          href="/admin/pricing"
          className={cn(buttonVariants({ variant: "outline" }), "inline-flex gap-2")}
        >
          <ArrowLeft className="size-4" />
          Back to Pricing
        </Link>
      </div>
    </form>
  );
}
