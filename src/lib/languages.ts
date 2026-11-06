import type { LanguageData, LanguageMeta } from './types';
import meta from './data/languages.json';

/** Every language converted by `npm run convert`. Adding a language = adding it to the converter. */
export const LANGUAGES: LanguageMeta[] = meta;

// Each language is its own chunk, loaded on demand (and precached for offline use).
const loaders = import.meta.glob<LanguageData>(['./data/*.json', '!./data/languages.json'], { import: 'default' });
const cache = new Map<string, LanguageData>();

export async function loadLanguage(code: string): Promise<LanguageData> {
  const hit = cache.get(code);
  if (hit) return hit;
  const load = loaders[`./data/${code}.json`];
  if (!load) throw new Error(`Unknown language: ${code}`);
  const data = await load();
  cache.set(code, data);
  return data;
}
