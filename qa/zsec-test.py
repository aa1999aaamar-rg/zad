
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
os.makedirs(OUT,exist_ok=True)
SEED={"onboarded":True,"profile":{"name":"عمار"},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','5.5.1');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%json.dumps(SEED,ensure_ascii=False)
OVR={'zsec.js','pt.js','up.js','index.html','sw.js'}
R={'checks':[],'errors':[],'broken':[]}
def ck(n,ok,i=''):
  R['checks'].append([n,bool(ok),str(i)[:200]]);print(('PASS ' if ok else 'FAIL ')+n+' '+str(i)[:200],flush=True)
async def ctx(p,b,seed=True):
    c=await b.new_context(viewport={'width':390,'height':844},locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block',has_touch=True)
    if seed: await c.add_init_script(INIT)
    await c.route(re.compile(r'.*/api/zp.*'),lambda r: r.fulfill(status=200,body='{"ok":true}',headers={'content-type':'application/json'}))
    if LOCAL:
      async def h(route):
        u=route.request.url.split('?')[0].split('#')[0]; name=u.rsplit('/',1)[1] or 'index.html'
        if name in OVR and os.path.exists(os.path.join(LOCAL,name)):
          await route.fulfill(status=200,body=open(os.path.join(LOCAL,name),'rb').read(),headers={'Content-Type':'text/html; charset=utf-8' if name.endswith('.html') else 'application/javascript'})
        else: await route.continue_()
      await c.route(re.compile(re.escape(BASE)+r'/[^/]*$'),h)
    return c
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await ctx(p,b); pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and R['errors'].append('console: '+m.text[:300])))
    R['aladhan']=[];pg.on('request',lambda q:('api.aladhan.com' in q.url and R['aladhan'].append(q.url[:120])));pg.on('dialog',lambda d: asyncio.ensure_future(d.dismiss()))
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(3500)
    ver=await pg.evaluate("()=>[typeof APP_VERSION!=='undefined'?APP_VERSION:null, !!window.ZSEC]"); ck('version+module',ver==['5.5.1',True],ver)
    # coverage: every F route reachable in <=2 taps from home
    cov=await pg.evaluate("""()=>{const F=ZS.F,home=new Set(),hubs=new Set();document.querySelectorAll('#view a[href^="#"]').forEach(a=>{const h=a.getAttribute('href').slice(1);if(h.startsWith('sec/'))hubs.add(h.slice(4));else home.add(h.split('/')[0])});
      const two=new Set(home);ZS.SEC.forEach(s=>{if(hubs.has(s.id))s.g.forEach(g=>g[1].forEach(r=>two.add(r)))});
      return {nF:Object.keys(F).length,home:home.size,hubs:[...hubs],missing:Object.keys(F).filter(r=>!two.has(r)),hubsAll:ZS.SEC.map(s=>s.id).filter(id=>!hubs.has(id))}}""")
    ck('every route ≤2 taps from home',not cov['missing'],cov)
    tiles=await pg.evaluate("()=>[...document.querySelectorAll('#zsxg .zsx-t')].map(a=>a.getAttribute('href').slice(1))")
    alls=await pg.evaluate("()=>[...document.querySelectorAll('#zsxg .zsx-all')].map(a=>a.getAttribute('href').slice(1))")
    qa=await pg.evaluate("()=>[...document.querySelectorAll('#zsxq .zsx-qt[data-zr]')].map(a=>a.dataset.zr)")
    ck('quick access defaults',qa[:4]==['quran','adhkar','prayer','lecture'],qa)
    small=await pg.evaluate("()=>[...document.querySelectorAll('#zsxq .zsx-qt, #zsxq .zsx-edit, #zsxq .zsx-sb, #zsxg .zsx-t, #zsxg .zsx-all, #zsxg .zsx-jump button, #tabs a')].map(e=>{const r=e.getBoundingClientRect();return [e.className.slice(0,20),Math.round(r.width),Math.round(r.height)]}).filter(x=>x[1]<44||x[2]<38)")
    ck('tap targets ≥44px (jump chips ≥38)',not small,small[:8])
    rtl=await pg.evaluate("()=>[document.documentElement.dir,getComputedStyle(document.querySelector('#zsxg .zsx-tiles')).direction]"); ck('RTL',rtl==['rtl','rtl'],rtl)
    # tap every grid card + every «الكل»
    for r in tiles+alls:
      await pg.goto(BASE+'/#home'); await pg.reload(); await pg.wait_for_timeout(1500)
      try:
        await pg.click(f'#zsxg a[href="#{r}"] >> nth=0',timeout=4000)
      except Exception as e:
        R['broken'].append([r,'click: '+str(e)[:80]]);continue
      await pg.wait_for_timeout(1300)
      if r in ('car','shareapp','backup','offline'): await pg.screenshot(path=OUT+'/r-'+r+'.png')
      st=await pg.evaluate("()=>({ov:[...document.querySelectorAll('body > *')].filter(e=>e.id!=='view'&&getComputedStyle(e).position==='fixed'&&e.getBoundingClientRect().height>300&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(e=>e.id||e.className).slice(0,4),h:location.hash,len:(document.getElementById('view').innerText||'').trim().length,home:!!document.querySelector('#view .zhome'),h1:(document.querySelector('#view h1, #view h2, #view b')||{}).innerText||''})")
      ok=(st['h']=='#'+r and st['len']>20 and not st['home']) or bool(st['ov'])
      if st['ov']: R.setdefault('overlay',[]).append([r,st['ov'],st['h']])
      if not ok: R['broken'].append([r,st])
    ck(f'all {len(tiles)} cards + {len(alls)} «الكل» links open',not R['broken'],R['broken'])
    # long press pin/unpin
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(1200)
    async def lpress(sel):
      await pg.locator(sel).first.scroll_into_view_if_needed(); await pg.wait_for_timeout(300); box=await pg.locator(sel).first.bounding_box(); x=box['x']+box['width']/2; y=box['y']+box['height']/2
      await pg.mouse.move(x,y); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(400)
    await lpress('#zsxg a[data-zr="qibla"]')
    st=await pg.evaluate("()=>({h:location.hash,fav:S.zs.fav,qa:[...document.querySelectorAll('#zsxq .zsx-qt[data-zr]')].map(a=>a.dataset.zr),dot:!!document.querySelector('#zsxg a[data-zr=qibla] .zsx-pin'),saved:JSON.parse(localStorage.getItem('ammar.v1')).zs.fav})")
    ck('long-press pins (no navigation, row+dot+storage updated)',st['h'] in ('#home','') and 'qibla' in st['fav'] and 'qibla' in st['qa'] and st['dot'],st)
    await pg.wait_for_timeout(1000)
    await pg.screenshot(path=OUT+'/pinned.png')
    await lpress('#zsxq a[data-zr="qibla"]')
    st=await pg.evaluate("()=>({fav:S.zs.fav,qa:[...document.querySelectorAll('#zsxq .zsx-qt[data-zr]')].map(a=>a.dataset.zr)})")
    ck('long-press unpins',('qibla' not in st['fav']) and 'qibla' not in st['qa'],st)
    # persistence after reload
    await pg.reload(); await pg.wait_for_timeout(2500)
    st=await pg.evaluate("()=>[...document.querySelectorAll('#zsxq .zsx-qt[data-zr]')].map(a=>a.dataset.zr)"); ck('pins persist after reload',st[:4]==['quran','adhkar','prayer','lecture'],st)
    # edit sheet
    await pg.click('#zsxq button.zsx-edit >> nth=0'); await pg.wait_for_timeout(600)
    await pg.screenshot(path=OUT+'/edit.png')
    await pg.click('#zsxed [data-mv="adhkar"][data-d="-1"]'); await pg.wait_for_timeout(200)
    await pg.click('#zsxed .zsx-et[data-tg="tasbeeh"]'); await pg.wait_for_timeout(200)
    await pg.click('#zsxed .zsx-pi .rm[data-tg="lecture"]'); await pg.wait_for_timeout(200)
    st=await pg.evaluate("()=>S.zs.fav"); ck('edit sheet: reorder/add/remove',st==['adhkar','quran','prayer','tasbeeh'],st)
    await pg.click('.zsx-done'); await pg.wait_for_timeout(500)
    st=await pg.evaluate("()=>[...document.querySelectorAll('#zsxq .zsx-qt[data-zr]')].map(a=>a.dataset.zr)"); ck('home row reflects edit',st[:4]==['adhkar','quran','prayer','tasbeeh'],st)
    await pg.evaluate("()=>{S.zs.fav=['quran','adhkar','prayer','lecture'];save()}")
    # more sheet
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(800)
    await pg.click('#tabs a.ctr'); await pg.wait_for_timeout(600)
    st=await pg.evaluate("()=>({on:document.getElementById('zsxsh').classList.contains('on'),grp:document.querySelectorAll('#zsxsh .zsx-grp').length,old:!!(document.getElementById('zs7sh')&&document.getElementById('zs7sh').classList.contains('on'))})")
    ck('المزيد opens grouped sheet',st['on'] and st['grp']==10 and not st['old'],st)
    sheetR=await pg.evaluate("()=>[...document.querySelectorAll('#zsxsh a[href^=\"#\"]')].map(a=>a.getAttribute('href').slice(1))")
    old=['sec/prayer','hufaz','balligh','dorar','hcheck','dorous','sections','search','prayer','qibla','tasbeeh','natiq','rihla','whatsnew','settings']
    miss=[x for x in old if x not in sheetR and not (x=='search')]
    ck('every old «المزيد» item still in the sheet',not miss,miss)
    await pg.click('#zsxsh a[href="#hufaz"]'); await pg.wait_for_timeout(900)
    st=await pg.evaluate("()=>({h:location.hash,on:document.getElementById('zsxsh').classList.contains('on')})"); ck('sheet tile navigates + closes',st=={'h':'#hufaz','on':False},st)
    await pg.click('#tabs a.ctr'); await pg.wait_for_timeout(500); await pg.fill('#zsxs','المحاضرة'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(900)
    ck('sheet search Enter opens section',await pg.evaluate("()=>location.hash")=='#lecture')
    # search direct open
    for q,exp in [('المحاضرة','#lecture'),('سبحة','#tasbeeh'),('الشاملة','#shamela'),('مواقيت الصلاة','#prayer'),('قبله','#qibla'),('الأسرة','#sec/family'),('المصحف','#quran'),('الأذكار','#adhkar'),('الزكاة','#zakat'),('ديوانية','#diwan')]:
      await pg.goto(BASE+'/#search'); await pg.wait_for_timeout(700)
      await pg.fill('#zsq',q); await pg.wait_for_timeout(250)
      top=await pg.evaluate("()=>{const a=document.querySelector('#zsres .zsx-go');return a?a.getAttribute('href'):null}")
      await pg.keyboard.press('Enter'); await pg.wait_for_timeout(700)
      h=await pg.evaluate("()=>location.hash"); ck(f'search «{q}» → {exp}',h==exp and top==exp,[top,h])
    await pg.goto(BASE+'/#search'); await pg.wait_for_timeout(600); await pg.fill('#zsq','الصبر'); await pg.wait_for_timeout(300)
    ck('shamela row still in search',await pg.evaluate("()=>!!document.querySelector('#zshr')"))
    await pg.goto(BASE+'/#shamela'); await pg.wait_for_timeout(600); await pg.fill('#zsxshq','الصبر')
    ck('#shamela page link',await pg.evaluate("()=>document.getElementById('zsxshb').href")=='https://shamela.ws/search?q=%D8%A7%D9%84%D8%B5%D8%A8%D8%B1')
    await pg.goto(BASE+'/#lib'); await pg.wait_for_timeout(1500); ck('library shamela card',await pg.evaluate("()=>!!document.querySelector('#zshc')"))
    # lecture auto-prepare
    await pg.goto(BASE+'/#lecture'); await pg.wait_for_timeout(2500)
    t=await pg.evaluate("()=>document.getElementById('view').innerText"); ck('lecture page + تحضير تلقائي',('تحضير تلقائي' in t),t[:120])
    # hijri on #hijri / #occ (local)
    R['errors']=[e for e in R['errors']]
    await pg.goto(BASE+'/#hijri'); await pg.wait_for_timeout(2500)
    hj=await pg.evaluate("()=>document.getElementById('view').innerText.slice(0,200)"); ck('hijri page renders',('جمادى' in hj or '١٤٤٨' in hj),hj[:120])
    await pg.goto(BASE+'/#occ'); await pg.wait_for_timeout(2500)
    oc=await pg.evaluate("()=>[document.getElementById('view').innerText.slice(0,160),localStorage.getItem('ammar.hj')]"); ck('occasions + gToH local',bool(oc[1]),oc)
    await pg.goto(BASE+'/#home'); await pg.wait_for_timeout(1500)
    g=await pg.evaluate("()=>(document.querySelector('.zgreet')||{}).innerText||''"); ck('home hijri date',('جمادى' in g),g[:80])
    await c.close()
    # onboarding (fresh, no seed)
    c2=await ctx(p,b,seed=False); p2=await c2.new_page(); await p2.goto(BASE+'/',wait_until='load'); await p2.wait_for_timeout(3000)
    t=await p2.evaluate("()=>document.body.innerText"); ck('onboarding shows for a new user','نناديك' in t or 'أهلاً' in t,t[:100])
    await p2.screenshot(path=OUT+'/onboard.png'); await c2.close()
    ck('no network calls to api.aladhan.com',not R['aladhan'],R['aladhan'][:5])
    ck('no console/page errors',not R['errors'],R['errors'][:8])
    print('OVERLAY',R.get('overlay'));json.dump(R,open(OUT+'/results.json','w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
