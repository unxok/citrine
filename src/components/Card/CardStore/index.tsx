import { CARD_LS_KEY, CARDS_NEXT_ID_LS_KEY } from "@/lib/consts";
import { UniqueIdentifier } from "@dnd-kit/core";
import { toast } from "sonner";
import { create } from "zustand";
import { Card } from "..";

type CardStore = {
  cards?: Card[];
  activeCard?: Card | null;
  setActiveCardId: (id: UniqueIdentifier | null) => void;
  addCard: (newCard: Card) => void;
  deleteCard: (cardId: Card["id"]) => void;
  setCards: (callback: (cards?: Card[]) => Card[] | undefined) => void;
  saveCards: (cards?: Card[]) => void;
  nextAvailableId: number;
};

const loadCards: () => Card[] | undefined = () => {
  const localCards = localStorage.getItem(CARD_LS_KEY);
  if (!localCards) return;
  try {
    return JSON.parse(localCards);
  } catch (e) {
    toast.error(
      "An error occurred when loading local data. Check console for more information",
    );
    console.log(e);
    console.log("Cards found in local storage: ", localCards);
  }
};

const loadNextCardId = () => {
  const localNextId = localStorage.getItem(CARDS_NEXT_ID_LS_KEY);
  const num = Number(localNextId);
  // TODO is this the best way to check???
  if (!(num > 0)) return 1;
  return num;
};

export const useCardStore = create<CardStore>()((set, get) => ({
  cards: loadCards(),
  activeCard: undefined,
  setActiveCardId: (id) => {
    set((state) => ({
      ...state,
      activeCard: state?.cards?.find((c) => c.id === id) ?? null,
    }));
  },
  addCard: (newCard) => {
    set((state) => {
      const copy = state.cards ? [...state.cards] : [];
      const foundIndex = copy.findIndex((c) => c.id === newCard.id);
      copy[foundIndex] = newCard;
      return {
        ...state,
        cards:
          foundIndex === -1
            ? [...copy, { ...newCard, id: state.nextAvailableId }]
            : [...copy],
        nextAvailableId:
          foundIndex === -1 ? state.nextAvailableId + 1 : state.nextAvailableId,
      };
    });
  },
  deleteCard: (cardId) => {
    set((state) => ({
      ...state,
      cards: state?.cards?.filter((c) => c.id !== cardId),
    }));
  },
  setCards: (callback) => {
    set((state) => {
      const newCards = callback(state.cards);
      //   if (JSON.stringify(newCards) === JSON.stringify(state?.cards)) {
      //     return state;
      //   }
      return {
        ...state,
        cards: newCards,
      };
    });
  },
  saveCards: (passedCards) => {
    // console.log("saving cards...");
    const { cards, nextAvailableId } = get();
    const newCards = passedCards ? passedCards : cards;
    localStorage.setItem(CARD_LS_KEY, JSON.stringify(newCards));
    localStorage.setItem(CARDS_NEXT_ID_LS_KEY, nextAvailableId.toString());
  },
  nextAvailableId: loadNextCardId(),
}));
