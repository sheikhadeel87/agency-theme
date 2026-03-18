import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "@/components/admin/AdminTable";
import { getPortfolioProjects } from "@/lib/admin-data";

const primaryButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const linkButtonClass =
  "inline-flex h-7 items-center text-[0.8rem] font-medium text-primary underline-offset-4 hover:underline";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const projects = await getPortfolioProjects();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Portfolio"
        description="Manage portfolio items and project details."
      >
        <Link href="/admin/portfolio/new" className={primaryButtonClass}>
          <Plus className="size-4" />
          Add Project
        </Link>
      </AdminPageHeader>
      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            No portfolio projects yet. Add your first project to get started.
          </p>
          <Link href="/admin/portfolio/new" className={`${primaryButtonClass} mt-4`}>
            Add Project
          </Link>
        </div>
      ) : (
        <AdminTable headers={["Title", "Client", "Categories", "Status"]}>
          {projects.map((p) => (
            <AdminTableRow key={p._id}>
              <AdminTableCell className="font-medium text-foreground">
                {p.title || "Untitled"}
              </AdminTableCell>
              <AdminTableCell className="text-muted-foreground">
                {p.client || "—"}
              </AdminTableCell>
              <AdminTableCell>
                <div className="flex flex-wrap gap-1">
                  {p.categories.length > 0
                    ? p.categories.map((c) => (
                        <Badge key={c} variant="secondary">
                          {c}
                        </Badge>
                      ))
                    : "—"}
                </div>
              </AdminTableCell>
              <AdminTableCell>
                <Badge variant={p.status === "Published" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
              </AdminTableCell>
              <AdminTableCell className="text-right">
                <Link
                  href={`/admin/portfolio/edit/${p._id}`}
                  className={linkButtonClass}
                >
                  Edit
                </Link>
              </AdminTableCell>
            </AdminTableRow>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
