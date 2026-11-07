// Converts the conjugation spreadsheets into the JSON files used by the app.
//
//   npm run convert
//
// Input : one .xlsx per language (see LANGUAGES below) + data/translations.en.json
//         (+ a verb list with groups, for languages that have one)
// Output: src/lib/data/<code>.json, src/lib/data/languages.json, data/conversion-report.md
//
// Spreadsheet layout (one sheet per tense):
//   row 1      : (empty) (empty) pronoun1 ... pronoun6
//   next rows  : group  infinitive  form1 ... form6
// Sheets listed with `columns` hold non-personal forms (gerund, participles): one column each.
//
// Verb groups come either from column A of every sheet (Spanish: reg/irreg) or from a separate
// verb list (Italian: italian_list.xlsx, column A = infinitive, column B = group). With a verb
// list, only the verbs it names are converted; other rows in the sheets are skipped.

import ExcelJS from 'exceljs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandCell } from './variants.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const LANGUAGES = [
  {
    code: 'es', name: 'Spanish', native: 'Español', file: 'spanish-verbs.xlsx',
    pronouns: ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'],
    groups: [{ id: 'regular', label: 'Regular' }, { id: 'irregular', label: 'Irregular' }],
    groupValues: { reg: 'regular', irreg: 'irregular' },
    sheets: {
      'Indicativo Presente': { id: 'ind-presente', mood: 'Indicativo', name: 'Presente' },
      'Indicativo Pretérito': { id: 'ind-preterito', mood: 'Indicativo', name: 'Pretérito' },
      'Indicativo Imperfecto': { id: 'ind-imperfecto', mood: 'Indicativo', name: 'Imperfecto' },
      'Indicativo Futuro': { id: 'ind-futuro', mood: 'Indicativo', name: 'Futuro' },
      'Indicativo Condicional': { id: 'ind-condicional', mood: 'Indicativo', name: 'Condicional' },
      'Subjuntivo Presente': { id: 'sub-presente', mood: 'Subjuntivo', name: 'Presente' },
      'Subjuntivo Imperfecto': { id: 'sub-imperfecto', mood: 'Subjuntivo', name: 'Imperfecto', seVariant: true },
      'Imperativo': { id: 'imp-afirmativo', mood: 'Imperativo', name: 'Afirmativo' },
      'Imperativo Negativo': { id: 'imp-negativo', mood: 'Imperativo', name: 'Negativo', answerPrefix: 'no' },
      'Infinitivos': {
        columns: {
          gerundio: { id: 'gerundio', mood: 'Formas no personales', name: 'Gerundio' },
          participio: { id: 'participio', mood: 'Formas no personales', name: 'Participio' }
        }
      }
    }
  },
  {
    code: 'it', name: 'Italian', native: 'Italiano', file: 'italian-verbs.xlsx',
    pronouns: ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'],
    cellsStartWithPronoun: true,
    verbList: 'italian_list.xlsx',
    groups: [
      { id: 'regular', label: 'Regular' },
      { id: 'irregular', label: 'Irregular' },
      { id: 'spelling', label: 'Spelling change' },
      { id: 'participle', label: 'Irregular participle' }
    ],
    groupValues: { reg: 'regular', irreg: 'irregular', spelling: 'spelling', 'participio passato': 'participle' },
    // Shorthand the automatic expansion gets wrong: rewritten in full before expanding.
    shorthandFixes: {
      'aprii/ersi': 'aprii/apersi',
      'aprì/erse': 'aprì/aperse',
      'aprirono/ersero': 'aprirono/apersero'
    },
    // Order and blocks follow WordReference's conjugation pages. `block` groups tenses in the
    // tense picker; `mood` is what a question shows ("Indicativo · Passato prossimo").
    sheets: {
      'Indicativo presente': { id: 'ind-presente', mood: 'Indicativo', name: 'Presente' },
      'Indicativo imperfetto': { id: 'ind-imperfetto', mood: 'Indicativo', name: 'Imperfetto' },
      'Indicativo passato remoto': { id: 'ind-passato-remoto', mood: 'Indicativo', name: 'Passato remoto' },
      'Indicativo futuro semplice': { id: 'ind-futuro-semplice', mood: 'Indicativo', name: 'Futuro semplice' },
      'Indicativo passato prossimo': { id: 'ind-passato-prossimo', mood: 'Indicativo', block: 'Tempi composti', name: 'Passato prossimo', compound: true },
      'Indicativo trapassato prossimo': { id: 'ind-trapassato-prossimo', mood: 'Indicativo', block: 'Tempi composti', name: 'Trapassato prossimo', compound: true },
      'Indicativo trapassato remoto': { id: 'ind-trapassato-remoto', mood: 'Indicativo', block: 'Tempi composti', name: 'Trapassato remoto', compound: true },
      'Indicativo futuro anteriore': { id: 'ind-futuro-anteriore', mood: 'Indicativo', block: 'Tempi composti', name: 'Futuro anteriore', compound: true },
      'Condizionale presente': { id: 'cond-presente', mood: 'Condizionale', name: 'Presente' },
      'Condizionale passato': { id: 'cond-passato', mood: 'Condizionale', name: 'Passato', compound: true },
      'Congiuntivo presente': { id: 'cong-presente', mood: 'Congiuntivo', name: 'Presente', promptPrefix: 'che' },
      'Congiuntivo imperfetto': { id: 'cong-imperfetto', mood: 'Congiuntivo', name: 'Imperfetto', promptPrefix: 'che' },
      'Congiuntivo passato': { id: 'cong-passato', mood: 'Congiuntivo', name: 'Passato', promptPrefix: 'che', compound: true },
      'Congiuntivo trapassato': { id: 'cong-trapassato', mood: 'Congiuntivo', name: 'Trapassato', promptPrefix: 'che', compound: true },
      'Imperativo presente': { id: 'imp-presente', mood: 'Imperativo', name: 'Presente', noPronoun: true },
      'others': {
        columns: {
          'participio presente': { id: 'participio-presente', mood: 'Forme nominali', name: 'Participio presente' },
          'partecipio passato': { id: 'participio-passato', mood: 'Forme nominali', name: 'Participio passato' },
          'gerundio presente': { id: 'gerundio-presente', mood: 'Forme nominali', name: 'Gerundio presente' }
        }
      }
    }
  }
];

