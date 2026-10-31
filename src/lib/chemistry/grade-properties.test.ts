import {describe,it,expect} from 'vitest';
import {additionalGradeProfile,gradeReferenceProperties,convertPropertyUnit} from './grade-properties';
import {unifiedSearch} from './unified-search';
const response=(body:unknown,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body} as Response);
describe('source-scoped material grade profiles',()=>{
 it('has independently specified 304L, 316, and 316L chemical limits',()=>{
  const low=additionalGradeProfile('304L stainless steel');
  const high=additionalGradeProfile('UNS S31600');
  const low316=additionalGradeProfile('stainless steel 316l');
  expect(low?.composition.find(c=>c.symbol==='C')?.max).toBe(0.03);
  expect(high?.composition.find(c=>c.symbol==='Mo')).toMatchObject({min:2,max:3});
  expect(low316?.composition.find(c=>c.symbol==='C')?.max).toBe(0.03);
  expect(low316?.composition.find(c=>c.symbol==='Cr')).toMatchObject({min:16,max:18});
  expect(additionalGradeProfile('steel')).toBeNull();
  expect(additionalGradeProfile('316Ti stainless steel')).toBeNull();
 });
 it('preserves mechanical grade differences and temperature-specific thermal conductivity',()=>{
  const a=gradeReferenceProperties(additionalGradeProfile('316 stainless steel')!);
  const b=gradeReferenceProperties(additionalGradeProfile('316L stainless steel')!);
  expect(a.find(p=>p.id==='tensile')?.value).toBe(515);
  expect(b.find(p=>p.id==='tensile')?.value).toBe(485);
  expect(a.find(p=>p.id==='conductivity100')).toMatchObject({value:16.3,unit:'W/(m·K)'});
  expect(a.find(p=>p.id==='conductivity500')?.referenceCondition).toContain('500 °C');
  expect(a.find(p=>p.category==='melting')).toMatchObject({value:1375,upper:1400,unit:'°C',limit:'range'});
  expect(gradeReferenceProperties(additionalGradeProfile('304L stainless steel')!).find(p=>p.category==='melting')).toMatchObject({value:1400,upper:1450});
 });
 it('converts only supported dimensions without mutating provenance',()=>{
  const item=gradeReferenceProperties(additionalGradeProfile('304L stainless steel')!).find(p=>p.id==='density')!;
  const converted=convertPropertyUnit(item,'g/cm³');
  expect(converted.value).toBeCloseTo(8,10);
  expect(convertPropertyUnit(converted,'kg/m³').value).toBe(8000);
  expect(converted.referenceCondition).toBe(item.referenceCondition);
  expect(()=>convertPropertyUnit(item,'MPa')).toThrow('Unsupported');
 });
 it('survives absence of all remote providers for a known grade',async()=>{
  const request=async(url:string)=>{
   if(url.includes('pubchem'))return response(null,404);
   if(url.includes('wbsearchentities'))return response({search:[]});
   throw Error('unexpected');
  };
  const result=await unifiedSearch('316 stainless steel',request);
  expect(result.grade?.grade).toContain('S31600');
  expect(result.materials).toEqual([]);
 });
});
