/* زاد v4.4.4: «انشر التطبيق» — header icon, hub/settings items, home card, share sheet with ready promo images
   (hosted on zad-content.sites.tab.bot/promo, CORS copy at /x/promo for navigator.share files), weekly gentle prompt.
   Minified to site/zsrare.js (loaded after zf.js). */
(function(){'use strict';
if(window.ZSH)return;
const CDN='https://zad-content.sites.tab.bot/';let LINK='https://zad-app.sites.tab.bot/';
const TXT='تطبيق إسلامي… لكنه مختلف ✨\n«زاد»: قبلة بالكاميرا، ختمة جماعية مع أهلك وأصدقائك، وضع السيارة بالقرآن والأذكار، وأذان يصلك حتى عند إغلاق التطبيق.\nمجاني بالكامل وبدون إعلانات — أندرويد وآيفون 👇';
const TXTX='تطبيق إسلامي… لكنه مختلف ✨ «زاد»: قبلة بالكاميرا، ختمة جماعية، وضع السيارة، وأذان يصلك والتطبيق مغلق. مجاني وبدون إعلانات 👇';
let FULL=TXT+'\n'+LINK;
const IMG=[['zad-post-v4','منشور',1080,1350],['zad-story-v4','ستوري',1080,1920],['zad-sq-car','وضع السيارة',1080,1080],['zad-sq-adhan','الأذان والتطبيق مغلق',1080,1080],['zad-sq-listen','سمّعني وأصحّح',1080,1080],['zad-post-kids','زاوية الأطفال',1080,1350]];
const PI={share:'<path d="M12 15V3.8"/><path d="m7.5 8 4.5-4.5L16.5 8"/><path d="M8 11H6.5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16"/>',
 wa:'<path d="M4.5 19.5 5.6 16a7.8 7.8 0 1 1 2.6 2.5z"/><path d="M9.3 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.1 1.4 1.9 2.5 2.5l.6-.5c.2-.1.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .4-.2.7-.6.8-1 .5-2.6.3-4.4-1.2s-2.9-3.4-2.4-4.6z"/>',
 x:'<path d="M5 4.5h3.6L19 19.5h-3.6z"/><path d="M18.6 4.5 13.4 10.4M5.4 19.5l5.3-6"/>',
 tg:'<path d="M20.5 4.5 3.6 11.1c-.7.3-.7 1.2 0 1.4l4.1 1.4 1.6 4.9c.2.6.9.8 1.4.4l2.4-2 4.3 3.1c.6.4 1.4.1 1.5-.6L21.6 5.6c.2-.8-.4-1.4-1.1-1.1z"/><path d="m7.7 13.9 9.3-6.1-6.9 7.4"/>',
 link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
 save:'<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
 x2:'<path d="M6 6l12 12M18 6 6 18"/>',chev:'<path d="m15 6-6 6 6 6"/>'};
const zi=(k,c)=>`<svg class="z-ic${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PI[k]}</svg>`;
const ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const st=()=>{S.zsr=S.zsr||{};return S.zsr};
const t0=k=>{const o=st();o[k]=(o[k]||0)+1;try{save()}catch(e){}};
let cur=0;const FILES={};
function getFile(i){const n=IMG[i][0];if(FILES[n])return FILES[n];FILES[n]=fetch(CDN+'x/promo/'+n+'.jpg',{mode:'cors'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.blob()}).then(b=>(FILES[n].v=new File([b],n+'.jpg',{type:'image/jpeg'}))).catch(e=>{delete FILES[n];throw e});return FILES[n]}
function canFiles(f){try{return!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[f]}))}catch(e){return false}}
async function copy(t){try{await navigator.clipboard.writeText(t);return true}catch(e){const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch(x){}a.remove();return ok}}
function dl(f){const u=URL.createObjectURL(f);const a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}
async function shareMain(btn){relink();t0('main');const p=FILES[IMG[cur][0]];let f=p&&p.v;
 if(!f){btn&&btn.classList.add('busy');try{f=await getFile(cur)}catch(e){f=null}btn&&btn.classList.remove('busy')}
 if(f&&canFiles(f)){try{await navigator.share({files:[f],text:FULL,title:'زاد'});return 'files'}catch(e){if(e&&e.name==='AbortError')return 'abort'}}
 if(navigator.share){try{await navigator.share({title:'زاد — تطبيق المسلم',text:TXT,url:LINK});return 'text'}catch(e){if(e&&e.name==='AbortError')return 'abort'}}
 const ok=await copy(FULL);if(f)dl(f);toast(ok?(f?'نسخنا النص والرابط وحمّلنا الصورة، الصقها حيث تريد':'تم نسخ النص والرابط'):'لم نستطع النسخ، انسخ الرابط من الأعلى');return 'fallback'}
