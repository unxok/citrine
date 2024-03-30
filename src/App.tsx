import React, { ReactNode, useEffect, useState } from "react";
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
  Over,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "./components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { CARD_LS_KEY } from "./lib/consts";
import { Droppable } from "./components/Droppable";
import {
  useCardStore,
  Card,
  CardDraggable,
  CardPresentational,
} from "./components/Card";
import { db } from "./db";

function App() {
  const { cards, setCards, saveCards, activeCard, setActiveCardId, loadCards } =
    useCardStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => console.log(cards), [cards]);

  useEffect(() => {
    // db.cards.bulkPut([
    //   { id: 2, title: "card 2", lane: "lane1", orderId: 1 },
    //   { id: 3, title: "card 3", lane: "lane1", orderId: 2 },
    //   { id: 1, title: "card 1", lane: "lane1", orderId: 3 },
    //   { id: 4, title: "card 4", lane: "lane1", orderId: 4 },
    // ]);
    loadCards();
  }, []);

  const getLaneId: (over: Over, oldCard: Card) => string = (over, oldCard) => {
    const { itemType } = over.data.current || {};
    if (!itemType) return oldCard.lane;
    if (itemType === "card") return over?.data?.current?.sortable.containerId;
    if (itemType === "lane") return over.id;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (active.id !== over?.id) {
      if ((over?.data.current?.itemType as string) === "lane") {
        // handleDragOver already changed the lane
        // so just save
        return saveCards(cards);
      }
      setCards((items) => {
        if (!items) return items;
        const oldIndex = items.findIndex(
          (item) => item.id === Number(active?.id),
        );
        const newIndex = items.findIndex(
          (item) => item.id === Number(over?.id),
        );
        const newCards = arrayMove(items, oldIndex, newIndex);
        saveCards(newCards);
        return newCards;
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    console.log("active: ", active);
    console.log("over: ", over);

    setActiveCardId(active.id);
    if (active.id !== over?.id) {
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
            const newLaneId = getLaneId(over, oldCard);
            copyItems[oldIndex] = {
              ...oldCard,
              lane: newLaneId,
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
        <Toaster richColors toastOptions={{}} visibleToasts={100} />
        <div className="fixed inset-0 flex items-center justify-center gap-10 bg-background text-primary-foreground">
          <Board lanes={[{ id: "lane1" }, { id: "lane2" }]} cards={cards} />
        </div>
        <DragOverlay className="bg-background">
          {activeCard ? (
            <CardPresentational>{activeCard.title}</CardPresentational>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ThemeProvider>
  );
}

export default App;

const Board = ({ lanes, cards }: { lanes?: Lane[]; cards?: Card[] }) => {
  //
  return (
    <div className="flex w-5/6 flex-row items-center justify-center gap-3 border p-10">
      {lanes?.map(({ id }) => (
        <LaneDraggable
          key={id}
          id={id}
          cards={cards?.filter((item) => item.lane === id)}
        />
      ))}
    </div>
  );
};

type Lane = {
  id: UniqueIdentifier;
};

const LaneDraggable = ({
  id,
  direction = "vertical",
  cards,
}: {
  id: UniqueIdentifier;
  direction?: "vertical" | "horizontal";
  cards?: Card[];
}) => {
  const isEmpty = !cards?.length;
  const [sortStrat, flexDir] =
    direction === "vertical"
      ? [verticalListSortingStrategy, "flex-col"]
      : [horizontalListSortingStrategy, "flex-row"];
  return (
    <SortableContext
      id={id.toString()}
      items={cards ?? []}
      strategy={sortStrat}
    >
      <Droppable
        id={id}
        className={`flex h-fit w-0 flex-1 flex-col items-center justify-center gap-5 border p-10`}
        disabled={isEmpty ? false : true}
        itemType="lane"
      >
        {cards?.map(({ id, title }) => (
          <CardDraggable key={"card-" + id} id={id} title={title} />
        ))}
        {isEmpty && (
          <CardPresentational className="border-dashed text-muted-foreground">
            Drag cards here
          </CardPresentational>
        )}
        <Button variant={"outline"}>
          <PlusIcon />
        </Button>
      </Droppable>
    </SortableContext>
  );
};
