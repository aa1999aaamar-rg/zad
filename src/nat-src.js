/* v4.0.1: native feel on iPhone home-screen (standalone) + edge swipe-back + Safari install hint */
(function(){'use strict';
var d=document,de=d.documentElement,ua=navigator.userAgent||'';
var IOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var SA=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
if(IOS)de.classList.add('zios');if(SA)de.classList.add('zsa');
var css=`
html{-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}
a,button,input,select,label,summary,.chip,.zchip,.tile,.zli,.zcard{touch-action:manipulation}
header.top,nav.tabs,button,.chip,.zchip,.tile,.zli,.zcard,.iconbtn,.mbar,.pbpno,.sheetc .btn,.pill{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.qtext,.mpage,.pbpg,.ztxt,.zverse,.zhad,.bkbody,.bktext,article,p,textarea,input{-webkit-user-select:text;user-select:text;-webkit-touch-callout:default}
html.zsa,html.zsa body{overscroll-behavior:none}
html.zsa body::before{content:"";position:fixed;top:0;left:0;right:0;height:env(safe-area-inset-top);background:#34457a;z-index:2147483000;pointer-events:none}
html.zsa[data-theme=dark] body::before{background:#0d0f15}
html.zsa.mfull body::before{background:transparent}
@keyframes zpgin{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
@keyframes zpgback{from{opacity:.4;transform:translateX(26px)}to{opacity:1;transform:none}}
#view.zpg{animation:zpgin .2s ease-out}#view.zpgb{animation:zpgback .22s ease-out}
html.mfull #view.zpg,html.mfull #view.zpgb{animation:none}
@media (prefers-reduced-motion:reduce){#view.zpg,#view.zpgb{animation:none}}
#zswipe{position:fixed;top:0;bottom:0;right:0;width:36px;pointer-events:none;z-index:2147483001;opacity:0;background:linear-gradient(to left,rgba(52,69,122,.22),transparent);transition:opacity .15s}
#zswipe i{position:absolute;top:50%;right:8px;width:34px;height:34px;margin-top:-17px;border-radius:50%;background:#34457a;color:#fff;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.25)}
#zswipe i svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2.2}
#zihint{position:fixed;left:12px;right:12px;bottom:calc(var(--tab-h,64px) + 26px + env(safe-area-inset-bottom));z-index:60;max-width:520px;margin:0 auto;background:#34457a;color:#fff;border-radius:18px;padding:12px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 14px 34px -10px rgba(20,24,40,.55);font-size:13.5px;line-height:1.6;animation:zpgin .25s ease-out}
html.mfull #zihint{display:none}
#zihint b{display:block;font-size:14.5px}#zihint a{color:#ffd9c4;font-weight:700}
#zihint .sh{flex:none;width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.14);display:grid;place-items:center}
#zihint .sh svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:1.9}
#zihint .x{flex:none;background:rgba(255,255,255,.14);border:0;color:#fff;width:30px;height:30px;border-radius:50%;font-size:18px;line-height:30px;padding:0}
`;
var st=d.createElement('style');st.id='znat';st.textContent=css;d.head.appendChild(st);

/* page transitions + in-app history depth */
var depth=0,goingBack=false,lastH=location.hash;
window.addEventListener('hashchange',function(){
 var v=d.getElementById('view');if(goingBack){depth=Math.max(0,depth-1)}else{depth++}
 if(v&&!de.classList.contains('mfull')){v.classList.remove('zpg','zpgb');void v.offsetWidth;v.classList.add(goingBack?'zpgb':'zpg')}
 goingBack=false;lastH=location.hash});
window.addEventListener('popstate',function(){});

/* edge swipe-back: from the RIGHT edge (RTL), moving left */
var EDGE=20,TH=70,sx=0,sy=0,act=false,cue=null,mv=0;
function blocked(t){if(de.classList.contains('mfull'))return true;
 for(var n=t;n&&n!==d.body;n=n.parentNode){if(!n.classList)continue;
  if(n.classList.contains('mpager')||n.classList.contains('pbpager')||n.classList.contains('mslide')||n.classList.contains('mfs')||n.hasAttribute&&n.hasAttribute('data-noswipe'))return true;
  if(n.id==='zihint'||(n.classList.contains('sheet')&&n.classList.contains('on')))return true}
 return false}
function home(){var h=(location.hash||'#home').slice(1).split('/')[0];return!h||h==='home'}
function cueEl(){if(!cue){cue=d.createElement('div');cue.id='zswipe';cue.innerHTML='<i><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></i>';d.body.appendChild(cue)}return cue}
function goBack(){goingBack=true;if(depth>0&&history.length>1)history.back();else{location.hash='home'}}
window.zSwipeBack=goBack;
function on(){return IOS||localStorage.getItem('zad.swipe')==='1'}
d.addEventListener('touchstart',function(e){act=false;if(!on()||e.touches.length!==1)return;var t=e.touches[0],w=window.innerWidth;
 if(t.clientX<w-EDGE)return;if(home()||blocked(e.target))return;act=true;sx=t.clientX;sy=t.clientY;mv=0},{passive:true});
d.addEventListener('touchmove',function(e){if(!act)return;var t=e.touches[0],dx=sx-t.clientX,dy=Math.abs(t.clientY-sy);
 if(dy>40&&dy>dx){act=false;if(cue)cue.style.opacity=0;return}
 mv=dx;var c=cueEl();c.style.opacity=Math.min(1,dx/TH);var v=d.getElementById('view');if(v&&dx>0)v.style.transform='translateX('+(-Math.min(dx,120)*.35)+'px)'},{passive:true});
d.addEventListener('touchend',function(){if(!act)return;act=false;var v=d.getElementById('view');if(v)v.style.transform='';if(cue)cue.style.opacity=0;if(mv>=TH)goBack()},{passive:true});
d.addEventListener('touchcancel',function(){act=false;var v=d.getElementById('view');if(v)v.style.transform='';if(cue)cue.style.opacity=0},{passive:true});

/* iPhone Safari (not installed): a small dismissible hint pointing at Share */
function hint(){try{if(!IOS||SA||/CriOS|FxiOS|EdgiOS/.test(ua))return;var k='zad.ihint',t=+localStorage.getItem(k)||0;if(Date.now()-t<12096e5)return;
 if(d.getElementById('zihint'))return;if(/welcome/.test(location.hash)||d.querySelector('.welcome,#welcome,.onb')){setTimeout(hint,8000);return}var h=d.createElement('div');h.id='zihint';h.setAttribute('role','note');
 h.innerHTML='<span class="sh"><svg viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" stroke-linecap="round"/></svg></span><span style="flex:1"><b>ثبّت زاد على شاشتك</b>اضغط «مشاركة» بالأسفل ثم «إضافة إلى الشاشة الرئيسية» · <a href="/install">الشرح</a></span><button class="x" aria-label="إغلاق">×</button>';
 h.querySelector('.x').onclick=function(){localStorage.setItem(k,Date.now());h.remove()};d.body.appendChild(h)}catch(e){}}
setTimeout(hint,4000);
})();
