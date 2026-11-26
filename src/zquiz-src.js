/* زاد v5.5.6 — «مسابقات العائلة»: غرفة يُنشئها المضيف برمز، ويدخلها كلُّ لاعب من جواله، والسؤال نفسه يظهر للجميع في اللحظة نفسها.
   الأسئلة والتصحيح على الخادم (/api/zq/*)، والعميل لا يعرف الإجابة قبل كشفها. Minified to site/zquiz.js (loaded last). */
!function(){"use strict";
if(window.ZQUIZ||typeof V==="undefined")return;const X=window.ZQUIZ={};
const F=(window.ZS&&ZS.F)||{};const zi=k=>{try{return ZS.zi(k)}catch(e){return""}};
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const AN=x=>String(x).replace(/\d/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]);
const LS={g(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const tst=m=>{try{toast(m)}catch(e){}};
const EMO=["🌙","⭐","🌴","🐪","📘","🕌","🏆","🎯","🌟","🍃","💎","🔥","🎈","☀️","🦅","🐎"];
const CATN={i:"إسلامية",c:"ثقافية",h:"تاريخية"},DN={1:"سهل",2:"متوسط",3:"صعب"},LET=["أ","ب","ج","د"];
let pid=LS.g("zad.zq.pid","");if(!/^[A-Za-z0-9]{16,40}$/.test(pid)){pid="";const a="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";const r=new Uint32Array(24);(crypto.getRandomValues?crypto.getRandomValues(r):r.forEach((_,i)=>r[i]=Math.random()*1e9));r.forEach(x=>pid+=a[x%a.length]);LS.s("zad.zq.pid",pid)}
const me=()=>{const m=LS.g("zad.zq.me",{});return{name:(m.name||(typeof S!=="undefined"&&S&&(S.profile&&S.profile.name||S.name))||"").slice(0,18),emo:EMO.includes(m.emo)?m.emo:EMO[0]}};
/* ── القسم: السجل، المجموعات، البحث، الوصول السريع ── */
F.fquiz=["مسابقات العائلة","trophy","تنافسوا كلٌّ من جواله في أسئلة إسلامية وثقافية وتاريخية","مسابقه مسابقات مسابقة العائله عائلة اسئله اسئلة سؤال تحدي اصدقاء غرفه غرفة لعبه لعبة ترفيه معلومات ثقافيه تاريخيه"];
try{const s=(ZS.SEC||[]).find(s=>s.id==="family");const g=s&&s.g&&s.g[0];if(g&&!g[1].includes("fquiz"))g[1].unshift("fquiz")}catch(e){}
/* ── الصوت (اختياري ويمكن كتمه) ── */
let AC=null;const muted=()=>!!LS.g("zad.zq.mute",false);
function snd(k){if(muted())return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const seq={ok:[[660,.09],[880,.14]],no:[[220,.18]],tick:[[1000,.03]],win:[[523,.12],[659,.12],[784,.12],[1046,.25]],go:[[440,.08],[660,.1]]}[k]||[];let t=AC.currentTime;seq.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);t+=d*.9})}catch(e){}}
function buzz(n){try{navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
/* ── الاتصال بالخادم ── */
let off=0;
async function api(op,body){const t0=Date.now();const r=await fetch("/api/zq/"+op,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.assign({pid},body||{})),cache:"no-store"});
 let j={};try{j=await r.json()}catch(e){}if(j&&j.now){const t1=Date.now();off=j.now-(t0+t1)/2}if(!r.ok||!j.ok){const e=new Error(j&&j.e||("http"+r.status));e.code=j&&j.e;throw e}return j}
const ERR={noroom:"لا توجد غرفة بهذا الرمز، تأكّد منه.",full:"الغرفة ممتلئة (٢٠ لاعبًا).",code:"اكتب رمز الغرفة المكوّن من خمسة أرقام.",rate:"أنشأت غرفًا كثيرة، حاول بعد قليل.",notin:"خرجت من الغرفة.",late:"انتهى وقت السؤال."};
const errMsg=e=>ERR[e&&e.code]||(navigator.onLine===false?"لا يوجد اتصال بالإنترنت؛ المسابقة تحتاج إلى الإنترنت.":"تعذّر الاتصال، حاول مرة أخرى.");
/* ── الحالة المحلية ── */
let ST=null,room=LS.g("zad.zq.room",""),poll=null,raf=0,lastSig="",hide=[],busy=false,sentQ=-1,saved="";
const view=()=>document.getElementById("view");const box=()=>document.getElementById("zqv");
function stop(){clearInterval(poll);poll=null;cancelAnimationFrame(raf)}
function startPoll(){clearInterval(poll);poll=setInterval(tick,1000);tick()}
async function tick(){if(!room||!box()){stop();return}if(busy)return;busy=true;try{const s=await api("state",{code:room});setState(s)}catch(e){if(e.code==="noroom"||e.code==="notin"){leaveLocal();tst(errMsg(e));draw()}else{const n=document.getElementById("zqnet");if(n)n.hidden=false}}finally{busy=false}}
function setState(s){const prev=ST;if(cfgPend&&prev&&prev.cfg&&s.st==="lobby")s.cfg=prev.cfg;ST=s;const n=document.getElementById("zqnet");if(n)n.hidden=true;
 if(prev&&prev.qi!==s.qi)hide=[];
 if(prev&&prev.st!=="rev"&&s.st==="rev"){const m=s.my;if(m&&m.ok){snd("ok");buzz(30)}else{snd("no");buzz([20,40,20])}}
 if(prev&&prev.st!=="end"&&s.st==="end")onEnd(s);
 if(prev&&prev.pre&&!s.pre&&s.st==="q")snd("go");
 draw()}
