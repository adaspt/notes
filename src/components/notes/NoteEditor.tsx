import { forwardRef } from 'react';
import { MilkdownProvider } from '@milkdown/react';
import NoteEditorContent, { type NoteEditorRef } from './NoteEditorContent';

interface Props {
  defaultValue: string;
  onChange?: (isDirty: boolean) => void;
}

const NoteEditor = forwardRef<NoteEditorRef, Props>(function ({ defaultValue, onChange }, ref) {
  return (
    <MilkdownProvider>
      <NoteEditorContent ref={ref} defaultValue={defaultValue} onChange={onChange} />
    </MilkdownProvider>
  );
});

export default NoteEditor;
