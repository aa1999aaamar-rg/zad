// v5.3 «تحقق من حديث»: server-side lookup in the Dorar hadith encyclopedia (dorar.net).
// Primary: the public JSON API https://dorar.net/dorar_api.json?skey=<q> ({ahadith:{result:"<html>"}}).
// Fallback: the public search page https://dorar.net/hadith/search?q=<q> (HTML). Nothing is stored except a 7-day cache of the
// parsed JSON per normalised query (D1 table zc_dorar, additive) + the edge Cache API. Grades are copied verbatim from Dorar.
// Rate limit: 20 lookups per IP per 10 minutes (reuses sc_rate, key 'dorar:<ip>').
const TTL = 7 * 864e5;
const UA = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Mobile Safari/537.36 Zad-app/5.3 (+https://amar-muslim.sites.tab.bot/)';
const JH = { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*', 'cache-control': 'no-store' };
const Jd = (o, s = 200, extra) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({}, JH, extra || {}) });
export const dorarNorm = s => String(s || '').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[^\u0621-\u064A0-9a-zA-Z ]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
const ent = s => s.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const txt = s => ent(String(s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
export function parseApi(html) {
  const out = [];
  const parts = String(html || '').split(/<div class="hadith"[^>]*>/).slice(1);
  for (const p of parts) {
    const end = p.indexOf('</div>'); if (end < 0) continue;
    let t = txt(p.slice(0, end)).replace(/^\d+\s*-\s*/, '').replace(/\s*\.\s*$/, '').replace(/\s+([.،,:])/g, '$1').trim();
    const info = p.slice(end);
    const f = k => { const m = info.match(new RegExp('<span class="info-subtitle">\\s*' + k + '\\s*:?\\s*</span>([\\s\\S]*?)(?=<span class="info-subtitle">|</div>)')); return m ? txt(m[1]) : ''; };
    const g = f('خلاصة حكم المحدث');
    if (!t) continue;
    out.push({ t, rawi: f('الراوي'), mhd: f('المحدث'), src: f('المصدر'), num: f('الصفحة أو الرقم'), g });
  }
  return out;
}
export function parseSearch(html) {
  const out = []; const s = String(html || '');
  const a = s.indexOf('id="home"'); const b = s.indexOf('id="specialist"', a + 1);
  const body = a >= 0 ? s.slice(a, b > a ? b : undefined) : s;
  const blocks = body.split(/<article[^>]*>/).slice(1);
  for (const bl of blocks) {
    const h5 = bl.match(/<h5[^>]*>([\s\S]*?)<\/h5>/); if (!h5) continue;
    const t = txt(h5[1]).replace(/^\d+\s*-\s*/, '').trim();
    const f = k => { const m = bl.match(new RegExp(k + '\\s*:\\s*([\\s\\S]*?)</strong>')); return m ? txt(m[1]) : ''; };
    const link = (bl.match(/href="(\/h\/[A-Za-z0-9]+)(?:\?[^"]*)?"/) || [])[1];
    out.push({ t, rawi: f('الراوي'), mhd: f('\\|\\s*المحدث'), src: f('\\|\\s*المصدر'), num: f('الصفحة أو الرقم'), g: f('خلاصة حكم المحدث'), u: link ? 'https://dorar.net' + link : '' });
  }
  return out;
}
async function rate(db, k, lim, win) {
  const now = Date.now();
  await db.prepare('CREATE TABLE IF NOT EXISTS sc_rate (k TEXT PRIMARY KEY, n INTEGER, reset INTEGER)').run();
  const r = await db.prepare('INSERT INTO sc_rate(k,n,reset) VALUES(?1,1,?2) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN reset>?3 THEN n+1 ELSE 1 END, reset=CASE WHEN reset>?3 THEN reset ELSE ?2 END RETURNING n').bind(k, now + win, now).first();
  return (r && r.n || 0) <= lim;
}
async function up(url, ms, ua) {
  const c = new AbortController(); const tm = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { signal: c.signal, headers: { 'user-agent': ua || UA, 'accept-language': 'ar,en;q=0.8', 'accept': url.includes('.json') ? 'application/json,text/plain,*/*' : 'text/html,*/*', 'referer': 'https://dorar.net/' } }); }
  finally { clearTimeout(tm); }
}
export async function dorarApi(u, req, env, ctx) {
  const raw = u.searchParams.get('q') || '';
  const q = dorarNorm(raw);
  const more = 'https://dorar.net/hadith/search?q=' + encodeURIComponent(q);
  if (q.replace(/\s/g, '').length < 3) return Jd({ ok: false, error: 'short', more }, 400);
  const db = env.DB; const t0 = Date.now();
  const key = 'q2:' + q;
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const ck = new Request('https://amar-muslim.sites.tab.bot/__dorar2/' + encodeURIComponent(q));
  if (cache) { try { const hit = await cache.match(ck); if (hit) { const j = await hit.json(); j.cache = 'edge'; j.ms = Date.now() - t0; return Jd(j); } } catch (e) {} }
  if (db) {
    try {
      await db.prepare('CREATE TABLE IF NOT EXISTS zc_dorar (k TEXT PRIMARY KEY, v TEXT, t INTEGER)').run();
      const row = await db.prepare('SELECT v, t FROM zc_dorar WHERE k=?').bind(key).first();
      if (row && Date.now() - row.t < TTL) { const j = JSON.parse(row.v); j.cache = 'd1'; j.ms = Date.now() - t0; return Jd(j); }
    } catch (e) {}
    try { const ip = req.headers.get('cf-connecting-ip') || '0'; if (!(await rate(db, 'dorar:' + ip, 20, 600e3))) return Jd({ ok: false, error: 'rate', more }, 429); } catch (e) {}
  }
  let items = null, via = '', err = [];
  const UA2 = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
  const tries = [['search', UA], ['api', UA], ['search', UA2], ['api', UA2]]; // the search page first: Dorar's «لغير المتخصص» ordering + a link to each hadith (/h/<id>)
  for (const [kind, ua] of tries) {
    if (Date.now() - t0 > 16000) break;
    const url = kind === 'api' ? 'https://dorar.net/dorar_api.json?skey=' + encodeURIComponent(q) : more;
    try {
      const r = await up(url, 8000, ua);
      if (!r.ok) { err.push(kind + ' ' + r.status); continue; }
      if (kind === 'api') { const j = await r.json(); const s = parseApi(j && j.ahadith && j.ahadith.result || ''); items = s; via = 'api'; if (s.length) break; }
      else { const s = parseSearch(await r.text()); if (s.length || !items) { items = s; via = 'search'; } if (s.length) break; }
    } catch (e) { err.push(kind + ' ' + String(e && e.message || e).slice(0, 60)); }
  }
  if (!items) return Jd({ ok: false, error: 'upstream', detail: err.join('; '), more, ms: Date.now() - t0 }, 502);
  const res = { ok: true, q, via, tries: err.length + 1, n: items.length, items: items.slice(0, 20), more, at: Date.now() };
  const body = JSON.stringify(res);
  const save = async () => {
    try { if (db) await db.prepare('INSERT OR REPLACE INTO zc_dorar (k, v, t) VALUES (?, ?, ?)').bind(key, body, Date.now()).run(); } catch (e) {}
    try { if (cache) await cache.put(ck, new Response(body, { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=604800' } })); } catch (e) {}
    try { if (db && Math.random() < 0.02) await db.prepare('DELETE FROM zc_dorar WHERE t<?').bind(Date.now() - 2 * TTL).run(); } catch (e) {}
  };
  if (ctx && ctx.waitUntil) ctx.waitUntil(save()); else await save();
  res.cache = 'miss'; res.ms = Date.now() - t0;
  return Jd(res);
}
