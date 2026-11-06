import type { Item, ItemStats, LanguageData, Settings, Tense, Verb } from './types';
import { effectiveWeight, weightedSample } from './weights';

export const QUESTION_COUNTS = [10, 20, 30, 40, 50];

export function itemKey(verb: Verb, tense: Tense, person: number): string {
  return `${verb.inf}|${tense.id}|${person}`;
}

/** Verbs matching the regular/irregular toggles, before the user's manual exclusions. */
export function verbsInGroups(data: LanguageData, s: Settings): Verb[] {
  return data.verbs.filter((v) => (v.irregular ? s.irregular : s.regular));
}

export function selectedVerbs(data: LanguageData, s: Settings): Verb[] {
  const excluded = new Set(s.excluded[data.code] ?? []);
  return verbsInGroups(data, s).filter((v) => !excluded.has(v.inf));
}

export function selectedTenses(data: LanguageData, s: Settings): Tense[] {
  const ids = new Set(s.tenses[data.code] ?? []);
  return data.tenses.filter((t) => ids.has(t.id));
}

/** Every question the current selection can produce. */
export function buildPool(data: LanguageData, s: Settings): Item[] {
  const items: Item[] = [];
  for (const verb of selectedVerbs(data, s)) {
    for (const tense of selectedTenses(data, s)) {
      (verb.forms[tense.id] ?? []).forEach((answers, person) => {
        if (!answers || !answers.length) return;
        items.push({
          key: itemKey(verb, tense, person),
          verb,
          tense,
          person,
          pronoun: tense.personal ? data.pronouns[person] : '',
          answers
        });
      });
    }
  }
  return items;
}

/** Draws up to `count` distinct questions, favouring items with a higher weight. */
export function drawQuiz(pool: Item[], stats: Record<string, ItemStats>, count: number, rand = Math.random): Item[] {
  return weightedSample(pool, (i) => effectiveWeight(stats[i.key]), count, rand);
}

/** "che io", "tú", or "" for a gerund. */
export function promptLabel(item: Item): string {
  return [item.tense.promptPrefix, item.pronoun].filter(Boolean).join(' ');
}

/** Groups tenses by mood, keeping the data order. */
export function tensesByMood(tenses: Tense[]): { mood: string; tenses: Tense[] }[] {
  const groups: { mood: string; tenses: Tense[] }[] = [];
  for (const t of tenses) {
    const g = groups.find((x) => x.mood === t.mood);
    if (g) g.tenses.push(t);
    else groups.push({ mood: t.mood, tenses: [t] });
  }
  return groups;
}
