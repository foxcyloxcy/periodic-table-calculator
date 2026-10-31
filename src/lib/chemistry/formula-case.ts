import { parseFormula } from './calculator';
import { atomicWeights } from './elements';

/**
 * Case-insensitive formula typing, but preserving chemical identity.
 * 'co' could be CO (carbon monoxide formula) or Co (cobalt), so we return
 * both rather than blindly uppercasing. Existing valid exact spellings win.
 */
export function caseFormulaCandidates(value:string, max=8):string[]{
 const input=value.trim();
 if(input.length===0||input.length>80||!/^[A-Za-z0-9()]+$/.test(input))return [];
 try{parseFormula(input);return [input];}catch{/* explore spellings */}
 const results=new Set<string>();
 const symbols=Object.keys(atomicWeights).sort((a,b)=>b.length-a.length);
 let visits=0;
 function walk(pos:number, built:string):void{
  if(results.size>=max || ++visits>2000)return;
  if(pos===input.length){
   try{parseFormula(built);results.add(built);}catch{/* invalid resulting formula */}
   return;
  }
  const char=input[pos];
  if(/[0-9()]/.test(char)){walk(pos+1,built+char);return;}
  for(const sym of symbols){
   if(input.slice(pos,pos+sym.length).toLowerCase()===sym.toLowerCase())walk(pos+sym.length,built+sym);
  }
 }
 walk(0,'');
 return [...results];
}