// Italian auxiliary "essere" in every compound tense: the participle then agrees in gender,
// so "sono andato" also accepts "sono andata" (and "siamo andati" -> "siamo andate").
const ESSERE = new Set(('sono sei è siamo siete ero eri era eravamo eravate erano fui fosti fu fummo foste furono ' +
  'sarò sarai sarà saremo sarete saranno sarei saresti sarebbe saremmo sareste sarebbero ' +
  'sia siate siano fossi fosse fossimo fossero').split(' '));

const cellText = (v) => {
  if (v == null) return '';
  if (typeof v === 'object') {
    if (v.richText) return v.richText.map((t) => t.text).join('');
    if ('result' in v) return String(v.result ?? '');
    if ('text' in v) return String(v.text);
  }
  return String(v);
};
const clean = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

function seForm(word) {
  const m = word.match(/^(.*)r(a|as|amos|ais|an)$/);
  if (!m) return null;
  return m[1] + { a: 'se', as: 'ses', amos: 'semos', ais: 'seis', an: 'sen' }[m[2]];
}

/** Reads a verb list: column A = infinitive (anything after a space or "(" is a note), column B = group. */
async function readVerbList(lang) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolve(ROOT, lang.verbList));
  const list = new Map();
  wb.worksheets[0].eachRow({ includeEmpty: false }, (row, n) => {
    const inf = clean(cellText(row.getCell(1).value)).split(/[\s(]/)[0];
    if (!inf) return;
    const value = clean(cellText(row.getCell(2).value));
    const group = lang.groupValues[value];
    if (!group) throw new Error(`${lang.verbList} row ${n}: unknown group “${value}” for ${inf}`);
    list.set(inf, group);
  });
  return list;
}

const report = { lines: [], section(t) { this.lines.push('', `## ${t}`, ''); }, add(...l) { this.lines.push(...l); } };

