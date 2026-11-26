/* زاد v4.4: ختمة جماعية (server: /api/khatma/*, D1). Lazy module, minified to site/zf-khat.js */
(function(){'use strict';const {zi,ar,esc,back,F,dev,track}=ZF;
const css=`.zfk .kr{display:grid;grid-template-columns:132px minmax(0,1fr);gap:16px;align-items:center}.zfk .kr svg{width:132px;height:132px;flex:none}
.zfk .lg{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--muted);margin-top:8px}.zfk .lg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-left:4px;vertical-align:-1px}
.zfk .grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
.zfk .j{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:8px 2px 7px;text-align:center;font:inherit;color:var(--ink);cursor:pointer;min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.zfk .j b{font-size:17px;line-height:1}.zfk .j small{font-size:10.5px;color:var(--muted);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 3px}
.zfk .j.c{background:color-mix(in srgb,var(--z-clay) 13%,var(--card));border-color:color-mix(in srgb,var(--z-clay) 40%,var(--line))}
.zfk .j.d{background:color-mix(in srgb,var(--accent) 16%,var(--card));border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}
.zfk .j.me{outline:2px solid var(--accent);outline-offset:1px}.zfk .j.d small{color:var(--accent)}
.zfk .j svg{width:13px;height:13px}.zfk .tt{font-size:20px;font-weight:700;margin:0}.zfk .dl{font-size:13px;color:var(--muted)}
.zfk input[type=text],.zfk input[type=date]{width:100%;margin:6px 0 10px;box-sizing:border-box}
.zfsh{position:fixed;inset:0;z-index:95;background:rgba(10,12,20,.45);display:flex;align-items:flex-end}.zfsh>div{background:var(--card);width:100%;border-radius:22px 22px 0 0;padding:18px 18px calc(18px + env(safe-area-inset-bottom));box-sizing:border-box}
.zfsh .btn{width:100%;margin-top:8px}
.zfk .grid.g60{grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}.zfk .grid.g60 .j{min-height:56px}.zfk .grid.g60 .j b{font-size:15px}
.zfk .kseg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:4px 0 6px}.zfk .kseg button{font:inherit;font-size:13px;font-weight:700;padding:10px 4px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.zfk .kseg button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.zfk .dec{text-align:center;padding:6px 0 2px}.zfk .dec .nm{font-size:21px;font-weight:700;margin:4px 0}.zfk .dec .du{color:var(--muted);font-size:14px;line-height:1.9}
.zfk .fin{text-align:center;background:linear-gradient(160deg,var(--z-soft),var(--card));border:1px solid var(--line)}.zfk .fin .big{font-size:22px;font-weight:700;margin:6px 0}.zfk .fin .hd{font-family:Amiri,serif;font-size:19px;line-height:2.1;margin:10px 0}.zfk .fin .src{font-size:12px;color:var(--muted)}
.zfk .brd{display:flex;flex-direction:column;gap:6px}.zfk .brd div{display:grid;grid-template-columns:28px 1fr auto;gap:8px;align-items:center;padding:8px 10px;border-radius:12px;background:var(--bg-2)}.zfk .brd b{font-size:14px}.zfk .brd i{font-style:normal;font-weight:700;color:var(--accent)}.zfk .brd span{font-size:12px;color:var(--muted);text-align:center}
.zfk .rep{background:none;border:0;color:var(--muted);font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer;margin-top:8px}
.zfk .kind{display:inline-block;font-size:11.5px;font-weight:700;padding:2px 8px;border-radius:99px;background:var(--z-soft);color:var(--accent);margin-bottom:4px}`;
/* v4.6: one engine for three kinds: g = ختمة جماعية (as before) · d = ختمة لروح فقيد · o = ختمة جهة (شركة/مدرسة/مسجد) with a board; 30 juz' or 60 ahzab; «إبلاغ»; live refresh every 8 s */
const DUA_D={t:"اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الأَبْيَضَ مِنَ الدَّنَسِ وَأَبْدِلْهُ دَارًا خَيْرًا مِنْ دَارِهِ وَأَهْلاً خَيْرًا مِنْ أَهْلِهِ وَزَوْجًا خَيْرًا مِنْ زَوْجِهِ وَأَدْخِلْهُ الْجَنَّةَ وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ أَوْ مِنْ عَذَابِ النَّارِ",ref:'صحيح مسلم ٩٦٣',u:'https://sunnah.com/muslim:963a',w:'من دعاء النبي ﷺ في صلاة الجنازة'};
const ORG={company:'شركة',school:'مدرسة',mosque:'مسجد',family:'عائلة',other:'جهة'};
const api=(p,b)=>fetch('/api/khatma/'+p,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({dev:dev()},b||{}))}).then(r=>r.json().catch(()=>({ok:false})));
const get=id=>fetch('/api/khatma/get?id='+id+'&dev='+dev()+'&t='+Date.now(),{cache:'no-store'}).then(r=>r.json().catch(()=>({ok:false})));
const mine=()=>F.kl=Array.isArray(F.kl)?F.kl:[];
function remember(k){const l=mine().filter(x=>x.id!==k.id);l.unshift({id:k.id,t:k.title,kd:k.kind||'g',at:Date.now()});F.kl=l.slice(0,20);save()}
function addCss(){if(!document.getElementById('zfkcss')){const s=document.createElement('style');s.id='zfkcss';s.textContent=css;document.head.appendChild(s)}}
function sheet(html){const el=document.createElement('div');el.className='zfsh';el.innerHTML=`<div>${html}<button class="btn ghost" data-x>إغلاق</button></div>`;el.onclick=e=>{if(e.target===el||e.target.hasAttribute('data-x'))el.remove()};document.body.appendChild(el);return el}
const rawLink=id=>(window.ZAD_URL||location.origin+location.pathname.replace(/index\.html$/,''))+'#khatma/'+id;
const link=id=>{const u=rawLink(id);try{return window.ZS&&ZS.refUrl?ZS.refUrl(u):u}catch(e){return u}};
const KT=k=>k.kind==='d'?'ختمة لروح '+k.title:k.title;
const UN=k=>k.unit===60?'حزب':'جزء';
function shareText(k){const u=k.unit===60?'حزبًا':'جزءًا';return k.kind==='d'?`ختمة قرآن لروح ${k.title}${k.dua?' — '+k.dua:''}\nاختر ${u} واقرأه بنية أن يصل أجره له، وتابع الختمة حتى تكتمل 🤍`:k.kind==='o'?`ختمة «${k.title}»: اختر ${u} من القرآن باسمك، ولوحة الختمة تبيّن تقدّمنا جميعًا`:`شاركنا «${k.title}»: اختر ${u} من القرآن واقرأه، ونختم معًا`}
async function share(k){const u=link(k.id),t=shareText(k);try{if(navigator.share){await navigator.share({title:KT(k),text:t,url:u});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(t+'\n'+u);toast('تم نسخ الرابط')}catch(e){document.querySelectorAll('.zfsh').forEach(x=>x.remove());sheet(`<b>رابط الختمة</b><input type="text" value="${esc(u)}" readonly onclick="this.select()" style="width:100%;margin-top:10px">`)}}
let timer=0;
ZF.m.zk=(a,mode)=>{mode=mode||ZF.zkMode;ZF.zkMode=null;clearInterval(timer);addCss();if(a)return show(a);
 const l=mine(),nm=F.kname||'';let kind=['d','o'].includes(mode)?mode:'g';
 const H={g:'ختمة جماعية',d:'ختمة لروح فقيد',o:'ختمة الجماعة'};
 view.innerHTML=`${back(kind==='g'?'sec/quran':kind==='d'?'sec/family':'sec/quran','رجوع')}<h1 class="page" id="kh1">${H[kind]}</h1><div class="zfk">
 <p class="znote" id="kint"></p>
 <section class="zcard"><h3>${zi('plus')}ختمة جديدة</h3>
 <div class="kseg">${[['g','جماعية'],['d','لروح فقيد'],['o','شركة/مدرسة/مسجد']].map(([x,t])=>`<button data-kind="${x}" class="${x===kind?'on':''}">${t}</button>`).join('')}</div>
 <label class="k" id="ktl">اسم الختمة</label><input type="text" id="kt" maxlength="60">
 <div id="korg" hidden><label class="k">نوع الجهة</label><select id="ko">${Object.entries(ORG).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></div>
 <div id="kdua" hidden><label class="k">دعاء قصير يظهر للمشاركين (اختياري)</label><input type="text" id="ku" maxlength="120" placeholder="اللهم اغفر له وارحمه"></div>
 <label class="k">التقسيم</label><select id="kun"><option value="30">٣٠ جزءًا</option><option value="60">٦٠ حزبًا (أسهل لكل مشارك)</option></select>
 <label class="k">اسمك (يظهر للمشاركين)</label><input type="text" id="kn" maxlength="30" value="${esc(nm)}" placeholder="اسمك أو لقبك">
 <label class="k">موعد الختم (اختياري)</label><input type="date" id="kd">
 <button class="btn block" id="kc">${zi('circles')} أنشئ الختمة وشارك الرابط</button>
 <p class="znote" style="margin-top:8px">الاسم والدعاء يظهران لكل من يفتح الرابط. لا تكتب أرقام جوالات. أي إساءة يمكن الإبلاغ عنها وتُحذف.</p></section>
 ${l.length?`<section class="zcard"><h3>${zi('list')}ختماتي</h3><div class="zlist">${l.map(x=>`<a class="zli" href="#khatma/${x.id}"><span class="zq">${zi(x.kd==='d'?'heart':x.kd==='o'?'mosque':'circles')}</span><span class="grow">${x.kd==='d'?'لروح ':''}${esc(x.t)}</span>${zi('chev','chv')}</a>`).join('')}</div></section>`:''}
 ${kind==='g'?`<a class="zchip" href="#gk/old" style="margin-top:6px">${zi('refresh')}الختمات القديمة على هذا الجهاز</a>`:''}</div>`;
 const setK=x=>{kind=x;view.querySelectorAll('[data-kind]').forEach(b=>b.classList.toggle('on',b.dataset.kind===x));$('#kh1').textContent=H[x];$('#korg').hidden=x!=='o';$('#kdua').hidden=x!=='d';
  $('#ktl').textContent=x==='d'?'اسم الفقيد (رحمه الله)':x==='o'?'اسم الجهة أو المجموعة':'اسم الختمة';$('#kt').placeholder=x==='d'?'مثلًا: الوالد محمد':x==='o'?'مثلًا: مدرسة النور — الصف الثالث':'مثلًا: ختمة العائلة لرمضان';
  $('#kint').textContent=x==='d'?'ختمة يُهدى ثوابها لروح من فقدت: شارك الرابط في العزاء أو المجموعة، وكل واحد يختار جزءًا أو حزبًا ويعلّم عليه إذا أنهاه، والجميع يرى الختمة تكتمل مباشرة. ويمكن تكرارها (الختمة الثانية، الثالثة…).':x==='o'?'ختمة لشركتك أو مدرستك أو مسجدك: كل مشارك يحجز جزءًا باسمه، ولوحة الختمة تعرض ترتيب المشاركين وتقدّم الجهة.':'أنشئ ختمة وشارك رابطها مع أهلك أو مجموعتك. كل فرد يختار جزءًا باسمه، ثم يعلّم عليه إذا أنهاه، والجميع يرى التقدم. بدون تسجيل.'};
 setK(kind);view.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>setK(b.dataset.kind));
 $('#kc').onclick=async e=>{const b=e.currentTarget,t=$('#kt').value.trim(),n=$('#kn').value.trim();if(kind!=='g'&&!t){toast(kind==='d'?'اكتب اسم الفقيد':'اكتب اسم الجهة');$('#kt').focus();return}if(!n){toast('اكتب اسمك أولًا');$('#kn').focus();return}F.kname=n;save();b.disabled=true;
  const r=await api('create',{title:t||'ختمة جماعية',deadline:$('#kd').value||null,kind,unit:+$('#kun').value,dua:kind==='d'?$('#ku').value.trim():'',org:kind==='o'?$('#ko').value:null}).catch(()=>null);b.disabled=false;
  if(!r||!r.ok){toast((r&&r.msg)||'تعذّر إنشاء الختمة، تأكد من الاتصال');return}remember(r.k);location.hash='khatma/'+r.k.id;setTimeout(()=>invite(r.k),700)}};
