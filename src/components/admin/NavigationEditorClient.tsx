"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { serializeNavigationForSave, type NavItem } from "@/lib/navigation";
import { saveSiteNavigation } from "@/lib/site-settings-api";
import {
  NavigationDragDropEditor,
  navigationWithStableIds,
} from "@/components/admin/navigation/NavigationDragDropEditor";

type Props = {
  initialNavigation: NavItem[];
};

export function NavigationEditorClient({ initialNavigation }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(() => navigationWithStableIds(initialNavigation));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const navigation = serializeNavigationForSave(items);
    const result = await saveSiteNavigation(navigation);
    if (!result.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    router.refresh();
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <NavigationDragDropEditor items={items} onItemsChange={setItems} />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save navigation"}
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Disabled items are hidden on the live site. Dropdowns use child links; parent href is ignored when children exist.
      </p>
    </div>
  );
}
