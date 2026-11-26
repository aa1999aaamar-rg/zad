/* زاد v4.1: closed-app reminders through Web Push (server: _worker.js /api/push/*). Minified to site/zpush.js */
(function(){'use strict';
const Z=S.z4=S.z4||{};
const P=Z.push=Object.assign({on:false,pr:{Fajr:true,Dhuhr:true,Asr:true,Maghrib:true,Isha:true},am:false,pm:false,kahf:false,fp:'',at:0,ep:'',hide:false},Z.push||{});
const zi=k=>window.ZI?ZI(k):'';
const UA=navigator.userAgent;
const IOS=/iPhone|iPad|iPod/.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1);
const STAND=!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||sessionStorage.getItem('zad.twa'));
const IOSV=(()=>{const m=/OS (\d+)_(\d+)/.exec(UA);return m?[+m[1],+m[2]]:null})();
const IOS_OLD=IOS&&IOSV&&(IOSV[0]<16||(IOSV[0]===16&&IOSV[1]<4));
const SUP=('serviceWorker' in navigator)&&('PushManager' in window)&&('Notification' in window);
const PN={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
const ar=x=>String(x).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const post=(p,b)=>fetch('/api/push/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})}).then(r=>r.json().catch(()=>({ok:false,status:r.status})));
function state(){if(!SUP){if(IOS&&!STAND)return'ios-browser';if(IOS_OLD)return'ios-old';return'unsupported'}
 if(IOS&&!STAND)return'ios-browser';if(Notification.permission==='denied')return'denied';return P.on?'on':'off'}
function b64ToU8(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),o=new Uint8Array(b.length);for(let i=0;i<b.length;i++)o[i]=b.charCodeAt(i);return o}
let KEY=localStorage.getItem('zad.vk')||'';
function getKey(){return KEY?Promise.resolve(KEY):fetch('/api/push/key').then(r=>r.json()).then(j=>{KEY=j.key||'';if(KEY)localStorage.setItem('zad.vk',KEY);return KEY})}
function cfg(){const f=Z.fast||{},sd=Z.sad||{},st=S.settings||{};const loc=(typeof curLoc==='function')?curLoc():null;
 const pre=!S.loc,r=x=>pre?Math.round(x*1e4)/1e4:Math.round(x*100)/100;
 return{preset:pre,lat:loc?r(loc.lat):null,lng:loc?r(loc.lng):null,city:loc&&loc.name&&loc.name!=='موقعي الحالي'?loc.name:'',
  tz:(Intl.DateTimeFormat().resolvedOptions().timeZone)||'Asia/Riyadh',
  cfg:{method:st.method||4,tune:st.tune||{},hanafi:st.asr==='hanafi',pr:P.pr,adhkar:{am:!!P.am,pm:!!P.pm},kahf:!!P.kahf,
   fast:{mt:!!f.mt,white:!!f.white,time:f.time||'21:00',suhoor:!!f.suhoor,stime:f.stime||'03:30',adj:+f.adj||0},
   sad:sd.on?{on:true,day:+sd.day||0,time:sd.time||'10:00'}:{on:false},...(window.zPushX?zPushX():{})}}}
async function curSub(){try{const r=await navigator.serviceWorker.ready;return await r.pushManager.getSubscription()}catch(e){return null}}
function swCfg(b){try{const c=Object.assign({},b);delete c.sub;caches.open('zad-cfg').then(x=>x.put('/__zadpushcfg',new Response(JSON.stringify(c),{headers:{'Content-Type':'application/json'}})))}catch(e){}}
async function flag(on){try{const c=await caches.open('zad-cfg');if(on)await c.put('/__zadpush',new Response('1'));else await c.delete('/__zadpush')}catch(e){}}
async function sync(force){if(!P.on||!SUP)return null;const sub=await curSub();if(!sub){P.on=false;save();flag(false);return null}
 const body=cfg();body.sub=sub.toJSON();const fp=JSON.stringify(body);const day=new Date().toDateString();
 if(!force&&fp===P.fp&&P.day===day)return null;
 const j=await post('update',body).catch(()=>null);if(j&&j.ok){swCfg(body);P.fp=fp;P.day=day;P.next=j.next||null;P.ep=sub.endpoint;save()}return j}
window.zPushSync=()=>{clearTimeout(window.__zps);window.__zps=setTimeout(()=>sync(false),800)};
async function enable(btn){if(btn)btn.disabled=true;
 try{if(!SUP)throw new Error('unsupported');
  const reg=await navigator.serviceWorker.ready;let key=KEY;
  let sub=null;
  if(key){try{sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToU8(key)})}catch(e){if(Notification.permission==='denied')throw e}}
  if(!sub){const p=await Notification.requestPermission();if(p!=='granted')throw new Error('denied');key=await getKey();sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToU8(key)})}
  P.on=true;save();const body=cfg();body.sub=sub.toJSON();const j=await post('subscribe',body);
  if(!j||!j.ok)throw new Error((j&&j.error)||'server');P.fp=JSON.stringify(body);P.day=new Date().toDateString();P.next=j.next||null;P.ep=sub.endpoint;save();flag(true);swCfg(body);
  toast('تم تفعيل التنبيهات ✓');}
 catch(e){P.on=false;save();toast(Notification.permission==='denied'?'التنبيهات مرفوضة، فعّلها من إعدادات الجوال':'تعذّر التفعيل، حاول مرة أخرى')}
 if(location.hash.slice(1).split('/')[0]==='push')V.push();}
