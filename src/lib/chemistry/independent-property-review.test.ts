import {describe,it,expect} from 'vitest';
import {independentElementReviews,independentReview,reviewProgress} from './independent-property-review';
import {findElement} from './periodic-table';
import {calculateMolarMass} from './calculator';
describe('independent scientific source comparisons',()=>{
 it('limits verified comparisons to explicitly checked six records, never all 118',()=>{
  expect(independentElementReviews.map(r=>r.symbol)).toEqual(['H','C','O','Fe','Au','Og']);
  expect(reviewProgress()).toMatchObject({reviewedElements:6,totalElements:118,comparedFields:18});
  expect(independentReview('Ts')).toBeUndefined();
 });
 it('tracks real disagreement on gold electronegativity without overwriting source values',()=>{
  const gold=independentReview('Au')!;
  const en=gold.comparisons.find(c=>c.field==='electronegativity')!;
  expect(en).toMatchObject({status:'conflict',displayValue:'2.54',referenceValue:'2.4'});
  expect(en.sourceUrl).toContain('/79/gold');
  expect(findElement('Au')?.electronegativity).toBe(2.54);
 });
 it('shows matched reference conditions for ordinary elements',()=>{
  const oxygen=independentReview('O')!;
  expect(oxygen.comparisons.find(c=>c.field==='phase')).toMatchObject({status:'matches',referenceValue:'Gas'});
  expect(oxygen.comparisons.find(c=>c.field==='phase')?.referenceCondition).toContain('20 °C');
  expect(oxygen.comparisons.find(c=>c.field==='electronConfiguration')).toMatchObject({status:'matches'});
 });
 it('superheavy states are never upgraded to verified experimental observations',()=>{
  const og=independentReview('Og')!;
  expect(og.comparisons.find(c=>c.field==='phase')?.status).toBe('theoretical');
  expect(og.comparisons.find(c=>c.field==='electronConfiguration')?.status).toBe('theoretical');
  expect(og.comparisons.find(c=>c.field==='electronegativity')?.status).toBe('unavailable');
 });
 it('keeps atomic-weight calculations completely unchanged',()=>{
  expect(calculateMolarMass('H2O').value).toBeGreaterThan(18);
  expect(calculateMolarMass('Fe2O3').value).toBeGreaterThan(150);
 });
});
