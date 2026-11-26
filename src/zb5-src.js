/* زاد v4.9 — محرك مطابقة التسميع (window.ZTM). Pure functions, unit-tested in qa/zb5-engine-test.mjs.
   norm(): strips tashkeel and Qur'anic marks, unifies alef/hamza/ya/ta-marbuta, drops tatweel; Uthmani dagger alef → ا.
   align(expected, tokens, final): greedy word alignment with per-word Levenshtein tolerance and small drift:
   recognizer splits/merges words, drops a short particle, inserts one stray word or repeats the previous word.
   It stops at the first expected word it cannot match (a mismatch on the LAST token waits for more input unless final). */
(function(G){'use strict';
const MARKS=/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u08D3-\u08FF\u0640]/g;
function norm(s){s=String(s==null?'':s);
 s=s.replace(/\u0649\u0670/g,'\u0649').replace(/\u0648\u0670/g,'\u0627').replace(/\u0670/g,'\u0627');
 s=s.replace(MARKS,'');
 s=s.replace(/[\u0671\u0622\u0623\u0625\u0672\u0673]/g,'\u0627').replace(/\u0624/g,'\u0648').replace(/[\u0626\u0649\u06CC]/g,'\u064A').replace(/\u0621/g,'').replace(/\u0629/g,'\u0647').replace(/\u06C1/g,'\u0647').replace(/\u06A9/g,'\u0643');
 s=s.replace(/[^\u0621-\u064A\s]/g,' ').replace(/\s+/g,' ').trim();return s}
function toks(s){const n=norm(s);return n?n.split(' '):[]}
function lev(a,b){if(a===b)return 0;const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let p=new Array(n+1),c=new Array(n+1);for(let j=0;j<=n;j++)p[j]=j;
 for(let i=1;i<=m;i++){c[0]=i;for(let j=1;j<=n;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1))}[p,c]=[c,p]}return p[n]}
/* tolerance: exact for 1–2 letters, 1 edit up to 4 letters, then about a third of the word */
function sim(a,b){if(!a||!b)return false;if(a===b)return true;const d=lev(a,b),L=Math.max(a.length,b.length);
 if(L<=2)return false;if(L<=4)return d<=1;if(L<=7)return d<=2;return d/L<=0.3}
/* also accept a leading و/ف/ال difference the recognizer often drops or adds */
function wsim(a,b){if(sim(a,b))return true;const st=x=>x.replace(/^(و|ف)(?=..)/,'');const sa=st(a),sb=st(b);if((sa!==a||sb!==b)&&sa.length>2&&sb.length>2){const d=lev(sa,sb);if(d<=(Math.max(sa.length,sb.length)>=7?2:1)&&!(Math.max(sa.length,sb.length)<=3&&d))return true}return false}
function csim(a,b){if(a===b)return true;const d=lev(a,b);return d<=1&&Math.max(a.length,b.length)>=5}
function align(exp,tk,final){const out={pos:0,marks:[],err:null,pending:false,used:0};let i=0,j=0,ins=0;
 const E=exp.length,T=tk.length;
 while(i<E&&j<T){const e=exp[i],t=tk[j];
  if(wsim(t,e)){out.marks[i]='ok';i++;j++;ins=0;continue}
  if(j+1<T&&csim(t+tk[j+1],e)){out.marks[i]='ok';i++;j+=2;ins=0;continue}
  if(i+1<E&&csim(t,e+exp[i+1])){out.marks[i]='ok';out.marks[i+1]='ok';i+=2;j++;ins=0;continue}
  if(i+1<E&&e.length<=3&&wsim(t,exp[i+1])){out.marks[i]='soft';out.marks[i+1]='ok';i+=2;j++;ins=0;continue}
  if(i>0&&wsim(t,exp[i-1])){j++;continue}
  if(ins<1&&j+1<T&&wsim(tk[j+1],e)){ins++;j++;continue}
  if(j===T-1&&!final){out.pending=true;break}
  out.err={at:i,got:t,tok:j};break}
 out.pos=i;out.used=j;out.done=i>=E;return out}
G.ZTM={norm,toks,lev,sim:wsim,align};
})(typeof window!=='undefined'?window:globalThis);

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

