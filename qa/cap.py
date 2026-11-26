
import asyncio,sys,json
from playwright.async_api import async_playwright
OUT=sys.argv[1]; BASE='https://amar-muslim.sites.tab.bot/'
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');localStorage.setItem('ammar.v1',JSON.stringify({onboarded:true,profile:{name:''},settings:{theme:'light',accent:'#34457a',qsize:26,lang:'ar',city:'jeddah',cityUser:true,rep:3,reciter:'maher'}}));localStorage.setItem('ammar.lastSeen','4.7.0');}})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block')
    await c.add_init_script(INIT); pg=await c.new_page()
    await pg.goto(BASE,wait_until='networkidle',timeout=60000); await pg.wait_for_timeout(2500)
    async def go(h,w=3000): await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(w); await pg.evaluate("window.scrollTo(0,0)")
    async def sh(n): await pg.screenshot(path=f'{OUT}/{n}.png')
    await go('sections',2000); await pg.evaluate("const h=[...document.querySelectorAll('h2.sec')].find(x=>x.textContent.includes('٤٫٧'));h&&h.scrollIntoView({block:'start'});window.scrollBy(0,-80)"); await pg.wait_for_timeout(400); await sh('01-sections')
    await go('words/2/2',4000); await pg.evaluate("const L=[...document.querySelectorAll('.zb3-w')];L[L.length-1].click()"); await pg.wait_for_timeout(4500); await pg.evaluate("document.querySelector('.zb3-ws').scrollIntoView({block:'start'});window.scrollBy(0,-120)"); await pg.wait_for_timeout(300); await sh('02-words')
    await go('read/s/36',4000); await pg.evaluate("document.querySelector('.ay[data-k=\"36:39\"]')?.click()||document.querySelector('.ay[data-k]').click()"); await pg.wait_for_timeout(1200); await pg.evaluate("document.querySelector('#sheet [data-z3=w]').click()"); await pg.wait_for_timeout(4000)
    await pg.evaluate("const L=[...document.querySelectorAll('#sheet .zb3-w')];(L.find(x=>x.textContent.includes('عُرْجُون'))||L[L.length-2]).click()"); await pg.wait_for_timeout(4500); await pg.evaluate("const m=document.querySelector('#sheet #zb3wm');m&&m.scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300); await sh('03-reader-word')
    await pg.keyboard.press('Escape'); await pg.evaluate("try{closeSheet()}catch(e){}"); await pg.wait_for_timeout(400)
    await go('trans/ur/1',4500); await sh('04-trans-ur')
    await go('asbab/2/144',5000); await sh('05-asbab')
    await go('mawarith',2500)
    for k,n in [('wife',1),('son',1),('daughter',2),('mother',1),('fb',2)]:
      for i in range(n): await pg.click(f'[data-m="{k}"][data-d="1"]')
    await pg.fill('#mwamt','300000'); await pg.wait_for_timeout(700); await pg.evaluate("document.querySelector('#mwres').scrollIntoView({block:'start'});window.scrollBy(0,-70)"); await pg.wait_for_timeout(300); await sh('06-mawarith')
    await pg.evaluate("document.querySelector('#mwt').scrollIntoView({block:'start'});window.scrollBy(0,-90)"); await pg.wait_for_timeout(300); await sh('07-mawarith-tests')
    await go('zakat',5000); await pg.fill('[data-z="cash"]','85000'); await pg.fill('[data-z="g21"]','60'); await pg.fill('[data-z="shT"]','40000'); await pg.wait_for_timeout(800); await pg.evaluate("document.querySelector('#zkres').scrollIntoView({block:'start'});window.scrollBy(0,-70)"); await pg.wait_for_timeout(300); await sh('08-zakat')
    await go('muamalat',2500); await pg.evaluate("document.querySelectorAll('#mml details')[2].open=true"); await pg.wait_for_timeout(300); await sh('09-muamalat')
    await go('hajj/d10',2500); await sh('10-hajj')
    await go('ziyarat',2500); await pg.evaluate("window.scrollBy(0,560)"); await pg.wait_for_timeout(300); await sh('11-ziyarat')
    await go('newmuslim/en',2500); await sh('12-newmuslim')
    await go('marriage/b',2500); await sh('13-marriage')
    await go('women',2000); await sh('14-women')
    await go('tih',2500); await sh('15-tih')
    await go('kidstory/naml',2500); await sh('16-kidstory')
    await go('khutba',3500); await sh('17-khutba')
    await go('charity',2000); await sh('18-charity')
    await b.close()
asyncio.run(main())
