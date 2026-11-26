
import json,sys,asyncio,os,re,time,base64
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
os.makedirs(OUT,exist_ok=True); VER=sys.argv[4] if len(sys.argv)>4 else '5.4.5'
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER)
R={'errors':[],'checks':[]}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:300]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:300],flush=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block',has_touch=True,accept_downloads=True)
    await c.add_init_script(INIT)
    await c.route(re.compile(r'.*/api/zp.*'),lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
    if LOCAL:
      async def h(route):
        pth=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,pth)
        if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/json' if fp.endswith('.json') else 'application/javascript','Access-Control-Allow-Origin':'*'})
        else: await route.continue_()
      await c.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),h)
    pg=await c.new_page()
    pg.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and 'Failed to load resource' not in m.text and R['errors'].append('console: '+m.text[:200])))
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(2500)
    # search entry
    has=await pg.evaluate("()=>!!(window.ZS&&ZS.F&&ZS.F.lecture)")
    ck('registry F.lecture',has)
    await pg.goto(BASE+'/#sec/content'); await pg.wait_for_timeout(1500)
    txt=await pg.evaluate("()=>document.getElementById('view').innerText")
    ck('listed in المزيد › المحتوى','محضّر المحاضرة' in txt)
    await pg.goto(BASE+'/#services'); await pg.wait_for_timeout(1200)
    inp=pg.locator('#view input').first; await inp.fill('شرائح'); await pg.wait_for_timeout(900)
    txt=await pg.evaluate("()=>document.getElementById('view').innerText")
    ck('searchable («شرائح»)','محضّر المحاضرة' in txt)
    sham=await pg.evaluate("()=>!!window.ZSHM")
    ck('v5.4.6 Shamela module present',sham)
    await pg.screenshot(path=OUT+'/services.png')
    await pg.goto(BASE+'/#lecture'); await pg.wait_for_timeout(2500)
    ck('list screen', await pg.locator('#zlnew').count()==1)
    await pg.screenshot(path=OUT+'/list-empty.png')
    # create via UI
    await pg.click('#zlnew'); await pg.wait_for_timeout(800)
    await pg.fill('#zlti','فضل الصبر'); await pg.fill('#zlsp','الشيخ عبدالله'); await pg.fill('#zlpl','جامع الحي'); await pg.fill('#zldt','الجمعة')
    # heading
    async def add(t):
      await pg.click('#zladd'); await pg.wait_for_timeout(300); await pg.click(f'.zltypes [data-t="{t}"]'); await pg.wait_for_timeout(400)
    await add('h'); await pg.fill('.zlsheet #e1','معنى الصبر'); await pg.fill('.zlsheet #e2','حبس النفس على طاعة الله\nوحبسها عن معصيته\nوالرضا بأقداره المؤلمة'); await pg.click('.zlsheet #ok'); await pg.wait_for_timeout(400)
    await add('q'); await pg.select_option('.zlsheet #qs','2'); await pg.wait_for_timeout(200)
    await pg.fill('.zlsheet #qa','153'); await pg.dispatch_event('.zlsheet #qa','change'); await pg.fill('.zlsheet #qb','153'); await pg.dispatch_event('.zlsheet #qb','change')
    await pg.wait_for_function("()=>{const b=document.querySelector('.zlsheet #ok');return b&&!b.disabled}",timeout=20000)
    await pg.screenshot(path=OUT+'/sheet-ayah.png')
    await pg.click('.zlsheet #ok'); await pg.wait_for_timeout(400)
    await add('d'); await pg.fill('.zlsheet #hq','عجبا'); await pg.wait_for_timeout(300)
    await pg.click('.zlsheet #hl [data-id="muslim_2999"]'); await pg.screenshot(path=OUT+'/sheet-hadith.png'); await pg.click('.zlsheet #ok'); await pg.wait_for_timeout(400)
    await add('k'); await pg.click('.zlsheet #ok'); await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>window.scrollTo(0,0)"); await pg.wait_for_timeout(300)
    await pg.screenshot(path=OUT+'/editor.png',full_page=True)
    await pg.screenshot(path=OUT+'/editor-top.png')
    await pg.evaluate("()=>{const h=[...document.querySelectorAll('.zl h3')].find(x=>x.textContent.includes('الشرائح'));window.scrollTo(0,h.getBoundingClientRect().top+scrollY-70)}"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=OUT+'/editor-slides.png'); await pg.evaluate("()=>window.scrollTo(0,0)")
    L=await pg.evaluate("()=>JSON.parse(localStorage.getItem('zad.lec.v1')).l.slice(-1)[0]")
    json.dump(L,open(OUT+'/lecture.json','w'),ensure_ascii=False,indent=1)
    ck('4 slides saved',len(L['sl'])==4,[s['t'] for s in L['sl']])
    # reorder test: move closing up then down
    n=len(L['sl'])
    await pg.click(f'.zlsl[data-i="{n-1}"] [data-a="up"]'); await pg.wait_for_timeout(300)
    o=await pg.evaluate("()=>JSON.parse(localStorage.getItem('zad.lec.v1')).l.slice(-1)[0].sl.map(s=>s.t).join(',')")
    await pg.click(f'.zlsl[data-i="{n-2}"] [data-a="down"]'); await pg.wait_for_timeout(300)
    o2=await pg.evaluate("()=>JSON.parse(localStorage.getItem('zad.lec.v1')).l.slice(-1)[0].sl.map(s=>s.t).join(',')")
    ck('reorder up/down',o=='h,q,k,d' and o2=='h,q,d,k',o+' / '+o2)
    await pg.click('.zlsl[data-i="0"] [data-a="dup"]'); await pg.wait_for_timeout(300)
    o3=await pg.evaluate("()=>JSON.parse(localStorage.getItem('zad.lec.v1')).l.slice(-1)[0].sl.length")
    await pg.click('.zlsl[data-i="1"] [data-a="del"]'); await pg.wait_for_timeout(300)
    o4=await pg.evaluate("()=>JSON.parse(localStorage.getItem('zad.lec.v1')).l.slice(-1)[0].sl.length")
    ck('duplicate + delete',o3==5 and o4==4,(o3,o4))
    # present portrait
    await pg.click('#zlplay'); await pg.wait_for_timeout(1500)
    ck('present opened',await pg.locator('#zlp').count()==1)
    await pg.screenshot(path=OUT+'/present-portrait-0.png')
    await pg.keyboard.press('ArrowLeft'); await pg.wait_for_timeout(500)
    await pg.keyboard.press('ArrowLeft'); await pg.wait_for_timeout(700)
    i=await pg.evaluate("()=>document.getElementById('zlp').dataset.i")
    ck('arrow advances',i=='2',i)
    await pg.screenshot(path=OUT+'/present-portrait-2.png')
    # landscape
    await pg.set_viewport_size({'width':844,'height':390}); await pg.wait_for_timeout(800)
    for k in range(5):
      await pg.evaluate(f"()=>ZB11.PR.go({k})"); await pg.wait_for_timeout(600)
      await pg.screenshot(path=OUT+f'/present-land-{k}.png')
    # swipe: tap left area
    await pg.evaluate("()=>ZB11.PR.go(1)"); await pg.wait_for_timeout(300)
    await pg.mouse.click(150,200); await pg.wait_for_timeout(500)
    i=await pg.evaluate("()=>document.getElementById('zlp').dataset.i"); ck('tap left → next',i=='2',i)
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
    ck('escape closes',await pg.locator('#zlp').count()==0)
    await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(500)
    # pdf
    async with pg.expect_download(timeout=60000) as dl:
      await pg.click('#zlpdf')
    d=await dl.value; await d.save_as(OUT+'/lecture.pdf'); ck('pdf downloaded',os.path.getsize(OUT+'/lecture.pdf')>20000,os.path.getsize(OUT+'/lecture.pdf'))
    # verse source check: compare stored verse with api
    ck('no page errors',not R['errors'],R['errors'][:5])
    json.dump(R,open(OUT+'/r.json','w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
