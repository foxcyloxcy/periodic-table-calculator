import { describe, expect, it } from 'vitest';
import { periodicElements, findElement, searchElements } from './periodic-table';

describe('118-element snapshot integrity', () => {
  it('has exactly one element per atomic number 1–118', () => {
    expect(periodicElements).toHaveLength(118);
    expect(periodicElements.map(e => e.atomicNumber)).toEqual(Array.from({length:118},(_,i)=>i+1));
    expect(new Set(periodicElements.map(e=>e.symbol)).size).toBe(118);
    expect(findElement('Og')?.atomicNumber).toBe(118);
    expect(findElement('Uununennium')).toBeUndefined();
  });
  it('places table cells within bounded grid and has no collisions', () => {
    const occupied=new Set<string>();
    for(const e of periodicElements) {
      expect(e.x).toBeGreaterThanOrEqual(1);
      expect(e.x).toBeLessThanOrEqual(18);
      expect(e.y).toBeGreaterThanOrEqual(1);
      expect(e.y).toBeLessThanOrEqual(10);
      const key=`${e.x}:${e.y}`;
      expect(occupied.has(key), key).toBe(false);
      occupied.add(key);
    }
  });
  it('does not display isotope mass numbers as standard atomic weights',()=>{
    for(const symbol of ['Tc','Pm','Po','Rn','Fr','Og']) {
      const e=findElement(symbol);
      expect(e?.approximateAtomicWeight).toBeNull();
      expect(e?.atomicWeightStatus).toBe('no_standard_atomic_weight');
    }
    expect(findElement('U')?.approximateAtomicWeight).not.toBeNull();
  });
  it('keeps all display masses explicitly non-authoritative',()=>{
    for(const e of periodicElements) {
      if(e.approximateAtomicWeight!==null) {
        expect(e.atomicWeightStatus).toBe('secondary_approximate');
        expect(Number.isFinite(e.approximateAtomicWeight)).toBe(true);
      }
    }
  });
  it('searches by name, symbol, number and category',()=>{
    expect(searchElements('oxygen').map(e=>e.symbol)).toEqual(['O']);
    expect(searchElements('Au').map(e=>e.atomicNumber)).toEqual([79]);
    expect(searchElements('118').map(e=>e.symbol)).toEqual(['Og']);
    expect(searchElements('zzzz')).toEqual([]);
    expect(findElement('gold')?.symbol).toBe('Au');
  });
});
