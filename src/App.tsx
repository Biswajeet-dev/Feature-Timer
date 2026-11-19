import { useEffect, useMemo, useState } from 'react';
import { ListChecks, Clock } from 'lucide-react';
import { AddTaskForm } from '@/components/AddTaskForm';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { STATUS_META } from '@/types';
import { isInWorkWindow, workWindowLabel } from '@/lib/timer';
import type { Task, TaskStatus } from '@/types';

function App() {
  const { tasks, loading, error, addTask, deleteTask, setStatus, syncTimer, setPeopleCount } = useTasks();
  const [workOpen, setWorkOpen] = useState(() => isInWorkWindow(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => {
      setWorkOpen(isInWorkWindow(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of tasks) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(56,189,248,0.08),transparent)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 ring-1 ring-inset ring-sky-500/30">
              <ListChecks className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-100">
                Task Timer
              </h1>
              <p className="text-sm text-slate-500">
                Track tasks with live countdown timers.
              </p>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              workOpen
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-slate-800/70 text-slate-400'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {workOpen ? 'Work hours active' : 'Outside work hours'}
          </div>
        </header>

        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2.5 text-xs text-slate-500">
          Work window: {workWindowLabel()}. Timers only burn during work hours — Mon–Fri 10am–6pm, Sat - Sun off. Each person on a task multiplies the burn rate.
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(['proposed', 'progress', 'halted', 'finished', 'rejected'] as const).map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_META[s].chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
              <span className="ml-1 text-slate-400/80">{counts[s] ?? 0}</span>
            </span>
          ))}
        </div>

        <div className="mb-8">
          <AddTaskForm onAdd={addTask} />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-slate-500">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 py-20 text-center">
            <p className="text-sm text-slate-500">
              No tasks yet. Add your first task above.
            </p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onSetStatus={(t: Task, s: TaskStatus) => setStatus(t, s)}
            onDelete={deleteTask}
            onTimeout={(t) => syncTimer(t)}
            onPeopleChange={(t, n) => setPeopleCount(t, n)}
          />
        )}

        <footer className="mt-16 border-t border-slate-900 pt-6 text-center text-xs text-slate-600">
          Timers burn only during work hours. Saved progress is kept across reloads.
        </footer>
      </div>
    </div>
  );
}

export default App;
