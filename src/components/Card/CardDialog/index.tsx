import { buttonVariants } from "@/components/ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Label } from "@radix-ui/react-label";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
import { Card, useCardStore } from "..";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "markdown-to-jsx";
import "github-markdown-css";
import { PROSE_CUSTOM } from "@/lib/consts";
import { cn } from "@/lib/utils";

export const CardDialog = ({
  laneId,
  boardId,
  trigger,
  defaultData,
  open,
  setOpen,
}: {
  laneId: UniqueIdentifier;
  boardId: UniqueIdentifier;
  trigger?: ReactNode;
  defaultData?: Card;
  open?: boolean;
  setOpen?: (b: boolean) => void;
}) => {
  const { addCard, saveCards } = useCardStore();
  const defaultFormState = {
    id: defaultData?.id ?? -1,
    lane: defaultData?.lane ?? laneId,
    board: defaultData?.board ?? boardId,
    title: defaultData?.title ?? "",
    description: defaultData?.description ?? "",
    notes: defaultData?.notes ?? "",
    showNotes: defaultData?.showNotes ?? false,
    created: defaultData?.created ?? new Date().toLocaleString("en-US"),
    modified: defaultData?.modified ?? new Date().toLocaleString("en-US"),
    ...defaultData,
  };
  const [formValues, setFormValues] = useState<Card>(defaultFormState);

  // useEffect(() => console.log(formValues), [formValues]);

  const updateFormValue = <T,>(key: string, value: string | T) => {
    setFormValues(
      (prev) =>
        prev && {
          ...prev,
          [key]: value,
          created: defaultData?.created ?? new Date().toLocaleString("en-US"),
          modified: new Date().toLocaleString("en-US"),
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
      <DialogContent
        onPointerDownOutside={() => setFormValues(defaultFormState)}
        className="h-5/6"
      >
        <DialogHeader>
          <DialogTitle>
            {defaultData ? (
              <span>
                Editing&nbsp;
                <i>{defaultData.title}</i>
              </span>
            ) : (
              `Adding new card to ${laneId}`
            )}
          </DialogTitle>
          <DialogDescription>
            {defaultData ? "Mistakes happen :)" : "More options coming soon!"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] px-5 py-2">
          <div className="flex h-[60vh] flex-col gap-5 px-2">
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
            <MarkdownInput
              formValue={formValues.notes}
              updateFormValue={updateFormValue}
            />
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col justify-start gap-2">
                <Label
                  htmlFor="showNotes"
                  className="font-semibold tracking-wide"
                >
                  Show Notes
                </Label>

                <span className="text-sm text-muted-foreground">
                  Toggle on to always show notes under the description
                </span>
              </div>
              <Switch
                id="showNotes"
                name="showNotes"
                checked={formValues?.showNotes}
                onCheckedChange={(b) =>
                  updateFormValue<boolean>("showNotes", b)
                }
              />
            </div>
          </div>
        </ScrollArea>

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
            {defaultData ? "Update" : "Create"}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MarkdownInput = ({
  formValue,
  updateFormValue,
}: {
  formValue?: string;
  updateFormValue: <T>(key: string, value: string | T) => void;
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="flex flex-col justify-start gap-2">
      <Label htmlFor="notes" className="font-semibold tracking-wide">
        Notes
      </Label>
      <Tabs
        value={showPreview ? "preview" : "raw"}
        onValueChange={(s) => setShowPreview(s === "raw" ? false : true)}
        className="w-[400px]"
      >
        <TabsList>
          <TabsTrigger value="raw">Raw</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
      </Tabs>
      {showPreview ? (
        <div className={PROSE_CUSTOM}>
          <Markdown>{formValue ?? ""}</Markdown>
        </div>
      ) : (
        <Textarea
          id="notes"
          name="notes"
          value={formValue}
          placeholder={"some random notes"}
          onChange={(e) =>
            updateFormValue(e.currentTarget.id, e.currentTarget.value)
          }
          className="scrollbar scrollbar-track-transparent scrollbar-thumb-secondary scrollbar-corner-transparent"
        />
      )}
      <span className="text-sm text-muted-foreground">
        Markdown support is here!
      </span>
    </div>
  );
};

export const CardView = ({ title, description, notes }: Card) => (
  <div className={cn(PROSE_CUSTOM, "h-full w-full")}>
    <h1>{title}</h1>
    <p>{description}</p>
    <div>
      <Markdown>{notes ?? ""}</Markdown>
    </div>
  </div>
);