async function saveImg(btn){t0('save');btn&&btn.classList.add('busy');let f=null;try{f=await getFile(cur)}catch(e){}btn&&btn.classList.remove('busy');
 if(!f){window.open(CDN+'promo/'+IMG[cur][0]+'.jpg','_blank','noopener');return}
 if(ios&&canFiles(f)){toast('اختر «حفظ الصورة»');try{await navigator.share({files:[f]})}catch(e){}return}
 dl(f);toast('تم حفظ الصورة')}
const enc=encodeURIComponent;
let QUICK;const mkQ=()=>QUICK=[['wa','واتساب','https://wa.me/?text='+enc(FULL)],['x','X','https://twitter.com/intent/tweet?text='+enc(TXTX)+'&url='+enc(LINK)],['tg','تيليجرام','https://t.me/share/url?url='+enc(LINK)+'&text='+enc(TXT)],['link','نسخ الرابط',''],['save','حفظ الصورة','']];mkQ();
/* v4.6 «أجرك الجاري»: the link carries this device's ref (amar-muslim.sites.tab.bot/go/<ref> counts the open, then opens the download page) */
function relink(){try{const l=window.ZS&&ZS.appLink&&ZS.appLink();if(l&&l!==LINK){LINK=l;FULL=TXT+'\n'+LINK;mkQ()}}catch(e){}}

function sheetHTML(){return`<div class="zsr"><div class="zsrh"><div><b>انشر زاد</b><small>اختر صورة، وشاركها مع الرابط بضغطة</small></div><button class="zsrx" aria-label="إغلاق">${zi('x2')}</button></div>
 <div class="zsrg" id="zsrg">${IMG.map(([n,l,w,h],i)=>`<button class="zsri${i===cur?' on':''}" data-i="${i}" style="--r:${w}/${h}" aria-label="${l}"><img loading="lazy" decoding="async" src="${CDN}promo/${n}-t.jpg" alt="${l}" width="${Math.round(270*w/h)}" height="270"><span>${l}</span></button>`).join('')}</div>
 <div class="zsrd">${IMG.map((_,i)=>`<i class="${i===cur?'on':''}"></i>`).join('')}</div>
 <button class="zsrb" id="zsrmain">${zi('share')}<span>شارك الصورة + الرابط<small>واتساب، سناب، انستقرام، وغيرها</small></span></button>
 <div class="zsrq">${QUICK.map(([k,l,u])=>u?`<a class="zsrc" data-k="${k}" href="${u}" target="_blank" rel="noopener"><span class="zsrci k-${k}">${zi(k)}</span>${l}</a>`:`<button class="zsrc" data-k="${k}"><span class="zsrci k-${k}">${zi(k)}</span>${l}</button>`).join('')}</div>
 <div class="zsrt"><div>${esc(TXT).replace(/\n/g,'<br>')}<br><span dir="ltr">${LINK}</span></div><button class="zsrcp" id="zsrcpt">نسخ النص</button></div></div>`}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function open(){relink();t0('open');if(typeof openSheet!=='function')return;openSheet(sheetHTML(),(s,close)=>{s.classList.add('zsrs');
 const g=s.querySelector('#zsrg'),dots=[...s.querySelectorAll('.zsrd i')],items=[...g.querySelectorAll('.zsri')];
 const sel=i=>{cur=i;items.forEach((b,j)=>b.classList.toggle('on',j===i));dots.forEach((d,j)=>d.classList.toggle('on',j===i));getFile(i).catch(()=>{})};
 items.forEach(b=>b.onclick=()=>{sel(+b.dataset.i);b.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})});
 let tm;g.addEventListener('scroll',()=>{clearTimeout(tm);tm=setTimeout(()=>{const r=g.getBoundingClientRect(),cx=r.left+r.width/2;let bi=cur,bd=1e9;items.forEach((b,j)=>{const q=b.getBoundingClientRect(),d=Math.abs(q.left+q.width/2-cx);if(d<bd){bd=d;bi=j}});if(bi!==cur)sel(bi)},120)},{passive:true});
 s.querySelector('.zsrx').onclick=close;
 s.querySelector('#zsrmain').onclick=e=>shareMain(e.currentTarget);
 s.querySelectorAll('.zsrc').forEach(b=>b.addEventListener('click',async e=>{const k=b.dataset.k;t0(k);if(k==='link'){e.preventDefault();toast(await copy(LINK)?'تم نسخ الرابط':'لم نستطع النسخ')}else if(k==='save'){e.preventDefault();saveImg(b)}}));
 s.querySelector('#zsrcpt').onclick=async()=>{toast(await copy(FULL)?'تم نسخ النص والرابط':'لم نستطع النسخ')};
 getFile(cur).catch(()=>{});});}
