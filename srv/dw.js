// زاد v5.0 «ديوانية زاد» — an X/Twitter-style space (posts ≤280, replies, likes, reposts, quotes, follows, #hashtags, notifications).
// Additive D1 tables sc_dw_* (CREATE IF NOT EXISTS only). Reuses the phase-2 helpers passed in from social.js:
// device hash (X-Zad-Dev + salt), sc_rate limits (W), the word filter (badWord + extraBad), the phone/link rule (phoney), sc_reports (target 'dw:<id>', 3 → hidden).
// Images: optional, one per post, stored in the existing R2 bucket VIDS under dw/<id> (same bucket as the clips).
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } });
const E = (m, s = 400, msg) => J({ ok: false, error: m, ...(msg ? { msg } : {}) }, s);
const AB = 'abcdefghijkmnpqrstuvwxyz23456789';
const rid = (n = 10) => { const b = crypto.getRandomValues(new Uint8Array(n)); let s = ''; for (const x of b) s += AB[x % AB.length]; return s; };
const PID = /^[a-z2-9]{10}$/, UID = /^[a-z2-9]{8}$/, IID = /^[a-z2-9]{12}$/;
const MAXLEN = 280, PAGE = 20, HIDE_AT = 3, IMG_MAX = 1536 * 1024;
const TXT = s => String(s == null ? '' : s).replace(/[\u0000-\u0009\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069<>]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
const len = s => [...s].length;
const tagN = t => t.replace(/[\u064b-\u0652\u0640\u0670]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
const tagsOf = s => [...new Set([...String(s).matchAll(/#([\p{L}\p{N}_]{2,30})/gu)].map(m => tagN(m[1])))].slice(0, 6);
let ok = false;
let PURGE_HOOK = null; export const setPurgeHook = f => { PURGE_HOOK = f; }; // v5.4: «احذف حسابي» also removes the account's clips (srv/zv.js)
export { schema as dwSchema };
async function schema(db) {
  if (ok) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_user (dev TEXT PRIMARY KEY, uid TEXT UNIQUE, name TEXT, bio TEXT, at INTEGER, banned INTEGER DEFAULT 0, seen_n INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_post (id TEXT PRIMARY KEY, uid TEXT, text TEXT, img TEXT, at INTEGER, reply_to TEXT, repost_of TEXT, quote_of TEXT, likes INTEGER DEFAULT 0, replies INTEGER DEFAULT 0, reposts INTEGER DEFAULT 0, reports INTEGER DEFAULT 0, hidden INTEGER DEFAULT 0, pinned INTEGER DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_post_uid ON sc_dw_post(uid, at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_post_at ON sc_dw_post(at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_post_reply ON sc_dw_post(reply_to)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_post_rep ON sc_dw_post(repost_of)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_like (pid TEXT, uid TEXT, at INTEGER, PRIMARY KEY (pid, uid))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_follow (src TEXT, dst TEXT, at INTEGER, PRIMARY KEY (src, dst))'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_follow_dst ON sc_dw_follow(dst)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_block (src TEXT, dst TEXT, at INTEGER, PRIMARY KEY (src, dst))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_tag (tag TEXT, pid TEXT, at INTEGER, PRIMARY KEY (tag, pid))'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_tag_at ON sc_dw_tag(at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_notif (to_uid TEXT, kind TEXT, from_uid TEXT, pid TEXT, at INTEGER, seen INTEGER DEFAULT 0, PRIMARY KEY (to_uid, kind, from_uid, pid))'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_dw_notif_to ON sc_dw_notif(to_uid, at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_dw_img (id TEXT PRIMARY KEY, uid TEXT, at INTEGER, size INTEGER, ctype TEXT, used INTEGER DEFAULT 0)')
  ]);
  ok = true;
}
// a post as the app sees it (p = row joined with the author; me = viewer uid)
const COLS = 'p.*, u.name uname, u.banned ubanned';
async function viewer(db, me, ids) { // liked / reposted flags for a page of posts
  if (!me || !ids.length) return { L: new Set(), R: new Set() };
  const q = ids.map(() => '?').join(',');
  const [l, r] = await Promise.all([
    db.prepare(`SELECT pid FROM sc_dw_like WHERE uid=? AND pid IN (${q})`).bind(me, ...ids).all(),
    db.prepare(`SELECT repost_of pid FROM sc_dw_post WHERE uid=? AND repost_of IN (${q})`).bind(me, ...ids).all()]);
  return { L: new Set((l.results || []).map(x => x.pid)), R: new Set((r.results || []).map(x => x.pid)) };
}
async function expand(db, rows, me, isAdmin) {
  // a repost row shows its original with «أعاد نشرها …»; quotes carry a small card of the quoted post
  const origIds = rows.filter(r => r.repost_of).map(r => r.repost_of), quoteIds = rows.map(r => r.quote_of).filter(Boolean), parentIds = rows.map(r => r.reply_to).filter(Boolean);
  const need = [...new Set([...origIds, ...quoteIds, ...parentIds])];
  const M = {};
  if (need.length) { const r = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.id IN (${need.map(() => '?').join(',')})`).bind(...need).all(); (r.results || []).forEach(x => M[x.id] = x); }
  const shown = rows.map(r => r.repost_of ? M[r.repost_of] : r).filter(Boolean);
  const { L, R } = await viewer(db, me, shown.map(x => x.id));
  const pub = (x, lite) => {
    if (!x) return null;
    const gone = (x.hidden || x.ubanned) && x.uid !== me && !isAdmin;
    if (gone) return { id: x.id, gone: 1 };
    const o = { id: x.id, u: { id: x.uid, name: x.uname || 'مستخدم' }, text: x.text || '', img: x.img || '', at: x.at, likes: x.likes || 0, replies: x.replies || 0, reposts: x.reposts || 0 };
    if (x.uid === me) o.mine = 1; if (x.hidden) o.hidden = 1; if (x.pinned) o.pinned = 1;
    if (lite) return o;
    o.liked = L.has(x.id) ? 1 : 0; o.reposted = R.has(x.id) ? 1 : 0;
    if (x.reply_to) { const pa = M[x.reply_to]; o.reply_to = { id: x.reply_to, name: pa && !(pa.hidden && pa.uid !== me) ? (pa.uname || '') : '' }; }
    if (x.quote_of) o.quote = pub(M[x.quote_of], true) || { id: x.quote_of, gone: 1 };
    return o;
  };
  const out = [];
  for (const r of rows) {
    if (r.repost_of) { const o = M[r.repost_of]; if (!o) continue; const v = pub(o); if (!v || v.gone) continue; v.rp = { id: r.uid, name: r.uname || '' }; v.key = r.id; out.push(v); }
    else { const v = pub(r); if (v && !v.gone) { v.key = r.id; out.push(v); } }
  }
  return out;
}
const NOTBLOCKED = me => me ? ` AND p.uid NOT IN (SELECT dst FROM sc_dw_block WHERE src='${me}') AND p.uid NOT IN (SELECT src FROM sc_dw_block WHERE dst='${me}')` : '';
const VISIBLE = me => ` AND COALESCE(u.banned,0)=0 AND (p.hidden=0${me ? ` OR p.uid='${me}'` : ''})`;

export async function dwApi(o) {
  const { u, req, env, ctx, deps, dev, W, bad, phoney, p, M } = o; const db = env.DB;
  await schema(db);
  const now = Date.now();
  if (p.startsWith('dw/img/') && (M === 'GET' || M === 'HEAD')) { // the image of a post
    const id = p.slice(7); if (!IID.test(id) || !env.VIDS) return new Response('Not found', { status: 404 });
    const obj = await env.VIDS.get('dw/' + id); if (!obj) return new Response('Not found', { status: 404 });
    const h = new Headers(); obj.writeHttpMetadata(h); h.set('cache-control', 'public, max-age=31536000, immutable'); h.set('x-content-type-options', 'nosniff'); h.set('access-control-allow-origin', '*');
    return new Response(M === 'HEAD' ? null : obj.body, { headers: h });
  }
  let b = {};
  if (M === 'POST' && p !== 'dw/img') { try { const t = await req.text(); if (t.length > 6000) return E('too big', 413); b = t ? JSON.parse(t) : {}; } catch (e) { return E('bad json'); } }
  const meRow = dev ? await db.prepare('SELECT * FROM sc_dw_user WHERE dev=?').bind(dev).first() : null;
  const me = meRow ? meRow.uid : null;
  const needMe = () => !dev ? E('device') : !meRow ? E('profile', 400, 'اختر اسمك أولًا') : meRow.banned ? E('banned', 403, 'تم إيقاف حسابك في الديوانية') : null;
  const blockedBy = async who => !!(await db.prepare('SELECT 1 FROM sc_dw_block WHERE (src=?1 AND dst=?2) OR (src=?2 AND dst=?1)').bind(who, me).first());
  const notif = (to, kind, pid) => to && to !== me ? db.prepare('INSERT OR REPLACE INTO sc_dw_notif (to_uid,kind,from_uid,pid,at,seen) VALUES (?,?,?,?,?,0)').bind(to, kind, me, pid || '', now) : null;
  const unnotif = (to, kind, pid) => db.prepare('DELETE FROM sc_dw_notif WHERE to_uid=? AND kind=? AND from_uid=? AND pid=?').bind(to, kind, me, pid || '');
  const unread = async () => me ? (await db.prepare('SELECT COUNT(*) n FROM sc_dw_notif WHERE to_uid=? AND seen=0').bind(me).first()).n : 0;
  const prof = r => ({ id: r.uid, name: r.name, bio: r.bio || '', at: r.at });

  if (p === 'dw/me') return J({ ok: true, me: meRow ? { ...prof(meRow), banned: !!meRow.banned } : null, unread: await unread() });
  if (p === 'dw/profile' && M === 'POST') { // create or edit my profile (display name + short bio)
    if (!dev) return E('device'); if (meRow && meRow.banned) return E('banned', 403);
    const name = TXT(b.name).replace(/\s+/g, ' ').slice(0, 30), bio = TXT(b.bio).replace(/\s+/g, ' ').slice(0, 120);
    if (len(name) < 2) return E('name', 400, 'الاسم قصير');
    if (bad(name, bio) || phoney(name) || phoney(bio)) return E('bad', 400, 'توجد كلمة أو رابط أو رقم غير مسموح به');
    if (!(await W('dwpf', 12, 864e5))) return E('rate', 429, 'حاول بعد قليل');
    if (meRow) await db.prepare('UPDATE sc_dw_user SET name=?, bio=? WHERE dev=?').bind(name, bio, dev).run();
    else await db.prepare('INSERT INTO sc_dw_user (dev,uid,name,bio,at) VALUES (?,?,?,?,?)').bind(dev, rid(8), name, bio, now).run();
    const r = await db.prepare('SELECT * FROM sc_dw_user WHERE dev=?').bind(dev).first();
    return J({ ok: true, me: prof(r) });
  }
  if (p === 'dw/img' && M === 'POST') { // raw image bytes (the app resizes to ≤1280 px JPEG first)
    const n = needMe(); if (n) return n; if (!env.VIDS) return E('no storage', 500);
    const ct = String(req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!/^image\/(jpeg|png|webp)$/.test(ct)) return E('type', 400, 'صورة فقط');
    const ln = +(req.headers.get('content-length') || 0);
    const buf = await req.arrayBuffer(); if (!buf.byteLength || buf.byteLength > IMG_MAX || (ln && ln > IMG_MAX)) return E('size', 413, 'الصورة كبيرة');
    if (!(await W('dwimg', 20, 864e5))) return E('rate', 429, 'وصلت حد الصور اليوم');
    const id = rid(12);
    await env.VIDS.put('dw/' + id, buf, { httpMetadata: { contentType: ct } });
    await db.prepare('INSERT INTO sc_dw_img (id,uid,at,size,ctype,used) VALUES (?,?,?,?,?,0)').bind(id, me, now, buf.byteLength, ct).run();
    if (Math.random() < 0.05) ctx.waitUntil(orphans(db, env, now));
    return J({ ok: true, id });
  }
  if (p === 'dw/post' && M === 'POST') { // new post, reply (reply_to) or quote (quote_of)
    const n = needMe(); if (n) return n;
    const text = TXT(b.text), img = IID.test(String(b.img || '')) ? String(b.img) : '';
    if (len(text) > MAXLEN) return E('long', 400, 'الحد ٢٨٠ حرفًا');
    if (!text && !img) return E('empty', 400, 'اكتب شيئًا');
    if (bad(text)) return E('bad', 400, 'توجد كلمة غير مسموح بها في الديوانية');
    if (phoney(text)) return E('contact', 400, 'ممنوع الروابط وأرقام الجوال والمعرّفات');
    let parent = null, quoted = null;
    if (b.reply_to) { if (!PID.test(String(b.reply_to))) return E('bad target'); parent = await db.prepare('SELECT * FROM sc_dw_post WHERE id=?').bind(b.reply_to).first(); if (!parent || parent.repost_of || (parent.hidden && parent.uid !== me)) return E('gone', 404, 'التغريدة غير موجودة'); if (await blockedBy(parent.uid)) return E('blocked', 403, 'لا يمكنك الرد'); }
    if (b.quote_of) { if (!PID.test(String(b.quote_of))) return E('bad target'); quoted = await db.prepare('SELECT * FROM sc_dw_post WHERE id=?').bind(b.quote_of).first(); if (!quoted || quoted.repost_of || quoted.hidden) return E('gone', 404, 'التغريدة غير موجودة'); if (await blockedBy(quoted.uid)) return E('blocked', 403, 'لا يمكنك الاقتباس'); }
    if (!(await W('dwp', 8, 6e5)) || !(await W('dwpd', 80, 864e5))) return E('rate', 429, 'تمهّل قليلًا قبل النشر مرة أخرى');
    if (img) { const im = await db.prepare('SELECT * FROM sc_dw_img WHERE id=?').bind(img).first(); if (!im || im.uid !== me || im.used) return E('img', 400, 'الصورة غير صالحة'); }
    const id = rid(10), st = [db.prepare('INSERT INTO sc_dw_post (id,uid,text,img,at,reply_to,quote_of) VALUES (?,?,?,?,?,?,?)').bind(id, me, text, img || null, now, parent ? parent.id : null, quoted ? quoted.id : null)];
    if (img) st.push(db.prepare('UPDATE sc_dw_img SET used=1 WHERE id=?').bind(img));
    tagsOf(text).forEach(t => st.push(db.prepare('INSERT OR IGNORE INTO sc_dw_tag (tag,pid,at) VALUES (?,?,?)').bind(t, id, now)));
    if (parent) { st.push(db.prepare('UPDATE sc_dw_post SET replies=replies+1 WHERE id=?').bind(parent.id)); const nn = notif(parent.uid, 'reply', id); nn && st.push(nn); }
    if (quoted) { st.push(db.prepare('UPDATE sc_dw_post SET reposts=reposts+1 WHERE id=?').bind(quoted.id)); const nn = notif(quoted.uid, 'quote', id); nn && st.push(nn); }
    await db.batch(st);
    const row = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.id=?`).bind(id).first();
    return J({ ok: true, post: (await expand(db, [row], me))[0] });
  }
  if (p === 'dw/like' && M === 'POST') {
    const n = needMe(); if (n) return n; const id = String(b.id || ''); if (!PID.test(id)) return E('bad target');
    const x = await db.prepare('SELECT * FROM sc_dw_post WHERE id=?').bind(id).first(); if (!x || x.repost_of || (x.hidden && x.uid !== me)) return E('gone', 404);
    if (await blockedBy(x.uid)) return E('blocked', 403);
    if (!(await W('dwl', 240, 36e5))) return E('rate', 429);
    const has = await db.prepare('SELECT 1 FROM sc_dw_like WHERE pid=? AND uid=?').bind(id, me).first();
    if (has) await db.batch([db.prepare('DELETE FROM sc_dw_like WHERE pid=? AND uid=?').bind(id, me), db.prepare('UPDATE sc_dw_post SET likes=MAX(0,likes-1) WHERE id=?').bind(id), unnotif(x.uid, 'like', id)]);
    else { const st = [db.prepare('INSERT OR IGNORE INTO sc_dw_like (pid,uid,at) VALUES (?,?,?)').bind(id, me, now), db.prepare('UPDATE sc_dw_post SET likes=likes+1 WHERE id=?').bind(id)]; const nn = notif(x.uid, 'like', id); nn && st.push(nn); await db.batch(st); }
    const c = await db.prepare('SELECT likes FROM sc_dw_post WHERE id=?').bind(id).first();
    return J({ ok: true, liked: !has, likes: c.likes });
  }
  if (p === 'dw/repost' && M === 'POST') { // toggle a plain repost
    const n = needMe(); if (n) return n; const id = String(b.id || ''); if (!PID.test(id)) return E('bad target');
    const x = await db.prepare('SELECT * FROM sc_dw_post WHERE id=?').bind(id).first(); if (!x || x.repost_of || x.hidden) return E('gone', 404);
    if (await blockedBy(x.uid)) return E('blocked', 403);
    if (!(await W('dwr', 120, 36e5))) return E('rate', 429);
    const has = await db.prepare('SELECT id FROM sc_dw_post WHERE uid=? AND repost_of=?').bind(me, id).first();
    if (has) await db.batch([db.prepare('DELETE FROM sc_dw_post WHERE id=?').bind(has.id), db.prepare('UPDATE sc_dw_post SET reposts=MAX(0,reposts-1) WHERE id=?').bind(id), unnotif(x.uid, 'repost', id)]);
    else { const st = [db.prepare('INSERT INTO sc_dw_post (id,uid,text,at,repost_of) VALUES (?,?,?,?,?)').bind(rid(10), me, '', now, id), db.prepare('UPDATE sc_dw_post SET reposts=reposts+1 WHERE id=?').bind(id)]; const nn = notif(x.uid, 'repost', id); nn && st.push(nn); await db.batch(st); }
    const c = await db.prepare('SELECT reposts FROM sc_dw_post WHERE id=?').bind(id).first();
    return J({ ok: true, reposted: !has, reposts: c.reposts });
  }
  if (p === 'dw/delete' && M === 'POST') { // the author deletes their own post
    const n = needMe(); if (n) return n; const id = String(b.id || ''); if (!PID.test(id)) return E('bad target');
    const x = await db.prepare('SELECT * FROM sc_dw_post WHERE id=?').bind(id).first(); if (!x) return E('gone', 404); if (x.uid !== me) return E('forbidden', 403);
    await delPosts(db, env, [x]); return J({ ok: true, deleted: id });
  }
  if ((p === 'dw/follow' || p === 'dw/block') && M === 'POST') {
    const n = needMe(); if (n) return n; const who = String(b.u || ''); if (!UID.test(who) || who === me) return E('bad user');
    const t = await db.prepare('SELECT uid FROM sc_dw_user WHERE uid=?').bind(who).first(); if (!t) return E('gone', 404);
    if (!(await W('dwf', 120, 36e5))) return E('rate', 429);
    if (p === 'dw/follow') {
      if (await blockedBy(who)) return E('blocked', 403, 'لا يمكن المتابعة');
      const has = await db.prepare('SELECT 1 FROM sc_dw_follow WHERE src=? AND dst=?').bind(me, who).first();
      if (has) await db.batch([db.prepare('DELETE FROM sc_dw_follow WHERE src=? AND dst=?').bind(me, who), unnotif(who, 'follow', '')]);
      else await db.batch([db.prepare('INSERT OR IGNORE INTO sc_dw_follow (src,dst,at) VALUES (?,?,?)').bind(me, who, now), notif(who, 'follow', '')]);
      return J({ ok: true, ...(await counts(db, who)), following: !has });
    }
    const has = await db.prepare('SELECT 1 FROM sc_dw_block WHERE src=? AND dst=?').bind(me, who).first();
    if (has) await db.prepare('DELETE FROM sc_dw_block WHERE src=? AND dst=?').bind(me, who).run();
    else await db.batch([db.prepare('INSERT OR IGNORE INTO sc_dw_block (src,dst,at) VALUES (?,?,?)').bind(me, who, now), db.prepare('DELETE FROM sc_dw_follow WHERE (src=?1 AND dst=?2) OR (src=?2 AND dst=?1)').bind(me, who), db.prepare('DELETE FROM sc_dw_notif WHERE (to_uid=?1 AND from_uid=?2) OR (to_uid=?2 AND from_uid=?1)').bind(me, who)]);
    return J({ ok: true, blocked: !has });
  }
  if (p === 'dw/report' && M === 'POST') { // «إبلاغ»: 3 different devices → hidden until the admin looks (sc_reports, target dw:<id>)
    if (!dev) return E('device'); const id = String(b.id || ''); if (!PID.test(id)) return E('bad target');
    const x = await db.prepare('SELECT id,uid FROM sc_dw_post WHERE id=?').bind(id).first(); if (!x) return E('gone', 404);
    if (me && x.uid === me) return E('own', 400);
    if (!(await W('rp', 30, 864e5))) return E('rate', 429);
    const ins = await db.prepare('INSERT OR IGNORE INTO sc_reports (target,dev,at,reason) VALUES (?,?,?,?)').bind('dw:' + id, dev, now, TXT(b.reason).slice(0, 60)).run();
    if (ins.meta.changes) await db.prepare(`UPDATE sc_dw_post SET reports=reports+1, hidden=CASE WHEN reports+1>=${HIDE_AT} THEN 1 ELSE hidden END WHERE id=?`).bind(id).run();
    const r = await db.prepare('SELECT reports,hidden FROM sc_dw_post WHERE id=?').bind(id).first();
    return J({ ok: true, hidden: !!r.hidden });
  }
  if (p === 'dw/deleteme' && M === 'POST') { // «احذف حسابي»: everything of mine leaves the ديوانية
    if (!meRow) return J({ ok: true, deleted: 0 });
    await purgeUser(db, env, meRow); return J({ ok: true, deleted: 1 });
  }
  if (p === 'dw/notifs') {
    if (!me) return J({ ok: true, items: [], unread: 0 });
    const r = await db.prepare(`SELECT n.kind,n.from_uid,n.pid,n.at,n.seen,u.name FROM sc_dw_notif n LEFT JOIN sc_dw_user u ON u.uid=n.from_uid WHERE n.to_uid=? AND COALESCE(u.banned,0)=0 ORDER BY n.at DESC LIMIT 60`).bind(me).all();
    const items = r.results || [];
    const pids = [...new Set(items.map(x => x.pid).filter(Boolean))]; const T = {};
    if (pids.length) { const t = await db.prepare(`SELECT id,text,reply_to FROM sc_dw_post WHERE id IN (${pids.map(() => '?').join(',')})`).bind(...pids).all(); (t.results || []).forEach(x => T[x.id] = x); }
    const vids = [...new Set(pids.filter(x => x.startsWith('v:')).map(x => x.split(':')[1]))]; // v5.4 «مقاطع زاد» notifications carry 'v:<clip>[:<comment>]'
    if (vids.length) { try { const t = await db.prepare(`SELECT id,title,caption FROM vid_videos WHERE id IN (${vids.map(() => '?').join(',')})`).bind(...vids).all(); const VT = {}; (t.results || []).forEach(x => VT[x.id] = x.caption || x.title || ''); pids.filter(x => x.startsWith('v:')).forEach(x => { const k = x.split(':')[1]; if (VT[k] != null) T[x] = { text: VT[k] }; }); } catch (e) { } }
    if (u.searchParams.get('seen') !== '0') await db.prepare('UPDATE sc_dw_notif SET seen=1 WHERE to_uid=? AND seen=0').bind(me).run();
    return J({ ok: true, items: items.map(x => ({ k: x.kind, u: { id: x.from_uid, name: x.name || 'مستخدم' }, pid: x.pid || '', t: T[x.pid] ? String(T[x.pid].text || '').slice(0, 80) : '', at: x.at, new: !x.seen })) });
  }
  // ---- reading ----
  const c = Math.max(0, Math.floor(+u.searchParams.get('c') || 0));
  if (p === 'dw/feed') {
    const f = u.searchParams.get('f') === 'fol' ? 'fol' : 'for';
    let rows, next = null, pinned = [];
    if (f === 'for') { // «لك»: top-level posts of the last 14 days, recent and popular (each like/reply ≈ 1 h fresher, a repost/quote ≈ 2 h, capped at 2 days)
      const since = now - 14 * 864e5;
      const r = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.reply_to IS NULL AND p.repost_of IS NULL AND p.at>? AND p.pinned=0${VISIBLE(me)}${NOTBLOCKED(me)} ORDER BY (p.at + MIN(p.likes + p.replies + 2*p.reposts, 48)*3600000) DESC LIMIT ? OFFSET ?`).bind(since, PAGE + 1, c).all();
      rows = r.results || []; if (rows.length > PAGE) { rows = rows.slice(0, PAGE); next = c + PAGE; }
      if (!c) { const pr = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.pinned>0 AND p.hidden=0 ORDER BY p.pinned DESC LIMIT 3`).all(); pinned = await expand(db, pr.results || [], me); }
      if (!rows.length && !c) { // a young ديوانية: fall back to everything recent
        const r2 = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.reply_to IS NULL AND p.repost_of IS NULL AND p.pinned=0${VISIBLE(me)}${NOTBLOCKED(me)} ORDER BY p.at DESC LIMIT ?`).bind(PAGE).all(); rows = r2.results || []; }
    } else { // «المتابَعون»: posts, quotes and reposts by the people I follow (and mine), newest first
      if (!me) return J({ ok: true, items: [], next: null, need: 'profile' });
      const before = c || now + 1;
      const r = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.reply_to IS NULL AND (p.uid=?1 OR p.uid IN (SELECT dst FROM sc_dw_follow WHERE src=?1)) AND p.at<?2${VISIBLE(me)}${NOTBLOCKED(me)} ORDER BY p.at DESC LIMIT ?3`).bind(me, before, PAGE + 1).all();
      rows = r.results || []; if (rows.length > PAGE) { rows = rows.slice(0, PAGE); next = rows[rows.length - 1].at; }
    }
    return J({ ok: true, f, pinned, items: await expand(db, rows, me), next, unread: await unread() });
  }
  if (p === 'dw/post') { // a post, its parents (up to 6) and its direct replies
    const id = u.searchParams.get('id') || ''; if (!PID.test(id)) return E('bad target');
    const one = async i => db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.id=?`).bind(i).first();
    const x = await one(id); if (!x || x.repost_of) return E('gone', 404, 'التغريدة غير موجودة');
    if ((x.hidden || x.ubanned) && x.uid !== me) return E('hidden', 410, 'أُخفيت هذه التغريدة بسبب البلاغات');
    if (me && x.uid !== me && await blockedBy(x.uid)) return E('blocked', 403, 'لا يمكنك عرض هذه التغريدة');
    const anc = []; let cur = x; for (let i = 0; i < 6 && cur.reply_to; i++) { const pa = await one(cur.reply_to); if (!pa) break; anc.unshift(pa); cur = pa; }
    const r = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.reply_to=?${VISIBLE(me)}${NOTBLOCKED(me)} ORDER BY (p.uid=?) DESC, p.likes DESC, p.at ASC LIMIT 80`).bind(id, x.uid).all();
    const [post] = await expand(db, [x], me);
    return J({ ok: true, post, parents: await expand(db, anc, me), replies: await expand(db, r.results || [], me) });
  }
  if (p === 'dw/user') { // profile page: counts, follow state and posts (with reposts) or replies
    const who = u.searchParams.get('u') || ''; if (!UID.test(who)) return E('bad user');
    const t = await db.prepare('SELECT * FROM sc_dw_user WHERE uid=?').bind(who).first(); if (!t) return E('gone', 404, 'الحساب غير موجود');
    if (t.banned && who !== me) return E('banned', 410, 'هذا الحساب موقوف');
    const iBlocked = me ? !!(await db.prepare('SELECT 1 FROM sc_dw_block WHERE src=? AND dst=?').bind(me, who).first()) : false;
    const blockedMe = me ? !!(await db.prepare('SELECT 1 FROM sc_dw_block WHERE src=? AND dst=?').bind(who, me).first()) : false;
    const following = me ? !!(await db.prepare('SELECT 1 FROM sc_dw_follow WHERE src=? AND dst=?').bind(me, who).first()) : false;
    const followsMe = me ? !!(await db.prepare('SELECT 1 FROM sc_dw_follow WHERE src=? AND dst=?').bind(who, me).first()) : false;
    const cn = await counts(db, who);
    const user = { ...prof(t), followers: cn.followers, followingN: cn.following, posts: cn.posts, following, followsMe, blocked: iBlocked, me: who === me };
    if (iBlocked || blockedMe) return J({ ok: true, user, items: [], next: null });
    const tab = u.searchParams.get('t') === 'r' ? 'r' : 'p', before = c || now + 1;
    const r = await db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.uid=? AND p.reply_to IS ${tab === 'r' ? 'NOT ' : ''}NULL AND p.at<?${who === me ? '' : ' AND p.hidden=0'} ORDER BY p.at DESC LIMIT ?`).bind(who, before, PAGE + 1).all();
    let rows = r.results || [], next = null; if (rows.length > PAGE) { rows = rows.slice(0, PAGE); next = rows[rows.length - 1].at; }
    return J({ ok: true, user, items: await expand(db, rows, me), next });
  }
  if (p === 'dw/follows') { // lists: followers / following of a user
    const who = u.searchParams.get('u') || ''; if (!UID.test(who)) return E('bad user');
    const k = u.searchParams.get('k') === 'ing' ? 'ing' : 'ers';
    const r = await db.prepare(k === 'ing' ? 'SELECT u.uid,u.name,u.bio FROM sc_dw_follow f JOIN sc_dw_user u ON u.uid=f.dst WHERE f.src=? AND u.banned=0 ORDER BY f.at DESC LIMIT 200' : 'SELECT u.uid,u.name,u.bio FROM sc_dw_follow f JOIN sc_dw_user u ON u.uid=f.src WHERE f.dst=? AND u.banned=0 ORDER BY f.at DESC LIMIT 200').bind(who).all();
    return J({ ok: true, items: (r.results || []).map(x => ({ id: x.uid, name: x.name, bio: x.bio || '' })) });
  }
  if (p === 'dw/tag') {
    const t = tagN(String(u.searchParams.get('t') || '').replace(/^#/, '')).slice(0, 30); if (t.length < 2) return E('bad tag');
    const before = c || now + 1;
    const r = await db.prepare(`SELECT ${COLS} FROM sc_dw_tag g JOIN sc_dw_post p ON p.id=g.pid LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE g.tag=? AND p.at<?${VISIBLE(me)}${NOTBLOCKED(me)} ORDER BY p.at DESC LIMIT ?`).bind(t, before, PAGE + 1).all();
    let rows = r.results || [], next = null; if (rows.length > PAGE) { rows = rows.slice(0, PAGE); next = rows[rows.length - 1].at; }
    return J({ ok: true, tag: t, items: await expand(db, rows, me), next });
  }
  if (p === 'dw/trends') { // the most used #hashtags of the last 7 days
    const r = await db.prepare('SELECT g.tag, COUNT(*) n FROM sc_dw_tag g JOIN sc_dw_post p ON p.id=g.pid WHERE g.at>? AND p.hidden=0 GROUP BY g.tag ORDER BY n DESC, MAX(g.at) DESC LIMIT 10').bind(now - 7 * 864e5).all();
    return J({ ok: true, items: r.results || [] });
  }
  if (p === 'dw/search') { // people by name, posts by words
    const q = TXT(u.searchParams.get('q')).slice(0, 40); if (len(q) < 2) return J({ ok: true, users: [], items: [] });
    const like = '%' + q.replace(/[%_]/g, '') + '%';
    const [us, ps] = await Promise.all([
      db.prepare('SELECT uid,name,bio FROM sc_dw_user WHERE banned=0 AND name LIKE ? LIMIT 10').bind(like).all(),
      db.prepare(`SELECT ${COLS} FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.repost_of IS NULL AND p.text LIKE ?${VISIBLE(me)}${NOTBLOCKED(me)} ORDER BY p.at DESC LIMIT 30`).bind(like).all()]);
    return J({ ok: true, users: (us.results || []).map(x => ({ id: x.uid, name: x.name, bio: x.bio || '' })), items: await expand(db, ps.results || [], me) });
  }
  return E('not found', 404);
}
async function counts(db, who) {
  const r = await db.prepare('SELECT (SELECT COUNT(*) FROM sc_dw_follow WHERE dst=?1) followers, (SELECT COUNT(*) FROM sc_dw_follow WHERE src=?1) following, (SELECT COUNT(*) FROM sc_dw_post WHERE uid=?1 AND repost_of IS NULL) posts').bind(who).first();
  return { followers: r.followers, following: r.following, posts: r.posts };
}
// delete posts with everything hanging on them (likes, tags, notifications, reposts of them, reports, image); replies stay and show «تغريدة محذوفة»
async function delPosts(db, env, rows) {
  const st = [];
  for (const x of rows) {
    const id = x.id;
    if (x.repost_of) { st.push(db.prepare('UPDATE sc_dw_post SET reposts=MAX(0,reposts-1) WHERE id=?').bind(x.repost_of)); st.push(db.prepare("DELETE FROM sc_dw_notif WHERE kind='repost' AND from_uid=? AND pid=?").bind(x.uid, x.repost_of)); }
    if (x.reply_to) st.push(db.prepare('UPDATE sc_dw_post SET replies=MAX(0,replies-1) WHERE id=?').bind(x.reply_to));
    if (x.quote_of) st.push(db.prepare('UPDATE sc_dw_post SET reposts=MAX(0,reposts-1) WHERE id=?').bind(x.quote_of));
    st.push(db.prepare('DELETE FROM sc_dw_like WHERE pid=?').bind(id), db.prepare('DELETE FROM sc_dw_tag WHERE pid=?').bind(id), db.prepare('DELETE FROM sc_dw_notif WHERE pid=?').bind(id),
      db.prepare("DELETE FROM sc_dw_notif WHERE kind='repost' AND pid IN (SELECT repost_of FROM sc_dw_post WHERE repost_of=?)").bind(id),
      db.prepare('DELETE FROM sc_dw_post WHERE repost_of=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('dw:' + id), db.prepare('DELETE FROM sc_dw_post WHERE id=?').bind(id));
    if (x.img) { st.push(db.prepare('DELETE FROM sc_dw_img WHERE id=?').bind(x.img)); try { if (env.VIDS) await env.VIDS.delete('dw/' + x.img); } catch (e) { } }
  }
  for (let i = 0; i < st.length; i += 80) await db.batch(st.slice(i, i + 80));
}
async function purgeUser(db, env, row) { // a whole account: posts, likes (with their counts), follows, blocks, notifications, images, the reports it made
  const uid = row.uid;
  if (PURGE_HOOK) { try { await PURGE_HOOK(db, env, row); } catch (e) { } }
  const posts = (await db.prepare('SELECT * FROM sc_dw_post WHERE uid=? ORDER BY repost_of IS NULL').bind(uid).all()).results || [];
  await delPosts(db, env, posts);
  const imgs = (await db.prepare('SELECT id FROM sc_dw_img WHERE uid=?').bind(uid).all()).results || [];
  for (const i of imgs) { try { if (env.VIDS) await env.VIDS.delete('dw/' + i.id); } catch (e) { } }
  await db.batch([
    db.prepare('UPDATE sc_dw_post SET likes=MAX(0,likes-1) WHERE id IN (SELECT pid FROM sc_dw_like WHERE uid=?)').bind(uid),
    db.prepare('DELETE FROM sc_dw_like WHERE uid=?').bind(uid),
    db.prepare('DELETE FROM sc_dw_follow WHERE src=?1 OR dst=?1').bind(uid),
    db.prepare('DELETE FROM sc_dw_block WHERE src=?1 OR dst=?1').bind(uid),
    db.prepare('DELETE FROM sc_dw_notif WHERE to_uid=?1 OR from_uid=?1').bind(uid),
    db.prepare('DELETE FROM sc_dw_img WHERE uid=?').bind(uid),
    db.prepare("UPDATE sc_dw_post SET reports=MAX(0,reports-1) WHERE id IN (SELECT substr(target,4) FROM sc_reports WHERE dev=? AND target LIKE 'dw:%')").bind(row.dev),
    db.prepare("DELETE FROM sc_reports WHERE dev=? AND target LIKE 'dw:%'").bind(row.dev),
    db.prepare('DELETE FROM sc_dw_user WHERE uid=?').bind(uid)]);
}
async function orphans(db, env, now) { // images uploaded but never attached to a post (older than a day)
  try { const r = await db.prepare('SELECT id FROM sc_dw_img WHERE used=0 AND at<? LIMIT 20').bind(now - 864e5).all(); for (const x of r.results || []) { try { await env.VIDS.delete('dw/' + x.id); } catch (e) { } await db.prepare('DELETE FROM sc_dw_img WHERE id=?').bind(x.id).run(); } } catch (e) { }
}
// ---- admin («الديوانية» tab in /admin/social): list, delete / hide / unhide / pin / unpin a post, ban / unban / purge a user ----
export async function dwAdmin(o) {
  const { env, p, b, M } = o; const db = env.DB; await schema(db); const now = Date.now();
  if (p === 'admin/dw') {
    const q = (s, ...a) => db.prepare(s).bind(...a).all().then(r => r.results || []);
    const posts = await q(`SELECT p.id,p.uid,p.text,p.img,p.at,p.reply_to,p.quote_of,p.likes,p.replies,p.reposts,p.reports,p.hidden,p.pinned,u.name,u.banned FROM sc_dw_post p LEFT JOIN sc_dw_user u ON u.uid=p.uid WHERE p.repost_of IS NULL ORDER BY (p.pinned>0) DESC, (p.reports>0 OR p.hidden=1) DESC, p.at DESC LIMIT 300`);
    const users = await q('SELECT u.uid,u.name,u.bio,u.at,u.banned,(SELECT COUNT(*) FROM sc_dw_post p WHERE p.uid=u.uid AND p.repost_of IS NULL) posts,(SELECT COALESCE(SUM(reports),0) FROM sc_dw_post p WHERE p.uid=u.uid) reports FROM sc_dw_user u ORDER BY u.banned DESC, reports DESC, u.at DESC LIMIT 300');
    const st = await db.prepare("SELECT (SELECT COUNT(*) FROM sc_dw_user) users,(SELECT COUNT(*) FROM sc_dw_post WHERE repost_of IS NULL) posts,(SELECT COUNT(*) FROM sc_dw_post WHERE repost_of IS NOT NULL) reposts,(SELECT COUNT(*) FROM sc_dw_like) likes,(SELECT COUNT(*) FROM sc_dw_follow) follows,(SELECT COUNT(*) FROM sc_dw_block) blocks,(SELECT COUNT(*) FROM sc_dw_notif) notifs,(SELECT COUNT(*) FROM sc_dw_tag) tags,(SELECT COUNT(*) FROM sc_dw_img) imgs,(SELECT COUNT(*) FROM sc_reports WHERE target LIKE 'dw:%') reports,(SELECT COUNT(*) FROM sc_ref) refs").first();
    return J({ ok: true, now, posts, users, stats: st });
  }
  if (M !== 'POST') return E('POST only', 405);
  if (p === 'admin/dwpost') {
    const id = String(b.id || ''); if (!PID.test(id)) return E('bad id');
    const x = await db.prepare('SELECT * FROM sc_dw_post WHERE id=?').bind(id).first(); if (!x) return E('gone', 404);
    if (b.op === 'delete') await delPosts(db, env, [x]);
    else if (b.op === 'hide') await db.prepare('UPDATE sc_dw_post SET hidden=1 WHERE id=?').bind(id).run();
    else if (b.op === 'unhide') await db.batch([db.prepare('UPDATE sc_dw_post SET hidden=0, reports=0 WHERE id=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('dw:' + id)]);
    else if (b.op === 'pin') await db.prepare('UPDATE sc_dw_post SET pinned=? WHERE id=?').bind(now, id).run();
    else if (b.op === 'unpin') await db.prepare('UPDATE sc_dw_post SET pinned=0 WHERE id=?').bind(id).run();
    else return E('bad op');
    return J({ ok: true, op: b.op, id });
  }
  if (p === 'admin/dwuser') {
    const uid = String(b.uid || ''); if (!UID.test(uid)) return E('bad uid');
    const r = await db.prepare('SELECT * FROM sc_dw_user WHERE uid=?').bind(uid).first(); if (!r) return E('gone', 404);
    if (b.op === 'ban') await db.prepare('UPDATE sc_dw_user SET banned=1 WHERE uid=?').bind(uid).run();
    else if (b.op === 'unban') await db.prepare('UPDATE sc_dw_user SET banned=0 WHERE uid=?').bind(uid).run();
    else if (b.op === 'purge') await purgeUser(db, env, r);
    else return E('bad op');
    return J({ ok: true, op: b.op, uid });
  }
  return E('not found', 404);
}
