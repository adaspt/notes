import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskRecord } from "@/data/schemas";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import TaskDeleteDialog from "./task-delete-dialog";

interface Props {
  task: TaskRecord;
  onNavigateToList: () => void;
}

function TaskOverflowMenu({ task, onNavigateToList }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon">
              <EllipsisVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <TaskDeleteDialog
        task={task}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onNavigateToList={onNavigateToList}
      />
    </>
  );
}

export default TaskOverflowMenu;
