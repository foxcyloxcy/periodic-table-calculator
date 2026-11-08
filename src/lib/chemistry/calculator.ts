import { atomicWeights, atomicWeightBySymbol, DATASET_SOURCE, DATASET_VERSION } from './elements';
import { normalizeKnownCompoundFormula, resolveCompoundName, type CompoundNameResult } from './compound-names';
import {normalizeFormulaNotation,unsupportedFormulaNotation} from './formula-notation';

export class FormulaError extends Error {
  constructor(message: string, public readonly code:'invalid_formula'|'unsupported_notation'|'no_standard_atomic_weight'='invalid_formula') { super(message); this.name = 'FormulaError'; }
}
export interface Composition { readonly [symbol: string]: number }
export interface MassTerm { element: string; count: number; atomicWeight: number; contribution: number }
export interface MolarMassResult {
  status: 'computed';
  formula: string;
  inputFormula: string;
  composition: Composition;
  value: number;
  unit: 'g/mol';
  compoundName: CompoundNameResult;
  steps: MassTerm[];
  equation: string;
  datasetVersion: string;
  dataSource: string;
  assumptions: string[];
}
const MAX_LENGTH = 128;
const MAX_DEPTH = 12;
const MAX_ATOMS = 1_000_000;
const MAX_MULTIPLIER = 100_000;
export function parseFormula(formula: string): Composition {
  formula=normalizeFormulaNotation(formula);
  if (!formula || formula.length > MAX_LENGTH) throw new FormulaError('Formula must contain 1–128 characters.');
  const unsupported=unsupportedFormulaNotation(formula);
  if(unsupported)throw new FormulaError(unsupported,'unsupported_notation');
  let pos = 0;
  function count(): number {
    const start = pos;
    while (pos < formula.length && /[0-9]/.test(formula[pos])) pos++;
    if (pos === start) return 1;
    const n = Number(formula.slice(start, pos));
    if (!Number.isSafeInteger(n) || n < 1 || n > MAX_MULTIPLIER) throw new FormulaError('Invalid atom multiplier.');
    return n;
  }
  function group(depth: number): Record<string, number> {
    if (depth > MAX_DEPTH) throw new FormulaError('Formula nesting limit exceeded.');
    const result: Record<string, number> = Object.create(null);
    let found = false;
    while (pos < formula.length && formula[pos] !== ')') {
      if (formula[pos] === '(') {
        pos++;
        const inner = group(depth + 1);
        if (formula[pos] !== ')') throw new FormulaError('Unclosed parenthesis.');
        pos++;
        const multiplier = count();
        for (const [key, value] of Object.entries(inner)) {
          const next = (result[key] ?? 0) + value * multiplier;
          if (!Number.isSafeInteger(next) || next > MAX_ATOMS) throw new FormulaError('Atom count exceeds limit.');
          result[key] = next;
        }
      } else {
        const match = /^[A-Z][a-z]?/.exec(formula.slice(pos));
        if (!match) throw new FormulaError('Invalid character or unsupported formula syntax at position ' + (pos + 1) + '.');
        const symbol = match[0];
        if (!Object.hasOwn(atomicWeights, symbol)) {
          if(atomicWeightBySymbol.has(symbol))throw new FormulaError('No standard atomic weight is available for '+symbol+' in the CIAAW dataset. Isotope-specific mass calculations are not supported yet.','no_standard_atomic_weight');
          throw new FormulaError('Unknown element symbol '+symbol+'. Check its spelling and capitalization.');
        }
        pos += symbol.length;
        const multiplier = count();
        const next = (result[symbol] ?? 0) + multiplier;
        if (next > MAX_ATOMS) throw new FormulaError('Atom count exceeds limit.');
        result[symbol] = next;
      }
      found = true;
    }
    if (!found) throw new FormulaError('Empty formula group.');
    return result;
  }
  const composition = group(0);
  if (pos !== formula.length) throw new FormulaError('Unexpected closing parenthesis or trailing characters.');
  return Object.fromEntries(Object.entries(composition).sort(([a],[b]) => a.localeCompare(b)));
}
export function calculateMolarMass(formula: string): MolarMassResult {
  const normalized = normalizeKnownCompoundFormula(normalizeFormulaNotation(formula));
  const composition = parseFormula(normalized);
  const steps = Object.entries(composition).map(([element,count]) => ({
    element, count, atomicWeight: atomicWeights[element],
    contribution: count * atomicWeights[element],
  }));
  const value = steps.reduce((sum, term) => sum + term.contribution, 0);
  if (!Number.isFinite(value)) throw new FormulaError('Result exceeds numeric limits.');
  return {
    status:'computed', formula:normalized, inputFormula:formula.trim(), composition, value, unit:'g/mol', compoundName:resolveCompoundName(normalized), steps,
    equation:steps.map(t=>`${t.count} × ${t.atomicWeight}`).join(' + '),
    datasetVersion:DATASET_VERSION, dataSource:DATASET_SOURCE,
    assumptions:['CIAAW 2024 abridged standard atomic weights for normal materials; a single rounded value is used and uncertainty is not propagated', 'Formula represents a neutral, non-isotopically-labeled composition', 'Result is a molar mass, not a predicted chemical reaction'],
  };
}
