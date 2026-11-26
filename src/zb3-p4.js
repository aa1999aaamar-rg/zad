
/* ============ ٢٣+٦١ المسلم الجديد: رحلة ٣٠ يومًا ============ */
const NML={ar:'العربية',en:'English',ur:'اردو',tl:'Tagalog',id:'Indonesia'};
const NMT=D3.nmt;/* 15 topics, titles in 5 languages (UI labels) + resource kind */
V.newmuslim=arg=>{const lang=NML[arg]?arg:(Z.nml||'ar');Z.nml=lang;Z.nmd=Z.nmd||{};sv();const R=D3.nm.filter(x=>x.lang===lang);const res=k=>{const r=R.filter(x=>x.kind===k);return r.length?r:R.filter(x=>x.kind==='guide')};const dir=(lang==='ar'||lang==='ur')?'rtl':'ltr';
 const days=[];NMT.forEach((t,i)=>{days.push({d:i*2+1,t,mode:0});days.push({d:i*2+2,t,mode:1})});
 const done=Object.keys(Z.nmd).length;const nxt=days.find(x=>!Z.nmd[x.d])||days[29];
 const lbl={ar:['تعلّم','طبّق وراجع','اليوم'],en:['Learn','Practise & review','Day'],ur:['سیکھیں','عمل اور دہرائی','دن'],tl:['Pag-aralan','Isagawa at balikan','Araw'],id:['Pelajari','Praktikkan & ulangi','Hari']}[lang];
 view.innerHTML=`${head('newmuslim','رحلة ٣٠ يومًا للمسلم الجديد بخمس لغات. كل يوم خطوة، ومعها درس من «دليل المسلم الجديد» و«IslamHouse» بلغته.')}
 <div class="zb-tabs">${Object.keys(NML).map(l=>`<a class="zchip${l===lang?' on':''}" href="#newmuslim/${l}">${NML[l]}</a>`).join('')}</div>
 ${sec('','',`<div class="zb-big">${ar(done)} <small>من ٣٠ يومًا</small></div><div class="zb-bar"><i style="width:${done/30*100}%"></i></div><p class="k" dir="${dir}">${lbl[2]} ${nxt.d}: <b>${e(nxt.t[lang])}</b></p>`)}
 <div class="zb3-nm" dir="${dir}">${days.map(x=>{const rs=res(x.t.k);const on=!!Z.nmd[x.d];return`<div class="zcard zb3-nd${on?' on':''}"><button class="zb3-ck" data-nd="${x.d}" aria-label="تم">${on?'✓':ar(x.d)}</button><div class="grow"><b>${lbl[2]} ${x.d} · ${e(x.t[lang])}</b><small>${lbl[x.mode]}</small>${x.mode===0?rs.slice(0,2).map(r=>`<a href="${e(r.url)}" target="_blank" rel="noopener">${e(r.title)} ↗</a>`).join(''):''}</div><span class="zb3-step">${zi(x.t.ic)}</span></div>`}).join('')}</div>
 ${sec('','',`<details><summary class="zb3-sum">${zi('quran')} أساس الرحلة: أركان الإسلام والإيمان والإحسان</summary>${D3.H.filter(h=>h.sec==='newmuslim').map(hadith).join('')}</details>`)}
 <p class="zb-src">المحتوى من newmuslimguide.com (دليل المسلم الجديد: العربية والإنجليزية والفلبينية) ومن islamhouse.com (الأردية والإندونيسية وغيرها)، روابط مباشرة إلى الدروس بكل لغة. العناوين ترجمة واجهة مختصرة.</p>`;
 $a('[data-nd]').forEach(b=>b.onclick=()=>{const d=b.dataset.nd;if(Z.nmd[d])delete Z.nmd[d];else Z.nmd[d]=Date.now();sv();V.newmuslim(lang)})};

