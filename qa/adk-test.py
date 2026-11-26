# زاد v5.1 QA: python3 qa/adk-test.py BASE OUTDIR [LOCAL_CONTENT_DIR|-]
# The app's ref/reg call is blocked so no sc_ref row is created on live (the first live run on 2026-10-25 created one; it was deleted through /api/social/admin/ref).
import json,sys,asyncio,os,re
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
os.makedirs(OUT,exist_ok=True); VER='5.1.0'
R={'errors':[],'checks':[]}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:300]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:200],flush=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow',accept_downloads=True)
    await c.add_init_script(INIT)
    if LOCAL:
      async def h(route):
        pth=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,pth)
        if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
        else: await route.continue_()
      await c.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),h)
    await c.route(re.compile(r'.*/api/social/ref/reg.*'),lambda r: r.fulfill(status=200,body='{"ok":true,"n":0}',headers={'content-type':'application/json'}))
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and not re.search(r'Failed to load resource|net::|favicon|status of 4|status of 5|youtube|soundcloud',m.text)) and R['errors'].append('console: '+m.text[:300]))
    async def go(h,w=900):
      await pg.evaluate("h=>{location.hash=h}",h); await pg.wait_for_timeout(w)
    async def shot(n,full=False): await pg.screenshot(path=os.path.join(OUT,n+'.png'),full_page=full)
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(2500)
    await go('#adhkar/morning',300)
    await pg.wait_for_selector('.zb7bar',timeout=15000)
    n=await pg.eval_on_selector_all('#dl .dk','e=>e.length'); a=await pg.eval_on_selector_all('#dl .zb7a','e=>e.length')
    ck('morning 24 cards + actions',n==24 and a==24,(n,a))
    await shot('01-morning')
    await pg.click('#dl .dk:nth-child(5) [data-a=src]'); t=await pg.inner_text('#dl .dk:nth-child(5) .zb7s')
    ck('source+fadl under sayyid al-istighfar','البخاري ٦٣٠٦' in t and 'أهل الجنة' in t.replace('ْ','').replace('َ','') or 'الْجَنَّةِ' in t,t[:120])
    await pg.click('#dl .dk:nth-child(6) [data-a=src]'); t6=await pg.inner_text('#dl .dk:nth-child(6) .zb7s'); ck('weak grade shown honestly','ضعيف' in t6,t6[:80])
    await pg.click('#dl .dk:nth-child(1) [data-a=src]'); t1=await pg.inner_text('#dl .dk:nth-child(1) .zb7s'); ck('unverified item says Hisn only','حصن المسلم' in t1,t1[:60])
    ck('count unchanged by action buttons', (await pg.inner_text('#dl .dk:nth-child(5) .cnt b')).strip() in ('١',), await pg.inner_text('#dl .dk:nth-child(5) .cnt b'))
    await pg.click('.zb7bar [data-b="fs+"]'); await pg.click('.zb7bar [data-b="fs+"]'); cls=await pg.get_attribute('#dl','class'); ck('font size up','zb7fs2' in (cls or ''),cls)
    await pg.click('.zb7bar [data-b="th"]'); cls=await pg.get_attribute('#dl','class'); ck('reading colour paper','zb7paper' in (cls or ''),cls)
    fs=await pg.evaluate("getComputedStyle(document.querySelector('#dl .dk p')).fontSize"); ck('font applied',fs=='22px',fs)
    await shot('02-source-font')
    await pg.click('#dl .dk:nth-child(3) p'); await pg.wait_for_timeout(200)
    pr=await pg.inner_text('#zb7prog'); ck('progress after one count','١ من ٢٤' in pr,pr[:60])
    await pg.click('#dl .dk:nth-child(5) [data-a=fav]'); fv=await pg.evaluate("S.zb7.fav"); ck('fav saved','morning:4' in fv,fv)
    async with pg.expect_download(timeout=15000) as dl:
      await pg.click('#dl .dk:nth-child(5) [data-a=share]')
    d=await dl.value; fp=os.path.join(OUT,'share.png'); await d.save_as(fp); ck('share image made',os.path.getsize(fp)>20000,os.path.getsize(fp))
    q=await pg.eval_on_selector_all('#dl [data-a=play]','e=>e.length'); ck('listen button on Quranic items',q==2,q)
    # focus mode
    await pg.click('.zb7bar [data-b=focus]'); await pg.wait_for_selector('.zb7fo')
    t0=await pg.inner_text('.zb7fo .hd'); await shot('03-focus'); await pg.click('.zb7fo .tx'); await pg.wait_for_timeout(900); t1=await pg.inner_text('.zb7fo .hd')
    ck('focus counts and advances',t0!=t1,(t0[:30],t1[:30]))
    await pg.click('.zb7fo [data-f=x]'); ck('focus closes', await pg.query_selector('.zb7fo') is None)
    # complete all
    await pg.evaluate("""()=>{document.querySelectorAll('#dl .dk').forEach(el=>{let g=0;while(!el.classList.contains('fin')&&g<120){el.click();g++}})}""")
    await pg.wait_for_timeout(400)
    dn=await pg.is_visible('#zb7done'); st=await pg.evaluate("(S.zf&&S.zf.d&&Object.keys(S.zf.d))||[]"); ck('done banner + streak recorded',dn and len(st)>=1,await pg.inner_text('#zb7done') if dn else st)
    await pg.evaluate("window.scrollTo(0,0)"); await shot('04-done')
    for cat,cnt in [('evening',24),('prayer',8),('sleep',13),('wake',4)]:
      await go('#adhkar/'+cat,1200); await pg.wait_for_selector('.zb7bar',timeout=10000)
      n=await pg.eval_on_selector_all('#dl .dk','e=>e.length'); ck('cat '+cat,n==cnt,n)
    on=await pg.inner_text('.seg .on'); ck('wake tab selected','الاستيقاظ' in on,on)
    await pg.click('#dl .dk:nth-child(2) [data-a=src]'); t=await pg.inner_text('#dl .dk:nth-child(2) .zb7s'); ck('wake fadl','١١٥٤' in t,t[:80]); await shot('05-wake')
    await go('#adkfav',1500); n=await pg.eval_on_selector_all('#zb7r .zb7c','e=>e.length'); ck('favourites page',n==1,n); await shot('06-fav')
    await go('#adksearch',1500); await pg.fill('#zb7q','الهم'); await pg.wait_for_timeout(600); n=await pg.eval_on_selector_all('#zb7r .zb7c','e=>e.length'); ck('search results',n>=2,n); await shot('07-search')
    await go('#feel',1500); await pg.click('[data-i="0"]'); await pg.wait_for_timeout(900); n=await pg.eval_on_selector_all('#zb7r .zb7c','e=>e.length'); ck('feelings -> Hisn chapter',n>=1,n); await pg.evaluate("window.scrollTo(0,0)"); await shot('08-feel')
    await go('#adkrem',1500); await pg.click('[data-r="rd.on"]'); await pg.click('[data-r="lt.on"]'); x=await pg.evaluate("window.zPushX&&zPushX().adk"); ck('reminder cfg rides push',x and x['rd']['on'] and x['lt']['on'],x); await shot('09-rem')
    await pg.click('[data-r="rd.on"]'); await pg.click('[data-r="lt.on"]')
    await go('#sec/adhkar',1500); nb=await pg.eval_on_selector_all('.zs-new','e=>e.length'); ck('جديد badges in adhkar hub',nb>=5,nb); await shot('10-hub')
    for r in ['#home','#sec/quran','#sec/prayer','#diwan','#dorous','#tasbeeh','#duas','#mythkr','#athkarvoice','#sleep','#whatsnew','#settings']:
      await go(r,1800); ln=await pg.evaluate("document.getElementById('view')?document.getElementById('view').innerText.length:document.body.innerText.length"); ck('route '+r,ln>40,ln)
    wn=await pg.inner_text('#view') if await pg.query_selector('#view') else ''
    await go('#whatsnew',1200); w=await pg.evaluate("document.body.innerText"); ck('whatsnew top is 5.1.0','5.1.0' in w or '٥٫١' in w or 'الأذكار صارت أقوى' in w)
    swv=await pg.evaluate("fetch('sw.js',{cache:'no-store'}).then(r=>r.text()).then(t=>t.slice(0,40))"); ck('sw version','ammar-v5-1-0' in swv,swv)
    if not LOCAL:
      await pg.wait_for_timeout(1500); act=await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>r&&(r.active||r.waiting||r.installing)?(r.active||r.waiting||r.installing).scriptURL:null)"); ck('sw registered',bool(act),act)
    ck('no page errors',not R['errors'],R['errors'][:5])
    await b.close()
  json.dump(R,open(os.path.join(OUT,'result.json'),'w'),ensure_ascii=False,indent=1)
  print('TOTAL',sum(x['ok'] for x in R['checks']),'/',len(R['checks']))
asyncio.run(main())
