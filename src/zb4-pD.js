
/* ===================== 4) رحلتي ===================== */
const fmtShort=k=>{try{return new Date(k+'T12:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',{day:'numeric',month:'short'})}catch(e){return k}};
function rihlaRender(){addCss();try{ZS.rihlaCheck&&ZS.rihlaCheck(true)}catch(e){}const R=ZS.rihla();const L=R.lv,nx=R.next;const pct=nx?Math.max(0,Math.min(100,Math.round((R.xp-L.x)/(nx.x-L.x)*100))):100;const C=2*Math.PI*52;
 const old=(typeof BADGES!=='undefined'?BADGES:[]).map(b=>({id:'o_'+b[0],n:b[1],d:b[2],ok:!!(S.badges||{})[b[0]],at:(S.badges||{})[b[0]],i:'medal'}));
 const all=R.badges.concat(old),got=all.filter(b=>b.ok).length;
 view.innerHTML=`<div class="zb4 zr">${back('sec/self','النفس والعادات')}<h1 class="page" style="margin-bottom:6px">رحلتي<em class="zb4-new">جديد</em></h1>
 <section class="zcard"><div class="zr-hero"><div class="zr-ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="zrg" x1="0" x2="1"><stop offset="0" stop-color="#c0693f"/><stop offset="1" stop-color="#34457a"/></linearGradient></defs><circle cx="60" cy="60" r="52" fill="none" stroke="var(--z-soft,#eef0f7)" stroke-width="11"/><circle cx="60" cy="60" r="52" fill="none" stroke="url(#zrg)" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(1)}"/></svg><div class="c"><div><small>المستوى</small><b>${ar(L.i)}</b></div></div></div>
 <div class="grow"><div class="k">مستواك الآن</div><h2 style="margin:2px 0 4px;font-size:25px">${L.n}</h2><div class="zr-bar"><i style="width:${pct}%"></i></div><div class="k" id="zrxp">${fmtN(R.xp)} نقطة${nx?` · بقي ${fmtN(nx.x-R.xp)} لمستوى «${nx.n}»`:' · أعلى مستوى'}</div></div></div></section>
 <h2 class="sec">المستويات العشرة</h2><div class="zr-lv">${R.levels.map(l=>`<div class="${l.i===L.i?'on':l.x>R.xp?'no':''}"><b>${ar(l.i)}</b>${l.n}</div>`).join('')}</div>
 <h2 class="sec">الأوسمة <span class="k">${ar(got)} من ${ar(all.length)}</span></h2><div class="zr-bg">${all.slice().sort((a,b)=>(b.ok-a.ok)).map(b=>`<div class="zr-b ${b.ok?'':'no'}" data-b="${b.id}"><div class="i">${zi(b.i||'medal')}</div><b>${esc(b.n)}</b><small>${b.ok?(b.at?'حصلت عليه '+esc(fmtShort(b.at)):'حصلت عليه'):esc(b.d)}</small></div>`).join('')}</div>
 <h2 class="sec">من أين جاءت نقاطك</h2><section class="zcard"><div class="zr-xp">${R.parts.filter(p=>p.v>0).map(p=>`<span>${p.n} <small class="k">(${fmtN(p.c)})</small></span><span>${fmtN(p.v)}</span>`).join('')||'<span class="k">ابدأ بأي عمل في التطبيق: قراءة، تسبيح، تسجيل صلاة، أذكار… وتجمع نقاطك هنا.</span><span></span>'}</div></section>
 <p class="znote">المستويات والأوسمة لتنظيم همّتك وتشجيعك على الاستمرار فقط، ولا تعني أجرًا محسوبًا ولا منزلة؛ الأجر عند الله وحده. النقاط تُحسب من تسجيلك أنت على هذا الجهاز، ولا تُرفع لأي خادم.</p>
 <a class="btn ghost block" href="#badges">${zi('chart')} إحصائياتي (إنجازاتي)</a></div>`}

