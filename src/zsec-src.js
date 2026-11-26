/* زاد v5.5.1 — ترتيب الأقسام والوصول إليها.
   • الرئيسية: صف «الوصول السريع» (تثبيت/إلغاء بالضغط المطوّل أو زر «تعديل»، محفوظ على الجهاز في S.zs.fav) + شبكة «الأقسام» مجمّعة بعناوين.
   • «المزيد» (الزر الأوسط): لوحة مجمّعة بالمجموعات نفسها مع بحث مباشر.
   • البحث: اسم القسم أو مرادفه يفتح القسم مباشرة (Enter أو البطاقة الأولى).
   • #shamela: صفحة البحث في المكتبة الشاملة (موقع خارجي).
   Minified to site/zsec.js (loaded after zsh.js). */
!function(){"use strict";
if(window.ZSEC||typeof V==="undefined"||!window.ZS||!ZS.F)return;
const X=window.ZSEC={};const F=ZS.F,SEC=ZS.SEC||[];const zi=k=>{try{return ZS.zi(k)}catch(e){return""}};
const ST=S.zs=S.zs||{};
const sv=()=>{try{save()}catch(e){}};
const AR2=x=>typeof AR==="function"?AR(x):String(x);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm=s=>String(s||"").replace(/[\u064B-\u0652\u0640\u0670]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي").toLowerCase().replace(/\s+/g," ").trim();
const al=w=>w.split(" ").map(x=>x.replace(/^(وال|بال|ال)(?=..)/,"")).join(" ");

/* ── المكتبة الشاملة كقسم مستقل ── */
const SHM="https://shamela.ws/";const shUrl=q=>{q=String(q||"").replace(/\s+/g," ").trim().slice(0,200);return q?SHM+"search?q="+encodeURIComponent(q):SHM};
if(!F.shamela)F.shamela=["المكتبة الشاملة","library","ابحث في آلاف الكتب الشرعية · موقع خارجي","شاملة الشامله كتب بحث في الكتب مكتبة شاملة"];
try{const c=SEC.find(s=>s.id==="content");const g=c&&c.g.find(g=>/المكتبة/.test(g[0]));if(g&&!g[1].includes("shamela"))g[1].push("shamela")}catch(e){}
V.shamela=()=>{const v=document.getElementById("view");if(!v)return;
 v.innerHTML=`<button class="back" onclick="history.length>1?history.back():location.hash='home'">${zi("chev")} رجوع</button><h1 class="page">المكتبة الشاملة</h1><p class="k">ابحث في محتوى آلاف الكتب الشرعية، وتظهر النتائج في المتصفح.</p>
 <div class="zsh-card"><label class="zsh-in">${zi("search")}<input type="search" id="zsxshq" placeholder="اكتب كلمة أو عبارة… (مثال: الصبر)" autocomplete="off" enterkeyhint="search" dir="rtl"></label>
 <a class="zsh-btn" id="zsxshb" href="${SHM}" target="_blank" rel="noopener">${zi("search")}<span>ابحث في المكتبة الشاملة</span><span class="ar">↗</span></a><small class="zsh-note">المكتبة الشاملة موقع خارجي مجاني</small></div>
 <a class="zsx-row" href="#lib">${zi("library")}<span>مكتبتي داخل زاد<small>الكتب المحفوظة وكتب PDF ومكتبة الحفّاظ</small></span>${zi("chev")}</a>`;
 const i=document.getElementById("zsxshq"),b=document.getElementById("zsxshb");const u=()=>{b.href=shUrl(i.value)};i.oninput=u;
 i.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();u();b.click()}};
 b.addEventListener("click",()=>{u();try{const k=i.value.trim();if(k){S.zsh=S.zsh||{};S.zsh.last=k.slice(0,80);sv()}}catch(e){}});
 try{const l=S.zsh&&S.zsh.last;if(l)i.placeholder="آخر بحث: "+l}catch(e){}};

/* ── المرادفات: تُضاف إلى كلمات البحث، وتُستعمل للفتح المباشر ── */
const SYN={quran:"القران القرآن مصحف السور سورة تلاوة قراءة",natiq:"مصحف ناطق صوتي استماع",hifz:"حفظ تحفيظ",listen:"تسميع تسميع بالصوت",khatma:"ختمه ختمة ورد",
 adhkar:"اذكار الأذكار ذكر الصباح المساء",tasbeeh:"سبحه سبحة مسبحة تسبيح عداد",duas:"دعاء ادعيه أدعية",ruqyah:"رقيه رقية",asma:"اسماء الله الحسنى",
 prayer:"المواقيت مواقيت اوقات الصلاه أوقات الصلاة وقت الصلاة الأذان الاذان",qibla:"قبله اتجاه القبلة الكعبة بوصلة",mosques:"مسجد مساجد جامع",salah:"صلواتي متابعة الصلاة",
 lecture:"محاضره محاضرة المحاضرة شرائح عرض تقديمي بوربوينت درس خطبة تحضير",library:"حديث احاديث أحاديث السنه البخاري مسلم",hadith:"حديث اليوم",hcheck:"صحة حديث تخريج",
 dorar:"الدرر درر السنيه",dorous:"دروس محاضرات مرئية",lib:"مكتبة المكتبه كتب كتاب",hufaz:"الحفاظ متون",diwan:"ديوانيه ديوانية مجتمع اصدقاء أصدقاء",family:"عائله عائلتي",
 hijri:"هجري التاريخ الهجري تقويم",occ:"مناسبات عيد",sawm:"صيام صوم",ramadan:"رمضان",zakat:"زكاه زكاة",sadaqa:"صدقه صدقة",videos:"فيديو مقاطع حلقات",
 settings:"اعدادات إعدادات ضبط الوضع الليلي اللغة",whatsnew:"تحديث التحديثات",kids:"اطفال أطفال الأطفال",shamela:"الشامله الشاملة",rihla:"مستواي اوسمة"};
Object.keys(SYN).forEach(r=>{if(F[r])F[r][3]=((F[r][3]||"")+" "+SYN[r]).trim()});

/* ── المجموعات (الرئيسية + «المزيد» + صفحة الأقسام) ── */
const GR=[
 {id:"quran",n:"القرآن والتلاوة",hub:"quran",r:[["quran","المصحف"],["natiq","المصحف الناطق"],["hifz","خطة الحفظ"],["listen","التسميع"],["khatma","الختمة"],["reciters","القرّاء"],["srs","مراجعة الحفظ"],["tadabbur","التدبّر"]]},
 {id:"adhkar",n:"الأذكار والأدعية",hub:"adhkar",r:[["adhkar","الأذكار"],["tasbeeh","السبحة"],["duas","الأدعية"],["ruqyah","الرقية"],["asma","أسماء الله"],["sleep","ورد النوم"],["mythkr","أذكاري"],["wxdua","أدعية اللحظة"]]},
 {id:"ilm",n:"الحديث والعلم",hub:"content",r:[["library","السنة النبوية"],["hadith","حديث اليوم"],["hcheck","تحقّق من حديث"],["dorar","الدرر السنية"],["dorous","دروس زاد"],["lib","المكتبة"],["hufaz","مكتبة الحفّاظ"],["askalim","اسأل عالمًا"]]},
 {id:"prayer",n:"الصلاة والمواقيت",hub:"prayer",r:[["prayer","المواقيت"],["qibla","القبلة"],["mosques","المساجد"],["salah","صلواتي"],["adhanmode","وضع الأذان"],["live","الحرم مباشر"],["qada","قضاء الفوائت"],["friday","الجمعة"]]},
 {id:"season",n:"العبادات والمواسم",hub:"season",r:[["sawm","الصيام"],["ramadan","رمضان"],["umrah","العمرة"],["hajj","الحج"],["occ","المناسبات"],["hijri","التقويم الهجري"]]},
 {id:"family",n:"الأسرة والمجتمع",hub:"family",r:[["diwan","الديوانية"],["family","العائلة"],["birr","برّ الوالدين"],["rahim","صلة الرحم"],["kids","الأطفال"],["halaqa","حلقة التحفيظ"],["fquiz","مسابقات العائلة"],["challenge","تحدّي الأصدقاء"],["cards","بطاقات التهنئة"]]},
 {id:"money",n:"المال والخير",hub:"money",r:[["zakat","الزكاة"],["sadaqa","الصدقة"],["mawarith","المواريث"],["debts","الديون"]]},
 {id:"self",n:"النفس والعادات",hub:"self",r:[["zadi","زادي اليومي"],["niyya","نية اليوم"],["habit","تحدّي ١٠٠ يوم"],["anxious","السكينة"],["rihla","رحلتي"],["harvest","حصادي"]]},
 {id:"content",n:"المحتوى والمشاركة",hub:"content",r:[["videos","مقاطع زاد"],["articles","مقالات"],["quotes","اقتباسات"],["posts","تصاميم"],["balligh","بلّغ ولو آية"],["wallp","خلفية اليوم"]]},
 {id:"tools",n:"الأدوات",hub:"tools",r:[["lecture","المحاضرة"],["shamela","الشاملة"],["car","وضع السيارة"],["offline","بلا إنترنت"],["shareapp","انشر التطبيق"],["backup","نسخ احتياطي"],["whatsnew","ما الجديد"],["settings","الإعدادات"]]}];
