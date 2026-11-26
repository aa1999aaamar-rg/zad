/* زاد v4.4.2 player (v4.2 «مقاطع الأسبوع»): Reels-style feed, upload, likes, comments, share, report. Lazy-loaded by z4.js (V.videos / V.video / V.vupload). Minified to site/vids.js */
(function(){'use strict';
if(window.ZV)return;
const zi=k=>window.ZI?ZI(k):'';
const ar=x=>String(x).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const es=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tst=t=>{try{toast(t)}catch(e){alert(t)}};
const MAXB=50*1048576,MAXD=120.9;
let DEV=localStorage.getItem('zad.dev');
if(!/^[a-f0-9]{32}$/.test(DEV||'')){DEV=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem('zad.dev',DEV)}
const ST=(()=>{try{return JSON.parse(localStorage.getItem('zad.zv')||'{}')}catch(e){return{}}})();
const keep=()=>{try{localStorage.setItem('zad.zv',JSON.stringify(ST))}catch(e){}};
const H={'X-Zad-Dev':DEV};
const api=(p,b,m)=>fetch('/api/videos/'+p,{method:m||(b?'POST':'GET'),headers:b?Object.assign({'Content-Type':'application/json'},H):H,body:b?JSON.stringify(b):undefined,cache:'no-store'}).then(r=>r.json().catch(()=>({ok:false,error:'http'+r.status})));
const ERR={title:'اكتب عنوانًا للمقطع',name:'اكتب اسمًا يظهر مع المقطع (حرفين على الأقل)',bad:'توجد كلمات غير لائقة، عدّلها من فضلك',type:'صيغة المقطع غير مدعومة، جرّب MP4',size:'حجم المقطع أكبر من المسموح (٥٠ م.ب)',dur:'المقطع أطول من دقيقتين',rate:'وصلت الحد المسموح، جرّب لاحقًا',long:'التعليق أطول من ٣٠٠ حرف',empty:'اكتب تعليقك',link:'الروابط غير مسموحة في التعليقات',gone:'هذا المقطع لم يعد متاحًا',device:'أعد فتح التطبيق وجرّب'};
const em=j=>ERR[j&&j.error]||'تعذّر، تأكد من الاتصال وجرّب مرة أخرى';
const left=(exp,now)=>{const ms=exp-now;if(!exp||ms>3e10)return'';if(ms<36e5*20)return'يُحذف خلال ساعات';const d=Math.ceil(ms/864e5);return'يُحذف بعد '+(d===1?'يوم':d===2?'يومين':ar(d)+(d<=10?' أيام':' يوم'))};
const ago=t=>{const m=Math.max(1,Math.round((Date.now()-t)/6e4));return m<60?'قبل '+ar(m)+' د':m<1440?'قبل '+ar(Math.round(m/60))+' س':'قبل '+ar(Math.round(m/1440))+' يوم'};
const cnt=n=>n>=1000?ar((n/1000).toFixed(n<1e4?1:0))+'k':ar(n||0);
const IC={
 heart:'<path d="M12 20.3s-7.6-4.6-7.6-10.4A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.6 2.7c0 5.8-7.6 10.4-7.6 10.4z"/>',
 chat:'<path d="M20 11.6c0 4.1-3.6 7.4-8 7.4a8.8 8.8 0 0 1-3.4-.7L4 19.6l1.3-3.7A7 7 0 0 1 4 11.6C4 7.5 7.6 4.2 12 4.2s8 3.3 8 7.4z"/>',
 share:'<path d="M13.6 5.2 20.5 11.8l-6.9 6.6v-3.9c-4.8 0-8 1.4-10.1 4.7.8-5 3.6-9.3 10.1-10z"/>',
 dl:'<path d="M12 4v10.5M7.6 10.3 12 14.7l4.4-4.4M5 19.5h14"/>',
 more:'<path d="M5.5 12h.01M12 12h.01M18.5 12h.01" stroke-width="3.4"/>',
 send:'<path d="M20.5 3.5 10.2 13.8M20.5 3.5l-6.3 17-4-6.7-6.7-4z"/>',
 flag:'<path d="M5.5 21V4.5h11l-2.3 4.3 2.3 4.2h-11"/>',
 vol:'<path d="M4 9.6v4.8h3.4l4.6 4V5.6l-4.6 4z"/><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8"/>',
 mute:'<path d="M4 9.6v4.8h3.4l4.6 4V5.6l-4.6 4z"/><path d="m16 9.6 4.8 4.8M20.8 9.6 16 14.4"/>',
 back:'<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
 plus:'<path d="M12 5.5v13M5.5 12h13"/>',
 play:'<path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.6-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z" fill="currentColor"/>',
 pause:'<path d="M8.5 5.5v13M15.5 5.5v13" stroke-width="3"/>',
 x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
 full:'<path d="M4.5 9V6a1.5 1.5 0 0 1 1.5-1.5h3M15 4.5h3A1.5 1.5 0 0 1 19.5 6v3M19.5 15v3a1.5 1.5 0 0 1-1.5 1.5h-3M9 19.5H6A1.5 1.5 0 0 1 4.5 18v-3"/>',
 speed:'<path d="M4.6 16.5a8 8 0 1 1 14.8 0"/><path d="m12 13.2 3.6-3.6"/>',
 retry:'<path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4"/><path d="M4.5 4.8v3.9h3.9"/>',
 check:'<path d="m5.5 12.5 4.2 4.2 8.8-9.2"/>',
 reel:'<rect x="4" y="3.5" width="16" height="17" rx="4"/><path d="m10 9 5 3-5 3z"/>'};
const ic=(k,c)=>`<svg class="zv-i${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||''}</svg>`;
const CSS=`
.zv{position:fixed;inset:0;z-index:9990;background:#000;color:#fff;font-family:Zad,'IBM Plex Sans Arabic',system-ui,sans-serif;direction:rtl;overscroll-behavior:contain;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
.zv-i{width:26px;height:26px;display:block}
.zv-top{position:absolute;top:0;inset-inline:0;z-index:6;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 8px) 10px 18px;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,0));pointer-events:none}
.zv-top>*{pointer-events:auto}
.zv-top b{flex:1;text-align:center;font-size:17px;font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,.5);pointer-events:none}
.zv-btn{width:40px;height:40px;border-radius:50%;border:0;display:grid;place-items:center;background:rgba(255,255,255,.12);color:#fff;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
.zv-btn .zv-i{width:22px;height:22px}
.zv-up{display:flex;align-items:center;gap:6px;height:40px;padding:0 14px 0 12px;border-radius:999px;border:0;background:#c0693f;color:#fff;font:inherit;font-weight:700;font-size:14px}
.zv-up .zv-i{width:19px;height:19px}
.zv-feed{position:absolute;inset:0;overflow-y:auto;scroll-snap-type:y mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.zv-feed::-webkit-scrollbar{display:none}
.zv-it{position:relative;height:100%;scroll-snap-align:start;scroll-snap-stop:always;overflow:hidden;background:#000;contain:strict}
.zv-it video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}
.zv-it.tall video{object-fit:cover}
.zv-tap{position:absolute;inset:0;z-index:1}
.zv-pp{position:absolute;inset:0;z-index:2;display:grid;place-items:center;pointer-events:none;opacity:0;transform:scale(1.25);transition:opacity .18s,transform .18s}
.zv-pp.on{opacity:1;transform:none}.zv-pp span{width:72px;height:72px;border-radius:50%;background:rgba(0,0,0,.38);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:grid;place-items:center}.zv-pp .zv-i{width:34px;height:34px;margin-inline-start:-3px}
.zv-spin{position:absolute;inset:0;z-index:2;display:grid;place-items:center;pointer-events:none;opacity:0;transition:opacity .2s .25s}
.zv-it.ld .zv-spin{opacity:1}
.zv-spin i{width:44px;height:44px;border-radius:50%;border:3px solid rgba(255,255,255,.22);border-top-color:#fff;animation:zvr .8s linear infinite;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))}
@keyframes zvr{to{transform:rotate(360deg)}}
.zv-err{position:absolute;inset:0;z-index:4;display:grid;place-items:center;text-align:center;background:rgba(0,0,0,.55);padding:30px}
.zv-err[hidden]{display:none}.zv-err p{margin:0 0 14px;font-size:15px;line-height:1.8}
.zv-err button{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:10px 18px;background:#fff;color:#111;font:inherit;font-weight:700;font-size:14px}.zv-err .zv-i{width:18px;height:18px}
.zv-meta{position:absolute;inset-inline:0;bottom:0;z-index:3;padding:70px 16px calc(env(safe-area-inset-bottom) + 26px);padding-inline-end:84px;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.62));pointer-events:none}
.zv-who{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.zv-who .av{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#34457a;border:1.5px solid rgba(255,255,255,.85);font-size:13px;font-weight:700}
.zv-who b{font-size:15px;font-weight:700;text-shadow:0 1px 4px rgba(0,0,0,.6)}
.zv-meta h3{margin:0;font-size:15px;font-weight:500;line-height:1.6;text-shadow:0 1px 4px rgba(0,0,0,.6);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.zv-exp{display:block;margin-top:4px;font-size:12px;opacity:.75}
.zv-side{position:absolute;inset-inline-end:6px;bottom:calc(env(safe-area-inset-bottom) + 34px);z-index:4;display:flex;flex-direction:column;gap:14px;align-items:center}
.zv-a{border:0;background:none;color:#fff;display:flex;flex-direction:column;align-items:center;gap:3px;font:inherit;font-size:12px;font-weight:700;min-width:56px;padding:0;text-shadow:0 1px 2px rgba(0,0,0,.9),0 0 8px rgba(0,0,0,.55)}
.zv-a .ico{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.3);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 2px 10px rgba(0,0,0,.18);transition:transform .15s}
.zv-a .zv-i{width:27px;height:27px;filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))}
.zv-a:active .ico{transform:scale(.88)}
.zv-a.liked .zv-i{color:#ff3b5c;fill:#ff3b5c}
.zv-a.pop .ico{animation:zvpop .4s}@keyframes zvpop{40%{transform:scale(1.3)}}
.zv-a .n{font-style:normal}
.zv-a.busy .zv-i{opacity:.5}
.zv-pg{position:absolute;inset-inline:0;bottom:calc(env(safe-area-inset-bottom) + 0px);z-index:5;height:22px;display:flex;align-items:flex-end;padding:0 0 6px;touch-action:none;cursor:pointer}
.zv-trk{position:relative;flex:1;height:3px;margin:0 10px;border-radius:3px;background:rgba(255,255,255,.22);transition:height .15s}
.zv-trk i{position:absolute;inset-block:0;inset-inline-start:0;width:0;border-radius:3px}
.zv-trk .bf{background:rgba(255,255,255,.3)}.zv-trk .fl{background:#fff}
.zv-trk b{position:absolute;top:50%;width:14px;height:14px;margin:-7px -7px 0;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.4);transform:scale(0);transition:transform .15s;inset-inline-start:0}
.zv-pg.drag .zv-trk{height:6px}.zv-pg.drag .zv-trk b{transform:scale(1)}
.zv-tm{position:absolute;bottom:34px;left:50%;transform:translateX(-50%);font-size:22px;font-weight:700;direction:ltr;text-shadow:0 1px 6px rgba(0,0,0,.6);opacity:0;transition:opacity .15s;pointer-events:none;white-space:nowrap}
.zv-pg.drag .zv-tm{opacity:1}
.zv-it.seeking .zv-meta,.zv-it.seeking .zv-side{opacity:0;transition:opacity .15s}
.zv-snd{position:absolute;top:calc(env(safe-area-inset-top) + 62px);left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:8px 14px 8px 12px;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#fff;font:inherit;font-size:13.5px;font-weight:600;white-space:nowrap}
.zv-snd .zv-i{width:19px;height:19px}.zv-snd[hidden]{display:none}
.zv-heart{position:absolute;z-index:5;width:96px;height:96px;margin:-48px 0 0 -48px;pointer-events:none;color:#ff3b5c;animation:zvh .8s ease-out forwards}
.zv-heart .zv-i{width:96px;height:96px;fill:#ff3b5c;filter:drop-shadow(0 4px 10px rgba(0,0,0,.35))}
@keyframes zvh{0%{transform:scale(.4) rotate(-12deg);opacity:0}20%{transform:scale(1.1) rotate(-8deg);opacity:1}60%{transform:scale(1) rotate(-8deg);opacity:1}100%{transform:translateY(-70px) scale(1.2) rotate(-8deg);opacity:0}}
.zv-ring{position:absolute;inset:-4px;pointer-events:none}
.zv-dlb{position:relative}
.zv-spd{display:flex;gap:8px;margin:4px 0 6px}.zv-spd button{flex:1;border:1.5px solid var(--line,#ddd);background:none;color:inherit;border-radius:12px;padding:10px 0;font:inherit;font-weight:700;direction:ltr}
.zv-spd button.on{background:var(--accent,#34457a);border-color:var(--accent,#34457a);color:#fff}
.zv-row{display:flex;align-items:center;gap:12px;width:100%;border:0;border-bottom:1px solid var(--line,#eee);background:none;color:inherit;font:inherit;font-size:15px;padding:14px 4px;text-align:start}
.zv-row .zv-i{width:22px;height:22px;color:var(--accent,#34457a)}
.zv-empty{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:30px}
.zv-empty .zv-i{width:60px;height:60px;margin:0 auto 14px;opacity:.85;stroke:#e8a37c}
.zv-empty h2{margin:0 0 6px;font-size:20px}.zv-empty p{margin:0 0 18px;opacity:.75;font-size:14px;line-height:1.8}
.zv-load{position:absolute;inset:0;display:grid;place-items:center}
.zv-load i{width:40px;height:40px;border-radius:50%;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;animation:zvr .8s linear infinite}
.zv-sh{position:absolute;inset:0;z-index:20;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;animation:zvf .2s}
@keyframes zvf{from{opacity:0}}
.zv-pan{width:100%;max-height:86%;background:var(--card,#fff);color:var(--ink,#1d1c22);border-radius:24px 24px 0 0;padding:10px 16px calc(env(safe-area-inset-bottom) + 16px);display:flex;flex-direction:column;animation:zvs .25s ease-out;max-width:640px;margin:0 auto}
@keyframes zvs{from{transform:translateY(40%)}}
.zv-pan .grab{width:40px;height:4px;border-radius:4px;background:var(--line,#ddd);margin:0 auto 10px}
.zv-pan h4{margin:0 0 10px;font-size:17px;display:flex;align-items:center;justify-content:space-between}
.zv-pan h4 button{border:0;background:var(--bg-2,#eee);color:inherit;width:34px;height:34px;border-radius:12px;display:grid;place-items:center}.zv-pan h4 .zv-i{width:18px;height:18px}
.zv-cl{overflow-y:auto;flex:1;min-height:120px;margin:0 -4px;padding:0 4px}
.zv-c{padding:10px 0;border-bottom:1px solid var(--line,#eee);display:flex;gap:10px}
.zv-c .av{flex:none;width:34px;height:34px;border-radius:50%;background:color-mix(in srgb,var(--accent,#34457a) 14%,transparent);color:var(--accent,#34457a);display:grid;place-items:center;font-weight:700}
.zv-c b{font-size:13px}.zv-c small{color:var(--muted,#777);font-size:11px;margin-inline-start:6px}.zv-c p{margin:2px 0 0;font-size:14.5px;line-height:1.7;word-break:break-word}
.zv-c .rp{margin-inline-start:auto;border:0;background:none;color:var(--muted,#888);padding:4px;align-self:flex-start}.zv-c .rp .zv-i{width:16px;height:16px}
.zv-f{display:flex;gap:8px;align-items:flex-end;padding-top:10px}
.zv-in{width:100%;font:inherit;font-size:15px;padding:11px 13px;border-radius:14px;border:1px solid var(--line,#ddd);background:var(--bg,#f6f4ef);color:inherit;resize:none}
.zv-send{flex:none;width:46px;height:46px;border-radius:14px;border:0;background:var(--accent,#34457a);color:#fff;display:grid;place-items:center}
.zv-lb{display:block;font-size:13px;color:var(--muted,#777);margin:10px 0 4px}
.zv-pick{display:flex;align-items:center;gap:12px;border:1.5px dashed var(--line,#ccc);border-radius:18px;padding:14px;cursor:pointer;background:var(--z-soft,#f3f3f8)}
.zv-pick .zv-i{width:34px;height:34px;color:var(--accent,#34457a)}
.zv-pick img{width:56px;height:90px;object-fit:cover;border-radius:10px;background:#000}
.zv-note{display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.7;background:color-mix(in srgb,#c0693f 12%,transparent);color:inherit;border-radius:14px;padding:10px 12px;margin:12px 0 4px}
.zv-go{width:100%;margin-top:12px;border:0;border-radius:16px;padding:14px;background:var(--accent,#34457a);color:#fff;font:inherit;font-weight:700;font-size:16px}
.zv-go:disabled{opacity:.55}
.zv-bar{height:8px;border-radius:8px;background:var(--line,#eee);overflow:hidden;margin-top:12px}.zv-bar i{display:block;height:100%;width:0;background:#c0693f;transition:width .2s}
.zv-st{font-size:13px;color:var(--muted,#777);margin-top:6px;min-height:20px}
.zv-rs button{display:block;width:100%;text-align:start;border:0;border-bottom:1px solid var(--line,#eee);background:none;color:inherit;font:inherit;font-size:15px;padding:14px 4px}
.zv-adm{display:block;text-align:center;font-size:12px;color:var(--muted,#999);margin-top:12px;text-decoration:none}
@media(min-width:700px){.zv-it video{max-width:480px;margin:auto}}`;
let root,feed,items=[],more=null,now=Date.now(),obs,OM=0,curIdx=-1,loading=false,raf=0,nextT=0,rate=1;
let muted=true;try{muted=sessionStorage.getItem('zad.zvsnd')!=='1';rate=+sessionStorage.getItem('zad.zvrate')||1}catch(e){}
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function css(){if(document.getElementById('zv-css'))return;const s=document.createElement('style');s.id='zv-css';s.textContent=CSS;document.head.appendChild(s)}
function build(){css();if(root&&document.body.contains(root))return;
 root=document.createElement('div');root.className='zv';root.id='zv';root.setAttribute('role','dialog');root.setAttribute('aria-label','مقاطع الأسبوع');
 root.innerHTML=`<div class="zv-top"><button class="zv-btn" id="zvb" aria-label="رجوع">${ic('back')}</button><b>مقاطع</b><button class="zv-up" id="zvu" aria-label="رفع مقطع">${ic('plus')}رفع</button></div><div class="zv-feed" id="zvf"></div><button class="zv-snd" id="zvs" hidden></button><div class="zv-load" id="zvl"><i></i></div>`;
 document.body.appendChild(root);document.documentElement.style.overflow='hidden';
 feed=root.querySelector('#zvf');
 root.querySelector('#zvb').onclick=()=>{if(history.length>1&&ST.inapp)history.back();else location.hash='home'};
 root.querySelector('#zvu').onclick=()=>upload();
 root.querySelector('#zvs').onclick=()=>setMuted(!muted,1);
 obs=new IntersectionObserver(es2=>{es2.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>.6)activate(+e.target.dataset.i)})},{root:feed,threshold:[.6]});
 feed.addEventListener('scroll',()=>{if(more&&!loading&&feed.scrollTop+feed.clientHeight*3>feed.scrollHeight)load(true)},{passive:true});
}
function unload(v){try{v.pause();if(v.getAttribute('src')){v.removeAttribute('src');v.load()}}catch(e){}}
function close(){if(!root)return;cancelAnimationFrame(raf);clearTimeout(nextT);try{obs.disconnect()}catch(e){}root.querySelectorAll('video').forEach(unload);root.remove();root=null;items=[];curIdx=-1;document.documentElement.style.overflow=''}
function cur(){return feed&&feed.querySelector('.zv-it[data-i="'+curIdx+'"]')}
function setMuted(m,user){muted=m;if(user){try{sessionStorage.setItem('zad.zvsnd',m?'0':'1')}catch(e){}}
 const b=root&&root.querySelector('#zvs');if(b){b.hidden=!items.length||!m;b.innerHTML=ic('mute')+'اضغط للصوت'}
 const s=cur(),v=s&&s.querySelector('video');if(v){v.muted=m;if(!m&&v.paused&&!s.dataset.up)v.play().catch(()=>{})}}
