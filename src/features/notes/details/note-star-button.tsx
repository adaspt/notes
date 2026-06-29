import { Button } from "@/components/ui/button";
import type { NoteRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateNote } from "@/features/notes/data/note-mutations";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface Props {
  note: NoteRecord;
}

function NoteStarButton({ note }: Props) {
  const db = useDatabase();

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={note.starred ? "Unstar note" : "Star note"}
      onClick={() => void updateNote(db, note.id, { starred: !note.starred })}
    >
      <Star className={cn(note.starred && "fill-foreground text-foreground")} />
    </Button>
  );
}

export default NoteStarButton;
