// A local, disposable optical surface. Only the narrow visible page strip is
// painted; form values are never sampled and no pixels leave this document.
export function createNavbarGlass({ allowed = () => true } = {}) {
  const bar = document.querySelector('.navbar');
  if (!bar) return { clear() {} };
  const canvas = document.createElement('canvas');
  canvas.className = 'navbar-lens'; canvas.setAttribute('aria-hidden', 'true');
  bar.prepend(canvas);
  const target = canvas.getContext('2d');
  const source = document.createElement('canvas'); const ctx = source.getContext('2d', { willReadFrequently: true });
  if (!target || !ctx) return { clear() {} };
  const reduced = matchMedia('(prefers-reduced-transparency: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  let frame = 0;
  const clear = () => { cancelAnimationFrame(frame); frame = 0; target.clearRect(0, 0, canvas.width, canvas.height); ctx.clearRect(0, 0, source.width, source.height); };
  const intersects = (a, b) => a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
  const paint = (element, strip) => {
    if (element.hidden || element.matches('input,textarea,select,script,style,canvas,video,[aria-hidden="true"]')) return;
    const box = element.getBoundingClientRect();
    if (!intersects(box, strip)) return;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0) return;
    ctx.save(); ctx.globalAlpha *= Number(style.opacity);
    if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = style.backgroundColor; ctx.beginPath();
      ctx.roundRect(box.left-strip.left, box.top-strip.top, box.width, box.height, Math.min(parseFloat(style.borderRadius)||0,box.width/2,box.height/2)); ctx.fill();
    }
    if (element instanceof HTMLImageElement && element.complete && element.naturalWidth) {
      const url = new URL(element.currentSrc || element.src, location.href);
      if (url.origin === location.origin || url.protocol === 'data:') {
        ctx.drawImage(element,box.left-strip.left,box.top-strip.top,box.width,box.height);
      }
    }
    // Render actual visible text with its computed font and browser-measured
    // positions. The centre is transparent; only this edge sample is refracted.
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color; ctx.textBaseline = 'alphabetic';
    const range = document.createRange();
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) { paint(child, strip); continue; }
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) continue;
      range.selectNodeContents(child);
      if (![...range.getClientRects()].some(rect => intersects(rect,strip))) continue;
      // Character ranges preserve wrapping, tables, links and mixed scripts.
      for (let index=0; index<child.length;) {
        const text = String.fromCodePoint(child.textContent.codePointAt(index));
        range.setStart(child,index); range.setEnd(child,index+text.length); index+=text.length;
        const rect = range.getBoundingClientRect(); if (!intersects(rect,strip) || !text.trim()) continue;
        const metrics=ctx.measureText(text); const ascent=metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize)*.8;
        const descent=metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize)*.2;
        ctx.fillText(text,rect.left-strip.left,rect.top-strip.top+(rect.height-ascent-descent)/2+ascent);
      }
    }
    ctx.restore();
  };
  const render = () => {
    frame=0;
    if (!allowed() || document.hidden || reduced.matches || contrast.matches) { clear(); return; }
    const box=bar.getBoundingClientRect(); const width=Math.round(box.width),height=Math.round(box.height);
    if (!width || !height) return;
    const bleed=24;
    if (canvas.width!==width || canvas.height!==height) { canvas.width=width;canvas.height=height;source.width=width+bleed*2;source.height=height+bleed*2; }
    ctx.clearRect(0,0,source.width,source.height);
    ctx.fillStyle=getComputedStyle(document.documentElement).backgroundColor; ctx.fillRect(0,0,source.width,source.height);
    const strip={left:box.left-bleed,top:box.top-bleed,right:box.right+bleed,bottom:box.bottom+bleed};
    for (const root of document.querySelectorAll('.workspace-actions,#main')) paint(root,strip);
    const pixels=ctx.getImageData(0,0,source.width,source.height); const output=target.createImageData(width,height);
    const radius=Math.min(height/2,parseFloat(getComputedStyle(bar).borderRadius)||40);
    const band=Math.min(17,height*.26);
    for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
      const cx=Math.max(radius,Math.min(width-radius,x+.5)),cy=Math.max(radius,Math.min(height-radius,y+.5));
      const dx=x+.5-cx,dy=y+.5-cy,len=Math.hypot(dx,dy);
      // Signed distance to a rounded rectangle and its outward normal.
      const depth=radius-len;
      if(depth<0 || depth>band || !len) continue;
      const t=1-depth/band;
      const bend=15*Math.sin(t*Math.PI*.85);
      const sx=Math.max(0,Math.min(source.width-1.001,x+bleed-dx/len*bend));
      const sy=Math.max(0,Math.min(source.height-1.001,y+bleed-dy/len*bend));
      const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,to=(y*width+x)*4;
      const from=(iy*source.width+ix)*4;
      for(let channel=0;channel<3;channel++) output.data[to+channel]=
        pixels.data[from+channel]*(1-fx)*(1-fy)+pixels.data[from+4+channel]*fx*(1-fy)+
        pixels.data[from+source.width*4+channel]*(1-fx)*fy+pixels.data[from+source.width*4+4+channel]*fx*fy;
      output.data[to+3]=Math.round(255*Math.min(1,depth/1.5)*Math.min(1,(band-depth)/3));
    }
    target.putImageData(output,0,0);
  };
  const schedule=()=>{ if(!frame) frame=requestAnimationFrame(()=>{try{render();}catch{clear();}}); };
  window.addEventListener('scroll',schedule,{passive:true}); window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{clear();if(!document.hidden)schedule();});
  reduced.addEventListener('change',schedule);contrast.addEventListener('change',schedule);
  const observer=new MutationObserver(()=>{clear();schedule();});
  for(const root of document.querySelectorAll('.workspace-actions,#main')) observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true});
  new ResizeObserver(schedule).observe(bar);
  document.fonts?.ready.then(schedule);schedule();
  return { clear, refresh:schedule };
}
