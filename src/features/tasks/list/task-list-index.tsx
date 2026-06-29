import { useIsMobile } from "@/hooks/use-mobile";
import type { ReactNode } from "react";
import TaskListEmpty from "./task-list-empty";

interface Props {
  pane: ReactNode;
}

/** The list index: shows the list itself on mobile, an empty placeholder on desktop. */
function TaskListIndex({ pane }: Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return pane;
  }

  return <TaskListEmpty />;
}

export default TaskListIndex;
