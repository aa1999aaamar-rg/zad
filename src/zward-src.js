/* v5.5.4 — شاشة «ورد اليوم» بتصميم جديد: رأس واضح بنسبة الإنجاز، تنقّل مقسّم، نص أهدأ، ومشغّل مصغّر مثبّت فوق الشريط السفلي.
   يغلّف V.ward ولا يغيّر منطقه: الأزرار الأصلية (#prevd #nextd #today #hidebtn #donebtn) تبقى في الصفحة مخفية، وأزرارنا تضغطها. */
(function(){
"use strict";
if(typeof V==="undefined"||!V.ward)return;
const CSS=`
#view.zwrd>.row.between,#view.zwrd>.card.zw-old,#view.zwrd>.toolbar.zw-old{display:none!important}
#view.zwrd>.back{margin-bottom:2px}
.zw-hd{display:flex;align-items:center;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:16px 16px 15px;margin:4px 0 12px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.zw-t{flex:1;min-width:0}
.zw-eye{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12.5px;font-weight:700;color:var(--muted);line-height:1.5}
.zw-eye .zw-ok{background:color-mix(in srgb,#2e8b57 14%,transparent);color:#2e8b57;border-radius:999px;padding:1px 8px;font-size:11.5px}
.zw-ttl{font-size:23px;font-weight:800;line-height:1.35;margin:3px 0 3px;color:var(--ink);letter-spacing:0}
.zw-sub{font-size:13px;color:var(--muted);line-height:1.6}
.zw-sub b{font-weight:700;color:var(--ink);opacity:.85}
.zw-ring{position:relative;width:68px;height:68px;flex:none}
.zw-ring svg{width:68px;height:68px;transform:rotate(-90deg)}
.zw-ring circle{fill:none;stroke-width:6}
.zw-ring .tr{stroke:color-mix(in srgb,var(--ink) 9%,transparent)}
.zw-ring .pr{stroke:var(--gold);stroke-linecap:round;transition:stroke-dashoffset .6s ease}
.zw-ring .lb{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}
.zw-ring .lb b{font-size:16px;font-weight:800;color:var(--ink)}
.zw-ring .lb b.z0{font-size:14px;color:var(--gold)}
.zw-ring .lb small{font-size:10px;color:var(--muted);margin-top:2px}
.zw-ctl{display:flex;align-items:center;gap:10px;margin:0 0 12px}
.zw-seg{flex:1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:4px;border-radius:15px;background:color-mix(in srgb,var(--ink) 6%,transparent)}
.zw-seg button{direction:rtl;height:42px;border:0;border-radius:11px;background:transparent;color:var(--ink);font:inherit;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:3px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.zw-seg button svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;opacity:.7}
.zw-seg button.on{background:var(--card);box-shadow:0 1px 3px rgba(0,0,0,.12);color:var(--gold)}
.zw-seg button:disabled{opacity:.35;cursor:default}
.zw-eb{width:50px;height:50px;flex:none;border-radius:15px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:grid;place-items:center;cursor:pointer;-webkit-tap-highlight-color:transparent}
.zw-eb svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
.zw-eb[aria-pressed=true]{background:var(--gold);border-color:transparent;color:#fff}
#view.zwrd #mus.mushaf{border:1px solid color-mix(in srgb,var(--gold) 26%,var(--line));box-shadow:0 1px 3px rgba(0,0,0,.04);border-radius:20px;padding:20px 18px 14px}
html[data-theme=dark] #view.zwrd #mus.mushaf{border-color:color-mix(in srgb,var(--gold) 22%,transparent)}
#view.zwrd .qtext .ay{border-radius:6px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
#view.zwrd .qtext .ay.play{background:color-mix(in srgb,var(--gold) 9%,transparent)}
html[data-theme=dark] #view.zwrd .qtext .ay.play{background:color-mix(in srgb,var(--gold) 12%,transparent)}
#view.zwrd .qtext .an{color:var(--gold)}
#view.zwrd #wardbox>.pextra{display:none}
#view.zwrd #donebtn{margin-top:14px}
#view.zwrd #zb8plan.zw-moved{margin-top:12px}
.zw-sp{height:96px}
.zw-sb{position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:70;pointer-events:none}
body>.player.zwp{position:fixed;left:12px;right:12px;bottom:var(--zwp-b,calc(104px + env(safe-area-inset-bottom,0px)));z-index:40;max-width:540px;margin:0 auto;height:64px;box-sizing:border-box;display:flex;align-items:center;gap:10px;padding:8px 10px 8px 8px;border-radius:20px;background:rgba(255,255,255,.88);-webkit-backdrop-filter:saturate(1.6) blur(18px);backdrop-filter:saturate(1.6) blur(18px);border:1px solid rgba(20,25,45,.08);box-shadow:0 10px 28px rgba(20,25,45,.16);color:var(--ink);transition:bottom .28s cubic-bezier(.2,.8,.2,1),opacity .2s;overflow:hidden}
html[data-theme=dark] body>.player.zwp{background:rgba(26,30,44,.92);border-color:rgba(255,255,255,.08);box-shadow:0 10px 30px rgba(0,0,0,.5);color:#f1efe9}
body>.player.zwp.low{bottom:calc(12px + env(safe-area-inset-bottom,0px))}
body>.player.zwp .pb{width:46px;height:46px;border-radius:50%;border:0;background:var(--gold);color:#fff;display:grid;place-items:center;flex:none;box-shadow:0 4px 12px color-mix(in srgb,var(--gold) 35%,transparent)}
body>.player.zwp .pb svg{width:20px;height:20px;fill:currentColor;stroke:none}
.zwp-i{flex:1;min-width:0;line-height:1.35}
body>.player.zwp .apinfo{display:block;font-size:14px;font-weight:800;opacity:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zwp-r{display:block;font-size:12px;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zwp-set{width:42px;height:42px;flex:none;border:0;border-radius:13px;background:color-mix(in srgb,currentColor 8%,transparent);color:inherit;display:grid;place-items:center;cursor:pointer}
.zwp-set svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round}
.zwp-pr{position:absolute;left:18px;right:18px;bottom:3px;height:3px;border-radius:2px;background:color-mix(in srgb,currentColor 10%,transparent);overflow:hidden}
.zwp-pr i{position:absolute;top:0;bottom:0;right:0;width:0;background:var(--gold);border-radius:2px;transition:width .3s}
.zwp-sh{position:fixed;inset:0;z-index:90;display:none}
.zwp-sh.on{display:block}
.zwp-sh .bd{position:absolute;inset:0;background:rgba(10,12,20,.38)}
.zwp-sh .pn{position:absolute;left:0;right:0;bottom:0;max-width:560px;margin:0 auto;background:var(--card);color:var(--ink);border-radius:22px 22px 0 0;padding:8px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 30px rgba(0,0,0,.18);animation:zwpup .22s ease}
@keyframes zwpup{from{transform:translateY(30px);opacity:.4}to{transform:none;opacity:1}}
.zwp-sh .hdl{width:40px;height:5px;border-radius:3px;background:var(--line);margin:4px auto 10px}
.zwp-sh h3{display:flex;align-items:center;justify-content:space-between;font-size:16px;margin:0 0 4px}
.zwp-sh h3 button{border:0;background:color-mix(in srgb,var(--ink) 7%,transparent);color:var(--ink);width:34px;height:34px;border-radius:50%;font-size:16px;cursor:pointer}
.zwp-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:54px;border-bottom:1px solid var(--line);font-size:14px;font-weight:700}
.zwp-row:last-child{border-bottom:0}
.zwp-row select{width:auto;max-width:60%;min-height:40px;padding:6px 10px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-size:14px}
.zwp-row label{display:contents}
.zwp-row .ab{min-height:40px}
.zwp-reps{display:flex;gap:6px}
.zwp-reps button{min-width:44px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;font-weight:800;cursor:pointer}
.zwp-reps button.on{background:var(--gold);border-color:transparent;color:#fff}
.zwp-row .zwp-hide{display:none}
@media (prefers-reduced-motion:reduce){.zwp-sh .pn{animation:none}body>.player.zwp{transition:none}}
`;
const st=document.createElement("style");st.id="zwardcss";st.textContent=CSS;document.head.appendChild(st);
const tt=s=>{try{return typeof t==="function"?t(s):s}catch(e){return s}};
const N=x=>{try{return num(x)}catch(e){return String(x)}};
const IC={prev:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
 eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 eyeoff:'<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
 set:'<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'};
function pagesText(s){const ps=dayPages(s);let p;if(ps.length===1)p="صفحة "+N(ps[0]);else{const c=ps.every((v,i)=>!i||v===ps[i-1]+1);p="الصفحات "+(c?N(ps[0])+"–"+N(ps[ps.length-1]):ps.map(N).join("، "))}
 const w=Math.round(10*s.w)/10;let q;if(Math.abs(w-.5)<.06)q="نصف صفحة";else if(Math.abs(w-1)<.11)q="صفحة كاملة";else if(Math.abs(w-1.5)<.06)q="صفحة ونصف";else if(Math.abs(w-2)<.06)q="صفحتان";else q="نحو "+N(w)+" صفحة";return[p,q]}
function rmPlayer(){document.querySelectorAll("body>.player.zwp,.zwp-sh,.zw-sb").forEach(e=>e.remove())}
function navB(){try{const tb=document.getElementById("tabs");if(!tb||tb.classList.contains("hid"))return null;const els=[tb.querySelector(".in"),tb.querySelector("a.ctr .b"),tb];let top=1e9;els.forEach(e=>{if(e){const r=e.getBoundingClientRect();if(r.height>0)top=Math.min(top,r.top)}});if(top>=1e9||top<innerHeight*.5)return null;return Math.round(innerHeight-top+10)}catch(e){return null}}
function place(){const p=document.querySelector("body>.player.zwp");if(!p)return;const tb=document.getElementById("tabs");const hid=!tb||tb.classList.contains("hid")||getComputedStyle(tb).display==="none";p.classList.toggle("low",hid);const b=navB();if(b)p.style.setProperty("--zwp-b",b+"px")}
let tabsMO=null;
function watchTabs(){const tb=document.getElementById("tabs");if(!tb||tabsMO)return;tabsMO=new MutationObserver(()=>place());tabsMO.observe(tb,{attributes:true,attributeFilter:["class","style"]})}
function info2(){const r=document.querySelector(".zwp-r");if(!r)return;let n="";try{n=REC().n}catch(e){}const rp=+(S.settings.rep||1);const idle=!AP.el.src||!AP.q.length;r.textContent=idle?("اضغط للاستماع"+(rp>1?" · تكرار كل آية ×"+N(rp):"")):("الشيخ "+n+(AP.el.playbackRate&&AP.el.playbackRate!==1?" · السرعة ×"+N(AP.el.playbackRate):""));const pr=document.querySelector(".zwp-pr i");if(pr){const q=AP.q.length;pr.style.width=q&&AP.el.src?Math.round((AP.i+1)/q*100)+"%":"0%"}}
function sheet(on){const s=document.querySelector(".zwp-sh");if(!s)return;s.classList.toggle("on",on);if(on){s.querySelectorAll(".zwp-reps button").forEach(b=>b.classList.toggle("on",+b.dataset.v===+S.settings.rep))}}
function buildPlayer(box){const pl=box.querySelector(".player");if(!pl)return;rmPlayer();
 const sb=document.createElement("div");sb.className="zw-sb";document.body.appendChild(sb);
 const rec=pl.querySelector(".recsel"),rep=pl.querySelector("select.rep"),info=pl.querySelector(".apinfo"),pb=pl.querySelector(".pb");
 const px=box.querySelector(".pextra");
 const sh=document.createElement("div");sh.className="zwp-sh";sh.setAttribute("role","dialog");sh.setAttribute("aria-label","إعدادات التلاوة");
 sh.innerHTML=`<div class="bd"></div><div class="pn"><div class="hdl"></div><h3>إعدادات التلاوة<button type="button" class="x" aria-label="إغلاق">✕</button></h3>
  <div class="zwp-row" data-r="rec"><span>${tt("القارئ")}</span></div>
  <div class="zwp-row" data-r="rep"><span>تكرار كل آية</span><div class="zwp-reps">${[1,3,5,10].map(v=>`<button type="button" data-v="${v}">×${N(v)}</button>`).join("")}</div></div>
  ${px?`<div class="zwp-row" data-r="spd"><span>سرعة التلاوة</span></div><div class="zwp-row" data-r="slp"><span>إيقاف تلقائي بعد</span></div><div class="zwp-row" data-r="ab"><span>تكرار مقطع من آية إلى آية</span></div>`:""}</div>`;
 document.body.appendChild(sh);
 if(rec)sh.querySelector('[data-r="rec"]').appendChild(rec);
 if(rep){rep.classList.add("zwp-hide");sh.querySelector('[data-r="rep"]').appendChild(rep)}
 sh.querySelectorAll(".zwp-reps button").forEach(b=>b.onclick=()=>{if(rep){rep.value=b.dataset.v;rep.dispatchEvent(new Event("change"))}else{S.settings.rep=+b.dataset.v;AP.rep=+b.dataset.v;save()}sheet(true);info2()});
 if(px){const sp=px.querySelector(".spd"),sl=px.querySelector(".slp"),ab=px.querySelector(".ab");sp&&sh.querySelector('[data-r="spd"]').appendChild(sp);sl&&sh.querySelector('[data-r="slp"]').appendChild(sl);ab&&sh.querySelector('[data-r="ab"]').appendChild(ab)}
 sh.querySelector(".bd").onclick=()=>sheet(false);sh.querySelector(".x").onclick=()=>sheet(false);
 rec&&rec.addEventListener("change",()=>setTimeout(info2,0));
 // إعادة بناء المشغّل المصغّر من العناصر نفسها (بلا نسخ) حتى تبقى كل الوظائف كما هي
 [...pl.children].forEach(c=>{if(c!==pb)c.remove()});
 const i=document.createElement("div");i.className="zwp-i";if(info)i.appendChild(info);const r=document.createElement("small");r.className="zwp-r";i.appendChild(r);pl.appendChild(i);
 const set=document.createElement("button");set.type="button";set.className="zwp-set";set.setAttribute("aria-label","إعدادات التلاوة: القارئ والتكرار");set.innerHTML=IC.set;set.onclick=()=>sheet(true);pl.appendChild(set);
 const pr=document.createElement("div");pr.className="zwp-pr";pr.innerHTML="<i></i>";pl.appendChild(pr);
 pl.classList.add("zwp");pl.setAttribute("role","region");pl.setAttribute("aria-label","مشغّل التلاوة");
 document.body.appendChild(pl);
 // نقرات الآيات داخل #wardbox تعمل كما هي (المستمع على الصندوق نفسه)
 info2();watchTabs();place();setTimeout(place,350);
}
["play","pause","loadstart","ended"].forEach(ev=>AP.el.addEventListener(ev,()=>setTimeout(info2,0)));
function header(){const a=planReady();if(!a)return;const e=S.cursor,s=a.days[e];if(!s)return;const done=!!S.done[e];const pr0=doneCount()/a.days.length*100,pc=Math.round(pr0),pcT=(pr0>0&&pr0<10?N(Math.round(pr0*10)/10):N(pc))+"٪";let stk=0;try{stk=streak()}catch(x){}
 let dt="";try{const d=parseISO(s.date);dt=fmtW(d)+" "+fmtG(d,{day:"numeric",month:"long"})}catch(x){}
 const [pg,q]=pagesText(s);const C=2*Math.PI*28;
 const h=document.createElement("section");h.className="zw-hd";h.setAttribute("aria-label",tt("ورد اليوم"));
 h.innerHTML=`<div class="zw-t"><div class="zw-eye"><span>${tt("ورد اليوم")} · ${N(e+1)} من ${N(a.days.length)}</span>${done?'<span class="zw-ok">✓ محفوظ</span>':""}</div>
 <div class="zw-ttl" role="heading" aria-level="1">${dayLabel(s)}</div>
 <div class="zw-sub">${dt?dt+" · ":""}<b>${pg}</b> · ${q}${stk>0?` · 🔥 أيام متتالية: ${N(stk)}`:""}</div></div>
 <div class="zw-ring" role="img" aria-label="أُنجز ${pcT} من الخطة"><svg viewBox="0 0 68 68"><circle class="tr" cx="34" cy="34" r="28"/><circle class="pr" cx="34" cy="34" r="28" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C*(1-Math.max(pr0,pr0>0?2:0)/100)).toFixed(2)}" ${pr0?"":'style="opacity:0"'}/></svg><div class="lb">${doneCount()?`<b>${pcT}</b><small>من الخطة</small>`:`<b class="z0">ابدأ</b><small>${N(0)}٪ من الخطة</small>`}</div></div>`;
 return{h,a,e}}
function controls(box,a,e){const c=document.createElement("div");c.className="zw-ctl";let today=e;try{today=firstUndone()}catch(x){}
 const hidden=box.classList.contains("hide");
 c.innerHTML=`<div class="zw-seg" role="group" aria-label="التنقل بين الأوراد"><button type="button" data-a="prevd" ${e<=0?"disabled":""}>${IC.next}<span>${tt("السابق")}</span></button><button type="button" data-a="today" class="${e===today?"on":""}" ${e===today?'aria-current="true"':""}>اليوم</button><button type="button" data-a="nextd" ${e>=a.days.length-1?"disabled":""}><span>${tt("التالي")}</span>${IC.prev}</button></div>
 <button type="button" class="zw-eb" aria-pressed="${hidden}" aria-label="${hidden?tt("إظهار النص"):tt("إخفاء النص")} (وضع الحفظ)" title="${tt("إخفاء النص")}">${hidden?IC.eyeoff:IC.eye}</button>`;
 c.querySelectorAll(".zw-seg button").forEach(b=>b.onclick=()=>{const o=document.getElementById(b.dataset.a);o&&o.click()});
 const eb=c.querySelector(".zw-eb");eb.onclick=()=>{const o=document.getElementById("hidebtn");if(!o)return;o.click();const on=box.classList.contains("hide");eb.setAttribute("aria-pressed",on);eb.innerHTML=on?IC.eyeoff:IC.eye;eb.setAttribute("aria-label",(on?tt("إظهار النص"):tt("إخفاء النص"))+" (وضع الحفظ)");try{toast(on?"وضع الحفظ: النص مخفي، المس الآية لتظهر":"ظهر النص")}catch(x){}};
 return c}
function movePromo(){const v=document.getElementById("view");if(!v||!v.classList.contains("zwrd"))return;const z=document.getElementById("zb8plan");const sp=v.querySelector(".zw-sp");if(z&&!z.classList.contains("zw-moved")){z.classList.add("zw-moved");sp?v.insertBefore(z,sp):v.appendChild(z)}}
function decorate(){const v=document.getElementById("view"),box=document.getElementById("wardbox");if(!v||!box||v.querySelector(".zw-hd"))return;
 const r=header();if(!r)return;v.classList.add("zwrd");
 const kids=[...v.children];const row=kids.find(k=>k.classList.contains("row")&&k.classList.contains("between"));const card=kids.find(k=>k.classList.contains("card")&&k.querySelector(".bar"));const tb=kids.find(k=>k.classList.contains("toolbar"));
 card&&card.classList.add("zw-old");
 if(tb){const own=["hidebtn","prevd","nextd","today"];const extra=[...tb.children].filter(x=>!own.includes(x.id));if(!extra.length)tb.classList.add("zw-old");else own.forEach(id=>{const b=document.getElementById(id);b&&(b.style.display="none")})}
 const anchor=row||card||box;anchor.parentNode.insertBefore(r.h,card?card.nextSibling:anchor.nextSibling);
 r.h.after(controls(box,r.a,r.e));
 const sp=document.createElement("div");sp.className="zw-sp";v.appendChild(sp);
 movePromo();buildPlayer(box)}
const _w=V.ward;
V.ward=async function(){rmPlayer();const res=await _w.apply(this,arguments);try{decorate()}catch(e){console.warn("zward",e)}return res};
new MutationObserver(()=>{try{movePromo()}catch(e){}}).observe(document.getElementById("view")||document.body,{childList:true});
window.addEventListener("hashchange",()=>{const r=(location.hash.slice(1)||"").split("/")[0];if(r!=="ward"){rmPlayer();const v=document.getElementById("view");v&&v.classList.remove("zwrd")}});
window.addEventListener("resize",()=>requestAnimationFrame(place));
document.addEventListener("keydown",e=>{if(e.key==="Escape")sheet(false)});
window.ZWARD={decorate,place,sheet};
if((location.hash.slice(1)||"").split("/")[0]==="ward"&&document.getElementById("wardbox"))setTimeout(()=>{try{decorate()}catch(e){}},0);
})();

