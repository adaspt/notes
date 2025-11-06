import { forwardRef, useImperativeHandle } from 'react';
import { Milkdown, useEditor } from '@milkdown/react';
import { Crepe } from '@milkdown/crepe';
import { getMarkdown } from '@milkdown/utils';

interface Props {
  defaultValue: string;
  onChange?: (isDirty: boolean) => void;
}

export interface NoteEditorRef {
  getContent: () => string;
}

const NoteEditorContent = forwardRef<NoteEditorRef, Props>(function ({ defaultValue, onChange }, ref) {
  const { get } = useEditor((root) =>
    new Crepe({ root, defaultValue }).on((ctx) =>
      ctx.markdownUpdated((_, value) => {
        onChange?.(value !== defaultValue);
      })
    )
  );

  useImperativeHandle(ref, () => ({
    getContent: () => get()?.action(getMarkdown()) || ''
  }));

  return (
    <div>
      <Milkdown />
    </div>
  );
});

export default NoteEditorContent;
