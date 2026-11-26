/* زاد v4.7.2 — «أذكاري»: أضف أي ذكر بعدده (ورقة «أضف ذكرك»)، تعديل/حذف/ترتيب، و«اختر من الأذكار» من حصن المسلم الموجود في التطبيق.
   زاد v4.7.1 — السبحة الجديدة. Lazy module on zad-content (/x/zt.js), opened by site/zf-tasb.js for #tasbeeh.
   6 styles (سبحة كاملة، سبحة مكبّرة، العداد الرقمي، خاتم التسبيح، زخرفة، وضع المسجد) × 6 bead skins,
   tap / swipe / opt-in shake counting, Android haptics, optional wood tick, free/target, دبر الصلاة, النوم,
   verified adhkar (sunnah.com), one-minute challenge, group challenge (/api/social/chal/*), goal/streak/charts/share.
   Data kept: S.tasb {i,target,count,total}, S.zf.tc {cust,sel}, S.zf.d[day].{t,tx}. New prefs live in S.tasb.p. */
(function(){'use strict';if(window.ZTSB)return;
const {zi,ar,esc,back,F,day,wake}=ZF;
const T=S.tasb=Object.assign({i:0,target:33,count:0,total:0},S.tasb||{});
const X=F.tc=Object.assign({cust:[],sel:null},F.tc||{});
const P=T.p=Object.assign({st:'beads',sk:'wood',snd:0,mot:0,sens:2,vib:1,goal:100,best:0,mode:'free',sq:null,ms:0,gd:'',grp:0,chq:{},v:1},T.p||{});
if(typeof P.chq!=='object'||!P.chq)P.chq={};
/* v4.7.2 «أذكاري»: X.my=[{id,t,n(target,0=بلا عدد),note,c(count),tot(total),at}]; X.cust stays a mirror of the texts (old v4.4 fallback reads it) */
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
if(!Array.isArray(X.my))X.my=[];
X.my=X.my.filter(m=>m&&typeof m.t==='string'&&m.t.trim());
function txTot(t){let n=0;try{for(const k in F.d){const o=F.d[k];if(o&&o.tx&&o.tx[t])n+=o.tx[t]}}catch(e){}return n}
function mirror(){X.cust=X.my.map(m=>m.t)}
(function mig(){const cu=Array.isArray(X.cust)?X.cust:[];let ch=0;
 cu.forEach((t,i)=>{if(typeof t!=='string')return;const tt=t.trim();if(!tt)return;let m=X.my.find(o=>o.t===tt);
  if(!m){m={id:uid(),t:tt,n:0,note:'',c:0,tot:txTot(tt),at:Date.now()};if(X.sel==='c'+i){m.c=+T.count||0;m.n=+T.target||0}X.my.push(m);ch=1}
  if(X.sel==='c'+i){X.sel='u:'+m.id;ch=1}});
 if(X.sel&&/^c\d+$/.test(X.sel)){X.sel=null;ch=1}
 mirror();if(ch)try{save()}catch(e){}})();
const H={"m597": "مَنْ سَبَّحَ اللَّهَ فِي دُبُرِ كُلِّ صَلاَةٍ ثَلاَثًا وَثَلاَثِينَ وَحَمِدَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ وَكَبَّرَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ فَتِلْكَ تِسْعَةٌ وَتِسْعُونَ وَقَالَ تَمَامَ الْمِائَةِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ", "b5362": "أَلاَ أُخْبِرُكِ مَا هُوَ خَيْرٌ لَكِ مِنْهُ، تُسَبِّحِينَ اللَّهَ عِنْدَ مَنَامِكِ ثَلاَثًا وَثَلاَثِينَ، وَتَحْمَدِينَ اللَّهَ ثَلاَثًا وَثَلاَثِينَ، وَتُكَبِّرِينَ اللَّهَ أَرْبَعًا وَثَلاَثِينَ", "b3113": "إِذَا أَخَذْتُمَا مَضَاجِعَكُمَا فَكَبِّرَا اللَّهَ أَرْبَعًا وَثَلاَثِينَ، وَاحْمَدَا ثَلاَثًا وَثَلاَثِينَ، وَسَبِّحَا ثَلاَثًا وَثَلاَثِينَ، فَإِنَّ ذَلِكَ خَيْرٌ لَكُمَا مِمَّا سَأَلْتُمَاهُ", "m2727": "إِذَا أَخَذْتُمَا مَضَاجِعَكُمَا أَنْ تُكَبِّرَا اللَّهَ أَرْبَعًا وَثَلاَثِينَ وَتُسَبِّحَاهُ ثَلاَثًا وَثَلاَثِينَ وَتَحْمَدَاهُ ثَلاَثًا وَثَلاَثِينَ فَهُوَ خَيْرٌ لَكُمَا مِنْ خَادِمٍ", "b6405": "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ. فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ، وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ", "b6384": "قُلْ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ فَإِنَّهَا. كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ", "b6406": "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ، سُبْحَانَ اللَّهِ الْعَظِيمِ، سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", "m408": "مَنْ صَلَّى عَلَىَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا", "m2702": "إِنَّهُ لَيُغَانُ عَلَى قَلْبِي وَإِنِّي لأَسْتَغْفِرُ اللَّهَ فِي الْيَوْمِ مِائَةَ مَرَّةٍ", "b6307": "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً", "b6403": "مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهْوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ. فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ، حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ إِلاَّ رَجُلٌ عَمِلَ أَكْثَرَ مِنْهُ"};
const TAHLIL="لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ";
const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
const CAN_VIB=!IOS&&typeof navigator.vibrate==='function';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const sv=()=>{try{save()}catch(e){}};
const toast_=t=>{try{toast(t)}catch(e){}};
const pres=()=>(typeof DHIKR!=='undefined'?DHIKR:['سُبْحَانَ اللَّهِ','الْحَمْدُ لِلَّهِ','اللَّهُ أَكْبَرُ']);
const SB=k=>'https://sunnah.com/'+k;
/* verified virtues (text copied from the sunnah.com pages; Bukhari/Muslim = صحيح) */
const VB={
 p4:{r:'صحيح مسلم ٢٧٠٢',u:SB('muslim:2702a'),h:H.m2702,n:100,x:{r:'صحيح البخاري ٦٣٠٧',u:SB('bukhari:6307'),h:H.b6307}},
 p5:{r:'صحيح البخاري ٦٤٠٥',u:SB('bukhari:6405'),h:H.b6405,n:100},
 p6:{r:'صحيح البخاري ٦٣٨٤',u:SB('bukhari:6384'),h:H.b6384},
 p7:{r:'صحيح مسلم ٤٠٨',u:SB('muslim:408'),h:H.m408},
 v0:{r:'صحيح البخاري ٦٤٠٦',u:SB('bukhari:6406'),h:H.b6406},
 v1:{r:'صحيح البخاري ٦٤٠٣',u:SB('bukhari:6403'),h:H.b6403,n:100}};
const EXTRA=[{k:'v0',t:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ'},{k:'v1',t:'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ'}];
const SEQ={
 salah:{t:'تسبيح دبر الصلاة',s:[[0,33],[1,33],[2,33],[-1,1]],v:{r:'صحيح مسلم ٥٩٧',u:SB('muslim:597'),h:H.m597},done:'غُفِرَتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ'},
 sleep:{t:'تسبيح النوم',s:[[0,33],[1,33],[2,34]],v:{r:'صحيح البخاري ٥٣٦٢',u:SB('bukhari:5362'),h:H.b5362},more:[{r:'صحيح البخاري ٣١١٣',u:SB('bukhari:3113'),h:H.b3113},{r:'صحيح مسلم ٢٧٢٧',u:SB('muslim:2727'),h:H.m2727}],done:'فَهُوَ خَيْرٌ لَكُمَا مِنْ خَادِمٍ'}};
const stepText=i=>i<0?TAHLIL:pres()[i];
/* group challenge (phase 2 server) */
const G={L:[],at:0};
const liveCh=()=>G.L.filter(c=>c.status==='live');
const list=()=>pres().map((t,i)=>({k:'p'+i,t,v:VB['p'+i]})).concat(EXTRA.map(x=>({k:x.k,t:x.t,v:VB[x.k]})),X.my.map(m=>({k:'u:'+m.id,t:m.t,c:1,u:m})),liveCh().map(c=>({k:'g:'+c.id,t:c.dhikr,g:c})));
const cur=()=>{const l=list();return l.find(x=>x.k===X.sel)||l[Math.min(T.i||0,l.length-1)]||l[0]};
/* ---------- state helpers ---------- */
const seqOn=()=>P.mode==='salah'||P.mode==='sleep';
function sq(){if(!seqOn())return null;if(!P.sq||P.sq.id!==P.mode)P.sq={id:P.mode,s:0,n:0,done:0};return P.sq}
function curText(){const q=sq();if(q){const st=SEQ[q.id].s[Math.min(q.s,SEQ[q.id].s.length-1)];return stepText(st[0])}return cur().t}
function num(){const q=sq();if(q)return q.n;if(CH.on)return CH.n;return T.count}
function tgt(){const q=sq();if(q)return SEQ[q.id].s[Math.min(q.s,SEQ[q.id].s.length-1)][1];if(CH.on)return 0;return +T.target||0}
function dayTot(k){const o=F.d[k];return(o&&o.t)||0}
function dkey(off){const d=new Date();d.setDate(d.getDate()-off);return day(d)}
function streak(){const g=Math.max(1,+P.goal||100);let s=0,i=dayTot(dkey(0))>=g?0:1;for(;i<4000;i++){if(dayTot(dkey(i))>=g)s++;else break}return s}
/* ---------- feedback ---------- */
let AC=null;
function tick(lvl){if(!P.snd)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const t=AC.currentTime,sr=AC.sampleRate,n=Math.floor(sr*.045),b=AC.createBuffer(1,n,sr),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(sr*.0045));const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=lvl?1250:1850;f.Q.value=3.2;const g=AC.createGain();g.gain.value=lvl?.9:.55;s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t)}catch(e){}}
function buzz(lvl){if(!CAN_VIB||!P.vib)return;try{navigator.vibrate(lvl===2?[220,90,220]:lvl===1?[130]:9)}catch(e){}}
/* ---------- the one counting entry ---------- */
let STG=null,locked=false;
function hit(src){if(locked&&src!=='tap')return 0;
 const text=curText(),k=day(),o=F.d[k]=F.d[k]||{};o.t=(o.t||0)+1;o.tx=o.tx||{};o.tx[text]=(o.tx[text]||0)+1;T.total=(T.total||0)+1;
 let lvl=0,ev=null;const q=sq();
 if(q){if(q.done){q.s=0;q.n=0;q.done=0}q.n++;const L=SEQ[q.id].s,st=L[q.s];if(q.n>=st[1]){if(q.s>=L.length-1){q.done=1;lvl=2;ev='seqdone'}else{q.s++;q.n=0;lvl=1;ev='step'}}}
 else if(CH.on){CH.n++;}
 else{T.count=(T.count||0)+1;const cu_=cur();if(cu_.u){cu_.u.c=T.count;cu_.u.tot=(cu_.u.tot||0)+1;cu_.u.n=+T.target||0}const n=T.count,t=+T.target||0;if(n%100===0||(t>=99&&n%t===0))lvl=2;else if(n%33===0||(t&&n%t===0))lvl=1;if(t&&n%t===0)ev='target'}
 const c=cur();if(!q&&!CH.on&&c.g&&P.grp){P.chq[c.g.id]=(P.chq[c.g.id]||0)+1;qFlush()}
 buzz(lvl);tick(lvl);sv();
 paint(lvl,ev);milestones();
 return lvl}
/* ---------- group challenge sync ---------- */
let qT=0,flushing=false;
function qFlush(){clearTimeout(qT);qT=setTimeout(flush,5000)}
async function flush(){clearTimeout(qT);if(flushing||!navigator.onLine||!window.ZS||!ZS.api)return;const ids=Object.keys(P.chq).filter(k=>P.chq[k]>0);if(!ids.length)return;flushing=true;
 for(const id of ids){const n=Math.min(500,P.chq[id]);try{const r=await ZS.api('chal/add',{id,n});if(r.ok){P.chq[id]-=n;if(P.chq[id]<=0)delete P.chq[id];const c=G.L.find(x=>x.id===id);if(c&&r.count!=null){c.count=r.count;c.mine=r.mine}paintG()}else if(r._s===409||r._s===404||r.error==='cap'){delete P.chq[id];if(r.msg)toast_(r.msg)}}catch(e){}}
 flushing=false;sv()}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});
