import type { Item, ItemStats, LanguageData, Settings, Tense, Verb } from './types';
import { effectiveWeight, weightedSample } from './weights';

export const QUESTION_COUNTS = [10, 20, 30, 40, 50];

export function itemKey(verb: Verb, tense: Tense, person: number): string {
  return `${verb.inf}|${tense.id}|${person}`;
}

/** Selected group ids for this language (all groups until the user changes it). */
export function selectedGroups(data: LanguageData, s: Settings): string[] {
  return s.groups[data.code] ?? data.groups.map((g) => g.id);
}

/** Verbs in the selected groups, before the user's manual exclusions. */
export function verbsInGroups(data: LanguageData, s: Settings): Verb[] {
  const groups = new Set(selectedGroups(data, s));
  return data.verbs.filter((v) => groups.has(v.group));
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

/** Groups tenses into the picker's blocks ("Indicativo", "Tempi composti"…), keeping the data order. */
export function tensesByBlock(tenses: Tense[]): { block: string; tenses: Tense[] }[] {
  const blocks: { block: string; tenses: Tense[] }[] = [];
  for (const t of tenses) {
    const name = t.block ?? t.mood;
    const b = blocks.find((x) => x.block === name);
    if (b) b.tenses.push(t);
    else blocks.push({ block: name, tenses: [t] });
  }
  return blocks;
}
