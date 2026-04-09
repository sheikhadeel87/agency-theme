import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AuditLogsFilterBar } from "@/components/admin/AuditLogsFilterBar";
import {
  ADMIN_AUDIT_LOG_PAGE_SIZE,
  adminAuditLogsQueryString,
  hasActiveAuditFilters,
  parseAdminAuditLogSearchParams,
} from "@/lib/admin-audit-logs-params";
import { getAdminAuditLogFilterOptions, getAdminAuditLogsPage } from "@/lib/admin-audit-logs-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function formatWhen(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const parsed = parseAdminAuditLogSearchParams(sp);
  const [data, filterOptions] = await Promise.all([
    getAdminAuditLogsPage(parsed),
    getAdminAuditLogFilterOptions(),
  ]);
  const { items, total, totalPages, page } = data;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;
  const qs = (p: number) => adminAuditLogsQueryString(parsed, { page: p });
  const filtered = hasActiveAuditFilters(parsed);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit logs"
        description="Filter by user, action, resource, description, and date. Combinable filters with pagination."
      />

      <AuditLogsFilterBar query={parsed} options={filterOptions} />

      {total === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            {filtered
              ? "No audit logs match your filters. Try adjusting or reset."
              : "No audit logs found."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {total} total entr{total === 1 ? "y" : "ies"}
          </p>
          <div className="overflow-x-auto rounded-xl border border-border bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="whitespace-nowrap">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-foreground">{row.actorLabel}</TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                      {row.action}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.resource}</TableCell>
                    <TableCell className="min-w-0 max-w-md whitespace-normal break-words text-sm text-muted-foreground">
                      {row.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatWhen(row.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
            <Link
              href={`/admin/audit-logs${qs(page - 1)}`}
              className={
                hasPrev
                  ? "text-sm font-medium text-primary hover:underline"
                  : "pointer-events-none text-sm text-muted-foreground"
              }
              aria-disabled={!hasPrev}
            >
              Previous
            </Link>
            <span className="text-xs text-muted-foreground">
              {ADMIN_AUDIT_LOG_PAGE_SIZE} per page
            </span>
            <Link
              href={`/admin/audit-logs${qs(page + 1)}`}
              className={
                hasNext
                  ? "text-sm font-medium text-primary hover:underline"
                  : "pointer-events-none text-sm text-muted-foreground"
              }
              aria-disabled={!hasNext}
            >
              Next
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
