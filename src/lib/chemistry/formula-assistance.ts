import { atomicWeightBySymbol, atomicWeights } from './elements';
import { parseFormula } from './calculator';
import { reviewedCompoundFormulas, resolveCompoundName, normalizeKnownCompoundFormula } from './compound-names';

export interface FormulaSuggestion {
  formula: string;
  label: string;
  reason: 'repeated_symbol' | 'case_normalization' | 'closest_reviewed' | 'possible_element_symbol';
  note: string;
  changesComposition: boolean;
}

/** Strict, bounded edit distance; only ranks existing reviewed formulas, never invents a new identity. */
function editDistance(a: string, b: string): number {
  const previous = Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    const next=[i];
    for(let j=1;j<=b.length;j++){
      next[j]=Math.min(previous[j]+1,next[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    }
    for(let j=0;j<next.length;j++) previous[j]=next[j];
  }
  return previous[b.length];
}

/**
 * Consecutive repeated symbols such as FeSOOOO -> FeSO4.
 * Only group recognized capitalized element tokens, never across parentheses,
 * charges, existing multipliers, or non-element characters.
 * This preserves atom counts but NOT necessarily chemical identity.
 */
export function compactRepeatedSymbols(input: string): string | null {
  const text = input.trim();
  if(!text || text.length>128 || !/^(?:[A-Z][a-z]?)+$/.test(text)) return null;
  const tokens = text.match(/[A-Z][a-z]?/g) ?? [];
  if(tokens.length>64 || tokens.some(token=>!atomicWeightBySymbol.has(token))) return null;
  const grouped:{symbol:string;count:number}[]=[];
  for(const symbol of tokens){
    const last=grouped[grouped.length-1];
    if(last?.symbol===symbol) last.count++;
    else grouped.push({symbol,count:1});
  }
  if(grouped.every(group=>group.count===1))return null;
  return grouped.map(group=>group.symbol+(group.count>1?group.count:'')).join('');
}

/** Dedicated user-input editor: only extend an existing terminal atom count, never infer a reaction. */
export function appendElementToFormula(value:string,symbol:string):string {
  if(!atomicWeightBySymbol.has(symbol)) return value;
  const text=value.trim();
  // Recover an old sequence of repeated clicks before handling a single token.
  const pattern=new RegExp('(?:'+symbol+'){2,}$');
  const run=pattern.exec(text);
  if(run && /^(?:[A-Z][a-z]?)+$/.test(text)) {
    return text.slice(0,run.index)+symbol+(run[0].length/symbol.length+1);
  }
  const terminal = /([A-Z][a-z]?)([0-9]*)$/.exec(text);
  if(terminal?.[1]===symbol) {
    const n=terminal[2]?Number(terminal[2]):1;
    if(Number.isSafeInteger(n)&&n>=1&&n<100000) return text.slice(0,-terminal[0].length)+symbol+(n+1);
  }
  return text+symbol;
}

/** Suggestions are explicit options; never silently replace a formula or calculate alternatives. */
export function suggestFormulaAlternatives(raw:string,limit=5):FormulaSuggestion[]{
  const input=raw.trim();
  if(!input || input.length>128)return [];
  const out:FormulaSuggestion[]=[];
  const seen=new Set<string>([input]);
  const add=(formula:string,reason:FormulaSuggestion['reason'],note:string,changesComposition:boolean)=>{
    if(seen.has(formula)||out.length>=limit) return;
    seen.add(formula);
    const identity=resolveCompoundName(formula);
    out.push({formula,label:identity.status==='verified'?identity.preferredName:'Formula (name not verified)',reason,note,changesComposition});
  };
  const normalized=normalizeKnownCompoundFormula(input);
  if(normalized!==input) add(normalized,'case_normalization','Matches the capitalization of a reviewed formula. Please confirm.',false);
  const compact=compactRepeatedSymbols(input);
  if(compact && compact!==input) add(compact,'repeated_symbol','Consecutive repeated element symbols can be written as atom counts. Please confirm the intended formula.',false);
  // Only show similar *reviewed* compounds if the edit is small; these
  // can be DIFFERENT CHEMICAL SUBSTANCES, not automatic corrections.
  const ranked=reviewedCompoundFormulas
    .map(formula=>({formula,distance:editDistance(input.toLowerCase(),formula.toLowerCase())}))
    .filter(item=>item.distance>0 && item.distance <= (input.length<=4?1:2))
    .sort((a,b)=>a.distance-b.distance || a.formula.localeCompare(b.formula));
  for(const {formula} of ranked) add(formula,'closest_reviewed','Similar to a documented compound, but changing the formula may change its composition and identity. Confirm before calculating.',true);
  // Suggest one-token spelling alternatives only when an unrecognized
  // element token is present. Validate the *entire* proposed formula before
  // showing it. A near symbol is not evidence that the user intended it.
  const tokens=[...input.matchAll(/[A-Z][a-z]?/g)];
  if(tokens.length>0 && tokens.length<=16){
    const unknown=tokens.filter(match=>!atomicWeightBySymbol.has(match[0]));
    if(unknown.length===1){
      const token=unknown[0];
      const before=input.slice(0,token.index);
      const after=input.slice(token.index!+token[0].length);
      const possibilities=Object.keys(atomicWeights)
        .map(symbol=>({symbol,distance:editDistance(symbol.toLowerCase(),token[0].toLowerCase())}))
        .filter(entry=>entry.distance===1)
        .sort((a,b)=>a.symbol.localeCompare(b.symbol));
      for(const {symbol} of possibilities){
        const candidate=before+symbol+after;
        // Preserve only valid formula grammar; unsupported charge/isotope
        // syntax and other errors should not become plausible suggestions.
        try { parseFormula(candidate); } catch { continue; }
        add(candidate,'possible_element_symbol',
          'Possible element-symbol spelling. This may be a different composition; verify the formula before calculating.',true);
        if(out.length>=limit)break;
      }
    }
  }
  return out.slice(0,limit);
}
