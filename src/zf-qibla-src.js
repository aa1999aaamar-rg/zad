/* زاد v4.4: القبلة بالكاميرا (AR) + compass. Lazy module, minified to site/zf-qibla.js */
(function(){'use strict';const {zi,ar,esc,back,wake}=ZF;
const css=`.zfq .dialw{position:relative;width:min(78vw,300px);aspect-ratio:1;margin:8px auto 4px}
.zfq .dial{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,var(--card) 58%,var(--z-soft) 59%,var(--card) 70%);border:1px solid var(--line);box-shadow:var(--shadow);transition:transform .25s ease-out}
.zfq .dial svg{position:absolute;inset:0;width:100%;height:100%}
.zfq .fix{position:absolute;left:50%;top:-6px;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:14px solid var(--z-clay)}
.zfq .ok .dial{box-shadow:0 0 0 4px color-mix(in srgb,#2f8a5b 40%,transparent),var(--shadow)}
.zfq .big{font-size:34px;font-weight:700;color:var(--accent);text-align:center;font-variant-numeric:tabular-nums}
.zfq .st{text-align:center;font-weight:600;min-height:24px;margin:6px 0}
.zfq .st.ok{color:#2f8a5b}
.zfq .cal{display:flex;gap:10px;align-items:center;background:var(--z-soft);border-radius:14px;padding:10px 12px;font-size:13px;color:var(--muted);margin-top:10px}
.zfq .cal svg{width:34px;height:20px;flex:none;color:var(--accent)}
.zfar{position:fixed;inset:0;z-index:90;background:#000;color:#fff;overflow:hidden;touch-action:none}
.zfar video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.zfar .shade{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.45),transparent 30%,transparent 62%,rgba(0,0,0,.7))}
.zfar .top{position:absolute;top:calc(12px + env(safe-area-inset-top));left:12px;right:12px;display:flex;justify-content:space-between;align-items:center}
.zfar .top b{font-size:17px}.zfar .zx{background:rgba(255,255,255,.16);border:0;color:#fff;border-radius:50%;width:44px;height:44px;display:grid;place-items:center}
.zfar .zx svg{width:22px;height:22px}
.zfar .cross{position:absolute;left:50%;top:44%;width:2px;height:64px;margin-left:-1px;transform:translateY(-50%);background:rgba(255,255,255,.75);border-radius:2px}
.zfar .tgt{position:absolute;top:44%;width:84px;height:84px;margin:-42px 0 0 -42px;display:grid;place-items:center;border-radius:22px;background:rgba(20,26,52,.55);border:2px solid #e8a37c;transition:left .12s linear;box-shadow:0 0 30px rgba(232,163,124,.5)}
.zfar .tgt svg{width:52px;height:52px;color:#f2bd9b}
.zfar.ok .tgt{border-color:#7ee2a8;background:rgba(30,90,60,.6);box-shadow:0 0 40px rgba(126,226,168,.8)}.zfar.ok .tgt svg{color:#bff3d2}
.zfar .arr{position:absolute;top:44%;width:64px;height:64px;margin-top:-32px;display:none;color:#f2bd9b}
.zfar .arr svg{width:64px;height:64px}
.zfar .bot{position:absolute;left:0;right:0;bottom:0;padding:16px 18px calc(18px + env(safe-area-inset-bottom));text-align:center}
.zfar .msg{font-size:22px;font-weight:700;margin-bottom:6px;text-shadow:0 1px 6px #000}
.zfar .sub{font-size:13px;opacity:.85;text-shadow:0 1px 4px #000}
.zfar .tape{position:relative;height:30px;margin:12px auto 0;max-width:340px;overflow:hidden;border-top:1px solid rgba(255,255,255,.35);font-size:12px;-webkit-mask:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent);mask:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent)}
.zfar .tape i{position:absolute;top:0;width:1px;height:8px;background:#fff;font-style:normal}
.zfar .tape span{position:absolute;top:10px;transform:translateX(-50%)}`;
let started=false,sm=null,lastOK=false,hdl=null,cam=null,wl=null,lastEv=0,accBad=false;
function headingOf(e,upright){
 if(e.webkitCompassHeading!=null&&!isNaN(e.webkitCompassHeading)){accBad=e.webkitCompassAccuracy!=null&&(e.webkitCompassAccuracy<0||e.webkitCompassAccuracy>25);return e.webkitCompassHeading}
 if(e.alpha==null)return null;if(!(e.absolute||e.type==='deviceorientationabsolute'))return null;
 if(upright&&e.beta!=null&&e.gamma!=null&&Math.abs(e.beta)>35){const d=Math.PI/180,a=e.alpha*d,b=e.beta*d,g=e.gamma*d,cA=Math.cos(a),sA=Math.sin(a),cB=Math.cos(b),sB=Math.sin(b),cG=Math.cos(g),sG=Math.sin(g);
  const east=-cA*sG-sA*sB*cG,north=-sA*sG+cA*sB*cG;if(Math.hypot(east,north)<.2)return(360-e.alpha)%360;return(Math.atan2(east,north)*180/Math.PI+360)%360}
 return(360-e.alpha)%360}
const adiff=(a,b)=>((a-b+540)%360)-180;
function smooth(h){if(sm==null){sm=h;return h}sm=(sm+adiff(h,sm)*.3+360)%360;return sm}
function listen(fn){unlisten();hdl=e=>{lastEv=Date.now();fn(e)};addEventListener('deviceorientationabsolute',hdl);addEventListener('deviceorientation',hdl)}
function unlisten(){if(hdl){removeEventListener('deviceorientationabsolute',hdl);removeEventListener('deviceorientation',hdl);hdl=null}}
const IOSQ=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
async function askPerm(){try{if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission){const r=await DeviceOrientationEvent.requestPermission();return r==='granted'||!IOSQ}}catch(e){return !IOSQ}return true}
function dialSVG(q){let t='';for(let i=0;i<72;i++){const a=i*5,l=i%18===0?14:i%2===0?8:4;t+=`<line x1="150" y1="${8}" x2="150" y2="${8+l}" stroke="currentColor" stroke-opacity="${i%18===0?.9:.35}" stroke-width="${i%18===0?2:1}" transform="rotate(${a} 150 150)"/>`}
 const N=[['ش',0],['شر',90],['ج',180],['غ',270]].map(([n,a])=>`<text x="150" y="44" text-anchor="middle" font-size="17" font-weight="700" fill="${a===0?'#c0693f':'currentColor'}" transform="rotate(${a} 150 150)">${n}</text>`).join('');
 return`<svg viewBox="0 0 300 300" style="color:var(--ink)">${t}${N}<g transform="rotate(${q} 150 150)"><path d="M150 58 L162 150 L150 142 L138 150Z" fill="#c0693f"/><g transform="translate(132 56) scale(1.5)" fill="none" stroke="#34457a" stroke-width="1.6" stroke-linejoin="round"><rect x="1" y="-14" width="22" height="18" rx="2" fill="#1d2545"/><path d="M1 -9h22" stroke="#e8a37c"/></g></g><circle cx="150" cy="150" r="6" fill="var(--accent)"/></svg>`}
function stop(){unlisten();started=false;sm=null;try{wl&&wl.release()}catch(e){}wl=null}
ZF.m.qibla=()=>{stop();const L=curLoc(),q=bearing(L.lat,L.lng),dist=Math.round(distKm(L.lat,L.lng));
 if(!document.getElementById('zfqcss')){const s=document.createElement('style');s.id='zfqcss';s.textContent=css;document.head.appendChild(s)}
 view.innerHTML=`${back('home','الرئيسية')}<h1 class="page">القبلة</h1><div class="zfq">
 <section class="zcard" id="qbox"><div class="dialw" id="qw"><div class="fix"></div><div class="dial" id="qd">${dialSVG(q)}</div></div>
 <div class="big">${ar(q.toFixed(1)).replace('.','٫')}°</div><div class="k" style="text-align:center">اتجاه القبلة من الشمال الجغرافي · ${esc(L.name||'')} · المسافة إلى الكعبة ≈ ${ar(dist.toLocaleString('en'))} كم</div>
 <div class="st" id="qst">اضغط «تشغيل البوصلة» ثم أمسك الجوال مسطّحًا</div>
 <div class="zchips" style="justify-content:center"><button class="btn" id="qgo">${zi('compass')} تشغيل البوصلة</button><button class="btn" id="qcam" style="background:var(--deep);color:#fff">${zi('camera')} القبلة بالكاميرا</button></div>
 <div class="cal"><svg viewBox="0 0 34 20"><path d="M17 10c-4-6-12-6-12 0s8 6 12 0 12-6 12 0-8 6-12 0z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg><span id="qcal">للمعايرة: حرّك الجوال بحركة رقم ٨ في الهواء، وابتعد عن المعادن والسيارة والمغناطيس.</span></div></section>
 <div class="zchips" style="justify-content:center"><button class="zchip" id="qloc">${zi('pin')}حدّد موقعي بدقة</button><a class="zchip" href="#mosques">${zi('mosque')}أقرب مسجد</a></div>
 <p class="znote">دقة السهم تعتمد على بوصلة جوالك. إذا لم يظهر اتجاه، استخدم الدرجة أعلاه مع بوصلة الجوال.</p></div>`;
 $('#qloc').onclick=()=>locate(()=>ZF.m.qibla());
 $('#qgo').onclick=async()=>{if(!(await askPerm())){$('#qst').textContent='لم يتم السماح بالبوصلة. الدرجة موضحة أعلاه.';return}compass(q)};
 $('#qcam').onclick=async()=>{const ok=await askPerm();camera(q,ok)}};
function compass(q){started=true;sm=null;let got=false;wake().then(w=>wl=w);
 listen(e=>{const h=headingOf(e,false);if(h==null)return;got=true;const s=smooth(h),d=$('#qd');if(!d){stop();return}d.style.transform=`rotate(${-s}deg)`;const df=adiff(q,s),ok=Math.abs(df)<5;
  $('#qst').textContent=ok?'أنت باتجاه القبلة':`استدر ${ar(Math.round(Math.abs(df)))}° ${df>0?'لليمين':'لليسار'}`;$('#qst').classList.toggle('ok',ok);$('#qw').classList.toggle('ok',ok);
  if(ok&&!lastOK){try{navigator.vibrate&&navigator.vibrate([90,50,90])}catch(x){}}lastOK=ok;const c=$('#qcal');if(c)c.style.color=accBad?'var(--z-clay)':''});
 $('#qst').textContent='جارٍ قراءة البوصلة…';setTimeout(()=>{if(!got&&$('#qst'))$('#qst').textContent='جهازك لا يعطي اتجاه البوصلة للمتصفح. استخدم الدرجة أعلاه.'},3000)}
async function camera(q,perm){const el=document.createElement('div');el.className='zfar';el.innerHTML=`<video playsinline muted autoplay></video><div class="shade"></div>
 <div class="top"><b>القبلة بالكاميرا</b><button class="zx" aria-label="إغلاق">${zi('x')}</button></div><div class="cross"></div>
 <div class="tgt" style="left:-200px">${zi('kaaba')}</div><div class="arr" id="ara"></div>
 <div class="bot"><div class="msg" id="arm">ارفع الجوال أمامك</div><div class="sub" id="ars">وجّه الكاميرا للأمام، والسهم يدلّك على الكعبة</div><div class="tape" id="art"></div></div>`;document.body.appendChild(el);
 const close=()=>{stop();try{cam&&cam.getTracks().forEach(t=>t.stop())}catch(e){}cam=null;el.remove();removeEventListener('hashchange',close)};el.querySelector('.zx').onclick=close;addEventListener('hashchange',close);
 wake().then(w=>wl=w);
 try{cam=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});const v=el.querySelector('video');v.srcObject=cam;await v.play().catch(()=>{})}
 catch(e){el.querySelector('video').remove();el.style.background='radial-gradient(circle at 50% 40%,#232b52,#0b0d16 70%)';el.querySelector('#ars').textContent='الكاميرا غير متاحة، السهم يعمل بالبوصلة فقط'}
 if(!perm){el.querySelector('#arm').textContent='لم يتم السماح بالبوصلة';return}
 const FOV=60,tg=el.querySelector('.tgt'),ara=el.querySelector('#ara'),tape=el.querySelector('#art');let got=false;started=true;sm=null;
 listen(e=>{const h=headingOf(e,true);if(h==null)return;got=true;const s=smooth(h),df=adiff(q,s),ok=Math.abs(df)<5;
  const W=el.clientWidth,x=W/2+df/FOV*W;if(Math.abs(df)<FOV/2+5){tg.style.display='grid';tg.style.left=x+'px';ara.style.display='none'}else{tg.style.display='none';ara.style.display='block';ara.style.left=df>0?(W-80)+'px':'16px';ara.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${df>0?90:-90}deg)"><path d="M12 3.5 19 20l-7-3.5L5 20z"/></svg>`}
  el.classList.toggle('ok',ok);el.querySelector('#arm').textContent=ok?'أنت باتجاه القبلة':`استدر ${ar(Math.round(Math.abs(df)))}° ${df>0?'يمينًا':'يسارًا'}`;
  el.querySelector('#ars').textContent=accBad?'البوصلة تحتاج معايرة: حرّك الجوال بحركة رقم ٨':'القبلة '+ar(q.toFixed(0))+'° · اتجاهك '+ar(Math.round(s))+'°';
  if(ok&&!lastOK){try{navigator.vibrate&&navigator.vibrate([90,50,90])}catch(x){}}lastOK=ok;
  let t='';const px=W>380?340:W*.9;for(let a=Math.floor((s-40)/10)*10;a<=s+40;a+=10){const xx=px/2+adiff(a,s)/40*(px/2);const n=((a%360)+360)%360;t+=`<i style="left:${xx}px"></i>${n%90===0?`<span style="left:${xx}px">${['ش','شر','ج','غ'][n/90]}</span>`:n%30===0?`<span style="left:${xx}px;opacity:.7">${ar(n)}</span>`:''}`}
  const qx=px/2+adiff(q,s)/40*(px/2);if(Math.abs(adiff(q,s))<40)t+=`<span style="left:${qx}px;top:2px;color:#f2bd9b;font-weight:700">▼</span>`;tape.innerHTML=t});
 setTimeout(()=>{if(!got&&document.body.contains(el)){el.querySelector('#arm').textContent='البوصلة غير متاحة في هذا المتصفح';el.querySelector('#ars').textContent='اتجاه القبلة '+ar(q.toFixed(1)).replace('.','٫')+'° من الشمال'}},3500)}
})();
