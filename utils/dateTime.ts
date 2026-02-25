import type { Timing, TimeWindow } from '../types';

export const formatIntendedTime = (
  specificDateTime: string | undefined,
  timing: Timing | undefined,
): string => {
  if (!specificDateTime) {
    return timing === 'Right Now!' ? 'Right Now' : '';
  }

  if (timing === 'Later Today') {
    if (!specificDateTime.includes(':')) return '';
    const [hours, minutes] = specificDateTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}`;
  }

  if (timing === 'Sometime This Week') {
    const date = new Date(specificDateTime);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
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
