import { createFileRoute } from '@tanstack/react-router';
import NoteEditor from '@/components/NoteEditor';

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
    <NoteEditor key={params.id} id={params.id} content={content} />
  );
}
