import { createFileRoute } from "@tanstack/react-router";

import CreateActionButton from "@/features/app-shell/CreateActionButton";
import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteContentPane from "@/features/notes/NoteContentPane";
import NoteListPane from "@/features/notes/NoteListPane";
import { useInboxNotes } from "@/features/notes/use-note-lists";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/inbox/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { items, isLoading } = useInboxNotes();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Inbox" onBack={() => navigate({ to: "/" })}>
        <NoteListPane
          emptyState={isLoading ? "Loading notes..." : "No notes in inbox!"}
          floatingAction={
            <CreateActionButton
              label="New note"
              variant="floating"
              onClick={() => navigate({ to: "/notes/inbox/create" })}
            />
          }
          items={items}
          title="Inbox"
          showHeader={false}
          onSelectNote={(noteId) => navigate({ to: "/notes/inbox/$noteId", params: { noteId } })}
        />
      </MobileScreen>
    );
  }

  return <NoteContentPane emptyState="Select a note to view its details" />;
}
