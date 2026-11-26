// node qa/dw-local-test.mjs  — the Diwaniya API end to end against the bundled Worker (sql.js D1 + Map R2)
import { makeEnv } from './d1shim.mjs';
import W from '../site/_worker.js';
import { createHash, randomBytes } from 'node:crypto';
const env = makeEnv(); const ctx = { waitUntil: p => p };
let pass = 0, fail = 0; const ck = (n, ok, i = '') => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + n + ' ' + (typeof i === 'string' ? i : JSON.stringify(i)).slice(0, 300)); };
const dev = () => randomBytes(16).toString('hex');
const A = dev(), B = dev(), C = dev(), D = dev();
const call = async (d, p, b, extra = {}) => { const h = { 'x-zad-dev': d, 'cf-connecting-ip': '1.2.3.' + (d.charCodeAt(0) % 9) }; let body; if (b !== undefined) { h['content-type'] = extra.ct || 'application/json'; body = extra.raw || JSON.stringify(b); } if (extra.auth) h.authorization = 'Bearer ' + extra.auth;
  const r = await W.fetch(new Request('https://x.test/api/social/' + p, { method: b !== undefined ? 'POST' : 'GET', headers: h, body }), env, ctx); const t = await r.text(); let j; try { j = JSON.parse(t) } catch (e) { j = { raw: t.slice(0, 200) } } j._s = r.status; return j; };
