import NoteListIndex from "@/features/notes/list/note-list-index";
import NoteListInboxPane from "@/features/notes/list/note-list-inbox-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/inbox/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <NoteListIndex pane={<NoteListInboxPane />} />;
}
