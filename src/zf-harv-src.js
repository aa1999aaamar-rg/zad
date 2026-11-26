/* زاد v4.4: حصادي الشهري — only numbers the app recorded. Lazy module, minified to site/zf-harv.js */
(function(){'use strict';const {zi,ar,esc,back,F,day}=ZF;
const MN=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const HMN=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
function stats(y,m){const pre=y+'-'+String(m+1).padStart(2,'0'),inM=k=>String(k).slice(0,7)===pre,sumBy=(o,f)=>Object.entries(o||{}).reduce((s,[k,v])=>s+(inM(k)?f(v,k):0),0);
 const sal=S.salah||{},z4=S.z4||{},kh=(z4.kh&&z4.kh.log)||{};
 const prayers=sumBy(sal,v=>Object.keys(v||{}).length),jam=sumBy(sal,v=>Object.values(v||{}).filter(x=>x==='j').length);
 const pages=sumBy(S.khatma&&S.khatma.log,v=>+v||0);
 const hifz=Object.values(S.done||{}).filter(inM).length;
 const am=new Set([...Object.keys(S.adhkarDone||{}).filter(inM),...Object.keys(F.d).filter(k=>inM(k)&&F.d[k].m)]).size;
 const pm=Object.keys(F.d).filter(k=>inM(k)&&F.d[k].e).length;
 const tsb=sumBy(F.d,v=>+v.t||0),gk=Math.max(0,sumBy(F.d,v=>+v.k||0)),khm=sumBy(kh,v=>+v||0);
 const deeds=Object.keys(z4.deeds||{}).filter(inM).length,fast=Object.keys(S.fast||{}).filter(k=>inM(k)&&S.fast[k]).length;
 const ch=Object.keys((F.ch&&F.ch.all)||{}).filter(inM).length;let best=0;{const ks=Object.keys((F.ch&&F.ch.all)||{}).filter(inM).sort();let c=0,p=null;for(const k of ks){const d=new Date(k+'T12:00:00');d.setDate(d.getDate()-1);c=p===day(d)?c+1:1;best=Math.max(best,c);p=k}}
 return[['checkc','صلوات سجّلتها',prayers,'منها '+ar(jam)+' جماعة'],['quran','صفحات من ختمة القراءة',pages,''],['hifz','أيام ورد الحفظ',hifz,''],['sunrise','أيام أذكار الصباح',am,''],['moon','أيام أذكار المساء',pm,'يُسجَّل من تحديث ٤٫٤'],['beads','تسبيحات بالسبحة',tsb,'يُسجَّل من تحديث ٤٫٤'],['candle','دقائق وضع الخلوة',khm,''],['sparkle','تحديات «زادي اليومي»',deeds,''],['fast','أيام صيام سجّلتها',fast,''],['flame','أيام تحدي الأسبوع',ch,best>1?'أطول سلسلة '+ar(best):''],['circles','أجزاء أنهيتها في ختمة جماعية',gk,'']].map(([i,l,v,s])=>({i,l,v,s}))}
function hijSpan(y,m){try{const f=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});const p=d=>{const o={};f.formatToParts(d).forEach(x=>o[x.type]=x.value);return{m:+o.month,y:parseInt(o.year)}};const a=p(new Date(y,m,1,12)),b=p(new Date(y,m+1,0,12));return a.m===b.m?`${HMN[a.m-1]} ${ar(a.y)}هـ`:`${HMN[a.m-1]} – ${HMN[b.m-1]} ${ar(b.y)}هـ`}catch(e){return''}}
let sel=0;
const css=`.zfh .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.zfh .ht{border:1px solid var(--line);border-radius:16px;padding:12px;background:var(--card)}.zfh .ht span{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:var(--z-soft);color:var(--accent);margin-bottom:6px}.zfh .ht svg{width:19px;height:19px}.zfh .ht b{display:block;font-size:24px;line-height:1.2}.zfh .ht small{display:block;font-size:12px;color:var(--muted);line-height:1.4}.zfh .ht.no b{font-size:13px;color:var(--muted);font-weight:600;margin:6px 0 2px}.zfh .ht.no{opacity:.75}.zfh canvas{width:100%;border-radius:16px;display:block;box-shadow:var(--shadow)}.zfh .prev{max-width:300px;margin:0 auto}`;
ZF.m.harvest=()=>{if(!document.getElementById('zfhcss')){const s=document.createElement('style');s.id='zfhcss';s.textContent=css;document.head.appendChild(s)}
 const now=new Date(),d=new Date(now.getFullYear(),now.getMonth()-sel,1),y=d.getFullYear(),m=d.getMonth(),st=stats(y,m),real=st.filter(x=>x.v>0);
 view.innerHTML=`${back('services','المزيد')}<h1 class="page">حصادي الشهري</h1><div class="zfh">
 <div class="zseg" style="margin-bottom:10px">${[0,1,2].map(i=>{const x=new Date(now.getFullYear(),now.getMonth()-i,1);return`<button data-s="${i}" class="${i===sel?'on':''}">${MN[x.getMonth()]}</button>`}).join('')}</div>
 <section class="zcard"><div class="zrow" style="justify-content:space-between"><h3>${zi('chart')}${MN[m]} ${ar(y)}</h3><span class="k">${hijSpan(y,m)}</span></div>
 <div class="grid">${st.map(x=>x.v>0?`<div class="ht"><span>${zi(x.i)}</span><b>${ar(x.v.toLocaleString('en'))}</b><small>${x.l}${x.s?' · '+x.s:''}</small></div>`:`<div class="ht no"><span>${zi(x.i)}</span><small>${x.l}</small><b>لا توجد بيانات كافية</b></div>`).join('')}</div>
 <p class="znote">الأرقام كلها مما سجّلته في التطبيق على هذا الجهاز فقط، بدون تقدير. وما لم تسجّله يظهر «لا توجد بيانات كافية».</p></section>
 <section class="zcard"><h3>${zi('image')}بطاقة للمشاركة</h3>${real.length?`<div class="zseg" id="hsz" style="margin-bottom:10px"><button data-z="s" class="on">ستوري ١٠٨٠×١٩٢٠</button><button data-z="q">مربع ١٠٨٠×١٠٨٠</button></div><div class="prev"><canvas id="hcv"></canvas></div>
 <div class="zchips" style="justify-content:center;margin-top:10px"><button class="btn" id="hsh">${zi('share')} مشاركة</button><button class="btn ghost" id="hdl">${zi('download')} حفظ صورة</button></div>`:`<p class="znote">لا توجد بيانات كافية لهذا الشهر لصنع بطاقة. سجّل صلواتك وأذكارك وتسبيحك، وستظهر لك البطاقة.</p>`}</section></div>`;
 view.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{sel=+b.dataset.s;ZF.m.harvest()});
 if(!real.length)return;let sz='s';const draw=()=>card(sz,y,m,real).then(c=>{const v=$('#hcv');if(!v)return;v.width=c.width;v.height=c.height;v.getContext('2d').drawImage(c,0,0)});draw();
 view.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{sz=b.dataset.z;view.querySelectorAll('[data-z]').forEach(x=>x.classList.toggle('on',x===b));draw()});
 const blob=()=>card(sz,y,m,real).then(c=>new Promise(r=>c.toBlob(r,'image/png')));const fn=()=>`zad-harvest-${y}-${m+1}-${sz==='s'?'story':'square'}.png`;
 const dl=b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=fn();document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)};
 $('#hdl').onclick=async()=>dl(await blob());
 $('#hsh').onclick=async()=>{const b=await blob();const f=new File([b],fn(),{type:'image/png'});try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'حصادي الشهري',text:'حصادي في '+MN[m]+' مع تطبيق زاد'});return}}catch(e){if(e&&e.name==='AbortError')return}dl(b);toast('تم حفظ الصورة')}};
