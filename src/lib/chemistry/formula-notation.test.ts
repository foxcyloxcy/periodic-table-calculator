import {describe,it,expect,vi} from 'vitest';
import {normalizeFormulaNotation} from './formula-notation';
import {formulaFromComposition} from './formula-composition';
import {calculateMolarMass,parseFormula,FormulaError} from './calculator';
import {caseFormulaCandidates} from './formula-case';
import {appendElementToFormula,suggestFormulaAlternatives} from './formula-assistance';
import {lookupFormulaIdentities} from './material-lookup';

describe('chemical notation boundaries',()=>{
 it.each([['H₂O','H2O'],['Al₂(SO₄)₃','Al2(SO4)3'],[' C₁₂H₂₂O₁₁ ','C12H22O11']])('normalizes atom-count notation %s', (input,normalized)=>{
  expect(normalizeFormulaNotation(input)).toBe(normalized);
  expect(normalizeFormulaNotation(normalized)).toBe(normalized);
  const result=calculateMolarMass(input);
  expect(result.formula).toBe(normalized);
  expect(result.inputFormula).toBe(input.trim());
  expect(result.value).toBe(calculateMolarMass(normalized).value);
 });
 it('preserves charge, isotope notation, case and internal whitespace for validation',()=>{
  for(const input of ['¹³CH4','NH₄⁺','SO₄²⁻','H²O','Co','CO','Na Cl','[13C]H4']){
   expect(normalizeFormulaNotation(input)).toBe(input.replace('₄','4'));
  }
  expect(caseFormulaCandidates('c₂h₆o')).toEqual(['C2H6O']);
  expect(caseFormulaCandidates('co')).toEqual(expect.arrayContaining(['Co','CO']));
  expect(appendElementToFormula('H₂','H')).toBe('H3');
 });
 it.each(['CuSO4·5H2O','CuSO4.5H2O','NH4+','SO₄²⁻','¹³CH4','[Fe(CN)6]','H2 -> H2','H2=H2'])('explains unsupported %s without a number or network request',async input=>{
  try{calculateMolarMass(input);expect.fail('Expected a capability error');}
  catch(error){expect(error).toBeInstanceOf(FormulaError);expect((error as FormulaError).code).toBe('unsupported_notation');expect((error as Error).message).toContain('supported');}
  expect(suggestFormulaAlternatives(input)).toEqual([]);
  const fetcher=vi.fn();
  expect((await lookupFormulaIdentities(input,fetcher)).status).toBe('unsupported');
  expect(fetcher).not.toHaveBeenCalled();
 });
 it.each(['Xx2','H0','H100001','H2 O','()','Ca(OH'])('keeps malformed %s invalid',async input=>{
  const fetcher=vi.fn();
  expect((await lookupFormulaIdentities(input,fetcher)).status).toBe('invalid');
  expect(fetcher).not.toHaveBeenCalled();
 });
 it('distinguishes a recognized element without a standard atomic weight',async()=>{
  expect(()=>calculateMolarMass('TcO2')).toThrow(/No standard atomic weight/);
  const output=await lookupFormulaIdentities('TcO2',vi.fn());
  expect(output.status).toBe('unsupported');
 });
});

describe('absolute-composition invariants',()=>{
 it('preserves 128 generated compositions through order, grouping and subscript formatting',()=>{
  const symbols=['Na','Cl','Ca','O','H','C','N','S'];
  let seed=73817;
  for(let i=0;i<128;i++){
   const counts:Record<string,number>={};
   for(const symbol of symbols){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed%7;if(n)counts[symbol]=n;}
   const flat=formulaFromComposition(counts);
   const reversed=Object.entries(counts).reverse().map(([s,n])=>s+n).join('');
   expect(parseFormula(flat)).toEqual(counts);
   expect(parseFormula(reversed)).toEqual(counts);
   expect(calculateMolarMass(reversed).value).toBeCloseTo(calculateMolarMass(flat).value,10);
   const grouped='('+reversed+')2';
   expect(parseFormula(grouped)).toEqual(Object.fromEntries(Object.entries(counts).map(([s,n])=>[s,n*2])));
   expect(calculateMolarMass(grouped).value).toBeCloseTo(2*calculateMolarMass(flat).value,10);
   const subscripts=flat.replace(/[0-9]/g,d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)]);
   expect(parseFormula(subscripts)).toEqual(counts);
  }
 });
 it('does not reduce molecular formulas to empirical ratios',()=>{
  expect(formulaFromComposition(parseFormula('C6H12O6'))).toBe('C6H12O6');
  expect(formulaFromComposition(parseFormula('Na2Cl2'))).toBe('Cl2Na2');
 });
 it.each([['NaCl',58.44],['H₂O',18.015],['Ca(OH)₂',74.092],['Mg(OH)2',58.319],['Al₂(SO₄)₃',342.132],['NaHCO3',84.006]])('retains independent CIAAW arithmetic benchmark %s',(formula,mass)=>{
  expect(calculateMolarMass(formula).value).toBeCloseTo(mass,6);
 });
});
