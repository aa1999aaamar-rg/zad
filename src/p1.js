
const zi=(k,c)=>`<svg class="z-ic${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ZIC[k]||ZIC.dot}</svg>`;
window.ZI=zi;
const Z=S.z4=Object.assign({deeds:{},fast:{},sad:{},kh:{},hz:{},bm:{},lib:[]},S.z4||{});
Z.fast=Object.assign({mt:true,white:true,time:'21:00',suhoor:false,stime:'03:30',adj:0},Z.fast);
Z.sad=Object.assign({log:[],on:false,day:5,time:'10:00'},Z.sad);
['deeds','kh','hz','bm'].forEach(k=>{if(!Z[k]||typeof Z[k]!=='object')Z[k]={}});if(!Array.isArray(Z.lib))Z.lib=[];
const ar=x=>AR(x);
const go=h=>{location.hash=h};
const dayKey=(d=new Date)=>iso(d);
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const WD=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const HM=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
const backBtn=(h,l)=>`<button class="back" onclick="location.hash='${h}'">${zi('chev')} ${l}</button>`;
const toNum=s=>+String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));

/* palette: move away from the old teal/gold */
try{const NEWA=['#34457a','#9a4f2e','#4f5e2f','#6a3f6e','#2f4f5f','#7a3343'];const OLD=['#0b6f78','#1f6f4a','#7a5a12','#6b2f6b','#1d4e89','#8c2f39'];
 if(typeof ACCENTS!=='undefined')ACCENTS.splice(0,ACCENTS.length,...NEWA);
 if(!Z.pal){const i=OLD.indexOf(S.settings.accent);S.settings.accent=NEWA[i>=0?i:0];Z.pal=1;save()}}catch(e){}
try{const _apply=applySettings;applySettings=function(){_apply.apply(this,arguments);const m=document.querySelector('meta[name=theme-color]');m&&m.setAttribute('content',S.settings.theme==='dark'?'#0d0f15':'#f6f4ef')}}catch(e){}

/* Hijri (Umm al-Qura via Intl) */
const HF=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'});
function hij(d){const x=addD(d,+Z.fast.adj||0);const p={};HF.formatToParts(x).forEach(o=>p[o.type]=o.value);return{d:+p.day,m:+p.month,y:parseInt(p.year)}}
function fastInfo(d){const h=hij(d),w=d.getDay(),r=[];
 if(h.m===9)return{h,r:[],skip:'رمضان'};
 if((h.m===10&&h.d===1)||(h.m===12&&h.d>=10&&h.d<=13))return{h,r:[],skip:'عيد'};
 if(Z.fast.white&&h.d>=13&&h.d<=15)r.push('white');
 if(Z.fast.mt&&(w===1||w===4))r.push(w===1?'mon':'thu');
 return{h,r}}
function fastLabel(fi){const p=[];if(fi.r.includes('mon'))p.push('الاثنين');if(fi.r.includes('thu'))p.push('الخميس');if(fi.r.includes('white'))p.push('من الأيام البيض ('+ar(fi.h.d)+')');return p.join(' · ')}
function nextFasts(n=6,from=new Date()){const out=[];for(let i=0;i<60&&out.length<n;i++){const d=addD(from,i);d.setHours(12,0,0,0);const fi=fastInfo(d);if(fi.r.length)out.push({d,fi,i})}return out}
window.zHij=hij;window.zNextFasts=nextFasts;
function fastBanner(){if(!Z.fast.mt&&!Z.fast.white)return'';const now=new Date(),t=fastInfo(now),tm=addD(now,1),fi=fastInfo(tm);
 if(t.r.length&&now.getHours()<19)return`<a class="zbanner" href="#sawm">${zi('fast')}<div><b>اليوم ${WD[now.getDay()]}، يوم صيام تطوع</b><small>${fastLabel(t)}</small></div></a>`;
 if(fi.r.length&&now.getHours()>=12)return`<a class="zbanner" href="#sawm">${zi('moon')}<div><b>غدًا ${WD[tm.getDay()]}، تذكير بصيام التطوع</b><small>${fastLabel(fi)} · لا تنسَ السحور</small></div></a>`;return''}
