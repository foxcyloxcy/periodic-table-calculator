/* eslint-disable @typescript-eslint/no-require-imports */
const {test,expect}=require('@playwright/test');
const ROOT='http://127.0.0.1:4173/periodic-table-calculator/';

async function mockSalt(page){
 await page.route('**/rest/pug/**',route=>{
  const url=route.request().url();
  const body=url.includes('/cids/JSON')?{IdentifierList:{CID:[5234]}}:
   {PropertyTable:{Properties:[{CID:5234,Title:'Sodium Chloride',MolecularFormula:'ClNa',Charge:0,IsotopeAtomCount:0}]}};
  return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
}

for(const viewport of [{width:1280,height:800},{width:390,height:844}]){
 test(`NaCl identity and one-click formula reset at ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);await mockSalt(page);await page.goto(ROOT);
  const input=page.getByLabel('Chemical formula',{exact:true});
  await input.fill('NaCl');await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await expect(page.getByRole('heading',{name:'58.4400 g/mol'})).toBeVisible();
  await expect(page.getByText('Sodium Chloride',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'PubChem CID 5234',exact:true})).toHaveAttribute('href','https://pubchem.ncbi.nlm.nih.gov/compound/5234');
  await expect(page.getByText('COMPOUND NAME NOT VERIFIED',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Select identity',exact:true}).click();
  await page.getByRole('button',{name:'Clear formula',exact:true}).click();
  await expect(input).toHaveValue('');await expect(input).toBeFocused();
  await expect(page.locator('.result')).toHaveCount(0);
  await input.fill('co');await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await expect(page.getByRole('region',{name:'Capitalization alternatives'})).toBeVisible();
  await page.getByRole('button',{name:'Clear formula',exact:true}).click();
  await expect(page.locator('.error[role=alert]')).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Capitalization alternatives'})).toHaveCount(0);
  await input.fill('H2O');await page.getByRole('button',{name:'Calculate',exact:true}).click();
  await expect(page.getByRole('heading',{name:'18.0150 g/mol'})).toBeVisible();
 });
}

test('clear search cancels in-flight work without repopulating errors or results',async({page})=>{
 await page.route('**/rest/pug/**',async route=>{
  await new Promise(resolve=>setTimeout(resolve,300));
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({IdentifierList:{CID:[]}})});
 });
 await page.route('**/w/api.php?*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({search:[]})}));
 await page.goto(ROOT);
 const input=page.getByLabel('Name or material',{exact:true});
 await input.fill('salt');await page.getByRole('button',{name:'Search',exact:true}).click();
 await page.getByRole('button',{name:'Clear search',exact:true}).click();
 await expect(input).toHaveValue('');await expect(input).toBeFocused();
 await page.waitForTimeout(600);
 await expect(page.locator('.error[role=alert]')).toHaveCount(0);
 await expect(page.locator('.unified-results')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Search',exact:true})).toBeDisabled();
});

test('identity timeout ends loading and preserves the calculated mass',async({page})=>{
 await page.route('**/rest/pug/**',()=>{});
 await page.goto(ROOT);
 await page.clock.install();
 await page.getByLabel('Chemical formula',{exact:true}).fill('NaCl');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();
 await page.clock.fastForward(12001);
 await expect(page.getByText(/Compound identity search timed out/)).toBeVisible();
 await expect(page.getByText(/Looking up names from PubChem/)).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'58.4400 g/mol'})).toBeVisible();
});

test('live NaCl formula lookup retains sodium chloride',{tag:'@live'},async({page})=>{
 await page.goto(ROOT);
 await page.getByLabel('Chemical formula',{exact:true}).fill('NaCl');
 await page.getByRole('button',{name:'Calculate',exact:true}).click();
 await expect(page.getByText('Sodium Chloride',{exact:true})).toBeVisible({timeout:15000});
 await expect(page.getByRole('heading',{name:'58.4400 g/mol'})).toBeVisible();
});
