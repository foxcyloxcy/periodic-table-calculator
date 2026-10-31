import {describe,expect,it} from 'vitest';
import {elementScientificCrossChecks,scientificCrossCheck,scientificReviewSummary} from './systematic-element-crosscheck';
import nist from './nist-neutral-configurations.json';
import rsc from './rsc-element-property-checks.json';
import {periodicElements} from './periodic-table';
import {calculateMolarMass} from './calculator';

describe('NIST critically compiled neutral electronic structures',()=>{
 it('verifies a complete unbroken H to U 92-record source snapshot, not extrapolated to 118',()=>{
  expect(nist.records).toHaveLength(92);
  expect(nist.records.map(x=>x.atomicNumber)).toEqual(Array.from({length:92},(_,i)=>i+1));
  expect(nist.records.map(x=>x.symbol)).toEqual(periodicElements.slice(0,92).map(x=>x.symbol));
  expect(elementScientificCrossChecks).toHaveLength(118);
  expect(scientificCrossCheck('U')?.electronConfiguration.status).toBe('matches_reference');
  expect(scientificCrossCheck('Np')?.electronConfiguration.status).toBe('not_covered');
  expect(scientificCrossCheck('Og')?.electronConfiguration.status).toBe('not_covered');
 });
 it('compares all 92 neutral ground configurations after typography normalization only',()=>{
  expect(scientificReviewSummary()).toMatchObject({nistNeutralCovered:92,nistAgreement:92,nistDisagreement:0,remainingNistReview:26});
  expect(scientificCrossCheck('Cr')?.electronConfiguration.reference).toBe('[Ar] 3d5 4s1');
  expect(scientificCrossCheck('Au')?.electronConfiguration.reference).toBe('[Xe] 4f14 5d10 6s1');
  expect(scientificCrossCheck('U')?.electronConfiguration.reference).toContain('5f3');
 });
 it('does not falsely label NIST compiled table as direct ASD 5.12 extraction',()=>{
  const r=scientificCrossCheck('Fe')!.electronConfiguration;
  expect(r.evidenceScope).toContain('not a direct per-entry NIST ASD 5.12 query');
  expect(r.referenceCondition).toContain('neutral atom');
  expect(r.sourceUrl).toContain('nist.gov');
 });
});
describe('source-conditioned RSC phase and Pauling checks',()=>{
 it('preserves all 39 exact provenance links and source temperature',()=>{
  expect(rsc.records).toHaveLength(39);
  expect(new Set(rsc.records.map(e=>e.atomicNumber)).size).toBe(39);
  expect(scientificReviewSummary().rscPhaseCovered).toBe(39);
  expect(scientificCrossCheck('Br')?.phase).toMatchObject({status:'matches_reference',reference:'Liquid'});
  expect(scientificCrossCheck('Br')?.phase.referenceCondition).toContain('20 °C; pressure not specified');
 });
 it('flags a source discrepancy on mercury without changing the stored value',()=>{
  expect(scientificCrossCheck('Hg')?.electronegativity).toMatchObject({status:'disagreement',displayed:'2',reference:'1.9'});
  expect(periodicElements.find(e=>e.symbol==='Hg')?.electronegativity).toBe(2);
 });
 it('keeps theoretical superheavy phase distinct from measured agreement',()=>{
  expect(scientificCrossCheck('Og')?.phase.status).toBe('predicted_not_measured');
  expect(scientificCrossCheck('Og')?.electronConfiguration.status).toBe('not_covered');
 });
 it('does not infer reference states for unreviewed elements',()=>{
  expect(scientificCrossCheck('Ag')?.phase.status).toBe('not_covered');
  expect(scientificCrossCheck('Ag')?.phase.reference).toBeNull();
 });
 it('does not affect the deterministic molar-mass calculator',()=>{
  expect(calculateMolarMass('H2O').value).toBeGreaterThan(18);
  expect(calculateMolarMass('Fe2O3').value).toBeGreaterThan(150);
 });
});
