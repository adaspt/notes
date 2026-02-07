import { RefreshCw } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useSyncScheduleService } from '@/providers/syncScheduleService';
import { useEffect, useState, useSyncExternalStore } from 'react';

function SyncButton() {
  const syncScheduleService = useSyncScheduleService();

  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const synchronizing = useSyncExternalStore<boolean>(
    (onStoreChange) => syncScheduleService.subscribe(onStoreChange),
    () => syncScheduleService.isSynchronizing
  );

  useEffect(() => {
    if (!synchronizing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLastSyncTime(new Date());
    }
  }, [synchronizing]);

  const handleSync = async () => {
    syncScheduleService.requestSync();
  };

  return (
    <SidebarMenuButton size="lg" disabled={synchronizing} onClick={handleSync}>
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <RefreshCw className={cn('size-5', { 'animate-spin': synchronizing })} />
      </div>
      <div className="flex flex-col gap-0.5 leading-none">
        <span className="font-medium">Sync with OneDrive</span>
        <span className="">Last: {lastSyncTime ? lastSyncTime.toLocaleString() : '-'}</span>
      </div>
    </SidebarMenuButton>
  );
}

export default SyncButton;