/* ============ ٤٢ الزواج والمولود ============ */
V.marriage=arg=>{const t=['m','b','n'].includes(arg)?arg:'m';
 const body={m:sec('أدعية الزواج','heart',hs('marriage').map(hadith).join('')),
  b:sec('سنن المولود','star',hs('newborn').filter(h=>!/2132|2139/.test(h.k)).map(hadith).join(''))+sec('أحكام العقيقة','scroll',items('aqiqa').map(x=>`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`).join('')),
  n:sec('أحب الأسماء والأسماء المنهي عنها','pen',hs('newborn').filter(h=>/2132|2139/.test(h.k)).map(hadith).join('')+items('names').map(x=>`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`).join(''))}[t];
 view.innerHTML=`${head('marriage','أدعية وسنن موثقة من sunnah.com، وأحكام منقولة من فتاوى الشيخ ابن باز والإسلام سؤال وجواب.')}
 <div class="seg">${[['m','الزواج'],['b','المولود والعقيقة'],['n','تسمية المولود']].map(([k,n])=>`<button data-mt="${k}" class="${k===t?'on':''}">${n}</button>`).join('')}</div>${body}`;
 $a('[data-mt]').forEach(b=>b.onclick=()=>{location.hash='marriage/'+b.dataset.mt})};

/* ============ ٥٧ مساعد الحج ============ */
V.hajj=arg=>{const H=Z.hj=Z.hj||{};const d=D3.hj.find(x=>x.id===arg)||null;
 const dua=k=>{const h=D3.H.find(x=>x.k.includes(k));return h?hadith(h):''};
 if(!d){view.innerHTML=`${head('hajj','مناسك الحج يومًا بيوم (٨–١٣ ذو الحجة) مع قائمة مهام ومواقع المشاعر. الأحكام من فتاوى الشيخ ابن باز.')}
  ${sec('','',`<div class="zb3-hd">${D3.hj.map(x=>{const n=x.c.length,dn=x.c.filter((c,i)=>H[x.id+i]).length;return`<a href="#hajj/${x.id}" class="zb3-hdi"><b>${e(x.day)}</b><span>${e(x.n)}</span><small>${ar(dn)}/${ar(n)}</small></a>`}).join('')}</div>`)}
  ${sec('خريطة المشاعر','map',D3.places.filter(p=>p.g==='h').map(p=>`<a class="zb3-pl" href="${mapL(p.n,p.c)}" target="_blank" rel="noopener">${zi('pin')}<b>${e(p.n)}</b><small>خرائط Google ↗</small></a>`).join(''))}
  ${sec('التلبية','sparkle',dua('1549'))}
  <div class="zrow" style="gap:8px;flex-wrap:wrap"><a class="btn ghost grow" href="#umrah">دليل العمرة</a><a class="btn ghost grow" href="#tawaf">عدّاد الطواف والسعي</a><a class="btn ghost grow" href="#journey">رحلتي للحرمين</a></div>
  ${(()=>{const g=items('hajj').find(x=>site(x.url)==='haj.gov.sa'||site(x.url).endsWith('.gov.sa')&&site(x.url)!=='alifta.gov.sa');return g?`<p class="zb-src">${lnk(g.url,'دليل وزارة الحج والعمرة ↗')}</p>`:''})()}`;return}
 view.innerHTML=`<button class="back" onclick="location.hash='hajj'">${zi('chev')} مساعد الحج</button><h1 class="page">${e(d.day)} · ${e(d.n)}</h1>
 ${sec('قائمة اليوم','checkc',d.c.map((c,i)=>`<label class="zb3-ci"><input type="checkbox" data-hc="${d.id+i}"${H[d.id+i]?' checked':''}><span>${e(c)}</span></label>`).join(''))}
 ${d.q.length?sec('الأحكام','scroll',d.q.map(i=>{const x=items('hajj')[i];return x?`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`:''}).join('')):''}
 ${d.h.length?sec('من السنة','sparkle',d.h.map(dua).join('')):''}
 ${d.p.length?sec('الموقع','map',d.p.map(k=>{const p=D3.places.find(x=>x.k===k);return p?`<a class="zb3-pl" href="${mapL(p.n,p.c)}" target="_blank" rel="noopener">${zi('pin')}<b>${e(p.n)}</b><small>خرائط Google ↗</small></a>`:''}).join('')):''}`;
 $a('[data-hc]').forEach(c=>c.onchange=()=>{H[c.dataset.hc]=c.checked?1:0;sv()})};

