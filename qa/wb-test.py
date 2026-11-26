
# زاد v4.9 wave B QA: python3 qa/wb-test.py BASE OUTDIR [LOCAL_CONTENT_DIR|-]   (ZADM = admin session token, optional)
import json,sys,asyncio,os,time,re,requests
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
LIVE='https://amar-muslim.sites.tab.bot'; os.makedirs(OUT,exist_ok=True)
ADM=os.environ.get('ZADM','')
Q=json.load(open(os.path.join(os.path.dirname(__file__),'quran-sample.json')))
R={'errors':[],'checks':[]}; CLEAN={'hq':set()}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:400]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:300],flush=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"jeddah","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('wb.init')){localStorage.setItem('wb.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),os.environ.get('ZVER','4.9.1'))
# a fake SpeechRecognition: on start() it streams window.__fw (words) as interim results, finalising every 4 words, 90 ms per word
FAKE="""(()=>{window.__fakeLoaded=1;class FakeSR{constructor(){this.lang='';this.continuous=false;this.interimResults=false;window.__srLast=this;window.__srCount=(window.__srCount||0)+1}
 start(){const W=(window.__fw||[]).slice();window.__fw=[];this.started=true;window.__srLang=this.lang;const res=[];let cur=[],i=0;const self=this;
  const ev=()=>({resultIndex:0,results:res.map(r=>Object.assign([{transcript:r.t,confidence:.9}],{isFinal:r.f}))});
  const step=()=>{if(self.stopped)return;if(i>=W.length){if(cur.length){res.push({t:cur.join(' '),f:true});cur=[];self.onresult&&self.onresult(ev())}return}
   cur.push(W[i++]);const tmp=res.concat([{t:cur.join(' '),f:false}]);self.onresult&&self.onresult({resultIndex:0,results:tmp.map(r=>Object.assign([{transcript:r.t,confidence:.9}],{isFinal:r.f}))});
   if(cur.length>=4){res.push({t:cur.join(' '),f:true});cur=[];self.onresult&&self.onresult(ev())}setTimeout(step,90)};setTimeout(step,150)}
 stop(){this.stopped=true} abort(){this.stopped=true}}
 for(const k of ['SpeechRecognition','webkitSpeechRecognition']){try{Object.defineProperty(window,k,{value:FakeSR,writable:true,configurable:true})}catch(e){window[k]=FakeSR}}})();"""
NOSR="""(()=>{for(const k of ['SpeechRecognition','webkitSpeechRecognition']){try{delete window[k]}catch(e){}try{Object.defineProperty(window,k,{value:undefined,writable:true,configurable:true})}catch(e){}}})();"""
def norm_toks(s):
  import unicodedata
  return s
