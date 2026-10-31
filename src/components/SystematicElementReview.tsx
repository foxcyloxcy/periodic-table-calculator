import {scientificCrossCheck,scientificReviewSummary,type ScientificComparison} from '@/lib/chemistry/systematic-element-crosscheck';

function ComparisonRow({record}:{record:ScientificComparison}){
 return <div className="systematic-review-row">
  <div className="review-row-heading"><strong>{record.field.replaceAll(/([A-Z])/g,' $1')}</strong>
  <span className="review-tag">{record.status.replaceAll('_',' ')}</span></div>
  <p>Current display: <strong>{record.displayed??'Not available'}</strong> · Reference: <strong>{record.reference??'Not available'}</strong></p>
  <p className="hint">{record.referenceCondition}</p>
  <p className="hint">{record.notes}</p>
  {record.sourceUrl?<p className="hint"><a href={record.sourceUrl} target="_blank" rel="noreferrer">Source: {record.sourceName}</a></p>:<p className="hint">Source comparison pending.</p>}
 </div>;
}
export default function SystematicElementReview({symbol}:{symbol:string}){
 const item=scientificCrossCheck(symbol);
 const stats=scientificReviewSummary();
 if(!item)return null;
 return <section className="systematic-review" aria-label="Systematic NIST and RSC scientific comparisons">
  <h4>Systematic neutral-atom and reference-condition review</h4>
  <p className="hint">NIST neutral configurations: {stats.nistAgreement} of {stats.nistNeutralCovered} match; {stats.remainingNistReview} elements are outside this source table. RSC phase comparisons: {stats.rscPhaseCovered} of 118; Pauling values recorded for {stats.rscPaulingCovered} sampled entries, including unavailable values.</p>
  <ComparisonRow record={item.electronConfiguration}/>
  <ComparisonRow record={item.phase}/>
  <ComparisonRow record={item.electronegativity}/>
  <p className="hint">Source agreement is not equivalent to experimentally confirming every state or property. Existing element fields and calculator weights are unchanged.</p>
 </section>;
}
