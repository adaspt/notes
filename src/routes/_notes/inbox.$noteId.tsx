import NoteDetail from "@/features/notes/details/note-detail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_notes/inbox/$noteId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { noteId } = Route.useParams();
  const navigate = Route.useNavigate();

  return <NoteDetail noteId={noteId} onNavigateToList={() => navigate({ to: "/inbox" })} />;
}
