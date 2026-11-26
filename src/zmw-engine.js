
/* زاد — حاسبة المواريث (محرك). مذهب الحنابلة كما تعمل به المحاكم السعودية، مع التنبيه على المسائل الخلافية. */
(function(G){
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1};
const R=(n,d=1)=>{if(d<0){n=-n;d=-d}const g=gcd(n,d);return[n/g,d/g]};
const add=(a,b)=>R(a[0]*b[1]+b[0]*a[1],a[1]*b[1]),sub=(a,b)=>R(a[0]*b[1]-b[0]*a[1],a[1]*b[1]),mul=(a,b)=>R(a[0]*b[0],a[1]*b[1]),div=(a,b)=>R(a[0]*b[1],a[1]*b[0]);
const cmp=(a,b)=>a[0]*b[1]-b[0]*a[1];const Z=[0,1];
/* heir keys */
const H={husband:'الزوج',wife:'الزوجة',son:'الابن',daughter:'البنت',sson:'ابن الابن',sdau:'بنت الابن',father:'الأب',mother:'الأم',gf:'الجد (أبو الأب)',gmm:'الجدة لأم',gmf:'الجدة لأب',fb:'الأخ الشقيق',fs:'الأخت الشقيقة',pb:'الأخ لأب',ps:'الأخت لأب',mb:'الأخ لأم',ms:'الأخت لأم',fbs:'ابن الأخ الشقيق',pbs:'ابن الأخ لأب',fu:'العم الشقيق',pu:'العم لأب',fus:'ابن العم الشقيق',pus:'ابن العم لأب'};
const ORDER=Object.keys(H);
const MAX={husband:1,wife:4,father:1,mother:1,gf:1,gmm:1,gmf:1};
/* basis texts: ayah refs only (the verse text itself is fetched from the Qur'an API in the UI) */
function calc(inp){
 const c={};ORDER.forEach(k=>c[k]=Math.max(0,Math.min(MAX[k]||50,Math.floor(+inp[k]||0))));
 if(c.husband&&c.wife)return{err:'لا يجتمع زوج وزوجة في مسألة واحدة: الميت إما رجل أو امرأة.'};
 const notes=[],rows={};const put=(k,o)=>{rows[k]=Object.assign({k,name:H[k],n:c[k],share:Z},o)};
 const descM=c.son+c.sson>0, desc=descM||c.daughter+c.sdau>0, femDesc=!descM&&(c.daughter+c.sdau>0);
 const F=c.father>0, GF=!F&&c.gf>0;
 const sibCount=c.fb+c.fs+c.pb+c.ps+c.mb+c.ms;
 const blocked=(k,why)=>{if(c[k])put(k,{type:'b',why})};
 /* spouses */
 if(c.husband)put('husband',{type:'f',fard:desc?R(1,4):R(1,2),basis:'4:12',why:desc?'الربع لوجود الفرع الوارث':'النصف لعدم الفرع الوارث'});
 if(c.wife)put('wife',{type:'f',fard:desc?R(1,8):R(1,4),basis:'4:12',why:(desc?'الثمن لوجود الفرع الوارث':'الربع لعدم الفرع الوارث')+(c.wife>1?' — يشتركن فيه بالتساوي':'')});
 /* children */
 const asaba=[];/* [keys..., ratio male:female] groups in priority order */
 if(c.son){asaba.push({ks:['son','daughter'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:11'})}
 else if(c.daughter){put('daughter',{type:'f',fard:c.daughter>1?R(2,3):R(1,2),basis:'4:11',why:c.daughter>1?'الثلثان للبنتين فأكثر':'النصف للبنت الواحدة'})}
 if(c.son){blocked('sson','محجوب بالابن');blocked('sdau','محجوبة بالابن')}
 else{
  if(c.sson){asaba.push({ks:['sson','sdau'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:11'})}
  else if(c.sdau){
   if(!c.daughter)put('sdau',{type:'f',fard:c.sdau>1?R(2,3):R(1,2),basis:'4:11',why:c.sdau>1?'الثلثان (كالبنات عند عدمهن)':'النصف (كالبنت عند عدمها)'});
   else if(c.daughter===1)put('sdau',{type:'f',fard:R(1,6),basis:'4:11',why:'السدس تكملة الثلثين مع البنت الواحدة',hadith:'b6736'});
   else blocked('sdau','محجوبة باستكمال البنات الثلثين');
  }
 }
 /* father / grandfather */
 const parentShare=(k,label)=>{
  if(descM)put(k,{type:'f',fard:R(1,6),basis:'4:11',why:'السدس فرضًا لوجود الفرع الوارث المذكر'});
  else if(femDesc){put(k,{type:'f',fard:R(1,6),basis:'4:11',why:'السدس فرضًا، والباقي تعصيبًا لوجود الفرع المؤنث فقط'});asaba.push({ks:[k],why:'الباقي تعصيبًا بعد الفروض',addTo:true})}
  else asaba.push({ks:[k],why:'الباقي تعصيبًا لعدم الفرع الوارث',basis:'4:11'});
 };
 if(F){parentShare('father');blocked('gf','محجوب بالأب')}else if(GF)parentShare('gf');
 /* mother (العمريتان) */
 const umariyya=F&&!desc&&sibCount<2&&(c.husband||c.wife);
 if(c.mother){
  if(desc||sibCount>=2)put('mother',{type:'f',fard:R(1,6),basis:'4:11',why:desc?'السدس لوجود الفرع الوارث':'السدس لوجود جمع من الإخوة (ولو كانوا محجوبين)'});
  else if(umariyya){const sp=c.husband?R(1,2):R(1,4);put('mother',{type:'f',fard:mul(R(1,3),sub([1,1],sp)),basis:'4:11',why:'ثلث الباقي بعد فرض الزوج/الزوجة (العُمَريّتان)',src:'iq169748'})}
  else put('mother',{type:'f',fard:R(1,3),basis:'4:11',why:'الثلث لعدم الفرع الوارث وعدم جمع الإخوة'});
 }
 /* grandmothers */
 const gms=[];if(c.gmm){if(c.mother)blocked('gmm','محجوبة بالأم');else gms.push('gmm')}
 if(c.gmf){if(c.mother)blocked('gmf','محجوبة بالأم');else{gms.push('gmf');if(F)notes.push('الجدة لأب مع الأب: ورّثناها على المذهب الحنبلي، وجمهور العلماء يرون أن الأب يحجبها — راجع المحكمة.')}}
 if(gms.length){gms.forEach(k=>put(k,{type:'f',fard:R(1,6*gms.length),why:gms.length>1?'السدس تشترك فيه الجدتان':'السدس فرض الجدة',src:'sunnah'}))}
 /* maternal siblings */
 const mCnt=c.mb+c.ms;
 if(mCnt){
  if(desc||F||c.gf){['mb','ms'].forEach(k=>blocked(k,desc?'محجوب بالفرع الوارث':(F?'محجوب بالأب':'محجوب بالجد')))}
  else{const f=mCnt>1?R(1,3):R(1,6);['mb','ms'].forEach(k=>{if(c[k])put(k,{type:'f',fard:mul(f,R(c[k],mCnt)),basis:'4:12',why:mCnt>1?'الثلث يشتركون فيه بالتساوي ذكرهم كأنثاهم':'السدس للواحد منهم'})})}
 }
 /* full & paternal siblings */
 const sibBlockBy=descM?'محجوب بالفرع الوارث المذكر':F?'محجوب بالأب':c.gf?'محجوب بالجد (على القول الذي اختاره ابن باز وابن عثيمين)':null;
 if(c.gf&&!F&&(c.fb+c.fs+c.pb+c.ps)>0&&!descM)notes.push('الجد مع الإخوة الأشقاء أو لأب مسألة خلافية: حجبناهم بالجد على القول الذي رجّحه ابن باز وابن عثيمين والفوزان، والمذهب (مالك والشافعي وأحمد) يورّثهم معه بالمقاسمة — القسمة الرسمية للمحكمة.');
 let fsAsabaGhayr=false,psAsabaGhayr=false;
 if(sibBlockBy){['fb','fs','pb','ps'].forEach(k=>blocked(k,sibBlockBy))}
 else{
  if(c.fb)asaba.push({ks:['fb','fs'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:176'});
  else if(c.fs){
   if(femDesc){fsAsabaGhayr=true;asaba.push({ks:['fs'],why:'عصبة مع البنات (الأخوات مع البنات عصبة)',src:'iq179776'})}
   else put('fs',{type:'f',fard:c.fs>1?R(2,3):R(1,2),basis:'4:176',why:c.fs>1?'الثلثان للأختين فأكثر':'النصف للأخت الواحدة'});
  }
  /* paternal */
  if(c.fb||fsAsabaGhayr){blocked('pb',c.fb?'محجوب بالأخ الشقيق':'محجوب بالأخت الشقيقة العصبة مع البنات');blocked('ps',c.fb?'محجوبة بالأخ الشقيق':'محجوبة بالأخت الشقيقة العصبة مع البنات')}
  else{
   if(c.pb)asaba.push({ks:['pb','ps'],why:'تعصيب: للذكر مثل حظ الأنثيين',basis:'4:176'});
   else if(c.ps){
    if(femDesc){psAsabaGhayr=true;asaba.push({ks:['ps'],why:'عصبة مع البنات'})}
    else if(!c.fs)put('ps',{type:'f',fard:c.ps>1?R(2,3):R(1,2),basis:'4:176',why:c.ps>1?'الثلثان عند عدم الشقيقات':'النصف عند عدم الشقيقة'});
    else if(c.fs===1)put('ps',{type:'f',fard:R(1,6),basis:'4:176',why:'السدس تكملة الثلثين مع الأخت الشقيقة',src:'iq160901'});
    else blocked('ps','محجوبة باستكمال الشقيقات الثلثين');
   }
  }
 }
 /* distant male asaba */
 ['fbs','pbs','fu','pu','fus','pus'].forEach(k=>{if(c[k])asaba.push({ks:[k],why:'الباقي تعصيبًا (لأولى رجل ذكر)',hadith:'b6732'})});
 /* the first asaba group that exists inherits; the rest are blocked */
 let total=Z;Object.values(rows).forEach(r=>{if(r.type==='f')total=add(total,r.fard)});
 let rem=sub([1,1],total);let awl=false,radd=false,winner=null;
 const live=asaba.filter(g=>g.ks.some(k=>c[k]));
 if(live.length){winner=live[0];live.slice(1).forEach(g=>g.ks.forEach(k=>{if(c[k]&&!(rows[k]&&rows[k].type==='f'))blocked(k,'محجوب بمن هو أقرب منه من العصبة ('+winner.ks.map(x=>H[x]).filter((x,i)=>c[winner.ks[i]]).join('، ')+')')}))}
 /* shares */
 const fards=Object.values(rows).filter(r=>r.type==='f');
 if(cmp(total,[1,1])>0){awl=true;fards.forEach(r=>r.share=div(r.fard,total));if(winner)winner.ks.forEach(k=>{if(c[k]&&!rows[k])put(k,{type:'a',share:Z,why:winner.why+' — لم يبق لهم شيء بعد الفروض'})});
  notes.push('عَوْل: زادت الفروض على التركة فنقصت الأنصبة كلها بنسبة واحدة.')}
 else{
  fards.forEach(r=>r.share=r.fard);
  if(winner){
   const ks=winner.ks.filter(k=>c[k]);
   if(cmp(rem,Z)<=0){ks.forEach(k=>{if(!rows[k])put(k,{type:'a',share:Z,why:winner.why+' — استغرقت الفروض التركة فلم يبق لهم شيء'})});
    if(c.fb&&mCnt>1&&!desc&&!F&&!c.gf&&(c.husband)&&(c.mother||c.gmm||c.gmf))notes.push('المسألة المشرَّكة (الحمارية): لا شيء للإخوة الأشقاء على مذهب أبي حنيفة وأحمد، وشرّكهم عمر رضي الله عنه مع الإخوة لأم — راجع المحكمة.')}
   else{
    const wt=k=>(winner.ks.length>1&&k===winner.ks[0])?2:1;const units=ks.reduce((s,k)=>s+c[k]*wt(k),0);
    ks.forEach(k=>{const w=c[k]*wt(k);const part=mul(rem,R(w,units));
     if(rows[k]&&rows[k].type==='f'){rows[k].share=add(rows[k].share,part);rows[k].type='fa';rows[k].why+=' + الباقي تعصيبًا'}
     else put(k,{type:'a',share:part,why:winner.why,basis:winner.basis,hadith:winner.hadith||(winner.basis?null:'b6732'),src:winner.src})});
   }
  }else if(cmp(rem,Z)>0){
   const nonSp=fards.filter(r=>r.k!=='husband'&&r.k!=='wife');
   if(nonSp.length){radd=true;const spT=fards.filter(r=>r.k==='husband'||r.k==='wife').reduce((s,r)=>add(s,r.fard),Z);const nsT=nonSp.reduce((s,r)=>add(s,r.fard),Z);const pool=sub([1,1],spT);
    nonSp.forEach(r=>r.share=mul(pool,div(r.fard,nsT)));notes.push('رَدّ: بقي شيء بعد الفروض ولا عاصب، فرُدّ على أصحاب الفروض بنسبة فروضهم (لا يُرد على الزوجين).')}
   else notes.push('بقي من التركة ما لا وارث له من المذكورين؛ يُنظر في ذوي الأرحام أو بيت المال — راجع المحكمة.');
  }
 }
 const list=ORDER.filter(k=>rows[k]).map(k=>{const r=rows[k];r.per=r.n?mul(r.share,R(1,r.n)):Z;return r});
 /* common denominator (أصل المسألة بعد العول/الرد والتصحيح) */
 const den=list.reduce((d,r)=>{const p=r.per;return p[0]?d*p[1]/gcd(d,p[1]):d},1);
 return{rows:list,notes,awl,radd,base:den};
}
G.ZMW={calc,H,ORDER,R,frac:a=>a[0]+'/'+a[1]};
})(typeof window!=='undefined'?window:globalThis);
