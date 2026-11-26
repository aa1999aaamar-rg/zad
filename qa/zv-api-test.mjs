// node qa/zv-api-test.mjs — v5.4 «مقاطع زاد» API against the in-memory D1/R2 (two devices, every route)
import { makeEnv } from './d1shim.mjs'; import W from '../site/_worker.js';
globalThis.FixedLengthStream = globalThis.FixedLengthStream || class { constructor() { const t = new TransformStream(); this.readable = t.readable; this.writable = t.writable; } };
const env = makeEnv(); const waits = []; const ctx = { waitUntil: p => waits.push(Promise.resolve(p).catch(e => console.log('waitUntil err', e))) };
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 400)); } };
const D1 = 'a'.repeat(32), D2 = 'b'.repeat(32), D3 = 'c'.repeat(32);
async function call(dev, path, body, method, extra) {
  const h = { 'x-zad-dev': dev, 'cf-connecting-ip': '1.2.3.4', ...(extra || {}) };
  let b;
  if (body instanceof Uint8Array) { b = body; h['content-length'] = String(body.length); h['content-type'] = h['content-type'] || 'video/mp4'; }
  else if (body !== undefined) { b = JSON.stringify(body); h['content-type'] = 'application/json'; }
  const r = await W.fetch(new Request('http://x' + path, { method: method || (body !== undefined ? 'POST' : 'GET'), headers: h, body: b }), env, ctx);
  const t = await r.text(); let j; try { j = JSON.parse(t); } catch (e) { j = { raw: t.slice(0, 200), status: r.status }; } j._s = r.status; return j;
}
const S = (dev, p, b) => call(dev, '/api/social/' + p, b);
let r = await S(D1, 'vx/me'); ok(r.ok && r.me === null, 'me null', r);
r = await S(D1, 'vx/feed'); ok(r.ok && Array.isArray(r.items), 'feed empty', r);
r = await S(D1, 'vx/init', { caption: 'x', size: 1000, dur: 5, type: 'video/mp4' }); ok(r.error === 'profile', 'init needs profile', r);
r = await S(D1, 'dw/profile', { name: 'أبو تجربة', bio: 'سطر' }); ok(r.ok, 'dw profile 1', r); const U1 = r.me.id;
r = await S(D2, 'dw/profile', { name: 'محمد', bio: '' }); ok(r.ok, 'dw profile 2', r); const U2 = r.me.id;
r = await S(D1, 'vx/me'); ok(r.ok && r.me && r.me.id === U1 && r.me.h === U1, 'me 1', r);
r = await S(D1, 'vx/prof', { h: 'abu_test', pat: 3 }); ok(r.ok && r.me.h === 'abu_test' && r.me.pat === 3, 'set handle', r);
r = await S(D2, 'vx/prof', { h: 'abu_test' }); ok(!r.ok && r.error === 'taken', 'handle taken', r);
r = await S(D2, 'vx/prof', { h: 'ammar' }); ok(!r.ok, 'reserved', r);
r = await S(D2, 'vx/prof', { h: 'mohd' }); ok(r.ok, 'handle 2', r);
// official account exists
r = await S(D1, 'vx/user?h=ammar'); ok(r.ok && r.user.ver === 1 && r.user.name === 'عمار' && r.user.off === 1, 'official profile', r);
// series
r = await S(D1, 'vx/series', { op: 'new', title: 'سلسلة الصلاة' }); ok(r.ok, 'series new', r); const SID = r.item.id;
// upload
const vid = new Uint8Array(4000).fill(7), pos = new Uint8Array(500).fill(3);
r = await S(D1, 'vx/init', { caption: 'فضل الصلاة #الصلاة #ذكر مع @mohd', size: vid.length, dur: 12.4, type: 'video/mp4', w: 720, h: 1280, ts: 1, te: 9, cmt: 'all', dl: 0, series: SID,
  fx: { f: { b: 1.1, c: 1.2, w: .4 }, o: [{ t: 'سبحان الله', x: 50, y: 30, c: '#ffd166', f: 'a', z: 28 }, { k: 'aya', ref: '2:255', x: 50, y: 70 }, { t: 'http://bad.com', x: 1, y: 1 }] } });