function src(it){return'/api/videos/v/'+it.id+(it.sz?'?s='+it.sz:'')}
function fmt(t){t=Math.max(0,Math.floor(t||0));return ar(Math.floor(t/60)+':'+String(t%60).padStart(2,'0'))}
function itemHTML(it,i){const tall=!it.official&&it.h&&it.w&&it.h/it.w>1.5;const nm=it.name||'زاد';
 return`<section class="zv-it${tall?' tall':''}" data-i="${i}" data-id="${it.id}"><video playsinline webkit-playsinline loop muted preload="none" disablepictureinpicture disableremoteplayback controlslist="nodownload noplaybackrate" ${it.poster?`data-poster="/api/videos/p/${it.id}${it.sz?'?s='+it.sz:''}"`:''}></video>
 <div class="zv-tap"></div><div class="zv-spin"><i></i></div><div class="zv-pp"><span>${ic('play')}</span></div>
 <div class="zv-err" hidden><div><p>تعذّر تشغيل المقطع، تأكد من الاتصال</p><button class="zv-rt">${ic('retry')}إعادة المحاولة</button></div></div>
 <div class="zv-meta"><div class="zv-who"><span class="av">${es(nm.trim().charAt(0))}</span><b>${es(nm)}</b></div><h3>${es(it.title)}</h3>${it.official?'':`<span class="zv-exp">${left(it.expires_at,now)}</span>`}</div>
 <div class="zv-side"><button class="zv-a zl${it.liked?' liked':''}" aria-label="إعجاب"><span class="ico">${ic('heart')}</span><em class="n">${it.likes?cnt(it.likes):'إعجاب'}</em></button>
 <button class="zv-a zc" aria-label="التعليقات"><span class="ico">${ic('chat')}</span><em class="n">${it.comments?cnt(it.comments):'تعليق'}</em></button>
 <button class="zv-a zs" aria-label="مشاركة"><span class="ico">${ic('share')}</span><em class="n">مشاركة</em></button>
 <button class="zv-a zd zv-dlb" aria-label="تحميل المقطع"><span class="ico">${ic('dl')}</span><em class="n">تحميل</em></button>
 <button class="zv-a zm" aria-label="المزيد"><span class="ico">${ic('more')}</span><em class="n">المزيد</em></button></div>
 <div class="zv-pg" aria-label="شريط التقدم"><span class="zv-tm"></span><div class="zv-trk"><i class="bf"></i><i class="fl"></i><b></b></div></div></section>`}
