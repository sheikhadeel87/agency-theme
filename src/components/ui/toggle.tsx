"use client";

import { cn } from "@/lib/utils";

export type ToggleProps = {
  enabled: boolean;
  onChange: (value: boolean) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
};

export function Toggle({ enabled, onChange, id, className, disabled }: ToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? "Enabled" : "Disabled"}
        id={id}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-7 w-11 shrink-0 rounded-full border border-border/80 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          enabled ? "bg-primary" : "bg-muted",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm ring-1 ring-border/60 transition-transform duration-200 ease-out",
            enabled && "translate-x-5",
          )}
          aria-hidden
        />
      </button>
      <span
        className={cn(
          "min-w-[4.5rem] text-sm font-medium tabular-nums",
          enabled ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500",
        )}
        aria-live="polite"
      >
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}
