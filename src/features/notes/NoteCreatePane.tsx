import NoteCreateForm from "./NoteCreateForm";

type NoteCreatePaneProps = {
  projectId?: string | null;
  onCancel: () => void;
  onCreated: (noteId: string) => void;
};

function NoteCreatePane({ projectId, onCancel, onCreated }: NoteCreatePaneProps) {
  return <NoteCreateForm projectId={projectId} onCancel={onCancel} onCreated={onCreated} />;
}

export default NoteCreatePane;
