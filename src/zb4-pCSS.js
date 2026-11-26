const css=`
.zb4-new{font-size:10px;background:#c0693f;color:#fff;border-radius:99px;padding:1px 7px;margin-inline-start:6px;vertical-align:middle;font-style:normal;font-weight:700}
.zn-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px}.zn-top select{flex:1;min-width:0;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:9px 10px;font:inherit;font-size:14px}
.zn-mode{font-size:12.5px;border-radius:12px;padding:9px 11px;background:var(--z-soft,#eef0f7);color:var(--accent,#34457a);margin-bottom:10px;line-height:1.7}.zn-mode svg{width:15px;height:15px;vertical-align:-3px;margin-inline-end:4px}
.zn-txt{font-family:'Amiri Quran','Amiri',serif;font-size:var(--qs,26px);line-height:2.35;text-align:justify;text-align-last:center;direction:rtl;padding:14px 12px 8px;background:var(--card);border:1px solid var(--line);border-radius:18px}
.zn-bsm{text-align:center;font-family:'Amiri Quran','Amiri',serif;margin:2px 0 8px;border-radius:12px;transition:background .25s;cursor:pointer}
.zn-a{border-radius:10px;transition:background .25s,box-shadow .25s;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}
.zn-a.on,.zn-bsm.on{background:color-mix(in srgb,#c0693f 17%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,#c0693f 17%,transparent)}
.zn-w{border-radius:7px;transition:background .12s,color .12s;padding:0 1px}
.zn-wl .zn-a.on{background:color-mix(in srgb,#34457a 8%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,#34457a 8%,transparent)}
.zn-w.on{background:#c0693f;color:#fff}
.zn-w.dn{color:color-mix(in srgb,currentColor 60%,#34457a)}
.zn-end{font-size:.78em;color:#c0693f;white-space:nowrap}
.zn-bar{position:sticky;bottom:calc(70px + env(safe-area-inset-bottom));z-index:5;margin-top:12px;background:color-mix(in srgb,var(--card) 94%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:20px;padding:10px 12px;box-shadow:0 8px 24px rgba(29,37,69,.14)}
.zn-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.zn-pb{width:54px;height:54px;border-radius:50%;border:0;background:#34457a;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}
.zn-pb svg{width:24px;height:24px;fill:currentColor}.zn-ib svg{width:17px;height:17px;fill:currentColor}
.zn-ib{width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:inherit;display:grid;place-items:center;cursor:pointer;flex:none;font-size:20px;font-weight:700}
.zn-info{flex:1;min-width:0;text-align:center;font-size:12px;line-height:1.5;color:var(--muted)}.zn-info b{display:block;font-size:14.5px;color:var(--ink,inherit)}
.zn-opt{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px;align-items:center;font-size:12px}
.zn-opt .lb{color:var(--muted);margin-inline-end:2px;min-width:58px}
.zn-c{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:99px;padding:5px 10px;font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}.zn-c svg{width:14px;height:14px}
.zn-c.on{background:#34457a;color:#fff;border-color:#34457a}
.zn-rg{display:none;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;font-size:12px}.zn-rg.on{display:flex}
.zn-rg select{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:10px;padding:4px 6px;font:inherit;font-size:12px}
.zl-tabs{display:flex;gap:6px;background:var(--z-soft,#eef0f7);padding:4px;border-radius:14px;margin:6px 0 12px}.zl-tabs button{flex:1;border:0;background:none;padding:10px;border-radius:11px;font:inherit;font-weight:700;color:inherit;cursor:pointer}.zl-tabs button.on{background:var(--card);color:#34457a;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.zl-fr{position:relative;width:100%;aspect-ratio:16/9;background:#0d0f15;border-radius:18px;overflow:hidden}.zl-fr iframe,.zl-fr video{position:absolute;inset:0;width:100%;height:100%;border:0}
.zl-of{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#1f7a55;background:#e6f4ee;border-radius:99px;padding:4px 10px}.zl-of svg{width:14px;height:14px}
.zl-fb{display:none}.zl-fb.on{display:block}
.zl-card{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.zl-card .ic{width:46px;height:46px;border-radius:14px;background:#b8323a;color:#fff;display:grid;place-items:center;flex:none}.zl-card .ic svg{width:22px;height:22px}
.zw-ov{position:fixed;inset:0;z-index:9999;background:#141a33;color:#fff;display:flex;flex-direction:column;touch-action:none;user-select:none;-webkit-user-select:none;font-family:inherit}
.zw-bars{display:flex;direction:rtl;gap:4px;padding:calc(10px + env(safe-area-inset-top)) 12px 6px;position:relative;z-index:3}.zw-bars i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.25);overflow:hidden;position:relative}.zw-bars i b{position:absolute;inset:0;background:#fff;transform-origin:right;transform:scaleX(0)}
.zw-x{position:absolute;top:calc(22px + env(safe-area-inset-top));left:12px;width:40px;height:40px;border:0;background:rgba(255,255,255,.14);color:#fff;border-radius:50%;font-size:18px;cursor:pointer;z-index:4}
.zw-sl{flex:1;position:relative;overflow:hidden}
.zw-s{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 28px 96px;opacity:0;pointer-events:none;transition:opacity .45s}
.zw-s.on{opacity:1;pointer-events:auto}
.zw-s .k{font-size:15px;color:#f2bd9b;margin-bottom:10px;display:flex;gap:6px;align-items:center;justify-content:center}.zw-s .k svg{width:18px;height:18px}
.zw-s h2{font-size:30px;line-height:1.4;margin:0 0 10px;font-weight:800;position:relative}
.zw-s .big{font-size:76px;font-weight:800;line-height:1.1;margin:6px 0;position:relative}
.zw-s p{font-size:16px;line-height:1.8;color:rgba(255,255,255,.88);margin:6px 0;max-width:330px;position:relative}
.zw-s .chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px;position:relative}.zw-s .chips span{background:rgba(255,255,255,.13);border-radius:99px;padding:6px 12px;font-size:13px}
.zw-s.on .an{animation:zwUp .7s both}.zw-s.on .an2{animation:zwUp .7s .18s both}.zw-s.on .an3{animation:zwUp .7s .4s both}.zw-s.on .an4{animation:zwPop .8s .2s both}
@keyframes zwUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}@keyframes zwPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.zw-orb{position:absolute;border-radius:50%;filter:blur(40px);opacity:.5;pointer-events:none}
.zw-dua{font-family:'Amiri Quran','Amiri',serif;font-size:27px;line-height:2.1;margin:8px 0;position:relative}
.zw-ft{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom));left:0;right:0;display:flex;justify-content:center;gap:10px;z-index:4}
.zw-ft button{border:0;border-radius:99px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;display:inline-flex;gap:6px;align-items:center}.zw-ft svg{width:18px;height:18px}
.zw-ft .p{background:#c0693f;color:#fff}.zw-ft .g{background:rgba(255,255,255,.15);color:#fff}
.zw-hint{position:absolute;bottom:calc(26px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;font-size:12px;color:rgba(255,255,255,.55);z-index:3}
.zr-hero{display:flex;gap:16px;align-items:center}.zr-ring{position:relative;width:116px;height:116px;flex:none}.zr-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.zr-ring .c{position:absolute;inset:0;display:grid;place-items:center;text-align:center}.zr-ring .c b{font-size:34px;line-height:1;color:#34457a}.zr-ring .c small{display:block;font-size:11px;color:var(--muted)}
.zr-bar{height:10px;border-radius:9px;background:var(--z-soft,#eef0f7);overflow:hidden;margin:8px 0 4px}.zr-bar i{display:block;height:100%;background:linear-gradient(90deg,#c0693f,#34457a);border-radius:9px}
.zr-lv{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.zr-lv div{border:1px solid var(--line);border-radius:12px;padding:8px 2px;text-align:center;font-size:11px;line-height:1.35;background:var(--card)}.zr-lv div b{display:block;font-size:16px}.zr-lv .on{background:#34457a;color:#fff;border-color:#34457a}.zr-lv .no{opacity:.45}
.zr-bg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.zr-b{border:1px solid var(--line);border-radius:16px;padding:10px 6px;text-align:center;background:var(--card)}.zr-b .i{width:44px;height:44px;margin:0 auto 6px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#f2bd9b,#c0693f);color:#fff}.zr-b .i svg{width:22px;height:22px}.zr-b b{display:block;font-size:12px;line-height:1.4}.zr-b small{display:block;font-size:10.5px;color:var(--muted);line-height:1.4;margin-top:2px}.zr-b.no{opacity:.6}.zr-b.no .i{background:var(--z-soft,#eef0f7);color:var(--muted)}
.zr-xp{display:grid;grid-template-columns:1fr auto;gap:7px 10px;font-size:13px}.zr-xp>span:nth-child(even){font-weight:700;color:#34457a}
.zr-home{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit;margin-top:12px;padding:10px 12px}.zr-home .rg{position:relative;width:52px;height:52px;flex:none}.zr-home .rg svg{width:100%;height:100%;transform:rotate(-90deg)}.zr-home .rg b{position:absolute;inset:0;display:grid;place-items:center;font-size:18px;color:#34457a}.zr-home small{display:block;color:var(--muted);font-size:12px}
.zrm-hero{background:linear-gradient(135deg,#1d2545,#34457a 60%,#4a3a6e);color:#fff;border-radius:22px;padding:16px;position:relative;overflow:hidden}
.zrm-hero .moon{position:absolute;left:-34px;bottom:-58px;width:110px;height:110px;border-radius:50%;box-shadow:24px 12px 0 0 #f2d8a8;opacity:.85}
.zrm-tt{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.zrm-tt div{background:rgba(255,255,255,.1);border-radius:14px;padding:10px}.zrm-tt small{display:block;color:#f2d8a8;font-size:12px}.zrm-tt b{font-size:20px}.zrm-tt em{display:block;font-style:normal;font-size:12px;opacity:.85}
.zrm-tb{width:100%;border-collapse:collapse;font-size:13px}.zrm-tb th,.zrm-tb td{padding:7px 3px;text-align:center;border-bottom:1px solid var(--line)}.zrm-tb th{font-size:11.5px;color:var(--muted)}.zrm-tb tr.now td{background:color-mix(in srgb,#c0693f 14%,transparent);font-weight:800}.zrm-tb tr.odd td:first-child{color:#c0693f;font-weight:800}
.zrm-days{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.zrm-days button{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:8px 0;font:inherit;font-size:13px;cursor:pointer;position:relative}.zrm-days button.f{background:#1f7a55;color:#fff;border-color:#1f7a55}.zrm-days button.m{background:#fbeee6;color:#9a4f2e;border-color:#e8c3ad}.zrm-days button.now{outline:2px solid #c0693f;outline-offset:1px}.zrm-days button.odd::after{content:'';position:absolute;top:4px;left:4px;width:6px;height:6px;border-radius:50%;background:#c0693f}
.zrm-ten{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.zrm-ten div{border:1px solid var(--line);border-radius:12px;padding:8px 2px;text-align:center;font-size:12px}.zrm-ten div b{display:block;font-size:17px}.zrm-ten .odd{background:linear-gradient(160deg,#1d2545,#34457a);color:#fff;border-color:#34457a}.zrm-ten .odd small{color:#f2d8a8}
.zrm-had{font-size:15px;line-height:1.9;margin:6px 0}.zrm-src{font-size:12px;color:var(--muted)}.zrm-src a{color:#34457a}
.zrm-home{display:block;text-decoration:none;color:#fff;margin-top:12px}.zrm-home .zrm-hero{padding:14px}.zrm-qk{display:flex;gap:8px;margin-top:10px;position:relative}.zrm-qk button,.zrm-qk a{flex:1;border:0;border-radius:12px;padding:9px 4px;font:inherit;font-size:13px;font-weight:700;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;text-align:center;text-decoration:none}.zrm-qk button.on{background:#f2d8a8;color:#1d2545}
body.zb4-ram .zsky,body.zb4-ram #zskyw>*{filter:hue-rotate(-12deg) saturate(1.1)}
`;
function addCss(){if(document.getElementById('zb4css'))return;const s=document.createElement('style');s.id='zb4css';s.textContent=css;document.head.appendChild(s)}
addCss();
const SV={play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M6 5v14h2V5zM10 12l10 7V5z"/></svg>',prev:'<svg viewBox="0 0 24 24"><path d="M18 5v14h-2V5zM14 12 4 19V5z"/></svg>'};
const chName=s=>{try{return CH(s)[1]}catch(e){return 'سورة '+s}},chLen=s=>{try{return +CH(s)[2]}catch(e){return 7}};
