/* زاد v4.4: تحدي الأسبوع (local). Lazy module, minified to site/zf-chal.js */
(function(){'use strict';const {zi,ar,esc,back,F,day}=ZF;
const C=F.ch=Object.assign({cur:null,hist:[],all:{},badges:{}},F.ch||{});
const LIST=[['adhkar','أذكار الصباح والمساء','sunrise','كل يوم تقرأ أذكار الصباح وأذكار المساء'],['wird','ورد يومي من القرآن','quran','عدد صفحات تختاره كل يوم'],['duha','صلاة الضحى','sun','صلاة الضحى كل يوم'],['qiyam','قيام الليل','moon','ركعتان أو أكثر من الليل كل يوم'],['istighfar','الاستغفار ١٠٠ مرة','beads','قل «أستغفر الله» ١٠٠ مرة كل يوم'],['salawat','الصلاة على النبي ﷺ ١٠٠ مرة','heart','١٠٠ مرة كل يوم'],['salah','الصلوات الخمس في وقتها','checkc','سجّل صلواتك في «متابعة الصلوات»']];
const meta=id=>LIST.find(x=>x[0]===id)||LIST[0];
const title=c=>c.id==='wird'?`ورد يومي: ${ar(c.n||5)} صفحات`:meta(c.id)[1];
const addD=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return day(x)};
const WDS=['أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'];
function streak(){let n=0,d=day();if(!C.all[d])d=addD(d,-1);while(C.all[d]){n++;d=addD(d,-1)}return n}
function bestStreak(){const ks=Object.keys(C.all).sort();let b=0,c=0,p=null;for(const k of ks){c=p&&addD(p,1)===k?c+1:1;b=Math.max(b,c);p=k}return b}
function auto(c){const t=day(),o=F.d[t]||{};try{if(c.id==='adhkar')return!!((o.m||(S.adhkarDone||{})[t])&&o.e);
 if(c.id==='istighfar')return Object.entries(o.tx||{}).some(([k,v])=>/أستغفر|استغفر/.test(k)&&v>=100);
 if(c.id==='salawat')return Object.entries(o.tx||{}).some(([k,v])=>/صل/.test(k)&&/محمد/.test(k)&&v>=100);
 if(c.id==='salah'){const l=(S.salah||{})[t]||{};return Object.values(l).filter(v=>v==='o'||v==='j').length>=5}}catch(e){}return false}
const BADGES=[['first','أول تحدٍّ مكتمل (٥ أيام فأكثر)',()=>C.hist.some(h=>h.n>=5)],['perfect','أسبوع كامل ٧ من ٧',()=>C.hist.some(h=>h.n>=7)],['s3','سلسلة ٣ أيام',()=>bestStreak()>=3],['s7','سلسلة ٧ أيام',()=>bestStreak()>=7],['s14','سلسلة ١٤ يومًا',()=>bestStreak()>=14],['s30','سلسلة ٣٠ يومًا',()=>bestStreak()>=30],['three','٣ تحديات مكتملة',()=>C.hist.filter(h=>h.n>=5).length>=3]];
const COL=['#34457a','#c0693f','#4f5e2f','#6a3f6e','#2f4f5f','#7a3343','#9a6a1f'];
function badgeSVG(i,on,label){const c=on?COL[i%COL.length]:'#b9b4ab';const pts=[];for(let k=0;k<16;k++){const r=k%2?34:46,a=k*Math.PI/8-Math.PI/2;pts.push((50+r*Math.cos(a)).toFixed(1)+','+(50+r*Math.sin(a)).toFixed(1))}
 return`<svg viewBox="0 0 100 100" aria-label="${esc(label)}"><polygon points="${pts.join(' ')}" fill="${c}" opacity="${on?1:.35}"/><circle cx="50" cy="50" r="27" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/><rect x="38" y="38" width="24" height="24" transform="rotate(45 50 50)" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.4"/>${on?'':'<path d="M44 52h12v9H44zM46 52v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#fff" stroke-width="2"/>'}</svg>`}
function checkBadges(){let nw=null;BADGES.forEach(([id,l,f])=>{if(!C.badges[id]&&f()){C.badges[id]=day();nw=l}});if(nw){save();toast('شارة جديدة: '+nw)}}
function finishIfDone(){const c=C.cur;if(!c)return;if(day()>addD(c.start,6)){C.hist.unshift({id:c.id,n:Object.keys(c.days).length,start:c.start,t:title(c)});C.hist=C.hist.slice(0,30);C.cur=null;save();checkBadges()}}
function mark(d,v){const c=C.cur;if(!c)return;if(v){c.days[d]=1;C.all[d]=1}else{delete c.days[d];delete C.all[d]}save();checkBadges()}
const css=`.zfc .pick{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.zfc .pick button{border:1px solid var(--line);background:var(--card);border-radius:18px;padding:14px 10px;text-align:right;font:inherit;color:var(--ink);cursor:pointer}.zfc .pick button span{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--z-soft);color:var(--accent);margin-bottom:8px}.zfc .pick button svg{width:21px;height:21px}.zfc .pick b{display:block;font-size:14.5px}.zfc .pick small{font-size:12px;color:var(--muted)}
.zfc .wk{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin:10px 0}.zfc .wk div{text-align:center;font-size:11px;color:var(--muted)}.zfc .wk i{display:grid;place-items:center;height:40px;border-radius:12px;border:1px dashed var(--line);margin-bottom:4px;font-style:normal;color:var(--muted)}.zfc .wk .on i{background:var(--accent);border:0;color:#fff}.zfc .wk .td i{border:2px solid var(--accent)}.zfc .wk i svg{width:18px;height:18px}
.zfc .bigck{width:100%;padding:18px;border-radius:20px;border:0;background:var(--accent);color:#fff;font:inherit;font-size:18px;font-weight:700;display:flex;gap:10px;align-items:center;justify-content:center;cursor:pointer}.zfc .bigck.done{background:color-mix(in srgb,#2f8a5b 85%,#000)}.zfc .bigck svg{width:24px;height:24px}
.zfc .bd{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.zfc .bd div{text-align:center;font-size:11px;color:var(--muted);line-height:1.3}.zfc .bd svg{width:100%;max-width:72px;display:block;margin:0 auto 4px}`;
ZF.m.wchal=()=>{if(!document.getElementById('zfccss')){const s=document.createElement('style');s.id='zfccss';s.textContent=css;document.head.appendChild(s)}
 finishIfDone();const c=C.cur,t=day(),st=streak();
 if(c&&!c.days[t]&&auto(c)){mark(t,1);c._auto=1;toast('سجّلنا إنجاز اليوم تلقائيًا من التطبيق')}
 let main='';
 if(!c){main=`<section class="zcard"><h3>${zi('flag')}اختر تحدي الأسبوع</h3><p class="znote" style="margin-top:0">٧ أيام تبدأ من اليوم. سجّل إنجازك كل يوم وابنِ سلسلتك.</p><div class="pick">${LIST.map(([id,l,i,d])=>`<button data-c="${id}"><span>${zi(i)}</span><b>${l}</b><small>${d}</small></button>`).join('')}</div></section>`}
 else{const days=Array.from({length:7},(_,i)=>addD(c.start,i)),n=Object.keys(c.days).length,left=6-days.indexOf(t);
  main=`<section class="zcard"><div class="zrow" style="justify-content:space-between"><h3>${zi(meta(c.id)[2])}${esc(title(c))}</h3><span class="zstreak">${zi('flame')}${ar(st)}</span></div>
  <div class="wk">${days.map(d=>{const dt=new Date(d+'T12:00:00');return`<div class="${c.days[d]?'on':''}${d===t?' td':''}"><i>${c.days[d]?zi('check'):ar(dt.getDate())}</i>${WDS[dt.getDay()]}</div>`}).join('')}</div>
  <button class="bigck${c.days[t]?' done':''}" id="cck">${zi('check')}${c.days[t]?'أنجزت تحدي اليوم':'سجّل إنجاز اليوم'}</button>
  <div class="zstat" style="margin-top:12px"><div><b>${ar(n)}/${ar(7)}</b><small>أيام منجزة</small></div><div><b>${ar(st)}</b><small>سلسلة الأيام</small></div><div><b>${ar(Math.max(0,left))}</b><small>أيام باقية</small></div></div>
  <div class="zchips">${days.indexOf(t)>0&&!c.days[addD(t,-1)]?`<button class="zchip" id="cy">${zi('check')}أنجزته أمس</button>`:''}<button class="zchip" id="cx" style="color:var(--z-clay)">${zi('x')}إنهاء التحدي</button></div></section>`}
 const hist=C.hist.slice(0,5);
 view.innerHTML=`${back('services','المزيد')}<h1 class="page">تحدي الأسبوع</h1><div class="zfc">${main}
 <section class="zcard"><h3>${zi('medal')}شاراتي</h3><div class="bd">${BADGES.map(([id,l],i)=>`<div>${badgeSVG(i,!!C.badges[id],l)}${l}</div>`).join('')}</div><div class="k" style="margin-top:8px">أفضل سلسلة: ${ar(bestStreak())} ${bestStreak()>2&&bestStreak()<11?'أيام':'يوم'}</div></section>
 ${hist.length?`<section class="zcard"><h3>${zi('list')}تحدياتي السابقة</h3><div class="zlist">${hist.map(h=>`<div class="zli"><span class="zq">${zi(meta(h.id)[2])}</span><span class="grow">${esc(h.t)}<small>${ar(h.n)} من ٧ أيام · من ${ar(h.start.split('-').reverse().slice(0,2).join('/'))}</small></span></div>`).join('')}</div></section>`:''}</div>`;
 view.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const id=b.dataset.c;const go=n=>{C.cur={id,n,start:day(),days:{}};save();ZF.m.wchal()};
  if(id==='wird'){const el=document.createElement('div');el.className='zcard';el.innerHTML=`<b>كم صفحة كل يوم؟</b><div class="zchips">${[2,5,10,20].map(n=>`<button class="zchip" data-n="${n}">${ar(n)} صفحات</button>`).join('')}</div>`;b.closest('section').after(el);el.querySelectorAll('[data-n]').forEach(x=>x.onclick=()=>go(+x.dataset.n));el.scrollIntoView({behavior:'smooth',block:'center'})}else go(0)});
 const ck=$('#cck');if(ck)ck.onclick=()=>{mark(t,!C.cur.days[t]);if(C.cur.days[t]){try{navigator.vibrate&&navigator.vibrate([20,40,30])}catch(e){}toast('بارك الله فيك')}ZF.m.wchal()};
 const cy=$('#cy');if(cy)cy.onclick=()=>{mark(addD(t,-1),1);ZF.m.wchal()};
 const cx=$('#cx');if(cx)cx.onclick=()=>{if(!confirm('إنهاء التحدي الحالي؟'))return;const c2=C.cur;C.hist.unshift({id:c2.id,n:Object.keys(c2.days).length,start:c2.start,t:title(c2)});C.cur=null;save();ZF.m.wchal()}};
ZF.chal={streak,bestStreak};
})();
