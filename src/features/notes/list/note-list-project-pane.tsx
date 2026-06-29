import { useProject } from "@/features/notes/data/use-project";
import { useProjectNotes } from "@/features/notes/data/use-project-notes";
import NoteCreateDialog from "@/features/notes/details/note-create-dialog";
import { linkOptions } from "@tanstack/react-router";
import { useState } from "react";
import NoteListPane from "./note-list-pane";

interface Props {
  projectId: string;
}

function NoteListProjectPane({ projectId }: Props) {
  const notes = useProjectNotes(projectId);
  const { project } = useProject(projectId);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <NoteListPane
        title={project?.name ?? "Project"}
        items={notes.items}
        getLinkOptions={(note) =>
          linkOptions({
            to: "/projects/$projectId/$noteId",
            params: { projectId, noteId: note.id },
          })
        }
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <NoteCreateDialog
          projectId={projectId}
          onClose={() => setCreating(false)}
          getNotePath={(noteId) => ({
            to: "/projects/$projectId/$noteId",
            params: { projectId, noteId },
          })}
        />
      )}
    </>
  );
}

export default NoteListProjectPane;
