'use client';
import {useEffect,useState} from 'react';
import {lookupFormulaIdentities,type LookupOutcome} from '@/lib/chemistry/material-lookup';

export default function FormulaIdentities({formula}:{formula:string}){
 const [outcome,setOutcome]=useState<LookupOutcome|null>(null);
 const [selected,setSelected]=useState<number|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  setOutcome(null);setSelected(null);
  const timeout=setTimeout(()=>controller.abort(),12000);
  lookupFormulaIdentities(formula,fetch,controller.signal)
    .then(x=>{if(!controller.signal.aborted)setOutcome(x);})
    .catch(()=>{if(!controller.signal.aborted)setOutcome({status:'unavailable',query:formula,message:'Compound identity search is unavailable.'});})
    .finally(()=>clearTimeout(timeout));
  return ()=>{clearTimeout(timeout);controller.abort();};
 },[formula]);
 return <section className="formula-identities" aria-live="polite">
  <p className="eyebrow">POSSIBLE COMPOUND IDENTITIES</p>
  {!outcome?<p className="hint">Looking up names from PubChem (requires internet)…</p>:
   outcome.status!=='found'?<p className="hint">{outcome.message}</p>:
   <><p className="hint">{outcome.note}</p><ul>
     {outcome.candidates.map(item=><li key={item.cid}>
       <div><strong>{item.name}</strong> · {item.formula}
       <p className="hint"><a href={item.sourceUrl} target="_blank" rel="noreferrer">PubChem CID {item.cid}</a></p></div>
       <button type="button" aria-pressed={selected===item.cid} onClick={()=>setSelected(item.cid)}>{selected===item.cid?'Selected':'Select identity'}</button>
     </li>)}
   </ul>{selected!==null&&<p className="hint">Selected identity is a user interpretation only. All isomers with this formula share the same computed molar mass; actual sample identity needs evidence.</p>}</>}
 </section>;
}
