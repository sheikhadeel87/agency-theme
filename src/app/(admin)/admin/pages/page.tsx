import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "@/components/admin/AdminTable";
import { DeletePageButton } from "@/components/admin/DeletePageButton";
import { getDynamicPages } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = await getDynamicPages();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pages"
        description="Manage dynamic pages and template layouts."
      >
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="size-4" />
            Create Page
          </Button>
        </Link>
      </AdminPageHeader>
      {pages.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            No pages yet. Create your first page to get started.
          </p>
          <Link href="/admin/pages/new">
            <Button className="mt-4">Create Page</Button>
          </Link>
        </div>
      ) : (
        <AdminTable headers={["Title", "Slug", "Template", "Status"]}>
          {pages.map((p) => (
            <AdminTableRow key={p._id}>
              <AdminTableCell className="font-medium text-foreground">
                {p.title || "Untitled"}
              </AdminTableCell>
              <AdminTableCell className="font-mono text-sm text-muted-foreground">
                /{p.slug || "—"}
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant="secondary">{p.template || "Default"}</Badge>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={p.status === "published" ? "default" : "secondary"}>
                  {p.status === "published" ? "Published" : "Draft"}
                </Badge>
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <span className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/pages/edit/${p._id}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                  <DeletePageButton pageId={p._id} pageTitle={p.title || "this page"} />
                </span>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
