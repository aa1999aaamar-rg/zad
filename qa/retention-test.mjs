// node qa/retention-test.mjs — v5.4.1 retention: no 7-day expiry, per-account cap 30 (pinned kept), storage guard (official + pinned + dw/ untouched)
import { makeEnv } from './d1shim.mjs'; import W from '../site/_worker.js'; import { vidPurge, vidRetentionDry } from '../srv/videos.js';
globalThis.FixedLengthStream = globalThis.FixedLengthStream || class { constructor() { const t = new TransformStream(); this.readable = t.readable; this.writable = t.writable; } };
const env = makeEnv(); const st = env.VIDS._store;
env.VIDS.delete = async k => { for (const x of [].concat(k)) st.delete(x); };
let FAKE = null; // fake object sizes for the guard test (key -> bytes)
env.VIDS.list = async ({ limit = 1000, cursor } = {}) => { const keys = [...st.keys()].sort(); const s = +(cursor || 0); const page = keys.slice(s, s + limit); return { objects: page.map(k => ({ key: k, size: FAKE && FAKE[k] != null ? FAKE[k] : st.get(k).b.length })), truncated: s + limit < keys.length, cursor: String(s + limit) }; };
const waits = []; const ctx = { waitUntil: p => waits.push(Promise.resolve(p).catch(e => console.log('waitUntil err', e))) };
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 400)); } };
const D1 = 'a'.repeat(32), D2 = 'b'.repeat(32);
async function call(dev, path, body, method, extra) {
  const h = { 'x-zad-dev': dev, 'cf-connecting-ip': '1.2.3.4', ...(extra || {}) }; let b;
  if (body instanceof Uint8Array) { b = body; h['content-length'] = String(body.length); h['content-type'] = h['content-type'] || 'video/mp4'; }
  else if (body !== undefined) { b = JSON.stringify(body); h['content-type'] = 'application/json'; }
  const r = await W.fetch(new Request('http://x' + path, { method: method || (body !== undefined ? 'POST' : 'GET'), headers: h, body: b }), env, ctx);
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = { raw: t.slice(0, 200) }; } j._s = r.status; return j;
}
const S = (dev, p, b) => call(dev, '/api/social/' + p, b);
const q = (s, ...a) => env.DB.prepare(s).bind(...a).all().then(r => r.results);
let r = await S(D1, 'dw/profile', { name: 'أبو تجربة', bio: '' }); const U1 = r.me.id;
r = await S(D2, 'dw/profile', { name: 'محمد', bio: '' }); const U2 = r.me.id;
await S(D1, 'vx/me'); await S(D1, 'vx/feed'); // creates the zv tables + official account
const now = Date.now(), DAY = 864e5;
// seed: U1 has 32 approved clips (oldest first), the OLD 7-day expiry style (expires_at = approved_at + 7 d); U2 has 5; official has 4 (old)
const ins = (id, uid, ageD, off, views) => env.DB.prepare("INSERT INTO vid_videos (id,title,name,dev,ctype,size,dur,status,hidden,reports,likes,comments,poster,created,approved_at,expires_at,official,uid,views) VALUES (?,?,?,?,?,?,?,'approved',0,0,0,0,1,?,?,?,?,?,?)")
  .bind(id, 't ' + id, 'n', off ? 'official' : 'dv', 'video/mp4', 1000, 5, now - ageD * DAY, now - ageD * DAY, off ? 32503680000000 : now - ageD * DAY + 7 * DAY, off ? 1 : 0, uid, views || 0).run();
