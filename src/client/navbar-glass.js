// Local, disposable optical surfaces. Only visible page strips are painted;
// form values are never sampled and no pixels leave this document.
export function createLiquidGlass({ allowed = () => true } = {}) {
  const selector = '.navbar,[data-liquid-glass]';
  const rootsSelector = '.workspace-actions,#main';
  const surfaces = new Map();
  const reduced = matchMedia('(prefers-reduced-transparency: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  let frame = 0;
  let observer;
  let resizeObserver;
  const roots = new Set();
  const intersects = (a, b) => a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
  const eligible = () => {
    try { return allowed() && !document.hidden && !reduced.matches && !contrast.matches; }
    catch { return false; }
  };
  const clearSurface = surface => {
    surface.target?.clearRect(0, 0, surface.canvas.width, surface.canvas.height);
    surface.ctx?.clearRect(0, 0, surface.source.width, surface.source.height);
  };
  const clear = () => {
    cancelAnimationFrame(frame); frame = 0;
    for (const surface of surfaces.values()) clearSurface(surface);
  };
  const syncSurfaces = () => {
    const hosts = new Set(document.querySelectorAll(selector));
    for (const [host, surface] of surfaces) {
      if (hosts.has(host)) continue;
      clearSurface(surface); resizeObserver?.unobserve(host);
      surface.canvas.remove(); surfaces.delete(host);
    }
    for (const host of hosts) {
      if (surfaces.has(host)) continue;
      const canvas = document.createElement('canvas');
      canvas.className = host.matches('.navbar') ? 'glass-lens navbar-lens' : 'glass-lens';
      canvas.setAttribute('aria-hidden', 'true');
      host.classList.add('liquid-glass-surface'); host.prepend(canvas);
      const source = document.createElement('canvas');
      let target, ctx;
      try {
        target = canvas.getContext('2d');
        ctx = source.getContext('2d', { willReadFrequently: true });
      } catch { /* A failed host keeps its native controls and opaque fallback. */ }
      const surface = { host, canvas, source, target, ctx, navbar: host.matches('.navbar') };
      surfaces.set(host, surface);
      if (!target || !ctx) host.classList.add('liquid-glass-fallback');
      resizeObserver?.observe(host);
      // Hosts can sit outside the sampled roots, as the navbar does.
      observer?.observe(host, { attributes: true });
    }
  };
  const syncRoots = () => {
    const current = new Set(document.querySelectorAll(rootsSelector));
    for (const root of current) {
      if (!roots.has(root)) observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true });
    }
    roots.clear(); for (const root of current) roots.add(root);
  };
  const visibleBox = host => {
    if (!host.isConnected || host.closest('[hidden],[aria-hidden="true"]')) return null;
    const box = host.getBoundingClientRect();
    if (!Math.round(box.width) || !Math.round(box.height) ||
        !intersects(box, { left: 0, top: 0, right: innerWidth, bottom: innerHeight })) return null;
    const style = getComputedStyle(host);
    return style.display !== 'none' && style.visibility === 'visible' && Number(style.opacity) !== 0 ? box : null;
  };
  const paint = (element, strip, ctx) => {
    // Exclude every lens host, including its native labels and children. Floating
    // lenses live inside #main; sampling them would feed the optics into itself.
    if (element.hidden || element.matches('script,style,canvas,video,option,optgroup,[aria-hidden="true"],.liquid-glass-surface,[data-liquid-glass]')) return;
    const box = element.getBoundingClientRect();
    if (!intersects(box, strip)) return;
    const style = getComputedStyle(element);
    if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) === 0) return;
    ctx.save();
    try {
    ctx.globalAlpha *= Number(style.opacity);
    if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = style.backgroundColor; ctx.beginPath();
      ctx.roundRect(box.left-strip.left, box.top-strip.top, box.width, box.height, Math.min(parseFloat(style.borderRadius)||0,box.width/2,box.height/2)); ctx.fill();
    }
    // Reconstruct control surfaces, but never read values, selected options or
    // textarea text. Omitting their entire boxes left holes in Settings glass.
    const borderWidth = parseFloat(style.borderTopWidth);
    if (borderWidth > 0 && style.borderTopStyle === 'solid' &&
        style.borderTopWidth === style.borderRightWidth && style.borderTopWidth === style.borderBottomWidth && style.borderTopWidth === style.borderLeftWidth) {
      ctx.strokeStyle = style.borderTopColor; ctx.lineWidth = borderWidth;
      ctx.beginPath(); ctx.roundRect(box.left-strip.left+borderWidth/2, box.top-strip.top+borderWidth/2,
        Math.max(0,box.width-borderWidth), Math.max(0,box.height-borderWidth),
        Math.max(0,Math.min(parseFloat(style.borderRadius)||0,box.width/2,box.height/2)-borderWidth/2)); ctx.stroke();
    }
    if (element.matches('input,textarea,select')) return;
    if (element instanceof HTMLImageElement && element.complete && element.naturalWidth) {
      const url = new URL(element.currentSrc || element.src, location.href);
      if (url.origin === location.origin || url.protocol === 'data:') {
        ctx.drawImage(element,box.left-strip.left,box.top-strip.top,box.width,box.height);
      }
    }
    // Browser-measured character positions preserve wrapping and mixed scripts.
    // Only the rounded edge sample is refracted; the centre stays transparent.
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = style.color; ctx.textBaseline = 'alphabetic';
    const range = document.createRange();
    for (const child of element.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) { paint(child, strip, ctx); continue; }
      if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) continue;
      range.selectNodeContents(child);
      if (![...range.getClientRects()].some(rect => intersects(rect,strip))) continue;
      for (let index=0; index<child.length;) {
        const text = String.fromCodePoint(child.textContent.codePointAt(index));
        range.setStart(child,index); range.setEnd(child,index+text.length); index+=text.length;
        const rect = range.getBoundingClientRect(); if (!intersects(rect,strip) || !text.trim()) continue;
        const metrics=ctx.measureText(text); const ascent=metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize)*.8;
        const descent=metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize)*.2;
        ctx.fillText(text,rect.left-strip.left,rect.top-strip.top+(rect.height-ascent-descent)/2+ascent);
      }
    }
    } finally { ctx.restore(); }
  };
  const renderSurface = surface => {
    const { host, canvas, source, target, ctx, navbar } = surface;
    const box = visibleBox(host);
    if (!box || !target || !ctx) { clearSurface(surface); return; }
    const width=Math.round(box.width),height=Math.round(box.height);
    // Keep the navbar's verified optics. Small controls receive a narrower,
    // gentler edge so a 44px circle retains a substantial clear centre.
    const short=Math.min(width,height);
    const displacement=navbar ? 15 : Math.min(5,short*.12);
    const band=navbar ? Math.min(17,height*.26) : Math.min(6,short*.16);
    const bleed=navbar ? 24 : Math.ceil(displacement+4);
    const sourceWidth=width+bleed*2,sourceHeight=height+bleed*2;
    if (source.width!==sourceWidth || source.height!==sourceHeight) { source.width=sourceWidth;source.height=sourceHeight; }
    ctx.clearRect(0,0,source.width,source.height);
    ctx.fillStyle=getComputedStyle(document.documentElement).backgroundColor; ctx.fillRect(0,0,source.width,source.height);
    const strip={left:box.left-bleed,top:box.top-bleed,right:box.right+bleed,bottom:box.bottom+bleed};
    for (const root of roots) paint(root,strip,ctx);
    const pixels=ctx.getImageData(0,0,source.width,source.height); const output=target.createImageData(width,height);
    const radius=Math.min(width/2,height/2,parseFloat(getComputedStyle(host).borderRadius)||(navbar ? 40 : short/2));
    for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
      const cx=Math.max(radius,Math.min(width-radius,x+.5)),cy=Math.max(radius,Math.min(height-radius,y+.5));
      const dx=x+.5-cx,dy=y+.5-cy,len=Math.hypot(dx,dy);
      // Signed distance to a rounded rectangle and its outward normal.
      const depth=radius-len;
      if(depth<0 || depth>band || !len) continue;
      const t=1-depth/band;
      const bend=displacement*Math.sin(t*Math.PI*.85);
      const sx=Math.max(0,Math.min(source.width-1.001,x+bleed-dx/len*bend));
      const sy=Math.max(0,Math.min(source.height-1.001,y+bleed-dy/len*bend));
      const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy,to=(y*width+x)*4;
      const from=(iy*source.width+ix)*4;
      for(let channel=0;channel<3;channel++) output.data[to+channel]=
        pixels.data[from+channel]*(1-fx)*(1-fy)+pixels.data[from+4+channel]*fx*(1-fy)+
        pixels.data[from+source.width*4+channel]*(1-fx)*fy+pixels.data[from+source.width*4+4+channel]*fx*fy;
      output.data[to+3]=Math.round(255*Math.min(1,depth/1.5)*Math.min(1,(band-depth)/3));
    }
    // Prepare a replacement before changing the displayed buffer; ordinary DOM
    // updates must not blank a populated lens between animation frames.
    if (!eligible()) { clear(); return; }
    if (canvas.width!==width || canvas.height!==height) { canvas.width=width;canvas.height=height; }
    target.putImageData(output,0,0);
    if (host.classList.contains('liquid-glass-fallback')) host.classList.remove('liquid-glass-fallback');
  };
  const render = () => {
    frame=0;
    if (!eligible()) { clear(); return; }
    syncSurfaces(); syncRoots();
    for (const surface of surfaces.values()) {
      if (!eligible()) { clear(); return; }
      try { renderSurface(surface); }
      catch {
        clearSurface(surface);
        if (!surface.host.classList.contains('liquid-glass-fallback')) surface.host.classList.add('liquid-glass-fallback');
      }
    }
  };
  const schedule = () => {
    if (!eligible()) { clear(); return; }
    if (!frame) frame=requestAnimationFrame(render);
  };
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{clear();if(!document.hidden)schedule();});
  reduced.addEventListener('change',schedule); contrast.addEventListener('change',schedule);
  document.addEventListener('load',event=>{
    if (event.target instanceof HTMLImageElement && event.target.closest(rootsSelector)) schedule();
  },true);
  const decorativeMutation = record => {
    if (record.target instanceof Element && record.target.closest('canvas.glass-lens')) return true;
    if (record.type !== 'childList') return false;
    const nodes=[...record.addedNodes,...record.removedNodes];
    return nodes.length > 0 && nodes.every(node=>node instanceof Element && node.matches('canvas.glass-lens'));
  };
  observer=new MutationObserver(records=>{
    if (!eligible()) { clear(); return; }
    if (records.every(decorativeMutation)) return;
    for (const surface of surfaces.values()) if (!visibleBox(surface.host)) clearSurface(surface);
    schedule();
  });
  resizeObserver=new ResizeObserver(()=>{
    for (const surface of surfaces.values()) if (!visibleBox(surface.host)) clearSurface(surface);
    schedule();
  });
  syncSurfaces(); syncRoots();
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.fonts?.ready.then(schedule); schedule();
  return { clear, refresh:schedule };
}

// Existing fixtures and integrations can retain the original entry point.
export function createNavbarGlass(options = {}) { return createLiquidGlass(options); }
