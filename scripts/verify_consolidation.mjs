// Read-only URL, layout and publication-entry contracts for the single website.
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,join,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(process.argv[2]||fileURLToPath(new URL('../',import.meta.url)));
const manifest=JSON.parse(await readFile(join(root,'web-site.json'),'utf8'));
const catalog=JSON.parse(await readFile(join(root,'site-catalog.json'),'utf8'));
assert.equal(manifest.site,'released.github.io');
assert.deepEqual(manifest.publication,{owner:'released',repository:'released.github.io',branch:'main'});
let links=0;
async function walk(folder) {
 for(const item of await readdir(folder,{withFileTypes:true})) {
  const path=join(folder,item.name);
  if(item.name==='.git'){assert.equal(folder,root,'Nested Git metadata: '+path);continue;}
  if(['output','node_modules'].includes(item.name))continue;
  assert.ok(!item.isSymbolicLink(),'Reparse website resource: '+path);
  if(item.isDirectory())await walk(path);
 }
}
await walk(root);
assert.equal(new Set(manifest.pages.map(p=>p.html)).size,manifest.pages.length,'Duplicate registered page');
for(const topic of catalog.topics) {
 assert.ok(existsSync(join(root,topic,'web-site.json')),'Missing topic declaration: '+topic);
 const entry=await readFile(join(root,topic,'github_push.bat'),'utf8');
 assert.ok(entry.includes('..\\github_push.bat')&&!entry.includes('-Repository'),'Legacy publication entry: '+topic);
}
for(const page of manifest.pages) {
 const inputs=[page.html,...(page.source?[page.source]:[])];
 for(const source of inputs) {
  const text=(await readFile(join(root,source),'utf8')).replace(/^```[^\n]*\n[^]*?^```\s*$/gm,'');
  if(source===page.html)assert.ok(text.includes('<meta name="site-repository" content="released/released.github.io">'),'Wrong publication source marker: '+source);
  const references=[...text.matchAll(/!?\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)].map(m=>m[1]);
  references.push(...[...text.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]));
  for(const reference of references) {
   if(/^(?:#|mailto:|tel:|data:|javascript:)/.test(reference))continue;
   const url=new URL(reference,'https://released.github.io/'+page.html);
   if(url.origin!=='https://released.github.io')continue;
   let name=decodeURIComponent(url.pathname);
   if(name.endsWith('/'))name+='index.html';
   const target=resolve(root,'.'+name);
   assert.ok(target.startsWith(root+sep),'URL escaped website: '+reference);
   try{await stat(target);}catch{throw Error('Missing website URL '+source+' -> '+reference);}
   links++;
  }
 }
}
console.log('PASS consolidated layout, '+catalog.topics.length+' topic entries and '+links+' local/public URL references (read-only)');
