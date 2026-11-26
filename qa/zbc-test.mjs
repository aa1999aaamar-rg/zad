
import { makeEnv } from './d1shim.mjs'; import W from '../site/_worker.js';
const env = makeEnv(); const db=env.DB._db;
env.DB.batch = async ss => { const out=[]; for (const s of ss){ const rows=s._exec(); out.push({results:rows, success:true, meta:{changes: db.getRowsModified()}}); } return out; };
env.ASSETS = { fetch: async () => new Response("x") };
const waits=[]; const ctx={waitUntil:p=>waits.push(Promise.resolve(p))};
const TOK=process.env.TOK;
const sent=[]; const realFetch=globalThis.fetch;
globalThis.fetch = async (u, o) => { const s=String(u); if (s.includes('push.test-bigbig005')) throw new Error('Too many subrequests'); if (s.includes('push.test')) { sent.push(s); return new Response('', {status: s.includes('gone')?410:201}); } return realFetch(u,o); };
const call=async(path,opt={})=>{ const r=await W.fetch(new Request('http://x'+path,opt),env,ctx); const t=await r.text(); let j=null; try{j=JSON.parse(t)}catch{}; return [r.status,j||t]; };
const b64u=b=>Buffer.from(b).toString('base64url');
async function mksub(name){ const k=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']); const raw=await crypto.subtle.exportKey('raw',k.publicKey); return {endpoint:'https://fcm.googleapis.com/fcm/send/push.test-'+name, keys:{p256dh:b64u(raw), auth:b64u(crypto.getRandomValues(new Uint8Array(16)))}}; }
const H={'x-zd-token':TOK,'content-type':'application/json'};
// 3 subs: a (prayer), b (prayer+kahf), gone (prayer) 
for (const [n,cfg] of [['a',{pr:{Fajr:true}}],['b',{pr:{Fajr:true},kahf:true}],['gone',{pr:{Fajr:true}}],['c',{}]]) { const r=await call('/api/push/subscribe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sub:await mksub(n),cfg,tz:'Asia/Riyadh',lat:24.7,lng:46.7})}); console.log('sub',n,r[0],JSON.stringify(r[1]).slice(0,60)); }
let r;
r=await call('/api/zdash/bc'); console.log('no tok',r[0]);
r=await call('/api/zdash/bc/send',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}); console.log('send no tok',r[0]);
r=await call('/api/zdash/bc',{headers:H}); console.log('get',r[0],JSON.stringify(r[1].counts));
r=await call('/api/zdash/bc/send',{method:'GET',headers:H}); console.log('GET send',r[0]);
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة',body:'نص',url:'#quran',dry:1})}); console.log('dry',r[0],JSON.stringify(r[1]));
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة',body:'نص',url:'https://evil.com',dry:1})}); console.log('bad url',r[0],JSON.stringify(r[1]));
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة',body:'نص',url:'#quran',aud:'kahf',dry:1})}); console.log('dry kahf',r[1].recipients);
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة',body:'نص',url:'#quran',test:1})}); console.log('test no dev',r[0],JSON.stringify(r[1]));
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة',body:'نص',url:'#quran',confirm:3})}); console.log('wrong confirm',r[0],JSON.stringify(r[1]));
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة',body:'نص',url:'#quran',confirm:4})}); console.log('send',r[0],JSON.stringify(r[1]));
await Promise.all(waits); console.log('pushed',sent.length);
r=await call('/api/zdash/bc',{headers:H}); console.log('log',JSON.stringify(r[1].log), 'counts', JSON.stringify(r[1].counts));
// pairing
r=await call('/api/zdash/bc/pair',{method:'POST',headers:H,body:'{}'}); const code=r[1].code; console.log('pair',r[0],code&&code.length);
r=await call('/api/zdash/pair-dev',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:'000000',sub:await mksub('me')})}); console.log('wrong code',r[0]);
r=await call('/api/zdash/pair-dev',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code,check:1})}); console.log('check',r[0]);
r=await call('/api/zdash/pair-dev',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code,sub:await mksub('me'),label:'آيفون'})}); console.log('pair ok',r[0]);
r=await call('/api/zdash/pair-dev',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code,sub:await mksub('me2')})}); console.log('reuse code',r[0]);
r=await call('/api/zdash/bc/me',{method:'POST',headers:H,body:JSON.stringify({sub:await mksub('me3'),label:'متصفح'})}); console.log('me',r[0]);
sent.length=0;
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'تجربة لي',body:'x',url:'./',test:1})}); console.log('test',r[0],JSON.stringify(r[1]));
await Promise.all(waits); console.log('test pushed to',sent);
r=await call('/api/zdash/bc',{headers:H}); console.log('adm',r[1].adm.length,'log0',JSON.stringify(r[1].log[0]),'hour',r[1].hour);
for (let k=0;k<5;k++){ r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'t'+k,body:'x',url:'./',confirm:3})}); console.log('rate',k,r[0],r[1].error||''); }
await Promise.all(waits);
// big list chunking: 95 more subs via direct insert
for (let k=0;k<95;k++) db.run("INSERT INTO push_subs (id,endpoint,p256dh,auth,cfg,created) VALUES (?,?,?,?,?,?)",['big'+String(k).padStart(3,'0'),'x',(await mksub('x')).keys.p256dh,'AAAAAAAAAAAAAAAAAAAAAA','{}',1]);
db.run("UPDATE push_subs SET endpoint='https://fcm.googleapis.com/fcm/send/push.test-big'||id WHERE id LIKE 'big%'");
db.run("DELETE FROM zbc_log WHERE kind='all'");
sent.length=0; waits.length=0;
r=await call('/api/zdash/bc/send',{method:'POST',headers:H,body:JSON.stringify({title:'big',body:'x',url:'#videos',confirm:98})}); console.log('big',r[0],JSON.stringify(r[1]));
await Promise.all(waits);
for(let k=0;k<5;k++){ waits.length=0; r=await call('/api/zdash/bc/step',{method:'POST',headers:H,body:'{}'}); console.log('step',JSON.stringify(r[1])); }
r=await call('/api/zdash/bc',{headers:H}); console.log('big log',JSON.stringify(r[1].log[0]), 'pushed', sent.length);
r=await call('/api/zdash/bc/unme',{method:'POST',headers:H,body:JSON.stringify({id:'nope'})}); console.log('unme',r[0]);
r=await call('/api/zdash',{headers:H}); console.log('zdash still ok', r[0], r[1].ok);
