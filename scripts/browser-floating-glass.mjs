import { readFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';

const css = await readFile('public/styles.css', 'utf8');
const renderer = (await readFile('src/client/navbar-glass.js', 'utf8')).replaceAll('export function', 'function');
const output = 'output/playwright';
await mkdir(output, { recursive: true });
const hosts = ['navbar', 'chat-start', 'chat-end', 'expand-composer'];
const rows = Array.from({ length: 60 }, (_, index) => `<div class="scene-row"><span>Optical scene ${index}</span><span>Curved edge ${index}</span><span>Visible text ${index}</span><span>Clear centre ${index}</span></div>`).join('');
// Every source is synthetic. This isolated page never contacts the application,
// authenticates, loads a conversation, or calls a provider.
const scene = `<style>${css}
#main{position:relative;margin:0;padding:0;width:100%;max-width:none;min-height:2600px}
.scene-row{height:43px;display:grid;grid-template-columns:repeat(4,1fr);align-items:center;font-size:20px;line-height:1.1;overflow:hidden;background:var(--surface);color:var(--ink)}
.scene-row:nth-child(even){background:var(--blue-light);color:var(--canvas)}
.scene-row span:nth-child(even){background:var(--yellow);color:var(--canvas)}
#reading-actions{position:fixed;left:calc(50% - 130px);bottom:90px;width:260px;margin:0;padding:0;z-index:15;justify-content:center}
#expand-composer{min-height:44px;border-radius:24px;width:250px}
#control-fixture{position:fixed;left:calc(50% - 130px);top:94px;width:260px;height:62px;display:none;z-index:1}
#control-fixture input,#control-fixture textarea,#control-fixture select{position:absolute;inset:0;margin:0;width:100%;height:100%;background:#ad4d40;border:2px solid #ffffff;border-radius:4px}
</style><header class="navbar"><button class="brand">NanoDuck</button><nav class="desktop-nav"><button>Discussion</button><button>Settings</button></nav></header>
<main id="main">${rows}<div class="chat-jumps" role="group" aria-label="Chat navigation"><button id="chat-start" data-liquid-glass aria-label="Go to beginning of chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></button><button id="chat-end" data-liquid-glass aria-label="Go to end of chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14m-6-6 6 6 6-6"/></svg></button></div>
<div id="reading-actions" class="reading-actions"><button id="expand-composer" class="secondary" data-liquid-glass>Continue conversation</button></div><div id="control-fixture"><input hidden value="Synthetic input original"><textarea hidden>Synthetic textarea original</textarea><select hidden><option>Synthetic option original</option><option>Synthetic option changed</option></select></div></main>`;

for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  try {
    await page.setContent(scene);
    await page.addScriptTag({ content: `
window.fixtureAllowed=true;window.fixtureFrames=0;window.fixtureContexts=[];
const originalFrame=window.requestAnimationFrame;
window.requestAnimationFrame=callback=>{fixtureFrames++;return originalFrame(callback)};
const originalContext=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(...args){
  const ctx=originalContext.apply(this,args);
  if(ctx&&args[0]==='2d'&&!fixtureContexts.some(entry=>entry.canvas===this))fixtureContexts.push({canvas:this,ctx});
  return ctx;
};
${renderer}
window.glass=createLiquidGlass({allowed:()=>fixtureAllowed});
window.glassSnapshot=()=>Array.from(document.querySelectorAll('.glass-lens'),canvas=>{
  const ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let hash=2166136261,edge=0;
  for(let i=0;i<pixels.length;i++){hash=Math.imul(hash^pixels[i],16777619)>>>0;if(i%4===3&&pixels[i]>0)edge++}
  const index=fixtureContexts.findIndex(entry=>entry.canvas===canvas),source=fixtureContexts[index+1];
  let refracted=0;
  if(source&&source.canvas.width>canvas.width){
    const bleed=(source.canvas.width-canvas.width)/2,raw=source.ctx.getImageData(0,0,source.canvas.width,source.canvas.height).data;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
      const to=(y*canvas.width+x)*4,from=((y+bleed)*source.canvas.width+x+bleed)*4;
      if(pixels[to+3]>140&&Math.abs(pixels[to]-raw[from])+Math.abs(pixels[to+1]-raw[from+1])+Math.abs(pixels[to+2]-raw[from+2])>45)refracted++;
    }
  }
  return{id:canvas.parentElement.id||'navbar',width:canvas.width,height:canvas.height,hash,edge,refracted,
    center:ctx.getImageData(Math.floor(canvas.width/2),Math.floor(canvas.height/2),1,1).data[3]};
});
window.glassBuffersClear=()=>fixtureContexts.every(({canvas,ctx})=>!ctx.getImageData(0,0,canvas.width,canvas.height).data.some(value=>value!==0));
` });
    const snapshot = () => page.evaluate(() => glassSnapshot());
    const hashes = async () => Object.fromEntries((await snapshot()).map(item => [item.id, item.hash]));
    await page.waitForTimeout(160);
    const first = await snapshot();
    assert.deepEqual(first.map(item => item.id), hosts);
    for (const lens of first) {
      assert.ok(lens.edge > 0, `${name}: ${lens.id} edge must contain pixels`);
      assert.equal(lens.center, 0, `${name}: ${lens.id} centre must remain transparent`);
      assert.ok(lens.refracted > 0, `${name}: ${lens.id} edge must displace source colours`);
    }
    for (const id of ['chat-start', 'chat-end']) {
      const box = await page.locator(`#${id}`).boundingBox();
      assert.equal(box.width, 44); assert.equal(box.height, 44);
      assert.equal(box.x + box.width / 2, 640);
    }
    await page.screenshot({ path: `${output}/${name}-floating-glass-dark.png` });
    for (const [id, label, padding] of [['chat-start', 'arrow', 30], ['expand-composer', 'continue', 20]]) {
      const box = await page.locator(`#${id}`).boundingBox();
      await page.screenshot({ path: `${output}/${name}-floating-glass-${label}.png`, clip: { x: box.x-padding, y: box.y-padding, width: box.width+padding*2, height: box.height+padding*2 } });
    }
    const frames = await page.evaluate(() => fixtureFrames);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => fixtureFrames), frames, `${name}: no perpetual observer repaint loop`);
    await page.locator('.glass-lens').evaluateAll(canvases => canvases.forEach(canvas => canvas.setAttribute('data-fixture-decoration', 'changed')));
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => fixtureFrames), frames, `${name}: decorative canvas attributes must not trigger rendering`);

    const unchanged = await hashes();
    await page.locator('#expand-composer').evaluate(host => { host.lastChild.textContent='Native changed label'; host.style.background='#ff0070'; });
    await page.waitForTimeout(100);
    assert.deepEqual(await hashes(), unchanged, `${name}: lens hosts and native controls must never sample themselves`);
    await page.locator('#expand-composer').evaluate(host => { host.lastChild.textContent='Continue conversation'; host.style.removeProperty('background'); });
    await page.waitForTimeout(80);

    const dark = await hashes();
    await page.evaluate(() => document.documentElement.dataset.theme='light');
    await page.waitForTimeout(100);
    const light = await hashes();
    for (const id of hosts) assert.notEqual(light[id], dark[id], `${name}: ${id} must update for theme changes`);
    await page.screenshot({ path: `${output}/${name}-floating-glass-light.png` });
    await page.locator('.scene-row').evaluateAll(rows => rows.forEach((row,index) => row.style.background=index%2?'#ffbb22':'#3b7e68'));
    await page.waitForTimeout(100);
    const changedScene = await hashes();
    for (const id of hosts) assert.notEqual(changedScene[id], light[id], `${name}: ${id} must update when the scene changes`);
    await page.evaluate(() => scrollTo(0,97));
    await page.waitForTimeout(100);
    const scrolled = await hashes();
    for (const id of hosts) assert.notEqual(scrolled[id], changedScene[id], `${name}: ${id} must update on scrolling`);

    const beforeMutation = await hashes();
    const mutation = await page.evaluate(async () => { document.querySelector('#main').dataset.status='changed'; await Promise.resolve(); return glassSnapshot(); });
    assert.deepEqual(Object.fromEntries(mutation.map(item=>[item.id,item.hash])), beforeMutation, `${name}: retain the old frame until replacement is ready`);
    await page.locator('#chat-start').evaluate(host => host.hidden=true);
    await page.waitForTimeout(80);
    assert.equal((await snapshot()).find(item=>item.id==='chat-start').edge,0, `${name}: hidden host clears previous pixels`);
    await page.locator('#chat-start').evaluate(host => host.hidden=false);
    await page.waitForTimeout(80);
    assert.ok((await snapshot()).find(item=>item.id==='chat-start').edge>0, `${name}: shown host renders again`);

    await page.evaluate(() => { scrollTo(0,0); document.querySelector('#control-fixture').style.display='block'; });
    for (const tag of ['input', 'textarea', 'select']) {
      await page.locator('#control-fixture').evaluate((fixture,tag)=>fixture.querySelectorAll('input,textarea,select').forEach(control=>control.hidden=control.tagName.toLowerCase()!==tag),tag);
      await page.waitForTimeout(80);
      const privateOriginal = await hashes();
      await page.locator(`#control-fixture ${tag}`).evaluate(control => {
        if(control.tagName==='SELECT') control.selectedIndex=1;
        else control.value='Synthetic changed private value';
        if(control.tagName==='TEXTAREA') control.textContent='Synthetic changed textarea children';
        glass.refresh();
      });
      await page.waitForTimeout(80);
      assert.deepEqual(await hashes(),privateOriginal, `${name}: ${tag} values and children must remain unsampled`);
      await page.locator(`#control-fixture ${tag}`).evaluate(control=>control.style.background='#3dc754');
      await page.waitForTimeout(80);
      assert.notEqual((await hashes())['chat-start'],privateOriginal['chat-start'], `${name}: ${tag} visible background should be sampled`);
    }
    await page.evaluate(()=>document.querySelector('#control-fixture').style.display='none');
    await page.waitForTimeout(80);
    await page.setViewportSize({ width:390,height:800 });
    await page.waitForTimeout(100);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name}: no narrow-screen overflow`);
    for (const id of ['chat-start','chat-end']) {
      const box=await page.locator(`#${id}`).boundingBox();
      assert.equal(box.width,44);assert.equal(box.height,44);assert.equal(box.x+22,195);
    }
    await page.screenshot({ path:`${output}/${name}-floating-glass-narrow.png` });
    await page.evaluate(()=>{fixtureAllowed=false;glass.clear()});
    assert.ok(await page.evaluate(()=>glassBuffersClear()),`${name}: synchronous privacy clear must erase all target and source buffers`);
    await page.evaluate(()=>{glass.refresh();scrollTo(0,140)});
    await page.waitForTimeout(80);
    assert.ok(await page.evaluate(()=>glassBuffersClear()),`${name}: denied rendering cannot repopulate buffers`);
    await page.evaluate(()=>{fixtureAllowed=true;glass.refresh()});
    await page.waitForTimeout(80);
    assert.ok((await snapshot()).every(item=>item.edge>0),`${name}: eligible rendering resumes`);
    await page.emulateMedia({ forcedColors:'active' });
    await page.waitForTimeout(80);
    assert.ok(await page.evaluate(()=>glassBuffersClear()),`${name}: forced colours clear all target/source buffers`);
    console.log(`${name}: four optical edges, clear centres, geometry, scene/theme/scroll updates, self-exclusion, form privacy, hidden-host clearing, synchronous all-buffer clearing, forced colours and narrow layout passed`);
  } finally { await browser.close(); }
}