function render(append,from){const l=root.querySelector('#zvl');l&&l.remove();
 if(!items.length){feed.innerHTML=`<div class="zv-empty"><div>${ic('reel')}<h2>لا توجد مقاطع هذا الأسبوع</h2><p>كن أول من يشارك مقطعًا إسلاميًا قصيرًا ينفع الناس.<br>يُحفظ آخر ٣٠ مقطع لكل حساب.</p><button class="zv-up" id="zve" style="margin:0 auto">${ic('plus')}رفع مقطع</button></div></div>`;feed.querySelector('#zve').onclick=()=>upload();setMuted(muted);return}
 const start=append?from:0;const html=items.slice(start).map((it,k)=>itemHTML(it,start+k)).join('');
 if(append)feed.insertAdjacentHTML('beforeend',html);else feed.innerHTML=html;
 [...feed.querySelectorAll('.zv-it')].slice(start).forEach(bind);setMuted(muted)}
function ld(sec,on){sec.classList.toggle('ld',!!on)}
function bind(sec){const i=+sec.dataset.i,it=items[i],v=sec.querySelector('video'),tap=sec.querySelector('.zv-tap'),err=sec.querySelector('.zv-err');obs.observe(sec);
 let last=0,tt=0,wt=0;
 tap.addEventListener('click',e=>{const t=Date.now();if(t-last<300){clearTimeout(tt);last=0;burst(sec,e.clientX,e.clientY);like(sec,true);return}last=t;
  tt=setTimeout(()=>{if(muted&&!sessionStorage.getItem('zad.zvsnd')){setMuted(false,1);v.paused&&v.play().catch(()=>{});return}
   if(v.paused){sec.dataset.up='';v.play().catch(()=>{});pp(sec,false)}else{sec.dataset.up='1';v.pause();pp(sec,true)}},280)});
 v.addEventListener('waiting',()=>{clearTimeout(wt);wt=setTimeout(()=>ld(sec,1),200)});
 v.addEventListener('playing',()=>{clearTimeout(wt);ld(sec,0);err.hidden=true;sec.dataset.ok='1';if(+sec.dataset.i===curIdx)prefetchNext()});
 v.addEventListener('canplay',()=>{if(+sec.dataset.i!==curIdx){ld(sec,0)}});
 v.addEventListener('error',()=>{if(!v.getAttribute('src'))return;clearTimeout(wt);ld(sec,0);err.hidden=false});
 sec.querySelector('.zv-rt').onclick=()=>{err.hidden=true;ld(sec,1);v.src=src(it)+(it.sz?'&':'?')+'r='+Date.now();v.load();v.muted=muted;v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})};
 sec.querySelector('.zl').onclick=()=>like(sec);
 sec.querySelector('.zc').onclick=()=>comments(it,sec);
 sec.querySelector('.zs').onclick=()=>share(it);
 sec.querySelector('.zd').onclick=e=>download(it,e.currentTarget);
 sec.querySelector('.zm').onclick=()=>moreSheet(it,sec);
 seekBar(sec,v)}
