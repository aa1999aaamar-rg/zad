
import asyncio,sys,json
from playwright.async_api import async_playwright
routes=sys.argv[1].split(',')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'])
        c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,locale='ar-SA',timezone_id='Asia/Riyadh',geolocation={'latitude':24.7136,'longitude':46.6753},permissions=['geolocation'],user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1')
        pg=await c.new_page()
        await pg.add_init_script("Object.defineProperty(navigator,'standalone',{get:()=>true});const _mm=window.matchMedia;window.matchMedia=q=>/standalone/.test(q)?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:_mm.call(window,q);")
        await pg.goto('https://amar-muslim.sites.tab.bot/',wait_until='networkidle')
        await pg.wait_for_timeout(2500)
        await pg.screenshot(path='shots/_first.png')
        for r in routes:
            if r=='kids':
                await pg.evaluate("()=>{S.zf.kd={st:{1:3,114:3,113:2,112:3,111:1,110:2,109:1}}}")
            await pg.evaluate("h=>{location.hash=h}",'#'+r)
            await pg.wait_for_timeout(3500)
            if r=='push':
                await pg.evaluate('''()=>{document.querySelectorAll('#view input[type=checkbox]').forEach((x,i)=>{if(i<5)x.checked=true});[...document.querySelectorAll('#view p, #view .znote, #view div')].forEach(e=>{if(/مرفوضة/.test(e.textContent)&&e.children.length<3)e.remove()})}''')
                await pg.wait_for_timeout(400)
            await pg.screenshot(path='shots/'+r.replace('/','_')+'.png')
        await b.close()
asyncio.run(main())
