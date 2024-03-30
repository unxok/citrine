import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { create } from "zustand";
import { SortableItem } from "../SortableItem";
import { CARD_LS_KEY } from "@/lib/consts";
import { ReactNode, Ref, forwardRef } from "react";
import { ClassValue } from "clsx";
import { db } from "@/db";

export type Card = {
  id: UniqueIdentifier;
  title?: string;
  lane: string;
  orderId: number;
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
  addCard: (card: Card) => void;
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
  addCard: (card) => {
    set((state) => ({
      ...state,
      cards: state.cards ? [...state.cards, card] : [card],
    }));
  },
  setCards: (callback) => {
    set((state) => {
      const newCards = callback(state.cards ? [...state?.cards] : undefined);
      if (JSON.stringify(newCards) === JSON.stringify(state?.cards)) {
        return state;
      }
      return {
        ...state,
        cards: newCards,
      };
    });
  },
  saveCards: async (cards) => {
    // setTimeout(() => {
    const newCards = cards ? cards : get().cards;
    const withUid = newCards?.map((c, i) => ({
      ...c,
      orderId: i,
    }));
    console.log("starting local save", withUid);
    await db.cards.bulkPut(withUid || []);
    const done = await db.cards.toArray();
    console.log("local save done", done);
    // }, 0);
  },
  loadCards: async () => {
    const dbCards = await db.cards.toArray();
    const sorted = dbCards.toSorted((a, b) => a.orderId - b.orderId);
    console.log("sorted: ", sorted);
    set((state) => ({
      ...state,
      cards: sorted,
    }));
  },
}));
