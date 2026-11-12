// Accent cycling for keyboards without accent keys: ↑ turns the letter before the cursor into
// its next accented form (e → è → é → e in Italian), ↓ goes back.

/** Accented forms per base letter, most common first. */
const CYCLES: Record<string, Record<string, string>> = {
  it: { a: 'à', e: 'èé', i: 'ì', o: 'ò', u: 'ù' },
  es: { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'úü', n: 'ñ' }
};

/** For a language not listed above: the usual Western European accents. */
const FALLBACK: Record<string, string> = {
  a: 'àáâä', e: 'èéêë', i: 'ìíîï', o: 'òóôö', u: 'ùúûü', n: 'ñ', c: 'ç'
};

/** The full cycle containing `ch` (lower case), e.g. "eèé", or null if it has no accents. */
function cycleOf(ch: string, lang: string): string | null {
  const table = CYCLES[lang] ?? FALLBACK;
  for (const [base, accented] of Object.entries(table)) {
    const cycle = base + accented;
    if (cycle.includes(ch)) return cycle;
  }
  return null;
}

/**
 * Cycles the letter just before `pos`. Returns the new text, or null when that letter has no
 * accented forms (the arrow key then keeps its usual behaviour). The cursor stays where it was.
 */
export function cycleAccent(text: string, pos: number, lang: string, step: 1 | -1): string | null {
  if (pos <= 0 || pos > text.length) return null;
  const ch = text[pos - 1];
  const lower = ch.toLowerCase();
  const cycle = cycleOf(lower, lang);
  if (!cycle) return null;
  let next = cycle[(cycle.indexOf(lower) + step + cycle.length) % cycle.length];
  if (ch !== lower) next = next.toUpperCase();
  return text.slice(0, pos - 1) + next + text.slice(pos);
}
