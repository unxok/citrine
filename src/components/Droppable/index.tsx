import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

export const Droppable = ({
  id,
  children,
  className,
  disabled,
  itemType,
  boardId,
}: {
  id: UniqueIdentifier;
  children?: ReactNode;
  className?: string;
  disabled: boolean;
  itemType: string;
  boardId?: UniqueIdentifier;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
    disabled: disabled,
    data: { itemType: itemType, boardId: boardId },
  });

  return (
    <div className={className} ref={setNodeRef}>
      {children}
    </div>
  );
};
