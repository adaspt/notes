import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import SignInButton from './sign-in-button';
import SyncButton from './sync-button';

function SyncSection() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <AuthenticatedTemplate>
          <SyncButton />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <SignInButton />
        </UnauthenticatedTemplate>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default SyncSection;