/* ===================== 1) التسميع بالصوت ===================== */
function ayEnd(n){return`<span class="z5-end">﴿${ar(n)}﴾</span>`}
/* a recitation session inside el, over segments segs. opts: {self, compact, onDone(res)} */
async function session(el,segs,opts){opts=opts||{};addCss();
 el.innerHTML='<p class="z5-note" style="text-align:center;margin:24px 0">جارٍ تحميل الآيات…</p>';
 let ay;try{ay=await loadAyat(segs)}catch(e){el.innerHTML='<div class="z5-hon">تعذّر تحميل نص الآيات. تأكد من الاتصال وحاول مرة أخرى.</div>';return}
 if(!ay.length){el.innerHTML='<div class="z5-hon">لا توجد آيات في هذا المقطع.</div>';return}
 const exp=[];ay.forEach((v,ai)=>v.w.forEach((w,wi)=>{const n=TM.norm(w);if(n)exp.push({n,ai,w})}));const EN=exp.map(x=>x.n);
 const st={pos:0,base:0,bad:new Set(),soft:new Set(),fin:'',inter:'',on:false,done:false,errAt:-1,self:!!opts.self||!SR,rec:null,pt:0,t0:Date.now()};
 let mode=opts.mode||Z.ts.mode||'fade';
 const words=()=>{let i=0;return ay.map((v,ai)=>v.w.map(w=>{const n=TM.norm(w);return n?`<span class="z5-w" data-i="${i++}">${esc(w)}</span>`:`<span class="z5-w ok">${esc(w)}</span>`}).join(' ')+' '+ayEnd(v.a)).join(' ')};
 el.innerHTML=`<div class="z5-chips" id="z5md">${[['hide','مخفي'],['fade','باهت'],['show','ظاهر']].map(([k,t])=>`<button class="z5-chip${mode===k?' on':''}" data-m="${k}">${t}</button>`).join('')}<button class="z5-chip" id="z5sw">${st.self?'جرّب الميكروفون':'تسميع ذاتي بدون ميكروفون'}</button></div>
  ${!SR?`<div class="z5-hon"><b>متصفحك لا يدعم التعرّف على الصوت.</b> ${isIOS?'على الآيفون جرّب سفاري بأحدث تحديث، أو استخدم':'استخدم كروم على أندرويد أو الكمبيوتر، أو'} «التسميع الذاتي» هنا: تكشف الكلمة التالية وتحدد هل كانت صحيحة.</div>`:''}
  <div class="z5-txt z5-${mode}" id="z5tx">${words()}</div>
  <div id="z5er"></div>
  <div class="z5-bar" id="z5bar"></div>`;
 const tx=$('#z5tx',el),bar=$('#z5bar',el),erb=$('#z5er',el);
 const span=i=>tx.querySelector(`.z5-w[data-i="${i}"]`);
 function paint(){$$('.z5-w.cur',tx).forEach(x=>x.classList.remove('cur'));const c=span(st.pos);if(c&&!st.done){c.classList.add('cur');const r=c.getBoundingClientRect();if(r.top<90||r.bottom>innerHeight-230)c.scrollIntoView({block:'center',behavior:'smooth'})}
  const pg=$('.z5-prog i',bar);if(pg)pg.style.width=Math.round(st.pos/exp.length*100)+'%'}
 function mark(i,cls){const s=span(i);if(!s||st.bad.has(i))return;s.classList.remove('ok','soft','rv');s.classList.add(cls)}
 function drawBar(){if(st.done){bar.hidden=true;return}bar.hidden=false;
  if(st.self){bar.innerHTML=`<div class="z5-row"><button class="z5-btn ok z5-grow" id="z5y">${zi('checkc')} عرفتها</button><button class="z5-btn c z5-grow" id="z5n">✗ أخطأت</button></div><div class="z5-row" style="margin-top:8px"><button class="z5-btn g z5-grow" id="z5ay">اكشف الآية</button><button class="z5-btn g" id="z5ls" aria-label="استمع للآية">${zi('play')} اسمع</button></div><div class="z5-prog"><i></i></div><p class="z5-note" style="margin:6px 0 0">تسميع ذاتي: اقرأ الكلمة من حفظك ثم اضغط، فتنكشف وتُحسب.</p>`;
   $('#z5y',bar).onclick=()=>selfMark(true);$('#z5n',bar).onclick=()=>selfMark(false);$('#z5ay',bar).onclick=()=>{const ai=exp[st.pos]&&exp[st.pos].ai;while(st.pos<exp.length&&exp[st.pos].ai===ai){st.bad.add(st.pos);span(st.pos).classList.add('bad');st.pos++}after()};
   $('#z5ls',bar).onclick=e=>{const x=exp[Math.min(st.pos,exp.length-1)];playAyah(ay[x.ai].k,e.currentTarget)}}
  else{bar.innerHTML=`<div class="z5-row"><button class="z5-mic${st.on?' on':''}" id="z5mic" aria-label="${st.on?'إيقاف':'ابدأ التسميع'}">${st.on?'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'}</button><div class="z5-grow"><b style="font-size:14px">${st.on?'أسمعك… اقرأ من حفظك':st.errAt>=0?'توقّفنا عند خطأ':'اضغط وابدأ القراءة'}</b><div class="z5-heard" id="z5hd">${esc(st.heard||'')}</div></div></div><div class="z5-prog"><i></i></div>`;
   $('#z5mic',bar).onclick=()=>st.on?stop(true):start()}
  paint()}
 function selfMark(ok){if(st.pos>=exp.length)return;const s=span(st.pos);if(ok)s.classList.add('ok');else{st.bad.add(st.pos);s.classList.add('bad')}vb(ok?8:[20,40,20]);st.pos++;after()}
 function after(){paint();if(st.pos>=exp.length)finish()}
 /* --- live recognition --- */
 function start(){if(!SR){st.self=true;drawBar();return}erb.innerHTML='';st.errAt=-1;try{AU.pause()}catch(e){}
  const r=new SR();st.rec=r;r.lang='ar-SA';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;st.fin='';st.inter='';st.base=st.pos;
  r.onresult=e=>{if(st.rec!==r)return;let f='',it='';for(let i=0;i<e.results.length;i++){const x=e.results[i];if(x.isFinal)f+=x[0].transcript+' ';else it+=x[0].transcript+' '}st.fin=f;st.inter=it;proc(false)};
  r.onerror=e=>{if(st.rec!==r)return;const c=e&&e.error;if(c==='no-speech'||c==='aborted')return;st.on=false;st.rec=null;
   erb.innerHTML=`<div class="z5-hon">${c==='not-allowed'||c==='service-not-allowed'?'لم يُسمح باستخدام الميكروفون. فعّله من إعدادات المتصفح لهذا الموقع، أو استخدم «التسميع الذاتي».':c==='network'?'خدمة التعرّف في متصفحك تحتاج اتصالًا بالإنترنت. تأكد من الاتصال أو استخدم «التسميع الذاتي».':'توقّف التعرّف الصوتي ('+esc(c||'')+'). حاول مرة أخرى أو استخدم «التسميع الذاتي».'}</div>`;drawBar()};
  r.onend=()=>{if(st.rec!==r)return;if(st.on&&!st.done&&st.errAt<0){proc(true,true);if(st.on&&!st.done&&st.errAt<0){try{start()}catch(e){}}}};
  try{r.start();st.on=true}catch(e){st.on=false;tst('تعذّر تشغيل الميكروفون')}drawBar()}
 function stop(user){st.on=false;const r=st.rec;st.rec=null;try{r&&r.abort()}catch(e){}clearTimeout(st.pt);if(user)drawBar()}
 function proc(final,quiet){clearTimeout(st.pt);const all=(st.fin+' '+st.inter).trim(),tk=TM.toks(all),nf=TM.toks(st.fin).length;
  st.heard=tk.slice(-9).join(' ');const hd=$('#z5hd',bar);if(hd)hd.textContent=st.heard;
  const r=TM.align(EN.slice(st.base),tk,final);
  for(let k=0;k<r.pos;k++){const i=st.base+k;mark(i,r.marks[k]==='soft'?'soft':'ok');if(r.marks[k]==='soft')st.soft.add(i)}
  st.pos=Math.max(st.pos,st.base+r.pos);paint();
  if(r.done){finish();return}
  if(r.err){if(final||r.err.tok<nf){onErr(st.base+r.err.at,r.err.got);return}st.pt=setTimeout(()=>proc(true),1700);return}
  if(r.pending)st.pt=setTimeout(()=>proc(true),1700);
  if(final&&quiet){st.base=st.pos}}
 function onErr(i,got){if(st.errAt===i)return;stop();st.errAt=i;st.pos=i;st.bad.add(i);const s=span(i);s.classList.remove('ok','soft');s.classList.add('bad');s.classList.add('z5-flash');vb([30,50,30]);
  const x=exp[i],v=ay[x.ai];bar.innerHTML=`<div class="z5-err" role="alert" style="margin:0;border:0;padding:4px 2px;background:none"><div class="z5-row" style="justify-content:space-between"><b>${zi('pin')} توقّفنا هنا</b><small class="z5-note">${sName(v.s)} · الآية ${ar(v.a)}</small></div><p class="z5-note" style="margin:6px 0 2px">الكلمة الصحيحة:</p><div class="w">${esc(x.w)}</div>${got?`<p class="z5-note">سمعنا: «${esc(got)}»</p>`:''}
   <div class="z5-row" style="margin-top:8px"><button class="z5-btn" id="z5lis">${zi('play')} اسمعها</button><button class="z5-btn ok" id="z5go">أكمل من هذه الكلمة</button><button class="z5-btn g" id="z5nx">الآية التالية</button></div></div>`;
  $('#z5lis',bar).onclick=e=>playAyah(v.k,e.currentTarget);
  $('#z5go',bar).onclick=()=>{st.errAt=-1;start()};
  $('#z5nx',bar).onclick=()=>{st.errAt=-1;let j=i;while(j<exp.length&&exp[j].ai===x.ai){if(!span(j).classList.contains('ok')){st.bad.add(j);span(j).classList.add('bad')}j++}st.pos=j;if(j>=exp.length){finish();return}start()};
  const r0=s.getBoundingClientRect();if(r0.top<90||r0.bottom>innerHeight-330)window.scrollBy({top:r0.top-innerHeight*0.3,behavior:'smooth'})}
 function finish(){if(st.done)return;stop();st.done=true;try{AU.pause()}catch(e){}
  const N=exp.length,E=st.bad.size,sc=Math.max(0,Math.round(100*(N-E)/N));const weakK=[...new Set([...st.bad].map(i=>ay[exp[i].ai].k))];
  const g0=segs[0],gl=segs[segs.length-1];const res={d:today(),s:g0.s,a1:g0.a1,a2:gl.s===g0.s?gl.a2:sLen(g0.s),sc,n:N,e:E,src:st.self?'s':'v',weak:weakK,segs,sec:Math.round((Date.now()-st.t0)/1000)};
  logSession(res);drawBar();
  erb.innerHTML=`<div class="z5-card z5-flash" style="text-align:center"><div class="z5-big" style="color:${sc>=90?'#1f7a4f':sc>=70?'#34457a':'#c0693f'}">${ar(sc)}٪</div><p style="margin:4px 0 8px"><b>${sc>=95?'ما شاء الله، تسميع متقن':sc>=80?'تسميع جيد، بقي القليل':sc>=60?'يحتاج إلى مراجعة':'اجعله في مراجعة الغد'}</b></p>
   <div class="z5-st"><div><b>${ar(N)}</b><small>كلمة</small></div><div><b>${ar(E)}</b><small>خطأ</small></div><div><b>${ar(weakK.length)}</b><small>آية ضعيفة</small></div></div>
   ${weakK.length?`<p class="z5-note">الآيات الضعيفة سُجّلت في «رفيق الحفظ» لتُراجَع قريبًا: ${weakK.slice(0,8).map(k=>{const [s,a]=k.split(':');return`${sName(+s)} ${ar(a)}`}).join('، ')}</p>`:''}
   ${opts.compact?'':`<div class="z5-row" style="justify-content:center;margin-top:8px"><button class="z5-btn" id="z5ag">${zi('refresh')} سمّع مرة أخرى</button>${Z.hq.length?`<button class="z5-btn c" id="z5hq">${zi('circles')} شارك في حلقتي</button>`:''}<a class="z5-btn g" href="#srs">رفيق الحفظ</a></div>`}</div>`;
  const ag=$('#z5ag',erb);if(ag)ag.onclick=()=>session(el,segs,opts);const hq=$('#z5hq',erb);if(hq)hq.onclick=()=>postToHalaqa(res);
  try{ZS.rihlaCheck&&ZS.rihlaCheck()}catch(e){}
  opts.onDone&&opts.onDone(res)}
 $$('#z5md [data-m]',el).forEach(b=>b.onclick=()=>{mode=b.dataset.m;Z.ts.mode=mode;sv();$$('#z5md [data-m]',el).forEach(x=>x.classList.toggle('on',x===b));tx.className='z5-txt z5-'+mode});
 $('#z5sw',el).onclick=e=>{if(!SR&&st.self){tst('متصفحك لا يدعم التعرّف على الصوت');return}stop();st.self=!st.self;e.currentTarget.textContent=st.self?'جرّب الميكروفون':'تسميع ذاتي بدون ميكروفون';erb.innerHTML='';drawBar()};
 drawBar();return{st,exp,ay,start,finish}}
