import elementsSnapshot from './periodic-table.json';

export type AtomicWeightStatus = 'secondary_approximate' | 'no_standard_atomic_weight';
export interface PeriodicElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  group: number | null;
  period: number;
  x: number;
  y: number;
  category: string;
  phase: string | null;
  block: string | null;
  electronegativity: number | null;
  electronConfiguration: string | null;
  approximateAtomicWeight: number | null;
  atomicWeightStatus: AtomicWeightStatus;
}
/** A pinned *display* snapshot, not authoritative molar mass constants. */
export const PERIODIC_TABLE_VERSION = 'bowserinator-snapshot-2026-10-31';
export const PERIODIC_TABLE_SOURCE = 'https://github.com/Bowserinator/Periodic-Table-JSON';
export const STANDARD_WEIGHT_REFERENCE = 'https://www.ciaaw.org/atomic-weights.htm';
export const periodicElements: readonly PeriodicElement[] = Object.freeze(
  elementsSnapshot as PeriodicElement[],
);
export function findElement(query: string | number): PeriodicElement | undefined {
  if (typeof query === 'number') return periodicElements.find(e => e.atomicNumber === query);
  const q = query.trim().toLowerCase();
  return periodicElements.find(e => e.symbol.toLowerCase() === q || e.name.toLowerCase() === q);
}
export function searchElements(query: string, category = 'all'): readonly PeriodicElement[] {
  const q = query.trim().toLowerCase();
  return periodicElements.filter(e =>
    (category === 'all' || e.category === category) &&
    (!q || e.name.toLowerCase().includes(q) || e.symbol.toLowerCase().includes(q) ||
      String(e.atomicNumber) === q)
  );
}
export const elementCategories = [...new Set(periodicElements.map(e => e.category))].sort();
