/* =================================== ديوانية زاد =================================== */
const RULES='الديوانية للخير: لا فتاوى ولا أحاديث بدون مصدر، ولا إساءة. انسب كل حديث لمصدره';
let ME=null,MEP=null,UNREAD=0;
const loadMe=force=>{if(ME&&!force)return Promise.resolve(ME);if(MEP)return MEP;MEP=api('dw/me').then(r=>{if(r&&r.ok){ME=r.me;UNREAD=r.unread||0;if(ME&&!Z.dw.has){Z.dw.has=1;sv()}badge()}MEP=null;return ME}).catch(()=>{MEP=null;return ME});return MEP};
function badge(){try{$$('[data-b6unread]').forEach(e=>{e.textContent=UNREAD?ar(Math.min(UNREAD,99)):'';e.hidden=!UNREAD});ZS.dwUnread&&ZS.dwUnread(UNREAD)}catch(e){}}
const linkify=t=>esc(t).replace(/#([\p{L}\p{N}_]{2,30})/gu,(m,g)=>`<a href="#diwan/tag/${encodeURIComponent(g)}" data-stop>#${g}</a>`);
const imgUrl=id=>'/api/social/dw/img/'+id;
const POSTS={};
function quoteHTML(q){if(!q)return'';if(q.gone)return`<div class="b6q b6empty" style="padding:8px">التغريدة المقتبسة غير متاحة</div>`;POSTS[q.id]=POSTS[q.id]||q;
 return`<div class="b6q" data-open="${q.id}"><div class="b6h">${av(q.u,22)}<a href="#diwan/u/${q.u.id}" data-stop>${esc(q.u.name)}</a><small>· ${ago(q.at)}</small></div>${q.text?`<div class="b6t">${linkify(q.text)}</div>`:''}${q.img?`<div class="b6im"><img loading="lazy" alt="صورة مرفقة" src="${imgUrl(q.img)}"></div>`:''}</div>`}
function postHTML(p,o={}){if(!p)return'';POSTS[p.id]=p;
 if(p.gone)return`<div class="b6post"><div class="b6b b6empty" style="padding:6px">هذه التغريدة غير متاحة</div></div>`;
 return`<article class="b6post${o.thr?' thr':''}" data-open="${p.id}" data-o="${o.thr?'t':''}${o.inThread?'i':''}${o.pin?'p':''}">
 ${av(p.u)}<div class="b6b">
 ${o.pin?`<div class="b6pin">${ic('pin')} مثبّتة من الإدارة</div>`:''}${p.rp?`<div class="b6meta">${ic('rt')} <a href="#diwan/u/${p.rp.id}" data-stop>أعاد نشرها ${esc(p.rp.name)}</a></div>`:''}
 <div class="b6h"><a href="#diwan/u/${p.u.id}" data-stop>${esc(p.u.name)}</a><small>· ${ago(p.at)}</small><button class="b6m" data-menu="${p.id}" aria-label="خيارات">${ic('more')}</button></div>
 ${p.reply_to&&!o.inThread?`<div class="b6meta">ردًا على ${p.reply_to.name?esc(p.reply_to.name):'تغريدة'}</div>`:''}
 ${p.hidden?`<span class="b6hid">مخفية عن الآخرين (بلاغات أو مراجعة)</span>`:''}
 ${p.text?`<div class="b6t">${linkify(p.text)}</div>`:''}${p.img?`<div class="b6im" data-img="${p.img}"><img loading="lazy" alt="صورة مرفقة" src="${imgUrl(p.img)}"></div>`:''}${quoteHTML(p.quote)}
 <div class="b6act"><button data-reply="${p.id}" aria-label="رد">${ic('reply')}<span>${num(p.replies)}</span></button><button class="rt${p.reposted?' on':''}" data-rt="${p.id}" aria-label="إعادة نشر">${ic('rt')}<span>${num(p.reposts)}</span></button><button class="lk${p.liked?' on':''}" data-like="${p.id}" aria-label="إعجاب">${ic('heart',p.liked?'on':'')}<span>${num(p.likes)}</span></button><button data-share="${p.id}" aria-label="مشاركة">${ic('share')}</button></div>
 </div></article>`}
function refreshPost(id){const p=POSTS[id];if(!p)return;$$(`article[data-open="${id}"]`).forEach(a=>{const f=a.dataset.o||'';const t=document.createElement('div');t.innerHTML=postHTML(p,{thr:f.includes('t'),inThread:f.includes('i'),pin:f.includes('p')});a.replaceWith(t.firstElementChild)})}
async function needProfile(){await loadMe();if(ME)return true;return new Promise(ok=>profileSheet(r=>ok(!!r)))}
function profileSheet(done){const nm=(ME&&ME.name)||(S.profile&&S.profile.name)||'';
 const el=sheet(`<h3 style="margin:2px 0 6px">${ME?'تعديل ملفك':'أهلًا بك في ديوانية زاد'}</h3>${ME?'':'<p class="b7note" style="margin:0 0 10px">اختر الاسم الذي يظهر للناس. لا تحتاج رقم جوال ولا بريد — حسابك مرتبط بهذا الجهاز.</p>'}
 <label class="b7note" for="b6nm" style="display:block;margin:0 0 4px">الاسم</label><input type="text" id="b6nm" maxlength="30" value="${esc(nm)}" placeholder="مثال: أبو عبدالله">
 <label class="b7note" for="b6bio" style="display:block;margin:10px 0 4px">نبذة قصيرة (اختياري)</label><input type="text" id="b6bio" maxlength="120" value="${esc((ME&&ME.bio)||'')}" placeholder="سطر عنك">
 <div class="b6rules" style="margin-top:12px">${ic('shield')}<span><b>قبل أن تبدأ:</b> ${RULES}.</span></div>
 <button class="b6btn blk" id="b6ps">${ME?'حفظ':'ابدأ'}</button>${ME?`<button class="b6btn gh blk" id="b6del" style="color:#c0393f;border-color:#e3b9b9">احذف حسابي في الديوانية</button>`:''}`,()=>{const d=done;done=null;d&&d(null)});
 $('#b6ps',el).onclick=async()=>{const b=$('#b6ps',el);b.disabled=true;const r=await api('dw/profile',{name:$('#b6nm',el).value,bio:$('#b6bio',el).value});b.disabled=false;if(!r.ok)return tst(err(r));ME=r.me;Z.dw.has=1;sv();if(S.profile&&!S.profile.name){S.profile.name=ME.name;sv()}const d=done;done=null;el.close();tst('تم ✓');d&&d(ME);if(!d||location.hash.startsWith('#diwan/u/'))rerender()};
 const del=$('#b6del',el);if(del)del.onclick=async()=>{if(!confirm('حذف حسابك في الديوانية؟ تُحذف تغريداتك وردودك وإعجاباتك ومتابعاتك نهائيًا.'))return;const r=await api('dw/deleteme',{});if(!r.ok)return tst(err(r));ME=null;done=null;el.close();tst('حُذف حسابك');location.hash='diwan'}}
const devId=()=>{try{return localStorage.getItem('zad.dev')||''}catch(e){return''}};
async function shrink(f){const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=URL.createObjectURL(f)});const s=Math.min(1,1280/Math.max(im.naturalWidth,im.naturalHeight));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);let q=.85,b;do{b=await new Promise(ok=>c.toBlob(ok,'image/jpeg',q));q-=.12}while(b&&b.size>1200*1024&&q>.3);if(!b)throw new Error('img');return b}
async function upImg(blob){const r=await fetch('/api/social/dw/img',{method:'POST',headers:{'Content-Type':'image/jpeg','X-Zad-Dev':devId()},body:blob}).then(async r=>{const j=await r.json().catch(()=>({ok:false}));j._s=r.status;return j}).catch(()=>({ok:false}));return r}
/* compose: a new post, a reply (to) or a quote (qt); tag pre-fills #tag */
function compose(o={}){needProfile().then(okp=>{if(!okp)return;let blob=null;
 const ctx=o.to?POSTS[o.to]:o.qt?POSTS[o.qt]:null,lbl=o.to?'رد':'نشر';
 const el=sheet(`<div class="b6row" style="margin-bottom:6px"><button class="b6ib" id="b6cx" aria-label="إغلاق">${ic('x')}</button><span class="b6grow"></span><button class="b6btn" id="b6go" disabled>${lbl}</button></div>
 ${ctx&&o.to?`<div class="b6meta" style="margin:0 2px 8px">ردًا على&nbsp;<b style="color:var(--ink)">${esc(ctx.u.name)}</b></div>`:''}
 <div class="b6row" style="align-items:flex-start">${av(ME)}<textarea id="b6tx" maxlength="400" placeholder="${o.to?'اكتب ردّك…':o.qt?'أضف تعليقك…':'ما الذي في خاطرك من الخير؟'}" aria-label="نص التغريدة"></textarea></div>
 <div id="b6pv"></div>${ctx&&o.qt?quoteHTML(ctx).replace(/data-open="[^"]*"/,''):''}
 <div class="b6row" style="border-top:1px solid var(--line);padding-top:8px;margin-top:8px"><label class="b6ib" style="color:#34457a;cursor:pointer" aria-label="أضف صورة">${ic('img')}<input type="file" accept="image/*" id="b6f" hidden></label><span class="b6grow b7note" style="margin:0">${o.to?'':'#وسم يجمع المواضيع'}</span><span class="b6cnt" id="b6cn"></span><svg class="b6ring" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11" fill="none" stroke="var(--line)" stroke-width="3"/><circle id="b6rc" cx="14" cy="14" r="11" fill="none" stroke="#34457a" stroke-width="3" stroke-dasharray="69.1" stroke-dashoffset="69.1" transform="rotate(-90 14 14)" stroke-linecap="round"/></svg></div>
 <p class="b7note" style="margin:8px 0 0">${RULES}.</p>`);
 const tx=$('#b6tx',el),go=$('#b6go',el);
 const upd=()=>{const n=[...tx.value.trim()].length,l=280-n,rc=$('#b6rc',el);rc.setAttribute('stroke-dashoffset',String(69.1*(1-Math.min(1,n/280))));rc.setAttribute('stroke',l<0?'#c0393f':l<20?'#c0693f':'#34457a');const c=$('#b6cn',el);c.textContent=l<=20?ar(l):'';c.classList.toggle('over',l<0);go.disabled=(!n&&!blob)||l<0};
 tx.oninput=upd;if(o.tag){tx.value=' #'+o.tag;upd()}setTimeout(()=>{tx.focus();try{tx.setSelectionRange(0,0)}catch(e){}},120);$('#b6cx',el).onclick=()=>el.close();
 $('#b6f',el).onchange=async e=>{const f=e.target.files&&e.target.files[0];if(!f)return;try{blob=await shrink(f);$('#b6pv',el).innerHTML=`<div class="b6im" style="position:relative"><img src="${URL.createObjectURL(blob)}" alt="معاينة"><button class="b6ib" id="b6rm" style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,.55);color:#fff" aria-label="إزالة الصورة">${ic('x')}</button></div>`;$('#b6rm',el).onclick=()=>{blob=null;$('#b6pv',el).innerHTML='';upd()}}catch(x){tst('تعذّر قراءة الصورة')}upd()};
 const fail=m=>{tst(m);go.disabled=false;go.textContent=lbl};
 go.onclick=async()=>{go.disabled=true;go.textContent='…';try{let img;
  if(blob){const r=await upImg(blob);if(!r.ok)return fail(err(r,'تعذّر رفع الصورة'));img=r.id}
  const r=await api('dw/post',{text:tx.value,img,reply_to:o.to||undefined,quote_of:o.qt||undefined});
  if(!r.ok)return fail(err(r));
  el.close();vb(15);tst(o.to?'تم الرد ✓':'نُشرت ✓');
  if(o.to&&POSTS[o.to]){POSTS[o.to].replies++;refreshPost(o.to)}if(o.qt&&POSTS[o.qt]){POSTS[o.qt].reposts++;refreshPost(o.qt)}
  const fl=$('#b6list');if(fl&&!o.to&&/^#diwan\/?$/.test(location.hash)){const e0=fl.querySelector('.b6empty');e0&&e0.remove();fl.insertAdjacentHTML('afterbegin',postHTML(r.post))}
  const rl=$('#b6replies');if(rl&&o.to&&location.hash==='#diwan/p/'+o.to){const e0=rl.querySelector('.b6empty');e0&&e0.remove();rl.insertAdjacentHTML('afterbegin',postHTML(r.post,{inThread:1}))}
 }catch(x){fail('تعذّر النشر')}}})}
/* one delegated click handler for every Diwaniya screen */
let BOUND=false;
function bindView(){if(BOUND)return;BOUND=true;view.addEventListener('click',onClick)}
async function onClick(e){if(!location.hash.startsWith('#diwan'))return;const t=e.target;
 const a=t.closest('[data-like],[data-rt],[data-reply],[data-share],[data-menu],[data-img],[data-stop],[data-open],[data-fol],[data-ftab]');if(!a)return;
 if(a.hasAttribute('data-stop'))return;
 if(a.dataset.img){e.stopPropagation();const v=document.createElement('div');v.className='b6view';v.innerHTML=`<img src="${imgUrl(a.dataset.img)}" alt="صورة">`;v.onclick=()=>v.remove();document.body.appendChild(v);return}
 if(a.dataset.like){e.stopPropagation();if(!(await needProfile()))return;const id=a.dataset.like,p=POSTS[id];const flip=()=>{if(p){p.liked=p.liked?0:1;p.likes=Math.max(0,p.likes+(p.liked?1:-1));refreshPost(id)}};flip();vb(8);const r=await api('dw/like',{id});if(!r.ok){tst(err(r));flip()}else if(p){p.liked=r.liked?1:0;p.likes=r.likes;refreshPost(id)}return}
 if(a.dataset.rt){e.stopPropagation();const id=a.dataset.rt,p=POSTS[id];const el=sheet(`<div class="b6menu"><button id="b6r1">${ic('rt')} ${p&&p.reposted?'تراجع عن إعادة النشر':'إعادة نشر'}</button><button id="b6r2">${ic('quote')} اقتباس مع تعليق</button></div>`);
  $('#b6r1',el).onclick=async()=>{el.close();if(!(await needProfile()))return;const r=await api('dw/repost',{id});if(!r.ok)return tst(err(r));if(p){p.reposted=r.reposted?1:0;p.reposts=r.reposts;refreshPost(id)}vb(10);tst(r.reposted?'أُعيد نشرها ✓':'تم التراجع')};
  $('#b6r2',el).onclick=()=>{el.close();compose({qt:id})};return}
 if(a.dataset.reply){e.stopPropagation();compose({to:a.dataset.reply});return}
 if(a.dataset.share){e.stopPropagation();const p=POSTS[a.dataset.share];const url=(window.ZAD_URL||location.origin+location.pathname.replace(/index\.html$/,''))+'#diwan/p/'+a.dataset.share;const txt=p&&p.text?p.text.slice(0,120):'تغريدة في ديوانية زاد';try{if(navigator.share){await navigator.share({title:'ديوانية زاد',text:txt,url});return}}catch(x){if(x&&x.name==='AbortError')return}try{await navigator.clipboard.writeText(url);tst('تم نسخ الرابط')}catch(x){}return}
 if(a.dataset.menu){e.stopPropagation();postMenu(a.dataset.menu);return}
 if(a.dataset.fol){e.stopPropagation();follow(a.dataset.fol,a);return}
 if(a.dataset.ftab){Z.dw.f=a.dataset.ftab;sv();feed();return}
 if(a.dataset.open){if(t.closest('a'))return;const id=a.dataset.open;if(location.hash!=='#diwan/p/'+id)location.hash='diwan/p/'+id}}
function postMenu(id){const p=POSTS[id];if(!p)return;
 const el=sheet(`<div class="b6menu">${p.mine?`<button id="b6md" class="dg">${ic('trash')} حذف التغريدة</button>`:`<button id="b6mr" class="dg">${ic('flag')} إبلاغ عن التغريدة</button><button id="b6mb">${ic('block')} حظر ${esc(p.u.name)}</button><button id="b6mf">${ic('user')} ملف ${esc(p.u.name)}</button>`}<button id="b6mc">${ic('copy')} نسخ النص</button></div>`);
 const on=(s,f)=>{const b=$(s,el);if(b)b.onclick=()=>{el.close();f()}};
 on('#b6md',async()=>{if(!confirm('حذف التغريدة نهائيًا؟'))return;const r=await api('dw/delete',{id});if(!r.ok)return tst(err(r));$$(`article[data-open="${id}"]`).forEach(x=>x.remove());tst('حُذفت');if(location.hash==='#diwan/p/'+id)location.hash='diwan'});
 on('#b6mr',()=>reportSheet(id));on('#b6mb',()=>block(p.u.id,p.u.name));on('#b6mf',()=>{location.hash='diwan/u/'+p.u.id});
 on('#b6mc',async()=>{try{await navigator.clipboard.writeText(p.text||'');tst('تم النسخ')}catch(x){}})}
function reportSheet(id){const R=['إساءة أو ألفاظ','فتوى أو حديث بلا مصدر','محتوى غير لائق','إزعاج أو إعلان','أخرى'];
 const el=sheet(`<h3 style="margin:2px 0 8px">إبلاغ</h3><div class="b6menu">${R.map((x,i)=>`<button data-r="${i}">${esc(x)}</button>`).join('')}</div><p class="b7note">تُخفى التغريدة تلقائيًا بعد ٣ بلاغات من أشخاص مختلفين حتى يراجعها المشرف.</p>`);
 $$('[data-r]',el).forEach(b=>b.onclick=async()=>{el.close();const r=await api('dw/report',{id,reason:R[+b.dataset.r]});if(!r.ok)return tst(err(r));tst('شكرًا، وصل البلاغ');if(r.hidden)$$(`article[data-open="${id}"]`).forEach(x=>x.remove())})}
async function block(uid,name){if(!(await needProfile()))return;const r0=await api('dw/user?u='+uid);const isB=r0.ok&&r0.user&&r0.user.blocked;if(!confirm(isB?'إلغاء حظر '+name+'؟':'حظر '+name+'؟ لن ترى تغريداته ولن يستطيع الرد عليك أو متابعتك.'))return;const r=await api('dw/block',{u:uid});if(!r.ok)return tst(err(r));tst(r.blocked?'تم الحظر':'أُلغي الحظر');if(r.blocked)$$('article.b6post').forEach(a=>{const p=POSTS[a.dataset.open];if(p&&(p.u.id===uid||(p.rp&&p.rp.id===uid)))a.remove()});if(location.hash.startsWith('#diwan/u/'))rerender()}
async function follow(uid,btn){if(!(await needProfile()))return;btn&&(btn.disabled=true);const r=await api('dw/follow',{u:uid});btn&&(btn.disabled=false);if(!r.ok)return tst(err(r));vb(10);if(location.hash.startsWith('#diwan/u/'))rerender();else if(btn){btn.textContent=r.following?'تتابعه':'تابِع';btn.classList.toggle('gh',r.following)}}
/* pull to refresh + infinite scroll */
let PTR=null;
function ptr(onRefresh){if(PTR)PTR();let y0=null,dy=0;const st=e=>{if(window.scrollY>2||$('.b6sh'))return;y0=e.touches[0].clientY;dy=0},mv=e=>{if(y0==null)return;dy=e.touches[0].clientY-y0;const box=$('#b6ptr');if(box){box.classList.toggle('on',dy>24);box.textContent=dy>80?'أفلت للتحديث':'اسحب للتحديث'}},en=()=>{if(y0==null)return;const d=dy,box=$('#b6ptr');y0=null;if(d>80){box&&(box.textContent='جارٍ التحديث…');onRefresh().finally(()=>{const b=$('#b6ptr');b&&b.classList.remove('on')})}else box&&box.classList.remove('on')};
 window.addEventListener('touchstart',st,{passive:true});window.addEventListener('touchmove',mv,{passive:true});window.addEventListener('touchend',en);
 PTR=()=>{window.removeEventListener('touchstart',st);window.removeEventListener('touchmove',mv);window.removeEventListener('touchend',en);PTR=null}}
let IO=null;
function more(next,load){if(IO){IO.disconnect();IO=null}const m=$('#b6more');if(!m)return;if(next==null){m.textContent=$('#b6list')&&$('#b6list').querySelector('.b6post')?'وصلت للنهاية ✓':'';return}m.textContent='جارٍ التحميل…';IO=new IntersectionObserver(async es=>{if(!es.some(x=>x.isIntersecting))return;IO.disconnect();IO=null;await load(next)},{rootMargin:'400px'});IO.observe(m)}
window.addEventListener('hashchange',()=>{if(!location.hash.startsWith('#diwan')){if(PTR)PTR();if(IO){IO.disconnect();IO=null}}});
const meBtn=()=>ME?`<a class="b6ib" href="#diwan/u/${ME.id}" aria-label="ملفي">${av(ME,32)}</a>`:`<button class="b6ib" onclick="ZB6.profile()" aria-label="ملفي">${ic('user')}</button>`;
const top=title=>`<div class="b6top"><div class="b6bar"><h1>${title}</h1><a class="b6ib" href="#diwan/s" aria-label="بحث">${ic('search')}</a><a class="b6ib" href="#diwan/n" aria-label="التنبيهات">${ic('bell')}<span class="b6dot" data-b6unread hidden></span></a>${meBtn()}</div>`;
const backBar=(t,h)=>`<div class="b6top"><div class="b6bar"><a class="b6ib" href="#${h||'diwan'}" aria-label="رجوع">${ic('back')}</a><h1 style="font-size:18px">${t}</h1></div></div>`;
let RENDER=null;const rerender=()=>RENDER&&RENDER();
async function feed(){addCss();bindView();await loadMe();RENDER=feed;const f=Z.dw.f==='fol'?'fol':'for';
 view.innerHTML=`<div class="b6">${top('ديوانية زاد '+NEW)}<div class="b6tabs" role="tablist"><button role="tab" data-ftab="for" class="${f==='for'?'on':''}">لك</button><button role="tab" data-ftab="fol" class="${f==='fol'?'on':''}">المتابَعون</button></div></div>
 <div id="b6ptr" class="b6ptr"></div><div class="b6rules" id="b6rules">${ic('pin')}<span><b>مثبّت:</b> ${RULES}.</span></div><div id="b6pins"></div><div id="b6list"><div class="b6more">جارٍ التحميل…</div></div><div class="b6more" id="b6more"></div></div>
 <button class="b6fab" id="b6fab" aria-label="تغريدة جديدة">${ic('pen')}</button>`;
 $('#b6fab').onclick=()=>compose();badge();
 const load=async c=>{const r=await api('dw/feed?f='+f+(c?'&c='+c:''));const L=$('#b6list');if(!L||!/^#diwan\/?$/.test(location.hash)||(Z.dw.f==='fol'?'fol':'for')!==f)return;
  if(!r.ok){if(!c)L.innerHTML=`<div class="b6empty">${err(r)}<br><button class="b6btn gh" onclick="ZB6.diwan()" style="margin-top:10px">أعد المحاولة</button></div>`;return}
  if(typeof r.unread==='number'){UNREAD=r.unread;badge()}
  if(!c){$('#b6pins').innerHTML=(r.pinned||[]).map(p=>postHTML(p,{pin:1})).join('');L.innerHTML=''}
  if(r.need==='profile'){L.innerHTML=`<div class="b6empty">اختر اسمك وتابع من يعجبك لتظهر تغريداتهم هنا.<br><button class="b6btn" style="margin-top:10px" onclick="ZB6.profile()">اختر اسمك</button></div>`;return more(null)}
  L.insertAdjacentHTML('beforeend',(r.items||[]).map(p=>postHTML(p)).join(''));
  if(!c&&!(r.items||[]).length)L.innerHTML=`<div class="b6empty">${f==='fol'?'لا توجد تغريدات من الأشخاص الذين تتابعهم بعد.<br>جرّب «لك» وتابع من يعجبك.':'كن أول من يكتب في الديوانية 🌿'}<br><button class="b6btn" style="margin-top:10px" onclick="ZB6.compose()">اكتب تغريدة</button></div>`;
  more(r.next,load)};
 ptr(()=>load(0));await load(0)}
async function thread(id){addCss();bindView();await loadMe();RENDER=()=>thread(id);
 view.innerHTML=`<div class="b6">${backBar('التغريدة')}<div id="b6th"><div class="b6more">جارٍ التحميل…</div></div></div>`;
 const r=await api('dw/post?id='+encodeURIComponent(id));const T=$('#b6th');if(!T)return;
 if(!r.ok){T.innerHTML=`<div class="b6empty">${err(r,'التغريدة غير موجودة')}</div>`;return}
 T.innerHTML=(r.parents||[]).map(p=>postHTML(p,{thr:1,inThread:1})).join('')+`<div style="background:color-mix(in srgb,#34457a 5%,transparent);border-radius:14px">${postHTML(r.post)}</div>`
  +`<div class="b6row" style="padding:10px 2px;border-bottom:1px solid var(--line)">${av(ME||{name:'؟'},34)}<button class="b6grow" id="b6rp1" style="text-align:start;border:0;background:none;color:var(--muted);font:inherit;font-size:15px;cursor:pointer">اكتب ردّك…</button><button class="b6btn" id="b6rp2">رد</button></div>`
  +`<div id="b6replies">${(r.replies||[]).map(p=>postHTML(p,{inThread:1})).join('')||'<div class="b6empty" style="padding:18px">لا ردود بعد</div>'}</div>`;
 $('#b6rp1').onclick=$('#b6rp2').onclick=()=>compose({to:r.post.id})}
async function profile(uid,tab){addCss();bindView();await loadMe();tab=tab==='r'?'r':'p';RENDER=()=>profile(uid,tab);
 view.innerHTML=`<div class="b6">${backBar('الملف')}<div id="b6pf"><div class="b6more">جارٍ التحميل…</div></div><div id="b6list"></div><div class="b6more" id="b6more"></div></div>`;
 const load=async c=>{const r=await api('dw/user?u='+encodeURIComponent(uid)+'&t='+tab+(c?'&c='+c:''));const P=$('#b6pf');if(!P)return;
  if(!r.ok){P.innerHTML=`<div class="b6empty">${err(r,'الحساب غير موجود')}</div>`;return}
  const U=r.user;if(!c){P.innerHTML=`<div class="b6prof"><div class="bn"></div><div class="ph">${av(U,76)}${U.me?`<button class="b6btn gh" onclick="ZB6.profile()">تعديل الملف</button>`:`<div class="b6row"><button class="b6ib" id="b6um" aria-label="خيارات" style="border:1px solid var(--line)">${ic('more')}</button>${U.blocked?`<button class="b6btn dg" id="b6unb">إلغاء الحظر</button>`:`<button class="b6btn${U.following?' gh':''}" data-fol="${U.id}">${U.following?'تتابعه':'تابِع'}</button>`}</div>`}</div>
   <h2>${esc(U.name)}</h2>${U.followsMe&&!U.me?'<span class="b6hid" style="color:var(--muted);background:var(--line)">يتابعك</span>':''}${U.bio?`<div class="bio">${linkify(U.bio)}</div>`:''}
   <div class="ff"><a href="#diwan/f/${U.id}/ing"><b>${ar(U.followingN||0)}</b> يتابع</a><a href="#diwan/f/${U.id}/ers"><b>${ar(U.followers)}</b> متابِع</a><span><b>${ar(U.posts)}</b> تغريدة</span></div></div>
   <div class="b6sub"><button class="${tab==='p'?'on':''}" onclick="location.hash='diwan/u/${U.id}'">التغريدات</button><button class="${tab==='r'?'on':''}" onclick="location.hash='diwan/u/${U.id}/r'">الردود</button><button onclick="location.hash='u/${U.id}'">المقاطع ▸</button></div>`;
   const m=$('#b6um');if(m)m.onclick=()=>{const el=sheet(`<div class="b6menu"><button id="b6x1">${ic('block')} ${U.blocked?'إلغاء حظر':'حظر'} ${esc(U.name)}</button></div>`);$('#b6x1',el).onclick=()=>{el.close();block(U.id,U.name)}};
   const ub=$('#b6unb');if(ub)ub.onclick=()=>block(U.id,U.name);
   if(U.blocked){$('#b6list').innerHTML='<div class="b6empty">حظرت هذا الحساب.</div>';return more(null)}}
  $('#b6list').insertAdjacentHTML('beforeend',(r.items||[]).map(p=>postHTML(p)).join(''));
  if(!c&&!(r.items||[]).length)$('#b6list').innerHTML=`<div class="b6empty">${tab==='r'?'لا ردود بعد':'لا تغريدات بعد'}</div>`;
  more(r.next,load)};
 await load(0)}
async function follows(uid,k){addCss();bindView();RENDER=()=>follows(uid,k);view.innerHTML=`<div class="b6">${backBar(k==='ing'?'يتابع':'المتابِعون','diwan/u/'+uid)}<div id="b6list"><div class="b6more">جارٍ التحميل…</div></div></div>`;
 const r=await api('dw/follows?u='+encodeURIComponent(uid)+'&k='+(k==='ing'?'ing':'ers'));const L=$('#b6list');if(!L)return;L.innerHTML=r.ok?((r.items||[]).map(u=>`<a class="b6u" href="#diwan/u/${u.id}">${av(u)}<span class="b6grow"><b>${esc(u.name)}</b>${u.bio?`<br><small style="color:var(--muted)">${esc(u.bio)}</small>`:''}</span></a>`).join('')||'<div class="b6empty">لا أحد بعد</div>'):`<div class="b6empty">${err(r)}</div>`}
async function tag(t){addCss();bindView();await loadMe();RENDER=()=>tag(t);view.innerHTML=`<div class="b6">${backBar('#'+esc(t))}<div id="b6list"><div class="b6more">جارٍ التحميل…</div></div><div class="b6more" id="b6more"></div></div><button class="b6fab" id="b6fab" aria-label="تغريدة بهذا الوسم">${ic('pen')}</button>`;
 $('#b6fab').onclick=()=>compose({tag:t});
 const load=async c=>{const r=await api('dw/tag?t='+encodeURIComponent(t)+(c?'&c='+c:''));const L=$('#b6list');if(!L)return;if(!r.ok){L.innerHTML=`<div class="b6empty">${err(r)}</div>`;return}if(!c)L.innerHTML='';L.insertAdjacentHTML('beforeend',(r.items||[]).map(p=>postHTML(p)).join(''));if(!c&&!(r.items||[]).length)L.innerHTML='<div class="b6empty">لا تغريدات بهذا الوسم بعد</div>';more(r.next,load)};await load(0)}
async function notifs(){addCss();bindView();await loadMe();RENDER=notifs;view.innerHTML=`<div class="b6">${backBar('التنبيهات')}<div id="b6list"><div class="b6more">جارٍ التحميل…</div></div></div>`;
 const r=await api('dw/notifs');const L=$('#b6list');if(!L)return;UNREAD=0;badge();
 const K={like:['heart','#c0393f','أعجبته تغريدتك'],reply:['reply','#2d5f86','ردّ عليك'],follow:['user','#34457a','بدأ يتابعك'],repost:['rt','#2f7a4f','أعاد نشر تغريدتك'],quote:['quote','#5b4b8a','اقتبس تغريدتك'],
  vlike:['heart','#c0393f','أعجبه مقطعك'],vcmt:['reply','#2d5f86','علّق على مقطعك'],vrpl:['reply','#2d5f86','ردّ على تعليقك'],vcl:['heart','#c0393f','أعجبه تعليقك'],vmen:['user','#a8742a','أشار إليك في مقطع'],vcmen:['user','#a8742a','أشار إليك في تعليق'],vrep:['reply','#c0693f','ردّ على مقطعك بمقطع']}; /* v5.4 «مقاطع زاد» */
 L.innerHTML=r.ok?((r.items||[]).map(n=>{const k=K[n.k]||K.like;const href=n.k==='follow'?'#diwan/u/'+n.u.id:String(n.pid).startsWith('v:')?'#video/'+String(n.pid).split(':')[1]:'#diwan/p/'+n.pid;return`<a class="b6n${n.new?' new':''}" href="${href}"><span class="k" style="color:${k[1]}">${ic(k[0],n.k==='like'?'on':'')}</span><span class="b6grow">${av(n.u,30)}<div style="margin-top:4px"><b>${esc(n.u.name)}</b> ${k[2]} <small style="color:var(--muted)">· ${ago(n.at)}</small></div>${n.t?`<div class="b7note" style="margin:2px 0 0">${esc(n.t)}</div>`:''}</span></a>`}).join('')||'<div class="b6empty">لا تنبيهات بعد.<br>هنا يظهر من أعجبه كلامك أو ردّ عليك أو تابعك.</div>'):`<div class="b6empty">${err(r)}</div>`}
async function search(){addCss();bindView();await loadMe();RENDER=search;view.innerHTML=`<div class="b6">${backBar('بحث في الديوانية')}<div style="margin:12px 0"><input type="search" id="b6q" placeholder="ابحث عن شخص أو كلمة أو #وسم" aria-label="بحث"></div><div id="b6res"></div></div>`;
 const R=$('#b6res');const tr=await api('dw/trends');const showTr=()=>{R.innerHTML=`<div class="b7sec"><h3>الأكثر تداولًا</h3></div>`+((tr.items||[]).map((x,i)=>`<a class="b6trend" href="#diwan/tag/${encodeURIComponent(x.tag)}"><small>${ar(i+1)} · متداول</small><br><b>#${esc(x.tag)}</b><br><small>${ar(x.n)} تغريدة</small></a>`).join('')||'<div class="b6empty">لا وسوم بعد</div>')};showTr();
 let T=0;$('#b6q').oninput=e=>{clearTimeout(T);const q=e.target.value.trim();if(q.length<2)return showTr();T=setTimeout(async()=>{if(q[0]==='#'){location.hash='diwan/tag/'+encodeURIComponent(q.slice(1));return}const r=await api('dw/search?q='+encodeURIComponent(q));if(!r.ok||!$('#b6res'))return;R.innerHTML=((r.users||[]).length?`<div class="b7sec"><h3>أشخاص</h3></div>`+r.users.map(u=>`<a class="b6u" href="#diwan/u/${u.id}">${av(u)}<span class="b6grow"><b>${esc(u.name)}</b></span></a>`).join(''):'')+`<div class="b7sec"><h3>تغريدات</h3></div>`+((r.items||[]).map(p=>postHTML(p)).join('')||'<div class="b6empty">لا نتائج</div>')},q[0]==='#'?800:350)}}
function diwan(arg){const a=String(arg||'').split('/'),k=a[0];
 if(k==='p'&&a[1])return thread(a[1]);if(k==='u'&&a[1])return profile(a[1],a[2]);if(k==='f'&&a[1])return follows(a[1],a[2]);if(k==='tag'&&a[1])return tag(decodeURIComponent(a[1]));
 if(k==='n')return notifs();if(k==='s')return search();
 return feed()}
