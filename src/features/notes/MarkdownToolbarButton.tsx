import type { ReactNode } from "react";

type MarkdownToolbarButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function MarkdownToolbarButton({
  children,
  disabled,
  isActive,
  label,
  onClick,
}: MarkdownToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        "inline-flex size-8 items-center justify-center rounded-md border text-muted-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        isActive ? "border-primary bg-primary text-primary-foreground" : "bg-background",
      ].join(" ")}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default MarkdownToolbarButton;
