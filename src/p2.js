
/* header + nav */
const MARK=`<svg class="zmark" viewBox="0 0 40 40" aria-hidden="true"><rect x="3" y="3" width="34" height="34" rx="11" fill="currentColor"/><path d="M20 8.5l3.2 7.7 7.7 3.2-7.7 3.2L20 30.3l-3.2-7.7-7.7-3.2 7.7-3.2z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="19.4" r="2.6" fill="#e8a37c"/></svg>`;
function header(){const h=document.querySelector('header.top');if(!h||h.dataset.z4)return;h.dataset.z4=1;const bell=document.getElementById('bellbtn');const sb=document.getElementById('setbtn');
 h.innerHTML=`<a class="brand" href="#home" style="text-decoration:none;color:inherit">${MARK}<div><b>${APP_NAME}</b><small id="zhd"></small></div></a><div class="zhact"><button class="iconbtn" id="zsrch" aria-label="بحث">${zi('search')}</button></div>`;
 const a=h.querySelector('.zhact');if(bell){bell.innerHTML=zi('bell')+'<em></em>';a.appendChild(bell)}
 const s2=sb||document.createElement('button');s2.className='iconbtn';s2.id='setbtn';s2.setAttribute('aria-label','الإعدادات');s2.innerHTML=zi('sliders');s2.onclick=()=>go('settings');a.appendChild(s2);
 document.getElementById('zsrch').onclick=()=>go('search');try{updateBell()}catch(e){}
 try{document.getElementById('zhd').textContent=fmtH(new Date(),{day:'numeric',month:'long',year:'numeric'})}catch(e){}}
const NAV=[['home','الرئيسية','home'],['quran','القرآن','quran'],['adhkar','الأذكار','adhkar'],['lib','مكتبتي','library'],['services','المزيد','grid']];
const NAVOF={home:'home',zadi:'home',sawm:'home',quran:'quran',read:'quran',hifz:'quran',ward:'quran',khatma:'quran',bookmarks:'quran',reciters:'quran',hifzhelp:'quran',adhkar:'adhkar',tasbeeh:'adhkar',duas:'adhkar',duacat:'adhkar',mythkr:'adhkar',sleep:'adhkar',khalwa:'adhkar',goals:'adhkar',athkarvoice:'adhkar',lib:'lib',myfile:'lib',pdfs:'lib',pdf:'lib',books:'lib',book:'lib',library:'lib'};
function drawTabs4(){const n=document.getElementById('tabs');if(!n)return;n.innerHTML=`<div class="in">${NAV.map(([a,l,i])=>`<a href="#${a}" data-tab="${a}" aria-label="${l}">${zi(i)}<span>${l}</span></a>`).join('')}</div>`;markTab4()}
function markTab4(){const r=(location.hash.slice(1)||'home').split('/')[0];const on=NAVOF[r]||'services';document.querySelectorAll('#tabs a').forEach(a=>a.classList.toggle('on',a.dataset.tab===on));document.documentElement.classList.toggle('zwide',['home','','services','lib','posts'].includes(r))}
try{drawTabs=drawTabs4;markTab=markTab4}catch(e){}

/* daily content */
const ZD=window.ZDATA||{v:[],h:[],a:[]};
const dayN=(d=new Date)=>Math.round((new Date(dayKey(d))-new Date('2026-01-01'))/864e5);
const pick=(arr,salt=0)=>arr&&arr.length?arr[((dayN()*7+salt)%arr.length+arr.length)%arr.length]:null;
const vref=v=>`${CH(v.sn)[1]}: ${ar(v.a)}`;
function streakOf(map){let s=0,d=new Date();if(!map[dayKey(d)])d=addD(d,-1);while(map[dayKey(d)]){s++;d=addD(d,-1)}return s}

