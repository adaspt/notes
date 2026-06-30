import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { Archive, Clock, Folder, Inbox, ListChecks, Notebook, Star } from "lucide-react";
import AuthSection from "../auth/auth-section";
import { useProjects } from "../notes/data/use-projects";
import SyncControls from "../sync/sync-controls";

function AppSidebar() {
  const projects = useProjects();
  const { isMobile, setOpenMobile } = useSidebar();

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Notebook />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Notes</span>
                <span className="">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link to="/today" activeProps={{ "data-active": "" }} onClick={closeOnMobile}>
                    <ListChecks />
                    Today
                  </Link>
                }
              ></SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link to="/later" activeProps={{ "data-active": "" }} onClick={closeOnMobile}>
                    <Clock />
                    Later
                  </Link>
                }
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link to="/backlog" activeProps={{ "data-active": "" }} onClick={closeOnMobile}>
                    <Archive />
                    Backlog
                  </Link>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Notes</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link to="/inbox" activeProps={{ "data-active": "" }} onClick={closeOnMobile}>
                    <Inbox />
                    Inbox
                  </Link>
                }
              />
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Link to="/starred" activeProps={{ "data-active": "" }} onClick={closeOnMobile}>
                    <Star />
                    Starred
                  </Link>
                }
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {projects.items.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarMenu>
              {projects.items.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    render={
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: project.id }}
                        activeProps={{ "data-active": "" }}
                        onClick={closeOnMobile}
                      >
                        <Folder />
                        {project.name}
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <AuthSection>
            <SyncControls />
          </AuthSection>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
