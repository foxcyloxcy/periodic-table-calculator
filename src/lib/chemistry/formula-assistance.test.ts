import { describe, expect, it } from 'vitest';
import { appendElementToFormula, compactRepeatedSymbols, suggestFormulaAlternatives } from './formula-assistance';
import { calculateMolarMass, parseFormula, FormulaError } from './calculator';
describe('formula input assistance', () => {
 it('converts repeat clicks to atom-count notation without changing composition', () => {
  expect(appendElementToFormula('FeS','O')).toBe('FeSO');
  expect(appendElementToFormula('FeSO','O')).toBe('FeSO2');
  expect(appendElementToFormula('FeSO3','O')).toBe('FeSO4');
  expect(appendElementToFormula('FeSOOOO','O')).toBe('FeSO5');
  expect(appendElementToFormula('H2O','H')).toBe('H2OH');
 });
 it('preserves atom counts when compacting repeated symbols',()=>{
  expect(compactRepeatedSymbols('FeSOOOO')).toBe('FeSO4');
  expect(compactRepeatedSymbols('HHOO')).toBe('H2O2');
  expect(parseFormula('FeSOOOO')).toEqual(parseFormula('FeSO4'));
  expect(compactRepeatedSymbols('FeSO4')).toBeNull();
  expect(compactRepeatedSymbols('Ca(OH)2')).toBeNull();
  expect(compactRepeatedSymbols('XxXx')).toBeNull();
 });
 it('suggests reviewed names and normalization without automatic changes',()=>{
  expect(suggestFormulaAlternatives('FeSOOOO')[0]).toMatchObject({
    formula:'FeSO4',label:'Iron(II) sulfate',reason:'repeated_symbol',changesComposition:false,
  });
  expect(suggestFormulaAlternatives('feso4')[0]).toMatchObject({formula:'FeSO4',reason:'case_normalization'});
  expect(suggestFormulaAlternatives('FeSO5').some(s=>s.formula==='FeSO4' && s.changesComposition)).toBe(true);
  expect(suggestFormulaAlternatives('Xx')).toEqual([]);
 });
 it('never changes actual calculation based on hints',()=>{
  const result=calculateMolarMass('FeSOOOO');
  expect(result.value).toBeCloseTo(151.901,5);
  expect(result.compoundName.status).toBe('unresolved');
  expect(()=>calculateMolarMass('Xx')).toThrow(FormulaError);
 });
});