function invite(k){const s=sheet(`<b style="font-size:18px">تم إنشاء الختمة</b><p class="znote" style="margin:6px 0 10px">${k.kind==='d'?'أرسل الرابط في مجموعة العائلة أو العزاء، وكلٌّ يختار نصيبه.':'أرسل الرابط لأهلك أو مجموعتك، وكلٌّ يختار جزءه.'}</p><input type="text" value="${esc(link(k.id))}" readonly onclick="this.select()" style="width:100%;direction:ltr"><button class="btn block" data-sh style="margin-top:10px">${zi('share')} شارك الرابط</button>`);s.querySelector('[data-sh]').onclick=()=>{s.remove();share(k)}}
function ringSVG(parts,U){const by={};parts.forEach(p=>by[p.j]=p);let s='';const R=54,C=66,gap=U>30?.012:.025;for(let j=1;j<=U;j++){const a0=(j-1)/U*2*Math.PI-Math.PI/2+gap,a1=j/U*2*Math.PI-Math.PI/2-gap,p=by[j];
  const col=p?(p.s===2?'var(--accent)':'var(--z-clay)'):'var(--line)';s+=`<path d="M${C+R*Math.cos(a0)} ${C+R*Math.sin(a0)} A${R} ${R} 0 0 1 ${C+R*Math.cos(a1)} ${C+R*Math.sin(a1)}" stroke="${col}" stroke-width="13" fill="none"/>`}
 const d=parts.filter(p=>p.s===2).length;return`<svg viewBox="0 0 132 132">${s}<text x="66" y="66" text-anchor="middle" font-size="26" font-weight="700" fill="var(--ink)" font-family="Zad">${ar(d)}</text><text x="66" y="86" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="Zad">من ${U===60?'٦٠ حزبًا':'٣٠ جزءًا'}</text></svg>`}