/* smart ward: what fits this moment */
function smartWard(){const now=new Date(),fri=now.getDay()===5;let T=null;try{T=PT&&PT.t}catch(e){}
 const at=k=>T&&T[k]?atTime(T[k]):null,F=at('Fajr'),SR=at('Sunrise'),D=at('Dhuhr'),A=at('Asr'),M=at('Maghrib'),I=at('Isha');
 const s=[];const add=(g,t,p,ic)=>s.push({go:g,t,p,ic});
 const tm=fastInfo(addD(now,1));if(tm.r.length&&now.getHours()>=15)add('sawm','نية صيام الغد',fastLabel(tm),'fast');
 if(F&&SR&&now>=F&&now<+SR+90*60e3)add('adhkar/morning','أذكار الصباح','حصّن يومك بدقائق بعد الفجر','sunrise');
 if(SR&&D&&now>=+SR+20*60e3&&now<+D-10*60e3)add('quran','وقت الضحى','ركعتا الضحى وصفحة من وردك','sun');
 if(fri&&(!M||now<M))add('friday','سورة الكهف','يوم الجمعة: الكهف والصلاة على النبي ﷺ','cal');
 if(A&&M&&now>=A&&now<M)add('adhkar/evening','أذكار المساء','قبل غروب الشمس','sunrise');
 if(M&&I&&now>=M&&now<I)add('read/s/67','سورة الملك','وردٌ خفيف بين المغرب والعشاء','quran');
 if((I&&now>=I)||(F&&now<F)){if(now.getHours()>=1&&now.getHours()<5)add('qiyam','قيام الليل','الثلث الأخير من الليل','moon');add('sleep','أذكار النوم','آية الكرسي والمعوذات قبل النوم','sleep')}
 try{if(planReady()&&!S.done[firstUndone()])add('hifz/ward','ورد الحفظ','مقطع اليوم من خطتك','hifz')}catch(e){}
 add('bayn','بين الأذانين','استثمر الوقت قبل الصلاة','hourglass');
 if(s.length<2)add('quran','وردك من القرآن','ولو صفحة واحدة بتدبّر','quran');
 return s}

/* prayer sky: the living home hero */
function period(){const now=new Date();let T=null;try{T=PT&&PT.t}catch(e){}if(!T)return'day';const a=k=>atTime(T[k]);
 if(now<a('Fajr')||now>=a('Isha'))return'night';if(now<+a('Sunrise')+30*60e3)return'dawn';if(now<a('Asr'))return'day';if(now<+a('Maghrib')-25*60e3)return'asr';return'dusk'}
function skyHTML(){let np=null;try{np=nextPrayer()}catch(e){}
 if(!np)return`<section class="zsky" data-p="day"><div class="lbl">الصلاة القادمة</div><div class="nm">…</div><div class="cd">جارٍ حساب المواقيت</div></section>`;
 const n=np.next,list=np.list;let loc='';try{loc=curLoc().name||''}catch(e){}
 const t0=+list[0].at,t1=+list[4].at,now=new Date(),span=t1-t0;
 const W=320,H=112,R=150,cx=160,cy=168;
 const posR=f=>{f=Math.max(0,Math.min(1,f));const a0=Math.asin((cy-(H-8))/R),th=a0+(Math.PI-2*a0)*f;return[cx+R*Math.cos(th),cy-R*Math.sin(th)]};
 const P=f=>posR(f).map(v=>v.toFixed(1)).join(' ');
 const night=now<t0||now>t1,f=night?(now<t0?0:1):(now-t0)/span;const[mx,my]=posR(f);
 const dots=list.map(p=>{const[x,y]=posR((p.at-t0)/span);const on=p.k===n.k;return`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${on?5.5:3.4}" fill="${on?'#fff':'rgba(255,255,255,.65)'}"/>`}).join('');
 const sunm=night?`<path d="M${(mx+7).toFixed(1)} ${(my-3).toFixed(1)}a8 8 0 1 1-6-7 6.3 6.3 0 0 0 6 7z" fill="#fff"/>`:`<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="17" fill="#fff8e6" opacity=".22"/><circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="9" fill="#fff8e6"/>`;
 const tt=fmt12(PT.t[n.k]||PT.tomorrowFajr);
 return`<section class="zsky" data-p="${period()}" id="zsky"><div class="top"><div><div class="lbl">الصلاة القادمة</div><div class="nm">${n.n}</div><div class="cd">بعد <b id="zcd">${hms(n.at-now)}</b></div></div><div class="at"><b>${tt.split(' ')[0]}</b>${tt.split(' ')[1]==='ص'?'صباحًا':'مساءً'}<br><a class="loc" href="#prayer">${zi('pin')}${esc(loc)}</a></div></div>
 <svg class="zarc" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M${P(0)} A${R} ${R} 0 0 0 ${P(1)}" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5" stroke-dasharray="3 5"/>${night?'':`<path d="M${P(0)} A${R} ${R} 0 0 0 ${mx.toFixed(1)} ${my.toFixed(1)}" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="2.4" stroke-linecap="round"/>`}<line x1="0" y1="${H-2}" x2="${W}" y2="${H-2}" stroke="rgba(255,255,255,.22)"/>${dots}${sunm}</svg>
 <div class="zplist">${list.map(p=>`<div class="${p.k===n.k?'on':''}">${p.n}<b>${fmt12(PT.t[p.k]).split(' ')[0]}</b></div>`).join('')}</div></section>`}
