'use client';
import { useMemo, useState } from 'react';
import PeriodicTable from '@/components/PeriodicTable';
import UnifiedSearch from '@/components/UnifiedSearch';
import FormulaIdentities from '@/components/FormulaIdentities';
import {caseFormulaCandidates} from '@/lib/chemistry/formula-case';
import {normalizeFormulaNotation} from '@/lib/chemistry/formula-notation';
import type { PubChemCandidate } from '@/lib/chemistry/material-lookup';
import { appendElementToFormula, compactRepeatedSymbols, suggestFormulaAlternatives } from '@/lib/chemistry/formula-assistance';
import { calculateMolarMass, FormulaError, type MolarMassResult } from '@/lib/chemistry/calculator';
export default function Home() {
 const [formula,setFormula]=useState('H2O');
 const [result,setResult]=useState<MolarMassResult|null>(null);
 const [error,setError]=useState('');
 const [pending,setPending]=useState(false);
 const [needsConfirmation,setNeedsConfirmation]=useState(false);
 const [caseChoices,setCaseChoices]=useState<string[]>([]);
 const [chosenMaterial,setChosenMaterial]=useState<PubChemCandidate|null>(null);
 const suggestions=useMemo(()=>suggestFormulaAlternatives(formula),[formula]);
 function clearFormula(){
  setFormula('');setResult(null);setError('');setPending(false);
  setNeedsConfirmation(false);setCaseChoices([]);setChosenMaterial(null);
  document.getElementById('formula')?.focus();
 }
 function calculate(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault(); setPending(true); setError(''); setResult(null);
  const choices=caseFormulaCandidates(formula);
  if(choices.length>1){setCaseChoices(choices);setError('This capitalization can mean more than one formula. Choose the intended element symbols.');setPending(false);return;}
  if(choices.length===1 && choices[0]!==normalizeFormulaNotation(formula)){setFormula(choices[0]);setCaseChoices([]);setError('');setResult(calculateMolarMass(choices[0]));setPending(false);return;}
  const compact=compactRepeatedSymbols(formula);
  if(compact && !needsConfirmation){setNeedsConfirmation(true);setError('This contains repeated symbols. Did you mean a formula with atom-count subscripts? Select a suggestion, or calculate exactly as entered.');setPending(false);return;}
  try { setResult(calculateMolarMass(formula)); }
  catch (err) { setError(err instanceof FormulaError ? err.message : 'Calculation failed.'); }
  finally { setPending(false); }
 }
 function appendSymbol(symbol: string) { setChosenMaterial(null);setCaseChoices([]);setFormula(previous => appendElementToFormula(previous,symbol)); setNeedsConfirmation(false); setResult(null); setError(''); document.getElementById('formula')?.focus(); }
 function chooseSuggestion(value:string){setCaseChoices([]);setChosenMaterial(null);setFormula(value);setNeedsConfirmation(false);setResult(null);setError('');document.getElementById('formula')?.focus();}
 function selectMaterial(candidate:PubChemCandidate){
  setChosenMaterial(candidate);setFormula(candidate.formula);setNeedsConfirmation(false);setCaseChoices([]);setError('');
  try {setResult(calculateMolarMass(candidate.formula));}
  catch(err){setResult(null);setError(err instanceof FormulaError?err.message:'Formula calculation is unavailable.');}
  document.getElementById('formula')?.focus();
 }
 return <main className="container">
  <header><p className="eyebrow">DETERMINISTIC CHEMISTRY ENGINE · MVP</p><h1>Element Calculator</h1><p>Explore all 118 elements, select one to inspect its properties, or enter a supported chemical formula to calculate molar mass. Selecting elements alone does not predict a reaction.</p></header>
  <UnifiedSearch onSelect={selectMaterial} />
  <PeriodicTable onAppendSymbol={appendSymbol} />
  <form onSubmit={calculate}><label htmlFor="formula">Chemical formula</label><div className="field"><input id="formula" value={formula} onChange={e=>{setCaseChoices([]);setChosenMaterial(null);setFormula(e.target.value);setNeedsConfirmation(false);setResult(null);setError('');}} maxLength={128} spellCheck={false} placeholder="e.g. Ca(OH)2" required/><button disabled={pending}>{pending?'Calculating…':'Calculate'}</button><button type="button" className="secondary-action" aria-label="Clear formula" onClick={clearFormula}>Clear</button></div></form>
  <p className="hint">Supports neutral formulas, nested parentheses and copied subscript digits: H₂O, Ca(OH)₂ or Al₂(SO₄)₃. Mass is calculated from CIAAW 2024 abridged atomic weights for 84 eligible elements; compound names are looked up separately from PubChem. Hydrates, charged ions, isotopes, square brackets and reaction equations are not yet supported.</p>
  <details className="formula-support"><summary>Supported inputs and reference sources</summary>
   <p>Use ordinary digits or copied subscripts for atom counts. Parentheses may be nested. Capitalization matters: Co is cobalt, while CO contains carbon and oxygen.</p>
   <p>For hydrates, charged ions or isotope labels, the calculator explains the unsupported notation without deleting parts of your formula. Some recognized elements have no standard atomic weight and need a separately supported isotope calculation.</p>
   <p>Atomic weights: <a href="https://www.ciaaw.org/abridged-atomic-weights.htm" target="_blank" rel="noreferrer">CIAAW 2024</a>. Compound candidates: <a href="https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest" target="_blank" rel="noreferrer">NIH PubChem</a> (internet required, up to eight records). A matching formula does not establish structure, phase or sample purity.</p>
  </details>
  {error&&<p role="alert" className="error">{error}</p>}
  {caseChoices.length>0&&<section className="formula-suggestions" aria-label="Capitalization alternatives"><p className="eyebrow">WHICH FORMULA DID YOU MEAN?</p><p className="hint">Chemical symbols are case-sensitive: Co and CO are different. Choose the intended formula.</p><ul>{caseChoices.map(choice=><li key={choice}><strong>{choice}</strong><button type="button" onClick={()=>chooseSuggestion(choice)}>Use this formula</button></li>)}</ul></section>}
  {suggestions.length>0 && <section className="formula-suggestions" aria-label="Possible intended formulas">
    <p className="eyebrow">DO YOU MEAN TO CALCULATE ONE OF THESE?</p>
    <p className="hint">Suggestions come from formula formatting and reviewed compound records, not predicted reactions or guaranteed corrections.</p>
    <ul>{suggestions.map(s=><li key={s.formula}>
      <span><strong>{s.formula}</strong> · {s.label}<span className="suggestion-note">{s.note}</span></span>
      <button type="button" onClick={()=>chooseSuggestion(s.formula)}>Use formula</button>
    </li>)}</ul>
    {needsConfirmation && <button type="button" className="secondary-action" onClick={()=>{setNeedsConfirmation(true);setError('');try{setResult(calculateMolarMass(formula));}catch(err){setError(err instanceof FormulaError?err.message:'Calculation failed.');}}}>Calculate exactly as entered</button>}
  </section>}
  {result&&<section aria-live="polite" className="result"><p className="eyebrow">COMPUTED RESULT</p><h2>{result.value.toFixed(4)} <small>{result.unit}</small></h2>
   {result.inputFormula!==result.formula&&<p className="hint">Input formatting: {result.inputFormula} → {result.formula}. Atom-count subscripts are converted to ordinary digits; element capitalization is preserved.</p>}
   {chosenMaterial && chosenMaterial.formula===result.formula && <div className="compound-identification">
     <p className="eyebrow">NAME SEARCH RESULT — PUBCHEM</p><h3>{chosenMaterial.name}</h3>
     <p className="hint">This is the PubChem record selected by the user; it is not proof of sample identity or purity. <a href={chosenMaterial.sourceUrl} target="_blank" rel="noreferrer">Source: PubChem CID {chosenMaterial.cid}</a></p>
   </div>}
   {chosenMaterial?.formula===result.formula?null:result.compoundName.status === 'verified' ?
     <div className="compound-identification">
       <p className="eyebrow">DOCUMENTED COMPOUND NAME</p>
       <h3>{result.compoundName.preferredName}</h3>
       {result.compoundName.commonNames.length > 0 && <p><strong>Also known as:</strong> {result.compoundName.commonNames.join(', ')}</p>}
       <p className="hint">{result.compoundName.note} <a href={result.compoundName.sourceUrl} target="_blank" rel="noreferrer">Reference: PubChem {result.compoundName.sourceId}</a></p>
     </div> : null
   }
   <FormulaIdentities formula={result.formula} />
   <p><strong>Formula:</strong> {result.formula}</p><p><strong>Method:</strong> {result.equation} = {result.value.toFixed(4)} g/mol</p><h3>Contributions</h3><ul>{result.steps.map(t=><li key={t.element}>{t.element}: {t.count} × {t.atomicWeight} = {t.contribution.toFixed(4)} g/mol</li>)}</ul><h3>Why?</h3><p>The molar mass is the sum of each element’s reference atomic weight multiplied by its atom count in the parsed formula.</p><p className="hint">Reference dataset: {result.datasetVersion}. {result.dataSource}. Values use CIAAW 2024 abridged standard atomic weights; isotope variability and uncertainty are not propagated into the displayed single-number total.</p></section>}
 </main>;
}