function logSession(r){Z.tl.push({d:r.d,s:r.s,a1:r.a1,a2:r.a2,sc:r.sc,n:r.n,e:r.e,src:r.src});if(Z.tl.length>300)Z.tl=Z.tl.slice(-300);
 const tw=TW();r.weak.forEach(k=>{Z.weak[k]=(Z.weak[k]||0)+1;const [s,a]=k.split(':').map(Number);const p=pageOf(s,a);if(p)tw.weak[p]=(tw.weak[p]||0)+1});
 if(r.weak.length)bumpWeak(r.weak);sv()}
async function postToHalaqa(res){if(!Z.hq.length)return;const go=async code=>{const j=await ZS.api('halaqa/progress',{code,range:{s:res.s,a1:res.a1,a2:res.a2},score:res.sc,src:res.src,day:today(),tz:tzOf()}).catch(()=>null);if(j&&j.ok){Z.hqd[today()]=1;sv();tst('وصل تسميعك للحلقة ✓');location.hash='halaqa/'+code}else tst((j&&j.msg)||'تعذّر الإرسال')};
 if(Z.hq.length===1)return go(Z.hq[0].code);const el=sheet(`<b style="font-size:17px">أي حلقة؟</b>${Z.hq.map(h=>`<button class="z5-btn g blk" data-c="${h.code}">${esc(h.name)}</button>`).join('')}`);$$('[data-c]',el).forEach(b=>b.onclick=()=>{el.remove();go(b.dataset.c)})}
const tzOf=()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Riyadh'}catch(e){return'Asia/Riyadh'}};
/* today's hifz ward from the existing plan (خطة الحفظ), as segments */
function wardSegs(){try{const P=planReady();if(!P)return null;const i=firstUndone(),d=P.days[i];if(!d)return null;const m=[];d.u.forEach(u=>{const l=m[m.length-1];if(l&&l.s===u.s&&u.a1<=l.a2+1)l.a2=Math.max(l.a2,u.a2);else m.push({s:u.s,a1:u.a1,a2:u.a2})});return m}catch(e){return null}}
function surahOpts(sel){let h='';for(let s=1;s<=114;s++)h+=`<option value="${s}"${s===sel?' selected':''}>${ar(s)}. ${sName(s)}</option>`;return h}
async function listenRender(arg){addCss();const old=window.ZS&&ZS.oldListen;if(arg==='classic'&&old)return old();
 const m=/^(\d+)(?:\/(\d+)(?:-(\d+))?)?$/.exec(arg||'');if(m){const s=Math.max(1,Math.min(114,+m[1]));Z.ts.s=s;Z.ts.a1=m[2]?Math.max(1,+m[2]):1;Z.ts.a2=m[3]?Math.min(sLen(s),+m[3]):(m[2]?Math.min(sLen(s),Z.ts.a1+4):sLen(s));sv()}
 const t=Z.ts,ward=wardSegs(),due=dueList().length;
 view.innerHTML=`<div class="z5">${head('التسميع بالصوت')}
  <p class="z5-note">اختر المقطع، والنص يختفي أو يبهت، واقرأ من حفظك: الكلمة الصحيحة تظهر بالأخضر، وعند الخطأ نتوقف ونعرض الكلمة الصحيحة مع «اسمعها».</p>
  <div class="z5-card"><div class="z5-row"><select id="z5s" class="z5-grow" aria-label="السورة">${surahOpts(t.s)}</select></div>
   <div class="z5-row" style="margin-top:8px"><label for="z5a1">من آية</label><input type="number" id="z5a1" min="1" value="${t.a1}"><label for="z5a2">إلى</label><input type="number" id="z5a2" min="1" value="${t.a2}"><button class="z5-chip" id="z5all">السورة كاملة</button></div>
   <div class="z5-chips">${ward?`<button class="z5-chip" id="z5wd">${zi('hifz')} ورد الحفظ اليوم</button>`:''}${due?`<a class="z5-chip" href="#srs">${zi('refresh')} مراجعة اليوم (${ar(due)})</a>`:''}<a class="z5-chip" href="#listen/classic">الطريقة السابقة: سجّل ثم قارن</a></div>
   <div class="z5-hon">${zi('mic')} ${HONEST}</div><p class="z5-note">${PRIV}</p></div>
  <div id="z5sess"></div>
  ${Z.tl.length?`<div class="z5-card"><h3>${zi('chart')} آخر جلساتك</h3>${Z.tl.slice(-5).reverse().map(x=>`<div class="z5-row" style="justify-content:space-between;padding:6px 0;border-top:1px solid var(--line)"><span>${sName(x.s)} ${ar(x.a1)}–${ar(x.a2)} <small class="z5-note">${x.src==='v'?'بالصوت':'ذاتي'}</small></span><span class="z5-sc">${ar(x.sc)}٪</span></div>`).join('')}</div>`:''}</div>`;
 const box=$('#z5sess');const run=segs=>session(box,segs,{});
 const cur=()=>{const s=+$('#z5s').value,n=sLen(s);let a1=Math.max(1,Math.min(n,+$('#z5a1').value||1)),a2=Math.max(a1,Math.min(n,+$('#z5a2').value||a1));$('#z5a1').value=a1;$('#z5a2').value=a2;Object.assign(Z.ts,{s,a1,a2});sv();return[{s,a1,a2}]};
 $('#z5s').onchange=()=>{const s=+$('#z5s').value;$('#z5a1').value=1;$('#z5a2').value=Math.min(sLen(s),5);run(cur())};
 $('#z5a1').onchange=$('#z5a2').onchange=()=>run(cur());
 $('#z5all').onclick=()=>{$('#z5a1').value=1;$('#z5a2').value=sLen(+$('#z5s').value);run(cur())};
 const wd=$('#z5wd');if(wd)wd.onclick=()=>run(ward);
 run(cur())}

