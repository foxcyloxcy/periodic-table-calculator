/* eslint-disable @typescript-eslint/no-require-imports */
const {test,expect}=require('@playwright/test');
const ROOT='http://127.0.0.1:4173/periodic-table-calculator/';
async function mockProviders(page){
 await page.route('**/rest/pug/**',route=>{
  const url=route.request().url();
  let body={};
  if(url.includes('/caffeine/cids/JSON'))body={IdentifierList:{CID:[2519]}};
  if(url.includes('/cid/2519/property/MolecularFormula,Title/JSON'))body={PropertyTable:{Properties:[{CID:2519,Title:'Caffeine',MolecularFormula:'C8H10N4O2'}]}};
  if(url.includes('/cid/2519/property/XLogP,TPSA'))body={PropertyTable:{Properties:[{CID:2519,TPSA:61.8,XLogP:-0.1,HBondDonorCount:0,HBondAcceptorCount:6,RotatableBondCount:0}]}};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
 await page.route('**/w/api.php?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(route.request().url().includes('wbsearchentities')?{search:[]}:{entities:{}})}));
}
test('316 grade composition, conditions and density conversion',async({page})=>{
 await mockProviders(page);await page.goto(ROOT);
 await page.getByLabel('Name or material').fill('316 stainless steel');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByText('316 / UNS S31600')).toBeVisible();
 await expect(page.getByText('Thermal conductivity at 100 °C',{exact:false})).toBeVisible();
 await page.getByLabel('Property category').selectOption('mechanical');
 await expect(page.getByText('Minimum tensile strength',{exact:false})).toBeVisible();
 await page.getByLabel('Property category').selectOption('density');
 await page.getByLabel('Density in kg/m³').uncheck();
 await expect(page.getByText('Density: 8 g/cm³',{exact:false})).toBeVisible();
});
test('PubChem properties include explicit computed descriptors',async({page})=>{
 await mockProviders(page);await page.goto(ROOT);
 await page.getByLabel('Name or material').fill('caffeine');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByText('C8H10N4O2')).toBeVisible();
 await page.getByRole('button',{name:'Load compound properties'}).click();
 await expect(page.getByText('Topological polar surface area: 61.8 Å²')).toBeVisible();
 await expect(page.getByText(/Computed descriptor — not measured/).first()).toBeVisible();
});
test('live PubChem and Wikidata lookups',{tag:'@live'},async({page})=>{
 await page.goto(ROOT);
 await page.getByLabel('Name or material').fill('sugar');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByText('C12H22O11')).toBeVisible({timeout:30000});
 await page.getByLabel('Name or material').fill('steel');
 await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page.getByText('Wikidata Q11427',{exact:false})).toBeVisible({timeout:30000});
});
