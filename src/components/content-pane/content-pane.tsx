import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

function ContentPane({ children }: Props) {
  return <article className="h-svh flex flex-col overflow-hidden">{children}</article>;
}

export default ContentPane;
