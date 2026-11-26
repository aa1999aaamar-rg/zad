/* زاد v4.3: «مقالات» + «اقتباسات وحِكم» (lazy module, loaded on first use). Content JSON lives on zad-content.sites.tab.bot (CORS). */
(function(){'use strict';
try{const st=document.createElement('style');st.textContent=".zart-li{padding:14px 16px}.zart-li b{display:block;font-size:16px;line-height:1.6;margin:2px 0}.zart-li p{margin:6px 0 0;font-size:13px;color:var(--muted);line-height:1.8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\n.zart-cat{display:inline-block;font-size:11px;font-weight:700;color:var(--z-clay);background:color-mix(in srgb,var(--z-clay) 12%,var(--card));padding:2px 9px;border-radius:999px}\n.zart-fv svg{width:18px;height:18px;color:var(--z-clay)}\n.zart-b{line-height:2.05;color:var(--ink);margin-top:14px;word-wrap:break-word;overflow-wrap:anywhere}.zart-b p{margin:0 0 .9em}.zart-b h3,.zart-b h4{font-size:1.08em;margin:1.3em 0 .5em;color:var(--accent)}.zart-b ul,.zart-b ol{padding-inline-start:1.3em}.zart-b blockquote{margin:.6em 0;padding:.4em .9em;border-inline-start:3px solid var(--z-clay);background:var(--bg-2);border-radius:8px}\n.zart-src{font-size:13.5px;line-height:1.9;margin-top:22px}.zart-src a{color:var(--accent);font-weight:700}\n.zqcats{display:flex;gap:8px;overflow-x:auto;padding:10px 2px;scrollbar-width:none}.zqcats::-webkit-scrollbar{display:none}.zqcats .zchip{flex:none}.zchip.on{background:var(--ink);color:var(--bg);border-color:var(--ink)}\n.zqc .zqc-l{font-size:12px;font-weight:700;color:var(--z-clay);margin-bottom:6px}.zqc .zqc-t{font-family:Amiri,serif;font-size:21px;line-height:1.9;color:var(--ink)}.zqc .zverse{font-size:22px}.zqc .zref a{color:var(--accent)}\n.zchip[aria-pressed=true] svg{fill:currentColor}";document.head.appendChild(st)}catch(e){}
const CB='https://zad-content.sites.tab.bot/x/';
const zi=window.ZI,ar=x=>AR(x),ZD=window.ZDATA||{v:[],h:[]},ZT=window.ZT,zDraw=window.zDraw;
const dayN=()=>{const d=new Date;return Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(2026,0,1))/864e5)};
const Q=S.z43=Object.assign({fav:{},qfav:{},fs:18,tpl:0,qs:'q'},S.z43||{});
if(!Q.fav||typeof Q.fav!=='object')Q.fav={};if(!Q.qfav||typeof Q.qfav!=='object')Q.qfav={};
const CAT={isl:'إسلامية',cul:'ثقافية',his:'تاريخية'};
const back=(h,l)=>`<button class="back" onclick="location.hash='${h}'">${zi('chev')} ${l}</button>`;
const mins=w=>Math.max(1,Math.round((w||0)/180));const rt=w=>{const n=mins(w);return n===1?'دقيقة قراءة':n===2?'دقيقتان قراءة':ar(n)+(n<11?' دقائق':' دقيقة')+' قراءة'};
const norm=s=>String(s||'').replace(/[\u064B-\u0652\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase();
async function getJ(u,key){try{const r=await fetch(u,{cache:'no-cache'});if(!r.ok)throw 0;const j=await r.json();if(key)try{localStorage.setItem(key,JSON.stringify(j))}catch(e){}return j}catch(e){if(key){try{const c=localStorage.getItem(key);if(c)return JSON.parse(c)}catch(x){}}throw e}}
/* ---------------- articles ---------------- */
let IDX=null;
async function idx(){if(IDX)return IDX;let items=[];try{items=(await getJ(CB+'articles.json','zad.art.idx')).items||[]}catch(e){}
 try{const r=await fetch('/api/articles',{cache:'no-store'});if(r.ok){const j=await r.json();(j.items||[]).forEach(x=>items.unshift(Object.assign({mine:1},x)))}}catch(e){}
 return IDX=items}
const BODY={};
async function body(a){if(BODY[a.id])return BODY[a.id];let j;if(a.mine){const r=await fetch('/api/articles/'+encodeURIComponent(a.id));if(!r.ok)throw 0;j=await r.json()}else j=await getJ(CB+'a/'+a.id+'.json','zad.art.'+a.id);return BODY[a.id]=j.h||''}
function artLi(a){const fav=!!Q.fav[a.id];return`<a class="zcard zart-li" href="#article/${a.id}"><div class="zrow" style="gap:8px;align-items:flex-start"><div class="grow"><span class="zart-cat">${CAT[a.c]||''}</span><b>${esc(a.t)}</b><div class="k">${esc(a.au||'')}${a.au?' • ':''}${rt(a.w)}${fav?' • محفوظ':''}</div></div>${fav?`<span class="zart-fv">${zi('bookmark')}</span>`:''}</div><p>${esc(a.ex||'')}</p></a>`}
V.articles=async arg=>{const cat=CAT[arg]||arg==='fav'?arg:'all';
 view.innerHTML=`${back('services','المزيد')}<h1 class="page">مقالات</h1><p class="znote">مقالات إسلامية من IslamHouse بنصها الكامل، ومقتطفات ثقافية وتاريخية من ويكيبيديا العربية مع رابط المصدر تحت كل مقال.</p>
 <label class="zsearch">${zi('search')}<input type="search" id="zaq" placeholder="ابحث في عناوين المقالات…" autocomplete="off"></label>
 <div class="zseg" style="margin:10px 0" id="zacs">${[['all','الكل'],['isl','إسلامية'],['cul','ثقافية'],['his','تاريخية'],['fav','المحفوظة']].map(([k,l])=>`<button data-c="${k}" class="${k===cat?'on':''}">${l}</button>`).join('')}</div><div id="zal"><p class="znote" style="text-align:center;margin:30px">جارٍ التحميل…</p></div>`;
 let items=[];try{items=await idx()}catch(e){}
 if(!$('#zaq'))return;
 const q0=sessionStorage.getItem('zad.art.q')||'';const inp=$('#zaq');inp.value=q0;
 const draw=()=>{const q=norm(inp.value.trim());sessionStorage.setItem('zad.art.q',inp.value);const c=($('#zacs .on')||{}).dataset?$('#zacs .on').dataset.c:'all';
  let L=items.filter(a=>c==='all'||(c==='fav'?Q.fav[a.id]:a.c===c));if(q)L=L.filter(a=>norm(a.t+' '+(a.au||'')+' '+(a.ex||'')).includes(q));
  $('#zal').innerHTML=!items.length?'<p class="znote" style="text-align:center;margin:30px">تعذّر تحميل المقالات. تأكد من الاتصال وحاول مرة أخرى.</p>':L.length?`<div class="k" style="margin:2px 4px">${ar(L.length)} مقال</div>`+L.map(artLi).join(''):`<p class="znote" style="text-align:center;margin:30px">${c==='fav'&&!q?'لم تحفظ أي مقال بعد. اضغط «حفظ» داخل المقال.':'لا توجد نتائج'}</p>`};
 $('#zacs').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('#zacs').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));history.replaceState(null,'','#articles/'+b.dataset.c);draw()});
 inp.oninput=draw;draw()};