function pp(sec,on){const p=sec.querySelector('.zv-pp');p.classList.toggle('on',on)}
function burst(sec,x,y){const r=sec.getBoundingClientRect(),h=document.createElement('div');h.className='zv-heart';h.innerHTML=ic('heart');h.style.left=(x-r.left)+'px';h.style.top=(y-r.top)+'px';sec.appendChild(h);setTimeout(()=>h.remove(),850)}
/* progress + drag-to-seek (RTL: the bar fills from the right) */
function frac(pg,x){const r=pg.querySelector('.zv-trk').getBoundingClientRect();return Math.max(0,Math.min(1,(r.right-x)/r.width))}
function paint(sec,f,b){const t=sec.querySelector('.zv-trk');t.children[1].style.width=(f*100)+'%';t.children[2].style.insetInlineStart=(f*100)+'%';if(b!=null)t.children[0].style.width=(b*100)+'%'}
function seekBar(sec,v){const pg=sec.querySelector('.zv-pg'),tm=sec.querySelector('.zv-tm');let drag=false,f=0,was=false;
 const mv=e=>{if(!drag)return;f=frac(pg,e.clientX);paint(sec,f);tm.textContent=fmt(f*(v.duration||0))+' / '+fmt(v.duration)};
 pg.addEventListener('pointerdown',e=>{if(!v.duration)return;e.preventDefault();e.stopPropagation();drag=true;was=!v.paused;pg.classList.add('drag');sec.classList.add('seeking');try{pg.setPointerCapture(e.pointerId)}catch(_){}mv(e)});
 pg.addEventListener('pointermove',mv);
 const up=e=>{if(!drag)return;drag=false;pg.classList.remove('drag');sec.classList.remove('seeking');try{v.currentTime=f*v.duration}catch(_){}if(was)v.play().catch(()=>{})};
 pg.addEventListener('pointerup',up);pg.addEventListener('pointercancel',up);
 pg.addEventListener('click',e=>e.stopPropagation());
 sec._drag=()=>drag}
