import ContentPane from "@/components/content-pane/content-pane";
import ContentPaneHeader from "@/components/content-pane/content-pane-header";
import { useTask } from "@/features/tasks/data/use-task";
import TaskBody from "./task-body";
import TaskControlsRow from "./task-controls-row";
import TaskDetailsNotFound from "./task-details-not-found";
import TaskDetailsSkeleton from "./task-details-skeleton";
import TaskOverflowMenu from "./task-overflow-menu";
import TaskTitle from "./task-title";

interface Props {
  taskId: string;
  onNavigateToList: () => void;
}

function TaskDetails({ taskId, onNavigateToList }: Props) {
  const { task, isLoading } = useTask(taskId);

  if (isLoading) {
    return <TaskDetailsSkeleton onBack={onNavigateToList} />;
  }

  if (!task) {
    return <TaskDetailsNotFound onBack={onNavigateToList} />;
  }

  return (
    <ContentPane>
      <ContentPaneHeader
        title={<TaskTitle task={task} />}
        mobileTitle="Task details"
        onBack={onNavigateToList}
      >
        <TaskOverflowMenu task={task} onNavigateToList={onNavigateToList} />
      </ContentPaneHeader>
      <TaskControlsRow task={task} />
      <TaskBody task={task} />
    </ContentPane>
  );
}

export default TaskDetails;
