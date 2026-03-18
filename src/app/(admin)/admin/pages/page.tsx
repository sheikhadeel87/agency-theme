import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "@/components/admin/AdminTable";
import { getDynamicPages } from "@/lib/admin-data";

export default async function PagesPage() {
  const pages = await getDynamicPages();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pages"
        description="Manage dynamic pages and template layouts."
      >
        <Button>
          <Plus className="size-4" />
          Create Page
        </Button>
      </AdminPageHeader>
      <AdminTable headers={["Title", "Slug", "Template"]}>
        {pages.map((p) => (
          <AdminTableRow key={p.slug}>
            <AdminTableCell className="font-medium text-foreground">
              {p.title}
            </AdminTableCell>
            <AdminTableCell className="font-mono text-sm text-muted-foreground">
              /{p.slug}
            </AdminTableCell>
            <AdminTableCell>
              <Badge variant="secondary">{p.template}</Badge>
            </AdminTableCell>
            <AdminTableCell className="text-right">
              <Button variant="link" size="sm" className="text-primary">
                Edit
              </Button>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTable>
    </div>
  );
}
