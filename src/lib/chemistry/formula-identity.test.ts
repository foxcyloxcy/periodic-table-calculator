import {describe,it,expect,vi} from 'vitest';
import {caseFormulaCandidates} from './formula-case';
import {lookupFormulaIdentities} from './material-lookup';
import {calculateMolarMass} from './calculator';
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body} as Response);

describe('case normalization without changing chemistry',()=>{
 it('accepts lowercased typed formula',()=>{
  expect(caseFormulaCandidates('c2h6o')).toEqual(['C2H6O']);
  expect(caseFormulaCandidates('feso4')).toEqual(['FeSO4']);
  expect(caseFormulaCandidates('FESO4')).toEqual(['FeSO4']);
 });
 it('retains exact case-correct input and flags ambiguous spelling',()=>{
  expect(caseFormulaCandidates('Co')).toEqual(['Co']);
  expect(caseFormulaCandidates('CO')).toEqual(['CO']);
  expect(caseFormulaCandidates('co')).toContain('Co');
  expect(caseFormulaCandidates('co')).toContain('CO');
 });
 it('does not invent element symbols',()=>{
  expect(caseFormulaCandidates('xx9')).toEqual([]);
  expect(caseFormulaCandidates('')).toEqual([]);
 });
});
describe('dynamic PubChem isomer lookup',()=>{
 it('returns multiple sourced compounds for one formula without changing the molar mass',async()=>{
  const fetcher=vi.fn()
   .mockResolvedValueOnce(response({IdentifierList:{CID:[702,8254]}}))
   .mockResolvedValueOnce(response({PropertyTable:{Properties:[
    {CID:702,Title:'Ethanol',MolecularFormula:'C2H6O',Charge:0,IsotopeAtomCount:0},
    {CID:8254,Title:'Dimethyl ether',MolecularFormula:'C2H6O',Charge:0,IsotopeAtomCount:0}
   ]}}));
  const output=await lookupFormulaIdentities('C2H6O',fetcher);
  expect(fetcher.mock.calls[0][0]).toContain('/fastformula/C2H6O/cids/JSON?MaxRecords=8');
  expect(output.status).toBe('found');
  if(output.status==='found'){
   expect(output.candidates.map(c=>c.cid)).toEqual([702,8254]);
   expect(output.candidates[0].sourceUrl).toContain('/702');
   expect(output.candidates[1].sourceUrl).toContain('/8254');
   expect(output.candidates.every(c=>c.molarMass===calculateMolarMass('C2H6O').value)).toBe(true);
  }
 });
 it.each(['NaCl','ClNa','Na1Cl1'])('matches %s to PubChem ClNa by exact atom counts',async(formula)=>{
  const fetcher=vi.fn()
   .mockResolvedValueOnce(response({IdentifierList:{CID:[5234]}}))
   .mockResolvedValueOnce(response({PropertyTable:{Properties:[
    {CID:5234,Title:'Sodium Chloride',MolecularFormula:'ClNa',Charge:0,IsotopeAtomCount:0}
   ]}}));
  const result=await lookupFormulaIdentities(formula,fetcher);
  expect(result.status).toBe('found');
  if(result.status==='found'){
   expect(result.candidates[0]).toMatchObject({cid:5234,name:'Sodium Chloride',formula:'ClNa',counts:{Cl:1,Na:1}});
   expect(result.candidates[0].molarMass).toBeCloseTo(58.44,8);
  }
 });
 it('does not mistake atom ratios, charges, isotopes or missing metadata for exact neutral matches',async()=>{
  const fetcher=vi.fn()
   .mockResolvedValueOnce(response({IdentifierList:{CID:[1,2,3,4,5,6]}}))
   .mockResolvedValueOnce(response({PropertyTable:{Properties:[
    {CID:1,Title:'Different ratio',MolecularFormula:'Cl2Na',Charge:0,IsotopeAtomCount:0},
    {CID:2,Title:'Doubled formula',MolecularFormula:'Cl2Na2',Charge:0,IsotopeAtomCount:0},
    {CID:3,Title:'Charged record',MolecularFormula:'ClNa',Charge:1,IsotopeAtomCount:0},
    {CID:4,Title:'Isotope record',MolecularFormula:'ClNa',Charge:0,IsotopeAtomCount:1},
    {CID:5,Title:'Unknown metadata',MolecularFormula:'ClNa'},
    {CID:6,Title:'Malformed formula',MolecularFormula:'Cl.Na',Charge:0,IsotopeAtomCount:0}
   ]}}));
  expect((await lookupFormulaIdentities('NaCl',fetcher)).status).toBe('no_match');
 });
 it('validates symbols and atom counts before sending a request',async()=>{
  const fetcher=vi.fn();
  for(const formula of ['Xx2','Na0Cl','Na100001Cl']){
   expect((await lookupFormulaIdentities(formula,fetcher)).status).toBe('no_match');
  }
  expect(fetcher).not.toHaveBeenCalled();
 });
 it('rejects formula grammar unsupported by formula-identity search',async()=>{
  const requester=vi.fn();
  const result=await lookupFormulaIdentities('NH4+',requester);
  expect(result.status).toBe('no_match');
  expect(requester).not.toHaveBeenCalled();
 });
 it('returns an explicit unavailable state on PubChem rate limit',async()=>{
  const result=await lookupFormulaIdentities('C2H6O',vi.fn().mockResolvedValue(response({},429)));
  expect(result.status).toBe('unavailable');
 });
});