GR.forEach(g=>{g.r=g.r.filter(([r])=>F[r])});
const LBL={};GR.forEach(g=>g.r.forEach(([r,l])=>{LBL[r]=LBL[r]||l}));
const lbl=r=>LBL[r]||(F[r]?F[r][0]:r);
const hubN=id=>{const s=SEC.find(s=>s.id===id);return s?new Set(s.g.flatMap(g=>g[1])).size:0};
const hubName=id=>{const s=SEC.find(s=>s.id===id);return s?s.n:""};
X.GR=GR;

/* ── الوصول السريع ── */
const MAXP=8,DEFP=["quran","adhkar","prayer","lecture"];
if(!ST.pin551){if(!Array.isArray(ST.fav))ST.fav=DEFP.filter(r=>F[r]);ST.pin551=1;sv()}
const pins=()=>(Array.isArray(ST.fav)?ST.fav:DEFP).filter(r=>F[r]).slice(0,MAXP);
const isPin=r=>pins().includes(r);
const SKIPU={home:1,sections:1,search:1,sec:1,settings:1,whatsnew:1};
function mostUsed(n){const p=pins(),u=ST.use||{};return Object.keys(u).filter(r=>F[r]&&!p.includes(r)&&!SKIPU[r]&&u[r]>=3).sort((a,b)=>u[b]-u[a]).slice(0,n)}
function togglePin(r,silent){if(!F[r])return false;let f=pins().slice();const on=f.includes(r);
 if(on)f=f.filter(x=>x!==r);else{if(f.length>=MAXP){toast("الوصول السريع يتّسع لثمانية أقسام، أزل واحدًا أولًا");return false}f.push(r)}
 ST.fav=f;sv();if(!silent)toast(on?`أُزيل «${lbl(r)}» من الوصول السريع`:`ثُبِّت «${lbl(r)}» في الوصول السريع`);refresh();return true}
X.pins=pins;X.togglePin=togglePin;
function move(r,d){const f=pins().slice(),i=f.indexOf(r),j=i+d;if(i<0||j<0||j>=f.length)return;[f[i],f[j]]=[f[j],f[i]];ST.fav=f;sv();refresh()}
/* رسائل المفضلة القديمة (نجمة البطاقات داخل الأقسام) بالاسم الجديد */
try{const _t=window.toast;if(typeof _t==="function"){const M={"أُضيفت للمفضلة في الرئيسية":"ثُبِّتت في الوصول السريع","حُذفت من المفضلة":"أُزيلت من الوصول السريع","المفضلة ٨ ميزات كحد أقصى، احذف واحدة أولًا":"الوصول السريع يتّسع لثمانية أقسام، أزل واحدًا أولًا"};window.toast=function(m){if(M[m]){setTimeout(refresh,30);return _t.call(this,M[m],...[].slice.call(arguments,1))}return _t.apply(this,arguments)}}}catch(e){}

const PIN='<i class="zsx-pin" aria-hidden="true"></i>';
const qt=(r,mu)=>`<a class="zsx-qt${mu?" mu":""}" href="#${r}" data-zr="${r}" ${mu?'title="الأكثر استخدامًا"':""}><span class="zsx-ic">${zi(F[r][1])}</span><b>${esc(lbl(r))}</b></a>`;
function qHTML(){const p=pins(),mu=mostUsed(Math.max(0,Math.min(2,6-p.length)));
 return`<div class="zsx-qh"><h2 class="zsx-h">الوصول السريع</h2><a class="zsx-sb" href="#search" aria-label="ابحث عن قسم">${zi("search")}<span>ابحث عن قسم</span></a><button type="button" class="zsx-edit">تعديل</button></div>
 <nav class="zsx-qr" aria-label="الوصول السريع">${p.map(r=>qt(r)).join("")}${mu.map(r=>qt(r,1)).join("")}${p.length<MAXP?`<button type="button" class="zsx-qt zsx-add zsx-edit" aria-label="أضف قسمًا"><span class="zsx-ic">${zi("plus")}</span><b>أضف</b></button>`:""}</nav>`}

/* ── شبكة الأقسام ── */
const tile=r=>`<a class="zsx-t" href="#${r}" data-zr="${r}"><span class="zsx-ic">${zi(F[r][1])}</span><span class="zsx-l">${esc(lbl(r))}</span>${isPin(r)?PIN:""}</a>`;
function grpHTML(g,pfx){const n=hubN(g.hub);return`<div class="zsx-grp" id="${pfx}-${g.id}"><div class="zsx-grh"><h3>${g.n}</h3><a class="zsx-all" href="#sec/${g.hub}" aria-label="كل أقسام ${hubName(g.hub)}">الكل${n?` <span>${AR2(n)}</span>`:""} ${zi("chev")}</a></div><div class="zsx-tiles">${g.r.map(([r])=>tile(r)).join("")}</div></div>`}
function gHTML(pfx){pfx=pfx||"zsxg";return`<div class="zsx-gh"><h2 class="zsx-h">الأقسام</h2><small>اضغط مطوّلًا على أي قسم لتثبيته في الوصول السريع</small></div>
 <nav class="zsx-jump" aria-label="انتقل إلى مجموعة">${GR.map(g=>`<button type="button" data-jump="${pfx}-${g.id}">${g.n}</button>`).join("")}</nav>${GR.map(g=>grpHTML(g,pfx)).join("")}`}
function hubsHTML(){return`<h2 class="sec">الأقسام التفصيلية</h2><div class="zsx-hubs">${SEC.map(s=>`<a class="zsx-hub" href="#sec/${s.id}"><span class="zsx-ic">${zi(s.i)}</span><span class="grow"><b>${s.n}</b><small>${s.h} · ${AR2(hubN(s.id))} ميزة</small></span>${zi("chev")}</a>`).join("")}</div>`}

