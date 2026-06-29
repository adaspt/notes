import ContentPane from "@/components/content-pane/content-pane";
import ContentPaneHeader from "@/components/content-pane/content-pane-header";
import { Button } from "@/components/ui/button";

interface Props {
  onBack: () => void;
}

function TaskDetailsNotFound({ onBack }: Props) {
  return (
    <ContentPane>
      <ContentPaneHeader title="Task not found" mobileTitle="Task details" onBack={onBack} />
      <div className="grid min-h-72 place-items-center px-4 text-center">
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">This task no longer exists.</p>
          <Button variant="outline" onClick={onBack}>
            Back to list
          </Button>
        </div>
      </div>
    </ContentPane>
  );
}

export default TaskDetailsNotFound;
