
// زاد server v4.2 (videos: srv/videos.js) / v4.1: Web Push reminders (/api/push/*); everything else goes to the previous worker (legacy.js) unchanged
import * as adhan from './adhan-umd.js';
import { videos, vidPurge, vidRetentionDry } from './videos.js'; // v4.2 «مقاطع الأسبوع»
import ADMIN_HTML from './admin.html';
import { articles } from './articles.js'; // v4.3 admin-added articles
import ADMIN_ART_HTML from './admin-articles.html';
import { LEGACY } from './legacy.js';
import { khatmaApi, zfEvents, zfCleanCfg } from './zf-srv.js';
import { social, budTick } from './social.js'; // v4.6 shared features (sc_* tables)
import { adminOk, badWord } from './videos.js';
import ADMIN_SOC_HTML from './admin-social.html';
import { adkEvents, adkCleanCfg } from './adk-srv.js'; // v5.1 adhkar reminders
import { dorous } from './dorous.js';
import { dorarApi } from './dorar.js';
import { zdash, zaBump } from './zdash.js';
import { ZBC, zbcTick } from './zbc.js'; // v5.4.5 dashboard broadcasts // v5.4.4 private dashboard + anonymous usage counting // v5.3 «تحقق من حديث» // v5.0 «دروس زاد» // v4.4 // the site's previous _worker.js (assetlinks for the Android app, /install, /book/raheeq.pdf …), kept byte-for-byte
const { Coordinates, CalculationMethod, PrayerTimes, Madhab, Rounding } = adhan;

