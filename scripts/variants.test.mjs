import { describe, expect, it } from 'vitest';
import { expandCell } from './variants.mjs';

describe('shorthand expansion', () => {
  it.each([
    ['perso/duto', 'perdere', ['perso', 'perduto']],
    ['ho visto/eduto', 'vedere', ['ho visto', 'ho veduto']],
    ['bevvi/vei/vetti', 'bere', ['bevvi', 'bevei', 'bevetti']],
    ['bevve/vé/vette', 'bere', ['bevve', 'bevé', 'bevette']],
    ['credetti/ei', 'credere', ['credetti', 'credei']],
    ['credette/é', 'credere', ['credette', 'credé']],
    ['diede/ette', 'dare', ['diede', 'dette']],
    ['morirò/orrò', 'morire', ['morirò', 'morrò']],
    ['devono/ebbono', 'dovere', ['devono', 'debbono']],
    ['fo/accio', 'fare', ['fo', 'faccio']],
    ["va'/vai", 'andare', ["va'", 'vai']],
    ["sta'/ai", 'stare', ["sta'", 'stai']],
    ['c(u)ociamo', 'cuocere', ['cociamo', 'cuociamo']],
    ['aprii/apersi', 'aprire', ['aprii', 'apersi']],
    ['hablo', 'hablar', ['hablo']],
    ['faccio/fo', 'fare', ['faccio', 'fo']],
    ['debba/deva', 'dovere', ['debba', 'deva']],
    ['devo/ebbo', 'dovere', ['devo', 'debbo']],
    ['diedi/etti', 'dare', ['diedi', 'detti']],
    ['ripetei/etti', 'ripetere', ['ripetei', 'ripetetti']],
    ['ripeté/ette', 'ripetere', ['ripeté', 'ripetette']],
    ['ripeterono/ettero', 'ripetere', ['ripeterono', 'ripetettero']],
    ['spegniamo/spegnamo', 'spegnere', ['spegniamo', 'spegnamo']],
    ['persi/perdei/perdetti', 'perdere', ['persi', 'perdei', 'perdetti']],
    ['perse/perdé/perdette', 'perdere', ['perse', 'perdé', 'perdette']]
  ])('%s (%s)', (cell, inf, expected) => {
    expect(expandCell(cell, inf)).toEqual(expected);
  });
});
