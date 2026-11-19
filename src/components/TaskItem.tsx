import { useEffect, useRef, useState } from 'react';
import {
  Play, Pause, Ban, CheckCircle2, Clock, Trash2, CircleDot, Users,
} from 'lucide-react';
import type { Task, TaskStatus } from '@/types';
import { STATUS_META, STATUS_ORDER } from '@/types';
import { formatDuration, useLiveTimer } from '@/lib/timer';

interface Props {
  task: Task;
  onSetStatus: (task: Task, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onTimeout: (task: Task) => void;
  onPeopleChange: (task: Task, count: number) => void;
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  proposed: <CircleDot className="h-3.5 w-3.5" />,
  progress: <Play className="h-3.5 w-3.5" />,
  halted: <Pause className="h-3.5 w-3.5" />,
  finished: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <Ban className="h-3.5 w-3.5" />,
};

export function TaskItem({ task, onSetStatus, onDelete, onTimeout, onPeopleChange }: Props) {
  const timer = useLiveTimer(
    task.running_since,
    task.remaining_seconds,
    task.duration_seconds,
    task.people_count,
    task.status,
  );
  const finishedHandled = useRef(false);
  const [editingPeople, setEditingPeople] = useState(false);
  const [peopleDraft, setPeopleDraft] = useState(String(task.people_count));

  useEffect(() => {
    setPeopleDraft(String(task.people_count));
  }, [task.people_count]);

  useEffect(() => {
    if (timer.finished && task.status === 'progress' && !finishedHandled.current) {
      finishedHandled.current = true;
      onTimeout(task);
    }
    if (task.status !== 'progress') {
      finishedHandled.current = false;
    }
  }, [timer.finished, task, onTimeout]);

  const meta = STATUS_META[task.status];
  const progressPct =
    task.duration_seconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((task.duration_seconds - timer.remaining) / task.duration_seconds) * 100,
          ),
        )
      : 0;

  const commitPeople = () => {
    const n = Math.max(1, parseInt(peopleDraft) || 1);
    setPeopleDraft(String(n));
    setEditingPeople(false);
    if (n !== task.people_count) onPeopleChange(task, n);
  };

  return (
    <div
      className={`group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 ring-1 ring-inset ${meta.ring} transition hover:border-slate-700`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              className={`truncate text-[15px] font-medium ${
                task.status === 'finished' ? 'text-slate-400 line-through' : 'text-slate-100'
              }`}
            >
              {task.title}
            </h3>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${meta.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {formatDuration(task.duration_seconds)} set
            </span>
            {editingPeople ? (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Users className="h-3 w-3" />
                <input
                  autoFocus
                  type="number"
                  min="1"
                  value={peopleDraft}
                  onChange={(e) => setPeopleDraft(e.target.value)}
                  onBlur={commitPeople}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commitPeople(); }
                    if (e.key === 'Escape') { setPeopleDraft(String(task.people_count)); setEditingPeople(false); }
                  }}
                  className="w-12 rounded border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-slate-100 outline-none focus:border-slate-500"
                />
              </span>
            ) : (
              <button
                onClick={() => setEditingPeople(true)}
                className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-2 py-0.5 text-xs text-slate-400 transition hover:bg-slate-700/70 hover:text-slate-200"
              >
                <Users className="h-3 w-3" />
                {task.people_count} {task.people_count === 1 ? 'person' : 'people'}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="rounded-lg p-1.5 text-slate-600 opacity-0 transition hover:bg-slate-800 hover:text-rose-400 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div
          className={`font-mono text-2xl tabular-nums tracking-tight ${
            task.status === 'finished'
              ? 'text-emerald-400'
              : timer.isRunning
                ? timer.isWorking
                  ? 'text-sky-300'
                  : 'text-slate-400'
                : 'text-slate-300'
          }`}
        >
          {formatDuration(timer.remaining)}
        </div>
        {timer.isRunning && timer.isWorking && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
          </span>
        )}
        {timer.isRunning && !timer.isWorking && (
          <span className="text-xs text-slate-500">outside work hours</span>
        )}
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            task.status === 'finished' ? 'bg-emerald-400' : 'bg-sky-400'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {STATUS_ORDER.map((s) => {
          const active = task.status === s;
          return (
            <button
              key={s}
              onClick={() => onSetStatus(task, s)}
              disabled={active}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                active
                  ? `${STATUS_META[s].chip} cursor-default`
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {STATUS_ICONS[s]}
              {STATUS_META[s].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
