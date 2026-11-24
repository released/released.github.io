// One canonical runtime; compatibility URLs remain available as generated copies.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const check=process.argv.includes('--check');
const hashes={};
for(const name of ['app.js','style.css']) {
 const source=await readFile(join(root,'assets',name));
 hashes[name]=createHash('sha256').update(source.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
 for(const topic of ['notices_can','notices_can_uds']) {
  const destination=join(root,topic,'assets',name);
  if(check){if(source.toString('utf8').replace(/\r\n/g,'\n')!==(await readFile(destination,'utf8')).replace(/\r\n/g,'\n'))throw Error('Compatibility runtime drift: '+destination);}
  else await writeFile(destination,source);
 }
}
// Keep every declared consumer bound to the same canonical runtime revision.
const catalog=JSON.parse(await readFile(join(root,'site-catalog.json'),'utf8'));
for(const topic of catalog.topics) {
 const path=join(root,topic,'web-site.json');
 const original=await readFile(path,'utf8');
 const manifest=JSON.parse(original);
 for(const [relative,hash] of Object.entries(manifest.runtimeFiles||{})) {
  if(['notices_can','notices_can_uds'].includes(topic) && hashes[relative.replace(/^assets\//,'')]) {
   manifest.runtimeFiles[relative]=hashes[relative.replace(/^assets\//,'')];
  }
 }
 for(const dep of manifest.dependencies||[]) {
  if(/^notices_can(?:_uds)?\/assets\/(app\.js|style\.css)$/.test(dep.path)) {
   dep.sha256=hashes[dep.path.split('/').at(-1)];
  }
 }
 const updated=JSON.stringify(manifest,null,2)+'\n';
 if(check){if(updated!==original.replace(/\r\n/g,'\n'))throw Error('Runtime declaration drift: '+topic);}
 else if(updated!==original.replace(/\r\n/g,'\n'))await writeFile(path,updated);
}
console.log('PASS shared runtime and compatibility URLs'+(check?' (read-only)':''));
