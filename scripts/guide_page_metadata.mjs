// Derive image layout hints from existing local assets; do not create thumbnails.
import {readFile} from 'node:fs/promises';
import {dirname,resolve,sep} from 'node:path';

function dimensions(bytes) {
  if(bytes.length>=24 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  }
  if(bytes.length<4 || bytes.readUInt16BE(0)!==0xffd8)return null;
  let offset=2;
  while(offset+4<=bytes.length) {
    if(bytes[offset++]!==0xff)return null;
    while(bytes[offset]===0xff)offset++;
    const marker=bytes[offset++];
    if(marker===0xd9||marker===0xda)break;
    if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
    if(offset+2>bytes.length)return null;
    const length=bytes.readUInt16BE(offset);
    if(length<2||offset+length>bytes.length)return null;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return length>=7?[bytes.readUInt16BE(offset+5),bytes.readUInt16BE(offset+3)]:null;
    }
    offset+=length;
  }
  return null;
}

export async function prepareGuideShell(html,sourcePath,webRoot) {
  const markdown=await readFile(sourcePath,'utf8');
  const sizes={};
  const prose=markdown.replace(/^```[^\n]*\n[^]*?^```\s*$/gm,'').replace(/`[^`\n]*`/g,'');
  const urls=[...prose.matchAll(/!\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)].map(m=>m[1]);
  urls.push(...[...prose.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/g)].map(m=>m[1]));
  for(const url of new Set(urls)) {
    if(/^(?:[a-z]+:|\/\/)/i.test(url))continue;
    const path=resolve(url.startsWith('/')?webRoot:dirname(sourcePath),
      decodeURIComponent(url.split(/[?#]/)[0]).replace(/^\//,''));
    if(!path.startsWith(resolve(webRoot)+sep))throw Error('Image escaped web root: '+url);
    const size=dimensions(await readFile(path));
    if(size&&size.every(n=>n>0))sizes[url]=size;
  }
  html=html.replace(/<script\b[^>]*src="https:\/\/cdn\.jsdelivr\.net\/npm\/mermaid@[^>]+>/g,
    tag=>tag.includes('data-guide-diagrams')?tag:tag.replace('<script ','<script defer data-guide-diagrams '));
  html=html.replace(/  <script id="guide-image-sizes" type="application\/json">[^]*?<\/script>\r?\n/g,'');
  if(Object.keys(sizes).length) {
    const metadata='  <script id="guide-image-sizes" type="application/json">'+JSON.stringify(sizes).replaceAll('<','\\u003c')+'</script>\n';
    html=html.replace(/(  <script\b)/,metadata+'$1');
  }
  return html;
}
