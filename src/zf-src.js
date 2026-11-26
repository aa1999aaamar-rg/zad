/* زاد v4.4 loader (ميزات جديدة): registers the routes and lazy-loads zf-<module>.js on first use. Minified to site/zf.js */
(function(){'use strict';
if(window.ZF)return;
const XI={camera:'<path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',pause:'<path d="M9 5.5v13M15 5.5v13"/>',next:'<path d="m15 6-6 6 6 6"/><path d="M8 5.5v13"/>',prev:'<path d="m9 6 6 6-6 6"/><path d="M16 5.5v13"/>',speaker:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',nav:'<path d="M12 3.5 19 20l-7-3.5L5 20z"/>',bolt:'<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>',copy:'<rect x="8" y="8" width="11.5" height="11.5" rx="2"/><path d="M15.5 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2"/>',user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',minus:'<path d="M5 12h14"/>',ext:'<path d="M14 4.5h5.5V10M19.5 4.5 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>'};
const zi=(k,c)=>XI[k]?`<svg class="z-ic${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${XI[k]}</svg>`:(window.ZI?ZI(k,c):'');
const ar=x=>String(x).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const F=S.zf=Object.assign({d:{}},S.zf||{});if(!F.d||typeof F.d!=='object')F.d={};
const day=(d=new Date)=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
function track(k,n=1){const t=day();const o=F.d[t]=F.d[t]||{};o[k]=(o[k]||0)+n;save()}
function dev(){let d=localStorage.getItem('zad.dev');if(!/^[a-f0-9]{32}$/.test(d||'')){d=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem('zad.dev',d)}return d}
const back=(h,l)=>`<button class="back" onclick="location.hash='${h}'">${zi('chev')} ${l}</button>`;
async function wake(){let l=null;const get=async()=>{try{if(navigator.wakeLock&&document.visibilityState==='visible')l=await navigator.wakeLock.request('screen')}catch(e){}};await get();const vis=()=>{if(document.visibilityState==='visible'&&o.on)get()};document.addEventListener('visibilitychange',vis);const o={on:true,get ok(){return!!l},release(){o.on=false;document.removeEventListener('visibilitychange',vis);try{l&&l.release()}catch(e){}l=null}};return o}
const LOADED={},MOD={qibla:'qibla',mosques:'mosq',car:'car',tasbeeh:'tasb',wchal:'chal',harvest:'harv',occ:'occ',kids:'kids',zk:'khat'};
function load(m){if(LOADED[m])return LOADED[m];LOADED[m]=new Promise((res,rej)=>{const s=document.createElement('script');s.src='zf-'+m+'.js?v=550';s.onload=res;s.onerror=()=>{delete LOADED[m];rej(new Error('load'))};document.head.appendChild(s)});return LOADED[m]}
const ZF=window.ZF={zi,ar,esc,F,day,track,dev,back,wake,load,m:{},old:{}};
function run(r,a){const m=MOD[r];if(ZF.m[r])return ZF.m[r](a);view.innerHTML='<div style="display:grid;place-items:center;min-height:50vh"><div class="spin"></div></div>';
 return load(m).then(()=>ZF.m[r](a)).catch(()=>{view.innerHTML=`${back('services','المزيد')}<section class="zcard"><p class="znote">تعذّر تحميل هذا القسم، تأكد من الاتصال وحاول مرة أخرى.</p><button class="btn" onclick="location.reload()">إعادة المحاولة</button></section>`})}
['gk','kids','khatma','tasbeeh','qibla','mosques','car'].forEach(k=>ZF.old[k]=V[k]);
['qibla','mosques','car','tasbeeh','wchal','harvest','occ','kids'].forEach(r=>V[r]=a=>run(r,a));
const KID=/^[a-z2-9]{10}$/;
V.khatma=a=>KID.test(a||'')?run('zk',a):ZF.old.khatma(a);
V.gk=a=>{if(!a)return run('zk','');if(KID.test(a))return run('zk',a);if(a==='old')return ZF.old.gk();return ZF.old.gk(a)};
/* hub (المزيد): a new group on top */
const NEW=[['dz','دقيقة زاد','hourglass','آية وذكر والصلاة القادمة'],['qibla','القبلة بالكاميرا','compass','سهم الكعبة فوق صورة الكاميرا'],['gk','ختمة جماعية','circles','رابط تشاركه، وكل واحد يأخذ جزءًا'],['wchal','تحدي الأسبوع','trophy','٧ أيام مع سلسلة وشارات'],['mosques','أقرب مسجد','mosque','قائمة بالمسافة والاتجاه'],['harvest','حصادي الشهري','chart','ملخص شهرك جاهز للمشاركة'],['car','وضع السيارة','car','أزرار كبيرة للتلاوة'],['tasbeeh','السبحة الذكية','beads','اهتزاز عند ٣٣ و١٠٠ ووضع الظلام'],['occ','عدّاد المناسبات','moon','رمضان وعرفة والعيدين وعاشوراء'],['kids','زاوية الأطفال','star','حفظ قصار السور بالنجوم']];
try{if(window.ZHUB&&!ZHUB.some(g=>g[0]==='جديد: ميزات ٤٫٤'))ZHUB.unshift(['جديد: ميزات ٤٫٤',NEW])}catch(e){}
/* tracking for «حصادي»: morning/evening adhkar completion */
if(typeof view!=='undefined')view.addEventListener('click',()=>setTimeout(()=>{const h=location.hash;if(h.indexOf('#adhkar')!==0)return;const dk=[...view.querySelectorAll('.dk')];if(!dk.length||!dk.every(x=>x.classList.contains('fin')))return;
 const c=/evening/.test(h)?'e':/morning/.test(h)?'m':/\/(prayer|sleep)/.test(h)?'':(new Date().getHours()>=15?'e':'m');if(!c)return;const t=day(),o=F.d[t]=F.d[t]||{};if(!o[c]){o[c]=1;save()}},0));
/* extra push settings (occasions + daily دقيقة زاد) ride the existing subscription */
window.zPushX=()=>({occ:F.occ&&F.occ.on?{on:true,pre:F.occ.pre!==false,eve:F.occ.eve!==false,time:F.occ.time||'20:30'}:{on:false},dz:F.dzp&&F.dzp.on?{on:true,time:F.dzp.time||'08:00'}:{on:false}});
ZF.pushOn=()=>!!(S.z4&&S.z4.push&&S.z4.push.on);
ZF.pushSync=()=>{try{window.zPushSync&&zPushSync()}catch(e){}};
/* «دقيقة زاد» */
const dn=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
function dzVerse(){try{const v=window.ZDATA&&ZDATA.v;if(!v||!v.length)return null;return v[(dn()*7+11)%v.length]}catch(e){return null}}
function dzDhikr(){try{const c=new Date().getHours()>=15||new Date().getHours()<3?'evening':'morning';const it=(QDATA.adhkar[c].items||[]).filter(x=>x.t.length<=190);return it.length?{t:it[dn()%it.length].t.replace(/\(\(/g,'«').replace(/\)\)/g,'»'),n:it[dn()%it.length].n,c}:null}catch(e){return null}}
function vref(v){try{return CH(v.sn)[1]+': '+ar(v.a)}catch(e){return ar(v.sn)+':'+ar(v.a)}}
function npInfo(){try{const n=nextPrayer();if(!n)return null;return{n:n.next.n,at:+n.next.at}}catch(e){return null}}
function hmsA(ms){ms=Math.max(0,ms);const s=Math.floor(ms/1e3),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return ar((h?h+':':'')+String(m).padStart(2,'0')+':'+String(x).padStart(2,'0'))}
function dzHTML(full){const v=dzVerse(),d=dzDhikr(),np=npInfo();
 return`<section class="zcard zfdz${full?' full':''}" id="zfdz"><div class="zrow" style="justify-content:space-between"><h3>${zi('hourglass')}دقيقة زاد</h3>${full?'':`<a class="zfmore" href="#dz">المزيد ${zi('chev','chv')}</a>`}</div>
 ${v?`<div class="zfdv">﴿${v.t}﴾</div><div class="zref">[${vref(v)}]</div>`:''}
 ${d?`<div class="zsep"></div><div class="zfdd">${esc(d.t)}${d.n>1?` <small>(${ar(d.n)} مرات)</small>`:''}</div><div class="zref">من ${d.c==='evening'?'أذكار المساء':'أذكار الصباح'} · حصن المسلم</div>`:''}
 <div class="zsep"></div><div class="zfnp"><span>${zi('clock')}${np?'صلاة '+np.n+' بعد':'الصلاة القادمة'}</span><b id="zfcd">${np?hmsA(np.at-Date.now()):'—'}</b></div></section>`}
let dzT=0;function dzTick(){clearInterval(dzT);dzT=setInterval(()=>{const el=document.getElementById('zfcd');if(!el){clearInterval(dzT);return}const np=npInfo();if(!np)return;const ms=np.at-Date.now();if(ms<=0){const c=document.getElementById('zfdz');if(c){c.outerHTML=dzHTML(c.classList.contains('full'));}return}el.textContent=hmsA(ms)},1000)}
ZF.dzHTML=dzHTML;
V.dz=()=>{const P=F.dzp=Object.assign({on:false,time:'08:00'},F.dzp||{});const pon=ZF.pushOn();
 view.innerHTML=`${back('home','الرئيسية')}<h1 class="page">دقيقة زاد</h1>${dzHTML(1)}
 <section class="zcard"><h3>${zi('bell')}تذكير يومي بدقيقة زاد</h3>${pon?`<label class="zset"><span class="grow"><b>تذكير كل يوم</b><small>يصلك تنبيه حتى عند إغلاق التطبيق</small></span><span class="zsw"><input type="checkbox" id="dzon" ${P.on?'checked':''}><i></i></span></label><div class="zset"><span class="grow"><b>الوقت</b></span><input type="time" id="dzt" value="${P.time}"></div>`:`<p class="znote">فعّل التنبيهات أولًا، وبعدها يمكنك اختيار وقت التذكير اليومي.</p><a class="btn block" href="#push">${zi('bell')} تفعيل التنبيهات</a>`}</section>
 <section class="zcard"><h3>${zi('qmark')}ودجت على الشاشة الرئيسية؟</h3><p class="znote"><b>أندرويد:</b> تطبيق «زاد» للأندرويد (من zad-app.sites.tab.bot) يوجد ودجت حقيقي للشاشة الرئيسية بخمسة أشكال، منها دقيقة زاد. وفي التطبيق المثبّت من المتصفح: اضغط مطولًا على أيقونة «زاد» فتظهر لك اختصارات: القبلة، السبحة، دقيقة زاد، وضع السيارة.<br><b>آيفون:</b> آبل لا تسمح بودجت لتطبيقات الويب، فالبديل هذه البطاقة في الرئيسية والتذكير اليومي.</p><a class="zchip" href="https://zad-app.sites.tab.bot/" target="_blank" rel="noopener">${zi('download')}تطبيق زاد للأندرويد</a></section>`;
 dzTick();const on=document.getElementById('dzon');if(on){on.onchange=e=>{P.on=e.target.checked;save();ZF.pushSync();toast(P.on?'تم تفعيل التذكير اليومي':'تم إيقاف التذكير اليومي')};document.getElementById('dzt').onchange=e=>{P.time=e.target.value||'08:00';save();ZF.pushSync();toast('تم الحفظ')}}};
/* home: دقيقة زاد on top + a strip of the new features */
const HT=[['qibla','القبلة بالكاميرا','compass'],['gk','ختمة جماعية','circles'],['wchal','تحدي الأسبوع','trophy'],['mosques','أقرب مسجد','mosque'],['occ','المناسبات','moon'],['harvest','حصادي','chart'],['car','وضع السيارة','car'],['kids','الأطفال','star']];
function homeAdd(){return;/* v4.5: دقيقة زاد moved to «اكتشف» and the hubs (calm home) */if(location.hash&&location.hash!=='#home'&&location.hash!=='#')return;if(document.getElementById('zfdz'))return;const z=view.querySelector('.zhome');if(!z)return;
 const w=document.createElement('div');w.className='zfhome';w.innerHTML=dzHTML(0)+`<nav class="zfstrip" aria-label="ميزات جديدة">${HT.map(([r,l,i])=>`<a href="#${r}"><span>${zi(i)}</span>${l}</a>`).join('')}</nav>`;z.before(w);dzTick()}
const _home=V.home;V.home=async function(){const r=await _home.apply(this,arguments);try{homeAdd()}catch(e){}return r};
try{homeAdd()}catch(e){}
const css=`.zfdz .zfdv{font-family:"Amiri Quran",Amiri,serif;font-size:21px;line-height:2;text-align:center;color:var(--ink);margin-top:6px}.zfdz .zfdd{font-family:Amiri,serif;font-size:17px;line-height:1.9;text-align:center}.zfdz .zfdd small{font-family:Zad,sans-serif;font-size:12px;color:var(--muted)}.zfnp{display:flex;justify-content:space-between;align-items:center;gap:8px}.zfnp span{display:flex;align-items:center;gap:6px;color:var(--muted);font-size:14px}.zfnp span svg{width:18px;height:18px}.zfnp b{font-size:22px;color:var(--accent);font-variant-numeric:tabular-nums;letter-spacing:.5px}.zfmore{display:flex;align-items:center;gap:2px;font-size:13px;color:var(--accent);text-decoration:none}.zfmore svg{width:14px;height:14px}.zfdz.full .zfdv{font-size:24px}.zfhome{margin-bottom:12px}.zfstrip{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 8px;margin:4px -2px 0;scrollbar-width:none}.zfstrip::-webkit-scrollbar{display:none}.zfstrip a{flex:none;display:flex;flex-direction:column;align-items:center;gap:6px;width:84px;padding:10px 4px;border-radius:16px;background:var(--card);border:1px solid var(--line);text-decoration:none;color:var(--ink);font-size:12px;text-align:center;line-height:1.3}.zfstrip a span{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--z-soft);color:var(--accent)}.zfstrip a svg{width:21px;height:21px}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
})();
