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
  DragOverlay,
  Over,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCardStore, Card, CardPresentational } from "./components/Card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./components/ui/resizable";
import { GearIcon, Pencil2Icon } from "@radix-ui/react-icons";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import { Checkbox } from "./components/ui/checkbox";
import { Board, BoardDialog, useBoardStore } from "./components/Board";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { toast } from "sonner";
import { downloadToFile } from "./lib/utils";

function App() {
  const { cards, setCards, saveCards, activeCard, setActiveCardId } =
    useCardStore();
  const { boards } = useBoardStore();
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
          <ResizablePanel className="h-full w-full">
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId={"layout-center-save"}
              className="bg-background text-primary-foreground"
            >
              <ResizablePanel className="h-full w-full !overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary">
                <Left />
              </ResizablePanel>
              <ResizableHandle
                className={`data-[resize-handle-state=inactive]:bg-transparent`}
              />
              <ResizablePanel className="!overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary">
                <div className="flex flex-col items-start justify-start">
                  {boards?.map((b) => (
                    <Board
                      {...b}
                      cards={cards?.filter((c) => c.board === b.id)}
                    />
                  ))}
                </div>
              </ResizablePanel>
              {/* <Board
                id={1}
                title={"Test Board"}
                lanes={[
                  { id: "lane1", title: "BACKLOG", board: 1 },
                  { id: "lane2", title: "TODAY", board: 1 },
                  { id: "lane3", title: "DONE", board: 1 },
                ]}
                cards={cards?.filter((c) => c.board === 1)}
              /> */}
            </ResizablePanelGroup>
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
        {/* <Select>
          <SelectTrigger defaultValue={"all"} className="w-fit">
            All Boards
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
          </SelectContent>
        </Select> */}
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
          href="https://github.com/unxok/citrine"
          className="hover:underline hover:underline-offset-4"
        >
          About
        </a>
        <a
          href="https://github.com/unxok/citrine"
          className="hover:underline hover:underline-offset-4"
        >
          Community
        </a>
        <a
          href="https://github.com/unxok/citrine"
          className="hover:underline hover:underline-offset-4"
        >
          Docs
        </a>
      </nav>
      <div className="flex items-center justify-end">
        <SettingsSheet />
      </div>
    </div>
  );
};

const SettingsSheet = () => {
  const copyLSToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(localStorage));
    toast.success("Save data copied to clipboard");
  };

  const exportToFile = () => {
    downloadToFile(
      JSON.stringify(localStorage),
      "save.citrine",
      "application/json",
    );
  };

  const importFromFile = () => {
    const inp = document.createElement("input");
    const reader = new FileReader();
    inp.type = "file";

    inp.addEventListener("change", () => {
      const file = inp?.files?.[0];
      if (!file) {
        toast.error("Import save data failed! \nNo data was provided");
        return;
      }
      reader.readAsText(file);
    });

    reader.addEventListener("load", () => {
      if (!(typeof reader.result === "string")) {
        toast.error("Import save data failed!\nUnexpected file contents");
        return;
      }
      try {
        const json = JSON.parse(reader.result);
        Object.keys(json).forEach((k) => localStorage.setItem(k, json[k]));
        window.location.reload();
        return;
      } catch (e) {
        toast.error(
          "Import save data failed! \nCheck console for more information",
        );
        console.error(
          "Error occured when attempting to parse JSON from text provided. ",
          e,
        );
        return;
      }
    });

    inp.click();
  };

  const importLSFromClipboard = () => {
    const text = window.prompt("Please paste your save data below");
    if (!text) {
      toast.error("Import save data failed! \nNo data was provided");
      return;
    }
    try {
      const json = JSON.parse(text);
      Object.keys(json).forEach((k) => localStorage.setItem(k, json[k]));
      window.location.reload();
      return;
    } catch (e) {
      toast.error(
        "Import save data failed! \nCheck console for more information",
      );
      console.error(
        "Error occured when attempting to parse JSON from text provided. ",
        e,
      );
      return;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"ghost"} className="group">
          <GearIcon
            width={20}
            height={20}
            className="group-hover:animate-spin"
          />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Tools & Settings</SheetTitle>
          <SheetDescription>
            <div>Export</div>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => copyLSToClipboard()}
            >
              To clipboard
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => exportToFile()}
            >
              To save file
            </Button>
            <div>Import</div>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => importLSFromClipboard()}
            >
              From clipboard
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => importFromFile()}
            >
              From save file
            </Button>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

type SortCallback = ((a: Card, b: Card) => number) | undefined;
const sortAZ: SortCallback = (a, b) =>
  a?.title?.localeCompare(b?.title ?? "") ?? 0;
const sortZA: SortCallback = (a, b) =>
  -1 * (a.title?.localeCompare(b?.title ?? "") ?? 0);
const sortNewest: SortCallback = (a, b) => Number(a.id) - Number(b.id);
const sortOldest: SortCallback = (a, b) => Number(b.id) - Number(a.id);

