import {NatureName} from '@pkmn/types';
import {SpreadRange} from '../spread-range';

const RANGE = new SpreadRange({
  min: {
    nature: 'Docile',
    evs: {spa: 252, hp: 20, spd: 0, spe: 200},
    ivs: {spd: 20, spa: 31, atk: 0, spe: 0},
  },
  max: {
    nature: 'Modest',
    evs: {spa: 255, hp: 80, spd: 252, spe: 252},
    ivs: {spd: 31, spa: 31, atk: 10, spe: 31},
  },
});

describe('SpreadRange', () => {
  test('#toString', () => {
    expect(RANGE.toString()).toEqual(
      `EVs: 20-80 HP / 252 SpA / ??? SpD / >200 Spe\n` +
      `Docile-Modest Nature\n` +
      `IVs: <10 Atk / >20 SpD / ??? Spe`
    );
    expect(SpreadRange.display(RANGE, true)).toEqual(
      `Docile-Modest 20-80/0/0/252/???/>200\n` +
      `IVs: 31/<10/31/31/>20/???`
    );
  });

  test('#fromString', () => {
    expect(SpreadRange.fromString(RANGE.toString())).toEqual(RANGE);
    expect(SpreadRange.fromString(
      `Docile - Modest Nature\n` +
      `IVs: >20 SpD /<10 Atk /  ??? Spe\n` +
      `EVs: 252 SpA /20-80 HP / ??? SpD/>200 Spe\n`
    )).toEqual(RANGE);
    expect(SpreadRange.fromString(
      `IVs:  31/<10/31 /31/>20/???\n` +
      `Docile- Modest  20-80/ 0/0/252/???/>200\n`
    )).toEqual(RANGE);
  });

  test('#toSpread', () => {
    expect(SpreadRange.toSpread(RANGE)).toBeUndefined();
    const s = {
      nature: 'Modest' as NatureName,
      evs: {spa: 252, hp: 56, spe: 200},
      ivs: {spd: 30, atk: 0},
    };
    expect(SpreadRange.toSpread({min: s, max: s})).toEqual(s);
  });

  test('#toStatsRange', () => {
    expect(RANGE.toStatsRange({hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110})).toEqual({
      min: {hp: 266, atk: 135, def: 156, spa: 359, spd: 175, spe: 275},
      max: {hp: 281, atk: 130, def: 156, spa: 394, spd: 249, spe: 319},
    });
  });
});