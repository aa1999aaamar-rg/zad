
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if sys.argv[3]!='-' else None; VER=sys.argv[4]
os.makedirs(OUT,exist_ok=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER)
R={'errors':[],'checks':[],'lects':{}}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:600]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:600],flush=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block',has_touch=True)
    await c.add_init_script(INIT)
    await c.route(re.compile(r'.*/api/zp.*'),lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
    if LOCAL:
      async def h(route):
        pth=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,pth)
        if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
        else: await route.continue_()
      await c.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),h)
    pg=await c.new_page()
    pg.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and 'Failed to load resource' not in m.text and R['errors'].append('console: '+m.text[:200])))
    await pg.goto(BASE+'/#lecture',wait_until='load'); await pg.wait_for_timeout(3500)
    R['ver']=await pg.evaluate("()=>window.APP_VERSION")
    R['ntop']=await pg.evaluate("()=>ZB11.auto.TOP.length")
    ck('topics>=32',R['ntop']>=32,R['ntop'])
    async def gen(q,ln,chip=False,shot=None):
      await pg.goto(BASE+'/#lecture',wait_until='load'); await pg.wait_for_timeout(1500)
      await pg.click('#zlauto'); await pg.wait_for_timeout(500)
      if chip:
        await pg.locator(f'.zlchips button[data-k="{q}"]').scroll_into_view_if_needed(); await pg.click(f'.zlchips button[data-k="{q}"]')
      else: await pg.fill('#zaq',q)
      await pg.click(f'#zalen [data-len="{ln}"]'); await pg.wait_for_timeout(200)
      if shot: await pg.screenshot(path=OUT+'/'+shot)
      await pg.click('#zago'); await pg.wait_for_timeout(4000)
      h=await pg.evaluate("()=>location.hash")
      L=await pg.evaluate("(h)=>{const id=h.split('/')[1];return ZB11.load().l.find(x=>x.id===id)}",h)
      ban=await pg.evaluate("()=>{const b=document.querySelector('#zlautob');return b?b.innerText:''}")
      return h,L,ban
    import requests
    cache={}
    def vcheck(L):
      ok=True
      for s in L['sl']:
        if s['t']=='q':
          if s['s'] not in cache:
            j=requests.get(f"https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number={s['s']}",timeout=30).json();cache[s['s']]={int(v['verse_key'].split(':')[1]):v['text_uthmani'] for v in j['verses']}
          for v in s['v']:
            if cache[s['s']][v['n']]!=v['x']: ok=False
      return ok
    def desc(L): return [(s['t'], s.get('h') or (f"{s['s']}:{s['a']}-{s['b']}" if s['t']=='q' else s.get('r'))) for s in L['sl']]
    for q,ln,chip,shot in [('الحسد','s',False,'01-sheet-hasad-short.png'),('الجنة','l',True,'02-sheet-janna-long.png'),('الصبر','l',False,None),('الصبر','m',False,None),('حقوق الجار','l',True,None),('الكذب','m',False,None),('xyz','m',False,None)]:
      h,L,ban=await gen(q,ln,chip,shot)
      R['lects'][q+'/'+ln]=L
      n=len(L['sl']) if L else 0
      ck(f'{q} {ln}',L is not None and L['auto'].get('len')==ln,f"slides={n} (+cover) topic={L['auto'].get('t') if L else ''} mode={L['auto'].get('m') if L else ''} {desc(L) if L else ''}")
      if L and any(s['t']=='q' for s in L['sl']): ck(f'{q} {ln} verse text == quran api',vcheck(L))
      ck(f'{q} {ln} banner',bool(ban),ban)
      if q=='الجنة':
        await pg.screenshot(path=OUT+'/03-editor-janna.png')
        await pg.evaluate("()=>document.querySelector('#zlsls').scrollIntoView()"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=OUT+'/04-editor-janna-slides.png')
        await pg.set_viewport_size({'width':844,'height':390})
        for i,nm in [(2,'05-play-verse.png'),(7,'06-play-hadith.png')]:
          await pg.evaluate(f"()=>ZB11.present('{L['id']}',{i})"); await pg.wait_for_timeout(1600)
          await pg.screenshot(path=OUT+'/'+nm)
          await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
        await pg.set_viewport_size({'width':390,'height':844})
      if q=='xyz':
        ck('xyz skeleton',L['auto']['m']=='skel' and not any(s['t'] in 'qd' for s in L['sl']),desc(L))
        await pg.screenshot(path=OUT+'/07-xyz.png')
    await pg.goto(BASE+'/#lecture',wait_until='load'); await pg.wait_for_timeout(1500)
    await pg.click('#zlnew'); await pg.wait_for_timeout(1500)
    ck('manual new lecture',await pg.locator('#zlti').count()==1)
    await pg.goto(BASE+'/#search',wait_until='load'); await pg.wait_for_timeout(2000)
    try:
      await pg.fill('#zsq','تحضير'); await pg.wait_for_timeout(800)
      t=await pg.evaluate("()=>(document.querySelector('#zsres')||{}).innerText||''"); ck('search تحضير','محضّر المحاضرة' in t,t[:80])
    except Exception as e: ck('search',False,e)
    await pg.goto(BASE+'/#lib',wait_until='load'); await pg.wait_for_timeout(2500)
    ck('shamela button',await pg.evaluate("()=>document.body.innerText.includes('ابحث في المكتبة الشاملة')"))
    await b.close()
  json.dump(R,open(OUT+'/result.json','w'),ensure_ascii=False,indent=1)
  print('ver',R['ver'],'errors',R['errors'][:8])
asyncio.run(main())
