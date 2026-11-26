
import { makeEnv } from './d1shim.mjs'; import W from '../site/_worker.js';
const env = makeEnv(); const db=env.DB._db;
env.DB.batch = async ss => { const out=[]; for (const s of ss){ const rows=s._exec(); out.push({results:rows, success:true, meta:{changes: db.getRowsModified()}}); } return out; };
env.VIDS.list = async () => ({ objects: [...env.VIDS._store.entries()].map(([k,o])=>({key:k,size:o.b.length})), truncated:false });
env.ASSETS = { fetch: async () => new Response("const V='ammar-v5-4-4';") };
const waits=[]; const ctx={waitUntil:p=>waits.push(Promise.resolve(p))};
const TOK=process.env.TOK;
const call=async(path,opt={})=>{ const r=await W.fetch(new Request('http://x'+path,opt),env,ctx); const t=await r.text(); return [r.status,t,r.headers]; };
let r;
r=await call('/api/social/dw/profile',{method:'POST',headers:{'x-zad-dev':'a'.repeat(32),'content-type':'application/json','cf-connecting-ip':'1.1.1.1'},body:JSON.stringify({name:'تجربة',bio:''})}); console.log('profile',r[0],r[1].slice(0,80));
for (const [d,via] of [['a'.repeat(32),0],['b'.repeat(32),1],['ZTEST-abc1',1]]) {
  const h={'content-type':'text/plain'}; if(via) h['x-zad-key']='7d0f8ed215a6b0eeb030fde1a5b9f940';
  r=await call('/api/zp',{method:'POST',headers:h,body:JSON.stringify({d,p:'ios',s:via?1:0,v:'5.4.4',o:1,f:{home:2,read:1,'BAD KEY':3,videos:4}})}); console.log('ping',r[0],r[1]);
}
r=await call('/api/zp',{method:'POST',body:JSON.stringify({d:'x'})}); console.log('bad ping',r[0]);
r=await call('/api/zdash'); console.log('no tok',r[0]);
r=await call('/api/zdash',{headers:{'x-zd-token':'wrong'.repeat(6)}}); console.log('wrong tok',r[0]);
r=await call('/admin/'+'wrong'.repeat(6)); console.log('wrong page',r[0]);
r=await call('/admin/'+TOK); console.log('page',r[0],r[2].get('x-robots-tag'),r[1].length);
r=await call('/admin/videos'); console.log('admin videos',r[0]);
r=await call('/api/zdash',{headers:{'x-zd-token':TOK}}); console.log('dash',r[0]); const j=JSON.parse(r[1]);
console.log(JSON.stringify({usage:j.usage,features:j.features.d0,users:j.users.accounts,health:{...j.health,tables:(j.health.tables||[]).length}}).slice(0,2500));
const nulls=[]; for (const s of ['users','videos','push','eng']) for (const [k,v] of Object.entries(j[s])) if(v===null) nulls.push(s+'.'+k); console.log('nulls',nulls);
r=await call('/api/zdash/clean-test',{method:'POST',headers:{'x-zd-token':TOK}}); console.log('clean',r[0],r[1]);
console.log(db.exec("select count(*) from za_dev")[0].values, db.exec("select count(*) from za_fev")[0].values);
