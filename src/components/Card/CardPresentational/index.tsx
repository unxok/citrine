import { cn } from "@/lib/utils";
import { Card } from "..";
import { ReactNode } from "react";
import Markdown from "markdown-to-jsx";
import { PROSE_CUSTOM } from "@/lib/consts";

export const CardPresentational = (
  props: Card & {
    className?: string;
    children?: ReactNode;
    tooltip?: ReactNode;
  },
) => {
  const { title, description, notes, showNotes, className, children, tooltip } =
    props;

  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto whitespace-pre-wrap rounded-md border bg-background p-5 transition-all",
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
            <div className={PROSE_CUSTOM}>
              <Markdown>{notes ?? ""}</Markdown>
            </div>
          )}
        </>
      )}
      {tooltip}
    </div>
  );
};
