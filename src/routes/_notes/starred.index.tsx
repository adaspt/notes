import NoteListIndex from "@/features/notes/list/note-list-index";
import NoteListStarredPane from "@/features/notes/list/note-list-starred-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/starred/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NoteListIndex pane={<NoteListStarredPane />} />;
}