async function convert(lang) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolve(ROOT, lang.file));
  const translations = JSON.parse(readFileSync(resolve(ROOT, 'data/translations.en.json'), 'utf8'))[lang.code] ?? {};
  const pronounWords = new Set(lang.pronouns.flatMap((p) => p.split('/')));
  const listed = lang.verbList ? await readVerbList(lang) : null;
  const issues = { flags: [], stray: [], noPronoun: [], missing: [], skipped: [], unknownSheets: [], variants: [] };
  const notListed = new Set();

  const tenses = [];
  const verbs = new Map(); // infinitive -> verb
  const flagSeen = new Map(); // infinitive -> {group, sheet}

  // Tenses follow the order of the config, not of the workbook.
  const sheetNames = wb.worksheets.map((ws) => ws.name);
  for (const name of sheetNames) if (!lang.sheets[name]) issues.unknownSheets.push(name);

  for (const [sheetName, cfg] of Object.entries(lang.sheets)) {
    const ws = wb.getWorksheet(sheetName);
    if (!ws) { issues.unknownSheets.push(`(missing) ${sheetName}`); continue; }
    const rows = [];
    ws.eachRow({ includeEmpty: false }, (row, n) => rows.push({ n, cells: row.values.slice(1).map((v) => clean(cellText(v))) }));
    const header = rows.shift()?.cells ?? [];

    // Which tenses does this sheet produce, and from which column?
    const outputs = cfg.columns
      ? Object.entries(cfg.columns).map(([h, t]) => ({ tense: { ...t, personal: false }, cols: [header.indexOf(h)] }))
      : [{ tense: { ...cfg, personal: true }, cols: [2, 3, 4, 5, 6, 7] }];
    for (const o of outputs) {
      if (o.cols.some((c) => c < 0)) throw new Error(`${lang.file} / ${sheetName}: column not found for ${o.tense.name}`);
      const { columns, ...t } = o.tense;
      tenses.push(t);
    }

    for (const { n, cells } of rows) {
      const [flag, inf] = cells;
      if (!inf) { if (cells.some(Boolean)) issues.skipped.push(`${sheetName} row ${n}: ${JSON.stringify(cells)}`); continue; }
      if (listed && !listed.has(inf)) { notListed.add(inf); continue; }
      let group = listed?.get(inf);
      if (!listed) {
        group = lang.groupValues[flag];
        if (!flagSeen.has(inf)) flagSeen.set(inf, { group, sheet: sheetName });
        else if (flagSeen.get(inf).group !== group) {
          issues.flags.push(`${inf}: "${flag}" in “${sheetName}”, but “${flagSeen.get(inf).group}” in “${flagSeen.get(inf).sheet}”`);
        }
        group = flagSeen.get(inf).group;
        if (!group) issues.flags.push(`${inf}: unknown group “${flag}” in “${sheetName}”`);
      }
      if (!verbs.has(inf)) verbs.set(inf, { inf, en: translations[inf] ?? '', group, forms: {} });
      const verb = verbs.get(inf);

      for (const { tense, cols } of outputs) {
        verb.forms[tense.id] = cols.map((c, person) => {
          let raw = cells[c] ?? '';
          if (/[^\p{L}\s'’/()-]/u.test(raw)) { issues.stray.push(`${sheetName} · ${inf} · ${raw}`); raw = clean(raw.replace(/[^\p{L}\s'’/()-]/gu, '')); }
          raw = raw.replace(/’/g, "'");
          if (!raw || raw === '-') return null;
          let words = raw.split(' ');
          if (tense.promptPrefix && words[0] === tense.promptPrefix) words = words.slice(1);
          if (lang.cellsStartWithPronoun && tense.personal && !tense.noPronoun) {
            if (words.length > 1 && pronounWords.has(words[0])) words = words.slice(1);
            else issues.noPronoun.push(`${sheetName} · ${inf} · ${lang.pronouns[person]}: “${raw}”`);
          }
          if (tense.answerPrefix && words[0] === tense.answerPrefix) words = words.slice(1);
          const cell = words.map((w) => lang.shorthandFixes?.[w] ?? w).join(' ');
          // " / " with spaces separates whole alternatives ("è piovuto / ha piovuto");
          // "/" inside a word is the ending shorthand ("perso/duto").
          let answers = [...new Set(cell.split(' / ').flatMap((alt) => expandCell(alt.trim(), inf)))];
          if (answers.length > 1 || /[/()]/.test(cell)) issues.variants.push(`| ${tense.mood} ${tense.name} | ${inf} | ${cell} | ${answers.join(' · ')} |`);
          if (tense.compound) {
            answers = answers.flatMap((a) => {
              const w = a.split(' ');
              if (w.length < 2 || !ESSERE.has(w[w.length - 2])) return [a];
              const last = w[w.length - 1];
              const fem = last.endsWith('o') ? last.slice(0, -1) + 'a' : last.endsWith('i') ? last.slice(0, -1) + 'e' : null;
              return fem ? [a, [...w.slice(0, -1), fem].join(' ')] : [a];
            });
          }
          if (tense.seVariant) {
            answers = answers.flatMap((a) => { const s = seForm(a); return s ? [a, s] : [a]; });
          }
          return [...new Set(answers)];
        });
      }
    }
  }

  // Every verb should have every tense.
  const defective = [];
  for (const inf of listed?.keys() ?? []) if (!verbs.has(inf)) issues.missing.push(`${inf}: in ${lang.verbList} but in none of the sheets`);
  for (const v of verbs.values()) {
    // Imperatives never have a first person singular, so they don't count.
    const gaps = tenses.filter((t) => t.personal && t.mood !== 'Imperativo' && (v.forms[t.id] ?? []).some((f) => !f)).length;
    if (gaps) defective.push(`${v.inf}: some persons left out (“-”) in ${gaps} tense${gaps > 1 ? 's' : ''}, never asked`);
    for (const t of tenses) if (!v.forms[t.id]) issues.missing.push(`${v.inf}: no row in “${t.mood} ${t.name}”`);
    if (!v.en) issues.missing.push(`${v.inf}: no English translation in data/translations.en.json`);
  }

  const data = {
    code: lang.code, name: lang.name, native: lang.native, pronouns: lang.pronouns,
    groups: lang.groups,
    // noPronoun, compound and seVariant are conversion-only settings.
    tenses: tenses.map(({ id, mood, block, name, personal, promptPrefix, answerPrefix }) =>
      ({ id, mood, block: block ?? mood, name, personal, ...(promptPrefix && { promptPrefix }), ...(answerPrefix && { answerPrefix }) })),
    verbs: [...verbs.values()].sort((a, b) => a.inf.localeCompare(b.inf, lang.code))
  };
  const out = resolve(ROOT, 'src/lib/data', `${lang.code}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(data));

  const nItems = data.verbs.reduce((s, v) => s + Object.values(v.forms).flat().filter(Boolean).length, 0);
  const perGroup = lang.groups.map((g) => `${data.verbs.filter((v) => v.group === g.id).length} ${g.label.toLowerCase()}`).join(', ');
  report.section(`${lang.name} (${lang.file}${lang.verbList ? ` + ${lang.verbList}` : ''})`);
  report.add(`${data.verbs.length} verbs (${perGroup}), ${data.tenses.length} tenses, ${nItems} questions.`);
  const list = (title, items, note) => {
    report.add('', `### ${title} (${items.length})`, '');
    if (note) report.add(note, '');
    report.add(items.length ? items.map((i) => (i.startsWith('|') ? i : `- ${i}`)).join('\n') : '_None._');
  };
  if (!listed) list('Group mismatches between sheets', issues.flags, 'The group from the first sheet listing the verb is used.');
  else list(`In the sheets but not in ${lang.verbList} (skipped)`, [...notListed].sort().map((v) => v), undefined);
  list('Unexpected characters (removed)', issues.stray);
  list('Cells without a leading pronoun', issues.noPronoun);
  list('Missing data', issues.missing);
  list('Defective verbs', defective);
  list('Skipped rows', issues.skipped);
  list('Sheets not in the converter config', issues.unknownSheets);
  report.add('', `### Shorthand expansions (${issues.variants.length})`, '', 'Check the right-hand column: these are all accepted as correct.', '');
  if (issues.variants.length) report.add('| Tense | Verb | Cell | Accepted answers |\n|---|---|---|---|\n' + issues.variants.join('\n'));
  else report.add('_None._');

  return { code: data.code, name: data.name, native: data.native, verbCount: data.verbs.length };
}

const meta = [];
for (const lang of LANGUAGES) meta.push(await convert(lang));
writeFileSync(resolve(ROOT, 'src/lib/data/languages.json'), JSON.stringify(meta, null, 2));
writeFileSync(resolve(ROOT, 'data/conversion-report.md'),
  ['# Conversion report', '', `Generated by \`npm run convert\` on ${new Date().toISOString().slice(0, 10)}.`, ...report.lines, ''].join('\n'));
console.log('Converted:', meta.map((m) => `${m.name} (${m.verbCount} verbs)`).join(', '));
console.log('Report: data/conversion-report.md');
