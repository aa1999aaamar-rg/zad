/* زاد v4.4: وضع السيارة (high contrast, huge buttons, Media Session, Wake Lock). Lazy module, minified to site/zf-car.js */
(function(){'use strict';const {zi,ar,esc,F,wake}=ZF;
const SC={m:['أذكار الصباح','28202761'],e:['أذكار المساء','28203593']}; // the app's existing Alafasy audio (official SoundCloud), same ids as «الأذكار المسموعة»
const css=`.zfcar{position:fixed;inset:0;z-index:92;background:#000;color:#fff;display:flex;flex-direction:column;padding:calc(14px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom));box-sizing:border-box;font-family:Zad,system-ui,sans-serif;user-select:none;-webkit-user-select:none}
.zfcar .tp{display:flex;justify-content:space-between;align-items:center}.zfcar .tp b{font-size:26px;font-variant-numeric:tabular-nums}.zfcar .ex{background:#222;color:#fff;border:2px solid #555;border-radius:18px;font:inherit;font-size:20px;font-weight:700;padding:12px 20px}
.zfcar .now{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:6px;min-height:150px}.zfcar .now .s{font-size:44px;font-weight:700;line-height:1.2}.zfcar .now .a{font-size:20px;color:#bbb}.zfcar .now .r{font-size:18px;color:#f2bd9b}
.zfcar .ctl{display:grid;grid-template-columns:1fr 1.3fr 1fr;gap:12px}.zfcar .ctl button,.zfcar .row2 button{background:#1b1b1b;border:3px solid #444;color:#fff;border-radius:26px;font:inherit;font-weight:700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer}
.zfcar .ctl button{min-height:150px;font-size:19px}.zfcar .ctl .pp{background:#f2bd9b;color:#000;border-color:#f2bd9b;font-size:22px}.zfcar .ctl svg{width:58px;height:58px;stroke-width:2.4}.zfcar .ctl .pp svg{width:76px;height:76px}
.zfcar .row2{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:12px}.zfcar .row2 button{min-height:92px;font-size:17px}.zfcar .row2 svg{width:30px;height:30px}.zfcar .row2 button.on{border-color:#f2bd9b;color:#f2bd9b}
.zfcar .scw{margin-top:10px;border-radius:14px;overflow:hidden;background:#111}.zfcar .scw iframe{width:100%;height:120px;border:0;display:block}.zfcar .msg{text-align:center;color:#bbb;font-size:15px;min-height:20px;margin-top:8px}`;
let el=null,au=null,wl=null,clk=0;
const st=()=>F.car=Object.assign({s:1,a:1,r:''},F.car||{});
const recs=()=>(typeof RECS!=='undefined'?RECS:[]).filter(r=>['maher','husary','sudais','alafasy','husarym'].includes(r.id));
const rec=()=>{const c=st(),l=recs();return l.find(r=>r.id===c.r)||l.find(r=>r.id===S.settings.reciter)||l[0]||{f:'MaherAlMuaiqly128kbps',n:'ماهر المعيقلي',id:'maher'}};
const nA=s=>(QDATA.ch[s-1]||[0,'',7])[2];
const url=(s,a)=>'https://everyayah.com/data/'+rec().f+'/'+String(s).padStart(3,'0')+String(a).padStart(3,'0')+'.mp3';
function ui(){if(!el)return;const c=st();el.querySelector('.s').textContent='سورة '+QDATA.ch[c.s-1][1];el.querySelector('.a').textContent='الآية '+ar(c.a)+' من '+ar(nA(c.s));el.querySelector('.r').textContent='بصوت الشيخ '+rec().n;
 const pp=el.querySelector('.pp');const playing=au&&!au.paused;pp.innerHTML=(playing?zi('pause'):zi('play'))+(playing?'إيقاف مؤقت':'تشغيل');
 try{if('mediaSession' in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:'سورة '+QDATA.ch[c.s-1][1]+' · '+ar(c.a),artist:rec().n,album:'زاد',artwork:[{src:'icons/icon-512.png',sizes:'512x512',type:'image/png'}]});navigator.mediaSession.playbackState=playing?'playing':'paused'}}catch(e){}}
function msg(t){const m=el&&el.querySelector('.msg');if(m)m.textContent=t}
function play(){const c=st();stopSC();try{AP.el.pause()}catch(e){}try{window._radio&&_radio.pause()}catch(e){}
 au.src=url(c.s,c.a);au.play().then(()=>msg('')).catch(()=>msg('تعذّر التشغيل، تأكد من الإنترنت'));ui()}
