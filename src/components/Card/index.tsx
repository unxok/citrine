import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { create } from "zustand";
import { SortableItem } from "../SortableItem";
import { CARD_LS_KEY } from "@/lib/consts";
import { ReactNode } from "react";
import { ClassValue } from "clsx";
import { toast } from "sonner";

export type Card = {
  id: UniqueIdentifier;
  title?: string;
  lane?: string;
};

export const CardPresentational = ({
  className,
  children,
}: {
  className?: ClassValue;
  children?: ReactNode;
}) => (
  <div className={cn("w-full rounded-md border p-5", className)}>
    {children}
  </div>
);

export const CardDraggable = ({
  id,
  title,
}: {
  id: UniqueIdentifier;
  title?: string;
}) => {
  const { activeCard } = useCardStore();
  return (
    <SortableItem id={id} itemType="card" className="w-full">
      <CardPresentational
        className={activeCard?.id === id && "border-dashed text-muted"}
      >
        {title}
      </CardPresentational>
    </SortableItem>
  );
};

type CardStore = {
  cards?: Card[];
  activeCard?: Card | null;
  setActiveCardId: (id: UniqueIdentifier | null) => void;
  //   addCard: (lane: UniqueIdentifier) => Promise<number>;
  setCards: (callback: (cards?: Card[]) => Card[] | undefined) => void;
  saveCards: (cards?: Card[]) => void;
  loadCards: () => void;
};

export const useCardStore = create<CardStore>()((set, get) => ({
  cards: undefined,
  activeCard: undefined,
  setActiveCardId: (id) => {
    set((state) => ({
      ...state,
      activeCard: state?.cards?.find((c) => c.id === id) ?? null,
    }));
  },
  //   addCard: async (lane) => {
  //     const id: number = await db.cards.add({
  //       lane: lane.toString(),
  //       title: "Unnamed Card",
  //     });
  //     return id;
  //   },
  setCards: (callback) => {
    set((state) => {
      const newCards = callback(state.cards ? [...state?.cards] : undefined);
      //   if (JSON.stringify(newCards) === JSON.stringify(state?.cards)) {
      //     return state;
      //   }
      return {
        ...state,
        cards: newCards,
      };
    });
  },
  saveCards: async (cards) => {
    console.log("saving cards...");
    const newCards = cards ? cards : get().cards;
    localStorage.setItem(CARD_LS_KEY, JSON.stringify(newCards));
  },
  loadCards: async () => {
    const localCards = localStorage.getItem(CARD_LS_KEY);
    if (!localCards) return;
    try {
      const json = JSON.parse(localCards);
      set((state) => ({
        ...state,
        cards: json,
      }));
    } catch (e) {
      toast.error(
        "An error occurred when loading local data. Check console for more information",
      );
      console.log(e);
      console.log("Cards found in local storage: ", localCards);
    }
  },
}));