/* ── الرئيسية (v5.5.2): وقت الصلاة ← الوصول السريع ← مقاطع زاد ودروس زاد … ، مع «تخصيص الواجهة» ── */
const isHome=()=>{const h=location.hash;return!h||h==="#"||h==="#home"};
/* ── «متابعة من حيث توقفت»: آخر ما فُتح من المصحف والدروس والمقاطع والكتب والمحاضرات (على الجهاز فقط) ── */
const CK=[["quran",/^read\//,"المصحف","quran"],["lesson",/^dorous\/v\//,"دروس زاد","play"],["clip",/^video\//,"مقاطع زاد","play"],["book",/^(book|pdf)\//,"الكتب","library"],["lecture",/^lecture\/(?!auto)[^/]+/,"محضّر المحاضرة","feather"]];
const CT=()=>{const o=S.zcont=S.zcont&&typeof S.zcont==="object"?S.zcont:{};return o};
function contTitle(k,h){const v=document.getElementById("view");if(!v)return"";const lines=(v.innerText||"").split("\n").map(s=>s.trim()).filter(Boolean);
 if(k==="quran"){const s=lines.find(l=>/^سورة\s/.test(l));const p=(h.match(/^read\/p\/(\d+)/)||[])[1];return(s?s.replace(/\s+/g," ").slice(0,30):"المصحف")+(p?" · صفحة "+AR2(+p):"")}
 const hd=[...v.querySelectorAll("h1,h2,h3,.page")].map(e=>(e.innerText||"").replace(/\s+/g," ").replace(/\s*جديد$/,"").trim()).find(t=>t&&!/^(دروس زاد|مقاطع زاد|المكتبة|محضّر المحاضرة|رجوع)$/.test(t));
 if(k==="clip")return hd&&hd.length<70?hd:"آخر مقطع شاهدته";return(hd||"").slice(0,60)}
function contTrack(){try{const h=decodeURIComponent((location.hash||"").slice(1));const c=CK.find(c=>c[1].test(h));if(!c)return;const t=contTitle(c[0],h);if(!t)return;const o=CT(),p=o[c[0]];
 if(p&&p.h===h&&p.t===t){if(Date.now()-p.at>6e4){p.at=Date.now();sv()}return}o[c[0]]={h:h.slice(0,200),t:t.slice(0,80),at:Date.now()};sv()}catch(e){}}
let ctT=0;window.addEventListener("hashchange",()=>{clearTimeout(ctT);ctT=setTimeout(contTrack,2200)});setTimeout(contTrack,2500);
setInterval(()=>{if(document.visibilityState==="visible")contTrack()},6000);
function contHTML(){const o=CT();const it=CK.filter(c=>o[c[0]]&&o[c[0]].h).map(c=>[c,o[c[0]]]).sort((a,b)=>b[1].at-a[1].at).slice(0,3);if(!it.length)return"";
 return`<div class="zhc-h"><h2 class="zsx-h">متابعة من حيث توقفت</h2></div>${it.map(([c,r])=>`<a class="zsx-row zhc-r" href="#${esc(r.h.split("/").map(encodeURIComponent).join("/"))}"><span class="zhe-ic">${zi(c[3])}</span><span class="grow"><small>${c[2]}</small><b>${esc(r.t)}</b></span><em class="zhc-go">تابِع ${zi("chev")}</em></a>`).join("")}`}
function contEl(){const html=contHTML();let el=document.getElementById("zhcont");if(!html){if(el)el.remove();return null}
 if(!el){el=document.createElement("section");el.id="zhcont";el.className="zhc"}if(el.dataset.v!==html.length+"|"+html.slice(-60)){el.innerHTML=html;el.dataset.v=html.length+"|"+html.slice(-60)}return el}
/* ── بطاقة الصلاة: التاريخان الهجري والميلادي ── */
function datesX(){const sky=document.getElementById("zsky");if(!sky||sky.querySelector(".zhd"))return;let hj="",gr="";const d=new Date();
 try{hj=new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura-nu-arab",{day:"numeric",month:"long",year:"numeric"}).format(d).replace(/\s*هـ$/,"")+" هـ"}catch(e){}
 try{gr=new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-arab",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(d)+" م"}catch(e){}
 if(!hj&&!gr)return;const top=sky.querySelector(".top");const el=document.createElement("div");el.className="zhd";el.innerHTML=`<span>${esc(hj)}</span><i></i><span>${esc(gr)}</span>`;top?top.after(el):sky.prepend(el)}
/* ── حجم الخط في الواجهة (لا يمسّ المصحف ولا المقاطع ولا العرض) ── */
const FS=[.92,1,1.08,1.16],FSN=["صغير","عادي","كبير","أكبر"];
function fsApply(){const v=document.getElementById("view");if(!v)return;const r=(location.hash.slice(1)||"home").split("/")[0];const i=(S.zhl&&S.zhl.fs!=null)?+S.zhl.fs:1;const z=FS[i]||1;
 v.style.zoom=(z===1||["read","video","videos","lecture","natiq","car","adhanmode"].includes(r))?"":String(z)}
window.addEventListener("hashchange",()=>setTimeout(fsApply,0));setTimeout(fsApply,50);
/* كتل الرئيسية بترتيبها الافتراضي (ترتيب ٥٫٥٫٠ مع الوصول السريع تحت بطاقة الصلاة) */
const HB=[["prayer","وقت الصلاة","الصلاة القادمة والعدّ التنازلي وموقعك","mosque",()=>document.getElementById("zskyw")],
 ["quick","الوصول السريع","أقسامك المثبّتة والأكثر استخدامًا","star",()=>document.getElementById("zsxq")],
 ["cont","متابعة من حيث توقفت","آخر سورة ودرس ومقطع فتحتها","refresh",()=>contEl()],
 ["clips","مقاطع زاد ودروس زاد","المقاطع والدروس والديوانية والمكتبات","play",()=>document.getElementById("zb6home")],
 ["fquiz","مسابقات العائلة","بطاقة المسابقة: تنافسوا كلٌّ من جواله","trophy",()=>document.getElementById("zqhome")],
 ["season","بطاقة رمضان والمواسم","تظهر في مواسمها فقط","moon",()=>document.getElementById("zb4ram")],
 ["wx","دعاء الطقس","يظهر عند المطر أو الرياح","hands",()=>document.getElementById("zswx")],
 ["rem","التذكيرات والتحديات","تذكيرات الأيام الفاضلة والتحدي الجاري","bell",()=>document.getElementById("zsrem")],
 ["rihla","رحلتي","نقاطك ومستواك","trophy",()=>document.getElementById("zb4ring")],
 ["daily","زادي اليومي","آية اليوم وحديث اليوم","quran",()=>document.getElementById("zadi")],
 ["disc","اكتشف","مختارات من الأقسام","sparkle",()=>document.getElementById("zsdisc")],
 ["share","شارك زاد مع أهلك","صور جاهزة ورابط التحميل","heart",()=>document.getElementById("zsrcard")]];
const HDEF=HB.map(b=>b[0]);
const HL=()=>{const o=S.zhl=S.zhl&&typeof S.zhl==="object"?S.zhl:{};if(!Array.isArray(o.o))o.o=[];if(!Array.isArray(o.h))o.h=[];return o};
function hOrder(){const o=HL(),seen=new Set(),r=[];o.o.forEach(id=>{if(HDEF.includes(id)&&!seen.has(id)){seen.add(id);r.push(id)}});
 /* كتلة جديدة لم يعرفها الترتيب المحفوظ: تُدرج في موضعها الافتراضي */
 HDEF.forEach((id,i)=>{if(seen.has(id))return;let at=r.length;for(let k=i-1;k>=0;k--){const p=r.indexOf(HDEF[k]);if(p>=0){at=p+1;break}}r.splice(at,0,id);seen.add(id)});return r}
const hHidden=id=>HL().h.includes(id);
X.layout={order:hOrder,hidden:hHidden,def:HDEF};
function arrange(){if(!isHome())return;const v=document.getElementById("view");if(!v)return;const hm=v.querySelector(".zhome");if(!hm)return;
 try{datesX()}catch(e){}
 const colA=hm.querySelector(".zcolA")||hm;hm.classList.add("zarr");hm.classList.toggle("zdense",!!HL().d);
 const nt=()=>[v.querySelector(".zpush-nudge"),document.getElementById("zlc")].filter(Boolean);
 const want=[];hOrder().forEach(id=>{const b=HB.find(x=>x[0]===id),el=b&&b[4]();if(!el)return;
  if(id==="rem"){const ch=document.getElementById("zsch");if(ch)want.push([ch,id])}
  want.push([el,id]);
  if(id==="quick")nt().forEach(n=>want.push([n,"push"]))});
 /* إن أُخفي الوصول السريع تبقى التنبيهات (الإشعارات، تحديد الموقع) تحت بطاقة الصلاة */
 if(!want.some(w=>w[1]==="push")){const p=want.findIndex(w=>w[1]==="prayer");want.splice(p>=0?p+1:0,0,...nt().map(n=>[n,"push"]))}
 let cu=document.getElementById("zhcust");if(!cu){cu=document.createElement("a");cu.id="zhcust";cu.className="zh-cust";cu.href="#homeedit";cu.innerHTML=`${zi("sliders")}<span>تخصيص الواجهة</span>`}
 want.push([cu,"cust"]);
 want.forEach(([el,id])=>{const hide=id!=="push"&&id!=="cust"&&hHidden(id==="rem"&&el.id==="zsch"?"rem":id);el.classList.toggle("zh-off",hide)});
 /* لا نحرّك شيئًا إن كان الترتيب صحيحًا (تفاديًا لحلقات المراقبة) */
 const cur=[...colA.children].filter(c=>want.some(w=>w[0]===c));const ok=cur.length===want.length&&cur.every((c,i)=>c===want[i][0])&&colA.firstElementChild===want[0][0];
 if(!ok){let ref=null;for(let i=want.length-1;i>=0;i--){const el=want[i][0];if(ref){if(el.nextElementSibling!==ref||el.parentNode!==colA)colA.insertBefore(el,ref)}else if(el.parentNode!==colA||colA.lastElementChild!==el)colA.appendChild(el);ref=el}}}
X.arrange=arrange;
function homeX(){if(!isHome())return;const v=document.getElementById("view");if(!v)return;const hm=v.querySelector(".zhome");if(!hm)return;
 let q=document.getElementById("zsxq");if(!q){q=document.createElement("section");q.id="zsxq";q.className="zsx-q zsx-in";(hm.querySelector(".zcolA")||hm).prepend(q)}
 if(q.dataset.v!==sig()){q.innerHTML=qHTML();q.dataset.v=sig()}
 /* شبكة «الأقسام» الكبيرة لم تعد في الرئيسية؛ هي في «المزيد» وصفحة الأقسام */
 const og=document.getElementById("zsxg");if(og&&hm.contains(og))og.remove();
 arrange()}
const sig=()=>pins().join(",")+"|"+mostUsed(2).join(",");
X.home=homeX;
function refresh(){document.querySelectorAll(".zsx-q").forEach(q=>{q.innerHTML=qHTML();q.dataset.v=sig()});
 document.querySelectorAll(".zsx-t[data-zr]").forEach(a=>{const on=isPin(a.dataset.zr),has=a.querySelector(".zsx-pin");if(on&&!has)a.insertAdjacentHTML("beforeend",PIN);if(!on&&has)has.remove()});
 const e=document.getElementById("zsxed");if(e)drawEd()}
X.refresh=refresh;
const _home=V.home;if(typeof _home==="function"){V.home=async function(){const r=await _home.apply(this,arguments);try{homeX()}catch(e){console.error(e)}return r}}
/* مراقبة خفيفة: الوحدات المؤجّلة تضيف كتلها لاحقًا، فنعيد الترتيب (بلا تحريك إن كان صحيحًا) */
try{const vw=document.getElementById("view");if(vw&&window.MutationObserver){let t=0,obs=[];const mo=new MutationObserver(()=>{if(t)return;t=requestAnimationFrame(()=>{t=0;if(!isHome())return;const hm=vw.querySelector(".zhome");if(!hm)return;watch(hm);try{homeX()}catch(e){}})});
 const watch=hm=>{if(hm._zhw)return;hm._zhw=1;mo.observe(hm,{childList:true});hm.querySelectorAll(":scope > .zcolA, :scope > .zcolB, #zskyw").forEach(c=>mo.observe(c,{childList:true}))};
 mo.observe(vw,{childList:true})}}catch(e){}
[150,600,1500,3000].forEach(ms=>setTimeout(()=>{try{homeX()}catch(e){}},ms));

/* ── صفحة «تخصيص الواجهة» (#homeedit) ── */
if(!F.homeedit)F.homeedit=["تخصيص الواجهة","sliders","أظهر أو أخفِ كتل الرئيسية وغيّر ترتيبها","تخصيص الرئيسية الواجهة ترتيب إخفاء إظهار تخصيص الشاشة"];
try{const g=GR.find(g=>g.id==="tools")||GR[GR.length-1];if(g&&!g.r.some(x=>x[0]==="homeedit"))g.r.push(["homeedit"])}catch(e){}
function heRows(){const o=hOrder();return o.map((id,i)=>{const b=HB.find(x=>x[0]===id),on=!hHidden(id);return`<li class="zhe-r${on?"":" off"}" data-id="${id}">
 <span class="zhe-h" aria-label="اسحب لتغيير الترتيب" role="button" tabindex="-1">${HGRIP}</span><span class="zhe-ic">${zi(b[3])||zi("star")}</span>
 <span class="grow"><b>${b[1]}</b><small>${b[2]}${id==="cont"&&!contHTML()?" · يظهر بعد أن تقرأ أو تشاهد شيئًا":""}</small></span>
 <span class="zhe-mv"><button type="button" data-mv="-1" aria-label="أعلى"${i===0?" disabled":""}>▲</button><button type="button" data-mv="1" aria-label="أسفل"${i===o.length-1?" disabled":""}>▼</button></span>
 <label class="zhe-sw" aria-label="${on?"إخفاء":"إظهار"} ${b[1]}"><input type="checkbox" data-sw="${id}"${on?" checked":""}><i></i></label></li>`}).join("")}
const HGRIP='<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
function heSave(order){const o=HL();if(order)o.o=order;sv();try{arrange()}catch(e){}}
function heDraw(){const l=document.getElementById("zhel");if(!l)return;l.innerHTML=heRows();const d=HL().d;document.querySelectorAll("#zhed button").forEach(b=>b.classList.toggle("on",(+b.dataset.d||0)===(d?1:0)));const fs=HL().fs!=null?+HL().fs:1;document.querySelectorAll("#zhefs button").forEach(b=>b.classList.toggle("on",+b.dataset.fs===fs))}
V.homeedit=()=>{const v=document.getElementById("view");if(!v)return;
 v.innerHTML=`<button class="back" onclick="history.length>1?history.back():location.hash='home'">${zi("chev")} رجوع</button><h1 class="page">تخصيص الواجهة</h1>
 <p class="k zhe-k">اختر ما يظهر في الرئيسية ورتّبه كما تحب: اسحب من المقبض أو استعمل ▲▼. يُحفظ على جهازك.</p>
 <ul class="zhe-l" id="zhel">${heRows()}</ul>
 <section class="zhe-c"><b>حجم الخط</b><div class="seg" id="zhefs">${FSN.map((t,i)=>`<button type="button" data-fs="${i}">${t}</button>`).join("")}</div><small class="zhe-n">يكبّر نصوص الواجهة والصفحات؛ وللمصحف حجم خاص في الإعدادات.</small></section>
 <section class="zhe-c"><b>كثافة العرض</b><div class="seg" id="zhed"><button type="button" data-d="0">مريحة</button><button type="button" data-d="1">مضغوطة</button></div></section>
 <button type="button" class="zhe-rs" id="zhers">${zi("refresh")||""}استعادة الافتراضي</button>
 <a class="zsx-row" href="#home">${zi("home")}<span>عرض الرئيسية<small>شاهد الترتيب الجديد</small></span>${zi("chev")}</a>`;
 heDraw();const l=document.getElementById("zhel");
 l.addEventListener("change",e=>{const c=e.target.closest("input[data-sw]");if(!c)return;const o=HL(),id=c.dataset.sw;o.h=o.h.filter(x=>x!==id);if(!c.checked)o.h.push(id);heSave();heDraw();try{toast(c.checked?"ستظهر في الرئيسية":"أُخفيت من الرئيسية")}catch(x){}});
 l.addEventListener("click",e=>{const b=e.target.closest("button[data-mv]");if(!b)return;const id=b.closest("li").dataset.id,o=hOrder(),i=o.indexOf(id),j=i+(+b.dataset.mv);if(j<0||j>=o.length)return;o.splice(i,1);o.splice(j,0,id);heSave(o);heDraw();
  const nb=document.querySelector(`#zhel li[data-id="${id}"] button[data-mv="${b.dataset.mv}"]`);try{(nb&&!nb.disabled?nb:document.querySelector(`#zhel li[data-id="${id}"] button[data-mv]:not([disabled])`)).focus()}catch(x){}});
 /* السحب باللمس أو الفأرة من المقبض */
 l.addEventListener("pointerdown",e=>{const h=e.target.closest(".zhe-h");if(!h)return;e.preventDefault();const li=h.closest("li");li.classList.add("drag");
  const mv=ev=>{const y=ev.clientY;const rows=[...l.children].filter(r=>r!==li);let ref=null;for(const r of rows){const rc=r.getBoundingClientRect();if(y<rc.top+rc.height/2){ref=r;break}}if(ref!==li.nextElementSibling)l.insertBefore(li,ref)};
  const up=()=>{window.removeEventListener("pointermove",mv);window.removeEventListener("pointerup",up);window.removeEventListener("pointercancel",up);li.classList.remove("drag");heSave([...l.children].map(r=>r.dataset.id));heDraw();try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}};
  /* على النافذة: نقل الصف في الشجرة يُسقط التقاط المؤشر */window.addEventListener("pointermove",mv);window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up)});
 document.getElementById("zhefs").onclick=e=>{const b=e.target.closest("button[data-fs]");if(!b)return;HL().fs=+b.dataset.fs;heSave();heDraw();fsApply()};
 document.getElementById("zhed").onclick=e=>{const b=e.target.closest("button[data-d]");if(!b)return;HL().d=+b.dataset.d?1:0;heSave();heDraw()};
 document.getElementById("zhers").onclick=()=>{const o=HL();o.o=[];o.h=[];o.d=0;o.fs=1;heSave();heDraw();fsApply();try{toast("تمت استعادة الترتيب الافتراضي")}catch(x){}}};
/* رابط في الإعدادات */
if(V.settings){const _st=V.settings;V.settings=async function(){const r=await _st.apply(this,arguments);try{if(!document.getElementById("zheset")){const v=document.getElementById("view"),h=v&&v.querySelector("h1");if(h){const a=document.createElement("a");a.id="zheset";a.className="zsx-row zhe-set";a.href="#homeedit";a.innerHTML=`${zi("sliders")}<span>تخصيص الواجهة<small>رتّب كتل الرئيسية وأظهر ما تريد منها</small></span>${zi("chev")}`;h.after(a)}}}catch(e){}return r}}

/* ── صفحة «الأقسام» (#sections / #search) ── */
const _sec=V.sections;if(typeof _sec==="function"){V.sections=function(a){const x=_sec.apply(this,arguments);try{
 const i=document.getElementById("zsq");if(i)i.placeholder="ابحث عن قسم… (المصحف، القبلة، المحاضرة)";
 const rest=document.getElementById("zsrest");if(rest){rest.innerHTML=`<section class="zsx-q">${qHTML()}</section><section class="zsx-g">${gHTML("zsxp")}</section>${hubsHTML()}`}
 if(i&&i.value)goRow(i)}catch(e){console.error(e)}return x}}

/* ── البحث: الفتح المباشر ── */
function nameKeys(r){const k=[F[r][0],lbl(r)];if(SYN[r])k.push(...SYN[r].split(/\s+/));return k.map(x=>al(norm(x)))}
const HUBK=SEC.map(s=>({id:s.id,k:[s.n,...s.n.split(/\s+و?/),...s.g.map(g=>g[0])].map(x=>al(norm(x))).filter(x=>x.length>1)}));
function exact(q){const n=al(norm(q));if(!n)return null;
 /* أسماء الأقسام أولًا (المصحف، القبلة…) ثم المرادفات */
 for(const g of GR)for(const [r] of g.r)if(al(norm(F[r][0]))===n||al(norm(lbl(r)))===n)return{r};
 for(const r of Object.keys(F))if(al(norm(F[r][0]))===n)return{r};
 for(const g of GR)for(const [r] of g.r)if(nameKeys(r).includes(n))return{r};
 for(const r of Object.keys(SYN))if(F[r]&&nameKeys(r).includes(n))return{r};
 for(const g of GR)if(al(norm(g.n))===n)return{h:g.hub};
 for(const h of HUBK)if(h.k.includes(n))return{h:h.id};return null}
function best(q){const e=exact(q);if(e)return Object.assign({ex:1},e);let r=[];try{r=ZS.find(q)}catch(x){}return r.length?{r:r[0]}:null}
X.best=best;X.exact=exact;
function hrefOf(b){return b.h?"#sec/"+b.h:"#"+b.r}
function goCard(b){if(b.h){const s=SEC.find(s=>s.id===b.h);if(!s)return"";return`<a class="zsx-go" href="#sec/${s.id}"><span class="zsx-ic">${zi(s.i)}</span><span class="grow"><small>افتح القسم</small><b>${s.n}</b></span>${zi("chev")}</a>`}
 const f=F[b.r];return`<a class="zsx-go" href="#${b.r}"><span class="zsx-ic">${zi(f[1])}</span><span class="grow"><small>${b.ex?"افتح القسم":"أقرب نتيجة"}</small><b>${esc(f[0])}</b></span>${zi("chev")}</a>`}
function goRow(inp){const out=document.getElementById("zsres");if(!out)return;const o=out.querySelector(".zsx-go");o&&o.remove();const q=String(inp.value||"").trim();if(!q)return;const b=best(q);if(!b)return;out.hidden=false;out.insertAdjacentHTML("afterbegin",goCard(b))}
document.addEventListener("input",e=>{const t=e.target;if(!t)return;if(t.id==="zsq")goRow(t);else if(t.id==="zsxs")sheetSearch(t)});
document.addEventListener("keydown",e=>{const t=e.target;if(!t||(t.id!=="zsq"&&t.id!=="zsxs"))return;if(e.key!=="Enter"&&e.keyCode!==13)return;const b=best(t.value);if(!b)return;e.preventDefault();try{t.blur()}catch(x){}sheet(false);location.hash=hrefOf(b).slice(1)});

/* ── لوحة «المزيد» المجمّعة ── */
function sheetHTML(){return`<div class="bd"></div><div class="pn" role="document"><i class="gr"></i>
 <div class="zsx-shh"><h2 class="zsx-h">جميع الأقسام</h2><button type="button" class="zsx-x" aria-label="إغلاق">${zi("x")}</button></div>
 <label class="zsearch zs-search zsx-ss">${zi("search")}<input type="search" id="zsxs" placeholder="ابحث عن قسم…" autocomplete="off" enterkeyhint="go"></label>
 <div id="zsxsr" hidden></div><div id="zsxsb"><section class="zsx-q zsx-qs">${qHTML()}</section><section class="zsx-g">${GR.map(g=>grpHTML(g,"zsxm")).join("")}</section>
 <a class="zsx-row" href="#sections">${zi("hgrid")}<span>الأقسام التفصيلية<small>${AR2(Object.keys(F).length)} ميزة في ${AR2(SEC.length)} أقسام</small></span>${zi("chev")}</a></div></div>`}
function sheetSearch(i){const out=document.getElementById("zsxsr"),body=document.getElementById("zsxsb");if(!out)return;const q=i.value.trim();if(!q){out.hidden=true;out.innerHTML="";body.hidden=false;return}
 let r=[];try{r=ZS.find(q)}catch(e){}const b=best(q);out.hidden=false;body.hidden=true;
 out.innerHTML=(b?goCard(b):"")+(r.length?`<div class="zsx-res">${r.filter(x=>!b||x!==b.r).slice(0,24).map(x=>`<a class="zsx-row" href="#${x}" data-zr="${x}">${zi(F[x][1])}<span>${esc(F[x][0])}<small>${esc(F[x][2]||"")}</small></span>${zi("chev")}</a>`).join("")}</div>`:(b?"":`<p class="znote" style="text-align:center;margin:22px 0">لم نجد قسمًا بهذا الاسم. جرّب: قبلة، دعاء، زكاة</p>`))}
function sheet(open){let s=document.getElementById("zsxsh");if(open===false&&!s)return;
 if(!s){s=document.createElement("div");s.id="zsxsh";s.className="zsxsh";s.setAttribute("role","dialog");s.setAttribute("aria-label","جميع الأقسام");document.body.appendChild(s)}
 const on=open===undefined?!s.classList.contains("on"):open;
 if(on){s.innerHTML=sheetHTML();s.querySelector(".bd").onclick=()=>sheet(false);s.querySelector(".zsx-x").onclick=()=>sheet(false);
  let y0=0;const gr=s.querySelector(".gr"),pn=s.querySelector(".pn");pn.addEventListener("touchstart",e=>{y0=pn.scrollTop<=0?e.touches[0].clientY:-1},{passive:true});pn.addEventListener("touchend",e=>{if(y0>=0&&e.changedTouches[0].clientY-y0>70)sheet(false)},{passive:true});
  requestAnimationFrame(()=>s.classList.add("on"))}else s.classList.remove("on");
 document.documentElement.classList.toggle("zs7lock",on);const c=document.querySelector("#tabs a.ctr");if(c)c.classList.toggle("open",on);
 try{const o=document.getElementById("zs7sh");o&&o.classList.remove("on")}catch(e){}}
X.sheet=sheet;
document.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest("#tabs a.ctr");if(!c)return;e.preventDefault();e.stopPropagation();try{navigator.vibrate&&navigator.vibrate(8)}catch(x){}sheet()},true);
window.addEventListener("hashchange",()=>{sheet(false);setTimeout(()=>{try{homeX()}catch(e){}},60)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")sheet(false)});
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("#zsxsh a[href]");if(a&&!a.target){sheet(false)}});

