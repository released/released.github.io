// Explicit authoring step. Publication checks projections without generating them.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {resolve,join,relative,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const check=process.argv.includes('--check');
const catalog=JSON.parse(await readFile(join(root,'site-catalog.json'),'utf8'));
const old=JSON.parse(await readFile(join(root,'web-site.json'),'utf8'));
const master=await readFile(join(root,'scripts/verify_web.mjs'));
const digest=b=>createHash('sha256').update(b.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
async function project(path,content) {
 const bytes=Buffer.from(content);
 if(check){if(bytes.toString('utf8').replace(/\r\n/g,'\n')!==(await readFile(path,'utf8')).replace(/\r\n/g,'\n'))throw Error('Projection differs: '+path);}
 else await writeFile(path,bytes);
}
const topics=catalog.topics;
if(new Set(topics).size!==topics.length||topics.some(n=>!/^[-\w.]+$/.test(n)||n==='.'||n==='..'))throw Error('Invalid topic catalog');
const pages=old.pages.filter(p=>!topics.some(t=>p.html.startsWith(t+'/')));
const runtimeFiles={};
for(const name of ['app.js','style.css'])runtimeFiles['assets/'+name]=digest(await readFile(join(root,'assets',name)));
const sections=[],routeMaps=[];
for(const topic of topics) {
 const site=join(root,topic);
 const declaration=JSON.parse(await readFile(join(site,'web-site.json'),'utf8'));
 for(const page of declaration.pages)pages.push({...page,html:topic+'/'+page.html,...(page.source?{source:topic+'/'+page.source}:{})});
 for(const [path,hash] of Object.entries(declaration.runtimeFiles||{}))runtimeFiles[topic+'/'+path]=hash;
 for(const dep of declaration.dependencies||[]) {
  if(runtimeFiles[dep.path]&&runtimeFiles[dep.path]!==dep.sha256)throw Error('Incompatible shared runtime: '+dep.path);
  runtimeFiles[dep.path]=dep.sha256;
 }
 for(const section of declaration.sections||[])sections.push({...section,source:topic+'/'+section.source});
 for(const map of declaration.routeMaps||[])routeMaps.push(topic+'/'+map);
 await project(join(site,'scripts/verify_web.mjs'),master);
}
// Discover new entry-owned pages explicitly; topic declarations remain authoritative.
async function walk(folder) {
 for(const item of await readdir(folder,{withFileTypes:true})) {
  if(['.git','node_modules','output','scripts','tests','data',...topics].includes(item.name))continue;
  const path=join(folder,item.name);
  if(item.isDirectory()){await walk(path);continue;}
  if(!item.name.endsWith('.html')||item.name==='README.html')continue;
  const html=await readFile(path,'utf8');
  if(!/marked@|option-ui\.js|landing-shell/.test(html))continue;
  const name=relative(root,path).split(sep).join('/');
  if(pages.some(p=>p.html===name))continue;
  const source=/data-markdown="([^"]+)"/.exec(html)?.[1]||'index.md';
  pages.push({html:name,...(/marked@/.test(html)?{source:relative(root,join(folder,source)).split(sep).join('/')}:{})});
 }
}
await walk(root);
for(const page of pages) {
 const path=join(root,page.html);
 const html=await readFile(path,'utf8');
 const marker='<meta name="site-repository" content="released/released.github.io">';
 const updated=html.includes(marker)?html:html.replace('</head>',marker+'\n</head>');
 if(updated===html&&!html.includes(marker))throw Error('Missing HTML head: '+page.html);
 await project(path,updated);
}
const manifest={schema:1,site:'released.github.io',publication:{owner:'released',repository:'released.github.io',branch:'main'},runtime:'2.0',pages:pages.sort((a,b)=>a.html.localeCompare(b.html)),runtimeFiles:Object.fromEntries(Object.entries(runtimeFiles).sort()),dependencies:[],sections,routeMaps};
await project(join(root,'web-site.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('PASS consolidated manifest and verifier projections: '+pages.length+' pages'+(check?' (read-only)':''));