const U1ids = []; for (let i = 0; i < 32; i++) { const id = 'a1c00000000000' + String(i).padStart(2, '0'); U1ids.push(id); await ins(id, U1, 40 - i, 0, i); await env.VIDS.put('v/' + id, new Uint8Array(1000)); await env.VIDS.put('p/' + id, new Uint8Array(50)); }
for (let i = 0; i < 5; i++) { const id = 'a2c000000000000' + i; await ins(id, U2, 20 - i, 0, 1); await env.VIDS.put('v/' + id, new Uint8Array(1000)); await env.VIDS.put('p/' + id, new Uint8Array(50)); }
for (let i = 0; i < 4; i++) { const id = 'ffc000000000000' + i; await ins(id, 'zadammar', 60 - i, 1, 0); await env.VIDS.put('v/' + id, new Uint8Array(1000)); await env.VIDS.put('p/' + id, new Uint8Array(50)); }
await env.VIDS.put('dw/img1', new Uint8Array(77));
// related rows on the oldest clip of U1 (will be deleted by the cap) — comment, view, save, tag, like
await env.DB.prepare("INSERT INTO vid_comments (id,vid,name,text,dev,at) VALUES ('cm1','a1c0000000000002','x','y','dv',1)").run();
await env.DB.prepare("INSERT INTO zv_view (vid,dk,day,at) VALUES ('a1c0000000000002','k','2026-10-01',1)").run();
await env.DB.prepare("INSERT INTO zv_save (dev,vid,k,at) VALUES ('d','a1c0000000000002','s',1)").run();
await env.DB.prepare("INSERT INTO zv_tag (tag,vid,at) VALUES ('t','a1c0000000000002',1)").run();
await env.DB.prepare("INSERT INTO vid_likes (vid,dev,at) VALUES ('a1c0000000000002','d',1)").run();
// U1 pins the two oldest clips
r = await S(D1, 'vx/pin', { id: 'a1c0000000000000' }); ok(r.ok, 'pin 0', r); r = await S(D1, 'vx/pin', { id: 'a1c0000000000001' }); ok(r.ok, 'pin 1', r);
console.log('pins', JSON.stringify(await q('SELECT uid,pins FROM zv_prof')), U1);
await vidPurge(env, Date.now(), true);
// 1) no more 7-day expiry: a 40-day-old user clip is still served (migration lifts expires_at on first request)
r = await call(D2, '/api/videos/v/a1c0000000000005'); ok(r._s === 200 || r._s === 206 || r.raw !== undefined && r._s < 300, 'old clip served', r._s);
const e = await q("SELECT COUNT(*) n FROM vid_videos WHERE status='approved' AND expires_at<32503680000000"); ok(e[0].n === 0, 'all expiries lifted', e);
r = await S(D2, 'vx/user?h=' + U1); ok(r.ok, 'profile loads', r);
// dry run before: U1 has 30 non-pinned → nothing over cap yet
let d = await vidRetentionDry(env); ok(d.ok && d.cap_would_delete === 0 && d.guard.would === undefined && d.guard.deleted === 0, 'dry 0', d);
// 2) purge (forced) deletes no approved clip any more
let p = await vidPurge(env, Date.now(), true); ok(p.purged === 0 && !p.cap && !p.guard && !p.lifted, 'purge deletes nothing', p);
ok((await q("SELECT COUNT(*) n FROM vid_videos WHERE status='approved'"))[0].n === 41, '41 clips stay', null);
// 3) a new upload by U1 → newest 30 non-pinned kept: a1c0000000000002 (oldest non-pinned) goes, with its rows and R2 objects; pins stay
const vid = new Uint8Array(4000).fill(7);
r = await S(D1, 'vx/init', { caption: 'جديد', size: vid.length, dur: 5, type: 'video/mp4' }); ok(r.ok, 'init', r); const NV = r.id, NT = r.t;
r = await call(D1, '/api/videos/file/' + NV + '?t=' + NT, vid, 'PUT'); ok(r.ok && r.expires_at > now + 1e12, 'file approved, no expiry', r);
await Promise.all(waits);
const left = (await q("SELECT id FROM vid_videos WHERE uid=? AND status='approved'", U1)).map(x => x.id);
ok(left.length === 32 && !left.includes('a1c0000000000002') && left.includes('a1c0000000000000') && left.includes('a1c0000000000001') && left.includes(NV) && left.includes('a1c0000000000003'), 'cap: oldest non-pinned removed', left);
ok(!st.has('v/a1c0000000000002') && !st.has('p/a1c0000000000002') && st.has('v/a1c0000000000000'), 'cap: R2 objects gone', [...st.keys()].filter(k => k.includes('a1c0')));
for (const [t, w] of [['vid_comments', 'vid'], ['zv_view', 'vid'], ['zv_save', 'vid'], ['zv_tag', 'vid'], ['vid_likes', 'vid']]) ok((await q(`SELECT COUNT(*) n FROM ${t} WHERE ${w}='a1c0000000000002'`))[0].n === 0, 'cap: rows gone ' + t);
let m = await q("SELECT k,v FROM vid_meta WHERE k LIKE 'auto_del%'"); ok(m.some(x => x.k === 'auto_del' && x.v === '1') && m.some(x => x.k === 'auto_del_cap' && x.v === '1'), 'auto_del logged', m);
// official episodes untouched by the cap, U2 untouched
ok((await q("SELECT COUNT(*) n FROM vid_videos WHERE official=1"))[0].n === 4 && (await q("SELECT COUNT(*) n FROM vid_videos WHERE uid=?", U2))[0].n === 5, 'official + other user intact');
// hourly catch-up: push U1 over cap by inserting 3 more directly → capAll trims 3 oldest non-pinned
for (let i = 0; i < 3; i++) await ins('a1e000000000000' + i, U1, 0.01 * (i + 1), 0, 0);
d = await vidRetentionDry(env); ok(d.cap_would_delete === 3 && d.cap_accounts_over === 1, 'dry cap 3', d);
ok((await q("SELECT COUNT(*) n FROM vid_videos WHERE uid=?", U1))[0].n === 35, 'dry run deleted nothing');
p = await vidPurge(env, Date.now(), true); ok(p.cap === 3, 'hourly cap 3', p);
const l2 = (await q("SELECT id FROM vid_videos WHERE uid=? AND status='approved'", U1)).map(x => x.id); ok(l2.length === 32 && !l2.includes('a1c0000000000003') && !l2.includes('a1c0000000000005') && l2.includes('a1c0000000000006') && l2.includes('a1c0000000000000'), 'catch-up kept newest 30 + pins', l2);
// 4) storage guard: fake the bucket at ~8.5 GB → deletes lowest-score user clips until < 7 GB; official, pinned, dw/ untouched
FAKE = {}; for (const k of st.keys()) FAKE[k] = k.startsWith('v/') ? (k.startsWith('v/ffc0000') ? 0.5e9 : 0.2e9) : 10;
FAKE['dw/img1'] = 0.3e9;
await env.DB.prepare("UPDATE vid_videos SET size=200000000 WHERE COALESCE(official,0)=0").run();
d = await vidRetentionDry(env); ok(d.guard.level > 8e9 && d.guard.would > 0 && d.guard.deleted === 0, 'dry guard counts', d.guard);
const before = (await q("SELECT COUNT(*) n FROM vid_videos"))[0].n;
p = await vidPurge(env, Date.now(), true); ok(p.guard > 0 && p.guard === d.guard.would, 'guard deleted', p);
FAKE = Object.fromEntries(Object.entries(FAKE).filter(([k]) => st.has(k)));
const tot = Object.values(FAKE).reduce((a, b) => a + b, 0); ok(tot < 7e9 + 1, 'under 7 GB after', tot);
ok((await q("SELECT COUNT(*) n FROM vid_videos WHERE official=1"))[0].n === 4 && st.has('v/ffc0000000000000') && st.has('dw/img1'), 'guard: official + dw intact');
ok(st.has('v/a1c0000000000000') && st.has('v/a1c0000000000001'), 'guard: pinned intact');
const gone = before - (await q("SELECT COUNT(*) n FROM vid_videos"))[0].n; ok(gone === p.guard, 'guard rows', gone);
// lowest score first: the U1 clips with views 0..few + oldest go before newer-and-viewed ones
const survivors = (await q("SELECT id, views, approved_at FROM vid_videos WHERE COALESCE(official,0)=0 ORDER BY approved_at"));
console.log('dry guard', JSON.stringify(d.guard), 'tot after', tot);
console.log('guard removed', p.guard, 'survivors', survivors.length);
m = await q("SELECT k,v FROM vid_meta WHERE k IN ('auto_del','auto_del_guard','vid_bytes')"); console.log(JSON.stringify(m));
// admin list stat
console.log(`PASS ${pass} FAIL ${fail}`); process.exit(fail ? 1 : 0);
