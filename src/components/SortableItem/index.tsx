import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

export function SortableItem({
  id,
  className,
  children,
  disabled,
  itemType,
  asChild,
  boardId,
  ...props
}: {
  id: string | number;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  itemType: string;
  asChild?: boolean;
  boardId?: UniqueIdentifier;
  laneId?: UniqueIdentifier;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id,
      data: {
        itemType: itemType,
        boardId: boardId,
      },
    });

  const style = disabled
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className + " touch-none"}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </div>
  );
}
