// Converts the conjugation spreadsheets into the JSON files used by the app.
//
//   npm run convert
//
// Input : one .xlsx per language (see LANGUAGES below) + data/translations.en.json
// Output: src/lib/data/<code>.json, src/lib/data/languages.json, data/conversion-report.md
//
// Spreadsheet layout (one sheet per tense):
//   row 1      : (empty) (empty) pronoun1 ... pronoun6
//   next rows  : reg|irreg  infinitive  form1 ... form6
// Sheets listed with `columns` hold non-personal forms (gerund, participle): one column each.

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
    // Shorthand the automatic expansion gets wrong: rewritten in full before expanding.
    shorthandFixes: {
      'aprii/ersi': 'aprii/apersi',
      'aprì/erse': 'aprì/aperse',
      'aprirono/ersero': 'aprirono/apersero'
    },
    sheets: {
      'Indicativo presente': { id: 'ind-presente', mood: 'Indicativo', name: 'Presente' },
      'Indicativo passato prossimo': { id: 'ind-passato-prossimo', mood: 'Indicativo', name: 'Passato prossimo', compound: true },
      'Indicativo imperfetto': { id: 'ind-imperfetto', mood: 'Indicativo', name: 'Imperfetto' },
      'Indicativo trapassato prossimo': { id: 'ind-trapassato-prossimo', mood: 'Indicativo', name: 'Trapassato prossimo', compound: true },
      'Indicativo passato remoto': { id: 'ind-passato-remoto', mood: 'Indicativo', name: 'Passato remoto' },
      'Indicativo trapassato remoto': { id: 'ind-trapassato-remoto', mood: 'Indicativo', name: 'Trapassato remoto', compound: true },
      'Indicativo futuro semplice': { id: 'ind-futuro-semplice', mood: 'Indicativo', name: 'Futuro semplice' },
      'Indicativo futuro anteriore': { id: 'ind-futuro-anteriore', mood: 'Indicativo', name: 'Futuro anteriore', compound: true },
      'Condizionale presente': { id: 'cond-presente', mood: 'Condizionale', name: 'Presente' },
      'Condizionale passato': { id: 'cond-passato', mood: 'Condizionale', name: 'Passato', compound: true },
      'Congiuntivo presente': { id: 'cong-presente', mood: 'Congiuntivo', name: 'Presente', promptPrefix: 'che' },
      'Congiuntivo passato': { id: 'cong-passato', mood: 'Congiuntivo', name: 'Passato', promptPrefix: 'che', compound: true },
      'Congiuntivo imperfetto': { id: 'cong-imperfetto', mood: 'Congiuntivo', name: 'Imperfetto', promptPrefix: 'che' },
      'Congiuntivo trapassato': { id: 'cong-trapassato', mood: 'Congiuntivo', name: 'Trapassato', promptPrefix: 'che', compound: true },
      'Imperativo presente': { id: 'imp-presente', mood: 'Imperativo', name: 'Presente', noPronoun: true },
      'others': {
        columns: {
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

const report = { lines: [], section(t) { this.lines.push('', `## ${t}`, ''); }, add(...l) { this.lines.push(...l); } };

async function convert(lang) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(resolve(ROOT, lang.file));
  const translations = JSON.parse(readFileSync(resolve(ROOT, 'data/translations.en.json'), 'utf8'))[lang.code] ?? {};
  const pronounWords = new Set(lang.pronouns.flatMap((p) => p.split('/')));
  const issues = { flags: [], stray: [], noPronoun: [], missing: [], skipped: [], unknownSheets: [], variants: [] };

  const tenses = [];
  const verbs = new Map(); // infinitive -> verb
  const flagSeen = new Map(); // infinitive -> {flag, sheet}

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
      const irregular = flag === 'irreg';
      if (!flagSeen.has(inf)) flagSeen.set(inf, { irregular, sheet: sheetName });
      else if (flagSeen.get(inf).irregular !== irregular) {
        issues.flags.push(`${inf}: "${flag}" in “${sheetName}”, but “${flagSeen.get(inf).irregular ? 'irreg' : 'reg'}” in “${flagSeen.get(inf).sheet}”`);
      }
      if (!verbs.has(inf)) verbs.set(inf, { inf, en: translations[inf] ?? '', irregular: flagSeen.get(inf).irregular, forms: {} });
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
          let answers = expandCell(cell, inf);
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
  for (const v of verbs.values()) {
    for (const t of tenses) if (!v.forms[t.id]) issues.missing.push(`${v.inf}: no row in “${t.mood} ${t.name}”`);
    if (!v.en) issues.missing.push(`${v.inf}: no English translation in data/translations.en.json`);
  }

  const data = {
    code: lang.code, name: lang.name, native: lang.native, pronouns: lang.pronouns,
    tenses: tenses.map(({ id, mood, name, personal, promptPrefix, answerPrefix }) =>
      /* noPronoun, compound and seVariant are conversion-only settings */ ({ id, mood, name, personal, ...(promptPrefix && { promptPrefix }), ...(answerPrefix && { answerPrefix }) })),
    verbs: [...verbs.values()].sort((a, b) => a.inf.localeCompare(b.inf, lang.code))
  };
  const out = resolve(ROOT, 'src/lib/data', `${lang.code}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(data));

  const nItems = data.verbs.reduce((s, v) => s + Object.values(v.forms).flat().filter(Boolean).length, 0);
  report.section(`${lang.name} (${lang.file})`);
  report.add(`${data.verbs.length} verbs (${data.verbs.filter((v) => v.irregular).length} irregular), ${data.tenses.length} tenses, ${nItems} questions.`);
  const list = (title, items, note) => {
    report.add('', `### ${title} (${items.length})`, '');
    if (note) report.add(note, '');
    report.add(items.length ? items.map((i) => (i.startsWith('|') ? i : `- ${i}`)).join('\n') : '_None._');
  };
  list('Regular/irregular mismatches', issues.flags, 'The flag from the first sheet listing the verb is used.');
  list('Unexpected characters (removed)', issues.stray);
  list('Cells without a leading pronoun', issues.noPronoun);
  list('Missing data', issues.missing);
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
