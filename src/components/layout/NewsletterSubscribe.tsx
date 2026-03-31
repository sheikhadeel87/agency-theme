"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, SendHorizontal } from "lucide-react";

type Feedback =
  | { kind: "success"; text: string }
  | { kind: "info"; text: string }
  | { kind: "error"; text: string };

function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number
) {
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: T) => {
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}

export function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const emailRef = useRef(email);
  emailRef.current = email;
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  const runCheck = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setAlreadySubscribed(false);
      return;
    }
    try {
      const q = encodeURIComponent(trimmed.toLowerCase());
      const res = await fetch(`/api/newsletter/check?email=${q}`, { cache: "no-store" });
      if (!res.ok) return;
      if (emailRef.current.trim().toLowerCase() !== trimmed.toLowerCase()) return;
      const data = (await res.json()) as { subscribed?: boolean };
      if (data.subscribed === true) {
        setAlreadySubscribed(true);
        setFeedback({ kind: "info", text: "This email is already on our list." });
      } else {
        setAlreadySubscribed(false);
        setFeedback((f) => (f?.kind === "info" ? null : f));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const debouncedCheck = useDebouncedCallback(runCheck, 450);

  useEffect(() => {
    debouncedCheck(email);
  }, [email, debouncedCheck]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ kind: "error", text: "Enter your email address." });
      return;
    }
    if (alreadySubscribed) return;

    setPending(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };
      if (res.status === 201) {
        setFeedback({
          kind: "success",
          text: data.message ?? "You’re subscribed. Thank you!",
        });
        setEmail("");
        setAlreadySubscribed(false);
      } else if (res.status === 409) {
        setAlreadySubscribed(true);
        setFeedback({
          kind: "info",
          text: data.message ?? "You’re already on the list.",
        });
      } else {
        setFeedback({
          kind: "error",
          text: data.message ?? "Something went wrong. Try again.",
        });
      }
    } catch {
      setFeedback({ kind: "error", text: "Network error. Check your connection." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2"
        noValidate
        aria-labelledby="footer-newsletter"
      >
        <div className="flex gap-0 overflow-hidden rounded-full border border-border bg-card shadow-sm">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Email address"
            aria-label="Email for newsletter"
            value={email}
            onChange={(e) => {
              const v = e.target.value;
              setEmail(v);
              setAlreadySubscribed(false);
              setFeedback((f) => (f?.kind === "success" ? f : null));
            }}
            disabled={pending}
            className={
              alreadySubscribed
                ? "min-w-0 flex-1 bg-muted/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none sm:px-5"
                : "min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none sm:px-5"
            }
          />
          <button
            type="submit"
            disabled={pending || alreadySubscribed}
            title={alreadySubscribed ? "Already on the list" : "Subscribe to newsletter"}
            className={
              alreadySubscribed
                ? "flex shrink-0 items-center justify-center bg-emerald-600 px-3.5 py-2.5 text-white transition-colors sm:px-4"
                : "flex shrink-0 items-center justify-center bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700 disabled:opacity-70 sm:px-5"
            }
            aria-label={alreadySubscribed ? "Already on the list" : "Subscribe"}
          >
            {alreadySubscribed ? (
              <Check className="size-[1.125rem] shrink-0" strokeWidth={2.5} aria-hidden />
            ) : (
              <SendHorizontal className="size-5" />
            )}
          </button>
        </div>
      </form>
      {feedback ? (
        <p
          role="status"
          className={
            feedback.kind === "success"
              ? "mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              : feedback.kind === "info"
                ? "mt-2 text-xs text-sky-700 dark:text-sky-300"
                : "mt-2 text-xs font-medium text-destructive"
          }
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
