"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Row = { id: string; email: string; createdAt: string };

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadCsv(rows: Row[]) {
  const header = "email,subscribed_at";
  const body = rows.map((row) => `${csvCell(row.email)},${csvCell(row.createdAt)}`).join("\n");
  const csv = body ? `${header}\n${body}` : header;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "newsletter-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function NewsletterSubscribersSection() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/newsletter", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as { success?: boolean; message?: string; items?: Row[] };
      if (!res.ok || !data.success || !data.items) {
        setError(data.message ?? "Could not load.");
        setItems([]);
        return;
      }
      setItems(data.items);
    } catch {
      setError("Network error.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => i.email.toLowerCase().includes(s));
  }, [items, q]);

  const visibleIdSet = useMemo(() => new Set(filtered.map((r) => r.id)), [filtered]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (visibleIdSet.has(id)) next.add(id);
      }
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!next.has(id)) return next;
        }
        return prev;
      }
      return next;
    });
  }, [visibleIdSet]);

  const rowsForExport = useMemo(() => {
    const picked = filtered.filter((r) => selectedIds.has(r.id));
    if (picked.length > 0) return picked;
    return filtered;
  }, [filtered, selectedIds]);

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.has(r.id));
  const someVisibleSelected = filtered.some((r) => selectedIds.has(r.id));
  const selectAllRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const el = selectAllRef.current;
    if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [someVisibleSelected, allVisibleSelected]);

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      if (filtered.length === 0) return prev;
      const allSelected = filtered.every((r) => prev.has(r.id));
      const next = new Set(prev);
      if (allSelected) {
        for (const r of filtered) next.delete(r.id);
      } else {
        for (const r of filtered) next.add(r.id);
      }
      return next;
    });
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Remove ${email}?`)) return;
    const prev = items;
    setItems((x) => x.filter((i) => i.id !== id));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/newsletter/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        setItems(prev);
        setError(data.message ?? "Delete failed.");
      }
    } catch {
      setItems(prev);
      setError("Network error.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter"
        description="Subscribers from the public footer signup. Search and remove addresses."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="default"
            disabled={rowsForExport.length === 0}
            onClick={() => downloadCsv(rowsForExport)}
          >
            Export CSV
          </Button>
          <Link
            href="/admin/newsletter/send"
            className={cn(buttonVariants({ variant: "default", size: "default" }))}
          >
            Send newsletter
          </Link>
        </div>
      </AdminPageHeader>

      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-border bg-card p-8 shadow-sm">
            <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{items.length}</span> subscribers
                {q.trim() ? ` · ${filtered.length} shown` : null}
                {selectedIds.size > 0 ? (
                  <span className="text-foreground"> · {selectedIds.size} selected</span>
                ) : null}
              </p>
              <Input
                className="sm:max-w-xs"
                type="search"
                placeholder="Filter email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {items.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">No subscribers yet.</p>
            ) : filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">No matches.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 pr-0">
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          className="size-4 rounded border-input accent-primary"
                          checked={allVisibleSelected}
                          onChange={() => toggleSelectAllVisible()}
                          aria-label="Select all visible rows"
                        />
                      </TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="w-10 pr-0">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-input accent-primary"
                            checked={selectedIds.has(row.id)}
                            onChange={() => toggleRow(row.id)}
                            aria-label={`Select ${row.email}`}
                          />
                        </TableCell>
                        <TableCell className="max-w-[min(100vw,24rem)] truncate font-medium">
                          {row.email}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 text-white hover:bg-red-700"
                            disabled={deletingId === row.id}
                            onClick={() => void remove(row.id, row.email)}
                          >
                            <Trash2 className="size-3.5" />
                            <span className="ml-1">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
