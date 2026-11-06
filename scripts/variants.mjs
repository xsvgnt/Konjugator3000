// Expansion of the shorthand used in the source spreadsheets.
//
//   "c(u)ociamo"        -> cociamo, cuociamo          (optional letters)
//   "perso/duto"        -> perso, perduto             (alternative ending)
//   "bevvi/vei/vetti"   -> bevvi, bevei, bevetti
//   "va'/vai"           -> va', vai
//
// An alternative after "/" replaces the end of the base form. Where it attaches is
// guessed from the infinitive: inside the part the base form shares with the
// infinitive, the alternative attaches at the last letter equal to its own first
// letter (ignoring accents); if there is none, right after that shared part.
// Every expansion is written to the conversion report so it can be reviewed.

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function sharedPrefixLength(a, b) {
  const x = strip(a.toLowerCase());
  const y = strip(b.toLowerCase());
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  return i;
}

/** Expands one alternative ending against its base form. */
export function attachAlternative(base, alt, infinitive) {
  if (!alt) return base;
  const limit = sharedPrefixLength(base, infinitive);
  const first = strip(alt[0].toLowerCase());
  let at = -1;
  for (let i = 0; i < limit; i++) {
    if (strip(base[i].toLowerCase()) === first) at = i;
  }
  if (at < 0) at = limit;
  return base.slice(0, at) + alt;
}

/** "c(u)ociamo" -> ["cociamo", "cuociamo"] (works with several groups). */
export function expandOptional(word) {
  const m = word.match(/^(.*?)\(([^()]*)\)(.*)$/);
  if (!m) return [word];
  const [, before, inside, after] = m;
  return [...expandOptional(before + after), ...expandOptional(before + inside + after)];
}

/** Expands a single word that may use "/" and "( )" shorthand. */
export function expandWord(word, infinitive) {
  const parts = word.split('/');
  const base = parts[0];
  const forms = [base, ...parts.slice(1).map((alt) => attachAlternative(base, alt, infinitive))];
  return forms.flatMap(expandOptional);
}

/** Expands a whole cell ("ho perso/duto") into every accepted answer. */
export function expandCell(cell, infinitive) {
  const words = cell.split(' ');
  let results = [''];
  for (const w of words) {
    const options = expandWord(w, infinitive);
    results = results.flatMap((r) => options.map((o) => (r ? r + ' ' + o : o)));
  }
  return [...new Set(results)];
}
