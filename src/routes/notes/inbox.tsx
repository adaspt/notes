import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

import NoteListPane from "@/features/notes/NoteListPane";
import { useInboxNotes } from "@/features/notes/use-note-lists";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/inbox")({
  component: RouteComponent,
});

function RouteComponent() {
  const inboxNoteRouteParams = useParams({ from: "/notes/inbox/$noteId", shouldThrow: false });
  const navigate = Route.useNavigate();
  const { items, isLoading } = useInboxNotes();

  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden border-r">
        <NoteListPane
          emptyState={isLoading ? "Loading notes..." : "No notes in inbox!"}
          items={items}
          title="Inbox"
          selectedNoteId={inboxNoteRouteParams?.noteId}
          onCreateNote={() => navigate({ to: "/notes/inbox/create" })}
          onSelectNote={(noteId) => navigate({ to: `/notes/inbox/$noteId`, params: { noteId } })}
        />
      </div>
      <Outlet />
    </>
  );
}
