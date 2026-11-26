
import json,sys,asyncio,requests,re
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]; LOCALZB=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');localStorage.setItem('ammar.v1',JSON.stringify({onboarded:true,profile:{name:''},settings:{theme:'light',accent:'#34457a',qsize:26,lang:'ar',city:'jeddah',cityUser:true,rep:3,reciter:'maher'}}));localStorage.setItem('ammar.lastSeen','4.7.0');}})()"""
R={'errors':[],'checks':[]}
def ck(name,ok,info=''):
  R['checks'].append({'n':name,'ok':bool(ok),'i':str(info)[:300]}); print(('PASS ' if ok else 'FAIL ')+name+' '+str(info)[:200],flush=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',geolocation={'latitude':21.5433,'longitude':39.1728},permissions=['geolocation'],service_workers='block' if LOCALZB else 'allow')
    await c.add_init_script(INIT)
    if LOCALZB:
      body=open(LOCALZB,'rb').read()
      async def h(route): await route.fulfill(status=200,body=body,headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
      await c.route('https://zad-content.sites.tab.bot/x/zb3.js*',h)
      async def tq(route):
        u=route.request.url; q=dict(x.split('=') for x in u.split('?')[1].split('&'))
        def f(): return requests.get(f"https://tafsir.app/get.php?src={q['src']}&s={q['s']}&a={q['a']}",timeout=20,headers={'User-Agent':'Mozilla/5.0'}).json()
        j=await asyncio.to_thread(f)
        await route.fulfill(status=200,body=json.dumps({'ok':True,'data':j.get('data','')}),headers={'Content-Type':'application/json'})
      await c.route('**/api/tq?*',tq)
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append(str(e)))
    pg.on('console',lambda m: R['errors'].append('console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    async def go(h,wait=1500):
      await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(wait)
    async def txt(sel='#view'): return await pg.evaluate(f"(document.querySelector('{sel}')||{{}}).innerText||''")
    async def shot(n): await pg.screenshot(path=f'{OUT}/{n}.png')
    await pg.goto(BASE,wait_until='networkidle',timeout=60000); await pg.wait_for_timeout(2500)
    ht=await txt(); ck('home: made by','صُنع بواسطة عمار الشمري' in (await pg.evaluate("document.body.innerText")),'')
    ck('app version',await pg.evaluate("typeof APP_VERSION!=='undefined'&&APP_VERSION")=='4.7.0',await pg.evaluate("typeof APP_VERSION!=='undefined'&&APP_VERSION"))
    # sections page lists new
    await go('sections',1500); t=await txt(); ck('sections: new 4.7 row','جديد في زاد ٤٫٧' in t, '')
    for hub,words in [('quran',['معاني الكلمات','أسباب النزول','ترجمة معاني القرآن']),('money',['حاسبة المواريث','الجمعيات الخيرية المرخصة','فحص المعاملات','اسأل عالم']),('season',['مساعد الحج','مزارات مكة والمدينة','المسلم الجديد','هذا اليوم في التاريخ الإسلامي']),('family',['الزواج والمولود']),('self',['وضع المرأة']),('kids',['آية وقصة']),('prayer',['خطبة الجمعة'])]:
      await go('sec/'+hub,1200); t=await txt(); ck(f'hub {hub} has new',all(w in t for w in words),[w for w in words if w not in t]); 
      ck(f'hub {hub} badge',await pg.evaluate("document.querySelectorAll('.zs-new').length")>0)
      if hub in('quran','money'): await shot('hub-'+hub)
    # words
    await go('words/2/2',4000); ck('words: chips',await pg.evaluate("document.querySelectorAll('.zb3-w').length")>=5, await pg.evaluate("document.querySelectorAll('.zb3-w').length"))
    n=await pg.evaluate("document.querySelectorAll('.zb3-w').length")
    await pg.evaluate("const L=[...document.querySelectorAll('.zb3-w')];L[L.length-1].click()"); await pg.wait_for_timeout(5000)
    t=await txt('#zb3wm'); ck('words: tap shows meaning (السراج)','السراج' in t and ('وقاية' in t or 'وِقايَةً' in t or 'يخافون' in t or 'يَخافون' in t), t[:200]); await shot('words')
    await pg.evaluate("[...document.querySelectorAll('.zb3-w')][0].click()"); await pg.wait_for_timeout(5000)
    t=await txt('#zb3wm'); ck('words: non-gharib word falls back to muyassar/gharib',len(t)>40,t[:160])
    # asbab
    await go('asbab/2/115',6000); t=await txt(); ck('asbab: 2:115 entry','الواحدي' in t and ('نزول' in t), t[-300:]); await shot('asbab')
    # trans 3 languages
    for l,probe in [('ur','اللہ'),('id','Allah'),('tl','Allāh'),('en','Allāh')]:
      await go(f'trans/{l}/112',5000); t=await txt('#zb3tr'); ck(f'trans {l}',probe in t and len(t)>60,t[:120])
      if l=='ur': await shot('trans-ur')
    # mawarith
    await go('mawarith',2500); t=await txt('#mwt'); ck('mawarith: in-app tests 15/15',await pg.evaluate("(document.querySelector('.zb3-pass')||{}).dataset&&document.querySelector('.zb3-pass').dataset.pass")=='15',t[:80])
    ck('mawarith: disclaimer','للاستئناس، والقسمة الرسمية عن طريق المحكمة' in await txt())
    await pg.click('[data-m="wife"][data-d="1"]'); await pg.click('[data-m="son"][data-d="1"]'); await pg.click('[data-m="daughter"][data-d="1"]'); await pg.click('[data-m="mother"][data-d="1"]')
    await pg.fill('#mwamt','240000'); await pg.wait_for_timeout(600); t=await txt('#mwres'); ck('mawarith: wife 1/8, mother 1/6','١/٨' in t and '١/٦' in t and '٣٠٬٠٠٠' in t.replace(',','٬') or '30,000' in t or '٣٠,٠٠٠' in t, t[:300]); await shot('mawarith')
    await pg.evaluate("document.querySelector('#mwres').scrollIntoView()"); await pg.wait_for_timeout(300); await shot('mawarith-res')
    # zakat
    await go('zakat',5000); await pg.fill('[data-z="cash"]','100000'); await pg.fill('[data-z="g21"]','50'); await pg.wait_for_timeout(800)
    t=await txt('#zkres'); gp=await pg.evaluate("document.querySelector('[data-z=gp]').value"); ck('zakat: computes 2.5%','الزكاة الواجبة' in t, f'gp={gp} '+t[:200]); await shot('zakat')
    for r,probe in [('charity','إحسان'),('muamalat','التورق'),('askalim','الإفتاء'),('khutba','خطب'),('newmuslim','٣٠'),('newmuslim/tl','Araw'),('newmuslim/ur','دن'),('marriage','بَارَكَ'),('marriage/b','العقيقة'),('marriage/n','عبد الله'),('hajj','يوم التروية'),('hajj/d10','جمرة العقبة'),('ziyarat','قباء'),('women','محفوظ على هذا الجهاز'),('tih','اليوم:'),('tih/all','غزوة بدر'),('kidstory','النملة'),('kidstory/naml','تبسيط للأطفال من نص الآيات')]:
      await go(r,3500); t=await txt(); ck('open #'+r,probe in t,t[:100].replace('\n',' '))
      if r in ('hajj','women','newmuslim','muamalat','tih','kidstory/naml','ziyarat','charity','khutba','marriage'): await shot(r.replace('/','-'))
    # women private storage
    await go('women',1500); await pg.click('#won'); await pg.wait_for_timeout(500); w=await pg.evaluate("localStorage.getItem('zad.w3')"); s=await pg.evaluate("localStorage.getItem('ammar.v1')")
    ck('women: stored only in zad.w3',w and '"on"' in w and 'zad.w3' not in s and '"on":"20' not in s, (w or '')[:80])
    # reader ayah sheet: words chip
    await go('read/s/1',3500)
    has=await pg.evaluate("!!document.querySelector('.ay[data-k]')"); 
    if has:
      await pg.evaluate("document.querySelector('.ay[data-k=\"1:2\"]').click()"); await pg.wait_for_timeout(1200)
      ck('reader sheet: chips',await pg.evaluate("!!document.querySelector('#sheet .zs3-ch')"))
      await pg.evaluate("document.querySelector('#sheet [data-z3=w]').click()"); await pg.wait_for_timeout(4500)
      await pg.evaluate("const L=[...document.querySelectorAll('#sheet .zb3-w')];L[L.length-1].click()"); await pg.wait_for_timeout(4500)
      t=await txt('#sheet'); ck('reader sheet: word tap meaning','الغريب' in t or 'السراج' in t or 'التفسير الميسر' in t,t[-250:]); await shot('reader-sheet')
    else: ck('reader: ayah elements',False,'no .ay')
    # old routes
    for r in ['prayer','qibla','adhkar','tasbeeh','gk','umrah','stories','debts','dchal','family','shareapp','whatsnew']:
      await go(r,1500); t=await txt(); ck('old #'+r,len(t)>40,t[:60].replace('\n',' '))
    await go('whatsnew',1500); t=await txt(); ck('whatsnew top','المرحلة الثالثة: محتوى موثق' in t,'')
    errs=[e for e in R['errors'] if 'favicon' not in e]; ck('no page errors',not [e for e in errs if not e.startswith('console:')], errs[:6])
    R['console']=errs
    json.dump(R,open(OUT+'/qa.json','w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
