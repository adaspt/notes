import { useInboxNotes } from "@/features/notes/data/use-inbox-notes";
import NoteCreateDialog from "@/features/notes/details/note-create-dialog";
import { linkOptions } from "@tanstack/react-router";
import { useState } from "react";
import NoteListPane from "./note-list-pane";

function NoteListInboxPane() {
  const notes = useInboxNotes();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <NoteListPane
        title="Inbox"
        items={notes.items}
        getLinkOptions={(note) =>
          linkOptions({ to: "/inbox/$noteId", params: { noteId: note.id } })
        }
        onCreate={() => setCreating(true)}
      />
      {creating && (
        <NoteCreateDialog
          projectId={null}
          onClose={() => setCreating(false)}
          getNotePath={(noteId) => ({ to: "/inbox/$noteId", params: { noteId } })}
        />
      )}
    </>
  );
}

export default NoteListInboxPane;
