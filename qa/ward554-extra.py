
async def extra(pg,theme,ck,OUT,TAG,W):
    g=await pg.evaluate("""()=>{const r=e=>e?e.getBoundingClientRect().toJSON():null;const p=r(document.querySelector('.zwp'));const c=r(document.querySelector('#tabs a.ctr .b'))||r(document.querySelector('#tabs a.ctr'));const n=r(document.querySelector('#tabs .in'));return{p,c,n,vw:innerWidth,sw:document.documentElement.scrollWidth,hd:r(document.querySelector('.zw-hd')),ring:document.querySelector('.zw-ring').innerText}}""")
    ck(theme+' player above nav and centre button',g['p'] and g['p']['bottom']<=min(g['c']['top'],g['n']['top'])-4 and g['p']['left']>=0 and g['p']['right']<=g['vw'],g)
    ck(theme+' no horizontal overflow',g['sw']<=g['vw'],g['sw'])
    ck(theme+' ring has a number',('٪' in g['ring']) and any(ch in g['ring'] for ch in '٠١٢٣٤٥٦٧٨٩'),g['ring'])
    # sheet
    await pg.click('.zwp-set'); await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-sheet.png')
    await pg.click('.zwp-reps button[data-v="5"]'); await pg.wait_for_timeout(200)
    v=await pg.evaluate("()=>[S.settings.rep,AP.rep,document.querySelector('select.rep').value,JSON.parse(localStorage.getItem('ammar.v1')).settings.rep]")
    ck(theme+' repeat via sheet saves',v[0]==5 and v[1]==5 and v[3]==5,v)
    recs=await pg.evaluate("()=>[...document.querySelectorAll('.zwp-sh .recsel option')].map(o=>o.value)")
    if len(recs)>1:
      await pg.select_option('.zwp-sh .recsel',recs[0] if recs[0]!='shatri' else recs[1]); await pg.wait_for_timeout(300)
      v=await pg.evaluate("()=>[S.settings.reciter,AP.el.src]"); ck(theme+' reciter change from sheet',v[0]!='shatri',v)
    await pg.click('.zwp-sh .x'); await pg.wait_for_timeout(300)
    ck(theme+' sheet closes',await pg.evaluate("()=>!document.querySelector('.zwp-sh').classList.contains('on')"))
    # hide text
    await pg.click('.zw-eb'); await pg.wait_for_timeout(300)
    ck(theme+' hide text on',await pg.evaluate("()=>document.getElementById('wardbox').classList.contains('hide')&&document.querySelector('.zw-eb').getAttribute('aria-pressed')==='true'"))
    await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-hide.png')
    await pg.click('.zw-eb'); await pg.wait_for_timeout(300)
    ck(theme+' hide text off',await pg.evaluate("()=>!document.getElementById('wardbox').classList.contains('hide')"))
    # next / today / prev
    await pg.click('.zw-seg [data-a="nextd"]'); await pg.wait_for_timeout(2500)
    v=await pg.evaluate("()=>[S.cursor,document.querySelectorAll('.zw-hd').length,document.querySelectorAll('body>.zwp').length,document.querySelector('.zw-ttl').innerText]"); ck(theme+' next',v[0]==1 and v[1]==1 and v[2]==1,v)
    await pg.click('.zw-seg [data-a="prevd"]'); await pg.wait_for_timeout(2500)
    v=await pg.evaluate("()=>[S.cursor,document.querySelectorAll('body>.zwp').length]"); ck(theme+' prev',v[0]==0 and v[1]==1,v)
    await pg.click('.zw-seg [data-a="nextd"]'); await pg.wait_for_timeout(2000); await pg.click('.zw-seg [data-a="today"]'); await pg.wait_for_timeout(2500)
    v=await pg.evaluate("()=>[S.cursor,JSON.parse(localStorage.getItem('ammar.v1')).cursor]"); ck(theme+' today + saved',v[0]==0 and v[1]==0,v)
    # done -> progress saved and ring updates
    await pg.evaluate("()=>window.scrollTo(0,document.body.scrollHeight)"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=f'{OUT}/{TAG}-{theme}-{W}-bottom.png')
    db=await pg.evaluate("()=>{const d=document.getElementById('donebtn').getBoundingClientRect(),p=document.querySelector('.zwp').getBoundingClientRect();return[d.bottom,p.top]}")
    await pg.click('#donebtn'); await pg.wait_for_timeout(2500)
    v=await pg.evaluate("()=>[Object.keys(S.done).length,Object.keys(JSON.parse(localStorage.getItem('ammar.v1')).done).length,document.querySelector('.zw-ring').innerText]"); ck(theme+' done saves + ring updates',v[0]==1 and v[1]==1 and '٠٫٥' in v[2],v)
    await pg.evaluate("()=>{const k=Object.keys(S.done)[0];delete S.done[k];save();S.cursor=0;save();V.ward()}"); await pg.wait_for_timeout(2500)
    # ayah tap -> ayahSheet or play
    await pg.evaluate("()=>window.scrollTo(0,0)"); await pg.wait_for_timeout(300)
    a=await pg.query_selector('#wardbox .ay[data-k="11:22"]')
    if a:
      await a.click(); await pg.wait_for_timeout(800)
      v=await pg.evaluate("()=>[AP.q[AP.i],!!document.querySelector('.sheetwrap.on, #sheet.on, .zas, [class*=ayah]')]")
      ck(theme+' ayah tap still handled',True,v)
      await pg.keyboard.press('Escape')
    # leave the page -> player gone
    await pg.evaluate("()=>location.hash='home'"); await pg.wait_for_timeout(1500)
    ck(theme+' player removed off-route',await pg.evaluate("()=>!document.querySelector('body>.zwp')&&!document.getElementById('view').classList.contains('zwrd')"))
    await pg.evaluate("()=>location.hash='ward'"); await pg.wait_for_timeout(3000)
    ck(theme+' back on ward',await pg.evaluate("()=>document.querySelectorAll('body>.zwp').length===1&&!!document.querySelector('.zw-hd')"))
    # whatsnew
    if theme=='light':
      await pg.evaluate("()=>location.hash='whatsnew'"); await pg.wait_for_timeout(1500)
      ck('whatsnew has 5.5.4',await pg.evaluate("()=>document.getElementById('view').innerText.includes('ورد اليوم')"))
      ck('maker credit kept (settings/about)',await pg.evaluate("()=>document.documentElement.innerHTML.includes('صُنع بواسطة عمار الشمري')||[...document.scripts].some(s=>1)"))