function board(P){const m={};P.forEach(p=>{const x=m[p.n]=m[p.n]||{n:p.n,d:0,c:0};p.s===2?x.d++:x.c++});const L=Object.values(m).sort((a,b)=>b.d-a.d||b.c-a.c);
 return L.length?`<div class="brd">${L.slice(0,40).map((x,i)=>`<div><span>${ar(i+1)}</span><b>${esc(x.n)}</b><i>${ar(x.d)} ✓${x.c?` <small style="color:var(--muted);font-weight:400">· ${ar(x.c)} محجوز</small>`:''}</i></div>`).join('')}</div>`:'<p class="znote">لم يشارك أحد بعد. شارك الرابط لتبدأ اللوحة.</p>'}
async function report(k){const el=sheet(`<b style="font-size:17px">إبلاغ عن هذه الختمة</b><p class="znote">إذا كان الاسم أو الدعاء فيه إساءة أو كلام غير لائق، أبلغنا وسنراجعه. الختمة تختفي تلقائيًا إذا أبلغ عنها عدة أشخاص.</p><input type="text" id="krr" maxlength="60" placeholder="السبب (اختياري)" style="width:100%"><button class="btn" id="krg">إرسال البلاغ</button>`);
 el.querySelector('#krg').onclick=async()=>{const r=await fetch('/api/social/report',{method:'POST',headers:{'Content-Type':'application/json','X-Zad-Dev':dev()},body:JSON.stringify({t:'k',id:k.id,reason:el.querySelector('#krr').value})}).then(r=>r.json()).catch(()=>null);el.remove();toast(r&&r.ok?'وصلنا بلاغك، جزاك الله خيرًا':'تعذّر الإرسال')}}
