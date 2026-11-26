
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
      if theme=='light':
        await pg.goto(BASE+'/#read/p/224',wait_until='load'); await pg.wait_for_timeout(6000)
        await pg.screenshot(path=f'{OUT}/{TAG}-quran-{W}.png')
      await pg.goto(BASE+'/#ward',wait_until='load'); await pg.wait_for_timeout(6000)
      ver=await pg.evaluate("()=>APP_VERSION"); ck(theme+' version',ver==VER,ver)
      info=await pg.evaluate("()=>{const w=document.querySelector('.zw-mp');return {mp:!!w,pages:w?w.querySelectorAll('.mpage').length:0,mw:document.querySelectorAll('.zw-mp .mw').length,out:document.querySelectorAll('.zw-mp .mw.zw-out').length,font:(document.querySelector('.zw-mp .mlines')||{}).style?.fontFamily,fs:(document.querySelector('.zw-mp .mlines')||{}).style?.fontSize,hd:!!document.querySelector('.zw-hd'),ring:(document.querySelector('.zw-ring .lb')||{}).textContent,seg:document.querySelectorAll('.zw-seg button').length,done:!!document.querySelector('#donebtn')}}")
      ck(theme+' madinah mushaf in ward',info['mp'] and info['mw']>50 and 'qpc' in (info['font'] or ''),info)
      await pg.evaluate("()=>window.scrollTo(0,0)"); await pg.wait_for_timeout(300)
      await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-idle.png')
      if theme=='light':
        # tap an in-range ayah -> sheet
        k=await pg.evaluate("()=>ZWARD555.cur.keys[2]")
        el=await pg.query_selector(f'.zw-mp .mw[data-k="{k}"]:not(.me)')
        await el.scroll_into_view_if_needed(); await el.click(); await pg.wait_for_timeout(700)
        sh=await pg.evaluate("()=>{const s=document.querySelector('.zw-as');return s?s.innerText:null}"); ck('action sheet',sh and 'إخفاء الآية' in sh,sh)
        await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-sheet.png')
        await pg.click('.zw-as [data-a="hide"]'); await pg.wait_for_timeout(700)
        h=await pg.evaluate(f"()=>({{h:document.querySelectorAll('.mw.zw-h').length,row:(document.querySelector('.zw-hrow')||{{}}).innerText}})"); ck('ayah hidden',h['h']>0 and h['row'],h)
        await pg.evaluate(f"()=>{{const e=document.querySelector('.zw-mp .mw.zw-h');e&&e.scrollIntoView({{block:'center'}})}}"); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-hidden.png')
        await pg.reload(wait_until='load'); await pg.wait_for_timeout(6000)
        h2=await pg.evaluate("()=>document.querySelectorAll('.mw.zw-h').length"); ck('hidden persists after reload',h2>0,h2)
        el=await pg.query_selector('.zw-mp .mw.zw-h:not(.me)'); await el.scroll_into_view_if_needed(); await el.click(); await pg.wait_for_timeout(500)
        h3=await pg.evaluate("()=>[document.querySelectorAll('.mw.zw-h').length,!!document.querySelector('.zw-hrow')]"); ck('tap reveals',h3[0]==0 and not h3[1],h3)
        # eye (hide all) still works
        await pg.evaluate("()=>window.scrollTo(0,0)")
        await pg.click('.zw-eb'); await pg.wait_for_timeout(400)
        hid=await pg.evaluate("()=>document.getElementById('wardbox').classList.contains('hide')"); ck('eye hide-all',hid,hid)
        await pg.click('.zw-eb'); await pg.wait_for_timeout(300)
      pb=await pg.query_selector('.zwp .pb, #wardbox .pb')
      if pb: await pb.click()
      await pg.wait_for_timeout(4000)
      await pg.evaluate("()=>{const a=document.querySelector('.zw-mp .mw.play');if(a)a.scrollIntoView({block:'center'})}"); await pg.wait_for_timeout(800)
      st=await pg.evaluate("()=>({paused:AP.el.paused,i:AP.i,q:AP.q.length,play:document.querySelectorAll('.zw-mp .mw.play').length,rep:AP.rep})"); ck(theme+' audio state',not st['paused'] and st['play']>0,st)
      await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-play.png')
      await c.close()
    await b.close()
  print('ERRORS',R['errors'][:10])
  json.dump(R,open(f'{OUT}/{TAG}-{W}-results.json','w'),ensure_ascii=False,indent=1)
asyncio.run(main())