function toggle(){if(!au.src||au.paused){if(!au.src||!au.currentSrc)play();else au.play().catch(()=>play())}else au.pause();setTimeout(ui,50)}
function surah(d){const c=st();c.s=((c.s-1+d+114)%114)+1;c.a=1;save();play()}
function stopSC(){const s=el&&el.querySelector('.scw');if(s){s.innerHTML='';s.hidden=true}el&&el.querySelectorAll('[data-sc]').forEach(b=>b.classList.remove('on'))}
function close(){try{au&&au.pause()}catch(e){}try{wl&&wl.release()}catch(e){}clearInterval(clk);if(el){el.remove();el=null}document.body.style.overflow='';removeEventListener('hashchange',onHash);
 try{['play','pause','nexttrack','previoustrack'].forEach(a=>navigator.mediaSession.setActionHandler(a,null))}catch(e){}}
function onHash(){if(location.hash!=='#car')close()}
ZF.m.car=()=>{if(!document.getElementById('zfcarcss')){const s=document.createElement('style');s.id='zfcarcss';s.textContent=css;document.head.appendChild(s)}
 if(el)close();try{const old=document.querySelector('.b4car');old&&old.remove()}catch(e){}
 au=au||new Audio();au.preload='auto';au.onended=()=>{const c=st();if(c.a<nA(c.s))c.a++;else{c.s=c.s%114+1;c.a=1}save();play()};au.onplay=au.onpause=ui;
 el=document.createElement('div');el.className='zfcar';el.setAttribute('role','dialog');el.setAttribute('aria-label','وضع السيارة');
 el.innerHTML=`<div class="tp"><button class="ex" id="cx">خروج</button><b id="cclk"></b></div>
 <div class="now"><div class="s"></div><div class="a"></div><div class="r"></div></div>
 <div class="ctl"><button id="cprev" aria-label="السورة السابقة">${zi('prev')}السابقة</button><button class="pp" id="cpp"></button><button id="cnext" aria-label="السورة التالية">${zi('next')}التالية</button></div>
 <div class="row2"><button data-sc="m">${zi('sunrise')}${SC.m[0]}</button><button data-sc="e">${zi('moon')}${SC.e[0]}</button><button id="crec">${zi('head')}تغيير القارئ</button></div>
 <div class="scw" hidden></div><div class="msg"></div>`;
 document.body.appendChild(el);document.body.style.overflow='hidden';addEventListener('hashchange',onHash);
 el.querySelector('#cx').onclick=()=>{close();if(location.hash==='#car')location.hash='home'};
 el.querySelector('#cpp').onclick=()=>{try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}toggle()};
 el.querySelector('#cnext').onclick=()=>surah(1);el.querySelector('#cprev').onclick=()=>surah(-1);
 el.querySelector('#crec').onclick=()=>{const l=recs(),i=l.findIndex(r=>r.id===rec().id),n=l[(i+1)%l.length];st().r=n.id;save();msg('القارئ: '+n.n);if(au&&!au.paused)play();else ui()};
 el.querySelectorAll('[data-sc]').forEach(b=>b.onclick=()=>{const k=b.dataset.sc,on=b.classList.contains('on');stopSC();if(on)return;try{au.pause()}catch(e){}b.classList.add('on');const s=el.querySelector('.scw');s.hidden=false;
  s.innerHTML=`<iframe allow="autoplay; encrypted-media" title="${SC[k][0]}" src="https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F${SC[k][1]}&auto_play=true&visual=false&show_artwork=false&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&hide_related=true&color=%23f2bd9b"></iframe>`;msg(SC[k][0]+' بصوت الشيخ مشاري العفاسي (من حسابه الرسمي)');ui()});
 try{navigator.mediaSession.setActionHandler('play',()=>toggle());navigator.mediaSession.setActionHandler('pause',()=>toggle());navigator.mediaSession.setActionHandler('nexttrack',()=>surah(1));navigator.mediaSession.setActionHandler('previoustrack',()=>surah(-1))}catch(e){}
 const tick=()=>{const c=el&&el.querySelector('#cclk');if(!c)return;const d=new Date(),h=d.getHours();c.textContent=ar((h%12||12)+':'+String(d.getMinutes()).padStart(2,'0'))+(h<12?' ص':' م')};tick();clk=setInterval(tick,15000);
 wake().then(w=>{wl=w;if(!w.ok)msg('')});ui()};
})();