async function loadG(){if(!window.ZS||!ZS.api||!navigator.onLine)return;try{const j=await ZS.api('chal/list');if(j&&j.ok){G.L=j.items||[];G.at=Date.now();if(location.hash.slice(1).split('/')[0]==='tasbeeh'){paintG();if(X.sel&&X.sel.startsWith('g:')&&!liveCh().some(c=>'g:'+c.id===X.sel)){X.sel=null}renderChips()}}}catch(e){}}
/* ---------- bead drawing (canvas, gradients only) ---------- */
const SK={wood:{n:'عود',a:'#c8925e',b:'#7d4a26',c:'#3a1f0e',th:'#5a3b26',ts:['#7a3d1d','#a8562a','#5c2b12']},
 amber:{n:'كهرمان',a:'#ffe08a',b:'#e8961f',c:'#8a4306',th:'#6b4a2a',ts:['#c0693f','#d98a3a','#8f4520'],glow:1},
 pearl:{n:'لؤلؤ',a:'#ffffff',b:'#ece4d8',c:'#b3a796',th:'#b9a98f',ts:['#e6e1d6','#cfc5b4','#f6f4ef'],iri:1},
 yusr:{n:'يُسر',a:'#7b7f88',b:'#24262c',c:'#050506',th:'#2a2a2e',ts:['#1d2545','#34457a','#121828']},
 turq:{n:'فيروز',a:'#a6f0e6',b:'#2fb2a4',c:'#0f5a53',th:'#3c4f4c',ts:['#1f7f75','#2fb2a4','#145a52'],vein:1},
 crystal:{n:'كريستال',a:'rgba(255,255,255,.95)',b:'rgba(185,205,235,.42)',c:'rgba(70,95,140,.55)',th:'#9aa6b8',ts:['#c9d3e3','#e9eef6','#9aa6b8'],cry:1}};
function bead(x,y,r,k,cx){const s=SK[k]||SK.wood;
 cx.save();cx.fillStyle='rgba(20,15,10,.18)';cx.beginPath();cx.ellipse(x+r*.12,y+r*.78,r*.82,r*.3,0,0,7);cx.fill();
 const g=cx.createRadialGradient(x-r*.38,y-r*.42,r*.08,x,y,r*1.05);g.addColorStop(0,s.a);g.addColorStop(.55,s.b);g.addColorStop(1,s.c);
 cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();
 if(s.glow){const h=cx.createRadialGradient(x+r*.25,y+r*.4,0,x+r*.25,y+r*.4,r*.75);h.addColorStop(0,'rgba(255,214,120,.75)');h.addColorStop(1,'rgba(255,214,120,0)');cx.fillStyle=h;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill()}
 if(s.iri){const h=cx.createLinearGradient(x-r,y-r,x+r,y+r);h.addColorStop(0,'rgba(255,200,220,.28)');h.addColorStop(.5,'rgba(200,230,255,.12)');h.addColorStop(1,'rgba(210,255,230,.25)');cx.fillStyle=h;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill()}
 if(k==='wood'){cx.save();cx.beginPath();cx.arc(x,y,r,0,7);cx.clip();cx.strokeStyle='rgba(50,25,10,.28)';cx.lineWidth=Math.max(.6,r*.07);for(let i=-2;i<=2;i++){cx.beginPath();cx.ellipse(x+i*r*.18,y,r*.35+Math.abs(i)*r*.22,r*1.2,.25,0,7);cx.stroke()}cx.restore()}
 if(s.vein){cx.save();cx.beginPath();cx.arc(x,y,r,0,7);cx.clip();cx.strokeStyle='rgba(40,45,40,.4)';cx.lineWidth=Math.max(.5,r*.05);cx.beginPath();cx.moveTo(x-r,y-r*.2);cx.quadraticCurveTo(x-r*.1,y+r*.25,x+r,y-r*.1);cx.moveTo(x-r*.3,y+r);cx.quadraticCurveTo(x,y+r*.3,x+r*.5,y+r*.9);cx.stroke();cx.restore()}
 if(s.cry){cx.strokeStyle='rgba(255,255,255,.65)';cx.lineWidth=Math.max(.6,r*.06);cx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+.3;cx.moveTo(x+Math.cos(a)*r*.45,y+Math.sin(a)*r*.45);cx.lineTo(x+Math.cos(a)*r*.98,y+Math.sin(a)*r*.98)}cx.stroke();cx.beginPath();for(let i=0;i<=6;i++){const a=i*Math.PI/3+.3;cx[i?'lineTo':'moveTo'](x+Math.cos(a)*r*.45,y+Math.sin(a)*r*.45)}cx.stroke();cx.strokeStyle='rgba(60,80,120,.45)';cx.beginPath();cx.arc(x,y,r,0,7);cx.stroke()}
 const sp=cx.createRadialGradient(x-r*.4,y-r*.45,0,x-r*.4,y-r*.45,r*.5);sp.addColorStop(0,'rgba(255,255,255,.9)');sp.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=sp;cx.beginPath();cx.arc(x-r*.4,y-r*.45,r*.5,0,7);cx.fill();
 cx.restore()}
function imam(x,y,r,ang,k,cx,glow){const s=SK[k]||SK.wood;cx.save();cx.translate(x,y);cx.rotate(ang);
 if(glow>0){cx.fillStyle=`rgba(192,105,63,${.35*glow})`;cx.beginPath();cx.ellipse(0,0,r*2.6,r*1.7,0,0,7);cx.fill()}
 const g=cx.createLinearGradient(0,-r,0,r);g.addColorStop(0,s.a);g.addColorStop(.5,s.b);g.addColorStop(1,s.c);cx.fillStyle=g;cx.beginPath();cx.ellipse(0,0,r*1.75,r*.95,0,0,7);cx.fill();
 const m=cx.createLinearGradient(0,-r,0,r);m.addColorStop(0,'#f3d58b');m.addColorStop(.5,'#b8913a');m.addColorStop(1,'#6e531c');cx.fillStyle=m;
 for(const sx of[-1,1]){cx.beginPath();cx.ellipse(sx*r*1.62,0,r*.26,r*.72,0,0,7);cx.fill()}
 cx.fillStyle='rgba(255,255,255,.55)';cx.beginPath();cx.ellipse(-r*.4,-r*.45,r*.7,r*.18,0,0,7);cx.fill();cx.restore()}
function tassel(x,y,r,k,cx,sway){const s=SK[k]||SK.wood;cx.save();cx.translate(x,y);
 const m=cx.createLinearGradient(-r,0,r,0);m.addColorStop(0,'#6e531c');m.addColorStop(.5,'#f3d58b');m.addColorStop(1,'#6e531c');
 cx.fillStyle=m;cx.beginPath();cx.moveTo(-r*.35,0);cx.lineTo(r*.35,0);cx.lineTo(r*.55,r*1.3);cx.lineTo(-r*.55,r*1.3);cx.closePath();cx.fill();
 const L=r*5.2;for(let i=0;i<26;i++){const t=i/25,x0=(t-.5)*r*1.0,ex=(t-.5)*r*2.4+sway*L*.35;cx.strokeStyle=s.ts[i%3];cx.lineWidth=Math.max(1,r*.11);cx.beginPath();cx.moveTo(x0,r*1.25);cx.quadraticCurveTo(x0+sway*L*.12,r*1.25+L*.5,ex,r*1.25+L*(.92+.08*Math.sin(i*1.7)));cx.stroke()}
 cx.fillStyle=m;cx.beginPath();cx.ellipse(0,r*1.75,r*.62,r*.24,0,0,7);cx.fill();cx.restore()}
/* ---------- physics phase (shared by both bead styles) ---------- */
function slots(){const q=sq();if(q){let s=0;const L=SEQ[q.id].s;for(let i=0;i<q.s;i++)s+=L[i][1];return s+q.n}return CH.on?CH.n:T.count}
const ph=c=>c+Math.floor(c/33);
function Phys(){this.x=ph(slots());this.v=0;this.t=this.x;this.drag=0;this.sw=0;this.swv=0}
Phys.prototype.step=function(dt){const k=210,c=21;const tg=this.t+this.drag;const a=k*(tg-this.x)-c*this.v;this.v+=a*dt;this.x+=this.v*dt;
 const sa=-this.v*.055-this.sw*60-this.swv*7;this.swv+=sa*dt;this.sw+=this.swv*dt;this.sw=Math.max(-.6,Math.min(.6,this.sw))};
function canvasFit(cv,w,h){const d=Math.min(2.5,window.devicePixelRatio||1);cv.width=Math.round(w*d);cv.height=Math.round(h*d);cv.style.width=w+'px';cv.style.height=h+'px';const cx=cv.getContext('2d');cx.setTransform(d,0,0,d,0,0);return cx}
/* gesture helper: tap = short press with little movement; drag along an axis advances the phase */
function gestures(el,o){let st=null;
 el.addEventListener('pointerdown',e=>{if(e.button>0)return;st={x:e.clientX,y:e.clientY,t:performance.now(),used:0};try{el.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault();if(o.down)o.down()});
 el.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;if(o.drag){let f=o.drag(dx,dy)-st.used;while(f>=1){st.used++;f--;hit('swipe')}o.frac&&o.frac(Math.max(-.3,Math.min(.98,f)))}});
 const up=e=>{if(!st)return;const dx=e.clientX-st.x,dy=e.clientY-st.y,mv=Math.hypot(dx,dy),dt=performance.now()-st.t;let f=o.drag?o.drag(dx,dy)-st.used:0;o.frac&&o.frac(0);
  if(st.used===0&&mv<10&&dt<600)hit('tap');else if(f>.42)hit('swipe');st=null};
 el.addEventListener('pointerup',up);el.addEventListener('pointercancel',()=>{st=null;o.frac&&o.frac(0)})}
/* STYLE 1: full misbaha loop — 33 beads + imam/divider + tassel; each count rotates the string one bead */
function StyleLoop(host,mini){const csx=getComputedStyle(document.body),INK=(csx.getPropertyValue('--ink')||'').trim()||'#1d2545',MUT=(csx.getPropertyValue('--muted')||'').trim()||'#7a7f8f';const W=mini?150:Math.min(360,host.clientWidth||340),Hh=mini?120:Math.round(W*1.12);
 const cv=document.createElement('canvas');host.appendChild(cv);const cx=canvasFit(cv,W,Hh);const p=new Phys();
 const cxp=W/2,cyp=Hh*.46,rx=W*.4,ry=Hh*.38;const N=720,pts=[],cum=[0];for(let i=0;i<=N;i++){const a=i/N*2*Math.PI;pts.push([cxp+rx*Math.sin(a),cyp-ry*Math.cos(a)]);if(i)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]))}
 const LEN=cum[N];const at=u=>{u=((u%1)+1)%1;const s=u*LEN;let lo=0,hi=N;while(hi-lo>1){const m=(lo+hi)>>1;if(cum[m]<s)lo=m;else hi=m}const f=(s-cum[lo])/((cum[hi]-cum[lo])||1);return[pts[lo][0]+(pts[hi][0]-pts[lo][0])*f,pts[lo][1]+(pts[hi][1]-pts[lo][1])*f]};
 const gw=1.7/(33+1.7),pitch=(1-gw)/33,r=Math.min(13.5,LEN*pitch*.47);
 const uOf=pp=>{pp=((pp%34)+34)%34;return pp<=33?gw/2+pp*pitch:1-gw/2+(pp-33)*gw};
 let glow=0,raf=0,last=performance.now(),alive=true;
 function draw(){const now=performance.now(),dt=Math.min(.034,(now-last)/1000);last=now;p.step(dt);glow=Math.max(0,glow-dt*1.1);
  cx.clearRect(0,0,W,Hh);
  cx.strokeStyle=(SK[P.sk]||SK.wood).th;cx.lineWidth=mini?1.2:2;cx.beginPath();for(let i=0;i<=N;i+=4){const q=pts[i];cx[i?'lineTo':'moveTo'](q[0],q[1])}cx.closePath();cx.stroke();
  if(!mini){cx.fillStyle='rgba(192,105,63,.13)';cx.beginPath();cx.arc(cxp,cyp-ry,r*1.9,0,7);cx.fill()}
  let im=null;const order=[];for(let i=0;i<34;i++){const pp=i-p.x;const u=uOf(pp);order.push([i,u])}
  for(const[i,u]of order){const[x,y]=at(u);if(i===33){const[a1,b1]=at(u-.004),[a2,b2]=at(u+.004);im=[x,y,Math.atan2(b2-b1,a2-a1)]}else bead(x,y,r,P.sk,cx)}
  if(!mini){cx.save();cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle=INK;cx.font=`700 ${Math.round(W*.2)}px "IBM Plex Sans Arabic",system-ui,sans-serif`;cx.fillText(ar(num()),cxp,cyp-8);cx.font=`400 ${Math.round(W*.04)}px "IBM Plex Sans Arabic",system-ui,sans-serif`;cx.fillStyle=MUT;const tg_=tgt();cx.fillText(tg_?'من '+ar(tg_):'بلا حد',cxp,cyp+W*.12);cx.restore()}
  if(im){tassel(im[0],im[1]+r*.6,r,P.sk,cx,p.sw+Math.sin(now/900)*.03);imam(im[0],im[1],r,im[2],P.sk,cx,glow)}
  if(alive&&!mini)raf=requestAnimationFrame(draw)}
 draw();
 if(!mini)gestures(cv,{drag:(dx,dy)=>Math.max(-dx,dy)/(LEN*pitch*1.05),frac:f=>{p.drag=f}});
 return{el:cv,update(lvl){const nt=ph(slots());if(nt<p.t-.5){p.x=nt-1;p.v=0}p.t=nt;if(lvl)glow=1;if(mini)draw()},reset(){p.t=ph(slots());p.x=p.t;p.v=0},destroy(){alive=false;cancelAnimationFrame(raf)}}}
