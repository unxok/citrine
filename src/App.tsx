import { useEffect, useState } from "react";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ThemeProvider";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./components/SortableItem";
import { Button } from "./components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { create } from "zustand";
import { CARD_LS_KEY } from "./lib/consts";
import { cn } from "./lib/utils";

function App() {
  const { cards, setCards, saveCards, activeCard, setActiveCardId } =
    useCardStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    console.log("cards: ", cards);
    saveCards(CARD_LS_KEY, cards);
  }, [cards]);
  useEffect(() => {
    const cardString = localStorage.getItem(CARD_LS_KEY);
    if (!cardString) return;
    const cardJson = JSON.parse(cardString);
    setCards(() => cardJson);
  }, []);
  //   useEffect(() => console.log("disabledLane: ", disabledLane), [disabledLane]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!Number(active.id)) return;
    if (active.id !== over?.id) {
      setCards((items) => {
        if (!items) return items;
        const oldIndex = items.findIndex(
          (item) => item.id === Number(active?.id),
        );
        const newIndex = items.findIndex(
          (item) => item.id === Number(over?.id),
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveCardId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log("run it run it");
    console.log("active: ", active);
    console.log("over: ", over);

    setActiveCardId(active.id);
    if (active.id !== over?.id && over?.data.current) {
      setTimeout(
        () =>
          setCards((items) => {
            if (!over?.id) {
              throw new Error("This should be impossible");
            }
            if (!items) return items;
            const oldIndex = items?.findIndex(
              (item) => item.id === Number(active?.id),
            );
            if (oldIndex === -1) {
              return items;
            }
            const copyItems = [...items];
            const oldCard = { ...copyItems[oldIndex] };
            copyItems[oldIndex] = {
              ...oldCard,
              lane: over?.data?.current?.sortable.containerId || oldCard.lane,
            };
            return copyItems;
          }),
        0,
      );
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="fixed inset-0 flex items-center justify-center gap-10 bg-background text-primary-foreground">
          <Toaster richColors toastOptions={{}} />
          Well hello there
          {[{ id: "lane1" }, { id: "lane2" }].map(({ id }) => (
            <Lane
              key={id}
              id={id}
              items={cards?.filter((item) => item.lane === id)}
            />
          ))}
        </div>
        <DragOverlay className="bg-background">
          {activeCard ? (
            <div className="opacity-1 rounded-md border p-5">
              {activeCard.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ThemeProvider>
  );
}

export default App;

const Lane = ({
  id,
  items,
  direction = "vertical",
}: {
  id: UniqueIdentifier;
  items?: Card[];
  direction?: "vertical" | "horizontal";
}) => {
  const isEmpty = !items?.length;
  const [sortStrat, flexDir] =
    direction === "vertical"
      ? [verticalListSortingStrategy, "flex-col"]
      : [horizontalListSortingStrategy, "flex-row"];
  const { activeCard } = useCardStore();
  return (
    // <Droppable id={id} disabled={isEmpty ? false : true}>
    <SortableContext
      id={id.toString()}
      items={items ?? []}
      strategy={sortStrat}
    >
      <div className={`flex h-fit w-fit gap-5 border p-10 ${flexDir}`}>
        {items?.map(({ id, title }) => (
          <SortableItem key={id} id={id}>
            <div
              className={cn(
                "rounded-md border p-5",
                activeCard?.id === id && "border-primary text-primary",
              )}
            >
              {title}
            </div>
          </SortableItem>
        ))}
        <SortableItem id={`${id}-empty`}>
          <div
            aria-disabled
            className="rounded-md border border-dashed p-5 text-muted-foreground hover:cursor-not-allowed"
            style={isEmpty ? {} : { display: "none" }}
          >
            {"Drag Cards Here"}
          </div>
        </SortableItem>
        <Button variant={"outline"}>
          <PlusIcon />
        </Button>
      </div>
    </SortableContext>
    // </Droppable>
  );
};

type Card = {
  id: UniqueIdentifier;
  title?: string;
  lane: string;
};

type CardStore = {
  cards?: Card[];
  activeCard?: Card | null;
  setActiveCardId: (id: UniqueIdentifier | null) => void;
  addCard: (card: Card) => void;
  setCards: (callback: (cards?: Card[]) => Card[] | undefined) => void;
  saveCards: (localStorageKey: string, cards?: Card[]) => void;
};

const useCardStore = create<CardStore>()((set, get) => ({
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
  saveCards: (localStorageKey, cards) => {
    setTimeout(() => {
      const cardString = JSON.stringify(cards ? cards : get().cards);
      localStorage.setItem(localStorageKey, cardString);
    }, 0);
  },
}));
