import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../ui/sidebar';
import ProjectsSection from './ProjectsSection';
import SyncSection from './sync/SyncSection';
import VaultSection from './VaultSection';

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <VaultSection />
      </SidebarHeader>
      <SidebarContent>
        <ProjectsSection />
      </SidebarContent>
      <SidebarFooter>
        <SyncSection />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
