# v5.5.6: inject the quiz API into the bundled site/_worker.js IN PLACE (the worker is no longer rebuilt from srv/ — see v5.5.0 note).
# usage: python3 srv/zq-inject.py  (run from repo root; needs the pre-5.5.6 _worker.js as site/_worker.js.orig, or strip the old ZQ block first)
import json,subprocess,os
bank=json.load(open('src/zquiz-bank.json'))
arr=json.dumps([[b['c'],b['d'],b['q'],b['a']]+b['w']+[b['f']] for b in bank],ensure_ascii=False,separators=(',',':'))
open('/tmp/zq-full.js','w').write(open('srv/zq-srv.js').read().replace('__BANK__',arr))
subprocess.run('npx terser /tmp/zq-full.js -c -m -o /tmp/zq-min.js',shell=True,check=True)
m=open('/tmp/zq-min.js').read(); w=open('site/_worker.js.orig').read()
a='let n="";try{if(n=new URL(t.url).pathname,n==="/api/zp"'
inj='try{if(new URL(t.url).pathname.startsWith("/api/zq/"))return await ZQ.handle(t,a)}catch(zqe){return new Response(JSON.stringify({ok:false,e:"srv"}),{status:500,headers:{"Content-Type":"application/json"}})}'
ex='export{Fo as default};'
w=w.replace(a,inj+a); w=w.rstrip()[:-len(ex)]+'var ZQ=(()=>{'+m+';return ZQ})();'+ex+'\n'
open('site/_worker.js','w').write(w); os.remove('site/_worker.js.orig')
