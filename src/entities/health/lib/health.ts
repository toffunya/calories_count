import type { WalkRecord, WaterRecord, WeightRecord } from '@/shared/db';
import type { DateKey } from '@/shared/lib';
import { db } from '@/shared/db';
import { shiftDateKey, toDateKey } from '@/shared/lib';

export const WATER_GOAL_GLASSES = 8;
export const DEFAULT_GLASS_ML = 250;

export function healthyWeightRange(heightCm: number): { min: number; max: number } {
  const metres = heightCm / 100;

  return {
    min: Math.round(18.5 * metres * metres),
    max: Math.round(24.9 * metres * metres),
  };
}

export function estimateWalkingKcal(steps: number, weightKg: number): number {
  return Math.max(0, Math.round(steps * 0.04 * (weightKg / 70)));
}

export function waterOfDay(date: DateKey): Promise<WaterRecord | undefined> {
  return db.waterLog.get(date);
}

export function waterFrom(date: DateKey): Promise<WaterRecord[]> {
  return db.waterLog.where('date').aboveOrEqual(date).toArray();
}

export async function setWaterGlasses(date: DateKey, glasses: number): Promise<void> {
  await db.waterLog.put({
    date,
    glasses: Math.max(0, Math.min(WATER_GOAL_GLASSES, Math.round(glasses))),
    glassMl: DEFAULT_GLASS_ML,
    updatedAt: Date.now(),
  });
}

export function walksOfDay(date: DateKey): Promise<WalkRecord[]> {
  return db.walks.where('date').equals(date).sortBy('startedAt');
}

export function walksFrom(date: DateKey): Promise<WalkRecord[]> {
  return db.walks.where('date').aboveOrEqual(date).toArray();
}

export async function startWalk(date: DateKey = toDateKey()): Promise<WalkRecord> {
  const active = await db.walks.where('date').equals(date).filter(walk => walk.endedAt === undefined).first();

  if (active) {
    return active;
  }

  const walk: WalkRecord = {
    id: crypto.randomUUID(),
    date,
    startedAt: Date.now(),
    steps: 0,
    burnedKcal: 0,
  };

  await db.walks.put(walk);
  return walk;
}

export async function finishWalk(id: string, steps: number, weightKg: number): Promise<void> {
  const walk = await db.walks.get(id);

  if (!walk) {
    return;
  }

  const roundedSteps = Math.max(0, Math.round(steps));
  await db.walks.put({
    ...walk,
    endedAt: Date.now(),
    steps: roundedSteps,
    burnedKcal: estimateWalkingKcal(roundedSteps, weightKg),
  });
}

export function weightHistory(): Promise<WeightRecord[]> {
  return db.weightLog.orderBy('date').toArray();
}

export function isMonthlyWeightDue(records: WeightRecord[], today: DateKey = toDateKey()): boolean {
  return !records.some(record => record.date.slice(0, 7) === today.slice(0, 7));
}

export function weightChange(records: WeightRecord[], days: number, today: DateKey = toDateKey()): number | undefined {
  if (!records.length) {
    return undefined;
  }

  const latest = records[records.length - 1];
  const cutoff = shiftDateKey(today, -days);
  const baseline = [...records].reverse().find(record => record.date <= cutoff) ?? records[0];

  return Math.round((latest.kg - baseline.kg) * 10) / 10;
}
