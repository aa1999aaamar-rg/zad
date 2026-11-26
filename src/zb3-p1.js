
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
