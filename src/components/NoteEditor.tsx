import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { Crepe } from '@milkdown/crepe';
import { useState } from 'react';
import { getMarkdown } from '@milkdown/utils';
import { useRouteContext, useRouter } from '@tanstack/react-router';
import { SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  id: string;
  path: string;
  defaultValue: string;
}

const NoteEditorContent: FC<Props> = ({ id, path, defaultValue }) => {
  const router = useRouter();
  const { graph } = useRouteContext({ from: '__root__' });

  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const { get } = useEditor((root) =>
    new Crepe({ root, defaultValue }).on((ctx) =>
      ctx.markdownUpdated((_, value) => {
        setDirty(value !== defaultValue);
      })
    )
  );

  const handleSave = async () => {
    setError(false);
    setSaving(true);
    try {
      const editor = get();
      if (!editor) return;

      const value = editor.action(getMarkdown());
      await graph.api(`/me/drive/items/${id}/content`).put(value);
      await router.invalidate({ sync: true });
      setDirty(false);
    } catch (err) {
      console.error('Error saving document:', err);
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={cn('h-12 px-2 flex justify-between items-center border-b', error ? 'bg-red-100' : 'bg-gray-50')}>
        <div className="h-12 py-3 flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" />
          {path}
          {dirty && <span className="font-medium">*</span>}
        </div>
        <Button variant="default" disabled={saving} onClick={handleSave}>
          Save
        </Button>
      </div>
      <Milkdown />
    </>
  );
};

const NoteEditor: FC<Props> = ({ id, path, defaultValue }) => {
  return (
    <MilkdownProvider>
      <NoteEditorContent id={id} path={path} defaultValue={defaultValue} />
    </MilkdownProvider>
  );
};

export default NoteEditor;