/* ===================== 5) وضع رمضان ===================== */
function hij(d){try{const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});const o={};f.formatToParts(d).forEach(x=>o[x.type]=x.value);return{d:+o.day,m:+o.month,y:parseInt(o.year)}}catch(e){return null}}
function ramInfo(){const now=new Date();now.setHours(12,0,0,0);let h=null;try{h=typeof hijriToday==='function'?hijriToday():hij(now)}catch(e){h=hij(now)}
 const real=!!h&&h.m===9;let start=null,len=30,day=0;
 if(real){start=new Date(now);start.setDate(start.getDate()-(h.d-1));day=h.d}else{const x=new Date(now);for(let i=0;i<400;i++){x.setDate(x.getDate()+1);const q=hij(x);if(q&&q.m===9&&q.d===1){start=new Date(x);break}}}
 if(start){const e=new Date(start);e.setDate(e.getDate()+29);const q=hij(e);len=q&&q.m===9?30:29}
 const hy=real?h.y:(start?(hij(start)||{}).y:null),left=!real&&start?Math.round((start-now)/864e5):0;
 return{real,preview:!real&&!!(S.b2&&S.b2.ramadan),on:real||!!(S.b2&&S.b2.ramadan),start,len,day,hy,left}}
function locP(){try{const l=window.zLoc&&zLoc.curLoc?zLoc.curLoc():curLoc();if(l&&isFinite(l.lat))return l}catch(e){}try{return curLoc()}catch(e){return{lat:24.7136,lng:46.6753,name:'الرياض'}}}
function timesFor(d){try{const l=locP(),st=S.settings||{},tn=st.tune||{},T=k=>+tn[k]||0;const tune=[0,T('Fajr'),0,T('Dhuhr'),T('Asr'),T('Maghrib'),0,T('Isha'),0];const dd=new Date(d);dd.setHours(12,0,0,0);return ZPT.dayObj(l.lat,l.lng,dd,st.method||4,tune,st.asr==='hanafi',false).timings}catch(e){return null}}
const f12=t=>{try{return fmt12(t)}catch(e){return String(t).slice(0,5)}};
const hmsL=ms=>{const a=Math.max(0,Math.floor(ms/1e3)),h=Math.floor(a/3600),m=Math.floor(a%3600/60),s=a%60,p=n=>String(n).padStart(2,'0');return ar((h?h+':':'')+p(m)+':'+p(s))};
function atT(t,d){const [h,m]=String(t).slice(0,5).split(':').map(Number);const x=new Date(d||new Date());x.setHours(h,m,0,0);return x}
function nextSI(){const now=new Date(),t=timesFor(now);if(!t)return null;let f=atT(t.Fajr),m=atT(t.Maghrib);const tm=new Date();tm.setDate(tm.getDate()+1);let t2=null;if(f<now||m<now)t2=timesFor(tm);if(f<now&&t2)f=atT(t2.Fajr,tm);if(m<now&&t2)m=atT(t2.Maghrib,tm);return{fajr:t.Fajr,magh:t.Maghrib,f,m}}
const B2=()=>{const b=S.b2=S.b2||{};b.rfast=b.rfast||{};b.tar=b.tar||{};return b};
const gD=(d,o)=>d.toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',o);
let rmT=[];
function hadBox(k,lab){const h=HJ[k];return`<div class="zrm-had">${lab?`<div class="k" style="font-weight:700">${lab}</div>`:''}${h.ctx?`<span class="k">${h.ctx}:</span> `:''}«${h.t}»</div><div class="zrm-src">${h.ref} · الدرجة: ${h.g} · <a href="${h.u}" target="_blank" rel="noopener">sunnah.com</a></div>`}
function ramRender(){addCss();rmT.forEach(clearInterval);rmT=[];const R=ramInfo(),b=B2(),today=R.real?R.day:0;
 const rows=[];if(R.start){for(let i=0;i<R.len;i++){const d=new Date(R.start);d.setDate(d.getDate()+i);rows.push({n:i+1,d,t:timesFor(d)})}}
 const fasted=Object.keys(b.rfast).filter(k=>b.rfast[k]&&+k<=30).length,miss=Object.keys(ZZ.rmiss).filter(k=>ZZ.rmiss[k]).length,owed=Math.max(0,miss-(+ZZ.qd||0)),tar=Object.keys(b.tar).filter(k=>b.tar[k]).length;
 const rp=(S.b5b&&S.b5b.rp)||{n:1},kn=+rp.n||1,ppd=604*kn/30,pg=n=>((Math.round(n)-1)%604)+1,dd=today||1,p1=pg((dd-1)*ppd+1),p2=pg(dd*ppd);
 const si=nextSI();
 view.innerHTML=`<div class="zb4 zrm">${back('sec/ibadat','العبادات والمواسم')}<h1 class="page" style="margin-bottom:6px">وضع رمضان<em class="zb4-new">جديد</em></h1>
 <section class="zrm-hero"><span class="moon"></span><div style="position:relative"><div class="k" style="color:#f2d8a8">${R.real?'رمضان '+ar(R.hy)+'هـ':R.preview?'معاينة وضع رمضان':'وضع رمضان'}</div><h2 style="margin:4px 0;font-size:26px">${R.real?'اليوم '+ar(R.day)+' من رمضان':R.start?'بقي '+ar(R.left)+' يومًا على رمضان':'رمضان'}</h2><div style="font-size:13px;opacity:.88">${R.real?'تقبّل الله صيامك وقيامك':R.start?'يبدأ '+gD(R.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' حسب تقويم أم القرى':''}</div>
 ${si?`<div class="zrm-tt"><div><small>آخر السحور · أذان الفجر</small><b>${f12(si.fajr)}</b><em id="zrmf"></em></div><div><small>الإفطار · أذان المغرب</small><b>${f12(si.magh)}</b><em id="zrmm"></em></div></div>`:''}</div></section>
 <section class="zcard"><label class="tg"><span><b>معاينة وضع رمضان</b><small class="muted">${R.real?'مفعّل تلقائيًا — نحن في رمضان':'يتفعّل تلقائيًا في رمضان حسب تقويم أم القرى. شغّله الآن لتجرّب شكل الرئيسية'}</small></span><input type="checkbox" id="zrmon" ${R.on?'checked':''} ${R.real?'disabled':''}><i></i></label></section>
 <h2 class="sec">إمساكية رمضان ${R.hy?ar(R.hy)+'هـ':''}</h2><section class="zcard" style="padding:6px 8px"><table class="zrm-tb"><thead><tr><th>رمضان</th><th>التاريخ</th><th>السحور (الفجر)</th><th>الإفطار (المغرب)</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.n===today?'now':''} ${r.n>20&&r.n%2?'odd':''}"><td>${ar(r.n)}</td><td>${gD(r.d,{weekday:'short',day:'numeric',month:'short'})}</td><td>${r.t?f12(r.t.Fajr):'—'}</td><td>${r.t?f12(r.t.Maghrib):'—'}</td></tr>`).join('')}</tbody></table>
 <p class="znote" style="margin:8px 4px">محسوبة على جهازك بنفس طريقة مواقيت التطبيق (${esc(locP().name||'موقعك')}). بداية الشهر حسب تقويم أم القرى، والمعتمد إعلان الرؤية الرسمي.</p></section>
 <h2 class="sec">أيام الصيام والقضاء</h2><section class="zcard"><div class="zrow" style="justify-content:space-between;margin-bottom:8px"><span><b>${ar(fasted)}</b> <span class="k">يوم صمته</span></span><span><b>${ar(miss)}</b> <span class="k">أفطرته بعذر</span></span><span><b style="color:#9a4f2e">${ar(owed)}</b> <span class="k">بقي قضاء</span></span></div>
 <div class="zrm-days">${Array.from({length:30},(_,i)=>{const n=i+1;return`<button data-rd="${n}" class="${b.rfast[n]?'f':ZZ.rmiss[n]?'m':''} ${n===today?'now':''} ${n>20&&n%2?'odd':''}" aria-label="اليوم ${n}">${ar(n)}</button>`}).join('')}</div>
 <p class="znote" style="margin:8px 0">ضغطة = صمت ✓ · ضغطتان = أفطرت بعذر (يُحسب قضاء) · ثلاث = فارغ.</p>
 <div class="zrow" style="gap:8px;align-items:center"><span class="k grow">أيام قضيتها:</span><button class="zn-ib" id="zrqm" aria-label="أنقص">−</button><b style="min-width:28px;text-align:center" id="zrqd">${ar(+ZZ.qd||0)}</b><button class="zn-ib" id="zrqp" aria-label="أضف">+</button></div>
 <a class="btn ghost block" href="#fasting" style="margin-top:10px">${zi('cal')} متابعة الصيام والقضاء بالتواريخ</a></section>
 <h2 class="sec">ختمة رمضان</h2><section class="zcard"><div><b>${ar(kn)} ${kn===1?'ختمة':kn===2?'ختمتان':'ختمات'}</b> <span class="k">· ${ar(Math.round(ppd*10)/10)} صفحة يوميًا (قرابة ${ar(Math.round(ppd/5*10)/10)} بعد كل صلاة)</span></div>
 <div class="zhad" style="margin-top:8px;font-size:15px">${today?'ورد اليوم '+ar(today):'ورد اليوم الأول'}: من صفحة ${ar(p1)} إلى ${ar(p2)}</div>
 <div class="zrow" style="gap:8px;margin-top:10px"><a class="btn grow" href="#read/p/${p1}">${zi('quran')} اقرأ الورد</a><a class="btn ghost grow" href="#rplan">الخطة والأهداف</a></div></section>
 <h2 class="sec">القيام والتراويح <span class="k">${ar(tar)} ليلة</span></h2><section class="zcard"><div class="zrm-days">${Array.from({length:30},(_,i)=>{const n=i+1;return`<button data-tr="${n}" class="${b.tar[n]?'f':''} ${n===today?'now':''} ${n>20&&n%2?'odd':''}">${ar(n)}</button>`}).join('')}</div><div style="margin-top:10px">${hadBox('qiyam','')}</div></section>
 <h2 class="sec">العشر الأواخر</h2><section class="zcard"><div class="zrm-ten">${Array.from({length:10},(_,i)=>{const n=21+i,odd=n%2===1,d=R.start?new Date(+R.start+(n-2)*864e5):null;return`<div class="${odd?'odd':''}"><b>${ar(n)}</b><small>${odd?'ليلة وتر':'ليلة'}</small>${d?`<small style="display:block;opacity:.8">${gD(d,{weekday:'short'})}</small>`:''}</div>`}).join('')}</div>
 <p class="znote" style="margin:8px 0 6px">تدخل كل ليلة بغروب شمس اليوم الذي قبلها (المكتوب تحتها يوم مغربها). لا يُجزم بليلة معيّنة؛ والسنة تحرّيها في الوتر من العشر الأواخر:</p>${hadBox('odd','')}<div style="margin-top:10px">${hadBox('qadr','')}</div></section>
 <h2 class="sec">الإفطار والسحور</h2><section class="zcard">${hadBox('iftar','دعاء الإفطار')}<div style="margin-top:12px">${hadBox('suhur','من السنة في السحور')}</div><div style="margin-top:12px">${hadBox('siyam','فضل صيام رمضان')}</div></section>
 <p class="znote">الأحاديث منقولة حرفيًا من sunnah.com مع درجتها ورابطها.</p></div>`;
 $('#zrmon').onchange=e=>{B2().ramadan=e.target.checked;sv();ramRender()};
 $$('[data-rd]').forEach(x=>x.onclick=()=>{const n=x.dataset.rd,b=B2();if(b.rfast[n]){b.rfast[n]=false;ZZ.rmiss[n]=true}else if(ZZ.rmiss[n]){ZZ.rmiss[n]=false}else{b.rfast[n]=true}sv();vb(12);ramRender()});
 $$('[data-tr]').forEach(x=>x.onclick=()=>{const n=x.dataset.tr,b=B2();b.tar[n]=!b.tar[n];sv();vb(12);ramRender()});
 $('#zrqp').onclick=()=>{ZZ.qd=(+ZZ.qd||0)+1;sv();ramRender()};$('#zrqm').onclick=()=>{ZZ.qd=Math.max(0,(+ZZ.qd||0)-1);sv();ramRender()};
 const tk=()=>{const a=$('#zrmf'),c=$('#zrmm');if(!a){rmT.forEach(clearInterval);return}const s=nextSI();if(!s)return;const now=Date.now();a.textContent='بعد '+hmsL(s.f-now);c.textContent='بعد '+hmsL(s.m-now)};tk();rmT.push(setInterval(tk,1000))}
/* the home card while Ramadan (real or preview) is on */
let rhT=null;
function ramHome(box){const R=ramInfo();clearInterval(rhT);document.body.classList.toggle('zb4-ram',R.on);if(!R.on){box.innerHTML='';return}addCss();const si=nextSI(),b=B2(),d=R.real?R.day:0,dk=d||0;const rp=(S.b5b&&S.b5b.rp)||{n:1},ppd=604*(+rp.n||1)/30,pg=n=>((Math.round(n)-1)%604)+1,dd=d||1;
 box.innerHTML=`<div class="zrm-home"><section class="zrm-hero"><span class="moon"></span><div style="position:relative"><div class="zrow" style="justify-content:space-between"><div class="k" style="color:#f2d8a8">${R.real?'رمضان '+ar(R.hy)+'هـ':'معاينة وضع رمضان'}</div><a href="#ramadan" style="color:#f2d8a8;font-size:12px;text-decoration:none">وضع رمضان ‹</a></div>
 <b style="font-size:20px;display:block;margin-top:2px">${R.real?'اليوم '+ar(d)+' من رمضان':'رمضان بعد '+ar(R.left)+' يومًا'}</b>
 ${si?`<div class="zrm-tt"><div><small>السحور · الفجر</small><b>${f12(si.fajr)}</b><em id="zrhf"></em></div><div><small>الإفطار · المغرب</small><b>${f12(si.magh)}</b><em id="zrhm"></em></div></div>`:''}
 <div style="font-size:13px;margin-top:10px;opacity:.9">ورد الختمة: صفحة ${ar(pg((dd-1)*ppd+1))}–${ar(pg(dd*ppd))}</div>
 <div class="zrm-qk">${dk?`<button data-q="f" class="${b.rfast[dk]?'on':''}">${b.rfast[dk]?'✓ ':''}صمت اليوم</button><button data-q="t" class="${b.tar[dk]?'on':''}">${b.tar[dk]?'✓ ':''}صليت التراويح</button>`:''}<a href="#ramadan">الإمساكية</a></div></div></section></div>`;
 $$('[data-q]',box).forEach(x=>x.onclick=e=>{e.preventDefault();const b=B2();if(x.dataset.q==='f'){b.rfast[dk]=!b.rfast[dk];if(b.rfast[dk])ZZ.rmiss[dk]=false}else b.tar[dk]=!b.tar[dk];sv();vb(12);ramHome(box)});
 const tk=()=>{const a=$('#zrhf'),c=$('#zrhm');if(!a||!document.body.contains(a)){clearInterval(rhT);return}const s=nextSI();if(!s)return;const now=Date.now();a.textContent='بعد '+hmsL(s.f-now);c.textContent='بعد '+hmsL(s.m-now)};tk();rhT=setInterval(tk,1000)}

window.ZB4={nat:natRender,natState,natStop:stopNat,live:liveRender,wrap:wrapOpen,wrapStats:mstats,shareCard,rihla:rihlaRender,ram:ramRender,ramHome,ramInfo,timesFor,HJ,NREC,_N:N};
})();
