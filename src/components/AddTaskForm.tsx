import { useState } from 'react';
import { Plus, Clock, Users } from 'lucide-react';

interface Props {
  onAdd: (title: string, taskDate: string, hours: number, minutes: number, people: number) => void;
}

export function AddTaskForm({ onAdd }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [people, setPeople] = useState('1');
  const [expanded, setExpanded] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Math.max(0, parseInt(hours) || 0);
    const m = Math.max(0, parseInt(minutes) || 0);
    const p = Math.max(1, parseInt(people) || 1);
    if (!title.trim() || h + m === 0) return;
    onAdd(title, date, h, m, p);
    setTitle('');
    setHours('0');
    setMinutes('30');
    setPeople('1');
    setExpanded(false);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title…"
            className="flex-1 bg-transparent text-base text-slate-100 placeholder-slate-500 outline-none"
            onFocus={() => setExpanded(true)}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-400 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {expanded && (
          <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <span>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-slate-100 outline-none focus:border-slate-500 [color-scheme:dark]"
              />
            </label>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-16 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-slate-100 outline-none focus:border-slate-500"
              />
              <span className="text-slate-500">h</span>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-16 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-slate-100 outline-none focus:border-slate-500"
              />
              <span className="text-slate-500">m</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="h-4 w-4" />
              <input
                type="number"
                min="1"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="w-16 rounded-lg border border-slate-700 bg-slate-800/60 px-2 py-1.5 text-slate-100 outline-none focus:border-slate-500"
              />
              <span className="text-slate-500">people</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
