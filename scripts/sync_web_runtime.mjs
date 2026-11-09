// One canonical runtime; compatibility URLs remain available as generated copies.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const check=process.argv.includes('--check');
for(const name of ['app.js','style.css']) {
 const source=await readFile(join(root,'assets',name));
 for(const topic of ['notices_can','notices_can_uds']) {
  const destination=join(root,topic,'assets',name);
  if(check){if(source.toString('utf8').replace(/\r\n/g,'\n')!==(await readFile(destination,'utf8')).replace(/\r\n/g,'\n'))throw Error('Compatibility runtime drift: '+destination);}
  else await writeFile(destination,source);
 }
}
console.log('PASS shared runtime and compatibility URLs'+(check?' (read-only)':''));
