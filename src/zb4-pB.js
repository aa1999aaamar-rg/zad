
/* ===================== 1) المصحف الناطق ===================== */
/* Sync finding (checked 25 Oct 2026 on api.quran.com v4):
   - Maher Al-Muaiqly is not in quran.com's recitations (/resources/recitations, 12 reciters) nor its chapter reciters
     (qdc /audio/reciters, 14) → no word timestamps exist there for him → ayah-by-ayah highlight, the everyayah per-ayah files
     being the ayah boundaries.
   - Word segments ([index, word_position, start_ms, end_ms] per ayah file) exist for all 12 quran.com recitations
     (/recitations/{id}/by_chapter/{s}?fields=segments) and refer to quran.com's own files, which we play for word mode. */
const NREC=[
 {id:'maher',n:'ماهر المعيقلي',w:0,f:'MaherAlMuaiqly128kbps'},
 {id:'q7',n:'مشاري العفاسي',w:7},{id:'q6',n:'محمود خليل الحصري',w:6},{id:'q12',n:'الحصري (المصحف المعلّم)',w:12},{id:'q3',n:'عبدالرحمن السديس',w:3},{id:'q10',n:'سعود الشريم',w:10},{id:'q9',n:'محمد صديق المنشاوي',w:9},{id:'q2',n:'عبدالباسط عبدالصمد',w:2}];
const nrec=id=>NREC.find(r=>r.id===id)||NREC[0];
const pad=n=>String(n).padStart(3,'0');
const qurl=u=>u?(u.startsWith('//')?'https:'+u:/^https?:/.test(u)?u:'https://verses.quran.com/'+u):'';
const NC={};
async function jget(u,tries=3){let e;for(let i=0;i<tries;i++){try{const r=await fetch(u);if(r.ok)return await r.json();e=new Error('HTTP '+r.status)}catch(x){e=x}await new Promise(r=>setTimeout(r,700*(i+1)))}throw e}
async function words(s){if(NC['w'+s])return NC['w'+s];const j=await jget(`${QA}/verses/by_chapter/${s}?words=true&word_fields=text_uthmani&per_page=300&fields=text_uthmani`);const v=j.verses.map(x=>({a:x.verse_number,k:x.verse_key,w:(x.words||[]).filter(w=>w.char_type_name==='word').map(w=>[w.position,w.text_uthmani])}));NC['w'+s]=v;return v}
async function segs(rid,s){const k='s'+rid+'_'+s;if(NC[k])return NC[k];const j=await jget(`${QA}/recitations/${rid}/by_chapter/${s}?fields=segments&per_page=300`);const m={};(j.audio_files||[]).forEach(f=>{const a=+String(f.verse_key).split(':')[1];m[a]={u:qurl(f.url),g:(f.segments||[]).filter(x=>x&&x.length>=4).map(x=>[+x[1],+x[2],+x[3]]).sort((p,q)=>p[1]-q[1])}});NC[k]=m;return m}
const N={au:new Audio(),pre:new Audio(),s:1,a:1,b:false,n:0,pass:0,raf:0,seg:null,on:false,last:-1};
N.au.preload='auto';N.pre.preload='auto';
const BSM='بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
function urlOf(rec,s,a){if(!rec.w)return `https://everyayah.com/data/${rec.f}/${pad(s)}${pad(a)}.mp3`;const m=NC['s'+rec.w+'_'+s];return m&&m[a]?m[a].u:''}
async function urlB(rec){if(!rec.w)return urlOf(rec,1,1);const m=await segs(rec.w,1);return m[1]?m[1].u:''}
function setRate(){try{N.au.preservesPitch=true;N.au.webkitPreservesPitch=true;N.au.playbackRate=+ZZ.nat.sp||1}catch(e){}}
function stopNat(){try{N.au.pause()}catch(e){}cancelAnimationFrame(N.raf);N.on=false;ui()}
function mark(scroll){$$('.zn-a.on,.zn-bsm.on,.zn-w.on').forEach(x=>x.classList.remove('on'));$$('.zn-w.dn').forEach(x=>x.classList.remove('dn'));
 const el=N.b?$('.zn-bsm'):$(`.zn-a[data-a="${N.a}"]`);if(!el)return;el.classList.add('on');if(ZZ.nat.auto&&scroll!==false){const r=el.getBoundingClientRect();if(r.top<80||r.top>innerHeight*0.55)el.scrollIntoView({block:'center',behavior:'smooth'})}}
