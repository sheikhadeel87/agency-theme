"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stripHtmlToText } from "@/lib/html-to-text";
import { toast } from "sonner";

type Subscriber = { id: string; email: string; name?: string };

type SendFeedback =
  | { kind: "ok"; sent: number; failed: number }
  | { kind: "err"; text: string };

export function NewsletterSendForm() {
  const messageHtmlRef = useRef<(() => string) | null>(null);

  const [subject, setSubject] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loadingList, setLoadingList] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<SendFeedback | null>(null);

  const [recipientOpen, setRecipientOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");

  const loadSubscribers = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/newsletter", {
        credentials: "include",
        cache: "no-store",
      });

      const data = (await res.json()) as {
        success?: boolean;
        items?: Subscriber[];
      };

      if (res.ok && data.success && data.items) {
        setSubscribers(
          data.items.map((i) => ({
            id: i.id,
            email: i.email,
            name: i.name,
          }))
        );
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadSubscribers();
  }, [loadSubscribers]);

  function toggleEmail(email: string) {
    setSelected((prev) => ({
      ...prev,
      [email]: !prev[email],
    }));
  }

  const filteredSubscribers = useMemo(() => {
    const q = recipientQuery.trim().toLowerCase();

    if (!q) return subscribers;

    return subscribers.filter((subscriber) => {
      const email = subscriber.email.toLowerCase();
      const name = subscriber.name?.toLowerCase() ?? "";

      return email.includes(q) || name.includes(q);
    });
  }, [recipientQuery, subscribers]);

  const selectedSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => selected[subscriber.email]);
  }, [subscribers, selected]);

  function selectFilteredRecipients() {
    setSelected((prev) => {
      const next = { ...prev };

      filteredSubscribers.forEach((subscriber) => {
        next[subscriber.email] = true;
      });

      return next;
    });
  }

  function clearFilteredRecipients() {
    setSelected((prev) => {
      const next = { ...prev };

      filteredSubscribers.forEach((subscriber) => {
        delete next[subscriber.email];
      });

      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSending(true);

    try {
      const html = messageHtmlRef.current?.() ?? "";

      if (!stripHtmlToText(html)) {
        const t = "Please enter a message.";
        setFeedback({ kind: "err", text: t });
        toast.error(t);
        setSending(false);
        return;
      }

      const body: { subject: string; message: string; emails?: string[] } = {
        subject,
        message: html,
      };

      if (!sendToAll) {
        const emails = Object.entries(selected)
          .filter(([, on]) => on)
          .map(([email]) => email);

        if (emails.length === 0) {
          const t = "Pick at least one subscriber, or use Send to all.";
          setFeedback({ kind: "err", text: t });
          toast.error(t);
          setSending(false);
          return;
        }

        body.emails = emails;
      }

      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        sent?: number;
        failed?: number;
      };

      if (!res.ok || !data.success) {
        const t = data.message ?? "Send failed.";
        setFeedback({ kind: "err", text: t });
        toast.error(t);
        return;
      }

      const sent = typeof data.sent === "number" ? data.sent : 0;
      const failed = typeof data.failed === "number" ? data.failed : 0;
      setFeedback({ kind: "ok", sent, failed });
      toast.success(
        failed > 0
          ? `Newsletter sent: ${sent} delivered, ${failed} failed.`
          : `Newsletter sent to ${sent} recipient${sent === 1 ? "" : "s"}.`
      );
    } catch {
      const t = "Network error.";
      setFeedback({ kind: "err", text: t });
      toast.error(t);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Uses the same SMTP settings as the contact form. Each address is emailed
        separately.{" "}
        <Link
          href="/admin/newsletter"
          className="text-primary underline-offset-4 hover:underline"
        >
          Manage subscribers
        </Link>
      </p>

      {feedback?.kind === "ok" ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-900 dark:text-emerald-100"
        >
          <p className="text-sm font-semibold">Send finished</p>
          <div className="mt-3 flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium text-emerald-800/90 dark:text-emerald-200/90">
                Sent (SMTP accepted)
              </p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {feedback.sent}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-800/90 dark:text-emerald-200/90">
                Failed or skipped
              </p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">
                {feedback.failed}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-800/80 dark:text-emerald-200/80">
            Bounces (e.g. domain does not exist) arrive later from your mail
            provider and are not counted here.
          </p>
        </div>
      ) : feedback?.kind === "err" ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm ring-1 ring-foreground/10 sm:p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="nl-subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="nl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              maxLength={300}
              className="mt-1"
              placeholder="March update"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Message
            </label>
            <BlogEditor
              defaultValue=""
              htmlGetterRef={messageHtmlRef}
              placeholder="Write your update…"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(e) => {
                setSendToAll(e.target.checked);
                if (e.target.checked) {
                  setRecipientOpen(false);
                }
              }}
              className="size-4 rounded border-input"
            />
            Send to all subscribers
          </label>

          {!sendToAll ? (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium">Choose recipients</p>

              {loadingList ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading list…
                </p>
              ) : subscribers.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No subscribers yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRecipientOpen((prev) => !prev)}
                      className="flex min-h-[44px] w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-left shadow-sm transition hover:border-foreground/20"
                    >
                      <span className="truncate text-sm text-foreground">
                        {selectedSubscribers.length > 0
                          ? `${selectedSubscribers.length} recipient${
                              selectedSubscribers.length > 1 ? "s" : ""
                            } selected`
                          : "Search and select recipients"}
                      </span>

                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          recipientOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {recipientOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-background shadow-lg">
                        <div className="border-b border-border p-3">
                          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={recipientQuery}
                              onChange={(e) =>
                                setRecipientQuery(e.target.value)
                              }
                              placeholder="Search by name or email..."
                              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={selectFilteredRecipients}
                              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background"
                            >
                              Select filtered
                            </button>

                            <button
                              type="button"
                              onClick={clearFilteredRecipients}
                              className="rounded-md border border-input px-3 py-1.5 text-xs font-medium"
                            >
                              Clear filtered
                            </button>
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredSubscribers.length === 0 ? (
                            <p className="px-3 py-4 text-sm text-muted-foreground">
                              No matching recipients found.
                            </p>
                          ) : (
                            filteredSubscribers.map((subscriber) => {
                              const isSelected = Boolean(
                                selected[subscriber.email]
                              );

                              return (
                                <button
                                  key={subscriber.id}
                                  type="button"
                                  onClick={() => toggleEmail(subscriber.email)}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                                    isSelected
                                      ? "bg-muted"
                                      : "hover:bg-muted/60"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    {subscriber.name ? (
                                      <p className="truncate text-sm font-medium text-foreground">
                                        {subscriber.name}
                                      </p>
                                    ) : null}

                                    <p className="truncate text-sm text-muted-foreground">
                                      {subscriber.email}
                                    </p>
                                  </div>

                                  <span
                                    className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                                      isSelected
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-input"
                                    }`}
                                  >
                                    {isSelected ? (
                                      <Check className="h-3.5 w-3.5" />
                                    ) : null}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                          {filteredSubscribers.length} result
                          {filteredSubscribers.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedSubscribers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSubscribers.map((subscriber) => (
                        <div
                          key={subscriber.id}
                          className="flex max-w-full items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                        >
                          <span className="truncate">
                            {subscriber.name
                              ? `${subscriber.name} (${subscriber.email})`
                              : subscriber.email}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleEmail(subscriber.email)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          <Button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send newsletter"}
          </Button>
        </div>
      </div>
    </form>
  );
}