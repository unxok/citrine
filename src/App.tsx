import { useEffect, useRef, useState } from "react";
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
  DragOverlay,
  Over,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCardStore, Card, CardPresentational } from "./components/Card";
import { Lane, LaneDraggable } from "./components/Lane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { GearIcon } from "@radix-ui/react-icons";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Progress } from "./components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";

function App() {
  const { cards, setCards, saveCards, activeCard, setActiveCardId } =
    useCardStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => console.log(cards), [cards]);

  // useEffect(() => {
  //   loadCards();
  // }, []);

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
        return saveCards();
      }
      return setCards((items) => {
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
    saveCards();
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
        <ResizablePanelGroup
          direction="vertical"
          autoSaveId={"layout-save"}
          className="fixed inset-0 bg-background text-primary-foreground"
        >
          <ResizablePanel className="relative">
            <Header />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="scrollbar-track-transparent scrollbar-thin scrollbar-thumb-primary h-full w-full !overflow-y-auto p-5">
            <main className="flex items-start justify-center gap-10">
              <Board
                id={1}
                title={"Test Board"}
                lanes={[
                  { id: "lane1", title: "BACKLOG", board: 1 },
                  { id: "lane2", title: "TODAY", board: 1 },
                  { id: "lane3", title: "DONE", board: 1 },
                ]}
                cards={cards?.filter((c) => c.board === 1)}
              />
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
        <DragOverlay>
          {activeCard ? <CardPresentational {...activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </ThemeProvider>
  );
}

export default App;

const Header = () => {
  /**
   * Gets the number of bytes being used in localStorage
   * @returns number of bytes
   */
  const getLsUsage = () => {
    return Object.keys(localStorage).reduce((acc, val) => {
      if (!localStorage.hasOwnProperty(val)) return acc;
      const len = ((localStorage.getItem(val)?.length ?? 0) + val.length) * 2;
      return acc + len;
    }, 0);
  };
  const kbUsed = getLsUsage() / 1024;
  const percentUsed = ((kbUsed / 5120) * 100).toFixed(2);
  return (
    <div className="absolute inset-0 flex flex-row">
      <div className="flex h-full w-fit items-center justify-center gap-3 px-10">
        <img src="citrine_logo.svg" alt="citrine logo" height={50} width={50} />
        <span className="font-mono text-5xl font-extrabold">citrine</span>
      </div>
      <nav className="flex h-full w-full flex-row items-center justify-center gap-5">
        <Select>
          <SelectTrigger defaultValue={"all"} className="w-fit">
            All Boards
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
          </SelectContent>
        </Select>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex h-fit w-48 items-center justify-center gap-2 rounded-md">
                Storage
                <Progress value={kbUsed} max={5120} className="rounded-sm" />
              </div>
            </TooltipTrigger>
            <TooltipContent align="end">
              <div>{kbUsed.toFixed(2)} kb used / 5120 kb available</div>
              <div>
                {percentUsed}% used and {100 - Number(percentUsed)}% available
              </div>
              <em className="text-muted-foreground">
                reload the page to refresh
              </em>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <a
          href="https://github.com/unxok/panel-offline"
          className="hover:underline hover:underline-offset-4"
        >
          Docs
        </a>
      </nav>
      <div className="flex items-center justify-end">
        <Button variant={"ghost"} className="group">
          <GearIcon
            width={20}
            height={20}
            className="group-hover:animate-spin"
          />
        </Button>
      </div>
    </div>
  );
};

type Board = {
  id: UniqueIdentifier;
  title?: string;
  lanes?: Lane[];
  cards?: Card[];
};
const Board = ({ title, lanes, cards }: Board) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [isOverflown, setOverflown] = useState(false);

  useEffect(() => {
    const updateOverflow = () => {
      const boardEl = boardRef.current;
      if (!boardEl) return;
      const checkOverflown = boardEl.scrollWidth > boardEl.clientWidth;
      setOverflown(checkOverflown);
    };
    updateOverflow();
    window.addEventListener("resize", updateOverflow);
    return () => {
      window.removeEventListener("resize", updateOverflow);
    };
  }, []);
  return (
    <div
      ref={boardRef}
      className={`scrollbar scrollbar-track-transparent scrollbar-thumb-primary flex h-fit w-fit flex-col overflow-x-auto border p-10 ${isOverflown ? "items-start" : "items-center"}`}
    >
      <div className="flex w-full flex-row justify-start gap-2 pb-5">
        <div className="text-xl font-bold tracking-widest">
          {title ?? "Unnamed Board"}
        </div>
        <div className="text-muted-foreground">{cards?.length}</div>
      </div>
      <div className="relative flex flex-row items-start justify-center gap-3">
        {lanes?.map((props) => (
          <LaneDraggable
            key={props.id}
            {...props}
            cards={cards?.filter((item) => item.lane === props.id)}
          />
        ))}
      </div>
    </div>
  );
};

// type BoardStore = {
//   boards?: Board[];
//   setBoards: (callback: (cards?: Card[]) => Card[] | undefined) => void;
// };

// const loadBards = () => {
//   const localBoards = local
// }

// export const useBoardStore = create<BoardStore>()((set, get) => ({
//   boards:
// }))