function tick(){cancelAnimationFrame(N.raf);const rec=nrec(ZZ.nat.r);if(!rec.w||N.b||!N.seg||!N.seg.length)return;
 const loop=()=>{if(!N.on)return;const t=N.au.currentTime*1000,g=N.seg;let p=-1;for(let i=0;i<g.length;i++){if(t>=g[i][1])p=g[i][0];else break}
  if(p!==N.last){N.last=p;const box=$(`.zn-a[data-a="${N.a}"]`);if(box){$$('.zn-w',box).forEach(w=>{const q=+w.dataset.p;w.classList.toggle('on',q===p);w.classList.toggle('dn',p>0&&q<p)});const w=p>0&&$(`.zn-w[data-p="${p}"]`,box);if(w&&ZZ.nat.auto){const r=w.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-210)w.scrollIntoView({block:'center',behavior:'smooth'})}}}
  N.raf=requestAnimationFrame(loop)};N.raf=requestAnimationFrame(loop)}
function media(){if(!('mediaSession' in navigator))return;try{const rec=nrec(ZZ.nat.r);navigator.mediaSession.metadata=new MediaMetadata({title:N.b?`سورة ${chName(N.s)} · البسملة`:`سورة ${chName(N.s)} · آية ${ar(N.a)}`,artist:'الشيخ '+rec.n,album:'زاد — المصحف الناطق',artwork:[{src:new URL('icons/icon-512.png',location.href).href,sizes:'512x512',type:'image/png'},{src:new URL('icons/icon-192.png',location.href).href,sizes:'192x192',type:'image/png'}]});
 const ms=navigator.mediaSession,H=(a,f)=>{try{ms.setActionHandler(a,f)}catch(e){}};H('play',()=>{N.on=true;N.au.play().then(tick).catch(()=>{})});H('pause',()=>N.au.pause());H('previoustrack',()=>go(N.a-1));H('nexttrack',()=>go(N.a+1));H('stop',stopNat);ms.playbackState=N.au.paused?'paused':'playing'}catch(e){}}
let stepId=0;
async function playStep(){const id=++stepId,rec=nrec(ZZ.nat.r);let u;
 try{if(N.b){u=await urlB(rec);N.seg=null}else{if(rec.w){await segs(rec.w,N.s);const m=NC['s'+rec.w+'_'+N.s][N.a];N.seg=m?m.g:null}else N.seg=null;u=urlOf(rec,N.s,N.a)}}catch(e){u=''}
 if(id!==stepId)return;
 if(!u){tst('تعذّر تحميل الصوت، تأكد من الاتصال');stopNat();return}
 N.last=-1;N.au.src=u;setRate();mark();N.on=true;ui();media();
 try{await N.au.play()}catch(e){if(id===stepId){N.on=false;ui()}return}
 if(id!==stepId)return;setRate();tick();ZZ.nat.s=N.s;ZZ.nat.a=N.a;sv();
 try{const na=N.b?N.a:N.a+1;if(na<=chLen(N.s)){const nu=urlOf(rec,N.s,na);if(nu&&N.pre.src!==nu)N.pre.src=nu}}catch(e){}}
