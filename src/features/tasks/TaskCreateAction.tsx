import CreateActionButton from "@/features/app-shell/CreateActionButton";

type TaskCreateActionProps = {
  onClick: () => void;
};

function TaskCreateAction({ onClick }: TaskCreateActionProps) {
  return <CreateActionButton label="New task" variant="floating" onClick={onClick} />;
}

export default TaskCreateAction;
