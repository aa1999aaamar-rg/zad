// زاد v4.2 «مقاطع الأسبوع»: short Islamic clips. A clip is public as soon as its upload completes (عمار's choice, 24 Oct 4:25 AM: no pre-approval, the admin deletes)
// and is deleted automatically 7 days after upload. ≥3 reports auto-hide a clip or comment until the admin restores or deletes it.
// Storage: R2 binding VIDS (v/<id> video, p/<id> poster), D1 binding DB (vid_* tables, additive).
const MAX_BYTES = 50 * 1024 * 1024;   // upload cap per clip (the hosting accepts up to 100 MB per request)
const MAX_POSTER = 600 * 1024;
const MAX_DUR = 125;                  // seconds (2 min + slack for container rounding)
const LIFE = 7 * 864e5;               // public life after approval
const UP_PER_DAY = 3, UP_PER_DAY_IP = 30; // per device; per network address (mobile carriers share addresses, so this is only a spam brake)
const CM_PER_10MIN = 8, CM_MAX = 300;
const OFF_EXP = 32503680000000;      // year 3000: official episodes never expire (v5.4.1: user clips too)
// v5.4.1 retention (عمار approved 27 Oct 7:15 AM): clips stay; each account keeps its newest 30 (pinned never deleted);
// near the free 10 GB, the oldest + least-watched user clips go first. Official «حلقات عمار» (official=1 / uid zadammar) are never touched.
const KEEP_PER_USER = 30, OFF_UID = 'zadammar';
const GUARD_HI = 8e9, GUARD_LO = 7e9, GUARD_MAX_PER_RUN = 200;
const HIDE_AT = 3;                    // reports that auto-hide a clip or a comment
const PASS0 = '0dc95706c8e74e930ca90b7e8b46c7709504d885a7ec6f3da5ef94371fe91eee';            // sha256('zadvid:'+initial passcode); replaced by a salted hash when the admin changes it
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const rnd = n => hex(crypto.getRandomValues(new Uint8Array(n)));
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const E = (m, s = 400) => J({ ok: false, error: m }, s);

