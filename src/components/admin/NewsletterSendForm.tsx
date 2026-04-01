"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { stripHtmlToText } from "@/lib/html-to-text";

type Subscriber = { id: string; email: string };

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

  const loadSubscribers = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/admin/newsletter", { credentials: "include", cache: "no-store" });
      const data = (await res.json()) as { success?: boolean; items?: Subscriber[] };
      if (res.ok && data.success && data.items) {
        setSubscribers(data.items.map((i) => ({ id: i.id, email: i.email })));
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
    setSelected((s) => ({ ...s, [email]: !s[email] }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSending(true);
    try {
      const html = messageHtmlRef.current?.() ?? "";
      if (!stripHtmlToText(html)) {
        setFeedback({ kind: "err", text: "Please enter a message." });
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
          setFeedback({ kind: "err", text: "Pick at least one subscriber, or use Send to all." });
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
        setFeedback({ kind: "err", text: data.message ?? "Send failed." });
        return;
      }
      setFeedback({
        kind: "ok",
        sent: typeof data.sent === "number" ? data.sent : 0,
        failed: typeof data.failed === "number" ? data.failed : 0,
      });
    } catch {
      setFeedback({ kind: "err", text: "Network error." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Uses the same SMTP settings as the contact form. Each address is emailed separately.
        {" "}
        <Link href="/admin/newsletter" className="text-primary underline-offset-4 hover:underline">
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
            Bounces (e.g. domain does not exist) arrive later from your mail provider and are not
            counted here.
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
              immediatelyRender
              placeholder="Write your update…"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(e) => setSendToAll(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Send to all subscribers
          </label>

          {!sendToAll ? (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm font-medium">Choose recipients</p>
              {loadingList ? (
                <p className="mt-2 text-sm text-muted-foreground">Loading list…</p>
              ) : subscribers.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No subscribers yet.</p>
              ) : (
                <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-sm">
                  {subscribers.map((s) => (
                    <li key={s.id}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(selected[s.email])}
                          onChange={() => toggleEmail(s.email)}
                          className="size-4 rounded border-input"
                        />
                        <span className="truncate">{s.email}</span>
                      </label>
                    </li>
                  ))}
                </ul>
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
