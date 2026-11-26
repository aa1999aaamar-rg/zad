/* زاد v5.0 — «ديوانية زاد» (#diwan) و«دروس زاد» (#dorous). Lazy module on zad-content (/x/zb6.js), loaded by site/zs.js.
   Diwaniya: server /api/social/dw/* (srv/dw.js, D1 sc_dw_*), device id = the app's zad.dev (ZS.api sends it), display name defaults to S.profile.name.
   Dorous: catalogue + YouTube RSS from /api/dorous/* (the Worker fetches and caches the feeds ~6 h); playback = youtube-nocookie embed.
   No AI-written religious text anywhere: the only fixed religious line is the rules card عمار asked for. Avatars are letters, never pictures. */
(function(){'use strict';if(window.ZB6)return;
const zi=window.ZI||(()=>''),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sv=()=>{try{save()}catch(e){}},tst=m=>{try{toast(m)}catch(e){}},vb=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const api=(p,b)=>ZS.api(p,b);
const err=(r,d)=>(r&&r.msg)||(r&&r._s===429?'محاولات كثيرة، تمهّل قليلًا':d||'تعذّر الاتصال، حاول مرة أخرى');
const NEW='<em class="zs-new">جديد</em>';
const Z=S.zb6=Object.assign({dw:{f:'for'},dr:{fav:[],later:[],prog:{},wt:{}}},S.zb6||{});
Z.dw=Object.assign({f:'for'},Z.dw||{});Z.dr=Object.assign({fav:[],later:[],prog:{},wt:{}},Z.dr||{});
['fav','later'].forEach(k=>{if(!Array.isArray(Z.dr[k]))Z.dr[k]=[]});['prog','wt'].forEach(k=>{if(!Z.dr[k]||typeof Z.dr[k]!=='object')Z.dr[k]={}});
const dK=d=>{const x=d?new Date(d):new Date();return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const ago=t=>{if(!t||isNaN(t))return'';const s=Math.max(0,(Date.now()-t)/1e3);if(s<60)return'الآن';if(s<3600)return ar(Math.floor(s/60))+' د';if(s<86400)return ar(Math.floor(s/3600))+' س';if(s<7*86400)return ar(Math.floor(s/86400))+' ي';const d=new Date(t);return ar(d.getDate())+'/'+ar(d.getMonth()+1)+(d.getFullYear()!==new Date().getFullYear()?'/'+ar(d.getFullYear()):'')};
const num=n=>!n?'':n<1000?ar(n):ar((n/1000).toFixed(n<10000?1:0).replace(/\.0$/,''))+' ألف';
const fmt=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return ar((h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0'))};
const IC={reply:'<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/>',rt:'<path d="m17 2 3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="m7 22-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',heart:'<path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',share:'<path d="M12 3v13"/><path d="m7 8 5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',more:'<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',img:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="16" cy="9" r="1.6"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>',back:'<path d="m9 6 6 6-6 6"/>',pin:'<path d="M9 4h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 15v6"/>',play:'<path d="M8 5v14l11-7z"/>',star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',list:'<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".8"/><circle cx="4" cy="12" r=".8"/><circle cx="4" cy="18" r=".8"/>',quote:'<path d="M10 7H5v6h4l-2 4M19 7h-5v6h4l-2 4"/>',user:'<circle cx="12" cy="12" r="9"/><path d="M8 10h8M8 14h5"/>',shield:'<path d="M12 3 5 6v6c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6z"/><path d="m9 12 2 2 4-4"/>',flag:'<path d="M5 21V4h11l-2 4 2 4H5"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',block:'<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>'};
const ic=(k,c)=>`<svg class="b6i${c?' '+c:''}" viewBox="0 0 24 24" fill="${c==='on'&&(k==='heart'||k==='star')?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||''}</svg>`;
const PAL=['#34457a','#c0693f','#2f6f62','#7a3343','#5b4b8a','#8a6a2f','#2d5f86','#6b4f3a'];
const avc=id=>{let h=0;for(const ch of String(id||''))h=(h*31+ch.charCodeAt(0))>>>0;return PAL[h%PAL.length]};
const av=(u,sz)=>{sz=sz||42;return`<span class="b6av" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.43)}px;background:${avc(u&&u.id)}" aria-hidden="true">${esc([...String((u&&u.name)||'؟').trim()][0]||'؟')}</span>`};
const css=`
.b6{padding-bottom:90px}.b6i{width:20px;height:20px;flex:none}
.b6top{position:sticky;top:0;z-index:6;background:color-mix(in srgb,var(--bg) 93%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);margin:0 -14px;padding:6px 10px 0;border-bottom:1px solid var(--line)}
.b6bar{display:flex;align-items:center;gap:4px;min-height:46px}.b6bar h1{margin:0 4px;font-size:20px;flex:1;display:flex;align-items:center;gap:8px;min-width:0;white-space:nowrap}
.b6ib{position:relative;border:0;background:none;color:inherit;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;cursor:pointer;text-decoration:none;flex:none}.b6ib:active{background:var(--line)}
.b6dot{position:absolute;top:2px;left:2px;min-width:17px;height:17px;border-radius:9px;background:#c0693f;color:#fff;font-size:10.5px;line-height:17px;text-align:center;padding:0 4px;font-weight:700}
.b6tabs{display:flex}.b6tabs button{flex:1;border:0;background:none;color:var(--muted);font:inherit;font-size:15px;padding:11px 0 10px;cursor:pointer;position:relative;font-weight:600}.b6tabs button.on{color:var(--ink)}.b6tabs button.on:after{content:"";position:absolute;bottom:0;left:32%;right:32%;height:4px;border-radius:4px;background:#34457a}
.b6rules{display:flex;gap:10px;align-items:flex-start;background:color-mix(in srgb,#34457a 7%,var(--card));border:1px solid color-mix(in srgb,#34457a 22%,transparent);border-radius:16px;padding:11px 12px;margin:12px 0 4px;font-size:13.5px;line-height:1.8}.b6rules b{color:#34457a}.b6rules .b6i{color:#34457a;margin-top:3px}
.b6post{display:flex;gap:10px;padding:12px 2px;border-bottom:1px solid var(--line);cursor:pointer;position:relative}.b6post.thr{border-bottom:0}.b6post.thr:before{content:"";position:absolute;right:22px;top:58px;bottom:-6px;width:2px;background:var(--line)}
.b6av{flex:none;border-radius:50%;color:#fff;display:grid;place-items:center;font-weight:700}
.b6b{flex:1;min-width:0}.b6h{display:flex;align-items:center;gap:6px;font-size:14.5px;min-width:0}.b6h a{color:inherit;text-decoration:none;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}.b6h small{color:var(--muted);white-space:nowrap}.b6h .b6m{margin-inline-start:auto;border:0;background:none;color:var(--muted);padding:2px 4px;cursor:pointer}
.b6meta{font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:5px;margin:0 0 3px}.b6meta .b6i{width:15px;height:15px}.b6meta a{color:inherit;text-decoration:none}
.b6t{font-size:15.5px;line-height:1.75;white-space:pre-wrap;overflow-wrap:anywhere;margin:2px 0 4px}.b6t a{color:#2d5f86;text-decoration:none}
.b6im{margin:6px 0;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--line)}.b6im img{display:block;width:100%;height:auto;max-height:420px;object-fit:cover}
.b6q{border:1px solid var(--line);border-radius:14px;padding:9px 11px;margin:6px 0;font-size:14px;background:color-mix(in srgb,var(--ink) 2%,var(--card))}.b6q .b6t{font-size:14px;margin:2px 0 0}
.b6act{display:flex;justify-content:space-between;max-width:320px;margin-top:2px}.b6act button{border:0;background:none;color:var(--muted);display:flex;align-items:center;gap:4px;font:inherit;font-size:13px;padding:6px 4px;cursor:pointer;border-radius:99px;min-width:44px}.b6act button .b6i{width:18px;height:18px}
.b6act .lk.on{color:#c0393f}.b6act .rt.on{color:#2f7a4f}.b6hid{font-size:12px;color:#a4532c;background:color-mix(in srgb,#c0693f 12%,transparent);border-radius:8px;padding:2px 8px;display:inline-block;margin:2px 0}
.b6pin{font-size:12px;color:#34457a;font-weight:700;display:flex;align-items:center;gap:4px;margin-bottom:2px}.b6pin .b6i{width:14px;height:14px}
.b6fab{position:fixed;left:18px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:20;width:58px;height:58px;border-radius:50%;border:0;background:#34457a;color:#fff;display:grid;place-items:center;box-shadow:0 10px 26px rgba(29,37,69,.35);cursor:pointer}.b6fab .b6i{width:26px;height:26px}
.b6more{text-align:center;color:var(--muted);font-size:13px;padding:18px}.b6empty{text-align:center;color:var(--muted);padding:28px 10px;line-height:1.9}
.b6ptr{height:0;overflow:hidden;text-align:center;color:var(--muted);font-size:13px;transition:height .2s}.b6ptr.on{height:38px;line-height:38px}
.b6sh{position:fixed;inset:0;z-index:1000;background:rgba(15,20,40,.45);display:flex;align-items:flex-end;justify-content:center}.b6sh>div{background:var(--card);color:var(--ink);width:100%;max-width:560px;border-radius:22px 22px 0 0;padding:14px 14px calc(16px + env(safe-area-inset-bottom));max-height:92vh;overflow:auto;animation:b6up .22s ease;box-sizing:border-box}
@keyframes b6up{from{transform:translateY(40px);opacity:.4}to{transform:none;opacity:1}}
.b6sh input[type=text],.b6 input[type=search],.b7 input[type=search]{width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:14px;padding:11px 12px;font:inherit;font-size:16px}
.b6sh textarea{flex:1;border:0;min-height:120px;resize:none;padding:6px 2px;font:inherit;font-size:17px;line-height:1.7;outline:none;background:none;color:inherit}
.b6btn{border:0;background:#34457a;color:#fff;border-radius:99px;padding:10px 18px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer}.b6btn:disabled{opacity:.45}.b6btn.gh{background:none;color:#34457a;border:1px solid color-mix(in srgb,#34457a 40%,transparent)}.b6btn.dg{background:#c0693f}.b6btn.blk{display:block;width:100%;margin-top:10px}
.b6row{display:flex;gap:8px;align-items:center}.b6grow{flex:1;min-width:0}
.b6ring{width:28px;height:28px;flex:none}.b6cnt{font-size:12px;color:var(--muted)}.b6cnt.over{color:#c0393f;font-weight:700}
.b6menu button{display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;color:inherit;font:inherit;font-size:15.5px;padding:13px 6px;border-bottom:1px solid var(--line);cursor:pointer;text-align:start}.b6menu button:last-child{border-bottom:0}.b6menu button.dg{color:#c0393f}
.b6prof{padding:0 0 10px}.b6prof .bn{height:84px;margin:0 -14px;background:linear-gradient(135deg,#34457a,#1d2545)}.b6prof .ph{display:flex;justify-content:space-between;align-items:flex-end;margin-top:-36px}.b6prof .ph .b6av{border:3px solid var(--card)}.b6prof h2{margin:8px 0 2px;font-size:20px}.b6prof .bio{font-size:14.5px;line-height:1.7;margin:6px 0}.b6prof .ff{display:flex;gap:16px;font-size:14px;color:var(--muted);margin-top:6px}.b6prof .ff a,.b6prof .ff span{color:inherit;text-decoration:none}.b6prof .ff b{color:var(--ink)}
.b6sub{display:flex;border-bottom:1px solid var(--line)}.b6sub button{flex:1;border:0;background:none;font:inherit;color:var(--muted);padding:11px 0;cursor:pointer;font-weight:600}.b6sub button.on{color:var(--ink);box-shadow:inset 0 -3px 0 #34457a}
.b6n{display:flex;gap:10px;padding:12px 4px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}.b6n.new{background:color-mix(in srgb,#34457a 6%,transparent)}.b6n .k{width:28px;flex:none;padding-top:4px}.b6n .k .b6i{width:22px;height:22px}
.b6u{display:flex;gap:10px;align-items:center;padding:10px 2px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
.b6trend{display:block;padding:10px 2px;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;line-height:1.6}.b6trend small{color:var(--muted)}
.b6view{position:fixed;inset:0;z-index:1001;background:rgba(0,0,0,.92);display:grid;place-items:center}.b6view img{max-width:100%;max-height:100%}
.b7 .b7chips,.b7chips{display:flex;gap:6px;overflow-x:auto;padding:6px 0 8px;scrollbar-width:none}.b7chips::-webkit-scrollbar{display:none}
.b7chip{flex:none;display:flex;align-items:center;gap:5px;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:99px;padding:7px 13px;font:inherit;font-size:13.5px;cursor:pointer;text-decoration:none}.b7chip .b6i{width:16px;height:16px}.b7chip.on{background:#34457a;color:#fff;border-color:#34457a}
.b7grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.b7sh{display:flex;flex-direction:column;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px;text-decoration:none;color:inherit;min-height:112px}
.b7sh .mono{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:19px;font-family:'Amiri',serif}
.b7sh b{font-size:14px;line-height:1.5}.b7sh small{color:var(--muted);font-size:12px}
.b7sec{display:flex;align-items:center;justify-content:space-between;margin:16px 0 6px}.b7sec h3{margin:0;font-size:16.5px;display:flex;gap:6px;align-items:center}.b7sec h3 svg{width:18px;height:18px}
.b7hs{display:flex;gap:10px;overflow-x:auto;padding:2px 0 8px;scrollbar-width:none}.b7hs::-webkit-scrollbar{display:none}
.b7v{flex:none;width:208px;text-decoration:none;color:inherit}.b7v .th,.b7li .th{position:relative;border-radius:14px;overflow:hidden;aspect-ratio:16/9;background:var(--line)}.b7v img,.b7li img{width:100%;height:100%;object-fit:cover;display:block}
.b7v .pr,.b7li .pr{position:absolute;bottom:0;right:0;left:0;height:4px;background:rgba(255,255,255,.4)}.b7v .pr i,.b7li .pr i{display:block;height:100%;background:#c0693f;margin-inline-start:auto;margin-inline-end:0}
.b7v b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13.5px;line-height:1.55;margin-top:6px}.b7v small{color:var(--muted);font-size:11.5px}
.b7li{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit;align-items:flex-start}.b7li .th{flex:none;width:136px;border-radius:12px}
.b7li b{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;line-height:1.55}.b7li small{color:var(--muted);font-size:12px;display:block;margin-top:3px}
.b7pl{display:flex;gap:10px;align-items:center;padding:12px;margin:8px 0;background:var(--card);border:1px solid var(--line);border-radius:16px;text-decoration:none;color:inherit}.b7pl .ic{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,#34457a 10%,transparent);color:#34457a;flex:none}.b7pl b{font-size:14.5px;line-height:1.5}.b7pl small{color:var(--muted);font-size:12px}.b7pl>svg:last-child{width:18px;height:18px;color:var(--muted);flex:none}
.b7tag{display:inline-block;font-size:11px;border-radius:99px;padding:1px 8px;background:color-mix(in srgb,#c0693f 13%,transparent);color:#a4532c;margin-inline-start:4px;vertical-align:middle}
.b7player{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;margin:8px 0}.b7player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.b7ttl{font-size:17px;line-height:1.6;margin:8px 0 4px}.b7src{font-size:12.5px;color:var(--muted);line-height:1.8}.b7src a{color:#34457a}
.b7acts{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.b7acts button,.b7acts a{display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:99px;padding:8px 13px;font:inherit;font-size:13.5px;cursor:pointer;text-decoration:none}.b7acts .b6i{width:17px;height:17px}.b7acts .on{background:#34457a;color:#fff;border-color:#34457a}
.b7note{font-size:12.5px;color:var(--muted);line-height:1.8;margin:10px 0}
.zb6home{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.zb6home a{position:relative;display:flex;flex-direction:column;gap:4px;border-radius:20px;padding:14px 12px;text-decoration:none;color:#fff;min-height:96px;overflow:hidden}.zb6home a b{font-size:16px}.zb6home a small{font-size:12px;opacity:.9;line-height:1.6}.zb6home a .zs-new{position:absolute;top:10px;left:10px;margin:0}.zb6home a svg{width:24px;height:24px}.zb6home .dw{background:linear-gradient(135deg,#34457a,#1d2545)}.zb6home .dr{background:linear-gradient(135deg,#c0693f,#8a4426)}.zb6home .cnt{position:absolute;bottom:10px;left:10px;background:#fff;color:#c0693f;border-radius:99px;font-size:11px;font-weight:700;padding:1px 7px}
`;
function addCss(){if($('#b6css'))return;const s=document.createElement('style');s.id='b6css';s.textContent=css;document.head.appendChild(s)}
function sheet(html,onClose){const el=document.createElement('div');el.className='b6sh';el.innerHTML=`<div role="dialog" aria-modal="true">${html}</div>`;document.body.appendChild(el);const close=()=>{if(!el.isConnected)return;el.remove();onClose&&onClose()};el.addEventListener('click',e=>{if(e.target===el)close()});el.close=close;return el}
const back=(h,t)=>`<a class="back" href="#${h}">${zi('chev')} ${t||'رجوع'}</a>`;
/* =================================== ديوانية زاد =================================== */
const RULES='الديوانية للخير: لا فتاوى ولا أحاديث بدون مصدر، ولا إساءة. انسب كل حديث لمصدره';
let ME=null,MEP=null,UNREAD=0;
const loadMe=force=>{if(ME&&!force)return Promise.resolve(ME);if(MEP)return MEP;MEP=api('dw/me').then(r=>{if(r&&r.ok){ME=r.me;UNREAD=r.unread||0;if(ME&&!Z.dw.has){Z.dw.has=1;sv()}badge()}MEP=null;return ME}).catch(()=>{MEP=null;return ME});return MEP};
function badge(){try{$$('[data-b6unread]').forEach(e=>{e.textContent=UNREAD?ar(Math.min(UNREAD,99)):'';e.hidden=!UNREAD});ZS.dwUnread&&ZS.dwUnread(UNREAD)}catch(e){}}
const linkify=t=>esc(t).replace(/#([\p{L}\p{N}_]{2,30})/gu,(m,g)=>`<a href="#diwan/tag/${encodeURIComponent(g)}" data-stop>#${g}</a>`);
const imgUrl=id=>'/api/social/dw/img/'+id;
const POSTS={};
function quoteHTML(q){if(!q)return'';if(q.gone)return`<div class="b6q b6empty" style="padding:8px">التغريدة المقتبسة غير متاحة</div>`;POSTS[q.id]=POSTS[q.id]||q;
 return`<div class="b6q" data-open="${q.id}"><div class="b6h">${av(q.u,22)}<a href="#diwan/u/${q.u.id}" data-stop>${esc(q.u.name)}</a><small>· ${ago(q.at)}</small></div>${q.text?`<div class="b6t">${linkify(q.text)}</div>`:''}${q.img?`<div class="b6im"><img loading="lazy" alt="صورة مرفقة" src="${imgUrl(q.img)}"></div>`:''}</div>`}
function postHTML(p,o={}){if(!p)return'';POSTS[p.id]=p;
 if(p.gone)return`<div class="b6post"><div class="b6b b6empty" style="padding:6px">هذه التغريدة غير متاحة</div></div>`;
 return`<article class="b6post${o.thr?' thr':''}" data-open="${p.id}" data-o="${o.thr?'t':''}${o.inThread?'i':''}${o.pin?'p':''}">
 ${av(p.u)}<div class="b6b">
 ${o.pin?`<div class="b6pin">${ic('pin')} مثبّتة من الإدارة</div>`:''}${p.rp?`<div class="b6meta">${ic('rt')} <a href="#diwan/u/${p.rp.id}" data-stop>أعاد نشرها ${esc(p.rp.name)}</a></div>`:''}
 <div class="b6h"><a href="#diwan/u/${p.u.id}" data-stop>${esc(p.u.name)}</a><small>· ${ago(p.at)}</small><button class="b6m" data-menu="${p.id}" aria-label="خيارات">${ic('more')}</button></div>
 ${p.reply_to&&!o.inThread?`<div class="b6meta">ردًا على ${p.reply_to.name?esc(p.reply_to.name):'تغريدة'}</div>`:''}
 ${p.hidden?`<span class="b6hid">مخفية عن الآخرين (بلاغات أو مراجعة)</span>`:''}
 ${p.text?`<div class="b6t">${linkify(p.text)}</div>`:''}${p.img?`<div class="b6im" data-img="${p.img}"><img loading="lazy" alt="صورة مرفقة" src="${imgUrl(p.img)}"></div>`:''}${quoteHTML(p.quote)}
 <div class="b6act"><button data-reply="${p.id}" aria-label="رد">${ic('reply')}<span>${num(p.replies)}</span></button><button class="rt${p.reposted?' on':''}" data-rt="${p.id}" aria-label="إعادة نشر">${ic('rt')}<span>${num(p.reposts)}</span></button><button class="lk${p.liked?' on':''}" data-like="${p.id}" aria-label="إعجاب">${ic('heart',p.liked?'on':'')}<span>${num(p.likes)}</span></button><button data-share="${p.id}" aria-label="مشاركة">${ic('share')}</button></div>
 </div></article>`}
function refreshPost(id){const p=POSTS[id];if(!p)return;$$(`article[data-open="${id}"]`).forEach(a=>{const f=a.dataset.o||'';const t=document.createElement('div');t.innerHTML=postHTML(p,{thr:f.includes('t'),inThread:f.includes('i'),pin:f.includes('p')});a.replaceWith(t.firstElementChild)})}
async function needProfile(){await loadMe();if(ME)return true;return new Promise(ok=>profileSheet(r=>ok(!!r)))}
function profileSheet(done){const nm=(ME&&ME.name)||(S.profile&&S.profile.name)||'';
 const el=sheet(`<h3 style="margin:2px 0 6px">${ME?'تعديل ملفك':'أهلًا بك في ديوانية زاد'}</h3>${ME?'':'<p class="b7note" style="margin:0 0 10px">اختر الاسم الذي يظهر للناس. لا تحتاج رقم جوال ولا بريد — حسابك مرتبط بهذا الجهاز.</p>'}
 <label class="b7note" for="b6nm" style="display:block;margin:0 0 4px">الاسم</label><input type="text" id="b6nm" maxlength="30" value="${esc(nm)}" placeholder="مثال: أبو عبدالله">
 <label class="b7note" for="b6bio" style="display:block;margin:10px 0 4px">نبذة قصيرة (اختياري)</label><input type="text" id="b6bio" maxlength="120" value="${esc((ME&&ME.bio)||'')}" placeholder="سطر عنك">
 <div class="b6rules" style="margin-top:12px">${ic('shield')}<span><b>قبل أن تبدأ:</b> ${RULES}.</span></div>
 <button class="b6btn blk" id="b6ps">${ME?'حفظ':'ابدأ'}</button>${ME?`<button class="b6btn gh blk" id="b6del" style="color:#c0393f;border-color:#e3b9b9">احذف حسابي في الديوانية</button>`:''}`,()=>{const d=done;done=null;d&&d(null)});
 $('#b6ps',el).onclick=async()=>{const b=$('#b6ps',el);b.disabled=true;const r=await api('dw/profile',{name:$('#b6nm',el).value,bio:$('#b6bio',el).value});b.disabled=false;if(!r.ok)return tst(err(r));ME=r.me;Z.dw.has=1;sv();if(S.profile&&!S.profile.name){S.profile.name=ME.name;sv()}const d=done;done=null;el.close();tst('تم ✓');d&&d(ME);if(!d||location.hash.startsWith('#diwan/u/'))rerender()};
 const del=$('#b6del',el);if(del)del.onclick=async()=>{if(!confirm('حذف حسابك في الديوانية؟ تُحذف تغريداتك وردودك وإعجاباتك ومتابعاتك نهائيًا.'))return;const r=await api('dw/deleteme',{});if(!r.ok)return tst(err(r));ME=null;done=null;el.close();tst('حُذف حسابك');location.hash='diwan'}}
const devId=()=>{try{return localStorage.getItem('zad.dev')||''}catch(e){return''}};
async function shrink(f){const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});const s=Math.min(1,1280/Math.max(im.naturalWidth,im.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);let q=.85,b;do{b=await new Promise(ok=>c.toBlob(ok,'image/jpeg',q));q-=.12}while(b&&b.size>1200*1024&&q>.3);if(!b)throw new Error('img');return b}
async function upImg(blob){const r=await fetch('/api/social/dw/img',{method:'POST',headers:{'Content-Type':'image/jpeg','X-Zad-Dev':devId()},body:blob}).then(async r=>{const j=await r.json().catch(()=>({ok:false}));j._s=r.status;return j}).catch(()=>({ok:false}));return r}
/* compose: a new post, a reply (to) or a quote (qt); tag pre-fills #tag */
function compose(o={}){needProfile().then(okp=>{if(!okp)return;let blob=null;
 const ctx=o.to?POSTS[o.to]:o.qt?POSTS[o.qt]:null,lbl=o.to?'رد':'نشر';
 const el=sheet(`<div class="b6row" style="margin-bottom:6px"><button class="b6ib" id="b6cx" aria-label="إغلاق">${ic('x')}</button><span class="b6grow"></span><button class="b6btn" id="b6go" disabled>${lbl}</button></div>
 ${ctx&&o.to?`<div class="b6meta" style="margin:0 2px 8px">ردًا على&nbsp;<b style="color:var(--ink)">${esc(ctx.u.name)}</b></div>`:''}
 <div class="b6row" style="align-items:flex-start">${av(ME)}<textarea id="b6tx" maxlength="400" placeholder="${o.to?'اكتب ردّك…':o.qt?'أضف تعليقك…':'ما الذي في خاطرك من الخير؟'}" aria-label="نص التغريدة"></textarea></div>
 <div id="b6pv"></div>${ctx&&o.qt?quoteHTML(ctx).replace(/data-open="[^"]*"/,''):''}
 <div class="b6row" style="border-top:1px solid var(--line);padding-top:8px;margin-top:8px"><label class="b6ib" style="color:#34457a;cursor:pointer" aria-label="أضف صورة">${ic('img')}<input type="file" accept="image/*" id="b6f" hidden></label><span class="b6grow b7note" style="margin:0">${o.to?'':'#وسم يجمع المواضيع'}</span><span class="b6cnt" id="b6cn"></span><svg class="b6ring" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--line)" stroke-width="3"/><circle id="b6rc" cx="14" cy="14" r="11" fill="none" stroke="#34457a" stroke-width="3" stroke-dasharray="69.1" stroke-dashoffset="69.1" transform="rotate(-90 14 14)" stroke-linecap="round"/></svg></div>
 <p class="b7note" style="margin:8px 0 0">${RULES}.</p>`);
 const tx=$('#b6tx',el),go=$('#b6go',el);
 const upd=()=>{const n=[...tx.value.trim()].length,l=280-n,rc=$('#b6rc',el);rc.setAttribute('stroke-dashoffset',String(69.1*(1-Math.min(1,n/280))));rc.setAttribute('stroke',l<0?'#c0393f':l<20?'#c0693f':'#34457a');const c=$('#b6cn',el);c.textContent=l<=20?ar(l):'';c.classList.toggle('over',l<0);go.disabled=(!n&&!blob)||l<0};
 tx.oninput=upd;if(o.tag){tx.value=' #'+o.tag;upd()}setTimeout(()=>{tx.focus();try{tx.setSelectionRange(0,0)}catch(e){}},120);$('#b6cx',el).onclick=()=>el.close();
 $('#b6f',el).onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{blob=await shrink(f);$('#b6pv',el).innerHTML=`<div class="b6im" style="position:relative"><img src="${URL.createObjectURL(blob)}" alt="معاينة"><button class="b6ib" id="b6rm" style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,.55);color:#fff" aria-label="إزالة الصورة">${ic('x')}</button></div>`;$('#b6rm',el).onclick=()=>{blob=null;$('#b6pv',el).innerHTML='';upd()}}catch(x){tst('تعذّر قراءة الصورة')}upd()};
 const fail=m=>{tst(m);go.disabled=false;go.textContent=lbl};
 go.onclick=async()=>{go.disabled=true;go.textContent='…';try{let img;
  if(blob){const r=await upImg(blob);if(!r.ok)return fail(err(r,'تعذّر رفع الصورة'));img=r.id}
  const r=await api('dw/post',{text:tx.value,img,reply_to:o.to||undefined,quote_of:o.qt||undefined});
  if(!r.ok)return fail(err(r));
  el.close();vb(15);tst(o.to?'تم الرد ✓':'نُشرت ✓');
  if(o.to&&POSTS[o.to]){POSTS[o.to].replies++;refreshPost(o.to)}if(o.qt&&POSTS[o.qt]){POSTS[o.qt].reposts++;refreshPost(o.qt)}
  const fl=$('#b6list');if(fl&&!o.to&&/^#diwan\/?$/.test(location.hash)){const e0=fl.querySelector('.b6empty');e0&&e0.remove();fl.insertAdjacentHTML('afterbegin',postHTML(r.post))}
  const rl=$('#b6replies');if(rl&&o.to&&location.hash==='#diwan/p/'+o.to){const e0=rl.querySelector('.b6empty');e0&&e0.remove();rl.insertAdjacentHTML('afterbegin',postHTML(r.post,{inThread:1}))}
 }catch(x){fail('تعذّر النشر')}}})}
/* one delegated click handler for every Diwaniya screen */
let BOUND=false;
function bindView(){if(BOUND)return;BOUND=true;view.addEventListener('click',onClick)}
async function onClick(e){if(!location.hash.startsWith('#diwan'))return;const t=e.target;
 const a=t.closest('[data-like],[data-rt],[data-reply],[data-share],[data-menu],[data-img],[data-stop],[data-open],[data-fol],[data-ftab]');if(!a)return;
 if(a.hasAttribute('data-stop'))return;
 if(a.dataset.img){e.stopPropagation();const v=document.createElement('div');v.className='b6view';v.innerHTML=`<img src="${imgUrl(a.dataset.img)}" alt="صورة">`;v.onclick=()=>v.remove();document.body.appendChild(v);return}
 if(a.dataset.like){e.stopPropagation();if(!(await needProfile()))return;const id=a.dataset.like,p=POSTS[id];const flip=()=>{if(p){p.liked=p.liked?0:1;p.likes=Math.max(0,p.likes+(p.liked?1:-1));refreshPost(id)}};flip();vb(8);const r=await api('dw/like',{id});if(!r.ok){tst(err(r));flip()}else if(p){p.liked=r.liked?1:0;p.likes=r.likes;refreshPost(id)}return}
 if(a.dataset.rt){e.stopPropagation();const id=a.dataset.rt,p=POSTS[id];const el=sheet(`<div class="b6menu"><button id="b6r1">${ic('rt')} ${p&&p.reposted?'تراجع عن إعادة النشر':'إعادة نشر'}</button><button id="b6r2">${ic('quote')} اقتباس مع تعليق</button></div>`);
  $('#b6r1',el).onclick=async()=>{el.close();if(!(await needProfile()))return;const r=await api('dw/repost',{id});if(!r.ok)return tst(err(r));if(p){p.reposted=r.reposted?1:0;p.reposts=r.reposts;refreshPost(id)}vb(10);tst(r.reposted?'أُعيد نشرها ✓':'تم التراجع')};
  $('#b6r2',el).onclick=()=>{el.close();compose({qt:id})};return}
 if(a.dataset.reply){e.stopPropagation();compose({to:a.dataset.reply});return}
 if(a.dataset.share){e.stopPropagation();const p=POSTS[a.dataset.share];const url=(window.ZAD_URL||location.origin+location.pathname.replace(/index\.html$/,''))+'#diwan/p/'+a.dataset.share;const txt=p&&p.text?p.text.slice(0,120):'تغريدة في ديوانية زاد';try{if(navigator.share){await navigator.share({title:'ديوانية زاد',text:txt,url});return}}catch(x){if(x&&x.name==='AbortError')return}try{await navigator.clipboard.writeText(url);tst('تم نسخ الرابط')}catch(x){}return}
 if(a.dataset.menu){e.stopPropagation();postMenu(a.dataset.menu);return}
 if(a.dataset.fol){e.stopPropagation();follow(a.dataset.fol,a);return}
 if(a.dataset.ftab){Z.dw.f=a.dataset.ftab;sv();feed();return}
 if(a.dataset.open){if(t.closest('a'))return;const id=a.dataset.open;if(location.hash!=='#diwan/p/'+id)location.hash='diwan/p/'+id}}
function postMenu(id){const p=POSTS[id];if(!p)return;
 const el=sheet(`<div class="b6menu">${p.mine?`<button id="b6md" class="dg">${ic('trash')} حذف التغريدة</button>`:`<button id="b6mr" class="dg">${ic('flag')} إبلاغ عن التغريدة</button><button id="b6mb">${ic('block')} حظر ${esc(p.u.name)}</button><button id="b6mf">${ic('user')} ملف ${esc(p.u.name)}</button>`}<button id="b6mc">${ic('copy')} نسخ النص</button></div>`);
 const on=(s,f)=>{const b=$(s,el);if(b)b.onclick=()=>{el.close();f()}};
 on('#b6md',async()=>{if(!confirm('حذف التغريدة نهائيًا؟'))return;const r=await api('dw/delete',{id});if(!r.ok)return tst(err(r));$$(`article[data-open="${id}"]`).forEach(x=>x.remove());tst('حُذفت');if(location.hash==='#diwan/p/'+id)location.hash='diwan'});
 on('#b6mr',()=>reportSheet(id));on('#b6mb',()=>block(p.u.id,p.u.name));on('#b6mf',()=>{location.hash='diwan/u/'+p.u.id});
 on('#b6mc',async()=>{try{await navigator.clipboard.writeText(p.text||'');tst('تم النسخ')}catch(x){}})}
function reportSheet(id){const R=['إساءة أو ألفاظ','فتوى أو حديث بلا مصدر','محتوى غير لائق','إزعاج أو إعلان','أخرى'];
 const el=sheet(`<h3 style="margin:2px 0 8px">إبلاغ</h3><div class="b6menu">${R.map((x,i)=>`<button data-r="${i}">${esc(x)}</button>`).join('')}</div><p class="b7note">تُخفى التغريدة تلقائيًا بعد ٣ بلاغات من أشخاص مختلفين حتى يراجعها المشرف.</p>`);
 $$('[data-r]',el).forEach(b=>b.onclick=async()=>{el.close();const r=await api('dw/report',{id,reason:R[+b.dataset.r]});if(!r.ok)return tst(err(r));tst('شكرًا، وصل البلاغ');if(r.hidden)$$(`article[data-open="${id}"]`).forEach(x=>x.remove())})}
async function block(uid,name){if(!(await needProfile()))return;const r0=await api('dw/user?u='+uid);const isB=r0.ok&&r0.user&&r0.user.blocked;if(!confirm(isB?'إلغاء حظر '+name+'؟':'حظر '+name+'؟ لن ترى تغريداته ولن يستطيع الرد عليك أو متابعتك.'))return;const r=await api('dw/block',{u:uid});if(!r.ok)return tst(err(r));tst(r.blocked?'تم الحظر':'أُلغي الحظر');if(r.blocked)$$('article.b6post').forEach(a=>{const p=POSTS[a.dataset.open];if(p&&(p.u.id===uid||(p.rp&&p.rp.id===uid)))a.remove()});if(location.hash.startsWith('#diwan/u/'))rerender()}
async function follow(uid,btn){if(!(await needProfile()))return;btn&&(btn.disabled=true);const r=await api('dw/follow',{u:uid});btn&&(btn.disabled=false);if(!r.ok)return tst(err(r));vb(10);if(location.hash.startsWith('#diwan/u/'))rerender();else if(btn){btn.textContent=r.following?'تتابعه':'تابِع';btn.classList.toggle('gh',r.following)}}
/* pull to refresh + infinite scroll */
let PTR=null;
function ptr(onRefresh){if(PTR)PTR();let y0=null,dy=0;const st=e=>{if(window.scrollY>2||$('.b6sh'))return;y0=e.touches[0].clientY;dy=0},mv=e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;const box=$('#b6ptr');if(box){box.classList.toggle('on',dy>24);box.textContent=dy>80?'أفلت للتحديث':'اسحب للتحديث'}},en=()=>{if(y0==null)return;const d=dy,box=$('#b6ptr');y0=null;if(d>80){box&&(box.textContent='جارٍ التحديث…');onRefresh().finally(()=>{const b=$('#b6ptr');b&&b.classList.remove('on')})}else box&&box.classList.remove('on')};
 window.addEventListener('touchstart',st,{passive:true});window.addEventListener('touchmove',mv,{passive:true});window.addEventListener('touchend',en);
 PTR=()=>{window.removeEventListener('touchstart',st);window.removeEventListener('touchmove',mv);window.removeEventListener('touchend',en);PTR=null}}
let IO=null;
function more(next,load){if(IO){IO.disconnect();IO=null}const m=$('#b6more');if(!m)return;if(next==null){m.textContent=$('#b6list')&&$('#b6list').querySelector('.b6post')?'وصلت للنهاية ✓':'';return}m.textContent='جارٍ التحميل…';IO=new IntersectionObserver(async es=>{if(!es.some(x=>x.isIntersecting))return;IO.disconnect();IO=null;await load(next)},{rootMargin:'400px'});IO.observe(m)}
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#diwan')){if(PTR)PTR();if(IO){IO.disconnect();IO=null}}});
const meBtn=()=>ME?`<a class="b6ib" href="#diwan/u/${ME.id}" aria-label="ملفي">${av(ME,32)}</a>`:`<button class="b6ib" onclick="ZB6.profile()" aria-label="ملفي">${ic('user')}</button>`;
const top=title=>`<div class="b6top"><div class="b6bar"><h1>${title}</h1><a class="b6ib" href="#diwan/s" aria-label="بحث">${ic('search')}</a><a class="b6ib" href="#diwan/n" aria-label="التنبيهات">${ic('bell')}<span class="b6dot" data-b6unread hidden></span></a>${meBtn()}</div>`;
const backBar=(t,h)=>`<div class="b6top"><div class="b6bar"><a class="b6ib" href="#${h||'diwan'}" aria-label="رجوع">${ic('back')}</a><h1 style="font-size:18px">${t}</h1></div></div>`;
let RENDER=null;const rerender=()=>RENDER&&RENDER();
async function feed(){addCss();bindView();await loadMe();RENDER=feed;const f=Z.dw.f==='fol'?'fol':'for';
 view.innerHTML=`<div class="b6">${top('ديوانية زاد '+NEW)}<div class="b6tabs" role="tablist"><button role="tab" data-ftab="for" class="${f==='for'?'on':''}">لك</button><button role="tab" data-ftab="fol" class="${f==='fol'?'on':''}">المتابَعون</button></div></div>
 <div id="b6ptr" class="b6ptr"></div><div class="b6rules" id="b6rules">${ic('pin')}<span><b>مثبّت:</b> ${RULES}.</span></div><div id="b6pins"></div><div id="b6list"><div class="b6more">جارٍ التحميل…</div></div><div class="b6more" id="b6more"></div></div>
 <button class="b6fab" id="b6fab" aria-label="تغريدة جديدة">${ic('pen')}</button>`;
 $('#b6fab').onclick=()=>compose();badge();
 const load=async c=>{const r=await api('dw/feed?f='+f+(c?'&c='+c:''));const L=$('#b6list');if(!L||!/^#diwan\/?$/.test(location.hash)||(Z.dw.f==='fol'?'fol':'for')!==f)return;
  if(!r.ok){if(!c)L.innerHTML=`<div class="b6empty">${err(r)}<br><button class="b6btn gh" onclick="ZB6.diwan()" style="margin-top:10px">أعد المحاولة</button></div>`;return}
  if(typeof r.unread==='number'){UNREAD=r.unread;badge()}
  if(!c){$('#b6pins').innerHTML=(r.pinned||[]).map(p=>postHTML(p,{pin:1})).join('');L.innerHTML=''}
  if(r.need==='profile'){L.innerHTML=`<div class="b6empty">اختر اسمك وتابع من يعجبك لتظهر تغريداتهم هنا.<br><button class="b6btn" style="margin-top:10px" onclick="ZB6.profile()">اختر اسمك</button></div>`;return more(null)}
  L.insertAdjacentHTML('beforeend',(r.items||[]).map(p=>postHTML(p)).join(''));
  if(!c&&!(r.items||[]).length)L.innerHTML=`<div class="b6empty">${f==='fol'?'لا توجد تغريدات من الأشخاص الذين تتابعهم بعد.<br>جرّب «لك» وتابع من يعجبك.':'كن أول من يكتب في الديوانية 🌿'}<br><button class="b6btn" style="margin-top:10px" onclick="ZB6.compose()">اكتب تغريدة</button></div>`;
  more(r.next,load)};
 ptr(()=>load(0));await load(0)}
async function thread(id){addCss();bindView();await loadMe();RENDER=()=>thread(id);
 view.innerHTML=`<div class="b6">${backBar('التغريدة')}<div id="b6th"><div class="b6more">جارٍ التحميل…</div></div></div>`;
 const r=await api('dw/post?id='+encodeURIComponent(id));const T=$('#b6th');if(!T)return;
 if(!r.ok){T.innerHTML=`<div class="b6empty">${err(r,'التغريدة غير موجودة')}</div>`;return}
 T.innerHTML=(r.parents||[]).map(p=>postHTML(p,{thr:1,inThread:1})).join('')+`<div style="background:color-mix(in srgb,#34457a 5%,transparent);border-radius:14px">${postHTML(r.post)}</div>`
  +`<div class="b6row" style="padding:10px 2px;border-bottom:1px solid var(--line)">${av(ME||{name:'؟'},34)}<button class="b6grow" id="b6rp1" style="text-align:start;border:0;background:none;color:var(--muted);font:inherit;font-size:15px;cursor:pointer">اكتب ردّك…</button><button class="b6btn" id="b6rp2">رد</button></div>`
  +`<div id="b6replies">${(r.replies||[]).map(p=>postHTML(p,{inThread:1})).join('')||'<div class="b6empty" style="padding:18px">لا ردود بعد</div>'}</div>`;
 $('#b6rp1').onclick=$('#b6rp2').onclick=()=>compose({to:r.post.id})}
async function profile(uid,tab){addCss();bindView();await loadMe();tab=tab==='r'?'r':'p';RENDER=()=>profile(uid,tab);
 view.innerHTML=`<div class="b6">${backBar('الملف')}<div id="b6pf"><div class="b6more">جارٍ التحميل…</div></div><div id="b6list"></div><div class="b6more" id="b6more"></div></div>`;
 const load=async c=>{const r=await api('dw/user?u='+encodeURIComponent(uid)+'&t='+tab+(c?'&c='+c:''));const P=$('#b6pf');if(!P)return;
  if(!r.ok){P.innerHTML=`<div class="b6empty">${err(r,'الحساب غير موجود')}</div>`;return}
  const U=r.user;if(!c){P.innerHTML=`<div class="b6prof"><div class="bn"></div><div class="ph">${av(U,76)}${U.me?`<button class="b6btn gh" onclick="ZB6.profile()">تعديل الملف</button>`:`<div class="b6row"><button class="b6ib" id="b6um" aria-label="خيارات" style="border:1px solid var(--line)">${ic('more')}</button>${U.blocked?`<button class="b6btn dg" id="b6unb">إلغاء الحظر</button>`:`<button class="b6btn${U.following?' gh':''}" data-fol="${U.id}">${U.following?'تتابعه':'تابِع'}</button>`}</div>`}</div>
   <h2>${esc(U.name)}</h2>${U.followsMe&&!U.me?'<span class="b6hid" style="color:var(--muted);background:var(--line)">يتابعك</span>':''}${U.bio?`<div class="bio">${linkify(U.bio)}</div>`:''}
   <div class="ff"><a href="#diwan/f/${U.id}/ing"><b>${ar(U.followingN||0)}</b> يتابع</a><a href="#diwan/f/${U.id}/ers"><b>${ar(U.followers)}</b> متابِع</a><span><b>${ar(U.posts)}</b> تغريدة</span></div></div>
   <div class="b6sub"><button class="${tab==='p'?'on':''}" onclick="location.hash='diwan/u/${U.id}'">التغريدات</button><button class="${tab==='r'?'on':''}" onclick="location.hash='diwan/u/${U.id}/r'">الردود</button><button onclick="location.hash='u/${U.id}'">المقاطع ▸</button></div>`;
   const m=$('#b6um');if(m)m.onclick=()=>{const el=sheet(`<div class="b6menu"><button id="b6x1">${ic('block')} ${U.blocked?'إلغاء حظر':'حظر'} ${esc(U.name)}</button></div>`);$('#b6x1',el).onclick=()=>{el.close();block(U.id,U.name)}};
   const ub=$('#b6unb');if(ub)ub.onclick=()=>block(U.id,U.name);
   if(U.blocked){$('#b6list').innerHTML='<div class="b6empty">حظرت هذا الحساب.</div>';return more(null)}}
  $('#b6list').insertAdjacentHTML('beforeend',(r.items||[]).map(p=>postHTML(p)).join(''));
  if(!c&&!(r.items||[]).length)$('#b6list').innerHTML=`<div class="b6empty">${tab==='r'?'لا ردود بعد':'لا تغريدات بعد'}</div>`;
  more(r.next,load)};
 await load(0)}
async function follows(uid,k){addCss();bindView();RENDER=()=>follows(uid,k);view.innerHTML=`<div class="b6">${backBar(k==='ing'?'يتابع':'المتابِعون','diwan/u/'+uid)}<div id="b6list"><div class="b6more">جارٍ التحميل…</div></div></div>`;
 const r=await api('dw/follows?u='+encodeURIComponent(uid)+'&k='+(k==='ing'?'ing':'ers'));const L=$('#b6list');if(!L)return;L.innerHTML=r.ok?((r.items||[]).map(u=>`<a class="b6u" href="#diwan/u/${u.id}">${av(u)}<span class="b6grow"><b>${esc(u.name)}</b>${u.bio?`<br><small style="color:var(--muted)">${esc(u.bio)}</small>`:''}</span></a>`).join('')||'<div class="b6empty">لا أحد بعد</div>'):`<div class="b6empty">${err(r)}</div>`}
async function tag(t){addCss();bindView();await loadMe();RENDER=()=>tag(t);view.innerHTML=`<div class="b6">${backBar('#'+esc(t))}<div id="b6list"><div class="b6more">جارٍ التحميل…</div></div><div class="b6more" id="b6more"></div></div><button class="b6fab" id="b6fab" aria-label="تغريدة بهذا الوسم">${ic('pen')}</button>`;
 $('#b6fab').onclick=()=>compose({tag:t});
 const load=async c=>{const r=await api('dw/tag?t='+encodeURIComponent(t)+(c?'&c='+c:''));const L=$('#b6list');if(!L)return;if(!r.ok){L.innerHTML=`<div class="b6empty">${err(r)}</div>`;return}if(!c)L.innerHTML='';L.insertAdjacentHTML('beforeend',(r.items||[]).map(p=>postHTML(p)).join(''));if(!c&&!(r.items||[]).length)L.innerHTML='<div class="b6empty">لا تغريدات بهذا الوسم بعد</div>';more(r.next,load)};await load(0)}
async function notifs(){addCss();bindView();await loadMe();RENDER=notifs;view.innerHTML=`<div class="b6">${backBar('التنبيهات')}<div id="b6list"><div class="b6more">جارٍ التحميل…</div></div></div>`;
 const r=await api('dw/notifs');const L=$('#b6list');if(!L)return;UNREAD=0;badge();
 const K={like:['heart','#c0393f','أعجبته تغريدتك'],reply:['reply','#2d5f86','ردّ عليك'],follow:['user','#34457a','بدأ يتابعك'],repost:['rt','#2f7a4f','أعاد نشر تغريدتك'],quote:['quote','#5b4b8a','اقتبس تغريدتك'],
  vlike:['heart','#c0393f','أعجبه مقطعك'],vcmt:['reply','#2d5f86','علّق على مقطعك'],vrpl:['reply','#2d5f86','ردّ على تعليقك'],vcl:['heart','#c0393f','أعجبه تعليقك'],vmen:['user','#a8742a','أشار إليك في مقطع'],vcmen:['user','#a8742a','أشار إليك في تعليق'],vrep:['reply','#c0693f','ردّ على مقطعك بمقطع']}; /* v5.4 «مقاطع زاد» */
 L.innerHTML=r.ok?((r.items||[]).map(n=>{const k=K[n.k]||K.like;const href=n.k==='follow'?'#diwan/u/'+n.u.id:String(n.pid).startsWith('v:')?'#video/'+String(n.pid).split(':')[1]:'#diwan/p/'+n.pid;return`<a class="b6n${n.new?' new':''}" href="${href}"><span class="k" style="color:${k[1]}">${ic(k[0],n.k==='like'?'on':'')}</span><span class="b6grow">${av(n.u,30)}<div style="margin-top:4px"><b>${esc(n.u.name)}</b> ${k[2]} <small style="color:var(--muted)">· ${ago(n.at)}</small></div>${n.t?`<div class="b7note" style="margin:2px 0 0">${esc(n.t)}</div>`:''}</span></a>`}).join('')||'<div class="b6empty">لا تنبيهات بعد.<br>هنا يظهر من أعجبه كلامك أو ردّ عليك أو تابعك.</div>'):`<div class="b6empty">${err(r)}</div>`}
async function search(){addCss();bindView();await loadMe();RENDER=search;view.innerHTML=`<div class="b6">${backBar('بحث في الديوانية')}<div style="margin:12px 0"><input type="search" id="b6q" placeholder="ابحث عن شخص أو كلمة أو #وسم" aria-label="بحث"></div><div id="b6res"></div></div>`;
 const R=$('#b6res');const tr=await api('dw/trends');const showTr=()=>{R.innerHTML=`<div class="b7sec"><h3>الأكثر تداولًا</h3></div>`+((tr.items||[]).map((x,i)=>`<a class="b6trend" href="#diwan/tag/${encodeURIComponent(x.tag)}"><small>${ar(i+1)} · متداول</small><br><b>#${esc(x.tag)}</b><br><small>${ar(x.n)} تغريدة</small></a>`).join('')||'<div class="b6empty">لا وسوم بعد</div>')};showTr();
 let T=0;$('#b6q').oninput=e=>{clearTimeout(T);const q=e.target.value.trim();if(q.length<2)return showTr();T=setTimeout(async()=>{if(q[0]==='#'){location.hash='diwan/tag/'+encodeURIComponent(q.slice(1));return}const r=await api('dw/search?q='+encodeURIComponent(q));if(!r.ok||!$('#b6res'))return;R.innerHTML=((r.users||[]).length?`<div class="b7sec"><h3>أشخاص</h3></div>`+r.users.map(u=>`<a class="b6u" href="#diwan/u/${u.id}">${av(u)}<span class="b6grow"><b>${esc(u.name)}</b></span></a>`).join(''):'')+`<div class="b7sec"><h3>تغريدات</h3></div>`+((r.items||[]).map(p=>postHTML(p)).join('')||'<div class="b6empty">لا نتائج</div>')},q[0]==='#'?800:350)}}
function diwan(arg){const a=String(arg||'').split('/'),k=a[0];
 if(k==='p'&&a[1])return thread(a[1]);if(k==='u'&&a[1])return profile(a[1],a[2]);if(k==='f'&&a[1])return follows(a[1],a[2]);if(k==='tag'&&a[1])return tag(decodeURIComponent(a[1]));
 if(k==='n')return notifs();if(k==='s')return search();
 return feed()}
/* =================================== دروس زاد =================================== */
const TOP=['عقيدة','فقه','تفسير','حديث','سيرة','رقائق'];
const TOPK={'عقيدة':/عقيد|توحيد|الإيمان|الايمان|أسماء الله|الواسطية|الطحاوية|ثلاثة الأصول|الأصول الثلاثة|كشف الشبهات|القواعد الأربع|التدمرية|الحموية|نواقض/,'فقه':/فقه|الصلاة|صلاة|زكاة|الزكاة|صيام|الصيام|الصوم|الحج|العمرة|الطهارة|البيوع|النكاح|الطلاق|الفرائض|المواريث|زاد المستقنع|عمدة الفقه|الروض المربع|منار السبيل|دليل الطالب|بلوغ المرام|آداب المشي|أحكام|فتاوى|فتاوي|فتوى|نور على الدرب|المنتقى/,'تفسير':/تفسير|سورة|علوم القرآن|تدبر/,'حديث':/حديث|صحيح البخاري|صحيح مسلم|الأربعين|النووية|رياض الصالحين|عمدة الأحكام|السنن|سنن |المصطلح|نخبة الفكر|البيقونية|الموطأ|مشكاة|الأدب المفرد/,'سيرة':/سيرة|السيرة|غزوة|الصحابة|الخلفاء|الشمائل|زاد المعاد/,'رقائق':/رقائق|موعظة|مواعظ|القلوب|الزهد|التوبة|الصبر|الآخرة|الموت|الأخلاق|كلمة توجيهية|خواطر/};
const guess=t=>{for(const k of TOP)if(TOPK[k].test(t||''))return k;return''};
const n7=s=>String(s||'').replace(/[\u064b-\u0652\u0640\u0670]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase();
let CAT=null,CATP=null;const FEED={},SHK={},VIDS={};
const cat=()=>CAT?Promise.resolve(CAT):CATP||(CATP=fetch('/api/dorous/cat').then(r=>r.json()).then(j=>{if(!j.ok)throw new Error('cat');CAT=j;j.sheikhs.forEach(s=>SHK[s.key]=s);return j}).catch(e=>{CATP=null;throw e}));
const fkey=(k,id)=>k+':'+id;
async function feeds(keys){const need=[...new Set(keys)].filter(k=>!FEED[k]);const parts=[];for(let i=0;i<need.length;i+=12)parts.push(need.slice(i,i+12));
 await Promise.all(parts.map(async part=>{try{const r=await fetch('/api/dorous/feed?ids='+encodeURIComponent(part.join(','))).then(r=>r.json());if(r&&r.ok)Object.assign(FEED,r.feeds||{})}catch(e){}}));return keys.map(k=>FEED[k]).filter(Boolean)}
const shOf=k=>SHK[k];
const SHC={binbaz:'#34457a',uthaymeen:'#2f6b5a',fawzan:'#7a4a34',ifta:'#4a5a7a',haramain:'#8a6a2a',khudheir:'#5a3a6a',ruhaili:'#2a5a6a'};
const tile=v=>{const s=shOf(v.sh),c=SHC[v.sh]||'#34457a';return `<span style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#fff;background:linear-gradient(135deg,${c},#1d2545);background-image:linear-gradient(135deg,${c}ee,#1d2545ee),radial-gradient(circle at 20% 20%,#fff2 0 2px,transparent 3px);background-size:auto,14px 14px"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><em style="font-style:normal;font-size:10px;opacity:.9;max-width:92%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${s?esc(s.short):''}</em></span>`};
const prOf=v=>{const p=Z.dr.prog[v];return p&&p.du?Math.min(1,(p.s||0)/p.du):0};
const remember=v=>{VIDS[v.v]=Object.assign(VIDS[v.v]||{},{v:v.v,t:v.t,d:v.d,sh:v.sh||'',pl:v.pl||''})};
const bar=v=>{const p=prOf(v);return p?`<div class="pr"><i style="width:${Math.max(4,Math.round(p*100))}%"></i></div>`:''};
const card=(v,big)=>{remember(v);const s=shOf(v.sh);return big?`<a class="b7v" href="#dorous/v/${v.v}"><div class="th">${tile(v)}${bar(v.v)}</div><b>${esc(v.t)}</b><small>${s?esc(s.short):''}</small></a>`
 :`<a class="b7li" href="#dorous/v/${v.v}"><div class="th">${tile(v)}${bar(v.v)}</div><span class="b6grow"><b>${esc(v.t)}</b><small>${s?esc(s.short)+' · ':''}${v.d?ago(Date.parse(v.d)):''}${v.tp?'<span class="b7tag">'+v.tp+'</span>':''}</small></span></a>`};
const plCard=p=>{const s=shOf(p.sh);return`<a class="b7pl" href="#dorous/pl/${encodeURIComponent(p.id)}"><span class="ic">${ic('list')}</span><span class="b6grow"><b>${esc(p.title)}</b><br><small>${s?esc(s.short)+' · ':''}سلسلة${p.topic&&p.topic!=='عام'?'<span class="b7tag">'+p.topic+'</span>':''}</small></span>${zi('chev')}</a>`};
const mono=(s,i)=>`<span class="mono" style="background:${PAL[i%PAL.length]}">${esc([...String(s.short||s.name).replace(/^(ال|ابن )/,'')][0]||'د')}</span>`;
const failBox=()=>'<p class="b7note">تعذّر التحميل. تأكد من الاتصال وحاول مرة أخرى.</p><button class="b6btn" onclick="location.reload()">أعد المحاولة</button>';
const allPl=C=>{const a=[];C.sheikhs.forEach(s=>s.channels.forEach(c=>(c.playlists||[]).forEach(p=>a.push(Object.assign({sh:s.key,ch:c.id},p)))));return a};
async function dorousHome(topic){addCss();topic=TOP.includes(topic)?topic:'';
 view.innerHTML=`<div class="b7">${back('home','الرئيسية')}<h1 class="page">دروس زاد ${NEW}</h1><p class="b7note" style="margin-top:0">دروس كبار العلماء من قنواتهم الرسمية على يوتيوب، مرتبة حسب الشيخ والسلسلة والموضوع، وتتحدّث وحدها بالجديد.</p>
 <input type="search" id="b7q" placeholder="ابحث في الدروس (مثال: الصلاة، الواسطية)" aria-label="بحث في الدروس">
 <div id="b7res"></div><div id="b7main"><div class="b7chips" role="tablist">${['',...TOP].map(t=>`<a class="b7chip${topic===t?' on':''}" href="#dorous${t?'/t/'+encodeURIComponent(t):''}">${t||'الكل'}</a>`).join('')}</div><div id="b7cont"></div><div id="b7body"><p class="b7note">جارٍ التحميل…</p></div></div></div>`;
 const q=$('#b7q');let T=0;q.oninput=()=>{clearTimeout(T);T=setTimeout(()=>doSearch(q.value),350)};
 let C;try{C=await cat()}catch(e){$('#b7body').innerHTML=failBox();return}
 if(!$('#b7body'))return;
 if(!topic){const prog=Object.entries(Z.dr.prog).filter(([v,p])=>p&&p.s>20&&(!p.du||p.s<p.du-25)).sort((a,b)=>b[1].at-a[1].at).slice(0,12);
  $('#b7cont').innerHTML=(prog.length?`<div class="b7sec"><h3>${ic('play')} أكمل المشاهدة</h3></div><div class="b7hs">${prog.map(([v,p])=>card(Object.assign({v},p),1)).join('')}</div>`:'')
   +`<div class="b7chips"><a class="b7chip" href="#dorous/fav">${ic('star')} المفضلة${Z.dr.fav.length?' ('+ar(Z.dr.fav.length)+')':''}</a><a class="b7chip" href="#dorous/later">${ic('clock')} شاهد لاحقًا${Z.dr.later.length?' ('+ar(Z.dr.later.length)+')':''}</a><a class="b7chip" href="#dorous/about">${ic('shield')} مصادر القنوات</a></div>`}
 const B=$('#b7body');
 if(!topic){B.innerHTML=`<div class="b7sec"><h3>المشايخ والجهات</h3></div><div class="b7grid">${C.sheikhs.map((s,i)=>`<a class="b7sh" href="#dorous/s/${s.key}">${mono(s,i)}<b>${esc(s.name)}</b><small>${s.series?ar(s.series)+' سلسلة':'أحدث الدروس'}</small></a>`).join('')}</div>
  <div class="b7sec"><h3>أحدث الدروس</h3></div><div id="b7new"><p class="b7note">جارٍ التحميل…</p></div><p class="b7note">القنوات الرسمية فقط، ولكل قناة مصدر توثيق في «مصادر القنوات». المقاطع تُعرض من يوتيوب كما نشرتها القنوات.</p>`;
  const fs=await feeds(C.sheikhs.flatMap(s=>s.channels.map(c=>fkey('ch',c.id))));const all=[];fs.forEach(f=>(f.items||[]).slice(0,3).forEach(v=>all.push(Object.assign({sh:f.sh,tp:guess(v.t)},v))));all.sort((a,b)=>Date.parse(b.d)-Date.parse(a.d));
  const N=$('#b7new');if(N)N.innerHTML=all.slice(0,14).map(v=>card(v)).join('')||'<p class="b7note">تعذّر جلب الأحدث الآن.</p>';return}
 const pls=allPl(C).filter(p=>p.topic===topic);
 B.innerHTML=(pls.length?`<div class="b7sec"><h3>سلاسل في ${topic}</h3></div>`+pls.map(plCard).join(''):'')+`<div class="b7sec"><h3>أحدث الدروس في ${topic}</h3></div><div id="b7new"><p class="b7note">جارٍ التحميل…</p></div><p class="b7note">تصنيف السلاسل يدوي، وتصنيف المقاطع المنفردة تقريبي من عناوينها.</p>`;
 const fs=await feeds(C.sheikhs.flatMap(s=>s.channels.map(c=>fkey('ch',c.id))).concat(pls.map(p=>fkey('pl',p.id))));const seen=new Set(),all=[];
 fs.forEach(f=>(f.items||[]).forEach(v=>{const tp=f.topic&&f.topic!=='عام'?f.topic:guess(v.t);if(tp===topic&&!seen.has(v.v)){seen.add(v.v);all.push(Object.assign({sh:f.sh,pl:f.k==='pl'?f.id:'',tp},v))}}));all.sort((a,b)=>Date.parse(b.d)-Date.parse(a.d));
 const N=$('#b7new');if(N)N.innerHTML=all.slice(0,30).map(v=>card(v)).join('')||'<p class="b7note">لا دروس حديثة بهذا الموضوع الآن.</p>'}
async function doSearch(q){const R=$('#b7res'),M=$('#b7main');if(!R)return;q=(q||'').trim();if(q.length<2){R.innerHTML='';M.hidden=false;return}M.hidden=true;R.innerHTML='<p class="b7note">جارٍ البحث…</p>';
 let C;try{C=await cat()}catch(e){R.innerHTML=failBox();return}const nq=n7(q).split(/\s+/).filter(Boolean);
 const plHits=allPl(C).filter(p=>nq.every(w=>n7(p.title).includes(w)));
 try{const r=await fetch('/api/dorous/all').then(r=>r.json());if(r.ok)Object.assign(FEED,r.feeds||{})}catch(e){}
 const seen=new Set(),all=[];Object.values(FEED).forEach(f=>(f.items||[]).forEach(v=>{if(!seen.has(v.v)&&nq.every(w=>n7(v.t).includes(w))){seen.add(v.v);all.push(Object.assign({sh:f.sh,pl:f.k==='pl'?f.id:'',tp:f.topic&&f.topic!=='عام'?f.topic:guess(v.t)},v))}}));all.sort((a,b)=>Date.parse(b.d)-Date.parse(a.d));
 if(!$('#b7res')||n7($('#b7q').value.trim())!==n7(q))return;
 R.innerHTML=(plHits.length?`<div class="b7sec"><h3>سلاسل</h3></div>`+plHits.slice(0,10).map(plCard).join(''):'')+`<div class="b7sec"><h3>دروس (${ar(all.length)})</h3></div>`+(all.slice(0,60).map(v=>card(v)).join('')||'<p class="b7note">لا نتائج. جرّب كلمة أخرى.</p>')}
async function sheikh(key,topic){addCss();let C;try{C=await cat()}catch(e){view.innerHTML=`<div class="b7">${back('dorous','دروس زاد')}${failBox()}</div>`;return}const s=SHK[key];if(!s)return dorousHome();topic=TOP.includes(topic)?topic:'';
 const pls=allPl({sheikhs:[s]}),shown=pls.filter(p=>!topic||p.topic===topic),tps=[...new Set(pls.map(p=>p.topic).filter(t=>TOP.includes(t)))];
 view.innerHTML=`<div class="b7">${back('dorous','دروس زاد')}<h1 class="page" style="font-size:21px;line-height:1.5">${esc(s.name)}</h1>
 <div class="b7src">${s.channels.length>1?'القنوات الرسمية':'القناة الرسمية'}: ${s.channels.map(c=>`<a href="https://www.youtube.com/channel/${c.id}" target="_blank" rel="noopener">${esc(c.title)}</a>`).join('، ')}</div>
 ${tps.length?`<div class="b7chips" style="margin-top:8px">${['',...tps].map(t=>`<a class="b7chip${topic===t?' on':''}" href="#dorous/s/${key}${t?'/'+encodeURIComponent(t):''}">${t||'الكل'}</a>`).join('')}</div>`:''}
 ${shown.length?`<div class="b7sec"><h3>${ic('list')} السلاسل</h3></div>${shown.map(plCard).join('')}`:''}
 <div class="b7sec"><h3>أحدث ما نُشر</h3></div><div id="b7lat"><p class="b7note">جارٍ التحميل…</p></div></div>`;
 const fs=await feeds(s.channels.map(c=>fkey('ch',c.id)));const all=[];fs.forEach(f=>(f.items||[]).forEach(v=>{const tp=guess(v.t);if(!topic||tp===topic)all.push(Object.assign({sh:s.key,tp},v))}));all.sort((a,b)=>Date.parse(b.d)-Date.parse(a.d));
 const L=$('#b7lat');if(L)L.innerHTML=all.map(v=>card(v)).join('')||`<p class="b7note">${topic?'لا دروس حديثة بهذا الموضوع.':'تعذّر جلب الدروس الآن. حاول بعد قليل.'}</p>`}
async function playlist(id){addCss();let C;try{C=await cat()}catch(e){view.innerHTML=`<div class="b7">${back('dorous','دروس زاد')}${failBox()}</div>`;return}const pl=allPl(C).find(p=>p.id===id);
 if(!pl){view.innerHTML=`<div class="b7">${back('dorous','دروس زاد')}<p class="b7note">السلسلة غير موجودة.</p></div>`;return}const s=SHK[pl.sh];
 view.innerHTML=`<div class="b7">${back('dorous/s/'+pl.sh,s.short)}<h1 class="page" style="font-size:20px;line-height:1.5">${esc(pl.title)}</h1><div class="b7src">${esc(s.name)}${pl.topic&&pl.topic!=='عام'?' <span class="b7tag">'+pl.topic+'</span>':''} · <a href="https://www.youtube.com/playlist?list=${encodeURIComponent(id)}" target="_blank" rel="noopener">السلسلة كاملة على يوتيوب</a></div><div id="b7pl"><p class="b7note">جارٍ التحميل…</p></div><p class="b7note">تعرض القائمة ما يتيحه موجز يوتيوب العام للسلسلة (حتى ١٥ درسًا)، والسلسلة كاملة على يوتيوب.</p></div>`;
 const [f]=await feeds([fkey('pl',id)]);const L=$('#b7pl');if(!L)return;const items=((f&&f.items)||[]).map(v=>Object.assign({sh:pl.sh,pl:id,tp:pl.topic!=='عام'?pl.topic:''},v));
 L.innerHTML=items.map(v=>card(v)).join('')||'<p class="b7note">تعذّر جلب السلسلة الآن.</p>'}
function savedList(k){addCss();const L=Z.dr[k];view.innerHTML=`<div class="b7">${back('dorous','دروس زاد')}<h1 class="page">${k==='fav'?'المفضلة':'شاهد لاحقًا'}</h1><div id="b7sv">${L.map(v=>card(v)).join('')||`<p class="b7note">${k==='fav'?'اضغط «المفضلة» تحت أي درس ليظهر هنا.':'اضغط «شاهد لاحقًا» تحت أي درس ليظهر هنا.'}</p>`}</div></div>`;cat().then(()=>{const d=$('#b7sv');if(d&&L.length)d.innerHTML=L.map(v=>card(v)).join('')}).catch(()=>{})}
async function about(){addCss();let C=null;try{C=await cat()}catch(e){}
 view.innerHTML=`<div class="b7">${back('dorous','دروس زاد')}<h1 class="page">مصادر القنوات</h1><p class="b7note" style="margin-top:0">نعرض فقط القنوات الرسمية للعلماء والجهات الرسمية، ولكل قناة مصدر توثيق: رابطها في الموقع الرسمي للشيخ أو الجهة، أو علامة التوثيق في يوتيوب. القنوات التي لم نستطع توثيقها لم نضفها.</p>
 ${C?C.sheikhs.map(s=>`<div class="b7pl" style="display:block"><b>${esc(s.name)}</b>${s.channels.map(c=>`<div class="b7src">${esc(c.title)} — <a href="https://www.youtube.com/channel/${c.id}" target="_blank" rel="noopener">القناة</a> · التوثيق: ${c.verify&&c.verify.source?`<a href="${esc(c.verify.source)}" target="_blank" rel="noopener">${c.verify.method==='verified-badge'?'علامة التوثيق في يوتيوب':c.verify.method==='both'?'الموقع الرسمي + علامة التوثيق':'الموقع الرسمي'}</a>`:'—'}</div>`).join('')}</div>`).join(''):failBox()}
 <p class="b7note">تُجلب القوائم من موجزات يوتيوب العامة وتتحدّث كل ٦ ساعات تقريبًا، والتشغيل عبر youtube-nocookie. تصنيف السلاسل حسب الموضوع يدوي، وتصنيف المقاطع المنفردة تقريبي من العنوان.</p></div>`}
/* player: youtube-nocookie embed; resume, favourites, watch later; watch time → رحلتي */
let YTP=null,YTT=0,PL=null;
const loadYT=()=>window.YT&&YT.Player?Promise.resolve():YTP||(YTP=new Promise((ok,no)=>{const prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{try{prev&&prev()}catch(e){}ok()};const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;s.onerror=()=>{YTP=null;no(new Error('yt'))};document.head.appendChild(s);setTimeout(()=>no(new Error('yt timeout')),15000)}));
function stopTrack(){clearInterval(YTT);YTT=0;if(PL){try{save()}catch(e){}}PL=null}
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#dorous/v/'))stopTrack()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&PL)sv()});
async function player(v){addCss();stopTrack();if(!/^[A-Za-z0-9_-]{11}$/.test(v)){location.hash='dorous';return}
 try{await cat()}catch(e){}
 const m=Object.assign({v},Z.dr.prog[v]||{},Z.dr.fav.find(x=>x.v===v)||{},Z.dr.later.find(x=>x.v===v)||{},VIDS[v]||{});
 const s=shOf(m.sh),p=Z.dr.prog[v],start=p&&p.s>15&&(!p.du||p.s<p.du-20)?Math.floor(p.s):0;
 const isF=()=>Z.dr.fav.some(x=>x.v===v),isL=()=>Z.dr.later.some(x=>x.v===v);
 view.innerHTML=`<div class="b7">${back(m.pl?'dorous/pl/'+encodeURIComponent(m.pl):m.sh?'dorous/s/'+m.sh:'dorous',m.pl?'السلسلة':s?s.short:'دروس زاد')}
 <div class="b7player"><iframe id="b7if" src="https://www.youtube-nocookie.com/embed/${v}?enablejsapi=1&rel=0&playsinline=1${start?'&start='+start:''}&origin=${encodeURIComponent(location.origin)}" title="${esc(m.t||'درس')}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
 ${start?`<p class="b7note" id="b7res1" style="margin:0">${ic('play')} أكمل المشاهدة من ${fmt(start)}</p>`:''}
 <h2 class="b7ttl">${esc(m.t||'')}</h2><div class="b7src">${s?`<a href="#dorous/s/${s.key}">${esc(s.name)}</a> · `:''}${m.d?ago(Date.parse(m.d))+' · ':''}<a href="https://www.youtube.com/watch?v=${v}" target="_blank" rel="noopener">فتح في يوتيوب</a></div>
 <div class="b7acts"><button id="b7fv" class="${isF()?'on':''}">${ic('star',isF()?'on':'')} المفضلة</button><button id="b7lt" class="${isL()?'on':''}">${ic('clock')} شاهد لاحقًا</button><button id="b7sh2">${ic('share')} مشاركة</button></div>
 <p class="b7note">الدرس من القناة الرسمية${s?' لـ'+esc(s.short):''} على يوتيوب، ويُعرض كما نشرته القناة.</p></div>`;
 const item=()=>({v,t:m.t||'',d:m.d||'',sh:m.sh||'',pl:m.pl||''});
 const tog=(k,btn,lbl)=>{const L=Z.dr[k],i=L.findIndex(x=>x.v===v);if(i>=0)L.splice(i,1);else L.unshift(item());if(L.length>200)L.length=200;sv();const on=i<0;btn.classList.toggle('on',on);if(k==='fav')btn.innerHTML=ic('star',on?'on':'')+' المفضلة';tst(on?'أُضيف إلى '+lbl:'أُزيل من '+lbl)};
 $('#b7fv').onclick=e=>tog('fav',e.currentTarget,'المفضلة');$('#b7lt').onclick=e=>tog('later',e.currentTarget,'شاهد لاحقًا');
 $('#b7sh2').onclick=async()=>{const url='https://www.youtube.com/watch?v='+v;try{if(navigator.share){await navigator.share({title:m.t||'درس',text:(m.t||'')+(s?' — '+s.short:''),url});return}}catch(x){if(x&&x.name==='AbortError')return}try{await navigator.clipboard.writeText(url);tst('تم نسخ الرابط')}catch(x){}};
 // progress: the YouTube iframe API reports the time; saved every 5 s while playing (resume + watch time)
 try{await loadYT()}catch(e){return}
 if(location.hash!=='#dorous/v/'+v)return;
 let yp=null,last=Date.now();
 const tick=()=>{try{if(!yp||typeof yp.getCurrentTime!=='function')return;const st=yp.getPlayerState(),t=yp.getCurrentTime()||0,d=yp.getDuration()||0;const nw=Date.now(),dt=Math.min(10,(nw-last)/1e3);last=nw;
  if(st===1){const k=dK();Z.dr.wt[k]=(+Z.dr.wt[k]||0)+dt;try{if(yp.getVideoData){const vd=yp.getVideoData();if(vd&&vd.title&&!m.t)m.t=vd.title}}catch(x){}}
  if(t>5){Z.dr.prog[v]=Object.assign(item(),{s:Math.floor(t),du:Math.floor(d),at:nw});PL=v;const ks=Object.keys(Z.dr.prog);if(ks.length>300){ks.sort((a,b)=>Z.dr.prog[a].at-Z.dr.prog[b].at).slice(0,ks.length-300).forEach(x=>delete Z.dr.prog[x])}if(st!==1||Math.random()<.4)sv()}
  if(st===0&&d){Z.dr.prog[v]=Object.assign(item(),{s:Math.floor(d),du:Math.floor(d),at:nw,done:1});sv()}}catch(e){}};
 try{yp=new YT.Player('b7if',{host:'https://www.youtube-nocookie.com',events:{onReady:()=>{last=Date.now()},onStateChange:e=>{last=Date.now();if(e.data===2||e.data===0)tick()}}});ZB6._yp=yp}catch(e){}
 YTT=setInterval(()=>{if(location.hash!=='#dorous/v/'+v){stopTrack();return}tick()},5000)}
function dorous(arg){const a=String(arg||'').split('/'),k=a[0];
 if(k==='s'&&a[1])return sheikh(a[1],decodeURIComponent(a[2]||''));if(k==='pl'&&a[1])return playlist(decodeURIComponent(a[1]));if(k==='v'&&a[1])return player(a[1]);
 if(k==='t'&&a[1])return dorousHome(decodeURIComponent(a[1]));if(k==='fav'||k==='later')return savedList(k);if(k==='about')return about();
 return dorousHome()}
/* home: two prominent cards («جديد») */
function homeCards(el){addCss();el.innerHTML=`<div class="zb6home"><a class="dw" href="#diwan"><em class="zs-new">جديد</em><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/><path d="M8.5 10.5h7M8.5 13.5h4.5"/></svg><b>ديوانية زاد</b><small>مساحة للنقاش بالخير</small>${UNREAD?`<span class="cnt">${ar(Math.min(99,UNREAD))}</span>`:''}</a><a class="dr" href="#dorous"><em class="zs-new">جديد</em><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="3"/><path d="m10 9 5 2.5-5 2.5z"/><path d="M8 21h8"/></svg><b>دروس زاد</b><small>دروس المشايخ مرتبة</small></a></div>`}
const watchMin=()=>{let s=0;for(const k in Z.dr.wt)s+=+Z.dr.wt[k]||0;return Math.floor(s/60)};
window.ZB6={diwan,dorous,compose:o=>compose(o||{}),profile:()=>{addCss();loadMe().then(()=>profileSheet(null))},homeCards,unread:()=>loadMe(true).then(()=>UNREAD),watchMin,_v:'5.0.0'};
})();
