"use client";

import Link from "next/link";

type Props = {
  adminBackHref: string;
  adminBackLabel: string;
};

export function PreviewEmptyState({ adminBackHref, adminBackLabel }: Props) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 bg-[#fafafa] px-4 py-16 text-center">
      <p className="max-w-md text-sm text-gray-600">
        No preview data. Use <strong className="font-medium text-foreground">Preview</strong> on the matching
        admin form (same site).
      </p>
      <Link
        href={adminBackHref}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {adminBackLabel}
      </Link>
    </div>
  );
}
