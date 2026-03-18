import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

export default function NewTestimonialPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Add Testimonial" description="Add a new client testimonial." />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <TestimonialForm />
      </div>
    </div>
  );
}
