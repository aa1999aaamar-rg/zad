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
