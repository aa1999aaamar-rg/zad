
import asyncio,sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--allow-file-access-from-files'])
        for spec in sys.argv[1:]:
            n,w,h=spec.split(':')
            pg=await b.new_page(viewport={'width':int(w),'height':int(h)})
            await pg.goto('file://'+__import__('os').path.abspath('promo/'+n+'.html'));await pg.wait_for_timeout(600)
            await pg.screenshot(path='promo/'+n+'.png');await pg.close()
        await b.close()
asyncio.run(main())
