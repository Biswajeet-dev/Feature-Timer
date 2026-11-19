import type { Task, TaskStatus } from '@/types';
import { TaskItem } from '@/components/TaskItem';

interface Props {
  tasks: Task[];
  onSetStatus: (task: Task, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onTimeout: (task: Task) => void;
  onPeopleChange: (task: Task, count: number) => void;
}

function formatGroupLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return 'Today';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function TaskList({ tasks, onSetStatus, onDelete, onTimeout, onPeopleChange }: Props) {
  const groups = new Map<string, Task[]>();
  for (const t of tasks) {
    const arr = groups.get(t.task_date) ?? [];
    arr.push(t);
    groups.set(t.task_date, arr);
  }
  const sortedDates = [...groups.keys()].sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="flex flex-col gap-6">
      {sortedDates.map((date) => (
        <section key={date}>
          <div className="mb-2.5 flex items-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {formatGroupLabel(date)}
            </h2>
            <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-400">
              {groups.get(date)!.length}
            </span>
            <div className="h-px flex-1 bg-slate-800/70" />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {groups
              .get(date)!
              .map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onSetStatus={onSetStatus}
                  onDelete={onDelete}
                  onTimeout={onTimeout}
                  onPeopleChange={onPeopleChange}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
