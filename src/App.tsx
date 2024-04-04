import { ReactNode, useEffect, useState } from "react";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
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
import { DashboardIcon, FileTextIcon, GearIcon } from "@radix-ui/react-icons";
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
import {
  Board,
  BoardDialog,
  BoardTooltip,
  useBoardStore,
} from "./components/Board";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";
import { toast } from "sonner";
import { cn, downloadToFile } from "./lib/utils";
import { CardTooltip } from "./components/Card/CardDraggable";
import { useViewStore } from "./components/View";
import { ALL, BOARD, CARD } from "./lib/consts";
import { CardView } from "./components/Card/CardDialog";

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
  const { currentView } = useViewStore();
  const getCurrentBoard = () => {
    if (currentView.itemType !== BOARD) return;
    const foundBoard = boards?.find((b) => b.id === currentView.itemId);
    return foundBoard;
  };
  const getCurrentCard = () => {
    if (currentView.itemType !== CARD) return;
    const foundCard = cards?.find((b) => b.id === currentView.itemId);
    return foundCard;
  };
  const currentBoard = getCurrentBoard();
  const currentCard = getCurrentCard();
  console.log("view: ", currentView);
  // useEffect(() => console.log(cards), [cards]);

  // useEffect(() => {
  //   loadCards();
  // }, []);

  const getBoardAndLaneId = (over: Over, oldCard: Card) => {
    const { itemType, boardId } = over.data.current || {};
    if (!itemType) return { laneId: oldCard.lane, boardId: oldCard.board };
    if (itemType === "card")
      return {
        laneId: over?.data?.current?.sortable.containerId as string,
        boardId: boardId as string,
      };
    if (itemType === "lane") return { laneId: over.id, boardId: boardId };
    return { laneId: "", boardId: "" };
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
    // console.log("active: ", active);
    // console.log("over: ", over);

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
            const { laneId, boardId } = getBoardAndLaneId(over, oldCard);
            copyItems[oldIndex] = {
              ...oldCard,
              lane: laneId,
              board: boardId,
              modified: new Date().toLocaleString("en-US"),
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
          className="fixed inset-0 bg-background text-foreground"
        >
          <ResizablePanel
            className="relative"
            minSize={5}
            defaultSize={10}
            collapsible
            collapsedSize={0}
          >
            <Header />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel className="h-full w-full">
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId={"layout-center-save"}
              className="bg-background text-foreground"
            >
              <ResizablePanel
                className="h-full w-full !overflow-y-auto text-nowrap p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary data-[panel-size='0.0']:hidden"
                minSize={10}
                defaultSize={20}
                collapsible
                collapsedSize={0}
              >
                <Left />
              </ResizablePanel>
              <ResizableHandle
                className={`data-[resize-handle-state=inactive]:`}
              />
              <ResizablePanel className="relative">
                <div className="flex h-full w-full flex-col items-start justify-start gap-5 !overflow-auto p-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary">
                  {currentView.itemId === ALL &&
                    currentView.itemType === BOARD &&
                    boards?.map((b) => (
                      <Board
                        key={b.id + "-board-center"}
                        {...b}
                        cards={cards?.filter((c) => c.board === b.id)}
                      />
                    ))}
                  {currentView.itemId === ALL &&
                    currentView.itemType === CARD &&
                    cards?.map((c) => (
                      <CardView key={c.id + "-card-center"} {...c} />
                    ))}
                  {currentView.itemType === BOARD && currentBoard && (
                    <Board
                      {...currentBoard}
                      cards={cards?.filter((c) => c.board === currentBoard.id)}
                    />
                  )}
                  {currentView.itemType === CARD && currentCard && (
                    <CardView {...currentCard} />
                  )}
                </div>
              </ResizablePanel>
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
                last updated {new Date().toLocaleString("en-US")}
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
      <div className="flex items-center justify-end px-10">
        <SettingsSheet />
      </div>
    </div>
  );
};

