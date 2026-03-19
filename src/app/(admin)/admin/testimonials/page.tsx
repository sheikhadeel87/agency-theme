import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { TestimonialsSectionForm } from "@/components/admin/TestimonialsSectionForm";
import { DeleteTestimonialButton } from "@/components/admin/DeleteTestimonialButton";
import { getTestimonialsSettings, getTestimonials } from "@/lib/admin-data";
import { shouldUseUnoptimizedImage } from "@/lib/image-display";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const [settings, testimonials] = await Promise.all([
    getTestimonialsSettings(),
    getTestimonials(),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Testimonials"
        description="Section heading, SEO, and client testimonials."
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Section & SEO</h2>
        <TestimonialsSectionForm initialData={settings} />
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">Testimonials</h2>
          <Link href="/admin/testimonials/new">
            <Button>
              <Plus className="size-4" />
              Add Testimonial
            </Button>
          </Link>
        </div>
        {testimonials.length === 0 ? (
          <AdminEmptyState
            title="No testimonials"
            description="Add your first testimonial to display on the website."
            action={
              <Link href="/admin/testimonials/new">
                <Button>
                  <Plus className="size-4" />
                  Add Testimonial
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t._id} className="flex flex-row items-center gap-4 p-4 transition-all hover:shadow-md hover:border-border">
                <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  {t.imageUrl ? (
                    <Image
                      src={t.imageUrl}
                      alt={t.authorName}
                      fill
                      className="object-cover"
                      sizes="56px"
                      unoptimized={shouldUseUnoptimizedImage(t.imageUrl)}
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
                      {t.authorName.charAt(0) || "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{t.authorName}</p>
                  <p className="truncate text-sm text-muted-foreground">{t.designation || t.brandName || "—"}</p>
                </div>
                <span className="flex items-center gap-2">
                  <Link href={`/admin/testimonials/edit/${t._id}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                    Edit
                  </Link>
                  <DeleteTestimonialButton testimonialId={t._id} authorName={t.authorName} />
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
