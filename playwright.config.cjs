/* eslint-disable @typescript-eslint/no-require-imports */
const {defineConfig,devices}=require('@playwright/test');
module.exports=defineConfig({testDir:'./e2e',timeout:45000,retries:1,reporter:'list',projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],use:{trace:'retain-on-failure',screenshot:'only-on-failure'}});
