import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type CreateActionButtonProps = {
  label: string;
  variant: "floating" | "header";
  onClick: () => void;
};

function CreateActionButton({ label, variant, onClick }: CreateActionButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center border",
        variant === "floating" &&
          "absolute bottom-4 right-4 z-10 size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90",
        variant === "header" && "size-9 shrink-0 rounded-md hover:bg-accent",
      )}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      <Plus className={variant === "floating" ? "size-5" : "size-4"} aria-hidden="true" />
    </button>
  );
}

export default CreateActionButton;