/* STYLE 2: close-up — big beads on an arc, swipe down to pull them past the thumb mark, divider every 33 */
function StyleZoom(host,mini){const W=mini?150:Math.min(360,host.clientWidth||340),Hh=mini?120:400;
 const cv=document.createElement('canvas');host.appendChild(cv);const cx=canvasFit(cv,W,Hh);const p=new Phys();
 const R=mini?150:520,ccx=W*.5+R*.86,ccy=Hh/2,br=mini?13:34,pitchA=(br*2.25)/R;let glow=0,raf=0,last=performance.now(),alive=true;
 function draw(){const now=performance.now(),dt=Math.min(.034,(now-last)/1000);last=now;p.step(dt);glow=Math.max(0,glow-dt*1.1);cx.clearRect(0,0,W,Hh);
  const a0=Math.PI;cx.strokeStyle=(SK[P.sk]||SK.wood).th;cx.lineWidth=mini?1.5:3;cx.beginPath();cx.arc(ccx,ccy,R,a0-.9,a0+.9);cx.stroke();
  if(!mini){cx.fillStyle='rgba(192,105,63,.12)';cx.fillRect(0,ccy-1,W,2);cx.fillStyle='rgba(192,105,63,.85)';cx.beginPath();cx.moveTo(W-6,ccy);cx.lineTo(W-20,ccy-9);cx.lineTo(W-20,ccy+9);cx.fill()}
  const base=Math.floor(p.x);for(let j=-6;j<=6;j++){const e=base+j,off=e-p.x,ang=a0+off*pitchA;if(Math.abs(off)*pitchA>1)continue;const x=ccx+R*Math.cos(ang),y=ccy+R*Math.sin(ang);
   if(((e%34)+34)%34===33)imam(x,y,br*.8,ang+Math.PI/2,P.sk,cx,glow);else bead(x,y,br,P.sk,cx)}
  if(alive&&!mini)raf=requestAnimationFrame(draw)}
 draw();
 if(!mini)gestures(cv,{drag:(dx,dy)=>dy/(br*2.25),frac:f=>{p.drag=f}});
 return{el:cv,update(lvl){const nt=ph(slots());if(nt<p.t-.5){p.x=nt-1;p.v=0}p.t=nt;if(lvl)glow=1;if(mini)draw()},reset(){p.t=ph(slots());p.x=p.t;p.v=0},destroy(){alive=false;cancelAnimationFrame(raf)}}}
/* STYLE 3: classic digital ring */
function ringSVG(n,t,sz){const p=t?Math.min(1,(n%t||(n?t:0))/t):0,C=2*Math.PI*46;return`<svg class="rg" viewBox="0 0 100 100" width="${sz}" height="${sz}"><defs><linearGradient id="ztg${sz}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c0693f"/><stop offset="1" stop-color="#34457a"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="none" stroke="var(--line,#e6e1d6)" stroke-width="5"/><circle cx="50" cy="50" r="46" fill="none" stroke="url(#ztg${sz})" stroke-width="5.4" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset .18s"/></svg>`}
function StyleRing(host,mini){const el=document.createElement('div');el.className='zt-ring'+(mini?' mini':'');host.appendChild(el);
 const draw=()=>{el.innerHTML=`${ringSVG(num(),tgt(),mini?110:300)}<div class="in"><b>${ar(num())}</b>${mini?'':`<small>${tgt()?'من '+ar(tgt()):'بلا حد'}</small>`}</div>`};draw();
 if(!mini)gestures(el,{});
 return{el,update(lvl){draw();if(lvl)pulse(el,lvl)},reset:draw,destroy(){}}}
/* STYLE 4: finger-ring counter (خاتم التسبيح) */
function StyleFinger(host,mini){const el=document.createElement('div');el.className='zt-fing'+(mini?' mini':'');host.appendChild(el);
 const pad=n=>ar(String(n).padStart(5,'0'));
 el.innerHTML=`<svg viewBox="0 0 240 240" class="fr"><defs><linearGradient id="ztm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ebef"/><stop offset=".45" stop-color="#9aa1ad"/><stop offset=".7" stop-color="#f6f7f9"/><stop offset="1" stop-color="#6b7280"/></linearGradient><linearGradient id="ztb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34457a"/><stop offset="1" stop-color="#1d2545"/></linearGradient></defs>
 <ellipse cx="120" cy="150" rx="92" ry="70" fill="none" stroke="url(#ztm)" stroke-width="22"/><ellipse cx="120" cy="150" rx="92" ry="70" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="2"/>
 <rect x="42" y="40" width="156" height="104" rx="30" fill="url(#ztb)" stroke="url(#ztm)" stroke-width="5"/><rect x="62" y="56" width="116" height="40" rx="8" fill="#b9c7a3" stroke="#6e7d5a" stroke-width="1.5"/>
 <circle cx="152" cy="120" r="13" fill="url(#ztm)" class="cb"/><circle cx="88" cy="120" r="7" fill="url(#ztm)" opacity=".85"/></svg><div class="lcd" dir="ltr">${pad(num())}</div>${mini?'':'<div class="lbl">اضغط الخاتم</div>'}`;
 if(!mini)gestures(el,{down(){el.classList.remove('pr');void el.offsetWidth;el.classList.add('pr')}});
 return{el,update(lvl){$('.lcd',el).textContent=pad(num());if(lvl)pulse(el,lvl)},reset(){$('.lcd',el).textContent=pad(num())},destroy(){}}}
/* STYLE 5: زخرفة — 33 petals around an 8-point star, lighting up one per count */
function StyleRose(host,mini){const el=document.createElement('div');el.className='zt-rose'+(mini?' mini':'');host.appendChild(el);
 let h='';for(let i=0;i<33;i++){const a=i*360/33;h+=`<path class="pt" d="M50 9 C54 17 54 23 50 28 C46 23 46 17 50 9Z" transform="rotate(${a.toFixed(2)} 50 50)"/>`}
 let star='';for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,rr=i%2?12:24;star+=(i?'L':'M')+(50+rr*Math.cos(a)).toFixed(2)+' '+(50+rr*Math.sin(a)).toFixed(2)}
 el.innerHTML=`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--line,#e6e1d6)" stroke-width=".6"/>${h}<path class="st" d="${star}Z"/></svg><b class="rn">${ar(num())}</b>`;
 const paintR=()=>{const n=num(),k=n%33||(n?33:0);$$('.pt',el).forEach((e,i)=>e.classList.toggle('on',i<k));$('.rn',el).textContent=ar(n)};paintR();
 if(!mini)gestures(el,{});
 return{el,update(lvl){paintR();if(lvl){el.classList.remove('done');void el.offsetWidth;el.classList.add('done')}},reset:paintR,destroy(){}}}
/* STYLE 6 preview (the real one is the full-screen overlay) */
function StyleMinPrev(host){const el=document.createElement('div');el.className='zt-minp';el.innerHTML=`<b>${ar(num())}</b><small>اضغط في أي مكان</small>`;host.appendChild(el);return{el,update(){$('b',el).textContent=ar(num())},reset(){},destroy(){}}}
const STY=[{k:'beads',n:'سبحة كاملة',h:'٣٣ حبة وشاهد وشرابة',f:StyleLoop},{k:'zoom',n:'سبحة مكبّرة',h:'اسحب الحبات للأسفل',f:StyleZoom},{k:'ring',n:'العداد الرقمي',h:'حلقة تمتلئ مع العد',f:StyleRing},{k:'finger',n:'خاتم التسبيح',h:'شاشة صغيرة وزر',f:StyleFinger},{k:'rose',n:'زخرفة',h:'٣٣ بتلة تضيء',f:StyleRose},{k:'min',n:'وضع المسجد',h:'شاشة سوداء وقفل',f:StyleMinPrev}];
function pulse(el,lvl){const c=lvl===2?'zt-p2':'zt-p1';el.classList.remove('zt-p1','zt-p2');void el.offsetWidth;el.classList.add(c)}
/* ---------- minimal full-screen (masjid) ---------- */
let MIN=null;
function openMin(){if(MIN)return;const d=document.createElement('div');d.className='zt-dark';
 d.innerHTML=`<button class="zx" aria-label="خروج">خروج</button><div class="lk" aria-live="polite"></div><b>${ar(num())}</b><small class="dt">${esc(curText())}</small><small class="hn">اضغط في أي مكان · اضغط مطولًا للقفل</small>`;document.body.appendChild(d);MIN=d;
 let st=null,lt=0;const setL=v=>{locked=v;d.classList.toggle('locked',v);$('.lk',d).innerHTML=v?`${zi('lock')||''}مقفل — اضغط مطولًا للفتح`:'';buzz(1)};
 d.addEventListener('pointerdown',e=>{if(e.target.closest('.zx'))return;e.preventDefault();st={x:e.clientX,y:e.clientY,t:performance.now(),lp:0};clearTimeout(lt);lt=setTimeout(()=>{if(st){st.lp=1;setL(!locked)}},750)});
 d.addEventListener('pointermove',e=>{if(st&&Math.hypot(e.clientX-st.x,e.clientY-st.y)>14){clearTimeout(lt)}});
 d.addEventListener('pointerup',e=>{clearTimeout(lt);if(!st)return;const s=st;st=null;if(s.lp||locked)return;if(performance.now()-s.t<700&&Math.hypot(e.clientX-s.x,e.clientY-s.y)<24){const l=hit('tap');if(l){d.classList.remove('f1','f2');void d.offsetWidth;d.classList.add(l===2?'f2':'f1')}}});
 $('.zx',d).onclick=()=>{if(locked){toast_('افتح القفل أولًا (اضغط مطولًا)');return}closeMin()}}
function closeMin(){if(MIN){MIN.remove();MIN=null}locked=false}
/* ---------- one-minute challenge ---------- */
const CH={on:false,n:0,end:0,tm:0};
function startCH(){if(CH.on)return;let c=3;const box=$('#zt-chal');if(!box)return;box.innerHTML=`<div class="zt-cd">${ar(c)}</div>`;const iv=setInterval(()=>{c--;if(c>0){box.innerHTML=`<div class="zt-cd">${ar(c)}</div>`}else{clearInterval(iv);CH.on=true;CH.n=0;CH.end=Date.now()+60000;mountStage();paintCH();CH.tm=setInterval(paintCH,200)}},800)}
function paintCH(){const box=$('#zt-chal');const left=Math.max(0,CH.end-Date.now());if(box&&CH.on)box.innerHTML=`<div class="zt-tbar"><i style="width:${(left/600).toFixed(1)}%"></i></div><div class="zt-crow"><b>${ar(Math.ceil(left/1000))}</b> ثانية · <b>${ar(CH.n)}</b> تسبيحة</div>`;if(CH.on&&left<=0)endCH()}
function endCH(){clearInterval(CH.tm);CH.on=false;const n=CH.n,best=+P.best||0,nb=n>best;if(nb)P.best=n;sv();mountStage();const box=$('#zt-chal');if(box)box.innerHTML=`<div class="zt-res"><b>${ar(n)}</b><span>تسبيحة في دقيقة</span>${nb&&n?`<em>رقم قياسي جديد ✦</em>`:`<small>أفضل رقم لك: ${ar(best)}</small>`}<div class="zchips" style="justify-content:center"><button class="zchip" id="zt-again">${zi('refresh')||''}مرة أخرى</button>${n?`<button class="zchip" id="zt-shch">${zi('share')||''}شارك</button>`:''}</div></div>`;if(nb&&n)celebrate('رقم قياسي جديد: '+ar(n)+' في دقيقة');const a=$('#zt-again');if(a)a.onclick=startCH;const s=$('#zt-shch');if(s)s.onclick=()=>shareCard({big:`${ar(n)} تسبيحة في دقيقة`,sub:'تحدي السبحة في تطبيق '+(typeof APP_NAME!=='undefined'?APP_NAME:'زاد')})}
/* ---------- milestones + celebration ---------- */
const MS=[33,100,500,1000,3000,5000,10000,33333,50000,100000,250000,500000,1000000];
function milestones(){const t=T.total||0;if(!P.ms){P.ms=MS.filter(m=>m<t).pop()||0;sv();}
 const m=MS.filter(x=>x<=t&&x>P.ms).pop();if(m){P.ms=m;sv();celebrate(`ما شاء الله! بلغت ${ar(m)} تسبيحة`,1);return}
 const k=day();if(dayTot(k)>=(+P.goal||100)&&P.gd!==k){P.gd=k;sv();celebrate(`حققت هدفك اليوم (${ar(+P.goal||100)}) · ${ar(streak())} يوم متتالي`,1)}}
