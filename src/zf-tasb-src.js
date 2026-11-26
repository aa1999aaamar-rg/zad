/* زاد v4.4 → v4.7.1 loader: السبحة الذكية (big tap area, haptics at 33/100 on Android, visual flash everywhere, Wake Lock, dark screen). Lazy module, minified to site/zf-tasb.js */
(function(){'use strict';const {zi,ar,esc,back,F,day,track,wake}=ZF;
const T=S.tasb=Object.assign({i:0,target:33,count:0,total:0},S.tasb||{});const X=F.tc=Object.assign({cust:[],sel:null},F.tc||{});
const CAN_VIB=typeof navigator.vibrate==='function';const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const pres=()=>(typeof DHIKR!=='undefined'?DHIKR:['سُبْحَانَ اللَّهِ','الْحَمْدُ لِلَّهِ','اللَّهُ أَكْبَرُ']);
const list=()=>pres().map((t,i)=>({k:'p'+i,t})).concat(X.cust.map((t,i)=>({k:'c'+i,t,c:1})));
const cur=()=>{const l=list();return l.find(x=>x.k===X.sel)||l[Math.min(T.i||0,l.length-1)]||l[0]};
let wl=null,dark=null;
const css=`.zft .tbtn{position:relative;width:min(80vw,300px);aspect-ratio:1;margin:6px auto;border-radius:50%;border:0;background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--accent) 18%,var(--card)),var(--card) 70%);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--accent) 30%,transparent),var(--shadow);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:inherit;color:var(--ink);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;transition:transform .06s}
.zft .tbtn:active{transform:scale(.985)}.zft .tbtn b{font-size:76px;line-height:1;font-weight:700;font-variant-numeric:tabular-nums}.zft .tbtn small{color:var(--muted);font-size:13px}
.zft .tbtn svg.rg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.zft .dz{font-family:Amiri,serif;font-size:24px;text-align:center;line-height:1.7;min-height:44px;margin:4px 0}
.zfflash{animation:zfflash .45s ease-out}.zfflash2{animation:zfflash2 .9s ease-out}
@keyframes zfflash{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--z-clay) 80%,transparent),inset 0 0 0 200px color-mix(in srgb,var(--z-clay) 35%,transparent)}100%{box-shadow:0 0 0 26px transparent,inset 0 0 0 200px transparent}}
@keyframes zfflash2{0%,40%{box-shadow:0 0 0 0 color-mix(in srgb,#2f8a5b 80%,transparent),inset 0 0 0 200px color-mix(in srgb,#2f8a5b 45%,transparent)}100%{box-shadow:0 0 0 40px transparent,inset 0 0 0 200px transparent}}
.zft .wl{display:flex;gap:6px;align-items:center;justify-content:center;font-size:12.5px;color:var(--muted);margin-top:4px}.zft .wl svg{width:15px;height:15px}
.zfdark{position:fixed;inset:0;z-index:94;background:#000;color:#2a2a2a;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;touch-action:manipulation}
.zfdark b{font-size:96px;font-weight:700;font-variant-numeric:tabular-nums;color:#3a3a3a}.zfdark small{color:#333;font-size:14px;margin-top:8px}.zfdark .zx{position:absolute;top:calc(16px + env(safe-area-inset-top));left:16px;background:#111;color:#555;border:1px solid #222;border-radius:14px;font:inherit;padding:10px 16px}
.zfdark.f1{animation:zfd1 .5s}.zfdark.f2{animation:zfd2 .9s}@keyframes zfd1{0%{background:#3a2516}100%{background:#000}}@keyframes zfd2{0%,40%{background:#123322}100%{background:#000}}`;
function ring(n,t){if(!t)return'';const p=Math.min(1,(n%t||(n?t:0))/t),C=2*Math.PI*47;return`<svg class="rg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="none" stroke="var(--line)" stroke-width="2.4"/><circle cx="50" cy="50" r="47" fill="none" stroke="var(--accent)" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}"/></svg>`}
function hit(){T.count++;T.total=(T.total||0)+1;const d=cur(),t=day(),o=F.d[t]=F.d[t]||{};o.t=(o.t||0)+1;o.tx=o.tx||{};o.tx[d.t]=(o.tx[d.t]||0)+1;save();
 const n=T.count,big=n%100===0||(T.target&&n%T.target===0&&T.target>=99),mid=n%33===0||(T.target&&n%T.target===0);
 if(CAN_VIB){try{navigator.vibrate(big?[180,80,180]:mid?[110]:8)}catch(e){}}
 return big?2:mid?1:0}
function flash(el,lvl){if(!lvl||!el)return;const c=lvl===2?'zfflash2':'zfflash';el.classList.remove('zfflash','zfflash2');void el.offsetWidth;el.classList.add(c)}
function weekBars(){let h='';for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=day(d),v=(F.d[k]&&F.d[k].t)||0;h+=`<div><i style="height:${Math.min(56,Math.round(Math.sqrt(v)*3))+3}px"></i>${ar(v)}</div>`}return`<div class="zbars">${h}</div>`}
function render(){const d=cur(),t=day(),today=(F.d[t]&&F.d[t].t)||0;
 view.innerHTML=`${back('home','الرئيسية')}<h1 class="page">السبحة</h1><div class="zft">
 <div class="zchips" style="flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px">${list().map(x=>`<button class="zchip" data-k="${x.k}" style="flex:none;${x.k===d.k?'background:var(--ink);color:var(--bg)':''}">${esc(x.t)}</button>`).join('')}<button class="zchip" id="tadd" style="flex:none">${zi('plus')}ذكر خاص</button></div>
 <div class="dz">${esc(d.t)}</div>
 <button class="tbtn" id="ttap" aria-label="اضغط للعد">${ring(T.count,T.target)}<b id="tn">${ar(T.count)}</b><small>${T.target?'الهدف '+ar(T.target):'بلا حد'}</small></button>
 <div class="wl" id="twl"></div>
 <div class="zchips" style="justify-content:center"><button class="zchip" id="tdark">${zi('moon')}وضع الظلام</button><button class="zchip" id="treset">${zi('refresh')}تصفير</button>${X.cust.length&&d.c?`<button class="zchip" id="tdel" style="color:var(--z-clay)">${zi('trash')}حذف الذكر</button>`:''}</div>
 <section class="zcard"><div class="zset"><span class="grow"><b>الهدف</b><small>${CAN_VIB?'اهتزاز عند ٣٣ و١٠٠ وعند الهدف':'وميض عند ٣٣ و١٠٠ وعند الهدف'}</small></span><select id="ttg">${[0,33,99,100,1000].map(v=>`<option value="${v}" ${+T.target===v?'selected':''}>${v?ar(v):'بلا حد'}</option>`).join('')}</select></div>
 <div class="zstat"><div><b>${ar(today)}</b><small>اليوم</small></div><div><b>${ar(T.total||0)}</b><small>المجموع الكلي</small></div></div>${weekBars()}</section>
 <p class="znote">${IOS?'الآيفون لا يسمح بالاهتزاز من المتصفح، فسترى وميضًا بدلًا منه. ':''}العدّ يحتاج الشاشة مضاءة (المتصفح لا يستطيع العدّ والشاشة مطفأة ولا بأزرار الصوت)، لذلك نبقي الشاشة مضاءة، و«وضع الظلام» يعطيك شاشة سوداء خافتة توفر البطارية.</p></div>`;
 const tap=$('#ttap');tap.addEventListener('pointerdown',e=>{e.preventDefault();const lvl=hit();$('#tn').textContent=ar(T.count);const r=tap.querySelector('svg.rg');if(r)r.outerHTML=ring(T.count,T.target);flash(tap,lvl);if(lvl)updToday()});
 view.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{X.sel=b.dataset.k;if(b.dataset.k[0]==='p')T.i=+b.dataset.k.slice(1);T.count=0;save();render()});
 $('#ttg').onchange=e=>{T.target=+e.target.value;T.count=0;save();render()};$('#treset').onclick=()=>{T.count=0;save();render()};
 $('#tadd').onclick=()=>{const v=(prompt('اكتب الذكر الذي تريد عدّه')||'').trim().slice(0,120);if(!v)return;X.cust.push(v);X.sel='c'+(X.cust.length-1);T.count=0;save();render()};
 const del=$('#tdel');if(del)del.onclick=()=>{const i=+d.k.slice(1);X.cust.splice(i,1);X.sel=null;save();render()};
 $('#tdark').onclick=darkMode;wlUI()}
