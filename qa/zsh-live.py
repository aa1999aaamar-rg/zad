
import asyncio,sys,json
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');localStorage.setItem('ammar.v1',JSON.stringify({onboarded:true,profile:{name:''},settings:{theme:'light',accent:'#34457a',qsize:26,lang:'ar',city:'jeddah',cityUser:true,rep:3,reciter:'maher'}}));localStorage.setItem('ammar.lastSeen','5.4.6');localStorage.setItem('zad.zptest','ZTEST-shamela-'+Math.random().toString(36).slice(2,8));}})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block')
    await c.add_init_script(INIT); pg=await c.new_page()
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    await pg.goto(BASE,wait_until='networkidle',timeout=60000); await pg.wait_for_timeout(2000)
    res={}
    for r in ['lib','books','pdfs','hufaz']:
      await pg.evaluate(f"location.hash='{r}'"); await pg.wait_for_timeout(3500 if r=='hufaz' else 1500)
      res[r]=await pg.evaluate("(()=>{const c=document.querySelector('#zshc');return c?{n:document.querySelectorAll('#zshc').length,prev:(c.previousElementSibling||{}).tagName+' '+((c.previousElementSibling||{}).textContent||'').slice(0,30),href:document.querySelector('#zshb').href}:null})()")
    await pg.evaluate("location.hash='lib'"); await pg.wait_for_timeout(1500); await pg.evaluate("window.scrollTo(0,0)")
    await pg.fill('#zshq','الصبر'); await pg.wait_for_timeout(300)
    res['href_after']=await pg.evaluate("document.querySelector('#zshb').href")
    res['target']=await pg.evaluate("document.querySelector('#zshb').target")
    await pg.screenshot(path=OUT+'/lib.png')
    async with c.expect_page(timeout=20000) as pi:
      await pg.click('#zshb')
    np=await pi.value
    await np.wait_for_load_state('domcontentloaded'); res['popup_url']=np.url
    await np.wait_for_timeout(9000)
    res['shamela']=await np.evaluate("({n:document.querySelectorAll('#srch_res .srch-result').length,field:(document.querySelector('#fld_srchAll')||{}).value,first:((document.querySelector('#srch_res .srch-result')||{}).innerText||'').slice(0,160),hdr:((document.querySelector('#srch_res')||{}).innerText||'').slice(0,25)})")
    await np.screenshot(path=OUT+'/shamela-results.png')
    await np.close()
    # Enter key
    async with c.expect_page(timeout=20000) as pi:
      await pg.press('#zshq','Enter')
    np=await pi.value; await np.wait_for_load_state('domcontentloaded'); res['enter_url']=np.url; await np.close()
    res['hash_after']=await pg.evaluate("location.hash")
    # empty
    await pg.fill('#zshq',''); res['empty_href']=await pg.evaluate("document.querySelector('#zshb').href")
    # search
    await pg.evaluate("location.hash='search'"); await pg.wait_for_timeout(1200)
    await pg.type('#zsq','الصبر',delay=30); await pg.wait_for_timeout(500)
    res['srow']=await pg.evaluate("(()=>{const a=document.querySelector('#zshr');return a?{href:a.href,t:a.textContent}:null})()")
    await pg.screenshot(path=OUT+'/search.png')
    await pg.fill('#zsq','قبلة'); await pg.wait_for_timeout(400)
    res['srow2']=await pg.evaluate("(()=>{const a=document.querySelectorAll('#zshr');return [a.length,a[0]&&a[0].href, document.querySelectorAll('#zsres .zli').length]})()")
    await pg.fill('#zsq',''); await pg.wait_for_timeout(300)
    res['srow_empty']=await pg.evaluate("document.querySelectorAll('#zshr').length")
    res['errs']=errs
    print(json.dumps(res,ensure_ascii=False,indent=1))
    await b.close()
asyncio.run(main())
