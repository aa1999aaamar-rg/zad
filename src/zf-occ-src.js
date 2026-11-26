/* زاد v4.4: عدّاد رمضان والمناسبات (Umm al-Qura via the app's zHij with the ±1 adjust) + optional push reminders. Lazy module, minified to site/zf-occ.js */
(function(){'use strict';const {zi,ar,esc,back,F,day}=ZF;
const HM=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
const WD=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const MN=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const OCC=[['ramadan','رمضان',1,9,'moon'],['fitr','عيد الفطر',1,10,'sparkle'],['dhul10','العشر من ذي الحجة',1,12,'star'],['arafa','يوم عرفة',9,12,'kaaba'],['adha','عيد الأضحى',10,12,'sparkle'],['ashura','عاشوراء',10,1,'cal']];
const hj=d=>window.zHij?zHij(d):(()=>{const p={};new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(d).forEach(o=>p[o.type]=o.value);return{d:+p.day,m:+p.month,y:parseInt(p.year)}})();
function nextDate(hd,hm){const t=new Date();t.setHours(12,0,0,0);for(let i=0;i<400;i++){const d=new Date(t);d.setDate(d.getDate()+i);const h=hj(d);if(h.d===hd&&h.m===hm)return{d,i,h}}return null}
function whiteNext(){const t=new Date();t.setHours(12,0,0,0);for(let i=0;i<40;i++){const d=new Date(t);d.setDate(d.getDate()+i);const h=hj(d);if(h.d>=13&&h.d<=15)return{d,i,h}}return null}
const gd=d=>`${WD[d.getDay()]} ${ar(d.getDate())} ${MN[d.getMonth()]} ${ar(d.getFullYear())}`;
const hdS=h=>`${ar(h.d)} ${HM[h.m-1]} ${ar(h.y)}هـ`;
const left=i=>i===0?'اليوم':i===1?'غدًا':i===2?'بعد غد':`بقي ${ar(i)} ${i<=10?'أيام':'يومًا'}`;
function cd(ms){ms=Math.max(0,ms);const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return[[d,'يوم'],[h,'ساعة'],[m,'دقيقة'],[s,'ثانية']]}
const css=`.zfo .hero{background:linear-gradient(135deg,#1d2545,#34457a);color:#fff;border:0}.zfo .hero h3{color:#f2bd9b}.zfo .hero .k{color:rgba(255,255,255,.75)}.zfo .cdw{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0 6px;direction:rtl}.zfo .cdw div{background:rgba(255,255,255,.1);border-radius:14px;padding:10px 4px;text-align:center}.zfo .cdw b{display:block;font-size:30px;font-variant-numeric:tabular-nums}.zfo .cdw small{font-size:12px;opacity:.8}.zfo .hn{font-size:26px;font-weight:700;margin:4px 0}.zfo .li b{font-size:15px}.zfo .pill{font-size:12px;padding:4px 10px;border-radius:999px;background:var(--z-soft);color:var(--accent);white-space:nowrap}`;
let tm=0;
ZF.m.occ=()=>{if(!document.getElementById('zfocss')){const s=document.createElement('style');s.id='zfocss';s.textContent=css;document.head.appendChild(s)}
 clearInterval(tm);const now=new Date(),th=hj(now),f=(S.z4&&S.z4.fast)||{adj:0};
 const items=OCC.map(([id,n,hd,hm,ic])=>{const x=nextDate(hd,hm);return x&&{id,n,ic,...x}}).filter(Boolean).sort((a,b)=>a.i-b.i);
 let hero=items.find(x=>x.id==='ramadan');let heroT='',heroN='';
 if(th.m===9){const e=items.find(x=>x.id==='fitr');heroT=`اليوم ${ar(th.d)} رمضان`;heroN='بقي على عيد الفطر';hero=e}else heroN=hero?'بقي على رمضان':'';
 const wn=whiteNext();const O=F.occ=Object.assign({on:false,pre:true,eve:true,time:'20:30'},F.occ||{});const pon=ZF.pushOn();
 view.innerHTML=`${back('services','المزيد')}<h1 class="page">المناسبات</h1><div class="zfo">
 ${hero?`<section class="zcard hero"><h3>${zi('moon')}${heroT||'رمضان '+ar(hero.h.y)+'هـ'}</h3><div class="hn">${heroN}</div><div class="cdw" id="ocd"></div><div class="k">${hero.id==='fitr'?'عيد الفطر':'١ رمضان'}: ${gd(hero.d)} · ${hdS(hero.h)}</div></section>`:''}
 <section class="zcard"><div class="zrow" style="justify-content:space-between"><h3>${zi('cal')}المناسبات القادمة</h3><span class="k">اليوم ${hdS(th)}</span></div><div class="zlist">
 ${items.map(x=>`<div class="zli li"><span class="zq">${zi(x.ic)}</span><span class="grow"><b>${x.n}</b><small>${gd(x.d)} · ${hdS(x.h)}</small></span><span class="pill">${left(x.i)}</span></div>`).join('')}
 ${wn?`<div class="zli li"><span class="zq">${zi('moon')}</span><span class="grow"><b>الأيام البيض</b><small>${wn.i===0?'اليوم '+ar(wn.h.d)+' '+HM[wn.h.m-1]:'تبدأ '+gd(wn.d)} · ١٣ و١٤ و١٥ من كل شهر</small></span><span class="pill">${left(wn.i)}</span></div>`:''}</div>
 <p class="znote">التواريخ حسب تقويم أم القرى${+f.adj?` مع تعديل ${f.adj>0?'+':'−'}${ar(Math.abs(f.adj))} يوم`:''}، والعبرة بإعلان الجهات الرسمية برؤية الهلال.</p>
 <div class="zset"><span class="grow"><b>تعديل التاريخ الهجري</b><small>نفس إعداد تذكير الصيام</small></span><select id="oadj">${[-1,0,1].map(v=>`<option value="${v}" ${+f.adj===v?'selected':''}>${v>0?'+١ يوم':v<0?'−١ يوم':'بدون'}</option>`).join('')}</select></div></section>
 <section class="zcard"><h3>${zi('bell')}تذكير قبل المناسبة</h3>${pon?`<label class="zset"><span class="grow"><b>ذكّرني بالمناسبات</b><small>رمضان، العشر، عرفة، العيدين، عاشوراء</small></span><span class="zsw"><input type="checkbox" id="oon" ${O.on?'checked':''}><i></i></span></label>
 ${O.on?`<label class="zset"><span class="grow"><b>قبلها بيوم</b><small>الساعة ١٠ صباحًا</small></span><span class="zsw"><input type="checkbox" id="opre" ${O.pre?'checked':''}><i></i></span></label><label class="zset"><span class="grow"><b>ليلتها</b><small>مساء اليوم السابق</small></span><span class="zsw"><input type="checkbox" id="oeve" ${O.eve?'checked':''}><i></i></span></label><div class="zset"><span class="grow"><b>وقت تذكير الليلة</b></span><input type="time" id="otm" value="${O.time}"></div>`:''}
 <p class="znote">الأيام البيض يذكّرك بها «تذكير الصيام» أصلًا، فلا نكررها هنا.</p>`:`<p class="znote">فعّل التنبيهات أولًا ليصلك التذكير حتى عند إغلاق التطبيق.</p><a class="btn block" href="#push">${zi('bell')} تفعيل التنبيهات</a>`}</section></div>`;
 const up=()=>{save();ZF.pushSync();ZF.m.occ()};
 $('#oadj').onchange=e=>{S.z4.fast.adj=+e.target.value;save();try{resched()}catch(x){}ZF.pushSync();ZF.m.occ()};
 const on=$('#oon');if(on)on.onchange=e=>{O.on=e.target.checked;up();toast(O.on?'تم تفعيل تذكير المناسبات':'تم إيقاف تذكير المناسبات')};
 const pr=$('#opre');if(pr)pr.onchange=e=>{O.pre=e.target.checked;up()};const ev=$('#oeve');if(ev)ev.onchange=e=>{O.eve=e.target.checked;up()};const t=$('#otm');if(t)t.onchange=e=>{O.time=e.target.value||'20:30';save();ZF.pushSync();toast('تم الحفظ')};
 if(hero){const tgt=new Date(hero.d);tgt.setHours(0,0,0,0);const draw=()=>{const el=$('#ocd');if(!el){clearInterval(tm);return}el.innerHTML=cd(tgt-new Date()).map(([v,l])=>`<div><b>${ar(v)}</b><small>${l}</small></div>`).join('')};draw();tm=setInterval(draw,1000)}};
ZF.occ={nextDate};
})();