function celebrate(text,share){const o=document.createElement('div');o.className='zt-cel';let star='';for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,r=i%2?17:38;star+=(i?'L':'M')+(50+r*Math.cos(a)).toFixed(1)+' '+(50+r*Math.sin(a)).toFixed(1)}
 let sp='';for(let i=0;i<10;i++)sp+=`<i style="--a:${i*36}deg;--d:${(i%3)*80}ms"></i>`;
 o.innerHTML=`<div class="cs"><svg viewBox="0 0 100 100"><path d="${star}Z"/></svg>${sp}</div><p>${esc(text)}</p>${share?'<button class="zchip">شارك إنجازك</button>':''}`;document.body.appendChild(o);
 const b=$('button',o);if(b)b.onclick=()=>{o.remove();shareCard(defaultShare())};setTimeout(()=>{o.classList.add('out');setTimeout(()=>o.remove(),600)},share?4200:2600)}
/* ---------- share card (reuses the app's drawShare from «شارك إنجازك») ---------- */
function defaultShare(){const s=streak();return{big:`${ar(T.total||0)} تسبيحة`,sub:s>1?`${ar(s)} أيام متتالية على هدف التسبيح · سبحان الله وبحمده`:'سبحان الله وبحمده، سبحان الله العظيم'}}
async function shareCard(opt){const sh=document.createElement('div');sh.className='zt-sheet';sh.innerHTML=`<div class="bd"></div><div class="pn"><h3>شارك إنجازك</h3><div class="zchips" id="zt-sho"></div><canvas id="zt-shc"></canvas><div class="zchips" style="justify-content:center"><button class="zchip pri" id="zt-shs">${zi('share')||''}مشاركة</button><button class="zchip" id="zt-shd">تنزيل الصورة</button><button class="zchip" id="zt-shx">إغلاق</button></div><p class="znote">تُصنع الصورة على جهازك.</p></div>`;document.body.appendChild(sh);
 const s=streak(),O=[opt,{big:`${ar(T.total||0)} تسبيحة`,sub:'مجموع تسبيحاتي في تطبيق '+(typeof APP_NAME!=='undefined'?APP_NAME:'زاد')},{big:`${ar(dayTot(day()))} تسبيحة اليوم`,sub:'سبحان الله وبحمده، سبحان الله العظيم'}];if(s>1)O.push({big:`${ar(s)} أيام متتالية`,sub:'على هدف التسبيح اليومي ('+ar(+P.goal||100)+')'});if(P.best)O.push({big:`${ar(P.best)} تسبيحة في دقيقة`,sub:'أفضل رقم لي في تحدي السبحة'});
 const L=[];O.forEach(x=>{if(x&&!L.some(y=>y.big===x.big))L.push(x)});let I=0;const cv=$('#zt-shc',sh);
 const draw=async()=>{if(typeof drawShare==='function'){await drawShare(cv,L[I])}else{cv.width=1080;cv.height=1350;const c=cv.getContext('2d'),g=c.createLinearGradient(0,0,1080,1350);g.addColorStop(0,'#34457a');g.addColorStop(1,'#1d2545');c.fillStyle=g;c.fillRect(0,0,1080,1350);c.fillStyle='#fff';c.textAlign='center';c.direction='rtl';c.font='700 96px "IBM Plex Sans Arabic",sans-serif';c.fillText(L[I].big,540,640);c.font='44px "IBM Plex Sans Arabic",sans-serif';c.fillStyle='#e8a37c';c.fillText(L[I].sub,540,740)}};
 const chips=()=>{$('#zt-sho',sh).innerHTML=L.map((x,i)=>`<button class="zchip${i===I?' on':''}" data-i="${i}">${esc(x.big)}</button>`).join('');$$('[data-i]',sh).forEach(b=>b.onclick=()=>{I=+b.dataset.i;chips();draw()})};chips();await draw();
 const blob=()=>new Promise(r=>cv.toBlob(r,'image/png'));const close=()=>sh.remove();$('.bd',sh).onclick=close;$('#zt-shx',sh).onclick=close;
 $('#zt-shd',sh).onclick=async()=>{const b=await blob(),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='zad-tasbih.png';a.click()};
 $('#zt-shs',sh).onclick=async()=>{const b=await blob(),f=new File([b],'zad-tasbih.png',{type:'image/png'});const txt=L[I].big+' — تطبيق '+(typeof APP_NAME!=='undefined'?APP_NAME:'زاد')+' https://zad.sites.tab.bot/';if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],text:txt})}catch(e){}}else{$('#zt-shd',sh).click();toast_('تم تنزيل الصورة، شاركها من الصور')}}}
/* ---------- motion (opt-in) ---------- */
let motOn=false,lastMot=0,motSeen=0;
const SENS=[0,17,12,8];
function onMot(e){motSeen=1;if(locked||!document.querySelector('.zt'))return;let m;const a=e.acceleration;if(a&&a.x!=null)m=Math.hypot(a.x,a.y,a.z);else{const g=e.accelerationIncludingGravity;if(!g||g.x==null)return;m=Math.abs(Math.hypot(g.x,g.y,g.z)-9.81)*1.3}const now=performance.now();if(m>SENS[P.sens||2]&&now-lastMot>480){lastMot=now;hit('motion')}}
async function motionOn(ask){if(typeof DeviceMotionEvent==='undefined'){toast_('جهازك لا يدعم استشعار الحركة من المتصفح');return false}
 if(typeof DeviceMotionEvent.requestPermission==='function'){if(!ask)return false;try{const r=await DeviceMotionEvent.requestPermission();if(r!=='granted'){toast_('لم يتم السماح بالحركة. فعّلها من إعدادات سفاري');return false}}catch(e){toast_('اضغط مرة أخرى للسماح بالحركة');return false}}
 if(!motOn){addEventListener('devicemotion',onMot);motOn=true}setTimeout(()=>{if(motOn&&!motSeen&&P.mot&&document.querySelector('.zt'))toast_('لم تصل قراءات حركة من جهازك')},3500);return true}
