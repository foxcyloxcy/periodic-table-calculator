'use client';
import {useState} from 'react';
import {lookupCompoundProperties,type ProfileProperty,type GradeProfile} from '@/lib/chemistry/material-profiles';
import {gradeReferenceProperties,convertPropertyUnit,type BoundedProperty} from '@/lib/chemistry/grade-properties';

export function PropertiesList({properties}:{properties:readonly ProfileProperty[]}){
 if(!properties.length)return <p className="hint">No supported property records with usable values and units were returned.</p>;
 return <section className="material-properties" aria-label="Reference properties">
   <h5>Source-linked properties</h5>
   {properties.map((p,i)=><div key={p.id+':'+i} className="profile-property">
      <strong>{p.label}: {p.value}{p.upper!==undefined?'–'+p.upper:''} {p.unit}</strong>
      <p className="hint">{p.method==='computed_descriptor'?'Computed descriptor — not measured':'Reported quantity — source statement'}. {p.context}</p>
      <p className="hint"><a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceName}</a></p>
   </div>)}
 </section>;
}
export function CompoundProperties({cid}:{cid:number}){
 const [properties,setProperties]=useState<ProfileProperty[]|null>(null);
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 async function load(){
  setBusy(true);setMessage('');
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{const values=await lookupCompoundProperties(cid,fetch,controller.signal);setProperties(values);}
  catch(err){setMessage(controller.signal.aborted?'Request timed out.':err instanceof Error?err.message:'Unable to retrieve compound properties.');}
  finally{clearTimeout(timeout);setBusy(false);}
 }
 return <div className="compound-property-details">
   {properties===null&&<button type="button" disabled={busy} onClick={load}>{busy?'Loading…':'Load compound properties'}</button>}
   {message&&<p role="status" className="hint">{message}</p>}
   {properties!==null&&<PropertiesList properties={properties}/>}
 </div>;
}
export function GradeProfileCard({grade}:{grade:GradeProfile}){
 const [category,setCategory]=useState('all');
 const [metric,setMetric]=useState(true);
 const properties=gradeReferenceProperties(grade).filter(x=>category==='all'||x.category===category);
 const visible=properties.map(p=>metric?p:p.unit==='kg/m³'?convertPropertyUnit(p,'g/cm³'):p);
 return <article className="unified-record grade-record">
  <p className="eyebrow">SPECIFIC ALLOY GRADE · SOURCED COMPOSITION</p>
  <h3>{grade.label} ({grade.grade})</h3>
  <p>{grade.sourceScope}</p>
  <p className="hint">{grade.conditions}</p>
  <table className="composition-table"><caption>Published elemental composition limits, mass percent (not a measured sample)</caption>
   <thead><tr><th>Element</th><th>Published range / limit</th></tr></thead>
   <tbody>{grade.composition.map(bound=><tr key={bound.symbol}><td>{bound.symbol}</td><td>
      {bound.qualifier==='range'?bound.min+'–'+bound.max:bound.qualifier==='maximum'?'≤ '+bound.max:'≥ '+bound.min} {bound.unit}
   </td></tr>)}</tbody>
  </table>
  <p className="hint">{grade.exclusions}</p>
  <section aria-label="Grade reference properties" className="grade-reference-properties">
   <h4>Published reference properties (not batch measurements)</h4>
   <label>Property category <select aria-label="Property category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All properties</option><option value="density">Density</option><option value="mechanical">Mechanical</option><option value="thermal">Thermal</option><option value="melting">Melting</option></select></label>
   <label className="metric-toggle"><input type="checkbox" checked={metric} onChange={e=>setMetric(e.target.checked)}/> Density in kg/m³ (unchecked: g/cm³)</label>
   {visible.length?visible.map((p:BoundedProperty)=><div className="profile-property" key={p.id}>
    <strong>{p.label}: {p.limit==='minimum'?'≥ ':p.limit==='maximum'?'≤ ':''}{p.value} {p.unit}</strong>
    <p className="hint">{p.referenceCondition}. {p.limit} published grade reference; not a measured specimen.</p>
    <p className="hint"><a href={p.sourceUrl} target="_blank" rel="noreferrer">Source: {p.sourceName}</a></p>
   </div>):<p className="hint">No reviewed properties of this category are available for this exact grade. No values are estimated.</p>}
  </section>
  <p className="hint"><a href={grade.sourceUrl} target="_blank" rel="noreferrer">Primary supplier reference: {grade.sourceName}</a></p>
 </article>;
}
