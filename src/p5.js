
/* gallery: new designs drawn on the device from verified texts */
const ZT=[
 {n:'حبر',bg:['#f7f3ea','#ece4d4'],ink:'#1f2340',acc:'#9a4f2e',sub:'#6d6a73',deco:'ink'},
 {n:'ليل',bg:['#151a36','#2a3163'],ink:'#f3efe4',acc:'#e8a37c',sub:'#b7b9d6',deco:'night'},
 {n:'طين',bg:['#b8613a','#7d3a22'],ink:'#fff6ec',acc:'#ffd9bf',sub:'#f7d6c2',deco:'arch'},
 {n:'زجاج',bg:['#c9cdf0','#f3d3c4'],ink:'#1f2340',acc:'#34457a',sub:'#5b5f7c',deco:'glass'},
 {n:'مخطوطة',bg:['#efe4cc','#e0cfab'],ink:'#2d2416',acc:'#7a4b23',sub:'#6b5a3e',deco:'frame'},
 {n:'زيتوني',bg:['#3d4a2a','#252e1a'],ink:'#f4f1e2',acc:'#d8c88e',sub:'#c9cfb3',deco:'band'},
 {n:'أبيض',bg:['#ffffff','#f4f3f0'],ink:'#151515',acc:'#c0693f',sub:'#7a7a7a',deco:'min'},
 {n:'فجر',bg:['#2a2f5e','#7a5a8c','#e8a07e'],ink:'#ffffff',acc:'#ffe2c8',sub:'#f1dde6',deco:'horizon'},
 {n:'رمل',bg:['#f2e2c4','#d9b78a'],ink:'#3b2a17',acc:'#8a4f22',sub:'#6b4f33',deco:'dunes'},
 {n:'محراب',bg:['#1c1d22','#2b2c35'],ink:'#f2ece0',acc:'#d79a6f',sub:'#a9a49a',deco:'mihrab'},
 {n:'نيلي',bg:['#34457a','#1d2545'],ink:'#ffffff',acc:'#aab6ee',sub:'#c7cdee',deco:'stars'},
 {n:'وردي',bg:['#f6e6e2','#e9c7c1'],ink:'#4a2430',acc:'#8f3c52',sub:'#7b5560',deco:'ink'}];
