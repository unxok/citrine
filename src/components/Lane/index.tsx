import { UniqueIdentifier } from "@dnd-kit/core";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { PlusIcon } from "lucide-react";
import { Card, CardDraggable, CardPresentational, CardDialog } from "../Card";
import { Droppable } from "../Droppable";
import { Button } from "../ui/button";

export type Lane = {
  id: UniqueIdentifier;
  board: UniqueIdentifier;
  title?: string;
};

export const LaneDraggable = ({
  id,
  board,
  title,
  cards,
}: Lane & { cards?: Card[] }) => {
  const isEmpty = !cards?.length;
  return (
    <SortableContext
      id={id.toString()}
      items={cards ?? []}
      strategy={verticalListSortingStrategy}
    >
      <Droppable
        id={id}
        className={`relative flex h-fit w-0 min-w-60 flex-1 flex-col items-center justify-center border bg-secondary/30 p-5`}
        disabled={isEmpty ? false : true}
        itemType="lane"
      >
        <div className="flex w-full flex-row items-center justify-center gap-2 pb-3">
          <div className="text-lg font-semibold tracking-widest">{title}</div>
          <div className="text-sm text-muted-foreground">{cards?.length}</div>
        </div>
        <div className="flex h-full max-h-full w-full flex-col items-start justify-start gap-5">
          {cards?.map(
            ({ id, ...props }) =>
              id !== undefined && (
                <CardDraggable key={"card-" + id} id={id} {...props} />
              ),
          )}
        </div>
        {isEmpty && (
          <CardPresentational className="border-transparent bg-transparent text-center text-muted-foreground hover:cursor-not-allowed">
            <i>Drag cards here or use the button below to add one</i>
          </CardPresentational>
        )}
        <div className="w-full pt-3">
          <AddCardButton laneId={id} boardId={board} />
        </div>
      </Droppable>
    </SortableContext>
  );
};

export const AddCardButton = ({
  laneId,
  boardId,
}: {
  laneId: UniqueIdentifier;
  boardId: UniqueIdentifier;
}) => {
  return (
    <CardDialog
      laneId={laneId}
      boardId={boardId}
      defaultMode="edit"
      trigger={
        <Button variant={"outline"} className="w-full bg-primary">
          <PlusIcon />
        </Button>
      }
    ></CardDialog>
  );
};
