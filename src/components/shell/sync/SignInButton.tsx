import { SidebarMenuButton } from '@/components/ui/sidebar';
import { useMsal } from '@azure/msal-react';
import { CircleUserRound } from 'lucide-react';

function SignInButton() {
  const msal = useMsal();

  const handleLogin = async () => {
    try {
      await msal.instance.loginPopup({ scopes: ['https://graph.microsoft.com/.default'] });
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <SidebarMenuButton size="lg" disabled={msal.inProgress !== 'none'} onClick={handleLogin}>
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <CircleUserRound className="size-6" />
      </div>
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="font-medium">Sign in</span>
        <span className="">Sync with OneDrive</span>
      </div>
    </SidebarMenuButton>
  );
}

export default SignInButton;