const Left = () => {
  const [boardDialogOpen, setBoardDialogOpen] = useState(false);
  return (
    <>
      <div className="flex h-full w-full flex-col items-center justify-start gap-5">
        <div className="flex h-fit w-1/2 items-center justify-center gap-5">
          <Button
            onClick={() => setBoardDialogOpen((b) => !b)}
            className="w-full min-w-20 max-w-36"
          >
            Add board
          </Button>
          <Button disabled className="w-full min-w-20 max-w-36">
            Add view
          </Button>
        </div>
        <CardsAccordion />
      </div>
      <BoardDialog
        open={boardDialogOpen}
        setOpen={setBoardDialogOpen}
        defaultMode="edit"
      />
    </>
  );
};

const CardsAccordion = () => {
  const { cards } = useCardStore();
  const [sortCb, setSortCb] = useState<SortCallback>(() => sortAZ);
  const [sortType, setSortType] = useState("sortAZ");

  useEffect(() => {
    switch (sortType) {
      case "sortAZ":
        return setSortCb(() => sortAZ);
      case "sortZA":
        return setSortCb(() => sortZA);
      case "sortNewest":
        return setSortCb(() => sortNewest);
      case "sortOldest":
        return setSortCb(() => sortOldest);
    }
  }, [sortType]);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="w-full">Cards</AccordionTrigger>
        <AccordionContent className="w-full p-1">
          <Select value={sortType} onValueChange={(v) => setSortType(v)}>
            <SelectTrigger className="mb-1 w-fit gap-1 border-none">
              <div className="text-muted-foreground">Sort by</div>
              <SelectValue></SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Title</SelectLabel>
                <SelectItem value={"sortAZ"}>A to Z</SelectItem>
                <SelectItem value={"sortZA"}>Z to A</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Creation</SelectLabel>
                <SelectItem value={"sortNewest"}>Newest first</SelectItem>
                <SelectItem value={"sortOldest"}>Oldest first</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="w-full">
            {cards?.toSorted(sortCb).map((c) => (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="w-full">
                    <Button
                      variant={"ghost"}
                      className="h-fit w-full flex-col items-start justify-center truncate"
                    >
                      <div className="flex gap-1">
                        {c.title}{" "}
                        {c.notes && <Pencil2Icon className="text-primary" />}
                      </div>
                      <em className="text-muted-foreground">{c.description}</em>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex items-center justify-center gap-2">
                      {c.notes && (
                        <>
                          <div>contains notes</div>
                          <Checkbox checked />
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

// const BoardsAccordion = () => {
//   const { cards } = useCardStore();
//   const [sortCb, setSortCb] = useState<SortCallback>(() => sortAZ);
//   const [sortType, setSortType] = useState("sortAZ");

//   useEffect(() => {
//     switch (sortType) {
//       case "sortAZ":
//         return setSortCb(() => sortAZ);
//       case "sortZA":
//         return setSortCb(() => sortZA);
//       case "sortNewest":
//         return setSortCb(() => sortNewest);
//       case "sortOldest":
//         return setSortCb(() => sortOldest);
//     }
//   }, [sortType]);

//   return (
//     <Accordion type="single" collapsible className="w-full">
//       <AccordionItem value="item-1">
//         <AccordionTrigger className="w-full">Cards</AccordionTrigger>
//         <AccordionContent className="w-full p-1">
//           <Select value={sortType} onValueChange={(v) => setSortType(v)}>
//             <SelectTrigger className="w-fit gap-1 border-none">
//               <div className="text-muted-foreground">Sort by</div>
//               <SelectValue></SelectValue>
//             </SelectTrigger>
//             <SelectContent>
//               <SelectGroup>
//                 <SelectLabel>Title</SelectLabel>
//                 <SelectItem value={"sortAZ"}>A to Z</SelectItem>
//                 <SelectItem value={"sortZA"}>Z to A</SelectItem>
//               </SelectGroup>
//               <SelectGroup>
//                 <SelectLabel>Creation</SelectLabel>
//                 <SelectItem value={"sortNewest"}>Newest first</SelectItem>
//                 <SelectItem value={"sortOldest"}>Oldest first</SelectItem>
//               </SelectGroup>
//             </SelectContent>
//           </Select>
//           <div className="w-full">
//             {cards?.toSorted(sortCb).map((c) => (
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger className="w-full">
//                     <Button
//                       variant={"ghost"}
//                       className="h-fit w-full flex-col items-start justify-center truncate"
//                     >
//                       <div className="flex gap-1">
//                         {c.title}{" "}
//                         {c.notes && <Pencil2Icon className="text-primary" />}
//                       </div>
//                       <em className="text-muted-foreground">{c.description}</em>
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>
//                     <div className="flex items-center justify-center gap-2">
//                       {c.notes && (
//                         <>
//                           <div>contains notes</div>
//                           <Checkbox checked />
//                         </>
//                       )}
//                     </div>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             ))}
//           </div>
//         </AccordionContent>
//       </AccordionItem>
//     </Accordion>
//   );
// };

// const CenterMiddle = () => {

// }