/* ============ ٥٩ مزارات مكة والمدينة ============ */
V.ziyarat=()=>{const Q=items('ziyarat');
 view.innerHTML=`${head('ziyarat','الأماكن التاريخية التي يجوز زيارتها، وما هو مشروع فيها وما ليس بمشروع، من فتاوى الشيخ ابن باز والإسلام سؤال وجواب.')}
 ${D3.places.filter(p=>p.g==='z').map(p=>sec('','',`<div class="zb3-org"><span>${zi(p.ic||'pin')}</span><div><b>${e(p.n)}</b><small>${e(p.city)}</small></div></div>${p.leg?`<p class="zb3-leg ${p.ok?'ok':'no'}">${p.ok?'✓ ':'✗ '}${e(p.leg)}</p>`:''}${(p.q||[]).map(i=>Q[i]?quote(Q[i]):'').join('')}${(p.h||[]).map(k=>{const h=D3.H.find(x=>x.k.includes(k));return h?hadith(h):''}).join('')}<a class="btn ghost block" style="margin-top:8px" href="${mapL(p.n,p.c)}" target="_blank" rel="noopener">${zi('map')} الموقع على الخريطة ↗</a>`)).join('')}
 ${sec('قاعدة عامة','shield',`${D3.H.filter(h=>h.k.includes('1189')).map(hadith).join('')}${Q.filter((x,i)=>D3.zgen.includes(i)).map(quote).join('')}`)}`};

/* ============ ٦٢ وضع المرأة (خاص بالجهاز) ============ */
const WK='zad.w3';const WS=()=>{try{return JSON.parse(localStorage.getItem(WK)||'{}')}catch(x){return{}}};const WSV=o=>{try{localStorage.setItem(WK,JSON.stringify(o))}catch(x){}};
const dIso=d=>{const x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)};
const dDiff=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
V.women=()=>{const W=Object.assign({log:[],on:null,qada:0,qdone:0},WS());const today=dIso(Date.now());
 const cur=W.on?dDiff(W.on,today)+1:0;const last=W.log[W.log.length-1];
 const avg=W.log.length?Math.round(W.log.reduce((s,x)=>s+x.n,0)/W.log.length):0;
 view.innerHTML=`${head('women','متابعة خاصة لأيام العادة مع أحكامها. البيانات تبقى على جهازك فقط، لا تُرفع ولا تدخل في النسخ الاحتياطي.')}
 <div class="zb3-priv">${zi('eyeoff')} محفوظ على هذا الجهاز فقط</div>
 ${sec('الحالة الآن','cal',W.on?`<div class="zb-big">اليوم ${ar(cur)} <small>منذ ${ar(W.on.split('-').reverse().join('/'))}</small></div><p class="zb3-kp">في أيام الحيض لا صلاة ولا صيام، وتقضين الصيام لا الصلاة.</p><label class="zb3-f"><span>يوم الطهر</span><input type="date" class="zb-in" id="wend" value="${today}" max="${today}"></label><button class="btn block" id="woff">${zi('check')} سجّلي الطهر</button>`:`<p class="zb3-kp">${last?`آخر دورة: ${ar(last.n)} أيام (من ${ar(last.s.split('-').reverse().join('/'))}).`:'لم تسجّلي شيئًا بعد.'}${avg?` المتوسط: ${ar(avg)} أيام.`:''}</p><label class="zb3-f"><span>بداية الدورة</span><input type="date" class="zb-in" id="wstart" value="${today}" max="${today}"></label><button class="btn block" id="won">ابدئي التسجيل</button>`)}
 ${sec('قضاء الصيام','fast',`<div class="zb-big">${ar(Math.max(0,W.qada-W.qdone))} <small>يومًا متبقيًا</small></div><div class="zrow" style="gap:8px;flex-wrap:wrap"><button class="chip" data-wq="1">+ يوم فاتني</button><button class="chip" data-wq="-1">− تصحيح</button><button class="btn sm" data-wd="1">قضيت يومًا ✓</button></div><p class="zb-src">إذا وافقت أيام الدورة شهر رمضان، أضيفيها هنا لتقضيها قبل رمضان القادم.</p>`)}
 ${W.log.length?sec('السجل','list',W.log.slice(-6).reverse().map(x=>`<div class="kv"><span>${ar(x.s.split('-').reverse().join('/'))}</span><b>${ar(x.n)} أيام</b></div>`).join('')+`<button class="zb2-rep" id="wclr" style="display:block;margin:10px auto 0;background:none;border:0;color:var(--muted);text-decoration:underline">مسح السجل كله</button>`):''}
 ${sec('الأحكام','scroll',`${hs('women').map(hadith).join('')}${items('women').map(x=>`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`).join('')}`)}`;
 const rr=()=>V.women();
 const on=$1('#won');if(on)on.onclick=()=>{W.on=$1('#wstart').value||today;WSV(W);rr()};
 const off=$1('#woff');if(off)off.onclick=()=>{const end=$1('#wend').value||today;const n=Math.max(1,dDiff(W.on,end)+1);W.log.push({s:W.on,n});W.log=W.log.slice(-24);W.on=null;WSV(W);tst('تم التسجيل');rr()};
 $a('[data-wq]').forEach(b=>b.onclick=()=>{W.qada=Math.max(0,W.qada+ +b.dataset.wq);if(W.qdone>W.qada)W.qdone=W.qada;WSV(W);rr()});
 $a('[data-wd]').forEach(b=>b.onclick=()=>{if(W.qdone<W.qada){W.qdone++;WSV(W);rr()}});
 const c=$1('#wclr');if(c)c.onclick=()=>{if(confirm('مسح السجل؟')){W.log=[];WSV(W);rr()}}};

