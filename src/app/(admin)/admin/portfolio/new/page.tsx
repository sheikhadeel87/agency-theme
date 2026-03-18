import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioForm } from "@/components/admin/PortfolioForm";

export const dynamic = "force-dynamic";

export default function NewPortfolioPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Project"
        description="Create a new portfolio project."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <PortfolioForm />
      </div>
    </div>
  );
}
