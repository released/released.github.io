import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../',import.meta.url)));
const scratch=process.env.WEB_TEST_OUTPUT;assert.ok(scratch,'Registered test output required');
const site=join(scratch,'synthetic-site');await mkdir(site);
const html='<!doctype html><html lang="zh-Hant"><head><meta name="viewport" content="width=device-width"><meta name="description" content="Synthetic"><title>Test</title></head><body data-guide-runtime="2.0"><button id="sidebar-toc-btn" aria-label="Menu"></button><a id="back-to-top" aria-label="Top"></a><script src="https://example.invalid/marked@1.js" integrity="sha384-test" crossorigin="anonymous"></script></body></html>';
const good='# Synthetic\n\n<a id="capture"></a>\n\n![Capture](image.svg)\n\n<a id="review"></a>\n\nReview\n';
const manifest={schema:1,site:'synthetic-site',pages:[{html:'index.html',source:'index.md'}],sections:[{source:'index.md',groups:[{start:'capture',end:'review',images:['image.svg']}]}]};
await writeFile(join(site,'index.html'),html);await writeFile(join(site,'index.md'),good);await writeFile(join(site,'image.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');await writeFile(join(site,'web-site.json'),JSON.stringify(manifest));
function run(){return execFileSync(process.execPath,[join(root,'scripts/verify_web.mjs'),site],{encoding:'utf8',stdio:['ignore','pipe','pipe']});}
assert.match(run(),/PASS baseline/);
for(const [label,body,pattern]of [
 ['empty alt',good.replace('![Capture]','![]'),/Empty screenshot alt/],
 ['missing image',good.replace('(image.svg)','(absent.svg)'),/Missing resource/],
 ['section image drift',good.replace('![Capture](image.svg)','').replace('Review','![Capture](image.svg)\n\nReview'),/outside its operation section/],
 ['duplicate anchor',good+'\n<a id="review"></a>',/Duplicate explicit anchor/]
]){await writeFile(join(site,'index.md'),body);assert.throws(run,pattern);console.log('PASS negative contract '+label);}
await writeFile(join(site,'index.md'),good);await writeFile(join(site,'extra.html'),html);assert.throws(run,/Unregistered reader page/);console.log('PASS negative contract undeclared page');
