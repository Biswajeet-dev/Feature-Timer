import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { computeWorkSeconds, isInWorkWindow } from '@/lib/timer';
import type { Task, TaskStatus } from '@/types';

function isTimerActive(status: TaskStatus): boolean {
  return status === 'progress';
}

function elapsedWorkSince(runningSince: string): number {
  return computeWorkSeconds(new Date(runningSince), new Date());
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('task_date', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setTasks((data as Task[]) ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(
    async (
      title: string,
      taskDate: string,
      hours: number,
      minutes: number,
      people: number,
    ) => {
      const duration = Math.max(1, hours * 3600 + minutes * 60);
      const peopleCount = Math.max(1, people);
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: title.trim(),
          task_date: taskDate,
          duration_seconds: duration,
          remaining_seconds: duration,
          status: 'proposed',
          running_since: null,
          people_count: peopleCount,
        })
        .select()
        .single();
      if (error) {
        setError(error.message);
        return null;
      }
      setTasks((prev) => [data as Task, ...prev]);
      return data as Task;
    },
    [],
  );

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setStatus = useCallback(async (task: Task, next: TaskStatus) => {
    const now = new Date().toISOString();
    let patch: Partial<Task> = { status: next };
    const people = Math.max(1, task.people_count);

    if (isTimerActive(next) && task.running_since === null) {
      if (task.remaining_seconds <= 0) {
        patch.running_since = now;
        patch.remaining_seconds = task.duration_seconds;
      } else {
        patch.running_since = now;
      }
    }

    if (!isTimerActive(next) && task.running_since) {
      const workSeconds = elapsedWorkSince(task.running_since);
      const remaining = Math.max(0, task.remaining_seconds - workSeconds * people);
      patch.running_since = null;
      patch.remaining_seconds = remaining;
    }

    if (next === 'finished') {
      patch.running_since = null;
      if (task.running_since) {
        const workSeconds = elapsedWorkSince(task.running_since);
        patch.remaining_seconds = Math.max(0, task.remaining_seconds - workSeconds * people);
      }
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', task.id)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? (data as Task) : t)));
  }, []);

  const syncTimer = useCallback(async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ remaining_seconds: 0, running_since: null, status: 'finished' })
      .eq('id', task.id);
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, remaining_seconds: 0, running_since: null, status: 'finished' }
          : t,
      ),
    );
  }, []);

  const setPeopleCount = useCallback(async (task: Task, count: number) => {
    const people = Math.max(1, count);
    let patch: Partial<Task> = { people_count: people };

    if (task.running_since) {
      const workSeconds = elapsedWorkSince(task.running_since);
      const remaining = Math.max(
        0,
        task.remaining_seconds - workSeconds * Math.max(1, task.people_count),
      );
      patch = { people_count: people, running_since: new Date().toISOString(), remaining_seconds: remaining };
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', task.id)
      .select()
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? (data as Task) : t)));
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    deleteTask,
    setStatus,
    syncTimer,
    setPeopleCount,
    reload: load,
  };
}
