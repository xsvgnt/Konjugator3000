import { describe, expect, it } from 'vitest';
import it_ from './data/it.json';
import es from './data/es.json';
import type { LanguageData, Settings } from './types';
import { buildPool, selectedGroups, tensesByBlock, verbsInGroups } from './quiz';

const IT = it_ as LanguageData;
const ES = es as LanguageData;
const settings = (over: Partial<Settings> = {}): Settings => ({ lang: 'it', groups: {}, excluded: {}, tenses: {}, count: 20, ...over });

describe('verb groups', () => {
  it('every verb belongs to one of its language groups', () => {
    for (const data of [IT, ES]) {
      const ids = new Set(data.groups.map((g) => g.id));
      for (const v of data.verbs) expect(ids.has(v.group), `${data.code} ${v.inf}: ${v.group}`).toBe(true);
    }
  });
  it('selects every group until the user changes it', () => {
    expect(selectedGroups(IT, settings())).toEqual(['regular', 'irregular', 'spelling', 'participle']);
    expect(verbsInGroups(IT, settings())).toHaveLength(IT.verbs.length);
  });
  it('filters verbs by the selected groups', () => {
    const only = verbsInGroups(IT, settings({ groups: { it: ['participle'] } }));
    expect(only.length).toBeGreaterThan(0);
    expect(only.every((v) => v.group === 'participle')).toBe(true);
  });
});

describe('tense blocks', () => {
  it('follows the WordReference layout for Italian', () => {
    expect(tensesByBlock(IT.tenses).map((b) => b.block)).toEqual([
      'Indicativo', 'Tempi composti', 'Condizionale', 'Congiuntivo', 'Imperativo', 'Forme nominali'
    ]);
    const nominal = tensesByBlock(IT.tenses).find((b) => b.block === 'Forme nominali')!;
    expect(nominal.tenses.map((t) => t.name)).toContain('Participio presente');
  });
});

describe('defective forms', () => {
  it('never asks piovere in the first or second person, nor its imperative', () => {
    const pool = buildPool(IT, settings({ excluded: { it: IT.verbs.filter((v) => v.inf !== 'piovere').map((v) => v.inf) }, tenses: { it: IT.tenses.map((t) => t.id) } }));
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((i) => !i.tense.personal || i.person === 2 || i.person === 5)).toBe(true);
    expect(pool.some((i) => i.tense.mood === 'Imperativo')).toBe(false);
  });
});