function leaveLocal(){room="";LS.s("zad.zq.room","");ST=null;stop()}
/* ── الرسم ── */
const sigOf=s=>s?[s.st,s.qi,s.pre?1:0,s.host,s.my?s.my.ch:"-",JSON.stringify(s.cfg),s.players.map(p=>p.p+p.name+p.emo+p.score+(p.on?1:0)+(p.ans?1:0)).join(","),hide.join(""),s.myhelp].join("|"):"none";
function draw(force){const b=box();if(!b)return;const sg=sigOf(ST)+(ST?"":"|"+room);if(!force&&sg===lastSig)return;lastSig=sg;
 if(!ST){b.innerHTML=startHTML();bindStart();return}
 const s=ST;const pk=s.st+":"+s.qi+":"+(s.pre?1:0);if(b.dataset.pk!==pk){b.dataset.pk=pk;try{window.scrollTo(0,0)}catch(e){}}b.innerHTML=topHTML(s)+(s.st==="lobby"?lobbyHTML(s):s.st==="q"?(s.pre?preHTML(s):qHTML(s)):s.st==="rev"?revHTML(s):endHTML(s));bindRoom();anim()}
const isHost=s=>s&&s.host&&s.host===s.me;
function topHTML(s){return `<div class="zq-top"><button class="zq-ib" data-a="leave" aria-label="خروج">${zi("close")||"✕"}</button><div class="zq-code">غرفة <b dir="ltr">${AN(s.code)}</b></div><button class="zq-ib" data-a="mute" aria-label="الصوت">${muted()?"🔇":"🔊"}</button></div><div class="zq-net" id="zqnet" hidden>جارٍ إعادة الاتصال…</div>`}
function startHTML(){const m=me(),h=LS.g("zad.zq.hist",[]);const code=(pendingCode||"");
 return `<div class="zq-hero"><div class="zq-trophy">${trophy()}</div><h1>مسابقات العائلة</h1><p>اجتمعوا مع العائلة أو الأصدقاء وتنافسوا كلٌّ من جواله في أسئلة إسلامية وثقافية وتاريخية للفائدة والتسلية.</p></div>
 <div class="zq-card"><label class="zq-lb">اسمك في المسابقة</label><input id="zqname" class="zq-in" maxlength="18" placeholder="اكتب اسمك" value="${esc(m.name)}">
 <div class="zq-emos">${EMO.map(e=>`<button class="zq-emo${e===m.emo?" on":""}" data-e="${e}">${e}</button>`).join("")}</div></div>
 <div class="zq-card zq-join"><label class="zq-lb">لديك رمز غرفة؟</label><div class="zq-row"><input id="zqcode" class="zq-in zq-cin" inputmode="numeric" maxlength="5" placeholder="٠٠٠٠٠" dir="ltr" value="${esc(code)}"><button class="zq-btn zq-gold" data-a="join">انضمام</button></div></div>
 <button class="zq-btn zq-big" data-a="create">${zi("plus")||"＋"} إنشاء غرفة جديدة</button>
 <div class="zq-how"><b>كيف تلعبون؟</b><ol><li>يُنشئ أحدكم غرفة ويرسل رمزها أو رابطها للبقية.</li><li>يدخل كلُّ لاعب من جواله بالرمز، ويختار المضيف الفئات والصعوبة وعدد الأسئلة.</li><li>يظهر السؤال للجميع في اللحظة نفسها؛ الإجابة الصحيحة ١٠٠ نقطة، ومع السرعة مكافأة حتى ٥٠.</li><li>لكل لاعب «مساعدة» واحدة تحذف إجابتين خاطئتين.</li></ol></div>
 ${h.length?`<div class="zq-card"><div class="zq-lb">مبارياتك السابقة</div>${histHTML(h)}</div>`:""}`}
function histHTML(h){const best=h.reduce((a,x)=>Math.max(a,x.score||0),0),wins=h.filter(x=>x.rank===1).length;
 return `<div class="zq-stats"><div><b>${AN(h.length)}</b><span>مباراة</span></div><div><b>${AN(wins)}</b><span>فوز</span></div><div><b>${AN(best)}</b><span>أعلى نقاط</span></div></div>`+
 h.slice(0,6).map(x=>`<div class="zq-hrow"><span>${x.rank===1?"🏆":"🎯"} المركز ${AN(x.rank)} من ${AN(x.of)}</span><span>${AN(x.score)} نقطة</span><small>${esc(new Date(x.t).toLocaleDateString("ar-SA-u-ca-gregory-nu-arab",{day:"numeric",month:"short"}))}</small></div>`).join("")}
