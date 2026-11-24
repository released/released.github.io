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
const interactionsOnly=process.argv.includes('--guide-interactions');
const guidesOnly=process.argv.includes('--guide-review')||interactionsOnly;
const types={'.html':'text/html','.md':'text/plain','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav'};
const server=createServer(async(req,res)=>{try {
 let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(path==='/favicon.ico'){res.writeHead(204).end();return;}
 if(path==='/__error.html'||path==='/__mermaid.html'||path==='/__missing.html') {
   let shell=await readFile(join(root,'slide_RL78/tools.html'),'utf8');
   shell=shell.replace('data-markdown="tools.md"','data-markdown="'+(path==='/__mermaid.html'?'__mermaid.md':'missing-chapter.md')+'"');
   if(path==='/__error.html')shell=shell.replace(/<script[^>]*marked@[^]*?<\/script>/,'');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}).end(shell);return;
 }
 if(path==='/__mermaid.md'){res.writeHead(200,{'Content-Type':'text/plain'}).end('# Diagram recovery\n\n```mermaid\nflowchart TD\n A-->B\n```\n\n```mermaid\nnot a valid diagram\n```\n\n```mermaid\nflowchart TD\n C-->D\n```');return;}
 if(path==='/')path='/index.html';
 if(path.endsWith('/'))path+='index.html';
 const target=resolve(root,'.'+path);assert.ok(target.startsWith(root+sep));
 const bytes=await readFile(target);
 res.writeHead(200,{'Content-Type':(types[extname(target)]||'application/octet-stream')+'; charset=utf-8'}).end(bytes);
 }catch{if(!res.headersSent)res.writeHead(404).end('Not found');else res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);assert.ok(browser,'Installed Chromium required');
const profile=join(out,'profile');await mkdir(profile);
const child=spawn(browser,['--headless=new','--disable-gpu','--no-first-run','--disable-extensions','--disable-background-networking','--disable-component-update','--disable-sync','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
if(process.env.WEB_TEST_RUN_FILE) {
 const command=". (Join-Path $env:WEB_TEST_HUB_ROOT 'scripts/test_artifact_lifecycle.ps1'); $run=Get-Content -LiteralPath $env:WEB_TEST_RUN_FILE -Raw | ConvertFrom-Json; Register-HubTestProcess -Run $run -ProcessId "+child.pid;
 execFileSync('powershell.exe',['-NoProfile','-Command',command],{windowsHide:true});
}
let socket,next=0;const pending=new Map();
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(test,label,timeout=60000){const until=Date.now()+timeout;while(Date.now()<until){if(await test())return;await pause(100);}throw Error('Timeout: '+label);}
async function call(method,params={}){const id=++next;return new Promise((resolve,reject)=>{
 const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},15000);
 pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});
 socket.send(JSON.stringify({id,method,params}));
});}
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function navigate(path){
 await evaluate('window.__webTestReady=false');
 await call('Page.navigate',{url:base+path});
 await wait(()=>evaluate('document.readyState==="complete" && window.__webTestReady && !!document.querySelector("#content h1")'),'render '+path);
 await wait(()=>evaluate('window.webGuideRuntime==="2.0" && [...document.querySelectorAll(".mermaid")].every(n=>n.querySelector("svg"))'),'diagrams '+path);await pause(250);
}
async function verifyGuidePage(path) {
 const broken=await evaluate('[...document.querySelectorAll("svg[aria-labelledby],svg[aria-describedby]")].flatMap(n=>["aria-labelledby","aria-describedby"].flatMap(a=>(n.getAttribute(a)||"").split(/\\s+/).filter(Boolean).filter(id=>!document.getElementById(id))))');
 assert.deepEqual(broken,[],'SVG accessible references '+path);
 const markers=await evaluate('[...document.querySelectorAll("svg [marker-start],svg [marker-end],svg [marker-mid]")].flatMap(n=>["marker-start","marker-end","marker-mid"].flatMap(a=>{const m=/url\\(["\\\']?#([^"\\\')]+)["\\\']?\\)/.exec(n.getAttribute(a)||"");return m&&!document.getElementById(m[1])?[m[1]]:[];}))');
 assert.deepEqual(markers,[],'SVG arrow references '+path);
 const chinese=await evaluate('([...document.querySelectorAll("#content h2,#content h3")].find(h=>/[^\\x00-\\x7f]/.test(h.id))||{}).id');
 if(chinese) {
  await evaluate('document.documentElement.style.scrollBehavior="auto";const h=document.getElementById('+JSON.stringify(chinese)+');scrollTo(0,scrollY+h.getBoundingClientRect().top-Math.round(innerHeight*.2)+2);');
  // A short document may clamp the requested position to its end. The reading
  // contract then selects the last section, even when the requested title is higher.
  const expected = await evaluate('(()=>{const headings=[...document.querySelectorAll("#content h2,#content h3,#content h4")];return scrollY>0&&scrollY+innerHeight>=document.documentElement.scrollHeight-2?headings.at(-1).id:'+JSON.stringify(chinese)+';})()');
  try {
   await wait(()=>evaluate('!![...document.querySelectorAll("#toc a.active")].find(a=>decodeURIComponent(a.hash.slice(1))==='+JSON.stringify(expected)+')'),'Chinese TOC / page-end state '+path,3000);
  } catch(error) {
   console.error(await evaluate('({target:'+JSON.stringify(chinese)+',top:document.getElementById('+JSON.stringify(chinese)+').getBoundingClientRect().top,line:innerHeight*.2,scroll:scrollY,active:[...document.querySelectorAll("#toc a.active")].map(a=>a.hash)})'));
   throw error;
  }
 }
 if(/^\/slide_(boot_loader_for_|simple_renesas)/.test(path)) {
  assert.equal(await evaluate('[...document.querySelectorAll("#content img")].filter(i=>!i.hasAttribute("width")||!i.hasAttribute("height")).length'),0,'image intrinsic sizes '+path);
 }
}