// prime the schema + an admin session
await call(A, 'chal/list');
await env.DB.prepare('CREATE TABLE IF NOT EXISTS vid_sess (h TEXT PRIMARY KEY, exp INTEGER)').run();
const ADM = randomBytes(24).toString('hex'); await env.DB.prepare('INSERT INTO vid_sess (h,exp) VALUES (?,?)').bind(createHash('sha256').update('s:' + ADM).digest('hex'), Date.now() + 36e5).run();
let r = await call(A, 'dw/me'); ck('me before profile', r.ok && r.me === null, r);
r = await call(A, 'dw/post', { text: 'hi' }); ck('post needs profile', !r.ok && r.error === 'profile', r);
r = await call(A, 'dw/profile', { name: 'كلب' }); ck('bad name rejected', !r.ok && r.error === 'bad', r);
r = await call(A, 'dw/profile', { name: 'أبو عبدالله', bio: 'طالب علم' }); ck('profile A', r.ok && r.me.name === 'أبو عبدالله', r); const UA = r.me.id;
r = await call(B, 'dw/profile', { name: 'سارة' }); ck('profile B', r.ok, r); const UB = r.me.id;
r = await call(A, 'dw/post', { text: 'x'.repeat(281) }); ck('281 chars rejected', !r.ok && r.error === 'long', r);
r = await call(A, 'dw/post', { text: 'يا حمار' }); ck('filtered word rejected', !r.ok && r.error === 'bad', r);
r = await call(A, 'dw/post', { text: 'كلمني 0551234567' }); ck('phone rejected', !r.ok && r.error === 'contact', r);
r = await call(A, 'dw/post', { text: 'شوفوا https://x.com' }); ck('link rejected', !r.ok && r.error === 'contact', r);
r = await call(A, 'dw/post', { text: 'السلام عليكم يا أهل الديوانية #الجمعة #تدبر' }); ck('post A1', r.ok && r.post.text.includes('الجمعة'), r); const P1 = r.post.id;
// image upload
const jpg = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==', 'base64');
r = await call(B, 'dw/img', {}, { ct: 'image/jpeg', raw: jpg }); ck('image upload', r.ok && r.id, r); const IMG = r.id;
r = await call(B, 'dw/post', { text: 'صورة من المسجد', img: IMG }); ck('post with image', r.ok && r.post.img === IMG, r); const P2 = r.post.id;
const ir = await W.fetch(new Request('https://x.test/api/social/dw/img/' + IMG), env, ctx); ck('image served', ir.status === 200 && ir.headers.get('content-type') === 'image/jpeg', ir.status);
r = await call(A, 'dw/post', { text: 'ثانية', img: IMG }); ck('cannot reuse others image', !r.ok, r);
r = await call(B, 'dw/post', { text: 'وعليكم السلام ورحمة الله', reply_to: P1 }); ck('reply B→A', r.ok && r.post.reply_to.id === P1, r); const R1 = r.post.id;
r = await call(A, 'dw/post', { text: 'حياك الله', reply_to: R1 }); ck('nested reply A→B', r.ok, r); const R2 = r.post.id;
r = await call(B, 'dw/like', { id: P1 }); ck('like', r.ok && r.liked && r.likes === 1, r);
r = await call(B, 'dw/repost', { id: P1 }); ck('repost', r.ok && r.reposted && r.reposts === 1, r);
r = await call(B, 'dw/post', { text: 'كلام جميل', quote_of: P1 }); ck('quote', r.ok && r.post.quote && r.post.quote.id === P1, r); const Q1 = r.post.id;
r = await call(B, 'dw/follow', { u: UA }); ck('follow', r.ok && r.following && r.followers === 1, r);
r = await call(A, 'dw/notifs'); const kinds = (r.items || []).map(x => x.k).sort().join(','); ck('notifications for A', r.ok && kinds === 'follow,like,quote,reply,repost', kinds);
r = await call(A, 'dw/me'); ck('unread cleared after read', r.ok && r.unread === 0, r);
r = await call(B, 'dw/feed?f=for'); ck('for feed', r.ok && r.items.length >= 3 && r.items[0].id, r.items && r.items.map(x => x.text.slice(0, 10)));
const p1 = r.items.find(x => x.id === P1); ck('for feed flags (liked, reposted, counts)', p1 && p1.liked && p1.reposted && p1.likes === 1 && p1.replies === 1 && p1.reposts === 2, p1);
r = await call(B, 'dw/feed?f=fol'); ck('following feed has A + own + repost', r.ok && r.items.some(x => x.id === P1 && !x.rp) && r.items.some(x => x.rp && x.rp.id === UB), r.items && r.items.map(x => [x.id, x.rp && x.rp.name]));
r = await call(C, 'dw/feed?f=fol'); ck('following feed without profile asks for one', r.ok && r.need === 'profile', r);
r = await call(A, 'dw/post?id=' + P1); ck('thread', r.ok && r.replies.length === 1 && r.replies[0].id === R1, r);
r = await call(A, 'dw/post?id=' + R2); ck('thread ancestors', r.ok && r.parents.length === 2, r.parents && r.parents.length);
r = await call(A, 'dw/user?u=' + UA); ck('profile page counts', r.ok && r.user.followers === 1 && r.user.posts === 2 && r.user.me, r.user);
r = await call(B, 'dw/user?u=' + UA); ck('profile page following', r.ok && r.user.following, r.user);
r = await call(A, 'dw/tag?t=' + encodeURIComponent('الجمعه')); ck('hashtag (normalised ة)', r.ok && r.items.length === 1, r);
r = await call(A, 'dw/trends'); ck('trends', r.ok && r.items.length === 2, r.items);
r = await call(A, 'dw/search?q=' + encodeURIComponent('سارة')); ck('search users', r.ok && r.users.length === 1, r.users);
// report → hide (3 different devices)
await call(C, 'dw/profile', { name: 'محمد' }); await call(D, 'dw/profile', { name: 'خالد' });
r = await call(A, 'dw/report', { id: P2, reason: 'test' }); r = await call(C, 'dw/report', { id: P2 }); ck('2 reports: still visible', r.ok && !r.hidden, r);
r = await call(C, 'dw/report', { id: P2 }); ck('same device twice counts once', r.ok && !r.hidden, r);
r = await call(D, 'dw/report', { id: P2 }); ck('3rd report hides', r.ok && r.hidden, r);
r = await call(A, 'dw/feed?f=for'); ck('hidden post gone for others', r.ok && !r.items.some(x => x.id === P2), '');
r = await call(B, 'dw/user?u=' + UB); ck('author still sees own hidden post', r.ok && r.items.some(x => x.id === P2 && x.hidden), '');
// block
r = await call(A, 'dw/block', { u: UB }); ck('block', r.ok && r.blocked, r);
r = await call(A, 'dw/feed?f=for'); ck('blocked user gone from feed', r.ok && !r.items.some(x => x.u.id === UB || (x.rp && x.rp.id === UB)), r.items.map(x => x.u.name));
r = await call(B, 'dw/like', { id: P1 }); ck('blocked user cannot like', !r.ok && r.error === 'blocked', r);
r = await call(B, 'dw/user?u=' + UA); ck('block removed the follow', r.ok && !r.user.following, r.user);
r = await call(A, 'dw/block', { u: UB }); ck('unblock', r.ok && !r.blocked, r);
// rate limit through sc_rate
let rl = 0; for (let i = 0; i < 9; i++) { const x = await call(D, 'dw/post', { text: 'تجربة ' + i }); if (x._s === 429) rl++; } ck('rate limit (8 posts / 10 min)', rl >= 1, rl);
// admin
r = await call(A, 'admin/dw', undefined, { auth: ADM }); ck('admin list', r.ok && r.posts.length >= 5 && r.users.length === 4, r.stats);
r = await call(A, 'admin/dw', undefined, { auth: 'f'.repeat(48) }); ck('admin needs auth', r._s === 401, r._s);
r = await call(A, 'admin/dwpost', { op: 'pin', id: Q1 }, { auth: ADM }); ck('admin pin', r.ok, r);
r = await call(C, 'dw/feed?f=for'); ck('pinned on top of «لك»', r.ok && r.pinned.length === 1 && r.pinned[0].id === Q1 && !r.items.some(x => x.id === Q1), r.pinned);
r = await call(A, 'admin/dwpost', { op: 'unhide', id: P2 }, { auth: ADM }); r = await call(C, 'dw/feed?f=for'); ck('admin unhide', r.items.some(x => x.id === P2), '');
r = await call(A, 'admin/dwuser', { op: 'ban', uid: UD() }, { auth: ADM });
function UD() { return null }
const ud = (await call(D, 'dw/me')).me.id;
r = await call(A, 'admin/dwuser', { op: 'ban', uid: ud }, { auth: ADM }); ck('admin ban', r.ok, r);
r = await call(D, 'dw/post', { text: 'ممنوع' }); ck('banned user cannot post', r._s === 403 || r._s === 429, r);
r = await call(A, 'dw/feed?f=for'); ck('banned user hidden from feed', !r.items.some(x => x.u.id === ud), '');
r = await call(A, 'admin/dwpost', { op: 'delete', id: P1 }, { auth: ADM }); ck('admin delete', r.ok, r);
r = await call(B, 'dw/post?id=' + Q1); ck('quote of deleted post shows gone', r.ok && r.post.quote && r.post.quote.gone, r.post && r.post.quote);
r = await call(B, 'dw/post?id=' + R1); ck('orphan reply still opens', r.ok, r._s);
r = await call(B, 'dw/delete', { id: R1 }); ck('own delete', r.ok, r);
r = await call(A, 'dw/delete', { id: Q1 }); ck('cannot delete others', !r.ok && r._s === 403, r);
// cleanup: every user purges
for (const d of [A, B, C]) { r = await call(d, 'dw/deleteme', {}); }
r = await call(A, 'admin/dwuser', { op: 'purge', uid: ud }, { auth: ADM }); ck('admin purge', r.ok, r);
const cnt = async t => (await env.DB.prepare('SELECT COUNT(*) n FROM ' + t).first()).n;
const tabs = ['sc_dw_user', 'sc_dw_post', 'sc_dw_like', 'sc_dw_follow', 'sc_dw_block', 'sc_dw_tag', 'sc_dw_notif', 'sc_dw_img'];
const left = {}; for (const t of tabs) left[t] = await cnt(t); left.reports = (await env.DB.prepare("SELECT COUNT(*) n FROM sc_reports WHERE target LIKE 'dw:%'").first()).n; left.r2 = env.VIDS._store.size;
ck('everything gone after deleteme/purge', Object.values(left).every(x => x === 0), left);
// dorous
const g = async p => { const r = await W.fetch(new Request('https://x.test/api/dorous/' + p), env, ctx); return r.json(); };
r = await g('cat'); ck('dorous cat', r.ok && r.sheikhs.length >= 1, r.sheikhs && r.sheikhs.map(s => s.key));
const keys = r.sheikhs.flatMap(s => s.channels.map(c => 'ch:' + c.id).concat(c => []));
const allKeys = []; r.sheikhs.forEach(s => s.channels.forEach(c => { allKeys.push('ch:' + c.id); (c.playlists || []).forEach(p => allKeys.push('pl:' + p.id)) }));
for (let i = 0; i < allKeys.length; i += 12) { const part = allKeys.slice(i, i + 12); const f = await g('feed?ids=' + encodeURIComponent(part.join(','))); for (const k of part) { const x = f.feeds && f.feeds[k]; ck('feed ' + k, x && x.items.length > 0, x ? x.items.length + ' · ' + (x.items[0] && x.items[0].t) : 'missing'); } }
r = await g('feed?ids=ch:UCnotallowed000000000000'); ck('not in allow-list refused', !r.ok, r);
const t0 = Date.now(); r = await g('all'); ck('all (cached)', r.ok && Object.keys(r.feeds).length === allKeys.length, Object.keys(r.feeds || {}).length + '/' + allKeys.length + ' in ' + (Date.now() - t0) + 'ms');
console.log(JSON.stringify({ pass, fail }));
process.exit(fail ? 1 : 0);
