// Standalone, read-only publication baseline. No network or content generation.
import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname,join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(process.argv[2] || fileURLToPath(new URL('../',import.meta.url)));
const manifest=JSON.parse(await readFile(join(root,'web-site.json'),'utf8'));
const assert=(ok,message)=>{if(!ok)throw Error(message);};
// Git for Windows may check out text as CRLF; the contract uses canonical LF.
const hash=bytes=>createHash('sha256').update(bytes.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
assert(manifest.schema===1 && manifest.pages.length,'Invalid site manifest');
const exists=async p=>{try{return (await stat(p)).isFile();}catch{return false;}};
const shells=[];
async function walk(dir) {
  for(const item of await readdir(dir,{withFileTypes:true})) {
    if(['.git','output','node_modules','tests','scripts','data'].includes(item.name))continue;
    const path=join(dir,item.name);
    if(item.isDirectory())await walk(path);
    else if(item.name.endsWith('.html')) {
      const html=await readFile(path,'utf8');
      if(/marked@|option-ui\.js|landing-shell/.test(html))shells.push(relative(root,path).split(sep).join('/'));
    }
  }
}
await walk(root);
for(const shell of shells)assert(manifest.pages.some(p=>p.html===shell),'Unregistered reader page: '+shell);
let references=0;
const texts=new Map();
for(const page of manifest.pages) {
  const html=await readFile(join(root,page.html),'utf8');
  assert(/<html[^>]+lang=/.test(html),'Missing lang: '+page.html);
  assert(/name="viewport"/.test(html)&&/name="description"/.test(html),'Missing metadata: '+page.html);
  if(page.source) {
    const selected=/data-markdown="([^"]+)"/.exec(html)?.[1]||'index.md';
    assert(resolve(dirname(join(root,page.html)),selected)===resolve(root,page.source),'Markdown source differs from manifest: '+page.html);
    assert(html.includes('data-guide-runtime="2.0"'),'Runtime contract missing: '+page.html);
    for(const id of ['sidebar-toc-btn','back-to-top'])assert(new RegExp('id="'+id+'"[^>]*aria-label=').test(html),'Missing accessible control: '+page.html+' '+id);
    for(const tag of html.matchAll(/<script[^>]+src="https:[^>]+>/g))assert(/integrity="sha384-/.test(tag[0])&&/crossorigin="anonymous"/.test(tag[0]),'Unpinned script: '+page.html);
    const md=await readFile(join(root,page.source),'utf8');
    assert(!md.includes('\uFFFD'),'Invalid UTF-8: '+page.source);
    assert((md.match(/^\s*```/gm)||[]).length%2===0,'Unbalanced fences: '+page.source);
    const prose=md.replace(/^```[^\n]*\n[^]*?^```\s*$/gm,'');
    assert(!/!\[\]\(/.test(prose),'Empty screenshot alt: '+page.source);
    const ids=[...prose.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert(new Set(ids).size===ids.length,'Duplicate explicit anchor: '+page.source);
    texts.set(page.source,md);
    const refs=[...prose.matchAll(/!?\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)].map(m=>m[1]);
    refs.push(...[...prose.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]));
    for(const ref of refs) {
      if(/^(https?:|mailto:|tel:|data:|#)/.test(ref))continue;
      const path=decodeURIComponent(ref.split(/[?#]/)[0]);
      if(!path||path.startsWith('/'))continue; // Cross-repository dependencies are declared below.
      const target=resolve(dirname(join(root,page.source)),path);
      assert(target.startsWith(root+sep)||target.startsWith(dirname(root)+sep),'Path escaped workspace: '+ref);
      try{await stat(target);}catch{throw Error('Missing resource '+page.source+' -> '+ref);}
      references++;
    }
  }
}
for(const [path,expected] of Object.entries(manifest.runtimeFiles||{}))assert(hash(await readFile(join(root,path)))===expected,'Runtime drift: '+path);
for(const dependency of manifest.dependencies||[]) {
  const path=join(dirname(root),dependency.path);
  assert(await exists(path),'Shared runtime checkout missing: '+dependency.path);
  assert(hash(await readFile(path))===dependency.sha256,'Shared runtime incompatible: '+dependency.path);
}
for(const contract of manifest.sections||[]) {
  const md=texts.get(contract.source);
  assert(md,'Section source is not registered: '+contract.source);
  for(const group of contract.groups) {
    const start=md.indexOf('<a id="'+group.start+'"');
    const end=group.end?md.indexOf('<a id="'+group.end+'"',start+1):md.length;
    assert(start>=0&&end>start,'Missing section boundaries: '+group.start);
    const body=md.slice(start,end);
    for(const image of group.images)assert(body.includes('('+image+')'),'Image is outside its operation section: '+image);
  }
}
// The legacy map is a compatibility contract, not generated heading text.
for(const mapFile of manifest.routeMaps||[]) {
  const routes=JSON.parse(await readFile(join(root,mapFile),'utf8'));
  for(const [id,target] of Object.entries(routes)) {
    const md=await readFile(join(dirname(join(root,mapFile)),target.source),'utf8');
    assert(md.includes('id="'+target.anchor+'"'),'Legacy anchor missing: '+id);
  }
}
console.log(`PASS baseline ${manifest.site}: ${manifest.pages.length} pages, ${references} relative references, runtime/metadata/alt/section contracts (read-only)`);
