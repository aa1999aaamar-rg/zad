
import json,sys,asyncio,random
from playwright.async_api import async_playwright
BASE=sys.argv[1]; OUT=sys.argv[2]; LOCALZB=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None; MODE=sys.argv[4] if len(sys.argv)>4 else 'all'
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');localStorage.setItem('ammar.v1',JSON.stringify({onboarded:true,profile:{name:''},settings:{theme:'light',accent:'#34457a',qsize:26,lang:'ar',city:'jeddah',rep:3,reciter:'maher'}}));localStorage.setItem('ammar.lastSeen','4.5.0');}})()"""
R={'errors':[],'checks':[]}
def ck(name,ok,info=''):
  R['checks'].append({'n':name,'ok':bool(ok),'i':str(info)[:300]}); print(('PASS ' if ok else 'FAIL ')+name+' '+str(info)[:160],flush=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',geolocation={'latitude':21.5433,'longitude':39.1728},permissions=['geolocation'],service_workers='block' if LOCALZB else 'allow')
    await c.add_init_script(INIT)
    if LOCALZB:
      body=open(LOCALZB,'rb').read()
      async def h(route): await route.fulfill(status=200,body=body,headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
      await c.route('https://zad-content.sites.tab.bot/x/zb1.js*',h)
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append(str(e)))
    pg.on('console',lambda m: R['errors'].append('console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text else None)
    async def go(h,wait=1200):
      await pg.evaluate(f"location.hash='{h}'"); await pg.wait_for_timeout(wait)
    async def txt(sel='#view'): return await pg.evaluate(f"(document.querySelector('{sel}')||{{}}).innerText||''")
    await pg.goto(BASE,wait_until='networkidle',timeout=60000); await pg.wait_for_timeout(2500)
    # home
    ht=await txt(); ck('home: prayer card',('الصلاة القادمة' in ht) or ('الفجر' in ht),ht[:80]); ck('home: favourites',await pg.evaluate("document.querySelectorAll('#zsfav .ztile').length")>=8)
    ck('home: zadi',await pg.evaluate("!!document.getElementById('zadi')")); ck('home: discover',await pg.evaluate("document.querySelectorAll('#zsdisc .zs-dc').length")>=5)
    ck('home: share card',await pg.evaluate("!!document.getElementById('zsrcard')")); ck('home: made by',('صُنع بواسطة عمار الشمري' in ht))
    ck('home: calm (no old quick grid/ward/qod)',await pg.evaluate("!document.getElementById('zward')&&!document.getElementById('zqod')&&!document.querySelector('.zfhome')"))
    await pg.screenshot(path=OUT+'/home.png',full_page=True)
    if MODE in('all','nav'):
      tabs=await pg.evaluate("[...document.querySelectorAll('#tabs a')].map(a=>a.getAttribute('href'))"); ck('tabs: 5',len(tabs)==5,tabs)
      for i,t in enumerate(tabs):
        await pg.click(f'#tabs a:nth-child({i+1})'); await pg.wait_for_timeout(1300)
        on=await pg.evaluate("(document.querySelector('#tabs a.on')||{}).getAttribute&&document.querySelector('#tabs a.on').getAttribute('href')")
        h1=await txt('h1.page') if t!='#home' else 'home'
        ck(f'tab {t}',on==t and h1,f'{on} {h1}')
      hubs=['quran','prayer','adhkar','season','family','money','self','content','kids','tools']
      for hb in hubs:
        await go('sec/'+hb); n=await pg.evaluate("document.querySelectorAll('.zs-card').length"); m=await pg.evaluate("document.querySelectorAll('.zs-most .ztile').length")
        ck(f'hub {hb}',n>=4 and m>=2,f'cards={n} most={m} {await txt("h1.page")}')
        if hb in('quran','money','self','kids'): await pg.screenshot(path=f'{OUT}/hub-{hb}.png',full_page=True)
      await go('sections'); ck('sections page',await pg.evaluate("document.querySelectorAll('.zs-hub').length")==10)
      await pg.screenshot(path=OUT+'/sections.png',full_page=True)
      for q,exp in [('قبلة','qibla'),('القبلة','qibla'),('زكاة','zakat'),('دين','debts'),('ديون','debts'),('والدين','birr'),('مطر','wxdua'),('سهو','sahw'),('حفظ','hifz'),('مقاطع','videos'),('رمضان','ramadan'),('غضب','anger'),('الرقيه','ruqyah'),('نية','niyya')]:
        await pg.fill('#zsq',q); await pg.wait_for_timeout(250)
        rs=await pg.evaluate("[...document.querySelectorAll('#zsres a.zs-a')].map(a=>a.getAttribute('href'))")
        ck(f'search {q}', ('#'+exp) in rs[:6], rs[:4])
      await pg.fill('#zsq','')
      await go('search'); ck('header search route',await pg.evaluate("!!document.getElementById('zsq')"))
      # favourites pin
      await go('sec/money'); await pg.click('[data-fav="debts"]'); await pg.wait_for_timeout(300)
      await go('home',1500); ck('fav pinned shows on home',await pg.evaluate("[...document.querySelectorAll('#zsfav .ztile')].some(a=>a.getAttribute('href')==='#debts')"))
      # old routes
      old=['prayer','qibla','tasbeeh','adhkar','hifz','zakat','khatma','salah','umrah','sawm','quotes','articles','settings','whatsnew','kids','car','mosques','gk','occ','shareapp','lib','pdfs','asma','ruqyah']
      random.seed(7); pick=random.sample(old,12)
      for r in pick:
        await go(r,1800); t=await txt(); ck(f'old route #{r}',len(t)>40 and 'تعذّر' not in t[:60],t[:50].replace('\n',' '))
      await go('video/x1',2500); ck('old deep link #video/…',await pg.evaluate("location.hash.indexOf('#video')===0||!!document.getElementById('zv')"))
      await go('shareapp',1500); ck('#shareapp sheet',await pg.evaluate("!!document.querySelector('#sheet:not([hidden])')"))
      await pg.evaluate("try{closeSheet()}catch(e){}")
      await go('services',1000); ck('#services alias',await pg.evaluate("document.querySelectorAll('.zs-hub').length")==10)
    if MODE in('all','feat'):
      NEW=['wxdua','debts','qada','jamaa','sahw','birr','rahim','ghayb','kidtasks','hawl','sbudget','kaffara','anger','anxious','quit','tongue','phonefast','shukr','niyya']
      for r in NEW:
        await go(r,2500); h=await txt('h1.page'); ck(f'open #{r}',len(h)>2 and 'تعذّر' not in await txt(),h)
      # actions
      async def act(r,js,wait=600):
        await go(r,1800); 
        try: await pg.evaluate(js)
        except Exception as e: ck(f'action {r}',False,e); return
        await pg.wait_for_timeout(wait)
      await act('debts',"document.getElementById('dn').value='أبو فهد';document.getElementById('da').value='500';document.getElementById('dd').value=new Date(Date.now()+864e5).toISOString().slice(0,10);document.getElementById('dadd').click()")
      await act('qada',"document.getElementById('qd').value='10';document.getElementById('qsave').click()"); await act('qada',"document.querySelector('[data-q=f]').click()")
      await act('jamaa',"document.querySelector('[data-p][data-v=j]').click()")
      await act('birr',"document.getElementById('bcall').click()")
      await act('rahim',"document.getElementById('rn').value='خالي إبراهيم';document.getElementById('radd').click()")
      await act('ghayb',"document.getElementById('gn').value='أمي';document.getElementById('gadd').click()")
      await act('kidtasks',"document.getElementById('kn').value='سارة';document.getElementById('kadd').click()",1500); await act('kidtasks',"document.querySelector('[data-t]').click()")
      await act('hawl',"document.getElementById('hl').value='مدخراتي';document.getElementById('hadd').click()")
      await act('sbudget',"document.getElementById('sa').value='50';document.getElementById('sadd').click()")
      await act('kaffara/yamin',"const c=document.getElementById('kc');c.value='2';c.dispatchEvent(new Event('input'));const p=document.getElementById('kp');p.value='6';p.dispatchEvent(new Event('input'))")
      kt=await txt(); ck('kaffara calc: 2 كفارات → 30 كجم',('٣٠' in kt) and ('١٨٠' in kt),'')
      await act('anger',"document.getElementById('ago').click()",1500); await pg.evaluate("document.getElementById('agok').click()"); await pg.wait_for_timeout(500)
      await act('anxious',"document.querySelector('[data-af]').click()")
      await act('quit',"document.querySelector('[data-qp]').click()")
      await act('tongue',"document.getElementById('tgg').click()")
      await act('phonefast',"document.querySelector('[data-m=\"15\"]').click()",1200)
      await act('shukr',"document.querySelector('[data-n=\"0\"]').value='الصحة';document.getElementById('nsave').click()")
      await act('niyya',"document.querySelector('[data-ny]').click()")
      await act('sahw/shak',"1",800); st=await txt(); ck('sahw result has source',('قبل السلام' in st) and ('صحيح مسلم' in st))
      await act('sahw/naqs',"1",800); st=await txt(); ck('sahw naqs cites binbaz',('ابن باز' in st) and ('بعد السلام' in st))
      # reload and check persistence
      await pg.reload(wait_until='networkidle'); await pg.wait_for_timeout(2000)
      z=await pg.evaluate("JSON.parse(localStorage.getItem('ammar.v1')).zb||{}")
      chk={'debts':len(z.get('debts',[]))==1,'qada':(z.get('qada',{}).get('t',{}).get('f')==10 and z.get('qada',{}).get('done',{}).get('f')==1),'birr':bool(z.get('birr',{}).get('last')),'rahim':len(z.get('rahim',[]))==1,'ghayb':len(z.get('ghayb',{}).get('names',[]))==1,'kidtasks':len(z.get('kids',{}).get('kids',[]))==1 and len(z.get('kids',{}).get('log',{}))==1,'hawl':len(z.get('hawl',[]))==1,'sbudget':len(z.get('sb',{}).get('log',[]))==1,'kaffara':z.get('kf',{}).get('count')==2,'anger':z.get('anger',{}).get('n')==1,'anxious':len(z.get('anx',{}).get('fav',[]))==1,'quit':len(z.get('quit',[]))==1,'tongue':any(v.get('g') for v in z.get('tongue',{}).get('log',{}).values()),'phonefast':z.get('pf',{}).get('end',0)>0,'shukr':len(z.get('shukr',{}).get('log',{}))==1,'niyya':len(z.get('niyya',{}).get('log',{}))==1,'sahw':z.get('sahwSeen',0)>=2}
      for k,v in chk.items(): ck(f'persist after reload: {k}',v)
      jm=await pg.evaluate("(()=>{try{return JSON.stringify(dayLog(iso(new Date())))}catch(e){return 'ERR '+e}})()"); ck('persist: jamaa in prayer log',"\"j\"" in jm,jm)
      # pages render saved state after reload
      for r,needle in [('debts/on','أبو فهد'),('rahim','خالي إبراهيم'),('ghayb','أمي'),('kidtasks','سارة'),('hawl','مدخراتي'),('shukr','الصحة'),('quit','أيام') ]:
        await go(r,1500); t=await txt(); ck(f'reload shows #{r}',needle in t)
      await go('phonefast',1500); ck('phonefast timer survives reload',await pg.evaluate("!!document.getElementById('pfc')"))
      await pg.evaluate("document.getElementById('pfx').click()"); await pg.wait_for_timeout(400)
      # bell reminders include debt due tomorrow
      rem=await pg.evaluate("(todaysReminders()||[]).map(x=>x.id).join(',')"); ck('reminders: debt due tomorrow in bell list','zd' in rem,rem[:200])
      await go('wxdua',4000); ck('wxdua live weather read',await pg.evaluate("!/جارٍ القراءة/.test(document.getElementById('zbwx').innerText)"),await txt('#zbwx'))
      for r in ['debts','kaffara/yamin','anxious','jamaa','niyya','kidtasks']:
        await go(r,1800); await pg.screenshot(path=f"{OUT}/f-{r.replace('/','_')}.png",full_page=False)
    await go('home',2000)
    # weather card forced (simulate rain)
    await pg.evaluate("localStorage.setItem('zs.wx',JSON.stringify({k:'x',at:0}))")
    R['errors']=list(dict.fromkeys(R['errors']))
    ck('no page errors',len(R['errors'])==0,R['errors'][:5])
    json.dump(R,open(OUT+'/result.json','w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