function motionOff(){if(motOn){removeEventListener('devicemotion',onMot);motOn=false}}
/* ---------- page ---------- */
const css=".zt,.zt-sheet,.zt-cel,.zt-dark{--zc:#c0693f;--zn:#34457a;--zd:#1d2545}\n.zt[data-st=beads] #zt-n,.zt[data-st=ring] #zt-n,.zt[data-st=rose] #zt-n,.zt[data-st=finger] #zt-n,.zt[data-st=ring] #zt-t,.zt[data-st=beads] #zt-t{display:none}.zt[data-st=beads] .zt-num,.zt[data-st=ring] .zt-num,.zt[data-st=rose] .zt-num,.zt[data-st=finger] .zt-num{margin-top:4px}\n.zt-seg{display:flex;background:color-mix(in srgb,var(--ink) 6%,transparent);border-radius:14px;padding:3px;gap:2px;margin:4px 0 10px}\n.zt-seg button{flex:1;border:0;background:none;font:inherit;font-size:13.5px;color:var(--muted);padding:8px 4px;border-radius:11px;cursor:pointer;white-space:nowrap}\n.zt-seg button.on{background:var(--card);color:var(--ink);font-weight:700;box-shadow:0 1px 3px rgba(29,37,69,.12)}\n.zt-seg.sm{margin:0;flex:1}.zt-seg.sm button{font-size:12.5px;padding:6px 3px}\n.zt-chips{flex-wrap:nowrap!important;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}.zt-chips::-webkit-scrollbar{display:none}\n.zt-chips .zchip{flex:none}.zt .zchip.on{background:var(--zn);color:#fff;border-color:var(--zn)}.zt .zchip.vt:not(.on){border-color:color-mix(in srgb,var(--zc) 45%,transparent)}\n.zt .zchip.gr:not(.on){border-color:#2f8a5b;color:#2f8a5b}\n.zchip.pri{background:var(--zc)!important;color:#fff!important;border-color:var(--zc)!important}\n.zt-link{display:flex;align-items:center;gap:6px;margin:6px auto 0;background:none;border:0;font:inherit;color:var(--zc);font-size:13.5px;font-weight:600;cursor:pointer}.zt-link svg{width:16px;height:16px}\n.zt-dz{font-family:Amiri,'Amiri Quran',serif;font-size:25px;text-align:center;line-height:1.75;min-height:44px;margin:10px 4px 2px;color:var(--ink)}\n.zt .dz.sm{font-family:Amiri,serif;font-size:18px;margin:2px 0 6px}\n.zt-v{margin:2px auto 6px;max-width:520px;font-size:13px}.zt-v summary{list-style:none;cursor:pointer;text-align:center;color:var(--zc);font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px}.zt-v summary::-webkit-details-marker{display:none}\n.zt-v summary span{color:var(--muted);font-weight:400}.zt-v summary svg{width:15px;height:15px}\n.zt-v .hd,.zt .hd{font-family:Amiri,serif;font-size:17px;line-height:1.9;color:var(--ink);background:color-mix(in srgb,var(--zc) 7%,var(--card));border-radius:12px;padding:8px 12px;margin:6px 0 4px}.zt .hd.sm{font-size:15px}\n.zt-v a,.zt-ai a{color:var(--zn);font-size:12.5px;text-decoration:none;font-weight:600}\n.zt-stagew{display:flex;justify-content:center;margin:4px 0 0}.zt-stage{position:relative;width:min(92vw,360px);min-height:300px;display:flex;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}\n.zt-stage canvas{touch-action:none;display:block;cursor:pointer}\n.zt-num{text-align:center;margin-top:-2px;position:relative}.zt-num b{font-size:52px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink);line-height:1.1}.zt-num small{display:block;color:var(--muted);font-size:13px}.zt-num .rd{color:var(--zc);font-weight:600;min-height:18px}\n.zt-stage[data-st=ring]~*,.zt-stage[data-st=finger]~*{}\n.zt-fl{position:absolute;top:-30px;left:50%;transform:translateX(-50%);background:#2f8a5b;color:#fff;border-radius:20px;padding:4px 12px;font-size:13px;opacity:0;pointer-events:none;white-space:nowrap}.zt-fl.show{animation:ztfl 1.8s ease}\n@keyframes ztfl{0%{opacity:0;transform:translate(-50%,6px)}15%,70%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}\n.zt-act{justify-content:center;margin-top:8px}\n.zt-ring{position:relative;width:300px;height:300px;border-radius:50%;cursor:pointer;touch-action:manipulation;background:radial-gradient(circle at 50% 35%,color-mix(in srgb,var(--zc) 10%,var(--card)),var(--card) 70%);box-shadow:var(--shadow,0 6px 24px rgba(29,37,69,.1));display:flex;align-items:center;justify-content:center}\n.zt-ring svg{position:absolute;inset:0}.zt-ring .in{text-align:center;pointer-events:none}.zt-ring .in b{font-size:78px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--ink);line-height:1}.zt-ring .in small{display:block;color:var(--muted);font-size:13px;margin-top:4px}\n.zt-ring:active{transform:scale(.985)}.zt-ring.mini{width:110px;height:110px;box-shadow:none;background:none}.zt-ring.mini .in b{font-size:28px}\n.zt-stage[data-st=ring]+*{}\n.zt-fing{position:relative;width:290px;cursor:pointer;touch-action:manipulation;text-align:center}.zt-fing svg{width:100%;display:block;filter:drop-shadow(0 8px 14px rgba(29,37,69,.25))}\n.zt-fing .lcd{position:absolute;top:24.5%;left:26.5%;width:47%;height:15%;display:flex;align-items:center;justify-content:center;font:700 34px/1 ui-monospace,'SF Mono',Menlo,monospace;color:#26331b;letter-spacing:2px;font-variant-numeric:tabular-nums;pointer-events:none}\n.zt-fing .lbl{color:var(--muted);font-size:12.5px;margin-top:-6px}.zt-fing.pr .cb{animation:ztpr .18s}.zt-fing.pr svg{animation:ztsq .18s}\n@keyframes ztpr{50%{transform:translate(152px,120px) scale(.82) translate(-152px,-120px)}}@keyframes ztsq{50%{transform:scale(.985)}}\n.zt-fing.mini{width:120px}.zt-fing.mini .lcd{font-size:14px;letter-spacing:1px}\n.zt-rose{position:relative;width:300px;height:300px;cursor:pointer;touch-action:manipulation}.zt-rose svg{width:100%;height:100%}\n.zt-rose .pt{fill:color-mix(in srgb,var(--zn) 10%,var(--card));stroke:color-mix(in srgb,var(--zn) 35%,transparent);stroke-width:.35;transition:fill .25s}\n.zt-rose .pt.on{fill:var(--zc);stroke:#8f4520}.zt-rose .st{fill:var(--zn);opacity:.9}.zt-rose .cc{fill:#f3d58b}\n.zt-rose .rn{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;color:#fff;pointer-events:none;font-variant-numeric:tabular-nums;text-shadow:0 1px 3px rgba(0,0,0,.4)}\n.zt-rose.done .st{animation:ztst 1.1s ease}@keyframes ztst{30%{fill:#c0693f;transform:scale(1.12)}}.zt-rose .st{transform-origin:50% 50%;transform-box:view-box}\n.zt-rose.mini{width:110px;height:110px}.zt-rose.mini .rn{font-size:15px}\n.zt-minp{width:140px;height:110px;background:#000;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center}.zt-minp b{color:#4a4a4a;font-size:34px}.zt-minp small{color:#3a3a3a;font-size:9.5px}\n.zt-p1{animation:ztp1 .5s ease-out}.zt-p2{animation:ztp2 1s ease-out}\n@keyframes ztp1{0%{filter:drop-shadow(0 0 0 rgba(192,105,63,.9))}40%{filter:drop-shadow(0 0 14px rgba(192,105,63,.7))}100%{filter:none}}\n@keyframes ztp2{0%,30%{filter:drop-shadow(0 0 18px rgba(47,138,91,.8))}100%{filter:none}}\n.zt-h{font-size:15px;margin:18px 2px 8px;color:var(--ink)}.zt-h small{color:var(--muted);font-weight:400;font-size:12px}\n.zt-styles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}\n.zt-sc{background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:8px 4px;font:inherit;color:var(--ink);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0}\n.zt-sc .pv{height:92px;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none}\n.zt-sc .pv>*{transform:scale(.8);transform-origin:center}.zt-sc .pv canvas{transform:scale(.72)}\n.zt-sc b{font-size:12.5px}.zt-sc small{font-size:10.5px;color:var(--muted);text-align:center;line-height:1.3}\n.zt-sc.on{border-color:var(--zc);box-shadow:0 0 0 3px color-mix(in srgb,var(--zc) 18%,transparent)}\n.zt-skins{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.zt-sk{background:var(--card);border:1.5px solid var(--line);border-radius:14px;padding:5px 2px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;min-width:0}\n.zt-sk canvas{max-width:100%}.zt-sk small{font-size:10.5px;color:var(--ink)}.zt-sk.on{border-color:var(--zc);box-shadow:0 0 0 3px color-mix(in srgb,var(--zc) 18%,transparent)}\n.zt-ways .zset{gap:10px}.zt-ways input[type=checkbox]{width:22px;height:22px;accent-color:var(--zc)}.zt-on{font-size:12px;color:#2f8a5b;font-weight:600}\n.zt-tg{display:flex;align-items:center;gap:10px;margin:12px 0 0}.zt-tg b{font-size:14px}\n.zt-steps{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:2px 0 4px}.zt-steps span{font-size:12.5px;padding:5px 10px;border-radius:20px;background:color-mix(in srgb,var(--ink) 6%,transparent);color:var(--muted)}\n.zt-steps span.cur{background:var(--zn);color:#fff;font-weight:700}.zt-steps span.ok{background:color-mix(in srgb,#2f8a5b 15%,transparent);color:#2f8a5b}\n.zt-seqt{text-align:center;font-size:13px;color:var(--muted)}\n.zt-done{text-align:center;background:color-mix(in srgb,#2f8a5b 9%,var(--card));border:1px solid color-mix(in srgb,#2f8a5b 30%,transparent);border-radius:18px;padding:12px;margin:10px 0;animation:ztin .6s ease}.zt-done b{color:#2f8a5b;font-size:18px}.zt-done small{color:var(--muted)}\n@keyframes ztin{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:none}}\n.zt-chal{margin:4px 0}.zt-res{text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--card);border-radius:18px;padding:12px;border:1px solid var(--line)}.zt-res b{font-size:44px;line-height:1.1;color:var(--zn)}.zt-res span{font-size:14px}.zt-res small{color:var(--muted);font-size:12px}.zt-res em{color:var(--zc);font-style:normal;font-weight:700}\n.zt-cd{font-size:80px;font-weight:700;text-align:center;color:var(--zc);animation:ztcd .8s ease}@keyframes ztcd{0%{transform:scale(1.5);opacity:0}30%{opacity:1}100%{transform:scale(1)}}\n.zt-tbar{height:8px;border-radius:8px;background:var(--line);overflow:hidden}.zt-tbar i{display:block;height:100%;background:linear-gradient(90deg,#34457a,#c0693f);transition:width .2s linear}.zt-crow{text-align:center;margin-top:6px;font-size:15px}.zt-crow b{font-size:22px}\n.zt-bar{height:9px;border-radius:9px;background:var(--line);overflow:hidden;margin:8px 0}.zt-bar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#c0693f,#e8a37c)}\n.zt-goal{display:flex;align-items:center;justify-content:space-between;gap:10px}.zt-goal>div{flex:1;min-width:0}.zt-goal select{width:auto!important;min-width:96px;flex:none}.zt-goal small{display:block;color:var(--muted);font-size:12.5px}.zt-goal select{font:inherit;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink)}\n.zt-stats .zstat{margin:10px 0}.zt-ch{width:100%;margin-top:8px;overflow:visible}.zt-ch text{font-size:8.5px;fill:var(--muted);font-family:inherit}.zt-ch text.v{font-size:8px;fill:var(--ink)}\n.zt-grp{border:1.5px solid color-mix(in srgb,#2f8a5b 35%,transparent)}.zt-gh{display:flex;justify-content:space-between;align-items:center;font-size:12.5px}.zt-gh a{color:var(--zn);text-decoration:none;font-weight:600}\n.zt-live{color:#2f8a5b;font-weight:700}.zt-live.soon{color:var(--zc)}.zt-grp small{color:var(--muted);font-size:12.5px}\n.zt-sw{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13.5px;cursor:pointer}.zt-sw input{width:20px;height:20px;accent-color:#2f8a5b}\n.zt-dark{position:fixed;inset:0;z-index:95;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-touch-callout:none}\n.zt-dark b{font-size:104px;font-weight:700;color:#3d3d3d;font-variant-numeric:tabular-nums}.zt-dark small{color:#2f2f2f;font-size:14px;margin-top:6px;text-align:center;padding:0 24px}.zt-dark .dt{font-family:Amiri,serif;font-size:20px;color:#383838}\n.zt-dark .zx{position:absolute;top:calc(16px + env(safe-area-inset-top));left:16px;background:#0d0d0d;color:#555;border:1px solid #1f1f1f;border-radius:14px;font:inherit;padding:10px 16px}\n.zt-dark .lk{position:absolute;top:calc(22px + env(safe-area-inset-top));right:16px;color:#6b4a34;font-size:13px;display:flex;align-items:center;gap:6px}.zt-dark .lk svg{width:16px;height:16px}\n.zt-dark.locked b{color:#2a2a2a}.zt-dark.locked .zx{opacity:.3}\n.zt-dark.f1{animation:ztd1 .5s}.zt-dark.f2{animation:ztd2 .9s}@keyframes ztd1{0%{background:#2c1c10}100%{background:#000}}@keyframes ztd2{0%,40%{background:#0f2a1c}100%{background:#000}}\n.zt-cel{position:fixed;left:50%;top:calc(70px + env(safe-area-inset-top));transform:translateX(-50%);z-index:96;background:var(--card);border-radius:20px;box-shadow:0 12px 40px rgba(29,37,69,.25);padding:14px 18px 12px;text-align:center;width:min(86vw,340px);animation:ztcel .55s cubic-bezier(.2,1.4,.4,1)}\n.zt-cel.out{opacity:0;transform:translate(-50%,-10px);transition:.5s}.zt-cel p{margin:6px 0;font-weight:700;color:var(--ink)}\n.zt-cel .cs{position:relative;width:56px;height:56px;margin:0 auto}.zt-cel svg{width:56px;height:56px;animation:ztrot 2.4s ease}.zt-cel svg path{fill:#c0693f}\n.zt-cel .cs i{position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:#e8a37c;opacity:0;animation:ztsp 1.2s ease-out var(--d) forwards;transform:rotate(var(--a)) translateY(0)}\n@keyframes ztsp{0%{opacity:1;transform:rotate(var(--a)) translateY(0)}100%{opacity:0;transform:rotate(var(--a)) translateY(-44px)}}\n@keyframes ztcel{0%{opacity:0;transform:translate(-50%,-16px) scale(.9)}100%{opacity:1;transform:translateX(-50%)}}@keyframes ztrot{0%{transform:scale(.3) rotate(-45deg)}60%{transform:scale(1.08) rotate(8deg)}100%{transform:none}}\n.zt-sheet{position:fixed;inset:0;z-index:97;display:flex;align-items:flex-end;justify-content:center}.zt-sheet .bd{position:absolute;inset:0;background:rgba(15,20,40,.45)}\n.zt-sheet .pn{position:relative;background:var(--bg,#f6f4ef);width:min(100%,560px);max-height:88vh;overflow:auto;border-radius:22px 22px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));animation:ztin .3s ease}\n.zt-sheet h3{margin:0 0 8px;text-align:center}.zt-sheet canvas{width:100%;max-width:340px;display:block;margin:8px auto;border-radius:12px}\n.zt-ai{background:var(--card);border-radius:16px;padding:10px 12px;margin:8px 0;border:1px solid var(--line)}.zt-ai .dz{font-family:Amiri,serif;font-size:21px;margin:0;text-align:center}.zt-ar{display:flex;justify-content:space-between;align-items:center;gap:8px}\n@media (prefers-reduced-motion:reduce){.zt-cel,.zt-cel svg,.zt-cd,.zt-done{animation:none}}\n.zt-links{display:flex;justify-content:center;gap:14px;flex-wrap:wrap}.zt-links .zt-link{margin:6px 0 0}.zt-dz.lg{font-size:19px;line-height:1.85;max-height:11em;overflow:auto;padding:0 4px}.zt-nt{text-align:center;color:var(--muted);font-size:13px;margin:0 0 4px}.zt-my{padding:6px 10px 12px}.zt-mi{display:flex;align-items:center;gap:8px;padding:10px 4px;border-bottom:1px solid var(--line);cursor:pointer;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;border-radius:12px;transition:background .25s}.zt-mi:last-of-type{border-bottom:0}.zt-mi.on{background:rgba(192,105,63,.09)}.zt-mi.mv{animation:ztmv .9s ease}@keyframes ztmv{0%{background:rgba(52,69,122,.18)}100%{background:transparent}}.zt-mi .tx{flex:1;min-width:0}.zt-mi p{margin:0;font-family:Amiri,serif;font-size:18px;line-height:1.6;color:var(--ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.zt-mi .nt{display:block;color:var(--zc,#c0693f);font-size:12px}.zt-mi .mt{display:block;color:var(--muted);font-size:12px;margin-top:2px}.zt-mi .pb{display:block;height:4px;border-radius:3px;background:var(--line);margin-top:6px;overflow:hidden}.zt-mi .pb i{display:block;height:100%;background:var(--zc,#c0693f);border-radius:3px}.zt-dots{flex:none;width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:20px;line-height:1;cursor:pointer}.zt-emp{text-align:center;color:var(--muted);font-size:13.5px;margin:12px 6px}.zt-f label{display:block;margin:10px 0}.zt-f label>b{display:block;font-size:13.5px;margin:0 2px 6px}.zt-f label>b small{color:var(--muted);font-weight:400}.zt-f textarea,.zt-in{width:100%;box-sizing:border-box;border:1px solid var(--line,#e6e1d6);border-radius:14px;padding:10px 12px;font:inherit;font-size:16px;background:var(--card,#fffefb);color:var(--ink);outline:none}.zt-f textarea{font-family:Amiri,serif;font-size:19px;line-height:1.7;resize:vertical;min-height:84px}.zt-f textarea:focus,.zt-in:focus{border-color:var(--zn,#34457a);box-shadow:0 0 0 3px rgba(52,69,122,.12)}.zt-cn{display:block;text-align:left;color:var(--muted);font-size:11.5px;margin-top:3px}.zt-numin{margin-top:8px}.zt-tgc{display:flex;flex-wrap:wrap}.zt-er{color:#b3261e;text-align:center;font-size:13px;margin:4px 0}.zt-mt{text-align:center;max-height:7em;overflow:auto}.zt-mn{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:auto;align-content:start;gap:8px;margin:10px 0;flex:none}.zt-mn button{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px 8px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:14px;cursor:pointer}.zt-mn button svg,.zt-my svg,.zt-act svg,.zt-chips svg{width:17px;height:17px;flex:none}.zt-mn button{min-height:48px;height:auto;align-self:start;width:100%}.zt-mn button:disabled{opacity:.35}.zt-mn .zt-dg,.zchip.zt-dg{color:#b3261e}.zt-cf{text-align:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px;margin:10px 0}.zt-cf p{margin:0 0 8px}.zt-cf small{color:var(--muted)}.zt-q{margin:4px 0 8px}.zt-pg{justify-content:center}.zt-pc{display:block;text-align:center;color:var(--muted);font-size:12px;margin:6px 0}.zt-pi .dz{font-size:19px;line-height:1.75;max-height:9em;overflow:auto}.zt-ar small{color:var(--muted);font-size:12px}";
function stats7(n){let h='',mx=1;const v=[];for(let i=n-1;i>=0;i--){const k=dkey(i);v.push([k,dayTot(k)]);}v.forEach(x=>mx=Math.max(mx,x[1]));const g=+P.goal||100;
 const W=n>7?300:300,bw=W/n;let bars='';v.forEach((x,i)=>{const hh=Math.max(2,Math.round(x[1]/Math.max(mx,g)*64));bars+=`<rect x="${(i*bw+bw*.15).toFixed(1)}" y="${70-hh}" width="${(bw*.7).toFixed(1)}" height="${hh}" rx="${n>7?1.5:4}" fill="${x[1]>=g?'#c0693f':'#34457a'}" opacity="${x[1]?1:.25}"/>`});
 const gy=70-Math.round(g/Math.max(mx,g)*64);let lab='';if(n<=7)v.forEach((x,i)=>{const d=new Date(x[0]+'T12:00:00');lab+=`<text x="${(i*bw+bw/2).toFixed(1)}" y="84" text-anchor="middle">${['أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة','سبت'][d.getDay()]||''}</text><text x="${(i*bw+bw/2).toFixed(1)}" y="${66-Math.max(2,Math.round(x[1]/Math.max(mx,g)*64))}" text-anchor="middle" class="v">${x[1]?ar(x[1]):''}</text>`});
 return`<svg viewBox="0 0 300 ${n<=7?90:74}" class="zt-ch"><line x1="0" x2="300" y1="${gy}" y2="${gy}" stroke="#c0693f" stroke-dasharray="3 3" stroke-width=".8" opacity=".7"/>${bars}${lab}</svg>`}