/* ── تعديل الوصول السريع ── */
function drawEd(){const el=document.getElementById("zsxed");if(!el)return;const p=pins(),q=(document.getElementById("zsxeq")||{}).value||"";
 const list=q.trim()?(()=>{try{return ZS.find(q)}catch(e){return[]}})().slice(0,30):null;
 el.innerHTML=`<div class="zsx-cnt">${AR2(p.length)} من ${AR2(MAXP)}</div>
 ${p.length?`<div class="zsx-pl">${p.map((r,i)=>`<div class="zsx-pi"><span class="zsx-ic">${zi(F[r][1])}</span><b>${esc(lbl(r))}</b><button type="button" data-mv="${r}" data-d="-1" aria-label="تقديم" ${i?"":"disabled"}>▲</button><button type="button" data-mv="${r}" data-d="1" aria-label="تأخير" ${i<p.length-1?"":"disabled"}>▼</button><button type="button" class="rm" data-tg="${r}" aria-label="إزالة">${zi("x")}</button></div>`).join("")}</div>`:`<p class="znote">لا توجد أقسام مثبّتة بعد.</p>`}
 <h3 class="zsx-eh">${list?"نتائج البحث":"أضف من الأقسام"}</h3>
 ${list?`<div class="zsx-tiles">${list.map(r=>edTile(r)).join("")||'<p class="znote">لا نتائج</p>'}</div>`:GR.map(g=>`<div class="zsx-eg"><b>${g.n}</b><div class="zsx-tiles">${g.r.map(([r])=>edTile(r)).join("")}</div></div>`).join("")}`;
 el.querySelectorAll("[data-mv]").forEach(b=>b.onclick=()=>move(b.dataset.mv,+b.dataset.d));
 el.querySelectorAll("[data-tg]").forEach(b=>b.onclick=()=>togglePin(b.dataset.tg,1))}
