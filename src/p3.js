
/* زادي اليومي page */
function weekDots(){let h='';for(let i=6;i>=0;i--){const d=addD(new Date(),-i),on=Z.deeds[dayKey(d)];h+=`<div><i style="height:${on?46:4}px;${on?'':'background:var(--line)'}"></i>${WD[d.getDay()].replace('ال','').slice(0,3)}</div>`}return`<div class="zbars">${h}</div>`}
V.zadi=()=>{const st=streakOf(Z.deeds),tot=Object.keys(Z.deeds).length;if(st>(Z.best||0)){Z.best=st;save()}
 view.innerHTML=`${backBtn('home','الرئيسية')}<h1 class="page">زادي اليومي</h1><p class="znote">كل يوم: آية من القرآن، وحديث صحيح منقول من مصدره، وعمل صغير تنجزه. أنجز تحدي اليوم لتبني سلسلتك.</p>${zadiCard(1)}<section class="zcard"><h3>${zi('flame')}سلسلتك</h3><div class="zstat"><div><b>${ar(st)}</b><small>أيام متتالية</small></div><div><b>${ar(tot)}</b><small>تحديًا أنجزته</small></div><div><b>${ar(Math.max(st,Z.best||0))}</b><small>أفضل سلسلة</small></div></div>${weekDots()}</section><p class="znote">الآيات من api.alquran.cloud بالرسم العثماني، والأحاديث بنصها من sunnah.com مع رقمها.</p>`;
 bindZadi(view)};

