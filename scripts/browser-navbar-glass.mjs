import {readFile,mkdir} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const {chromium,firefox,webkit}=await import(pathToFileURL(`${process.cwd()}/node_modules/playwright/index.mjs`));const css=await readFile('public/styles.css','utf8'),js=await readFile('src/client/navbar-glass.js','utf8');await mkdir('output/playwright',{recursive:true});
for(const[name,engine]of Object.entries({chromium,firefox,webkit})){
const browser=await engine.launch(),page=await browser.newPage({viewport:{width:1280,height:800}});
await page.setContent(`<style>${css}#main{margin:0;width:100%;height:1600px;display:flex;align-items:stretch}.stripe{width:10%;min-width:0;overflow:hidden;height:1600px} .stripe p{margin-top:18px;font-size:25px}</style><header class="navbar"><button class="brand">NanoDuck</button><nav class="desktop-nav"><button>Discussion</button><button>Settings</button></nav></header><main id="main">${Array.from({length:10},(_,i)=>`<div class="stripe" style="background:${i%2?'#e5a728':'#167b80'}"><p>Live text ${i}</p></div>`).join('')}</main>`);
await page.addScriptTag({content:js.replace('export function','function')+';window.lens=createNavbarGlass();'});await page.waitForTimeout(150);
const first=await page.locator('.navbar-lens').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data));assert.ok(first.some((v,i)=>i%4===3&&v>0));
assert.equal(await page.locator('.navbar-lens').evaluate(c=>c.getContext('2d').getImageData(Math.floor(c.width/2),Math.floor(c.height/2),1,1).data[3]),0);
await page.screenshot({path:`output/playwright/${name}-refraction.png`});
await page.locator('.stripe').first().evaluate(el=>el.style.background='#ff2200');await page.waitForTimeout(100);const second=await page.locator('.navbar-lens').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data));assert.notDeepEqual(first,second);
await page.evaluate(()=>scrollTo(0,100));await page.waitForTimeout(100);const scrolled=await page.locator('.navbar-lens').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data));assert.notDeepEqual(second,scrolled);
await page.locator('.brand').click();await page.setViewportSize({width:390,height:800});await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
// Settings surfaces must refract, while private values remain unsampled.
await page.evaluate(()=>{scrollTo(0,0);const main=document.querySelector('#main');main.innerHTML='<section id="settings-page"><textarea style="position:fixed;left:30px;top:15px;width:320px;height:90px;background:rgb(210,30,50);border:2px solid white">Private original</textarea></section>';});
await page.waitForTimeout(100);
const settings=await page.locator('.navbar-lens').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data));
await page.locator('textarea').evaluate(el=>{el.value='Different secret';window.lens.refresh();});await page.waitForTimeout(100);
assert.deepEqual(settings,await page.locator('.navbar-lens').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data)));
await page.locator('textarea').evaluate(el=>el.style.background='rgb(20,200,70)');await page.waitForTimeout(100);
assert.notDeepEqual(settings,await page.locator('.navbar-lens').evaluate(c=>Array.from(c.getContext('2d').getImageData(0,0,c.width,c.height).data)));
await page.evaluate(()=>window.lens.clear());assert.equal(await page.locator('.navbar-lens').evaluate(c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some(v=>v!==0)),false);
await browser.close();console.log(`${name}: painted lens, live update, controls, mobile reflow, synchronous clearing passed`);
}
