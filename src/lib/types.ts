// Shape of src/lib/data/<code>.json, produced by scripts/convert.mjs.

export interface Tense {
  id: string;
  mood: string;
  name: string;
  /** false for gerund / participle: one form, no pronoun. */
  personal: boolean;
  /** Shown before the pronoun, e.g. "che" for the Italian congiuntivo. */
  promptPrefix?: string;
  /** Shown before the input, e.g. "no" for the Spanish negative imperative. */
  answerPrefix?: string;
}

export interface Verb {
  inf: string;
  en: string;
  irregular: boolean;
  /** forms[tenseId][person] = accepted answers (the first is the reference form); null = no such form. */
  forms: Record<string, (string[] | null)[]>;
}

export interface LanguageData {
  code: string;
  name: string;
  native: string;
  pronouns: string[];
  tenses: Tense[];
  verbs: Verb[];
}

export interface LanguageMeta {
  code: string;
  name: string;
  native: string;
  verbCount: number;
}

/** One question: a verb, a tense and a person (index into pronouns, or 0 for non-personal tenses). */
export interface Item {
  key: string;
  verb: Verb;
  tense: Tense;
  person: number;
  pronoun: string;
  answers: string[];
}

export type Grade = 'correct' | 'passable' | 'wrong';

export interface ItemStats {
  /** Selection weight; 1 = neutral. */
  w: number;
  seen: number;
  correct: number;
  passable: number;
  wrong: number;
  last: number;
}

export interface SessionRecord {
  at: number;
  lang: string;
  total: number;
  correct: number;
  passable: number;
  wrong: number;
}

export interface Settings {
  lang: string;
  regular: boolean;
  irregular: boolean;
  /** Per language: infinitives the user unticked. */
  excluded: Record<string, string[]>;
  /** Per language: selected tense ids. */
  tenses: Record<string, string[]>;
  count: number;
}
