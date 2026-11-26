
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if sys.argv[3]!='-' else None; VER=sys.argv[4]; TAG=sys.argv[5]
W=int(sys.argv[6]) if len(sys.argv)>6 else 390
os.makedirs(OUT,exist_ok=True)
R={'checks':[],'errors':[]}
def ck(n,ok,i=''):
  R['checks'].append([n,bool(ok),str(i)[:300]]);print(('PASS ' if ok else 'FAIL ')+n+' '+str(i)[:300],flush=True)
def seed(theme):
  return {"onboarded":True,"profile":{"name":"عمار"},"settings":{"theme":theme,"accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"shatri" },"zsr":{"never":1},
   "plan":{"surah":11,"dir":"fwd","ppd":1.5,"weekdays":[0,1,2,3,4,5,6],"start":"2026-11-01","fromPage":224,"memBefore":True},"done":{"0":"2026-11-01"},"cursor":1}
async def mk(b,theme):
    c=await b.new_context(viewport={'width':W,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block',has_touch=True,is_mobile=True)
    await c.add_init_script("""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt','{"never":1}')}}catch(e){}})();"""%(json.dumps(seed(theme),ensure_ascii=False),VER))
    await c.route(re.compile(r'.*/api/zp.*'),lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
    if LOCAL:
      async def h(route):
        u=route.request.url.split('?')[0].split('#')[0]; name=u[len(BASE)+1:] or 'index.html'
        fp=os.path.join(LOCAL,name)
        if os.path.isfile(fp) and not name.startswith('api'):
          ct='text/html; charset=utf-8' if name.endswith('.html') else ('text/css' if name.endswith('.css') else 'application/javascript')
          await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':ct})
        else: await route.continue_()
      await c.route(re.compile(re.escape(BASE)+r'/.*'),h)
    # fake audio playing: block mp3 to keep deterministic? let real load
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and R['errors'].append('console: '+m.text[:300])))
    return c,pg
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c,pg=await mk(b,'light')
    await pg.goto(BASE+'/#ward',wait_until='load'); await pg.wait_for_timeout(6000)
    info=await pg.evaluate("()=>({keys:ZWARD555.cur.keys,mw:document.querySelectorAll('.zw-mp .mw').length,out:document.querySelectorAll('.zw-mp .mw.zw-out').length,ring:(document.querySelector('.zw-ring .lb')||{}).textContent,eye:(document.querySelector('.zw-eye')||{}).textContent,hscroll:document.documentElement.scrollWidth})")
    ck('partial ward',info['out']>0,info)
    print(await pg.evaluate("()=>[...new Set([...document.querySelectorAll('.zw-mp .mw')].map(e=>e.dataset.k+(e.classList.contains('zw-out')?'o':'')))].join(' ')"))
    print(await pg.evaluate("()=>{const a=planReady();return JSON.stringify(a.days[S.cursor])}"))
    await pg.screenshot(path=f'{OUT}/{TAG}-partial-{W}.png',full_page=False)
    el=await pg.query_selector('.zw-mp .mw:not(.zw-out)'); await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
    await pg.screenshot(path=f'{OUT}/{TAG}-partial2-{W}.png')
    await c.close(); await b.close()
  print('ERRORS',R['errors'][:10])
asyncio.run(main())
