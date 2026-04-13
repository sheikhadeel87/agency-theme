"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openAdminPreview } from "@/lib/admin-preview";
import {
  NavigationDragDropEditor,
  type NavigationDraftItem,
} from "@/components/admin/navigation/NavigationDragDropEditor";
import {
  getDefaultFooterColumns,
  reindexFooterColumns,
  type FooterColumn,
} from "@/lib/footer-links";
import { saveFooterColumns } from "@/lib/site-settings-api";
import { toast } from "sonner";

function footerColumnsToDraft(cols: FooterColumn[]): NavigationDraftItem[] {
  return cols.map((c) => ({
    id: crypto.randomUUID(),
    label: c.title,
    href: "/",
    isEnabled: true,
    order: c.order,
    appendDynamicPages: false,
    children: c.links.map((l) => ({
      id: crypto.randomUUID(),
      label: l.label,
      href: l.href,
      isEnabled: true,
      order: l.order,
      ...(l.sectionKey ? { sectionKey: l.sectionKey } : {}),
    })),
  }));
}

function draftToFooterColumns(items: NavigationDraftItem[]): FooterColumn[] {
  return reindexFooterColumns(
    items
      .filter((i) => i.isEnabled !== false)
      .map((item) => ({
        title: item.label.trim(),
        order: item.order,
        links: (item.children ?? [])
          .filter((c) => c.isEnabled !== false)
          .map((c) => ({
            label: c.label.trim(),
            href: c.href.trim(),
            order: c.order,
            ...(c.sectionKey ? { sectionKey: c.sectionKey } : {}),
          })),
      }))
  );
}

type Props = {
  initialFooterColumns: FooterColumn[];
};

export function FooterLinksEditorClient({ initialFooterColumns }: Props) {
  const router = useRouter();
  const seed =
    initialFooterColumns.length > 0 ? initialFooterColumns : getDefaultFooterColumns();
  const [items, setItems] = useState(() => footerColumnsToDraft(seed));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (items.length === 0) {
      const msg = "Add at least one footer column before saving.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setSaving(true);
    setError(null);
    let footerColumns: FooterColumn[];
    try {
      footerColumns = draftToFooterColumns(items);
      if (footerColumns.some((c) => !c.title.trim())) {
        throw new Error("Each column needs a title.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid footer data.";
      setError(msg);
      toast.error(msg);
      setSaving(false);
      return;
    }
    const result = await saveFooterColumns(footerColumns);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      setSaving(false);
      return;
    }
    toast.success("Footer links saved.");
    router.refresh();
    setSaving(false);
  }

  function handlePreview() {
    setError(null);
    try {
      if (items.length === 0) {
        toast.error("Add at least one column to preview.");
        return;
      }
      const footerColumns = draftToFooterColumns(items);
      if (footerColumns.some((c) => !c.title.trim())) {
        toast.error("Each column needs a title before preview.");
        return;
      }
      openAdminPreview("site-settings", { footerColumns });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not open preview.";
      setError(msg);
      toast.error(msg);
    }
  }

  function handleCancel() {
    router.push("/admin/site-settings");
  }

  return (
    <div className="space-y-6">
      <NavigationDragDropEditor variant="footer" items={items} onItemsChange={setItems} />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" className="gap-2" onClick={handlePreview}>
          <Eye className="size-4" />
          Preview
        </Button>
        <Button type="button" variant="default" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