let ready = false;
async function schema(db) {
  if (ready) return;
  await db.batch([
    db.prepare("CREATE TABLE IF NOT EXISTS vid_videos (id TEXT PRIMARY KEY, title TEXT, name TEXT, dev TEXT, iph TEXT, ctype TEXT, size INTEGER, dur REAL, w INTEGER, h INTEGER, status TEXT, hidden INTEGER DEFAULT 0, reports INTEGER DEFAULT 0, likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, poster INTEGER DEFAULT 0, tok TEXT, created INTEGER, approved_at INTEGER, expires_at INTEGER)"),
    db.prepare('CREATE INDEX IF NOT EXISTS vid_videos_feed ON vid_videos(status, approved_at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_likes (vid TEXT, dev TEXT, at INTEGER, PRIMARY KEY (vid, dev))'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_comments (id TEXT PRIMARY KEY, vid TEXT, name TEXT, text TEXT, dev TEXT, at INTEGER, hidden INTEGER DEFAULT 0, reports INTEGER DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS vid_comments_vid ON vid_comments(vid, at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_reports (target TEXT, dev TEXT, at INTEGER, reason TEXT, PRIMARY KEY (target, dev))'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_meta (k TEXT PRIMARY KEY, v TEXT)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_rate (k TEXT PRIMARY KEY, n INTEGER, reset INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_sess (h TEXT PRIMARY KEY, exp INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS vid_admdev (id TEXT PRIMARY KEY, endpoint TEXT, p256dh TEXT, auth TEXT, at INTEGER)')
  ]);
  // v4.4.1: official «حلقات عمار» episodes (additive column; never expire, never auto-hidden)
  try {
    const ti = await db.prepare('PRAGMA table_info(vid_videos)').all();
    if (!(ti.results || []).some(c => c.name === 'official')) await db.prepare('ALTER TABLE vid_videos ADD COLUMN official INTEGER DEFAULT 0').run();
  } catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; }
  // v5.4.1: user clips no longer expire after 7 days — lift the old expiry on every approved clip once (data only, no schema change)
  // (once per isolate here, and again in the hourly purge to catch a clip finished by an older isolate during the rollout)
  try { await liftExpiry(db); } catch (e) { }
  ready = true;
}
async function meta(db, k) { const r = await db.prepare('SELECT v FROM vid_meta WHERE k=?').bind(k).first(); return r ? r.v : null; }
async function setMeta(db, k, v) { await db.prepare('INSERT INTO vid_meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k, String(v)).run(); }
let SALT = null;
async function salt(db) {
  if (SALT) return SALT;
  let s = await meta(db, 'salt');
  if (!s) { await db.prepare('INSERT OR IGNORE INTO vid_meta(k,v) VALUES(?,?)').bind('salt', rnd(16)).run(); s = await meta(db, 'salt'); }
  return (SALT = s);
}
async function devHash(db, req) {
  const d = String(req.headers.get('x-zad-dev') || '');
  if (!/^[a-f0-9]{24,64}$/.test(d)) return null;
  return (await sha((await salt(db)) + ':d:' + d)).slice(0, 32);
}
async function ipHash(db, req) { return (await sha((await salt(db)) + ':ip:' + (req.headers.get('cf-connecting-ip') || '0'))).slice(0, 32); }
// fixed-window counter; returns true when still under the limit (and counts this one)
async function rate(db, k, lim, win) {
  const now = Date.now();
  const r = await db.prepare('SELECT n, reset FROM vid_rate WHERE k=?').bind(k).first();
  if (r && r.reset > now) { if (r.n >= lim) return false; await db.prepare('UPDATE vid_rate SET n=n+1 WHERE k=?').bind(k).run(); return true; }
  await db.prepare('INSERT INTO vid_rate(k,n,reset) VALUES(?,1,?) ON CONFLICT(k) DO UPDATE SET n=1, reset=excluded.reset').bind(k, now + win).run();
  return true;
}
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const norm = s => String(s).toLowerCase().replace(/[\u064b-\u0652\u0640\u0670]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
  .replace(/[@4]/g, 'a').replace(/0/g, 'o').replace(/[1!]/g, 'i').replace(/\$/g, 's').replace(/(.)\1{2,}/g, '$1$1');
const BAD_AR = ['كس', 'كسك', 'كسمك', 'كس امك', 'زب', 'زبي', 'زبك', 'طيز', 'طيزك', 'نيك', 'نيكك', 'انيك', 'منيوك', 'منيوكه', 'شرموط', 'شرموطه', 'شراميط', 'قحبه', 'قحاب', 'متناك', 'متناكه', 'خول', 'عرص', 'معرص', 'ابن الكلب', 'ابن الحرام', 'يلعن ابوك', 'يلعن امك', 'يا كلب', 'يا حمار', 'يا حيوان', 'يا خنزير', 'يا وسخ', 'يا حقير', 'تفو عليك', 'سكس', 'بورن', 'خرا', 'منيك', 'انقلع', 'تبا لك'];
const BAD_EN = ['fuck', 'fck', 'fuk', 'shit', 'bitch', 'bastard', 'asshole', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'porn', 'sex', 'nigger', 'nigga', 'faggot', 'motherfucker', 'wtf', 'stfu', 'retard'];
function badWord(s) {
  const t = norm(s);
  const words = t.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const joined = ' ' + words.join(' ') + ' ';
  for (const b of BAD_AR) { const nb = norm(b); if (nb.includes(' ') ? joined.includes(' ' + nb + ' ') : words.some(w => w === nb || w === 'ال' + nb || w === 'و' + nb || w === 'يا' + nb)) return true; }
  const compact = t.replace(/[^a-z]/g, '');
  for (const b of BAD_EN) { if (b.length <= 4 ? words.includes(b) || words.includes(b + 's') : compact.includes(b)) return true; }
  return false;
}
const pub = r => ({ id: r.id, title: r.title, name: r.name, dur: r.dur, w: r.w, h: r.h, likes: r.likes, comments: r.comments, poster: !!r.poster, approved_at: r.approved_at, expires_at: r.expires_at, sz: r.size || 0, ...(r.official ? { official: 1 } : {}) });

/* ---------------- admin auth ---------------- */
async function passOk(db, code) {
  code = String(code || '');
  if (!code || code.length > 200) return false;
  const st = await meta(db, 'pass');
  if (st) { const [s, h] = st.split(':'); return (await sha(s + ':' + code)) === h; }
  return (await sha('zadvid:' + code.trim().toUpperCase())) === PASS0;
}
async function admin(db, req) {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || new URL(req.url).searchParams.get('a') || '';
  if (!/^[a-f0-9]{48}$/.test(t)) return false;
  const r = await db.prepare('SELECT exp FROM vid_sess WHERE h=?').bind(await sha('s:' + t)).first();
  return !!r && r.exp > Date.now();
}

/* ---------------- R2 streaming with Range (206) ---------------- */
async function serveObj(env, req, key, fallbackType) {
  const m = /^bytes=(\d*)-(\d*)$/.exec((req.headers.get('range') || '').trim());
  let rq = null;
  if (m && (m[1] || m[2])) {
    if (m[1]) { const a = +m[1]; rq = m[2] ? { offset: a, length: Math.max(1, +m[2] - a + 1) } : { offset: a }; }
    else rq = { suffix: +m[2] };
  }
  let obj;
  try { obj = await env.VIDS.get(key, rq ? { range: rq } : {}); }
  catch (e) { // range starts past the end
    const hd = await env.VIDS.head(key); if (!hd) return new Response('Not found', { status: 404 });
    return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + hd.size } });
  }
  if (!obj) return new Response('Not found', { status: 404 });
  const h = new Headers();
  obj.writeHttpMetadata(h);
  if (!h.get('content-type')) h.set('content-type', fallbackType);
  h.set('etag', obj.httpEtag); h.set('accept-ranges', 'bytes'); h.set('cache-control', 'private, max-age=3600'); h.set('x-content-type-options', 'nosniff');
  const size = obj.size; let status = 200;
  if (rq) {
    let off, len;
    if ('suffix' in rq) { len = Math.min(rq.suffix, size); off = size - len; }
    else { off = rq.offset; len = rq.length != null ? Math.min(rq.length, size - off) : size - off; }
    h.set('content-range', `bytes ${off}-${off + len - 1}/${size}`); h.set('content-length', String(len)); status = 206;
  } else h.set('content-length', String(size));
  return new Response(req.method === 'HEAD' ? null : obj.body, { status, headers: h });
}

/* ---------------- purge (hourly): stale pending/rejected/unfinished uploads + v5.4.1 retention (per-account cap, storage guard) ---------------- */
// v5.4.1: approved clips no longer expire. Storage bytes: running sum in vid_meta 'vid_bytes' (+ on upload, − on delete),
// recomputed hourly from an R2 listing (v/ + p/ objects; dw/ images counted apart) or, when the listing can't finish in budget, from D1 sizes.
export async function vidPurge(env, now = Date.now(), force = false, opt = {}) {
  const db = env.DB; if (!db || !env.VIDS) return { skip: 'nobind' };
  const t0 = Date.now(), until = t0 + Math.max(1500, Math.min(+opt.budgetMs || 8000, 20000));
  await schema(db);
  if (!force) { const last = +(await meta(db, 'last_purge') || 0); if (now - last < 3600e3) return { skip: 'hourly' }; }
  await setMeta(db, 'last_purge', now);
  const r = await db.prepare(`SELECT id FROM vid_videos WHERE (status IN ('pending','rejected') AND created<=?) OR (status='up' AND created<=?) LIMIT 60`).bind(now - LIFE, now - 864e5).all();
  const ids = (r.results || []).map(x => x.id);
  if (ids.length) await delVideos(env, ids);
  const out = { purged: ids.length };
  try { const n = await liftExpiry(db); if (n) out.lifted = n; } catch (e) { }
  if (Date.now() < until - 500) { try { const c = await capAll(env, false, until); out.cap = c.deleted; } catch (e) { out.cap_err = 1; } }
  if (Date.now() < until - 500) { try { const s = await measure(env, until); out.bytes = s.bytes; out.src = s.src; } catch (e) { out.meas_err = 1; } }
  if (Date.now() < until - 500) { try { const g = await guard(env, now, false, until); out.guard = g.deleted; } catch (e) { out.guard_err = 1; } }
  out.ms = Date.now() - t0;
  return out;
}
async function liftExpiry(db) {
  const x = await db.prepare("UPDATE vid_videos SET expires_at=? WHERE status='approved' AND (expires_at IS NULL OR expires_at<?)").bind(OFF_EXP, OFF_EXP).run();
  const n = (x.meta && x.meta.changes) || 0;
  if (n) await setMeta(db, 'noexp541', Date.now() + ':' + n);
  return n;
}
async function addBytes(db, n) {
  n = Math.round(+n || 0); if (!n) return;
  await db.prepare("INSERT INTO vid_meta(k,v) VALUES('vid_bytes',?) ON CONFLICT(k) DO UPDATE SET v=CAST(CAST(MAX(0, CAST(v AS INTEGER) + ?) AS INTEGER) AS TEXT)").bind(String(Math.max(0, n)), n).run();
}
const parseJ = s => { try { return JSON.parse(s || 'null'); } catch (e) { return null; } };
async function autoLog(db, kind, n, ids) { // every automatic deletion: a running total + the last 20 events (admin: «حذف تلقائي: N»)
  if (!n) return;
  await db.prepare("INSERT INTO vid_meta(k,v) VALUES('auto_del',?) ON CONFLICT(k) DO UPDATE SET v=CAST(CAST(v AS INTEGER) + ? AS TEXT)").bind(String(n), n).run();
  await db.prepare("INSERT INTO vid_meta(k,v) VALUES('auto_del_' || ?, ?) ON CONFLICT(k) DO UPDATE SET v=CAST(CAST(v AS INTEGER) + ? AS TEXT)").bind(kind, String(n), n).run();
  const log = parseJ(await meta(db, 'auto_del_log')) || [];
  log.unshift({ at: Date.now(), k: kind, n, ids: (ids || []).slice(0, 10) });
  await setMeta(db, 'auto_del_log', JSON.stringify(log.slice(0, 20)));
}
async function pinsOf(db, uid) { // pinned clip ids (zv_prof.pins, v5.4); none when the table doesn't exist yet
  try {
    const rows = uid ? [await db.prepare('SELECT pins FROM zv_prof WHERE uid=?').bind(uid).first()] : ((await db.prepare("SELECT pins FROM zv_prof WHERE pins IS NOT NULL AND pins!='[]' AND pins!=''").all()).results || []);
    const s = new Set(); for (const x of rows) for (const id of (x && parseJ(x.pins)) || []) s.add(String(id)); return s;
  } catch (e) { return new Set(); }
}
// keep the newest KEEP_PER_USER non-pinned, non-official clips of one account; delete the oldest extras (same full delete as the admin/creator delete)
async function capUser(env, uid, dry, keepId) {
  const db = env.DB;
  if (!uid || uid === OFF_UID) return { uid, n: 0, extra: [] };
  const pins = await pinsOf(db, uid);
  const rows = ((await db.prepare("SELECT id, size FROM vid_videos WHERE uid=? AND status='approved' AND COALESCE(official,0)=0 AND COALESCE(dev,'')!='official' ORDER BY created DESC, approved_at DESC, id DESC").bind(uid).all()).results || []).filter(x => !pins.has(x.id));
  const extra = rows.slice(KEEP_PER_USER).map(x => x.id).filter(id => id !== keepId);
  if (!dry && extra.length) for (let i = 0; i < extra.length; i += 40) { const b = extra.slice(i, i + 40); await delVideos(env, b); await autoLog(db, 'cap', b.length, b); }
  return { uid, n: rows.length, extra, bytes: rows.slice(KEEP_PER_USER).reduce((a, x) => a + (x.size || 0), 0) };
}
async function capAll(env, dry, until) { // hourly catch-up for any account over the cap
  const db = env.DB;
  const over = ((await db.prepare(`SELECT uid, COUNT(*) n FROM vid_videos WHERE status='approved' AND COALESCE(official,0)=0 AND uid IS NOT NULL AND uid!=? AND COALESCE(dev,'')!='official' GROUP BY uid HAVING n>?`).bind(OFF_UID, KEEP_PER_USER).all()).results || []);
  let deleted = 0, users = 0, bytes = 0;
  for (const o of over) {
    if (until && Date.now() > until - 300) break;
    const c = await capUser(env, o.uid, dry);
    if (c.extra.length) { users++; deleted += c.extra.length; bytes += c.bytes || 0; }
  }
  return { deleted, users, bytes, over: over.length };
}
// storage measure: R2 listing (all prefixes, ≤ 10 pages, inside the time budget) else D1 sizes; writes 'vid_bytes' and 'r2_bytes'
async function measure(env, until, dry) {
  const db = env.DB;
  const d1 = await db.prepare("SELECT COALESCE(SUM(size),0) b, COUNT(*) n, COALESCE(SUM(poster),0) np FROM vid_videos WHERE status IN ('approved','up','pending','rejected')").first();
  let vid = 0, dw = 0, other = 0, objs = 0, cur, done = false;
  try {
    for (let i = 0; i < 10; i++) {
      if (until && Date.now() > until - 400) break;
      const l = await env.VIDS.list({ limit: 1000, cursor: cur });
      for (const o of l.objects || []) { objs++; const k = o.key || ''; if (k.startsWith('v/') || k.startsWith('p/')) vid += o.size; else if (k.startsWith('dw/')) dw += o.size; else other += o.size; }
      if (!l.truncated) { done = true; break; }
      cur = l.cursor;
    }
  } catch (e) { done = false; }
  const s = done ? { bytes: vid, total: vid + dw + other, dw, other, objects: objs, src: 'r2' } : { bytes: d1.b || 0, total: null, src: 'd1' };
  s.d1 = d1.b || 0; s.at = Date.now();
  if (!dry) { await setMeta(db, 'vid_bytes', String(s.bytes)); await setMeta(db, 'r2_bytes', JSON.stringify(s)); }
  return s;
}
// storage guard: above ~8 GB, delete user clips by lowest score (views weighted by recency: oldest + least-watched first) until under ~7 GB
async function guard(env, now, dry, until, ms) {
  const db = env.DB;
  const run = ms ? ms.bytes : +(await meta(db, 'vid_bytes') || 0);
  const r2 = ms || parseJ(await meta(db, 'r2_bytes')) || {};
  const level = Math.max(run, r2.total || 0); // the whole bucket (dw/ images too) is what the free tier counts
  const res = { level, hi: GUARD_HI, lo: GUARD_LO, deleted: 0, bytes: 0 };
  if (level <= GUARD_HI) return res;
  const pins = await pinsOf(db);
  const score = `((COALESCE(views,0) + COALESCE(likes,0)*3 + 1.0) / ((${now} - COALESCE(approved_at, created, ${now})) / 86400000.0 + 1))`;
  const rows = ((await db.prepare(`SELECT id, size FROM vid_videos WHERE status='approved' AND COALESCE(official,0)=0 AND COALESCE(dev,'')!='official' AND (uid IS NULL OR uid!=?) ORDER BY ${score} ASC, created ASC LIMIT ?`).bind(OFF_UID, GUARD_MAX_PER_RUN + pins.size).all()).results || []).filter(x => !pins.has(x.id));
  let left = level; const pick = [];
  for (const x of rows) { if (left <= GUARD_LO || pick.length >= GUARD_MAX_PER_RUN) break; pick.push(x.id); left -= (x.size || 0); }
  res.would = pick.length; res.after = left;
  if (dry || !pick.length) return res;
  for (let i = 0; i < pick.length; i += 20) {
    if (until && Date.now() > until - 300) break;
    const b = pick.slice(i, i + 20); await delVideos(env, b); await autoLog(db, 'guard', b.length, b); res.deleted += b.length;
  }
  return res;
}
// dry run: what each rule would delete right now (nothing is deleted, nothing is written)
export async function vidRetentionDry(env, now = Date.now()) {
  const db = env.DB; if (!db || !env.VIDS) return { skip: 'nobind' };
  await schema(db);
  const until = Date.now() + 8000;
  const s = await measure(env, until, true);
  const cap = await capAll(env, true, until);
  const g = await guard(env, now, true, until, s);
  const st = await db.prepare("SELECT COUNT(*) n, SUM(CASE WHEN COALESCE(official,0)=1 THEN 1 ELSE 0 END) off, MIN(CASE WHEN COALESCE(official,0)=0 THEN approved_at END) oldest FROM vid_videos WHERE status='approved'").first();
  const old = await db.prepare("SELECT COUNT(*) n FROM vid_videos WHERE status='approved' AND COALESCE(official,0)=0 AND approved_at<?").bind(now - LIFE).first();
  const oldOne = await db.prepare("SELECT id FROM vid_videos WHERE status='approved' AND COALESCE(official,0)=0 AND hidden=0 AND approved_at<? ORDER BY approved_at LIMIT 1").bind(now - LIFE).first();
  return { ok: true, storage: s, running_vid_bytes: +(await meta(db, 'vid_bytes') || 0), cap_would_delete: cap.deleted, cap_accounts_over: cap.over, guard: g,
    clips: st.n, official: st.off || 0, user_oldest_at: st.oldest, user_older_than_7d: old.n, sample_old: oldOne && oldOne.id, auto_del: +(await meta(db, 'auto_del') || 0), noexp: await meta(db, 'noexp541'), last_purge: +(await meta(db, 'last_purge') || 0) };
}
// v5.4: rows of the «مقاطع زاد» tables that belong to a clip (set by srv/zv.js once its tables exist)
const zvDelRows = (db, id) => [db.prepare('DELETE FROM zv_cml WHERE cid IN (SELECT id FROM vid_comments WHERE vid=?)').bind(id), db.prepare('DELETE FROM zv_view WHERE vid=?').bind(id), db.prepare('DELETE FROM zv_save WHERE vid=?').bind(id), db.prepare('DELETE FROM zv_hide WHERE vid=?').bind(id), db.prepare('DELETE FROM zv_tag WHERE vid=?').bind(id),
  db.prepare("DELETE FROM sc_dw_notif WHERE pid=? OR pid LIKE ?").bind('v:' + id, 'v:' + id + ':%')];
async function delVideos(env, ids) {
  const db = env.DB;
  let gone = 0; try { const s = await db.prepare(`SELECT COALESCE(SUM(size),0) b FROM vid_videos WHERE id IN (${ids.map(() => '?').join(',')})`).bind(...ids).first(); gone = s.b || 0; } catch (e) { }
  await env.VIDS.delete(ids.flatMap(id => ['v/' + id, 'p/' + id]));
  if (gone) { try { await addBytes(db, -gone); } catch (e) { } }
  try { await db.batch(ids.flatMap(id => zvDelRows(db, id))); } catch (e) { } // v5.4 tables may not exist yet in this database
  const st = [];
  for (const id of ids) {
    st.push(db.prepare('DELETE FROM vid_likes WHERE vid=?').bind(id));
    st.push(db.prepare("DELETE FROM vid_reports WHERE target=? OR target IN (SELECT 'c:'||id FROM vid_comments WHERE vid=?)").bind('v:' + id, id));
    st.push(db.prepare('DELETE FROM vid_comments WHERE vid=?').bind(id));
    st.push(db.prepare('DELETE FROM vid_videos WHERE id=?').bind(id));
  }
  await db.batch(st);
}

/* ---------------- admin push (optional): the admin's own device gets a push when a clip waits ---------------- */
async function notifyAdmins(env, deps, title) {
  try {
    const db = env.DB;
    const r = await db.prepare('SELECT * FROM vid_admdev LIMIT 5').all();
    for (const d of r.results || []) {
      const res = await deps.sendPush(db, d, { t: 'مقطع جديد نُشر في زاد', b: (title ? '«' + title + '» · ' : '') + 'اضغط للمراجعة أو الحذف', u: '/admin/videos', tag: 'zvadmin' }, 86400, 'normal');
      if (res && (res.status === 404 || res.status === 410)) await db.prepare('DELETE FROM vid_admdev WHERE id=?').bind(d.id).run();
      await setMeta(db, 'last_notify', Date.now() + ':' + (res && res.status));
    }
  } catch (e) { }
}

/* ---------------- router ---------------- */
export { admin as adminOk, badWord, schema as vidSchema, devHash as vidDevHash, ipHash as vidIpHash, rate as vidRate, delVideos as vidDelete, clean as vidClean };
export const VID_LIMITS = { MAX_BYTES, MAX_DUR, LIFE, KEEP_PER_USER, UP_PER_DAY, UP_PER_DAY_IP, CM_PER_10MIN, CM_MAX, HIDE_AT }; // the same passcode session can guard other admin pages (Authorization: Bearer <session>)
export async function videos(u, req, env, ctx, deps) {
  if (u.pathname === '/admin/videos' || u.pathname === '/admin/videos/') {
    return new Response(deps.ADMIN_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY' } });
  }
  const db = env.DB;
  if (!db || !env.VIDS) return E('storage not bound', 500);
  await schema(db);
  const parts = u.pathname.slice('/api/videos/'.length).split('/');
  const p = parts[0], id = (parts[1] || '').replace(/[^a-z0-9]/g, '');
  const now = Date.now();
  const M = req.method;

  // ---- media ----
  if ((p === 'v' || p === 'p') && (M === 'GET' || M === 'HEAD')) {
    const r = await db.prepare('SELECT status, hidden, expires_at, poster FROM vid_videos WHERE id=?').bind(id).first();
    if (!r) return new Response('Not found', { status: 404 });
    const isPublic = r.status === 'approved' && !r.hidden && r.expires_at > now;
    if (!isPublic && !(await admin(db, req))) return new Response('Not found', { status: 404 });
    const res = await serveObj(env, req, p + '/' + id, p === 'v' ? 'video/mp4' : 'image/jpeg');
    if (res.status < 300) {
      if (u.searchParams.get('s')) res.headers.set('cache-control', 'private, max-age=86400'); // versioned URL (?s=<size>) changes when a file is replaced
      if (p === 'v' && u.searchParams.get('dl') === '1') { // «تحميل»: save as a file
        const t = await db.prepare('SELECT * FROM vid_videos WHERE id=?').bind(id).first();
        if (t && t.dl === 0 && !(await admin(db, req))) return new Response('Download off', { status: 403 }); // v5.4: the creator turned downloads off
        const nm = (String((t && t.title) || 'zad').replace(/[\\/:*?"<>|#%\u0000-\u001f]+/g, ' ').trim().slice(0, 60) || 'zad') + '.mp4';
        res.headers.set('content-disposition', "attachment; filename=\"zad-" + id + ".mp4\"; filename*=UTF-8''" + encodeURIComponent(nm));
      }
    }
    return res;
  }

  // ---- public feed ----
  if (p === 'feed' && M === 'GET') {
    const dev = await devHash(db, req);
    const before = +u.searchParams.get('before') || 9e15;
    const off = u.searchParams.get('o') === '1';
    // v4.4.2: one feed. The newest 3 official episodes are pinned on top of the first page; older episodes flow in by date with the week's clips (no separate tab).
    const pin = off ? [] : ((await db.prepare("SELECT * FROM vid_videos WHERE status='approved' AND hidden=0 AND official=1 AND approved_at<=? ORDER BY approved_at DESC LIMIT 3").bind(now).all()).results || []);
    const pinIds = pin.map(x => x.id);
    const r = await db.prepare(`SELECT * FROM vid_videos WHERE status='approved' AND hidden=0 AND expires_at>? AND approved_at<? AND approved_at<=${now} ${off ? 'AND official=1' : pinIds.length ? `AND id NOT IN (${pinIds.map(() => '?').join(',')})` : ''} ORDER BY approved_at DESC LIMIT 15`).bind(now, before, ...(off ? [] : pinIds)).all();
    let items = (r.results || []).map(pub);
    const more = items.length === 15 ? items[items.length - 1].approved_at : null;
    if (!off && !u.searchParams.get('before')) items = pin.map(pub).concat(items);
    if (dev && items.length) {
      const q = await db.prepare(`SELECT vid FROM vid_likes WHERE dev=? AND vid IN (${items.map(() => '?').join(',')})`).bind(dev, ...items.map(x => x.id)).all();
      const L = new Set((q.results || []).map(x => x.vid)); items.forEach(x => x.liked = L.has(x.id));
    }
    return J({ ok: true, now, items, more });
  }
  if (p === 'item' && M === 'GET') {
    const r = await db.prepare("SELECT * FROM vid_videos WHERE id=? AND status='approved' AND hidden=0 AND expires_at>? AND approved_at<=?").bind(id, now, now).first();
    if (!r) return E('gone', 404);
    const it = pub(r); const dev = await devHash(db, req);
    if (dev) it.liked = !!(await db.prepare('SELECT 1 x FROM vid_likes WHERE vid=? AND dev=?').bind(id, dev).first());
    return J({ ok: true, now, item: it });
  }
  if (p === 'mine' && M === 'GET') { // the uploader's own clips and their state
    const dev = await devHash(db, req); if (!dev) return E('device');
    const r = await db.prepare("SELECT id,title,status,hidden,created,expires_at FROM vid_videos WHERE dev=? AND status!='up' ORDER BY created DESC LIMIT 10").bind(dev).all();
    return J({ ok: true, now, items: r.results || [] });
  }

  // ---- upload: init → PUT file → PUT poster ----
  if (p === 'init' && M === 'POST') {
    const dev = await devHash(db, req); if (!dev) return E('device');
    const b = await req.json().catch(() => ({}));
    const title = clean(b.title, 80), name = clean(b.name, 30);
    const size = Math.floor(+b.size || 0), dur = +b.dur || 0;
    const type = /^video\/(mp4|quicktime|webm|3gpp|x-m4v)$/.test(String(b.type || '')) ? String(b.type) : '';
    if (title.length < 2) return E('title'); if (name.length < 2) return E('name');
    if (badWord(title) || badWord(name)) return E('bad');
    if (!type) return E('type');
    if (!(size > 0) || size > MAX_BYTES) return E('size');
    if (!(dur > 0) || dur > MAX_DUR) return E('dur');
    const iph = await ipHash(db, req);
    if (!(await rate(db, 'up:' + dev, UP_PER_DAY, 864e5))) return E('rate', 429);
    if (!(await rate(db, 'upip:' + iph, UP_PER_DAY_IP, 864e5))) return E('rate', 429);
    const vid = rnd(8), tok = rnd(16);
    await db.prepare("INSERT INTO vid_videos (id,title,name,dev,iph,ctype,size,dur,w,h,status,tok,created) VALUES (?,?,?,?,?,?,?,?,?,?,'up',?,?)")
      .bind(vid, title, name, dev, iph, type, size, Math.round(dur * 10) / 10, Math.floor(+b.w || 0) || null, Math.floor(+b.h || 0) || null, await sha(tok), now).run();
    return J({ ok: true, id: vid, t: tok, max: MAX_BYTES });
  }
  if ((p === 'file' || p === 'poster') && (M === 'PUT' || M === 'POST')) {
    const r = await db.prepare('SELECT * FROM vid_videos WHERE id=?').bind(id).first();
    if (!r || !r.tok || r.tok !== (await sha(u.searchParams.get('t') || ''))) return E('token', 403);
    const len = +(req.headers.get('content-length') || u.searchParams.get('n') || 0);
    if (p === 'file') {
      if (r.status !== 'up') return E('done', 409);
      if (!(len > 0) || len > MAX_BYTES || len > r.size + 1024 * 1024) return E('size', 413); // r.size = the size declared at init (an upper bound when the phone compresses after init)
      const { readable, writable } = new FixedLengthStream(len);
      const pipe = req.body.pipeTo(writable);
      const ct0 = String(req.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      const ct = /^video\/(mp4|quicktime|webm|3gpp|x-m4v)$/.test(ct0) ? ct0 : r.ctype;
      await Promise.all([env.VIDS.put('v/' + id, readable, { httpMetadata: { contentType: ct === 'video/quicktime' ? 'video/mp4' : ct } }), pipe]);
      const at = r.pub_at && r.pub_at > now ? Math.min(r.pub_at, now + 14 * 864e5) : now; // v5.4: scheduled posting (approved_at in the future = not listed yet)
      await db.prepare("UPDATE vid_videos SET status='approved', size=?, ctype=?, created=?, approved_at=?, expires_at=?, tok=NULL WHERE id=?").bind(len, ct, now, at, OFF_EXP, id).run();
      ctx.waitUntil(notifyAdmins(env, deps, r.title));
      ctx.waitUntil((async () => { try { await addBytes(db, len); if (r.uid && !r.official && r.uid !== OFF_UID && r.dev !== 'official') await capUser(env, r.uid, false, id); } catch (e) { } })()); // v5.4.1: keep the newest 30
      return J({ ok: true, status: 'approved', approved_at: at, expires_at: OFF_EXP });
    }
    if (!(len > 0) || len > MAX_POSTER) return E('size', 413);
    if (r.status !== 'up') return E('done', 409); // the client sends the poster first, then the video (which publishes it)
    const { readable, writable } = new FixedLengthStream(len);
    const pipe = req.body.pipeTo(writable);
    await Promise.all([env.VIDS.put('p/' + id, readable, { httpMetadata: { contentType: 'image/jpeg' } }), pipe]);
    await db.prepare('UPDATE vid_videos SET poster=1 WHERE id=?').bind(id).run();
    ctx.waitUntil(addBytes(db, len).catch(() => { }));
    return J({ ok: true });
  }

  // ---- interactions ----
  if (p === 'like' && M === 'POST') {
    const dev = await devHash(db, req); if (!dev) return E('device');
    const v = await db.prepare("SELECT id FROM vid_videos WHERE id=? AND status='approved'").bind(id).first(); if (!v) return E('gone', 404);
    const b = await req.json().catch(() => ({}));
    const has = await db.prepare('SELECT 1 x FROM vid_likes WHERE vid=? AND dev=?').bind(id, dev).first();
    const want = b.on == null ? !has : !!b.on;
    if (want && !has) await db.batch([db.prepare('INSERT OR IGNORE INTO vid_likes(vid,dev,at) VALUES(?,?,?)').bind(id, dev, now), db.prepare('UPDATE vid_videos SET likes=(SELECT COUNT(*) FROM vid_likes WHERE vid=?) WHERE id=?').bind(id, id)]);
    if (!want && has) await db.batch([db.prepare('DELETE FROM vid_likes WHERE vid=? AND dev=?').bind(id, dev), db.prepare('UPDATE vid_videos SET likes=(SELECT COUNT(*) FROM vid_likes WHERE vid=?) WHERE id=?').bind(id, id)]);
    const c = await db.prepare('SELECT likes FROM vid_videos WHERE id=?').bind(id).first();
    return J({ ok: true, liked: want, likes: c ? c.likes : 0 });
  }
  if (p === 'comments' && M === 'GET') {
    const r = await db.prepare('SELECT id,name,text,at FROM vid_comments WHERE vid=? AND hidden=0 ORDER BY at DESC LIMIT 100').bind(id).all();
    return J({ ok: true, items: r.results || [] });
  }
  if (p === 'comment' && M === 'POST') {
    const dev = await devHash(db, req); if (!dev) return E('device');
    const v = await db.prepare("SELECT id FROM vid_videos WHERE id=? AND status='approved' AND hidden=0").bind(id).first(); if (!v) return E('gone', 404);
    const b = await req.json().catch(() => ({}));
    const name = clean(b.name, 30), text = clean(b.text, CM_MAX + 1);
    if (name.length < 2) return E('name'); if (!text) return E('empty'); if (text.length > CM_MAX) return E('long');
    if (badWord(text) || badWord(name)) return E('bad');
    if (/https?:\/\/|www\./i.test(text)) return E('link');
    if (!(await rate(db, 'cm:' + dev, CM_PER_10MIN, 600e3))) return E('rate', 429);
    const cid = rnd(8);
    await db.batch([db.prepare('INSERT INTO vid_comments (id,vid,name,text,dev,at) VALUES (?,?,?,?,?,?)').bind(cid, id, name, text, dev, now),
      db.prepare('UPDATE vid_videos SET comments=(SELECT COUNT(*) FROM vid_comments WHERE vid=? AND hidden=0) WHERE id=?').bind(id, id)]);
    return J({ ok: true, item: { id: cid, name, text, at: now } });
  }
  if ((p === 'report' || p === 'creport') && M === 'POST') {
    const dev = await devHash(db, req); if (!dev) return E('device');
    const b = await req.json().catch(() => ({}));
    const isV = p === 'report', target = (isV ? 'v:' : 'c:') + id;
    const ex = isV ? await db.prepare('SELECT id FROM vid_videos WHERE id=?').bind(id).first() : await db.prepare('SELECT vid FROM vid_comments WHERE id=?').bind(id).first();
    if (!ex) return E('gone', 404);
    if (!(await rate(db, 'rp:' + dev, 30, 864e5))) return E('rate', 429);
    const ins = await db.prepare('INSERT OR IGNORE INTO vid_reports (target,dev,at,reason) VALUES (?,?,?,?)').bind(target, dev, now, clean(b.reason, 40)).run();
    if (ins.meta.changes) {
      if (isV) await db.prepare('UPDATE vid_videos SET reports=reports+1, hidden=CASE WHEN reports+1>=? AND COALESCE(official,0)=0 THEN 1 ELSE hidden END WHERE id=?').bind(HIDE_AT, id).run();
      else {
        await db.prepare('UPDATE vid_comments SET reports=reports+1, hidden=CASE WHEN reports+1>=? THEN 1 ELSE hidden END WHERE id=?').bind(HIDE_AT, id).run();
        await db.prepare('UPDATE vid_videos SET comments=(SELECT COUNT(*) FROM vid_comments WHERE vid=? AND hidden=0) WHERE id=?').bind(ex.vid, ex.vid).run();
      }
    }
    return J({ ok: true });
  }

  // ---- admin ----
  if (p === 'admin') {
    const op = parts[1] || '';
    if (op === 'login' && M === 'POST') {
      const iph = await ipHash(db, req);
      const b = await req.json().catch(() => ({}));
      const r0 = await db.prepare('SELECT n, reset FROM vid_rate WHERE k=?').bind('login:' + iph).first();
      if (r0 && r0.reset > now && r0.n >= 10) return E('rate', 429);
      if (!(await passOk(db, b.code))) { await rate(db, 'login:' + iph, 10, 3600e3); return E('wrong', 403); }
      const s = rnd(24);
      await db.batch([db.prepare('INSERT INTO vid_sess(h,exp) VALUES(?,?)').bind(await sha('s:' + s), now + 30 * 864e5), db.prepare('DELETE FROM vid_sess WHERE exp<?').bind(now)]);
      return J({ ok: true, s });
    }
    if (!(await admin(db, req))) return E('auth', 401);
    if (op === 'official' && M === 'POST') { // add an official «حلقات عمار» episode: multipart video, poster, title [, name, dur, w, h]
      const fd = await req.formData().catch(() => null); if (!fd) return E('form');
      const f = fd.get('video'), pf = fd.get('poster'), title = clean(fd.get('title'), 80), name = clean(fd.get('name') || 'عمار', 30);
      if (!f || typeof f === 'string' || !f.size) return E('video');
      if (f.size > MAX_BYTES) return E('size', 413);
      if (title.length < 2) return E('title');
      const ct = /^video\/(mp4|webm)$/.test(f.type) ? f.type : 'video/mp4';
      const vid = rnd(8);
      await env.VIDS.put('v/' + vid, await f.arrayBuffer(), { httpMetadata: { contentType: ct } });
      let poster = 0;
      if (pf && typeof pf !== 'string' && pf.size && pf.size <= 2 * MAX_POSTER) { await env.VIDS.put('p/' + vid, await pf.arrayBuffer(), { httpMetadata: { contentType: /png/.test(pf.type) ? 'image/png' : 'image/jpeg' } }); poster = 1; }
      const num = k => { const x = +fd.get(k); return isFinite(x) && x > 0 ? x : null; };
      await db.prepare("INSERT INTO vid_videos (id,title,name,dev,iph,ctype,size,dur,w,h,status,hidden,reports,likes,comments,poster,tok,created,approved_at,expires_at,official) VALUES (?,?,?,'official',NULL,?,?,?,?,?,'approved',0,0,0,0,?,NULL,?,?,?,1)")
        .bind(vid, title, name, ct, f.size, num('dur'), num('w') && Math.round(num('w')), num('h') && Math.round(num('h')), poster, now, now, OFF_EXP).run();
      try { await addBytes(db, f.size + (poster ? pf.size : 0)); } catch (e) { }
      return J({ ok: true, id: vid, poster: !!poster, link: '/#video/' + vid });
    }
    if (op === 'replace' && M === 'POST') { // v4.4.2: swap a clip's file (and poster) for a web-optimised copy; same id, likes and comments
      const fd = await req.formData().catch(() => null); if (!fd) return E('form');
      const vid = String(fd.get('id') || '').replace(/[^a-z0-9]/g, '');
      const row = vid && await db.prepare('SELECT id FROM vid_videos WHERE id=?').bind(vid).first();
      if (!row) return E('gone', 404);
      const f = fd.get('video'), pf = fd.get('poster');
      const num = k => { const x = +fd.get(k); return isFinite(x) && x > 0 ? x : null; };
      let size = null;
      if (f && typeof f !== 'string' && f.size) {
        if (f.size > MAX_BYTES) return E('size', 413);
        await env.VIDS.put('v/' + vid, await f.arrayBuffer(), { httpMetadata: { contentType: 'video/mp4' } }); size = f.size;
      }
      let poster = 0;
      if (pf && typeof pf !== 'string' && pf.size && pf.size <= 2 * MAX_POSTER) { await env.VIDS.put('p/' + vid, await pf.arrayBuffer(), { httpMetadata: { contentType: /png/.test(pf.type) ? 'image/png' : 'image/jpeg' } }); poster = 1; }
      await db.prepare('UPDATE vid_videos SET size=COALESCE(?,size), ctype=CASE WHEN ? IS NULL THEN ctype ELSE \'video/mp4\' END, dur=COALESCE(?,dur), w=COALESCE(?,w), h=COALESCE(?,h), poster=MAX(poster,?) WHERE id=?')
        .bind(size, size, num('dur'), num('w') && Math.round(num('w')), num('h') && Math.round(num('h')), poster, vid).run();
      return J({ ok: true, id: vid, size, poster: !!poster });
    }
    const b = M === 'POST' ? await req.json().catch(() => ({})) : {};
    if (op === 'list') {
      const q = s => db.prepare(s).all().then(r => r.results || []);
      const cols = 'id,title,name,ctype,size,dur,w,h,status,hidden,reports,likes,comments,poster,created,approved_at,expires_at,official';
      const [live, cm, st] = await Promise.all([
        q(`SELECT ${cols} FROM vid_videos WHERE status='approved' ORDER BY approved_at DESC LIMIT 200`),
        q('SELECT c.id,c.vid,c.name,c.text,c.at,c.hidden,c.reports,v.title FROM vid_comments c LEFT JOIN vid_videos v ON v.id=c.vid ORDER BY c.at DESC LIMIT 200'),
        db.prepare("SELECT COUNT(*) n, COALESCE(SUM(size),0) bytes FROM vid_videos WHERE status='approved'").first()
      ]);
      const devs = await db.prepare('SELECT COUNT(*) n FROM vid_admdev').first();
      const ln = await meta(db, 'last_notify');
      const ad = +(await meta(db, 'auto_del') || 0), vb = +(await meta(db, 'vid_bytes') || 0), r2b = parseJ(await meta(db, 'r2_bytes'));
      return J({ ok: true, now, live, comments: cm, stats: { clips: st.n, bytes: st.bytes, max_bytes: MAX_BYTES, admin_devices: devs.n, last_notify: ln, auto_del: ad, vid_bytes: vb, r2: r2b, keep: KEEP_PER_USER, guard_hi: GUARD_HI } });
    }
    if (op === 'act' && M === 'POST') {
      const vid = String(b.id || '').replace(/[^a-z0-9]/g, '');
      const r = await db.prepare('SELECT id,status FROM vid_videos WHERE id=?').bind(vid).first(); if (!r) return E('gone', 404);
      if (b.op === 'delete') await delVideos(env, [vid]);
      else if (b.op === 'unhide') { await db.prepare('UPDATE vid_videos SET hidden=0, reports=0 WHERE id=?').bind(vid).run(); await db.prepare('DELETE FROM vid_reports WHERE target=?').bind('v:' + vid).run(); }
      else if (b.op === 'hide') await db.prepare('UPDATE vid_videos SET hidden=1 WHERE id=?').bind(vid).run();
      else if (b.op === 'expire') await db.prepare('UPDATE vid_videos SET expires_at=? WHERE id=?').bind(+b.at || now - 1000, vid).run(); // test helper: set the expiry time
      else return E('op');
      return J({ ok: true });
    }
    if (op === 'cact' && M === 'POST') {
      const cid = String(b.id || '').replace(/[^a-z0-9]/g, '');
      const c = await db.prepare('SELECT vid FROM vid_comments WHERE id=?').bind(cid).first(); if (!c) return E('gone', 404);
      if (b.op === 'delete') await db.batch([db.prepare('DELETE FROM vid_comments WHERE id=?').bind(cid), db.prepare('DELETE FROM vid_reports WHERE target=?').bind('c:' + cid)]);
      else if (b.op === 'unhide') await db.batch([db.prepare('UPDATE vid_comments SET hidden=0, reports=0 WHERE id=?').bind(cid), db.prepare('DELETE FROM vid_reports WHERE target=?').bind('c:' + cid)]);
      else return E('op');
      await db.prepare('UPDATE vid_videos SET comments=(SELECT COUNT(*) FROM vid_comments WHERE vid=? AND hidden=0) WHERE id=?').bind(c.vid, c.vid).run();
      return J({ ok: true });
    }
    if (op === 'pass' && M === 'POST') {
      if (!(await passOk(db, b.old))) return E('wrong', 403);
      const n = String(b.new || '');
      if (n.length < 8 || n.length > 100) return E('short');
      const s = rnd(16);
      await setMeta(db, 'pass', s + ':' + (await sha(s + ':' + n)));
      await db.prepare('DELETE FROM vid_sess').run(); // every device signs in again with the new passcode
      return J({ ok: true });
    }
    if (op === 'notify' && M === 'POST') {
      if (b.off) { await db.prepare('DELETE FROM vid_admdev WHERE id=?').bind((await sha(String(b.endpoint || ''))).slice(0, 32)).run(); return J({ ok: true }); }
      const s = b.sub || {}, k = s.keys || {};
      if (!/^https:\/\//.test(String(s.endpoint || '')) || !k.p256dh || !k.auth) return E('sub');
      const host = new URL(s.endpoint).hostname;
      if (!/(^|\.)(googleapis\.com|google\.com|push\.apple\.com|mozilla\.com|mozaws\.net|notify\.windows\.com)$/.test(host)) return E('sub');
      await db.prepare('INSERT INTO vid_admdev(id,endpoint,p256dh,auth,at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, at=excluded.at')
        .bind((await sha(s.endpoint)).slice(0, 32), s.endpoint, String(k.p256dh), String(k.auth), now).run();
      return J({ ok: true });
    }
    if (op === 'logout' && M === 'POST') { const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''); await db.prepare('DELETE FROM vid_sess WHERE h=?').bind(await sha('s:' + t)).run(); return J({ ok: true }); }
    if (op === 'r2' && M === 'GET') { // storage check: objects in the bucket, and whether one clip's files still exist
      const id2 = (u.searchParams.get('id') || '').replace(/[^a-z0-9]/g, '');
      let n = 0, bytes = 0, cur;
      for (let i = 0; i < 5; i++) { const l = await env.VIDS.list({ limit: 1000, cursor: cur }); for (const o of l.objects) { n++; bytes += o.size; } if (!l.truncated) break; cur = l.cursor; }
      const out = { ok: true, objects: n, bytes };
      if (id2) { out.v = !!(await env.VIDS.head('v/' + id2)); out.p = !!(await env.VIDS.head('p/' + id2)); }
      return J(out);
    }
    if (op === 'purge' && M === 'POST') return J({ ok: true, r: await vidPurge(env, now, true) });
    if (op === 'retention' && M === 'GET') return J(await vidRetentionDry(env, now)); // v5.4.1 dry run: nothing deleted
  }
  return E('not found', 404);
}
