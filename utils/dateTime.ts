import type { Timing, TimeWindow } from '../types';

export type TimeShortcut = 'Right now' | 'Tonight' | 'Tomorrow evening' | 'This weekend';

export const TIME_SHORTCUTS: TimeShortcut[] = [
  'Right now',
  'Tonight',
  'Tomorrow evening',
  'This weekend',
];

const toIsoLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const getDateTimeFromShortcut = (shortcut: TimeShortcut): string => {
  const now = new Date();
  const target = new Date(now);

  if (shortcut === 'Right now') {
    return toIsoLocal(now);
  }

  if (shortcut === 'Tonight') {
    target.setHours(19, 0, 0, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return toIsoLocal(target);
  }

  if (shortcut === 'Tomorrow evening') {
    target.setDate(target.getDate() + 1);
    target.setHours(19, 0, 0, 0);
    return toIsoLocal(target);
  }

  // This weekend (Saturday 6 PM)
  const day = target.getDay(); // 0 Sunday - 6 Saturday
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  target.setDate(target.getDate() + daysUntilSaturday);
  target.setHours(18, 0, 0, 0);
  return toIsoLocal(target);
};

export const normalizeTimeInput = (value: string): string => {
  if (TIME_SHORTCUTS.includes(value as TimeShortcut)) {
    return getDateTimeFromShortcut(value as TimeShortcut);
  }
  return value;
};

export const formatPlanningDateTime = (value?: string): string => {
  if (!value) return '';
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export const formatIntendedTime = (
  specificDateTime: string | undefined,
  timing: Timing | undefined,
): string => {
  if (!specificDateTime) {
    return timing === 'Right Now!' ? 'Right Now' : '';
  }

  if (timing === 'Later Today') {
    const parsed = new Date(specificDateTime);
    if (isNaN(parsed.getTime())) return '';
    return `Today at ${parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
  }

  if (timing === 'Sometime This Week') {
    return formatPlanningDateTime(specificDateTime);
  }

  return '';
};

export const parseSpecificDateTime = (specificDateTime?: string): Date => {
  let startDate = new Date();

  if (!specificDateTime) {
    return startDate;
  }

  if (specificDateTime.includes('T')) {
    startDate = new Date(specificDateTime);
  } else if (specificDateTime.includes(':')) {
    const [hours, minutes] = specificDateTime.split(':').map(Number);
    startDate.setHours(hours, minutes, 0, 0);
  }

  if (isNaN(startDate.getTime())) {
    return new Date();
  }

  return startDate;
};

export const getDurationHours = (timeWindow?: TimeWindow | string): number => {
  if (!timeWindow) return 2;
  if (timeWindow.includes('1-2')) return 2;
  if (timeWindow.includes('3-4')) return 4;
  if (timeWindow.includes('5+')) return 5;
  if (timeWindow.includes('8+')) return 8;
  return 2;
};
