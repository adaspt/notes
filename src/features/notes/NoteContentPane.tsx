import MarkdownNoteEditor from "./MarkdownNoteEditor";
import type { NoteDetail } from "./note-data";
import NoteDetailActions from "./NoteDetailActions";
import PlainTextNoteViewer from "./PlainTextNoteViewer";

type NoteContentPaneProps =
  | {
      detail: NoteDetail;
      onDeleted?: () => void;
    }
  | {
      detail?: undefined;
      emptyState: string;
    };

function NoteContentPane(props: NoteContentPaneProps) {
  if (!props.detail) {
    return (
      <section
        className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground"
        aria-label="Note details"
      >
        {props.emptyState}
      </section>
    );
  }

  const { detail } = props;

  return (
    <article className="flex h-full min-h-0 flex-col" aria-label="Note details">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b px-6 py-5">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{detail.statusLabel}</p>
          <h2 className="truncate text-2xl font-semibold">{detail.title}</h2>
          <p className="text-sm text-muted-foreground">{detail.activityLabel}</p>
        </div>
        {props.onDeleted && (
          <NoteDetailActions
            noteId={detail.id}
            isStarred={detail.starred}
            noteTitle={detail.title}
            onDeleted={props.onDeleted}
          />
        )}
      </header>
      {detail.type === "markdown" ? (
        <MarkdownNoteEditor content={detail.content} noteId={detail.id} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          <PlainTextNoteViewer detail={detail} />
        </div>
      )}
    </article>
  );
}

export default NoteContentPane;
