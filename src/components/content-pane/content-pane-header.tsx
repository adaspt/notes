import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

interface Props {
  title: ReactNode;
  mobileTitle: string;
  children?: ReactNode;
  onBack: () => void;
}

function ContentPaneHeader({ title, mobileTitle, children, onBack }: Props) {
  return (
    <header className="border-b">
      <div className="flex items-center gap-2 sm:hidden border-b px-4 py-2">
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={onBack}>
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-xl font-semibold">{mobileTitle}</h1>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <h2 className="min-w-0 flex-1 text-2xl font-semibold">{title}</h2>
        <div className="flex gap-1">{children}</div>
      </div>
    </header>
  );
}

export default ContentPaneHeader;
