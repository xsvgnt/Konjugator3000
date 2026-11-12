import { describe, expect, it } from 'vitest';
import { moodKey, tenseShape } from './tenseStyle';
import es from './data/es.json';
import it_ from './data/it.json';

describe.each([
  ['es', es],
  ['it', it_]
])('tense style (%s)', (_, data) => {
  it('gives every mood a color', () => {
    for (const t of data.tenses) expect(moodKey(t.mood), t.mood).toBeDefined();
  });
  it('gives every tense a shape', () => {
    for (const t of data.tenses) expect(tenseShape(t.id), t.id).toBeDefined();
  });
});