function plHTML(s,mode){const ps=s.players.slice();if(mode!=="lobby")ps.sort((a,b)=>b.score-a.score);
 return `<div class="zq-pl">${ps.map((p,i)=>`<div class="zq-p${p.p===s.me?" me":""}${p.on?"":" off"}">${mode!=="lobby"?`<span class="zq-rk">${AN(i+1)}</span>`:""}<span class="zq-av">${esc(p.emo)}</span><span class="zq-nm">${esc(p.name)}${p.p===s.host?' <i class="zq-crown">المضيف</i>':""}${p.p===s.me?' <i>(أنت)</i>':""}</span>${mode==="q"?`<span class="zq-st">${p.ans?"✓":"…"}</span>`:mode==="lobby"?"":`<span class="zq-sc">${mode==="rev"&&p.pts?`<em dir="ltr">+${AN(p.pts)}</em>`:""}${AN(p.score)}</span>`}</div>`).join("")}</div>`}
function lobbyHTML(s){const h=isHost(s),c=s.cfg||{},url=location.origin+location.pathname+"#fquiz/"+s.code;const all=(c.cats||[]).length===3;
 const chip=(g,v,l,on)=>`<button class="zq-chip${on?" on":""}" data-g="${g}" data-v="${v}" ${h?"":"disabled"}>${l}</button>`;
 return `<div class="zq-card zq-codebox"><div class="zq-lb">رمز الغرفة</div><div class="zq-bigcode" dir="ltr">${AN(s.code)}</div><div class="zq-row zq-share"><button class="zq-btn zq-wa" data-a="wa">واتساب</button><button class="zq-btn zq-ghost" data-a="copy" data-u="${esc(url)}">نسخ الرابط</button>${navigator.share?`<button class="zq-btn zq-ghost" data-a="share">مشاركة</button>`:""}</div></div>
 <div class="zq-card"><div class="zq-lb">اللاعبون (${AN(s.players.length)})</div>${plHTML(s,"lobby")}${s.players.length<2?`<p class="zq-mut">بانتظار انضمام لاعب آخر على الأقل…</p>`:""}</div>
 <div class="zq-card"><div class="zq-lb">${h?"إعدادات المسابقة":"إعدادات المضيف"}</div>
 <div class="zq-sl">الفئات</div><div class="zq-chips">${chip("cat","all","منوّعة (الكل)",all)}${["i","c","h"].map(k=>chip("cat",k,CATN[k],!all&&(c.cats||[]).includes(k))).join("")}</div>
 <div class="zq-sl">الصعوبة</div><div class="zq-chips">${chip("d",0,"مختلطة",!c.d)}${[1,2,3].map(k=>chip("d",k,DN[k],c.d===k)).join("")}</div>
 <div class="zq-sl">عدد الأسئلة</div><div class="zq-chips">${[10,20,30].map(k=>chip("n",k,AN(k),c.n===k)).join("")}</div>
 <div class="zq-sl">وقت كل سؤال</div><div class="zq-chips">${[15,30].map(k=>chip("t",k,AN(k)+" ثانية",c.t===k)).join("")}${chip("t",0,"بلا مؤقت",c.t===0)}</div></div>
 ${h?`<button class="zq-btn zq-big" data-a="start" ${s.players.length<2?"disabled":""}>ابدأ المسابقة</button>`:`<div class="zq-wait"><span class="zq-dots"><i></i><i></i><i></i></span> بانتظار أن يبدأ المضيف</div>`}`}
