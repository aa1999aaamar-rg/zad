
import asyncio,json,sys
from playwright.async_api import async_playwright
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),sys.argv[2])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for th in ['light','dark']:
      c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block')
      await c.add_init_script(INIT.replace('"theme": "light"','"theme": "%s"'%th))
      await c.route('**/api/social/ref/reg*',lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
      pg=await c.new_page(); await pg.goto(sys.argv[1]+'/#home',wait_until='load'); await pg.wait_for_timeout(3500)
      await pg.screenshot(path=sys.argv[3]+f'/before-{th}.png'); await c.close()
    await b.close()
asyncio.run(main())
