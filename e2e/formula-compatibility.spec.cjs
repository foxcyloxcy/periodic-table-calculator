/* eslint-disable @typescript-eslint/no-require-imports */
const {test,expect}=require('@playwright/test');
const snapshot=require('../src/lib/chemistry/__fixtures__/pubchem-formula-compatibility.json');
const ROOT='http://127.0.0.1:4173/periodic-table-calculator/';
async function providers(page){
 await page.route('**/rest/pug/**',route=>{
  const url=new URL(route.request().url());const path=decodeURIComponent(url.pathname);
  let rows=[];
  const formula=/\/fastformula\/([^/]+)\/cids/.exec(path);
  const name=/\/name\/([^/]+)\/cids/.exec(path);
  if(formula)rows=snapshot.records.filter(x=>x.record.MolecularFormula===formula[1]);
  if(name)rows=snapshot.records.filter(x=>x.query===name[1]);
  if(formula||name)return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({IdentifierList:{CID:rows.map(x=>x.record.CID)}})});
  const ids=/\/cid\/([^/]+)\/property\//.exec(path);
  if(ids)rows=snapshot.records.filter(x=>ids[1].split(',').includes(String(x.record.CID)));
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({PropertyTable:{Properties:rows.map(x=>x.record)}})});
 });
 await page.route('**/w/api.php?*',route=>route.fulfill({status:200,contentType:'application/json',body:'{"search":[]}'}));
}
for(const width of [1280,390]){
 test(`published formula variants resolve through the whole UI at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});await providers(page);await page.goto(ROOT);
  for(const [formula,title,mass] of [['H₂O','Water','18.0150'],['Ca(OH)₂','Calcium Hydroxide','74.0920'],['Al₂(SO₄)₃','Aluminum Sulfate','342.1320'],['NaHCO₃','Sodium Bicarbonate','84.0060']]){
   await page.getByLabel('Chemical formula',{exact:true}).fill(formula);
   await page.getByRole('button',{name:'Calculate',exact:true}).click();
   await expect(page.getByRole('heading',{name:mass+' g/mol'})).toBeVisible();
   await expect(page.locator('.formula-identities').getByText(title,{exact:true})).toBeVisible();
   await expect(page.locator('.result')).toContainText('Input formatting: '+formula+' →');
   await page.getByRole('button',{name:'Clear formula',exact:true}).click();
   await expect(page.locator('.result')).toHaveCount(0);
  }
 });
}
test('named compound selection preserves the sourced record and computes separately',async({page})=>{
 await providers(page);await page.goto(ROOT);
 await page.getByLabel('Chemical formula',{exact:true}).fill('co');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();
 await expect(page.getByRole('region',{name:'Capitalization alternatives'})).toBeVisible();
 await page.getByLabel('Name or material',{exact:true}).fill('calcium hydroxide');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await page.getByRole('button',{name:'Use this compound',exact:true}).click();
 await expect(page.getByRole('heading',{name:'74.0920 g/mol'})).toBeVisible();
 await expect(page.locator('.result')).toContainText('NAME SEARCH RESULT — PUBCHEM');
 await expect(page.getByRole('region',{name:'Capitalization alternatives'})).toHaveCount(0);
 await page.getByRole('button',{name:'Clear formula',exact:true}).click();
 await expect(page.locator('.result')).toHaveCount(0);
});
test('isomers remain explicit choices with equal calculated mass',async({page})=>{
 await providers(page);await page.goto(ROOT);
 await page.getByLabel('Chemical formula',{exact:true}).fill('C₂H₆O');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();
 const identities=page.locator('.formula-identities');
 await expect(identities.getByText('Ethanol',{exact:true})).toBeVisible();
 await expect(identities.getByText('Dimethyl Ether',{exact:true})).toBeVisible();
 await expect(identities.locator('button[aria-pressed=true]')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'46.0690 g/mol'})).toBeVisible();
});
test('unsupported notation explains the gap without making a provider request or numeric result',async({page})=>{
 let requests=0;page.on('request',r=>{if(r.url().includes('/rest/pug/'))requests++;});
 await page.goto(ROOT);
 for(const [formula,message] of [['CuSO4·5H2O','Hydrates'],['NH4+','Charged ions'],['¹³CH4','Superscript'],['[Fe(CN)6]','Square-bracket']]){
  await page.getByLabel('Chemical formula',{exact:true}).fill(formula);
  await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await expect(page.locator('.error[role=alert]')).toContainText(message);
  await expect(page.locator('.result')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Possible intended formulas'})).toHaveCount(0);
 }
 expect(requests).toBe(0);
});
for(const mode of ['rate_limit','malformed','offline']){
 test(`lookup ${mode} leaves the formula-derived mass available`,async({page})=>{
  await page.route('**/rest/pug/**',route=>mode==='offline'?route.abort('failed'):route.fulfill({status:mode==='rate_limit'?429:200,contentType:'application/json',body:'{}'}));
  await page.goto(ROOT);await page.getByLabel('Chemical formula',{exact:true}).fill('Ca(OH)₂');
  await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await expect(page.getByRole('heading',{name:'74.0920 g/mol'})).toBeVisible();
  await expect(page.locator('.formula-identities')).toHaveAttribute('data-status','unavailable');
 });
}
test('live grouped formula lookup finds calcium hydroxide',{tag:'@live'},async({page})=>{
 await page.goto(ROOT);await page.getByLabel('Chemical formula',{exact:true}).fill('Ca(OH)₂');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();
 await expect(page.locator('.formula-identities').getByRole('link',{name:'PubChem CID 6093208',exact:true})).toBeVisible({timeout:15000});
 await expect(page.getByRole('heading',{name:'74.0920 g/mol'})).toBeVisible();
});
