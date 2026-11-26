// زاد v4.4 server additions: group khatma (/api/khatma/*) + occasion and «دقيقة زاد» push events. Imported by worker-src.js.
import { badWord as bw0 } from './videos.js';
import { extraBad } from './social.js';
const badWord = s => bw0(s) || extraBad(s); // v4.6: public names/duas go through the same filter as the clips
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const enc = new TextEncoder();
async function h256(s) { const h = await crypto.subtle.digest('SHA-256', enc.encode(s)); return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join(''); }
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
const PHONEY = s => /(\d[\s\-.]*){7,}/.test(String(s || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))) || /(https?:|www\.)/i.test(String(s || ''));
const today = () => new Date().toISOString().slice(0, 10);
const AB = 'abcdefghijkmnpqrstuvwxyz23456789';
function newId(n = 10) { const b = crypto.getRandomValues(new Uint8Array(n)); let s = ''; for (const x of b) s += AB[x % AB.length]; return s; }
export const KID_RE = /^[a-z2-9]{10}$/;
const CREATE_PER_DEV = 5, CREATE_PER_IP = 20, CLAIMS_PER_DEV = 30;

let zkOk = false;
async function zkSchema(db) {
  if (zkOk) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS zk_khatma (id TEXT PRIMARY KEY, title TEXT, creator TEXT, created INTEGER, updated INTEGER, deadline TEXT, closed INTEGER DEFAULT 0, round INTEGER DEFAULT 1, done_rounds INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS zk_parts (kid TEXT NOT NULL, juz INTEGER NOT NULL, name TEXT, dev TEXT, status INTEGER DEFAULT 1, at INTEGER, done_at INTEGER, PRIMARY KEY (kid, juz))'),
    db.prepare('CREATE TABLE IF NOT EXISTS zk_rate (k TEXT PRIMARY KEY, n INTEGER, day TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS zk_rate_day ON zk_rate(day)')
  ]);
  // v4.6 (additive): kind g=group (as before) / d=for a deceased person / o=organisation board; unit 30 juz' or 60 ahzab; dua line; moderation
  const ti = await db.prepare('PRAGMA table_info(zk_khatma)').all(); const have = new Set((ti.results || []).map(c => c.name));
  for (const [c, t] of [['kind', "TEXT DEFAULT 'g'"], ['unit', 'INTEGER DEFAULT 30'], ['dua', 'TEXT'], ['org', 'TEXT'], ['reports', 'INTEGER DEFAULT 0'], ['hidden', 'INTEGER DEFAULT 0']])
    if (!have.has(c)) { try { await db.prepare(`ALTER TABLE zk_khatma ADD COLUMN ${c} ${t}`).run(); } catch (e) { if (!/duplicate column/i.test(String(e && e.message))) throw e; } }
  zkOk = true;
}
async function rate(db, k, max) {
  const d = today();
  const r = await db.prepare("INSERT INTO zk_rate(k,n,day) VALUES(?1,1,?2) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN day=?2 THEN n+1 ELSE 1 END, day=?2 RETURNING n").bind(k, d).first();
  return (r && r.n) <= max;
}
async function view(db, id, devh) {
  const k = await db.prepare('SELECT * FROM zk_khatma WHERE id=?').bind(id).first();
  if (!k) return null;
  const p = await db.prepare('SELECT juz,name,dev,status,at,done_at FROM zk_parts WHERE kid=? ORDER BY juz').bind(id).all();
  const parts = (p.results || []).map(r => ({ j: r.juz, n: r.name, s: r.status, me: !!devh && r.dev === devh, at: r.at, dt: r.done_at }));
  return { ok: true, k: { id: k.id, title: k.title, created: k.created, updated: k.updated, deadline: k.deadline, closed: !!k.closed, round: k.round, rounds: k.done_rounds, mine: !!devh && k.creator === devh, kind: k.kind || 'g', unit: k.unit === 60 ? 60 : 30, dua: k.dua || '', org: k.org || '', hidden: !!k.hidden }, parts };
}
export async function khatmaApi(u, req, env) {
  const db = env.DB; if (!db) return J({ ok: false, error: 'no database' }, 500);
  await zkSchema(db);
  const path = u.pathname.slice('/api/khatma/'.length);
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const dev = String(body.dev || u.searchParams.get('dev') || '');
  const devh = /^[a-f0-9]{24,64}$/.test(dev) ? (await h256('zk:' + dev)).slice(0, 32) : '';
  const id = String(body.id || u.searchParams.get('id') || '');
  const now = Date.now();
  if (path === 'create') {
    if (req.method !== 'POST') return J({ ok: false, error: 'POST only' }, 405);
    if (!devh) return J({ ok: false, error: 'bad device' }, 400);
    const kind = ['d', 'o'].includes(body.kind) ? body.kind : 'g', unit = +body.unit === 60 ? 60 : 30;
    const title = clean(body.title, 60) || (kind === 'g' ? 'ختمة جماعية' : '');
    if (!title) return J({ ok: false, error: 'name', msg: kind === 'd' ? 'اكتب اسم الفقيد' : 'اكتب اسم الجهة' }, 400);
    const dua = clean(body.dua, 120), org = ['company', 'school', 'mosque', 'family', 'other'].includes(body.org) ? body.org : null;
    if (badWord(title) || badWord(dua)) return J({ ok: false, error: 'bad', msg: 'توجد كلمات غير لائقة' }, 400);
    if (PHONEY(title) || PHONEY(dua)) return J({ ok: false, error: 'phone', msg: 'لا تكتب أرقام جوالات أو روابط' }, 400);
    const dl = /^\d{4}-\d{2}-\d{2}$/.test(String(body.deadline || '')) ? String(body.deadline) : null;
    const ip = req.headers.get('cf-connecting-ip') || '';
    const iph = ip ? (await h256('zkip:' + ip + ':' + today())).slice(0, 24) : '';
    if (!(await rate(db, 'cd:' + devh, CREATE_PER_DEV))) return J({ ok: false, error: 'rate', msg: 'وصلت الحد اليومي لإنشاء الختمات، حاول غدًا' }, 429);
    if (iph && !(await rate(db, 'ci:' + iph, CREATE_PER_IP))) return J({ ok: false, error: 'rate', msg: 'وصلت الحد اليومي لإنشاء الختمات، حاول غدًا' }, 429);
    const kid = newId();
    await db.prepare('INSERT INTO zk_khatma (id,title,creator,created,updated,deadline,closed,round,done_rounds,kind,unit,dua,org,reports,hidden) VALUES (?,?,?,?,?,?,0,1,0,?,?,?,?,0,0)').bind(kid, title, devh, now, now, dl, kind, unit, dua || null, org).run();
    if (Math.random() < 0.05) await db.prepare('DELETE FROM zk_rate WHERE day<?').bind(new Date(now - 3 * 864e5).toISOString().slice(0, 10)).run();
    return J(await view(db, kid, devh));
  }
  if (!KID_RE.test(id)) return J({ ok: false, error: 'bad id' }, 400);
  if (path === 'get') { const v = await view(db, id, devh); if (v && v.k.hidden && !v.k.mine) return J({ ok: false, error: 'hidden', msg: 'هذه الختمة قيد المراجعة' }, 410); return v ? J(v) : J({ ok: false, error: 'not found' }, 404); }
  if (req.method !== 'POST') return J({ ok: false, error: 'POST only' }, 405);
  if (!devh) return J({ ok: false, error: 'bad device' }, 400);
  const k = await db.prepare('SELECT * FROM zk_khatma WHERE id=?').bind(id).first();
  if (!k) return J({ ok: false, error: 'not found' }, 404);
  const owner = k.creator === devh;
  const juz = Math.round(+body.juz || 0);
  const touch = () => db.prepare('UPDATE zk_khatma SET updated=? WHERE id=?').bind(now, id).run();
  if (path === 'claim') {
    if (k.closed) return J({ ok: false, error: 'closed', msg: 'الختمة مغلقة' }, 409);
    if (k.hidden) return J({ ok: false, error: 'hidden', msg: 'هذه الختمة قيد المراجعة' }, 410);
    if (juz < 1 || juz > (k.unit === 60 ? 60 : 30)) return J({ ok: false, error: 'bad juz' }, 400);
    const name = clean(body.name, 30); if (!name) return J({ ok: false, error: 'name', msg: 'اكتب اسمك' }, 400);
    if (badWord(name) || PHONEY(name)) return J({ ok: false, error: 'bad', msg: 'اختر اسمًا آخر' }, 400);
    const c = await db.prepare('SELECT COUNT(*) n FROM zk_parts WHERE kid=? AND dev=?').bind(id, devh).first();
    if (c && c.n >= CLAIMS_PER_DEV) return J({ ok: false, error: 'limit' }, 429);
    const r = await db.prepare('INSERT INTO zk_parts (kid,juz,name,dev,status,at) VALUES (?,?,?,?,1,?) ON CONFLICT(kid,juz) DO UPDATE SET name=excluded.name WHERE zk_parts.dev=excluded.dev').bind(id, juz, name, devh, now).run();
    if (!r.meta.changes) return J({ ok: false, error: 'taken', msg: 'هذا الجزء أخذه شخص آخر', ...(await view(db, id, devh)) }, 409);
    await touch(); return J(await view(db, id, devh));
  }
  if (path === 'done' || path === 'undone') {
    const r = await db.prepare('UPDATE zk_parts SET status=?, done_at=? WHERE kid=? AND juz=? AND dev=?').bind(path === 'done' ? 2 : 1, path === 'done' ? now : null, id, juz, devh).run();
    if (!r.meta.changes) return J({ ok: false, error: 'not yours' }, 403);
    await touch(); return J(await view(db, id, devh));
  }
  if (path === 'release') {
    const r = owner ? await db.prepare('DELETE FROM zk_parts WHERE kid=? AND juz=?').bind(id, juz).run() : await db.prepare('DELETE FROM zk_parts WHERE kid=? AND juz=? AND dev=?').bind(id, juz, devh).run();
    if (!r.meta.changes) return J({ ok: false, error: 'not yours' }, 403);
    await touch(); return J(await view(db, id, devh));
  }
  if (!owner) return J({ ok: false, error: 'creator only', msg: 'هذا الخيار لمنشئ الختمة فقط' }, 403);
  if (path === 'reset') { // a new round: everyone's parts are cleared
    const all = await db.prepare('SELECT COUNT(*) n FROM zk_parts WHERE kid=? AND status=2').bind(id).first();
    await db.batch([db.prepare('DELETE FROM zk_parts WHERE kid=?').bind(id), db.prepare('UPDATE zk_khatma SET round=round+1, done_rounds=done_rounds+?, closed=0, updated=? WHERE id=?').bind(all && all.n >= (k.unit === 60 ? 60 : 30) ? 1 : 0, now, id)]);
    return J(await view(db, id, devh));
  }
  if (path === 'close') { await db.prepare('UPDATE zk_khatma SET closed=?, updated=? WHERE id=?').bind(body.open ? 0 : 1, now, id).run(); return J(await view(db, id, devh)); }
  if (path === 'edit') {
    const title = clean(body.title, 60) || k.title; const dua = body.dua != null ? clean(body.dua, 120) : k.dua;
    if (badWord(title) || badWord(dua || '') || PHONEY(title) || PHONEY(dua || '')) return J({ ok: false, error: 'bad', msg: 'توجد كلمات غير لائقة أو أرقام' }, 400); const dl = body.deadline === null || body.deadline === '' ? null : (/^\d{4}-\d{2}-\d{2}$/.test(String(body.deadline || '')) ? String(body.deadline) : k.deadline);
    await db.prepare('UPDATE zk_khatma SET title=?, deadline=?, dua=?, updated=? WHERE id=?').bind(title, dl, dua || null, now, id).run(); return J(await view(db, id, devh));
  }
  if (path === 'delete') { await db.batch([db.prepare('DELETE FROM zk_parts WHERE kid=?').bind(id), db.prepare('DELETE FROM zk_khatma WHERE id=?').bind(id), db.prepare("DELETE FROM sc_reports WHERE target=?").bind('k:' + id)].slice(0, 2)); return J({ ok: true, deleted: id }); }
  return J({ ok: false, error: 'not found' }, 404);
}

