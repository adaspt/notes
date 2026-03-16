import { Plus } from 'lucide-react';
import { Link, useMatch, useParams } from 'react-router';
import { Button } from '@/components/ui/button';

function CreateTaskFab() {
  const { tasks = 'today' } = useParams();
  const isCreateRoute = useMatch('/:tasks?/create');

  if (isCreateRoute) {
    return null;
  }

  return (
    <Button asChild className="fixed right-4 bottom-4 z-50 size-14 rounded-full shadow-lg sm:right-6 sm:bottom-6">
      <Link to={`/${tasks}/create`} aria-label="Create task">
        <Plus className="size-5" />
      </Link>
    </Button>
  );
}

export default CreateTaskFab;
