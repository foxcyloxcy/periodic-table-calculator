import {describe,it,expect,vi} from 'vitest';
import snapshot from './__fixtures__/pubchem-formula-compatibility.json';
import {lookupFormulaIdentities,lookupMaterial,createCandidate} from './material-lookup';
import {calculateMolarMass,parseFormula} from './calculator';
import {formulaFromComposition} from './formula-composition';
const response=(body:unknown)=>({ok:true,status:200,json:async()=>body} as Response);

// Independent flat-token reference reader. Published Hill formulas contain no
// groups; it never reuses the production grouping/subscript parser.
function referenceCounts(formula:string):Record<string,number>{
 const tokens=[...formula.matchAll(/([A-Z][a-z]?)([0-9]*)/g)];
 expect(tokens.map(token=>token[0]).join('')).toBe(formula);
 return Object.fromEntries(tokens.map(token=>[token[1],token[2]?Number(token[2]):1]));
}

describe('published PubChem formula compatibility corpus (test data only)',()=>{
 it('keeps provenance and complete retrieval evidence for all 20 source records',()=>{
  expect(snapshot.records).toHaveLength(20);
  expect(snapshot.retrievalErrors).toEqual([]);
  expect(new Set(snapshot.records.map(x=>x.record.CID)).size).toBe(20);
  for(const entry of snapshot.records){
   expect(entry.sourceUrl).toMatch(/^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/rest\/pug\//);
   expect(entry.record).toMatchObject({Charge:0,IsotopeAtomCount:0});
  }
 });
 for(const entry of snapshot.records){
  const expected=referenceCounts(entry.record.MolecularFormula);
  it.each(entry.inputs)(entry.query+' / %s: input → atoms → remote identity → computed mass',async input=>{
   const fetcher=vi.fn(async(url:string)=>{
    if(url.includes('/fastformula/')){
     expect(url).toContain('/fastformula/'+entry.record.MolecularFormula+'/cids/JSON?MaxRecords=8');
     return response({IdentifierList:{CID:[entry.record.CID]}});
    }
    expect(url).toContain('/cid/'+entry.record.CID+'/property/MolecularFormula,Title,Charge,IsotopeAtomCount/JSON');
    return response({PropertyTable:{Properties:[entry.record]}});
   });
   expect(parseFormula(input)).toEqual(expected);
   const mass=calculateMolarMass(input);
   const found=await lookupFormulaIdentities(input,fetcher);
   expect(found.status).toBe('found');
   if(found.status!=='found')return;
   expect(found.candidates).toHaveLength(1);
   expect(found.candidates[0]).toMatchObject({cid:entry.record.CID,name:entry.record.Title,counts:expected,supported:true,sourceUrl:'https://pubchem.ncbi.nlm.nih.gov/compound/'+entry.record.CID});
   expect(found.candidates[0].molarMass).toBeCloseTo(mass.value,10);
   expect(Object.values(found.candidates[0].massPercent!).reduce((sum,n)=>sum+n,0)).toBeCloseTo(100,10);
   expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it(entry.query+': name lookup → explicit candidate → calculator',async()=>{
   const fetcher=vi.fn().mockResolvedValueOnce(response({IdentifierList:{CID:[entry.record.CID]}})).mockResolvedValueOnce(response({PropertyTable:{Properties:[entry.record]}}));
   const found=await lookupMaterial(entry.query,fetcher);
   expect(found.status).toBe('found');
   if(found.status!=='found')return;
   const chosen=found.candidates[0];
   expect(chosen.supported).toBe(true);
   expect(calculateMolarMass(chosen.formula).composition).toEqual(expected);
   expect(formulaFromComposition(expected)).toBe(entry.record.MolecularFormula);
  });
 }
 it('keeps anhydrous HCl without a locally inferred aqueous acid identity',()=>{
  expect(calculateMolarMass('HCl').compoundName.status).toBe('unresolved');
 });
});

describe('compound name-search numerical safety',()=>{
 it.each([{Charge:1,IsotopeAtomCount:0},{Charge:0,IsotopeAtomCount:1},{}])('retains an unsupported identity without inventing standard-composition numbers: %j',async metadata=>{
  const row={CID:5234,Title:'Source record',MolecularFormula:'ClNa',...metadata};
  const fetcher=vi.fn().mockResolvedValueOnce(response({IdentifierList:{CID:[5234]}})).mockResolvedValueOnce(response({PropertyTable:{Properties:[row]}}));
  const found=await lookupMaterial('source record',fetcher);
  expect(found.status).toBe('found');
  if(found.status==='found')expect(found.candidates[0]).toMatchObject({supported:false,molarMass:null,counts:null,massPercent:null});
 });
 it('never supplies a standard mass for an isotope record with an ordinary-looking formula',()=>{
  expect(createCandidate(1,'Isotopically labeled water','H2O',{Charge:0,IsotopeAtomCount:1})).toMatchObject({supported:false,molarMass:null});
 });
});
