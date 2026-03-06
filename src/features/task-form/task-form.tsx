import { useForm } from '@tanstack/react-form';
import { formatDateLocal } from '@/lib/dates';
import type { Task, TaskImportance, TaskStatus } from '@/model/tasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const importanceOptions: TaskImportance[] = ['high', 'normal', 'low'];
const statusOptions: TaskStatus[] = ['notStarted', 'inProgress', 'completed', 'waitingOnOthers', 'deferred'];

const mapTaskToFormValues = (task: Task) => ({
  title: task.title,
  body: task.body ?? '',
  importance: task.importance,
  status: task.status,
  startDateTime: task.startDateTime ?? '',
  dueDateTime: task.dueDateTime ?? ''
});

const mapFormValuesToTask = (task: Task, value: ReturnType<typeof mapTaskToFormValues>): Task => {
  return {
    ...task,
    title: value.title,
    body: value.body || null,
    importance: value.importance,
    status: value.status,
    startDateTime: value.startDateTime || null,
    dueDateTime: value.dueDateTime || null,
    lastModifiedDateTime: new Date().toISOString(),
    isDirty: 1
  };
};

interface Props {
  task: Task;
  onSave: (task: Task) => Promise<void>;
  onComplete?: (task: Task) => Promise<void>;
}

function TaskForm({ task, onSave, onComplete }: Props) {
  const form = useForm({
    defaultValues: mapTaskToFormValues(task),
    onSubmit: async ({ value }) => {
      await onSave(mapFormValuesToTask(task, value));
      form.reset();
    }
  });

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="flex items-center justify-end gap-2 border-b p-1">
        <form.Subscribe
          selector={(state) => [state.isDirty, state.isSubmitting]}
          children={([isDirty, isSubmitting]) => (
            <>
              {task.id > 0 && task.status !== 'completed' && onComplete && (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    const completedTask: Task = {
                      ...mapFormValuesToTask(task, form.state.values),
                      status: 'completed',
                      completedDateTime: formatDateLocal(new Date().toISOString())
                    };
                    void onComplete(completedTask);
                  }}
                >
                  Complete
                </Button>
              )}
              <Button type="submit" variant={isDirty ? 'destructive' : 'default'} disabled={!isDirty || isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        />
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <form.Field name="title">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Title</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Task title"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="body">
            {(field) => (
              <div className="grid gap-2">
                <Label htmlFor={field.name}>Body</Label>
                <Textarea
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="Task details"
                  className="min-h-32 resize-y"
                />
              </div>
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <form.Field name="importance">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Importance</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(event) => field.handleChange(event as TaskImportance)}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      {importanceOptions.map((importance) => (
                        <SelectItem key={importance} value={importance}>
                          {importance}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="status">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Status</Label>
                  <Select value={field.state.value} onValueChange={(event) => field.handleChange(event as TaskStatus)}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="dueDateTime">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Due</Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </div>
      </div>
    </form>
  );
}

export default TaskForm;
