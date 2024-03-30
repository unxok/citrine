import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { create } from "zustand";
import { SortableItem } from "../SortableItem";
import { CARDS_NEXT_ID_LS_KEY, CARD_LS_KEY } from "@/lib/consts";
import { ReactNode, useEffect, useState } from "react";
import { ClassValue } from "clsx";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { buttonVariants } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export type Card = {
  id: UniqueIdentifier;
  lane?: UniqueIdentifier;
  title?: string;
  description?: string;
};

export const CardPresentational = ({
  className,
  children,
}: {
  className?: ClassValue;
  children?: ReactNode;
}) => (
  <div className={cn("w-full rounded-md border bg-background p-5", className)}>
    {children}
  </div>
);

export const CardDraggable = ({ id, title, description }: Card) => {
  const { activeCard } = useCardStore();
  console.log("description", description);
  return (
    <SortableItem id={id} itemType="card" className="w-full">
      <CardPresentational className={activeCard?.id === id && "border-dashed"}>
        <div className="text-lg font-semibold tracking-wide">{title}</div>
        <div className="text-muted-foreground">{description}</div>
      </CardPresentational>
    </SortableItem>
  );
};

export const CardDialog = ({
  laneId,
  trigger,
  defaultData,
  open,
  setOpen,
}: {
  laneId: UniqueIdentifier;
  trigger?: ReactNode;
  defaultData?: Card;
  open?: boolean;
  setOpen?: (b: boolean) => void;
}) => {
  const { addCard, saveCards } = useCardStore();
  const defaultFormState = {
    id: defaultData?.id ?? -1,
    lane: defaultData?.lane ?? laneId,
    title: "",
    description: "",
  };
  const [formValues, setFormValues] = useState<Card>(defaultFormState);

  useEffect(() => console.log(formValues), [formValues]);

  const updateFormValue = <T,>(key: string, value: string | T) => {
    setFormValues(
      (prev) =>
        prev && {
          ...prev,
          [key]: value,
        },
    );
  };

  const createCard = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!formValues) {
      e.preventDefault();
      return toast.error("You gotta have something in there");
    }
    addCard(formValues);
    saveCards();
    setFormValues(defaultFormState);
  };

  return (
    <Dialog open={open ?? undefined} onOpenChange={setOpen ?? undefined}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {defaultData
              ? `Editing ${defaultData.title}`
              : `Adding new card to ${laneId}`}
          </DialogTitle>
          <DialogDescription>TODO description goes here</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col justify-start gap-2">
            <Label htmlFor="title" className="font-semibold tracking-wide">
              Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formValues?.title}
              placeholder={"Unnamed Card"}
              onChange={(e) =>
                updateFormValue(e.currentTarget.id, e.currentTarget.value)
              }
            />
            <span className="text-sm text-muted-foreground">
              The title of your card
            </span>
          </div>
          <div className="flex flex-col justify-start gap-2">
            <Label
              htmlFor="description"
              className="font-semibold tracking-wide"
            >
              Description
            </Label>
            <Input
              id="description"
              name="description"
              value={formValues?.description}
              placeholder={"some random description"}
              onChange={(e) =>
                updateFormValue(e.currentTarget.id, e.currentTarget.value)
              }
            />
            <span className="text-sm text-muted-foreground">
              The description to show under the title
            </span>
          </div>
        </div>
        <DialogFooter>
          {defaultData && (
            <DialogClose className={buttonVariants({ variant: "ghost" })}>
              Delete
            </DialogClose>
          )}
          <DialogClose
            className={buttonVariants({ variant: "default" })}
            onClick={createCard}
          >
            Create
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type CardStore = {
  cards?: Card[];
  activeCard?: Card | null;
  setActiveCardId: (id: UniqueIdentifier | null) => void;
  addCard: (newCard: Card) => void;
  setCards: (callback: (cards?: Card[]) => Card[] | undefined) => void;
  saveCards: (cards?: Card[]) => void;
  loadCards: () => void;
  nextAvailableId: number;
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
  addCard: (newCard) => {
    set((state) => ({
      ...state,
      cards: [
        ...(state.cards ?? []),
        { ...newCard, id: state.nextAvailableId },
      ],
      nextAvailableId: state.nextAvailableId + 1,
    }));
  },
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
  saveCards: async (passedCards) => {
    console.log("saving cards...");
    const { cards, nextAvailableId } = get();
    const newCards = passedCards ? passedCards : cards;
    localStorage.setItem(CARD_LS_KEY, JSON.stringify(newCards));
    localStorage.setItem(CARDS_NEXT_ID_LS_KEY, nextAvailableId.toString());
  },
  loadCards: async () => {
    const localCards = localStorage.getItem(CARD_LS_KEY);
    const nextId = localStorage.getItem(CARDS_NEXT_ID_LS_KEY);
    const nextIdNum = Number(nextId);
    if (!localCards) return;
    try {
      const json = JSON.parse(localCards);
      set((state) => ({
        ...state,
        cards: json,
        nextAvailableId: nextIdNum > 0 ? nextIdNum : 1,
      }));
    } catch (e) {
      toast.error(
        "An error occurred when loading local data. Check console for more information",
      );
      console.log(e);
      console.log("Cards found in local storage: ", localCards);
    }
  },
  nextAvailableId: 1,
}));
