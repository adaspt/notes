import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function ListPaneMenuItem({ children }: Props) {
  return <li>{children}</li>;
}

export default ListPaneMenuItem;
