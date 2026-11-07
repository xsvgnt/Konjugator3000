# Italian data review

## Update: verb list and groups (7 November 2026, evening)

The Italian verbs are now the 77 of `italian_list.xlsx`, in four groups taken from that list as is:
Regular (2), Irregular (23), Spelling change (17), Irregular participle (35). The 66 verbs of
`italian-verbs.xlsx` that are not in the list stay in the spreadsheet but are skipped.
The regular/irregular flags discussed further down are superseded by these groups.

**41 new verbs** were added to `italian-verbs.xlsx`, conjugated from Wiktionary (CC BY-SA) and
checked again afterwards: assistere, assolvere, assumere, cadere, compiere, comunicare, concedere,
concludere, crescere, designare, dirigere, discutere, distruggere, dolere, educare, emergere,
espandere, esplodere, esprimere, fondere, giungere, invadere, inviare, muovere, nuocere, parere,
persuadere, piangere, porgere, porre, rompere, sciogliere, sedere, servire, spingere, tenere,
torcere, tradurre, trarre, valere, vincere.

- **Auxiliary**: *essere* for cadere, crescere, emergere, esplodere, giungere, parere, sedere;
  both accepted (first one shown) for servire (*ho servito / sono servito*), dolere
  (*è doluto / ha doluto*), valere (*è valso / ha valso*); *avere* for all others.
- **Variants** listed by Wiktionary are accepted (*muoviamo / moviamo*, *assistetti / assistei*).
  Standard forms come first: *nuoccio* before *noccio*, *nuociuto* before *nociuto*; *espandere*
  keeps only *espanso* (not the archaic *espanto*).
- **Imperative**: *parere* has none, so it is never asked.

**Participio presente** is a new tense (Forme nominali), filled from Wiktionary for all 77 verbs.
*essere*, *dovere* and *sapere* have none, so it is never asked for them.

**Tense picker** follows WordReference's layout: Indicativo (presente, imperfetto, passato remoto,
futuro semplice) · Tempi composti (passato prossimo, trapassato prossimo, trapassato remoto, futuro
anteriore) · Condizionale · Congiuntivo (presente, imperfetto, passato, trapassato) · Imperativo ·
Forme nominali (participio presente, participio passato, gerundio). Clicking a block's heading
selects or clears the whole block.

**English translations** for the new verbs were added to `data/translations.en.json`.

## First review (7 November 2026)

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
