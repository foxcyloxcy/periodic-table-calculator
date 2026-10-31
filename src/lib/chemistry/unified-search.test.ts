import {describe,expect,it,vi} from 'vitest';
import {lookupMaterialClasses,unifiedSearch} from './unified-search';
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body} as Response);
const entity=(id:string, parents:string[],property='P279')=>({
 id,claims:{[property]:parents.map(p=>({mainsnak:{datavalue:{value:{id:p}}}}))}
});
const graph:Record<string,unknown>={
 Q11427:entity('Q11427',['Q907347']),
 Q907347:entity('Q907347',['Q37756']),
 Q37756:entity('Q37756',[]),
 Q8495:entity('Q8495',['Q2095']),
 Q2095:entity('Q2095',[]),
};
function mockFetch(url:string):Promise<Response>{
 const u=new URL(url);
 if(u.hostname==='www.wikidata.org'){
  if(u.searchParams.get('action')==='wbsearchentities'){
   const query=u.searchParams.get('search');
   if(query==='steel')return Promise.resolve(response({search:[{id:'Q11427',label:'steel',description:'alloy made by combining iron and other elements'}, {id:'Q42',label:'Steel movie'}]}));
   if(query==='milk')return Promise.resolve(response({search:[{id:'Q8495',label:'milk',description:'liquid food'}]}));
   return Promise.resolve(response({search:[]}));
  }
  const ids=(u.searchParams.get('ids')??'').split('|');
  return Promise.resolve(response({entities:Object.fromEntries(ids.filter(id=>id in graph).map(id=>[id,graph[id]]))}));
 }
 if(u.hostname==='pubchem.ncbi.nlm.nih.gov'){
  if(url.includes('/compound/name/caffeine/cids/JSON'))return Promise.resolve(response({IdentifierList:{CID:[2519]}}));
  if(url.includes('/compound/cid/2519/property/'))return Promise.resolve(response({PropertyTable:{Properties:[{CID:2519,Title:'Caffeine',MolecularFormula:'C8H10N4O2'}]}}));
  return Promise.resolve(response(null,404));
 }
 throw new Error('Unexpected URL '+url);
}
describe('Wikidata taxonomic material classification',()=>{
 it('resolves steel to alloy via P279, not inferred from the description',async()=>{
  const request=vi.fn(mockFetch);
  const records=await lookupMaterialClasses('steel',request);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({id:'Q11427',kind:'alloy',sourceUrl:'https://www.wikidata.org/wiki/Q11427'});
  expect(records[0].classificationBasis).toContain('Q37756');
  expect(records[0].compositionNote).toContain('No universal molecular formula');
 });
 it('classifies milk conservatively as a broad food/material, with no universal chemical formula',async()=>{
  const records=await lookupMaterialClasses('milk',mockFetch);
  expect(records[0].kind).toBe('material_class');
  expect(records[0].compositionNote).toContain('single fixed composition is not established');
 });
 it('does not turn irrelevant approximate search matches into materials',async()=>{
  const records=await lookupMaterialClasses('stee',mockFetch);
  expect(records).toEqual([]);
 });
});
describe('unified search integration',()=>{
 it('returns the periodic-table element source without a network-dependent identity',async()=>{
  const found=await unifiedSearch('Gold',mockFetch);
  expect(found.element?.symbol).toBe('Au');
 });
 it('includes CIAAW-derived compound atom counts and source provenance',async()=>{
  const found=await unifiedSearch('caffeine',mockFetch);
  expect(found.compounds[0]).toMatchObject({cid:2519,formula:'C8H10N4O2',supported:true});
  expect(found.compounds[0].counts).toEqual({C:8,H:10,N:4,O:2});
  expect(Object.values(found.compounds[0].massPercent!).reduce((a,b)=>a+b,0)).toBeCloseTo(100,6);
 });
 it('returns steel material evidence even when PubChem has no matching compound',async()=>{
  const found=await unifiedSearch('steel',mockFetch);
  expect(found.compounds).toEqual([]);
  expect(found.materials[0].kind).toBe('alloy');
 });
 it('returns partial results if PubChem is down',async()=>{
  const requester=vi.fn(async(url:string)=>{
   if(url.includes('pubchem'))throw Error('Offline');
   return mockFetch(url);
  });
  const found=await unifiedSearch('steel',requester);
  expect(found.materials[0].kind).toBe('alloy');
  expect(found.notices.join(' ')).toContain('PubChem');
 });
 it('does not fabricate an identity if sources return nothing',async()=>{
  const found=await unifiedSearch('unrecorded thing',mockFetch);
  expect(found.element).toBeNull();
  expect(found.materials).toEqual([]);
  expect(found.compounds).toEqual([]);
  expect(found.notices.join(' ')).toContain('No verified identity found');
 });
});
