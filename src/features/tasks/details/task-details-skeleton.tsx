import ContentPane from "@/components/content-pane/content-pane";
import ContentPaneHeader from "@/components/content-pane/content-pane-header";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  onBack: () => void;
}

function TaskDetailsSkeleton({ onBack }: Props) {
  return (
    <ContentPane>
      <ContentPaneHeader
        title={<Skeleton className="h-8 w-80 max-w-full" />}
        mobileTitle="Task details"
        onBack={onBack}
      />
      <div className="flex flex-col gap-2 border-b px-4 py-2 md:flex-row">
        <Skeleton className="h-9 w-full md:w-32" />
        <Skeleton className="h-9 w-full md:w-36" />
        <Skeleton className="h-9 w-full md:w-36" />
      </div>
      <div className="p-4">
        <Skeleton className="h-40 w-full" />
      </div>
    </ContentPane>
  );
}

export default TaskDetailsSkeleton;