let CHART=7;
function statsHTML(){const g=+P.goal||100,td=dayTot(day()),pc=Math.min(100,td/g*100),s=streak();let m30=0;for(let i=0;i<30;i++)m30+=dayTot(dkey(i));
 return`<section class="zcard zt-stats"><div class="zt-goal"><div><b>هدف اليوم</b><small>${ar(td)} من ${ar(g)}</small></div><select id="zt-goal" aria-label="هدف اليوم">${[33,100,300,500,1000,3000].map(v=>`<option value="${v}"${v===g?' selected':''}>${ar(v)}</option>`).join('')}</select></div><div class="zt-bar"><i style="width:${pc.toFixed(1)}%"></i></div>
 <div class="zstat"><div><b>${ar(s)}</b><small>أيام متتالية</small></div><div><b>${ar(T.total||0)}</b><small>المجموع الكلي</small></div><div><b>${ar(m30)}</b><small>آخر ٣٠ يومًا</small></div></div>
 <div class="zt-seg sm"><button data-ch="7" class="${CHART===7?'on':''}">٧ أيام</button><button data-ch="30" class="${CHART===30?'on':''}">٣٠ يومًا</button></div><div id="zt-chart">${stats7(CHART)}</div>
 <button class="zchip pri" id="zt-share" style="margin-top:8px">${zi('share')||''}شارك إنجازك</button></section>`}
function virtueHTML(v){if(!v)return'';return`<details class="zt-v"><summary>${zi('star')||''}فضله <span>${esc(v.r)} · صحيح</span></summary><p class="hd">«${esc(v.h)}»</p><a href="${v.u}" target="_blank" rel="noopener">${esc(v.r)} — sunnah.com ↗</a>${v.x?`<p class="hd">«${esc(v.x.h)}»</p><a href="${v.x.u}" target="_blank" rel="noopener">${esc(v.x.r)} — sunnah.com ↗</a>`:''}</details>`}
function seqHTML(){const q=sq(),S_=SEQ[q.id];let tot=0;const L=S_.s;for(let i=0;i<q.s;i++)tot+=L[i][1];tot+=q.n;const all=L.reduce((a,b)=>a+b[1],0);
 return`<div class="zt-steps">${L.map((st,i)=>`<span class="${i<q.s||q.done?'ok':i===q.s?'cur':''}">${esc(st[0]<0?'التهليل':stepText(st[0]).replace(/[\u064B-\u0652\u0670]/g,''))} ${ar(st[1])}${i<q.s||q.done?' ✓':''}</span>`).join('')}</div><div class="zt-seqt">${ar(tot)} / ${ar(all)}</div>`}
function seqDoneHTML(){const q=sq();if(!q||!q.done)return'';const S_=SEQ[q.id];return`<div class="zt-done"><b>تمّت المئة ✓</b><p class="hd">«${esc(S_.done)}»</p><small>${esc(S_.v.r)}</small><div class="zchips" style="justify-content:center"><button class="zchip" id="zt-sqr">${zi('refresh')||''}من جديد</button></div></div>`}
function seqVirtue(){const S_=SEQ[P.mode];if(!S_)return'';return`<details class="zt-v" open><summary>${zi('star')||''}الحديث <span>${esc(S_.v.r)} · صحيح</span></summary><p class="hd">«${esc(S_.v.h)}»</p><a href="${S_.v.u}" target="_blank" rel="noopener">${esc(S_.v.r)} — sunnah.com ↗</a>${(S_.more||[]).map(m=>`<p class="hd sm">وفي رواية: «${esc(m.h)}»</p><a href="${m.u}" target="_blank" rel="noopener">${esc(m.r)} — sunnah.com ↗</a>`).join('')}</details>`}
function renderChips(){const box=$('#zt-chips');if(!box)return;const d=cur();box.innerHTML=list().map(x=>`<button class="zchip${x.k===d.k?' on':''}${x.v?' vt':''}${x.g?' gr':''}" data-k="${x.k}">${x.g?'🌍 ':''}${esc(x.t.length>34?x.t.slice(0,32)+'…':x.t)}</button>`).join('')+`<button class="zchip pri" id="zt-add">${ic('plus')}أضف ذكرك</button>`;
 $$('[data-k]',box).forEach(b=>{b.onclick=()=>{if(b._lp){b._lp=0;return}pick(b.dataset.k)};if(b.dataset.k.startsWith('u:'))longPress(b,()=>{const m=myGet(b.dataset.k.slice(2));if(m)menuSheet(m)})});$('#zt-add').onclick=()=>addCustom()}
function pick(k){X.sel=k;if(k[0]==='p')T.i=+k.slice(1);const it=list().find(x=>x.k===k);T.count=0;if(it&&it.u){T.count=+it.u.c||0;T.target=+it.u.n||0}else if(it&&it.v&&it.v.n)T.target=it.v.n;if(it&&it.g)P.grp=1;sv();render()}
/* ---------- v4.7.2 «أذكاري» ---------- */
const LI={"play": "<path d=\"M8 5.5v13l10.5-6.5z\"/>", "edit": "<path d=\"M4 20h4L19 9l-4-4L4 16z\"/><path d=\"M13.5 6.5l4 4\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"6.5\"/><path d=\"M16 16l4 4\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "trash": "<path d=\"M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13\"/>", "refresh": "<path d=\"M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4h-4\"/>"};
const ic=k=>LI[k]?`<svg class="z-ic" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LI[k]}</svg>`:(zi(k)||'');

