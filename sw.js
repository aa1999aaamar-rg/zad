const V='ammar-v5-5-6';
const APP_NAME='زاد';
const SHELL=['./','index.html','styles.css','app.js','planner.js','data.js','data2.js','features.js','mushaf.js','b2.js','b2.css','books.js','books.css','pdfbooks.js','pdfbooks.css','b5b.js','b5b.css','b5a.js','b5a.css','b4.js','b4.css','b3.js','b3.css','b6.js','b6.css','streams.js','b7.js','posts.js','up.js','manifest.webmanifest','fonts/pa400.woff2','fonts/pa700.woff2','fonts/pl400.woff2','fonts/pl700.woff2','z4.css','z4.js','zdata.js','zpush.js','adhan.js','pt.js','nat.js','zf.js','zshare.js','zloc.js','zs.js','zsh.js','zsec.js','zward.js','zquiz.js','fonts/amiri-quran.woff2','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>{const old=ks.filter(k=>k!==V&&k!=='ammar-data'&&k!=='ammar-fonts'&&k!=='ammar-audio'&&k!=='zad-cfg');const up=old.some(k=>k.indexOf('ammar-v')===0);return Promise.all(old.map(k=>caches.delete(k))).then(()=>self.clients.claim()).then(()=>{if(up&&self.Notification&&Notification.permission==='granted')return self.registration.showNotification('تحديث جديد لتطبيق '+APP_NAME,{body:'اضغط لترى الجديد',icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:'ammar-update',data:{url:'./#whatsnew'}}).catch(()=>{});});}));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url); if(e.request.method!=='GET') return; if(u.origin===location.origin&&(u.pathname.indexOf('/book/')===0||u.pathname.indexOf('/splash/')===0||u.pathname.indexOf('/api/')===0||u.pathname.indexOf('/admin/')===0)) return;
  if(u.origin===location.origin){ e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>{ const net=fetch(e.request).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(e.request,cp)); } return res; }).catch(()=>r||caches.match('index.html')); return r||net; })); return; }
  if(u.hostname==='everyayah.com'){ e.respondWith(caches.open('ammar-audio').then(c=>c.match(e.request.url).then(async r=>{ if(!r) return fetch(e.request);
    const range=e.request.headers.get('range'); if(!range) return r; const buf=await r.arrayBuffer(); const m=/bytes=(\d*)-(\d*)/.exec(range)||[]; const size=buf.byteLength; const s=m[1]?+m[1]:0; const en=m[2]?Math.min(+m[2],size-1):size-1;
    return new Response(buf.slice(s,en+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${s}-${en}/${size}`,'Content-Length':String(en-s+1),'Accept-Ranges':'bytes'}}); }))); return; }
  if(u.hostname==='zad-content.sites.tab.bot'){ e.respondWith(caches.open('ammar-data').then(c=>c.match(e.request).then(r=>{ const net=fetch(e.request).then(res=>{ if(res.ok) c.put(e.request,res.clone()); return res; }).catch(()=>r); return r||net; }))); return; }
  if(u.hostname==='static.qurancdn.com'||u.hostname==='fonts.gstatic.com'||u.hostname==='cdn.jsdelivr.net'){ e.respondWith(caches.open('ammar-fonts').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{ if(res.ok) c.put(e.request,res.clone()); return res; })))); return; }
  if(u.hostname==='api.quran.com'||u.hostname==='api.aladhan.com'){ e.respondWith(caches.open('ammar-data').then(c=>c.match(e.request).then(r=>{ const net=fetch(e.request).then(res=>{ if(res.ok) c.put(e.request,res.clone()); return res; }).catch(()=>r); return r||net; }))); }
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const u=(e.notification.data&&e.notification.data.url)||'./';for(const c of cs){if('focus' in c){c.navigate&&c.navigate(u).catch(()=>{});return c.focus();}}return self.clients.openWindow(u);}));});
self.addEventListener('message',e=>{const d=e.data||{};if(d.type==='notify'){self.registration.showNotification(d.title,{body:d.body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:d.tag,data:{url:d.url||'./'}});}});

/* v4.0: background fasting / sadaqah reminders (Android Chrome/TWA when the browser grants periodic background sync; best effort, the system chooses the timing) */
const ZWD=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function zHij(d,adj){const x=new Date(d);x.setDate(x.getDate()+(+adj||0));const p={};new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(x).forEach(o=>p[o.type]=o.value);return{d:+p.day,m:+p.month}}
function zFastR(d,f){const h=zHij(d,f.adj),w=d.getDay(),r=[];if(h.m===9||(h.m===10&&h.d===1)||(h.m===12&&h.d>=10&&h.d<=13))return r;if(f.white&&h.d>=13&&h.d<=15)r.push('white');if(f.mt&&(w===1||w===4))r.push('mt');return r}
async function zBg(){try{const c=await caches.open('zad-cfg');if(await c.match('/__zadpush'))return;const res=await c.match('/__zadcfg');if(!res)return;const cfg=await res.json();const f=cfg.fast||{},s=cfg.sad||{};const now=new Date();const key=now.toISOString().slice(0,10);const mark=async t=>{const m=await c.match('/__zadsent');const j=m?await m.json():{};if(j[t])return false;j[t]=1;await c.put('/__zadsent',new Response(JSON.stringify(j)));return true};
 const [hh,mm]=(f.time||'21:00').split(':').map(Number);const tm=new Date(now);tm.setDate(tm.getDate()+1);
 if((f.mt||f.white)&&(now.getHours()*60+now.getMinutes())>=hh*60+mm-30){const r=zFastR(tm,f);if(r.length&&await mark('f'+key))await self.registration.showNotification('تذكير بالصيام',{body:'غدًا '+ZWD[tm.getDay()]+'، تذكير بصيام التطوع'+(r.includes('white')?' (من الأيام البيض)':''),icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:'zf'+key,data:{url:'./#sawm'}})}
 const [sh,sm]=(s.time||'10:00').split(':').map(Number);if(s.on&&now.getDay()===+s.day&&(now.getHours()*60+now.getMinutes())>=sh*60+sm&&await mark('s'+key))await self.registration.showNotification('صندوق الصدقة',{body:'تذكيرك الأسبوعي بالصدقة ولو بالقليل',icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:'zs'+key,data:{url:'./#sadaqa'}})}catch(e){}}
self.addEventListener('periodicsync',e=>{if(e.tag==='zad-daily')e.waitUntil(zBg())});

/* v4.1: Web Push from the زاد server (/api/push/*): shows the reminder even when the app is closed */
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={b:e.data.text()}}catch(y){}}
 const t=d.t||APP_NAME,o={body:d.b||'',icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:d.tag||('z'+Date.now()),renotify:false,data:{url:d.u||'./'}};
 e.waitUntil(self.registration.showNotification(t,o));});
self.addEventListener('pushsubscriptionchange',e=>{e.waitUntil((async()=>{try{const old=e.oldSubscription;let key=e.newSubscription?null:(old&&old.options&&old.options.applicationServerKey);
 if(!key){const r=await fetch('/api/push/key');key=(await r.json()).key}
 const sub=e.newSubscription||await self.registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
 const c=await caches.open('zad-cfg');const m=await c.match('/__zadpushcfg');const body=m?await m.json():null;
 if(body){body.sub=sub.toJSON();await fetch('/api/push/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
 if(old)await fetch('/api/push/unsubscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:old.endpoint})});}catch(x){}})());});
