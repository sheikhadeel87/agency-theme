import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { TeamSectionForm } from "@/components/admin/TeamSectionForm";
import { DeleteTeamMemberButton } from "@/components/admin/DeleteTeamMemberButton";
import { getTeamSettings, getTeamMembers } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const [teamSettings, members] = await Promise.all([
    getTeamSettings(),
    getTeamMembers(),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Team"
        description="Section heading, SEO, and team members."
      />

      {/* Section + SEO form (same layout as Blog) */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Section & SEO
        </h2>
        <TeamSectionForm initialData={teamSettings} />
      </section>

      {/* Team members */}
      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Team members
          </h2>
          <Link href="/admin/team/new">
            <Button>
              <Plus className="size-4" />
              Add Member
            </Button>
          </Link>
        </div>
        {members.length === 0 ? (
          <AdminEmptyState
            title="No team members"
            description="Add your first team member to display on the website."
            action={
              <Link href="/admin/team/new">
                <Button>
                  <Plus className="size-4" />
                  Add Member
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card
                key={m._id}
                className="flex flex-row items-center gap-4 p-4 transition-all hover:shadow-md hover:border-border"
              >
                <Avatar className="size-14 flex-shrink-0">
                  {m.imageUrl ? (
                    <AvatarImage src={m.imageUrl} alt={m.name} />
                  ) : null}
                  <AvatarFallback className="text-base">
                    {m.name.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
                <span className="flex items-center gap-2">
                  <Link
                    href={`/admin/team/edit/${m._id}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteTeamMemberButton memberId={m._id} memberName={m.name} />
                </span>
              </Card>
            ))}
          </div>
        )}
        {members.length > 0 && (
          <p className="text-xs text-muted-foreground">
            The homepage shows up to 3 members: “Show on homepage” first (newest), then others by display order.
          </p>
        )}
      </section>
    </div>
  );
}