/* entry points */
const ICON=()=>(window.ZI?ZI('share'):zi('share'));
function headBtn(){const a=document.querySelector('header.top .zhact');if(!a||document.getElementById('zsrbtn'))return;const b=document.createElement('button');b.className='iconbtn';b.id='zsrbtn';b.setAttribute('aria-label','انشر التطبيق');b.title='انشر التطبيق';b.innerHTML=zi('share');b.onclick=open;a.insertBefore(b,a.firstChild)}
function homeCard(){const h=location.hash;if(h&&h!=='#home'&&h!=='#')return;if(document.getElementById('zsrcard'))return;const z=view.querySelector('.zhome');if(!z)return;
 const c=document.createElement('button');c.id='zsrcard';c.className='zcard zsrcard';c.innerHTML=`<span class="zsrci">${zi('heart')}</span><span class="grow"><b>شارك زاد مع أهلك</b><small>صور جاهزة ورابط التحميل، بضغطة واحدة</small></span><span class="zsrpill">${zi('share')}انشر التطبيق</span>`;c.onclick=open;z.after(c)}
try{if(window.ZHUB&&!ZHUB.some(g=>g[1].some(x=>x[0]==='shareapp')))ZHUB[0][1].unshift(['shareapp','انشر التطبيق','share','صور جاهزة ورابط التحميل لأهلك وأصدقائك'])}catch(e){}
let prev='#home';
V.shareapp=async()=>{const p=prev&&prev!=='#shareapp'?prev:'#home';history.replaceState(null,'',p);if(!view.children.length||!view.querySelector('*')){const[r,...a]=(p.slice(1)||'home').split('/');try{await (V[r]||V.home)(a.join('/'))}catch(e){}}setTimeout(open,280)};
addEventListener('hashchange',()=>{if(location.hash!=='#shareapp')prev=location.hash||'#home';setTimeout(tick,60)});
if(V.settings){const _s=V.settings;V.settings=async(...a)=>{const r=await _s(...a);try{if(!document.getElementById('zsrset')){const sec=document.createElement('section');sec.className='zcard';sec.id='zsrset';sec.innerHTML=`<a class="zli" href="#shareapp" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit"><span class="zq">${zi('share')}</span><span class="grow"><b>انشر التطبيق</b><small style="display:block">شارك زاد مع أهلك وأصدقائك بصورة جاهزة</small></span>${zi('chev','chv')}</a>`;const f=view.querySelector('section.zcard');f?f.before(sec):view.appendChild(sec)}}catch(e){}return r}}
/* gentle prompt after a good moment (adhkar finished today, or a 7-day challenge streak), max once a week, dismissible */
function good(){try{const F=S.zf||{},d=F.d||{},k=Object.keys(d);const t=new Date(),key=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');const td=d[key]||{};
 const streak=window.ZF&&ZF.chal&&ZF.chal.streak?ZF.chal.streak():0;return streak>=7||((td.m||td.e)&&k.length>=3)}catch(e){return false}}
function prompt(){const o=st();if(o.never||o.main)return;if(Date.now()-(o.pr||0)<7*864e5)return;if(document.getElementById('sheet')&&!document.getElementById('sheet').hidden)return;if(!good())return;
 o.pr=Date.now();try{save()}catch(e){}
 openSheet(`<div class="zsrp"><span class="zsrci big">${zi('heart')}</span><b>هل أعجبك زاد؟</b><p>انشره لأهلك وأصدقائك وخذ الأجر، بصورة جاهزة ورابط التحميل.</p><button class="zsrb" id="zsrpgo">${zi('share')}<span>انشر التطبيق</span></button><div class="zsrpl"><button id="zsrplater">لاحقًا</button><button id="zsrnever">لا تذكرني</button></div></div>`,(s,close)=>{s.querySelector('#zsrpgo').onclick=()=>{close();setTimeout(open,260)};s.querySelector('#zsrplater').onclick=close;s.querySelector('#zsrnever').onclick=()=>{st().never=1;try{save()}catch(e){}close()}})}
