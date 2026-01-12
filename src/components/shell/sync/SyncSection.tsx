import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import SignInButton from './SignInButton';
import SyncButton from './SyncButton';

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
