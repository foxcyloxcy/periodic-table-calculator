'use client';
import { useState } from 'react';
import PeriodicTable from '@/components/PeriodicTable';
import { calculateMolarMass, FormulaError, type MolarMassResult } from '@/lib/chemistry/calculator';
export default function Home() {
 const [formula,setFormula]=useState('H2O');
 const [result,setResult]=useState<MolarMassResult|null>(null);
 const [error,setError]=useState('');
 const [pending,setPending]=useState(false);
 function calculate(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault(); setPending(true); setError(''); setResult(null);
  try { setResult(calculateMolarMass(formula)); }
  catch (err) { setError(err instanceof FormulaError ? err.message : 'Calculation failed.'); }
  finally { setPending(false); }
 }
 function appendSymbol(symbol: string) { setFormula(previous => previous + symbol); setResult(null); setError(''); document.getElementById('formula')?.focus(); }
 return <main className="container">
  <header><p className="eyebrow">DETERMINISTIC CHEMISTRY ENGINE · MVP</p><h1>Element Calculator</h1><p>Explore all 118 elements, select one to inspect its properties, or enter a supported chemical formula to calculate molar mass. Selecting elements alone does not predict a reaction.</p></header>
  <PeriodicTable onAppendSymbol={appendSymbol} />
  <form onSubmit={calculate}><label htmlFor="formula">Chemical formula</label><div className="field"><input id="formula" value={formula} onChange={e=>setFormula(e.target.value)} maxLength={128} spellCheck={false} placeholder="e.g. Ca(OH)2" required/><button disabled={pending}>{pending?'Calculating…':'Calculate'}</button></div></form>
  <p className="hint">Try H2O, CO2, ZrO2 or UO2. Molar mass calculations use the official CIAAW 2024 abridged atomic weights for 84 eligible elements. Hydrates, isotopes, ions and reaction prediction are not yet supported.</p>
  {error&&<p role="alert" className="error">{error}</p>}
  {result&&<section aria-live="polite" className="result"><p className="eyebrow">COMPUTED RESULT</p><h2>{result.value.toFixed(4)} <small>{result.unit}</small></h2><p><strong>Formula:</strong> {result.formula}</p><p><strong>Method:</strong> {result.equation} = {result.value.toFixed(4)} g/mol</p><h3>Contributions</h3><ul>{result.steps.map(t=><li key={t.element}>{t.element}: {t.count} × {t.atomicWeight} = {t.contribution.toFixed(4)} g/mol</li>)}</ul><h3>Why?</h3><p>The molar mass is the sum of each element’s reference atomic weight multiplied by its atom count in the parsed formula.</p><p className="hint">Reference dataset: {result.datasetVersion}. {result.dataSource}. Values use CIAAW 2024 abridged standard atomic weights; isotope variability and uncertainty are not propagated into the displayed single-number total.</p></section>}
 </main>;
}
