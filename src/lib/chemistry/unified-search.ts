import { lookupMaterial, type PubChemCandidate } from './material-lookup';
import { findElement, type PeriodicElement } from './periodic-table';

export type MaterialKind = 'element' | 'compound' | 'alloy' | 'mixture' | 'material_class' | 'unclassified';
export interface MaterialRecord {
  id: string;
  name: string;
  description: string;
  kind: Exclude<MaterialKind, 'element' | 'compound'>;
  sourceId: string;
  sourceUrl: string;
  classificationBasis: string;
  compositionNote: string;
}
export interface UnifiedSearchResult {
  query: string;
  element: PeriodicElement | null;
  compounds: PubChemCandidate[];
  materials: MaterialRecord[];
  notices: string[];
}

type Requester = (url: string, init?: RequestInit) => Promise<Response>;
interface WikidataSearchEntry { id: string; label: string; description?: string }
interface WikidataEntity {
  id: string;
  labels?: {en?: {value?: string}};
  descriptions?: {en?: {value?: string}};
  claims?: Record<string, Array<{mainsnak?: {datavalue?: {value?: {id?: string}}}}>>;
}
const API = 'https://www.wikidata.org/w/api.php';
const MAX_SEARCH = 6;
const MAX_TYPES = 48;
const LABELS: Record<string, {kind: MaterialRecord['kind']; label: string}> = {
  Q37756: {kind:'alloy', label:'alloy'},
  Q169336: {kind:'mixture', label:'mixture'},
  Q11344: {kind:'unclassified',label:'chemical element'},
  Q11173: {kind:'unclassified',label:'chemical compound'},
  Q214609: {kind:'material_class',label:'material'},
  Q2095: {kind:'material_class',label:'food'},
};
const PRIORITY: MaterialRecord['kind'][] = ['alloy','mixture','material_class','unclassified'];
function asObject(v:unknown):Record<string,unknown>|null{
  return v!==null && typeof v==='object' && !Array.isArray(v) ? v as Record<string,unknown> : null;
}
function parseSearch(v:unknown):WikidataSearchEntry[]{
  const data=asObject(v);
  if(!Array.isArray(data?.search))return [];
  return data.search.flatMap((entry:unknown)=>{
    const e=asObject(entry);
    if(!e || typeof e.id!=='string' || !/^Q\d+$/.test(e.id) || typeof e.label!=='string')return [];
    return [{id:e.id,label:e.label,description:typeof e.description==='string'?e.description:undefined}];
  }).slice(0,MAX_SEARCH);
}
function parseEntities(v:unknown):Map<string,WikidataEntity>{
  const data=asObject(asObject(v)?.entities);
  const result=new Map<string,WikidataEntity>();
  if(!data)return result;
  for(const [id,val] of Object.entries(data)){
    if(/^Q\d+$/.test(id) && asObject(val))result.set(id,val as WikidataEntity);
  }
  return result;
}
function related(e:WikidataEntity|undefined):string[]{
  const relations=[...(e?.claims?.P31??[]),...(e?.claims?.P279??[])];
  return [...new Set(relations.map(c=>c.mainsnak?.datavalue?.value?.id).filter((id):id is string=>typeof id==='string' && /^Q\d+$/.test(id)))].slice(0,MAX_TYPES);
}
async function json(request:Requester,url:string,signal?:AbortSignal):Promise<unknown>{
  const res=await request(url,{signal,headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error('Wikidata HTTP '+res.status);
  return res.json();
}
async function fetchEntities(ids:string[],request:Requester,signal?:AbortSignal):Promise<Map<string,WikidataEntity>>{
  if(!ids.length)return new Map();
  const qs=new URLSearchParams({action:'wbgetentities',ids:ids.slice(0,MAX_TYPES).join('|'),
    props:'labels|descriptions|claims',languages:'en',format:'json',origin:'*'});
  return parseEntities(await json(request,API+'?'+qs.toString(),signal));
}
function classify(entry:WikidataSearchEntry,entities:Map<string,WikidataEntity>):MaterialRecord {
  const starting=entities.get(entry.id);
  const visited=new Set<string>();
  const queue=related(starting).map(id=>({id,depth:1}));
  const matched:Array<{kind:MaterialRecord['kind'];label:string;depth:number;id:string}>=[];
  while(queue.length && visited.size<120){
    const next=queue.shift()!;
    if(visited.has(next.id))continue;
    visited.add(next.id);
    const type=LABELS[next.id];
    if(type) matched.push({...type,depth:next.depth,id:next.id});
    if(next.depth<3)for(const id of related(entities.get(next.id)))queue.push({id,depth:next.depth+1});
  }
  matched.sort((a,b)=>PRIORITY.indexOf(a.kind)-PRIORITY.indexOf(b.kind) || a.depth-b.depth);
  const best=matched[0];
  // Do not convert a search hit into "alloy" merely because its description says so.
  const basis=best ? 'Wikidata P31/P279 taxonomy → '+best.label+' ('+best.id+')'
    : 'Wikidata name/description only; no supported class verified';
  return {
    id:entry.id,name:entry.label,description:entry.description??'No description provided',
    kind:best?.kind??'unclassified',sourceId:entry.id,
    sourceUrl:'https://www.wikidata.org/wiki/'+entry.id,
    classificationBasis:basis,
    compositionNote:best?.kind==='alloy' || best?.kind==='mixture'
      ? 'Composition varies by grade, formulation or sample. No universal molecular formula or mass fractions are asserted.'
      : 'A single fixed composition is not established for this material. Additional verified sample or grade data would be required.',
  };
}
export async function lookupMaterialClasses(query:string,request:Requester=fetch,signal?:AbortSignal):Promise<MaterialRecord[]>{
  const qs=new URLSearchParams({action:'wbsearchentities',search:query,language:'en',format:'json',limit:String(MAX_SEARCH),origin:'*'});
  const entries=parseSearch(await json(request,API+'?'+qs.toString(),signal))
    .filter(e=>e.label.trim().toLowerCase()===query.trim().toLowerCase());
  if(!entries.length)return [];
  const graph=await fetchEntities(entries.map(e=>e.id),request,signal);
  // Two relation-hops beyond the original entity: steel→ferroalloy→alloy.
  for(let depth=0;depth<2;depth++){
    const ids=[...new Set([...graph.values()].flatMap(related))].filter(id=>!graph.has(id)).slice(0,MAX_TYPES);
    if(!ids.length)break;
    const additional=await fetchEntities(ids,request,signal);
    for(const [id,e] of additional)graph.set(id,e);
  }
  return entries.map(e=>classify(e,graph));
}
export async function unifiedSearch(query:string,request:Requester=fetch,signal?:AbortSignal):Promise<UnifiedSearchResult>{
  const term=query.trim();
  if(term.length<2 || term.length>80)throw new Error('Enter a search term of 2–80 characters.');
  const element=findElement(term)??null;
  const [chemical,materials]=await Promise.allSettled([
    lookupMaterial(term,request,signal),
    lookupMaterialClasses(term,request,signal),
  ]);
  if(signal?.aborted)throw new Error('Search cancelled');
  const notices:string[]=[];
  let compounds:PubChemCandidate[]=[];
  if(chemical.status==='fulfilled'){
    if(chemical.value.status==='found')compounds=chemical.value.candidates;
    else notices.push('PubChem: '+chemical.value.message);
  }else notices.push('PubChem lookup unavailable.');
  let materialRecords:MaterialRecord[]=[];
  if(materials.status==='fulfilled')materialRecords=materials.value;
  else notices.push('Wikidata classification unavailable.');
  if(!element && !compounds.length && !materialRecords.length)notices.push('No verified identity found in the available sources. This does not mean the material does not exist.');
  return {query:term,element,compounds,materials:materialRecords,notices};
}
