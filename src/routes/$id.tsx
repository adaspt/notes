import { createFileRoute } from '@tanstack/react-router';
import type { DriveItem } from '@microsoft/microsoft-graph-types';
import NoteEditor from '@/components/NoteEditor';

const APP_ROOT = '/drive/root:/Apps/Notes';

export const Route = createFileRoute('/$id')({
  loader: async ({ context, params }) => {
    const item: DriveItem = await context.graph.api(`/me/drive/items/${params.id}`).get();
    const response = await context.graph.api(`/me/drive/items/${params.id}/content`).get();
    const content = await new Response(response).text();

    const path = `${item.parentReference?.path?.substring(APP_ROOT.length + 1)}/${item.name}`;

    return { path, content };
  },
  component: RouteComponent
});

function RouteComponent() {
  const params = Route.useParams();
  const { path, content } = Route.useLoaderData();

  return <NoteEditor key={params.id} id={params.id} path={path} defaultValue={content} />;
}
