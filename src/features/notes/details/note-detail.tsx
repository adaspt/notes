import ContentPane from "@/components/content-pane/content-pane";
import ContentPaneHeader from "@/components/content-pane/content-pane-header";
import { useNote } from "@/features/notes/data/use-note";
import NoteEditor from "@/features/notes/editor/note-editor";
import NoteDetailsNotFound from "./note-details-not-found";
import NoteDetailsSkeleton from "./note-details-skeleton";
import NoteOverflowMenu from "./note-overflow-menu";
import NoteStarButton from "./note-star-button";
import NoteTitle from "./note-title";

interface Props {
  noteId: string;
  onNavigateToList: () => void;
}

function NoteDetail({ noteId, onNavigateToList }: Props) {
  const { note, isLoading } = useNote(noteId);

  if (isLoading) {
    return <NoteDetailsSkeleton onBack={onNavigateToList} />;
  }

  if (!note) {
    return <NoteDetailsNotFound onBack={onNavigateToList} />;
  }

  return (
    <ContentPane>
      <ContentPaneHeader
        title={<NoteTitle note={note} />}
        mobileTitle="Note"
        onBack={onNavigateToList}
      >
        <NoteStarButton note={note} />
        <NoteOverflowMenu note={note} onNavigateToList={onNavigateToList} />
      </ContentPaneHeader>
      <NoteEditor note={note} />
    </ContentPane>
  );
}

export default NoteDetail;
