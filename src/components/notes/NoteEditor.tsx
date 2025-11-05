import { forwardRef } from 'react';
import { MilkdownProvider } from '@milkdown/react';
import NoteEditorContent, { type NoteEditorRef } from './NoteEditorContent';

interface Props {
  defaultValue: string;
}

const NoteEditor = forwardRef<NoteEditorRef, Props>(function ({ defaultValue }, ref) {
  return (
    <MilkdownProvider>
      <NoteEditorContent ref={ref} defaultValue={defaultValue} />
    </MilkdownProvider>
  );
});

export default NoteEditor;
