"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Row = { id: string; email: string; createdAt: string };

export function NewsletterAdminTable() {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function remove(id: string, email: string) {
    if (!confirm(`Remove ${email}?`)) return;
    const prev = items;
    setItems((x) => x.filter((i) => i.id !== id));
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

  if (loading) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-border bg-card p-8 shadow-sm">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{items.length}</span> subscribers
            {q.trim() ? ` · ${filtered.length} shown` : null}
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
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[min(100vw,24rem)] truncate font-medium">{row.email}</TableCell>
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
    </div>
  );
}