async function disable(){const sub=await curSub();if(sub){await post('unsubscribe',{endpoint:sub.endpoint}).catch(()=>{});try{await sub.unsubscribe()}catch(e){}}
 P.on=false;P.fp='';P.next=null;save();flag(false);toast('تم إيقاف التنبيهات');V.push()}
function fmtNext(n){if(!n)return'';const d=new Date(n.at),now=new Date();const same=d.toDateString()===now.toDateString();const tm=new Date(+now+864e5).toDateString()===d.toDateString();
 const h=d.getHours(),m=d.getMinutes();return `${n.t} · ${same?'اليوم':tm?'غدًا':ar(d.getDate())+'/'+ar(d.getMonth()+1)} ${ar((h%12||12)+':'+String(m).padStart(2,'0'))} ${h<12?'ص':'م'}`}
function guideIOS(){return`<section class="zcard zpush-ios"><h3>${zi('share')}على الآيفون: خطوة قبل التفعيل</h3>
 <p class="znote">آبل لا تسمح بالتنبيهات إلا إذا كان «زاد» مضافًا إلى الشاشة الرئيسية (iOS 16.4 أو أحدث):</p>
 <ol class="zsteps"><li>افتح هذه الصفحة في <b>Safari</b></li><li>اضغط زر المشاركة <b>⎋</b> تحت</li><li>اختر <b>«إضافة إلى الشاشة الرئيسية»</b> ثم «إضافة»</li><li>افتح «زاد» من أيقونته، ثم عُد إلى هنا واضغط «تفعيل التنبيهات»</li></ol>
 ${IOS_OLD?`<p class="znote" style="color:var(--clay,#c0693f)">جهازك على iOS ${ar(IOSV.join('.'))}، والتنبيهات والتطبيق مغلق تحتاج iOS 16.4 أو أحدث. حدّث من: الإعدادات ← عام ← تحديث البرامج.</p>`:''}</section>`}
