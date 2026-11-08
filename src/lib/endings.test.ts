import { describe, expect, it } from 'vitest';
import it_ from './data/it.json';
import es from './data/es.json';
import type { LanguageData } from './types';
import { ENDINGS, cellForms } from './endings';

const DATA: Record<string, LanguageData> = { it: it_ as LanguageData, es: es as LanguageData };

describe('endings page', () => {
  for (const [code, tenses] of Object.entries(ENDINGS)) {
    const data = DATA[code];

    it(`${code}: covers every tense`, () => {
      expect(Object.keys(tenses).sort()).toEqual(data.tenses.map((t) => t.id).sort());
    });

    it(`${code}: every model form matches the verb data`, () => {
      for (const [tenseId, { columns }] of Object.entries(tenses)) {
        const tense = data.tenses.find((t) => t.id === tenseId)!;
        for (const column of columns) {
          const verb = data.verbs.find((v) => v.inf === column.verb);
          expect(verb, `${code} ${column.verb}`).toBeDefined();
          expect(column.cells, `${code} ${tenseId} ${column.verb}`).toHaveLength(tense.personal ? 6 : 1);
          column.cells.forEach((cell, person) => {
            const key = `${code}|${column.verb}|${tenseId}|${person}`;
            const accepted = verb!.forms[tenseId]?.[person] ?? null;
            if (cell === null) {
              expect(accepted, key).toBeNull();
              return;
            }
            for (const form of cellForms(cell)) expect(accepted, key).toContain(form);
          });
        }
      }
    });
  }
});
