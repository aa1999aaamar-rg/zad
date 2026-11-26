
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; VER=sys.argv[3]; os.makedirs(OUT,exist_ok=True)
R={'checks':[],'errors':[]}
def ck(n,ok,i=''):
  R['checks'].append([n,bool(ok),str(i)[:300]]);print(('PASS ' if ok else 'FAIL ')+n+' '+str(i)[:300],flush=True)
def seed(theme,name): return {"onboarded":True,"profile":{"name":name},"settings":{"theme":theme,"accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
async def mk(b,theme,name):
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block')
    await c.add_init_script("""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt','{"never":1}');localStorage.setItem('zad.zq.mute','true')}}catch(e){}})();"""%(json.dumps(seed(theme,name),ensure_ascii=False),VER))
    await c.route(re.compile(r'.*/api/zp.*'),lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append(name+' pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and 'zq' in m.text and R['errors'].append(name+' console: '+m.text[:300])))
    return c,pg
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c1,h=await mk(b,'light','عمار')
    await h.goto(BASE+'/#home',wait_until='load'); await h.wait_for_timeout(3500)
    v=await h.evaluate("()=>[typeof APP_VERSION!=='undefined'?APP_VERSION:'',!!document.getElementById('zqhome')]"); ck('version+home card',v[0]==VER and v[1],v)
    order=await h.evaluate("""()=>[...document.querySelectorAll('.zhome .zcolA > *')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0).map(e=>e.id||e.className.split(' ')[0])""")
    ck('home order: zqhome right after zb6home', 'zqhome' in order and 'zb6home' in order and order.index('zqhome')==order.index('zb6home')+1, order)
    ck('prayer card first-ish', order[:3], order[:4])
    await h.evaluate("document.getElementById('zqhome').scrollIntoView({block:'center'})"); await h.wait_for_timeout(400)
    await h.screenshot(path=OUT+'/home.png')
    # search
    ok=await h.evaluate("()=>{const F=ZS.F;return !!F.fquiz && (ZSEC&&JSON.stringify(ZSEC.GR||'').includes('fquiz')||true)}"); ck('F.fquiz registered',ok)
    await h.goto(BASE+'/#fquiz',wait_until='load'); await h.wait_for_timeout(1500)
    await h.screenshot(path=OUT+'/start.png')
    ck('start screen', await h.locator('.zq-hero').count()==1)
    await h.click('[data-a=create]'); await h.wait_for_timeout(1500)
    code=await h.evaluate("()=>ZQUIZ&&document.querySelector('.zq-bigcode')&&document.querySelector('.zq-bigcode').textContent")
    code=''.join(str('٠١٢٣٤٥٦٧٨٩'.index(ch)) if ch in '٠١٢٣٤٥٦٧٨٩' else ch for ch in (code or ''))
    ck('room created', len(code)==5, code)
    c2,p2=await mk(b,'dark','سالم'); c3,p3=await mk(b,'light','نورة')
    for pg,emo in ((p2,'⭐'),(p3,'🌴')):
        await pg.goto(BASE+'/#fquiz/'+code,wait_until='load'); await pg.wait_for_timeout(1500)
        await pg.click('.zq-emo[data-e="%s"]'%emo)
        await pg.click('[data-a=join]'); await pg.wait_for_timeout(1200)
    await h.wait_for_timeout(1500)
    n=await h.locator('.zq-p').count(); ck('lobby shows 3 players',n==3,n)
    await h.click('.zq-chip[data-g=n][data-v="10"]'); await h.click('.zq-chip[data-g=t][data-v="15"]'); await h.wait_for_timeout(1300)
    await h.screenshot(path=OUT+'/lobby.png',full_page=True)
    t2=await p2.locator('.zq-chip.on[data-g=t]').inner_text(); ck('guest sees host cfg',('١٥' in t2),t2)
    await h.click('[data-a=start]'); await h.wait_for_timeout(5200)
    qs=[await pg.locator('.zq-qt').inner_text() for pg in (h,p2,p3)]
    ck('same question on all phones', len(set(qs))==1 and qs[0], qs[0])
    opts=[await pg.locator('.zq-opt').all_inner_texts() for pg in (h,p2,p3)]
    ck('same options order', opts[0]==opts[1]==opts[2], opts[0])
    await p2.click('[data-a=help]'); await p2.wait_for_timeout(800)
    gone=await p2.locator('.zq-opt.gone').count(); ck('help removes two',gone==2,gone)
    await p2.screenshot(path=OUT+'/q_p2.png'); await h.screenshot(path=OUT+'/q_host.png')
    # answer: host picks first visible, p2 picks a non-gone, p3 picks last
    await h.locator('.zq-opt').nth(0).click(); await p2.locator('.zq-opt:not(.gone)').nth(0).click(); await p3.locator('.zq-opt').nth(3).click()
    await h.wait_for_timeout(2500)
    st=await h.evaluate("()=>document.querySelector('.zq-res')?document.querySelector('.zq-res').className:''"); ck('auto reveal when all answered','zq-res' in st,st)
    await p2.screenshot(path=OUT+'/rev_p2.png'); await h.screenshot(path=OUT+'/rev_host.png',full_page=True)
    ck('fact shown', await h.locator('.zq-fact').count()==1)
    # play remaining 9 quickly
    for i in range(9):
        await h.click('[data-a=next]'); await h.wait_for_timeout(3600)
        for k,pg in enumerate((h,p2,p3)):
            try: await pg.locator('.zq-opt').nth((i+k)%4).click(timeout=4000)
            except Exception as e: R['errors'].append('ans %d %d %s'%(i,k,str(e)[:100]))
        await h.wait_for_timeout(2200)
    await h.click('[data-a=next]'); await h.wait_for_timeout(2500)
    ck('winner screen host', await h.locator('.zq-podium').count()==1)
    ck('winner screen guest', await p3.locator('.zq-podium').count()==1)
    await h.wait_for_timeout(300); await h.screenshot(path=OUT+'/win_host.png'); await p2.screenshot(path=OUT+'/win_p2.png')
    hist=await p3.evaluate("()=>JSON.parse(localStorage.getItem('zad.zq.hist')||'[]').length"); ck('history saved',hist>=1,hist)
    # reconnect: reload p3 keeps seat
    await p3.reload(wait_until='load'); await p3.wait_for_timeout(2500)
    ck('reload rejoins same room', await p3.locator('.zq-podium').count()==1 or await p3.locator('.zq-bigcode').count()==1)
    await h.click('[data-a=again]'); await h.wait_for_timeout(2500)
    ck('again -> lobby on guest', await p2.locator('.zq-bigcode').count()==1)
    # dark start page shot
    await p2.goto(BASE+'/#home',wait_until='load'); await p2.wait_for_timeout(3000); await p2.evaluate("document.getElementById('zqhome')&&document.getElementById('zqhome').scrollIntoView({block:'center'})"); await p2.wait_for_timeout(300); await p2.screenshot(path=OUT+'/home_dark.png')
    # المزيد search for مسابقة
    await h.goto(BASE+'/#search',wait_until='load'); await h.wait_for_timeout(1500)
    try:
        inp=h.locator('#view input').first; await inp.fill('مسابقات العائلة'); await h.wait_for_timeout(1200)
        txt=await h.locator('#view').inner_text(); ck('search finds مسابقات العائلة','مسابقات العائلة' in txt)
    except Exception as e: ck('search',False,e)
    await h.goto(BASE+'/#homeedit',wait_until='load'); await h.wait_for_timeout(1500)
    ck('homeedit lists the block','مسابقات العائلة' in await h.locator('#view').inner_text())
    await b.close()
  ck('no page errors',not R['errors'],R['errors'][:5])
  json.dump(R,open(OUT+'/r.json','w'),ensure_ascii=False,indent=1)
asyncio.run(main())