async function card(sz,y,m,real){try{await Promise.all(['700 60px Zad','400 30px Zad'].map(f=>document.fonts.load(f,'حصادي ٠١٢')))}catch(e){}
 const W=1080,H=sz==='s'?1920:1080,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
 const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#1d2545');bg.addColorStop(1,'#34457a');g.fillStyle=bg;g.fillRect(0,0,W,H);
 g.save();g.strokeStyle='rgba(232,163,124,.10)';g.lineWidth=2;const s=120;for(let yy=-s;yy<H+s;yy+=s)for(let xx=-s;xx<W+s;xx+=s){g.save();g.translate(xx+(yy/s%2?s/2:0),yy);g.beginPath();for(let k=0;k<16;k++){const r=k%2?24:44,a=k*Math.PI/8;g.lineTo(r*Math.cos(a),r*Math.sin(a))}g.closePath();g.stroke();g.restore()}g.restore();
 g.strokeStyle='rgba(232,163,124,.55)';g.lineWidth=3;g.strokeRect(40,40,W-80,H-80);
 g.direction='rtl';g.textAlign='center';g.fillStyle='#f2bd9b';g.font='700 40px Zad, sans-serif';const top=sz==='s'?210:120;g.fillText('حصادي الشهري',W/2,top);
 g.fillStyle='#fff';g.font='700 86px Zad, sans-serif';g.fillText(MN[m]+' '+ar(y),W/2,top+(sz==='s'?120:100));
 g.fillStyle='rgba(255,255,255,.7)';g.font='400 34px Zad, sans-serif';const hs=hijSpan(y,m);if(hs)g.fillText(hs,W/2,top+(sz==='s'?185:155));
 const items=real.slice(0,sz==='s'?8:6),cols=2,rows=Math.ceil(items.length/cols),gx=70,cw=(W-gx*2-30)/2,ch=sz==='s'?230:190,hb=top+(sz==='s'?260:190),fb=H-(sz==='s'?240:150),gh=rows*ch+(rows-1)*28,gy=Math.max(hb,hb+(fb-hb-gh)/2);
 items.forEach((it,i)=>{const col=i%cols,row=Math.floor(i/cols),x=(i===items.length-1&&items.length%2)?(W-cw)/2:W-gx-cw-col*(cw+30),yy=gy+row*(ch+28);g.fillStyle='rgba(255,255,255,.08)';rr(g,x,yy,cw,ch,32);g.fill();g.strokeStyle='rgba(255,255,255,.14)';g.lineWidth=2;g.stroke();
  g.textAlign='center';g.fillStyle='#fff';g.font=`700 ${sz==='s'?96:82}px Zad, sans-serif`;g.fillText(ar(it.v.toLocaleString('en')),x+cw/2,yy+ch*.52);g.fillStyle='#f2bd9b';g.font=`400 ${sz==='s'?34:30}px Zad, sans-serif`;g.fillText(it.l,x+cw/2,yy+ch*.8)});
 g.textAlign='center';g.fillStyle='rgba(255,255,255,.85)';g.font='700 46px Zad, sans-serif';g.fillText('زاد',W/2,H-(sz==='s'?150:95));g.fillStyle='rgba(255,255,255,.5)';g.font='400 26px Zad, sans-serif';g.fillText('أرقام سجّلتها بنفسي في تطبيق زاد',W/2,H-(sz==='s'?100:58));
 return c}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
ZF.harv={stats,card};
})();
