
/* ============ ١٣ حاسبة المواريث ============ */
const MG=[['الزوجية',['husband','wife']],['الفروع (الأولاد وأولاد الابن)',['son','daughter','sson','sdau']],['الأصول',['father','mother','gf','gmm','gmf']],['الإخوة',['fb','fs','pb','ps','mb','ms']],['العصبات البعيدة',['fbs','pbs','fu','pu','fus','pus']]];
const fr=f=>f[0]?`${ar(f[0])}/${ar(f[1])}`:'٠';
const pct=f=>f[0]?ar((f[0]/f[1]*100).toFixed(2).replace(/\.?0+$/,''))+'٪':'—';
const BAS={'4:11':'النساء: ١١','4:12':'النساء: ١٢','4:176':'النساء: ١٧٦'};
V.mawarith=()=>{const M=Z.mw=Object.assign({h:{},amt:''},Z.mw||{});
 view.innerHTML=`${head('mawarith')}
 <div class="zb3-warn">${zi('shield')}<div><b>للاستئناس، والقسمة الرسمية عن طريق المحكمة.</b><small>الحساب على المذهب الحنبلي المعمول به في المحاكم السعودية، مع التنبيه على المسائل الخلافية. تُقسم التركة بعد تجهيز الميت وسداد ديونه وتنفيذ وصيته (النساء: ١١).</small></div></div>
 ${sec('الورثة الأحياء','circles',`${MG.map(([g,ks])=>`<div class="zb3-mg"><div class="k">${g}</div>${ks.map(k=>`<div class="zb3-st"><span>${ZMW.H[k]}</span><div><button data-m="${k}" data-d="-1" aria-label="إنقاص">−</button><b id="mw-${k}">${ar(M.h[k]||0)}</b><button data-m="${k}" data-d="1" aria-label="زيادة">+</button></div></div>`).join('')}</div>`).join('')}
 <label class="k" for="mwamt" style="display:block;margin-top:10px">قيمة التركة (اختياري، ريال)</label><input class="zb-in" id="mwamt" inputmode="decimal" value="${e(M.amt)}" placeholder="مثلًا ٣٠٠٠٠٠">
 <div class="zrow" style="gap:8px;margin-top:10px"><button class="btn grow" id="mwgo">${zi('chart')} احسب الأنصبة</button><button class="btn ghost" id="mwclr">مسح</button></div>`)}
 <div id="mwres"></div>
 ${sec('أدلة المواريث من القرآن','quran',`<div class="zb-tabs">${Object.keys(BAS).map((k,i)=>`<button class="zchip${i?'':' on'}" data-bv="${k}">${BAS[k]}</button>`).join('')}</div><div id="mwv">${verse('4:11')}</div><p class="zb-src">نص الآيات من api.alquran.cloud (المصحف العثماني).</p>`)}
 ${sec('اختبار الحاسبة على مسائل منشورة','checkc',`<p class="k">١٥ مسألة من فتاوى ابن باز والإسلام سؤال وجواب، تُحسب الآن على جهازك:</p><div id="mwt"></div>`)}`;
 const draw=()=>{const h=M.h;const r=ZMW.calc(h);const el=$1('#mwres');if(!Object.values(h).some(x=>x>0)){el.innerHTML='';return}
  if(r.err){el.innerHTML=sec('','',`<p class="znote">${r.err}</p>`);return}
  const amt=num(M.amt);const got=r.rows.filter(x=>x.type!=='b'),bl=r.rows.filter(x=>x.type==='b');
  el.innerHTML=sec('النتيجة','chart',`${r.awl?'<span class="zb3-tag">عَوْل</span>':''}${r.radd?'<span class="zb3-tag">رَدّ</span>':''}
   <div class="zb3-tbl">${got.map(x=>`<div class="zb3-row"><div><b>${x.name}${x.n>1?` ×${ar(x.n)}`:''}</b><small>${e(x.why)}</small>${x.basis?`<button class="zb3-bas" data-bv="${x.basis}">الدليل: ${BAS[x.basis]}</button>`:''}${x.hadith==='b6732'?`<a class="zb3-bas" href="https://sunnah.com/bukhari:6732" target="_blank" rel="noopener">«ألحقوا الفرائض بأهلها…» البخاري ٦٧٣٢</a>`:''}</div><div class="zb3-sh"><b>${fr(x.share)}</b><small>${pct(x.share)}</small>${x.n>1&&x.share[0]?`<small>لكل واحد ${fr(x.per)}</small>`:''}${amt&&x.share[0]?`<em>${money(amt*x.share[0]/x.share[1])} ر.س${x.n>1?`<br><small>لكل واحد ${money(amt*x.per[0]/x.per[1])}</small>`:''}</em>`:''}</div></div>`).join('')}</div>
   ${bl.length?`<div class="k" style="margin-top:10px">لا يرثون في هذه المسألة:</div>${bl.map(x=>`<div class="zb3-bl">${x.name}${x.n>1?` ×${ar(x.n)}`:''} — ${e(x.why)}</div>`).join('')}`:''}
   ${r.notes.map(n=>`<p class="zb3-note">${e(n)}</p>`).join('')}
   <p class="zb-src">أصل المسألة بعد التصحيح: ${ar(r.base)} سهمًا. للاستئناس، والقسمة الرسمية عن طريق المحكمة.</p>`);
  $a('#mwres [data-bv]').forEach(b=>b.onclick=()=>showV(b.dataset.bv,true))};
 const showV=(k,scroll)=>{$a('[data-bv].zchip').forEach(x=>x.classList.toggle('on',x.dataset.bv===k));$1('#mwv').innerHTML=verse(k);if(scroll)$1('#mwv').scrollIntoView({behavior:'smooth',block:'center'})};
 $a('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m;const mx={husband:1,wife:4,father:1,mother:1,gf:1,gmm:1,gmf:1}[k]||20;M.h[k]=Math.max(0,Math.min(mx,(M.h[k]||0)+ +b.dataset.d));if(k==='husband'&&M.h.husband)M.h.wife=0;if(k==='wife'&&M.h.wife)M.h.husband=0;['husband','wife',k].forEach(q=>{const el=$1('#mw-'+q);if(el)el.textContent=ar(M.h[q]||0)});sv();draw()});
 $1('#mwamt').oninput=x=>{M.amt=x.target.value;sv();draw()};$1('#mwgo').onclick=()=>{draw();const el=$1('#mwres');if(el&&el.firstChild)el.scrollIntoView({behavior:'smooth'})};
 $1('#mwclr').onclick=()=>{M.h={};M.amt='';sv();V.mawarith()};
 $a('.zchip[data-bv]').forEach(b=>b.onclick=()=>showV(b.dataset.bv));
 /* the published cases, run live */
 const sim=s=>{const[a,b]=s.split('/').map(Number);if(!a)return'0/1';const g=(x,y)=>y?g(y,x%y):x;const d=g(a,b);return a/d+'/'+b/d};let pass=0;
 const rows=D3.mwc.map(t=>{const r=ZMW.calc(t.h);const got={};r.rows.forEach(x=>got[x.k]=ZMW.frac(x.share));const ok=Object.keys(t.e).every(k=>sim(got[k]||'0/1')===sim(t.e[k]));if(ok)pass++;
  return`<div class="zb3-tc${ok?' ok':' no'}"><span>${ok?'✓':'✗'}</span><div><b>${e(t.n)}</b><small>${Object.keys(t.e).map(k=>ZMW.H[k]+' '+fr(t.e[k].split('/').map(Number))).join(' · ')}</small>${lnk(t.src,'المصدر ↗')}</div></div>`});
 $1('#mwt').innerHTML=`<div class="zb3-pass" data-pass="${pass}">${ar(pass)} من ${ar(D3.mwc.length)} صحيحة</div>`+rows.join('');
 draw()};

/* ============ ٣٢ آية وقصة للأطفال ============ */
V.kidstory=arg=>{const L=D3.ks;const i=L.findIndex(x=>x.id===arg);
 if(i<0){view.innerHTML=`${head('kidstory','قصص قصيرة من القرآن نفسه، بكلمات سهلة للأطفال، ومعها الآيات.')}
  <div class="zb3-ksl">${L.map(x=>`<a class="zcard zb3-kc" href="#kidstory/${x.id}"><span>${zi(x.ic)}</span><b>${e(x.t)}</b><small>${CHN(x.s)}: ${ar(x.a)}–${ar(x.b)}</small></a>`).join('')}</div>
  <p class="zb-src">تبسيط للأطفال من نص الآيات، بلا زيادة عليها. نص الآيات من api.alquran.cloud.</p><a class="btn ghost block" href="#stories">قصص القرآن (للكبار)</a>`;return}
 const x=L[i];Z.ksr=Z.ksr||{};Z.ksr[x.id]=1;sv();
 view.innerHTML=`<button class="back" onclick="location.hash='kidstory'">${zi('chev')} آية وقصة</button><h1 class="page">${e(x.t)}</h1>
 ${sec('','',`<span class="zb3-tag">تبسيط للأطفال من نص الآيات</span>${x.p.map(t=>`<p class="zb3-kp">${e(t)}</p>`).join('')}`)}
 ${sec('الآيات','quran',verses(x.s,x.a,x.b))}
 ${sec('نتعلّم','star',`<p class="zb3-kp">${e(x.l)}</p>`)}
 <div class="zrow" style="gap:8px">${i>0?`<a class="btn ghost grow" href="#kidstory/${L[i-1].id}">‹ السابقة</a>`:''}${i<L.length-1?`<a class="btn grow" href="#kidstory/${L[i+1].id}">القصة التالية ›</a>`:''}</div>`};
