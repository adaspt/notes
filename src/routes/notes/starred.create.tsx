import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteCreatePane from "@/features/notes/NoteCreatePane";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/starred/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const isMobile = useIsMobile();

  const createPane = (
    <NoteCreatePane
      onCancel={() => navigate({ to: "/notes/starred" })}
      onCreated={(noteId) => navigate({ to: "/notes/inbox/$noteId", params: { noteId } })}
    />
  );

  if (isMobile) {
    return (
      <MobileScreen title="New note" onBack={() => navigate({ to: "/notes/starred" })}>
        {createPane}
      </MobileScreen>
    );
  }

  return createPane;
}
