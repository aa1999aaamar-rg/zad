/* زاد v4.4: أقرب مسجد via OpenStreetMap Overpass (free). Lazy module, minified to site/zf-mosq.js */
(function(){'use strict';const {zi,ar,esc,back}=ZF;
const EP=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter'];
const DIRS=['الشمال','الشمال الشرقي','الشرق','الجنوب الشرقي','الجنوب','الجنوب الغربي','الغرب','الشمال الغربي'];
const rad=x=>x*Math.PI/180;
function dist(a,b,c,d){const R=6371e3,p1=rad(a),p2=rad(c),dp=rad(c-a),dl=rad(d-b),h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function brg(a,b,c,d){const y=Math.sin(rad(d-b))*Math.cos(rad(c)),x=Math.cos(rad(a))*Math.sin(rad(c))-Math.sin(rad(a))*Math.cos(rad(c))*Math.cos(rad(d-b));return(Math.atan2(y,x)*180/Math.PI+360)%360}
const fmtD=m=>m<1000?ar(Math.round(m/10)*10)+' م':ar((m/1000).toFixed(m<10000?1:0)).replace('.','٫')+' كم';
async function fetchT(url,body,ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{method:'POST',body:'data='+encodeURIComponent(body),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:c.signal});if(!r.ok)throw new Error('http '+r.status);return await r.json()}finally{clearTimeout(t)}}
let dead=new Set();
async function overpass(lat,lng,radius,onTry){const q=`[out:json][timeout:15];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng}););out center tags 80;`;
 let last=null;for(let i=0;i<2;i++){if(dead.has(i))continue;try{onTry&&onTry(i);return await fetchT(EP[i],q,9000)}catch(e){last=e;dead.add(i)}}throw last||new Error('overpass')}
async function photon(lat,lng){const out=new Map();for(const d of [.03,.08]){const bb=[lng-d,lat-d,lng+d,lat+d].join(',');
 const rs=await Promise.all(['مسجد','جامع','mosque'].map(w=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),9000);return fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(w)}&lat=${lat}&lon=${lng}&limit=50&osm_tag=amenity:place_of_worship&bbox=${bb}`,{signal:c.signal}).then(r=>r.json()).catch(()=>null).finally(()=>clearTimeout(t))}));
 if(rs.every(r=>!r))throw new Error('photon');
 rs.forEach(r=>(r&&r.features||[]).forEach(f=>{const p=f.properties||{},k=(p.osm_type||'')+(p.osm_id||'');if(p.religion&&p.religion!=='muslim')return;out.set(k,{lat:f.geometry.coordinates[1],lon:f.geometry.coordinates[0],type:p.osm_type,tags:{name:p.name||''}})}));
 if(out.size>=5)break}return{elements:[...out.values()]}}
function parse(j,lat,lng){const out=[],seen=new Set();for(const e of (j.elements||[])){const la=e.lat!=null?e.lat:e.center&&e.center.lat,lo=e.lon!=null?e.lon:e.center&&e.center.lon;if(la==null)continue;const t=e.tags||{};
 const name=t['name:ar']||t.name||t['name:en']||'';const key=(name||'')+la.toFixed(4)+lo.toFixed(4);if(seen.has(key))continue;seen.add(key);
 const d=dist(lat,lng,la,lo);out.push({n:name,la,lo,d,b:brg(lat,lng,la,lo),fr:/جامع|jami|masjid jami/i.test(name)||t.building==='mosque'&&/جامع/.test(name),k:t['building']==='mosque'||/مسجد|جامع|mosque|masjid/i.test(name)?1:0,ty:e.type})}
 return out.sort((a,b)=>a.d-b.d)}
const KEY=(la,lo)=>'zad.mq.'+la.toFixed(2)+','+lo.toFixed(2);
function cached(la,lo){try{const c=JSON.parse(localStorage.getItem(KEY(la,lo))||'null');if(c&&Date.now()-c.at<7*864e5)return c}catch(e){}return null}
function store(la,lo,list,r){try{localStorage.setItem(KEY(la,lo),JSON.stringify({at:Date.now(),r,list:list.slice(0,60)}));const ks=Object.keys(localStorage).filter(k=>k.indexOf('zad.mq.')===0);if(ks.length>8)ks.slice(0,ks.length-8).forEach(k=>localStorage.removeItem(k))}catch(e){}}
const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1),AND=/Android/i.test(navigator.userAgent);
const mapsUrl=(m)=>IOS?`https://maps.apple.com/?daddr=${m.la},${m.lo}&dirflg=w`:AND?`geo:${m.la},${m.lo}?q=${m.la},${m.lo}(${encodeURIComponent(m.n||'مسجد')})`:`https://www.google.com/maps/dir/?api=1&destination=${m.la},${m.lo}&travelmode=walking`;
const gUrl=m=>`https://www.google.com/maps/dir/?api=1&destination=${m.la},${m.lo}&travelmode=walking`;
const css=`.zfm .it{display:flex;gap:12px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}.zfm .it:first-child{border-top:0}.zfm .ar{width:44px;height:44px;flex:none;border-radius:14px;background:var(--z-soft);color:var(--accent);display:grid;place-items:center}.zfm .ar svg{width:22px;height:22px;transition:transform .2s}.zfm .it b{display:block;font-size:15px}.zfm .it small{color:var(--muted);font-size:12.5px}.zfm .go{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.zfm .go a{font-size:12.5px;padding:6px 10px;border-radius:10px;background:var(--z-soft);color:var(--accent);text-decoration:none;display:inline-flex;gap:4px;align-items:center}.zfm .go a svg{width:14px;height:14px}.zfm .st{font-size:13px;color:var(--muted);text-align:center;padding:16px 0}`;
let HEAD=null,hh=null;
ZF.m.mosques=async()=>{if(!document.getElementById('zfmcss')){const s=document.createElement('style');s.id='zfmcss';s.textContent=css;document.head.appendChild(s)}
 const L=curLoc(),gps=!!S.loc;
 view.innerHTML=`${back('services','المزيد')}<h1 class="page">أقرب مسجد</h1><div class="zfm"><section class="zcard"><div class="zrow" style="justify-content:space-between"><h3>${zi('mosque')}المساجد القريبة</h3><button class="zchip" id="mloc">${zi('pin')}${gps?'تحديث موقعي':'استخدم موقعي'}</button></div>
 <div class="k">${gps?'حسب موقعك الحالي':'حسب مدينتك المختارة: '+esc(L.name||'')+' — للدقة اضغط «استخدم موقعي»'}</div><div id="mlist"><div class="st"><div class="spin"></div>جاري البحث في خريطة OpenStreetMap…</div></div></section>
 ${IOS?`<button class="zchip" id="mcmp">${zi('compass')}اجعل الأسهم تتبع البوصلة</button>`:''}<p class="znote">البيانات من OpenStreetMap (مجانية ويحرّرها متطوعون)، فقد لا يظهر كل مسجد. المسافة خط مستقيم، والأسهم تدور مع اتجاه جوالك إذا كانت البوصلة متاحة.</p></div>`;
 const cb=$('#mcmp');if(cb)cb.onclick=async()=>{try{if(DeviceOrientationEvent.requestPermission)await DeviceOrientationEvent.requestPermission()}catch(e){}cb.remove()};
 $('#mloc').onclick=()=>locate(()=>ZF.m.mosques());
 const draw=(list,src)=>{const el=$('#mlist');if(!el)return;if(!list.length){el.innerHTML=`<div class="st">لم نجد مساجد مسجّلة في الخريطة قريبة منك. جرّب «استخدم موقعي».</div>`;return}
  el.innerHTML=list.slice(0,25).map(m=>`<div class="it"><span class="ar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" data-b="${m.b.toFixed(0)}" style="transform:rotate(${m.b}deg)"><path d="M12 3.5 19 20l-7-3.5L5 20z"/></svg></span><div class="grow"><b>${esc(m.n||'مسجد')}</b><small>${fmtD(m.d)} · باتجاه ${DIRS[Math.round(m.b/45)%8]}</small>
  <div class="go"><a href="${esc(mapsUrl(m))}" target="_blank" rel="noopener">${zi('nav')}افتح بالخرائط</a>${IOS||AND?`<a href="${esc(gUrl(m))}" target="_blank" rel="noopener">${zi('ext')}Google</a>`:''}</div></div></div>`).join('')+(src?`<div class="k" style="text-align:center;margin-top:6px">${src}</div>`:'')};
 const c=cached(L.lat,L.lng);if(c){draw(c.list,'محفوظة من آخر بحث · '+new Date(c.at).toLocaleDateString('ar'))}
 try{let r=1500,list=[],src='OpenStreetMap';const msg=t=>{const s=$('#mlist .st');if(s)s.lastChild.textContent=t};
  try{for(const rr of [1500,4000,10000]){r=rr;const j=await overpass(L.lat,L.lng,rr,i=>{if(i>0)msg('الخادم الأول بطيء، نجرب خادمًا آخر…')});list=parse(j,L.lat,L.lng);if(list.length>=5)break}src='ضمن '+fmtD(r)+' · OpenStreetMap'}
  catch(e){if(list.length<1){msg('خوادم الخريطة بطيئة، نجرّب طريقة بحث أخرى…');const j=await photon(L.lat,L.lng);list=parse(j,L.lat,L.lng).filter(m=>m.d<15000);r=8000;src='OpenStreetMap (بحث بالاسم، قد تنقص المساجد بلا اسم)'}}
  store(L.lat,L.lng,list,r);if(location.hash.slice(1)==='mosques')draw(list,src)}
 catch(e){if(!c&&$('#mlist'))$('#mlist').innerHTML=`<div class="st">خوادم الخريطة مشغولة الآن. حاول بعد قليل.<br><button class="btn sm" style="margin-top:10px" onclick="ZF.m.mosques()">إعادة المحاولة</button></div>`}
 if(hh){removeEventListener('deviceorientationabsolute',hh);removeEventListener('deviceorientation',hh)}
 hh=e=>{const h=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.absolute||e.type==='deviceorientationabsolute')&&e.alpha!=null?360-e.alpha:null;if(h==null)return;const svgs=view.querySelectorAll('.zfm [data-b]');if(!svgs.length){removeEventListener('deviceorientationabsolute',hh);removeEventListener('deviceorientation',hh);return}svgs.forEach(s=>s.style.transform=`rotate(${+s.dataset.b-h}deg)`)};
 addEventListener('deviceorientationabsolute',hh);addEventListener('deviceorientation',hh)};
ZF.mosq={overpass,parse};
})();
