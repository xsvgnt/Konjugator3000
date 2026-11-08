// Regular endings shown on the Endings page, written by hand per language.
// Each cell is a full model form with the ending in brackets: "am[o]", "[ho] amato".
// Alternatives are separated by " / ". endings.test.ts checks every form against the verb data.

export interface EndingsColumn {
  /** Column heading, e.g. "-are". */
  head: string;
  /** Model verb whose forms are shown (and checked by the test). */
  verb: string;
  /** One cell per person (null = the form doesn't exist), or a single cell for non-personal tenses. */
  cells: (string | null)[];
}

export interface TenseEndings {
  columns: EndingsColumn[];
  note?: string;
}

/** A column of simple forms: stem + one ending per person ("-" = none, "|" = alternatives). */
function col(head: string, verb: string, stem: string, endings: string): EndingsColumn {
  const cells = endings.split(' ').map((e) =>
    e === '-' ? null : e.split('|').map((alt) => `${stem}[${alt}]`).join(' / ')
  );
  return { head, verb, cells };
}

/** A column of compound forms: auxiliary per person + participle (singular for persons 1–3, plural for 4–6). */
function aux(head: string, verb: string, participle: [string, string], forms: string): EndingsColumn {
  const cells = forms.split(' ').map((a, i) => `[${a}] ${participle[i < 3 ? 0 : 1]}`);
  return { head, verb, cells };
}

const IT_AVERE = (forms: string) => aux('avere', 'amare', ['amato', 'amato'], forms);
const IT_ESSERE = (forms: string) => aux('essere', 'cadere', ['caduto', 'caduti'], forms);

