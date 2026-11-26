
import json,sys,os,asyncio,time,re,requests
from playwright.async_api import async_playwright
MODE=sys.argv[1]; OUT=sys.argv[2]; os.makedirs(OUT,exist_ok=True)
LIVE='https://amar-muslim.sites.tab.bot'
BASE='http://127.0.0.1:8765' if MODE=='local' else LIVE
ADM=os.environ['ZADM']; TK=os.environ['ZTK']
AH={'authorization':'Bearer '+ADM,'content-type':'application/json'}
def adm(p,b=None):
    r=requests.post(LIVE+'/api/social/admin/'+p,json=b,headers=AH,timeout=30) if b is not None else requests.get(LIVE+'/api/social/admin/'+p,headers=AH,timeout=30)
    return r.json()
TODAY=time.strftime('%Y-%m-%d',time.gmtime(time.time()+3*3600))
INIT="""(()=>{if(!localStorage.getItem('zt.init')){localStorage.setItem('zt.init','1');localStorage.setItem('ammar.v1',JSON.stringify({onboarded:true,profile:{name:''},settings:{theme:'light',accent:'#34457a',qsize:26,lang:'ar',city:'jeddah',rep:3,reciter:'maher'}}));localStorage.setItem('ammar.lastSeen','4.6.0');}})()"""
R={'errors':[],'checks':[]}; CLEAN={'pages':set(),'kh':set(),'fam':[],'bud':[],'refs':set(),'chal':set()}
def ck(n,ok,i=''):
    R['checks'].append({'n':n,'ok':bool(ok),'i':str(i)[:300]}); print(('PASS ' if ok else 'FAIL ')+n+' '+str(i)[:200],flush=True)