const SettingsSheet = () => {
  const { theme, setTheme } = useTheme();
  const { cards } = useCardStore();
  const { boards } = useBoardStore();

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

  const exportToCSV = (delim: string) => {
    if (!cards || !boards) {
      return toast.error("There are no cards to export!");
    }
    const header =
      [
        "Id",
        "Title",
        "Description",
        "Board",
        "Lane",
        "Notes",
        "Created",
        "Modified",
      ].join(delim) + "\n";
    const csv =
      header +
      cards.reduce((acc, card) => {
        const boardTitle = boards.find((b) => b.id === card.board)?.title;
        const laneTitle = boards
          .find((b) => b.id === card.board)
          ?.lanes?.find((l) => l.id === card.lane)?.title;
        const arr = [
          `${card.id}`,
          `"${card?.title}"`,
          `"${card?.description}"`,
          `"${boardTitle}"`,
          `"${laneTitle}"`,
          `"${card?.notes}"`,
          `"${card?.created}"`,
          `"${card?.modified}"`,
        ];
        const row = arr.join(delim);
        return acc + "\n" + row;
      }, "");
    downloadToFile(csv, "citrine.csv", "text/csv");
  };

  const exportToHTML = () => {
    const html = document.documentElement.innerHTML;
    downloadToFile(html, "citrine.html", "text/html");
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
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => {
                const delim = window.prompt(
                  "Please enter what will be the delimeter for your columns",
                );
                if (!delim) {
                  return toast.error("You must enter a non-empty character");
                }
                exportToCSV(delim);
              }}
            >
              To CSV file
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => {
                exportToHTML();
              }}
            >
              To HTML file
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
            <div>Theme</div>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => setTheme("light")}
              disabled={theme === "light"}
            >
              Light
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => setTheme("dark")}
              disabled={theme === "dark"}
            >
              Dark
            </Button>
            <Button
              variant={"ghost"}
              className="w-full justify-start"
              onClick={() => setTheme("system")}
              disabled={theme === "system"}
            >
              Custom
            </Button>
            <div className="pt-24">
              <div className="rounded-md border border-destructive bg-destructive/10 p-5 text-foreground">
                <div className="pb-3 text-lg">Danger Zone</div>
                <Button
                  variant={"destructive"}
                  className="w-full justify-start"
                  onClick={() => {
                    const confirmation = window.confirm(
                      "Are you sure? This will permanently delete all your data!",
                    );
                    if (!confirmation) return;
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Clear all data
                </Button>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

type SortCallback = ((a: Card, b: Card) => number) | undefined;
const sortZA: SortCallback = (a, b) =>
  a?.title?.localeCompare(b?.title ?? "") ?? 0;
const sortAZ: SortCallback = (a, b) =>
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
          <Button
            variant={"outline"}
            disabled
            className="w-full min-w-20 max-w-36"
          >
            Add view
          </Button>
        </div>
        <BoardsAccordion />
        <CardsAccordion />
      </div>
      <BoardDialog open={boardDialogOpen} setOpen={setBoardDialogOpen} />
    </>
  );
};
const BoardsAccordion = () => {
  const { boards } = useBoardStore();
  const { currentView, setView } = useViewStore();
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
    <Accordion
      type="single"
      collapsible
      defaultValue={currentView.itemType === BOARD ? "item-1" : undefined}
      className="w-full"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="w-full">Boards</AccordionTrigger>
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
          <div className="flex w-full flex-col gap-1">
            <div
              onClick={() => {
                setView({ itemId: ALL, itemType: BOARD });
              }}
            >
              <a
                className={cn(
                  "flex cursor-pointer items-center justify-start gap-1 rounded-sm p-2 hover:bg-secondary hover:text-secondary-foreground hover:underline hover:underline-offset-2",
                  currentView.itemType === BOARD && currentView.itemId === ALL
                    ? "bg-secondary text-secondary-foreground"
                    : "",
                )}
              >
                <DashboardIcon />
                All boards
              </a>
            </div>
            {boards
              ?.toSorted(sortCb)
              .map((b) => (
                <BoardNavItem
                  key={`${b.id}-board-left-nav-button`}
                  {...b}
                  className={
                    currentView.itemType === BOARD &&
                    currentView.itemId === b.id
                      ? "bg-secondary text-secondary-foreground"
                      : ""
                  }
                />
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const BoardNavItem = (props: Board & { className?: string }) => {
  const { id, title, description, notes, className } = props;
  const { cards } = useCardStore();
  const { setView } = useViewStore();
  const [isHover, setIsHover] = useState(false);
  return (
    <TooltipProvider>
      <div className="relative">
        <div
          onClick={() => {
            setView({ itemId: id, itemType: BOARD });
          }}
        >
          <a
            className={cn(
              `flex cursor-pointer flex-col items-start justify-center gap-1`,
            )}
          >
            <div
              className={cn(
                "roudned-sm flex w-full items-center justify-start gap-1 rounded-sm p-2",
              )}
            >
              <CardsAccordion
                cards={cards?.filter((c) => c.board === id)}
                triggerClassName={className}
                trigger={
                  <div className="flex items-center gap-1">
                    <FileTextIcon className={!!notes ? "text-primary" : ""} />
                    <span
                      onMouseOver={() => setIsHover(true)}
                      onMouseLeave={() => setIsHover(false)}
                    >
                      {title}
                    </span>
                  </div>
                }
              />
            </div>
            {/* <div className="w-full pl-5">
              <CardsAccordion cards={cards?.filter((c) => c.board === id)} />
            </div> */}
          </a>
          <BoardTooltip
            {...props}
            isHover={isHover}
            setIsHover={setIsHover}
            triggerClassName="-right-28"
            includeDefaultData
            data={
              <div className="pb-2">
                <div className="text-foreground">{title}</div>
                <div>{description}</div>
              </div>
            }
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

const CardsAccordion = (props: {
  cards?: Card[];
  trigger?: ReactNode;
  triggerClassName?: string;
}) => {
  const cards = props.cards ?? useCardStore().cards;
  const { currentView, setView } = useViewStore();
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
    <Accordion
      defaultValue={currentView.itemType === CARD ? "item-1" : undefined}
      type="single"
      collapsible
      className="w-full"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger
          className={cn("w-full rounded-sm p-2", props.triggerClassName)}
        >
          {props.trigger ?? "Cards"}
        </AccordionTrigger>
        <AccordionContent className={"w-full p-1"}>
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
          <div className="flex w-full flex-col gap-1">
            <div
              onClick={() => {
                setView({ itemId: ALL, itemType: BOARD });
              }}
            >
              <a
                className={cn(
                  "flex cursor-pointer items-center justify-start gap-1 rounded-sm p-2 hover:bg-secondary hover:text-secondary-foreground hover:underline hover:underline-offset-2",
                  currentView.itemType === CARD && currentView.itemId === ALL
                    ? "bg-secondary text-secondary-foreground"
                    : "",
                )}
              >
                <DashboardIcon />
                All cards
              </a>
            </div>
            {cards
              ?.toSorted(sortCb)
              .map((c) => (
                <CardNavItem
                  key={`${c.id}-card-left-nav-button`}
                  {...c}
                  className={
                    currentView.itemType === CARD && currentView.itemId === c.id
                      ? "bg-secondary text-secondary-foreground"
                      : ""
                  }
                />
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const CardNavItem = (props: Card & { className?: string }) => {
  const { id, title, description, notes, className } = props;
  const { setView } = useViewStore();
  const [isHover, setIsHover] = useState(false);
  return (
    <TooltipProvider>
      <div className="relative">
        <div
          onMouseOver={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={(e) => {
            // setTimeout(() => {
            setView({ itemId: id, itemType: CARD });
            e.stopPropagation();
            // }, 0);
          }}
        >
          <a
            onClick={() => {
              setView({ itemId: id, itemType: CARD });
            }}
            className={cn(
              `flex cursor-pointer items-center justify-start gap-1 rounded-sm p-2 hover:bg-secondary hover:text-secondary-foreground hover:underline hover:underline-offset-2`,
              className,
            )}
          >
            <FileTextIcon className={!!notes ? "text-primary" : ""} />
            {title}
          </a>
          <CardTooltip
            {...props}
            isHover={isHover}
            setIsHover={setIsHover}
            triggerClassName="-right-28"
            includeDefaultData
            data={
              <div className="pb-2">
                <div className="text-foreground">{title}</div>
                <div>{description}</div>
              </div>
            }
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
