import NoteListInboxPane from "@/features/notes/list/note-list-inbox-pane";
import NoteListLayout from "@/features/notes/list/note-list-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NoteListLayout pane={<NoteListInboxPane />} />;
}
