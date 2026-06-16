import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteContentPane from "@/features/notes/NoteContentPane";
import { useNoteDetail } from "@/features/notes/use-note-detail";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/starred/$noteId")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { noteId } = Route.useParams();
  const { detail, isLoading } = useNoteDetail(noteId);
  const emptyState = isLoading ? "Loading note..." : "Note not found.";
  const navigateToStarred = () => navigate({ to: "/notes/starred" });

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Note" onBack={navigateToStarred}>
        {detail ? (
          <NoteContentPane detail={detail} onDeleted={navigateToStarred} />
        ) : (
          <NoteContentPane emptyState={emptyState} />
        )}
      </MobileScreen>
    );
  }

  return detail ? (
    <NoteContentPane detail={detail} onDeleted={navigateToStarred} />
  ) : (
    <NoteContentPane emptyState={emptyState} />
  );
}
