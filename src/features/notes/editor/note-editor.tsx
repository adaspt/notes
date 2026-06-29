import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { NoteRecord } from "@/data/schemas";
import { useDatabase } from "@/data/use-database";
import { updateNote } from "@/features/notes/data/note-mutations";
import Link from "@tiptap/extension-link";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useBlocker } from "@tanstack/react-router";
import { Markdown } from "tiptap-markdown";
import { useCallback, useEffect, useRef, useState } from "react";
import NoteToolbar from "./note-toolbar";

interface Props {
  note: NoteRecord;
}

interface MarkdownStorage {
  markdown: {
    getMarkdown: () => string;
  };
}

function NoteEditor({ note }: Props) {
  const db = useDatabase();
  const [isDirty, setIsDirty] = useState(false);
  // Mirror of isDirty for the resync effect below, which must not depend on isDirty
  // (so it doesn't fire on save) but still needs to avoid clobbering unsaved edits.
  const dirtyRef = useRef(false);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: false,
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Link.configure({ openOnClick: false }),
        Markdown,
      ],
      content: note.body,
      editorProps: {
        attributes: {
          class:
            "note-editor-content min-h-full px-4 py-4 text-sm outline-none focus-visible:ring-0",
        },
      },
      onUpdate: () => {
        dirtyRef.current = true;
        setIsDirty(true);
      },
    },
    [note.id],
  );

  // Warn before navigating away (in-app or browser-level) while there are unsaved edits.
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  });

  // Switching notes recreates the editor (deps above); start it clean.
  useEffect(() => {
    dirtyRef.current = false;
    setIsDirty(false);
  }, [note.id]);

  // Apply external changes (e.g. from sync) without overwriting unsaved local edits.
  useEffect(() => {
    if (!editor || dirtyRef.current) return;
    if (getMarkdown(editor) !== note.body) {
      editor.commands.setContent(note.body);
    }
  }, [editor, note.body]);

  const save = useCallback(() => {
    if (!editor || !isDirty) return;
    void updateNote(db, note.id, { body: getMarkdown(editor) });
    dirtyRef.current = false;
    setIsDirty(false);
  }, [db, editor, isDirty, note.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "s") {
        return;
      }

      event.preventDefault();
      save();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  const saveAndProceed = () => {
    save();
    blocker.proceed?.();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NoteToolbar
        editor={editor}
        actions={
          <Button type="button" size="sm" onClick={save} disabled={!isDirty}>
            Save
          </Button>
        }
      />
      <div className="min-h-0 flex-1 overflow-auto">
        <EditorContent editor={editor} className="min-h-full" />
      </div>

      <AlertDialog open={blocker.status === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              This note has unsaved changes. Save them before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>Keep editing</AlertDialogCancel>
            <Button type="button" variant="outline" onClick={() => blocker.proceed?.()}>
              Discard
            </Button>
            <AlertDialogAction onClick={saveAndProceed}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const getMarkdown = (editor: Editor) =>
  (editor.storage as unknown as MarkdownStorage).markdown.getMarkdown();

export default NoteEditor;
