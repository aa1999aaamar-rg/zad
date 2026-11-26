// زاد v5.4.5 — «إرسال إشعار» from the private dashboard (broadcast to push subscribers) + admin test devices.
// All /api/zdash/bc* paths are guarded by the dashboard token in zdash.js before they reach here (404 otherwise).
// Tables (additive): zbc_log (one row per broadcast/test, with its recipient id list and progress), zbc_adm (devices
// marked «هذا جهازي»), zbc_kv (the short-lived pairing code). Sending runs in chunks: the first chunk in waitUntil right
// after the request, the rest from the dashboard's own polling (/bc/step) and the every-minute cron tick, so big lists finish
// without hitting a single invocation's CPU/subrequest limits. A subscription that answers 404/410 is deleted.
export const ZBC = { deps: null }; // { sendPush, isGone } set by worker-src.js
const CHUNK = 40, MAX_PER_HOUR = 5, TEST_PER_HOUR = 30, LOCK_MS = 60e3;
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
const enc = new TextEncoder();
async function sha(s) { const h = await crypto.subtle.digest('SHA-256', enc.encode(s)); return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join(''); }
let schemaDone = false;
export async function zbcSchema(db) {
  if (schemaDone) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS zbc_log (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER, kind TEXT, title TEXT, body TEXT, url TEXT, aud TEXT, total INTEGER DEFAULT 0, sent INTEGER DEFAULT 0, failed INTEGER DEFAULT 0, gone INTEGER DEFAULT 0, pos INTEGER DEFAULT 0, rq INTEGER DEFAULT 0, ids TEXT, done INTEGER DEFAULT 0, lock INTEGER DEFAULT 0, fin INTEGER)'),
    db.prepare('CREATE INDEX IF NOT EXISTS zbc_log_open ON zbc_log(done, at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zbc_adm (id TEXT PRIMARY KEY, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, label TEXT, at INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zbc_kv (k TEXT PRIMARY KEY, v TEXT)')
  ]);
  schemaDone = true;
}
// audience keys — the same categories the dashboard's «حسب النوع» counts use
export const AUD = { all: 'كل المشتركين', pr: 'الصلوات (الأذان)', am: 'أذكار الصباح', pm: 'أذكار المساء', mt: 'صيام الاثنين والخميس', white: 'الأيام البيض', suhoor: 'السحور', kahf: 'سورة الكهف (الجمعة)', sad: 'الصدقة الأسبوعية', occ: 'المناسبات', dz: 'زادي اليومي', adk_rd: 'ذكّرني بذكر', adk_dh: 'صلاة الضحى', adk_lt: 'الثلث الأخير من الليل', adk_sl: 'أذكار النوم', adk_ap: 'أذكار بعد الصلاة' };
function typesOf(c) {
  const t = new Set(); c = c || {};
  if (c.pr && Object.values(c.pr).some(Boolean)) t.add('pr');
  if (c.adhkar && c.adhkar.am) t.add('am'); if (c.adhkar && c.adhkar.pm) t.add('pm');
  if (c.fast && c.fast.mt) t.add('mt'); if (c.fast && c.fast.white) t.add('white'); if (c.fast && c.fast.suhoor) t.add('suhoor');
  if (c.kahf) t.add('kahf'); if (c.sad && c.sad.on) t.add('sad'); if (c.occ && c.occ.on) t.add('occ'); if (c.dz && c.dz.on) t.add('dz');
  const a = c.adk || {}; for (const k of ['rd', 'dh', 'lt', 'sl', 'ap']) if (a[k] && a[k].on) t.add('adk_' + k);
  return t;
}
async function audiences(db) {
  const rs = (await db.prepare('SELECT id, cfg FROM push_subs ORDER BY id').all()).results || [];
  const m = { all: [] };
  for (const r of rs) { m.all.push(r.id); let c = {}; try { c = JSON.parse(r.cfg || '{}') || {}; } catch (e) {} for (const k of typesOf(c)) (m[k] = m[k] || []).push(r.id); }
  return m;
}
function cleanUrl(u) {
  u = String(u || '').trim();
  if (!u || u === './' || u === '#' || u === '#home' || u === './#home') return './';
  if (u[0] === '#') u = './' + u;
  if (!/^\.\/#[A-Za-z0-9_\-\/.%@:~]{1,120}$/.test(u)) return null; // only routes inside the app, relative → opens on whichever address it was installed from
  return u;
}
const clip = (s, n) => String(s || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, n);
async function hourCount(db, kind) { const r = await db.prepare('SELECT COUNT(*) n FROM zbc_log WHERE kind=? AND at>?').bind(kind, Date.now() - 3600e3).first(); return r ? r.n : 0; }
const pubRow = r => ({ id: r.id, at: r.at, kind: r.kind, title: r.title, body: r.body, url: r.url, aud: r.aud, total: r.total, sent: r.sent, failed: r.failed, gone: r.gone, done: r.done, fin: r.fin });

// process up to `budget` recipients of one open broadcast (claimed with a lock so two runners never double-send)
async function step(env, budget = CHUNK) {
  const db = env.DB, now = Date.now(), D = ZBC.deps; if (!D) return { idle: true };
  const row = await db.prepare('UPDATE zbc_log SET lock=?1 WHERE id=(SELECT id FROM zbc_log WHERE done=0 AND lock<?2 ORDER BY id LIMIT 1) RETURNING *').bind(now, now - LOCK_MS).first();
  if (!row) return { idle: true };
  let ids = []; try { ids = JSON.parse(row.ids || '[]'); } catch (e) {}
  const slice = ids.slice(row.pos, row.pos + budget);
  let sent = 0, failed = 0, gone = 0; const upd = [], requeue = [];
  const tbl = row.kind === 'test' ? 'zbc_adm' : 'push_subs';
  const subs = slice.length ? ((await db.prepare(`SELECT id, endpoint, p256dh, auth FROM ${tbl} WHERE id IN (${slice.map(() => '?').join(',')})`).bind(...slice).all()).results || []) : [];
  const byId = Object.fromEntries(subs.map(s => [s.id, s]));
  const payload = { t: row.title, b: row.body, u: row.url || './', tag: 'zbc' + row.id };
  let i = 0;
  const worker = async () => {
    while (i < slice.length) {
      const id = slice[i++], s = byId[id];
      if (!s) { failed++; continue; } // unsubscribed since the broadcast was queued
      let r; try { r = await D.sendPush(db, s, payload, 86400, 'normal'); } catch (e) { r = null; }
      if (!r) { if (ids.reduce((c, x) => c + (x === id), 0) < 3) { requeue.push(id); continue; } r = { status: 0 }; } // a thrown fetch (e.g. the invocation's subrequest cap) is retried later, not counted
      if (D.isGone(r)) { gone++; failed++; upd.push(db.prepare(`DELETE FROM ${tbl} WHERE id=?`).bind(id)); }
      else if (r.status >= 200 && r.status < 300) { sent++; if (tbl === 'push_subs') upd.push(db.prepare('UPDATE push_subs SET last_ok=? WHERE id=?').bind(now, id)); }
      else failed++;
    }
  };
  await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
  if (requeue.length) ids = ids.concat(requeue);
  const pos = row.pos + slice.length, done = pos >= ids.length ? 1 : 0;
  upd.push(db.prepare('UPDATE zbc_log SET pos=?, sent=sent+?, failed=failed+?, gone=gone+?, done=?, fin=?, lock=0, rq=rq+?' + (requeue.length ? ', ids=?' : '') + ' WHERE id=?').bind(...[pos, sent, failed, gone, done, done ? Date.now() : null, requeue.length].concat(requeue.length ? [JSON.stringify(ids)] : []), row.id));
  if (gone && tbl === 'push_subs') upd.push(db.prepare("INSERT INTO push_meta(k,v) VALUES('gone',?) ON CONFLICT(k) DO UPDATE SET v=CAST(CAST(v AS INTEGER)+? AS TEXT)").bind(String(gone), gone));
  await db.batch(upd);
  return { id: row.id, pos, total: ids.length, sent, failed, gone, done };
}
// called by the every-minute cron tick (time-boxed by the caller)
export async function zbcTick(env, untilMs) {
  if (!env.DB) return null; await zbcSchema(env.DB);
  const out = []; for (let k = 0; k < 2 && Date.now() < untilMs; k++) { const r = await step(env); if (r.idle) break; out.push(r); }
  return out.length ? out.length : 0;
}
// public: the app pairs this device as the owner's test device with the 6-digit code shown on the dashboard
export async function zbcPair(req, env) {
  if (req.method !== 'POST') return null;
  const db = env.DB; await zbcSchema(db);
  const b = await req.json().catch(() => ({}));
  const code = String(b.code || '').replace(/[^0-9٠-٩]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const kv = await db.prepare("SELECT v FROM zbc_kv WHERE k='pair'").first();
  let p = null; try { p = kv && JSON.parse(kv.v); } catch (e) {}
  if (!p || p.exp < Date.now() || code.length !== 6 || (await sha('zbc' + code)) !== p.h) return J({ ok: false }, 404);
  if (b.check) return J({ ok: true, valid: true });
  const s = b.sub || {}, k = s.keys || {};
  if (typeof s.endpoint !== 'string' || !/^https:\/\//.test(s.endpoint) || !k.p256dh || !k.auth) return J({ ok: false, error: 'sub' }, 400);
  await addAdm(db, s.endpoint, k.p256dh, k.auth, clip(b.label, 40) || 'جهازي');
  await db.prepare("DELETE FROM zbc_kv WHERE k='pair'").run();
  return J({ ok: true });
}
async function addAdm(db, endpoint, p256dh, auth, label) {
  const id = (await sha(endpoint)).slice(0, 32);
  await db.prepare('INSERT INTO zbc_adm(id,endpoint,p256dh,auth,label,at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, label=excluded.label, at=excluded.at').bind(id, endpoint, p256dh, auth, label, Date.now()).run();
  return id;
}
const hostOf = e => { try { const h = new URL(e).hostname; return /apple/.test(h) ? 'iPhone/Mac' : /google/.test(h) ? 'Android/Chrome' : /mozilla|mozaws/.test(h) ? 'Firefox' : /windows/.test(h) ? 'Windows' : h; } catch (x) { return '?'; } };

// token-checked by zdash.js
export async function zbcApi(req, env, ctx, sub) {
  const db = env.DB; await zbcSchema(db);
  const now = Date.now();
  if (sub === '' && req.method === 'GET') {
    const aud = await audiences(db);
    const counts = Object.fromEntries(Object.keys(AUD).map(k => [k, (aud[k] || []).length]));
    const log = ((await db.prepare('SELECT * FROM zbc_log ORDER BY id DESC LIMIT 40').all()).results || []).map(pubRow);
    const adm = ((await db.prepare('SELECT id, endpoint, label, at FROM zbc_adm ORDER BY at DESC').all()).results || []).map(r => ({ id: r.id, label: r.label, at: r.at, kind: hostOf(r.endpoint), sub: !!r.id }));
    const kv = await db.prepare("SELECT v FROM zbc_kv WHERE k='pair'").first(); let pair = null; try { const p = JSON.parse(kv.v); if (p.exp > now) pair = { exp: p.exp }; } catch (e) {}
    return J({ ok: true, aud: AUD, counts, log, adm, pair, hour: await hourCount(db, 'all'), max_hour: MAX_PER_HOUR });
  }
  if (req.method !== 'POST') return J({ ok: false }, 404);
  const b = await req.json().catch(() => ({}));
  if (sub === 'send') {
    const title = clip(b.title, 80), body = clip(b.body, 240), url = cleanUrl(b.url);
    if (!title) return J({ ok: false, error: 'العنوان مطلوب' }, 400);
    if (!url) return J({ ok: false, error: 'الرابط يجب أن يكون مساراً داخل التطبيق يبدأ بـ #' }, 400);
    const test = !!b.test, akey = test ? 'test' : (AUD[b.aud] ? b.aud : 'all');
    let ids;
    if (test) {
      ids = ((await db.prepare('SELECT id FROM zbc_adm' + (b.dev ? ' WHERE id=?' : '')).bind(...(b.dev ? [String(b.dev)] : [])).all()).results || []).map(r => r.id);
      if (!ids.length) return J({ ok: false, error: 'لا يوجد جهاز مسجّل لك — اضغط «هذا جهازي» أولاً' }, 400);
    } else ids = (await audiences(db))[akey] || [];
    if (b.dry) return J({ ok: true, dry: true, aud: akey, recipients: ids.length, title, body, url });
    if (!ids.length) return J({ ok: false, error: 'لا يوجد مستلمون لهذا الاختيار' }, 400);
    const kind = test ? 'test' : 'all';
    const used = await hourCount(db, kind);
    if (used >= (test ? TEST_PER_HOUR : MAX_PER_HOUR)) return J({ ok: false, error: test ? 'تجارب كثيرة — انتظر قليلاً' : 'الحد ' + MAX_PER_HOUR + ' إشعارات بالساعة — جرّب بعد قليل' }, 429);
    if (!test && Number(b.confirm) !== ids.length) return J({ ok: false, error: 'تغيّر عدد المستلمين، راجع وأكّد من جديد', recipients: ids.length }, 409);
    const r = await db.prepare('INSERT INTO zbc_log(at,kind,title,body,url,aud,total,ids) VALUES(?,?,?,?,?,?,?,?) RETURNING id').bind(now, kind, title, body, url, akey, ids.length, JSON.stringify(ids)).first();
    const runner = (async () => { for (let k = 0; k < 2; k++) { const s = await step(env); if (s.idle || s.done) break; } })(); // ≤80 pushes here; the dashboard's polling and the cron tick carry on
    if (ctx && ctx.waitUntil) ctx.waitUntil(runner.catch(() => {})); else await runner;
    return J({ ok: true, id: r.id, recipients: ids.length });
  }
  if (sub === 'step') { const s = await step(env); return J({ ok: true, ...s }); }
  if (sub === 'me') { // «هذا جهازي» from the dashboard page itself (when the page has a push subscription on this origin)
    const s = b.sub || {}, k = s.keys || {};
    if (typeof s.endpoint !== 'string' || !/^https:\/\//.test(s.endpoint) || !k.p256dh || !k.auth) return J({ ok: false, error: 'sub' }, 400);
    const id = await addAdm(db, s.endpoint, k.p256dh, k.auth, clip(b.label, 40) || 'جهازي');
    return J({ ok: true, id });
  }
  if (sub === 'unme') { await db.prepare('DELETE FROM zbc_adm WHERE id=?').bind(String(b.id || '')).run(); return J({ ok: true }); }
  if (sub === 'pair') { // new 6-digit code, valid 10 minutes, one at a time
    const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1e6, code = String(n).padStart(6, '0');
    const exp = now + 10 * 60e3;
    await db.prepare("INSERT INTO zbc_kv(k,v) VALUES('pair',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(JSON.stringify({ h: await sha('zbc' + code), exp })).run();
    return J({ ok: true, code, exp });
  }
  if (sub === 'dellog') { await db.prepare('DELETE FROM zbc_log WHERE id=? AND done=1').bind(+b.id || 0).run(); return J({ ok: true }); }
  return J({ ok: false }, 404);
}
