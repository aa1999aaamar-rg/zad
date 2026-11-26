
import json,sys,asyncio,os,time
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
os.makedirs(OUT,exist_ok=True)
def seed():
  import datetime
  d=datetime.date.today(); s={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"jeddah","cityUser":True,"rep":3,"reciter":"maher"},
   "tasb":{"i":0,"target":33,"count":0,"total":0},"salah":{},"khatma":{"start":(d-datetime.timedelta(days=20)).isoformat(),"N":30,"base":0,"pos":96,"log":{}},"adhkarDone":{},"done":{},
   "zf":{"d":{}},"zsr":{"never":1},"b5b":{"habits":[{"name":"ورد","start":(d-datetime.timedelta(days=12)).isoformat(),"days":{}}]}}
  for i in range(0,21):
    k=(d-datetime.timedelta(days=i)).isoformat()
    if k[:7]!=d.isoformat()[:7]: continue
    s["salah"][k]={"Fajr":"j","Dhuhr":"o","Asr":"j","Maghrib":"j","Isha":"o"} if i%3 else {"Fajr":"j","Dhuhr":"j","Asr":"o"}
    s["khatma"]["log"][k]=4+(i%5)
    if i%2==0: s["adhkarDone"][k]=True
    s["zf"]["d"][k]={"t":[100,250,33,99,400][i%5],"tx":{"سبحان الله وبحمده":[60,200,33,50,300][i%5],"أستغفر الله":[40,50,0,49,100][i%5]},"m":i%2==0,"e":i%3==0,"na":[0,12,30,0,7][i%5]}
    if i<12: s["b5b"]["habits"][0]["days"][k]=True
  return s