function tick(){cancelAnimationFrame(raf);const s=cur();if(!s||!root)return;const v=s.querySelector('video');
 if(v&&v.duration&&!(s._drag&&s._drag())){let b=0;try{const B=v.buffered;for(let k=0;k<B.length;k++)if(B.start(k)<=v.currentTime+.5)b=B.end(k)}catch(e){}paint(s,v.currentTime/v.duration,b/v.duration)}
 raf=requestAnimationFrame(tick)}
function ensure(sec,it,pre){const v=sec.querySelector('video');const p=v.dataset.poster;if(p&&!v.getAttribute('poster'))v.setAttribute('poster',p);
 v.preload=pre;if(!v.getAttribute('src')){v.src=src(it)}return v}
function prefetchNext(){clearTimeout(nextT);const i=curIdx;nextT=setTimeout(()=>{if(i!==curIdx||!feed)return;
 [i+1,i-1].forEach(k=>{const s=feed.querySelector('.zv-it[data-i="'+k+'"]');if(s&&items[k])ensure(s,items[k],k===i+1?'auto':'metadata')});
 const s2=feed.querySelector('.zv-it[data-i="'+(i+2)+'"]');if(s2){const v2=s2.querySelector('video');v2.dataset.poster&&!v2.getAttribute('poster')&&v2.setAttribute('poster',v2.dataset.poster)}},700)}
function activate(i){if(i===curIdx)return;curIdx=i;clearTimeout(nextT);const secs=feed.querySelectorAll('.zv-it');
 secs.forEach(sec=>{const k=+sec.dataset.i,v=sec.querySelector('video'),it=items[k];if(!it)return;
  if(k===i){sec.dataset.up='';ensure(sec,it,'auto');pp(sec,false);if(!sec.dataset.ok||v.readyState<3)ld(sec,1);
   v.muted=muted;v.playbackRate=rate;try{if(v.currentTime>0&&v.ended)v.currentTime=0}catch(e){}
   const pr=v.play();pr&&pr.catch(er=>{if(er&&er.name==='AbortError')return;if(!muted){muted=true;setMuted(true);v.muted=true;v.play().catch(()=>{ld(sec,0);pp(sec,true)})}else{ld(sec,0);pp(sec,true)}});
   try{history.replaceState(null,'','#video/'+it.id)}catch(e){}}
  else{try{v.pause()}catch(e){}v.muted=true;if(Math.abs(k-i)>2)unload(v);else if(Math.abs(k-i)<=1){const p=v.dataset.poster;p&&!v.getAttribute('poster')&&v.setAttribute('poster',p)}}});
 setTimeout(()=>{if(i===curIdx){const s=cur();if(s&&s.querySelector('video').readyState>=3)prefetchNext()}},1500);
 tick();if(more&&i>=items.length-3)load(true)}
document.addEventListener('visibilitychange',()=>{const s=cur();if(!s)return;const v=s.querySelector('video');if(document.hidden)v.pause();else if(!s.dataset.up&&!document.querySelector('.zv-sh'))v.play().catch(()=>{})});
async function load(append,firstId){if(loading)return;loading=true;
 try{let first=null;if(firstId&&!append){const j=await api('item/'+firstId);if(j.ok)first=j.item;else tst('هذا المقطع لم يعد متاحًا')}
  const q=[];if(append&&more)q.push('before='+more);const j=await api('feed'+(q.length?'?'+q.join('&'):''));if(!j.ok)throw 0;now=j.now||Date.now();
  let got=j.items||[];if(first){got=[first].concat(got.filter(x=>x.id!==first.id))}
  const from=items.length;if(append){const seen=new Set(items.map(x=>x.id));got=got.filter(x=>!seen.has(x.id));items=items.concat(got)}else items=got;more=j.more;
  if(root){render(append,from);if(!append&&items.length){curIdx=-1;feed.scrollTop=0;activate(0)}}}
 catch(e){const l=root&&root.querySelector('#zvl');if(l)l.innerHTML='<div style="text-align:center">تعذّر التحميل، تأكد من الاتصال<br><br><button class="zv-up" style="margin:auto" onclick="location.reload()">إعادة المحاولة</button></div>'}
 loading=false}
