import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";

export const dynamic = "force-dynamic";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Add Member"
        description="Add a new team member."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <TeamMemberForm />
      </div>
    </div>
  );
}