/* fasting reminders page */
V.sawm=()=>{const f=Z.fast,h=hij(new Date()),nx=nextFasts(12);const perm=window.Notification?Notification.permission:'unsupported';const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
 view.innerHTML=`${backBtn('home','الرئيسية')}<h1 class="page">تذكير صيام التطوع</h1>${fastBanner()}
 <section class="zcard"><div class="zrow" style="justify-content:space-between"><h3>${zi('cal')}الأيام القادمة</h3><span class="k">اليوم ${ar(h.d)} ${HM[h.m-1]} ${ar(h.y)} هـ</span></div>${fastStrip(21)}
 <div class="zlist" id="fnext" style="margin-top:12px">${nx.slice(0,8).map(x=>`<div class="zli"><span class="zi">${zi(x.fi.r.includes('white')?'moon':'cal')}</span><span class="grow">${x.i===0?'اليوم ':x.i===1?'غدًا ':''}${WD[x.d.getDay()]} ${ar(x.d.getDate())}/${ar(x.d.getMonth()+1)}<small>${ar(x.fi.h.d)} ${HM[x.fi.h.m-1]} · ${fastLabel(x.fi)}</small></span></div>`).join('')||'<div class="zli">فعّل أحد التذكيرين لعرض الأيام</div>'}</div></section>
 <section class="zcard"><h3>${zi('bell')}التذكير</h3>
 <label class="zset"><span class="grow"><b>الاثنين والخميس</b><small>تذكير مساء الأحد والأربعاء</small></span><span class="zsw"><input type="checkbox" id="fmt" ${f.mt?'checked':''}><i></i></span></label>
 <label class="zset"><span class="grow"><b>الأيام البيض</b><small>١٣ و١٤ و١٥ من كل شهر هجري</small></span><span class="zsw"><input type="checkbox" id="fwh" ${f.white?'checked':''}><i></i></span></label>
 <div class="zset"><span class="grow"><b>وقت التذكير</b><small>في الليلة السابقة (الافتراضي ٩ مساءً)</small></span><input type="time" id="ftime" value="${f.time}"></div>
 <label class="zset"><span class="grow"><b>تذكير السحور</b><small>تنبيه قبل الفجر في يوم الصيام</small></span><span class="zsw"><input type="checkbox" id="fsu" ${f.suhoor?'checked':''}><i></i></span></label>
 ${f.suhoor?`<div class="zset"><span class="grow"><b>وقت السحور</b></span><input type="time" id="fstime" value="${f.stime}"></div>`:''}
 <div class="zset"><span class="grow"><b>تعديل التاريخ الهجري</b><small>تقويم أم القرى؛ عدّل يومًا إن اختلف بلدك</small></span><select id="fadj">${[-1,0,1].map(v=>`<option value="${v}" ${+f.adj===v?'selected':''}>${v>0?'+١ يوم':v<0?'−١ يوم':'بدون'}</option>`).join('')}</select></div>
 <div class="zset"><span class="grow"><b>تنبيهات الجهاز</b><small>${perm==='granted'?'مفعّلة':perm==='denied'?'مرفوضة من إعدادات المتصفح':perm==='unsupported'?'غير مدعومة هنا':'غير مفعّلة بعد'}</small></span>${perm==='default'?'<button class="btn sm" id="fperm">تفعيل</button>':perm==='granted'?'<button class="btn ghost sm" id="ftest">تجربة</button>':''}</div></section>
 <section class="zcard"><h3>${zi('qmark')}متى يصلك التذكير؟</h3><p class="znote">• التطبيق مفتوح أو في الخلفية: يصلك التنبيه في وقته، ويظهر شريط تذكير في الرئيسية مساء اليوم السابق ويوم الصيام.<br>• أندرويد (تطبيق زاد المثبّت): يطلب التطبيق من الجوال فحصًا يوميًا في الخلفية ليرسل التذكير، لكن النظام يحدد توقيته وقد يتأخر أو لا يعمل في وضع توفير البطارية.<br>• آيفون: لا تسمح آبل لتطبيقات الويب بجدولة تنبيه وهي مغلقة بدون خادم إشعارات، فافتح التطبيق مرة في اليوم ليظهر التذكير.${ios?' (أنت على آيفون)':''}<br>• لا يُذكّر في رمضان ولا يوم العيد ولا أيام التشريق.</p></section>
 <a class="btn ghost block" href="#fasting" style="margin-top:12px">${zi('cal')} سجّل صيامك وقضاءك</a>`;
 const up=()=>{resched();V.sawm()};
 $('#fmt').onchange=e=>{f.mt=e.target.checked;up()};$('#fwh').onchange=e=>{f.white=e.target.checked;up()};$('#ftime').onchange=e=>{f.time=e.target.value||'21:00';resched();toast('تم الحفظ')};
 $('#fsu').onchange=e=>{f.suhoor=e.target.checked;up()};const st=$('#fstime');if(st)st.onchange=e=>{f.stime=e.target.value||'03:30';resched();toast('تم الحفظ')};
 $('#fadj').onchange=e=>{f.adj=+e.target.value;up()};
 const pb=$('#fperm');if(pb)pb.onclick=async()=>{try{await Notification.requestPermission()}catch(e){}up()};
 const tb=$('#ftest');if(tb)tb.onclick=async()=>{const r=await navigator.serviceWorker.ready;const n=nextFasts(1)[0];r.showNotification('تذكير بالصيام',{body:n?`${n.i===1?'غدًا ':''}${WD[n.d.getDay()]}، تذكير بصيام التطوع`:'تذكير بصيام التطوع',icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',tag:'ztest',data:{url:'./#sawm'}})}};

/* khalwa: distraction-free dhikr with haptics, goal and wake lock */
const DHK=[['سُبْحَانَ اللَّهِ',33],['الْحَمْدُ لِلَّهِ',33],['اللَّهُ أَكْبَرُ',34],['لَا إِلَهَ إِلَّا اللَّهُ',100],['أَسْتَغْفِرُ اللَّهَ',100],['اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',100],['لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',100],['سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',100]];
V.khalwa=()=>{const kh=Z.kh,sel=+(kh.sel||0),goal=kh.goal||DHK[sel][1],mins=kh.mins||10;
 let bars='';for(let i=6;i>=0;i--){const d=dayKey(addD(new Date(),-i)),m=(kh.log&&kh.log[d])||0;bars+=`<div><i style="height:${Math.min(60,m*3)+3}px"></i>${ar(m)}</div>`}
 view.innerHTML=`${backBtn('services','المزيد')}<h1 class="page">وضع الخلوة</h1><p class="znote">شاشة هادئة بلا مشتتات: اختر الذكر والهدف، ثم اضغط في أي مكان للعدّ. اهتزازة خفيفة مع كل ذكر وأطول عند بلوغ الهدف، والشاشة تبقى مضاءة.</p>
 <section class="zcard"><h3>${zi('beads')}الذكر</h3><div class="zchips">${DHK.map((d,i)=>`<button class="zchip" data-d="${i}" style="${i===sel?'background:var(--ink);color:var(--bg)':''}">${d[0]}</button>`).join('')}</div>
 <div class="zset"><span class="grow"><b>الهدف</b></span><select id="kg">${[33,34,99,100,300,1000].map(v=>`<option ${v==goal?'selected':''} value="${v}">${ar(v)}</option>`).join('')}</select></div>
 <div class="zset"><span class="grow"><b>مدة الجلسة</b></span><select id="km">${[3,5,10,15,20,30].map(v=>`<option ${v==mins?'selected':''} value="${v}">${ar(v)} دقائق</option>`).join('')}</select></div>
 <button class="btn block" id="kgo" style="margin-top:8px">${zi('candle')} ابدأ الخلوة</button></section>
 <section class="zcard"><h3>${zi('chart')}دقائق الخلوة هذا الأسبوع</h3><div class="zbars">${bars}</div><div class="k">مجموع الأذكار: ${ar(kh.total||0)}</div></section>`;
 view.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{kh.sel=+b.dataset.d;kh.goal=DHK[kh.sel][1];save();V.khalwa()});
 $('#kg').onchange=e=>{kh.goal=+e.target.value;save()};$('#km').onchange=e=>{kh.mins=+e.target.value;save()};
 $('#kgo').onclick=()=>khalwaRun(DHK[kh.sel||0][0],+(kh.goal||goal),+(kh.mins||mins))};
async function khalwaRun(txt,goal,mins){let c=0,lock=null;const t0=Date.now(),end=t0+mins*60e3;
 try{lock=await navigator.wakeLock.request('screen')}catch(e){}
 const el=document.createElement('div');el.className='zkh';el.innerHTML=`<button class="x" aria-label="إنهاء">${zi('x')}</button><div class="dz">${txt}</div><div class="ring"><b id="kc">${ar(0)}</b></div><div class="tm" id="kt"></div><div class="tm" style="font-size:12px">اضغط في أي مكان · الهدف ${ar(goal)}</div>`;document.body.appendChild(el);
 let iv=0;const fin=()=>{clearInterval(iv);try{lock&&lock.release()}catch(e){}const m=Math.max(1,Math.round((Date.now()-t0)/60e3)),k=dayKey();Z.kh.log=Z.kh.log||{};Z.kh.log[k]=(Z.kh.log[k]||0)+m;Z.kh.total=(Z.kh.total||0)+c;save();el.remove();toast(`تقبّل الله · ${ar(c)} ذكر في ${ar(m)} دقيقة`);if(location.hash==='#khalwa')V.khalwa()};
 iv=setInterval(()=>{const r=end-Date.now();if(r<=0){try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}fin();return}el.querySelector('#kt').textContent=hms(r)},500);
 el.querySelector('.x').onclick=e=>{e.stopPropagation();fin()};
 el.addEventListener('pointerdown',e=>{if(e.target.closest('.x'))return;c++;el.querySelector('#kc').textContent=ar(c);try{navigator.vibrate&&navigator.vibrate(c%goal===0?[60,60,140]:12)}catch(e){}if(c%goal===0)toast('بلغت الهدف')})}

/* between the two adhans */
const ACTS=[[1,'تسبيح قصير','سبحان الله وبحمده','khalwa','beads',2],[3,'أذكار بعد الصلاة','أذكار الصلاة','adhkar','adhkar',4],[4,'صفحتان من القرآن','دقيقتان تقريبًا للصفحة','quran','quran',4],[6,'راجع محفوظك','مقطع بالإخفاء','hifzhelp','eyeoff',6],[8,'سورة الملك','حوالي ٧ دقائق','read/s/67','quran',7],[10,'أذكار الصباح أو المساء','حسب الوقت','adhkar','sunrise',10],[16,'ربع حزب من وردك','حوالي ربع ساعة','quran','quran',15],[25,'جلسة خلوة','ذكر بتركيز مع مؤقت','khalwa','candle',20]];
V.bayn=()=>{let np=null;try{np=nextPrayer()}catch(e){}const m=np?Math.floor((np.next.at-new Date())/60e3):null;
 const fit=m==null?ACTS:ACTS.filter(a=>a[0]<=Math.max(1,m-3));
 view.innerHTML=`${backBtn('services','المزيد')}<h1 class="page">بين الأذانين</h1>
 <section class="zcard" style="text-align:center"><div class="k">${np?'بقي على صلاة '+np.next.n:'المواقيت غير متوفرة بعد'}</div><div style="font-size:46px;font-weight:700;margin:6px 0">${m!=null?ar(m):'—'} <span style="font-size:16px">دقيقة</span></div><div class="znote">اقتراحات على قدر الوقت المتبقي، اختر منها ما تقدر عليه.</div></section>
 <div class="zlist" style="margin-top:12px">${fit.slice().reverse().map(a=>`<a class="zli" href="#${a[3]}"><span class="zi">${zi(a[4])}</span><span class="grow">${a[1]}<small>${a[2]} · نحو ${ar(a[5])} دقائق</small></span>${zi('chev','chv')}</a>`).join('')}</div>
 <p class="znote" style="margin-top:12px">الأوقات تقريبية لمساعدتك على التخطيط.</p>`};

/* sadaqah jar */
V.sadaqa=()=>{const s=Z.sad,mk=dayKey().slice(0,7),mine=s.log.filter(x=>x.d.slice(0,7)===mk),month=mine.reduce((a,x)=>a+x.a,0),all=s.log.reduce((a,x)=>a+x.a,0);
 view.innerHTML=`${backBtn('services','المزيد')}<h1 class="page">صندوق الصدقة</h1><p class="znote">سجلّ خاص على جوالك فقط، لا يُرسل لأي مكان. سجّل صدقاتك لتحافظ على العادة، وفعّل تذكيرًا أسبوعيًا.</p>
 <section class="zcard"><div class="zstat"><div><b>${ar(month)}</b><small>هذا الشهر</small></div><div><b>${ar(mine.length)}</b><small>مرة هذا الشهر</small></div><div><b>${ar(all)}</b><small>المجموع</small></div></div>
 <div class="zrow" style="margin-top:12px"><input type="text" id="sa" inputmode="decimal" placeholder="المبلغ" style="flex:1"><input type="text" id="sn" placeholder="ملاحظة (اختياري)" style="flex:1.4"></div>
 <div class="zchips">${[5,10,20,50,100].map(v=>`<button class="zchip" data-v="${v}">${ar(v)}</button>`).join('')}</div><button class="btn block" id="sadd" style="margin-top:10px">${zi('plus')} أضف إلى الصندوق</button></section>
 <section class="zcard"><h3>${zi('bell')}تذكير أسبوعي</h3><label class="zset"><span class="grow"><b>تفعيل التذكير</b></span><span class="zsw"><input type="checkbox" id="son" ${s.on?'checked':''}><i></i></span></label>
 <div class="zset"><span class="grow"><b>اليوم</b></span><select id="sday">${WD.map((w,i)=>`<option value="${i}" ${+s.day===i?'selected':''}>${w}</option>`).join('')}</select></div><div class="zset"><span class="grow"><b>الوقت</b></span><input type="time" id="stime" value="${s.time}"></div></section>
 ${ZD.vs?`<section class="zcard"><div class="zverse" style="font-size:20px">﴿${ZD.vs.t}﴾</div><div class="zref">[${vref(ZD.vs)}]</div></section>`:''}
 <h2 class="sec">السجل</h2><div class="zlist">${s.log.map((x,i)=>[x,i]).reverse().slice(0,40).map(([x,i])=>`<div class="zli"><span class="zi">${zi('jar')}</span><span class="grow">${ar(x.a)}<small>${ar(x.d)}${x.n?' · '+esc(x.n):''}</small></span><button class="zchip" data-del="${i}" aria-label="حذف">${zi('trash')}</button></div>`).join('')||'<div class="zli"><span class="grow znote">لا يوجد شيء بعد</span></div>'}</div>`;
 view.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{$('#sa').value=ar(b.dataset.v)});
 $('#sadd').onclick=()=>{const a=parseFloat(String($('#sa').value).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫','.'));if(!(a>0))return toast('اكتب المبلغ');s.log.push({d:dayKey(),a,n:$('#sn').value.trim().slice(0,60)});save();toast('تقبّل الله منك');V.sadaqa()};
 view.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{s.log.splice(+b.dataset.del,1);save();V.sadaqa()});
 $('#son').onchange=async e=>{s.on=e.target.checked;if(s.on&&window.Notification&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}resched()};$('#sday').onchange=e=>{s.day=+e.target.value;resched()};$('#stime').onchange=e=>{s.time=e.target.value||'10:00';resched()}};

/* memorisation helper: hide words, reveal by tap, self-grade */
const QCACHE={};
async function surahVerses(sn){if(QCACHE[sn])return QCACHE[sn];const k='zad.hz.'+sn;try{const c=localStorage.getItem(k);if(c)return QCACHE[sn]=JSON.parse(c)}catch(e){}
 const r=await fetch(`${QAPI}/verses/by_chapter/${sn}?fields=text_uthmani&per_page=300&words=false`).then(r=>r.json());const v=r.verses.map(x=>({a:x.verse_number,t:x.text_uthmani}));try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}return QCACHE[sn]=v}
V.hifzhelp=async arg=>{const hz=Z.hz;let[sn,a1,a2,mode]=String(arg||'').split('/');sn=+sn||hz.sn||67;const cnt=CH(sn)[2];a1=Math.min(cnt,+a1||hz.a1||1);a2=Math.min(cnt,Math.max(a1,+a2||hz.a2||Math.min(cnt,a1+4)));mode=mode||hz.mode||'all';Object.assign(hz,{sn,a1,a2,mode});save();
 view.innerHTML=`${backBtn('services','المزيد')}<h1 class="page">مساعد الحفظ</h1><p class="znote">اختر المقطع فتُخفى الكلمات، تذكّر الكلمة ثم اضغطها لتكشفها. وفي النهاية قيّم نفسك.</p>
 <section class="zcard"><div class="zrow"><select id="hs" style="flex:2">${D.ch.map((c,i)=>`<option value="${i+1}" ${i+1===sn?'selected':''}>${ar(i+1)}. ${c[1]}</option>`).join('')}</select><select id="ha1" style="flex:1">${Array.from({length:cnt},(_,i)=>`<option ${i+1===a1?'selected':''} value="${i+1}">من ${ar(i+1)}</option>`).join('')}</select><select id="ha2" style="flex:1">${Array.from({length:cnt},(_,i)=>`<option ${i+1===a2?'selected':''} value="${i+1}">إلى ${ar(i+1)}</option>`).join('')}</select></div>
 <div class="zseg" style="margin-top:10px">${[['all','إخفاء الكل'],['half','كلمة وكلمة'],['first','أول حرف'],['none','إظهار']].map(([m,l])=>`<button data-m="${m}" class="${m===mode?'on':''}">${l}</button>`).join('')}</div></section>
 <section class="zcard"><div class="zhz" id="hzt"><div class="spin"></div></div><div class="zrow" style="margin-top:12px"><button class="btn ghost grow" id="hrev">كشف الكل</button><button class="btn ghost grow" id="hrst">${zi('refresh')} إعادة</button></div>
 <div class="zrow" style="margin-top:10px"><button class="btn gold grow" id="hbad">أخطأت</button><button class="btn grow" id="hok">أتقنت</button></div><div class="k" id="hst" style="margin-top:8px;text-align:center"></div></section>`;
 const goS=()=>go(`hifzhelp/${hz.sn}/${hz.a1}/${hz.a2}/${hz.mode}`);
 $('#hs').onchange=e=>{hz.sn=+e.target.value;hz.a1=1;hz.a2=Math.min(CH(hz.sn)[2],5);goS()};$('#ha1').onchange=e=>{hz.a1=+e.target.value;if(hz.a2<hz.a1)hz.a2=hz.a1;goS()};$('#ha2').onchange=e=>{hz.a2=Math.max(hz.a1,+e.target.value);goS()};
 view.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{hz.mode=b.dataset.m;goS()});
 let vs;try{vs=await surahVerses(sn)}catch(e){$('#hzt').innerHTML='<p class="znote">تعذّر تحميل الآيات، تحقق من الاتصال.</p>';return}
 const key=`${sn}:${a1}-${a2}`;hz.rec=hz.rec||{};const rec=hz.rec[key]||{ok:0,bad:0};
 const render=()=>{let n=0;$('#hzt').innerHTML=vs.filter(v=>v.a>=a1&&v.a<=a2).map(v=>v.t.split(' ').map(w=>{n++;if(mode==='first'){const m=w.match(/^.[\u064B-\u0652\u0670\u06D6-\u06ED\u0653-\u065F]*/);return`<span class="zword" data-w="${esc(w)}" data-f="1">${m?m[0]:''}ـ</span>`}const hide=mode==='all'||(mode==='half'&&n%2===0);return`<span class="zword${hide?' h':''}">${w}</span>`}).join(' ')+` <span style="color:var(--z-clay)">﴿${ar(v.a)}﴾</span>`).join(' ');
  $$('#hzt .zword').forEach(s=>s.onclick=()=>{if(s.dataset.f){s.textContent=s.dataset.w;delete s.dataset.f}s.classList.remove('h')})};
 render();const showSt=()=>{$('#hst').textContent=`هذا المقطع: أتقنته ${ar(rec.ok)} · أخطأت ${ar(rec.bad)}`};showSt();
 $('#hrev').onclick=()=>$$('#hzt .zword').forEach(s=>s.click());$('#hrst').onclick=render;
 $('#hok').onclick=()=>{rec.ok++;hz.rec[key]=rec;save();showSt();toast('أحسنت، ثبّتك الله');render()};$('#hbad').onclick=()=>{rec.bad++;hz.rec[key]=rec;save();showSt();render()}};
