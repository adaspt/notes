import { useState } from "react";

import TaskContentPane from "./TaskContentPane";
import TaskDetailActions from "./TaskDetailActions";
import TaskEditForm from "./TaskEditForm";
import { toTaskDetailViewModel } from "./task-detail-format";
import { useTaskDetail } from "./use-task-detail";

type TaskDetailPaneProps = {
  taskId: string;
};

function TaskDetailPane({ taskId }: TaskDetailPaneProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { isLoading, task } = useTaskDetail(taskId);

  if (isLoading) {
    return <TaskContentPane emptyState="Loading task..." />;
  }

  if (!task) {
    return <TaskContentPane emptyState="Task not found" />;
  }

  const detail = toTaskDetailViewModel(task);

  if (isEditing) {
    return (
      <TaskEditForm
        key={task.id}
        task={task}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <TaskContentPane
      detail={detail}
      actions={<TaskDetailActions taskId={task.id} onEdit={() => setIsEditing(true)} />}
    />
  );
}

export default TaskDetailPane;
