export type TaskStatus = 'proposed' | 'progress' | 'halted' | 'finished' | 'rejected';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  task_date: string;
  duration_seconds: number;
  remaining_seconds: number;
  running_since: string | null;
  people_count: number;
  created_at: string;
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; dot: string; text: string; ring: string; chip: string }
> = {
  proposed: {
    label: 'Proposed',
    dot: 'bg-slate-400',
    text: 'text-slate-300',
    ring: 'ring-slate-700/60',
    chip: 'bg-slate-700/40 text-slate-300',
  },
  progress: {
    label: 'In Progress',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    ring: 'ring-sky-500/40',
    chip: 'bg-sky-500/15 text-sky-300',
  },
  halted: {
    label: 'Halted',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    ring: 'ring-amber-500/40',
    chip: 'bg-amber-500/15 text-amber-300',
  },
  finished: {
    label: 'Finished',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    ring: 'ring-emerald-500/40',
    chip: 'bg-emerald-500/15 text-emerald-300',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    ring: 'ring-rose-500/40',
    chip: 'bg-rose-500/15 text-rose-300',
  },
};

export const STATUS_ORDER: TaskStatus[] = [
  'proposed',
  'progress',
  'halted',
  'finished',
  'rejected',
];
