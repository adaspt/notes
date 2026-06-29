import NoteListStarredPane from "@/features/notes/list/note-list-starred-pane";
import NoteListLayout from "@/features/notes/list/note-list-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/starred")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NoteListLayout pane={<NoteListStarredPane />} />;
}
