import data from './nist-neutral-configurations.json';
import rsc from './rsc-element-property-checks.json';
import {periodicElements} from './periodic-table';

export type ScientificComparisonState='matches_reference'|'disagreement'|'not_covered'|'unavailable'|'predicted_not_measured';
export interface ScientificComparison {
 field:'electronConfiguration'|'phase'|'electronegativity';
 status:ScientificComparisonState;
 displayed:string|null;
 reference:string|null;
 sourceUrl:string|null;
 sourceName:string;
 referenceCondition:string;
 evidenceScope:string;
 notes:string;
}
export interface ElementCrossCheck {
 atomicNumber:number;
 symbol:string;
 electronConfiguration:ScientificComparison;
 phase:ScientificComparison;
 electronegativity:ScientificComparison;
}
export const NIST_NEUTRAL_REFERENCE_URL=data.sourceUrl;
const NIST_RECORDS=new Map(data.records.map(r=>[r.atomicNumber,r]));
const RSC_RECORDS=new Map(rsc.records.map(r=>[r.atomicNumber,r]));
const normalize=(v:string|null):string|null=>v===null?null:v.replace(/^\*/,'').replace(/\s+/g,'').replace(/\^/g,'').toLowerCase();
const generic=(field:ScientificComparison['field'],displayed:string|null,condition:string):ScientificComparison=>({
 field,displayed,reference:null,status:'not_covered',sourceUrl:null,sourceName:'No independently checked record in this source batch',
 referenceCondition:condition,evidenceScope:'Not reviewed in this batch',notes:'No independent comparison has been performed; do not infer missing means false or zero.'
});
export const elementScientificCrossChecks:ReadonlyArray<ElementCrossCheck>=periodicElements.map(e=>{
 const nist=NIST_RECORDS.get(e.atomicNumber);
 const nistComparison:ScientificComparison=nist?{
   field:'electronConfiguration',displayed:e.electronConfiguration,reference:nist.groundConfiguration,
   status:normalize(e.electronConfiguration)===normalize(nist.groundConfiguration)?'matches_reference':'disagreement',
   sourceName:'NIST Atomic Reference Data: Neutral Electronic Configurations',
   sourceUrl:data.sourceUrl,referenceCondition:'Isolated neutral atom, electronic ground state; not an ionic or excited-state configuration.',
   evidenceScope:'Compiled NIST H–U neutral-atom source table, not a direct per-entry NIST ASD 5.12 query.',
   notes:'Whitespace and leading annotation asterisk ignored only for string comparison. Agreement does not prove a laboratory measurement for every heavy atom.'
 }:generic('electronConfiguration',e.electronConfiguration,'Neutral atom configuration not independently compared against this NIST table.');
 const r=RSC_RECORDS.get(e.atomicNumber);
 const base='RSC per-element published facts; source-specific cross-check, not a primary experimental measurement or phase diagram.';
 const phase:ScientificComparison=r?{
   field:'phase',displayed:e.phase,reference:r.phase,status:e.atomicNumber>=104?'predicted_not_measured':r.phase===null?'unavailable':
    e.phase?.toLowerCase()===r.phase.toLowerCase()?'matches_reference':'disagreement',
   sourceName:'Royal Society of Chemistry element facts',sourceUrl:r.sourceUrl,
   referenceCondition:'20 °C; pressure not specified by source. Material phase and allotrope may change with conditions.',
   evidenceScope:base,
   notes:e.atomicNumber>=104?'Superheavy element phase is theoretically inferred, not experimentally determined.':r.phase===null?'Source does not report a phase.':'A matching snapshot phase is condition-limited and not a universal phase guarantee.'
 }:generic('phase',e.phase,'Not checked against RSC 20 °C source in this batch.');
 const electronegativity:ScientificComparison=r?{
   field:'electronegativity',displayed:e.electronegativity===null?null:String(e.electronegativity),
   reference:r.paulingElectronegativity===null?null:String(r.paulingElectronegativity),
   status:r.paulingElectronegativity===null?'unavailable':e.electronegativity===null?'disagreement':
    e.electronegativity===r.paulingElectronegativity?'matches_reference':'disagreement',
   sourceName:'Royal Society of Chemistry Pauling electronegativity',sourceUrl:r.sourceUrl,
   referenceCondition:'Pauling relative scale; not a temperature/pressure-dependent bulk property.',
   evidenceScope:base,
   notes:r.paulingElectronegativity===null?'No numeric value given by source.':e.electronegativity!==r.paulingElectronegativity?
    'Two source values differ; preserve the existing display pending methodology and provenance review.':'Sources agree numerically; scale and primary experimental derivation still require careful scientific interpretation.'
 }:generic('electronegativity',e.electronegativity===null?null:String(e.electronegativity),'Not checked against RSC Pauling values in this batch.');
 return {atomicNumber:e.atomicNumber,symbol:e.symbol,electronConfiguration:nistComparison,phase,electronegativity};
});
export function scientificCrossCheck(symbol:string):ElementCrossCheck|undefined {
 return elementScientificCrossChecks.find(x=>x.symbol===symbol);
}
export function scientificReviewSummary(){
 const items=elementScientificCrossChecks;
 return {
  totalElements:118,nistNeutralCovered:items.filter(x=>x.electronConfiguration.status!=='not_covered').length,
  nistAgreement:items.filter(x=>x.electronConfiguration.status==='matches_reference').length,
  nistDisagreement:items.filter(x=>x.electronConfiguration.status==='disagreement').length,
  rscPhaseCovered:items.filter(x=>x.phase.status!=='not_covered').length,
  rscPhaseDisagreement:items.filter(x=>x.phase.status==='disagreement').length,
  rscPaulingCovered:items.filter(x=>x.electronegativity.status!=='not_covered').length,
  rscPaulingDisagreement:items.filter(x=>x.electronegativity.status==='disagreement').length,
  remainingNistReview:items.filter(x=>x.electronConfiguration.status==='not_covered').length
 };
}
