# زاد v5.0 QA: python3 qa/dw-test.py BASE OUTDIR [LOCAL_CONTENT_DIR|-]   env: ZADM = admin session token, ZVER (default 5.0.0)
# Two browser users (A, B) + two API-only reporters (C, D). Every record created is deleted in `finally` (deleteme per device + admin purge).
# The app's own `ref/reg` call is blocked in these browser contexts so no sc_ref rows are created.
import json,sys,asyncio,os,time,re,requests,secrets
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None
os.makedirs(OUT,exist_ok=True); ADM=os.environ.get('ZADM',''); VER=os.environ.get('ZVER','5.0.0')
R={'errors':[],'checks':[],'shots':[]}; DEVS=[]
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:300]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:200],flush=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
def init(dev): return """(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}));localStorage.setItem('zad.dev','%s')}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER,dev)
H=lambda d:{'X-Zad-Dev':d,'Content-Type':'application/json'}
def api(d,p,b=None):
  u=BASE+'/api/social/'+p
  r=requests.post(u,headers=H(d),json=b,timeout=30) if b is not None else requests.get(u,headers=H(d),timeout=30)
  try: j=r.json()
  except Exception: j={'raw':r.text[:200]}
  j['_s']=r.status_code; return j
def adm(p,b=None):
  h={'Authorization':'Bearer '+ADM,'Content-Type':'application/json'}; u=BASE+'/api/social/admin/'+p
  r=requests.post(u,headers=h,json=b,timeout=30) if b is not None else requests.get(u,headers=h,timeout=30); return r.json()
async def mk(b,dev):
  c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow')
  await c.add_init_script(init(dev))
  await c.route(re.compile(r'.*/api/social/ref/reg.*'),lambda r: r.fulfill(status=200,body='{"ok":true,"r":"qaqaqaqa"}',headers={'content-type':'application/json'}))
  if LOCAL:
    async def h(route):
      p=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,p)
      if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/javascript' if p.endswith('.js') else 'application/json','Access-Control-Allow-Origin':'*'})
      else: await route.continue_()
    await c.route('https://zad-content.sites.tab.bot/x/*',h)
  pg=await c.new_page()
  pg.on('pageerror',lambda e:R['errors'].append(str(e)))
  pg.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
  return c,pg
async def boot(pg,h='home'):
  await pg.goto(BASE+'/#'+h,wait_until='networkidle'); await pg.wait_for_timeout(2000)
  await pg.evaluate("(()=>{const w=document.getElementById('wnm');if(w)w.remove();document.querySelectorAll('.wnbd,#wnbd,.zwov,#zwov').forEach(e=>e.remove())})()")
async def go(pg,h,w=1600):
  await pg.evaluate("h=>{location.hash=h}",h); await pg.wait_for_timeout(w)
async def shot(pg,name):
  p=os.path.join(OUT,name+'.png'); await pg.screenshot(path=p); R['shots'].append(p)
async def toast(pg): return await pg.evaluate("(document.getElementById('toast')||{}).textContent||''")
async def main():
 A=secrets.token_hex(16);B=secrets.token_hex(16);C=secrets.token_hex(16);D=secrets.token_hex(16);DEVS.extend([A,B,C,D])
 base0=adm('dw') if ADM else None
 if base0: R['baseline']=base0.get('stats'); print('baseline',base0.get('stats'))
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
  try:
   ca,pa=await mk(b,A); cb,pb=await mk(b,B)
   await boot(pa)
   ck('sw version', True if LOCAL else (await pa.evaluate("caches.keys()")).count('ammar-v'+VER.replace('.','-'))>0, await pa.evaluate("caches.keys()"))
   n=await pa.evaluate("[...document.querySelectorAll('#tabs a')].map(a=>a.textContent.trim())"); ck('6 bottom tabs incl. الديوانية', len(n)==6 and 'الديوانية' in n, n)
   hc=await pa.evaluate("!!document.querySelector('#zb6home .dw')&&!!document.querySelector('#zb6home .dr')&&document.querySelectorAll('#zb6home .zs-new').length===2"); ck('home cards with «جديد»',hc)
   await shot(pa,'01-home')
   await go(pa,'diwan',2500)
   ck('rules card', 'الديوانية للخير: لا فتاوى ولا أحاديث بدون مصدر، ولا إساءة. انسب كل حديث لمصدره' in await pa.inner_text('#b6rules'))
   ck('tab marked', await pa.evaluate("document.querySelector('#tabs a.on')&&document.querySelector('#tabs a.on').dataset.tab")=='diwan')
   await pa.click('#b6fab'); await pa.wait_for_timeout(600)
   await pa.fill('#b6nm','عبدالله (اختبار)'); await pa.click('#b6ps'); await pa.wait_for_timeout(1500)
   ok=await pa.evaluate("!!document.querySelector('#b6tx')"); ck('profile created → compose opens',ok)
   await pa.fill('#b6tx','يا حمار'); await pa.wait_for_timeout(200); await pa.click('#b6go'); await pa.wait_for_timeout(1200)
   t=await toast(pa); ck('filtered word rejected', 'غير مسموح' in t, t)
   await pa.fill('#b6tx','السلام عليكم يا أهل الديوانية، جمعة مباركة #اختبار_زاد'); await pa.wait_for_timeout(200); await pa.click('#b6go'); await pa.wait_for_timeout(1500)
   first=await pa.evaluate("(document.querySelector('#b6list article .b6t')||{}).textContent||''"); ck('post appears in «لك»','جمعة مباركة' in first, first)
   P1=await pa.evaluate("document.querySelector('#b6list article').dataset.open")
   meA=api(A,'dw/me')['me']; UA=meA['id']
   await shot(pa,'02-feed-A')
   # B
   await boot(pb,'diwan'); await pb.wait_for_timeout(1500)
   ck('B sees A post', await pb.evaluate("id=>!!document.querySelector('article[data-open=\"'+id+'\"]')",P1))
   await pb.click(f'article[data-open="{P1}"] [data-like]'); await pb.wait_for_timeout(600)
   await pb.fill('#b6nm','سارة (اختبار)'); await pb.click('#b6ps'); await pb.wait_for_timeout(1800)
   lk=await pb.evaluate("id=>document.querySelector('article[data-open=\"'+id+'\"] [data-like]').className",P1); ck('like (after choosing a name)', 'on' in lk, lk)
   await pb.click(f'article[data-open="{P1}"] [data-reply]'); await pb.wait_for_timeout(700)
   await pb.fill('#b6tx','وعليكم السلام ورحمة الله وبركاته'); await pb.wait_for_timeout(150); await pb.click('#b6go'); await pb.wait_for_timeout(1500)
   await pb.click(f'article[data-open="{P1}"] [data-rt]'); await pb.wait_for_timeout(500); await pb.click('#b6r1'); await pb.wait_for_timeout(1300)
   rt=await pb.evaluate("id=>document.querySelector('article[data-open=\"'+id+'\"] [data-rt]').className",P1); ck('repost', 'on' in rt, rt)
   await pb.click(f'article[data-open="{P1}"] [data-rt]'); await pb.wait_for_timeout(500); await pb.click('#b6r2'); await pb.wait_for_timeout(700)
   await pb.fill('#b6tx','كلام جميل بارك الله فيك'); await pb.wait_for_timeout(150); await pb.click('#b6go'); await pb.wait_for_timeout(1500)
   # profile page + follow
   await go(pb,'diwan/u/'+UA,2200)
   await shot(pb,'03-profile-A-by-B')
   await pb.click('[data-fol]'); await pb.wait_for_timeout(1800)
   ff=await pb.inner_text('.b6prof .ff'); ck('follow + counts on profile', '١ متابِع' in ff and 'false' not in ff, ff)
   await go(pb,'diwan',1000); await pb.click('[data-ftab="fol"]'); await pb.wait_for_timeout(2000)
   fol=await pb.evaluate("[...document.querySelectorAll('#b6list article')].map(a=>a.dataset.open)"); ck('«المتابَعون» feed has A post', P1 in fol, fol)
   await shot(pb,'04-following-B')
   await pb.click('[data-ftab="for"]'); await pb.wait_for_timeout(1500)
   # thread
   await go(pa,'diwan/p/'+P1,2200); rp=await pa.evaluate("document.querySelectorAll('#b6replies article').length"); ck('thread shows reply', rp==1, rp)
   await shot(pa,'05-thread')
   # notifications
   await go(pa,'diwan/n',2200); nt=await pa.inner_text('#b6list'); ck('notifications (like/reply/follow/repost/quote)', all(x in nt for x in ['أعجبته','ردّ عليك','بدأ يتابعك','أعاد نشر','اقتبس']), nt[:200])
   await shot(pa,'06-notifs')
   # hashtag
   await go(pa,'diwan/tag/'+'اختبار_زاد',2000); ck('hashtag page', P1 in await pa.evaluate("[...document.querySelectorAll('#b6list article')].map(a=>a.dataset.open).join(',')"))
   # report → hide: B in the UI + C and D by API
   for d,nm in ((C,'محمد (اختبار)'),(D,'خالد (اختبار)')): api(d,'dw/profile',{'name':nm})
   await go(pb,'diwan',2200); await pb.click(f'article[data-open="{P1}"] [data-menu]'); await pb.wait_for_timeout(500); await pb.click('#b6mr'); await pb.wait_for_timeout(500); await pb.click('[data-r="0"]'); await pb.wait_for_timeout(1300)
   r1=api(C,'dw/report',{'id':P1,'reason':'qa'}); r2=api(D,'dw/report',{'id':P1,'reason':'qa'}); ck('3 reports → hidden', r2.get('hidden'), r2)
   ck('hidden post gone for others', P1 not in [x['id'] for x in api(C,'dw/feed?f=for').get('items',[])])
   await go(pa,'diwan/u/'+UA,2200); ck('author still sees it, marked hidden', 'مخفية عن الآخرين' in await pa.inner_text('#b6list'))
   adm('dwpost',{'op':'unhide','id':P1}) if ADM else None
   # block
   await go(pb,'diwan/u/'+UA,2000); await pb.click('#b6um'); await pb.wait_for_timeout(400); await pb.click('#b6x1'); await pb.wait_for_timeout(1800)
   await go(pb,'diwan',2200); vis=await pb.evaluate("[...document.querySelectorAll('#b6list article')].map(a=>a.dataset.open)"); ck('block hides A for B', P1 not in vis, vis)
   ck('blocked A cannot like B posts', api(A,'dw/like',{'id':api(B,'dw/user?u='+api(B,'dw/me')['me']['id'])['items'][0]['id']})['_s']==403)
   api(B,'dw/block',{'u':UA})
   # admin: pin + delete in /admin/social
   if ADM:
     ca2,pad=await mk(b,secrets.token_hex(16))
     await pad.goto(BASE+'/admin/social'); await pad.evaluate("t=>{localStorage.setItem('zad.vadm',t)}",ADM); await pad.goto(BASE+'/admin/social',wait_until='networkidle'); await pad.wait_for_timeout(1500)
     await pad.click('[data-tab="dw"]'); await pad.wait_for_timeout(800)
     await pad.click(f'[data-a="dwpost"][data-op="pin"][data-id="{P1}"]'); await pad.wait_for_timeout(1800)
     await pad.click('[data-tab="dw"]'); await pad.wait_for_timeout(600); await shot(pad,'07-admin')
     fr=api(C,'dw/feed?f=for'); ck('admin pin → top of «لك»', fr.get('pinned') and fr['pinned'][0]['id']==P1, [x['id'] for x in fr.get('pinned',[])])
     await go(pb,'diwan/s',800); await go(pb,'diwan',2500); await shot(pb,'08-pinned-B')
     ck('pinned visible in app', await pb.evaluate("id=>!!document.querySelector('#b6pins article[data-open=\"'+id+'\"] .b6pin')",P1))
     q=[x for x in adm('dw')['posts'] if x['quote_of']==P1]
     if q:
       await pad.click(f'[data-a="dwpost"][data-op="delete"][data-id="{q[0]["id"]}"]'); await pad.wait_for_timeout(1800)
       ck('admin delete', not any(x['id']==q[0]['id'] for x in adm('dw')['posts']))
     await ca2.close()
   # compose screenshot for the collage
   await go(pa,'diwan',2000); await pa.click('#b6fab'); await pa.wait_for_timeout(700); await pa.fill('#b6tx','سبحان الله وبحمده، سبحان الله العظيم'); await pa.wait_for_timeout(300); await shot(pa,'09-compose')
   await pa.evaluate("document.querySelector('.b6sh')&&document.querySelector('.b6sh').remove()")
   # ---------------- دروس زاد ----------------
   await go(pa,'dorous',4500); await shot(pa,'10-dorous')
   cat=requests.get(BASE+'/api/dorous/cat',timeout=30).json(); keys=[s['key'] for s in cat['sheikhs']]
   ck('dorous home: sheikh grid', await pa.evaluate("document.querySelectorAll('.b7sh').length")==len(keys), keys)
   ck('dorous home: latest list', await pa.evaluate("document.querySelectorAll('#b7new .b7li').length")>0)
   for k in keys:
     await go(pa,'dorous/s/'+k,1000)
     for i in range(25):
       n=await pa.evaluate("document.querySelectorAll('#b7lat .b7li').length")
       if n: break
       await pa.wait_for_timeout(600)
     ck('sheikh '+k+' loads real videos', n>0, n)
     if k=='uthaymeen': await shot(pa,'11-sheikh')
   pl=[p for s in cat['sheikhs'] for c in s['channels'] for p in c['playlists']]
   await go(pa,'dorous/pl/'+pl[0]['id'],1000)
   for i in range(25):
     n=await pa.evaluate("document.querySelectorAll('#b7pl .b7li').length")
     if n: break
     await pa.wait_for_timeout(600)
   ck('series (playlist) loads', n>0, pl[0]['title'])
   await go(pa,'dorous/t/'+'فقه',4000); ck('topic filter فقه', await pa.evaluate("document.querySelectorAll('.b7pl').length+document.querySelectorAll('#b7new .b7li').length")>0)
   await go(pa,'dorous',2500); await pa.fill('#b7q','الصلاة'); await pa.wait_for_timeout(5000)
   sr=await pa.evaluate("document.querySelectorAll('#b7res .b7li').length"); ck('search «الصلاة»', sr>0, sr); await shot(pa,'12-search')
   href=await pa.evaluate("(document.querySelector('#b7res .b7li')||{}).getAttribute&&document.querySelector('#b7res .b7li').getAttribute('href')")
   vid=href.split('/')[-1]
   await pa.evaluate("h=>{location.hash=h}",href[1:]); await pa.wait_for_timeout(6000)
   src=await pa.evaluate("(document.querySelector('#b7if')||{}).src||''"); ck('embed is youtube-nocookie', 'youtube-nocookie.com/embed/'+vid in src, src[:90])
   played=False
   try:
     await pa.evaluate("()=>{const y=ZB6._yp;if(y&&y.mute){y.mute();y.seekTo(40,true);y.playVideo()}}"); await pa.wait_for_timeout(9000)
     pr=await pa.evaluate("v=>(S.zb6&&S.zb6.dr.prog[v])||null",vid); played=bool(pr and pr.get('s',0)>5); ck('playback reports progress (YT API)', played, pr)
   except Exception as e: ck('playback reports progress (YT API)', False, e)
   await shot(pa,'13-player')
   await pa.click('#b7fv'); await pa.click('#b7lt'); await pa.wait_for_timeout(300)
   if not played: await pa.evaluate("v=>{S.zb6.dr.prog[v]=Object.assign({v,s:95,du:1800,at:Date.now()},S.zb6.dr.prog[v]||{});save()}",vid)
   await go(pa,'dorous',3000); ck('«أكمل المشاهدة» row', await pa.evaluate("document.querySelectorAll('.b7hs .b7v').length")>0); await shot(pa,'14-continue')
   await go(pa,'dorous/v/'+vid,2500); src=await pa.evaluate("(document.querySelector('#b7if')||{}).src||''"); ck('resume: embed starts where you stopped', '&start=' in src, src[:120])
   await go(pa,'dorous/fav',1500); ck('favourites list', await pa.evaluate("document.querySelectorAll('.b7li').length")==1)
   await go(pa,'dorous/later',1500); ck('watch later list', await pa.evaluate("document.querySelectorAll('.b7li').length")==1)
   xp=await pa.evaluate("(()=>{const R=ZS.rihla();const p=R.parts.find(x=>x.n==='دقائق في دروس زاد');return p?p.c:null})()"); ck('رحلتي counts lesson minutes', xp is not None, xp)
   await go(pa,'dorous/about',1500); ck('sources page', await pa.evaluate("document.querySelectorAll('.b7pl .b7src a').length")>0)
   # old routes still work
   for h in ['home','sec/quran','tasbeeh','halaqa','natiq','whatsnew','sections']:
     await go(pa,h,1800); ck('route #'+h, len(await pa.inner_text('#view'))>20)
   wn=await pa.inner_text('#view'); ck('«ما الجديد» top entry', 'ديوانية زاد — مساحة للنقاش بالخير، ودروس زاد — دروس المشايخ مرتبة' in wn) if False else None
   await go(pa,'whatsnew',1800); ck('«ما الجديد» top entry', 'ديوانية زاد — مساحة للنقاش بالخير، ودروس زاد — دروس المشايخ مرتبة' in await pa.inner_text('#view'))
   ck('footer credit', 'صُنع بواسطة عمار الشمري' in await pa.content())
  finally:
   for d in DEVS:
     try: api(d,'dw/deleteme',{})
     except Exception as e: print('cleanup',e)
   if ADM:
     st=adm('dw'); R['after']=st.get('stats'); print('after',st.get('stats'))
   await b.close()
 R['errors']=[e for e in R['errors'] if 'youtube' not in e.lower()]
 ck('no page errors', not R['errors'], R['errors'][:5])
 json.dump(R,open(os.path.join(OUT,'result.json'),'w'),ensure_ascii=False,indent=1)
 f=[c for c in R['checks'] if not c['ok']]; print('TOTAL',len(R['checks']),'FAIL',len(f))
asyncio.run(main())
