
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
