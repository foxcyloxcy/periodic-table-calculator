'use client';
import { useState } from 'react';
import type { MolarMassResult } from '@/lib/chemistry/calculator';
export default function Home() {
 const [formula,setFormula]=useState('H2O');
 const [result,setResult]=useState<MolarMassResult|null>(null);
 const [error,setError]=useState('');
 const [pending,setPending]=useState(false);
 async function calculate(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault(); setPending(true);setError('');setResult(null);
  try {
   const response=await fetch('/api/v1/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation:'molar_mass',formula})});
   const data=await response.json();
   if(!response.ok){setError(data.message ?? 'Calculation not supported');return;}
   setResult(data as MolarMassResult);
  } catch {setError('Unable to reach the calculation service.');}
  finally {setPending(false);}
 }
 return <main className="container">
  <header><p className="eyebrow">DETERMINISTIC CHEMISTRY ENGINE · MVP</p><h1>Element Calculator</h1><p>Enter a chemical formula to calculate molar mass using reference atomic weights. Results are computed, not looked up.</p></header>
  <form onSubmit={calculate}><label htmlFor="formula">Chemical formula</label><div className="field"><input id="formula" value={formula} onChange={e=>setFormula(e.target.value)} maxLength={128} spellCheck={false} placeholder="e.g. Ca(OH)2" required/><button disabled={pending}>{pending?'Calculating…':'Calculate'}</button></div></form>
  <p className="hint">Try H2O, CO2, Ca(OH)2 or Al2(SO4)3. Hydrates, isotopes, ions and reaction prediction are not yet supported.</p>
  {error&&<p role="alert" className="error">{error}</p>}
  {result&&<section aria-live="polite" className="result"><p className="eyebrow">COMPUTED RESULT</p><h2>{result.value.toFixed(4)} <small>{result.unit}</small></h2><p><strong>Formula:</strong> {result.formula}</p><p><strong>Method:</strong> {result.equation} = {result.value.toFixed(4)} g/mol</p><h3>Contributions</h3><ul>{result.steps.map(t=><li key={t.element}>{t.element}: {t.count} × {t.atomicWeight} = {t.contribution.toFixed(4)} g/mol</li>)}</ul><h3>Why?</h3><p>The molar mass is the sum of each element’s reference atomic weight multiplied by its atom count in the parsed formula.</p><p className="hint">Reference dataset: {result.datasetVersion}. {result.dataSource}. Values are rounded educational references, pending authoritative provenance review.</p></section>}
 </main>;
}
