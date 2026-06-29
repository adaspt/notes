import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forwardRef, type ComponentProps, type ReactNode } from "react";

interface Props extends ComponentProps<typeof Button> {
  icon: ReactNode;
  label: string;
  isSet?: boolean;
}

const TaskControlButton = forwardRef<HTMLButtonElement, Props>(function TaskControlButton(
  { icon, label, isSet = true, className, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn(
        "w-full justify-start md:w-auto [&>span]:truncate",
        !isSet && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
});

export default TaskControlButton;
