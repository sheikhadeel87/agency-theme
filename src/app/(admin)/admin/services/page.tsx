import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminTable,
  AdminTableRow,
  AdminTableCell,
} from "@/components/admin/AdminTable";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { getServices, getSiteSettings } from "@/lib/admin-data";
import { AdminHomepageSectionLiveToggle } from "@/components/admin/AdminHomepageSectionLiveToggle";

export const dynamic = "force-dynamic";

function stripHtml(html: string, maxLen = 60): string {
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
}

export default async function ServicesPage() {
  const [services, siteSettings] = await Promise.all([getServices(), getSiteSettings()]);
  const sectionLive = siteSettings?.servicesSectionEnabled !== false;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="Manage service items including titles, descriptions, and images."
      >
        <Link
          href="/admin/services/new"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Plus className="size-4" />
          Add Service
        </Link>
      </AdminPageHeader>
      <AdminHomepageSectionLiveToggle
        module="services"
        initialEnabled={sectionLive}
        title="Services on live site"
        description="Homepage block and Services link in the main navigation. Matches Site Settings → Homepage sections."
      />
      {services.length === 0 ? (
        <AdminEmptyState
          title="No services yet"
          description="Add your first service to display on the website."
          action={
            <Link
              href="/admin/services/new"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="size-4" />
              Add Service
            </Link>
          }
        />
      ) : (
        <>
          <AdminTable headers={["Title", "Description", "Status"]}>
            {services.map((s) => (
              <AdminTableRow key={s._id}>
                <AdminTableCell className="font-medium text-foreground">
                  {s.title}
                </AdminTableCell>
                <AdminTableCell className="text-muted-foreground">
                  {stripHtml(s.description) || "—"}
                </AdminTableCell>
                <AdminTableCell>
                  <Badge variant={s.status === "Published" ? "default" : "secondary"}>
                    {s.status}
                  </Badge>
                </AdminTableCell>
                <AdminTableCell className="text-right">
                  <Link
                    href={`/admin/services/edit/${s._id}`}
                    className="inline-flex h-7 items-center text-[0.8rem] font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTable>
          <p className="text-xs text-muted-foreground">
            The site homepage shows up to 3 published services: “Show on homepage” first (newest), then the latest published to fill.
          </p>
        </>
      )}
    </div>
  );
}
