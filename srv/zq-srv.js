
const ZQB=__BANK__;
const ZQ={};
const zqJ=(o,s)=>new Response(JSON.stringify(o),{status:s||200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
let zqOk=false;
async function zqSchema(db){if(zqOk)return;await db.batch([
 db.prepare("CREATE TABLE IF NOT EXISTS zq_rooms (code TEXT PRIMARY KEY, host TEXT, st TEXT, cfg TEXT, qs TEXT, qi INTEGER, qstart INTEGER, qdur INTEGER, revat INTEGER, used TEXT, created INTEGER, updated INTEGER)"),
 db.prepare("CREATE TABLE IF NOT EXISTS zq_players (code TEXT, pid TEXT, pub TEXT, name TEXT, emo TEXT, score INTEGER, help INTEGER, joined INTEGER, seen INTEGER, jq INTEGER, PRIMARY KEY(code,pid))"),
 db.prepare("CREATE TABLE IF NOT EXISTS zq_answers (code TEXT, qi INTEGER, pid TEXT, ch INTEGER, ms INTEGER, pts INTEGER, ok INTEGER, at INTEGER, PRIMARY KEY(code,qi,pid))")]);zqOk=true}
const zqClean=s=>String(s||"").replace(/[<>&"'`\\\u0000-\u001f\u200e\u200f\u202a-\u202e]/g,"").replace(/\s+/g," ").trim();
const EMO=["🌙","⭐","🌴","🐪","📘","🕌","🏆","🎯","🌟","🍃","💎","🔥","🎈","☀️","🦅","🐎"];
function zqPick(cfg,used){let cats=(cfg.cats||[]).filter(c=>"ich".includes(c));if(!cats.length)cats=["i","c","h"];const n=[10,20,30].includes(cfg.n)?cfg.n:10;const d=[0,1,2,3].includes(cfg.d)?cfg.d:0;
 const pool=ZQB.map((b,i)=>[b,i]).filter(([b])=>cats.includes(b[0]));const us=new Set(used||[]);
 const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const rank=([b,i])=>(us.has(i)?10:0)+(d?Math.abs(b[1]-d)*3:0)+Math.random()*2.5;
 /* توزيع متوازن بين الفئات */
 const by={};cats.forEach(c=>by[c]=sh(pool.filter(p=>p[0][0]===c)).sort((x,y)=>rank(x)-rank(y)));
 const out=[];let k=0;while(out.length<n&&cats.some(c=>by[c].length)){const c=cats[k++%cats.length];if(by[c].length)out.push(by[c].shift()[1])}
 return sh(out).map(i=>[i,sh([0,1,2,3])])}
async function zqRoom(db,code){return await db.prepare("SELECT * FROM zq_rooms WHERE code=?").bind(code).first()}
async function zqPlayers(db,code){return (await db.prepare("SELECT pid,pub,name,emo,score,help,joined,seen,jq FROM zq_players WHERE code=? ORDER BY joined").bind(code).all()).results||[]}
function zqQ(r,qi){const qs=JSON.parse(r.qs||"[]");const e=qs[qi];if(!e)return null;const b=ZQB[e[0]];const opts=[b[3],b[4],b[5],b[6]];return {b,perm:e[1],opts:e[1].map(x=>opts[x]),correct:e[1].indexOf(0)}}
async function zqTick(db,r,now){/* انتقالات تلقائية */
 if(r.st==="q"&&r.qstart){const pl=await zqPlayers(db,r.code);const act=pl.filter(p=>now-p.seen<20000&&p.jq<=r.qi);
  const na=(await db.prepare("SELECT COUNT(*) n FROM zq_answers WHERE code=? AND qi=?").bind(r.code,r.qi).first()).n;
  const tUp=r.qdur>0&&now>r.qstart+r.qdur+600;const all=act.length>0&&na>=act.length&&now>r.qstart;
  if(tUp||all){await db.prepare("UPDATE zq_rooms SET st='rev',revat=?,updated=? WHERE code=? AND st='q' AND qi=?").bind(now,now,r.code,r.qi).run();r.st="rev";r.revat=now}}
 if(r.st==="rev"&&r.revat&&now-r.revat>15000){await zqAdvance(db,r,now)}
 /* نقل الاستضافة إذا غاب المضيف */
 const pl=await zqPlayers(db,r.code);const h=pl.find(p=>p.pid===r.host);
 if(!h||now-h.seen>25000){const nx=pl.find(p=>now-p.seen<10000&&p.pid!==r.host);if(nx){await db.prepare("UPDATE zq_rooms SET host=? WHERE code=?").bind(nx.pid,r.code).run();r.host=nx.pid}}}
async function zqAdvance(db,r,now){const n=JSON.parse(r.qs||"[]").length;
 if(r.qi+1>=n){await db.prepare("UPDATE zq_rooms SET st='end',updated=? WHERE code=? AND st='rev' AND qi=?").bind(now,r.code,r.qi).run();r.st="end"}
 else{const qs=now+2500;await db.prepare("UPDATE zq_rooms SET st='q',qi=qi+1,qstart=?,revat=0,updated=? WHERE code=? AND st='rev' AND qi=?").bind(qs,now,r.code,r.qi).run();r.st="q";r.qi=r.qi+1;r.qstart=qs}}
async function zqState(db,r,pid,now){const pl=await zqPlayers(db,r.code);const me=pl.find(p=>p.pid===pid);const cfg=JSON.parse(r.cfg||"{}");
 const o={ok:true,code:r.code,st:r.st,now,cfg,host:(pl.find(p=>p.pid===r.host)||{}).pub||"",me:me?me.pub:"",myhelp:me?me.help:0,qi:r.qi,n:JSON.parse(r.qs||"[]").length};
 let ans=[];if(r.st==="q"||r.st==="rev")ans=(await db.prepare("SELECT pid,ch,pts,ok FROM zq_answers WHERE code=? AND qi=?").bind(r.code,r.qi).all()).results||[];
 o.players=pl.map(p=>{const a=ans.find(x=>x.pid===p.pid);const x={p:p.pub,name:p.name,emo:p.emo,score:p.score,on:now-p.seen<20000,ans:!!a};if(r.st==="rev"&&a){x.pts=a.pts;x.ok=a.ok}return x});
 if((r.st==="q"||r.st==="rev")&&r.qstart){const q=zqQ(r,r.qi);if(q){o.q={t:q.b[2],o:q.opts,c:q.b[0],d:q.b[1]};o.qstart=r.qstart;o.qdur=r.qdur;
  const my=ans.find(x=>x.pid===pid);if(my)o.my={ch:my.ch,pts:my.pts,ok:my.ok};
  if(r.st==="rev"){o.correct=q.correct;o.fact=q.b[7];o.revat=r.revat}else if(now<r.qstart){delete o.q;o.pre=true}}}
 return o}
ZQ.handle=async function(req,env){const db=env.DB;if(!db)return zqJ({ok:false,e:"nodb"},500);await zqSchema(db);
 const u=new URL(req.url);const op=u.pathname.slice(8);if(req.method!=="POST")return zqJ({ok:false,e:"method"},405);
 let b={};try{b=await req.json()}catch(e){return zqJ({ok:false,e:"json"},400)}
 const now=Date.now();const pid=String(b.pid||"");if(!/^[A-Za-z0-9]{16,40}$/.test(pid))return zqJ({ok:false,e:"pid"},400);
 const code=String(b.code||"").replace(/\D/g,"").slice(0,6);
 const name=zqClean(b.name).slice(0,18)||"لاعب";const emo=EMO.includes(b.emo)?b.emo:EMO[0];
 if(op==="create"){
  if(Math.random()<0.2){const old=now-6*3600e3;await db.batch([db.prepare("DELETE FROM zq_answers WHERE code IN (SELECT code FROM zq_rooms WHERE updated<?)").bind(old),db.prepare("DELETE FROM zq_players WHERE code IN (SELECT code FROM zq_rooms WHERE updated<?)").bind(old),db.prepare("DELETE FROM zq_rooms WHERE updated<?").bind(old)])}
  const mine=(await db.prepare("SELECT COUNT(*) n FROM zq_rooms WHERE host=? AND created>?").bind(pid,now-3600e3).first()).n;if(mine>=15)return zqJ({ok:false,e:"rate"},429);
  let c="";for(let t=0;t<8;t++){c=String(10000+Math.floor(Math.random()*90000));if(!(await zqRoom(db,c)))break;c=""}if(!c)return zqJ({ok:false,e:"busy"},503);
  const pub=Math.random().toString(36).slice(2,8);
  await db.batch([db.prepare("INSERT INTO zq_rooms (code,host,st,cfg,qs,qi,qstart,qdur,revat,used,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(c,pid,"lobby",JSON.stringify({cats:["i","c","h"],d:0,n:10,t:30}),"[]",0,0,0,0,"[]",now,now),
   db.prepare("INSERT INTO zq_players (code,pid,pub,name,emo,score,help,joined,seen,jq) VALUES (?,?,?,?,?,0,0,?,?,0)").bind(c,pid,pub,name,emo,now,now)]);
  const r=await zqRoom(db,c);return zqJ(await zqState(db,r,pid,now))}
 if(!/^\d{5}$/.test(code))return zqJ({ok:false,e:"code"},400);
 const r=await zqRoom(db,code);if(!r)return zqJ({ok:false,e:"noroom"},404);
 let me=await db.prepare("SELECT * FROM zq_players WHERE code=? AND pid=?").bind(code,pid).first();
 if(op==="join"){
  if(!me){const cnt=(await db.prepare("SELECT COUNT(*) n FROM zq_players WHERE code=?").bind(code).first()).n;if(cnt>=20)return zqJ({ok:false,e:"full"},409);
   const pub=Math.random().toString(36).slice(2,8);const jq=r.st==="lobby"?0:(r.st==="q"&&now<r.qstart?r.qi:r.qi+1);
   await db.prepare("INSERT INTO zq_players (code,pid,pub,name,emo,score,help,joined,seen,jq) VALUES (?,?,?,?,?,0,0,?,?,?)").bind(code,pid,pub,name,emo,now,now,jq).run()}
  else await db.prepare("UPDATE zq_players SET name=?,emo=?,seen=? WHERE code=? AND pid=?").bind(name,emo,now,code,pid).run();
  await db.prepare("UPDATE zq_rooms SET updated=? WHERE code=?").bind(now,code).run();
  return zqJ(await zqState(db,r,pid,now))}
 if(!me)return zqJ({ok:false,e:"notin"},403);
 await db.prepare("UPDATE zq_players SET seen=? WHERE code=? AND pid=?").bind(now,code,pid).run();
 const isHost=r.host===pid;
 if(op==="state"){await zqTick(db,r,now);return zqJ(await zqState(db,r,pid,now))}
 if(op==="leave"){await db.prepare("DELETE FROM zq_players WHERE code=? AND pid=?").bind(code,pid).run();if(isHost){const nx=(await zqPlayers(db,code))[0];if(nx)await db.prepare("UPDATE zq_rooms SET host=? WHERE code=?").bind(nx.pid,code).run()}return zqJ({ok:true})}
 if(op==="answer"){if(r.st!=="q"||Number(b.qi)!==r.qi||now<r.qstart)return zqJ({ok:false,e:"late"},409);
  if(me.jq>r.qi)return zqJ({ok:false,e:"next"},409);
  const ch=Number(b.ch);if(!(ch>=0&&ch<=3))return zqJ({ok:false,e:"ch"},400);
  if(r.qdur>0&&now>r.qstart+r.qdur+400)return zqJ({ok:false,e:"late"},409);
  const q=zqQ(r,r.qi);const ok=ch===q.correct?1:0;const ms=now-r.qstart;
  const pts=ok?(100+(r.qdur>0?Math.max(0,Math.round(50*(1-ms/r.qdur))):0)):0;
  const ins=await db.prepare("INSERT OR IGNORE INTO zq_answers (code,qi,pid,ch,ms,pts,ok,at) VALUES (?,?,?,?,?,?,?,?)").bind(code,r.qi,pid,ch,ms,pts,ok,now).run();
  if(ins.meta&&ins.meta.changes)await db.prepare("UPDATE zq_players SET score=score+? WHERE code=? AND pid=?").bind(pts,code,pid).run();
  await zqTick(db,r,now);return zqJ(await zqState(db,r,pid,now))}
 if(op==="help"){if(r.st!=="q"||me.help)return zqJ({ok:false,e:"used"},409);const q=zqQ(r,r.qi);
  const wr=[0,1,2,3].filter(i=>i!==q.correct);wr.sort(()=>Math.random()-.5);
  await db.prepare("UPDATE zq_players SET help=1 WHERE code=? AND pid=?").bind(code,pid).run();return zqJ({ok:true,hide:wr.slice(0,2),qi:r.qi})}
 if(!isHost)return zqJ({ok:false,e:"host"},403);
 if(op==="cfg"||op==="start"){const c=b.cfg||{};const cfg={cats:(Array.isArray(c.cats)?c.cats:[]).filter(x=>"ich".includes(x)).slice(0,3),d:[0,1,2,3].includes(c.d)?c.d:0,n:[10,20,30].includes(c.n)?c.n:10,t:[0,15,30].includes(c.t)?c.t:30};if(!cfg.cats.length)cfg.cats=["i","c","h"];
  if(op==="cfg"){if(r.st!=="lobby")return zqJ({ok:false,e:"state"},409);await db.prepare("UPDATE zq_rooms SET cfg=?,updated=? WHERE code=?").bind(JSON.stringify(cfg),now,code).run();r.cfg=JSON.stringify(cfg);return zqJ(await zqState(db,r,pid,now))}
  if(r.st!=="lobby"&&r.st!=="end")return zqJ({ok:false,e:"state"},409);
  const used=JSON.parse(r.used||"[]");const qs=zqPick(cfg,used);const nu=used.concat(qs.map(x=>x[0])).slice(-300);
  const qst=now+3500;
  await db.batch([db.prepare("UPDATE zq_rooms SET st='q',cfg=?,qs=?,qi=0,qstart=?,qdur=?,revat=0,used=?,updated=? WHERE code=?").bind(JSON.stringify(cfg),JSON.stringify(qs),qst,cfg.t*1000,JSON.stringify(nu),now,code),
   db.prepare("UPDATE zq_players SET score=0,help=0,jq=0 WHERE code=?").bind(code),db.prepare("DELETE FROM zq_answers WHERE code=?").bind(code)]);
  return zqJ(await zqState(db,await zqRoom(db,code),pid,now))}
 if(op==="next"){if(r.st==="q"&&now>=r.qstart){await db.prepare("UPDATE zq_rooms SET st='rev',revat=?,updated=? WHERE code=? AND st='q' AND qi=?").bind(now,now,code,r.qi).run();r.st="rev";r.revat=now}
  else if(r.st==="rev")await zqAdvance(db,r,now);return zqJ(await zqState(db,r,pid,now))}
 if(op==="lobby"){await db.batch([db.prepare("UPDATE zq_rooms SET st='lobby',qi=0,qstart=0,revat=0,updated=? WHERE code=?").bind(now,code),db.prepare("UPDATE zq_players SET score=0,help=0,jq=0 WHERE code=?").bind(code),db.prepare("DELETE FROM zq_answers WHERE code=?").bind(code)]);return zqJ(await zqState(db,await zqRoom(db,code),pid,now))}
 return zqJ({ok:false,e:"op"},404)};
