import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

import NoteListPane from "@/features/notes/NoteListPane";
import { useStarredNotes } from "@/features/notes/use-note-lists";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/starred")({
  component: RouteComponent,
});

function RouteComponent() {
  const starredNoteRouteParams = useParams({ from: "/notes/starred/$noteId", shouldThrow: false });
  const navigate = Route.useNavigate();
  const { items, isLoading } = useStarredNotes();

  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden border-r">
        <NoteListPane
          emptyState={isLoading ? "Loading notes..." : "No starred notes!"}
          items={items}
          title="Starred"
          selectedNoteId={starredNoteRouteParams?.noteId}
          onCreateNote={() => navigate({ to: "/notes/starred/create" })}
          onSelectNote={(noteId) => navigate({ to: `/notes/starred/$noteId`, params: { noteId } })}
        />
      </div>
      <Outlet />
    </>
  );
}
