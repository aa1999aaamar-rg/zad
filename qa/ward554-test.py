
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
   "plan":{"surah":11,"dir":"fwd","ppd":2,"weekdays":[0,1,2,3,4,5,6],"start":"2026-11-01","fromPage":224,"memBefore":True},"done":{},"cursor":0}
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
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    for theme in ['light','dark']:
      c,pg=await mk(b,theme)
      await pg.goto(BASE+'/#ward',wait_until='load'); await pg.wait_for_timeout(5000)
      ver=await pg.evaluate("()=>APP_VERSION"); ck(theme+' version',ver==VER,ver)
      await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-idle.png')
      # play
      pb=await pg.query_selector('#wardbox .pb, .zwp .pb')
      if pb: await pb.click()
      await pg.wait_for_timeout(3500)
      await pg.evaluate("()=>{const a=document.querySelector('.ay.play');if(a)a.scrollIntoView({block:'center'})}"); await pg.wait_for_timeout(800)
      st=await pg.evaluate("()=>({paused:AP.el.paused,i:AP.i,q:AP.q.length,src:AP.el.src,play:document.querySelectorAll('.ay.play').length,rep:AP.rep})"); ck(theme+' audio state',not st['paused'] and st['play']>0,st)
      await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-play.png')
      if os.environ.get('EXTRA'):
        _ns={}; exec(open(os.environ['EXTRA']).read(),_ns)
        await _ns['extra'](pg,theme,ck,OUT,TAG,W)
      await c.close()
    await b.close()
  print('ERRORS',R['errors'][:10])
  json.dump(R,open(f'{OUT}/{TAG}-{W}-results.json','w'),ensure_ascii=False,indent=1)
asyncio.run(main())
