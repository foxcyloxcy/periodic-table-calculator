import { calculateMolarMass, FormulaError, type Composition } from './calculator';

export interface PubChemCandidate {
  cid: number;
  name: string;
  formula: string;
  source: 'PubChem PUG REST';
  sourceUrl: string;
  counts: Composition | null;
  molarMass: number | null;
  massPercent: Readonly<Record<string, number>> | null;
  supported: boolean;
  limitation: string | null;
}
export type LookupOutcome =
  | {status:'found'; query:string; candidates:PubChemCandidate[]; note:string}
  | {status:'no_match'|'unavailable'; query:string; message:string};

export const PUBCHEM_API_SOURCE = 'https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest';
const API = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const LIMIT = 8;

export function isMaterialQueryValid(input:string):boolean {
  return input.length>=2 && input.length<=80 && /^[\p{L}\p{N} ,()\-]+$/u.test(input);
}

export function createCandidate(cid:number, name:string, formula:string):PubChemCandidate {
  const sourceUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
  try {
    const result = calculateMolarMass(formula);
    const massPercent = Object.fromEntries(result.steps.map(step=>[step.element, 100*step.contribution/result.value]));
    return {cid,name,formula,source:'PubChem PUG REST',sourceUrl,counts:result.composition,molarMass:result.value,massPercent,supported:true,limitation:null};
  } catch(error) {
    return {cid,name,formula,source:'PubChem PUG REST',sourceUrl,counts:null,molarMass:null,massPercent:null,supported:false,
      limitation:error instanceof FormulaError?error.message:'This record cannot be calculated using the supported formula grammar.'};
  }
}

type Requester=(url:string, init?:RequestInit)=>Promise<Response>;
async function getJson(url:string, request:Requester, signal?:AbortSignal):Promise<unknown> {
  const response=await request(url,{signal,headers:{Accept:'application/json'}});
  if(response.status===404)return null;
  if(response.status===429 || response.status===503)throw Error('PubChem is temporarily limiting requests. Please try again later.');
  if(!response.ok)throw Error('PubChem search is currently unavailable ('+response.status+').');
  return response.json();
}
function isObject(x:unknown):x is Record<string,unknown>{return typeof x==='object'&&x!==null&&!Array.isArray(x);}
function cidsFrom(x:unknown):number[]{
  if(!isObject(x)||!isObject(x.IdentifierList)||!Array.isArray(x.IdentifierList.CID))return [];
  return x.IdentifierList.CID.filter((v):v is number=>Number.isSafeInteger(v)&&v>0).slice(0,LIMIT);
}
function propertiesFrom(x:unknown):Array<{CID:number;Title?:string;MolecularFormula:string}> {
  if(!isObject(x)||!isObject(x.PropertyTable)||!Array.isArray(x.PropertyTable.Properties))return [];
  return x.PropertyTable.Properties.flatMap((v:unknown)=>{
    if(!isObject(v)||!Number.isSafeInteger(v.CID)||typeof v.MolecularFormula!=='string')return [];
    return [{CID:v.CID as number, Title:typeof v.Title==='string'?v.Title:undefined,MolecularFormula:v.MolecularFormula}];
  });
}

/**
 * Live exact name/synonym resolution via PubChem; not a hardcoded mapping.
 * This client-side operation works on static GitHub Pages when the user's
 * browser can reach PubChem; failures are explicit, never silently fabricated.
 * PubChem search results are candidates, not confirmation of sample identity.
 */
export async function lookupMaterial(query:string, request:Requester=fetch, signal?:AbortSignal):Promise<LookupOutcome> {
  const term=query.trim();
  if(!isMaterialQueryValid(term))return {status:'no_match',query:term,message:'Enter 2–80 letters/numbers for a material or compound name.'};
  try {
    const idUrl=`${API}/compound/name/${encodeURIComponent(term)}/cids/JSON`;
    const ids=cidsFrom(await getJson(idUrl,request,signal));
    if(ids.length===0)return {status:'no_match',query:term,message:'No exact PubChem compound-name match was found. Try a specific chemical name; foods and mixtures may not have a single formula.'};
    const propUrl=`${API}/compound/cid/${ids.join(',')}/property/MolecularFormula,Title/JSON`;
    const data=propertiesFrom(await getJson(propUrl,request,signal));
    const candidates=data.slice(0,LIMIT).map(v=>createCandidate(v.CID,v.Title??`Compound CID ${v.CID}`,v.MolecularFormula));
    if(!candidates.length)return {status:'unavailable',query:term,message:'PubChem returned identifiers but no usable molecular formulas.'};
    const note = term.toLowerCase()==='sugar'
      ? '“Sugar” commonly means table sugar (sucrose), but can also describe other sugars or mixtures. Confirm the intended substance before using a formula.'
      : 'PubChem resolved a matching compound name or synonym. This does not establish that your sample contains only that substance.';
    return {status:'found',query:term,candidates,note};
  } catch(error) {
    if(signal?.aborted)throw error;
    return {status:'unavailable',query:term,message:error instanceof Error?error.message:'Unable to contact PubChem. Check connectivity and try again.'};
  }
}

/**
 * Resolve possible compound identities from a molecular formula (isomers).
 * Exact formula search is intentionally limited to eight CIDs; this is a
 * candidate subset, never a guarantee that all structures are returned.
 */
export async function lookupFormulaIdentities(formula:string, request:Requester=fetch, signal?:AbortSignal):Promise<LookupOutcome>{
 const input=formula.trim();
 if(!/^(?:[A-Z][a-z]?[0-9]*)+$/.test(input)||input.length>80){
  return {status:'no_match',query:input,message:'Formula identity search currently supports simple molecular formulas only.'};
 }
 try{
  const url=`${API}/compound/fastformula/${encodeURIComponent(input)}/cids/JSON?MaxRecords=${LIMIT}`;
  const ids=cidsFrom(await getJson(url,request,signal));
  if(!ids.length)return {status:'no_match',query:input,message:'PubChem found no matching compound identities for this formula. Its molar mass can still be calculated.'};
  const propUrl=`${API}/compound/cid/${ids.join(',')}/property/MolecularFormula,Title/JSON`;
  const properties=propertiesFrom(await getJson(propUrl,request,signal));
  const candidates=properties.filter(row=>row.MolecularFormula===input).slice(0,LIMIT)
    .map(row=>createCandidate(row.CID,row.Title??`Compound CID ${row.CID}`,row.MolecularFormula));
  if(!candidates.length)return {status:'no_match',query:input,message:'No exact neutral-formula identity was returned by PubChem.'};
  return {status:'found',query:input,candidates,note:'Possible structures sharing this molecular formula (up to eight PubChem records). A formula alone does not distinguish isomers; select a specific identity only with additional evidence.'};
 }catch(error){
  if(signal?.aborted)throw error;
  return {status:'unavailable',query:input,message:error instanceof Error?error.message:'PubChem is temporarily unavailable.'};
 }
}
