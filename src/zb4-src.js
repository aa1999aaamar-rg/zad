/* زاد v4.8.0 — موجة «نقلة نوعية» A: المصحف الناطق، الحرم مباشر، حصادي (قصة)، رحلتي، وضع رمضان.
   Lazy module on zad-content (/x/zb4.js), loaded by site/zs.js. Source: src/zb4-src.js (= zb4-pA..pD, terser → content/site/zb4.js).
   Qur'an text: api.quran.com v4 (words, text_uthmani). Audio: everyayah.com (Maher, ayah files) and quran.com recitations
   (word segments). Hadith: copied letter-for-letter from sunnah.com (see src/zb4-hadith.json). */
(function(){'use strict';if(window.ZB4)return;
const zi=window.ZI||(()=>''),ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sv=()=>{try{save()}catch(e){}},tst=m=>{try{toast(m)}catch(e){}},vb=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const ZZ=S.zb4=Object.assign({nat:{s:1,a:1,r:'maher',sp:1,rep:1,auto:true,cont:true,rg:{on:false,f:1,t:7,n:3}},bd:{},lv:0,wr:'',rmiss:{},qd:0,live:'makkah'},S.zb4||{});
ZZ.nat=Object.assign({s:1,a:1,r:'maher',sp:1,rep:1,auto:true,cont:true},ZZ.nat||{});ZZ.nat.rg=Object.assign({on:false,f:1,t:7,n:3},ZZ.nat.rg||{});ZZ.rmiss=ZZ.rmiss||{};
const HJ={"iftar": {"ctx": "كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِذَا أَفْطَرَ قَالَ", "t": "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ", "ref": "سنن أبي داود ٢٣٥٧", "g": "حسن (الألباني)", "u": "https://sunnah.com/abudawud:2357"}, "suhur": {"ctx": "", "t": "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً", "ref": "صحيح البخاري ١٩٢٣", "g": "صحيح", "u": "https://sunnah.com/bukhari:1923"}, "odd": {"ctx": "", "t": "تَحَرَّوْا لَيْلَةَ الْقَدْرِ فِي الْوِتْرِ مِنَ الْعَشْرِ الأَوَاخِرِ مِنْ رَمَضَانَ", "ref": "صحيح البخاري ٢٠١٧", "g": "صحيح", "u": "https://sunnah.com/bukhari:2017"}, "qadr": {"ctx": "قُلْتُ يَا رَسُولَ اللَّهِ أَرَأَيْتَ إِنْ عَلِمْتُ أَىُّ لَيْلَةٍ لَيْلَةُ الْقَدْرِ مَا أَقُولُ فِيهَا قَالَ", "t": "اللَّهُمَّ إِنَّكَ عَفُوٌّ كَرِيمٌ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", "ref": "جامع الترمذي ٣٥١٣", "g": "صحيح (دار السلام)، وقال الترمذي: حسن صحيح", "u": "https://sunnah.com/tirmidhi:3513"}, "qiyam": {"ctx": "", "t": "مَنْ قَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", "ref": "صحيح البخاري ٣٧", "g": "صحيح", "u": "https://sunnah.com/bukhari:37"}, "siyam": {"ctx": "", "t": "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", "ref": "صحيح البخاري ٣٨", "g": "صحيح", "u": "https://sunnah.com/bukhari:38"}},DUA="رَبَّنَا تَقَبَّلْ مِنَّآ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ";
const QA='https://api.quran.com/api/v4';
const back=(h,t)=>`<button class="back" onclick="location.hash='${h}'">${zi('chev')} ${t}</button>`;
const dayK=d=>{const x=d?new Date(d):new Date();return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
const FZ=()=>{const z=S.zf=S.zf||{};z.d=z.d||{};return z};
const css=`
.zb4-new{font-size:10px;background:#c0693f;color:#fff;border-radius:99px;padding:1px 7px;margin-inline-start:6px;vertical-align:middle;font-style:normal;font-weight:700}
.zn-top{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 10px}.zn-top select{flex:1;min-width:0;border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:9px 10px;font:inherit;font-size:14px}
.zn-mode{font-size:12.5px;border-radius:12px;padding:9px 11px;background:var(--z-soft,#eef0f7);color:var(--accent,#34457a);margin-bottom:10px;line-height:1.7}.zn-mode svg{width:15px;height:15px;vertical-align:-3px;margin-inline-end:4px}
.zn-txt{font-family:'Amiri Quran','Amiri',serif;font-size:var(--qs,26px);line-height:2.35;text-align:justify;text-align-last:center;direction:rtl;padding:14px 12px 8px;background:var(--card);border:1px solid var(--line);border-radius:18px}
.zn-bsm{text-align:center;font-family:'Amiri Quran','Amiri',serif;margin:2px 0 8px;border-radius:12px;transition:background .25s;cursor:pointer}
.zn-a{border-radius:10px;transition:background .25s,box-shadow .25s;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}
.zn-a.on,.zn-bsm.on{background:color-mix(in srgb,#c0693f 17%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,#c0693f 17%,transparent)}
.zn-w{border-radius:7px;transition:background .12s,color .12s;padding:0 1px}
.zn-wl .zn-a.on{background:color-mix(in srgb,#34457a 8%,transparent);box-shadow:0 0 0 3px color-mix(in srgb,#34457a 8%,transparent)}
.zn-w.on{background:#c0693f;color:#fff}
.zn-w.dn{color:color-mix(in srgb,currentColor 60%,#34457a)}
.zn-end{font-size:.78em;color:#c0693f;white-space:nowrap}
.zn-bar{position:sticky;bottom:calc(70px + env(safe-area-inset-bottom));z-index:5;margin-top:12px;background:color-mix(in srgb,var(--card) 94%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border:1px solid var(--line);border-radius:20px;padding:10px 12px;box-shadow:0 8px 24px rgba(29,37,69,.14)}
.zn-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.zn-pb{width:54px;height:54px;border-radius:50%;border:0;background:#34457a;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none}
.zn-pb svg{width:24px;height:24px;fill:currentColor}.zn-ib svg{width:17px;height:17px;fill:currentColor}
.zn-ib{width:42px;height:42px;border-radius:50%;border:1px solid var(--line);background:var(--card);color:inherit;display:grid;place-items:center;cursor:pointer;flex:none;font-size:20px;font-weight:700}
.zn-info{flex:1;min-width:0;text-align:center;font-size:12px;line-height:1.5;color:var(--muted)}.zn-info b{display:block;font-size:14.5px;color:var(--ink,inherit)}
.zn-opt{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px;align-items:center;font-size:12px}
.zn-opt .lb{color:var(--muted);margin-inline-end:2px;min-width:58px}
.zn-c{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:99px;padding:5px 10px;font:inherit;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}.zn-c svg{width:14px;height:14px}
.zn-c.on{background:#34457a;color:#fff;border-color:#34457a}
.zn-rg{display:none;gap:6px;align-items:center;flex-wrap:wrap;margin-top:8px;font-size:12px}.zn-rg.on{display:flex}
.zn-rg select{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:10px;padding:4px 6px;font:inherit;font-size:12px}
.zl-tabs{display:flex;gap:6px;background:var(--z-soft,#eef0f7);padding:4px;border-radius:14px;margin:6px 0 12px}.zl-tabs button{flex:1;border:0;background:none;padding:10px;border-radius:11px;font:inherit;font-weight:700;color:inherit;cursor:pointer}.zl-tabs button.on{background:var(--card);color:#34457a;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.zl-fr{position:relative;width:100%;aspect-ratio:16/9;background:#0d0f15;border-radius:18px;overflow:hidden}.zl-fr iframe,.zl-fr video{position:absolute;inset:0;width:100%;height:100%;border:0}
.zl-of{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#1f7a55;background:#e6f4ee;border-radius:99px;padding:4px 10px}.zl-of svg{width:14px;height:14px}
.zl-fb{display:none}.zl-fb.on{display:block}
.zl-card{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit}.zl-card .ic{width:46px;height:46px;border-radius:14px;background:#b8323a;color:#fff;display:grid;place-items:center;flex:none}.zl-card .ic svg{width:22px;height:22px}
.zw-ov{position:fixed;inset:0;z-index:9999;background:#141a33;color:#fff;display:flex;flex-direction:column;touch-action:none;user-select:none;-webkit-user-select:none;font-family:inherit}
.zw-bars{display:flex;direction:rtl;gap:4px;padding:calc(10px + env(safe-area-inset-top)) 12px 6px;position:relative;z-index:3}.zw-bars i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.25);overflow:hidden;position:relative}.zw-bars i b{position:absolute;inset:0;background:#fff;transform-origin:right;transform:scaleX(0)}
.zw-x{position:absolute;top:calc(22px + env(safe-area-inset-top));left:12px;width:40px;height:40px;border:0;background:rgba(255,255,255,.14);color:#fff;border-radius:50%;font-size:18px;cursor:pointer;z-index:4}
.zw-sl{flex:1;position:relative;overflow:hidden}
.zw-s{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px 28px 96px;opacity:0;pointer-events:none;transition:opacity .45s}
.zw-s.on{opacity:1;pointer-events:auto}
.zw-s .k{font-size:15px;color:#f2bd9b;margin-bottom:10px;display:flex;gap:6px;align-items:center;justify-content:center}.zw-s .k svg{width:18px;height:18px}
.zw-s h2{font-size:30px;line-height:1.4;margin:0 0 10px;font-weight:800;position:relative}
.zw-s .big{font-size:76px;font-weight:800;line-height:1.1;margin:6px 0;position:relative}
.zw-s p{font-size:16px;line-height:1.8;color:rgba(255,255,255,.88);margin:6px 0;max-width:330px;position:relative}
.zw-s .chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px;position:relative}.zw-s .chips span{background:rgba(255,255,255,.13);border-radius:99px;padding:6px 12px;font-size:13px}
.zw-s.on .an{animation:zwUp .7s both}.zw-s.on .an2{animation:zwUp .7s .18s both}.zw-s.on .an3{animation:zwUp .7s .4s both}.zw-s.on .an4{animation:zwPop .8s .2s both}
@keyframes zwUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}@keyframes zwPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
.zw-orb{position:absolute;border-radius:50%;filter:blur(40px);opacity:.5;pointer-events:none}
.zw-dua{font-family:'Amiri Quran','Amiri',serif;font-size:27px;line-height:2.1;margin:8px 0;position:relative}
.zw-ft{position:absolute;bottom:calc(20px + env(safe-area-inset-bottom));left:0;right:0;display:flex;justify-content:center;gap:10px;z-index:4}
.zw-ft button{border:0;border-radius:99px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer;display:inline-flex;gap:6px;align-items:center}.zw-ft svg{width:18px;height:18px}
.zw-ft .p{background:#c0693f;color:#fff}.zw-ft .g{background:rgba(255,255,255,.15);color:#fff}
.zw-hint{position:absolute;bottom:calc(26px + env(safe-area-inset-bottom));left:0;right:0;text-align:center;font-size:12px;color:rgba(255,255,255,.55);z-index:3}
.zr-hero{display:flex;gap:16px;align-items:center}.zr-ring{position:relative;width:116px;height:116px;flex:none}.zr-ring svg{width:100%;height:100%;transform:rotate(-90deg)}.zr-ring .c{position:absolute;inset:0;display:grid;place-items:center;text-align:center}.zr-ring .c b{font-size:34px;line-height:1;color:#34457a}.zr-ring .c small{display:block;font-size:11px;color:var(--muted)}
.zr-bar{height:10px;border-radius:9px;background:var(--z-soft,#eef0f7);overflow:hidden;margin:8px 0 4px}.zr-bar i{display:block;height:100%;background:linear-gradient(90deg,#c0693f,#34457a);border-radius:9px}
.zr-lv{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.zr-lv div{border:1px solid var(--line);border-radius:12px;padding:8px 2px;text-align:center;font-size:11px;line-height:1.35;background:var(--card)}.zr-lv div b{display:block;font-size:16px}.zr-lv .on{background:#34457a;color:#fff;border-color:#34457a}.zr-lv .no{opacity:.45}
.zr-bg{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.zr-b{border:1px solid var(--line);border-radius:16px;padding:10px 6px;text-align:center;background:var(--card)}.zr-b .i{width:44px;height:44px;margin:0 auto 6px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#f2bd9b,#c0693f);color:#fff}.zr-b .i svg{width:22px;height:22px}.zr-b b{display:block;font-size:12px;line-height:1.4}.zr-b small{display:block;font-size:10.5px;color:var(--muted);line-height:1.4;margin-top:2px}.zr-b.no{opacity:.6}.zr-b.no .i{background:var(--z-soft,#eef0f7);color:var(--muted)}
.zr-xp{display:grid;grid-template-columns:1fr auto;gap:7px 10px;font-size:13px}.zr-xp>span:nth-child(even){font-weight:700;color:#34457a}
.zr-home{display:flex;gap:12px;align-items:center;text-decoration:none;color:inherit;margin-top:12px;padding:10px 12px}.zr-home .rg{position:relative;width:52px;height:52px;flex:none}.zr-home .rg svg{width:100%;height:100%;transform:rotate(-90deg)}.zr-home .rg b{position:absolute;inset:0;display:grid;place-items:center;font-size:18px;color:#34457a}.zr-home small{display:block;color:var(--muted);font-size:12px}
.zrm-hero{background:linear-gradient(135deg,#1d2545,#34457a 60%,#4a3a6e);color:#fff;border-radius:22px;padding:16px;position:relative;overflow:hidden}
.zrm-hero .moon{position:absolute;left:-34px;bottom:-58px;width:110px;height:110px;border-radius:50%;box-shadow:24px 12px 0 0 #f2d8a8;opacity:.85}
.zrm-tt{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.zrm-tt div{background:rgba(255,255,255,.1);border-radius:14px;padding:10px}.zrm-tt small{display:block;color:#f2d8a8;font-size:12px}.zrm-tt b{font-size:20px}.zrm-tt em{display:block;font-style:normal;font-size:12px;opacity:.85}
.zrm-tb{width:100%;border-collapse:collapse;font-size:13px}.zrm-tb th,.zrm-tb td{padding:7px 3px;text-align:center;border-bottom:1px solid var(--line)}.zrm-tb th{font-size:11.5px;color:var(--muted)}.zrm-tb tr.now td{background:color-mix(in srgb,#c0693f 14%,transparent);font-weight:800}.zrm-tb tr.odd td:first-child{color:#c0693f;font-weight:800}
.zrm-days{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.zrm-days button{border:1px solid var(--line);background:var(--card);color:inherit;border-radius:12px;padding:8px 0;font:inherit;font-size:13px;cursor:pointer;position:relative}.zrm-days button.f{background:#1f7a55;color:#fff;border-color:#1f7a55}.zrm-days button.m{background:#fbeee6;color:#9a4f2e;border-color:#e8c3ad}.zrm-days button.now{outline:2px solid #c0693f;outline-offset:1px}.zrm-days button.odd::after{content:'';position:absolute;top:4px;left:4px;width:6px;height:6px;border-radius:50%;background:#c0693f}
.zrm-ten{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.zrm-ten div{border:1px solid var(--line);border-radius:12px;padding:8px 2px;text-align:center;font-size:12px}.zrm-ten div b{display:block;font-size:17px}.zrm-ten .odd{background:linear-gradient(160deg,#1d2545,#34457a);color:#fff;border-color:#34457a}.zrm-ten .odd small{color:#f2d8a8}
.zrm-had{font-size:15px;line-height:1.9;margin:6px 0}.zrm-src{font-size:12px;color:var(--muted)}.zrm-src a{color:#34457a}
.zrm-home{display:block;text-decoration:none;color:#fff;margin-top:12px}.zrm-home .zrm-hero{padding:14px}.zrm-qk{display:flex;gap:8px;margin-top:10px;position:relative}.zrm-qk button,.zrm-qk a{flex:1;border:0;border-radius:12px;padding:9px 4px;font:inherit;font-size:13px;font-weight:700;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;text-align:center;text-decoration:none}.zrm-qk button.on{background:#f2d8a8;color:#1d2545}
body.zb4-ram .zsky,body.zb4-ram #zskyw>*{filter:hue-rotate(-12deg) saturate(1.1)}
`;
function addCss(){if(document.getElementById('zb4css'))return;const s=document.createElement('style');s.id='zb4css';s.textContent=css;document.head.appendChild(s)}
addCss();
const SV={play:'<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',next:'<svg viewBox="0 0 24 24"><path d="M6 5v14h2V5zM10 12l10 7V5z"/></svg>',prev:'<svg viewBox="0 0 24 24"><path d="M18 5v14h-2V5zM14 12 4 19V5z"/></svg>'};
const chName=s=>{try{return CH(s)[1]}catch(e){return 'سورة '+s}},chLen=s=>{try{return +CH(s)[2]}catch(e){return 7}};

/* ===================== 1) المصحف الناطق ===================== */
/* Sync finding (checked 25 Oct 2026 on api.quran.com v4):
   - Maher Al-Muaiqly is not in quran.com's recitations (/resources/recitations, 12 reciters) nor its chapter reciters
     (qdc /audio/reciters, 14) → no word timestamps exist there for him → ayah-by-ayah highlight, the everyayah per-ayah files
     being the ayah boundaries.
   - Word segments ([index, word_position, start_ms, end_ms] per ayah file) exist for all 12 quran.com recitations
     (/recitations/{id}/by_chapter/{s}?fields=segments) and refer to quran.com's own files, which we play for word mode. */
const NREC=[
 {id:'maher',n:'ماهر المعيقلي',w:0,f:'MaherAlMuaiqly128kbps'},
 {id:'q7',n:'مشاري العفاسي',w:7},{id:'q6',n:'محمود خليل الحصري',w:6},{id:'q12',n:'الحصري (المصحف المعلّم)',w:12},{id:'q3',n:'عبدالرحمن السديس',w:3},{id:'q10',n:'سعود الشريم',w:10},{id:'q9',n:'محمد صديق المنشاوي',w:9},{id:'q2',n:'عبدالباسط عبدالصمد',w:2}];
const nrec=id=>NREC.find(r=>r.id===id)||NREC[0];
const pad=n=>String(n).padStart(3,'0');
const qurl=u=>u?(u.startsWith('//')?'https:'+u:/^https?:/.test(u)?u:'https://verses.quran.com/'+u):'';
const NC={};
async function jget(u,tries=3){let e;for(let i=0;i<tries;i++){try{const r=await fetch(u);if(r.ok)return await r.json();e=new Error('HTTP '+r.status)}catch(x){e=x}await new Promise(r=>setTimeout(r,700*(i+1)))}throw e}
async function words(s){if(NC['w'+s])return NC['w'+s];const j=await jget(`${QA}/verses/by_chapter/${s}?words=true&word_fields=text_uthmani&per_page=300&fields=text_uthmani`);const v=j.verses.map(x=>({a:x.verse_number,k:x.verse_key,w:(x.words||[]).filter(w=>w.char_type_name==='word').map(w=>[w.position,w.text_uthmani])}));NC['w'+s]=v;return v}
async function segs(rid,s){const k='s'+rid+'_'+s;if(NC[k])return NC[k];const j=await jget(`${QA}/recitations/${rid}/by_chapter/${s}?fields=segments&per_page=300`);const m={};(j.audio_files||[]).forEach(f=>{const a=+String(f.verse_key).split(':')[1];m[a]={u:qurl(f.url),g:(f.segments||[]).filter(x=>x&&x.length>=4).map(x=>[+x[1],+x[2],+x[3]]).sort((p,q)=>p[1]-q[1])}});NC[k]=m;return m}
const N={au:new Audio(),pre:new Audio(),s:1,a:1,b:false,n:0,pass:0,raf:0,seg:null,on:false,last:-1};
N.au.preload='auto';N.pre.preload='auto';
const BSM='بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
function urlOf(rec,s,a){if(!rec.w)return `https://everyayah.com/data/${rec.f}/${pad(s)}${pad(a)}.mp3`;const m=NC['s'+rec.w+'_'+s];return m&&m[a]?m[a].u:''}
async function urlB(rec){if(!rec.w)return urlOf(rec,1,1);const m=await segs(rec.w,1);return m[1]?m[1].u:''}
function setRate(){try{N.au.preservesPitch=true;N.au.webkitPreservesPitch=true;N.au.playbackRate=+ZZ.nat.sp||1}catch(e){}}
function stopNat(){try{N.au.pause()}catch(e){}cancelAnimationFrame(N.raf);N.on=false;ui()}
function mark(scroll){$$('.zn-a.on,.zn-bsm.on,.zn-w.on').forEach(x=>x.classList.remove('on'));$$('.zn-w.dn').forEach(x=>x.classList.remove('dn'));
 const el=N.b?$('.zn-bsm'):$(`.zn-a[data-a="${N.a}"]`);if(!el)return;el.classList.add('on');if(ZZ.nat.auto&&scroll!==false){const r=el.getBoundingClientRect();if(r.top<80||r.top>innerHeight*0.55)el.scrollIntoView({block:'center',behavior:'smooth'})}}
function tick(){cancelAnimationFrame(N.raf);const rec=nrec(ZZ.nat.r);if(!rec.w||N.b||!N.seg||!N.seg.length)return;
 const loop=()=>{if(!N.on)return;const t=N.au.currentTime*1000,g=N.seg;let p=-1;for(let i=0;i<g.length;i++){if(t>=g[i][1])p=g[i][0];else break}
  if(p!==N.last){N.last=p;const box=$(`.zn-a[data-a="${N.a}"]`);if(box){$$('.zn-w',box).forEach(w=>{const q=+w.dataset.p;w.classList.toggle('on',q===p);w.classList.toggle('dn',p>0&&q<p)});const w=p>0&&$(`.zn-w[data-p="${p}"]`,box);if(w&&ZZ.nat.auto){const r=w.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-210)w.scrollIntoView({block:'center',behavior:'smooth'})}}}
  N.raf=requestAnimationFrame(loop)};N.raf=requestAnimationFrame(loop)}
function media(){if(!('mediaSession' in navigator))return;try{const rec=nrec(ZZ.nat.r);navigator.mediaSession.metadata=new MediaMetadata({title:N.b?`سورة ${chName(N.s)} · البسملة`:`سورة ${chName(N.s)} · آية ${ar(N.a)}`,artist:'الشيخ '+rec.n,album:'زاد — المصحف الناطق',artwork:[{src:new URL('icons/icon-512.png',location.href).href,sizes:'512x512',type:'image/png'},{src:new URL('icons/icon-192.png',location.href).href,sizes:'192x192',type:'image/png'}]});
 const ms=navigator.mediaSession,H=(a,f)=>{try{ms.setActionHandler(a,f)}catch(e){}};H('play',()=>{N.on=true;N.au.play().then(tick).catch(()=>{})});H('pause',()=>N.au.pause());H('previoustrack',()=>go(N.a-1));H('nexttrack',()=>go(N.a+1));H('stop',stopNat);ms.playbackState=N.au.paused?'paused':'playing'}catch(e){}}
let stepId=0;
async function playStep(){const id=++stepId,rec=nrec(ZZ.nat.r);let u;
 try{if(N.b){u=await urlB(rec);N.seg=null}else{if(rec.w){await segs(rec.w,N.s);const m=NC['s'+rec.w+'_'+N.s][N.a];N.seg=m?m.g:null}else N.seg=null;u=urlOf(rec,N.s,N.a)}}catch(e){u=''}
 if(id!==stepId)return;
 if(!u){tst('تعذّر تحميل الصوت، تأكد من الاتصال');stopNat();return}
 N.last=-1;N.au.src=u;setRate();mark();N.on=true;ui();media();
 try{await N.au.play()}catch(e){if(id===stepId){N.on=false;ui()}return}
 if(id!==stepId)return;setRate();tick();ZZ.nat.s=N.s;ZZ.nat.a=N.a;sv();
 try{const na=N.b?N.a:N.a+1;if(na<=chLen(N.s)){const nu=urlOf(rec,N.s,na);if(nu&&N.pre.src!==nu)N.pre.src=nu}}catch(e){}}
function go(a){const L=chLen(N.s);a=Math.max(1,Math.min(L,a));N.a=a;N.b=false;N.n=0;playStep()}
function logAyah(){try{const z=FZ(),k=dayK(),o=z.d[k]=z.d[k]||{};o.na=(o.na||0)+1;if(N.a===chLen(N.s)&&(N.started===N.s)){ZZ.sd=ZZ.sd||{};if(!ZZ.sd[N.s])ZZ.sd[N.s]=k}sv();try{ZS.rihlaCheck&&ZS.rihlaCheck()}catch(e){}}catch(e){}}
N.au.addEventListener('ended',()=>{cancelAnimationFrame(N.raf);const o=ZZ.nat;
 if(N.b){N.b=false;N.n=0;playStep();return}
 N.n++;if(N.n<(+o.rep||1)){N.au.currentTime=0;N.au.play().then(tick).catch(()=>{});ui();return}
 N.n=0;logAyah();
 if(o.rg&&o.rg.on&&N.a>=+o.rg.t){N.pass++;const lim=+o.rg.n;if(!lim||N.pass<lim){N.a=+o.rg.f;N.b=false;playStep();return}N.pass=0;N.on=false;$$('.zn-w.on').forEach(x=>x.classList.remove('on'));ui();tst('اكتمل تكرار المقطع ✓');return}
 if(N.a<chLen(N.s)){N.a++;playStep();return}
 if(o.cont&&N.s<114){const ns=N.s+1;tst('السورة التالية: '+chName(ns));ZZ.nat.s=ns;ZZ.nat.a=1;sv();if(location.hash.split('/')[0]==='#natiq'){location.hash='natiq/'+ns+'/1/p'}else{N.s=ns;N.a=1;N.b=ns!==9;N.started=ns;playStep()}return}
 N.on=false;ui();tst('صدق الله العظيم')});
['play','pause'].forEach(e=>N.au.addEventListener(e,()=>{if(e==='pause'){N.on=false;cancelAnimationFrame(N.raf)}ui();try{navigator.mediaSession.playbackState=e==='play'?'playing':'paused'}catch(x){}}));
N.au.addEventListener('error',()=>{if(N.au.getAttribute('src')){N.on=false;ui();tst('تعذّر تشغيل الصوت، تأكد من الاتصال')}});
function ui(){const p=$('#znpb');if(p){p.innerHTML=N.au.paused?SV.play:SV.pause;p.setAttribute('aria-label',N.au.paused?'تشغيل':'إيقاف مؤقت')}const i=$('#zninfo');if(i){const rec=nrec(ZZ.nat.r),o=ZZ.nat;i.innerHTML=`<b>${N.b?'سورة '+chName(N.s)+' · البسملة':'سورة '+chName(N.s)+' · آية '+ar(N.a)}</b>الشيخ ${rec.n}${(+o.rep||1)>1?' · التكرار '+ar(N.n+1)+'/'+ar(o.rep):''}${o.rg&&o.rg.on?' · المقطع '+ar(o.rg.f)+'–'+ar(o.rg.t)+(+o.rg.n?' ×'+ar(o.rg.n):' بلا حد'):''}`}}
async function natRender(arg){addCss();const o=ZZ.nat,pa=String(arg||'').split('/');let s=+pa[0]||(+o.s||1),a=+pa[1]||0;const autoplay=pa[2]==='p';s=Math.min(114,Math.max(1,s));const L=chLen(s);a=a?Math.min(L,a):(s===+o.s?Math.min(L,+o.a||1):1);
 const same=N.s===s&&N.on;
 if(!same){try{if(typeof AP!=='undefined'&&AP.el)AP.el.pause()}catch(e){}}
 const rec=nrec(o.r);
 if(o.rg.f>L||o.rg.t>L||o.rg.f<1){o.rg.f=1;o.rg.t=Math.min(L,7)}
 view.innerHTML=`<div class="zb4 zn">${back('read/s/'+s,'المصحف')}<h1 class="page" style="margin-bottom:2px">المصحف الناطق<em class="zb4-new">جديد</em></h1>
 <div class="zn-top"><select id="znsur" aria-label="السورة">${Array.from({length:114},(_,i)=>`<option value="${i+1}" ${i+1===s?'selected':''}>${ar(i+1)}. ${chName(i+1)}</option>`).join('')}</select>
 <select id="znrec" aria-label="القارئ"><optgroup label="تتبّع الآية">${NREC.filter(r=>!r.w).map(r=>`<option value="${r.id}" ${r.id===rec.id?'selected':''}>${r.n} · آية بآية</option>`).join('')}</optgroup><optgroup label="تتبّع كلمة بكلمة">${NREC.filter(r=>r.w).map(r=>`<option value="${r.id}" ${r.id===rec.id?'selected':''}>${r.n} · كلمة بكلمة</option>`).join('')}</optgroup></select></div>
 <div class="zn-mode">${rec.w?`${zi('sparkle')}تتبّع <b>كلمة بكلمة</b> بصوت الشيخ ${rec.n}، وتوقيت كل كلمة من بيانات quran.com لهذه التلاوة.`:`${zi('sparkle')}تتبّع <b>آية بآية</b> بصوت الشيخ ${rec.n} (everyayah.com). لا توجد توقيتات كلمات منشورة لهذا القارئ، فتتلوّن الآية كاملة. للتتبّع كلمة بكلمة اختر قارئًا من «تتبّع كلمة بكلمة».`}</div>
 <div class="zn-txt ${rec.w?'zn-wl':''}" id="zntxt" style="--qs:${(S.settings&&S.settings.qsize)||26}px">${s!==1&&s!==9?`<div class="zn-bsm" id="znb">${BSM}</div>`:''}<div class="spin"></div></div>
 <div class="zn-bar"><div class="zn-row"><button class="zn-ib" id="znpv" aria-label="الآية السابقة">${SV.prev}</button><div class="zn-info" id="zninfo"></div><button class="zn-pb" id="znpb" aria-label="تشغيل">${SV.play}</button><button class="zn-ib" id="znnx" aria-label="الآية التالية">${SV.next}</button></div>
 <div class="zn-opt"><span class="lb">السرعة</span>${[0.75,0.9,1,1.1,1.25].map(v=>`<button class="zn-c ${+o.sp===v?'on':''}" data-sp="${v}">${ar(v)}×</button>`).join('')}</div>
 <div class="zn-opt"><span class="lb">كرّر الآية</span>${[1,2,3,5,10].map(v=>`<button class="zn-c ${+o.rep===v?'on':''}" data-rp="${v}">${v===1?'مرة':ar(v)}</button>`).join('')}</div>
 <div class="zn-opt"><button class="zn-c ${o.rg.on?'on':''}" id="znrgt">${zi('repeat')}تكرار مقطع للحفظ</button><button class="zn-c ${o.auto?'on':''}" id="znau">تمرير تلقائي</button><button class="zn-c ${o.cont?'on':''}" id="znct">السورة التالية تلقائيًا</button></div>
 <div class="zn-rg ${o.rg.on?'on':''}" id="znrg">من آية <select id="znf">${Array.from({length:L},(_,i)=>`<option value="${i+1}" ${i+1===+o.rg.f?'selected':''}>${ar(i+1)}</option>`).join('')}</select> إلى <select id="znt">${Array.from({length:L},(_,i)=>`<option value="${i+1}" ${i+1===+o.rg.t?'selected':''}>${ar(i+1)}</option>`).join('')}</select> عدد المرات <select id="znn">${[2,3,5,7,10,20,0].map(v=>`<option value="${v}" ${v===+o.rg.n?'selected':''}>${v?ar(v):'بلا حد'}</option>`).join('')}</select></div></div>
 <p class="znote" style="margin-top:10px">النص القرآني بالرسم العثماني من api.quran.com. اضغط أي آية لتبدأ منها${rec.w?'، أو كلمة في الآية الحالية لتنتقل إليها':''}، واضغط مطوّلًا للمعاني والتفسير. يمكن التحكم من شاشة القفل في أغلب الجوالات.</p></div>`;
 $('#znsur').onchange=e=>{stopNat();ZZ.nat.s=+e.target.value;ZZ.nat.a=1;sv();location.hash='natiq/'+e.target.value};
 $('#znrec').onchange=e=>{const was=N.on;stopNat();ZZ.nat.r=e.target.value;sv();natRender(N.s+'/'+N.a+(was?'/p':''))};
 $$('[data-sp]').forEach(b=>b.onclick=()=>{ZZ.nat.sp=+b.dataset.sp;sv();setRate();$$('[data-sp]').forEach(x=>x.classList.toggle('on',x===b))});
 $$('[data-rp]').forEach(b=>b.onclick=()=>{ZZ.nat.rep=+b.dataset.rp;N.n=0;sv();$$('[data-rp]').forEach(x=>x.classList.toggle('on',x===b));ui()});
 $('#znrgt').onclick=e=>{o.rg.on=!o.rg.on;N.pass=0;sv();e.currentTarget.classList.toggle('on',o.rg.on);$('#znrg').classList.toggle('on',o.rg.on);ui()};
 $('#znau').onclick=e=>{o.auto=!o.auto;sv();e.currentTarget.classList.toggle('on',o.auto)};
 $('#znct').onclick=e=>{o.cont=!o.cont;sv();e.currentTarget.classList.toggle('on',o.cont)};
 const rgc=()=>{let f=+$('#znf').value,t=+$('#znt').value;if(t<f){t=f;$('#znt').value=t}o.rg.f=f;o.rg.t=t;o.rg.n=+$('#znn').value;N.pass=0;sv();ui()};['#znf','#znt','#znn'].forEach(q=>$(q).onchange=rgc);
 $('#znpb').onclick=()=>{if(N.au.getAttribute('src')&&N.s===s&&!N.au.ended&&(N.au.currentTime>0||N.on)){if(N.au.paused){N.on=true;N.au.play().then(tick).catch(()=>{})}else N.au.pause();return}
  const st=o.rg.on?+o.rg.f:N.a;N.s=s;N.a=st;N.n=0;N.pass=0;N.started=s;N.b=(st===1&&s!==1&&s!==9);playStep()};
 $('#znnx').onclick=()=>{N.s=s;go(N.a+1)};$('#znpv').onclick=()=>{N.s=s;go(N.a-1)};
 if(!same){N.s=s;N.a=a;N.b=false}ui();
 let v;try{v=await words(s)}catch(e){const t=$('#zntxt');if(t)t.innerHTML='<p class="znote" style="text-align:center">تعذّر تحميل نص السورة. تأكد من الاتصال ثم أعد المحاولة.</p>';return}
 if(rec.w){try{await segs(rec.w,s)}catch(e){}}
 const box=$('#zntxt');if(!box||!document.body.contains(box))return;
 box.innerHTML=(s!==1&&s!==9?`<div class="zn-bsm" id="znb">${BSM}</div>`:'')+v.map(x=>`<span class="zn-a" data-a="${x.a}" data-k="${x.k}">${x.w.map(([p,t])=>`<span class="zn-w" data-p="${p}">${t}</span>`).join(' ')} <span class="zn-end">﴿${ar(x.a)}﴾</span></span> `).join('');
 let lp=null,lpd=false;
 box.addEventListener('pointerdown',e=>{const el=e.target.closest('.zn-a');if(!el)return;lpd=false;clearTimeout(lp);lp=setTimeout(()=>{lpd=true;try{if(typeof ayahSheet==='function')ayahSheet(el.dataset.k,()=>{N.s=s;go(+el.dataset.a)})}catch(x){}},560)});
 ['pointerup','pointercancel','pointerleave'].forEach(t=>box.addEventListener(t,()=>clearTimeout(lp)));
 box.addEventListener('contextmenu',e=>{if(e.target.closest('.zn-a'))e.preventDefault()});
 box.addEventListener('click',e=>{if(lpd){lpd=false;return}const bs=e.target.closest('.zn-bsm');if(bs){N.s=s;N.a=1;N.b=true;N.n=0;N.started=s;playStep();return}const el=e.target.closest('.zn-a');if(!el)return;const aa=+el.dataset.a;const w=e.target.closest('.zn-w');const r=nrec(ZZ.nat.r);
  if(w&&r.w&&aa===N.a&&N.s===s&&N.seg&&N.au.getAttribute('src')&&!N.b){const p=+w.dataset.p,g=N.seg.find(x=>x[0]===p);if(g){N.au.currentTime=g[1]/1000;N.last=-1;if(N.au.paused){N.on=true;N.au.play().then(tick).catch(()=>{})}return}}
  N.s=s;N.n=0;N.pass=0;if(N.started!==s)N.started=aa===1?s:0;go(aa)});
 if(same){mark(false)}else if(a>1){const el=$(`.zn-a[data-a="${a}"]`);el&&el.scrollIntoView({block:'center'})}
 if(autoplay&&!same){N.s=s;N.a=a;N.started=a===1?s:0;N.b=(a===1&&s!==1&&s!==9);N.n=0;playStep()}}
const natState=()=>({s:N.s,a:N.a,b:N.b,on:N.on,paused:N.au.paused,t:N.au.currentTime,src:N.au.src,rate:N.au.playbackRate,last:N.last,seg:N.seg?N.seg.length:0,rec:ZZ.nat.r,word:($('.zn-w.on')||{}).textContent||'',ayahOn:($('.zn-a.on')||{dataset:{}}).dataset.a||null,ms:!!(navigator.mediaSession&&navigator.mediaSession.metadata)});

/* ===================== 2) الحرم مباشر ===================== */
/* Official channels, checked 25 Oct 2026: youtube.com/@SaudiQuranTv (UCos52azQNBgW63_9uDJoPDA, «قناة القران الكريم»; the channel
   description says it belongs to the Saudi Broadcasting Authority and streams the Grand Mosque 24h) and youtube.com/@SaudiSunnahTv
   (UCROKYPep-UuODNwyipe6JMw, «قناة السنة النبوية», the Prophet's Mosque 24h). Embed = live_stream?channel=… (no video id). */
const LV={makkah:{n:'مكة المكرمة',t:'المسجد الحرام',ch:'قناة القرآن الكريم',id:'UCos52azQNBgW63_9uDJoPDA',h:'@SaudiQuranTv'},madinah:{n:'المدينة المنورة',t:'المسجد النبوي',ch:'قناة السنة النبوية',id:'UCROKYPep-UuODNwyipe6JMw',h:'@SaudiSunnahTv'}};
let lvT=null;
function liveRender(arg){addCss();const k=LV[arg]?arg:(LV[ZZ.live]?ZZ.live:'makkah');ZZ.live=k;sv();const L=LV[k];clearTimeout(lvT);
 try{if(typeof AP!=='undefined'&&AP.el)AP.el.pause()}catch(e){}try{N.au.pause()}catch(e){}try{window._radio&&window._radio.pause()}catch(e){}
 const st=(window.STREAMS||{})[k]||{},off=navigator.onLine===false;
 view.innerHTML=`<div class="zb4 zl">${back('sec/prayer','الصلاة')}<h1 class="page" style="margin-bottom:4px">الحرم مباشر<em class="zb4-new">جديد</em></h1>
 <div class="zl-tabs" role="tablist">${Object.entries(LV).map(([x,v])=>`<button role="tab" data-lv="${x}" class="${x===k?'on':''}" aria-selected="${x===k}">${v.n}</button>`).join('')}</div>
 <div class="zl-fr" id="zlfr">${off?'':`<iframe id="zlif" src="https://www.youtube.com/embed/live_stream?channel=${L.id}&autoplay=1&mute=1&playsinline=1&rel=0" title="بث مباشر من ${L.t}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`}</div>
 <div class="zrow" style="justify-content:space-between;margin:10px 2px;gap:8px"><span class="zl-of">${zi('check')} بث رسمي</span><span class="k" style="font-size:12px">${L.ch} · هيئة الإذاعة والتلفزيون</span></div>
 <div class="zl-fb ${off?'on':''}" id="zlfb"><p class="znote" style="margin:0 2px 8px">${off?'لا يوجد اتصال بالإنترنت الآن.':'إذا لم يظهر البث داخل التطبيق، افتحه من القناة الرسمية:'}</p></div>
 <a class="zcard zl-card" href="https://www.youtube.com/${L.h}/live" target="_blank" rel="noopener"><span class="ic">${zi('live')}</span><div class="grow"><b>افتح البث في يوتيوب</b><small class="k" style="display:block">${L.ch} الرسمية · ${L.h}</small></div>${zi('chev','chv')}</a>
 ${st.hls?`<button class="btn ghost block" id="zlhls" style="margin-top:10px">${zi('tv')} مشغّل بديل إذا لم يعمل يوتيوب</button>`:''}
 <p class="znote" style="margin-top:10px">البث من القناتين الرسميتين على يوتيوب: ${LV.makkah.ch} من المسجد الحرام، و${LV.madinah.ch} من المسجد النبوي. يبدأ بدون صوت؛ اضغط على المشغّل لتشغيل الصوت. <a href="#media">الإذاعة والوسائط</a></p></div>`;
 $$('[data-lv]').forEach(b=>b.onclick=()=>{location.hash='live/'+b.dataset.lv});
 const ifr=$('#zlif');let ok=false;if(ifr){ifr.addEventListener('load',()=>{ok=true});lvT=setTimeout(()=>{if(!ok){const f=$('#zlfb');f&&f.classList.add('on')}},12000)}
 const hb=$('#zlhls');if(hb)hb.onclick=async()=>{const fr=$('#zlfr');fr.innerHTML='<video id="zlv" controls autoplay playsinline muted></video>';const v=$('#zlv');
  if(v.canPlayType('application/vnd.apple.mpegurl')){v.src=st.hls;v.play().catch(()=>{});return}
  try{if(!window.Hls)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});const h=new Hls();h.loadSource(st.hls);h.attachMedia(v);v.play().catch(()=>{})}catch(e){fr.innerHTML='';$('#zlfb').classList.add('on');tst('تعذّر المشغّل البديل')}}}

/* ===================== 3) حصادي: قصة الشهر ===================== */
const MN=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const HMN=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
function hijSpan(y,m){try{const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});const p=d=>{const o={};f.formatToParts(d).forEach(x=>o[x.type]=x.value);return{m:+o.month,y:parseInt(o.year)}};const a=p(new Date(y,m,1,12)),b=p(new Date(y,m+1,0,12));return a.m===b.m?`${HMN[a.m-1]} ${ar(a.y)}هـ`:`${HMN[a.m-1]} – ${HMN[b.m-1]} ${ar(b.y)}هـ`}catch(e){return''}}
const fmtN=n=>ar(Math.round(n).toLocaleString('en'));
function mstats(y,m){const pre=y+'-'+String(m+1).padStart(2,'0'),inM=k=>String(k).slice(0,7)===pre;const F=FZ(),sal=S.salah||{},score={};const add=(k,n)=>{if(inM(k)&&n>0)score[k]=(score[k]||0)+n};
 let prayers=0,jam=0,full=0;Object.entries(sal).forEach(([k,v])=>{if(!inM(k))return;const n=Object.keys(v||{}).length;prayers+=n;jam+=Object.values(v||{}).filter(x=>x==='j').length;if(n>=5)full++;add(k,n*2)});
 let pages=0;Object.entries((S.khatma&&S.khatma.log)||{}).forEach(([k,v])=>{if(inM(k)){pages+=+v||0;add(k,(+v||0)*2)}});
 const hifz=Object.values(S.done||{}).filter(inM);hifz.forEach(k=>add(k,6));
 /* v4.9: رفيق الحفظ (reviews, S.b3.srLog) + التسميع بالصوت (sessions, S.zb5.tl) */
 let rv=0,ts=0,tsBest=0;try{Object.entries((S.b3&&S.b3.srLog)||{}).forEach(([k,v])=>{if(inM(k)){rv+=+v||0;add(k,(+v||0)*2)}});((S.zb5&&S.zb5.tl)||[]).forEach(t=>{if(t&&inM(t.d)){ts++;tsBest=Math.max(tsBest,+t.sc||0);add(t.d,4)}})}catch(e){}
 let tsb=0,na=0,gk=0;const am=new Set(),pm=new Set(),tx={};Object.entries(F.d).forEach(([k,o])=>{if(!inM(k)||!o)return;tsb+=+o.t||0;na+=+o.na||0;gk+=Math.max(0,+o.k||0);if(o.m)am.add(k);if(o.e)pm.add(k);if(o.tx)for(const t in o.tx)tx[t]=(tx[t]||0)+(+o.tx[t]||0);add(k,(+o.t||0)/50+(+o.na||0)/5+(o.m?3:0)+(o.e?3:0)+Math.max(0,+o.k||0)*4)});
 Object.keys(S.adhkarDone||{}).filter(inM).forEach(k=>{if(!am.has(k)){am.add(k);add(k,3)}});
 let habit=0;try{((S.b5b&&S.b5b.habits)||[]).forEach(h=>Object.keys(h.days||{}).forEach(k=>{if(inM(k)&&h.days[k]){habit++;add(k,2)}}))}catch(e){}
 const fast=Object.keys(S.fast||{}).filter(k=>inM(k)&&S.fast[k]).length;Object.keys(S.fast||{}).forEach(k=>{if(S.fast[k])add(k,3)});
 const top=Object.entries(tx).sort((a,b)=>b[1]-a[1])[0]||null;
 const days=Object.keys(score).sort();let best=null;for(const k of days)if(!best||score[k]>score[best])best=k;
 let streak=0;{let c=0,p=null;for(const k of days){const d=new Date(k+'T12:00:00');d.setDate(d.getDate()-1);c=(p===dayK(d))?c+1:1;streak=Math.max(streak,c);p=k}}
 let kh=null;try{if(S.khatma&&S.khatma.pos!=null)kh={pct:Math.round(S.khatma.pos/604*100),pos:+S.khatma.pos||0}}catch(e){}
 const lg=(S.khatma&&S.khatma.log)||{},bd=best?F.d[best]||{}:{};
 const bestInfo=best?{k:best,pr:Object.keys(sal[best]||{}).length,pg:+lg[best]||0,t:+bd.t||0,m:!!(bd.m||(S.adhkarDone||{})[best]),na:+bd.na||0}:null;
 return{y,m,prayers,jam,full,pages,hifz:hifz.length,rv,ts,tsBest,tsb,na,am:am.size,pm:pm.size,gk,habit,fast,top,best:bestInfo,streak,active:days.length,kh,any:days.length>0}}
const fmtDay=k=>{try{return new Date(k+'T12:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',{weekday:'long',day:'numeric',month:'long'})}catch(e){return k}};
function slides(st){const T=MN[st.m]+' '+ar(st.y),H=hijSpan(st.y,st.m),out=[];
 out.push({bg:['#1d2545','#34457a'],h:`<div class="k an">${zi('sparkle')} حصادي الشهري</div><h2 class="an2" style="font-size:40px">${T}</h2><p class="an3">${H}</p><p class="an3" style="margin-top:22px">${st.any?'لنرَ ماذا زرعت هذا الشهر 🌱':'هذا الشهر بداية الطريق، والحصاد يبدأ بخطوة 🌱'}</p>`});
 out.push(st.pages||st.na||st.hifz||st.rv||st.ts?{bg:['#20304f','#2f4f5f'],h:`<div class="k an">${zi('quran')} مع القرآن</div>${st.pages?`<div class="big an4" data-c="${st.pages}">٠</div><p class="an2">صفحة قرأتها في ختمتك</p>`:''}${st.na?`<div class="big an4" style="font-size:${st.pages?'54px':'76px'}" data-c="${st.na}">٠</div><p class="an2">آية استمعت لها في المصحف الناطق</p>`:''}${st.hifz||st.rv||st.ts?`<div class="chips an3">${st.hifz?`<span>${ar(st.hifz)} يوم ورد حفظ</span>`:''}${st.rv?`<span>${ar(st.rv)} مراجعة في رفيق الحفظ</span>`:''}${st.ts?`<span>${ar(st.ts)} جلسة تسميع بالصوت${st.tsBest?' · أفضلها '+ar(st.tsBest)+'٪':''}</span>`:''}</div>`:''}`}:{bg:['#20304f','#2f4f5f'],h:`<div class="k an">${zi('quran')} مع القرآن</div><h2 class="an2">صفحة واحدة كل يوم</h2><p class="an3">تكفي لتبدأ. افتح «المصحف الناطق» واستمع وأنت تتابع، وفي الشهر القادم يكون لك حصاد مع القرآن.</p>`});
 out.push(st.tsb?{bg:['#3a2a55','#5b3f6e'],h:`<div class="k an">${zi('beads')} التسبيح</div><div class="big an4" data-c="${st.tsb}">٠</div><p class="an2">تسبيحة في السبحة</p>${st.top?`<div class="chips an3"><span>أكثر ذكر: «${esc(st.top[0].slice(0,40))}» · ${fmtN(st.top[1])}</span></div>`:''}`}:{bg:['#3a2a55','#5b3f6e'],h:`<div class="k an">${zi('beads')} التسبيح</div><h2 class="an2">دقيقة بعد كل صلاة</h2><p class="an3">جرّب السبحة الجديدة بأشكالها، وتسبيح دبر الصلاة الموجّه.</p>`});
 out.push(st.prayers?{bg:['#123f3a','#1f6b5c'],h:`<div class="k an">${zi('mosque')} الصلاة</div><div class="big an4" data-c="${st.prayers}">٠</div><p class="an2">صلاة سجّلتها</p><div class="chips an3">${st.jam?`<span>${ar(st.jam)} في جماعة</span>`:''}${st.full?`<span>${ar(st.full)} يوم بالصلوات الخمس</span>`:''}</div>`}:{bg:['#123f3a','#1f6b5c'],h:`<div class="k an">${zi('mosque')} الصلاة</div><h2 class="an2">سجّل صلواتك</h2><p class="an3">بضغطة بعد كل صلاة من «متابعة صلاتي»، وترى شهرك هنا.</p>`});
 out.push(st.streak>1||st.am||st.pm?{bg:['#4a2a1f','#9a4f2e'],h:`<div class="k an">${zi('flame')} الاستمرار</div>${st.streak>1?`<div class="big an4" data-c="${st.streak}">٠</div><p class="an2">أيام متتالية من النشاط</p>`:`<h2 class="an2">${ar(st.active)} يوم نشاط</h2>`}<div class="chips an3">${st.streak>1&&st.active?`<span>${ar(st.active)} يوم نشاط</span>`:''}${st.am?`<span>${ar(st.am)} يوم أذكار الصباح</span>`:''}${st.pm?`<span>${ar(st.pm)} يوم أذكار المساء</span>`:''}</div>`}:{bg:['#4a2a1f','#9a4f2e'],h:`<div class="k an">${zi('flame')} الاستمرار</div><h2 class="an2">قليل دائم</h2><p class="an3">ابدأ بأذكار الصباح غدًا، واجعلها عادة يومية تكبر معك.</p>`});
 out.push(st.kh&&st.kh.pos||st.habit||st.gk||st.fast?{bg:['#1d2545','#4a3a6e'],h:`<div class="k an">${zi('target')} الختمة والعادات</div>${st.kh&&st.kh.pos?`<div class="big an4">${ar(Math.min(100,st.kh.pct))}٪</div><p class="an2">من ختمتك الحالية</p>`:''}<div class="chips an3">${st.habit?`<span>${ar(st.habit)} يوم في عاداتك</span>`:''}${st.gk?`<span>${ar(st.gk)} جزء في ختمة جماعية</span>`:''}${st.fast?`<span>${ar(st.fast)} يوم صيام</span>`:''}</div>`}:{bg:['#1d2545','#4a3a6e'],h:`<div class="k an">${zi('target')} الختمة والعادات</div><h2 class="an2">ابدأ ختمتك</h2><p class="an3">حدّد مدة الختمة ونقسمها لك على الأيام، أو اختر عادة صغيرة وتابعها.</p>`});
 if(st.best)out.push({bg:['#2a3550','#a8573a'],h:`<div class="k an">${zi('star')} أفضل يوم في شهرك</div><h2 class="an2">${fmtDay(st.best.k)}</h2><div class="chips an3">${st.best.pr?`<span>${ar(st.best.pr)} صلوات</span>`:''}${st.best.pg?`<span>${ar(st.best.pg)} صفحات</span>`:''}${st.best.t?`<span>${fmtN(st.best.t)} تسبيحة</span>`:''}${st.best.na?`<span>${ar(st.best.na)} آية استماع</span>`:''}${st.best.m?'<span>أذكار الصباح</span>':''}</div>`});
 out.push({bg:['#141a33','#34457a'],end:1,h:`<div class="k an">ختامها دعاء</div><div class="zw-dua an2">﴿${DUA}﴾</div><p class="an3" style="font-size:13px;opacity:.75">[البقرة: ١٢٧]</p><p class="an3" style="font-size:14px">الأرقام من تسجيلك أنت على هذا الجهاز فقط.</p>`});
 return out}
let WR=null;
function wrapOpen(y,m){addCss();if(WR)WR.close();const now=new Date();if(y==null||isNaN(y)){y=now.getFullYear();m=now.getMonth()}
 const st=mstats(y,m),sl=slides(st);const ov=document.createElement('div');ov.className='zw-ov';ov.id='zwov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','حصادي الشهري');
 ov.innerHTML=`<div class="zw-bars">${sl.map(()=>'<i><b></b></i>').join('')}</div><button class="zw-x" aria-label="إغلاق">✕</button><div class="zw-sl">${sl.map((s,i)=>`<section class="zw-s" data-i="${i}" style="background:linear-gradient(160deg,${s.bg[0]},${s.bg[1]})"><span class="zw-orb" style="width:230px;height:230px;background:${s.bg[1]};top:8%;right:-70px"></span><span class="zw-orb" style="width:180px;height:180px;background:#c0693f;bottom:14%;left:-60px;opacity:.28"></span>${s.h}</section>`).join('')}</div><div class="zw-hint" id="zwhint">اضغط للتالي ‹</div><div class="zw-ft" id="zwft"></div>`;
 document.body.appendChild(ov);document.documentElement.style.overflow='hidden';
 let i=0,t0=0,el=0,paused=false,raf=0;const DUR=5200,bars=$$('.zw-bars b',ov),ss=$$('.zw-s',ov);
 const count=s=>{$$('[data-c]',s).forEach(e=>{const n=+e.dataset.c,st0=performance.now();const f=t=>{const p=Math.min(1,(t-st0)/1100);e.textContent=fmtN(n*(1-Math.pow(1-p,3)));if(p<1&&document.body.contains(e))requestAnimationFrame(f)};requestAnimationFrame(f)})};
 const show=n=>{i=Math.max(0,Math.min(sl.length-1,n));ss.forEach((s,j)=>s.classList.toggle('on',j===i));bars.forEach((b,j)=>b.style.transform=`scaleX(${j<i?1:0})`);count(ss[i]);el=0;t0=performance.now();
  const ft=$('#zwft',ov);$('#zwhint',ov).style.display=sl[i].end?'none':'';ft.innerHTML=sl[i].end?`<button class="p" id="zwsh">${zi('share')} شارك حصادي</button><button class="g" id="zwag">${zi('refresh')} من البداية</button>`:'';if(sl[i].end){bars[i].style.transform='scaleX(1)';$('#zwsh',ov).onclick=e=>{e.stopPropagation();shareCard(st)};$('#zwag',ov).onclick=e=>{e.stopPropagation();show(0)}}};
 const loop=t=>{if(!document.body.contains(ov))return;if(!paused&&!sl[i].end){el=t-t0;const p=Math.min(1,el/DUR);bars[i].style.transform=`scaleX(${p})`;if(p>=1)show(i+1)}else if(paused)t0=t-el;raf=requestAnimationFrame(loop)};
 const close=()=>{cancelAnimationFrame(raf);ov.remove();document.documentElement.style.overflow='';WR=null};
 $('.zw-x',ov).onclick=e=>{e.stopPropagation();close()};
 let sx=0,downAt=0;ov.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;sx=e.clientX;downAt=Date.now();paused=true});
 ov.addEventListener('pointerup',e=>{paused=false;if(e.target.closest('button')||!downAt)return;const dx=e.clientX-sx,held=Date.now()-downAt>450;downAt=0;if(Math.abs(dx)>50){show(i+(dx>0?1:-1));return}if(held)return;if(e.clientX>innerWidth*0.72)show(i-1);else show(i+1)});
 ov.addEventListener('pointercancel',()=>{paused=false;downAt=0});
 const kd=e=>{if(!document.body.contains(ov)){document.removeEventListener('keydown',kd);return}if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(i+1);if(e.key==='ArrowRight')show(i-1)};document.addEventListener('keydown',kd);
 window.addEventListener('hashchange',function hc(){window.removeEventListener('hashchange',hc);if(document.body.contains(ov))close()});
 show(0);raf=requestAnimationFrame(loop);WR={close,show,st,n:sl.length,cur:()=>i};return WR}
async function shareCard(st,noShare){try{await Promise.all(['700 60px Zad','400 30px Zad','400 40px "Amiri Quran"'].map(f=>document.fonts.load(f,'حصادي ٠١٢ رَبَّنَا')))}catch(e){}
 const W=1080,H=1920,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#141a33');bg.addColorStop(.55,'#34457a');bg.addColorStop(1,'#9a4f2e');g.fillStyle=bg;g.fillRect(0,0,W,H);
 g.save();g.strokeStyle='rgba(242,189,155,.10)';g.lineWidth=2;const s=120;for(let yy=-s;yy<H+s;yy+=s)for(let xx=-s;xx<W+s;xx+=s){g.save();g.translate(xx+(yy/s%2?s/2:0),yy);g.beginPath();for(let k=0;k<16;k++){const r=k%2?24:44,a=k*Math.PI/8;g.lineTo(r*Math.cos(a),r*Math.sin(a))}g.closePath();g.stroke();g.restore()}g.restore();
 g.strokeStyle='rgba(242,189,155,.6)';g.lineWidth=3;g.strokeRect(44,44,W-88,H-88);g.direction='rtl';g.textAlign='center';
 g.fillStyle='#f2bd9b';g.font='700 44px Zad, sans-serif';g.fillText('حصادي الشهري',W/2,230);g.fillStyle='#fff';g.font='700 104px Zad, sans-serif';g.fillText(MN[st.m]+' '+ar(st.y),W/2,370);g.fillStyle='rgba(255,255,255,.72)';g.font='400 36px Zad, sans-serif';g.fillText(hijSpan(st.y,st.m),W/2,440);
 const items=[[st.pages,'صفحة قرآن'],[st.na,'آية استماع'],[st.tsb,'تسبيحة'],[st.prayers,'صلاة سجّلتها'],[st.streak>1?st.streak:0,'أيام متتالية'],[st.am,'يوم أذكار الصباح'],[st.hifz,'يوم ورد حفظ'],[st.rv,'مراجعة حفظ'],[st.ts,'جلسة تسميع'],[st.habit,'يوم في عاداتي']].filter(x=>x[0]>0).slice(0,6);
 if(!items.length){g.fillStyle='#fff';g.font='700 70px Zad, sans-serif';g.fillText('بداية الطريق',W/2,860);g.font='400 42px Zad, sans-serif';g.fillStyle='rgba(255,255,255,.8)';g.fillText('والحصاد يبدأ بخطوة',W/2,940)}
 const cw=(W-140-30)/2,ch=250;items.forEach((it,k)=>{const col=k%2,row=Math.floor(k/2),x=(k===items.length-1&&items.length%2)?(W-cw)/2:W-70-cw-col*(cw+30),y=540+row*(ch+30);g.fillStyle='rgba(255,255,255,.09)';rr(g,x,y,cw,ch,36);g.fill();g.strokeStyle='rgba(255,255,255,.16)';g.lineWidth=2;g.stroke();g.fillStyle='#fff';g.font='700 100px Zad, sans-serif';g.fillText(fmtN(it[0]),x+cw/2,y+140);g.fillStyle='#f2bd9b';g.font='400 38px Zad, sans-serif';g.fillText(it[1],x+cw/2,y+205)});
 let yb=items.length?540+Math.ceil(items.length/2)*(ch+30)+20:1000;if(st.top){g.fillStyle='rgba(255,255,255,.85)';g.font='400 34px Zad, sans-serif';g.fillText('أكثر ذكر: «'+st.top[0].slice(0,30)+'»',W/2,yb+30);yb+=80}
 g.fillStyle='#fff';g.font='400 48px "Amiri Quran", Amiri, serif';g.fillText('﴿'+DUA+'﴾',W/2,Math.min(H-330,yb+110));
 g.fillStyle='rgba(255,255,255,.92)';g.font='700 58px Zad, sans-serif';g.fillText('زاد',W/2,H-205);const link=((window.ZSH&&ZSH.LINK)||'https://zad-app.sites.tab.bot/');g.fillStyle='rgba(255,255,255,.7)';g.font='400 32px Zad, sans-serif';g.direction='ltr';g.fillText(link.replace(/^https?:\/\//,'').replace(/\?.*$/,'').replace(/\/$/,''),W/2,H-150);g.direction='rtl';g.fillStyle='rgba(255,255,255,.55)';g.font='400 28px Zad, sans-serif';g.fillText('أرقام سجّلتها بنفسي في التطبيق',W/2,H-100);
 if(noShare)return c;
 const b=await new Promise(r=>c.toBlob(r,'image/png'));const fn=`zad-hasad-${st.y}-${st.m+1}.png`;const f=new File([b],fn,{type:'image/png'});const txt=`حصادي في ${MN[st.m]} مع تطبيق زاد 🌱\n${link}`;
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'حصادي الشهري',text:txt});return c}}catch(e){if(e&&e.name==='AbortError')return c}
 const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fn;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);tst('تم حفظ صورة الحصاد');return c}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}

/* ===================== 4) رحلتي ===================== */
const fmtShort=k=>{try{return new Date(k+'T12:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',{day:'numeric',month:'short'})}catch(e){return k}};
function rihlaRender(){addCss();try{ZS.rihlaCheck&&ZS.rihlaCheck(true)}catch(e){}const R=ZS.rihla();const L=R.lv,nx=R.next;const pct=nx?Math.max(0,Math.min(100,Math.round((R.xp-L.x)/(nx.x-L.x)*100))):100;const C=2*Math.PI*52;
 const old=(typeof BADGES!=='undefined'?BADGES:[]).map(b=>({id:'o_'+b[0],n:b[1],d:b[2],ok:!!(S.badges||{})[b[0]],at:(S.badges||{})[b[0]],i:'medal'}));
 const all=R.badges.concat(old),got=all.filter(b=>b.ok).length;
 view.innerHTML=`<div class="zb4 zr">${back('sec/self','النفس والعادات')}<h1 class="page" style="margin-bottom:6px">رحلتي<em class="zb4-new">جديد</em></h1>
 <section class="zcard"><div class="zr-hero"><div class="zr-ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="zrg" x1="0" x2="1"><stop offset="0" stop-color="#c0693f"/><stop offset="1" stop-color="#34457a"/></linearGradient></defs><circle cx="60" cy="60" r="52" fill="none" stroke="var(--z-soft,#eef0f7)" stroke-width="11"/><circle cx="60" cy="60" r="52" fill="none" stroke="url(#zrg)" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C*(1-pct/100)).toFixed(1)}"/></svg><div class="c"><div><small>المستوى</small><b>${ar(L.i)}</b></div></div></div>
 <div class="grow"><div class="k">مستواك الآن</div><h2 style="margin:2px 0 4px;font-size:25px">${L.n}</h2><div class="zr-bar"><i style="width:${pct}%"></i></div><div class="k" id="zrxp">${fmtN(R.xp)} نقطة${nx?` · بقي ${fmtN(nx.x-R.xp)} لمستوى «${nx.n}»`:' · أعلى مستوى'}</div></div></div></section>
 <h2 class="sec">المستويات العشرة</h2><div class="zr-lv">${R.levels.map(l=>`<div class="${l.i===L.i?'on':l.x>R.xp?'no':''}"><b>${ar(l.i)}</b>${l.n}</div>`).join('')}</div>
 <h2 class="sec">الأوسمة <span class="k">${ar(got)} من ${ar(all.length)}</span></h2><div class="zr-bg">${all.slice().sort((a,b)=>(b.ok-a.ok)).map(b=>`<div class="zr-b ${b.ok?'':'no'}" data-b="${b.id}"><div class="i">${zi(b.i||'medal')}</div><b>${esc(b.n)}</b><small>${b.ok?(b.at?'حصلت عليه '+esc(fmtShort(b.at)):'حصلت عليه'):esc(b.d)}</small></div>`).join('')}</div>
 <h2 class="sec">من أين جاءت نقاطك</h2><section class="zcard"><div class="zr-xp">${R.parts.filter(p=>p.v>0).map(p=>`<span>${p.n} <small class="k">(${fmtN(p.c)})</small></span><span>${fmtN(p.v)}</span>`).join('')||'<span class="k">ابدأ بأي عمل في التطبيق: قراءة، تسبيح، تسجيل صلاة، أذكار… وتجمع نقاطك هنا.</span><span></span>'}</div></section>
 <p class="znote">المستويات والأوسمة لتنظيم همّتك وتشجيعك على الاستمرار فقط، ولا تعني أجرًا محسوبًا ولا منزلة؛ الأجر عند الله وحده. النقاط تُحسب من تسجيلك أنت على هذا الجهاز، ولا تُرفع لأي خادم.</p>
 <a class="btn ghost block" href="#badges">${zi('chart')} إحصائياتي (إنجازاتي)</a></div>`}

/* ===================== 5) وضع رمضان ===================== */
function hij(d){try{const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});const o={};f.formatToParts(d).forEach(x=>o[x.type]=x.value);return{d:+o.day,m:+o.month,y:parseInt(o.year)}}catch(e){return null}}
function ramInfo(){const now=new Date();now.setHours(12,0,0,0);let h=null;try{h=typeof hijriToday==='function'?hijriToday():hij(now)}catch(e){h=hij(now)}
 const real=!!h&&h.m===9;let start=null,len=30,day=0;
 if(real){start=new Date(now);start.setDate(start.getDate()-(h.d-1));day=h.d}else{const x=new Date(now);for(let i=0;i<400;i++){x.setDate(x.getDate()+1);const q=hij(x);if(q&&q.m===9&&q.d===1){start=new Date(x);break}}}
 if(start){const e=new Date(start);e.setDate(e.getDate()+29);const q=hij(e);len=q&&q.m===9?30:29}
 const hy=real?h.y:(start?(hij(start)||{}).y:null),left=!real&&start?Math.round((start-now)/864e5):0;
 return{real,preview:!real&&!!(S.b2&&S.b2.ramadan),on:real||!!(S.b2&&S.b2.ramadan),start,len,day,hy,left}}
function locP(){try{const l=window.zLoc&&zLoc.curLoc?zLoc.curLoc():curLoc();if(l&&isFinite(l.lat))return l}catch(e){}try{return curLoc()}catch(e){return{lat:24.7136,lng:46.6753,name:'الرياض'}}}
function timesFor(d){try{const l=locP(),st=S.settings||{},tn=st.tune||{},T=k=>+tn[k]||0;const tune=[0,T('Fajr'),0,T('Dhuhr'),T('Asr'),T('Maghrib'),0,T('Isha'),0];const dd=new Date(d);dd.setHours(12,0,0,0);return ZPT.dayObj(l.lat,l.lng,dd,st.method||4,tune,st.asr==='hanafi',false).timings}catch(e){return null}}
const f12=t=>{try{return fmt12(t)}catch(e){return String(t).slice(0,5)}};
const hmsL=ms=>{const a=Math.max(0,Math.floor(ms/1e3)),h=Math.floor(a/3600),m=Math.floor(a%3600/60),s=a%60,p=n=>String(n).padStart(2,'0');return ar((h?h+':':'')+p(m)+':'+p(s))};
function atT(t,d){const [h,m]=String(t).slice(0,5).split(':').map(Number);const x=new Date(d||new Date());x.setHours(h,m,0,0);return x}
function nextSI(){const now=new Date(),t=timesFor(now);if(!t)return null;let f=atT(t.Fajr),m=atT(t.Maghrib);const tm=new Date();tm.setDate(tm.getDate()+1);let t2=null;if(f<now||m<now)t2=timesFor(tm);if(f<now&&t2)f=atT(t2.Fajr,tm);if(m<now&&t2)m=atT(t2.Maghrib,tm);return{fajr:t.Fajr,magh:t.Maghrib,f,m}}
const B2=()=>{const b=S.b2=S.b2||{};b.rfast=b.rfast||{};b.tar=b.tar||{};return b};
const gD=(d,o)=>d.toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',o);
let rmT=[];
function hadBox(k,lab){const h=HJ[k];return`<div class="zrm-had">${lab?`<div class="k" style="font-weight:700">${lab}</div>`:''}${h.ctx?`<span class="k">${h.ctx}:</span> `:''}«${h.t}»</div><div class="zrm-src">${h.ref} · الدرجة: ${h.g} · <a href="${h.u}" target="_blank" rel="noopener">sunnah.com</a></div>`}
function ramRender(){addCss();rmT.forEach(clearInterval);rmT=[];const R=ramInfo(),b=B2(),today=R.real?R.day:0;
 const rows=[];if(R.start){for(let i=0;i<R.len;i++){const d=new Date(R.start);d.setDate(d.getDate()+i);rows.push({n:i+1,d,t:timesFor(d)})}}
 const fasted=Object.keys(b.rfast).filter(k=>b.rfast[k]&&+k<=30).length,miss=Object.keys(ZZ.rmiss).filter(k=>ZZ.rmiss[k]).length,owed=Math.max(0,miss-(+ZZ.qd||0)),tar=Object.keys(b.tar).filter(k=>b.tar[k]).length;
 const rp=(S.b5b&&S.b5b.rp)||{n:1},kn=+rp.n||1,ppd=604*kn/30,pg=n=>((Math.round(n)-1)%604)+1,dd=today||1,p1=pg((dd-1)*ppd+1),p2=pg(dd*ppd);
 const si=nextSI();
 view.innerHTML=`<div class="zb4 zrm">${back('sec/ibadat','العبادات والمواسم')}<h1 class="page" style="margin-bottom:6px">وضع رمضان<em class="zb4-new">جديد</em></h1>
 <section class="zrm-hero"><span class="moon"></span><div style="position:relative"><div class="k" style="color:#f2d8a8">${R.real?'رمضان '+ar(R.hy)+'هـ':R.preview?'معاينة وضع رمضان':'وضع رمضان'}</div><h2 style="margin:4px 0;font-size:26px">${R.real?'اليوم '+ar(R.day)+' من رمضان':R.start?'بقي '+ar(R.left)+' يومًا على رمضان':'رمضان'}</h2><div style="font-size:13px;opacity:.88">${R.real?'تقبّل الله صيامك وقيامك':R.start?'يبدأ '+gD(R.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'})+' حسب تقويم أم القرى':''}</div>
 ${si?`<div class="zrm-tt"><div><small>آخر السحور · أذان الفجر</small><b>${f12(si.fajr)}</b><em id="zrmf"></em></div><div><small>الإفطار · أذان المغرب</small><b>${f12(si.magh)}</b><em id="zrmm"></em></div></div>`:''}</div></section>
 <section class="zcard"><label class="tg"><span><b>معاينة وضع رمضان</b><small class="muted">${R.real?'مفعّل تلقائيًا — نحن في رمضان':'يتفعّل تلقائيًا في رمضان حسب تقويم أم القرى. شغّله الآن لتجرّب شكل الرئيسية'}</small></span><input type="checkbox" id="zrmon" ${R.on?'checked':''} ${R.real?'disabled':''}><i></i></label></section>
 <h2 class="sec">إمساكية رمضان ${R.hy?ar(R.hy)+'هـ':''}</h2><section class="zcard" style="padding:6px 8px"><table class="zrm-tb"><thead><tr><th>رمضان</th><th>التاريخ</th><th>السحور (الفجر)</th><th>الإفطار (المغرب)</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.n===today?'now':''} ${r.n>20&&r.n%2?'odd':''}"><td>${ar(r.n)}</td><td>${gD(r.d,{weekday:'short',day:'numeric',month:'short'})}</td><td>${r.t?f12(r.t.Fajr):'—'}</td><td>${r.t?f12(r.t.Maghrib):'—'}</td></tr>`).join('')}</tbody></table>
 <p class="znote" style="margin:8px 4px">محسوبة على جهازك بنفس طريقة مواقيت التطبيق (${esc(locP().name||'موقعك')}). بداية الشهر حسب تقويم أم القرى، والمعتمد إعلان الرؤية الرسمي.</p></section>
 <h2 class="sec">أيام الصيام والقضاء</h2><section class="zcard"><div class="zrow" style="justify-content:space-between;margin-bottom:8px"><span><b>${ar(fasted)}</b> <span class="k">يوم صمته</span></span><span><b>${ar(miss)}</b> <span class="k">أفطرته بعذر</span></span><span><b style="color:#9a4f2e">${ar(owed)}</b> <span class="k">بقي قضاء</span></span></div>
 <div class="zrm-days">${Array.from({length:30},(_,i)=>{const n=i+1;return`<button data-rd="${n}" class="${b.rfast[n]?'f':ZZ.rmiss[n]?'m':''} ${n===today?'now':''} ${n>20&&n%2?'odd':''}" aria-label="اليوم ${n}">${ar(n)}</button>`}).join('')}</div>
 <p class="znote" style="margin:8px 0">ضغطة = صمت ✓ · ضغطتان = أفطرت بعذر (يُحسب قضاء) · ثلاث = فارغ.</p>
 <div class="zrow" style="gap:8px;align-items:center"><span class="k grow">أيام قضيتها:</span><button class="zn-ib" id="zrqm" aria-label="أنقص">−</button><b style="min-width:28px;text-align:center" id="zrqd">${ar(+ZZ.qd||0)}</b><button class="zn-ib" id="zrqp" aria-label="أضف">+</button></div>
 <a class="btn ghost block" href="#fasting" style="margin-top:10px">${zi('cal')} متابعة الصيام والقضاء بالتواريخ</a></section>
 <h2 class="sec">ختمة رمضان</h2><section class="zcard"><div><b>${ar(kn)} ${kn===1?'ختمة':kn===2?'ختمتان':'ختمات'}</b> <span class="k">· ${ar(Math.round(ppd*10)/10)} صفحة يوميًا (قرابة ${ar(Math.round(ppd/5*10)/10)} بعد كل صلاة)</span></div>
 <div class="zhad" style="margin-top:8px;font-size:15px">${today?'ورد اليوم '+ar(today):'ورد اليوم الأول'}: من صفحة ${ar(p1)} إلى ${ar(p2)}</div>
 <div class="zrow" style="gap:8px;margin-top:10px"><a class="btn grow" href="#read/p/${p1}">${zi('quran')} اقرأ الورد</a><a class="btn ghost grow" href="#rplan">الخطة والأهداف</a></div></section>
 <h2 class="sec">القيام والتراويح <span class="k">${ar(tar)} ليلة</span></h2><section class="zcard"><div class="zrm-days">${Array.from({length:30},(_,i)=>{const n=i+1;return`<button data-tr="${n}" class="${b.tar[n]?'f':''} ${n===today?'now':''} ${n>20&&n%2?'odd':''}">${ar(n)}</button>`}).join('')}</div><div style="margin-top:10px">${hadBox('qiyam','')}</div></section>
 <h2 class="sec">العشر الأواخر</h2><section class="zcard"><div class="zrm-ten">${Array.from({length:10},(_,i)=>{const n=21+i,odd=n%2===1,d=R.start?new Date(+R.start+(n-2)*864e5):null;return`<div class="${odd?'odd':''}"><b>${ar(n)}</b><small>${odd?'ليلة وتر':'ليلة'}</small>${d?`<small style="display:block;opacity:.8">${gD(d,{weekday:'short'})}</small>`:''}</div>`}).join('')}</div>
 <p class="znote" style="margin:8px 0 6px">تدخل كل ليلة بغروب شمس اليوم الذي قبلها (المكتوب تحتها يوم مغربها). لا يُجزم بليلة معيّنة؛ والسنة تحرّيها في الوتر من العشر الأواخر:</p>${hadBox('odd','')}<div style="margin-top:10px">${hadBox('qadr','')}</div></section>
 <h2 class="sec">الإفطار والسحور</h2><section class="zcard">${hadBox('iftar','دعاء الإفطار')}<div style="margin-top:12px">${hadBox('suhur','من السنة في السحور')}</div><div style="margin-top:12px">${hadBox('siyam','فضل صيام رمضان')}</div></section>
 <p class="znote">الأحاديث منقولة حرفيًا من sunnah.com مع درجتها ورابطها.</p></div>`;
 $('#zrmon').onchange=e=>{B2().ramadan=e.target.checked;sv();ramRender()};
 $$('[data-rd]').forEach(x=>x.onclick=()=>{const n=x.dataset.rd,b=B2();if(b.rfast[n]){b.rfast[n]=false;ZZ.rmiss[n]=true}else if(ZZ.rmiss[n]){ZZ.rmiss[n]=false}else{b.rfast[n]=true}sv();vb(12);ramRender()});
 $$('[data-tr]').forEach(x=>x.onclick=()=>{const n=x.dataset.tr,b=B2();b.tar[n]=!b.tar[n];sv();vb(12);ramRender()});
 $('#zrqp').onclick=()=>{ZZ.qd=(+ZZ.qd||0)+1;sv();ramRender()};$('#zrqm').onclick=()=>{ZZ.qd=Math.max(0,(+ZZ.qd||0)-1);sv();ramRender()};
 const tk=()=>{const a=$('#zrmf'),c=$('#zrmm');if(!a){rmT.forEach(clearInterval);return}const s=nextSI();if(!s)return;const now=Date.now();a.textContent='بعد '+hmsL(s.f-now);c.textContent='بعد '+hmsL(s.m-now)};tk();rmT.push(setInterval(tk,1000))}
/* the home card while Ramadan (real or preview) is on */
let rhT=null;
function ramHome(box){const R=ramInfo();clearInterval(rhT);document.body.classList.toggle('zb4-ram',R.on);if(!R.on){box.innerHTML='';return}addCss();const si=nextSI(),b=B2(),d=R.real?R.day:0,dk=d||0;const rp=(S.b5b&&S.b5b.rp)||{n:1},ppd=604*(+rp.n||1)/30,pg=n=>((Math.round(n)-1)%604)+1,dd=d||1;
 box.innerHTML=`<div class="zrm-home"><section class="zrm-hero"><span class="moon"></span><div style="position:relative"><div class="zrow" style="justify-content:space-between"><div class="k" style="color:#f2d8a8">${R.real?'رمضان '+ar(R.hy)+'هـ':'معاينة وضع رمضان'}</div><a href="#ramadan" style="color:#f2d8a8;font-size:12px;text-decoration:none">وضع رمضان ‹</a></div>
 <b style="font-size:20px;display:block;margin-top:2px">${R.real?'اليوم '+ar(d)+' من رمضان':'رمضان بعد '+ar(R.left)+' يومًا'}</b>
 ${si?`<div class="zrm-tt"><div><small>السحور · الفجر</small><b>${f12(si.fajr)}</b><em id="zrhf"></em></div><div><small>الإفطار · المغرب</small><b>${f12(si.magh)}</b><em id="zrhm"></em></div></div>`:''}
 <div style="font-size:13px;margin-top:10px;opacity:.9">ورد الختمة: صفحة ${ar(pg((dd-1)*ppd+1))}–${ar(pg(dd*ppd))}</div>
 <div class="zrm-qk">${dk?`<button data-q="f" class="${b.rfast[dk]?'on':''}">${b.rfast[dk]?'✓ ':''}صمت اليوم</button><button data-q="t" class="${b.tar[dk]?'on':''}">${b.tar[dk]?'✓ ':''}صليت التراويح</button>`:''}<a href="#ramadan">الإمساكية</a></div></div></section></div>`;
 $$('[data-q]',box).forEach(x=>x.onclick=e=>{e.preventDefault();const b=B2();if(x.dataset.q==='f'){b.rfast[dk]=!b.rfast[dk];if(b.rfast[dk])ZZ.rmiss[dk]=false}else b.tar[dk]=!b.tar[dk];sv();vb(12);ramHome(box)});
 const tk=()=>{const a=$('#zrhf'),c=$('#zrhm');if(!a||!document.body.contains(a)){clearInterval(rhT);return}const s=nextSI();if(!s)return;const now=Date.now();a.textContent='بعد '+hmsL(s.f-now);c.textContent='بعد '+hmsL(s.m-now)};tk();rhT=setInterval(tk,1000)}

window.ZB4={nat:natRender,natState,natStop:stopNat,live:liveRender,wrap:wrapOpen,wrapStats:mstats,shareCard,rihla:rihlaRender,ram:ramRender,ramHome,ramInfo,timesFor,HJ,NREC,_N:N};
})();
