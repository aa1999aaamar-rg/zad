
import json,sys,asyncio,os,re,base64
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None; VER=sys.argv[4] if len(sys.argv)>4 else '5.4.8'
os.makedirs(OUT,exist_ok=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER)
R={'errors':[],'checks':[],'lects':{}}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:400]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:400],flush=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block',has_touch=True,accept_downloads=True)
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
    ck('auto button',await pg.locator('#zlauto').count()==1)
    ck('new button',await pg.locator('#zlnew').count()==1)
    await pg.screenshot(path=OUT+'/01-list.png')
    async def gen(q,sp='',chip=False,shot=None):
      await pg.goto(BASE+'/#lecture',wait_until='load'); await pg.wait_for_timeout(1500)
      await pg.click('#zlauto'); await pg.wait_for_timeout(400)
      if chip: await pg.click(f'.zlchips button[data-k="{q}"]')
      else: await pg.fill('#zaq',q)
      if sp: await pg.fill('#zasp',sp)
      if shot: await pg.screenshot(path=OUT+'/'+shot)
      await pg.click('#zago'); await pg.wait_for_timeout(3500)
      h=await pg.evaluate("()=>location.hash"); 
      L=await pg.evaluate("(h)=>{const id=h.split('/')[1];return ZB11.load().l.find(x=>x.id===id)}",h)
      ban=await pg.evaluate("()=>{const b=document.querySelector('#zlautob');return b?b.innerText:''}")
      return h,L,ban
    h,L,ban=await gen('الصبر','الشيخ عبدالله',shot='02-sheet.png')
    R['lects']['الصبر']=L
    ck('sabr generated',L and len(L['sl'])>=8,f"{h} slides={len(L['sl']) if L else 0} types={[s['t'] for s in L['sl']] if L else ''}")
    ck('sabr banner',ban.strip().endswith('تم التحضير من بيانات زاد الموثقة — راجعها وعدّل قبل الإلقاء') or 'تم التحضير من بيانات زاد الموثقة' in ban,ban)
    # verse text matches api
    import urllib.request
    ok=True
    cache={}
    for s in L['sl']:
      if s['t']=='q':
        if s['s'] not in cache:
          import requests; j=requests.get(f"https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number={s['s']}",timeout=30).json();cache[s['s']]={int(v['verse_key'].split(':')[1]):v['text_uthmani'] for v in j['verses']}
        for v in s['v']:
          if cache[s['s']][v['n']]!=v['x']: ok=False
    ck('verse text == quran api',ok)
    await pg.screenshot(path=OUT+'/03-editor-top.png')
    await pg.evaluate("()=>document.querySelector('#zlsls').scrollIntoView()"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=OUT+'/04-editor-slides.png')
    # editable: move slide 2 down, delete last, add
    n0=len(L['sl'])
    await pg.locator('.zlsl[data-i="1"] [data-a="down"]').click(); await pg.wait_for_timeout(300)
    L2=await pg.evaluate("(id)=>ZB11.load().l.find(x=>x.id===id).sl.map(s=>s.t)",L['id'])
    ck('reorder works',L2[1]==L['sl'][2]['t'] and L2[2]==L['sl'][1]['t'],L2)
    await pg.locator('.zlsl[data-i="1"] [data-a="up"]').click(); await pg.wait_for_timeout(300)
    # present 2 slides landscape
    await pg.set_viewport_size({'width':844,'height':390})
    for i,nm in [(2,'05-play-verse.png'),(5,'06-play-hadith.png')]:
      await pg.evaluate(f"()=>ZB11.present('{L['id']}',{i})"); await pg.wait_for_timeout(1500)
      await pg.screenshot(path=OUT+'/'+nm)
      await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
    await pg.set_viewport_size({'width':390,'height':844})
    # PDF
    await pg.goto(BASE+'/#lecture/'+L['id'],wait_until='load'); await pg.wait_for_timeout(2500)
    try:
      async with pg.expect_download(timeout=60000) as dl:
        await pg.click('#zlpdf')
      d=await dl.value; await d.save_as(OUT+'/sabr.pdf'); ck('pdf',os.path.getsize(OUT+'/sabr.pdf')>10000,os.path.getsize(OUT+'/sabr.pdf'))
    except Exception as e: ck('pdf',False,e)
    h,L,ban=await gen('بر الوالدين',chip=True)
    R['lects']['بر الوالدين']=L
    ck('birr generated',L and L['auto']['t']=='بر الوالدين',f"slides={len(L['sl'])} {[s['t'] for s in L['sl']]}")
    h,L,ban=await gen('xyz')
    R['lects']['xyz']=L
    ck('xyz skeleton',L and L['auto']['m']=='skel' and not any(s['t'] in 'qd' for s in L['sl']),[ (s['t'],s.get('h')) for s in L['sl']])
    ck('xyz banner','ما لقينا آيات وأحاديث جاهزة لهذا الموضوع — أضفها يدوياً' in ban,ban)
    await pg.screenshot(path=OUT+'/07-xyz.png')
    # manual lecture still works
    await pg.goto(BASE+'/#lecture',wait_until='load'); await pg.wait_for_timeout(1500)
    await pg.click('#zlnew'); await pg.wait_for_timeout(1500)
    ck('manual new lecture opens editor',await pg.locator('#zlti').count()==1 and await pg.locator('#zlautob').count()==0, await pg.evaluate("()=>location.hash"))
    # search
    await pg.goto(BASE+'/#search',wait_until='load'); await pg.wait_for_timeout(2000)
    try:
      await pg.fill('#zsq','تحضير'); await pg.wait_for_timeout(800)
      t=await pg.evaluate("()=>(document.querySelector('#zsres')||{}).innerText||''"); ck('search تحضير finds lecture','محضّر المحاضرة' in t,t[:120])
    except Exception as e: ck('search',False,e)
    # shamela still there
    await pg.goto(BASE+'/#lib',wait_until='load'); await pg.wait_for_timeout(2500)
    ck('shamela button',await pg.evaluate("()=>document.body.innerText.includes('ابحث في المكتبة الشاملة')"))
    R['ver']=await pg.evaluate("()=>window.APP_VERSION")
    await b.close()
  json.dump(R,open(OUT+'/result.json','w'),ensure_ascii=False,indent=1)
  print('errors',R['errors'][:8])
asyncio.run(main())
