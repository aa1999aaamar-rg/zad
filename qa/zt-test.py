
import json,sys,asyncio
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]; LOCALZT=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
FAKECH=len(sys.argv)>4 and sys.argv[4]=='fakech'
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"jeddah","cityUser":True,"rep":3,"reciter":"maher"},
 "tasb":{"i":2,"target":33,"count":17,"total":1234},
 "zf":{"d":{},"tc":{"cust":["يا حي يا قيوم"],"sel":None}}}
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');const s=%s;const d=new Date();for(let i=0;i<9;i++){const x=new Date(d);x.setDate(x.getDate()-i);const k=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');s.zf.d[k]={t:[40,120,100,130,33,101,250,90,140][i],tx:{}}}localStorage.setItem('ammar.v1',JSON.stringify(s));localStorage.setItem('ammar.lastSeen','4.7.1');}})()"""%json.dumps(SEED,ensure_ascii=False)
R={'errors':[],'checks':[]}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:300]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:200],flush=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',has_touch=False,service_workers='block' if LOCALZT else 'allow')
  await c.add_init_script(INIT)
  if LOCALZT:
    body=open(LOCALZT,'rb').read()
    async def h(route): await route.fulfill(status=200,body=body,headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
    await c.route('https://zad-content.sites.tab.bot/x/zt.js*',h)
  if FAKECH:
    import time
    now=int(time.time()*1000)
    async def ch(route):
      u=route.request.url
      if 'chal/list' in u: await route.fulfill(status=200,body=json.dumps({'ok':True,'now':now,'items':[{'id':'TESTCH','title':'مليون صلاة على النبي ﷺ','dhikr':'اللهم صل وسلم على نبينا محمد','goal':1000000,'count':5230,'status':'live','starts':now-1000,'ends':now+864e5,'mine':0}]}),headers={'Content-Type':'application/json'})
      else: await route.fulfill(status=200,body=json.dumps({'ok':True,'count':5240,'mine':10}),headers={'Content-Type':'application/json'})
    await c.route('**/api/social/chal/**',ch)
  pg=await c.new_page()
  pg.on('pageerror',lambda e:R['errors'].append(str(e)))
  pg.on('console',lambda m: R['errors'].append('console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text else None)
  async def ev(js): return await pg.evaluate(js)
  async def go(h,w=1500): await ev(f"location.hash='{h}'"); await pg.wait_for_timeout(w)
  async def st(): return await ev("ZTSB._s()")
  async def tapStage(n=1,dy=0):
    await ev("document.querySelector('#zt-stage').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(150)
    bb=await pg.locator('#zt-stage > *').first.bounding_box()
    x=bb['x']+bb['width']/2; y=bb['y']+bb['height']/2
    for i in range(n):
      await pg.mouse.click(x,y,delay=15)
      await pg.wait_for_timeout(25)
  async def swipe(dy=140,dx=0):
    bb=await pg.locator('#zt-stage > *').first.bounding_box()
    x=bb['x']+bb['width']*0.6; y=bb['y']+bb['height']*0.35
    await pg.mouse.move(x,y);await pg.mouse.down()
    for i in range(1,11): await pg.mouse.move(x+dx*i/10,y+dy*i/10); await pg.wait_for_timeout(20)
    await pg.mouse.up(); await pg.wait_for_timeout(400)
  await pg.goto(BASE,wait_until='networkidle',timeout=60000);await pg.wait_for_timeout(2500)
  ck('app version',await ev("APP_VERSION")=='4.7.1',await ev("APP_VERSION"))
  ck('made by',('صُنع بواسطة عمار الشمري' in await ev("document.body.innerText")) or ('صُنع بواسطة عمار الشمري' in await ev("document.documentElement.innerHTML")))
  await go('tasbeeh',3500)
  ck('new tasbih loaded',await ev("!!window.ZTSB&&!!document.querySelector('.zt')"))
  t=await ev("document.querySelector('#view').innerText")
  ck('old count kept (17)','١٧' in await ev("document.querySelector('#zt-n').textContent"),await ev("document.querySelector('#zt-n').textContent"))
  ck('old total kept (1234)','١٢٣٤' in t)
  ck('old custom dhikr kept','يا حي يا قيوم' in t)
  ck('old dhikr selection kept (الله أكبر)','أَكْبَرُ' in await ev("document.querySelector('#zt-dz').textContent"))
  ck('6 style cards',await ev("document.querySelectorAll('.zt-sc').length")==6)
  ck('6 skins',await ev("document.querySelectorAll('.zt-sk').length")==6)
  await pg.screenshot(path=f'{OUT}/s-top.png')
  for k in ['beads','zoom','ring','finger','rose']:
    await ev(f"document.querySelector('.zt-sc[data-st={k}]').click()"); await pg.wait_for_timeout(600)
    n0=(await st())['T']['count']; await tapStage(3); await pg.wait_for_timeout(700); n1=(await st())['T']['count']
    ck(f'style {k} renders+counts by tap',n1-n0==3 and await ev(f"document.querySelector('#zt-stage').dataset.st")==k,(n0,n1))
    await ev("window.scrollTo(0,0)"); await pg.wait_for_timeout(200)
    await ev("document.querySelector('#zt-stage').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{OUT}/style-{k}.png')
    if k in('beads','zoom'):
      n0=(await st())['T']['count']; await swipe(150 if k=='zoom' else 90, 0); n1=(await st())['T']['count']
      ck(f'style {k} counts by swipe',n1>n0,(n0,n1))
  # skins
  await ev("document.querySelector('.zt-sc[data-st=beads]').click()"); await pg.wait_for_timeout(400)
  for sk in ['wood','amber','pearl','yusr','turq','crystal']:
    await ev(f"document.querySelector('.zt-sk[data-sk={sk}]').click()"); await pg.wait_for_timeout(250)
    ck(f'skin {sk}',(await st())['P']['sk']==sk)
    if sk in ('amber','pearl','crystal','yusr','turq'):
      await ev("document.querySelector('#zt-stage').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(350)
      await pg.locator('#zt-stage').screenshot(path=f'{OUT}/skin-{sk}.png')
  await ev("document.querySelector('.zt-sk[data-sk=wood]').click()"); await pg.wait_for_timeout(300)
  # minimal
  await ev("document.querySelector('.zt-sc[data-st=min]').click()"); await pg.wait_for_timeout(500)
  ck('min overlay',await ev("!!document.querySelector('.zt-dark')"))
  n0=(await st())['T']['count']
  for i in range(3): await pg.mouse.click(195,500,delay=20); await pg.wait_for_timeout(60)
  n1=(await st())['T']['count']; ck('min counts taps',n1-n0==3,(n0,n1))
  await pg.screenshot(path=f'{OUT}/style-min.png')
  await pg.mouse.move(195,500); await pg.mouse.down(); await pg.wait_for_timeout(1000); await pg.mouse.up(); await pg.wait_for_timeout(300)
  ck('min long-press locks',await ev("document.querySelector('.zt-dark').classList.contains('locked')"))
  await pg.screenshot(path=f'{OUT}/style-min-locked.png')
  for i in range(3): await pg.mouse.click(195,500,delay=20); await pg.wait_for_timeout(60)
  n2=(await st())['T']['count']; ck('locked ignores taps',n2==n1,(n1,n2))
  await pg.mouse.move(195,500); await pg.mouse.down(); await pg.wait_for_timeout(1000); await pg.mouse.up(); await pg.wait_for_timeout(300)
  ck('long-press unlocks',not await ev("document.querySelector('.zt-dark').classList.contains('locked')"))
  await ev("document.querySelector('.zt-dark .zx').click()"); await pg.wait_for_timeout(300)
  ck('min exit',not await ev("!!document.querySelector('.zt-dark')"))
  # target 33 free
  await ev("document.querySelector('.zt-sc[data-st=ring]').click()"); await pg.wait_for_timeout(300)
  await ev("document.querySelector('[data-tg=\"33\"]').click()"); await pg.wait_for_timeout(400)
  await tapStage(33); await pg.wait_for_timeout(300)
  ck('free target 33 reached',(await st())['T']['count']==33)
  # salah sequence
  await ev("document.querySelector('[data-m=salah]').click()"); await pg.wait_for_timeout(700)
  await ev("document.querySelector('.zt-sc[data-st=ring]').click()"); await pg.wait_for_timeout(300)
  await tapStage(33); s=await st(); ck('salah after 33 -> step 2 (الحمد لله)',s['sq']['s']==1 and s['sq']['n']==0 and 'الْحَمْدُ' in await ev("document.querySelector('#zt-dz').textContent"),s['sq'])
  await tapStage(33); s=await st(); ck('salah after 66 -> step 3 (الله أكبر)',s['sq']['s']==2 and 'أَكْبَرُ' in await ev("document.querySelector('#zt-dz').textContent"),s['sq'])
  await tapStage(33); s=await st(); dz=await ev("document.querySelector('#zt-dz').textContent"); ck('salah after 99 -> tahlil (1)',s['sq']['s']==3 and 'شَرِيكَ' in dz and s['sq']['n']==0,s['sq'])
  await tapStage(1); s=await st(); ck('salah 100 -> done',s['sq']['done']==1 and 'تمّت المئة' in await ev("document.querySelector('#view').innerText"),s['sq'])
  ck('salah virtue Muslim 597 link',await ev("!!document.querySelector('a[href=\"https://sunnah.com/muslim:597\"]')"))
  await ev("document.querySelector('#zt-done').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
  await pg.screenshot(path=f'{OUT}/seq-salah-done.png')
  # sleep
  await ev("document.querySelector('[data-m=sleep]').click()"); await pg.wait_for_timeout(700)
  await tapStage(33); s=await st(); ck('sleep 33 -> step 2',s['sq']['s']==1,s['sq'])
  await tapStage(33); s=await st(); ck('sleep 66 -> step 3 (34)',s['sq']['s']==2 and 'من ٣٤' in await ev("document.querySelector('#zt-t').textContent"),s['sq'])
  await tapStage(33); s=await st(); ck('sleep 99 not yet done',s['sq']['done']==0 and s['sq']['n']==33,s['sq'])
  await tapStage(1); s=await st(); ck('sleep 100 done',s['sq']['done']==1,s['sq'])
  ck('sleep links 5362/3113/2727',await ev("['bukhari:5362','bukhari:3113','muslim:2727'].every(k=>!!document.querySelector('a[href=\"https://sunnah.com/'+k+'\"]'))"))
  await ev("window.scrollTo(0,0)"); await pg.wait_for_timeout(300); await pg.screenshot(path=f'{OUT}/seq-sleep.png')
  # mid-sequence persistence
  await ev("document.querySelector('[data-m=salah]').click()"); await pg.wait_for_timeout(500)
  await tapStage(1)  # restart from done
  await tapStage(39); s=await st(); tot=s['T']['total']
  await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(2500)
  await go('tasbeeh',3000); s2=await st()
  ck('reload keeps sequence position',s2['sq']['s']==1 and s2['sq']['n']==7 and s2['P']['mode']=='salah',s2['sq'])
  ck('reload keeps lifetime total',s2['T']['total']==tot,(tot,s2['T']['total']))
  # challenge
  await ev("document.querySelector('[data-m=chal]').click()"); await pg.wait_for_timeout(500)
  await ev("document.querySelector('#zt-go').click()"); await pg.wait_for_timeout(3000)
  ck('challenge running',(await st())['ch']['on'])
  await tapStage(12); await pg.wait_for_timeout(300)
  await pg.screenshot(path=f'{OUT}/chal-run.png')
  await ev("ZTSB._s().ch.end=Date.now()"); await pg.wait_for_timeout(600)
  s=await st(); ck('challenge result + best',not s['ch']['on'] and s['P']['best']>=12,s['P']['best'])
  await ev("document.querySelector('#zt-chal').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(2500)
  await pg.screenshot(path=f'{OUT}/chal-res.png')
  # free + adhkar sheet + virtue
  await ev("document.querySelector('[data-m=free]').click()"); await pg.wait_for_timeout(500)
  await ev("document.querySelector('#zt-adh').click()"); await pg.wait_for_timeout(500)
  n=await ev("document.querySelectorAll('.zt-sheet .zt-ai').length"); links=await ev("[...document.querySelectorAll('.zt-sheet a')].map(a=>a.href)")
  ck('adhkar sheet 6 verified items',n==6,(n,links))
  await pg.screenshot(path=f'{OUT}/adhkar.png')
  await ev("document.querySelector('.zt-sheet [data-k=p5]').click()"); await pg.wait_for_timeout(500)
  s=await st(); ck('pick سبحان الله وبحمده sets target 100',s['T']['target']==100 and s['X']['sel']=='p5',(s['T']['target'],s['X']['sel']))
  # stats
  t=await ev("document.querySelector('.zt-stats').innerText"); ck('stats streak/total/charts','أيام متتالية' in t and 'المجموع الكلي' in t and await ev("document.querySelectorAll('.zt-ch rect').length")==7)
  await ev("document.querySelector('[data-ch=\"30\"]').click()"); await pg.wait_for_timeout(200)
  ck('30-day chart',await ev("document.querySelectorAll('.zt-ch rect').length")==30)
  await ev("document.querySelector('.zt-stats').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
  await pg.screenshot(path=f'{OUT}/stats.png')
  await ev("document.querySelector('#zt-share').click()"); await pg.wait_for_timeout(1800)
  ck('share card drawn',await ev("(()=>{const c=document.querySelector('#zt-shc');return c&&c.width===1080})()"))
  await pg.screenshot(path=f'{OUT}/share.png')
  await ev("document.querySelector('#zt-shx').click()"); await pg.wait_for_timeout(300)
  # milestone celebration
  await ev("ZTSB._s().T.total=9998;"); await tapStage(3); await pg.wait_for_timeout(700)
  ck('milestone celebration 10000',await ev("!!document.querySelector('.zt-cel')"),await ev("(document.querySelector('.zt-cel')||{}).innerText"))
  await pg.screenshot(path=f'{OUT}/celebrate.png')
  await pg.wait_for_timeout(4500)
  # keyboard
  n0=(await st())['T']['count']; await pg.mouse.click(5,5); await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown'); n1=(await st())['T']['count']
  ck('keyboard/BT clicker counts',n1-n0==2,(n0,n1))
  if FAKECH:
    await go('home',800); await go('tasbeeh',2500)
    ck('group card visible',await ev("!document.querySelector('#zt-grp').hidden"),await ev("(document.querySelector('#zt-grp')||{}).innerText"))
    await ev("document.querySelector('#zt-gon').click()"); await pg.wait_for_timeout(500)
    await tapStage(10); s=await st(); ck('group queue',s['P']['chq'].get('TESTCH',0)==10 or s['P']['chq'].get('TESTCH',0)==0,s['P']['chq'])
    await ev("document.querySelector('#zt-grp').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(5800)
    s=await st(); ck('group flush after 5s',s['P']['chq'].get('TESTCH',0)==0,s['P']['chq'])
    await pg.screenshot(path=f'{OUT}/group.png')
  # SW
  if not LOCALZT:
    await pg.wait_for_timeout(1500)
    sw=await ev("caches.keys()"); ck('sw cache ammar-v4-7-1','ammar-v4-7-1' in sw,sw)
  # hub badge
  await go('sec/adhkar',1500); ck('hub shows tasbih with جديد',await ev("[...document.querySelectorAll('.zs-card')].some(c=>c.innerText.includes('السبحة')&&c.querySelector('.zs-new'))"))
  await go('whatsnew',1500); t=await ev("document.querySelector('#view').innerText"); ck('whatsnew top entry','سبحة جديدة: ٦ أشكال وطرق عدّ ومسابقات' in t[:600],t[:200])
  R['errors']=[e for e in R['errors']]
  ck('no page errors',not R['errors'],R['errors'][:5])
  json.dump(R,open(f'{OUT}/result.json','w'),ensure_ascii=False,indent=1)
  await b.close()
asyncio.run(main())