/* «تحميل»: Android/desktop → the browser's own download (Content-Disposition); iPhone → fetch, then the share sheet with the file («حفظ الفيديو» puts it in Photos) */
function fname(it){return(String(it.title||'مقطع').replace(/[\\/:*?"<>|#%]+/g,' ').replace(/\s+/g,' ').trim().slice(0,60)||'zad')+'.mp4'}
async function download(it,btn){if(btn.classList.contains('busy'))return;const url='/api/videos/v/'+it.id+'?dl=1'+(it.sz?'&s='+it.sz:'');
 if(!IOS){const a=document.createElement('a');a.href=url;a.download=fname(it);a.rel='noopener';document.body.appendChild(a);a.click();a.remove();tst('جارٍ تحميل المقطع… تجده في «التنزيلات»');return}
 const n=btn.querySelector('.n');btn.classList.add('busy');
 try{const r=await fetch(src(it));if(!r.ok)throw 0;const tot=+r.headers.get('content-length')||it.sz||0;let got=0;const ch=[];
  if(r.body&&r.body.getReader){const rd=r.body.getReader();for(;;){const x=await rd.read();if(x.done)break;ch.push(x.value);got+=x.value.length;if(tot)n.textContent=ar(Math.min(99,Math.round(got/tot*100)))+'٪'}}else ch.push(new Uint8Array(await r.arrayBuffer()));
  const file=new File(ch,fname(it),{type:'video/mp4'});btn.classList.remove('busy');n.textContent='تحميل';
  if(navigator.canShare&&navigator.canShare({files:[file]})){const s=sheet(`<h4><span>المقطع جاهز</span><button class="zx" aria-label="إغلاق">${ic('x')}</button></h4><p class="zv-st" style="font-size:14px;line-height:1.8;margin:0 0 4px">اضغط «حفظ» ثم اختر «حفظ الفيديو» ليصل إلى صورك.</p><button class="zv-go" id="zvsv">حفظ</button>`);
   s.querySelector('#zvsv').onclick=async()=>{try{await navigator.share({files:[file],title:it.title})}catch(e){}s.remove()};return}
  location.href=url}
 catch(e){btn.classList.remove('busy');n.textContent='تحميل';location.href=url}}
function moreSheet(it,sec){const v=sec.querySelector('video');const R=[1,1.25,1.5];
 const s=sheet(`<h4><span>خيارات المقطع</span><button class="zx" aria-label="إغلاق">${ic('x')}</button></h4><div class="zv-lb" style="display:flex;align-items:center;gap:6px">${ic('speed')}سرعة التشغيل</div><div class="zv-spd">${R.map(r=>`<button data-r="${r}" class="${r===rate?'on':''}">${r}×</button>`).join('')}</div>
 <button class="zv-row" id="zvfs">${ic('full')}ملء الشاشة</button><button class="zv-row" id="zvdl">${ic('dl')}تحميل المقطع</button><button class="zv-row" id="zvrp">${ic('flag')}إبلاغ عن المقطع</button>`);
 s.querySelectorAll('.zv-spd button').forEach(b=>b.onclick=()=>{rate=+b.dataset.r;try{sessionStorage.setItem('zad.zvrate',rate)}catch(e){}feed.querySelectorAll('video').forEach(x=>x.playbackRate=rate);s.querySelectorAll('.zv-spd button').forEach(x=>x.classList.toggle('on',x===b))});
 s.querySelector('#zvfs').onclick=()=>{s.remove();try{if(document.fullscreenElement)document.exitFullscreen();else if(root.requestFullscreen)root.requestFullscreen().catch(()=>v.webkitEnterFullscreen&&v.webkitEnterFullscreen());else if(v.webkitEnterFullscreen)v.webkitEnterFullscreen()}catch(e){}};
 s.querySelector('#zvdl').onclick=()=>{s.remove();download(it,sec.querySelector('.zd'))};
 s.querySelector('#zvrp').onclick=()=>{s.remove();report('report/'+it.id,'إبلاغ عن المقطع',()=>{sec.style.opacity=.35})}}
async function like(sec,only){const i=+sec.dataset.i,it=items[i],b=sec.querySelector('.zl');if(only&&it.liked){b.classList.remove('pop');b.offsetWidth;b.classList.add('pop');return}
 it.liked=!it.liked;it.likes=Math.max(0,(it.likes||0)+(it.liked?1:-1));b.classList.toggle('liked',it.liked);b.classList.remove('pop');b.offsetWidth;if(it.liked)b.classList.add('pop');b.querySelector('.n').textContent=it.likes?cnt(it.likes):'إعجاب';
 try{navigator.vibrate&&navigator.vibrate(10)}catch(e){}
 const j=await api('like/'+it.id,{on:it.liked});if(j.ok){it.likes=j.likes;it.liked=j.liked;b.querySelector('.n').textContent=it.likes?cnt(it.likes):'إعجاب';b.classList.toggle('liked',it.liked)}}
function sheet(html){const s=document.createElement('div');s.className='zv-sh';s.innerHTML=`<div class="zv-pan" role="dialog"><div class="grab"></div>${html}</div>`;
 s.addEventListener('click',e=>{if(e.target===s)s.remove()});(root||document.body).appendChild(s);const x=s.querySelector('.zx');x&&(x.onclick=()=>s.remove());return s}
async function comments(it,sec){const s=sheet(`<h4><span>التعليقات</span><button class="zx" aria-label="إغلاق">${ic('x')}</button></h4><div class="zv-cl" id="zvcl"><div class="zv-st">جارٍ التحميل…</div></div>
 <div class="zv-f"><div style="flex:1"><input class="zv-in" id="zvcn" maxlength="30" placeholder="اسمك" value="${es(ST.name||'')}" style="margin-bottom:6px;padding:8px 12px;font-size:13px"><textarea class="zv-in" id="zvct" rows="1" maxlength="300" placeholder="أضف تعليقًا طيبًا…"></textarea></div><button class="zv-send" id="zvcs" aria-label="إرسال">${ic('send')}</button></div><div class="zv-st" id="zvcm"></div>`);
 const L=s.querySelector('#zvcl');
 const row=c=>`<div class="zv-c" data-c="${c.id}"><span class="av">${es((c.name||'؟').trim().charAt(0))}</span><div style="flex:1;min-width:0"><b>${es(c.name)}</b><small>${ago(c.at)}</small><p>${es(c.text)}</p></div><button class="rp" aria-label="إبلاغ عن التعليق">${ic('flag')}</button></div>`;
 const bindR=()=>L.querySelectorAll('.rp').forEach(b=>b.onclick=()=>{const c=b.closest('[data-c]');report('creport/'+c.dataset.c,'إبلاغ عن التعليق',()=>c.style.opacity=.35)});
 const j=await api('comments/'+it.id);L.innerHTML=j.ok&&j.items.length?j.items.map(row).join(''):`<div class="zv-st" style="text-align:center;padding:24px 0">لا توجد تعليقات بعد، كن أول من يعلّق</div>`;bindR();
 const t=s.querySelector('#zvct'),m=s.querySelector('#zvcm');t.addEventListener('input',()=>{t.style.height='auto';t.style.height=Math.min(120,t.scrollHeight)+'px';m.textContent=t.value.length>250?ar(300-t.value.length)+' حرف متبقٍ':''});
 s.querySelector('#zvcs').onclick=async()=>{const name=s.querySelector('#zvcn').value.trim(),text=t.value.trim();if(name.length<2)return m.textContent=ERR.name;if(!text)return m.textContent=ERR.empty;
  const b=s.querySelector('#zvcs');b.disabled=true;const r=await api('comment/'+it.id,{name,text});b.disabled=false;
  if(!r.ok){m.textContent=em(r);return}ST.name=name;keep();t.value='';t.style.height='';m.textContent='';
  if(!L.querySelector('.zv-c'))L.innerHTML='';L.insertAdjacentHTML('afterbegin',row(r.item));bindR();it.comments=(it.comments||0)+1;sec&&(sec.querySelector('.zc .n').textContent=cnt(it.comments))}}
function report(path,title,done){const R=['فيه موسيقى','صور أو محتوى غير لائق','معلومة دينية غير صحيحة','إساءة أو كلام سيئ','سبب آخر'];
 const s=sheet(`<h4><span>${title}</span><button class="zx" aria-label="إغلاق">${ic('x')}</button></h4><div class="zv-rs">${R.map(r=>`<button>${r}</button>`).join('')}</div><div class="zv-st">البلاغات تراجعها إدارة التطبيق، وما يتكرر عليه البلاغ يُخفى تلقائيًا.</div>`);
 s.querySelectorAll('.zv-rs button').forEach(b=>b.onclick=async()=>{s.remove();const j=await api(path,{reason:b.textContent});if(j.ok){tst('وصل بلاغك، جزاك الله خيرًا');done&&done()}else tst(em(j))})}
async function share(it){const url=(window.ZAD_ORIGIN||location.origin)+'/#video/'+it.id,text='«'+it.title+'» · من مقاطع الأسبوع في تطبيق زاد';
 try{if(navigator.share){await navigator.share({title:it.title,text,url});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(text+'\n'+url);tst('نُسخ الرابط')}catch(e){prompt('انسخ الرابط',url)}}

/* ---------------- upload ---------------- */
const TYPES={mov:'video/quicktime',mp4:'video/mp4',m4v:'video/x-m4v',webm:'video/webm','3gp':'video/3gpp'};
function ftype(f){if(/^video\/(mp4|quicktime|webm|3gpp|x-m4v)$/.test(f.type))return f.type;const e=(f.name.split('.').pop()||'').toLowerCase();return TYPES[e]||(f.type&&f.type.indexOf('video/')===0?'video/mp4':'')}
function probe(blob){return new Promise((ok,no)=>{const v=document.createElement('video');v.preload='metadata';v.muted=true;v.playsInline=true;const u=URL.createObjectURL(blob);let done=0;
 const fail=()=>{if(done++)return;URL.revokeObjectURL(u);no(new Error('read'))};const to=setTimeout(fail,20000);
 v.onloadedmetadata=()=>{const d=v.duration;const grab=()=>{if(done)return;try{const W=v.videoWidth,Hh=v.videoHeight;const sc=Math.min(1,540/Math.max(1,W));const c=document.createElement('canvas');c.width=Math.max(2,Math.round(W*sc));c.height=Math.max(2,Math.round(Hh*sc));c.getContext('2d').drawImage(v,0,0,c.width,c.height);
   c.toBlob(b=>{done=1;clearTimeout(to);URL.revokeObjectURL(u);ok({dur:d,w:W,h:Hh,poster:b,url:b?URL.createObjectURL(b):''})},'image/jpeg',.8)}catch(e){done=1;clearTimeout(to);URL.revokeObjectURL(u);ok({dur:d,w:v.videoWidth,h:v.videoHeight,poster:null})}};
  if(!isFinite(d)||!d){v.currentTime=1e7;v.ontimeupdate=()=>{v.ontimeupdate=null;const dd=v.duration;v.currentTime=Math.min(1,dd/3);v.onseeked=()=>{v.onseeked=null;grab()};}; return}
  v.currentTime=Math.min(1,d/3);v.onseeked=grab;setTimeout(()=>{if(!done)grab()},6000)};
 v.onerror=fail;v.src=u})}
/* phones film big files: re-encode in the browser (real time, ~720p) when the clip is over 50 MB */
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
/* phone cameras often write the index (moov) at the END of the file, so players must fetch the tail first: move it to the front before upload (faststart). Pure JS, no re-encode. */
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
function upload(){const s=sheet(`<h4><span>رفع مقطع</span><button class="zx" aria-label="إغلاق">${ic('x')}</button></h4><div style="overflow-y:auto">
 <label class="zv-pick" id="zvp"><input type="file" accept="video/*" id="zvfile" hidden>${ic('reel')}<div style="flex:1"><b>اختر مقطعًا من جوالك</b><div class="zv-st" style="margin:0">حتى دقيقتين · بحد أقصى ٥٠ م.ب</div></div></label>
 <label class="zv-lb" for="zvt">عنوان المقطع</label><input class="zv-in" id="zvt" maxlength="80" placeholder="مثال: فضل الصلاة على وقتها">
 <label class="zv-lb" for="zvn">الاسم الذي يظهر مع المقطع</label><input class="zv-in" id="zvn" maxlength="30" placeholder="اسمك أو لقبك" value="${es(ST.name||'')}">
 <div class="zv-note">${ic('flag')}<div><b>يُمنع رفع مقاطع فيها موسيقى أو صور غير لائقة، والمخالف يُحذف.</b><br>المقطع يُنشر مباشرة ويبقى، ويُحفظ آخر ٣٠ مقطع لكل حساب. لا نطلب رقمك ولا حسابًا.</div></div>
 <button class="zv-go" id="zvgo" disabled>نشر المقطع</button><div class="zv-bar" id="zvbar" hidden><i></i></div><div class="zv-st" id="zvm"></div></div>`);
 let F=null,P=null;const m=s.querySelector('#zvm'),go=s.querySelector('#zvgo'),bar=s.querySelector('#zvbar'),bi=bar.querySelector('i');
 const prog=(p,t)=>{bar.hidden=false;bi.style.width=Math.round(p*100)+'%';if(t)m.textContent=t};
 s.querySelector('#zvfile').onchange=async e=>{const f=e.target.files[0];if(!f)return;F=null;P=null;go.disabled=true;m.textContent='جارٍ قراءة المقطع…';
  const ty=ftype(f);if(!ty){m.textContent=ERR.type;return}
  try{P=await probe(f)}catch(err){m.textContent='تعذّر قراءة هذا المقطع على جهازك، جرّب مقطعًا بصيغة MP4';return}
  if(P.dur>MAXD){m.textContent='المقطع مدته '+ar(Math.floor(P.dur/60))+':'+ar(String(Math.round(P.dur%60)).padStart(2,'0'))+'، والحد دقيقتان. قصّه من الاستوديو ثم ارفعه';return}
  F=f;F._t=ty;const pk=s.querySelector('#zvp');pk.querySelector('b').textContent=f.name.length>28?f.name.slice(0,26)+'…':f.name;
  pk.querySelector('.zv-st').textContent=ar(Math.round(P.dur))+' ث · '+ar((f.size/1048576).toFixed(1))+' م.ب'+(f.size>MAXB?' · سيُضغط قبل الرفع':'');
  const old=pk.querySelector('img');old&&old.remove();if(P.url){const im=document.createElement('img');im.src=P.url;im.alt='';pk.querySelector('svg').replaceWith(im)}
  m.textContent=f.size>MAXB?'المقطع كبير، سنضغطه داخل جوالك قبل الرفع (يأخذ وقتًا بقدر مدة المقطع تقريبًا، أبقِ الشاشة مفتوحة)':'';go.disabled=false};
 go.onclick=async()=>{const title=s.querySelector('#zvt').value.trim(),name=s.querySelector('#zvn').value.trim();
  if(!F)return m.textContent='اختر مقطعًا أولًا';if(title.length<2)return m.textContent=ERR.title;if(name.length<2)return m.textContent=ERR.name;
  go.disabled=true;s.querySelectorAll('input').forEach(i=>i.disabled=true);ST.name=name;keep();
  try{let blob=F,type=F._t;const big=F.size>MAXB;
   const j=await api('init',{title,name,dur:P.dur,size:big?MAXB:F.size,type:big?'video/mp4':type,w:P.w,h:P.h});if(!j.ok)throw Object.assign(new Error('x'),{msg:em(j)});
   if(big){prog(0,'جارٍ ضغط المقطع… لا تُغلق الشاشة');try{blob=await shrink(F,P.dur,p=>prog(p*.5,'جارٍ ضغط المقطع… '+ar(Math.round(p*100))+'٪'))}catch(e){throw Object.assign(new Error('x'),{msg:'المقطع أكبر من ٥٠ م.ب وجوالك لا يستطيع ضغطه هنا. صوّره بجودة أقل (1080p) أو قصّره ثم جرّب'})}
    if(blob.size>MAXB)throw Object.assign(new Error('x'),{msg:'حتى بعد الضغط المقطع أكبر من ٥٠ م.ب، قصّره وجرّب'})}
   const base=big?.5:0;prog(base,'جارٍ تجهيز المقطع…');try{blob=await faststart(blob)}catch(e){}prog(base,'جارٍ الرفع…');
   if(P.poster)await put('/api/videos/poster/'+j.id+'?t='+j.t,P.poster).catch(()=>{});
   await put('/api/videos/file/'+j.id+'?t='+j.t,blob,p=>prog(base+(1-base)*p,'جارٍ الرفع… '+ar(Math.round(p*100))+'٪'));
   prog(1,'');s.querySelector('.zv-pan').innerHTML=`<div class="grab"></div><div style="text-align:center;padding:26px 6px 10px"><div style="font-size:46px;line-height:1">✓</div><h3 style="margin:10px 0 6px;font-size:20px">تم النشر ✓</h3><p class="zv-st" style="font-size:14px;line-height:1.8">مقطعك ظاهر الآن في «مقاطع الأسبوع»، ويُحفظ آخر ٣٠ مقطعًا لكل حساب.<br>جزاك الله خيرًا على نشر الخير.</p><button class="zv-go" id="zvok">شاهد مقطعك</button></div>`;
   s.querySelector('#zvok').onclick=()=>{s.remove();if(root){location.hash!=='#videos'&&history.replaceState(null,'','#videos');load(false,j.id)}};
  }catch(e){go.disabled=false;s.querySelectorAll('input').forEach(i=>i.disabled=false);bar.hidden=true;m.textContent=e.msg||(e.j?em(e.j):'انقطع الرفع، تأكد من الاتصال وجرّب مرة أخرى')}}}

function open(kind,arg){try{if(!sessionStorage.getItem('zad.zvin'))ST.inapp=history.length>1}catch(e){}
 if(typeof view!=='undefined'&&view)view.innerHTML=`<div class="zcard" style="margin:16px;text-align:center"><b>مقاطع الأسبوع</b><p class="k">مقاطع إسلامية قصيرة من مستخدمي زاد</p><a class="zchip" href="#videos">فتح المقاطع</a></div>`;
 const fresh=!root||!document.body.contains(root);build();
 if(kind==='video'&&arg)load(false,String(arg).replace(/[^a-f0-9]/g,''));else if(fresh)load(false);
 if(kind==='vupload')upload()}
window.addEventListener('hashchange',()=>{const r=(location.hash.slice(1)||'home').split('/')[0];if(root&&!['videos','video','vupload'].includes(r))close()});
window.ZV={open,close,_shrink:shrink,_probe:probe,_faststart:faststart};
})();