"use client";

/**
 * Admin navigation editor: @dnd-kit sortable list (root + nested children).
 * Controlled: parent owns `items` / `onItemsChange` for persistence elsewhere.
 */

import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import type { NavChildItem, NavItem } from "@/lib/navigation";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavigationDraftChild = NavChildItem & { id: string };
export type NavigationDraftItem = Omit<NavItem, "children"> & {
  id: string;
  children?: NavigationDraftChild[];
};

const ROOT_CONTAINER = "root";

function SortableChildRow({
  child,
  onPatch,
  onRemove,
}: {
  child: NavigationDraftChild;
  onPatch: (id: string, patch: Partial<NavChildItem>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: child.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:gap-3",
        isDragging && "z-10 opacity-90 ring-2 ring-primary/30"
      )}
    >
      <button
        type="button"
        className="inline-flex size-9 shrink-0 cursor-grab items-center justify-center rounded-md border border-border bg-background text-muted-foreground active:cursor-grabbing"
        aria-label="Drag to reorder child"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Input
        value={child.label}
        onChange={(e) => onPatch(child.id, { label: e.target.value })}
        placeholder="Label"
        className="h-9 sm:max-w-[160px]"
      />
      <Input
        value={child.href}
        onChange={(e) => onPatch(child.id, { href: e.target.value })}
        placeholder="Href e.g. /#team"
        className="h-9 min-w-0 flex-1 font-mono text-sm"
      />
      <div className="flex items-center gap-2 sm:ml-auto">
        <Toggle enabled={child.isEnabled} onChange={(v) => onPatch(child.id, { isEnabled: v })} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(child.id)}
          aria-label="Remove child"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function SortableRootRow({
  item,
  onPatch,
  onRemove,
  onAddChild,
  patchChild,
  removeChild,
}: {
  item: NavigationDraftItem;
  onPatch: (id: string, patch: Partial<NavigationDraftItem>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  patchChild: (parentId: string, childId: string, patch: Partial<NavChildItem>) => void;
  removeChild: (parentId: string, childId: string) => void;
}) {
  const nestedId = `nested-${item.id}`;
  const childIds = item.children?.map((c) => c.id) ?? [];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        isDragging && "z-10 opacity-90 ring-2 ring-primary/30"
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
        <button
          type="button"
          className="inline-flex size-10 shrink-0 cursor-grab items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Label</label>
            <Input
              value={item.label}
              onChange={(e) => onPatch(item.id, { label: e.target.value })}
              placeholder="Menu label"
              className="h-10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Href</label>
            <Input
              value={item.href}
              onChange={(e) => onPatch(item.id, { href: e.target.value })}
              placeholder="/ or /#section"
              className="h-10 font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Visible</span>
            <Toggle enabled={item.isEnabled} onChange={(v) => onPatch(item.id, { isEnabled: v })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onAddChild(item.id)}>
              <Plus className="mr-1 size-3.5" />
              Add child
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {item.children && item.children.length > 0 && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              checked={item.appendDynamicPages === true}
              onChange={(e) => onPatch(item.id, { appendDynamicPages: e.target.checked })}
              className="rounded border-input"
            />
            Append published CMS pages after static children
          </label>
          <p className="text-xs text-muted-foreground">Child links (drag to reorder)</p>
          <SortableContext id={nestedId} items={childIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 pl-0 sm:pl-4">
              {item.children.map((c) => (
                <SortableChildRow
                  key={c.id}
                  child={c}
                  onPatch={(cid, patch) => patchChild(item.id, cid, patch)}
                  onRemove={(cid) => removeChild(item.id, cid)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}

export type NavigationDragDropEditorProps = {
  items: NavigationDraftItem[];
  onItemsChange: (next: NavigationDraftItem[]) => void;
};

export function NavigationDragDropEditor({ items, onItemsChange }: NavigationDragDropEditorProps) {
  const rootIds = useMemo(() => items.map((i) => i.id), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeSort = active.data.current?.sortable;
    const overSort = over.data.current?.sortable;
    if (!activeSort) return;

    const fromContainer = activeSort.containerId;
    const toContainer = overSort?.containerId ?? fromContainer;
    if (fromContainer !== toContainer) return;

    const oldIndex = activeSort.index;
    const newIndex = overSort?.index ?? oldIndex;
    if (oldIndex === newIndex) return;

    if (fromContainer === ROOT_CONTAINER) {
      onItemsChange(arrayMove(items, oldIndex, newIndex));
      return;
    }

    const parentId = String(fromContainer).replace(/^nested-/, "");
    onItemsChange(
      items.map((p) => {
        if (p.id !== parentId || !p.children) return p;
        return { ...p, children: arrayMove(p.children, oldIndex, newIndex) };
      })
    );
  }

  function patchItem(id: string, patch: Partial<NavigationDraftItem>) {
    onItemsChange(
      items.map((item) => (item.id === id ? ({ ...item, ...patch } as NavigationDraftItem) : item))
    );
  }

  function removeItem(id: string) {
    onItemsChange(items.filter((i) => i.id !== id));
  }

  function addItem() {
    onItemsChange([
      ...items,
      {
        id: crypto.randomUUID(),
        label: "New link",
        href: "/",
        isEnabled: true,
        order: items.length + 1,
      },
    ]);
  }

  function addChild(parentId: string) {
    onItemsChange(
      items.map((p) => {
        if (p.id !== parentId) return p;
        const children = [
          ...(p.children ?? []),
          {
            id: crypto.randomUUID(),
            label: "Item",
            href: "/",
            isEnabled: true,
            order: (p.children?.length ?? 0) + 1,
          },
        ];
        return { ...p, children };
      })
    );
  }

  function patchChild(parentId: string, childId: string, patch: Partial<NavChildItem>) {
    onItemsChange(
      items.map((p) => {
        if (p.id !== parentId || !p.children) return p;
        return {
          ...p,
          children: p.children.map((c) => (c.id === childId ? { ...c, ...patch } : c)),
        };
      })
    );
  }

  function removeChild(parentId: string, childId: string) {
    onItemsChange(
      items.map((p) => {
        if (p.id !== parentId || !p.children) return p;
        const children = p.children.filter((c) => c.id !== childId);
        return {
          ...p,
          children: children.length ? children : undefined,
          ...(children.length ? {} : { appendDynamicPages: false }),
        };
      })
    );
  }

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext id={ROOT_CONTAINER} items={rootIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.map((item) => (
              <SortableRootRow
                key={item.id}
                item={item}
                onPatch={patchItem}
                onRemove={removeItem}
                onAddChild={addChild}
                patchChild={patchChild}
                removeChild={removeChild}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" onClick={addItem}>
        <Plus className="mr-1.5 size-4" />
        Add menu item
      </Button>

      <p className="text-xs text-muted-foreground">
        Drag handles reorder items. Nested lists reorder only within the same dropdown. Order is 1-based when saved.
      </p>
    </div>
  );
}

/** Map persisted nav to stable draft ids for the editor. */
export function navigationWithStableIds(items: NavItem[]): NavigationDraftItem[] {
  return items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
    children: item.children?.map((c) => ({
      ...c,
      id: crypto.randomUUID(),
    })),
  }));
}
