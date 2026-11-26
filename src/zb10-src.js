/* زاد v5.4 «مقاطع زاد» — TikTok-style clips on the Diwaniya identity. Lazy module on zad-content (/x/zb10.js), loaded by zs.js for
   #videos · #video/<id> · #vupload[/r/<id>] · #u/<handle>[/s/<series>] · #explore[/<q>] · #tag/<name> · #vstats · #vdrafts · #vnotif.
   API: /api/social/vx/* (srv/zv.js) + the v4.2 upload/stream/report routes under /api/videos/*. One <video> pool (3 elements recycled).
   Avatars are initials or geometric patterns — never pictures. No music features. Minified to content/site/zb10.js. */
(function(){'use strict';if(window.ZB10)return;
const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const es=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const tst=m=>{try{toast(m)}catch(e){}};const vb=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const sv=()=>{try{save()}catch(e){}};
const devId=()=>{try{return ZS.dev()}catch(e){return localStorage.getItem('zad.dev')||''}};
const api=(p,b)=>ZS.api(p,b);
const vapi=(p,b)=>fetch('/api/videos/'+p,{method:b?'POST':'GET',cache:'no-store',headers:b?{'Content-Type':'application/json','X-Zad-Dev':devId()}:{'X-Zad-Dev':devId()},body:b?JSON.stringify(b):undefined}).then(r=>r.json().catch(()=>({ok:false})));
const err=(r,d)=>(r&&r.msg)||(r&&r._s===429?'محاولات كثيرة، تمهّل قليلًا':d||'تعذّر الاتصال، حاول مرة أخرى');
const Z=S.zb10=Object.assign({snd:0,spd:1,st:{on:1,min:30},adh:{},seen:{}},S.zb10||{});if(!Z.st||typeof Z.st!=='object')Z.st={on:1,min:30};
const cnt=n=>{n=+n||0;return n>=1e6?ar((n/1e6).toFixed(1).replace(/\.0$/,''))+'م':n>=1e3?ar((n/1e3).toFixed(n<1e4?1:0).replace(/\.0$/,''))+'ألف':ar(n)};
const ago=t=>{const m=Math.max(1,Math.round((Date.now()-t)/6e4));return m<60?'قبل '+ar(m)+' د':m<1440?'قبل '+ar(Math.round(m/60))+' س':m<43200?'قبل '+ar(Math.round(m/1440))+' يوم':new Date(t).toLocaleDateString('ar-SA-u-nu-arab',{day:'numeric',month:'short'})};
const fmt=t=>{t=Math.max(0,Math.floor(t||0));return ar(Math.floor(t/60))+':'+ar(String(t%60).padStart(2,'0'))};
const SITE=window.ZAD_URL||location.origin+location.pathname.replace(/[^/]*$/,'');
const link=h=>SITE+'#'+h;
const posterU=it=>it.poster?'/api/videos/p/'+it.id+(it.sz?'?s='+it.sz:''):'';
const srcU=it=>'/api/videos/v/'+it.id+(it.sz?'?s='+it.sz:'');
const OFF='zadammar';
/* ---- icons (stroke, round) ---- */
const P={heart:'<path d="M12 20.3s-7.6-4.6-7.6-10.4A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.7c0 5.8-7.6 10.4-7.6 10.4z"/>',
chat:'<path d="M20 11.6c0 4.1-3.6 7.4-8 7.4a8.8 8.8 0 0 1-3.4-.7L4 19.6l1.3-3.7A7 7 0 0 1 4 11.6C4 7.5 7.6 4.2 12 4.2s8 3.3 8 7.4z"/>',
book:'<path d="M6.5 3.8h11v16.4l-5.5-3.6-5.5 3.6z"/>',share:'<path d="M13.6 5.2 20.5 11.8l-6.9 6.6v-3.9c-4.8 0-8 1.4-10.1 4.7.8-5 3.6-9.3 10.1-10z"/>',
eye:'<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',play:'<path d="M8 5.5v13l10.5-6.5z"/>',
plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
home:'<path d="M4 11 12 4.5 20 11v8.5h-5.2v-5.3H9.2v5.3H4z"/>',compass:'<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
bell:'<path d="M6.2 16.8V11a5.8 5.8 0 0 1 11.6 0v5.8l1.7 1.7H4.5zM10 20.3a2.3 2.3 0 0 0 4 0"/>',user:'<circle cx="12" cy="8.3" r="3.8"/><path d="M4.8 20c.8-3.7 3.6-5.6 7.2-5.6s6.4 1.9 7.2 5.6"/>',
more:'<path d="M5.5 12h.01M12 12h.01M18.5 12h.01" stroke-width="3.4"/>',send:'<path d="M20.5 3.5 10.2 13.8M20.5 3.5l-6.3 17-4-6.7-6.7-4z"/>',
flag:'<path d="M5.5 21V4.5h11l-2.3 4.3 2.3 4.2h-11"/>',pin:'<path d="M9 4h6l-1 5 3 3v2H7v-2l3-3zM12 14v6"/>',trash:'<path d="M5 7h14M10 7V4.8h4V7M6.5 7l.9 12.5h9.2l.9-12.5"/>',
copy:'<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V5.8a1.3 1.3 0 0 0-1.3-1.3H5.8a1.3 1.3 0 0 0-1.3 1.3v8.4a1.3 1.3 0 0 0 1.3 1.3h2.7"/>',
x:'<path d="m6 6 12 12M18 6 6 18"/>',check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',vol:'<path d="M4 9.6v4.8h3.4l4.6 4V5.6l-4.6 4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/>',
mute:'<path d="M4 9.6v4.8h3.4l4.6 4V5.6l-4.6 4z"/><path d="m16 9.6 4.8 4.8M20.8 9.6 16 14.4"/>',speed:'<path d="M12 20a8 8 0 1 1 8-8"/><path d="m12 12 4-4"/><path d="M20 16v4h-4"/>',
pip:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><rect x="11.5" y="11.5" width="6.5" height="5" rx="1"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
dl:'<path d="M12 4v10.5M7.6 10.3 12 14.7l4.4-4.4M5 19.5h14"/>',reply:'<path d="M10 8.5 5 13l5 4.5"/><path d="M5 13h9a5 5 0 0 1 5 5v1"/>',
qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"/>',chart:'<path d="M4.5 19.5h15M7 16v-5M11 16V7M15 16v-7M19 16v-3"/>',
edit:'<path d="M4.5 19.5h4l10-10-4-4-10 10z"/><path d="m13 7 4 4"/>',text:'<path d="M5 6.5V5h14v1.5M12 5v14M9 19h6"/>',scissors:'<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.5 8.5 20 18M8.5 15.5 20 6"/>',
filter:'<circle cx="9" cy="10" r="5"/><circle cx="15" cy="10" r="5"/><circle cx="12" cy="15" r="5"/>',image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="m3.5 16 5-5 4.5 4.5 2.5-2.5 5 5"/>',
star:'<path d="M12 3.5l2.2 5.4 5.8.4-4.5 3.7 1.4 5.6L12 15.6l-4.9 3 1.4-5.6L4 9.3l5.8-.4z"/>',grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
lock:'<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',list:'<path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01" />',
noint:'<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',block:'<circle cx="12" cy="12" r="8.5"/><path d="M6 18 18 6"/>',cal:'<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
draft:'<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 13h6M9 16.5h4"/>',later:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12h4"/>',mosque:'<path d="M4 20h16M6 20v-7h12v7M12 4c2.5 1.6 4 3.6 4 6H8c0-2.4 1.5-4.4 4-6zM12 2.5V4M10 20v-3.5a2 2 0 0 1 4 0V20"/>'};
const ic=(k,c)=>`<svg class="zx-i${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]||''}</svg>`;
const VER='<svg class="zx-ver" viewBox="0 0 24 24" aria-label="حساب موثّق"><path fill="#1d9bf0" d="M12 2.2l2.4 1.8 3-.2.9 2.9 2.5 1.7-.9 2.9.9 2.9-2.5 1.7-.9 2.9-3-.2L12 21.8l-2.4-1.8-3 .2-.9-2.9-2.5-1.7.9-2.9-.9-2.9 2.5-1.7.9-2.9 3 .2z"/><path d="m8.3 12.2 2.5 2.5 5-5.1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
/* ---- avatars: initials or one of 8 geometric patterns (no pictures) ---- */
const PAL=[['#34457a','#c0693f'],['#1d2545','#d4a24c'],['#2f6f62','#e9d8a6'],['#7a3343','#f2c14e'],['#5b4b8a','#c9b6f2'],['#8a6a2f','#f6f4ef'],['#2d5f86','#9fd3c7'],['#6b4f3a','#e0b48a']];
const hsh=s=>{let h=0;for(const ch of String(s||''))h=(h*31+ch.charCodeAt(0))>>>0;return h};
const PATS=['','<path d="M20 4 24.7 15.3 36 20 24.7 24.7 20 36 15.3 24.7 4 20 15.3 15.3z" fill="B"/><rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" fill="none" stroke="B" stroke-width="1.6"/>',
'<path d="M10 4h20l10 16-10 16H10L0 20z" fill="none" stroke="B" stroke-width="2"/><path d="M15 12h10l5 8-5 8H15l-5-8z" fill="B"/>',
'<path d="M20 2 38 20 20 38 2 20z" fill="none" stroke="B" stroke-width="2"/><path d="M20 9 31 20 20 31 9 20z" fill="none" stroke="B" stroke-width="2"/><path d="M20 15 25 20 20 25 15 20z" fill="B"/>',
'<g fill="none" stroke="B" stroke-width="1.6"><circle cx="20" cy="12" r="8"/><circle cx="20" cy="28" r="8"/><circle cx="12" cy="20" r="8"/><circle cx="28" cy="20" r="8"/></g><circle cx="20" cy="20" r="3.5" fill="B"/>',
'<g stroke="B" stroke-width="3.2"><path d="M-4 12 12-4M-4 28 28-4M4 44 44 4M20 44 44 20M36 44 44 36"/></g>',
'<g fill="none" stroke="B" stroke-width="2.6" stroke-linejoin="round"><path d="M4 12l8-6 8 6 8-6 8 6M4 22l8-6 8 6 8-6 8 6M4 32l8-6 8 6 8-6 8 6"/></g>',
'<g fill="B"><circle cx="8" cy="8" r="2.6"/><circle cx="20" cy="8" r="2.6"/><circle cx="32" cy="8" r="2.6"/><circle cx="14" cy="20" r="2.6"/><circle cx="26" cy="20" r="2.6"/><circle cx="8" cy="32" r="2.6"/><circle cx="20" cy="32" r="2.6"/><circle cx="32" cy="32" r="2.6"/></g>',
'<path d="M8 36V18a12 12 0 0 1 24 0v18" fill="none" stroke="B" stroke-width="2.4"/><path d="M14 36V20a6 6 0 0 1 12 0v16z" fill="B"/>'];
function av(u,sz,cls){sz=sz||44;u=u||{};const off=u.id===OFF;const pc=off?['#0f4c4a','#d4a24c']:PAL[hsh(u.id||u.name)%PAL.length];const pat=off?0:(+u.pat||0)%PATS.length;
 const ch=es([...String(u.name||'؟').trim()][0]||'؟');
 const inner=pat?`<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true"><rect width="40" height="40" fill="${pc[0]}"/>${PATS[pat].replace(/B/g,pc[1])}</svg>`:`<b style="font-size:${Math.round(sz*.44)}px;color:${off?'#d4a24c':'#fff'}">${ch}</b>`;
 return`<span class="zx-av${off?' off':''}${cls?' '+cls:''}" style="width:${sz}px;height:${sz}px;background:${pc[0]}" aria-hidden="true">${inner}</span>`}
const uname=(u,ver)=>`<span class="zx-un">${es(u.name||'مستخدم')}${u.ver?VER:''}</span>`;
const handle=u=>u&&u.h?'@'+es(u.h):'';
/* caption with tappable #hashtags and @mentions */
function capHTML(s){return es(s).replace(/#([\p{L}\p{N}_]{2,30})/gu,(m,t)=>`<a class="zx-tag" href="#tag/${encodeURIComponent(t)}">#${t}</a>`).replace(/@([a-z][a-z0-9_.]{2,19})/gi,(m,h)=>`<a class="zx-men" href="#u/${h.toLowerCase()}">@${h}</a>`)}

const CSS=`
.zxr{position:fixed;inset:0;z-index:9990;background:#000;color:#fff;direction:rtl;font-family:inherit;overscroll-behavior:contain;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;--zxnav:calc(54px + env(safe-area-inset-bottom));--gold:#d4a24c;--acc:#fe2c55}
.zxr *{box-sizing:border-box}.zxr [hidden]{display:none!important}.zxr :where(button){font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}.zxr :where(a){color:inherit;text-decoration:none}
.zx-i{width:24px;height:24px;display:block;flex:none}.zx-ver{width:15px;height:15px;display:inline-block;vertical-align:-2px;margin-inline-start:3px}
.zx-av{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;overflow:hidden;flex:none;line-height:1;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}.zx-av.off{box-shadow:0 0 0 2px var(--gold)}.zx-av b{font-weight:800}
.zx-pages{position:absolute;inset:0 0 var(--zxnav) 0;overflow:hidden}
.zx-page{position:absolute;inset:0;background:#0b0d14;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;animation:zxin .26s cubic-bezier(.2,.8,.2,1);padding-bottom:20px}
.zx-page.feedp{background:#000;overflow:hidden;padding:0}
@keyframes zxin{from{transform:translateX(-24%);opacity:.0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.zx-page{animation:none}}
.zx-nav{position:absolute;inset-inline:0;bottom:0;height:var(--zxnav);padding-bottom:env(safe-area-inset-bottom);display:flex;align-items:stretch;background:#000;border-top:1px solid rgba(255,255,255,.1);z-index:30}
.zx-nav>button,.zx-nav>a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:10.5px;color:rgba(255,255,255,.62);position:relative}
.zx-nav .on{color:#fff}.zx-nav .zx-i{width:23px;height:23px}
.zx-nav .zx-plus{flex:0 0 64px}.zx-plus span{width:46px;height:30px;border-radius:9px;background:linear-gradient(90deg,#25f4ee 0 4px,#fff 4px calc(100% - 4px),#c0693f calc(100% - 4px));display:flex;align-items:center;justify-content:center;color:#000}
.zx-plus span .zx-i{stroke-width:2.6;width:20px;height:20px}
.zx-dot{position:absolute;top:7px;inset-inline-end:calc(50% - 18px);min-width:16px;height:16px;border-radius:8px;background:var(--acc);font-size:10px;display:flex;align-items:center;justify-content:center;padding:0 4px;color:#fff;font-weight:700}
/* feed */
.zx-feed{position:absolute;inset:0;overflow-y:scroll;scroll-snap-type:y mandatory;overscroll-behavior:contain;scrollbar-width:none}.zx-feed::-webkit-scrollbar{display:none}
.zx-s{position:relative;height:100%;scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden;background:#000;contain:strict}
.zx-m{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.zx-m img.po,.zx-m video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}
.zx-s.fit .zx-m img.po,.zx-s.fit .zx-m video{object-fit:contain}
.zx-m video{opacity:0;transition:opacity .18s}.zx-m video.rd{opacity:1}
.zx-ov{position:absolute;inset:0;pointer-events:none;z-index:2}
.zx-ot{position:absolute;transform:translate(50%,-50%);max-width:84%;text-align:center;font-weight:800;line-height:1.5;text-shadow:0 2px 8px rgba(0,0,0,.55);white-space:pre-wrap;word-break:break-word}
.zx-ot.bg{background:rgba(0,0,0,.55);padding:4px 12px;border-radius:10px;text-shadow:none}
.zx-ot.f-a{font-family:Amiri,'Amiri Quran',serif;font-weight:700}.zx-ot.f-q{font-family:'Amiri Quran',Amiri,serif;font-weight:400;line-height:2}
.zx-ot.aya{background:rgba(10,20,30,.55);border:1px solid rgba(212,162,76,.6);border-radius:14px;padding:8px 14px}.zx-ot.aya small{display:block;font-family:inherit;font-size:11px;color:var(--gold);font-weight:700;line-height:1.4;margin-top:2px}
.zx-tap{position:absolute;inset:0;z-index:3}
.zx-shade{position:absolute;inset:auto 0 0 0;height:46%;background:linear-gradient(transparent,rgba(0,0,0,.62));z-index:3;pointer-events:none}
.zx-shade.zx-tsh{inset:0 0 auto 0;height:120px;background:linear-gradient(rgba(0,0,0,.45),transparent)}
.zx-rail{position:absolute;inset-inline-end:8px;bottom:84px;z-index:5;display:flex;flex-direction:column;align-items:center;gap:15px}
.zx-rb{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:12px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.zx-rb .zx-i{width:33px;height:33px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.45))}
.zx-rb.on .zx-hrt{fill:var(--acc);stroke:var(--acc)}.zx-rb.on .zx-bk{fill:#f9c74f;stroke:#f9c74f}
.zx-rb.pop .zx-i{animation:zxpop .35s ease}@keyframes zxpop{40%{transform:scale(1.3)}}
.zx-rav{position:relative;margin-bottom:6px}.zx-rav .zx-av{box-shadow:0 0 0 2px #fff}
.zx-fol{position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);width:21px;height:21px;border-radius:50%;background:var(--acc);display:flex;align-items:center;justify-content:center;color:#fff;transition:transform .25s}
.zx-fol .zx-i{width:13px;height:13px;stroke-width:3}.zx-fol.done{background:#fff;color:var(--acc);transform:translateX(-50%) scale(0);}
.zx-info{position:absolute;inset-inline-start:12px;inset-inline-end:76px;bottom:22px;z-index:5;text-shadow:0 1px 4px rgba(0,0,0,.55)}
.zx-info .who{display:flex;align-items:center;gap:6px;font-size:15.5px;font-weight:800;margin-bottom:5px}.zx-info .who small{font-weight:500;opacity:.75;font-size:12px}
.zx-cap{font-size:14px;line-height:1.55;max-height:3.1em;overflow:hidden;position:relative;white-space:pre-wrap;word-break:break-word}
.zx-cap.open{max-height:40vh;overflow-y:auto}.zx-more{font-weight:800;font-size:13.5px;margin-top:2px;opacity:.92}
.zx-tag,.zx-men{font-weight:800}
.zx-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}.zx-chip{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;background:rgba(255,255,255,.16);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:999px;padding:4px 10px}
.zx-chip .zx-i{width:14px;height:14px}.zx-chip.gold{background:rgba(212,162,76,.28);color:#ffe2a8}
.zx-prog{position:absolute;inset-inline:0;bottom:0;height:18px;z-index:6;display:flex;align-items:flex-end;touch-action:none}
.zx-prog .zx-bar{position:relative;width:100%;height:2.5px;background:rgba(255,255,255,.22);transition:height .15s}.zx-prog .zx-bar i{position:absolute;inset-block:0;right:0;background:rgba(255,255,255,.9);width:0}
.zx-prog .zx-bar b{position:absolute;top:50%;width:13px;height:13px;margin:-6.5px -6.5px 0 0;border-radius:50%;background:#fff;opacity:0;right:0}
.zx-prog.drag .zx-bar{height:6px}.zx-prog.drag .zx-bar b{opacity:1}
.zx-time{position:absolute;bottom:48px;left:50%;transform:translateX(-50%);z-index:7;font-size:22px;font-weight:800;text-shadow:0 2px 8px #000;display:none;direction:ltr}.zx-prog.drag~.zx-time{display:block}
.zx-pp{position:absolute;left:50%;top:50%;margin:-36px 0 0 -36px;width:72px;height:72px;border-radius:50%;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:4;pointer-events:none;opacity:0;transition:opacity .15s}
.zx-pp .zx-i{width:38px;height:38px;fill:#fff;stroke:none}.zx-s.paused .zx-pp{opacity:1}
.zx-spin{position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;border:3px solid rgba(255,255,255,.25);border-top-color:#fff;animation:zxsp .8s linear infinite;z-index:4;display:none}.zx-s.wait .zx-spin{display:block}
@keyframes zxsp{to{transform:rotate(360deg)}}
.zx-heart{position:absolute;z-index:8;width:110px;height:110px;margin:-55px 0 0 -55px;pointer-events:none;animation:zxh .85s ease-out forwards}
.zx-heart .zx-i{width:110px;height:110px;fill:var(--acc);stroke:none;filter:drop-shadow(0 6px 14px rgba(254,44,85,.45))}
@keyframes zxh{0%{transform:scale(.3) rotate(var(--r,-14deg));opacity:0}18%{transform:scale(1.15) rotate(var(--r,-14deg));opacity:1}38%{transform:scale(.95) rotate(var(--r,-14deg))}70%{opacity:1}100%{transform:scale(1.3) translateY(-90px) rotate(var(--r,-14deg));opacity:0}}
.zx-top{position:absolute;top:0;inset-inline:0;z-index:9;display:flex;align-items:center;padding:calc(env(safe-area-inset-top) + 6px) 8px 8px;gap:6px;pointer-events:none}
.zx-top>*{pointer-events:auto}.zx-top .zx-ib{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%}
.zx-top .zx-ib .zx-i{width:26px;height:26px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.6))}
.zx-tabs{flex:1;display:flex;justify-content:center;gap:22px}.zx-tabs button{font-size:16.5px;font-weight:800;opacity:.62;position:relative;padding:6px 2px;text-shadow:0 1px 5px rgba(0,0,0,.5)}
.zx-tabs button.on{opacity:1}.zx-tabs button.on:after{content:'';position:absolute;bottom:0;left:25%;right:25%;height:3px;border-radius:2px;background:#fff}
.zx-ttl{flex:1;text-align:center;font-weight:800;font-size:16px;text-shadow:0 1px 5px rgba(0,0,0,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zx-snd{position:absolute;top:calc(env(safe-area-inset-top) + 56px);left:12px;z-index:9;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:700}
.zx-snd .zx-i{width:18px;height:18px}
.zx-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;padding:30px;color:rgba(255,255,255,.75);font-size:14.5px;line-height:1.7}
.zx-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--acc);color:#fff;border-radius:8px;padding:10px 18px;font-weight:800;font-size:14.5px}
.zx-btn.zx-gh{background:rgba(255,255,255,.12)}.zx-btn.bl{display:flex;width:100%}.zx-btn:disabled{opacity:.5}.zx-btn .zx-i{width:18px;height:18px}
/* sheets */
.zx-sh{position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;animation:zxf .2s}
@keyframes zxf{from{opacity:0}}
.zx-sh>.bx{width:100%;max-height:78%;background:#16171d;border-radius:16px 16px 0 0;display:flex;flex-direction:column;animation:zxup .28s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom);color:#fff}
.zx-sh.light>.bx{background:#fff;color:#161823}
@keyframes zxup{from{transform:translateY(100%)}}
.zx-sh h4{margin:0;padding:14px 16px 10px;font-size:15px;font-weight:800;text-align:center;position:relative}.zx-sh h4 .x{position:absolute;inset-inline-start:10px;top:9px;width:32px;height:32px;display:flex;align-items:center;justify-content:center}
.zx-grip{width:40px;height:4px;border-radius:2px;background:rgba(127,127,127,.4);margin:8px auto 0}
.zx-menu{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 8px;padding:14px 14px 18px}
.zx-menu button{display:flex;flex-direction:column;align-items:center;gap:7px;font-size:12px;font-weight:600;line-height:1.3;text-align:center}
.zx-menu button span{width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center}
.zx-menu button.red span{color:#ff6b81}
.zx-row{display:flex;gap:8px;padding:0 14px 14px;flex-wrap:wrap;align-items:center}.zx-row b{font-size:12.5px;opacity:.7;margin-inline-end:4px}
.zx-pill{border-radius:999px;padding:7px 13px;background:rgba(255,255,255,.1);font-size:13px;font-weight:700}.zx-pill.on{background:#fff;color:#111}
/* comments */
.zx-cl{flex:1;overflow-y:auto;padding:0 14px 8px;min-height:180px}
.zx-c{display:flex;gap:10px;padding:9px 0;position:relative}.zx-c .bd{flex:1;min-width:0}.zx-c .nm{font-size:12.5px;color:rgba(255,255,255,.6);font-weight:700;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.zx-c .nm .crt{background:var(--acc);color:#fff;border-radius:4px;padding:0 5px;font-size:10.5px}.zx-c .tx{font-size:14.5px;line-height:1.55;margin:2px 0 4px;white-space:pre-wrap;word-break:break-word}
.zx-c .ac{display:flex;gap:16px;font-size:12px;color:rgba(255,255,255,.55);font-weight:700}
.zx-c .lk{display:flex;flex-direction:column;align-items:center;gap:2px;font-size:11.5px;color:rgba(255,255,255,.6);padding-top:12px;min-width:28px}.zx-c .lk .zx-i{width:19px;height:19px}.zx-c .lk.on .zx-i{fill:var(--acc);stroke:var(--acc)}
.zx-c.rp{margin-inline-start:44px}.zx-c .pinb{font-size:11px;color:var(--gold);display:flex;align-items:center;gap:3px}.zx-c .pinb .zx-i{width:13px;height:13px}
.zx-showr{margin:0 0 6px 44px;font-size:12.5px;font-weight:700;color:rgba(255,255,255,.6)}
.zx-emo{display:flex;justify-content:space-around;padding:6px 10px;border-top:1px solid rgba(255,255,255,.08)}.zx-emo button{font-size:24px;line-height:1;padding:4px}
.zx-cin{display:flex;gap:8px;align-items:center;padding:8px 12px 10px}.zx-cin input{flex:1;min-width:0;background:rgba(255,255,255,.08);border:0;border-radius:20px;padding:11px 15px;color:#fff;font:inherit;font-size:14.5px;outline:none}
.zx-cin button{width:40px;height:40px;border-radius:50%;background:var(--acc);display:flex;align-items:center;justify-content:center}.zx-cin button:disabled{opacity:.4}
.zx-rto{display:flex;align-items:center;justify-content:space-between;padding:6px 16px;font-size:12.5px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.7)}
.zx-ac{position:absolute;bottom:100%;inset-inline:10px;background:#22242c;border-radius:12px;overflow:hidden;box-shadow:0 -6px 20px rgba(0,0,0,.4);z-index:5}.zx-ac button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;text-align:start;font-size:14px}.zx-ac button small{opacity:.6}
`;

const CSS2=`
.zx-hd{position:sticky;top:0;z-index:8;display:flex;align-items:center;gap:6px;padding:calc(env(safe-area-inset-top) + 6px) 8px 6px;background:rgba(11,13,20,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.zx-hd .zx-ib{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%}.zx-hd h3{flex:1;margin:0;text-align:center;font-size:16px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zx-pf{text-align:center;padding:10px 16px 6px}.zx-pf .zx-av{margin:4px auto 10px}
.zx-pf h2{margin:0;font-size:19px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:4px}.zx-pf h2 .zx-ver{width:19px;height:19px}
.zx-pf .hd{color:rgba(255,255,255,.6);font-size:13.5px;direction:ltr;margin-top:2px}
.zx-cnt{display:flex;justify-content:center;gap:0;margin:16px 0 12px}.zx-cnt>*{flex:0 0 96px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:12.5px;color:rgba(255,255,255,.62)}
.zx-cnt b{font-size:17px;color:#fff;font-weight:800}.zx-cnt>*+*{border-inline-start:1px solid rgba(255,255,255,.12)}
.zx-pfb{display:flex;gap:6px;justify-content:center;margin:4px 0 12px}.zx-pfb .zx-btn{min-width:130px;padding:10px 14px}.zx-pfb .zx-sq{min-width:44px;padding:10px}
.zx-bio{font-size:14px;line-height:1.6;color:rgba(255,255,255,.88);max-width:320px;margin:0 auto 6px;white-space:pre-wrap}
.zx-fm{font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px}
.zx-sers{display:flex;gap:8px;overflow-x:auto;padding:4px 14px 12px;scrollbar-width:none}.zx-sers::-webkit-scrollbar{display:none}
.zx-ser{flex:none;display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 12px;font-size:13px;font-weight:700}
.zx-ser.gold{border-color:rgba(212,162,76,.6);background:rgba(212,162,76,.12);color:#ffe2a8}.zx-ser small{opacity:.6;font-weight:600}
.zx-ptabs{display:flex;border-bottom:1px solid rgba(255,255,255,.12);position:sticky;top:calc(env(safe-area-inset-top) + 52px);background:#0b0d14;z-index:7}
.zx-ptabs button{flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:11px 4px;font-size:13px;font-weight:700;color:rgba(255,255,255,.5);position:relative}
.zx-ptabs button.on{color:#fff}.zx-ptabs button.on:after{content:'';position:absolute;bottom:-1px;left:22%;right:22%;height:2px;background:#fff}.zx-ptabs .zx-i{width:18px;height:18px}
.zx-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.zx-g{position:relative;aspect-ratio:9/16;background:#1b1d26 center/cover no-repeat;overflow:hidden;display:block}
.zx-g:after{content:'';position:absolute;inset:auto 0 0 0;height:40%;background:linear-gradient(transparent,rgba(0,0,0,.6))}
.zx-g .vw{position:absolute;bottom:5px;inset-inline-start:6px;z-index:1;display:flex;align-items:center;gap:3px;font-size:12px;font-weight:700;text-shadow:0 1px 3px #000}.zx-g .vw .zx-i{width:14px;height:14px}
.zx-g .zx-bdg{position:absolute;top:6px;inset-inline-start:6px;z-index:1;background:var(--acc);color:#fff;border-radius:4px;font-size:10.5px;font-weight:800;padding:1px 6px}
.zx-g .zx-bdg.gr{background:rgba(0,0,0,.6)}.zx-g .zx-bdg.gold{background:var(--gold);color:#111}
.zx-g .ct{position:absolute;inset:auto 6px 24px 6px;z-index:1;font-size:11px;line-height:1.35;max-height:2.7em;overflow:hidden;text-shadow:0 1px 3px #000}
.zx-gempty{grid-column:1/-1;text-align:center;padding:46px 20px;color:rgba(255,255,255,.55);font-size:14px;line-height:1.7}
.zx-sug{padding:4px 0 10px}.zx-sug h5{margin:4px 14px 8px;font-size:13.5px;font-weight:800;display:flex;justify-content:space-between}.zx-sug h5 button{font-size:12px;opacity:.6}
.zx-hs{display:flex;gap:10px;overflow-x:auto;padding:0 14px 6px;scrollbar-width:none}.zx-hs::-webkit-scrollbar{display:none}
.zx-uc{flex:0 0 132px;background:rgba(255,255,255,.06);border-radius:12px;padding:14px 8px 10px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
.zx-uc b{font-size:13.5px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zx-uc small{font-size:11.5px;opacity:.6;direction:ltr}.zx-uc .zx-btn{padding:6px 14px;font-size:12.5px;margin-top:4px}
/* explore */
.zx-sb{display:flex;align-items:center;gap:8px;flex:1;background:rgba(255,255,255,.1);border-radius:10px;padding:0 12px;height:40px}.zx-sb input{flex:1;min-width:0;background:none;border:0;color:#fff;font:inherit;font-size:15px;outline:none}.zx-sb .zx-i{width:18px;height:18px;opacity:.6}
.zx-sec{padding:6px 14px 2px;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:space-between}
.zx-trs{display:flex;flex-wrap:wrap;gap:8px;padding:8px 14px 14px}.zx-tr{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.07);border-radius:10px;padding:8px 12px;font-size:14px;font-weight:700}
.zx-tr i{font-style:normal;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-weight:800}.zx-tr small{opacity:.55;font-weight:600}
.zx-ul{padding:0 14px}.zx-ur{display:flex;align-items:center;gap:12px;padding:9px 0}.zx-ur .bd{flex:1;min-width:0}.zx-ur .bd b{display:block;font-size:14.5px}.zx-ur .bd small{opacity:.6;font-size:12px}
.zx-ur .zx-btn{padding:7px 14px;font-size:13px}
.zx-seg{display:flex;gap:6px;padding:4px 14px 10px}
.zx-taghd{display:flex;align-items:center;gap:14px;padding:12px 16px 16px}.zx-taghd .sym{width:80px;height:80px;border-radius:14px;background:linear-gradient(135deg,#34457a,#c0693f);display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:800}
.zx-taghd h2{margin:0;font-size:21px}.zx-taghd p{margin:4px 0 0;opacity:.65;font-size:13px}
/* notifications */
.zx-nt{display:flex;gap:11px;align-items:center;padding:10px 14px}.zx-nt.new{background:rgba(254,44,85,.07)}.zx-nt .bd{flex:1;min-width:0;font-size:14px;line-height:1.5}.zx-nt .bd small{display:block;opacity:.55;font-size:12px}
.zx-nt .zx-k{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}.zx-nt .zx-k .zx-i{width:15px;height:15px}
/* forms / editor */
.zx-f{padding:0 16px}.zx-f label{display:block;font-size:12.5px;font-weight:700;color:rgba(255,255,255,.6);margin:14px 0 6px}
.zx-f input[type=text],.zx-f textarea,.zx-f select,.zx-f input[type=datetime-local]{width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font:inherit;font-size:15px;padding:11px 12px;outline:none}
.zx-f textarea{min-height:92px;resize:vertical;line-height:1.6}.zx-f select option{color:#000}
.zx-tg{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:14.5px}.zx-tg small{display:block;opacity:.55;font-size:12px;margin-top:2px}
.zx-sw{position:relative;width:46px;height:28px;flex:none}.zx-sw input{opacity:0;position:absolute;inset:0;margin:0;z-index:1;cursor:pointer}.zx-sw i{position:absolute;inset:0;border-radius:14px;background:rgba(255,255,255,.2);transition:.2s}.zx-sw i:after{content:'';position:absolute;top:3px;right:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.2s}
.zx-sw input:checked+i{background:#20d5ec}.zx-sw input:checked+i:after{right:21px}
.zx-pats{display:flex;gap:10px;flex-wrap:wrap}.zx-pats button{border-radius:50%;padding:2px;border:2px solid transparent}.zx-pats button.on{border-color:#20d5ec}
.zx-pick{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;margin:18px 16px;min-height:260px;border:2px dashed rgba(255,255,255,.2);border-radius:18px;text-align:center;padding:20px;cursor:pointer}
.zx-pick .zx-i{width:54px;height:54px;opacity:.85}.zx-pick b{font-size:17px}.zx-pick small{opacity:.6;line-height:1.6}
.zx-ed{position:relative;margin:8px auto 0;width:min(70vw,300px);aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#000}
.zx-ed video{width:100%;height:100%;object-fit:cover;display:block}.zx-ed .zx-ov{pointer-events:auto}.zx-ed .zx-ot{pointer-events:auto;cursor:grab;touch-action:none;outline:1px dashed rgba(255,255,255,.0)}.zx-ed .zx-ot.sel{outline-color:rgba(255,255,255,.8)}
.zx-ed .zx-ot .rm{position:absolute;top:-10px;left:-10px;width:22px;height:22px;border-radius:50%;background:#fe2c55;color:#fff;display:none;align-items:center;justify-content:center;font-size:13px;line-height:1}.zx-ed .zx-ot.sel .rm{display:flex}
.zx-tools{display:flex;justify-content:center;gap:6px;padding:12px 10px 4px;flex-wrap:wrap}.zx-tools button{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11.5px;font-weight:700;width:64px}
.zx-tools button span{width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center}.zx-tools button.on span{background:#fff;color:#111}
.zx-panel{margin:8px 14px;padding:12px;background:rgba(255,255,255,.06);border-radius:14px}
.zx-trim{position:relative;height:52px;margin:6px 0;border-radius:8px;overflow:hidden;background:#222 center/auto 100% repeat-x;touch-action:none}
.zx-trim .strip{position:absolute;inset:0;display:flex}.zx-trim .strip img{flex:1;height:100%;object-fit:cover;min-width:0}
.zx-trim .sel{position:absolute;top:0;bottom:0;border:3px solid #f9c74f;border-radius:8px;box-shadow:0 0 0 999px rgba(0,0,0,.55)}
.zx-trim .h{position:absolute;top:0;bottom:0;width:22px;background:#f9c74f;display:flex;align-items:center;justify-content:center;color:#111;font-weight:900;font-size:14px;touch-action:none}
.zx-trim .h.s{right:-3px;border-radius:0 6px 6px 0}.zx-trim .h.e{left:-3px;border-radius:6px 0 0 6px}
.zx-trim .ph{position:absolute;top:-2px;bottom:-2px;width:2px;background:#fff;pointer-events:none}
.zx-rng{width:100%;accent-color:#20d5ec}
.zx-sws{display:flex;gap:8px;flex-wrap:wrap}.zx-sws button{width:28px;height:28px;border-radius:50%;border:2px solid rgba(255,255,255,.3)}.zx-sws button.on{border-color:#fff;transform:scale(1.15)}
.zx-fxs{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}.zx-fxs button{flex:none;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11.5px;font-weight:700}
.zx-fxs button i{width:56px;height:56px;border-radius:10px;background:linear-gradient(135deg,#34457a,#c0693f 60%,#f6f4ef);display:block;border:2px solid transparent}.zx-fxs button.on i{border-color:#fff}
.zx-upbar{height:6px;border-radius:3px;background:rgba(255,255,255,.15);overflow:hidden;margin:12px 0 6px}.zx-upbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#25f4ee,#fe2c55);transition:width .25s}
.zx-note{display:flex;gap:10px;align-items:flex-start;background:rgba(212,162,76,.1);border:1px solid rgba(212,162,76,.3);border-radius:12px;padding:10px 12px;font-size:12.5px;line-height:1.6;color:#f3dfb3;margin:14px 0}.zx-note .zx-i{width:18px;height:18px;margin-top:2px}
.zx-cv{display:flex;gap:12px;align-items:flex-start;margin-top:12px}.zx-cv .th{width:84px;aspect-ratio:9/16;border-radius:8px;background:#222 center/cover;flex:none;position:relative}.zx-cv .th span{position:absolute;bottom:0;inset-inline:0;text-align:center;font-size:10.5px;font-weight:700;background:rgba(0,0,0,.6);padding:2px}
.zx-cv textarea{flex:1}
.zx-dr{display:flex;gap:12px;align-items:center;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06)}.zx-dr .th{width:54px;aspect-ratio:9/16;border-radius:6px;background:#222 center/cover;flex:none}.zx-dr .bd{flex:1;min-width:0;font-size:13.5px}.zx-dr .bd small{display:block;opacity:.55}
/* stats */
.zx-kp{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:6px 14px}.zx-kp div{background:rgba(255,255,255,.06);border-radius:12px;padding:12px}.zx-kp b{display:block;font-size:22px;font-weight:800}.zx-kp small{opacity:.6;font-size:12px}
.zx-ch{margin:10px 14px;background:rgba(255,255,255,.05);border-radius:12px;padding:12px}.zx-ch h5{margin:0 0 8px;font-size:13.5px;display:flex;justify-content:space-between}.zx-ch h5 span{opacity:.6;font-weight:600}
.zx-ch svg{width:100%;height:110px;display:block}
.zx-top5{display:flex;gap:10px;align-items:center;padding:8px 14px}.zx-top5 .th{width:46px;aspect-ratio:9/16;border-radius:6px;background:#222 center/cover;flex:none}.zx-top5 .bd{flex:1;min-width:0;font-size:13px}.zx-top5 .bd small{display:block;opacity:.6}
/* overlays */
.zx-prayer{position:absolute;inset:0;z-index:60;background:radial-gradient(circle at 50% 30%,rgba(15,76,74,.97),rgba(4,16,22,.98));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:30px;animation:zxf .4s}
.zx-prayer .zx-i{width:64px;height:64px;color:var(--gold)}.zx-prayer h2{margin:0;font-size:26px;color:#ffe2a8}.zx-prayer p{margin:0;opacity:.85;line-height:1.7;font-size:15px}
.zx-toast{position:absolute;left:50%;top:calc(env(safe-area-inset-top) + 64px);transform:translateX(-50%);z-index:80;background:rgba(30,30,36,.95);color:#fff;border-radius:10px;padding:10px 16px;font-size:14px;font-weight:600;max-width:86%;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none}.zx-toast.on{opacity:1}
.zx-qr{background:#fff;color:#161823;border-radius:18px;padding:18px;margin:10px auto;width:min(80vw,290px);text-align:center}.zx-qr canvas,.zx-qr img{width:100%;height:auto;display:block}
.zx-load{padding:40px;text-align:center;opacity:.6}
`;

/* ===== shell: overlay, page stack, bottom zx-bar, sheets, toast ===== */
let root=null,pagesEl=null,stack=[],ME=null,MELOAD=null,UNREAD=0,tick=null,tT=null;
function css(){if($('#zxcss'))return;const s=document.createElement('style');s.id='zxcss';s.textContent=CSS+CSS2;document.head.appendChild(s)}
function toastX(m){if(!root)return tst(m);let t=$('.zx-toast',root);if(!t){t=document.createElement('div');t.className='zx-toast';root.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),2300)}
const say=m=>toastX(m);
function build(){css();if(root&&document.body.contains(root))return;
 root=document.createElement('div');root.className='zxr';root.id='zxroot';root.setAttribute('role','dialog');root.setAttribute('aria-label','مقاطع زاد');
 root.innerHTML=`<div class="zx-pages"></div><nav class="zx-nav" aria-label="مقاطع زاد">
  <a href="#videos" data-n="videos">${ic('home')}<span>الرئيسية</span></a><a href="#explore" data-n="explore">${ic('compass')}<span>استكشف</span></a>
  <a href="#vupload" class="zx-plus" data-n="vupload" aria-label="رفع مقطع"><span>${ic('plus')}</span></a>
  <a href="#vnotif" data-n="vnotif">${ic('bell')}<span>التنبيهات</span></a><a href="#u/me" data-n="u">${ic('user')}<span>ملفي</span></a></nav>`;
 document.body.appendChild(root);document.documentElement.style.overflow='hidden';pagesEl=$('.zx-pages',root);
 try{if(!sessionStorage.getItem('zad.zxin')){sessionStorage.setItem('zad.zxin','1');Z.inapp=history.length>1}}catch(e){}
 document.addEventListener('visibilitychange',onVis);tick=setInterval(minute,15000);loadMe()}
function onVis(){const f=topFeed();if(!f)return;if(document.hidden)f.pause();else f.resume()}
function close(){if(!root)return;stack.forEach(p=>{try{p.destroy&&p.destroy()}catch(e){}});stack=[];POOL.forEach(v=>{try{v.pause();v.removeAttribute('src');v.load()}catch(e){};v.remove();v._f=null});
 clearInterval(tick);document.removeEventListener('visibilitychange',onVis);root.remove();root=null;document.documentElement.style.overflow=''}
function navOn(k){if(!root)return;$$('.zx-nav [data-n]',root).forEach(a=>a.classList.toggle('on',a.dataset.n===k));const d=$('.zx-nav [data-n=vnotif]',root);let dt=$('.zx-dot',d);if(UNREAD>0){if(!dt){dt=document.createElement('i');dt.className='zx-dot';d.appendChild(dt)}dt.textContent=UNREAD>9?'٩+':ar(UNREAD)}else if(dt)dt.remove()}
function topPage(){return stack[stack.length-1]}
function topFeed(){const p=topPage();return p&&p.feed?p.feed:null}
/* push a page (or return to it when it is already in the stack) */
function show(key,make){let i=stack.findIndex(p=>p.key===key);
 if(i>=0){while(stack.length>i+1){const p=stack.pop();try{p.destroy&&p.destroy()}catch(e){}p.el.remove()}const p=stack[i];p.el.style.display='';p.onShow&&p.onShow();return p}
 const cur=topPage();if(cur){cur.onHide&&cur.onHide();if(cur.feed)cur.el.style.display='none';else cur.el.style.display='none'}
 const p=make();p.key=key;pagesEl.appendChild(p.el);stack.push(p);
 if(stack.length>7){const old=stack.splice(stack[0].key==='feed'?1:0,1)[0];try{old.destroy&&old.destroy()}catch(e){}old.el.remove()}
 return p}
function page(cls,html){const el=document.createElement('div');el.className='zx-page '+(cls||'');el.innerHTML=html||'';return el}
function back(){if(stack.length>1||Z.inapp){history.back()}else location.hash='videos'}
const hdr=(t,extra)=>`<div class="zx-hd"><button class="zx-ib zbk" aria-label="رجوع">${ic('back')}</button><h3>${t}</h3>${extra||'<span style="width:40px"></span>'}</div>`;
function bindBack(el){$$('.zbk',el).forEach(b=>b.onclick=back)}
function sheet(html,o){o=o||{};const s=document.createElement('div');s.className='zx-sh'+(o.light?' light':'');s.innerHTML=`<div class="bx" role="dialog">${o.grip===false?'':'<div class="zx-grip"></div>'}${html}</div>`;
 (root||document.body).appendChild(s);const cl=()=>{if(!s.parentNode)return;s.remove();o.onClose&&o.onClose()};s.close=cl;s.addEventListener('click',e=>{if(e.target===s)cl()});$$('.x',s).forEach(b=>b.onclick=cl);return s}
/* ===== the Diwaniya identity (one profile across the app) ===== */
function loadMe(force){if(ME&&!force)return Promise.resolve(ME);if(MELOAD&&!force)return MELOAD;MELOAD=api('vx/me').then(r=>{if(r.ok){ME=r.me;UNREAD=r.unread||0;try{if(ME)S.zb6=Object.assign(S.zb6||{},{dw:Object.assign((S.zb6||{}).dw||{},{has:1})})}catch(e){};navOn(curNav)}return ME}).catch(()=>ME);return MELOAD}
let curNav='videos';
function needProfile(why){return loadMe().then(m=>{if(m&&!m.banned)return m;if(m&&m.banned){say('تم إيقاف حسابك');return null}return new Promise(ok=>profileSheet(ok,why))})}
function profileSheet(done,why){const s=sheet(`<h4>${ME?'تعديل الملف':'أنشئ ملفك في زاد'}<button class="x" aria-label="إغلاق">${ic('x')}</button></h4><div class="zx-f" style="overflow-y:auto;padding-bottom:16px">
 ${ME?'':`<p style="margin:0;font-size:13px;line-height:1.7;opacity:.75">${why||'ملف واحد لك في كل التطبيق: الديوانية والمقاطع.'} لا تحتاج إلى رقم جوال ولا بريد — حسابك مرتبط بهذا الجهاز.</p>`}
 <label>الاسم</label><input type="text" id="zxpfn" maxlength="30" value="${es(ME?ME.name:((S.profile&&S.profile.name)||''))}" placeholder="مثال: أبو عبدالله">
 <label>المعرّف (@)</label><input type="text" id="zxpfh" maxlength="20" dir="ltr" value="${es(ME&&ME.h!==ME.id?ME.h:'')}" placeholder="abu_abdullah" autocapitalize="off" autocomplete="off" spellcheck="false">
 <label>نبذة قصيرة</label><input type="text" id="zxpfb" maxlength="120" value="${es(ME?ME.bio:'')}" placeholder="سطر عنك">
 <label>الصورة الرمزية (حرف أو زخرفة)</label><div class="zx-pats" id="zxpfp"></div>
 ${ME?`<div class="zx-tg"><span>«أعجبني» ظاهر للناس<small>خاص افتراضيًا</small></span><label class="zx-sw"><input type="checkbox" id="zxpfl" ${ME.likesPub?'checked':''}><i></i></label></div>
 <div class="zx-tg"><span>تنبيهات المقاطع على الجوال<small>إعجاب، تعليق، متابعة، إشارة — إذا كانت تنبيهات زاد مفعّلة</small></span><label class="zx-sw"><input type="checkbox" id="zxpfu" ${ME.push?'checked':''}><i></i></label></div>`:''}
 <div class="zx-note">${ic('flag')}<span>لا موسيقى ولا صور ذوات أرواح ولا روابط أو أرقام. المخالف يُحذف ويُوقف حسابه.</span></div>
 <button class="zx-btn bl" id="zxpfs">${ME?'حفظ':'ابدأ'}</button></div>`,{onClose:()=>{const d=done;done=null;d&&d(null)}});
 let pat=ME?ME.pat||0:Math.floor(Math.random()*8)+1;const pp=$('#zxpfp',s);const drawP=()=>{const u={id:ME?ME.id:'new',name:$('#zxpfn',s).value||'؟'};pp.innerHTML=PATS.map((x,i)=>`<button class="${i===pat?'on':''}" data-p="${i}" aria-label="شكل ${ar(i+1)}">${av(Object.assign({},u,{pat:i}),44)}</button>`).join('');$$('button',pp).forEach(b=>b.onclick=()=>{pat=+b.dataset.p;drawP()})};drawP();$('#zxpfn',s).oninput=()=>{clearTimeout(s._t);s._t=setTimeout(drawP,250)};
 $('#zxpfs',s).onclick=async()=>{const b=$('#zxpfs',s);b.disabled=true;try{
  const r=await api('dw/profile',{name:$('#zxpfn',s).value,bio:$('#zxpfb',s).value});if(!r.ok)throw r;
  const body={pat};const h=$('#zxpfh',s).value.trim();if(h)body.h=h;if(ME){body.likesPub=$('#zxpfl',s).checked?1:0;body.push=$('#zxpfu',s).checked?1:0}
  const r2=await api('vx/prof',body);if(!r2.ok)throw r2;ME=r2.me;try{S.zb6=Object.assign(S.zb6||{},{dw:Object.assign((S.zb6||{}).dw||{},{has:1})});sv()}catch(e){}
  if(ME.push)pushLink(true);else if(body.push===0)pushLink(false);
  const d=done;done=null;s.close();say('تم ✓');d&&d(ME);rerender()}catch(e){say(err(e))}b.disabled=false}}
async function pushLink(on){try{if(!('serviceWorker' in navigator))return;const reg=await navigator.serviceWorker.getRegistration();const sub=reg&&reg.pushManager&&await reg.pushManager.getSubscription();if(!sub)return;await api('vx/pushlink',{endpoint:sub.endpoint,on})}catch(e){}}
function rerender(){const p=topPage();if(p&&p.refresh)p.refresh()}

/* ===== the video pool: 3 <video> elements recycled across every feed ===== */
const POOL=[];
function poolInit(){if(POOL.length)return;for(let k=0;k<3;k++){const v=document.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.preload='none';v.muted=true;v.disablePictureInPicture=false;v.setAttribute('disableremoteplayback','');
 v.addEventListener('playing',()=>{const s=v.parentNode&&v.parentNode.parentNode;s&&s.classList.remove('wait','paused');v.classList.add('rd')});
 v.addEventListener('waiting',()=>{const s=v.parentNode&&v.parentNode.parentNode;s&&v._f&&v._f.cur===v._i&&s.classList.add('wait')});
 v.addEventListener('loadeddata',()=>v.classList.add('rd'));
 v.addEventListener('loadedmetadata',()=>{if(v._ts&&v.currentTime<v._ts)try{v.currentTime=v._ts}catch(e){}});
 v.addEventListener('ended',()=>{try{v.currentTime=v._ts||0}catch(e){}v._f&&v._f.cur===v._i&&!v._f.paused&&v.play().catch(()=>{})});
 v.addEventListener('timeupdate',()=>{if(v._te&&v.currentTime>=v._te){try{v.currentTime=v._ts||0}catch(e){}}else if(v._ts&&v.currentTime<v._ts-.3){try{v.currentTime=v._ts}catch(e){}}});
 v.addEventListener('error',()=>{const s=v.parentNode&&v.parentNode.parentNode;if(s&&v.getAttribute('src')){s.classList.remove('wait');if(!$('.zx-err',s)){const e=document.createElement('button');e.className='zx-chip zx-err';e.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:7';e.textContent='تعذّر التشغيل — إعادة المحاولة';e.onclick=ev=>{ev.stopPropagation();e.remove();const src=v.getAttribute('src');v.removeAttribute('src');v.load();v.src=src;v.play().catch(()=>{})};s.appendChild(e)}}});
 POOL.push(v)}}
const fxFilter=f=>f?`brightness(${f.b||1}) contrast(${f.c||1}) saturate(${f.s==null?1:f.s}) sepia(${(f.w||0)*.45}) grayscale(${f.g||0})`:'';
const AYA={};
function ayaText(ref){if(AYA[ref])return AYA[ref];const q=typeof QAPI!=='undefined'?QAPI:'https://api.quran.com/api/v4';AYA[ref]=fetch(q+'/verses/by_key/'+ref+'?words=false&fields=text_uthmani').then(r=>r.json()).then(j=>j.verse.text_uthmani).catch(()=>{delete AYA[ref];return''});return AYA[ref]}
const sName=n=>{try{return QDATA.ch[n-1][1]}catch(e){return'سورة '+ar(n)}};
function ovHTML(fx){if(!fx||!fx.o)return'';return fx.o.map((o,k)=>o.k==='aya'?`<div class="zx-ot aya f-q" data-aya="${o.ref}" style="right:${100-o.x}%;top:${o.y}%;font-size:calc(${o.z||20}px * var(--zk,1));color:${o.c||'#fff'}">…<small>﴿ ${es(sName(+o.ref.split(':')[0]))} : ${ar(o.ref.split(':')[1])} ﴾</small></div>`:`<div class="zx-ot f-${o.f||'c'}${o.bg?' bg':''}" style="right:${100-o.x}%;top:${o.y}%;font-size:calc(${o.z||22}px * var(--zk,1));color:${o.c||'#fff'}">${es(o.t)}</div>`).join('')}
function fillAya(el){$$('[data-aya]',el).forEach(d=>{if(d._f)return;d._f=1;ayaText(d.dataset.aya).then(t=>{if(t&&d.firstChild)d.firstChild.textContent=t})})}
/* ===== feed ===== */
let FEEDN=0;
function makeFeed(o){const F={id:++FEEDN,items:[],next:null,loading:false,cur:-1,paused:false,muted:!Z.snd,o};
 const el=page('feedp',`<div class="zx-feed"></div><div class="zx-top">${o.tabs?`<button class="zx-ib zxs" aria-label="بحث">${ic('search')}</button><div class="zx-tabs"><button data-f="fol" class="${o.f==='fol'?'on':''}">أتابعهم</button><button data-f="for" class="${o.f!=='fol'?'on':''}">لك</button></div><button class="zx-ib zxu" aria-label="رفع">${ic('plus')}</button>`:`<button class="zx-ib zbk" aria-label="رجوع">${ic('back')}</button><div class="zx-ttl">${o.title||''}</div><span style="width:40px"></span>`}</div><button class="zx-snd" hidden>${ic('mute')}اضغط للصوت</button>`);
 F.el=el;const fe=$('.zx-feed',el);F.fe=fe;bindBack(el);
 if(o.tabs){$('.zxs',el).onclick=()=>location.hash='explore';$('.zxu',el).onclick=()=>location.hash='vupload';$$('.zx-tabs button',el).forEach(b=>b.onclick=()=>{if(b.classList.contains('on')){fe.scrollTo({top:0,behavior:'smooth'});return}$$('.zx-tabs button',el).forEach(x=>x.classList.toggle('on',x===b));F.reset(b.dataset.f)})}
 const snd=$('.zx-snd',el);snd.onclick=e=>{e.stopPropagation();F.setMuted(false,true)};
 F.setMuted=(m,user)=>{F.muted=m;if(user){Z.snd=m?0:1;sv()}snd.hidden=!m||!F.items.length;const v=F.vid(F.cur);if(v){v.muted=m;if(!m&&!F.paused)v.play().catch(()=>{})}};
 F.obs=new IntersectionObserver(es2=>{es2.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.6)F.activate(+e.target.dataset.i)})},{root:fe,threshold:[.6]});
 fe.addEventListener('scroll',()=>{if(F.next!=null&&!F.loading&&fe.scrollTop+fe.clientHeight*3>fe.scrollHeight)F.more()},{passive:true});
 F.slide=i=>fe.querySelector('.zx-s[data-i="'+i+'"]');
 F.vid=i=>POOL.find(v=>v._f===F&&v._i===i&&v.parentNode)||null;
 F.render=(from)=>{const frag=document.createDocumentFragment();for(let i=from;i<F.items.length;i++){const s=document.createElement('section');s.className='zx-s'+(F.items[i].off||(F.items[i].w&&F.items[i].h&&F.items[i].w/F.items[i].h>.62)?' fit':'');s.dataset.i=i;s.innerHTML=slideHTML(F.items[i]);frag.appendChild(s);bindSlide(F,s,i)}fe.appendChild(frag);$$('.zx-s',fe).slice(from).forEach(s=>F.obs.observe(s))};
 F.attach=(i,play)=>{const it=F.items[i],s=F.slide(i);if(!it||!s)return null;let v=F.vid(i);
  if(!v){const keep=new Set([F.cur-1,F.cur,F.cur+1]);v=POOL.find(x=>x._f!==F||!x.parentNode)||POOL.filter(x=>!keep.has(x._i)).sort((a,b)=>Math.abs(b._i-F.cur)-Math.abs(a._i-F.cur))[0]||POOL[0];
   try{v.pause()}catch(e){}v.classList.remove('rd');if(v.parentNode){const ps=v.parentNode.parentNode;ps&&ps.classList.remove('wait');v.remove()}
   v._f=F;v._i=i;v._ts=it.ts||0;v._te=it.te||0;v.style.filter=fxFilter(it.fx&&it.fx.f);v.preload=play?'auto':'metadata';
   $('.zx-m',s).insertBefore(v,$('.zx-ov',s));if(v.getAttribute('src')!==srcU(it)){v.src=srcU(it)}else if(v._ts){try{v.currentTime=v._ts}catch(e){}}}
  v.playbackRate=Z.spd||1;v.muted=F.muted;if(play)v.preload='auto';return v};
 F.play=i=>{const v=F.attach(i,true),s=F.slide(i);if(!v)return;s.classList.add('wait');s.classList.remove('paused');F.paused=false;
  const p=v.play();p&&p.catch(e=>{if(!v.muted){F.muted=true;v.muted=true;snd.hidden=false;v.play().catch(()=>{s.classList.add('paused');s.classList.remove('wait')})}else{s.classList.add('paused');s.classList.remove('wait')}})};
 F.activate=i=>{if(i===F.cur||i<0||i>=F.items.length)return;const old=F.vid(F.cur);if(old){try{old.pause()}catch(e){}}const os=F.slide(F.cur);if(os)os.classList.remove('wait');
  F.cur=i;fillAya(F.slide(i));F.play(i);snd.hidden=!F.muted;
  clearTimeout(F.pre);F.pre=setTimeout(()=>{if(F.cur===i&&F.items[i+1])F.attach(i+1,false)},900);
  clearTimeout(F.vt);F.vt=setTimeout(()=>countView(F.items[i]),2000);
  if(F.next!=null&&i>=F.items.length-4)F.more();raf(F)};
 F.pause=()=>{F.paused=true;const v=F.vid(F.cur);if(v)try{v.pause()}catch(e){}};
 F.resume=()=>{if(!F.items.length||F.cur<0)return;const s=F.slide(F.cur);if(s&&s.classList.contains('paused')&&F.userPaused)return;F.play(F.cur);raf(F)};
 F.toggle=()=>{const v=F.vid(F.cur),s=F.slide(F.cur);if(!v)return;if(v.paused){F.userPaused=false;F.paused=false;v.play().catch(()=>{});s.classList.remove('paused')}else{F.userPaused=true;v.pause();s.classList.add('paused')}};
 F.more=async()=>{if(F.loading||F.next==null||!o.load)return;F.loading=true;try{const r=await o.load(F.next,F);const n=F.items.length;const have=new Set(F.items.map(x=>x.id));const add=(r.items||[]).filter(x=>!have.has(x.id));F.items.push(...add);F.next=r.next;if(add.length)F.render(n)}catch(e){}F.loading=false};
 F.reset=async f=>{o.f=f;POOL.forEach(v=>{if(v._f===F){try{v.pause()}catch(e){}v.remove();v._f=null}});F.obs.disconnect();fe.innerHTML='<div class="zx-empty"><div class="zx-spin" style="display:block;position:static;margin:0"></div></div>';F.items=[];F.cur=-1;F.next=0;await F.more();
  if(!F.items.length)fe.innerHTML=`<div class="zx-empty">${f==='fol'?(ME?`${ic('user')}<b>لا توجد مقاطع من الأشخاص الذين تتابعهم بعد</b><span>تابع صنّاع المحتوى من «لك» أو «استكشف»</span><a class="zx-btn" href="#explore">استكشف الحسابات</a>`:`${ic('user')}<b>أنشئ ملفك وتابع من يعجبك</b><button class="zx-btn" id="zxmk">أنشئ ملفي</button>`):`${ic('play')}<b>لا مقاطع الآن</b><span>كن أول من ينشر مقطعًا مفيدًا</span><a class="zx-btn" href="#vupload">ارفع مقطع</a>`}</div>`;
  else{const e=$('.zx-empty',fe);e&&e.remove();fe.scrollTop=0}
  const mk=$('#zxmk',fe);if(mk)mk.onclick=()=>needProfile().then(m=>m&&F.reset('fol'))};
 F.seed=(items,next,start)=>{F.items=items.slice();F.next=next;F.render(0);if(start>0){requestAnimationFrame(()=>{fe.scrollTop=start*fe.clientHeight})}};
 F.destroy=()=>{clearTimeout(F.pre);clearTimeout(F.vt);F.obs.disconnect();POOL.forEach(v=>{if(v._f===F){try{v.pause()}catch(e){}v.removeAttribute('src');v.load();v.remove();v._f=null}})};
 const P={el,feed:F,onHide:()=>F.pause(),onShow:()=>{curNav=o.nav||'videos';navOn(curNav);F.resume()},destroy:F.destroy,refresh:()=>{}};
 return P}
function raf(F){cancelAnimationFrame(F._r);const step=()=>{const v=F.vid(F.cur),s=F.slide(F.cur);if(!v||!s||!root)return;const pr=$('.zx-prog',s);if(pr&&!pr.classList.contains('drag')){const ts=v._ts||0,te=v._te||v.duration||0;const fr=te>ts?Math.min(1,Math.max(0,(v.currentTime-ts)/(te-ts))):0;$('.zx-bar i',pr).style.width=(fr*100)+'%';$('.zx-bar b',pr).style.right=(fr*100)+'%'}F._r=requestAnimationFrame(step)};F._r=requestAnimationFrame(step)}
function countView(it){if(!it)return;const k=new Date().toDateString();if(Z.seen.k!==k)Z.seen={k};if(Z.seen[it.id])return;Z.seen[it.id]=1;api('vx/view',{id:it.id}).then(r=>{if(r&&r.counted){it.views=(it.views||0)+1;$$('.zx-s .vwn[data-id="'+it.id+'"]',root||document).forEach(e=>e.textContent=cnt(it.views))}})}

function slideHTML(it){const u=it.u||{};const off=it.off;
 return`<div class="zx-m">${it.poster?`<img class="po" src="${posterU(it)}" alt="" loading="lazy" decoding="async" ${it.fx&&it.fx.f?`style="filter:${fxFilter(it.fx.f)}"`:''}>`:''}<div class="zx-ov">${ovHTML(it.fx)}</div></div>
 <div class="zx-shade zx-tsh"></div><div class="zx-shade"></div><div class="zx-tap"></div><div class="zx-pp">${ic('play')}</div><div class="zx-spin"></div>
 <div class="zx-rail">
  <div class="zx-rav">${u.h?`<a href="#u/${es(u.h)}" aria-label="ملف ${es(u.name)}">${av(u,48)}</a>`:av(u,48)}${u.id&&!it.mine&&!u.fol?`<button class="zx-fol" data-a="fol" aria-label="متابعة">${ic('plus')}</button>`:''}</div>
  <button class="zx-rb ${it.liked?'on':''}" data-a="like" aria-label="إعجاب">${ic('heart','zx-hrt')}<span class="n">${cnt(it.likes)}</span></button>
  <button class="zx-rb" data-a="cmt" aria-label="التعليقات">${ic('chat')}<span class="n">${cnt(it.comments)}</span></button>
  <button class="zx-rb ${it.saved?'on':''}" data-a="save" aria-label="حفظ">${ic('book','zx-bk')}<span class="n">${cnt(it.saves)}</span></button>
  <button class="zx-rb" data-a="share" aria-label="مشاركة">${ic('share')}<span>مشاركة</span></button>
  <div class="zx-rb" aria-label="المشاهدات">${ic('eye')}<span class="vwn" data-id="${it.id}">${cnt(it.views)}</span></div>
 </div>
 <div class="zx-info"><div class="who">${u.h?`<a href="#u/${es(u.h)}">${uname(u)}</a>`:uname(u)}<small>· ${it.sched?'مجدول':ago(it.at)}</small></div>
  ${it.cap||it.t?`<div class="zx-cap">${capHTML(it.cap||it.t)}</div><button class="zx-more" hidden>المزيد</button>`:''}
  <div class="zx-chips">${off?`<span class="zx-chip gold">${ic('star')} حلقة رسمية</span>`:''}${it.ser&&u.h?`<a class="zx-chip" href="#u/${es(u.h)}/s/${it.ser.id}">${ic('list')} ${es(it.ser.t||'سلسلة')}</a>`:''}${it.rt?it.rt.gone?`<span class="zx-chip">${ic('reply')} ردّ على مقطع حُذف</span>`:`<a class="zx-chip" href="#video/${it.rt.id}">${ic('reply')} ردّ على @${es(it.rt.h||it.rt.name)}</a>`:''}${it.hidden?'<span class="zx-chip" style="background:#7a3343">مخفي بسبب البلاغات</span>':''}</div></div>
 <div class="zx-prog" aria-label="شريط التقدّم"><div class="zx-bar"><i></i><b></b></div></div><div class="zx-time"></div>`}
function bindSlide(F,s,i){const it=()=>F.items[i];const tap=$('.zx-tap',s);let t1=0,st=null,lp=null,moved=false,sx=0,sy=0,lpDone=false;
 tap.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;moved=false;lpDone=false;clearTimeout(lp);lp=setTimeout(()=>{if(!moved){lpDone=true;vb(12);longMenu(F,i)}},520)});
 tap.addEventListener('pointermove',e=>{if(Math.abs(e.clientX-sx)>10||Math.abs(e.clientY-sy)>10){moved=true;clearTimeout(lp)}});
 tap.addEventListener('pointercancel',()=>{clearTimeout(lp);moved=true});
 tap.addEventListener('pointerup',e=>{clearTimeout(lp);if(moved||lpDone)return;const now=Date.now();
  if(now-t1<300){clearTimeout(st);t1=0;burst(s,e.clientX,e.clientY);if(!it().liked)like(F,i,true);return}
  t1=now;clearTimeout(st);st=setTimeout(()=>{if(F.muted){F.setMuted(false,true);say('🔊 الصوت يعمل');return}F.toggle()},290)});
 tap.addEventListener('contextmenu',e=>e.preventDefault());
 s.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.preventDefault();e.stopPropagation();const a=b.dataset.a;
  if(a==='like'){like(F,i)}else if(a==='cmt')comments(F,i);else if(a==='save')saveIt(F,i,'s');else if(a==='share')shareSheet(F,i);else if(a==='fol')follow(it().u,b)});
 const cap=$('.zx-cap',s),mb=$('.zx-more',s);if(cap&&mb){requestAnimationFrame(()=>{if(cap.scrollHeight>cap.clientHeight+2)mb.hidden=false});mb.onclick=e=>{e.stopPropagation();cap.classList.toggle('open');mb.textContent=cap.classList.contains('open')?'أقل':'المزيد'}}
 seekBar(F,s,i)}
function seekBar(F,s,i){const pr=$('.zx-prog',s),bar=$('.zx-bar',pr),tm=$('.zx-time',s);let dr=false;
 const fr=x=>{const r=bar.getBoundingClientRect();return Math.min(1,Math.max(0,(r.right-x)/r.width))};
 const set=f=>{$('i',bar).style.width=f*100+'%';$('b',bar).style.right=f*100+'%';const v=F.vid(i);if(v){const ts=v._ts||0,te=v._te||v.duration||0;tm.textContent=fmt((te-ts)*f)+' / '+fmt(te-ts)}};
 pr.addEventListener('pointerdown',e=>{if(F.cur!==i)return;dr=true;pr.setPointerCapture(e.pointerId);pr.classList.add('drag');set(fr(e.clientX));e.stopPropagation()});
 pr.addEventListener('pointermove',e=>{if(dr)set(fr(e.clientX))});
 const end=e=>{if(!dr)return;dr=false;pr.classList.remove('drag');const v=F.vid(i);if(v&&isFinite(v.duration)){const ts=v._ts||0,te=v._te||v.duration;try{v.currentTime=ts+(te-ts)*fr(e.clientX)}catch(x){}}};
 pr.addEventListener('pointerup',end);pr.addEventListener('pointercancel',()=>{dr=false;pr.classList.remove('drag')})}
function burst(s,x,y){const r=s.getBoundingClientRect();const h=document.createElement('div');h.className='zx-heart';h.style.left=(x-r.left)+'px';h.style.top=(y-r.top)+'px';h.style.setProperty('--r',(Math.random()*30-15)+'deg');h.innerHTML=ic('heart');s.appendChild(h);vb(10);setTimeout(()=>h.remove(),900)}
function syncIt(id,f){root&&stack.forEach(p=>{if(!p.feed)return;p.feed.items.forEach((x,k)=>{if(x.id===id){f(x);const s=p.feed.slide(k);s&&upRail(s,x)}})})}
function upRail(s,it){const l=$('[data-a=like]',s);l.classList.toggle('on',!!it.liked);$('.n',l).textContent=cnt(it.likes);const c=$('[data-a=cmt] .n',s);c.textContent=cnt(it.comments);const sv2=$('[data-a=save]',s);sv2.classList.toggle('on',!!it.saved);$('.n',sv2).textContent=cnt(it.saves);const fb=$('.zx-fol',s);if(fb&&it.u.fol)fb.classList.add('done')}
async function like(F,i,on){const it=F.items[i];const want=on==null?!it.liked:on;const prev=[it.liked,it.likes];const d=want&&!prev[0]?1:!want&&prev[0]?-1:0;syncIt(it.id,x=>{x.liked=want?1:0;x.likes=Math.max(0,(prev[1]||0)+d)});
 const s=F.slide(i);if(s&&want){const b=$('[data-a=like]',s);b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
 const r=await api('vx/like',{id:it.id,on:want});if(r.ok)syncIt(it.id,x=>{x.liked=r.liked?1:0;x.likes=r.likes});else{syncIt(it.id,x=>{x.liked=prev[0];x.likes=prev[1]});say(err(r))}}
async function saveIt(F,i,k){const it=F.items[i];const r=await api('vx/save',{id:it.id,k});if(!r.ok)return say(err(r));if(k==='s'){syncIt(it.id,x=>{x.saved=r.on?1:0;x.saves=r.saves});say(r.on?'🔖 حُفظ في «المحفوظة»':'أُزيل من المحفوظة')}else{syncIt(it.id,x=>{x.later=r.on?1:0});say(r.on?'⏱ أُضيف إلى «شاهد لاحقاً»':'أُزيل من «شاهد لاحقاً»')}}
async function follow(u,btn){if(!u||!u.id)return;const m=await needProfile('أنشئ ملفك لتتابع صنّاع المحتوى.');if(!m)return;if(btn)btn.classList.add('done');
 const r=await api('dw/follow',{u:u.id});if(!r.ok){btn&&btn.classList.remove('done');return say(err(r))}
 stack.forEach(p=>p.feed&&p.feed.items.forEach((x,k)=>{if(x.u.id===u.id){x.u.fol=r.following?1:0;const s=p.feed.slide(k);const fb=s&&$('.zx-fol',s);fb&&fb.classList.toggle('done',!!r.following)}}));
 if(r.following){say('تتابع '+u.name+' ✓');vb(8)}return r}

/* long-press menu: حفظ · شاهد لاحقاً · لا يهمني · إبلاغ · نسخ الرابط · رد بمقطع · صورة داخل صورة · تحميل · السرعة (+ صاحب المقطع: تثبيت، التعليقات، التحميل، السلسلة، حذف) */
function longMenu(F,i){const it=F.items[i];const pip=document.pictureInPictureEnabled&&!(F.vid(i)||{}).disablePictureInPicture;
 const s=sheet(`<div class="zx-menu">
  <button data-m="save"><span>${ic('book')}</span>${it.saved?'إزالة الحفظ':'حفظ'}</button><button data-m="later"><span>${ic('later')}</span>${it.later?'إزالة من لاحقاً':'شاهد لاحقاً'}</button>
  <button data-m="copy"><span>${ic('copy')}</span>نسخ الرابط</button><button data-m="reply"><span>${ic('reply')}</span>ردّ بمقطع</button>
  ${pip?`<button data-m="pip"><span>${ic('pip')}</span>صورة داخل صورة</button>`:''}${it.dl||it.mine?`<button data-m="dl"><span>${ic('dl')}</span>تحميل</button>`:''}
  ${it.mine?`<button data-m="pin"><span>${ic('pin')}</span>تثبيت في ملفي</button><button data-m="set"><span>${ic('edit')}</span>إعدادات المقطع</button><button data-m="del" class="red"><span>${ic('trash')}</span>حذف</button>`:`<button data-m="noint"><span>${ic('noint')}</span>لا يهمني</button><button data-m="report" class="red"><span>${ic('flag')}</span>إبلاغ</button>`}
 </div><div class="zx-row"><b>السرعة</b>${[.5,1,1.5,2].map(x=>`<button class="zx-pill ${+Z.spd===x?'on':''}" data-sp="${x}">${ar(x)}×</button>`).join('')}</div>`);
 $$('[data-sp]',s).forEach(b=>b.onclick=()=>{Z.spd=+b.dataset.sp;sv();POOL.forEach(v=>v.playbackRate=Z.spd);$$('[data-sp]',s).forEach(x=>x.classList.toggle('on',x===b));say('السرعة '+ar(Z.spd)+'×')});
 $$('[data-m]',s).forEach(b=>b.onclick=async()=>{const m=b.dataset.m;s.close();
  if(m==='save')saveIt(F,i,'s');else if(m==='later')saveIt(F,i,'w');else if(m==='copy')copyLink(it);else if(m==='reply')location.hash='vupload/r/'+it.id;
  else if(m==='pip'){const v=F.vid(i);try{await v.requestPictureInPicture()}catch(e){say('جهازك لا يدعم صورة داخل صورة هنا')}}
  else if(m==='dl')download(it);else if(m==='noint'){const r=await api('vx/hide',{id:it.id});if(r.ok){say('حسنًا، سنقلّل من هذا النوع');F.fe.scrollBy({top:F.fe.clientHeight,behavior:'smooth'})}}
  else if(m==='report')report(it);else if(m==='pin'){const r=await api('vx/pin',{id:it.id});say(r.ok?(r.pinned?'📌 ثُبّت في أعلى ملفك':'أُلغي التثبيت'):err(r))}
  else if(m==='set')clipSettings(it);else if(m==='del'){if(!confirm('حذف المقطع نهائيًا؟'))return;const r=await api('vx/del',{id:it.id});if(r.ok){say('حُذف المقطع');const sl=F.slide(i);sl&&(sl.innerHTML='<div class="zx-empty">حُذف هذا المقطع</div>')}else say(err(r))}})}
function copyLink(it){const u=link('video/'+it.id);(navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(()=>say('نُسخ الرابط ✓'),()=>{prompt('انسخ الرابط',u)})}
function report(it){const rs=['محتوى غير لائق','موسيقى','معلومة دينية خاطئة','إساءة أو تنمّر','إزعاج أو إعلان','غير ذلك'];
 const s=sheet(`<h4>الإبلاغ عن المقطع<button class="x">${ic('x')}</button></h4><div style="padding:0 14px 16px;display:flex;flex-direction:column;gap:8px">${rs.map(r=>`<button class="zx-btn zx-gh bl" data-r="${r}">${r}</button>`).join('')}</div>`);
 $$('[data-r]',s).forEach(b=>b.onclick=async()=>{s.close();const r=await vapi('report/'+it.id,{reason:b.dataset.r});say(r.ok?'شكرًا، وصل البلاغ للمشرف':err(r))})}
function clipSettings(it){const s=sheet(`<h4>إعدادات المقطع<button class="x">${ic('x')}</button></h4><div class="zx-f" style="padding-bottom:16px">
 <label>من يمكنه التعليق</label><div class="zx-row" style="padding:0">${[['all','الجميع'],['fol','متابعيني'],['off','لا أحد']].map(([k,t])=>`<button class="zx-pill ${it.cmt===k?'on':''}" data-c="${k}">${t}</button>`).join('')}</div>
 <div class="zx-tg"><span>السماح بالتحميل<small>بعلامة «زاد @${es(it.u.h)}»</small></span><label class="zx-sw"><input type="checkbox" id="zxcsd" ${it.dl?'checked':''}><i></i></label></div>
 <label>السلسلة</label><select id="zxcss"><option value="">بدون سلسلة</option></select></div>`);
 $$('[data-c]',s).forEach(b=>b.onclick=async()=>{const r=await api('vx/edit',{id:it.id,cmt:b.dataset.c});if(r.ok){it.cmt=b.dataset.c;$$('[data-c]',s).forEach(x=>x.classList.toggle('on',x===b));say('تم ✓')}});
 $('#zxcsd',s).onchange=async e=>{const r=await api('vx/edit',{id:it.id,dl:e.target.checked?1:0});if(r.ok){it.dl=e.target.checked?1:0;say('تم ✓')}};
 api('vx/series').then(r=>{const sel=$('#zxcss',s);(r.items||[]).forEach(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.title;if(it.ser&&it.ser.id===x.id)o.selected=true;sel.appendChild(o)});sel.onchange=async()=>{const r2=await api('vx/series',{op:'set',vid:it.id,id:sel.value});say(r2.ok?'تم ✓':err(r2))}})}
/* share: Web Share with the deep link #video/<id>, copy, WhatsApp, «رد بمقطع», download */
function shareSheet(F,i){const it=F.items[i];const u=link('video/'+it.id);const txt=(it.cap||it.t||'مقطع من زاد').replace(/\s+/g,' ').slice(0,90)+(it.u&&it.u.h?' — @'+it.u.h:'');
 const s=sheet(`<h4>مشاركة<button class="x">${ic('x')}</button></h4><div class="zx-menu">
  ${navigator.share?`<button data-s="native"><span>${ic('share')}</span>مشاركة</button>`:''}<button data-s="wa"><span style="background:#25d366">${ic('chat')}</span>واتساب</button><button data-s="copy"><span>${ic('copy')}</span>نسخ الرابط</button>
  <button data-s="reply"><span>${ic('reply')}</span>ردّ بمقطع</button>${it.dl||it.mine?`<button data-s="dl"><span>${ic('dl')}</span>تحميل</button>`:''}${it.u&&it.u.h?`<button data-s="prof"><span>${ic('user')}</span>ملف @${es(it.u.h)}</button>`:''}</div>`);
 const done=()=>api('vx/share',{id:it.id});
 $$('[data-s]',s).forEach(b=>b.onclick=async()=>{const k=b.dataset.s;s.close();
  if(k==='native'){try{await navigator.share({title:'مقاطع زاد',text:txt,url:u});done()}catch(e){}}
  else if(k==='wa'){window.open('https://wa.me/?text='+encodeURIComponent(txt+'\n'+u),'_blank');done()}else if(k==='copy'){copyLink(it);done()}
  else if(k==='reply')location.hash='vupload/r/'+it.id;else if(k==='dl')download(it);else if(k==='prof')location.hash='u/'+it.u.h})}
/* «تحميل»: re-recorded on the phone with a «زاد @user» watermark when the creator allows downloads (canvas + MediaRecorder, real time); official episodes download as is */
async function download(it){if(!it.dl&&!it.mine)return say('صاحب المقطع أوقف التحميل');
 if(it.off||!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){const a=document.createElement('a');a.href=srcU(it)+(it.sz?'&':'?')+'dl=1';a.download='';document.body.appendChild(a);a.click();a.remove();return say('بدأ التحميل')}
 const s=sheet(`<h4>تحميل بعلامة «زاد»</h4><div class="zx-f" style="padding-bottom:18px"><p style="margin:0;font-size:13px;opacity:.75;line-height:1.7">نجهّز نسخة عليها «زاد @${es(it.u.h||'')}». تستغرق مدة المقطع تقريبًا — أبقِ الشاشة مفتوحة.</p><div class="zx-upbar"><i></i></div><div id="zxdlm" style="font-size:13px;opacity:.75">جارٍ التجهيز…</div><button class="zx-btn zx-gh bl x" style="margin-top:12px">إلغاء</button></div>`,{onClose:()=>{dead=1}});
 let dead=0;const bar=$('.zx-upbar i',s),msg=$('#zxdlm',s);
 try{const blob=await (await fetch(srcU(it))).blob();if(dead)return;
  const out=await watermark(blob,it,p=>{bar.style.width=Math.round(p*100)+'%';msg.textContent='جارٍ التجهيز… '+ar(Math.round(p*100))+'٪'},()=>dead);if(dead||!out)return;
  const ext=/mp4/.test(out.type)?'mp4':'webm';const f=new File([out],'zad-'+(it.u.h||'clip')+'-'+it.id.slice(0,6)+'.'+ext,{type:out.type});
  s.close();if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:'مقطع من زاد'});return}catch(e){}}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);say('حُفظ المقطع ✓')}
 catch(e){s.close();say('تعذّر التحميل، جرّب مرة أخرى')}}