/* ===================== 2) رفيق الحفظ الذكي (SM-2) ===================== */
/* SM-2 step, pure: q 5 = سهل, 3 = متوسط, 2 = صعب. Intervals follow the app's earlier «مراجعة ذكية» (1 → 3 → ×EF), easy gets a ×1.3 bonus from the 3rd review. */
function sm2(o,q,day){o=Object.assign({ef:2.5,iv:0,n:0},o||{});if(q<3){o.n=0;o.iv=1}else{o.n++;o.iv=o.n===1?1:o.n===2?3:Math.round(o.iv*o.ef*(q===5?1.3:1))}
 o.ef=Math.max(1.3,+(o.ef+0.1-(5-q)*(0.08+(5-q)*0.02)).toFixed(2));o.due=addD(day,Math.max(1,o.iv));o.last=day;delete o.wk;return o}
/* units: memorised pages (the hifz plan's done days + pages added here; scheduled in S.b3.sr like the older «مراجعة ذكية») and ayah ranges (S.zb5.units, scheduled in S.zb5.sr) */
function planPages(){try{return typeof memPages==='function'?memPages():[]}catch(e){return[]}}
function units(){const P=new Set([...planPages(),...Z.memP.map(Number)]);const out=[];[...P].sort((a,b)=>a-b).forEach(p=>out.push({id:'p'+p,p,sr:()=>B3().sr,key:p}));Z.units.forEach(u=>out.push({id:u.id,s:u.s,a1:u.a1,a2:u.a2,sr:()=>Z.sr,key:u.id}));return out}
const srOf=u=>u.sr()[u.key];
const ayKeysOf=u=>{const segs=u.p?pageSegs(u.p):[{s:u.s,a1:u.a1,a2:u.a2}];const ks=[];segs.forEach(g=>{for(let a=g.a1;a<=g.a2;a++)ks.push(g.s+':'+a)});return ks};
const segsOf=u=>u.p?pageSegs(u.p):[{s:u.s,a1:u.a1,a2:u.a2}];
function weakOf(u){let w=0;ayKeysOf(u).forEach(k=>w+=Z.weak[k]||0);if(u.p)w+=(TW().weak[u.p]||0);else{const ps=new Set(ayKeysOf(u).map(k=>{const [s,a]=k.split(':').map(Number);return pageOf(s,a)}));ps.forEach(p=>w+=(TW().weak[p]||0)*0.5)}return w}
/* new units enter the schedule a few per day (S.b3.srPer, default 5, as before) */
function ensure(){const t=today(),per=B3().srPer||5,U=units(),cnt={};U.forEach(u=>{const o=srOf(u);if(o&&o.due)cnt[o.due]=(cnt[o.due]||0)+1});let d=0;
 U.forEach(u=>{if(srOf(u))return;while((cnt[addD(t,d)]||0)>=per)d++;u.sr()[u.key]={ef:2.5,iv:0,n:0,due:addD(t,d)};cnt[addD(t,d)]=(cnt[addD(t,d)]||0)+1});return U}
function score(u){const o=srOf(u)||{},od=Math.max(0,dDiff(o.due||today(),today()));return weakOf(u)*2+(2.5-(o.ef||2.5))*4+od*0.5+(o.wk?3:0)+(o.n?0:0.5)}
function dueList(){const t=today();let U;try{U=ensure()}catch(e){return[]}return U.filter(u=>{const o=srOf(u);return o&&o.due<=t}).sort((a,b)=>score(b)-score(a))}
/* weak ayat from التسميع: the units holding them come back tomorrow at the latest (or today, when not reviewed today) */
function bumpWeak(keys){const t=today(),U=ensure();U.forEach(u=>{const ks=ayKeysOf(u);if(!keys.some(k=>ks.includes(k)))return;const o=srOf(u);if(!o)return;const soon=o.last===t?addD(t,1):t;if(!o.due||o.due>soon)o.due=soon;o.wk=1})}
function rate(u,q){const t=today(),o=sm2(srOf(u),q,t);u.sr()[u.key]=o;const b=B3();b.srLog[t]=(b.srLog[t]||0)+1;Z.rl.push({d:t,id:u.id,q});if(Z.rl.length>800)Z.rl=Z.rl.slice(-800);
 const tw=TW();if(u.p){if(q<3)tw.weak[u.p]=(tw.weak[u.p]||0)+1;else if(q===5&&tw.weak[u.p])tw.weak[u.p]=Math.max(0,tw.weak[u.p]-1)}if(q===5)ayKeysOf(u).forEach(k=>{if(Z.weak[k])Z.weak[k]=Math.max(0,Z.weak[k]-1)});sv();try{ZS.rihlaCheck&&ZS.rihlaCheck()}catch(e){}return o}
function stats(){const U=units(),t=today(),since=addD(t,-30),rl=Z.rl.filter(x=>x.d>=since);const ok=rl.filter(x=>x.q>=3).length;let ayat=0;U.forEach(u=>ayat+=ayKeysOf(u).length);
 return{n:U.length,ayat,due:dueList().length,ret:rl.length?Math.round(ok/rl.length*100):null,rv30:rl.length,mastered:U.filter(u=>(srOf(u)||{}).iv>=21).length}}