function zItems(){const it=[];(ZD.v||[]).forEach(v=>it.push({k:'v',v}));(ZD.h||[]).forEach(h=>it.push({k:'h',h}));return it}
function star(g,x,y,r1,r2,n=8){g.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n-Math.PI/2,r=i%2?r2:r1;g.lineTo(x+r*Math.cos(a),y+r*Math.sin(a))}g.closePath()}
function wrapT(g,text,w){const words=text.split(/\s+/),L=[];let cur='';for(const x of words){const t=cur?cur+' '+x:x;if(g.measureText(t).width>w&&cur){L.push(cur);cur=x}else cur=t}cur&&L.push(cur);return L}
let zfontsP=null;const zFonts=()=>zfontsP||(zfontsP=Promise.all(['40px "Amiri Quran"','400 40px Amiri','700 40px Zad','400 40px Zad'].map(f=>document.fonts.load(f,'بسم الله').catch(()=>{}))));
function rrect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
async function zDraw(cv,item,ti,size='p',scale=1){await zFonts();const W=1080,H=size==='s'?1920:size==='q'?1080:1350,T=ZT[ti%ZT.length];cv.width=Math.round(W*scale);cv.height=Math.round(H*scale);const g=cv.getContext('2d');g.setTransform(scale,0,0,scale,0,0);
 const gr=g.createLinearGradient(0,0,W*.35,H);T.bg.forEach((c,i)=>gr.addColorStop(i/(T.bg.length-1),c));g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.save();const d=T.deco;g.strokeStyle=T.acc;g.fillStyle=T.acc;
 if(d==='ink'){g.globalAlpha=.55;g.lineWidth=2;g.beginPath();g.moveTo(150,170);g.lineTo(W-150,170);g.moveTo(150,H-170);g.lineTo(W-150,H-170);g.stroke();g.globalAlpha=1;star(g,W/2,170,22,10);g.fill();g.fillStyle=T.bg[0];star(g,W/2,170,9,4);g.fill();g.fillStyle=T.acc;star(g,W/2,H-170,13,6);g.fill()}
 else if(d==='night'){let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;g.fillStyle='#fff';for(let i=0;i<130;i++){g.globalAlpha=.15+rnd()*.6;g.beginPath();g.arc(rnd()*W,rnd()*H*.85,rnd()*2.2+.4,0,7);g.fill()}g.globalAlpha=1;g.fillStyle=T.acc;g.beginPath();g.arc(W-210,230,66,0,7);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(W-182,210,60,0,7);g.fill();g.globalCompositeOperation='source-over';g.globalAlpha=.22;g.lineWidth=1.5;for(let x=0;x<W+90;x+=90){star(g,x,H-40,38,17);g.stroke()}}
 else if(d==='arch'){g.globalAlpha=.45;g.lineWidth=3;const L=140,R=W-140,top=240,bot=H-170;g.beginPath();g.moveTo(L,bot);g.lineTo(L,top+200);g.quadraticCurveTo(L,top-10,W/2,top-50);g.quadraticCurveTo(R,top-10,R,top+200);g.lineTo(R,bot);g.stroke();g.globalAlpha=.6;star(g,W/2,top-50,14,6);g.fill()}
 else if(d==='glass'){[[200,260,340,'#7f8fd0'],[W-160,H-300,380,'#e8a37c'],[W*.72,300,220,'#ffffff']].forEach(([x,y,r,c])=>{const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,c);rg.addColorStop(1,'rgba(255,255,255,0)');g.globalAlpha=.8;g.fillStyle=rg;g.fillRect(0,0,W,H)});g.globalAlpha=1;g.fillStyle='rgba(255,255,255,.5)';g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2;rrect(g,110,190,W-220,H-380,48);g.fill();g.stroke()}
 else if(d==='frame'){g.lineWidth=4;g.strokeRect(70,70,W-140,H-140);g.lineWidth=1.5;g.strokeRect(92,92,W-184,H-184);[[92,92],[W-92,92],[92,H-92],[W-92,H-92]].forEach(([x,y])=>{g.fillStyle=T.bg[1];g.beginPath();g.arc(x,y,30,0,7);g.fill();g.fillStyle=T.acc;star(g,x,y,24,11);g.fill()})}
 else if(d==='band'){g.globalAlpha=.5;g.lineWidth=2;for(const yy of[100,H-100])for(let x=0;x<W+120;x+=120){star(g,x,yy,50,24);g.stroke();g.beginPath();g.arc(x,yy,13,0,7);g.stroke()}}
 else if(d==='min'){g.fillRect(W/2-36,210,72,6)}
 else if(d==='horizon'){g.globalAlpha=.35;g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(90,H-230);g.lineTo(W-90,H-230);g.stroke();g.globalAlpha=1;const sg=g.createRadialGradient(W/2,H-230,0,W/2,H-230,240);sg.addColorStop(0,'rgba(255,232,205,.85)');sg.addColorStop(1,'rgba(255,232,205,0)');g.fillStyle=sg;g.fillRect(0,H-470,W,240)}
 else if(d==='dunes'){[[.84,.16],[.91,.26]].forEach(([t,a])=>{g.globalAlpha=a;g.fillStyle=T.acc;g.beginPath();g.moveTo(0,H*t);g.bezierCurveTo(W*.3,H*(t-.06),W*.65,H*(t+.05),W,H*(t-.03));g.lineTo(W,H);g.lineTo(0,H);g.fill()})}
 else if(d==='mihrab'){g.lineWidth=3;g.globalAlpha=.85;const L=160,R=W-160,top=270,bot=H-170;g.beginPath();g.moveTo(L,bot);g.lineTo(L,top+200);g.bezierCurveTo(L,top+30,W/2-70,top+10,W/2,top-70);g.bezierCurveTo(W/2+70,top+10,R,top+30,R,top+200);g.lineTo(R,bot);g.closePath();g.stroke();g.globalAlpha=.06;g.fill();g.globalAlpha=1;star(g,W/2,top-70,15,7);g.fill()}
 else if(d==='stars'){g.globalAlpha=.11;g.lineWidth=1.5;for(let y=0;y<H+100;y+=100)for(let x=(y/100%2)*50;x<W+100;x+=100){star(g,x,y,34,16);g.stroke()}}
 g.restore();
 const isV=item.k==='v',body=isV?`﴿${item.v.t}﴾`:`«${item.h.t}»`,ref=isV?`سورة ${CH(item.v.sn)[1]} · الآية ${ar(item.v.a)}`:item.h.ref,label=isV?'':'قال رسول الله ﷺ';
 g.direction='rtl';g.textAlign='center';g.textBaseline='middle';
 const boxW=W-(['glass','arch','mihrab','frame'].includes(d)?360:280);const top=H*(d==='mihrab'?.3:.22),bot=H-(size==='s'?360:size==='q'?230:280);
 const fam=isV?'"Amiri Quran"':'Amiri',lh=isV?2.0:1.8;let sz=isV?80:68,lines=[];const lab=label?84:0;
 for(;sz>28;sz-=2){g.font=`${isV?'':'400 '}${sz}px ${fam}`;lines=wrapT(g,body,boxW);if(lines.length*sz*lh<=bot-top-lab)break}
 let y=top+Math.max(0,((bot-top)-(lines.length*sz*lh)-lab)/2);
 if(label){g.fillStyle=T.sub;g.font='700 34px Zad';g.fillText(label,W/2,y+22);y+=lab}
 g.fillStyle=T.ink;g.font=`${isV?'':'400 '}${sz}px ${fam}`;for(const L of lines){g.fillText(L,W/2,y+sz*lh/2);y+=sz*lh}
 g.fillStyle=T.acc;let rs=34;g.font=`700 ${rs}px Zad`;while(g.measureText(ref).width>W-220&&rs>18){rs-=2;g.font=`700 ${rs}px Zad`}g.fillText(ref,W/2,y+46);
 g.globalAlpha=.9;g.fillStyle=T.sub;g.font='700 30px Zad';g.fillText(APP_NAME,W/2,H-(size==='s'?170:96));g.globalAlpha=.75;g.font='400 20px Zad';g.direction='ltr';g.fillText('zad.sites.tab.bot',W/2,H-(size==='s'?132:62));g.globalAlpha=1}
