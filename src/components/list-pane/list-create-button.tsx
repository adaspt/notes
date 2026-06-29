import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
  label: string;
}

/** Inline header button on desktop; a floating action button on mobile. */
function ListCreateButton({ onClick, label }: Props) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Button
        size="icon-lg"
        aria-label={label}
        onClick={onClick}
        className="fixed right-6 bottom-6 z-40 size-14 rounded-full shadow-lg"
      >
        <Plus className="size-6" />
      </Button>
    );
  }

  return (
    <Button size="icon-sm" variant="outline" aria-label={label} onClick={onClick}>
      <Plus />
    </Button>
  );
}

export default ListCreateButton;