const uLabel=u=>u.p?`صفحة ${ar(u.p)} · ${sName((pageSegs(u.p)[0]||{s:1}).s)}`:`${sName(u.s)} ${u.a1===1&&u.a2===sLen(u.s)?'(كاملة)':ar(u.a1)+'–'+ar(u.a2)}`;
const fmtD=k=>{const n=dDiff(today(),k);return n<=0?'اليوم':n===1?'غدًا':n===2?'بعد غد':'بعد '+ar(n)+' أيام'};
function srsRender(arg){addCss();const old=window.ZS&&ZS.oldSrs;if(arg==='classic'&&old)return old();
 const U=ensure();sv();const D=dueList(),st=stats(),t=today();const nx=[];for(let i=1;i<=7;i++){const k=addD(t,i);nx.push([k,U.filter(u=>(srOf(u)||{}).due===k).length])}const mx=Math.max(1,...nx.map(x=>x[1]));
 const remOn=!!(S.rem&&S.rem.on&&S.rem.on.srs);
 view.innerHTML=`<div class="z5">${head('رفيق الحفظ الذكي')}
  <p class="z5-note">يعيد إليك محفوظك في الوقت المناسب قبل أن يتفلّت (تكرار متباعد): استمع، ثم سمّع، ثم قيّم نفسك فيتحدد موعد المراجعة القادمة. الآيات التي تخطئ فيها في «التسميع بالصوت» تعود إليك أسرع.</p>
  <div class="z5-st"><div><b>${ar(st.n)}</b><small>محفوظ (${ar(st.ayat)} آية)</small></div><div><b style="color:${st.due?'#c0693f':'inherit'}">${ar(st.due)}</b><small>مستحقة اليوم</small></div><div><b>${st.ret==null?'—':ar(st.ret)+'٪'}</b><small>نسبة التثبيت (٣٠ يومًا)</small></div></div>
  <div class="z5-card"><h3>${zi('refresh')} مراجعة اليوم</h3><div id="z5due">${!U.length?`<p class="z5-note">لم تسجّل محفوظك بعد. أضف السور أو الصفحات التي تحفظها${typeof planReady==='function'&&planReady()?'، وصفحات خطة الحفظ التي أنجزتها تُضاف تلقائيًا':''}.</p>`:D.length?D.map((u,i)=>`<div class="z5-item"><div class="z5-row" style="justify-content:space-between"><div><b>${uLabel(u)}</b>${weakOf(u)>0?'<span class="z5-tag">ضعيفة</span>':''}${(srOf(u)||{}).n?'':'<span class="z5-tag g">أول مراجعة</span>'}</div><button class="z5-btn" data-rv="${i}">ابدأ</button></div></div>`).join(''):`<p class="z5-note">✅ لا مراجعة مستحقة اليوم. أحسنت!${nx[0][1]?' غدًا: '+ar(nx[0][1]):''}</p>`}</div>
   <button class="z5-btn g blk" id="z5add" style="margin-top:6px">${zi('plus')} أضف محفوظك</button></div>
  <div id="z5rv"></div>
  ${U.length?`<div class="z5-card"><h3>${zi('cal')} الأيام القادمة</h3><div class="z5-chart">${nx.map(([k,n])=>`<div><i style="height:${Math.round(n/mx*62)+3}px;opacity:${n?1:.25}"></i>${n?ar(n):''}<br>${new Date(k+'T12:00:00').toLocaleDateString('ar-SA',{weekday:'short'})}</div>`).join('')}</div></div>`:''}
  <div class="z5-card"><h3>${zi('bell')} تذكير يومي</h3><label class="z5-row"><input type="checkbox" id="z5rem" ${remOn?'checked':''}> <span class="z5-grow">ذكّرني بمراجعة اليوم إذا كانت لديّ مراجعة مستحقة</span><input type="time" id="z5rt" value="${esc(Z.remT||'20:30')}"></label><p class="z5-note">ضمن تنبيهات التطبيق (تظهر في جرس التنبيهات، وكإشعار إذا فعّلت تنبيهات الجهاز).</p></div>
  ${U.length?`<div class="z5-card"><h3>${zi('list')} محفوظي</h3>${U.slice(0,80).map(u=>{const o=srOf(u)||{};return`<div class="z5-row" style="justify-content:space-between;padding:7px 0;border-top:1px solid var(--line)"><span>${uLabel(u)} <small class="z5-note">· ${fmtD(o.due||t)}${o.iv>=21?' · متقنة':''}</small></span>${(u.p&&!Z.memP.map(Number).includes(u.p))?'<small class="z5-note">من خطة الحفظ</small>':`<button class="z5-chip" data-del="${u.id}" aria-label="حذف">×</button>`}</div>`}).join('')}${U.length>80?`<p class="z5-note">و${ar(U.length-80)} غيرها</p>`:''}</div>`:''}
  <p class="z5-note"><a href="#srs/classic">الصفحة السابقة «مراجعة ذكية»</a> تعمل على نفس البيانات.</p></div>`;
 $$('[data-rv]').forEach(b=>b.onclick=()=>review(D[+b.dataset.rv]));
 $('#z5add').onclick=addSheet;
 $$('[data-del]').forEach(b=>b.onclick=()=>{const id=b.dataset.del;if(!confirm('حذف من محفوظك؟'))return;if(id[0]==='p'){Z.memP=Z.memP.filter(p=>'p'+p!==id);delete B3().sr[+id.slice(1)]}else{Z.units=Z.units.filter(u=>u.id!==id);delete Z.sr[id]}sv();srsRender()});
 $('#z5rem').onchange=e=>{S.rem=S.rem||{on:{}};S.rem.on=S.rem.on||{};S.rem.on.srs=e.target.checked;sv();tst(e.target.checked?'سنذكّرك يوميًا إذا كانت لديك مراجعة':'أوقفنا التذكير')};
 $('#z5rt').onchange=e=>{Z.remT=e.target.value||'20:30';sv()}}
function addSheet(){const el=sheet(`<b style="font-size:18px">أضف محفوظك</b><div class="z5-chips" id="z5k"><button class="z5-chip on" data-k="s">سورة</button><button class="z5-chip" data-k="a">آيات</button><button class="z5-chip" data-k="p">صفحات</button><button class="z5-chip" data-k="j">جزء</button></div><div id="z5f"></div><button class="z5-btn blk" id="z5sv">حفظ</button>`);
 let k='s';const f=$('#z5f',el);const draw=()=>{f.innerHTML=k==='s'?`<label>السورة</label><select id="z5fs">${surahOpts(67)}</select>`:k==='a'?`<label>السورة</label><select id="z5fs">${surahOpts(67)}</select><div class="z5-row"><label>من آية</label><input type="number" id="z5f1" value="1" min="1"><label>إلى</label><input type="number" id="z5f2" value="10" min="1"></div>`:k==='p'?`<div class="z5-row"><label>من صفحة</label><input type="number" id="z5f1" value="582" min="1" max="604"><label>إلى</label><input type="number" id="z5f2" value="604" min="1" max="604"></div><p class="z5-note">كل صفحة تصبح وحدة مراجعة.</p>`:`<label>الجزء</label><select id="z5fj">${Array.from({length:30},(_,i)=>`<option value="${i+1}"${i===29?' selected':''}>الجزء ${ar(i+1)}</option>`).join('')}</select><p class="z5-note">صفحات الجزء كلها تُضاف وتدخل المراجعة تدريجيًا.</p>`};draw();
 $$('#z5k [data-k]',el).forEach(b=>b.onclick=()=>{k=b.dataset.k;$$('#z5k [data-k]',el).forEach(x=>x.classList.toggle('on',x===b));draw()});
 $('#z5sv',el).onclick=()=>{let added=0;const addR=(s,a1,a2)=>{const id='r'+s+'_'+a1+'_'+a2;if(!Z.units.some(u=>u.id===id)){Z.units.push({id,s,a1,a2,at:today()});added++}};const addP=p=>{if(!Z.memP.map(Number).includes(p)&&!planPages().includes(p)){Z.memP.push(p);added++}};
  if(k==='s'){const s=+$('#z5fs',el).value;addR(s,1,sLen(s))}else if(k==='a'){const s=+$('#z5fs',el).value,n=sLen(s);const a1=Math.max(1,Math.min(n,+$('#z5f1',el).value||1)),a2=Math.max(a1,Math.min(n,+$('#z5f2',el).value||a1));addR(s,a1,a2)}
  else if(k==='p'){const p1=Math.max(1,Math.min(604,+$('#z5f1',el).value||1)),p2=Math.max(p1,Math.min(604,+$('#z5f2',el).value||p1));if(p2-p1>40){tst('أضف ٤٠ صفحة كحد أقصى في المرة');return}for(let p=p1;p<=p2;p++)addP(p)}
  else{const j=+$('#z5fj',el).value;const ps=[...new Set(SG().filter(x=>x.j===j).map(x=>x.p))];ps.forEach(addP)}
  sv();el.remove();tst(added?'أُضيف ✓ ('+ar(added)+')':'موجود مسبقًا');srsRender()}}
