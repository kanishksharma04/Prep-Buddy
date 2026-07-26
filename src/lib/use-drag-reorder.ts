"use client";

import { useState } from "react";

// Native HTML5 drag-and-drop, split into "handle" props (start/end the drag
// gesture — attach to a small grip icon so dragging doesn't fight with
// buttons/checkboxes elsewhere in the row) and "target" props (attach to
// the whole row, since the pointer needs to be trackable over the entire
// item, not just its handle, to know what it's hovering).
export function useDragReorder<T extends { id: string }>(
  items: T[],
  onReorder: (orderedIds: string[]) => void,
) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function reordered(): T[] {
    if (!dragId || !overId || dragId === overId) return items;
    const fromIndex = items.findIndex((item) => item.id === dragId);
    const toIndex = items.findIndex((item) => item.id === overId);
    if (fromIndex === -1 || toIndex === -1) return items;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }

  const displayItems = reordered();

  function getHandleProps(id: string) {
    return {
      draggable: true,
      onDragStart(event: React.DragEvent) {
        setDragId(id);
        event.dataTransfer.effectAllowed = "move";
      },
      onDragEnd() {
        if (dragId && overId && dragId !== overId) {
          onReorder(reordered().map((item) => item.id));
        }
        setDragId(null);
        setOverId(null);
      },
    };
  }

  function getTargetProps(id: string) {
    return {
      onDragOver(event: React.DragEvent) {
        if (!dragId) return;
        event.preventDefault();
        if (id !== overId) setOverId(id);
      },
      onDrop(event: React.DragEvent) {
        event.preventDefault();
      },
    };
  }

  return {
    displayItems,
    getHandleProps,
    getTargetProps,
    isDragging: dragId !== null,
    isItemDragging: (id: string) => dragId === id,
  };
}
