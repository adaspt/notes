import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading1, Heading2, Italic, List, ListOrdered } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import MarkdownToolbarButton from "./MarkdownToolbarButton";
import { editNoteContent } from "./note-mutations";

type MarkdownNoteEditorProps = {
  content: string;
  noteId: string;
};

const inactiveToolbarState = {
  bold: false,
  bulletList: false,
  heading1: false,
  heading2: false,
  italic: false,
  orderedList: false,
};

const autoSaveDelayMs = 2_000;

function MarkdownNoteEditor({ content, noteId }: MarkdownNoteEditorProps) {
  const [draftRevision, setDraftRevision] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedNoteIdRef = useRef(noteId);
  const savedContentRef = useRef(content);

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    contentType: "markdown",
    editorProps: {
      attributes: {
        "aria-label": "Markdown note editor",
        class: "min-h-96 w-full px-6 py-5 text-sm leading-6 outline-none prose-note-editor",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();
      setDraftRevision((revision) => revision + 1);
      setIsDirty(markdown !== savedContentRef.current);
      setError(null);
    },
  });

  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor) {
          return inactiveToolbarState;
        }

        return {
          bold: editor.isActive("bold"),
          bulletList: editor.isActive("bulletList"),
          heading1: editor.isActive("heading", { level: 1 }),
          heading2: editor.isActive("heading", { level: 2 }),
          italic: editor.isActive("italic"),
          orderedList: editor.isActive("orderedList"),
        };
      },
    }) ?? inactiveToolbarState;

  useEffect(() => {
    if (!editor) {
      return;
    }

    const isSameNote = loadedNoteIdRef.current === noteId;
    if (isSameNote) {
      if (content === savedContentRef.current) {
        return;
      }

      if (editor.getMarkdown() === content) {
        savedContentRef.current = content;
        setIsDirty(false);
        setError(null);
        return;
      }

      if (isDirty || isSaving || editor.isFocused) {
        return;
      }
    }

    loadedNoteIdRef.current = noteId;
    savedContentRef.current = content;
    editor.commands.setContent(content, { contentType: "markdown", emitUpdate: false });
    setIsDirty(false);
    setError(null);
  }, [content, editor, isDirty, isSaving, noteId]);

  const saveContent = useCallback(
    async (markdown: string) => {
      if (!editor) {
        return;
      }

      setIsSaving(true);
      setError(null);

      const previousSavedContent = savedContentRef.current;
      savedContentRef.current = markdown;

      try {
        await editNoteContent(noteId, markdown);
        setIsDirty(editor.getMarkdown() !== markdown);
      } catch (saveError) {
        if (savedContentRef.current === markdown) {
          savedContentRef.current = previousSavedContent;
        }
        setIsDirty(editor.getMarkdown() !== savedContentRef.current);
        setError(saveError instanceof Error ? saveError.message : "Could not save note.");
      } finally {
        setIsSaving(false);
      }
    },
    [editor, noteId],
  );

  useEffect(() => {
    if (!editor || !isDirty || isSaving) {
      return;
    }

    const autoSaveTimer = setTimeout(() => {
      void saveContent(editor.getMarkdown());
    }, autoSaveDelayMs);

    return () => {
      clearTimeout(autoSaveTimer);
    };
  }, [draftRevision, editor, isDirty, isSaving, saveContent]);

  const saveStatusLabel = getSaveStatusLabel({ error, isDirty, isSaving });

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Markdown note">
      <div className="flex min-h-12 items-center gap-1 border-b px-4">
        <MarkdownToolbarButton
          isActive={toolbarState.bold}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden="true" size={16} />
        </MarkdownToolbarButton>
        <MarkdownToolbarButton
          isActive={toolbarState.italic}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden="true" size={16} />
        </MarkdownToolbarButton>
        <MarkdownToolbarButton
          isActive={toolbarState.heading1}
          label="Heading 1"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 aria-hidden="true" size={16} />
        </MarkdownToolbarButton>
        <MarkdownToolbarButton
          isActive={toolbarState.heading2}
          label="Heading 2"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 aria-hidden="true" size={16} />
        </MarkdownToolbarButton>
        <MarkdownToolbarButton
          isActive={toolbarState.bulletList}
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden="true" size={16} />
        </MarkdownToolbarButton>
        <MarkdownToolbarButton
          isActive={toolbarState.orderedList}
          label="Numbered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden="true" size={16} />
        </MarkdownToolbarButton>
        <div className="ml-auto flex items-center gap-2">
          <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {saveStatusLabel}
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}

function getSaveStatusLabel({
  error,
  isDirty,
  isSaving,
}: {
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
}) {
  if (error) {
    return `Sync failed: ${error}`;
  }

  if (isSaving) {
    return "Saving...";
  }

  if (isDirty) {
    return "Saving soon...";
  }

  return "Saved";
}

export default MarkdownNoteEditor;
