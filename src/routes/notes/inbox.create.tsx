import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteCreatePane from "@/features/notes/NoteCreatePane";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/inbox/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const isMobile = useIsMobile();

  const createPane = (
    <NoteCreatePane
      onCancel={() => navigate({ to: "/notes/inbox" })}
      onCreated={(noteId) => navigate({ to: "/notes/inbox/$noteId", params: { noteId } })}
    />
  );

  if (isMobile) {
    return (
      <MobileScreen title="New note" onBack={() => navigate({ to: "/notes/inbox" })}>
        {createPane}
      </MobileScreen>
    );
  }

  return createPane;
}
