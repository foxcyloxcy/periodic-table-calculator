import { describe, expect, it } from 'vitest';
import { atomicWeightRecords, atomicWeights, atomicWeightBySymbol } from './elements';
import { periodicElements } from './periodic-table';
import { calculateMolarMass, FormulaError } from './calculator';
describe('CIAAW 2024 official data',()=>{
 it('covers all 118 elements with matching symbol identities',()=>{
  expect(atomicWeightRecords).toHaveLength(118);
  expect(atomicWeightRecords.map(x=>x.atomicNumber)).toEqual(Array.from({length:118},(_,i)=>i+1));
  expect(atomicWeightRecords.map(x=>x.symbol)).toEqual(periodicElements.map(x=>x.symbol));
 });
 it('has 84 standard weights and 34 explicitly unavailable',()=>{
  expect(atomicWeightRecords.filter(x=>x.abridged)).toHaveLength(84);
  expect(Object.keys(atomicWeights)).toHaveLength(84);
  expect(atomicWeightRecords.filter(x=>x.standardStatus==='unavailable')).toHaveLength(34);
  for(const x of atomicWeightRecords){
   if(x.standardStatus==='unavailable')expect(x.abridged).toBeNull();
   else {
    expect(Number(x.abridged?.value)).toBeGreaterThan(0);
    expect(Number(x.abridged?.uncertainty)).toBeGreaterThan(0);
   }
  }
 });
 it('keeps intervals, and 2024 reviewed zirconium/gadolinium/lutetium',()=>{
  expect(atomicWeightBySymbol.get('H')?.fullStandard).toMatchObject({kind:'interval',lower:'1.00784',upper:'1.00811'});
  expect(atomicWeightBySymbol.get('Ar')?.fullStandard).toMatchObject({kind:'interval',lower:'39.792',upper:'39.963'});
  expect(atomicWeightBySymbol.get('Zr')?.fullStandard).toMatchObject({kind:'value',value:'91.222'});
  expect(atomicWeightBySymbol.get('Gd')?.fullStandard).toMatchObject({kind:'value',value:'157.249'});
  expect(atomicWeightBySymbol.get('Lu')?.fullStandard).toMatchObject({kind:'value',value:'174.96669'});
 });
 it('calculates formerly unsupported eligible elements',()=>{
  expect(calculateMolarMass('ZrO2').value).toBeCloseTo(91.222 + 2*15.999,6);
  expect(calculateMolarMass('UO2').value).toBeCloseTo(238.03 + 2*15.999,6);
  expect(()=>calculateMolarMass('TcO2')).toThrow(FormulaError);
  expect(()=>calculateMolarMass('Og')).toThrow(FormulaError);
 });
});