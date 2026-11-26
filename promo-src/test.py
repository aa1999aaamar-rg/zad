
import asyncio,sys,json
from playwright.async_api import async_playwright
BASE=sys.argv[1]
async def main():
    out={}
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,locale='ar-SA',timezone_id='Asia/Riyadh',user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1')
        await c.grant_permissions(['clipboard-read','clipboard-write'],origin=BASE.rstrip('/'))
        pg=await c.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        imgs={}
        pg.on('response',lambda r:imgs.__setitem__(r.url,r.status) if 'promo/' in r.url else None)
        await pg.add_init_script("""Object.defineProperty(navigator,'standalone',{get:()=>true});
window.__shared=[];navigator.canShare=(d)=>!!(d&&d.files&&d.files.length);navigator.share=async(d)=>{window.__shared.push({files:(d.files||[]).map(f=>({name:f.name,type:f.type,size:f.size})),text:d.text||null,url:d.url||null,title:d.title||null});};""")
        await pg.goto(BASE,wait_until='networkidle');await pg.wait_for_timeout(2500);await pg.screenshot(path='t_first.png');await pg.evaluate("location.hash='#home'");await pg.wait_for_timeout(2500)
        out['sw']=await pg.evaluate("fetch('sw.js').then(r=>r.text()).then(t=>t.slice(0,30))")
        out['ver']=await pg.evaluate("typeof APP_VERSION!=='undefined'?APP_VERSION:null")
        out['hdr']=await pg.evaluate("(()=>{const b=document.getElementById('zsrbtn');if(!b)return null;const r=b.getBoundingClientRect();return [r.x,r.y,r.width,r.height,getComputedStyle(b).display]})()")
        out['homecard']=await pg.evaluate("!!document.getElementById('zsrcard')")
        await pg.screenshot(path='t_home.png')
        await pg.click('#zsrbtn');await pg.wait_for_timeout(2500)
        out['sheet']=await pg.evaluate("!!document.querySelector('.zsr')")
        out['thumbs']=await pg.evaluate("[...document.querySelectorAll('.zsri img')].map(i=>[i.complete,i.naturalWidth])")
        out['wa']=await pg.evaluate("document.querySelector('.zsrc[data-k=wa]').href")
        out['x']=await pg.evaluate("document.querySelector('.zsrc[data-k=x]').href")
        out['tg']=await pg.evaluate("document.querySelector('.zsrc[data-k=tg]').href")
        await pg.screenshot(path='t_sheet.png')
        await pg.click('.zsrc[data-k=link]');await pg.wait_for_timeout(500)
        out['clip']=await pg.evaluate("navigator.clipboard.readText()")
        # pick 3rd image then share
        await pg.click('.zsri[data-i="2"]');await pg.wait_for_timeout(1500)
        await pg.click('#zsrmain');await pg.wait_for_timeout(2000)
        out['shared']=await pg.evaluate("window.__shared")
        out['imgs']=imgs
        await pg.evaluate("closeSheet()");await pg.wait_for_timeout(400)
        await pg.evaluate("location.hash='#services'");await pg.wait_for_timeout(1500)
        out['hub']=await pg.evaluate("(()=>{const a=[...document.querySelectorAll('#view a')].find(a=>/انشر التطبيق/.test(a.textContent));return a?[a.getAttribute('href'),a.textContent.trim().slice(0,40)]:null})()")
        await pg.screenshot(path='t_hub.png')
        if out['hub']:
            await pg.evaluate("location.hash='#shareapp'");await pg.wait_for_timeout(1500)
            out['hub_dbg']=await pg.evaluate("[document.getElementById('sheet').hidden,document.getElementById('sheet').className,document.querySelector('#sheet .sheetc').innerHTML.slice(0,80)]")
            out['hub_sheet']=[await pg.evaluate("!!document.querySelector('.zsr')"),await pg.evaluate("location.hash")]
            await pg.evaluate("closeSheet()");await pg.wait_for_timeout(400)
        await pg.evaluate("location.hash='#settings'");await pg.wait_for_timeout(1500)
        out['settings']=await pg.evaluate("!!document.getElementById('zsrset')")
        await pg.screenshot(path='t_set.png')
        # fallback path: no canShare
        await pg.evaluate("navigator.canShare=undefined;window.__shared=[]")
        await pg.evaluate("ZSH.shareMain()");await pg.wait_for_timeout(800)
        out['fallback_shared']=await pg.evaluate("window.__shared")
        # prompt
        await pg.evaluate("""(()=>{const t=new Date(),k=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');S.zf.d=S.zf.d||{};S.zf.d['2026-10-20']={x:1};S.zf.d['2026-10-21']={x:1};S.zf.d[k]=Object.assign(S.zf.d[k]||{},{m:1});S.zsr={};})()""")
        await pg.evaluate("location.hash='#home'");await pg.wait_for_timeout(3000)
        out['prompt']=await pg.evaluate("!!document.querySelector('.zsrp')")
        await pg.screenshot(path='t_prompt.png')
        if out['prompt']:
            await pg.click('#zsrplater');await pg.wait_for_timeout(500)
            await pg.evaluate("location.hash='#quran'");await pg.wait_for_timeout(800);await pg.evaluate("location.hash='#home'");await pg.wait_for_timeout(3000)
            out['prompt_again']=await pg.evaluate("!!document.querySelector('.zsrp')")
        await pg.evaluate("location.hash='#share'");await pg.wait_for_timeout(1500)
        out['old_share_route']=await pg.evaluate("[location.hash,!!document.querySelector('.zsr'),(document.querySelector('#view h1')||{}).textContent]")
        out['errs']=errs
        await b.close()
    print(json.dumps(out,ensure_ascii=False,indent=0))
asyncio.run(main())
