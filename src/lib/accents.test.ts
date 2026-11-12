import { describe, expect, it } from 'vitest';
import it_ from './data/it.json';
import es from './data/es.json';
import type { LanguageData } from './types';
import { cycleAccent } from './accents';

describe('accent cycling', () => {
  it('cycles the letter before the cursor, both ways', () => {
    expect(cycleAccent('ame', 3, 'it', 1)).toBe('amè');
    expect(cycleAccent('amè', 3, 'it', 1)).toBe('amé');
    expect(cycleAccent('amé', 3, 'it', 1)).toBe('ame');
    expect(cycleAccent('ame', 3, 'it', -1)).toBe('amé');
    expect(cycleAccent('amo', 2, 'it', 1)).toBeNull(); // m has no accents
  });

  it('follows the language', () => {
    expect(cycleAccent('hablais', 5, 'es', 1)).toBe('habláis');
    expect(cycleAccent('a', 1, 'it', 1)).toBe('à');
    expect(cycleAccent('n', 1, 'es', 1)).toBe('ñ');
    expect(cycleAccent('n', 1, 'it', 1)).toBeNull();
    expect(cycleAccent('u', 1, 'es', 1)).toBe('ú');
    expect(cycleAccent('ú', 1, 'es', 1)).toBe('ü');
  });

  it('keeps capitals and ignores an empty position', () => {
    expect(cycleAccent('E', 1, 'it', 1)).toBe('È');
    expect(cycleAccent('abc', 0, 'it', 1)).toBeNull();
  });

  it('reaches every accented letter used in the verb data', () => {
    for (const data of [it_ as LanguageData, es as LanguageData]) {
      for (const v of data.verbs)
        for (const persons of Object.values(v.forms))
          for (const answers of persons)
            for (const form of answers ?? [])
              for (const ch of form.normalize('NFC')) {
                if (!/[^\x00-\x7f’]/.test(ch)) continue;
                const base = ch.normalize('NFD')[0];
                let text = base;
                const seen = new Set<string>();
                while (text !== ch && !seen.has(text)) {
                  seen.add(text);
                  text = cycleAccent(text, 1, data.code, 1) ?? text;
                }
                expect(text, `${data.code} ${v.inf} ${form}`).toBe(ch);
              }
    }
  });
});