function watermark(blob,it,onp,dead){return new Promise((ok,no)=>{const types=['video/mp4;codecs=avc1,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm'];const mt=types.find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}});if(!mt)return no(new Error('nosup'));
 const v=document.createElement('video');v.playsInline=true;v.src=URL.createObjectURL(blob);v.onerror=()=>no(new Error('read'));
 v.onloadedmetadata=()=>{const sc=Math.min(1,1280/Math.max(v.videoWidth,v.videoHeight));const w=Math.round(v.videoWidth*sc/2)*2,h=Math.round(v.videoHeight*sc/2)*2;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const cs=c.captureStream(30);
  let ac=null;try{const AC=window.AudioContext||window.webkitAudioContext;ac=new AC();const so=ac.createMediaElementSource(v),d=ac.createMediaStreamDestination();so.connect(d);d.stream.getAudioTracks().forEach(t=>cs.addTrack(t))}catch(e){v.muted=true}
  const rec=new MediaRecorder(cs,{mimeType:mt,videoBitsPerSecond:2.5e6});const ch=[];rec.ondataavailable=e=>e.data&&e.data.size&&ch.push(e.data);rec.onstop=()=>{URL.revokeObjectURL(v.src);try{ac&&ac.close()}catch(e){}ok(dead()?null:new Blob(ch,{type:mt.split(';')[0]}))};
  const ts=it.ts||0,te=it.te||v.duration;const fs=Math.round(h*.034);const wm='زاد @'+(it.u.h||'');let alive=true;
  const draw=()=>{if(!alive)return;if(dead()){alive=false;v.pause();rec.state!=='inactive'&&rec.stop();return}
   g.filter=fxFilter(it.fx&&it.fx.f)||'none';g.drawImage(v,0,0,w,h);g.filter='none';
   g.font=`800 ${fs}px Cairo,'IBM Plex Sans Arabic',sans-serif`;g.textAlign='right';g.direction='rtl';g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=8;g.fillStyle='rgba(255,255,255,.88)';g.fillText(wm,w-fs*.8,fs*1.6);g.shadowBlur=0;
   onp(Math.min(1,(v.currentTime-ts)/Math.max(.1,te-ts)));if(v.currentTime>=te-.05){alive=false;v.pause();setTimeout(()=>rec.state!=='inactive'&&rec.stop(),150);return}
   v.requestVideoFrameCallback?v.requestVideoFrameCallback(draw):requestAnimationFrame(draw)};
  v.onended=()=>{if(alive){alive=false;setTimeout(()=>rec.state!=='inactive'&&rec.stop(),150)}};
  v.currentTime=ts;v.onseeked=()=>{v.onseeked=null;rec.start(1000);(ac&&ac.resume?ac.resume():Promise.resolve()).then(()=>v.play()).then(draw).catch(e=>{alive=false;no(e)})}}})}

