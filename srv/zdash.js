// زاد v5.4.4/5.4.5 — private admin dashboard (+ v5.4.5 «إرسال إشعار», srv/zbc.js) («لوحة المؤشرات») + anonymous first-party usage counting.
// Page: GET /admin/<token> (only the token's SHA-256 is in this file; wrong/missing token → 404, noindex).
// API:  GET /api/zdash (header X-ZD-Token) → JSON metrics; POST /api/zdash/clean-test removes test pings (dk 'ZTEST-…').
// Ping: POST /api/zp {d,p,s,v,f} from the app — a random device id kept in localStorage, platform, installed state,
//       version and per-route open counts. No IP, no name, no account id is stored. Address (amar-muslim / zad) is
//       decided server-side (the zad proxy signs its requests). D1 tables are additive: za_dev, za_first, za_fev, za_cnt.
import DASH_HTML from './admin-dash.html';
import { zbcApi, zbcPair } from './zbc.js'; // v5.4.5
const DASH_HASH = '306c021b0205adedde003c3f3e02bc6deb434e08dacd216edbd17f584d506410';
export const ZA_START = '2026-10-31';
const GUARD_BYTES = 8 * 1024 ** 3;
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
const NF = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
const RD = t => new Date(t + 3 * 3600e3).toISOString().slice(0, 10); // Riyadh day (UTC+3, no DST)
const DK = /^[a-f0-9]{32}$/, TK = /^ZTEST-[a-z0-9]{4,20}$/, FK = /^[a-z][a-z0-9]{0,15}$/;
const NOTEST = "dk NOT LIKE 'ZTEST-%'";
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function tokOk(t) { if (!t || t.length < 24 || t.length > 80) return false; const h = await sha(t); let d = 0; for (let i = 0; i < 64; i++) d |= h.charCodeAt(i) ^ DASH_HASH.charCodeAt(i); return d === 0; }
let ready = false;
async function zaSchema(db) {
  if (ready) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS za_dev (dk TEXT, day TEXT, plat TEXT, inst INTEGER DEFAULT 0, host TEXT, ver TEXT, n INTEGER DEFAULT 1, at INTEGER, PRIMARY KEY (dk, day))'),
    db.prepare('CREATE INDEX IF NOT EXISTS za_dev_day ON za_dev(day)'),
    db.prepare('CREATE TABLE IF NOT EXISTS za_first (dk TEXT PRIMARY KEY, day TEXT, plat TEXT, inst INTEGER DEFAULT 0, host TEXT, inst_day TEXT, at INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS za_fev (dk TEXT, day TEXT, f TEXT, n INTEGER DEFAULT 0, PRIMARY KEY (dk, day, f))'),
    db.prepare('CREATE INDEX IF NOT EXISTS za_fev_day ON za_fev(day, f)'),
    db.prepare('CREATE TABLE IF NOT EXISTS za_cnt (day TEXT, k TEXT, n INTEGER DEFAULT 0, PRIMARY KEY (day, k))')
  ]);
  ready = true;
}
// server-side counters going forward (hadith checks, server errors)
export async function zaBump(env, k, n = 1) {
  try { if (!env.DB) return; await zaSchema(env.DB); await env.DB.prepare('INSERT INTO za_cnt (day,k,n) VALUES (?,?,?) ON CONFLICT(day,k) DO UPDATE SET n=n+excluded.n').bind(RD(Date.now()), String(k).slice(0, 24), n).run(); } catch (e) {}
}
async function ping(req, env, viaZad) {
  const db = env.DB; if (!db) return J({ ok: false }, 503);
  let b = {}; try { const t = await req.text(); if (t.length > 6000) return J({ ok: false, error: 'big' }, 413); b = JSON.parse(t || '{}') || {}; } catch (e) { return J({ ok: false, error: 'json' }, 400); }
  const dk = String(b.d || ''); if (!DK.test(dk) && !TK.test(dk)) return J({ ok: false, error: 'id' }, 400);
  const plat = ['android', 'ios', 'desktop', 'other'].includes(b.p) ? b.p : 'other';
  const inst = [0, 1, 2].includes(+b.s) ? +b.s : 0; // 0 browser · 1 installed PWA · 2 Android app (TWA)
  const host = viaZad ? 'zad' : 'amar-muslim';
  const ver = String(b.v || '').replace(/[^0-9a-z.\-]/gi, '').slice(0, 12) || '?';
  const now = Date.now(), day = RD(now);
  await zaSchema(db);
  const st = [
    db.prepare('INSERT INTO za_dev (dk,day,plat,inst,host,ver,n,at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(dk,day) DO UPDATE SET n=MIN(n+excluded.n,500), inst=MAX(inst,excluded.inst), plat=excluded.plat, host=excluded.host, ver=excluded.ver, at=excluded.at').bind(dk, day, plat, inst, host, ver, b.o ? 1 : 0, now),
    db.prepare('INSERT OR IGNORE INTO za_first (dk,day,plat,inst,host,inst_day,at) VALUES (?,?,?,?,?,?,?)').bind(dk, day, plat, inst, host, inst ? day : null, now)
  ];
  if (inst) st.push(db.prepare('UPDATE za_first SET inst=MAX(inst,?), inst_day=COALESCE(inst_day,?) WHERE dk=?').bind(inst, day, dk));
  const f = b.f && typeof b.f === 'object' ? b.f : {};
  let k = 0;
  for (const key of Object.keys(f)) {
    if (k >= 40) break; if (!FK.test(key)) continue;
    const n = Math.max(0, Math.min(200, Math.round(+f[key] || 0))); if (!n) continue; k++;
    st.push(db.prepare('INSERT INTO za_fev (dk,day,f,n) VALUES (?,?,?,?) ON CONFLICT(dk,day,f) DO UPDATE SET n=MIN(n+excluded.n,2000)').bind(dk, day, key, n));
  }
  await db.batch(st);
  if (Math.random() < 0.003) { try { await db.prepare('DELETE FROM za_fev WHERE day<?').bind(RD(now - 400 * 864e5)).run(); } catch (e) {} }
  return J({ ok: true });
}
// ---------------- metrics ----------------
async function metrics(env) {
  const db = env.DB, now = Date.now();
  await zaSchema(db);
  const today = RD(now), t0 = Date.parse(today + 'T00:00:00+03:00'), t7 = t0 - 6 * 864e5, t30 = t0 - 29 * 864e5;
  const d7 = RD(t7), d30 = RD(t30), yday = RD(t0 - 864e5);
  let dbSize = null;
  const all = async (sql, ...a) => { try { const r = await db.prepare(sql).bind(...a).all(); if (r.meta && r.meta.size_after) dbSize = r.meta.size_after; return r.results || []; } catch (e) { return null; } };
  const one = async (sql, ...a) => { const r = await all(sql, ...a); return r ? (r[0] || {}) : null; };
  const DAYX = ts => `strftime('%Y-%m-%d', ${ts}/1000 + 10800, 'unixepoch')`;
  // windowed count of rows with a ms timestamp column (+ per-day series for the last 30 days)
  const win = async (table, ts, where = '1', series = true) => {
    const r = await one(`SELECT COUNT(*) t, SUM(CASE WHEN ${ts}>=?1 THEN 1 ELSE 0 END) d0, SUM(CASE WHEN ${ts}>=?2 THEN 1 ELSE 0 END) d7, SUM(CASE WHEN ${ts}>=?3 THEN 1 ELSE 0 END) d30 FROM ${table} WHERE ${where}`, t0, t7, t30);
    if (!r) return null;
    const o = { t: r.t || 0, d0: r.d0 || 0, d7: r.d7 || 0, d30: r.d30 || 0 };
    if (series) { const s = await all(`SELECT ${DAYX(ts)} d, COUNT(*) n FROM ${table} WHERE ${ts}>=? AND ${where} GROUP BY d`, t30); if (s) o.s = Object.fromEntries(s.map(x => [x.d, x.n])); }
    return o;
  };
  // the same for a Riyadh-day text column
  const wind = async (table, dcol, where = '1', agg = 'COUNT(*)') => {
    const r = await one(`SELECT ${agg} t, (SELECT ${agg} FROM ${table} WHERE ${dcol}=?1 AND ${where}) d0, (SELECT ${agg} FROM ${table} WHERE ${dcol}>=?2 AND ${where}) d7, (SELECT ${agg} FROM ${table} WHERE ${dcol}>=?3 AND ${where}) d30 FROM ${table} WHERE ${where}`, today, d7, d30);
    if (!r) return null;
    const s = await all(`SELECT ${dcol} d, ${agg} n FROM ${table} WHERE ${dcol}>=? AND ${where} GROUP BY ${dcol}`, d30);
    return { t: r.t || 0, d0: r.d0 || 0, d7: r.d7 || 0, d30: r.d30 || 0, s: s ? Object.fromEntries(s.map(x => [x.d, x.n])) : {} };
  };
  const M = { now, today, tz: 'Asia/Riyadh', za_start: ZA_START };
  // ---- usage (from the anonymous ping) ----
  const firstDay = await one(`SELECT MIN(day) d, COUNT(*) n FROM za_first WHERE ${NOTEST}`);
  const dau = await all(`SELECT day d, COUNT(*) n, SUM(n) s FROM za_dev WHERE day>=? AND ${NOTEST} GROUP BY day`, d30);
  const act = await one(`SELECT (SELECT COUNT(*) FROM za_dev WHERE day=?1 AND ${NOTEST}) dau, (SELECT COUNT(*) FROM za_dev WHERE day=?4 AND ${NOTEST}) yday, (SELECT COUNT(DISTINCT dk) FROM za_dev WHERE day>=?2 AND ${NOTEST}) wau, (SELECT COUNT(DISTINCT dk) FROM za_dev WHERE day>=?3 AND ${NOTEST}) mau, (SELECT COALESCE(SUM(n),0) FROM za_dev WHERE day=?1 AND ${NOTEST}) s0, (SELECT COALESCE(SUM(n),0) FROM za_dev WHERE day>=?2 AND ${NOTEST}) s7, (SELECT COALESCE(SUM(n),0) FROM za_dev WHERE day>=?3 AND ${NOTEST}) s30, (SELECT COALESCE(SUM(n),0) FROM za_dev WHERE ${NOTEST}) st`, today, d7, d30, yday);
  const grp = async (col, from) => all(`SELECT ${col} k, COUNT(*) n FROM (SELECT dk, ${col === 'inst' ? 'MAX(inst)' : 'MAX(' + col + ')'} ${col} FROM za_dev WHERE day>=? AND ${NOTEST} GROUP BY dk) GROUP BY ${col} ORDER BY n DESC`, from);
  M.usage = {
    first_day: firstDay && firstDay.d, devices_total: firstDay ? firstDay.n || 0 : 0,
    act, dau: dau ? Object.fromEntries(dau.map(x => [x.d, x.n])) : {}, sessions: dau ? Object.fromEntries(dau.map(x => [x.d, x.s])) : {},
    new_devices: await wind('za_first', 'day', NOTEST),
    installs: await wind('za_first', 'inst_day', NOTEST + ' AND inst_day IS NOT NULL'),
    plat30: await grp('plat', d30), inst30: await grp('inst', d30), host30: await grp('host', d30), ver7: await grp('ver', d7),
    plat_all: await all(`SELECT plat k, COUNT(*) n FROM za_first WHERE ${NOTEST} GROUP BY plat ORDER BY n DESC`),
    inst_all: await all(`SELECT inst k, COUNT(*) n FROM za_first WHERE ${NOTEST} GROUP BY inst ORDER BY n DESC`)
  };
  const feat = async from => all(`SELECT f k, SUM(n) n, COUNT(DISTINCT dk) u FROM za_fev WHERE day>=? AND ${NOTEST} GROUP BY f ORDER BY n DESC LIMIT 80`, from);
  M.features = { d0: await feat(today), d7: await feat(d7), d30: await feat(d30), all: await feat('0000') };
  // ---- users ----
  M.users = {
    accounts: await win('sc_dw_user', 'at'), banned: await one('SELECT COUNT(*) n FROM sc_dw_user WHERE banned=1'),
    vprof: await win('zv_prof', 'at'), creators: await one("SELECT COUNT(DISTINCT uid) n FROM vid_videos WHERE uid IS NOT NULL AND COALESCE(official,0)=0"),
    posts: await win('sc_dw_post', 'at', 'reply_to IS NULL'), replies: await win('sc_dw_post', 'at', 'reply_to IS NOT NULL', false),
    dwlikes: await win('sc_dw_like', 'at', '1', false), follows: await win('sc_dw_follow', 'at', '1', false)
  };
  // ---- videos ----
  const UC = "COALESCE(official,0)=0";
  M.videos = {
    live: await one(`SELECT COUNT(*) n, SUM(CASE WHEN ${UC} THEN 1 ELSE 0 END) u, SUM(CASE WHEN COALESCE(official,0)=1 THEN 1 ELSE 0 END) o, COALESCE(SUM(views),0) v, COALESCE(SUM(likes),0) l, COALESCE(SUM(comments),0) c, COALESCE(SUM(saves),0) s, COALESCE(SUM(shares),0) sh FROM vid_videos WHERE status='approved' AND hidden=0`),
    uploads: await win('vid_videos', 'created', UC),
    views: await wind('zv_view', 'day'),
    likes: await win('vid_likes', 'at'), saves: await win('zv_save', 'at', "k='s'"), comments: await win('vid_comments', 'at', 'hidden=0'),
    top: await all(`SELECT id, COALESCE(NULLIF(caption,''), title) t, views v, likes l, comments c, saves s, COALESCE(official,0) o, (SELECT COUNT(*) FROM zv_view z WHERE z.vid=vid_videos.id AND z.day>=?) v7 FROM vid_videos WHERE status='approved' AND hidden=0 ORDER BY views DESC, likes DESC LIMIT 10`, d7),
    official: await all(`SELECT id, COALESCE(NULLIF(title,''), caption) t, views v, likes l, comments c, saves s, COALESCE(pub_at, approved_at, created) at, (SELECT COUNT(*) FROM zv_view z WHERE z.vid=vid_videos.id AND z.day>=?) v7 FROM vid_videos WHERE COALESCE(official,0)=1 AND status='approved' ORDER BY COALESCE(pub_at, approved_at, created) DESC LIMIT 60`, d7),
    reports: await one("SELECT COUNT(*) n FROM vid_videos WHERE reports>0 AND status='approved'")
  };
  // ---- push ----
  const cfgs = await all('SELECT cfg FROM push_subs');
  const types = {};
  if (cfgs) for (const r of cfgs) {
    let c = {}; try { c = JSON.parse(r.cfg || '{}') || {}; } catch (e) {}
    const add = k => types[k] = (types[k] || 0) + 1;
    if (c.pr && Object.values(c.pr).some(Boolean)) add('pr');
    if (c.adhkar && c.adhkar.am) add('am'); if (c.adhkar && c.adhkar.pm) add('pm');
    if (c.fast && c.fast.mt) add('mt'); if (c.fast && c.fast.white) add('white'); if (c.fast && c.fast.suhoor) add('suhoor');
    if (c.kahf) add('kahf'); if (c.sad && c.sad.on) add('sad'); if (c.occ && c.occ.on) add('occ'); if (c.dz && c.dz.on) add('dz');
    const a = c.adk || {}; for (const k of ['rd', 'dh', 'lt', 'sl', 'ap']) if (a[k] && a[k].on) add('adk_' + k);
  }
  const pm = await all("SELECT k, v FROM push_meta WHERE k!='vapid'");
  const meta = {}; if (pm) for (const r of pm) if (String(r.v).length < 300) meta[r.k] = r.v;
  const sent = await all("SELECT substr(k, instr(k,'|')+1) ev, strftime('%Y-%m-%d', at/1000 + 10800, 'unixepoch') d, COUNT(*) n FROM push_sent GROUP BY ev, d");
  const evCat = ev => { ev = String(ev).split('|')[0]; if (ev === 'am' || ev === 'pm') return ev; if (/^p/.test(ev)) return 'pr'; if (/^r\d/.test(ev)) return 'adk_rd'; if (/^x/.test(ev)) return 'adk_ap'; if (ev === 'dh' || ev === 'lt' || ev === 'sl') return 'adk_' + ev; if (ev === 'fz') return 'fast'; if (ev === 'fs') return 'suhoor'; if (ev === 'kf') return 'kahf'; if (ev === 'sd') return 'sad'; if (ev === 'oc' || ev === 'oe') return 'occ'; return ev; };
  const sentDay = {}, sentType = {};
  if (sent) for (const r of sent) { sentDay[r.d] = (sentDay[r.d] || 0) + r.n; const c = evCat(r.ev); sentType[c] = (sentType[c] || 0) + r.n; }
  M.push = {
    subs: await win('push_subs', 'created'), types, meta, sent_day: sentDay, sent_type: sentType,
    vsubs: await one('SELECT COUNT(*) n FROM zv_push'), bud: await one('SELECT COUNT(*) n, SUM(CASE WHEN sub IS NOT NULL AND sub!=\'\' THEN 1 ELSE 0 END) s FROM sc_bud'),
    fam: await one("SELECT COUNT(*) n FROM sc_fam_mem WHERE sub IS NOT NULL AND sub!=''"), adm: await one('SELECT COUNT(*) n FROM vid_admdev')
  };
  // ---- engagement ----
  const cnt = async k => { const r = await one('SELECT (SELECT COALESCE(SUM(n),0) FROM za_cnt WHERE k=?1) t, (SELECT COALESCE(SUM(n),0) FROM za_cnt WHERE k=?1 AND day=?2) d0, (SELECT COALESCE(SUM(n),0) FROM za_cnt WHERE k=?1 AND day>=?3) d7, (SELECT COALESCE(SUM(n),0) FROM za_cnt WHERE k=?1 AND day>=?4) d30', k, today, d7, d30); const s = await all('SELECT day d, n FROM za_cnt WHERE k=? AND day>=?', k, d30); return r ? { ...r, s: s ? Object.fromEntries(s.map(x => [x.d, x.n])) : {} } : null; };
  M.eng = {
    khatma: await win('zk_khatma', 'created'), khatma_x: await one('SELECT COALESCE(SUM(CASE WHEN closed=1 THEN 1 ELSE 0 END),0) closed, COALESCE(SUM(done_rounds),0) rounds FROM zk_khatma'),
    juz_taken: await win('zk_parts', 'at', '1', false), juz_done: await win('zk_parts', 'done_at', 'status=2', false),
    refs: await win('sc_ref', 'created'), ref_hits: await win('sc_ref_hit', 'at'),
    dorar_cache: await win('zc_dorar', 't', '1', false), dorar: await cnt('dorar'),
    chal: await one('SELECT COUNT(*) n, COALESCE(SUM(count),0) c, SUM(CASE WHEN ended=0 THEN 1 ELSE 0 END) a FROM sc_chal'), chal_dev: await one('SELECT COUNT(DISTINCT dev) n, COALESCE(SUM(n),0) c FROM sc_chal_dev'),
    halaqa: await win('sc_halaqa', 'created', '1', false), halaqa_mem: await win('sc_halaqa_mem', 'joined', '1', false), halaqa_log: await win('sc_halaqa_log', 'at', '1', false),
    fam: await win('sc_fam', 'created', '1', false), fam_mem: await win('sc_fam_mem', 'at', '1', false),
    bud: await win('sc_bud', 'at', '1', false), articles: await win('art_items', 'created', '1', false)
  };
  // ---- health ----
  let ver = null; try { const r = await env.ASSETS.fetch(new Request('https://x/sw.js')); const t = await r.text(); const m = /V='([^']+)'/.exec(t); ver = m && m[1]; } catch (e) {}
  let r2 = null;
  try {
    let vid = 0, other = 0, objs = 0, cur, done = false; const until = Date.now() + 4000;
    for (let i = 0; i < 20 && Date.now() < until; i++) { const l = await env.VIDS.list({ limit: 1000, cursor: cur }); for (const o of l.objects || []) { objs++; const k = o.key || ''; if (k.startsWith('v/') || k.startsWith('p/')) vid += o.size; else other += o.size; } if (!l.truncated) { done = true; break; } cur = l.cursor; }
    r2 = { vid, other, objs, done, guard: GUARD_BYTES };
  } catch (e) { r2 = { error: String(e && e.message || e).slice(0, 80) }; }
  const vm = await all("SELECT k, v FROM vid_meta WHERE k IN ('vid_bytes','r2_bytes','last_purge','auto_del')");
  const tbl = await all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name");
  let tables = null;
  if (tbl && tbl.length) { try { const rs = await db.batch(tbl.map(t => db.prepare(`SELECT COUNT(*) n FROM "${t.name.replace(/"/g, '')}"`))); tables = tbl.map((t, i) => [t.name, (rs[i].results[0] || {}).n || 0]); rs.forEach(x => { if (x.meta && x.meta.size_after) dbSize = x.meta.size_after; }); } catch (e) {} }
  M.health = { sw: ver, r2, vid_meta: vm ? Object.fromEntries(vm.map(x => [x.k, x.v])) : null, d1_bytes: dbSize, errors: await cnt('e5xx'), tables };
  return M;
}
// returns a Response for the dashboard's paths, or null to let the app handle the request
export async function zdash(req, env, ctx, viaZad) {
  const u = new URL(req.url), p = u.pathname;
  // v5.4.5 «إرسال إشعار» (srv/zbc.js): token-guarded broadcast API + the app's public pairing call
  if (p === '/api/zdash/pair-dev') { if (req.method !== 'POST') return NF(); try { return (await zbcPair(req, env)) || NF(); } catch (e) { return J({ ok: false }, 500); } }
  if (p === '/api/zdash/bc' || p.startsWith('/api/zdash/bc/')) {
    if (!(await tokOk(req.headers.get('x-zd-token') || ''))) return NF();
    try { return await zbcApi(req, env, ctx, p.slice('/api/zdash/bc'.length).replace(/^\//, '')); } catch (e) { return J({ ok: false, error: String(e && e.message || e).slice(0, 200) }, 500); }
  }
  if (p === '/api/zp') { if (req.method !== 'POST') return NF(); try { return await ping(req, env, viaZad); } catch (e) { return J({ ok: false }, 500); } }
  if (p === '/api/zdash' || p === '/api/zdash/clean-test') {
    if (!(await tokOk(req.headers.get('x-zd-token') || ''))) return NF();
    if (p === '/api/zdash/clean-test') {
      if (req.method !== 'POST') return NF();
      await zaSchema(env.DB);
      // v5.4.7: optional ?dk=id1,id2 (exact device ids, e.g. headless QA browsers that pinged without the ZTEST- prefix); ?dry=1&ver=&plat= lists candidates
      const ids = (u.searchParams.get('dk') || '').split(',').map(s => s.trim()).filter(s => /^[A-Za-z0-9-]{8,64}$/.test(s)).slice(0, 50);
      const W = ids.length ? `dk IN (${ids.map(() => '?').join(',')})` : `dk LIKE 'ZTEST-%'`;
      if (u.searchParams.get('dry')) {
        if (u.searchParams.get('ver')) return J({ ok: true, cand: (await env.DB.prepare('SELECT dk,day,plat,inst,host,ver,n,at FROM za_dev WHERE ver = ? AND plat = ?').bind(u.searchParams.get('ver'), u.searchParams.get('plat') || 'desktop').all()).results });
        const q = async t => (await env.DB.prepare(`SELECT * FROM ${t} WHERE ${W}`).bind(...ids).all()).results; return J({ ok: true, dev: await q('za_dev'), first: await q('za_first'), fev: await q('za_fev') });
      }
      const rs = await env.DB.batch(['za_dev', 'za_first', 'za_fev'].map(t => env.DB.prepare(`DELETE FROM ${t} WHERE ${W}`).bind(...ids)));
      return J({ ok: true, deleted: rs.map(x => x.meta && x.meta.changes) });
    }
    try { return J({ ok: true, ...(await metrics(env)) }); } catch (e) { return J({ ok: false, error: String(e && e.message || e).slice(0, 200) }, 500); }
  }
  const m = /^\/admin\/([^/]+)\/?$/.exec(p);
  if (m && !['videos', 'articles', 'social'].includes(m[1])) {
    if (!(await tokOk(decodeURIComponent(m[1])))) return NF();
    return new Response(DASH_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' } });
  }
  return null;
}
