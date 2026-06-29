import type { ReactNode } from "react";
import { SidebarTrigger } from "../ui/sidebar";

interface Props {
  title: string;
  children?: ReactNode;
}

function ListPaneHeader({ title, children }: Props) {
  return (
    <header className="border-b px-2 py-2 flex items-center gap-1">
      <SidebarTrigger />
      <h1 className="text-xl font-semibold">{title}</h1>
      {children && <div className="ms-auto">{children}</div>}
    </header>
  );
}

export default ListPaneHeader;
