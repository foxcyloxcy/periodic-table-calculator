import {describe,it,expect,vi} from 'vitest';
import {gradeProfile,lookupCompoundProperties,wikidataDensity} from './material-profiles';
import {unifiedSearch} from './unified-search';
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body} as Response);
describe('documented material grade chemistry',()=>{
 it('shows exact source-specific 304 UNS S30400 ranges without inventing iron percentage',()=>{
  const grade=gradeProfile('stainless steel 304');
  expect(grade?.grade).toContain('S30400');
  expect(grade?.composition.find(x=>x.symbol==='Cr')).toEqual({symbol:'Cr',min:18,max:20,unit:'mass %',qualifier:'range'});
  expect(grade?.composition.find(x=>x.symbol==='Ni')).toEqual({symbol:'Ni',min:8,max:12,unit:'mass %',qualifier:'range'});
  expect(grade?.composition.find(x=>x.symbol==='Fe')).toBeUndefined();
  expect(grade?.sourceUrl).toContain('thyssenkrupp');
  expect(gradeProfile('steel')).toBeNull();
  expect(gradeProfile('316 stainless steel')).toBeNull();
 });
 it('can surface the grade even when PubChem/Wikidata have no match',async()=>{
  const requester=vi.fn(async(url:string)=>{
   if(url.includes('pubchem'))return response(null,404);
   if(url.includes('wbsearchentities'))return response({search:[]});
   throw Error('unexpected '+url);
  });
  const result=await unifiedSearch('304 stainless steel',requester);
  expect(result.grade?.composition).toHaveLength(7);
  expect(result.compounds).toEqual([]);
 });
});
describe('contextual physical/compound properties',()=>{
 it('only displays supported PubChem computed descriptors with source and conditions classification',async()=>{
  const fn=vi.fn().mockResolvedValue(response({PropertyTable:{Properties:[{CID:702,XLogP:-0.1,TPSA:20.2,HBondDonorCount:1,HBondAcceptorCount:1,RotatableBondCount:0}]}}));
  const properties=await lookupCompoundProperties(702,fn);
  expect(properties).toHaveLength(5);
  expect(properties.find(x=>x.id==='TPSA')).toMatchObject({value:20.2,unit:'Å²',method:'computed_descriptor'});
  expect(properties.every(x=>x.context.includes('not a')||x.context.includes('not an'))).toBe(true);
  expect(fn.mock.calls[0][0]).toContain('/compound/cid/702/property/XLogP,TPSA');
 });
 it('rejects invalid CIDs and misleading values',async()=>{
  await expect(lookupCompoundProperties(-1)).rejects.toThrow('Invalid');
  const properties=await lookupCompoundProperties(1,vi.fn().mockResolvedValue(response({PropertyTable:{Properties:[{CID:1,TPSA:'unknown',XLogP:Infinity}]}})));
  expect(properties).toEqual([]);
 });
 it('keeps density reference qualifiers rather than inferring ambient conditions',()=>{
  const statements={P2054:[{mainsnak:{datavalue:{value:{amount:'+7.9',unit:'http://www.wikidata.org/entity/Q13147228'}}},
   qualifiers:{P2076:[{datavalue:{value:{amount:'+20',unit:'http://www.wikidata.org/entity/Q25267'}}}],
    P515:[{datavalue:{value:{id:'Q11438'}}}]}}]};
  const data=wikidataDensity(statements,'https://www.wikidata.org/wiki/Q123');
  expect(data[0]).toMatchObject({value:7.9,unit:'g/cm³',method:'reported_quantity'});
  expect(data[0].context).toContain('Temperature: +20 [Q25267]');
  expect(data[0].context).toContain('Phase: Q11438');
  expect(data[0].context).toContain('Pressure: not specified');
 });
 it('never silently interprets missing conditions or unsupported density units',()=>{
  const statement={mainsnak:{datavalue:{value:{amount:'+10',unit:'http://www.wikidata.org/entity/Q844211'}}}};
  const data=wikidataDensity({P2054:[statement]},'https://www.wikidata.org/wiki/Q7');
  expect(data[0].context).toContain('Temperature: not specified');
  expect(wikidataDensity({P2054:[{mainsnak:{datavalue:{value:{amount:'+1',unit:'http://www.wikidata.org/entity/Q12345'}}}}]},'url')).toEqual([]);
 });
});
