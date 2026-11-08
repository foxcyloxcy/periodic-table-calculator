import type {Composition} from './calculator';

/** Serialize validated atom counts in Hill order, preserving absolute counts. */
export function formulaFromComposition(composition:Composition):string {
 const symbols=Object.keys(composition).sort();
 const ordered=Object.hasOwn(composition,'C')
  ? ['C',...(Object.hasOwn(composition,'H')?['H']:[]),...symbols.filter(s=>s!=='C'&&s!=='H')]
  : symbols;
 return ordered.map(symbol=>symbol+(composition[symbol]===1?'':composition[symbol])).join('');
}