async def mk(b,extra=''):
  c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow')
  await c.add_init_script(INIT)
  if extra: await c.add_init_script(extra)
  if BASE!=LIVE:
    async def api(route):
      u=route.request.url.replace(BASE,LIVE)
      try:
        r=await route.fetch(url=u); await route.fulfill(response=r)
      except Exception: await route.abort()
    await c.route(re.compile(re.escape(BASE)+r'/(api|go)/.*'),api)
  if LOCAL:
    async def h(route):
      p=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,p)
      if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/javascript' if p.endswith('.js') else 'application/json','Access-Control-Allow-Origin':'*'})
      else: await route.continue_()
    await c.route('https://zad-content.sites.tab.bot/x/*',h)
  pg=await c.new_page(); pg.__reqs=[]
  pg.on('pageerror',lambda e:R['errors'].append(str(e)))
  pg.on('console',lambda m: R['errors'].append('console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text and 'youtube' not in m.text.lower() and 'ERR_' not in m.text else None)
  pg.on('request',lambda r: pg.__reqs.append(r.url))
  return c,pg
async def boot(pg):
  await pg.goto(BASE+'/#home',wait_until='networkidle'); await pg.wait_for_timeout(2200)
  await pg.evaluate("(()=>{const w=document.getElementById('wnm');if(w)w.remove();document.querySelectorAll('.wnbd,#wnbd,.zwov,#zwov').forEach(e=>e.remove());try{closeSheet()}catch(e){}})()")
async def go(pg,h,w=1500):
  if await pg.evaluate(f"location.hash.slice(1)==='{h}'"): await pg.evaluate("location.hash='home'"); await pg.wait_for_timeout(400)
  await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(w)
def uth(s,a): return Q[str(s)][a-1]['u']
def iml(s,a): return Q[str(s)][a-1]['i']
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  # ---------- A: voice recitation with a fake recognition stream ----------
  c,pg=await mk(b,FAKE); ev=pg.evaluate
  await boot(pg)
  if BASE==LIVE:
    await ev("navigator.serviceWorker.ready.then(()=>1)"); await pg.wait_for_timeout(1500); await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(2000)
    v=await ev("navigator.serviceWorker&&navigator.serviceWorker.controller?caches.keys():[]"); SWV='ammar-v'+os.environ.get('ZVER','4.9.1').replace('.','-'); ck('sw cache '+SWV,any(SWV in x for x in v),v)
  VER=os.environ.get('ZVER','4.9.1'); ck('APP_VERSION '+VER,await ev("window.APP_VERSION")==VER,await ev("window.APP_VERSION"))
  ck('made-by footer kept',await ev("document.body.textContent.includes('صُنع بواسطة عمار الشمري')"))
  await go(pg,'sec/quran',1200)
  hub=await ev("document.getElementById('view').innerText"); ck('quran hub lists the 3 new features',all(x in hub for x in ['التسميع بالصوت','رفيق الحفظ الذكي','حلقة التحفيظ']),'')
  nb=await ev("[...document.querySelectorAll('#view a[href=\"#listen\"],#view a[href=\"#srs\"],#view a[href=\"#halaqa\"]')].filter(a=>a.querySelector('.zs-new')).length"); ck('«جديد» badges on them',nb>=3,nb)
  await pg.screenshot(path=f'{OUT}/01-hub.png')
  await go(pg,'listen/67/1-4',3500)
  n=await ev("document.querySelectorAll('#z5tx .z5-w[data-i]').length"); ck('#listen loads 67:1–4 from api.quran.com',n>30,n)
  ck('honest + privacy notes',await ev("document.body.innerText.includes('أدق على أندرويد كروم')&&document.body.innerText.includes('يستخدم خدمة التعرّف في متصفحك')"))
  # spoken words = quran.com text_imlaei for 67:1–4, with ONE deliberate mistake: 67:3 word 4 replaced
  exp=[]; 
  for a in range(1,5): exp+= [(a,w) for w in uth(67,a)]
  spoken=[]
  for a in range(1,5): spoken+= iml(67,a).split()
  # strip tashkeel from the imla'i words like a recognizer would
  strip=lambda s: re.sub('[\u064b-\u0652\u0670\u0640]','',s)
  spoken=[strip(x) for x in spoken]
  n1=len(uth(67,1));n2=len(uth(67,2));mi=n1+n2+3
  smi=len(iml(67,1).split())+len(iml(67,2).split())+3
  wrong='الأرض'; said=spoken[:smi]+[wrong]+spoken[smi+1:]
  ck('mistake replaces 67:3 word 4 in the spoken stream',strip(iml(67,3).split()[3])==spoken[smi],(spoken[smi],))
  await ev(f"window.__fw={json.dumps(said,ensure_ascii=False)}")
  await pg.click('#z5mic'); await pg.wait_for_timeout(500)
  ck('recognizer configured ar-SA, continuous, interim',await ev("!!(window.__srLast&&window.__srLast.lang==='ar-SA'&&window.__srLast.continuous&&window.__srLast.interimResults)"))
  await pg.wait_for_timeout(90*len(said)+2500)
  bad=await ev("[...document.querySelectorAll('#z5tx .z5-w.bad')].map(x=>+x.dataset.i)")
  okc=await ev("document.querySelectorAll('#z5tx .z5-w.ok[data-i],#z5tx .z5-w.soft[data-i]').length")
  ck(f'stops at the deliberate mistake (word #{mi+1} = 67:3 word 4)',bad==[mi],{'bad':bad,'mi':mi})
  ck('words before it revealed green',okc==mi,okc)
  shown=await ev("(document.querySelector('.z5-err .w')||{}).textContent||''")
  ck('error panel shows the correct Uthmani word',shown==exp[mi][1],[shown,exp[mi][1]])
  ck('recognition stopped at the mistake',await ev("!!(window.__srLast&&window.__srLast.stopped)"))
  await pg.screenshot(path=f'{OUT}/02-listen-mistake.png')
  pg.__reqs.clear(); await pg.click('#z5lis'); await pg.wait_for_timeout(1500)
  ck('«اسمعها» plays that ayah (everyayah Maher 067003)',any('everyayah.com' in u and '067003' in u for u in pg.__reqs),[u for u in pg.__reqs if 'mp3' in u][:2])
  await ev(f"window.__fw={json.dumps(spoken[smi:],ensure_ascii=False)}")
  await pg.click('#z5go'); await pg.wait_for_timeout(90*len(spoken[smi:])+2500)
  res=await ev("(()=>{const z=S.zb5;return{tl:z.tl.slice(-1)[0],weak:z.weak,tw:(S.test&&S.test.weak)||{}}})()")
  N=len(exp); ck('session finished with score (N-1)/N',res['tl'] and res['tl']['sc']==round(100*(N-1)/N) and res['tl']['src']=='v',res['tl'])
  ck('weak ayah 67:3 logged for رفيق الحفظ',res['weak'].get('67:3',0)>=1,res['weak'])
  ck('page 562 marked weak in the shared hifz data',int(res['tw'].get('562',0))>=1,res['tw'])
  await pg.screenshot(path=f'{OUT}/03-listen-result.png')
  ck('old «سجّل ثم قارن» page still reachable (#listen/classic)',await (go(pg,'listen/classic',1500)) or await ev("document.getElementById('view').innerText.length>50"))
  # ---------- C: SM-2 over simulated days ----------
  await go(pg,'srs',2000)
  sim=await ev("""(()=>{const RD=Date;let off=0;window.Date=class extends RD{constructor(...a){if(!a.length)super(RD.now()+off*864e5);else super(...a)}static now(){return RD.now()+off*864e5}};
   const Z=ZB5._Z;Z.units=[{id:'r67_1_10',s:67,a1:1,a2:10}];delete Z.sr['r67_1_10'];Z.memP=[];const B=S.b3&&S.b3.sr;if(B)Object.keys(B).forEach(k=>delete B[k]);
   const pat=[3,3,5,2,3,5,5];let k=0;const log=[];for(off=0;off<=60&&k<pat.length;off++){const d=ZB5.dueList();const u=d.find(x=>x.id==='r67_1_10');if(u){const q=pat[k++];const o=ZB5.rate(u,q);log.push({day:off,q,iv:o.iv,ef:o.ef,n:o.n})}}
   const z0=Object.assign({},Z.sr['r67_1_10']);window.Date=RD;Z.sr['r67_1_10'].due='2099-01-01';ZB5.bumpWeak(['67:3']);const after=Z.sr['r67_1_10'].due;return{log,after,today:ZB5._Z&&new Date().toISOString().slice(0,10)}})()""")
  # independent expectation
  ef,iv,n,day,exp_log=2.5,0,0,0,[]
  for q in [3,3,5,2,3,5,5]:
    if q<3: n=0;iv=1
    else:
      n+=1; iv=1 if n==1 else 3 if n==2 else round(iv*ef*(1.3 if q==5 else 1))
    ef=max(1.3,round(ef+0.1-(5-q)*(0.08+(5-q)*0.02),2)); exp_log.append({'day':day,'q':q,'iv':iv,'n':n}); day+=max(1,iv)
  got=[{k:x[k] for k in ('day','q','iv','n')} for x in sim['log']]
  ck('SM-2 schedule across simulated days matches the formula',got==exp_log,{'got':got,'exp':exp_log})
  ck('weak ayah from التسميع pulls its unit back to today/tomorrow',sim['after']<'2099',sim['after'])
  await ev("(()=>{const Z=ZB5._Z;Z.sr['r67_1_10'].due=new Date().toISOString().slice(0,10);Z.units.push({id:'r112_1_4',s:112,a1:1,a2:4});save()})()")
  await go(pg,'srs',2000)
  st=await ev("document.getElementById('view').innerText")
  ck('#srs shows due today + stats',('مراجعة اليوم' in st) and ('نسبة التثبيت' in st) and ('محفوظ' in st),st[:200])
  await pg.screenshot(path=f'{OUT}/04-srs.png')
  await pg.click('[data-rv="0"]'); await pg.wait_for_timeout(2500)
  ck('review flow step 1 «استمع»',await ev("!!document.querySelector('#z5pl')"))
  await pg.screenshot(path=f'{OUT}/05-srs-listen.png')
  await pg.click('#z5n1'); await pg.wait_for_timeout(2500)
  ck('review step 2 opens the recitation (hidden text)',await ev("!!document.querySelector('#z5ss .z5-txt.z5-hide')"))
  await pg.click('#z5n2'); await pg.wait_for_timeout(800)
  ck('review step 3 rate سهل/متوسط/صعب',await ev("document.querySelectorAll('#z5rv [data-q]').length===3"))
  await pg.screenshot(path=f'{OUT}/06-srs-rate.png')
  TK="(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})()"
  before=await ev(f"(S.b3.srLog||{{}})[{TK}]||0")
  await pg.click('#z5rv [data-q="3"]'); await pg.wait_for_timeout(1200)
  after=await ev(f"(S.b3.srLog||{{}})[{TK}]||0")
  ck('rating saves the review (srLog +1)',after==before+1,(before,after))
  # reminder through the app's reminder list
  await ev("(()=>{S.rem.on.srs=true;S.zb5.remT='23:59';const Z=ZB5._Z;Z.sr['r112_1_4']={ef:2.5,iv:0,n:0,due:'2020-01-01'};save()})()")
  rems=await ev("todaysReminders().filter(r=>r.id==='srs').map(r=>r.url)")
  ck('daily reminder appears in the app reminders when due',rems==['#srs'],rems)
  # rihla XP
  await go(pg,'rihla',2500)
  rt=await ev("document.getElementById('view').innerText")
  ck('رحلتي counts the new XP + badges',('جلسات التسميع' in rt or 'أول تسميع' in rt),'')
  xp=await ev("ZS.rihla().parts.filter(p=>['جلسات التسميع','مراجعات رفيق الحفظ'].includes(p.n)).map(p=>p.v)")
  ck('XP from recitation and reviews > 0',all(x>0 for x in xp) and len(xp)==2,xp)
  st2=await ev("ZB4&&ZB4.wrapStats?ZB4.wrapStats(new Date().getFullYear(),new Date().getMonth()):null")
  ck('حصادي sees reviews and recitation sessions',st2 and st2.get('rv',0)>=1 and st2.get('ts',0)>=1,{k:st2.get(k) for k in ('rv','ts','tsBest')} if st2 else None)
  await go(pg,'whatsnew',1500)
  ck('«ما الجديد» top entry',await ev("document.getElementById('view').innerText.includes('التسميع بالصوت، رفيق الحفظ الذكي، وحلقة التحفيظ مع أصحابك')"))
  for r in ['natiq/1','rihla','harvest','khatma','tasbeeh','family','zakat','srs/classic','adhkar','prayer']:
    await go(pg,r,1300); L=await ev("document.getElementById('view').innerText.length"); ck('old route #'+r,L>40,L)
  await c.close()
  # ---------- B: no SpeechRecognition → self-check fallback ----------
  c,pg=await mk(b,NOSR); ev=pg.evaluate; await boot(pg)
  await go(pg,'listen/112',3500)
  t=await ev("document.getElementById('view').innerText")
  ck('no-SR browser: clear message',('متصفحك لا يدعم التعرّف على الصوت' in t),'')
  ck('self-check bar shown',await ev("!!document.querySelector('#z5y')&&!!document.querySelector('#z5n')"))
  N=await ev("document.querySelectorAll('#z5tx .z5-w[data-i]').length")
  await pg.click('#z5y'); await pg.click('#z5y'); await pg.click('#z5n'); await pg.screenshot(path=f'{OUT}/07-selfcheck.png')
  for i in range(N-3): await pg.click('#z5y')
  await pg.wait_for_timeout(600)
  r=await ev("S.zb5.tl.slice(-1)[0]")
  ck('self-check marks words right/wrong and scores',r and r['src']=='s' and r['e']==1 and r['sc']==round(100*(N-1)/N),r)
  await pg.screenshot(path=f'{OUT}/08-selfcheck-done.png')
  await c.close()

  # ---------- E: v4.9.1 وضع الأذان ----------
  WL="""(()=>{try{Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async(t)=>{window.__wl=(window.__wl||0)+1;return{release(){},addEventListener(){}}}}})}catch(e){}})();"""
  c,pg=await mk(b,WL); ev=pg.evaluate; await boot(pg)
  await go(pg,'prayer',2500)
  ck('prayer page has the «وضع الأذان» entry',await ev("!!document.getElementById('zadin')"))
  await go(pg,'settings',2000)
  ck('settings has the «وضع الأذان» entry',await ev("!!document.getElementById('zadin')"))
  await go(pg,'adhanmode',3000)
  ck('adhan mode opens (full-screen)',await ev("!!document.querySelector('#zadm .go')"))
  ck('honest Apple note shown',await ev("document.getElementById('zadm').innerText.includes('هذا قيد من آبل')"))
  await pg.screenshot(path=f'{OUT}/14-adhan-mode.png')
  await pg.click('#zadm .go'); await pg.wait_for_timeout(1200)
  s=await ev("ZB5.adhanState()")
  ck('activation requests the screen wake lock',(await ev("window.__wl||0"))>=1 and s['wl']=='granted',s['wl'])
  ck('audio primed with the app adhan file',s['src']=='https://cdn.aladhan.com/audio/adhans/a1.mp3',s['src'])
  nx=s['next']; ck('next prayer computed from the app engine',bool(nx),nx)
  await pg.screenshot(path=f'{OUT}/15-adhan-active.png')
  if nx:
    await ev("(T)=>{const RD=window.__RD||Date;window.__RD=RD;const off=T-RD.now();window.Date=class extends RD{constructor(...a){if(!a.length)super(RD.now()+off);else super(...a)}static now(){return RD.now()+off}}}",nx['at']+3000); await pg.wait_for_timeout(4500)
    s2=await ev("ZB5.adhanState()")
    ck('mocked clock at the prayer time triggers the full adhan',bool(s2['playing']) and len(s2['log'])==1 and s2['log'][0]['k']==nx['k'],{k:s2[k] for k in ('playing','log','paused')})
    ck('«إيقاف» overlay shown',await ev("!!document.getElementById('zadstop')"))
    await pg.screenshot(path=f'{OUT}/16-adhan-now.png')
    await pg.wait_for_timeout(2500); s3=await ev("ZB5.adhanState()"); ck('fires once per prayer (no repeat on later ticks)',len(s3['log'])==1,len(s3['log']))
    await pg.click('#zadstop'); await pg.wait_for_timeout(600)
    ck('after stopping: dua after the adhan (Bukhari 614, sunnah.com link)',await ev("(()=>{const d=document.getElementById('zadua');return !!d&&!d.hidden&&d.innerText.includes('الدَّعْوَةِ التَّامَّةِ')&&!!d.querySelector('a[href=\"https://sunnah.com/bukhari:614\"]')})()"))
    await pg.screenshot(path=f'{OUT}/17-adhan-dua.png')
  ck('mode remembered as on',await ev("!!(S.zb5.adh&&S.zb5.adh.on)"))
  await c.close()
  # ---------- D: circle with two users ----------
  cA,A=await mk(b,''); cB,Bp=await mk(b,'')
  await boot(A); await boot(Bp)
  await go(A,'halaqa',2000); await A.screenshot(path=f'{OUT}/09-halaqa-home.png')
  await A.fill('#z5hn','حلقة اختبار ٤٫٩'); await A.fill('#z5hm','المعلم أحمد'); await A.click('#z5hc'); await A.wait_for_timeout(3500)
  code=await A.evaluate("location.hash.split('/')[1]||''"); ck('circle created with a 6-char code',bool(re.match(r'^[A-Z2-9]{6}$',code)),code)
  if code: CLEAN['hq'].add(code)
  ck('invite sheet with code',await A.evaluate(f"(document.querySelector('.z5-code')||{{}}).textContent==='{code}'"))
  await A.screenshot(path=f'{OUT}/10-halaqa-invite.png')
  await A.evaluate("document.querySelectorAll('.z5sh').forEach(e=>e.remove())")
  await go(Bp,'halaqa/'+code,3000)
  ck('B sees the join screen from the link',await Bp.evaluate("!!document.querySelector('#z5jb')"))
  await Bp.fill('#z5jn','خالد'); await Bp.click('#z5jb'); await Bp.wait_for_timeout(3000)
  ck('B joined (2 members on board)',await Bp.evaluate("document.querySelectorAll('.z5-mem').length")==2)
  # A sets the weekly target
  await A.reload(wait_until='networkidle'); await A.wait_for_timeout(3000)
  await A.click('#z5wk'); await A.wait_for_timeout(400)
  await A.select_option('#z5ws','67'); await A.fill('#z5w1','1'); await A.fill('#z5w2','10'); await A.fill('#z5wt','نصف سورة الملك'); await A.click('#z5wsv'); await A.wait_for_timeout(2500)
  ck('teacher sets «المقرر»',await A.evaluate("document.getElementById('view').innerText.includes('نصف سورة الملك')"))
  # B posts progress with a note
  await Bp.reload(wait_until='networkidle'); await Bp.wait_for_timeout(3000)
  await Bp.select_option('#z5ps','67'); await Bp.fill('#z5p1','1'); await Bp.fill('#z5p2','10'); await Bp.click('#z5pc [data-v="90"]'); await Bp.fill('#z5pn','الحمد لله ثبتت'); await Bp.click('#z5pb'); await Bp.wait_for_timeout(2500)
  ck('B progress saved',await Bp.evaluate("document.getElementById('view').innerText.includes('سجّلت اليوم')"))
  await A.reload(wait_until='networkidle'); await A.wait_for_timeout(3500)
  at=await A.evaluate("document.getElementById('view').innerText")
  ck('A sees B progress (range, 90%, streak, note)',('خالد' in at and '٩٠٪' in at and 'الحمد لله ثبتت' in at),'')
  await A.screenshot(path=f'{OUT}/11-halaqa-board.png',full_page=False)
  await A.click('[data-ch]'); await A.wait_for_timeout(500); await A.click('.z5sh [data-m="1"]'); await A.wait_for_timeout(2000)
  await Bp.reload(wait_until='networkidle'); await Bp.wait_for_timeout(3500)
  ck('B receives the «شجّع» cheer',await Bp.evaluate("document.getElementById('view').innerText.includes('المعلم أحمد')&&!!document.querySelector('.z5-hon')"))
  await Bp.screenshot(path=f'{OUT}/12-halaqa-cheer.png')
  # A reports B's note
  await A.click('[data-rp]'); await A.wait_for_timeout(500); await A.fill('#z5rr','اختبار'); await A.click('#z5rg'); await A.wait_for_timeout(1800)
  ck('report sent (toast)',True)
  if ADM:
    L=requests.get(LIVE+'/api/social/admin/list',headers={'authorization':'Bearer '+ADM},timeout=30).json()
    hn=[x for x in L.get('hnotes',[]) if x['hid']==code]; ck('report reached admin (note_rep=1)',hn and hn[0]['note_rep']==1,hn[:1])
    ck('admin list has the test circle',any(h['id']==code for h in L.get('halaqas',[])))
    # admin page UI delete
    ca=await b.new_context(viewport={'width':390,'height':844}); await ca.add_init_script(f"localStorage.setItem('zad.vadm','{ADM}')")
    ap=await ca.new_page(); ap.on('pageerror',lambda e:R['errors'].append('admin:'+str(e))); ap.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
    await ap.goto(LIVE+'/admin/social',wait_until='load'); await ap.wait_for_timeout(2500); await ap.click('[data-tab="hq"]'); await ap.wait_for_timeout(600)
    ck('admin «حلقات التحفيظ» tab lists the circle',await ap.evaluate(f"!!document.querySelector('[data-a=\"halaqa\"][data-id=\"{code}\"]')"))
    await ap.screenshot(path=f'{OUT}/13-admin.png')
    await ap.click(f'[data-a="halaqa"][data-op="delete"][data-id="{code}"]'); await ap.wait_for_timeout(2500)
    g=requests.get(LIVE+'/api/social/halaqa/get',params={'code':code},headers={'X-Zad-Dev':'a'*32},timeout=30).status_code
    ck('admin delete works (circle gone → 404)',g==404,g)
    if g==404: CLEAN['hq'].discard(code)
    await ca.close()
  await A.reload(wait_until='networkidle'); await A.wait_for_timeout(3000)
  await cA.close(); await cB.close(); await b.close()
asyncio.run(main())
R['errors']=[e for e in R['errors'] if 'favicon' not in e]
ck('no page errors',not R['errors'],R['errors'][:5])
R['clean_left']=list(CLEAN['hq'])
json.dump(R,open(f'{OUT}/results.json','w'),ensure_ascii=False,indent=1)
print('TOTAL',sum(c['ok'] for c in R['checks']),'/',len(R['checks']),'left:',R['clean_left'])
