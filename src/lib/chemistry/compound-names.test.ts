import { describe, expect, it } from 'vitest';
import { normalizeKnownCompoundFormula, resolveCompoundName } from './compound-names';
import { calculateMolarMass } from './calculator';

describe('evidence-backed names for an explicit formula', () => {
  it('identifies anhydrous FeSO4 with systematic and common names', () => {
    const name = resolveCompoundName('FeSO4');
    expect(name.status).toBe('verified');
    if (name.status === 'verified') {
      expect(name.preferredName).toBe('Iron(II) sulfate');
      expect(name.commonNames).toContain('Ferrous sulfate');
      expect(name.sourceId).toBe('CID 24393');
      expect(name.note).toContain('anhydrous');
    }
  });
  it('distinguishes iron(II) and iron(III) sulfate', () => {
    expect(resolveCompoundName('Fe2(SO4)3')).toMatchObject({
      status: 'verified', preferredName: 'Iron(III) sulfate',
      commonNames: ['Ferric sulfate'], sourceId: 'CID 24826',
    });
  });
  it('provides names for simple verified compounds', () => {
    expect(resolveCompoundName(' H2O ')).toMatchObject({status:'verified', preferredName:'Water'});
    expect(resolveCompoundName('CaCO3')).toMatchObject({status:'verified', preferredName:'Calcium carbonate'});
    expect(resolveCompoundName('Na2CO3')).toMatchObject({status:'verified', preferredName:'Sodium carbonate'});
  });
  it.each(['C2H6O','CH4','FeO4S','FeSO4·7H2O','CuSO4','HCl','Fe'])(
    'does not invent an identity for %s', formula => {
      expect(resolveCompoundName(formula)).toMatchObject({status:'unresolved'});
    }
  );
  it('accepts lowercase only for unambiguous verified entries', () => {
    expect(normalizeKnownCompoundFormula('feso4')).toBe('FeSO4');
    expect(calculateMolarMass('feso4').formula).toBe('FeSO4');
    expect(calculateMolarMass('feso4').compoundName).toMatchObject({status:'verified', preferredName:'Iron(II) sulfate'});
    expect(normalizeKnownCompoundFormula('co')).toBe('co');
    expect(() => calculateMolarMass('co')).toThrow();
  });
  it('naming never controls the numeric computation', () => {
    const named = calculateMolarMass('FeSO4');
    const unverified = calculateMolarMass('CuSO4');
    expect(named.compoundName.status).toBe('verified');
    expect(unverified.compoundName.status).toBe('unresolved');
    expect(named.value).toBeCloseTo(55.845 + 32.06 + 4*15.999,5);
    expect(unverified.value).toBeGreaterThan(0);
    expect(named.steps.reduce((sum,step)=>sum+step.contribution,0)).toBeCloseTo(named.value,8);
  });
});
