import { ArrowLeft } from "lucide-react";

import type { ReactNode } from "react";

type MobileScreenProps = {
  children: ReactNode;
  title: string;
  onBack: () => void;
};

function MobileScreen({ children, title, onBack }: MobileScreenProps) {
  return (
    <section className="flex h-svh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-2">
        <button
          className="inline-flex size-10 items-center justify-center rounded-md hover:bg-accent"
          type="button"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <h1 className="min-w-0 truncate text-base font-semibold">{title}</h1>
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export default MobileScreen;