/* ============ ٧ هذا اليوم في التاريخ الإسلامي ============ */
const HMN=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
const hToday=()=>{try{if(typeof hijriToday==='function'){const h=hijriToday();if(h&&h.m&&h.d)return{d:+h.d,m:+h.m,y:+h.y}}}catch(x){}try{const p=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(new Date());const g=t=>+(p.find(x=>x.type===t)||{}).value;return{d:g('day'),m:g('month'),y:g('year')}}catch(x){return{d:1,m:1,y:1448}}};
const evC=x=>sec('','',`<div class="zb3-ev"><span><b>${ar(x.hd)}</b><small>${HMN[x.hm-1]}</small></span><div><b>${e(x.t)}</b>${x.hy?`<small>سنة ${ar(x.hy)}هـ</small>`:''}</div></div><p class="zb3-kp">${e(x.d)}</p><blockquote class="zb-q">${e(x.quote)}<a href="${e(x.url)}" target="_blank" rel="noopener">${e(x.src)} ↗</a></blockquote>`);
V.tih=arg=>{const T=hToday();const L=D3.tih;const td=L.filter(x=>x.hm===T.m&&x.hd===T.d);
 let pick=null;if(!td.length){const seed=T.y*400+T.m*31+T.d;pick=L[seed%L.length]}
 const all=arg==='all';
 view.innerHTML=`${head('tih','أحداث ثابتة التاريخ الهجري في المصادر المعتمدة، كل حدث بمصدره. القليل الموثق خير من الكثير الضعيف.')}
 <p class="k" style="text-align:center">اليوم: ${ar(T.d)} ${HMN[T.m-1]||''} ${ar(T.y)}هـ (أم القرى)</p>
 ${td.length?td.map(evC).join(''):`${sec('','',`<p class="znote" style="text-align:center;margin:0">لا يوجد حدث موثق اليوم</p>`)}<h2 class="sec">حدث موثق من التقويم</h2>${evC(pick)}`}
 <a class="btn ghost block" href="#tih/${all?'':'all'}">${all?'إخفاء القائمة':'كل الأحداث الموثقة ('+ar(L.length)+')'}</a>
 ${all?L.slice().sort((a,b)=>a.hm-b.hm||a.hd-b.hd).map(evC).join(''):''}`};
