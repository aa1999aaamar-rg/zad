// زاد v4.6 «المرحلة الثانية: ميزات جماعية» — /api/social/* (D1 tables sc_*, additive, IF NOT EXISTS) + /go/<ref>.
// Pages for the sick and the deceased (+ «دعوت له»), the global dhikr challenges, family circles (+ gentle parental view), the Fajr buddy, and «أجرك الجاري» link counts.
// Device = X-Zad-Dev (the app's random id), hashed here with a per-site salt; nothing else identifies a person. No phone numbers, no locations are shown to anyone.
import { dwApi, dwAdmin } from './dw.js'; // v5.0 «ديوانية زاد»
import { zvApi, zvAdmin } from './zv.js'; // v5.4 «مقاطع زاد» (TikTok-style clips on the Diwaniya identity)
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } });
const E = (m, s = 400, msg) => J({ ok: false, error: m, ...(msg ? { msg } : {}) }, s);
const AB = 'abcdefghijkmnpqrstuvwxyz23456789', AC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rid = (n = 10, al = AB) => { const b = crypto.getRandomValues(new Uint8Array(n)); let s = ''; for (const x of b) s += al[x % al.length]; return s; };
const ID_RE = /^[a-z2-9]{10}$/, CODE_RE = /^[A-Z2-9]{6}$/, REF_RE = /^[a-z2-9]{8}$/;
const AR = s => String(s).replace(/\d/g, x => '٠١٢٣٤٥٦٧٨٩'[x]);
const HIDE_AT = 3;
// text in: control chars and bidi overrides out, length capped; any run of 7+ digits (Arabic or Latin) is refused by `phoney` (no phone numbers on public pages)
export const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
const phoney = s => /(\d[\s\-.]*){7,}/.test(String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))) || /(https?:|www\.|@[a-z0-9_]{3,})/i.test(s);

// on top of the clips' filter: insults that are fine in a comment thread but not on a memorial or a sick person's page
const XBAD = ['كلب', 'كلبه', 'حمار', 'حماره', 'خنزير', 'حقير', 'حقيره', 'وسخ', 'وسخه', 'زباله', 'قذر', 'غبي', 'غبيه', 'تافه', 'ملعون', 'يلعن', 'لعنه', 'الله يلعن', 'نذل', 'سافل', 'سافله', 'منحط', 'ديوث', 'لوطي', 'شاذ'];
const xn = s => String(s).replace(/[\u064b-\u0652\u0640\u0670]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/(.)\1{2,}/g, '$1');
export function extraBad(s) { const w = xn(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean), j = ' ' + w.join(' ') + ' '; return XBAD.some(b => b.includes(' ') ? j.includes(' ' + b + ' ') : w.some(x => x === b || x === 'ال' + b || x === 'و' + b || x === 'يا' + b)); }
let ok = false;
async function schema(db) {
  if (ok) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS sc_meta (k TEXT PRIMARY KEY, v TEXT)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_rate (k TEXT PRIMARY KEY, n INTEGER, reset INTEGER)'),
    db.prepare("CREATE TABLE IF NOT EXISTS sc_pages (id TEXT PRIMARY KEY, kind TEXT, name TEXT, dua TEXT, dates TEXT, fun TEXT, kid TEXT, creator TEXT, created INTEGER, updated INTEGER, count INTEGER DEFAULT 0, reports INTEGER DEFAULT 0, hidden INTEGER DEFAULT 0)"),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_pray (pid TEXT, dev TEXT, day TEXT, PRIMARY KEY (pid, dev, day))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_reports (target TEXT, dev TEXT, at INTEGER, reason TEXT, PRIMARY KEY (target, dev))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_chal (id TEXT PRIMARY KEY, title TEXT, dhikr TEXT, goal INTEGER, count INTEGER DEFAULT 0, starts INTEGER, ends INTEGER, recur INTEGER DEFAULT 0, last_count INTEGER, official INTEGER DEFAULT 0, ended INTEGER DEFAULT 0, created INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_chal_dev (cid TEXT, dev TEXT, per INTEGER, n INTEGER, PRIMARY KEY (cid, dev))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_fam (id TEXT PRIMARY KEY, name TEXT, owner TEXT, created INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_fam_mem (fid TEXT, dev TEXT, mid TEXT, name TEXT, role TEXT, share TEXT, data TEXT, sub TEXT, at INTEGER, PRIMARY KEY (fid, dev))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_cheer (id INTEGER PRIMARY KEY AUTOINCREMENT, fid TEXT, to_mid TEXT, from_name TEXT, msg INTEGER, at INTEGER, seen INTEGER DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_cheer_to ON sc_cheer(fid, to_mid)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_bud (dev TEXT PRIMARY KEY, code TEXT, partner TEXT, name TEXT, lat REAL, lng REAL, tz TEXT, cfg TEXT, delay INTEGER DEFAULT 20, sub TEXT, fajr_day TEXT, next_at INTEGER, sent_day TEXT, at INTEGER)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_bud_code ON sc_bud(code)'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_bud_next ON sc_bud(next_at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_ref (r TEXT PRIMARY KEY, owner TEXT, n INTEGER DEFAULT 0, created INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_ref_hit (r TEXT, who TEXT, at INTEGER, PRIMARY KEY (r, who))'),
    // v4.9 «حلقة التحفيظ» (additive): circles, members, daily progress log, removed devices; cheers reuse sc_cheer with fid 'h:'+code, reports reuse sc_reports
    db.prepare('CREATE TABLE IF NOT EXISTS sc_halaqa (id TEXT PRIMARY KEY, name TEXT, target TEXT, owner TEXT, weekly TEXT, weekly_at INTEGER, created INTEGER, updated INTEGER, reports INTEGER DEFAULT 0, hidden INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_halaqa_mem (hid TEXT, dev TEXT, mid TEXT, name TEXT, role TEXT, prog TEXT, streak INTEGER DEFAULT 0, last_day TEXT, note TEXT, note_at INTEGER, note_rep INTEGER DEFAULT 0, note_hidden INTEGER DEFAULT 0, joined INTEGER, at INTEGER, PRIMARY KEY (hid, dev))'),
    db.prepare('CREATE INDEX IF NOT EXISTS sc_halaqa_mem_mid ON sc_halaqa_mem(hid, mid)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_halaqa_log (hid TEXT, mid TEXT, day TEXT, rng TEXT, score INTEGER, src TEXT, at INTEGER, PRIMARY KEY (hid, mid, day))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sc_halaqa_ban (hid TEXT, dev TEXT, at INTEGER, PRIMARY KEY (hid, dev))'),
    // the official weekly challenge (seeded once): Friday 00:00–24:00 Makkah time, rolls to the next Friday by itself
    db.prepare("INSERT OR IGNORE INTO sc_chal (id,title,dhikr,goal,count,starts,ends,recur,official,created) VALUES ('fri-salawat','مليون صلاة على النبي ﷺ يوم الجمعة','اللهم صلِّ وسلّم على نبينا محمد',1000000,0,?1,?2,604800000,1,?3)").bind(Date.UTC(2026, 9, 29, 21), Date.UTC(2026, 9, 30, 21), Date.now())
  ]);
  ok = true;
}
let SALT = null;
async function salt(db) {
  if (SALT) return SALT;
  let s = (await db.prepare("SELECT v FROM sc_meta WHERE k='salt'").first() || {}).v;
  if (!s) { await db.prepare("INSERT OR IGNORE INTO sc_meta(k,v) VALUES('salt',?)").bind(rid(24)).run(); s = (await db.prepare("SELECT v FROM sc_meta WHERE k='salt'").first()).v; }
  return (SALT = s);
}
export async function scDev(db, d) { d = String(d || ''); if (!/^[a-f0-9]{24,64}$/.test(d)) return null; return (await sha((await salt(db)) + ':d:' + d)).slice(0, 32); }
const ipOf = req => req.headers.get('cf-connecting-ip') || '0';
async function rate(db, k, lim, win) {
  const now = Date.now();
  const r = await db.prepare('INSERT INTO sc_rate(k,n,reset) VALUES(?1,1,?2) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN reset>?3 THEN n+1 ELSE 1 END, reset=CASE WHEN reset>?3 THEN reset ELSE ?2 END RETURNING n').bind(k, now + win, now).first();
  if (Math.random() < 0.01) await db.prepare('DELETE FROM sc_rate WHERE reset<?').bind(now - 864e5).run();
  return !r || r.n <= lim;
}
const dayIn = (tz, t = Date.now()) => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'Asia/Riyadh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t)); } catch (e) { return new Date(t + 3 * 36e5).toISOString().slice(0, 10); } };
const ymdParts = s => s.split('-').map(Number);