let skyTimer=null;
function tickSky(){clearInterval(skyTimer);skyTimer=setInterval(()=>{const el=document.getElementById('zcd');if(!el){clearInterval(skyTimer);return}let np=null;try{np=nextPrayer()}catch(e){}if(!np)return;const ms=np.next.at-new Date();if(ms<=0){const s=document.getElementById('zsky');if(s)s.outerHTML=skyHTML();return}el.textContent=hms(ms)},1000)}

/* home */
function greet(){const h=new Date().getHours();return h<5?'طابت ليلتك':h<12?'صباح الخير':h<17?'طاب يومك':'مساء الخير'}
function zadiCard(full){const v=pick(ZD.v,0),hd=pick(ZD.h,3),a=pick(ZD.a,5),k=dayKey(),done=!!Z.deeds[k],st=streakOf(Z.deeds);
 return`<section class="zcard" id="zadi" data-f="${full?1:''}"><div class="zrow" style="justify-content:space-between"><h3>${zi('sparkle')}زادي اليومي</h3>${st?`<span class="zstreak">${zi('flame')}${ar(st)} ${st>2&&st<11?'أيام':'يوم'}</span>`:''}</div>
 ${v?`<div class="zverse">﴿${v.t}﴾</div><div class="zref">[${vref(v)}]</div>`:''}
 ${hd?`<div class="zsep"></div><div class="zhad">«${esc(hd.t)}»</div><div class="zref">${esc(hd.ref)}</div>`:''}
 ${a?`<div class="zsep"></div><div class="zact ${done?'done':''}"><button class="tick" id="ztick" aria-label="أنجزتها">${zi('check')}</button><div class="grow"><div class="k">تحدي اليوم ${done?'· أنجزته':''}</div><b style="font-size:15px">${esc(a)}</b></div></div>`:''}
 <div class="zchips">${full?'':`<a class="zchip" href="#zadi">${zi('flame')}سلسلتي</a>`}<button class="zchip" id="zshare">${zi('share')}صمّم الآية</button></div></section>`}
function bindZadi(root){const t=root.querySelector('#ztick');if(t)t.onclick=()=>{const k=dayKey();if(Z.deeds[k])delete Z.deeds[k];else{Z.deeds[k]=1;try{vib([12,40,18])}catch(e){}toast('بارك الله فيك')}save();const c=root.querySelector('#zadi');c.outerHTML=zadiCard(c.dataset.f);bindZadi(root)};
 const sh=root.querySelector('#zshare');if(sh)sh.onclick=()=>{const v=pick(ZD.v,0);v&&zOpenDesign({k:'v',v},dayN()%ZT.length)}}
