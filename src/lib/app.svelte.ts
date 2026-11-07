// Application state shared by every component.
import type { Grade, Item, ItemStats, LanguageData, SessionRecord, Settings } from './types';
import { LANGUAGES, loadLanguage } from './languages';
import { buildPool, drawQuiz, selectedGroups, selectedTenses, selectedVerbs, verbsInGroups } from './quiz';
import { grade } from './grading';
import { applyGrade } from './weights';
import * as storage from './storage';

const DEFAULT_SETTINGS: Settings = {
  lang: LANGUAGES[0]?.code ?? 'es',
  groups: {},
  excluded: {},
  tenses: {},
  count: 20
};

/** Saved settings may come from an older version (regular/irregular switches instead of groups). */
function fromSaved(saved: Partial<Settings> & { regular?: boolean; irregular?: boolean }): Settings {
  const { regular, irregular, ...rest } = saved;
  const s: Settings = { ...structuredClone(DEFAULT_SETTINGS), ...rest };
  if (!rest.groups && (regular === false || irregular === false)) {
    // Keep the old choice for every language that only has those two groups.
    const keep = [regular !== false && 'regular', irregular !== false && 'irregular'].filter(Boolean) as string[];
    s.groups = { es: keep };
  }
  return s;
}

export type Screen = 'setup' | 'quiz' | 'results';
export type View = 'practice' | 'progress';

class AppState {
  ready = $state(false);
  error = $state('');
  view = $state<View>('practice');
  screen = $state<Screen>('setup');
  settings = $state<Settings>(structuredClone(DEFAULT_SETTINGS));
  data = $state.raw<LanguageData | null>(null);
  stats = $state.raw<Record<string, ItemStats>>({});
  sessions = $state.raw<SessionRecord[]>([]);

  quiz = $state.raw<Item[]>([]);
  answers = $state<string[]>([]);
  grades = $state.raw<Grade[]>([]);
  /** Set when the user tries to validate with blank answers. */
  showBlanks = $state(false);

  pool = $derived(this.data ? buildPool(this.data, this.settings) : []);
  groupVerbs = $derived(this.data ? verbsInGroups(this.data, this.settings) : []);
  verbs = $derived(this.data ? selectedVerbs(this.data, this.settings) : []);
  tenses = $derived(this.data ? selectedTenses(this.data, this.settings) : []);
  canStart = $derived(this.pool.length > 0);
  filled = $derived(this.answers.filter((a) => a.trim()).length);

  async init() {
    try {
      const saved = await storage.loadSettings();
      if (saved) this.settings = fromSaved(saved);
      if (!LANGUAGES.some((l) => l.code === this.settings.lang)) this.settings.lang = DEFAULT_SETTINGS.lang;
      this.sessions = await storage.loadSessions();
      await this.setLanguage(this.settings.lang);
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    }
    this.ready = true;
  }

  private save() {
    void storage.saveSettings(this.settings);
  }

  async setLanguage(code: string) {
    const data = await loadLanguage(code);
    this.settings.lang = code;
    // Forget tenses and groups this language no longer has (the data may have changed).
    const tenseIds = new Set(data.tenses.map((t) => t.id));
    const kept = (this.settings.tenses[code] ?? []).filter((id) => tenseIds.has(id));
    // First visit to a language: start with its first tense selected.
    this.settings.tenses[code] = kept.length ? kept : data.tenses.slice(0, 1).map((t) => t.id);
    const groupIds = new Set(data.groups.map((g) => g.id));
    const groups = this.settings.groups[code]?.filter((id) => groupIds.has(id));
    if (groups) this.settings.groups[code] = groups;
    this.data = data;
    this.stats = await storage.loadStats(code);
    this.save();
  }

  selectedGroups(): string[] {
    return this.data ? selectedGroups(this.data, this.settings) : [];
  }

  toggleGroup(id: string) {
    if (!this.data) return;
    const cur = selectedGroups(this.data, this.settings);
    this.settings.groups[this.settings.lang] = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    this.save();
  }

  toggleTense(id: string) {
    const lang = this.settings.lang;
    const cur = this.settings.tenses[lang] ?? [];
    this.settings.tenses[lang] = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    this.save();
  }

  /** Selects (on=true) or clears every tense in `ids`, e.g. a whole block. */
  setTenses(ids: string[], on: boolean) {
    const lang = this.settings.lang;
    const cur = new Set(this.settings.tenses[lang] ?? []);
    for (const id of ids) (on ? cur.add(id) : cur.delete(id));
    this.settings.tenses[lang] = [...cur];
    this.save();
  }

  toggleVerb(inf: string) {
    const lang = this.settings.lang;
    const cur = this.settings.excluded[lang] ?? [];
    this.settings.excluded[lang] = cur.includes(inf) ? cur.filter((x) => x !== inf) : [...cur, inf];
    this.save();
  }

  /** Ticks (include=true) or unticks every verb in `infs`. */
  setVerbs(infs: string[], include: boolean) {
    const lang = this.settings.lang;
    const cur = new Set(this.settings.excluded[lang] ?? []);
    for (const inf of infs) (include ? cur.delete(inf) : cur.add(inf));
    this.settings.excluded[lang] = [...cur];
    this.save();
  }

  isExcluded(inf: string) {
    return (this.settings.excluded[this.settings.lang] ?? []).includes(inf);
  }

  setCount(n: number) {
    this.settings.count = n;
    this.save();
  }

  start() {
    if (!this.canStart) return;
    this.quiz = drawQuiz(this.pool, this.stats, this.settings.count);
    this.answers = this.quiz.map(() => '');
    this.grades = [];
    this.showBlanks = false;
    this.screen = 'quiz';
    this.view = 'practice';
  }

  /** Returns false (and flags the blanks) when some answers are still empty. */
  validate(): boolean {
    if (this.filled < this.quiz.length) {
      this.showBlanks = true;
      return false;
    }
    const lang = this.settings.lang;
    const now = Date.now();
    this.grades = this.quiz.map((item, i) => grade(this.answers[i], item.answers, item.tense.answerPrefix));
    const stats = { ...this.stats };
    this.quiz.forEach((item, i) => (stats[item.key] = applyGrade(stats[item.key], this.grades[i], now)));
    this.stats = stats;
    const count = (g: Grade) => this.grades.filter((x) => x === g).length;
    this.sessions = [
      ...this.sessions,
      { at: now, lang, total: this.quiz.length, correct: count('correct'), passable: count('passable'), wrong: count('wrong') }
    ];
    void storage.saveStats(lang, stats);
    void storage.saveSessions(this.sessions);
    this.screen = 'results';
    return true;
  }

  backToSetup() {
    this.screen = 'setup';
    this.quiz = [];
    this.answers = [];
    this.grades = [];
  }

  async reloadAfterImport() {
    const saved = await storage.loadSettings();
    if (saved) this.settings = fromSaved(saved);
    this.sessions = await storage.loadSessions();
    await this.setLanguage(this.settings.lang);
  }

  async resetProgress(lang: string) {
    await storage.resetProgress(lang);
    this.sessions = await storage.loadSessions();
    if (lang === this.settings.lang) this.stats = {};
  }
}

export const app = new AppState();
