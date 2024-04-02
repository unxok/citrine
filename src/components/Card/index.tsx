import { UniqueIdentifier } from "@dnd-kit/core";
import { useCardStore } from "./CardStore";
import { CardPresentational } from "./CardPresentational";
import { CardDialog } from "./CardDialog";
import { CardDraggable } from "./CardDraggable";

export type Card = {
  id: UniqueIdentifier;
  board?: UniqueIdentifier;
  lane?: UniqueIdentifier;
  title?: string;
  description?: string;
  notes?: string;
  showNotes?: boolean;
  created?: string;
  modified?: string;
};

export { useCardStore, CardPresentational, CardDialog, CardDraggable };
