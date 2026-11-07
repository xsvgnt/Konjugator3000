import { describe, expect, it } from 'vitest';
import { grade } from './grading';
import { applyGrade, weightedSample, MAX_WEIGHT, MIN_WEIGHT } from './weights';

describe('grade', () => {
  it('accepts an exact match, ignoring case and spacing', () => {
    expect(grade('puedo', ['puedo'])).toBe('correct');
    expect(grade('  Puedo ', ['puedo'])).toBe('correct');
    expect(grade('ho  parlato', ['ho parlato'])).toBe('correct');
  });
  it('treats accent-only mistakes as passable', () => {
    expect(grade('hablabamos', ['hablábamos'])).toBe('passable');
    expect(grade('andro', ['andrò'])).toBe('passable');
    expect(grade('perche', ['perché'])).toBe('passable');
    expect(grade('andrò', ['andró'])).toBe('passable'); // wrong accent direction
    expect(grade('pidió', ['pidio'])).toBe('passable'); // extra accent
    expect(grade('ano', ['año'])).toBe('passable'); // ñ → n
    expect(grade('verguenza', ['vergüenza'])).toBe('passable'); // ü → u
  });
  it('marks anything else wrong', () => {
    expect(grade('podo', ['puedo'])).toBe('wrong');
    expect(grade('', ['puedo'])).toBe('wrong');
  });
  it('accepts any listed variant', () => {
    expect(grade('fuese', ['fuera', 'fuese'])).toBe('correct');
    expect(grade('è andata', ['è andato', 'è andata'])).toBe('correct');
  });
  it('tolerates retyping the prefix shown before the field', () => {
    expect(grade('no hables', ['hables'], 'no')).toBe('correct');
    expect(grade('hables', ['hables'], 'no')).toBe('correct');
  });
  it('unifies apostrophes and makes a final one optional', () => {
    expect(grade('va’', ["va'"])).toBe('correct');
    expect(grade('di', ["di'"])).toBe('correct');
    expect(grade("fa'", ['fai', "fa'"])).toBe('correct');
  });
});

describe('weights', () => {
  it('raises the weight after a mistake and lowers it after a success', () => {
    expect(applyGrade(undefined, 'wrong').w).toBe(2);
    expect(applyGrade(undefined, 'passable').w).toBeCloseTo(1.3);
    expect(applyGrade(undefined, 'correct').w).toBeCloseTo(0.7);
  });
  it('stays within bounds', () => {
    let s = applyGrade(undefined, 'wrong');
    for (let i = 0; i < 20; i++) s = applyGrade(s, 'wrong');
    expect(s.w).toBe(MAX_WEIGHT);
    for (let i = 0; i < 40; i++) s = applyGrade(s, 'correct');
    expect(s.w).toBe(MIN_WEIGHT);
    expect(s.seen).toBe(61);
  });
  it('samples without duplicates and favours heavy items', () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const sample = weightedSample(items, () => 1, 30);
    expect(new Set(sample).size).toBe(30);

    let heavyPicked = 0;
    for (let run = 0; run < 200; run++) {
      if (weightedSample(items, (i) => (i === 0 ? 16 : 1), 10).includes(0)) heavyPicked++;
    }
    // Uniform odds would be 10%; weight 16 should make item 0 far more frequent.
    expect(heavyPicked).toBeGreaterThan(100);
  });
  it('returns everything when asking for more than available', () => {
    expect(weightedSample([1, 2, 3], () => 1, 10).sort()).toEqual([1, 2, 3]);
  });
});