const TICK_HASH = '7654636d6c8437997509688571b82ceaaac05e37523d3e6e460350b5105acc05';
const VAPID_SUB = 'mailto:amar.alshammari@mail.tab.bot';
const CAP_PER_TICK = 50;      // sends per claim batch
const MAX_BATCHES = 10;       // batches per tick invocation
const TICK_BUDGET_MS = 15000; // v5.2: runs inside waitUntil (~30 s after the response); the check is at batch start, so leave headroom // wall budget per tick
const PK = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PN = { Fajr: 'الفجر', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
const WD = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const GRACE = { p: 15 * 60e3, am: 90 * 60e3, pm: 90 * 60e3, fz: 120 * 60e3, fs: 45 * 60e3, kf: 180 * 60e3, sd: 180 * 60e3 };
const TTL = { p: 900, am: 3600, pm: 3600, fz: 7200, fs: 2700, kf: 7200, sd: 7200 };
Object.assign(GRACE, { oc: 180 * 60e3, oe: 180 * 60e3, dz: 90 * 60e3 }); Object.assign(TTL, { oc: 7200, oe: 7200, dz: 3600 }); // v4.4

const ZAD_MAIN = {
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (u.pathname === '/api/geo') { // v4.4.5: approximate place of the request (Cloudflare request.cf), no permission needed; never stored
      // request.cf when present; behind the sites router the same facts arrive as Cloudflare's visitor-location headers (cf-ipcity, cf-iplatitude, ...)
      const c = req.cf || {}, h = k => req.headers.get(k) || ''; const n = x => (x == null || x === '' || !isFinite(+x)) ? null : +x;
      let city = c.city || h('cf-ipcity'); try { city = decodeURIComponent(escape(city)); } catch (e) {}
      return J({ ok: true, city, country: c.country || h('cf-ipcountry'), region: c.region || h('cf-region'), latitude: n(c.latitude != null ? c.latitude : h('cf-iplatitude')), longitude: n(c.longitude != null ? c.longitude : h('cf-iplongitude')), timezone: c.timezone || h('cf-timezone') });
    }
    if (u.pathname === '/api/tq') { // v4.7: read-only proxy to tafsir.app («الباحث القرآني») for 3 named books (no CORS upstream); edge-cached 30 days
      const src = u.searchParams.get('src') || '', s = +u.searchParams.get('s'), a = +u.searchParams.get('a');
      const OKS = { 'siraaj-ghareeb': 1, 'almuyassar-ghareeb': 1, 'wahidi-asbab': 1 };
      if (!OKS[src] || !(s >= 1 && s <= 114 && Number.isInteger(s)) || !(a >= 1 && a <= 286 && Number.isInteger(a))) return J({ ok: false, error: 'bad' }, 400);
      try {
        const ck = src + '/' + s + '/' + a; const hd = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=2592000', 'access-control-allow-origin': '*' };
        try { if (env.DB) { await env.DB.prepare('CREATE TABLE IF NOT EXISTS zc_tq (k TEXT PRIMARY KEY, v TEXT, t INTEGER)').run(); const row = await env.DB.prepare('SELECT v FROM zc_tq WHERE k=?').bind(ck).first(); if (row) return new Response(JSON.stringify({ ok: true, src, s, a, data: row.v, c: 1 }), { headers: hd }); } } catch (e) {}
        const up = await fetch('https://tafsir.app/get.php?src=' + src + '&s=' + s + '&a=' + a, { headers: { 'user-agent': 'Zad-app/4.7 (+https://amar-muslim.sites.tab.bot/)' } });
        if (!up.ok) return J({ ok: false, error: 'upstream', status: up.status }, 502);
        const j = await up.json();
        const data = String(j && j.data || '');
        try { if (env.DB && j && typeof j.data === 'string') { const p = env.DB.prepare('INSERT OR REPLACE INTO zc_tq (k, v, t) VALUES (?, ?, ?)').bind(ck, data, Date.now()).run(); if (ctx && ctx.waitUntil) ctx.waitUntil(p); else await p; } } catch (e) {}
        return new Response(JSON.stringify({ ok: true, src, s, a, data }), { headers: hd });
      } catch (e) { return J({ ok: false, error: 'server', detail: String(e && e.message || e).slice(0, 120) }, 502); }
    }
    if (u.pathname === '/api/khutba') { // v4.7: latest Friday-sermon titles from the two official YouTube channels embedded on prh.gov.sa (feeds have no CORS); edge-cached 1 h
      try {
        const CH = [{ n: 'المسجد الحرام', id: 'UC-G8RL7iYJt5L_-7F5bRKLA', ch: 'https://www.youtube.com/@Emam_moathen', re: /^\s*خطبة الجمعة/ }, { n: 'المسجد النبوي', id: 'UCROKYPep-UuODNwyipe6JMw', ch: 'https://www.youtube.com/@SaudiSunnahTv', re: /خطبتي|خطبة الجمعة/ }];
        const un = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const lists = await Promise.all(CH.map(async c => {
          let items = []; try { const t = await (await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + c.id, { headers: { 'user-agent': 'Mozilla/5.0 (Zad-app)' } })).text();
            items = [...t.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m => { const x = m[1]; const tt = (x.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || ''; const v = (x.match(/<yt:videoId>([^<]+)</) || [])[1] || ''; const d = (x.match(/<published>([^<]+)</) || [])[1] || ''; return { t: un(tt).trim(), u: 'https://www.youtube.com/watch?v=' + v, d: d.slice(0, 10) }; }).filter(i => c.re.test(i.t)).slice(0, 6);
          } catch (e) {}
          return { n: 'خطبة الجمعة — ' + c.n, ch: c.ch, items };
        }));
        return new Response(JSON.stringify({ ok: true, lists }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=1800' } });
      } catch (e) { return J({ ok: false, error: 'server' }, 502); }
    }
    if (u.pathname === '/api/dorar') { try { return await dorarApi(u, req, env, ctx); } catch (e) { return J({ ok: false, error: 'server', detail: String(e && e.message || e).slice(0, 200), more: 'https://dorar.net/hadith/search?q=' + encodeURIComponent(u.searchParams.get('q') || '') }, 500); } } // v5.3
    if (u.pathname.startsWith('/api/dorous/')) { try { return await dorous(u, req, env, ctx); } catch (e) { return J({ ok: false, error: 'server', detail: String(e && e.message || e).slice(0, 200) }, 500); } } // v5.0
    if (u.pathname.startsWith('/api/khatma/')) { try { return await khatmaApi(u, req, env); } catch (e) { return J({ ok: false, error: String(e && e.message || e) }, 500); } } // v4.4
    if (u.pathname.startsWith('/api/social/') || u.pathname.startsWith('/go/')) { // v4.6
      try { return await social(u, req, env, ctx, SOC_DEPS); } catch (e) { return J({ ok: false, error: 'server', detail: String(e && e.message || e).slice(0, 200) }, 500); }
    }
    if (u.pathname === '/admin/social' || u.pathname === '/admin/social/') {
      return new Response(ADMIN_SOC_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY' } });
    }
    if (u.pathname.startsWith('/api/push/')) {
      try { return await api(u, req, env, ctx); }
      catch (e) { const m = String(e && e.message || e); return J({ ok: false, error: m }, /^bad |not allowed/.test(m) ? 400 : 500); }
    }
    if (u.pathname === '/api/articles' || u.pathname.startsWith('/api/articles/')) {
      try { return await articles(u, req, env); }
      catch (e) { return J({ ok: false, error: 'server' }, 500); }
    }
    if (u.pathname === '/admin/articles' || u.pathname === '/admin/articles/') {
      return new Response(ADMIN_ART_HTML, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY' } });
    }
    if (u.pathname.startsWith('/api/videos/') || u.pathname === '/admin/videos' || u.pathname === '/admin/videos/') {
      try { return await videos(u, req, env, ctx, { sendPush, ADMIN_HTML }); }
      catch (e) { return J({ ok: false, error: 'server' }, 500); }
    }
    return LEGACY.fetch(req, env, ctx);
  }
};

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

/* ---------------- base64url / bytes ---------------- */
const enc = new TextEncoder();
function b64u(buf) { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64u(s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); const o = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i); return o; }
function cat(...a) { const n = a.reduce((x, y) => x + y.length, 0); const o = new Uint8Array(n); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; }
async function sha256hex(s) { const h = await crypto.subtle.digest('SHA-256', enc.encode(s)); return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join(''); }

/* ---------------- D1 schema (additive, idempotent) ---------------- */
let schemaOk = false;
async function schema(db) {
  if (schemaOk) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS push_subs (id TEXT PRIMARY KEY, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, lat REAL, lng REAL, city TEXT, tz TEXT, cfg TEXT, next_at INTEGER, next_ev TEXT, claim_at INTEGER DEFAULT 0, created INTEGER, updated INTEGER, last_ok INTEGER, fails INTEGER DEFAULT 0, last_test INTEGER DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS push_subs_next ON push_subs(next_at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS push_sent (k TEXT PRIMARY KEY, at INTEGER)'),
    db.prepare('CREATE INDEX IF NOT EXISTS push_sent_at ON push_sent(at)'),
    db.prepare('CREATE TABLE IF NOT EXISTS push_meta (k TEXT PRIMARY KEY, v TEXT)')
  ]);
  schemaOk = true;
}
async function meta(db, k) { const r = await db.prepare('SELECT v FROM push_meta WHERE k=?').bind(k).first(); return r ? r.v : null; }
async function setMeta(db, k, v) { await db.prepare('INSERT INTO push_meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k, String(v)).run(); }
async function bump(db, k, n = 1) { if (!n) return; await db.prepare("INSERT INTO push_meta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=CAST(CAST(v AS INTEGER)+CAST(? AS INTEGER) AS TEXT)").bind(k, String(n), String(n)).run(); }

/* ---------------- VAPID keys: generated once on the server, private key never leaves D1 ---------------- */
let VAPID = null;
async function vapid(db) {
  if (VAPID) return VAPID;
  let raw = await meta(db, 'vapid');
  if (!raw) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
    const pub = b64u(await crypto.subtle.exportKey('raw', kp.publicKey));
    await db.prepare('INSERT OR IGNORE INTO push_meta(k,v) VALUES(?,?)').bind('vapid', JSON.stringify({ pub, jwk })).run();
    raw = await meta(db, 'vapid');
  }
  const v = JSON.parse(raw);
  const key = await crypto.subtle.importKey('jwk', v.jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  VAPID = { pub: v.pub, key, jwt: {} };
  return VAPID;
}
async function vapidAuth(db, endpoint) {
  const v = await vapid(db);
  const aud = new URL(endpoint).origin;
  const now = Math.floor(Date.now() / 1000);
  const c = v.jwt[aud];
  if (c && c.exp - now > 3600) return c.h;
  const exp = now + 12 * 3600;
  const head = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = b64u(enc.encode(JSON.stringify({ aud, exp, sub: VAPID_SUB })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, v.key, enc.encode(head + '.' + body));
  const h = 'vapid t=' + head + '.' + body + '.' + b64u(sig) + ', k=' + v.pub;
  v.jwt[aud] = { h, exp };
  return h;
}

/* ---------------- RFC 8291 aes128gcm payload encryption ---------------- */
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
}
export async function encryptPayload(p256dh, authSecret, plaintext) {
  const uaPub = unb64u(p256dh), auth = unb64u(authSecret);
  const uaKey = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const as = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey));
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(enc.encode('WebPush: info\0'), uaPub, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, cat(enc.encode(plaintext), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]); // 4096
  return cat(salt, rs, new Uint8Array([65]), asPub, ct);
}
const isGone = r => r.status === 404 || r.status === 410 || (r.status === 400 && /BadWebPushToken|BadDeviceToken|Unregistered|ExpiredSubscription/i.test(r.text || ''));
async function sendPush(db, sub, payload, ttl = 3600, urgency = 'normal', topic) {
  const body = await encryptPayload(sub.p256dh, sub.auth, JSON.stringify(payload));
  const headers = { 'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: String(ttl), Urgency: urgency, Authorization: await vapidAuth(db, sub.endpoint) };
  if (topic) headers.Topic = topic;
  const r = await fetch(sub.endpoint, { method: 'POST', headers, body });
  let txt = ''; if (r.status >= 300) { try { txt = (await r.text()).slice(0, 300); } catch (e) {} }
  return { status: r.status, text: txt };
}

/* ---------------- time zones ---------------- */
const dtfCache = {};
function dtf(tz) { return dtfCache[tz] || (dtfCache[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })); }
function parts(ts, tz) { const p = {}; dtf(tz).formatToParts(new Date(ts)).forEach(o => p[o.type] = o.value); return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second }; }
function tzOffset(ts, tz) { const p = parts(ts, tz); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ts / 1000) * 1000; }
function zoned(y, m, d, hh, mm, tz) { const g = Date.UTC(y, m - 1, d, hh, mm); let t = g - tzOffset(g, tz); const o2 = tzOffset(t, tz); if (o2 !== g - t) t = g - o2; return t; }
function validTz(tz) { try { dtf(tz); return true; } catch (e) { return false; } }
const pad = n => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
function addDays(y, m, d, n) { const t = new Date(Date.UTC(y, m - 1, d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), w: t.getUTCDay() }; }

/* ---------------- Hijri (Umm al-Qura) + fasting rules: same as the app (z4 fastInfo) ---------------- */
const HF = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' });
function hij(y, m, d, adj) { const x = new Date(Date.UTC(y, m - 1, d + (+adj || 0), 12)); const p = {}; HF.formatToParts(x).forEach(o => p[o.type] = o.value); return { d: +p.day, m: +p.month, y: parseInt(p.year) }; }
export function fastInfo(y, m, d, f) {
  const h = hij(y, m, d, f.adj), w = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay(), r = [];
  if (h.m === 9) return { h, r, skip: 'ramadan' };
  if ((h.m === 10 && h.d === 1) || (h.m === 12 && h.d >= 10 && h.d <= 13)) return { h, r, skip: 'eid' };
  if (f.white && h.d >= 13 && h.d <= 15) r.push('white');
  if (f.mt && (w === 1 || w === 4)) r.push(w === 1 ? 'mon' : 'thu');
  return { h, r };
}

/* ---------------- prayer times: an exact port of the app's on-device pt.js (v4.0.1): adhan-js, aladhan method ids,
   Umm al-Qura isha 120 min in Ramadan, Asr with the declination at the Asr moment, rounding to the minute, then the per-prayer tune ---------------- */
function hijNoon(y, m, d) { const x = new Date(Date.UTC(y, m - 1, d, 12)); const p = {}; HF.formatToParts(x).forEach(o => p[o.type] = o.value); return { d: +p.day, m: +p.month }; }
function params(method, y, m, d, hanafi) {
  const C = CalculationMethod; let p;
  switch (+method) {
    case 3: p = C.MuslimWorldLeague(); break;
    case 5: p = C.Egyptian(); break;
    case 8: p = C.Other(); p.fajrAngle = 19.5; p.ishaInterval = 90; break;
    case 9: p = C.Kuwait(); break;
    case 10: p = C.Qatar(); break;
    case 16: p = C.Dubai(); break;
    case 2: p = C.NorthAmerica(); break;
    case 1: p = C.Karachi(); break;
    default: p = C.UmmAlQura(); { const h = hijNoon(y, m, d); if (h && h.m === 9) p.ishaInterval = 120; }
  }
  p.madhab = hanafi ? Madhab.Hanafi : Madhab.Shafi;
  return p;
}
const RAD = Math.PI / 180;
function decl(ms) { const D = ms / 864e5 + 2440587.5 - 2451545, g = (357.529 + .98560028 * D) * RAD, q = 280.459 + .98564736 * D, L = (q + 1.915 * Math.sin(g) + .020 * Math.sin(2 * g)) * RAD, e = (23.439 - 3.6e-7 * D) * RAD; return Math.asin(Math.sin(e) * Math.sin(L)); }
function asrAt(lat, noon, guess, f) { let tm = +guess; for (let i = 0; i < 3; i++) { const d = decl(tm), a = Math.atan(1 / (f + Math.tan(Math.abs(lat * RAD - d)))), c = (Math.sin(a) - Math.sin(lat * RAD) * Math.sin(d)) / (Math.cos(lat * RAD) * Math.cos(d)); if (c < -1 || c > 1) return +guess; tm = +noon + Math.acos(c) / RAD / 15 * 36e5; } return tm; }
export function prayerTimes(lat, lng, y, m, d, cfg) {
  const t = cfg.tune || {}, tn = k => +t[k] || 0, hanafi = !!cfg.hanafi;
  const pr = params(cfg.method || 4, y, m, d, hanafi);
  pr.rounding = Rounding.None;
  const pt = new PrayerTimes(new Coordinates(+lat, +lng), new Date(y, m - 1, d), pr);
  const MN = 60000, add = (x, mins) => Math.round(+x / MN) * MN + mins * MN;
  const asr = asrAt(+lat, pt.dhuhr, pt.asr, hanafi ? 2 : 1);
  return { Fajr: add(pt.fajr, tn('Fajr')), Sunrise: add(pt.sunrise, 0), Dhuhr: add(pt.dhuhr, tn('Dhuhr')), Asr: add(asr, tn('Asr')), Maghrib: add(pt.maghrib, tn('Maghrib')), Isha: add(pt.isha, tn('Isha')) };
}

/* ---------------- the events of one local day ---------------- */
export function dayEvents(sub, cfg, y, m, d) {
  const out = [], tz = sub.tz, w = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay(), key = ymd(y, m, d);
  const at = (hm, yy = y, mm = m, dd = d) => { const [h, mi] = String(hm || '00:00').split(':').map(Number); return zoned(yy, mm, dd, h || 0, mi || 0, tz); };
  const pr = cfg.pr || {}, ad = cfg.adhkar || {}, f = cfg.fast || {};
  let pt = null;
  const needPT = PK.some(k => pr[k]) || ad.am || ad.pm;
  if (needPT && sub.lat != null && sub.lng != null) pt = prayerTimes(sub.lat, sub.lng, y, m, d, cfg);
  if (pt) {
    for (const k of PK) if (pr[k]) out.push({ ev: 'p' + k, day: key, at: pt[k], t: 'حان وقت صلاة ' + PN[k], b: (sub.city ? sub.city + ' · ' : '') + hm12(pt[k], tz), u: './#salah', tag: 'p' + k + key });
    if (ad.am) out.push({ ev: 'am', day: key, at: pt.Fajr + 20 * 60e3, t: 'أذكار الصباح', b: 'حصّن يومك بأذكار الصباح', u: './#adhkar/morning', tag: 'am' + key });
    if (ad.pm) out.push({ ev: 'pm', day: key, at: pt.Asr + 20 * 60e3, t: 'أذكار المساء', b: 'لا تنسَ أذكار المساء', u: './#adhkar/evening', tag: 'pm' + key });
  }
  if (f.mt || f.white) {
    const tm = addDays(y, m, d, 1), fi = fastInfo(tm.y, tm.m, tm.d, f);
    if (fi.r.length) out.push({ ev: 'fz', day: key, at: at(f.time || '21:00'), t: 'تذكير بالصيام', b: 'غدًا ' + WD[tm.w] + '، تذكير بصيام التطوع' + (fi.r.includes('white') ? ' (من الأيام البيض)' : ''), u: './#sawm', tag: 'fz' + ymd(tm.y, tm.m, tm.d) });
    if (f.suhoor) { const ti = fastInfo(y, m, d, f); if (ti.r.length) out.push({ ev: 'fs', day: key, at: at(f.stime || '03:30'), t: 'السحور', b: 'اليوم ' + WD[w] + '، وقت السحور لمن نوى الصيام', u: './#sawm', tag: 'fs' + key }); }
  }
  if (cfg.kahf && w === 5) out.push({ ev: 'kf', day: key, at: at('09:00'), t: 'جمعة مباركة: سورة الكهف', b: 'اقرأ أو استمع لسورة الكهف', u: './#friday', tag: 'kf' + key });
  if (cfg.sad && cfg.sad.on && w === +cfg.sad.day) out.push({ ev: 'sd', day: key, at: at(cfg.sad.time || '10:00'), t: 'صندوق الصدقة', b: 'تذكيرك الأسبوعي بالصدقة ولو بالقليل', u: './#sadaqa', tag: 'sd' + key });
  try { out.push(...zfEvents(cfg, y, m, d, at, key)); } catch (e) {} // v4.4 occasions + دقيقة زاد
  try { out.push(...adkEvents(cfg, y, m, d, key, at, i => { if (sub.lat == null || sub.lng == null) return null; const dd = i ? addDays(y, m, d, i) : { y, m, d }; return prayerTimes(sub.lat, sub.lng, dd.y, dd.m, dd.d, cfg); })); } catch (e) {} // v5.1 adhkar reminders
  return out;
}
function hm12(ts, tz) { const p = parts(ts, tz); const h = p.h % 12 || 12; const ar = s => String(s).replace(/\d/g, x => '٠١٢٣٤٥٦٧٨٩'[x]); return ar(h + ':' + pad(p.mi)) + (p.h < 12 ? ' ص' : ' م'); }
export function nextEvent(sub, cfg, after) {
  const p = parts(after, sub.tz);
  let best = null;
  for (let i = -1; i <= 8 && !(best && i > 2); i++) {
    const dd = addDays(p.y, p.m, p.d, i);
    for (const e of dayEvents(sub, cfg, dd.y, dd.m, dd.d)) if (e.at > after && (!best || e.at < best.at)) best = e;
  }
  return best;
}

/* ---------------- input cleaning: only what reminders need, no names ---------------- */
function cleanCfg(c) {
  c = c || {};
  const hm = (x, d) => /^\d{1,2}:\d{2}$/.test(String(x || '')) ? String(x) : d;
  const pr = {}; PK.forEach(k => pr[k] = !!(c.pr && c.pr[k]));
  const tune = {}; PK.forEach(k => { const v = Math.round(+((c.tune || {})[k]) || 0); if (v) tune[k] = Math.max(-60, Math.min(60, v)); });
  const f = c.fast || {};
  return {
    method: [1, 2, 3, 4, 5, 8, 9, 10, 16].includes(+c.method) ? +c.method : 4, hanafi: !!c.hanafi,
    tune, pr,
    adhkar: { am: !!(c.adhkar && c.adhkar.am), pm: !!(c.adhkar && c.adhkar.pm) },
    fast: { mt: !!f.mt, white: !!f.white, time: hm(f.time, '21:00'), suhoor: !!f.suhoor, stime: hm(f.stime, '03:30'), adj: Math.max(-2, Math.min(2, Math.round(+f.adj || 0))) },
    kahf: !!c.kahf,
    sad: c.sad && c.sad.on ? { on: true, day: Math.max(0, Math.min(6, +c.sad.day || 0)), time: hm(c.sad.time, '10:00') } : { on: false },
    ...zfCleanCfg(c), // v4.4
    ...adkCleanCfg(c) // v5.1
  };
}
function cleanSub(s) {
  if (!s || typeof s.endpoint !== 'string' || !/^https:\/\//.test(s.endpoint) || s.endpoint.length > 1000) throw new Error('bad subscription');
  const k = s.keys || {};
  if (!k.p256dh || !k.auth || unb64u(k.p256dh).length !== 65 || unb64u(k.auth).length < 16) throw new Error('bad keys');
  const host = new URL(s.endpoint).hostname;
  if (!/(^|\.)(googleapis\.com|google\.com|push\.apple\.com|mozilla\.com|mozaws\.net|notify\.windows\.com|push\.services\.mozilla\.com)$/.test(host) && !/^127\.|localhost/.test(host)) throw new Error('push service not allowed');
  return { endpoint: s.endpoint, p256dh: k.p256dh, auth: k.auth };
}
const round2 = x => Math.round(+x * 100) / 100;

/* ---------------- API ---------------- */
async function tokenOk(u, req) {
  const t = u.searchParams.get('k') || (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') || req.headers.get('x-tick-token') || '';
  return !!t && (await sha256hex(t)) === TICK_HASH;
}
async function api(u, req, env, ctx) {
  const db = env.DB; if (!db) return J({ ok: false, error: 'no database' }, 500);
  const path = u.pathname.slice('/api/push/'.length);
  // v5.2: the cron tick answers at once (token check needs no D1); the work runs after the response in waitUntil,
  // so a slow D1 moment can no longer time out cron-job.org's 30 s request. Claim/dedup/grace inside tick() are unchanged.
  if (path === 'tick' && ctx && ctx.waitUntil) {
    if (!(await tokenOk(u, req))) return J({ ok: false, error: 'forbidden' }, 403);
    ctx.waitUntil(tickBg(env, db, Date.now()));
    return J({ ok: true, queued: true });
  }
  await schema(db);
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const now = Date.now();
  if (path === 'key') { const v = await vapid(db); return J({ ok: true, key: v.pub }); }
  if (path === 'subscribe' || path === 'update') {
    const s = cleanSub(body.sub);
    const id = (await sha256hex(s.endpoint)).slice(0, 32);
    const cfg = cleanCfg(body.cfg);
    const tz = validTz(body.tz) ? body.tz : 'Asia/Riyadh';
    // a preset city's public centre is kept as is (so times match the app to the minute); a GPS position is rounded to ~1 km
    const rnd = body.preset ? (x => Math.round(+x * 1e4) / 1e4) : round2;
    const lat = body.lat != null && isFinite(+body.lat) ? rnd(body.lat) : null;
    const lng = body.lng != null && isFinite(+body.lng) ? rnd(body.lng) : null;
    const city = String(body.city || '').slice(0, 40);
    const row = { tz, lat, lng, city };
    const nx = nextEvent(row, cfg, now);
    await db.prepare(`INSERT INTO push_subs (id,endpoint,p256dh,auth,lat,lng,city,tz,cfg,next_at,next_ev,claim_at,created,updated,fails) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,?,0)
      ON CONFLICT(id) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, lat=excluded.lat, lng=excluded.lng, city=excluded.city, tz=excluded.tz, cfg=excluded.cfg, next_at=excluded.next_at, next_ev=excluded.next_ev, claim_at=0, updated=excluded.updated, fails=0`)
      .bind(id, s.endpoint, s.p256dh, s.auth, lat, lng, city, tz, JSON.stringify(cfg), nx ? nx.at : null, nx ? JSON.stringify(nx) : null, now, now).run();
    if (path === 'subscribe') await bump(db, 'subscribes');
    return J({ ok: true, next: nx ? { ev: nx.ev, at: nx.at, t: nx.t, b: nx.b } : null });
  }
  if (path === 'unsubscribe') {
    const ep = String(body.endpoint || (body.sub && body.sub.endpoint) || '');
    const id = (await sha256hex(ep)).slice(0, 32);
    const r = await db.prepare('DELETE FROM push_subs WHERE id=? AND endpoint=?').bind(id, ep).run();
    return J({ ok: true, removed: r.meta.changes || 0 });
  }
  if (path === 'test') {
    const ep = String(body.endpoint || (body.sub && body.sub.endpoint) || '');
    const id = (await sha256hex(ep)).slice(0, 32);
    const row = await db.prepare('SELECT * FROM push_subs WHERE id=? AND endpoint=?').bind(id, ep).first();
    if (!row) return J({ ok: false, error: 'not subscribed' }, 404);
    if (now - (row.last_test || 0) < 30e3) return J({ ok: false, error: 'wait' }, 429);
    await db.prepare('UPDATE push_subs SET last_test=? WHERE id=?').bind(now, id).run();
    const r = await sendPush(db, row, { t: 'تنبيهات زاد تعمل ✓', b: 'هذا تنبيه تجريبي، وبإذن الله يصلك الأذان والتذكير في وقته حتى عند إغلاق التطبيق', u: './#push', tag: 'ztest' }, 600, 'high');
    if (isGone(r)) await db.prepare('DELETE FROM push_subs WHERE id=?').bind(id).run();
    return J({ ok: r.status >= 200 && r.status < 300, status: r.status, error: r.text || undefined });
  }
  if (path === 'kick') {
    const last = +(await meta(db, 'last_tick') || 0);
    if (now - last > 150e3) { await setMeta(db, 'last_tick', now); ctx.waitUntil(tick(db, Date.now(), 'kick').catch(() => {}).then(() => budTick(env, Date.now(), SOC_DEPS, false)).catch(() => {})); return J({ ok: true, ran: true }); }
    return J({ ok: true, ran: false });
  }
  if (!(await tokenOk(u, req))) return J({ ok: false, error: 'forbidden' }, 403);
  // ---- token-protected below ----
  if (path === 'tick') { // fallback only (no ctx): the old synchronous path
    const r = await tick(db, now, 'cron');
    // v4.2: at most once an hour, delete clips 7 days after approval (+ stale pending/rejected); never lets a failure touch push
    try { const v = await vidPurge(env, Date.now()); if (v && v.purged != null) r.vid = v.purged; } catch (e) { r.vid_err = 1; }
    try { const f = await budTick(env, Date.now(), SOC_DEPS, false); if (f.checked) r.fb = { checked: f.checked, sent: f.sent, nosub: f.nosub }; } catch (e) { r.fb_err = String(e && e.message || e).slice(0, 80); } // v4.6 أيقظني للفجر
    return J(r);
  }
  if (path === 'vidguard') return J(await vidRetentionDry(env, Date.now())); // v5.4.1: retention dry run (counts only, nothing deleted)
  if (path === 'status') {
    const n = await db.prepare('SELECT COUNT(*) c, SUM(CASE WHEN next_at<=? THEN 1 ELSE 0 END) due FROM push_subs').bind(now).first();
    const m = await db.prepare("SELECT k,v FROM push_meta WHERE k!='vapid'").all();
    const o = {}; (m.results || []).forEach(r => o[r.k] = r.v);
    return J({ ok: true, now, subs: n.c, due_now: n.due || 0, meta: o });
  }
  if (path === 'preview') {
    const cfg = cleanCfg(body.cfg); const row = { tz: validTz(body.tz) ? body.tz : 'Asia/Riyadh', lat: +body.lat, lng: +body.lng, city: body.city || '' };
    const [y, m, d] = String(body.date || '').split('-').map(Number);
    const ev = dayEvents(row, cfg, y, m, d).map(e => ({ ev: e.ev, at: e.at, local: fmtLocal(e.at, row.tz), t: e.t, b: e.b }));
    const pt = prayerTimes(row.lat, row.lng, y, m, d, cfg); const ptl = {}; Object.keys(pt).forEach(k => ptl[k] = fmtLocal(pt[k], row.tz));
    return J({ ok: true, times: ptl, events: ev, next: nextEvent(row, cfg, body.after ? +body.after : now) });
  }
  if (path === 'peek') {
    const r = await db.prepare('SELECT id, substr(endpoint,1,40) ep, lat,lng,city,tz,next_at,next_ev,claim_at,fails,last_ok FROM push_subs ORDER BY next_at LIMIT 50').all();
    return J({ ok: true, rows: r.results });
  }
  if (path === 'force') { // test helper: make a sub due now (event kept)
    const id = String(body.id || ''); const at = +body.at || now;
    if (body.all) await db.prepare('UPDATE push_subs SET next_at=?, claim_at=0').bind(at).run();
    else await db.prepare('UPDATE push_subs SET next_at=?, claim_at=0 WHERE id=?').bind(at, id).run();
    return J({ ok: true });
  }
  return J({ ok: false, error: 'not found' }, 404);
}
function fmtLocal(ts, tz) { const p = parts(ts, tz); return ymd(p.y, p.m, p.d) + ' ' + pad(p.h) + ':' + pad(p.mi); }

/* ---------------- the tick ---------------- */
// v5.2 background cron tick (runs inside ctx.waitUntil, ~30 s allowed after the response).
// schema() is once per isolate (module flag). vidPurge runs at most once an hour (module clock + its own D1 'last_purge' key).
// budTick (أيقظني للفجر) stays every minute: it is due at Fajr + N min, so an hourly run would wake the partner up to an hour late.
let lastPurgeTry = 0;
async function tickBg(env, db, now) {
  const t0 = Date.now(); let r = {};
  try { await schema(db); r = await tick(db, now, 'cron'); } catch (e) { r = { ok: false, err: String(e && e.message || e).slice(0, 120) }; }
  if (Date.now() - t0 < 24e3) {
    try { const f = await budTick(env, Date.now(), SOC_DEPS, false); if (f.checked) r.fb = f.checked + '/' + f.sent; } catch (e) { r.fb_err = 1; }
  }
  if (Date.now() - lastPurgeTry > 3600e3 && Date.now() - t0 < 22e3) {
    lastPurgeTry = Date.now();
    try { const v = await vidPurge(env, Date.now(), false, { budgetMs: Math.max(1500, 27e3 - (Date.now() - t0)) }); if (v && v.purged != null) r.vid = v.purged + (v.cap ? '+c' + v.cap : '') + (v.guard ? '+g' + v.guard : ''); } catch (e) { r.vid_err = 1; } // v5.4.1: + per-account cap + storage guard, time-boxed
  }
  if (Date.now() - t0 < 20e3) { try { const n = await zbcTick(env, t0 + 25e3); if (n) r.bc = n; } catch (e) { r.bc_err = 1; } } // v5.4.5: continue queued dashboard broadcasts
  try { await setMeta(db, 'last_tick_bg', JSON.stringify({ at: now, ms: Date.now() - t0, sent: r.sent || 0, claimed: r.claimed || 0, ok: r.ok !== false, err: r.err || undefined, fb: r.fb, vid: r.vid, bc: r.bc })); } catch (e) {}
}
async function tick(db, now, src) {
  const t0 = Date.now(), stats = { ok: true, src, sent: 0, skipped: 0, gone: 0, failed: 0, dup: 0, batches: 0, claimed: 0 };
  await setMeta(db, 'last_tick', now);
  await bump(db, 'ticks');
  for (let b = 0; b < MAX_BATCHES && Date.now() - t0 < TICK_BUDGET_MS; b++) {
    const nowB = Date.now();
    const res = await db.prepare(`UPDATE push_subs SET claim_at=?1 WHERE id IN (SELECT id FROM push_subs WHERE next_at IS NOT NULL AND next_at<=?1 AND claim_at<?2 ORDER BY next_at LIMIT ?3) RETURNING *`)
      .bind(nowB, nowB - 120e3, CAP_PER_TICK).all();
    const rows = res.results || [];
    stats.batches++; stats.claimed += rows.length;
    if (!rows.length) break;
    const upd = [];
    await pool(rows, 8, async row => {
      let ev = null; try { ev = JSON.parse(row.next_ev || 'null'); } catch (e) {}
      const cfg = JSON.parse(row.cfg || '{}');
      let release = true;
      if (ev && nowB - row.next_at <= (GRACE[ev.ev[0] === 'p' ? 'p' : ev.ev] || 15 * 60e3)) {
        const key = row.id + '|' + ev.ev + '|' + ev.day;
        const ins = await db.prepare('INSERT OR IGNORE INTO push_sent(k,at) VALUES(?,?)').bind(key, nowB).run();
        if (!ins.meta.changes) stats.dup++;
        else {
          let r;
          try { r = await sendPush(db, row, { t: ev.t, b: ev.b, u: ev.u, tag: ev.tag }, TTL[ev.ev[0] === 'p' ? 'p' : ev.ev] || 3600, (ev.ev[0] === 'p' || ev.ev === 'fs') ? 'high' : 'normal'); }
          catch (e) { r = { status: 0, text: String(e) }; }
          if (isGone(r)) { stats.gone++; upd.push(db.prepare('DELETE FROM push_subs WHERE id=?').bind(row.id)); return; }
          if (r.status >= 200 && r.status < 300) { stats.sent++; upd.push(db.prepare('UPDATE push_subs SET last_ok=?, fails=0 WHERE id=?').bind(nowB, row.id)); }
          else {
            stats.failed++; stats.last_error = r.status + ' ' + (r.text || '').slice(0, 120);
            // transient (429/5xx/network): forget the sent mark and retry on the next tick while inside the grace window
            upd.push(db.prepare('DELETE FROM push_sent WHERE k=?').bind(key));
            if ((row.fails || 0) < 20) { upd.push(db.prepare('UPDATE push_subs SET fails=fails+1, claim_at=0 WHERE id=?').bind(row.id)); release = false; }
            else { upd.push(db.prepare('DELETE FROM push_subs WHERE id=?').bind(row.id)); return; }
          }
        }
      } else stats.skipped++;
      if (!release) return;
      const nx = nextEvent(row, cfg, Math.max(ev && ev.at || 0, row.next_at || 0, nowB - 1));
      upd.push(db.prepare('UPDATE push_subs SET next_at=?, next_ev=?, claim_at=0 WHERE id=?').bind(nx ? nx.at : null, nx ? JSON.stringify(nx) : null, row.id));
    });
    if (upd.length) await db.batch(upd);
    if (rows.length < CAP_PER_TICK) break;
  }
  if (stats.sent) await bump(db, 'sent', stats.sent);
  if (stats.gone) await bump(db, 'gone', stats.gone);
  if (Math.random() < 0.02) await db.prepare('DELETE FROM push_sent WHERE at<?').bind(now - 3 * 864e5).run();
  stats.ms = Date.now() - t0;
  return stats;
}
async function pool(items, n, fn) { let i = 0; const run = async () => { while (i < items.length) { const it = items[i++]; await fn(it); } }; await Promise.all(Array.from({ length: Math.min(n, items.length) }, run)); }

// v4.6: what the shared-features module borrows from this file (the push sender, the same prayer-time port, the tick token check) and from videos.js (admin session, word filter)
ZBC.deps = { sendPush: (...a) => sendPush(...a), isGone: r => isGone(r) };
const SOC_DEPS = { sendPush: (...a) => sendPush(...a), prayerTimes: (...a) => prayerTimes(...a), cleanCfg: c => cleanCfg(c), tokenOk: (u, r) => tokenOk(u, r), adminOk, badWord };


// v5.4.3: zad.sites.tab.bot is a thin proxy Worker (site "zad") that forwards every request here, so both
// addresses share this Worker's D1/R2. It signs requests with x-zad-key and passes the visitor's IP (x-zad-ip)
// and Cloudflare geo (x-zad-geo); here they replace the proxy's own IP (rate limits) and answer /api/geo.
const ZAD_PROXY_KEY = '7d0f8ed215a6b0eeb030fde1a5b9f940';
const zn = v => (v == null || v === '' || !isFinite(+v)) ? null : +v;
export default {
  ...ZAD_MAIN,
  async fetch(req, env, ctx) {
    let viaZad = false;
    try {
      if (req.headers.get('x-zad-key') === ZAD_PROXY_KEY) {
        viaZad = true;
        const h = new Headers(req.headers), ip = h.get('x-zad-ip'); h.delete('x-zad-key');
        if (ip) h.set('cf-connecting-ip', ip);
        if (new URL(req.url).pathname === '/api/geo') {
          let g = {}; try { g = JSON.parse(decodeURIComponent(h.get('x-zad-geo') || '{}')) || {}; } catch {}
          return new Response(JSON.stringify({ ok: true, city: g.city || '', country: g.country || '', region: g.region || '', latitude: zn(g.latitude), longitude: zn(g.longitude), timezone: g.timezone || '' }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
        }
        req = new Request(req, { headers: h });
      }
    } catch {}
    // v5.4.4: private dashboard + anonymous usage ping (srv/zdash.js)
    let path = '';
    try { path = new URL(req.url).pathname; if (path === '/api/zp' || path.startsWith('/api/zdash') || path.startsWith('/admin/')) { const r = await zdash(req, env, ctx, viaZad); if (r) return r; } } catch {}
    let res;
    try { res = await ZAD_MAIN.fetch(req, env, ctx); }
    catch (e) { if (ctx && ctx.waitUntil) ctx.waitUntil(zaBump(env, 'e5xx')); throw e; }
    try {
      if (res && ctx && ctx.waitUntil) {
        if (res.status >= 500 && path.startsWith('/api/')) ctx.waitUntil(zaBump(env, 'e5xx'));
        else if (path === '/api/dorar' && res.status === 200) ctx.waitUntil(zaBump(env, 'dorar'));
      }
    } catch {}
    return res;
  }
};