async function show(id,quiet){const r=await get(id).catch(()=>null);if(location.hash.slice(1).split('/')[1]!==id)return;/* v4.6: a late refresh of another khatma never overwrites this one */
 if(!r||!r.ok){view.innerHTML=`${back('gk','ختمة جماعية')}<section class="zcard"><p class="znote">${r&&r.error==='not found'?'هذه الختمة غير موجودة أو حذفها منشئها.':r&&r.error==='hidden'?'هذه الختمة قيد المراجعة.':'تعذّر تحميل الختمة، تأكد من الاتصال.'}</p></section>`;return}
 const k=r.k,P=r.parts,by={};P.forEach(p=>by[p.j]=p);remember(k);const U=k.unit===60?60:30,un=UN(k);
 const done=P.filter(p=>p.s===2).length,cl=P.filter(p=>p.s===1).length,free=U-done-cl,myN=P.filter(p=>p.me);
 let dl='';if(k.deadline){const dd=Math.ceil((new Date(k.deadline+'T23:59:59')-new Date())/864e5);dl=dd>=0?`الموعد: ${ar(k.deadline.split('-').reverse().join('/'))} · بقي ${ar(dd)} ${dd>2&&dd<11?'أيام':'يوم'}`:`انتهى الموعد (${ar(k.deadline.split('-').reverse().join('/'))})`}
 const sy=window.scrollY,isD=k.kind==='d',isO=k.kind==='o',full=done>=U;
 const head=isD?`<div class="dec"><span class="kind">ختمة لروح فقيد${k.round>1?' · الختمة رقم '+ar(k.round):''}</span><div class="nm">${esc(k.title)} رحمه الله</div>${k.dua?`<div class="du">${esc(k.dua)}</div>`:''}</div>`:isO?`<span class="kind">ختمة ${ORG[k.org]||'جهة'}</span>`:'';
 const fin=full?(isD?`<section class="zcard fin">${zi('sparkle')}<div class="big">تمّت الختمة${k.round>1?' رقم '+ar(k.round):''} لروح ${esc(k.title)}</div><p class="znote" style="margin:0">جزى الله كل من شارك خيرًا، وجعلها في ميزان حسناته.</p><div class="hd">«${DUA_D.t}»</div><div class="src">${DUA_D.w} · <a href="${DUA_D.u}" target="_blank" rel="noopener">${DUA_D.ref}</a> · صحيح</div>${k.mine?`<button class="btn block" id="knx" style="margin-top:12px">${zi('refresh')} ابدأ الختمة رقم ${ar((k.round||1)+1)} له</button>`:''}</section>`
   :`<div class="zbanner" style="margin-top:12px">${zi('sparkle')}<div><b>تمّت الختمة بفضل الله</b><small>تقبّل الله منكم جميعًا</small></div></div>`):'';
 view.innerHTML=`${back('gk','ختماتي')}<div class="zfk">${isD&&full?fin:''}<section class="zcard">${head}<div class="kr">${ringSVG(P,U)}<div class="grow">${isD?'':`<p class="tt">${esc(k.title)}</p>`}${dl?`<div class="dl">${dl}</div>`:''}${k.round>1&&!isD?`<div class="dl">الجولة ${ar(k.round)}${k.rounds?` · ختمات مكتملة: ${ar(k.rounds)}`:''}</div>`:''}${isD&&k.rounds?`<div class="dl">ختمات مكتملة له: ${ar(k.rounds)}</div>`:''}${k.closed?'<div class="dl" style="color:var(--z-clay)">الختمة مغلقة</div>':''}
 <div class="lg"><span><i style="background:var(--accent)"></i>تمّ ${ar(done)}</span><span><i style="background:var(--z-clay)"></i>محجوز ${ar(cl)}</span><span><i style="background:var(--line)"></i>متاح ${ar(free)}</span></div></div></div>
 ${!isD?fin:''}
 <div class="zchips" style="margin-top:12px"><button class="btn" id="ksh">${zi('share')} شارك الرابط</button><button class="zchip" id="krf">${zi('refresh')}تحديث</button></div><p class="k" style="margin:6px 0 0">يتحدّث تلقائيًا كل بضع ثوانٍ</p></section>
 ${isO?`<section class="zcard"><h3>${zi('trophy')}لوحة الختمة</h3>${board(P)}</section>`:''}
 <section class="zcard"><div class="zrow" style="justify-content:space-between"><h3>${zi('quran')}${U===60?'الأحزاب':'الأجزاء'}</h3><span class="k">${F.kname?'باسم: '+esc(F.kname):''}</span></div>
 <p class="znote" style="margin-top:0">${k.closed?'الختمة مغلقة، لا يمكن حجز جديد.':`اضغط على ${un} متاح لتحجزه، واضغط على ${un}ك لتعلّم عليه أنك أنهيته.`}</p>
 <div class="grid${U===60?' g60':''}">${Array.from({length:U},(_,i)=>{const j=i+1,p=by[j];return`<button class="j${p?(p.s===2?' d':' c'):''}${p&&p.me?' me':''}" data-j="${j}"><b>${ar(j)}</b><small>${p?(p.s===2?'تمّ · ':'')+esc(p.n):'متاح'}</small></button>`}).join('')}</div>
 ${myN.length?`<p class="k" style="margin-top:10px">${U===60?'أحزابي':'أجزائي'}: ${myN.map(p=>ar(p.j)+(p.s===2?' ✓':'')).join('، ')}</p>`:''}${U===60?'<p class="k">الحزب نصف جزء: الحزب ١ و٢ = الجزء ١، وهكذا.</p>':''}</section>
 ${k.mine?`<section class="zcard"><h3>${zi('lock')}خيارات منشئ الختمة</h3><div class="zchips"><button class="zchip" id="kcl">${k.closed?'إعادة فتح الختمة':'إغلاق الختمة'}</button><button class="zchip" id="krs">${zi('refresh')}${isD?'ختمة جديدة له':'جولة جديدة (تصفير)'}</button><button class="zchip" id="kdl" style="color:var(--z-clay)">${zi('trash')}حذف الختمة</button></div><p class="znote">هذه الخيارات تظهر لك فقط لأنك أنشأت الختمة من هذا الجهاز.</p></section>`:`<button class="rep" id="krp">إبلاغ عن محتوى غير لائق</button>`}</div>`;
 window.scrollTo(0,quiet?sy:0);
 $('#ksh').onclick=()=>share(k);$('#krf').onclick=()=>show(id,1);const rp=$('#krp');if(rp)rp.onclick=()=>report(k);
 view.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>tapJuz(k,by[+b.dataset.j],+b.dataset.j));
 const act=async(p,b,msg)=>{const x=await api(p,Object.assign({id},b||{})).catch(()=>null);if(!x||!x.ok){toast((x&&x.msg)||'تعذّر التنفيذ');if(x&&x.parts)show(id,1);return x}if(msg)toast(msg);if(p==='delete'){F.kl=mine().filter(z=>z.id!==id);save();location.hash='gk';return x}show(id,1);return x};
 ZF._kact=act;
 const nx=$('#knx');if(nx)nx.onclick=()=>act('reset',{},'بدأت الختمة رقم '+ar((k.round||1)+1));
 if(k.mine){$('#kcl').onclick=()=>act('close',{open:k.closed},k.closed?'تم فتح الختمة':'تم إغلاق الختمة');$('#krs').onclick=()=>{if(confirm(isD?'بدء ختمة جديدة له؟ تُمسح الحجوزات الحالية وتُحسب الختمة المكتملة.':'بدء جولة جديدة يمسح كل الأجزاء المحجوزة والمنجزة. هل أنت متأكد؟'))act('reset',{},isD?'بدأت ختمة جديدة له':'بدأت جولة جديدة')};$('#kdl').onclick=()=>{if(confirm('حذف الختمة نهائيًا لكل المشاركين؟'))act('delete',{},'تم حذف الختمة')}}
 clearInterval(timer);timer=setInterval(()=>{if(location.hash.slice(1)!=='khatma/'+id){clearInterval(timer);return}if(document.visibilityState==='visible'&&!document.querySelector('.zfsh'))show(id,1)},8000)}