function row(id,t,s,on){return`<label class="zset"><span class="grow"><b>${t}</b>${s?`<small>${s}</small>`:''}</span><span class="zsw"><input type="checkbox" data-pk="${id}" ${on?'checked':''}><i></i></span></label>`}
V.push=async()=>{const st=state(),f=Z.fast||{};
 const view=document.getElementById('view');
 view.innerHTML=`<button class="back" onclick="location.hash='settings'">${zi('chev')} الإعدادات</button><h1 class="page">التنبيهات</h1>
 <section class="zcard zpush-hero"><h3>${zi('bell')}تنبيهات تصلك حتى عند إغلاق التطبيق</h3>
 <p class="znote">الأذان، تذكير الصيام (الاثنين والخميس والأيام البيض) والأذكار، من خادم «زاد» لجوالك مباشرة.</p>
 ${st==='on'?`<div class="zli"><span class="zq">${zi('check')}</span><span class="grow"><b>التنبيهات مفعّلة</b><small>${P.next?'القادم: '+fmtNext(P.next):'جارٍ الجدولة…'}</small></span></div>
   <div class="zrow" style="gap:8px;margin-top:10px"><button class="btn sm" id="ptest">أرسل تنبيهًا تجريبيًا</button><button class="btn ghost sm" id="poff">إيقاف</button></div>`
 :st==='off'?`<button class="btn block" id="pon" style="margin-top:10px">${zi('bell')} تفعيل التنبيهات</button>`
 :st==='denied'?`<p class="znote" style="color:var(--clay,#c0693f)">التنبيهات مرفوضة لهذا التطبيق. فعّلها من إعدادات الجوال ← التطبيقات/الإشعارات ← زاد، ثم ارجع هنا.</p>`
 :st==='ios-browser'?'':st==='ios-old'?`<p class="znote">جهازك يحتاج iOS 16.4 أو أحدث للتنبيهات والتطبيق مغلق. إلى ذلك الحين يظهر التذكير عندما تفتح التطبيق.</p>`
 :`<p class="znote">هذا المتصفح لا يدعم تنبيهات الويب. جرّب Chrome على أندرويد أو Safari على الآيفون بعد إضافة التطبيق للشاشة الرئيسية.</p>`}
 </section>
 ${st==='ios-browser'||(IOS_OLD&&!SUP)?guideIOS():''}
 <section class="zcard"><h3>${zi('mosque')}الأذان</h3>${Object.keys(PN).map(k=>row('pr.'+k,'صلاة '+PN[k],'',P.pr[k])).join('')}</section>
 <section class="zcard"><h3>${zi('fast')}الصيام</h3>
 ${row('f.mt','الاثنين والخميس','الليلة السابقة الساعة '+ar(f.time||'21:00'),f.mt)}${row('f.white','الأيام البيض','١٣ و١٤ و١٥ من كل شهر هجري',f.white)}${row('f.suhoor','تذكير السحور','يوم الصيام الساعة '+ar(f.stime||'03:30'),f.suhoor)}
 <a class="zli" href="#sawm"><span class="grow"><small>تغيير الوقت وتعديل التاريخ الهجري ←</small></span></a></section>
 <section class="zcard"><h3>${zi('sunrise')}الأذكار والجمعة</h3>${row('am','أذكار الصباح','بعد الفجر بـ٢٠ دقيقة',P.am)}${row('pm','أذكار المساء','بعد العصر بـ٢٠ دقيقة',P.pm)}${row('kahf','سورة الكهف يوم الجمعة','الساعة ٩ صباحًا',P.kahf)}</section>
 <section class="zcard"><h3>${zi('qmark')}متى يصلك التنبيه؟</h3><p class="znote">• أندرويد: يصلك في وقته غالبًا حتى عند إغلاق التطبيق، بشرط السماح بالإشعارات. وضع توفير البطارية الشديد قد يؤخره.<br>• آيفون (iOS 16.4+): بعد إضافة «زاد» للشاشة الرئيسية والسماح بالإشعارات. آبل قد تؤخر بعض التنبيهات أحيانًا.<br>• الأوقات تُحسب بنفس طريقة الحساب والتعديل اليدوي الموجودَين في إعدادات المواقيت، ولموقعك أو مدينتك.<br>• لا يُذكّر بالصيام في رمضان ولا يوم العيد ولا أيام التشريق.</p></section>
 <section class="zcard"><h3>${zi('shield')}الخصوصية</h3><p class="znote">لتوصيل التنبيهات يحفظ خادم «زاد» فقط: عنوان التنبيه الخاص بجهازك، ومدينتك (أو موقعًا تقريبيًا لأقرب ١ كم تقريبًا إذا استخدمت «موقعي الحالي»)، والمنطقة الزمنية، واختياراتك هنا. بدون اسم ولا رقم ولا بريد. عند «إيقاف» تُحذف بياناتك من الخادم.</p></section>`;
 const on=document.getElementById('pon');if(on){getKey().catch(()=>{});on.onclick=()=>enable(on)}
 const off=document.getElementById('poff');if(off)off.onclick=disable;
 const te=document.getElementById('ptest');if(te)te.onclick=async()=>{te.disabled=true;const sub=await curSub();if(!sub){P.on=false;save();return V.push()}
  const j=await post('test',{endpoint:sub.endpoint}).catch(()=>null);toast(j&&j.ok?'أُرسل، انتظر ثواني ✓':j&&j.status===429?'انتظر نصف دقيقة وجرّب':'لم يصل، جرّب «إيقاف» ثم «تفعيل»');setTimeout(()=>te.disabled=false,30000)};
 view.querySelectorAll('[data-pk]').forEach(el=>el.onchange=()=>{const k=el.dataset.pk,v=el.checked;
  if(k.startsWith('pr.'))P.pr[k.slice(3)]=v;else if(k.startsWith('f.')){Z.fast=Z.fast||{};Z.fast[k.slice(2)]=v;try{scheduleReminders()}catch(e){}}else P[k]=v;
  save();window.zPushSync();toast('تم الحفظ')});
 if(st==='on')sync(false).then(j=>{if(j&&j.next){const s=view.querySelector('.zpush-hero small');if(s)s.textContent='القادم: '+fmtNext(j.next)}});
};
/* entry points: settings, hub, home nudge, fasting page */
function card(){const st=state();if(st==='on')return'';return`<a class="zbanner zpush-nudge" href="#push">${zi('bell')}<div><b>${st==='ios-browser'?'للآيفون: أضف «زاد» إلى الشاشة الرئيسية لتصلك التنبيهات':'فعّل التنبيهات: الأذان والصيام حتى عند إغلاق التطبيق'}</b><small>اضغط هنا</small></div></a>`}
window.zPushCard=card;
const wrap=(name,fn)=>{const o=V[name];if(typeof o!=='function')return;V[name]=async function(){const r=await o.apply(this,arguments);try{fn()}catch(e){}return r}};
wrap('settings',()=>{const v=document.getElementById('view');if(v.querySelector('.zpush-set'))return;const s=document.createElement('section');s.className='zcard zpush-set';
 s.innerHTML=`<a class="zli" href="#push"><span class="zq">${zi('bell')}</span><span class="grow">التنبيهات (حتى عند إغلاق التطبيق)<small>${state()==='on'?'مفعّلة':'غير مفعّلة'}</small></span></a>`;
 const f=v.querySelector('.zcard');if(f&&f.parentNode)f.parentNode.insertBefore(s,f);else v.appendChild(s)});
