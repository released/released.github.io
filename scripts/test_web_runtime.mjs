// Real Chromium regression checks using only Node built-ins and an owned profile.
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,readdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve,join,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const out=process.env.WEB_TEST_OUTPUT;
assert.ok(out,'Use test_web_runtime.ps1 to allocate registered artifacts');
const results=[];
const chaptersOnly=process.argv.includes('--chapters');
const calculatorsOnly=process.argv.includes('--calculators');
const types={'.html':'text/html','.md':'text/plain','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{try {
 let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(path==='/favicon.ico'){res.writeHead(204).end();return;}
 if(path==='/__error.html'||path==='/__mermaid.html') {
   let shell=await readFile(join(root,'slide_RL78/tools.html'),'utf8');
   shell=shell.replace('data-markdown="tools.md"','data-markdown="'+(path==='/__error.html'?'missing-chapter.md':'__mermaid.md')+'"');
   if(path==='/__error.html')shell=shell.replace(/<script[^>]*marked@[^]*?<\/script>/,'');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(shell);return;
 }
 if(path==='/__mermaid.md'){res.writeHead(200,{'Content-Type':'text/plain'}).end('# Diagram recovery\n\n```mermaid\nflowchart TD\n A-->B\n```\n\n```mermaid\nnot a valid diagram\n```\n\n```mermaid\nflowchart TD\n C-->D\n```');return;}
 if(path==='/')path='/index.html';
 if(path.endsWith('/'))path+='index.html';
 const target=resolve(root,'.'+path);assert.ok(target.startsWith(root+sep));
 res.writeHead(200,{'Content-Type':(types[extname(target)]||'application/octet-stream')+'; charset=utf-8'}).end(await readFile(target));
 }catch{res.writeHead(404).end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);assert.ok(browser,'Installed Chromium required');
