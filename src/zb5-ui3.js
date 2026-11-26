
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