wrap('home',()=>{if(state()==='on'||P.hide||state()==='unsupported')return;const v=document.getElementById('view');if(v.querySelector('.zpush-nudge'))return;
 const d=document.createElement('div');d.innerHTML=card();const el=d.firstElementChild;if(!el)return;const x=document.createElement('button');x.className='zx';x.setAttribute('aria-label','إخفاء');x.textContent='×';
 x.onclick=e=>{e.preventDefault();e.stopPropagation();P.hide=true;save();el.remove()};el.appendChild(x);
 const hero=v.firstElementChild;if(hero&&hero.nextSibling)v.insertBefore(el,hero.nextSibling);else v.appendChild(el)});
wrap('sawm',()=>{const v=document.getElementById('view');const h=v.querySelector('h1');if(h&&!v.querySelector('.zpush-nudge')&&state()!=='on'){const d=document.createElement('div');d.innerHTML=card();if(d.firstElementChild)h.after(d.firstElementChild)}});
/* when push is on, the server sends these; the in-app timer keeps the bell log + toast but does not show a 2nd notification */
const covers=t=>P.on&&t&&(t.type==='fast'||t.type==='sadaqa'||(t.type==='prayer'&&P.pr[String(t.id).slice(1)])||(t.type==='adhkar'&&(t.id==='am'?P.am:P.pm))||(t.type==='kahf'&&P.kahf));
try{if(typeof fireReminder==='function'){const _fr=fireReminder;window.fireReminder=fireReminder=function(t){if(!covers(t))return _fr.apply(this,arguments);
 const a=todayISO();if(S.rem.log.some(e=>e.id===t.id&&e.d===a))return;S.rem.log=S.rem.log.concat([{id:t.id,d:a,at:Date.now(),title:t.title,body:t.body,url:t.url}]).slice(-40);save();try{updateBell()}catch(e){}if(document.visibilityState==='visible')toast(t.title)}}}catch(e){}
/* on open: re-sync settings/location once a day or when they changed, and nudge the server tick (backup for the external cron) */
function boot(){if(P.on&&SUP){sync(false);const k=+localStorage.getItem('zad.kick')||0;if(Date.now()-k>3e5){localStorage.setItem('zad.kick',Date.now());post('kick').catch(()=>{})}}}
window.addEventListener('hashchange',()=>{if(P.on)window.zPushSync()});
setTimeout(boot,2500);
})();