/* v5.5.5 — مصحف «ورد اليوم» هو نفسه مصحف قسم القرآن (صفحات مصحف المدينة بخطها وإطارها وعلامات الآيات، أو المصحف الذي اختاره المستخدم)،
   مع إخفاء آية واحدة بلمسها (يُحفظ لكل يوم على الجهاز) و«إظهار الكل». يغلّف V.ward بعد تصميم 5.5.4 ولا يمسّ منطقه. */
(function(){
"use strict";
if(typeof V==="undefined"||!V.ward)return;
const CSS=`
#view.zwrd #mus.zw-mm{border:0!important;box-shadow:none!important;background:none!important;padding:0!important;margin:0}
.zw-mp{display:flex;flex-direction:column;gap:12px;direction:rtl}
.zw-mp[data-paper=white]{--mpbg:#ffffff;--mpink:#111}
.zw-mp[data-paper=cream]{--mpbg:#fdf6e3;--mpink:#1a1a1a}
.zw-mp[data-paper=sepia]{--mpbg:#f1e4c3;--mpink:#3b2a1a}
.zw-mp[data-paper=dark]{--mpbg:#151824;--mpink:#f3ecd9}
.zw-mp[data-paper=black]{--mpbg:#000;--mpink:#ece4cf}
.zw-mp .mpage{min-height:0;border-radius:14px;background:var(--mpbg);color:var(--mpink);border:0;padding:9px 4px 6px;box-shadow:0 1px 3px rgba(0,0,0,.06),inset 0 0 0 3px var(--mpbg),inset 0 0 0 4.5px color-mix(in srgb,var(--gold) 75%,transparent),inset 0 0 0 6.5px var(--mpbg),inset 0 0 0 7px color-mix(in srgb,var(--accent) 40%,transparent);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.zw-mp.noframe .mpage{box-shadow:0 1px 3px rgba(0,0,0,.06)}
.zw-mp .mtop{margin:3px 9px 0;font-size:11px;border-bottom:0;color:color-mix(in srgb,var(--mpink) 70%,var(--accent))}
.zw-mp .mlines{padding:2px 6px}
.zw-mp .mpno{margin:2px 0 0;font-size:11px}
.zw-mp .mph{height:420px;border-radius:10px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--gold) 10%,transparent),transparent);background-size:200% 100%;animation:zwsh 1.2s linear infinite}
@keyframes zwsh{to{background-position:-200% 0}}
.zw-mp .mw.zw-out{opacity:.24;pointer-events:none}
.zw-mp .mw.play{background:color-mix(in srgb,#ffe066 55%,transparent)}
.zw-mp[data-paper=dark] .mw.play,.zw-mp[data-paper=black] .mw.play,html[data-theme=dark] .zw-mp .mw.play{background:color-mix(in srgb,#d4a72c 45%,transparent)}
.zw-mp .mw.zw-sel{background:color-mix(in srgb,var(--accent-2) 25%,transparent)}
#wardbox .mw.zw-h,#wardbox .ay.zw-h{color:transparent!important;-webkit-text-fill-color:transparent;background:color-mix(in srgb,var(--gold) 20%,transparent)!important;border-radius:7px;filter:none!important;opacity:1!important;text-shadow:none}
#wardbox .mw.zw-h.me{color:inherit!important;-webkit-text-fill-color:currentColor;background:none!important}
#wardbox .ay.zw-h .an{color:var(--gold)!important;-webkit-text-fill-color:var(--gold)}
#wardbox .ay.zw-h *{color:transparent!important}
#wardbox .ay.zw-h .an,#wardbox .ay.zw-h .an *{color:var(--gold)!important}
#wardbox .zw-h.play{background:color-mix(in srgb,var(--gold) 42%,transparent)!important}
.zw-hrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-4px 0 12px;padding:8px 12px 8px 8px;border-radius:14px;background:color-mix(in srgb,var(--gold) 10%,transparent);font-size:13px;font-weight:700;color:var(--ink)}
.zw-hrow button{border:0;border-radius:10px;background:var(--card);color:var(--accent);font:inherit;font-size:13px;font-weight:800;padding:7px 12px;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.06)}
.zw-as .zw-asT{font-size:16px;font-weight:800;margin:0 0 2px}
.zw-as .zw-asS{font-size:12.5px;color:var(--muted);margin:0 0 12px}
.zw-as .zw-asL{display:flex;flex-direction:column;gap:8px}
.zw-as .zw-asL button{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:10px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);font:inherit;font-size:15px;font-weight:700;text-align:right;cursor:pointer}
.zw-as .zw-asL button svg{width:22px;height:22px;flex:none;stroke:var(--accent);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.zw-as .zw-asL button.pri{background:var(--accent);border-color:var(--accent);color:#fff}
.zw-as .zw-asL button.pri svg{stroke:#fff}
`;
const st=document.createElement("style");st.id="zward555css";st.textContent=CSS;document.head.appendChild(st);
const IC={off:'<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.8-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',on:'<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12-7.5z"/></svg>',book:'<svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>'};
const HK="zad.zwhid";
let cur=null; // {dk, keys:[], set:Set}
function loadH(){try{return JSON.parse(localStorage.getItem(HK)||"{}")||{}}catch(e){return{}}}
function getH(dk){const o=loadH();return new Set(Array.isArray(o[dk])?o[dk]:[])}
function putH(dk,set){const o=loadH();if(set.size)o[dk]=[...set];else delete o[dk];const ks=Object.keys(o);if(ks.length>60)ks.slice(0,ks.length-60).forEach(k=>delete o[k]);try{localStorage.setItem(HK,JSON.stringify(o))}catch(e){}}
function edition(){return(S.settings&&S.settings.edition)||"madinah"}
function lbl(k){const[a,b]=k.split(":").map(Number);let n="";try{n=CH(a)[1]}catch(e){}return`سورة ${n} · الآية ${AR(b)}`}
function els(k){return document.querySelectorAll(`#wardbox .mw[data-k="${k}"],#wardbox .qtext .ay[data-k="${k}"]`)}
function paint(){if(!cur)return;document.querySelectorAll("#wardbox .zw-h").forEach(e=>e.classList.remove("zw-h"));cur.set.forEach(k=>els(k).forEach(e=>e.classList.add("zw-h")));hrow()}
function hrow(){const v=document.getElementById("view");if(!v||!cur)return;let r=v.querySelector(".zw-hrow");const n=cur.set.size;if(!n){r&&r.remove();return}
 if(!r){r=document.createElement("div");r.className="zw-hrow";const c=v.querySelector(".zw-ctl");if(c)c.after(r);else{const b=document.getElementById("wardbox");b&&b.before(r)}}
 r.innerHTML=`<span>${n===1?"آية مخفية واحدة":n===2?"آيتان مخفيتان":AR(n)+" "+(n<=10?"آيات مخفية":"آية مخفية")}</span><button type="button" class="zw-sall">إظهار الكل</button>`;
 r.querySelector(".zw-sall").onclick=showAll}
function setHidden(k,on){if(!cur)return;on?cur.set.add(k):cur.set.delete(k);putH(cur.dk,cur.set);paint()}
function showAll(){if(!cur)return;cur.set.clear();putH(cur.dk,cur.set);paint();try{toast("ظهرت كل الآيات")}catch(e){}}
function closeS(){if(typeof closeSheet==="function")closeSheet();else{const t=document.getElementById("sheet");t&&(t.hidden=!0)}document.querySelectorAll(".zw-sel").forEach(e=>e.classList.remove("zw-sel"))}
function playFrom(k){if(!cur)return;const i=cur.keys.indexOf(k);if(i<0)return;try{AP.loopAll=false;AP.rep=+S.settings.rep||1;apLoad(cur.keys,i,AP.rep)}catch(e){}}
function sheetFor(k){
 document.querySelectorAll(".zw-sel").forEach(e=>e.classList.remove("zw-sel"));document.querySelectorAll(`#wardbox .mw[data-k="${k}"]`).forEach(e=>e.classList.add("zw-sel"));
 const hid=cur.set.has(k),n=cur.set.size;
 const html=`<div class="zw-as"><div class="zw-asT">${lbl(k)}</div><div class="zw-asS">من ورد اليوم</div><div class="zw-asL">
  <button type="button" class="pri" data-a="${hid?"show":"hide"}">${hid?IC.on:IC.off}${hid?"إظهار الآية":"إخفاء الآية"}</button>
  <button type="button" data-a="play">${IC.play}تشغيل من هنا</button>
  ${typeof ayahSheet==="function"?`<button type="button" data-a="taf">${IC.book}التفسير والمزيد</button>`:""}
  ${n&&!(n===1&&hid)?`<button type="button" data-a="all">${IC.on}إظهار الكل (${AR(n)})</button>`:""}
 </div></div>`;
 if(typeof openSheet!=="function"){setHidden(k,!hid);return}
 openSheet(html,root=>{(root||document).querySelectorAll(".zw-as [data-a]").forEach(b=>b.onclick=()=>{const a=b.dataset.a;closeS();
  if(a==="hide"){setHidden(k,true);try{toast("أُخفيت الآية — المسها لتظهر")}catch(e){}}
  else if(a==="show")setHidden(k,false);
  else if(a==="all")showAll();
  else if(a==="play")playFrom(k);
  else if(a==="taf")setTimeout(()=>ayahSheet(k,()=>playFrom(k)),60)})})}
function onTap(ev){const box=document.getElementById("wardbox");const el=ev.target.closest&&ev.target.closest(".mw[data-k],.qtext .ay[data-k]");if(!el||!box||!cur)return;const k=el.dataset.k;if(cur.keys.indexOf(k)<0)return;
 ev.stopPropagation();ev.preventDefault();
 if(cur.set.has(k)){setHidden(k,false);return}
 if(box.classList.contains("hide")&&!el.classList.contains("rev")){els(k).forEach(e=>e.classList.add("rev"));return}
 sheetFor(k)}
function fitAll(){if(typeof MR_fit!=="function")return;document.querySelectorAll(".zw-mp .mpage").forEach(p=>{try{MR_fit(p)}catch(e){}})}
async function build(){
 const a=planReady&&planReady();if(!a)return;const s=a.days[S.cursor];if(!s)return;const mus=document.getElementById("mus"),box=document.getElementById("wardbox");if(!mus||!box)return;
 const keys=[];s.u.forEach(u=>{for(let i=u.a1;i<=u.a2;i++)keys.push(`${u.s}:${i}`)});
 const dk=(s.date||"")+"|"+keys[0]+"-"+keys[keys.length-1];
 cur={dk,keys,set:getH(dk)};const inR=new Set(keys);
 if(!mus.__zw){mus.__zw=1;mus.addEventListener("click",onTap)}
 const eb=document.querySelector(".zw-eb");if(eb&&!eb.__zw){eb.__zw=1;eb.addEventListener("click",()=>document.querySelectorAll("#wardbox .mw.rev").forEach(e=>e.classList.remove("rev")))}
 if(edition()==="madinah"&&typeof MR_build==="function"&&mus.querySelector(".qtext,.ay")){
  const pages=dayPages(s);const wrap=document.createElement("div");wrap.className="zw-mp";wrap.dataset.paper=S.settings.paper||"cream";wrap.classList.toggle("noframe",S.settings.mframe===false);
  wrap.innerHTML=pages.map(p=>`<div class="mpage" data-p="${p}"><div class="mph"></div></div>`).join("");
  let res;try{res=await Promise.all(pages.map(p=>MR_build(p)))}catch(e){res=null}
  if(res&&mus.isConnected&&document.getElementById("mus")===mus){
   const old=[...mus.childNodes];mus.classList.remove("mushaf");mus.classList.add("zw-mm");mus.innerHTML="";mus.appendChild(wrap);
   res.forEach((r,i)=>{const pg=wrap.children[i];pg.innerHTML=r.html;pg.querySelectorAll(".mw[data-k]").forEach(w=>{if(!inR.has(w.dataset.k))w.classList.add("zw-out")})});
   requestAnimationFrame(()=>{fitAll();try{window.applyHL&&wrap.querySelectorAll(".mpage").forEach(p=>applyHL(p))}catch(e){}mark()});
   void old}
 }else if((edition()==="tajweed"||edition()==="imlaei")&&typeof applyEdition==="function"){try{await applyEdition(mus,dayPages(s))}catch(e){}}
 paint();
}
function mark(){try{const k=AP.q[AP.i];if(!k||!AP.el.src||AP.el.paused)return;document.querySelectorAll(`#wardbox .mw[data-k="${k}"]`).forEach(e=>e.classList.add("play"))}catch(e){}}
const _am=window.apMark;if(typeof _am==="function"){apMark=function(){_am.apply(this,arguments);try{const w=document.querySelector(".zw-mp");if(!w)return;const k=AP.q[AP.i];if(!k)return;const e=w.querySelector(`.mw[data-k="${k}"]`);if(!e)return;const r=e.getBoundingClientRect(),pl=document.querySelector("body>.player.zwp"),lim=pl?pl.getBoundingClientRect().top:innerHeight;if(r.top<70||r.bottom>lim-10)e.scrollIntoView({block:"center",behavior:"smooth"})}catch(x){}}}
window.addEventListener("resize",()=>{clearTimeout(window.__zwrz);window.__zwrz=setTimeout(fitAll,120)},{passive:true});
const _w=V.ward;V.ward=async function(){const r=await _w.apply(this,arguments);try{await build()}catch(e){console.warn("zward555",e)}return r};
window.ZWARD555={build,showAll,setHidden,sheetFor,get cur(){return cur}};
if((location.hash.slice(1)||"").split("/")[0]==="ward"&&document.getElementById("wardbox"))setTimeout(()=>{build().catch(()=>{})},0);
})();
