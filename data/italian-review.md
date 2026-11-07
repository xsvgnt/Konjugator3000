# Italian data review (7 November 2026)

All 102 verbs of `italian-verbs.xlsx` were checked, every tense and person, against the conjugation
tables of [Wiktionary](https://en.wiktionary.org/) (CC BY-SA). Compound tenses were checked as
auxiliary + past participle. WordReference forbids automated access, so it was not used.

The regular/irregular flag was set with a rule-based conjugator: a verb is **irregular** when any of
its forms (all simple tenses, past participle, gerund) differs from the regular pattern of its
conjugation. These do **not** make a verb irregular:

- spelling changes that keep the sound: *cercare → cerchi*, *pagare → paghi*, *mangiare → mangi, mangerò*, *studiare → studi*
- the *-isc-* pattern of *-ire* verbs: *capisco, finisce, preferiscano*
- the two regular *passato remoto* endings of *-ere* verbs: *credei / credetti*

## Regular/irregular flags (29 verbs changed)

Now **irregular** (were regular): accendere, aprire, bere, chiedere, chiudere, conoscere, correre,
cuocere, esistere, leggere, mettere, nascere, perdere, piacere, piovere, prendere, rimanere,
rispondere, scendere, scrivere, vivere.

Now **regular** (were irregular): lasciare (spelling change only), capire, finire, preferire (*-isc-*).

In the *Indicativo trapassato remoto* sheet the flags were shifted by one row from *capire* down to
the end (an extra “irreg” sat below the last verb). They are now the same as in every other sheet:
dormire, partire, sentire, uscire were wrong there.

The 39 irregular verbs are: accendere, andare, aprire, avere, bere, chiedere, chiudere, conoscere,
correre, cuocere, dare, dire, dovere, esistere, essere, fare, leggere, mettere, morire, nascere,
perdere, piacere, piovere, potere, prendere, ridere, rimanere, rispondere, salire, sapere, scendere,
scrivere, spegnere, stare, uscire, vedere, venire, vivere, volere.

## Wrong forms

| Sheet | Verb | Was | Now |
|---|---|---|---|
| Imperativo presente | volere · tu | vuoi | vogli |
| Imperativo presente | volere · voi | volete | vogliate |

## Archaic variant listed first (modern form now first, archaic one still accepted)

| Sheet | Verb | Was | Now |
|---|---|---|---|
| Indicativo presente | fare · io | fo/accio | faccio/fo |
| Congiuntivo presente | dovere · io, tu, lui | deva/ebba | debba/deva |
| Indicativo passato remoto | ripetere · io, lui, loro | ripetetti/ei … | ripetei/etti … |
| Indicativo presente, Congiuntivo presente, Imperativo | spegnere · noi, voi | spegn(i)amo, spegn(i)ate | spegniamo/spegnamo, spegniate/spegnate |

## Common variants added

| Sheet | Verb | Was | Now |
|---|---|---|---|
| Indicativo presente | dovere · io | devo | devo/ebbo (*debbo*) |
| Indicativo passato remoto | dare · io | diedi | diedi/etti (*detti*) |
| Indicativo passato remoto | perdere · io, lui, loro | persi, perse, persero | + perdei/perdetti, perdé/perdette, perderono/perdettero |

Truncated imperatives are accepted with or without the apostrophe (*di'/di*, *va'/va*, *fa'/fa*);
this is handled by the grading, not the sheet.

## Stray characters removed

*cambi\*\*\*\** and *studi\*\*\*\** in *Congiuntivo presente* and *Imperativo presente*.

## Defective verb: piovere

*piovere* is impersonal: only the third persons are kept (*piove, piovono*); first and second persons
are now “-” and never asked. It has no imperative. Compound tenses accept both auxiliaries:
*ha piovuto / è piovuto*.

A cell can now hold whole alternatives separated by “ / ” (with spaces), e.g.
`lui ha piovuto / è piovuto`; a “/” inside a word is still the ending shorthand (`perso/duto`).

## Checked and kept

- Literary variants that Wiktionary doesn't list but grammars accept: *veggo, vegga, veggano*
  (vedere), *bevei, bevé, beverono* (bere), *spegnamo*, *deva*, *fo*, *ripetetti*. They are accepted
  answers, never the one shown first.
- The auxiliary of compound tenses: the sheet's choice was valid for every verb.
- English translations (`data/translations.en.json`) match Wiktionary's main senses.
