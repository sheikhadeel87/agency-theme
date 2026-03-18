"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deletePricingPlan } from "@/lib/actions/pricing-actions";

export function DeletePricingPlanButton({
  planId,
  planName,
}: {
  planId: string;
  planName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete plan “${planName}”? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deletePricingPlan(planId);
    setLoading(false);
    setConfirming(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-1 text-[0.8rem]">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="font-medium text-destructive hover:underline disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Confirm"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="font-medium text-muted-foreground hover:underline">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-[0.8rem] font-medium text-destructive underline-offset-4 hover:underline"
    >
      Delete
    </button>
  );
}
