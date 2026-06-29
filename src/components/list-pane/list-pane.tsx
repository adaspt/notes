import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

function ListPane({ children }: Props) {
  return <section className="h-svh flex flex-col md:border-r overflow-hidden">{children}</section>;
}

export default ListPane;
