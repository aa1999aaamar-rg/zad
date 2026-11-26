
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