window.zDraw=zDraw;window.ZT=ZT;window.zItems=zItems;
function zOpenDesign(item,ti){let size='p';openSheet(`<b style="font-size:17px">${item.k==='v'?'تصميم آية':'تصميم حديث'}</b><div class="zgv" style="margin-top:10px"><canvas id="zgc"></canvas></div><div class="zseg" style="margin-top:10px">${[['p','منشور'],['s','ستوري'],['q','مربع']].map(([k,l])=>`<button data-s="${k}" class="${k==='p'?'on':''}">${l}</button>`).join('')}</div><div class="zchips">${ZT.map((t,i)=>`<button class="zchip" data-t="${i}">${t.n}</button>`).join('')}</div><div class="zrow" style="margin-top:12px"><button class="btn grow" id="zgs">${zi('share')} مشاركة</button><button class="btn ghost grow" id="zgd">${zi('download')} حفظ</button></div><p class="znote">${item.k==='v'?'النص من api.alquran.cloud بالرسم العثماني':'النص من '+esc(item.h.url||'sunnah.com')}</p>`,root=>{const cv=root.querySelector('#zgc');const draw=()=>{zDraw(cv,item,ti,size,.5);root.querySelectorAll('[data-t]').forEach(b=>b.style.cssText=+b.dataset.t===ti%ZT.length?'background:var(--ink);color:var(--bg)':'')};draw();
 root.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{size=b.dataset.s;root.querySelectorAll('[data-s]').forEach(x=>x.classList.toggle('on',x===b));draw()});root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ti=+b.dataset.t;draw()});
 const blob=async()=>{const c=document.createElement('canvas');await zDraw(c,item,ti,size,1);return new Promise(r=>c.toBlob(r,'image/jpeg',.92))};
 root.querySelector('#zgd').onclick=async()=>{const b=await blob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`zad-${Date.now()}.jpg`;a.click();toast('تم الحفظ')};
 root.querySelector('#zgs').onclick=async()=>{const b=await blob(),f=new File([b],'zad.jpg',{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]})}catch(e){}}else root.querySelector('#zgd').click()}})}
