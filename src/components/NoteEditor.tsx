import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { Crepe } from '@milkdown/crepe';
import { Fragment, useState } from 'react';
import { getMarkdown } from '@milkdown/utils';
import { useRouteContext, useRouter } from '@tanstack/react-router';
import { Bookmark } from 'lucide-react';
import { useStore } from '@tanstack/react-store';
import { SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from './ui/breadcrumb';
import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { addBookmark, bookmarkStore, removeBookmark } from '@/stores/bookmarkStore';

interface Props {
  id: string;
  path: string;
  defaultValue: string;
}

const NoteEditorContent: FC<Props> = ({ id, path, defaultValue }) => {
  const router = useRouter();
  const { graph } = useRouteContext({ from: '__root__' });
  const isBookmarked = useStore(bookmarkStore, (bookmarks) => bookmarks.some((b) => b.id === id));

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

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(id);
    } else {
      addBookmark({ id, title: path });
    }
  };

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
          <Breadcrumb>
            <BreadcrumbList>
              {path
                .split('/')
                .filter(Boolean)
                .map((segment, index) => (
                  <Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
                    <BreadcrumbItem>{segment}</BreadcrumbItem>
                  </Fragment>
                ))}
            </BreadcrumbList>
          </Breadcrumb>
          <Button variant="ghost" onClick={handleToggleBookmark}>
            <Bookmark fill={isBookmarked ? '#81a1c1' : 'transparent'} />
          </Button>
        </div>
        <Button variant={dirty ? 'destructive' : 'default'} disabled={saving} onClick={handleSave}>
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
