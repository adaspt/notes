import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { NoteRecord } from "@/data/schemas";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import NoteDeleteDialog from "./note-delete-dialog";

interface Props {
  note: NoteRecord;
  onNavigateToList: () => void;
}

function NoteOverflowMenu({ note, onNavigateToList }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon" variant="ghost" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <NoteDeleteDialog
        note={note}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onNavigateToList={onNavigateToList}
      />
    </>
  );
}

export default NoteOverflowMenu;
