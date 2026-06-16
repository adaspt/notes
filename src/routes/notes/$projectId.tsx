import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";

import NoteListPane from "@/features/notes/NoteListPane";
import { useProjectNotes } from "@/features/notes/use-note-lists";
import { useProject } from "@/features/notes/use-projects";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/notes/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const projectNoteRouteParams = useParams({
    from: "/notes/$projectId/$noteId",
    shouldThrow: false,
  });
  const navigate = Route.useNavigate();
  const { items, isLoading } = useProjectNotes(projectId);
  const { project } = useProject(projectId);

  const isMobile = useIsMobile();
  if (isMobile) {
    return <Outlet />;
  }

  return (
    <>
      <div className="h-full min-h-0 overflow-hidden border-r">
        <NoteListPane
          emptyState={isLoading ? "Loading notes..." : "No project notes!"}
          items={items}
          title={project?.name ?? "Project"}
          selectedNoteId={projectNoteRouteParams?.noteId}
          onCreateNote={() =>
            navigate({
              to: "/notes/$projectId/create",
              params: { projectId },
            })
          }
          onSelectNote={(noteId) =>
            navigate({
              to: "/notes/$projectId/$noteId",
              params: { projectId, noteId },
            })
          }
        />
      </div>
      <Outlet />
    </>
  );
}
