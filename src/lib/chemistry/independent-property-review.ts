import {findElement} from './periodic-table';

export type ReviewedField='electronConfiguration'|'electronegativity'|'phase';
export type ComparisonStatus='matches'|'conflict'|'unavailable'|'theoretical';
export interface SourceComparison{
 field:ReviewedField;
 status:ComparisonStatus;
 displayValue:string|null;
 referenceValue:string|null;
 source:string;
 sourceUrl:string;
 sourceRetrievedOn:string;
 referenceCondition:string;
 scope:string;
 note:string;
}
export interface ReviewedElement{
 symbol:string;
 atomicNumber:number;
 comparisons:ReadonlyArray<SourceComparison>;
}
const ON='2026-10-31';
type SourceRow={
 symbol:string;
 number:number;
 slug:string;
 phase:string|null;
 config:string|null;
 electronegativity:number|null;
 predicted?:boolean;
};
const REFERENCE_ROWS:readonly SourceRow[]=[
 {symbol:'H',number:1,slug:'hydrogen',phase:'Gas',config:'1s1',electronegativity:2.2},
 {symbol:'C',number:6,slug:'carbon',phase:'Solid',config:'[He] 2s2 2p2',electronegativity:2.55},
 {symbol:'O',number:8,slug:'oxygen',phase:'Gas',config:'[He] 2s2 2p4',electronegativity:3.44},
 {symbol:'Fe',number:26,slug:'iron',phase:'Solid',config:'[Ar] 3d6 4s2',electronegativity:1.83},
 {symbol:'Au',number:79,slug:'gold',phase:'Solid',config:'[Xe] 4f14 5d10 6s1',electronegativity:2.4},
 {symbol:'Og',number:118,slug:'oganesson',phase:'Solid',config:'[Rn] 5f14 6d10 7s2 7p6',electronegativity:null,predicted:true},
];
function normalizeConfiguration(value:string|null):string|null{
 if(value===null)return null;
 return value.replace(/^\*/,'').replace(/\s+/g,'').toLowerCase();
}
function compare(value:string|null,ref:string|null,field:ReviewedField,row:SourceRow):ComparisonStatus{
 if(row.predicted&&(field==='phase'||field==='electronConfiguration'))return 'theoretical';
 if(ref===null)return 'unavailable';
 if(field==='electronConfiguration')return normalizeConfiguration(value)===normalizeConfiguration(ref)?'matches':'conflict';
 if(field==='electronegativity'){
  if(value===null)return 'conflict';
  return Math.abs(Number(value)-Number(ref))<0.00001?'matches':'conflict';
 }
 return value?.toLowerCase()===ref.toLowerCase()?'matches':'conflict';
}
function sourceRecord(row:SourceRow,field:ReviewedField):SourceComparison{
 const current=findElement(row.symbol);
 if(!current)throw Error('Unknown reference element '+row.symbol);
 const sourceUrl='https://periodic-table.rsc.org/element/'+row.number+'/'+row.slug;
 const displayValue=field==='electronConfiguration'?current.electronConfiguration:field==='phase'?current.phase:
  current.electronegativity===null?null:String(current.electronegativity);
 const referenceValue=field==='electronConfiguration'?row.config:field==='phase'?row.phase:
  row.electronegativity===null?null:String(row.electronegativity);
 const status=compare(displayValue,referenceValue,field,row);
 return {field,status,displayValue,referenceValue,
  source:'Royal Society of Chemistry element fact box / atomic data',
  sourceUrl,sourceRetrievedOn:ON,
  referenceCondition:field==='phase'?'State at 20 °C; pressure not specified in RSC fact box':
    field==='electronConfiguration'?'Neutral atom ground-state configuration as tabulated; heavy-element values can be theoretical':
    'Pauling electronegativity scale; no thermodynamic phase condition',
  scope:'Independent comparison to RSC published educational/reference record; not a primary experimental dataset.',
  note:status==='conflict'?'Published reference differs from existing display value. No automatic override: scientific scale, methodology or source disagreement requires review.':
   status==='theoretical'?'For superheavy elements, a matching label is not proof of laboratory measurement; experimental phase is unconfirmed.':
   status==='unavailable'?'The reference does not provide a value; absence is not zero.':
   'The reference agrees with the current display value; field-level comparison is not an experimental certification.'
 };
}
const records:ReadonlyArray<ReviewedElement>=REFERENCE_ROWS.map(row=>({
 symbol:row.symbol,atomicNumber:row.number,
 comparisons:(['electronConfiguration','electronegativity','phase'] as const).map(field=>sourceRecord(row,field))
}));
export const independentElementReviews=Object.freeze(records);
export function independentReview(symbol:string):ReviewedElement|undefined{
 return independentElementReviews.find(r=>r.symbol===symbol);
}
export function reviewProgress(){
 const details=independentElementReviews.flatMap(e=>e.comparisons);
 return {reviewedElements:independentElementReviews.length,totalElements:118,
  comparedFields:details.length,matches:details.filter(x=>x.status==='matches').length,
  conflicts:details.filter(x=>x.status==='conflict').length,
  theoretical:details.filter(x=>x.status==='theoretical').length,
  unavailable:details.filter(x=>x.status==='unavailable').length,
  lastReview:ON};
}
