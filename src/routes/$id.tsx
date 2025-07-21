import { createFileRoute } from '@tanstack/react-router';
import { Crepe } from '@milkdown/crepe';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { getMarkdown } from '@milkdown/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/$id')({
  loader: async ({ context, params }) => {
    const response = await context.graph.api(`/me/drive/items/${params.id}/content`).get();
    const content = await new Response(response).text();

    return { content };
  },
  component: RouteComponent
});

function RouteComponent() {
  const params = Route.useParams();
  const { content } = Route.useLoaderData();

  return (
    <MilkdownProvider>
      <Header />
      <Editor key={params.id} defaultValue={content} />
    </MilkdownProvider>
  );
}

function Header() {
  const { graph } = Route.useRouteContext();
  const params = Route.useParams();
  const [_, getInstance] = useInstance();

  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError(false);
    setSaving(true);
    try {
      const editor = getInstance();
      if (!editor) return;

      const content = editor.action(getMarkdown());
      await graph.api(`/me/drive/items/${params.id}/content`).put(content);
    } catch (err) {
      console.error('Error saving document:', err);
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cn("p-4 flex justify-end items-center border-b", error ? "bg-red-100" : "bg-gray-50")}>
      <Button variant="default" disabled={saving} onClick={handleSave}>
        Save
      </Button>
    </div>
  );
}

function Editor({ defaultValue }: { defaultValue: string }) {
  useEditor((root) => new Crepe({ root, defaultValue })).get();

  return <Milkdown />;
}
