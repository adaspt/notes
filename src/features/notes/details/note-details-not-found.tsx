import ContentPane from "@/components/content-pane/content-pane";
import ContentPaneHeader from "@/components/content-pane/content-pane-header";

interface Props {
  onBack: () => void;
}

function NoteDetailsNotFound({ onBack }: Props) {
  return (
    <ContentPane>
      <ContentPaneHeader title="Note not found" mobileTitle="Note" onBack={onBack} />
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-sm text-muted-foreground">
        This note no longer exists.
      </div>
    </ContentPane>
  );
}

export default NoteDetailsNotFound;
