# زاد v5.3 QA: python3 qa/z9-test.py BASE OUTDIR [LOCAL_CONTENT_DIR|-] [stub]
import json,sys,asyncio,os,re,base64,time
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None; STUB=len(sys.argv)>4
os.makedirs(OUT,exist_ok=True); VER='5.3.0'
R={'errors':[],'checks':[],'timings':{}}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:400]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:300],flush=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow',has_touch=True)
    try: await c.grant_permissions(['clipboard-read','clipboard-write'],origin=BASE)
    except Exception as e: print('perm',e)
    await c.add_init_script(INIT)
    if LOCAL:
      async def h(route):
        pth=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,pth)
        if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/json' if fp.endswith('.json') else 'application/javascript','Access-Control-Allow-Origin':'*'})
        else: await route.continue_()
      await c.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),h)
    if STUB:
      SJ=json.load(open(os.path.join(os.path.dirname(__file__),'dorar-stub.json')))
      async def hs(route):
        from urllib.parse import urlparse,parse_qs,unquote
        q=parse_qs(urlparse(route.request.url).query).get('q',[''])[0]
        d=SJ.get('f' if 'الصين' in q else 'n')
        await route.fulfill(status=200,body=json.dumps(d,ensure_ascii=False),headers={'content-type':'application/json'})
      await c.route(re.compile(r'.*/api/dorar\?.*'),hs)
    await c.route(re.compile(r'.*/api/social/ref/reg.*'),lambda r: r.fulfill(status=200,body='{"ok":true,"n":0}',headers={'content-type':'application/json'}))
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and not re.search(r'Failed to load resource|net::|favicon|status of 4|status of 5|youtube|soundcloud|drive\.google|docs\.google|gstatic|Content Security|frame-ancestors|ERR_|dorar|googletag|google-analytics|doubleclick|facebook|cloudflare|Permissions policy|third-party',m.text)) and R['errors'].append('console: '+m.text[:300]))
    async def go(h,w=1200):
      await pg.evaluate("h=>{location.hash=h}",h); await pg.wait_for_timeout(w)
    async def shot(n): await pg.screenshot(path=os.path.join(OUT,n+'.png'))
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(4500)
    if not LOCAL:
      sw=await pg.evaluate("async()=>{const r=await navigator.serviceWorker.getRegistration();for(let i=0;i<20&&!(r&&r.active);i++)await new Promise(x=>setTimeout(x,500));return (await caches.keys()).join(',')}")
      ck('sw ammar-v5-3-0','ammar-v5-3-0' in sw,sw)
    ck('APP_VERSION 5.3.0',await pg.evaluate("typeof APP_VERSION!=='undefined'&&APP_VERSION")=='5.3.0')
    n=await pg.evaluate("[...document.querySelectorAll('#tabs.zs7 .in > a')].map(a=>a.dataset.tab).join(',')")
    ck('v5.2 bar intact (5 slots)',n=='home,quran,more,adhkar,diwan',n)
    ck('home cards: hufaz + balligh + dorar + hcheck',await pg.evaluate("['hufaz','balligh','dorar','hcheck'].every(r=>!!document.querySelector('#zb6home a[href=\"#'+r+'\"]'))"))
    await shot('01-home')
    await pg.click('#tabs a.ctr'); await pg.wait_for_timeout(600)
    links=await pg.evaluate("[...document.querySelectorAll('#zs7sh.on .g a')].map(a=>a.getAttribute('href')).join(' ')")
    ck('more sheet: new + old entries',all(x in links for x in ['#balligh','#dorar','#hcheck','#hufaz','#dorous','#sec/prayer','#settings']),links)
    await shot('02-sheet')
    await pg.keyboard.press('Escape'); await go('#home',600)
    # whatsnew popup content
    cl=await pg.evaluate("typeof CL!=='undefined'?CL[0][0]+' '+CL[0][2][0]:''")
    ck('whatsnew top entry 5.3.0',cl.startswith('5.3.0'),cl)
    # 1) dorar hub
    await go('#dorar',2500)
    k=await pg.evaluate("document.querySelectorAll('#view .z9ec').length"); ck('dorar hub cards',k>=15,k)
    ck('dorar credit line',await pg.evaluate("document.querySelector('#view .z9src')?.textContent.includes('dorar.net')"))
    await shot('03-dorar')
    await go('#dorar/e/hadith',1000)
    ok=await pg.evaluate("!!document.querySelector('#z9ov iframe[src=\"https://dorar.net/hadith\"]')"); ck('encyclopedia opens full-screen viewer',ok)
    t0=time.time(); loaded=False
    for i in range(40):
      fr=[f for f in pg.frames if 'dorar.net' in f.url]
      if fr:
        try:
          tt=await fr[0].evaluate("document.title"); 
          if tt: loaded=tt; break
        except Exception: pass
      await pg.wait_for_timeout(500)
    R['timings']['iframe_s']=round(time.time()-t0,1); ck('dorar page renders inside the iframe',bool(loaded),loaded)
    await pg.wait_for_timeout(2500); await shot('04-dorar-viewer')
    await pg.click('#z9ov [data-x]'); await pg.wait_for_timeout(1000)
    ck('viewer closes',await pg.evaluate("!document.getElementById('z9ov')"))
    # 2) hadith checker
    for nm,q,want in [('sahih','إنما الأعمال بالنيات','g'),('fabricated','اطلبوا العلم ولو في الصين','r')]:
      t0=time.time(); await go('#hcheck/'+q,300)
      for i in range(60):
        st=await pg.evaluate("(()=>{const o=document.getElementById('z9out');if(!o)return'';if(o.querySelector('.z9r'))return'done';return''})()")
        if st: break
        await pg.wait_for_timeout(250)
      R['timings']['check_'+nm+'_s']=round(time.time()-t0,2)
      info=await pg.evaluate("(()=>{const rs=[...document.querySelectorAll('#z9out .z9r')];return {n:rs.length,first:rs[0]?.querySelector('.z9gr')?.textContent||rs[0]?.textContent.slice(0,120),cls:rs.map(r=>r.classList.contains('g')?'g':r.classList.contains('r')?'r':'a').join(''),src:rs[0]?.querySelector('dl')?.textContent.slice(0,160),more:!!document.querySelector('#z9out .z9more')}})()")
      R['timings']['check_'+nm]=info
      ck('checker '+nm+' results',info['n']>=1 and want in info['cls'],info)
      await shot('05-check-'+nm)
    ck('checker shows «ابحث في الدرر»',info['more'])
    api=await pg.evaluate("async q=>{const t=performance.now();const r=await fetch('/api/dorar?q='+encodeURIComponent(q));const j=await r.json();return {s:r.status,ok:j.ok,via:j.via,n:j.n,cache:j.cache,ms:j.ms,cms:Math.round(performance.now()-t),err:j.error,detail:j.detail}}","من كان يؤمن بالله واليوم الآخر فليقل خيرا")
    R['timings']['api_direct']=api; print('api',api)
    # 3) balligh
    await go('#balligh',2500)
    n=await pg.evaluate("document.querySelectorAll('#view .z9it').length"); ck('balligh items',n>=120,n)
    ck('daily card',await pg.evaluate("!!document.querySelector('#view .z9day .tx')"))
    await shot('06-balligh')
    await pg.click('.z9day [data-d="h"]'); await pg.wait_for_timeout(600)
    ck('حديث اليوم toggle',await pg.evaluate("document.querySelector('.z9day .tx').classList.contains('h')"))
    await go('#balligh/t/'+'الصبر',800); n2=await pg.evaluate("document.querySelectorAll('#view .z9it').length"); ck('topic chip filter',0<n2<n,n2)
    await go('#balligh/q/'+'الوالدين',800); n3=await pg.evaluate("document.querySelectorAll('#view .z9it').length"); ck('search',n3>=1,n3)
    await go('#balligh/i/q2_153',2500)
    ck('card canvas drawn',await pg.evaluate("(()=>{const c=document.getElementById('z9cv');const d=c.getContext('2d').getImageData(540,540,1,1).data;return c.width===1080&&d[3]===255})()"))
    async def savecv(name):
      await pg.wait_for_timeout(1200)
      d=await pg.evaluate("document.getElementById('z9cv').toDataURL('image/png')")
      open(os.path.join(OUT,name),'wb').write(base64.b64decode(d.split(',')[1]))
    await savecv('card-v-zad-sq.png'); await shot('07-item-zad')
    await pg.click('.z9tp [data-t="teal"]'); await pg.click('.z9seg [data-s="st"]'); await pg.wait_for_timeout(500)
    ck('story size 1080x1920',await pg.evaluate("document.getElementById('z9cv').height")==1920)
    await savecv('card-v-teal-story.png'); await shot('08-item-teal-story')
    await go('#balligh/i/bukhari_6094',2000); await pg.click('.z9tp [data-t="night"]'); await pg.click('.z9seg [data-s="sq"]')
    await savecv('card-h-night-sq.png'); await shot('09-item-hadith-night')
    await pg.click('.z9tp [data-t="sand"]'); await savecv('card-h-sand-sq.png')
    await pg.click('[data-a="fav"]'); await pg.wait_for_timeout(400)
    ck('favourite saved',await pg.evaluate("S.zb9.fav.includes('bukhari_6094')"))
    await pg.click('[data-a="copy"]'); await pg.wait_for_timeout(600)
    try: clip=await pg.evaluate("navigator.clipboard.readText()")
    except Exception as e: clip='ERR '+str(e)
    ck('copy text carries the reference',('البخاري ٦٠٩٤' in clip),clip[:160])
    wa=await pg.evaluate("document.querySelector('[data-a=\"wa\"]')!==null"); ck('whatsapp button',wa)
    ck('check-in-dorar button on hadith',await pg.evaluate("!!document.querySelector('.z9acts a[href^=\"#hcheck/\"]')"))
    await go('#balligh/fav',800); ck('favourites list',await pg.evaluate("document.querySelectorAll('#view .z9it').length")==1)
    await go('#balligh/i/bukhari_6094',1200); await pg.click('[data-a="fav"]'); await pg.wait_for_timeout(300)
    ck('favourite removed',await pg.evaluate("!S.zb9.fav.includes('bukhari_6094')"))
    # hadith page chip + old routes
    await go('#hadith',1500); ck('«تحقق في الدرر» on #hadith',await pg.evaluate("!!document.getElementById('z9hc')"))
    for r in ['#hufaz','#adhkar','#sec/quran','#home']:
      await go(r,2000); ok=await pg.evaluate("document.getElementById('view').innerText.length>50"); ck('route '+r,ok)
    ck('no page errors',not R['errors'],R['errors'][:5])
    await b.close()
  json.dump(R,open(os.path.join(OUT,'results.json'),'w'),ensure_ascii=False,indent=1)
  print('SUMMARY',sum(c['ok'] for c in R['checks']),'/',len(R['checks']))
asyncio.run(main())
