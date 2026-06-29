import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function ListPaneMenu({ children }: Props) {
  return <ul className="divide-y">{children}</ul>;
}

export default ListPaneMenu;