const edTile=r=>`<button type="button" class="zsx-t zsx-et${isPin(r)?" on":""}" data-tg="${r}" aria-pressed="${isPin(r)}"><span class="zsx-ic">${zi(F[r][1])}</span><span class="zsx-l">${esc(lbl(r))}</span><i class="zsx-ck" aria-hidden="true">${isPin(r)?zi("check"):zi("plus")}</i></button>`;
function editSheet(){if(typeof openSheet!=="function")return;sheet(false);
 openSheet(`<div class="zsx-edw"><b style="font-size:17px">الوصول السريع</b><p class="znote" style="margin:6px 0 10px">ثبّت حتى ثمانية أقسام تظهر أعلى الرئيسية، ورتّبها بالأسهم. يمكنك أيضًا الضغط مطوّلًا على أي قسم.</p>
 <label class="zsearch zs-search">${zi("search")}<input type="search" id="zsxeq" placeholder="ابحث عن قسم لإضافته…" autocomplete="off"></label><div id="zsxed"></div>
 <button type="button" class="zsx-done" onclick="closeSheet()">تم</button></div>`);
 const i=document.getElementById("zsxeq");i&&(i.oninput=drawEd);drawEd()}
X.edit=editSheet;
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".zsx-edit");if(b){e.preventDefault();editSheet()}
 const j=e.target.closest&&e.target.closest("[data-jump]");if(j){const t=document.getElementById(j.dataset.jump);if(t){const rm=matchMedia("(prefers-reduced-motion: reduce)").matches;t.scrollIntoView({behavior:rm?"auto":"smooth",block:"start"});t.classList.remove("zsx-flash");void t.offsetWidth;t.classList.add("zsx-flash")}}});