const profile=join(out,'profile');await mkdir(profile);
const child=spawn(browser,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking','--disable-component-update','--disable-sync','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let socket,next=0;const pending=new Map();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(test,label,timeout=60000){const until=Date.now()+timeout;while(Date.now()<until){if(await test())return;await pause(100);}throw Error('Timeout: '+label);}
async function call(method,params={}){const id=++next;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function navigate(path){
 await evaluate('window.__webTestReady=false');
 await call('Page.navigate',{url:base+path});
 await wait(()=>evaluate('document.readyState==="complete" && window.__webTestReady && !!document.querySelector("#content h1")'),'render '+path);
 await wait(()=>evaluate('window.webGuideRuntime==="2.0" && [...document.querySelectorAll(".mermaid")].every(n=>n.querySelector("svg"))'),'diagrams '+path);await pause(250);
}
try {
 let port;await wait(async()=>{try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split(/\r?\n/)[0];return !!port;}catch{return false;}},'browser startup');
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}});
 await call('Page.enable');await call('Runtime.enable');
 await call('Page.addScriptToEvaluateOnNewDocument',{source:'window.__webTestReady=false;addEventListener("guide:ready",()=>window.__webTestReady=true);'});
 if(!calculatorsOnly) {
 for(const site of ['']) {
  const manifest=JSON.parse(await readFile(join(root,site,'web-site.json'),'utf8'));
  for(const page of manifest.pages.filter(p=>p.source)) {
   if(chaptersOnly && !(/^(slide_RL78|slide_RH850)\/(?!index\.md)/.test(page.source)||page.source.startsWith('slide_boot_loader_for_RL78/basic_uart_i2c/')&&!page.source.endsWith('/index.md')))continue;
   const path='/'+(page.html==='index.html'?'':page.html);
   await call('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
   await navigate(path);
   const state=await evaluate('({ids:[...document.querySelectorAll("#content [id]")].map(n=>n.id), title:document.title, open:document.body.hasAttribute("html-show-sidebar-toc"), width:innerWidth, scroll:document.documentElement.scrollWidth, images:document.querySelectorAll("#content img").length,lazy:document.querySelectorAll("#content img[loading=lazy]").length})');
   assert.ok(state.open,'desktop sidebar '+path);assert.ok(state.scroll<=state.width+1,'desktop overflow '+path);
   assert.ok(state.images===0||state.lazy===state.images-1,'lazy image hints '+path);
   for(const mapPath of manifest.routeMaps||[]) {
    const map=JSON.parse(await readFile(join(root,site,mapPath),'utf8'));
    const folder=mapPath.includes('/')?mapPath.slice(0,mapPath.lastIndexOf('/')+1):'';
    for(const [alias,t]of Object.entries(map))if(folder+t.page===page.html)assert.ok(state.ids.includes(t.anchor),'DOM legacy target '+path+'#'+alias);
   }
   await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(250);
   const narrow=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,open:document.body.hasAttribute("html-show-sidebar-toc")})');
   assert.ok(!narrow.open&&narrow.scroll<=narrow.width+1,'narrow layout '+path+JSON.stringify(narrow));
   results.push({path,...state,narrow});console.log('PASS browser '+path);
  }
 }
 for(const site of ['slide_RL78','slide_RH850','slide_boot_loader_for_RL78/basic_uart_i2c']) {
  const map=JSON.parse(await readFile(join(root,site,'legacy-routes.json'),'utf8'));
  const script=await readFile(join(root,site,'legacy-routes.js'),'utf8');
  for(const [id,target]of Object.entries(map)) {
   let changed;const location={hash:'#'+encodeURIComponent(id),search:'?check=1',replace:v=>changed=v};vm.runInNewContext(script,{location,addEventListener:()=>{}});
   assert.equal(changed,target.page==='index.html'?undefined:target.page+'?check=1#'+encodeURIComponent(target.anchor));
  }
  const [id,t]=Object.entries(map).find(([,t])=>t.page!=='index.html');await navigate('/'+site+'/#'+encodeURIComponent(id));assert.ok((await evaluate('location.pathname')).endsWith('/'+t.page));
 }
 await navigate('/slide_Nuvoton_AEC_NR_operation/');
 assert.equal(await evaluate('document.querySelectorAll("audio[preload=none]").length'),6);
 assert.equal(await evaluate('document.querySelectorAll("section[lang] h1").length'),2);
 await evaluate('document.querySelector("#content .image-link").click()');
 assert.equal(await evaluate('document.getElementById("image-viewer").open'),true);await evaluate('document.getElementById("image-close").click()');
 await call('Page.navigate',{url:base+'/__error.html'});await wait(()=>evaluate('!!document.querySelector(".render-error")'),'renderer failure');assert.ok((await evaluate('document.querySelector(".render-error a").getAttribute("href")'))==='missing-chapter.md');
 await call('Page.navigate',{url:base+'/__mermaid.html'});await wait(()=>evaluate('document.querySelectorAll(".mermaid svg").length===2 && !!document.querySelector(".render-warning")'),'per-diagram recovery');
 await navigate('/slide_secure_boot_fundamentals/');await wait(()=>evaluate('document.querySelector("#crypto-lab").dataset.ready==="true"'),'guide ready WebCrypto');
 for(const path of chaptersOnly?['/slide_RL78/uart.html','/slide_RH850/build.html','/slide_boot_loader_for_RL78/basic_uart_i2c/boot-driver.html']:['/','/notices_can_uds/roles/','/slide_RL78/uart.html','/slide_Nuvoton_AEC_NR_operation/','/slide_RH850_F1KM_Memory_map/']) {
  await call('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});await navigate(path);
  const {data}=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(out,'view-'+(path.replace(/\W+/g,'_')||'home')+'.png'),Buffer.from(data,'base64'));
 }
 await writeFile(join(out,chaptersOnly?'results-chapters.json':'results.json'),JSON.stringify(results,null,2));console.log('PASS runtime behaviors and '+results.length+' reader pages at desktop/narrow widths');
 } else {
  for(const family of ['', 'rl78/', 'rh850/']) {
   const path='/option_byte_calculator/'+family;
   await call('Page.navigate',{url:base+path});
   await wait(()=>evaluate('location.pathname==='+JSON.stringify(path)+' && document.readyState==="complete" && '+(family?'document.querySelectorAll("#model-select option").length==='+ (family==='rl78/'?37:4):'document.title==="Renesas Option Byte Calculator"')),'calculator '+path);
   let models=0;
   if(family)models=await evaluate(`(()=>{const select=document.querySelector('#model-select');for(const option of select.options){select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));if(!document.querySelector('.hex-input'))throw Error('No HEX inputs: '+option.value);}return select.options.length;})()`);
   for(const width of [1366,390]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<600});
    await pause(150);
    assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),'calculator viewport '+path+' '+width);
   }
   results.push({path,models,widths:[1366,390]});console.log('PASS calculator '+path+' '+models+' models desktop/narrow');
  }
  await writeFile(join(out,'results-calculators.json'),JSON.stringify(results,null,2));
 }
} catch(error) {
 console.error(error);
 if(socket) {
  try { console.error(await evaluate('({url:location.href,body:document.body.innerText.slice(0,2000),scripts:[...document.scripts].map(s=>s.src)})'));const {data}=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(out,'view-failure.png'),Buffer.from(data,'base64')); } catch {}
 }
 throw error;
} finally {
 if(socket){try{await call('Browser.close');}catch{child.kill();}socket.close();}else child.kill();
 if(child.exitCode===null&&child.signalCode===null)await Promise.race([new Promise(r=>child.once('exit',r)),pause(15000)]);
 if(child.exitCode===null&&child.signalCode===null){child.kill();await new Promise(r=>child.once('exit',r));}
 server.closeAllConnections();await new Promise(r=>server.close(r));
 await pause(2000);
}
