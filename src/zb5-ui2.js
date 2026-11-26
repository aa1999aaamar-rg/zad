
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
