import { describe, expect, it } from 'vitest';
import { calculateMolarMass, parseFormula, FormulaError } from './calculator';
describe('chemical formula parser',()=>{
 it.each([
  ['H2O',{H:2,O:1}], ['CO2',{C:1,O:2}],
  ['Ca(OH)2',{Ca:1,H:2,O:2}], ['Al2(SO4)3',{Al:2,O:12,S:3}],
  ['Mg(OH)2',{Mg:1,H:2,O:2}],
 ])('parses %s', (formula,expected)=>expect(parseFormula(formula)).toEqual(expected));
 it.each(['','H0','H2O)','(OH','()','H2 O','2H2O','CuSO4·5H2O','Xx2','C(OH)0','h2o','Na+','C1.5H3'])('rejects unsupported/invalid %s',formula=>expect(()=>parseFormula(formula)).toThrow(FormulaError));
 it('enforces atom count and nesting caps',()=>{
  expect(()=>parseFormula('H100000H100000H100000H100000H100000H100000H100000H100000H100000H100000H100000')).toThrow();
  expect(()=>parseFormula('('.repeat(14)+'H'+')'.repeat(14))).toThrow();
 });
});
describe('molar mass',()=>{
 it.each([['H2O',18.015],['CO2',44.009],['Ca(OH)2',74.092],['Al2(SO4)3',342.132]])('computes %s from atomic weights', (formula,expected)=>{
  const result=calculateMolarMass(formula);
  expect(result.value).toBeCloseTo(expected,3);
  expect(result.steps.reduce((sum,t)=>sum+t.contribution,0)).toBeCloseTo(result.value,10);
  expect(result.datasetVersion).toBeTruthy();
 });
 it('repeats deterministically',()=>expect(calculateMolarMass('Fe2O3')).toEqual(calculateMolarMass('Fe2O3')));
});
