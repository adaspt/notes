import { useParams } from 'react-router';
import { useLiveQuery } from 'dexie-react-hooks';
import { useForm } from '@tanstack/react-form';
import type { Task, TaskImportance, TaskStatus } from '@/model/tasks';
import { useTasksRepository } from '@/providers/tasksRepository';
import { useSyncScheduleService } from '@/providers/syncScheduleService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const importanceOptions: TaskImportance[] = ['high', 'normal', 'low'];
const statusOptions: TaskStatus[] = ['notStarted', 'inProgress', 'completed', 'waitingOnOthers', 'deferred'];

const formatDateTimeLocal = (value: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseDateTimeLocal = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString();
};

const mapTaskToFormValues = (task: Task) => ({
  title: task.title,
  body: task.body ?? '',
  importance: task.importance,
  status: task.status,
  startDateTime: formatDateTimeLocal(task.startDateTime),
  dueDateTime: formatDateTimeLocal(task.dueDateTime)
});

interface Props {
  task: Task;
}

function TaskDetailsForm({ task }: Props) {
  const tasksRepository = useTasksRepository();
  const syncScheduleService = useSyncScheduleService();

  const form = useForm({
    defaultValues: mapTaskToFormValues(task),
    onSubmit: async ({ value }) => {
      await tasksRepository.updateTask({
        ...task,
        title: value.title,
        body: value.body || null,
        importance: value.importance,
        status: value.status,
        startDateTime: parseDateTimeLocal(value.startDateTime),
        dueDateTime: parseDateTimeLocal(value.dueDateTime),
        lastModifiedDateTime: new Date().toISOString(),
        isDirty: 1
      });

      form.reset(value);

      syncScheduleService.requestSync();
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
            <Button type="submit" variant={isDirty ? 'destructive' : 'default'} disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
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

          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="startDateTime">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Start</Label>
                  <Input
                    id={field.name}
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="dueDateTime">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Due</Label>
                  <Input
                    id={field.name}
                    type="datetime-local"
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

function TaskDetails() {
  const tasksRepository = useTasksRepository();
  const { taskId } = useParams();

  const task = useLiveQuery(() => tasksRepository.getById(Number(taskId ?? -1)), [taskId]);

  if (!task) {
    return <div className="p-4 text-sm text-muted-foreground">Loading task...</div>;
  }

  return <TaskDetailsForm key={task.id} task={task} />;
}

export default TaskDetails;
