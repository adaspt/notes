import { createFileRoute } from "@tanstack/react-router";

import CreateActionButton from "@/features/app-shell/CreateActionButton";
import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteContentPane from "@/features/notes/NoteContentPane";
import NoteListPane from "@/features/notes/NoteListPane";
import { useStarredNotes } from "@/features/notes/use-note-lists";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/starred/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { items, isLoading } = useStarredNotes();

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title="Starred" onBack={() => navigate({ to: "/" })}>
        <NoteListPane
          emptyState={isLoading ? "Loading notes..." : "No starred notes!"}
          floatingAction={
            <CreateActionButton
              label="New note"
              variant="floating"
              onClick={() => navigate({ to: "/notes/starred/create" })}
            />
          }
          items={items}
          title="Starred"
          showHeader={false}
          onSelectNote={(noteId) => navigate({ to: "/notes/starred/$noteId", params: { noteId } })}
        />
      </MobileScreen>
    );
  }

  return <NoteContentPane emptyState="Select a note to view its details" />;
}
