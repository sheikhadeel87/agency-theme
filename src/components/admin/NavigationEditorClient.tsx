"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serializeNavigationForSave, type NavItem } from "@/lib/navigation";
import { openAdminPreview } from "@/lib/admin-preview";
import { saveSiteNavigation } from "@/lib/site-settings-api";
import {
  NavigationDragDropEditor,
  navigationWithStableIds,
} from "@/components/admin/navigation/NavigationDragDropEditor";
import { toast } from "sonner";

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
      toast.error(result.error);
      setSaving(false);
      return;
    }
    toast.success("Navigation saved.");
    router.refresh();
    setSaving(false);
  }

  function handlePreview() {
    setError(null);
    try {
      const navigation = serializeNavigationForSave(items);
      openAdminPreview("site-settings", { navigation });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not open preview.";
      setError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-6">
      <NavigationDragDropEditor items={items} onItemsChange={setItems} />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="button" variant="default" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/site-settings")}>
          Cancel
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
