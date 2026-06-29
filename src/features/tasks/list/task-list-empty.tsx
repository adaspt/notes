import ContentPane from "@/components/content-pane/content-pane";
import { ListChecks } from "lucide-react";

/** Desktop placeholder shown in the content pane when no task is selected. */
function TaskListEmpty() {
  return (
    <ContentPane>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <ListChecks className="size-10" />
        <p className="text-sm">Select a task from the list</p>
      </div>
    </ContentPane>
  );
}

export default TaskListEmpty;