/* ── الضغط المطوّل للتثبيت ── */
let lp=null;
document.addEventListener("pointerdown",e=>{const a=e.target.closest&&e.target.closest("[data-zr]");if(!a||e.button>0)return;const x=e.clientX,y=e.clientY;
 lp={a,x,y,t:setTimeout(()=>{if(!lp)return;a._lp=Date.now();try{navigator.vibrate&&navigator.vibrate(18)}catch(z){}a.classList.add("zsx-lp");setTimeout(()=>a.classList.remove("zsx-lp"),260);togglePin(a.dataset.zr)},480)}},{passive:true});
const lpCancel=()=>{if(lp){clearTimeout(lp.t);lp=null}};
document.addEventListener("pointermove",e=>{if(lp&&(Math.abs(e.clientX-lp.x)>10||Math.abs(e.clientY-lp.y)>10))lpCancel()},{passive:true});
["pointerup","pointercancel","scroll"].forEach(t=>document.addEventListener(t,lpCancel,{passive:true,capture:true}));
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-zr]");if(a&&a._lp&&Date.now()-a._lp<1500){a._lp=0;e.preventDefault();e.stopPropagation()}},true);
document.addEventListener("contextmenu",e=>{if(e.target.closest&&e.target.closest("[data-zr]"))e.preventDefault()});