function go(a){const L=chLen(N.s);a=Math.max(1,Math.min(L,a));N.a=a;N.b=false;N.n=0;playStep()}
function logAyah(){try{const z=FZ(),k=dayK(),o=z.d[k]=z.d[k]||{};o.na=(o.na||0)+1;if(N.a===chLen(N.s)&&(N.started===N.s)){ZZ.sd=ZZ.sd||{};if(!ZZ.sd[N.s])ZZ.sd[N.s]=k}sv();try{ZS.rihlaCheck&&ZS.rihlaCheck()}catch(e){}}catch(e){}}
N.au.addEventListener('ended',()=>{cancelAnimationFrame(N.raf);const o=ZZ.nat;
 if(N.b){N.b=false;N.n=0;playStep();return}
 N.n++;if(N.n<(+o.rep||1)){N.au.currentTime=0;N.au.play().then(tick).catch(()=>{});ui();return}
 N.n=0;logAyah();
 if(o.rg&&o.rg.on&&N.a>=+o.rg.t){N.pass++;const lim=+o.rg.n;if(!lim||N.pass<lim){N.a=+o.rg.f;N.b=false;playStep();return}N.pass=0;N.on=false;$$('.zn-w.on').forEach(x=>x.classList.remove('on'));ui();tst('اكتمل تكرار المقطع ✓');return}
 if(N.a<chLen(N.s)){N.a++;playStep();return}
 if(o.cont&&N.s<114){const ns=N.s+1;tst('السورة التالية: '+chName(ns));ZZ.nat.s=ns;ZZ.nat.a=1;sv();if(location.hash.split('/')[0]==='#natiq'){location.hash='natiq/'+ns+'/1/p'}else{N.s=ns;N.a=1;N.b=ns!==9;N.started=ns;playStep()}return}
 N.on=false;ui();tst('صدق الله العظيم')});
