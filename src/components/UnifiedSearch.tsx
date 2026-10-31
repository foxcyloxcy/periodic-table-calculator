'use client';
import {useRef,useState} from 'react';
import {unifiedSearch,type UnifiedSearchResult,type MaterialKind} from '@/lib/chemistry/unified-search';
import type {PubChemCandidate} from '@/lib/chemistry/material-lookup';
import {atomicWeightBySymbol} from '@/lib/chemistry/elements';
import {PropertiesList,CompoundProperties,GradeProfileCard} from '@/components/MaterialProfiles';
const kindLabel:Record<MaterialKind,string>={
 element:'Element',compound:'Pure compound candidate',alloy:'Alloy',mixture:'Mixture',
 material_class:'Material / broad class',unclassified:'Classification not verified',
};
export default function UnifiedSearch({onSelect}:{onSelect:(c:PubChemCandidate)=>void}){
 const [term,setTerm]=useState('');
 const [outcome,setOutcome]=useState<UnifiedSearchResult|null>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const controller=useRef<AbortController|null>(null);
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();controller.current?.abort();
  const next=new AbortController();controller.current=next;setBusy(true);setError('');setOutcome(null);
  const timeout=setTimeout(()=>next.abort(),15000);
  try{const result=await unifiedSearch(term,fetch,next.signal);if(!next.signal.aborted)setOutcome(result);}
  catch(err){setError(next.signal.aborted?'Search timed out; try again.':err instanceof Error?err.message:'Search failed.');}
  finally{clearTimeout(timeout);if(controller.current===next)setBusy(false);}
 }
 return <section className="unified-search" aria-label="Unified chemistry and materials search">
  <p className="eyebrow">CHEMICALS AND MATERIALS</p>
  <h2>Search an element, compound or material</h2>
  <p>Try water, caffeine, 304 stainless steel, gold, steel or milk. Chemical compounds are sourced from PubChem; material categories from Wikidata. We calculate numeric composition only for validated formulas.</p>
  <form onSubmit={submit}>
   <label htmlFor="unified-query">Name or material</label>
   <div className="field"><input id="unified-query" value={term} maxLength={80}
     onChange={e=>{controller.current?.abort();setBusy(false);setOutcome(null);setError('');setTerm(e.target.value);}}
     placeholder="e.g. steel, caffeine, copper…" autoComplete="off"/>
     <button disabled={busy||term.trim().length<2}>{busy?'Searching…':'Search'}</button></div>
  </form>
  {error&&<p role="alert" className="error">{error}</p>}
  {outcome&&<div className="unified-results" aria-live="polite">
    {outcome.element&&<article className="unified-record">
      <p className="eyebrow">{kindLabel.element}</p>
      <h3>{outcome.element.name} ({outcome.element.symbol})</h3>
      <p>Atomic number {outcome.element.atomicNumber}; period {outcome.element.period}; group {outcome.element.group??'not assigned'}; {outcome.element.category}.</p>
      <p><strong>CIAAW abridged atomic weight:</strong> {atomicWeightBySymbol.get(outcome.element.symbol)?.abridged?.value??'No standard atomic weight'} g/mol (molar-mass approximation when available)</p>
      <p className="hint"><a href="https://www.ciaaw.org/atomic-weights.htm" target="_blank" rel="noreferrer">CIAAW atomic weights</a>. Element occurrence in a material does not specify its concentration.</p>
    </article>}
    {outcome.compounds.length>0&&<section aria-label="Compound candidates">
      <h3>Possible chemical compounds ({outcome.compounds.length})</h3>
      <p className="hint">PubChem name matches, not proof of a sample&apos;s identity or purity. Elemental percentages below are calculated using CIAAW weights.</p>
      <div className="unified-grid">{outcome.compounds.map(c=><article key={c.cid} className="unified-record">
       <p className="eyebrow">{kindLabel.compound}</p><h4>{c.name}</h4>
       <p><strong>Molecular formula:</strong> {c.formula}</p>
       {c.supported&&c.counts&&c.massPercent?<>
        <p><strong>Computed molar mass:</strong> {c.molarMass?.toFixed(4)} g/mol</p>
        <table className="composition-table"><caption>Calculated elemental composition</caption><thead><tr><th>Element</th><th>Atoms</th><th>Mass %</th></tr></thead>
        <tbody>{Object.entries(c.counts).map(([symbol,count])=><tr key={symbol}><td>{symbol}</td><td>{count}</td><td>{c.massPercent![symbol].toFixed(2)}%</td></tr>)}</tbody></table>
        <button type="button" onClick={()=>onSelect(c)}>Use this compound</button>
        <CompoundProperties cid={c.cid}/>
       </>:<p className="hint">Composition calculation not supported: {c.limitation}</p>}
       {!c.supported&&<CompoundProperties cid={c.cid}/>}
       <p className="hint"><a href={c.sourceUrl} target="_blank" rel="noreferrer">PubChem CID {c.cid}</a></p>
      </article>)}</div>
    </section>}
    {outcome.grade&&<GradeProfileCard grade={outcome.grade}/>}
    {outcome.materials.length>0&&<section aria-label="Materials and classifications">
      <h3>Material and classification records</h3>
      <div className="unified-grid">{outcome.materials.map(material=><article key={material.id} className="unified-record">
        <p className="eyebrow">{kindLabel[material.kind]}</p><h4>{material.name}</h4>
        <p>{material.description}</p>
        <p className="hint">{material.compositionNote}</p>
        <PropertiesList properties={material.properties}/>
        <p className="hint"><strong>Classification evidence:</strong> {material.classificationBasis}</p>
        <p className="hint"><a href={material.sourceUrl} target="_blank" rel="noreferrer">Wikidata {material.sourceId}</a> (structured data, CC0)</p>
      </article>)}</div>
    </section>}
    {outcome.notices.length>0&&<div className="unified-notices">{outcome.notices.map((notice,i)=><p className="hint" key={i}>{notice}</p>)}</div>}
  </div>}
  <p className="hint">Sources: <a href="https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest" target="_blank" rel="noreferrer">NIH PubChem</a>, <a href="https://www.wikidata.org/wiki/Wikidata:Data_access" target="_blank" rel="noreferrer">Wikidata</a>, and <a href="https://www.ciaaw.org/atomic-weights.htm" target="_blank" rel="noreferrer">CIAAW</a>. Broad materials have no single universal chemical formula or elemental percentages without specifying a grade or sample.</p>
 </section>;
}
