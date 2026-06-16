import TaskCreateForm from "./TaskCreateForm";
import type { TaskCreateValues } from "./task-mutations";

type TaskCreatePaneProps = {
  defaultValues?: Omit<TaskCreateValues, "title">;
  onCancel: () => void;
  onCreated: (taskId: string) => void;
};

function TaskCreatePane({ defaultValues, onCancel, onCreated }: TaskCreatePaneProps) {
  return <TaskCreateForm defaultValues={defaultValues} onCancel={onCancel} onCreated={onCreated} />;
}

export default TaskCreatePane;
