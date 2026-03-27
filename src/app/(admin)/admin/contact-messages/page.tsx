import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContactMessagesFilters } from "@/components/admin/ContactMessagesFilters";
import { ContactMessagesTable } from "@/components/admin/ContactMessagesTable";
import { getContactMessagesPaginated } from "@/lib/contact-messages-query";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

type SearchParams = {
  page?: string;
  q?: string;
  status?: string;
};

export default async function AdminContactMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" ? sp.status : "";

  const data = await getContactMessagesPaginated({
    page,
    limit: PAGE_SIZE,
    q,
    status: status === "all" ? "" : status,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact messages"
        description="Submissions from the public contact form. Search, filter by status, and update read state."
      />
      <ContactMessagesFilters initialQ={q} initialStatus={status || "all"} />
      {data.total === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            {q.trim() || (status && status !== "all")
              ? "No messages match your filters."
              : "No contact messages yet."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {data.items.length} of {data.total} message{data.total === 1 ? "" : "s"} (newest
            first).
          </p>
          <ContactMessagesTable
            items={data.items}
            q={q}
            statusFilter={status}
            page={data.page}
            totalPages={data.totalPages}
          />
        </>
      )}
    </div>
  );
}