function myGet(id){return X.my.find(m=>m.id===id)}
function syncU(){const c=cur();if(c&&c.u&&!seqOn()&&!CH.on){c.u.c=+T.count||0;c.u.n=+T.target||0}}
function longPress(el,fn){let t=0,x=0,y=0;const clr=()=>{clearTimeout(t);t=0};
 el.addEventListener('pointerdown',e=>{x=e.clientX;y=e.clientY;clr();t=setTimeout(()=>{t=0;el._lp=1;buzz(1);fn()},520)});
 el.addEventListener('pointermove',e=>{if(t&&(Math.abs(e.clientX-x)>9||Math.abs(e.clientY-y)>9))clr()});
 ['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,clr));el.addEventListener('contextmenu',e=>e.preventDefault())}
function mkSheet(inner,cls){const sh=document.createElement('div');sh.className='zt-sheet'+(cls?' '+cls:'');sh.innerHTML=`<div class="bd"></div><div class="pn">${inner}</div>`;document.body.appendChild(sh);const close=()=>sh.remove();$('.bd',sh).onclick=close;return [sh,close]}
const TGS=[33,100,1000];
function tgChips(v){const cu=v&&!TGS.includes(v);return`<div class="zt-seg sm zt-tgc">${TGS.map(n=>`<button type="button" data-n="${n}" class="${v===n?'on':''}">${ar(n)}</button>`).join('')}<button type="button" data-n="c" class="${cu?'on':''}">عدد آخر</button><button type="button" data-n="0" class="${!v?'on':''}">بلا عدد</button></div><input class="zt-in zt-numin" type="number" inputmode="numeric" min="1" max="100000" placeholder="اكتب العدد" value="${cu?v:''}"${cu?'':' hidden'}>`}
function tgWire(sh,get,set){const ni=$('.zt-numin',sh);$$('.zt-tgc [data-n]',sh).forEach(b=>b.onclick=()=>{$$('.zt-tgc [data-n]',sh).forEach(x=>x.classList.toggle('on',x===b));const v=b.dataset.n;if(v==='c'){ni.hidden=false;ni.focus();set(parseInt(ni.value,10)||0)}else{ni.hidden=true;set(+v)}});ni.oninput=()=>set(Math.min(100000,Math.max(0,parseInt(ni.value,10)||0)))}
/* add / edit sheet «أضف ذكرك» */
function addCustom(m,pre){const ed=!!m;let n=ed?(+m.n||0):(pre&&pre.n!=null?pre.n:33);
 const [sh,close]=mkSheet(`<h3>${ed?'عدّل ذكرك':'أضف ذكرك'}</h3><p class="znote" style="text-align:center">${ed?'غيّر النص أو العدد أو الملاحظة.':'اكتب أي ذكر أو دعاء تريد أن تعدّه، وحدد العدد الذي تريده.'}</p>
 <form class="zt-f" id="zt-af" autocomplete="off"><label><b>الذكر</b><textarea id="zt-at" maxlength="300" rows="3" placeholder="مثال: سبحان الله وبحمده، سبحان الله العظيم">${esc(ed?m.t:(pre&&pre.t)||'')}</textarea><small class="zt-cn" id="zt-ac"></small></label>
 <label><b>العدد المستهدف</b>${tgChips(n)}</label>
 <label><b>ملاحظة / نية <small>(اختياري)</small></b><input class="zt-in" id="zt-an" maxlength="120" placeholder="مثال: بنية تفريج الهم" value="${esc(ed?(m.note||''):'')}"></label>
 <p class="zt-er" id="zt-ae" hidden>اكتب الذكر أولًا</p>
 <div class="zchips" style="justify-content:center"><button class="zchip pri" type="submit" id="zt-as">${ed?'حفظ':'احفظ وابدأ العدّ'}</button><button class="zchip" type="button" id="zt-ax">إلغاء</button></div></form>`,'zt-form');
 const ta=$('#zt-at',sh),cn=$('#zt-ac',sh);const cnt=()=>{cn.textContent=ar(ta.value.length)+' / ٣٠٠'};cnt();ta.oninput=()=>{cnt();$('#zt-ae',sh).hidden=true};
 tgWire(sh,()=>n,v=>{n=v});$('#zt-ax',sh).onclick=close;setTimeout(()=>{try{ta.focus()}catch(e){}},250);
 $('#zt-af',sh).onsubmit=e=>{e.preventDefault();const t=ta.value.replace(/\s+\n/g,'\n').trim().slice(0,300);if(!t){$('#zt-ae',sh).hidden=false;ta.focus();return}
  const note=$('#zt-an',sh).value.trim().slice(0,120);n=Math.min(100000,Math.max(0,+n||0));
  if(ed){const dup=X.my.find(o=>o.t===t&&o!==m);if(dup){$('#zt-ae',sh).textContent='هذا الذكر موجود في أذكارك';$('#zt-ae',sh).hidden=false;return}
   m.t=t;m.note=note;m.n=n;mirror();if(X.sel==='u:'+m.id&&!seqOn()&&!CH.on)T.target=n;sv();close();render();toast_('تم الحفظ ✓');return}
  let x=X.my.find(o=>o.t===t);if(x){x.n=n;if(note)x.note=note;toast_('موجود في أذكارك، فتحناه لك')}else{x={id:uid(),t,n,note,c:0,tot:0,at:Date.now()};X.my.push(x)}
  mirror();close();P.mode='free';pick('u:'+x.id);setTimeout(()=>{const z=$('.zt');if(z)z.scrollIntoView({behavior:'smooth',block:'start'})},60)}}
/* ⋯ menu: count / edit / move / reset / delete (with confirm) */
function menuSheet(m){const i=X.my.indexOf(m),L=X.my.length;
 const [sh,close]=mkSheet(`<h3>ذكرك</h3><p class="dz sm zt-mt">${esc(m.t)}</p>${m.note?`<p class="znote" style="text-align:center">${esc(m.note)}</p>`:''}
 <div class="zt-mn" id="zt-mn"><button data-a="go">${ic('play')}<span>عدّ هذا الذكر</span></button><button data-a="ed">${ic('edit')}<span>تعديل</span></button>
 <button data-a="up"${i<=0?' disabled':''}>▲<span>تحريك للأعلى</span></button><button data-a="dn"${i>=L-1?' disabled':''}>▼<span>تحريك للأسفل</span></button>
 <button data-a="rs">${ic('refresh')}<span>تصفير عدّه (${ar(+m.c||0)})</span></button><button data-a="del" class="zt-dg">${ic('trash')}<span>حذف</span></button></div>
 <div class="zt-cf" id="zt-cf" hidden><p><b>تحذف هذا الذكر من أذكارك؟</b><br><small>تسبيحاتك السابقة تبقى محسوبة في إحصائياتك.</small></p><div class="zchips" style="justify-content:center"><button class="zchip zt-dg" id="zt-cy">نعم، احذف</button><button class="zchip" id="zt-cn">إلغاء</button></div></div>
 <div class="zchips" style="justify-content:center"><button class="zchip" id="zt-mx">إغلاق</button></div>`);
 $('#zt-mx',sh).onclick=close;
 $$('[data-a]',sh).forEach(b=>b.onclick=()=>{const a=b.dataset.a;
  if(a==='go'){close();P.mode='free';pick('u:'+m.id);const z=$('.zt');if(z)z.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(a==='ed'){close();addCustom(m);return}
  if(a==='up'||a==='dn'){const j=X.my.indexOf(m),k=a==='up'?j-1:j+1;if(k<0||k>=X.my.length)return;X.my.splice(j,1);X.my.splice(k,0,m);mirror();sv();close();render();const r=$(`.zt-my [data-id="${m.id}"]`);if(r){r.classList.add('mv');r.scrollIntoView({block:'center'})}return}
  if(a==='rs'){m.c=0;if(X.sel==='u:'+m.id&&!seqOn()&&!CH.on)T.count=0;sv();close();render();return}
  if(a==='del'){$('#zt-mn',sh).hidden=true;$('#zt-cf',sh).hidden=false}});
 $('#zt-cn',sh).onclick=()=>{$('#zt-mn',sh).hidden=false;$('#zt-cf',sh).hidden=true};
 $('#zt-cy',sh).onclick=()=>{const j=X.my.indexOf(m);if(j>=0)X.my.splice(j,1);if(X.sel==='u:'+m.id){X.sel=null;T.count=0}mirror();sv();close();render();toast_('حُذف الذكر')}}
function myHTML(){const sel=X.sel;return`<h2 class="zt-h">أذكاري <small>${X.my.length?ar(X.my.length)+' · اضغط للعدّ، ومطوّلًا أو ⋯ للتعديل والترتيب':''}</small></h2><section class="zcard zt-my" id="zt-my">
 ${X.my.length?X.my.map(m=>{const n=+m.n||0,c=+m.c||0;return`<div class="zt-mi${sel==='u:'+m.id?' on':''}" data-id="${m.id}" role="button" tabindex="0"><div class="tx"><p>${esc(m.t)}</p>${m.note?`<small class="nt">${esc(m.note)}</small>`:''}<small class="mt">${n?`${ar(c)} من ${ar(n)}`:`${ar(c)} · بلا عدد`} · المجموع ${ar(+m.tot||0)}</small>${n?`<i class="pb"><i style="width:${Math.min(100,c/n*100).toFixed(1)}%"></i></i>`:''}</div><button class="zt-dots" data-mn="${m.id}" aria-label="خيارات">⋯</button></div>`}).join('')
 :`<p class="zt-emp">أضف أي ذكر تريده بالعدد الذي تريده، أو اختر من أذكار حصن المسلم.</p>`}
 <div class="zchips" style="justify-content:center"><button class="zchip pri" id="zt-myadd">${ic('plus')}أضف ذكرك</button><button class="zchip" id="zt-pk">${ic('search')}اختر من الأذكار</button></div></section>`}
function wireMy(){const box=$('#zt-my');if(!box)return;
 $$('.zt-mi',box).forEach(r=>{const id=r.dataset.id;longPress(r,()=>{const m=myGet(id);if(m)menuSheet(m)});
  r.onclick=e=>{if(r._lp){r._lp=0;return}if(e.target.closest('.zt-dots'))return;P.mode='free';pick('u:'+id);const z=$('.zt');if(z)z.scrollIntoView({behavior:'smooth',block:'start'})};
  r.onkeydown=e=>{if(e.key==='Enter'){e.stopPropagation();r.click()}}});
 $$('[data-mn]',box).forEach(b=>b.onclick=e=>{e.stopPropagation();const m=myGet(b.dataset.mn);if(m)menuSheet(m)});
 $('#zt-myadd').onclick=()=>addCustom();$('#zt-pk').onclick=pickerSheet}
/* «اختر من الأذكار»: the app's own hisn al-muslim data (D.adhkar + D2.duas) — no new text */
const NRM=s=>String(s||'').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\u0621-\u064A0-9a-zA-Z]+/g,' ').trim();
let PK=null;
function pkData(){if(PK)return PK;const out=[],seen=new Set();const add=(t,n,src,g)=>{if(!t)return;const k=NRM(t);if(!k||seen.has(k))return;seen.add(k);out.push({t,n:Math.max(1,+n||1),src,g,k})};
 try{const A=(typeof D!=='undefined'&&D&&D.adhkar)||(window.D&&window.D.adhkar)||{};[['morning','sm','أذكار الصباح والمساء'],['prayer','pr','الأذكار بعد السلام من الصلاة'],['sleep','sl','أذكار النوم']].forEach(([k,g,n])=>{((A[k]&&A[k].items)||[]).forEach(x=>add(x.t,x.n,(A[k].title||n),g))})}catch(e){}
 try{(window.D2&&D2.duas||[]).forEach(G=>(G.cats||[]).forEach(c=>(c.items||[]).forEach(x=>add(x.t,x.n,c.t,'hs'))))}catch(e){}
 return PK=out}
function pickerSheet(){const L=pkData();let g='all';
 const [sh,close]=mkSheet(`<h3>اختر من الأذكار</h3><p class="znote" style="text-align:center">من «حصن المسلم» الموجود في التطبيق. ابحث بأي كلمة، واضغط «ابدأ» ويبدأ العدّ بالعدد الوارد.</p>
 <input class="zt-in zt-q" id="zt-pq" type="search" placeholder="ابحث: سبحان الله وبحمده، استغفر، الهم…" enterkeyhint="search">
 <div class="zchips zt-pg">${[['all','الكل'],['sm','الصباح والمساء'],['pr','بعد الصلاة'],['sl','النوم'],['hs','الأدعية']].map(([k,n])=>`<button class="zchip${k==='all'?' on':''}" data-g="${k}">${n}</button>`).join('')}</div>
 <div id="zt-pr" class="zt-pr"></div><div class="zchips" style="justify-content:center"><button class="zchip" id="zt-px">إغلاق</button></div>`,'zt-pick');
 const q=$('#zt-pq',sh),res=$('#zt-pr',sh);let shown=[];
 const draw=()=>{const ws=NRM(q.value).split(' ').filter(Boolean);let R=L.filter(x=>(g==='all'||x.g===g)&&ws.every(w=>x.k.includes(w)));const tot=R.length;R=R.slice(0,60);shown=R;
  res.innerHTML=(tot?`<small class="zt-pc">${ar(tot)} ذكر${tot>60?' · أول ٦٠، اكتب كلمة أدق':''}</small>`:'<p class="zt-emp">لم نجد ذكرًا بهذه الكلمات. جرّب كلمة أخرى، أو أضفه بنفسك.</p>')+R.map((x,i)=>`<div class="zt-ai zt-pi"><p class="dz">${esc(x.t)}</p><div class="zt-ar"><small>${esc(x.src)} · ${x.n>1?'التكرار '+ar(x.n):'مرة واحدة'}</small><button class="zchip pri" data-pi="${i}">ابدأ ${x.n>1?ar(x.n):''}</button></div></div>`).join('');
  $$('[data-pi]',res).forEach(b=>b.onclick=()=>{const x=shown[+b.dataset.pi];if(!x)return;let m=X.my.find(o=>o.t===x.t);if(!m){m={id:uid(),t:x.t,n:x.n,note:'حصن المسلم · '+x.src,c:0,tot:0,at:Date.now(),src:1};X.my.push(m)}else{m.n=x.n}mirror();close();P.mode='free';pick('u:'+m.id);toast_('أُضيف إلى أذكاري');const z=$('.zt');if(z)z.scrollIntoView({behavior:'smooth',block:'start'})})};
 let tm=0;q.oninput=()=>{clearTimeout(tm);tm=setTimeout(draw,120)};
 $$('[data-g]',sh).forEach(b=>b.onclick=()=>{g=b.dataset.g;$$('[data-g]',sh).forEach(x=>x.classList.toggle('on',x===b));draw()});
 $('#zt-px',sh).onclick=close;draw()}
function numSheet(cb){let n=+T.target||0;if(TGS.includes(n)||!n)n=0;const [sh,close]=mkSheet(`<h3>العدد المستهدف</h3><input class="zt-in" id="zt-nn" type="number" inputmode="numeric" min="1" max="100000" placeholder="مثال: ٥٠" value="${n||''}"><div class="zchips" style="justify-content:center"><button class="zchip pri" id="zt-ny">تم</button><button class="zchip" id="zt-nx">إلغاء</button></div>`);
 const i=$('#zt-nn',sh);setTimeout(()=>{try{i.focus()}catch(e){}},200);$('#zt-nx',sh).onclick=close;const ok=()=>{const v=parseInt(i.value,10);if(!(v>0)){i.focus();return}close();cb(Math.min(100000,v))};$('#zt-ny',sh).onclick=ok;i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok()}}}
function adhkarSheet(){const sh=document.createElement('div');sh.className='zt-sheet';const L=list().filter(x=>x.v);
 sh.innerHTML=`<div class="bd"></div><div class="pn"><h3>أذكار وفضلها</h3><p class="znote">كل فضل منقول بنصه من sunnah.com مع رابطه. العدد المقترح من الحديث إن ذُكر فيه.</p>${L.map(x=>`<div class="zt-ai"><p class="dz">${esc(x.t)}</p><p class="hd">«${esc(x.v.h)}»</p><div class="zt-ar"><a href="${x.v.u}" target="_blank" rel="noopener">${esc(x.v.r)} · صحيح ↗</a><button class="zchip pri" data-k="${x.k}">${x.v.n?'عدّ '+ar(x.v.n):'ابدأ العد'}</button></div></div>`).join('')}<div class="zchips" style="justify-content:center"><button class="zchip" id="zt-ax">إغلاق</button></div></div>`;document.body.appendChild(sh);
 const close=()=>sh.remove();$('.bd',sh).onclick=close;$('#zt-ax',sh).onclick=close;$$('[data-k]',sh).forEach(b=>b.onclick=()=>{close();P.mode='free';pick(b.dataset.k)})}
function groupHTML(){return`<section class="zcard zt-grp" id="zt-grp"${liveCh().length||G.L.length?'':' hidden'}></section>`}
function paintG(){const el=$('#zt-grp');if(!el)return;const L=liveCh(),soon=G.L.filter(c=>c.status==='soon');if(!L.length&&!soon.length){el.hidden=true;return}el.hidden=false;
 if(L.length){const c=L[0],q=P.chq[c.id]||0,tot=(c.count||0)+q,on=X.sel==='g:'+c.id&&P.grp;el.innerHTML=`<div class="zt-gh"><span class="zt-live">● جارٍ الآن</span><a href="#dchal">كل التحديات ←</a></div><b>${esc(c.title)}</b><p class="dz sm">${esc(c.dhikr)}</p><div class="zt-bar"><i style="width:${Math.min(100,tot/c.goal*100).toFixed(2)}%"></i></div><small>${ar(tot)} من ${ar(c.goal)}${c.mine||q?` · مساهمتك ${ar((c.mine||0)+q)}`:''}</small><label class="zt-sw"><input type="checkbox" id="zt-gon"${on?' checked':''}><span>احسب تسبيحاتي في العدّاد الجماعي</span></label>`;
  $('#zt-gon').onchange=e=>{if(e.target.checked){P.mode='free';P.grp=1;X.sel='g:'+c.id;T.count=0}else{P.grp=0;if(X.sel==='g:'+c.id)X.sel=null}sv();render()}}
 else{const c=soon[0];el.innerHTML=`<div class="zt-gh"><span class="zt-live soon">قريبًا</span><a href="#dchal">التحديات الجماعية ←</a></div><b>${esc(c.title)}</b><p class="dz sm">${esc(c.dhikr)}</p><small>عندما يبدأ التحدي يمكنك أن تحسب تسبيحاتك فيه من هنا.</small>`}}
