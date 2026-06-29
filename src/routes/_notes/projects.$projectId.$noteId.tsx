import NoteDetail from "@/features/notes/details/note-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/projects/$projectId/$noteId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId, noteId } = Route.useParams();
  const navigate = Route.useNavigate();

  return (
    <NoteDetail
      noteId={noteId}
      onNavigateToList={() => navigate({ to: "/projects/$projectId", params: { projectId } })}
    />
  );
}