['play','pause'].forEach(e=>N.au.addEventListener(e,()=>{if(e==='pause'){N.on=false;cancelAnimationFrame(N.raf)}ui();try{navigator.mediaSession.playbackState=e==='play'?'playing':'paused'}catch(x){}}));
N.au.addEventListener('error',()=>{if(N.au.getAttribute('src')){N.on=false;ui();tst('تعذّر تشغيل الصوت، تأكد من الاتصال')}});
function ui(){const p=$('#znpb');if(p){p.innerHTML=N.au.paused?SV.play:SV.pause;p.setAttribute('aria-label',N.au.paused?'تشغيل':'إيقاف مؤقت')}const i=$('#zninfo');if(i){const rec=nrec(ZZ.nat.r),o=ZZ.nat;i.innerHTML=`<b>${N.b?'سورة '+chName(N.s)+' · البسملة':'سورة '+chName(N.s)+' · آية '+ar(N.a)}</b>الشيخ ${rec.n}${(+o.rep||1)>1?' · التكرار '+ar(N.n+1)+'/'+ar(o.rep):''}${o.rg&&o.rg.on?' · المقطع '+ar(o.rg.f)+'–'+ar(o.rg.t)+(+o.rg.n?' ×'+ar(o.rg.n):' بلا حد'):''}`}}
async function natRender(arg){addCss();const o=ZZ.nat,pa=String(arg||'').split('/');let s=+pa[0]||(+o.s||1),a=+pa[1]||0;const autoplay=pa[2]==='p';s=Math.min(114,Math.max(1,s));const L=chLen(s);a=a?Math.min(L,a):(s===+o.s?Math.min(L,+o.a||1):1);
 const same=N.s===s&&N.on;
 if(!same){try{if(typeof AP!=='undefined'&&AP.el)AP.el.pause()}catch(e){}}
 const rec=nrec(o.r);
 if(o.rg.f>L||o.rg.t>L||o.rg.f<1){o.rg.f=1;o.rg.t=Math.min(L,7)}
 view.innerHTML=`<div class="zb4 zn">${back('read/s/'+s,'المصحف')}<h1 class="page" style="margin-bottom:2px">المصحف الناطق<em class="zb4-new">جديد</em></h1>
 <div class="zn-top"><select id="znsur" aria-label="السورة">${Array.from({length:114},(_,i)=>`<option value="${i+1}" ${i+1===s?'selected':''}>${ar(i+1)}. ${chName(i+1)}</option>`).join('')}</select>
 <select id="znrec" aria-label="القارئ"><optgroup label="تتبّع الآية">${NREC.filter(r=>!r.w).map(r=>`<option value="${r.id}" ${r.id===rec.id?'selected':''}>${r.n} · آية بآية</option>`).join('')}</optgroup><optgroup label="تتبّع كلمة بكلمة">${NREC.filter(r=>r.w).map(r=>`<option value="${r.id}" ${r.id===rec.id?'selected':''}>${r.n} · كلمة بكلمة</option>`).join('')}</optgroup></select></div>
 <div class="zn-mode">${rec.w?`${zi('sparkle')}تتبّع <b>كلمة بكلمة</b> بصوت الشيخ ${rec.n}، وتوقيت كل كلمة من بيانات quran.com لهذه التلاوة.`:`${zi('sparkle')}تتبّع <b>آية بآية</b> بصوت الشيخ ${rec.n} (everyayah.com). لا توجد توقيتات كلمات منشورة لهذا القارئ، فتتلوّن الآية كاملة. للتتبّع كلمة بكلمة اختر قارئًا من «تتبّع كلمة بكلمة».`}</div>
 <div class="zn-txt ${rec.w?'zn-wl':''}" id="zntxt" style="--qs:${(S.settings&&S.settings.qsize)||26}px">${s!==1&&s!==9?`<div class="zn-bsm" id="znb">${BSM}</div>`:''}<div class="spin"></div></div>
 <div class="zn-bar"><div class="zn-row"><button class="zn-ib" id="znpv" aria-label="الآية السابقة">${SV.prev}</button><div class="zn-info" id="zninfo"></div><button class="zn-pb" id="znpb" aria-label="تشغيل">${SV.play}</button><button class="zn-ib" id="znnx" aria-label="الآية التالية">${SV.next}</button></div>
 <div class="zn-opt"><span class="lb">السرعة</span>${[0.75,0.9,1,1.1,1.25].map(v=>`<button class="zn-c ${+o.sp===v?'on':''}" data-sp="${v}">${ar(v)}×</button>`).join('')}</div>
 <div class="zn-opt"><span class="lb">كرّر الآية</span>${[1,2,3,5,10].map(v=>`<button class="zn-c ${+o.rep===v?'on':''}" data-rp="${v}">${v===1?'مرة':ar(v)}</button>`).join('')}</div>
 <div class="zn-opt"><button class="zn-c ${o.rg.on?'on':''}" id="znrgt">${zi('repeat')}تكرار مقطع للحفظ</button><button class="zn-c ${o.auto?'on':''}" id="znau">تمرير تلقائي</button><button class="zn-c ${o.cont?'on':''}" id="znct">السورة التالية تلقائيًا</button></div>
 <div class="zn-rg ${o.rg.on?'on':''}" id="znrg">من آية <select id="znf">${Array.from({length:L},(_,i)=>`<option value="${i+1}" ${i+1===+o.rg.f?'selected':''}>${ar(i+1)}</option>`).join('')}</select> إلى <select id="znt">${Array.from({length:L},(_,i)=>`<option value="${i+1}" ${i+1===+o.rg.t?'selected':''}>${ar(i+1)}</option>`).join('')}</select> عدد المرات <select id="znn">${[2,3,5,7,10,20,0].map(v=>`<option value="${v}" ${v===+o.rg.n?'selected':''}>${v?ar(v):'بلا حد'}</option>`).join('')}</select></div></div>
 <p class="znote" style="margin-top:10px">النص القرآني بالرسم العثماني من api.quran.com. اضغط أي آية لتبدأ منها${rec.w?'، أو كلمة في الآية الحالية لتنتقل إليها':''}، واضغط مطوّلًا للمعاني والتفسير. يمكن التحكم من شاشة القفل في أغلب الجوالات.</p></div>`;
 $('#znsur').onchange=e=>{stopNat();ZZ.nat.s=+e.target.value;ZZ.nat.a=1;sv();location.hash='natiq/'+e.target.value};
 $('#znrec').onchange=e=>{const was=N.on;stopNat();ZZ.nat.r=e.target.value;sv();natRender(N.s+'/'+N.a+(was?'/p':''))};
 $$('[data-sp]').forEach(b=>b.onclick=()=>{ZZ.nat.sp=+b.dataset.sp;sv();setRate();$$('[data-sp]').forEach(x=>x.classList.toggle('on',x===b))});
 $$('[data-rp]').forEach(b=>b.onclick=()=>{ZZ.nat.rep=+b.dataset.rp;N.n=0;sv();$$('[data-rp]').forEach(x=>x.classList.toggle('on',x===b));ui()});
 $('#znrgt').onclick=e=>{o.rg.on=!o.rg.on;N.pass=0;sv();e.currentTarget.classList.toggle('on',o.rg.on);$('#znrg').classList.toggle('on',o.rg.on);ui()};
 $('#znau').onclick=e=>{o.auto=!o.auto;sv();e.currentTarget.classList.toggle('on',o.auto)};
 $('#znct').onclick=e=>{o.cont=!o.cont;sv();e.currentTarget.classList.toggle('on',o.cont)};
 const rgc=()=>{let f=+$('#znf').value,t=+$('#znt').value;if(t<f){t=f;$('#znt').value=t}o.rg.f=f;o.rg.t=t;o.rg.n=+$('#znn').value;N.pass=0;sv();ui()};['#znf','#znt','#znn'].forEach(q=>$(q).onchange=rgc);
 $('#znpb').onclick=()=>{if(N.au.getAttribute('src')&&N.s===s&&!N.au.ended&&(N.au.currentTime>0||N.on)){if(N.au.paused){N.on=true;N.au.play().then(tick).catch(()=>{})}else N.au.pause();return}
  const st=o.rg.on?+o.rg.f:N.a;N.s=s;N.a=st;N.n=0;N.pass=0;N.started=s;N.b=(st===1&&s!==1&&s!==9);playStep()};
 $('#znnx').onclick=()=>{N.s=s;go(N.a+1)};$('#znpv').onclick=()=>{N.s=s;go(N.a-1)};
 if(!same){N.s=s;N.a=a;N.b=false}ui();
 let v;try{v=await words(s)}catch(e){const t=$('#zntxt');if(t)t.innerHTML='<p class="znote" style="text-align:center">تعذّر تحميل نص السورة. تأكد من الاتصال ثم أعد المحاولة.</p>';return}
 if(rec.w){try{await segs(rec.w,s)}catch(e){}}
 const box=$('#zntxt');if(!box||!document.body.contains(box))return;
 box.innerHTML=(s!==1&&s!==9?`<div class="zn-bsm" id="znb">${BSM}</div>`:'')+v.map(x=>`<span class="zn-a" data-a="${x.a}" data-k="${x.k}">${x.w.map(([p,t])=>`<span class="zn-w" data-p="${p}">${t}</span>`).join(' ')} <span class="zn-end">﴿${ar(x.a)}﴾</span></span> `).join('');
 let lp=null,lpd=false;
 box.addEventListener('pointerdown',e=>{const el=e.target.closest('.zn-a');if(!el)return;lpd=false;clearTimeout(lp);lp=setTimeout(()=>{lpd=true;try{if(typeof ayahSheet==='function')ayahSheet(el.dataset.k,()=>{N.s=s;go(+el.dataset.a)})}catch(x){}},560)});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>box.addEventListener(t,()=>clearTimeout(lp)));
 box.addEventListener('contextmenu',e=>{if(e.target.closest('.zn-a'))e.preventDefault()});
 box.addEventListener('click',e=>{if(lpd){lpd=false;return}const bs=e.target.closest('.zn-bsm');if(bs){N.s=s;N.a=1;N.b=true;N.n=0;N.started=s;playStep();return}const el=e.target.closest('.zn-a');if(!el)return;const aa=+el.dataset.a;const w=e.target.closest('.zn-w');const r=nrec(ZZ.nat.r);
  if(w&&r.w&&aa===N.a&&N.s===s&&N.seg&&N.au.getAttribute('src')&&!N.b){const p=+w.dataset.p,g=N.seg.find(x=>x[0]===p);if(g){N.au.currentTime=g[1]/1000;N.last=-1;if(N.au.paused){N.on=true;N.au.play().then(tick).catch(()=>{})}return}}
  N.s=s;N.n=0;N.pass=0;if(N.started!==s)N.started=aa===1?s:0;go(aa)});
 if(same){mark(false)}else if(a>1){const el=$(`.zn-a[data-a="${a}"]`);el&&el.scrollIntoView({block:'center'})}
 if(autoplay&&!same){N.s=s;N.a=a;N.started=a===1?s:0;N.b=(a===1&&s!==1&&s!==9);N.n=0;playStep()}}
const natState=()=>({s:N.s,a:N.a,b:N.b,on:N.on,paused:N.au.paused,t:N.au.currentTime,src:N.au.src,rate:N.au.playbackRate,last:N.last,seg:N.seg?N.seg.length:0,rec:ZZ.nat.r,word:($('.zn-w.on')||{}).textContent||'',ayahOn:($('.zn-a.on')||{dataset:{}}).dataset.a||null,ms:!!(navigator.mediaSession&&navigator.mediaSession.metadata)});
