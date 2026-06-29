import NoteListProjectPane from "@/features/notes/list/note-list-project-pane";
import NoteListLayout from "@/features/notes/list/note-list-layout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/projects/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <NoteListLayout pane={<NoteListProjectPane projectId={projectId} />} />;
}
