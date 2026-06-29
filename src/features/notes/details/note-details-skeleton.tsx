import ContentPane from "@/components/content-pane/content-pane";
import ContentPaneHeader from "@/components/content-pane/content-pane-header";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  onBack: () => void;
}

function NoteDetailsSkeleton({ onBack }: Props) {
  return (
    <ContentPane>
      <ContentPaneHeader
        title={<Skeleton className="h-8 w-48" />}
        mobileTitle="Note"
        onBack={onBack}
      />
      <div className="grid gap-3 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-8 w-3/5" />
      </div>
    </ContentPane>
  );
}

export default NoteDetailsSkeleton;