ok(r.ok && r.id && r.t, 'vx/init', r); const V1 = r.id, T1 = r.t;
r = await call(D1, '/api/videos/poster/' + V1 + '?t=' + T1, pos, 'PUT', { 'content-type': 'image/jpeg' }); ok(r.ok, 'poster', r);
r = await call(D1, '/api/videos/file/' + V1 + '?t=' + T1, vid, 'PUT'); ok(r.ok && r.status === 'approved', 'file', r);
r = await S(D1, 'vx/done', { id: V1 }); ok(r.ok, 'done', r); await Promise.all(waits);
r = await S(D2, 'dw/notifs?seen=0'); ok(r.ok && r.items.some(n => n.k === 'vmen' && n.pid === 'v:' + V1 && n.t.includes('فضل')), 'mention notif', r);
r = await S(D2, 'vx/item?id=' + V1); ok(r.ok && r.item.u.h === 'abu_test' && r.item.ts === 1 && r.item.te === 9 && r.item.fx.o.length === 2 && r.item.fx.o[1].k === 'aya' && r.item.dl === 0 && r.item.ser.t === 'سلسلة الصلاة', 'item shape', r);
r = await call(D2, '/api/videos/v/' + V1 + '?dl=1'); ok(r._s === 403, 'dl off 403', r);
r = await call(D2, '/api/videos/v/' + V1, undefined, 'GET', { range: 'bytes=0-99' }); ok(r._s === 206, 'stream 206', r);
// feed
r = await S(D2, 'vx/feed'); ok(r.ok && r.items.some(x => x.id === V1), 'feed has clip', r);
r = await S(D2, 'vx/feed?f=fol'); ok(r.ok && r.items.length === 0, 'fol empty', r);
r = await S(D2, 'dw/follow', { u: U1 }); ok(r.ok && r.following, 'follow', r);
r = await S(D2, 'vx/feed?f=fol'); ok(r.ok && r.items.length === 1 && r.items[0].u.fol === 1, 'fol feed', r);
// like / view / save
r = await S(D2, 'vx/like', { id: V1 }); ok(r.ok && r.liked && r.likes === 1, 'like', r);
r = await S(D1, 'dw/notifs?seen=0'); ok(r.items.some(n => n.k === 'vlike'), 'like notif', r);
r = await S(D2, 'vx/like', { id: V1 }); ok(r.ok && !r.liked && r.likes === 0, 'unlike', r);
r = await S(D2, 'vx/like', { id: V1, on: true }); ok(r.liked, 'like again');
r = await S(D2, 'vx/view', { id: V1 }); ok(r.counted, 'view 1', r); r = await S(D2, 'vx/view', { id: V1 }); ok(!r.counted, 'view dedup', r);
r = await S(D3, 'vx/view', { id: V1 }); ok(r.counted, 'view dev3', r);
r = await S(D2, 'vx/save', { id: V1, k: 's' }); ok(r.on && r.saves === 1, 'save', r);
r = await S(D2, 'vx/save', { id: V1, k: 'w' }); ok(r.on, 'later', r);
r = await S(D2, 'vx/item?id=' + V1); ok(r.item.views === 2 && r.item.liked && r.item.saved && r.item.later, 'flags', r.item);
// comments
r = await S(D2, 'vx/cmt', { id: V1, text: 'ما شاء الله تبارك الله' }); ok(r.ok, 'comment', r); const C1 = r.item.id;
r = await S(D1, 'vx/cmt', { id: V1, text: 'جزاك الله خير', parent: C1 }); ok(r.ok && r.item.parent === C1, 'reply', r); const C2 = r.item.id;
r = await S(D2, 'vx/cmt', { id: V1, text: 'زورو www.x.com' }); ok(!r.ok && r.error === 'link', 'link refused', r);
r = await S(D2, 'vx/cml', { id: C2 }); ok(r.ok && r.liked && r.likes === 1, 'comment like', r);
r = await S(D2, 'vx/cpin', { id: C1 }); ok(!r.ok, 'non creator pin', r);
r = await S(D1, 'vx/cpin', { id: C1 }); ok(r.ok && r.pinned, 'creator pin', r);
r = await S(D2, 'vx/cmts?id=' + V1); ok(r.ok && r.items.length === 1 && r.items[0].pinned && r.items[0].replies.length === 1 && r.items[0].replies[0].liked && r.items[0].mine && r.can === 'yes', 'cmts tree', r);
r = await S(D1, 'dw/notifs?seen=0'); ok(r.items.some(n => n.k === 'vcmt'), 'cmt notif', r);
r = await S(D2, 'dw/notifs?seen=0'); ok(r.items.some(n => n.k === 'vrpl') && r.items.some(n => n.k === 'vcl') === false, 'reply notif', r);
r = await S(D1, 'vx/edit', { id: V1, cmt: 'off' }); ok(r.ok, 'cmt off');
r = await S(D2, 'vx/cmt', { id: V1, text: 'سلام' }); ok(r.error === 'off', 'cmt off enforced', r);
r = await S(D1, 'vx/edit', { id: V1, cmt: 'fol' }); r = await S(D3, 'dw/profile', { name: 'زائر' }); r = await S(D3, 'vx/cmt', { id: V1, text: 'سلام' }); ok(r.error === 'fol', 'fol enforced', r);
r = await S(D2, 'vx/cmt', { id: V1, text: 'وعليكم السلام' }); ok(r.ok, 'follower can', r); const C3 = r.item.id;
r = await S(D1, 'vx/cdel', { id: C3 }); ok(r.ok, 'creator deletes', r);
r = await S(D2, 'vx/cdel', { id: C1 }); ok(r.ok && r.deleted === 2, 'own delete with replies', r);
r = await S(D2, 'vx/item?id=' + V1); ok(r.item.comments === 0, 'count after delete', r.item);
// profile
r = await S(D2, 'vx/user?h=abu_test'); ok(r.ok && r.user.followers === 1 && r.user.likes === 1 && r.user.clips === 1 && r.user.following === 1 && r.items.length === 1 && r.user.series.length === 1, 'profile', r);
r = await S(D1, 'vx/pin', { id: V1 }); ok(r.ok && r.pinned, 'pin', r);
r = await S(D2, 'vx/user?h=abu_test'); ok(r.items[0].pinned === 1, 'pinned first', r);
r = await S(D2, 'vx/user?h=abu_test&tab=s'); ok(!r.ok, 'saved private', r);
r = await S(D2, 'vx/user?h=mohd&tab=s'); ok(r.ok && r.items.length === 1, 'own saved', r);
r = await S(D2, 'vx/user?h=mohd&tab=w'); ok(r.ok && r.items.length === 1, 'own later', r);
r = await S(D2, 'vx/user?h=mohd&tab=l'); ok(r.ok && r.items.length === 1, 'own liked', r);
r = await S(D1, 'vx/user?h=mohd&tab=l'); ok(!r.ok, 'liked private', r);
r = await S(D2, 'vx/me'); r = await S(D2, 'vx/prof', { likesPub: 1 }); r = await S(D1, 'vx/user?h=mohd&tab=l'); ok(r.ok && r.items.length === 1, 'liked public', r);
r = await S(D2, 'vx/user?h=abu_test&tab=ser&sid=' + SID); ok(r.ok && r.items.length === 1 && r.series.title === 'سلسلة الصلاة', 'series tab', r);
// explore, tags, ac, suggest, stats
r = await S(D3, 'vx/explore'); ok(r.ok && r.trending.some(t => t.tag === 'الصلاه') && r.users.length >= 1 && r.clips.length === 1, 'explore home', r);
r = await S(D3, 'vx/explore?q=' + encodeURIComponent('فضل')); ok(r.ok && r.clips.length === 1, 'explore q', r);
r = await S(D3, 'vx/explore?q=abu'); ok(r.ok && r.users.some(u => u.h === 'abu_test'), 'explore users', r);
r = await S(D3, 'vx/tag?t=' + encodeURIComponent('الصلاة')); ok(r.ok && r.n === 1 && r.items.length === 1, 'tag page', r);
r = await S(D3, 'vx/ac?q=' + encodeURIComponent('@ab')); ok(r.ok && r.users[0].h === 'abu_test', 'ac user', r);
r = await S(D3, 'vx/ac?q=' + encodeURIComponent('#ذ')); ok(r.ok && r.tags[0].tag === 'ذكر', 'ac tag', r);
r = await S(D3, 'vx/suggest?after=' + U2); ok(r.ok && r.items.some(u => u.id === U1), 'suggest', r);
r = await S(D1, 'vx/stats?d=7'); ok(r.ok && r.views.reduce((a, b) => a + b, 0) === 2 && r.likes.reduce((a, b) => a + b, 0) === 1 && r.followers.reduce((a, b) => a + b, 0) === 1 && r.days.length === 7 && r.top.length === 1, 'stats', r);
// reply with a clip + scheduled
r = await S(D2, 'vx/init', { caption: 'ردّي', size: vid.length, dur: 6, type: 'video/mp4', reply_to: V1 }); ok(r.ok, 'reply init', r); const V2 = r.id, T2 = r.t;
r = await call(D2, '/api/videos/file/' + V2 + '?t=' + T2, vid, 'PUT'); r = await S(D2, 'vx/done', { id: V2 }); await Promise.all(waits);
r = await S(D3, 'vx/item?id=' + V2); ok(r.ok && r.item.rt && r.item.rt.h === 'abu_test', 'reply chip', r);
r = await S(D1, 'dw/notifs?seen=0'); ok(r.items.some(n => n.k === 'vrep'), 'vrep notif', r);
r = await S(D2, 'vx/init', { caption: 'مجدول #غدا', size: vid.length, dur: 6, type: 'video/mp4', pub_at: Date.now() + 3600e3 }); ok(r.ok && r.sched, 'sched init', r); const V3 = r.id, T3 = r.t;
r = await call(D2, '/api/videos/file/' + V3 + '?t=' + T3, vid, 'PUT'); ok(r.ok && r.approved_at > Date.now(), 'sched file', r);
r = await S(D2, 'vx/done', { id: V3 }); ok(r.sched, 'sched done', r);
r = await S(D3, 'vx/feed'); ok(!r.items.some(x => x.id === V3), 'sched hidden from feed', r.items.map(x => x.id));
r = await call(D3, '/api/videos/feed'); ok(r.ok && !r.items.some(x => x.id === V3), 'sched hidden from old feed', r);
r = await S(D2, 'vx/user?h=mohd'); ok(r.items.some(x => x.id === V3 && x.sched), 'own sees scheduled', r);
r = await S(D3, 'vx/user?h=mohd'); ok(!r.items.some(x => x.id === V3), 'others do not see scheduled', r);
// hide, block
r = await S(D3, 'vx/hide', { id: V2 }); r = await S(D3, 'vx/feed'); ok(!r.items.some(x => x.id === V2), 'not interested', r);
r = await S(D3, 'dw/block', { u: U1 }); ok(r.ok && r.blocked, 'block', r);
r = await S(D3, 'vx/feed'); ok(!r.items.some(x => x.id === V1), 'blocked hidden', r);
r = await S(D3, 'vx/user?h=abu_test'); ok(r.ok && r.user.blocked && r.items.length === 0, 'blocked profile', r);
// old API still works
r = await call(D3, '/api/videos/item/' + V1); ok(r.ok, 'old item api', r);
r = await call(D3, '/api/videos/report/' + V2, { reason: 'x' }); ok(r.ok, 'old report api', r);
// delete own clip + account deletion removes clips
r = await S(D2, 'vx/del', { id: V2 }); ok(r.ok, 'del own', r); r = await S(D1, 'vx/item?id=' + V2); ok(!r.ok, 'deleted gone', r);
r = await S(D1, 'dw/deleteme', {}); ok(r.ok, 'deleteme', r);
r = await S(D2, 'vx/item?id=' + V1); ok(!r.ok, 'account clips gone', r);
const left = await env.DB.prepare("SELECT (SELECT COUNT(*) FROM zv_view WHERE vid=?1) a, (SELECT COUNT(*) FROM zv_save WHERE vid=?1) b, (SELECT COUNT(*) FROM zv_tag WHERE vid=?1) c, (SELECT COUNT(*) FROM vid_comments WHERE vid=?1) d, (SELECT COUNT(*) FROM sc_dw_notif WHERE pid LIKE 'v:'||?1||'%') e").bind(V1).first();
ok(!left.a && !left.b && !left.c && !left.d && !left.e, 'no orphans', left);
// push link (no sub → nosub)
r = await S(D2, 'vx/pushlink', { endpoint: 'https://fcm.googleapis.com/x' }); ok(r.error === 'nosub', 'pushlink nosub', r);
// tick still fine
console.log('PASS', pass, 'FAIL', fail);
