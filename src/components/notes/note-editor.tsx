import { Crepe } from '@milkdown/crepe';
import { Milkdown, useEditor } from '@milkdown/react';
import { memo } from 'react';

interface Props {
  defaultValue: string;
  onChange: (value: string) => void;
}

const NoteEditor = memo(({ defaultValue, onChange }: Props) => {
  useEditor((root) => {
    return new Crepe({ root, defaultValue }).on((ctx) => {
      ctx.markdownUpdated((_, newValue) => {
        onChange(newValue);
      });
    });
  });

  return <Milkdown />;
});

export default NoteEditor;
