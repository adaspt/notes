import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteContentPane from "@/features/notes/NoteContentPane";
import { useNoteDetail } from "@/features/notes/use-note-detail";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/$projectId/$noteId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { noteId, projectId } = Route.useParams();
  const { detail, isLoading } = useNoteDetail(noteId);
  const emptyState = isLoading ? "Loading note..." : "Note not found.";
  const navigateToProject = () => navigate({ to: "/notes/$projectId", params: { projectId } });

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Note" onBack={navigateToProject}>
        {detail ? (
          <NoteContentPane detail={detail} onDeleted={navigateToProject} />
        ) : (
          <NoteContentPane emptyState={emptyState} />
        )}
      </MobileScreen>
    );
  }

  return detail ? (
    <NoteContentPane detail={detail} onDeleted={navigateToProject} />
  ) : (
    <NoteContentPane emptyState={emptyState} />
  );
}
