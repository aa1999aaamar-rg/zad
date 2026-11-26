
import asyncio, json, sys, tempfile
from playwright.async_api import async_playwright
LINK=open('/home/user/tab/files/zad-dashboard-link.txt').read().strip()
OUT='/home/user/tab/work/zad545/shots'
async def main():
  import os; os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    prefs={'dom.push.enabled':True,'dom.push.serverURL':'wss://push.services.mozilla.com/','dom.webnotifications.enabled':True,'permissions.default.desktop-notification':1,'dom.serviceWorkers.enabled':True,'dom.push.connection.enabled':True,'dom.push.alwaysConnect':True}
    ctx=await p.firefox.launch_persistent_context(tempfile.mkdtemp(prefix='zbc-'),headless=True,viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',firefox_user_prefs=prefs)
    pg=await ctx.new_page(); errs=[]
    pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
    r=await pg.goto(LINK,wait_until='networkidle'); print('status',r.status)
    await pg.wait_for_timeout(12000)
    print('counts', await pg.evaluate("document.getElementById('brc').textContent+' | '+[...document.getElementById('ba').options].map(o=>o.text).join(' / ')"))
    await pg.click('#bme'); 
    for i in range(30):
      await pg.wait_for_timeout(1000)
      t=await pg.evaluate("document.getElementById('bdm').innerText")
      if '✓' in t or 'ما قدرت' in t or 'لازم' in t: break
    print('me ->',t)
    await pg.fill('#bt','حلقة جديدة من «عمار» 🎬')
    await pg.fill('#bb','«الرياء» صارت بالتطبيق — شاهدها الحين وشاركها مع غيرك 🤍')
    await pg.select_option('#bu','./#u/ammar')
    await pg.wait_for_timeout(500)
    print('test disabled?', await pg.evaluate("document.getElementById('btest').disabled"))
    await pg.click('#btest')
    for i in range(20):
      await pg.wait_for_timeout(1000)
      t=await pg.evaluate("document.getElementById('bmsg').innerText")
      if t: break
    print('test ->',t)
    notes=[]
    for i in range(15):
      await pg.wait_for_timeout(1500)
      notes=await pg.evaluate("async()=>{const r=await navigator.serviceWorker.ready;const ns=await r.getNotifications();return ns.map(x=>({t:x.title,b:x.body,tag:x.tag,url:x.data&&x.data.url}))}")
      if notes: break
    print('notifications', json.dumps(notes,ensure_ascii=False))
    await pg.evaluate("document.getElementById('s-send').scrollIntoView()")
    await pg.evaluate("window.scrollBy(0,-120)")
    await pg.wait_for_timeout(800)
    await pg.screenshot(path=OUT+'/push-a.png')
    await pg.evaluate("window.scrollBy(0,560)"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=OUT+'/push-b.png')
    # confirm sheet (dry-run only), then back
    await pg.click('#bsend'); await pg.wait_for_timeout(2500)
    print('confirm text', await pg.evaluate("document.getElementById('bq').innerText"), '| btn', await pg.evaluate("document.getElementById('byes').innerText"))
    await pg.screenshot(path=OUT+'/push-c.png')
    await pg.click('#bno'); await pg.wait_for_timeout(500)
    await pg.evaluate("document.getElementById('blog').scrollIntoView()"); await pg.evaluate("window.scrollBy(0,-260)"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=OUT+'/push-d.png')
    print('errors', errs[:10])
    await ctx.close()
asyncio.run(main())
