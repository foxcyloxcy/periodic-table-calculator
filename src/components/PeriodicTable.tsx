'use client';

import { useMemo, useState } from 'react';
import { atomicWeightBySymbol } from '@/lib/chemistry/elements';
import SystematicElementReview from '@/components/SystematicElementReview';
import {auditElement,auditOverview,type PropertyEvidence} from '@/lib/chemistry/element-audit';
import {independentReview,reviewProgress} from '@/lib/chemistry/independent-property-review';
import { elementCategories, periodicElements, searchElements, type PeriodicElement, PERIODIC_TABLE_SOURCE, STANDARD_WEIGHT_REFERENCE } from '@/lib/chemistry/periodic-table';

const categoryClass = (category: string) => {
  if(category.includes('alkali metal') && !category.includes('earth')) return 'alkali';
  if(category.includes('alkaline earth')) return 'alkaline';
  if(category.includes('noble gas')) return 'noble';
  if(category.includes('halogen')) return 'halogen';
  if(category.includes('lanthanide')) return 'lanthanide';
  if(category.includes('actinide')) return 'actinide';
  if(category.includes('transition metal')) return 'transition';
  if(category.includes('metalloid')) return 'metalloid';
  if(category.includes('nonmetal')) return 'nonmetal';
  return 'other';
};

