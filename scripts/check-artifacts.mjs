import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
async function files(dir){const result=[];for(const e of await readdir(dir,{withFileTypes:true})){if(['.git','node_modules','review-session','.local'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory())result.push(...await files(p));else result.push(p);}return result;}
const errors=[];
for(const path of await files(root)){
  if(!/\.(md|html|css|js|mjs|json)$/.test(path))continue;
  const source=await readFile(path,'utf8');
  if(/\/Users\/[A-Za-z]/.test(source))errors.push(`${path}: local user path in publishable file`);
  if(path.endsWith('.md'))for(const m of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
    const target=m[1];if(/^(https?:|#|mailto:)/.test(target))continue;
    try{await access(resolve(dirname(path),decodeURIComponent(target.split('#')[0])));}catch{errors.push(`${path}: missing link ${target}`);}
  }
}
const html=await readFile(join(root,'prototype/index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
if(new Set(ids).size!==ids.length)errors.push('Duplicate HTML IDs');
for(const m of html.matchAll(/(?:aria-controls|aria-labelledby)="([^"]+)"/g))for(const id of m[1].split(' '))if(!ids.includes(id))errors.push(`Missing ARIA reference ${id}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log('Artifact links, public path hygiene and HTML references passed.');