V.article=async id=>{let items=[];try{items=await idx()}catch(e){}const a=items.find(x=>x.id===id);
 if(location.hash.indexOf('#article/')!==0)return;if(!a){view.innerHTML=`${back('articles','مقالات')}<p class="znote" style="text-align:center;margin:40px">المقال غير موجود أو تعذّر تحميله.</p>`;return}
 const fs=()=>{const el=$('#zab');if(el)el.style.fontSize=Q.fs+'px'};
 view.innerHTML=`<div class="zrbar">${back('articles/'+a.c,'مقالات')}<span class="grow"></span><button class="zchip" id="zafm" aria-label="تصغير الخط">ا−</button><button class="zchip" id="zafp" aria-label="تكبير الخط">ا+</button><button class="zchip" id="zafv" aria-pressed="${!!Q.fav[a.id]}">${zi('bookmark')}${Q.fav[a.id]?'محفوظ':'حفظ'}</button><button class="zchip" id="zash" aria-label="مشاركة">${zi('share')}</button></div>
 <article class="zart"><span class="zart-cat">${CAT[a.c]||''}</span><h1 class="page" style="font-size:23px;line-height:1.6;margin-top:6px">${esc(a.t)}</h1><div class="k" style="margin:-6px 4px 14px">${esc(a.au||'')}${a.au?' • ':''}${rt(a.w)}</div>
 <div class="zbar" style="position:sticky;top:52px;z-index:4"><i id="zapr" style="display:block;height:100%;width:0;background:var(--accent)"></i></div>
 <div class="zart-b" id="zab" style="font-size:${Q.fs}px"><p class="znote" style="text-align:center;margin:30px">جارٍ التحميل…</p></div>
 <div class="zcard zart-src">${srcBox(a)}</div></article>`;
 $('#zafm').onclick=()=>{Q.fs=Math.max(14,Q.fs-1);save();fs()};$('#zafp').onclick=()=>{Q.fs=Math.min(30,Q.fs+1);save();fs()};
 $('#zafv').onclick=e=>{if(Q.fav[a.id])delete Q.fav[a.id];else Q.fav[a.id]=Date.now();save();const b=e.currentTarget;b.innerHTML=zi('bookmark')+(Q.fav[a.id]?'محفوظ':'حفظ');b.setAttribute('aria-pressed',!!Q.fav[a.id]);toast(Q.fav[a.id]?'حُفظ في «المحفوظة»':'أُزيل من المحفوظة')};
 $('#zash').onclick=()=>shareLink(a.t,'#article/'+a.id);
 try{const h=await body(a);const el=$('#zab');if(el)el.innerHTML=h||'<p>لا يوجد نص.</p>'}catch(e){const el=$('#zab');if(el)el.innerHTML=`<p class="znote" style="text-align:center">تعذّر تحميل النص. تأكد من الاتصال.</p><p style="text-align:center"><a class="zchip" href="${esc(a.url)}" target="_blank" rel="noopener">افتح المقال من المصدر</a></p>`}
 const pr=()=>{const el=$('#zab'),bar=$('#zapr');if(!el||!bar){removeEventListener('scroll',pr);return}const r=el.getBoundingClientRect(),t=Math.min(1,Math.max(0,(innerHeight-r.top)/(r.height+innerHeight*.2)));bar.style.width=(t*100).toFixed(1)+'%'};addEventListener('scroll',pr,{passive:true});pr()};
