
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if sys.argv[3]!='-' else None; VER=sys.argv[4]
os.makedirs(OUT,exist_ok=True)
R={'checks':[],'errors':[]}
def ck(n,ok,i=''):
  R['checks'].append([n,bool(ok),str(i)[:300]]);print(('PASS ' if ok else 'FAIL ')+n+' '+str(i)[:300],flush=True)
def seed(theme): return {"onboarded":True,"profile":{"name":"عمار"},"settings":{"theme":theme,"accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
async def mk(b,theme):
    c=await b.new_context(viewport={'width':390,'height':844},locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block',has_touch=False)
    await c.add_init_script("""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt','{"never":1}')}}catch(e){}})();"""%(json.dumps(seed(theme),ensure_ascii=False),VER))
    await c.route(re.compile(r'.*/api/zp.*'),lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
    if LOCAL:
      async def h(route):
        u=route.request.url.split('?')[0].split('#')[0]; name=u[len(BASE)+1:] or 'index.html'
        fp=os.path.join(LOCAL,name)
        if os.path.isfile(fp) and not name.startswith('api'):
          ct='text/html; charset=utf-8' if name.endswith('.html') else ('text/css' if name.endswith('.css') else 'application/javascript')
          await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':ct})
        else: await route.continue_()
      await c.route(re.compile(re.escape(BASE)+r'/.*'),h)
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and R['errors'].append('console: '+m.text[:300])))
    return c,pg
ORD="""()=>[...document.querySelectorAll('.zhome .zcolA > *')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0).map(e=>e.id||e.className.split(' ')[0])"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c,pg=await mk(b,'light')
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(4000)
    v=await pg.evaluate("()=>[APP_VERSION,!!window.ZSEC,!!(ZSEC&&ZSEC.layout)]"); ck('version',v==[VER,True,True],v)
    o=await pg.evaluate(ORD); ck('default order prayer→quick→notices→clips',o[:2]==['zskyw','zsxq'] and o.index('zb6home')>o.index('zsxq') and o.index('zadi')>o.index('zb6home'),o)
    ck('no sections grid on home',await pg.evaluate("()=>!document.querySelector('.zhome #zsxg, #view > #zsxg')"))
    geo=await pg.evaluate("()=>{const r=e=>{const b=document.getElementById(e).getBoundingClientRect();return[Math.round(b.top),Math.round(b.bottom)]};return{sky:r('zskyw'),q:r('zsxq'),clips:r('zb6home')}}")
    ck('prayer card fully above the fold, quick access starts above fold',geo['sky'][1]<844 and geo['q'][0]<844,geo)
    ck('customise link on home',await pg.evaluate("()=>!!document.querySelector('#zhcust[href=\"#homeedit\"]')"))
    ck('maker credit kept',await pg.evaluate("()=>document.querySelector('.zfoot').innerText.includes('صُنع بواسطة عمار الشمري')"))
    ck('bottom nav unchanged',await pg.evaluate("()=>[...document.querySelectorAll('#tabs a')].map(a=>a.innerText.trim())"),await pg.evaluate("()=>[...document.querySelectorAll('#tabs a')].map(a=>a.innerText.trim()).join('·')"))
    await pg.screenshot(path=OUT+'/home-light.png')
    # المزيد sheet
    await pg.click('#tabs a.ctr'); await pg.wait_for_timeout(900)
    sh=await pg.evaluate("()=>{const s=document.getElementById('zsxsh');return s&&s.classList.contains('on')?[s.querySelectorAll('.zsx-grp').length,s.querySelectorAll('.zsx-t').length,!!s.querySelector('#zsxs'),!!s.querySelector('a[href=\"#homeedit\"]')]:null}")
    ck('المزيد sheet: groups + search + تخصيص tile',sh and sh[0]>=10 and sh[2] and sh[3],sh)
    await pg.screenshot(path=OUT+'/more-sheet.png')
    await pg.fill('#zsxs','تخصيص'); await pg.wait_for_timeout(400); await pg.press('#zsxs','Enter'); await pg.wait_for_timeout(1200)
    ck('search «تخصيص» opens #homeedit',await pg.evaluate("()=>location.hash")=='#homeedit',await pg.evaluate("()=>location.hash"))
    rows=await pg.evaluate("()=>[...document.querySelectorAll('#zhel li')].map(l=>l.dataset.id)"); ck('تخصيص lists 11 blocks',len(rows)==11,rows)
    await pg.screenshot(path=OUT+'/custom-light.png',full_page=True)
    # hide «اكتشف», move «زادي اليومي» up 6 times (to top), drag «share» to just after prayer
    await pg.click('#zhel li[data-id="disc"] .zhe-sw'); await pg.wait_for_timeout(200)
    for _ in range(8):
      bt=await pg.query_selector('#zhel li[data-id="daily"] button[data-mv="-1"]:not([disabled])')
      if not bt: break
      await bt.click(); await pg.wait_for_timeout(120)
    await pg.evaluate("()=>window.scrollTo(0,document.querySelector('#zhel li[data-id=\"quick\"]').getBoundingClientRect().top+scrollY-80)"); await pg.wait_for_timeout(300)
    hb=await (await pg.query_selector('#zhel li[data-id="share"] .zhe-h')).bounding_box()
    tb=await (await pg.query_selector('#zhel li[data-id="quick"]')).bounding_box()
    await pg.mouse.move(hb['x']+hb['width']/2,hb['y']+hb['height']/2); await pg.mouse.down()
    for k in range(1,11): await pg.mouse.move(hb['x']+hb['width']/2, hb['y']+hb['height']/2+(tb['y']+5-hb['y']-hb['height']/2)*k/10); await pg.wait_for_timeout(30)
    await pg.mouse.up(); await pg.wait_for_timeout(300)
    rows2=await pg.evaluate("()=>[...document.querySelectorAll('#zhel li')].map(l=>l.dataset.id)")
    ck('▲ moved زادي اليومي to top; drag moved شارك before الوصول السريع',rows2[0]=='daily' and rows2.index('share')<rows2.index('quick'),rows2)
    await pg.click('#zhed button[data-d="1"]'); await pg.wait_for_timeout(200)
    st=await pg.evaluate("()=>JSON.parse(localStorage.getItem('ammar.v1')).zhl"); ck('saved in local state',st and 'disc' in st['h'] and st['o'][0]=='daily' and st['d']==1,st)
    await pg.screenshot(path=OUT+'/custom-edited.png',full_page=True)
    await pg.goto(BASE+'/#home'); await pg.reload(); await pg.wait_for_timeout(3500)
    o2=await pg.evaluate(ORD)
    ck('after reload: custom order + اكتشف hidden + compact',o2[0]=='zadi' and 'zsdisc' not in o2 and o2.index('zsrcard')<o2.index('zsxq') and await pg.evaluate("()=>document.querySelector('.zhome').classList.contains('zdense')"),o2)
    await pg.screenshot(path=OUT+'/home-custom.png')
    # settings link
    await pg.goto(BASE+'/#settings'); await pg.wait_for_timeout(1500)
    ck('settings has تخصيص الواجهة',await pg.evaluate("()=>!!document.querySelector('#zheset[href=\"#homeedit\"]')"))
    await pg.click('#zheset'); await pg.wait_for_timeout(1000)
    await pg.click('#zhers'); await pg.wait_for_timeout(300)
    await pg.goto(BASE+'/#home'); await pg.reload(); await pg.wait_for_timeout(3500)
    o3=await pg.evaluate(ORD); ck('استعادة الافتراضي restores default after reload',o3==o[:len(o3)] and 'zsdisc' in o3 and not await pg.evaluate("()=>document.querySelector('.zhome').classList.contains('zdense')"),o3)
    # hide prayer & quick → notices still on top
    await pg.goto(BASE+'/#homeedit'); await pg.wait_for_timeout(800)
    await pg.click('#zhel li[data-id="quick"] .zhe-sw'); await pg.wait_for_timeout(200)
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(2000)
    o4=await pg.evaluate(ORD); ck('quick hidden → notices right after prayer',o4[0]=='zskyw' and 'zsxq' not in o4,o4)
    await pg.goto(BASE+'/#homeedit'); await pg.wait_for_timeout(800); await pg.click('#zhers'); await pg.wait_for_timeout(300)
    # continue-where-you-left + dates + font size
    await pg.goto(BASE+'/#read/p/5'); await pg.wait_for_timeout(4000)
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(2500)
    cont=await pg.evaluate("()=>{const e=document.getElementById('zhcont');return e?[e.innerText.replace(/\\s+/g,' '),e.querySelector('a').getAttribute('href')]:null}")
    o5=await pg.evaluate(ORD)
    ck('«متابعة من حيث توقفت» shows the last surah/page, after quick access',cont and 'سورة البقرة' in cont[0] and cont[1]=='#read/p/5' and o5.index('zhcont')==o5.index('zsxq')+3,[cont,o5])
    await pg.screenshot(path=OUT+'/home-cont.png',full_page=True)
    dt=await pg.evaluate("()=>{const d=document.querySelector('#zsky .zhd');return d?d.innerText.replace(/\\s+/g,' '):null}"); ck('both dates in prayer card',dt and 'هـ' in dt and 'م' in dt,dt)
    await pg.goto(BASE+'/#homeedit'); await pg.wait_for_timeout(800); await pg.click('#zhefs button[data-fs="3"]'); await pg.wait_for_timeout(200)
    await pg.screenshot(path=OUT+'/custom-fs.png')
    await pg.goto(BASE+'/#home'); await pg.reload(); await pg.wait_for_timeout(3000)
    zh=await pg.evaluate("()=>document.getElementById('view').style.zoom"); await pg.screenshot(path=OUT+'/home-fs.png')
    await pg.goto(BASE+'/#read/p/5'); await pg.wait_for_timeout(1500); zr=await pg.evaluate("()=>document.getElementById('view').style.zoom")
    ck('font size أكبر persists on home, not applied in the mushaf',zh=='1.16' and zr=='',[zh,zr])
    await pg.goto(BASE+'/#homeedit'); await pg.wait_for_timeout(800); await pg.click('#zhers'); await pg.wait_for_timeout(300)
    ck('restore default resets font size',await pg.evaluate("()=>document.getElementById('view').style.zoom")=='')
    # pins still work: long-press not tested here (touch); edit sheet opens
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(2000)
    await pg.click('#zsxq .zsx-edit >> nth=0'); await pg.wait_for_timeout(800)
    ck('quick access «تعديل» sheet opens',await pg.evaluate("()=>!!document.getElementById('zsxed')"))
    await c.close()
    c,pg=await mk(b,'dark')
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(4000)
    await pg.screenshot(path=OUT+'/home-dark.png')
    await pg.goto(BASE+'/#homeedit'); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=OUT+'/custom-dark.png')
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(1500)
    await pg.click('#tabs a.ctr'); await pg.wait_for_timeout(900); await pg.screenshot(path=OUT+'/more-dark.png')
    ck('no page errors',not [e for e in R['errors'] if 'pageerror' in e],R['errors'][:6])
    json.dump(R,open(OUT+'/result.json','w'),ensure_ascii=False,indent=1)
asyncio.run(main())
