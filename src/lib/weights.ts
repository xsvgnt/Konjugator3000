import type { Grade, ItemStats } from './types';

export const WEIGHT_FACTOR: Record<Grade, number> = { correct: 0.7, passable: 1.3, wrong: 2 };
export const MIN_WEIGHT = 0.25;
export const MAX_WEIGHT = 16;
/** Items never asked before get a small boost so new material shows up. */
export const UNSEEN_WEIGHT = 1.5;

export function emptyStats(): ItemStats {
  return { w: 1, seen: 0, correct: 0, passable: 0, wrong: 0, last: 0 };
}

export function applyGrade(stats: ItemStats | undefined, g: Grade, now = Date.now()): ItemStats {
  const s = stats ? { ...stats } : emptyStats();
  s.w = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, s.w * WEIGHT_FACTOR[g]));
  s.seen += 1;
  s[g] += 1;
  s.last = now;
  return s;
}

export function effectiveWeight(stats: ItemStats | undefined): number {
  return stats ? stats.w : UNSEEN_WEIGHT;
}

/**
 * Weighted random sampling without replacement (Efraimidis–Spirakis):
 * each item gets key u^(1/w) and the n largest keys win.
 */
export function weightedSample<T>(items: T[], weightOf: (t: T) => number, n: number, rand = Math.random): T[] {
  if (n >= items.length) return shuffle(items.slice(), rand);
  const keyed = items.map((item) => ({ item, k: Math.pow(rand(), 1 / Math.max(weightOf(item), 1e-6)) }));
  keyed.sort((a, b) => b.k - a.k);
  return shuffle(keyed.slice(0, n).map((x) => x.item), rand);
}

export function shuffle<T>(a: T[], rand = Math.random): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
