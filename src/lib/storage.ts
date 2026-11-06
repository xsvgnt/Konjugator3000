// Everything is stored in this browser (IndexedDB). Export/import moves it between machines.
import { get, set, del } from 'idb-keyval';
import type { ItemStats, SessionRecord, Settings } from './types';

const K_SETTINGS = 'settings';
const K_SESSIONS = 'sessions';
const kStats = (lang: string) => `stats:${lang}`;

export const loadSettings = async (): Promise<Settings | undefined> => get<Settings>(K_SETTINGS);
export const saveSettings = (s: Settings) => set(K_SETTINGS, $plain(s));

export const loadStats = async (lang: string): Promise<Record<string, ItemStats>> => (await get(kStats(lang))) ?? {};
export const saveStats = (lang: string, stats: Record<string, ItemStats>) => set(kStats(lang), $plain(stats));

export const loadSessions = async (): Promise<SessionRecord[]> => (await get(K_SESSIONS)) ?? [];
export const saveSessions = (s: SessionRecord[]) => set(K_SESSIONS, $plain(s));

export async function resetProgress(lang: string): Promise<void> {
  await del(kStats(lang));
  await saveSessions((await loadSessions()).filter((x) => x.lang !== lang));
}

interface Backup {
  app: 'konjugator3000';
  version: 1;
  exportedAt: string;
  settings?: Settings;
  sessions: SessionRecord[];
  stats: Record<string, Record<string, ItemStats>>;
}

export async function exportBackup(langs: string[]): Promise<Blob> {
  const stats: Backup['stats'] = {};
  for (const l of langs) stats[l] = await loadStats(l);
  const backup: Backup = {
    app: 'konjugator3000',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: await loadSettings(),
    sessions: await loadSessions(),
    stats
  };
  return new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' });
}

/** Replaces all stored progress with the backup's content. Throws on a file that is not a backup. */
export async function importBackup(text: string): Promise<void> {
  const b = JSON.parse(text) as Partial<Backup>;
  if (b.app !== 'konjugator3000' || b.version !== 1 || typeof b.stats !== 'object' || !Array.isArray(b.sessions)) {
    throw new Error('This file is not a Konjugator3000 backup.');
  }
  for (const [lang, stats] of Object.entries(b.stats ?? {})) await saveStats(lang, stats);
  await saveSessions(b.sessions);
  if (b.settings) await saveSettings(b.settings);
}

/** Strips Svelte proxies so IndexedDB's structured clone accepts the value. */
function $plain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
