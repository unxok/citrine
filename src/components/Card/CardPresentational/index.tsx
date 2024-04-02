import { cn } from "@/lib/utils";
import { Card } from "..";
import { ReactNode } from "react";
import Markdown from "markdown-to-jsx";

export const CardPresentational = ({
  className,
  title,
  description,
  notes,
  showNotes,
  children,
}: Partial<Card> & { className?: string; children?: ReactNode }) => {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto whitespace-pre-wrap rounded-md border bg-background p-5 transition-all",
        className,
      )}
    >
      {children ? (
        <div>{children}</div>
      ) : (
        <>
          <div className="text-lg font-semibold tracking-wide">{title}</div>
          <div className="text-muted-foreground">{description}</div>
          {!!showNotes && (
            <div className="markdown-body whitespace-pre-wrap !bg-transparent !text-primary-foreground pt-3">
              <Markdown>{notes ?? ""}</Markdown>
            </div>
          )}
        </>
      )}
    </div>
  );
};