export const ENDINGS: Record<string, Record<string, TenseEndings>> = {
  it: {
    'ind-presente': {
      columns: [
        col('-are', 'amare', 'am', 'o i a iamo ate ano'),
        col('-ere', 'credere', 'cred', 'o i e iamo ete ono'),
        col('-ire', 'servire', 'serv', 'o i e iamo ite ono'),
        col('-ire (-isc-)', 'finire', 'fin', 'isco isci isce iamo ite iscono')
      ],
      note: 'Many -ire verbs add -isc- in every person except noi and voi (capire, finire, preferire).'
    },
    'ind-imperfetto': {
      columns: [
        col('-are', 'amare', 'am', 'avo avi ava avamo avate avano'),
        col('-ere', 'credere', 'cred', 'evo evi eva evamo evate evano'),
        col('-ire', 'servire', 'serv', 'ivo ivi iva ivamo ivate ivano')
      ]
    },
    'ind-passato-remoto': {
      columns: [
        col('-are', 'amare', 'am', 'ai asti ò ammo aste arono'),
        col('-ere', 'credere', 'cred', 'ei|etti esti é|ette emmo este erono|ettero'),
        col('-ire', 'servire', 'serv', 'ii isti ì immo iste irono')
      ],
      note: '-ere verbs have two sets of endings for io, lui/lei and loro; both are correct.'
    },
    'ind-futuro-semplice': {
      columns: [
        col('-are', 'amare', 'am', 'erò erai erà eremo erete eranno'),
        col('-ere', 'credere', 'cred', 'erò erai erà eremo erete eranno'),
        col('-ire', 'servire', 'serv', 'irò irai irà iremo irete iranno')
      ],
      note: '-are verbs take -er-: amerò, not amarò. -care/-gare add an h (cercherò); -ciare/-giare drop the i (mangerò).'
    },
    'ind-passato-prossimo': {
      columns: [IT_AVERE('ho hai ha abbiamo avete hanno'), IT_ESSERE('sono sei è siamo siete sono')],
      note: 'Auxiliary + participio passato (-are → -ato, -ere → -uto, -ire → -ito). With essere the participle agrees with the subject: caduto, caduta, caduti, cadute.'
    },
    'ind-trapassato-prossimo': {
      columns: [IT_AVERE('avevo avevi aveva avevamo avevate avevano'), IT_ESSERE('ero eri era eravamo eravate erano')],
      note: 'Imperfetto of the auxiliary + participio passato.'
    },
    'ind-trapassato-remoto': {
      columns: [IT_AVERE('ebbi avesti ebbe avemmo aveste ebbero'), IT_ESSERE('fui fosti fu fummo foste furono')],
      note: 'Passato remoto of the auxiliary + participio passato.'
    },
    'ind-futuro-anteriore': {
      columns: [IT_AVERE('avrò avrai avrà avremo avrete avranno'), IT_ESSERE('sarò sarai sarà saremo sarete saranno')],
      note: 'Futuro of the auxiliary + participio passato.'
    },
    'cond-presente': {
      columns: [
        col('-are', 'amare', 'am', 'erei eresti erebbe eremmo ereste erebbero'),
        col('-ere', 'credere', 'cred', 'erei eresti erebbe eremmo ereste erebbero'),
        col('-ire', 'servire', 'serv', 'irei iresti irebbe iremmo ireste irebbero')
      ],
      note: 'Same stem as the futuro: amerei, crederei, servirei.'
    },
    'cond-passato': {
      columns: [
        IT_AVERE('avrei avresti avrebbe avremmo avreste avrebbero'),
        IT_ESSERE('sarei saresti sarebbe saremmo sareste sarebbero')
      ],
      note: 'Condizionale presente of the auxiliary + participio passato.'
    },
    'cong-presente': {
      columns: [
        col('-are', 'amare', 'am', 'i i i iamo iate ino'),
        col('-ere', 'credere', 'cred', 'a a a iamo iate ano'),
        col('-ire', 'servire', 'serv', 'a a a iamo iate ano'),
        col('-ire (-isc-)', 'finire', 'fin', 'isca isca isca iamo iate iscano')
      ],
      note: 'io, tu and lui/lei share one form. noi is the same as in the indicativo.'
    },
    'cong-imperfetto': {
      columns: [
        col('-are', 'amare', 'am', 'assi assi asse assimo aste assero'),
        col('-ere', 'credere', 'cred', 'essi essi esse essimo este essero'),
        col('-ire', 'servire', 'serv', 'issi issi isse issimo iste issero')
      ]
    },
    'cong-passato': {
      columns: [IT_AVERE('abbia abbia abbia abbiamo abbiate abbiano'), IT_ESSERE('sia sia sia siamo siate siano')],
      note: 'Congiuntivo presente of the auxiliary + participio passato.'
    },
    'cong-trapassato': {
      columns: [IT_AVERE('avessi avessi avesse avessimo aveste avessero'), IT_ESSERE('fossi fossi fosse fossimo foste fossero')],
      note: 'Congiuntivo imperfetto of the auxiliary + participio passato.'
    },
    'imp-presente': {
      columns: [
        col('-are', 'amare', 'am', '- a i iamo ate ino'),
        col('-ere', 'credere', 'cred', '- i a iamo ete ano'),
        col('-ire', 'servire', 'serv', '- i a iamo ite ano'),
        col('-ire (-isc-)', 'finire', 'fin', '- isci isca iamo ite iscano')
      ],
      note: 'lui/lei and loro (formal Lei, Loro) use the congiuntivo. Negative tu: non + infinitive (non amare); other persons: non + the same form.'
    },
    'participio-presente': {
      columns: [col('-are', 'amare', 'am', 'ante'), col('-ere', 'credere', 'cred', 'ente'), col('-ire', 'servire', 'serv', 'ente')]
    },
    'participio-passato': {
      columns: [col('-are', 'amare', 'am', 'ato'), col('-ere', 'credere', 'cred', 'uto'), col('-ire', 'servire', 'serv', 'ito')]
    },
    'gerundio-presente': {
      columns: [col('-are', 'amare', 'am', 'ando'), col('-ere', 'credere', 'cred', 'endo'), col('-ire', 'servire', 'serv', 'endo')]
    }
  },

  es: {
    'ind-presente': {
      columns: [
        col('-ar', 'hablar', 'habl', 'o as a amos áis an'),
        col('-er', 'comer', 'com', 'o es e emos éis en'),
        col('-ir', 'vivir', 'viv', 'o es e imos ís en')
      ]
    },
    'ind-preterito': {
      columns: [
        col('-ar', 'hablar', 'habl', 'é aste ó amos asteis aron'),
        col('-er', 'comer', 'com', 'í iste ió imos isteis ieron'),
        col('-ir', 'vivir', 'viv', 'í iste ió imos isteis ieron')
      ],
      note: '-er and -ir verbs share the same endings. nosotros is the same as in the presente for -ar and -ir.'
    },
    'ind-imperfecto': {
      columns: [
        col('-ar', 'hablar', 'habl', 'aba abas aba ábamos abais aban'),
        col('-er', 'comer', 'com', 'ía ías ía íamos íais ían'),
        col('-ir', 'vivir', 'viv', 'ía ías ía íamos íais ían')
      ]
    },
    'ind-futuro': {
      columns: [
        col('-ar', 'hablar', 'hablar', 'é ás á emos éis án'),
        col('-er', 'comer', 'comer', 'é ás á emos éis án'),
        col('-ir', 'vivir', 'vivir', 'é ás á emos éis án')
      ],
      note: 'The endings go on the whole infinitive and are the same for all three groups.'
    },
    'ind-condicional': {
      columns: [
        col('-ar', 'hablar', 'hablar', 'ía ías ía íamos íais ían'),
        col('-er', 'comer', 'comer', 'ía ías ía íamos íais ían'),
        col('-ir', 'vivir', 'vivir', 'ía ías ía íamos íais ían')
      ],
      note: 'The whole infinitive + the -er/-ir imperfecto endings. Same stem as the futuro.'
    },
    'sub-presente': {
      columns: [
        col('-ar', 'hablar', 'habl', 'e es e emos éis en'),
        col('-er', 'comer', 'com', 'a as a amos áis an'),
        col('-ir', 'vivir', 'viv', 'a as a amos áis an')
      ],
      note: 'The vowel swaps: -ar verbs take e, -er and -ir verbs take a.'
    },
    'sub-imperfecto': {
      columns: [
        col('-ar', 'hablar', 'habl', 'ara|ase aras|ases ara|ase áramos|ásemos arais|aseis aran|asen'),
        col('-er', 'comer', 'com', 'iera|iese ieras|ieses iera|iese iéramos|iésemos ierais|ieseis ieran|iesen'),
        col('-ir', 'vivir', 'viv', 'iera|iese ieras|ieses iera|iese iéramos|iésemos ierais|ieseis ieran|iesen')
      ],
      note: 'Built on the ellos form of the pretérito (hablaron → habla-). The -ra and -se forms are both correct.'
    },
    'imp-afirmativo': {
      columns: [
        col('-ar', 'hablar', 'habl', '- a e emos ad en'),
        col('-er', 'comer', 'com', '- e a amos ed an'),
        col('-ir', 'vivir', 'viv', '- e a amos id an')
      ],
      note: 'tú = the él form of the presente. vosotros = infinitive with -r → -d. The other persons use the subjuntivo presente.'
    },
    'imp-negativo': {
      columns: [
        col('-ar', 'hablar', 'habl', '- es e emos éis en'),
        col('-er', 'comer', 'com', '- as a amos áis an'),
        col('-ir', 'vivir', 'viv', '- as a amos áis an')
      ],
      note: 'no + the subjuntivo presente, for every person.'
    },
    gerundio: {
      columns: [col('-ar', 'hablar', 'habl', 'ando'), col('-er', 'comer', 'com', 'iendo'), col('-ir', 'vivir', 'viv', 'iendo')]
    },
    participio: {
      columns: [col('-ar', 'hablar', 'habl', 'ado'), col('-er', 'comer', 'com', 'ido'), col('-ir', 'vivir', 'viv', 'ido')]
    }
  }
};

/** Splits "am[o] / am[i]" into alternatives, each a list of plain and highlighted parts. */
export function parseCell(cell: string): { text: string; ending: boolean }[][] {
  return cell.split(' / ').map((alt) =>
    alt
      .split(/(\[[^\]]*\])/)
      .filter(Boolean)
      .map((part) => (part.startsWith('[') ? { text: part.slice(1, -1), ending: true } : { text: part, ending: false }))
  );
}

/** The plain forms of a cell: "am[o] / am[i]" → ["amo", "ami"]. */
export function cellForms(cell: string): string[] {
  return parseCell(cell).map((parts) => parts.map((p) => p.text).join(''));
}
