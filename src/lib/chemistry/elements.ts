import ciaaw from './ciaaw-2024.json';

export const DATASET_VERSION = ciaaw.datasetId;
export const DATASET_SOURCE = 'CIAAW Standard and Abridged Atomic Weights 2024';
export const DATASET_URLS = ciaaw.referenceURLs;

export interface AtomicWeightRecord {
  atomicNumber: number;
  symbol: string;
  name: string;
  standardStatus: 'value'|'interval'|'unavailable';
  abridged: {value:string;uncertainty:string}|null;
  fullStandard: {kind:string;value?:string;lower?:string;upper?:string;parentheticalUncertainty?:string|null}|null;
  notes: string;
  sourceEdition: string;
}
export const atomicWeightRecords: ReadonlyArray<AtomicWeightRecord> = ciaaw.records as AtomicWeightRecord[];
export const atomicWeights: Readonly<Record<string, number>> = Object.freeze(
  Object.fromEntries(atomicWeightRecords.filter(r=>r.abridged!==null).map(r=>[r.symbol,Number(r.abridged!.value)]))
);
export const atomicWeightBySymbol = new Map(atomicWeightRecords.map(r=>[r.symbol,r]));
