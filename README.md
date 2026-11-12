# Konjugator3000

A Progressive Web App to practise Spanish and Italian verb conjugation. Works offline once loaded, and can be installed from the browser's address bar.

## Use

```bash
npm install
npm run dev        # http://localhost:5173
```

## Update the verb data

The conjugations live in two spreadsheets in this folder (`spanish-verbs.xlsx`, `italian-verbs.xlsx`): one sheet per tense, the group in column A, the infinitive in column B, then one column per person. A cell can hold whole alternatives separated by ` / ` (`lui ha piovuto / è piovuto`); `-` means the form doesn't exist and is never asked.

- **Spanish**: the group comes from column A (`reg` / `irreg`).
- **Italian**: **`italian_list.xlsx` decides which verbs are used and their group** (column A = infinitive, column B = `reg`, `irreg`, `spelling` or `participio passato`; anything after the infinitive, like “(-sc- suffix)”, is ignored). Verbs present in `italian-verbs.xlsx` but not in the list are skipped, so adding one back only takes a line in the list.

```bash
npm run convert
```

This regenerates `src/lib/data/*.json` and writes **`data/conversion-report.md`**, which lists anything suspicious (flag mismatches, stray characters, skipped rows) and every shorthand expansion (`perso/duto` → *perso · perduto*, `c(u)ociamo` → *cociamo · cuociamo*). Check it after editing a spreadsheet.

- English translations live in `data/translations.en.json`.
- The **Endings** page (regular endings on model verbs, with short notes) is written by hand in `src/lib/endings.ts`. `npm test` checks every form it shows against the verb data, so a new tense needs an entry there.
- Shorthand the automatic expansion gets wrong can be rewritten in `shorthandFixes` in `scripts/convert.mjs`.
- To add a language, add an entry to `LANGUAGES` in `scripts/convert.mjs` (file, pronouns, and how each sheet maps to a mood and tense).

The converter also adds accepted variants automatically:
- Italian compound tenses with *essere* accept both genders (*sono andato / andata*).
- Spanish *subjuntivo imperfecto* accepts the *-se* form (*hablara / hablase*).

## Typing accents

No accent keys? In a quiz field, press **↑** after a letter to cycle through its accented forms (*e → è → é* in Italian, *u → ú → ü* in Spanish) and **↓** to go back. The forms per language are in `src/lib/accents.ts`.

## Grading and weights

- **Correct**: matches an accepted answer (case and extra spaces are ignored).
- **Passable**: matches once accents are ignored (*salio* for *salió*, *ano* for *año*).
- **Wrong**: anything else.

Every verb + tense + person has a weight (start 1, never-seen 1.5). After a quiz: wrong ×2, passable ×1.3, correct ×0.7, kept between 0.25 and 16. Questions are drawn by weighted random sampling without repeats. Progress is stored in the browser (IndexedDB); the Progress page exports and imports a JSON backup.

## Scripts

| Command | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests (grading, weights, shorthand expansion) |
| `npm run check` | Type-check |
| `npm run convert` | Rebuild the verb data from the spreadsheets |
| `npm run icons` | Regenerate the app icons from `public/favicon.svg` |

## Deploy to GitHub Pages

Push to a GitHub repository, then in **Settings → Pages** choose **GitHub Actions** as the source. `.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`.
