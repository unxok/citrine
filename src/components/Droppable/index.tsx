import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

export const Droppable = ({
  id,
  children,
  className,
  disabled,
}: {
  id: UniqueIdentifier;
  children?: ReactNode;
  className?: string;
  disabled: boolean;
}) => {
  const { setNodeRef } = useDroppable({ id: id, disabled: disabled });
  console.log("disabled on ", id, " is: ", disabled);

  return (
    <div className={className} ref={setNodeRef}>
      {children}
    </div>
  );
};
