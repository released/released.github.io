import {readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
export function legacyRouteScript(routes) {
 return '// Generated from legacy-routes.json; retain original bookmarks.\n(function(){\n  "use strict";\n  var routes='+JSON.stringify(routes).replaceAll('<','\\u003c')+';\n  function route(){\n    var id;try{id=decodeURIComponent(location.hash.slice(1));}catch(error){return;}\n    if(!Object.prototype.hasOwnProperty.call(routes,id))return;\n    var target=routes[id];\n    if(target.page!=="index.html")location.replace(target.page+location.search+"#"+encodeURIComponent(target.anchor));\n  }\n  addEventListener("hashchange",route);route();\n}());\n';
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 for(const site of ['slide_RL78','slide_RH850','slide_boot_loader_for_RL78/basic_uart_i2c']) {
  const dir=join(root,site),expected=legacyRouteScript(JSON.parse(await readFile(join(dir,'legacy-routes.json'),'utf8')));
  if(process.argv.includes('--check')){if((await readFile(join(dir,'legacy-routes.js'),'utf8')).replace(/\r\n/g,'\n')!==expected)throw Error('Legacy routes differ: '+site);}
  else await writeFile(join(dir,'legacy-routes.js'),expected);
 }
 console.log('PASS legacy route projections'+(process.argv.includes('--check')?' (read-only)':''));
}