/* the review flow: 1) listen (المصحف الناطق's reciter) 2) recite (voice or self-check) 3) rate */
async function review(u){if(!u)return;const box=$('#z5rv');let step=1,res=null,stopF={stop:false};let ay=[];try{ay=await loadAyat(segsOf(u))}catch(e){}
 const draw=()=>{const o=srOf(u)||{};const sug=res?(res.sc>=90?5:res.sc>=70?3:2):0;
  box.innerHTML=`<div class="z5-card" id="z5rc"><div class="z5-row" style="justify-content:space-between"><h3 style="margin:0">${zi('refresh')} ${uLabel(u)}</h3><button class="z5-chip" id="z5cl">إغلاق</button></div>
   <div class="z5-steps"><span class="${step===1?'on':step>1?'dn':''}">١ استمع</span><span class="${step===2?'on':step>2?'dn':''}">٢ سمّع</span><span class="${step===3?'on':''}">٣ قيّم</span></div>
   ${step===1?`<p class="z5-note">استمع للمقطع بصوت القارئ المختار في التطبيق وأنت تتابع، ثم انتقل للتسميع.</p><div class="z5-row"><button class="z5-btn" id="z5pl">${zi('play')} استمع (${ar(ay.length)} آية)</button><button class="z5-btn g" id="z5n1">تخطَّ إلى التسميع</button></div><p class="z5-heard" id="z5pa"></p>`:
    step===2?`<div id="z5ss"></div><button class="z5-btn g blk" id="z5n2" style="margin-top:8px">قيّم بدون تسميع</button>`:
    `${res?`<p class="z5-note">نتيجة التسميع: <b>${ar(res.sc)}٪</b>. نقترح «${sug===5?'سهل':sug===3?'متوسط':'صعب'}».</p>`:'<p class="z5-note">كيف كان حفظك لهذا المقطع؟</p>'}
     <div class="z5-rate"><button data-q="5" class="${sug===5?'sug':''}">سهل<small>${fmtD(sm2(o,5,today()).due)}</small></button><button data-q="3" class="${sug===3?'sug':''}">متوسط<small>${fmtD(sm2(o,3,today()).due)}</small></button><button data-q="2" class="${sug===2?'sug':''}">صعب<small>${fmtD(sm2(o,2,today()).due)}</small></button></div>`}</div>`;
  $('#z5cl',box).onclick=()=>{stopF.stop=true;try{AU.pause()}catch(e){}box.innerHTML=''};
  if(step===1){$('#z5pl',box).onclick=async e=>{const b=e.currentTarget;if(b.dataset.on){stopF.stop=true;AU.pause();b.dataset.on='';b.innerHTML=zi('play')+' استمع';return}stopF={stop:false};b.dataset.on='1';b.textContent='إيقاف';await playRange(ay,i=>{const pa=$('#z5pa',box);if(pa)pa.textContent='الآية '+ar(ay[i].a)+' من '+sName(ay[i].s)},stopF);if(!stopF.stop){step=2;draw()}};$('#z5n1',box).onclick=()=>{stopF.stop=true;try{AU.pause()}catch(e){}step=2;draw()}}
  if(step===2){session($('#z5ss',box),segsOf(u),{compact:true,mode:'hide',onDone:r=>{res=r;setTimeout(()=>{step=3;draw()},1200)}});$('#z5n2',box).onclick=()=>{step=3;draw()}}
  if(step===3)$$('[data-q]',box).forEach(b=>b.onclick=()=>{const o2=rate(u,+b.dataset.q);vb(12);tst('تم ✓ المراجعة القادمة '+fmtD(o2.due));box.innerHTML='';srsRender()});
  $('#z5rc',box).scrollIntoView({block:'start',behavior:'smooth'})};draw()}

/* ===================== 3) حلقة التحفيظ ===================== */
const api=(p,b)=>ZS.api(p,b);
const err=(r,d)=>(r&&r.msg)||(r&&r._s===429?'محاولات كثيرة، حاول لاحقًا':d||'تعذّر الاتصال، حاول مرة أخرى');
const appUrl=h=>{const u=(window.ZAD_URL||location.origin+location.pathname.replace(/index\.html$/,''))+'#'+h;try{return ZS.refUrl?ZS.refUrl(u):u}catch(e){return u}};
async function shareLink(title,text,url){try{if(navigator.share){await navigator.share({title,text,url});return}}catch(x){if(x&&x.name==='AbortError')return}try{await navigator.clipboard.writeText(text+'\n'+url);tst('تم نسخ الرابط')}catch(x){sheet(`<b>الرابط</b><input type="text" value="${esc(url)}" readonly onclick="this.select()" style="width:100%;direction:ltr">`)}}
const tgtLabel=t=>!t||!t.k?'':t.k==='j'?'الجزء '+ar(t.v):t.k==='p'?'صفحة '+ar(t.v):'سورة '+sName(t.v);
const wkLabel=w=>!w||(!w.s&&!w.t)?'':`${w.s?`${sName(w.s)} ${ar(w.a1)}–${ar(w.a2)}`:''}${w.t?(w.s?' · ':'')+esc(w.t):''}`;
function hqRemember(code,name,role){Z.hq=[{code,name,role}].concat(Z.hq.filter(h=>h.code!==code)).slice(0,8);sv()}
const dN=s=>String(s||'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
let HT=0;
function halaqaRender(arg){addCss();clearInterval(HT);const code=dN(arg).toUpperCase();if(/^[A-Z2-9]{6}$/.test(code))return board(code);
 view.innerHTML=`<div class="z5">${head('حلقة التحفيظ')}
  <p class="z5-note">حلقة خاصة عبر الإنترنت مع أصحابك أو طلابك (حتى ٣٠ عضوًا): كل واحد يسجّل تسميعه اليوم ودرجته، فترون تقدّم بعضكم ويشجّع بعضكم بعضًا. منشئ الحلقة هو معلّمها: يحدد «المقرر» الأسبوعي ويدير الأعضاء.</p>
  ${Z.hq.length?`<div class="z5-card"><h3>${zi('circles')} حلقاتي</h3>${Z.hq.map(h=>`<a class="z5-item z5-row" style="justify-content:space-between;text-decoration:none;color:inherit" href="#halaqa/${h.code}"><b>${esc(h.name)}</b><small class="z5-note">${h.role==='t'?'معلّم':'عضو'} · <span style="direction:ltr;display:inline-block">${h.code}</span> ›</small></a>`).join('')}</div>`:''}
  <div class="z5-card"><h3>${zi('plus')} أنشئ حلقة</h3><label class="z5-note" for="z5hn">اسم الحلقة</label><input type="text" id="z5hn" maxlength="40" placeholder="مثال: حلقة جزء عمّ" style="width:100%"><label class="z5-note" for="z5hm">اسمك</label><input type="text" id="z5hm" maxlength="20" placeholder="الاسم الذي يظهر لهم" style="width:100%" value="${esc((S.profile&&S.profile.name)||'')}">
   <label class="z5-note">هدف الحلقة</label><div class="z5-row"><select id="z5hk"><option value="s">سورة</option><option value="j">جزء</option></select><select id="z5hv" class="z5-grow">${surahOpts(67)}</select></div>
   <button class="z5-btn blk" id="z5hc" style="margin-top:10px">أنشئ الحلقة واحصل على الرمز</button></div>
  <div class="z5-card"><h3>${zi('circles')} انضم لحلقة</h3><div class="z5-row"><input type="text" id="z5hj" maxlength="6" placeholder="الرمز (٦ خانات)" style="direction:ltr;text-transform:uppercase;letter-spacing:3px" class="z5-grow"><button class="z5-btn" id="z5hjb">انضم</button></div></div>
  <p class="z5-note">لا محادثة مفتوحة: فقط ملاحظة قصيرة مع تسميعك تمر على فلتر الكلمات والأرقام والروابط، وزر «إبلاغ» يخفي أي ملاحظة بعد ٣ بلاغات.</p></div>`;
 $('#z5hk').onchange=e=>{$('#z5hv').innerHTML=e.target.value==='j'?Array.from({length:30},(_,i)=>`<option value="${i+1}"${i===29?' selected':''}>الجزء ${ar(i+1)}</option>`).join(''):surahOpts(67)};
 $('#z5hc').onclick=async e=>{const b=e.currentTarget,name=$('#z5hn').value.trim(),me=$('#z5hm').value.trim();if(!name||!me){tst('اكتب اسم الحلقة واسمك');return}b.disabled=true;
  const r=await api('halaqa/create',{name,me,target:{k:$('#z5hk').value,v:+$('#z5hv').value}}).catch(()=>null);b.disabled=false;if(!r||!r.ok){tst(err(r));return}
  hqRemember(r.code,name,'t');try{if(S.profile&&!S.profile.name){S.profile.name=me}}catch(x){}Z.hqMe=me;sv();location.hash='halaqa/'+r.code;setTimeout(()=>invite(r.code,name),700)};
 $('#z5hjb').onclick=()=>{const c=dN($('#z5hj').value).trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(c)){tst('الرمز ٦ خانات');return}location.hash='halaqa/'+c}}