window.zOpenDesign=zOpenDesign;
if(V.posts){const _posts=V.posts;V.posts=async arg=>{const r=await _posts(arg);if(document.getElementById('zgsec'))return r;const items=zItems(),flt=Z.gf||'all';const sec=document.createElement('section');sec.id='zgsec';
 sec.innerHTML=`<h2 class="sec">جديد زاد ٤: <span id="zgcount">${ar(items.length)}</span> تصميمًا</h2><p class="znote">تُرسم على جوالك بخطوط حقيقية. الآيات من api.alquran.cloud بالرسم العثماني، والأحاديث بنصها من sunnah.com مع رقمها. اضغط أي تصميم لتغيّر الثيم والمقاس، ثم احفظ أو شارك.</p><div class="zseg" style="margin:10px 0">${[['all','الكل'],['v','آيات'],['h','أحاديث']].map(([k,l])=>`<button data-gf="${k}" class="${k===flt?'on':''}">${l}</button>`).join('')}</div><div class="zgal" id="zgal">${items.map((it,i)=>flt==='all'||flt===it.k?`<button data-i="${i}"><canvas width="8" height="10"></canvas><small>${it.k==='v'?'سورة '+CH(it.v.sn)[1]+' · '+ar(it.v.a):esc(it.h.ref)}</small></button>`:'').join('')}</div><h2 class="sec">تصاميم الإصدارات السابقة</h2>`;
 const anchor=view.querySelector('.pzhero')||view.querySelector('h1.page');if(anchor)anchor.after(sec);else view.prepend(sec);
 sec.querySelectorAll('[data-gf]').forEach(b=>b.onclick=()=>{Z.gf=b.dataset.gf;save();V.posts(arg)});
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);const i=+e.target.dataset.i;zDraw(e.target.querySelector('canvas'),items[i],i%ZT.length,'p',.3).catch(()=>{})}}),{rootMargin:'400px'});
 sec.querySelectorAll('[data-i]').forEach(b=>{io.observe(b);b.onclick=()=>zOpenDesign(items[+b.dataset.i],+b.dataset.i%ZT.length)});return r}}

/* settings: v4 section */
if(V.settings){const _set=V.settings;V.settings=async(...a)=>{const r=await _set(...a);try{const sec=document.createElement('section');sec.className='zcard';sec.innerHTML=`<h3>${zi('sparkle')}زاد ٤</h3><div class="zlist" style="margin-top:10px"><a class="zli" href="#sawm"><span class="zi">${zi('fast')}</span><span class="grow">تذكير صيام التطوع<small>${Z.fast.mt||Z.fast.white?'مفعّل · '+ar(Z.fast.time):'متوقف'}</small></span>${zi('chev','chv')}</a><a class="zli" href="#sadaqa"><span class="zi">${zi('jar')}</span><span class="grow">تذكير الصدقة الأسبوعي<small>${Z.sad.on?'مفعّل':'متوقف'}</small></span>${zi('chev','chv')}</a><a class="zli" href="#lib"><span class="zi">${zi('upload')}</span><span class="grow">مكتبتي (ملفاتك المحفوظة)<small>${ar(Z.lib.length)} ملف</small></span>${zi('chev','chv')}</a><a class="zli" href="#whatsnew"><span class="zi">${zi('sparkle')}</span><span class="grow">ما الجديد</span>${zi('chev','chv')}</a></div><p class="znote" style="text-align:center;margin-top:12px">صُنع بواسطة عمار الشمري</p>`;const h=view.querySelector('h1.page');h?h.after(sec):view.prepend(sec)}catch(e){}return r}}

/* boot */
function init(){header();drawTabs4();try{zSyncSW()}catch(e){}try{scheduleReminders()}catch(e){}
 const r=(location.hash.slice(1)||'home').split('/')[0];if(['home','','services','lib','posts','settings'].includes(r)||!V[r])route();else markTab4()}
window.addEventListener('hashchange',markTab4);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
