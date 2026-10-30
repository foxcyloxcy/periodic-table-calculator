/**
 * Chemical identity is NOT implied by elemental composition.
 *
 * This module supplies *verified naming annotations* for explicitly reviewed
 * neutral formula spellings. It does not generate names from atom counts,
 * infer oxidation states, or decide which of many isomers is present.
 *
 * All scientific calculations remain pure and independent of this catalog.
 * Future operations (balancing, stoichiometry, etc.) can reuse resolveCompoundName
 * for each explicitly identified substance.
 */
export type CompoundNameResult =
  | {
      status: 'verified';
      preferredName: string;
      commonNames: readonly string[];
      source: 'PubChem';
      sourceId: string;
      sourceUrl: string;
      note: string;
    }
  | {
      status: 'unresolved';
      note: string;
    };

interface CompoundNameRecord {
  preferredName: string;
  commonNames: readonly string[];
  pubchemCid: number;
  note?: string;
}

/** Curated, reviewed examples; never use formula-composition matching to infer structure. */
const NAMES: Readonly<Record<string, CompoundNameRecord>> = Object.freeze({
  FeSO4: {
    preferredName: 'Iron(II) sulfate',
    commonNames: ['Ferrous sulfate', 'Ferrous sulphate'],
    pubchemCid: 24393,
    note: 'Refers to the anhydrous formula; hydrated ferrous sulfate has a different formula and molar mass.',
  },
  'Fe2(SO4)3': {
    preferredName: 'Iron(III) sulfate',
    commonNames: ['Ferric sulfate'],
    pubchemCid: 24826,
  },
  H2O: {
    preferredName: 'Water',
    commonNames: [],
    pubchemCid: 962,
  },
  CaCO3: {
    preferredName: 'Calcium carbonate',
    commonNames: [],
    pubchemCid: 10112,
  },
  Na2CO3: {
    preferredName: 'Sodium carbonate',
    commonNames: ['Soda ash'],
    pubchemCid: 10340,
  },
});

/**
 * User-friendly correction only for exact verified catalog entries.
 * Never broadly case-fold chemical formulas: "CO" and "Co" are different.
 * Reject any case-insensitive key that would correspond to multiple records.
 */
export function normalizeKnownCompoundFormula(input: string): string {
  const trimmed = input.trim();
  if (Object.hasOwn(NAMES, trimmed)) return trimmed;
  const matches = Object.keys(NAMES).filter(key => key.toLowerCase() === trimmed.toLowerCase());
  return matches.length === 1 ? matches[0] : trimmed;
}

const UNKNOWN_NOTE = 'No verified compound name is available for this exact formula. A molecular formula can represent more than one substance or structural isomer. Calculation of molar mass does not establish chemical identity.';

export function resolveCompoundName(formula: string): CompoundNameResult {
  const record = Object.hasOwn(NAMES, formula.trim()) ? NAMES[formula.trim()] : undefined;
  if (!record) return { status: 'unresolved', note: UNKNOWN_NOTE };
  return {
    status: 'verified',
    preferredName: record.preferredName,
    commonNames: record.commonNames,
    source: 'PubChem',
    sourceId: `CID ${record.pubchemCid}`,
    sourceUrl: `https://pubchem.ncbi.nlm.nih.gov/compound/${record.pubchemCid}`,
    note: record.note ?? 'The displayed name is a documented compound associated with this formula; it does not establish sample identity or purity.',
  };
}