function invite(code,name){const u=appUrl('halaqa/'+code);const el=sheet(`<b style="font-size:18px">ادعُ أصحابك</b><p class="z5-note">أرسل الرابط أو الرمز. يفتحون الرابط ويكتبون أسماءهم وينضمون (حتى ٣٠).</p><div class="z5-code">${code}</div><button class="z5-btn blk" id="z5sh">${zi('share')} أرسل الرابط</button>`);
 $('#z5sh',el).onclick=()=>shareLink('حلقة التحفيظ',`انضم لحلقة التحفيظ «${name}» في تطبيق زاد. الرمز: ${code}`,u)}
async function board(code){view.innerHTML=`<div class="z5">${head('حلقة التحفيظ')}<p class="z5-note" style="text-align:center;margin:30px">جارٍ التحميل…</p></div>`;
 let r=await api('halaqa/get?code='+code+'&tz='+encodeURIComponent(tzOf())).catch(()=>null);
 if(r&&r.error==='not member'){const pk=await api('halaqa/peek?code='+code).catch(()=>null);if(!pk||!pk.ok){view.innerHTML=`<div class="z5">${head('حلقة التحفيظ')}<div class="z5-hon">${esc(err(pk,'لم نجد هذه الحلقة'))}</div></div>`;return}
  view.innerHTML=`<div class="z5">${head('حلقة التحفيظ')}<div class="z5-card" style="text-align:center"><h3 style="justify-content:center">${zi('circles')} ${esc(pk.halaqa.name)}</h3><p class="z5-note">${tgtLabel(pk.halaqa.target)} · ${ar(pk.halaqa.n)} عضو من ٣٠</p>
   <input type="text" id="z5jn" maxlength="20" placeholder="اسمك" style="width:100%;margin:8px 0" value="${esc(Z.hqMe||(S.profile&&S.profile.name)||'')}"><button class="z5-btn blk" id="z5jb">انضم للحلقة</button><p class="z5-note">يظهر للأعضاء اسمك وتسميعك اليومي ودرجتك فقط.</p></div></div>`;
  $('#z5jb').onclick=async e=>{const nm=$('#z5jn').value.trim();if(!nm){tst('اكتب اسمك');return}e.currentTarget.disabled=true;const j=await api('halaqa/join',{code,me:nm}).catch(()=>null);if(!j||!j.ok){e.currentTarget.disabled=false;tst(err(j));return}Z.hqMe=nm;hqRemember(code,j.halaqa.name,'s');draw(j)};return}
 if(!r||!r.ok){if(r&&(r._s===404||r._s===403||r._s===410)){Z.hq=Z.hq.filter(h=>h.code!==code);sv()}view.innerHTML=`<div class="z5">${head('حلقة التحفيظ')}<div class="z5-hon">${esc(err(r))}</div><a class="z5-btn g" href="#halaqa">حلقاتي</a></div>`;return}
 draw(r);HT=setInterval(async()=>{if(location.hash.slice(1).split('/')[0]!=='halaqa'){clearInterval(HT);return}if(document.visibilityState!=='visible'||$('.z5sh'))return;const j=await api('halaqa/get?code='+code).catch(()=>null);if(j&&j.ok)draw(j,true)},30000);
 function draw(r,quiet){const H=r.halaqa,me=r.me,t=r.today||today(),M=r.members;hqRemember(code,H.name,me.role);const mine=M.find(m=>m.me)||{};const last=[...Z.tl].reverse().find(x=>x.d===today());
  const wk=H.weekly||{},days=[];for(let i=6;i>=0;i--)days.push(addD(t,-i));
  const sorted=M.slice().sort((a,b)=>((b.prog.day===t)-(a.prog.day===t))||(b.streak-a.streak));
  const sy=window.scrollY;
  view.innerHTML=`<div class="z5">${head('حلقة التحفيظ')}
   ${(r.cheers||[]).map(c=>`<div class="z5-hon z5-flash">${zi('heart')} <b>${esc(c.from)}</b>: ${esc(c.text)}</div>`).join('')}
   ${H.hidden?'<div class="z5-hon">هذه الحلقة مخفية مؤقتًا بسبب بلاغات، والمشرف يراجعها.</div>':''}
   <div class="z5-card"><div class="z5-row" style="justify-content:space-between"><h3 style="margin:0">${zi('circles')} ${esc(H.name)}</h3><button class="z5-chip" id="z5inv">${zi('share')} ادعُ</button></div>
    <p class="z5-note">${tgtLabel(H.target)} · ${ar(M.length)} من ${ar(H.max||30)} · الرمز <b style="direction:ltr;display:inline-block;letter-spacing:2px">${code}</b>${me.teacher?' · أنت المعلّم':''}</p>
    <div class="z5-item" style="background:var(--z-soft,#eef0f7);border:0"><b>${zi('target')} المقرر هذا الأسبوع</b><p style="margin:4px 0 0">${wkLabel(wk)||'<span class="z5-note">لم يحدده المعلّم بعد</span>'}</p>${me.teacher?'<button class="z5-chip" id="z5wk" style="margin-top:6px">حدّد المقرر</button>':''}</div></div>
   <div class="z5-card"><h3>${zi('mic')} تسميعي اليوم</h3>${mine.prog&&mine.prog.day===t?`<p class="z5-note">سجّلت اليوم: ${sName(mine.prog.s)} ${ar(mine.prog.a1)}–${ar(mine.prog.a2)} · <span class="z5-sc">${ar(mine.prog.score)}٪</span> ${mine.prog.src==='v'?'(بالصوت)':''} · 🔥 ${ar(mine.streak)}</p>`:''}
    <div class="z5-row"><select id="z5ps" class="z5-grow">${surahOpts((last&&last.s)||wk.s||(H.target&&H.target.k==='s'?H.target.v:67))}</select></div>
    <div class="z5-row" style="margin-top:6px"><label>من</label><input type="number" id="z5p1" value="${(last&&last.a1)||wk.a1||1}" min="1"><label>إلى</label><input type="number" id="z5p2" value="${(last&&last.a2)||wk.a2||5}" min="1"></div>
    <label class="z5-note">درجتك ${last?`(من آخر تسميع بالصوت اليوم: ${ar(last.sc)}٪)`:'(تقييم ذاتي)'}</label><div class="z5-chips" id="z5pc">${[100,90,80,70,60,50].map(v=>`<button class="z5-chip${(last?Math.round(last.sc/10)*10:90)===v?' on':''}" data-v="${v}">${ar(v)}${v===50?'٪ أو أقل':'٪'}</button>`).join('')}</div>
    <input type="text" id="z5pn" maxlength="80" placeholder="ملاحظة قصيرة (اختياري)" style="width:100%" value="${esc(mine.note||'')}">
    <div class="z5-row" style="margin-top:8px"><button class="z5-btn z5-grow" id="z5pb">${zi('checkc')} سجّل تسميعي</button><a class="z5-btn g" id="z5pv" href="#listen">سمّع بالصوت</a></div>
    ${mine.note_hidden?'<p class="z5-note">ملاحظتك أُخفيت بعد بلاغات.</p>':''}</div>
   <div class="z5-card"><h3>${zi('circles')} لوحة الحلقة</h3>${sorted.map(m=>{const pd=m.prog&&m.prog.day===t;const wd=new Set((m.week||[]).map(x=>x[0]));return`<div class="z5-mem"><span class="z5-av${m.role==='t'?' t':''}">${esc((m.name||'؟').slice(0,1))}</span><div class="z5-grow"><b>${esc(m.name)}</b>${m.role==='t'?'<span class="z5-tag">المعلّم</span>':''}${m.me?'<span class="z5-tag g">أنت</span>':''}
     <div class="z5-note" style="margin:2px 0">${pd?`${sName(m.prog.s)} ${ar(m.prog.a1)}–${ar(m.prog.a2)} · <span class="z5-sc">${ar(m.prog.score)}٪</span>${m.prog.src==='v'?' 🎙':''}`:'لم يسجّل اليوم'}${m.streak&&(m.last===t||m.last===addD(t,-1))?` · 🔥 ${ar(m.streak)}`:''}</div>
     ${m.note?`<div class="z5-note" style="color:var(--ink)">«${esc(m.note)}» ${m.me?'':`<button class="z5-chip" data-rp="${m.mid}" style="padding:2px 8px;font-size:11px">إبلاغ</button>`}</div>`:''}
     <div class="z5-dots" aria-label="آخر ٧ أيام">${days.map(d=>`<i class="${wd.has(d)?'on':''}" title="${d}"></i>`).join('')}</div></div>
     ${m.me?'':`<div style="display:flex;flex-direction:column;gap:4px"><button class="z5-chip" data-ch="${m.mid}" data-nm="${esc(m.name)}">${zi('heart')} شجّع</button>${me.teacher?`<button class="z5-chip" data-rm="${m.mid}" data-nm="${esc(m.name)}" style="font-size:11px">إزالة</button>`:''}</div>`}</div>`}).join('')}</div>
   <div class="z5-row" style="justify-content:center;margin:12px 0"><button class="z5-chip" id="z5lv">مغادرة الحلقة</button>${me.teacher?'<button class="z5-chip" id="z5dl">حذف الحلقة</button>':''}<button class="z5-chip" id="z5rq">إبلاغ عن الحلقة</button><a class="z5-chip" href="#halaqa">حلقاتي</a></div></div>`;
  if(quiet)window.scrollTo(0,sy);
  $('#z5inv').onclick=()=>invite(code,H.name);
  $('#z5pv').href='#listen/'+$('#z5ps').value+'/'+$('#z5p1').value+'-'+$('#z5p2').value;$('#z5ps').onchange=$('#z5p1').onchange=$('#z5p2').onchange=()=>{$('#z5pv').href='#listen/'+$('#z5ps').value+'/'+$('#z5p1').value+'-'+$('#z5p2').value};
  let sc=last?Math.round(last.sc/10)*10:90;if(sc<50)sc=50;$$('#z5pc [data-v]').forEach(b=>b.onclick=()=>{sc=+b.dataset.v;$$('#z5pc [data-v]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#z5pb').onclick=async e=>{const s=+$('#z5ps').value,n=sLen(s);const a1=Math.max(1,Math.min(n,+$('#z5p1').value||1)),a2=Math.max(a1,Math.min(n,+$('#z5p2').value||a1));const useV=last&&last.s===s&&last.a1===a1&&last.a2===a2;
   e.currentTarget.disabled=true;const j=await api('halaqa/progress',{code,range:{s,a1,a2},score:useV?last.sc:sc,src:useV?last.src:'s',note:$('#z5pn').value.trim(),day:today(),tz:tzOf()}).catch(()=>null);
   if(!j||!j.ok){e.currentTarget.disabled=false;tst(err(j));return}Z.hqd[today()]=1;sv();vb(12);tst('سُجّل تسميعك ✓');try{ZS.rihlaCheck&&ZS.rihlaCheck()}catch(x){}draw(j)};
  $$('[data-ch]').forEach(b=>b.onclick=()=>{const el=sheet(`<b style="font-size:17px">شجّع ${esc(b.dataset.nm)}</b>${(r.msgs||[]).map((m,i)=>`<button class="z5-btn g blk" data-m="${i}">${esc(m)}</button>`).join('')}`);$$('[data-m]',el).forEach(x=>x.onclick=async()=>{const j=await api('halaqa/cheer',{code,to:b.dataset.ch,m:+x.dataset.m}).catch(()=>null);el.remove();tst(j&&j.ok?'وصل تشجيعك 🤍':err(j))})});
  $$('[data-rp]').forEach(b=>b.onclick=()=>report(code,b.dataset.rp));$('#z5rq').onclick=()=>report(code,'');
  $$('[data-rm]').forEach(b=>b.onclick=async()=>{if(!confirm('إزالة '+b.dataset.nm+' من الحلقة؟ لن يستطيع الانضمام بالرمز مرة أخرى.'))return;const j=await api('halaqa/remove',{code,mid:b.dataset.rm}).catch(()=>null);if(j&&j.ok){tst('أُزيل');draw(j)}else tst(err(j))});
  const wb=$('#z5wk');if(wb)wb.onclick=()=>{const el=sheet(`<b style="font-size:17px">المقرر هذا الأسبوع</b><select id="z5ws">${surahOpts(wk.s||(H.target&&H.target.k==='s'?H.target.v:67))}</select><div class="z5-row"><label>من آية</label><input type="number" id="z5w1" value="${wk.a1||1}" min="1"><label>إلى</label><input type="number" id="z5w2" value="${wk.a2||10}" min="1"></div><input type="text" id="z5wt" maxlength="60" placeholder="وصف قصير (اختياري)" value="${esc(wk.t||'')}"><button class="z5-btn blk" id="z5wsv">حفظ المقرر</button>`);
   $('#z5wsv',el).onclick=async()=>{const s=+$('#z5ws',el).value,n=sLen(s),a1=Math.max(1,Math.min(n,+$('#z5w1',el).value||1)),a2=Math.max(a1,Math.min(n,+$('#z5w2',el).value||a1));const j=await api('halaqa/set',{code,weekly:{s,a1,a2,t:$('#z5wt',el).value.trim()}}).catch(()=>null);if(j&&j.ok){el.remove();tst('حُدّد المقرر ✓');draw(j)}else tst(err(j))}};
  $('#z5lv').onclick=async()=>{if(!confirm('مغادرة الحلقة؟'))return;const j=await api('halaqa/leave',{code}).catch(()=>null);if(j&&j.ok){Z.hq=Z.hq.filter(h=>h.code!==code);sv();location.hash='halaqa'}else tst(err(j))};
  const dl=$('#z5dl');if(dl)dl.onclick=async()=>{if(!confirm('حذف الحلقة نهائيًا لكل الأعضاء؟'))return;const j=await api('halaqa/delete',{code}).catch(()=>null);if(j&&j.ok){Z.hq=Z.hq.filter(h=>h.code!==code);sv();location.hash='halaqa'}else tst(err(j))}}}
function report(code,mid){const el=sheet(`<b style="font-size:17px">إبلاغ</b><p class="z5-note">إذا وُجدت إساءة أو كلام غير لائق أو رقم جوال أو رابط، أبلغنا. ${mid?'الملاحظة تختفي':'الحلقة تتوقف'} تلقائيًا إذا أبلغ عنها ٣ أشخاص حتى يراجعها المشرف.</p><input type="text" id="z5rr" maxlength="60" placeholder="السبب (اختياري)"><button class="z5-btn" id="z5rg">إرسال البلاغ</button>`);
 $('#z5rg',el).onclick=async()=>{const j=await api('halaqa/report',{code,mid,reason:$('#z5rr',el).value}).catch(()=>null);el.remove();tst(j&&j.ok?'وصلنا بلاغك، جزاك الله خيرًا':err(j))}}
/* the reminder hook in zs.js asks for today's due count without loading the UI */
window.ZB5={listen:listenRender,srs:srsRender,halaqa:halaqaRender,session,sm2,dueList,stats,units,ensure,rate,bumpWeak,TM,_Z:Z};
})();

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