async function verifyGuideInteractions() {
 const guide='/slide_boot_loader_for_RL78/uart-device.html';
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await navigate(guide);
 await evaluate('document.documentElement.style.scrollBehavior="auto"');
 await evaluate('document.querySelector("#sidebar-toc-btn").click();document.querySelector("#toc details summary").focus();');
 assert.equal(await evaluate('document.activeElement.tagName'),'SUMMARY','disclosure receives keyboard focus');
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal(await evaluate('document.querySelector("#toc details").open'),true,'keyboard disclosure');
 const target=await evaluate('(()=>{const a=document.querySelector("#toc details .toc-h4");a.click();return decodeURIComponent(a.hash.slice(1));})()');
 await pause(500);
 assert.equal(await evaluate('document.body.hasAttribute("html-show-sidebar-toc")'),false,'narrow TOC selection closes drawer');
 assert.equal(await evaluate('document.activeElement.id'),target,'narrow target focus');
 assert.ok(await evaluate('!!document.querySelector("#toc details.contains-active")'),'collapsed group exposes current-section state');
 const {data:narrowImage}=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(out,'guide-narrow.png'),Buffer.from(narrowImage,'base64'));
 for(const width of [760,761,1366]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<=760});await pause(150);
  assert.equal(await evaluate('document.body.hasAttribute("html-show-sidebar-toc")'),width>760,'drawer breakpoint '+width);
 }
 await evaluate('scrollTo(0,0)');await pause(200);
 const {data:desktopImage}=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(out,'guide-desktop.png'),Buffer.from(desktopImage,'base64'));
 await navigate('/slide_boot_loader_for_RL78/architecture.html');
 assert.ok(await evaluate('!!document.querySelector("svg title")'),'accessible diagram fixture follows its canonical architecture owner');
 await evaluate('document.documentElement.style.scrollBehavior="auto";document.querySelector("svg title").closest(".mermaid").scrollIntoView();');
 await pause(100);
 const {data:diagramImage}=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(out,'guide-diagram.png'),Buffer.from(diagramImage,'base64'));
 for(const [alias,page,anchor] of [['app-a／b-工程驗證','device-guides.html','device-metadata-vector-workshop'],['實板驗證紀錄','status-and-reports.html','update-validation-scope'],['接線與速度','serial-isp.html','serial-wiring'],['app-更新操作','serial-isp.html','serial-app-update']]) {
  await navigate('/slide_simple_renesas_isp_tool/#'+encodeURIComponent(alias));
  assert.ok((await evaluate('location.pathname')).endsWith('/'+page),'legacy destination '+alias);
  assert.ok(await evaluate('!!document.getElementById('+JSON.stringify(anchor)+')'),'legacy target '+alias);
 }
 for(const [platform,model] of [['RL78','g22'],['RH850','rh850']]) {
  for(const bus of ['uart','i2c','xmodem']) {
   const alias='upgrade-'+model+'-'+bus;
   await navigate('/slide_boot_loader_for_'+platform+'/#'+alias);
   assert.equal(await evaluate('location.pathname'),'/slide_boot_loader_for_'+platform+'/experiments.html','withheld model bookmark '+alias);
   assert.equal(await evaluate('location.hash'),'#experiment-scope','withheld bookmark shows current public scope '+alias);
   assert.ok(await evaluate('!!document.getElementById("experiment-scope")'),'public scope target '+alias);
  }
 }
 await navigate('/slide_boot_loader_for_RL78/#ram_flag');
 assert.ok((await evaluate('location.pathname')).endsWith('/basic_uart_i2c/architecture.html'),'two-stage Basic destination');
 assert.ok(await evaluate('!!document.getElementById("ram_flag")'),'two-stage Basic target');
 await call('Fetch.enable',{patterns:[{urlPattern:'*mermaid*.js',requestStage:'Request'}]});
 const blocked=[];
 const intercept=({data})=>{const m=JSON.parse(data);if(m.method==='Fetch.requestPaused')blocked.push(m.params.requestId);};socket.addEventListener('message',intercept);
 await call('Network.setCacheDisabled',{cacheDisabled:true});
 await evaluate('window.__webTestReady=false;performance.clearMarks();');
 await call('Page.navigate',{url:base+guide});
 await wait(()=>evaluate('!!document.querySelector("#content h1") && performance.getEntriesByName("guide-content").length===1'),'text before delayed diagrams');
 assert.equal(await evaluate('window.__webTestReady'),false,'diagrams remain pending');
 for(const requestId of blocked)await call('Fetch.failRequest',{requestId,errorReason:'Failed'});
 await call('Fetch.disable');socket.removeEventListener('message',intercept);
 await wait(()=>evaluate('window.__webTestReady && !!document.querySelector(".render-warning")'),'renderer failure preserves text');
 assert.ok(await evaluate('!!document.querySelector("#toc a")'),'navigation survives renderer failure');
 await call('Page.navigate',{url:base+'/__missing.html'});
 await wait(()=>evaluate('!!document.querySelector(".render-error button")'),'missing Markdown recovery');
 assert.ok((await evaluate('document.querySelector(".render-error").textContent')).includes('404'),'HTTP error remains visible');
 console.log('PASS guide interactions: native Enter, drawer/focus and breakpoints, old/two-stage bookmarks, delayed/failed diagrams and Markdown recovery');
}
try {
 let port;await wait(async()=>{try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split(/\r?\n/)[0];return !!port;}catch{return false;}},'browser startup');
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}});
 await call('Page.enable');await call('Runtime.enable');
 await call('Page.addScriptToEvaluateOnNewDocument',{source:'window.__webTestReady=false;addEventListener("guide:content-ready",()=>performance.mark("guide-content"));addEventListener("guide:ready",()=>{window.__webTestReady=true;performance.mark("guide-complete");});'});
 if(!calculatorsOnly) {
 for(const site of ['']) {
  const manifest=JSON.parse(await readFile(join(root,site,'web-site.json'),'utf8'));
  for(const page of manifest.pages.filter(p=>p.source)) {
    if(interactionsOnly)continue;
    if(guidesOnly && !/^(slide_boot_loader_for_(RL78|RH850)|slide_simple_renesas_isp_tool)\//.test(page.source) && !['README.md','notices_can/index.md','notices_can_uds/roles/index.md'].includes(page.source))continue;
   if(chaptersOnly && !(/^(slide_RL78|slide_RH850)\/(?!index\.md)/.test(page.source)||page.source.startsWith('slide_boot_loader_for_RL78/basic_uart_i2c/')&&!page.source.endsWith('/index.md')))continue;
    const path='/'+page.html.replace(/index\.html$/,'');
   await call('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
   await navigate(path);
   const state=await evaluate('({ids:[...document.querySelectorAll("#content [id]")].map(n=>n.id), title:document.title, open:document.body.hasAttribute("html-show-sidebar-toc"), width:innerWidth, scroll:document.documentElement.scrollWidth, images:document.querySelectorAll("#content img").length,lazy:document.querySelectorAll("#content img[loading=lazy]").length})');
   assert.ok(state.open,'desktop sidebar '+path);assert.ok(state.scroll<=state.width+1,'desktop overflow '+path);
   assert.ok(state.images===0||state.lazy===state.images-1,'lazy image hints '+path);
    if(guidesOnly)await verifyGuidePage(path);
   for(const mapPath of manifest.routeMaps||[]) {
    const map=JSON.parse(await readFile(join(root,site,mapPath),'utf8'));
    const folder=mapPath.includes('/')?mapPath.slice(0,mapPath.lastIndexOf('/')+1):'';
    for(const [alias,t]of Object.entries(map))if(folder+t.page===page.html)assert.ok(state.ids.includes(t.anchor),'DOM legacy target '+path+'#'+alias);
   }
   await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(250);
   const narrow=await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,open:document.body.hasAttribute("html-show-sidebar-toc")})');
   assert.ok(!narrow.open&&narrow.scroll<=narrow.width+1,'narrow layout '+path+JSON.stringify(narrow));
    results.push({path,...state,contentIds:state.ids,pathname:await evaluate('location.pathname'),narrow});console.log('PASS browser '+path);
  }
 }
  if(!guidesOnly) {
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
 }
 if(guidesOnly) {
  if(!interactionsOnly)await writeFile(join(out,'results-guides.json'),JSON.stringify({results,interactionsComplete:false},null,2));
  await verifyGuideInteractions();
 }
 await writeFile(join(out,interactionsOnly?'results-interactions.json':guidesOnly?'results-guides.json':chaptersOnly?'results-chapters.json':'results.json'),JSON.stringify(guidesOnly?{results,interactionsComplete:true}:results,null,2));console.log(interactionsOnly?'PASS focused interactions (page corpus not rerun)':'PASS runtime behaviors and '+results.length+' reader pages at desktop/narrow widths');
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
