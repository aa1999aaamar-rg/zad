
/* زاد v4.9.0 — موجة «نقلة نوعية» B: التسميع بالصوت (#listen)، رفيق الحفظ الذكي (#srs)، حلقة التحفيظ (#halaqa).
   Lazy module on zad-content (/x/zb5.js), loaded by site/zs.js. Source: src/zb5-src.js = src/zb5-engine.js + this file (terser → content/site/zb5.js).
   Qur'an text: api.quran.com v4 (words, text_uthmani — the same source as المصحف الناطق). Audio: the app's reciter files (everyayah, Maher by default).
   Speech: the browser's own SpeechRecognition (ar-SA); we never record or upload audio. Local state: S.zb5 (+ S.b3.sr / S.test.weak shared with the older hifz tools). */
(function(){'use strict';if(window.ZB5)return;const TM=window.ZTM;
const zi=window.ZI||(()=>''),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sv=()=>{try{save()}catch(e){}},tst=m=>{try{toast(m)}catch(e){}},vb=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const QA='https://api.quran.com/api/v4';
const Z=S.zb5=Object.assign({ts:{s:67,a1:1,a2:5,mode:'fade'},tl:[],weak:{},units:[],memP:[],sr:{},rl:[],hq:[],hqd:{},remT:'20:30'},S.zb5||{});
['tl','units','memP','rl','hq'].forEach(k=>{if(!Array.isArray(Z[k]))Z[k]=[]});['weak','sr','hqd'].forEach(k=>{if(!Z[k]||typeof Z[k]!=='object')Z[k]={}});
const B3=()=>{const b=S.b3=S.b3||{};b.sr=b.sr||{};b.srLog=b.srLog||{};return b};
const TW=()=>{const t=S.test=S.test||{log:[],weak:{}};t.weak=t.weak||{};return t};
const dK=d=>{const x=d?new Date(d):new Date();return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const today=()=>dK();
const addD=(k,n)=>{const d=new Date(k+'T12:00:00');d.setDate(d.getDate()+n);return dK(d)};
const dDiff=(a,b)=>Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5);
const CHx=s=>{try{return CH(s)}catch(e){return[s,'سورة '+s,7,1,1]}};
const sName=s=>CHx(s)[1],sLen=s=>+CHx(s)[2]||7;
const SG=()=>(window.Planner&&Planner.SEGS)||(typeof SEGS!=='undefined'?SEGS:[]);
const pageOf=(s,a)=>{const g=SG().find(x=>x.s===s&&a>=x.a1&&a<=x.a2);return g?g.p:0};
const pageSegs=p=>SG().filter(x=>x.p===p).map(x=>({s:x.s,a1:x.a1,a2:x.a2}));
const rngLabel=r=>r.p?`صفحة ${ar(r.p)} · ${sName(pageSegs(r.p)[0]?pageSegs(r.p)[0].s:1)}`:`${sName(r.s)} ${r.a1===1&&r.a2===sLen(r.s)?'كاملة':ar(r.a1)+'–'+ar(r.a2)}`;
const NEW='<em class="zs-new">جديد</em>';
const head=(t,hub)=>`<a class="back" href="#sec/${hub||'quran'}">${zi('chev')} رجوع</a><h1 class="page">${t} ${NEW}</h1>`;
function sheet(html,cls){const el=document.createElement('div');el.className='z5sh'+(cls?' '+cls:'');el.innerHTML=`<div role="dialog" aria-modal="true">${html}<button class="btn ghost" data-x>إغلاق</button></div>`;el.onclick=x=>{if(x.target===el||x.target.hasAttribute('data-x'))el.remove()};document.body.appendChild(el);return el}
const css=`
.z5-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;margin:10px 0}.z5-card h3{margin:0 0 8px;font-size:16px;display:flex;align-items:center;gap:6px}.z5-card h3 svg{width:18px;height:18px}
.z5-note{font-size:12.5px;line-height:1.75;color:var(--muted);margin:6px 0}.z5-note b{color:var(--ink)}
.z5-hon{font-size:12.5px;line-height:1.75;border-radius:14px;padding:10px 12px;background:color-mix(in srgb,#c0693f 9%,var(--card));border:1px solid color-mix(in srgb,#c0693f 22%,transparent);margin:8px 0}
.z5-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.z5-row>*{min-width:0}.z5-grow{flex:1}
.z5 select,.z5 input[type=number],.z5 input[type=text],.z5 input[type=time],.z5sh select,.z5sh input[type=number],.z5sh input[type=text],.z5sh textarea{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:9px 10px;font:inherit;font-size:14px;max-width:100%}
.z5 input[type=number],.z5sh input[type=number]{width:74px;text-align:center}
.z5-chips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.z5-chip{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:99px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer}.z5-chip.on{background:#34457a;color:#fff;border-color:#34457a}
.z5-txt{font-family:'Amiri Quran','Amiri',serif;font-size:var(--qs,26px);line-height:2.3;text-align:justify;text-align-last:center;direction:rtl;padding:14px 12px;background:var(--card);border:1px solid var(--line);border-radius:18px;min-height:120px}
.z5-w{border-radius:7px;padding:0 2px;transition:color .2s,background .2s,opacity .2s,filter .2s}
.z5-hide .z5-w:not(.ok):not(.bad):not(.soft):not(.rv){color:transparent;background:color-mix(in srgb,var(--ink) 7%,transparent);text-shadow:none}
.z5-fade .z5-w:not(.ok):not(.bad):not(.soft):not(.rv){opacity:.16}
.z5-w.ok,.z5-w.soft{color:#1f7a4f}.z5-w.soft{text-decoration:underline dotted 1px}.z5-w.rv{color:#a2672f}
.z5-w.bad{color:#fff;background:#c0693f}.z5-w.cur{box-shadow:0 0 0 2px color-mix(in srgb,#34457a 45%,transparent)}
.z5-end{font-size:.75em;color:#c0693f;white-space:nowrap;margin:0 2px}
.z5-bar{position:sticky;bottom:calc(70px + env(safe-area-inset-bottom));z-index:5;margin-top:12px;background:color-mix(in srgb,var(--card) 94%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:20px;padding:10px 12px;box-shadow:0 8px 24px rgba(29,37,69,.14)}
.z5-mic{width:62px;height:62px;border-radius:50%;border:0;background:#34457a;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none;position:relative}.z5-mic svg{width:28px;height:28px}
.z5-mic.on{background:#c0693f}.z5-mic.on::after{content:'';position:absolute;inset:-6px;border-radius:50%;border:3px solid #c0693f;opacity:.5;animation:z5p 1.4s infinite}
@keyframes z5p{0%{transform:scale(.9);opacity:.6}100%{transform:scale(1.25);opacity:0}}
.z5-heard{font-size:13px;color:var(--muted);min-height:20px;line-height:1.6;direction:rtl}
.z5-prog{height:8px;border-radius:9px;background:var(--z-soft,#eef0f7);overflow:hidden;margin-top:8px}.z5-prog i{display:block;height:100%;background:#1f7a4f;width:0;transition:width .3s}
.z5-err{border:2px solid #c0693f;border-radius:18px;padding:12px;margin-top:10px;background:color-mix(in srgb,#c0693f 7%,var(--card))}
.z5-err .w{font-family:'Amiri Quran','Amiri',serif;font-size:30px;line-height:1.6;color:#c0693f}.z5-err .z5-btn{padding:9px 11px;font-size:13.5px}
a.z5-btn,a.z5-chip{text-decoration:none}
.z5-big{font-size:44px;font-weight:800;line-height:1.1}.z5-st{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.z5-st div{background:var(--z-soft,#eef0f7);border-radius:14px;padding:10px 6px;text-align:center}.z5-st b{display:block;font-size:20px}.z5-st small{font-size:11.5px;color:var(--muted)}
.z5-btn{border:0;border-radius:14px;padding:11px 14px;font:inherit;font-weight:700;cursor:pointer;background:#34457a;color:#fff;display:inline-flex;align-items:center;gap:6px;justify-content:center}.z5-btn svg{width:17px;height:17px}.z5-btn.g{background:var(--z-soft,#eef0f7);color:var(--ink)}.z5-btn.c{background:#c0693f}.z5-btn.ok{background:#1f7a4f}.z5-btn.blk{width:100%}
.z5-item{border:1px solid var(--line);border-radius:16px;padding:12px;margin:8px 0;background:var(--card)}.z5-tag{display:inline-block;font-size:11px;border-radius:99px;padding:1px 8px;background:color-mix(in srgb,#c0693f 14%,transparent);color:#a24f2a;margin-inline-start:6px}.z5-tag.g{background:color-mix(in srgb,#1f7a4f 14%,transparent);color:#1f7a4f}
.z5-steps{display:flex;gap:6px;margin:10px 0}.z5-steps span{flex:1;text-align:center;font-size:12px;padding:6px;border-radius:10px;background:var(--z-soft,#eef0f7)}.z5-steps span.on{background:#34457a;color:#fff}.z5-steps span.dn{background:color-mix(in srgb,#1f7a4f 18%,transparent);color:#1f7a4f}
.z5-rate{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.z5-rate button{border:1px solid var(--line);border-radius:14px;padding:12px 4px;font:inherit;font-weight:700;background:var(--card);color:inherit;cursor:pointer}.z5-rate button.sug{outline:3px solid color-mix(in srgb,#34457a 40%,transparent)}
.z5-rate small{display:block;font-weight:400;font-size:11px;color:var(--muted)}
.z5-mem{display:flex;align-items:center;gap:10px;padding:11px 0;border-top:1px solid var(--line)}.z5-mem:first-child{border-top:0}
.z5-av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:color-mix(in srgb,#34457a 14%,transparent);color:#34457a;flex:none}.z5-av.t{background:#c0693f;color:#fff}
.z5-dots{display:flex;gap:3px;margin-top:4px}.z5-dots i{width:9px;height:9px;border-radius:3px;background:var(--z-soft,#eef0f7)}.z5-dots i.on{background:#1f7a4f}
.z5-code{font-size:30px;font-weight:800;letter-spacing:6px;direction:ltr;text-align:center;padding:10px;border-radius:14px;background:var(--z-soft,#eef0f7);margin:10px 0}
.z5-sc{font-weight:800;font-size:13px;border-radius:10px;padding:2px 8px;background:color-mix(in srgb,#1f7a4f 14%,transparent);color:#1f7a4f;white-space:nowrap}
.z5-chart{display:flex;align-items:flex-end;gap:6px;height:90px;margin-top:8px}.z5-chart div{flex:1;text-align:center;font-size:10.5px;color:var(--muted)}.z5-chart i{display:block;background:#34457a;border-radius:6px 6px 2px 2px;margin:0 auto 4px;width:70%;min-height:3px}
.z5sh{position:fixed;inset:0;z-index:80;background:rgba(15,20,40,.45);display:flex;align-items:flex-end;justify-content:center}.z5sh>div{background:var(--card,#fff);color:var(--ink);width:100%;max-width:520px;border-radius:22px 22px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom));max-height:88vh;overflow:auto;display:flex;flex-direction:column;gap:10px}
.z5sh label{font-size:13px;font-weight:700}.z5sh textarea{width:100%;min-height:64px}
.z5-flash{animation:z5f .6s}@keyframes z5f{0%{transform:scale(.96)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
`;
function addCss(){if($('#z5css'))return;const s=document.createElement('style');s.id='z5css';s.textContent=css;document.head.appendChild(s)}
/* ---------------- Qur'an text (api.quran.com, as in المصحف الناطق) ---------------- */
const NC={};
async function jget(u,tries=3){let e;for(let i=0;i<tries;i++){try{const r=await fetch(u);if(r.ok)return await r.json();e=new Error('HTTP '+r.status)}catch(x){e=x}await new Promise(r=>setTimeout(r,600*(i+1)))}throw e}
async function sWords(s){if(NC[s])return NC[s];const p=jget(`${QA}/verses/by_chapter/${s}?words=true&word_fields=text_uthmani&per_page=300&fields=text_uthmani`).then(j=>j.verses.map(x=>({a:x.verse_number,k:x.verse_key,p:x.page_number,w:(x.words||[]).filter(w=>w.char_type_name==='word').map(w=>w.text_uthmani)})));NC[s]=p;p.catch(()=>{delete NC[s]});return p}
/* segments [{s,a1,a2}] → ayat [{k,s,a,p,w:[uthmani…]}] */
async function loadAyat(segs){const out=[];for(const g of segs){const v=await sWords(g.s);v.filter(x=>x.a>=g.a1&&x.a<=g.a2).forEach(x=>out.push({k:x.k,s:g.s,a:x.a,p:x.p||pageOf(g.s,x.a),w:x.w}))}return out}
/* ---------------- audio: the app's reciter (المصحف الناطق's default Maher), one ayah ---------------- */
const AU=new Audio();AU.preload='auto';
function audioUrl(k){try{if(typeof ayahUrl==='function')return ayahUrl(k)}catch(e){}const [s,a]=k.split(':');return`https://everyayah.com/data/MaherAlMuaiqly128kbps/${String(s).padStart(3,'0')}${String(a).padStart(3,'0')}.mp3`}
function playAyah(k,btn){try{if(window.AP&&AP.el&&!AP.el.paused)AP.el.pause()}catch(e){}try{if(window.ZB4&&ZB4.natStop)ZB4.natStop()}catch(e){}
 if(!AU.paused&&AU.dataset.k===k){AU.pause();if(btn)btn.classList.remove('on');return}AU.dataset.k=k;AU.src=audioUrl(k);AU.play().then(()=>{if(btn)btn.classList.add('on')}).catch(()=>tst('تعذّر تشغيل التلاوة'));AU.onended=()=>{if(btn)btn.classList.remove('on')}}
async function playRange(ayat,onStep,stopFlag){for(let i=0;i<ayat.length;i++){if(stopFlag.stop)return;onStep&&onStep(i);await new Promise(res=>{AU.dataset.k=ayat[i].k;AU.src=audioUrl(ayat[i].k);AU.onended=res;AU.onerror=res;AU.play().catch(res)});}}
/* ---------------- speech recognition ---------------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const isIOS=/iPhone|iPad|iPod/.test(navigator.userAgent);
const HONEST='التعرّف الصوتي من متصفحك؛ أدق على أندرويد كروم، وقد يكون أضعف على الآيفون. ليس بديلاً عن شيخ متقن.';
const PRIV='خصوصيتك: لا نسجّل صوتك ولا نرفعه. يستخدم خدمة التعرّف في متصفحك (في كروم قد تمرّ عبر خوادم Google للتعرّف فقط).';
