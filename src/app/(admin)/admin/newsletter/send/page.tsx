import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewsletterSendForm } from "@/components/admin/NewsletterSendForm";

export const dynamic = "force-dynamic";

export default function NewsletterSendPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Send newsletter"
        description="Send a simple text update to every subscriber or to a chosen subset."
      />
      <NewsletterSendForm />
    </div>
  );
}