function stageHTML(){return`<div class="zt-stagew"><div id="zt-stage" class="zt-stage"></div></div>`}
function mountStage(){const host=$('#zt-stage');if(!host)return;if(STG)STG.destroy();host.innerHTML='';const s=STY.find(x=>x.k===P.st)||STY[0];
 if(s.k==='min'){STG=StyleRing(host,false)}else STG=s.f(host,false);host.dataset.st=s.k;const zr=$('.zt');if(zr)zr.dataset.st=s.k;paintNums()}
function paintNums(){const n=num(),t=tgt();const a=$('#zt-n');if(a)a.textContent=ar(n);const b=$('#zt-t');if(b)b.textContent=t?'من '+ar(t):'بلا حد';const r=$('#zt-round');if(r){const tt=T.count||0;r.textContent=!seqOn()&&!CH.on&&tt>=33?`الدورة ${ar(Math.floor(tt/33)+1)} · ${ar(tt%33)} من ٣٣`:''}}
function paint(lvl,ev){if(STG)STG.update(lvl);paintNums();if(MIN){$('b',MIN).textContent=ar(num());$('.dt',MIN).textContent=curText()}
 if(seqOn()){const box=$('#zt-seq');if(box)box.innerHTML=seqHTML();if(ev==='step'||ev==='seqdone'||ev===null){const dz=$('#zt-dz');if(dz&&dz.textContent!==curText())dz.textContent=curText()}const dn=$('#zt-done');if(dn){const h=seqDoneHTML();if(dn.innerHTML!==h){dn.innerHTML=h;const b=$('#zt-sqr');if(b)b.onclick=()=>{P.sq=null;sv();render()}}}}
 if(ev==='target'){const t=$('#zt-flash');if(t){t.textContent=`أتممت ${ar(+T.target)} ✓`;t.classList.remove('show');void t.offsetWidth;t.classList.add('show')}}
 const g=$('#zt-today');if(g)g.textContent=ar(dayTot(day()));if(cur().g)paintG()}
function previews(){const box=$('#zt-styles');if(!box)return;box.innerHTML=STY.map(s=>`<button class="zt-sc${s.k===P.st?' on':''}" data-st="${s.k}"><div class="pv"></div><b>${s.n}</b><small>${s.h}</small></button>`).join('');
 $$('.zt-sc',box).forEach(b=>{const s=STY.find(x=>x.k===b.dataset.st);try{s.f($('.pv',b),true)}catch(e){}b.onclick=()=>{if(s.k==='min'){openMin();return}P.st=s.k;sv();previews();mountStage();skins()}})}
function skins(){const box=$('#zt-skins');if(!box)return;box.innerHTML=Object.keys(SK).map(k=>`<button class="zt-sk${k===P.sk?' on':''}" data-sk="${k}" aria-label="${SK[k].n}"><canvas></canvas><small>${SK[k].n}</small></button>`).join('');
 $$('.zt-sk',box).forEach(b=>{const cv=$('canvas',b),cx=canvasFit(cv,64,34);cx.strokeStyle=SK[b.dataset.sk].th;cx.lineWidth=1.2;cx.beginPath();cx.moveTo(2,20);cx.quadraticCurveTo(32,30,62,20);cx.stroke();[[12,19],[32,23],[52,19]].forEach(([x,y])=>bead(x,y,9.5,b.dataset.sk,cx));b.onclick=()=>{P.sk=b.dataset.sk;sv();skins();previews();mountStage()}});
 box.parentElement.style.opacity=(P.st==='beads'||P.st==='zoom')?1:.55}
function render(){const d=cur(),q=sq(),mode=P.mode;closeMin();
 view.innerHTML=`${back('home','الرئيسية')}<h1 class="page">السبحة</h1><div class="zt">
 <div class="zt-seg" role="tablist">${[['free','عدّ حر'],['salah','دبر الصلاة'],['sleep','قبل النوم'],['chal','تحدي الدقيقة']].map(([k,n])=>`<button data-m="${k}" class="${(mode===k||(k==='chal'&&mode==='chal'))?'on':''}">${n}</button>`).join('')}</div>
 ${mode==='free'?`<div class="zchips zt-chips" id="zt-chips"></div><div class="zt-links"><button class="zt-link" id="zt-adh">${zi('star')||''}أذكار وفضلها من السنة</button><button class="zt-link" id="zt-pk2">${ic('search')}اختر من الأذكار</button></div>`:''}
 ${q?`<div id="zt-seq">${seqHTML()}</div>`:''}
 ${mode==='chal'?`<div class="zt-chal" id="zt-chal"><div class="zt-res"><b>${ar(+P.best||0)}</b><span>أفضل رقم لك في دقيقة</span><button class="zchip pri" id="zt-go">ابدأ التحدي ٦٠ ثانية</button><small>اختر أي شكل بالأسفل، وابدأ. كل ضغطة تُحسب في مجموعك.</small></div></div>`:''}
 <div class="dz zt-dz${curText().length>90?' lg':''}" id="zt-dz">${esc(curText())}</div>
 ${mode==='free'&&d.u&&d.u.note?`<p class="zt-nt">${esc(d.u.note)}</p>`:''}
 ${mode==='free'?virtueHTML(d.v):''}
 ${stageHTML()}
 <div class="zt-num"><b id="zt-n">${ar(num())}</b><small id="zt-t"></small><small id="zt-round" class="rd"></small><span class="zt-fl" id="zt-flash"></span></div>
 <div id="zt-done">${seqDoneHTML()}</div>
 <div class="zchips zt-act"><button class="zchip" id="zt-min">${zi('moon')||''}وضع المسجد</button><button class="zchip" id="zt-reset">${zi('refresh')||''}تصفير</button>${mode==='free'&&d.u?`<button class="zchip" id="zt-ed">${ic('edit')}تعديل الذكر</button>`:''}</div>
 ${mode==='free'?`<div class="zt-tg"><b>الهدف</b><div class="zt-seg sm">${[33,100,1000].map(v=>`<button data-tg="${v}" class="${+T.target===v?'on':''}">${ar(v)}</button>`).join('')}<button data-tg="c" class="${T.target&&![33,100,1000].includes(+T.target)?'on':''}">${T.target&&![33,100,1000].includes(+T.target)?ar(T.target):'مخصص'}</button><button data-tg="0" class="${!+T.target?'on':''}">بلا حد</button></div></div>`:''}
 ${q?seqVirtue():''}
 ${mode==='free'?myHTML():''}
 <h2 class="zt-h">شكل السبحة</h2><div class="zt-styles" id="zt-styles"></div>
 <div class="zt-skw"><h2 class="zt-h">الخامة <small>(للسبحة الكاملة والمكبّرة)</small></h2><div class="zt-skins" id="zt-skins"></div></div>
 <h2 class="zt-h">طرق العدّ</h2><section class="zcard zt-ways">
  <div class="zset"><span class="grow"><b>ضغط أو سحب</b><small>اضغط على السبحة، أو اسحب الحبات بإصبعك، أو زر المسافة/ريموت بلوتوث</small></span><span class="zt-on">مفعّل</span></div>
  ${CAN_VIB?`<label class="zset"><span class="grow"><b>الاهتزاز</b><small>نبضة خفيفة لكل حبة، وأقوى عند ٣٣ و١٠٠</small></span><input type="checkbox" id="zt-vib"${P.vib?' checked':''}></label>`:''}
  <label class="zset"><span class="grow"><b>صوت طقطقة خشب</b><small>نقرة خفيفة مع كل حبة (بدون موسيقى)</small></span><input type="checkbox" id="zt-snd"${P.snd?' checked':''}></label>
  <label class="zset"><span class="grow"><b>العدّ بهزّ الجوال</b><small>هزّة خفيفة بالمعصم = تسبيحة${IOS?' (الآيفون يطلب إذنك أول مرة)':''}</small></span><input type="checkbox" id="zt-mot"${P.mot?' checked':''}></label>
  ${P.mot?`<div class="zset"><span class="grow"><b>حساسية الهز</b></span><div class="zt-seg sm">${[[1,'قليلة'],[2,'متوسطة'],[3,'عالية']].map(([v,n])=>`<button data-sens="${v}" class="${(P.sens||2)===v?'on':''}">${n}</button>`).join('')}</div></div>`:''}
 </section>
 ${groupHTML()}
 <h2 class="zt-h">إنجازك</h2>${statsHTML()}
 <p class="znote">العدّ يحتاج الشاشة مضاءة، والمتصفح لا يستطيع قراءة أزرار الصوت. ${IOS?'':''}نُبقي الشاشة مضاءة أثناء التسبيح، و«وضع المسجد» شاشة سوداء خافتة تقفلها بضغطة مطوّلة.</p></div>`;
 if(mode==='free'){renderChips();wireMy();const p2=$('#zt-pk2');if(p2)p2.onclick=pickerSheet;const ed=$('#zt-ed');if(ed)ed.onclick=()=>{const c=cur();if(c.u)menuSheet(c.u)}}previews();skins();mountStage();paintG();
 $$('[data-m]').forEach(b=>b.onclick=()=>{if(CH.on)endCH();P.mode=b.dataset.m;sv();render()});
 const ad=$('#zt-adh');if(ad)ad.onclick=adhkarSheet;
 const go=$('#zt-go');if(go)go.onclick=startCH;
 $('#zt-min').onclick=openMin;
 $('#zt-reset').onclick=()=>{if(q){P.sq=null}else if(CH.on){CH.n=0}else{T.count=0;syncU()}sv();render()};
 const setTg=v=>{T.target=+v;T.count=0;syncU();sv();render()};
 $$('[data-tg]').forEach(b=>b.onclick=()=>{const v=b.dataset.tg;if(v==='c'){numSheet(setTg);return}setTg(v)});
 const vb=$('#zt-vib');if(vb)vb.onchange=e=>{P.vib=e.target.checked?1:0;sv();buzz(1)};
 $('#zt-snd').onchange=e=>{P.snd=e.target.checked?1:0;sv();tick(0)};
 $('#zt-mot').onchange=async e=>{if(e.target.checked){const ok=await motionOn(true);P.mot=ok?1:0;if(!ok)e.target.checked=false}else{P.mot=0;motionOff()}sv();render()};
 $$('[data-sens]').forEach(b=>b.onclick=()=>{P.sens=+b.dataset.sens;sv();render()});
 $('#zt-goal').onchange=e=>{P.goal=+e.target.value;sv();render()};
 $$('[data-ch]').forEach(b=>b.onclick=()=>{CHART=+b.dataset.ch;$$('[data-ch]').forEach(x=>x.classList.toggle('on',x===b));$('#zt-chart').innerHTML=stats7(CHART)});
 $('#zt-share').onclick=()=>shareCard(defaultShare());
 const sr=$('#zt-sqr');if(sr)sr.onclick=()=>{P.sq=null;sv();render()};
 if(P.mot)motionOn(false)}
function onKey(e){if(!document.querySelector('.zt')||e.repeat)return;const tg=e.target;if(tg&&(/INPUT|TEXTAREA|SELECT/.test(tg.tagName)||tg.isContentEditable))return;if([' ','Enter','ArrowDown','ArrowLeft','PageDown','MediaTrackNext'].includes(e.key)||e.keyCode===13||e.keyCode===32){if(tg&&tg.tagName==='BUTTON'&&(e.key==='Enter'||e.key===' '))return;e.preventDefault();if(!locked)hit('key')}}
let wl=null;
window.ZTSB={open(){if(!document.getElementById('ztcss')){const s=document.createElement('style');s.id='ztcss';s.textContent=css;document.head.appendChild(s)}
 if(P.mode==='chal'&&!CH.on){}render();loadG();addEventListener('keydown',onKey);try{wl&&wl.release()}catch(e){}wl=null;wake().then(w=>{wl=w}).catch(()=>{});
 const off=()=>{if(location.hash.slice(1).split('/')[0]!=='tasbeeh'){try{wl&&wl.release()}catch(e){}wl=null;closeMin();if(STG){STG.destroy();STG=null}if(CH.on){clearInterval(CH.tm);CH.on=false}motionOff();flush();removeEventListener('keydown',onKey);removeEventListener('hashchange',off)}};addEventListener('hashchange',off)},
 hit,_s:()=>({T,P,X,sq:P.sq,ch:CH})};
})();
