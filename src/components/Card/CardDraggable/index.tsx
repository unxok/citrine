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
import { useState } from "react";

export const CardDraggable = (props: Card) => {
  const { id, board, lane, showNotes } = props;
  if (!lane || !board) {
    // TODO deal with this
    return;
  }
  const { activeCard, addCard, saveCards } = useCardStore();
  const [dialogEditOpen, setDialogEditOpen] = useState(false);
  const [dialogViewOpen, setDialogViewOpen] = useState(false);
  const updateShowNotes = (b: boolean) => {
    console.log("got b: ", b);
    addCard({
      ...props,
      showNotes: !b,
    });
    saveCards();
  };

  return (
    <>
      <CardContextMenuWrapper>
        <SortableItem id={id} itemType="card" className="w-full">
          <CardContextMenuTrigger>
            <CardPresentational
              className={activeCard?.id === id ? "opacity-25" : ""}
              {...props}
            />
          </CardContextMenuTrigger>
        </SortableItem>
        <CardContextMenuContent
          showNotes={!!!showNotes}
          setShowNotes={updateShowNotes}
          setViewOpen={setDialogViewOpen}
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
        defaultMode={"edit"}
      />
      <CardDialog
        laneId={lane}
        boardId={board}
        defaultData={{ ...props }}
        open={dialogViewOpen}
        setOpen={setDialogViewOpen}
        defaultMode={"view"}
      />
    </>
  );
};

export const CardContextMenuWrapper = ContextMenu;
export const CardContextMenuTrigger = ContextMenuTrigger;
export const CardContextMenuContent = ({
  setViewOpen,
  setEditOpen,
  showNotes,
  setShowNotes,
  cardId,
}: {
  setViewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showNotes: boolean;
  setShowNotes: (b: boolean) => void;
  cardId: Card["id"];
}) => {
  const { deleteCard, saveCards } = useCardStore();
  return (
    <ContextMenuContent>
      <ContextMenuItem
        onClick={() => {
          setViewOpen(true);
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
