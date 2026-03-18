import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { getTeamMembers } from "@/lib/admin-data";

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team"
        description="Manage team member names, roles, and photos."
      >
        <Button>
          <Plus className="size-4" />
          Add Member
        </Button>
      </AdminPageHeader>
      {members.length === 0 ? (
        <AdminEmptyState
          title="No team members"
          description="Add your first team member to display on the website."
          action={
            <Button>
              <Plus className="size-4" />
              Add Member
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Card
              key={m.name}
              className="flex flex-row items-center gap-4 p-4 transition-all hover:shadow-md hover:border-gray-300"
            >
              <Avatar className="size-14">
                <AvatarFallback className="text-base">
                  {m.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
              </div>
              <Button variant="link" size="sm" className="text-primary">
                Edit
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
