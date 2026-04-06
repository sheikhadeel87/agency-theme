import Link from "next/link";

type Props = {
  initialQ: string;
  initialStatus: string;
};

export function ContactMessagesFilters({ initialQ, initialStatus }: Props) {
  return (
    <form
      method="GET"
      action="/admin/contact-messages"
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-sm">
        <label htmlFor="contact-msg-search" className="text-xs font-medium text-muted-foreground">
          Search (name, email, subject)
        </label>
        <input
          id="contact-msg-search"
          name="q"
          type="search"
          defaultValue={initialQ}
          placeholder="Search…"
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-msg-status" className="text-xs font-medium text-muted-foreground">
          Status
        </label>
        <select
          id="contact-msg-status"
          name="status"
          defaultValue={initialStatus || "all"}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </button>
        <Link
          href="/admin/contact-messages"
          className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