/* ===== comments: bottom sheet, replies one level deep, ♡ on comments, the creator pins one, delete, report, emoji quick-bar ===== */
const EMO=['🤲','❤️','👍','🌹','✨','💯','😊','🕋'];
function cmtHTML(c,rp){return`<div class="zx-c${rp?' rp':''}" data-c="${c.id}">${c.u.h?`<a href="#u/${es(c.u.h)}">${av(c.u,rp?28:36)}</a>`:av(c.u,rp?28:36)}<div class="bd">
 ${c.pinned?`<div class="pinb">${ic('pin')} ثبّته صاحب المقطع</div>`:''}<div class="nm">${es(c.u.name)}${c.u.ver?VER:''}${c.byCreator?'<span class="crt">صاحب المقطع</span>':''}</div>
 <div class="tx">${capHTML(c.text)}</div><div class="ac"><span>${ago(c.at)}</span><button data-r="${c.id}" data-n="${es(c.u.name)}">ردّ</button><button data-o="${c.id}">${ic('more')}</button></div></div>
 <button class="lk ${c.liked?'on':''}" data-l="${c.id}" aria-label="إعجاب بالتعليق">${ic('heart')}<span>${c.likes?cnt(c.likes):''}</span></button></div>`}
async function comments(F,i){const it=F.items[i];let replyTo=null,data=null;
 const s=sheet(`<h4><span class="cn">التعليقات</span><button class="x" aria-label="إغلاق">${ic('x')}</button></h4><div class="zx-cl"><div class="zx-load">جارٍ التحميل…</div></div>
  <div class="zx-rto" hidden><span></span><button class="rx">${ic('x')}</button></div><div class="zx-emo">${EMO.map(e=>`<button data-e="${e}">${e}</button>`).join('')}</div>
  <div class="zx-cin" style="position:relative"><input id="zxzci" maxlength="300" placeholder="أضف تعليقًا…" enterkeyhint="send" autocomplete="off"><button id="zxzcs" aria-label="إرسال" disabled>${ic('send')}</button></div>`);
 s.querySelector('.bx').style.height='72%';
 const L=$('.zx-cl',s),inp=$('#zxzci',s),send=$('#zxzcs',s),rto=$('.zx-rto',s);
 const draw=()=>{const items=data.items||[];$('.cn',s).textContent=(data.n?ar(data.n)+' ':'')+'تعليق';
  L.innerHTML=items.length?items.map(c=>cmtHTML(c)+(c.replies&&c.replies.length?`<button class="zx-showr" data-sr="${c.id}">— عرض الردود (${ar(c.replies.length)})</button><div class="rps" data-p="${c.id}" hidden>${c.replies.map(r=>cmtHTML(r,1)).join('')}</div>`:'')).join(''):`<div class="zx-load">${ic('chat')}<br>لا تعليقات بعد — ابدأ بكلمة طيبة</div>`;
  const dis=data.can==='off'?'صاحب المقطع أوقف التعليقات':data.can==='fol'?'التعليق لمتابعي صاحب المقطع':data.can==='banned'?'حسابك موقوف':'';
  inp.disabled=!!dis;inp.placeholder=dis||(data.can==='profile'?'أنشئ ملفك لتعلّق…':'أضف تعليقًا…');$('.zx-emo',s).style.display=dis?'none':''};
 const load=async()=>{const r=await api('vx/cmts?id='+it.id);if(!r.ok){L.innerHTML=`<div class="zx-load">${err(r)}</div>`;return}data=r;draw();syncIt(it.id,x=>x.comments=r.n)};
 await load();
 inp.oninput=()=>{send.disabled=!inp.value.trim();acFor(inp,$('.zx-cin',s))};
 inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();send.click()}};
 inp.onfocus=async()=>{if(data&&data.can==='profile'){inp.blur();const m=await needProfile('أنشئ ملفك لتعلّق وتتفاعل.');if(m)load()}};
 $$('[data-e]',s).forEach(b=>b.onclick=()=>{inp.value+=b.dataset.e;send.disabled=false;inp.focus()});
 $('.rx',s).onclick=()=>{replyTo=null;rto.hidden=true};
 send.onclick=async()=>{const t=inp.value.trim();if(!t)return;const m=await needProfile('أنشئ ملفك لتعلّق.');if(!m)return;send.disabled=true;
  const r=await api('vx/cmt',{id:it.id,text:t,parent:replyTo});send.disabled=false;if(!r.ok)return say(err(r));inp.value='';replyTo=null;rto.hidden=true;vb(8);await load();
  if(r.item.parent){const rp=$('.rps[data-p="'+r.item.parent+'"]',L);if(rp)rp.hidden=false}const el=$('[data-c="'+r.item.id+'"]',L);el&&el.scrollIntoView({block:'center'})};
 L.addEventListener('click',async e=>{const t=e.target.closest('button,a');if(!t)return;
  if(t.dataset.sr){const rp=$('.rps[data-p="'+t.dataset.sr+'"]',L);rp.hidden=!rp.hidden;t.textContent=rp.hidden?t.textContent.replace('إخفاء','عرض'):t.textContent.replace('عرض','إخفاء');return}
  if(t.dataset.r){replyTo=t.dataset.r;rto.hidden=false;$('span',rto).textContent='ردّ على '+t.dataset.n;inp.focus();return}
  if(t.dataset.l){const m=await needProfile('أنشئ ملفك لتتفاعل.');if(!m)return;const r=await api('vx/cml',{id:t.dataset.l});if(!r.ok)return say(err(r));t.classList.toggle('on',!!r.liked);$('span',t).textContent=r.likes?cnt(r.likes):'';r.liked&&vb(6);return}
  if(t.dataset.o){const cid=t.dataset.o;const c=findC(data.items,cid);if(!c)return;
   const m=sheet(`<div class="zx-menu">${data.creator&&!isReply(data.items,cid)?`<button data-x="pin"><span>${ic('pin')}</span>${c.pinned?'إلغاء التثبيت':'تثبيت'}</button>`:''}<button data-x="copy"><span>${ic('copy')}</span>نسخ</button>${c.del?`<button data-x="del" class="red"><span>${ic('trash')}</span>حذف</button>`:''}${!c.mine?`<button data-x="rep" class="red"><span>${ic('flag')}</span>إبلاغ</button>`:''}</div>`);
   $$('[data-x]',m).forEach(b=>b.onclick=async()=>{m.close();const x=b.dataset.x;
    if(x==='pin'){const r=await api('vx/cpin',{id:cid});if(!r.ok)return say(err(r));say(r.pinned?'📌 ثُبّت التعليق':'أُلغي التثبيت');load()}
    else if(x==='copy'){try{await navigator.clipboard.writeText(c.text);say('نُسخ ✓')}catch(e){}}
    else if(x==='del'){if(!confirm('حذف التعليق؟'))return;const r=await api('vx/cdel',{id:cid});if(!r.ok)return say(err(r));say('حُذف التعليق');load()}
    else if(x==='rep'){const r=await vapi('creport/'+cid,{reason:'تعليق مسيء'});say(r.ok?'شكرًا، وصل البلاغ':err(r))}})}})}
