// Visual cues that tell tenses apart at a glance:
// - the mood gives a color (CSS class mood-<key>, which sets --mood; tokens in app.css),
// - the time gives a shape (● presente, ■ imperfecto, ▲ pretérito / passato remoto, ◆ futuro,
//   ⬟ condicional, – gerund and participles). Compound tenses take the shape of their
//   auxiliary's tense, hollow: he hablado ○, había hablado □.

export type MoodKey = 'ind' | 'sub' | 'cond' | 'imp' | 'nf';
export type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'pentagon' | 'dash';

const MOODS: Record<string, MoodKey> = {
  Indicativo: 'ind',
  Subjuntivo: 'sub',
  Congiuntivo: 'sub',
  Condizionale: 'cond',
  Imperativo: 'imp',
  'Formas no personales': 'nf',
  'Forme nominali': 'nf'
};

/** Tense id → [shape, hollow]. Ids are shared between languages where the tense is the same. */
const SHAPES: Record<string, [Shape, boolean]> = {
  // Spanish and Italian
  'ind-presente': ['circle', false],
  // Spanish
  'ind-preterito': ['triangle', false],
  'ind-imperfecto': ['square', false],
  'ind-futuro': ['diamond', false],
  'ind-condicional': ['pentagon', false],
  'ind-perfecto': ['circle', true],
  'ind-pluscuamperfecto': ['square', true],
  'ind-futuro-perfecto': ['diamond', true],
  'ind-condicional-perfecto': ['pentagon', true],
  'sub-presente': ['circle', false],
  'sub-imperfecto': ['square', false],
  'sub-perfecto': ['circle', true],
  'sub-pluscuamperfecto': ['square', true],
  'imp-afirmativo': ['circle', false],
  'imp-negativo': ['circle', false],
  gerundio: ['dash', false],
  participio: ['dash', false],
  // Italian
  'ind-imperfetto': ['square', false],
  'ind-passato-remoto': ['triangle', false],
  'ind-futuro-semplice': ['diamond', false],
  'ind-passato-prossimo': ['circle', true],
  'ind-trapassato-prossimo': ['square', true],
  'ind-trapassato-remoto': ['triangle', true],
  'ind-futuro-anteriore': ['diamond', true],
  'cond-presente': ['pentagon', false],
  'cond-passato': ['pentagon', true],
  'cong-presente': ['circle', false],
  'cong-imperfetto': ['square', false],
  'cong-passato': ['circle', true],
  'cong-trapassato': ['square', true],
  'imp-presente': ['circle', false],
  'participio-presente': ['dash', false],
  'participio-passato': ['dash', false],
  'gerundio-presente': ['dash', false]
};

export function moodKey(mood: string): MoodKey | undefined {
  return MOODS[mood];
}

/** CSS class that sets --mood for this mood ('' when the mood is unknown). */
export function moodClass(mood: string): string {
  const key = MOODS[mood];
  return key ? `mood-${key}` : '';
}

export function tenseShape(id: string): { shape: Shape; hollow: boolean } | undefined {
  const s = SHAPES[id];
  return s && { shape: s[0], hollow: s[1] };
}