function updToday(){}
function wlUI(){const w=$('#twl');if(!w)return;w.innerHTML=wl&&wl.ok?`${zi('sun')}الشاشة تبقى مضاءة أثناء التسبيح`:navigator.wakeLock?'':`${zi('qmark')}جهازك لا يدعم إبقاء الشاشة مضاءة من المتصفح`}
function darkMode(){const d=cur();dark=document.createElement('div');dark.className='zfdark';dark.innerHTML=`<button class="zx">خروج</button><b>${ar(T.count)}</b><small>${esc(d.t)} · اضغط في أي مكان</small>`;document.body.appendChild(dark);
 dark.addEventListener('pointerdown',e=>{if(e.target.classList.contains('zx'))return;e.preventDefault();const lvl=hit();dark.querySelector('b').textContent=ar(T.count);if(lvl){dark.classList.remove('f1','f2');void dark.offsetWidth;dark.classList.add(lvl===2?'f2':'f1')}});
 dark.querySelector('.zx').onclick=()=>{dark.remove();dark=null;render()}}
function openOld(){if(!document.getElementById('zftcss')){const s=document.createElement('style');s.id='zftcss';s.textContent=css;document.head.appendChild(s)}
 try{wl&&wl.release()}catch(e){}wl=null;render();wake().then(w=>{wl=w;wlUI()});
 const off=()=>{if(location.hash.slice(1).split('/')[0]!=='tasbeeh'){try{wl&&wl.release()}catch(e){}wl=null;if(dark){dark.remove();dark=null}removeEventListener('hashchange',off)}};addEventListener('hashchange',off)}
/* v4.7.1: the new tasbih (6 styles, modes, challenges) lives on zad-content and is lazy-loaded; the v4.4 counter above stays as the offline fallback */
const ZTU='https://zad-content.sites.tab.bot/x/zt.js?v=5.5.0';let ztP=null;
const here=()=>location.hash.slice(1).split('/')[0]==='tasbeeh';
ZF.m.tasbeeh=()=>{if(window.ZTSB){try{return ZTSB.open()}catch(e){return openOld()}}
 view.innerHTML=`${back('home','الرئيسية')}<h1 class="page">السبحة</h1><p class="znote" style="text-align:center">جارٍ تجهيز السبحة…</p>`;
 if(!ztP)ztP=new Promise((res,rej)=>{const s=document.createElement('script');s.src=ZTU;s.async=true;s.onload=()=>window.ZTSB?res():rej();s.onerror=()=>{ztP=null;rej()};document.head.appendChild(s);setTimeout(()=>rej(),9000)});
 ztP.then(()=>{if(here())ZTSB.open()}).catch(()=>{if(here()&&!window.ZTSB)openOld()})};
})();
