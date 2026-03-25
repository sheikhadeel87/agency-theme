import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-8">
      <AdminPageHeader
        title="Team"
        description="Section heading, SEO, and team members."
      />

      {/* lg: 8 (members) | 4 (live site, team section, SEO stacked) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-6 lg:z-10 lg:col-span-8 lg:self-start">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-foreground">Team members</h2>
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
            <div className="grid gap-4 sm:grid-cols-2">
              {members.map((m) => (
                <Card
                  key={m._id}
                  className="flex flex-row items-center gap-4 p-4 transition-all hover:border-border hover:shadow-md"
                >
                  <Avatar className="size-14 shrink-0">
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
              The homepage shows up to 3 members: “Show on homepage” first (newest), then others by display
              order.
            </p>
          )}
        </div>

        <div className="lg:col-span-4">
          <TeamSectionForm initialData={teamSettings} />
        </div>
      </section>
    </div>
  );
}
