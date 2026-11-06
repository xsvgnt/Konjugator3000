import type { Grade } from './types';

/** Lower-case, trim, collapse spaces, unify apostrophes. Case and extra spaces never matter. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[’‘`´]/g, "'")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** normalize() and drop every diacritic (ò→o, é→e, ñ→n, ü→u). */
export function stripAccents(s: string): string {
  return normalize(s).normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC');
}

/**
 * correct  = matches one of the expected answers exactly (ignoring case and spacing)
 * passable = matches once accents are ignored
 * wrong    = anything else
 *
 * `answerPrefix` (e.g. "no" for a negative imperative) is shown before the field, so typing
 * it again is tolerated.
 */
export function grade(input: string, expected: string[], answerPrefix?: string): Grade {
  let given = normalize(input);
  if (answerPrefix) {
    const p = normalize(answerPrefix) + ' ';
    if (given.startsWith(p)) given = given.slice(p.length);
  }
  if (expected.some((e) => normalize(e) === given)) return 'correct';
  const bare = stripAccents(given);
  if (expected.some((e) => stripAccents(e) === bare)) return 'passable';
  return 'wrong';
}
