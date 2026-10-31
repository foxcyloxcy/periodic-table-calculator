import {describe,expect,it,vi} from 'vitest';
import {createCandidate, lookupMaterial, isMaterialQueryValid} from './material-lookup';
import {calculateMolarMass} from './calculator';

const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body} as Response);
describe('source-backed material name lookup',()=>{
 it('looks up sugar via PubChem CID then derives molar mass/composition independently',async()=>{
   const requester=vi.fn().mockResolvedValueOnce(response({IdentifierList:{CID:[5988]}}))
     .mockResolvedValueOnce(response({PropertyTable:{Properties:[{CID:5988,Title:'Sucrose',MolecularFormula:'C12H22O11'}]}}));
   const data=await lookupMaterial('sugar',requester);
   expect(requester).toHaveBeenCalledTimes(2);
   expect(requester.mock.calls[0][0]).toContain('/compound/name/sugar/cids/JSON');
   expect(data.status).toBe('found');
   if(data.status!=='found')return;
   expect(data.note).toContain('table sugar');
   const c=data.candidates[0];
   expect(c).toMatchObject({cid:5988,formula:'C12H22O11',name:'Sucrose',sourceUrl:'https://pubchem.ncbi.nlm.nih.gov/compound/5988',supported:true,
      counts:{C:12,H:22,O:11}});
   expect(c.molarMass).toBeCloseTo(calculateMolarMass(c.formula).value,8);
   expect(Object.values(c.massPercent!).reduce((a,b)=>a+b,0)).toBeCloseTo(100,8);
 });
 it('does not pretend that an unsupported record can be computed',()=>{
   expect(createCandidate(1,'Unsupported','TcO2')).toMatchObject({supported:false,molarMass:null,counts:null});
   expect(createCandidate(2,'Charge','NH4+')).toMatchObject({supported:false});
 });
 it('returns multiple record candidates rather than arbitrarily choosing one',async()=>{
   const requester=vi.fn().mockResolvedValueOnce(response({IdentifierList:{CID:[1,2]}}))
     .mockResolvedValueOnce(response({PropertyTable:{Properties:[{CID:1,Title:'Candidate A',MolecularFormula:'C2H6O'},{CID:2,Title:'Candidate B',MolecularFormula:'C2H6O'}]}}));
   const data=await lookupMaterial('ethyl alcohol',requester);
   expect(data.status).toBe('found');
   if(data.status==='found')expect(data.candidates).toHaveLength(2);
 });
 it('bounds broad inputs and does not send a request for invalid queries',async()=>{
   const requester=vi.fn();
   expect(isMaterialQueryValid('A'.repeat(81))).toBe(false);
   expect((await lookupMaterial('!',requester)).status).toBe('no_match');
   expect(requester).not.toHaveBeenCalled();
 });
 it('returns explicit no-match and API unavailable statuses',async()=>{
   expect((await lookupMaterial('unknown compound',vi.fn().mockResolvedValue(response(null,404)))).status).toBe('no_match');
   const api=vi.fn().mockResolvedValue(response(null,429));
   const failure=await lookupMaterial('sugar',api);
   expect(failure.status).toBe('unavailable');
 });
});
