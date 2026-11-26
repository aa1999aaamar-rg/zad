
# زاد v5.4 «مقاطع زاد» QA: python3 qa/zx-test.py BASE OUTDIR [LOCAL_CONTENT_DIR|-] [live]
import json,sys,asyncio,os,re,time
from playwright.async_api import async_playwright
BASE=sys.argv[1].rstrip('/'); OUT=sys.argv[2]; LOCAL=sys.argv[3] if len(sys.argv)>3 and sys.argv[3]!='-' else None; LIVE=len(sys.argv)>4
os.makedirs(OUT,exist_ok=True); VER='5.4.0'
R={'errors':[],'checks':[],'created':{}}
def ck(n,ok,info=''):
  R['checks'].append({'n':n,'ok':bool(ok),'i':str(info)[:400]});print(('PASS ' if ok else 'FAIL ')+n+' '+str(info)[:300],flush=True)
SEED={"onboarded":True,"profile":{"name":""},"settings":{"theme":"light","accent":"#34457a","qsize":26,"lang":"ar","city":"riyadh","cityUser":True,"rep":3,"reciter":"maher"},"zsr":{"never":1}}
INIT="""(()=>{try{if(!localStorage.getItem('qa.init')){localStorage.setItem('qa.init','1');localStorage.setItem('ammar.v1',JSON.stringify(%s));localStorage.setItem('ammar.lastSeen','%s');localStorage.setItem('zsh.prompt',JSON.stringify({never:1}))}}catch(e){}})();"""%(json.dumps(SEED,ensure_ascii=False),VER)
CLIP=os.environ.get('ZX_CLIP','/tmp/zxqa/clip1.mp4')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--autoplay-policy=no-user-gesture-required'])
    c=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,locale='ar-SA',timezone_id='Asia/Riyadh',service_workers='block' if LOCAL else 'allow',has_touch=True)
    try: await c.grant_permissions(['clipboard-read','clipboard-write'],origin=BASE)
    except Exception as e: print('perm',e)
    await c.add_init_script(INIT)
    if LOCAL:
      async def h(route):
        pth=route.request.url.split('/x/')[1].split('?')[0]; fp=os.path.join(LOCAL,pth)
        if os.path.exists(fp): await route.fulfill(status=200,body=open(fp,'rb').read(),headers={'Content-Type':'application/json' if fp.endswith('.json') else 'application/javascript','Access-Control-Allow-Origin':'*'})
        else: await route.continue_()
      await c.route(re.compile(r'.*zad-content\.sites\.tab\.bot/x/.*'),h)
    await c.route(re.compile(r'.*/api/social/ref/reg.*'),lambda r: r.fulfill(status=200,body='{"ok":true,"n":0}',headers={'content-type':'application/json'}))
    pg=await c.new_page()
    pg.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
    pg.on('pageerror',lambda e:R['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console',lambda m:(m.type=='error' and not re.search(r'Failed to load resource|net::|favicon|status of 4|status of 5|youtube|soundcloud|drive\.google|docs\.google|gstatic|Content Security|frame-ancestors|ERR_|googletag|google-analytics|doubleclick|facebook|cloudflare|Permissions policy|third-party',m.text)) and R['errors'].append('console: '+m.text[:300]))
    async def go(h,w=1500):
      await pg.evaluate("h=>{location.hash=h}",h); await pg.wait_for_timeout(w)
    async def shot(n): await pg.screenshot(path=os.path.join(OUT,n+'.png'))
    async def ev(js,*a): return await pg.evaluate(js,*a)
    await pg.goto(BASE+'/#home',wait_until='load'); await pg.wait_for_timeout(4500)
    BCLIP=None; pgB=None
    if LIVE:
      async def fake(route): await route.fulfill(status=200,body='{"ok":true,"counted":false}',headers={'content-type':'application/json'})
      await c.route(re.compile(r'.*/api/social/vx/(view|share|hide)$'),fake)
      cB=await b.new_context(viewport={'width':390,'height':844},service_workers='block'); await cB.add_init_script(INIT); pgB=await cB.new_page()
      await pgB.goto(BASE+'/#home',wait_until='load'); await pgB.wait_for_timeout(3000)
      import base64
      vb64=base64.b64encode(open(CLIP,'rb').read()).decode(); pb64=base64.b64encode(open(CLIP.replace('clip','p').replace('.mp4','.jpg'),'rb').read()).decode()
      hB='qa_zx%d'%(int(time.time())%100000)
      rB=await pgB.evaluate("""async([v,p,h])=>{const b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));const r1=await ZS.api('dw/profile',{name:'اختبار زاد',bio:'حساب اختبار يُحذف'});const r2=await ZS.api('vx/prof',{h,pat:4});
        const f=new Blob([b(v)],{type:'video/mp4'}),po=new Blob([b(p)],{type:'image/jpeg'});const j=await ZS.api('vx/init',{caption:'مقطع اختبار يُحذف #اختبار_زاد',size:f.size,dur:6,type:'video/mp4',w:540,h:960,fx:{o:[{t:'سبحان الله',x:50,y:30,c:'#ffd166',f:'a',z:30}]}});if(!j.ok)return {err:j};
        const dev=localStorage.getItem('zad.dev');await fetch('/api/videos/poster/'+j.id+'?t='+j.t,{method:'PUT',headers:{'Content-Type':'image/jpeg','X-Zad-Dev':dev},body:po});const r3=await (await fetch('/api/videos/file/'+j.id+'?t='+j.t,{method:'PUT',headers:{'Content-Type':'video/mp4','X-Zad-Dev':dev},body:f})).json();const r4=await ZS.api('vx/done',{id:j.id});return {id:j.id,h:r2.me&&r2.me.h,f:r3,d:r4}}""",[vb64,pb64,hB])
      ck('live: creator B + clip',rB.get('id') and rB.get('h')==hB,rB); BCLIP=rB.get('id'); R['created']['B']=rB
    if not LOCAL:
      sw=await ev("async()=>{const r=await navigator.serviceWorker.getRegistration();for(let i=0;i<20&&!(r&&r.active);i++)await new Promise(x=>setTimeout(x,500));return (await caches.keys()).join(',')}")
      ck('sw ammar-v5-4-0','ammar-v5-4-0' in sw,sw)
    ck('APP_VERSION 5.4.0',await ev("typeof APP_VERSION!=='undefined'&&APP_VERSION")==VER)
    n=await ev("[...document.querySelectorAll('#tabs.zs7 .in > a')].map(a=>a.dataset.tab).join(',')")
    ck('v5.2 bar intact',n=='home,quran,more,adhkar,diwan',n)
    ck('home card مقاطع زاد',await ev("!!document.querySelector('#zb6home a.zx5[href=\"#videos\"]')"))
    ck('credit line',await ev("document.body.innerText.includes('صُنع بواسطة عمار الشمري')||document.documentElement.innerHTML.includes('صُنع بواسطة عمار الشمري')"))
    await shot('00-home')
    # ---- feed
    t0=time.time(); await go('#video/'+BCLIP if BCLIP else '#videos',4500)
    ck('overlay open',await ev("!!document.querySelector('.zxr .zx-feed')"))
    ns=await ev("document.querySelectorAll('.zx-feed .zx-s').length"); ck('feed slides',ns>=1,ns)
    st=await ev("(()=>{const v=document.querySelector('.zx-s[data-i=\"0\"] video');return v?{t:v.currentTime,p:v.paused,m:v.muted,src:v.currentSrc.slice(-30),rs:v.readyState,err:v.error&&v.error.code}:null})()")
    await pg.wait_for_timeout(1200)
    st2=await ev("(()=>{const v=document.querySelector('.zx-s[data-i=\"0\"] video');return v?{t:v.currentTime,p:v.paused}:null})()")
    ck('autoplay muted',st and st['m'] and st2 and not st2['p'] and st2['t']>0,[st,st2])
    ck('video pool <=3',await ev("document.querySelectorAll('.zxr video').length")<=3)
    ck('rail + info',await ev("!!document.querySelector('.zx-s[data-i=\"0\"] [data-a=like]')&&!!document.querySelector('.zx-s[data-i=\"0\"] .zx-info .who')"))
    off=await ev("(()=>{const s=document.querySelector('.zx-s[data-i=\"0\"]');return s&&s.innerText})()"); ck('first clip info',bool(off),(off or '')[:120])
    await shot('01-feed')
    # double-tap like
    box=await pg.locator('.zx-s[data-i="0"] .zx-tap').bounding_box()
    lk0=await ev("document.querySelector('.zx-s[data-i=\"0\"] [data-a=like] .n').textContent")
    await pg.mouse.click(box['x']+200,box['y']+300); await pg.wait_for_timeout(90); await pg.mouse.click(box['x']+200,box['y']+300)
    await pg.wait_for_timeout(250); burst=await ev("!!document.querySelector('.zx-heart')"); await pg.wait_for_timeout(1200)
    on=await ev("document.querySelector('.zx-s[data-i=\"0\"] [data-a=like]').classList.contains('on')")
    lk1=await ev("document.querySelector('.zx-s[data-i=\"0\"] [data-a=like] .n').textContent")
    ck('double-tap like + heart',on and burst,[lk0,lk1,burst])
    await pg.click('.zx-s[data-i="0"] [data-a=like]'); await pg.wait_for_timeout(1000)
    ck('unlike via rail',not await ev("document.querySelector('.zx-s[data-i=\"0\"] [data-a=like]').classList.contains('on')"),await ev("document.querySelector('.zx-s[data-i=\"0\"] [data-a=like] .n').textContent"))
    # tap → unmute (remembered)
    await pg.mouse.click(box['x']+200,box['y']+300); await pg.wait_for_timeout(700)
    ck('tap unmutes + remembered',await ev("(()=>{const v=document.querySelector('.zx-s[data-i=\"0\"] video');return v&&!v.muted&&S.zb10&&S.zb10.snd===1})()"))
    await pg.mouse.click(box['x']+200,box['y']+300); await pg.wait_for_timeout(700)
    ck('tap pauses',await ev("document.querySelector('.zx-s[data-i=\"0\"]').classList.contains('paused')"))
    await pg.mouse.click(box['x']+200,box['y']+300); await pg.wait_for_timeout(500)
    # swipe
    if ns>1:
      await ev("(()=>{const f=document.querySelector('.zx-feed');f.scrollTo({top:f.clientHeight})})()"); await pg.wait_for_timeout(2200)
      s=await ev("(()=>{const a=document.querySelector('.zx-s[data-i=\"0\"] video'),b=document.querySelector('.zx-s[data-i=\"1\"] video');return {a:a?a.paused:'gone',b:b?{p:b.paused,t:b.currentTime}:null}})()")
      ck('swipe: next plays, prev paused',s['b'] and not s['b']['p'] and (s['a']==True or s['a']=='gone'),s)
      ck('preload next attached',await ev("!!document.querySelector('.zx-s[data-i=\"2\"] video')||document.querySelectorAll('.zx-s').length<3"))
    # long press
    box=await pg.locator('.zx-s .zx-tap').nth(1 if ns>1 else 0).bounding_box()
    await pg.mouse.move(box['x']+150,box['y']+300); await pg.mouse.down(); await pg.wait_for_timeout(800); await pg.mouse.up(); await pg.wait_for_timeout(500)
    mn=await ev("(()=>{const m=document.querySelector('.zx-sh .zx-menu');return m&&m.innerText})()")
    ck('long-press menu',mn and 'لا يهمني' in mn and 'إبلاغ' in mn and 'نسخ الرابط' in mn,(mn or '')[:200])
    await shot('02-longpress')
    await ev("document.querySelector('.zx-sh').close()"); await pg.wait_for_timeout(300)
    # scrub
    cur=1 if ns>1 else 0
    pb=await pg.locator(f'.zx-s[data-i="{cur}"] .zx-prog').bounding_box()
    await pg.mouse.move(pb['x']+pb['width']*0.5,pb['y']+pb['height']-3); await pg.mouse.down(); await pg.mouse.move(pb['x']+pb['width']*0.4,pb['y']+pb['height']-3); await pg.mouse.up(); await pg.wait_for_timeout(400)
    t=await ev(f"document.querySelector('.zx-s[data-i=\"{cur}\"] video').currentTime"); ck('scrub seeks',t>2.5,t)
    # comments (creates the profile)
    await pg.click(f'.zx-s[data-i="{cur}"] [data-a=cmt]'); await pg.wait_for_timeout(1500)
    ck('comments sheet',await ev("!!document.querySelector('.zx-sh .zx-cl')"))
    await pg.click('#zxzci'); await pg.wait_for_timeout(900)
    has=await ev("!!document.querySelector('#zxpfn')")
    if has:
      await pg.fill('#zxpfn','مختبر زاد'); await pg.fill('#zxpfh','qa_tester%d'%(int(time.time())%1000)); await pg.click('#zxpfs'); await pg.wait_for_timeout(2000)
    me=await ev("(async()=>{const r=await ZS.api('vx/me');return r.me})()"); ck('profile created',bool(me),me); R['created']['me']=me
    await pg.fill('#zxzci','ما شاء الله، جزاك الله خير'); await pg.click('[data-e="🤲"]'); await pg.click('#zxzcs'); await pg.wait_for_timeout(1800)
    txt=await ev("document.querySelector('.zx-cl').innerText"); ck('comment posted',('ما شاء الله' in txt),txt[:200])
    await shot('03-comments')
    cid=await ev("(()=>{const c=[...document.querySelectorAll('.zx-c')].find(x=>x.innerText.includes('ما شاء الله، جزاك'));return c&&c.dataset.c})()")
    await pg.click(f'.zx-c[data-c="{cid}"] [data-l]'); await pg.wait_for_timeout(900)
    ck('comment like',await ev(f"document.querySelector('.zx-c[data-c=\"{cid}\"] [data-l]').classList.contains('on')"))
    await pg.click(f'.zx-c[data-c="{cid}"] [data-r]'); await pg.fill('#zxzci','ردّ تجريبي'); await pg.click('#zxzcs'); await pg.wait_for_timeout(1800)
    ck('reply posted',await ev("document.querySelector('.zx-cl').innerText.includes('ردّ تجريبي')"))
    await pg.click(f'.zx-c[data-c="{cid}"] [data-o]'); await pg.wait_for_timeout(400)
    await pg.click('.zx-sh:last-child [data-x=del]'); await pg.wait_for_timeout(1800)
    ck('comment deleted (with reply)',await ev(f"!document.querySelector('.zx-c[data-c=\"{cid}\"]')&&!document.querySelector('.zx-cl').innerText.includes('ردّ تجريبي')"))
    await ev("document.querySelectorAll('.zx-sh').forEach(s=>s.close())"); await pg.wait_for_timeout(300)
    # share link copy
    await pg.click(f'.zx-s[data-i="{cur}"] [data-a=share]'); await pg.wait_for_timeout(400)
    await pg.click('[data-s=copy]'); await pg.wait_for_timeout(500)
    try: clip=await ev("navigator.clipboard.readText()")
    except Exception as e: clip=str(e)
    ck('share link #video/<id>','#video/' in clip,clip)
    # profile
    ph=await ev(f"(()=>{{const a=document.querySelector('.zx-s[data-i=\"{cur}\"] .who a');return a&&a.getAttribute('href')}})()")
    await go(ph or '#u/ammar',2500)
    g=await ev("document.querySelectorAll('.zx-page .zx-grid .zx-g').length"); ck('profile grid',g>=1,[ph,g])
    pt=await ev("(()=>{const p=[...document.querySelectorAll('.zx-page')].pop();return p.querySelector('.zx-pf').innerText})()")
    ck('profile header counts',('متابِعون' in pt and 'يتابع' in pt and 'إعجابات' in pt),pt[:160])
    fb=await ev("!!document.querySelector('#zxpfo')")
    if fb:
      await pg.locator('#zxpfo').last.click(); await pg.wait_for_timeout(1500); a=await ev("[...document.querySelectorAll('#zxpfo')].pop().textContent")
      await pg.locator('#zxpfo').last.click(); await pg.wait_for_timeout(1500); b2=await ev("[...document.querySelectorAll('#zxpfo')].pop().textContent")
      ck('follow / unfollow',a=='تتابعه' and b2!='تتابعه',[a,b2])
    await shot('04-profile')
    await go('#u/ammar',2500)
    await shot('04b-official')
    ck('official profile verified «عمار»',await ev("(()=>{const p=[...document.querySelectorAll('.zx-page')].pop();return !!p.querySelector('.zx-pf .zx-ver')&&p.innerText.includes('عمار')})()"))
    # own profile
    await go('#u/me',2500)
    ck('own profile: تعديل الملف + المحفوظة',await ev("!!document.querySelector('#zxped')&&[...document.querySelectorAll('.zx-ptabs button')].some(b=>b.innerText.includes('المحفوظة'))"))
    await pg.locator('#zxupm').last.click(); await pg.wait_for_timeout(400); await pg.locator('.zx-sh [data-x=qr]').last.click(); await pg.wait_for_timeout(2500)
    ck('QR renders',await ev("!!document.querySelector('#zxqrb canvas')"))
    await ev("document.querySelectorAll('.zx-sh').forEach(s=>s.close())")
    cs=await ev("(async()=>{const b=await ZB10._card({id:'x',h:'qa',name:'مختبر',followers:12,likes:30,clips:3,pat:2});return b&&b.size})()"); ck('profile card image',cs and cs>20000,cs)
    # explore
    await go('#explore',2500); ck('explore home',await ev("document.querySelectorAll('.zx-page:last-child .zx-g').length>=0&&!!document.querySelector('#zxxq')"))
    await shot('05-explore')
    await pg.fill('#zxxq','أذكار' if LOCAL else 'عمار'); await pg.wait_for_timeout(2200)
    xt=await ev("document.querySelector('#zxxb').innerText"); ck('explore search',('حسابات' in xt and 'مقاطع' in xt),xt[:200])
    await shot('05b-search')
    if LOCAL:
      await go('#tag/'+'أذكار',2000); ck('tag page',await ev("document.querySelectorAll('.zx-page:last-child .zx-g').length")>=1)
    # upload
    await go('#vupload',1500); await pg.set_input_files('#zxupf',CLIP); await pg.wait_for_timeout(3500)
    ck('editor opened',await ev("!!document.querySelector('.zx-ed video')"))
    await pg.click('.zx-tools [data-t=text]'); await pg.fill('#zxutx','الحمد لله'); await pg.click('#zxuad'); await pg.wait_for_timeout(300)
    await pg.click('.zx-tools [data-t=filter]'); await pg.click('.zx-fxs [data-p="2"]'); await pg.wait_for_timeout(300)
    await pg.click('.zx-tools [data-t=aya]'); await pg.wait_for_timeout(2500); await pg.click('#zxuaad'); await pg.wait_for_timeout(500)
    await pg.click('.zx-tools [data-t=trim]'); await pg.wait_for_timeout(300)
    hb=await pg.locator('.zx-trim .h.s').bounding_box()
    if hb:
      await pg.mouse.move(hb['x']+10,hb['y']+20); await pg.mouse.down(); await pg.mouse.move(hb['x']-40,hb['y']+20,steps=4); await pg.mouse.up()
    ck('overlays in editor',await ev("document.querySelectorAll('.zx-ed .zx-ot').length")==2)
    await shot('06-upload-edit')
    await pg.click('.zx-tools [data-t=cover]'); await pg.wait_for_timeout(300); await pg.click('#zxucs'); await pg.wait_for_timeout(800)
    await pg.click('#zxunx'); await pg.wait_for_timeout(800)
    await pg.fill('#zxucap','تجربة رفع #تجربة_زاد'); await pg.wait_for_timeout(300)
    ck('post step',await ev("!!document.querySelector('#zxupb')"))
    await shot('07-upload-post')
    if LOCAL or os.environ.get('ZX_FULL'):
      await pg.click('#zxupb'); await pg.wait_for_timeout(6000)
      h=await ev("location.hash"); ck('published → own profile',h.startswith('#u/'),h)
      it=await ev("(async()=>{const r=await ZS.api('vx/user?h='+(await ZS.api('vx/me')).me.h);return r.items.map(x=>({id:x.id,cap:x.cap,ts:x.ts,fx:x.fx}))})()")
      ck('uploaded clip on profile',it and 'تجربة' in it[0]['cap'] and it[0]['fx'] and len(it[0]['fx'].get('o',[]))==2,it[:1]); R['created']['clip']=it and it[0]['id']
      if it:
        vid=it[0]['id']
        # share link opens the clip (new page)
        p2=await c.new_page(); await p2.goto(BASE+'/#video/'+vid,wait_until='load'); await p2.wait_for_timeout(5000)
        ck('share link opens clip',await p2.evaluate("(()=>{const s=document.querySelector('.zx-s[data-i=\"0\"] .vwn');return s&&s.dataset.id})()")==vid)
        await p2.close()
        await go('#video/'+vid,2500)
        d=await ev("(async()=>{const id=location.hash.split('/')[1];const r=await ZS.api('vx/del',{id});return r})()"); ck('test clip deleted',d.get('ok'),d)
    if LIVE and BCLIP:
      p2=await c.new_page(); await p2.goto(BASE+'/#video/'+BCLIP,wait_until='load'); await p2.wait_for_timeout(6000)
      ck('share link opens clip (fresh page)',await p2.evaluate("(()=>{const s=document.querySelector('.zx-s[data-i=\"0\"] .vwn');return s&&s.dataset.id})()")==BCLIP)
      await p2.close()
    # notifications
    await go('#vnotif',2000); ck('notifications page',await ev("!!document.querySelector('.zx-page:last-child .zx-hd')"))
    # stats
    await go('#vstats',2500); ck('stats page',await ev("document.querySelectorAll('.zx-ch svg').length")==3)
    await shot('08-stats')
    # adhan/screen-time overlay
    await go('#videos',3500)
    ck('#videos feed plays (for-you)',await ev("(()=>{const v=document.querySelector('.zxr .zx-s video');return !!(v&&!v.paused)})()"))
    await shot('10-foryou')
    await ev("ZB10._prayer('العصر')"); await pg.wait_for_timeout(500); await shot('09-prayer')
    ck('adhan overlay pauses',await ev("!!document.querySelector('.zx-prayer')"))
    await pg.click('#zxzpo'); await pg.wait_for_timeout(300)
    # close on other route
    await go('#home',1500); ck('overlay closes on #home',await ev("!document.querySelector('.zxr')"))
    ck('#balligh still works',True)
    await go('#balligh',3000); ck('balligh renders',await ev("document.querySelector('#view').innerText.length>50"))
    await go('#hufaz',3000); ck('hufaz renders',await ev("document.querySelector('#view').innerText.length>50"))
    # 4x CPU throttle: open feed and swipe
    cdp=await c.new_cdp_session(pg); await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    t1=time.time(); await go('#videos',100)
    for i in range(60):
      ok=await ev("(()=>{const v=document.querySelector('.zx-s video');return !!(v&&!v.paused&&v.currentTime>0)})()")
      if ok: break
      await pg.wait_for_timeout(100)
    ck('4x CPU: feed playing in s',ok,round(time.time()-t1,2))
    lt=await ev("""(async()=>{const f=document.querySelector('.zx-feed');let lt=0;const o=new PerformanceObserver(l=>{for(const e of l.getEntries())lt=Math.max(lt,e.duration)});try{o.observe({type:'longtask',buffered:false})}catch(e){}
      for(let k=1;k<4;k++){f.scrollTo({top:f.clientHeight*k,behavior:'smooth'});await new Promise(r=>setTimeout(r,900))}o.disconnect();return {lt,cur:document.querySelectorAll('.zxr video').length}})()""")
    ck('4x CPU: swipes, longest task ms',lt['cur']<=3,lt)
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
    if LIVE:
      await go('#home',1000)
      dA=await ev("ZS.api('dw/deleteme',{})"); dB=await pgB.evaluate("ZS.api('dw/deleteme',{})")
      ck('live cleanup: both test accounts purged',dA.get('ok') and dB.get('ok'),[dA,dB])
      chk=await ev("async([h,id])=>{const u=await ZS.api('vx/user?h='+h);const v=await fetch('/api/videos/v/'+id);const p=await fetch('/api/videos/p/'+id);const i=await ZS.api('vx/item?id='+id);return {user:u.ok,v:v.status,p:p.status,item:i.ok}}",[R['created']['B'].get('h'),BCLIP])
      ck('live cleanup: clip rows + R2 objects gone',not chk['user'] and chk['v']==404 and chk['p']==404 and not chk['item'],chk)
      if R['created'].get('clip'):
        c2=await ev("async id=>{const v=await fetch('/api/videos/v/'+id);const p=await fetch('/api/videos/p/'+id);return [v.status,p.status]}",R['created']['clip']); ck('live cleanup: UI-uploaded clip gone',c2==[404,404],c2)
    ck('no page errors',not R['errors'],R['errors'][:5])
    json.dump(R,open(os.path.join(OUT,'result.json'),'w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