/* ---------- pages: مرضانا (s) and صفحة المتوفى + العزاء (m) ---------- */
function pubPage(p, me) { return { id: p.id, kind: p.kind, name: p.name, dua: p.dua || '', dates: p.dates || '', fun: p.fun || '', kid: p.kid || '', count: p.count || 0, created: p.created, mine: !!me && p.creator === me, hidden: !!p.hidden }; }

/* ---------- challenges ---------- */
async function rollChal(db, now) {
  // a weekly challenge whose window ended moves to the next one; its total is kept as last_count
  const r = await db.prepare('SELECT id,starts,ends,recur,count FROM sc_chal WHERE recur>0 AND ended=0 AND ends<=?').bind(now).all();
  for (const c of r.results || []) {
    const k = Math.floor((now - c.ends) / c.recur) + 1;
    await db.prepare('UPDATE sc_chal SET last_count=count, count=0, starts=starts+?1, ends=ends+?1 WHERE id=? AND ends=?').bind(k * c.recur, c.id, c.ends).run();
  }
}
function pubChal(c, now, mine) { const st = c.ended ? 'ended' : now < c.starts ? 'soon' : now < c.ends ? 'live' : 'ended'; return { id: c.id, title: c.title, dhikr: c.dhikr, goal: c.goal, count: c.count, starts: c.starts, ends: c.ends, recur: c.recur || 0, last: c.last_count, official: !!c.official, status: st, mine: mine || 0 }; }

/* ---------- family ---------- */
const CHEERS = ['ما شاء الله، الله يثبتك 🤍', 'استمر، فخور بك 💪', 'لا تنسَ وردك اليوم 📖', 'الله يجعلها في ميزان حسناتك 🌿', 'صلاة الفجر تنتظرك ⏰'];
function cleanShare(s) { s = s || {}; return { pr: !!s.pr, wp: !!s.wp, st: !!s.st }; }
function cleanData(d, sh) {
  d = d || {}; const o = { day: /^\d{4}-\d{2}-\d{2}$/.test(String(d.day || '')) ? d.day : '' };
  if (sh.pr && Array.isArray(d.pr)) o.pr = d.pr.slice(0, 5).map(x => x ? (x === 'j' ? 'j' : 1) : 0);
  if (sh.wp) o.wp = Math.max(0, Math.min(604, Math.round(+d.wp || 0)));
  if (sh.st && Array.isArray(d.kids)) o.kids = d.kids.slice(0, 8).map(k => ({ n: clean(k.n, 20), t: Math.max(0, Math.min(99, Math.round(+k.t || 0))), w: Math.max(0, Math.min(999, Math.round(+k.w || 0))) })).filter(k => k.n);
  return o;
}

