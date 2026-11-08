import {describe,it,expect,vi} from 'vitest';
import {lookupFormulaIdentities} from './material-lookup';
import {calculateMolarMass} from './calculator';
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body} as Response);
const ids={IdentifierList:{CID:[5234]}};
describe('formula identity service boundaries',()=>{
 it.each([429,503,500,403])('keeps provider HTTP %i separate from calculated mass',async status=>{
  expect((await lookupFormulaIdentities('NaCl',vi.fn().mockResolvedValue(response({},status)))).status).toBe('unavailable');
  expect(calculateMolarMass('NaCl').value).toBeCloseTo(58.44,8);
 });
 it('distinguishes a real no-match response from an unreadable response',async()=>{
  expect((await lookupFormulaIdentities('NaCl',vi.fn().mockResolvedValue(response(null,404)))).status).toBe('no_match');
  expect((await lookupFormulaIdentities('NaCl',vi.fn().mockResolvedValue(response({})))).status).toBe('unavailable');
  expect((await lookupFormulaIdentities('NaCl',vi.fn().mockResolvedValue(response({IdentifierList:{CID:['bad']}})))).status).toBe('unavailable');
 });
 it.each([{},null,{PropertyTable:{Properties:[]}},{PropertyTable:{Properties:[{CID:999,Title:'Wrong requested record',MolecularFormula:'ClNa',Charge:0,IsotopeAtomCount:0}]}},{PropertyTable:{Properties:[{CID:5234,Title:'Missing metadata',MolecularFormula:'ClNa'}]}}])('reports unusable property data as unavailable',async properties=>{
  const fetcher=vi.fn().mockResolvedValueOnce(response(ids)).mockResolvedValueOnce(response(properties));
  expect((await lookupFormulaIdentities('NaCl',fetcher)).status).toBe('unavailable');
 });
 it('reports a bounded subset rather than claiming no compound exists',async()=>{
  const fetcher=vi.fn().mockResolvedValueOnce(response(ids)).mockResolvedValueOnce(response({PropertyTable:{Properties:[{CID:5234,MolecularFormula:'Cl2Na',Charge:0,IsotopeAtomCount:0}]}}));
  const result=await lookupFormulaIdentities('NaCl',fetcher);
  expect(result.status).toBe('no_match');
  if(result.status==='no_match')expect(result.message).toContain('does not establish');
 });
 it('propagates cancellation so a caller can ignore stale work',async()=>{
  const controller=new AbortController();controller.abort();
  const fetcher=vi.fn().mockRejectedValue(new DOMException('Cancelled','AbortError'));
  await expect(lookupFormulaIdentities('NaCl',fetcher,controller.signal)).rejects.toThrow('Cancelled');
 });
});
