/* زاد v4.4: زاوية الأطفال — short surahs verse by verse with audio repeat, stars, an order-the-verses quiz. Local only. Lazy module, minified to site/zf-kids.js */
(function(){'use strict';const {zi,ar,esc,back,F}=ZF;
const K=F.kd=Object.assign({st:{},q:{},rep:3,r:'husarym'},F.kd||{});
const SUR=[1].concat(Array.from({length:22},(_,i)=>114-i)); // الفاتحة، ثم الناس ← الضحى
try{if(!K.mig){Object.keys((S.b2&&S.b2.stars)||{}).forEach(s=>{if(SUR.includes(+s)&&!K.st[s])K.st[s]=1});K.mig=1;save()}}catch(e){}
const RC=[['husarym','Husary_Muallim_128kbps','الحصري (المعلّم)'],['maher','MaherAlMuaiqly128kbps','ماهر المعيقلي']];
const rc=()=>RC.find(r=>r[0]===K.r)||RC[0];
const name=s=>QDATA.ch[s-1][1],cnt=s=>QDATA.ch[s-1][2];
const url=(s,a)=>'https://everyayah.com/data/'+rc()[1]+'/'+String(s).padStart(3,'0')+String(a).padStart(3,'0')+'.mp3';
const COLS=['#c0693f','#34457a','#4f5e2f','#6a3f6e','#2f4f5f','#9a6a1f','#7a3343'];
function sticker(s,n){const c=COLS[s%COLS.length];if(!n)return`<svg viewBox="0 0 60 60"><polygon points="30,4 37,22 56,23 41,35 46,54 30,43 14,54 19,35 4,23 23,22" fill="none" stroke="var(--line)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;
 return`<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="${c}" opacity=".14"/><polygon points="30,4 37,22 56,23 41,35 46,54 30,43 14,54 19,35 4,23 23,22" fill="${c}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>${n>1?`<path d="M30 20a9 9 0 1 0 8 13 7 7 0 1 1-8-13z" fill="#fff" opacity=".9"/>`:'<circle cx="30" cy="30" r="5" fill="#fff" opacity=".9"/>'}</svg>`}
const css=`.zfkd .g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.zfkd .s{border:1px solid var(--line);background:var(--card);border-radius:18px;padding:10px 4px;text-align:center;text-decoration:none;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:4px}.zfkd .s svg{width:42px;height:42px}.zfkd .s b{font-size:15px}.zfkd .s small{font-size:11px;color:var(--muted)}
.zfkd .hero{display:flex;gap:12px;align-items:center;background:linear-gradient(135deg,#34457a,#1d2545);color:#fff;border:0}.zfkd .hero svg{width:56px;height:56px;flex:none}.zfkd .hero b{font-size:20px}.zfkd .hero .k{color:rgba(255,255,255,.75)}
.zfkd .v{font-family:"Amiri Quran",Amiri,serif;font-size:27px;line-height:2.1;text-align:center;padding:10px 12px;border-radius:16px;cursor:pointer;margin:6px 0;border:1px solid transparent}.zfkd .v.on{background:var(--z-soft);border-color:color-mix(in srgb,var(--accent) 35%,transparent)}.zfkd .v i{font-style:normal;font-size:17px;color:var(--accent);font-family:Zad,sans-serif}
.zfkd .kbar{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;position:sticky;bottom:calc(var(--tab-h,66px) + 10px);z-index:3;background:var(--z-glass);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:8px;border-radius:18px;border:1px solid var(--line)}
.zfkd .qz button{display:block;width:100%;text-align:center;font-family:"Amiri Quran",Amiri,serif;font-size:21px;line-height:1.9;padding:10px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);margin:6px 0;cursor:pointer}.zfkd .qz button.ok{background:color-mix(in srgb,#2f8a5b 15%,var(--card));border-color:#2f8a5b;opacity:.65}.zfkd .qz button.bad{animation:zfsh .35s}@keyframes zfsh{25%{transform:translateX(6px)}75%{transform:translateX(-6px)}}
.zfkd .big{display:flex;justify-content:center}.zfkd .big svg{width:110px;height:110px;animation:zfpop .6s ease-out}@keyframes zfpop{0%{transform:scale(.3) rotate(-40deg);opacity:0}70%{transform:scale(1.1)}100%{transform:none}}`;
let au=null,qq=null;
function stopA(){try{au&&au.pause()}catch(e){}qq=null}
async function verses(s){const k='zad.kv'+s;try{const c=JSON.parse(localStorage.getItem(k)||'null');if(c&&c.length)return c}catch(e){}
 const j=await fetch(QAPI+'/verses/by_chapter/'+s+'?words=false&fields=text_uthmani&per_page=50').then(r=>r.json());const v=j.verses.map(x=>({a:x.verse_number,t:x.text_uthmani}));try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}return v}
function stars(){return Object.values(K.st).reduce((a,b)=>a+b,0)+Object.keys(K.q).length}
ZF.m.kids=async a=>{if(!document.getElementById('zfkdcss')){const st=document.createElement('style');st.id='zfkdcss';st.textContent=css;document.head.appendChild(st)}stopA();
 const s=+a;if(!s||!SUR.includes(s)){const done=SUR.filter(x=>K.st[x]).length;
  view.innerHTML=`${back('services','المزيد')}<h1 class="page">زاوية الأطفال</h1><div class="zfkd"><section class="zcard hero">${sticker(3,2)}<div><b>نجومي: ${ar(stars())}</b><div class="k">حفظت ${ar(done)} من ${ar(SUR.length)} سورة</div></div></section>
  <div class="g">${SUR.map(x=>`<a class="s" href="#kids/${x}">${sticker(x,(K.st[x]?1:0)+(K.q[x]?1:0))}<b>${name(x)}</b><small>${ar(cnt(x))} آيات</small></a>`).join('')}</div>
  <p class="znote">التلاوة آية آية بصوت ${rc()[2]} من everyayah.com، والآيات بالرسم العثماني من api.quran.com. كل شيء محفوظ على جهازك فقط.</p></div>`;return}
 view.innerHTML=`${back('kids','زاوية الأطفال')}<h1 class="page" style="text-align:center">سورة ${name(s)}</h1><div class="zfkd" id="kv"><div style="display:grid;place-items:center;min-height:30vh"><div class="spin"></div></div></div>`;
 let V2=[];try{V2=await verses(s)}catch(e){$('#kv').innerHTML='<section class="zcard"><p class="znote">تعذّر تحميل الآيات، تأكد من الاتصال.</p></section>';return}
 if(location.hash!=='#kids/'+s)return;
 const lv=K.st[s]?1:0;
 $('#kv').innerHTML=`<section class="zcard">${V2.map(v=>`<div class="v" data-a="${v.a}">${v.t} <i>﴿${ar(v.a)}﴾</i></div>`).join('')}</section>
 <div class="kbar"><button class="btn" id="kp">${zi('play')} استمع وكرّر</button><select id="krep" aria-label="عدد التكرار">${[1,3,5].map(n=>`<option value="${n}" ${K.rep==n?'selected':''}>كل آية ×${ar(n)}</option>`).join('')}</select><select id="krc" aria-label="القارئ">${RC.map(r=>`<option value="${r[0]}" ${r[0]===rc()[0]?'selected':''}>${r[2]}</option>`).join('')}</select></div>
 <section class="zcard" id="kend"><div class="zchips" style="justify-content:center"><button class="btn" id="kst" style="${lv?'background:#2f8a5b':''}">${zi('star')} ${lv?'حفظتها! نجمة':'حفظت السورة'}</button>${V2.length>=3?`<button class="btn ghost" id="kq">${zi('list')} اختبار الترتيب</button>`:''}</div><div id="kqz"></div></section>`;
 au=au||new Audio();let playing=false;
 const mark=a=>view.querySelectorAll('.v').forEach(x=>x.classList.toggle('on',+x.dataset.a===a));
 const playFrom=(i,once)=>{const rep=once?1:+K.rep||1;let n=0;qq={i,rep};const go=()=>{if(!qq)return;const v=V2[qq.i];if(!v){playing=false;mark(0);$('#kp')&&($('#kp').innerHTML=zi('play')+' استمع وكرّر');return}mark(v.a);const el=view.querySelector(`.v[data-a="${v.a}"]`);el&&el.scrollIntoView({block:'center',behavior:'smooth'});au.src=url(s,v.a);au.play().catch(()=>{toast('تعذّر تشغيل الصوت');stopA()});au.onended=()=>{n++;if(n<qq.rep)au.play().catch(()=>{});else{n=0;if(once){stopA();mark(0);return}qq.i++;go()}}};playing=true;$('#kp').innerHTML=zi('pause')+' إيقاف';go()};
 $('#kp').onclick=()=>{if(playing&&qq){stopA();playing=false;$('#kp').innerHTML=zi('play')+' استمع وكرّر';mark(0);return}playFrom(0)};
 view.querySelectorAll('.v').forEach(el=>el.onclick=()=>{stopA();playing=false;$('#kp').innerHTML=zi('play')+' استمع وكرّر';const i=V2.findIndex(v=>v.a===+el.dataset.a);playFrom(i,true)});
 $('#krep').onchange=e=>{K.rep=+e.target.value;save()};$('#krc').onchange=e=>{K.r=e.target.value;save();toast('القارئ: '+rc()[2])};
 $('#kst').onclick=()=>{if(!K.st[s]){K.st[s]=1;save();celebrate('أحسنت! نجمة لسورة '+name(s));try{navigator.vibrate&&navigator.vibrate([30,60,30])}catch(e){}}ZF.m.kids(String(s))};
 const kq=$('#kq');if(kq)kq.onclick=()=>quiz(s,V2)};
function celebrate(t){const el=document.createElement('div');el.className='zkh';el.style.cursor='pointer';el.innerHTML=`<div class="zfkd"><div class="big">${sticker(Math.floor(Math.random()*7),2)}</div></div><div class="dz" style="font-family:Zad,sans-serif;font-size:24px">${esc(t)}</div><div class="tm">اضغط للمتابعة</div>`;el.onclick=()=>el.remove();document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
function quiz(s,V2){stopA();const n=Math.min(5,V2.length),st=Math.floor(Math.random()*(V2.length-n+1)),pick=V2.slice(st,st+n),sh=pick.map((v,i)=>({v,i})).sort(()=>Math.random()-.5);let next=0,miss=0;
 const box=$('#kqz');box.innerHTML=`<div class="qz"><p class="znote" style="text-align:center">رتّب الآيات: اضغط على الآية ﴿${ar(pick[0].a)}﴾ أولًا ثم التي بعدها</p>${sh.map(x=>`<button data-i="${x.i}">${x.v.t}</button>`).join('')}</div>`;box.scrollIntoView({behavior:'smooth',block:'start'});
 box.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{if(b.classList.contains('ok'))return;if(+b.dataset.i===next){b.classList.add('ok');b.insertAdjacentHTML('afterbegin',`<small style="font-family:Zad;font-size:13px;color:#2f8a5b">﴿${ar(pick[next].a)}﴾ </small>`);next++;
  if(next===n){const first=!K.q[s];K.q[s]=1;save();celebrate(miss===0?'ممتاز! رتّبتها بدون أخطاء':'أحسنت! أكملت الترتيب');setTimeout(()=>ZF.m.kids(String(s)),first?2700:1800)}}else{miss++;b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}}})}
addEventListener('hashchange',()=>{if(location.hash.indexOf('#kids')!==0)stopA()});
})();