function wardCardZ(){const s=smartWard(),m=s[0],rest=s.slice(1,4);return`<section class="zcard"><div class="k" style="margin-bottom:10px">الورد الذكي · يتغيّر مع وقتك</div><a class="zward" href="#${m.go}" style="text-decoration:none;color:inherit"><span class="zi">${zi(m.ic)}</span><div class="grow"><b>${m.t}</b><p>${m.p}</p></div>${zi('chev','chv')}</a>${rest.length?`<div class="zchips">${rest.map(x=>`<a class="zchip" href="#${x.go}">${zi(x.ic)}${x.t}</a>`).join('')}</div>`:''}</section>`}
function fastCard(){if(!Z.fast.mt&&!Z.fast.white)return'';const nx=nextFasts(3),h=hij(new Date());return`<a class="zcard" href="#sawm"><div class="zrow" style="justify-content:space-between"><h3>${zi('fast')}أيام الصيام القادمة</h3><span class="k">${HM[h.m-1]} ${ar(h.y)}</span></div>${fastStrip(10)}<div class="k" style="margin-top:8px">${nx.map(f=>`${f.i===0?'اليوم':f.i===1?'غدًا':WD[f.d.getDay()]} ${ar(f.d.getDate())}/${ar(f.d.getMonth()+1)}`).join(' · ')}</div></a>`}
V.home=async()=>{let nm='';try{nm=NAME()||''}catch(e){}
 const tiles=[['quran','المصحف','quran'],['adhkar','الأذكار','adhkar'],['prayer','المواقيت','clock'],['qibla','القبلة','compass'],['tasbeeh','المسبحة','beads'],['hifz','الحفظ','hifz'],['posts','تصاميم','image'],['services','الكل','grid']];
 view.innerHTML=`<div class="zgreet"><div><small>${greet()}${nm?'، '+esc(nm):''}</small><b>السلام عليكم</b></div><div class="zh"><b>${fmtH(new Date(),{day:'numeric',month:'long'})}</b><br>${fmtW(new Date())} · ${fmtG(new Date(),{day:'numeric',month:'long'})}</div></div>
 <div id="zinst"></div><div class="zhome"><div class="zcolA"><div id="zskyw">${skyHTML()}</div>${fastBanner()}${wardCardZ()}<nav class="zgrid" aria-label="الأقسام">${tiles.map(([g,l,i])=>`<a class="ztile" href="#${g}"><span>${zi(i)}</span>${l}</a>`).join('')}</nav></div>
 <div class="zcolB">${zadiCard()}${fastCard()}<a class="zcard zrow" href="#lib" style="gap:12px"><span class="zi" style="width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:var(--z-soft);color:var(--accent);flex:none">${zi('library')}</span><div class="grow"><b style="font-size:15px">مكتبتي</b><div class="k">الرحيق المختوم، كتبك وملفاتك</div></div>${zi('chev','chv')}</a></div></div>
 <div class="zfoot"><div class="v">﴿وَتَزَوَّدُوا۟ فَإِنَّ خَيْرَ ٱلزَّادِ ٱلتَّقْوَىٰ﴾</div><div>[البقرة: ١٩٧]</div><div class="cr">صُنع بواسطة عمار الشمري</div><div style="margin-top:4px">${APP_NAME} ${typeof APP_VERSION!=='undefined'?ar(APP_VERSION):''}</div></div>`;
 bindZadi(view);tickSky();try{zInstall()}catch(e){}
 if(!PT){try{await loadTimes()}catch(e){}const w=document.getElementById('zskyw');if(w){w.innerHTML=skyHTML();tickSky()}}};
function zInstall(){const box=document.getElementById('zinst');if(!box)return;const st=matchMedia('(display-mode: standalone)').matches||navigator.standalone||sessionStorage.getItem('zad.twa')||/android-app:/.test(document.referrer);if(st)return;
 const and=/Android/i.test(navigator.userAgent),ios=/iPhone|iPad|iPod/.test(navigator.userAgent);if(!and&&!ios&&!window._bip)return;
 box.innerHTML=`<button class="zbanner" id="zib" style="width:100%;text-align:right;cursor:pointer;font:inherit">${zi('download')}<div><b>ثبّت تطبيق زاد</b><small>${and?'تطبيق أندرويد أو من المتصفح':ios?'أضفه إلى الشاشة الرئيسية':'تثبيت من المتصفح'}</small></div></button>`;
 $('#zib').onclick=()=>{const old=document.querySelector('.up-inst,#upinst,[data-install]');if(old){old.click();return}if(and){location.href='https://zad-app.sites.tab.bot/';return}if(window._bip){window._bip.prompt();return}if(ios)openSheet('<b style="font-size:17px">تثبيت زاد على الآيفون</b><p class="znote">١. اضغط زر المشاركة أسفل سفاري<br>٢. اختر «إضافة إلى الشاشة الرئيسية»</p>')}}

/* hub (المزيد) */
V.services=()=>{view.innerHTML=`<h1 class="page">كل الأقسام</h1><label class="zsearch">${zi('search')}<input type="search" id="zq" placeholder="ابحث عن قسم…" autocomplete="off"></label><div class="zhub" id="zhub"></div>`;
 const draw=q=>{q=(q||'').trim();$('#zhub').innerHTML=HUB.map(([g,items])=>{const it=items.filter(x=>!q||x[1].includes(q)||(x[3]||'').includes(q));if(!it.length)return'';return`<h2 class="sec">${g}</h2><div class="zlist">${it.map(([r,l,i,s])=>`<a class="zli" href="#${r}"><span class="zi">${zi(i)}</span><span class="grow">${l}${s?`<small>${s}</small>`:''}</span>${g.indexOf('جديد')===0?'<em>جديد</em>':''}${zi('chev','chv')}</a>`).join('')}</div>`}).join('')||'<p class="znote" style="text-align:center;margin:30px">لا توجد نتائج</p>'};
 draw();$('#zq').oninput=e=>draw(e.target.value)};
