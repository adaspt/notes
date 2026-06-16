import type { NoteDetail } from "./note-data";

type PlainTextNoteViewerProps = {
  detail: NoteDetail;
};

function PlainTextNoteViewer({ detail }: PlainTextNoteViewerProps) {
  return (
    <section className="py-5" aria-label="Note body">
      <pre className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {detail.content.trim() || "No note content."}
      </pre>
    </section>
  );
}

export default PlainTextNoteViewer;
