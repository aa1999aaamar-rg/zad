
/* زاد — حاسبة المواريث (محرك). مذهب الحنابلة كما تعمل به المحاكم السعودية، مع التنبيه على المسائل الخلافية. */
(function(G){
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
const R=(n,d=1)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);return[n/g,d/g]};
const add=(a,b)=>R(a[0]*b[1]+b[0]*a[1],a[1]*b[1]),sub=(a,b)=>R(a[0]*b[1]-b[0]*a[1],a[1]*b[1]),mul=(a,b)=>R(a[0]*b[0],a[1]*b[1]),div=(a,b)=>R(a[0]*b[1],a[1]*b[0]);
const cmp=(a,b)=>a[0]*b[1]-b[0]*a[1];const Z=[0,1];
/* heir keys */
const H={husband:'الزوج',wife:'الزوجة',son:'الابن',daughter:'البنت',sson:'ابن الابن',sdau:'بنت الابن',father:'الأب',mother:'الأم',gf:'الجد (أبو الأب)',gmm:'الجدة لأم',gmf:'الجدة لأب',fb:'الأخ الشقيق',fs:'الأخت الشقيقة',pb:'الأخ لأب',ps:'الأخت لأب',mb:'الأخ لأم',ms:'الأخت لأم',fbs:'ابن الأخ الشقيق',pbs:'ابن الأخ لأب',fu:'العم الشقيق',pu:'العم لأب',fus:'ابن العم الشقيق',pus:'ابن العم لأب'};
const ORDER=Object.keys(H);
const MAX={husband:1,wife:4,father:1,mother:1,gf:1,gmm:1,gmf:1};
/* basis texts: ayah refs only (the verse text itself is fetched from the Qur'an API in the UI) */
function calc(inp){
 const c={};ORDER.forEach(k=>c[k]=Math.max(0,Math.min(MAX[k]||50,Math.floor(+inp[k]||0))));
 if(c.husband&&c.wife)return{err:'لا يجتمع زوج وزوجة في مسألة واحدة: الميت إما رجل أو امرأة.'};
 const notes=[],rows={};const put=(k,o)=>{rows[k]=Object.assign({k,name:H[k],n:c[k],share:Z},o)};
 const descM=c.son+c.sson>0, desc=descM||c.daughter+c.sdau>0, femDesc=!descM&&(c.daughter+c.sdau>0);
 const F=c.father>0, GF=!F&&c.gf>0;
 const sibCount=c.fb+c.fs+c.pb+c.ps+c.mb+c.ms;
 const blocked=(k,why)=>{if(c[k])put(k,{type:'b',why})};
 /* spouses */
 if(c.husband)put('husband',{type:'f',fard:desc?R(1,4):R(1,2),basis:'4:12',why:desc?'الربع لوجود الفرع الوارث':'النصف لعدم الفرع الوارث'});
 if(c.wife)put('wife',{type:'f',fard:desc?R(1,8):R(1,4),basis:'4:12',why:(desc?'الثمن لوجود الفرع الوارث':'الربع لعدم الفرع الوارث')+(c.wife>1?' — يشتركن فيه بالتساوي':'')});
 /* children */
 const asaba=[];/* [keys..., ratio male:female] groups in priority order */
 if(c.son){asaba.push({ks:['son','daughter'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:11'})}
 else if(c.daughter){put('daughter',{type:'f',fard:c.daughter>1?R(2,3):R(1,2),basis:'4:11',why:c.daughter>1?'الثلثان للبنتين فأكثر':'النصف للبنت الواحدة'})}
 if(c.son){blocked('sson','محجوب بالابن');blocked('sdau','محجوبة بالابن')}
 else{
  if(c.sson){asaba.push({ks:['sson','sdau'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:11'})}
  else if(c.sdau){
   if(!c.daughter)put('sdau',{type:'f',fard:c.sdau>1?R(2,3):R(1,2),basis:'4:11',why:c.sdau>1?'الثلثان (كالبنات عند عدمهن)':'النصف (كالبنت عند عدمها)'});
   else if(c.daughter===1)put('sdau',{type:'f',fard:R(1,6),basis:'4:11',why:'السدس تكملة الثلثين مع البنت الواحدة',hadith:'b6736'});
   else blocked('sdau','محجوبة باستكمال البنات الثلثين');
  }
 }
 /* father / grandfather */
 const parentShare=(k,label)=>{
  if(descM)put(k,{type:'f',fard:R(1,6),basis:'4:11',why:'السدس فرضًا لوجود الفرع الوارث المذكر'});
  else if(femDesc){put(k,{type:'f',fard:R(1,6),basis:'4:11',why:'السدس فرضًا، والباقي تعصيبًا لوجود الفرع المؤنث فقط'});asaba.push({ks:[k],why:'الباقي تعصيبًا بعد الفروض',addTo:true})}
  else asaba.push({ks:[k],why:'الباقي تعصيبًا لعدم الفرع الوارث',basis:'4:11'});
 };
 if(F){parentShare('father');blocked('gf','محجوب بالأب')}else if(GF)parentShare('gf');
 /* mother (العمريتان) */
 const umariyya=F&&!desc&&sibCount<2&&(c.husband||c.wife);
 if(c.mother){
  if(desc||sibCount>=2)put('mother',{type:'f',fard:R(1,6),basis:'4:11',why:desc?'السدس لوجود الفرع الوارث':'السدس لوجود جمع من الإخوة (ولو كانوا محجوبين)'});
  else if(umariyya){const sp=c.husband?R(1,2):R(1,4);put('mother',{type:'f',fard:mul(R(1,3),sub([1,1],sp)),basis:'4:11',why:'ثلث الباقي بعد فرض الزوج/الزوجة (العُمَريّتان)',src:'iq169748'})}
  else put('mother',{type:'f',fard:R(1,3),basis:'4:11',why:'الثلث لعدم الفرع الوارث وعدم جمع الإخوة'});
 }
 /* grandmothers */
 const gms=[];if(c.gmm){if(c.mother)blocked('gmm','محجوبة بالأم');else gms.push('gmm')}
 if(c.gmf){if(c.mother)blocked('gmf','محجوبة بالأم');else{gms.push('gmf');if(F)notes.push('الجدة لأب مع الأب: ورّثناها على المذهب الحنبلي، وجمهور العلماء يرون أن الأب يحجبها — راجع المحكمة.')}}
 if(gms.length){gms.forEach(k=>put(k,{type:'f',fard:R(1,6*gms.length),why:gms.length>1?'السدس تشترك فيه الجدتان':'السدس فرض الجدة',src:'sunnah'}))}
 /* maternal siblings */
 const mCnt=c.mb+c.ms;
 if(mCnt){
  if(desc||F||c.gf){['mb','ms'].forEach(k=>blocked(k,desc?'محجوب بالفرع الوارث':(F?'محجوب بالأب':'محجوب بالجد')))}
  else{const f=mCnt>1?R(1,3):R(1,6);['mb','ms'].forEach(k=>{if(c[k])put(k,{type:'f',fard:mul(f,R(c[k],mCnt)),basis:'4:12',why:mCnt>1?'الثلث يشتركون فيه بالتساوي ذكرهم كأنثاهم':'السدس للواحد منهم'})})}
 }
 /* full & paternal siblings */
 const sibBlockBy=descM?'محجوب بالفرع الوارث المذكر':F?'محجوب بالأب':c.gf?'محجوب بالجد (على القول الذي اختاره ابن باز وابن عثيمين)':null;
 if(c.gf&&!F&&(c.fb+c.fs+c.pb+c.ps)>0&&!descM)notes.push('الجد مع الإخوة الأشقاء أو لأب مسألة خلافية: حجبناهم بالجد على القول الذي رجّحه ابن باز وابن عثيمين والفوزان، والمذهب (مالك والشافعي وأحمد) يورّثهم معه بالمقاسمة — القسمة الرسمية للمحكمة.');
 let fsAsabaGhayr=false,psAsabaGhayr=false;
 if(sibBlockBy){['fb','fs','pb','ps'].forEach(k=>blocked(k,sibBlockBy))}
 else{
  if(c.fb)asaba.push({ks:['fb','fs'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:176'});
  else if(c.fs){
   if(femDesc){fsAsabaGhayr=true;asaba.push({ks:['fs'],why:'عصبة مع البنات (الأخوات مع البنات عصبة)',src:'iq179776'})}
   else put('fs',{type:'f',fard:c.fs>1?R(2,3):R(1,2),basis:'4:176',why:c.fs>1?'الثلثان للأختين فأكثر':'النصف للأخت الواحدة'});
  }
  /* paternal */
  if(c.fb||fsAsabaGhayr){blocked('pb',c.fb?'محجوب بالأخ الشقيق':'محجوب بالأخت الشقيقة العصبة مع البنات');blocked('ps',c.fb?'محجوبة بالأخ الشقيق':'محجوبة بالأخت الشقيقة العصبة مع البنات')}
  else{
   if(c.pb)asaba.push({ks:['pb','ps'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:176'});
   else if(c.ps){
    if(femDesc){psAsabaGhayr=true;asaba.push({ks:['ps'],why:'عصبة مع البنات'})}
    else if(!c.fs)put('ps',{type:'f',fard:c.ps>1?R(2,3):R(1,2),basis:'4:176',why:c.ps>1?'الثلثان عند عدم الشقيقات':'النصف عند عدم الشقيقة'});
    else if(c.fs===1)put('ps',{type:'f',fard:R(1,6),basis:'4:176',why:'السدس تكملة الثلثين مع الأخت الشقيقة',src:'iq160901'});
    else blocked('ps','محجوبة باستكمال الشقيقات الثلثين');
   }
  }
 }
 /* distant male asaba */
 ['fbs','pbs','fu','pu','fus','pus'].forEach(k=>{if(c[k])asaba.push({ks:[k],why:'الباقي تعصيبًا (لأولى رجل ذكر)',hadith:'b6732'})});
 /* the first asaba group that exists inherits; the rest are blocked */
 let total=Z;Object.values(rows).forEach(r=>{if(r.type==='f')total=add(total,r.fard)});
 let rem=sub([1,1],total);let awl=false,radd=false,winner=null;
 const live=asaba.filter(g=>g.ks.some(k=>c[k]));
 if(live.length){winner=live[0];live.slice(1).forEach(g=>g.ks.forEach(k=>{if(c[k]&&!(rows[k]&&rows[k].type==='f'))blocked(k,'محجوب بمن هو أقرب منه من العصبة ('+winner.ks.map(x=>H[x]).filter((x,i)=>c[winner.ks[i]]).join('، ')+')')}))}
 /* shares */
 const fards=Object.values(rows).filter(r=>r.type==='f');
 if(cmp(total,[1,1])>0){awl=true;fards.forEach(r=>r.share=div(r.fard,total));if(winner)winner.ks.forEach(k=>{if(c[k]&&!rows[k])put(k,{type:'a',share:Z,why:winner.why+' — لم يبق لهم شيء بعد الفروض'})});
  notes.push('عَوْل: زادت الفروض على التركة فنقصت الأنصبة كلها بنسبة واحدة.')}
 else{
  fards.forEach(r=>r.share=r.fard);
  if(winner){
   const ks=winner.ks.filter(k=>c[k]);
   if(cmp(rem,Z)<=0){ks.forEach(k=>{if(!rows[k])put(k,{type:'a',share:Z,why:winner.why+' — استغرقت الفروض التركة فلم يبق لهم شيء'})});
    if(c.fb&&mCnt>1&&!desc&&!F&&!c.gf&&(c.husband)&&(c.mother||c.gmm||c.gmf))notes.push('المسألة المشرَّكة (الحمارية): لا شيء للإخوة الأشقاء على مذهب أبي حنيفة وأحمد، وشرّكهم عمر رضي الله عنه مع الإخوة لأم — راجع المحكمة.')}
   else{
    const wt=k=>(winner.ks.length>1&&k===winner.ks[0])?2:1;const units=ks.reduce((s,k)=>s+c[k]*wt(k),0);
    ks.forEach(k=>{const w=c[k]*wt(k);const part=mul(rem,R(w,units));
     if(rows[k]&&rows[k].type==='f'){rows[k].share=add(rows[k].share,part);rows[k].type='fa';rows[k].why+=' + الباقي تعصيبًا'}
     else put(k,{type:'a',share:part,why:winner.why,basis:winner.basis,hadith:winner.hadith||(winner.basis?null:'b6732'),src:winner.src})});
   }
  }else if(cmp(rem,Z)>0){
   const nonSp=fards.filter(r=>r.k!=='husband'&&r.k!=='wife');
   if(nonSp.length){radd=true;const spT=fards.filter(r=>r.k==='husband'||r.k==='wife').reduce((s,r)=>add(s,r.fard),Z);const nsT=nonSp.reduce((s,r)=>add(s,r.fard),Z);const pool=sub([1,1],spT);
    nonSp.forEach(r=>r.share=mul(pool,div(r.fard,nsT)));notes.push('رَدّ: بقي شيء بعد الفروض ولا عاصب، فرُدّ على أصحاب الفروض بنسبة فروضهم (لا يُرد على الزوجين).')}
   else notes.push('بقي من التركة ما لا وارث له من المذكورين؛ يُنظر في ذوي الأرحام أو بيت المال — راجع المحكمة.');
  }
 }
 const list=ORDER.filter(k=>rows[k]).map(k=>{const r=rows[k];r.per=r.n?mul(r.share,R(1,r.n)):Z;return r});
 /* common denominator (أصل المسألة بعد العول/الرد والتصحيح) */
 const den=list.reduce((d,r)=>{const p=r.per;return p[0]?d*p[1]/gcd(d,p[1]):d},1);
 return{rows:list,notes,awl,radd,base:den};
}
G.ZMW={calc,H,ORDER,R,frac:a=>a[0]+'/'+a[1]};
})(typeof window!=='undefined'?window:globalThis);

/* زاد v4.7 phase 3 «محتوى موثق»: lazy module on zad-content.sites.tab.bot/x/zb3.js.
   Sources: verses = api.alquran.cloud quran-uthmani (embedded at build) / quran.com API v4 at runtime; word meanings = «السراج في بيان غريب القرآن» (الخضيري) and «الميسر في غريب القرآن» (مجمع الملك فهد) via tafsir.app (الباحث القرآني) through /api/tq; أسباب النزول = الواحدي via the same; translations = quran.com API v4; rulings = binbaz.org.sa / alifta.gov.sa / islamqa.info quotes with links; hadith = sunnah.com letter-matched with grade. Local state: S.zb3 (and zad.w3 for the private women tracker, never in S/backup). */
(function(){'use strict';if(window.ZB3||!window.ZS)return;
const D3=/*@@DATA@@*/null;
const zi=ZS.zi,F=ZS.F,$1=s=>document.querySelector(s),$a=s=>[...document.querySelectorAll(s)];
const Z=S.zb3||(S.zb3={});
const sv=()=>{try{save()}catch(e){}};
const ar=x=>typeof AR==='function'?AR(x):String(x).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const e=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=v=>{const n=parseFloat(String(v==null?'':v).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace('٫','.').replace(/,/g,''));return isFinite(n)?n:0};
const money=n=>ar((Math.round(n*100)/100).toLocaleString('en-US'));
const tst=m=>{try{toast(m)}catch(x){}};
const hubBack=r=>{const s=ZS.hubOf?ZS.hubOf(r):null;return s?`<button class="back" onclick="location.hash='sec/${s.id}'">${zi('chev')} ${s.n}</button>`:`<button class="back" onclick="history.back()">${zi('chev')} رجوع</button>`};
const head=(r,sub)=>`${hubBack(r)}<h1 class="page">${F[r]?F[r][0]:''}</h1>${sub?`<p class="znote">${sub}</p>`:''}`;
const sec=(t,ic,h,cls)=>`<section class="zcard${cls?' '+cls:''}">${t?`<h3>${ic?zi(ic):''}${t}</h3>`:''}${h}</section>`;
const CHN=n=>{try{if(typeof CH==='function'){const c=CH(n);const s=Array.isArray(c)?c[1]:typeof c==='string'?c:c&&(c.ar||c.name);if(typeof s==='string')return s.replace(/^سورة\s*/,'')}}catch(x){}return D3.sn[n-1]||String(n)};
const AYN=n=>D3.na[n-1]||7;
const lnk=(u,t)=>`<a href="${e(u)}" target="_blank" rel="noopener">${t}</a>`;
const site=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch(x){return''}};
const SITEN={'binbaz.org.sa':'موقع الشيخ ابن باز','alifta.gov.sa':'الرئاسة العامة للإفتاء','islamqa.info':'الإسلام سؤال وجواب','sunnah.com':'sunnah.com'};
const quote=it=>`<blockquote class="zb-q">${e(it.quote||'').replace(/\n/g,'<br>')}<a href="${e(it.url)}" target="_blank" rel="noopener">${SITEN[site(it.url)]||site(it.url)} ↗</a></blockquote>`;
const items=s=>(D3.A||[]).filter(x=>x.sec===s);
const hadith=h=>`<div class="zb-h"><div class="zhad">«${h.ar}»</div><div class="zref">${lnk(h.url,e(h.ref))} · ${e(h.grade)}</div></div>`;
const hs=s=>(D3.H||[]).filter(x=>x.sec===s);
const verse=k=>{const v=D3.ay[k];if(!v)return'';const[s,a]=k.split(':');return`<div class="zb-v sm">﴿${v}﴾</div><div class="zref">[${CHN(+s)}: ${ar(a)}]</div>`};
const verses=(s,a,b)=>{let t=[];for(let i=a;i<=b;i++){const v=D3.ay[s+':'+i];if(v)t.push(v+' ('+ar(i)+')')}return`<div class="zb-v sm">﴿${t.join(' ')}﴾</div><div class="zref">[${CHN(s)}: ${ar(a)}${b>a?'–'+ar(b):''}]</div>`};
const mapL=(n,c)=>`https://www.google.com/maps/search/?api=1&query=${c[0]},${c[1]}`;
const surahSel=(id,cur)=>`<select class="zb-in" id="${id}">${D3.sn.map((n,i)=>`<option value="${i+1}"${i+1===cur?' selected':''}>${ar(i+1)}. ${n}</option>`).join('')}</select>`;
const NORM=s=>String(s||'').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u08F0-\u08FF]/g,'').replace(/[ٱأإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\u0621-\u064A ]/g,'');
const SK=s=>NORM(s).replace(/[اويء ]/g,'');

/* ============ ٢٦ معاني الكلمات ============ */
const TQ={};
async function tq(src,s,a){const k=src+s+':'+a;if(TQ[k]!=null)return TQ[k];const r=await fetch(`/api/tq?src=${src}&s=${s}&a=${a}`).then(x=>x.json());if(!r||!r.ok)throw new Error('tq');TQ[k]=r.data||'';return TQ[k]}
const parseG=t=>String(t||'').split(/\n+/).map(l=>{const m=l.match(/^\s*﴿([^﴾]+)﴾\s*[:：]\s*(.+)$/);return m?{w:m[1].trim(),m:m[2].trim()}:null}).filter(Boolean);
const matchG=(list,w)=>{const ws=SK(w);if(!ws)return[];return list.filter(x=>{const parts=NORM(x.w).split(' ').map(SK).filter(Boolean);return parts.some(p=>p===ws||(p.length>2&&ws.length>2&&(ws.endsWith(p)||p.endsWith(ws)||ws.includes(p))))})};
const WC={};
async function wordsOf(k){const lang=Z.wlang||'en';const ck=k+lang;if(WC[ck])return WC[ck];const r=await fetch(`https://api.quran.com/api/v4/verses/by_key/${k}?language=${lang}&words=true&word_fields=text_uthmani`).then(x=>x.json());WC[ck]=(r.verse.words||[]).filter(w=>w.char_type_name==='word');return WC[ck]}
const MUY={};
async function muy(k){if(MUY[k])return MUY[k];const r=await fetch(`https://api.quran.com/api/v4/tafsirs/16/by_ayah/${k}`).then(x=>x.json());MUY[k]=String(r.tafsir&&r.tafsir.text||'').replace(/<[^>]+>/g,'');return MUY[k]}
const GSRC='<p class="zb-src">المصادر: «السراج في بيان غريب القرآن» — أ.د. محمد بن عبد العزيز الخضيري، و«الميسر في غريب القرآن الكريم» — مركز الدراسات القرآنية بمجمع الملك فهد (عبر الباحث القرآني tafsir.app)، و«التفسير الميسر» — مجمع الملك فهد (عبر quran.com). ترجمة الكلمة: quran.com (كلمة بكلمة).</p>';
/* renders tappable words of ayah k into el; used by #words and inside the reader's ayah sheet */
async function wordBox(k,el){const[s,a]=k.split(':').map(Number);el.innerHTML='<p class="znote">جارٍ تحميل الكلمات…</p>';let ws;try{ws=await wordsOf(k)}catch(x){el.innerHTML='<p class="znote">تعذّر تحميل الكلمات، تأكد من الاتصال.</p>';return}
 el.innerHTML=`<p class="k" style="margin:0 0 6px">اضغط على أي كلمة لمعناها:</p><div class="zb3-ws" dir="rtl">${ws.map((w,i)=>`<button class="zb3-w" data-wi="${i}">${e(w.text_uthmani||w.text)}</button>`).join(' ')}</div><div class="zb3-wm" id="zb3wm"></div>`;
 const out=el.querySelector('#zb3wm');
 el.querySelectorAll('[data-wi]').forEach(b=>b.onclick=async()=>{el.querySelectorAll('.zb3-w.on').forEach(x=>x.classList.remove('on'));b.classList.add('on');const w=ws[+b.dataset.wi];const wt=w.text_uthmani||w.text;
  out.innerHTML=`<div class="zb3-wt">${e(wt)}</div><p class="znote">جارٍ البحث في كتب الغريب…</p>`;
  let g1=[],g2=[],err=0;try{[g1,g2]=await Promise.all([tq('siraaj-ghareeb',s,a).then(parseG),tq('almuyassar-ghareeb',s,a).then(parseG)])}catch(x){err=1}
  if(!b.classList.contains('on'))return;
  const m1=matchG(g1,wt),m2=matchG(g2,wt);const tr=w.translation&&w.translation.text?`<div class="zb3-tr"><small>${e((LN[Z.wlang||'en']||LN.en).n)}:</small> <span dir="auto">${e(w.translation.text)}</span></div>`:'';
  let h=`<div class="zb3-wt">${e(wt)}</div>`;
  if(m1.length||m2.length){if(m1.length)h+=m1.map(x=>`<div class="zb3-g"><b>﴿${e(x.w)}﴾</b> ${e(x.m)}<small>السراج في بيان غريب القرآن</small></div>`).join('');if(m2.length)h+=m2.map(x=>`<div class="zb3-g"><b>﴿${e(x.w)}﴾</b> ${e(x.m)}<small>الميسر في غريب القرآن</small></div>`).join('')}
  else h+=`<p class="znote" style="margin:6px 0">${err?'تعذّر الوصول لكتب الغريب الآن.':'هذه الكلمة ليست من «الغريب» في الكتابين (يشرحان الكلمات غير الواضحة فقط). معنى الآية من التفسير الميسر:'}</p><div class="zb3-muy" id="zb3muy"><p class="znote">…</p></div>`;
  h+=tr;out.innerHTML=h;const mu=out.querySelector('#zb3muy');if(mu){try{mu.innerHTML=`<p>${e(await muy(k))}</p><small class="k">التفسير الميسر — مجمع الملك فهد</small>`}catch(x){mu.innerHTML=''}}
  if(!m1.length&&!m2.length&&(g1.length||g2.length)){out.insertAdjacentHTML('beforeend',`<details class="zb3-all"><summary>كلمات الغريب في هذه الآية (${ar(Math.max(g1.length,g2.length))})</summary>${(g1.length?g1:g2).map(x=>`<div class="zb3-g"><b>﴿${e(x.w)}﴾</b> ${e(x.m)}</div>`).join('')}<small class="k">${g1.length?'السراج في بيان غريب القرآن':'الميسر في غريب القرآن'}</small></details>`)}
 });
}
V.words=async arg=>{const p=String(arg||'').split('/');let s=+p[0]||Z.ws||1,a=+p[1]||Z.wa||1;s=Math.min(114,Math.max(1,s));a=Math.min(AYN(s),Math.max(1,a));Z.ws=s;Z.wa=a;sv();
 view.innerHTML=`${head('words','اختر الآية ثم اضغط على أي كلمة: يظهر معناها من كتب غريب القرآن المعتمدة. ويمكنك أيضًا الضغط على أي آية في المصحف ثم «معاني الكلمات».')}
 ${sec('','',`<div class="zb-2">${surahSel('zb3s',s)}<select class="zb-in" id="zb3a">${Array.from({length:AYN(s)},(x,i)=>`<option value="${i+1}"${i+1===a?' selected':''}>الآية ${ar(i+1)}</option>`).join('')}</select></div>
 <div class="zrow" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="chip" id="zb3p">‹ السابقة</button><button class="chip" id="zb3n">التالية ›</button><span class="k" style="margin-inline-start:auto">ترجمة الكلمة: <select id="zb3wl" class="zb3-mini">${Object.keys(LN).map(l=>`<option value="${l}"${(Z.wlang||'en')===l?' selected':''}>${LN[l].n}</option>`).join('')}</select></span></div>`)}
 ${sec('','',`<div id="zb3wb"></div>`)}${GSRC}`;
 const go=(S2,A2)=>{location.hash='words/'+S2+'/'+A2};
 $1('#zb3s').onchange=x=>go(+x.target.value,1);$1('#zb3a').onchange=x=>go(s,+x.target.value);
 $1('#zb3p').onclick=()=>a>1?go(s,a-1):s>1&&go(s-1,AYN(s-1));$1('#zb3n').onclick=()=>a<AYN(s)?go(s,a+1):s<114&&go(s+1,1);
 $1('#zb3wl').onchange=x=>{Z.wlang=x.target.value;sv();wordBox(s+':'+a,$1('#zb3wb'))};
 wordBox(s+':'+a,$1('#zb3wb'))};

/* ============ ٢٧ أسباب النزول ============ */
async function asbabBox(k,el){const[s,a]=k.split(':').map(Number);el.innerHTML='<p class="znote">جارٍ التحميل…</p>';let t='';try{t=await tq('wahidi-asbab',s,a)}catch(x){el.innerHTML=`<p class="znote">تعذّر الوصول للمصدر الآن. اقرأها مباشرة: ${lnk(`https://tafsir.app/wahidi-asbab/${s}/${a}`,'الباحث القرآني ↗')}</p>`;return}
 el.innerHTML=(t.trim()?`<div class="zb3-asb">${e(t).replace(/\n/g,'<br>')}</div>`:`<p class="znote">لم يذكر الواحدي في كتابه سببًا لنزول هذه الآية. (أكثر الآيات نزلت بلا سبب خاص.)</p>`)+`<p class="zb-src">المصدر: «أسباب نزول القرآن» — أبو الحسن علي بن أحمد الواحدي (ت ٤٦٨هـ)، النص كما في الكتاب بأسانيده ولم نحكم على رواياته · ${lnk(`https://tafsir.app/wahidi-asbab/${s}/${a}`,'افتح في الباحث القرآني ↗')} · ${lnk(`https://quran.com/${s}:${a}/tafsirs/ar-tafsir-ibn-kathir`,'تفسير ابن كثير للآية ↗')}</p>`}
V.asbab=async arg=>{const p=String(arg||'').split('/');let s=+p[0]||Z.as||2,a=+p[1]||Z.aa||(s===2?115:1);s=Math.min(114,Math.max(1,s));a=Math.min(AYN(s),Math.max(1,a));Z.as=s;Z.aa=a;sv();
 view.innerHTML=`${head('asbab','سبب نزول الآية من كتاب الواحدي «أسباب نزول القرآن»، كل رواية بإسنادها كما في الكتاب.')}
 ${sec('','',`<div class="zb-2">${surahSel('zb3s',s)}<select class="zb-in" id="zb3a">${Array.from({length:AYN(s)},(x,i)=>`<option value="${i+1}"${i+1===a?' selected':''}>الآية ${ar(i+1)}</option>`).join('')}</select></div><div class="zrow" style="gap:8px;margin-top:8px"><button class="chip" id="zb3p">‹ السابقة</button><button class="chip" id="zb3n">التالية ›</button></div>`)}
 ${sec('','',`<div class="zb-v sm" id="zb3av">…</div><div id="zb3ab"></div>`)}`;
 const go=(S2,A2)=>{location.hash='asbab/'+S2+'/'+A2};
 $1('#zb3s').onchange=x=>go(+x.target.value,1);$1('#zb3a').onchange=x=>go(s,+x.target.value);
 $1('#zb3p').onclick=()=>a>1?go(s,a-1):s>1&&go(s-1,AYN(s-1));$1('#zb3n').onclick=()=>a<AYN(s)?go(s,a+1):s<114&&go(s+1,1);
 fetch(`https://api.quran.com/api/v4/verses/by_key/${s}:${a}?fields=text_uthmani`).then(x=>x.json()).then(r=>{const el=$1('#zb3av');if(el)el.innerHTML=`﴿${e(r.verse.text_uthmani)}﴾<div class="zref">[${CHN(s)}: ${ar(a)}]</div>`}).catch(()=>{});
 asbabBox(s+':'+a,$1('#zb3ab'))};

/* ============ ٢٨ ترجمة معاني القرآن ============ */
const LN={en:{n:'English',id:20,t:'Saheeh International',dir:'ltr'},ur:{n:'اردو',id:54,t:'مولانا محمد جوناگڑھی (Maulana Muhammad Junagarhi)',dir:'rtl'},id:{n:'Indonesia',id:134,t:'King Fahad Quran Complex (مجمع الملك فهد)',dir:'ltr'},tl:{n:'Tagalog',id:211,t:'Dar Al-Salam Center',dir:'ltr'},bn:{n:'বাংলা',id:213,t:'Dr. Abu Bakr Muhammad Zakaria',dir:'ltr'},fr:{n:'Français',id:31,t:'Muhammad Hamidullah',dir:'ltr'},hi:{n:'हिन्दी',id:122,t:'Maulana Azizul Haque al-Umari',dir:'ltr'}};
const TRC={};
async function trSurah(lang,s){const k=lang+s;if(TRC[k])return TRC[k];const[a,t]=await Promise.all([fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${s}`).then(x=>x.json()),fetch(`https://api.quran.com/api/v4/quran/translations/${LN[lang].id}?chapter_number=${s}`).then(x=>x.json())]);
 const tt=(t.translations||[]).map(x=>String(x.text||'').replace(/<sup[^>]*>.*?<\/sup>/g,'').replace(/<[^>]+>/g,''));TRC[k]={ar:(a.verses||[]).map(v=>v.text_uthmani),tr:tt,name:(t.meta&&t.meta.translation_name)||LN[lang].t};return TRC[k]}
V.trans=async arg=>{const p=String(arg||'').split('/');let lang=LN[p[0]]?p[0]:(Z.tl||'en'),s=+p[1]||Z.ts||1;s=Math.min(114,Math.max(1,s));Z.tl=lang;Z.ts=s;sv();
 view.innerHTML=`${head('trans','ترجمات معتمدة لمعاني القرآن بسبع لغات — مناسبة لمن تعرفهم من غير العرب. تُحمَّل سورة سورة.')}
 <div class="zb-tabs">${Object.keys(LN).map(l=>`<button class="zchip${l===lang?' on':''}" data-l="${l}">${LN[l].n}</button>`).join('')}</div>
 ${sec('','',`${surahSel('zb3s',s)}<p class="zb-src" style="margin-top:8px">الترجمة: <b>${e(LN[lang].t)}</b> — عبر quran.com</p>`)}
 <div id="zb3tr"><p class="znote" style="text-align:center">جارٍ التحميل…</p></div>
 <div class="zrow" style="gap:8px;justify-content:center;margin:12px 0"><button class="chip" id="zb3p">‹ السورة السابقة</button><button class="chip" id="zb3n">السورة التالية ›</button></div>`;
 const go=(L2,S2)=>{location.hash='trans/'+L2+'/'+S2};
 $a('[data-l]').forEach(b=>b.onclick=()=>go(b.dataset.l,s));$1('#zb3s').onchange=x=>go(lang,+x.target.value);
 $1('#zb3p').onclick=()=>s>1&&go(lang,s-1);$1('#zb3n').onclick=()=>s<114&&go(lang,s+1);
 try{const d=await trSurah(lang,s);if(!$1('#zb3tr')||Z.ts!==s||Z.tl!==lang)return;
  const el=$1('#zb3tr');if(!el)return;el.innerHTML=`<section class="zcard">${d.ar.map((v,i)=>`<div class="zb3-ta" id="t${i+1}"><div class="zb-v sm" style="text-align:right">${e(v)} <span class="zb3-an">${ar(i+1)}</span></div><p class="zb3-tt" dir="${LN[lang].dir}" lang="${lang}">${e(d.tr[i]||'')}</p></div>`).join('')}</section><p class="zb-src">${e(d.name)} · quran.com</p>`}
 catch(x){const el=$1('#zb3tr');if(el)el.innerHTML='<p class="znote" style="text-align:center">تعذّر تحميل الترجمة، تأكد من الاتصال وحاول مرة أخرى.</p>'}};

/* ============ ١٣ حاسبة المواريث ============ */
const MG=[['الزوجية',['husband','wife']],['الفروع (الأولاد وأولاد الابن)',['son','daughter','sson','sdau']],['الأصول',['father','mother','gf','gmm','gmf']],['الإخوة',['fb','fs','pb','ps','mb','ms']],['العصبات البعيدة',['fbs','pbs','fu','pu','fus','pus']]];
const fr=f=>f[0]?`${ar(f[0])}/${ar(f[1])}`:'٠';
const pct=f=>f[0]?ar((f[0]/f[1]*100).toFixed(2).replace(/\.?0+$/,''))+'٪':'—';
const BAS={'4:11':'النساء: ١١','4:12':'النساء: ١٢','4:176':'النساء: ١٧٦'};
V.mawarith=()=>{const M=Z.mw=Object.assign({h:{},amt:''},Z.mw||{});
 view.innerHTML=`${head('mawarith')}
 <div class="zb3-warn">${zi('shield')}<div><b>للاستئناس، والقسمة الرسمية عن طريق المحكمة.</b><small>الحساب على المذهب الحنبلي المعمول به في المحاكم السعودية، مع التنبيه على المسائل الخلافية. تُقسم التركة بعد تجهيز الميت وسداد ديونه وتنفيذ وصيته (النساء: ١١).</small></div></div>
 ${sec('الورثة الأحياء','circles',`${MG.map(([g,ks])=>`<div class="zb3-mg"><div class="k">${g}</div>${ks.map(k=>`<div class="zb3-st"><span>${ZMW.H[k]}</span><div><button data-m="${k}" data-d="-1" aria-label="إنقاص">−</button><b id="mw-${k}">${ar(M.h[k]||0)}</b><button data-m="${k}" data-d="1" aria-label="زيادة">+</button></div></div>`).join('')}</div>`).join('')}
 <label class="k" for="mwamt" style="display:block;margin-top:10px">قيمة التركة (اختياري، ريال)</label><input class="zb-in" id="mwamt" inputmode="decimal" value="${e(M.amt)}" placeholder="مثلًا ٣٠٠٠٠٠">
 <div class="zrow" style="gap:8px;margin-top:10px"><button class="btn grow" id="mwgo">${zi('chart')} احسب الأنصبة</button><button class="btn ghost" id="mwclr">مسح</button></div>`)}
 <div id="mwres"></div>
 ${sec('أدلة المواريث من القرآن','quran',`<div class="zb-tabs">${Object.keys(BAS).map((k,i)=>`<button class="zchip${i?'':' on'}" data-bv="${k}">${BAS[k]}</button>`).join('')}</div><div id="mwv">${verse('4:11')}</div><p class="zb-src">نص الآيات من api.alquran.cloud (المصحف العثماني).</p>`)}
 ${sec('اختبار الحاسبة على مسائل منشورة','checkc',`<p class="k">١٥ مسألة من فتاوى ابن باز والإسلام سؤال وجواب، تُحسب الآن على جهازك:</p><div id="mwt"></div>`)}`;
 const draw=()=>{const h=M.h;const r=ZMW.calc(h);const el=$1('#mwres');if(!Object.values(h).some(x=>x>0)){el.innerHTML='';return}
  if(r.err){el.innerHTML=sec('','',`<p class="znote">${r.err}</p>`);return}
  const amt=num(M.amt);const got=r.rows.filter(x=>x.type!=='b'),bl=r.rows.filter(x=>x.type==='b');
  el.innerHTML=sec('النتيجة','chart',`${r.awl?'<span class="zb3-tag">عَوْل</span>':''}${r.radd?'<span class="zb3-tag">رَدّ</span>':''}
   <div class="zb3-tbl">${got.map(x=>`<div class="zb3-row"><div><b>${x.name}${x.n>1?` ×${ar(x.n)}`:''}</b><small>${e(x.why)}</small>${x.basis?`<button class="zb3-bas" data-bv="${x.basis}">الدليل: ${BAS[x.basis]}</button>`:''}${x.hadith==='b6732'?`<a class="zb3-bas" href="https://sunnah.com/bukhari:6732" target="_blank" rel="noopener">«ألحقوا الفرائض بأهلها…» البخاري ٦٧٣٢</a>`:''}</div><div class="zb3-sh"><b>${fr(x.share)}</b><small>${pct(x.share)}</small>${x.n>1&&x.share[0]?`<small>لكل واحد ${fr(x.per)}</small>`:''}${amt&&x.share[0]?`<em>${money(amt*x.share[0]/x.share[1])} ر.س${x.n>1?`<br><small>لكل واحد ${money(amt*x.per[0]/x.per[1])}</small>`:''}</em>`:''}</div></div>`).join('')}</div>
   ${bl.length?`<div class="k" style="margin-top:10px">لا يرثون في هذه المسألة:</div>${bl.map(x=>`<div class="zb3-bl">${x.name}${x.n>1?` ×${ar(x.n)}`:''} — ${e(x.why)}</div>`).join('')}`:''}
   ${r.notes.map(n=>`<p class="zb3-note">${e(n)}</p>`).join('')}
   <p class="zb-src">أصل المسألة بعد التصحيح: ${ar(r.base)} سهمًا. للاستئناس، والقسمة الرسمية عن طريق المحكمة.</p>`);
  $a('#mwres [data-bv]').forEach(b=>b.onclick=()=>showV(b.dataset.bv,true))};
 const showV=(k,scroll)=>{$a('[data-bv].zchip').forEach(x=>x.classList.toggle('on',x.dataset.bv===k));$1('#mwv').innerHTML=verse(k);if(scroll)$1('#mwv').scrollIntoView({behavior:'smooth',block:'center'})};
 $a('[data-m]').forEach(b=>b.onclick=()=>{const k=b.dataset.m;const mx={husband:1,wife:4,father:1,mother:1,gf:1,gmm:1,gmf:1}[k]||20;M.h[k]=Math.max(0,Math.min(mx,(M.h[k]||0)+ +b.dataset.d));if(k==='husband'&&M.h.husband)M.h.wife=0;if(k==='wife'&&M.h.wife)M.h.husband=0;['husband','wife',k].forEach(q=>{const el=$1('#mw-'+q);if(el)el.textContent=ar(M.h[q]||0)});sv();draw()});
 $1('#mwamt').oninput=x=>{M.amt=x.target.value;sv();draw()};$1('#mwgo').onclick=()=>{draw();const el=$1('#mwres');if(el&&el.firstChild)el.scrollIntoView({behavior:'smooth'})};
 $1('#mwclr').onclick=()=>{M.h={};M.amt='';sv();V.mawarith()};
 $a('.zchip[data-bv]').forEach(b=>b.onclick=()=>showV(b.dataset.bv));
 /* the published cases, run live */
 const sim=s=>{const[a,b]=s.split('/').map(Number);if(!a)return'0/1';const g=(x,y)=>y?g(y,x%y):x;const d=g(a,b);return a/d+'/'+b/d};let pass=0;
 const rows=D3.mwc.map(t=>{const r=ZMW.calc(t.h);const got={};r.rows.forEach(x=>got[x.k]=ZMW.frac(x.share));const ok=Object.keys(t.e).every(k=>sim(got[k]||'0/1')===sim(t.e[k]));if(ok)pass++;
  return`<div class="zb3-tc${ok?' ok':' no'}"><span>${ok?'✓':'✗'}</span><div><b>${e(t.n)}</b><small>${Object.keys(t.e).map(k=>ZMW.H[k]+' '+fr(t.e[k].split('/').map(Number))).join(' · ')}</small>${lnk(t.src,'المصدر ↗')}</div></div>`});
 $1('#mwt').innerHTML=`<div class="zb3-pass" data-pass="${pass}">${ar(pass)} من ${ar(D3.mwc.length)} صحيحة</div>`+rows.join('');
 draw()};

/* ============ ٣٢ آية وقصة للأطفال ============ */
V.kidstory=arg=>{const L=D3.ks;const i=L.findIndex(x=>x.id===arg);
 if(i<0){view.innerHTML=`${head('kidstory','قصص قصيرة من القرآن نفسه، بكلمات سهلة للأطفال، ومعها الآيات.')}
  <div class="zb3-ksl">${L.map(x=>`<a class="zcard zb3-kc" href="#kidstory/${x.id}"><span>${zi(x.ic)}</span><b>${e(x.t)}</b><small>${CHN(x.s)}: ${ar(x.a)}–${ar(x.b)}</small></a>`).join('')}</div>
  <p class="zb-src">تبسيط للأطفال من نص الآيات، بلا زيادة عليها. نص الآيات من api.alquran.cloud.</p><a class="btn ghost block" href="#stories">قصص القرآن (للكبار)</a>`;return}
 const x=L[i];Z.ksr=Z.ksr||{};Z.ksr[x.id]=1;sv();
 view.innerHTML=`<button class="back" onclick="location.hash='kidstory'">${zi('chev')} آية وقصة</button><h1 class="page">${e(x.t)}</h1>
 ${sec('','',`<span class="zb3-tag">تبسيط للأطفال من نص الآيات</span>${x.p.map(t=>`<p class="zb3-kp">${e(t)}</p>`).join('')}`)}
 ${sec('الآيات','quran',verses(x.s,x.a,x.b))}
 ${sec('نتعلّم','star',`<p class="zb3-kp">${e(x.l)}</p>`)}
 <div class="zrow" style="gap:8px">${i>0?`<a class="btn ghost grow" href="#kidstory/${L[i-1].id}">‹ السابقة</a>`:''}${i<L.length-1?`<a class="btn grow" href="#kidstory/${L[i+1].id}">القصة التالية ›</a>`:''}</div>`};

/* ============ ٤٣ حاسبة الزكاة الموسعة (تحل محل الحاسبة القديمة #zakat وتنقل قيمها) ============ */
const OZ=31.1034768,SAR=3.75;
async function metal(){const c=Z.mp;if(c&&Date.now()-c.t<6*3600e3)return c;try{const[g,s]=await Promise.all(['XAU','XAG'].map(k=>fetch('https://api.gold-api.com/price/'+k).then(x=>x.json())));const r={g:g.price/OZ*SAR,s:s.price/OZ*SAR,t:Date.now(),at:g.updatedAt};Z.mp=r;sv();return r}catch(x){return c||null}}
V.zakat=async()=>{const old=(()=>{try{return JSON.parse(localStorage.getItem('ammar.zakat')||'{}')}catch(x){return{}}})();
 const K=Z.zk=Object.assign({cash:old.cash||'',g24:old.gold24||'',g21:old.gold21||'',g18:old.gold18||'',sil:'',shT:'',shI:'',goods:'',re:'',debt:'',gp:old.price||'',sp:'',auto:true},Z.zk||{});
 const Q=D3.zkq;const fq=k=>Q[k]?quote(Q[k]):'';
 const fld=(k,l,h)=>`<label class="zb3-f"><span>${l}${h?`<small>${h}</small>`:''}</span><input class="zb-in" data-z="${k}" inputmode="decimal" value="${e(K[k])}" placeholder="٠"></label>`;
 view.innerHTML=`${head('zakat','احسب زكاة مالك كله في مكان واحد. الأحكام منقولة من فتاوى الشيخ ابن باز رحمه الله مع روابطها.')}
 ${sec('الأسعار اليوم','coins',`<div class="zb-2"><label class="zb3-f"><span>جرام الذهب عيار ٢٤ (ر.س)</span><input class="zb-in" data-z="gp" inputmode="decimal" value="${e(K.gp)}"></label><label class="zb3-f"><span>جرام الفضة (ر.س)</span><input class="zb-in" data-z="sp" inputmode="decimal" value="${e(K.sp)}"></label></div><p class="zb-src" id="zkpx">جارٍ جلب السعر…</p>`)}
 ${sec('أموالك','jar',`${fld('cash','النقود والمدخرات','في البنك والبيت، ومنها الأجرة المقبوضة الباقية')}
  <div class="k" style="margin-top:6px">الذهب (جرام) — المدخر والملبوس</div><div class="zb-2" style="grid-template-columns:1fr 1fr 1fr">${['g24','g21','g18'].map(k=>`<input class="zb-in" data-z="${k}" inputmode="decimal" value="${e(K[k])}" placeholder="عيار ${ar(k.slice(1))}" aria-label="عيار ${ar(k.slice(1))}">`).join('')}</div>
  ${fld('sil','الفضة (جرام)')}${fld('shT','أسهم للمتاجرة (القيمة السوقية اليوم)','تُزكّى بقيمتها')}${fld('shI','أرباح أسهم الاستثمار المقبوضة','التي حال عليها الحول عندك')}
  ${fld('goods','بضاعة المحل المعدة للبيع','بقيمتها يوم الحول، لا بسعر الشراء')}${fld('re','عقار أو أرض معدّة للبيع','بقيمتها اليوم')}${fld('debt','ديون لك على شخص مليء غير مماطل')}`)}
 <div id="zkres"></div>
 ${sec('الأحكام ومصادرها','scroll',`<details open><summary>النصاب ومقدار الزكاة</summary>${fq('nisabG')}${fq('nisabS')}${fq('rate')}${fq('cash')}</details><details><summary>الأسهم</summary>${fq('shares')}</details><details><summary>عروض التجارة والعقار</summary>${fq('trade')}${fq('goods')}${fq('tools')}${fq('land')}${fq('rent')}</details><details><summary>الحلي والديون</summary>${fq('jewel')}${fq('debt')}${fq('owe')}</details>`)}
 <p class="zb-src">الأسعار تقريبية من gold-api.com (سعر الأونصة بالدولار × ٣٫٧٥)، ويمكنك تعديلها بسعر محلك.</p>`;
 const calc=()=>{const n=k=>num(K[k]);const gp=n('gp'),sp=n('sp');const gold=n('g24')+n('g21')*21/24+n('g18')*18/24;
  const parts=[['النقود والمدخرات',n('cash')],['الذهب ('+ar(gold.toFixed(1))+' جم خالص)',gold*gp],['الفضة',n('sil')*sp],['أسهم المتاجرة',n('shT')],['أرباح أسهم الاستثمار',n('shI')],['بضاعة المحل',n('goods')],['العقار المعد للبيع',n('re')],['الديون المرجوة',n('debt')]].filter(x=>x[1]>0);
  const tot=parts.reduce((s,x)=>s+x[1],0);const el=$1('#zkres');if(!tot){el.innerHTML='';return}
  const nG=D3.zk.g*gp,nS=D3.zk.s*sp;const nis=D3.zk.basis==='silver'?nS:D3.zk.basis==='gold'?nG:Math.min(nG||Infinity,nS||Infinity);
  if(!isFinite(nis)||!nis){el.innerHTML=sec('','',`<p class="znote">أدخل سعر الذهب والفضة لحساب النصاب.</p>`);return}
  const due=tot>=nis;el.innerHTML=sec('النتيجة','checkc',`${parts.map(x=>`<div class="kv"><span>${x[0]}</span><b>${money(x[1])} ر.س</b></div>`).join('')}<div class="kv"><span>المجموع</span><b>${money(tot)} ر.س</b></div>
   <div class="kv"><span>النصاب (${D3.zk.label})</span><b>${money(nis)} ر.س</b></div><div class="zb3-zd${due?' on':''}">${due?`<small>الزكاة الواجبة (ربع العشر ٢٫٥٪)</small><b>${money(tot*0.025)} ر.س</b>`:`<b>لم يبلغ مالك النصاب</b><small>فلا زكاة عليه الآن</small>`}</div>
   <p class="zb-src">تجب إذا بلغ المال النصاب وحال عليه الحول الهجري. نصاب الذهب ${ar(D3.zk.g)} جرامًا ونصاب الفضة ${ar(D3.zk.s)} جرامًا كما في فتوى الشيخ ابن باز. ${D3.zk.note||''}</p><a class="btn ghost block" href="#hawl">ذكّرني بموعد حولان الحول</a>`)};
 $a('[data-z]').forEach(i=>i.oninput=()=>{K[i.dataset.z]=i.value;if(i.dataset.z==='gp'||i.dataset.z==='sp')K.auto=false;sv();try{localStorage.setItem('ammar.zakat',JSON.stringify({cash:K.cash,gold24:K.g24,gold21:K.g21,gold18:K.g18,price:K.gp}))}catch(x){}calc()});
 calc();const p=await metal();const px=$1('#zkpx');if(!px)return;
 if(p){if(K.auto||!K.gp){K.gp=p.g.toFixed(2);const i=$1('[data-z="gp"]');if(i)i.value=K.gp}if(K.auto||!K.sp){K.sp=p.s.toFixed(2);const i=$1('[data-z="sp"]');if(i)i.value=K.sp}sv();px.textContent=`سعر تقريبي محدَّث ${new Date(p.t).toLocaleTimeString('ar-SA',{hour:'numeric',minute:'2-digit'})} — عدّله إن كان سعر محلك مختلفًا.`;calc()}
 else px.textContent='تعذّر جلب السعر، أدخله يدويًا.'};

/* ============ ٤٦ الجمعيات الخيرية المرخصة ============ */
V.charity=()=>{view.innerHTML=`${head('charity','تبرّع عبر المنصات الحكومية الرسمية فقط. لا نعرض جمعيات غير موثقة.')}
 ${items('charity').map(x=>sec('','',`<div class="zb3-org"><span>${zi('hands')}</span><div><b>${e(x.q)}</b><small>${e(site(x.url))}</small></div></div><p class="zb3-kp">${e(x.quote)}</p><a class="btn block" href="${e(x.url)}" target="_blank" rel="noopener">افتح ${e(x.q)} ↗</a>`)).join('')}
 <p class="zb-src">قبل التبرع لأي جمعية تأكد أنها مرخصة من المركز الوطني لتنمية القطاع غير الربحي. الوصف منقول من صفحة كل منصة.</p>
 <a class="btn ghost block" href="#sbudget">ميزانية صدقتي</a>`};

/* ============ ٤٧+٦٠ فحص المعاملات + اسأل عالمًا ============ */
V.muamalat=()=>{const L=items('muamalat');view.innerHTML=`${head('muamalat','أسئلة شائعة في المعاملات المالية، كل جواب منقول بنصه من فتوى منشورة مع رابطها. لا توجد إجابات آلية.')}
 <input class="zb-in" id="mmq" placeholder="ابحث: تقسيط، بطاقة، أسهم…" style="margin-bottom:10px">
 <div id="mml">${L.map((x,i)=>`<details class="zcard zb3-mm" data-t="${e(NORM(x.q+' '+x.quote))}"><summary><b>${e(x.q)}</b><small>${SITEN[site(x.url)]||site(x.url)}</small></summary>${quote(x)}</details>`).join('')}</div>
 <a class="zcard zb3-kc" href="#askalim" style="display:flex;gap:10px;align-items:center"><span>${zi('qmark')}</span><div><b>سؤالك غير موجود؟ اسأل عالمًا</b><small>القنوات الرسمية للفتوى</small></div></a>`;
 $1('#mmq').oninput=x=>{const q=NORM(x.target.value).trim();$a('#mml details').forEach(d=>d.style.display=!q||d.dataset.t.includes(q)?'':'none')}};
V.askalim=()=>{view.innerHTML=`${head('askalim','للفتوى ارجع إلى أهل العلم عبر القنوات الرسمية. «زاد» لا يجيب عن الفتاوى بالذكاء الاصطناعي.')}
 ${items('ask').map(x=>sec('','',`<b>${e(x.q)}</b><p class="zb3-kp">${e(x.quote)}</p>${x.note?`<p class="zb-src">${e(x.note)}</p>`:''}<a class="btn block" href="${e(x.url)}" target="_blank" rel="noopener">فتح الصفحة الرسمية ↗</a>`)).join('')}
 ${sec('فتاوى منشورة تبحث فيها','search',`<a class="btn ghost block" href="https://binbaz.org.sa/fatwas" target="_blank" rel="noopener">فتاوى الشيخ ابن باز ↗</a><a class="btn ghost block" style="margin-top:8px" href="https://alifta.gov.sa/ar/home" target="_blank" rel="noopener">الرئاسة العامة للإفتاء ↗</a><a class="btn ghost block" style="margin-top:8px" href="https://islamqa.info/ar" target="_blank" rel="noopener">الإسلام سؤال وجواب ↗</a>`)}
 <a class="btn ghost block" href="#muamalat">أسئلة المعاملات المالية</a>`};

/* ============ ٢٢ خطبة الجمعة ============ */
V.khutba=async()=>{const K2=items('khutba');const page=K2.find(x=>site(x.url)==='prh.gov.sa');
 view.innerHTML=`${head('khutba','خطب الجمعة من المسجد الحرام والمسجد النبوي، من مصادرها الرسمية.')}<div id="khl"><p class="znote" style="text-align:center">جارٍ تحميل آخر الخطب…</p></div>
 ${page?sec('المصدر الرسمي','mosque',`<p class="zb3-kp">صفحة «الخطب بالحرمين» في موقع رئاسة الشؤون الدينية بالمسجد الحرام والمسجد النبوي.</p><a class="btn block" href="${e(page.url)}" target="_blank" rel="noopener">افتح صفحة الخطب ↗</a>`):''}`;
 let r=null;try{r=await fetch('/api/khutba').then(x=>x.json())}catch(x){}const el=$1('#khl');if(!el)return;
 if(!r||!r.ok){el.innerHTML=sec('','',`<p class="znote">تعذّر تحميل العناوين الآن.</p>${K2.filter(x=>site(x.url)==='youtube.com').map(x=>`<a class="btn ghost block" style="margin-top:8px" href="${e(x.url)}" target="_blank" rel="noopener">${e(x.q)} ↗</a>`).join('')}`);return}
 el.innerHTML=r.lists.map(l=>sec(l.n,'mosque',l.items.length?l.items.map(v=>`<a class="zb3-kh" href="${e(v.u)}" target="_blank" rel="noopener"><span>${zi('play')}</span><div><b>${e(v.t)}</b><small>${e(v.d||'')}</small></div></a>`).join(''):'<p class="znote">لا توجد عناوين الآن.</p>')+`<p class="zb-src" style="margin-top:-4px">${lnk(l.ch,'القناة الرسمية ↗')} — المرتبطة بصفحة الخطب في prh.gov.sa</p>`).join('')};

/* ============ ٢٣+٦١ المسلم الجديد: رحلة ٣٠ يومًا ============ */
const NML={ar:'العربية',en:'English',ur:'اردو',tl:'Tagalog',id:'Indonesia'};
const NMT=D3.nmt;/* 15 topics, titles in 5 languages (UI labels) + resource kind */
V.newmuslim=arg=>{const lang=NML[arg]?arg:(Z.nml||'ar');Z.nml=lang;Z.nmd=Z.nmd||{};sv();const R=D3.nm.filter(x=>x.lang===lang);const res=k=>{const r=R.filter(x=>x.kind===k);return r.length?r:R.filter(x=>x.kind==='guide')};const dir=(lang==='ar'||lang==='ur')?'rtl':'ltr';
 const days=[];NMT.forEach((t,i)=>{days.push({d:i*2+1,t,mode:0});days.push({d:i*2+2,t,mode:1})});
 const done=Object.keys(Z.nmd).length;const nxt=days.find(x=>!Z.nmd[x.d])||days[29];
 const lbl={ar:['تعلّم','طبّق وراجع','اليوم'],en:['Learn','Practise & review','Day'],ur:['سیکھیں','عمل اور دہرائی','دن'],tl:['Pag-aralan','Isagawa at balikan','Araw'],id:['Pelajari','Praktikkan & ulangi','Hari']}[lang];
 view.innerHTML=`${head('newmuslim','رحلة ٣٠ يومًا للمسلم الجديد بخمس لغات. كل يوم خطوة، ومعها درس من «دليل المسلم الجديد» و«IslamHouse» بلغته.')}
 <div class="zb-tabs">${Object.keys(NML).map(l=>`<a class="zchip${l===lang?' on':''}" href="#newmuslim/${l}">${NML[l]}</a>`).join('')}</div>
 ${sec('','',`<div class="zb-big">${ar(done)} <small>من ٣٠ يومًا</small></div><div class="zb-bar"><i style="width:${done/30*100}%"></i></div><p class="k" dir="${dir}">${lbl[2]} ${nxt.d}: <b>${e(nxt.t[lang])}</b></p>`)}
 <div class="zb3-nm" dir="${dir}">${days.map(x=>{const rs=res(x.t.k);const on=!!Z.nmd[x.d];return`<div class="zcard zb3-nd${on?' on':''}"><button class="zb3-ck" data-nd="${x.d}" aria-label="تم">${on?'✓':ar(x.d)}</button><div class="grow"><b>${lbl[2]} ${x.d} · ${e(x.t[lang])}</b><small>${lbl[x.mode]}</small>${x.mode===0?rs.slice(0,2).map(r=>`<a href="${e(r.url)}" target="_blank" rel="noopener">${e(r.title)} ↗</a>`).join(''):''}</div><span class="zb3-step">${zi(x.t.ic)}</span></div>`}).join('')}</div>
 ${sec('','',`<details><summary class="zb3-sum">${zi('quran')} أساس الرحلة: أركان الإسلام والإيمان والإحسان</summary>${D3.H.filter(h=>h.sec==='newmuslim').map(hadith).join('')}</details>`)}
 <p class="zb-src">المحتوى من newmuslimguide.com (دليل المسلم الجديد: العربية والإنجليزية والفلبينية) ومن islamhouse.com (الأردية والإندونيسية وغيرها)، روابط مباشرة إلى الدروس بكل لغة. العناوين ترجمة واجهة مختصرة.</p>`;
 $a('[data-nd]').forEach(b=>b.onclick=()=>{const d=b.dataset.nd;if(Z.nmd[d])delete Z.nmd[d];else Z.nmd[d]=Date.now();sv();V.newmuslim(lang)})};

/* ============ ٤٢ الزواج والمولود ============ */
V.marriage=arg=>{const t=['m','b','n'].includes(arg)?arg:'m';
 const body={m:sec('أدعية الزواج','heart',hs('marriage').map(hadith).join('')),
  b:sec('سنن المولود','star',hs('newborn').filter(h=>!/2132|2139/.test(h.k)).map(hadith).join(''))+sec('أحكام العقيقة','scroll',items('aqiqa').map(x=>`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`).join('')),
  n:sec('أحب الأسماء والأسماء المنهي عنها','pen',hs('newborn').filter(h=>/2132|2139/.test(h.k)).map(hadith).join('')+items('names').map(x=>`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`).join(''))}[t];
 view.innerHTML=`${head('marriage','أدعية وسنن موثقة من sunnah.com، وأحكام منقولة من فتاوى الشيخ ابن باز والإسلام سؤال وجواب.')}
 <div class="seg">${[['m','الزواج'],['b','المولود والعقيقة'],['n','تسمية المولود']].map(([k,n])=>`<button data-mt="${k}" class="${k===t?'on':''}">${n}</button>`).join('')}</div>${body}`;
 $a('[data-mt]').forEach(b=>b.onclick=()=>{location.hash='marriage/'+b.dataset.mt})};

/* ============ ٥٧ مساعد الحج ============ */
V.hajj=arg=>{const H=Z.hj=Z.hj||{};const d=D3.hj.find(x=>x.id===arg)||null;
 const dua=k=>{const h=D3.H.find(x=>x.k.includes(k));return h?hadith(h):''};
 if(!d){view.innerHTML=`${head('hajj','مناسك الحج يومًا بيوم (٨–١٣ ذو الحجة) مع قائمة مهام ومواقع المشاعر. الأحكام من فتاوى الشيخ ابن باز.')}
  ${sec('','',`<div class="zb3-hd">${D3.hj.map(x=>{const n=x.c.length,dn=x.c.filter((c,i)=>H[x.id+i]).length;return`<a href="#hajj/${x.id}" class="zb3-hdi"><b>${e(x.day)}</b><span>${e(x.n)}</span><small>${ar(dn)}/${ar(n)}</small></a>`}).join('')}</div>`)}
  ${sec('خريطة المشاعر','map',D3.places.filter(p=>p.g==='h').map(p=>`<a class="zb3-pl" href="${mapL(p.n,p.c)}" target="_blank" rel="noopener">${zi('pin')}<b>${e(p.n)}</b><small>خرائط Google ↗</small></a>`).join(''))}
  ${sec('التلبية','sparkle',dua('1549'))}
  <div class="zrow" style="gap:8px;flex-wrap:wrap"><a class="btn ghost grow" href="#umrah">دليل العمرة</a><a class="btn ghost grow" href="#tawaf">عدّاد الطواف والسعي</a><a class="btn ghost grow" href="#journey">رحلتي للحرمين</a></div>
  ${(()=>{const g=items('hajj').find(x=>site(x.url)==='haj.gov.sa'||site(x.url).endsWith('.gov.sa')&&site(x.url)!=='alifta.gov.sa');return g?`<p class="zb-src">${lnk(g.url,'دليل وزارة الحج والعمرة ↗')}</p>`:''})()}`;return}
 view.innerHTML=`<button class="back" onclick="location.hash='hajj'">${zi('chev')} مساعد الحج</button><h1 class="page">${e(d.day)} · ${e(d.n)}</h1>
 ${sec('قائمة اليوم','checkc',d.c.map((c,i)=>`<label class="zb3-ci"><input type="checkbox" data-hc="${d.id+i}"${H[d.id+i]?' checked':''}><span>${e(c)}</span></label>`).join(''))}
 ${d.q.length?sec('الأحكام','scroll',d.q.map(i=>{const x=items('hajj')[i];return x?`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`:''}).join('')):''}
 ${d.h.length?sec('من السنة','sparkle',d.h.map(dua).join('')):''}
 ${d.p.length?sec('الموقع','map',d.p.map(k=>{const p=D3.places.find(x=>x.k===k);return p?`<a class="zb3-pl" href="${mapL(p.n,p.c)}" target="_blank" rel="noopener">${zi('pin')}<b>${e(p.n)}</b><small>خرائط Google ↗</small></a>`:''}).join('')):''}`;
 $a('[data-hc]').forEach(c=>c.onchange=()=>{H[c.dataset.hc]=c.checked?1:0;sv()})};

/* ============ ٥٩ مزارات مكة والمدينة ============ */
V.ziyarat=()=>{const Q=items('ziyarat');
 view.innerHTML=`${head('ziyarat','الأماكن التاريخية التي يجوز زيارتها، وما هو مشروع فيها وما ليس بمشروع، من فتاوى الشيخ ابن باز والإسلام سؤال وجواب.')}
 ${D3.places.filter(p=>p.g==='z').map(p=>sec('','',`<div class="zb3-org"><span>${zi(p.ic||'pin')}</span><div><b>${e(p.n)}</b><small>${e(p.city)}</small></div></div>${p.leg?`<p class="zb3-leg ${p.ok?'ok':'no'}">${p.ok?'✓ ':'✗ '}${e(p.leg)}</p>`:''}${(p.q||[]).map(i=>Q[i]?quote(Q[i]):'').join('')}${(p.h||[]).map(k=>{const h=D3.H.find(x=>x.k.includes(k));return h?hadith(h):''}).join('')}<a class="btn ghost block" style="margin-top:8px" href="${mapL(p.n,p.c)}" target="_blank" rel="noopener">${zi('map')} الموقع على الخريطة ↗</a>`)).join('')}
 ${sec('قاعدة عامة','shield',`${D3.H.filter(h=>h.k.includes('1189')).map(hadith).join('')}${Q.filter((x,i)=>D3.zgen.includes(i)).map(quote).join('')}`)}`};

/* ============ ٦٢ وضع المرأة (خاص بالجهاز) ============ */
const WK='zad.w3';const WS=()=>{try{return JSON.parse(localStorage.getItem(WK)||'{}')}catch(x){return{}}};const WSV=o=>{try{localStorage.setItem(WK,JSON.stringify(o))}catch(x){}};
const dIso=d=>{const x=new Date(d);x.setMinutes(x.getMinutes()-x.getTimezoneOffset());return x.toISOString().slice(0,10)};
const dDiff=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
V.women=()=>{const W=Object.assign({log:[],on:null,qada:0,qdone:0},WS());const today=dIso(Date.now());
 const cur=W.on?dDiff(W.on,today)+1:0;const last=W.log[W.log.length-1];
 const avg=W.log.length?Math.round(W.log.reduce((s,x)=>s+x.n,0)/W.log.length):0;
 view.innerHTML=`${head('women','متابعة خاصة لأيام العادة مع أحكامها. البيانات تبقى على جهازك فقط، لا تُرفع ولا تدخل في النسخ الاحتياطي.')}
 <div class="zb3-priv">${zi('eyeoff')} محفوظ على هذا الجهاز فقط</div>
 ${sec('الحالة الآن','cal',W.on?`<div class="zb-big">اليوم ${ar(cur)} <small>منذ ${ar(W.on.split('-').reverse().join('/'))}</small></div><p class="zb3-kp">في أيام الحيض لا صلاة ولا صيام، وتقضين الصيام لا الصلاة.</p><label class="zb3-f"><span>يوم الطهر</span><input type="date" class="zb-in" id="wend" value="${today}" max="${today}"></label><button class="btn block" id="woff">${zi('check')} سجّلي الطهر</button>`:`<p class="zb3-kp">${last?`آخر دورة: ${ar(last.n)} أيام (من ${ar(last.s.split('-').reverse().join('/'))}).`:'لم تسجّلي شيئًا بعد.'}${avg?` المتوسط: ${ar(avg)} أيام.`:''}</p><label class="zb3-f"><span>بداية الدورة</span><input type="date" class="zb-in" id="wstart" value="${today}" max="${today}"></label><button class="btn block" id="won">ابدئي التسجيل</button>`)}
 ${sec('قضاء الصيام','fast',`<div class="zb-big">${ar(Math.max(0,W.qada-W.qdone))} <small>يومًا متبقيًا</small></div><div class="zrow" style="gap:8px;flex-wrap:wrap"><button class="chip" data-wq="1">+ يوم فاتني</button><button class="chip" data-wq="-1">− تصحيح</button><button class="btn sm" data-wd="1">قضيت يومًا ✓</button></div><p class="zb-src">إذا وافقت أيام الدورة شهر رمضان، أضيفيها هنا لتقضيها قبل رمضان القادم.</p>`)}
 ${W.log.length?sec('السجل','list',W.log.slice(-6).reverse().map(x=>`<div class="kv"><span>${ar(x.s.split('-').reverse().join('/'))}</span><b>${ar(x.n)} أيام</b></div>`).join('')+`<button class="zb2-rep" id="wclr" style="display:block;margin:10px auto 0;background:none;border:0;color:var(--muted);text-decoration:underline">مسح السجل كله</button>`):''}
 ${sec('الأحكام','scroll',`${hs('women').map(hadith).join('')}${items('women').map(x=>`<b class="zb3-qh">${e(x.q)}</b>${quote(x)}`).join('')}`)}`;
 const rr=()=>V.women();
 const on=$1('#won');if(on)on.onclick=()=>{W.on=$1('#wstart').value||today;WSV(W);rr()};
 const off=$1('#woff');if(off)off.onclick=()=>{const end=$1('#wend').value||today;const n=Math.max(1,dDiff(W.on,end)+1);W.log.push({s:W.on,n});W.log=W.log.slice(-24);W.on=null;WSV(W);tst('تم التسجيل');rr()};
 $a('[data-wq]').forEach(b=>b.onclick=()=>{W.qada=Math.max(0,W.qada+ +b.dataset.wq);if(W.qdone>W.qada)W.qdone=W.qada;WSV(W);rr()});
 $a('[data-wd]').forEach(b=>b.onclick=()=>{if(W.qdone<W.qada){W.qdone++;WSV(W);rr()}});
 const c=$1('#wclr');if(c)c.onclick=()=>{if(confirm('مسح السجل؟')){W.log=[];WSV(W);rr()}}};

/* ============ ٧ هذا اليوم في التاريخ الإسلامي ============ */
const HMN=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
const hToday=()=>{try{if(typeof hijriToday==='function'){const h=hijriToday();if(h&&h.m&&h.d)return{d:+h.d,m:+h.m,y:+h.y}}}catch(x){}try{const p=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(new Date());const g=t=>+(p.find(x=>x.type===t)||{}).value;return{d:g('day'),m:g('month'),y:g('year')}}catch(x){return{d:1,m:1,y:1448}}};
const evC=x=>sec('','',`<div class="zb3-ev"><span><b>${ar(x.hd)}</b><small>${HMN[x.hm-1]}</small></span><div><b>${e(x.t)}</b>${x.hy?`<small>سنة ${ar(x.hy)}هـ</small>`:''}</div></div><p class="zb3-kp">${e(x.d)}</p><blockquote class="zb-q">${e(x.quote)}<a href="${e(x.url)}" target="_blank" rel="noopener">${e(x.src)} ↗</a></blockquote>`);
V.tih=arg=>{const T=hToday();const L=D3.tih;const td=L.filter(x=>x.hm===T.m&&x.hd===T.d);
 let pick=null;if(!td.length){const seed=T.y*400+T.m*31+T.d;pick=L[seed%L.length]}
 const all=arg==='all';
 view.innerHTML=`${head('tih','أحداث ثابتة التاريخ الهجري في المصادر المعتمدة، كل حدث بمصدره. القليل الموثق خير من الكثير الضعيف.')}
 <p class="k" style="text-align:center">اليوم: ${ar(T.d)} ${HMN[T.m-1]||''} ${ar(T.y)}هـ (أم القرى)</p>
 ${td.length?td.map(evC).join(''):`${sec('','',`<p class="znote" style="text-align:center;margin:0">لا يوجد حدث موثق اليوم</p>`)}<h2 class="sec">حدث موثق من التقويم</h2>${evC(pick)}`}
 <a class="btn ghost block" href="#tih/${all?'':'all'}">${all?'إخفاء القائمة':'كل الأحداث الموثقة ('+ar(L.length)+')'}</a>
 ${all?L.slice().sort((a,b)=>a.hm-b.hm||a.hd-b.hd).map(evC).join(''):''}`};

const css3=`.zb-v{font-family:"Amiri Quran",Amiri,serif;font-size:21px;line-height:2.1;text-align:center;color:var(--ink);margin-top:8px}.zb-v.sm{font-size:18px;line-height:2.05}
.zb-h{margin-top:12px}.zb-h+.zb-h{border-top:1px solid var(--line);padding-top:12px}.zb-h .zhad{margin-top:4px}.zref a{color:var(--accent);font-weight:600}
.zb-q{margin:10px 0 0;padding:10px 12px;border-inline-start:3px solid var(--z-clay);background:var(--bg-2);border-radius:10px;line-height:2;font-size:14.5px}.zb-q a{display:block;margin-top:6px;font-size:12px;color:var(--accent);font-weight:700;text-decoration:none}
.zb-src{font-size:12px;color:var(--muted);line-height:1.8;margin:12px 4px 0}.zb-src a{color:var(--accent);font-weight:600}
.zb-big{font-size:28px;font-weight:700;color:var(--ink);margin:6px 0;line-height:1.5}.zb-big small{font-size:13px;color:var(--muted);font-weight:600}
.zb-bar{height:9px;border-radius:9px;background:var(--bg-2);overflow:hidden;margin:6px 0}.zb-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--z-clay));border-radius:9px}
.zb-tabs{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 8px;scrollbar-width:none}.zb-tabs::-webkit-scrollbar{display:none}.zb-tabs .zchip{flex:none}.zb-tabs .zchip svg{width:15px;height:15px}
.zb-it{display:flex;align-items:center;gap:10px;padding:12px 14px}.zb-it+.zb-it{border-top:1px solid var(--line)}.zb-it b{font-size:15px;display:block}.zb-it small{display:block;color:var(--muted);font-size:12px;line-height:1.7}.zb-it.done b{text-decoration:line-through;opacity:.6}.zb-it.late{background:color-mix(in srgb,var(--z-clay) 7%,var(--card))}
.zb-late{font-style:normal;color:var(--z-clay);font-weight:700}
.zb-acts{display:flex;gap:4px;flex:none}.zb-ic{width:36px;height:36px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--muted);display:grid;place-items:center;cursor:pointer;padding:0;text-decoration:none}.zb-ic svg{width:18px;height:18px}.zb-ic.ok{color:var(--accent);border-color:color-mix(in srgb,var(--accent) 35%,var(--line))}.zb-ic:disabled{opacity:.35}
.zb-f{display:flex;flex-direction:column;gap:10px;margin-top:10px}.zb-in{width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);min-width:0}.zb-in:focus{outline:2px solid color-mix(in srgb,var(--accent) 40%,transparent);border-color:var(--accent)}
.zb-2{display:flex;gap:8px;align-items:stretch}.zb-2>*{flex:1}.zb-2 .btn{flex:none}.zb-l{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--muted);font-weight:600}
.zb-5{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.zb-5 label{font-size:12px;color:var(--muted);text-align:center}.zb-5 .zb-in{text-align:center;padding:9px 4px;margin-top:4px}
.zb-seg{display:flex;gap:6px;background:var(--bg-2);padding:4px;border-radius:12px;margin-top:8px}.zb-seg label,.zb-seg button{flex:1;text-align:center;cursor:pointer;border:0;background:none;font:inherit;font-size:14px;font-weight:600;color:var(--ink);padding:0}.zb-seg input{display:none}.zb-seg span,.zb-seg button{display:block;padding:8px;border-radius:9px}.zb-seg input:checked+span,.zb-seg button.on{background:var(--card);box-shadow:var(--shadow);color:var(--accent)}.zb-seg.sm{margin:0;flex:none;width:170px}.zb-seg.sm button{font-size:13px}
.zb-pr{display:flex;align-items:center;justify-content:space-between;padding:9px 0}.zb-pr+.zb-pr{border-top:1px solid var(--line)}
.zb-q5{display:flex;flex-direction:column;margin-top:10px}.zb-qp{display:flex;align-items:center;gap:10px;padding:8px 0}.zb-qp+.zb-qp{border-top:1px solid var(--line)}.zb-qp b{flex:1}.zb-qp span{font-size:20px;font-weight:700;min-width:44px;text-align:center}
.zb-bars{margin-top:12px}.zb-br{display:flex;align-items:center;gap:10px;margin:7px 0;font-size:13px}.zb-br span{width:50px}.zb-br .zb-bar{flex:1;margin:0}.zb-br b{width:52px;text-align:left;font-size:12px}
.zb-mh small{display:block;font-size:10px;color:var(--muted)}
.zb-pill{display:inline-block;font-size:12px;font-weight:700;color:#fff;background:var(--z-clay);border-radius:999px;padding:3px 11px}
.zb-res{border-color:color-mix(in srgb,var(--accent) 35%,var(--line))}
.zb-hero2{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 10%,var(--card)),var(--card))}
.zb-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.zb-tag{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:var(--bg-2);font-size:13.5px;font-weight:600;color:var(--ink);border:0;font-family:inherit}.zb-tag button{border:0;background:none;color:var(--muted);font-size:16px;cursor:pointer;padding:0 2px}.zb-pick{cursor:pointer;border:1px solid var(--line);background:var(--card)}
.zb-kt{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.zb-ktb{display:flex;align-items:center;gap:8px;padding:12px;border-radius:14px;border:1px solid var(--line);background:var(--card);font:inherit;font-size:13.5px;font-weight:600;color:var(--ink);cursor:pointer;text-align:right}.zb-ktb span{display:grid;color:var(--line)}.zb-ktb svg{width:22px;height:22px}.zb-ktb.on{border-color:var(--z-clay);background:color-mix(in srgb,var(--z-clay) 10%,var(--card))}.zb-ktb.on span{color:var(--z-clay)}.zb-ktb.on svg{fill:currentColor}
.zb-mrow{display:flex;justify-content:space-between;gap:10px;padding:8px 0;font-size:14px}.zb-mrow+.zb-mrow{border-top:1px solid var(--line)}
.zb-sos{display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;margin-top:12px;padding:26px 16px;border-radius:24px;border:0;background:linear-gradient(135deg,#c0693f,#9a4f2e);color:#fff;font:inherit;cursor:pointer;box-shadow:var(--shadow)}.zb-sos svg{width:34px;height:34px}.zb-sos b{font-size:20px}.zb-sos small{opacity:.9}
.zb-calm{text-align:center;padding:30px 6px}.zb-ring{width:170px;height:170px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--accent) var(--p),var(--bg-2) 0)}.zb-ring b{width:140px;height:140px;border-radius:50%;background:var(--bg);display:grid;place-items:center;font-size:44px}
.zb-ax{position:relative;padding-top:22px}.zb-ax .zs-star{top:8px;left:8px}.zb-ax .zs-star.on svg{fill:currentColor}
.zb-cal{display:grid;grid-template-columns:repeat(10,1fr);gap:6px;margin-top:10px}.zb-cal i{aspect-ratio:1;border-radius:6px;background:var(--bg-2)}.zb-cal i.on{background:var(--accent)}.zb-cal i.fu{opacity:.4}
.zb-dur{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.zb-tas{margin-top:18px;display:flex;flex-direction:column;align-items:center;gap:6px}.zb-tas button{width:96px;height:96px;border-radius:50%;border:0;background:var(--z-soft);color:var(--accent);font:inherit;font-size:28px;font-weight:700;cursor:pointer}.zb-tas small{color:var(--muted)}
.zb-nd{padding:9px 0;font-size:14px;line-height:1.9}.zb-nd+.zb-nd{border-top:1px solid var(--line)}.zb-nd b{display:block;font-size:12.5px;color:var(--muted)}.zb-nd span{display:block}
.zb-det{margin-top:10px}.zb-det summary{cursor:pointer;color:var(--accent);font-weight:700;font-size:13.5px}
.zb3-ws{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-start;direction:rtl}.zb3-w{font-family:"Amiri Quran",Amiri,serif;font-size:22px;line-height:1.9;padding:2px 10px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.zb3-w.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.zb3-wm{margin-top:12px}.zb3-wt{font-family:"Amiri Quran",Amiri,serif;font-size:26px;color:var(--accent);text-align:center;line-height:1.8}
.zb3-g{padding:10px 12px;margin:8px 0;background:var(--bg-2);border-radius:12px;line-height:1.9;font-size:15px;border-inline-start:3px solid var(--z-clay)}.zb3-g b{font-family:Amiri,serif;font-size:17px;color:var(--accent)}.zb3-g small{display:block;color:var(--muted);font-size:11.5px;margin-top:2px}
.zb3-tr{margin-top:8px;font-size:14px;color:var(--ink)}.zb3-tr small{color:var(--muted)}.zb3-muy p{line-height:2;font-size:14.5px;margin:4px 0}.zb3-all{margin-top:10px}.zb3-all summary{cursor:pointer;color:var(--accent);font-weight:700;font-size:13.5px}
.zb3-mini{font:inherit;font-size:12.5px;padding:3px 6px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.zb3-asb{line-height:2.1;font-size:15px;font-family:Amiri,serif;color:var(--ink);white-space:normal}
.zb3-ta{padding:10px 0}.zb3-ta+.zb3-ta{border-top:1px solid var(--line)}.zb3-tt{margin:4px 0 0;font-size:15px;line-height:1.8;color:var(--ink)}.zb3-an{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border-radius:50%;background:var(--z-soft);color:var(--accent);font:700 12px "IBM Plex Sans Arabic",sans-serif;vertical-align:middle}
.zb-tabs .zchip.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.zb3-warn{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;border-radius:14px;background:#fbeee6;color:#7a3a1c;margin:0 0 12px;border:1px solid #f0d2bf}.zb3-warn svg{width:22px;height:22px;flex:none;margin-top:2px}.zb3-warn b{display:block;font-size:15px}.zb3-warn small{display:block;font-size:12.5px;line-height:1.8;margin-top:2px}
.zb3-mg{margin-top:8px}.zb3-mg .k{font-weight:700;margin:6px 0 2px}.zb3-st{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line);font-size:14.5px}.zb3-st div{display:flex;align-items:center;gap:10px}.zb3-st button{width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--accent);font-size:20px;line-height:1;cursor:pointer}.zb3-st b{min-width:20px;text-align:center;font-size:16px}
.zb3-row{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.zb3-row b{font-size:15px}.zb3-row small{display:block;color:var(--muted);font-size:12px;line-height:1.7}.zb3-sh{text-align:left;min-width:92px}.zb3-sh b{font-size:19px;color:var(--accent);display:block}.zb3-sh em{display:block;font-style:normal;font-weight:700;font-size:13px;color:var(--ink);margin-top:2px}
.zb3-bas{display:inline-block;margin-top:4px;font:inherit;font-size:11.5px;font-weight:700;color:var(--accent);background:var(--z-soft);border:0;border-radius:99px;padding:2px 9px;text-decoration:none;cursor:pointer}
.zb3-bl{font-size:13px;color:var(--muted);padding:3px 0}.zb3-note{font-size:13px;line-height:1.8;background:var(--bg-2);padding:8px 10px;border-radius:10px;margin:8px 0 0}
.zb3-tag{display:inline-block;font-size:11.5px;font-weight:700;padding:2px 10px;border-radius:99px;background:var(--z-soft);color:var(--accent);margin:0 0 6px 6px}
.zb3-tc{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);font-size:13.5px}.zb3-tc>span{font-weight:700;color:#2e7d4f}.zb3-tc.no>span{color:#b3261e}.zb3-tc small{display:block;color:var(--muted);font-size:11.5px;line-height:1.6}.zb3-tc a{font-size:11.5px;color:var(--accent);font-weight:700}.zb3-pass{font-weight:700;color:#2e7d4f;margin-bottom:4px}
.zb3-ksl{display:grid;grid-template-columns:1fr 1fr;gap:10px}.zb3-kc{display:flex;flex-direction:column;gap:4px;text-decoration:none;color:var(--ink);padding:14px}.zb3-kc span svg{width:26px;height:26px;color:var(--z-clay)}.zb3-kc b{font-size:15px}.zb3-kc small{color:var(--muted);font-size:12px}
.zb3-kp{font-size:15.5px;line-height:2;margin:6px 0}
.zb3-f{display:block;margin:8px 0}.zb3-f span{display:block;font-size:13.5px;font-weight:700;margin-bottom:4px}.zb3-f small{display:block;font-weight:400;color:var(--muted);font-size:11.5px}
.zb3-zd{text-align:center;padding:14px;border-radius:14px;background:var(--bg-2);margin:10px 0}.zb3-zd.on{background:var(--accent);color:#fff}.zb3-zd b{display:block;font-size:24px}.zb3-zd small{display:block;font-size:12.5px;opacity:.9}
.zb3-org{display:flex;gap:10px;align-items:center}.zb3-org span svg{width:28px;height:28px;color:var(--accent)}.zb3-org b{display:block;font-size:16px}.zb3-org small{color:var(--muted);font-size:12px}
.zb3-mm summary{cursor:pointer;list-style:none;display:flex;flex-direction:column;gap:2px}.zb3-mm summary::-webkit-details-marker{display:none}.zb3-mm summary b{font-size:15px}.zb3-mm summary small{color:var(--muted);font-size:11.5px}.zb3-mm[open] summary b{color:var(--accent)}
.zb3-kh{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line);text-decoration:none;color:var(--ink)}.zb3-kh span svg{width:26px;height:26px;color:#c4302b}.zb3-kh b{display:block;font-size:14px;line-height:1.7}.zb3-kh small{color:var(--muted);font-size:11.5px}
.zb3-nd{display:flex;gap:10px;align-items:center;padding:10px 12px;margin:8px 0}.zb3-nd.on{opacity:.75}.zb3-nd b{display:block;font-size:14.5px}.zb3-nd small{display:block;color:var(--muted);font-size:12px}.zb3-nd a{display:block;font-size:12.5px;color:var(--accent);font-weight:700;margin-top:3px;text-decoration:none}
.zb3-ck{flex:none;width:36px;height:36px;border-radius:50%;border:2px solid var(--accent);background:var(--card);color:var(--accent);font:700 14px "IBM Plex Sans Arabic",sans-serif;cursor:pointer}.zb3-nd.on .zb3-ck{background:var(--accent);color:#fff}.zb3-step svg{width:22px;height:22px;color:var(--z-clay)}
.zb3-qh{display:block;margin-top:12px;font-size:14px}
.zb3-hd{display:grid;grid-template-columns:1fr 1fr;gap:8px}.zb3-hdi{display:flex;flex-direction:column;padding:12px;border-radius:14px;background:var(--bg-2);text-decoration:none;color:var(--ink)}.zb3-hdi b{color:var(--accent);font-size:15px}.zb3-hdi span{font-size:13.5px;font-weight:700}.zb3-hdi small{color:var(--muted);font-size:11.5px;margin-top:2px}
.zb3-pl{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line);text-decoration:none;color:var(--ink)}.zb3-pl svg{width:20px;height:20px;color:var(--z-clay)}.zb3-pl small{margin-inline-start:auto;color:var(--accent);font-size:12px;font-weight:700}
.zb3-ci{display:flex;gap:10px;align-items:flex-start;padding:9px 0;border-bottom:1px solid var(--line);font-size:14.5px;line-height:1.8}.zb3-ci input{width:20px;height:20px;margin-top:4px;accent-color:var(--accent);flex:none}
.zb3-leg{font-weight:700;font-size:14px;margin:8px 0 0;padding:6px 10px;border-radius:10px}.zb3-leg.ok{background:#e7f4ec;color:#1f6b40}.zb3-leg.no{background:#fbe9e7;color:#9b2c1f}
.zb3-priv{display:flex;align-items:center;justify-content:center;gap:6px;font-size:12.5px;color:var(--muted);margin:-4px 0 10px}.zb3-priv svg{width:16px;height:16px}
.zb3-ev{display:flex;gap:12px;align-items:center}.zb3-ev>span{flex:none;width:58px;height:58px;border-radius:14px;background:var(--accent);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1}.zb3-ev>span b{font-size:22px}.zb3-ev>span small{font-size:10px}.zb3-ev div b{display:block;font-size:16px}.zb3-ev div small{color:var(--muted);font-size:12px}
html.dark .zb3-warn,[data-theme=dark] .zb3-warn{background:#3a261c;color:#f3d3c0;border-color:#5a3a2a}
.zb3-sum{cursor:pointer;font-weight:700;color:var(--accent);display:flex;align-items:center;gap:6px}.zb3-sum svg{width:18px;height:18px}
`;
const st=document.createElement('style');st.textContent=css3;document.head.appendChild(st);
window.ZB3={v:'4.7.0',wordBox,asbabBox,calc:ZMW.calc};
})();
