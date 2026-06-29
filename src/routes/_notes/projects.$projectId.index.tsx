import NoteListIndex from "@/features/notes/list/note-list-index";
import NoteListProjectPane from "@/features/notes/list/note-list-project-pane";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/projects/$projectId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  return <NoteListIndex pane={<NoteListProjectPane projectId={projectId} />} />;
}
