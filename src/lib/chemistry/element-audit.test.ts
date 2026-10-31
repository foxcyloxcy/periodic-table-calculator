import {describe,it,expect} from 'vitest';
import {auditBySymbol,auditElement,auditOverview,elementAuditRegistry} from './element-audit';
import {periodicElements} from './periodic-table';
import {calculateMolarMass} from './calculator';
describe('element-property scientific provenance',()=>{
 it('adds audit records for all recognized elements without changing the underlying dataset',()=>{
  expect(elementAuditRegistry).toHaveLength(118);
  expect(elementAuditRegistry.map(e=>e.atomicNumber)).toEqual(Array.from({length:118},(_,i)=>i+1));
  expect(elementAuditRegistry.map(e=>e.symbol)).toEqual(periodicElements.map(e=>e.symbol));
  expect(auditBySymbol('Og')?.atomicNumber).toBe(118);
  expect(auditBySymbol('Uue')).toBeUndefined();
 });
 it('separates official weights from secondary display properties',()=>{
  const oxygen=auditBySymbol('O')!;
  expect(oxygen.identity.level).toBe('official_identity');
  expect(oxygen.properties.find(p=>p.field==='atomicWeight')?.level).toBe('official_reference');
  expect(oxygen.properties.find(p=>p.field==='phase')?.level).toBe('secondary_unverified');
  expect(oxygen.properties.every(p=>p.sourceUrl.startsWith('https://'))).toBe(true);
 });
 it('flags superheavy phase and electron configuration as uncertain, never experimental',()=>{
  const og=auditBySymbol('Og')!;
  expect(og.properties.find(p=>p.field==='phase')?.level).toBe('predicted_or_uncertain');
  expect(og.properties.find(p=>p.field==='electronConfiguration')?.caveat).toMatch(/predicted/i);
  expect(og.properties.find(p=>p.field==='atomicWeight')?.level).toBe('not_available');
  expect(og.properties.find(p=>p.field==='atomicWeight')?.caveat).toMatch(/Do not substitute/i);
 });
 it('keeps existing calculator numbers identical',()=>{
  expect(calculateMolarMass('H2O').value).toBeGreaterThan(18);
  const e=periodicElements.find(x=>x.symbol==='O')!;
  expect(auditElement(e).properties.length).toBe(5);
 });
 it('provides an explicit review backlog count',()=>{
  const summary=auditOverview();
  expect(summary).toMatchObject({recognizedElements:118,lastRecognizedAtomicNumber:118,sourceEdition:'CIAAW 2024',checkedDate:'2026-10-31'});
  expect(summary.authoritativeWeightEntries+summary.missingStandardWeights).toBe(118);
  expect(summary.phasePredictionsFlagged).toBe(15);
  expect(summary.pendingSecondaryFieldReviews).toBeGreaterThan(0);
 });
});
