'use client';
import { useRef, useState } from 'react';
import { lookupMaterial, PUBCHEM_API_SOURCE, type PubChemCandidate, type LookupOutcome } from '@/lib/chemistry/material-lookup';

export default function MaterialSearch({onSelect}:{onSelect:(candidate:PubChemCandidate)=>void}){
 const [term,setTerm]=useState('');
 const [outcome,setOutcome]=useState<LookupOutcome|null>(null);
 const [busy,setBusy]=useState(false);
 const control=useRef<AbortController|null>(null);
 async function search(event:React.FormEvent<HTMLFormElement>){
   event.preventDefault();control.current?.abort();
   const controller=new AbortController(); control.current=controller;
   setBusy(true);setOutcome(null);
   try {
     const timer=setTimeout(()=>controller.abort(),12000);
     try {const response=await lookupMaterial(term,fetch,controller.signal);if(!controller.signal.aborted)setOutcome(response);}
     finally {clearTimeout(timer);}
   } catch {if(!controller.signal.aborted)setOutcome({status:'unavailable',query:term,message:'The name lookup timed out. Please try again or enter a chemical formula manually.'});}
   finally {if(control.current===controller)setBusy(false);}
 }
 return <section className="material-lookup" aria-label="Search materials and compounds">
   <p className="eyebrow">LOOK UP A MATERIAL</p>
   <h2>Search by everyday or chemical name</h2>
   <p>Try “sugar”, “sucrose”, or another chemical name. PubChem supplies compound identities; this calculator independently computes atom counts and molar mass using CIAAW atomic weights.</p>
   <form onSubmit={search}>
     <label htmlFor="material-query">Material or compound name</label>
     <div className="field"><input id="material-query" value={term} onChange={e=>{setTerm(e.target.value);setOutcome(null);control.current?.abort();setBusy(false);}} maxLength={80} placeholder="e.g. sugar" autoComplete="off"/><button disabled={busy||term.trim().length<2}>{busy?'Searching…':'Search material'}</button></div>
   </form>
   {outcome&&<div aria-live="polite" className="material-results">
      {outcome.status!=='found'?<p role="status">{outcome.message}</p>:<>
        <p className="material-notice">{outcome.note}</p>
        <h3>Possible matching substances ({outcome.candidates.length})</h3>
        <div className="material-candidates">
        {outcome.candidates.map(candidate=><article key={candidate.cid} className="material-candidate">
          <h4>{candidate.name}</h4>
          <p><strong>Molecular formula:</strong> {candidate.formula}</p>
          {candidate.supported && candidate.counts && candidate.massPercent ?
            <><p><strong>Computed molar mass:</strong> {candidate.molarMass?.toFixed(4)} g/mol</p>
              <table className="composition-table"><caption>Elemental composition (computed for this formula)</caption>
                <thead><tr><th>Element</th><th>Atoms</th><th>Mass %</th></tr></thead>
                <tbody>{Object.entries(candidate.counts).map(([symbol,count])=><tr key={symbol}><td>{symbol}</td><td>{count}</td><td>{candidate.massPercent![symbol].toFixed(2)}%</td></tr>)}</tbody>
              </table>
              <button type="button" onClick={()=>onSelect(candidate)}>Use this substance in calculator</button>
            </> : <p className="hint">Formula cannot be calculated yet: {candidate.limitation}</p>}
          <p className="hint"><a href={candidate.sourceUrl} target="_blank" rel="noreferrer">PubChem CID {candidate.cid} — source record</a>. PubChem identifies the candidate, not the user's actual sample.</p>
        </article>)}
        </div>
      </>}
   </div>}
   <p className="hint">Source: <a href={PUBCHEM_API_SOURCE} target="_blank" rel="noreferrer">NIH PubChem PUG REST</a>. A broad term may describe many substances or mixtures; no single molecular formula is assumed without selecting a record. Requires access to PubChem.</p>
 </section>;
}