/* ---------- occasions (Umm al-Qura via Intl, with the same ±adj as the fasting reminders) ---------- */
const HFZ = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' });
function hijZ(y, m, d, adj) { const x = new Date(Date.UTC(y, m - 1, d + (+adj || 0), 12)); const p = {}; HFZ.formatToParts(x).forEach(o => p[o.type] = o.value); return { d: +p.day, m: +p.month, y: parseInt(p.year) }; }
const HMZ = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
const arz = s => String(s).replace(/\d/g, x => '٠١٢٣٤٥٦٧٨٩'[x]);
// [id, hijri day, hijri month, day-before title, eve title, url]
export const OCC = [
  ['ramadan', 1, 9, 'رمضان غدًا', 'الليلة أول ليلة من رمضان', './#occ'],
  ['fitr', 1, 10, 'عيد الفطر غدًا', 'الليلة ليلة عيد الفطر', './#occ'],
  ['dhul10', 1, 12, 'غدًا تبدأ العشر من ذي الحجة', 'الليلة تبدأ العشر من ذي الحجة', './#occ'],
  ['arafa', 9, 12, 'غدًا يوم عرفة', 'الليلة ليلة يوم عرفة', './#occ'],
  ['adha', 10, 12, 'عيد الأضحى غدًا', 'الليلة ليلة عيد الأضحى', './#occ'],
  ['ashura', 10, 1, 'غدًا يوم عاشوراء', 'الليلة ليلة يوم عاشوراء', './#occ']
];
export function zfEvents(cfg, y, m, d, at, key) {
  const out = [];
  const o = cfg.occ || {};
  if (o.on && (o.pre || o.eve)) {
    const t = new Date(Date.UTC(y, m - 1, d + 1, 12)), ty = t.getUTCFullYear(), tm = t.getUTCMonth() + 1, td = t.getUTCDate();
    const h = hijZ(ty, tm, td, (cfg.fast && cfg.fast.adj) || 0);
    const hits = OCC.filter(x => x[1] === h.d && x[2] === h.m);
    if (hits.length) {
      const b = arz(h.d) + ' ' + HMZ[h.m - 1] + ' ' + arz(h.y) + 'هـ حسب تقويم أم القرى';
      const ids = hits.map(x => x[0]).join('+');
      if (o.pre) out.push({ ev: 'oc', day: key, at: at(o.ptime || '10:00'), t: hits.map(x => x[3]).join(' · '), b, u: hits[0][5], tag: 'oc' + ids + key });
      if (o.eve) out.push({ ev: 'oe', day: key, at: at(o.time || '20:30'), t: hits.map(x => x[4]).join(' · '), b, u: hits[0][5], tag: 'oe' + ids + key });
    }
  }
  const z = cfg.dz || {};
  if (z.on) out.push({ ev: 'dz', day: key, at: at(z.time || '08:00'), t: 'دقيقة زاد', b: 'آية وذكر والصلاة القادمة، دقيقة لقلبك', u: './#dz', tag: 'dz' + key });
  return out;
}
export function zfCleanCfg(c) {
  c = c || {};
  const hm = (x, d) => /^\d{1,2}:\d{2}$/.test(String(x || '')) ? String(x) : d;
  const o = c.occ || {}, z = c.dz || {};
  return {
    occ: o.on ? { on: true, pre: !!o.pre, eve: !!o.eve, ptime: hm(o.ptime, '10:00'), time: hm(o.time, '20:30') } : { on: false },
    dz: z.on ? { on: true, time: hm(z.time, '08:00') } : { on: false }
  };
}
