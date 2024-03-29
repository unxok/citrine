import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode, useEffect, useState } from "react";

export function SortableItem({
  id,
  className,
  children,
  disabled,
  itemType,
}: {
  id: string | number;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  itemType: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: id,
      data: {
        itemType: itemType,
      },
    });

  //   const [position, setPosition] = useState({
  //     x: 0,
  //     y: 0,
  //     scaleX: 1,
  //     scaleY: 1,
  //   });

  //   useEffect(() => {
  //     console.log(transform);
  //     if (!transform) return;
  //     setPosition((prev) => {
  //       const newX = transform.x;
  //       const newY = transform.y;
  //       if (newX === prev.x && newY === prev.y) {
  //         return prev;
  //       }
  //       return { ...prev, x: newX, y: newY };
  //     });
  //   }, [transform]);

  //   useEffect(() => console.log("transform: ", transform), [transform]);

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
      className={className}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}
