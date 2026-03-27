"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Eye, Trash2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContactMessageListItem } from "@/lib/contact-messages-query";
import type { ContactMessageStatus } from "@/models/ContactMessage";
import {
  deleteContactMessage,
  markContactMessageRead,
  updateContactMessageStatus,
} from "@/lib/actions/contact-message-actions";
import { cn } from "@/lib/utils";

/** One-line preview; CSS `truncate` on the cell does the visual ellipsis. */
function previewText(s: string, max = 72): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusBadgeVariant(
  s: ContactMessageStatus
): "default" | "secondary" | "outline" {
  if (s === "new") return "default";
  if (s === "read") return "secondary";
  return "outline";
}

type Props = {
  items: ContactMessageListItem[];
  q: string;
  statusFilter: string;
  page: number;
  totalPages: number;
};

export function ContactMessagesTable({
  items,
  q,
  statusFilter,
  page,
  totalPages,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<ContactMessageListItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function hrefForPage(p: number): string {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/admin/contact-messages?${qs}` : "/admin/contact-messages";
  }

  function handleDelete(id: string, label: string) {
    if (!confirm(`Delete message from “${label}”? This cannot be undone.`)) return;
    setBusyId(id);
    startTransition(async () => {
      const r = await deleteContactMessage(id);
      setBusyId(null);
      if (r.error) {
        alert(r.error);
        return;
      }
      setSelected((s) => (s?._id === id ? null : s));
      router.refresh();
    });
  }

  function handleMarkRead(id: string) {
    setBusyId(id);
    startTransition(async () => {
      const r = await markContactMessageRead(id);
      setBusyId(null);
      if (r.error) {
        alert(r.error);
        return;
      }
      router.refresh();
      setSelected((s) =>
        s?._id === id ? { ...s, status: "read" as const } : s
      );
    });
  }

  function handleStatusChange(id: string, status: ContactMessageStatus) {
    setBusyId(id);
    startTransition(async () => {
      const r = await updateContactMessageStatus(id, status);
      setBusyId(null);
      if (r.error) {
        alert(r.error);
        return;
      }
      router.refresh();
      setSelected((s) => (s?._id === id ? { ...s, status } : s));
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card ring-1 ring-foreground/10">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[960px] table-fixed border-collapse">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[11%] min-w-0 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Full name
                </TableHead>
                <TableHead className="w-[15%] min-w-0 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </TableHead>
                <TableHead className="w-[10%] min-w-0 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </TableHead>
                <TableHead className="w-[12%] min-w-0 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject
                </TableHead>
                <TableHead className="w-[22%] min-w-0 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Message
                </TableHead>
                <TableHead className="w-[8%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-[14%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Submitted
                </TableHead>
                <TableHead className="w-[18%] px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="border-b px-3 py-3 align-top whitespace-normal min-w-0 overflow-hidden">
                    <span className="block max-w-full truncate font-medium text-foreground" title={row.fullName}>
                      {row.fullName}
                    </span>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-top whitespace-normal min-w-0 overflow-hidden">
                    <span
                      className="block max-w-full truncate text-sm text-muted-foreground"
                      title={row.email}
                    >
                      {row.email}
                    </span>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-top whitespace-normal min-w-0 overflow-hidden">
                    <span className="block max-w-full truncate text-sm text-muted-foreground" title={row.phone}>
                      {row.phone || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-top whitespace-normal min-w-0 overflow-hidden">
                    <span className="block max-w-full truncate text-sm" title={row.subject}>
                      {row.subject || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-top whitespace-normal min-w-0 overflow-hidden">
                    <span
                      className="block max-w-full truncate text-sm text-muted-foreground"
                      title={row.message}
                    >
                      {previewText(row.message)}
                    </span>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-middle whitespace-nowrap">
                    <Badge
                      variant={statusBadgeVariant(row.status)}
                      className="capitalize"
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-top">
                    <span className="block text-xs leading-snug text-muted-foreground whitespace-normal">
                      {formatSubmittedAt(row.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="border-b px-3 py-3 align-top text-right">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex flex-wrap justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-primary hover:bg-muted"
                        >
                          <Eye className="size-3.5" />
                          View
                        </button>
                        {row.status === "new" && (
                          <button
                            type="button"
                            disabled={busyId === row._id || pending}
                            onClick={() => handleMarkRead(row._id)}
                            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
                          >
                            <CheckCircle className="size-3.5" />
                            Read
                          </button>
                        )}
                      </div>
                      <select
                        aria-label={`Status for ${row.fullName}`}
                        disabled={busyId === row._id || pending}
                        value={row.status}
                        onChange={(e) =>
                          handleStatusChange(row._id, e.target.value as ContactMessageStatus)
                        }
                        className="h-8 w-full max-w-[9rem] rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="new">new</option>
                        <option value="read">read</option>
                        <option value="replied">replied</option>
                      </select>
                      <button
                        type="button"
                        disabled={busyId === row._id || pending}
                        onClick={() => handleDelete(row._id, row.fullName)}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={hrefForPage(page - 1)}
              aria-disabled={page <= 1}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page <= 1 && "pointer-events-none opacity-50"
              )}
            >
              Previous
            </Link>
            <Link
              href={hrefForPage(page + 1)}
              aria-disabled={page >= totalPages}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                page >= totalPages && "pointer-events-none opacity-50"
              )}
            >
              Next
            </Link>
          </div>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-msg-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <div
            className={cn(
              "relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-lg"
            )}
          >
            <h2 id="contact-msg-title" className="text-lg font-semibold text-foreground">
              Message from {selected.fullName}
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Phone</dt>
                <dd>{selected.phone || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Subject</dt>
                <dd>{selected.subject || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Submitted</dt>
                <dd>{formatSubmittedAt(selected.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={statusBadgeVariant(selected.status)}>
                    {selected.status}
                  </Badge>
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">Message</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{selected.message}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
              {selected.status === "new" && (
                <Button type="button" onClick={() => handleMarkRead(selected._id)}>
                  Mark as read
                </Button>
              )}
              {selected.status !== "replied" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleStatusChange(selected._id, "replied")}
                >
                  Mark as replied
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
