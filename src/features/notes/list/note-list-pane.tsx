import ListCreateButton from "@/components/list-pane/list-create-button";
import ListPane from "@/components/list-pane/list-pane";
import ListPaneContent from "@/components/list-pane/list-pane-content";
import ListPaneHeader from "@/components/list-pane/list-pane-header";
import ListPaneMenu from "@/components/list-pane/list-pane-menu";
import ListPaneMenuItem from "@/components/list-pane/list-pane-menu-item";
import { Button } from "@/components/ui/button";
import type { NoteRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateNote } from "@/features/notes/data/note-mutations";
import { cn } from "@/lib/utils";
import { Link, type LinkProps } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { formatRelativeTime, noteSnippet } from "./note-format";

interface Props {
  title: string;
  items: NoteRecord[];
  getLinkOptions: (item: NoteRecord) => LinkProps;
  onCreate: () => void;
}

function NoteListPane({ title, items, getLinkOptions, onCreate }: Props) {
  const db = useDatabase();

  return (
    <ListPane>
      <ListPaneHeader title={title}>
        <ListCreateButton onClick={onCreate} label="New note" />
      </ListPaneHeader>
      <ListPaneContent>
        {items.length > 0 && (
          <ListPaneMenu>
            {items.map((note) => (
              <ListPaneMenuItem key={note.id}>
                <div className="group/item relative">
                  <Link
                    className="block w-full px-4 py-3 pr-12 hover:bg-accent"
                    activeProps={{ className: "bg-accent" }}
                    {...getLinkOptions(note)}
                  >
                    <span className="block truncate text-sm font-medium">{note.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">
                      {noteSnippet(note.body)}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {formatRelativeTime(note.updatedAt)}
                    </span>
                  </Link>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={note.starred ? "Unstar note" : "Star note"}
                    className="absolute top-3 right-3"
                    onClick={() => void updateNote(db, note.id, { starred: !note.starred })}
                  >
                    <Star className={cn(note.starred && "fill-foreground text-foreground")} />
                  </Button>
                </div>
              </ListPaneMenuItem>
            ))}
          </ListPaneMenu>
        )}
      </ListPaneContent>
    </ListPane>
  );
}

export default NoteListPane;
