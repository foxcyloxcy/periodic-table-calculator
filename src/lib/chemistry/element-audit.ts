import {periodicElements,type PeriodicElement} from './periodic-table';
import {atomicWeightBySymbol} from './elements';

/** Audit metadata is additive; existing display fields and calculator inputs remain unchanged. */
export type EvidenceLevel='official_identity'|'official_reference'|'secondary_unverified'|'predicted_or_uncertain'|'not_available';
export interface PropertyEvidence{
 field:'identity'|'atomicWeight'|'phase'|'electronConfiguration'|'electronegativity'|'category';
 label:string;
 level:EvidenceLevel;
 sourceName:string;
 sourceUrl:string;
 sourceEdition:string;
 reviewedOn:string;
 reviewStatus:'official_reference_checked'|'independent_field_review_pending'|'missing';
 caveat:string;
}
export interface ElementAudit {
 atomicNumber:number;
 symbol:string;
 identity:PropertyEvidence;
 properties:ReadonlyArray<PropertyEvidence>;
 attentionRequired:boolean;
}
const IUPAC='https://iupac.org/what-we-do/periodic-table-of-elements/';
const CIAAW='https://www.ciaaw.org/abridged-atomic-weights.htm';
const SECONDARY='https://github.com/Bowserinator/Periodic-Table-JSON';
const REVIEW_DATE='2026-10-31';
const base=(field:PropertyEvidence['field'],label:string):PropertyEvidence=>({
 field,label,level:'secondary_unverified',sourceName:'Bowserinator Periodic-Table-JSON snapshot',
 sourceUrl:SECONDARY,sourceEdition:'Pinned educational display snapshot; upstream record SHA audit pending',
 reviewedOn:REVIEW_DATE,reviewStatus:'independent_field_review_pending',
 caveat:'Educational metadata only. Source conditions, primary evidence and field-by-field independent verification remain pending.'
});
function phaseEvidence(e:PeriodicElement):PropertyEvidence{
 const r=base('phase','Phase');
 if(!e.phase)return {...r,level:'not_available',caveat:'No phase value in the snapshot; not a claim about actual phase.'};
 if(e.atomicNumber>=104)return {...r,level:'predicted_or_uncertain',caveat:'Superheavy-element phase is unconfirmed or theoretical. The displayed source label must not be treated as an experimentally measured phase.'};
 return {...r,caveat:'Snapshot phase label only. Temperature and pressure are not supplied; not validated as an experimental phase at a reference condition.'};
}
function weightEvidence(e:PeriodicElement):PropertyEvidence{
 const record=atomicWeightBySymbol.get(e.symbol);
 return {
  field:'atomicWeight',label:'Abridged standard atomic weight',
  level:record?.abridged?'official_reference':'not_available',
  sourceName:'CIAAW Abridged Standard Atomic Weights',sourceUrl:CIAAW,
  sourceEdition:'CIAAW 2024',reviewedOn:REVIEW_DATE,
  reviewStatus:record?.abridged?'official_reference_checked':'missing',
  caveat:record?.abridged
   ? 'CIAAW abridged value with uncertainty for normal materials. The imported record is structurally tested; complete independent transcription review is pending.'
   : 'No CIAAW standard atomic weight available. Do not substitute a radionuclide mass number or predicted value.'
 };
}
export function auditElement(e:PeriodicElement):ElementAudit{
 const identity:PropertyEvidence={
  field:'identity',label:'Element identity',level:'official_identity',sourceName:'IUPAC Periodic Table of Elements',sourceUrl:IUPAC,
  sourceEdition:'IUPAC recognized elements through atomic number 118',reviewedOn:REVIEW_DATE,
  reviewStatus:'official_reference_checked',caveat:'Names/symbols/atomic-number range checked against the official recognized set; does not certify all secondary properties.'
 };
 const properties:PropertyEvidence[]=[
  weightEvidence(e),phaseEvidence(e),
  {...base('electronConfiguration','Electron configuration'),level:e.electronConfiguration?'secondary_unverified':'not_available',
   caveat:e.atomicNumber>=104
    ? 'Superheavy electronic configurations are model-dependent or predicted; the snapshot is not experimental verification.'
    : 'Educational source metadata. Ground state, ionic state, notation and primary-source verification pending.'},
  {...base('electronegativity','Pauling electronegativity'),level:e.electronegativity===null?'not_available':'secondary_unverified',
   caveat:'Pauling-scale estimate/secondary value; source methodology and applicability have not been independently checked.'},
  {...base('category','Element category'),level:'secondary_unverified',
   caveat:'Educational grouping; qualitative categories may be conventional or uncertain for superheavy elements.'},
 ];
 return {atomicNumber:e.atomicNumber,symbol:e.symbol,identity,properties,
  attentionRequired:properties.some(p=>p.reviewStatus!=='official_reference_checked')};
}
export const elementAuditRegistry:ReadonlyArray<ElementAudit>=Object.freeze(periodicElements.map(auditElement));
export function auditBySymbol(symbol:string):ElementAudit|undefined{
 return elementAuditRegistry.find(e=>e.symbol===symbol);
}
export interface AuditOverview{
 checkedDate:string;
 recognizedElements:number;
 lastRecognizedAtomicNumber:number;
 sourceEdition:string;
 authoritativeWeightEntries:number;
 missingStandardWeights:number;
 phasePredictionsFlagged:number;
 pendingSecondaryFieldReviews:number;
}
export function auditOverview():AuditOverview{
 return {
  checkedDate:REVIEW_DATE,
  recognizedElements:elementAuditRegistry.length,
  lastRecognizedAtomicNumber:periodicElements[periodicElements.length-1].atomicNumber,
  sourceEdition:'CIAAW 2024',
  authoritativeWeightEntries:elementAuditRegistry.filter(e=>e.properties[0].level==='official_reference').length,
  missingStandardWeights:elementAuditRegistry.filter(e=>e.properties[0].level==='not_available').length,
  phasePredictionsFlagged:elementAuditRegistry.filter(e=>e.properties[1].level==='predicted_or_uncertain').length,
  pendingSecondaryFieldReviews:elementAuditRegistry.flatMap(e=>e.properties).filter(p=>p.reviewStatus==='independent_field_review_pending').length
 };
}
