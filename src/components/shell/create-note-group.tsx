import { Link, useParams } from 'react-router';
import { Button } from '../ui/button';
import { SidebarGroup, SidebarGroupContent, useSidebar } from '../ui/sidebar';

function CreateNoteGroup() {
  const { tasks = 'today' } = useParams();
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <Button className="w-full mb-1" asChild>
          <Link to={`/${tasks}/create`} onClick={() => isMobile && setOpenMobile(false)}>
            Create task
          </Link>
        </Button>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default CreateNoteGroup;
