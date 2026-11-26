
/* ===================== v4.9.1 وضع الأذان (#adhanmode) ===================== */
/* iOS cannot play a full adhan while the phone is locked; this mode keeps the app open (wake lock where supported) and plays
   the app's own adhan file (features.js ADHAN_URL) in full at each enabled prayer, from the app's on-device prayer engine (ZPT). */
(function(){'use strict';if(!window.ZB5||window.ZB5.adhan)return;
const zi=window.ZI||(()=>''),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];const sv=()=>{try{save()}catch(e){}};
const AURL=(typeof ADHAN_URL==='string'&&ADHAN_URL)||'https://cdn.aladhan.com/audio/adhans/a1.mp3';
/* Sahih al-Bukhari 614, matn copied letter-for-letter from sunnah.com/bukhari:614 (checked 25 Oct 2026) */
const DUA={t:'مَنْ قَالَ حِينَ يَسْمَعُ النِّدَاءَ اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلاَةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ، حَلَّتْ لَهُ شَفَاعَتِي يَوْمَ الْقِيَامَةِ',ref:'صحيح البخاري ٦١٤',g:'صحيح',u:'https://sunnah.com/bukhari:614'};
const PK=['Fajr','Dhuhr','Asr','Maghrib','Isha'],PN={Fajr:'الفجر',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
const Z=S.zb5=S.zb5||{};const A=Z.adh=Object.assign({on:false,p:{Fajr:1,Dhuhr:1,Asr:1,Maghrib:1,Isha:1}},Z.adh||{});A.p=Object.assign({Fajr:1,Dhuhr:1,Asr:1,Maghrib:1,Isha:1},A.p||{});
const st={active:false,au:null,wl:null,wlState:'',tm:0,fired:{},playing:'',log:[],missed:''};
function locP(){try{const l=window.zLoc&&zLoc.curLoc?zLoc.curLoc():curLoc();if(l&&isFinite(l.lat))return l}catch(e){}try{return curLoc()}catch(e){return{lat:24.7136,lng:46.6753,name:'الرياض'}}}
function timesFor(d){try{const l=locP(),s=S.settings||{},tn=s.tune||{},T=k=>+tn[k]||0;const tune=[0,T('Fajr'),0,T('Dhuhr'),T('Asr'),T('Maghrib'),0,T('Isha'),0];const dd=new Date(d);dd.setHours(12,0,0,0);return ZPT.dayObj(l.lat,l.lng,dd,s.method||4,tune,s.asr==='hanafi',false).timings}catch(e){return null}}
function atT(t,d){const [h,m]=String(t).slice(0,5).split(':').map(Number);const x=new Date(d);x.setHours(h,m,0,0);return x}
const dK=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const f12=d=>{let h=d.getHours();const m=d.getMinutes(),p=h<12?'ص':'م';h=h%12||12;return ar(h+':'+String(m).padStart(2,'0'))+' '+p};
const cd=ms=>{const a=Math.max(0,Math.floor(ms/1e3)),h=Math.floor(a/3600),m=Math.floor(a%3600/60),s=a%60,p=n=>String(n).padStart(2,'0');return ar((h?h+':':'')+p(m)+':'+p(s))};
function todayList(now){const t=timesFor(now);if(!t)return[];return PK.map(k=>({k,n:PN[k],at:atT(t[k],now)}))}
function nextP(now){const L=todayList(now).filter(x=>x.at>now&&A.p[x.k]);if(L.length)return L[0];const tm=new Date(now);tm.setDate(tm.getDate()+1);const L2=todayList(tm).filter(x=>A.p[x.k]);return L2[0]||null}
async function wake(){if(!st.active)return;if(!('wakeLock' in navigator)){st.wlState='unsupported';ui();return}st.wlState='requested';try{st.wl=await navigator.wakeLock.request('screen');st.wlState='granted';st.wl.addEventListener('release',()=>{st.wl=null;if(st.active&&st.wlState==='granted')st.wlState='released';ui()})}catch(e){st.wlState='denied'}ui()}
function onVis(){if(document.visibilityState==='visible'&&st.active&&!st.wl)wake()}
function prime(){const au=st.au||(st.au=new Audio());au.preload='auto';au.src=AURL;try{au.load()}catch(e){}const v=au.volume;au.muted=true;const p=au.play();if(p&&p.then)p.then(()=>{au.pause();au.currentTime=0;au.muted=false;au.volume=v}).catch(()=>{au.muted=false});else{au.pause();au.muted=false}}
function start(){st.active=true;A.on=true;sv();prime();wake();document.addEventListener('visibilitychange',onVis);clearInterval(st.tm);st.tm=setInterval(tick,2000);tick();ui()}
function stop(keepFlag){st.active=false;if(!keepFlag){A.on=false;sv()}clearInterval(st.tm);st.tm=0;try{st.wl&&st.wl.release()}catch(e){}st.wl=null;st.wlState='';document.removeEventListener('visibilitychange',onVis);stopAudio();}
function stopAudio(){try{st.au&&st.au.pause()}catch(e){}if(st.playing){const p=st.playing;st.playing='';showDua(p)}}
/* a check every 2 s (not one long timeout): survives clock drift and throttled timers; a prayer is played only within 90 s of its time */
function tick(){if(!st.active)return;const now=new Date();try{if(window._adhan&&!window._adhan.paused&&st.playing)window._adhan.pause()}catch(e){}
 for(const x of todayList(now)){if(!A.p[x.k])continue;const key=dK(now)+'-'+x.k;if(st.fired[key])continue;const late=now-x.at;if(late>=0&&late<90e3){st.fired[key]=1;fire(x)}else if(late>=90e3&&late<30*60e3&&!st.fired[key]){st.fired[key]=1;st.missed=x.n}}
 ui(true)}
function fire(x){st.playing=x.n;st.log.push({k:x.k,at:Date.now()});const au=st.au||(st.au=new Audio(AURL));if(au.src!==AURL)au.src=AURL;au.currentTime=0;au.muted=false;au.onended=()=>{if(st.playing){const p=st.playing;st.playing='';showDua(p)}};
 const p=au.play();if(p&&p.catch)p.catch(()=>{st.blocked=true;ui()});try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}ui()}
function showDua(p){const b=$('#zadua');if(!b)return;b.hidden=false;b.innerHTML=`<p class="t">«${DUA.t}»</p><small>${DUA.ref} · ${DUA.g} · <a href="${DUA.u}" target="_blank" rel="noopener">sunnah.com</a></small>`;clearTimeout(st.dt);st.dt=setTimeout(()=>{const e=$('#zadua');if(e)e.hidden=true},180e3)}
const css=`.zad{position:fixed;inset:0;z-index:70;background:radial-gradient(120% 80% at 50% 0%,#1d2545 0%,#0d1226 70%);color:#e9e6f2;display:flex;flex-direction:column;align-items:center;overflow:auto;padding:calc(14px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom));text-align:center}
.zad .top{width:100%;display:flex;justify-content:space-between;align-items:center}.zad .top button{background:rgba(255,255,255,.08);color:#e9e6f2;border:0;border-radius:99px;padding:8px 14px;font:inherit}
.zad .clk{font-size:76px;font-weight:800;letter-spacing:1px;margin:18px 0 0;opacity:.82;line-height:1.1}.zad .dt{opacity:.6;font-size:14px}
.zad .nx{margin:20px 0 6px;font-size:17px;opacity:.85}.zad .nx b{color:#f2bd9b}.zad .cd{font-size:34px;font-weight:800;color:#f2bd9b;direction:ltr}
.zad .go{margin:22px 0 10px;border:0;border-radius:22px;padding:18px 26px;font:inherit;font-size:19px;font-weight:800;background:#c0693f;color:#fff;width:100%;max-width:360px}.zad .go.off{background:rgba(255,255,255,.1)}
.zad .ps{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:12px 0}.zad .ps label{background:rgba(255,255,255,.08);border-radius:14px;padding:8px 10px;font-size:13px;display:flex;flex-direction:column;align-items:center;gap:3px;min-width:58px}.zad .ps input{accent-color:#c0693f}.zad .ps small{opacity:.7;font-size:11px}
.zad .nt{font-size:12.5px;line-height:1.8;opacity:.72;max-width:380px;margin:10px auto 0}.zad .wl{font-size:12.5px;margin-top:8px;color:#9fd4b3}.zad .wl.w{color:#f2bd9b}
.zad .now{position:fixed;inset:0;background:rgba(13,18,38,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px}.zad .now h2{font-size:30px;margin:0;color:#f2bd9b}.zad .now button{border:0;border-radius:22px;padding:22px 40px;font:inherit;font-size:24px;font-weight:800;background:#c0693f;color:#fff}
.zad #zadua{background:rgba(255,255,255,.07);border-radius:18px;padding:14px;margin:14px auto 0;max-width:420px}.zad #zadua .t{font-family:'Amiri',serif;font-size:20px;line-height:2;margin:0 0 6px}.zad #zadua small{opacity:.75}.zad #zadua a{color:#f2bd9b}`;
function addCss(){if($('#zadcss'))return;const s=document.createElement('style');s.id='zadcss';s.textContent=css;document.head.appendChild(s)}
function ui(light){const root=$('#zadm');if(!root)return;const now=new Date(),nx=nextP(now);
 const c=$('.clk',root);if(c)c.textContent=f12(now).replace(/ [صم]$/,'');const n=$('.nx',root);if(n)n.innerHTML=nx?`الصلاة القادمة: <b>${nx.n}</b> · ${f12(nx.at)}`:'';const k=$('.cd',root);if(k)k.textContent=nx?cd(nx.at-now):'';
 const ov=$('.now',root);if(st.playing){if(!ov){const d=document.createElement('div');d.className='now';d.innerHTML=`<p style="opacity:.75;margin:0">حان الآن وقت صلاة</p><h2>${esc(st.playing)}</h2><button id="zadstop">إيقاف</button>${st.blocked?'<p class="nt">المتصفح منع التشغيل التلقائي. اضغط «إيقاف» ثم فعّل الوضع من جديد.</p>':''}`;root.appendChild(d);$('#zadstop',d).onclick=()=>{stopAudio();d.remove();ui()}}}else if(ov)ov.remove();
 if(light)return;
 const g=$('.go',root);if(g){g.textContent=st.active?'إيقاف وضع الأذان':A.on?'كان مفعّلًا · اضغط للمتابعة':'فعّل وضع الأذان';g.classList.toggle('off',st.active)}
 const w=$('.wl',root);if(w){w.className='wl'+(st.wlState==='granted'?'':' w');w.textContent=!st.active?'':st.wlState==='granted'?'✓ الشاشة ستبقى مضاءة ما دام التطبيق مفتوحًا':st.wlState==='requested'?'نطلب إبقاء الشاشة مضاءة…':'جهازك لا يسمح للمتصفح بإبقاء الشاشة مضاءة: أوقف القفل التلقائي من الإعدادات، أو اترك الجوال على الشاحن والشاشة تعمل.'}
 const m=$('.ms',root);if(m)m.textContent=st.missed?`فات أذان ${st.missed} لأن التطبيق كان في الخلفية أو الشاشة مغلقة.`:''}
function render(){addCss();const old=$('#zadm');if(old)old.remove();
 const now=new Date(),L=todayList(now),l=locP();
 view.innerHTML=`<a class="back" href="#sec/prayer">${zi('chev')} رجوع</a><h1 class="page">وضع الأذان <em class="zs-new">جديد</em></h1><p class="znote">شاشة هادئة تبقى مفتوحة وترفع الأذان كاملًا في وقته.</p>`;
 const d=document.createElement('div');d.id='zadm';d.className='zad';d.setAttribute('role','dialog');d.setAttribute('aria-label','وضع الأذان');
 d.innerHTML=`<div class="top"><button id="zadx">${zi('chev')} خروج</button><span style="opacity:.7;font-size:13px">${esc((l&&l.name)||'')}</span></div>
  <div class="clk"></div><div class="dt">${new Date().toLocaleDateString('ar-SA',{weekday:'long',day:'numeric',month:'long'})}</div>
  <div class="nx"></div><div class="cd"></div>
  <button class="go"></button><div class="wl"></div><div class="nt ms" style="color:#f2bd9b"></div>
  <div class="ps">${PK.map(k=>{const x=L.find(y=>y.k===k);return`<label><input type="checkbox" data-p="${k}" ${A.p[k]?'checked':''}>${PN[k]}<small>${x?f12(x.at):''}</small></label>`}).join('')}</div>
  <div id="zadua" hidden></div>
  <p class="nt">اترك التطبيق مفتوحًا والشاشة مضاءة (يفضّل على الشاحن). إذا أقفلت الجوال أو خرجت من التطبيق يتوقف — هذا قيد من آبل</p>
  <p class="nt">الأذان نفسه المستخدم في التطبيق، والمواقيت من حاسبة التطبيق لمدينتك. التوقيت يُفحص كل ثانيتين.</p>`;
 document.body.appendChild(d);
 $('.go',d).onclick=()=>{if(st.active)stop();else start();ui()};
 $('#zadx',d).onclick=()=>{stop(true);d.remove();location.hash='sec/prayer'};
 $$('[data-p]',d).forEach(c=>c.onchange=()=>{A.p[c.dataset.p]=c.checked?1:0;sv();ui()});
 clearInterval(st.ct);st.ct=setInterval(()=>{if(!document.body.contains(d)){clearInterval(st.ct);return}if(!st.active)ui(true)},1000);ui()}
window.addEventListener('hashchange',()=>{if(location.hash.slice(1).split('/')[0]!=='adhanmode'){const d=$('#zadm');if(d){stop(true);d.remove()}}});
window.ZB5.adhan=render;window.ZB5.adhanState=()=>({active:st.active,wl:st.wlState,playing:st.playing,log:st.log.slice(),src:st.au&&st.au.src,paused:st.au?st.au.paused:null,fired:Object.keys(st.fired),next:(()=>{const n=nextP(new Date());return n?{k:n.k,at:+n.at}:null})()});window.ZB5.adhanDua=DUA;
})();
