
import json,sys,asyncio
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]; LOCALZT=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"jeddah","cityUser":True,"rep":3,"reciter":"maher"},
 "tasb":{"i":2,"target":33,"count":17,"total":1234},
 "zf":{"d":{},"tc":{"cust":["يا حي يا قيوم","أستغفر الله العظيم"],"sel":"c0"}}}
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');const s=%s;const d=new Date();for(let i=0;i<9;i++){const x=new Date(d);x.setDate(x.getDate()-i);const k=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');s.zf.d[k]={t:[40,120,100,130,33,101,250,90,140][i],tx:i==1?{"يا حي يا قيوم":21}:{}}}localStorage.setItem('ammar.v1',JSON.stringify(s));localStorage.setItem('ammar.lastSeen','4.7.2');}})()"""%json.dumps(SEED,ensure_ascii=False)
R={'errors':[],'checks':[]}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:300]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:200],flush=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',has_touch=False,service_workers='block' if LOCALZT else 'allow')
  await c.add_init_script(INIT)
  if LOCALZT:
    body=open(LOCALZT,'rb').read()
    async def h(route): await route.fulfill(status=200,body=body,headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
    await c.route('https://zad-content.sites.tab.bot/x/zt.js*',h)
  pg=await c.new_page()
  pg.on('pageerror',lambda e:R['errors'].append(str(e)))
  pg.on('console',lambda m: R['errors'].append('console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text else None)
  pg.on('dialog',lambda d: (R['errors'].append('dialog:'+d.message), asyncio.ensure_future(d.dismiss())))
  async def ev(js): return await pg.evaluate(js)
  async def go(h,w=1500): await ev(f"location.hash='{h}'"); await pg.wait_for_timeout(w)
  async def st(): return await ev("(()=>{const s=ZTSB._s();return JSON.parse(JSON.stringify({T:{count:s.T.count,target:s.T.target,total:s.T.total},X:s.X}))})()")
  async def shot(n,full=False): await pg.screenshot(path=f'{OUT}/{n}.png',full_page=full)
  async def tapStage(n=1):
    await ev("document.querySelector('#zt-stage').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(150)
    bb=await pg.locator('#zt-stage > *').first.bounding_box()
    x=bb['x']+bb['width']/2; y=bb['y']+bb['height']/2
    for i in range(n):
      await pg.mouse.click(x,y,delay=10); await pg.wait_for_timeout(20)
  async def nownm():
    await ev("(()=>{const w=document.getElementById('wnm');if(w){window.__wn=(w.textContent||'').slice(0,160);w.remove()}document.querySelectorAll('.wnbd,#wnbd').forEach(e=>e.remove())})()")
  await pg.goto(BASE+'/',wait_until='networkidle'); await pg.wait_for_timeout(1500); await nownm()
  await go('tasbeeh',3500)
  await ev("(()=>{const s=ZTSB._s();s.P.mode='free';s.P.st='ring'})()"); await go('home',500); await go('tasbeeh',2000)
  s=await st(); my=s['X']['my']
  ck('migrate: X.cust strings became objects',len(my)==2 and my[0]['t']=='يا حي يا قيوم' and my[1]['t']=='أستغفر الله العظيم',[m['t'] for m in my])
  ck('migrate: selected old custom keeps count/target',s['X']['sel']=='u:'+my[0]['id'] and my[0]['c']==17 and my[0]['n']==33 and s['T']['count']==17,(s['X']['sel'],my[0]))
  ck('migrate: old history total carried',my[0]['tot']==21,my[0]['tot'])
  ck('mirror X.cust',s['X']['cust']==['يا حي يا قيوم','أستغفر الله العظيم'])
  ck('my list rendered',await ev("document.querySelectorAll('.zt-mi').length")==2)
  ck('custom in chips',await ev("[...document.querySelectorAll('#zt-chips .zchip')].some(b=>b.textContent.includes('أستغفر الله العظيم'))"))
  day0=await ev("(()=>{const k=ZF.day();return (ZF.F.d[k]&&ZF.F.d[k].t)||0})()")
  # add sheet
  await pg.click('#zt-add'); await pg.wait_for_timeout(500)
  ck('add sheet opens (no prompt)',await ev("!!document.querySelector('.zt-sheet #zt-af')"))
  await pg.fill('#zt-at','اللهم اغفر لي ولوالدي')
  await pg.click('.zt-tgc [data-n="c"]'); await pg.fill('.zt-numin','50'); await pg.fill('#zt-an','بنية بر الوالدين')
  await pg.wait_for_timeout(200); await shot('a-add')
  await pg.click('#zt-as'); await pg.wait_for_timeout(900)
  s=await st(); my=s['X']['my']; nw=[m for m in my if m['t']=='اللهم اغفر لي ولوالدي']
  ck('added with target 50 + note',len(nw)==1 and nw[0]['n']==50 and nw[0]['note']=='بنية بر الوالدين' and s['T']['target']==50 and s['T']['count']==0 and s['X']['sel']=='u:'+nw[0]['id'],nw)
  nid=nw[0]['id']
  await tapStage(50); await pg.wait_for_timeout(600)
  s=await st(); m=[x for x in s['X']['my'] if x['id']==nid][0]
  ck('counted to 50',s['T']['count']==50 and m['c']==50 and m['tot']==50,(s['T']['count'],m))
  ck('target flash shown','٥٠' in (await ev("document.querySelector('#zt-flash').textContent")))
  day1=await ev("(()=>{const k=ZF.day();return (ZF.F.d[k]&&ZF.F.d[k].t)||0})()")
  ck('daily stats include custom',day1-day0==50,(day0,day1))
  await ev("window.scrollTo(0,0)"); await pg.wait_for_timeout(300); await shot('b-count')
  # switch away & back keeps per-dhikr count
  await ev("document.querySelector('#zt-chips [data-k^=\"p\"]').click()"); await pg.wait_for_timeout(500)
  await ev(f"document.querySelector('.zt-mi[data-id=\"{nid}\"]').click()"); await pg.wait_for_timeout(500)
  s=await st(); ck('per-dhikr count restored on re-select',s['T']['count']==50 and s['T']['target']==50,s['T'])
  # edit via ⋯
  await ev(f"document.querySelector('[data-mn=\"{nid}\"]').scrollIntoView({{block:'center'}})"); await pg.click(f'[data-mn="{nid}"]'); await pg.wait_for_timeout(500)
  await shot('c-menu')
  await pg.click('#zt-mn [data-a="ed"]'); await pg.wait_for_timeout(500)
  await pg.fill('#zt-at','اللهم اغفر لي ولوالدي وللمؤمنين'); await pg.click('#zt-as'); await pg.wait_for_timeout(700)
  s=await st(); m=[x for x in s['X']['my'] if x['id']==nid][0]
  ck('edit saved, count kept',m['t']=='اللهم اغفر لي ولوالدي وللمؤمنين' and m['c']==50 and m['n']==50,m)
  # reorder up twice (index 2 -> 0)
  for i in range(2):
    await ev(f"document.querySelector('[data-mn=\"{nid}\"]').click()"); await pg.wait_for_timeout(400)
    await pg.click('#zt-mn [data-a="up"]'); await pg.wait_for_timeout(500)
  s=await st(); ck('reorder: moved to top',s['X']['my'][0]['id']==nid and s['X']['cust'][0]==m['t'] or s['X']['my'][0]['id']==nid,[x['t'] for x in s['X']['my']])
  # move down once
  await ev(f"document.querySelector('[data-mn=\"{nid}\"]').click()"); await pg.wait_for_timeout(400)
  await pg.click('#zt-mn [data-a="dn"]'); await pg.wait_for_timeout(500)
  s=await st(); ck('reorder: move down',s['X']['my'][1]['id']==nid,[x['t'] for x in s['X']['my']])
  # long press opens menu
  await ev(f"document.querySelector('.zt-mi[data-id=\"{nid}\"]').scrollIntoView({{block:'center'}})"); await pg.wait_for_timeout(200)
  bb=await pg.locator(f'.zt-mi[data-id="{nid}"] .tx').bounding_box()
  await pg.mouse.move(bb['x']+40,bb['y']+10); await pg.mouse.down(); await pg.wait_for_timeout(800); await pg.mouse.up(); await pg.wait_for_timeout(300)
  ck('long-press opens menu',await ev("!!document.querySelector('#zt-mn')"))
  await ev("document.querySelector('#zt-mx').click()"); await pg.wait_for_timeout(300)
  await ev("window.scrollTo(0,document.querySelector('#zt-my').getBoundingClientRect().top+scrollY-120)"); await pg.wait_for_timeout(300); await shot('d-list')
  # reload persistence
  order=[x['id'] for x in s['X']['my']]
  await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(1500); await nownm(); await go('tasbeeh',3000)
  s=await st(); m=[x for x in s['X']['my'] if x['id']==nid]
  ck('persists across reload',[x['id'] for x in s['X']['my']]==order and m and m[0]['c']==50 and m[0]['n']==50 and m[0]['t'].endswith('وللمؤمنين'),[x['t'] for x in s['X']['my']])
  # picker
  await ev("document.querySelector('#zt-pk2').click()"); await pg.wait_for_timeout(600)
  tot=await ev("document.querySelectorAll('.zt-pi').length")
  await pg.fill('#zt-pq','سبحان الله وبحمده'); await pg.wait_for_timeout(500)
  hits=await ev("[...document.querySelectorAll('.zt-pi .dz')].map(e=>e.textContent)")
  import re
  def nrm(t): return re.sub(r'[\u064B-\u065F\u0670\u0640]','',t)
  ck('picker search finds «سبحان الله وبحمده»',len(hits)>0 and any('سبحان الله وبحمده' in nrm(h) for h in hits),(tot,len(hits),hits[:2]))
  await shot('e-picker')
  await pg.fill('#zt-pq','استغفر'); await pg.wait_for_timeout(400)
  ck('picker word search 2',await ev("document.querySelectorAll('.zt-pi').length")>0)
  await pg.fill('#zt-pq','سبحان الله وبحمده'); await pg.wait_for_timeout(400)
  want=await ev("(()=>{const b=[...document.querySelectorAll('.zt-pi')].find(e=>e.querySelector('.dz').textContent.replace(/[\\u064B-\\u065F\\u0670\\u0640]/g,'').trim().startsWith('سبحان الله وبحمده'));return b?[b.querySelector('.dz').textContent,b.querySelector('[data-pi]').textContent]:null})()")
  await ev("(()=>{const b=[...document.querySelectorAll('.zt-pi')].find(e=>e.querySelector('.dz').textContent.replace(/[\\u064B-\\u065F\\u0670\\u0640]/g,'').trim().startsWith('سبحان الله وبحمده'))||document.querySelector('.zt-pi');b.querySelector('[data-pi]').click()})()"); await pg.wait_for_timeout(800)
  s=await st(); pk=[x for x in s['X']['my'] if x.get('src')]
  ck('picker item starts counting with its stated number',len(pk)==1 and s['X']['sel']=='u:'+pk[0]['id'] and s['T']['target']==pk[0]['n'] and pk[0]['n']>=1,(want,pk[:1],s['T']))
  await tapStage(3); s=await st(); ck('picked dhikr counts',s['T']['count']==3)
  await ev("window.scrollTo(0,0)"); await pg.wait_for_timeout(300); await shot('f-picked')
  # delete test items (confirm)
  for mid in [nid,pk[0]['id']]:
    await ev(f"document.querySelector('[data-mn=\"{mid}\"]').click()"); await pg.wait_for_timeout(400)
    await pg.click('#zt-mn [data-a="del"]'); await pg.wait_for_timeout(300)
    if mid==nid: await shot('g-confirm')
    ck('delete asks to confirm',await ev("!document.querySelector('#zt-cf').hidden"))
    await pg.click('#zt-cy'); await pg.wait_for_timeout(500)
  await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(1500); await nownm(); await go('tasbeeh',3000)
  s=await st(); ck('deleted, persists after reload',[x['t'] for x in s['X']['my']]==['يا حي يا قيوم','أستغفر الله العظيم'] and s['X']['cust']==['يا حي يا قيوم','أستغفر الله العظيم'],[x['t'] for x in s['X']['my']])
  # other tasbih modes still fine
  await ev("document.querySelector('[data-m=\"salah\"]').click()"); await pg.wait_for_timeout(600); await tapStage(33); s2=await ev("ZTSB._s().sq"); ck('salah sequence still advances',s2 and s2['s']==1,s2)
  await ev("document.querySelector('[data-m=\"free\"]').click()"); await pg.wait_for_timeout(500)
  # old routes
  for h in ['home','adhkar','quran','hubs','duas']:
    await go(h,900)
  if not LOCALZT:
    sv=await ev("caches.keys()"); ck('sw cache ammar-v4-7-2',any('ammar-v4-7-2' in k for k in sv),sv)
    ck('whats-new top entry',await ev("CL[0][2][0]")=='أضف أي ذكر تبيه بالعدد اللي تبيه، وعدّل ورتّب أذكارك')
    ck('APP_VERSION 4.7.2',await ev("typeof APP_VERSION!=='undefined'&&APP_VERSION")=='4.7.2')
  ck('no page errors',not R['errors'],R['errors'][:5])
  json.dump(R,open(OUT+'/r.json','w'),ensure_ascii=False,indent=1)
  await b.close()
asyncio.run(main())
