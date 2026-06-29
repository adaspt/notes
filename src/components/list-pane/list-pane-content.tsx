import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function ListPaneContent({ children }: Props) {
  return <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>;
}

export default ListPaneContent;
