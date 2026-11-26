/* زاد v5.4.6: «ابحث في المكتبة الشاملة» — a search box + button at the top of the library screens (#lib مكتبتي, #books, #pdfs, #hufaz) and an extra row in the app search (#sections / #search). Opens shamela.ws search results in the external browser. Minified to site/zsh.js */
!function(){"use strict";if(window.ZSHM||typeof V==="undefined")return;
const ZSH=window.ZSHM={};
const HOME="https://shamela.ws/";
/* verified 31 Oct 2026: shamela.ws's own home form is GET /search?q=… ; the page runs the search itself (POST /ajax/search) and shows the results */
const url=ZSH.url=q=>{q=String(q||"").replace(/\s+/g," ").trim().slice(0,200);return q?HOME+"search?q="+encodeURIComponent(q):HOME};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ic=n=>{try{if(typeof zi==="function")return zi(n)}catch(e){}return""};
const SVG='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const BOOK='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M9 7h7M9 10.5h5"/></svg>';
const css=`.zsh-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;margin:6px 0 14px;box-shadow:var(--shadow)}
.zsh-hd{display:flex;align-items:center;gap:10px;margin-bottom:10px}.zsh-ic{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;background:color-mix(in srgb,var(--accent) 12%,var(--card));color:var(--accent)}
.zsh-hd b{display:block;font-size:15.5px;color:var(--ink)}.zsh-hd small{display:block;font-size:12.5px;color:var(--muted);margin-top:1px}
.zsh-in{display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:0 12px;color:var(--muted)}
.zsh-in input{flex:1;min-width:0;border:0;background:transparent;font:inherit;font-size:16px;color:var(--ink);padding:12px 0;outline:0;-webkit-appearance:none;appearance:none}
.zsh-in input::-webkit-search-cancel-button{display:none}
.zsh-btn{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;padding:12px 14px;border-radius:14px;background:var(--accent);color:#fff!important;font-weight:700;font-size:15.5px;text-decoration:none!important;-webkit-tap-highlight-color:transparent}
.zsh-btn:active{transform:scale(.985);opacity:.92}.zsh-btn .ar{opacity:.85;font-size:13px}
.zsh-note{display:block;text-align:center;font-size:12px;color:var(--muted);margin-top:8px}
html[data-theme=dark] .zsh-btn{background:var(--accent-2);color:#0d0f15!important}
.zsh-row{display:flex;align-items:center;gap:12px;text-decoration:none!important;color:inherit!important;border:1px dashed color-mix(in srgb,var(--accent) 40%,var(--line))!important;background:color-mix(in srgb,var(--accent) 5%,var(--card))!important}
.zsh-row .zsh-ic{width:34px;height:34px;border-radius:11px}.zsh-row small{display:block;color:var(--muted);font-size:12px}`;
try{const s=document.createElement("style");s.id="zsh-css";s.textContent=css;document.head.appendChild(s)}catch(e){}
function card(ph){return`<div class="zsh-card" id="zshc"><div class="zsh-hd"><span class="zsh-ic">${BOOK}</span><div><b>المكتبة الشاملة</b><small>آلاف الكتب الشرعية · ابحث في محتواها</small></div></div>
<form class="zsh-f" action="${HOME}search" method="get" target="_blank" onsubmit="return false"><label class="zsh-in">${SVG}<input type="search" name="q" id="zshq" placeholder="${ph||"اكتب كلمة أو عبارة… (مثال: الصبر)"}" autocomplete="off" enterkeyhint="search" dir="rtl"></label></form>
<a class="zsh-btn" id="zshb" href="${HOME}" target="_blank" rel="noopener">${SVG}<span>ابحث في المكتبة الشاملة</span><span class="ar">↗</span></a>
<small class="zsh-note">المكتبة الشاملة موقع خارجي مجاني</small></div>`}
/* the button is a real <a target=_blank>: a tap on it is a user gesture that iOS (home-screen app) and the Android app hand to the browser instead of navigating inside the app */
function wire(root){const i=root.querySelector("#zshq"),b=root.querySelector("#zshb");if(!i||!b||b._zsh)return;b._zsh=1;
 const upd=()=>{b.href=url(i.value)};i.addEventListener("input",upd);upd();
 b.addEventListener("click",()=>{upd();try{const k=String(i.value||"").trim();if(k){S.zsh=S.zsh||{};S.zsh.last=k.slice(0,80);typeof save==="function"&&save()}}catch(e){}});
 i.addEventListener("keydown",e=>{if(e.key==="Enter"||e.keyCode===13){e.preventDefault();upd();b.click()}});
 try{const l=S.zsh&&S.zsh.last;if(l&&!i.value){i.placeholder="آخر بحث: "+l}}catch(e){}}
const R={lib:1,books:1,pdfs:1,hufaz:1};
function route(){const p=(location.hash.slice(1)||"home").split("/");return{r:p[0],a:p.slice(1).join("/")}}
function ensure(){try{const{r,a}=route();if(!R[r]||(r!=="lib"&&a))return;const v=typeof view!=="undefined"?view:document.getElementById("view");if(!v||v.querySelector("#zshc"))return;
 if(!v.querySelector("h1.page")&&!v.children.length)return;
 const d=document.createElement("div");d.innerHTML=card();const c=d.firstElementChild;
 const h=v.querySelector(":scope > h1.page")||v.querySelector("h1.page");let at=h;if(at){const n=at.nextElementSibling;if(n&&n.matches&&n.matches("p.note,p.k,p.znote"))at=n}
 if(at&&at.parentNode)at.parentNode.insertBefore(c,at.nextSibling);else v.insertBefore(c,v.firstChild);wire(c)}catch(e){}}
ZSH.ensure=ensure;
["lib","books","pdfs","hufaz"].forEach(k=>{const o=V[k];if(typeof o!=="function")return;V[k]=function(){const x=o.apply(this,arguments);ensure();setTimeout(ensure,250);setTimeout(ensure,1200);if(x&&typeof x.then==="function")x.then(()=>{ensure();setTimeout(ensure,200)},()=>{});return x}});
try{const v=typeof view!=="undefined"?view:document.getElementById("view");if(v&&window.MutationObserver)new MutationObserver(()=>{const{r}=route();if(R[r])ensure()}).observe(v,{childList:true})}catch(e){}
/* app search: one extra row «ابحث عن "X" في المكتبة الشاملة» under the feature results */
function srow(q){return`<a class="zli zsh-row" id="zshr" href="${esc(url(q))}" target="_blank" rel="noopener"><span class="zsh-ic">${BOOK}</span><span class="grow">ابحث عن «${esc(q.trim().slice(0,60))}» في المكتبة الشاملة<small>موقع خارجي مجاني · يفتح في المتصفح</small></span><span style="color:var(--muted)">↗</span></a>`}
function addRow(inp){try{const out=document.getElementById("zsres");if(!out)return;const old=out.querySelector("#zshr");old&&old.remove();const q=String(inp.value||"").trim();if(!q||/^\d{6}$/.test(q.replace(/[٠-٩]/g,"0")))return;
 const w=document.createElement("div");w.className="zlist";w.style.marginTop="10px";w.innerHTML=srow(q);out.hidden=false;out.appendChild(w)}catch(e){}}
document.addEventListener("input",e=>{const t=e.target;if(t&&t.id==="zsq")addRow(t)});
const _s=V.sections;if(typeof _s==="function"){V.sections=function(){const x=_s.apply(this,arguments);const i=document.getElementById("zsq");if(i&&i.value)addRow(i);return x}}
if(typeof V.search==="function")V.search=()=>V.sections("q");
setTimeout(ensure,0)}();
