import { createFileRoute } from '@tanstack/react-router';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Route = createFileRoute('/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div className="h-12 px-2 flex justify-between items-center border-b bg-gray-50">
      <SidebarTrigger />
    </div>
  );
}