export default function PeriodicTable({ onAppendSymbol }: {onAppendSymbol: (symbol: string) => void}) {
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');
  const [selected,setSelected]=useState<PeriodicElement>(periodicElements[0]);
  const evidence=useMemo(()=>auditElement(selected),[selected]);
  const overview=useMemo(()=>auditOverview(),[]);
  const review=useMemo(()=>independentReview(selected.symbol),[selected]);
  const progress=useMemo(()=>reviewProgress(),[]);
  const matches=useMemo(()=>new Set(searchElements(query,category).map(e=>e.atomicNumber)),[query,category]);
  return <section className="periodic-section" aria-label="Interactive periodic table">
    <div className="section-heading"><div><p className="eyebrow">ALL 118 RECOGNIZED ELEMENTS</p><h2>Explore the periodic table</h2><p>Select any element to inspect its properties. Selecting does not predict chemical reactions.</p></div></div>
    <div className="table-controls">
      <label className="control"><span>Find an element</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, symbol or number..." aria-label="Search elements" /></label>
      <label className="control"><span>Element family</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All families</option>{elementCategories.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
    </div>
    <p className="hint">{matches.size} of 118 elements match. Scroll horizontally on small screens.</p>
    <div className="periodic-scroll" tabIndex={0} role="region" aria-label="Scrollable periodic table">
      <div className="periodic-grid">
        {periodicElements.map(e=><button key={e.atomicNumber} className={`element-tile ${categoryClass(e.category)} ${matches.has(e.atomicNumber)?'':'dimmed'} ${selected.atomicNumber===e.atomicNumber?'selected':''}`} type="button" style={{gridColumn:e.x,gridRow:e.y}} onClick={()=>setSelected(e)} aria-label={`${e.name}, atomic number ${e.atomicNumber}`} aria-pressed={selected.atomicNumber===e.atomicNumber}>
          <span className="tile-number">{e.atomicNumber}</span><strong className="tile-symbol">{e.symbol}</strong><span className="tile-name">{e.name}</span>
        </button>)}
        <div className="series-label" style={{gridColumn:'3 / span 15',gridRow:8}}>Lanthanides and actinides shown below</div>
      </div>
    </div>
    <article className="element-detail" aria-live="polite">
      <div className={`selected-element ${categoryClass(selected.category)}`}><span>{selected.atomicNumber}</span><strong>{selected.symbol}</strong><span>{selected.name}</span></div>
      <div className="element-info">
        <h3>{selected.name} <small>({selected.symbol})</small></h3>
        <p>{selected.category} · Period {selected.period} · {selected.group===null?'f-block / unassigned group':`Group ${selected.group}`}</p>
        <dl>
          <div><dt>Atomic number</dt><dd>{selected.atomicNumber}</dd></div>
          <div><dt>Electron configuration</dt><dd>{selected.electronConfiguration ?? 'Not available'}</dd></div>
          <div><dt>Electronegativity (Pauling)</dt><dd>{selected.electronegativity ?? 'Not available'}</dd></div>
          <div><dt>Phase (source label)</dt><dd>{selected.phase ?? 'Unknown'}</dd></div>
          <div><dt>Atomic weight</dt><dd>{atomicWeightBySymbol.get(selected.symbol)?.abridged ? `${atomicWeightBySymbol.get(selected.symbol)!.abridged!.value} ± ${atomicWeightBySymbol.get(selected.symbol)!.abridged!.uncertainty} (CIAAW 2024 abridged)` : 'No standard atomic weight (CIAAW 2024)'}</dd></div>
        </dl>
        <p className="hint">Atomic weights are sourced from CIAAW 2024 and display the abridged central value and reported uncertainty. Other element properties remain secondary educational metadata pending field-by-field review. Isotope mass numbers are not substituted for missing standard atomic weights.</p>
        <SystematicElementReview symbol={selected.symbol}/>
        <section className="element-evidence" aria-label="Scientific property evidence">
          <h4>Scientific evidence and data quality</h4>
          <p className="hint">Last official-source review: {overview.checkedDate}. Scientific identity is recognized; individual display properties retain separate verification status.</p>
          <dl>
            {[evidence.identity,...evidence.properties].map((property:PropertyEvidence)=><div key={property.field} className="audit-property">
              <dt>{property.label}</dt>
              <dd><strong>{property.level.replaceAll('_',' ')}</strong> · {property.reviewStatus.replaceAll('_',' ')}</dd>
              <dd>{property.caveat}</dd>
              <dd className="hint">Reference: <a href={property.sourceUrl} target="_blank" rel="noreferrer">{property.sourceName}</a> · {property.sourceEdition}</dd>
            </div>)}
          </dl>
          <section className="element-crosscheck" aria-label="Independent property comparison">
            <h5>Independent published-source comparison</h5>
            <p className="hint">{progress.reviewedElements} of {progress.totalElements} elements sampled for secondary-property comparison; {progress.conflicts} documented discrepancies. This is NOT complete primary experimental certification.</p>
            {review ? <div className="review-list">{review.comparisons.map(item=><div className="review-row" key={item.field}>
              <strong>{item.field.replaceAll(/([A-Z])/g,' $1')}: {item.status.replaceAll('_',' ')}</strong>
              <p>Our display: {item.displayValue??'Not available'} · Published reference: {item.referenceValue??'Not available'}</p>
              <p className="hint">{item.referenceCondition}. {item.note}</p>
              <p className="hint"><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.source}</a> · checked {item.sourceRetrievedOn}</p>
            </div>)}</div>
            : <p className="hint">Not yet independently cross-checked. Existing secondary-source display values must not be treated as field-verified.</p>}
            <p className="hint">For independently evaluated atomic ground-state/spectroscopic reference data, see <a href="https://www.nist.gov/pml/atomic-spectra-database" target="_blank" rel="noreferrer">NIST Atomic Spectra Database (ASD 5.12)</a>. Source-to-source comparisons do not replace primary measurement verification.</p>
          </section>
          <p className="hint">Audit status: {overview.recognizedElements} recognized elements; {overview.authoritativeWeightEntries} CIAAW standard-weight entries; {overview.missingStandardWeights} unavailable; {overview.phasePredictionsFlagged} superheavy phase labels flagged for caution. All secondary properties remain subject to independent primary-source review.</p>
        </section>
        <button type="button" onClick={()=>onAppendSymbol(selected.symbol)}>Add {selected.symbol} to formula input</button>
      </div>
    </article>
    <p className="hint">Sources: <a href={PERIODIC_TABLE_SOURCE} target="_blank" rel="noreferrer">element metadata snapshot</a> · <a href={STANDARD_WEIGHT_REFERENCE} target="_blank" rel="noreferrer">CIAAW standard atomic weights</a>. The calculator uses its separately identified educational mass dataset; an unsupported element may not be calculable yet.</p>
  </section>;
}