function preHTML(s){return `<div class="zq-pre"><div class="zq-lb">${s.qi===0?"استعدّوا!":"السؤال التالي"}</div><div class="zq-cd" id="zqcd">٣</div><div class="zq-mut">السؤال ${AN(s.qi+1)} من ${AN(s.n)}</div></div>`}
function qHead(s){const q=s.q;return `<div class="zq-qh"><span class="zq-qn">السؤال ${AN(s.qi+1)} / ${AN(s.n)}</span><span class="zq-tag t-${q.c}">${CATN[q.c]}</span><span class="zq-tag">${DN[q.d]}</span></div><div class="zq-bar"><i style="width:${(s.qi/s.n*100).toFixed(1)}%"></i></div>`}
function ring(){return `<div class="zq-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" class="bg"/><circle cx="22" cy="22" r="19" class="fg" id="zqrg" pathLength="100"/></svg><b id="zqrt"></b></div>`}
function qHTML(s){const q=s.q,my=s.my,ans=s.players.filter(p=>p.ans).length;
 return `${qHead(s)}<div class="zq-qcard">${s.qdur>0?ring():""}<div class="zq-qt">${esc(q.t)}</div></div>
 <div class="zq-opts">${q.o.map((o,i)=>`<button class="zq-opt${my&&my.ch===i?" pick":""}${hide.includes(i)?" gone":""}" data-ch="${i}" ${my||hide.includes(i)?"disabled":""}><span class="zq-l">${LET[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>
 <div class="zq-row zq-qf">${my?`<div class="zq-sent">تم تسجيل إجابتك ✓ بانتظار البقية (${AN(ans)}/${AN(s.players.length)})</div>`:`<button class="zq-btn zq-help" data-a="help" ${s.myhelp?"disabled":""}>🛟 ${s.myhelp?"استُخدمت المساعدة":"مساعدة: احذف إجابتين"}</button>`}${isHost(s)?`<button class="zq-btn zq-ghost zq-sm" data-a="next">كشف الإجابة</button>`:""}</div>
 ${plHTML(s,"q")}`}
function revHTML(s){const q=s.q,my=s.my;const ok=my&&my.ok;
 return `${qHead(s)}<div class="zq-res ${my?(ok?"good":"bad"):"none"}">${my?(ok?`إجابة صحيحة! <b dir="ltr">+${AN(my.pts)}</b>`:"إجابة غير صحيحة"):"لم تُجب عن هذا السؤال"}</div>
 <div class="zq-qcard sm"><div class="zq-qt">${esc(q.t)}</div></div>
 <div class="zq-opts">${q.o.map((o,i)=>`<div class="zq-opt ${i===s.correct?"right":my&&my.ch===i?"wrong":"dim"}"><span class="zq-l">${i===s.correct?"✓":LET[i]}</span><span>${esc(o)}</span></div>`).join("")}</div>
 ${s.fact?`<div class="zq-fact">💡 ${esc(s.fact)}</div>`:""}
 <div class="zq-card"><div class="zq-lb">الترتيب</div>${plHTML(s,"rev")}</div>
 ${isHost(s)?`<button class="zq-btn zq-big" data-a="next">${s.qi+1>=s.n?"النتيجة النهائية 🏆":"السؤال التالي"}</button>`:`<div class="zq-wait">يتابع المضيف إلى ${s.qi+1>=s.n?"النتيجة":"السؤال التالي"}…</div>`}`}
function endHTML(s){const ps=s.players.slice().sort((a,b)=>b.score-a.score);const top=ps[0];const tie=ps[1]&&ps[1].score===top.score;
 const pod=[ps[1],ps[0],ps[2]].map((p,i)=>p?`<div class="zq-pod p${[2,1,3][i]}"><div class="zq-av">${esc(p.emo)}</div><div class="zq-pn">${esc(p.name)}</div><div class="zq-ps">${AN(p.score)}</div><div class="zq-step">${AN([2,1,3][i])}</div></div>`:"<div class=\"zq-pod\"></div>").join("");
 return `<canvas id="zqconf" class="zq-conf"></canvas><div class="zq-win"><div class="zq-trophy sm">${trophy()}</div><h2>${tie?"تعادل في الصدارة!":"الفائز: "+esc(top.name)+" "+esc(top.emo)}</h2><p>بارك الله فيكم، ونفعكم بما تعلّمتم.</p></div>
 <div class="zq-podium">${pod}</div><div class="zq-card"><div class="zq-lb">الترتيب النهائي</div>${plHTML(s,"end")}</div>
 ${isHost(s)?`<button class="zq-btn zq-big" data-a="again">إعادة اللعب بالغرفة نفسها</button>`:`<div class="zq-wait">يمكن للمضيف بدء جولة جديدة</div>`}<button class="zq-btn zq-ghost zq-wide" data-a="leave">خروج</button>`}
function trophy(){return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="zqg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d27a"/><stop offset="1" stop-color="#c08a2b"/></linearGradient></defs><path d="M18 8h28v10c0 9-6 16-14 16S18 27 18 18z" fill="url(#zqg)"/><path d="M18 12H9c0 9 4 14 11 15M46 12h9c0 9-4 14-11 15" fill="none" stroke="#d6a640" stroke-width="3.5" stroke-linecap="round"/><path d="M28 34h8l1 9h-10z" fill="#c99634"/><rect x="20" y="43" width="24" height="8" rx="2" fill="#1d2545"/><rect x="16" y="51" width="32" height="6" rx="2" fill="#2b3766"/><path d="M32 13l2.2 4.4 4.8.7-3.5 3.4.8 4.8L32 24l-4.3 2.3.8-4.8-3.5-3.4 4.8-.7z" fill="#fff8e1"/></svg>`}
/* ── المؤقت والعدّ ── */
function anim(){cancelAnimationFrame(raf);const s=ST;if(!s)return;let lastSec=-1;
 const f=()=>{if(ST!==s&&ST&&(ST.st!==s.st||ST.qi!==s.qi))return;const now=Date.now()+off;
  if(s.st==="q"&&s.pre){const left=Math.max(0,Math.ceil((s.qstart-now)/1000));const el=document.getElementById("zqcd");if(el)el.textContent=left?AN(left):"انطلق!";if(left!==lastSec&&left>0){snd("tick");lastSec=left}if(now>=s.qstart&&!busy)tick()}
  else if(s.st==="q"&&s.qdur>0){const left=Math.max(0,s.qstart+s.qdur-now);const fr=left/s.qdur;const g=document.getElementById("zqrg"),t=document.getElementById("zqrt");if(g){g.style.strokeDasharray=`${(fr*100).toFixed(2)} 100`;g.classList.toggle("warn",left<5000)}if(t)t.textContent=AN(Math.ceil(left/1000));const sec=Math.ceil(left/1000);if(sec<=5&&sec>0&&sec!==lastSec&&!s.my){snd("tick");lastSec=sec}}
  raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
function onEnd(s){snd("win");buzz([40,60,40]);const ps=s.players.slice().sort((a,b)=>b.score-a.score);const i=ps.findIndex(p=>p.p===s.me);const key=s.code+":"+s.qi+":"+ps.map(p=>p.score).join(",");
 if(i>=0&&saved!==key){saved=key;const h=LS.g("zad.zq.hist",[]);h.unshift({t:Date.now(),code:s.code,rank:i+1,of:ps.length,score:ps[i].score,n:s.n});LS.s("zad.zq.hist",h.slice(0,30))}
 setTimeout(confetti,60)}
function confetti(){const c=document.getElementById("zqconf");if(!c)return;const W=c.width=c.offsetWidth*devicePixelRatio,H=c.height=c.offsetHeight*devicePixelRatio;const x=c.getContext("2d");const cols=["#d6a640","#f3d27a","#1d2545","#34457a","#3f8f6b","#ffffff"];
 const P=Array.from({length:120},()=>({x:Math.random()*W,y:-Math.random()*H*.6,w:6+Math.random()*8,h:4+Math.random()*6,v:2+Math.random()*4,r:Math.random()*6,s:(Math.random()-.5)*.2,c:cols[Math.random()*cols.length|0]}));const t0=performance.now();
 const st=t=>{x.clearRect(0,0,W,H);P.forEach(p=>{p.y+=p.v*devicePixelRatio;p.x+=Math.sin((t-t0)/400+p.r)*1.2;p.r+=p.s;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});if(t-t0<4200&&document.getElementById("zqconf")===c)requestAnimationFrame(st);else x.clearRect(0,0,W,H)};requestAnimationFrame(st)}
/* ── الأحداث ── */
let pendingCode="",cfgQ=Promise.resolve(),cfgPend=0;
function saveMe(){const n=document.getElementById("zqname");const m=me();const on=document.querySelector(".zq-emo.on");LS.s("zad.zq.me",{name:n?n.value.trim().slice(0,18):m.name,emo:on?on.dataset.e:m.emo})}
function bindStart(){const b=box();b.querySelectorAll(".zq-emo").forEach(e=>e.onclick=()=>{b.querySelectorAll(".zq-emo").forEach(x=>x.classList.remove("on"));e.classList.add("on");saveMe()});
 const n=document.getElementById("zqname");if(n)n.oninput=saveMe;const ci=document.getElementById("zqcode");if(ci)ci.oninput=()=>{ci.value=ci.value.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g,"").slice(0,5)};
 b.querySelectorAll("[data-a]").forEach(el=>el.onclick=()=>act(el.dataset.a,el))}
function needName(){saveMe();const m=me();if(!m.name){tst("اكتب اسمك أولًا");const n=document.getElementById("zqname");if(n)n.focus();return null}return m}
async function act(a,el){
 if(a==="create"){const m=needName();if(!m)return;el.disabled=true;try{const s=await api("create",m);room=s.code;LS.s("zad.zq.room",room);history.replaceState(null,"","#fquiz/"+room);setState(s);startPoll()}catch(e){tst(errMsg(e));el.disabled=false}return}
 if(a==="join"){const m=needName();if(!m)return;const c=(document.getElementById("zqcode")||{}).value||"";if(!/^\d{5}$/.test(c)){tst(ERR.code);return}el.disabled=true;try{const s=await api("join",Object.assign({code:c},m));room=c;LS.s("zad.zq.room",room);history.replaceState(null,"","#fquiz/"+room);setState(s);startPoll()}catch(e){tst(errMsg(e));el.disabled=false}return}
 if(a==="mute"){LS.s("zad.zq.mute",!muted());if(!muted())snd("ok");draw(true);return}
 if(a==="leave"){if(ST&&ST.st!=="end"&&!confirm("هل تريد الخروج من الغرفة؟"))return;const c=room;leaveLocal();history.replaceState(null,"","#fquiz");draw(true);try{await api("leave",{code:c})}catch(e){}return}
 if(a==="wa"||a==="share"||a==="copy"){const url=location.origin+location.pathname+"#fquiz/"+ST.code;const txt=`تعالَ نتسابق في «مسابقات العائلة» على تطبيق زاد 🏆\nرمز الغرفة: ${ST.code}\n${url}`;
  if(a==="wa"){window.open("https://wa.me/?text="+encodeURIComponent(txt),"_blank");return}
  if(a==="share"){try{await navigator.share({title:"مسابقات العائلة",text:txt})}catch(e){}return}
  try{await navigator.clipboard.writeText(url);tst("نُسخ الرابط")}catch(e){prompt("انسخ الرابط:",url)}return}
 if(a==="start"||a==="next"||a==="again"){el.disabled=true;try{const s=await api(a==="again"?"lobby":a,{code:room,cfg:ST.cfg});setState(s)}catch(e){tst(errMsg(e))}el.disabled=false;return}
 if(a==="help"){el.disabled=true;try{const r=await api("help",{code:room});if(r.qi===ST.qi){hide=r.hide;ST.myhelp=1;draw(true)}}catch(e){tst(e.code==="used"?"استخدمت المساعدة في هذه المباراة":errMsg(e))}return}}
function bindRoom(){const b=box();b.querySelectorAll("[data-a]").forEach(el=>el.onclick=()=>act(el.dataset.a,el));
 b.querySelectorAll(".zq-opt[data-ch]").forEach(el=>el.onclick=async()=>{if(!ST||ST.my||el.disabled)return;const ch=+el.dataset.ch;b.querySelectorAll(".zq-opt").forEach(x=>x.disabled=true);el.classList.add("pick");buzz(15);
  try{const s=await api("answer",{code:room,qi:ST.qi,ch});setState(s)}catch(e){tst(errMsg(e));tick()}});
 b.querySelectorAll(".zq-chip[data-g]").forEach(el=>el.onclick=async()=>{if(!isHost(ST))return;const c=Object.assign({},ST.cfg);const g=el.dataset.g,v=el.dataset.v;
  if(g==="cat"){let cs=(c.cats||[]).slice();if(v==="all")cs=["i","c","h"];else{if(cs.length===3)cs=[v];else if(cs.includes(v))cs=cs.filter(x=>x!==v);else cs.push(v);if(!cs.length)cs=["i","c","h"]}c.cats=cs}else c[g]=+v;
  ST.cfg=c;draw(true);cfgPend++;cfgQ=cfgQ.then(()=>api("cfg",{code:room,cfg:c})).then(s=>{cfgPend--;if(!cfgPend)setState(s)},e=>{cfgPend--;tst(errMsg(e))})})}
/* ── الصفحة ── */
V.fquiz=async function(arg){const v=view();if(!v)return;stop();lastSig="";v.innerHTML=`<div class="zq" id="zqv"></div>`;
 const c=String(arg||"").replace(/\D/g,"").slice(0,5);
 if(c&&c!==room){/* رابط دعوة */pendingCode=c;if(room){try{await api("leave",{code:room})}catch(e){}leaveLocal()}}
 if(room){try{const s=await api("join",Object.assign({code:room},me()));setState(s);startPoll();return}catch(e){leaveLocal()}}
 ST=null;draw(true);const ci=document.getElementById("zqcode");if(pendingCode&&ci&&me().name){/* انضمام مباشر بالرابط إذا كان الاسم محفوظًا */}};
window.addEventListener("hashchange",()=>{if(!/^#fquiz/.test(location.hash))stop()});
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&room&&box()&&!poll)startPoll()});
/* ── بطاقة الرئيسية (بعد مقاطع زاد ودروس زاد) ── */
function homeCard(){const v=view();if(!v)return;const hm=v.querySelector(".zhome");if(!hm)return;if(document.getElementById("zqhome"))return;
 const a=document.createElement("a");a.id="zqhome";a.className="zq-home";a.href="#fquiz";
 a.innerHTML=`<span class="zq-hi">${trophy()}</span><span class="zq-ht"><b>مسابقات العائلة</b><small>تنافسوا كلٌّ من جواله في أسئلة إسلامية وثقافية وتاريخية</small></span><span class="zq-hgo">العب</span>`;
 const ref=document.getElementById("zb6home");const col=hm.querySelector(".zcolA")||hm;if(ref&&ref.parentNode)ref.after(a);else col.appendChild(a);try{window.ZSEC&&ZSEC.arrange&&ZSEC.arrange()}catch(e){}}
X.homeCard=homeCard;
if(V.home){const _h=V.home;V.home=async function(){const r=await _h.apply(this,arguments);try{homeCard();setTimeout(homeCard,300);setTimeout(homeCard,1200)}catch(e){}return r}}
try{new MutationObserver(()=>{if(!document.getElementById("zqhome")&&document.querySelector("#view .zhome"))homeCard()}).observe(document.getElementById("view"),{childList:true,subtree:false})}catch(e){}
setTimeout(homeCard,400);
/* ── التنسيق ── */
const css=`
.zq{padding:4px 2px 30px;max-width:640px;margin:0 auto}
.zq-hero{text-align:center;padding:22px 16px 18px;margin:4px 0 12px;border-radius:24px;background:radial-gradient(120% 90% at 50% 0%,#34457a 0%,#1d2545 70%);color:#fff;box-shadow:0 10px 28px rgba(29,37,69,.28);position:relative;overflow:hidden}
.zq-hero:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(243,210,122,.05) 0 2px,transparent 2px 14px);pointer-events:none}
.zq-hero h1{margin:6px 0 6px;font-size:26px;color:#f3d27a}.zq-hero p{margin:0;opacity:.9;line-height:1.8;font-size:14.5px}
.zq-trophy svg{width:78px;height:78px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.3))}.zq-trophy.sm svg{width:64px;height:64px}
.zq-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:14px;margin:10px 0;box-shadow:var(--shadow)}
.zq-lb{font-weight:700;font-size:14px;margin-bottom:8px;color:var(--ink)}.zq-sl{font-size:12.5px;color:var(--muted);margin:10px 0 6px}
.zq-in{width:100%;box-sizing:border-box;font:inherit;font-size:17px;padding:13px 14px;border-radius:14px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);outline:none}.zq-in:focus{border-color:#d6a640}
.zq-cin{text-align:center;letter-spacing:6px;font-size:22px;font-weight:700;flex:1;min-width:0}
.zq-emos{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.zq-emo{font-size:22px;width:44px;height:44px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);cursor:pointer}.zq-emo.on{border-color:#d6a640;background:rgba(214,166,64,.16);transform:scale(1.06)}
.zq-row{display:flex;gap:8px;align-items:center}
.zq-btn{font:inherit;font-weight:700;font-size:15.5px;border:0;border-radius:14px;padding:13px 16px;min-height:48px;cursor:pointer;background:var(--accent);color:#fff;-webkit-tap-highlight-color:transparent;transition:transform .12s,opacity .2s}.zq-btn:active{transform:scale(.97)}.zq-btn:disabled{opacity:.45}
.zq-big{display:block;width:100%;font-size:18px;min-height:58px;margin:12px 0;background:linear-gradient(180deg,#2b3766,#1d2545);color:#f3d27a;box-shadow:0 8px 20px rgba(29,37,69,.3)}
.zq-gold{background:linear-gradient(180deg,#e2b85a,#c08a2b);color:#1d2545}.zq-ghost{background:transparent;color:var(--ink);border:1.5px solid var(--line)}.zq-wa{background:#1f9d55}.zq-sm{min-height:42px;padding:9px 12px;font-size:13.5px}.zq-wide{display:block;width:100%}
.zq-how{font-size:13.5px;color:var(--muted);line-height:1.9;padding:4px 8px}.zq-how ol{margin:4px 0 0;padding-inline-start:20px}.zq-how b{color:var(--ink)}
.zq-stats{display:flex;gap:8px;margin-bottom:8px}.zq-stats div{flex:1;text-align:center;background:var(--bg);border-radius:14px;padding:8px}.zq-stats b{display:block;font-size:20px;color:#c08a2b}.zq-stats span{font-size:12px;color:var(--muted)}
.zq-hrow{display:flex;justify-content:space-between;gap:6px;font-size:13.5px;padding:7px 2px;border-top:1px solid var(--line)}.zq-hrow small{color:var(--muted)}
.zq-top{display:flex;align-items:center;justify-content:space-between;margin:2px 0 8px}.zq-ib{width:42px;height:42px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:18px;display:grid;place-items:center;cursor:pointer}.zq-ib svg{width:20px;height:20px}
.zq-code{font-size:14px;color:var(--muted)}.zq-code b{color:var(--ink);letter-spacing:2px;font-size:16px}
.zq-net{text-align:center;font-size:12.5px;background:#c0693f;color:#fff;border-radius:10px;padding:4px;margin-bottom:6px}
.zq-codebox{text-align:center;background:linear-gradient(160deg,#1d2545,#34457a);color:#fff;border:0}.zq-codebox .zq-lb{color:#f3d27a}
.zq-bigcode{font-size:46px;font-weight:800;letter-spacing:10px;color:#fff;margin:2px 0 12px}.zq-share{justify-content:center;flex-wrap:wrap}.zq-codebox .zq-ghost{color:#fff;border-color:rgba(255,255,255,.35)}
.zq-pl{display:flex;flex-direction:column;gap:6px}.zq-p{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:14px;background:var(--bg);font-size:15px}.zq-p.me{outline:1.5px solid #d6a640}.zq-p.off{opacity:.5}
.zq-av{font-size:22px;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--card);border:1px solid var(--line);flex:none}.zq-nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.zq-nm i{font-style:normal;font-size:11.5px;color:var(--muted)}.zq-nm .zq-crown{color:#c08a2b}
.zq-rk{width:22px;text-align:center;font-weight:800;color:#c08a2b}.zq-sc{font-weight:800;font-size:16px}.zq-sc em{font-style:normal;font-size:12px;color:#2e8b57;margin-inline-end:8px;background:rgba(46,139,87,.12);padding:2px 7px;border-radius:8px;display:inline-block}.zq-st{font-weight:800;color:#2e8b57}
.zq-chips{display:flex;flex-wrap:wrap;gap:7px}.zq-chip{font:inherit;font-size:14px;padding:9px 14px;min-height:42px;border-radius:999px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer}.zq-chip.on{background:#1d2545;color:#f3d27a;border-color:#1d2545}.zq-chip:disabled{cursor:default}.zq-chip:disabled:not(.on){opacity:.6}
.zq-mut{color:var(--muted);font-size:13px;text-align:center;margin:8px 0 0}
.zq-wait{text-align:center;color:var(--muted);padding:16px;font-size:14.5px}.zq-dots i{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#d6a640;animation:zqd 1s infinite}.zq-dots i:nth-child(2){animation-delay:.15s}.zq-dots i:nth-child(3){animation-delay:.3s}@keyframes zqd{50%{transform:translateY(-5px);opacity:.4}}
.zq-pre{text-align:center;padding:60px 0}.zq-cd{font-size:96px;font-weight:800;color:#c08a2b;line-height:1.2;animation:zqp 1s infinite}@keyframes zqp{0%{transform:scale(1.25);opacity:.4}30%{transform:scale(1);opacity:1}}
.zq-qh{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.zq-qn{font-weight:800;font-size:14px;margin-inline-end:auto}.zq-tag{font-size:12px;padding:3px 10px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--muted)}.zq-tag.t-i{color:#2e8b57}.zq-tag.t-c{color:#34457a}.zq-tag.t-h{color:#a5672b}
[data-theme=dark] .zq-tag.t-c{color:#9fb0ee}
.zq-bar{height:5px;background:var(--line);border-radius:5px;margin:8px 0 10px;overflow:hidden}.zq-bar i{display:block;height:100%;background:linear-gradient(90deg,#c08a2b,#f3d27a)}
.zq-qcard{position:relative;background:linear-gradient(160deg,#1d2545,#2b3766);color:#fff;border-radius:22px;padding:22px 16px 20px;min-height:110px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 10px 26px rgba(29,37,69,.25)}.zq-qcard.sm{min-height:0;padding:14px}
.zq-qt{font-size:21px;font-weight:700;line-height:1.75;text-align:center}.zq-qcard.sm .zq-qt{font-size:16.5px}
.zq-ring{position:relative;width:54px;height:54px}.zq-ring svg{width:54px;height:54px;transform:rotate(-90deg)}.zq-ring circle{fill:none;stroke-width:4}.zq-ring .bg{stroke:rgba(255,255,255,.15)}.zq-ring .fg{stroke:#f3d27a;stroke-linecap:round;stroke-dasharray:100 100;transition:stroke .3s}.zq-ring .fg.warn{stroke:#ff7a59}.zq-ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:17px}
.zq-opts{display:grid;gap:9px;margin:12px 0}.zq-opt{display:flex;align-items:center;gap:12px;width:100%;text-align:start;font:inherit;font-size:17px;font-weight:600;padding:14px;min-height:60px;border-radius:16px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;box-sizing:border-box;transition:transform .12s,background .2s}.zq-opt:active{transform:scale(.98)}
.zq-l{flex:none;width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--bg);font-weight:800;color:#c08a2b}
.zq-opt.pick{border-color:#d6a640;background:rgba(214,166,64,.14)}.zq-opt.gone{opacity:.18;text-decoration:line-through}.zq-opt:disabled{cursor:default}
.zq-opt.right{background:#2e8b57;border-color:#2e8b57;color:#fff;animation:zqok .5s}.zq-opt.right .zq-l{background:rgba(255,255,255,.2);color:#fff}.zq-opt.wrong{background:rgba(192,57,43,.12);border-color:#c0392b;color:#c0392b}.zq-opt.dim{opacity:.5}@keyframes zqok{40%{transform:scale(1.03)}}
.zq-qf{justify-content:space-between;margin-bottom:10px}.zq-help{background:transparent;color:#c08a2b;border:1.5px dashed #d6a640;flex:1}.zq-sent{flex:1;font-size:14px;color:#2e8b57;font-weight:700}
.zq-res{text-align:center;font-size:19px;font-weight:800;padding:12px;border-radius:16px;margin:4px 0 10px}.zq-res.good{background:rgba(46,139,87,.13);color:#2e8b57}.zq-res.bad{background:rgba(192,57,43,.1);color:#c0392b}.zq-res.none{background:var(--bg);color:var(--muted)}
.zq-fact{background:rgba(214,166,64,.12);border:1px solid rgba(214,166,64,.35);border-radius:16px;padding:12px 14px;font-size:14.5px;line-height:1.85}
.zq-win{text-align:center;margin-top:6px}.zq-win h2{margin:6px 0 4px;font-size:23px;color:#c08a2b}.zq-win p{margin:0;color:var(--muted)}
.zq-conf{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:50}
.zq-podium{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:end;gap:8px;margin:16px 0 4px}.zq-pod{text-align:center}.zq-pod .zq-av{margin:0 auto 4px;width:48px;height:48px;font-size:28px}.zq-pn{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.zq-ps{font-size:13px;color:var(--muted)}
.zq-step{margin-top:6px;border-radius:14px 14px 4px 4px;color:#1d2545;font-weight:800;font-size:22px;display:grid;place-items:center}.p1 .zq-step{height:96px;background:linear-gradient(180deg,#f3d27a,#c08a2b)}.p2 .zq-step{height:70px;background:linear-gradient(180deg,#e9edf5,#b9c1d3)}.p3 .zq-step{height:52px;background:linear-gradient(180deg,#e7b08a,#b8784b)}
.zq-home{display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff;margin:12px 0;padding:14px;border-radius:20px;background:linear-gradient(135deg,#1d2545 0%,#34457a 100%);box-shadow:0 8px 22px rgba(29,37,69,.22);position:relative;overflow:hidden}
.zq-home:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(243,210,122,.06) 0 2px,transparent 2px 14px);pointer-events:none}
.zq-hi svg{width:46px;height:46px;display:block}.zq-ht{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.zq-ht b{font-size:16.5px;color:#f3d27a}.zq-ht small{font-size:12.5px;opacity:.85;line-height:1.5}
.zq-hgo{flex:none;font-weight:800;font-size:14px;padding:9px 14px;border-radius:12px;background:linear-gradient(180deg,#e2b85a,#c08a2b);color:#1d2545}
.zq-home.zh-off{display:none!important}
`;
const st=document.createElement("style");st.id="zqcss";st.textContent=css;document.head.appendChild(st);
if(/^#fquiz/.test(location.hash)){try{route()}catch(e){}}
}();