function tapJuz(k,p,j){const act=ZF._kact,un=UN(k),lab=k.unit===60?`الحزب ${ar(j)} (الجزء ${ar(Math.ceil(j/2))})`:`الجزء ${ar(j)}`;
 if(!p){if(k.closed){toast('الختمة مغلقة');return}const el=sheet(`<b style="font-size:17px">حجز ${lab}</b><p class="znote">يظهر اسمك للمشاركين بجانبه.${k.kind==='d'?' اقرأه بنية أن يصل ثوابه لروح '+esc(k.title)+'.':''}</p><input type="text" id="kn2" maxlength="30" value="${esc(F.kname||'')}" placeholder="اسمك" style="width:100%"><button class="btn" id="kgo">${zi('check')} احجز ${lab}</button>`);
  el.querySelector('#kgo').onclick=async()=>{const n=el.querySelector('#kn2').value.trim();if(!n){toast('اكتب اسمك');return}F.kname=n;save();el.remove();await act('claim',{juz:j,name:n},'تم حجز '+un+' '+ar(j))};return}
 if(p.me){const el=sheet(`<b style="font-size:17px">${lab} · ${esc(p.n)}</b>${p.s===2?`<button class="btn ghost" id="kun">التراجع عن «أنهيته»</button>`:`<button class="btn" id="kdn">${zi('check')} أنهيت القراءة</button>`}<button class="btn ghost" id="krl">إلغاء الحجز</button>`);
  const dn=el.querySelector('#kdn');if(dn)dn.onclick=async()=>{el.remove();const x=await act('done',{juz:j},'ما شاء الله، تقبّل الله');if(x&&x.ok)track('k',1)};
  const un2=el.querySelector('#kun');if(un2)un2.onclick=async()=>{el.remove();const x=await act('undone',{juz:j});if(x&&x.ok)track('k',-1)};
  el.querySelector('#krl').onclick=async()=>{el.remove();const x=await act('release',{juz:j},'تم إلغاء الحجز');if(x&&x.ok&&p.s===2)track('k',-1)};return}
 const el=sheet(`<b style="font-size:17px">${lab}</b><p class="znote">${p.s===2?'أنهاه':'محجوز باسم'}: ${esc(p.n)}</p>${k.mine?'<button class="btn ghost" id="kfr">إلغاء حجزه (لمنشئ الختمة)</button>':''}`);const fr=el.querySelector('#kfr');if(fr)fr.onclick=()=>{el.remove();act('release',{juz:j},'تم إلغاء الحجز')}}
})();