function srcBox(a){if(a.mine)return`<b>${zi('pen')} من إدارة زاد</b>${a.url?`<div class="k" style="margin-top:6px">المصدر: <a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.src||a.url)}</a></div>`:''}`;
 if(a.src==='IslamHouse')return`<b>المصدر: <a href="${esc(a.url)}" target="_blank" rel="noopener">IslamHouse</a></b><div class="k" style="margin-top:6px">النص كما نشره موقع دار الإسلام (islamhouse.com)${a.au?'، إعداد: '+esc(a.au):''}.</div>`;
 return`<b>المصدر: <a href="${esc(a.url)}" target="_blank" rel="noopener">ويكيبيديا العربية: «${esc(a.t)}»</a></b><div class="k" style="margin-top:6px;line-height:1.9">مقتطف${a.part?' من أول المقال':''} منقول كما هو${a.q?' (مقالة '+a.q+' في ويكيبيديا)':''}، بترخيص <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.ar" target="_blank" rel="noopener">CC BY-SA 4.0</a> وحذفنا منه أرقام الحواشي. <a href="${esc(a.rev||a.url)}" target="_blank" rel="noopener">النسخة المنقول منها</a> · <a href="${esc(a.url)}" target="_blank" rel="noopener">اقرأ المقال كاملًا</a></div>`}
