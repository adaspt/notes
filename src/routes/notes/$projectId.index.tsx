import { createFileRoute } from "@tanstack/react-router";

import CreateActionButton from "@/features/app-shell/CreateActionButton";
import MobileScreen from "@/features/app-shell/MobileScreen";
import NoteContentPane from "@/features/notes/NoteContentPane";
import NoteListPane from "@/features/notes/NoteListPane";
import { useProjectNotes } from "@/features/notes/use-note-lists";
import { useProject } from "@/features/notes/use-projects";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/$projectId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { projectId } = Route.useParams();
  const { items, isLoading } = useProjectNotes(projectId);
  const { project } = useProject(projectId);

  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <MobileScreen title={project?.name ?? "Project"} onBack={() => navigate({ to: "/" })}>
        <NoteListPane
          emptyState={isLoading ? "Loading notes..." : "No project notes!"}
          floatingAction={
            <CreateActionButton
              label="New note"
              variant="floating"
              onClick={() =>
                navigate({
                  to: "/notes/$projectId/create",
                  params: { projectId },
                })
              }
            />
          }
          items={items}
          title={project?.name ?? "Project"}
          showHeader={false}
          onSelectNote={(noteId) =>
            navigate({ to: "/notes/$projectId/$noteId", params: { projectId, noteId } })
          }
        />
      </MobileScreen>
    );
  }

  return <NoteContentPane emptyState="Select a note to view its details" />;
}
