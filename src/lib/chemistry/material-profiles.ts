/**
 * Evidence-bearing material and compound properties. Values must retain type,
 * source, unit, context and whether they are predicted or measured.
 */
export interface ProfileProperty {
  id: string;
  label: string;
  value: number;
  unit: string;
  method: 'computed_descriptor'|'reported_quantity';
  context: string;
  sourceUrl: string;
  sourceName: string;
}
export interface CompositionBound {
  symbol: string;
  min: number | null;
  max: number | null;
  unit: 'mass %';
  qualifier: 'range'|'maximum'|'minimum';
}
export interface GradeProfile {
  id: string;
  label: string;
  grade: string;
  category: 'alloy_grade';
  sourceUrl: string;
  sourceName: string;
  sourceScope: string;
  conditions: string;
  composition: readonly CompositionBound[];
  exclusions: string;
}
const GRADES:Readonly<Record<string,GradeProfile>>=Object.freeze({
 '304 stainless steel':{
  id:'tkmna-304-s30400-long-products',label:'304 stainless steel',grade:'304 / UNS S30400',
  category:'alloy_grade',
  sourceUrl:'https://www.thyssenkrupp-materials-na.com/materials/stainless-steel/chemical-composition-1.html',
  sourceName:'thyssenkrupp Materials North America — Stainless Steel Chemical Composition',
  sourceScope:'304 (UNS S30400), long products row. Not the adjacent 304 Project 70+ product.',
  conditions:'Nominal grade chemistry limits by mass for long products. Not a measured batch; temperature and pressure do not define this specification.',
  composition:[
   {symbol:'Cr',min:18,max:20,unit:'mass %',qualifier:'range'},
   {symbol:'Ni',min:8,max:12,unit:'mass %',qualifier:'range'},
   {symbol:'C',min:null,max:0.08,unit:'mass %',qualifier:'maximum'},
   {symbol:'Mn',min:null,max:2,unit:'mass %',qualifier:'maximum'},
   {symbol:'Si',min:null,max:1,unit:'mass %',qualifier:'maximum'},
   {symbol:'S',min:null,max:0.03,unit:'mass %',qualifier:'maximum'},
   {symbol:'P',min:null,max:0.04,unit:'mass %',qualifier:'maximum'},
  ],
  exclusions:'Iron and other constituents are not independently specified as measured percentages in this row; do not infer fixed Fe %, aggregate maxima, a single molar mass, or a unique composition.',
 }
});
const GRADE_ALIASES:Readonly<Record<string,string>>=Object.freeze({
 '304 stainless steel':'304 stainless steel',
 'stainless steel 304':'304 stainless steel',
 'aisi 304 stainless steel':'304 stainless steel',
 'uns s30400':'304 stainless steel',
});
export function gradeProfile(query:string):GradeProfile|null{
 const key=GRADE_ALIASES[query.trim().toLowerCase()];
 return key?GRADES[key]:null;
}
type Requester=(url:string,init?:RequestInit)=>Promise<Response>;
export async function lookupCompoundProperties(cid:number,request:Requester=fetch,signal?:AbortSignal):Promise<ProfileProperty[]>{
 if(!Number.isSafeInteger(cid)||cid<1)throw Error('Invalid PubChem compound ID');
 const url='https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/'+cid+
  '/property/XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON';
 const res=await request(url,{signal,headers:{Accept:'application/json'}});
 if(!res.ok)throw Error('PubChem properties unavailable (HTTP '+res.status+')');
 const body:unknown=await res.json();
 if(!body || typeof body!=='object')return [];
 const table=(body as {PropertyTable?:{Properties?:unknown[]}}).PropertyTable?.Properties;
 if(!Array.isArray(table))return [];
 const row=table.find(x=>typeof x==='object'&&x!==null&&(x as {CID?:unknown}).CID===cid) as Record<string,unknown>|undefined;
 if(!row)return [];
 const fields=[
  {key:'XLogP',label:'XLogP',unit:'unitless',context:'Predicted octanol/water partition coefficient; algorithmic descriptor, not a measured value under specified experimental conditions.'},
  {key:'TPSA',label:'Topological polar surface area',unit:'Å²',context:'Calculated 2D structural descriptor; not a temperature/pressure-specific experimental measurement.'},
  {key:'HBondDonorCount',label:'Hydrogen-bond donor count',unit:'count',context:'Computed structural feature; not an experimental condition.'},
  {key:'HBondAcceptorCount',label:'Hydrogen-bond acceptor count',unit:'count',context:'Computed structural feature; not an experimental condition.'},
  {key:'RotatableBondCount',label:'Rotatable bond count',unit:'count',context:'Computed structural feature; not an experimental condition.'},
 ];
 return fields.flatMap(field=>{
  const value=row[field.key];
  if(typeof value!=='number'||!Number.isFinite(value))return [];
  return [{id:field.key,label:field.label,value,unit:field.unit,method:'computed_descriptor' as const,context:field.context,
   sourceUrl:'https://pubchem.ncbi.nlm.nih.gov/compound/'+cid,sourceName:'PubChem PUG REST (computed property)'}];
 });
}

const DENSITY_UNITS:Readonly<Record<string,string>>={
 Q844211:'kg/m³',Q13147228:'g/cm³',
};
interface Statement {
 mainsnak?:{datavalue?:{value?:{amount?:string;unit?:string}}};
 qualifiers?:Record<string,Array<{datavalue?:{value?:unknown}}>>;
 rank?:string;
}
function qids(value:string):string{
 return value.slice(value.lastIndexOf('/')+1);
}
/** Reject unsupported units and never assume missing qualifiers are room temperature. */
export function wikidataDensity(claims:Record<string,unknown>|undefined,recordUrl:string):ProfileProperty[]{
 const statements=claims?.P2054;
 if(!Array.isArray(statements))return [];
 return (statements as Statement[]).flatMap(s=>{
  if(s.rank==='deprecated')return [];
  const raw=s.mainsnak?.datavalue?.value;
  const unitId=typeof raw?.unit==='string'?qids(raw.unit):'';
  const unit=DENSITY_UNITS[unitId];
  const value=Number(raw?.amount);
  if(!unit||typeof raw?.amount!=='string'||!Number.isFinite(value)||value<0)return [];
  const qualifiers=s.qualifiers??{};
  const temperature=qualifiers.P2076?.[0]?.datavalue?.value as {amount?:string;unit?:string}|undefined;
  const pressure=qualifiers.P2077?.[0]?.datavalue?.value as {amount?:string;unit?:string}|undefined;
  const phase=qualifiers.P515?.[0]?.datavalue?.value as {id?:string}|undefined;
  const q=(x:typeof temperature):string|null=>{
   if(!x?.amount||!x.unit||!Number.isFinite(Number(x.amount)))return null;
   return x.amount+' ['+qids(x.unit)+']';
  };
  const parts=['Temperature: '+(q(temperature)??'not specified'),
    'Pressure: '+(q(pressure)??'not specified'),
    'Phase: '+(phase?.id?phase.id+' (Wikidata entity)':'not specified')];
  return [{id:'P2054',label:'Reported density',value,unit,method:'reported_quantity' as const,
   context:parts.join(' · ')+'. Wikidata community statement; verify original measurement before treating as experimental reference.',
   sourceUrl:recordUrl+'#P2054',sourceName:'Wikidata P2054 (qualifier metadata)'}];
 });
}