/* ---------- Fajr buddy ---------- */
function budNext(row, now, deps, from) {
  // the moment to check this member: today's Fajr (their own city, method and tune) + their delay; past it → tomorrow's
  if (row.lat == null || row.lng == null) return null;
  const cfg = deps.cleanCfg(JSON.parse(row.cfg || '{}'));
  for (let i = 0; i < 3; i++) {
    const [y, m, d] = ymdParts(dayIn(row.tz, (from || now) + i * 864e5));
    const f = deps.prayerTimes(row.lat, row.lng, y, m, d, cfg).Fajr;
    const at = f + (row.delay || 20) * 60e3;
    if (at > (from || now)) return { at, day: dayIn(row.tz, f), fajr: f };
  }
  return null;
}
export async function budTick(env, now, deps, dry) {
  const db = env.DB; await schema(db);
  const out = { checked: 0, sent: 0, skipped: 0, nosub: 0, dry: !!dry, items: [] };
  const r = await db.prepare('SELECT * FROM sc_bud WHERE partner IS NOT NULL AND next_at IS NOT NULL AND next_at<=? ORDER BY next_at LIMIT 100').bind(now).all();
  const upd = [];
  for (const row of r.results || []) {
    out.checked++;
    const day = dayIn(row.tz, row.next_at - (row.delay || 20) * 60e3);
    let why = '';
    if (now - row.next_at > 3 * 36e5) why = 'stale';
    else if (row.fajr_day === day) why = 'logged';
    else if (row.sent_day === day) why = 'already';
    const it = { who: row.dev.slice(0, 6), day, due: row.next_at, decision: why ? 'skip:' + why : 'push_partner' };
    if (!why) {
      const p = await db.prepare('SELECT sub FROM sc_bud WHERE dev=?').bind(row.partner).first();
      const sub = p && p.sub ? await db.prepare('SELECT * FROM push_subs WHERE id=?').bind(p.sub).first().catch(() => null) : null;
      if (!sub) { it.decision = 'partner_has_no_push'; out.nosub++; }
      else if (!dry) {
        let res; try { res = await deps.sendPush(db, sub, { t: 'صاحبك ' + (row.name || '') + ' لم يسجّل الفجر', b: 'أيقظه! مرّ ' + AR(row.delay || 20) + ' دقيقة على الأذان', u: './#fajrbuddy', tag: 'fb' + day }, 1800, 'high'); } catch (e) { res = { status: 0 }; }
        it.status = res.status; if (res.status >= 200 && res.status < 300) out.sent++;
      }
      if (!dry) upd.push(db.prepare('UPDATE sc_bud SET sent_day=? WHERE dev=?').bind(day, row.dev));
    } else out.skipped++;
    if (!dry) { const nx = budNext(row, now, deps, Math.max(now, row.next_at) + 60e3); upd.push(db.prepare('UPDATE sc_bud SET next_at=? WHERE dev=?').bind(nx ? nx.at : null, row.dev)); }
    out.items.push(it);
  }
  if (upd.length) await db.batch(upd);
  return out;
}
async function subIdOf(endpoint) { if (typeof endpoint !== 'string' || !/^https:\/\//.test(endpoint)) return null; return (await sha(endpoint)).slice(0, 32); }

/* ---------- /go/<ref>: the share-app link that counts, then opens the download page ---------- */
function goPage(r) {
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>زاد — تطبيق المسلم</title>
<meta property="og:title" content="زاد — تطبيق المسلم"><meta property="og:description" content="تحميل التطبيق للأندرويد وطريقة التثبيت على الآيفون — مجاني وبدون إعلانات"><meta property="og:image" content="https://zad-app.sites.tab.bot/og-v4.jpg"><meta property="og:image:width" content="1080"><meta property="og:image:height" content="1350"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#34457a"><meta name="robots" content="noindex">
<style>body{margin:0;font-family:system-ui,sans-serif;background:#f6f4ef;color:#1d2545;display:grid;place-items:center;min-height:100vh}a{color:#34457a}</style></head><body><p>جارٍ فتح صفحة تحميل «زاد»… <a href="https://zad-app.sites.tab.bot/">اضغط هنا</a></p>
<script>(function(){var r=${JSON.stringify(r)},d='';try{d=localStorage.getItem('zad.dev')||localStorage.getItem('zad.go')||'';if(!d){d=Array.from(crypto.getRandomValues(new Uint8Array(16)),function(x){return(x<16?'0':'')+x.toString(16)}).join('');localStorage.setItem('zad.go',d)}}catch(e){}
var go=function(){location.replace('https://zad-app.sites.tab.bot/')};try{fetch('/api/social/ref/hit',{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({r:r,dev:d}),keepalive:true}).then(go,go)}catch(e){go()}setTimeout(go,1500)})()</script></body></html>`;
}

async function delHalaqa(db, code) { await db.batch([db.prepare('DELETE FROM sc_halaqa_mem WHERE hid=?').bind(code), db.prepare('DELETE FROM sc_halaqa_log WHERE hid=?').bind(code), db.prepare('DELETE FROM sc_halaqa_ban WHERE hid=?').bind(code), db.prepare('DELETE FROM sc_cheer WHERE fid=?').bind('h:' + code), db.prepare("DELETE FROM sc_reports WHERE target=? OR target LIKE ?").bind('hq:' + code, 'hn:' + code + ':%'), db.prepare('DELETE FROM sc_halaqa WHERE id=?').bind(code)]); }
export async function social(u, req, env, ctx, deps) {
  const db = env.DB; if (!db) return E('no database', 500);
  await schema(db);
  if (u.pathname.startsWith('/go/')) {
    const r = u.pathname.slice(4).replace(/\/$/, '');
    if (!REF_RE.test(r)) return Response.redirect('https://zad-app.sites.tab.bot/', 302);
    return new Response(goPage(r), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
  }
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST', 'Access-Control-Allow-Headers': 'Content-Type,X-Zad-Dev' } });
  const p = u.pathname.slice('/api/social/'.length).replace(/\/$/, '');
  const M = req.method;
  if (p.startsWith('vx/')) { // v5.4 «مقاطع زاد» (srv/zv.js) — the same Diwaniya identity, device hash, limits and filters
    const dev = await scDev(db, req.headers.get('x-zad-dev') || u.searchParams.get('dev'));
    const ip = (await sha((await salt(db)) + ':ip:' + ipOf(req))).slice(0, 24);
    const W = async (k, lim, win) => !!dev && (await rate(db, k + ':' + dev, lim, win)) && (await rate(db, k + ':ip:' + ip, lim * 8, win));
    const bad = (...xs) => xs.some(x => x && (deps.badWord(x) || extraBad(x)));
    return zvApi({ u, req, env, ctx, deps, dev, ip, W, bad, phoney, p, M });
  }
  if (p.startsWith('dw/')) { // v5.0 «ديوانية زاد» (srv/dw.js) — same device hash, sc_rate limits, word filter and phone/link rule as the rest of /api/social
    const dev = await scDev(db, req.headers.get('x-zad-dev') || u.searchParams.get('dev'));
    const ip = (await sha((await salt(db)) + ':ip:' + ipOf(req))).slice(0, 24);
    const W = async (k, lim, win) => !!dev && (await rate(db, k + ':' + dev, lim, win)) && (await rate(db, k + ':ip:' + ip, lim * 8, win));
    const bad = (...xs) => xs.some(x => x && (deps.badWord(x) || extraBad(x)));
    return dwApi({ u, req, env, ctx, deps, dev, W, bad, phoney, p, M });
  }
  let b = {};
  if (M === 'POST') { try { const t = await req.text(); if (t.length > 8000) return E('too big', 413); b = t ? JSON.parse(t) : {}; } catch (e) { return E('bad json'); } }
  const dev = await scDev(db, req.headers.get('x-zad-dev') || b.dev || u.searchParams.get('dev'));
  const now = Date.now();
  const ip = (await sha((await salt(db)) + ':ip:' + ipOf(req))).slice(0, 24);
  const W = async (k, lim, win) => (await rate(db, k + ':' + dev, lim, win)) && (await rate(db, k + ':ip:' + ip, lim * 8, win));
  const needDev = () => dev ? null : E('device');
  const bad = (...xs) => xs.some(x => x && (deps.badWord(x) || extraBad(x)));

  /* ---- «أجرك الجاري» ---- */
  if (p === 'ref/reg' && M === 'POST') {
    if (needDev()) return needDev(); const r = String(b.r || ''); if (!REF_RE.test(r)) return E('bad ref');
    if (!(await W('rr', 10, 864e5))) return E('rate', 429);
    await db.prepare('INSERT OR IGNORE INTO sc_ref (r,owner,n,created) VALUES (?,?,0,?)').bind(r, dev, now).run();
    const row = await db.prepare('SELECT owner,n FROM sc_ref WHERE r=?').bind(r).first();
    return row.owner === dev ? J({ ok: true, n: row.n }) : E('taken', 409);
  }
  if (p === 'ref/hit' && M === 'POST') {
    const r = String(b.r || ''); if (!REF_RE.test(r)) return E('bad ref');
    if (!(await rate(db, 'rh:ip:' + ip, 200, 864e5))) return J({ ok: true, counted: false });
    const row = await db.prepare('SELECT owner FROM sc_ref WHERE r=?').bind(r).first();
    if (!row) return J({ ok: true, counted: false });
    const who = dev || ('ip:' + ip);
    if (who === row.owner) return J({ ok: true, counted: false, own: true });
    const ins = await db.prepare('INSERT OR IGNORE INTO sc_ref_hit (r,who,at) VALUES (?,?,?)').bind(r, who, now).run();
    if (ins.meta.changes) await db.prepare('UPDATE sc_ref SET n=n+1 WHERE r=?').bind(r).run();
    return J({ ok: true, counted: !!ins.meta.changes });
  }
  if (p === 'ref/count') {
    if (needDev()) return needDev(); const r = String(u.searchParams.get('r') || b.r || '');
    const row = REF_RE.test(r) ? await db.prepare('SELECT owner,n FROM sc_ref WHERE r=?').bind(r).first() : null;
    if (!row || row.owner !== dev) return J({ ok: true, n: 0, reg: false });
    return J({ ok: true, n: row.n, reg: true });
  }

  /* ---- pages ---- */
  if (p === 'page/create' && M === 'POST') {
    if (needDev()) return needDev();
    const kind = b.kind === 'm' ? 'm' : 's';
    let name = clean(b.name, kind === 's' ? 20 : 40);
    if (kind === 's') name = name.split(' ').slice(0, 2).join(' ');
    const dua = clean(b.dua, 140), dates = clean(b.dates, 50), fun = kind === 'm' ? clean(b.fun, 180) : '';
    if (!name) return E('name', 400, 'اكتب الاسم');
    if (bad(name, dua, dates, fun)) return E('bad', 400, 'توجد كلمات غير لائقة');
    if ([name, dua, dates, fun].some(phoney)) return E('phone', 400, 'لا تكتب أرقام جوالات أو روابط في الصفحة');
    if (!(await W('pc', 6, 864e5))) return E('rate', 429, 'وصلت الحد اليومي، حاول غدًا');
    const id = rid(10), kid = ID_RE.test(String(b.kid || '')) ? b.kid : null;
    await db.prepare('INSERT INTO sc_pages (id,kind,name,dua,dates,fun,kid,creator,created,updated,count) VALUES (?,?,?,?,?,?,?,?,?,?,0)').bind(id, kind, name, dua, dates, fun, kid, dev, now, now).run();
    return J({ ok: true, page: pubPage(await db.prepare('SELECT * FROM sc_pages WHERE id=?').bind(id).first(), dev) });
  }
  if (p === 'page/get') {
    const id = String(u.searchParams.get('id') || ''); if (!ID_RE.test(id)) return E('bad id');
    const pg = await db.prepare('SELECT * FROM sc_pages WHERE id=?').bind(id).first();
    if (!pg) return E('not found', 404, 'الصفحة غير موجودة أو حُذفت');
    if (pg.hidden && pg.creator !== dev) return E('hidden', 410, 'هذه الصفحة قيد المراجعة');
    const tz = String(u.searchParams.get('tz') || 'Asia/Riyadh');
    const did = dev ? !!(await db.prepare('SELECT 1 x FROM sc_pray WHERE pid=? AND dev=? AND day=?').bind(id, dev, dayIn(tz)).first()) : false;
    return J({ ok: true, page: pubPage(pg, dev), prayed: did });
  }
  if (p === 'page/pray' && M === 'POST') {
    if (needDev()) return needDev(); const id = String(b.id || ''); if (!ID_RE.test(id)) return E('bad id');
    const pg = await db.prepare('SELECT id,hidden FROM sc_pages WHERE id=?').bind(id).first(); if (!pg || pg.hidden) return E('not found', 404);
    if (!(await W('pp', 120, 864e5))) return E('rate', 429);
    const ins = await db.prepare('INSERT OR IGNORE INTO sc_pray (pid,dev,day) VALUES (?,?,?)').bind(id, dev, dayIn(String(b.tz || 'Asia/Riyadh'))).run();
    if (ins.meta.changes) await db.prepare('UPDATE sc_pages SET count=count+1 WHERE id=?').bind(id).run();
    const r = await db.prepare('SELECT count FROM sc_pages WHERE id=?').bind(id).first();
    return J({ ok: true, count: r.count, counted: !!ins.meta.changes });
  }
  if ((p === 'page/edit' || p === 'page/delete') && M === 'POST') {
    if (needDev()) return needDev(); const id = String(b.id || ''); if (!ID_RE.test(id)) return E('bad id');
    const pg = await db.prepare('SELECT * FROM sc_pages WHERE id=?').bind(id).first(); if (!pg) return E('not found', 404);
    if (pg.creator !== dev) return E('creator only', 403, 'هذا الخيار لمنشئ الصفحة فقط');
    if (p === 'page/delete') { await db.batch([db.prepare('DELETE FROM sc_pages WHERE id=?').bind(id), db.prepare('DELETE FROM sc_pray WHERE pid=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('p:' + id)]); return J({ ok: true, deleted: id }); }
    const dua = b.dua != null ? clean(b.dua, 140) : pg.dua, dates = b.dates != null ? clean(b.dates, 50) : pg.dates, fun = pg.kind === 'm' && b.fun != null ? clean(b.fun, 180) : pg.fun;
    const kid = b.kid === '' ? null : ID_RE.test(String(b.kid || '')) ? b.kid : pg.kid;
    if (bad(dua, dates, fun)) return E('bad', 400, 'توجد كلمات غير لائقة');
    if ([dua, dates, fun].some(phoney)) return E('phone', 400, 'لا تكتب أرقام جوالات أو روابط في الصفحة');
    await db.prepare('UPDATE sc_pages SET dua=?, dates=?, fun=?, kid=?, updated=? WHERE id=?').bind(dua, dates, fun, kid, now, id).run();
    return J({ ok: true, page: pubPage(await db.prepare('SELECT * FROM sc_pages WHERE id=?').bind(id).first(), dev) });
  }

  /* ---- «إبلاغ» (pages and khatmas; ≥3 reports hide it until the admin looks) ---- */
  if (p === 'report' && M === 'POST') {
    if (needDev()) return needDev();
    const t = b.t === 'k' ? 'k' : b.t === 'p' ? 'p' : ''; const id = String(b.id || '');
    if (!t || !ID_RE.test(id)) return E('bad target');
    if (!(await W('rp', 30, 864e5))) return E('rate', 429);
    const ins = await db.prepare('INSERT OR IGNORE INTO sc_reports (target,dev,at,reason) VALUES (?,?,?,?)').bind(t + ':' + id, dev, now, clean(b.reason, 60)).run();
    if (ins.meta.changes) {
      if (t === 'p') await db.prepare('UPDATE sc_pages SET reports=reports+1, hidden=CASE WHEN reports+1>=? THEN 1 ELSE hidden END WHERE id=?').bind(HIDE_AT, id).run();
      else await db.prepare('UPDATE zk_khatma SET reports=COALESCE(reports,0)+1, hidden=CASE WHEN COALESCE(reports,0)+1>=? THEN 1 ELSE COALESCE(hidden,0) END WHERE id=?').bind(HIDE_AT, id).run();
    }
    return J({ ok: true, new: !!ins.meta.changes });
  }

  /* ---- challenges ---- */
  if (p === 'chal/list') {
    await rollChal(db, now);
    const r = await db.prepare('SELECT * FROM sc_chal WHERE ended=0 OR ends>? ORDER BY official DESC, starts ASC LIMIT 20').bind(now - 7 * 864e5).all();
    const rows = r.results || [];
    const mine = {};
    if (dev && rows.length) { const q = await db.prepare(`SELECT cid,per,n FROM sc_chal_dev WHERE dev=? AND cid IN (${rows.map(() => '?').join(',')})`).bind(dev, ...rows.map(c => c.id)).all(); (q.results || []).forEach(x => { const c = rows.find(y => y.id === x.cid); if (c && x.per === c.starts) mine[x.cid] = x.n; }); }
    return J({ ok: true, now, items: rows.map(c => pubChal(c, now, mine[c.id])) });
  }
  if (p === 'chal/add' && M === 'POST') {
    if (needDev()) return needDev(); const id = String(b.id || '').slice(0, 40); const n = Math.round(+b.n || 0);
    if (!(n >= 1 && n <= 1000)) return E('bad n');
    await rollChal(db, now);
    const c = await db.prepare('SELECT * FROM sc_chal WHERE id=?').bind(id).first(); if (!c) return E('not found', 404);
    if (c.ended || now < c.starts || now >= c.ends + 120e3) return E('closed', 409, 'التحدي غير مفتوح الآن');
    if (!(await rate(db, 'ca:' + dev, 30, 60e3))) return E('rate', 429);
    const tot = await db.prepare('SELECT per,n FROM sc_chal_dev WHERE cid=? AND dev=?').bind(id, dev).first();
    const cur = tot && tot.per === c.starts ? tot.n : 0;
    if (cur + n > 50000) return E('cap', 429, 'وصلت الحد لهذا التحدي، بارك الله فيك');
    const [r1] = await db.batch([
      db.prepare('UPDATE sc_chal SET count=count+? WHERE id=? RETURNING count').bind(n, id),
      db.prepare('INSERT INTO sc_chal_dev (cid,dev,per,n) VALUES (?1,?2,?3,?4) ON CONFLICT(cid,dev) DO UPDATE SET n=CASE WHEN per=?3 THEN n+?4 ELSE ?4 END, per=?3').bind(id, dev, c.starts, n)
    ]);
    return J({ ok: true, count: (r1.results && r1.results[0] || {}).count, mine: cur + n });
  }


  /* ---- v4.9 «حلقة التحفيظ»: private circles (≤30), progress board, «شجّع», teacher = creator ---- */
  if (p.startsWith('halaqa/')) {
    if (needDev()) return needDev();
    const code = String(b.code || u.searchParams.get('code') || '').toUpperCase();
    const okText = (...xs) => !bad(...xs) && !xs.some(x => x && phoney(x));
    const tgt = t => { t = t || {}; const k = t.k === 'j' ? 'j' : t.k === 'p' ? 'p' : 's'; const v = Math.max(1, Math.min(k === 'j' ? 30 : k === 'p' ? 604 : 114, Math.round(+t.v || 1))); return { k, v }; };
    const rng = r => { r = r || {}; const s = Math.max(1, Math.min(114, Math.round(+r.s || 0))); if (!+r.s) return null; const a1 = Math.max(1, Math.min(286, Math.round(+r.a1 || 1))); const a2 = Math.max(a1, Math.min(286, Math.round(+r.a2 || a1))); return { s, a1, a2 }; };
    if (p === 'halaqa/create' && M === 'POST') {
      const name = clean(b.name, 40), me = clean(b.me, 20);
      if (!name) return E('name', 400, 'اكتب اسم الحلقة'); if (!me) return E('me', 400, 'اكتب اسمك');
      if (!okText(name, me)) return E('bad', 400, 'توجد كلمات أو أرقام أو روابط غير مسموح بها');
      if (!(await W('hc', 5, 864e5))) return E('rate', 429, 'وصلت الحد اليومي لإنشاء الحلقات');
      let id = rid(6, AC); for (let i = 0; i < 4 && (await db.prepare('SELECT 1 x FROM sc_halaqa WHERE id=?').bind(id).first() || await db.prepare('SELECT 1 x FROM sc_fam WHERE id=?').bind(id).first()); i++) id = rid(6, AC);
      await db.batch([db.prepare('INSERT INTO sc_halaqa (id,name,target,owner,weekly,created,updated) VALUES (?,?,?,?,?,?,?)').bind(id, name, JSON.stringify(tgt(b.target)), dev, '{}', now, now),
        db.prepare("INSERT INTO sc_halaqa_mem (hid,dev,mid,name,role,prog,joined,at) VALUES (?,?,?,?,'t','{}',?,?)").bind(id, dev, rid(8), me, now, now)]);
      return J({ ok: true, code: id });
    }
    if (!CODE_RE.test(code)) return E('bad code', 400, 'رمز الحلقة غير صحيح');
    const hq = await db.prepare('SELECT * FROM sc_halaqa WHERE id=?').bind(code).first();
    if (!hq) return E('not found', 404, 'لم نجد حلقة بهذا الرمز');
    const owner = hq.owner === dev;
    if (hq.hidden && !owner) return E('hidden', 410, 'هذه الحلقة موقوفة للمراجعة');
    let me = await db.prepare('SELECT * FROM sc_halaqa_mem WHERE hid=? AND dev=?').bind(code, dev).first();
    if (p === 'halaqa/peek') { const n = await db.prepare('SELECT COUNT(*) n FROM sc_halaqa_mem WHERE hid=?').bind(code).first(); return J({ ok: true, halaqa: { code, name: hq.name, target: JSON.parse(hq.target || '{}'), n: n.n }, member: !!me }); }
    if (p === 'halaqa/join' && M === 'POST') {
      const nm = clean(b.me, 20);
      if (!nm) return E('me', 400, 'اكتب اسمك'); if (!okText(nm)) return E('bad', 400, 'اختر اسمًا آخر');
      if (!(await W('hj', 20, 864e5))) return E('rate', 429, 'محاولات كثيرة، حاول لاحقًا');
      if (await db.prepare('SELECT 1 x FROM sc_halaqa_ban WHERE hid=? AND dev=?').bind(code, dev).first()) return E('removed', 403, 'أزالك معلّم الحلقة منها');
      if (!me) {
        const n = await db.prepare('SELECT COUNT(*) n FROM sc_halaqa_mem WHERE hid=?').bind(code).first(); if (n.n >= 30) return E('full', 409, 'الحلقة ممتلئة (٣٠ عضوًا)');
        await db.prepare("INSERT INTO sc_halaqa_mem (hid,dev,mid,name,role,prog,joined,at) VALUES (?,?,?,?,'s','{}',?,?)").bind(code, dev, rid(8), nm, now, now).run();
      } else await db.prepare('UPDATE sc_halaqa_mem SET name=? WHERE hid=? AND dev=?').bind(nm, code, dev).run();
      me = await db.prepare('SELECT * FROM sc_halaqa_mem WHERE hid=? AND dev=?').bind(code, dev).first();
    }
    if (!me) return E('not member', 403, 'لست عضوًا في هذه الحلقة');
    const teacher = me.role === 't';
    if (p === 'halaqa/leave' && M === 'POST') {
      await db.batch([db.prepare('DELETE FROM sc_halaqa_mem WHERE hid=? AND dev=?').bind(code, dev), db.prepare('DELETE FROM sc_halaqa_log WHERE hid=? AND mid=?').bind(code, me.mid), db.prepare('DELETE FROM sc_cheer WHERE fid=? AND to_mid=?').bind('h:' + code, me.mid)]);
      const n = await db.prepare('SELECT COUNT(*) n FROM sc_halaqa_mem WHERE hid=?').bind(code).first();
      if (!n.n) await delHalaqa(db, code);
      else if (teacher) { // the circle keeps a teacher: the longest-standing member takes over
        const nx = await db.prepare('SELECT dev FROM sc_halaqa_mem WHERE hid=? ORDER BY joined LIMIT 1').bind(code).first();
        if (nx) await db.batch([db.prepare("UPDATE sc_halaqa_mem SET role='t' WHERE hid=? AND dev=?").bind(code, nx.dev), db.prepare('UPDATE sc_halaqa SET owner=? WHERE id=?').bind(nx.dev, code)]);
      }
      return J({ ok: true, left: code });
    }
    if (p === 'halaqa/delete' && M === 'POST') { if (!teacher) return E('teacher', 403, 'للمعلّم فقط'); await delHalaqa(db, code); return J({ ok: true, deleted: code }); }
    if (p === 'halaqa/progress' && M === 'POST') {
      if (!(await rate(db, 'hp:' + dev, 60, 3600e3))) return E('rate', 429, 'محاولات كثيرة، حاول لاحقًا');
      const r = rng(b.range); if (!r) return E('range', 400, 'اختر المقطع');
      const score = Math.max(0, Math.min(100, Math.round(+b.score || 0))), src = b.src === 'v' ? 'v' : 's';
      const today = dayIn(b.tz), day = /^\d{4}-\d\d-\d\d$/.test(b.day || '') && Math.abs(Date.parse(b.day) - Date.parse(today)) <= 864e5 ? b.day : today;
      const note = clean(b.note, 80); if (note && !okText(note)) return E('bad', 400, 'الملاحظة فيها كلمات أو أرقام أو روابط غير مسموحة');
      const prev = me.last_day; let streak = +me.streak || 0;
      if (prev !== day) { const y = new Date(Date.parse(day) - 864e5).toISOString().slice(0, 10); streak = prev === y ? streak + 1 : 1; }
      else streak = Math.max(1, streak);
      const prog = { day, s: r.s, a1: r.a1, a2: r.a2, score, src };
      const st = [db.prepare('UPDATE sc_halaqa_mem SET prog=?, streak=?, last_day=?, at=? WHERE hid=? AND dev=?').bind(JSON.stringify(prog), streak, day, now, code, dev),
        db.prepare('INSERT INTO sc_halaqa_log (hid,mid,day,rng,score,src,at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(hid,mid,day) DO UPDATE SET rng=excluded.rng, score=MAX(score,excluded.score), src=excluded.src, at=excluded.at').bind(code, me.mid, day, JSON.stringify(r), score, src, now)];
      if (b.note !== undefined) st.push(db.prepare('UPDATE sc_halaqa_mem SET note=?, note_at=?, note_rep=0, note_hidden=0 WHERE hid=? AND dev=?').bind(note || null, note ? now : null, code, dev));
      if (Math.random() < 0.02) st.push(db.prepare('DELETE FROM sc_halaqa_log WHERE at<?').bind(now - 60 * 864e5));
      await db.batch(st);
      me = await db.prepare('SELECT * FROM sc_halaqa_mem WHERE hid=? AND dev=?').bind(code, dev).first();
    }
    if (p === 'halaqa/set' && M === 'POST') { // teacher: the weekly target «المقرر» (and the circle's name/target)
      if (!teacher) return E('teacher', 403, 'للمعلّم فقط');
      if (!(await rate(db, 'hs:' + dev, 40, 864e5))) return E('rate', 429);
      const up = [];
      if (b.weekly !== undefined) { const r = rng(b.weekly), t = clean(b.weekly && b.weekly.t, 60); if (t && !okText(t)) return E('bad', 400, 'نص المقرر فيه كلمات أو أرقام أو روابط غير مسموحة'); up.push(db.prepare('UPDATE sc_halaqa SET weekly=?, weekly_at=?, updated=? WHERE id=?').bind(JSON.stringify(r || t ? { ...(r || {}), t } : {}), now, now, code)); }
      if (b.name !== undefined) { const nm = clean(b.name, 40); if (!nm || !okText(nm)) return E('bad', 400, 'اختر اسمًا آخر'); up.push(db.prepare('UPDATE sc_halaqa SET name=?, updated=? WHERE id=?').bind(nm, now, code)); }
      if (b.target !== undefined) up.push(db.prepare('UPDATE sc_halaqa SET target=?, updated=? WHERE id=?').bind(JSON.stringify(tgt(b.target)), now, code));
      if (up.length) await db.batch(up);
    }
    if (p === 'halaqa/remove' && M === 'POST') { // teacher removes a member (and they cannot re-join with the code)
      if (!teacher) return E('teacher', 403, 'للمعلّم فقط');
      const t = await db.prepare('SELECT * FROM sc_halaqa_mem WHERE hid=? AND mid=?').bind(code, String(b.mid || '')).first(); if (!t) return E('not found', 404);
      if (t.dev === dev) return E('self', 400, 'لا تستطيع إزالة نفسك؛ استخدم «مغادرة»');
      await db.batch([db.prepare('DELETE FROM sc_halaqa_mem WHERE hid=? AND dev=?').bind(code, t.dev), db.prepare('DELETE FROM sc_halaqa_log WHERE hid=? AND mid=?').bind(code, t.mid), db.prepare('DELETE FROM sc_cheer WHERE fid=? AND to_mid=?').bind('h:' + code, t.mid), db.prepare('INSERT OR IGNORE INTO sc_halaqa_ban (hid,dev,at) VALUES (?,?,?)').bind(code, t.dev, now)]);
    }
    if (p === 'halaqa/cheer' && M === 'POST') {
      const to = String(b.to || ''); const m = Math.max(0, Math.min(CHEERS.length - 1, Math.round(+b.m || 0)));
      const t = await db.prepare('SELECT mid,dev FROM sc_halaqa_mem WHERE hid=? AND mid=?').bind(code, to).first(); if (!t) return E('not found', 404);
      if (t.dev === dev) return E('self', 400);
      if (!(await rate(db, 'he:' + dev, 60, 864e5)) || !(await rate(db, 'he2:' + dev + ':' + to, 5, 864e5))) return E('rate', 429, 'يكفي تشجيعًا اليوم 😊');
      await db.prepare('INSERT INTO sc_cheer (fid,to_mid,from_name,msg,at) VALUES (?,?,?,?,?)').bind('h:' + code, to, me.name, m, now).run();
      return J({ ok: true });
    }
    if (p === 'halaqa/report' && M === 'POST') { // a member's note (mid) or the circle itself; 3 distinct devices → hidden
      if (!(await W('rp', 30, 864e5))) return E('rate', 429);
      const mid = String(b.mid || ''); let target;
      if (mid) { const t = await db.prepare('SELECT mid FROM sc_halaqa_mem WHERE hid=? AND mid=?').bind(code, mid).first(); if (!t) return E('not found', 404); target = 'hn:' + code + ':' + mid; }
      else target = 'hq:' + code;
      const ins = await db.prepare('INSERT OR IGNORE INTO sc_reports (target,dev,at,reason) VALUES (?,?,?,?)').bind(target, dev, now, clean(b.reason, 60)).run();
      if (ins.meta.changes) {
        if (mid) await db.prepare('UPDATE sc_halaqa_mem SET note_rep=note_rep+1, note_hidden=CASE WHEN note_rep+1>=? THEN 1 ELSE note_hidden END WHERE hid=? AND mid=?').bind(HIDE_AT, code, mid).run();
        else await db.prepare('UPDATE sc_halaqa SET reports=reports+1, hidden=CASE WHEN reports+1>=? THEN 1 ELSE hidden END WHERE id=?').bind(HIDE_AT, code).run();
      }
      return J({ ok: true, new: !!ins.meta.changes });
    }
    if (['halaqa/get', 'halaqa/join', 'halaqa/progress', 'halaqa/set', 'halaqa/remove'].includes(p)) {
      const h2 = await db.prepare('SELECT * FROM sc_halaqa WHERE id=?').bind(code).first();
      const r = await db.prepare('SELECT mid,name,role,prog,streak,last_day,note,note_at,note_hidden,dev,joined FROM sc_halaqa_mem WHERE hid=? ORDER BY at DESC').bind(code).all();
      const since = new Date(now - 7 * 864e5).toISOString().slice(0, 10);
      const lg = await db.prepare('SELECT mid,day,score FROM sc_halaqa_log WHERE hid=? AND day>=? ORDER BY day').bind(code, since).all();
      const week = {}; (lg.results || []).forEach(x => { (week[x.mid] = week[x.mid] || []).push([x.day, x.score]); });
      const members = (r.results || []).map(x => ({ mid: x.mid, name: x.name, role: x.role, me: x.dev === dev, prog: JSON.parse(x.prog || '{}'), streak: +x.streak || 0, last: x.last_day || '', note: x.note_hidden ? '' : (x.note || ''), note_hidden: !!x.note_hidden && x.dev === dev, week: week[x.mid] || [] }));
      const ch = await db.prepare('SELECT id,from_name,msg,at FROM sc_cheer WHERE fid=? AND to_mid=? AND seen=0 ORDER BY id DESC LIMIT 10').bind('h:' + code, me.mid).all();
      const cheers = (ch.results || []).map(c => ({ from: c.from_name, text: CHEERS[c.msg] || '', at: c.at }));
      if (cheers.length && p === 'halaqa/get') await db.prepare('UPDATE sc_cheer SET seen=1 WHERE fid=? AND to_mid=? AND seen=0').bind('h:' + code, me.mid).run();
      return J({ ok: true, halaqa: { code, name: h2.name, target: JSON.parse(h2.target || '{}'), weekly: JSON.parse(h2.weekly || '{}'), weekly_at: h2.weekly_at || 0, hidden: !!h2.hidden, max: 30 }, me: { mid: me.mid, role: me.role, teacher: me.role === 't' }, members, cheers, msgs: CHEERS, today: dayIn(u.searchParams.get('tz') || b.tz) });
    }
    return E('not found', 404);
  }

  /* ---- family circles ---- */
  if (p.startsWith('fam/')) {
    if (needDev()) return needDev();
    const code = String(b.code || u.searchParams.get('code') || '').toUpperCase();
    if (p === 'fam/create' && M === 'POST') {
      const name = clean(b.name, 30) || 'عائلتي', me = clean(b.me, 20), role = b.role === 'parent' ? 'parent' : b.role === 'child' ? 'child' : 'member';
      if (!me) return E('name', 400, 'اكتب اسمك');
      if (bad(name, me)) return E('bad', 400, 'توجد كلمات غير لائقة'); if (phoney(name) || phoney(me)) return E('phone', 400, 'بدون أرقام');
      if (!(await W('fc', 5, 864e5))) return E('rate', 429, 'وصلت الحد اليومي');
      let id = rid(6, AC); for (let i = 0; i < 3 && await db.prepare('SELECT 1 x FROM sc_fam WHERE id=?').bind(id).first(); i++) id = rid(6, AC);
      await db.batch([db.prepare('INSERT INTO sc_fam (id,name,owner,created) VALUES (?,?,?,?)').bind(id, name, dev, now),
        db.prepare("INSERT INTO sc_fam_mem (fid,dev,mid,name,role,share,data,at) VALUES (?,?,?,?,?,'{}','{}',?)").bind(id, dev, rid(8), me, role, now)]);
      return J({ ok: true, code: id });
    }
    if (!CODE_RE.test(code)) return E('bad code', 400, 'رمز الدائرة غير صحيح');
    const fam = await db.prepare('SELECT * FROM sc_fam WHERE id=?').bind(code).first();
    if (!fam) return E('not found', 404, 'لم نجد دائرة بهذا الرمز');
    let me = await db.prepare('SELECT * FROM sc_fam_mem WHERE fid=? AND dev=?').bind(code, dev).first();
    if (p === 'fam/join' && M === 'POST') {
      const nm = clean(b.me, 20), role = b.role === 'parent' ? 'parent' : b.role === 'child' ? 'child' : 'member';
      if (!nm) return E('name', 400, 'اكتب اسمك'); if (bad(nm) || phoney(nm)) return E('bad', 400, 'اختر اسمًا آخر');
      if (!(await W('fj', 20, 864e5))) return E('rate', 429);
      if (!me) {
        const n = await db.prepare('SELECT COUNT(*) n FROM sc_fam_mem WHERE fid=?').bind(code).first(); if (n.n >= 25) return E('full', 409, 'الدائرة ممتلئة (٢٥ عضو)');
        await db.prepare("INSERT INTO sc_fam_mem (fid,dev,mid,name,role,share,data,at) VALUES (?,?,?,?,?,'{}','{}',?)").bind(code, dev, rid(8), nm, role, now).run();
      } else await db.prepare('UPDATE sc_fam_mem SET name=?, role=? WHERE fid=? AND dev=?').bind(nm, role, code, dev).run();
      me = await db.prepare('SELECT * FROM sc_fam_mem WHERE fid=? AND dev=?').bind(code, dev).first();
    }
    if (!me) return E('not member', 403, 'لست عضوًا في هذه الدائرة');
    if (p === 'fam/leave' && M === 'POST') {
      await db.prepare('DELETE FROM sc_fam_mem WHERE fid=? AND dev=?').bind(code, dev).run();
      await db.prepare('DELETE FROM sc_cheer WHERE fid=? AND to_mid=?').bind(code, me.mid).run();
      const n = await db.prepare('SELECT COUNT(*) n FROM sc_fam_mem WHERE fid=?').bind(code).first();
      if (!n.n) await db.batch([db.prepare('DELETE FROM sc_fam WHERE id=?').bind(code), db.prepare('DELETE FROM sc_cheer WHERE fid=?').bind(code)]);
      return J({ ok: true, left: code });
    }
    if (p === 'fam/sync' && M === 'POST') {
      if (!(await rate(db, 'fs:' + dev, 120, 3600e3))) return E('rate', 429);
      const sh = cleanShare(b.share), data = cleanData(b.data, sh);
      const role = b.role === 'parent' ? 'parent' : b.role === 'child' ? 'child' : b.role === 'member' ? 'member' : me.role;
      const sub = b.endpoint === null ? null : (await subIdOf(b.endpoint)) || me.sub;
      await db.prepare('UPDATE sc_fam_mem SET share=?, data=?, role=?, sub=?, at=? WHERE fid=? AND dev=?').bind(JSON.stringify(sh), JSON.stringify(data), role, sub, now, code, dev).run();
      me = await db.prepare('SELECT * FROM sc_fam_mem WHERE fid=? AND dev=?').bind(code, dev).first();
    }
    if (p === 'fam/cheer' && M === 'POST') {
      const to = String(b.to || ''); const m = Math.max(0, Math.min(CHEERS.length - 1, Math.round(+b.m || 0)));
      const t = await db.prepare('SELECT * FROM sc_fam_mem WHERE fid=? AND mid=?').bind(code, to).first(); if (!t) return E('not found', 404);
      if (t.dev === dev) return E('self', 400);
      if (!(await rate(db, 'fe:' + dev, 40, 864e5)) || !(await rate(db, 'fe2:' + dev + ':' + to, 6, 864e5))) return E('rate', 429, 'يكفي تشجيعًا اليوم 😊');
      await db.prepare('INSERT INTO sc_cheer (fid,to_mid,from_name,msg,at) VALUES (?,?,?,?,?)').bind(code, to, me.name, m, now).run();
      let pushed = false, push_status = null;
      if (t.sub) {
        const sub = await db.prepare('SELECT * FROM push_subs WHERE id=?').bind(t.sub).first().catch(() => null);
        if (sub) { try { const r = await deps.sendPush(db, sub, { t: me.name + ' يشجّعك', b: CHEERS[m], u: './#family/' + code, tag: 'fc' + code }, 7200, 'normal'); push_status = r.status; pushed = r.status >= 200 && r.status < 300; } catch (e) { push_status = 0; } }
      }
      return J({ ok: true, pushed, push_status, has_push: !!t.sub });
    }
    if (p === 'fam/get' || p === 'fam/sync' || p === 'fam/join') {
      const r = await db.prepare('SELECT mid,name,role,share,data,sub,at,dev FROM sc_fam_mem WHERE fid=? ORDER BY at DESC').bind(code).all();
      const isParent = me.role === 'parent';
      const members = (r.results || []).map(x => {
        const sh = JSON.parse(x.share || '{}'), d = JSON.parse(x.data || '{}');
        const o = { mid: x.mid, name: x.name, role: x.role, me: x.dev === dev, at: x.at, push: !!x.sub, day: d.day || '' };
        if (sh.pr) o.pr = d.pr; if (sh.wp) o.wp = d.wp;
        if (sh.st && (isParent || x.dev === dev)) o.kids = d.kids || []; // kids' stars: only parents see them
        if (x.dev === dev) o.share = sh;
        return o;
      });
      const ch = await db.prepare('SELECT id,from_name,msg,at FROM sc_cheer WHERE fid=? AND to_mid=? AND seen=0 ORDER BY id DESC LIMIT 10').bind(code, me.mid).all();
      const cheers = (ch.results || []).map(c => ({ from: c.from_name, text: CHEERS[c.msg] || '', at: c.at }));
      if (cheers.length && p === 'fam/get') await db.prepare('UPDATE sc_cheer SET seen=1 WHERE fid=? AND to_mid=? AND seen=0').bind(code, me.mid).run();
      return J({ ok: true, fam: { code, name: fam.name, owner: fam.owner === dev }, me: { mid: me.mid, role: me.role }, members, cheers, msgs: CHEERS });
    }
    return E('not found', 404);
  }

  /* ---- أيقظني للفجر ---- */
  if (p.startsWith('bud/')) {
    if (needDev()) return needDev();
    let me = await db.prepare('SELECT * FROM sc_bud WHERE dev=?').bind(dev).first();
    const view = async () => {
      me = await db.prepare('SELECT * FROM sc_bud WHERE dev=?').bind(dev).first();
      if (!me) return J({ ok: true, me: null });
      const pt = me.partner ? await db.prepare('SELECT name,fajr_day,sub,tz,at FROM sc_bud WHERE dev=?').bind(me.partner).first() : null;
      return J({ ok: true, me: { code: me.code, name: me.name, delay: me.delay, push: !!me.sub, loc: me.lat != null, next_at: me.next_at, fajr_day: me.fajr_day }, partner: pt ? { name: pt.name, push: !!pt.sub, fajr_today: pt.fajr_day === dayIn(pt.tz) } : null });
    };
    if (p === 'bud/get') return view();
    if (M !== 'POST') return E('POST only', 405);
    if (!(await rate(db, 'bd:' + dev, 120, 3600e3))) return E('rate', 429);
    const fields = async (row) => {
      const o = {};
      if (b.name != null) { const nm = clean(b.name, 20); if (!nm || bad(nm) || phoney(nm)) throw new Error('name'); o.name = nm; }
      if (b.delay != null) o.delay = Math.max(5, Math.min(90, Math.round(+b.delay || 20)));
      if (b.lat != null && b.lng != null && isFinite(+b.lat) && isFinite(+b.lng)) { o.lat = Math.round(+b.lat * 100) / 100; o.lng = Math.round(+b.lng * 100) / 100; } // ~1 km, never shown to anyone
      if (b.tz) { try { new Intl.DateTimeFormat('en', { timeZone: String(b.tz) }); o.tz = String(b.tz).slice(0, 60); } catch (e) {} }
      if (b.cfg) o.cfg = JSON.stringify(deps.cleanCfg(b.cfg));
      if (b.endpoint !== undefined) o.sub = b.endpoint ? await subIdOf(b.endpoint) : null;
      return o;
    };
    const save = async (o) => {
      const merged = Object.assign({}, me || {}, o); const nx = budNext(merged, now, deps); merged.next_at = nx ? nx.at : null;
      await db.prepare('INSERT INTO sc_bud (dev,code,partner,name,lat,lng,tz,cfg,delay,sub,fajr_day,next_at,sent_day,at) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14) ON CONFLICT(dev) DO UPDATE SET code=?2,partner=?3,name=?4,lat=?5,lng=?6,tz=?7,cfg=?8,delay=?9,sub=?10,fajr_day=?11,next_at=?12,sent_day=?13,at=?14')
        .bind(dev, merged.code || null, merged.partner || null, merged.name || '', merged.lat == null ? null : merged.lat, merged.lng == null ? null : merged.lng, merged.tz || 'Asia/Riyadh', merged.cfg || '{}', merged.delay || 20, merged.sub || null, merged.fajr_day || null, merged.next_at, merged.sent_day || null, now).run();
    };
    try {
      if (p === 'bud/create') {
        if (me && me.partner) return E('paired', 409, 'أنت مرتبط بصاحب، افصل أولًا');
        const o = await fields(me); if (!o.name && !(me && me.name)) return E('name', 400, 'اكتب اسمك');
        let code = rid(6, AC); for (let i = 0; i < 3 && await db.prepare('SELECT 1 x FROM sc_bud WHERE code=?').bind(code).first(); i++) code = rid(6, AC);
        o.code = code; o.partner = null; await save(o); return view();
      }
      if (p === 'bud/join') {
        const code = String(b.code || '').toUpperCase(); if (!CODE_RE.test(code)) return E('bad code', 400, 'الرمز غير صحيح');
        if (!(await W('bj', 20, 864e5))) return E('rate', 429);
        const host = await db.prepare('SELECT * FROM sc_bud WHERE code=? AND dev!=?').bind(code, dev).first();
        if (!host) return E('not found', 404, 'لم نجد هذا الرمز');
        if (host.partner && host.partner !== dev) return E('taken', 409, 'صاحب هذا الرمز مرتبط بشخص آخر');
        if (me && me.partner && me.partner !== host.dev) return E('paired', 409, 'أنت مرتبط بصاحب، افصل أولًا');
        const o = await fields(me); if (!o.name && !(me && me.name)) return E('name', 400, 'اكتب اسمك');
        o.code = code; o.partner = host.dev; await save(o);
        await db.prepare('UPDATE sc_bud SET partner=? WHERE dev=?').bind(dev, host.dev).run();
        return view();
      }
      if (!me) return E('not set', 404);
      if (p === 'bud/sync') { await save(await fields(me)); return view(); }
      if (p === 'bud/fajr') { // the app logged Fajr for its local day (or took it back)
        const d = /^\d{4}-\d{2}-\d{2}$/.test(String(b.day || '')) ? b.day : dayIn(me.tz);
        await db.prepare('UPDATE sc_bud SET fajr_day=? WHERE dev=?').bind(b.undo ? (me.fajr_day === d ? null : me.fajr_day) : d, dev).run(); return view();
      }
      if (p === 'bud/leave') {
        await db.batch([db.prepare('UPDATE sc_bud SET partner=NULL WHERE dev=?').bind(me.partner || ''), db.prepare('DELETE FROM sc_bud WHERE dev=?').bind(dev)]);
        return J({ ok: true, me: null });
      }
    } catch (e) { if (String(e.message) === 'name') return E('name', 400, 'اختر اسمًا آخر'); throw e; }
    return E('not found', 404);
  }

  /* ---- admin (the same passcode session as /admin/videos) ---- */
  if (p.startsWith('admin/')) {
    if (p === 'admin/budtick') { // dry run of the Fajr-buddy check, token-protected like /api/push/tick
      if (!(await deps.tokenOk(u, req))) return E('forbidden', 403);
      const at = +u.searchParams.get('now') || now;
      return J({ ok: true, ...(await budTick(env, at, deps, u.searchParams.get('dry') !== '0')) });
    }
    if (!(await deps.adminOk(db, req))) return E('auth', 401);
    if (p === 'admin/dw' || p === 'admin/dwpost' || p === 'admin/dwuser') return dwAdmin({ env, p, b, M }); // v5.0 «الديوانية»
    if (p.startsWith('admin/zv')) return zvAdmin({ env, p, b, M, u }); // v5.4 «مقاطع زاد»: verified badges, user clips
    if (p === 'admin/list') {
      await rollChal(db, now);
      const q = s => db.prepare(s).all().then(r => r.results || []);
      const [pages, khatmas, chals, reps] = await Promise.all([
        q('SELECT id,kind,name,dua,dates,fun,kid,count,reports,hidden,created FROM sc_pages ORDER BY reports DESC, created DESC LIMIT 200'),
        q("SELECT k.id,k.title,COALESCE(k.kind,'g') kind,COALESCE(k.unit,30) unit,k.dua,k.created,k.updated,COALESCE(k.reports,0) reports,COALESCE(k.hidden,0) hidden,k.round,(SELECT COUNT(*) FROM zk_parts p WHERE p.kid=k.id AND p.status=2) done FROM zk_khatma k ORDER BY COALESCE(k.reports,0) DESC, k.created DESC LIMIT 200"),
        q('SELECT * FROM sc_chal ORDER BY official DESC, created DESC LIMIT 50'),
        q('SELECT target,COUNT(*) n,MAX(at) at,GROUP_CONCAT(reason, " | ") reasons FROM sc_reports GROUP BY target ORDER BY at DESC LIMIT 200')]);
      const stats = await db.prepare('SELECT (SELECT COUNT(*) FROM sc_fam) fams,(SELECT COUNT(*) FROM sc_fam_mem) members,(SELECT COUNT(*) FROM sc_bud) buddies,(SELECT COUNT(*) FROM sc_bud WHERE partner IS NOT NULL) paired,(SELECT COUNT(*) FROM sc_ref) refs,(SELECT COALESCE(SUM(n),0) FROM sc_ref) ref_opens').first();
      const refs = await q('SELECT r,n,created FROM sc_ref ORDER BY created DESC LIMIT 100');
      const fams = await q('SELECT f.id,f.name,f.created,(SELECT COUNT(*) FROM sc_fam_mem m WHERE m.fid=f.id) n FROM sc_fam f ORDER BY f.created DESC LIMIT 100');
      const halaqas = await q("SELECT h.id,h.name,h.target,h.weekly,h.created,h.reports,h.hidden,(SELECT COUNT(*) FROM sc_halaqa_mem m WHERE m.hid=h.id) n,(SELECT COUNT(*) FROM sc_halaqa_mem m WHERE m.hid=h.id AND m.note_hidden=1) hidden_notes FROM sc_halaqa h ORDER BY h.reports DESC, h.created DESC LIMIT 200");
      const hnotes = await q("SELECT m.hid,m.mid,m.name,m.note,m.note_rep,m.note_hidden FROM sc_halaqa_mem m WHERE m.note IS NOT NULL AND m.note<>'' ORDER BY m.note_rep DESC, m.note_at DESC LIMIT 200");
      stats.halaqas = halaqas.length; stats.hmembers = (await db.prepare('SELECT COUNT(*) n FROM sc_halaqa_mem').first()).n;
      return J({ ok: true, now, pages, khatmas, chals: chals.map(c => ({ ...pubChal(c, now), last: c.last_count })), reports: reps, stats, refs, fams, halaqas, hnotes });
    }
    if (M !== 'POST') return E('POST only', 405);
    const id = String(b.id || '');
    if (p === 'admin/page') {
      if (!ID_RE.test(id)) return E('bad id');
      if (b.op === 'delete') await db.batch([db.prepare('DELETE FROM sc_pages WHERE id=?').bind(id), db.prepare('DELETE FROM sc_pray WHERE pid=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('p:' + id)]);
      else if (b.op === 'unhide') await db.batch([db.prepare('UPDATE sc_pages SET hidden=0, reports=0 WHERE id=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('p:' + id)]);
      else if (b.op === 'hide') await db.prepare('UPDATE sc_pages SET hidden=1 WHERE id=?').bind(id).run();
      else return E('bad op');
      return J({ ok: true });
    }
    if (p === 'admin/khatma') {
      if (!ID_RE.test(id)) return E('bad id');
      if (b.op === 'delete') await db.batch([db.prepare('DELETE FROM zk_parts WHERE kid=?').bind(id), db.prepare('DELETE FROM zk_khatma WHERE id=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('k:' + id)]);
      else if (b.op === 'unhide') await db.batch([db.prepare('UPDATE zk_khatma SET hidden=0, reports=0 WHERE id=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('k:' + id)]);
      else if (b.op === 'hide') await db.prepare('UPDATE zk_khatma SET hidden=1 WHERE id=?').bind(id).run();
      else return E('bad op');
      return J({ ok: true });
    }
    if (p === 'admin/rate-reset') { // clears today's khatma-create counters for the CALLER's own IP (admin testing from one network)
      const ip = ipOf(req), d = new Date().toISOString().slice(0, 10);
      await db.prepare('DELETE FROM zk_rate WHERE k=?').bind('ci:' + (await sha('zkip:' + ip + ':' + d)).slice(0, 24)).run(); return J({ ok: true });
    }
    if (p === 'admin/fam') { // remove a whole circle (test circles, or abuse)
      if (!CODE_RE.test(id) || b.op !== 'delete') return E('bad op');
      await db.batch([db.prepare('DELETE FROM sc_fam_mem WHERE fid=?').bind(id), db.prepare('DELETE FROM sc_cheer WHERE fid=?').bind(id), db.prepare('DELETE FROM sc_fam WHERE id=?').bind(id)]); return J({ ok: true });
    }
    if (p === 'admin/halaqa') { // v4.9: delete / hide / unhide a circle, or clear / restore one member's note
      if (!CODE_RE.test(id)) return E('bad id');
      if (b.op === 'delete') await delHalaqa(db, id);
      else if (b.op === 'hide') await db.prepare('UPDATE sc_halaqa SET hidden=1 WHERE id=?').bind(id).run();
      else if (b.op === 'unhide') await db.batch([db.prepare('UPDATE sc_halaqa SET hidden=0, reports=0 WHERE id=?').bind(id), db.prepare('DELETE FROM sc_reports WHERE target=?').bind('hq:' + id)]);
      else if (b.op === 'clearnote' || b.op === 'shownote') { const mid = String(b.mid || ''); if (b.op === 'clearnote') await db.prepare('UPDATE sc_halaqa_mem SET note=NULL, note_at=NULL, note_rep=0, note_hidden=0 WHERE hid=? AND mid=?').bind(id, mid).run(); else await db.prepare('UPDATE sc_halaqa_mem SET note_rep=0, note_hidden=0 WHERE hid=? AND mid=?').bind(id, mid).run(); await db.prepare('DELETE FROM sc_reports WHERE target=?').bind('hn:' + id + ':' + mid).run(); }
      else return E('bad op');
      return J({ ok: true });
    }
    if (p === 'admin/ref') { // remove a ref and its counts (test links)
      if (!REF_RE.test(id) || b.op !== 'delete') return E('bad op');
      await db.batch([db.prepare('DELETE FROM sc_ref WHERE r=?').bind(id), db.prepare('DELETE FROM sc_ref_hit WHERE r=?').bind(id)]); return J({ ok: true });
    }
    if (p === 'admin/chal') {
      if (b.op === 'save') {
        const title = clean(b.title, 70), dhikr = clean(b.dhikr, 80), goal = Math.max(10, Math.min(1e9, Math.round(+b.goal || 0)));
        const starts = +b.starts || now, ends = +b.ends || (starts + 864e5), recur = b.recur ? 604800000 : 0;
        if (!title || ends <= starts) return E('bad fields');
        const cid = /^[a-z0-9-]{3,40}$/.test(id) ? id : 'c-' + rid(8);
        await db.prepare('INSERT INTO sc_chal (id,title,dhikr,goal,count,starts,ends,recur,official,ended,created) VALUES (?1,?2,?3,?4,0,?5,?6,?7,1,0,?8) ON CONFLICT(id) DO UPDATE SET title=?2,dhikr=?3,goal=?4,starts=?5,ends=?6,recur=?7,ended=0').bind(cid, title, dhikr, goal, starts, ends, recur, now).run();
        return J({ ok: true, id: cid });
      }
      if (!/^[a-z0-9-]{3,40}$/.test(id)) return E('bad id');
      if (b.op === 'end') await db.prepare('UPDATE sc_chal SET ended=1 WHERE id=?').bind(id).run();
      else if (b.op === 'reopen') await db.prepare('UPDATE sc_chal SET ended=0 WHERE id=?').bind(id).run();
      else if (b.op === 'delete') { if (id === 'fri-salawat') return E('official weekly challenge: end it instead', 400); await db.batch([db.prepare('DELETE FROM sc_chal WHERE id=?').bind(id), db.prepare('DELETE FROM sc_chal_dev WHERE cid=?').bind(id)]); }
      else return E('bad op');
      return J({ ok: true });
    }
    return E('not found', 404);
  }
  return E('not found', 404);
}