async def mk(b,name):
    kw=dict(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',geolocation={'latitude':21.5433,'longitude':39.1728},permissions=['geolocation'])
    if MODE=='local': kw['service_workers']='block'
    c=await b.new_context(**kw); await c.add_init_script(INIT)
    if MODE=='local':
        async def api(route):
            req=route.request; u=req.url.replace(BASE,LIVE)
            try:
                r=await route.fetch(url=u); await route.fulfill(response=r)
            except Exception as e: await route.abort()
        await c.route(re.compile(r'^http://127\.0\.0\.1:8765/(api|go)/.*'),api)
        zb2=open('/tmp/p2/src/content/site/zb2.js','rb').read()
        async def h(route): await route.fulfill(status=200,body=zb2,headers={'Content-Type':'application/javascript','Access-Control-Allow-Origin':'*'})
        await c.route(re.compile(r'https://zad-content\.sites\.tab\.bot/x/zb2\.js.*'),h)
    pg=await c.new_page()
    pg.on('pageerror',lambda e:R['errors'].append(name+':'+str(e)))
    pg.on('console',lambda m: R['errors'].append(name+':console:'+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text and 'favicon' not in m.text else None)
    return c,pg
async def go(pg,h,wait=1500):
    await pg.evaluate(f"location.hash={json.dumps(h)}"); await pg.wait_for_timeout(wait)
async def txt(pg,sel='#view'): return await pg.evaluate(f"(document.querySelector({json.dumps(sel)})||{{}}).innerText||''")
async def shot(pg,n): await pg.screenshot(path=f'{OUT}/{n}.png')
async def closesheets(pg): await pg.evaluate("document.querySelectorAll('.zfsh,.zb2sh').forEach(x=>x.remove());try{closeSheet()}catch(e){}")
async def body():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    adm('rate-reset',{})
    cA,A=await mk(b,'A'); cB,B=await mk(b,'B')
    for pg in (A,B): await pg.goto(BASE+'/',wait_until='networkidle',timeout=60000)
    await A.wait_for_timeout(7000)
    devA=await A.evaluate("ZS.dev()"); devB=await B.evaluate("ZS.dev()")
    refA=await A.evaluate("S.zb2.ref"); okA=await A.evaluate("S.zb2.refOk"); CLEAN['refs'].add(refA); CLEAN['refs'].add(await B.evaluate("S.zb2.ref"))
    ck('ref registered for A',refA and okA,refA)
    ht=await txt(A); ck('home renders',('صُنع بواسطة عمار الشمري' in ht),ht[:60])
    # sections new badge
    await go(A,'sections'); t=await txt(A); ck('sections: new 4.6 row','ميزات جماعية' in t and 'ختمة لروح فقيد' in t)
    for hub,r in [('quran','dkhatma'),('quran','okhatma'),('quran','tadabbur'),('adhkar','dchal'),('family','family'),('family','sick'),('family','mem'),('family','ajr'),('prayer','fajrbuddy'),('kids','kidwatch')]:
        await go(A,'sec/'+hub,900); ok=await A.evaluate(f"!!document.querySelector('.zs-card a[href=\"#{r}\"]')&&!!document.querySelector('.zs-card a[href=\"#{r}\"] .zs-new')")
        ck(f'hub {hub} has {r} with جديد',ok)
    await go(A,'sec/family',900); await shot(A,'hub-family')
    await A.fill('#zsq','فقيد') if await A.evaluate("!!document.getElementById('zsq')") else None
    await go(A,'sections',900); await A.fill('#zsq','مريض'); await A.wait_for_timeout(300)
    ck('search مريض → #sick',await A.evaluate("[...document.querySelectorAll('#zsres a.zs-a')].slice(0,5).some(a=>a.getAttribute('href')==='#sick')"))
    # ---------- 1. deceased khatma ----------
    await go(A,'dkhatma',3500); ck('dkhatma form (kind d preset)',await A.evaluate("document.querySelector('[data-kind=\"d\"]').classList.contains('on')&&!document.getElementById('kdua').hidden"))
    await A.fill('#kt','اختبار الفقيد'); await A.fill('#ku','اللهم اغفر له وارحمه'); await A.fill('#kn','أ-اختبار'); await A.click('#kc'); await A.wait_for_timeout(3500)
    h=await A.evaluate("location.hash"); kid=h.split('/')[-1]; CLEAN['kh'].add(kid); ck('A created deceased khatma',h.startswith('#khatma/') and len(kid)==10,h)
    await shot(A,'dk-invite'); await closesheets(A)
    link=await A.evaluate(f"ZS.refUrl(location.origin+'/#khatma/{kid}')"); ck('khatma share link carries ref','r='+refA in link,link)
    await B.goto(link,wait_until='load'); await B.wait_for_timeout(3500)
    tb=await txt(B); ck('B sees the deceased khatma','اختبار الفقيد' in tb and 'رحمه الله' in tb, tb[:80])
    ck('B url cleaned of ref',await B.evaluate("location.search===''"))
    await B.click('[data-j="7"]'); await B.wait_for_timeout(500); await B.fill('#kn2','ب-اختبار'); await B.click('#kgo'); await B.wait_for_timeout(2500)
    await B.click('[data-j="7"]'); await B.wait_for_timeout(500); await B.click('#kdn'); await B.wait_for_timeout(2500)
    ck('B marked juz 7 done',await B.evaluate("document.querySelector('[data-j=\"7\"]').classList.contains('d')"))
    t0=time.time(); ok=False
    while time.time()-t0<14:
        await A.wait_for_timeout(1000)
        if await A.evaluate("!!document.querySelector('[data-j=\"7\"].d')"): ok=True;break
    ck('A sees B\'s juz live (auto refresh)',ok,f'{time.time()-t0:.1f}s')
    await shot(A,'dk-progress'); await shot(B,'dk-B')
    ck('report button visible for B',await B.evaluate("!!document.getElementById('krp')"))
    # ---------- 15. ajr ----------
    await go(A,'ajr',3000); ta=await txt(A); m=re.search(r'([٠-٩0-9]+)\s*\n?\s*استفاد من نشرك',ta)
    ck('أجرك الجاري shows ≥1 after B opened A\'s link',m and m.group(1) not in('٠','0'),ta[:120]); await shot(A,'ajr')
    # ---------- 31. org khatma (60 ahzab, board) ----------
    await go(A,'okhatma',2500); await A.fill('#kt','مدرسة الاختبار'); await A.select_option('#kun','60'); await A.click('#kc'); await A.wait_for_timeout(3500)
    oid=(await A.evaluate("location.hash")).split('/')[-1]; CLEAN['kh'].add(oid); await closesheets(A)
    ck('org khatma: 60 cells + board',await A.evaluate("document.querySelectorAll('[data-j]').length===60&&!!document.querySelector('.brd,.znote')"))
    await B.goto(BASE+'/#khatma/'+oid,wait_until='load'); await B.wait_for_timeout(2500)
    await B.click('[data-j="37"]'); await B.wait_for_timeout(400); await B.click('#kgo'); await B.wait_for_timeout(2500)
    await go(A,'khatma/'+oid,3000); ck('board lists B',await A.evaluate("[...document.querySelectorAll('.brd b')].some(x=>x.textContent.includes('ب-اختبار'))")); await shot(A,'ok-board')
    # completion screen: fill a separate deceased khatma via API (30 parts) then view
    import secrets
    adm('rate-reset',{}); dv=secrets.token_hex(16); r=requests.post(LIVE+'/api/khatma/create',json={'dev':devA,'kind':'d','title':'اختبار الختم','dua':'اللهم ارحمه','unit':30}).json(); cid=r['k']['id']; CLEAN['kh'].add(cid)
    for j in range(1,31):
        requests.post(LIVE+'/api/khatma/claim',json={'dev':dv,'id':cid,'juz':j,'name':'قارئ'}); requests.post(LIVE+'/api/khatma/done',json={'dev':dv,'id':cid,'juz':j})
    await go(A,'khatma/'+cid,3000); tf=await txt(A); ck('completion screen with verified dua','تمّت الختمة' in tf and 'صحيح مسلم ٩٦٣' in tf and 'ابدأ الختمة رقم' in tf, tf[:100]); await shot(A,'dk-complete')
    await A.click('#knx'); await A.wait_for_timeout(2500); ck('repeat: khatma #2 started',await A.evaluate("document.body.innerText.includes('الختمة رقم ٢')"))
    # ---------- 2. dhikr challenge ----------
    now=int(time.time()*1000); adm('chal',{'op':'save','id':'qa-test-chal','title':'تحدي اختبار (يُحذف)','dhikr':'سبحان الله','goal':1000,'starts':now-60000,'ends':now+3600000}); CLEAN['chal'].add('qa-test-chal')
    await go(A,'dchal',3000); await go(B,'dchal',3000)
    base=requests.get(LIVE+'/api/social/chal/list').json(); c0=[c for c in base['items'] if c['id']=='qa-test-chal'][0]['count']
    for i in range(10): await A.click('[data-tap="qa-test-chal"]')
    for i in range(5): await B.click('[data-tap="qa-test-chal"]')
    await A.wait_for_timeout(7000)
    c1=[c for c in requests.get(LIVE+'/api/social/chal/list').json()['items'] if c['id']=='qa-test-chal'][0]['count']
    ck('dhikr counter: 15 taps from 2 users reached the server in batches',c1-c0==15,f'{c0}->{c1}')
    await B.wait_for_timeout(5000); tb=await B.evaluate("document.querySelector('[data-cc=\"qa-test-chal\"]').textContent")
    ck('B sees combined count',tb in('١٥','15'),tb); await shot(A,'dchal')
    ck('official Friday challenge listed',await A.evaluate("document.body.innerText.includes('مليون صلاة على النبي')"))
    # ---------- 3/41. family + parental ----------
    await go(A,'family',2500); await A.fill('#fn','عائلة الاختبار'); await A.fill('#fm','أبو اختبار'); await A.select_option('#fr','parent'); await A.click('#fc'); await A.wait_for_timeout(3500)
    code=(await A.evaluate("location.hash")).split('/')[-1]; CLEAN['fam'].append((code,devA)); await closesheets(A); ck('circle created',re.match(r'^[A-Z2-9]{6}$',code),code)
    await B.evaluate(f"S.zb=S.zb||{{}};S.zb.kids={{kids:[{{id:'k1',name:'سارة'}}],tasks:['الصلاة','البر','القراءة'],log:{{'{TODAY}':{{k1:[0,1]}}}},goal:30}};save()")
    await B.evaluate(f"try{{setPrayer('{TODAY}','Fajr','j');setPrayer('{TODAY}','Dhuhr','o')}}catch(e){{}}")
    await go(B,'family/'+code,2500); await B.fill('#fm','ولد-اختبار'); await B.select_option('#fr','child'); await B.click('#fjn'); await B.wait_for_timeout(4500)
    CLEAN['fam'].append((code,devB))
    ck('B joined circle',await B.evaluate("document.body.innerText.includes('ولد-اختبار (أنت)')"))
    st_on=await B.evaluate("!!document.querySelector('[data-sh=\"st\"]').checked"); ck('child role: stars sharing on by default',st_on)
    await go(A,'home',800); await go(A,'family/'+code,4000); ta=await txt(A)
    ck('A sees B prayers + kids stars',('ولد-اختبار' in ta) and ('سارة' in ta) and ('٢ من ٥' in ta),ta[:200]); await shot(A,'family')
    await A.click('[data-ch]'); await A.wait_for_timeout(400); await A.click('[data-m="0"]'); await A.wait_for_timeout(2500)
    await go(B,'home',800); await go(B,'family/'+code,3500); ck('B received the encouragement',await B.evaluate("document.body.innerText.includes('تشجيع لك')")); await shot(B,'family-B')
    await go(A,'kidwatch',4000); ck('kidwatch (parent) shows the child stars',await A.evaluate("document.body.innerText.includes('سارة')")); await shot(A,'kidwatch')
    # ---------- 11. Fajr buddy ----------
    await go(A,'fajrbuddy',3500); await A.fill('#bn','أ-اختبار'); await A.click('#bc'); await A.wait_for_timeout(3500)
    bcode=await A.evaluate("(document.querySelector('.zb2-code')||{}).textContent||''"); CLEAN['bud']+= [devA]; await closesheets(A)
    ck('buddy code created',re.match(r'^[A-Z2-9]{6}$',bcode or ''),bcode)
    await go(B,'fajrbuddy/'+bcode,3500); await B.fill('#bn','ب-اختبار'); await B.click('#bjb'); await B.wait_for_timeout(4000); CLEAN['bud'].append(devB)
    ck('B paired with A',await B.evaluate("document.body.innerText.includes('مرتبط مع أ-اختبار')")); await shot(B,'fajrbuddy')
    ga=requests.get(LIVE+'/api/social/bud/get',headers={'X-Zad-Dev':devA}).json(); gb=requests.get(LIVE+'/api/social/bud/get',headers={'X-Zad-Dev':devB}).json()
    dry=requests.get(LIVE+'/api/social/admin/budtick',params={'dry':'1','now':str(max(ga['me']['next_at'],gb['me']['next_at'])+60000)},headers={'X-Tick-Token':TK}).json()
    print('DRY',json.dumps(dry,ensure_ascii=False)[:600])
    ck('dry tick: B already logged Fajr today? / decisions present',dry.get('checked',0)>=2,[i['decision'] for i in dry.get('items',[])])
    R['dry']=dry
    # ---------- 36/37/38 pages ----------
    await go(A,'sick',2500); await A.fill('#pn','اختبار'); await A.fill('#pd','اللهم اشفه'); await A.click('#pc'); await A.wait_for_timeout(3500)
    sid=(await A.evaluate("location.hash")).split('/')[-1]; CLEAN['pages'].add(sid); await closesheets(A)
    await B.goto(BASE+'/#sick/'+sid,wait_until='load'); await B.wait_for_timeout(3000)
    await B.click('#pp'); await B.wait_for_timeout(2000); cb=await B.evaluate("document.getElementById('pcn').textContent"); ck('sick: B «دعوت له» → 1',cb in('١','1'),cb)
    await go(A,'home',500); await go(A,'sick/'+sid,3000); ck('sick: A sees count 1',await A.evaluate("document.getElementById('pcn').textContent") in ('١','1')); await shot(B,'sick-B')
    await go(A,'mem',2500); await A.fill('#pn','اختبار المتوفى'); await A.fill('#pdt','توفي ١٤٤٨هـ'); await A.fill('#pf','الصلاة عليه بعد العصر، والعزاء في منزله ثلاثة أيام'); await A.click('#pc'); await A.wait_for_timeout(3500)
    mid=(await A.evaluate("location.hash")).split('/')[-1]; CLEAN['pages'].add(mid); await closesheets(A)
    await A.click('#pkh'); await A.wait_for_timeout(3500); ck('memorial: khatma created & linked',await A.evaluate("!!document.querySelector('a[href^=\"#khatma/\"]')"))
    mk_kid=await A.evaluate("(document.querySelector('a[href^=\"#khatma/\"]')||{}).getAttribute&&document.querySelector('a[href^=\"#khatma/\"]').getAttribute('href').split('/')[1]"); CLEAN['kh'].add(mk_kid)
    tm=await txt(A); ck('memorial: verified duas with grade+link','صحيح مسلم ٩٦٣' in tm and 'سنن أبي داود ٣٢٠١' in tm and 'صحيح (الألباني)' in tm); await shot(A,'mem')
    await B.goto(BASE+'/#mem/'+mid,wait_until='load'); await B.wait_for_timeout(3000); await B.click('#pp'); await B.wait_for_timeout(2000)
    ck('memorial: B «دعوت له» → 1',await B.evaluate("document.getElementById('pcn').textContent") in('١','1'))
    await B.click('#prp'); await B.wait_for_timeout(400); await B.fill('#z2rr','اختبار البلاغ'); await B.click('#z2rg'); await B.wait_for_timeout(2000)
    L=adm('list'); pr=[x for x in L['pages'] if x['id']==mid]; ck('report reached admin',pr and pr[0]['reports']==1,pr[:1])
    # bad words / phone refused
    r=requests.post(LIVE+'/api/social/page/create',json={'kind':'s','name':'يا كلب'},headers={'X-Zad-Dev':devA}).json(); ck('profanity refused',r.get('error')=='bad',r)
    r=requests.post(LIVE+'/api/social/page/create',json={'kind':'m','name':'فلان','fun':'للتواصل ٠٥٥١٢٣٤٥٦٧'},headers={'X-Zad-Dev':devA}).json(); ck('phone number refused',r.get('error')=='phone',r)
    # admin page UI: delete the sick page
    cC=await b.new_context(viewport={'width':390,'height':844}); await cC.add_init_script(f"localStorage.setItem('zad.vadm','{ADM}')"); C=await cC.new_page()
    C.on('pageerror',lambda e:R['errors'].append('admin:'+str(e)))
    await C.goto(LIVE+'/admin/social',wait_until='load'); await C.wait_for_timeout(2500); await C.click('[data-tab="pages"]'); await C.wait_for_timeout(500)
    ck('admin page lists the test pages',await C.evaluate(f"!!document.querySelector('[data-id=\"{sid}\"]')"))
    await C.screenshot(path=f'{OUT}/admin.png')
    C.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
    await C.click(f'[data-a="page"][data-op="delete"][data-id="{sid}"]'); await C.wait_for_timeout(2500)
    g=requests.get(LIVE+'/api/social/page/get',params={'id':sid}).status_code; ck('admin delete works (page gone → 404)',g==404,g); CLEAN['pages'].discard(sid)
    # ---------- 4. tadabbur ----------
    await go(A,'tadabbur',2500); await A.select_option('#ts','2'); await A.fill('#ta','255'); await A.click('#tl'); await A.wait_for_timeout(2500)
    vt=await A.evaluate("document.getElementById('tv').innerText"); ck('tadabbur: verse from API',vt.startswith('﴿') and len(vt)>200 and 'تعذّر' not in vt,vt[:60])
    await A.fill('#tn','آية الكرسي تذكّرني أن الله قائم على كل شيء، فلا أخاف'); await A.click('#tsv'); await A.wait_for_timeout(1200)
    await A.reload(wait_until='load'); await A.wait_for_timeout(2500); await go(A,'tadabbur',2500); ck('tadabbur note persists after reload',await A.evaluate("document.body.innerText.includes('قائم على كل شيء')"))
    await shot(A,'tadabbur')
    await A.click('[data-card]'); await A.wait_for_timeout(3500); ck('«اصنع بطاقة» opens the card designer',await A.evaluate("!!document.getElementById('zgc')&&document.getElementById('zgc').width>100"))
    await shot(A,'tadabbur-card')
    try:
        cv=await A.evaluate("(async()=>{const c=document.createElement('canvas');await zDraw(c,{k:'n',v:{t:S.zb2.notes['2:255'].v,sn:2,a:255},n:S.zb2.notes['2:255'].n},8,'p',1);return c.toDataURL('image/jpeg',.9)})()")
        import base64; open(f'{OUT}/tadabbur-card-full.jpg','wb').write(base64.b64decode(cv.split(',')[1]))
    except Exception as e: ck('card render',False,e)
    await closesheets(A)
    # ---------- old routes ----------
    for r in ['prayer','qibla','tasbeeh','adhkar','hifz','zakat','salah','quotes','articles','settings','whatsnew','kids','car','gk','shareapp','debts','kidtasks','sections','sec/quran']:
        await go(A,r,1600); t=await txt(A)
        if r=='car': t=await A.evaluate("(document.querySelector('.zfcar')||{}).innerText||''"); await A.evaluate("document.querySelectorAll('.zfcar').forEach(x=>x.remove())")
        ck(f'route #{r}',len(t)>30 and 'تعذّر' not in t[:80],t[:40].replace('\n',' '))
        await closesheets(A)
    await go(A,'whatsnew',1500); ck('ما الجديد top = 4.6.0',await A.evaluate("document.body.innerText.indexOf('المرحلة الثانية: ميزات جماعية')>-1"))
    await b.close()
def cleanup():
    for c,d in CLEAN['fam']: requests.post(LIVE+'/api/social/fam/leave',json={'code':c},headers={'X-Zad-Dev':d})
    for d in CLEAN['bud']: requests.post(LIVE+'/api/social/bud/leave',json={},headers={'X-Zad-Dev':d})
    L=adm('list')
    for x in L['pages']:
        if x['id'] in CLEAN['pages'] or 'اختبار' in x['name']: adm('page',{'op':'delete','id':x['id']})
    for x in L['khatmas']:
        if x['id'] in CLEAN['kh'] or 'اختبار' in x['title']: adm('khatma',{'op':'delete','id':x['id']})
    for x in L.get('fams',[]):
        if 'اختبار' in x['name']: adm('fam',{'op':'delete','id':x['id']})
    for x in CLEAN['chal']: adm('chal',{'op':'delete','id':x})
    for x in CLEAN['refs']:
        if x: adm('ref',{'op':'delete','id':x})
    L=adm('list'); R['after']={'stats':L['stats'],'pages':len(L['pages']),'khatmas':len(L['khatmas']),'chals':[c['id'] for c in L['chals']],'refs':L.get('refs')}
    ck('cleanup: no test records left',not [x for x in L['pages'] if 'اختبار' in x['name']] and not [x for x in L['khatmas'] if 'اختبار' in x['title']] and not [x for x in L.get('fams',[]) if 'اختبار' in x['name']] and 'qa-test-chal' not in [c['id'] for c in L['chals']] and 'fri-salawat' in [c['id'] for c in L['chals']],R['after'])
async def main():
    try: await body()
    except Exception as e:
        import traceback; traceback.print_exc(); R['crash']=str(e)
    finally:
        try: cleanup()
        except Exception as e: print('CLEANUP ERROR',e)
    json.dump(R,open(OUT+'/result.json','w'),ensure_ascii=False,indent=1)
    print('ERRORS',R['errors'][:20]); print('PASS',sum(c['ok'] for c in R['checks']),'/',len(R['checks']))
asyncio.run(main())
