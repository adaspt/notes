import { useStarredNotes } from "@/features/notes/data/use-starred-notes";
import NoteCreateDialog from "@/features/notes/details/note-create-dialog";
import { linkOptions } from "@tanstack/react-router";
import { useState } from "react";
import NoteListPane from "./note-list-pane";

function NoteListStarredPane() {
  const notes = useStarredNotes();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <NoteListPane
        title="Starred"
        items={notes.items}
        getLinkOptions={(note) =>
          linkOptions({ to: "/starred/$noteId", params: { noteId: note.id } })
        }
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <NoteCreateDialog
          projectId={null}
          starred
          onClose={() => setCreating(false)}
          getNotePath={(noteId) => ({ to: "/starred/$noteId", params: { noteId } })}
        />
      )}
    </>
  );
}

export default NoteListStarredPane;
