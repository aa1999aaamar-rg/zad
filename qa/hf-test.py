
# زاد v5.2 QA: python3 qa/hf-test.py BASE OUTDIR [LOCAL_CONTENT_DIR|-]
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
os.makedirs(OUT,exist_ok=True); VER='5.2.0'
R={'errors':[],'checks':[]}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:300]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:200],flush=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
def INIT(th,seen): return """(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(dict(SEED,settings=dict(SEED['settings'],theme=th)),ensure_ascii=False),seen)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow',has_touch=True)
    await c.add_init_script(INIT('light',VER))
    if LOCAL:
      async def h(route):
        pth=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,pth)
        if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/json' if fp.endswith('.json') else 'application/javascript','Access-Control-Allow-Origin':'*'})
        else: await route.continue_()
      hx=h
      await c.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),h)
    await c.route(re.compile(r'.*/api/social/ref/reg.*'),lambda r: r.fulfill(status=200,body='{"ok":true,"n":0}',headers={'content-type':'application/json'}))
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and not re.search(r'Failed to load resource|net::|favicon|status of 4|status of 5|youtube|soundcloud|drive\.google|docs\.google|gstatic|Content Security|frame-ancestors|ERR_',m.text)) and R['errors'].append('console: '+m.text[:300]))
    async def go(h,w=1000):
      await pg.evaluate("h=>{location.hash=h}",h); await pg.wait_for_timeout(w)
    async def shot(n): await pg.screenshot(path=os.path.join(OUT,n+'.png'))
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(4000)
    if not LOCAL:
      sw=await pg.evaluate("async()=>{const r=await navigator.serviceWorker.getRegistration();for(let i=0;i<20&&!(r&&r.active);i++)await new Promise(x=>setTimeout(x,500));return (await caches.keys()).join(',')}")
      ck('sw ammar-v5-2-0','ammar-v5-2-0' in sw,sw)
    ck('APP_VERSION 5.2.0',await pg.evaluate("typeof APP_VERSION!=='undefined'&&APP_VERSION")=='5.2.0')
    n=await pg.evaluate("[...document.querySelectorAll('#tabs.zs7 .in > a')].map(a=>a.dataset.tab).join(',')")
    ck('bar 5 slots',n=='home,quran,more,adhkar,diwan',n)
    ck('home tab active + pill',await pg.evaluate("document.querySelector('#tabs a.on')?.dataset.tab==='home'&&getComputedStyle(document.querySelector('.zs7pill')).opacity==='1'"))
    ck('diwan unread dot kept',await pg.evaluate("!!document.querySelector('#tabs [data-b6unread]')"))
    ck('home library card',await pg.evaluate("!!document.querySelector('#zb6home a.hf[href=\"#hufaz\"]')"))
    await shot('01-home')
    await pg.evaluate("window.scrollTo(0,600)"); await pg.wait_for_timeout(250); await pg.evaluate("window.scrollTo(0,1200)"); await pg.wait_for_timeout(500)
    ck('bar hides on scroll down',await pg.evaluate("document.getElementById('tabs').classList.contains('hid')"))
    await pg.evaluate("window.scrollTo(0,1100)"); await pg.wait_for_timeout(200); await pg.evaluate("window.scrollTo(0,900)"); await pg.wait_for_timeout(500)
    ck('bar shows on scroll up',await pg.evaluate("!document.getElementById('tabs').classList.contains('hid')"))
    await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(300)
    await pg.click('#tabs a.ctr'); await pg.wait_for_timeout(500)
    links=await pg.evaluate("[...document.querySelectorAll('#zs7sh.on .g a')].map(a=>a.getAttribute('href')).join(' ')")
    ck('more sheet opens with the rest',all(x in links for x in ['#sec/prayer','#sections','#hufaz','#dorous']),links)
    await shot('02-sheet')
    await pg.click('#zs7sh .g a[href="#sec/prayer"]'); await pg.wait_for_timeout(900)
    ck('sheet → prayer hub, centre marked',await pg.evaluate("location.hash==='#sec/prayer'&&document.querySelector('#tabs a.ctr').classList.contains('on')&&!document.getElementById('zs7sh').classList.contains('on')"))
    await go('#sec/quran',900)
    ck('quran hub lists library',await pg.evaluate("!!document.querySelector('#view a[href=\"#hufaz\"]')"))
    # swipe: on quran tab, swipe right -> next (adhkar)
    await pg.evaluate("""()=>{const el=document.querySelector('#view h1')||document.getElementById('view');const mk=(t,x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});el.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[mk('s',100,400)],changedTouches:[mk('s',100,400)]}));el.dispatchEvent(new TouchEvent('touchend',{bubbles:true,touches:[],changedTouches:[mk('e',260,410)]}))}""")
    await pg.wait_for_timeout(800)
    ck('swipe between tabs',await pg.evaluate("location.hash")=='#sec/adhkar',await pg.evaluate("location.hash"))
    await go('#hufaz',2500)
    t=await pg.evaluate("document.getElementById('view').innerText")
    ck('library home: source line','المصدر: مجلد زاد الحفاظ على Google Drive' in t)
    nc=await pg.evaluate("document.querySelectorAll('.h8cat').length"); ck('library categories',nc>=14,nc)
    await shot('03-library')
    await pg.click('.h8cat[href="#hufaz/c/khitat"]'); await pg.wait_for_timeout(700)
    ck('category drill-down',await pg.evaluate("document.querySelectorAll('.h8it').length")>=5)
    await shot('04-category')
    await pg.click('.h8it[href^="#hufaz/d/"]'); await pg.wait_for_timeout(700)
    fid=await pg.evaluate("(document.querySelector('.h8it[href^=\"#hufaz/f/\"]')||{}).getAttribute&&document.querySelector('.h8it[href^=\"#hufaz/f/\"]').getAttribute('href')")
    ck('folder has files',bool(fid),fid)
    await pg.click('.h8it[href^="#hufaz/f/"] .h8fav'); await pg.wait_for_timeout(300)
    ck('favourite ♡ saved',await pg.evaluate("S.zb8.fav.length")==1)
    await pg.click('.h8it[href^="#hufaz/f/"]'); await pg.wait_for_timeout(1000)
    src=await pg.evaluate("(document.getElementById('h8fr')||{}).src||''"); ck('preview iframe drive /preview',re.search(r'drive\.google\.com/file/d/[\w-]+/preview',src),src)
    ok=False
    for i in range(24):
      fr=[f for f in pg.frames if 'drive.google.com/file/d/' in f.url]
      if fr:
        try:
          ln=await fr[0].evaluate("document.body?document.body.innerText.length+document.querySelectorAll('img,canvas,embed,div').length:0")
          if ln>20: ok=True;break
        except Exception as e: pass
      await pg.wait_for_timeout(500)
    ck('iframe loaded Drive preview',ok)
    ck('open in drive button',await pg.evaluate("!![...document.querySelectorAll('.h8acts a')].find(a=>/drive\.google\.com\/file\/d\/.+\/view/.test(a.href)&&a.textContent.includes('فتح في درايف'))"))
    await pg.wait_for_timeout(2500); await shot('05-preview')
    await go('#hufaz/fav',900); ck('favourites page',await pg.evaluate("document.querySelectorAll('.h8it').length")==1); 
    await go('#hufaz',1200); ck('recent opened',await pg.evaluate("document.querySelectorAll('.h8row .h8chip').length")>=1)
    await go('#hufaz/q/'+'متشابهات البقرة',1200)
    nr=await pg.evaluate("document.querySelectorAll('#h8res .h8it').length"); ck('search across titles',nr>=3,nr); await shot('06-search')
    await go('#hufaz/q/doc',600)
    await go('#hufaz/f/1-5xomOkZ4WgQ4BO8INMo1kh8LDIg594uCq964pay6xo',1000)
    src=await pg.evaluate("(document.getElementById('h8fr')||{}).src||''"); ck('google doc uses docs preview','docs.google.com/document/d/' in src and src.endswith('/preview'),src)
    await go('#read/s/2',2500)
    ck('reader has «ملفات السورة»',await pg.evaluate("!!document.getElementById('zb8sur')"))
    await shot('07-reader-chip')
    await pg.click('#zb8sur'); await pg.wait_for_timeout(1600)
    hh=await pg.evaluate("location.hash+' '+(document.querySelector('#view h1')||{}).textContent"); ck('surah files (البقرة)','#hufaz/s/2' in hh and 'البقرة' in hh,hh)
    await shot('08-surah')
    await go('#hufaz/s/80',1200); hh=await pg.evaluate("(document.querySelector('#view h1')||{}).textContent+'|'+document.querySelectorAll('.h8it').length+'|'+document.getElementById('view').innerText.slice(0,400)")
    ck('group surah (عبس) files',('عبس' in hh) and ('مدارسة سورة عبس' in hh),hh[:160])
    await go('#hifz',1500); ck('hifz page → plans card',await pg.evaluate("!!document.querySelector('#zb8plan[href=\"#hufaz/plans\"]')")); await shot('09-hifz')
    await go('#whatsnew',1000); ck('whatsnew top entry',await pg.evaluate("document.getElementById('view').innerText.includes('مكتبة الحفّاظ — مصاحف وخطط حفظ وكتب المتشابهات مرتبة')"))
    # every main route still renders
    bad=[]
    for r in ['#home','#sec/quran','#sec/prayer','#sec/adhkar','#diwan','#sections','#dorous','#adhkar','#tasbeeh','#prayer','#qibla','#settings','#natiq','#rihla','#search','#hufaz/suwar','#adksearch','#halaqa']:
      await go(r,1300); l=await pg.evaluate("document.getElementById('view').innerText.trim().length")
      if l<20: bad.append(r)
    ck('existing routes render',not bad,bad)
    await go('#home',1500)
    await c.close()
    c2=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block')
    await c2.add_init_script(INIT('dark',VER))
    if LOCAL: await c2.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),hx)
    await c2.route(re.compile(r'.*/api/social/ref/reg.*'),lambda r: r.fulfill(status=200,body='{"ok":true,"n":0}',headers={'content-type':'application/json'}))
    p2=await c2.new_page(); p2.on('pageerror',lambda e:R['errors'].append('pageerror(dark): '+str(e)[:300]))
    await p2.goto(BASE+'/#home',wait_until='load'); await p2.wait_for_timeout(3500); await p2.screenshot(path=os.path.join(OUT,'10-dark.png'))
    await p2.evaluate("location.hash='#hufaz'"); await p2.wait_for_timeout(2500); await p2.screenshot(path=os.path.join(OUT,'11-dark-lib.png'))
    await b.close()
  ck('no page errors',not R['errors'],R['errors'][:5])
  json.dump(R,open(os.path.join(OUT,'results.json'),'w'),ensure_ascii=False,indent=1)
  print('TOTAL',sum(x['ok'] for x in R['checks']),'/',len(R['checks']))
asyncio.run(main())