SEED=seed()
INIT_SEED="""(()=>{try{if(!localStorage.getItem('wa.init')){localStorage.setItem('wa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','4.8.0');}}catch(e){}})()"""%json.dumps(SEED,ensure_ascii=False)
INIT_EMPTY="""(()=>{try{if(!localStorage.getItem('wa.init')){localStorage.setItem('wa.init','1');localStorage.setItem('ammar.v1',JSON.stringify({"onboarded":true,"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":true,"rep":3,"reciter":"maher"}}));localStorage.setItem('ammar.lastSeen','4.8.0');}}catch(e){}})()"""
R={'errors':[],'checks':[]}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:400]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:300],flush=True)
async def ctx(b,init):
  c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow')
  await c.add_init_script(init)
  if LOCAL:
    async def h(route):
      p=route.request.url.split('/x/')[1].split('?')[0]
      fp=os.path.join(LOCAL,p)
      if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/javascript' if p.endswith('.js') else 'application/json','Access-Control-Allow-Origin':'*'})
      else: await route.continue_()
    await c.route('https://zad-content.sites.tab.bot/x/*',h)
  pg=await c.new_page()
  pg.on('pageerror',lambda e:R['errors'].append(str(e)))
  pg.on('console',lambda m: R['errors'].append('console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text and 'youtube' not in m.text.lower() and 'ERR_' not in m.text else None)
  return c,pg
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  c,pg=await ctx(b,INIT_SEED)
  ev=pg.evaluate
  async def go(h,w=1500): await ev(f"location.hash='{h}'"); await pg.wait_for_timeout(w)
  async def shot(n): await pg.screenshot(path=f'{OUT}/{n}.png')
  async def nownm(): await ev("(()=>{const w=document.getElementById('wnm');if(w)w.remove();document.querySelectorAll('.wnbd,#wnbd').forEach(e=>e.remove());try{closeSheet()}catch(e){};localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))})()")
  await pg.goto(BASE+'/#home',wait_until='networkidle'); await pg.wait_for_timeout(2500); await nownm()
  if not LOCAL:
    await ev("navigator.serviceWorker.ready.then(()=>1)"); await pg.wait_for_timeout(1500); await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(2500); await nownm()
    v=await ev("navigator.serviceWorker&&navigator.serviceWorker.controller?caches.keys():[]"); ck('sw cache ammar-v4-8-0',any('ammar-v4-8-0' in x for x in v),v)
  ck('APP_VERSION 4.8.0',await ev("window.APP_VERSION")=='4.8.0',await ev("window.APP_VERSION"))
  ring=await ev("(document.querySelector('#zb4ring')||{}).textContent||''"); ck('home level ring',('رحلتي' in ring),ring)
  ck('made-by footer',await ev("document.body.textContent.includes('صُنع بواسطة عمار الشمري')"))
  await shot('01-home')
  # XP before
  xp0=await ev("ZS.rihla().xp"); 
  # --- talking mushaf, Maher (ayah level)
  await go('natiq/112',3500)
  ck('natiq renders words',await ev("document.querySelectorAll('.zn-w').length")>10,await ev("document.querySelectorAll('.zn-w').length"))
  ck('natiq mode note ayah-level',await ev("document.querySelector('.zn-mode').textContent.includes('آية بآية')"))
  await pg.click('#znpb'); await pg.wait_for_timeout(2500)
  s1=await ev("ZB4.natState()"); ck('maher playing (basmala or ayah)',(not s1['paused']) and s1['t']>0,s1)
  await shot('02-natiq-maher')
  await pg.wait_for_timeout(9000)
  s2=await ev("ZB4.natState()"); ck('maher ayah highlight advanced',s2['a']>=2 and s2['ayahOn'] is not None,{'a':s2['a'],'on':s2['ayahOn'],'b':s2['b']})
  await shot('03-natiq-maher-adv')
  await pg.click('[data-sp="1.25"]'); await pg.wait_for_timeout(400)
  ck('speed 1.25',abs((await ev("ZB4.natState().rate"))-1.25)<0.01)
  await pg.click('[data-sp="1"]')
  ms=await ev("ZB4.natState().ms"); ck('MediaSession metadata set',ms)
  # --- word level (Alafasy)
  await pg.select_option('#znrec','q7'); await pg.wait_for_timeout(3000)
  await go('natiq/1/1/p',4500)
  seen=[]
  for i in range(16):
    w=await ev("ZB4.natState()"); seen.append((w['a'],w['last'],w['word'])); await pg.wait_for_timeout(300)
  ck('word-level segments loaded',w['seg']>0,w)
  dist=[x for j,x in enumerate(seen) if x[1]>0 and (j==0 or x!=seen[j-1])]
  ck('word highlight advances word by word',len(set(dist))>=4,dist[:10])
  await pg.wait_for_timeout(1500); await shot('04-natiq-word')
  # repeat range settings
  await pg.click('#znrgt'); await pg.wait_for_timeout(300)
  ck('repeat range UI',await ev("document.querySelector('#znrg').classList.contains('on')"))
  await pg.click('#znrgt')
  await ev("ZB4.natStop()")
  # XP after real listening
  xp1=await ev("ZS.rihla().xp"); ck('XP increments from listening',xp1>xp0,(xp0,xp1))
  # --- tasbih taps
  await go('tasbeeh',3000)
  try:
    await ev("document.querySelector('#zt-stage').scrollIntoView({block:'center'})"); bb=await pg.locator('#zt-stage > *').first.bounding_box()
    for i in range(20): await pg.mouse.click(bb['x']+bb['width']/2,bb['y']+bb['height']/2,delay=10); await pg.wait_for_timeout(25)
  except Exception as e: R['errors'].append('tap:'+str(e))
  await pg.wait_for_timeout(500)
  xp2=await ev("ZS.rihla().xp"); tsb=await ev("ZS.rihla().s.tsb"); ck('XP increments from tasbih taps',xp2>=xp1+2,(xp1,xp2,tsb))
  # --- rihla
  await go('rihla',2000); ck('rihla renders',await ev("document.querySelectorAll('.zr-b').length")>=25,await ev("document.querySelectorAll('.zr-b').length")); await shot('05-rihla')
  await ev("window.scrollTo(0,700)"); await pg.wait_for_timeout(300); await shot('05b-rihla-badges'); await ev("window.scrollTo(0,0)")
  # --- live
  await go('live',6000)
  src=await ev("(document.querySelector('#zlif')||{}).src||''"); ck('live iframe makkah channel embed','live_stream?channel=UCos52azQNBgW63_9uDJoPDA' in src,src)
  fr=[f.url for f in pg.frames]; ck('youtube frame loaded',any('youtube.com/embed' in u for u in fr),fr[:3])
  await shot('06-live-makkah')
  await pg.click('[data-lv="madinah"]'); await pg.wait_for_timeout(4000)
  src=await ev("(document.querySelector('#zlif')||{}).src||''"); ck('live madinah tab','UCROKYPep-UuODNwyipe6JMw' in src,src); await shot('07-live-madinah')
  # --- harvest + story
  await go('harvest',3000); ck('harvest story button',await ev("!!document.getElementById('zb4wr')")); await shot('08-harvest')
  await pg.click('#zb4wr'); await pg.wait_for_timeout(1500)
  n=await ev("document.querySelectorAll('.zw-s').length"); ck('wrapped 6-8 slides (seeded)',6<=n<=8,n)
  for i in range(n):
    await ev(f"document.querySelectorAll('.zw-s').forEach((s,j)=>s.classList.toggle('on',j=={i}))") if False else None
    await pg.wait_for_timeout(1500); await shot(f'09-wrap-{i}')
    if i<n-1: await pg.mouse.click(100,420); await pg.wait_for_timeout(300)
  txt=await ev("document.querySelector('.zw-s.on').textContent"); ck('wrapped last slide has dua',('ختامها' in txt and '[البقرة' in txt),txt[:80])
  ok=await ev("ZB4.shareCard(ZB4.wrapStats(new Date().getFullYear(),new Date().getMonth()),true).then(c=>{const a=document.createElement('a');window.__card=c.toDataURL('image/jpeg',.85);return c.width+'x'+c.height})"); ck('share card renders',ok=='1080x1920',ok)
  data=await ev("window.__card"); import base64; open(f'{OUT}/10-sharecard.jpg','wb').write(base64.b64decode(data.split(',')[1]))
  await ev("document.querySelector('.zw-x').click()")
  # --- ramadan preview
  await go('settings',2000); ck('settings ramadan toggle',await ev("!!document.getElementById('zb4rm')"))
  await ev("(()=>{const x=document.getElementById('zb4rm');x.checked=true;x.dispatchEvent(new Event('change'))})()"); await pg.wait_for_timeout(500)
  await go('home',3500); await nownm()
  rh=await ev("(document.querySelector('#zb4ram')||{}).textContent||''"); ck('home transforms (ramadan card)',('رمضان' in rh) and ('السحور' in rh),rh[:120]); await shot('11-home-ramadan')
  await go('ramadan',2500)
  rows=await ev("document.querySelectorAll('.zrm-tb tbody tr').length"); ck('imsakiya rows 29/30',rows in (29,30),rows)
  ck('iftar hadith with grade + link',await ev("!!document.querySelector('a[href=\"https://sunnah.com/abudawud:2357\"]') && document.body.textContent.includes('(الألباني)')"))
  await shot('12-ramadan'); await ev("window.scrollTo(0,900)"); await pg.wait_for_timeout(300); await shot('12b-ramadan'); await ev("window.scrollTo(0,2100)"); await pg.wait_for_timeout(300); await shot('12c-ramadan')
  await go('settings',1500); await ev("(()=>{const x=document.getElementById('zb4rm');x.checked=false;x.dispatchEvent(new Event('change'))})()")
  # --- reader chip, media card, badges link, sections new
  await go('read/s/2',3000); ck('reader has natiq chip',await ev("!!document.getElementById('zb4nat')")); await shot('13-reader')
  await go('media',1500); ck('media links to live',await ev("!!document.querySelector('a[href=\"#live\"]')"))
  await go('badges',1500); ck('badges links to rihla',await ev("!!document.getElementById('zb4bd')"))
  await go('sec/quran',1500); ck('quran hub has natiq new',await ev("[...document.querySelectorAll('a[href=\"#natiq\"]')].some(a=>a.textContent.includes('جديد'))")); await shot('14-hub-quran')
  for r in ['quran','prayer','tasbeeh','khatma','videos','kidstory','zakat','family','whatsnew']:
    await go(r,1200)
  ck('whatsnew top entry',await ev("document.body.textContent.includes('المصحف الناطق، الحرم مباشر، حصادي الشهري، رحلتي بالمستويات والأوسمة، ووضع رمضان')"))
  await c.close()
  # --- empty data wrapped
  c2,pg2=await ctx(b,INIT_EMPTY)
  await pg2.goto(BASE+'/#home',wait_until='networkidle'); await pg2.wait_for_timeout(2500)
  await pg2.evaluate("(()=>{const w=document.getElementById('wnm');if(w)w.remove()})()")
  await pg2.evaluate("location.hash='wrapped'"); await pg2.wait_for_timeout(3000)
  n2=await pg2.evaluate("document.querySelectorAll('.zw-s').length"); t2=await pg2.evaluate("[...document.querySelectorAll('.zw-s')].map(s=>s.textContent).join(' | ')")
  ck('wrapped empty: encouraging copy',n2>=6 and 'صفحة واحدة كل يوم' in t2 and 'سجّل صلواتك' in t2,(n2,t2[:200]))
  await pg2.wait_for_timeout(500); await pg2.screenshot(path=f'{OUT}/15-wrap-empty-0.png')
  await pg2.mouse.click(100,420); await pg2.wait_for_timeout(1500); await pg2.screenshot(path=f'{OUT}/15-wrap-empty-1.png')
  ring2=await pg2.evaluate("(()=>{location.hash='home'; return 1})()"); await pg2.wait_for_timeout(2000)
  ck('empty home ring',await pg2.evaluate("(document.querySelector('#zb4ring')||{}).textContent.includes('خطوة أولى')"))
  await c2.close(); await b.close()
 ck('no page errors',not R['errors'],R['errors'][:6])
 json.dump(R,open(f'{OUT}/results.json','w'),ensure_ascii=False,indent=1)
asyncio.run(main())