const findC=(a,id)=>{for(const c of a||[]){if(c.id===id)return c;for(const r of c.replies||[])if(r.id===id)return r}return null};
const isReply=(a,id)=>(a||[]).some(c=>(c.replies||[]).some(r=>r.id===id));
/* @mention / #hashtag autocomplete under a text field */
function acFor(inp,box){clearTimeout(inp._ac);const v=inp.value,pos=inp.selectionStart||v.length;const m=/(^|\s)([@#][\p{L}\p{N}_.]{1,20})$/u.exec(v.slice(0,pos));const old=$('.zx-ac',box);
 if(!m){old&&old.remove();return}inp._ac=setTimeout(async()=>{const r=await api('vx/ac?q='+encodeURIComponent(m[2]));let el=$('.zx-ac',box);
  const rows=m[2][0]==='@'?(r.users||[]).map(u=>`<button data-v="@${es(u.h)}">${av(u,28)}<span>${es(u.name)}${u.ver?VER:''} <small dir="ltr">@${es(u.h)}</small></span></button>`):(r.tags||[]).map(t=>`<button data-v="#${es(t.tag)}"><b style="width:28px;text-align:center">#</b><span>${es(t.tag)} <small>${ar(t.n)} مقطع</small></span></button>`);
  if(!rows.length){el&&el.remove();return}if(!el){el=document.createElement('div');el.className='zx-ac';box.appendChild(el)}el.innerHTML=rows.join('');
  $$('button',el).forEach(b=>b.onmousedown=b.ontouchstart=e=>{e.preventDefault();const before=v.slice(0,pos).replace(/[@#][\p{L}\p{N}_.]{1,20}$/u,b.dataset.v+' ');inp.value=before+v.slice(pos);el.remove();inp.focus();inp.dispatchEvent(new Event('input'))})},220)}

/* ===== grids → a vertical feed of that list ===== */
let CTX=null; // the list a grid tap opened (so #video/<id> plays inside it)
function gridHTML(items,o){o=o||{};return items.map((it,k)=>`<a class="zx-g" href="#video/${it.id}" data-k="${k}" style="${it.poster?`background-image:url('${posterU(it)}')`:''}">
 ${it.pinned?'<span class="zx-bdg">مثبّت</span>':it.sched?`<span class="zx-bdg gr">${ic('clock','')}مجدول</span>`:it.hidden?'<span class="zx-bdg gr">مخفي</span>':it.off&&o.gold?'<span class="zx-bdg gold">رسمية</span>':''}
 ${o.cap?`<span class="ct">${es((it.cap||it.t||'').slice(0,60))}</span>`:''}<span class="vw">${ic('play')}${cnt(it.views)}</span></a>`).join('')}
function bindGrid(el,getItems,title,loadMore){el.addEventListener('click',e=>{const a=e.target.closest('.zx-g');if(!a)return;const items=getItems();const k=+a.dataset.k;if(!items[k])return;e.preventDefault();CTX={items:items.slice(),start:k,title,load:loadMore};location.hash='video/'+items[k].id})}
/* ===== profile #u/<handle> ===== */
function profilePage(h,sid){const el=page('',`<div class="zx-load">جارٍ التحميل…</div>`);let U=null,tab='v',items=[],next=null,busy=false,ser=sid||null;
 const P={el,onShow:()=>{curNav=U&&U.me?'u':'';navOn(curNav)},refresh:()=>draw(true)};
 async function draw(full){const r=await api('vx/user?h='+encodeURIComponent(h)+'&tab='+(ser?'ser&sid='+ser:tab));
  if(!r.ok){el.innerHTML=hdr('')+`<div class="zx-empty" style="position:static;padding:80px 30px">${ic('user')}<b>${err(r,'الحساب غير موجود')}</b></div>`;bindBack(el);return}
  U=r.user;items=r.items||[];next=r.next;curNav=U.me?'u':'';navOn(curNav);
  const series=U.series||[];
  el.innerHTML=hdr(`${es(U.name)}${U.ver?VER:''}`,`<button class="zx-ib" id="zxupm" aria-label="المزيد">${ic('more')}</button>`)+`
  <div class="zx-pf">${av(U,96)}<h2><span dir="ltr">@${es(U.h)}</span>${U.ver?VER:''}</h2><div class="hd">${es(U.name)}</div>
   <div class="zx-cnt"><a href="#diwan/f/${U.id}/ing"><b>${cnt(U.following)}</b>يتابع</a><a href="#diwan/f/${U.id}/ers"><b class="fcn">${cnt(U.followers)}</b>متابِعون</a><span><b>${cnt(U.likes)}</b>إعجابات</span></div>
   <div class="zx-pfb">${U.me?`<button class="zx-btn zx-gh" id="zxped">${ic('edit')}تعديل الملف</button><a class="zx-btn zx-gh zx-sq" href="#vstats" aria-label="إحصائياتي">${ic('chart')}</a><button class="zx-btn zx-gh zx-sq" id="zxpsh" aria-label="مشاركة الملف">${ic('share')}</button>`
    :U.blocked?`<button class="zx-btn zx-gh" id="zxpub">إلغاء الحظر</button>`:`<button class="zx-btn ${U.following?'zx-gh':''}" id="zxpfo">${U.following?'تتابعه':U.followsMe?'تابِعه أيضًا':'متابعة'}</button><a class="zx-btn zx-gh zx-sq" href="#diwan/u/${U.id}" aria-label="تغريداته في الديوانية">${ic('chat')}</a><button class="zx-btn zx-gh zx-sq" id="zxpsh" aria-label="مشاركة الملف">${ic('share')}</button>`}</div>
   ${U.bio?`<div class="zx-bio">${capHTML(U.bio)}</div>`:''}${U.followsMe&&!U.me?'<div class="zx-fm">يتابعك</div>':''}${U.off?'<div class="zx-fm" style="color:#ffe2a8">الحساب الرسمي لقناة «عمار» · حلقة جديدة كل يوم إن شاء الله</div>':''}</div>
  <div id="zxpsug"></div>
  ${series.length?`<div class="zx-sers">${series.map(x=>`<a class="zx-ser ${x.id==='off'?'gold':''}${ser===x.id?' on':''}" href="#u/${es(U.h)}/s/${x.id}" ${ser===x.id?'style="background:#fff;color:#111"':''}>${ic('list')} ${es(x.title)} <small>${ar(x.n)}</small></a>`).join('')}${U.me?`<button class="zx-ser" id="zxpnser">${ic('plus')} سلسلة</button>`:''}</div>`:U.me?`<div class="zx-sers"><button class="zx-ser" id="zxpnser">${ic('plus')} سلسلة جديدة</button></div>`:''}
  ${ser?`<div class="zx-sec"><span>${ic('list','')}${es((r.series&&r.series.title)||'سلسلة')}</span><a href="#u/${es(U.h)}" style="font-size:12.5px;opacity:.7">كل المقاطع</a></div>`:`<div class="zx-ptabs"><button data-t="v" class="${tab==='v'?'on':''}">${ic('grid')}المقاطع</button>${U.me?`<button data-t="s" class="${tab==='s'?'on':''}">${ic('book')}المحفوظة</button><button data-t="w" class="${tab==='w'?'on':''}">${ic('later')}لاحقاً</button>`:''}${U.me||U.likesPub?`<button data-t="l" class="${tab==='l'?'on':''}">${U.me&&!U.likesPub?ic('lock'):ic('heart')}أعجبني</button>`:''}</div>`}
  <div class="zx-grid">${items.length?gridHTML(items,{gold:1}):`<div class="zx-gempty">${U.blocked?'حظرت هذا الحساب':tab==='v'?(U.me?`لم تنشر مقاطع بعد<br><a class="zx-btn" style="margin-top:12px" href="#vupload">${ic('plus')}انشر أول مقطع</a>`:'لا مقاطع بعد'):tab==='s'?'اضغط 🔖 على أي مقطع ليظهر هنا':tab==='w'?'«شاهد لاحقاً» من قائمة المقطع (ضغطة مطوّلة)':'لا إعجابات بعد'}</div>`}</div>
  ${U.me&&tab==='l'&&!ser?`<div class="zx-fm" style="text-align:center;padding:10px">${U.likesPub?'«أعجبني» ظاهر للناس':'🔒 «أعجبني» خاص بك — غيّرها من «تعديل الملف»'}</div>`:''}`;
  bindBack(el);bindGrid(el,()=>items,U.me?'مقاطعي':'@'+U.h,next!=null?async c=>api('vx/user?h='+encodeURIComponent(h)+'&tab='+tab+'&c='+c):null);
  $$('.zx-ptabs button',el).forEach(b=>b.onclick=()=>{tab=b.dataset.t;draw()});
  const fo=$('#zxpfo',el);if(fo)fo.onclick=async()=>{const r2=await follow(U,null);if(!r2)return;U.following=r2.following?1:0;fo.textContent=U.following?'تتابعه':'متابعة';fo.classList.toggle('zx-gh',!!U.following);$('.fcn',el).textContent=cnt(r2.followers);if(U.following)suggest(U)};
  const ub=$('#zxpub',el);if(ub)ub.onclick=()=>block(U);const ed=$('#zxped',el);if(ed)ed.onclick=()=>{ME=ME||{id:U.id,name:U.name,bio:U.bio,h:U.h,pat:U.pat,likesPub:U.likesPub,push:1};profileSheet(null)};
  const sh=$('#zxpsh',el);if(sh)sh.onclick=()=>shareProfile(U);const ns=$('#zxpnser',el);if(ns)ns.onclick=newSeries;
  $('#zxupm',el).onclick=()=>{const m=sheet(`<div class="zx-menu"><button data-x="share"><span>${ic('share')}</span>مشاركة الملف</button><button data-x="qr"><span>${ic('qr')}</span>رمزي QR</button><button data-x="copy"><span>${ic('copy')}</span>نسخ الرابط</button>
   ${U.me?`<button data-x="drafts"><span>${ic('draft')}</span>المسودات</button><button data-x="stats"><span>${ic('chart')}</span>إحصائياتي</button><button data-x="time"><span>${ic('clock')}</span>وقت التصفح</button>`:`<button data-x="block" class="red"><span>${ic('block')}</span>${U.blocked?'إلغاء الحظر':'حظر'}</button>`}</div>`);
   $$('[data-x]',m).forEach(b=>b.onclick=()=>{m.close();const x=b.dataset.x;if(x==='share')shareProfile(U);else if(x==='qr')qrSheet(U);else if(x==='copy'){navigator.clipboard&&navigator.clipboard.writeText(link('u/'+U.h)).then(()=>say('نُسخ ✓'))}
    else if(x==='drafts')location.hash='vdrafts';else if(x==='stats')location.hash='vstats';else if(x==='time')timeSheet();else if(x==='block')block(U)})};
  const sc=el.closest('.zx-page');el.onscroll=()=>{if(next!=null&&!busy&&!ser&&el.scrollTop+el.clientHeight*1.5>el.scrollHeight){busy=true;api('vx/user?h='+encodeURIComponent(h)+'&tab='+tab+'&c='+next).then(r2=>{busy=false;if(!r2.ok)return;const n0=items.length;items.push(...(r2.items||[]));next=r2.next;$('.zx-grid',el).insertAdjacentHTML('beforeend',gridHTML(items.slice(n0),{gold:1}).replace(/data-k="(\d+)"/g,(m2,k)=>`data-k="${+k+n0}"`))})}}}
 draw();return P}
async function block(U){const on=!U.blocked;if(on&&!confirm('حظر '+U.name+'؟ لن ترى مقاطعه ولن يستطيع متابعتك أو التعليق لديك.'))return;const m=await needProfile();if(!m)return;const r=await api('dw/block',{u:U.id});if(!r.ok)return say(err(r));say(r.blocked?'تم الحظر':'أُلغي الحظر');rerender()}
async function suggest(U){const box=$('#zxpsug',topPage().el);if(!box)return;const r=await api('vx/suggest?after='+U.id);if(!r.ok||!(r.items||[]).length){box.innerHTML='';return}
 box.innerHTML=`<div class="zx-sug"><h5>اقتراح حسابات<button id="zxsgx">إخفاء</button></h5><div class="zx-hs">${r.items.map(u=>`<div class="zx-uc"><a href="#u/${es(u.h)}">${av(u,58)}</a><b>${es(u.name)}${u.ver?VER:''}</b><small>@${es(u.h)}</small><button class="zx-btn" data-f="${u.id}">متابعة</button></div>`).join('')}</div></div>`;
 $('#zxsgx',box).onclick=()=>box.innerHTML='';$$('[data-f]',box).forEach(b=>b.onclick=async()=>{const u=r.items.find(x=>x.id===b.dataset.f);const r2=await follow(u,null);if(r2&&r2.following){b.textContent='تتابعه';b.classList.add('zx-gh')}})}
async function newSeries(){const t=prompt('اسم السلسلة (مثال: سلسلة أذكار الصباح)');if(!t)return;const r=await api('vx/series',{op:'new',title:t});if(!r.ok)return say(err(r));say('أُنشئت السلسلة — أضف لها مقاطعك من «إعدادات المقطع» أو عند الرفع');rerender()}
function timeSheet(){const s=sheet(`<h4>تذكير وقت التصفح<button class="x">${ic('x')}</button></h4><div class="zx-f" style="padding-bottom:16px"><p style="margin:0;font-size:13px;opacity:.75;line-height:1.7">نذكّرك بعد مدة من التصفح: «استغفر الله وقم».</p>
 <div class="zx-tg"><span>التذكير مفعّل</span><label class="zx-sw"><input type="checkbox" id="zxstn" ${Z.st.on?'checked':''}><i></i></label></div>
 <div class="zx-row" style="padding:12px 0 0">${[15,30,45,60].map(m=>`<button class="zx-pill ${+Z.st.min===m?'on':''}" data-m="${m}">${ar(m)} دقيقة</button>`).join('')}</div></div>`);
 $('#zxstn',s).onchange=e=>{Z.st.on=e.target.checked?1:0;sv()};$$('[data-m]',s).forEach(b=>b.onclick=()=>{Z.st.min=+b.dataset.m;sv();$$('[data-m]',s).forEach(x=>x.classList.toggle('on',x===b))})}

/* ===== share profile: link + a share card image (canvas, with the QR) ===== */
let QRP=null;const qrLib=()=>window.qrcode?Promise.resolve(window.qrcode):QRP||(QRP=new Promise((ok,no)=>{const s=document.createElement('script');s.crossOrigin='anonymous';s.src=(ZS.ZC||'https://zad-content.sites.tab.bot/x/')+'zqr.js?v=5.4.3';s.onload=()=>window.qrcode?ok(window.qrcode):no();s.onerror=()=>{QRP=null;no()};document.head.appendChild(s)}));
async function qrCanvas(text,px){const q=(await qrLib())(0,'M');q.addData(unescape(encodeURIComponent(text)));q.make();const n=q.getModuleCount(),m=2,sz=Math.floor(px/(n+m*2));const c=document.createElement('canvas');c.width=c.height=sz*(n+m*2);const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.fillStyle='#161823';
 for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k)){g.beginPath();if(g.roundRect)g.roundRect((k+m)*sz,(r+m)*sz,sz,sz,sz*.28);else g.rect((k+m)*sz,(r+m)*sz,sz,sz);g.fill()}return c}
async function qrSheet(U){const s=sheet(`<h4>رمزي<button class="x">${ic('x')}</button></h4><div style="padding:0 16px 18px;text-align:center"><div class="zx-qr"><div id="zxqrb" style="aspect-ratio:1;display:flex;align-items:center;justify-content:center">جارٍ التجهيز…</div><div style="margin-top:10px;font-weight:800;font-size:16px">@${es(U.h)}${U.ver?VER:''}</div><div style="font-size:12px;opacity:.6">امسحه بكاميرا الجوال ليفتح ملفه في زاد</div></div>
 <button class="zx-btn bl" id="zxqrs">${ic('share')}مشاركة بطاقة الملف</button></div>`);
 try{const c=await qrCanvas(link('u/'+U.h),560);c.style.width='100%';const b=$('#zxqrb',s);b.innerHTML='';b.appendChild(c)}catch(e){$('#zxqrb',s).textContent='تعذّر تجهيز الرمز، تأكد من الاتصال'}
 $('#zxqrs',s).onclick=()=>{s.close();shareProfile(U,true)}}
async function profileCard(U){const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const off=U.id===OFF;const pc=off?['#0f4c4a','#d4a24c']:PAL[hsh(U.id)%PAL.length];
 const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#1d2545');gr.addColorStop(1,pc[0]);g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.globalAlpha=.08;g.strokeStyle='#fff';g.lineWidth=3;for(let y=-60;y<H+60;y+=120)for(let x=-60;x<W+60;x+=120){g.save();g.translate(x,y);for(let k=0;k<2;k++){g.rotate(Math.PI/4*k);g.strokeRect(-34,-34,68,68)}g.restore()}g.globalAlpha=1;
 g.strokeStyle='rgba(212,162,76,.85)';g.lineWidth=6;g.strokeRect(40,40,W-80,H-80);
 try{await document.fonts.load('800 60px Cairo');await document.fonts.load('400 40px "IBM Plex Sans Arabic"')}catch(e){}
 const cx=W/2;g.save();g.beginPath();g.arc(cx,250,120,0,Math.PI*2);g.closePath();g.fillStyle=pc[0];g.fill();g.clip();
 const pat=off?0:(+U.pat||0)%PATS.length;if(pat){const img=new Image();const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="240" height="240"><rect width="40" height="40" fill="${pc[0]}"/>${PATS[pat].replace(/B/g,pc[1])}</svg>`;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await new Promise(r=>{img.onload=r;img.onerror=r});g.drawImage(img,cx-120,130,240,240)}
 else{g.fillStyle=off?'#d4a24c':'#fff';g.font='800 120px Cairo,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText([...String(U.name||'؟')][0],cx,258)}g.restore();
 g.lineWidth=8;g.strokeStyle=off?'#d4a24c':'#fff';g.beginPath();g.arc(cx,250,124,0,Math.PI*2);g.stroke();
 g.direction='rtl';g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle='#fff';g.font='800 64px Cairo,sans-serif';g.fillText(U.name+(U.ver?' ✓':''),cx,460);
 g.direction='ltr';g.font='600 40px Cairo,sans-serif';g.fillStyle='rgba(255,255,255,.75)';g.fillText('@'+U.h,cx,520);g.direction='rtl';
 const cs=[['متابِعون',U.followers],['إعجابات',U.likes],['مقطع',U.clips]];cs.forEach(([t,n],k)=>{const x=W/2+(1-k)*280;g.fillStyle='#fff';g.font='800 56px Cairo,sans-serif';g.fillText(ar(cnt(n)).replace(/ألف/,'k'),x,630);g.fillStyle='rgba(255,255,255,.7)';g.font='500 32px Cairo,sans-serif';g.fillText(t,x,675)});
 try{const q=await qrCanvas(link('u/'+U.h),380);g.fillStyle='#fff';if(g.roundRect){g.beginPath();g.roundRect(cx-210,740,420,420,28);g.fill()}else g.fillRect(cx-210,740,420,420);g.drawImage(q,cx-190,760,380,380)}catch(e){}
 g.fillStyle='#d4a24c';g.font='800 46px Cairo,sans-serif';g.fillText((typeof APP_NAME!=='undefined'?APP_NAME:'زاد')+' · مقاطع',cx,1225);g.fillStyle='rgba(255,255,255,.6)';g.font='500 28px Cairo,sans-serif';g.direction='ltr';g.fillText(location.host,cx,1272);
 return new Promise(ok=>c.toBlob(ok,'image/jpeg',.9))}
async function shareProfile(U,card){const u=link('u/'+U.h);const txt='تابع @'+U.h+' على مقاطع زاد';
 if(!card){const s=sheet(`<h4>مشاركة الملف<button class="x">${ic('x')}</button></h4><div class="zx-menu">${navigator.share?`<button data-s="n"><span>${ic('share')}</span>مشاركة الرابط</button>`:''}<button data-s="w"><span style="background:#25d366">${ic('chat')}</span>واتساب</button><button data-s="c"><span>${ic('copy')}</span>نسخ الرابط</button><button data-s="i"><span>${ic('image')}</span>بطاقة الملف</button><button data-s="q"><span>${ic('qr')}</span>رمزي QR</button></div>`);
  $$('[data-s]',s).forEach(b=>b.onclick=async()=>{s.close();const k=b.dataset.s;if(k==='n'){try{await navigator.share({title:'مقاطع زاد',text:txt,url:u})}catch(e){}}else if(k==='w')window.open('https://wa.me/?text='+encodeURIComponent(txt+'\n'+u),'_blank');else if(k==='c'){navigator.clipboard&&navigator.clipboard.writeText(u).then(()=>say('نُسخ ✓'))}else if(k==='i')shareProfile(U,true);else qrSheet(U)});return}
 say('جارٍ تجهيز البطاقة…');try{const b=await profileCard(U);const f=new File([b],'zad-'+U.h+'.jpg',{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],text:txt+'\n'+u});return}catch(e){if(e&&e.name==='AbortError')return}}
  const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);say('حُفظت البطاقة ✓')}catch(e){say('تعذّر تجهيز البطاقة')}}

/* ===== discover #explore ===== */
function userRow(u){return`<div class="zx-ur"><a href="#u/${es(u.h)}">${av(u,48)}</a><a class="bd" href="#u/${es(u.h)}"><b>${es(u.name)}${u.ver?VER:''}</b><small dir="ltr">@${es(u.h)}</small>${u.followers!=null?`<small> · ${cnt(u.followers)} متابِع</small>`:''}</a>${ME&&u.id===ME.id?'':`<button class="zx-btn" data-f="${u.id}">متابعة</button>`}</div>`}
function bindFollow(el,users){$$('[data-f]',el).forEach(b=>b.onclick=async e=>{e.preventDefault();const u=users.find(x=>x.id===b.dataset.f);const r=await follow(u,null);if(r){b.textContent=r.following?'تتابعه':'متابعة';b.classList.toggle('zx-gh',!!r.following)}})}
function explorePage(q0){const el=page('',`<div class="zx-hd"><button class="zx-ib zbk" aria-label="رجوع">${ic('back')}</button><label class="zx-sb">${ic('search')}<input type="search" id="zxxq" placeholder="ابحث عن حسابات، #وسوم، مقاطع" value="${es(q0||'')}" enterkeyhint="search"></label></div><div id="zxxb"><div class="zx-load">جارٍ التحميل…</div></div>`);
 bindBack(el);const B=$('#zxxb',el),inp=$('#zxxq',el);let items=[],next=null,seg='all';
 const P={el,onShow:()=>{curNav='explore';navOn(curNav)},refresh:()=>run(inp.value)};
 async function home(){const r=await api('vx/explore');if(!r.ok){B.innerHTML=`<div class="zx-load">${err(r)}</div>`;return}items=r.clips||[];next=r.next;
  B.innerHTML=`${(r.trending||[]).length?`<div class="zx-sec">الوسوم الرائجة</div><div class="zx-trs">${r.trending.map((t,k)=>`<a class="zx-tr" href="#tag/${encodeURIComponent(t.tag)}"><i>#</i><span>${es(t.tag)}<br><small>${ar(t.n)} مقطع</small></span></a>`).join('')}</div>`:''}
   ${(r.users||[]).length?`<div class="zx-sug"><h5>حسابات مقترحة</h5><div class="zx-hs">${r.users.map(u=>`<div class="zx-uc"><a href="#u/${es(u.h)}">${av(u,58)}</a><b>${es(u.name)}${u.ver?VER:''}</b><small>@${es(u.h)}</small>${ME&&u.id===ME.id?'':`<button class="zx-btn" data-f="${u.id}">متابعة</button>`}</div>`).join('')}</div></div>`:''}
   <div class="zx-sec">الأكثر مشاهدة هذا الأسبوع</div><div class="zx-grid" style="margin-top:8px">${items.length?gridHTML(items,{cap:1,gold:1}):'<div class="zx-gempty">لا مقاطع بعد</div>'}</div>`;
  bindFollow(B,r.users||[]);bindGrid(B,()=>items,'الأكثر مشاهدة',next!=null?c=>api('vx/explore?c='+c).then(x=>({items:x.clips,next:x.next})):null)}
 async function run(q){q=(q||'').trim();if(!q)return home();B.innerHTML='<div class="zx-load">جارٍ البحث…</div>';const r=await api('vx/explore?q='+encodeURIComponent(q));if(!r.ok){B.innerHTML=`<div class="zx-load">${err(r)}</div>`;return}items=r.clips||[];
  const us=r.users||[],tg=r.tags||[];
  B.innerHTML=`<div class="zx-seg">${[['all','الكل'],['u','حسابات'],['t','وسوم'],['v','مقاطع']].map(([k,t])=>`<button class="zx-pill ${seg===k?'on':''}" data-g="${k}">${t}</button>`).join('')}</div>
   ${seg==='all'||seg==='u'?`<div class="zx-sec">حسابات</div><div class="zx-ul">${us.length?us.slice(0,seg==='u'?20:4).map(userRow).join(''):'<div class="zx-load" style="padding:14px">لا حسابات بهذا الاسم</div>'}</div>`:''}
   ${seg==='all'||seg==='t'?`<div class="zx-sec">وسوم</div><div class="zx-trs">${tg.length?tg.map(t=>`<a class="zx-tr" href="#tag/${encodeURIComponent(t.tag)}"><i>#</i><span>${es(t.tag)}<br><small>${ar(t.n)} مقطع</small></span></a>`).join(''):'<span style="opacity:.6;font-size:13px">لا وسوم</span>'}</div>`:''}
   ${seg==='all'||seg==='v'?`<div class="zx-sec">مقاطع</div><div class="zx-grid" style="margin-top:8px">${items.length?gridHTML(items,{cap:1}):'<div class="zx-gempty">لا مقاطع تطابق البحث</div>'}</div>`:''}`;
  $$('[data-g]',B).forEach(b=>b.onclick=()=>{seg=b.dataset.g;run(q)});bindFollow(B,us);bindGrid(B,()=>items,'نتائج «'+q+'»')}
 let tq;inp.oninput=()=>{clearTimeout(tq);tq=setTimeout(()=>run(inp.value),380)};inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();inp.blur();run(inp.value)}};
 run(q0);if(!q0)setTimeout(()=>{},0);return P}
/* ===== hashtag page #tag/<name> ===== */
function tagPage(t){const el=page('',hdr('#'+es(t))+'<div class="zx-load">جارٍ التحميل…</div>');bindBack(el);let items=[];
 const P={el,onShow:()=>{curNav='explore';navOn(curNav)}};
 api('vx/tag?t='+encodeURIComponent(t)).then(r=>{if(!r.ok){$('.zx-load',el).textContent=err(r);return}items=r.items||[];
  el.innerHTML=hdr('#'+es(r.tag),`<button class="zx-ib" id="zxtgs" aria-label="مشاركة">${ic('share')}</button>`)+`<div class="zx-taghd"><div class="sym">#</div><div><h2>${es(r.tag)}</h2><p>${ar(r.n)} مقطع · ${cnt(r.views)} مشاهدة</p><p style="font-size:11.5px">وسوم فقط — بلا أصوات ولا موسيقى</p></div></div>
   <div style="padding:0 14px 12px"><a class="zx-btn bl" href="#vupload/t/${encodeURIComponent(r.tag)}">${ic('plus')}انشر مقطعًا بهذا الوسم</a></div><div class="zx-grid">${items.length?gridHTML(items,{gold:1}):'<div class="zx-gempty">لا مقاطع بهذا الوسم بعد</div>'}</div>`;
  bindBack(el);bindGrid(el,()=>items,'#'+r.tag,r.next!=null?c=>api('vx/tag?t='+encodeURIComponent(t)+'&c='+c):null);
  $('#zxtgs',el).onclick=async()=>{const u=link('tag/'+encodeURIComponent(r.tag));try{if(navigator.share)await navigator.share({title:'#'+r.tag,url:u});else{await navigator.clipboard.writeText(u);say('نُسخ ✓')}}catch(e){}}});return P}
/* ===== notifications (the Diwaniya bell: sc_dw_notif) ===== */
const NK={vlike:['heart','#fe2c55','أعجبه مقطعك'],vcmt:['chat','#20d5ec','علّق على مقطعك'],vrpl:['reply','#20d5ec','ردّ على تعليقك'],vcl:['heart','#fe2c55','أعجبه تعليقك'],vmen:['user','#d4a24c','أشار إليك في مقطع'],vcmen:['user','#d4a24c','أشار إليك في تعليق'],vrep:['reply','#c0693f','ردّ على مقطعك بمقطع'],follow:['user','#7c6cf0','بدأ يتابعك'],like:['heart','#c0393f','أعجبته تغريدتك'],reply:['reply','#2d5f86','ردّ عليك في الديوانية'],repost:['share','#2f7a4f','أعاد نشر تغريدتك'],quote:['chat','#5b4b8a','اقتبس تغريدتك']};
function notifPage(){const el=page('',hdr('التنبيهات')+'<div class="zx-load">جارٍ التحميل…</div>');bindBack(el);
 const P={el,onShow:()=>{curNav='vnotif';navOn(curNav)}};
 (async()=>{const m=await loadMe();if(!m){el.innerHTML=hdr('التنبيهات')+`<div class="zx-empty" style="position:static;padding:70px 30px">${ic('bell')}<b>أنشئ ملفك لتصلك التنبيهات</b><span>إعجابات وتعليقات ومتابعات وإشارات</span><button class="zx-btn" id="zxnmk">أنشئ ملفي</button></div>`;bindBack(el);$('#zxnmk',el).onclick=()=>needProfile().then(x=>x&&rerender());return}
  const r=await api('dw/notifs');UNREAD=0;navOn('vnotif');try{window.ZB6&&ZB6.unread&&ZB6.unread()}catch(e){}
  const items=(r.items||[]);const vids=items.filter(n=>n.k[0]==='v'||n.k==='follow');
  el.innerHTML=hdr('التنبيهات')+(vids.length?vids.map(n=>{const k=NK[n.k]||NK.vlike;const href=n.k==='follow'?'#u/'+n.u.id:'#video/'+String(n.pid||'').split(':')[1];return`<a class="zx-nt${n.new?' new':''}" href="${href}">${av(n.u,44)}<span class="bd"><b>${es(n.u.name)}</b> ${k[2]}${n.t?`<small>«${es(n.t.slice(0,60))}»</small>`:''}<small>${ago(n.at)}</small></span><span class="zx-k" style="background:${k[1]}">${ic(k[0])}</span></a>`}).join(''):`<div class="zx-empty" style="position:static;padding:70px 30px">${ic('bell')}<b>لا تنبيهات بعد</b><span>هنا يظهر من أعجبه مقطعك أو علّق أو تابعك</span></div>`)+
   (items.length>vids.length?`<div style="padding:14px;text-align:center"><a class="zx-btn zx-gh" href="#diwan/n">تنبيهات الديوانية (${ar(items.length-vids.length)})</a></div>`:'')+
   `<div style="padding:4px 16px 16px;text-align:center"><button class="zx-btn zx-gh" id="zxnpu">${ic('bell')}تنبيهات المقاطع على الجوال</button></div>`;
  bindBack(el);$('#zxnpu',el).onclick=async()=>{if(!('Notification' in window)||Notification.permission!=='granted'){say('فعّل تنبيهات زاد من الإعدادات أولًا');location.hash='push';return}await pushLink(true);await api('vx/prof',{push:1});say('✓ ستصلك تنبيهات المقاطع على الجوال')}})();return P}

/* ===== «إحصائياتي» ===== */
function bars(vals,days,color){const W=320,H=100,n=vals.length,mx=Math.max(1,...vals),bw=W/n;let s='';vals.forEach((v,k)=>{const h=Math.max(v?3:1,(v/mx)*(H-18));const x=W-(k+1)*bw;s+=`<rect x="${(x+bw*.18).toFixed(1)}" y="${(H-14-h).toFixed(1)}" width="${(bw*.64).toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${color}" opacity="${v?1:.25}"><title>${days[k]}: ${v}</title></rect>`});
 const lab=k=>{const d=days[k].slice(5).split('-');return ar(+d[1])+'/'+ar(+d[0])};s+=`<text x="${W-2}" y="${H-1}" font-size="9" fill="rgba(255,255,255,.5)" text-anchor="end">${lab(0)}</text><text x="2" y="${H-1}" font-size="9" fill="rgba(255,255,255,.5)">${lab(n-1)}</text><text x="${W-2}" y="10" font-size="9" fill="rgba(255,255,255,.5)" text-anchor="end">${ar(mx)}</text>`;
 return`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img">${s}</svg>`}
function statsPage(){const el=page('',hdr('إحصائياتي')+'<div class="zx-load">جارٍ التحميل…</div>');bindBack(el);let d=7;
 const P={el,onShow:()=>{curNav='u';navOn(curNav)}};
 async function draw(){const m=await needProfile('أنشئ ملفك لترى إحصائياتك.');if(!m){back();return}const r=await api('vx/stats?d='+d);if(!r.ok){$('.zx-load',el)&&($('.zx-load',el).textContent=err(r));return}const T=r.totals||{};const sum=a=>a.reduce((x,y)=>x+y,0);
  el.innerHTML=hdr('إحصائياتي')+`<div class="zx-seg" style="justify-content:center;padding-top:8px">${[7,28].map(x=>`<button class="zx-pill ${d===x?'on':''}" data-d="${x}">آخر ${ar(x)} يوم</button>`).join('')}</div>
   <div class="zx-kp"><div><b>${cnt(sum(r.views))}</b><small>مشاهدات (${ar(d)} يوم)</small></div><div><b>${cnt(sum(r.likes))}</b><small>إعجابات</small></div><div><b>${cnt(sum(r.followers))}</b><small>متابعون جدد</small></div><div><b>${cnt(sum(r.comments))}</b><small>تعليقات</small></div></div>
   <div class="zx-ch"><h5>المشاهدات <span>يوميًا</span></h5>${bars(r.views,r.days,'#20d5ec')}</div><div class="zx-ch"><h5>الإعجابات <span>يوميًا</span></h5>${bars(r.likes,r.days,'#fe2c55')}</div><div class="zx-ch"><h5>المتابعون الجدد <span>يوميًا</span></h5>${bars(r.followers,r.days,'#d4a24c')}</div>
   <div class="zx-sec">أفضل مقاطعك</div>${(r.top||[]).length?r.top.map((t,k)=>`<a class="zx-top5" href="#video/${t.id}"><b style="width:18px;text-align:center">${ar(k+1)}</b><span class="th" style="${t.poster?`background-image:url('/api/videos/p/${t.id}')`:''}"></span><span class="bd">${es((t.caption||t.title||'').slice(0,70))}<small>${ic('play','')} ${cnt(t.pv)} هذه الفترة · ${cnt(t.views)} الكل · ♡ ${cnt(t.likes)} · 💬 ${cnt(t.comments)}</small></span></a>`).join(''):'<div class="zx-load" style="padding:16px">انشر مقطعًا لتظهر إحصائياته</div>'}
   <div class="zx-kp" style="margin-top:6px"><div><b>${cnt(T.clips)}</b><small>مقاطعك المنشورة</small></div><div><b>${cnt(T.followers)}</b><small>كل المتابِعين</small></div><div><b>${cnt(T.views)}</b><small>كل المشاهدات</small></div><div><b>${cnt(T.saves)}</b><small>مرات الحفظ</small></div></div>
   <p style="font-size:11.5px;opacity:.5;text-align:center;padding:10px 20px">المشاهدة تُحسب مرة لكل جهاز في اليوم. يُحفظ آخر ٣٠ مقطع لكل حساب (المثبّتة والحلقات الرسمية محفوظة دائماً).</p>`;
  bindBack(el);$$('[data-d]',el).forEach(b=>b.onclick=()=>{d=+b.dataset.d;draw()})}
 draw();return P}
/* ===== drafts (IndexedDB: the file + every choice), saved when an upload fails or on «حفظ كمسودة» ===== */
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('zad-zx',1);r.onupgradeneeded=()=>r.result.createObjectStore('d',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const dOp=(m,f)=>idb().then(db=>new Promise((ok,no)=>{const t=db.transaction('d',m);const s=t.objectStore('d');const r=f(s);t.oncomplete=()=>ok(r&&r.result);t.onerror=()=>no(t.error)}));
const draftSave=d=>dOp('readwrite',s=>s.put(d));const draftAll=()=>dOp('readonly',s=>s.getAll()).then(a=>(a||[]).sort((x,y)=>y.at-x.at));const draftDel=id=>dOp('readwrite',s=>s.delete(id));const draftGet=id=>dOp('readonly',s=>s.get(id));
function draftsPage(){const el=page('',hdr('المسودات')+'<div class="zx-load">جارٍ التحميل…</div>');bindBack(el);const P={el,onShow:()=>{curNav='u';navOn(curNav)},refresh:()=>draw()};
 async function draw(){let a=[];try{a=await draftAll()}catch(e){}
  el.innerHTML=hdr('المسودات')+(a.length?a.map(d=>`<div class="zx-dr"><span class="th" style="${d.cover?`background-image:url('${URL.createObjectURL(d.cover)}')`:''}"></span><div class="bd">${es((d.meta.caption||'بدون وصف').slice(0,60))}<small>${ago(d.at)} · ${ar((d.file.size/1048576).toFixed(1))} م.ب${d.err?' · لم يكتمل الرفع':''}</small></div><a class="zx-btn" href="#vupload/d/${d.id}">أكمل</a><button class="zx-btn zx-gh zx-sq" data-x="${d.id}" aria-label="حذف">${ic('trash')}</button></div>`).join(''):`<div class="zx-empty" style="position:static;padding:70px 30px">${ic('draft')}<b>لا مسودات</b><span>إذا تعطّل الرفع نحفظ المقطع هنا تلقائيًا</span></div>`);
  bindBack(el);$$('[data-x]',el).forEach(b=>b.onclick=async()=>{if(!confirm('حذف المسودة؟'))return;await draftDel(b.dataset.x);draw()})}
 draw();return P}
/* upload helpers carried over from v4.4.2 (probe, compress over 50 MB, faststart, PUT with progress) */
const MAXB=50*1048576,MAXD=120.9;
const TYPES={mov:'video/quicktime',mp4:'video/mp4',m4v:'video/x-m4v',webm:'video/webm','3gp':'video/3gpp'};
function ftype(f){if(/^video\/(mp4|quicktime|webm|3gpp|x-m4v)$/.test(f.type))return f.type;const e=(f.name.split('.').pop()||'').toLowerCase();return TYPES[e]||(f.type&&f.type.indexOf('video/')===0?'video/mp4':'')}
function probe(blob){return new Promise((ok,no)=>{const v=document.createElement('video');v.preload='metadata';v.muted=true;v.playsInline=true;const u=URL.createObjectURL(blob);let done=0;
 const fail=()=>{if(done++)return;URL.revokeObjectURL(u);no(new Error('read'))};const to=setTimeout(fail,20000);
 v.onloadedmetadata=()=>{const d=v.duration;const grab=()=>{if(done)return;try{const W=v.videoWidth,Hh=v.videoHeight;const sc=Math.min(1,540/Math.max(1,W));const c=document.createElement('canvas');c.width=Math.max(2,Math.round(W*sc));c.height=Math.max(2,Math.round(Hh*sc));c.getContext('2d').drawImage(v,0,0,c.width,c.height);
   c.toBlob(b=>{done=1;clearTimeout(to);URL.revokeObjectURL(u);ok({dur:d,w:W,h:Hh,poster:b,url:b?URL.createObjectURL(b):''})},'image/jpeg',.8)}catch(e){done=1;clearTimeout(to);URL.revokeObjectURL(u);ok({dur:d,w:v.videoWidth,h:v.videoHeight,poster:null})}};
  if(!isFinite(d)||!d){v.currentTime=1e7;v.ontimeupdate=()=>{v.ontimeupdate=null;const dd=v.duration;v.currentTime=Math.min(1,dd/3);v.onseeked=()=>{v.onseeked=null;grab()};}; return}
  v.currentTime=Math.min(1,d/3);v.onseeked=grab;setTimeout(()=>{if(!done)grab()},6000)};
 v.onerror=fail;v.src=u})}
function shrink(file,dur,onp){return new Promise((ok,no)=>{if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream)return no(new Error('nosup'));
 const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/mp4;codecs=avc1.42E01E,opus','video/mp4;codecs=avc1','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
 const mt=types.find(t=>{try{return MediaRecorder.isTypeSupported(t)}catch(e){return false}});if(!mt)return no(new Error('nosup'));
 const v=document.createElement('video');v.playsInline=true;v.preload='auto';const u=URL.createObjectURL(file);v.src=u;
 v.onerror=()=>no(new Error('read'));
 v.onloadedmetadata=()=>{const W=v.videoWidth,Hh=v.videoHeight,sc=Math.min(1,1280/Math.max(W,Hh));const w=Math.round(W*sc/2)*2,h=Math.round(Hh*sc/2)*2;
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const cs=c.captureStream(30);let ac=null;
  try{const AC=window.AudioContext||window.webkitAudioContext;ac=new AC();const s=ac.createMediaElementSource(v),d=ac.createMediaStreamDestination();s.connect(d);d.stream.getAudioTracks().forEach(t=>cs.addTrack(t))}catch(e){v.muted=true}
  const vbr=Math.max(6e5,Math.min(25e5,Math.floor(44*1048576*8/Math.max(dur,1)*.85)-1e5));
  let rec;try{rec=new MediaRecorder(cs,{mimeType:mt,videoBitsPerSecond:vbr,audioBitsPerSecond:96000})}catch(e){return no(e)}
  const ch=[];rec.ondataavailable=e=>{e.data&&e.data.size&&ch.push(e.data)};
  rec.onstop=()=>{URL.revokeObjectURL(u);try{ac&&ac.close()}catch(e){}ok(new Blob(ch,{type:mt.split(';')[0]}))};
  let alive=true;const draw=()=>{if(!alive)return;try{g.drawImage(v,0,0,w,h)}catch(e){}onp&&onp(Math.min(1,v.currentTime/dur));if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(draw);else requestAnimationFrame(draw)};
  v.onended=()=>{alive=false;setTimeout(()=>rec.state!=='inactive'&&rec.stop(),200)};
  rec.start(1000);(ac&&ac.resume?ac.resume():Promise.resolve()).then(()=>v.play()).then(draw).catch(e=>{alive=false;no(e)})}})}
async function faststart(blob){if(!blob||blob.size>MAXB+1048576||!/mp4|quicktime|m4v|3gp/.test(blob.type||'video/mp4'))return blob;
 const buf=new Uint8Array(await blob.arrayBuffer()),dv=new DataView(buf.buffer);const top=[];let p=0;
 while(p+8<=buf.length){let sz=dv.getUint32(p),hd=8;const t=String.fromCharCode(buf[p+4],buf[p+5],buf[p+6],buf[p+7]);if(sz===1){sz=dv.getUint32(p+8)*4294967296+dv.getUint32(p+12);hd=16}else if(sz===0)sz=buf.length-p;if(sz<hd||p+sz>buf.length)return blob;top.push({t,p,sz});p+=sz}
 const mi=top.findIndex(b=>b.t==='moov'),di=top.findIndex(b=>b.t==='mdat');if(mi<0||di<0||mi<di)return blob;
 const mv=top[mi],moov=buf.slice(mv.p,mv.p+mv.sz),md=new DataView(moov.buffer),D=mv.sz;let bad=false;
 const walk=(s,e)=>{let q=s;while(q+8<=e){const sz=md.getUint32(q),t=String.fromCharCode(moov[q+4],moov[q+5],moov[q+6],moov[q+7]);if(sz<8||q+sz>e){bad=true;return}
   if(/^(trak|mdia|minf|stbl|edts|dinf)$/.test(t))walk(q+8,q+sz);
   else if(t==='stco'){const n=md.getUint32(q+12);for(let k=0;k<n;k++){const o=q+16+k*4,x=md.getUint32(o)+D;if(x>4294967295){bad=true;return}md.setUint32(o,x)}}
   else if(t==='co64'){const n=md.getUint32(q+12);for(let k=0;k<n;k++){const o=q+16+k*8,x=md.getUint32(o)*4294967296+md.getUint32(o+4)+D;md.setUint32(o,Math.floor(x/4294967296));md.setUint32(o+4,x>>>0)}}
   q+=sz}};
 walk(8,D);if(bad)return blob;
 const parts=[];top.forEach((b,k)=>{if(k===mi)return;if(k===di)parts.push(moov);parts.push(buf.subarray(b.p,b.p+b.sz))});
 return new Blob(parts,{type:blob.type||'video/mp4'})}
function put(url,blob,onp){return new Promise((ok,no)=>{const x=new XMLHttpRequest();x.open('PUT',url);x.setRequestHeader('Content-Type',blob.type||'application/octet-stream');
 x.upload.onprogress=e=>{e.lengthComputable&&onp&&onp(e.loaded/e.total)};x.onload=()=>{let j={};try{j=JSON.parse(x.responseText)}catch(e){}j.ok?ok(j):no(Object.assign(new Error('up'),{j,status:x.status}))};x.onerror=()=>no(new Error('net'));x.send(blob)})}

/* ===== upload: pick → edit (trim, text, «آية», filter, cover) → post (caption #/@, comments, download, series, schedule) ===== */
const COLS=['#ffffff','#ffd166','#f9c74f','#20d5ec','#fe2c55','#90be6d','#1d2545','#000000'];
const PRESETS=[['طبيعي',{b:1,c:1,w:0,s:1,g:0}],['مشرق',{b:1.15,c:1.05,w:0,s:1.1,g:0}],['دافئ',{b:1.05,c:1.05,w:.6,s:1.1,g:0}],['هادئ',{b:1.02,c:.92,w:.15,s:.8,g:0}],['تباين',{b:1,c:1.3,w:0,s:1.15,g:0}],['أبيض وأسود',{b:1.05,c:1.15,w:0,s:1,g:1}]];
function uploadPage(arg){const el=page('','');const a=String(arg||'').split('/');
 const U={fx:{f:{b:1,c:1,w:0,s:1,g:0},o:[]},ts:0,te:0,ct:0,cmt:'all',dl:1,series:'',pub:'',caption:a[0]==='t'&&a[1]?'#'+decodeURIComponent(a[1])+' ':'',reply:a[0]==='r'?String(a[1]||'').replace(/[^a-f0-9]/g,''):'',draft:a[0]==='d'?a[1]:''};
 let stage='pick',tool='trim',vEl=null,sel=-1,busy=false,RT=null;
 const P={el,onShow:()=>{curNav='vupload';navOn(curNav)},destroy:()=>{try{vEl&&vEl.pause()}catch(e){}if(U.url)URL.revokeObjectURL(U.url)}};
 if(U.reply)api('vx/item?id='+U.reply).then(r=>{if(r.ok){RT=r.item;if(stage==='pick'||stage==='post')draw()}});
 if(U.draft)draftGet(U.draft).then(d=>{if(!d)return;Object.assign(U,d.meta);U.draftId=d.id;U.cover=d.cover;loadFile(d.file)}).catch(()=>{});
 const fxOf=()=>{const f=U.fx.f;const has=f.b!==1||f.c!==1||f.w||f.s!==1||f.g;return{...(has?{f}:{}),...(U.fx.o.length?{o:U.fx.o}:{})}};
 function draw(){if(stage==='pick')return drawPick();if(stage==='edit')return drawEdit();drawPost()}
 function drawPick(){el.innerHTML=hdr(U.reply?'ردّ بمقطع':'مقطع جديد')+`${RT?`<div style="padding:8px 16px 0"><span class="zx-chip">${ic('reply')} ردّ على @${es(RT.u.h||RT.u.name)}: ${es((RT.cap||RT.t).slice(0,40))}</span></div>`:''}
  <label class="zx-pick"><input type="file" accept="video/*" id="zxupf" hidden>${ic('plus')}<b>اختر مقطعًا من جوالك</b><small>حتى دقيقتين · بحد أقصى ٥٠ م.ب (الأكبر نضغطه داخل جوالك)<br>بعدها تقص البداية والنهاية، تكتب نصًا أو تضيف آية، وتختار الغلاف</small></label>
  <div class="zx-f"><div class="zx-note">${ic('flag')}<span><b>بدون موسيقى.</b> لا صور غير لائقة، ولا فتاوى من غير أهل العلم. المقطع يُنشر مباشرة ويبقى في صفحتك، والمخالف يُحذف ويُوقف حسابه.<br>يُحفظ آخر ٣٠ مقطع لكل حساب (المثبّتة محفوظة دائماً)</span></div>
  <a class="zx-btn zx-gh bl" href="#vdrafts">${ic('draft')}المسودات</a></div>`;bindBack(el);
  $('#zxupf',el).onchange=e=>{const f=e.target.files[0];if(f)loadFile(f)}}
 async function loadFile(f){const ty=ftype(f);if(!ty)return say('صيغة المقطع غير مدعومة، جرّب MP4');say('جارٍ قراءة المقطع…');let p;try{p=await probe(f)}catch(e){return say('تعذّر قراءة المقطع على جهازك، جرّب MP4')}
  if(p.dur>MAXD)return say('المقطع مدته '+fmt(p.dur)+' والحد دقيقتان — قصّه من الاستوديو ثم ارفعه');
  U.file=f;U.type=ty;U.dur=p.dur;U.w=p.w;U.h=p.h;if(U.url)URL.revokeObjectURL(U.url);U.url=URL.createObjectURL(f);if(!U.te||U.te>p.dur)U.te=p.dur;if(!U.cover)U.cover=p.poster;stage='edit';draw();strip()}
 const strip=async()=>{const n=6,urls=[];try{const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=U.url;await new Promise((ok,no)=>{v.onloadeddata=ok;v.onerror=no;setTimeout(ok,5000)});
  const c=document.createElement('canvas');c.width=60;c.height=106;const g=c.getContext('2d');for(let k=0;k<n;k++){v.currentTime=Math.min(U.dur-.05,U.dur*(k+.5)/n);await new Promise(ok=>{v.onseeked=ok;setTimeout(ok,1500)});const sc=Math.max(60/v.videoWidth,106/v.videoHeight);g.drawImage(v,(60-v.videoWidth*sc)/2,(106-v.videoHeight*sc)/2,v.videoWidth*sc,v.videoHeight*sc);urls.push(c.toDataURL('image/jpeg',.6))}U.strip=urls;const sb=$('.zx-trim .strip',el);if(sb)sb.innerHTML=urls.map(u=>`<img src="${u}" alt="">`).join('')}catch(e){}};
 function edK(){const ed=$('.zx-ed',el);if(ed)ed.style.setProperty('--zk',ed.clientWidth/360)}
 function drawEdit(){el.innerHTML=hdr('تحرير المقطع',`<button class="zx-btn" id="zxunx" style="padding:8px 14px;margin-inline-end:4px">التالي</button>`)+`
  <div class="zx-ed"><video playsinline muted loop src="${U.url}"></video><div class="zx-ov"></div></div>
  <div class="zx-tools">${[['trim','scissors','قص'],['text','text','نص'],['aya','book','آية'],['filter','filter','فلتر'],['cover','image','الغلاف']].map(([k,i,t])=>`<button data-t="${k}" class="${tool===k?'on':''}"><span>${ic(i)}</span>${t}</button>`).join('')}</div><div id="zxupn"></div>`;
  bindBack(el);vEl=$('.zx-ed video',el);vEl.style.filter=fxFilter(U.fx.f);vEl.currentTime=U.ts;vEl.play().catch(()=>{});edK();
  vEl.ontimeupdate=()=>{if(vEl.currentTime>=U.te-.05||vEl.currentTime<U.ts-.3){vEl.currentTime=U.ts}const ph=$('.zx-trim .ph',el);if(ph)ph.style.right=(vEl.currentTime/U.dur*100)+'%'};
  $('.zx-ed',el).onclick=e=>{if(e.target===vEl){sel=-1;drawOv();vEl.paused?vEl.play():vEl.pause()}};
  $('#zxunx',el).onclick=()=>{stage='post';try{vEl.pause()}catch(e){}draw()};
  $$('.zx-tools [data-t]',el).forEach(b=>b.onclick=()=>{tool=b.dataset.t;$$('.zx-tools [data-t]',el).forEach(x=>x.classList.toggle('on',x===b));panel()});
  drawOv();panel()}
 function drawOv(){const ov=$('.zx-ed .zx-ov',el);if(!ov)return;ov.innerHTML=ovHTML({o:U.fx.o});fillAya(ov);
  $$('.zx-ot',ov).forEach((d,k)=>{d.classList.toggle('sel',k===sel);const rm=document.createElement('button');rm.className='rm';rm.textContent='×';rm.setAttribute('aria-label','حذف');rm.onclick=e=>{e.stopPropagation();U.fx.o.splice(k,1);sel=-1;drawOv()};d.appendChild(rm);
   d.onpointerdown=e=>{e.preventDefault();sel=k;$$('.zx-ot',ov).forEach((x,j)=>x.classList.toggle('sel',j===k));d.setPointerCapture(e.pointerId);const r=ov.getBoundingClientRect();
    d.onpointermove=ev=>{const o=U.fx.o[k];o.x=Math.max(5,Math.min(95,(ev.clientX-r.left)/r.width*100));o.y=Math.max(5,Math.min(95,(ev.clientY-r.top)/r.height*100));d.style.right=(100-o.x)+'%';d.style.top=o.y+'%'};
    d.onpointerup=()=>{d.onpointermove=null}}})}
 function panel(){const pn=$('#zxupn',el);if(!pn)return;
  if(tool==='trim'){pn.innerHTML=`<div class="zx-panel"><div style="display:flex;justify-content:space-between;font-size:12.5px;opacity:.75"><span>البداية ${fmt(U.ts)}</span><b>المدة ${fmt(U.te-U.ts)}</b><span>النهاية ${fmt(U.te)}</span></div>
    <div class="zx-trim"><div class="strip">${(U.strip||[]).map(u=>`<img src="${u}" alt="">`).join('')}</div><div class="sel"><span class="h s" aria-label="البداية">⁞</span><span class="h e" aria-label="النهاية">⁞</span></div><div class="ph"></div></div>
    <div style="font-size:11.5px;opacity:.55;line-height:1.6">اسحب الطرفين الذهبيين. نحفظ نقطتي القص ويُعرض المقطع بينهما فقط.</div></div>`;trimBind()}
  else if(tool==='text'){let col='#ffffff',font='c',bg=0,z=24;pn.innerHTML=`<div class="zx-panel zx-f" style="padding:12px"><input type="text" id="zxutx" maxlength="120" placeholder="اكتب نصًا يظهر على المقطع">
    <div class="zx-row" style="padding:10px 0 0"><button class="zx-pill on" data-fn="c">خط القاهرة</button><button class="zx-pill" data-fn="a" style="font-family:Amiri,serif">خط أميري</button><button class="zx-pill" id="zxubg">خلفية</button></div>
    <div class="zx-sws" style="margin:10px 0">${COLS.map(c=>`<button data-c="${c}" style="background:${c}" class="${c===col?'on':''}" aria-label="لون"></button>`).join('')}</div>
    <input type="range" class="zx-rng" id="zxusz" min="14" max="44" value="24" aria-label="حجم الخط"><button class="zx-btn bl" id="zxuad" style="margin-top:8px">${ic('plus')}إضافة النص</button>
    <div style="font-size:11.5px;opacity:.55;margin-top:6px">اسحب النص على المقطع لتغيّر مكانه، و× لحذفه (حتى ٥ عناصر).</div></div>`;
   $$('[data-fn]',pn).forEach(b=>b.onclick=()=>{font=b.dataset.fn;$$('[data-fn]',pn).forEach(x=>x.classList.toggle('on',x===b))});$('#zxubg',pn).onclick=e=>{bg=bg?0:1;e.target.classList.toggle('on',!!bg)};
   $$('[data-c]',pn).forEach(b=>b.onclick=()=>{col=b.dataset.c;$$('[data-c]',pn).forEach(x=>x.classList.toggle('on',x===b))});$('#zxusz',pn).oninput=e=>z=+e.target.value;
   $('#zxuad',pn).onclick=()=>{const t=$('#zxutx',pn).value.trim();if(!t)return say('اكتب النص أولًا');if(U.fx.o.length>=5)return say('الحد ٥ عناصر');U.fx.o.push({t,x:50,y:30+U.fx.o.length*10,c:col,f:font,z,bg});sel=U.fx.o.length-1;$('#zxutx',pn).value='';drawOv()}}
  else if(tool==='aya'){const ch=(window.QDATA&&QDATA.ch)||[];pn.innerHTML=`<div class="zx-panel zx-f" style="padding:12px"><div style="display:flex;gap:8px"><select id="zxuas" style="flex:2">${ch.map(c=>`<option value="${c[0]}">${ar(c[0])}. ${c[1]}</option>`).join('')}</select><input type="text" inputmode="numeric" id="zxuaa" value="1" style="flex:1" aria-label="رقم الآية"></div>
    <div id="zxuap" style="font-family:'Amiri Quran',Amiri,serif;font-size:19px;line-height:2;margin:10px 0;min-height:40px;text-align:center"></div><button class="zx-btn bl" id="zxuaad">${ic('plus')}إضافة الآية على المقطع</button>
    <div style="font-size:11.5px;opacity:.55;margin-top:6px;line-height:1.6">النص من مصحف التطبيق (الرسم العثماني من quran.com) مع اسم السورة ورقم الآية. يُحفظ المرجع فقط ويُقرأ النص من المصدر عند العرض.</div></div>`;
   const sS=$('#zxuas',pn),sA=$('#zxuaa',pn),pv=$('#zxuap',pn);const go=async()=>{const s=+sS.value,n=Math.max(1,Math.min(+String(sA.value).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))||1,(ch[s-1]||[0,0,286])[2]));pv.textContent='…';const t=await ayaText(s+':'+n);pv.dataset.ref=s+':'+n;pv.dataset.len=t.length;pv.innerHTML=t?`${es(t)} <small style="font-family:inherit;font-size:12px;color:#d4a24c">﴿ ${es(sName(s))} : ${ar(n)} ﴾</small>`:'تعذّر جلب الآية، تأكد من الاتصال'};
   sS.onchange=()=>{sA.value='1';go()};sA.oninput=()=>{clearTimeout(sA._t);sA._t=setTimeout(go,400)};go();
   $('#zxuaad',pn).onclick=()=>{if(!pv.dataset.ref||!+pv.dataset.len)return;if(+pv.dataset.len>230)return say('الآية طويلة على المقطع، اختر آية أقصر');if(U.fx.o.length>=5)return say('الحد ٥ عناصر');U.fx.o.push({k:'aya',ref:pv.dataset.ref,x:50,y:72,z:+pv.dataset.len>120?16:20,c:'#ffffff'});sel=U.fx.o.length-1;drawOv();say('أُضيفت الآية ✓')}}
  else if(tool==='filter'){const f=U.fx.f;pn.innerHTML=`<div class="zx-panel"><div class="zx-fxs">${PRESETS.map(([n,p],k)=>`<button data-p="${k}"><i style="filter:${fxFilter(p)}"></i>${n}</button>`).join('')}</div>
    <label style="font-size:12px;opacity:.7">السطوع</label><input type="range" class="zx-rng" data-k="b" min="0.6" max="1.5" step="0.05" value="${f.b}"><label style="font-size:12px;opacity:.7">التباين</label><input type="range" class="zx-rng" data-k="c" min="0.6" max="1.5" step="0.05" value="${f.c}"><label style="font-size:12px;opacity:.7">الدفء</label><input type="range" class="zx-rng" data-k="w" min="0" max="1" step="0.05" value="${f.w}"></div>`;
   const ap=()=>{vEl.style.filter=fxFilter(U.fx.f)};$$('[data-p]',pn).forEach(b=>b.onclick=()=>{U.fx.f=Object.assign({},PRESETS[+b.dataset.p][1]);ap();panel()});$$('[data-k]',pn).forEach(r=>r.oninput=()=>{U.fx.f[r.dataset.k]=+r.value;ap()})}
  else if(tool==='cover'){pn.innerHTML=`<div class="zx-panel"><div class="zx-cv"><div class="th" id="zxucv" style="${U.cover?`background-image:url('${URL.createObjectURL(U.cover)}')`:''}"><span>الغلاف</span></div><div style="flex:1"><label style="font-size:12.5px;opacity:.75">اختر اللقطة</label><input type="range" class="zx-rng" id="zxuct" min="${U.ts}" max="${U.te}" step="0.1" value="${U.ct||U.ts}"><button class="zx-btn bl" id="zxucs" style="margin-top:10px">${ic('check')}اعتمد هذه اللقطة</button></div></div></div>`;
   const r=$('#zxuct',pn);r.oninput=()=>{try{vEl.pause();vEl.currentTime=+r.value}catch(e){}};$('#zxucs',pn).onclick=()=>{U.ct=+r.value;grabCover().then(()=>{say('تم اختيار الغلاف ✓');panel()})}}}
 function grabCover(){return new Promise(ok=>{const c=document.createElement('canvas');const W=vEl.videoWidth,H=vEl.videoHeight,sc=Math.min(1,540/Math.max(1,W));c.width=Math.round(W*sc);c.height=Math.round(H*sc);const g=c.getContext('2d');g.filter=fxFilter(U.fx.f)||'none';try{g.drawImage(vEl,0,0,c.width,c.height)}catch(e){return ok()}c.toBlob(b=>{if(b)U.cover=b;ok()},'image/jpeg',.82)})}
 function trimBind(){const box=$('.zx-trim',el),selE=$('.sel',box);const pos=()=>{selE.style.right=(U.ts/U.dur*100)+'%';selE.style.left=(100-U.te/U.dur*100)+'%'};pos();
  const drag=(h,isS)=>{h.onpointerdown=e=>{e.preventDefault();e.stopPropagation();h.setPointerCapture(e.pointerId);const r=box.getBoundingClientRect();try{vEl.pause()}catch(x){}
   h.onpointermove=ev=>{const t=Math.max(0,Math.min(1,(r.right-ev.clientX)/r.width))*U.dur;if(isS)U.ts=Math.min(t,U.te-1);else U.te=Math.max(t,U.ts+1);U.ts=Math.max(0,Math.round(U.ts*10)/10);U.te=Math.min(U.dur,Math.round(U.te*10)/10);pos();try{vEl.currentTime=isS?U.ts:Math.max(U.ts,U.te-.1)}catch(x){}const sp=$$('#zxupn span',el);if(sp[0]){sp[0].textContent='البداية '+fmt(U.ts);$('#zxupn b',el).textContent='المدة '+fmt(U.te-U.ts);sp[1].textContent='النهاية '+fmt(U.te)}};
   h.onpointerup=()=>{h.onpointermove=null;try{vEl.currentTime=U.ts;vEl.play()}catch(x){}}}};drag($('.h.s',box),true);drag($('.h.e',box),false)}

 function drawPost(){const minDT=new Date(Date.now()+10*6e4-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
  el.innerHTML=hdr('نشر',`<span style="width:40px"></span>`)+`<div class="zx-f">
   ${RT?`<div style="padding-top:10px"><span class="zx-chip">${ic('reply')} ردّ على @${es(RT.u.h||RT.u.name)}</span></div>`:''}
   <div class="zx-cv"><div class="th" style="${U.cover?`background-image:url('${URL.createObjectURL(U.cover)}')`:''}"><span>${fmt(U.te-U.ts)}</span></div><div style="flex:1;position:relative" id="zxucb"><textarea id="zxucap" maxlength="300" placeholder="اكتب وصفًا… استخدم #وسم وأشِر إلى أحد بـ @">${es(U.caption)}</textarea><div style="font-size:11px;opacity:.5;text-align:left" id="zxucc"></div></div></div>
   <label>من يمكنه التعليق</label><div class="zx-row" style="padding:0">${[['all','الجميع'],['fol','متابعيني'],['off','لا أحد']].map(([k,t])=>`<button class="zx-pill ${U.cmt===k?'on':''}" data-c="${k}">${t}</button>`).join('')}</div>
   <div class="zx-tg"><span>السماح بالتحميل<small>بعلامة «زاد @معرّفك»</small></span><label class="zx-sw"><input type="checkbox" id="zxudl" ${U.dl?'checked':''}><i></i></label></div>
   <div class="zx-tg"><span>أضف إلى سلسلة<small>تظهر مجمّعة في ملفك</small></span><select id="zxusr" style="width:auto;max-width:48%"><option value="">بدون</option><option value="+">+ سلسلة جديدة</option></select></div>
   <div class="zx-tg"><span>جدولة النشر<small>ينشر تلقائيًا في الوقت المحدد</small></span><label class="zx-sw"><input type="checkbox" id="zxusc" ${U.pub?'checked':''}><i></i></label></div>
   <input type="datetime-local" id="zxust" min="${minDT}" value="${U.pub||minDT}" ${U.pub?'':'hidden'}>
   <div class="zx-note">${ic('flag')}<span>تأكد أن المقطع بدون موسيقى.<br>يُحفظ آخر ٣٠ مقطع لكل حساب (المثبّتة محفوظة دائماً)</span></div>
   <div class="zx-upbar" hidden><i></i></div><div id="zxums" style="font-size:13px;opacity:.8;min-height:20px;text-align:center"></div>
   <div style="display:flex;gap:8px;margin:8px 0 20px"><button class="zx-btn zx-gh" id="zxudr" style="flex:1">${ic('draft')}مسودة</button><button class="zx-btn" id="zxupb" style="flex:2">${ic('send')}نشر</button></div></div>`;
  bindBack(el);$('.zbk',el).onclick=()=>{stage='edit';draw()};
  const cap=$('#zxucap',el),cc=$('#zxucc',el);const upc=()=>{U.caption=cap.value;cc.textContent=ar([...cap.value].length)+'/٣٠٠'};upc();cap.oninput=()=>{upc();acFor(cap,$('#zxucb',el))};
  $$('[data-c]',el).forEach(b=>b.onclick=()=>{U.cmt=b.dataset.c;$$('[data-c]',el).forEach(x=>x.classList.toggle('on',x===b))});$('#zxudl',el).onchange=e=>U.dl=e.target.checked?1:0;
  const sc=$('#zxusc',el),st=$('#zxust',el);sc.onchange=()=>{st.hidden=!sc.checked;U.pub=sc.checked?st.value:''};st.onchange=()=>U.pub=st.value;
  const sr=$('#zxusr',el);loadMe().then(m=>m&&api('vx/series').then(r=>{(r.items||[]).forEach(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.title;sr.insertBefore(o,sr.lastElementChild)});sr.value=U.series||''}));
  sr.onchange=async()=>{if(sr.value==='+'){sr.value='';const t=prompt('اسم السلسلة');if(!t)return;const m=await needProfile();if(!m)return;const r=await api('vx/series',{op:'new',title:t});if(!r.ok)return say(err(r));const o=document.createElement('option');o.value=r.item.id;o.textContent=r.item.title;sr.insertBefore(o,sr.lastElementChild);sr.value=r.item.id}U.series=sr.value};
  $('#zxudr',el).onclick=async()=>{await keepDraft(false);say('حُفظت المسودة ✓');location.hash='vdrafts'};
  $('#zxupb',el).onclick=publish}
 async function keepDraft(failed){const id=U.draftId||('d'+Date.now().toString(36));U.draftId=id;const meta={caption:U.caption,cmt:U.cmt,dl:U.dl,series:U.series,pub:U.pub,ts:U.ts,te:U.te,ct:U.ct,fx:U.fx,reply:U.reply};try{await draftSave({id,at:Date.now(),file:U.file,cover:U.cover||null,meta,err:failed?1:0});return true}catch(e){return false}}
 async function publish(){if(busy)return;const m=await needProfile('أنشئ ملفك لتنشر مقاطعك في صفحتك.');if(!m)return;busy=true;
  const btn=$('#zxupb',el),bar=$('.zx-upbar',el),bi=$('i',bar),ms=$('#zxums',el);btn.disabled=true;bar.hidden=false;const prog=(p,t)=>{bi.style.width=Math.round(p*100)+'%';if(t)ms.textContent=t};
  try{let blob=U.file,type=U.type;const big=U.file.size>MAXB;let pubAt=0;if(U.pub){pubAt=new Date(U.pub).getTime();if(!(pubAt>Date.now()+5*6e4))throw{msg:'اختر وقت جدولة بعد ١٠ دقائق على الأقل'}}
   if(big){prog(0,'جارٍ ضغط المقطع داخل جوالك (٧٢٠p)… لا تُقفل الشاشة');try{blob=await shrink(U.file,U.dur,p=>prog(p*.45,'جارٍ الضغط… '+ar(Math.round(p*100))+'٪'))}catch(e){throw{msg:'المقطع أكبر من ٥٠ م.ب وجوالك لا يستطيع ضغطه هنا. صوّره بجودة أقل أو قصّره'}}if(blob.size>MAXB)throw{msg:'حتى بعد الضغط المقطع أكبر من ٥٠ م.ب'};type=blob.type||'video/mp4'}
   try{blob=await faststart(blob)}catch(e){}
   const base=big?.45:0;prog(base,'جارٍ التجهيز…');
   const j=await api('vx/init',{caption:U.caption,size:blob.size,dur:U.dur,type:/webm/.test(type)?'video/webm':type,w:U.w,h:U.h,ts:U.ts>0.05?U.ts:0,te:U.te<U.dur-.15?U.te:0,fx:fxOf(),cmt:U.cmt,dl:U.dl,series:U.series||'',pub_at:pubAt||0,reply_to:U.reply||''});
   if(!j.ok)throw j;
   if(U.cover){try{await put('/api/videos/poster/'+j.id+'?t='+j.t,U.cover)}catch(e){}}
   await put('/api/videos/file/'+j.id+'?t='+j.t,blob,p=>prog(base+(1-base)*p*.98,'جارٍ الرفع… '+ar(Math.round(p*100))+'٪'));
   await api('vx/done',{id:j.id});prog(1,j.sched?'✓ جُدول المقطع':'✓ نُشر المقطع');vb([10,40,10]);
   if(U.draftId)try{await draftDel(U.draftId)}catch(e){}
   say(j.sched?'⏱ جُدول المقطع وينشر في وقته':'🎉 نُشر مقطعك');setTimeout(()=>{location.hash='u/'+(ME&&ME.h||'me')},700)}
  catch(e){busy=false;btn.disabled=false;const isNet=e instanceof Error;let saved=false;if(isNet)saved=await keepDraft(true);
   ms.textContent=isNet?'تعذّر الرفع، تأكد من الاتصال'+(saved?' — حفظنا المقطع في «المسودات» لتكمّله لاحقًا':''):err(e);if(saved)say('حُفظ كمسودة')}}
 draw();return P}

/* ===== Islamic touches: the adhan pauses the feed; an optional screen-time reminder ===== */
function prayerOv(name){const f=topFeed();f&&f.pause();const o=document.createElement('div');o.className='zx-prayer';o.innerHTML=`${ic('mosque')}<h2>حان وقت صلاة ${es(name)}</h2><p>حيّ على الصلاة، حيّ على الفلاح<br><small style="opacity:.75">أوقفنا المقاطع — نلقاك بعد الصلاة إن شاء الله</small></p><div style="display:flex;gap:8px;margin-top:8px"><a class="zx-btn" href="#prayer">المواقيت</a><button class="zx-btn zx-gh" id="zxzpo">إغلاق</button></div>`;root.appendChild(o);vb([30,60,30]);
 $('#zxzpo',o).onclick=()=>{o.remove();const g=topFeed();g&&g.resume()}}
function stOv(min){const f=topFeed();f&&f.pause();const o=document.createElement('div');o.className='zx-prayer';o.style.background='radial-gradient(circle at 50% 30%,rgba(29,37,69,.97),rgba(5,8,18,.98))';o.innerHTML=`${ic('clock')}<h2>لك ${ar(min)} دقيقة تتصفح</h2><p>استغفر الله وقم 🌿<br><small style="opacity:.75">«نعمتان مغبون فيهما كثير من الناس: الصحة والفراغ» — رواه البخاري</small></p><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;justify-content:center"><button class="zx-btn" id="zxzsq">أستغفر الله، أكمل</button><a class="zx-btn zx-gh" href="#home">قم الآن</a><button class="zx-btn zx-gh" id="zxzss">الإعدادات</button></div>`;root.appendChild(o);
 $('#zxzsq',o).onclick=()=>{o.remove();const g=topFeed();g&&g.resume()};$('#zxzss',o).onclick=()=>{o.remove();timeSheet()}}
function minute(){if(!root||document.hidden)return;const f=topFeed();const dk=new Date().toDateString();
 if(f&&!f.paused&&f.items.length&&!$('.zx-prayer',root)){if(!Z.stt||Z.stt.d!==dk)Z.stt={d:dk,s:0};Z.stt.s+=15;if(Z.st.on&&Z.stt.s>=(+Z.st.min||30)*60){Z.stt.s=0;sv();stOv(+Z.st.min||30)}}
 try{if(typeof nextPrayer==='function'){const np=nextPrayer();if(np&&np.prev&&np.prev.k!=='Sunrise'){const dt=Date.now()-np.prev.at;const key=dk+np.prev.k;if(dt>=0&&dt<4*6e4&&!Z.adh[key]&&f&&!$('.zx-prayer',root)){Z.adh={[key]:1};sv();prayerOv(np.prev.n)}}}}catch(e){}}
/* ===== router ===== */
function feedPage(){const p=makeFeed({tabs:true,f:'for',nav:'videos',load:(c,F)=>api('vx/feed?f='+F.o.f+'&c='+c)});p.feed.reset('for');return p}
function open(kind,arg){arg=String(arg||'');build();poolInit();try{document.documentElement.style.setProperty('--zk',Math.min(innerWidth,innerHeight*9/16)/360)}catch(e){}
 if(typeof view!=='undefined'&&view&&!view.querySelector('.zx-ph'))view.innerHTML=`<div class="zcard zx-ph" style="margin:16px;text-align:center"><b>مقاطع زاد</b><p class="k">مقاطع إسلامية قصيرة · صفحة لكل مستخدم</p><a class="zchip" href="#videos">فتح المقاطع</a></div>`;
 if(kind==='videos'){curNav='videos';show('feed',feedPage)}
 else if(kind==='video'){const id=arg.replace(/[^a-f0-9]/g,'').slice(0,16);curNav='videos';
  if(CTX&&CTX.items.some(x=>x.id===id)){const c=CTX;CTX=null;const k=c.items.findIndex(x=>x.id===id);show('list:'+id,()=>{const p=makeFeed({title:es(c.title||''),nav:'',load:c.load?(n=>c.load(n)):null});p.feed.seed(c.items,c.load?c.items.length:null,k);return p})}
  else show('v:'+id,()=>{const p=makeFeed({title:'',nav:'videos',load:(c,F)=>api('vx/feed?f=for&c='+c)});const F=p.feed;F.fe.innerHTML='<div class="zx-empty"><div class="zx-spin" style="display:block;position:static;margin:0"></div></div>';
   api('vx/item?id='+id).then(r=>{F.fe.innerHTML='';if(!r.ok){F.fe.innerHTML=`<div class="zx-empty">${ic('play')}<b>${err(r,'هذا المقطع لم يعد متاحًا')}</b><span>ربما حذفه صاحبه</span><a class="zx-btn" href="#videos">شاهد مقاطع أخرى</a></div>`;return}$('.zx-ttl',p.el).textContent=r.item.u.h?'@'+r.item.u.h:'';F.seed([r.item],0,0)});return p})}
 else if(kind==='vupload'){curNav='vupload';show('up:'+arg,()=>uploadPage(arg))}
 else if(kind==='u'){const pr=arg.split('/');let h=decodeURIComponent(pr[0]||'').toLowerCase();
  if(h==='me'||!h){loadMe().then(m=>{if(m)location.replace('#u/'+m.h);else{curNav='u';show('me0',()=>{const el=page('',hdr('ملفي')+`<div class="zx-empty" style="position:static;padding:70px 30px">${av({name:'؟',id:'x'},86)}<b>صفحتك في زاد</b><span>ملف واحد لك في الديوانية والمقاطع: اسمك، @معرّفك، مقاطعك ومتابعوك</span><button class="zx-btn" id="zxmk0">أنشئ ملفي</button></div>`);bindBack(el);$('#zxmk0',el).onclick=()=>needProfile().then(x=>x&&location.replace('#u/'+x.h));return{el,onShow:()=>navOn('u')}})}});return}
  const sid=pr[1]==='s'&&pr[2]?pr[2]:null;show('u:'+h+(sid?'/s/'+sid:''),()=>profilePage(h,sid))}
 else if(kind==='explore'){show('explore',()=>explorePage(decodeURIComponent(arg||'')))}
 else if(kind==='tag'){const t=decodeURIComponent(arg||'');show('tag:'+t,()=>tagPage(t))}
 else if(kind==='vstats')show('stats',statsPage);else if(kind==='vdrafts')show('drafts',draftsPage);else if(kind==='vnotif')show('notif',notifPage);
 navOn(curNav)}
const ROUTES=['videos','video','vupload','u','explore','tag','vstats','vdrafts','vnotif'];
window.addEventListener('hashchange',()=>{const r=(location.hash.slice(1)||'home').split('/')[0];if(root&&!ROUTES.includes(r))close()});
window.ZB10={open,close,ROUTES,_prayer:n=>{build();prayerOv(n||'الظهر')},_st:()=>{build();stOv(+Z.st.min||30)},_card:profileCard,_v:'5.4.1'};
})();
