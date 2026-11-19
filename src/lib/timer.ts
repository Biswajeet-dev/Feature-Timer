import { useEffect, useRef, useState } from 'react';

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const hh = hours > 0 ? String(hours) : '0';
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

interface WorkWindow {
  startHour: number;
  endHour: number;
}

function getWorkWindow(date: Date): WorkWindow | null {
  const day = date.getDay();
  if (day === 0) return null;
  if (day === 6) return null;
  return { startHour: 10, endHour: 18 };
}

export function isInWorkWindow(now: Date): boolean {
  const window = getWorkWindow(now);
  if (!window) return false;
  const timeInSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  return timeInSeconds >= window.startHour * 3600 && timeInSeconds < window.endHour * 3600;
}

export function workWindowLabel(now: Date = new Date()): string {
  const day = now.getDay();
  if (day === 0) return 'Sun — off';
  if (day === 6) return 'Sat — off';
  return 'Mon–Fri 10am–6pm';
}

export function computeWorkSeconds(from: Date, to: Date): number {
  if (to.getTime() <= from.getTime()) return 0;
  let total = 0;
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const endDay = new Date(to.getFullYear(), to.getMonth(), to.getDate());

  while (cursor.getTime() <= endDay.getTime()) {
    const window = getWorkWindow(cursor);
    if (window) {
      const windowStart = new Date(
        cursor.getFullYear(), cursor.getMonth(), cursor.getDate(),
        window.startHour, 0, 0,
      );
      const windowEnd = new Date(
        cursor.getFullYear(), cursor.getMonth(), cursor.getDate(),
        window.endHour, 0, 0,
      );
      const segStart = windowStart.getTime() < from.getTime() ? from : windowStart;
      const segEnd = windowEnd.getTime() > to.getTime() ? to : windowEnd;
      if (segEnd.getTime() > segStart.getTime()) {
        total += (segEnd.getTime() - segStart.getTime()) / 1000;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return Math.floor(total);
}

export interface TimerState {
  remaining: number;
  isRunning: boolean;
  isWorking: boolean;
  finished: boolean;
}

export function computeRemaining(
  remainingSeconds: number,
  runningSince: string | null,
  durationSeconds: number,
  peopleCount: number,
  now: number = Date.now(),
): TimerState {
  const nowDate = new Date(now);
  const working = isInWorkWindow(nowDate);
  const people = Math.max(1, peopleCount);

  if (!runningSince) {
    return {
      remaining: remainingSeconds,
      isRunning: false,
      isWorking: false,
      finished: remainingSeconds <= 0,
    };
  }

  const workSeconds = computeWorkSeconds(new Date(runningSince), nowDate);
  const consumed = workSeconds * people;
  const remaining = remainingSeconds - consumed;

  if (remaining <= 0) {
    return { remaining: 0, isRunning: true, isWorking: working, finished: true };
  }
  return { remaining, isRunning: true, isWorking: working, finished: false };
}

export function useLiveTimer(
  runningSince: string | null,
  remainingSeconds: number,
  durationSeconds: number,
  peopleCount: number,
  status: string,
) {
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== 'progress' || !runningSince) return;
    const tick = () => {
      setNow(Date.now());
      timerRef.current = window.setTimeout(tick, 250) as unknown as number;
    };
    tick();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [status, runningSince]);

  return computeRemaining(remainingSeconds, runningSince, durationSeconds, peopleCount, now);
}
