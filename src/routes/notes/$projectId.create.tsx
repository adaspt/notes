import { createFileRoute } from "@tanstack/react-router";

import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteCreatePane from "@/features/notes/NoteCreatePane";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/$projectId/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { projectId } = Route.useParams();
  const isMobile = useIsMobile();

  const createPane = (
    <NoteCreatePane
      projectId={projectId}
      onCancel={() => navigate({ to: "/notes/$projectId", params: { projectId } })}
      onCreated={(noteId) =>
        navigate({ to: "/notes/$projectId/$noteId", params: { projectId, noteId } })
      }
    />
  );

  if (isMobile) {
    return (
      <MobileScreen
        title="New note"
        onBack={() => navigate({ to: "/notes/$projectId", params: { projectId } })}
      >
        {createPane}
      </MobileScreen>
    );
  }

  return createPane;
}
