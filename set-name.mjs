// Usage: node set-name.mjs "زاد" [site-dir]   — renames the app everywhere in one go.
// The name lives in: index.html (APP_NAME + title/meta/header), manifest.webmanifest, sw.js (APP_NAME), credits.html.
// All JS reads the global APP_NAME defined at the top of index.html.
import fs from 'node:fs';
const name=process.argv[2], dir=process.argv[3]||'site';
if(!name){console.error('name?');process.exit(1)}
const rd=f=>fs.readFileSync(`${dir}/${f}`,'utf8'), wr=(f,s)=>fs.writeFileSync(`${dir}/${f}`,s);
let ix=rd('index.html'), old=(ix.match(/var APP_NAME="([^"]+)"/)||[])[1];
if(!old){console.error('APP_NAME not found in index.html');process.exit(1)}
const swap=s=>s.split(old).join(name);
wr('index.html',swap(ix));
const m=JSON.parse(rd('manifest.webmanifest'));m.name=`${name} — تطبيق المسلم`;m.short_name=name;wr('manifest.webmanifest',JSON.stringify(m,null,1)+'\n');
wr('sw.js',rd('sw.js').replace(/const APP_NAME='[^']*'/,`const APP_NAME='${name}'`));
wr('credits.html',swap(rd('credits.html')));
console.log(`renamed «${old}» → «${name}»`);