async function shareLink(t,h){const url=(window.ZAD_URL||location.origin+location.pathname)+h;try{if(navigator.share){await navigator.share({title:t,text:t+' · '+APP_NAME,url});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(t+'\n'+url);toast('نُسخ الرابط')}catch(e){prompt('انسخ الرابط',url)}}
/* ---------------- quotes ---------------- */
const QC=[['all','الكل'],['v','آيات'],['h','أحاديث'],['p','حِكم وأمثال'],['n','نصائح'],['s','أقوال العلماء'],['fav','المحفوظة']];
const TPL=[0,1,2,4,9,10];
let QX=null;
async function extras(){if(QX)return QX;try{QX=await getJ(CB+'quotes.json','zad.q.x')}catch(e){QX={p:[],n:[],s:[],hg:{}}}return QX}
function grade(h,x){const g=(x&&x.hg&&x.hg[h.url])||'';return g}
async function allQ(){const x=await extras(),L=[];
 (ZD.v||[]).forEach(v=>L.push({id:`v${v.sn}_${v.a}`,c:'v',t:v.t,src:`سورة ${CH(v.sn)[1]}: ${ar(v.a)}`,it:{k:'v',v}}));
 (ZD.h||[]).forEach(h=>{const g=grade(h,x),r=h.ref+(g?' — '+g:'');L.push({id:'h'+(h.url||'').split('/').pop(),c:'h',t:h.t,src:r,url:h.url,it:{k:'h',h:Object.assign({},h,{ref:r})}})});
 (x.p||[]).forEach(p=>L.push({id:p.id,c:'p',t:p.t,lab:p.kind||'حكمة',by:p.by||'',book:p.book||'',src:[p.kind||'حكمة',p.by,p.book?'«'+p.book+'»'+(p.loc?' '+p.loc:''):''].filter(Boolean).join(' · '),url:p.url}));
 (x.n||[]).forEach(p=>L.push({id:p.id,c:'n',t:p.t,lab:'نصيحة',src:'نصيحة من '+APP_NAME}));
 (x.s||[]).forEach(p=>L.push({id:p.id,c:'s',t:p.t,lab:p.by,by:p.by,book:p.book||'',src:p.by+' · «'+p.book+'»'+(p.loc?' '+p.loc:''),url:p.url}));
 return L}
function qItem(q){if(q.it)return q.it;return{k:'q',q:{body:`«${q.t}»`,label:q.c==='s'?`قال ${q.by}`:q.lab||'',ref:q.c==='s'?`«${q.book||''}»`.replace('«»',''):q.c==='p'?(q.by||(q.book?'«'+q.book+'»':'')):'',fam:'Amiri'}}}
function qText(q){const b=q.c==='v'?`﴿${q.t}﴾`:`«${q.t}»`;return`${b}\n${q.c==='h'?'قال رسول الله ﷺ · ':''}${q.src}${q.url?'\n'+q.url:''}\n— من تطبيق ${APP_NAME}`}
async function copyQ(q){const t=qText(q);try{await navigator.clipboard.writeText(t);toast('نُسخ النص مع المصدر')}catch(e){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('نُسخ النص مع المصدر')}catch(x){}ta.remove()}}
function qCard(q,i){const fav=!!Q.qfav[q.id],isV=q.c==='v';return`<div class="zcard zqc" data-i="${i}"><div class="zqc-l">${{v:'آية',h:'حديث',p:esc(q.lab||'حكمة'),n:'نصيحة',s:esc(q.by||'')}[q.c]}</div><div class="${isV?'zverse':'zqc-t'}">${isV?'﴿'+q.t+'﴾':'«'+esc(q.t)+'»'}</div><div class="zref">${esc(q.src)}${q.url?` · <a href="${esc(q.url)}" target="_blank" rel="noopener">المصدر</a>`:''}</div>
 <div class="zchips"><button class="zchip" data-a="d">${zi('palette')}صمّم وشارك</button><button class="zchip" data-a="c">${zi('file')}نسخ النص</button><button class="zchip" data-a="f" aria-pressed="${fav}">${zi('heart')}${fav?'محفوظ':'حفظ'}</button></div></div>`}
V.quotes=async arg=>{const cat=QC.some(c=>c[0]===arg)?arg:'all';
 view.innerHTML=`${back('services','المزيد')}<h1 class="page">اقتباسات وحِكم</h1><p class="znote">صمّم أي اقتباس بستة قوالب جاهزة للنشر (مربع ١٠٨٠ وستوري)، واحفظه صورة أو شاركه مباشرة. الآيات من api.alquran.cloud، والأحاديث من sunnah.com برقمها ودرجتها، وأقوال العلماء منقولة من كتبهم مع اسم الكتاب ورابطه.</p>
 <label class="zsearch">${zi('search')}<input type="search" id="zqq" placeholder="ابحث في الاقتباسات…" autocomplete="off"></label>
 <div class="zqcats" id="zqcs">${QC.map(([k,l])=>`<button class="zchip${k===cat?' on':''}" data-c="${k}">${l}</button>`).join('')}</div><div id="zql"><p class="znote" style="text-align:center;margin:30px">جارٍ التحميل…</p></div>`;
 const L=await allQ();const inp=$('#zqq');if(!inp)return;let n=30,cur=[];
 const draw=()=>{const q=norm(inp.value.trim()),c=$('#zqcs .on').dataset.c;cur=L.filter(x=>c==='all'||(c==='fav'?Q.qfav[x.id]:x.c===c));if(q)cur=cur.filter(x=>norm(x.t+' '+x.src).includes(q));
  if(c==='all'&&!q){const d=dayN();cur=cur.map((x,i)=>[x,(i*7919+d*31)%cur.length]).sort((a,b)=>a[1]-b[1]).map(a=>a[0])}
  $('#zql').innerHTML=cur.length?`<div class="k" style="margin:2px 4px">${ar(cur.length)} اقتباس</div>`+cur.slice(0,n).map(qCard).join('')+(cur.length>n?`<button class="btn ghost" id="zqm" style="width:100%;margin-top:12px">عرض المزيد</button>`:''):`<p class="znote" style="text-align:center;margin:30px">${c==='fav'&&!q?'لم تحفظ أي اقتباس بعد.':'لا توجد نتائج'}</p>`;
  const m=$('#zqm');if(m)m.onclick=()=>{n+=30;draw()}};
 $('#zql').onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;const q=cur[+b.closest('[data-i]').dataset.i];if(!q)return;const a=b.dataset.a;
  if(a==='d')openCard(q);else if(a==='c')copyQ(q);else{if(Q.qfav[q.id])delete Q.qfav[q.id];else Q.qfav[q.id]=Date.now();save();b.innerHTML=zi('heart')+(Q.qfav[q.id]?'محفوظ':'حفظ');b.setAttribute('aria-pressed',!!Q.qfav[q.id])}};
 $('#zqcs').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('#zqcs').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));history.replaceState(null,'','#quotes/'+b.dataset.c);n=30;draw()});
 inp.oninput=()=>{n=30;draw()};draw()};
