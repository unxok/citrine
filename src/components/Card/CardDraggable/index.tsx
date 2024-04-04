import { SortableItem } from "@/components/SortableItem";
import { Card, useCardStore, CardPresentational, CardDialog } from "..";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import { ReactNode, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useViewStore } from "@/components/View";
import { CARD } from "@/lib/consts";

export const CardDraggable = (props: Card) => {
  const { id, board, lane, showNotes } = props;
  if (!lane || !board) {
    // TODO deal with this
    return;
  }
  const [isHover, setIsHover] = useState(false);

  const { activeCard, addCard, saveCards } = useCardStore();
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const updateShowNotes = (b: boolean) => {
    // console.log("got b: ", b);
    addCard({
      ...props,
      showNotes: !b,
    });
    saveCards();
  };

  return (
    <TooltipProvider>
      <CardContextMenuWrapper>
        <SortableItem
          id={id}
          itemType="card"
          boardId={board}
          laneId={lane}
          className="w-full"
          onMouseEnter={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
        >
          <CardContextMenuTrigger>
            <CardPresentational
              tooltip={
                <CardTooltip
                  {...props}
                  isHover={isHover}
                  setIsHover={setIsHover}
                  includeDefaultData
                />
              }
              className={activeCard?.id === id ? "opacity-25" : ""}
              {...props}
            />
          </CardContextMenuTrigger>
        </SortableItem>
        <CardContextMenuContent
          showNotes={!!!showNotes}
          setShowNotes={updateShowNotes}
          setEditOpen={setDialogEditOpen}
          cardId={props.id}
        />
      </CardContextMenuWrapper>
      <CardDialog
        laneId={lane}
        boardId={board}
        defaultData={{ ...props }}
        open={dialogEditOpen}
        setOpen={setDialogEditOpen}
      />
    </TooltipProvider>
  );
};

export const CardTooltip = ({
  id,
  lane,
  board,
  notes,
  created,
  modified,
  isHover,
  setIsHover,
  data,
  includeDefaultData,
  triggerClassName,
  contentClassName,
}: Card & {
  isHover: boolean;
  setIsHover: (b: boolean) => void;
  data?: ReactNode;
  includeDefaultData?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
}) => {
  //
  return (
    <Tooltip open={isHover} onOpenChange={(b) => setIsHover(b)}>
      <TooltipTrigger
        className={cn(`absolute right-0 top-10`, triggerClassName)}
      ></TooltipTrigger>
      <TooltipContent className={cn(`text-muted-foreground`, contentClassName)}>
        {data}
        {includeDefaultData && (
          <>
            <div>Id: {id}</div>
            <div>Lane: {lane}</div>
            <div>Board: {board}</div>
            <div className="flex items-center justify-start gap-2">
              Notes: <Checkbox checked={!!notes} />
            </div>
            <div>Created: {created}</div>
            <div>Modified: {modified}</div>
          </>
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export const CardContextMenuWrapper = ContextMenu;
export const CardContextMenuTrigger = ContextMenuTrigger;
export const CardContextMenuContent = ({
  setEditOpen,
  showNotes,
  setShowNotes,
  cardId,
}: {
  setEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showNotes: boolean;
  setShowNotes: (b: boolean) => void;
  cardId: Card["id"];
}) => {
  const { deleteCard, saveCards } = useCardStore();
  const { setView } = useViewStore();
  return (
    <ContextMenuContent>
      <ContextMenuItem
        onClick={() => {
          setView({ itemId: cardId, itemType: CARD });
        }}
      >
        View
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => {
          setEditOpen(true);
        }}
      >
        Edit
      </ContextMenuItem>
      <ContextMenuItem
        onClick={() => {
          // TODO make this do a dialog
          const confirmation = window.confirm(
            "Are you sure? You can't undo this!",
          );
          if (confirmation) {
            deleteCard(cardId);
            saveCards();
          }
        }}
      >
        Delete
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuCheckboxItem
        checked={showNotes}
        onCheckedChange={setShowNotes}
      >
        Hide notes
      </ContextMenuCheckboxItem>
    </ContextMenuContent>
  );
};
