import type { DateKey } from '@/shared/lib';

const HEADROOM = 1.12;

export interface DayTotal {
  date: DateKey;
  kcal: number;
}

export interface WeekSummary {
  total: number;
  average: number;
  trackedDays: number;
  averagePercent: number;
}

export function weekTotals(days: DateKey[], totals: Map<DateKey, number>): DayTotal[] {
  return days.map(date => ({ date, kcal: totals.get(date) ?? 0 }));
}

export function summarizeWeek(days: DayTotal[], target: number): WeekSummary {
  const tracked = days.filter(day => day.kcal > 0);
  const total = tracked.reduce((sum, day) => sum + day.kcal, 0);
  const average = tracked.length ? Math.round(total / tracked.length) : 0;

  return {
    total,
    average,
    trackedDays: tracked.length,
    averagePercent: target > 0 ? Math.round((average / target) * 100) : 0,
  };
}

export function chartScale(days: DayTotal[], target: number): number {
  return Math.round(Math.max(target, ...days.map(day => day.kcal), 1) * HEADROOM);
}