let pt;function tick(){try{headBtn();homeCard()}catch(e){}clearTimeout(pt);if(location.hash===''||location.hash==='#home')pt=setTimeout(prompt,1800)}
const _h=V.home;if(_h)V.home=async function(){const r=await _h.apply(this,arguments);try{homeCard()}catch(e){}return r};
const css=`.zsrs{padding-top:6px}.zsr{direction:rtl}.zsrh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:2px 0 12px}.zsrh b{font-size:19px;display:block}.zsrh small{display:block;color:var(--muted);font-size:13px;margin-top:2px}.zsrx{width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:var(--ink);display:grid;place-items:center;padding:0;flex:none}.zsrx svg{width:18px;height:18px}
.zsrg{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:4px 18px 10px;margin:0 -18px;scrollbar-width:none;align-items:flex-end}.zsrg::-webkit-scrollbar{display:none}
.zsri{flex:none;scroll-snap-align:center;border:0;background:none;padding:0;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--muted);font:inherit;font-size:12px;cursor:pointer}
.zsri img{height:270px;width:auto;aspect-ratio:var(--r);border-radius:16px;background:var(--z-soft,#efeae0);box-shadow:0 6px 18px #1d254522;outline:3px solid transparent;outline-offset:2px;transition:outline-color .15s,transform .15s;object-fit:cover}
.zsri.on img{outline-color:var(--accent,#c0693f)}.zsri.on{color:var(--ink);font-weight:700}
.zsrd{display:flex;justify-content:center;gap:6px;margin:2px 0 14px}.zsrd i{width:6px;height:6px;border-radius:3px;background:var(--line);transition:width .2s,background .2s}.zsrd i.on{width:18px;background:var(--accent,#c0693f)}
.zsrb{width:100%;display:flex;align-items:center;justify-content:center;gap:12px;border:0;border-radius:18px;padding:14px 16px;background:linear-gradient(160deg,#34457a,#1d2545);color:#fffefb;font:inherit;font-size:17px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px #1d254533}.zsrb svg{width:24px;height:24px}.zsrb small{display:block;font-size:12px;font-weight:400;opacity:.8}.zsrb span{text-align:right}.zsrb.busy{opacity:.7}
.zsrq{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:16px 0 12px}.zsrc{display:flex;flex-direction:column;align-items:center;gap:6px;font:inherit;font-size:12px;color:var(--ink);text-decoration:none;background:none;border:0;padding:0;cursor:pointer}.zsrc.busy{opacity:.6}
.zsrci{width:50px;height:50px;border-radius:16px;display:grid;place-items:center;background:var(--z-soft,#efeae0);color:var(--accent,#34457a);border:1px solid var(--line)}.zsrci svg{width:24px;height:24px}.zsrci.k-wa{color:#1f8f55}.zsrci.k-tg{color:#2f7fb8}.zsrci.k-x{color:var(--ink)}
.zsrt{display:flex;gap:10px;align-items:flex-start;background:var(--z-soft,#efeae0);border-radius:14px;padding:10px 12px;font-size:12.5px;line-height:1.75;color:var(--muted)}.zsrt>div{flex:1;min-width:0;overflow-wrap:anywhere}.zsrcp{flex:none;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:6px 12px;font:inherit;font-size:12px;cursor:pointer}
.zsrcard{display:flex!important;align-items:center;gap:12px;width:100%;text-align:right;font:inherit;color:inherit;cursor:pointer;margin-top:12px}.zsrcard .grow{flex:1}.zsrcard b{display:block;font-size:15px}.zsrcard small{display:block;color:var(--muted);font-size:12.5px}.zsrcard .zsrci{color:#c0693f;width:44px;height:44px;border-radius:14px}
.zsrpill{display:flex;align-items:center;gap:5px;flex:none;background:#c0693f;color:#fffefb;border-radius:999px;padding:7px 11px;font-size:12.5px;font-weight:700}.zsrpill svg{width:15px;height:15px}
.zsrp{text-align:center;padding:6px 4px 2px}.zsrp b{display:block;font-size:20px;margin-top:10px}.zsrp p{color:var(--muted);font-size:14px;line-height:1.8;margin:6px 0 16px}.zsrci.big{margin:4px auto 0;width:58px;height:58px;color:#c0693f}.zsrpl{display:flex;justify-content:center;gap:18px;margin-top:10px}.zsrpl button{background:none;border:0;color:var(--muted);font:inherit;font-size:13.5px;padding:8px;cursor:pointer}`;
const s=document.createElement('style');s.textContent=css;document.head.appendChild(s);
window.ZSH={open,shareMain,saveImg,IMG,TXT,LINK,FULL,getFile,prompt,_cur:()=>cur};
tick();setTimeout(tick,800);
})();