/* ── التنسيق ── */
const css=`
.zsx-q{margin:8px 0 6px}.zsx-qh,.zsx-gh,.zsx-grh,.zsx-shh{display:flex;align-items:center;gap:8px}
.zsx-h{font-size:17px;font-weight:800;margin:0;color:#1d2545;flex:1;position:relative;padding-inline-start:12px}
.zsx-h:before{content:"";position:absolute;inset-inline-start:0;top:4px;bottom:4px;width:4px;border-radius:3px;background:#c9a24a}
.zsx-sb{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 12px;border-radius:14px;background:var(--card);border:1px solid var(--line);color:var(--muted)!important;font-size:13px;font-weight:700;text-decoration:none!important}
.zsx-sb svg{width:17px;height:17px}
.zsx-edit:not(.zsx-qt){min-height:40px;min-width:44px;padding:0 12px;border:0;border-radius:14px;background:rgba(52,69,122,.09);color:#34457a;font:inherit;font-size:13.5px;font-weight:800;cursor:pointer}
.zsx-qr{display:flex;gap:8px;overflow-x:auto;padding:10px 2px 6px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none}.zsx-qr::-webkit-scrollbar{display:none}
.zsx-qt{flex:0 0 calc((100% - 32px)/5);min-width:62px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:center;gap:7px;padding:10px 4px 9px;border-radius:20px;background:var(--card);border:1px solid var(--line);box-shadow:0 4px 14px rgba(29,37,69,.06);text-decoration:none!important;color:var(--ink)!important;font:inherit;cursor:pointer;min-height:86px}
.zsx-qt b{font-size:12px;font-weight:800;line-height:1.25;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zsx-qt .zsx-ic{width:44px;height:44px;border-radius:15px;background:linear-gradient(140deg,#34457a,#1d2545);color:#f3dfae;box-shadow:inset 0 0 0 1px rgba(201,162,74,.35)}
.zsx-qt.mu{border-style:dashed}.zsx-qt.mu .zsx-ic{background:rgba(52,69,122,.1);color:#34457a;box-shadow:none}
.zsx-add{border-style:dashed}.zsx-add .zsx-ic{background:transparent!important;color:#34457a!important;box-shadow:inset 0 0 0 1.5px rgba(52,69,122,.35)!important}
.zsx-ic{display:grid;place-items:center;flex:none}.zsx-ic svg{width:23px;height:23px}
.zsx-g{margin:18px 0 8px}.zsx-gh{flex-wrap:wrap}.zsx-gh small{flex-basis:100%;color:var(--muted);font-size:12px;margin-top:2px}
.zsx-jump{display:flex;gap:8px;overflow-x:auto;padding:12px 2px 4px;scrollbar-width:none}.zsx-jump::-webkit-scrollbar{display:none}
.zsx-jump button{flex:none;min-height:38px;padding:0 14px;border-radius:19px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.zsx-jump button:active{background:rgba(52,69,122,.1)}
.zsx-grp{margin-top:16px;scroll-margin-top:12px;border-radius:22px;transition:background .6s}.zsx-flash{background:rgba(201,162,74,.12)}
.zsx-grh h3{flex:1;margin:0;font-size:15px;font-weight:800;color:#34457a}
.zsx-all{display:inline-flex;align-items:center;gap:3px;min-height:44px;padding:0 6px;color:var(--muted)!important;font-size:12.5px;font-weight:700;text-decoration:none!important}
.zsx-all span{background:rgba(52,69,122,.08);border-radius:9px;padding:1px 7px;font-size:11.5px}.zsx-all svg{width:15px;height:15px;transform:scaleX(-1)}
html[dir=rtl] .zsx-all svg,[dir=rtl] .zsx-all svg{transform:none}
.zsx-tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.zsx-t{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;min-height:88px;padding:11px 3px 9px;border-radius:18px;background:var(--card);border:1px solid var(--line);text-decoration:none!important;color:var(--ink)!important;font:inherit;cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;transition:transform .14s ease,box-shadow .2s}
.zsx-t .zsx-ic{width:42px;height:42px;border-radius:14px;background:rgba(52,69,122,.08);color:#34457a}
.zsx-l{font-size:12px;font-weight:700;line-height:1.3;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.zsx-t:active,.zsx-qt:active{transform:scale(.95)}.zsx-lp{transform:scale(1.06)!important;box-shadow:0 0 0 3px rgba(201,162,74,.55)!important}
.zsx-qt,.zsx-qt *,.zsx-t *{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.zsx-pin{position:absolute;top:7px;inset-inline-end:7px;width:9px;height:9px;border-radius:50%;background:#c9a24a;box-shadow:0 0 0 2px var(--card)}
.zsx-hubs{display:grid;gap:8px}.zsx-hub,.zsx-row{display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 12px;border-radius:18px;background:var(--card);border:1px solid var(--line);text-decoration:none!important;color:var(--ink)!important}
.zsx-hub .zsx-ic{width:40px;height:40px;border-radius:13px;background:rgba(52,69,122,.08);color:#34457a}
.zsx-hub b,.zsx-row span b{display:block;font-size:14.5px}.zsx-hub small,.zsx-row small{display:block;color:var(--muted);font-size:12px;font-weight:500;margin-top:1px}
.zsx-hub>svg:last-child,.zsx-row>svg:last-child,.zsx-go>svg:last-child{width:16px;height:16px;color:var(--muted);flex:none}
.zsx-row{margin-top:10px;font-weight:700;font-size:14px}.zsx-row>svg:first-child{width:22px;height:22px;color:#34457a;flex:none}.zsx-row>span{flex:1}
.zsx-res .zsx-row{margin-top:8px}
.zsx-go{display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 14px;margin:4px 0 12px;border-radius:20px;background:linear-gradient(135deg,#34457a,#1d2545);color:#fff!important;text-decoration:none!important;box-shadow:0 8px 22px rgba(29,37,69,.22)}
.zsx-go .zsx-ic{width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.12);color:#f3dfae}.zsx-go small{display:block;font-size:11.5px;opacity:.8}.zsx-go b{display:block;font-size:16px}.zsx-go .grow{flex:1}.zsx-go>svg:last-child{color:#f3dfae!important}
.zsxsh{position:fixed;inset:0;z-index:40;pointer-events:none}.zsxsh .bd{position:absolute;inset:0;background:rgba(13,15,21,.42);opacity:0;transition:opacity .22s}
.zsxsh .pn{position:absolute;inset:auto 0 0 0;max-width:620px;margin:0 auto;max-height:calc(100% - 64px);overflow-y:auto;overscroll-behavior:contain;background:var(--bg);border-radius:28px 28px 0 0;padding:8px 14px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -12px 40px rgba(13,15,21,.28);transform:translateY(40px);opacity:0;transition:transform .3s cubic-bezier(.2,.8,.2,1),opacity .2s}
.zsxsh.on{pointer-events:auto}.zsxsh.on .bd{opacity:1}.zsxsh.on .pn{transform:none;opacity:1}
.zsxsh .gr{display:block;width:40px;height:5px;border-radius:3px;background:var(--line);margin:4px auto 10px}
.zsx-shh{position:sticky;top:-8px;z-index:2;background:var(--bg);padding:6px 0 8px}.zsx-x{width:44px;height:44px;border:0;border-radius:14px;background:var(--card);color:var(--ink);display:grid;place-items:center;cursor:pointer}.zsx-x svg{width:20px;height:20px}
.zsx-ss{margin:2px 0 4px}.zsx-qs .zsx-qh .zsx-sb{display:none}.zsxsh .zsx-g{margin-top:6px}
.zsx-pl{display:grid;gap:8px;margin:8px 0 4px}.zsx-pi{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:16px;background:var(--card);border:1px solid var(--line)}
.zsx-pi .zsx-ic{width:38px;height:38px;border-radius:12px;background:linear-gradient(140deg,#34457a,#1d2545);color:#f3dfae}.zsx-pi .zsx-ic svg{width:20px;height:20px}.zsx-pi b{flex:1;font-size:14px}
.zsx-pi button{width:44px;height:44px;border:0;border-radius:12px;background:rgba(52,69,122,.07);color:#34457a;font-size:14px;cursor:pointer;display:grid;place-items:center}.zsx-pi button:disabled{opacity:.3}.zsx-pi .rm{color:#b04a3a;background:rgba(176,74,58,.08)}.zsx-pi .rm svg{width:18px;height:18px}
.zsx-cnt{color:var(--muted);font-size:12.5px;margin-top:10px}.zsx-eh{font-size:14px;margin:16px 0 8px;color:#34457a}.zsx-eg{margin-bottom:12px}.zsx-eg>b{display:block;font-size:13px;margin:4px 0 8px;color:var(--muted)}
.zsx-et .zsx-ck{position:absolute;top:6px;inset-inline-end:6px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:rgba(52,69,122,.1);color:#34457a}.zsx-et .zsx-ck svg{width:13px;height:13px}
.zsx-et.on{border-color:#34457a;box-shadow:inset 0 0 0 1px #34457a}.zsx-et.on .zsx-ck{background:#34457a;color:#fff}
.zsx-done{display:block;width:100%;min-height:48px;margin:14px 0 4px;border:0;border-radius:16px;background:#34457a;color:#fff;font:inherit;font-size:16px;font-weight:800;cursor:pointer}
#zsfav{display:none!important}
@media (prefers-reduced-motion:no-preference){.zsx-in .zsx-qt,.zsx-in .zsx-grp{animation:zsxUp .32s cubic-bezier(.2,.8,.2,1) both}.zsx-in .zsx-grp:nth-of-type(n+3){animation-delay:.04s}.zsx-in .zsx-grp:nth-of-type(n+5){animation-delay:.08s}}
@keyframes zsxUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media (min-width:700px){.zsx-tiles{grid-template-columns:repeat(4,1fr)}}
/* شريط التنقل: الحالة النشطة بالكحلي، والزر الأوسط بالكحلي والذهبي */
.zs7 a .l{font-size:11px}
.zs7 a.ctr .b{background:linear-gradient(140deg,#34457a,#1d2545)!important;color:#f3dfae!important;box-shadow:0 8px 20px rgba(29,37,69,.35)!important}
.zs7 a.ctr.on,nav.tabs.zs7 a.ctr.open{color:#34457a!important}
.zs7 .zs7pill{background:linear-gradient(180deg,rgba(52,69,122,.16),rgba(52,69,122,.08))!important}
.zs7 .zs6dot{background:#c9a24a!important}
/* الوضع الليلي */
html[data-theme=dark] .zsx-h,html[data-theme=dark] .zsx-grh h3,html[data-theme=dark] .zsx-eh{color:#e8ecf8}
html[data-theme=dark] .zsx-t .zsx-ic,html[data-theme=dark] .zsx-hub .zsx-ic,html[data-theme=dark] .zsx-qt.mu .zsx-ic{background:rgba(201,162,74,.12);color:#e3c27c}
html[data-theme=dark] .zsx-qt .zsx-ic,html[data-theme=dark] .zsx-pi .zsx-ic{background:linear-gradient(140deg,#3d4f8c,#253058);color:#f3dfae}
html[data-theme=dark] .zsx-add .zsx-ic{color:#e3c27c!important;box-shadow:inset 0 0 0 1.5px rgba(227,194,124,.4)!important}
html[data-theme=dark] .zsx-edit:not(.zsx-qt),html[data-theme=dark] .zsx-pi button{background:rgba(201,162,74,.14);color:#e3c27c}
html[data-theme=dark] .zsx-all span{background:rgba(255,255,255,.08)}html[data-theme=dark] .zsx-row>svg:first-child{color:#e3c27c}
html[data-theme=dark] .zsx-qt,html[data-theme=dark] .zsx-t{box-shadow:none}
html[data-theme=dark] .zsx-et.on{border-color:#e3c27c;box-shadow:inset 0 0 0 1px #e3c27c}html[data-theme=dark] .zsx-et.on .zsx-ck{background:#e3c27c;color:#1d2545}html[data-theme=dark] .zsx-et .zsx-ck{color:#e3c27c;background:rgba(201,162,74,.14)}
html[data-theme=dark] .zsx-done{background:#e3c27c;color:#1d2545}
html[data-theme=dark] .zs7 a.on{color:#e8ecf8!important}html[data-theme=dark] .zs7 .zs7pill{background:linear-gradient(180deg,rgba(120,142,214,.32),rgba(120,142,214,.16))!important}
html[data-theme=dark] .zs7 a.ctr.on,html[data-theme=dark] nav.tabs.zs7 a.ctr.open{color:#e3c27c!important}
html[data-theme=dark] .zsx-jump button:active{background:rgba(255,255,255,.08)}
/* v5.5.2: الرئيسية المرتّبة + «تخصيص الواجهة» */
@media (min-width:1000px){.zhome.zarr{display:block;max-width:760px;margin-inline:auto}}
.zhome.zarr .zh-off{display:none!important}
.zhome.zarr #zsxq{margin-top:14px}
.zhome.zarr .zpush-nudge{position:relative;gap:10px;padding:8px 12px;border-radius:14px;margin-top:10px;min-height:44px}
.zhome.zarr .zpush-nudge svg{width:18px;height:18px}.zhome.zarr .zpush-nudge b{font-size:13px;font-weight:700;line-height:1.5}.zhome.zarr .zpush-nudge small{display:none}
.zhome.zarr #zlc{margin-top:10px}
.zhome.zarr .zpush-nudge .zx{flex:none;margin-inline-start:auto;width:32px;height:32px;border:0;border-radius:10px;background:transparent;color:var(--muted);font-size:20px;cursor:pointer}
.zh-cust{display:flex;align-items:center;justify-content:center;gap:6px;width:max-content;margin:18px auto 0;min-height:40px;padding:6px 16px;border-radius:999px;color:var(--muted)!important;text-decoration:none!important;font-size:13px;font-weight:700;border:1px dashed var(--line)}
.zh-cust svg{width:16px;height:16px}
.zhome.zdense .zcard,.zhome.zdense .zbanner{margin-top:8px!important}.zhome.zdense .zb6home{gap:8px;margin:8px 0}.zhome.zdense .zb6home a{min-height:84px;padding:11px 10px}.zhome.zdense #zsxq{margin-top:8px}
.zhe-k{margin-bottom:12px}
.zhe-l{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.zhe-r{display:flex;align-items:center;gap:10px;min-height:62px;padding:8px 10px;border-radius:18px;background:var(--card);border:1px solid var(--line);touch-action:pan-y;transition:box-shadow .2s,transform .2s,opacity .2s}
.zhe-r.off{opacity:.55}.zhe-r.drag{box-shadow:0 10px 26px rgba(29,37,69,.22);transform:scale(1.02);z-index:2;position:relative}
.zhe-h{display:grid;place-items:center;width:30px;height:44px;color:var(--muted);cursor:grab;touch-action:none;flex:none}
.zhe-ic{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:rgba(52,69,122,.09);color:#34457a;flex:none}.zhe-ic svg{width:20px;height:20px}
.zhe-r .grow{flex:1;min-width:0}.zhe-r b{display:block;font-size:14.5px}.zhe-r small{display:block;color:var(--muted);font-size:12px;margin-top:1px}
.zhe-mv{display:flex;flex-direction:column;gap:2px;flex:none}.zhe-mv button{width:34px;height:24px;border:0;border-radius:8px;background:rgba(52,69,122,.08);color:#34457a;font-size:11px;cursor:pointer;padding:0}.zhe-mv button:disabled{opacity:.3;cursor:default}
.zhe-sw{position:relative;flex:none;width:48px;height:30px;cursor:pointer}.zhe-sw input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}
.zhe-sw i{position:absolute;inset:0;border-radius:15px;background:#c9ccd6;transition:background .2s;pointer-events:none}.zhe-sw i:after{content:"";position:absolute;top:3px;right:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
.zhe-sw input:checked+i{background:#34457a}.zhe-sw input:checked+i:after{transform:translateX(-18px)}.zhe-sw input:focus-visible+i{outline:2px solid #c9a24a;outline-offset:2px}
.zhe-c{margin-top:16px;padding:12px;border-radius:18px;background:var(--card);border:1px solid var(--line)}.zhe-c b{display:block;margin-bottom:8px;font-size:14px}
.zhe-c .seg{display:flex;gap:6px}.zhe-c .seg button{flex:1;min-height:44px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-weight:700;cursor:pointer}.zhe-c .seg button.on{background:#34457a;border-color:#34457a;color:#fff}
.zhe-rs{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin-top:14px;border-radius:16px;border:1.5px solid #34457a;background:transparent;color:#34457a;font:inherit;font-size:15px;font-weight:800;cursor:pointer}.zhe-rs svg{width:18px;height:18px}
.zhe-set{margin:0 0 12px}
html[data-theme=dark] .zhe-ic,html[data-theme=dark] .zhe-mv button{background:rgba(201,162,74,.14);color:#e3c27c}
html[data-theme=dark] .zhe-sw i{background:#3a3f52}html[data-theme=dark] .zhe-sw input:checked+i{background:#c9a24a}
html[data-theme=dark] .zhe-c .seg button.on{background:#e3c27c;border-color:#e3c27c;color:#1d2545}
html[data-theme=dark] .zhe-rs{border-color:#e3c27c;color:#e3c27c}
/* v5.5.3: التاريخان في بطاقة الصلاة، «متابعة من حيث توقفت»، تنسيق موحّد وتحميل أنعم */
.zsky .zhd{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:8px 0 2px;font-size:12.5px;font-weight:700;opacity:.92}.zsky .zhd i{width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.6}
.zhc{margin-top:14px}.zhc-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}
.zhc .zhc-r{margin-top:8px;min-height:60px}.zhc-r .grow{flex:1;min-width:0}.zhc-r b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zhc-r small{margin:0 0 1px!important}
.zhc-go{display:flex;align-items:center;gap:2px;flex:none;font-style:normal;font-size:12.5px;font-weight:800;color:#34457a}.zhc-go svg{width:14px!important;height:14px!important;color:inherit!important}
html[data-theme=dark] .zhc-go{color:#e3c27c}
.zhe-n{display:block;margin-top:8px;color:var(--muted);font-size:12px}
.zhome.zarr .zcolA>.zcard,.zhome.zarr .zcolA>#zsrcard,.zhome.zarr .zcolA>#zadi{margin-top:12px;border-radius:20px}
.zhome.zarr .zcolA>*{min-width:0}
@media (prefers-reduced-motion:no-preference){.zhome.zarr .zcolA>*:not(.zh-off){animation:zhIn .38s cubic-bezier(.2,.8,.2,1) both}.zhome.zarr .zcolA>*:nth-child(n+4){animation-delay:.05s}.zhome.zarr .zcolA>*:nth-child(n+7){animation-delay:.1s}}
@keyframes zhIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`;
try{const s=document.createElement("style");s.id="zsx-css";s.textContent=css;document.head.appendChild(s)}catch(e){}
}();
