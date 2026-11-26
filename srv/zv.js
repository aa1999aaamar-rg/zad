// زاد v5.4 «مقاطع زاد» — TikTok-style clips on the Diwaniya identity (one profile per person across the app, no second account system).
// Routed from srv/social.js at /api/social/vx/* (same device hash, sc_rate limits, word filter and phone/link rule as the Diwaniya).
// Clips, likes, comments and reports stay in the v4.2 vid_* tables (srv/videos.js); R2 objects stay v/<id>, p/<id>.
// D1, additive only: new columns on vid_videos / vid_comments (PRAGMA check → ALTER TABLE ADD COLUMN) and new tables zv_*.
// Notifications reuse sc_dw_notif (kinds vlike, vcmt, vrpl, vcl, vmen, vcmen, vrep; pid 'v:<clip>'), follows/blocks reuse sc_dw_follow / sc_dw_block.
import { vidSchema, vidDevHash, vidRate, vidDelete, badWord as vBad, VID_LIMITS } from './videos.js';
import { dwSchema, setPurgeHook } from './dw.js';
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const E = (m, s = 400, msg) => J({ ok: false, error: m, ...(msg ? { msg } : {}) }, s);
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const rnd = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const AB = 'abcdefghijkmnpqrstuvwxyz23456789';
const rid = (n = 10) => { const b = crypto.getRandomValues(new Uint8Array(n)); let s = ''; for (const x of b) s += AB[x % AB.length]; return s; };
const UID = /^[a-z2-9]{8}$/, VID = /^[a-f0-9]{16}$/, HANDLE = /^[a-z][a-z0-9_.]{2,19}$/;
const OFF_UID = 'zadammar', OFF_HANDLE = 'ammar', OFF_SER = 'off';
const RESERVED = new Set(['ammar', 'amar', 'zad', 'admin', 'official', 'support', 'tab', 'zadapp', 'moderator', 'mod', 'help', 'api', 'explore', 'videos', 'video', 'tag', 'settings', 'me', 'root', 'system', 'null', 'undefined']);
const TXT = s => String(s == null ? '' : s).replace(/[\u0000-\u0009\u000b-\u001f\u007f\u202a-\u202e\u2066-\u2069<>]/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
const len = s => [...s].length;
const tagN = t => t.replace(/[\u064b-\u0652\u0640\u0670]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').toLowerCase();
const tagsOf = s => [...new Set([...String(s).matchAll(/#([\p{L}\p{N}_]{2,30})/gu)].map(m => tagN(m[1])))].slice(0, 8);
const mentionsOf = s => [...new Set([...String(s).matchAll(/@([a-z][a-z0-9_.]{2,19})/gi)].map(m => m[1].toLowerCase()))].slice(0, 5);
const LINK = /https?:\/\/|www\.|\.(com|net|org|sa|me|io|ly)\b/i;
const day = t => new Date(t + 3 * 3600e3).toISOString().slice(0, 10); // Riyadh day for the views dedup and the charts
const PAGE = 12, GRID = 18;
let ready = false;
async function addCols(db, table, cols) {
  const ti = await db.prepare(`PRAGMA table_info(${table})`).all();
  const have = new Set((ti.results || []).map(c => c.name));
  for (const [n, d] of cols) if (!have.has(n)) { try { await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${n} ${d}`).run(); } catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; } }
}
async function schema(db) {
  if (ready) return;
  await vidSchema(db); await dwSchema(db);
  await addCols(db, 'vid_videos', [['uid', 'TEXT'], ['caption', 'TEXT'], ['views', 'INTEGER DEFAULT 0'], ['saves', 'INTEGER DEFAULT 0'], ['shares', 'INTEGER DEFAULT 0'], ['cmt', 'TEXT'], ['trim_s', 'REAL'], ['trim_e', 'REAL'], ['fx', 'TEXT'], ['reply_to', 'TEXT'], ['series', 'TEXT'], ['dl', 'INTEGER DEFAULT 1'], ['pub_at', 'INTEGER'], ['notified', 'INTEGER DEFAULT 0']]);
  await addCols(db, 'vid_comments', [['uid', 'TEXT'], ['parent', 'TEXT'], ['likes', 'INTEGER DEFAULT 0'], ['pinned', 'INTEGER DEFAULT 0']]);
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS zv_prof (uid TEXT PRIMARY KEY, handle TEXT UNIQUE, pat INTEGER DEFAULT 0, pins TEXT, verified INTEGER DEFAULT 0, likes_pub INTEGER DEFAULT 0, push INTEGER DEFAULT 1, vdev TEXT, at INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_view (vid TEXT, dk TEXT, day TEXT, at INTEGER, PRIMARY KEY (vid, dk, day))'),
    db.prepare('CREATE INDEX IF NOT EXISTS zv_view_day ON zv_view(vid, day)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_save (dev TEXT, vid TEXT, k TEXT, at INTEGER, PRIMARY KEY (dev, vid, k))'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_hide (dev TEXT, vid TEXT, at INTEGER, PRIMARY KEY (dev, vid))'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_cml (cid TEXT, uid TEXT, at INTEGER, PRIMARY KEY (cid, uid))'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_tag (tag TEXT, vid TEXT, at INTEGER, PRIMARY KEY (tag, vid))'),
    db.prepare('CREATE INDEX IF NOT EXISTS zv_tag_at ON zv_tag(at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_series (id TEXT PRIMARY KEY, uid TEXT, title TEXT, at INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zv_push (dev TEXT PRIMARY KEY, sub TEXT, at INTEGER)'),
    db.prepare('CREATE INDEX IF NOT EXISTS vid_videos_uid ON vid_videos(uid, approved_at)'),
    db.prepare('CREATE INDEX IF NOT EXISTS vid_comments_parent ON vid_comments(parent)'),
    // the verified account «عمار»: the official «حلقات عمار» episodes belong to it (dev 'official' is not a device hash, so no phone can sign in as it)
    db.prepare("INSERT OR IGNORE INTO sc_dw_user (dev,uid,name,bio,at) VALUES ('official',?,'عمار','الحلقات الرسمية لقناة عمار · مقطع يومي إن شاء الله',?)").bind(OFF_UID, Date.now()),
    db.prepare('INSERT OR IGNORE INTO zv_prof (uid,handle,verified,at) VALUES (?,?,1,?)').bind(OFF_UID, OFF_HANDLE, Date.now()),
    db.prepare("UPDATE vid_videos SET uid=? WHERE COALESCE(official,0)=1 AND uid IS NULL").bind(OFF_UID)
  ]);
  ready = true;
}
async function rlim(db, k, lim, win) { // the same fixed window as social.js (sc_rate)
  const now = Date.now();
  const r = await db.prepare('INSERT INTO sc_rate(k,n,reset) VALUES(?1,1,?2) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN reset>?3 THEN n+1 ELSE 1 END, reset=CASE WHEN reset>?3 THEN reset ELSE ?2 END RETURNING n').bind(k, now + win, now).first();
  return !r || r.n <= lim;
}
const parse = s => { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } };
const SEL = 'SELECT v.*, u.name un, u.banned ub, p.handle ph, p.pat pp, p.verified pv FROM vid_videos v LEFT JOIN sc_dw_user u ON u.uid=v.uid LEFT JOIN zv_prof p ON p.uid=v.uid';
const PUB = now => ` v.status='approved' AND v.hidden=0 AND v.expires_at>${now} AND v.approved_at<=${now} AND COALESCE(u.banned,0)=0 `;
const NOBLOCK = me => me ? ` AND COALESCE(v.uid,'') NOT IN (SELECT dst FROM sc_dw_block WHERE src='${me}') AND COALESCE(v.uid,'') NOT IN (SELECT src FROM sc_dw_block WHERE dst='${me}') ` : '';
const NOHIDE = dev => dev ? ` AND v.id NOT IN (SELECT vid FROM zv_hide WHERE dev='${dev}') ` : '';
const uOf = (uid, name, handle, pat, ver) => uid ? { id: uid, h: handle || uid, name: name || 'مستخدم', pat: pat || 0, ver: ver ? 1 : 0 } : { id: '', h: '', name: name || 'مستخدم', pat: 0, ver: 0, legacy: 1 };
function pubV(r, now) {
  const o = { id: r.id, t: r.title || '', cap: r.caption || '', at: r.approved_at, exp: r.expires_at, dur: r.dur, w: r.w, h: r.h, sz: r.size || 0, poster: !!r.poster,
    likes: r.likes || 0, comments: r.comments || 0, views: r.views || 0, saves: r.saves || 0, u: uOf(r.uid, r.un || r.name, r.ph, r.pp, r.pv), cmt: r.cmt || 'all', dl: r.dl === 0 ? 0 : 1 };
  if (r.official) o.off = 1;
  if (r.trim_s != null || r.trim_e != null) { o.ts = r.trim_s || 0; if (r.trim_e) o.te = r.trim_e; }
  const fx = parse(r.fx); if (fx) o.fx = fx;
  if (r.reply_to) o.rt = { id: r.reply_to };
  if (r.series) o.ser = { id: r.series };
  else if (r.official) o.ser = { id: OFF_SER, t: 'حلقات عمار' };
  if (now && r.approved_at > now) o.sched = r.approved_at;
  if (r.hidden) o.hidden = 1;
  return o;
}
async function decorate(db, items, me, dev, vdev) {
  if (!items.length) return items;
  const ids = items.map(x => x.id), q = ids.map(() => '?').join(',');
  const uids = [...new Set(items.map(x => x.u.id).filter(Boolean))];
  const rts = [...new Set(items.filter(x => x.rt).map(x => x.rt.id))], sers = [...new Set(items.filter(x => x.ser && x.ser.id !== OFF_SER).map(x => x.ser.id))];
  const [L, Sv, F, R, Se] = await Promise.all([
    vdev ? db.prepare(`SELECT vid FROM vid_likes WHERE dev=? AND vid IN (${q})`).bind(vdev, ...ids).all() : null,
    dev ? db.prepare(`SELECT vid,k FROM zv_save WHERE dev=? AND vid IN (${q})`).bind(dev, ...ids).all() : null,
    me && uids.length ? db.prepare(`SELECT dst FROM sc_dw_follow WHERE src=? AND dst IN (${uids.map(() => '?').join(',')})`).bind(me, ...uids).all() : null,
    rts.length ? db.prepare(`SELECT v.id, v.uid, u.name un, p.handle ph FROM vid_videos v LEFT JOIN sc_dw_user u ON u.uid=v.uid LEFT JOIN zv_prof p ON p.uid=v.uid WHERE v.id IN (${rts.map(() => '?').join(',')})`).bind(...rts).all() : null,
    sers.length ? db.prepare(`SELECT id,title FROM zv_series WHERE id IN (${sers.map(() => '?').join(',')})`).bind(...sers).all() : null]);
  const ls = new Set(((L && L.results) || []).map(x => x.vid)), sv = new Set(((Sv && Sv.results) || []).map(x => x.vid + x.k)), fs = new Set(((F && F.results) || []).map(x => x.dst));
  const rm = {}; ((R && R.results) || []).forEach(x => rm[x.id] = x); const sm = {}; ((Se && Se.results) || []).forEach(x => sm[x.id] = x.title);
  for (const it of items) {
    it.liked = ls.has(it.id) ? 1 : 0; it.saved = sv.has(it.id + 's') ? 1 : 0; it.later = sv.has(it.id + 'w') ? 1 : 0;
    if (it.u.id) { it.u.fol = fs.has(it.u.id) ? 1 : 0; if (it.u.id === me) it.mine = 1; }
    if (it.rt) { const x = rm[it.rt.id]; it.rt = x ? { id: x.id, h: x.ph || x.uid || '', name: x.un || '' } : { id: it.rt.id, gone: 1 }; }
    if (it.ser && it.ser.id !== OFF_SER) { if (sm[it.ser.id]) it.ser.t = sm[it.ser.id]; else delete it.ser; }
  }
  return items;
}
async function userBy(db, h) {
  h = String(h || '').toLowerCase().replace(/^@/, '');
  if (!h) return null;
  if (h === OFF_HANDLE) h = OFF_UID;
  return db.prepare('SELECT u.*, p.handle, p.pat, p.pins, p.verified, p.likes_pub, p.push, p.vdev FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid WHERE u.uid=?1 OR p.handle=?1 LIMIT 1').bind(h).first();
}
async function counts(db, uid) {
  const r = await db.prepare("SELECT (SELECT COUNT(*) FROM sc_dw_follow WHERE dst=?1) ers, (SELECT COUNT(*) FROM sc_dw_follow WHERE src=?1) ing, (SELECT COALESCE(SUM(likes),0) FROM vid_videos WHERE uid=?1 AND status='approved') lk, (SELECT COUNT(*) FROM vid_videos WHERE uid=?1 AND status='approved' AND hidden=0) n").bind(uid).first();
  return { followers: r.ers || 0, following: r.ing || 0, likes: r.lk || 0, clips: r.n || 0 };
}
async function pushTo(env, deps, uid, payload) { // a phone push to a Diwaniya user who linked this device's push subscription (zv_push) and left «تنبيهات المقاطع» on
  try {
    const db = env.DB;
    const r = await db.prepare('SELECT z.sub FROM sc_dw_user u JOIN zv_push z ON z.dev=u.dev LEFT JOIN zv_prof p ON p.uid=u.uid WHERE u.uid=? AND COALESCE(p.push,1)=1').bind(uid).first();
    if (!r) return;
    if (!(await rlim(db, 'zvpush:' + uid, 8, 36e5))) return; // at most 8 clip pushes an hour per person
    const sub = await db.prepare('SELECT * FROM push_subs WHERE id=?').bind(r.sub).first();
    if (!sub) return;
    const res = await deps.sendPush(db, sub, payload, 6 * 3600, 'normal');
    if (res && (res.status === 404 || res.status === 410)) await db.prepare('DELETE FROM zv_push WHERE sub=?').bind(r.sub).run();
  } catch (e) { }
}
const KTXT = { vlike: 'أعجبه مقطعك', vcmt: 'علّق على مقطعك', vrpl: 'ردّ على تعليقك', vcl: 'أعجبه تعليقك', vmen: 'أشار إليك في مقطع', vrep: 'ردّ على مقطعك بمقطع', vcmen: 'أشار إليك في تعليق' };
async function notify(env, ctx, deps, o, to, kind, vid, name, snippet) {
  if (!to || to === o.me || to === OFF_UID) return;
  const db = env.DB;
  if (await db.prepare('SELECT 1 FROM sc_dw_block WHERE (src=?1 AND dst=?2) OR (src=?2 AND dst=?1)').bind(to, o.me).first()) return;
  const pid = 'v:' + vid;
  const had = await db.prepare('SELECT 1 FROM sc_dw_notif WHERE to_uid=? AND kind=? AND from_uid=? AND pid=?').bind(to, kind, o.me, pid).first();
  await db.prepare('INSERT OR REPLACE INTO sc_dw_notif (to_uid,kind,from_uid,pid,at,seen) VALUES (?,?,?,?,?,0)').bind(to, kind, o.me, pid, o.now).run();
  if (!had) ctx.waitUntil(pushTo(env, deps, to, { t: (name || 'مستخدم') + ' ' + (KTXT[kind] || ''), b: String(snippet || '').slice(0, 90) || 'مقاطع زاد', u: './#video/' + vid, tag: 'zv' + kind + vid }));
}
async function unnotify(db, me, to, kind, vid) { if (to) await db.prepare('DELETE FROM sc_dw_notif WHERE to_uid=? AND kind=? AND from_uid=? AND pid=?').bind(to, kind, me, 'v:' + vid).run(); }
async function mentionNotify(env, ctx, deps, o, text, vid, kind, name) {
  const db = env.DB;
  for (const h of mentionsOf(text)) { const t = await userBy(db, h); if (t && !t.banned) await notify(env, ctx, deps, o, t.uid, kind, vid, name, text); }
}
async function publishNotify(env, ctx, deps, row) { // a published clip: its tags go live, mentions and «رد بمقطع» notify (scheduled clips wait for their time)
  const db = env.DB, now = Date.now();
  const st = tagsOf(row.caption || '').map(t => db.prepare('INSERT OR IGNORE INTO zv_tag (tag,vid,at) VALUES (?,?,?)').bind(t, row.id, row.approved_at || now));
  st.push(db.prepare('UPDATE vid_videos SET notified=1 WHERE id=?').bind(row.id));
  await db.batch(st);
  const me = await db.prepare('SELECT name FROM sc_dw_user WHERE uid=?').bind(row.uid).first();
  const o = { me: row.uid, now };
  await mentionNotify(env, ctx, deps, o, row.caption || '', row.id, 'vmen', me && me.name);
  if (row.reply_to) { const p = await db.prepare('SELECT uid FROM vid_videos WHERE id=?').bind(row.reply_to).first(); if (p && p.uid) await notify(env, ctx, deps, o, p.uid, 'vrep', row.id, me && me.name, row.caption); }
}
async function contactOk(db, phoney, s) { // phone numbers and links stay forbidden; @mentions are allowed only for real «زاد» accounts (no outside identifiers)
  for (const h of mentionsOf(s)) if (!(await userBy(db, h))) return false;
  return !phoney(String(s).replace(/@[a-z][a-z0-9_.]{2,19}/gi, ' '));
}
const FX_COL = /^#[0-9a-f]{6}$/i;
function cleanFx(fx, bad, phoney) { // filters (CSS-level params) + up to 5 text overlays; a «آية» overlay stores only its reference — the text is read from quran.com at play time
  if (!fx || typeof fx !== 'object') return null;
  const n = (x, a, b, d) => { x = +x; return isFinite(x) ? Math.min(b, Math.max(a, Math.round(x * 100) / 100)) : d; };
  const out = {};
  if (fx.f && typeof fx.f === 'object') { const f = { b: n(fx.f.b, .5, 1.6, 1), c: n(fx.f.c, .5, 1.6, 1), w: n(fx.f.w, 0, 1, 0), s: n(fx.f.s, 0, 2, 1), g: n(fx.f.g, 0, 1, 0) }; if (f.b !== 1 || f.c !== 1 || f.w || f.s !== 1 || f.g) out.f = f; }
  if (Array.isArray(fx.o)) {
    out.o = [];
    for (const x of fx.o.slice(0, 5)) {
      if (!x || typeof x !== 'object') continue;
      const o = { x: n(x.x, 0, 100, 50), y: n(x.y, 0, 100, 50), z: n(x.z, 12, 44, 22), c: FX_COL.test(x.c) ? x.c : '#ffffff', f: ['c', 'a'].includes(x.f) ? x.f : 'c', bg: x.bg ? 1 : 0 };
      if (x.k === 'aya') { const m = /^(\d{1,3}):(\d{1,3})$/.exec(String(x.ref || '')); if (!m || +m[1] < 1 || +m[1] > 114 || +m[2] < 1 || +m[2] > 286) continue; o.k = 'aya'; o.ref = m[1] + ':' + m[2]; o.f = 'q'; }
      else { const t = TXT(x.t).slice(0, 120); if (!t || bad(t) || phoney(t) || LINK.test(t)) continue; o.t = t; }
      out.o.push(o);
    }
    if (!out.o.length) delete out.o;
  }
  return Object.keys(out).length ? out : null;
}
setPurgeHook(async (db, env, row) => { // «احذف حسابي» / admin purge in the Diwaniya: the account's clips and «مقاطع زاد» rows go too
  await schema(db);
  const ids = ((await db.prepare('SELECT id FROM vid_videos WHERE uid=?').bind(row.uid).all()).results || []).map(x => x.id);
  for (let i = 0; i < ids.length; i += 20) await vidDelete(env, ids.slice(i, i + 20));
  const cm = ((await db.prepare('SELECT DISTINCT vid FROM vid_comments WHERE uid=?').bind(row.uid).all()).results || []).map(x => x.vid);
  await db.batch([db.prepare('DELETE FROM zv_cml WHERE uid=? OR cid IN (SELECT id FROM vid_comments WHERE uid=?)').bind(row.uid, row.uid), db.prepare('DELETE FROM vid_comments WHERE parent IN (SELECT id FROM vid_comments WHERE uid=?)').bind(row.uid),
    db.prepare('DELETE FROM vid_comments WHERE uid=?').bind(row.uid), db.prepare('DELETE FROM zv_prof WHERE uid=?').bind(row.uid), db.prepare('DELETE FROM zv_series WHERE uid=?').bind(row.uid),
    db.prepare('DELETE FROM zv_save WHERE dev=?').bind(row.dev), db.prepare('DELETE FROM zv_hide WHERE dev=?').bind(row.dev), db.prepare('DELETE FROM zv_push WHERE dev=?').bind(row.dev),
    ...cm.map(v => db.prepare('UPDATE vid_videos SET comments=(SELECT COUNT(*) FROM vid_comments WHERE vid=? AND hidden=0) WHERE id=?').bind(v, v))]);
});

export async function zvApi(o) {
  const { u, req, env, ctx, deps, dev, ip, W, bad, phoney, p, M } = o; const db = env.DB;
  if (!db) return E('no database', 500);
  await schema(db);
  const now = Date.now(); o.now = now;
  let b = {};
  if (M === 'POST') { try { const t = await req.text(); if (t.length > 8000) return E('too big', 413); b = t ? JSON.parse(t) : {}; } catch (e) { return E('bad json'); } }
  const vdev = await vidDevHash(db, req);
  const meRow = dev ? await db.prepare('SELECT u.*, p.handle, p.pat, p.verified, p.likes_pub, p.push, p.pins FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid WHERE u.dev=?').bind(dev).first() : null;
  const me = meRow && !meRow.banned ? meRow.uid : null; o.me = me;
  const needMe = () => !dev ? E('device') : !meRow ? E('profile', 400, 'اختر اسمك أولًا') : meRow.banned ? E('banned', 403, 'تم إيقاف حسابك') : null;
  const ensureProf = async uid => { await db.prepare('INSERT OR IGNORE INTO zv_prof (uid,at) VALUES (?,?)').bind(uid, now).run(); };
  const V = s => String(s || '').replace(/[^a-f0-9]/g, '').slice(0, 16);
  const list = async (where, order, binds, lim, off) => {
    const r = await db.prepare(`${SEL} WHERE ${where} ORDER BY ${order} LIMIT ${lim} OFFSET ${off || 0}`).bind(...(binds || [])).all();
    return decorate(db, (r.results || []).map(x => pubV(x, now)), me, dev, vdev);
  };
  const blockedWith = async who => !!(me && who && await db.prepare('SELECT 1 FROM sc_dw_block WHERE (src=?1 AND dst=?2) OR (src=?2 AND dst=?1)').bind(who, me).first());
  const c = Math.max(0, Math.min(2000, Math.floor(+u.searchParams.get('c') || 0)));
  const meOut = r => ({ id: r.uid, h: r.handle || r.uid, name: r.name, bio: r.bio || '', pat: r.pat || 0, ver: r.verified ? 1 : 0, likesPub: r.likes_pub ? 1 : 0, push: r.push === 0 ? 0 : 1, banned: r.banned ? 1 : 0 });

  if (p === 'vx/me') { // who am I in «مقاطع زاد» (the Diwaniya profile) + unread notifications; links my older clips (uploaded on this device before v5.4) to my profile
    if (me && vdev) {
      await ensureProf(me);
      await db.batch([db.prepare('UPDATE zv_prof SET vdev=? WHERE uid=?').bind(vdev, me), db.prepare("UPDATE vid_videos SET uid=? WHERE dev=? AND uid IS NULL AND COALESCE(official,0)=0").bind(me, vdev),
        db.prepare("UPDATE vid_comments SET uid=? WHERE dev=? AND uid IS NULL").bind(me, vdev)]);
    }
    const un = me ? (await db.prepare("SELECT COUNT(*) n FROM sc_dw_notif WHERE to_uid=? AND seen=0").bind(me).first()).n : 0;
    return J({ ok: true, me: meRow ? meOut(meRow) : null, unread: un });
  }
  if (p === 'vx/feed') { // «لك»: newest 3 official episodes pinned on top, then a recency × engagement mix; «أتابعهم»: the people I follow, newest first
    const f = u.searchParams.get('f') === 'fol' ? 'fol' : 'for';
    if (!c) { // scheduled clips that reached their time: send their tag/mention notifications once
      try { const due = (await db.prepare('SELECT * FROM vid_videos WHERE notified=2 AND approved_at<=? LIMIT 5').bind(now).all()).results || []; for (const r of due) ctx.waitUntil(publishNotify(env, ctx, deps, r)); } catch (e) { }
    }
    if (f === 'fol') {
      if (!me) return J({ ok: true, items: [], need: 'profile' });
      const items = await list(`${PUB(now)} AND v.uid IN (SELECT dst FROM sc_dw_follow WHERE src='${me}')`, 'v.approved_at DESC', [], PAGE, c);
      return J({ ok: true, items, next: items.length === PAGE ? c + PAGE : null });
    }
    let pin = [];
    if (!c) pin = await list(`${PUB(now)} AND COALESCE(v.official,0)=1`, 'v.approved_at DESC', [], 3, 0);
    const pinIds = pin.map(x => x.id);
    const score = `((COALESCE(v.likes,0)*3 + COALESCE(v.comments,0)*4 + COALESCE(v.views,0)*0.3 + COALESCE(v.saves,0)*5 + COALESCE(v.shares,0)*4 + CASE WHEN COALESCE(v.official,0)=1 THEN 12 ELSE 0 END + 6) / ((${now} - v.approved_at) / 3600000.0 + 6))`;
    const rest = await list(`${PUB(now)}${NOBLOCK(me)}${NOHIDE(dev)}${pinIds.length ? ` AND v.id NOT IN (${pinIds.map(x => `'${x}'`).join(',')})` : ''}`, `${score} DESC, v.approved_at DESC`, [], PAGE, c);
    return J({ ok: true, items: pin.concat(rest), next: rest.length === PAGE ? c + PAGE : null });
  }
  if (p === 'vx/item') {
    const id = V(u.searchParams.get('id'));
    const r = await db.prepare(`${SEL} WHERE v.id=? AND ${PUB(now)}`).bind(id).first();
    if (!r) return E('gone', 404, 'هذا المقطع لم يعد متاحًا');
    const [it] = await decorate(db, [pubV(r, now)], me, dev, vdev);
    return J({ ok: true, item: it });
  }
  if (p === 'vx/view' && M === 'POST') { // one view per device (or network address when there is no device id) per clip per day
    const id = V(b.id); if (!VID.test(id)) return E('bad id');
    const dk = vdev || ('ip:' + ip);
    const ins = await db.prepare("INSERT OR IGNORE INTO zv_view (vid,dk,day,at) SELECT ?,?,?,? WHERE EXISTS (SELECT 1 FROM vid_videos WHERE id=? AND status='approved')").bind(id, dk, day(now), now, id).run();
    if (ins.meta.changes) await db.prepare('UPDATE vid_videos SET views=COALESCE(views,0)+1 WHERE id=?').bind(id).run();
    return J({ ok: true, counted: !!ins.meta.changes });
  }
  if (p === 'vx/like' && M === 'POST') { // the v4.2 like (per device, vid_likes) + a notification to the creator when the liker has a profile
    if (!vdev) return E('device');
    const id = V(b.id);
    const v = await db.prepare("SELECT id, uid, caption, title FROM vid_videos WHERE id=? AND status='approved'").bind(id).first(); if (!v) return E('gone', 404);
    if (await blockedWith(v.uid)) return E('blocked', 403);
    const has = await db.prepare('SELECT 1 x FROM vid_likes WHERE vid=? AND dev=?').bind(id, vdev).first();
    const want = b.on == null ? !has : !!b.on;
    if (want && !has) { if (!(await rlim(db, 'zvl:' + vdev, 300, 36e5))) return E('rate', 429); await db.batch([db.prepare('INSERT OR IGNORE INTO vid_likes(vid,dev,at) VALUES(?,?,?)').bind(id, vdev, now), db.prepare('UPDATE vid_videos SET likes=(SELECT COUNT(*) FROM vid_likes WHERE vid=?) WHERE id=?').bind(id, id)]); if (me) await notify(env, ctx, deps, o, v.uid, 'vlike', id, meRow.name, v.caption || v.title); }
    if (!want && has) { await db.batch([db.prepare('DELETE FROM vid_likes WHERE vid=? AND dev=?').bind(id, vdev), db.prepare('UPDATE vid_videos SET likes=(SELECT COUNT(*) FROM vid_likes WHERE vid=?) WHERE id=?').bind(id, id)]); if (me) await unnotify(db, me, v.uid, 'vlike', id); }
    const cc = await db.prepare('SELECT likes FROM vid_videos WHERE id=?').bind(id).first();
    return J({ ok: true, liked: want, likes: cc ? cc.likes : 0 });
  }
  if (p === 'vx/save' && M === 'POST') { // 🔖 حفظ (k=s) and «شاهد لاحقاً» (k=w), private to this device's profile
    if (!dev) return E('device');
    const id = V(b.id), k = b.k === 'w' ? 'w' : 's';
    if (!(await db.prepare("SELECT 1 FROM vid_videos WHERE id=? AND status='approved'").bind(id).first())) return E('gone', 404);
    const has = await db.prepare('SELECT 1 FROM zv_save WHERE dev=? AND vid=? AND k=?').bind(dev, id, k).first();
    const st = [has ? db.prepare('DELETE FROM zv_save WHERE dev=? AND vid=? AND k=?').bind(dev, id, k) : db.prepare('INSERT OR IGNORE INTO zv_save (dev,vid,k,at) VALUES (?,?,?,?)').bind(dev, id, k, now)];
    if (k === 's') st.push(db.prepare("UPDATE vid_videos SET saves=(SELECT COUNT(*) FROM zv_save WHERE vid=? AND k='s') WHERE id=?").bind(id, id));
    await db.batch(st);
    const r = await db.prepare('SELECT saves FROM vid_videos WHERE id=?').bind(id).first();
    return J({ ok: true, on: !has, saves: r ? r.saves || 0 : 0 });
  }
  if (p === 'vx/hide' && M === 'POST') { // «لا يهمني»: this clip leaves «لك» on this device
    if (!dev) return E('device'); const id = V(b.id);
    if (b.off) await db.prepare('DELETE FROM zv_hide WHERE dev=? AND vid=?').bind(dev, id).run();
    else await db.prepare('INSERT OR IGNORE INTO zv_hide (dev,vid,at) VALUES (?,?,?)').bind(dev, id, now).run();
    return J({ ok: true });
  }
  if (p === 'vx/share' && M === 'POST') { const id = V(b.id); if (dev && (await rlim(db, 'zvsh:' + dev, 60, 36e5))) await db.prepare('UPDATE vid_videos SET shares=COALESCE(shares,0)+1 WHERE id=?').bind(id).run(); return J({ ok: true }); }

  /* ---- comments: one level of replies, likes, the creator pins one, delete your own (or the creator deletes any); reports reuse /api/videos/creport ---- */
  if (p === 'vx/cmts') {
    const id = V(u.searchParams.get('id'));
    const v = await db.prepare(`${SEL} WHERE v.id=?`).bind(id).first(); if (!v) return E('gone', 404);
    const r = await db.prepare(`SELECT c.id,c.text,c.at,c.uid,c.name,c.parent,COALESCE(c.likes,0) likes,COALESCE(c.pinned,0) pinned,u.name un,p.handle ph,p.pat pp,p.verified pv FROM vid_comments c LEFT JOIN sc_dw_user u ON u.uid=c.uid LEFT JOIN zv_prof p ON p.uid=c.uid
      WHERE c.vid=? AND c.hidden=0 AND COALESCE(u.banned,0)=0 ${me ? `AND COALESCE(c.uid,'') NOT IN (SELECT dst FROM sc_dw_block WHERE src='${me}') AND COALESCE(c.uid,'') NOT IN (SELECT src FROM sc_dw_block WHERE dst='${me}')` : ''} ORDER BY c.at ASC LIMIT 400`).bind(id).all();
    const rows = r.results || [];
    const lk = me && rows.length ? new Set(((await db.prepare('SELECT cid FROM zv_cml WHERE uid=? AND cid IN (SELECT id FROM vid_comments WHERE vid=?)').bind(me, id).all()).results || []).map(x => x.cid)) : new Set();
    const creator = !!v.uid && v.uid === me;
    const map = {}, top = [];
    for (const x of rows) {
      const it = { id: x.id, text: x.text, at: x.at, likes: x.likes, u: uOf(x.uid, x.un || x.name, x.ph, x.pp, x.pv), liked: lk.has(x.id) ? 1 : 0 };
      if (x.pinned) it.pinned = 1; if (x.uid && x.uid === me) it.mine = 1; if (it.mine || creator) it.del = 1; if (x.uid && x.uid === v.uid) it.byCreator = 1;
      map[x.id] = it;
      if (x.parent && map[x.parent]) (map[x.parent].replies = map[x.parent].replies || []).push(it); else top.push(it);
    }
    top.sort((a, z) => (z.pinned || 0) - (a.pinned || 0) || (z.likes - a.likes) || (z.at - a.at));
    let can = 'yes';
    if (!meRow) can = 'profile'; else if (meRow.banned) can = 'banned'; else if (v.uid !== me) { const pm = v.cmt || 'all'; if (pm === 'off') can = 'off'; else if (pm === 'fol' && !(await db.prepare('SELECT 1 FROM sc_dw_follow WHERE src=? AND dst=?').bind(me, v.uid).first())) can = 'fol'; }
    return J({ ok: true, items: top, n: rows.length, creator: creator ? 1 : 0, perm: v.cmt || 'all', can, owner: uOf(v.uid, v.un || v.name, v.ph, v.pp, v.pv) });
  }
  if (p === 'vx/cmt' && M === 'POST') {
    const n = needMe(); if (n) return n;
    const id = V(b.id);
    const v = await db.prepare("SELECT id,uid,cmt,caption,title FROM vid_videos WHERE id=? AND status='approved' AND hidden=0").bind(id).first(); if (!v) return E('gone', 404, 'هذا المقطع لم يعد متاحًا');
    if (v.uid && v.uid !== me) {
      if (await blockedWith(v.uid)) return E('blocked', 403, 'لا يمكنك التعليق هنا');
      if (v.cmt === 'off') return E('off', 403, 'صاحب المقطع أوقف التعليقات');
      if (v.cmt === 'fol' && !(await db.prepare('SELECT 1 FROM sc_dw_follow WHERE src=? AND dst=?').bind(me, v.uid).first())) return E('fol', 403, 'التعليق لمتابعي صاحب المقطع فقط');
    }
    const text = TXT(b.text).replace(/\s+/g, ' ');
    if (!text) return E('empty', 400, 'اكتب تعليقك'); if (len(text) > VID_LIMITS.CM_MAX) return E('long', 400, 'التعليق أطول من ٣٠٠ حرف');
    if (bad(text)) return E('bad', 400, 'توجد كلمات غير لائقة، عدّلها من فضلك');
    if (LINK.test(text) || !(await contactOk(db, phoney, text))) return E('link', 400, 'الروابط وأرقام الجوال والمعرّفات الخارجية غير مسموحة');
    let parent = null;
    if (b.parent) { parent = await db.prepare('SELECT id,uid,parent FROM vid_comments WHERE id=? AND vid=? AND hidden=0').bind(V(b.parent), id).first(); if (!parent) return E('gone', 404, 'التعليق غير موجود'); if (parent.parent) parent = (await db.prepare('SELECT id,uid,parent FROM vid_comments WHERE id=?').bind(parent.parent).first()) || parent; }
    if (!(await vidRate(db, 'cm:' + (vdev || dev), VID_LIMITS.CM_PER_10MIN, 600e3))) return E('rate', 429, 'تمهّل قليلًا، وصلت إلى حدّ التعليقات (٨ كل ١٠ دقائق)');
    if (!(await W('zvc', 60, 864e5))) return E('rate', 429, 'وصلت حد التعليقات اليوم');
    const cid = rnd(8);
    await db.batch([db.prepare('INSERT INTO vid_comments (id,vid,name,text,dev,at,uid,parent) VALUES (?,?,?,?,?,?,?,?)').bind(cid, id, meRow.name, text, vdev || dev, now, me, parent ? parent.id : null),
      db.prepare('UPDATE vid_videos SET comments=(SELECT COUNT(*) FROM vid_comments WHERE vid=? AND hidden=0) WHERE id=?').bind(id, id)]);
    if (parent && parent.uid && parent.uid !== me) await notify(env, ctx, deps, o, parent.uid, 'vrpl', id, meRow.name, text);
    if (v.uid && (!parent || parent.uid !== v.uid)) await notify(env, ctx, deps, o, v.uid, 'vcmt', id, meRow.name, text);
    await mentionNotify(env, ctx, deps, o, text, id, 'vcmen', meRow.name);
    return J({ ok: true, item: { id: cid, text, at: now, likes: 0, u: uOf(me, meRow.name, meRow.handle, meRow.pat, meRow.verified), mine: 1, del: 1, parent: parent ? parent.id : null } });
  }
  if (p === 'vx/cml' && M === 'POST') { // ♡ on a comment
    const n = needMe(); if (n) return n;
    const cid = V(b.id);
    const x = await db.prepare('SELECT id,vid,uid,text FROM vid_comments WHERE id=? AND hidden=0').bind(cid).first(); if (!x) return E('gone', 404);
    if (!(await W('zvcl', 300, 36e5))) return E('rate', 429);
    const has = await db.prepare('SELECT 1 FROM zv_cml WHERE cid=? AND uid=?').bind(cid, me).first();
    if (has) await db.batch([db.prepare('DELETE FROM zv_cml WHERE cid=? AND uid=?').bind(cid, me), db.prepare('UPDATE vid_comments SET likes=(SELECT COUNT(*) FROM zv_cml WHERE cid=?) WHERE id=?').bind(cid, cid)]);
    else { await db.batch([db.prepare('INSERT OR IGNORE INTO zv_cml (cid,uid,at) VALUES (?,?,?)').bind(cid, me, now), db.prepare('UPDATE vid_comments SET likes=(SELECT COUNT(*) FROM zv_cml WHERE cid=?) WHERE id=?').bind(cid, cid)]); if (x.uid) await notify(env, ctx, deps, o, x.uid, 'vcl', x.vid, meRow.name, x.text); }
    const r = await db.prepare('SELECT likes FROM vid_comments WHERE id=?').bind(cid).first();
    return J({ ok: true, liked: !has, likes: r ? r.likes || 0 : 0 });
  }
  if (p === 'vx/cpin' && M === 'POST') { // the creator pins one top-level comment (again = unpin)
    const n = needMe(); if (n) return n;
    const cid = V(b.id);
    const x = await db.prepare('SELECT c.id,c.vid,c.parent,c.pinned,v.uid vu FROM vid_comments c JOIN vid_videos v ON v.id=c.vid WHERE c.id=?').bind(cid).first(); if (!x) return E('gone', 404);
    if (x.vu !== me) return E('forbidden', 403, 'التثبيت لصاحب المقطع فقط'); if (x.parent) return E('reply', 400, 'ثبّت تعليقًا رئيسيًا');
    await db.batch([db.prepare('UPDATE vid_comments SET pinned=0 WHERE vid=?').bind(x.vid), ...(x.pinned ? [] : [db.prepare('UPDATE vid_comments SET pinned=? WHERE id=?').bind(now, cid)])]);
    return J({ ok: true, pinned: !x.pinned });
  }
  if (p === 'vx/cdel' && M === 'POST') { // delete my comment, or any comment on my clip (its replies go with it)
    const n = needMe(); if (n) return n;
    const cid = V(b.id);
    const x = await db.prepare('SELECT c.id,c.vid,c.uid,v.uid vu FROM vid_comments c JOIN vid_videos v ON v.id=c.vid WHERE c.id=?').bind(cid).first(); if (!x) return E('gone', 404);
    if (x.uid !== me && x.vu !== me) return E('forbidden', 403);
    const ids = [cid, ...(((await db.prepare('SELECT id FROM vid_comments WHERE parent=?').bind(cid).all()).results || []).map(r => r.id))];
    const q = ids.map(() => '?').join(',');
    await db.batch([db.prepare(`DELETE FROM zv_cml WHERE cid IN (${q})`).bind(...ids), db.prepare(`DELETE FROM vid_reports WHERE target IN (${q})`).bind(...ids.map(i => 'c:' + i)),
      db.prepare(`DELETE FROM vid_comments WHERE id IN (${q})`).bind(...ids), db.prepare('UPDATE vid_videos SET comments=(SELECT COUNT(*) FROM vid_comments WHERE vid=? AND hidden=0) WHERE id=?').bind(x.vid, x.vid)]);
    return J({ ok: true, deleted: ids.length });
  }

  /* ---- profiles (#u/<handle>) ---- */
  if (p === 'vx/user') {
    const t = await userBy(db, u.searchParams.get('h'));
    if (!t || (t.banned && t.uid !== me)) return E('gone', 404, 'الحساب غير موجود');
    const own = t.uid === me, tab = ['v', 's', 'w', 'l', 'ser'].includes(u.searchParams.get('tab')) ? u.searchParams.get('tab') : 'v';
    const bl = me && !own ? (await db.prepare('SELECT src FROM sc_dw_block WHERE (src=?1 AND dst=?2) OR (src=?2 AND dst=?1)').bind(me, t.uid).all()).results || [] : [];
    const iBlocked = bl.some(x => x.src === me), theyBlocked = bl.some(x => x.src === t.uid);
    const pins = (parse(t.pins) || []).filter(x => VID.test(x)).slice(0, 3);
    const out = { ok: true, user: { id: t.uid, h: t.handle || t.uid, name: t.name, bio: t.bio || '', pat: t.pat || 0, ver: t.verified ? 1 : 0, at: t.at, ...(await counts(db, t.uid)), me: own ? 1 : 0, likesPub: t.likes_pub ? 1 : 0, pins, off: t.uid === OFF_UID ? 1 : 0 } };
    if (me && !own) { const f = await db.prepare('SELECT (SELECT 1 FROM sc_dw_follow WHERE src=?1 AND dst=?2) a, (SELECT 1 FROM sc_dw_follow WHERE src=?2 AND dst=?1) b').bind(me, t.uid).first(); out.user.following = f && f.a ? 1 : 0; out.user.followsMe = f && f.b ? 1 : 0; }
    if (iBlocked) out.user.blocked = 1;
    const ser = (await db.prepare("SELECT s.id, s.title, (SELECT COUNT(*) FROM vid_videos v WHERE v.series=s.id AND v.status='approved' AND v.hidden=0) n FROM zv_series s WHERE s.uid=? ORDER BY s.at").bind(t.uid).all()).results || [];
    if (t.uid === OFF_UID) ser.unshift({ id: OFF_SER, title: 'حلقات عمار', n: out.user.clips });
    out.user.series = own ? ser : ser.filter(x => x.n > 0);
    if (iBlocked || theyBlocked) return J({ ...out, items: [], next: null });
    let items = [];
    const ownWhere = ` v.uid='${t.uid}' AND v.status='approved' AND v.expires_at>${now} `;
    const pubWhere = `${PUB(now)} AND v.uid='${t.uid}'`;
    if (tab === 'v') {
      const where = own ? ownWhere : pubWhere;
      if (!c && pins.length) { const pr = await list(`${where} AND v.id IN (${pins.map(x => `'${x}'`).join(',')})`, 'v.approved_at DESC', [], 3, 0); pr.sort((a, z) => pins.indexOf(a.id) - pins.indexOf(z.id)); pr.forEach(x => x.pinned = 1); items = pr; }
      const rest = await list(`${where}${pins.length ? ` AND v.id NOT IN (${pins.map(x => `'${x}'`).join(',')})` : ''}`, 'v.approved_at DESC', [], GRID, c);
      items = items.concat(rest); out.next = rest.length === GRID ? c + GRID : null;
    } else if (tab === 's' || tab === 'w') {
      if (!own) return E('private', 403, 'خاص بصاحب الحساب');
      items = await list(`${PUB(now)} AND v.id IN (SELECT vid FROM zv_save WHERE dev='${dev}' AND k='${tab}')`, 'v.approved_at DESC', [], GRID, c); out.next = items.length === GRID ? c + GRID : null;
    } else if (tab === 'l') {
      if (!own && !t.likes_pub) return E('private', 403, 'الإعجابات خاصة');
      const lv = own ? vdev : t.vdev;
      items = lv ? await list(`${PUB(now)} AND v.id IN (SELECT vid FROM vid_likes WHERE dev='${lv}')`, 'v.approved_at DESC', [], GRID, c) : []; out.next = items.length === GRID ? c + GRID : null;
    } else if (tab === 'ser') {
      const sid = String(u.searchParams.get('sid') || '');
      const where = own ? ownWhere : pubWhere;
      items = sid === OFF_SER && t.uid === OFF_UID ? await list(`${PUB(now)} AND COALESCE(v.official,0)=1`, 'v.approved_at ASC', [], 60, 0) : /^[a-z2-9]{10}$/.test(sid) ? await list(`${where} AND v.series='${sid}'`, 'v.approved_at ASC', [], 60, 0) : [];
      out.next = null; out.series = ser.find(x => x.id === sid) || null;
    }
    out.items = items; if (out.next === undefined) out.next = null;
    return J(out);
  }
  if (p === 'vx/prof' && M === 'POST') { // @username, avatar pattern, «أعجبني» public/private, clip pushes on/off (name and bio stay in /api/social/dw/profile)
    const n = needMe(); if (n) return n;
    await ensureProf(me);
    const up = [], args = [];
    if (b.h != null) {
      const h = String(b.h).toLowerCase().trim().replace(/^@/, '');
      if (h && h !== (meRow.handle || '') && h !== me) {
        if (!HANDLE.test(h)) return E('handle', 400, 'المعرّف: حروف إنجليزية وأرقام و _ . (٣–٢٠) ويبدأ بحرف');
        if (RESERVED.has(h) || /^(zad|ammar|amar|admin|official)/.test(h) || UID.test(h) || vBad(h) || bad(h)) return E('taken', 400, 'هذا المعرّف غير متاح');
        if (await db.prepare('SELECT 1 FROM zv_prof WHERE handle=? AND uid!=?').bind(h, me).first()) return E('taken', 400, 'هذا المعرّف مأخوذ، جرّب غيره');
        if (!(await W('zvh', 6, 864e5))) return E('rate', 429, 'غيّرت معرّفك كثيرًا اليوم');
        up.push('handle=?'); args.push(h);
      }
    }
    if (b.pat != null) { up.push('pat=?'); args.push(Math.max(0, Math.min(12, Math.floor(+b.pat || 0)))); }
    if (b.likesPub != null) { up.push('likes_pub=?'); args.push(b.likesPub ? 1 : 0); }
    if (b.push != null) { up.push('push=?'); args.push(b.push ? 1 : 0); }
    if (up.length) { try { await db.prepare(`UPDATE zv_prof SET ${up.join(',')} WHERE uid=?`).bind(...args, me).run(); } catch (e) { if (/unique/i.test(String(e && e.message))) return E('taken', 400, 'هذا المعرّف مأخوذ، جرّب غيره'); throw e; } }
    const r = await userBy(db, me);
    return J({ ok: true, me: meOut(r) });
  }
  if (p === 'vx/pin' && M === 'POST') { // pin up to 3 of my clips on top of my profile (again = unpin)
    const n = needMe(); if (n) return n; await ensureProf(me);
    const id = V(b.id);
    if (!(await db.prepare("SELECT 1 FROM vid_videos WHERE id=? AND uid=? AND status='approved'").bind(id, me).first())) return E('forbidden', 403);
    let pins = (parse(meRow.pins) || []).filter(x => VID.test(x));
    const on = !pins.includes(id);
    if (on) { if (pins.length >= 3) return E('max', 400, 'يمكنك تثبيت ٣ مقاطع فقط'); pins.unshift(id); } else pins = pins.filter(x => x !== id);
    await db.prepare('UPDATE zv_prof SET pins=? WHERE uid=?').bind(JSON.stringify(pins), me).run();
    return J({ ok: true, pinned: on, pins });
  }
  if (p === 'vx/series') { // «سلسلة»: the creator groups clips into named series
    if (M === 'GET') { const t = await userBy(db, u.searchParams.get('u') || me); if (!t) return J({ ok: true, items: [] }); const r = await db.prepare('SELECT id,title FROM zv_series WHERE uid=? ORDER BY at').bind(t.uid).all(); return J({ ok: true, items: r.results || [] }); }
    const n = needMe(); if (n) return n;
    const op = String(b.op || '');
    if (op === 'new' || op === 'ren') {
      const title = TXT(b.title).replace(/\s+/g, ' ').slice(0, 40); if (len(title) < 2) return E('title', 400, 'اكتب اسم السلسلة');
      if (bad(title) || phoney(title) || LINK.test(title)) return E('bad', 400, 'اسم غير مسموح');
      if (op === 'new') { if ((await db.prepare('SELECT COUNT(*) n FROM zv_series WHERE uid=?').bind(me).first()).n >= 12) return E('max', 400, 'الحد ١٢ سلسلة'); const id = rid(10); await db.prepare('INSERT INTO zv_series (id,uid,title,at) VALUES (?,?,?,?)').bind(id, me, title, now).run(); return J({ ok: true, item: { id, title } }); }
      const r = await db.prepare('UPDATE zv_series SET title=? WHERE id=? AND uid=?').bind(title, String(b.id || ''), me).run(); return J({ ok: !!r.meta.changes });
    }
    if (op === 'del') { const sid = String(b.id || ''); if (!(await db.prepare('SELECT 1 FROM zv_series WHERE id=? AND uid=?').bind(sid, me).first())) return E('gone', 404); await db.batch([db.prepare('UPDATE vid_videos SET series=NULL WHERE series=? AND uid=?').bind(sid, me), db.prepare('DELETE FROM zv_series WHERE id=? AND uid=?').bind(sid, me)]); return J({ ok: true }); }
    if (op === 'set') { const id = V(b.vid), sid = String(b.id || ''); if (sid && !(await db.prepare('SELECT 1 FROM zv_series WHERE id=? AND uid=?').bind(sid, me).first())) return E('gone', 404); const r = await db.prepare('UPDATE vid_videos SET series=? WHERE id=? AND uid=?').bind(sid || null, id, me).run(); return J({ ok: !!r.meta.changes }); }
    return E('op');
  }
  if (p === 'vx/edit' && M === 'POST') { // my clip's «من يمكنه التعليق» and download toggle
    const n = needMe(); if (n) return n;
    const id = V(b.id);
    if (!(await db.prepare('SELECT id FROM vid_videos WHERE id=? AND uid=?').bind(id, me).first())) return E('forbidden', 403);
    const up = [], args = [];
    if (b.cmt != null) { up.push('cmt=?'); args.push(['all', 'fol', 'off'].includes(b.cmt) ? b.cmt : 'all'); }
    if (b.dl != null) { up.push('dl=?'); args.push(b.dl ? 1 : 0); }
    if (up.length) await db.prepare(`UPDATE vid_videos SET ${up.join(',')} WHERE id=?`).bind(...args, id).run();
    return J({ ok: true });
  }
  if (p === 'vx/del' && M === 'POST') { // the creator deletes their own clip (R2 objects + every row)
    const n = needMe(); if (n) return n;
    const id = V(b.id);
    if (!(await db.prepare('SELECT id FROM vid_videos WHERE id=? AND uid=?').bind(id, me).first())) return E('forbidden', 403);
    await vidDelete(env, [id]);
    if (meRow.pins) { const pins = (parse(meRow.pins) || []).filter(x => x !== id); await db.prepare('UPDATE zv_prof SET pins=? WHERE uid=?').bind(JSON.stringify(pins), me).run(); }
    return J({ ok: true });
  }

  /* ---- upload: vx/init (the v4.2 rules + the v5.4 fields) → PUT /api/videos/poster/<id>?t= → PUT /api/videos/file/<id>?t= → vx/done ---- */
  if (p === 'vx/init' && M === 'POST') {
    const n = needMe(); if (n) return n; if (!vdev) return E('device');
    const cap = TXT(b.caption).slice(0, 600);
    if (len(cap) > 300) return E('long', 400, 'الوصف أطول من ٣٠٠ حرف');
    if (bad(cap)) return E('bad', 400, 'توجد كلمات غير لائقة، عدّلها من فضلك');
    if (LINK.test(cap) || !(await contactOk(db, phoney, cap))) return E('link', 400, 'الروابط وأرقام الجوال والمعرّفات الخارجية غير مسموحة في الوصف');
    const size = Math.floor(+b.size || 0), dur = +b.dur || 0;
    const type = /^video\/(mp4|quicktime|webm|3gpp|x-m4v)$/.test(String(b.type || '')) ? String(b.type) : '';
    if (!type) return E('type', 400, 'صيغة المقطع غير مدعومة، جرّب MP4');
    if (!(size > 0) || size > VID_LIMITS.MAX_BYTES) return E('size', 400, 'حجم المقطع أكبر من المسموح (٥٠ م.ب)');
    if (!(dur > 0) || dur > VID_LIMITS.MAX_DUR) return E('dur', 400, 'المقطع أطول من دقيقتين');
    let ts = +b.ts || 0, te = +b.te || 0;
    if (!(ts >= 0 && ts < dur)) ts = 0; if (!(te > ts + .9 && te <= dur + .5)) te = 0; if (te && te >= dur - .15) te = 0;
    const fx = cleanFx(b.fx, bad, phoney), fxs = fx ? JSON.stringify(fx) : null; if (fxs && fxs.length > 3000) return E('fx');
    const cmt = ['all', 'fol', 'off'].includes(b.cmt) ? b.cmt : 'all';
    let reply = null; if (b.reply_to) { const r = await db.prepare(`SELECT v.id FROM vid_videos v LEFT JOIN sc_dw_user u ON u.uid=v.uid WHERE v.id=? AND ${PUB(now)}`).bind(V(b.reply_to)).first(); if (!r) return E('gone', 404, 'المقطع الأصلي لم يعد متاحًا'); reply = r.id; }
    let series = null; if (b.series) { const s = await db.prepare('SELECT id FROM zv_series WHERE id=? AND uid=?').bind(String(b.series), me).first(); if (s) series = s.id; }
    let pub = Math.floor(+b.pub_at || 0); if (!(pub > now + 4 * 60e3 && pub < now + 14 * 864e5)) pub = null;
    const title = (cap.replace(/[#@][\p{L}\p{N}_.]+/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)) || ('مقطع من ' + meRow.name).slice(0, 80);
    if (!(await vidRate(db, 'up:' + vdev, VID_LIMITS.UP_PER_DAY, 864e5))) return E('rate', 429, 'وصلت الحد اليومي (٣ مقاطع)، جرّب غداً');
    const iph = (await sha('zvip:' + (ip || '0'))).slice(0, 32);
    if (!(await vidRate(db, 'upip:' + iph, VID_LIMITS.UP_PER_DAY_IP, 864e5))) return E('rate', 429, 'وصلت الحد المسموح، جرّب لاحقًا');
    const vid = rnd(8), tok = rnd(16);
    await db.prepare("INSERT INTO vid_videos (id,title,name,dev,iph,ctype,size,dur,w,h,status,tok,created,uid,caption,cmt,trim_s,trim_e,fx,reply_to,series,dl,pub_at,notified) VALUES (?,?,?,?,?,?,?,?,?,?,'up',?,?,?,?,?,?,?,?,?,?,?,?,0)")
      .bind(vid, title, meRow.name, vdev, iph, type, size, Math.round(dur * 10) / 10, Math.floor(+b.w || 0) || null, Math.floor(+b.h || 0) || null, await sha(tok), now, me, cap, cmt, ts || null, te || null, fxs, reply, series, b.dl === 0 || b.dl === false ? 0 : 1, pub).run();
    return J({ ok: true, id: vid, t: tok, max: VID_LIMITS.MAX_BYTES, sched: pub });
  }
  if (p === 'vx/done' && M === 'POST') { // after the file PUT published it: tags, mentions, «رد بمقطع» notifications (now, or when a scheduled clip's time comes)
    const n = needMe(); if (n) return n;
    const id = V(b.id);
    const r = await db.prepare("SELECT * FROM vid_videos WHERE id=? AND uid=? AND status='approved'").bind(id, me).first(); if (!r) return E('gone', 404);
    if (r.notified) return J({ ok: true, at: r.approved_at });
    if (r.approved_at > now) { await db.prepare('UPDATE vid_videos SET notified=2 WHERE id=?').bind(id).run(); return J({ ok: true, sched: r.approved_at }); }
    await publishNotify(env, ctx, deps, r);
    return J({ ok: true, at: r.approved_at });
  }

  /* ---- discover ---- */
  if (p === 'vx/explore') {
    const q = TXT(u.searchParams.get('q') || '').slice(0, 40), qs = q.replace(/^[#@]/, '').replace(/[%_]/g, ''), qn = tagN(qs);
    if (qs) {
      const like = '%' + qs + '%';
      const [us, tg] = await Promise.all([
        db.prepare("SELECT u.uid, u.name, u.bio, p.handle, p.pat, p.verified, (SELECT COUNT(*) FROM sc_dw_follow WHERE dst=u.uid) ers FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid WHERE COALESCE(u.banned,0)=0 AND (u.name LIKE ?1 OR p.handle LIKE ?2 OR u.uid=?3) ORDER BY p.verified DESC, ers DESC LIMIT 20").bind(like, like.toLowerCase(), qs.toLowerCase()).all(),
        db.prepare(`SELECT t.tag, COUNT(*) n FROM zv_tag t JOIN vid_videos v ON v.id=t.vid WHERE t.tag LIKE ? AND v.status='approved' AND v.hidden=0 AND v.expires_at>${now} AND v.approved_at<=${now} GROUP BY t.tag ORDER BY n DESC LIMIT 12`).bind('%' + qn + '%').all()]);
      const clips = await list(`${PUB(now)}${NOBLOCK(me)} AND (v.caption LIKE ?1 OR v.title LIKE ?1 OR u.name LIKE ?1)`, 'v.likes DESC, v.approved_at DESC', [like], 30, 0);
      return J({ ok: true, q, users: (us.results || []).map(x => ({ ...uOf(x.uid, x.name, x.handle, x.pat, x.verified), bio: x.bio || '', followers: x.ers })), tags: tg.results || [], clips });
    }
    const [tr, su] = await Promise.all([
      db.prepare(`SELECT t.tag, COUNT(*) n FROM zv_tag t JOIN vid_videos v ON v.id=t.vid WHERE t.at>? AND v.status='approved' AND v.hidden=0 AND v.expires_at>${now} AND v.approved_at<=${now} GROUP BY t.tag ORDER BY n DESC LIMIT 15`).bind(now - 7 * 864e5).all(),
      db.prepare(`SELECT u.uid, u.name, u.bio, p.handle, p.pat, p.verified, (SELECT COUNT(*) FROM sc_dw_follow WHERE dst=u.uid) ers, (SELECT COUNT(*) FROM vid_videos v WHERE v.uid=u.uid AND v.status='approved' AND v.hidden=0) nv FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid
        WHERE COALESCE(u.banned,0)=0 ${me ? `AND u.uid!='${me}' AND u.uid NOT IN (SELECT dst FROM sc_dw_follow WHERE src='${me}') AND u.uid NOT IN (SELECT dst FROM sc_dw_block WHERE src='${me}')` : ''} AND EXISTS (SELECT 1 FROM vid_videos v WHERE v.uid=u.uid AND v.status='approved' AND v.hidden=0) ORDER BY p.verified DESC, ers DESC, nv DESC LIMIT 12`).all()]);
    const pop = await list(`${PUB(now)}${NOBLOCK(me)}${NOHIDE(dev)}`, '(COALESCE(v.likes,0)*3 + COALESCE(v.views,0) + COALESCE(v.comments,0)*4 + COALESCE(v.saves,0)*5) DESC, v.approved_at DESC', [], 30, c);
    return J({ ok: true, trending: tr.results || [], users: (su.results || []).map(x => ({ ...uOf(x.uid, x.name, x.handle, x.pat, x.verified), bio: x.bio || '', followers: x.ers, clips: x.nv })), clips: pop, next: pop.length === 30 ? c + 30 : null });
  }
  if (p === 'vx/tag') { // #tag/<name>: count + grid (hashtags only — no sounds, no music)
    const t = tagN(TXT(u.searchParams.get('t') || '').replace(/^#/, '')).slice(0, 30); if (!t) return E('tag');
    const where = `${PUB(now)}${NOBLOCK(me)} AND v.id IN (SELECT vid FROM zv_tag WHERE tag=?1)`;
    const nn = await db.prepare(`SELECT COUNT(*) n, COALESCE(SUM(v.views),0) vw FROM vid_videos v LEFT JOIN sc_dw_user u ON u.uid=v.uid WHERE ${where}`).bind(t).first();
    const items = await list(where, 'v.likes DESC, v.approved_at DESC', [t], GRID, c);
    return J({ ok: true, tag: t, n: nn.n, views: nn.vw, items, next: items.length === GRID ? c + GRID : null });
  }
  if (p === 'vx/ac') { // @mention / #hashtag autocomplete while typing
    const q = TXT(u.searchParams.get('q') || '').slice(0, 30);
    if (q[0] === '#') { const r = await db.prepare('SELECT tag, COUNT(*) n FROM zv_tag WHERE tag LIKE ? GROUP BY tag ORDER BY n DESC LIMIT 8').bind(tagN(q.slice(1)).replace(/[%_]/g, '') + '%').all(); return J({ ok: true, tags: r.results || [] }); }
    const s = q.replace(/^@/, '').toLowerCase().replace(/[%_]/g, '');
    const r = await db.prepare("SELECT u.uid, u.name, p.handle, p.pat, p.verified FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid WHERE COALESCE(u.banned,0)=0 AND (p.handle LIKE ?1 OR u.name LIKE ?2 OR u.uid LIKE ?1) ORDER BY p.verified DESC LIMIT 8").bind(s + '%', '%' + s + '%').all();
    return J({ ok: true, users: (r.results || []).map(x => uOf(x.uid, x.name, x.handle, x.pat, x.verified)) });
  }
  if (p === 'vx/suggest') { // «اقتراح حسابات» after a follow: who that person's followers also follow, then creators with the most followers
    const after = String(u.searchParams.get('after') || ''); if (!UID.test(after)) return J({ ok: true, items: [] });
    const ex = `u.uid!='${after}' ${me ? `AND u.uid!='${me}' AND u.uid NOT IN (SELECT dst FROM sc_dw_follow WHERE src='${me}') AND u.uid NOT IN (SELECT dst FROM sc_dw_block WHERE src='${me}')` : ''} AND COALESCE(u.banned,0)=0`;
    const r = await db.prepare(`SELECT u.uid, u.name, p.handle, p.pat, p.verified, (SELECT COUNT(*) FROM sc_dw_follow f2 WHERE f2.dst=u.uid AND f2.src IN (SELECT src FROM sc_dw_follow WHERE dst=?)) co, (SELECT COUNT(*) FROM sc_dw_follow WHERE dst=u.uid) ers FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid WHERE ${ex} AND EXISTS (SELECT 1 FROM vid_videos v WHERE v.uid=u.uid AND v.status='approved' AND v.hidden=0) ORDER BY co DESC, p.verified DESC, ers DESC LIMIT 10`).bind(after).all();
    return J({ ok: true, items: (r.results || []).map(x => ({ ...uOf(x.uid, x.name, x.handle, x.pat, x.verified), followers: x.ers })) });
  }
  if (p === 'vx/stats') { // «إحصائياتي»: views, likes, comments, new followers per day (7 or 28 days) + top clips
    const n = needMe(); if (n) return n;
    const d = u.searchParams.get('d') === '28' ? 28 : 7, from = now - d * 864e5, d0 = day(now - (d - 1) * 864e5);
    const [vw, lk, cm, fo, top, tot] = await Promise.all([
      db.prepare('SELECT z.day d, COUNT(*) n FROM zv_view z JOIN vid_videos v ON v.id=z.vid WHERE v.uid=? AND z.day>=? GROUP BY z.day').bind(me, d0).all(),
      db.prepare('SELECT l.at FROM vid_likes l JOIN vid_videos v ON v.id=l.vid WHERE v.uid=? AND l.at>=?').bind(me, from).all(),
      db.prepare('SELECT c.at FROM vid_comments c JOIN vid_videos v ON v.id=c.vid WHERE v.uid=? AND c.at>=? AND c.hidden=0').bind(me, from).all(),
      db.prepare('SELECT at FROM sc_dw_follow WHERE dst=? AND at>=?').bind(me, from).all(),
      db.prepare("SELECT v.id, v.title, v.caption, v.poster, v.likes, v.comments, v.views, v.saves, v.approved_at, (SELECT COUNT(*) FROM zv_view z WHERE z.vid=v.id AND z.day>=?) pv FROM vid_videos v WHERE v.uid=? AND v.status='approved' ORDER BY pv DESC, v.views DESC LIMIT 5").bind(d0, me).all(),
      db.prepare("SELECT COUNT(*) n, COALESCE(SUM(views),0) vw, COALESCE(SUM(likes),0) lk, COALESCE(SUM(comments),0) cm, COALESCE(SUM(saves),0) sv FROM vid_videos WHERE uid=? AND status='approved'").bind(me).first()]);
    const days = []; for (let i = d - 1; i >= 0; i--) days.push(day(now - i * 864e5));
    const bucket = rows => { const m = {}; for (const r of rows.results || []) { const k = day(r.at); m[k] = (m[k] || 0) + 1; } return days.map(k => m[k] || 0); };
    const vm = {}; (vw.results || []).forEach(r => vm[r.d] = r.n);
    const ff = await counts(db, me);
    return J({ ok: true, d, days, views: days.map(k => vm[k] || 0), likes: bucket(lk), comments: bucket(cm), followers: bucket(fo), top: top.results || [], totals: { clips: tot.n, views: tot.vw, likes: tot.lk, comments: tot.cm, saves: tot.sv, followers: ff.followers } });
  }
  if (p === 'vx/pushlink' && M === 'POST') { // link this device's existing push subscription (from the app's «التنبيهات») so clip notifications can reach the phone
    const n = needMe(); if (n) return n;
    const ep = String(b.endpoint || ''); if (!/^https:\/\//.test(ep)) return E('sub');
    const sid = (await sha(ep)).slice(0, 32);
    if (b.on === false) { await db.prepare('DELETE FROM zv_push WHERE dev=?').bind(dev).run(); return J({ ok: true, on: false }); }
    let has = null; try { has = await db.prepare('SELECT 1 FROM push_subs WHERE id=?').bind(sid).first(); } catch (e) { }
    if (!has) return J({ ok: false, error: 'nosub', msg: 'فعّل التنبيهات من الإعدادات أولًا' });
    await db.prepare('INSERT INTO zv_push (dev,sub,at) VALUES (?,?,?) ON CONFLICT(dev) DO UPDATE SET sub=excluded.sub, at=excluded.at').bind(dev, sid, now).run();
    return J({ ok: true, on: true });
  }
  return E('not found', 404);
}
export async function zvAdmin(o) { // under the /admin/social passcode session (checked in social.js): verified badges
  const { env, p, b, M, u } = o; const db = env.DB; await schema(db);
  if (p === 'admin/zvusers') {
    const r = await db.prepare("SELECT u.uid, u.name, u.banned, p.handle, p.verified, (SELECT COUNT(*) FROM vid_videos v WHERE v.uid=u.uid AND v.status='approved') clips, (SELECT COUNT(*) FROM sc_dw_follow WHERE dst=u.uid) followers FROM sc_dw_user u LEFT JOIN zv_prof p ON p.uid=u.uid ORDER BY clips DESC, followers DESC LIMIT 300").all();
    return J({ ok: true, users: r.results || [] });
  }
  if (p === 'admin/zvverify' && M === 'POST') {
    const uid = String(b.uid || ''); if (!UID.test(uid)) return E('bad uid');
    if (!(await db.prepare('SELECT 1 FROM sc_dw_user WHERE uid=?').bind(uid).first())) return E('gone', 404);
    await db.prepare('INSERT OR IGNORE INTO zv_prof (uid,at) VALUES (?,?)').bind(uid, Date.now()).run();
    await db.prepare('UPDATE zv_prof SET verified=? WHERE uid=?').bind(b.on === false ? 0 : 1, uid).run();
    return J({ ok: true });
  }
  return E('not found', 404);
}
