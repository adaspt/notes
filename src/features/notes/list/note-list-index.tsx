import ContentPane from "@/components/content-pane/content-pane";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ReactNode } from "react";

interface Props {
  pane: ReactNode;
}

function NoteListIndex({ pane }: Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return pane;
  }

  return (
    <ContentPane>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-muted-foreground">
        Select a note
      </div>
    </ContentPane>
  );
}

export default NoteListIndex;
