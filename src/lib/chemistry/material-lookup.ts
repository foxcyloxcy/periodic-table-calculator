import { calculateMolarMass, parseFormula, FormulaError, type Composition } from './calculator';
import {formulaFromComposition} from './formula-composition';

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
  | {status:'no_match'|'unavailable'|'unsupported'|'invalid'; query:string; message:string};

export const PUBCHEM_API_SOURCE = 'https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest';
const API = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const LIMIT = 8;

export function isMaterialQueryValid(input:string):boolean {
  return input.length>=2 && input.length<=80 && /^[\p{L}\p{N} ,()\-]+$/u.test(input);
}

export function createCandidate(cid:number, name:string, formula:string,identity?:{Charge?:number;IsotopeAtomCount?:number}):PubChemCandidate {
  const sourceUrl = `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
  try {
    if(identity?.Charge===undefined||identity.IsotopeAtomCount===undefined)throw new FormulaError('PubChem charge/isotope metadata is missing; standard-composition mass cannot be verified for this record.');
    if(identity.Charge!==0)throw new FormulaError('This PubChem record is charged. Charged-ion mass calculations are not supported yet.');
    if(identity.IsotopeAtomCount!==0)throw new FormulaError('This PubChem record has isotope labels. Isotope-specific mass calculations are not supported yet.');
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
  if(x===null)return [];
  if(!isObject(x)||!isObject(x.IdentifierList)||!Array.isArray(x.IdentifierList.CID))throw Error('PubChem returned an unreadable identifier response. Try again later.');
  const ids=[...new Set(x.IdentifierList.CID.filter((v):v is number=>Number.isSafeInteger(v)&&v>0))].slice(0,LIMIT);
  if(x.IdentifierList.CID.length&&!ids.length)throw Error('PubChem returned invalid compound identifiers. Try again later.');
  return ids;
}
function propertiesFrom(x:unknown):Array<{CID:number;Title?:string;MolecularFormula:string;Charge?:number;IsotopeAtomCount?:number}> {
  if(!isObject(x)||!isObject(x.PropertyTable)||!Array.isArray(x.PropertyTable.Properties))return [];
  return x.PropertyTable.Properties.flatMap((v:unknown)=>{
    if(!isObject(v)||!Number.isSafeInteger(v.CID)||(v.CID as number)<1||typeof v.MolecularFormula!=='string')return [];
    return [{CID:v.CID as number, Title:typeof v.Title==='string'?v.Title:undefined,MolecularFormula:v.MolecularFormula,
      Charge:typeof v.Charge==='number'?v.Charge:undefined,
      IsotopeAtomCount:typeof v.IsotopeAtomCount==='number'?v.IsotopeAtomCount:undefined}];
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
    const propUrl=`${API}/compound/cid/${ids.join(',')}/property/MolecularFormula,Title,Charge,IsotopeAtomCount/JSON`;
    const data=propertiesFrom(await getJson(propUrl,request,signal)).filter(row=>ids.includes(row.CID));
    const candidates=data.filter((row,index)=>data.findIndex(other=>other.CID===row.CID)===index).slice(0,LIMIT).map(v=>createCandidate(v.CID,v.Title??`Compound CID ${v.CID}`,v.MolecularFormula,v));
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
 let composition:Composition;
 try{composition=parseFormula(input);}
 catch(error){return {status:error instanceof FormulaError&&error.code!=='invalid_formula'?'unsupported':'invalid',query:input,
  message:error instanceof FormulaError?error.message:'Enter a valid supported formula before searching for identities.'};}
 const queryFormula=formulaFromComposition(composition);
 if(queryFormula.length>128)return {status:'unsupported',query:input,message:'The expanded formula is too long for live identity lookup. Its molar mass can still be calculated.'};
 try{
  const url=`${API}/compound/fastformula/${encodeURIComponent(queryFormula)}/cids/JSON?MaxRecords=${LIMIT}`;
  const idData=await getJson(url,request,signal);
  const ids=cidsFrom(idData);
  if(!ids.length)return {status:'no_match',query:input,message:'PubChem found no matching compound identities for this formula. Its molar mass can still be calculated.'};
  const propUrl=`${API}/compound/cid/${ids.join(',')}/property/MolecularFormula,Title,Charge,IsotopeAtomCount/JSON`;
  const properties=propertiesFrom(await getJson(propUrl,request,signal)).filter(row=>ids.includes(row.CID));
  if(!properties.length)throw Error('PubChem returned identifiers but no usable matching compound records. Your calculated mass is unaffected.');
  if(properties.every(row=>!Number.isInteger(row.Charge)||!Number.isInteger(row.IsotopeAtomCount)))throw Error('PubChem returned incomplete charge or isotope data, so compound candidates could not be verified.');
  // PubChem's element order can differ (NaCl -> ClNa). Exact atom counts
  // establish candidate compatibility, never a unique structural identity.
  const candidates=properties.filter(row=>{
    if(row.Charge!==0||row.IsotopeAtomCount!==0)return false;
    try{
      const counts=parseFormula(row.MolecularFormula);
      return Object.keys(counts).length===Object.keys(composition).length &&
        Object.entries(composition).every(([symbol,count])=>counts[symbol]===count);
    }catch{return false;}
  }).filter((row,index,rows)=>rows.findIndex(other=>other.CID===row.CID)===index).slice(0,LIMIT)
    .map(row=>createCandidate(row.CID,row.Title??`Compound CID ${row.CID}`,row.MolecularFormula,row));
  if(!candidates.length)return {status:'no_match',query:input,message:'No supported neutral, non-isotopic match was found within the first eight PubChem records. This limited search does not establish that no matching compound exists. Your calculated mass is unaffected.'};
  return {status:'found',query:input,candidates,note:'Possible compounds with matching atom counts (up to eight returned PubChem records; this is a limited subset). A formula alone does not identify structure, phase or sample purity. Select an identity only with additional evidence.'};
 }catch(error){
  if(signal?.aborted)throw error;
  return {status:'unavailable',query:input,message:error instanceof Error?error.message:'PubChem is temporarily unavailable.'};
 }
}
