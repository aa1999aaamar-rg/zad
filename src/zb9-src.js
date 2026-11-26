/* زاد v5.3 — lazy module on zad-content (/x/zb9.js), loaded by site/zs.js.
   1) «الدرر السنية» (#dorar): a hub of Dorar's encyclopedias that open dorar.net itself in a full-screen in-app viewer (iframe; dorar.net sends no
      X-Frame-Options / frame-ancestors, checked 2026-10-26) with «فتح في المتصفح». Nothing of Dorar is copied or rehosted.
   2) «تحقق من حديث» (#hcheck): the text is stripped of tashkeel and sent to the زاد server (/api/dorar → dorar.net's public API, 7-day cache);
      every grade shown is Dorar's «خلاصة حكم المحدث» verbatim. Colour = the wording of that grade (no ruling of ours).
   3) «بلّغ ولو آية» (#balligh): verses (api.quran.com Uthmani) + sahih/hasan hadith cut verbatim from sunnah.com, as share cards (canvas 1080×1080 /
      1080×1920, 8 templates, vector ornaments only). Data: /x/balligh.json. */
(function(){'use strict';if(window.ZB9)return;
const ZC=(window.ZS&&ZS.ZC)||'https://zad-content.sites.tab.bot/x/';
const zi=(k,c)=>window.ZS&&ZS.zi?ZS.zi(k,c):'',ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sv=()=>{try{save()}catch(e){}},tst=m=>{try{toast(m)}catch(e){}};
const APPN=()=>window.APP_NAME||'زاد',LINK='https://zad.sites.tab.bot/';
const strip=s=>String(s||'').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'');
const norm=s=>strip(s).replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\u0621-\u064A0-9a-z ]+/gi,' ').replace(/\s+/g,' ').trim().toLowerCase();
const ST=S.zb9=Object.assign({fav:[],tpl:'zad',sz:'sq',day:'v'},S.zb9||{});if(!Array.isArray(ST.fav))ST.fav=[];
const SVG=(p,sw)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw||1.7}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC={
 book:'<path d="M12 6.5C10 5 7 4.6 4 5v13c3-.4 6 0 8 1.5 2-1.5 5-1.9 8-1.5V5c-3-.4-6 0-8 1.5z"/><path d="M12 6.5V19"/>',
 scroll:'<path d="M7 4h11a2 2 0 0 1 2 2v1h-4"/><path d="M16 7v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1h10v1"/><path d="M7 4a2 2 0 0 0-2 2v11"/><path d="M9 9h4M9 12h4"/>',
 star:'<path d="M12 2.5l2.6 3.6 4.4-.6-.6 4.4 3.6 2.6-3.6 2.6.6 4.4-4.4-.6L12 21.5l-2.6-3.6-4.4.6.6-4.4L2 12.5l3.6-2.6-.6-4.4 4.4.6z"/><circle cx="12" cy="12.2" r="3"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.6 5.7 3.6 9s-1.1 6.3-3.6 9c-2.5-2.7-3.6-5.7-3.6-9S9.5 5.7 12 3z"/>',
 branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 4-5 4-11 7"/>',
 scale:'<path d="M12 4v16M7 20h10M5 7h14M12 4l-1 3h2z"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
 grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
 heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
 hour:'<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>',
 pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
 alert:'<path d="M12 3l10 17H2z"/><path d="M12 10v4M12 17.5v.01"/>',
 beads:'<circle cx="12" cy="5" r="2"/><circle cx="18" cy="9" r="2"/><circle cx="17" cy="16" r="2"/><circle cx="7" cy="16" r="2"/><circle cx="6" cy="9" r="2"/><path d="M12 18v3"/>',
 gem:'<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
 check:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/><path d="M8.3 11l2 2 3.5-3.6"/>',
 ext:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 reload:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>',
 share:'<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
 wa:'<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .8a5 5 0 0 1-2.2-2.2l.8-1-1-2z"/>',
 dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
 fav:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'
};
const ic=(k,sw)=>SVG(IC[k]||IC.star,sw);
const ENC=[
 ['hadith','الموسوعة الحديثية','ابحث في الأحاديث واعرف أحكام المحدثين عليها','scroll','#34457a'],
 ['tafseer','موسوعة التفسير','تفسير آيات القرآن الكريم سورةً سورة','book','#2f4f5f'],
 ['aqeeda','الموسوعة العقدية','مسائل العقيدة مرتّبة مع أدلتها','star','#1d2545'],
 ['feqhia','الموسوعة الفقهية','أبواب الفقه من الطهارة إلى المعاملات','scale','#c0693f'],
 ['alakhlaq','موسوعة الأخلاق والسلوك','الأخلاق الفاضلة وما يضادّها','heart','#a8742a'],
 ['aadab','موسوعة الآداب الشرعية','آداب المسلم في يومه وليلته','sparkle','#4f5e2f'],
 ['history','الموسوعة التاريخية','السيرة النبوية والتاريخ الإسلامي','hour','#6a3f6e'],
 ['adyan','موسوعة الأديان','تعريف بالأديان والملل','globe','#2f4f5f'],
 ['frq','موسوعة الفرق','الفرق والمذاهب المنتسبة إلى الإسلام','branch','#5c5c5c'],
 ['osolfeqh','موسوعة أصول الفقه','قواعد فهم الأدلة واستنباط الأحكام','layers','#34457a'],
 ['qfiqhia','موسوعة القواعد الفقهية','القواعد الكلية في الفقه وتطبيقاتها','grid','#8a4426'],
 ['arabia','موسوعة اللغة العربية','النحو والصرف والبلاغة','pen','#1d2545'],
 ['fake-hadith','أحاديث منتشرة لا تصح','أحاديث مشهورة على الألسنة ولم تثبت','alert','#9a3b2f'],
 ['azkar','منصة الأذكار والأدعية','أذكار وأدعية من موقع الدرر','beads','#4f5e2f'],
 ['selection','نفائس الموسوعات','مختارات من موسوعات الدرر','gem','#a8742a']
];
const CREDIT='<p class="z9src">المصدر: موقع الدرر السنية <a href="https://dorar.net/" target="_blank" rel="noopener">dorar.net</a></p>';
const css=`
.z9h{display:flex;align-items:center;gap:10px;margin:6px 0 12px}.z9h h1{margin:0;font-size:22px}.z9h .z9lg{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#34457a,#1d2545);flex:none}.z9h .z9lg svg,.z9q svg,.z9ec svg,.z9b svg{width:22px;height:22px}
.z9src{font-size:12px;color:var(--muted);text-align:center;margin:14px 0 6px}.z9src a{color:inherit}
.z9grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.z9ec{display:flex;flex-direction:column;gap:4px;padding:13px 12px;border-radius:18px;background:var(--card,#fff);border:1px solid var(--line,#e6e1d6);text-decoration:none;color:inherit;min-height:112px;position:relative}
.z9ec .z9q{width:40px;height:40px;border-radius:13px;display:grid;place-items:center;color:#fff;margin-bottom:4px}.z9ec b{font-size:14.5px;line-height:1.4}.z9ec small{font-size:11.5px;color:var(--muted);line-height:1.55}.z9ec.wide{grid-column:1/-1;flex-direction:row;align-items:center;min-height:0;gap:12px}
.z9chk{background:linear-gradient(135deg,#34457a,#1d2545);color:#fff;border-radius:20px;padding:14px;margin:0 0 14px;box-shadow:0 8px 22px rgba(29,37,69,.18)}.z9chk b{font-size:16px;display:flex;align-items:center;gap:6px}.z9chk b svg,.z9day .go svg{width:18px;height:18px;flex:none}.z9chk small{display:block;opacity:.85;font-size:12px;margin:2px 0 10px}
.z9in{display:flex;gap:8px}.z9in input{flex:1;min-width:0;border-radius:14px;border:1px solid rgba(0,0,0,.08);padding:12px;font:inherit;font-size:15px;background:#fff;color:#1d2545}.z9in button{border:0;border-radius:14px;padding:0 16px;font:inherit;font-weight:700;background:#c0693f;color:#fff}
.z9res{display:flex;flex-direction:column;gap:10px;margin-top:12px}.z9r{background:var(--card,#fff);border:1px solid var(--line,#e6e1d6);border-inline-start:5px solid #b98a2e;border-radius:16px;padding:12px 13px}.z9r.g{border-inline-start-color:#2e7d4f}.z9r.r{border-inline-start-color:#b3412f}
.z9r .t{font-family:Amiri,serif;font-size:19px;line-height:1.9;margin:0 0 8px;color:var(--ink,#1d2545)}.z9r dl{display:grid;grid-template-columns:auto 1fr;gap:3px 8px;margin:0;font-size:12.5px}.z9r dt{color:var(--muted)}.z9r dd{margin:0}
.z9gr{display:inline-block;margin-top:8px;padding:5px 10px;border-radius:10px;font-size:13px;font-weight:700;background:#f6ecd6;color:#7a5512}.z9r.g .z9gr{background:#e3f1e8;color:#1f5e3a}.z9r.r .z9gr{background:#f8e2de;color:#8c2d1f}
.z9r .lk{display:inline-flex;gap:4px;align-items:center;font-size:12.5px;margin-top:8px;margin-inline-start:8px;color:#34457a}.z9r .lk svg{width:14px;height:14px}
.z9leg{display:flex;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--muted);margin:8px 2px 0}.z9leg i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-inline-end:4px;vertical-align:-1px}
.z9more{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px;padding:11px;border-radius:14px;border:1px dashed #34457a;color:#34457a;text-decoration:none;font-weight:700}.z9more svg{width:16px;height:16px}
.z9ov{position:fixed;inset:0;z-index:2147483000;background:#f6f4ef;display:flex;flex-direction:column}.z9ov .bar{display:flex;align-items:center;gap:6px;padding:calc(env(safe-area-inset-top) + 8px) 10px 8px;background:#1d2545;color:#fff}.z9ov .bar b{flex:1;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.z9ov .bar button,.z9ov .bar a{background:rgba(255,255,255,.12);color:#fff;border:0;border-radius:12px;height:38px;min-width:38px;display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:0 10px;font:inherit;font-size:13px;text-decoration:none}.z9ov .bar svg{width:18px;height:18px}
.z9ov .nt{font-size:11.5px;background:#fff6e9;color:#7a5512;padding:6px 12px;text-align:center}.z9ov iframe{flex:1;border:0;width:100%;background:#fff}.z9ov .fb{position:absolute;inset:auto 12px 20px;background:#fff;border-radius:16px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.2);text-align:center;font-size:14px}
.z9day{border-radius:22px;padding:16px;color:#fff;background:linear-gradient(135deg,#1d2545,#34457a);position:relative;overflow:hidden;margin-bottom:12px}.z9day .tb{display:flex;gap:6px;margin-bottom:10px}.z9day .tb button{border:0;border-radius:99px;padding:5px 12px;font:inherit;font-size:12.5px;background:rgba(255,255,255,.14);color:#fff}.z9day .tb button.on{background:#c0693f}
.z9day .tx{font-size:21px;line-height:2;margin:0}.z9day .tx.q{font-family:"Amiri Quran",Amiri,serif}.z9day .tx.h{font-family:Amiri,serif}.z9day small{display:block;opacity:.85;margin-top:6px;font-size:12.5px}.z9day .go{display:inline-flex;align-items:center;gap:6px;margin-top:10px;background:#fff;color:#1d2545;border-radius:12px;padding:8px 12px;text-decoration:none;font-weight:700;font-size:13px}
.z9day svg.orn{position:absolute;inset-inline-start:-30px;top:-30px;width:150px;height:150px;opacity:.12;color:#fff}
.z9chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}.z9chips::-webkit-scrollbar{display:none}.z9chips a{flex:none;padding:7px 13px;border-radius:99px;border:1px solid var(--line,#e6e1d6);background:var(--card,#fff);color:inherit;text-decoration:none;font-size:13px}.z9chips a.on{background:#34457a;color:#fff;border-color:#34457a}
.z9srch{display:flex;gap:8px;margin-bottom:10px}.z9srch input{flex:1;min-width:0;border-radius:14px;border:1px solid var(--line,#e6e1d6);padding:11px 12px;font:inherit;background:var(--card,#fff);color:inherit}
.z9list{display:flex;flex-direction:column;gap:10px}.z9it{display:block;text-decoration:none;color:inherit;background:var(--card,#fff);border:1px solid var(--line,#e6e1d6);border-radius:18px;padding:13px 14px;position:relative}.z9it .k{font-size:11.5px;color:#c0693f;font-weight:700}.z9it p{margin:4px 0 4px;font-size:18px;line-height:1.95}.z9it p.q{font-family:"Amiri Quran",Amiri,serif}.z9it p.h{font-family:Amiri,serif}.z9it small{color:var(--muted);font-size:12px}.z9it .hf{position:absolute;top:10px;inset-inline-end:12px;color:#c0693f;font-size:15px}
.z9pv{border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(29,37,69,.18);background:#ddd;margin:0 auto 12px;max-width:340px}.z9pv canvas{display:block;width:100%;height:auto}
.z9tp{display:flex;gap:8px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none}.z9tp::-webkit-scrollbar{display:none}.z9tp button{flex:none;width:52px;height:52px;border-radius:14px;border:2px solid transparent;padding:0;cursor:pointer}.z9tp button.on{border-color:#c0693f;box-shadow:0 0 0 2px #fff inset}
.z9seg{display:flex;background:var(--line,#ebe6db);border-radius:12px;padding:3px;margin-bottom:10px}.z9seg button{flex:1;border:0;background:transparent;border-radius:10px;padding:8px;font:inherit;font-size:13px;color:inherit}.z9seg button.on{background:var(--card,#fff);font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.z9acts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.z9b{display:flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:14px;padding:12px;font:inherit;font-weight:700;font-size:14px;background:#34457a;color:#fff;text-decoration:none;cursor:pointer}.z9b.w{background:#1f7a4d}.z9b.l{background:var(--card,#fff);color:inherit;border:1px solid var(--line,#e6e1d6)}.z9b.full{grid-column:1/-1;background:#c0693f}.z9b svg{width:18px;height:18px}
.z9meta{font-size:12.5px;color:var(--muted);text-align:center;margin:-2px 0 12px}.z9meta a{color:inherit}
body.dark .z9in input{background:#1b1f2b;color:#eee}body.dark .z9ov{background:#0d0f15}
`;
(()=>{if(document.getElementById('z9css'))return;const s=document.createElement('style');s.id='z9css';s.textContent=css;document.head.appendChild(s)})();
const ORN='<svg class="orn" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2"><rect x="20" y="20" width="60" height="60"/><rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="18"/><circle cx="50" cy="50" r="40"/></svg>';
/* =========== 1) الدرر السنية =========== */
function dorar(a){
 const p=String(a||'').split('/');
 if(p[0]==='e'&&p[1]){return openEnc(decodeURIComponent(p.slice(1).join('/')))}
 view.innerHTML=`<div class="z9h"><span class="z9lg">${ic('scroll')}</span><div><h1>الدرر السنية</h1><small class="muted">موسوعات علمية موثّقة — تفتح من موقع الدرر داخل التطبيق</small></div></div>
 ${chkBox('')}
 <div class="z9grid">${ENC.map(e=>`<a class="z9ec" href="#dorar/e/${e[0]}"><span class="z9q" style="background:${e[4]}">${ic(e[3])}</span><b>${esc(e[1])}</b><small>${esc(e[2])}</small></a>`).join('')}
 <a class="z9ec wide" href="#balligh"><span class="z9q" style="background:#c0693f">${ic('share')}</span><span class="grow"><b>بلّغ ولو آية</b><small style="display:block">آيات وأحاديث صحيحة بتصاميم جاهزة للنشر</small></span>${zi('chev','chv')}</a></div>
 <p class="znote" style="margin-top:12px;font-size:12px">كل موسوعة تفتح من موقع الدرر نفسه (يفتح موقع الدرر). المحتوى وحقوقه لموقع الدرر السنية.</p>${CREDIT}`;
 bindChk();
}
let ovOff=null;
function closeOv(){const o=document.getElementById('z9ov');if(o)o.remove();if(ovOff){window.removeEventListener('hashchange',ovOff);ovOff=null}document.documentElement.style.overflow=''}
function openEnc(slug){
 const e=ENC.find(x=>x[0]===slug)||[slug,'موقع الدرر السنية','','scroll'];
 const url='https://dorar.net/'+slug.replace(/[^a-z0-9\-\/]/gi,'');
 dorar('');closeOv();
 const o=document.createElement('div');o.id='z9ov';o.className='z9ov';o.setAttribute('role','dialog');
 o.innerHTML=`<div class="bar"><button data-x aria-label="إغلاق">${ic('x',2)}</button><b>${esc(e[1])}</b><button data-r aria-label="إعادة تحميل">${ic('reload',2)}</button><a href="${url}" target="_blank" rel="noopener">${ic('ext',2)} المتصفح</a></div><div class="nt">يفتح موقع الدرر السنية (dorar.net) داخل التطبيق — المحتوى لموقع الدرر</div><iframe src="${url}" title="${esc(e[1])}" referrerpolicy="strict-origin-when-cross-origin" allow="clipboard-write; fullscreen"></iframe>`;
 document.body.appendChild(o);document.documentElement.style.overflow='hidden';
 const fr=o.querySelector('iframe');let ok=false;fr.onload=()=>{ok=true;const f=o.querySelector('.fb');if(f)f.remove()};
 setTimeout(()=>{if(!ok&&document.body.contains(o)){const f=document.createElement('div');f.className='fb';f.innerHTML=`ألم تُفتح الصفحة؟<br><a class="z9b" style="margin-top:10px" href="${url}" target="_blank" rel="noopener">${ic('ext')} افتح موقع الدرر في المتصفح</a>`;o.appendChild(f)}},15000);
 o.querySelector('[data-x]').onclick=()=>{history.length>1?history.back():(location.hash='#dorar')};
 o.querySelector('[data-r]').onclick=()=>{ok=false;fr.src=url};
 setTimeout(()=>{ovOff=()=>{if(!/^#dorar\/e\//.test(location.hash))closeOv()};window.addEventListener('hashchange',ovOff)},0);
}
/* =========== 2) تحقق من حديث =========== */
function chkBox(q){return `<div class="z9chk"><b>${ic('check',2)} تحقق من حديث</b><small>اكتب جزءًا من الحديث ويظهر لك حكمه من الموسوعة الحديثية في الدرر</small><form class="z9in" data-z9f><input type="search" name="q" value="${esc(q)}" placeholder="مثال: إنما الأعمال بالنيات" enterkeyhint="search" autocomplete="off" maxlength="160"><button type="submit">تحقق</button></form></div>`}
function bindChk(){const f=$('[data-z9f]',view);if(!f)return;f.onsubmit=ev=>{ev.preventDefault();const q=strip(f.q.value).trim();if(q.replace(/\s/g,'').length<3){tst('اكتب ٣ أحرف على الأقل');return}location.hash='#hcheck/'+encodeURIComponent(q)}}
const MEMO=new Map();
const gcls=g=>{g=String(g||'');if(/موضوع|باطل|لا أصل|ليس له أصل|كذب|منكر|ضعيف|ضعّف|لا يصح|لم يصح|لا يثبت|لم يثبت|شاذ|واه|منقطع|ليس بصحيح|ليس بثابت|خطأ|متروك|مرسل/.test(g))return'r';if(/صحيح|حسن|ثابت|ثبت|متفق|جيد|قوي|صالح/.test(g))return'g';return'a'};
async function lookup(q){q=strip(q).replace(/\s+/g,' ').trim();if(MEMO.has(q))return MEMO.get(q);const t0=performance.now();
 const c=new AbortController();const tm=setTimeout(()=>c.abort(),20000);
 try{const r=await fetch('/api/dorar?q='+encodeURIComponent(q),{signal:c.signal});const j=await r.json();j.cms=Math.round(performance.now()-t0);if(j.ok)MEMO.set(q,j);return j}catch(e){return{ok:false,error:'net',more:'https://dorar.net/hadith/search?q='+encodeURIComponent(q)}}finally{clearTimeout(tm)}}
async function hcheck(a){
 const q=decodeURIComponent(String(a||'')).trim();
 view.innerHTML=`<div class="z9h"><span class="z9lg">${ic('check')}</span><div><h1>تحقق من حديث</h1><small class="muted">الأحكام منقولة كما هي من الموسوعة الحديثية — الدرر السنية</small></div></div>${chkBox(q)}<div id="z9out"></div>${CREDIT}`;
 bindChk();const out=$('#z9out');
 if(!q){out.innerHTML=`<div class="z9leg"><span><i style="background:#2e7d4f"></i>صحيح/حسن في نص الحكم</span><span><i style="background:#b98a2e"></i>غير ذلك — اقرأ الحكم</span><span><i style="background:#b3412f"></i>ضعيف/لا يصح/موضوع في نص الحكم</span></div><p class="znote" style="font-size:12.5px;margin-top:12px">التطبيق لا يحكم على الأحاديث؛ يعرض لك حكم المحدّث كما في موسوعة الدرر، واللون يتبع كلمات ذلك الحكم.</p>`;setTimeout(()=>{try{$('[data-z9f] input',view).focus()}catch(e){}},200);return}
 const more='https://dorar.net/hadith/search?q='+encodeURIComponent(q);
 out.innerHTML='<p class="znote" style="text-align:center;margin:24px 0">جارٍ البحث في الدرر…</p>';
 const j=await lookup(q);if(!document.body.contains(out))return;
 const moreBtn=`<a class="z9more" href="${esc(j.more||more)}" target="_blank" rel="noopener">${ic('ext',2)} ابحث في الدرر</a>`;
 if(!j.ok){out.innerHTML=`<div class="z9r"><p style="margin:0 0 6px"><b>${j.error==='rate'?'بحثت كثيرًا خلال دقائق — انتظر قليلًا ثم حاول':'تعذّر الوصول للدرر الآن'}</b></p><small class="muted">يمكنك البحث مباشرة في موقع الدرر:</small></div>${moreBtn}`;return}
 if(!j.items.length){out.innerHTML=`<div class="z9r"><b>لم أجد نتائج لهذا النص</b><br><small class="muted">جرّب كلمات أقل أو أوضح من الحديث.</small></div>${moreBtn}`;return}
 out.innerHTML=`<div class="z9leg"><span>${ar(j.items.length)} نتيجة من الدرر</span><span><i style="background:#2e7d4f"></i>صحيح/حسن</span><span><i style="background:#b98a2e"></i>اقرأ الحكم</span><span><i style="background:#b3412f"></i>لا يصح</span></div><div class="z9res">${j.items.map(it=>{const c=gcls(it.g);const u=it.u||('https://dorar.net/hadith/search?q='+encodeURIComponent(strip(it.t).split(/\s+/).slice(0,10).join(' ')));
  return `<article class="z9r ${c==='g'?'g':c==='r'?'r':''}"><p class="t">${esc(it.t)}</p><dl>${it.rawi&&it.rawi!=='-'?`<dt>الراوي</dt><dd>${esc(it.rawi)}</dd>`:''}${it.mhd?`<dt>المحدث</dt><dd>${esc(it.mhd)}</dd>`:''}${it.src?`<dt>المصدر</dt><dd>${esc(it.src)}${it.num?' — '+esc(it.num):''}</dd>`:''}</dl><span class="z9gr">خلاصة حكم المحدث: ${esc(it.g||'—')}</span><a class="lk" href="${esc(u)}" target="_blank" rel="noopener">${ic('ext',2)} في الدرر</a></article>`}).join('')}</div>${moreBtn}<p class="znote" style="font-size:11.5px;margin-top:8px">اللون يتبع كلمات حكم المحدث كما وردت في الدرر، وليس حكمًا من التطبيق.</p>`;
}
/* =========== 3) بلّغ ولو آية =========== */
let DATA=null,DP=null;
const loadData=()=>DATA?Promise.resolve(DATA):DP||(DP=fetch(ZC+'balligh.json?v=5.4.3',{mode:'cors'}).then(r=>{if(!r.ok)throw new Error('b');return r.json()}).then(j=>{j.all=[...j.v.map(x=>Object.assign(x,{k:'v'})),...j.h.map(x=>Object.assign(x,{k:'h'}))];j.by={};j.all.forEach(x=>j.by[x.id]=x);DATA=j;return j}).catch(e=>{DP=null;throw e}));
const dayN=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*6e4)/864e5)};
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return h};
function daily(D){const n=dayN();const v=D.v[(n*7+3)%D.v.length],h=D.h[(n*11+5)%D.h.length];return{v,h}}
const isFav=id=>ST.fav.includes(id);
function togFav(id){const i=ST.fav.indexOf(id);if(i>=0)ST.fav.splice(i,1);else ST.fav.unshift(id);sv();return i<0}
const refLine=x=>x.k==='v'?`[${x.ref}]`:`${x.ref}${x.g?' · '+x.g:''}`;
const shareTxt=x=>x.k==='v'?`﴿${x.t}﴾ [${x.ref}]\n\n— من تطبيق ${APPN()}: ${LINK}`:`قال ﷺ — «${x.t}»\n(${x.ref}${x.g?'، '+x.g:''})\n${x.u}\n\n— من تطبيق ${APPN()}: ${LINK}`.replace('قال ﷺ — ','');
function itemCard(x){return `<a class="z9it" href="#balligh/i/${x.id}"><span class="k">${x.k==='v'?'آية':'حديث'} · ${esc(x.topic)}</span>${isFav(x.id)?'<span class="hf">♥</span>':''}<p class="${x.k==='v'?'q':'h'}">${x.k==='v'?'﴿'+esc(x.t)+'﴾':esc(x.t)}</p><small>${esc(refLine(x))}</small></a>`}
async function balligh(a){
 const p=String(a||'').split('/');
 if(!DATA){view.innerHTML='<p class="znote" style="text-align:center;margin:40px">جارٍ التحميل…</p>';try{await loadData()}catch(e){view.innerHTML='<p class="znote" style="text-align:center;margin:40px">تعذّر تحميل «بلّغ ولو آية». تأكد من الاتصال وحاول مرة أخرى.</p><button class="btn block" onclick="location.reload()">إعادة المحاولة</button>';return}}
 if(p[0]==='i'&&DATA.by[p[1]])return itemView(DATA.by[p[1]]);
 const tp=p[0]==='t'?decodeURIComponent(p[1]||''):p[0]==='fav'?'__fav':p[0]==='v'?'__v':p[0]==='h'?'__h':'';
 const q=p[0]==='q'?decodeURIComponent(p.slice(1).join('/')):'';
 const dd=daily(DATA);const dk=ST.day==='h'?dd.h:dd.v;
 let list=DATA.all;
 if(tp==='__fav')list=ST.fav.map(id=>DATA.by[id]).filter(Boolean);else if(tp==='__v')list=DATA.v;else if(tp==='__h')list=DATA.h;else if(tp)list=list.filter(x=>x.topic===tp);
 if(q){const nq=norm(q);list=DATA.all.filter(x=>norm(x.t+' '+x.ref+' '+x.topic).includes(nq))}
 const chip=(h,l,on)=>`<a href="${h}" class="${on?'on':''}">${l}</a>`;
 view.innerHTML=`<div class="z9h"><span class="z9lg" style="background:linear-gradient(135deg,#c0693f,#8a4426)">${ic('share')}</span><div><h1>بلّغ ولو آية</h1><small class="muted">«بَلِّغُوا عَنِّي وَلَوْ آيَةً» — البخاري ٣٤٦١</small></div></div>
 <div class="z9day">${ORN}<div class="tb"><button data-d="v" class="${ST.day!=='h'?'on':''}">آية اليوم</button><button data-d="h" class="${ST.day==='h'?'on':''}">حديث اليوم</button></div><p class="tx ${dk.k==='v'?'q':'h'}">${dk.k==='v'?'﴿'+esc(dk.t)+'﴾':esc(dk.t)}</p><small>${esc(refLine(dk))}</small><a class="go" href="#balligh/i/${dk.id}">${ic('share',2)} صمّمها وانشرها</a></div>
 <form class="z9srch" data-bs><input type="search" name="q" value="${esc(q)}" placeholder="ابحث في الآيات والأحاديث…" enterkeyhint="search"></form>
 <div class="z9chips">${chip('#balligh','الكل',!tp&&!q)}${chip('#balligh/fav','♡ المفضلة'+(ST.fav.length?' ('+ar(ST.fav.length)+')':''),tp==='__fav')}${chip('#balligh/v','آيات',tp==='__v')}${chip('#balligh/h','أحاديث',tp==='__h')}${DATA.topics.map(t=>chip('#balligh/t/'+encodeURIComponent(t),esc(t),tp===t)).join('')}</div>
 <div class="z9list">${list.length?list.map(itemCard).join(''):`<p class="znote" style="text-align:center;margin:24px 0">${tp==='__fav'?'ليست لديك مفضلة بعد — افتح أي آية أو حديث واضغط ♡':'لا توجد نتائج'}</p>`}</div>
 <p class="z9src">الآيات بالرسم العثماني من quran.com · الأحاديث صحيحة أو حسنة منقولة حرفيًا من sunnah.com مع المرجع والحكم</p>`;
 $$('.z9day [data-d]').forEach(b=>b.onclick=()=>{ST.day=b.dataset.d;sv();balligh(a)});
 const f=$('[data-bs]');f.onsubmit=e=>{e.preventDefault();const v=f.q.value.trim();location.hash=v?'#balligh/q/'+encodeURIComponent(v):'#balligh'};
}
/* ---------- share cards (canvas) ---------- */
const TPL={
 zad:{n:'زاد',bg:['#f6f4ef','#efe9dd'],fr:'#34457a',ac:'#c0693f',tx:'#1d2545',sub:'#34457a',mu:'#8a8f9f'},
 indigo:{n:'نيلي',bg:['#34457a','#1d2545'],fr:'#e2b866',ac:'#e2b866',tx:'#ffffff',sub:'#f1dfb5',mu:'#b9c0da'},
 teal:{n:'فيروزي وذهبي',bg:['#0f5c58','#08312f'],fr:'#d4af37',ac:'#d4af37',tx:'#fdf8ea',sub:'#ecd58c',mu:'#9fc7c2'},
 night:{n:'ليلي',bg:['#141a33','#05070f'],fr:'#9fb3d9',ac:'#e9d9a6',tx:'#f3f5fb',sub:'#cdd6ee',mu:'#7d88a8',stars:1},
 sand:{n:'رملي',bg:['#f3e6c9','#e0c99a'],fr:'#7a5230',ac:'#a5682a',tx:'#4a3220',sub:'#7a5230',mu:'#9c8463'},
 minimal:{n:'بسيط',bg:['#ffffff','#ffffff'],fr:'#1d2545',ac:'#1d2545',tx:'#111111',sub:'#444444',mu:'#999999',min:1},
 clay:{n:'طيني',bg:['#c0693f','#7f3f22'],fr:'#fbe7d2',ac:'#fbe7d2',tx:'#fffaf4',sub:'#fbe0c6',mu:'#f3c7a8'},
 emerald:{n:'زمردي',bg:['#155e3b','#0a2e1d'],fr:'#e6c35c',ac:'#e6c35c',tx:'#fbfaf3',sub:'#f0dc9c',mu:'#a4c7b2'}
};
function star8(x,cx,cy,r,fill){x.save();x.translate(cx,cy);x.beginPath();for(let i=0;i<16;i++){const a=Math.PI/8*i-Math.PI/2,rr=i%2?r*.62:r;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.closePath();fill?x.fill():x.stroke();x.restore()}
function rosette(x,cx,cy,r,c){x.save();x.strokeStyle=c;x.fillStyle=c;x.lineWidth=Math.max(1.5,r/14);star8(x,cx,cy,r);x.beginPath();x.arc(cx,cy,r*.38,0,7);x.stroke();x.globalAlpha=.9;star8(x,cx,cy,r*.22,1);x.restore()}
function frame(x,W,H,t){const m=44;x.save();
 if(t.min){x.strokeStyle=t.fr;x.lineWidth=2;x.strokeRect(m+10,m+10,W-2*m-20,H-2*m-20);x.restore();return}
 x.strokeStyle=t.fr;x.lineWidth=6;x.strokeRect(m,m,W-2*m,H-2*m);x.lineWidth=2;x.strokeRect(m+16,m+16,W-2*m-32,H-2*m-32);
 // diamond chain between the two lines
 x.fillStyle=t.fr;x.globalAlpha=.55;const step=36;const dia=(cx,cy)=>{x.beginPath();x.moveTo(cx,cy-5);x.lineTo(cx+5,cy);x.lineTo(cx,cy+5);x.lineTo(cx-5,cy);x.closePath();x.fill()};
 for(let X=m+60;X<W-m-50;X+=step){dia(X,m+8);dia(X,H-m-8)}for(let Y=m+60;Y<H-m-50;Y+=step){dia(m+8,Y);dia(W-m-8,Y)}x.globalAlpha=1;
 [[m+8,m+8],[W-m-8,m+8],[m+8,H-m-8],[W-m-8,H-m-8]].forEach(([cx,cy])=>{x.fillStyle=t.bg[0];x.beginPath();x.arc(cx,cy,30,0,7);x.fill();rosette(x,cx,cy,26,t.ac)});
 x.restore()}
function medallion(x,cx,cy,t,label){x.save();x.strokeStyle=t.ac;x.lineWidth=2.5;const w=300,h=64;
 x.beginPath();x.moveTo(cx-w/2,cy);x.lineTo(cx-w/2+28,cy-h/2);x.lineTo(cx+w/2-28,cy-h/2);x.lineTo(cx+w/2,cy);x.lineTo(cx+w/2-28,cy+h/2);x.lineTo(cx-w/2+28,cy+h/2);x.closePath();x.stroke();
 x.globalAlpha=.85;x.fillStyle=t.ac;star8(x,cx-w/2-34,cy,14,1);star8(x,cx+w/2+34,cy,14,1);x.globalAlpha=1;
 x.beginPath();x.moveTo(cx-w/2-60,cy);x.lineTo(cx-w/2-150,cy);x.moveTo(cx+w/2+60,cy);x.lineTo(cx+w/2+150,cy);x.stroke();
 x.fillStyle=t.sub;x.font='700 34px Cairo, Zad, sans-serif';x.textAlign='center';x.textBaseline='middle';x.direction='rtl';x.fillText(label,cx,cy+2);x.restore()}
function bgPaint(x,W,H,t,seed){const g=x.createLinearGradient(0,0,W*.3,H);g.addColorStop(0,t.bg[0]);g.addColorStop(1,t.bg[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
 if(t.min)return;
 // faint geometric lattice (8-point stars) — vectors only
 x.save();x.globalAlpha=t.stars?.05:.06;x.strokeStyle=t.fr;x.lineWidth=1.5;const s=120;for(let yy=-s/2;yy<H+s;yy+=s)for(let xx=-s/2;xx<W+s;xx+=s)star8(x,xx,yy,34);x.restore();
 if(t.stars){x.save();let r=seed||7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;x.fillStyle='#ffffff';for(let i=0;i<90;i++){x.globalAlpha=.25+rnd()*.6;x.beginPath();x.arc(rnd()*W,rnd()*H,rnd()*2.2+.5,0,7);x.fill()}x.restore()}}
function wrapLines(x,text,font,maxW){x.font=font;const words=text.split(/\s+/),lines=[];let l='';for(const w of words){const t=l?l+' '+w:w;if(x.measureText(t).width>maxW&&l){lines.push(l);l=w}else l=t}if(l)lines.push(l);return lines}
async function fontsReady(){try{await Promise.all([document.fonts.load('60px "Amiri Quran"','﴿بِسْمِ﴾'),document.fonts.load('60px Amiri','قال'),document.fonts.load('700 34px Cairo','زاد')])}catch(e){}try{await document.fonts.ready}catch(e){}}
async function drawCard(cv,x0,tk,sz){const t=TPL[tk]||TPL.zad;const W=1080,H=sz==='st'?1920:1080;cv.width=W;cv.height=H;const x=cv.getContext('2d');await fontsReady();
 x.direction='rtl';x.textAlign='center';x.textBaseline='alphabetic';bgPaint(x,W,H,t,hash(x0.id)%1000+3);frame(x,W,H,t);
 const isV=x0.k==='v';const top=sz==='st'?300:170;medallion(x,W/2,top,t,isV?'آية كريمة':'حديث شريف');
 const fam=isV?'"Amiri Quran", Amiri, serif':'Amiri, "Amiri Quran", serif';const txt=isV?'﴿'+x0.t+'﴾':'«'+x0.t+'»';
 const maxW=W-230,boxT=top+70,boxB=H-(sz==='st'?430:250);let fs=sz==='st'?100:76,lines,lh;
 for(;fs>=30;fs-=2){lh=fs*(isV?1.95:1.8);lines=wrapLines(x,txt,`400 ${fs}px ${fam}`,maxW);if(lines.length*lh<=boxB-boxT)break}
 x.fillStyle=t.tx;x.font=`400 ${fs}px ${fam}`;const y0=boxT+((boxB-boxT)-lines.length*lh)/2+lh*.72;lines.forEach((l,i)=>x.fillText(l,W/2,y0+i*lh));
 // reference
 const ry=boxB+(sz==='st'?110:70);x.fillStyle=t.ac;x.font='700 36px Cairo, Zad, sans-serif';x.fillText(isV?'['+x0.ref+']':x0.ref,W/2,ry);
 if(!isV&&x0.g){x.fillStyle=t.sub;x.font='500 28px Cairo, Zad, sans-serif';x.fillText('الحكم: '+x0.g,W/2,ry+46)}
 // watermark
 const wy=H-(sz==='st'?160:112);x.fillStyle=t.mu;x.font='700 32px Cairo, Zad, sans-serif';const nw=x.measureText(APPN()).width;x.fillText(APPN(),W/2-12,wy);x.globalAlpha=.9;x.fillStyle=t.ac;star8(x,W/2+nw/2+8,wy-11,10,1);x.globalAlpha=1;
 x.fillStyle=t.mu;x.font='500 22px Cairo, Zad, sans-serif';x.direction='ltr';x.fillText('zad.sites.tab.bot',W/2,wy+34);x.direction='rtl';
 return cv}
function cardBlob(cv){return new Promise(r=>cv.toBlob(r,'image/png'))}
function copyTxt(t){const ok=()=>tst('نُسخ النص مع المرجع');try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(ok,()=>fbCopy(t));fbCopy(t)}catch(e){fbCopy(t)}}
function fbCopy(t){try{const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();tst('نُسخ النص مع المرجع')}catch(e){tst('تعذّر النسخ')}}
async function itemView(x){
 view.innerHTML=`<div class="z9h"><a href="#balligh" class="z9lg" style="background:var(--card,#fff);color:inherit;border:1px solid var(--line,#e6e1d6);text-decoration:none">${zi('chev','chv')}</a><div><h1 style="font-size:19px">${x.k==='v'?'آية':'حديث'} · ${esc(x.topic)}</h1><small class="muted">${esc(refLine(x))}</small></div></div>
 <div class="z9seg"><button data-s="sq" class="${ST.sz!=='st'?'on':''}">مربع ١٠٨٠×١٠٨٠</button><button data-s="st" class="${ST.sz==='st'?'on':''}">ستوري ١٠٨٠×١٩٢٠</button></div>
 <div class="z9pv" style="max-width:${ST.sz==='st'?260:340}px"><canvas id="z9cv" width="1080" height="1080"></canvas></div>
 <div class="z9tp">${Object.keys(TPL).map(k=>{const t=TPL[k];return `<button data-t="${k}" class="${ST.tpl===k?'on':''}" title="${t.n}" aria-label="${t.n}" style="background:linear-gradient(135deg,${t.bg[0]},${t.bg[1]});box-shadow:inset 0 0 0 3px ${t.fr}"></button>`}).join('')}</div>
 <p class="z9meta">القالب: <b id="z9tn">${TPL[ST.tpl]?TPL[ST.tpl].n:'زاد'}</b> · <a href="${esc(x.u)}" target="_blank" rel="noopener">${x.k==='v'?'quran.com':'sunnah.com'}</a></p>
 <div class="z9acts"><button class="z9b full" data-a="img">${ic('share',2)} شارك كصورة</button><button class="z9b w" data-a="wa">${ic('wa',2)} واتساب</button><button class="z9b l" data-a="copy">${ic('copy',2)} نسخ النص</button><button class="z9b l" data-a="dl">${ic('dl',2)} حفظ الصورة</button><button class="z9b l" data-a="fav">${isFav(x.id)?'♥ في المفضلة':'♡ أضف للمفضلة'}</button>${x.k==='h'?`<a class="z9b l" style="grid-column:1/-1" href="#hcheck/${encodeURIComponent(strip(x.t).split(/\s+/).slice(0,9).join(' '))}">${ic('check',2)} تحقق منه في الدرر</a>`:''}</div>
 <p class="z9src">${x.k==='v'?'النص بالرسم العثماني من quran.com':'النص منقول حرفيًا من sunnah.com — '+esc(x.ref)+' ('+esc(x.g)+')'}</p>`;
 const cv=$('#z9cv');let busy=Promise.resolve();const redraw=()=>busy=busy.then(()=>drawCard(cv,x,ST.tpl,ST.sz)).catch(()=>{});redraw();
 $$('.z9tp [data-t]').forEach(b=>b.onclick=()=>{ST.tpl=b.dataset.t;sv();$$('.z9tp button').forEach(y=>y.classList.toggle('on',y===b));$('#z9tn').textContent=TPL[ST.tpl].n;redraw()});
 $$('.z9seg [data-s]').forEach(b=>b.onclick=()=>{ST.sz=b.dataset.s;sv();$$('.z9seg button').forEach(y=>y.classList.toggle('on',y===b));$('.z9pv').style.maxWidth=ST.sz==='st'?'260px':'340px';redraw()});
 const fname=()=>`zad-${x.id}-${ST.tpl}-${ST.sz==='st'?'story':'post'}.png`;
 $$('.z9acts [data-a]').forEach(b=>b.onclick=async()=>{const a=b.dataset.a;
  if(a==='copy')return copyTxt(shareTxt(x));
  if(a==='wa'){window.open('https://wa.me/?text='+encodeURIComponent(shareTxt(x)),'_blank','noopener');return}
  if(a==='fav'){const on=togFav(x.id);b.textContent=on?'♥ في المفضلة':'♡ أضف للمفضلة';tst(on?'أُضيفت للمفضلة':'حُذفت من المفضلة');return}
  await busy;const blob=await cardBlob(cv);if(!blob){tst('تعذّر إنشاء الصورة');return}const file=new File([blob],fname(),{type:'image/png'});
  if(a==='img'&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],text:shareTxt(x)})}catch(e){}return}
  const u=URL.createObjectURL(blob);const l=document.createElement('a');l.href=u;l.download=fname();document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);tst('حُفظت الصورة')});
}
window.ZB9={dorar,hcheck,balligh,lookup,gcls,drawCard,loadData,TPL,ENC,closeOv};
})();
