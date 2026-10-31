import type {GradeProfile,CompositionBound,ProfileProperty} from './material-profiles';
const TK='https://www.thyssenkrupp-materials-na.com/materials/stainless-steel/chemical-composition-1.html';
const AZ304='https://www.azom.com/article.aspx?ArticleID=965';
const AZ316='https://www.azom.com/article.aspx?ArticleID=863';
const b=(symbol:string,min:number|null,max:number|null):CompositionBound=>({symbol,min,max,unit:'mass %',qualifier:min!==null&&max!==null?'range':min===null?'maximum':'minimum'});
const make=(name:string,uns:string,c:number,cr1:number,cr2:number,ni1:number,ni2:number,mo:boolean):GradeProfile=>({
 id:'tkmna-'+uns.toLowerCase()+'-long-products',label:name,grade:name.split(' ')[0]+' / UNS '+uns,category:'alloy_grade',
 sourceUrl:TK,sourceName:'thyssenkrupp Materials North America',sourceScope:name+' ('+uns+'), long products composition row, not a Project 70+ variant.',
 conditions:'Published independent grade chemistry limits by mass; not an actual sample or a measurement temperature.',
 composition:[b('C',null,c),b('Cr',cr1,cr2),b('Ni',ni1,ni2),b('Mn',null,2),b('Si',null,1),b('S',null,0.03),b('P',null,0.04),...(mo?[b('Mo',2,3)]:[])],
 exclusions:'No fixed Fe percentage, batch-specific composition, or universal alloy molar mass can be deduced from these limits.'
});
const grades:Record<string,GradeProfile>={
 '304l':make('304L stainless steel','S30403',0.03,18,20,8,12,false),
 '316':make('316 stainless steel','S31600',0.08,16,18,10,14,true),
 '316l':make('316L stainless steel','S31603',0.03,16,18,10,14,true)
};
export function additionalGradeProfile(query:string):GradeProfile|null{
 const q=query.trim().toLowerCase();
 for(const [key,grade] of Object.entries(grades)){
  if([key+' stainless steel','stainless steel '+key,'uns '+grade.grade.split('UNS ')[1]?.toLowerCase()].includes(q))return grade;
 }
 return null;
}
export interface BoundedProperty extends ProfileProperty{
 category:'density'|'thermal'|'mechanical'|'melting';
 limit:'typical'|'minimum'|'maximum'|'range';
 upper?:number;
 referenceCondition:string;
}
function record(id:string,label:string,value:number,unit:string,category:BoundedProperty['category'],limit:BoundedProperty['limit'],condition:string,src:string):BoundedProperty{
 return {id,label,value,unit,category,limit,referenceCondition:condition,method:'reported_quantity',
 context:condition+'; '+limit+' published reference, not a measured specimen.',
 sourceUrl:src,sourceName:src===AZ304?'AZoM Grade 304': 'AZoM Grade 316'};
}
export function gradeReferenceProperties(grade:GradeProfile):readonly BoundedProperty[]{
 const uns=grade.grade.match(/S30400|S30403|S31600|S31603/)?.[0];
 if(!uns)return [];
 const is304=uns.startsWith('S304'),low=uns.endsWith('03'),src=is304?AZ304:AZ316;
 return [
  record('density','Density',8000,'kg/m³','density','typical','Annealed; measurement temperature not specified in table',src),
  record('elastic','Elastic modulus',193,'GPa','mechanical','typical','Annealed; measurement temperature not specified in table',src),
  record('tensile','Minimum tensile strength',low?485:515,'MPa','mechanical','minimum','Flat rolled products, test temperature not specified',src),
  record('yield','Minimum 0.2% proof strength',low?170:205,'MPa','mechanical','minimum','Flat rolled products, test temperature not specified',src),
  record('elongation','Minimum elongation',40,'%','mechanical','minimum','50 mm gauge length, per published mechanical property table',src),
  record('conductivity100','Thermal conductivity at 100 °C',is304?16.2:16.3,'W/(m·K)','thermal','typical','Annealed, 100 °C',src),
  record('conductivity500','Thermal conductivity at 500 °C',21.5,'W/(m·K)','thermal','typical','Annealed, 500 °C',src),
  record('specificheat','Specific heat over 0–100 °C',500,'J/(kg·K)','thermal','typical','Published 0–100 °C interval, not an arbitrary temperature',src)
 ];
}
export function convertPropertyUnit(p:BoundedProperty,target:string):BoundedProperty{
 if(p.unit===target)return p;
 const conversions:Record<string,[string,number]>={'kg/m³':['g/cm³',0.001],'g/cm³':['kg/m³',1000],'MPa':['GPa',0.001],'GPa':['MPa',1000]};
 const rule=conversions[p.unit];
 if(!rule||rule[0]!==target)throw Error('Unsupported dimensional conversion');
 return {...p,value:p.value*rule[1],upper:p.upper===undefined?undefined:p.upper*rule[1],unit:target};
}
