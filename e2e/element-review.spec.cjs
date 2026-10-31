/* eslint-disable @typescript-eslint/no-require-imports */
const {test,expect}=require('@playwright/test');
const ROOT='http://127.0.0.1:4173/periodic-table-calculator/';
test('NIST neutral ground state evidence is visible for gold and does not replace existing value',async({page})=>{
 await page.goto(ROOT);
 await page.getByRole('button',{name:'Gold, atomic number 79'}).click();
 const section=page.getByRole('region',{name:'Systematic NIST and RSC scientific comparisons'});
 await expect(section).toContainText('NIST neutral configurations: 92 of 92 match');
 await expect(section).toContainText('[Xe] 4f14 5d10 6s1');
 await expect(section).toContainText('Source: NIST Atomic Reference Data');
 await expect(section).toContainText('Not checked against RSC 20 °C source in this batch');
});
test('Mercury Pauling discrepancy and 20 C source context appear in element detail',async({page})=>{
 await page.goto(ROOT);
 await page.getByRole('button',{name:'Mercury, atomic number 80'}).click();
 const section=page.getByRole('region',{name:'Systematic NIST and RSC scientific comparisons'});
 await expect(section).toContainText('Current display: 2 · Reference: 1.9');
 await expect(section).toContainText('20 °C; pressure not specified');
 await expect(section).toContainText('disagreement');
});
test('Oganesson predictions remain qualified and are outside 92-element NIST table',async({page})=>{
 await page.goto(ROOT);
 await page.getByRole('button',{name:'Oganesson, atomic number 118'}).click();
 const section=page.getByRole('region',{name:'Systematic NIST and RSC scientific comparisons'});
 await expect(section).toContainText('predicted not measured');
 await expect(section).toContainText('No independent comparison has been performed');
});