function openCard(q){let size=Q.qs==='s'?'s':'q',ti=TPL.includes(+Q.tpl)?+Q.tpl:TPL[0];const item=qItem(q);
 openSheet(`<b style="font-size:17px">تصميم جاهز للنشر</b><div class="zgv" style="margin-top:10px"><canvas id="zqcv" style="max-height:52vh;width:auto;max-width:100%;display:block;margin:auto;border-radius:14px"></canvas></div>
 <div class="zseg" style="margin-top:10px">${[['q','مربع ١٠٨٠×١٠٨٠'],['s','ستوري ١٠٨٠×١٩٢٠']].map(([k,l])=>`<button data-s="${k}" class="${k===size?'on':''}">${l}</button>`).join('')}</div>
 <div class="zchips">${TPL.map(i=>`<button class="zchip" data-t="${i}">${ZT[i].n}</button>`).join('')}</div>
 <div class="zrow" style="margin-top:12px;gap:8px"><button class="btn grow" id="zqs">${zi('share')} مشاركة</button><button class="btn ghost grow" id="zqd">${zi('download')} حفظ صورة</button></div>
 <button class="btn ghost" id="zqt" style="width:100%;margin-top:8px">${zi('file')} نسخ النص مع المصدر</button><p class="znote">${esc(q.src)}</p>`,root=>{
  const cv=root.querySelector('#zqcv');const draw=()=>{zDraw(cv,item,ti,size,.5);root.querySelectorAll('[data-t]').forEach(b=>b.style.cssText=+b.dataset.t===ti?'background:var(--ink);color:var(--bg)':'')};draw();
  root.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{size=b.dataset.s;Q.qs=size;save();root.querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b));draw()});
  root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ti=+b.dataset.t;Q.tpl=ti;save();draw()});
  const png=async()=>{const c=document.createElement('canvas');await zDraw(c,item,ti,size,1);return new Promise(r=>c.toBlob(r,'image/png'))};
  const name=()=>`zad-${q.c}-${size==='s'?'story':'square'}-${Date.now()}.png`;
  const dl=async()=>{const b=await png(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4e4);toast('تم حفظ الصورة')};
  root.querySelector('#zqd').onclick=dl;root.querySelector('#zqt').onclick=()=>copyQ(q);
  root.querySelector('#zqs').onclick=async()=>{const b=await png(),f=new File([b],name(),{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],text:qText(q)})}catch(e){}}else dl()}})}
window.zQuoteCard=async id=>{const L=await allQ();const q=L.find(x=>x.id===id);if(q)openCard(q)};
window.zQuoteOfDay=async()=>{const x=await extras();const P=[].concat((x.s||[]).map(p=>['s',p]),(x.p||[]).map(p=>['p',p]),(x.n||[]).map(p=>['n',p]));const L=await allQ();if(!P.length)return null;const d=dayN();const [c,p]=P[((d*13)%P.length+P.length)%P.length];return L.find(q=>q.id===p.id)||null};
V.quote=async id=>{await V.quotes('all');window.zQuoteCard(id)};
})();