function fastStrip(days=14){const now=new Date();let h='';for(let i=0;i<days;i++){const d=addD(now,i);d.setHours(12);const fi=fastInfo(d);h+=`<div class="zfd${fi.r.length?' f':''}${i===0?' t':''}">${WD[d.getDay()].replace('ال','')}<b>${ar(d.getDate())}</b><small>${ar(fi.h.d)} ${HM[fi.h.m-1].split(' ')[0]}</small><i>${fi.r.includes('white')?'أبيض':fi.r.length?'صيام':'&nbsp;'}</i></div>`}return`<div class="zfast">${h}</div>`}

/* reminders: fasting + sadaqah join the existing scheduler */
function zRems(){const out=[],now=new Date();
 if(Z.fast.mt||Z.fast.white){const tm=addD(now,1),fi=fastInfo(tm);
  if(fi.r.length){out.push({id:'fz'+dayKey(tm),at:atTime(Z.fast.time||'21:00'),title:'تذكير بالصيام',body:`غدًا ${WD[tm.getDay()]}، تذكير بصيام التطوع${fi.r.includes('white')?' (من الأيام البيض)':''}`,url:'#sawm',type:'fast'});
   if(Z.fast.suhoor)out.push({id:'fs'+dayKey(tm),at:atTime(Z.fast.stime||'03:30',tm),title:'السحور',body:`اليوم ${WD[tm.getDay()]}، وقت السحور لمن نوى الصيام`,url:'#sawm',type:'fast'})}}
 if(Z.sad.on&&now.getDay()===+Z.sad.day)out.push({id:'sd'+dayKey(now),at:atTime(Z.sad.time||'10:00'),title:'صندوق الصدقة',body:'تذكيرك الأسبوعي بالصدقة ولو بالقليل',url:'#sadaqa',type:'sadaqa'});
 return out}
window.zRems=zRems;
try{if(typeof todaysReminders==='function'){const _tr=todaysReminders;todaysReminders=function(){let r=[];try{r=_tr.apply(this,arguments)||[]}catch(e){}if(Z.fast.white)r=r.filter(x=>!/^wd/.test(x.id));try{r=r.concat(zRems())}catch(e){}return r}}}catch(e){}
async function zSyncSW(){try{const c=await caches.open('zad-cfg');await c.put('/__zadcfg',new Response(JSON.stringify({fast:Z.fast,sad:Z.sad,app:APP_NAME}),{headers:{'Content-Type':'application/json'}}))}catch(e){}
 try{if(!('serviceWorker' in navigator))return;const r=await navigator.serviceWorker.ready;
  if(r.periodicSync){const st=await navigator.permissions.query({name:'periodic-background-sync'}).catch(()=>({state:'denied'}));Z.psync=st.state;if(st.state==='granted')await r.periodicSync.register('zad-daily',{minInterval:4*3600e3})}
  if(window.Notification&&'showTrigger' in Notification.prototype&&window.TimestampTrigger&&Notification.permission==='granted'){const nowt=Date.now();for(const f of nextFasts(8)){const at=atTime(Z.fast.time||'21:00',addD(f.d,-1));if(+at>nowt)r.showNotification('تذكير بالصيام',{body:`غدًا ${WD[f.d.getDay()]}، تذكير بصيام التطوع`,tag:'zf'+dayKey(f.d),showTrigger:new TimestampTrigger(+at),icon:'icons/icon-192.png',badge:'icons/icon-192.png',dir:'rtl',lang:'ar',data:{url:'./#sawm'}})}}}catch(e){}}
function resched(){save();try{scheduleReminders()}catch(e){}zSyncSW()}
