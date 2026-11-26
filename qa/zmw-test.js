
const fs=require('fs');eval(fs.readFileSync(__dirname+'/../src/zmw-engine.js','utf8'));
const C=[
 {n:'العمرية الأولى: زوج وأم وأب',src:'https://islamqa.info/ar/answers/169748',h:{husband:1,mother:1,father:1},e:{husband:'1/2',mother:'1/6',father:'1/3'}},
 {n:'العمرية الثانية: زوجة وأم وأب',src:'https://islamqa.info/ar/answers/169748',h:{wife:1,mother:1,father:1},e:{wife:'1/4',mother:'1/4',father:'1/2'}},
 {n:'بنت وأخت وأبناء عم',src:'https://islamqa.info/ar/answers/179776',h:{daughter:1,fs:1,fus:2},e:{daughter:'1/2',fs:'1/2',fus:'0/1'}},
 {n:'بنت وبنت ابن وأخت (قضاء ابن مسعود)',src:'https://islamqa.info/ar/answers/179776 (حديث البخاري)',h:{daughter:1,sdau:1,fs:1},e:{daughter:'1/2',sdau:'1/6',fs:'1/3'}},
 {n:'أخت شقيقة وأخت لأب وأبناء أخ شقيق',src:'https://islamqa.info/ar/answers/160901',h:{fs:1,ps:1,fbs:3},e:{fs:'1/2',ps:'1/6',fbs:'1/3'}},
 {n:'أم وزوجة وابن وبنتان',src:'https://islamqa.info/ar/answers/146624',h:{mother:1,wife:1,son:1,daughter:2},e:{mother:'1/6',wife:'1/8',son:'17/48',daughter:'17/48'}},
 {n:'زوجة وأم وثلاثة أبناء وأربعة إخوة أشقاء',src:'https://binbaz.org.sa/fatwas/15287',h:{wife:1,mother:1,son:3,fb:4},e:{wife:'3/24',mother:'4/24',son:'17/24',fb:'0/1'}},
 {n:'المنبرية: زوجة وأبوان وبنات',src:'https://islamqa.info/ar/answers/131556',h:{wife:1,father:1,mother:1,daughter:2},e:{wife:'3/27',father:'4/27',mother:'4/27',daughter:'16/27'}},
 {n:'عول: زوج وأختان شقيقتان',src:'https://islamqa.info/ar/answers/302362',h:{husband:1,fs:2},e:{husband:'3/7',fs:'4/7'}},
 {n:'عول: زوج وأخت شقيقة وأم',src:'https://islamqa.info/ar/answers/302362',h:{husband:1,fs:1,mother:1},e:{husband:'3/8',fs:'3/8',mother:'2/8'}},
 {n:'عول: زوج وأخت شقيقة وأخ لأم',src:'https://islamqa.info/ar/answers/302362',h:{husband:1,fs:1,mb:1},e:{husband:'3/7',fs:'3/7',mb:'1/7'}},
 {n:'رد: بنت وبنت ابن',src:'https://islamqa.info/ar/answers/302362',h:{daughter:1,sdau:1},e:{daughter:'3/4',sdau:'1/4'}},
 {n:'المشرّكة على مذهب أحمد: زوج وأم وإخوة لأم وأخ شقيق',src:'https://islamqa.info/ar/answers/496015',h:{husband:1,mother:1,mb:2,fb:1},e:{husband:'1/2',mother:'1/6',mb:'1/3',fb:'0/1'}},
 {n:'جد وأخ شقيق (على ترجيح ابن باز وابن عثيمين: الجد يحجب الإخوة)',src:'https://islamqa.info/ar/answers/240582',h:{gf:1,fb:1},e:{gf:'1/1',fb:'0/1'}},
 {n:'زوجة وأربعة أبناء وبنتان',src:'https://binbaz.org.sa/fatwas/13676',h:{wife:1,son:4,daughter:2},e:{wife:'1/8',son:'7/10',daughter:'7/40'}},
];
const sim=s=>{const[a,b]=s.split('/').map(Number);const g=(x,y)=>y?g(y,x%y):x;const d=g(a,b)||1;return a===0?'0/1':(a/d)+'/'+(b/d)};
let pass=0,fail=0;const out=[];
for(const t of C){const r=ZMW.calc(t.h);const got={};r.rows.forEach(x=>got[x.k]=ZMW.frac(x.share));let ok=true;const det=[];
 for(const k in t.e){const g=got[k]||'0/1';const okk=sim(g)===sim(t.e[k]);if(!okk)ok=false;det.push(k+'='+g+(okk?'':' (expected '+t.e[k]+')'))}
 /* shares sum to 1 */
 const sum=r.rows.reduce((s,x)=>s+x.share[0]/x.share[1],0);if(Math.abs(sum-1)>1e-9&&!r.notes.some(n=>n.includes('ذوي الأرحام'))){ok=false;det.push('sum='+sum)}
 ok?pass++:fail++;out.push({name:t.n,src:t.src,ok,det:det.join(', ')});console.log((ok?'PASS ':'FAIL ')+t.n+' | '+det.join(', ')+' | '+t.src)}
console.log(`\n${pass}/${C.length} passed`);fs.writeFileSync(__dirname+'/zmw-results.json',JSON.stringify({pass,total:C.length,out},null,1));process.exit(fail?1:0);
